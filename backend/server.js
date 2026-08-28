const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { sequelize, testConnection } = require('./config/database');
const { corsOptions, helmetConfig } = require('./config/security');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const { sanitizeInputs } = require('./middleware/sanitizer');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Iniciar tareas programadas
require('./services/scheduler.js');

// Registrar modelos y asociaciones
require('./models');

const app = express();

// Confianza en proxy inverso (necesario para que express-rate-limit vea la IP real detrás de nginx, etc.)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Seguridad: headers HTTP (Helmet)
app.use(helmetConfig);

// Relajar CSP únicamente en /api-docs (Swagger UI requiere scripts y estilos inline)
app.use('/api-docs', (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:"
  );
  next();
});

// Seguridad: CORS restringido a orígenes permitidos
app.use(cors(corsOptions));

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Seguridad: sanitización de inputs contra XSS
// Nota: en Express 5, req.query es de solo lectura, por lo que la sanitización
// se aplica efectivamente sobre body y params (la BD es PostgreSQL con Sequelize,
// donde la inyección NoSQL no aplica).
app.use(sanitizeInputs);

// Rate limiting: límite general para toda la API
app.use('/api', generalLimiter);

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging HTTP con Winston (niveles http en producción, debug en desarrollo)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    // Evitar ruido: Swagger UI, archivos estáticos y favicon
    if (req.originalUrl.startsWith('/api-docs') || req.originalUrl.startsWith('/uploads') || req.path === '/favicon.ico') {
      return;
    }
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Veterinaria - Documentación',
}));

// Rutas (authLimiter extra para endpoints sensibles de autenticación)
app.use('/api/auth', authLimiter, require('./routes/auth'));
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
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

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
      organizations: '/api/organizations',
      subscriptions: '/api/subscriptions',
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
    logger.info('Base de datos lista');

    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en puerto ${PORT}`);
      logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Tip: Ejecuta 'pnpm run seed' para inicializar la base de datos`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});
