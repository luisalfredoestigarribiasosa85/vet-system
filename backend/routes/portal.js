const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerClient,
  getProfile,
  getPets,
  getPetRecords,
  getPetVaccinations,
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailablePlans,
  getClientPlanHistory,
  createPlanCheckout,
  confirmPlanPayment,
  getInvoices,
  downloadInvoicePDF,
} = require('../controllers/portalController');

router.post('/register', registerClient);
router.get('/profile', protect, getProfile);

router.get('/pets', protect, getPets);
router.get('/pets/:petId/records', protect, getPetRecords);

router.get('/appointments', protect, getAppointments);
router.post('/appointments', protect, createAppointment);
router.put('/appointments/:id', protect, updateAppointment);
router.delete('/appointments/:id', protect, cancelAppointment);

router.get('/plans', protect, getAvailablePlans);
router.get('/plans/history', protect, getClientPlanHistory);
router.post('/plans/checkout', protect, createPlanCheckout);
router.post('/plans/checkout/:id/confirm', protect, confirmPlanPayment);

router.get('/pets/:petId/vaccinations', protect, getPetVaccinations);
router.get('/invoices', protect, getInvoices);
router.get('/invoices/:id/pdf', protect, downloadInvoicePDF);

module.exports = router;
