// العنوان القديم للعبة: يزيل التطبيق المثبّت سابقاً هنا وما حفظه، فينتقل الطالب إلى العنوان الجديد ../../rami-math/
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  const ks = await caches.keys(); await Promise.all(ks.filter(k => k.startsWith('qaryat-alkhair-')).map(k => caches.delete(k)));
  await self.registration.unregister();
  (await self.clients.matchAll({ type: 'window' })).forEach(c => c.navigate('../../rami-math/' + new URL(c.url).search));
})()));
