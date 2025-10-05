const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const normalizeTime = (time) => {
  if (!time) return time;
  const parts = String(time).split(':');
  if (parts.length === 2) {
    const [h, m] = parts;
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${(s || '00').padStart(2, '0')}`;
  }
  return time;
};

const computeTimeFields = (appointment) => {
  if (!appointment) return;

  const duration = Number(appointment.durationMinutes) || 30;
  appointment.durationMinutes = duration;

  if (!appointment.date || !appointment.time) {
    return;
  }

  const normalizedStart = normalizeTime(appointment.time);
  appointment.time = normalizedStart;

  const startDateTime = new Date(`${appointment.date}T${normalizedStart}`);
  if (Number.isNaN(startDateTime.getTime())) {
    return;
  }

  const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
  const endHours = String(endDateTime.getHours()).padStart(2, '0');
  const endMinutes = String(endDateTime.getMinutes()).padStart(2, '0');

  appointment.startDateTime = startDateTime;
  appointment.endDateTime = endDateTime;
  appointment.endTime = `${endHours}:${endMinutes}:00`;
};

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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    validate: {
      min: 5,
      max: 480
    }
  },
  startDateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
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
  },
  reminderDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en la que se debe enviar el recordatorio'
  },
  reminderMethod: {
    type: DataTypes.ENUM('email', 'sms', 'whatsapp'),
    defaultValue: 'email'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'appointments',
  timestamps: true
});

Appointment.beforeValidate(computeTimeFields);
Appointment.beforeUpdate(computeTimeFields);

module.exports = Appointment;
