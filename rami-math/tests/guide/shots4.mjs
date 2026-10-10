// لقطات ميزات الإصدار 1.20 للدليل: المراجعة الذكية و«كيف نحلّها؟»، خريطة إتقاني، هدف الأسبوع، المواسم، الجواهر الطائرة، والحقيبة الجديدة.
// الاستعمال: node shots4.mjs <مجلد img>  (يضيف إلى marks.json)
import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms));
const MF = `${OUT}/marks.json`, marks = JSON.parse(fs.readFileSync(MF, 'utf8'));
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist'] });
async function open(q, tall) {
  const ctx = await b.newContext({ viewport: { width: tall ? 1000 : 1280, height: tall ? 2400 : 720 }, deviceScaleFactor: tall ? 2 : 1.5 }); const p = await ctx.newPage(); p.on('pageerror', e => console.log('  [خطأ]', e.message));
  await p.goto('http://localhost:8000/' + q); await p.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 120000 }); await sleep(3000);
  for (let i = 0; i < 30; i++) { const on = await p.evaluate(() => { const d = document.getElementById('dialog'); if (d.classList.contains('on')) { d.click(); return true; } return false; }); if (!on && i > 3) break; await sleep(300); }
  await p.addStyleTag({ content: '.toast,#toast,.region{display:none!important}' + (tall ? '#panel .sheet{max-height:none!important;overflow:visible!important} #panel{align-items:flex-start!important;overflow:visible!important}' : '') });
  await p.evaluate(() => { const s = window.__game.state, L = ['placeValue', 'compareRound', 'factorsMultiples', 'oddEven', 'primeNumbers', 'powerOf10', 'multiplyStrategies', 'decimalAdd', 'division1', 'sequences', 'lengthMeasure', 'lineDrawing', 'timeTables', 'calendars', 'areaPerimeterT1', 'shapesIdentify', 'shapes3D', 'nets', 'triangleAngles', 'translation'];
    s.hero.name = 'سالم'; s.gems = 120; s.good = 300; s.quests.done = {}; L.forEach((id, k) => { s.quests.done[id] = Date.now() - 864e5 * (30 - k); s.quests.data[id] = Object.assign(s.quests.data[id] || {}, { stars: [3, 2, 3, 1, 3, 2][k % 6] }); });
    s.expert = { placeValue: { plays: 1, gold: true }, oddEven: { plays: 1, gold: true } }; s.mastered = 4; s.weekly = null;
    s.review = { 'compareRound|Nn11': { n: 1, b: 0, due: Date.now() - 1000 }, 'timeTables|Mt1': { n: 2, b: 1, due: Date.now() + 2 * 864e5 }, 'division1|Nc10': { n: 1, b: 0, due: Date.now() - 2000 } }; s.daily = null; });
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
const solve = (p, path) => ev(p, path => { const C = eval(path), it = C.items[C.i], q = s => document.querySelectorAll('#panel ' + s);
  if (it.type === 'choice' || it.type === 'tf') q('.chOpt')[it.ans].click(); else if (it.type === 'error') q('.chStep')[it.ans].click();
  else if (it.type === 'multi') { it.ans.forEach(k => q('.chOpt')[k].click()); document.getElementById('chGo').click(); }
  else if (it.type === 'order' || it.type === 'build') { it.ans.forEach(k => q('.chOpt')[k].click()); document.getElementById('chGo').click(); }
  else if (it.type === 'sort') { it.ans.forEach((bn, k) => { [...q('.chCard')].find(c => +c.dataset.k === k).click(); q('.chBin')[bn].click(); }); document.getElementById('chGo').click(); }
  else if (it.type === 'match') { it.ans.forEach((r, k) => { q('.chL')[k].click(); q('.chR')[r].click(); }); document.getElementById('chGo').click(); }
  else if (it.type === 'line') { const r = document.getElementById('chNLr'); r.value = Math.round((it.ans - it.lo) / (it.hi - it.lo) * 1000); r.oninput(); document.getElementById('chGo').click(); }
  else if (it.type === 'num') { const pd = document.querySelector('#chPad'); for (const ch of String(it.ans)) { const lab = ch === '.' ? '٫' : ch === '-' ? '−' : '٠١٢٣٤٥٦٧٨٩'[+ch]; const bt = [...pd.querySelectorAll('button')].find(x => x.textContent.trim() === lab); bt && bt.click(); } [...pd.querySelectorAll('button')].find(x => /تحقّق/.test(x.textContent)).click(); } }, path);
const waitRound = (p, i) => p.waitForFunction(i => { const sh = document.querySelector('#panel .chSheet'); return sh && +sh.dataset.i === i && !sh.querySelector('.chBurst'); }, i, { timeout: 15000 });

