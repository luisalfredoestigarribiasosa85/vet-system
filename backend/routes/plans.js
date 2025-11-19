const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');

router.use(protect, authorize('admin', 'veterinario', 'recepcionista'));

router.get('/', getPlans);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
