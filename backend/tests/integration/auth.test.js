const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const { sequelize, User } = require('../../models');
const bcrypt = require('bcryptjs');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Integration Tests', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await User.destroy({ where: {}, force: true });
    });

    describe('POST /api/auth/register', () => {
        it('debe registrar un nuevo usuario con datos válidos', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: 'receptionist',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('username', 'testuser');
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('debe rechazar registro con username duplicado', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            };

            // Primer registro
            await request(app).post('/api/auth/register').send(userData);

            // Segundo registro con mismo username
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...userData, email: 'different@example.com' })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('debe rechazar registro con datos inválidos', async () => {
            const invalidData = {
                username: 'ab', // Muy corto
                email: 'invalid-email',
                password: '123', // Muy corta
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidData)
                .expect(400);

            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Crear usuario de prueba
            await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
                role: 'receptionist',
            });
        });

        it('debe iniciar sesión con credenciales válidas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'password123',
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('username', 'testuser');
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('debe rechazar login con contraseña incorrecta', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        it('debe rechazar login con usuario inexistente', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'password123',
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        it('debe rechazar login con datos faltantes', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    // password faltante
                })
                .expect(400);

            expect(response.body).toHaveProperty('errors');
        });
    });

    describe('GET /api/auth/me', () => {
        let token;
        let userId;

        beforeEach(async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
                role: 'receptionist',
            });
            userId = user.id;

            const jwt = require('jsonwebtoken');
            token = jwt.sign(
                { id: userId, role: 'receptionist' },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '1h' }
            );
        });

        it('debe retornar datos del usuario autenticado', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty('username', 'testuser');
            expect(response.body).not.toHaveProperty('password');
        });

        it('debe rechazar request sin token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        it('debe rechazar request con token inválido', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });
});
