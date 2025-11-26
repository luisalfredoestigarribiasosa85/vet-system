const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del servicio (ej: Consulta General, Vacuna Antirrábica)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del servicio'
    },
    price: {
        type: DataTypes.DECIMAL(12, 0),
        allowNull: false,
        comment: 'Precio en Guaraníes (sin decimales)'
    },
    category: {
        type: DataTypes.ENUM('consulta', 'vacuna', 'cirugia', 'laboratorio', 'medicamento', 'otro'),
        allowNull: false,
        defaultValue: 'consulta',
        comment: 'Categoría del servicio'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Si el servicio está activo o no'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duración estimada en minutos'
    }
}, {
    tableName: 'services',
    timestamps: true
});

module.exports = Service;
