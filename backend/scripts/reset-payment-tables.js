require('dotenv').config();
const { sequelize } = require('../config/database');

/**
 * Script para eliminar y recrear las tablas del sistema de pagos
 * ADVERTENCIA: Esto eliminará todos los datos de services, invoices y payments
 * Ejecutar con: node scripts/reset-payment-tables.js
 */

const resetTables = async () => {
    try {
        console.log('⚠️  ADVERTENCIA: Este script eliminará las tablas de pagos\n');
        console.log('🔄 Iniciando reset de tablas...\n');

        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida\n');

        // Eliminar tablas en orden (payments primero por foreign keys)
        console.log('🗑️  Eliminando tabla payments...');
        await sequelize.query('DROP TABLE IF EXISTS payments CASCADE;');
        console.log('✅ Tabla payments eliminada\n');

        console.log('🗑️  Eliminando tabla invoices...');
        await sequelize.query('DROP TABLE IF EXISTS invoices CASCADE;');
        console.log('✅ Tabla invoices eliminada\n');

        console.log('🗑️  Eliminando tabla services...');
        await sequelize.query('DROP TABLE IF EXISTS services CASCADE;');
        console.log('✅ Tabla services eliminada\n');

        // Eliminar tipos ENUM
        console.log('🗑️  Eliminando tipos ENUM...');
        await sequelize.query('DROP TYPE IF EXISTS "enum_services_category" CASCADE;');
        await sequelize.query('DROP TYPE IF EXISTS "enum_invoices_status" CASCADE;');
        await sequelize.query('DROP TYPE IF EXISTS "enum_payments_paymentMethod" CASCADE;');
        console.log('✅ Tipos ENUM eliminados\n');

        console.log('🎉 Reset completado!\n');
        console.log('💡 Ahora ejecuta: node scripts/migrate-payments.js');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el reset:', error);
        console.error('\n📝 Detalles:', error.message);
        process.exit(1);
    }
};

resetTables();
