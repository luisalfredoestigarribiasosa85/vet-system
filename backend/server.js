const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Iniciar tareas programadas
require('./services/scheduler.js');

// Registrar modelos y asociaciones
require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estaticos
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/medical', require('./routes/medicalRoutes'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/portal', require('./routes/portal'));

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

const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});
