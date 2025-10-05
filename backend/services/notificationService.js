// backend/services/notificationService.js
const nodemailer = require('nodemailer');
const { Appointment, Pet, Client } = require('../models');
const { Op } = require('sequelize');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Función para enviar recordatorios
const sendAppointmentReminder = async () => {
  const now = new Date();
  const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas antes

  const appointments = await Appointment.findAll({
    where: {
      date: {
        [Op.between]: [now, reminderTime]
      },
      reminderSent: false
    },
    include: [
      { model: Pet, as: 'pet', include: [{ model: Client, as: 'owner' }] }
    ]
  });

  for (const appointment of appointments) {
    const { pet, date, time, reason } = appointment;
    const owner = pet.owner;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: owner.email,
      subject: `Recordatorio de cita para ${pet.name}`,
      html: `
        <h2>Recordatorio de cita</h2>
        <p>Hola ${owner.name},</p>
        <p>Te recordamos que tienes una cita programada para:</p>
        <p><strong>Mascota:</strong> ${pet.name}</p>
        <p><strong>Fecha:</strong> ${date} a las ${time}</p>
        <p><strong>Motivo:</strong> ${reason}</p>
        <p>¡Te esperamos!</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      await appointment.update({ reminderSent: true });
      console.log(`Recordatorio enviado a ${owner.email}`);
    } catch (error) {
      console.error(`Error enviando recordatorio a ${owner.email}:`, error);
    }
  }
};

const sendPetReminders = async () => {
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + 7);
  const reminderDateString = reminderDate.toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    const pets = await Pet.findAll({
      where: {
        reminders: {
          [Op.ne]: null
        }
      },
      include: [{ model: Client, as: 'owner' }]
    });

    for (const pet of pets) {
      if (!pet.reminders || !pet.owner || !pet.owner.email) {
        continue;
      }

      for (const reminder of pet.reminders) {
        // Check if reminder.date is a string and matches the target date
        if (typeof reminder.date === 'string' && reminder.date.startsWith(reminderDateString)) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: pet.owner.email,
            subject: `Recordatorio de cuidado para ${pet.name}`,
            html: `
              <h2>Recordatorio de Cuidado Preventivo</h2>
              <p>Hola ${pet.owner.name},</p>
              <p>Te recordamos que tu mascota <strong>${pet.name}</strong> tiene un cuidado programado para la próxima semana:</p>
              <p><strong>Tipo de cuidado:</strong> ${reminder.type}</p>
              <p><strong>Fecha programada:</strong> ${new Date(reminder.date).toLocaleDateString()}</p>
              <p>Por favor, contacta a la clínica si necesitas agendar una cita o si ya has realizado este procedimiento.</p>
              <p>¡La salud de ${pet.name} es nuestra prioridad!</p>
            `
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Recordatorio de '${reminder.type}' para ${pet.name} enviado a ${pet.owner.email}`);
            // Note: We are not flagging individual reminders as "sent" to keep it simple.
            // The logic relies on the cron job running once a day for a specific future date.
          } catch (error) {
            console.error(`Error enviando recordatorio para ${pet.name} a ${pet.owner.email}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error general al procesar recordatorios de mascotas:', error);
  }
};

module.exports = { sendAppointmentReminder, sendPetReminders };