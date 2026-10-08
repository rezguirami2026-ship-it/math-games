// فحص مولّدات «تحدي الشخصية»: يولّد كل تحدٍّ مئات المرات ويبحث عن أخطاء المحتوى.
// الاستعمال (يشغّل خادماً مؤقتاً بنفسه): node fuzz-ch.mjs 4 [عدد المرات]   ← يفحص content/challenges4.js
import { chromium } from 'playwright-core';
import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), TY = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/json', '.woff2': 'font/woff2' };
const srv = createServer(async (q, r) => { const p = decodeURIComponent(new URL(q.url, 'http://x').pathname).slice(1) || 'index.html'; try { const b = await readFile(join(ROOT, p)); r.writeHead(200, { 'content-type': TY[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(r => srv.listen(0, r));
const unit = process.argv[2] || '1', times = +(process.argv[3] || 400);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(`http://localhost:${srv.address().port}/?2d=1&preview=1`); await p.waitForTimeout(2500);
const r = await p.evaluate(async ([unit, times]) => {
  const { CH } = await import(`./content/challenges${unit}.js?` + Date.now()), { OUT } = await import('./content/outcomes.js'); const ex = {}, cnt = {};
  const nums = s => (s.replace(/<[^>]+>/g, ' ').match(/[٠-٩]+(?:٫[٠-٩]+)?/g) || []);
  for (const [id, c] of Object.entries(CH)) for (let t = 0; t < times; t++) {
    let items; try { items = c.make(); } catch (e) { const k = id + ' THROW'; ex[k] = e.message + ' ' + (e.stack || '').split('\n')[1]; cnt[k] = (cnt[k] || 0) + 1; continue; }
    if (items.length < 8 || items.length > 9) { ex[id + ' len'] = items.length; cnt[id + ' len'] = 1; }
    const seen = new Map();
    items.forEach((it, k) => {
      const all = [it.q, ...(it.opts || []), ...(it.left || []), ...(it.right || []), ...(it.bins || [])].join(' ').replace(/<[^>]+>/g, '');
      const bad = m => { const key = `${id}#${k} ${m}`; ex[key] = all.slice(0, 160); cnt[key] = (cnt[key] || 0) + 1; };
      if (!OUT[it.out]) bad('مخرج مجهول ' + it.out);
      if (/NaN|undefined|Infinity|٬|[0-9]/.test(all + (it.art || '').replace(/<[^>]+>/g, ''))) bad('نص: NaN أو فاصلة آلاف أو أرقام لاتينية');
      if (/NaN|undefined/.test((it.art || '') + (it.opts || []).join(''))) bad('رسم فيه NaN');
      { const raw = [it.q, ...(it.opts || []), ...(it.left || []), ...(it.right || []), ...(it.bins || [])].join(' ').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<span class="ltr"[^>]*>[\s\S]*?<\/span>/g, '').replace(/<[^>]+>/g, '');   // الرسوم SVG وعناصر .ltr اتجاهها من اليسار أصلاً
        if (/(?<!⁦)[-−][٠-٩]/.test(raw)) bad('سالب بلا عزل اتجاه (يظهر ٣- بدل −٣)'); }
      const o = it.opts || it.left; if (o && new Set(o).size !== o.length) bad('خيارات مكررة');
      if (it.right && new Set(it.right).size !== it.right.length) bad('وصل مكرر');
      if (it.left && it.left.length < 3) bad('وصل قليل');
      if (it.type === 'choice' && (it.opts.length < 3 || !(it.ans >= 0))) bad('خيارات قليلة ' + it.opts.length);
      if (it.type === 'multi' && (!it.ans.length || it.ans.length === it.opts.length)) bad('اختيار متعدد كله/لا شيء');
      if (it.type === 'sort' && (new Set(it.ans).size < 2 || it.opts.length < 4)) bad('تصنيف ضعيف');
      if ((it.type === 'order' || it.type === 'build') && (it.opts.length < 3 || it.ans.some(a => a < 0))) bad('ترتيب');
      if (it.type === 'num' && !isFinite(it.ans)) bad('إجابة ليست عدداً');
      if (it.type === 'num' && it.ans < 0 && !it.neg) bad('إجابة سالبة بلا زر −');
      if (it.type === 'num' && Math.round(it.ans * 1000) !== it.ans * 1000 && Math.abs(Math.round(it.ans * 1000) - it.ans * 1000) > 1e-6) bad('أكثر من ٣ منازل');
      nums(it.q).filter(x => x.length >= 3 && !['١٠٠', '١٠٠٠'].includes(x)).forEach(x => { if (seen.has(x) && seen.get(x) !== k) bad('عدد مكرر ' + x); seen.set(x, k); });
    });
  }
  return { cnt, ex };
}, [unit, times]);
const keys = Object.keys(r.cnt);
console.log(keys.length ? keys.map(k => `${k} ×${r.cnt[k]}: ${r.ex[k]}`).join('\n') : `✅ لا مشكلات في ${times} توليد لكل تحدٍّ`);
if (errs.length) console.log('أخطاء الصفحة:', errs);
await b.close(); srv.close();
