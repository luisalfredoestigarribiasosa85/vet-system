const { sequelize } = require('../config/database');

const User = require('./User');
const Client = require('./Client');
const Pet = require('./Pet');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Inventory = require('./Inventory');
const Invoice = require('./Invoice');
const Payment = require('./Payment');
const Service = require('./Service');
const Plan = require('./Plan');
const PlanPurchase = require('./PlanPurchase');
const Vaccination = require('./Vaccination');
const Organization = require('./Organization');
const Subscription = require('./Subscription');

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

Plan.hasMany(PlanPurchase, { foreignKey: 'planId', as: 'purchases' });
PlanPurchase.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

Client.hasMany(PlanPurchase, { foreignKey: 'clientId', as: 'planPurchases' });
PlanPurchase.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Pet.hasMany(Vaccination, { foreignKey: 'petId', as: 'vaccinations' });
Vaccination.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });

User.hasMany(Vaccination, { foreignKey: 'vetId', as: 'vaccinations' });
Vaccination.belongsTo(User, { foreignKey: 'vetId', as: 'veterinarian' });

// Invoice relationships
Client.hasMany(Invoice, { foreignKey: 'clientId', as: 'invoices' });
Invoice.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Pet.hasMany(Invoice, { foreignKey: 'petId', as: 'invoices' });
Invoice.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });

User.hasMany(Invoice, { foreignKey: 'createdBy', as: 'createdInvoices' });
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Payment relationships
Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

User.hasMany(Payment, { foreignKey: 'processedBy', as: 'processedPayments' });
Payment.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// SaaS Relationships
Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasOne(Subscription, { foreignKey: 'organizationId', as: 'subscription' });
Subscription.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Plan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });
Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

User.hasMany(User, { foreignKey: 'invitedBy', as: 'invitedUsers' });
User.belongsTo(User, { foreignKey: 'invitedBy', as: 'inviter' });

Organization.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Multi-tenant data relationships (todas las entidades ahora pertenecen a una organización)
Organization.hasMany(Client, { foreignKey: 'organizationId', as: 'clients' });
Client.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Pet, { foreignKey: 'organizationId', as: 'pets' });
Pet.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Appointment, { foreignKey: 'organizationId', as: 'appointments' });
Appointment.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(MedicalRecord, { foreignKey: 'organizationId', as: 'medicalRecords' });
MedicalRecord.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Inventory, { foreignKey: 'organizationId', as: 'inventory' });
Inventory.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Invoice, { foreignKey: 'organizationId', as: 'invoices' });
Invoice.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Service, { foreignKey: 'organizationId', as: 'services' });
Service.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Vaccination, { foreignKey: 'organizationId', as: 'vaccinations' });
Vaccination.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

module.exports = {
  sequelize,
  User,
  Client,
  Pet,
  Appointment,
  MedicalRecord,
  Inventory,
  Invoice,
  Payment,
  Service,
  Plan,
  PlanPurchase,
  Vaccination,
  Organization,
  Subscription,
};
