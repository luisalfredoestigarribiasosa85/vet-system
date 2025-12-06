const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireOrganization } = require('../middleware/multiTenantMiddleware');
const {
    createOrganization,
    getOrganizations,
    getCurrentOrganization,
    updateOrganization,
    inviteUser,
    getOrganizationUsage
} = require('../controllers/organizationController');

/**
 * @swagger
 * tags:
 *   name: Organizaciones
 *   description: Gestión de organizaciones y multi-tenancy
 */

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Crear nueva organización
 *     tags: [Organizaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subdomain
 *             properties:
 *               name: { type: string, example: "Clínica Veterinaria ABC" }
 *               subdomain: { type: string, example: "clinica-abc" }
 *               description: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *     responses:
 *       201:
 *         description: Organización creada exitosamente
 *       400:
 *         description: Datos inválidos o subdominio no disponible
 */
router.post('/', protect, createOrganization);

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Obtener todas las organizaciones (solo super admin)
 *     tags: [Organizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, trial] }
 *     responses:
 *       200:
 *         description: Lista de organizaciones
 */
router.get('/', protect, getOrganizations);

/**
 * @swagger
 * /api/organizations/current:
 *   get:
 *     summary: Obtener organización actual del usuario
 *     tags: [Organizaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de la organización actual
 */
router.get('/current', protect, requireOrganization, getCurrentOrganization);

/**
 * @swagger
 * /api/organizations/usage:
 *   get:
 *     summary: Obtener métricas de uso de la organización
 *     tags: [Organizaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de uso y límites
 */
router.get('/usage', protect, requireOrganization, getOrganizationUsage);

/**
 * @swagger
 * /api/organizations/{id}:
 *   put:
 *     summary: Actualizar organización
 *     tags: [Organizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               subdomain: { type: string }
 *               description: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               logo: { type: string }
 *               website: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Organización actualizada
 *       403:
 *         description: No tienes permisos para actualizar esta organización
 */
router.put('/:id', protect, updateOrganization);

/**
 * @swagger
 * /api/organizations/invite:
 *   post:
 *     summary: Invitar usuario a la organización
 *     tags: [Organizaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [member, admin], default: member }
 *     responses:
 *       200:
 *         description: Invitación enviada
 *       400:
 *         description: Usuario ya pertenece a la organización
 */
router.post('/invite', protect, requireOrganization, inviteUser);

module.exports = router;
