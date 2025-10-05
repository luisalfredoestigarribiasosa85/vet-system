const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { sequelize, Appointment } = require('../models');

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

const computeFields = (appointment) => {
  const updates = {};

  const duration = Number(appointment.durationMinutes) || 30;
  if (!appointment.durationMinutes || appointment.durationMinutes !== duration) {
    updates.durationMinutes = duration;
  }

  if (!appointment.date || !appointment.time) {
    return updates;
  }

  const normalizedTime = normalizeTime(appointment.time);
  const start = new Date(`${appointment.date}T${normalizedTime}`);
  if (Number.isNaN(start.getTime())) {
    return updates;
  }

  const end = new Date(start.getTime() + duration * 60000);
  const endHours = String(end.getHours()).padStart(2, '0');
  const endMinutes = String(end.getMinutes()).padStart(2, '0');

  if (!appointment.startDateTime || new Date(appointment.startDateTime).getTime() !== start.getTime()) {
    updates.startDateTime = start;
  }

  if (!appointment.endDateTime || new Date(appointment.endDateTime).getTime() !== end.getTime()) {
    updates.endDateTime = end;
  }

  const endTime = `${endHours}:${endMinutes}:00`;
  if (!appointment.endTime || appointment.endTime !== endTime) {
    updates.endTime = endTime;
  }

  if (!appointment.time || appointment.time !== normalizedTime) {
    updates.time = normalizedTime;
  }

  return updates;
};

const run = async () => {
  try {
    await sequelize.authenticate();

    const appointments = await Appointment.findAll();
    let updated = 0;

    for (const appointment of appointments) {
      const updates = computeFields(appointment);
      if (Object.keys(updates).length > 0) {
        await appointment.update(updates);
        updated += 1;
      }
    }

    console.log(`Backfill completado. Registros actualizados: ${updated}`);
  } catch (error) {
    console.error('Error durante el backfill:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();
