const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireOrganization } = require('../middleware/multiTenantMiddleware');
const {
    getPlans,
    getPlanById,
    createCheckoutSession,
    handleWebhook,
    cancelSubscription,
    reactivateSubscription
} = require('../controllers/subscriptionController');

/**
 * @swagger
 * tags:
 *   name: Suscripciones
 *   description: Gestión de planes y suscripciones SaaS
 */

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Obtener todos los planes disponibles
 *     tags: [Suscripciones]
 *     responses:
 *       200:
 *         description: Lista de planes
 */
router.get('/plans', getPlans);

/**
 * @swagger
 * /api/subscriptions/plans/{id}:
 *   get:
 *     summary: Obtener plan por ID
 *     tags: [Suscripciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Información del plan
 *       404:
 *         description: Plan no encontrado
 */
router.get('/plans/:id', getPlanById);

/**
 * @swagger
 * /api/subscriptions/checkout:
 *   post:
 *     summary: Crear sesión de checkout de Stripe
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId: { type: integer }
 *               successUrl: { type: string }
 *               cancelUrl: { type: string }
 *     responses:
 *       200:
 *         description: Sesión de checkout creada
 *       400:
 *         description: Plan no encontrado o ya tiene suscripción activa
 */
router.post('/checkout', protect, requireOrganization, createCheckoutSession);

/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancelar suscripción
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suscripción cancelada
 *       404:
 *         description: Suscripción no encontrada
 */
router.post('/cancel', protect, requireOrganization, cancelSubscription);

/**
 * @swagger
 * /api/subscriptions/reactivate:
 *   post:
 *     summary: Reactivar suscripción
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suscripción reactivada
 */
router.post('/reactivate', protect, requireOrganization, reactivateSubscription);

/**
 * @swagger
 * /api/subscriptions/webhook:
 *   post:
 *     summary: Webhook de proveedor de pagos (no requiere autenticación)
 *     tags: [Suscripciones]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook procesado
 */
// El webhook puede recibir JSON o raw según el proveedor
// Webhook puede recibir JSON (PayU) o raw (Stripe)
// Usamos raw para mantener compatibilidad con Stripe, pero también aceptamos JSON
router.post('/webhook', express.raw({ type: '*/*' }), (req, res, next) => {
    // Convertir a JSON si es necesario para PayU
    try {
        req.body = JSON.parse(req.body.toString());
    } catch (e) {
        // Si no es JSON, mantener como está (Stripe usa raw)
    }
    next();
}, handleWebhook);

module.exports = router;
