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
        },
        comment: 'ID de la factura asociada'
    },
    amount: {
        type: DataTypes.DECIMAL(12, 0),
        allowNull: false,
        comment: 'Monto pagado en Guaraníes'
    },
    paymentMethod: {
        type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'qr', 'billetera_digital'),
        allowNull: false,
        comment: 'Método de pago utilizado'
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha y hora del pago'
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Número de referencia (para transferencias, QR, etc.)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre el pago'
    },
    processedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Usuario que procesó el pago'
    }
}, {
    tableName: 'payments',
    timestamps: true
});

module.exports = Payment;
