require('dotenv').config();
const { sequelize } = require('../config/database');
const Service = require('../models/Service');

/**
 * Script para verificar si los servicios existen en la base de datos
 * Ejecutar con: node scripts/check-services.js
 */

const checkServices = async () => {
    try {
        console.log('🔍 Verificando servicios en la base de datos...\n');

        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida\n');

        const services = await Service.findAll();

        console.log(`📊 Total de servicios encontrados: ${services.length}\n`);

        if (services.length === 0) {
            console.log('❌ No hay servicios en la base de datos.');
            console.log('💡 Ejecuta: node scripts/migrate-payments.js\n');
        } else {
            console.log('✅ Servicios encontrados:\n');
            services.forEach((service, index) => {
                console.log(`${index + 1}. ${service.name}`);
                console.log(`   Precio: Gs. ${parseInt(service.price).toLocaleString('es-PY')}`);
                console.log(`   Categoría: ${service.category}`);
                console.log(`   Activo: ${service.isActive ? 'Sí' : 'No'}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al verificar servicios:', error);
        process.exit(1);
    }
};

checkServices();
