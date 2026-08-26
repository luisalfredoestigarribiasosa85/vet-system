const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireOrganization } = require('../middleware/multiTenantMiddleware');
const {
  getPlanPurchases,
  updatePlanPurchaseStatus,
} = require('../controllers/paymentController');

// Aislamiento multi-tenant: exige organización activa para pagos de planes
router.use(protect, authorize('admin', 'veterinario', 'recepcionista'), requireOrganization);

router.get('/plans', getPlanPurchases);
router.patch('/plans/:id', updatePlanPurchaseStatus);

module.exports = router;
