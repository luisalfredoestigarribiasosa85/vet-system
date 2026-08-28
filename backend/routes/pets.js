const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireOrganization } = require('../middleware/multiTenantMiddleware');
const Pet = require('../models/Pet');
const Client = require('../models/Client');

const { parsePagination, paginateResponse } = require('../utils/pagination');

// Aislamiento multi-tenant: exige organización activa para todas las rutas de mascotas
router.use(protect, requireOrganization);

// GET todas las mascotas
router.get('/', protect, async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const baseOptions = {
      where: {
        ...(organizationId ? { organizationId } : {}),
        isActive: true
      },
      include: [{
        model: Client,
        as: 'owner',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['createdAt', 'DESC']]
    };

    // Paginación retrocompatible: sin ?page/?limit se mantiene el array plano completo
    const pagination = parsePagination(req);
    if (pagination) {
      const { rows, count } = await Pet.findAndCountAll({
        ...baseOptions,
        limit: pagination.limit,
        offset: pagination.offset
      });
      return res.json(paginateResponse(rows, count, pagination));
    }

    const pets = await Pet.findAll(baseOptions);
    res.json(pets);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// GET mascota por ID
router.get('/:id', protect, async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const pet = await Pet.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {})
      },
      include: [{
        model: Client,
        as: 'owner'
      }]
    });
    
    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    
    res.json(pet);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// POST crear mascota
router.post('/', protect, async (req, res) => {
  try {
    // El organizationId SIEMPRE se toma del token (no suplantable por el cliente)
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(403).json({
        message: 'Tu usuario no tiene una organización asignada',
        code: 'NO_ORGANIZATION'
      });
    }

    const pet = await Pet.create({ ...req.body, organizationId });
    res.status(201).json(pet);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// PUT actualizar mascota
router.put('/:id', protect, async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const pet = await Pet.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {})
      }
    });
    
    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    
    await pet.update(req.body);
    res.json(pet);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE mascota
router.delete('/:id', protect, async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const pet = await Pet.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {})
      }
    });
    
    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    
    await pet.update({ isActive: false });
    res.json({ message: 'Mascota eliminada correctamente' });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// POST add reminder to pet
router.post('/:id/reminders', protect, async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const pet = await Pet.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {})
      }
    });
    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }

    const { type, date } = req.body;
    if (!type || !date) {
      return res.status(400).json({ message: 'El tipo y la fecha del recordatorio son obligatorios' });
    }

    const newReminder = { type, date };

    // Sequelize doesn't automatically detect changes in JSONB arrays, so we need to manually update it.
    const updatedReminders = [...(pet.reminders || []), newReminder];
    pet.reminders = updatedReminders;
    pet.changed('reminders', true); // Mark the field as dirty

    await pet.save();

    res.status(201).json(pet);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;