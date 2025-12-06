const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'organizations',
            key: 'id'
        },
        comment: 'Organización suscrita'
    },
    planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'plans',
            key: 'id'
        },
        comment: 'Plan suscrito'
    },
    stripeSubscriptionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'ID de la suscripción en Stripe (deprecated, usar providerSubscriptionId)'
    },
    stripeCustomerId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'ID del cliente en Stripe (deprecated, usar providerCustomerId)'
    },
    providerSubscriptionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'ID de la suscripción en el proveedor de pagos (Stripe, PayU, etc.)'
    },
    providerCustomerId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'ID del cliente en el proveedor de pagos'
    },
    paymentProvider: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'pagopar',
        comment: 'Proveedor de pagos usado (pagopar, stripe, payu, mercadopago, etc.)'
    },
    status: {
        type: DataTypes.ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired'),
        defaultValue: 'trialing',
        comment: 'Estado de la suscripción'
    },
    currentPeriodStart: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Inicio del período actual'
    },
    currentPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fin del período actual'
    },
    trialStart: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Inicio del período de prueba'
    },
    trialEnd: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fin del período de prueba'
    },
    canceledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de cancelación'
    },
    cancelAtPeriodEnd: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Cancelar al final del período'
    },
    usageMetrics: {
        type: DataTypes.JSON,
        defaultValue: {
            users: 0,
            clients: 0,
            pets: 0,
            appointments: 0,
            invoices: 0,
            storage: 0,
        },
        comment: 'Métricas de uso actual'
    },
    billingInfo: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Información de facturación'
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Metadatos adicionales'
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['organizationId']
        },
        {
            fields: ['planId']
        },
        {
            fields: ['status']
        },
        {
            fields: ['currentPeriodEnd']
        },
        {
            fields: ['stripeSubscriptionId']
        },
        {
            fields: ['providerSubscriptionId']
        },
        {
            fields: ['paymentProvider']
        }
    ]
});

module.exports = Subscription;
