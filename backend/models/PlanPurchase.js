const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Client = require('./Client');
const Plan = require('./Plan');

const PlanPurchase = sequelize.define('PlanPurchase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Client,
      key: 'id',
    },
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Plan,
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vatAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PYG',
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  paymentMethod: {
    type: DataTypes.ENUM('bancard', 'efectivo', 'otro'),
    allowNull: false,
    defaultValue: 'bancard',
  },
  paymentReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  mockPaymentUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'plan_purchases',
  timestamps: true,
});

module.exports = PlanPurchase;
