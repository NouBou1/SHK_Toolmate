// Unterschriften-Modul
// Zeichenflaeche im Modal, Pruefung und Bereitstellung der Unterschrift.
// Die Unterschrift selbst wird ueber getSignatureDataURL() an den
// PDF-Export weitergereicht - kein direkter Zugriff von aussen.

let signatureDataURL = null;
let signatureCanvas = null;
let signatureContext = null;
let isDrawing = false;

function getSignatureDataURL() {
    return signatureDataURL;
}

function openSignatureModalForPDF() {
    signatureDataURL = null;
    openSignatureModal();
}

function openSignatureModal() {
    const modal = document.getElementById('sig_modal');
    if (modal) {
        modal.style.display = 'flex';
    }
    setupSignatureCanvas();
}

function setupSignatureCanvas() {
    signatureCanvas = document.getElementById('sig_canvas');
    signatureContext = signatureCanvas.getContext('2d');

    signatureContext.strokeStyle = '#000';
    signatureContext.lineWidth = 2;
    signatureContext.lineCap = 'round';
    signatureContext.lineJoin = 'round';

    attachCanvasEvents();
}

function attachCanvasEvents() {
    signatureCanvas.addEventListener('mousedown', startDraw);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', endDraw);
    signatureCanvas.addEventListener('touchstart', startDraw, { passive: false });
    signatureCanvas.addEventListener('touchmove', draw, { passive: false });
    signatureCanvas.addEventListener('touchend', endDraw);
}

function startDraw(e) {
    isDrawing = true;
    draw(e);
}

function endDraw() {
    isDrawing = false;
    signatureContext.beginPath();
}

function draw(e) {
    if (!isDrawing) {
        return;
    }
    e.preventDefault();

    const { x, y } = getDrawPosition(e);
    signatureContext.lineTo(x, y);
    signatureContext.stroke();
    signatureContext.beginPath();
    signatureContext.moveTo(x, y);
}

function getDrawPosition(e) {
    const rect = signatureCanvas.getBoundingClientRect();
    if (e.type.includes('touch')) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function clearSignature() {
    if (signatureContext && signatureCanvas) {
        signatureContext.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
}

function closeSignatureModal() {
    const modal = document.getElementById('sig_modal');
    if (modal) {
        modal.style.display = 'none';
    }
    signatureCanvas = null;
    signatureContext = null;
}

/**
 * Prueft, ob auf der Zeichenflaeche ueberhaupt etwas steht
 */
function hasSignatureContent(canvasElement) {
    const context = canvasElement.getContext('2d');
    const pixels = context.getImageData(0, 0, canvasElement.width, canvasElement.height).data;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 0) {
            return true;
        }
    }
    return false;
}

function validateSignature() {
    if (hasSignatureContent(document.getElementById('sig_canvas'))) {
        return true;
    }
    alert('[WARNUNG] Unterschrift ist leer! Bitte tatsächlich unterschreiben.');
    return false;
}

function previewPDFWithSignature() {
    if (!validateSignature()) {
        return;
    }
    signatureDataURL = signatureCanvas.toDataURL('image/png');
    closeSignatureModal();
    alert('[OK] Unterschrift gespeichert! PDF wird erstellt...');

    setTimeout(exportMaterialListPDFWithSignature, 300);
}

function resetSignature() {
    signatureDataURL = null;
    const canvasElement = document.getElementById('sig_canvas');
    if (!canvasElement) {
        return;
    }
    const context = canvasElement.getContext('2d');
    if (context) {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
}
