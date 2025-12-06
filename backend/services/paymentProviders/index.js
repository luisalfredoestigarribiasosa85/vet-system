const StripeProvider = require('./StripeProvider');
const PayUProvider = require('./PayUProvider');
const PagoParProvider = require('./PagoParProvider');

/**
 * Factory para obtener el proveedor de pagos configurado
 */
class PaymentProviderFactory {
    static getProvider() {
        const provider = process.env.PAYMENT_PROVIDER || 'pagopar';
        const isTest = process.env.NODE_ENV !== 'production';

        switch (provider.toLowerCase()) {
            case 'stripe':
                if (!process.env.STRIPE_SECRET_KEY) {
                    throw new Error('STRIPE_SECRET_KEY no está configurado');
                }
                return new StripeProvider({
                    secretKey: process.env.STRIPE_SECRET_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                    isTest
                });

            case 'payu':
            case 'payulatam':
                if (!process.env.PAYU_API_KEY || !process.env.PAYU_API_LOGIN) {
                    throw new Error('Configuración de PayU incompleta. Se requieren PAYU_API_KEY, PAYU_API_LOGIN, PAYU_MERCHANT_ID y PAYU_ACCOUNT_ID');
                }
                return new PayUProvider({
                    apiKey: process.env.PAYU_API_KEY,
                    apiLogin: process.env.PAYU_API_LOGIN,
                    merchantId: process.env.PAYU_MERCHANT_ID,
                    accountId: process.env.PAYU_ACCOUNT_ID,
                    isTest
                });

            case 'pagopar':
                if (!process.env.PAGOPAR_TOKEN || !process.env.PAGOPAR_PUBLIC_KEY) {
                    throw new Error('Configuración de PagoPar incompleta. Se requieren PAGOPAR_TOKEN, PAGOPAR_PUBLIC_KEY y PAGOPAR_PRIVATE_KEY');
                }
                return new PagoParProvider({
                    token: process.env.PAGOPAR_TOKEN,
                    publicKey: process.env.PAGOPAR_PUBLIC_KEY,
                    privateKey: process.env.PAGOPAR_PRIVATE_KEY,
                    isTest
                });

            default:
                throw new Error(`Proveedor de pagos no soportado: ${provider}. Opciones: stripe, payu, pagopar`);
        }
    }

    /**
     * Obtener el nombre del proveedor actual
     */
    static getProviderName() {
        return process.env.PAYMENT_PROVIDER || 'pagopar';
    }
}

module.exports = PaymentProviderFactory;

