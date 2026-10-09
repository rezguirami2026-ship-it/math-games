// لقطات الدليل التشغيلي: صور حقيقية عالية الدقة من اللعبة، مع مواضع الأزرار لتُرقَّم في الدليل.
// الاستعمال (الخادم المحلي على 8000): node shots.mjs <مجلد الإخراج>
import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const marks = {};
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist'] });
async function open(q, { w = 1280, h = 720, mobile = false, clear = true } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1.5, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage(); page.on('pageerror', e => console.log('  [خطأ]', e.message));
  await page.goto('http://localhost:8000/' + q); if (clear) { await page.evaluate(() => localStorage.clear()); await page.reload(); }
  return page;
}
const ready = async page => { await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 120000 }); await sleep(2500);
  for (let i = 0; i < 40; i++) { const busy = await page.evaluate(() => { const c = document.querySelector('.screen.on.chapter'); if (c) { c.click(); return true; } const d = document.getElementById('dialog'); if (d.classList.contains('on')) { d.click(); return true; } return false; }); if (!busy && i > 3) break; await sleep(350); } await sleep(1200); };
async function shot(page, name, sels = []) {
  await sleep(500);
  marks[name] = await page.evaluate(sels => sels.map(([n, s]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { n, x: r.x, y: r.y, w: r.width, h: r.height, W: innerWidth, H: innerHeight }; }).filter(Boolean), sels);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 88 });
  console.log('📸', name, marks[name].length);
}
const ev = (page, fn, a) => page.evaluate(fn, a);
const panel = page => ev(page, () => { document.getElementById('panel').classList.remove('on'); document.getElementById('panel').innerHTML = ''; window.__game.game.busy = false; });

