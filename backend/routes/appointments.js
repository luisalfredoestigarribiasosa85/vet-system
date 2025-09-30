const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const Client = require('../models/Client');
const User = require('../models/User');

// GET todas las citas
router.get('/', protect, async (req, res) => {
  try {
    const { date, status } = req.query;
    const where = {};
    
    if (date) where.date = date;
    if (status) where.status = status;
    
    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: Pet,
          as: 'pet',
          include: [{
            model: Client,
            as: 'owner',
            attributes: ['id', 'name', 'phone']
          }]
        },
        {
          model: User,
          as: 'veterinarian',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST crear cita
router.post('/', protect, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT actualizar cita
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    
    await appointment.update(req.body);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE cita
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    
    await appointment.destroy();
    res.json({ message: 'Cita eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;