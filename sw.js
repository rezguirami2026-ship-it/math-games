// ============================================================
// 🔧 Service Worker — ألعاب الرياضيات التفاعلية
// v1.0 — يدعم العمل بدون انترنت
// ============================================================

const CACHE_NAME = 'math-games-v1';
const STATIC_CACHE = 'math-static-v1';
const DYNAMIC_CACHE = 'math-dynamic-v1';

// الملفات الأساسية للتخزين المحلي
const STATIC_ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;600;700;900&display=swap',
];

// ── التثبيت: خزّن الملفات الأساسية ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Failed to cache some static assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── التفعيل: احذف الكاشات القديمة ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── الطلبات: استراتيجية Network-First مع Fallback ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // تجاهل Firebase وطلبات POST والـ APIs الخارجية
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') && url.pathname.includes('/identitytoolkit') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // الخطوط من Google: Cache-First
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(res => {
            cache.put(event.request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // الملف الرئيسي (index.html): Network-First مع Fallback
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          // خزّن آخر نسخة
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, res.clone()));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then(cached => {
            if (cached) return cached;
            // Offline fallback page
            return new Response(offlinePage(), {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          })
        )
    );
    return;
  }

  // باقي الطلبات: Cache-First مع Network update
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(res => {
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, res.clone()));
        return res;
      }).catch(() => null);
      return cached || networkFetch;
    })
  );
});

// ── صفحة Offline ──
function offlinePage() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>غير متصل بالانترنت</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a1a, #1a0a2e);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cairo', 'Tajawal', 'Segoe UI', sans-serif;
    direction: rtl; color: #fff; padding: 20px;
  }
  .card {
    text-align: center; max-width: 340px; padding: 40px 28px;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
    border-radius: 24px;
  }
  .icon { font-size: 64px; margin-bottom: 20px; }
  h1 { font-size: 22px; font-weight: 800; margin-bottom: 10px; }
  p { font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.7; margin-bottom: 24px; }
  button {
    background: linear-gradient(135deg, #6C3CE1, #9B5DE5);
    border: none; border-radius: 14px; padding: 12px 28px;
    color: #fff; font-size: 15px; font-weight: 800;
    font-family: inherit; cursor: pointer;
  }
</style>
</head>
<body>
<div class="card">
  <div class="icon">📡</div>
  <h1>لا يوجد اتصال بالانترنت</h1>
  <p>تأكد من اتصالك بالانترنت وأعِد المحاولة. بعض الميزات تعمل بدون نت بعد أول تحميل.</p>
  <button onclick="location.reload()">🔄 إعادة المحاولة</button>
</div>
</body>
</html>`;
}

// ── إشعارات Push ──
self.addEventListener('push', event => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'إشعار جديد', body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'ألعاب الرياضيات', {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      tag: data.tag || 'default',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
