// backend/services/scheduler.js
const { sendAppointmentReminder, sendPetReminders } = require('./notificationService');

const REMINDER_HOUR = 9;
const REMINDER_MINUTE = 0;
const REMINDER_SECOND = 0;
const REMINDER_MILLISECOND = 0;

let timeoutId = null;

const runReminders = async () => {
  console.log('🔔 Ejecutando tarea de recordatorios...');
  await sendAppointmentReminder();
  await sendPetReminders();
  console.log('✅ Tareas de recordatorio finalizadas');
};

const getMillisecondsUntilNextRun = () => {
  const now = new Date();
  const nextRun = new Date(now);

  nextRun.setHours(REMINDER_HOUR, REMINDER_MINUTE, REMINDER_SECOND, REMINDER_MILLISECOND);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.getTime() - now.getTime();
};

const scheduleNextRun = () => {
  const delay = getMillisecondsUntilNextRun();

  timeoutId = setTimeout(async () => {
    try {
      await runReminders();
    } catch (error) {
      console.error('❌ Error ejecutando recordatorios programados:', error);
    } finally {
      scheduleNextRun();
    }
  }, delay);
};

scheduleNextRun();

module.exports = {
  runReminders,
  stopScheduler: () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
};
