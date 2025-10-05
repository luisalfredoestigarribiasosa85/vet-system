const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { login, register, me } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, me);

module.exports = router;
