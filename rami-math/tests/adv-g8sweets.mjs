// اختبار مغامرة مطبخ الحلوى «سرّ قِدر الجدة» كاملة بالنقر كاللاعب: الجدة، المخزن والانزلاق على العسل بالحل المحسوب (٧ انزلاقات)
// إلى علبة الزعفران ثم العودة (٤ انزلاقات)، محاولة خاطئة في القدر ثم الترتيب الصحيح، والختام والوسام.
// node adv-g8sweets.mjs [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => results.push([c ? '✅' : '❌', n, i]);
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
await page.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= 3).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400);
await page.evaluate(() => window.__villages.enter(3)); await sleep(3000);
ok('زر المغامرة ظاهر بعد إنهاء دروس المطبخ', await page.evaluate(() => !document.querySelector('[data-a=adv]').hidden));
await page.click('[data-a=adv]'); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async fn => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 600; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; }; });
const act = src => page.evaluate(`window.__do(A => ${src})`), st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, low: A.S._low, tideT: A.S.tideT }; });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const waitLow = async () => { for (let i = 0; i < 200; i++) { const s = await st(); if (s.low && s.tideT < 1.2) return true; await sleep(100); } return false; };
await act('new Promise(r => setTimeout(r, 900))');
ok('البداية في المطبخ', (await st()).area === 'kitchen'); await shot('gw-1');
await act("A.tapEnt('pot')"); ok('القدر قبل الجدة لا يطبخ', !(await st()).flags.cooked);
await act("A.tapEnt('sheikha')"); ok('١. الجدة شيخة تشرح', !!(await st()).flags.met);
await act("A.tapEnt('pot')"); ok('القدر بلا زعفران لا يقبل', !((await st()).flags.tries || []).length);
await page.evaluate(() => window.__adv.tapTile(16, 8)); await sleep(2500); await act('Promise.resolve()');
ok('دخول مخزن العسل', (await st()).area === 'pantry');
const hero = () => page.evaluate(() => window.__adv.hero());
const tap = async (x, y, wait = 1800) => { await page.evaluate(([x, y]) => window.__adv.tapTile(x, y), [x, y]); await sleep(wait); await act('Promise.resolve()'); return hero(); };
await act('A.goTile(2, 9)');
let h = await tap(2, 8); ok('الانزلاق يوقفه الصندوق', h.x === 2 && h.y === 4, JSON.stringify(h));
for (const [x, y, ex, ey] of [[1, 4, 1, 4], [1, 3, 1, 1], [2, 1, 3, 1], [3, 2, 3, 5], [4, 5, 7, 5], [7, 4, 7, 1]]) { h = await tap(x, y); if (h.x !== ex || h.y !== ey) { ok(`انزلاق إلى (${ex}، ${ey})`, false, JSON.stringify(h)); break; } }
ok('٢. علبة الزعفران', (await st()).inv.saffron === 1); await shot('gw-2');
for (const [x, y] of [[8, 1], [11, 2], [12, 6], [14, 7]]) h = await tap(x, y);
ok('العودة إلى الممر الجاف', h.y === 9, JSON.stringify(h));
await page.evaluate(() => window.__adv.tapTile(8, 10)); await sleep(2500); await act('Promise.resolve()');
ok('العودة إلى المطبخ', (await st()).area === 'kitchen');
const cookSeq = async seq => page.evaluate(async seq => { const A = window.__adv, z = ms => new Promise(r => setTimeout(r, ms)); A.tapEnt('pot'); const left = [0, 1, 2, 3, 4];
  for (const ing of seq) { for (let i = 0; i < 60 && !document.querySelector('.advOpts [data-o]'); i++) await z(100); const k = left.indexOf(ing); left.splice(k, 1); document.querySelector(`.advOpts [data-o="${k}"]`).click(); await z(200); }
  for (let i = 0; i < 80; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (!A.busy() && i > 10) break; } }, seq);
const code = (await st()).flags.code; ok('الترتيب السرّي فيه الزعفران وليس أولاً', code.includes(2) && code[0] !== 2, JSON.stringify(code));
await cookSeq([code[1], code[2], code[0]]); const tr = (await st()).flags.tries || [];
ok('محاولة خاطئة: ٠ ذهبية و٣ بيضاء', tr.length === 1 && tr[0].exact === 0 && tr[0].near === 3 && !(await st()).flags.cooked, JSON.stringify(tr)); await shot('gw-3');
page.evaluate(async seq => { const A = window.__adv, z = ms => new Promise(r => setTimeout(r, ms)); A.tapEnt('pot'); const left = [0, 1, 2, 3, 4];
  for (const ing of seq) { for (let i = 0; i < 60 && !document.querySelector('.advOpts [data-o]'); i++) await z(100); const k = left.indexOf(ing); left.splice(k, 1); document.querySelector(`.advOpts [data-o="${k}"]`).click(); await z(200); }
  for (let i = 0; i < 200 && !document.querySelector('.advEnd'); i++) { await z(150); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) d.click(); } }, code).catch(() => {});
await page.waitForFunction(() => !!document.querySelector('.advEnd'), null, { timeout: 60000 }).catch(() => {});
ok('٣. الترتيب الصحيح وبطاقة المكافآت', await page.evaluate(() => !!document.querySelector('.advEnd'))); await shot('gw-4');
await page.click('.advEnd [data-home]').catch(() => {}); await sleep(800);
const rec = await page.evaluate(() => ({ adv: window.__villages.state.vil.adv, badge: !!((window.__villages.state.vil.badges || {}).halwaMaster) }));
ok('النتيجة محفوظة والوسام ممنوح', !!(rec.adv && rec.adv.sweets) && rec.badge, JSON.stringify(rec));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n')); console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
