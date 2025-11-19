const Joi = require('joi');

// Schema para crear cita
const createAppointmentSchema = Joi.object({
    petId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID de la mascota debe ser un número',
            'number.integer': 'El ID de la mascota debe ser un número entero',
            'number.positive': 'El ID de la mascota debe ser positivo',
            'any.required': 'El ID de la mascota es requerido',
        }),

    vetId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del veterinario debe ser un número',
            'number.integer': 'El ID del veterinario debe ser un número entero',
            'number.positive': 'El ID del veterinario debe ser positivo',
            'any.required': 'El ID del veterinario es requerido',
        }),

    date: Joi.date()
        .iso()
        .min('now')
        .required()
        .messages({
            'date.base': 'La fecha debe ser válida',
            'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
            'date.min': 'La fecha no puede ser en el pasado',
            'any.required': 'La fecha es requerida',
        }),

    time: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.pattern.base': 'La hora debe estar en formato HH:MM (24 horas)',
            'any.required': 'La hora es requerida',
        }),

    durationMinutes: Joi.number()
        .integer()
        .min(15)
        .max(480)
        .default(30)
        .messages({
            'number.base': 'La duración debe ser un número',
            'number.integer': 'La duración debe ser un número entero',
            'number.min': 'La duración mínima es 15 minutos',
            'number.max': 'La duración máxima es 480 minutos (8 horas)',
        }),

    reason: Joi.string()
        .min(3)
        .max(500)
        .allow('', null)
        .messages({
            'string.min': 'El motivo debe tener al menos 3 caracteres',
            'string.max': 'El motivo no puede tener más de 500 caracteres',
        }),

    notes: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
            'string.max': 'Las notas no pueden tener más de 1000 caracteres',
        }),
});

// Schema para actualizar cita
const updateAppointmentSchema = Joi.object({
    petId: Joi.number()
        .integer()
        .positive()
        .messages({
            'number.base': 'El ID de la mascota debe ser un número',
            'number.integer': 'El ID de la mascota debe ser un número entero',
            'number.positive': 'El ID de la mascota debe ser positivo',
        }),

    vetId: Joi.number()
        .integer()
        .positive()
        .messages({
            'number.base': 'El ID del veterinario debe ser un número',
            'number.integer': 'El ID del veterinario debe ser un número entero',
            'number.positive': 'El ID del veterinario debe ser positivo',
        }),

    date: Joi.date()
        .iso()
        .messages({
            'date.base': 'La fecha debe ser válida',
            'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
        }),

    time: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .messages({
            'string.pattern.base': 'La hora debe estar en formato HH:MM (24 horas)',
        }),

    durationMinutes: Joi.number()
        .integer()
        .min(15)
        .max(480)
        .messages({
            'number.base': 'La duración debe ser un número',
            'number.integer': 'La duración debe ser un número entero',
            'number.min': 'La duración mínima es 15 minutos',
            'number.max': 'La duración máxima es 480 minutos (8 horas)',
        }),

    reason: Joi.string()
        .min(3)
        .max(500)
        .allow('', null)
        .messages({
            'string.min': 'El motivo debe tener al menos 3 caracteres',
            'string.max': 'El motivo no puede tener más de 500 caracteres',
        }),

    notes: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
            'string.max': 'Las notas no pueden tener más de 1000 caracteres',
        }),

    status: Joi.string()
        .valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')
        .messages({
            'any.only': 'El estado debe ser: scheduled, confirmed, completed, cancelled o no-show',
        }),
}).min(1); // Al menos un campo debe ser proporcionado

// Schema para query de disponibilidad
const availabilityQuerySchema = Joi.object({
    vetId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del veterinario debe ser un número',
            'number.integer': 'El ID del veterinario debe ser un número entero',
            'number.positive': 'El ID del veterinario debe ser positivo',
            'any.required': 'El ID del veterinario es requerido',
        }),

    date: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'La fecha debe ser válida',
            'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
            'any.required': 'La fecha es requerida',
        }),
});

module.exports = {
    createAppointmentSchema,
    updateAppointmentSchema,
    availabilityQuerySchema,
};
