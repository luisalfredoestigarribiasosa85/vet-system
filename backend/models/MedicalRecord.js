const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pets',
      key: 'id'
    }
  },
  vetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vaccines: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array de vacunas aplicadas: { name: string, date: Date, nextDose: Date }'
  },
  allergies: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array de alergias: { name: string, severity: "leve"|"moderada"|"grave" }'
  },
  surgeries: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array de cirugias: { name: string, date: Date, notes: string }'
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array de archivos adjuntos: { name: string, url: string, type: "image"|"pdf"|"other" }'
  }
}, {
  tableName: 'medical_records',
  timestamps: true
});

module.exports = MedicalRecord;
