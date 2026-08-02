
// Service Worker v17 - aligned with current app assets
const CACHE_NAME = 'shk-mate-v17';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=31',
  './app.js?v=31',
  './js/calc.js?v=31',
  './js/core/navigation.js?v=31',
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