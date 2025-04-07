import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

// Intercept fetch events and bypass service worker for API routes
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Check if the request is for an API route
  if (url.pathname.startsWith("/api/")) {
    // Bypass service worker and go directly to network
    event.respondWith(
      fetch(event.request, {
        cache: "no-store", // Ensure no caching for API requests
      })
    )
    return
  }
})
