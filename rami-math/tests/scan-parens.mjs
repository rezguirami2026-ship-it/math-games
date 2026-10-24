// يبحث عن التوضيحات بين قوسين في نصوص الأسئلة (قاعدة المعلم: السؤال ببياناته فقط): يولّد التحديات وجولات المهام مرات كثيرة
// ويطبع كل نص عربي بين قوسين مرة واحدة مع مصدره. الرموز الرياضية (السالب «(٥−)»، الأزواج «(٣، ٤)»، حرف واحد «(و)») لا تُعدّ.
// الاستعمال: node scan-parens.mjs [عدد المرات]
import { chromium } from 'playwright-core';
import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), TY = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/json', '.woff2': 'font/woff2' };
const srv = createServer(async (q, r) => { const p = decodeURIComponent(new URL(q.url, 'http://x').pathname).slice(1) || 'index.html'; try { const b = await readFile(join(ROOT, p)); r.writeHead(200, { 'content-type': TY[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(r => srv.listen(0, r));
const times = +(process.argv[2] || 60);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
await p.goto(`http://localhost:${srv.address().port}/?2d=1&preview=1&grade=7`); await p.waitForTimeout(2500);
const res = await p.evaluate(async times => {
  const found = {}, plain = s => String(s || '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').replace(/[\u2066-\u2069\u200e\u200f]/g, '');
  const scan = (src, s) => { (plain(s).match(/\([^()]*\)/g) || []).forEach(m => { if (!/[ء-ي]{2,}/.test(m)) return; if (/^\([ء-ي]\)$/.test(m)) return; const k = m.replace(/[٠-٩]+(٫[٠-٩]+)?/g, '#'); if (!found[k]) found[k] = { src, ex: m, n: 0 }; found[k].n++; }); };
  for (let u = 1; u <= 9; u++) { let CH; try { ({ CH } = await import(`./content/g7/challenges${u}.js`)); } catch (e) { continue; }
    for (const [id, c] of Object.entries(CH)) for (let t = 0; t < times; t++) { let items; try { items = c.make(); } catch (e) { continue; } items.forEach(it => scan('g7 تحدي ' + id, it.q)); } }
  for (const f of ['harbor', 'fort', 'festival', 'datayard', 'coop', 'caravan', 'workshop']) {
    let mods; try { mods = Object.values(await import(`./missions/g7/${f}.js`)).find(v => v && typeof v === 'object' && Object.values(v).some(m => m && m.cfg)); } catch (e) { continue; }
    for (const [id, m] of Object.entries(mods || {})) for (let t = 0; t < times; t++) { const d = {}; try { m.begin(d); } catch (e) { continue; } d.rounds.forEach((r, i) => { try { d.r = i; d.sel = []; const v = m.cfg.view(r, d); scan('g7 مهمة ' + id, v.text); } catch (e) {} }); }
  }
  let UNITS = []; try { ({ UNITS } = await import('./content/g8/lessons.js')); } catch (e) {}   // الثامن في فرع grades-8-9 فقط
  for (const U of UNITS) { let def; try { def = (await import(`./villages/g8/${U.village}/index.js`)).default; } catch (e) { continue; }
    for (const [id, imp] of Object.entries(def.lessons)) { const m = await imp(); for (let t = 0; t < times; t++) { for (let i = 0; i < (m.ROUNDS || 5); i++) { try { scan('g8 جولة ' + id, m.make(i).q); } catch (e) {} } try { m.challenge().forEach(it => scan('g8 تحدي ' + id, it.q)); } catch (e) {} } } }
  return found;
}, times);
const L = Object.entries(res).sort((a, b) => a[1].src.localeCompare(b[1].src));
L.forEach(([k, v]) => console.log(`${v.src} :: ${v.ex}`)); console.log('المجموع', L.length);
await b.close(); srv.close();
