const { User } = require('../../models');
const { sequelize } = require('../../config/database');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await User.destroy({ where: {}, force: true });
    });

    describe('Validaciones', () => {
        it('debe crear un usuario con datos válidos', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
                role: 'receptionist',
            };

            const user = await User.create(userData);

            expect(user.id).toBeDefined();
            expect(user.username).toBe('testuser');
            expect(user.email).toBe('test@example.com');
            expect(user.role).toBe('receptionist');
            expect(user.isActive).toBe(true);
        });

        it('debe rechazar usuario sin username', async () => {
            const userData = {
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        it('debe rechazar usuario sin email', async () => {
            const userData = {
                username: 'testuser',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        it('debe rechazar username duplicado', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
            };

            await User.create(userData);

            const duplicateUser = {
                ...userData,
                email: 'different@example.com',
            };

            await expect(User.create(duplicateUser)).rejects.toThrow();
        });

        it('debe rechazar email duplicado', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
            };

            await User.create(userData);

            const duplicateUser = {
                ...userData,
                username: 'differentuser',
            };

            await expect(User.create(duplicateUser)).rejects.toThrow();
        });
    });

    describe('Métodos', () => {
        it('debe excluir password en toJSON', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
                role: 'receptionist',
            });

            const json = user.toJSON();
            expect(json).not.toHaveProperty('password');
            expect(json).toHaveProperty('username');
            expect(json).toHaveProperty('email');
        });

        it('debe tener role por defecto como receptionist', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
            });

            expect(user.role).toBe('receptionist');
        });

        it('debe tener isActive por defecto como true', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
            });

            expect(user.isActive).toBe(true);
        });
    });

    describe('Soft Delete', () => {
        it('debe marcar usuario como inactivo en vez de eliminarlo', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
            });

            await user.update({ isActive: false });

            const foundUser = await User.findByPk(user.id);
            expect(foundUser.isActive).toBe(false);
        });
    });
});
