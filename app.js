// ==========================================
// SHK-MATE - Einstiegspunkt
// ==========================================
// Einziges <script> in index.html. Alles Weitere kommt über
// ES-Module-Importe herein; die Ladereihenfolge ergibt sich
// aus dem Importgraphen von selbst.
//
// Aufgaben dieser Datei:
//   1. Aktionen anmelden - welcher data-action-Name ruft was auf
//   2. Module beim Start initialisieren
//   3. Service Worker registrieren
// ==========================================

import { registerActions, startActionDispatch, withNumber } from './js/core/actions.js';
import {
    shareResult, filterCalculators,
    setupAccessibilityFeatures, setupDynamicInputHandling
} from './js/core/utils.js';
import {
    switchTab, initCalculatorCategories, filterByCategory, setupNavigationKeyboard
} from './js/core/navigation.js';
import {
    initializeAndroidBars, setupKeyboardHandling, setupInputAutoScroll
} from './js/core/android-init.js';

import { calcHeizlast, calcRadiator, calcRealPower, calcCondensate, calcGasPower } from './js/calc/heizung.js';
import { calcVolumenstrom, calcKvValue } from './js/calc/hydraulik.js';
import { calcMAG, calcTank } from './js/calc/behaelter.js';
import { calcHardness, calcMixWater, calcHeatUpTime, calcZirkulation } from './js/calc/wasser.js';
import { calcPipeVol, calcFlowSpeed } from './js/calc/rohrnetz.js';
import { calcAirExchange } from './js/calc/lueftung.js';
import { calcOffset, calcSlope, calcCoreDrill, calcClipDist } from './js/calc/montage.js';

import {
    setProjectView, addProject, openProject, closeProject,
    toggleArchiveStatus, deleteCurrentProject
} from './js/modules/projects.js';
import { addMaterialItem, deleteMaterialItem } from './js/modules/materials.js';
import { triggerPhoto, deletePhoto, showBigImage, processPhoto } from './js/modules/photos.js';
import { loadQuickNote, autoSaveNote, copyNote, clearNote } from './js/modules/notes.js';
import { initFavorites, toggleFavorite } from './js/modules/favorites.js';
import { requestLevelPerm } from './js/modules/level.js';
import { loadChecklist, resetChecklist, toggleCheck } from './js/modules/checklist.js';
import { renderInventory, addInventoryItem, updateStock, deleteInventoryItem } from './js/modules/inventory.js';
import { renderCalendar, changeMonth, showEventsForDay, jumpToProject } from './js/modules/calendar.js';
import {
    openSignatureModalForPDF, clearSignature,
    closeSignatureModal, confirmSignature
} from './js/modules/signature.js';
import { exportMaterialListPDF, exportMaterialListPDFWithSignature } from './js/modules/pdf-export.js';
import { convertUnits, searchError } from './js/tools/converters.js';

const FAVORITES_INIT_DELAY_MS = 500;

// ========== AKTIONEN ==========
// Name im data-action-Attribut -> Funktion. Der Handler bekommt das
// ausloesende Element und liest daraus weitere Werte (data-index usw.).

const RECHNER_AKTIONEN = {
    calcHeizlast, calcRadiator, calcRealPower, calcCondensate, calcGasPower,
    calcVolumenstrom, calcKvValue, calcMAG, calcTank, calcHardness,
    calcMixWater, calcHeatUpTime, calcZirkulation, calcPipeVol, calcFlowSpeed,
    calcAirExchange, calcOffset, calcSlope, calcCoreDrill, calcClipDist
};

const KLICK_AKTIONEN = {
    ...RECHNER_AKTIONEN,

    // Navigation
    switchTab: element => switchTab(element.dataset.view, element),
    filterByCategory: element => filterByCategory(element.dataset.cat, element),
    toggleFavorite: element => toggleFavorite(element),

    // Projekte & Material
    setProjectView: element => setProjectView(element.dataset.mode),
    addProject,
    openProject: withNumber('projectId', openProject),
    closeProject,
    toggleArchiveStatus,
    deleteCurrentProject,
    addMaterialItem,
    deleteMaterialItem: withNumber('index', deleteMaterialItem),

    // Fotos
    triggerPhoto: withNumber('index', triggerPhoto),
    deletePhoto: withNumber('index', deletePhoto),
    showBigImage: withNumber('index', showBigImage),

    // Notizen
    copyNote,
    clearNote,

    // PDF & Unterschrift
    // Hier laufen beide Module zusammen: die Unterschrift meldet "fertig",
    // und erst diese Stelle entscheidet, dass danach das PDF entsteht.
    openSignatureModalForPDF,
    clearSignature,
    closeSignatureModal,
    previewPDFWithSignature: () => confirmSignature(exportMaterialListPDFWithSignature),
    exportMaterialListPDF,

    // Werkzeuge
    convertUnits,
    searchError,
    requestLevelPerm,
    resetChecklist,
    toggleCheck: withNumber('index', toggleCheck),

    // Inventar
    addInventoryItem,
    updateStock: element => updateStock(Number(element.dataset.index), Number(element.dataset.delta)),
    deleteInventoryItem: withNumber('index', deleteInventoryItem),

    // Kalender
    changeMonth: withNumber('delta', changeMonth),
    showEventsForDay: element => showEventsForDay(element.dataset.isoDate, Number(element.dataset.day)),
    jumpToProject: withNumber('projectId', jumpToProject),

    // Ergebnis teilen
    shareResult: element => shareResult(element)
};

const EINGABE_AKTIONEN = {
    autoSaveNote,
    filterCalculators
};

const AENDERUNGS_AKTIONEN = {
    processPhoto: element => processPhoto(element)
};

// ========== START ==========

const FEATURE_INITIALIZERS = [
    () => setProjectView('active'),
    loadQuickNote,
    () => setTimeout(initFavorites, FAVORITES_INIT_DELAY_MS),
    loadChecklist,
    renderInventory,
    renderCalendar
];

function initializeActions() {
    registerActions('click', KLICK_AKTIONEN);
    registerActions('input', EINGABE_AKTIONEN);
    registerActions('change', AENDERUNGS_AKTIONEN);
    startActionDispatch();
}

function initializeCoreModules() {
    initCalculatorCategories();
    setupNavigationKeyboard();
    setupAccessibilityFeatures();
    setupDynamicInputHandling();
}

function initializeApp() {
    initializeActions();
    initializeCoreModules();
    FEATURE_INITIALIZERS.forEach(start => start());
    console.log('[OK] SHK-Mate initialisiert');
}

async function initializeNativeShell() {
    await initializeAndroidBars();
    setupKeyboardHandling();
    setupInputAutoScroll();
}

// ========== SERVICE WORKER ==========

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

function clearAllCaches() {
    if (!('caches' in window)) {
        return null;
    }
    return caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
}

// Hinterlassenschaften aufraeumen: registrierte Worker und deren Caches entfernen
function unregisterServiceWorker() {
    navigator.serviceWorker.getRegistrations()
        .then(regs => Promise.all(regs.map(reg => reg.unregister())))
        .then(clearAllCaches)
        .then(() => console.log('[OK] Service Worker fuer lokale Entwicklung deaktiviert'))
        .catch(err => console.log('[FEHLER] Service Worker Cleanup:', err));
}

function registerServiceWorkerOnLoad() {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js?v=23')
            .then(reg => console.log('[OK] Service Worker registriert!', reg))
            .catch(err => console.log('[FEHLER] Service Worker:', err));
    });
}

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

// Module laufen automatisch verzoegert (defer), das DOM steht hier bereits.
initializeApp();
initializeNativeShell();
registerServiceWorker();
