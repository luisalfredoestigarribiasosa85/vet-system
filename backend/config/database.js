const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      options: {
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    };
  }

  const requiredVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
  const missingVars = requiredVars.filter((variable) => !process.env[variable]);

  if (missingVars.length > 0) {
    throw new Error(
      `Faltan variables de entorno para la base de datos: ${missingVars.join(', ')}. ` +
      'Revisa backend/.env o define DATABASE_URL.'
    );
  }

  return {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  };
};

const databaseConfig = getDatabaseConfig();

const sequelize = databaseConfig.url
  ? new Sequelize(databaseConfig.url, databaseConfig.options)
  : new Sequelize(
      databaseConfig.database,
      databaseConfig.username,
      databaseConfig.password,
      databaseConfig.options
    );

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
};

module.exports = { sequelize, testConnection };
