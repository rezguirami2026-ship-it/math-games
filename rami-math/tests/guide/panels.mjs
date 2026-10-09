// لقطات اللوحات كاملة (بلا قصّ): نافذة طويلة، واللوحة بلا حدّ ارتفاع، ثم لقطة العنصر نفسه. المواضع نسبةً إلى اللوحة.
// الاستعمال: node panels.mjs <مجلد img>  (يُحدّث marks.json)
import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms));
const MF = `${OUT}/marks.json`, marks = fs.existsSync(MF) ? JSON.parse(fs.readFileSync(MF, 'utf8')) : {};
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 1000, height: 2400 }, deviceScaleFactor: 2 });
const p = await ctx.newPage(); p.on('pageerror', e => console.log('  [خطأ]', e.message));
await p.goto('http://localhost:8000/?preview=1'); await p.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 120000 }); await sleep(3000);
for (let i = 0; i < 30; i++) { const on = await p.evaluate(() => { const d = document.getElementById('dialog'); if (d.classList.contains('on')) { d.click(); return true; } return false; }); if (!on && i > 3) break; await sleep(300); }
await p.addStyleTag({ content: '#panel .sheet{max-height:none!important;overflow:visible!important} #panel{align-items:flex-start!important;overflow:visible!important} .toast,.region{display:none!important}' });
const ev = (fn, a) => p.evaluate(fn, a);
await ev(() => { const s = window.__game.state; s.hero.name = 'سالم'; s.gems = 180; s.good = 240; ['crown', 'bisht', 'glasses', 'cane'].forEach(k => s.gear.worn[k] = true); s.gear.owned.massarRed = 1; s.gear.worn.massarRed = true; s.gear.owned.shoeBlue = 1; s.gear.worn.shoeBlue = true; });
const close = () => ev(() => { const el = document.getElementById('panel'); el.classList.remove('on'); el.innerHTML = ''; window.__game.game.busy = false; });
async function shot(name, sel, sels = [], wait = 900) {
  await sleep(wait); const el = await p.$(sel); if (!el) { console.log('✗', name); return; }
  marks[name] = await ev(([sel, sels]) => { const R = document.querySelector(sel).getBoundingClientRect(); return sels.map(([n, s]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { n, x: r.x - R.x, y: r.y - R.y, w: r.width, h: r.height, W: R.width, H: R.height }; }).filter(Boolean); }, [sel, sels]);
  await el.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 90 }); console.log('📸', name, marks[name].length);
}
const S = '#panel .sheet';
await ev(() => document.getElementById('bMap').click()); await shot('map', '#wmap', [], 1500); await close();
await ev(() => document.getElementById('lvlPill').click()); await shot('level', S, [], 1000); await close();
await ev(() => document.getElementById('bBag').click());
await shot('bag', S, [['1', '#decoBtn'], ['2', '#advBtn'], ['3', '#giveBtn'], ['4', '#wardBtn'], ['5', '#sndBtn'], ['6', '#musBtn'], ['7', '#codeBtn'], ['8', '#tourBtn'], ['9', '#vidBtn'], ['10', '#aboutBtn'], ['11', '#supBtn'], ['12', '#d3Btn'], ['13', '#qBtn']]);
await ev(() => document.getElementById('codeBtn').click()); await shot('code', S, [['1', '#codeBox'], ['2', '#copyBtn']], 1300); await close();
await ev(() => document.getElementById('bAch').click()); await sleep(800); await ev(() => document.querySelectorAll('#panel .bdGrid .bd').forEach((b, i) => { if (i >= 12) b.style.display = 'none'; })); await shot('achievements', '#panel .bdGrid', [], 600); await close();
await ev(async () => (await import('/world/decor.js')).openDecorShop()); await shot('decor', S); await close();
await ev(async () => (await import('/ui/charity.js')).openCharity()); await sleep(400); await ev(() => document.querySelector('#panel [data-give="water"]').click()); await shot('charity', S, [['1', '.chTop'], ['2', '.chThanks'], ['3', '[data-give="iftar"]']]); await close();
await ev(async () => (await import('/ui/wardrobe.js')).openWardrobe()); await shot('wardrobe', S, [['1', '#wardPrev'], ['2', '.wardCount'], ['3', '.wardGems'], ['4', '.gitem.on'], ['5', '[data-buy]']], 3500);
await ev(() => document.getElementById('wardOut').click()); await sleep(300);
await p.setViewportSize({ width: 1000, height: 640 });
await ev(() => window.__game.activity('placeValue')); await sleep(800); await ev(() => document.getElementById('acGo').click());
await shot('challenge', S, [['1', '#panel .chOpt']], 1300);
await ev(() => { const r = window.__game.state.activities.placeValue.run, it = r.ch.items[r.ch.i]; const o = document.querySelectorAll('#panel .chOpt'); if (o.length && (it.type === 'choice' || it.type === 'tf')) o[it.ans === 0 ? 1 : 0].click(); });
await shot('challenge-hint', S, [['1', '#benchMsg']], 1200); await close();
await p.setViewportSize({ width: 1000, height: 2400 });
await ev(async () => (await import('/ui/opsui.js')).openAbout()); await shot('about', S); await close();
await ev(async () => (await import('/ui/opsui.js')).openSupport()); await shot('support', S); await close();
await ev(async () => (await import('/adventure/index.js')).openAdventures()); await shot('adv-list', S, [['1', '[data-hall]'], ['2', '.advCard.open']]); await close();
fs.writeFileSync(MF, JSON.stringify(marks, null, 1));
await b.close(); console.log('done');
