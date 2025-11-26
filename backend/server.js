const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { sequelize, testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Iniciar tareas programadas
require('./services/scheduler.js');

// Registrar modelos y asociaciones
require('./models');

const app = express();

// Middleware básico
app.use(cors()); // CORS simple por ahora
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging simple (hasta que instales Winston)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Veterinaria - Documentación',
}));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/appointments', require('./routes/appointments'));

app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/services', require('./routes/services'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/portal', require('./routes/portal'));
app.use('/api/medical', require('./routes/medicalRecords'));
app.use('/api/vaccinations', require('./routes/vaccinations'));
app.use('/api/stats', require('./routes/stats'));

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
      invoices: '/api/invoices',
      plans: '/api/plans',
      payments: '/api/payments',
      portal: '/api/portal',
      vaccinations: '/api/vaccinations',
      stats: '/api/stats'
    }
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    // No usar sync en desarrollo - usar seed.js para crear/actualizar tablas
    // await sequelize.sync({ alter: true }); 
    console.log('✅ Base de datos lista');

    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💡 Tip: Ejecuta 'pnpm run seed' para inicializar la base de datos`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});
