// Foto Management
// Kamera, Kompression, Speicherung und Anzeige

let currentPhotoItemIndex = null;

function triggerPhoto(index) {
    currentPhotoItemIndex = index;
    const input = document.getElementById('global_camera_input');
    if (input) input.click();
}

function processPhoto(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    
    if (!validateFile(file)) {
        input.value = '';
        return;
    }
    
    readAndCompressFile(file, input);
}

function validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
        alert(`[FEHLER] Datei zu groß (${(file.size / 1024 / 1024).toFixed(1)}MB). Max. 5MB erlaubt.`);
        return false;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('[FEHLER] Nur Bilder erlaubt!');
        return false;
    }
    
    return true;
}

function readAndCompressFile(file, input) {
    const reader = new FileReader();

    reader.onerror = function() {
        alert('[FEHLER] Fehler beim Laden des Fotos. Bitte versuchen Sie es erneut.');
        console.error('FileReader error:', reader.error);
        input.value = '';
    };

    reader.onload = function(e) {
        try {
            compressImage(e.target.result, input);
        } catch (err) {
            handleCompressionError(err, input);
        }
    };

    reader.readAsDataURL(file);
}

function compressImage(dataUrl, input) {
    const img = new Image();
    
    img.onload = function() {
        const compressedData = createCompressedImage(img);
        saveImageToProject(compressedData);
        input.value = '';
    };

    img.src = dataUrl;
}

function createCompressedImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const MAX_WIDTH = 800;
    const scaleSize = MAX_WIDTH / img.width;
    
    canvas.width = MAX_WIDTH;
    canvas.height = img.height * scaleSize;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.7);
}

function handleCompressionError(err, input) {
    console.error('Fehler beim Verarbeiten des Fotos:', err);
    alert('[FEHLER] Foto konnte nicht verarbeitet werden. Bitte erneut versuchen.');
    input.value = '';
}

function saveImageToProject(dataUrl) {
    const projectsDB = window.projectsDB;
    const currentProjectId = window.currentProjectId;
    const activeProj = projectsDB?.find(p => p.id === currentProjectId);
    
    if (activeProj && activeProj.items[currentPhotoItemIndex]) {
        activeProj.items[currentPhotoItemIndex].image = dataUrl;
        window.saveProjects?.();
        console.log("Bild gespeichert, aktualisiere Liste...");
        window.renderMaterialItems?.();
    }
}

function deletePhoto(index) {
    if (!confirm("Möchtest du dieses Foto entfernen?")) return;

    const projectsDB = window.projectsDB;
    const currentProjectId = window.currentProjectId;
    const activeProj = projectsDB?.find(p => p.id === currentProjectId);
    
    if (activeProj && activeProj.items[index]) {
        delete activeProj.items[index].image;
        window.saveProjects?.();
        console.log("Bild gelöscht, aktualisiere Liste...");
        window.renderMaterialItems?.();
    }
}

function showBigImage(src) {
    const overlay = createImageOverlay(src);
    document.body.appendChild(overlay);
}

function createImageOverlay(src) {
    const overlay = document.createElement('div');
    applyOverlayStyles(overlay);
    overlay.onclick = () => document.body.removeChild(overlay);

    const img = document.createElement('img');
    applyImageStyles(img, src);
    
    overlay.appendChild(img);
    return overlay;
}

function applyOverlayStyles(overlay) {
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
}

function applyImageStyles(img, src) {
    img.src = src;
    img.style.maxWidth = '95%';
    img.style.maxHeight = '95%';
    img.style.border = '2px solid white';
}
