const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Número de factura único (ej: FAC-2025-0001)'
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    },
    comment: 'Cliente que recibe la factura'
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pets',
      key: 'id'
    },
    comment: 'Mascota asociada (opcional)'
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de emisión de la factura'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de vencimiento (para pagos a crédito)'
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array de items: [{ serviceId, name, quantity, price, subtotal }]'
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: false,
    comment: 'Subtotal en Guaraníes'
  },
  discount: {
    type: DataTypes.DECIMAL(12, 0),
    defaultValue: 0,
    comment: 'Descuento aplicado en Guaraníes'
  },
  tax: {
    type: DataTypes.DECIMAL(12, 0),
    defaultValue: 0,
    comment: 'IVA u otros impuestos en Guaraníes'
  },
  total: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: false,
    comment: 'Total a pagar en Guaraníes'
  },
  amountPaid: {
    type: DataTypes.DECIMAL(12, 0),
    defaultValue: 0,
    comment: 'Monto ya pagado en Guaraníes'
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'parcial', 'vencido', 'cancelado'),
    defaultValue: 'pendiente',
    comment: 'Estado de la factura'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas o comentarios adicionales'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que creó la factura'
  }
}, {
  tableName: 'invoices',
  timestamps: true
});

module.exports = Invoice;
