const { Plan, Subscription, Organization } = require('../models');
const PaymentProviderFactory = require('../services/paymentProviders');

/**
 * Obtener todos los planes disponibles
 */
exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC']]
        });

        res.json(plans);
    } catch (error) {
        console.error('Error al obtener planes:', error);
        res.status(500).json({ message: 'Error al obtener planes' });
    }
};

/**
 * Obtener plan por ID
 */
exports.getPlanById = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await Plan.findByPk(id);

        if (!plan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }

        res.json(plan);
    } catch (error) {
        console.error('Error al obtener plan:', error);
        res.status(500).json({ message: 'Error al obtener plan' });
    }
};

/**
 * Crear sesión de checkout (compatible con múltiples proveedores)
 */
exports.createCheckoutSession = async (req, res) => {
    try {
        const { planId, successUrl, cancelUrl } = req.body;
        const user = req.user;
        const organization = req.organization;

        if (!organization) {
            return res.status(400).json({ message: 'Usuario no pertenece a ninguna organización' });
        }

        const plan = await Plan.findByPk(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }

        // Verificar que no haya suscripción activa
        const existingSubscription = await Subscription.findOne({
            where: {
                organizationId: organization.id,
                status: ['active', 'trialing']
            }
        });

        if (existingSubscription) {
            return res.status(400).json({
                message: 'Ya existe una suscripción activa para esta organización'
            });
        }

        // Obtener proveedor de pagos configurado
        const paymentProvider = PaymentProviderFactory.getProvider();
        const providerName = PaymentProviderFactory.getProviderName();

        // Crear sesión de checkout usando el proveedor
        const session = await paymentProvider.createCheckoutSession({
            planId: plan.id,
            price: plan.price,
            currency: plan.currency || 'PYG',
            interval: plan.interval || 'month',
            customerEmail: user.email,
            successUrl: successUrl || `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/subscription/cancel`,
            metadata: {
                organizationId: organization.id.toString(),
                planId: plan.id.toString(),
                userId: user.id.toString(),
                priceId: plan.paymentProviderId || plan.stripePriceId, // Compatibilidad hacia atrás
                sessionId: `session_${Date.now()}`,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            }
        });

        res.json({
            sessionId: session.sessionId,
            url: session.url || session.paymentUrl,
            provider: providerName
        });

    } catch (error) {
        console.error('Error al crear sesión de checkout:', error);
        res.status(500).json({
            message: 'Error al crear sesión de pago',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Webhook para manejar eventos de suscripción (compatible con múltiples proveedores)
 */
exports.handleWebhook = async (req, res) => {
    try {
        const paymentProvider = PaymentProviderFactory.getProvider();
        const providerName = PaymentProviderFactory.getProviderName();

        // Obtener firma según el proveedor
        let signature;
        if (providerName === 'stripe') {
            signature = req.headers['stripe-signature'];
        } else if (providerName === 'payu') {
            signature = req.headers['x-payu-signature'] || req.headers['signature'];
        } else if (providerName === 'pagopar') {
            signature = req.headers['x-pagopar-signature'] || req.headers['signature'] || req.body?.firma;
        } else {
            signature = req.headers['signature'] || req.headers['x-signature'];
        }

        // Verificar webhook
        let event;
        try {
            // req.body puede ser Buffer (raw) o objeto (JSON parseado)
            const payload = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);
            event = await paymentProvider.verifyWebhook(payload, signature);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Manejar diferentes tipos de eventos según el proveedor
        if (providerName === 'stripe') {
            await handleStripeWebhook(event);
        } else if (providerName === 'payu') {
            await handlePayUWebhook(event);
        } else if (providerName === 'pagopar') {
            await handlePagoParWebhook(event);
        } else {
            console.log(`Proveedor ${providerName} no tiene handler específico, usando genérico`);
            await handleGenericWebhook(event);
        }

        res.json({ received: true });

    } catch (error) {
        console.error('Error en webhook:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

/**
 * Manejar webhooks de Stripe
 */
async function handleStripeWebhook(event) {
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data);
            break;
        case 'invoice.payment_succeeded':
            await handleInvoicePaymentSucceeded(event.data);
            break;
        case 'invoice.payment_failed':
            await handleInvoicePaymentFailed(event.data);
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data);
            break;
        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
    }
}

/**
 * Manejar webhooks de PayU
 */
async function handlePayUWebhook(event) {
    const eventType = event.type || event.data?.state_pol;

    switch (eventType) {
        case 'APPROVED':
        case '4': // PayU código para aprobado
            await handlePayUApproved(event.data);
            break;
        case 'DECLINED':
        case '6': // PayU código para rechazado
            await handlePayUDeclined(event.data);
            break;
        case 'EXPIRED':
        case '5': // PayU código para expirado
            await handlePayUExpired(event.data);
            break;
        default:
            console.log(`Unhandled PayU event type: ${eventType}`);
    }
}

/**
 * Manejar webhooks de PagoPar
 */
async function handlePagoParWebhook(event) {
    const eventType = event.type || event.data?.tipo || event.data?.estado;

    switch (eventType) {
        case 'PAYMENT_SUCCESS':
        case 'PAYMENT_APPROVED':
        case 'PAGADO':
        case 'PAGADO.ACEPTADO':
            await handlePagoParApproved(event.data);
            break;
        case 'PAYMENT_REJECTED':
        case 'PAGADO.RECHAZADO':
            await handlePagoParRejected(event.data);
            break;
        case 'PENDING':
        case 'PENDIENTE':
            await handlePagoParPending(event.data);
            break;
        case 'CANCELLED':
        case 'CANCELADO':
            await handlePagoParCancelled(event.data);
            break;
        case 'EXPIRED':
        case 'VENCIDO':
            await handlePagoParExpired(event.data);
            break;
        default:
            console.log(`Unhandled PagoPar event type: ${eventType}`);
    }
}

/**
 * Manejar webhook genérico
 */
async function handleGenericWebhook(event) {
    console.log('Generic webhook handler:', event);
    // Implementar lógica genérica si es necesario
}

/**
 * Manejar checkout completado (genérico)
 */
async function handleCheckoutCompleted(session) {
    try {
        const metadata = session.metadata || {};
        const organizationId = metadata.organizationId || session.organizationId;
        const planId = metadata.planId || session.planId;

        if (!organizationId || !planId) {
            console.error('Faltan organizationId o planId en el webhook');
            return;
        }

        const paymentProvider = PaymentProviderFactory.getProvider();
        const providerName = PaymentProviderFactory.getProviderName();

        // Crear o actualizar suscripción
        const subscription = await Subscription.findOne({
            where: { organizationId }
        });

        const subscriptionData = {
            organizationId: parseInt(organizationId),
            planId: parseInt(planId),
            providerSubscriptionId: session.subscription || session.subscriptionId || session.id,
            providerCustomerId: session.customer || session.customerId,
            paymentProvider: providerName,
            // Mantener compatibilidad con campos antiguos
            stripeSubscriptionId: providerName === 'stripe' ? (session.subscription || session.id) : null,
            stripeCustomerId: providerName === 'stripe' ? session.customer : null,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            usageMetrics: {
                users: 1,
                clients: 0,
                pets: 0,
                appointments: 0,
                invoices: 0,
                storage: 0
            }
        };

        if (subscription) {
            await subscription.update(subscriptionData);
        } else {
            await Subscription.create(subscriptionData);
        }

        console.log(`Suscripción activada para organización ${organizationId}`);

    } catch (error) {
        console.error('Error al manejar checkout completado:', error);
    }
}

/**
 * Manejar pago aprobado de PayU
 */
async function handlePayUApproved(data) {
    try {
        const referenceCode = data.referenceCode || data.reference_sale;
        // El referenceCode debería contener el planId y organizationId
        // Formato: SUB_{planId}_{timestamp} o similar

        // Buscar suscripción por transactionId o referenceCode
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: data.transactionId || data.referenceCode
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            console.log(`Pago PayU aprobado para suscripción ${subscription.id}`);
        }
    } catch (error) {
        console.error('Error al manejar pago aprobado de PayU:', error);
    }
}

/**
 * Manejar pago rechazado de PayU
 */
async function handlePayUDeclined(data) {
    try {
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: data.transactionId || data.referenceCode
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'past_due'
            });
            console.log(`Pago PayU rechazado para suscripción ${subscription.id}`);
        }
    } catch (error) {
        console.error('Error al manejar pago rechazado de PayU:', error);
    }
}

