const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Pet = require('./Pet');
const User = require('./User');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Pet,
      key: 'id'
    }
  },
  vetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('programada', 'completada', 'cancelada', 'no_asistio'),
    defaultValue: 'programada'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'appointments',
  timestamps: true
});

// Relaciones
Appointment.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });
Appointment.belongsTo(User, { foreignKey: 'vetId', as: 'veterinarian' });

module.exports = Appointment;