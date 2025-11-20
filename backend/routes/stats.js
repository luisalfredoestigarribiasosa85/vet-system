const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAppointmentStats,
    getRevenueStats,
    getVaccinationStats,
    getInventoryStats,
    getOverviewStats,
} = require('../controllers/statsController');

/**
 * @swagger
 * tags:
 *   name: Estadísticas
 *   description: Estadísticas y métricas del sistema
 */

/**
 * @swagger
 * /api/stats/appointments:
 *   get:
 *     summary: Obtener estadísticas de citas (últimos 6 meses)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de citas por mes y estado
 */
router.get('/appointments', protect, getAppointmentStats);

/**
 * @swagger
 * /api/stats/revenue:
 *   get:
 *     summary: Obtener estadísticas de ingresos (últimos 6 meses)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ingresos mensuales
 */
router.get('/revenue', protect, getRevenueStats);

/**
 * @swagger
 * /api/stats/vaccinations:
 *   get:
 *     summary: Obtener estadísticas de vacunaciones
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Distribución de vacunas por estado
 */
router.get('/vaccinations', protect, getVaccinationStats);

/**
 * @swagger
 * /api/stats/inventory:
 *   get:
 *     summary: Obtener productos con stock bajo
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top 5 productos con stock bajo
 */
router.get('/inventory', protect, getInventoryStats);

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Obtener resumen general del sistema
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas generales (citas, ingresos, mascotas, etc.)
 */
router.get('/overview', protect, getOverviewStats);

module.exports = router;
