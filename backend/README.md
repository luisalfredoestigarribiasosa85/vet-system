# Sistema Veterinaria - Backend

## Instalaci??n

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd backend
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar PostgreSQL
- Instalar PostgreSQL
- Crear base de datos: `vet_system`
- Crear usuario con permisos

### 4. Configurar variables de entorno
Crear archivo `.env` en la ra??z del proyecto:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=vet_system
DB_USER=vet_admin
DB_PASSWORD=tu_contrase??a

JWT_SECRET=clave_secreta_muy_larga_y_segura
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contrase??a_app

FRONTEND_URL=http://localhost:3000
```

### 5. Inicializar base de datos con datos de prueba
```bash
pnpm run seed
```

### 6. Iniciar servidor
```bash
# Modo desarrollo (con auto-reload)
pnpm run dev
## Testing

El sistema incluye tests unitarios e integración con Jest.

```bash
# Ejecutar todos los tests
pnpm test

# Modo watch
pnpm run test:watch

# Ver cobertura
pnpm run test:coverage
```

**Ver guía completa**: [TESTING.md](./TESTING.md)

## Seguridad

El sistema implementa múltiples capas de seguridad:

- ✅ **Helmet.js**: Headers HTTP seguros
- ✅ **Rate Limiting**: Protección contra ataques de fuerza bruta
- ✅ **Joi Validation**: Validación robusta de inputs
- ✅ **Sanitización**: Prevención de XSS y NoSQL injection
- ✅ **CORS**: Control de orígenes permitidos
- ✅ **Winston Logging**: Sistema de logs estructurado

**Ver guía completa**: [SECURITY.md](./SECURITY.md)

## Endpoints de la API

### Autenticaci??n
- POST `/api/auth/register` - Registrar usuario (solo admin)
- POST `/api/auth/login` - Iniciar sesi??n
- GET `/api/auth/me` - Obtener usuario actual

### Clientes
- GET `/api/clients` - Listar clientes
- GET `/api/clients/:id` - Obtener cliente por ID
- POST `/api/clients` - Crear cliente
- PUT `/api/clients/:id` - Actualizar cliente
- DELETE `/api/clients/:id` - Eliminar cliente

### Mascotas
- GET `/api/pets` - Listar mascotas
- GET `/api/pets/:id` - Obtener mascota por ID
- POST `/api/pets` - Crear mascota
- PUT `/api/pets/:id` - Actualizar mascota
- DELETE `/api/pets/:id` - Eliminar mascota

### Citas
- GET `/api/appointments` - Listar citas
- GET `/api/appointments?date=YYYY-MM-DD` - Filtrar por fecha
- GET `/api/appointments/availability?vetId=1&date=YYYY-MM-DD` - Consultar disponibilidad
- GET `/api/appointments/veterinarians` - Listar veterinarios
- POST `/api/appointments` - Crear cita (requiere petId, vetId, date, time; opcional durationMinutes)
- PUT `/api/appointments/:id` - Actualizar cita
- DELETE `/api/appointments/:id` - Cancelar cita (soft delete)

### Portal de Clientes
- POST `/api/portal/register` - Registrar nuevo cliente y usuario
- GET `/api/portal/profile` - Obtener perfil, mascotas y citas del cliente autenticado
- GET `/api/portal/pets` - Listar mascotas del cliente
- GET `/api/portal/pets/:id/records` - Historial medico de una mascota propia
- GET `/api/portal/appointments` - Listar citas del cliente
- POST `/api/portal/appointments` - Solicitar nueva cita
- PUT `/api/portal/appointments/:id` - Actualizar cita existente del cliente
- DELETE `/api/portal/appointments/:id` - Cancelar cita

### Historial M??dico
- GET `/api/medical` - Listar registros
- GET `/api/medical?petId=1` - Filtrar por mascota
- POST `/api/medical` - Crear registro
- PUT `/api/medical/:id` - Actualizar registro

### Inventario
- GET `/api/inventory` - Listar productos
- GET `/api/inventory/alerts` - Obtener alertas
- POST `/api/inventory` - Crear producto
- PUT `/api/inventory/:id` - Actualizar producto
- DELETE `/api/inventory/:id` - Eliminar producto

### Facturaci??n
- GET `/api/invoices` - Listar facturas
- GET `/api/invoices/:id` - Obtener factura
- GET `/api/invoices/reports/revenue` - Reporte de ingresos
- POST `/api/invoices` - Crear factura

## Estructura del Proyecto

```
backend/
????????? config/
???   ????????? database.js
???   ????????? jwt.js
????????? controllers/
???   ????????? authController.js
???   ????????? clientController.js
???   ????????? ...
????????? middleware/
???   ????????? auth.js
???   ????????? errorHandler.js
????????? models/
???   ????????? User.js
???   ????????? Client.js
???   ????????? Pet.js
???   ????????? ...
????????? routes/
???   ????????? auth.js
???   ????????? clients.js
???   ????????? ...
????????? scripts/
???   ????????? seed.js
????????? utils/
???   ????????? emailService.js
???   ????????? pdfGenerator.js
????????? .env
????????? server.js
????????? package.json
```

## Prueba de Endpoints

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Obtener clientes (requiere token)
```bash
curl -X GET http://localhost:5000/api/clients \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Crear cliente
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Carlos G??mez",
    "phone": "0984-567890",
    "email": "carlos@email.com",
    "address": "Calle 123, Asunci??n"
  }'
```

## Notas de Seguridad

- Cambiar JWT_SECRET en producci??n
- Usar contrase??as fuertes
- Configurar CORS apropiadamente
- Usar HTTPS en producci??n
- Implementar rate limiting
- Validar todos los inputs

## Testing

### Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Modo watch
pnpm run test:watch

# Ver cobertura
pnpm run test:coverage
```

### Estructura de Tests

- `tests/unit/models/` - Tests unitarios de modelos
- `tests/integration/` - Tests de integración de endpoints

Ver [TESTING.md](./TESTING.md) para guía completa.

## Seguridad

### Características Implementadas

✅ **Rate Limiting** - Protección contra ataques de fuerza bruta
✅ **Helmet.js** - Headers HTTP seguros
✅ **Joi Validation** - Validación robusta de inputs
✅ **Input Sanitization** - Prevención de XSS y NoSQL injection
✅ **CORS** - Control de orígenes permitidos
✅ **Winston Logging** - Sistema de logs estructurado

### Rate Limits

| Endpoint | Desarrollo | Producción |
|----------|-----------|------------|
| General | 1000/15min | 100/15min |
| Auth | 50/15min | 5/15min |
| API | 500/15min | 50/15min |

### Logs

Los logs se guardan en `logs/`:
- `error-YYYY-MM-DD.log` - Solo errores
- `combined-YYYY-MM-DD.log` - Todos los logs

Ver [SECURITY.md](./SECURITY.md) para documentación completa.

## Funcionalidades Adicionales Recomendadas

1. ~~**Rate Limiting**~~ ✅ Implementado
2. ~~**Logging**~~ ✅ Implementado con Winston
3. ~~**Validación**~~ ✅ Implementado con Joi
4. **Documentación**: Swagger/OpenAPI
5. ~~**Tests**~~ ✅ Implementado con Jest
6. **Monitoreo**: PM2 para producción
7. **Caché**: Redis para mejorar performance

## Despliegue

### Heroku
```bash
heroku create nombre-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Railway
```bash
railway login
railway init
railway add postgresql
railway up
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```



