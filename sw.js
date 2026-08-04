
// Service Worker v22 - aligned with current app assets
// Die Liste wird aus index.html und dem Importgraphen von app.js abgeleitet.
// Stylesheets und Einstiegspunkt tragen ein ?v=, die Module nicht - sie werden
// ueber import-Anweisungen geladen. Fuer Bestandsnutzer entscheidet daher
// CACHE_NAME: eine neue Nummer laedt alles neu.
const CACHE_NAME = 'shk-mate-v23';
const ASSETS = [
    // Seiten
    './',
    './index.html',
    './impressum.html',
    './privacy.html',
    './manifest.json',

    // Stylesheets
    './css/base.css?v=36',
    './css/forms.css?v=36',
    './css/navigation.css?v=36',
    './css/projects.css?v=36',
    './css/tables.css?v=36',
    './css/calendar.css?v=36',
    './css/media.css?v=36',
    './css/inventory.css?v=36',

    // Einstiegspunkt
    './app.js?v=36',

    // Module (ueber Importe geladen, daher ohne ?v=)
    './js/calc/behaelter.js',
    './js/calc/common.js',
    './js/calc/heizung.js',
    './js/calc/hydraulik.js',
    './js/calc/lueftung.js',
    './js/calc/montage.js',
    './js/calc/rohrnetz.js',
    './js/calc/wasser.js',
    './js/core/actions.js',
    './js/core/android-init.js',
    './js/core/constants.js',
    './js/core/external-scripts.js',
    './js/core/navigation.js',
    './js/core/utils.js',
    './js/modules/calendar.js',
    './js/modules/checklist.js',
    './js/modules/favorites.js',
    './js/modules/favorites-storage.js',
    './js/modules/inventory.js',
    './js/modules/level.js',
    './js/modules/materials.js',
    './js/modules/notes.js',
    './js/modules/pdf-document.js',
    './js/modules/pdf-export.js',
    './js/modules/pdf-storage.js',
    './js/modules/photos.js',
    './js/modules/project-state.js',
    './js/modules/projects-storage.js',
    './js/modules/projects.js',
    './js/modules/signature.js',
    './js/tools/converters.js',

    // Icons und Schriften
    './assets/icons/icon.png',
    './assets/icons/categories/favoriten.svg',
    './assets/icons/categories/alle.svg',
    './assets/icons/categories/heizung.svg',
    './assets/icons/categories/wasser.svg',
    './assets/icons/categories/lueftung.svg',
    './assets/icons/categories/misc.svg',
    './assets/icons/nav/calculate.svg',
    './assets/icons/nav/format_list_bulleted.svg',
    './assets/icons/nav/inventory_2.svg',
    './assets/icons/nav/calendar_month.svg',
    './assets/icons/nav/handyman.svg',
    './assets/fonts/hanken-grotesk-latin.woff2',
    './assets/fonts/hanken-grotesk-latin-ext.woff2',
    './assets/fonts/jetbrains-mono-latin.woff2',
    './assets/fonts/jetbrains-mono-latin-ext.woff2'
];

// 1. Installieren & Cachen
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all files');
            return cache.addAll(ASSETS);
        })
    );
});

// 2. Anfragen abfangen (Offline First)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            // Entweder aus dem Cache laden ODER aus dem Netz holen
            return response || fetch(e.request);
        })
    );
});

// 3. Alte Caches löschen (bei Update)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});