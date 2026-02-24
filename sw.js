/* Service Worker - Offline-first PWA for MBS Member Card */
var CACHE_NAME = 'mbs-member-v1';
var ASSETS = [
    'index.html',
    'manifest.json',
    'style.css',
    'main.js',
    'camera.js',
    'assets/logo-192.png',
    'assets/logo-512.png',
    'assets/png1.webp',
    'assets/png2.webp',
    'assets/png3.webp',
    'assets/skin1.webp',
    'assets/skin2.webp',
    'assets/skin3.webp'
];

function scopeUrl(path) {
    var base = self.registration.scope;
    return base + (path || '');
}

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS.map(function (p) { return scopeUrl(p); }));
        }).then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    var url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.indexOf('version.json') !== -1) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(event.request).then(function (cached) {
                if (cached) return cached;
                return fetch(event.request).then(function (res) {
                    if (res && res.status === 200)
                        cache.put(event.request, res.clone());
                    return res;
                }).catch(function () {
                    if (event.request.mode === 'navigate')
                        return cache.match(scopeUrl('index.html')) || new Response('Offline', { status: 503 });
                    return new Response('', { status: 503 });
                });
            });
        })
    );
});
