# Seguridad del Sistema

## Medidas de Seguridad Implementadas

### 1. Headers de Seguridad (Helmet.js)

El sistema utiliza `helmet.js` para configurar headers HTTP seguros:

- **Content Security Policy (CSP)**: Previene ataques XSS
- **X-Frame-Options**: Previene clickjacking
- **X-Content-Type-Options**: Previene MIME sniffing
- **Strict-Transport-Security**: Fuerza HTTPS en producción

### 2. Rate Limiting

Protección contra ataques de fuerza bruta y DDoS:

#### Límites Configurados

| Endpoint | Desarrollo | Producción | Ventana |
|----------|-----------|------------|---------|
| General | 1000 req | 100 req | 15 min |
| Auth (login/register) | 50 req | 5 req | 15 min |
| API | 500 req | 50 req | 15 min |
| Operaciones sensibles | 100 req | 10 req | 1 hora |

#### Uso

```javascript
// Aplicado automáticamente a todos los endpoints
// Para endpoints específicos:
const { authLimiter } = require('./middleware/rateLimiter');
router.post('/login', authLimiter, loginController);
```

### 3. Validación de Inputs (Joi)

Validación robusta de todos los datos de entrada:

#### Schemas Disponibles

- **authValidators**: Login, registro, registro de portal
- **clientValidators**: Crear y actualizar clientes
- **appointmentValidators**: Crear, actualizar citas y consultar disponibilidad

#### Ejemplo de Uso

```javascript
const { validate } = require('./middleware/validator');
const { createClientSchema } = require('./validators/clientValidators');

router.post('/clients', protect, validate(createClientSchema), createClient);
```

#### Beneficios

- Mensajes de error descriptivos en español
- Validación de tipos de datos
- Validación de formatos (email, teléfono, etc.)
- Prevención de datos maliciosos

### 4. Sanitización de Inputs

Protección contra inyecciones:

#### NoSQL Injection
- Remueve operadores de MongoDB/Sequelize (`$`, `.`)
- Aplicado automáticamente a todos los requests

#### XSS (Cross-Site Scripting)
- Limpia HTML y scripts maliciosos
- Sanitiza strings recursivamente

#### Uso Manual

```javascript
const { sanitizeString, sanitizeObject } = require('./middleware/sanitizer');

const cleanName = sanitizeString(userInput);
const cleanData = sanitizeObject(requestBody);
```

### 5. CORS (Cross-Origin Resource Sharing)

Configuración estricta de orígenes permitidos:

```javascript
// Orígenes permitidos
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
];
```

### 6. Logging con Winston

Sistema de logs estructurado para auditoría y debugging:

#### Niveles de Log

- **error**: Errores críticos
- **warn**: Advertencias
- **info**: Información general
- **http**: Requests HTTP
- **debug**: Información de debugging

#### Archivos de Log

- `logs/error-YYYY-MM-DD.log`: Solo errores
- `logs/combined-YYYY-MM-DD.log`: Todos los logs
- Rotación diaria, retención de 30 días

#### Uso

```javascript
const logger = require('./config/logger');

logger.info('Usuario creado exitosamente');
logger.error('Error al conectar a base de datos', { error });
logger.http('GET /api/clients - 200');
```

## Configuración de Variables de Entorno

### Variables de Seguridad

```env
# JWT
JWT_SECRET=clave_secreta_muy_larga_y_segura_cambiar_en_produccion
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Modo
NODE_ENV=production  # development | production
```

## Mejores Prácticas

### 1. Contraseñas

- ✅ Mínimo 6 caracteres (recomendado 12+)
- ✅ Hash con bcrypt (10 rounds)
- ✅ Nunca almacenar en texto plano
- ✅ Nunca retornar en responses

### 2. Tokens JWT

- ✅ Expiración configurada (7 días por defecto)
- ✅ Secret fuerte y único por ambiente
- ✅ Almacenar en localStorage (frontend)
- ✅ Incluir en header Authorization

### 3. Inputs de Usuario

- ✅ Siempre validar con Joi
- ✅ Siempre sanitizar
- ✅ Límites de tamaño (10MB para JSON)
- ✅ Mensajes de error genéricos (no revelar info sensible)

### 4. Base de Datos

- ✅ Usar prepared statements (Sequelize)
- ✅ Validar tipos de datos
- ✅ Soft deletes (isActive flag)
- ✅ Backups regulares

### 5. Producción

- ✅ HTTPS obligatorio
- ✅ Variables de entorno seguras
- ✅ Rate limiting estricto
- ✅ Logs monitoreados
- ✅ Actualizaciones de dependencias

## Monitoreo de Seguridad

### Logs a Revisar

```bash
# Ver errores recientes
tail -f logs/error-$(date +%Y-%m-%d).log

# Ver todos los logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Buscar intentos de login fallidos
grep "login failed" logs/combined-*.log
```

### Alertas Recomendadas

1. **Múltiples intentos de login fallidos** → Posible ataque de fuerza bruta
2. **Rate limit excedido frecuentemente** → Posible DDoS
3. **Errores de validación repetidos** → Posible intento de inyección
4. **Accesos no autorizados** → Posible token comprometido

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. **NO** la publiques públicamente
2. Contacta al equipo de desarrollo
3. Proporciona detalles técnicos
4. Espera confirmación antes de divulgar

## Actualizaciones de Seguridad

### Dependencias

```bash
# Verificar vulnerabilidades
pnpm audit

# Actualizar dependencias con vulnerabilidades
pnpm update

# Actualizar todas las dependencias
pnpm update --latest
```

### Checklist de Actualización

- [ ] Revisar changelog de dependencias
- [ ] Ejecutar tests
- [ ] Verificar en ambiente de staging
- [ ] Desplegar en producción
- [ ] Monitorear logs por 24h

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Joi Validation](https://joi.dev/api/)
- [Winston Logging](https://github.com/winstonjs/winston)
