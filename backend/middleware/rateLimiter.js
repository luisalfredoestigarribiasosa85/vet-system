const rateLimit = require('express-rate-limit');
const { rateLimitConfig } = require('../config/security');

// Rate limiter general
const generalLimiter = rateLimit(rateLimitConfig.general);

// Rate limiter para autenticación
const authLimiter = rateLimit(rateLimitConfig.auth);

// Rate limiter para API
const apiLimiter = rateLimit(rateLimitConfig.api);

// Rate limiter estricto para operaciones sensibles
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: process.env.NODE_ENV === 'production' ? 10 : 100,
    message: 'Demasiadas peticiones a este recurso, por favor intenta más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    apiLimiter,
    strictLimiter,
};
