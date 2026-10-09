// اختبار «الفنار والضباب» كاملة بالنقر كاللاعب: node adv-lighthouse.mjs [مجلد اللقطات] [--3d]
import { openAdventure, sleep } from './adv-lib.mjs';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const T = await openAdventure('lighthouse', { d3 }); const { ok, tap, go, st, ev, shot, page } = T;
const pos = id => ev(id => { const e = window.__adv.ent(id); return e ? [e.x, e.y] : null; }, id);
const val = (id, k) => ev(([id, k]) => (window.__adv.ent(id) || {})[k], [id, k]);
await shot(out, 'lh-1');
ok('البداية على الرصيف في الضباب', (await st()).area === 'pier' && /سيف/.test((await st()).goal), (await st()).goal);
await tap('saif'); ok('١. الحديث مع القبطان سيف', !!(await st()).flags.met);
await tap('rashid'); ok('٢. مفتاح الفنار من الحارس راشد', !!(await st()).inv.key);
const pinch = await ev(async () => { const A = window.__adv, h = A.ent('cb1'); A.tp(Math.round(h.px), Math.round(h.py)); await new Promise(r => setTimeout(r, 2400)); return A.hero(); });
ok('السرطان يعيدك إلى مكان آمن', (pinch.x === 3 && pinch.y === 11) || (pinch.x === 17 && pinch.y === 8) || (pinch.x === 4 && pinch.y === 10), JSON.stringify(pinch));
await ev(() => { window.__adv.S.flags.invisible = 1; });
for (const p of ['o1', 'o2', 'o3']) { const e = await pos(p); await go(e[0], e[1]); }
ok('٣. جرار الزيت الثلاث', (await st()).inv.oil === 3);
await tap('c_lens1'); ok('٤. العدسة الأولى', (await st()).inv.lens === 1);
await tap('b1'); await sleep(500); await tap('b2'); await sleep(900);
ok('٥. الصندوقان يفتحان المخزن', !!(await st()).flags.plates && !!(await val('sgate', 'open')));
await tap('c_lens2'); ok('٦. العدسة الثانية', (await st()).inv.lens === 2);
await shot(out, 'lh-2');
for (const [x, y] of [[1, 1], [22, 19], [11, 18]]) await go(x, y);
await tap('ldoor'); await sleep(1200); await T.act('Promise.resolve()'); ok('فتح باب الفنار بالمفتاح', (await st()).area === 'tower');

ok('٧. الصعود إلى غرفة المصباح', (await st()).area === 'tower');
await tap('lamp'); ok('٨. إشعال المصباح', !!(await st()).flags.lampOn);
await sleep(500); ok('الشعاع يرشد المركب الأول (نحو اليمين)', !!(await st()).flags.b1);
await tap('lamp'); await sleep(500); ok('المركب الثاني (نحو الأسفل)', !!(await st()).flags.b2);
await tap('lamp'); await sleep(500); ok('النافذة الثالثة لا تضيء قبل المرآة', !(await st()).flags.b3);
await tap('mw'); await sleep(600);
ok('٩. المرآة توجّه الشعاع إلى النافذة الثالثة', !!(await st()).flags.b3);
await shot(out, 'lh-3');
for (const [x, y] of [[2, 2], [19, 13]]) await go(x, y);
await go(11, 15); await sleep(1500); await T.act('Promise.resolve()');
ok('النزول إلى الرصيف والمراكب تظهر', (await st()).area === 'pier' && !(await val('boat1', 'hidden')));
await page.evaluate(() => window.__adv.tapEnt('saif'));
for (let i = 0; i < 120 && !(await page.$('.advEnd')); i++) { await page.evaluate(() => document.querySelector('.advDlg.on')?.click()); await sleep(250); }
ok('١٠. استقبال المراكب ينهي المغامرة', !!(await page.$('.advEnd')));
ok('النجوم الخمس', /٥ من ٥/.test(await page.textContent('.advEnd').catch(() => '')), await page.textContent('.advEndStars').catch(() => ''));
await shot(out, 'lh-4');
await T.done();
