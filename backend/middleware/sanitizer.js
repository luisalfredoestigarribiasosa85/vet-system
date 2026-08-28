// NOTA DE COMPATIBILIDAD CON EXPRESS 5: tanto express-mongo-sanitize como
// xss-clean intentan REASIGNAR req.query, que en Express 5 es un getter de
// solo lectura ("TypeError: Cannot set property query"). Por eso ambos fueron
// reemplazados por esta sanitización propia, que muta en el lugar req.body y
// req.params (nunca req.query ni req.headers).
// - Limpieza defensiva de operadores de inyección ($gt, __proto__, "..")
//   (la BD es PostgreSQL con Sequelize parametrizado; defensa en profundidad)
// - Filtrado dirigido de patrones XSS activos (<script>, handlers on*=,
//   javascript:) sin corromper datos legítimos con codificación agresiva.

// Detecta claves peligrosas: operadores de MongoDB ($gt, $ne, $where, ...)
// y rutas de prototipo anidadas (constructor.prototype / "..")
const logger = require('../config/logger');
const DANGEROUS_KEY = /^\$/;

const isDangerousKey = (key) => DANGEROUS_KEY.test(key) || key === '__proto__' || key === 'constructor' || key.includes('..');

// Patrones XSS activos que se eliminan de los strings
const XSS_PATTERNS = [
    /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, // bloques <script>...</script>
    /<\/?(script|iframe|object|embed|link|meta)\b[^>]*>/gi, // tags peligrosos sueltos
    /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, // handlers de eventos (onclick=...)
    /javascript\s*:/gi, // URIs javascript:
];

const cleanString = (value) => {
    let result = value;
    XSS_PATTERNS.forEach((pattern) => {
        result = result.replace(pattern, '');
    });
    return result;
};

/**
 * Limpia un objeto en profundidad eliminando claves peligrosas y patrones XSS,
 * mutando el objeto original (sin reasignar req.query/req.params).
 */
const sanitizeInPlace = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            if (typeof item === 'string') {
                obj[index] = cleanString(item);
            } else {
                sanitizeInPlace(item);
            }
        });
        return obj;
    }

    Object.keys(obj).forEach((key) => {
        if (isDangerousKey(key)) {
            delete obj[key];
        } else if (typeof obj[key] === 'string') {
            obj[key] = cleanString(obj[key]);
        } else if (obj[key] && typeof obj[key] === 'object') {
            sanitizeInPlace(obj[key]);
        }
    });

    return obj;
};

/**
 * Middleware de sanitización defensiva sobre body y params
 */
const sanitizeBodyAndParams = (req, res, next) => {
    try {
        if (req.body && typeof req.body === 'object') {
            sanitizeInPlace(req.body);
        }
        if (req.params && typeof req.params === 'object') {
            sanitizeInPlace(req.params);
        }
        next();
    } catch (error) {
        logger.error('Error en sanitización de inputs:', error);
        next();
    }
};

/**
 * Sanitización de inputs para prevenir inyecciones
 */
const sanitizeInputs = [
    // Limpieza defensiva de inyecciones NoSQL/prototype + XSS sobre body y params
    sanitizeBodyAndParams,
];



/**
 * Sanitizar manualmente strings
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;

    // Remover caracteres peligrosos
    return str
        .replace(/[<>]/g, '') // Remover < y >
        .trim();
};

/**
 * Sanitizar objeto recursivamente
 */
const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const sanitized = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            sanitized[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object') {
            sanitized[key] = sanitizeObject(obj[key]);
        } else {
            sanitized[key] = obj[key];
        }
    }
    return sanitized;
};

module.exports = {
    sanitizeInputs,
    sanitizeString,
    sanitizeObject,
};
