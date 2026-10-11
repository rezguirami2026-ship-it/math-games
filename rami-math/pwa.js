/* تطبيق يُثبَّت ويعمل بلا إنترنت (sw.js). لا يُسجَّل على الجهاز المحلي حتى لا يحفظ نسخاً قديمة أثناء التطوير والاختبار */
if ('serviceWorker' in navigator && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
  // التحديث: يُفحص عند الفتح، وعند العودة إلى التطبيق (الهاتف لا يعيد فتحه بل يستأنفه)، وكل ٢٠ دقيقة.
  // النسخة الجديدة تُنزَّل كاملة في الخلفية، ثم تُفعَّل في لحظة فراغ ويُعاد التحميل مرة واحدة.
  const had = !!navigator.serviceWorker.controller; let reloaded = false, reg = null, waitT = 0;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; location.reload(); } });
  const free = () => !document.querySelector('#panel.on, #dialog.on, .adv, .advUnlock, .opsModal.on');
  const apply = () => { if (!reg || !reg.waiting) return; clearInterval(waitT); waitT = setInterval(() => { if (reg.waiting && (free() || document.visibilityState === 'hidden')) { clearInterval(waitT); reg.waiting.postMessage('skip'); } }, 1500); };
  const check = () => { if (reg && navigator.onLine) reg.update().then(apply).catch(() => {}); };
  addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => {
    reg = r; apply(); check();
    r.addEventListener('updatefound', () => { const w = r.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) apply(); }); });
  }).catch(() => {}));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  addEventListener('online', check); setInterval(check, 20 * 60e3);
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__install = e; });
