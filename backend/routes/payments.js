const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPlanPurchases,
  updatePlanPurchaseStatus,
} = require('../controllers/paymentController');

router.use(protect, authorize('admin', 'veterinario', 'recepcionista'));

router.get('/plans', getPlanPurchases);
router.patch('/plans/:id', updatePlanPurchaseStatus);

module.exports = router;
