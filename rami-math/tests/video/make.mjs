// مخرج الفيديو التعريفي: يصوّر مشاهد حقيقية من اللعبة بوقت افتراضي (٣٠ لقطة/ث)، مع ترجمة الكلام وصورة المتكلم، ثم يركّب الصوت.
// الاستعمال (الخادم المحلي على 8000):  python voice.py <OUT>/voice  ثم  node make.mjs <OUT> [scene,scene…]
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2], ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const FPS = 30, DT = 1000 / FPS, LEAD = .7, GAP = .45, TAIL = .9, W = 1280, H = 720;
const SCRIPT = JSON.parse(fs.readFileSync(path.join(HERE, 'script.json'), 'utf8'));
const TIMING = JSON.parse(fs.readFileSync(path.join(OUT, 'voice', 'timing.json'), 'utf8'));
fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── الجدول الزمني: بداية كل سطر داخل مشهده، ومدة كل مشهد، وموضع كل صوت في الفيديو كله ──
let clock = 0; const PLAN = SCRIPT.scenes.map(sc => {
  let t = LEAD; const lines = sc.lines.map(([who, text], i) => { const d = TIMING.find(x => x.scene === sc.id && x.i === i).dur, l = { who, text, start: t, dur: d }; t += d + GAP; return l; });
  const dur = +Math.max(sc.hold || 0, t - GAP + TAIL).toFixed(3), p = { id: sc.id, label: sc.label, lines, dur, at: clock }; clock += dur; return p;
});
fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify({ total: clock, scenes: PLAN, audio: PLAN.flatMap(p => p.lines.map((l, i) => ({ file: path.join(OUT, 'voice', `${p.id}_${i}.mp3`), at: +(p.at + l.start).toFixed(3) }))) }, null, 1));
console.log('المدة الكلية', clock.toFixed(1), 'ث');

