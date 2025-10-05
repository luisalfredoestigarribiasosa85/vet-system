// backend/controllers/medicalRecordController.js
const { MedicalRecord, Pet, User, Client } = require('../models'); // Asegúrate de incluir Client
const { Op } = require('sequelize');

// Obtener historial médico de una mascota (AHORA SEGURO)
exports.getPetMedicalRecords = async (req, res) => {
  try {
    const { petId } = req.params;
    const loggedInUser = req.user; // Proporcionado por el middleware 'protect'

    // 1. Buscar la mascota y su dueño (Client)
    const pet = await Pet.findByPk(petId, {
      include: {
        model: Client,
        as: 'owner' // Usamos el alias definido en el modelo Pet
      }
    });

    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }

    // 2. Comprobar autorización
    const isOwner = pet.owner && pet.owner.userId === loggedInUser.id;
    const isStaff = loggedInUser.role === 'admin' || loggedInUser.role === 'veterinario';

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para ver este historial.' });
    }

    // 3. Si está autorizado, buscar y devolver los registros
    const records = await MedicalRecord.findAll({
      where: { petId },
      include: [
        { model: User, as: 'veterinarian', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(records);

  } catch (error) {
    console.error('Error al obtener historial médico:', error);
    res.status(500).json({ message: 'Error al obtener el historial médico' });
  }
};

// Crear nuevo registro médico
exports.createMedicalRecord = async (req, res) => {
  try {
    const { petId, vetId, diagnosis, treatment, weight, temperature, notes, vaccines, allergies, surgeries } = req.body;
    
    const record = await MedicalRecord.create({
      petId,
      vetId,
      diagnosis,
      treatment,
      weight,
      temperature,
      notes,
      vaccines: vaccines || [],
      allergies: allergies || [],
      surgeries: surgeries || []
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Error al crear registro médico:', error);
    res.status(500).json({ message: 'Error al crear el registro médico' });
  }
};

// Subir archivo adjunto
exports.uploadAttachment = async (req, res) => {
  try {
    const { recordId } = req.params;
    const file = req.file; // Usando multer para manejar la subida

    if (!file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const record = await MedicalRecord.findByPk(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    const attachment = {
      name: file.originalname,
      url: `/uploads/medical/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype === 'application/pdf' ? 'pdf' : 'other',
      uploadedAt: new Date()
    };

    await record.update({
      attachments: [...(record.attachments || []), attachment]
    });

    res.status(200).json(attachment);
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ message: 'Error al subir el archivo' });
  }
};