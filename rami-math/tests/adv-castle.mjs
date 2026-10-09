// اختبار «القلعة المظلمة» كاملة بالنقر كاللاعب (ومنها حوار الاختيار والاحتفال): node adv-castle.mjs [مجلد اللقطات] [--3d]
import { openAdventure, sleep } from './adv-lib.mjs';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const T = await openAdventure('castle', { d3 }); const { ok, tap, go, tile, st, ev, shot, page } = T;
const pos = id => ev(id => { const e = window.__adv.ent(id); return e ? [e.x, e.y] : null; }, id);
const val = (id, k) => ev(([id, k]) => (window.__adv.ent(id) || {})[k], [id, k]);
await shot(out, 'ca-1');
ok('البداية عند سفح القلعة', (await st()).area === 'foot' && /الحارث/.test((await st()).goal), (await st()).goal);
await tap('harith'); ok('١. الشيخ الحارث يعطيك الشعلة', !!(await st()).flags.met && !!(await st()).inv.torch);
await tap('mubarak'); ok('٢. النجار مبارك ينتظر الألواح', !!(await st()).flags.mub);
const seen = await ev(async () => { const A = window.__adv, g = A.ent('gA'); A.tp(Math.round(g.px) + 2, Math.round(g.py)); const p0 = A.hero(); g.ang = 0; g.pause = 3; await new Promise(r => setTimeout(r, 2600)); return [p0, A.hero()]; });
ok('حارس الظلال يعيدك بهدوء إلى مكان آمن', seen[0].x !== seen[1].x || seen[0].y !== seen[1].y, JSON.stringify(seen));
const hid = await ev(async () => { const A = window.__adv, g = A.ent('gA'); A.tp(4, 12); g.px = 2; g.py = 12; g.ang = 0; g.pause = 3; await new Promise(r => setTimeout(r, 1500)); return A.hero(); });
ok('العشب الطويل يخفيك عن الحارس', hid.x === 4 && hid.y === 12, JSON.stringify(hid));
await ev(() => { window.__adv.S.flags.invisible = 1; });
for (const p of ['pk1', 'pk2', 'pk3']) { const e = await pos(p); await go(e[0], e[1]); }
ok('٣. ألواح الجسر الثلاثة', (await st()).inv.plank === 3);
for (const [x, y] of [[1, 20], [28, 9]]) await go(x, y);
await go(15, 8); await tap('br2'); ok('الجسر يُبنى من الأقرب', !(await val('br2', 'built')));
await tap('br1'); await tap('br2'); await tap('br3');
ok('٤. إصلاح الجسر فوق الخندق', !!(await st()).flags.bridge && await ev(() => window.__adv.tileAt(15, 5) === '='));
await tap('bc1'); ok('المجمرة لا تشتعل بشعلة مطفأة', !(await val('bc1', 'lit')));
await tap('camp'); ok('٥. إشعال الشعلة من نار المخيم', !!(await st()).inv.fire);
await tap('bc1'); await tap('bc2'); await sleep(600);
ok('٦. المجمرتان تفتحان بوابة القلعة', !!(await st()).flags.gate && !!(await val('gate', 'open')));
await shot(out, 'ca-2');
await go(15, 0); await sleep(1500); await T.act('Promise.resolve()');
ok('٧. دخول ساحة القلعة', (await st()).area === 'court');
await tap('ziyad'); ok('زياد في القفص قبل اللوحين', !(await st()).flags.ziyad);
await tap('b1'); await sleep(500); await tap('b2'); await sleep(900);
ok('٨. الصندوقان يفتحان القفص', !!(await st()).flags.cage && !!(await val('cage', 'open')));
await tap('ziyad'); ok('٩. زياد حرّ ويخبرك بالرموز', !!(await st()).flags.ziyad);
for (const [x, y] of [[28, 20], [1, 10]]) await go(x, y);
await shot(out, 'ca-3');
await tap('m1'); await sleep(500); ok('المرآة الأولى وحدها لا تكفي', !(await st()).flags.moon);
await tap('m2'); await sleep(700); ok('١٠. شعاع القمر يصل البلّورة', !!(await st()).flags.moon);
await sleep(600); ok('باب البرج ينفتح', !!(await val('tdoor', 'open')));
await shot(out, 'ca-4');
await go(15, 0); await sleep(1500); await T.act('Promise.resolve()');
ok('١١. الصعود إلى البرج', (await st()).area === 'tower');
await tap('throne'); ok('باب العرش مقفل قبل الرموز', !(await val('throne', 'open')));
const sol = { t1: 2, t2: 1, t3: 0 };
for (const t of ['t1', 't2', 't3']) for (let i = 0; i < 5 && (await val(t, 'sym')) !== sol[t]; i++) await tap(t);
await sleep(800); ok('١٢. رموز الذكريات تفتح باب العرش', !!(await st()).flags.code && !!(await val('throne', 'open')));
await go(24, 1);
await tap('lamp'); ok('المنارة تحتاج القنديل', !(await st()).flags.done);
await page.evaluate(() => window.__adv.tapEnt('dhafer'));
let picked = [];
for (let i = 0; i < 200 && !(await st()).flags.truth; i++) {
  const opts = await page.$$eval('.advDlg.on [data-o]', bs => bs.map(b => b.textContent));
  if (opts.length) { const want = picked.length === 0 ? 0 : opts.findIndex(o => /لماذا/.test(o)); picked.push(want); await page.click(`.advDlg.on [data-o="${want}"]`); }
  else await page.evaluate(() => document.querySelector('.advDlg.on')?.click());
  await sleep(200);
}
ok('١٣. حوار سيد الظلال: القوة لا تنفع، والسؤال يكشف سرّه', !!(await st()).flags.truth && picked.length === 2 && !!(await st()).inv.qindeel, JSON.stringify(picked));
await shot(out, 'ca-5');
await page.evaluate(() => window.__adv.tapEnt('lamp'));
let party = false;
for (let i = 0; i < 160 && !(await page.$('.advEnd')); i++) {
  if (!party) party = await ev(() => window.__adv.area === 'foot' && !window.__adv.ent('f_dhafer').hidden && !window.__adv.ent('f_saif').hidden && window.__adv.ent('gA').hidden);
  if (party && i % 8 === 4 && out) await shot(out, 'ca-6');
  await page.evaluate(() => document.querySelector('.advDlg.on')?.click()); await sleep(250);
}
ok('١٤. الاحتفال: كل الأصدقاء وظافر عند المخيم والحراس رحلوا', party);
ok('١٥. القنديل في المنارة ينهي المغامرة الكبرى', !!(await page.$('.advEnd')));
ok('النجوم الخمس', /٥ من ٥/.test(await page.textContent('.advEnd').catch(() => '')), await page.textContent('.advEndStars').catch(() => ''));
await shot(out, 'ca-7');
await T.done();
