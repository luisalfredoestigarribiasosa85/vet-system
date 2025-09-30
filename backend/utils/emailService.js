const nodemailer = require('nodemailer');

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verificar configuración
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Servidor de email configurado correctamente');
  } catch (error) {
    console.error('❌ Error en configuración de email:', error.message);
  }
};

// Enviar email de recordatorio de cita
exports.sendAppointmentReminder = async (clientEmail, appointmentData) => {
  try {
    const { petName, date, time, vetName, reason } = appointmentData;
    
    const mailOptions = {
      from: `"Veterinaria" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: '🐾 Recordatorio de Cita - Veterinaria',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Recordatorio de Cita</h2>
          <p>Estimado cliente,</p>
          <p>Le recordamos que tiene una cita programada:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Mascota:</strong> ${petName}</p>
            <p><strong>Fecha:</strong> ${date}</p>
            <p><strong>Hora:</strong> ${time}</p>
            <p><strong>Veterinario:</strong> ${vetName}</p>
            <p><strong>Motivo:</strong> ${reason}</p>
          </div>
          
          <p>Por favor, llegue 10 minutos antes de su cita.</p>
          <p>Si necesita cancelar o reprogramar, contáctenos con anticipación.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Este es un mensaje automático, por favor no responda a este correo.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${clientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return false;
  }
};

// Enviar recordatorio de vacuna
exports.sendVaccineReminder = async (clientEmail, vaccineData) => {
  try {
    const { petName, vaccineName, dueDate } = vaccineData;
    
    const mailOptions = {
      from: `"Veterinaria" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: '💉 Recordatorio de Vacunación',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Recordatorio de Vacunación</h2>
          <p>Estimado cliente,</p>
          <p>Le recordamos que su mascota <strong>${petName}</strong> necesita aplicarse la vacuna:</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p><strong>Vacuna:</strong> ${vaccineName}</p>
            <p><strong>Fecha recomendada:</strong> ${dueDate}</p>
          </div>
          
          <p>Por favor, programe una cita para mantener al día las vacunas de su mascota.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Este es un mensaje automático, por favor no responda a este correo.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Recordatorio de vacuna enviado a ${clientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar recordatorio de vacuna:', error);
    return false;
  }
};

// Enviar factura por email
exports.sendInvoiceEmail = async (clientEmail, invoiceData) => {
  try {
    const { invoiceNumber, date, total, items } = invoiceData;
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₲ ${item.price.toLocaleString()}</td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: `"Veterinaria" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `📄 Factura #${invoiceNumber} - Veterinaria`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Factura #${invoiceNumber}</h2>
          <p>Fecha: ${date}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Descripción</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #7c3aed;">
                  ₲ ${total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <p>Gracias por confiar en nosotros para el cuidado de su mascota.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Si tiene alguna pregunta sobre esta factura, no dude en contactarnos.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Factura enviada a ${clientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar factura:', error);
    return false;
  }
};

module.exports.verifyEmailConfig = verifyEmailConfig;