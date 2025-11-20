const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getVaccinationsByPet,
    createVaccination,
    updateVaccination,
    deleteVaccination,
    getUpcomingVaccinations,
    getOverdueVaccinations,
    generatePDF,
} = require('../controllers/vaccinationController');

/**
 * @swagger
 * tags:
 *   name: Vacunas
 *   description: Gestión de vacunación de mascotas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Vaccination:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         petId:
 *           type: integer
 *           example: 1
 *         vaccineName:
 *           type: string
 *           example: Antirrábica
 *         vaccineType:
 *           type: string
 *           enum: [obligatoria, opcional, refuerzo]
 *           example: obligatoria
 *         applicationDate:
 *           type: string
 *           format: date
 *           example: 2025-11-18
 *         nextDoseDate:
 *           type: string
 *           format: date
 *           example: 2026-11-18
 *         vetId:
 *           type: integer
 *           example: 2
 *         batchNumber:
 *           type: string
 *           example: LOT-2025-001
 *         manufacturer:
 *           type: string
 *           example: Laboratorio Veterinario SA
 *         notes:
 *           type: string
 *           example: Sin reacciones adversas
 *         status:
 *           type: string
 *           enum: [aplicada, próxima, vencida]
 *           example: aplicada
 *         doseNumber:
 *           type: integer
 *           example: 1
 *         weight:
 *           type: number
 *           format: float
 *           example: 25.5
 */

/**
 * @swagger
 * /api/vaccinations/pet/{petId}:
 *   get:
 *     summary: Obtener vacunas de una mascota
 *     tags: [Vacunas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Lista de vacunas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vaccination'
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/pet/:petId', protect, getVaccinationsByPet);

/**
 * @swagger
 * /api/vaccinations:
 *   post:
 *     summary: Registrar nueva vacuna
 *     tags: [Vacunas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - vaccineName
 *               - applicationDate
 *             properties:
 *               petId:
 *                 type: integer
 *                 example: 1
 *               vaccineName:
 *                 type: string
 *                 example: Antirrábica
 *               vaccineType:
 *                 type: string
 *                 enum: [obligatoria, opcional, refuerzo]
 *                 example: obligatoria
 *               applicationDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-11-18
 *               vetId:
 *                 type: integer
 *                 example: 2
 *               batchNumber:
 *                 type: string
 *                 example: LOT-2025-001
 *               manufacturer:
 *                 type: string
 *                 example: Laboratorio Veterinario SA
 *               notes:
 *                 type: string
 *                 example: Sin reacciones adversas
 *               doseNumber:
 *                 type: integer
 *                 example: 1
 *               weight:
 *                 type: number
 *                 example: 25.5
 *     responses:
 *       201:
 *         description: Vacuna registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vaccination'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Mascota no encontrada
 */
router.post('/', protect, createVaccination);

/**
 * @swagger
 * /api/vaccinations/{id}:
 *   put:
 *     summary: Actualizar vacuna
 *     tags: [Vacunas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vaccineName:
 *                 type: string
 *               vaccineType:
 *                 type: string
 *               applicationDate:
 *                 type: string
 *                 format: date
 *               batchNumber:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               notes:
 *                 type: string
 *               doseNumber:
 *                 type: integer
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Vacuna actualizada
 *       404:
 *         description: Vacuna no encontrada
 *   delete:
 *     summary: Eliminar vacuna
 *     tags: [Vacunas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vacuna eliminada
 *       404:
 *         description: Vacuna no encontrada
 */
router.put('/:id', protect, updateVaccination);
router.delete('/:id', protect, deleteVaccination);

/**
 * @swagger
 * /api/vaccinations/upcoming:
 *   get:
 *     summary: Obtener vacunas próximas a vencer (30 días)
 *     tags: [Vacunas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vacunas próximas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vaccination'
 */
router.get('/upcoming', protect, getUpcomingVaccinations);

/**
 * @swagger
 * /api/vaccinations/overdue:
 *   get:
 *     summary: Obtener vacunas vencidas
 *     tags: [Vacunas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vacunas vencidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vaccination'
 */
router.get('/overdue', protect, getOverdueVaccinations);

/**
 * @swagger
 * /api/vaccinations/pet/{petId}/pdf:
 *   get:
 *     summary: Generar carnet de vacunación en PDF
 *     tags: [Vacunas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/pet/:petId/pdf', protect, generatePDF);

module.exports = router;
