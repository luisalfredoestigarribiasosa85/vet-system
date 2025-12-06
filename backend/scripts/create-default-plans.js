const { sequelize, Plan } = require('../models');

async function createDefaultPlans() {
    try {
        console.log('🚀 Creando planes por defecto...');

        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida');

        const defaultPlans = [
            {
                name: 'Free',
                description: 'Plan gratuito para comenzar',
                price: 0,
                interval: 'month',
                features: {
                    users: 1,
                    clients: 10,
                    pets: 25,
                    appointments: 50,
                    invoices: 25,
                    storage: 50,
                    basic_support: true,
                    email_notifications: true
                },
                limits: {
                    users: 1,
                    clients: 10,
                    pets: 25,
                    appointments: 50,
                    invoices: 25,
                    storage: 50
                },
                isPopular: false,
                sortOrder: 1,
                trialDays: 0,
                isActive: true
            },
            {
                name: 'Basic',
                description: 'Para clínicas pequeñas',
                price: 50000, // Gs. 50.000
                interval: 'month',
                features: {
                    users: 3,
                    clients: 100,
                    pets: 200,
                    appointments: 500,
                    invoices: 200,
                    storage: 500,
                    email_support: true,
                    reports: true,
                    sms_notifications: true,
                    appointment_reminders: true
                },
                limits: {
                    users: 3,
                    clients: 100,
                    pets: 200,
                    appointments: 500,
                    invoices: 200,
                    storage: 500
                },
                isPopular: true,
                sortOrder: 2,
                trialDays: 14,
                isActive: true
            },
            {
                name: 'Pro',
                description: 'Para clínicas en crecimiento',
                price: 150000, // Gs. 150.000
                interval: 'month',
                features: {
                    users: 10,
                    clients: 500,
                    pets: 1000,
                    appointments: 2000,
                    invoices: 1000,
                    storage: 2000,
                    phone_support: true,
                    advanced_reports: true,
                    api_access: true,
                    custom_fields: true,
                    multi_location: false,
                    inventory_management: true,
                    vaccination_tracking: true
                },
                limits: {
                    users: 10,
                    clients: 500,
                    pets: 1000,
                    appointments: 2000,
                    invoices: 1000,
                    storage: 2000
                },
                isPopular: false,
                sortOrder: 3,
                trialDays: 30,
                isActive: true
            },
            {
                name: 'Enterprise',
                description: 'Para clínicas grandes y cadenas veterinarias',
                price: 500000, // Gs. 500.000
                interval: 'month',
                features: {
                    users: -1, // ilimitado
                    clients: -1,
                    pets: -1,
                    appointments: -1,
                    invoices: -1,
                    storage: -1,
                    dedicated_support: true,
                    custom_features: true,
                    white_label: true,
                    multi_location: true,
                    advanced_analytics: true,
                    priority_support: true,
                    custom_integrations: true,
                    training_sessions: true
                },
                limits: {
                    users: -1,
                    clients: -1,
                    pets: -1,
                    appointments: -1,
                    invoices: -1,
                    storage: -1
                },
                isPopular: false,
                sortOrder: 4,
                trialDays: 30,
                isActive: true
            }
        ];

        for (const planData of defaultPlans) {
            try {
                // Verificar si el plan ya existe
                const existingPlan = await Plan.findOne({
                    where: { name: planData.name }
                });

                if (existingPlan) {
                    console.log(`✅ Plan ${planData.name} ya existe, actualizando...`);
                    await existingPlan.update(planData);
                } else {
                    console.log(`➕ Creando plan ${planData.name}...`);
                    await Plan.create(planData);
                }
            } catch (error) {
                console.error(`❌ Error al crear/actualizar plan ${planData.name}:`, error.message);
            }
        }

        console.log('🎉 Planes por defecto creados/actualizados exitosamente!');

        // Mostrar resumen
        const allPlans = await Plan.findAll({
            order: [['sortOrder', 'ASC']]
        });

        console.log('\n📋 Planes disponibles:');
        allPlans.forEach(plan => {
            const priceFormatted = plan.price === 0 ? 'Gratis' : `Gs. ${plan.price.toLocaleString('es-PY')}`;
            const userLimit = plan.limits?.users === -1 ? '∞' : (plan.limits?.users || 'N/A');
            console.log(`- ${plan.name}: ${priceFormatted}/mes (${userLimit} usuarios)`);
        });

    } catch (error) {
        console.error('❌ Error al crear planes por defecto:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createDefaultPlans().then(() => {
        console.log('✅ Script completado');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { createDefaultPlans };
