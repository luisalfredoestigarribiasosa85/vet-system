// backend/services/scheduler.js
const cron = require('node-cron');
const { sendAppointmentReminder, sendPetReminders } = require('./notificationService');

// Ejecutar todos los días a las 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('🔔 Ejecutando tarea de recordatorios...');
  await sendAppointmentReminder();
  await sendPetReminders();
  console.log('✅ Tareas de recordatorio finalizadas');
});

module.exports = cron;