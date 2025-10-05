const Invoice = require('../models/Invoice');

// @desc    Obtener todas las facturas
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las facturas' });
  }
};

// @desc    Obtener una factura por ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la factura' });
  }
};

// @desc    Crear una nueva factura
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la factura' });
  }
};

// @desc    Actualizar una factura
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    await invoice.update(req.body);
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la factura' });
  }
};

// @desc    Eliminar una factura
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    await invoice.destroy();
    res.json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la factura' });
  }
};

// @desc    Eliminar una factura (soft delete)
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoiceSoft = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    await invoice.update({ isActive: false });
    res.json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la factura' });
  }
};

