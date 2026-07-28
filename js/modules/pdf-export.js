// PDF Export & Unterschriften Modul
// PDF-Erstellung mit Unterschrift und Native Speicherung

let signatureDataURL = null;
let canvas, ctx, isDrawing = false;

const EXTERNAL_OPT_IN_KEYS = {
    pdf: 'shk_external_pdf_opt_in'
};

const EXTERNAL_LIB_URLS = {
    jsPdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
};

// --- Signature Canvas ---
function openSignatureModalForPDF() {
    signatureDataURL = null;
    openSignatureModal();
}

function openSignatureModal() {
    const modal = document.getElementById('sig_modal');
    if (modal) modal.style.display = 'flex';
    
    setupSignatureCanvas();
}

function setupSignatureCanvas() {
    canvas = document.getElementById('sig_canvas');
    ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    attachCanvasEvents();
}

function attachCanvasEvents() {
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('touchend', endDraw);
}

function startDraw(e) {
    isDrawing = true;
    draw(e);
}

function endDraw() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const { x, y } = getDrawPosition(e);
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function getDrawPosition(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if (e.type.includes('touch')) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    
    return { x, y };
}

function clearSignature() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function closeSignatureModal() {
    const modal = document.getElementById('sig_modal');
    if (modal) modal.style.display = 'none';
    canvas = null;
    ctx = null;
}

function previewPDFWithSignature() {
    if (!validateSignature()) return;
    
    signatureDataURL = canvas.toDataURL('image/png');
    closeSignatureModal();
    alert("[OK] Unterschrift gespeichert! PDF wird erstellt...");
    
    setTimeout(() => {
        exportMaterialListPDFWithSignature();
    }, 300);
}

function validateSignature() {
    const canvas = document.getElementById('sig_canvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
    }
    
    alert("[WARNUNG] Unterschrift ist leer! Bitte tatsächlich unterschreiben.");
    return false;
}

function exportMaterialListPDF() {
    signatureDataURL = null;
    exportMaterialListPDFWithSignature();
}

async function exportMaterialListPDFWithSignature() {
    try {
        const libsReady = await ensurePdfLibsLoaded();
        if (!libsReady) return;

        const project = getCurrentProject();
        if (!project) return;

        const pdf = await createPDF(project);
        await savePDF(pdf, project.name);
        
        resetSignature();
    } catch (err) {
        handlePDFError(err);
    }
}

function getCurrentProject() {
    const projectsDB = window.projectsDB || [];
    const currentProjectId = window.currentProjectId;
    const project = projectsDB.find(p => p.id === currentProjectId);
    
    if (!project) {
        alert("[FEHLER] Kein Projekt ausgewählt!");
        return null;
    }
    
    if (!project.items || project.items.length === 0) {
        const confirmEmpty = confirm('[WARNUNG] Materialliste ist leer. Trotzdem PDF erstellen?');
        if (!confirmEmpty) return null;
    }
    
    return project;
}

async function createPDF(project) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        alert("[FEHLER] PDF-Bibliothek nicht geladen. Bitte Seite neu laden.");
        return null;
    }
    
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    let yPosition = 20;
    const margin = 15;
    
    yPosition = addPDFHeader(pdf, project, margin, yPosition);
    yPosition = addPDFMaterialList(pdf, project, margin, yPosition);
    addPDFSignature(pdf, margin, yPosition);
    
    return pdf;
}

function addPDFHeader(pdf, project, margin, yPosition) {
    pdf.setFontSize(20);
    pdf.setTextColor(0, 86, 179);
    pdf.text('SHK-MATE Rapport', margin, yPosition);
    yPosition += 12;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(project.name, margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Erstellt: ' + project.date, margin, yPosition);
    yPosition += 12;
    
    return yPosition;
}

function addPDFMaterialList(pdf, project, margin, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (2 * margin);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Materialliste:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 5, contentWidth, 6, 'F');
    pdf.text('Anzahl', margin + 2, yPosition);
    pdf.text('Material', margin + 25, yPosition);
    yPosition += 8;

    project.items.forEach(item => {
        yPosition = addPDFMaterialItem(pdf, item, margin, contentWidth, yPosition);
    });
    
    return yPosition + 5;
}

function addPDFMaterialItem(pdf, item, margin, contentWidth, yPosition) {
    const amount = item.amount || '1';
    const text = item.text || 'Ohne Name';
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPosition - 5, contentWidth, 6);
    pdf.text(amount + 'x', margin + 2, yPosition);
    
    const splitText = pdf.splitTextToSize(text, contentWidth - 25);
    pdf.text(splitText, margin + 25, yPosition);
    
    return yPosition + 6 + (splitText.length - 1) * 4;
}

