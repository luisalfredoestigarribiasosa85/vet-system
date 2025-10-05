const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');
const Client = require('../models/Client');
const User = require('../models/User');

// GET todos los registros médicos
router.get('/', protect, async (req, res) => {
  try {
    const { petId } = req.query;
    const where = {};
    
    if (petId) where.petId = petId;
    
    const records = await MedicalRecord.findAll({
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
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC']]
    });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST crear registro médico
router.post('/', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT actualizar registro médico
router.put('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    
    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
