const logger = require('../config/logger');
const { Appointment, Pet } = require('../models');
const { parsePagination, paginateResponse } = require('../utils/pagination');

// Aislamiento multi-tenant: el organizationId proviene siempre del token
const getOrgFilter = (req) => {
  const organizationId = req.user?.organizationId ?? null;
  return organizationId ? { organizationId } : {};
};

// @desc    Obtener todas las citas
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const baseOptions = {
      where: {
        ...getOrgFilter(req),
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    };

    // Paginación retrocompatible: sin ?page/?limit se mantiene el array plano completo
    const pagination = parsePagination(req);
    if (pagination) {
      const { rows, count } = await Appointment.findAndCountAll({
        ...baseOptions,
        limit: pagination.limit,
        offset: pagination.offset
      });
      return res.json(paginateResponse(rows, count, pagination));
    }

    const appointments = await Appointment.findAll(baseOptions);
    res.json(appointments);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Error al obtener las citas' });
  }
};

// @desc    Obtener una cita por ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        ...getOrgFilter(req)
      }
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.json(appointment);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Error al obtener la cita' });
  }
};

// @desc    Crear una nueva cita
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(403).json({
        message: 'Tu usuario no tiene una organización asignada',
        code: 'NO_ORGANIZATION'
      });
    }

    const { petId, date, time, reason, reminderMethod = 'email' } = req.body;

    // Calcular la fecha del recordatorio (24 horas antes)
    const appointmentDate = new Date(`${date}T${time}`);
    const reminderDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);

    const appointment = await Appointment.create({
      petId,
      date,
      time,
      reason,
      reminderDate,
      reminderMethod,
      organizationId
    });

    res.status(201).json(appointment);
  } catch (error) {
    logger.error('Error al crear cita:', error);
    res.status(500).json({ message: 'Error al crear la cita' });
  }
};

// @desc    Actualizar una cita
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        ...getOrgFilter(req)
      }
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    await appointment.update(req.body);
    res.json(appointment);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Error al actualizar la cita' });
  }
};

// @desc    Eliminar una cita
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        ...getOrgFilter(req)
      }
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    await appointment.destroy();
    res.json({ message: 'Cita eliminada correctamente' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Error al eliminar la cita' });
  }
};
