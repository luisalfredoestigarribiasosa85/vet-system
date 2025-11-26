const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Pet = require('../models/Pet');
const User = require('../models/User');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

// Función auxiliar para generar número de factura
const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const lastInvoice = await Invoice.findOne({
        where: {
            invoiceNumber: {
                [Op.like]: `FAC-${year}-%`
            }
        },
        order: [['createdAt', 'DESC']]
    });

    let nextNumber = 1;
    if (lastInvoice) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
        nextNumber = lastNumber + 1;
    }

    return `FAC-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// @desc    Obtener todas las facturas
// @route   GET /api/invoices
// @access  Private
exports.getAllInvoices = async (req, res) => {
    try {
        const { status, clientId, startDate, endDate } = req.query;

        const where = {};
        if (status) where.status = status;
        if (clientId) where.clientId = clientId;
        if (startDate && endDate) {
            where.issueDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const invoices = await Invoice.findAll({
            where,
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: Pet,
                    as: 'pet',
                    attributes: ['id', 'name', 'species']
                },
                {
                    model: Payment,
                    as: 'payments',
                    attributes: ['id', 'amount', 'paymentMethod', 'paymentDate']
                }
            ],
            order: [['issueDate', 'DESC']]
        });

        res.json(invoices);
    } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({ message: 'Error al obtener facturas' });
    }
};

// @desc    Obtener una factura por ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'name', 'phone', 'email', 'address']
                },
                {
                    model: Pet,
                    as: 'pet',
                    attributes: ['id', 'name', 'species', 'breed']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name']
                },
                {
                    model: Payment,
                    as: 'payments',
                    include: [{
                        model: User,
                        as: 'processor',
                        attributes: ['id', 'name']
                    }]
                }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        res.json(invoice);
    } catch (error) {
        console.error('Error al obtener factura:', error);
        res.status(500).json({ message: 'Error al obtener factura' });
    }
};

// @desc    Crear una nueva factura
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
    try {
        const { clientId, petId, items, discount, tax, notes, dueDate } = req.body;

        if (!clientId || !items || items.length === 0) {
            return res.status(400).json({ message: 'Cliente e items son requeridos' });
        }

        // Calcular subtotal
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = discount || 0;
        const taxAmount = tax || 0;
        const total = subtotal - discountAmount + taxAmount;

        // Generar número de factura
        const invoiceNumber = await generateInvoiceNumber();

        const invoice = await Invoice.create({
            invoiceNumber,
            clientId,
            petId: petId || null,
            items,
            subtotal,
            discount: discountAmount,
            tax: taxAmount,
            total,
            amountPaid: 0,
            status: 'pendiente',
            notes,
            dueDate: dueDate || null,
            createdBy: req.user.id
        });

        // Cargar relaciones para la respuesta
        const invoiceWithRelations = await Invoice.findByPk(invoice.id, {
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: Pet,
                    as: 'pet',
                    attributes: ['id', 'name', 'species']
                }
            ]
        });

        res.status(201).json(invoiceWithRelations);
    } catch (error) {
        console.error('Error al crear factura:', error);
        res.status(500).json({ message: 'Error al crear factura', error: error.message });
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

        if (invoice.status === 'pagado') {
            return res.status(400).json({ message: 'No se puede modificar una factura pagada' });
        }

        const { items, discount, tax, notes, dueDate, status } = req.body;

        let updateData = {
            notes: notes !== undefined ? notes : invoice.notes,
            dueDate: dueDate !== undefined ? dueDate : invoice.dueDate,
            status: status || invoice.status
        };

        // Si se actualizan los items, recalcular totales
        if (items) {
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discountAmount = discount !== undefined ? discount : invoice.discount;
            const taxAmount = tax !== undefined ? tax : invoice.tax;
            const total = subtotal - discountAmount + taxAmount;

            updateData = {
                ...updateData,
                items,
                subtotal,
                discount: discountAmount,
                tax: taxAmount,
                total
            };
        }

        await invoice.update(updateData);

        res.json(invoice);
    } catch (error) {
        console.error('Error al actualizar factura:', error);
        res.status(500).json({ message: 'Error al actualizar factura' });
    }
};

// @desc    Cancelar una factura
// @route   DELETE /api/invoices/:id
// @access  Private
exports.cancelInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        if (invoice.status === 'pagado') {
            return res.status(400).json({ message: 'No se puede cancelar una factura pagada' });
        }

        await invoice.update({ status: 'cancelado' });

        res.json({ message: 'Factura cancelada exitosamente' });
    } catch (error) {
        console.error('Error al cancelar factura:', error);
        res.status(500).json({ message: 'Error al cancelar factura' });
    }
};

// @desc    Registrar un pago para una factura
// @route   POST /api/invoices/:id/payments
// @access  Private
exports.addPayment = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        if (invoice.status === 'cancelado') {
            return res.status(400).json({ message: 'No se puede pagar una factura cancelada' });
        }

        const { amount, paymentMethod, reference, notes } = req.body;

        if (!amount || !paymentMethod) {
            return res.status(400).json({ message: 'Monto y método de pago son requeridos' });
        }

        const remainingAmount = parseFloat(invoice.total) - parseFloat(invoice.amountPaid);

        if (parseFloat(amount) > remainingAmount) {
            return res.status(400).json({
                message: `El monto excede el saldo pendiente de Gs. ${remainingAmount.toLocaleString('es-PY')}`
            });
        }

        // Crear el pago
        const payment = await Payment.create({
            invoiceId: invoice.id,
            amount,
            paymentMethod,
            reference,
            notes,
            processedBy: req.user.id
        });

        // Actualizar monto pagado en la factura
        const newAmountPaid = parseFloat(invoice.amountPaid) + parseFloat(amount);
        let newStatus = 'parcial';

        if (newAmountPaid >= parseFloat(invoice.total)) {
            newStatus = 'pagado';
        }

        await invoice.update({
            amountPaid: newAmountPaid,
            status: newStatus
        });

        // Cargar el pago con relaciones
        const paymentWithRelations = await Payment.findByPk(payment.id, {
            include: [{
                model: User,
                as: 'processor',
                attributes: ['id', 'name']
            }]
        });

        res.status(201).json({
            payment: paymentWithRelations,
            invoice: {
                id: invoice.id,
                amountPaid: newAmountPaid,
                status: newStatus,
                remainingAmount: parseFloat(invoice.total) - newAmountPaid
            }
        });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({ message: 'Error al registrar pago', error: error.message });
    }
};

// @desc    Generar PDF de factura
// @route   GET /api/invoices/:id/pdf
// @access  Private
exports.generateInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['name', 'phone', 'email', 'address']
                },
                {
                    model: Pet,
                    as: 'pet',
                    attributes: ['name', 'species', 'breed']
                },
                {
                    model: Payment,
                    as: 'payments'
                }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=factura-${invoice.invoiceNumber}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('FACTURA', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text('Clínica Veterinaria', { align: 'center' });
        doc.moveDown(2);

        // Información de la factura
        doc.fontSize(10);
        doc.text(`Factura N°: ${invoice.invoiceNumber}`, 50, 150);
        doc.text(`Fecha: ${new Date(invoice.issueDate).toLocaleDateString('es-PY')}`, 50, 165);
        if (invoice.dueDate) {
            doc.text(`Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-PY')}`, 50, 180);
        }

        // Información del cliente
        doc.fontSize(12).font('Helvetica-Bold').text('CLIENTE', 50, 210);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Nombre: ${invoice.client.name}`, 50, 230);
        doc.text(`Teléfono: ${invoice.client.phone || 'N/A'}`, 50, 245);
        if (invoice.pet) {
            doc.text(`Mascota: ${invoice.pet.name} (${invoice.pet.species})`, 50, 260);
        }

        // Items
        doc.fontSize(12).font('Helvetica-Bold').text('DETALLE', 50, 290);

        let yPosition = 310;
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Descripción', 50, yPosition);
        doc.text('Cant.', 350, yPosition);
        doc.text('Precio', 400, yPosition);
        doc.text('Subtotal', 480, yPosition);

        yPosition += 20;
        doc.fontSize(9).font('Helvetica');

        invoice.items.forEach(item => {
            doc.text(item.name, 50, yPosition, { width: 280 });
            doc.text(item.quantity.toString(), 350, yPosition);
            doc.text(`Gs. ${parseInt(item.price).toLocaleString('es-PY')}`, 400, yPosition);
            doc.text(`Gs. ${parseInt(item.subtotal).toLocaleString('es-PY')}`, 480, yPosition);
            yPosition += 20;
        });

        // Totales
        yPosition += 20;
        doc.fontSize(10).font('Helvetica');
        doc.text(`Subtotal:`, 400, yPosition);
        doc.text(`Gs. ${parseInt(invoice.subtotal).toLocaleString('es-PY')}`, 480, yPosition, { align: 'right' });

        if (invoice.discount > 0) {
            yPosition += 20;
            doc.text(`Descuento:`, 400, yPosition);
            doc.text(`-Gs. ${parseInt(invoice.discount).toLocaleString('es-PY')}`, 480, yPosition, { align: 'right' });
        }

        if (invoice.tax > 0) {
            yPosition += 20;
            doc.text(`IVA:`, 400, yPosition);
            doc.text(`Gs. ${parseInt(invoice.tax).toLocaleString('es-PY')}`, 480, yPosition, { align: 'right' });
        }

        yPosition += 20;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`TOTAL:`, 400, yPosition);
        doc.text(`Gs. ${parseInt(invoice.total).toLocaleString('es-PY')}`, 480, yPosition, { align: 'right' });

        // Estado de pago
        yPosition += 30;
        doc.fontSize(10).font('Helvetica');
        doc.text(`Pagado: Gs. ${parseInt(invoice.amountPaid).toLocaleString('es-PY')}`, 400, yPosition);
        yPosition += 15;
        const remaining = parseFloat(invoice.total) - parseFloat(invoice.amountPaid);
        doc.text(`Saldo: Gs. ${parseInt(remaining).toLocaleString('es-PY')}`, 400, yPosition);

        yPosition += 15;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`Estado: ${invoice.status.toUpperCase()}`, 400, yPosition);

        if (invoice.notes) {
            yPosition += 30;
            doc.fontSize(10).font('Helvetica');
            doc.text(`Notas: ${invoice.notes}`, 50, yPosition, { width: 500 });
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al generar PDF de factura' });
        }
    }
};

// @desc    Obtener estadísticas de pagos
// @route   GET /api/invoices/stats/dashboard
// @access  Private
exports.getPaymentStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {};
        if (startDate && endDate) {
            where.issueDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Total de ingresos
        const totalInvoices = await Invoice.sum('total', { where });
        const totalPaid = await Invoice.sum('amountPaid', { where });
        const totalPending = totalInvoices - totalPaid;

        // Facturas por estado
        const invoicesByStatus = await Invoice.findAll({
            where,
            attributes: [
                'status',
                [Invoice.sequelize.fn('COUNT', Invoice.sequelize.col('id')), 'count'],
                [Invoice.sequelize.fn('SUM', Invoice.sequelize.col('total')), 'total']
            ],
            group: ['status'],
            raw: true
        });

        // Pagos por método
        const paymentsByMethod = await Payment.findAll({
            attributes: [
                'paymentMethod',
                [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'count'],
                [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total']
            ],
            group: ['paymentMethod'],
            raw: true
        });

        // Ingresos mensuales (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyIncome = await Payment.findAll({
            where: {
                paymentDate: {
                    [Op.gte]: sixMonthsAgo
                }
            },
            attributes: [
                [Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('paymentDate')), 'month'],
                [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total']
            ],
            group: [Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('paymentDate'))],
            order: [[Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('paymentDate')), 'ASC']],
            raw: true
        });

        res.json({
            totalInvoices: totalInvoices || 0,
            totalPaid: totalPaid || 0,
            totalPending: totalPending || 0,
            invoicesByStatus,
            paymentsByMethod,
            monthlyIncome
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};
