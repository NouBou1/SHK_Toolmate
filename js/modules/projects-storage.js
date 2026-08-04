// Projekt-Speicherung
// Laden und Sichern der Projekte im LocalStorage.
// Beschaedigte Daten werden gesichert statt still verworfen.

function backupCorruptedProjects() {
    const corrupted = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!corrupted) {
        return;
    }
    const backupKey = 'shk_projects_backup_' + Date.now();
    try {
        localStorage.setItem(backupKey, corrupted);
        console.log('Beschädigte Daten gesichert unter:', backupKey);
    } catch (err) {
        console.error('Backup fehlgeschlagen:', err);
    }
}

function parseProjects(raw) {
    const projects = JSON.parse(raw);
    if (!Array.isArray(projects)) {
        console.error('Ungültiges Projekt-Format - Array erwartet');
        return [];
    }
    return projects;
}

/**
 * Laedt die Projekte aus dem LocalStorage
 * @returns {Array} Projekte, im Fehlerfall eine leere Liste
 */
function loadProjectsFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
        return [];
    }
    try {
        return parseProjects(raw);
    } catch (error) {
        console.error('Projekte konnten nicht geladen werden:', error);
        backupCorruptedProjects();
        return [];
    }
}

function warnOnLargeStorage(data) {
    const megabytes = new Blob([data]).size / (1024 * 1024);
    if (megabytes > 4) {
        console.warn(`[WARNUNG] localStorage ist ${megabytes.toFixed(2)}MB groß! Speicher wird knapp.`);
    }
}

function handleSaveError(err) {
    if (err.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded:', err);
        alert('[FEHLER] Speicher voll! Bitte alte Projekte und Fotos löschen um Platz zu machen.');
        return;
    }
    alert('[FEHLER] Fehler beim Speichern: ' + err.message);
}

function saveProjects() {
    try {
        const data = JSON.stringify(projectsDB);
        warnOnLargeStorage(data);
        localStorage.setItem(STORAGE_KEYS.PROJECTS, data);
    } catch (err) {
        handleSaveError(err);
    }
}
