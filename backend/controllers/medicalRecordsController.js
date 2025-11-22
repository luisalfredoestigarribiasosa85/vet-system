const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Obtener registros médicos de una mascota
// @route   GET /api/medical/pets/:petId/records
// @access  Private
exports.getPetRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.findAll({
            where: { petId: req.params.petId },
            include: [
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener registros médicos' });
    }
};

// @desc    Crear un nuevo registro médico
// @route   POST /api/medical/records
// @access  Private
exports.createRecord = async (req, res) => {
    try {
        // Verificar que req.user existe (autenticación)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const record = await MedicalRecord.create({
            ...req.body,
            vetId: req.user.id
        });
        res.status(201).json(record);
    } catch (error) {
        console.error('Error al crear registro médico:', error);
        res.status(500).json({
            message: 'Error al crear registro médico',
            error: error.message
        });
    }
};

// @desc    Subir imagen a un registro médico
// @route   POST /api/medical/records/:recordId/upload
// @access  Private
exports.uploadImage = async (req, res) => {
    try {
        const record = await MedicalRecord.findByPk(req.params.recordId);

        if (!record) {
            // Eliminar archivo subido si el registro no existe
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ message: 'Registro médico no encontrado' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
        }

        // Crear objeto de attachment
        const attachment = {
            id: Date.now().toString(),
            name: req.file.originalname,
            url: `/uploads/medical-images/${req.file.filename}`,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf',
            uploadedAt: new Date().toISOString()
        };

        // Obtener attachments actuales o inicializar array vacío
        const currentAttachments = record.attachments || [];

        // Agregar nuevo attachment
        const updatedAttachments = [...currentAttachments, attachment];

        // Actualizar registro
        await record.update({ attachments: updatedAttachments });

        res.json({
            message: 'Imagen subida exitosamente',
            attachment,
            record
        });
    } catch (error) {
        console.error(error);
        // Eliminar archivo si hubo error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Error al subir imagen' });
    }
};

// @desc    Eliminar imagen de un registro médico
// @route   DELETE /api/medical/records/:recordId/attachments/:attachmentId
// @access  Private
exports.deleteAttachment = async (req, res) => {
    try {
        const record = await MedicalRecord.findByPk(req.params.recordId);

        if (!record) {
            return res.status(404).json({ message: 'Registro médico no encontrado' });
        }

        const attachments = record.attachments || [];
        const attachmentIndex = attachments.findIndex(a => a.id === req.params.attachmentId);

        if (attachmentIndex === -1) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }

        // Obtener ruta del archivo
        const attachment = attachments[attachmentIndex];
        const filePath = path.join(__dirname, '..', attachment.url);

        // Eliminar archivo físico si existe
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Eliminar del array
        const updatedAttachments = attachments.filter(a => a.id !== req.params.attachmentId);

        // Actualizar registro
        await record.update({ attachments: updatedAttachments });

        res.json({ message: 'Archivo eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar archivo' });
    }
};

// @desc    Obtener un registro médico por ID
// @route   GET /api/medical/records/:id
// @access  Private
exports.getRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Pet,
                    as: 'pet',
                    attributes: ['id', 'name', 'species', 'breed']
                }
            ]
        });

        if (!record) {
            return res.status(404).json({ message: 'Registro médico no encontrado' });
        }

        res.json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener registro médico' });
    }
};

module.exports = exports;
