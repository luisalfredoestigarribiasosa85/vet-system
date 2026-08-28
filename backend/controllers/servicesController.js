const Service = require('../models/Service');

// Aislamiento multi-tenant: el organizationId proviene siempre del token
const logger = require('../config/logger');
const getOrgFilter = (req) => {
    const organizationId = req.user?.organizationId ?? null;
    return organizationId ? { organizationId } : {};
};

// @desc    Obtener todos los servicios
// @route   GET /api/services
// @access  Private
exports.getAllServices = async (req, res) => {
    try {
        const { isActive } = req.query;

        const where = {
            ...getOrgFilter(req),
        };
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const services = await Service.findAll({
            where,
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        res.json(services);
    } catch (error) {
        logger.error('Error al obtener servicios:', error);
        res.status(500).json({ message: 'Error al obtener servicios' });
    }
};

// @desc    Obtener un servicio por ID
// @route   GET /api/services/:id
// @access  Private
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findOne({
            where: {
                id: req.params.id,
                ...getOrgFilter(req),
            }
        });

        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.json(service);
    } catch (error) {
        logger.error('Error al obtener servicio:', error);
        res.status(500).json({ message: 'Error al obtener servicio' });
    }
};

// @desc    Crear un nuevo servicio
// @route   POST /api/services
// @access  Private (Admin)
exports.createService = async (req, res) => {
    try {
        // El organizationId SIEMPRE se toma del token (no suplantable por el cliente)
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return res.status(403).json({
                message: 'Tu usuario no tiene una organización asignada',
                code: 'NO_ORGANIZATION'
            });
        }

        const { name, description, price, category, duration } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Nombre y precio son requeridos' });
        }

        const service = await Service.create({
            name,
            description,
            price,
            category: category || 'consulta',
            duration,
            organizationId
        });

        res.status(201).json(service);
    } catch (error) {
        logger.error('Error al crear servicio:', error);
        res.status(500).json({ message: 'Error al crear servicio' });
    }
};

// @desc    Actualizar un servicio
// @route   PUT /api/services/:id
// @access  Private (Admin)
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findOne({
            where: {
                id: req.params.id,
                ...getOrgFilter(req),
            }
        });

        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        const { name, description, price, category, isActive, duration } = req.body;

        await service.update({
            name: name || service.name,
            description: description !== undefined ? description : service.description,
            price: price || service.price,
            category: category || service.category,
            isActive: isActive !== undefined ? isActive : service.isActive,
            duration: duration !== undefined ? duration : service.duration
        });

        res.json(service);
    } catch (error) {
        logger.error('Error al actualizar servicio:', error);
        res.status(500).json({ message: 'Error al actualizar servicio' });
    }
};

// @desc    Eliminar un servicio (soft delete)
// @route   DELETE /api/services/:id
// @access  Private (Admin)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findOne({
            where: {
                id: req.params.id,
                ...getOrgFilter(req),
            }
        });

        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Soft delete - solo marcamos como inactivo
        await service.update({ isActive: false });

        res.json({ message: 'Servicio desactivado exitosamente' });
    } catch (error) {
        logger.error('Error al eliminar servicio:', error);
        res.status(500).json({ message: 'Error al eliminar servicio' });
    }
};

// @desc    Obtener servicios por categoría
// @route   GET /api/services/category/:category
// @access  Private
exports.getServicesByCategory = async (req, res) => {
    try {
        const services = await Service.findAll({
            where: {
                category: req.params.category,
                ...getOrgFilter(req),
                isActive: true
            },
            order: [['name', 'ASC']]
        });

        res.json(services);
    } catch (error) {
        logger.error('Error al obtener servicios por categoría:', error);
        res.status(500).json({ message: 'Error al obtener servicios por categoría' });
    }
};
