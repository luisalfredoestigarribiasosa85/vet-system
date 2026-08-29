const logger = require('../config/logger');
const { Appointment, Invoice, Vaccination, Inventory, Pet, Client } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Aislamiento multi-tenant: el organizationId proviene siempre del token
const getOrgFilter = (req) => {
    const organizationId = req.user?.organizationId ?? null;
    return organizationId ? { organizationId } : {};
};

/**
 * Obtener estadísticas de citas (últimos 6 meses)
 */
const getAppointmentStats = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const appointments = await Appointment.findAll({
            where: {
                ...getOrgFilter(req),
                date: {
                    [Op.gte]: sixMonthsAgo,
                },
            },
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'month'],
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: ['month', 'status'],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'ASC']],
            raw: true,
        });

        res.json(appointments);
    } catch (error) {
        logger.error('Error al obtener estadísticas de citas:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener estadísticas de ingresos (últimos 6 meses)
 */
const getRevenueStats = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const revenue = await Invoice.findAll({
            where: {
                ...getOrgFilter(req),
                issueDate: {
                    [Op.gte]: sixMonthsAgo,
                },
                status: 'pagado',
            },
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('issueDate')), 'month'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total'],
            ],
            group: ['month'],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('issueDate')), 'ASC']],
            raw: true,
        });

        res.json(revenue);
    } catch (error) {
        logger.error('Error al obtener estadísticas de ingresos:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener estadísticas de vacunaciones
 */
const getVaccinationStats = async (req, res) => {
    try {
        const stats = await Vaccination.findAll({
            where: getOrgFilter(req),
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: ['status'],
            raw: true,
        });

        res.json(stats);
    } catch (error) {
        logger.error('Error al obtener estadísticas de vacunaciones:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener estadísticas de inventario (productos con stock bajo)
 */
const getInventoryStats = async (req, res) => {
    try {
        const lowStock = await Inventory.findAll({
            where: {
                ...getOrgFilter(req),
                quantity: {
                    [Op.lte]: sequelize.col('minStock'),
                },
            },
            order: [['quantity', 'ASC']],
            limit: 5,
        });

        res.json(lowStock);
    } catch (error) {
        logger.error('Error al obtener estadísticas de inventario:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener resumen general (overview)
 */
const getOverviewStats = async (req, res) => {
    try {
        const orgFilter = getOrgFilter(req);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Citas del mes — mismos criterios que la agenda (activas, no canceladas)
        const appointmentsThisMonth = await Appointment.count({
            where: {
                ...orgFilter,
                date: {
                    [Op.gte]: firstDayOfMonth,
                },
                isActive: true,
            },
        });

        // Ingresos del mes
        const revenueThisMonth = await Invoice.sum('total', {
            where: {
                ...orgFilter,
                issueDate: {
                    [Op.gte]: firstDayOfMonth,
                },
                status: 'pagado',
            },
        });

        // Total de mascotas
        const totalPets = await Pet.count({ where: orgFilter });

        // Vacunas aplicadas este mes
        const vaccinationsThisMonth = await Vaccination.count({
            where: {
                ...orgFilter,
                applicationDate: {
                    [Op.gte]: firstDayOfMonth,
                },
            },
        });

        // Total de clientes
        const totalClients = await Client.count({ where: { ...orgFilter, isActive: true } });

        // Productos con stock bajo
        const lowStockCount = await Inventory.count({
            where: {
                ...orgFilter,
                quantity: {
                    [Op.lte]: sequelize.col('minStock'),
                },
            },
        });

        res.json({
            appointmentsThisMonth,
            revenueThisMonth: revenueThisMonth || 0,
            totalPets,
            vaccinationsThisMonth,
            totalClients,
            lowStockCount,
        });
    } catch (error) {
        logger.error('Error al obtener resumen general:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAppointmentStats,
    getRevenueStats,
    getVaccinationStats,
    getInventoryStats,
    getOverviewStats,
};
