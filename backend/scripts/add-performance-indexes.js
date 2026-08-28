// backend/scripts/add-performance-indexes.js
// Crea de forma IDEMPOTENTE los índices compuestos que soportan las consultas
// multi-tenant reales (Fase 5 - performance backend/base de datos).
//
// Uso:   pnpm run db:indexes
//
// Notas:
//   - CREATE INDEX IF NOT EXISTS: seguro de ejecutar N veces.
//   - Estos mismos índices están declarados en los modelos, así que `seed.js`
//     (sync force) y `sync-db.js` (alter) también los crean en entornos nuevos.
//   - Para tablas muy grandes en producción, migrar a CREATE INDEX CONCURRENTLY.

require('dotenv').config();
const { sequelize } = require('../config/database');

const INDEXES = [
  // --- Clients ---
  'CREATE INDEX IF NOT EXISTS idx_clients_org_active_created ON clients ("organizationId", "isActive", "createdAt");',
  'CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients ("userId");',
  // --- Pets ---
  'CREATE INDEX IF NOT EXISTS idx_pets_org_active_created ON pets ("organizationId", "isActive", "createdAt");',
  'CREATE INDEX IF NOT EXISTS idx_pets_client_id ON pets ("clientId");',
  // --- Appointments ---
  'CREATE INDEX IF NOT EXISTS idx_appointments_org_date ON appointments ("organizationId", "date");',
  'CREATE INDEX IF NOT EXISTS idx_appointments_vet_start ON appointments ("vetId", "startDateTime");',
  'CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments ("petId");',
  'CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments ("date");',
  // --- Medical records ---
  'CREATE INDEX IF NOT EXISTS idx_medical_records_org_created ON medical_records ("organizationId", "createdAt");',
  'CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records ("petId");',
  'CREATE INDEX IF NOT EXISTS idx_medical_records_vet_id ON medical_records ("vetId");',
  // --- Inventory ---
  'CREATE INDEX IF NOT EXISTS idx_inventory_org_active ON inventory ("organizationId", "isActive");',
  // --- Invoices ---
  'CREATE INDEX IF NOT EXISTS idx_invoices_org_status_issue ON invoices ("organizationId", "status", "issueDate");',
  'CREATE INDEX IF NOT EXISTS idx_invoices_org_issue ON invoices ("organizationId", "issueDate");',
  'CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices ("clientId");',
  // --- Payments ---
  'CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments ("invoiceId");',
  'CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments ("paymentDate");',
  // --- Services ---
  'CREATE INDEX IF NOT EXISTS idx_services_org_active ON services ("organizationId", "isActive");',
  // --- Users ---
  'CREATE INDEX IF NOT EXISTS idx_users_org_id ON users ("organizationId");',
  // --- Plan purchases ---
  'CREATE INDEX IF NOT EXISTS idx_plan_purchases_client_id ON plan_purchases ("clientId");',
];

(async () => {
  try {
    console.log('🔧 Aplicando índices de performance (idempotente)...');
    for (const sql of INDEXES) {
      const match = sql.match(/IF NOT EXISTS (\w+)/);
      await sequelize.query(sql);
      console.log(`  ✅ ${match ? match[1] : sql}`);
    }
    console.log(`✅ Listo: ${INDEXES.length} índices verificados/creados.`);
  } catch (error) {
    console.error('❌ Error aplicando índices:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await sequelize.close();
    } catch (_) { /* conexión ya cerrada */ }
  }
})();