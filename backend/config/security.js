const helmet = require('helmet');

// Configuración de CORS
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:5173',
        ];

        // Permitir requests sin origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

// Configuración de Helmet
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// Configuración de Rate Limiting
const rateLimitConfig = {
    // General API rate limit
    general: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 requests en producción, 1000 en desarrollo
        message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
        standardHeaders: true,
        legacyHeaders: false,
    },

    // Auth endpoints (más estricto)
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 intentos en producción, 50 en desarrollo
        message: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo más tarde.',
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true, // No contar requests exitosos
    },

    // API endpoints
    api: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: process.env.NODE_ENV === 'production' ? 50 : 500,
        message: 'Límite de peticiones excedido, por favor intenta de nuevo más tarde.',
        standardHeaders: true,
        legacyHeaders: false,
    },
};

module.exports = {
    corsOptions,
    helmetConfig,
    rateLimitConfig,
};
