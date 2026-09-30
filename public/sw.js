const CACHE_STATIC_NAME = 'c2c-static-v1'
const CACHE_RUNTIME_NAME = 'c2c-runtime-v1'
const CACHE_API_NAME = 'c2c-api-v1'

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/altus-logo.png',
  '/image.png',
]

// 1. O'rnatish bosqichi (Pre-cache static app shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err)
      })
    })
  )
  self.skipWaiting()
})

// 2. Faollashuv bosqichi (Eski keshlarni tozalash)
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_STATIC_NAME, CACHE_RUNTIME_NAME, CACHE_API_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// 3. So'rovlarni tutish va oflayn rejim strategiyalari
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Faqat GET so'rovlari va http/https sxemasini keshlaymiz
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return
  }

  // A. Backend API so'rovlari (/api/) -> Network-first, oflaynda keshdan olish
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_API_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Tarmoq bo'lmasa keshdagi oxirgi ma'lumotni qaytarish
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            return new Response(
              JSON.stringify({
                success: false,
                offline: true,
                message: 'Oflayn rejimdasiz. Maʼlumotlar keshda topilmadi.',
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503,
              }
            )
          })
        })
    )
    return
  }

  // B. Navigatsiya (HTML sahifasi) -> Network-first, oflaynda keshdagi index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_STATIC_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          return caches.match('/index.html').then((indexCached) => {
            return indexCached || caches.match('/')
          })
        })
    )
    return
  }

  // C. Statik resurslar (JS, CSS, Rasmlar, Shriftlar) -> Cache-first bilan fon yangilash
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fondan yangilash (Stale-While-Revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_RUNTIME_NAME).then((cache) => {
                cache.put(request, networkResponse)
              })
            }
          })
          .catch(() => {
            // Offline - no action needed, cachedResponse already served
          })
        return cachedResponse
      }

      // Keshda bo'lmasa tarmoqdan olish va saqlash
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_RUNTIME_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return networkResponse
      })
    })
  )
})
