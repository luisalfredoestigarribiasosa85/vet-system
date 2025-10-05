const { sequelize } = require('../config/database');

const User = require('./User');
const Client = require('./Client');
const Pet = require('./Pet');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Inventory = require('./Inventory');
const Invoice = require('./Invoice');

User.hasOne(Client, { foreignKey: 'userId', as: 'client' });
Client.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Client.hasMany(Pet, { foreignKey: 'clientId', as: 'pets' });
Pet.belongsTo(Client, { foreignKey: 'clientId', as: 'owner' });

User.hasMany(Appointment, { foreignKey: 'vetId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'vetId', as: 'veterinarian' });

Pet.hasMany(Appointment, { foreignKey: 'petId', as: 'appointments' });
Appointment.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });

Pet.hasMany(MedicalRecord, { foreignKey: 'petId', as: 'medicalRecords' });
MedicalRecord.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });

User.hasMany(MedicalRecord, { foreignKey: 'vetId', as: 'medicalRecords' });
MedicalRecord.belongsTo(User, { foreignKey: 'vetId', as: 'veterinarian' });

module.exports = {
  sequelize,
  User,
  Client,
  Pet,
  Appointment,
  MedicalRecord,
  Inventory,
  Invoice
};
