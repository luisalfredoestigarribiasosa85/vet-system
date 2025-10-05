const { Op } = require('sequelize');
const { Appointment } = require('../models');

const BLOCKING_STATUSES = ['programada', 'completada'];

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

const toDate = (date, time) => new Date(`${date}T${normalizeTime(time)}`);

const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const buildOverlapWhere = (field, entityId, startDateTime, endDateTime, excludeId) => {
  const where = {
    [field]: entityId,
    isActive: true,
    status: { [Op.in]: BLOCKING_STATUSES },
    [Op.and]: [
      { startDateTime: { [Op.lt]: endDateTime } },
      { endDateTime: { [Op.gt]: startDateTime } },
    ],
  };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  return where;
};

const computeSlot = ({ date, time, durationMinutes }) => {
  const duration = Number(durationMinutes) || 30;
  if (duration < 5 || duration > 480) {
    const error = new Error('La duracion debe estar entre 5 y 480 minutos.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedTime = normalizeTime(time);
  const startDateTime = toDate(date, normalizedTime);
  if (Number.isNaN(startDateTime.getTime())) {
    const error = new Error('Fecha u hora invalidas.');
    error.statusCode = 400;
    throw error;
  }

  const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
  const endTime = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}:00`;

  return {
    duration,
    normalizedTime,
    startDateTime,
    endDateTime,
    endTime,
  };
};

const ensureNoConflicts = async ({ vetId, petId, startDateTime, endDateTime, excludeId }) => {
  if (!vetId || !petId) {
    return;
  }

  const vetOverlap = await Appointment.findOne({
    where: buildOverlapWhere('vetId', vetId, startDateTime, endDateTime, excludeId),
  });

  if (vetOverlap) {
    const error = new Error('El veterinario ya tiene una cita en ese horario.');
    error.statusCode = 409;
    throw error;
  }

  const petOverlap = await Appointment.findOne({
    where: buildOverlapWhere('petId', petId, startDateTime, endDateTime, excludeId),
  });

  if (petOverlap) {
    const error = new Error('La mascota ya tiene una cita en ese horario.');
    error.statusCode = 409;
    throw error;
  }
};

module.exports = {
  BLOCKING_STATUSES,
  normalizeTime,
  toDate,
  formatTime,
  computeSlot,
  ensureNoConflicts,
};
