const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vaccination = sequelize.define('Vaccination', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    petId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pets',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    vaccineName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre de la vacuna (ej: Antirrábica, Parvovirus)',
    },
    vaccineType: {
        type: DataTypes.ENUM('obligatoria', 'opcional', 'refuerzo'),
        defaultValue: 'obligatoria',
        comment: 'Tipo de vacuna',
    },
    applicationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Fecha de aplicación',
    },
    nextDoseDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha de próxima dosis (calculada automáticamente)',
    },
    vetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        comment: 'Veterinario que aplicó la vacuna',
    },
    batchNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Número de lote de la vacuna',
    },
    manufacturer: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Fabricante de la vacuna',
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales',
    },
    status: {
        type: DataTypes.ENUM('aplicada', 'próxima', 'vencida'),
        defaultValue: 'aplicada',
        comment: 'Estado de la vacuna',
    },
    doseNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Número de dosis (1ra, 2da, refuerzo)',
    },
    weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Peso de la mascota al momento de la vacunación',
    },
}, {
    tableName: 'vaccinations',
    timestamps: true,
    indexes: [
        {
            fields: ['petId'],
        },
        {
            fields: ['applicationDate'],
        },
        {
            fields: ['nextDoseDate'],
        },
        {
            fields: ['status'],
        },
    ],
});

module.exports = Vaccination;
