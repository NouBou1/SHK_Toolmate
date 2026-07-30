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

console.log("SHK-MATE wird initialisiert...");

// Hauptinitialisierung der App
function initializeApp() {
    console.log("App-Initialisierung gestartet");
    
    // Core-Module initialisieren
    initializeCoreModules();
    
    // Feature-Module initialisieren
    initializeFeatureModules();
    
    console.log("App erfolgreich initialisiert");
}

function initializeCoreModules() {
    // Android/Capacitor Setup - wird automatisch beim Laden ausgeführt
    // Navigation & Kategorien
    if (typeof initCalculatorCategories === 'function') {
        initCalculatorCategories();
    }
}

function initializeFeatureModules() {
    // Projekte & Material
    if (typeof setProjectView === 'function') {
        setProjectView('active');
    }
    
    // Notizen
    if (typeof loadQuickNote === 'function') {
        loadQuickNote();
    }
    
    // Favoriten (mit Verzögerung, damit HTML sicher geladen ist)
    if (typeof initFavorites === 'function') {
        setTimeout(initFavorites, 500);
    }
    
    // Checkliste
    if (typeof loadChecklist === 'function') {
        loadChecklist();
    }
    
    // Inventar
    if (typeof renderInventory === 'function') {
        renderInventory();
    }
    
    // Kalender
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    }
}

// Service Worker registrieren (macht die App offline-fähig)
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js?v=15')
                .then(reg => console.log('[OK] Service Worker registriert!', reg))
                .catch(err => console.log('[FEHLER] Service Worker:', err));
        });
    }
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
