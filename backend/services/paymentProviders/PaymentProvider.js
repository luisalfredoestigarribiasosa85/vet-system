/**
 * Clase base abstracta para proveedores de pago
 * Define la interfaz que todos los proveedores deben implementar
 */
class PaymentProvider {
    constructor(config) {
        this.config = config;
    }

    /**
     * Crear una sesión de checkout para suscripción
     * @param {Object} params - Parámetros del checkout
     * @param {string} params.planId - ID del plan
     * @param {number} params.price - Precio del plan
     * @param {string} params.currency - Moneda (PYG, USD, etc.)
     * @param {string} params.interval - Intervalo (month, year)
     * @param {string} params.customerEmail - Email del cliente
     * @param {string} params.successUrl - URL de éxito
     * @param {string} params.cancelUrl - URL de cancelación
     * @param {Object} params.metadata - Metadatos adicionales
     * @returns {Promise<Object>} - { sessionId, url }
     */
    async createCheckoutSession(params) {
        throw new Error('createCheckoutSession must be implemented by subclass');
    }

    /**
     * Crear o actualizar una suscripción
     * @param {Object} params - Parámetros de la suscripción
     * @returns {Promise<Object>} - Información de la suscripción
     */
    async createSubscription(params) {
        throw new Error('createSubscription must be implemented by subclass');
    }

    /**
     * Cancelar una suscripción
     * @param {string} subscriptionId - ID de la suscripción en el proveedor
     * @param {boolean} cancelAtPeriodEnd - Si cancelar al final del período
     * @returns {Promise<Object>} - Información de la cancelación
     */
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        throw new Error('cancelSubscription must be implemented by subclass');
    }

    /**
     * Reactivar una suscripción cancelada
     * @param {string} subscriptionId - ID de la suscripción
     * @returns {Promise<Object>} - Información de la reactivación
     */
    async reactivateSubscription(subscriptionId) {
        throw new Error('reactivateSubscription must be implemented by subclass');
    }

    /**
     * Verificar y procesar un webhook
     * @param {Object} payload - Payload del webhook
     * @param {string} signature - Firma del webhook
     * @returns {Promise<Object>} - Evento verificado
     */
    async verifyWebhook(payload, signature) {
        throw new Error('verifyWebhook must be implemented by subclass');
    }

    /**
     * Obtener información de una suscripción
     * @param {string} subscriptionId - ID de la suscripción
     * @returns {Promise<Object>} - Información de la suscripción
     */
    async getSubscription(subscriptionId) {
        throw new Error('getSubscription must be implemented by subclass');
    }

    /**
     * Crear un plan/precio en el proveedor
     * @param {Object} planData - Datos del plan
     * @returns {Promise<string>} - ID del plan/precio en el proveedor
     */
    async createPlan(planData) {
        throw new Error('createPlan must be implemented by subclass');
    }
}

module.exports = PaymentProvider;

