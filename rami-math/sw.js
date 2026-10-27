// العنوان القديم للعبة «قرية الخير»: يحل محل عامل الخدمة القديم ويحذف ذاكرته (لا يمسّ حفظ الطالب). بلا معالج fetch،
// فكل فتح بعده يذهب إلى الشبكة وتنقله صفحة التحويل مع تقدّمه. (إلغاء التسجيل أثناء إعادة التحميل أوقع المتصفح في الاختبار)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('qaryat-alkhair-')).map(k => caches.delete(k))))));
