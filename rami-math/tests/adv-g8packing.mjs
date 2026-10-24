// اختبار مغامرة مصنع التغليف «يوم العطل الكبير» كاملة بالنقر كاللاعب: السير المعاكس يعيد البطل، اللوحتان تقلبان السيرين فيحملانه،
// برنامج خاطئ يعيد رقيم، والبرنامج الصحيح يجلب المصهر، ثم تركيبه والختام.
// node adv-g8packing.mjs [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => results.push([c ? '✅' : '❌', n, i]);
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
await page.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= 2).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400);
await page.evaluate(() => window.__villages.enter(2)); await sleep(3000);
ok('زر المغامرة ظاهر بعد إنهاء دروس المصنع', await page.evaluate(() => !document.querySelector('[data-a=adv]').hidden));
await page.click('[data-a=adv]'); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async fn => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 600; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; }; });
const act = src => page.evaluate(`window.__do(A => ${src})`), st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, low: A.S._low, tideT: A.S.tideT }; });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const waitLow = async () => { for (let i = 0; i < 200; i++) { const s = await st(); if (s.low && s.tideT < 1.2) return true; await sleep(100); } return false; };
await act('new Promise(r => setTimeout(r, 900))');
ok('البداية في أرض المصنع', (await st()).area === 'floor'); await shot('gp-1');
await act("A.tapEnt('suad')"); ok('١. المشرفة سعاد تشرح العطل', !!(await st()).flags.met);
await page.evaluate(() => window.__adv.tapTile(6, 7)); await sleep(3500); ok('السير المعاكس يعيد البطل إلى الغرب', (await page.evaluate(() => window.__adv.hero())).x <= 5);
await act("A.tapEnt('cA')"); ok('اللوحة تقلب السير الأصفر شرقاً', await page.evaluate(() => window.__adv.ent('ba5').d === 0));
await page.evaluate(() => window.__adv.tapTile(6, 7)); await sleep(3500); ok('٢. السير يحمل البطل إلى الشرق', !!(await st()).flags.crossA, JSON.stringify(await page.evaluate(() => window.__adv.hero())));
await act("A.tapEnt('cB')"); await page.evaluate(() => window.__adv.tapTile(14, 7)); await sleep(3500); await act('A.goTile(21, 7)'); await page.evaluate(() => window.__adv.tapTile(22, 7)); await sleep(2000); await act('Promise.resolve()');
ok('٣. السير الأزرق يحمل البطل إلى غرفة التحكم', (await st()).area === 'control'); await shot('gp-2');
const runProg = async seq => page.evaluate(async seq => { const A = window.__adv; A.tapEnt('prog'); let moved = false; const r = () => A.ent('robot'), home = () => r().x === 5 && r().y === 8 && r().px == null; const z = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 60 && !document.querySelector('.advOpts [data-o]'); i++) await z(100);
  for (const k of seq) { for (let i = 0; i < 40 && !document.querySelector('.advOpts [data-o]'); i++) await z(80); document.querySelector(`.advOpts [data-o="${k}"]`).click(); await z(150); }
  for (let i = 0; i < 200; i++) { await z(100); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (!home()) moved = true; if (moved && (A.S.inv.fuse || home()) && !A.busy()) break; } }, seq);
await runProg([0, 3, 4]); await sleep(800); ok('برنامج ناقص يعيد رقيم إلى البداية', await page.evaluate(() => { const r = window.__adv.ent('robot'); return r.x === 5 && r.y === 8 && !window.__adv.S.inv.fuse; }));
await runProg([0, 3, 1, 3, 0, 3, 4]); await sleep(800); ok('٤. البرنامج الصحيح يجلب المصهر', (await st()).inv.fuse === 1); await shot('gp-3');
page.evaluate("window.__do(A => A.tapEnt('main'))").catch(() => {});
await page.waitForFunction(() => !!document.querySelector('.advEnd'), null, { timeout: 60000 }).catch(() => {});
ok('٥. تركيب المصهر وبطاقة المكافآت', await page.evaluate(() => !!document.querySelector('.advEnd'))); await shot('gp-4');
await page.click('.advEnd [data-home]').catch(() => {}); await sleep(800);
const rec = await page.evaluate(() => ({ adv: window.__villages.state.vil.adv, badge: !!((window.__villages.state.vil.badges || {}).factoryFixer) }));
ok('النتيجة محفوظة والوسام ممنوح', !!(rec.adv && rec.adv.packing) && rec.badge, JSON.stringify(rec));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n')); console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
