const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sistema Veterinaria API',
            version: '1.0.0',
            description: 'API REST para sistema de gestión veterinaria con autenticación JWT, gestión de clientes, mascotas, citas, inventario y facturación.',
            contact: {
                name: 'Soporte Técnico',
                email: 'soporte@veterinaria.com',
            },
            license: {
                name: 'ISC',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Servidor de Desarrollo',
            },
            {
                url: 'https://api.veterinaria.com',
                description: 'Servidor de Producción',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Ingresa el token JWT obtenido del endpoint /api/auth/login',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        username: { type: 'string', example: 'admin' },
                        email: { type: 'string', example: 'admin@veterinaria.com' },
                        name: { type: 'string', example: 'Administrador' },
                        role: { type: 'string', enum: ['admin', 'veterinario', 'recepcionista', 'cliente'], example: 'admin' },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Client: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Juan Pérez' },
                        phone: { type: 'string', example: '0981-123456' },
                        email: { type: 'string', example: 'juan@email.com' },
                        address: { type: 'string', example: 'Av. Principal 123, Asunción' },
                        userId: { type: 'integer', example: 1, nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Pet: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Firulais' },
                        species: { type: 'string', example: 'Perro' },
                        breed: { type: 'string', example: 'Labrador' },
                        age: { type: 'integer', example: 3 },
                        weight: { type: 'number', format: 'float', example: 25.5 },
                        color: { type: 'string', example: 'Dorado' },
                        gender: { type: 'string', example: 'Macho' },
                        clientId: { type: 'integer', example: 1 },
                        photoUrl: { type: 'string', example: '/uploads/pets/firulais.jpg' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Appointment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        petId: { type: 'integer', example: 1 },
                        vetId: { type: 'integer', example: 2 },
                        date: { type: 'string', format: 'date', example: '2025-11-20' },
                        time: { type: 'string', example: '10:00' },
                        durationMinutes: { type: 'integer', example: 30 },
                        reason: { type: 'string', example: 'Consulta general' },
                        status: { type: 'string', enum: ['programada', 'confirmada', 'completada', 'cancelada'], example: 'programada' },
                        notes: { type: 'string', example: 'Revisar vacunas' },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                MedicalRecord: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        petId: { type: 'integer', example: 1 },
                        vetId: { type: 'integer', example: 2 },
                        date: { type: 'string', format: 'date', example: '2025-11-18' },
                        diagnosis: { type: 'string', example: 'Infección leve' },
                        treatment: { type: 'string', example: 'Antibióticos por 7 días' },
                        notes: { type: 'string', example: 'Seguimiento en 1 semana' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Inventory: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Vacuna Antirrábica' },
                        category: { type: 'string', example: 'Medicamentos' },
                        quantity: { type: 'integer', example: 50 },
                        minStock: { type: 'integer', example: 10 },
                        price: { type: 'number', format: 'float', example: 50000 },
                        supplier: { type: 'string', example: 'Farmacia Veterinaria SA' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Invoice: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        clientId: { type: 'integer', example: 1 },
                        date: { type: 'string', format: 'date', example: '2025-11-18' },
                        total: { type: 'number', format: 'float', example: 150000 },
                        status: { type: 'string', enum: ['pendiente', 'pagada', 'cancelada'], example: 'pagada' },
                        items: { type: 'array', items: { type: 'object' } },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Plan: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Plan Básico' },
                        description: { type: 'string', example: 'Incluye consultas mensuales' },
                        price: { type: 'number', format: 'float', example: 200000 },
                        durationMonths: { type: 'integer', example: 12 },
                        benefits: { type: 'array', items: { type: 'string' } },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error al procesar la solicitud' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string', example: 'email' },
                                    message: { type: 'string', example: 'Email inválido' },
                                },
                            },
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'admin' },
                        password: { type: 'string', example: 'admin123' },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: { $ref: '#/components/schemas/User' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Archivos que contienen anotaciones de Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
