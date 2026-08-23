# VetSystem - SaaS Edition

## Transformación a Software as a Service

Este documento explica cómo convertir VetSystem de una aplicación tradicional a una plataforma SaaS multi-tenant.

## 🏗️ Arquitectura SaaS Implementada

### 1. Multi-Tenancy

- **Modelo Organization**: Cada cliente tiene su propia "organización"
- **Subdominios únicos**: `clinica-vet.vet-system.com`
- **Aislamiento de datos**: Cada organización solo ve sus propios datos
- **Límites por plan**: Restricciones basadas en la suscripción

### 2. Modelos de Datos

```sql
-- Nuevas tablas SaaS
organizations (id, name, subdomain, settings, trialEndsAt, ...)
subscriptions (organizationId, planId, stripeSubscriptionId, status, ...)
plans (name, price, limits, features, stripePriceId, ...)

-- Campos agregados a tablas existentes
users.organizationId, users.organizationRole, users.invitedBy, ...
clients.organizationId
pets.organizationId
appointments.organizationId
-- etc.
```

### 3. Sistema de Suscripciones

- **4 planes disponibles**: Free, Basic, Pro, Enterprise
- **Período de prueba**: 14 días por defecto
- **Facturación mensual**: Integración con Stripe
- **Límites configurables**: Usuarios, clientes, mascotas, etc.

## 🚀 Guía de Implementación

### Paso 1: Configuración de Base de Datos

1. **Ejecutar migración SaaS**:

```bash
cd backend
pnpm run migrate-saas
```

2. **Crear planes por defecto**:

```bash
node scripts/create-default-plans.js
```

### Paso 2: Configuración de Stripe

1. **Crear cuenta en Stripe** (https://stripe.com)
2. **Configurar productos y precios**:

   - Free: $0/mes
   - Basic: $50/mes (Gs. 200.000 aprox)
   - Pro: $150/mes (Gs. 600.000 aprox)
   - Enterprise: $500/mes (Gs. 2.000.000 aprox)

3. **Variables de entorno**:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Paso 3: Configuración del Servidor

1. **Instalar dependencias adicionales**:

```bash
pnpm install stripe redis winston
```

2. **Configurar webhooks de Stripe**:
   - URL: `https://tu-dominio.com/api/subscriptions/webhook`
   - Eventos: `checkout.session.completed`, `invoice.payment_succeeded`, etc.

### Paso 4: Configuración de Dominios

1. **Configurar subdominios**:

   - `*.vet-system.com` → apunta a tu servidor
   - Middleware detecta subdominio y establece contexto de organización

2. **SSL Certificate**:
   - Configurar certificado wildcard para subdominios

## 📋 Características SaaS

### ✅ Implementadas

- [x] Modelos multi-tenant (Organization, Subscription, Plan)
- [x] Middleware de autenticación multi-tenant
- [x] Límites de uso por plan
- [x] Sistema de planes (Free, Basic, Pro, Enterprise)
- [x] Página de onboarding
- [x] Gestión de suscripciones
- [x] Integración básica con Stripe
- [x] Migración de base de datos

### 🔄 Pendientes

- [ ] Panel de administración completo
- [ ] Sistema de invitaciones de usuarios
- [ ] Analytics avanzados de uso
- [ ] White-label (marcas personalizadas)
- [ ] API para integraciones de terceros
- [ ] Backup automático por organización
- [ ] Notificaciones de uso próximo a límite

## 🎯 Modelo de Negocio

### Planes Disponibles

| Plan       | Precio          | Usuarios | Clientes | Mascotas | Características |
| ---------- | --------------- | -------- | -------- | -------- | --------------- |
| Free       | Gs. 0           | 1        | 10       | 25       | Básico          |
| Basic      | Gs. 50.000/mes  | 3        | 100      | 200      | Intermedio      |
| Pro        | Gs. 150.000/mes | 10       | 500      | 1000     | Avanzado        |
| Enterprise | Gs. 500.000/mes | ∞        | ∞        | ∞        | Completo        |

### Métricas de Éxito

- **MRR (Monthly Recurring Revenue)**: Ingresos mensuales recurrentes
- **Churn Rate**: Tasa de cancelación de suscripciones
- **LTV (Lifetime Value)**: Valor de vida del cliente
- **CAC (Customer Acquisition Cost)**: Costo de adquisición de clientes

## 🔧 Configuración Técnica

### Variables de Entorno

```env
# SaaS Settings
DEFAULT_TRIAL_DAYS=14
MAX_ORGANIZATIONS_PER_USER=5
ALLOW_SELF_REGISTRATION=true

# Proveedor de Pagos (pagopar, payu, stripe, mercadopago)
# Por defecto: pagopar (recomendado para Paraguay)
PAYMENT_PROVIDER=pagopar

# PagoPar (Recomendado para Paraguay) ⭐
PAGOPAR_TOKEN=tu_token
PAGOPAR_PUBLIC_KEY=tu_public_key
PAGOPAR_PRIVATE_KEY=tu_private_key

# PayU Latam (NO disponible en Paraguay)
PAYU_API_KEY=tu_api_key
PAYU_API_LOGIN=tu_api_login
PAYU_MERCHANT_ID=tu_merchant_id
PAYU_ACCOUNT_ID=tu_account_id

# Stripe (Solo si PAYMENT_PROVIDER=stripe)
# Nota: Stripe no está disponible en Paraguay
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=support@vet-system.com
```

#### Proveedores de Pago Soportados

El sistema soporta múltiples proveedores de pagos mediante una arquitectura modular:

1. **PayU Latam** (Recomendado para Paraguay)

   - Disponible en toda América Latina
   - Soporta suscripciones recurrentes
   - Acepta tarjetas de crédito/débito y transferencias bancarias
   - Documentación: https://developers.payulatam.com/latam/en/docs/

2. **Stripe** (No disponible en Paraguay)

   - Solo para uso en países donde Stripe está disponible
   - Mantenido para compatibilidad

3. **Mercado Pago** (Próximamente)
   - Próxima implementación para mayor cobertura en la región

### Middleware de Seguridad

- Rate limiting por organización
- Límites de API calls
- Validación de subdominios
- Protección contra abuso

## 📊 Dashboard Administrativo

### Para Super Admin

- **Métricas generales**: MRR, usuarios totales, organizaciones activas
- **Gestión de organizaciones**: Crear, suspender, eliminar
- **Planes y precios**: Modificar límites y precios
- **Facturación**: Ver pagos, reembolsos, disputas

### Para Owners de Organización

- **Uso actual**: Gráficos de consumo por recurso
- **Facturación**: Historial de pagos, facturas pendientes
- **Equipo**: Invitar/eliminar usuarios
- **Configuración**: Personalizar marca, notificaciones

## 🚀 Próximos Pasos

1. **Completar integración Stripe**:

   - Webhooks completos
   - Manejo de fallos de pago
   - Reintentos automáticos

2. **Sistema de Invitaciones**:

   - Invitar usuarios por email
   - Roles y permisos granulares
   - Aprobación de owners

3. **Analytics Avanzados**:

   - Uso por organización
   - Métricas de engagement
   - Reportes automáticos

4. **Escalabilidad**:
   - Base de datos por organización (sharding)
   - CDN para archivos estáticos
   - Cache distribuido (Redis)

## 📞 Soporte

Para soporte técnico del SaaS contactar a:

- Email: support@vet-system.com
- Documentación: https://docs.vet-system.com/saas

---

_Este documento se actualiza continuamente según se implementan nuevas características SaaS._
