const CACHE_NAME = 'teacher-notebook-v46';
const FILES_TO_CACHE = ['./', './index.html', './manifest.json'];

// Установка: кешируем оболочку
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
    self.skipWaiting();
});

// Активация: чистим старые кеши
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )));
    self.clients.claim();
});

// Запросы
self.addEventListener('fetch', (e) => {
    const url = e.request.url;

    // Внешние API — пропускаем напрямую
    if (url.includes('cloud-api.yandex.net')) return;
    if (url.includes('relaxdev.ru')) return;
    if (url.includes('workers.dev')) return;
    if (url.includes('downloader.disk.yandex.ru')) return;
    if (url.includes('api.github.com')) return;

    // Только GET кешируем/отдаём
    if (e.request.method !== 'GET') return;

    const isHtml = e.request.mode === 'navigate'
                || url.endsWith('/')
                || url.endsWith('/index.html')
                || url.endsWith('.html');

    if (isHtml) {
        // HTML — сеть в приоритете, кеш как fallback (оффлайн)
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
                    return res;
                })
                .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
        );
        return;
    }

    // Остальное (manifest, иконки) — кеш в приоритете
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});
