
// Service Worker v21 - aligned with current app assets
// WICHTIG: Diese Liste muss zu den <link>- und <script>-Tags in
// index.html passen (gleiche Pfade, gleiche ?v=-Nummer).
const CACHE_NAME = 'shk-mate-v21';
const ASSETS = [
    './',
    './index.html',
    './impressum.html',
    './privacy.html',

    // Stylesheets
    './css/base.css?v=33',
    './css/forms.css?v=33',
    './css/navigation.css?v=33',
    './css/projects.css?v=33',
    './css/tables.css?v=33',
    './css/calendar.css?v=33',
    './css/media.css?v=33',
    './css/inventory.css?v=35',

    // Core
    './js/core/constants.js?v=33',
    './js/core/android-init.js?v=33',
    './js/core/navigation.js?v=33',
    './js/core/utils.js?v=33',
    './js/core/external-scripts.js?v=33',
    './js/core/android-init-global.js?v=33',

    // Feature-Module
    './js/modules/projects-storage.js?v=33',
    './js/modules/projects.js?v=33',
    './js/modules/materials.js?v=33',
    './js/modules/photos.js?v=33',
    './js/modules/notes.js?v=33',
    './js/modules/favorites.js?v=33',
    './js/modules/level.js?v=33',
    './js/modules/checklist.js?v=33',
    './js/modules/inventory.js?v=33',
    './js/modules/calendar.js?v=33',
    './js/modules/signature.js?v=33',
    './js/modules/pdf-document.js?v=33',
    './js/modules/pdf-storage.js?v=33',
    './js/modules/pdf-export.js?v=33',
    './js/tools/converters.js?v=33',

    // Rechner
    './js/calc/common.js?v=33',
    './js/calc/heizung.js?v=33',
    './js/calc/hydraulik.js?v=33',
    './js/calc/behaelter.js?v=33',
    './js/calc/wasser.js?v=33',
    './js/calc/rohrnetz.js?v=33',
    './js/calc/lueftung.js?v=33',
    './js/calc/montage.js?v=33',

    './app.js?v=33',
    './manifest.json',
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