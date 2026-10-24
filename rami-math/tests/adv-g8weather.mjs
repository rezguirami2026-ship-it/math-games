// اختبار مغامرة محطة الأرصاد «منطاد الرصد الهارب» كاملة كاللاعب: ريم، الريح شرقاً تطفّي المنطاد حتى العائق، ذراع الإعادة، الحل بالرياح الخمس
// (من الحلّال)، الهبوط على المنصة، النجوم الثلاث، وريم والختام.
// node adv-g8weather.mjs [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => { results.push([c ? '✅' : '❌', n, i]); console.log(c ? '✅' : '❌', n, i); };
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
await page.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= 12).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400);
await page.evaluate(() => window.__villages.enter(12)); await sleep(3000);
ok('زر المغامرة ظاهر بعد إنهاء دروس المحطة', await page.evaluate(() => !document.querySelector('[data-a=adv]').hidden));
await page.click('[data-a=adv]'); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async fn => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 600; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; }; });
const act = src => page.evaluate(`window.__do(A => ${src})`), st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, stars: A.S.stars, h: A.hero() }; });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const at = async (x, y) => { const h = (await st()).h; return h.x === x && h.y === y; };
const bal = () => page.evaluate(() => { const e = window.__adv.ent('bal'); return [e.x, e.y]; }), stillT = async () => { let p = null; for (let k = 0; k < 80; k++) { await sleep(150); const q = await bal(); if (p && q + '' === p + '' && !(await page.evaluate(() => window.__adv.S.flags.wind))) return q; p = q; } return p; }, blk = (x, y) => page.evaluate(([x, y]) => window.__adv.blockedAt(x, y), [x, y]);
const step = async (x, y) => { await act(`A.goTile(${x}, ${y})`); await act('new Promise(r => setTimeout(r, 400))'); };
const walk = async P => { for (const [x, y] of P) { await act(`A.goTile(${x}, ${y})`); await sleep(120); } };
await act('new Promise(r => setTimeout(r, 900))');
ok('البداية على سطح المحطة', (await st()).area === 'roof');
await act("A.tapEnt('reem')"); ok('١. ريم تشرح', !!(await st()).flags.met);
await act("A.use('wE')"); const p1 = await stillT(); ok('الريح شرقاً: يطفو المنطاد حتى العائق', p1 + '' === '7,10', JSON.stringify(p1));
await act("A.use('reset')"); ok('ذراع الإعادة', (await bal()) + '' === '6,10'); await shot('we-1');
const sol = await page.evaluate(async () => (await import('/villages/g8/weather/story.js')).SOLUTION);
for (const d of sol) { await act(`A.use('w${d}')`); await stillT(); }
ok('٢. حطّ المنطاد على المنصة', !!(await st()).flags.landed && (await bal()) + '' === '13,2', JSON.stringify(await bal())); await shot('we-2');
for (const [x, y] of [[1, 1], [3, 5], [1, 7]]) await act(`A.goTile(${x}, ${y})`); ok('النجوم الثلاث', (await st()).stars === 3, String((await st()).stars));
page.evaluate("window.__do(A => A.tapEnt('reem'))").catch(() => {});
await page.waitForFunction(() => !!document.querySelector('.advEnd'), null, { timeout: 90000 }).catch(() => {});
ok('٣. ريم والنشرة وبطاقة المكافآت', await page.evaluate(() => !!document.querySelector('.advEnd'))); await shot('we-3');
await page.click('.advEnd [data-home]').catch(() => {}); await sleep(800);
const rec = await page.evaluate(() => ({ adv: window.__villages.state.vil.adv, badge: !!((window.__villages.state.vil.badges || {}).weatherHero) }));
ok('النتيجة محفوظة والوسام ممنوح', !!(rec.adv && rec.adv.weather) && rec.badge, JSON.stringify(rec));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