function addPDFSignature(pdf, margin, yPosition) {
    if (!signatureDataURL) return;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Unterschrift:', margin, yPosition);
    yPosition += 8;
    
    try {
        pdf.addImage(signatureDataURL, 'PNG', margin, yPosition, 60, 30);
    } catch (err) {
        console.error('Fehler beim Einfügen der Unterschrift:', err);
    }
}

async function savePDF(pdf, projectName) {
    const isCap = isCapacitor();
    const Filesystem = isCap ? window.Capacitor.Plugins?.Filesystem : null;

    if (Filesystem) {
        await saveNativePDF(pdf, projectName, Filesystem);
    } else {
        saveBrowserPDF(pdf, projectName);
    }
}

function isCapacitor() {
    return typeof window !== 'undefined' && 
           window.Capacitor && 
           window.Capacitor.isNativePlatform && 
           window.Capacitor.isNativePlatform();
}

async function saveNativePDF(pdf, projectName, Filesystem) {
    try {
        const baseName = sanitizeFileName(projectName);
        const pdfBlob = pdf.output('blob');
        
        const reader = new FileReader();
        reader.onloadend = async function() {
            try {
                const base64data = reader.result.split(',')[1];
                const finalFileName = await getUniqueFileName(baseName, Filesystem);
                
                await Filesystem.writeFile({
                    path: finalFileName,
                    data: base64data,
                    directory: 'DOCUMENTS',
                    recursive: true
                });
                
                alert('[OK] PDF gespeichert: ' + finalFileName);
            } catch (err) {
                console.error('PDF-Fehler:', err);
                alert('[FEHLER] PDF-Fehler: ' + err.message);
            }
        };
        reader.readAsDataURL(pdfBlob);
    } catch (err) {
        console.error('PDF-Fehler:', err);
        alert('[FEHLER] PDF-Fehler: ' + err.message);
    }
}

function sanitizeFileName(name) {
    return ('Rapport_' + name + '.pdf').replace(/[^a-zA-Z0-9_\-\.]/g, '_');
}

async function getUniqueFileName(baseName, Filesystem) {
    try {
        await Filesystem.stat({ path: baseName, directory: 'DOCUMENTS' });
        return await incrementFileName(baseName, Filesystem);
    } catch (e) {
        return baseName;
    }
}

async function incrementFileName(baseName, Filesystem) {
    const nameParts = baseName.split('.');
    const extension = nameParts.pop();
    const nameWithoutExt = nameParts.join('.');
    
    let counter = 1;
    let newName = `${nameWithoutExt}(${counter}).${extension}`;
    
    while (true) {
        try {
            await Filesystem.stat({ path: newName, directory: 'DOCUMENTS' });
            counter++;
            newName = `${nameWithoutExt}(${counter}).${extension}`;
        } catch (e) {
            return newName;
        }
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

function resetSignature() {
    signatureDataURL = null;
    const sigCanvas = document.getElementById('sig_canvas');
    if (sigCanvas) {
        const sigCtx = sigCanvas.getContext('2d');
        if (sigCtx) {
            sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        }
    }
}

function handlePDFError(err) {
    console.error('Fehler beim PDF Export:', err);
    alert('[FEHLER] PDF Export fehlgeschlagen. Bitte erneut versuchen.');
}

async function ensurePdfLibsLoaded() {
    if (window.jspdf && window.jspdf.jsPDF) return true;

    if (localStorage.getItem(EXTERNAL_OPT_IN_KEYS.pdf) !== 'true') {
        const ok = confirm(
            'PDF-Export laedt jsPDF von jsdelivr (Drittanbieter). Dabei wird deine IP an den Dienst uebertragen. Fortfahren?'
        );
        if (!ok) return false;
        localStorage.setItem(EXTERNAL_OPT_IN_KEYS.pdf, 'true');
    }

    try {
        await loadExternalScriptOnce('jspdf-lib', EXTERNAL_LIB_URLS.jsPdf);
        return !!(window.jspdf && window.jspdf.jsPDF);
    } catch (err) {
        console.error('jsPDF konnte nicht geladen werden:', err);
        alert('[FEHLER] PDF-Bibliothek konnte nicht geladen werden. Bitte spaeter erneut versuchen.');
        return false;
    }
}

function loadExternalScriptOnce(scriptId, src) {
    return new Promise((resolve, reject) => {
        const existing = document.getElementById(scriptId);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Script load failed')));
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error('Script load failed'));
        document.head.appendChild(script);
    });
}
