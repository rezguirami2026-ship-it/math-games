/* عامل خدمة «منصة رامي ماث» القديم في هذا العنوان: المنصة انتقلت إلى https://math-grade6.rezgui-rami2026.workers.dev/
   هذه النسخة تحذف ذاكرة المنصة القديمة فقط (لا تمسّ ذاكرة «قرية الخير» qaryat-alkhair-*)، ثم تلغي نفسها وتعيد فتح الصفحات لتنتقل. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => !k.startsWith('qaryat-alkhair-')).map(k => caches.delete(k)));
  await self.registration.unregister();
  (await self.clients.matchAll({ type: 'window' })).forEach(c => { try { c.navigate(c.url); } catch (err) {} });
})()));
