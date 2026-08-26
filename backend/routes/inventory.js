const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireOrganization } = require('../middleware/multiTenantMiddleware');
const Inventory = require('../models/Inventory');
const { Op, col, where } = require('sequelize');

// Aislamiento multi-tenant: exige organización activa para todo el inventario
router.use(protect, requireOrganization);

// GET inventario completo
router.get('/', protect, async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const inventory = await Inventory.findAll({
      where: {
        ...(organizationId ? { organizationId } : {}),
        isActive: true
      },
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
    const organizationId = req.user?.organizationId ?? null;
    const tenantFilter = organizationId ? { organizationId } : {};
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD for DATEONLY
    // Productos con stock bajo
    const lowStock = await Inventory.findAll({
      where: {
        ...tenantFilter,
        isActive: true,
        [Op.and]: [
          where(col('quantity'), '<=', col('minStock'))
        ]
      }
    });
    
    // Productos próximos a vencer
    const expiring = await Inventory.findAll({
      where: {
        ...tenantFilter,
        isActive: true,
        expiryDate: {
          [Op.between]: [fmt(today), fmt(thirtyDaysFromNow)]
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
    // El organizationId SIEMPRE se toma del token (no suplantable por el cliente)
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(403).json({
        message: 'Tu usuario no tiene una organización asignada',
        code: 'NO_ORGANIZATION'
      });
    }

    const item = await Inventory.create({ ...req.body, organizationId });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT actualizar producto
router.put('/:id', protect, authorize('admin', 'veterinario'), async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const item = await Inventory.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {})
      }
    });
    
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
    const organizationId = req.user?.organizationId ?? null;

    const item = await Inventory.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {})
      }
    });
    
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