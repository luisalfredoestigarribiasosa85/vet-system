require('dotenv').config();
const { sequelize } = require('../config/database');
const { Client: PgClient } = require('pg');
const {
  User,
  Client,
  Pet,
  Plan,
  Vaccination,
  MedicalRecord,
  Organization,
} = require('../models');
const { seedDefaultServices } = require('./seed-default-services');
const { seedDefaultInventory } = require('./seed-default-inventory');

// Fechas relativas para que los dashboards de demo siempre tengan datos recientes
const monthsAgo = (months) => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
};

const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const createDatabaseIfMissing = async () => {
  const { database, username, password, host, port } = sequelize.config;

  if (!database || !username || !password || !host) {
    throw new Error(
      'Faltan credenciales de base de datos para crear la base automáticamente. ' +
      'Revisa backend/.env.'
    );
  }

  const adminClient = new PgClient({
    host,
    port: port ? Number(port) : 5432,
    user: username,
    password,
    database: 'postgres'
  });

  await adminClient.connect();

  try {
    const databaseExists = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database]
    );

    if (databaseExists.rowCount === 0) {
      const safeDatabaseName = database.replace(/"/g, '""');
      await adminClient.query(`CREATE DATABASE "${safeDatabaseName}"`);
      console.log(`🗄️  Base de datos "${database}" creada correctamente`);
    }
  } finally {
    await adminClient.end();
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de base de datos...');

    await createDatabaseIfMissing();

    // Limpiar base de datos
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada');

    // Crear organización base
    const organization = await Organization.create({
      name: 'Veterinaria Demo',
      subdomain: 'veterinaria-demo',
      description: 'Organización de demostración para la base inicial',
      isActive: true,
    });

    console.log('🏢 Organización base creada');

    // Catálogo estándar de servicios para facturación
    await seedDefaultServices(organization.id);
    console.log('🧾 Servicios por defecto creados');

    // Stock inicial de inventario
    await seedDefaultInventory(organization.id);
    console.log('📦 Inventario inicial creado');

    // Crear usuarios
    const users = await User.bulkCreate([
      {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        email: 'admin@veterinaria.com',
        role: 'admin',
        organizationId: organization.id,
        organizationRole: 'owner',
        isOwner: true
      },
      {
        username: 'drcarlos',
        password: 'vet123',
        name: 'Dr. Carlos Ramírez',
        email: 'carlos@veterinaria.com',
        role: 'veterinario',
        organizationId: organization.id
      },
      {
        username: 'draana',
        password: 'vet123',
        name: 'Dra. Ana Torres',
        email: 'ana@veterinaria.com',
        role: 'veterinario',
        organizationId: organization.id
      },
      {
        username: 'laura',
        password: 'recep123',
        name: 'Laura Martínez',
        email: 'laura@veterinaria.com',
        role: 'recepcionista',
        organizationId: organization.id
      }
    ], { individualHooks: true });

    console.log('👥 Usuarios creados');

    // Crear clientes
    const clients = await Client.bulkCreate([
      {
        organizationId: organization.id,
        name: 'Maria Gonzalez',
        phone: '0981-123456',
        email: 'maria@email.com',
        address: 'Av. España 1234, Asunción'
      },
      {
        organizationId: organization.id,
        name: 'Juan Perez',
        phone: '0982-234567',
        email: 'juan@email.com',
        address: 'Mcal. López 567, Asunción'
      },
      {
        organizationId: organization.id,
        name: 'Pedro Martinez',
        phone: '0983-345678',
        email: 'pedro@email.com',
        address: 'Gral. Santos 890, Luque'
      }
    ]);

    console.log('👨‍👩‍👧‍👦 Clientes creados');

    // Crear mascotas
    const pets = await Pet.bulkCreate([
      {
        clientId: clients[0].id,
        organizationId: organization.id,
        name: 'Max',
        species: 'Perro',
        breed: 'Golden Retriever',
        age: 3,
        weight: 28.5,
        gender: 'macho',
        color: 'Dorado',
        medicalHistory: 'Alergia a pollo',
        vaccines: [
          { name: 'Rabia', date: '2024-03-15' },
          { name: 'Polivalente', date: '2024-03-15' }
        ]
      },
      {
        clientId: clients[0].id,
        organizationId: organization.id,
        name: 'Luna',
        species: 'Gato',
        breed: 'Siamés',
        age: 2,
        weight: 4.2,
        gender: 'hembra',
        color: 'Crema y marron',
        medicalHistory: 'Sano',
        vaccines: [
          { name: 'Rabia', date: '2024-05-20' },
          { name: 'Triple Felina', date: '2024-05-20' }
        ]
      },
      {
        clientId: clients[1].id,
        organizationId: organization.id,
        name: 'Rocky',
        species: 'Perro',
        breed: 'Bulldog',
        age: 5,
        weight: 22.0,
        gender: 'macho',
        color: 'Blanco y marron',
        medicalHistory: 'Problemas respiratorios leves',
        allergies: 'Polen',
        vaccines: [
          { name: 'Rabia', date: '2023-11-10' }
        ]
      },
      {
        clientId: clients[2].id,
        organizationId: organization.id,
        name: 'Coco',
        species: 'Ave',
        breed: 'Loro Amazonico',
        age: 7,
        weight: 0.4,
        gender: 'macho',
        color: 'Verde y amarillo',
        medicalHistory: 'Revision anual pendiente'
      }
    ]);

    console.log('🐾 Mascotas creadas');

    // Crear vacunas
    await Vaccination.bulkCreate([
      // Vacunas para Max (Perro Golden Retriever)
      {
        petId: pets[0].id,
        organizationId: organization.id,
        vaccineName: 'Antirrábica',
        vaccineType: 'obligatoria',
        applicationDate: '2025-03-15',
        nextDoseDate: '2026-03-15',
        vetId: users[1].id, // Dr. Carlos
        batchNumber: 'RAB-2025-001',
        manufacturer: 'Laboratorio VetPharma',
        notes: 'Primera dosis anual',
        status: 'aplicada',
        doseNumber: 1,
        weight: 28.5,
      },
      {
        petId: pets[0].id,
        organizationId: organization.id,
        vaccineName: 'Parvovirus',
        vaccineType: 'obligatoria',
        applicationDate: '2025-02-10',
        nextDoseDate: '2026-02-10',
        vetId: users[1].id,
        batchNumber: 'PARVO-2025-045',
        manufacturer: 'Laboratorio VetPharma',
        notes: 'Refuerzo anual',
        status: 'aplicada',
        doseNumber: 3,
        weight: 28.0,
      },
      {
        petId: pets[0].id,
        organizationId: organization.id,
        vaccineName: 'Moquillo',
        vaccineType: 'obligatoria',
        applicationDate: '2025-02-10',
        nextDoseDate: '2026-02-10',
        vetId: users[1].id,
        batchNumber: 'MOQ-2025-032',
        manufacturer: 'Laboratorio VetPharma',
        notes: 'Refuerzo anual',
        status: 'aplicada',
        doseNumber: 3,
        weight: 28.0,
      },
      // Vacunas para Luna (Gato Siamés)
      {
        petId: pets[1].id,
        organizationId: organization.id,
        vaccineName: 'Antirrábica',
        vaccineType: 'obligatoria',
        applicationDate: '2025-05-20',
        nextDoseDate: '2026-05-20',
        vetId: users[2].id, // Dra. Ana
        batchNumber: 'RAB-2025-015',
        manufacturer: 'Laboratorio VetPharma',
        notes: 'Sin reacciones adversas',
        status: 'aplicada',
        doseNumber: 1,
        weight: 4.2,
      },
      {
        petId: pets[1].id,
        organizationId: organization.id,
        vaccineName: 'Triple Felina',
        vaccineType: 'obligatoria',
        applicationDate: '2025-05-20',
        nextDoseDate: '2026-05-20',
        vetId: users[2].id,
        batchNumber: 'TF-2025-089',
        manufacturer: 'Laboratorio PetCare',
        notes: 'Incluye panleucopenia, rinotraqueitis y calicivirus',
        status: 'aplicada',
        doseNumber: 2,
        weight: 4.2,
      },
      {
        petId: pets[1].id,
        organizationId: organization.id,
        vaccineName: 'Leucemia Felina',
        vaccineType: 'opcional',
        applicationDate: '2025-06-15',
        nextDoseDate: '2026-06-15',
        vetId: users[2].id,
        batchNumber: 'LEUC-2025-023',
        manufacturer: 'Laboratorio PetCare',
        notes: 'Recomendada para gatos con acceso al exterior',
        status: 'aplicada',
        doseNumber: 1,
        weight: 4.3,
      },
      // Vacunas para Rocky (Perro Bulldog) - Una vencida
      {
        petId: pets[2].id,
        organizationId: organization.id,
        vaccineName: 'Antirrábica',
        vaccineType: 'obligatoria',
        applicationDate: '2024-11-10',
        nextDoseDate: '2025-11-10',
        vetId: users[1].id,
        batchNumber: 'RAB-2024-234',
        manufacturer: 'Laboratorio VetPharma',
        notes: 'Requiere refuerzo urgente',
        status: 'vencida',
        doseNumber: 2,
        weight: 22.0,
      },
      {
        petId: pets[2].id,
        organizationId: organization.id,
        vaccineName: 'Tos de las Perreras',
        vaccineType: 'opcional',
        applicationDate: '2025-01-15',
        nextDoseDate: '2026-01-15',
        vetId: users[1].id,
        batchNumber: 'TOS-2025-067',
        manufacturer: 'Laboratorio VetPharma',
        notes: 'Recomendada por problemas respiratorios',
        status: 'aplicada',
        doseNumber: 1,
        weight: 22.0,
      },
    ]);

    console.log('💉 Vacunas creadas');

    // (El inventario se genera más arriba con seedDefaultInventory,
    //  que asigna correctamente la organización a cada producto)

    await Plan.bulkCreate([
      {
        name: 'Plan Preventivo',
        description: 'Consulta general y control anual',
        price: 250000,
        currency: 'PYG',
        vatPercentage: 10,
        isActive: true,
      },
    ]);

    // Crear registros médicos
    await MedicalRecord.bulkCreate([
      // Registros para Max (Golden Retriever)
      {
        petId: pets[0].id,
        organizationId: organization.id,
        vetId: users[1].id,
        diagnosis: 'Chequeo general anual',
        treatment: 'Vacunación antirrábica y desparasitación',
        weight: 32.5,
        temperature: 38.5,
        notes: 'Mascota en excelente estado de salud.',
        createdAt: monthsAgo(5)
      },
      {
        petId: pets[0].id,
        organizationId: organization.id,
        vetId: users[2].id,
        diagnosis: 'Otitis externa leve',
        treatment: 'Gotas óticas antibióticas por 7 días',
        weight: 33.0,
        temperature: 38.8,
        notes: 'Infección leve del oído derecho.',
        createdAt: monthsAgo(2)
      },
      // Registros para Luna (Gato Siamés)
      {
        petId: pets[1].id,
        organizationId: organization.id,
        vetId: users[2].id,
        diagnosis: 'Vacunación triple felina',
        treatment: 'Aplicación de vacuna triple felina',
        weight: 4.2,
        temperature: 38.7,
        notes: 'Primera dosis de vacuna.',
        createdAt: monthsAgo(1)
      },
      // Registros para Rocky (Bulldog)
      {
        petId: pets[2].id,
        organizationId: organization.id,
        vetId: users[1].id,
        diagnosis: 'Dermatitis alérgica',
        treatment: 'Antihistamínicos y champú medicado',
        weight: 12.5,
        temperature: 38.6,
        notes: 'Alergia alimentaria sospechada.',
        createdAt: daysAgo(8)
      }
    ]);
    console.log('🏥 Registros médicos creados');

    console.log('📋 Planes iniciales creados');

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n🔐 Credenciales de acceso:');
    console.log('----------------------------------------');
    console.log('Admin:');
    console.log('  Usuario: admin');
    console.log('  Contraseña: admin123');
    console.log('\nVeterinario:');
    console.log('  Usuario: drcarlos');
    console.log('  Contraseña: vet123');
    console.log('\nRecepcionista:');
    console.log('  Usuario: laura');
    console.log('  Contraseña: recep123');
    console.log('----------------------------------------');
    console.log('\n💉 Datos de vacunas:');
    console.log('- Max: 3 vacunas (Antirrábica, Parvovirus, Moquillo)');
    console.log('- Luna: 3 vacunas (Antirrábica, Triple Felina, Leucemia)');
    console.log('- Rocky: 2 vacunas (1 VENCIDA - Antirrábica)');
    console.log('----------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedDatabase();
