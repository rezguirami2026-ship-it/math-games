// لقطات الميزات الجديدة للدليل (الإصدار 1.19): الاحتفال والسلسلة وسؤال الكنز، بيت البطل، ألعاب الساحة، سهيل، الأحداث والليل، الألبوم والألقاب.
// الاستعمال: node shots3.mjs <مجلد img>  (يضيف إلى marks.json)
import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms));
const MF = `${OUT}/marks.json`, marks = JSON.parse(fs.readFileSync(MF, 'utf8'));
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist'] });
async function open(q, tall) {
  const ctx = await b.newContext({ viewport: { width: tall ? 1000 : 1280, height: tall ? 2400 : 720 }, deviceScaleFactor: tall ? 2 : 1.5 }); const p = await ctx.newPage(); p.on('pageerror', e => console.log('  [خطأ]', e.message));
  await p.goto('http://localhost:8000/' + q); await p.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 120000 }); await sleep(3000);
  for (let i = 0; i < 30; i++) { const on = await p.evaluate(() => { const d = document.getElementById('dialog'); if (d.classList.contains('on')) { d.click(); return true; } return false; }); if (!on && i > 3) break; await sleep(300); }
  await p.addStyleTag({ content: '.toast,.region{display:none!important}' + (tall ? '#panel .sheet{max-height:none!important;overflow:visible!important} #panel{align-items:flex-start!important;overflow:visible!important}' : '') });
  await p.evaluate(() => { const s = window.__game.state; s.hero.name = 'سالم'; s.gems = 400; s.good = 300; });
  return p;
}
const ev = (p, fn, a) => p.evaluate(fn, a);
const close = p => ev(p, () => { const el = document.getElementById('panel'); el.classList.remove('on'); el.innerHTML = ''; window.__game.game.busy = false; });
async function full(p, name, sel, sels = [], wait = 900) {
  await sleep(wait); const el = await p.$(sel); if (!el) return console.log('✗', name);
  marks[name] = await ev(p, ([sel, sels]) => { const R = document.querySelector(sel).getBoundingClientRect(); return sels.map(([n, s]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { n, x: r.x - R.x, y: r.y - R.y, w: r.width, h: r.height, W: R.width, H: R.height }; }).filter(Boolean); }, [sel, sels]);
  await el.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 90 }); console.log('📸', name);
}
async function shot(p, name, sels = [], wait = 500) {
  await sleep(wait); marks[name] = await ev(p, sels => sels.map(([n, s]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { n, x: r.x, y: r.y, w: r.width, h: r.height, W: innerWidth, H: innerHeight }; }).filter(Boolean), sels);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 88 }); console.log('📸', name);
}
// ── لوحات كاملة (طويلة) ──
{
  const p = await open('?preview=1', true), S = '#panel .sheet';
  await ev(p, () => document.getElementById('bBag').click());
  await full(p, 'bag', S, [['1', '#albumBtn'], ['2', '#miniBtn'], ['3', '#homeBtn'], ['4', '#giveBtn'], ['5', '#wardBtn'], ['6', '#advBtn'], ['7', '#decoBtn'], ['8', '#petDecBtn'], ['9', '#codeBtn'], ['10', '#tourBtn'], ['11', '#vidBtn'], ['12', '#supBtn'], ['13', '#d3Btn']]); await close(p);
  await ev(p, () => { const s = window.__game.state; s.home = { items: {} }; }); await ev(p, async () => (await import('/ui/herohome.js')).openHome(() => {}));
  for (const id of ['rug', 'cushions', 'dallah', 'lamp']) { await ev(p, id => document.querySelector(`#panel [data-buy="${id}"]`)?.click(), id); await sleep(150); }
  await full(p, 'home-majlis', S, [['1', '.hmTop'], ['2', '.hmTabs'], ['3', '#hmCv'], ['4', '.hmItems']]);
  await ev(p, () => document.querySelector('#panel [data-r="library"]').click()); await sleep(200); for (const id of ['shelf', 'desk', 'globe']) { await ev(p, id => document.querySelector(`#panel [data-buy="${id}"]`)?.click(), id); await sleep(150); }
  await full(p, 'home-library', '#hmCv', []);
  await ev(p, () => document.querySelector('#panel [data-r="roof"]').click()); await sleep(200); for (const id of ['lights', 'scope', 'flag', 'seat']) { await ev(p, id => document.querySelector(`#panel [data-buy="${id}"]`)?.click(), id); await sleep(150); }
  await full(p, 'home-roof', '#hmCv', []); await close(p);
  await ev(p, async () => (await import('/ui/minigames.js')).openMiniGames()); await full(p, 'mini-hub', S, []); await close(p);
  await ev(p, async () => (await import('/ui/minigames.js')).openPetDecor()); await ev(p, () => document.querySelector('#panel [data-buy="gold"]')?.click()); await sleep(200); await full(p, 'pet-decor', S, []); await close(p);
  await ev(p, () => { const s = window.__game.state, t0 = Date.now() - 40 * 864e5; let k = 0; for (const id in s.quests.done) s.quests.done[id] = t0 + (k++) * 13 * 36e5; s.world.visited = { market: t0 + 5 * 864e5, harbor: t0 + 10 * 864e5, fort: t0 + 15 * 864e5 }; s.adventures = { rescue: { done: true, best: 5, at: t0 + 6 * 864e5 }, storm: { done: true, best: 4, at: t0 + 12 * 864e5 } }; s.treasure = {}; for (let i = 1; i <= 9; i++) s.treasure['t' + i] = 1; s.title = 'treasure'; });
  await ev(p, async () => (await import('/ui/album.js')).openAlbum()); await sleep(800);
  await ev(p, () => { document.querySelectorAll('#panel .alCard').forEach((c, i) => { if (i >= 6) c.style.display = 'none'; }); }); await full(p, 'album', '#panel .alGrid', []);
  await full(p, 'titles', '#panel .alTitles', []); await close(p);
  await p.context().close();
}
// ── لقطات الشاشة ──
{
  const p = await open('?preview=1');
  // السلسلة وسؤال الكنز
  await ev(p, async () => { const { runChallenge } = await import('/missions/challenge.js'); const m = window.__game.MODS.placeValue; let items = []; for (let k = 0; k < 40 && items.length < 8; k++) items.push(...m.challenge.make().filter(i => i.type === 'choice' && !i.why)); items = items.slice(0, 8); window.__d = { ch: { items, i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 } }; runChallenge(window.__game.W, window.__d, { id: 'placeValue', who: m.challenge.who, title: 'تحدي الشخصية', make: m.challenge.make, exit: () => {} }); });
  for (let i = 0; i < 8; i++) { await p.waitForFunction(i => { const sh = document.querySelector('#panel .chSheet'); return sh && +sh.dataset.i === i && !sh.querySelector('.chBurst'); }, i, { timeout: 15000 });
    if (i === 7) await shot(p, 'treasure-q', [], 300);
    await ev(p, () => { const it = window.__d.ch.items[window.__d.ch.i]; document.querySelectorAll('#panel .chOpt')[it.ans].click(); }); if (i === 2) { await p.waitForSelector('#panel .chBurst', { timeout: 4000 }).catch(() => console.log('no burst')); await ev(p, () => document.getAnimations().forEach(a => { try { a.pause(); const d = +a.effect.getTiming().duration || 800; a.currentTime = d * .4; } catch (e) {} })); await shot(p, 'streak', [], 60); } }
  await sleep(1500); await close(p);
  // احتفال القرية
  await ev(p, () => { const pl = window.__game.W.player; pl.x = 1110; pl.y = 600; }); await sleep(2500);
  await ev(p, async () => (await import('/core/events.js')).bus.emit('lessonDone', 'placeValue')); await shot(p, 'cheer', [], 900);
  // ألعاب الساحة
  await ev(p, async () => (await import('/ui/minigames.js')).openMiniGames()); await sleep(300);
  const solveQ = () => ev(p, () => { const t = document.querySelector('#panel .mgQ').textContent.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('اصطد السمكة:', '').replace('= ؟', '').trim(); let v; if (t.startsWith('نصف')) v = +t.replace('نصف', '') / 2; else { const m = t.match(/(\d+)\s*([×÷+−])\s*(\d+)/); const a = +m[1], c = +m[3]; v = { '×': a * c, '÷': a / c, '+': a + c, '−': a - c }[m[2]]; } [...document.querySelectorAll('#panel [data-v]')].find(x => +x.dataset.v === v).click(); });
  await ev(p, () => document.querySelector('#panel [data-g="race"]').click()); await sleep(300); for (let i = 0; i < 3; i++) { await solveQ(); await sleep(250); } await shot(p, 'mini-race', [], 700);
  await close(p); await ev(p, async () => (await import('/ui/minigames.js')).openMiniGames()); await ev(p, () => document.querySelector('#panel [data-g="fish"]').click()); await shot(p, 'mini-fish', [], 1200);
  await close(p); await ev(p, async () => (await import('/ui/minigames.js')).openMiniGames()); await ev(p, () => document.querySelector('#panel [data-g="dates"]').click()); await shot(p, 'mini-dates', [], 600); await close(p);
  // بيت البطل من الخارج، واللقب، والمتجولون
  await ev(p, () => { document.querySelectorAll('.opsModal,.advUnlock').forEach(m => m.remove()); const s = window.__game.state; s.title = 'treasure'; const pl = window.__game.W.player; pl.x = 1375; pl.y = 380; }); await sleep(1500); await ev(p, () => document.querySelectorAll('.opsModal,.advUnlock').forEach(m => m.remove())); await shot(p, 'home-outside', [], 1500);
  await ev(p, () => { const pl = window.__game.W.player; pl.x = 1100; pl.y = 640; }); await shot(p, 'crowd-title', [], 2500);
  await p.context().close();
}
// ── الليل: الزائر والراوي والأسرار ──
{
  const p = await open('?preview=1&night=1');
  await ev(p, () => { window.__game.state.events = { done: {}, secrets: {}, nights: {} }; const pl = window.__game.W.player; pl.x = 1110; pl.y = 610; }); await shot(p, 'night', [], 2800);
  await ev(p, async () => (await import('/ui/events.js')).openTeller()); await shot(p, 'teller', [], 600); await close(p);
  for (const k of ['merchant', 'fisher', 'wedding']) { await ev(p, async k => { const E = await import('/ui/events.js'); const real = window.__realNow || (window.__realNow = Date.now); let d = 0; while (E.todayEvent() !== k && d < 5) { d++; Date.now = () => real() + d * 864e5; } window.__game.state.events.done = {}; E.openVisitor(); }, k); await shot(p, 'event-' + k, [], 700); await close(p); }
  await ev(p, async () => { const E = await import('/ui/events.js'), x = E.SECRETS[0], pl = window.__game.W.player; pl.x = x.x + 70; pl.y = x.y + 30; }); await shot(p, 'secret', [], 2500);
  await p.context().close();
}
fs.writeFileSync(MF, JSON.stringify(marks, null, 1));
await b.close(); console.log('done');
