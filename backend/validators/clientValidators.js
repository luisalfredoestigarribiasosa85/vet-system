const Joi = require('joi');

// Schema para crear cliente
const createClientSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede tener más de 100 caracteres',
            'any.required': 'El nombre es requerido',
        }),

    phone: Joi.string()
        .pattern(/^[0-9\-\+\(\)\s]+$/)
        .min(6)
        .max(20)
        .required()
        .messages({
            'string.pattern.base': 'El teléfono solo puede contener números y caracteres +, -, (, ), espacios',
            'string.min': 'El teléfono debe tener al menos 6 caracteres',
            'string.max': 'El teléfono no puede tener más de 20 caracteres',
            'any.required': 'El teléfono es requerido',
        }),

    email: Joi.string()
        .email()
        .allow('', null)
        .messages({
            'string.email': 'Debe proporcionar un email válido',
        }),

    address: Joi.string()
        .min(5)
        .max(200)
        .allow('', null)
        .messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede tener más de 200 caracteres',
        }),
});

// Schema para actualizar cliente
const updateClientSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede tener más de 100 caracteres',
        }),

    phone: Joi.string()
        .pattern(/^[0-9\-\+\(\)\s]+$/)
        .min(6)
        .max(20)
        .messages({
            'string.pattern.base': 'El teléfono solo puede contener números y caracteres +, -, (, ), espacios',
            'string.min': 'El teléfono debe tener al menos 6 caracteres',
            'string.max': 'El teléfono no puede tener más de 20 caracteres',
        }),

    email: Joi.string()
        .email()
        .allow('', null)
        .messages({
            'string.email': 'Debe proporcionar un email válido',
        }),

    address: Joi.string()
        .min(5)
        .max(200)
        .allow('', null)
        .messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede tener más de 200 caracteres',
        }),
}).min(1); // Al menos un campo debe ser proporcionado

module.exports = {
    createClientSchema,
    updateClientSchema,
};
