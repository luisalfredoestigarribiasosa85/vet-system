const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Inventory = require('../models/Inventory');

// GET inventario completo
router.get('/', protect, async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET alertas de inventario
router.get('/alerts', protect, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Productos con stock bajo
    const lowStock = await Inventory.findAll({
      where: {
        isActive: true,
        quantity: {
          [Op.lte]: sequelize.col('minStock')
        }
      }
    });
    
    // Productos próximos a vencer
    const expiring = await Inventory.findAll({
      where: {
        isActive: true,
        expiryDate: {
          [Op.between]: [today, thirtyDaysFromNow]
        }
      }
    });
    
    res.json({
      lowStock,
      expiring
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST crear producto
router.post('/', protect, authorize('admin', 'veterinario'), async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT actualizar producto
router.put('/:id', protect, authorize('admin', 'veterinario'), async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE producto
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await item.update({ isActive: false });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;