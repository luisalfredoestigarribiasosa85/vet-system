# Sistema Veterinaria - Backend

## Instalaci??n

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd backend
```

### 2. Instalar dependencias
```bash
npm install
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
npm run seed
```

### 6. Iniciar servidor
```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producci??n
npm start
```

### Scripts utiles
- `npm run backfill:appointments` - recalcula startDateTime, endDateTime y durationMinutes en citas existentes.

El servidor estar?? disponible en: http://localhost:5000

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

## Funcionalidades Adicionales Recomendadas

1. **Rate Limiting**: Limitar peticiones por IP
2. **Logging**: Sistema de logs con Winston
3. **Validaci??n**: Joi para validar datos de entrada
4. **Documentaci??n**: Swagger/OpenAPI
5. **Tests**: Jest para pruebas unitarias
6. **Monitoreo**: PM2 para producci??n
7. **Cach??**: Redis para mejorar performance

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

