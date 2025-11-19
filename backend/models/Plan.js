const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Monto total en guaranies con IVA incluido',
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PYG',
  },
  vatPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'plans',
  timestamps: true,
});

module.exports = Plan;
