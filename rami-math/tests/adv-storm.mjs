// اختبار «العاصفة الكبرى» كاملة بالنقر كاللاعب: node adv-storm.mjs [مجلد اللقطات] [--3d]
import { openAdventure, sleep } from './adv-lib.mjs';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const T = await openAdventure('storm', { d3 }); const { ok, tap, go, st, ev, shot } = T;
const pos = id => ev(id => { const e = window.__adv.ent(id); return e ? [e.x, e.y] : null; }, id);
await shot(out, 'st-1');
ok('البداية: السوق تحت المطر، والهدف الأول', (await st()).area === 'market' && /مبارك/.test((await st()).goal), (await st()).goal);
await sleep(200); await tap('mubarak'); ok('١. الحديث مع النجار مبارك (والريح تهب)', !!(await st()).flags.met);
// الريح: البطل في الساحة المكشوفة يُدفع غرباً أثناء الهبّة، وخلف صندوق لا يُدفع
const push = await ev(async () => { const A = window.__adv; A.tp(18, 15); const x0 = A.hero().x; await new Promise(r => setTimeout(r, 7600)); return [x0, A.hero().x]; });
ok('الريح تدفع البطل في الساحة المكشوفة', push[1] < push[0], JSON.stringify(push));
const shel = await ev(async () => { const A = window.__adv; A.tp(13, 8); const x0 = A.hero().x; await new Promise(r => setTimeout(r, 7600)); return [x0, A.hero().x]; });
ok('خلف الصندوق يحتمي البطل من الريح', shel[1] === shel[0], JSON.stringify(shel));
await ev(() => { window.__adv.S.flags.nowind = 1; });
for (const p of ['pl1', 'pl2', 'pl3']) { const e = await pos(p); await go(e[0], e[1]); }
ok('٢. جمع ٣ ألواح', (await st()).inv.plank === 3, JSON.stringify((await st()).inv));
await tap('umkhalid'); ok('٣. أم خالد وطفلاها يتبعونك', !!(await st()).flags.leading && await ev(() => ['umkhalid', 'salim', 'hind'].every(id => window.__adv.ent(id).follow)));
await shot(out, 'st-2');
await go(4, 7); await sleep(2000); await T.act('Promise.resolve()');
ok('٤. قيادتهم إلى الملجأ', !!(await st()).flags.sheltered, JSON.stringify(await ev(() => ['umkhalid', 'salim', 'hind'].map(id => { const e = window.__adv.ent(id); return [e.x, e.y]; }))));
await go(23, 10); await tap('b1'); await tap('b2'); await tap('b3');
ok('٥. إصلاح الجسر بالنقر على الماء', !!(await st()).flags.bridge && await ev(() => window.__adv.tileAt(26, 10) === '='));
await shot(out, 'st-3');
await go(29, 10); await sleep(1500); await T.act('Promise.resolve()');
ok('٦. العبور إلى الوادي', (await st()).area === 'valley');
await tap('juma'); ok('٧. الحديث مع الراعي جمعة', !!(await st()).flags.juma);
const hit = await ev(async () => { const A = window.__adv, h = A.ent('rk1'); A.tp(Math.round(h.px), Math.round(h.py)); await new Promise(r => setTimeout(r, 2500)); return A.hero(); });
ok('الصخرة المتدحرجة تعيدك إلى النار الآمنة', hit.x <= 3, JSON.stringify(hit));
await ev(() => { window.__adv.S.flags.invisible = 1; });
for (const g of ['g1', 'g2', 'g3']) { await tap(g); await go(4, 12); await go(4, 15); await sleep(900); await go(4, 12); }
ok('٨. الماعز الثلاث في الحظيرة', await ev(() => ['g1', 'g2', 'g3'].every(g => window.__adv.S.flags['pen_' + g])), JSON.stringify(await ev(() => Object.keys(window.__adv.S.flags).filter(k => k.startsWith('pen')))));
await shot(out, 'st-4');
for (const v of ['v1', 'v2', 'v3']) for (let i = 0; i < 4 && !(await ev(v => window.__adv.ent(v).r === window.__adv.ent('vm').r, v)); i++) await tap(v);
await sleep(700);
ok('٩. لغز الدوّارات يفتح البوابة', !!(await st()).flags.vanes && await ev(() => window.__adv.ent('gtower').open));
for (const [x, y] of [[28, 20], [4, 15], [27, 2]]) await go(x, y);
await shot(out, 'st-5');
await tap('bell'); await sleep(1500); await T.page.evaluate(() => document.querySelector('.advEnd')?.style.setProperty('display', 'none')); await sleep(1500); await shot(out, 'st-rainbow'); await T.page.evaluate(() => document.querySelector('.advEnd')?.style.removeProperty('display'));
ok('١٠. الجرس: تهدأ العاصفة، وتنتهي المغامرة', !!(await T.page.$('.advEnd')));
await shot(out, 'st-6');
ok('النجوم المخفية', (await st().catch(() => ({ stars: -1 }))).stars >= 0);
await T.done();
