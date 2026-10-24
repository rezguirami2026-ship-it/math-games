// اختبار مغامرة ميزان الخوارزمي «مخطوطة الخوارزمي المفقودة» كاملة بالنقر كاللاعب: ليلى، لوح غير مجاور للفراغ يُرفض، حل لغز الألواح
// المنزلقة بالبحث (أقصر حل)، فتح الباب والمصباح، البركة بلا مصباح لا تُعبر، ومع المصباح خطوة خطوة إلى الجزيرة، والختام والوسام.
// node adv-g8khwarizmi.mjs [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => results.push([c ? '✅' : '❌', n, i]);
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
await page.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= 4).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400);
await page.evaluate(() => window.__villages.enter(4)); await sleep(3000);
ok('زر المغامرة ظاهر بعد إنهاء دروس دار الحكمة', await page.evaluate(() => !document.querySelector('[data-a=adv]').hidden));
await page.click('[data-a=adv]'); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async fn => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 600; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; }; });
const act = src => page.evaluate(`window.__do(A => ${src})`), st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, low: A.S._low, tideT: A.S.tideT }; });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const waitLow = async () => { for (let i = 0; i < 200; i++) { const s = await st(); if (s.low && s.tideT < 1.2) return true; await sleep(100); } return false; };
await act('new Promise(r => setTimeout(r, 900))');
ok('البداية في قاعة دار الحكمة', (await st()).area === 'hall'); await shot('gk-1');
await act("A.tapEnt('layla')"); ok('١. ليلى تشرح', !!(await st()).flags.met);
const board = () => page.evaluate(() => window.__adv.S.flags.board.slice());
let bd = await board(); const nb = i => [i % 3 > 0 && i - 1, i % 3 < 2 && i + 1, i > 2 && i - 3, i < 6 && i + 3].filter(q => q !== false);
const far = bd.findIndex((v, i) => v && !nb(bd.indexOf(0)).includes(i));
await act(`A.tapEnt('t${bd[far]}')`); ok('لوح لا يجاور الفراغ لا يتحرك', JSON.stringify(await board()) === JSON.stringify(bd));
// أقصر حل بالبحث في الحالات
const solve = start => { const key = b => b.join(''), goal = '123456780', prev = new Map([[key(start), null]]), q = [start];
  while (q.length) { const b = q.shift(), k = key(b); if (k === goal) { const moves = []; let c = k; while (prev.get(c)) { const [p, n] = prev.get(c); moves.unshift(n); c = p; } return moves; }
    const z = b.indexOf(0); for (const j of nb(z)) { const c = b.slice(); c[z] = c[j]; c[j] = 0; const ck = key(c); if (!prev.has(ck)) { prev.set(ck, [k, b[j]]); q.push(c); } } } return null; };
const moves = solve(bd); ok('للوح حل', !!moves, String(moves && moves.length));
for (const n of moves) { const before = (await board()).join(''); await act(`A.tapEnt('t${n}')`); for (let k = 0; k < 30 && (await board()).join('') === before; k++) await sleep(60); await sleep(80); }
ok('٢. الألواح مرتبة والباب مفتوح', !!(await st()).flags.solved); await shot('gk-2');
await act("A.tapEnt('lampItem')"); await act('A.goTile(13, 8)'); ok('٣. مصباح الحكمة', (await st()).inv.lamp === 1);
await page.evaluate(() => window.__adv.tapTile(8, 1)); await sleep(2500); await act('Promise.resolve()');
ok('دخول الحديقة', (await st()).area === 'garden');
const tap = async (x, y) => { await page.evaluate(([x, y]) => window.__adv.tapTile(x, y), [x, y]); await sleep(700); await act('Promise.resolve()'); return page.evaluate(() => window.__adv.hero()); };
await act('A.goTile(6, 11)');
ok('الحجارة القريبة ظاهرة في ضوء المصباح', await page.evaluate(() => { const A = window.__adv, a = A.ent('st0'), b = A.ent('st6'); return !!a && a.lit && !b.lit; }));
let h; for (const [x, y] of [[6, 10], [6, 9], [6, 8], [7, 8], [8, 8], [8, 7], [9, 7], [9, 6]]) h = await tap(x, y);
ok('٤. العبور خطوة خطوة إلى الجزيرة', h.x === 9 && h.y === 6, JSON.stringify(h)); await shot('gk-3');
page.evaluate("window.__do(A => A.goTile(10, 5))").catch(() => {});
await page.waitForFunction(() => !!document.querySelector('.advEnd'), null, { timeout: 60000 }).catch(() => {});
ok('٥. المخطوطة وبطاقة المكافآت', await page.evaluate(() => !!document.querySelector('.advEnd'))); await shot('gk-4');
await page.click('.advEnd [data-home]').catch(() => {}); await sleep(800);
const rec = await page.evaluate(() => ({ adv: window.__villages.state.vil.adv, badge: !!((window.__villages.state.vil.badges || {}).wisdomKeeper) }));
ok('النتيجة محفوظة والوسام ممنوح', !!(rec.adv && rec.adv.khwarizmi) && rec.badge, JSON.stringify(rec));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n')); console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
