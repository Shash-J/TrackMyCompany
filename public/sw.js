// Replaced in dist by the build plugin. Each deployment has an isolated shell.
const CACHE_PREFIX = `trackmycompany-shell-${encodeURIComponent(self.registration.scope)}-`;
const CACHE_NAME = `${CACHE_PREFIX}__BUILD_REVISION__`;
const PRECACHE_ASSETS = [
  /* __PRECACHE_ASSETS__ */
];

self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting')) {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('install', (event) => {
  // Failed precaching rejects installation, preserving the previous worker.
  // Include lazy chunks so features work offline before their first use.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_ASSETS.map(asset => new Request(
      new URL(asset, self.registration.scope), { cache: 'reload' }
    )));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    // Other apps and the legacy shared-origin cache are not ours to delete.
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname === new URL('version.json', scope).pathname ||
      url.pathname === new URL('sw.js', scope).pathname) return;

  if (request.mode === 'navigate') {
    // Open the local shell immediately. Registration checks updates separately.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const shell = await cache.match(new URL('index.html', scope).href);
      if (shell) return shell;
      try { return await fetch(request); }
      catch {
        return new Response('TrackMyCompany is currently offline.', {
          status: 503, headers: { 'Content-Type': 'text/plain' },
        });
      }
    })());
    return;
  }

  // Release assets are immutable. Cache hits need no network revalidation.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try { return await fetch(request); }
    catch { return Response.error(); }
  })());
});
