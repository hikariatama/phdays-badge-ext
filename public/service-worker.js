const CACHE_NAME = 'phdays-badge-v1';
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    './badge_white.png',
    './badge_red.png',
    './phdays-badge-pro.bin',
    './fonts/InterDisplay-Italic.woff2',
    './fonts/InterDisplay-BlackItalic.woff2',
    './fonts/Inter-Medium.woff2',
    './fonts/Inter-Black.woff2',
    './fonts/InterDisplay-ExtraLightItalic.woff2',
    './fonts/Inter-Regular.woff2',
    './fonts/InterDisplay-ExtraBold.woff2',
    './fonts/Inter-ExtraLight.woff2',
    './fonts/inter.css',
    './fonts/font.otf',
    './fonts/InterDisplay-ExtraLight.woff2',
    './fonts/Inter-ThinItalic.woff2',
    './fonts/Inter-Light.woff2',
    './fonts/InterDisplay-Bold.woff2',
    './fonts/Inter-Thin.woff2',
    './fonts/InterDisplay-ThinItalic.woff2',
    './fonts/InterDisplay-Thin.woff2',
    './fonts/Inter-MediumItalic.woff2',
    './fonts/Inter-ExtraBold.woff2',
    './fonts/InterDisplay-BoldItalic.woff2',
    './fonts/Inter-SemiBold.woff2',
    './fonts/Inter-LightItalic.woff2',
    './fonts/InterDisplay-Regular.woff2',
    './fonts/Inter-BoldItalic.woff2',
    './fonts/Inter-Bold.woff2',
    './fonts/InterVariable.woff2',
    './fonts/Inter-ExtraBoldItalic.woff2',
    './fonts/InterDisplay-Medium.woff2',
    './fonts/InterDisplay-Black.woff2',
    './fonts/Inter-Italic.woff2',
    './fonts/InterDisplay-LightItalic.woff2',
    './fonts/InterVariable-Italic.woff2',
    './fonts/InterDisplay-SemiBold.woff2',
    './fonts/InterDisplay-ExtraBoldItalic.woff2',
    './fonts/Inter-ExtraLightItalic.woff2',
    './fonts/InterDisplay-SemiBoldItalic.woff2',
    './fonts/InterDisplay-Light.woff2',
    './fonts/InterDisplay-MediumItalic.woff2',
    './fonts/Inter-SemiBoldItalic.woff2',
    './fonts/Inter-BlackItalic.woff2',
    './src/ffmpeg/core.js',
    './src/ffmpeg/core.wasm',
    './src/ffmpeg/core.worker.js',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
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

                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, response.clone());

                return response;
            } catch (error) {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }
            }
        })()
    );
});