/**
 * Manejar pago expirado de PayU
 */
async function handlePayUExpired(data) {
    try {
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: data.transactionId || data.referenceCode
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'incomplete_expired'
            });
            console.log(`Pago PayU expirado para suscripción ${subscription.id}`);
        }
    } catch (error) {
        console.error('Error al manejar pago expirado de PayU:', error);
    }
}

/**
 * Manejar pago aprobado de PagoPar
 */
async function handlePagoParApproved(data) {
    try {
        const idPedido = data.id_pedido || data.id_pedido_comercio || data.hash_pedido;
        const metadata = data.metadata || {};
        const organizationId = metadata.organizationId || data.organizationId;
        const planId = metadata.planId || data.planId;

        if (organizationId && planId) {
            await handleCheckoutCompleted({
                subscription: data.id_suscripcion || idPedido,
                customer: data.id_comprador || data.comprador_id,
                metadata: {
                    organizationId: organizationId.toString(),
                    planId: planId.toString()
                }
            });
        } else {
            // Buscar por ID de pedido o suscripción
            const subscription = await Subscription.findOne({
                where: {
                    providerSubscriptionId: data.id_suscripcion || idPedido
                }
            });

            if (subscription) {
                await subscription.update({
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
                console.log(`Pago PagoPar aprobado para suscripción ${subscription.id}`);
            }
        }
    } catch (error) {
        console.error('Error al manejar pago aprobado de PagoPar:', error);
    }
}

/**
 * Manejar pago rechazado de PagoPar
 */
async function handlePagoParRejected(data) {
    try {
        const idPedido = data.id_pedido || data.id_pedido_comercio || data.hash_pedido;
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: data.id_suscripcion || idPedido
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'past_due'
            });
            console.log(`Pago PagoPar rechazado para suscripción ${subscription.id}`);
        }
    } catch (error) {
        console.error('Error al manejar pago rechazado de PagoPar:', error);
    }
}

