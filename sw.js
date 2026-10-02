const CACHE_NAME = 'teacher-notebook-v29';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('cloud-api.yandex.net')) return;
    if (e.request.url.includes('relaxdev.ru')) return;
    if (e.request.url.includes('workers.dev')) return;
    if (e.request.url.includes('downloader.disk.yandex.ru')) return;
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});
