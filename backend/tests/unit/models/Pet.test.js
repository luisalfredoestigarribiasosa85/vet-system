const { Pet, Client } = require('../../models');
const { sequelize } = require('../../config/database');

describe('Pet Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await Pet.destroy({ where: {}, force: true });
        await Client.destroy({ where: {}, force: true });
    });

    describe('Validaciones', () => {
        let testClient;

        beforeEach(async () => {
            testClient = await Client.create({
                name: 'Test Owner',
                phone: '0981-123456',
                email: 'owner@example.com',
            });
        });

        it('debe crear una mascota con datos válidos', async () => {
            const petData = {
                name: 'Firulais',
                species: 'Perro',
                breed: 'Labrador',
                age: 3,
                weight: 25.5,
                clientId: testClient.id,
            };

            const pet = await Pet.create(petData);

            expect(pet.id).toBeDefined();
            expect(pet.name).toBe('Firulais');
            expect(pet.species).toBe('Perro');
            expect(pet.breed).toBe('Labrador');
            expect(pet.age).toBe(3);
            expect(pet.weight).toBe(25.5);
            expect(pet.clientId).toBe(testClient.id);
        });

        it('debe rechazar mascota sin nombre', async () => {
            const petData = {
                species: 'Perro',
                clientId: testClient.id,
            };

            await expect(Pet.create(petData)).rejects.toThrow();
        });

        it('debe rechazar mascota sin species', async () => {
            const petData = {
                name: 'Firulais',
                clientId: testClient.id,
            };

            await expect(Pet.create(petData)).rejects.toThrow();
        });

        it('debe rechazar mascota sin clientId', async () => {
            const petData = {
                name: 'Firulais',
                species: 'Perro',
            };

            await expect(Pet.create(petData)).rejects.toThrow();
        });

        it('debe permitir campos opcionales vacíos', async () => {
            const petData = {
                name: 'Firulais',
                species: 'Perro',
                clientId: testClient.id,
            };

            const pet = await Pet.create(petData);

            expect(pet.breed).toBeNull();
            expect(pet.age).toBeNull();
            expect(pet.weight).toBeNull();
            expect(pet.color).toBeNull();
        });
    });

    describe('Relaciones', () => {
        it('debe asociarse correctamente con Client', async () => {
            const client = await Client.create({
                name: 'Test Owner',
                phone: '0981-123456',
                email: 'owner@example.com',
            });

            const pet = await Pet.create({
                name: 'Firulais',
                species: 'Perro',
                clientId: client.id,
            });

            const petWithOwner = await Pet.findByPk(pet.id, {
                include: [{ model: Client, as: 'owner' }],
            });

            expect(petWithOwner.owner).toBeDefined();
            expect(petWithOwner.owner.name).toBe('Test Owner');
        });
    });
});
