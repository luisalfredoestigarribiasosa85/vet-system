const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { Appointment, Pet, Client, User } = require('../models');
const {
  BLOCKING_STATUSES,
  formatTime,
  toDate,
  computeSlot,
  ensureNoConflicts,
} = require('../utils/appointmentHelpers');

const agendaIncludes = [
  {
    model: Pet,
    as: 'pet',
    include: [{
      model: Client,
      as: 'owner',
      attributes: ['id', 'name', 'phone'],
    }],
  },
  {
    model: User,
    as: 'veterinarian',
    attributes: ['id', 'name', 'email'],
  },
];

const validateRequiredFields = (payload) => {
  const missing = [];
  if (!payload.petId) missing.push('petId');
  if (!payload.vetId) missing.push('vetId');
  if (!payload.date) missing.push('date');
  if (!payload.time) missing.push('time');

  if (missing.length) {
    const error = new Error(`Faltan campos obligatorios: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
};

router.get('/', protect, async (req, res) => {
  try {
    const { date, status, vetId, petId } = req.query;
    const where = { isActive: true };

    if (date) where.date = date;
    if (status) where.status = status;
    if (vetId) where.vetId = vetId;
    if (petId) where.petId = petId;

    const appointments = await Appointment.findAll({
      where,
      include: agendaIncludes,
      order: [['date', 'ASC'], ['time', 'ASC']],
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/availability', protect, async (req, res) => {
  try {
    const { vetId, date, durationMinutes, openingTime = '09:00', closingTime = '18:00', stepMinutes } = req.query;

    if (!vetId || !date) {
      return res.status(400).json({ message: 'Debe indicar vetId y date.' });
    }

    const duration = Number(durationMinutes) || 30;
    const step = Number(stepMinutes) || duration;

    const openDate = toDate(date, openingTime);
    const closeDate = toDate(date, closingTime);

    if (Number.isNaN(openDate.getTime()) || Number.isNaN(closeDate.getTime())) {
      return res.status(400).json({ message: 'Horario de apertura o cierre invalido.' });
    }

    if (closeDate <= openDate) {
      return res.status(400).json({ message: 'closingTime debe ser mayor a openingTime.' });
    }

    if (duration < 5 || duration > 480) {
      return res.status(400).json({ message: 'durationMinutes debe estar entre 5 y 480.' });
    }

    if (step < 5 || step > 240) {
      return res.status(400).json({ message: 'stepMinutes debe estar entre 5 y 240.' });
    }

    const dayAppointments = await Appointment.findAll({
      where: {
        vetId,
        isActive: true,
        status: { [Op.in]: BLOCKING_STATUSES },
        date,
      },
      include: agendaIncludes,
      order: [['time', 'ASC']],
    });

    const slots = [];
    const limit = closeDate.getTime();
    for (let current = new Date(openDate); current.getTime() + duration * 60000 <= limit; current = new Date(current.getTime() + step * 60000)) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      if (slotEnd > closeDate) {
        break;
      }

      const hasConflict = dayAppointments.some((appointment) => {
        const start = new Date(appointment.startDateTime);
        const end = new Date(appointment.endDateTime);
        return start < slotEnd && end > current;
      });

      slots.push({
        start: formatTime(current),
        end: formatTime(slotEnd),
        available: !hasConflict,
      });
    }

    res.json({
      vetId: Number(vetId),
      date,
      durationMinutes: duration,
      openingTime: formatTime(openDate),
      closingTime: formatTime(closeDate),
      stepMinutes: step,
      appointments: dayAppointments,
      slots,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/veterinarians', protect, async (req, res) => {
  try {
    const vets = await User.findAll({
      where: { role: { [Op.in]: ['veterinario', 'admin'] }, isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'email', 'role'],
    });

    res.json(vets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const payload = { ...req.body };
    validateRequiredFields(payload);

    const { duration, normalizedTime, startDateTime, endDateTime, endTime } = computeSlot(payload);

    await ensureNoConflicts({
      vetId: payload.vetId,
      petId: payload.petId,
      startDateTime,
      endDateTime,
    });

    const appointment = await Appointment.create({
      petId: payload.petId,
      vetId: payload.vetId,
      date: payload.date,
      time: normalizedTime,
      durationMinutes: duration,
      endTime,
      reason: payload.reason,
      type: payload.type || null,
      status: payload.status || 'programada',
      notes: payload.notes || null,
      reminderMethod: payload.reminderMethod || 'email',
      reminderDate: payload.reminderDate || null,
      startDateTime,
      endDateTime,
    });

    const result = await Appointment.findByPk(appointment.id, { include: agendaIncludes });
    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment || !appointment.isActive) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    const payload = { ...appointment.toJSON(), ...req.body };
    validateRequiredFields(payload);

    const { duration, normalizedTime, startDateTime, endDateTime, endTime } = computeSlot(payload);

    await ensureNoConflicts({
      vetId: payload.vetId,
      petId: payload.petId,
      startDateTime,
      endDateTime,
      excludeId: appointment.id,
    });

    await appointment.update({
      petId: payload.petId,
      vetId: payload.vetId,
      date: payload.date,
      time: normalizedTime,
      durationMinutes: duration,
      endTime,
      reason: payload.reason,
      type: payload.type || null,
      status: payload.status || appointment.status,
      notes: payload.notes || null,
      reminderMethod: payload.reminderMethod || appointment.reminderMethod,
      reminderDate: payload.reminderDate || appointment.reminderDate,
      startDateTime,
      endDateTime,
    });

    const result = await Appointment.findByPk(appointment.id, { include: agendaIncludes });
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment || !appointment.isActive) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    await appointment.update({ isActive: false, status: 'cancelada' });

    res.json({ message: 'Cita cancelada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
