// backend/routes/medicalRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getPetMedicalRecords, 
  createMedicalRecord, 
  uploadAttachment 
} = require('../controllers/medicalRecordController');
const multer = require('multer');

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: './uploads/medical',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// Rutas protegidas (requieren autenticación)
router.get('/pets/:petId/records', protect, getPetMedicalRecords);
router.post('/records', protect, createMedicalRecord);
router.post('/records/:recordId/attachments', protect, upload.single('file'), uploadAttachment);

module.exports = router;