// اختبار «الجزيرة المفقودة» كاملة بالنقر كاللاعب: node adv-island.mjs [مجلد اللقطات] [--3d]
import { openAdventure, sleep } from './adv-lib.mjs';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const T = await openAdventure('island', { d3 }); const { ok, tap, go, tile, st, ev, shot } = T;
const pos = id => ev(id => { const e = window.__adv.ent(id); return e ? [e.x, e.y] : null; }, id);
await shot(out, 'is-1');
ok('البداية على الشاطئ والهدف الأول', (await st()).area === 'beach' && /سيف/.test((await st()).goal), (await st()).goal);
await tap('saif'); ok('١. الحديث مع القبطان سيف', !!(await st()).flags.met);
await tap('c_wreck'); ok('٢. الساطور من صندوق الحطام', !!(await st()).inv.machete);
const bite = await ev(async () => { const A = window.__adv, h = A.ent('cb1'); A.tp(Math.round(h.px), Math.round(h.py)); await new Promise(r => setTimeout(r, 2400)); return A.hero(); });
ok('السرطان يعيدك بهدوء إلى آخر نقطة آمنة', (bite.x === 9 && bite.y === 13) || (bite.x === 6 && bite.y === 13), JSON.stringify(bite));
await ev(() => { window.__adv.S.flags.invisible = 1; });
for (const p of ['pk1', 'pk2', 'pk3']) { const e = await pos(p); await go(e[0], e[1]); }
ok('٣. جمع ٣ ألواح', (await st()).inv.plank === 3, JSON.stringify((await st()).inv));
await shot(out, 'is-2');
await go(14, 11); await tile(14, 10); await tile(14, 9);
ok('٤. شق الأدغال بالساطور بالنقر', !!(await st()).flags.cutDone);
await tap('c_hut'); ok('٥. الفانوس من الكوخ', !!(await st()).inv.lantern);
await shot(out, 'is-3');
await go(14, 0); await sleep(1500); await T.act('Promise.resolve()');
ok('٦. دخول الكهف المظلم', (await st()).area === 'cave');
await shot(out, 'is-4');
ok('الشعاع لا يصل في البداية', !(await ev(() => window.__adv.ent('cr').lit)));
for (const m of ['m1', 'm2']) { await tap(m); }
await sleep(800);
ok('٧. لغز المرايا: الشعاع يصل إلى البلّورة', !!(await st()).flags.beam && await ev(() => window.__adv.ent('door').open));
await shot(out, 'is-5');
await tap('c_sail'); ok('٨. الشراع من المخزن السري', !!(await st()).inv.sail);
for (const [x, y] of [[25, 4], [2, 14]]) await go(x, y);
await go(0, 9); await sleep(1500); await T.act('Promise.resolve()');
ok('العودة إلى الشاطئ', (await st()).area === 'beach');
for (const [x, y] of [[26, 2], [2, 17], [7, 2]]) await go(x, y);
await tap('raft'); ok('٩. بناء الطوف', !!(await st()).flags.raft);
await shot(out, 'is-6');
await tap('signal'); await sleep(1500);
ok('١٠. نار الإشارة تنهي المغامرة', !!(await T.page.$('.advEnd')));
ok('النجوم الخمس', /٥ من ٥/.test(await T.page.textContent('.advEnd').catch(() => '')), await T.page.textContent('.advEndStars').catch(() => ''));
await shot(out, 'is-7');
await T.done();
