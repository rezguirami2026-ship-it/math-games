// اختبار مغامرة مهرجان الألعاب «لغز صانع الألعاب» كاملة كاللاعب: مسعود، المسار لا يمر فوق النطّاطات، نطّاطة الشاطئ إلى الجزيرة،
// جزيرة الشمال ونجمتها والعودة، النطّاطة الزرقاء جنوباً ونجمتها والقفزة المتصلة (نطّاطة تهبط على نطّاطة)، العودة إلى الشاطئ، الذراع الزرقاء
// فالنطّاطة شرقاً إلى الورشة، المفتاح، نطّاطة العودة، قاعة النرد: الباب مغلق، دفعة تقلب الوجه الأعلى، ذراع الإعادة، حلّ الحجرين (من الحلّال)، الكأس.
// node adv-g8fair.mjs [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => { results.push([c ? '✅' : '❌', n, i]); console.log(c ? '✅' : '❌', n, i); };
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
await page.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= 6).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400);
await page.evaluate(() => window.__villages.enter(6)); await sleep(3000);
ok('زر المغامرة ظاهر بعد إنهاء دروس المهرجان', await page.evaluate(() => !document.querySelector('[data-a=adv]').hidden));
await page.click('[data-a=adv]'); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async fn => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 600; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; }; });
const act = src => page.evaluate(`window.__do(A => ${src})`), st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, stars: A.S.stars, h: A.hero() }; });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const at = async (x, y) => { const h = (await st()).h; return h.x === x && h.y === y; };
// قفزة: المشي إلى النطّاطة، ثم الانتظار حتى يهبط البطل (وقد تتصل القفزات)
const hop = async (x, y) => { await act(`A.goTile(${x}, ${y})`); for (let k = 0; k < 30; k++) { await sleep(150); if (!(await page.evaluate(() => window.__adv.busy()))) break; } await act('new Promise(r => setTimeout(r, 300))'); };
await act('new Promise(r => setTimeout(r, 900))');
ok('البداية على شاطئ البركة', (await st()).area === 'pond'); await shot('fr-1');
await act("A.tapEnt('masoud')"); ok('١. مسعود يشرح', !!(await st()).flags.met);
ok('لا طريق مشياً إلى الجزر', !(await act('A.goTile(7, 6)')) && !(await at(7, 6)));
ok('المسار لا يمر فوق النطّاطة', await page.evaluate(() => { const A = window.__adv; return !A.blockedAt(4, 7); }) && (await act('A.goTile(4, 7)')) && await at(4, 7));
await hop(4, 6); ok('نطّاطة الشاطئ تقذف ثلاث خطوات إلى الجزيرة', await at(7, 6), JSON.stringify((await st()).h)); await shot('fr-2');
await hop(7, 5); ok('نطّاطة الشمال إلى الجزيرة الصغيرة', await at(7, 2), JSON.stringify((await st()).h));
await act('A.goTile(7, 1)'); ok('نجمة جزيرة الشمال', (await st()).stars >= 1);
await hop(8, 2); ok('نطّاطة العودة جنوباً', await at(8, 5), JSON.stringify((await st()).h));
await hop(8, 6); ok('إلى الجزيرة الوسطى', await at(11, 6), JSON.stringify((await st()).h));
await hop(12, 6); ok('النطّاطة الزرقاء جنوباً أولاً', await at(12, 9), JSON.stringify((await st()).h));
await act('A.goTile(12, 10)'); ok('نجمة الجزيرة الجنوبية', (await st()).stars >= 2);
await hop(11, 10); ok('قفزة متصلة: نطّاطة تهبط على نطّاطة', await at(8, 7), JSON.stringify((await st()).h));
await hop(7, 7); ok('العودة إلى الشاطئ', await at(4, 7), JSON.stringify((await st()).h));
await act("A.use('blue')"); ok('الذراع الزرقاء تدير النطّاطة شرقاً', await page.evaluate(() => window.__adv.ent('j7').d === 0));
await hop(4, 6); await hop(8, 6); await hop(12, 6); ok('٢. القفز إلى جزيرة الورشة', await at(15, 6), JSON.stringify((await st()).h)); await shot('fr-3');
await act("A.tapEnt('chest')"); ok('المفتاح', (await st()).inv.key === 1);
await act('A.goTile(17, 8)'); ok('نجمة الورشة', (await st()).stars >= 3);
await hop(15, 7); ok('نطّاطة العودة من الورشة', await at(12, 7), JSON.stringify((await st()).h));
await hop(12, 6); ok('ومنها إلى الورشة ثانية', await at(15, 6));
await page.evaluate(() => window.__adv.tapTile(18, 6)); await sleep(2500); await act('Promise.resolve()');
ok('دخول قاعة النرد', (await st()).area === 'hall');
const die = id => page.evaluate(id => { const e = window.__adv.ent(id); return { x: e.x, y: e.y, ...e.die }; }, id);
ok('باب الجائزة مغلق', await page.evaluate(() => window.__adv.blockedAt(7, 2)));
await act('A.goTile(6, 8)'); await act("A.use('dA')"); let d = await die('dA'); ok('الدفعة تدحرج الحجر وتقلب وجهه الأعلى', d.x === 4 && d.y === 8 && d.t === 3, JSON.stringify(d));
await act("A.use('reset')"); d = await die('dA'); ok('ذراع الإعادة', d.x === 5 && d.y === 8 && d.t === 1, JSON.stringify(d));
const PA = [[6, 8, -1, 0], [4, 9, 0, -1], [5, 7, -1, 0], [3, 8, 0, -1], [4, 6, -1, 0], [2, 7, 0, -1], [2, 6, 0, -1], [2, 5, 0, -1]], PB = [[9, 8, 1, 0], [10, 8, 1, 0], [12, 9, 0, -1], [12, 8, 0, -1], [12, 7, 0, -1], [11, 5, 1, 0], [13, 6, 0, -1], [13, 5, 0, -1]];   // من حلّال القاعة
const push = async (id, P) => { for (const [x, y] of P) { await act(`A.goTile(${x}, ${y})`); await act(`A.use('${id}')`); await sleep(250); } };
await push('dA', PA); d = await die('dA'); ok('الحجر الأيسر على لوحة الستة والستة أعلى', d.x === 2 && d.y === 3 && d.t === 6, JSON.stringify(d)); await shot('fr-4');
ok('الباب ما زال مغلقاً بحجر واحد', !(await st()).flags.open);
await push('dB', PB); d = await die('dB'); ok('الحجر الأيمن على لوحة الأربعة والأربعة أعلى', d.x === 13 && d.y === 3 && d.t === 4, JSON.stringify(d));
await act('new Promise(r => setTimeout(r, 1200))'); ok('٣. انفتح باب الجائزة', !!(await st()).flags.open && !(await page.evaluate(() => window.__adv.blockedAt(7, 2))));
await act('A.goTile(14, 3)'); ok('نجمة القاعة', (await st()).stars >= 4); await act('A.goTile(1, 10)'); ok('النجوم الخمس', (await st()).stars === 5);
page.evaluate("window.__do(A => A.use('prize'))").catch(() => {});
await page.waitForFunction(() => !!document.querySelector('.advEnd'), null, { timeout: 60000 }).catch(() => {});
ok('٤. كأس المهرجان وبطاقة المكافآت', await page.evaluate(() => !!document.querySelector('.advEnd'))); await shot('fr-5');
await page.click('.advEnd [data-home]').catch(() => {}); await sleep(800);
const rec = await page.evaluate(() => ({ adv: window.__villages.state.vil.adv, badge: !!((window.__villages.state.vil.badges || {}).fairHero) }));
ok('النتيجة محفوظة والوسام ممنوح', !!(rec.adv && rec.adv.fair) && rec.badge, JSON.stringify(rec));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
