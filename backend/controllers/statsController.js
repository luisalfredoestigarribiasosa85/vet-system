const { Appointment, Invoice, Vaccination, Inventory, Pet, Client } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Obtener estadísticas de citas (últimos 6 meses)
 */
const getAppointmentStats = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const appointments = await Appointment.findAll({
            where: {
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
        console.error('Error al obtener estadísticas de citas:', error);
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
        console.error('Error al obtener estadísticas de ingresos:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener estadísticas de vacunaciones
 */
const getVaccinationStats = async (req, res) => {
    try {
        const stats = await Vaccination.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: ['status'],
            raw: true,
        });

        res.json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas de vacunaciones:', error);
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
                quantity: {
                    [Op.lte]: sequelize.col('minStock'),
                },
            },
            order: [['quantity', 'ASC']],
            limit: 5,
        });

        res.json(lowStock);
    } catch (error) {
        console.error('Error al obtener estadísticas de inventario:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener resumen general (overview)
 */
const getOverviewStats = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Citas del mes
        const appointmentsThisMonth = await Appointment.count({
            where: {
                date: {
                    [Op.gte]: firstDayOfMonth,
                },
            },
        });

        // Ingresos del mes
        const revenueThisMonth = await Invoice.sum('total', {
            where: {
                issueDate: {
                    [Op.gte]: firstDayOfMonth,
                },
                status: 'pagado',
            },
        });

        // Total de mascotas
        const totalPets = await Pet.count();

        // Vacunas aplicadas este mes
        const vaccinationsThisMonth = await Vaccination.count({
            where: {
                applicationDate: {
                    [Op.gte]: firstDayOfMonth,
                },
            },
        });

        // Total de clientes
        const totalClients = await Client.count();

        // Productos con stock bajo
        const lowStockCount = await Inventory.count({
            where: {
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
        console.error('Error al obtener resumen general:', error);
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
