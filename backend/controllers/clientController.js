const Client = require('../models/Client');
const Pet = require('../models/Pet');
const Organization = require('../models/Organization');

// Busca la organización del usuario o la primera activa; puede crear una por defecto si se requiere
const resolveOrganizationId = async (user, { createIfMissing = false } = {}) => {
  if (user?.organizationId) return user.organizationId;

  const organization = await Organization.findOne({ where: { isActive: true } });
  if (organization || !createIfMissing) return organization?.id || null;

  const defaultOrg = await Organization.create({
    name: 'Organizacion por defecto',
    subdomain: `default-${Date.now()}`,
    isActive: true,
  });

  return defaultOrg.id;
};

// @desc    Obtener todos los clientes
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res) => {
  try {
    const userOrgId = req.user?.organizationId;
    const organizationId = userOrgId ? await resolveOrganizationId(req.user) : null;

    const clients = await Client.findAll({
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
    });

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
    const userOrgId = req.user?.organizationId;
    const organizationId = userOrgId ? await resolveOrganizationId(req.user) : null;

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
    const organizationId = await resolveOrganizationId(req.user, { createIfMissing: true });

    if (!organizationId) {
      return res.status(400).json({ message: 'No hay una organización activa configurada' });
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
    const userOrgId = req.user?.organizationId;
    const organizationId = userOrgId ? await resolveOrganizationId(req.user) : null;

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
    const userOrgId = req.user?.organizationId;
    const organizationId = userOrgId ? await resolveOrganizationId(req.user) : null;

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
