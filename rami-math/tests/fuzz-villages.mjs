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
  const fcands = (() => { const fc = []; for (let w = 0; w <= 60; w++) { fc.push({ w, n: 0, d: 1 }); for (let d = 2; d <= 60; d++) for (let n = 1; n < d; n++) fc.push({ w, n, d }); } return fc; })();   // أجوبة لوحة الكسر: عدد صحيح وكسر فعلي
  const cands = (() => { const c = new Set(); for (let v = -2000; v <= 2000; v++) [1, 10, 100, 1000, 10000].forEach(d => c.add(v / d)); for (let v = 1; v <= 100; v++) [100, 1000, 10000].forEach(m => { c.add(v * m); c.add(-v * m); }); for (let v = 2001; v <= 20000; v++) c.add(v / 100); return [...c]; })();   // وأعداد بمنزلتين حتى ٢٠٠   // أجوبة محتملة: صحيحة وعشرية حتى ٤ منازل وكبيرة
  for (const id of Object.keys(def.lessons)) {
    const m = await def.lessons[id](), probs = new Map(), add = k => probs.set(k, (probs.get(k) || 0) + 1);
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < (m.ROUNDS || 5); i++) {
        let r; try { r = m.make(i); } catch (e) { add(`جولة ${i + 1}: خطأ ${e.message}`); continue; }
        if (!r || !r.q || typeof r.ok !== 'function' || !r.hint) { add(`جولة ${i + 1}: ناقصة`); continue; }
        if (/[0-9]/.test(plain(r.q) + plain(r.hint))) add(`جولة ${i + 1}: رقم لاتيني`);
        const I = r.input; let found = false;
        if (I.type === 'pick') { found = I.opts.some((_, j) => r.ok(j)); if (new Set(I.opts).size !== I.opts.length) add(`جولة ${i + 1}: خيارات مكررة`); }
        else if (I.type === 'dial') for (let v = I.min ?? -20; v <= (I.max ?? 20) && !found; v += I.step || 1) found = r.ok(Math.round(v * 1000) / 1000);
        else if (I.type === 'blanks') { found = Array.isArray(r.sol) && r.ok(r.sol); if (found && r.ok(r.sol.map((v, j) => j ? v : v + 1))) add(`جولة ${i + 1}: جواب خاطئ مقبول`); if (found && !I.neg && r.sol.some(v => v < 0)) add(`جولة ${i + 1}: فراغ سالب بلا إشارة`); if ((I.tpl.match(/\{\}/g) || []).length !== (r.sol || []).length) add(`جولة ${i + 1}: عدد الفراغات لا يطابق الحل`); }
        else if (I.type === 'grid') { const { x0 = -5, x1 = 5, y0 = -5, y1 = 5, n = 1 } = I; found = Array.isArray(r.sol) && r.sol.length === n && r.ok(r.sol); if (found && r.sol.some(([x, y]) => x < x0 || x > x1 || y < y0 || y > y1 || x % 1 || y % 1)) add(`جولة ${i + 1}: نقطة الحل خارج الشبكة`); if (found && r.ok(r.sol.map(([x, y]) => [x + 1, y]))) add(`جولة ${i + 1}: الشبكة تقبل جواباً خاطئاً`); }
        else if (I.type === 'steps') { found = Array.isArray(r.sol) && r.sol.length === I.steps.length && r.ok(r.sol) && I.steps.every((st, j) => st.ok === r.sol[j] && new Set(st.opts).size === st.opts.length && st.opts.length > 1); if (/[0-9]/.test(plain(I.steps.map(st => st.eq + st.opts.join(' ')).join(' ') + I.final))) add(`جولة ${i + 1}: رقم لاتيني في الخطوات`); }
        else if (I.type === 'ray') { found = !!r.sol && r.ok(r.sol); if (found && (r.ok({ ...r.sol, closed: !r.sol.closed }) || r.ok({ ...r.sol, right: !r.sol.right }) || r.ok({ ...r.sol, v: r.sol.v + (I.step || 1) }))) add(`جولة ${i + 1}: الشعاع يقبل جواباً خاطئاً`); if (found && (r.sol.v < (I.min ?? -20) || r.sol.v > (I.max ?? 20))) add(`جولة ${i + 1}: الطرف خارج الخط`); }
        else if (I.type === 'mix') { found = Array.isArray(r.sol) && r.sol.length === I.parts.length && r.ok(r.sol); if (found && r.ok(r.sol.map(v => v * 2))) add(`جولة ${i + 1}: الخلط يقبل نسبة غير مبسطة`); if ((r.sol || []).some(v => v < (I.min ?? 1) || v > (I.max || 20))) add(`جولة ${i + 1}: حل الخلط خارج الحدود`); }
        else if (I.type === 'chips') { found = Array.isArray(r.sol) && r.sol.length > 0 && r.ok(r.sol); if (found && r.ok([...r.sol, I.chips[I.chips.length - 1]])) add(`جولة ${i + 1}: القطع تقبل جواباً زائداً`); if ((r.sol || []).some(v => !I.chips.includes(Math.abs(v)))) add(`جولة ${i + 1}: حل بقطعة غير موجودة`); if ((r.sol || []).length > (I.max || 10)) add(`جولة ${i + 1}: الحل أطول من الحد`); }
        else if (I.type === 'cells') { found = Array.isArray(r.sol) && r.sol.length > 0 && r.ok(r.sol); if (found && (r.ok(r.sol.slice(1)) || r.ok([...r.sol, -1]))) add(`جولة ${i + 1}: جدول النتائج يقبل جواباً ناقصاً`); const n = I.rows.length * I.cols.length; if ((r.sol || []).some(k => k < 0 || k >= n || (I.off && I.off(Math.floor(k / I.cols.length), k % I.cols.length)))) add(`جولة ${i + 1}: حل الجدول خارج خلاياه`); }
        else if (I.type === 'frac') { const a = r.sol && r.ok(r.sol) ? r.sol : fcands.find(v => r.ok(v)); found = !!a; if (a && a.w && !I.mixed) add(`جولة ${i + 1}: الجواب عدد كسري ولوحة الكسر بلا عدد صحيح`); if (a && !a.w && a.n === 0) add(`جولة ${i + 1}: جواب لوحة الكسر صفر`); }
        else found = (r.sol != null && r.ok(r.sol)) || cands.some(v => r.ok(v));
        if (!found) add(`جولة ${i + 1}: لا جواب صحيح ممكن`);
        if (I.type === 'num' && found) { const a = r.sol != null && r.ok(r.sol) ? r.sol : cands.find(v => r.ok(v)); if (a < 0 && !I.neg) add(`جولة ${i + 1}: الجواب سالب واللوحة بلا إشارة سالبة`); if (a % 1 && !I.dot) add(`جولة ${i + 1}: الجواب عشري واللوحة بلا فاصلة`); if (String(Math.abs(a)).replace('.', '').length > 7) add(`جولة ${i + 1}: الجواب أطول من سبعة أرقام`); }
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
