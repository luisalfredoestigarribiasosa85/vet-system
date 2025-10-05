const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Client } = require('../models');

const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  clientId: user.client ? user.client.id : null,
});

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const normalizedUsername = username?.trim().toLowerCase();

    const user = await User.findOne({
      where: { username: normalizedUsername },
      include: [{ model: Client, as: 'client', attributes: ['id'] }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role = 'recepcionista' } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username: normalizedUsername }, { email: normalizedEmail }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Usuario ya existe' });
    }

    const allowedRoles = ['admin', 'veterinario', 'recepcionista', 'cliente'];
    const finalRole = allowedRoles.includes(role) ? role : 'recepcionista';

    await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      role: finalRole,
    });

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role'],
      include: [{ model: Client, as: 'client', attributes: ['id', 'name'] }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      client: user.client ? { id: user.client.id, name: user.client.name } : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