// ── أ. جهاز جديد: الفيديو التعريفي، الشاشة الرئيسية، اختيار البطل، أول مهمة ──
{
  const p = await open(''); await sleep(3000);
  await ev(p, async () => (await import('/ui/introvideo.js')).showIntroVideo({ first: false })); await sleep(1500);
  await shot(p, 'video', [['1', '.ividPlay'], ['2', '.ividGo']]);
  await ev(p, () => document.querySelector('.ivid')?.remove());
  await shot(p, 'home', [['1', '#bNew'], ['2', '[data-p="les"]'], ['3', '[data-p="ach"]'], ['4', '[data-p="me"]'], ['5', '#bVid'], ['6', '#bCode']]);
  await p.click('#bNew'); await sleep(1500);
  await ev(p, () => { const i = document.getElementById('hname'); i.value = 'سالم'; });
  await shot(p, 'hero', [['1', '.pcard[data-k="boy"]'], ['2', '.pcard[data-k="girl"]'], ['3', '#skins'], ['4', '#cols'], ['5', '#hname'], ['6', '#bGo']]);
  await p.click('#bGo'); await sleep(2500);
  await shot(p, 'chapter');
  await ready(p);
  // المهمة الأولى: الحديث مع العم سالم ثم حمل صناديق
  await ev(p, () => { const g = window.__game, n = g.W.npcs.find(n => n.id === 'salem'), pl = g.W.player; pl.x = n.x; pl.y = n.y + 26; pl.route = null; pl.target = null; }); await sleep(1500);
  await shot(p, 'world-start', [['1', '#lvlPill'], ['2', '#goodPill'], ['3', '#gemPill'], ['4', '#bBag'], ['5', '#bMap'], ['6', '#bAch'], ['7', '#objective'], ['8', '#actions']]);
  await ev(p, () => { const b = [...document.querySelectorAll('#actions button')].find(b => b.textContent.startsWith('💬')); if (b) b.click(); }); await sleep(1200);
  await shot(p, 'dialog', [['1', '#dialog']]);
  for (let i = 0; i < 30 && await p.$('#dialog.on'); i++) { await ev(p, () => document.getElementById('dialog').click()); await sleep(250); }
  await ev(p, () => { const pl = window.__game.W.player; pl.x = 140; pl.y = 568; pl.route = null; }); await sleep(1200);
  for (let i = 0; i < 2; i++) { await ev(p, () => { const b = [...document.querySelectorAll('#actions button')].find(b => b.textContent.startsWith('📦 احمل')); if (b) b.click(); }); await sleep(400); }
  await shot(p, 'mission', [['1', '#objective'], ['2', '#actions']]);
  await p.context().close();
}
// ── ب. لوحة الدليل الآلي (الجولة التعريفية) ──
{
  const p = await open('?tour=1'); await sleep(2500); await p.click('#bNew'); await sleep(800); await ev(p, () => { document.getElementById('hname').value = 'سالم'; }); await p.click('#bGo');
  await p.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 120000 });
  for (let i = 0; i < 60 && !(await p.$('.tour')); i++) { await ev(p, () => { const s = document.querySelector('.screen.on.chapter'); if (s) s.click(); const d = document.getElementById('dialog'); if (d.classList.contains('on')) d.click(); }); await sleep(400); }
  for (let k = 0; k < 3; k++) { await ev(p, () => document.querySelector('.tour [data-next]').click()); await sleep(500); }
  await shot(p, 'tour'); await p.context().close();
}
// ── ج. المعاينة (كل شيء مفتوح): العالم والواجهات واللوحات ──
{
  const p = await open('?preview=1'); await ready(p);
  await ev(p, () => { const s = window.__game.state; s.hero.name = 'سالم'; s.gems = 180; s.good = 240; s.decor = s.decor || {}; ['swing', 'fountain', 'camel', 'statue', 'bell', 'anchor', 'sundisk', 'festlamp', 'minilight', 'cairn', 'qindeel', 'astrolabe', 'cooler'].forEach(k => s.decor[k] = 1); });
  const go = async (x, y, wait = 3500) => { await ev(p, ([x, y]) => { const pl = window.__game.W.player; pl.x = x; pl.y = y; pl.route = null; pl.target = null; }, [x, y]); await sleep(wait); };
  await go(1110, 640); await shot(p, 'world-3d');
  await go(1240, 2940); await shot(p, 'festival');
  await go(1100, 3330); await shot(p, 'datayard');
  await go(900, 2020); await shot(p, 'fort');
  await go(2520, 380); await shot(p, 'harbor');
  // الخريطة
  await ev(p, () => document.getElementById('bMap').click()); await sleep(1500); await shot(p, 'map', [['1', '#wmap'], ['2', '#qlog']]); await panel(p);
  // الحقيبة
  await ev(p, () => document.getElementById('bBag').click()); await sleep(900);
  await shot(p, 'bag', [['1', '#decoBtn'], ['2', '#advBtn'], ['3', '#giveBtn'], ['4', '#wardBtn'], ['5', '#sndBtn'], ['6', '#musBtn'], ['7', '#codeBtn']]);
  await ev(p, () => { document.querySelector('#panel .sheet').scrollTop = 9999; }); await sleep(600);
  await shot(p, 'bag2', [['1', '#tourBtn'], ['2', '#vidBtn'], ['3', '#aboutBtn'], ['4', '#supBtn'], ['5', '#d3Btn'], ['6', '#qBtn']]);
  await ev(p, () => document.getElementById('codeBtn').click()); await sleep(1200); await shot(p, 'code', [['1', '#codeBox'], ['2', '#copyBtn']]); await panel(p);
  // الأوسمة والمستويات
  await ev(p, () => document.getElementById('bAch').click()); await sleep(1200); await shot(p, 'achievements'); await panel(p);
  // متجر الزينة
  await ev(p, async () => (await import('/world/decor.js')).openDecorShop()); await sleep(1200); await shot(p, 'decor'); await panel(p);
  // صندوق الخير
  await ev(p, async () => (await import('/ui/charity.js')).openCharity()); await sleep(600); await ev(p, () => document.querySelector('#panel [data-give="water"]').click()); await sleep(800);
  await shot(p, 'charity'); await panel(p);
  await go(1240, 640, 2500); await shot(p, 'square-decor');
  // خزانة البطل
  await ev(p, () => { const s = window.__game.state; ['crown', 'bisht', 'glasses', 'cane'].forEach(k => s.gear.worn[k] = true); s.gear.owned.massarRed = 1; s.gear.worn.massarRed = true; s.gear.owned.shoeBlue = 1; s.gear.worn.shoeBlue = true; });
  await ev(p, async () => (await import('/ui/wardrobe.js')).openWardrobe()); await sleep(3500); await shot(p, 'wardrobe', [['1', '#wardPrev'], ['2', '.gitem.on']]);
  await ev(p, () => { document.querySelector('#panel .sheet').scrollTop = 1500; }); await sleep(1500); await shot(p, 'wardrobe2');
  await ev(p, () => document.getElementById('wardOut').click()); await sleep(300);
  await go(1110, 640, 3000); await shot(p, 'hero-dressed');
  // تحدي الشخصية (نشاط الدرس): خطأ ثم التلميح
  await ev(p, () => window.__game.activity('placeValue')); await sleep(800); await ev(p, () => document.getElementById('acGo').click()); await sleep(1200);
  await shot(p, 'challenge', [['1', '#panel .chOpt']]);
  await ev(p, () => { const r = window.__game.state.activities.placeValue.run, it = r.ch.items[r.ch.i]; const o = document.querySelectorAll('#panel .chOpt, #panel .chMc, #panel .chStep'); if (it.type === 'choice' || it.type === 'tf') o[it.ans === 0 ? 1 : 0].click(); }); await sleep(1200);
  await shot(p, 'challenge-hint', [['1', '#benchMsg']]); await panel(p);
  // حول اللعبة والدعم الفني
  await ev(p, async () => (await import('/ui/opsui.js')).openAbout()); await sleep(1000); await shot(p, 'about'); await panel(p);
  await ev(p, async () => (await import('/ui/opsui.js')).openSupport()); await sleep(1000); await shot(p, 'support'); await panel(p);
  // المغامرات
  await ev(p, async () => (await import('/adventure/index.js')).openAdventures()); await sleep(1200); await shot(p, 'adv-list', [['1', '[data-hall]'], ['2', '.advCard']]); await panel(p);
  const adv = async (id, area, x, y, name, sels) => {
    await ev(p, async id => { window.__adv = null; (await import('/adventure/index.js')).playAdventure(id); }, id); await p.waitForFunction(() => window.__adv, null, { timeout: 30000 }); await sleep(2500);
    for (let i = 0; i < 40; i++) { const on = await ev(p, () => { const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); return true; } return false; }); if (!on && i > 6) break; await sleep(300); }
    if (area) { await ev(p, ([a, x, y]) => { window.__adv.goto(a, x, y); }, [area, x, y]); await sleep(2500); for (let i = 0; i < 20 && await p.$('.advDlg.on'); i++) { await ev(p, () => document.querySelector('.advDlg.on')?.click()); await sleep(250); } }
    await sleep(1200); await shot(p, name, sels);
  };
  await adv('castle', null, 0, 0, 'adv-castle', [['1', '.advTitle'], ['2', '.advStars'], ['3', '.advLogB'], ['4', '.advHintB'], ['5', '.advX']]);
  await ev(p, () => document.querySelector('.advLogB').click()); await sleep(800); await shot(p, 'adv-log'); await ev(p, () => document.querySelector('.advLogB').click());
  await ev(p, () => window.__adv.tapEnt('harith')); await sleep(1500); await shot(p, 'adv-dialog'); await ev(p, () => document.querySelector('.advX').click()); await sleep(800);
  await adv('mountain', 'canyon', 6, 15, 'adv-mountain'); await ev(p, () => document.querySelector('.advX').click()); await sleep(800);
  await adv('lighthouse', null, 0, 0, 'adv-lighthouse'); await ev(p, () => document.querySelector('.advX').click()); await sleep(800);
  await adv('oldcity', 'temple', 14, 15, 'adv-temple'); await ev(p, () => document.querySelector('.advX').click()); await sleep(800);
  // قاعة الأبطال والاحتفال والشهادة
  await ev(p, () => { const s = window.__game.state; s.adventures = {}; ['rescue', 'storm', 'island', 'oldcity', 'lanterns', 'lighthouse', 'desert', 'mountain', 'castle'].forEach((k, i) => s.adventures[k] = { done: true, best: [5, 5, 4, 5, 5, 5, 4, 5, 5][i] }); s.gear.worn.medal = false; s.grandSeen = 0; });
  await ev(p, async () => (await import('/adventure/hall.js')).openHall()); await sleep(1800); await shot(p, 'hall');
  await ev(p, async () => { document.querySelector('.hall')?.remove(); (await import('/adventure/hall.js')).grandCelebration(); }); await sleep(13000); await shot(p, 'grand');
  await ev(p, () => document.querySelector('.grand [data-cert]').click()); await sleep(1500); await shot(p, 'certificate');
  await p.context().close();
}
// ── د. المقارنة: المكان نفسه بالعرضين، والمغامرة نفسها بالعرضين ──
{
  const p = await open('?preview=1&2d=1'); await ready(p);
  await ev(p, () => { const pl = window.__game.W.player; pl.x = 1110; pl.y = 640; pl.route = null; }); await sleep(3000); await shot(p, 'world-2d');
  await ev(p, () => { const pl = window.__game.W.player; pl.x = 1100; pl.y = 3330; pl.route = null; }); await sleep(3000); await shot(p, 'datayard-2d');
  await ev(p, async () => { window.__adv = null; (await import('/adventure/index.js')).playAdventure('mountain'); }); await p.waitForFunction(() => window.__adv, null, { timeout: 30000 }); await sleep(2500);
  for (let i = 0; i < 20 && await p.$('.advDlg.on'); i++) { await ev(p, () => document.querySelector('.advDlg.on')?.click()); await sleep(250); }
  await ev(p, () => { window.__adv.goto('canyon', 6, 15); }); await sleep(2500); for (let i = 0; i < 20 && await p.$('.advDlg.on'); i++) { await ev(p, () => document.querySelector('.advDlg.on')?.click()); await sleep(250); }
  await sleep(1000); await shot(p, 'adv-mountain-2d');
  await p.context().close();
}
// ── هـ. الهاتف ──
{
  const p = await open('?preview=1', { w: 390, h: 844, mobile: true }); await ready(p);
  await ev(p, () => { const pl = window.__game.W.player; pl.x = 1110; pl.y = 640; pl.route = null; }); await sleep(3000); await shot(p, 'phone-world');
  await ev(p, () => document.getElementById('bBag').click()); await sleep(900); await shot(p, 'phone-bag');
  await p.context().close();
}
fs.writeFileSync(`${OUT}/marks.json`, JSON.stringify(marks, null, 1));
await b.close();
console.log('done');
