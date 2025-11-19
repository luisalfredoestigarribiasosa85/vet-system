const Joi = require('joi');

/**
 * Middleware de validación usando Joi
 * @param {Joi.Schema} schema - Schema de validación Joi
 * @param {string} property - Propiedad a validar (body, query, params)
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Retornar todos los errores, no solo el primero
            stripUnknown: true, // Remover campos no definidos en el schema
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors,
            });
        }

        // Reemplazar con valores validados y sanitizados
        req[property] = value;
        next();
    };
};

module.exports = { validate };
