require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Client = require('../models/Client');
const Pet = require('../models/Pet');
const Inventory = require('../models/Inventory');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de base de datos...');
    
    // Limpiar base de datos
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada');
    
    // Crear usuarios
    const users = await User.bulkCreate([
      {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        email: 'admin@veterinaria.com',
        role: 'admin'
      },
      {
        username: 'drcarlos',
        password: 'vet123',
        name: 'Dr. Carlos Ramírez',
        email: 'carlos@veterinaria.com',
        role: 'veterinario'
      },
      {
        username: 'draana',
        password: 'vet123',
        name: 'Dra. Ana Torres',
        email: 'ana@veterinaria.com',
        role: 'veterinario'
      },
      {
        username: 'laura',
        password: 'recep123',
        name: 'Laura Martínez',
        email: 'laura@veterinaria.com',
        role: 'recepcionista'
      }
    ], { individualHooks: true });
    
    console.log('✅ Usuarios creados');
    
    // Crear clientes
    const clients = await Client.bulkCreate([
      {
        name: 'María González',
        phone: '0981-123456',
        email: 'maria@email.com',
        address: 'Av. España 1234, Asunción'
      },
      {
        name: 'Juan Pérez',
        phone: '0982-234567',
        email: 'juan@email.com',
        address: 'Mcal. López 567, Asunción'
      },
      {
        name: 'Pedro Martínez',
        phone: '0983-345678',
        email: 'pedro@email.com',
        address: 'Gral. Santos 890, Luque'
      }
    ]);
    
    console.log('✅ Clientes creados');
    
    // Crear mascotas
    await Pet.bulkCreate([
      {
        clientId: clients[0].id,
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
        name: 'Luna',
        species: 'Gato',
        breed: 'Siamés',
        age: 2,
        weight: 4.2,
        gender: 'hembra',
        color: 'Crema y marrón',
        medicalHistory: 'Sano',
        vaccines: [
          { name: 'Rabia', date: '2024-05-20' },
          { name: 'Triple Felina', date: '2024-05-20' }
        ]
      },
      {
        clientId: clients[1].id,
        name: 'Rocky',
        species: 'Perro',
        breed: 'Bulldog',
        age: 5,
        weight: 22.0,
        gender: 'macho',
        color: 'Blanco y marrón',
        medicalHistory: 'Problemas respiratorios leves',
        allergies: 'Polen',
        vaccines: [
          { name: 'Rabia', date: '2023-11-10' }
        ]
      },
      {
        clientId: clients[2].id,
        name: 'Coco',
        species: 'Ave',
        breed: 'Loro Amazónico',
        age: 7,
        weight: 0.4,
        gender: 'macho',
        color: 'Verde y amarillo',
        medicalHistory: 'Revisión anual pendiente'
      }
    ]);
    
    console.log('✅ Mascotas creadas');
    
    // Crear inventario
    await Inventory.bulkCreate([
      {
        name: 'Vacuna Antirrábica',
        description: 'Vacuna contra rabia para perros y gatos',
        category: 'Vacunas',
        quantity: 25,
        minStock: 10,
        price: 120000,
        supplier: 'Laboratorio VetPharma',
        expiryDate: '2025-12-31'
      },
      {
        name: 'Vacuna Polivalente',
        description: 'Protección múltiple para perros',
        category: 'Vacunas',
        quantity: 18,
        minStock: 10,
        price: 150000,
        supplier: 'Laboratorio VetPharma',
        expiryDate: '2025-11-30'
      },
      {
        name: 'Otomax Gotas',
        description: 'Tratamiento para otitis',
        category: 'Medicamentos',
        quantity: 8,
        minStock: 5,
        price: 85000,
        supplier: 'Farmacia Veterinaria Central',
        expiryDate: '2026-06-30'
      },
      {
        name: 'Amoxicilina 500mg',
        description: 'Antibiótico de amplio espectro',
        category: 'Medicamentos',
        quantity: 45,
        minStock: 20,
        price: 3500,
        supplier: 'Droguería MedVet',
        expiryDate: '2026-03-15'
      },
      {
        name: 'Antiparasitario Interno',
        description: 'Desparasitante para perros y gatos',
        category: 'Antiparasitarios',
        quantity: 30,
        minStock: 15,
        price: 45000,
        supplier: 'Laboratorio PetCare',
        expiryDate: '2026-08-20'
      },
      {
        name: 'Pipeta Antipulgas',
        description: 'Tratamiento tópico contra pulgas y garrapatas',
        category: 'Antiparasitarios',
        quantity: 50,
        minStock: 20,
        price: 65000,
        supplier: 'Distribuidora Animal Health',
        expiryDate: '2026-10-15'
      },
      {
        name: 'Shampoo Medicado',
        description: 'Para problemas dermatológicos',
        category: 'Higiene',
        quantity: 12,
        minStock: 8,
        price: 55000,
        supplier: 'PetGrooming Supply',
        expiryDate: '2027-01-30'
      },
      {
        name: 'Alimento Premium Perros',
        description: 'Alimento balanceado 15kg',
        category: 'Alimentos',
        quantity: 20,
        minStock: 10,
        price: 280000,
        supplier: 'Distribuidora NutriPet',
        expiryDate: '2025-12-01'
      },
      {
        name: 'Alimento Premium Gatos',
        description: 'Alimento balanceado 7.5kg',
        category: 'Alimentos',
        quantity: 15,
        minStock: 8,
        price: 195000,
        supplier: 'Distribuidora NutriPet',
        expiryDate: '2025-11-15'
      },
      {
        name: 'Vitaminas Multiples',
        description: 'Suplemento vitamínico completo',
        category: 'Suplementos',
        quantity: 22,
        minStock: 10,
        price: 75000,
        supplier: 'Farmacia Veterinaria Central',
        expiryDate: '2026-07-30'
      }
    ]);
    
    console.log('✅ Inventario creado');
    
    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
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
    console.log('----------------------------------------\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedDatabase();