/**
 * Manejar pago pendiente de PagoPar
 */
async function handlePagoParPending(data) {
    try {
        const idPedido = data.id_pedido || data.id_pedido_comercio || data.hash_pedido;
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: data.id_suscripcion || idPedido
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'incomplete'
            });
            console.log(`Pago PagoPar pendiente para suscripción ${subscription.id}`);
        }
    } catch (error) {
        console.error('Error al manejar pago pendiente de PagoPar:', error);
    }
}

/**
 * Manejar suscripción cancelada de PagoPar
 */
async function handlePagoParCancelled(data) {
    try {
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: data.id_suscripcion
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'canceled',
                canceledAt: new Date(),
                cancelAtPeriodEnd: false
            });
            console.log(`Suscripción PagoPar cancelada: ${subscription.id}`);
        }
    } catch (error) {
        console.error('Error al manejar cancelación de PagoPar:', error);
    }
}

/**
 * Manejar pago expirado de PagoPar
 */
async function handlePagoParExpired(data) {
    try {
        const idPedido = data.id_pedido || data.id_pedido_comercio || data.hash_pedido;
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: data.id_suscripcion || idPedido
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'incomplete_expired'
            });
            console.log(`Pago PagoPar expirado para suscripción ${subscription.id}`);
        }
    } catch (error) {
        console.error('Error al manejar pago expirado de PagoPar:', error);
    }
}

/**
 * Manejar pago de factura exitoso
 */
