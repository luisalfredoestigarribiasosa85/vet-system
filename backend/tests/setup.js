require('dotenv').config({ path: '.env.test' });
const { sequelize } = require('../config/database');

// Setup global test environment
beforeAll(async () => {
    // Conectar a base de datos de prueba
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos de prueba establecida');
    } catch (error) {
        console.error('❌ Error conectando a base de datos de prueba:', error);
        throw error;
    }
});

// Limpiar después de cada test
afterEach(async () => {
    // Limpiar datos de prueba si es necesario
    // await sequelize.truncate({ cascade: true });
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
    await sequelize.close();
    console.log('✅ Conexión a base de datos cerrada');
});

// Helper functions para tests
global.testHelpers = {
    // Crear usuario de prueba
    createTestUser: async (userData = {}) => {
        const { User } = require('../models');
        const bcrypt = require('bcryptjs');

        const defaultData = {
            username: 'testuser',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            name: 'Test User',
            role: 'receptionist',
            ...userData,
        };

        return await User.create(defaultData);
    },

    // Crear cliente de prueba
    createTestClient: async (clientData = {}) => {
        const { Client } = require('../models');

        const defaultData = {
            name: 'Test Client',
            phone: '0981-123456',
            email: 'client@example.com',
            address: 'Test Address 123',
            ...clientData,
        };

        return await Client.create(defaultData);
    },

    // Generar token JWT de prueba
    generateTestToken: (userId, role = 'receptionist') => {
        const jwt = require('jsonwebtoken');
        return jwt.sign(
            { id: userId, role },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
    },
};
