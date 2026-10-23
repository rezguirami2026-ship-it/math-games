// فحص مولّدات جولات مهام العالم للصف السابع (missions/g7/kit.js): يولّد كل مهمة مئات المرات ويتحقق من أن لكل جولة جواباً صالحاً:
// لوحة الأرقام بلا فاصلة تحتاج جواباً صحيحاً، والخيارات بلا تكرار وفيها الجواب، والاختيار المتعدد جزء حقيقي، والترتيب يطابق البطاقات، والمؤشر يبدأ بعيداً عن الجواب ويصل إليه بخطواته.
// الاستعمال: node fuzz-m7.mjs [عدد المرات]
import { chromium } from 'playwright-core';
import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), TY = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/json', '.woff2': 'font/woff2' };
const srv = createServer(async (q, r) => { const p = decodeURIComponent(new URL(q.url, 'http://x').pathname).slice(1) || 'index.html'; try { const b = await readFile(join(ROOT, p)); r.writeHead(200, { 'content-type': TY[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(r => srv.listen(0, r));
const times = +(process.argv[2] || 300);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
await p.goto(`http://localhost:${srv.address().port}/?2d=1&preview=1&grade=7`); await p.waitForTimeout(2500);
const res = await p.evaluate(async times => {
  const files = ['harbor', 'fort', 'festival', 'datayard', 'coop', 'caravan', 'workshop'], bad = {}; let nm = 0;
  const H = v => Math.round(v * 1000);
  for (const f of files) {
    let mods; try { mods = Object.values(await import(`./missions/g7/${f}.js`)).find(v => v && typeof v === 'object' && Object.values(v).some(m => m && m.cfg)); } catch (e) { continue; }
    for (const [id, m] of Object.entries(mods || {})) for (let t = 0; t < times; t++) {
      if (!t) nm++;
      const d = {}; m.begin(d);
      d.rounds.forEach((r, i) => {
        const err = msg => { const k = `${id}#${i} ${msg}`; bad[k] = (bad[k] || 0) + 1; };
        try { d.r = i; d.k = H(r.s ?? 0); d.sel = []; const v = m.cfg.view(r, d); if (!v || !v.text || !v.hint) err('view بلا نص أو تلميح'); if (/NaN|undefined|[0-9]/.test((v.text + (v.visual || '')).replace(/<[^>]+>/g, ''))) err('نص فيه NaN أو أرقام لاتينية'); if (v.bad) v.bad(r.t === 'multi' || r.t === 'order' ? [] : -1); } catch (e) { err('view: ' + e.message); }
        if (r.t === 'kp') { if (!isFinite(r.ans)) err('جواب ليس عدداً'); if (r.dot === false && !Number.isInteger(r.ans)) err('عشري ولوحة بلا فاصلة'); if (r.ans < 0 && !r.neg) err('سالب بلا زر −'); if (Math.abs(H(r.ans) - r.ans * 1000) > 1e-6) err('أكثر من ٣ منازل'); }
        if (r.t === 'pick') { if (new Set(r.opts).size !== r.opts.length) err('خيارات مكررة'); if (!r.opts.includes(r.ans)) err('الجواب ليس في الخيارات'); if (r.opts.length < 2) err('خيار واحد'); }
        if (r.t === 'multi') { if (new Set(r.opts).size !== r.opts.length) err('خيارات مكررة'); if (!r.ok.length || r.ok.length === r.opts.length || r.ok.some(s => !r.opts.includes(s))) err('اختيار متعدد كله/لا شيء'); }
        if (r.t === 'order') { if (new Set(r.items).size !== r.items.length) err('بطاقات مكررة'); if ([...r.items].sort().join() !== [...r.want].sort().join()) err('الترتيب لا يطابق البطاقات'); }
        if (r.t === 'dial') { if (H(r.s) === H(r.ans)) err('المؤشر يبدأ عند الجواب'); if (r.ans < r.lo || r.ans > r.hi) err('الجواب خارج المدى'); const g = Math.min(...r.st.map(H)); if ((H(r.ans) - H(r.s)) % g) err('الجواب لا تصله الخطوات'); }
      });
    }
  }
  return { bad, nm };
}, times);
const keys = Object.keys(res.bad);
console.log(keys.length ? keys.map(k => `${k} ×${res.bad[k]}`).join('\n') : `✅ جولات ${res.nm} مهمة سليمة (${times} توليد لكل مهمة)`);
await b.close(); srv.close();