async function handleInvoicePaymentSucceeded(invoice) {
    try {
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: invoice.subscription,
                paymentProvider: 'stripe'
            }
        });

        if (subscription) {
            // Actualizar período de facturación
            await subscription.update({
                currentPeriodStart: new Date(invoice.period_start * 1000),
                currentPeriodEnd: new Date(invoice.period_end * 1000),
                status: 'active'
            });

            console.log(`Pago exitoso para suscripción ${subscription.id}`);
        }

    } catch (error) {
        console.error('Error al manejar pago de factura:', error);
    }
}

/**
 * Manejar pago de factura fallido
 */
async function handleInvoicePaymentFailed(invoice) {
    try {
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: invoice.subscription,
                paymentProvider: 'stripe'
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'past_due'
            });

            console.log(`Pago fallido para suscripción ${subscription.id}`);
        }

    } catch (error) {
        console.error('Error al manejar pago fallido:', error);
    }
}

/**
 * Manejar actualización de suscripción
 */
async function handleSubscriptionUpdated(subscriptionData) {
    try {
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: subscriptionData.id,
                paymentProvider: 'stripe'
            }
        });

        if (subscription) {
            await subscription.update({
                status: subscriptionData.status,
                currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
                currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
                cancelAtPeriodEnd: subscriptionData.cancel_at_period_end
            });

            console.log(`Suscripción actualizada: ${subscription.id}`);
        }

    } catch (error) {
        console.error('Error al manejar actualización de suscripción:', error);
    }
}

/**
 * Manejar eliminación de suscripción
 */
async function handleSubscriptionDeleted(subscriptionData) {
    try {
        const subscription = await Subscription.findOne({
            where: {
                providerSubscriptionId: subscriptionData.id,
                paymentProvider: 'stripe'
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'canceled',
                canceledAt: new Date(),
                cancelAtPeriodEnd: false
            });

            console.log(`Suscripción cancelada: ${subscription.id}`);
        }

    } catch (error) {
        console.error('Error al manejar eliminación de suscripción:', error);
    }
}

/**
 * Cancelar suscripción
 */
exports.cancelSubscription = async (req, res) => {
    try {
        const organization = req.organization;

        const subscription = await Subscription.findOne({
            where: {
                organizationId: organization.id,
                status: ['active', 'trialing']
            }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Suscripción no encontrada' });
        }

        const paymentProvider = PaymentProviderFactory.getProvider();
        const subscriptionId = subscription.providerSubscriptionId || subscription.stripeSubscriptionId;

        if (subscriptionId) {
            // Cancelar en el proveedor de pagos
            await paymentProvider.cancelSubscription(subscriptionId, true);
        }

        // Cancelar localmente
        await subscription.update({
            cancelAtPeriodEnd: true
        });

        res.json({
            message: 'Suscripción cancelada exitosamente',
            cancelDate: subscription.currentPeriodEnd
        });

    } catch (error) {
        console.error('Error al cancelar suscripción:', error);
        res.status(500).json({ message: 'Error al cancelar suscripción' });
    }
};

/**
 * Reactivar suscripción
 */
exports.reactivateSubscription = async (req, res) => {
    try {
        const organization = req.organization;

        const subscription = await Subscription.findOne({
            where: { organizationId: organization.id }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Suscripción no encontrada' });
        }

        const paymentProvider = PaymentProviderFactory.getProvider();
        const subscriptionId = subscription.providerSubscriptionId || subscription.stripeSubscriptionId;

        if (subscriptionId) {
            // Reactivar en el proveedor de pagos
            await paymentProvider.reactivateSubscription(subscriptionId);
        }

        // Reactivar localmente
        await subscription.update({
            cancelAtPeriodEnd: false,
            status: 'active'
        });

        res.json({ message: 'Suscripción reactivada exitosamente' });

    } catch (error) {
        console.error('Error al reactivar suscripción:', error);
        res.status(500).json({ message: 'Error al reactivar suscripción' });
    }
};
