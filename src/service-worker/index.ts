import { Cache } from "./Cache";

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope;

// We need an export to force this file to act like a module, so TS will let us re-type `self`
export default null;

const cache: Cache = new Cache();

self.addEventListener("message", async (event) => {
    if (event.data === "SKIP_WAITING") {
        await self.skipWaiting();
    }
});

self.addEventListener("install", (event) => {
    event.waitUntil(
        Promise.all(
            [
                cache.putAll([
                    "/",
                    "/?utm_source=web_app_manifest",
                    "/index.html",
                    "/index.html?utm_source=web_app_manifest",
                    "/style.css",
                    "/manifest.webmanifest"
                ]),
                cache.putAll([
                    "/assets/favicon.ico",
                    "/assets/appicon.iconset/icon_16x16.png",
                    "/assets/appicon.iconset/icon_16x16@2x.png",
                    "/assets/appicon.iconset/icon_32x32.png",
                    "/assets/appicon.iconset/icon_32x32@2x.png",
                    "/assets/appicon.iconset/icon_48x48.png",
                    "/assets/appicon.iconset/icon_64x64.png",
                    "/assets/appicon.iconset/icon_72x72.png",
                    "/assets/appicon.iconset/icon_96x96.png",
                    "/assets/appicon.iconset/icon_128x128.png",
                    "/assets/appicon.iconset/icon_128x128@2x.png",
                    "/assets/appicon.iconset/icon_144x144.png",
                    "/assets/appicon.iconset/icon_168x168.png",
                    "/assets/appicon.iconset/icon_192x192.png",
                    "/assets/appicon.iconset/icon_256x256.png",
                    "/assets/appicon.iconset/icon_256x256@2x.png",
                    "/assets/appicon.iconset/icon_512x512.png",
                    "/assets/appicon.iconset/icon_512x512@2x.png",
                    "/assets/appicon.iconset/icon_1024x1024.png"
                ])
            ]
        )
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map((name) => {
                    if (name !== cache.name) {
                        return caches.delete(name);
                    }
                    return Promise.resolve(false);
                })
            );
            await self.clients.claim();
        })()
    );
});

/**
 * Regex pattern to identify resources which should never be cached.
 */
const IGNORE_URL_PATTERN = /^(?<prefix>.+)\.(?<hot_update_marker>hot-update)\.(?<suffix>.+)$/;

/**
 * Strategy: Network-first for navigation requests and HTML/JS bundle files so updates are immediately noticed.
 * Strategy: Cache-first for images, audio, and static asset files.
 */
async function fetchAndCache(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Skip cross-origin requests and hot updates
    if (!request.url.startsWith(self.location.origin) || request.url.match(IGNORE_URL_PATTERN) != null) {
        return fetch(request);
    }

    const isAppShellRequest =
        request.mode === "navigate" ||
        url.pathname.endsWith(".html") ||
        url.pathname.endsWith(".js") ||
        url.pathname.endsWith(".css") ||
        url.pathname.endsWith(".webmanifest");

    if (isAppShellRequest) {
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        } catch {
            const cachedResponse = await caches.match(request);
            if (cachedResponse !== undefined) {
                return cachedResponse;
            }
            throw new Error("Network request failed and no cached response available.");
        }
    } else {
        let response = await caches.match(request);
        if (response === undefined) {
            response = await fetch(request);
            if (response.ok) {
                await cache.put(request, response.clone());
            }
        }
        return response;
    }
}

self.addEventListener("fetch", (event) => {
    event.respondWith(fetchAndCache(event.request));
});
