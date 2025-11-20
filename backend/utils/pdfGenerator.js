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

// Generar PDF de carnet de vacunación
exports.generateVaccinationCard = (pet, vaccinations, client) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc
        .fontSize(24)
        .fillColor('#2c3e50')
        .text('CARNET DE VACUNACIÓN', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#7f8c8d')
        .text('Sistema Veterinario', { align: 'center' })
        .moveDown(2);

      // Pet Information Section
      doc
        .fontSize(16)
        .fillColor('#3498db')
        .text('Información de la Mascota', { underline: true })
        .moveDown(0.5);

      const infoY = doc.y;

      // Left column
      doc
        .fontSize(11)
        .fillColor('#2c3e50')
        .text(`Nombre:`, 50, infoY, { continued: true })
        .fillColor('#555')
        .text(` ${pet.name}`)
        .fillColor('#2c3e50')
        .text(`Especie:`, 50, doc.y, { continued: true })
        .fillColor('#555')
        .text(` ${pet.species}`)
        .fillColor('#2c3e50')
        .text(`Raza:`, 50, doc.y, { continued: true })
        .fillColor('#555')
        .text(` ${pet.breed}`)
        .fillColor('#2c3e50')
        .text(`Edad:`, 50, doc.y, { continued: true })
        .fillColor('#555')
        .text(` ${pet.age} ${pet.age === 1 ? 'año' : 'años'}`);

      // Right column
      const rightX = 320;
      doc
        .fillColor('#2c3e50')
        .text(`Género:`, rightX, infoY, { continued: true })
        .fillColor('#555')
        .text(` ${pet.gender || 'No especificado'}`)
        .fillColor('#2c3e50')
        .text(`Peso:`, rightX, doc.y, { continued: true })
        .fillColor('#555')
        .text(` ${pet.weight ? pet.weight + ' kg' : 'No registrado'}`)
        .fillColor('#2c3e50')
        .text(`Dueño:`, rightX, doc.y, { continued: true })
        .fillColor('#555')
        .text(` ${client?.name || 'No asignado'}`);

      doc.moveDown(2);

      // Vaccinations Section
      doc
        .fontSize(16)
        .fillColor('#3498db')
        .text('Historial de Vacunación', { underline: true })
        .moveDown(0.5);

      if (vaccinations.length === 0) {
        doc
          .fontSize(11)
          .fillColor('#7f8c8d')
          .text('No hay vacunas registradas', { align: 'center' })
          .moveDown();
      } else {
        // Table Header
        const tableTop = doc.y;
        const tableHeaders = [
          { text: 'Vacuna', x: 50, width: 120 },
          { text: 'Fecha Aplicación', x: 170, width: 90 },
          { text: 'Próxima Dosis', x: 260, width: 90 },
          { text: 'Veterinario', x: 350, width: 100 },
          { text: 'Lote', x: 450, width: 90 }
        ];

        // Draw header background
        doc
          .rect(50, tableTop - 5, 495, 25)
          .fillAndStroke('#3498db', '#3498db');

        // Draw header text
        doc.fontSize(10).fillColor('#ffffff');
        tableHeaders.forEach(header => {
          doc.text(header.text, header.x, tableTop, {
            width: header.width,
            align: 'left'
          });
        });

        doc.moveDown(0.5);

        // Table Rows
        vaccinations.forEach((vaccination, index) => {
          const rowY = doc.y;

          // Alternate row colors
          if (index % 2 === 0) {
            doc
              .rect(50, rowY - 3, 495, 20)
              .fillAndStroke('#f8f9fa', '#f8f9fa');
          }

          doc.fontSize(9).fillColor('#2c3e50');

          // Vaccine name
          doc.text(vaccination.vaccineName, 50, rowY, {
            width: 120,
            align: 'left'
          });

          // Application date
          const appDate = new Date(vaccination.applicationDate).toLocaleDateString('es-PY');
          doc.text(appDate, 170, rowY, {
            width: 90,
            align: 'left'
          });

          // Next dose date
          const nextDate = vaccination.nextDoseDate
            ? new Date(vaccination.nextDoseDate).toLocaleDateString('es-PY')
            : '-';
          doc.text(nextDate, 260, rowY, {
            width: 90,
            align: 'left'
          });

          // Veterinarian
          const vetName = vaccination.veterinarian?.name || '-';
          doc.text(vetName, 350, rowY, {
            width: 100,
            align: 'left'
          });

          // Batch number
          doc.text(vaccination.batchNumber || '-', 450, rowY, {
            width: 90,
            align: 'left'
          });

          doc.moveDown(0.3);
        });
      }

      // Footer
      doc.moveDown(2);
      const footerY = doc.page.height - 100;

      doc
        .fontSize(9)
        .fillColor('#7f8c8d')
        .text(
          `Documento generado el ${new Date().toLocaleDateString('es-PY')} a las ${new Date().toLocaleTimeString('es-PY')}`,
          50,
          footerY,
          { align: 'center' }
        );

      doc
        .fontSize(8)
        .text('Este documento es válido como certificado de vacunación', {
          align: 'center'
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

