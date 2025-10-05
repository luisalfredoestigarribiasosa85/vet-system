const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Pet = require('../models/Pet');
const Client = require('../models/Client');

// GET todas las mascotas
router.get('/', protect, async (req, res) => {
  try {
    const pets = await Pet.findAll({
      where: { isActive: true },
      include: [{
        model: Client,
        as: 'owner',
        attributes: ['id', 'name', 'phone', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
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
    const pet = await Pet.findByPk(req.params.id, {
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
    const pet = await Pet.create(req.body);
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
    const pet = await Pet.findByPk(req.params.id);
    
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
    const pet = await Pet.findByPk(req.params.id);
    
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
    const pet = await Pet.findByPk(req.params.id);
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