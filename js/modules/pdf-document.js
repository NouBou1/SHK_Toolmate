// PDF-Dokument aufbauen
// Setzt den Rapport aus Kopfbereich, Materialliste und Unterschrift zusammen.
// Reine Layout-Aufgabe - Speichern uebernimmt pdf-storage.js.

import { getSignatureDataURL } from './signature.js';

const PDF_MARGIN_MM = 15;
const PDF_START_Y = 20;
const PDF_ROW_HEIGHT = 6;

function createPdfInstance() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        alert('[FEHLER] PDF-Bibliothek nicht geladen. Bitte Seite neu laden.');
        return null;
    }
    return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

function addPDFTitle(pdf, yPosition) {
    pdf.setFontSize(20);
    pdf.setTextColor(0, 86, 179);
    pdf.text('SHK-MATE Rapport', PDF_MARGIN_MM, yPosition);
    return yPosition + 12;
}

function addPDFProjectInfo(pdf, project, yPosition) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(project.name, PDF_MARGIN_MM, yPosition);

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Erstellt: ' + project.date, PDF_MARGIN_MM, yPosition + 8);
    return yPosition + 20;
}

function addPDFHeader(pdf, project, yPosition) {
    return addPDFProjectInfo(pdf, project, addPDFTitle(pdf, yPosition));
}

function getPdfContentWidth(pdf) {
    return pdf.internal.pageSize.getWidth() - (2 * PDF_MARGIN_MM);
}

function addPDFTableHead(pdf, contentWidth, yPosition) {
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Materialliste:', PDF_MARGIN_MM, yPosition);

    const headRowY = yPosition + 10;
    pdf.setFontSize(10);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(PDF_MARGIN_MM, headRowY - 5, contentWidth, PDF_ROW_HEIGHT, 'F');
    pdf.text('Anzahl', PDF_MARGIN_MM + 2, headRowY);
    pdf.text('Material', PDF_MARGIN_MM + 25, headRowY);
    return headRowY + 8;
}

function addPDFMaterialItem(pdf, item, contentWidth, yPosition) {
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(PDF_MARGIN_MM, yPosition - 5, contentWidth, PDF_ROW_HEIGHT);
    pdf.text((item.amount || '1') + 'x', PDF_MARGIN_MM + 2, yPosition);

    const lines = pdf.splitTextToSize(item.text || 'Ohne Name', contentWidth - 25);
    pdf.text(lines, PDF_MARGIN_MM + 25, yPosition);
    return yPosition + PDF_ROW_HEIGHT + (lines.length - 1) * 4;
}

function addPDFMaterialList(pdf, project, yPosition) {
    const contentWidth = getPdfContentWidth(pdf);
    let currentY = addPDFTableHead(pdf, contentWidth, yPosition);

    project.items.forEach(item => {
        currentY = addPDFMaterialItem(pdf, item, contentWidth, currentY);
    });
    return currentY + 5;
}

function drawSignatureImage(pdf, dataUrl, yPosition) {
    try {
        pdf.addImage(dataUrl, 'PNG', PDF_MARGIN_MM, yPosition, 60, 30);
    } catch (err) {
        console.error('Fehler beim Einfügen der Unterschrift:', err);
    }
}

function addPDFSignature(pdf, yPosition) {
    const dataUrl = getSignatureDataURL();
    if (!dataUrl) {
        return;
    }
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Unterschrift:', PDF_MARGIN_MM, yPosition);
    drawSignatureImage(pdf, dataUrl, yPosition + 8);
}

/**
 * Baut das komplette Rapport-PDF auf
 * @returns {Object|null} jsPDF-Dokument oder null, wenn die Bibliothek fehlt
 */
export function createPDF(project) {
    const pdf = createPdfInstance();
    if (!pdf) {
        return null;
    }
    const afterHeader = addPDFHeader(pdf, project, PDF_START_Y);
    addPDFSignature(pdf, addPDFMaterialList(pdf, project, afterHeader));
    return pdf;
}
