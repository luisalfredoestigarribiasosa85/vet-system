const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

async function migrateToSaaS() {
    try {
        console.log('🚀 Iniciando migración a arquitectura SaaS...');

        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida');

        // Crear nuevas tablas
        console.log('📦 Creando nuevas tablas SaaS...');

        // Tabla organizations
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        subdomain VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        logo VARCHAR(255),
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        website VARCHAR(200),
        "taxId" VARCHAR(50),
        "isActive" BOOLEAN DEFAULT true,
        settings JSONB DEFAULT '{}',
        "trialEndsAt" TIMESTAMP,
        "createdBy" INTEGER REFERENCES users(id),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Tabla subscriptions
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        "organizationId" INTEGER NOT NULL REFERENCES organizations(id),
        "planId" INTEGER NOT NULL REFERENCES plans(id),
        "stripeSubscriptionId" VARCHAR(100),
        "stripeCustomerId" VARCHAR(100),
        status VARCHAR(50) DEFAULT 'trialing',
        "currentPeriodStart" TIMESTAMP,
        "currentPeriodEnd" TIMESTAMP,
        "trialStart" TIMESTAMP,
        "trialEnd" TIMESTAMP,
        "canceledAt" TIMESTAMP,
        "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
        "usageMetrics" JSONB DEFAULT '{"users": 0, "clients": 0, "pets": 0, "appointments": 0, "invoices": 0, "storage": 0}',
        "billingInfo" JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("organizationId")
      );
    `);

        // Agregar campos organizationId a tablas existentes
        console.log('🔄 Agregando campos organizationId a tablas existentes...');

        const tablesToUpdate = [
            'clients',
            'pets',
            'appointments',
            'medical_records',
            'inventory',
            'invoices',
            'services',
            'vaccinations'
        ];

        for (const table of tablesToUpdate) {
            try {
                // Verificar si la columna ya existe
                const [columns] = await sequelize.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = '${table}' AND column_name = 'organizationId';
        `);

                if (columns.length === 0) {
                    console.log(`➕ Agregando organizationId a tabla ${table}...`);
                    await sequelize.query(`
            ALTER TABLE ${table}
            ADD COLUMN "organizationId" INTEGER REFERENCES organizations(id);
          `);

                    // Para tablas existentes, asignar a una organización por defecto (la primera que se cree)
                    // Esto se hará después de crear las organizaciones
                } else {
                    console.log(`✅ organizationId ya existe en tabla ${table}`);
                }
            } catch (error) {
                console.log(`⚠️  Error al actualizar tabla ${table}:`, error.message);
            }
        }

        // Agregar campos SaaS a tabla users
        console.log('👤 Actualizando tabla users...');
        const userColumns = [
            { name: 'organizationId', type: 'INTEGER REFERENCES organizations(id)', default: null },
            { name: 'organizationRole', type: 'VARCHAR(50)', default: null },
            { name: 'isOwner', type: 'BOOLEAN DEFAULT false', default: null },
            { name: 'invitedBy', type: 'INTEGER REFERENCES users(id)', default: null },
            { name: 'invitationToken', type: 'VARCHAR(255)', default: null },
            { name: 'invitationExpires', type: 'TIMESTAMP', default: null }
        ];

        for (const column of userColumns) {
            try {
                const [exists] = await sequelize.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = '${column.name}';
        `);

                if (exists.length === 0) {
                    console.log(`➕ Agregando ${column.name} a tabla users...`);
                    await sequelize.query(`
            ALTER TABLE users
            ADD COLUMN "${column.name}" ${column.type};
          `);
                }
            } catch (error) {
                console.log(`⚠️  Error al agregar columna ${column.name}:`, error.message);
            }
        }

        // Actualizar tabla plans para SaaS
        console.log('📋 Actualizando tabla plans...');
        const planColumns = [
            { name: 'interval', type: 'VARCHAR(20) DEFAULT \'month\'', default: null },
            { name: 'stripePriceId', type: 'VARCHAR(100)', default: null },
            { name: 'features', type: 'JSONB DEFAULT \'{}\'', default: null },
            { name: 'limits', type: 'JSONB DEFAULT \'{"users": 1, "clients": 50, "pets": 100, "appointments": 200, "invoices": 100, "storage": 100}\'', default: null },
            { name: 'isPopular', type: 'BOOLEAN DEFAULT false', default: null },
            { name: 'sortOrder', type: 'INTEGER DEFAULT 0', default: null },
            { name: 'trialDays', type: 'INTEGER DEFAULT 14', default: null }
        ];

        for (const column of planColumns) {
            try {
                const [exists] = await sequelize.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'plans' AND column_name = '${column.name}';
        `);

                if (exists.length === 0) {
                    console.log(`➕ Agregando ${column.name} a tabla plans...`);
                    await sequelize.query(`
            ALTER TABLE plans
            ADD COLUMN "${column.name}" ${column.type};
          `);
                }
            } catch (error) {
                console.log(`⚠️  Error al agregar columna ${column.name}:`, error.message);
            }
        }

        // Crear índices para SaaS
        console.log('🔍 Creando índices para SaaS...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_organizations_subdomain ON organizations(subdomain);',
            'CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations("isActive");',
            'CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions("organizationId");',
            'CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions("planId");',
            'CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);',
            'CREATE INDEX IF NOT EXISTS idx_users_org ON users("organizationId");',
            'CREATE INDEX IF NOT EXISTS idx_clients_org ON clients("organizationId");',
            'CREATE INDEX IF NOT EXISTS idx_pets_org ON pets("organizationId");',
            'CREATE INDEX IF NOT EXISTS idx_appointments_org ON appointments("organizationId");',
            'CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices("organizationId");'
        ];

        for (const index of indexes) {
            try {
                await sequelize.query(index);
            } catch (error) {
                console.log(`⚠️  Error al crear índice:`, error.message);
            }
        }

        // Crear planes por defecto
        console.log('📝 Creando planes por defecto...');
        const defaultPlans = [
            {
                name: 'Free',
                description: 'Plan gratuito para comenzar',
                price: 0,
                features: {
                    users: 1,
                    clients: 10,
                    pets: 25,
                    appointments: 50,
                    invoices: 25,
                    basic_support: true
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
                trialDays: 0
            },
            {
                name: 'Basic',
                description: 'Para clínicas pequeñas',
                price: 50000, // Gs. 50.000
                features: {
                    users: 3,
                    clients: 100,
                    pets: 200,
                    appointments: 500,
                    invoices: 200,
                    email_support: true,
                    reports: true
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
                trialDays: 14
            },
            {
                name: 'Pro',
                description: 'Para clínicas en crecimiento',
                price: 150000, // Gs. 150.000
                features: {
                    users: 10,
                    clients: 500,
                    pets: 1000,
                    appointments: 2000,
                    invoices: 1000,
                    phone_support: true,
                    advanced_reports: true,
                    api_access: true
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
                trialDays: 30
            },
            {
                name: 'Enterprise',
                description: 'Para clínicas grandes y cadenas',
                price: 500000, // Gs. 500.000
                features: {
                    users: -1, // ilimitado
                    clients: -1,
                    pets: -1,
                    appointments: -1,
                    invoices: -1,
                    dedicated_support: true,
                    custom_features: true,
                    white_label: true
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
                trialDays: 30
            }
        ];

        for (const plan of defaultPlans) {
            try {
                const [existing] = await sequelize.query(`
          SELECT id FROM plans WHERE name = '${plan.name}' LIMIT 1;
        `);

                if (existing.length === 0) {
                    console.log(`➕ Creando plan ${plan.name}...`);
                    await sequelize.query(`
            INSERT INTO plans (name, description, price, features, limits, "isPopular", "sortOrder", "trialDays", "createdAt", "updatedAt")
            VALUES ('${plan.name}', '${plan.description}', ${plan.price}, '${JSON.stringify(plan.features)}', '${JSON.stringify(plan.limits)}', ${plan.isPopular}, ${plan.sortOrder}, ${plan.trialDays}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
          `);
                } else {
                    console.log(`✅ Plan ${plan.name} ya existe`);
                }
            } catch (error) {
                console.log(`⚠️  Error al crear plan ${plan.name}:`, error.message);
            }
        }

        console.log('🎉 Migración a SaaS completada exitosamente!');
        console.log('');
        console.log('📋 Próximos pasos:');
        console.log('1. Crear organizaciones para datos existentes');
        console.log('2. Ejecutar script de migración de datos');
        console.log('3. Configurar Stripe para pagos');
        console.log('4. Actualizar middleware de autenticación');

    } catch (error) {
        console.error('❌ Error en migración SaaS:', error);
        process.exit(1);
    }
}

// Ejecutar migración
migrateToSaaS().then(() => {
    console.log('✅ Migración completada');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
