// Schnell-Notiz Modul
// Auto-Save, Copy & Clear Funktionen

let saveTimeout;

function loadQuickNote() {
    const noteField = document.getElementById('quick_note');
    if (!noteField) {
        return;
    }

    const saved = localStorage.getItem(STORAGE_KEYS.QUICK_NOTE);
    if (saved) {
        noteField.value = saved;
    }
}

function autoSaveNote() {
    const noteField = document.getElementById('quick_note');
    const statusSpan = document.getElementById('note_status');

    saveNoteToStorage(noteField.value);
    showSaveStatus(statusSpan);
}

function saveNoteToStorage(value) {
    localStorage.setItem(STORAGE_KEYS.QUICK_NOTE, value);
}

function showSaveStatus(statusSpan) {
    if (!statusSpan) {
        return;
    }

    statusSpan.style.opacity = '1';
    clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
        statusSpan.style.opacity = '0';
    }, 1500);
}

function copyNote() {
    const noteField = document.getElementById('quick_note');
    if (!noteField || !noteField.value) {
        return;
    }

    copyToClipboard(noteField.value);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('[OK] Notiz in Zwischenablage kopiert!');
    }).catch(err => {
        console.error('Fehler beim Kopieren:', err);
        alert('[FEHLER] Fehler beim Kopieren.');
    });
}

function clearNote() {
    const noteField = document.getElementById('quick_note');
    if (!noteField || noteField.value === '') {
        return;
    }

    if (confirm('Notiz wirklich löschen?')) {
        noteField.value = '';
        localStorage.removeItem(STORAGE_KEYS.QUICK_NOTE);
    }
}
