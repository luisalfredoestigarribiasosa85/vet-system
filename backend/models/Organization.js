const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Organization = sequelize.define('Organization', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre de la organización/clínica veterinaria'
    },
    subdomain: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Subdominio único para la organización (ej: clinica-vet.vet-system.com)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción de la organización'
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL del logo de la organización'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Dirección física'
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Teléfono de contacto'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Email de contacto'
    },
    website: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Sitio web'
    },
    taxId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'RUC o número de identificación fiscal'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Si la organización está activa'
    },
    settings: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Configuraciones específicas de la organización'
    },
    trialEndsAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de fin del período de prueba'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Usuario que creó la organización'
    }
}, {
    tableName: 'organizations',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['subdomain']
        },
        {
            fields: ['isActive']
        },
        {
            fields: ['trialEndsAt']
        }
    ]
});

module.exports = Organization;
