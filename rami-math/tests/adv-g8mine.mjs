// اختبار مغامرة منجم الأعماق «المنقّب المفقود في الأعماق» (الصف الثامن) كاملة بالنقر كاللاعب، من زر المغامرة في القرية:
// المصباح يخفت ويُملأ، المعول يكسر الصخور، سلة البكرة تبني المنصة، محوّلا العربة (طريق خاطئ ثم الصحيح)، الإنقاذ، رحلة العربة، والختام.
// node adv-g8mine.mjs [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => results.push([c ? '✅' : '❌', n, i]);
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
await page.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u === 0).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400);
await page.evaluate(() => window.__villages.enter(0)); await sleep(3000);
ok('زر المغامرة ظاهر بعد إنهاء دروس القرية', await page.evaluate(() => !document.querySelector('[data-a=adv]').hidden));
await page.click('[data-a=adv]'); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async fn => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 600; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; }; });
const act = src => page.evaluate(`window.__do(A => ${src})`), st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, goal: document.querySelector('.advGoal').textContent }; });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
await act('new Promise(r => setTimeout(r, 900))');
ok('البداية في ساحة المنجم', (await st()).area === 'yard'); await shot('gm-1');
await act("A.tapEnt('lift')"); await sleep(800); ok('المصعد مقفل بلا مصباح', (await st()).area === 'yard');
await act("A.tapEnt('miriam')"); ok('١. مريم تعطي المصباح والمعول', (await st()).inv.lamp === 1 && (await st()).inv.pick === 1);
await act('A.goTile(11, 3)'); await sleep(1500); await act('Promise.resolve()'); ok('٢. النزول إلى الطبقة العميقة', (await st()).area === 'deep'); await shot('gm-2');
const f0 = (await st()).flags.fuel; await act('new Promise(r => setTimeout(r, 2500))'); const f1 = (await st()).flags.fuel;
ok('المصباح يخفت مع الوقت والظلام يشتد', f1 < f0 && (await st()).flags.weather.dark > .5, `${f0} → ${f1}`);
await act("A.tapEnt('oil1')"); ok('مصباح الزيت يملأ المصباح', (await st()).flags.fuel > 95);
for (const [x, y] of [[9, 8], [10, 8], [13, 5]]) { await act(`A.tapTile(${x}, ${y})`); await sleep(400); }
ok('٣. المعول يكسر الصخور الثلاث فتصير حجارة', (await st()).inv.rock === 3, JSON.stringify((await st()).inv));
await act("A.tapEnt('basket')"); ok('٤. السلة الثقيلة ترفع المنصة فوق الهوّة', !!(await st()).flags.bridge && await page.evaluate(() => window.__adv.tileAt(19, 9) === '_'));
await shot('gm-3');
await act('A.goTile(28, 8)'); await sleep(1500); await act('Promise.resolve()'); ok('٥. العبور إلى الأشغال القديمة', (await st()).area === 'old');
await act("A.tapEnt('cart')"); await sleep(4200); await act('Promise.resolve()');
ok('عربة بلا ضبط المحوّلين تصل نهاية مسدودة وتعود', !(await st()).flags.crash && await page.evaluate(() => { const c = window.__adv.ent('cart'); return c.x === 4 && c.y === 8; }));
await act("A.tapEnt('sw1')"); await act("A.tapEnt('sw2')"); await act('A.goTile(6, 6)');
await act("A.tapEnt('cart')"); await sleep(6000); await act('Promise.resolve()');
ok('٦. المحوّلان يوجّهان العربة فتحطم الحاجز', !!(await st()).flags.crash); await shot('gm-4');
// الإنقاذ ثم رحلة العربة (لاعب آلي يتفادى الصخور ويقفز فوق الكسور)
page.evaluate("window.__do(A => A.tapEnt('salem'))");
await page.waitForFunction(() => window.__vadv && !window.__vadv.done, null, { timeout: 30000 }); ok('٧. إنقاذ العمّ سالم يبدأ رحلة العربة', true);
const t0 = Date.now();
while (Date.now() - t0 < 240000 && !(await page.evaluate(() => !!document.querySelector('.vm-end')))) {
  const k = await page.evaluate(() => { const S = window.__vadv; if (!S || S.done) return 'x'; const near = (S.things || []).filter(t => !t.hit && t.z > S.z && t.z < S.z + 9);
    if (near.some(t => t.kind === 'gap' && t.z < S.z + 2.2)) return 'ArrowUp';
    if (near.some(t => t.kind === 'rock' && t.lane === S.lane)) { const free = [0, 1, 2].filter(l => !near.some(t => t.kind === 'rock' && t.lane === l)).sort((a, b) => Math.abs(a - S.lane) - Math.abs(b - S.lane))[0]; return free === undefined ? 'x' : free < S.lane ? 'ArrowLeft' : free > S.lane ? 'ArrowRight' : 'x'; }
    return 'x'; });
  await page.keyboard.press(k); await sleep(60);
}
ok('٨. النجاة بالعربة', await page.evaluate(() => !!document.querySelector('.vm-end'))); await shot('gm-5');
await page.click('.vm-end .vm-go'); await page.waitForFunction(() => !!document.querySelector('.advEnd'), null, { timeout: 30000 }).catch(() => {});
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms)); return (async () => { for (let i = 0; i < 60 && !document.querySelector('.advEnd'); i++) { const d = document.querySelector('.advDlg.on'); if (d) d.click(); await z(150); } })(); });
ok('٩. الختام في ساحة المنجم وبطاقة المكافآت', await page.evaluate(() => !!document.querySelector('.advEnd'))); await shot('gm-6');
await page.click('.advEnd [data-home]').catch(() => {}); await sleep(800);
const rec = await page.evaluate(() => ({ adv: window.__villages.state.vil.adv, badge: !!((window.__villages.state.vil.badges || {}).deepRescue), btn: document.querySelector('[data-a=adv]').textContent }));
ok('النتيجة محفوظة والوسام ممنوح', !!(rec.adv && rec.adv.mine) && rec.badge, JSON.stringify(rec));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n')); console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
