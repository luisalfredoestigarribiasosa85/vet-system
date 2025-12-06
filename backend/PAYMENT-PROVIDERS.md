# Proveedores de Pagos

Este sistema soporta múltiples proveedores de pagos mediante una arquitectura modular y extensible.

## Proveedores Disponibles

### 1. PagoPar (Recomendado para Paraguay) ⭐

PagoPar es la solución de pagos local más popular en Paraguay. Ofrece:

- ✅ Disponible y operativo en Paraguay
- ✅ Suscripciones recurrentes
- ✅ Múltiples métodos de pago (tarjetas, billeteras electrónicas, QR, transferencias bancarias, PIX)
- ✅ API completa para integración
- ✅ Soporte local en español

#### Configuración

```env
PAYMENT_PROVIDER=pagopar
PAGOPAR_TOKEN=tu_token
PAGOPAR_PUBLIC_KEY=tu_public_key
PAGOPAR_PRIVATE_KEY=tu_private_key
```

#### Obtener Credenciales

1. Registrarse en [PagoPar](https://www.pagopar.com/)
2. Crear una cuenta de comercio
3. Obtener las credenciales (token, public_key, private_key) desde el panel de administración
4. Para pruebas, usar el ambiente de desarrollo/sandbox

#### Documentación

- Sitio web: https://www.pagopar.com/
- Soporte para suscripciones: https://www.pagopar.com/suscripciones

### 2. PayU Latam

PayU es una opción para América Latina, pero **NO está disponible en Paraguay**.

#### Configuración

```env
PAYMENT_PROVIDER=payu
PAYU_API_KEY=tu_api_key
PAYU_API_LOGIN=tu_api_login
PAYU_MERCHANT_ID=tu_merchant_id
PAYU_ACCOUNT_ID=tu_account_id
```

### 3. Stripe (No disponible en Paraguay)

Stripe solo está disponible en ciertos países. **No funciona en Paraguay**.

#### Configuración

```env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Arquitectura

El sistema usa un patrón de Factory y Strategy para soportar múltiples proveedores:

```
services/paymentProviders/
├── PaymentProvider.js      # Clase base abstracta
├── PagoParProvider.js      # Implementación de PagoPar (Paraguay)
├── PayUProvider.js         # Implementación de PayU
├── StripeProvider.js       # Implementación de Stripe
└── index.js                # Factory para obtener el proveedor
```

### Agregar un Nuevo Proveedor

1. Crear una nueva clase que extienda `PaymentProvider`
2. Implementar todos los métodos abstractos:

   - `createCheckoutSession()`
   - `createSubscription()`
   - `cancelSubscription()`
   - `reactivateSubscription()`
   - `verifyWebhook()`
   - `getSubscription()`
   - `createPlan()`

3. Agregar el proveedor al factory en `index.js`

Ejemplo:

```javascript
const MercadoPagoProvider = require('./MercadoPagoProvider');

// En PaymentProviderFactory.getProvider()
case 'mercadopago':
    return new MercadoPagoProvider({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        // ... otros configs
    });
```

## Uso en el Código

```javascript
const PaymentProviderFactory = require("../services/paymentProviders");

// Obtener el proveedor configurado
const provider = PaymentProviderFactory.getProvider();

// Crear sesión de checkout
const session = await provider.createCheckoutSession({
  planId: 1,
  price: 50000,
  currency: "PYG",
  interval: "month",
  customerEmail: "cliente@example.com",
  successUrl: "https://...",
  cancelUrl: "https://...",
  metadata: {
    /* ... */
  },
});
```

## Webhooks

Cada proveedor tiene su propio formato de webhook. El sistema maneja esto automáticamente:

- **Stripe**: Usa `stripe-signature` header
- **PayU**: Usa `x-payu-signature` header
- **PagoPar**: Usa `x-pagopar-signature` header o firma en el payload

El endpoint `/api/subscriptions/webhook` maneja todos los formatos automáticamente.

## Migración de Datos

Si cambias de proveedor, los campos en la base de datos son compatibles:

- `stripeSubscriptionId` → `providerSubscriptionId` (genérico)
- `stripeCustomerId` → `providerCustomerId` (genérico)
- `stripePriceId` → `paymentProviderId` (en Plan)

Los campos antiguos se mantienen para compatibilidad hacia atrás.

## Próximos Proveedores

- [ ] Mercado Pago (si está disponible en Paraguay)
- [ ] RePay (solución local de Paraguay)
- [ ] Paypy (solución local de Paraguay)
- [ ] PlugPay (solución local de Paraguay)

## Soporte

Para problemas con la integración de pagos:

- Revisar los logs del servidor
- Verificar las credenciales en `.env`
- Consultar la documentación del proveedor específico
