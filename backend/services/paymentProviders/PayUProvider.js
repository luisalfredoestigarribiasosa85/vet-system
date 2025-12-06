const PaymentProvider = require('./PaymentProvider');
const axios = require('axios');

/**
 * Implementación de PayU Latam para procesamiento de pagos
 * Documentación: https://developers.payulatam.com/latam/en/docs/
 */
class PayUProvider extends PaymentProvider {
    constructor(config) {
        super(config);
        this.apiKey = config.apiKey;
        this.apiLogin = config.apiLogin;
        this.merchantId = config.merchantId;
        this.accountId = config.accountId;
        this.isTest = config.isTest || false;

        // URLs de la API según el ambiente
        this.baseUrl = this.isTest
            ? 'https://sandbox.api.payulatam.com/payments-api/4.0'
            : 'https://api.payulatam.com/payments-api/4.0';
    }

    /**
     * Obtener token de autenticación
     */
    async getAuthToken() {
        try {
            const response = await axios.post(
                `${this.baseUrl}/service.cgi`,
                {
                    language: 'es',
                    command: 'AUTHENTICATE',
                    merchant: {
                        apiKey: this.apiKey,
                        apiLogin: this.apiLogin
                    }
                }
            );

            if (response.data && response.data.token) {
                return response.data.token;
            }
            throw new Error('No se pudo obtener el token de autenticación');
        } catch (error) {
            console.error('Error al obtener token de PayU:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Crear sesión de checkout para suscripción
     */
    async createCheckoutSession(params) {
        try {
            const {
                planId,
                price,
                currency = 'PYG',
                interval = 'month',
                customerEmail,
                successUrl,
                cancelUrl,
                metadata = {}
            } = params;

            // PayU usa un sistema de suscripciones diferente
            // Para suscripciones recurrentes, necesitamos crear un plan y luego una suscripción
            // Por ahora, creamos un pago único que puede convertirse en suscripción

            const token = await this.getAuthToken();

            // Crear orden de pago
            const orderData = {
                language: 'es',
                command: 'SUBMIT_TRANSACTION',
                merchant: {
                    apiKey: this.apiKey,
                    apiLogin: this.apiLogin
                },
                transaction: {
                    order: {
                        accountId: this.accountId,
                        referenceCode: `SUB_${planId}_${Date.now()}`,
                        description: `Suscripción Plan ${planId}`,
                        signature: this.generateSignature(planId, price, currency),
                        additionalValues: {
                            TX_VALUE: {
                                value: price,
                                currency: currency
                            }
                        },
                        buyer: {
                            emailAddress: customerEmail
                        }
                    },
                    type: 'SUBSCRIPTION',
                    paymentMethod: 'VISA',
                    paymentCountry: 'PY',
                    deviceSessionId: metadata.sessionId || `session_${Date.now()}`,
                    ipAddress: metadata.ipAddress || '127.0.0.1',
                    cookie: metadata.cookie || 'cookie_' + Date.now(),
                    userAgent: metadata.userAgent || 'Mozilla/5.0'
                },
                test: this.isTest
            };

            const response = await axios.post(
                `${this.baseUrl}/service.cgi`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.transactionResponse) {
                const transaction = response.data.transactionResponse;

                // PayU devuelve una URL de pago o un código de autorización
                return {
                    sessionId: transaction.orderId || transaction.transactionId,
                    url: transaction.extraParameters?.URL_PAYMENT || successUrl,
                    transactionId: transaction.transactionId,
                    paymentUrl: transaction.extraParameters?.URL_PAYMENT
                };
            }

            throw new Error('Error al crear sesión de checkout en PayU');
        } catch (error) {
            console.error('Error en createCheckoutSession PayU:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Crear suscripción recurrente
     */
    async createSubscription(params) {
        try {
            const {
                planId,
                price,
                currency = 'PYG',
                interval = 'month',
                customerEmail,
                customerId,
                metadata = {}
            } = params;

            const token = await this.getAuthToken();

            // PayU requiere crear un plan de suscripción primero
            // Luego crear la suscripción del cliente
            const subscriptionData = {
                language: 'es',
                command: 'CREATE_SUBSCRIPTION',
                merchant: {
                    apiKey: this.apiKey,
                    apiLogin: this.apiLogin
                },
                plan: {
                    planCode: `PLAN_${planId}`,
                    description: `Plan ${planId}`,
                    accountId: this.accountId,
                    intervalCount: interval === 'year' ? 12 : 1,
                    interval: interval === 'year' ? 'MONTH' : 'MONTH',
                    maxPaymentsAllowed: 999,
                    maxPaymentAttempts: 3,
                    paymentAttemptsDelay: 1,
                    maxPendingPayments: 1
                },
                customer: {
                    fullName: metadata.customerName || 'Cliente',
                    emailAddress: customerEmail
                },
                quantity: 1,
                installments: 1,
                trialDays: metadata.trialDays || 0
            };

            const response = await axios.post(
                `${this.baseUrl}/service.cgi`,
                subscriptionData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.subscription) {
                return {
                    subscriptionId: response.data.subscription.id,
                    customerId: response.data.subscription.customerId,
                    status: response.data.subscription.status
                };
            }

            throw new Error('Error al crear suscripción en PayU');
        } catch (error) {
            console.error('Error en createSubscription PayU:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Cancelar suscripción
     */
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        try {
            const token = await this.getAuthToken();

            const response = await axios.post(
                `${this.baseUrl}/service.cgi`,
                {
                    language: 'es',
                    command: 'CANCEL_SUBSCRIPTION',
                    merchant: {
                        apiKey: this.apiKey,
                        apiLogin: this.apiLogin
                    },
                    subscriptionId: subscriptionId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                subscriptionId: subscriptionId,
                status: 'canceled',
                canceledAt: new Date()
            };
        } catch (error) {
            console.error('Error en cancelSubscription PayU:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Reactivar suscripción
     */
    async reactivateSubscription(subscriptionId) {
        try {
            const token = await this.getAuthToken();

            const response = await axios.post(
                `${this.baseUrl}/service.cgi`,
                {
                    language: 'es',
                    command: 'ACTIVATE_SUBSCRIPTION',
                    merchant: {
                        apiKey: this.apiKey,
                        apiLogin: this.apiLogin
                    },
                    subscriptionId: subscriptionId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                subscriptionId: subscriptionId,
                status: 'active'
            };
        } catch (error) {
            console.error('Error en reactivateSubscription PayU:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Verificar webhook de PayU
     */
    async verifyWebhook(payload, signature) {
        try {
            // PayU puede enviar la firma en diferentes headers
            // Por ahora, validamos básicamente la estructura
            // En producción, implementar validación de firma según documentación de PayU

            let payloadObj;
            if (typeof payload === 'string') {
                try {
                    payloadObj = JSON.parse(payload);
                } catch (e) {
                    payloadObj = { raw: payload };
                }
            } else {
                payloadObj = payload;
            }

            // PayU envía eventos en diferentes formatos
            // state_pol: 4=aprobado, 5=expirado, 6=declinado
            const statePol = payloadObj.state_pol || payloadObj.statePol;
            const eventType = payloadObj.event || (statePol ? this.getEventTypeFromState(statePol) : 'unknown');

            return {
                type: eventType,
                data: payloadObj
            };
        } catch (error) {
            console.error('Error en verifyWebhook PayU:', error.message);
            throw error;
        }
    }

    /**
     * Convertir código de estado de PayU a tipo de evento
     */
    getEventTypeFromState(statePol) {
        const stateMap = {
            '4': 'APPROVED',
            '5': 'EXPIRED',
            '6': 'DECLINED',
            '7': 'PENDING'
        };
        return stateMap[statePol] || 'UNKNOWN';
    }

    /**
     * Obtener información de suscripción
     */
    async getSubscription(subscriptionId) {
        try {
            const token = await this.getAuthToken();

            const response = await axios.post(
                `${this.baseUrl}/service.cgi`,
                {
                    language: 'es',
                    command: 'GET_SUBSCRIPTION',
                    merchant: {
                        apiKey: this.apiKey,
                        apiLogin: this.apiLogin
                    },
                    subscriptionId: subscriptionId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.subscription) {
                return response.data.subscription;
            }

            throw new Error('Suscripción no encontrada');
        } catch (error) {
            console.error('Error en getSubscription PayU:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Crear plan en PayU
     */
    async createPlan(planData) {
        try {
            const token = await this.getAuthToken();

            const response = await axios.post(
                `${this.baseUrl}/service.cgi`,
                {
                    language: 'es',
                    command: 'CREATE_PLAN',
                    merchant: {
                        apiKey: this.apiKey,
                        apiLogin: this.apiLogin
                    },
                    plan: {
                        planCode: `PLAN_${planData.id}`,
                        description: planData.description || planData.name,
                        accountId: this.accountId,
                        intervalCount: planData.interval === 'year' ? 12 : 1,
                        interval: 'MONTH',
                        maxPaymentsAllowed: 999,
                        maxPaymentAttempts: 3,
                        paymentAttemptsDelay: 1,
                        maxPendingPayments: 1
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.plan) {
                return response.data.plan.id;
            }

            throw new Error('Error al crear plan en PayU');
        } catch (error) {
            console.error('Error en createPlan PayU:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generar firma para transacciones PayU
     */
    generateSignature(referenceCode, amount, currency) {
        const crypto = require('crypto');
        const signatureString = `${this.apiKey}~${this.merchantId}~${referenceCode}~${amount}~${currency}`;
        return crypto.createHash('md5').update(signatureString).digest('hex');
    }

    /**
     * Generar firma para webhooks PayU
     */
    generateWebhookSignature(payload) {
        const crypto = require('crypto');
        // PayU usa una firma específica para webhooks
        // Consultar documentación oficial para la implementación exacta
        const signatureString = `${this.apiKey}~${JSON.stringify(payload)}`;
        return crypto.createHash('md5').update(signatureString).digest('hex');
    }
}

module.exports = PayUProvider;

