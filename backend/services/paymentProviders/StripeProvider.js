const PaymentProvider = require('./PaymentProvider');
const stripe = require('stripe');

/**
 * Implementación de Stripe (mantenida para compatibilidad)
 * Nota: Stripe no está disponible en Paraguay, pero mantenemos esta implementación
 * por si se usa en otros países o para desarrollo
 */
class StripeProvider extends PaymentProvider {
    constructor(config) {
        super(config);
        this.stripe = stripe(config.secretKey);
    }

    async createCheckoutSession(params) {
        try {
            const {
                planId,
                price,
                currency = 'usd',
                interval = 'month',
                customerEmail,
                successUrl,
                cancelUrl,
                metadata = {}
            } = params;

            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: metadata.priceId || planId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: customerEmail,
                metadata: metadata,
                subscription_data: {
                    metadata: metadata
                }
            });

            return {
                sessionId: session.id,
                url: session.url
            };
        } catch (error) {
            console.error('Error en createCheckoutSession Stripe:', error.message);
            throw error;
        }
    }

    async createSubscription(params) {
        try {
            const {
                customerEmail,
                priceId,
                metadata = {}
            } = params;

            // Crear o obtener cliente
            const customers = await this.stripe.customers.list({
                email: customerEmail,
                limit: 1
            });

            let customer;
            if (customers.data.length > 0) {
                customer = customers.data[0];
            } else {
                customer = await this.stripe.customers.create({
                    email: customerEmail,
                    metadata: metadata
                });
            }

            // Crear suscripción
            const subscription = await this.stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: priceId }],
                metadata: metadata
            });

            return {
                subscriptionId: subscription.id,
                customerId: customer.id,
                status: subscription.status
            };
        } catch (error) {
            console.error('Error en createSubscription Stripe:', error.message);
            throw error;
        }
    }

    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: cancelAtPeriodEnd
            });

            return {
                subscriptionId: subscription.id,
                status: subscription.status,
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            };
        } catch (error) {
            console.error('Error en cancelSubscription Stripe:', error.message);
            throw error;
        }
    }

    async reactivateSubscription(subscriptionId) {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: false
            });

            return {
                subscriptionId: subscription.id,
                status: subscription.status
            };
        } catch (error) {
            console.error('Error en reactivateSubscription Stripe:', error.message);
            throw error;
        }
    }

    async verifyWebhook(payload, signature) {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                this.config.webhookSecret
            );

            return {
                type: event.type,
                data: event.data.object
            };
        } catch (error) {
            console.error('Error en verifyWebhook Stripe:', error.message);
            throw error;
        }
    }

    async getSubscription(subscriptionId) {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        } catch (error) {
            console.error('Error en getSubscription Stripe:', error.message);
            throw error;
        }
    }

    async createPlan(planData) {
        try {
            // Crear producto
            const product = await this.stripe.products.create({
                name: planData.name,
                description: planData.description
            });

            // Crear precio
            const price = await this.stripe.prices.create({
                product: product.id,
                unit_amount: planData.price,
                currency: planData.currency || 'usd',
                recurring: {
                    interval: planData.interval || 'month'
                }
            });

            return price.id;
        } catch (error) {
            console.error('Error en createPlan Stripe:', error.message);
            throw error;
        }
    }
}

module.exports = StripeProvider;

