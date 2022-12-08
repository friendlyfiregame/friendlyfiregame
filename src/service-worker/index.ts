import { Cache } from "./Cache";

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope;

// We need an export to force this file to act like a module, so TS will let us re-type `self`
export default null;

const cache: Cache = new Cache();

self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("activate", (event) => {
    event.waitUntil(cache.open());
});

self.addEventListener("install", (event) => {
    event.waitUntil(
      cache.add(
        "/",
        "/index.html",
        "/style.css",
        "/assets/favicon.ico",
        "/manifest.webmanifest"
      )
    );
  });
