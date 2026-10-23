// اختبار مغامرة ميناء الموازين «لغز الحاوية الخضراء» كاملة بالنقر كاللاعب: المد يغلق الممر ثم ينحسر، المفتاح من المكتب القديم،
// ارتفاع الماء يعيد البطل بأمان، لوحات الرافعة بالترتيب، الحاوية الخاطئة ثم الصحيحة، وسطح السفينة والختام.
// node adv-g8scales.mjs [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => results.push([c ? '✅' : '❌', n, i]);
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
await page.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= 1).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400);
await page.evaluate(() => window.__villages.enter(1)); await sleep(3000);
ok('زر المغامرة ظاهر بعد إنهاء دروس الميناء', await page.evaluate(() => !document.querySelector('[data-a=adv]').hidden));
await page.click('[data-a=adv]'); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async fn => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 600; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; }; });
const act = src => page.evaluate(`window.__do(A => ${src})`), st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, low: A.S._low, tideT: A.S.tideT }; });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const waitLow = async () => { for (let i = 0; i < 200; i++) { const s = await st(); if (s.low && s.tideT < 1.2) return true; await sleep(100); } return false; };
await act('new Promise(r => setTimeout(r, 900))');
ok('البداية على الرصيف ليلاً', (await st()).area === 'quay'); await shot('gs-1');
await act("A.tapEnt('saif')"); ok('١. الربّان يعطي سجل الشحنات', (await st()).inv.log === 1);
// المد مرتفع: الممر مغلق
await page.evaluate(async () => { for (let i = 0; i < 200 && window.__adv.S._low !== false; i++) await new Promise(r => setTimeout(r, 60)); });
ok('المد يغلق الممر الطيني', await page.evaluate(() => { const e = window.__adv.ent('tw4'); return e && !e.hidden; }));
// ارتفاع الماء والبطل في الممر يعيده بأمان
await act('A.tp(17, 8)'); await sleep(600); const back = await page.evaluate(() => window.__adv.hero());
ok('ارتفاع الماء يعيد البطل إلى اليابسة', back.x === 15 || back.x === 19, JSON.stringify(back));
await act('A.tp(14, 8)'); ok('الجزر يأتي', await waitLow()); await shot('gs-2');
await act('A.goTile(20, 8)'); await act("A.tapEnt('chest')"); ok('٢. المفتاح من مكتب الميناء القديم', (await st()).inv.key === 1);
ok('الجزر يعود', await waitLow()); await act('A.goTile(14, 9)'); ok('العودة إلى الرصيف', (await page.evaluate(() => window.__adv.hero())).x <= 15);
await act("A.tapEnt('yardGate')"); await act('A.goTile(8, 15)'); await sleep(1500); await act('Promise.resolve()');
ok('٣. البوابة تُفتح وتدخل ساحة الحاويات', (await st()).area === 'yard'); await shot('gs-3');
await act("A.tapEnt('c1')"); await sleep(1200); ok('اللوحة الحمراء تنقل الحاوية «أ» إلى جيبها', await page.evaluate(() => { const e = window.__adv.ent('m1'); return e.x === 8 && e.y === 10; }));
await act("A.tapEnt('c2')"); await sleep(1200); await act("A.tapEnt('c3')"); await sleep(1200);
ok('٤. اللوحات الثلاث تفتح الممر', !!(await st()).flags.m3moved); await shot('gs-4');
await act("A.tapEnt('g5')"); ok('الحاوية الخاطئة لا تُقبل', !(await st()).flags.found);
page.evaluate("window.__do(A => A.tapEnt('g7'))").catch(() => {});
await page.waitForFunction(() => !!document.querySelector('.advEnd'), null, { timeout: 60000 }).catch(() => {});
await page.evaluate(async () => { for (let i = 0; i < 80 && !document.querySelector('.advEnd'); i++) { const d = document.querySelector('.advDlg.on'); if (d) d.click(); await new Promise(r => setTimeout(r, 150)); } });
ok('٥. الحاوية الصحيحة، وسطح السفينة، وبطاقة المكافآت', await page.evaluate(() => !!document.querySelector('.advEnd'))); await shot('gs-5');
await page.click('.advEnd [data-home]').catch(() => {}); await sleep(800);
const rec = await page.evaluate(() => ({ adv: window.__villages.state.vil.adv, badge: !!((window.__villages.state.vil.badges || {}).portHero) }));
ok('النتيجة محفوظة والوسام ممنوح', !!(rec.adv && rec.adv.scales) && rec.badge, JSON.stringify(rec));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n')); console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
