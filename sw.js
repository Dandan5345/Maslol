const CACHE_NAME = 'chavshanim-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/login.html',
  '/axes.html',
  '/resuscitation.html',
  '/trauma.html',
  '/routine.html',
  '/anamnesis.html',
  '/mental-health.html',
  '/firebase-common.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE.filter(url => !url.includes('firebase'))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firebase') || event.request.url.includes('googleapis') || event.request.url.includes('gstatic')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('/login.html')))
  );
});
