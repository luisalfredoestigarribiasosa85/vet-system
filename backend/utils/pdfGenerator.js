const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generar PDF de factura
exports.generateInvoicePDF = async (invoiceData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).text('VETERINARIA', { align: 'center' });
      doc.fontSize(10).text('Sistema de Gestión', { align: 'center' });
      doc.moveDown();
      
      // Línea divisoria
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // Información de factura
      doc.fontSize(16).text(`Factura #${invoiceData.id}`, { align: 'left' });
      doc.fontSize(10);
      doc.text(`Fecha: ${invoiceData.date}`);
      doc.moveDown();
      
      // Información del cliente
      doc.fontSize(12).text('Cliente:', { underline: true });
      doc.fontSize(10);
      doc.text(`Nombre: ${invoiceData.clientName}`);
      doc.text(`Teléfono: ${invoiceData.clientPhone}`);
      doc.text(`Mascota: ${invoiceData.petName}`);
      doc.moveDown();
      
      // Tabla de items
      doc.fontSize(12).text('Detalle:', { underline: true });
      doc.moveDown(0.5);
      
      // Header de tabla
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Descripción', 50, tableTop);
      doc.text('Cantidad', 350, tableTop);
      doc.text('Precio', 450, tableTop, { width: 100, align: 'right' });
      
      // Línea bajo header
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();
      
      // Items
      doc.font('Helvetica');
      let yPosition = doc.y;
      
      invoiceData.items.forEach(item => {
        doc.text(item.name, 50, yPosition);
        doc.text(item.quantity || 1, 350, yPosition);
        doc.text(`₲ ${item.price.toLocaleString()}`, 450, yPosition, { width: 100, align: 'right' });
        yPosition += 20;
      });
      
      doc.moveDown();
      
      // Total
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('Total:', 350, doc.y);
      doc.text(`₲ ${invoiceData.total.toLocaleString()}`, 450, doc.y, { width: 100, align: 'right' });
      
      doc.moveDown(2);
      
      // Método de pago
      doc.fontSize(10).font('Helvetica');
      doc.text(`Método de pago: ${invoiceData.payment}`, { align: 'left' });
      
      // Footer
      doc.moveDown(3);
      doc.fontSize(8).text('Gracias por su preferencia', { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => {
        console.log('✅ PDF generado correctamente');
        resolve(outputPath);
      });
      
      stream.on('error', (error) => {
        console.error('❌ Error al generar PDF:', error);
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

// Generar PDF de receta médica
exports.generatePrescriptionPDF = async (prescriptionData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).text('RECETA MÉDICA VETERINARIA', { align: 'center' });
      doc.moveDown(2);
      
      // Información del veterinario
      doc.fontSize(12).text(`Veterinario: ${prescriptionData.vetName}`);
      doc.fontSize(10).text(`Fecha: ${prescriptionData.date}`);
      doc.moveDown();
      
      // Información del paciente
      doc.fontSize(12).text('Paciente:', { underline: true });
      doc.fontSize(10);
      doc.text(`Mascota: ${prescriptionData.petName}`);
      doc.text(`Especie: ${prescriptionData.species}`);
      doc.text(`Edad: ${prescriptionData.age} años`);
      doc.text(`Peso: ${prescriptionData.weight} kg`);
      doc.moveDown();
      
      // Información del dueño
      doc.fontSize(12).text('Dueño:', { underline: true });
      doc.fontSize(10);
      doc.text(`Nombre: ${prescriptionData.clientName}`);
      doc.text(`Teléfono: ${prescriptionData.clientPhone}`);
      doc.moveDown();
      
      // Diagnóstico
      doc.fontSize(12).text('Diagnóstico:', { underline: true });
      doc.fontSize(10).text(prescriptionData.diagnosis);
      doc.moveDown();
      
      // Rx (Prescripción)
      doc.fontSize(14).font('Helvetica-Bold').text('Rp/', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(prescriptionData.prescription, { indent: 20 });
      doc.moveDown(2);
      
      // Indicaciones
      if (prescriptionData.instructions) {
        doc.fontSize(12).font('Helvetica-Bold').text('Indicaciones:');
        doc.fontSize(10).font('Helvetica');
        doc.text(prescriptionData.instructions);
        doc.moveDown();
      }
      
      // Firma
      doc.moveDown(3);
      doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(10).text('Firma del Veterinario', 350);
      
      doc.end();
      
      stream.on('finish', () => {
        console.log('✅ PDF de receta generado correctamente');
        resolve(outputPath);
      });
      
      stream.on('error', reject);
      
    } catch (error) {
      reject(error);
    }
  });
};
