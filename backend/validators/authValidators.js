const Joi = require('joi');

// Schema para registro
const registerSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
            'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
            'string.max': 'El nombre de usuario no puede tener más de 30 caracteres',
            'any.required': 'El nombre de usuario es requerido',
        }),

    password: Joi.string()
        .min(6)
        .max(100)
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'string.max': 'La contraseña no puede tener más de 100 caracteres',
            'any.required': 'La contraseña es requerida',
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Debe proporcionar un email válido',
            'any.required': 'El email es requerido',
        }),

    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede tener más de 100 caracteres',
            'any.required': 'El nombre es requerido',
        }),

    role: Joi.string()
        .valid('admin', 'veterinarian', 'receptionist', 'client')
        .default('receptionist')
        .messages({
            'any.only': 'El rol debe ser admin, veterinarian, receptionist o client',
        }),
});

// Schema para login
const loginSchema = Joi.object({
    username: Joi.string()
        .required()
        .messages({
            'any.required': 'El nombre de usuario es requerido',
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'La contraseña es requerida',
        }),
});

// Schema para registro de portal (cliente)
const portalRegisterSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
            'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
            'string.max': 'El nombre de usuario no puede tener más de 30 caracteres',
            'any.required': 'El nombre de usuario es requerido',
        }),

    password: Joi.string()
        .min(6)
        .max(100)
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'string.max': 'La contraseña no puede tener más de 100 caracteres',
            'any.required': 'La contraseña es requerida',
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Debe proporcionar un email válido',
            'any.required': 'El email es requerido',
        }),

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

    address: Joi.string()
        .min(5)
        .max(200)
        .allow('', null)
        .messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede tener más de 200 caracteres',
        }),
});

module.exports = {
    registerSchema,
    loginSchema,
    portalRegisterSchema,
};
