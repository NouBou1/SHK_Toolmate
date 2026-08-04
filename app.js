// ==========================================
// SHK-MATE - Haupt-Initialisierungsdatei
// ==========================================
// Diese Datei koordiniert alle Module und startet die App
//
// Module sind aufgeteilt in:
// - js/core/        : Kernfunktionalität (Android, Navigation, Utils)
// - js/modules/     : Feature-Module (Projects, Photos, Notes, etc.)
// - js/tools/       : Werkzeuge (Converter, etc.)
//
// Alle Module werden als separate Script-Tags in index.html geladen.
// Die Initialisierung erfolgt nach dem DOMContentLoaded Event.
// ==========================================

console.log('SHK-MATE wird initialisiert...');

// Hauptinitialisierung der App
function initializeApp() {
    console.log('App-Initialisierung gestartet');

    // Core-Module initialisieren
    initializeCoreModules();

    // Feature-Module initialisieren
    initializeFeatureModules();

    console.log('App erfolgreich initialisiert');
}

function initializeCoreModules() {
    // Android/Capacitor Setup - wird automatisch beim Laden ausgeführt
    // Navigation & Kategorien
    if (typeof initCalculatorCategories === 'function') {
        initCalculatorCategories();
    }
}

// Verzögerung für die Favoriten, damit das HTML sicher gerendert ist
const FAVORITES_INIT_DELAY_MS = 500;

// Feature-Module mit ihrer Startfunktion.
// Nicht geladene Module werden übersprungen, die App startet trotzdem.
const FEATURE_INITIALIZERS = [
    { name: 'setProjectView', start: () => setProjectView('active') },
    { name: 'loadQuickNote', start: () => loadQuickNote() },
    { name: 'initFavorites', start: () => setTimeout(initFavorites, FAVORITES_INIT_DELAY_MS) },
    { name: 'loadChecklist', start: () => loadChecklist() },
    { name: 'renderInventory', start: () => renderInventory() },
    { name: 'renderCalendar', start: () => renderCalendar() }
];

function isModuleAvailable(functionName) {
    return typeof window[functionName] === 'function';
}

function initializeFeatureModules() {
    FEATURE_INITIALIZERS
        .filter(feature => isModuleAvailable(feature.name))
        .forEach(feature => feature.start());
}

// Lokaler Dev-Server (Live Server)? Dann keinen Service Worker verwenden.
// Ein SW gilt pro Origin (host:port), nicht pro Projekt - auf localhost wuerde er
// sonst auch andere Projekte auf demselben Port aus dem SHK-Cache ausliefern.
// Die native App (Capacitor, https://localhost) ist davon ausgenommen.
function isLocalDevServer() {
    if (window.Capacitor) {
        return false;
    }
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    return isLocalHost && window.location.protocol === 'http:';
}

// Hinterlassenschaften aufraeumen: bereits registrierte Worker und deren Caches entfernen
function unregisterServiceWorker() {
    navigator.serviceWorker.getRegistrations()
        .then(regs => Promise.all(regs.map(reg => reg.unregister())))
        .then(() => {
            if ('caches' in window) {
                return caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
            }
        })
        .then(() => console.log('[OK] Service Worker fuer lokale Entwicklung deaktiviert'))
        .catch(err => console.log('[FEHLER] Service Worker Cleanup:', err));
}

function registerServiceWorkerOnLoad() {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js?v=20')
            .then(reg => console.log('[OK] Service Worker registriert!', reg))
            .catch(err => console.log('[FEHLER] Service Worker:', err));
    });
}

// Service Worker registrieren (macht die App offline-fähig)
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return;
    }
    if (isLocalDevServer()) {
        unregisterServiceWorker();
        return;
    }
    registerServiceWorkerOnLoad();
}

// Starte App-Initialisierung
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
        registerServiceWorker();
    });
} else {
    initializeApp();
    registerServiceWorker();
}
