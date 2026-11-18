
// A Nossa Casa — Service Worker v2
// Apenas ficheiros da interface.
// Nunca guardar respostas do Supabase nem dados privados.

const CACHE = 'a-nossa-casa-shell-v2';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(
        ASSETS.map(path => new Request(path, {
          cache: 'reload'
        }))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith('a-nossa-casa-shell-') &&
            key !== CACHE
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  // HTML e manifesto: rede primeiro, cache como alternativa.
  if (
    req.mode === 'navigate' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.webmanifest'
  ) {
    const key = url.pathname === '/manifest.webmanifest'
      ? '/manifest.webmanifest'
      : '/index.html';

    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then(async response => {
          if (response.ok) {
            const copy = response.clone();
            try {
              const cache = await caches.open(CACHE);
              await cache.put(key, copy);
            } catch (_) {}
          }
          return response;
        })
        .catch(async () =>
          (await caches.match(key)) || Response.error()
        )
    );

    return;
  }

  // Ícones: cache primeiro.
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req))
    );
  }
});
