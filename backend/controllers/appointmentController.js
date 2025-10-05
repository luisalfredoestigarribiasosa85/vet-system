const { Appointment, Pet } = require('../models');

// @desc    Obtener todas las citas
// @route   GET /api/appointmentsPet } = require('../models');
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las citas' });
  }
};

// @desc    Obtener una cita por ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la cita' });
  }
};

// @desc    Crear una nueva cita
// @route   POST /api/appointments
// @access  Private
// Agregar esta función al controlador
exports.createAppointment = async (req, res) => {
  try {
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
      reminderMethod
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ message: 'Error al crear la cita' });
  }
};

// @desc    Actualizar una cita
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    await appointment.update(req.body);
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la cita' });
  }
};

// @desc    Eliminar una cita
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    await appointment.destroy();
    res.json({ message: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la cita' });
  }
};
