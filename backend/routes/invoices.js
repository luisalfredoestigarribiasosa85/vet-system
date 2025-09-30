const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Pet = require('../models/Pet');
const Client = require('../models/Client');

// GET todas las facturas
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (startDate && endDate) {
      const { Op } = require('sequelize');
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const invoices = await Invoice.findAll({
      where,
      include: [{
        model: Pet,
        as: 'pet',
        include: [{
          model: Client,
          as: 'owner',
          attributes: ['id', 'name', 'phone']
        }]
      }],
      order: [['date', 'DESC']]
    });
    
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET reporte de ingresos
router.get('/reports/revenue', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { Op } = require('sequelize');
    
    const where = {
      status: 'pagado'
    };
    
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const invoices = await Invoice.findAll({ where });
    
    const total = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const count = invoices.length;
    const average = count > 0 ? total / count : 0;
    
    // Agrupar por método de pago
    const byPaymentMethod = invoices.reduce((acc, inv) => {
      if (!acc[inv.payment]) {
        acc[inv.payment] = { count: 0, total: 0 };
      }
      acc[inv.payment].count++;
      acc[inv.payment].total += parseFloat(inv.total);
      return acc;
    }, {});
    
    res.json({
      total,
      count,
      average,
      byPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST crear factura
router.post('/', protect, async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET factura por ID
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{
        model: Pet,
        as: 'pet',
        include: [{
          model: Client,
          as: 'owner'
        }]
      }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
