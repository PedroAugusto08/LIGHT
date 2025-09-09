// Service Worker básico para cache offline
const CACHE_NAME = 'light-cache-v1';
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/style.css?v=20250904',
  '/teste.css?v=20250904',
  '/script.js?v=20250904',
  '/testes.js?v=20250904',
  '/images/fundo.png',
  '/images/favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return; // não intercepta POST para /api
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Cache apenas respostas OK do mesmo host
        try {
          if (res.ok && new URL(req.url).origin === self.location.origin) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
          }
        } catch(_) {}
        return res;
      }).catch(() => cached); // fallback ao cache se offline
    })
  );
});
