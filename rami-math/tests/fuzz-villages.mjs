// فحص مهام القرى (الصفان ٨ و٩): يولّد جولات كل مهمة وأسئلة تحديها مئات المرات ويبحث عن: خطأ في التوليد، جولة بلا جواب صحيح،
// خيارات مكررة، أرقام لاتينية في النص، وجواب رقمي غير محدد. node fuzz-villages.mjs <الصف> <القرية> [عدد] (الخادم على 8000)
import { chromium } from 'playwright-core';
const [G = '8', V = 'mine', NUM = '300'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.addInitScript(g => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', g); }, G);
await p.goto(`http://localhost:8000/?grade=${G}`); await p.waitForTimeout(1500);
const out = await p.evaluate(async ({ G, V, n }) => {
  const def = (await import(`/villages/g${G}/${V}/index.js`)).default, report = [];
  const plain = h => String(h).replace(/<[^>]+>/g, ' ');
  for (const id of Object.keys(def.lessons)) {
    const m = await def.lessons[id](), probs = new Map(), add = k => probs.set(k, (probs.get(k) || 0) + 1);
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < 5; i++) {
        let r; try { r = m.make(i); } catch (e) { add(`جولة ${i + 1}: خطأ ${e.message}`); continue; }
        if (!r || !r.q || typeof r.ok !== 'function' || !r.hint) { add(`جولة ${i + 1}: ناقصة`); continue; }
        if (/[0-9]/.test(plain(r.q) + plain(r.hint))) add(`جولة ${i + 1}: رقم لاتيني`);
        const I = r.input; let found = false;
        if (I.type === 'pick') { found = I.opts.some((_, j) => r.ok(j)); if (new Set(I.opts).size !== I.opts.length) add(`جولة ${i + 1}: خيارات مكررة`); }
        else if (I.type === 'dial') for (let v = I.min ?? -20; v <= (I.max ?? 20) && !found; v += I.step || 1) found = r.ok(Math.round(v * 1000) / 1000);
        else for (let v = -2000; v <= 2000 && !found; v++) found = r.ok(v / 10);   // لوحة الأرقام: نبحث بمنزلة عشرية واحدة
        if (!found) add(`جولة ${i + 1}: لا جواب صحيح ممكن`);
        if (I.type === 'num' && !I.neg) { let negOnly = true; for (let v = 0; v <= 20000 && negOnly; v++) if (r.ok(v / 10)) negOnly = false; if (negOnly) add(`جولة ${i + 1}: الجواب سالب واللوحة بلا إشارة سالبة`); }
        if (I.type === 'num' && !I.dot) { let ok = false; for (let v = -2000; v <= 2000 && !ok; v++) ok = r.ok(v); if (!ok) add(`جولة ${i + 1}: الجواب عشري واللوحة بلا فاصلة`); }
      }
      let items; try { items = m.challenge(); } catch (e) { add('التحدي: خطأ ' + e.message); continue; }
      if (items.length < 8) add('التحدي: أقل من ٨ أسئلة');
      items.forEach(it => {
        if (/[0-9]/.test(plain(it.q) + plain(it.hint) + plain((it.opts || []).join(' ')))) add(`تحدي (${it.type}): رقم لاتيني «${plain(it.q).slice(0, 40)}»`);
        if (it.opts && new Set(it.opts).size !== it.opts.length) add(`تحدي (${it.type}): خيارات مكررة «${plain(it.q).slice(0, 40)}»`);
        if (it.type === 'num' && !Number.isFinite(it.ans)) add('تحدي: جواب غير محدد');
        if (it.type === 'num' && it.ans < 0 && !it.neg) add(`تحدي: جواب سالب بلا إشارة «${plain(it.q).slice(0, 40)}»`);
        if (!it.hint || !it.out) add(`تحدي (${it.type}): بلا تلميح أو مخرج`);
      });
    }
    report.push(`${id}: ${probs.size ? [...probs].map(([k, v]) => `\n   ⚠️ ${k} ×${v}`).join('') : '✅ سليم'}`);
  }
  return report;
}, { G, V, n: +NUM });
console.log(out.join('\n')); if (errs.length) console.log('أخطاء الصفحة:', errs.slice(0, 5).join('\n'));
await b.close();