const b = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] });
async function session(url) {
  const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage();
  page.on('pageerror', e => console.log('  [خطأ الصفحة]', e.message));
  await page.addInitScript({ path: path.join(HERE, 'vtime.js') });
  await page.addInitScript(() => { window.__vt.start(); });   // الوقت افتراضي من أول لحظة
  await page.goto('http://localhost:8000/'); await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:8000/' + url);
  const P = { page, overlay: false };
  P.ev = (fn, arg) => page.evaluate(fn, arg);
  P.skip = async sec => { for (let i = 0; i < Math.round(sec * FPS); i++) await page.evaluate(dt => window.__vt.step(dt), DT); };
  P.until = async (fn, what, max = 60) => { for (let i = 0; i < max * FPS / 3; i++) { if (await page.evaluate(fn)) return; await page.evaluate(dt => { for (let k = 0; k < 3; k++) window.__vt.step(dt); }, DT); await sleep(5); } throw new Error('انتهت المهلة: ' + what); };
  P.reload = async () => { await page.goto('http://localhost:8000/' + url); P.overlay = false; if (P.ready) await P.ready(); };
  P.overlayOn = async () => { if (!P.overlay) { await page.addScriptTag({ path: path.join(HERE, 'overlay.js') }); P.overlay = true; await P.skip(.3); } };
  return P;
}
let frameNo = 0;
async function scene(P, id, run, extra = {}) {
  const plan = PLAN.find(p => p.id === id); let t = 0;
  if (ONLY && !ONLY.includes(id)) { frameNo += Math.round(plan.dur * FPS); return; }   // تخطي مشهد: نحفظ ترقيم اللقطات
  await P.overlayOn();
  const spec = Object.assign({ label: plan.label, lines: plan.lines, dur: plan.dur, first: plan === PLAN[0], last: plan === PLAN[PLAN.length - 1] }, extra);
  await P.ev(s => window.__vo.scene(s), spec);
  const end = Math.round(plan.dur * FPS); let n = 0;
  const cap = {
    get t() { return n / FPS; }, left: () => (end - n) / FPS, dur: plan.dur,
    // لقطات لمدة sec، و perFrame (اختياري) يُنفَّذ في الصفحة قبل كل خطوة مع زمن المشهد
    shoot: async (sec, perFrame, arg) => { const k = Math.min(end - n, Math.round(sec * FPS));
      for (let i = 0; i < k; i++, n++) {
        if (perFrame) await P.ev(perFrame, { t: n / FPS, i, arg });
        await P.ev(([dt, t]) => { window.__vt.step(dt); window.__vo.frame(t); }, [DT, n / FPS]);
        await P.page.screenshot({ path: path.join(OUT, 'frames', `f${String(frameNo++).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 88 });
      } },
    // لقطات حتى يتحقق شرط (أو تنفد مدة المشهد)
    shootUntil: async (cond, max = 8, perFrame, condArg) => { for (let k = 0; k < max * FPS && n < end; k++) { if (k % 3 === 0 && await P.ev(cond, condArg)) return true; await cap.shoot(1 / FPS, perFrame); } return false; },
    fill: async perFrame => cap.shoot(cap.left(), perFrame),
    reload: async () => { await P.reload(); await P.overlayOn(); await P.ev(s => window.__vo.scene(s), spec); }
  };
  const t0 = Date.now(); await run(cap); await cap.fill();
  console.log(`✅ ${id}: ${plan.dur.toFixed(1)} ث (${end} لقطة) في ${((Date.now() - t0) / 1000).toFixed(0)} ث`);
}

// ═════ التحضير: جلستان — A لعبة جديدة (الشاشة الرئيسية والمهمة الأولى)، وB معاينة بكل شيء مفتوح ═════
const needA = !ONLY || ONLY.includes('hero') || ONLY.includes('mission');
const A = needA ? await session('') : null;
if (A) await A.until(() => !!document.querySelector('#bNew'), 'الشاشة الرئيسية');
const B = await session('?preview=1');
B.ready = async () => { await B.until(() => !!(window.__game && window.__game.W), 'عالم المعاينة'); await B.skip(2); await B.ev(() => { const s = window.__game.state; s.hero.name = 'سالم'; s.hero.kind = 'boy'; s.gems = 350; s.adventures = {}; s.grandSeen = 0;
  s.decor = s.decor || {}; ['swing', 'fountain', 'camel', 'statue', 'bell', 'anchor', 'sundisk', 'festlamp', 'minilight', 'cairn', 'qindeel', 'astrolabe'].forEach(k => s.decor[k] = 1);
  for (let i = 0; i < 12 && document.getElementById('dialog').classList.contains('on'); i++) document.getElementById('dialog').click(); }); };
await B.ready();
const focus = (x, y) => B.ev(([x, y]) => { window.__game.eng.focus = { x, y }; }, [x, y]);
const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
// تحليق الكاميرا بين نقطتين خلال sec
const glide = (cap, a, bb, sec) => cap.shoot(sec, ({ i, arg }) => { const [a, b, n] = arg, k = Math.min(1, i / n), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; window.__game.eng.focus = { x: a[0] + (b[0] - a[0]) * e, y: a[1] + (b[1] - a[1]) * e }; }, [a, bb, Math.round(sec * FPS)]);

// ═════ ٠. صفحة الإعداد: صورة المعلم وشعارا المدرسة والوزارة (الصور من مجلد المعلم، تُحقن أثناء التصوير ولا تُحفظ في المستودع) ═════
{
  const DL = process.env.CRED_DIR || path.join(OUT, '..', 'cred');   // me.jpg و school.png و moe.png (الشعاران مقصوصان بلا هوامش)
  const data = f => `data:image/${f.endsWith('.png') ? 'png' : 'jpeg'};base64,` + fs.readFileSync(path.join(DL, f)).toString('base64');
  const img = { me: data('me.jpg'), school: data('school.png'), moe: data('moe.png') };
  if (!ONLY || ONLY.includes('credits')) { await B.overlayOn(); await B.ev(i => window.__vo.credits(i), img); await B.skip(.3); }
  await scene(B, 'credits', async cap => { await cap.fill(); }, { credits: true, hud: false });
}

// ═════ ١. المقدمة: بطاقة العنوان فوق القرية ═════
await focus(760, 640); await B.skip(1);
await scene(B, 'intro', async cap => { await glide(cap, [700, 600], [980, 760], cap.dur); }, { hud: false, title: { sub: 'لعبة رياضيات الصف السادس · سلطنة عُمان' } });

// ═════ ٢. اختيار البطل (الجلسة A) ═════
await scene(A, 'hero', async cap => {
  await cap.shoot(1.6);
  await A.ev(() => document.getElementById('bNew').click()); await cap.shoot(1.6);
  await A.ev(() => document.querySelector('.pcard[data-k="girl"]').click()); await cap.shoot(1.1);
  await A.ev(() => document.querySelector('#skins button:nth-child(3)').click()); await cap.shoot(.6);
  await A.ev(() => document.querySelector('#cols button:nth-child(3)').click()); await cap.shoot(.7);
  await A.ev(() => document.querySelector('.pcard[data-k="boy"]').click()); await cap.shoot(.8);
  await A.ev(() => document.querySelector('#cols button:nth-child(1)').click()); await cap.shoot(.5);
  for (const ch of 'سالم') { await A.ev(c => { const i = document.getElementById('hname'); i.value += c; i.dispatchEvent(new Event('input')); }, ch); await cap.shoot(.28); }
}, { capTop: true });

// ═════ ٣. جولة في العالم (B) ═════
const STOPS = [['🏡 قرية الخير', [760, 700]], ['🛒 السوق الأسبوعي', [1760, 330]], ['⚓ الميناء', [2520, 360]], ['🏰 القلعة', [900, 2020]], ['🎪 ساحة المهرجان', [700, 2880]], ['🏪 سوق الجمعية', [760, 3820]], ['🐪 طريق القافلة', [900, 4880]], ['🛠️ ورشة البنّاء', [900, 5860]]];
{
  const plan = PLAN.find(p => p.id === 'world'), seg = plan.dur / STOPS.length, chips = [], dips = [];
  STOPS.forEach(([name], i) => { chips.push({ from: i * seg + .25, to: (i + 1) * seg - .2, text: name }); if (i >= 3) dips.push(i * seg); });
  await focus(...STOPS[0][1]); await B.skip(.6);
  await scene(B, 'world', async cap => {
    for (let i = 0; i < STOPS.length; i++) {
      const a = STOPS[i][1], nx = STOPS[i + 1] ? STOPS[i + 1][1] : [a[0] + 200, a[1]], hop = i >= 2;   // من القلعة فصاعداً: قطع بالإظلام بدل التحليق الطويل
      if (hop || i === STOPS.length - 1) { await glide(cap, a, [a[0] + 160, a[1] + 40], seg); if (STOPS[i + 1]) await focus(...STOPS[i + 1][1]); }
      else await glide(cap, a, nx, seg);
    }
  }, { chips, dips, hud: false });
  await B.ev(() => { window.__game.eng.focus = null; });
}

// ═════ ٤. المهمة الأولى (A): شحنة الآلاف ═════
if (A) {
await A.ev(() => { if (!document.getElementById('bGo')) document.getElementById('bNew').click(); });
await A.skip(.5);
await A.ev(() => { const i = document.getElementById('hname'); if (!i.value) i.value = 'سالم'; document.getElementById('bGo').click(); });
await A.until(() => !!(window.__game && window.__game.W), 'عالم اللعبة الجديدة', 90);
for (let i = 0; i < 40; i++) { await A.ev(() => { const s = document.querySelector('.screen.on.chapter'); if (s) s.click(); const d = document.getElementById('dialog'); if (d.classList.contains('on')) d.click(); }); await A.skip(.4); }
// الحديث مع العم سالم يبدأ المهمة (خارج التصوير)
await A.ev(() => { const g = window.__game, n = g.W.npcs.find(n => n.id === 'salem'), p = g.W.player; p.x = n.x; p.y = n.y + 26; p.route = null; p.target = null; });
await A.skip(.5);
await A.ev(() => { const b = [...document.querySelectorAll('#actions button')].find(b => b.textContent.startsWith('💬')); if (b) b.click(); });
for (let i = 0; i < 40; i++) { await A.ev(() => { const d = document.getElementById('dialog'); if (d.classList.contains('on')) d.click(); }); await A.skip(.35); }
}
const PILES = [[140, 568, '١٠٠٠'], [205, 568, '١٠٠'], [265, 568, '١٠'], [320, 568, '١']], CART = [520, 572];
const walk = (x, y) => A.ev(([x, y]) => window.__game.eng.onTap({ x, y }), [x, y]);
const NEAR = ([x, y]) => { const p = window.__game.W.player; return Math.hypot(p.x - x, p.y - y) < 14 && !p.target && !(p.route && p.route.length); };
const press = (label, prefix) => A.ev(([l, pf]) => { const b = [...document.querySelectorAll('#actions button')].find(b => !b.disabled && (pf ? b.textContent.startsWith(l) : b.textContent === l)); if (b) b.click(); return !!b; }, [label, !!prefix]);
await scene(A, 'mission', async cap => {
  const v = await A.ev(() => window.__game.quests.data('placeValue').rounds[0]), dg = [Math.floor(v / 1000), Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];
  await cap.shoot(.8);
  for (let k = 0; k < 4 && cap.left() > 1.5; k++) {
    if (!dg[k]) continue;
    const [x, y, lbl] = PILES[k]; await walk(x, y); await cap.shootUntil(NEAR, 5, null, [x, y]);
    for (let j = 0; j < dg[k]; j++) { await press('📦 احمل صندوق ' + lbl); await cap.shoot(.35); }
    await walk(CART[0], CART[1]); await cap.shootUntil(NEAR, 5, null, CART);
    await press('⬇ ضع على العربة'); await cap.shoot(.6);
  }
  if (cap.left() > 1) { await press('🚚 أرسل الشحنة'); }
}, { capTop: true });

if (A) { await A.page.context().close(); }   // تحرير ذاكرة الجلسة الأولى
// ═════ ٥. تحدي الشخصية (B): نشاط الدرس بخطأ ثم صواب ═════
const openAct = async () => { for (let tries = 0; tries < 12; tries++) {
  await B.ev(() => { document.getElementById('panel').classList.remove('on'); window.__game.game.busy = false; window.__game.activity('placeValue'); });
  await B.skip(.4); await B.ev(() => document.getElementById('acGo') && document.getElementById('acGo').click()); await B.skip(.6);
  const ok = await B.ev(() => { const r = window.__game.state.activities.placeValue.run; const it = r && r.ch.items[r.ch.i]; return !!it && (it.type === 'choice' || it.type === 'tf'); });
  if (ok) return; } };
await openAct();
await scene(B, 'challenge', async cap => {
  const pick = right => B.ev(rt => { const r = window.__game.state.activities.placeValue.run, it = r.ch.items[r.ch.i]; const k = rt ? it.ans : (it.ans === 0 ? 1 : 0); document.querySelectorAll('#panel .chOpt')[k].click(); }, right);
  await cap.shoot(2.4); await pick(false); await cap.shoot(3); await pick(true); await cap.shoot(3.2);
  for (let r = 0; r < 3 && cap.left() > 2; r++) { const t = await B.ev(() => { const r = window.__game.state.activities.placeValue.run, it = r && r.ch.items[r.ch.i]; return it ? it.type : ''; });
    if (t === 'choice' || t === 'tf') { await cap.shoot(1.4); await pick(true); await cap.shoot(1.8); } else break; }
});
await B.ev(() => { document.getElementById('panel').classList.remove('on'); document.getElementById('panel').innerHTML = ''; window.__game.game.busy = false; });

// ═════ ٦. الخريطة (B) ═════
await scene(B, 'map', async cap => {
  await B.ev(() => document.getElementById('bMap').click()); await cap.shoot(2.2);
  await cap.fill(({ i }) => { const s = document.querySelector('#panel .sheet'); if (s) s.scrollTop += 7; });
});
await B.ev(() => { document.getElementById('panel').classList.remove('on'); window.__game.game.busy = false; });

// ═════ ٧. الجواهر والزينة والخزانة والجمل والكنوز (B) ═════
await scene(B, 'extras', async cap => {
  await B.ev(async () => (await import('/world/decor.js')).openDecorShop()); await cap.shoot(1.6);
  await cap.shoot(2.4, () => { const s = document.querySelector('#panel .sheet'); if (s) s.scrollTop += 6; });
  await B.ev(() => { document.getElementById('panel').classList.remove('on'); window.__game.game.busy = false; });
  // من الحقيبة إلى خزانة البطل كما يفعل الطالب، ثم ارتداء الوشاح
  await B.ev(() => { const s = window.__game.state; ['bag', 'flask', 'cape', 'gold', 'shovel'].forEach(k => s.gear.owned[k] = 1); document.getElementById('bBag').click(); });
  await cap.shoot(1.1, () => { const b = document.getElementById('wardBtn'); if (b) b.scrollIntoView({ block: 'center' }); });
  await B.ev(() => document.getElementById('wardBtn').click()); await cap.shoot(1.4);
  await B.ev(() => { const b = document.querySelector('#panel [data-g="cape"]'); if (b) b.click(); }); await cap.shoot(1.6);
  await B.ev(() => { const o = document.getElementById('wardOut'); if (o) o.click(); window.__game.game.busy = false; });
  // ساحة القرية بزينتها، والبطل يمشي ومعه الجمل
  await B.ev(() => { const p = window.__game.W.player; p.x = 960; p.y = 520; p.route = null; window.__game.eng.focus = null; window.__game.eng.onTap({ x: 1240, y: 520 }); });
  await cap.fill();
});

// ═════ ٨. المستويات والأوسمة (B) ═════
await scene(B, 'badges', async cap => {
  await B.ev(() => document.getElementById('bAch').click()); await cap.shoot(1.2);
  await cap.fill(() => { const s = document.querySelector('#panel .sheet'); if (s) s.scrollTop += 9; });
});
await B.ev(() => { document.getElementById('panel').classList.remove('on'); window.__game.game.busy = false; });

// ═════ ٩. المغامرات التسع (B): لقطة من كل مغامرة ═════
const ADV = [['rescue', '🏘️ إنقاذ القرية'], ['storm', '🌪️ العاصفة الكبرى'], ['island', '🏝️ الجزيرة المفقودة'], ['oldcity', '🏛️ سر المدينة القديمة'], ['lanterns', '🏮 فوانيس المهرجان'], ['lighthouse', '🗼 الفنار والضباب'], ['desert', '🏜️ مهمة في الصحراء'], ['mountain', '⛰️ قمة جبل شمس'], ['castle', '🏰 القلعة المظلمة']];
{
  const plan = PLAN.find(p => p.id === 'adventures'), first = 3.2, seg = (plan.dur - first) / ADV.length;
  const chips = ADV.map(([, n], i) => ({ from: first + i * seg + .2, to: first + (i + 1) * seg - .15, text: n })), dips = ADV.map((_, i) => first + i * seg);
  const openAdv = async (id, cap) => {
    await cap.reload();
    await B.ev(async id => { window.__adv = null; (await import('/adventure/index.js')).playAdventure(id); }, id);
    await B.until(() => !!window.__adv, 'فتح المغامرة', 30);
    for (let i = 0; i < 30; i++) { await B.ev(() => { const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) d.click(); }); await B.skip(.25); }
    await B.ev(() => { const A = window.__adv, h = A.hero(); A.tapTile(h.x + 4, h.y); });
  };
  // اللقطة الأولى: لوحة المغامرات، ثم كل مغامرة
  await scene(B, 'adventures', async cap => {
    await B.ev(async () => (await import('/adventure/index.js')).openAdventures()); await cap.shoot(first - .1);
    await B.ev(() => { document.getElementById('panel').classList.remove('on'); document.getElementById('panel').innerHTML = ''; });
    for (const [id] of ADV) { await openAdv(id, cap); await cap.shoot(seg); }
  }, { chips, dips });
  await B.reload();
}

// ═════ ١٠. قاعة الأبطال والاحتفال الكبير (B) ═════
await B.ev(() => { const s = window.__game.state; s.adventures = {}; ['rescue', 'storm', 'island', 'oldcity', 'lanterns', 'lighthouse', 'desert', 'mountain', 'castle'].forEach((k, i) => s.adventures[k] = { done: true, best: [5, 5, 4, 5, 5, 5, 4, 5, 5][i] }); s.gear.worn.medal = false; });
await scene(B, 'hall', async cap => {
  await B.ev(async () => (await import('/adventure/hall.js')).openHall()); await cap.shoot(1.6);
  await cap.shoot(1.6, () => { const h = document.querySelector('.hall'); if (h) h.scrollTop += 5; });
  await B.ev(async () => { document.querySelector('.hall')?.remove(); (await import('/adventure/hall.js')).grandCelebration(); });
  await B.skip(4.4);   // سطور «في قرية الخير…» خارج التصوير، والأوسمة تطير أمام الكاميرا
  await cap.shoot(cap.left() - 1.2);
  await B.ev(() => { const w = document.querySelector('.grand [data-wear]'); if (w) w.click(); });
});
await B.ev(() => { const h = document.querySelector('.grand [data-home]'); if (h) h.click(); }); await B.skip(.8);

// ═════ ١١. الخاتمة ═════
await focus(1000, 640); await B.skip(.5);
await scene(B, 'outro', async cap => { await glide(cap, [1000, 640], [1100, 560], cap.dur); }, { hud: false, title: { sub: 'تعلّم بالمرح · بلا مؤقت ولا عقاب', cta: '▶ هيا نبدأ المغامرة!', cheer: true } });

console.log('اللقطات', frameNo);
await b.close();
