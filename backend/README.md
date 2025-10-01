# Sistema Veterinaria - Backend

## Instalación

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
Crear archivo `.env` en la raíz del proyecto:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=vet_system
DB_USER=vet_admin
DB_PASSWORD=tu_contraseña

JWT_SECRET=clave_secreta_muy_larga_y_segura
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app

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

# Modo producción
npm start
```

El servidor estará disponible en: http://localhost:5000

## Endpoints de la API

### Autenticación
- POST `/api/auth/register` - Registrar usuario (solo admin)
- POST `/api/auth/login` - Iniciar sesión
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
- POST `/api/appointments` - Crear cita
- PUT `/api/appointments/:id` - Actualizar cita
- DELETE `/api/appointments/:id` - Eliminar cita

### Historial Médico
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

### Facturación
- GET `/api/invoices` - Listar facturas
- GET `/api/invoices/:id` - Obtener factura
- GET `/api/invoices/reports/revenue` - Reporte de ingresos
- POST `/api/invoices` - Crear factura

## Estructura del Proyecto

```
backend/
├── config/
│   ├── database.js
│   └── jwt.js
├── controllers/
│   ├── authController.js
│   ├── clientController.js
│   └── ...
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Client.js
│   ├── Pet.js
│   └── ...
├── routes/
│   ├── auth.js
│   ├── clients.js
│   └── ...
├── scripts/
│   └── seed.js
├── utils/
│   ├── emailService.js
│   └── pdfGenerator.js
├── .env
├── server.js
└── package.json
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
    "name": "Carlos Gómez",
    "phone": "0984-567890",
    "email": "carlos@email.com",
    "address": "Calle 123, Asunción"
  }'
```

## Notas de Seguridad

- Cambiar JWT_SECRET en producción
- Usar contraseñas fuertes
- Configurar CORS apropiadamente
- Usar HTTPS en producción
- Implementar rate limiting
- Validar todos los inputs

## Funcionalidades Adicionales Recomendadas

1. **Rate Limiting**: Limitar peticiones por IP
2. **Logging**: Sistema de logs con Winston
3. **Validación**: Joi para validar datos de entrada
4. **Documentación**: Swagger/OpenAPI
5. **Tests**: Jest para pruebas unitarias
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
