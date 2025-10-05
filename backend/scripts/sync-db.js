// backend/scripts/sync-db.js
const { sequelize } = require('../config/database');
// Import all models to ensure they are registered with Sequelize
require('../models');

const syncDatabase = async () => {
  console.log('Iniciando sincronización de la base de datos...');
  try {
    // The { alter: true } option checks the current state of the table in the database (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model.
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
  } finally {
    await sequelize.close();
    console.log('Conexión a la base de datos cerrada.');
  }
};

syncDatabase();
