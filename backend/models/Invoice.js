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
    unique: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pets',
      key: 'id'
    }
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(12, 0),
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(12, 0),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: false
  },
  amountPaid: {
    type: DataTypes.DECIMAL(12, 0),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'parcial', 'vencido', 'cancelado'),
    defaultValue: 'pendiente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    // Listado con filtro de estado y orden por fecha
    { name: 'idx_invoices_org_status_issue', fields: ['organizationId', 'status', 'issueDate'] },
    // Listado sin filtro de estado (orden por issueDate DESC)
    { name: 'idx_invoices_org_issue', fields: ['organizationId', 'issueDate'] },
    // Facturas por cliente
    { name: 'idx_invoices_client_id', fields: ['clientId'] },
  ]
});

module.exports = Invoice;
