// اختبار «فوانيس المهرجان» كاملة بالنقر كاللاعب (ومنها حوار الاختيار): node adv-lanterns.mjs [مجلد اللقطات] [--3d]
import { openAdventure, sleep } from './adv-lib.mjs';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const T = await openAdventure('lanterns', { d3 }); const { ok, tap, go, st, ev, shot, page } = T;
const pos = id => ev(id => { const e = window.__adv.ent(id); return e ? [e.x, e.y] : null; }, id);
const val = (id, k) => ev(([id, k]) => (window.__adv.ent(id) || {})[k], [id, k]);
await shot(out, 'la-1');
ok('البداية في الساحة المظلمة', (await st()).area === 'square' && /شيخة/.test((await st()).goal), (await st()).goal);
await tap('shaikha'); ok('١. الحديث مع الجدة شيخة', !!(await st()).flags.met);
ok('الترتر مخفي قبل إضاءة الكشّاف', await val('sq1', 'hidden'));
await tap('lv_blue'); await sleep(900); ok('رافعة بترتيب خاطئ تُعاد بهدوء', !(await st()).flags.spot && !(await val('lv_blue', 'on')));
await tap('lv_red'); await tap('lv_blue'); await tap('lv_green'); await sleep(500);
ok('٢. ألوان الراية تضيء الكشّاف وتكشف الترتر', !!(await st()).flags.spot && !(await val('sq1', 'hidden')));
await shot(out, 'la-2');
for (const p of ['sq1', 'sq2', 'sq3']) { const e = await pos(p); await go(e[0], e[1]); }
ok('٣. آثار الترتر الثلاثة', (await st()).inv.sequin === 3);
for (const [x, y] of [[2, 2], [27, 20]]) await go(x, y);
await go(29, 10); await sleep(1500); await T.act('Promise.resolve()');
ok('٤. دخول الأزقة', (await st()).area === 'alleys');
await shot(out, 'la-3');
const seen = await ev(async () => { const A = window.__adv, g = A.ent('w1'); A.tp(Math.round(g.px) + 2, Math.round(g.py)); g.ang = 0; g.pause = 3; await new Promise(r => setTimeout(r, 2600)); return A.hero(); });
ok('الحارس الليلي يعيدك إلى مكان آمن', seen.x <= 2 && seen.y === 10, JSON.stringify(seen));
const hid = await ev(async () => { const A = window.__adv, g = A.ent('w1'); A.tp(14, 11); g.px = 11; g.py = 11; g.ang = 0; g.pause = 3; await new Promise(r => setTimeout(r, 1500)); return A.hero(); });
ok('العشب الطويل يخفيك عن الحارس', hid.x === 14 && hid.y === 11, JSON.stringify(hid));
await ev(() => { window.__adv.S.flags.invisible = 1; });
await go(10, 4); ok('٥. الوصول إلى الغرفة الشمالية', (await st()).goal && !/تسلّل/.test((await st()).goal));
await go(1, 1);
await tap('b1'); await sleep(500); await tap('b2'); await sleep(900);
ok('٦. الصندوقان يفتحان بوابة الحديقة', !!(await st()).flags.plates && !!(await val('gGate', 'open')));
await shot(out, 'la-4');
// حوار الاختيار: الكلمة القاسية لا تتقدم، والسؤال اللطيف يكمل القصة
await page.evaluate(() => window.__adv.tapEnt('ziyad'));
let picked = [];
for (let i = 0; i < 200 && !(await st()).flags.talked; i++) {
  const opts = await page.$$eval('.advDlg.on [data-o]', bs => bs.map(b => b.textContent));
  if (opts.length) { const want = picked.length === 0 ? 0 : opts.findIndex(o => /لماذا/.test(o)); picked.push(want); await page.click(`.advDlg.on [data-o="${want}"]`); }
  else await page.evaluate(() => document.querySelector('.advDlg.on')?.click());
  await sleep(200);
}
ok('٧. حوار زياد: القسوة لا تنفع، والسؤال بلطف يكشف القصة', !!(await st()).flags.talked && picked.length === 2, JSON.stringify(picked));
await tap('granny'); ok('٨. الجدة تعطيك الفوانيس الخمسة', (await st()).inv.lantern === 5);
await shot(out, 'la-5');
for (const [x, y] of [[28, 12], [27, 19]]) await go(x, y);
await go(0, 10); await sleep(1500); await T.act('Promise.resolve()');
ok('العودة إلى الساحة', (await st()).area === 'square');
for (const p of ['lp1', 'lp2', 'lp3', 'lp4']) await tap(p);
ok('أربعة فوانيس معلّقة', await ev(() => ['lp1', 'lp2', 'lp3', 'lp4'].every(id => window.__adv.ent(id).lit)));
await page.evaluate(() => window.__adv.tapEnt('lp5'));
for (let i = 0; i < 120 && !(await page.$('.advEnd')); i++) { await page.evaluate(() => document.querySelector('.advDlg.on')?.click()); await sleep(250); }
ok('٩. الفانوس الخامس: ألعاب نارية وتنتهي المغامرة', !!(await page.$('.advEnd')));
ok('النجوم الخمس', /٥ من ٥/.test(await page.textContent('.advEnd').catch(() => '')), await page.textContent('.advEndStars').catch(() => ''));
await shot(out, 'la-6');
await T.done();
