// تقدير الحمل والتكلفة: محاكاة يوم كامل لـ ٥٬٠٠٠ / ١٠٬٠٠٠ / ٥٠٬٠٠٠ مستخدم على كود الخادم الحقيقي (server/worker.js) وقاعدة SQLite محلية،
// بقواعد الإرسال نفسها في core/ops.js: دفعة لكل جلسة (حد ١٠ دقائق بين دفعتين، ٥٠ حدثاً للدفعة)، والإعدادات داخل رد الدفعة.
// node ops-load.mjs [نسبة النشطين يومياً، افتراضي 0.3]
import { loadWorker, makeDB, stats } from './ops-server.mjs';
const W = await loadWorker(), DAU = +process.argv[2] || .3;
const FREE = { req: 100000, write: 100000, read: 5000000 };   // حدود Cloudflare المجانية اليومية (Workers + D1)
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const hex = n => Array.from({ length: n }, () => '0123456789ABCDEF'[Math.floor(rnd() * 16)]).join('');
const poisson = m => { let k = 0, p = Math.exp(-m), s = p, u = rnd(); while (u > s) { k++; p *= m / k; s += p; } return k; };
const rows = [];
for (const N of [5000, 10000, 50000]) {
  const env = { DB: makeDB(), ADMIN_TOKEN: 'x' }; stats.req = {}; stats.written = 0; stats.read = 0;
  let req = 0, bytes = 0; const t0 = Date.now(), now = Math.floor(Date.now() / 1000);
  for (let u = 0; u < N; u++) {
    if (rnd() > DAU) continue;
    const uid = 'USER-' + hex(8), isNew = rnd() < .05, sessions = Math.max(1, poisson(1.5));
    for (let s = 0; s < sessions; s++) {
      const ev = [];
      if (isNew && s === 0) ev.push(['first_launch', now]);
      ev.push(['app_open', now], ['session_start', now]);
      for (let i = poisson(1.5); i > 0; i--) ev.push(['level_completed', now, 'lesson' + i]);
      if (rnd() < .05) ev.push(['adventure_started', now, 'unit1'], ['adventure_completed', now, 'unit1']);
      const err = rnd() < .02 ? [{ id: 'ERR-' + hex(6), t: 'TypeError', m: 'x is undefined', c: 1, d: '' }] : [];
      const tk = rnd() < .002 ? [{ id: 'T-' + hex(6), type: 'bug', desc: 'وصف قصير للمشكلة', d: new Date().toISOString() }] : [];
      if (err.length) ev.push(['error_occurred', now]); if (tk.length) ev.push(['support_ticket', now]);
      for (let i = 0; i < ev.length; i += 50) {   // دفعة واحدة لكل جلسة عادةً
        const body = JSON.stringify({ b: 'B' + hex(10), uid, v: '1.0.0', os: rnd() < .7 ? 'Android' : 'Windows', dev: rnd() < .7 ? 'phone' : 'desktop', app: 'web', ev: ev.slice(i, i + 50), err: i ? [] : err, tk: i ? [] : tk });
        bytes += body.length; req++;
        const r = await W.fetch(new Request('https://x/v1/batch', { method: 'POST', body }), env); if (!r.ok) throw new Error('batch ' + r.status);
      }
    }
  }
  const pages = env.DB.raw.prepare('PRAGMA page_count').get().page_count, size = pages * 4096;
  rows.push({ N, active: Math.round(N * DAU), req, perActive: (req / (N * DAU)).toFixed(2), written: stats.written, read: stats.read, kb: Math.round(bytes / 1024), dbMB: (size / 1048576).toFixed(1), ms: Date.now() - t0 });
}
const pct = (v, l) => Math.round(v / l * 100) + '%';
console.log(`النشطون يومياً ${Math.round(DAU * 100)}% — الحدود المجانية اليومية: ${FREE.req} طلب، ${FREE.write} صف مكتوب، ${FREE.read} صف مقروء`);
console.table(rows.map(r => ({ 'المستخدمون': r.N, 'النشطون': r.active, 'طلبات/يوم': r.req, 'طلب لكل نشط': r.perActive, '% من حد الطلبات': pct(r.req, FREE.req), 'صفوف مكتوبة': r.written, '% من حد الكتابة': pct(r.written, FREE.write), 'صفوف مقروءة': r.read, 'بيانات مرسلة KB': r.kb, 'حجم القاعدة بعد يوم MB': r.dbMB })));
