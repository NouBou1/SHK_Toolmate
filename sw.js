
// Service Worker v12 - aligned with current app assets
// Alle Pfade relativ zur Service-Worker-URL, damit die App auch in einem
// Unterordner (z.B. domain.de/shkmate/) funktioniert.
const CACHE_NAME = 'shk-mate-v12';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=26',
  './app.js?v=26',
  './js/calc.js?v=26',
  './js/core/navigation.js?v=26',
  './manifest.json',
  './icons/icon.png',
  './icons/categories/alle.svg',
  './icons/categories/heizung.svg',
  './icons/categories/wasser.svg',
  './icons/categories/lueftung.svg',
  './icons/categories/misc.svg'
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