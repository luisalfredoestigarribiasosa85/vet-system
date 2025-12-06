const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'organizations',
      key: 'id'
    },
    comment: 'Organización a la que pertenece el usuario'
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'veterinario', 'recepcionista', 'cliente'),
    defaultValue: 'recepcionista',
    comment: 'Rol global del usuario'
  },
  organizationRole: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    allowNull: true,
    comment: 'Rol dentro de la organización'
  },
  isOwner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si es el propietario de la organización'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  invitedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que invitó a este usuario'
  },
  invitationToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token para aceptar invitación'
  },
  invitationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de expiración de la invitación'
  }
}, {
  tableName: 'users',
  timestamps: true
});

User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
