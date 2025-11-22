const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const {
    getPetRecords,
    createRecord,
    uploadImage,
    deleteAttachment,
    getRecordById
} = require('../controllers/medicalRecordsController');

/**
 * @swagger
 * tags:
 *   name: Medical Records
 *   description: Gestión de registros médicos
 */

/**
 * @swagger
 * /api/medical/pets/{petId}/records:
 *   get:
 *     summary: Obtener registros médicos de una mascota
 *     tags: [Medical Records]
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
 *         description: Lista de registros médicos
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/pets/:petId/records', protect, getPetRecords);

/**
 * @swagger
 * /api/medical/records:
 *   post:
 *     summary: Crear un nuevo registro médico
 *     tags: [Medical Records]
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
 *               - diagnosis
 *             properties:
 *               petId:
 *                 type: integer
 *               diagnosis:
 *                 type: string
 *               treatment:
 *                 type: string
 *               weight:
 *                 type: number
 *               temperature:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro médico creado
 */
router.post('/records', protect, createRecord);

/**
 * @swagger
 * /api/medical/records/{recordId}:
 *   get:
 *     summary: Obtener un registro médico por ID
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro médico
 *     responses:
 *       200:
 *         description: Registro médico encontrado
 *       404:
 *         description: Registro no encontrado
 */
router.get('/records/:id', protect, getRecordById);

/**
 * @swagger
 * /api/medical/records/{recordId}/upload:
 *   post:
 *     summary: Subir imagen a un registro médico
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro médico
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen o PDF (máx 10MB)
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *       400:
 *         description: No se proporcionó archivo
 *       404:
 *         description: Registro no encontrado
 */
router.post('/records/:recordId/upload', protect, upload.single('image'), uploadImage);

/**
 * @swagger
 * /api/medical/records/{recordId}/attachments/{attachmentId}:
 *   delete:
 *     summary: Eliminar archivo adjunto de un registro médico
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro médico
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo adjunto
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 *       404:
 *         description: Registro o archivo no encontrado
 */
router.delete('/records/:recordId/attachments/:attachmentId', protect, deleteAttachment);

module.exports = router;
