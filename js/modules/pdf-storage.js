// PDF speichern
// Nativ ueber das Capacitor-Dateisystem, im Browser als Download.

const PDF_TARGET_DIRECTORY = 'DOCUMENTS';

function isCapacitor() {
    return typeof window !== 'undefined' &&
           window.Capacitor &&
           window.Capacitor.isNativePlatform &&
           window.Capacitor.isNativePlatform();
}

function sanitizeFileName(name) {
    return ('Rapport_' + name + '.pdf').replace(/[^a-zA-Z0-9_\-.]/g, '_');
}

async function fileExists(path, Filesystem) {
    try {
        await Filesystem.stat({ path, directory: PDF_TARGET_DIRECTORY });
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Haengt (1), (2), ... an, bis ein freier Dateiname gefunden ist
 */
async function incrementFileName(baseName, Filesystem) {
    const parts = baseName.split('.');
    const extension = parts.pop();
    const stem = parts.join('.');

    let counter = 1;
    while (await fileExists(`${stem}(${counter}).${extension}`, Filesystem)) {
        counter++;
    }
    return `${stem}(${counter}).${extension}`;
}

async function getUniqueFileName(baseName, Filesystem) {
    if (await fileExists(baseName, Filesystem)) {
        return incrementFileName(baseName, Filesystem);
    }
    return baseName;
}

function readBlobAsBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('PDF konnte nicht gelesen werden'));
        reader.readAsDataURL(blob);
    });
}

async function writePdfToDocuments(base64data, baseName, Filesystem) {
    const fileName = await getUniqueFileName(baseName, Filesystem);
    await Filesystem.writeFile({
        path: fileName,
        data: base64data,
        directory: PDF_TARGET_DIRECTORY,
        recursive: true
    });
    alert('[OK] PDF gespeichert: ' + fileName);
}

async function saveNativePDF(pdf, projectName, Filesystem) {
    try {
        const base64data = await readBlobAsBase64(pdf.output('blob'));
        await writePdfToDocuments(base64data, sanitizeFileName(projectName), Filesystem);
    } catch (err) {
        console.error('PDF-Fehler:', err);
        alert('[FEHLER] PDF-Fehler: ' + err.message);
    }
}

function saveBrowserPDF(pdf, projectName) {
    try {
        pdf.save('Rapport_' + projectName + '.pdf');
        alert('[OK] PDF wurde heruntergeladen.');
    } catch (err) {
        alert('[FEHLER] PDF-Export fehlgeschlagen: ' + err.message);
    }
}

function getNativeFilesystem() {
    return isCapacitor() ? window.Capacitor.Plugins?.Filesystem : null;
}

export async function savePDF(pdf, projectName) {
    const Filesystem = getNativeFilesystem();
    if (Filesystem) {
        await saveNativePDF(pdf, projectName, Filesystem);
    } else {
        saveBrowserPDF(pdf, projectName);
    }
}
