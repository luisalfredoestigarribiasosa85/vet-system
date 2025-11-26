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

// @desc    Generar PDF de receta médica
// @route   GET /api/medical/records/:id/prescription-pdf
// @access  Private
exports.generatePrescriptionPDF = async (req, res) => {
    try {
        const record = await MedicalRecord.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name']
                },
                {
                    model: Pet,
                    as: 'pet',
                    attributes: ['id', 'name', 'species', 'breed', 'age'],
                    include: [{
                        model: require('../models/Client'),
                        as: 'owner',
                        attributes: ['name']
                    }]
                }
            ]
        });

        if (!record) {
            return res.status(404).json({ message: 'Registro médico no encontrado' });
        }

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receta-${record.pet.name}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('RECETA MÉDICA', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text('Clínica Veterinaria', { align: 'center' });
        doc.moveDown(2);

        // Información del paciente
        doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL PACIENTE');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Mascota: ${record.pet.name}`);
        doc.text(`Especie: ${record.pet.species}`);
        doc.text(`Raza: ${record.pet.breed}`);
        doc.text(`Propietario: ${record.pet.owner?.name || 'N/A'}`);
        doc.text(`Peso: ${record.weight || 'N/A'} kg`);
        doc.moveDown();

        // Diagnóstico
        doc.fontSize(12).font('Helvetica-Bold').text('DIAGNÓSTICO');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(record.diagnosis);
        doc.moveDown();

        // Tratamiento
        doc.fontSize(12).font('Helvetica-Bold').text('PRESCRIPCIÓN');
        doc.moveDown(0.5);
        doc.text(record.treatment || 'Ver indicaciones del veterinario');
        doc.moveDown(2);

        // Fecha y firma
        doc.text(`Fecha: ${new Date(record.createdAt).toLocaleDateString('es-PY')}`);
        doc.text(`Veterinario: ${record.veterinarian?.name || 'N/A'}`);

        doc.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al generar PDF de receta' });
        }
    }
};

// @desc    Obtener estadísticas del dashboard médico
// @route   GET /api/medical/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const Client = require('../models/Client');

        // 1. Total de registros médicos
        const totalRecords = await MedicalRecord.count();

        // 2. Registros de este mes
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const recordsThisMonth = await MedicalRecord.count({
            where: {
                createdAt: {
                    [Op.gte]: startOfMonth
                }
            }
        });

        // 3. Diagnósticos más comunes (top 5)
        const diagnosisRecords = await MedicalRecord.findAll({
            attributes: ['diagnosis'],
            raw: true
        });

        const diagnosisCount = {};
        diagnosisRecords.forEach(record => {
            const diagnosis = record.diagnosis.trim();
            diagnosisCount[diagnosis] = (diagnosisCount[diagnosis] || 0) + 1;
        });

        const commonDiagnoses = Object.entries(diagnosisCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 4. Tendencias mensuales (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRecords = await MedicalRecord.findAll({
            where: {
                createdAt: {
                    [Op.gte]: sixMonthsAgo
                }
            },
            attributes: ['createdAt'],
            raw: true
        });

        const monthlyCount = {};
        monthlyRecords.forEach(record => {
            const date = new Date(record.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
        });

        const monthlyTrends = Object.entries(monthlyCount)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // 5. Registros recientes (últimos 10)
        const recentRecords = await MedicalRecord.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name']
                },
                {
                    model: Pet,
                    as: 'pet',
                    attributes: ['id', 'name', 'species'],
                    include: [{
                        model: Client,
                        as: 'owner',
                        attributes: ['name']
                    }]
                }
            ]
        });

        // 6. Distribución por especies
        const speciesRecords = await MedicalRecord.findAll({
            include: [{
                model: Pet,
                as: 'pet',
                attributes: ['species']
            }],
            raw: true
        });

        const speciesCount = {};
        speciesRecords.forEach(record => {
            const species = record['pet.species'];
            if (species) {
                speciesCount[species] = (speciesCount[species] || 0) + 1;
            }
        });

        const recordsBySpecies = Object.entries(speciesCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        res.json({
            totalRecords,
            recordsThisMonth,
            commonDiagnoses,
            monthlyTrends,
            recentRecords,
            recordsBySpecies
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
    }
};