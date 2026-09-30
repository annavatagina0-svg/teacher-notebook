const CACHE_NAME = 'teacher-notebook-v21';
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
    // Пропускаем API-запросы и CORS-прокси — они не должны кэшироваться
    if (e.request.url.includes('cloud-api.yandex.net')) return;
    if (e.request.url.includes('downloader.disk.yandex.ru')) return;
    if (e.request.url.includes('corsproxy.io')) return;
    if (e.request.url.includes('allorigins.win')) return;
    if (e.request.url.includes('codetabs.com')) return;

    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});
