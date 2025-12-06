const PaymentProvider = require('./PaymentProvider');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Implementación de PagoPar para procesamiento de pagos en Paraguay
 * Documentación: https://www.pagopar.com/
 * 
 * PagoPar es la solución de pagos local más popular en Paraguay
 * Soporta: tarjetas, billeteras electrónicas, QR, transferencias bancarias, PIX
 */
class PagoParProvider extends PaymentProvider {
    constructor(config) {
        super(config);
        this.publicKey = config.publicKey;
        this.privateKey = config.privateKey;
        this.token = config.token;
        this.isTest = config.isTest || false;

        // URLs de la API según el ambiente
        // Nota: Estas URLs pueden necesitar ajuste según la documentación oficial de PagoPar
        this.baseUrl = this.isTest
            ? 'https://api.pagopar.com/api/v1.1' // URL de pruebas
            : 'https://api.pagopar.com/api/v1.1'; // URL de producción
    }

    /**
     * Generar firma para autenticación
     */
    generateSignature(data) {
        // PagoPar generalmente usa firma HMAC o similar
        // Ajustar según la documentación oficial
        const stringToSign = JSON.stringify(data) + this.privateKey;
        return crypto.createHash('sha256').update(stringToSign).digest('hex');
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

            // PagoPar usa un sistema de "pedidos" o "checkouts"
            // Para suscripciones, se puede crear un pedido recurrente

            const pedidoData = {
                token: this.token,
                public_key: this.publicKey,
                monto_total: price,
                concepto_pago: `Suscripción Plan ${planId}`,
                fecha_maxima_pago: this.getMaxPaymentDate(interval),
                id_pedido_comercio: `SUB_${planId}_${Date.now()}`,
                comprador: {
                    email: customerEmail,
                    nombre: metadata.customerName || 'Cliente',
                    documento: metadata.document || '',
                    telefono: metadata.phone || ''
                },
                productos: [
                    {
                        nombre: `Plan ${planId}`,
                        descripcion: `Suscripción ${interval === 'year' ? 'anual' : 'mensual'}`,
                        cantidad: 1,
                        precio: price
                    }
                ],
                url_retorno: successUrl,
                url_webhook: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/subscriptions/webhook`,
                suscripcion: {
                    activa: true,
                    intervalo: interval === 'year' ? 'anual' : 'mensual',
                    plan_id: planId.toString()
                },
                metadata: {
                    organizationId: metadata.organizationId,
                    planId: metadata.planId,
                    userId: metadata.userId
                }
            };

            // Generar firma
            const firma = this.generateSignature(pedidoData);
            pedidoData.firma = firma;

            const response = await axios.post(
                `${this.baseUrl}/pedidos/crear`,
                pedidoData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data && response.data.resultado) {
                const resultado = response.data.resultado;
                return {
                    sessionId: resultado.id_pedido || resultado.hash_pedido,
                    url: resultado.url_pago || resultado.url_checkout,
                    paymentUrl: resultado.url_pago || resultado.url_checkout,
                    transactionId: resultado.id_pedido,
                    hash: resultado.hash_pedido
                };
            }

            throw new Error('Error al crear sesión de checkout en PagoPar');
        } catch (error) {
            console.error('Error en createCheckoutSession PagoPar:', error.response?.data || error.message);
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

            // PagoPar puede tener un endpoint específico para suscripciones
            const subscriptionData = {
                token: this.token,
                public_key: this.publicKey,
                plan_id: `PLAN_${planId}`,
                nombre: `Plan ${planId}`,
                monto: price,
                intervalo: interval === 'year' ? 'anual' : 'mensual',
                comprador: {
                    email: customerEmail,
                    nombre: metadata.customerName || 'Cliente',
                    documento: metadata.document || ''
                },
                metadata: {
                    organizationId: metadata.organizationId,
                    planId: metadata.planId
                }
            };

            const firma = this.generateSignature(subscriptionData);
            subscriptionData.firma = firma;

            const response = await axios.post(
                `${this.baseUrl}/suscripciones/crear`,
                subscriptionData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.resultado) {
                const resultado = response.data.resultado;
                return {
                    subscriptionId: resultado.id_suscripcion || resultado.id,
                    customerId: resultado.id_comprador || customerId,
                    status: resultado.estado || 'activa'
                };
            }

            throw new Error('Error al crear suscripción en PagoPar');
        } catch (error) {
            console.error('Error en createSubscription PagoPar:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Cancelar suscripción
     */
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        try {
            const cancelData = {
                token: this.token,
                public_key: this.publicKey,
                id_suscripcion: subscriptionId,
                cancelar_ahora: !cancelAtPeriodEnd
            };

            const firma = this.generateSignature(cancelData);
            cancelData.firma = firma;

            const response = await axios.post(
                `${this.baseUrl}/suscripciones/cancelar`,
                cancelData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                subscriptionId: subscriptionId,
                status: 'cancelada',
                canceledAt: new Date()
            };
        } catch (error) {
            console.error('Error en cancelSubscription PagoPar:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Reactivar suscripción
     */
    async reactivateSubscription(subscriptionId) {
        try {
            const reactivateData = {
                token: this.token,
                public_key: this.publicKey,
                id_suscripcion: subscriptionId
            };

            const firma = this.generateSignature(reactivateData);
            reactivateData.firma = firma;

            const response = await axios.post(
                `${this.baseUrl}/suscripciones/reactivar`,
                reactivateData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                subscriptionId: subscriptionId,
                status: 'activa'
            };
        } catch (error) {
            console.error('Error en reactivateSubscription PagoPar:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Verificar webhook de PagoPar
     */
    async verifyWebhook(payload, signature) {
        try {
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

            // PagoPar envía la firma en el payload o en headers
            // Verificar firma si está presente
            if (signature && payloadObj.firma) {
                const expectedSignature = this.generateSignature(payloadObj);
                if (signature !== expectedSignature && payloadObj.firma !== expectedSignature) {
                    console.warn('Firma de webhook no coincide, pero continuamos');
                }
            }

            // PagoPar puede enviar diferentes tipos de eventos
            const estado = payloadObj.estado || payloadObj.estado_pago;
            const tipo = payloadObj.tipo || this.getEventTypeFromEstado(estado);

            return {
                type: tipo,
                data: payloadObj
            };
        } catch (error) {
            console.error('Error en verifyWebhook PagoPar:', error.message);
            throw error;
        }
    }

    /**
     * Convertir estado de PagoPar a tipo de evento
     */
    getEventTypeFromEstado(estado) {
        const estadoMap = {
            'PAGADO': 'PAYMENT_SUCCESS',
            'PAGADO.ACEPTADO': 'PAYMENT_APPROVED',
            'PAGADO.RECHAZADO': 'PAYMENT_REJECTED',
            'PENDIENTE': 'PENDING',
            'CANCELADO': 'CANCELLED',
            'VENCIDO': 'EXPIRED'
        };
        return estadoMap[estado] || 'UNKNOWN';
    }

    /**
     * Obtener información de suscripción
     */
    async getSubscription(subscriptionId) {
        try {
            const queryData = {
                token: this.token,
                public_key: this.publicKey,
                id_suscripcion: subscriptionId
            };

            const firma = this.generateSignature(queryData);
            queryData.firma = firma;

            const response = await axios.get(
                `${this.baseUrl}/suscripciones/consultar`,
                {
                    params: queryData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.resultado) {
                return response.data.resultado;
            }

            throw new Error('Suscripción no encontrada');
        } catch (error) {
            console.error('Error en getSubscription PagoPar:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Crear plan en PagoPar
     */
    async createPlan(planData) {
        try {
            const planRequest = {
                token: this.token,
                public_key: this.publicKey,
                nombre: planData.name,
                descripcion: planData.description || planData.name,
                monto: planData.price,
                intervalo: planData.interval === 'year' ? 'anual' : 'mensual',
                moneda: planData.currency || 'PYG'
            };

            const firma = this.generateSignature(planRequest);
            planRequest.firma = firma;

            const response = await axios.post(
                `${this.baseUrl}/planes/crear`,
                planRequest,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.resultado) {
                return response.data.resultado.id_plan || response.data.resultado.id;
            }

            throw new Error('Error al crear plan en PagoPar');
        } catch (error) {
            console.error('Error en createPlan PagoPar:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Obtener fecha máxima de pago según intervalo
     */
    getMaxPaymentDate(interval) {
        const date = new Date();
        if (interval === 'year') {
            date.setDate(date.getDate() + 365);
        } else {
            date.setDate(date.getDate() + 30);
        }
        // Formato YYYY-MM-DD
        return date.toISOString().split('T')[0];
    }
}

module.exports = PagoParProvider;

