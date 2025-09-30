const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Importar modelos para sincronización
require('./models/User');
require('./models/Client');
require('./models/Pet');
require('./models/Appointment');
require('./models/MedicalRecord');
require('./models/Inventory');
require('./models/Invoice');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/medical', require('./routes/medical'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/invoices', require('./routes/invoices'));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema Veterinaria',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      pets: '/api/pets',
      appointments: '/api/appointments',
      medical: '/api/medical',
      inventory: '/api/inventory',
      invoices: '/api/invoices'
    }
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión
    await testConnection();
    
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

// Manejar cierre del servidor
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});