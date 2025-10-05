const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerClient,
  getProfile,
  getPets,
  getPetRecords,
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} = require('../controllers/portalController');

router.post('/register', registerClient);
router.get('/profile', protect, getProfile);
router.get('/pets', protect, getPets);
router.get('/pets/:petId/records', protect, getPetRecords);
router.get('/appointments', protect, getAppointments);
router.post('/appointments', protect, createAppointment);
router.put('/appointments/:id', protect, updateAppointment);
router.delete('/appointments/:id', protect, cancelAppointment);

module.exports = router;
