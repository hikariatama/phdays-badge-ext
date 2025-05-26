const CACHE_NAME = 'phdays-badge-v1';
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    './badge_white.png',
    './badge_red.png',
    './phdays-badge-pro.bin',
    'https://unpkg.com/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.js',
    'https://unpkg.com/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm',
    'https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/umd/ffmpeg-core.worker.js',
];

async function getFilesFromAutoindex(path) {
    try {
        const res = await fetch(path);
        const text = await res.text();
        const matches = [...text.matchAll(/href="([^"?][^"]+)"/g)];
        return matches
            .map(m => m[1])
            .filter(href => href !== '../' && !href.endsWith('/'))
            .map(href => path + href);
    } catch (e) {
        return [];
    }
}

async function cacheAllFiles() {
    let filesToCache = [...FILES_TO_CACHE];
    const fonts = await getFilesFromAutoindex('/fonts/');
    const assets = await getFilesFromAutoindex('/assets/');
    filesToCache = filesToCache.concat(fonts, assets);

    console.log('Caching files:', filesToCache);

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(filesToCache);
}

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        (async () => {
            await cacheAllFiles();
        })()
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            try {
                const response = await fetch(event.request);

                if (response && response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, response.clone());
                    return response;
                } else {
                    const cachedResponse = await caches.match(event.request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                }
            } catch (error) {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }
            }
            return new Response('Network error occurred', { status: 408, statusText: 'Network Error' });
        })()
    );
});

self.addEventListener('message', event => {
    if (event.data === 'cacheAllFiles') {
        (async () => {
            await cacheAllFiles();
        })();
    }
});
