// PDF-Export (Ablaufsteuerung)
// Verbindet Projektauswahl, Bibliothek, Dokumentaufbau und Speichern.
//
// Bausteine:
//   signature.js      Unterschrift erfassen
//   pdf-document.js   Dokument aufbauen
//   pdf-storage.js    Dokument speichern
//   external-scripts  jsPDF nachladen

import { EXTERNAL_OPT_IN_KEYS, EXTERNAL_LIB_URLS, hasExternalOptIn, askForExternalOptIn, loadExternalScriptOnce } from '../core/external-scripts.js';
import { getCurrentProject } from './project-state.js';
import { createPDF } from './pdf-document.js';
import { savePDF } from './pdf-storage.js';
import { resetSignature } from './signature.js';

const JSPDF_SERVICE_NAME = 'jsPDF (PDF-Export, via jsdelivr)';

function isPdfLibLoaded() {
    return Boolean(window.jspdf && window.jspdf.jsPDF);
}

/**
 * Stellt sicher, dass jsPDF verfuegbar ist - inklusive Zustimmung zum Nachladen
 */
function isPdfDownloadAllowed() {
    return hasExternalOptIn(EXTERNAL_OPT_IN_KEYS.pdf) ||
           askForExternalOptIn(EXTERNAL_OPT_IN_KEYS.pdf, JSPDF_SERVICE_NAME);
}

async function ensurePdfLibsLoaded() {
    if (isPdfLibLoaded()) {
        return true;
    }
    if (!isPdfDownloadAllowed()) {
        return false;
    }
    try {
        await loadExternalScriptOnce('jspdf-lib', EXTERNAL_LIB_URLS.jsPdf);
        return isPdfLibLoaded();
    } catch (err) {
        return reportPdfLibFailure(err);
    }
}

function reportPdfLibFailure(err) {
    console.error('jsPDF konnte nicht geladen werden:', err);
    alert('[FEHLER] PDF-Bibliothek konnte nicht geladen werden. Bitte spaeter erneut versuchen.');
    return false;
}

function confirmEmptyMaterialList(project) {
    if (project.items && project.items.length > 0) {
        return true;
    }
    return confirm('[WARNUNG] Materialliste ist leer. Trotzdem PDF erstellen?');
}

/**
 * Projekt fuer den Export ermitteln - inklusive Rueckfrage bei leerer Liste
 */
function getProjectForExport() {
    const project = getCurrentProject();

    if (!project) {
        alert('[FEHLER] Kein Projekt ausgewählt!');
        return null;
    }
    return confirmEmptyMaterialList(project) ? project : null;
}

function handlePDFError(err) {
    console.error('Fehler beim PDF Export:', err);
    alert('[FEHLER] PDF Export fehlgeschlagen. Bitte erneut versuchen.');
}

async function buildAndSavePDF(project) {
    const pdf = createPDF(project);
    if (!pdf) {
        return;
    }
    await savePDF(pdf, project.name);
    resetSignature();
}

export async function exportMaterialListPDFWithSignature() {
    try {
        const project = (await ensurePdfLibsLoaded()) ? getProjectForExport() : null;
        if (project) {
            await buildAndSavePDF(project);
        }
    } catch (err) {
        handlePDFError(err);
    }
}

/**
 * Export ohne Unterschrift (Button "PDF erstellen")
 */
export function exportMaterialListPDF() {
    resetSignature();
    exportMaterialListPDFWithSignature();
}
