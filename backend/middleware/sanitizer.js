const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

/**
 * Sanitización de inputs para prevenir inyecciones
 */
const sanitizeInputs = [
    // Prevenir NoSQL injection
    mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
            console.warn(`Intento de NoSQL injection detectado en ${key}`);
        },
    }),

    // Prevenir XSS
    xss(),
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
