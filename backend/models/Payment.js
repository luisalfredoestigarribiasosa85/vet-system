const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'invoices',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(12, 0),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'qr', 'billetera_digital'),
        allowNull: false
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    processedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
        // Pagos por factura (include en detalle/listado de facturas)
        { name: 'idx_payments_invoice_id', fields: ['invoiceId'] },
        // Reportes mensuales/income por rango de fechas
        { name: 'idx_payments_payment_date', fields: ['paymentDate'] },
    ]
});

module.exports = Payment;
