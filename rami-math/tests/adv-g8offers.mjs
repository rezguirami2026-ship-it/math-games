// اختبار مغامرة سوق العروض «سرّ مانيكان الخيّاط» كاملة كاللاعب: ثويني، المانيكان المرآة يسدّ الممر، ذراع الإعادة، خطوات الغرب تثبّته عند
// المخرج (الجدار يوقفه)، أربع خطوات شرقاً تضعه تحت الكوّة وخطوة شمالاً تدخله فيها، نجمة الممر، محل الخيّاط: حلّ المانيكانين بـ ١٣ خطوة
// (من الحلّال)، زجاج العرض، نجمتا المحل، المفتاح، العودة، نجمة الساحة، ثويني والختام والوسام.
// node adv-g8offers.mjs [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => { results.push([c ? '✅' : '❌', n, i]); console.log(c ? '✅' : '❌', n, i); };
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
await page.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= 7).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400);
await page.evaluate(() => window.__villages.enter(7)); await sleep(3000);
ok('زر المغامرة ظاهر بعد إنهاء دروس السوق', await page.evaluate(() => !document.querySelector('[data-a=adv]').hidden));
await page.click('[data-a=adv]'); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
await page.evaluate(() => { const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async fn => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 600; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; }; });
const act = src => page.evaluate(`window.__do(A => ${src})`), st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, stars: A.S.stars, h: A.hero() }; });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const at = async (x, y) => { const h = (await st()).h; return h.x === x && h.y === y; };
const tw = id => page.evaluate(id => { const e = window.__adv.ent(id); return [e.x, e.y]; }, id);
const walk = async P => { for (const [x, y] of P) { await act(`A.goTile(${x}, ${y})`); await sleep(120); } };
await act('new Promise(r => setTimeout(r, 900))');
ok('البداية في ساحة السوق', (await st()).area === 'souq'); await shot('of-1');
await act("A.tapEnt('thuwaini')"); ok('١. ثويني يشرح', !!(await st()).flags.met);
await act("A.use('reset0')"); ok('ذراع الإعادة تعيد المانيكان', (await tw('tw0')) + '' === '14,6', JSON.stringify(await tw('tw0')));
ok('المانيكان يسدّ الممر إلى المحل', !(await act('A.goTile(15, 6)')));
await act('A.goTile(4, 9)'); ok('خطوات الغرب: الجدار يوقف المرآة عند المخرج', (await tw('tw0')) + '' === '15,6', JSON.stringify(await tw('tw0')));
await walk([[5, 9], [6, 9], [7, 9], [8, 9]]); ok('أربع خطوات شرقاً: المرآة تحت الكوّة', (await tw('tw0')) + '' === '11,6', JSON.stringify(await tw('tw0')));
await walk([[8, 8]]); ok('خطوة شمالاً: المانيكان في الكوّة', (await tw('tw0')) + '' === '11,5' && !!(await st()).flags.niche); await shot('of-2');
await walk([[8, 7], [8, 6]]); await act('A.goTile(2, 6)'); ok('نجمة الممر', (await st()).stars >= 1 && (await tw('tw0')) + '' === '11,5');
await page.evaluate(() => window.__adv.tapTile(16, 6)); await sleep(2500); await act('Promise.resolve()');
ok('٢. دخول محل الخيّاط', (await st()).area === 'tailor' && await at(6, 11), JSON.stringify((await st()).h));
ok('زجاج العرض مغلق', await page.evaluate(() => window.__adv.blockedAt(7, 2)));
const SEQ = [[5, 11], [4, 11], [4, 10], [4, 9], [4, 8], [4, 7], [4, 6], [4, 5], [4, 4], [4, 3], [5, 3], [4, 3], [5, 3]];   // من حلّال المحل: غغ ش×٨ ق غ ق
await walk(SEQ.slice(0, 2)); ok('المرآة تخطو شرقاً حين تخطو غرباً، والنسخة غرباً', (await tw('tm')) + '' === '6,6' && (await tw('tc')) + '' === '7,6', JSON.stringify([await tw('tm'), await tw('tc')]));
await walk(SEQ.slice(2)); await act('new Promise(r => setTimeout(r, 600))');
ok('كل مانيكان على منصته', (await tw('tm')) + '' === '6,3' && (await tw('tc')) + '' === '9,3', JSON.stringify([await tw('tm'), await tw('tc')])); await shot('of-3');
ok('٣. انفتح زجاج العرض', !!(await st()).flags.open && !(await page.evaluate(() => window.__adv.blockedAt(7, 2))));
const reach = async (x, y) => { for (let k = 0; k < 6 && !(await at(x, y)); k++) { await act(`A.goTile(${x}, ${y})`); if (!(await at(x, y))) await act("A.use('reset')"); } };   // المانيكانان قد يسدّان الطريق: الذراع تعيدهما
await reach(1, 3); await reach(12, 3); ok('نجمتا المحل', (await st()).stars >= 3, String((await st()).stars));
await act('A.goTile(7, 2)'); await act("A.use('prize')"); ok('المفتاح', (await st()).inv.key === 1);
await page.evaluate(() => window.__adv.tapTile(6, 12)); await sleep(2500); await act('Promise.resolve()');
ok('العودة إلى السوق', (await st()).area === 'souq');
await act('A.goTile(16, 10)'); ok('النجوم الأربع', (await st()).stars === 4);
page.evaluate("window.__do(A => A.tapEnt('thuwaini'))").catch(() => {});
await page.waitForFunction(() => !!document.querySelector('.advEnd'), null, { timeout: 90000 }).catch(() => {});
ok('٤. انفتحت بوابة السوق وبطاقة المكافآت', await page.evaluate(() => !!document.querySelector('.advEnd'))); await shot('of-4');
await page.click('.advEnd [data-home]').catch(() => {}); await sleep(800);
const rec = await page.evaluate(() => ({ adv: window.__villages.state.vil.adv, badge: !!((window.__villages.state.vil.badges || {}).offersHero) }));
ok('النتيجة محفوظة والوسام ممنوح', !!(rec.adv && rec.adv.offers) && rec.badge, JSON.stringify(rec));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
