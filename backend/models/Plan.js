const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del plan (Free, Basic, Pro, Enterprise)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del plan'
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Precio mensual en guaranies con IVA incluido'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PYG',
  },
  interval: {
    type: DataTypes.ENUM('month', 'year'),
    defaultValue: 'month',
    comment: 'Intervalo de facturación'
  },
  stripePriceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID del precio en Stripe (deprecated, usar paymentProviderId)'
  },
  paymentProviderId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID del plan/precio en el proveedor de pagos (Stripe, PayU, etc.)'
  },
  features: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Características del plan en formato JSON'
  },
  limits: {
    type: DataTypes.JSONB,
    defaultValue: {
      users: 1,
      clients: 50,
      pets: 100,
      appointments: 200,
      invoices: 100,
      storage: 100, // MB
    },
    comment: 'Límites del plan'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el plan está disponible para nuevos suscriptores'
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si es el plan más popular (destacado)'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Orden de visualización'
  },
  trialDays: {
    type: DataTypes.INTEGER,
    defaultValue: 14,
    comment: 'Días de prueba gratuita'
  }
}, {
  tableName: 'plans',
  timestamps: true,
  indexes: [
    {
      fields: ['isActive']
    },
    {
      fields: ['isPopular']
    },
    {
      fields: ['sortOrder']
    }
  ]
});

module.exports = Plan;