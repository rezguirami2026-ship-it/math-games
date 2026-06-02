/* ════════════════════════════════════════════════════════════
   Service Worker — نسخة محدّثة تكسر الكاش العنيد
   الاستراتيجية: الشبكة أولاً (network-first) حتى لا تعلق نسخة قديمة أبداً.
   عند كل تحديث: غيّر رقم CACHE_VERSION فقط، وسيُحذف الكاش القديم تلقائياً.
   ════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'mathgame-v8-2026';   // ← غيّر هذا الرقم عند كل تحديث للتطبيق
const CACHE_NAME = CACHE_VERSION;

// 1) التثبيت: فعّل النسخة الجديدة فوراً دون انتظار
self.addEventListener('install', (event) => {
  self.skipWaiting();   // لا تنتظر إغلاق كل النوافذ — فعّل التحديث حالاً
});

// 2) التفعيل: احذف كل النسخ القديمة من الكاش، وسيطر على كل الصفحات فوراً
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);   // امسح أي كاش قديم
          }
        })
      )
    ).then(() => self.clients.claim())   // سيطر على كل التبويبات المفتوحة فوراً
  );
});

// 3) رسالة من الصفحة لتفعيل التحديث فوراً
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4) جلب الموارد: الشبكة أولاً، والكاش احتياطي فقط عند انقطاع الإنترنت
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // تجاهل الطلبات غير GET (مثل POST لـ Firebase)
  if (req.method !== 'GET') return;

  // تجاهل طلبات Firebase والخدمات الخارجية (لا تُخزَّن)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        // نسخة طازجة من الشبكة → خزّنها وأعدها
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, resClone).catch(() => {});
        });
        return networkRes;
      })
      .catch(() => {
        // لا يوجد إنترنت → استخدم النسخة المخزّنة إن وُجدت
        return caches.match(req).then((cached) => {
          return cached || caches.match('./index.html') || caches.match('./');
        });
      })
  );
});
