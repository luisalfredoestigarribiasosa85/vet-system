require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a PostgreSQL!');
    console.log('📊 Base de datos:', process.env.DB_NAME);
    console.log('👤 Usuario:', process.env.DB_USER);
    console.log('🖥️  Host:', process.env.DB_HOST + ':' + process.env.DB_PORT);
    
    // Probar crear una tabla de prueba
    await sequelize.query('CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY)');
    await sequelize.query('DROP TABLE IF EXISTS test');
    console.log('✅ Permisos de escritura: OK');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔍 Verifica:');
    console.log('1. PostgreSQL está corriendo (services.msc)');
    console.log('2. Base de datos existe:', process.env.DB_NAME);
    console.log('3. Usuario correcto:', process.env.DB_USER);
    console.log('4. Contraseña correcta en .env');
    console.log('5. Puerto disponible:', process.env.DB_PORT);
  } finally {
    await sequelize.close();
  }
}

testConnection();