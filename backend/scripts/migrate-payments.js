require('dotenv').config();
const { sequelize } = require('../config/database');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

/**
 * Script para crear/actualizar las tablas del sistema de pagos
 * Ejecutar con: node scripts/migrate-payments.js
 */

const migratePaymentTables = async () => {
    try {
        console.log('🔄 Iniciando migración de tablas de pagos...\n');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida\n');

        // Crear/actualizar tabla de servicios
        console.log('📋 Creando tabla de servicios...');
        await Service.sync({ alter: true });
        console.log('✅ Tabla "services" creada/actualizada\n');

        // Crear/actualizar tabla de facturas (invoices)
        console.log('📋 Actualizando tabla de facturas...');
        await Invoice.sync({ alter: true });
        console.log('✅ Tabla "invoices" actualizada\n');

        // Crear/actualizar tabla de pagos
        console.log('📋 Creando tabla de pagos...');
        await Payment.sync({ alter: true });
        console.log('✅ Tabla "payments" creada/actualizada\n');

        // Insertar servicios de ejemplo
        console.log('📦 Insertando servicios de ejemplo...');
        const servicesData = [
            {
                name: 'Consulta General',
                description: 'Consulta veterinaria general',
                price: 150000,
                category: 'consulta',
                duration: 30
            },
            {
                name: 'Vacuna Antirrábica',
                description: 'Vacuna contra la rabia',
                price: 80000,
                category: 'vacuna',
                duration: 15
            },
            {
                name: 'Vacuna Séxtuple',
                description: 'Vacuna séxtuple para perros',
                price: 120000,
                category: 'vacuna',
                duration: 15
            },
            {
                name: 'Desparasitación',
                description: 'Desparasitación interna',
                price: 50000,
                category: 'medicamento',
                duration: 10
            },
            {
                name: 'Castración Canina',
                description: 'Cirugía de castración para perros',
                price: 500000,
                category: 'cirugia',
                duration: 120
            },
            {
                name: 'Castración Felina',
                description: 'Cirugía de castración para gatos',
                price: 400000,
                category: 'cirugia',
                duration: 90
            },
            {
                name: 'Análisis de Sangre',
                description: 'Análisis de sangre completo',
                price: 200000,
                category: 'laboratorio',
                duration: 20
            },
            {
                name: 'Radiografía',
                description: 'Radiografía simple',
                price: 180000,
                category: 'laboratorio',
                duration: 30
            },
            {
                name: 'Limpieza Dental',
                description: 'Limpieza dental profesional',
                price: 300000,
                category: 'otro',
                duration: 60
            },
            {
                name: 'Baño y Corte',
                description: 'Servicio de baño y corte de pelo',
                price: 100000,
                category: 'otro',
                duration: 45
            }
        ];

        for (const serviceData of servicesData) {
            await Service.findOrCreate({
                where: { name: serviceData.name },
                defaults: serviceData
            });
        }
        console.log(`✅ ${servicesData.length} servicios insertados/verificados\n`);

        console.log('🎉 Migración completada exitosamente!\n');
        console.log('📝 Resumen:');
        console.log('   - Tabla "services" creada con servicios de ejemplo');
        console.log('   - Tabla "invoices" actualizada con nuevos campos');
        console.log('   - Tabla "payments" creada para registrar pagos');
        console.log('\n💡 Ahora puedes reiniciar el servidor backend');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
};

migratePaymentTables();
