const Client = require('../models/Client');
const Pet = require('../models/Pet');
const { parsePagination, paginateResponse } = require('../utils/pagination');

// Aislamiento multi-tenant estricto:
// - El organizationId SIEMPRE proviene del token (req.user.organizationId),
//   nunca de un fallback global (antes se tomaba "la primera organización
//   activa", lo que podía exponer datos entre organizaciones).
// - Los usuarios sin organización reciben 403 (requireOrganization en el router).

/**
 * Resuelve el organizationId exigido para operar sobre datos de tenants.
 */
const getRequiredOrgId = (req) => req.user?.organizationId ?? null;

// @desc    Obtener todos los clientes
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res) => {
  try {
    const organizationId = getRequiredOrgId(req);

    const baseOptions = {
      where: {
        ...(organizationId ? { organizationId } : {}),
        isActive: true,
      },
      include: [{
        model: Pet,
        as: 'pets',
        where: { isActive: true },
        required: false,
      }],
      order: [['createdAt', 'DESC']],
    };

    // Paginación retrocompatible: sin ?page/?limit se mantiene el array plano completo
    const pagination = parsePagination(req);
    if (pagination) {
      const { rows, count } = await Client.findAndCountAll({
        ...baseOptions,
        distinct: true, // el include 1:N de mascotas multiplica filas
        limit: pagination.limit,
        offset: pagination.offset,
      });
      return res.json(paginateResponse(rows, count, pagination));
    }

    const clients = await Client.findAll(baseOptions);

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener cliente por ID
// @route   GET /api/clients/:id
// @access  Private
exports.getClientById = async (req, res) => {
  try {
    const organizationId = getRequiredOrgId(req);

    const client = await Client.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {}),
        isActive: true,
      },
      include: [{
        model: Pet,
        as: 'pets',
        where: { isActive: true },
        required: false,
      }],
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear cliente
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res) => {
  try {
    const organizationId = getRequiredOrgId(req);

    if (!organizationId) {
      return res.status(403).json({
        message: 'Tu usuario no tiene una organización asignada',
        code: 'NO_ORGANIZATION'
      });
    }

    const clientData = { ...req.body, userId: req.user.id, organizationId };

    const client = await Client.create(clientData);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar cliente
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res) => {
  try {
    const organizationId = getRequiredOrgId(req);

    const client = await Client.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {}),
        isActive: true,
      },
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await client.update(req.body);
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar cliente (soft delete)
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res) => {
  try {
    const organizationId = getRequiredOrgId(req);

    const client = await Client.findOne({
      where: {
        id: req.params.id,
        ...(organizationId ? { organizationId } : {}),
        isActive: true,
      },
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await client.update({ isActive: false });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
