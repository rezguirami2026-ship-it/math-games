/* ════════════════════════════════════════════════════════════
   Service Worker — نسخة "العمل بدون إنترنت" الكاملة
   الاستراتيجية:
   • صفحات HTML: الشبكة أولاً → الكاش عند انقطاع النت (تحديثات فورية + عمل أوفلاين)
   • الموارد الثابتة (سكربتات، خطوط، صور، أصوات): الكاش أولاً مع تحديث بالخلفية
   • طلبات Firebase Database والـ APIs الحية: لا تُعترض إطلاقاً
   عند كل تحديث: غيّر رقم CACHE_VERSION فقط، وسيُحذف الكاش القديم تلقائياً.
   ════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'mathgame-v251-auth-status';   // ← غيّر هذا الرقم عند كل تحديث للتطبيق
const CACHE_NAME = CACHE_VERSION;

/* ── الملفات الأساسية التي تُخزَّن مسبقاً عند التثبيت ── */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './questions.js',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './games-map.html',
  // مكتبات خارجية أساسية
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js',
  // وحدات Firebase
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  // الخطوط
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;600;700;900&display=swap',
  // الشعار والصور الأساسية
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663626643434/OqiidltQfDfBhFXL.jpeg',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663627671543/qZXAaxJzGyVqPDeG.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663627671543/xcarsKDfWPptGNLU.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663627671543/amPLgXcDpGlxfkIJ.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663627671543/jFEFJGmjpurThCna.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663627671543/wUuXzsykXLpLhDUD.png',
  // الأصوات
  'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'
];

/* ── نطاقات حيّة لا تُخزَّن (بيانات لحظية) ── */
const LIVE_HOSTS = [
  'firebaseio.com',           // قاعدة بيانات Firebase اللحظية
  'identitytoolkit',          // مصادقة Firebase
  'securetoken',
  'firebasestorage',          // رفع الملفات
  'api.anthropic.com',
  'api.emailjs.com',
  'google-analytics.com',
  'googletagmanager.com'
];

/* 1) التثبيت: خزّن الملفات الأساسية (كل ملف على حدة حتى لا يفشل التثبيت كله بسبب ملف واحد) */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map((url) => {
          const req = url.startsWith('http')
            ? new Request(url, { mode: 'no-cors' })
            : url;
          return cache.add(req).catch(() => {});
        })
      )
    ).then(() => self.skipWaiting())
  );
});

/* 2) التفعيل: احذف كل النسخ القديمة من الكاش، وسيطر على كل الصفحات فوراً */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null))
    ).then(() => self.clients.claim())
  );
});

/* 3) رسالة من الصفحة لتفعيل التحديث فوراً */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ── أدوات مساعدة ── */
function isLiveRequest(url) {
  return LIVE_HOSTS.some((h) => url.hostname.includes(h));
}

/* الشبكة أولاً (للصفحات) */
function networkFirst(req) {
  return fetch(req)
    .then((res) => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(req, clone).catch(() => {}));
      return res;
    })
    .catch(() =>
      caches.match(req)
        .then((r) => r || caches.match('./index.html'))
        .then((r) => r || caches.match('./'))
    );
}

/* الكاش أولاً مع تحديث بالخلفية (للموارد الثابتة) */
function cacheFirst(req) {
  return caches.match(req).then((cached) => {
    const fetchAndUpdate = fetch(req)
      .then((res) => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone).catch(() => {}));
        }
        return res;
      })
      .catch(() => cached); // لا نت → اكتفِ بالنسخة المخزّنة
    return cached || fetchAndUpdate;
  });
}

/* 4) اعتراض الطلبات */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // تجاهل الطلبات غير GET (مثل POST لـ Firebase)
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // لا تعترض البيانات اللحظية (Firebase DB، المصادقة، التحليلات...)
  if (isLiveRequest(url)) return;

  // صفحات HTML (التنقل): الشبكة أولاً ثم الكاش
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // كل الموارد الأخرى (سكربتات، خطوط، صور، أصوات، CSS): الكاش أولاً
  event.respondWith(cacheFirst(req));
});
