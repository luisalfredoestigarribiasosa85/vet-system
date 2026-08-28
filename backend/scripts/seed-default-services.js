require('dotenv').config();
const { sequelize } = require('../config/database');
const { Service, Organization } = require('../models');

/**
 * Catálogo estándar de servicios veterinarios (precios en Guaraníes).
 * Se usa al sembrar la base (seed.js) y para poblar organizaciones existentes.
 */
const DEFAULT_SERVICES = [
  { name: 'Consulta general', description: 'Consulta veterinaria de rutina con examen clínico completo', price: 80000, category: 'consulta', duration: 30 },
  { name: 'Consulta a domicilio', description: 'Atención veterinaria en la residencia del cliente', price: 150000, category: 'consulta', duration: 45 },
  { name: 'Vacunación', description: 'Aplicación de vacunas (el precio no incluye el biológico)', price: 60000, category: 'vacuna', duration: 20 },
  { name: 'Desparasitación', description: 'Desparasitación interna y/o externa', price: 50000, category: 'vacuna', duration: 15 },
  { name: 'Cirugía menor', description: 'Procedimientos quirúrgicos ambulatorios', price: 350000, category: 'cirugia', duration: 90 },
  { name: 'Limpieza dental', description: 'Profilaxis dental con anestesia', price: 180000, category: 'cirugia', duration: 60 },
  { name: 'Análisis de laboratorio', description: 'Hematología y bioquímica básica', price: 120000, category: 'laboratorio', duration: 40 },
  { name: 'Radiografía', description: 'Estudio radiográfico digital', price: 100000, category: 'laboratorio', duration: 30 },
  { name: 'Baño y peluquería', description: 'Higiene y estética general', price: 70000, category: 'otro', duration: 60 },
  { name: 'Emergencia nocturna', description: 'Atención de urgencias fuera de horario', price: 250000, category: 'otro', duration: 45 },
];

/**
 * Puebla el catálogo de servicios por defecto.
 * Idempotente: omite organizaciones que ya tengan servicios registrados.
 * @param {number|null} organizationId Si es null, procesa todas las organizaciones activas.
 * @returns {number} Cantidad de servicios creados.
 */
const seedDefaultServices = async (organizationId = null) => {
  const organizations = organizationId
    ? await Organization.findAll({ where: { id: organizationId } })
    : await Organization.findAll({ where: { isActive: true } });

  let created = 0;

  for (const org of organizations) {
    const existing = await Service.count({ where: { organizationId: org.id } });
    if (existing > 0) {
      console.log(`⏭️  Organización "${org.name}" ya tiene ${existing} servicios. Omitida.`);
      continue;
    }

    await Service.bulkCreate(
      DEFAULT_SERVICES.map((service) => ({ ...service, organizationId: org.id }))
    );
    created += DEFAULT_SERVICES.length;
    console.log(`✅ ${DEFAULT_SERVICES.length} servicios creados para "${org.name}"`);
  }

  return created;
};

if (require.main === module) {
  (async () => {
    try {
      console.log('🛠️  Sembrando catálogo de servicios por defecto...\n');
      await sequelize.authenticate();
      const created = await seedDefaultServices();
      console.log(`\n🎉 Listo. Servicios creados: ${created}`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedDefaultServices, DEFAULT_SERVICES };
