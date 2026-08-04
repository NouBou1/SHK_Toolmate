// Foto Management
// Kamera, Kompression, Speicherung und Anzeige

import { getCurrentProject, saveProjects } from './project-state.js';
import { renderMaterialItems } from './materials.js';

const MAX_PHOTO_SIZE_MB = 5;
const MAX_WIDTH_PX = 800;
const JPEG_QUALITY = 0.7;

let currentPhotoItemIndex = null;

export function triggerPhoto(index) {
    currentPhotoItemIndex = index;
    const input = document.getElementById('global_camera_input');
    if (input) {
        input.click();
    }
}

function validateFile(file) {
    const sizeMb = file.size / 1024 / 1024;

    if (sizeMb > MAX_PHOTO_SIZE_MB) {
        alert(`[FEHLER] Datei zu groß (${sizeMb.toFixed(1)}MB). Max. ${MAX_PHOTO_SIZE_MB}MB erlaubt.`);
        return false;
    }
    if (!file.type.startsWith('image/')) {
        alert('[FEHLER] Nur Bilder erlaubt!');
        return false;
    }
    return true;
}

function handleReadError(reader, input) {
    alert('[FEHLER] Fehler beim Laden des Fotos. Bitte versuchen Sie es erneut.');
    console.error('FileReader error:', reader.error);
    input.value = '';
}

function handleCompressionError(err, input) {
    console.error('Fehler beim Verarbeiten des Fotos:', err);
    alert('[FEHLER] Foto konnte nicht verarbeitet werden. Bitte erneut versuchen.');
    input.value = '';
}

function createCompressedImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scaleSize = MAX_WIDTH_PX / img.width;

    canvas.width = MAX_WIDTH_PX;
    canvas.height = img.height * scaleSize;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

function saveImageToProject(dataUrl) {
    const project = getCurrentProject();
    if (!project?.items[currentPhotoItemIndex]) {
        return;
    }
    project.items[currentPhotoItemIndex].image = dataUrl;
    saveProjects();
    renderMaterialItems();
}

function compressImage(dataUrl, input) {
    const img = new Image();
    img.onload = () => {
        saveImageToProject(createCompressedImage(img));
        input.value = '';
    };
    img.src = dataUrl;
}

function readAndCompressFile(file, input) {
    const reader = new FileReader();

    reader.onerror = () => handleReadError(reader, input);
    reader.onload = event => {
        try {
            compressImage(event.target.result, input);
        } catch (err) {
            handleCompressionError(err, input);
        }
    };
    reader.readAsDataURL(file);
}

export function processPhoto(input) {
    if (!input.files || !input.files[0]) {
        return;
    }
    const file = input.files[0];
    if (!validateFile(file)) {
        input.value = '';
        return;
    }
    readAndCompressFile(file, input);
}

export function deletePhoto(index) {
    if (!confirm('Möchtest du dieses Foto entfernen?')) {
        return;
    }
    const project = getCurrentProject();
    if (!project?.items[index]) {
        return;
    }
    delete project.items[index].image;
    saveProjects();
    renderMaterialItems();
}

// ========== VOLLBILD ==========

function createImageOverlay(src) {
    const overlay = document.createElement('div');
    overlay.className = 'image-modal';
    overlay.addEventListener('click', () => overlay.remove());

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Foto in voller Größe';

    overlay.append(img);
    return overlay;
}

/**
 * Zeigt das Foto einer Materialposition im Vollbild
 */
export function showBigImage(index) {
    const project = getCurrentProject();
    const src = project?.items[index]?.image;
    if (!src) {
        return;
    }
    document.body.append(createImageOverlay(src));
}
