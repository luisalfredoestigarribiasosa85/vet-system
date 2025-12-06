require('dotenv').config();
const { sequelize } = require('../config/database');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

/**
 * Script para verificar y sincronizar todas las tablas del sistema de pagos
 * Ejecutar con: node scripts/sync-payment-tables.js
 */

const syncTables = async () => {
    try {
        console.log('🔄 Sincronizando tablas del sistema de pagos...\n');

        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida\n');

        // Sincronizar tablas (esto las creará o actualizará)
        console.log('📋 Sincronizando tabla de servicios...');
        await Service.sync({ alter: true });
        console.log('✅ Tabla "services" sincronizada\n');

        console.log('📋 Sincronizando tabla de facturas...');
        await Invoice.sync({ alter: true });
        console.log('✅ Tabla "invoices" sincronizada\n');

        console.log('📋 Sincronizando tabla de pagos...');
        await Payment.sync({ alter: true });
        console.log('✅ Tabla "payments" sincronizada\n');

        // Verificar servicios
        const serviceCount = await Service.count();
        console.log(`📊 Servicios en la base de datos: ${serviceCount}\n`);

        if (serviceCount === 0) {
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
                await Service.create(serviceData);
            }
            console.log(`✅ ${servicesData.length} servicios insertados\n`);
        }

        // Verificar facturas y pagos
        const invoiceCount = await Invoice.count();
        const paymentCount = await Payment.count();

        console.log(`📊 Facturas en la base de datos: ${invoiceCount}`);
        console.log(`📊 Pagos en la base de datos: ${paymentCount}\n`);

        console.log('🎉 Sincronización completada exitosamente!\n');
        console.log('💡 Ahora reinicia el servidor backend (Ctrl+C y npm run dev)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la sincronización:', error);
        console.error('\n📝 Detalles del error:', error.message);
        process.exit(1);
    }
};

syncTables();
