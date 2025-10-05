const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const models = require('../models');
const { computeSlot, ensureNoConflicts } = require('../utils/appointmentHelpers');

const { User, Client, Pet, Appointment, MedicalRecord } = models;

const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' },
);

const sanitizeUser = (user, client) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  clientId: client ? client.id : null,
});

const getClientForUser = async (userId) => Client.findOne({ where: { userId, isActive: true } });

exports.registerClient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y password son obligatorios' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const username = normalizedEmail;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: normalizedEmail }],
      },
      include: [{ model: Client, as: 'client' }],
    });

    if (existingUser) {
      if (existingUser.role !== 'cliente') {
        return res.status(400).json({ message: 'El email ya esta asociado a otro usuario del sistema' });
      }

      await existingUser.update({
        name: name.trim(),
        password,
      });

      if (existingUser.client) {
        await existingUser.client.update({
          name: name.trim(),
          email: normalizedEmail,
          phone: phone ? phone.trim() : existingUser.client.phone,
        });
      }

      const token = signToken(existingUser);
      const client = existingUser.client || await getClientForUser(existingUser.id);

      return res.status(200).json({
        token,
        user: sanitizeUser(existingUser, client),
      });
    }

    const user = await User.create({
      name: name.trim(),
      username,
      email: normalizedEmail,
      password,
      role: 'cliente',
    });

    const client = await Client.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      userId: user.id,
      isActive: true,
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: sanitizeUser(user, client),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar cliente' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const client = await Client.findOne({
      where: { userId: req.user.id },
      attributes: ['id', 'name', 'email', 'phone'],
    });

    if (!client) {
      return res.status(404).json({ message: 'Perfil de cliente no encontrado' });
    }

    const pets = await Pet.findAll({
      where: { clientId: client.id, isActive: true },
      attributes: ['id', 'name', 'species', 'breed', 'age', 'gender'],
      order: [['name', 'ASC']],
    });

    const petIds = pets.map((pet) => pet.id);

    const appointments = petIds.length === 0
      ? []
      : await Appointment.findAll({
        where: {
          petId: { [Op.in]: petIds },
          isActive: true,
        },
        include: [
          { model: Pet, as: 'pet', attributes: ['id', 'name'] },
          { model: User, as: 'veterinarian', attributes: ['id', 'name'] },
        ],
        order: [['date', 'ASC'], ['time', 'ASC']],
      });

    res.json({
      user: sanitizeUser(req.user, client),
      client,
      pets,
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

exports.getPets = async (req, res) => {
  try {
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const client = await getClientForUser(req.user.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const pets = await Pet.findAll({
      where: { clientId: client.id, isActive: true },
      include: [{
        model: MedicalRecord,
        as: 'medicalRecords',
        attributes: ['id', 'diagnosis', 'createdAt'],
        separate: true,
        limit: 3,
        order: [['createdAt', 'DESC']],
      }],
      order: [['name', 'ASC']],
    });

    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener mascotas' });
  }
};

exports.getPetRecords = async (req, res) => {
  try {
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const client = await getClientForUser(req.user.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const pet = await Pet.findOne({
      where: { id: req.params.petId, clientId: client.id },
      attributes: ['id', 'name'],
    });

    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }

    const records = await MedicalRecord.findAll({
      where: { petId: pet.id },
      include: [{ model: User, as: 'veterinarian', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ pet, records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial medico' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const client = await getClientForUser(req.user.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const appointments = await Appointment.findAll({
      where: { isActive: true },
      include: [
        {
          model: Pet,
          as: 'pet',
          where: { clientId: client.id },
          attributes: ['id', 'name'],
        },
        { model: User, as: 'veterinarian', attributes: ['id', 'name'] },
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const client = await getClientForUser(req.user.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const { petId, vetId, date, time, durationMinutes, reason, type, notes } = req.body;

    if (!petId || !vetId || !date || !time || !reason) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const pet = await Pet.findOne({ where: { id: petId, clientId: client.id } });
    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }

    const slot = computeSlot({ date, time, durationMinutes });

    await ensureNoConflicts({
      vetId,
      petId,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
    });

    const appointment = await Appointment.create({
      petId,
      vetId,
      date,
      time: slot.normalizedTime,
      durationMinutes: slot.duration,
      endTime: slot.endTime,
      reason,
      type: type || null,
      status: 'programada',
      notes: notes || null,
      reminderMethod: 'email',
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
    });

    const result = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Pet, as: 'pet', attributes: ['id', 'name'] },
        { model: User, as: 'veterinarian', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Error al crear cita' });
  }
};
exports.updateAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const client = await getClientForUser(req.user.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const appointment = await Appointment.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        {
          model: Pet,
          as: 'pet',
          where: { clientId: client.id },
          attributes: ['id', 'clientId'],
          required: true,
        },
        { model: User, as: 'veterinarian', attributes: ['id', 'name'] },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    const desiredPetId = Number(req.body.petId || appointment.petId);
    const desiredVetId = Number(req.body.vetId || appointment.vetId);
    const desiredPet = await Pet.findOne({
      where: { id: desiredPetId, clientId: client.id, isActive: true },
    });

    if (!desiredPet) {
      return res.status(400).json({ message: 'Mascota invalida' });
    }

    const payload = {
      petId: desiredPetId,
      vetId: desiredVetId,
      date: req.body.date || appointment.date,
      time: req.body.time || appointment.time,
      durationMinutes: req.body.durationMinutes || appointment.durationMinutes,
      reason: req.body.reason || appointment.reason,
      type: req.body.type ?? appointment.type,
      notes: req.body.notes ?? appointment.notes,
    };

    if (!payload.petId || !payload.vetId || !payload.date || !payload.time || !payload.reason) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const slot = computeSlot(payload);

    await ensureNoConflicts({
      vetId: payload.vetId,
      petId: payload.petId,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
      excludeId: appointment.id,
    });

    await appointment.update({
      petId: payload.petId,
      vetId: payload.vetId,
      date: payload.date,
      time: slot.normalizedTime,
      durationMinutes: slot.duration,
      endTime: slot.endTime,
      reason: payload.reason,
      type: payload.type,
      notes: payload.notes,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
    });

    const result = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Pet, as: 'pet', attributes: ['id', 'name'] },
        { model: User, as: 'veterinarian', attributes: ['id', 'name'] },
      ],
    });

    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Error al actualizar la cita' });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const client = await getClientForUser(req.user.id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const appointment = await Appointment.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{
        model: Pet,
        as: 'pet',
        where: { clientId: client.id },
        attributes: ['id'],
        required: true,
      }],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    await appointment.update({ isActive: false, status: 'cancelada' });

    res.json({ message: 'Cita cancelada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cancelar la cita' });
  }
};
