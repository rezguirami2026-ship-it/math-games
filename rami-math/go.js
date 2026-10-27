/* العنوان القديم للعبة «قرية الخير»: اللعبة انتقلت إلى https://qaryat-alkhair.rezgui-rami2026.workers.dev/
   تنقل حفظ الطالب على هذا الجهاز (مفاتيح ramimath_* فقط) إلى العنوان الجديد داخل جزء الرابط بعد # (لا يُرسل لأي خادم)،
   فتستقبله صفحة move/ هناك وتكتبه ثم تفتح اللعبة. وتزيل التطبيق المثبّت القديم هنا وما حفظه. */
(async function () {
  var NEW = 'https://qaryat-alkhair.rezgui-rami2026.workers.dev/', SKIP = /(_bak|^ramimath_village_preview|^ramimath_ops_url)$/;
  try { var regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.filter(function (r) { return /\/rami-math\/$/.test(r.scope); }).map(function (r) { return r.unregister(); })); } catch (e) {}
  try { var ks = await caches.keys(); await Promise.all(ks.filter(function (k) { return k.indexOf('qaryat-alkhair-') === 0; }).map(function (k) { return caches.delete(k); })); } catch (e) {}
  var url = NEW + location.search;
  try {
    var o = {}, n = 0; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (/^ramimath_/.test(k) && !SKIP.test(k)) { o[k] = localStorage.getItem(k); n++; } }
    if (n) {
      var bytes = new TextEncoder().encode(JSON.stringify(o)), kind = 'p';
      if (typeof CompressionStream !== 'undefined') { bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()); kind = 'z'; }
      var s = ''; for (var j = 0; j < bytes.length; j += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(j, j + 0x8000));
      var b64 = btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      if (b64.length < 1500000) url = NEW + 'move/' + location.search + '#mv=' + kind + b64;
    }
  } catch (e) {}
  location.replace(url);
})();
