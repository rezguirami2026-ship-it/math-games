// اختبار حركة الجمل سهيل: يتبع أثر البطل حول البيوت دون أن يدخل جداراً، بلا ارتجاف، ويقف خلف البطل ولا يمر من خلاله
// node pet-test.mjs [--3d]
import { chromium } from 'playwright-core';
const sleep = ms => new Promise(r => setTimeout(r, ms)), d3 = process.argv.includes('--3d');
const b = await chromium.launch({ channel: 'chrome' }); const page = await b.newPage({ viewport: { width: 1000, height: 640 } });
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto('http://localhost:8000/' + (d3 ? '' : '?2d=1')); await page.evaluate(() => localStorage.clear()); await page.reload();
await page.click('#bNew'); await page.fill('#hname', 'سالم'); await page.click('#bGo');
await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 90000 });
for (let i = 0; i < 40 && !(await page.$('#dialog.on')); i++) { await page.evaluate(() => { const s = document.getElementById('screen'); if (s && s.onclick) s.onclick(); }); await sleep(300); }
for (let i = 0; i < 12 && await page.$('#dialog.on'); i++) { await page.evaluate(() => document.getElementById('dialog').click()); await sleep(200); }
await page.evaluate(() => { const s = window.__game.state; s.activities = { a: { plays: 5 }, b: { plays: 5 }, c: { plays: 5 }, d: { plays: 5 } }; s.levelSeen = 9; });
await sleep(800);
// المشي كما ينقر اللاعب على الأرض (نفس مسار اللعبة)، ونتحقق أن البطل تحرك فعلاً
const walk = (x, y) => page.evaluate(([x, y]) => { const g = window.__game, pl = g.W.player, x0 = pl.x, y0 = pl.y; g.eng.onTap({ x, y }); return !!pl.target || Math.hypot(pl.x - x0, pl.y - y0) > 1 ? 1 : 0; }, [x, y]);
const sample = () => page.evaluate(async () => { const m = await import('/world/pet.js'); const p = m.petState(), pl = window.__game.W.player; return { ...p, hx: pl.x, hy: pl.y, bad: window.__game.blocked(p.x, p.y) }; });
let bad = 0, flips = 0, last = null, n = 0, minD = 1e9, heroMoved = 0, petMoved = 0, hp0 = null, pp0 = null;
const run = async ms => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await sample(); n++; if (s.bad) bad++; if (hp0) { heroMoved += Math.hypot(s.hx - hp0[0], s.hy - hp0[1]); petMoved += Math.hypot(s.x - pp0[0], s.y - pp0[1]); } hp0 = [s.hx, s.hy]; pp0 = [s.x, s.y]; if (last && s.moving && last.moving && s.dir !== last.dir) flips++; last = s; await sleep(100); } };
// جولة حول البيوت والساحة (أماكن فيها زوايا وعوائق)
const stops = [[1110, 600], [1030, 300], [1030, 130], [1030, 300], [900, 470], [760, 700], [1300, 640], [1110, 470], [600, 900], [1110, 600]];   // ومنها المشي بمحاذاة جدار البيت الأول (بين البيت والمسجد)
let routes = 0;
let si = 0; for (const [x, y] of stops) { routes += (await walk(x, y)) > 0 ? 1 : 0; await run(1500); if (process.argv[2] && !process.argv[2].startsWith('--')) await page.screenshot({ path: `${process.argv[2]}/pet-${d3 ? '3d' : '2d'}-${si++}.png` }); await run(2700); }
const s1 = await sample(), gap = Math.hypot(s1.x - s1.hx, s1.y - s1.hy);
// البطل يعود نحو الجمل: يجب أن يقف الجمل لا أن يعبر من خلاله
await walk(s1.x, s1.y + 2); let through = 0;
for (let i = 0; i < 25; i++) { const s = await sample(); minD = Math.min(minD, Math.hypot(s.x - s.hx, s.y - s.hy)); if (s.moving && Math.hypot(s.x - s.hx, s.y - s.hy) < 14) through++; await sleep(100); }
const res = [
  ['الجولة: البطل مشى فعلاً إلى كل المحطات، والجمل تبعه', routes === stops.length && heroMoved > 2500 && petMoved > heroMoved * .8, `محطات ${routes}/${stops.length}، مشى البطل ${Math.round(heroMoved)} والجمل ${Math.round(petMoved)}`],
  ['الجمل لا يدخل جداراً أو بيتاً أبداً', bad === 0, `${bad} من ${n} لقطة`],
  ['بلا ارتجاف: يلتفت فقط حين يغيّر اتجاهه فعلاً', flips <= 8, `التفاتات أثناء المشي: ${flips}`],
  ['يقف خلف البطل على مسافة طبيعية', gap > 25 && gap < 90, `المسافة ${Math.round(gap)}`],
  ['حين يعود البطل نحوه ينتظر ولا يمر من خلاله', through === 0, `مرات العبور: ${through}، أقرب مسافة ${Math.round(minD)}`],
  ['لا أخطاء', errs.length === 0, errs.join(' | ')]
];
console.log(res.map(([a, c, i]) => `${c ? '✅' : '❌'} ${a} ${i}`).join('\n'));
await b.close();
