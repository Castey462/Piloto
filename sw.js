// IMPORTANTE: cambia este número cada vez que subas una versión nueva del
// index.html (o de cualquier archivo). Es lo que le dice al navegador
// "esto ha cambiado" y activa el aviso de actualización dentro de la app.
// Formato sugerido: fecha + contador del día, p.ej. '2026-08-24-1'.
const APP_VERSION = '2026-08-28-1';
const CACHE_NAME = 'bitacora-' + APP_VERSION;
const CORE_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  // OJO: aquí NO llamamos a self.skipWaiting() automáticamente. La nueva
  // versión se queda "esperando" hasta que la propia app (index.html)
  // decida activarla: sola, si el usuario tiene activado "actualizar
  // automáticamente", o al pulsar el botón del aviso si no lo tiene activado.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// La app le pide al service worker en espera que tome el control ya mismo.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Estrategia: red primero, y si falla (sin conexión) se sirve de la caché.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