// ── لوحات كاملة: الحقيبة الجديدة، وخريطة إتقاني، وأعلى «رحلة الدروس» ──
{
  const p = await open('?preview=1', true), S = '#panel .sheet';
  await ev(p, () => document.getElementById('bBag').click());
  await full(p, 'bag', S, [['1', '#msBtn'], ['2', '#albumBtn'], ['3', '#miniBtn'], ['4', '#homeBtn'], ['5', '#giveBtn'], ['6', '#wardBtn'], ['7', '#advBtn'], ['8', '#decoBtn'], ['9', '#petDecBtn'], ['10', '#vocBtn'], ['11', '#codeBtn'], ['12', '#tourBtn'], ['13', '#supBtn'], ['14', '#d3Btn']]); await close(p);
  await ev(p, () => window.__game.state && import('/core/events.js').then(m => m.bus.emit('openMastery'))); await sleep(600);
  await ev(p, () => { document.querySelectorAll('#panel .msCard').forEach((c, i) => { if (i >= 4) c.style.display = 'none'; }); });   // أعلى الخريطة وأول أربعة مجالات تكفي للدليل
  await full(p, 'mastery', S, [['1', '.msRing'], ['2', '.msFacts'], ['3', '.msTips'], ['4', '.msCard.rv .msBar'], ['5', '.msCard.rv .msLessons'], ['6', '.msCard.rv .msGo']]); await close(p);
  await p.context().close();
}
{
  const p = await open('?preview=1');
  // هدف الأسبوع: ٣ من ٥ في «رحلة الدروس»
  await ev(p, () => { window.__game.state.weekly = { k: '', n: 0, got: false, wins: 0 }; });
  await ev(p, async () => { const W = await import('/missions/weekly.js'); const w = W.weekRec(); w.n = 3; });
  await ev(p, () => document.getElementById('bMap').click()); await sleep(600);
  await ev(p, () => document.querySelector('.qdaily').scrollIntoView({ block: 'start' })); await sleep(200);
  { await sleep(300); const sels = [['1', '.qdaily'], ['2', '.qweek'], ['3', '.qmastery']];   // قصّ: البطاقات الثلاث أعلى «رحلة الدروس» فقط
    const r = await ev(p, sels => { const rs = sels.map(([, s]) => document.querySelector(s).getBoundingClientRect()), x = Math.min(...rs.map(q => q.x)) - 8, y = Math.min(...rs.map(q => q.y)) - 8, x1 = Math.max(...rs.map(q => q.right)) + 8, y1 = Math.max(...rs.map(q => q.bottom)) + 8;
      return { clip: { x, y, width: x1 - x, height: y1 - y }, m: sels.map(([n], i) => ({ n, x: rs[i].x - x, y: rs[i].y - y, w: rs[i].width, h: rs[i].height, W: x1 - x, H: y1 - y })) }; }, sels);
    marks.weekly = r.m; await p.screenshot({ path: `${OUT}/weekly.jpg`, type: 'jpeg', quality: 90, clip: r.clip }); console.log('📸 weekly'); }
  await close(p);
  // مهمة اليوم تبدأ بالمراجعة
  await ev(p, () => window.__game.daily()); await sleep(900);
  await shot(p, 'review-q', [['1', '.chRvTag']], 300);
  await ev(p, () => { document.getElementById('chExit').click(); }); await sleep(300); await close(p);
  // «كيف نحلّها؟»: خطآن ثم الشرح ثم الإجابة المضيئة
  await ev(p, async () => { const { runChallenge } = await import('/missions/challenge.js'); const m = window.__game.MODS.placeValue; let it = null; for (let k = 0; k < 30 && !it; k++) it = m.challenge.make().find(i => i.type === 'choice' && /قيمة/.test(i.q));
    window.__d = { ch: { items: [it], i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 } }; runChallenge(window.__game.W, window.__d, { id: 'placeValue', who: 'salem', title: 'تحدي العم سالم', make: () => [it], exit: () => {} }); });
  await sleep(700);
  for (let k = 0; k < 2; k++) { await ev(p, () => { const it = window.__d.ch.items[0], o = document.querySelectorAll('#panel .chOpt'); o[(it.ans + 1 + (window.__k = (window.__k || 0) + 1)) % o.length].click(); }); await sleep(500); }
  await shot(p, 'how-btn', [['1', '#chHow']], 300);
  await ev(p, () => document.getElementById('chHow').click()); await sleep(2800);
  await full(p, 'howto', '.chHowBox', [['1', '.chHowStep:nth-of-type(2)'], ['2', '.chHowStep:nth-of-type(3)'], ['3', '.chHowStep.sol'], ['4', '.chHowStep:nth-of-type(5)']], 200);
  await ev(p, () => document.getElementById('chHowOk').click()); await shot(p, 'how-lit', [['1', '.chLit']], 400);
  // الجواهر الطائرة (لقطة مجمّدة)
  await ev(p, () => { window.__st = window.setTimeout; window.setTimeout = (f, ms) => window.__st(f, ms < 100 ? ms : 1e9); });
  await solve(p, 'window.__d.ch');
  await ev(p, () => new Promise(r => window.__st(() => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains('fxGem') ? 520 : 300; } catch (e) {} }); r(); }, 60)));
  await shot(p, 'fx-gems', [], 100);
  await p.context().close();
}
// ── المواسم ──
for (const [q, nm] of [['?preview=1&season=eid', 'season-eid'], ['?preview=1&season=national&2d=1', 'season-national']]) {
  const p = await open(q);
  await ev(p, () => { const s = window.__game.state; s.seasons = {}; s.decor = s.decor || {}; delete s.decor.eidStar; delete s.decor.khanjar; const pl = window.__game.W.player; pl.x = 1110; pl.y = 640; window.__game.eng.snap && window.__game.eng.snap(pl); });
  await shot(p, nm, [], 3000);
  if (nm === 'season-eid') {
    await ev(p, () => window.__game.season()); await sleep(700); await shot(p, 'season-intro', [], 300);
    await ev(p, () => document.getElementById('acGo').click()); await sleep(500);
    for (let i = 0; i < 5; i++) { await waitRound(p, i); await solve(p, 'window.__game.state.seasonRun.ch'); }
    await sleep(2600); await shot(p, 'season-end', [], 200);
  } else {
    await ev(p, () => { window.__game.state.decor.khanjar = Date.now(); const pl = window.__game.W.player; pl.x = 1330; pl.y = 600; window.__game.eng.snap && window.__game.eng.snap(pl); });
    await shot(p, 'season-prize', [], 2600);
  }
  await p.context().close();
}
fs.writeFileSync(MF, JSON.stringify(marks, null, 1));
await b.close(); console.log('done');
