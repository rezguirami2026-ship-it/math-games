// مراجعة لغة الأسئلة: يولّد كل تحدٍّ مئات المرات ويجمع كل «عدد + معدود» (مثل «٢ أكواب») مصنّفة حسب العدد،
// مع أخطاء الصياغة الآلية: كلمة مكررة، مسافة قبل علامة ترقيم، مسافتان، أقواس «» غير متوازنة، نص فارغ.
// الاستعمال: node fuzz-lang.mjs 5,6,7,8,9 [عدد المرات] > تقرير.txt
import { chromium } from 'playwright-core';
import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), TY = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/json', '.woff2': 'font/woff2' };
const srv = createServer(async (q, r) => { const p = decodeURIComponent(new URL(q.url, 'http://x').pathname).slice(1) || 'index.html'; try { const b = await readFile(join(ROOT, p)); r.writeHead(200, { 'content-type': TY[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(r => srv.listen(0, r));
const units = (process.argv[2] || '5,6,7,8,9').split(','), times = +(process.argv[3] || 150);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
await p.goto(`http://localhost:${srv.address().port}/?2d=1&preview=1`); await p.waitForTimeout(2500);
const R = await p.evaluate(async ([units, times]) => {
  const pairs = {}, flags = {};
  const D = '٠١٢٣٤٥٦٧٨٩', val = s => +s.replace(/[٠-٩]/g, d => D.indexOf(d)).replace('٫', '.');
  const cls = v => v !== Math.floor(v) ? 'عشري' : v === 1 ? '١' : v === 2 ? '٢' : v <= 10 ? '٣–١٠' : v % 100 >= 11 && v % 100 <= 99 ? '١١–٩٩ (منصوب مفرد)' : 'مئة فأكثر (مفرد مجرور)';
  const clean = s => String(s || '').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<canvas[\s\S]*?<\/canvas>/g, ' ').replace(/<(br|p|div|li)[^>]*>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/[⁦-⁩‎‏]/g, '');
  for (const u of units) {
    const { CH } = await import(`./content/challenges${u}.js?` + Date.now());
    const { fixItem } = await import('./content/arabicCount.js');
    for (const [id, c] of Object.entries(CH)) for (let t = 0; t < times; t++) {
      let items; try { items = c.make(); } catch (e) { flags[`${id} THROW ${e.message}`] = 1; continue; }
      items.forEach(it0 => { const it = fixItem(it0);   // النص كما يراه الطالب
        const texts = [it.q, it.hint, it.why, it.tail, ...(it.opts || []), ...(it.left || []), ...(it.right || []), ...(it.bins || []), ...(it.steps || [])].map(clean).filter(Boolean);
        for (const s of texts) {
          const flag = m => { const k = `${id}: ${m}`; if (!flags[k]) flags[k] = s.trim().slice(0, 150); };
          if (/(^|\s)(\S{2,})\s+\2(\s|$)/.test(s) && !/(\S+)\s+\1\s+\1/.test(s)) { const m = s.match(/(^|\s)(\S{2,})\s+\2(\s|$)/); if (!/^[٠-٩٫]+$/.test(m[2])) flag('كلمة مكررة «' + m[2] + '»'); }
          if (/\s[،.!؛]/.test(s.replace(/\s+\.\.\./g, ''))) flag('مسافة قبل علامة ترقيم');
          if ((s.match(/«/g) || []).length !== (s.match(/»/g) || []).length) flag('أقواس «» غير متوازنة');
          if (/undefined|NaN|null|\[object/.test(s)) flag('قيمة برمجية في النص');
          const re = /(?:^|[^٠-٩٫])([٠-٩]+(?:٫[٠-٩]+)?)\s+([ء-يً-ْ]{2,})/g; let m;
          while ((m = re.exec(s))) { const k = cls(val(m[1])) + ' | ' + m[2].replace(/[ً-ْ]/g, ''); if (!pairs[k]) pairs[k] = { n: 0, ex: s.trim().slice(0, 110), id }; pairs[k].n++; }
        }
      });
    }
  }
  return { pairs, flags };
}, [units, times]);
const groups = {};
Object.entries(R.pairs).forEach(([k, v]) => { const [c, w] = k.split(' | '); (groups[c] = groups[c] || []).push([w, v]); });
for (const c of Object.keys(groups).sort()) { console.log(`\n══ ${c} (${groups[c].length} كلمة) ══`); groups[c].sort((a, b) => b[1].n - a[1].n).forEach(([w, v]) => console.log(`  ${w}  ×${v.n}  [${v.id}]  «${v.ex}»`)); }
console.log('\n══ أخطاء صياغة آلية ══'); const F = Object.entries(R.flags); console.log(F.length ? F.map(([k, v]) => `  ${k}\n     «${v}»`).join('\n') : '  لا شيء');
await b.close(); srv.close();
