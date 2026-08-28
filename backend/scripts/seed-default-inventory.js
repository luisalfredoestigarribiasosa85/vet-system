require('dotenv').config();
const { sequelize } = require('../config/database');
const { Inventory, Organization } = require('../models');

/**
 * Helper de fechas relativas para vencimientos (YYYY-MM-DD),
 * calculados al momento del seed para que las alertas sean siempre realistas.
 */
const monthsFromNow = (months) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Stock inicial estándar de una clínica veterinaria (precios de costo en Guaraníes).
 * Se usa al sembrar la base (seed.js) y para poblar organizaciones existentes.
 * Incluye casos de demostración: stock bajo y próximos a vencer.
 */
const DEFAULT_INVENTORY = [
  { name: 'Vacuna antirrábica', description: 'Biológico antirrábico (dosis)', category: 'vacuna', quantity: 25, minStock: 10, price: 35000, supplier: 'Distribuidora VetPar', expiryDate: monthsFromNow(8) },
  { name: 'Vacuna polivalente canina', description: 'Moquillo/parvovirus (dosis)', category: 'vacuna', quantity: 15, minStock: 10, price: 55000, supplier: 'Distribuidora VetPar', expiryDate: monthsFromNow(6) },
  { name: 'Vacuna triple felina', description: 'Panleucopenia/rinotraqueitis/calicivirus (dosis)', category: 'vacuna', quantity: 4, minStock: 10, price: 60000, supplier: 'Agrovet S.A.', expiryDate: monthsFromNow(5) },
  { name: 'Amoxicilina 250mg', description: 'Antibiótico de amplio espectro (caja x 100 comp.)', category: 'medicamento', quantity: 40, minStock: 20, price: 85000, supplier: 'Agrovet S.A.', expiryDate: monthsFromNow(12) },
  { name: 'Meloxicam 1.5mg/ml', description: 'Antiinflamatorio oral (frasco 30ml)', category: 'medicamento', quantity: 12, minStock: 15, price: 45000, supplier: 'Agrovet S.A.', expiryDate: monthsFromNow(9) },
  { name: 'Ivermectina inyectable', description: 'Antiparasitario 1% (frasco 50ml)', category: 'medicamento', quantity: 10, minStock: 8, price: 38000, supplier: 'Distribuidora VetPar', expiryDate: daysFromNow(21) },
  { name: 'Suero fisiológico 500ml', description: 'Solución NaCl 0.9% para hidratación', category: 'insumo', quantity: 30, minStock: 10, price: 12000, supplier: 'PetSupply Py', expiryDate: monthsFromNow(18) },
  { name: 'Gasas estériles', description: 'Paquete x 10 unidades', category: 'insumo', quantity: 100, minStock: 30, price: 5000, supplier: 'PetSupply Py', expiryDate: null },
  { name: 'Jeringas descartables 5ml', description: 'Caja x 100 unidades', category: 'insumo', quantity: 150, minStock: 50, price: 65000, supplier: 'PetSupply Py', expiryDate: null },
  { name: 'Guantes de examen (caja)', description: 'Nitrilo talle M, caja x 100', category: 'insumo', quantity: 8, minStock: 10, price: 42000, supplier: 'PetSupply Py', expiryDate: null },
  { name: 'Shampoo medicado', description: 'Piretrico para dermatitis (frasco 250ml)', category: 'higiene', quantity: 6, minStock: 5, price: 28000, supplier: 'PetSupply Py', expiryDate: monthsFromNow(14) },
  { name: 'Alimento de recuperación', description: 'Dieta veterinaria latas x 12', category: 'alimento', quantity: 5, minStock: 3, price: 190000, supplier: 'Agrovet S.A.', expiryDate: monthsFromNow(10) },
];

/**
 * Puebla el stock inicial de inventario por defecto.
 * Idempotente: omite organizaciones que ya tengan productos registrados.
 * @param {number|null} organizationId Si es null, procesa todas las organizaciones activas.
 * @returns {number} Cantidad de productos creados.
 */
const seedDefaultInventory = async (organizationId = null) => {
  const organizations = organizationId
    ? await Organization.findAll({ where: { id: organizationId } })
    : await Organization.findAll({ where: { isActive: true } });

  let created = 0;

  for (const org of organizations) {
    const existing = await Inventory.count({ where: { organizationId: org.id } });
    if (existing > 0) {
      console.log(`⏭️  Organización "${org.name}" ya tiene ${existing} productos en inventario. Omitida.`);
      continue;
    }

    await Inventory.bulkCreate(
      DEFAULT_INVENTORY.map((item) => ({ ...item, organizationId: org.id }))
    );
    created += DEFAULT_INVENTORY.length;
    console.log(`✅ ${DEFAULT_INVENTORY.length} productos creados para "${org.name}"`);
  }

  return created;
};

if (require.main === module) {
  (async () => {
    try {
      console.log('📦 Sembrando inventario inicial por defecto...\n');
      await sequelize.authenticate();
      const created = await seedDefaultInventory();
      console.log(`\n🎉 Listo. Productos creados: ${created}`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedDefaultInventory, DEFAULT_INVENTORY };