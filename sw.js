// ═══════════════════════════════════════════════════════════
//  Service Worker — ألعاب الرياضيات | الصف السادس
//  يدعم العمل بدون إنترنت (Offline First)
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'mathgame-v5';
const CACHE_STATIC = 'mathgame-static-v5';
const CACHE_CDN    = 'mathgame-cdn-v5';

// ── الملفات المحلية التي يجب تخزينها دائماً ──
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── مصادر CDN الخارجية ──
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;600;700;900&display=swap',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// ── المسارات التي نتجاوزها دائماً (Firebase) ──
const BYPASS_PATTERNS = [
  'firebaseio.com',
  'firebase.googleapis.com',
  'firebasestorage.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'www.gstatic.com/firebasejs',
  'emailjs.com/api'
];

// ═══════════════════════════════
//  Install — تثبيت وتخزين مسبق
// ═══════════════════════════════
self.addEventListener('install', event => {
  console.log('[SW] Installing v4...');
  event.waitUntil(
    Promise.all([
      // تخزين الملفات المحلية
      caches.open(CACHE_STATIC).then(cache => {
        return cache.addAll(LOCAL_ASSETS).catch(err => {
          console.warn('[SW] Some local assets failed to cache:', err);
        });
      }),
      // تخزين مصادر CDN
      caches.open(CACHE_CDN).then(cache => {
        return Promise.allSettled(
          CDN_ASSETS.map(url =>
            cache.add(url).catch(err =>
              console.warn('[SW] CDN asset failed:', url, err)
            )
          )
        );
      })
    ]).then(() => {
      console.log('[SW] Install complete');
      return self.skipWaiting(); // تفعيل فوري
    })
  );
});

// ═══════════════════════════════
//  Activate — تنظيف الكاشات القديمة
// ═══════════════════════════════
self.addEventListener('activate', event => {
  console.log('[SW] Activating v5...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_CDN && k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ═══════════════════════════════
//  Fetch — استراتيجية الاسترجاع
// ═══════════════════════════════
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 1) تجاوز Firebase وطلبات POST تماماً
  if (
    event.request.method !== 'GET' ||
    BYPASS_PATTERNS.some(p => url.includes(p))
  ) {
    return; // اتركها للمتصفح مباشرة
  }

  // 2) مصادر CDN — Network first, then Cache
  if (
    url.includes('cdn.jsdelivr.net') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com')
  ) {
    event.respondWith(networkFirstCDN(event.request));
    return;
  }

  // 3) صفحات HTML والتنقل — Network first (حتى تظهر التحديثات فوراً)
  if (
    event.request.mode === 'navigate' ||
    url.endsWith('/') ||
    url.endsWith('.html') ||
    url.includes('index.html')
  ) {
    event.respondWith(networkFirstLocal(event.request));
    return;
  }

  // 4) باقي الملفات المحلية (أيقونات، صور) — Cache first
  event.respondWith(cacheFirstLocal(event.request));
});

// ── استراتيجية: Network أولاً للصفحات المحلية (HTML) ──
async function networkFirstLocal(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request)
      || await caches.match('./index.html')
      || await caches.match('./');
    if (cached) return cached;
    return new Response('<h2 style="font-family:sans-serif;text-align:center;padding:40px">⚠️ لا يوجد اتصال بالإنترنت</h2>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// ── استراتيجية: Cache أولاً للملفات المحلية ──
async function cacheFirstLocal(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    // ليست في الكاش — حاول الشبكة وخزّن
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== 'opaque') {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // لا شبكة ولا كاش — أرجع الصفحة الرئيسية إن وجدت
    const fallback = await caches.match('./') || await caches.match('./index.html');
    if (fallback) return fallback;
    return new Response('<h2 style="font-family:sans-serif;text-align:center;padding:40px">⚠️ لا يوجد اتصال بالإنترنت</h2>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// ── استراتيجية: Network أولاً لـ CDN ──
async function networkFirstCDN(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_CDN);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // إرجاع استجابة فارغة لمنع انهيار الصفحة
    return new Response('', { status: 200 });
  }
}

// ═══════════════════════════════
//  Message — استقبال رسائل التحكم
// ═══════════════════════════════
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
