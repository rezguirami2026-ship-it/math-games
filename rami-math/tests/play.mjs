// اختبار آلي: يلعب دروس قرية الخير بالترتيب في متصفح Chrome حقيقي.
// لكل درس: محاولة خاطئة أولاً (يجب ألا يتقدم الدرس)، ثم الحل الصحيح (يجب أن ينتهي الدرس).
// ويتحقق أيضاً من عدم وجود أخطاء في الكونسول، ومن إغلاق البوابات قبل وقتها وفتحها بعده.
// التشغيل: cd tests && npm install && npm test        (أو: node play.mjs --show لرؤية المتصفح)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHOW = process.argv.includes('--show');
const UPTO = +((process.argv.find(a => a.startsWith('--upto=')) || '').split('=')[1] || Infinity);   // للتجربة السريعة: أول N درساً فقط
const FROM = +((process.argv.find(a => a.startsWith('--from=')) || '').split('=')[1] || 0);   // التشغيل على دفعات: الدروس قبل FROM تُعلَّم منجزة ثم يبدأ الاختبار منه
const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── خادم ملفات بسيط (الوحدات لا تعمل من file://) ── */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([\\/])+/, '') || 'index.html';
  if (p === 'favicon.ico') { res.writeHead(204); return res.end(); }   // المتصفح يطلبه تلقائياً
  try { const body = await readFile(join(ROOT, p)); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, r));
const D3 = process.argv.includes('--3d');   // تشغيل الدروس نفسها على العرض ثلاثي الأبعاد
const URL_ = `http://localhost:${server.address().port}/` + (D3 ? '?3d=1' : '?2d=1');   // العرض ثلاثي الأبعاد صار الافتراضي؛ النسخة العادية تُختبر صراحةً

const browser = await chromium.launch({ channel: 'chrome', headless: !SHOW, args: D3 ? ['--use-angle=d3d11', '--ignore-gpu-blocklist'] : [] });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
await page.addInitScript(() => { setInterval(() => { const b = document.querySelector(".advUnlock [data-later]"); if (b) { window.__advUnlockSeen = (window.__advUnlockSeen || 0) + 1; b.click(); } }, 400); });   // نافذة «فُتحت مغامرة» بعد الوحدة: الاختبار يختار «لاحقاً» ويواصل
// تشخيص: كل مهمة طويلة (>200ms) في الصفحة تُسجَّل، وتُطبع عند التعليق
await page.addInitScript(() => { window.__long = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.duration > 200) window.__long.push([Math.round(e.startTime), Math.round(e.duration)]); })).observe({ type: 'longtask', buffered: true }); } catch (e) {} });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

/* ── أدوات اللعب ── */
const G = (fn, arg) => page.evaluate(fn, arg);
const data = id => G(id => window.__game.quests.data(id), id);
const isDone = id => G(id => window.__game.quests.isDone(id), id);
async function until(cond, what, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await cond()) return; await sleep(50); }
  throw new Error('انتهت المهلة: ' + what);
}
// يغلق الحوارات وبطاقات الفصول حتى تعود اللعبة حرة.
// quiet: مدة الهدوء المطلوبة، لأن بعض الدروس تفتح حوار الختام بعد انتظار قصير
async function settle(ms = 20000, quiet = 0) {
  const t0 = Date.now(); let idle = 0; const trail = [];   // سجل التحولات لتشخيص التعليق
  while (Date.now() - t0 < ms) {
    const q0 = Date.now(), tx = await G(() => { const d = document.getElementById('dialog'); return `${d.className}|${window.__game.game.busy ? 'B' : '-'}|${(d.textContent || '').trim().slice(0, 40)}`; });
    if (Date.now() - q0 > 1000) trail.push({ t: Date.now() - t0, s: `فحص بطيء ${Date.now() - q0}ms` });
    if (trail[trail.length - 1]?.s !== tx) trail.push({ t: Date.now() - t0, s: tx });
    const st = await G(() => ({ dialog: document.getElementById('dialog').classList.contains('on'), chapter: document.getElementById('screen').classList.contains('chapter'), busy: window.__game.game.busy, panel: document.getElementById('panel').classList.contains('on') }));
    if (st.dialog) await G(() => document.getElementById('dialog').click());
    else if (st.chapter) await G(() => { const s = document.getElementById('screen'); if (s.onclick) s.onclick(); });
    else if (!st.busy || st.panel) { if (!idle) idle = Date.now(); if (Date.now() - idle >= quiet) return; await sleep(120); continue; }
    idle = 0;
    await sleep(120);
  }
  const why = await G(() => ({ busy: window.__game.game.busy, dialog: document.getElementById('dialog').className, panel: document.getElementById('panel').className, screen: document.getElementById('screen').className, stones: !!window.__game.W.stones }));
  const long = await G(() => { const n = performance.now(); return window.__long.filter(([st]) => n - st < 90000).map(([st, d]) => `${Math.round((n - st) / 1000)}ث مضت: ${d}ms`); });
  throw new Error('اللعبة بقيت مشغولة ' + JSON.stringify(why) + ' — آخر التحولات: ' + trail.slice(-12).map(e => `${e.t}ms ${e.s}`).join(' ‖ ') + ' — مهام طويلة: ' + (long.join('، ') || 'لا شيء'));
}
// ينقل البطل مباشرة إلى نقطة (بدل المشي) ثم ينتظر أن تُرسم الأزرار
async function goTo(x, y) {
  await G(([x, y]) => { const p = window.__game.W.player; p.x = x; p.y = y; p.route = null; p.target = null; }, [x, y]);
  await sleep(120);
}
// يضغط زراً من أزرار الفعل بنصه الكامل (أو بدايته)
async function press(label, { prefix = false, wait = 120 } = {}) {
  let ok = false;
  for (let i = 0; i < 40 && !ok; i++) {
    ok = await G(([label, prefix]) => {
      const b = [...document.querySelectorAll('#actions button')].find(b => !b.disabled && (prefix ? b.textContent.startsWith(label) : b.textContent === label));
      if (b) b.click(); return !!b;
    }, [label, prefix]);
    if (!ok) await sleep(50);
  }
  if (!ok) throw new Error(`الزر غير موجود: «${label}» — الأزرار: ${await G(() => [...document.querySelectorAll('#actions button')].map(b => b.textContent).join(' | '))}`);
  await sleep(wait);
}
// يذهب إلى صاحب الدرس ويتحدث معه (يبدأ الدرس أو يستأنفه)
async function talk(giver) {
  const n = await G(id => { const n = window.__game.W.npcs.find(n => n.id === id); return { x: n.x, y: n.y, name: n.name }; }, giver);
  await goTo(n.x, n.y + 26);
  await press('💬 ' + n.name);
  await settle();
}
const panelClick = sel => G(sel => { const b = document.querySelector('#panel ' + sel); if (!b) throw new Error('غير موجود: ' + sel); b.click(); }, sel);

/* ── «تحدي الشخصية» (المرحلة الثانية): حل عام من بيانات الجولات نفسها، ومحاولة خاطئة في كل جولة ── */
const chClick = (sel, k) => G(([sel, k]) => { const b = document.querySelectorAll('#panel ' + sel)[k]; if (!b) throw new Error('غير موجود: ' + sel + ' #' + k); b.click(); }, [sel, k]);
async function chPad(v) {
  const s = String(+(+v).toFixed(3)).replace('-', '−');
  for (const k of [...s, 'go']) await G(k => { const b = document.querySelector(`#panel #chPad [data-k="${k}"]`); if (!b) throw new Error('مفتاح غير موجود: ' + k); b.click(); }, k);
}
async function solveRounds(getCh) {
  const items = (await getCh()).items;
  for (let i = (await getCh()).i; i < items.length; i++) {
    const it = items[i];
    // محاولة خاطئة: يجب أن تعطي تلميحاً ولا تتقدم
    if (it.type === 'choice' || it.type === 'tf') await chClick('.chOpt', it.ans === 0 ? 1 : 0);
    else if (it.type === 'multi') { await chClick('.chOpt', it.opts.findIndex((_, k) => !it.ans.includes(k))); await panelClick('#chGo'); await chClick('.chOpt', it.opts.findIndex((_, k) => !it.ans.includes(k))); }
    else if (it.type === 'order' || it.type === 'build') { for (const k of it.ans.slice().reverse()) await chClick('.chOpt', k); await panelClick('#chGo'); for (const _ of it.ans) await panelClick('#chUndo'); }
    else if (it.type === 'sort' || it.type === 'match') await panelClick('#chGo');   // قبل التوزيع: تلميح «ضع كل البطاقات»
    else if (it.type === 'num') await chPad(it.ans + 1);
    else if (it.type === 'error') await chClick('.chStep', it.ans === 0 ? 1 : 0);
    else if (it.type === 'line') { await G(v => { const r = document.querySelector('#panel #chNLr'); r.value = v; r.dispatchEvent(new Event('input')); }, (it.ans - it.lo) / (it.hi - it.lo) > .5 ? 0 : 1000); await panelClick('#chGo'); }
    else if (it.type === 'memory') { const a = 0, b = it.cards.findIndex(c => c.p !== it.cards[0].p); await chClick('.chMc', a); await chClick('.chMc', b); await sleep(1000); }
    await until(() => G(() => document.getElementById('benchMsg')?.classList.contains('bad')), `تلميح الخطأ في الجولة ${i + 1}`, 5000);
    expect((await getCh()).i === i, `الخطأ قدّم الجولة ${i + 1}`);
    // الحل
    if (it.type === 'choice' || it.type === 'tf') await chClick('.chOpt', it.ans);
    else if (it.type === 'multi') { for (const k of it.ans) await chClick('.chOpt', k); await panelClick('#chGo'); }
    else if (it.type === 'order' || it.type === 'build') { for (const k of it.ans) await chClick('.chOpt', k); await panelClick('#chGo'); }
    else if (it.type === 'sort') { for (let k = 0; k < it.ans.length; k++) { await G(k => document.querySelector(`#panel .chCard[data-k="${k}"]`).click(), k); await G(b => document.querySelector(`#panel .chBin[data-b="${b}"]`).click(), it.ans[k]); } await panelClick('#chGo'); }
    else if (it.type === 'match') { for (let k = 0; k < it.ans.length; k++) { await chClick('.chL', k); await chClick('.chR', it.ans[k]); } await panelClick('#chGo'); }
    else if (it.type === 'num') await chPad(it.ans);
    else if (it.type === 'error') await chClick('.chStep', it.ans);
    else if (it.type === 'line') { await G(v => { const r = document.querySelector('#panel #chNLr'); r.value = v; r.dispatchEvent(new Event('input')); }, Math.round((it.ans - it.lo) / (it.hi - it.lo) * 1000)); await panelClick('#chGo'); }
    else if (it.type === 'memory') { const ps = [...new Set(it.cards.map(c => c.p))]; for (const p of ps) { const [a, b] = it.cards.map((c, k) => c.p === p ? k : -1).filter(k => k >= 0); await chClick('.chMc', a); await chClick('.chMc', b); await sleep(350); } }
    try {
      await until(async () => (await getCh()).i === i + 1 && await G(n => { const s = document.querySelector('#panel .chSheet'); return !s || !s.querySelector('.chBurst') && (+s.dataset.i === n || !!s.querySelector('#chFin, #acEnd')); }, i + 1), `حل الجولة ${i + 1} (${it.type}: ${it.q.replace(/<[^>]+>/g, '').slice(0, 50)})`, 5000);
    } catch (e) { throw new Error(e.message + ' — الحالة: ' + JSON.stringify(await G(() => ({ busy: window.__game.game.busy, dialog: document.getElementById('dialog').className + ':' + document.getElementById('dialog').textContent.slice(0, 80), screen: document.getElementById('screen').className, panel: document.getElementById('panel').className, msg: document.getElementById('benchMsg')?.textContent, pad: document.getElementById('npd')?.textContent, head: document.getElementById('panel').textContent.replace(/s+/g, ' ').slice(0, 160), di: (window.__game.state.daily && window.__game.state.daily.run) ? window.__game.state.daily.run.ch.i : null })))); }
  }
}
async function solveChallenge(id) {
  await until(async () => (await isDone(id)) || (await data(id)).chStage === 2, 'إنهاء مهمة العالم', 60000);
  if (await isDone(id)) return false;
  await until(async () => { const st = await G(() => ({ ch: !!document.querySelector('#panel .chSheet'), dialog: document.getElementById('dialog').classList.contains('on') }));
    if (st.dialog) await G(() => document.getElementById('dialog').click()); return st.ch; }, 'فتح التحدي', 30000);
  await solveRounds(async () => (await data(id)).ch);
  await until(() => G(() => !!document.querySelector('#panel #chFin')), 'شاشة النجوم', 5000);
  expect((await data(id)).stars === 1, 'النجوم مع خطأ في كل جولة يجب أن تكون نجمة واحدة');
  await sleep(150); await panelClick('#chFin');
  return true;
}

/* ── حلول الدروس: wrong() محاولة خاطئة، right() الحل ── */
const W = {};   // مواضع من ملفات العالم، تُقرأ من اللعبة نفسها
const S = {};

// ١. القيمة المكانية
const PILES = [{ x: 140, y: 548, label: '١٠٠٠' }, { x: 205, y: 548, label: '١٠٠' }, { x: 265, y: 548, label: '١٠' }, { x: 320, y: 548, label: '١' }], CART = { x: 520, y: 552 };
S.placeValue = async () => {
  const load = async (k, n) => { await goTo(PILES[k].x, PILES[k].y + 20); for (let i = 0; i < n; i++) await press('📦 احمل صندوق ' + PILES[k].label); await goTo(CART.x, CART.y + 20); await press('⬇ ضع على العربة'); };
  // خطأ: صندوق آحاد واحد فقط
  await load(3, 1); await press('🚚 أرسل الشحنة');
  expect((await data('placeValue')).r === 0, 'شحنة خاطئة قُبلت');
  await press('⬆ أنزل ١'); await goTo(PILES[3].x, PILES[3].y + 20); await press('↩ أعِد صندوقاً');
  for (let r = 0; r < 3; r++) {
    const v = (await data('placeValue')).rounds[r], dg = [Math.floor(v / 1000), Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];
    for (let k = 0; k < 4; k++) if (dg[k]) await load(k, dg[k]);
    await press('🚚 أرسل الشحنة');
  }
};
// ٢. المقارنة والتقريب
const DEPOT = { x: 470, y: 572 }, MARK = v => ({ x: 150 + (v / 100 - 1) * 150, y: 708 });
S.compareRound = async () => {
  for (let i = 0; i < 4; i++) {
    await goTo(DEPOT.x, DEPOT.y + 16); await press('📦 خذ الطرد', { prefix: true });
    const d = await data('compareRound'), v = d.items[d.hand], m = Math.round(v / 100) * 100;
    if (i === 0) {   // خطأ: لافتة مجاورة
      const bad = m === 900 ? 800 : m + 100; await goTo(MARK(bad).x, MARK(bad).y + 10); await press('📍 ضعه عند لافتة ' + ar(bad));
      expect((await data('compareRound')).placed.length === 0, 'طرد وُضع عند لافتة خاطئة');
    }
    await goTo(MARK(m).x, MARK(m).y + 10); await press('📍 ضعه عند لافتة ' + ar(m));
  }
};
// ٣. العوامل والمضاعفات
S.factorsMultiples = async () => {
  await goTo(210, 1086);   // شمال البستان (ORCH.y − ٢٤)
  await press('🌱 ازرع', { prefix: true });   // خطأ: ١ × ١
  expect((await data('factorsMultiples')).r === 0, 'زراعة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const [n, kind, k] = (await data('factorsMultiples')).rounds[r], rows = kind === 'rows' ? k : n / k, cols = n / rows;
    for (let i = 1; i < rows; i++) await press('➕ صف');
    for (let i = 1; i < cols; i++) await press('➕ عمود');
    await press('🌱 ازرع', { prefix: true }); await until(async () => (await data('factorsMultiples')).r > r || await isDone('factorsMultiples'), 'جولة البستان');
  }
};
// ٤. الفردية والزوجية
const LETTERS = { x: 510, y: 1318 }, BOX_ODD = { x: 452, y: 1352 }, BOX_EVEN = { x: 568, y: 1352 };
S.oddEven = async () => {
  for (let i = 0; i < 6; i++) {
    await goTo(LETTERS.x, LETTERS.y + 14); await press('✉ خذ الرسالة');
    const d = await data('oddEven'), odd = d.letters[d.i].v % 2 === 1;
    const drop = async o => { const b = o ? BOX_ODD : BOX_EVEN; await goTo(b.x, b.y + 16); await press(o ? '📮 الصندوق الأحمر (فردي)' : '📮 الصندوق الأزرق (زوجي)'); };
    if (i === 0) { await drop(!odd); expect((await data('oddEven')).i === 0, 'رسالة في صندوق خاطئ قُبلت'); }
    await drop(odd);
  }
};
// ٥. الأعداد الأولية
const LAMPS = Array.from({ length: 12 }, (_, i) => ({ x: 700 + (i % 6) * 70, y: i < 6 ? 1280 : 1395 }));
const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
S.primeNumbers = async () => {
  const d = await data('primeNumbers'), light = async i => { await goTo(LAMPS[i].x, LAMPS[i].y + 12); await press('🔥 أشعل فانوس ' + ar(d.nums[i])); };
  await light(d.nums.findIndex(n => !isPrime(n)));
  expect((await data('primeNumbers')).lit.length === 0, 'فانوس غير أولي أُشعل');
  for (let i = 0; i < 12; i++) if (isPrime(d.nums[i])) await light(i);
};
// ٦. الضرب والقسمة على ١٠ و١٠٠ و١٠٠٠
S.powerOf10 = async () => {
  await goTo(1360, 1360);
  for (let r = 0; r < 4; r++) {
    const [a, b] = (await data('powerOf10')).rounds[r], up = b > a, k = Math.round(up ? b / a : a / b);
    if (r === 0) { await press((up ? '÷' : '×') + ar(k)); await until(async () => (await data('powerOf10')).show === null, 'الآلة'); expect((await data('powerOf10')).r === 0, 'تحويل خاطئ قُبل'); }
    await press((up ? '×' : '÷') + ar(k));
    await until(async () => (await data('powerOf10')).r > r, 'جولة الآلة');
  }
};
// ٧ و٨. الدكان: نقود بالضبط (الأسعار بالبيسة)
const PAY = { multiplyStrategies: [10000, 12000, 10000], decimalAdd: [7500, 3250, 4500] };
const coins = t => { const out = []; for (const c of [5000, 1000, 500, 100, 50]) while (t >= c) { out.push(c); t -= c; } return out; };
const shop = id => async () => {
  // talk() فتح الطاولة. خطأ: ٥٠ بيسة فقط
  await panelClick('.money[data-v="50"]'); await panelClick('#shopPay'); await sleep(150);
  expect((await data(id)).round === 0, 'دفع ناقص قُبل');
  await panelClick('.chip[data-i="0"]');
  for (const total of PAY[id]) { for (const c of coins(total)) await panelClick(`.money[data-v="${c}"]`); await panelClick('#shopPay'); await sleep(150); }
};
S.multiplyStrategies = shop('multiplyStrategies');
S.decimalAdd = shop('decimalAdd');
// ٩. القسمة مع الباقي: ٢٧ صندوقاً على ٦ شاحنات = ٤ لكل شاحنة والباقي ٣ للعربة
S.division1 = async () => {
  const P = W.village, trucks = await G(() => window.__game.W.trucks.map(t => ({ x: t.x, y: t.y })));
  const carry = async (n, to) => {
    await goTo(P.PILE.x, P.PILE.y + 20); for (let i = 0; i < n; i++) await press('📦 احمل صندوقاً');
    if (to === 'van') { await goTo(P.VAN.x, P.VAN.y + 16); for (let i = 0; i < n; i++) await press('⬇ ضع في العربة الصغيرة'); }
    else { await goTo(trucks[to].x, trucks[to].y - 40); for (let i = 0; i < n; i++) await press('⬇ ضع في الشاحنة'); }
  };
  // خطأ: ٥ في الأولى و٣ في الثانية
  await carry(5, 0); await carry(3, 1); for (let i = 2; i < 6; i++) await carry(4, i); await carry(3, 'van');
  await goTo(P.SIGNAL.x - 20, P.SIGNAL.y + 10); await press('🚦 أطلق القافلة'); await settle();
  expect(!(await isDone('division1')), 'قافلة غير متساوية انطلقت');
  await goTo(trucks[0].x, trucks[0].y - 40); await press('⬆ خذ منها'); await goTo(trucks[1].x, trucks[1].y - 40); await press('⬇ ضع في الشاحنة');
  await goTo(P.SIGNAL.x - 20, P.SIGNAL.y + 10); await press('🚦 أطلق القافلة');
};
// ١٠. المتتاليات
S.sequences = async () => {
  await goTo(810, 1452); await press('🪨 ابدأ العبور');
  const stone = async k => { await G(k => document.querySelectorAll('#actions button')[k].click(), k); await until(() => G(() => !window.__game.game.busy), 'القفز'); await sleep(120); };
  const d = await data('sequences');
  await stone((d.rows[0].ok + 1) % 3);   // خطأ: الحجر يغطس ويعود البطل إلى الضفة
  expect((await data('sequences')).slips === 1 && (await data('sequences')).row === -1, 'حجر خاطئ لم يغطس');
  for (let r = 0; r < 5; r++) await stone(d.rows[r].ok);
};

/* ═══ الوحدة ٢: القياس (السوق الأسبوعي) ═══ */
const sheetBtn = sel => panelClick(sel).then(() => sleep(120));
// ١١. رسم وقياس الخطوط: المنشار يبدأ عند ٥٠ ملم
S.lengthMeasure = async () => {
  const { BENCH } = W.market; await goTo(BENCH.x, BENCH.y + 16); await press('🪚 طاولة النجار');
  await sheetBtn('#benchGo');   // خطأ: القطع عند ٥٠ ملم (الطلب الأول لا يكون من مضاعفات ١٠)
  expect((await data('lengthMeasure')).r === 0, 'قطعة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const d = await data('lengthMeasure'); let diff = d.rounds[r].mm - d.pos;
    while (diff >= 10) { await sheetBtn('[data-d="10"]'); diff -= 10; } while (diff <= -10) { await sheetBtn('[data-d="-10"]'); diff += 10; }
    while (diff > 0) { await sheetBtn('[data-d="1"]'); diff--; } while (diff < 0) { await sheetBtn('[data-d="-1"]'); diff++; }
    await sheetBtn('#benchGo');
  }
};
// ١٢. رسم الخطوط: نقرة بالفأرة على المسطرة (كل ملم = ٢٫٥ بكسل، والبداية عند ١٨)
S.lineDrawing = async () => {
  const { BOARD } = W.market; await goTo(BOARD.x, BOARD.y + 14); await press('✏️ لوح المدرب');
  const drawAt = async mm => { const b = await page.locator('#draw').boundingBox(); await page.mouse.click(b.x + 18 + mm * 2.5, b.y + 44); await sleep(80); await sheetBtn('#benchGo'); };
  await drawAt((await data('lineDrawing')).rounds[0].mm - 3);   // خطأ: أقصر بـ ٣ ملم
  expect((await data('lineDrawing')).r === 0, 'خط خاطئ قُبل');
  for (let r = 0; r < 3; r++) await drawAt((await data('lineDrawing')).rounds[r].mm);
};
// ١٣. الجداول الزمنية: كل مسافر يعرف حافلته (bus)، والخطأ رصيف آخر
S.timeTables = async () => {
  const { BAYS } = W.market;
  for (let i = 0; i < 3; i++) {
    const p = (await data('timeTables')).pax[i];
    await goTo(p.x, p.y + 10); await press('🧳 رافِق ' + p.name); await settle();
    const bay = async j => { await goTo(BAYS[j].x, BAYS[j].y + 8); await press('🚌 أركبه حافلة الرصيف ' + BAYS[j].id); };
    if (i === 0) { await bay((p.bus + 1) % 3); expect((await data('timeTables')).pax[0].st === 'follow', 'مسافر ركب حافلة خاطئة'); }
    await bay(p.bus);
  }
};
// ١٤. التقويمات: التقويم يفتح على شهر البداية، والجواب قد يكون في شهر لاحق
S.calendars = async () => {
  const { CAL } = W.market; await goTo(CAL.x, CAL.y + 16); await press('📅 تقويم المهرجان');
  for (let r = 0; r < 3; r++) {
    const q = (await data('calendars')).rounds[r], a = new Date(q.ans), s = new Date(q.show);
    const months = (a.getUTCFullYear() - s.getUTCFullYear()) * 12 + a.getUTCMonth() - s.getUTCMonth();
    if (r === 0) { await sheetBtn(`.day[data-day="${months === 0 && a.getUTCDate() === 1 ? 2 : 1}"]`); expect((await data('calendars')).r === 0, 'يوم خاطئ قُبل'); }
    for (let k = 0; k < months; k++) await sheetBtn('#calNext');
    await sheetBtn(`.day[data-day="${a.getUTCDate()}"]`);
  }
};
// ١٥. المساحة والمحيط: الطول × العرض = المساحة، و٢ × (الطول + العرض) = المحيط؛ وأكبر مساحة بمحيط ثابت = مربع
S.areaPerimeterT1 = async () => {
  const { PEN } = W.market; await goTo(PEN.x + 160, PEN.y + PEN.cell * PEN.n + 20);
  await press('🔨 ابنِ السياج');   // خطأ: ١ × ١
  expect((await data('areaPerimeterT1')).r === 0, 'حظيرة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const q = (await data('areaPerimeterT1')).rounds[r]; let l, w;
    if (q.max) l = w = q.P / 4;
    else for (let a = 1; a <= PEN.n && !l; a++) if (q.A % a === 0 && 2 * (a + q.A / a) === q.P && q.A / a <= PEN.n) { l = a; w = q.A / a; }
    expect(l, `لا يوجد مستطيل يحقق الطلب ${JSON.stringify(q)}`);
    for (let i = 1; i < l; i++) await press('➕ الطول');
    for (let i = 1; i < w; i++) await press('➕ العرض');
    await press('🔨 ابنِ السياج');
    await until(async () => (await data('areaPerimeterT1')).r > r || await isDone('areaPerimeterT1'), 'بناء الحظيرة');
  }
};

/* ═══ الوحدة ٣: الهندسة (الميناء) ═══ */
// ينتظر ثبات موضع اللوحة (حركة ظهورها) قبل النقر، وإلا وقعت النقرة في غير مكانها على الأجهزة البطيئة
const canvasClick = async (id, x, y) => {
  let b = await page.locator('#' + id).boundingBox();
  for (let i = 0; i < 30; i++) { await sleep(40); const b2 = await page.locator('#' + id).boundingBox(); if (Math.abs(b2.x - b.x) < .5 && Math.abs(b2.y - b.y) < .5) break; b = b2; }
  await page.mouse.click(b.x + x, b.y + y); await sleep(60);
};
// ١٦. تمييز الأشكال: مثلثات، رباعيات، مجسمات
S.shapesIdentify = async () => {
  const { PIER_Y, SEA_X, CRATES } = W.harbor, NAMES = ['المثلثات', 'الرباعيات', 'المجسمات'];
  const cls = k => k.startsWith('tri') ? 0 : ['square', 'rect', 'rhombus', 'trap', 'para', 'kite'].includes(k) ? 1 : 2;
  const ship = async j => { await goTo(SEA_X - 20, PIER_Y[j]); await press('🚢 حمّله على سفينة ' + NAMES[j]); };
  for (let i = 0; i < 8; i++) {
    await goTo(CRATES.x, CRATES.y + 18); await press('📦 خذ الصندوق');
    const d = await data('shapesIdentify'), j = cls(d.crates[d.i]);
    if (i === 0) { await ship((j + 1) % 3); expect((await data('shapesIdentify')).i === 0, 'صندوق على سفينة خاطئة قُبل'); }
    await ship(j);
  }
};
// ١٧. خصائص المجسمات: منشور قاعدته n: رؤوس ٢n وأحرف ٣n وأوجه n+٢؛ هرم: رؤوس وأوجه n+١ وأحرف ٢n
const SOLIDS = [['prism', 4], ['prism', 3], ['prism', 5], ['prism', 6], ['pyr', 4], ['pyr', 3]];
S.shapes3D = async () => {
  const { FRAME_TABLE: T } = W.harbor; await goTo(T.x, T.y + 16); await press('🔧 طاولة الهياكل');
  await sheetBtn('#benchGo');   // خطأ: هيكل بلا قطع
  expect((await data('shapes3D')).r === 0, 'هيكل ناقص قُبل');
  for (let r = 0; r < 3; r++) {
    const [t, n] = SOLIDS[(await data('shapes3D')).rounds[r]], want = t === 'prism' ? { v: 2 * n, e: 3 * n, f: n + 2 } : { v: n + 1, e: 2 * n, f: n + 1 };
    for (const k of ['v', 'e', 'f']) for (let i = 0; i < want[k]; i++) await panelClick(`[data-k="${k}"][data-v="1"]`);
    await sheetBtn('#benchGo');
  }
};
// ١٨. الشبكات: ثلاث شبكات مكعب مختلفة على لوح ٥ × ٤ (كل مربع ٤٤ بكسل)
const NETS = [[[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]]];
S.nets = async () => {
  const { GIFT_TABLE: T } = W.harbor; await goTo(T.x, T.y + 16); await press('📦 لوح العلب');
  const put = async cells => { for (const [x, y] of cells) await canvasClick('net', 4 + x * 44 + 22, 4 + y * 44 + 22); await sheetBtn('#benchGo'); };
  await put([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]);   // خطأ: مستطيل ٣ × ٢ تتراكب وجوهه
  expect((await data('nets')).found.length === 0, 'شبكة خاطئة قُبلت');
  await sheetBtn('#netClear');
  for (const n of NETS) await put(n);
};
// ١٩. الزوايا في المثلثات: المنقلة تبدأ عند ٦٠°
S.triangleAngles = async () => {
  const { ROOF_TABLE: T } = W.harbor; await goTo(T.x, T.y + 16); await press('📐 طاولة الدعامات');
  if ((await data('triangleAngles')).rounds[0].ans === 60) await sheetBtn('[data-a="1"]');
  await sheetBtn('#benchGo');   // خطأ: الزاوية الابتدائية
  expect((await data('triangleAngles')).r === 0, 'زاوية خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const d = await data('triangleAngles'); let diff = d.rounds[r].ans - d.set;
    while (diff >= 10) { await sheetBtn('[data-a="10"]'); diff -= 10; } while (diff <= -10) { await sheetBtn('[data-a="-10"]'); diff += 10; }
    while (diff > 0) { await sheetBtn('[data-a="1"]'); diff--; } while (diff < 0) { await sheetBtn('[data-a="-1"]'); diff++; }
    await sheetBtn('#benchGo');
  }
};
// ٢٠. الانسحاب: المتجه = العوامة − القارب (ص للأسفل موجبة على الشبكة)
S.translation = async () => {
  const { FISH_STAND: F } = W.harbor; await goTo(F.x, F.y);
  const sail = async r => { await press('⛵ أبحر'); await until(async () => { const d = await data('translation'); return !d.anim || d.r > r; }, 'الإبحار'); await sleep(150); };
  await press('➡ يميناً'); await sail(0);   // خطأ: خطوة واحدة يميناً (العوامة دائماً في صف آخر)
  expect((await data('translation')).r === 0, 'انسحاب خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const { b, t } = (await data('translation')).rounds[r], vx = t[0] - b[0], vy = t[1] - b[1];
    await press('↺ صفّر');
    for (let i = 0; i < Math.abs(vx); i++) await press(vx > 0 ? '➡ يميناً' : '⬅ يساراً');
    for (let i = 0; i < Math.abs(vy); i++) await press(vy > 0 ? '⬇ أسفل' : '⬆ أعلى');
    await sail(r);
  }
};
// ٢١ و٢٢. الانعكاس والدوران: نقاط الصورة على شبكة ٨ × ٨ (كل خانة ٣٠ بكسل والهامش ١٥)
const imageLesson = (id, label, standKey) => async () => {
  const P = W.harbor[standKey]; await goTo(P.x, P.y); await press(label);
  const dots = async pts => { for (const [x, y] of pts) await canvasClick('img', 15 + x * 30, 15 + y * 30); await sheetBtn('#benchGo'); };
  await dots((await data(id)).rounds[0].shape);   // خطأ: الشكل الأصلي نفسه بدل صورته
  expect((await data(id)).r === 0, 'صورة خاطئة قُبلت');
  await sheetBtn('#imgClear');
  for (let r = 0; r < 3; r++) await dots((await data(id)).rounds[r].image);
};
S.reflection = imageLesson('reflection', '🪞 لوح المرآة', 'POOL_STAND');
S.rotation = imageLesson('rotation', '🌀 لوح الطاحونة', 'MILL_STAND');
// ٢٣. الإحداثيات: الوقوف على النقطة (س، ص) ثم الحفر
S.coordinates = async () => {
  const B = W.harbor.BEACH, dig = async ([x, y]) => { await goTo(B.ox + x * B.u, B.oy - y * B.u); await press('⛏️ احفر هنا'); };
  await dig([0, 0]);   // خطأ: نقطة الأصل لا تكون كنزاً أبداً
  expect((await data('coordinates')).r === 0, 'حفر خاطئ وجد كنزاً');
  for (let r = 0; r < 3; r++) await dig((await data('coordinates')).targets[r]);
};

/* ═══ أدوات الطاولات المشتركة (bench.js) ═══ */
const station = async (st, label) => { await goTo(st.x, st.y + 16); await press(label); };
// لوحة الأرقام: تكتب العدد مفتاحاً مفتاحاً ثم تضغط زر التأكيد
async function typePad(v) {
  const s = String(+(+v).toFixed(3));
  for (const ch of s.replace('-', '')) await panelClick(`[data-k="${ch}"]`);
  if (s.startsWith('-')) await panelClick('[data-k="−"]');
  await sheetBtn('[data-k="go"]');
}
// عدّادات − و+ (و+١٠ إن وُجد)
async function setCounter(k, from, to) {
  let n = to - from;
  while (n >= 10 && await G(k => !!document.querySelector(`#panel [data-c="${k}"][data-v="10"]`), k)) { await panelClick(`[data-c="${k}"][data-v="10"]`); n -= 10; }
  for (; n > 0; n--) await panelClick(`[data-c="${k}"][data-v="1"]`);
  for (; n < 0; n++) await panelClick(`[data-c="${k}"][data-v="-1"]`);
}
const steps = async (diff, big, small, bigUp, bigDown, up, down) => {   // تحريك مؤشر بخطوات كبيرة ثم صغيرة
  while (diff >= big) { await sheetBtn(bigUp); diff -= big; } while (diff <= -big) { await sheetBtn(bigDown); diff += big; }
  while (diff >= small) { await sheetBtn(up); diff -= small; } while (diff <= -small) { await sheetBtn(down); diff += small; }
};
const coinsFor = (t, list = [5000, 1000, 500, 100, 50]) => { const out = []; for (const c of list) while (t >= c) { out.push(c); t -= c; } return out; };
// درس فيه جولات بلوحة أرقام: st() موضع الطاولة، ans(d, r) الجواب
const padLesson = (id, label, st, ans, n = 3) => async () => {
  await station(st(), label);
  await typePad(ans(await data(id), 0) + 1);   // خطأ: الجواب + ١
  expect((await data(id)).r === 0, 'جواب خاطئ قُبل');
  for (let r = 0; r < n; r++) await typePad(ans(await data(id), r));
};

/* ═══ الوحدة ٤: الأعداد (٢) (القلعة) ═══ */
// ٢٤. خط الأعداد: الموضع = البداية + (العدد − الصغرى) ÷ (الكبرى − الصغرى) × الطول
S.numberLineEstimate = async () => {
  const B = W.fort.BW, at = async v => { const r = (await data('numberLineEstimate')).rounds[(await data('numberLineEstimate')).r]; await goTo(B.x0 + (v - r.lo) / (r.hi - r.lo) * (B.x1 - B.x0), B.y); await press('🚩 ثبّت الراية هنا'); };
  await at((await data('numberLineEstimate')).rounds[0].lo);   // خطأ: عند علامة البداية
  expect((await data('numberLineEstimate')).r === 0, 'راية في موضع خاطئ قُبلت');
  for (let r = 0; r < 3; r++) await at((await data('numberLineEstimate')).rounds[r].v);
};
// ٢٥. الهيروغليفية: زهرة ١٠٠٠، لفافة ١٠٠، قوس ١٠، عصا ١
S.hieroNumbers = async () => {
  await station(W.fort.ST4.museum, '🏺 باب المتحف');
  await sheetBtn('#benchGo');   // خطأ: باب بلا نقش
  expect((await data('hieroNumbers')).r === 0, 'نقش فارغ فتح الباب');
  for (let r = 0; r < 3; r++) {
    const q = (await data('hieroNumbers')).rounds[r];
    if (q.t === 'r') { await typePad(q.v); continue; }
    for (const g of [1000, 100, 10, 1]) for (let i = 0; i < Math.floor(q.v / g) % 10; i++) await panelClick(`[data-g="${g}"]`);
    await sheetBtn('#benchGo');
  }
};
// ٢٦. النظام العشري: سبائك (آحاد) وقطع (أعشار) وحبات (أجزاء من مئة)
S.decimalSystem = async () => {
  await station(W.fort.ST4.gold, '⚖️ ميزان الذهب');
  await sheetBtn('#benchGo');   // خطأ: كفة فارغة
  expect((await data('decimalSystem')).r === 0, 'وزن خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const c = Math.round((await data('decimalSystem')).rounds[r] * 100);
    await setCounter('a', 0, Math.floor(c / 100)); await setCounter('b', 0, Math.floor(c / 10) % 10); await setCounter('c', 0, c % 10);
    await sheetBtn('#benchGo');
  }
};
// ٢٧. العمليات على العشرية
S.decimalOperations = padLesson('decimalOperations', '🍯 مطبخ الحلوى', () => W.fort.ST4.kitchen, (d, r) => d.rounds[r].ans);
// ٢٨. ميزانية الرحلة: أي k أصناف مجموعها = الميزانية
const TRIP = [750, 1250, 500, 900, 650, 1100, 1350, 1600];
S.decimalApplications = async () => {
  await station(W.fort.ST4.trip, '🧺 دكان الرحلة');
  await sheetBtn('#benchGo');   // خطأ: بلا أصناف
  expect((await data('decimalApplications')).r === 0, 'شراء خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const { k, budget } = (await data('decimalApplications')).rounds[r];
    const pick = (from, left, sum) => {   // أول مجموعة من left صنفاً مجموعها الميزانية
      if (left === 0) return sum === budget ? [] : null;
      for (let i = from; i < TRIP.length; i++) { const rest = pick(i + 1, left - 1, sum + TRIP[i]); if (rest) return [i, ...rest]; }
      return null;
    };
    const sel = pick(0, k, 0); expect(sel, 'لا توجد أصناف بهذه الميزانية');
    for (const i of sel) await panelClick(`.pick[data-i="${i}"]`);
    await sheetBtn('#benchGo');
  }
};
// ٢٩. الأعداد الصحيحة: الدلو يبدأ من موضع البداية في كل جولة
S.integers = async () => {
  await station(W.fort.ST4.well, '🪣 دلو البئر');
  await sheetBtn('#benchGo');   // خطأ: التثبيت في موضع البداية
  expect((await data('integers')).r === 0, 'طابق خاطئ قُبل');
  for (let r = 0; r < 3; r++) { const d = await data('integers'); await steps(d.rounds[r].ans - d.lvl, 1e9, 1, '', '', '#up', '#down'); await sheetBtn('#benchGo'); }
};
// ٣٠. المضاعفات المشتركة: المضاعف المشترك الأصغر
const gcd = (x, y) => y ? gcd(y, x % y) : x;
S.commonMultiples = async () => {
  await station(W.fort.ST4.bells, '🔔 حبل الأجراس');
  await sheetBtn('#benchGo');   // خطأ: الدقيقة ١
  expect((await data('commonMultiples')).r === 0, 'دقيقة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const d = await data('commonMultiples'), [a, b] = d.rounds[r];
    await steps(a * b / gcd(a, b) - d.min, 5, 1, '[data-m="5"]', '[data-m="-5"]', '[data-m="1"]', '[data-m="-1"]');
    await sheetBtn('#benchGo'); await until(async () => (await data('commonMultiples')).r > r, 'الأجراس');
  }
};
// ٣١. الحساب السريع: الباقي = المدفوع − الثمن
S.mentalAddSub = async () => {
  await station(W.fort.ST4.change, '🪙 كشك مريم');
  await panelClick('.money[data-v="50"]'); await sheetBtn('#benchGo');   // خطأ: ٥٠ بيسة فقط
  expect((await data('mentalAddSub')).r === 0, 'باقٍ خاطئ قُبل');
  for (let r = 0; r < 4; r++) { const q = (await data('mentalAddSub')).rounds[r]; for (const c of coinsFor(q.P - q.p)) await panelClick(`.money[data-v="${c}"]`); await sheetBtn('#benchGo'); }
};
// ٣٢. استراتيجيات الضرب (٢)
S.multiplyStrategies2 = padLesson('multiplyStrategies2', '🌾 لوح المخزن', () => W.fort.ST4.grain, (d, r) => d.rounds[r].ans);
// ٣٣. قابلية القسمة: أكياس تتحرك على السير، والنقر على الكيس يسحبه
S.divisibility = async () => {
  await station(W.fort.ST4.conveyor, '🌴 سير الأكياس');
  const grab = async ok => {
    for (let i = 0; i < 600; i++) {   // الأكياس عشوائية: قد يتأخر الكيس المناسب
      const x = await G(ok => { const s = (document.getElementById('belt')?.__sacks || []).find(s => s.ok === ok && s.x > 40 && s.x < 280); return s ? s.x : null; }, ok);
      if (x !== null) { const b = await page.locator('#belt').boundingBox(); await page.mouse.click(b.x + x - 4, b.y + 55); return; }
      await sleep(100);
    }
    throw new Error('لم يظهر كيس مناسب على السير');
  };
  await grab(false); await sleep(100);   // خطأ: كيس لا يُقسم
  expect((await data('divisibility')).got === 0, 'كيس خاطئ احتُسب');
  for (let r = 0; r < 3; r++) { for (let k = 0; k < 3; k++) { await grab(true); await sleep(150); } await until(async () => (await data('divisibility')).r > r, 'جولة السير'); await sleep(300); }
};
// ٣٤. الضرب بنموذج المساحة: (عشرات + آحاد) × (عشرات + آحاد)
S.multiplyT2 = async () => {
  await station(W.fort.ST4.roof, '🧱 مخطط السطح');
  await sheetBtn('#benchGo');   // خطأ: خانات فارغة
  expect((await data('multiplyT2')).r === 0, 'بلاط خاطئ قُبل');
  for (let r = 0; r < 2; r++) {
    const [a, b] = (await data('multiplyT2')).rounds[r], A = [Math.floor(a / 10) * 10, a % 10], B = [Math.floor(b / 10) * 10, b % 10];
    const parts = [A[0] * B[0], A[0] * B[1], A[1] * B[0], A[1] * B[1]];
    for (let i = 0; i < 4; i++) await page.fill(`#panel [data-p="${i}"]`, String(parts[i]));
    await page.fill('#panel #tot', String(a * b)); await sheetBtn('#benchGo');
  }
};
// ٣٥. القسمة (٢): ناتج وباقٍ، أو تقريب للأعلى (حافلات)، أو قسمة تامة
S.division2 = async () => {
  await station(W.fort.ST4.pack, '🍬 آلة التعبئة');
  await sheetBtn('#benchGo');   // خطأ: أصفار
  expect((await data('division2')).r === 0, 'تعبئة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) { const q = (await data('division2')).rounds[r]; await setCounter('n', 0, q.q); if (q.t === 'qr') await setCounter('left', 0, q.rm); await sheetBtn('#benchGo'); }
};
// ٣٦. الأعداد الخاصة: ألغاز المربعات والمضاعفات
const isSq = n => Number.isInteger(Math.sqrt(n));
const RIDDLES = [isSq, n => n % 25 === 0, n => isSq(n) && n % 2 === 0, n => n % 5 === 0 && n % 10 !== 0];
S.specialNumbers = async () => {
  await station(W.fort.ST4.gate, '🛡️ حجارة البوابة');
  await sheetBtn('#benchGo');   // خطأ: بلا حجارة
  expect((await data('specialNumbers')).r === 0, 'لغز خاطئ قُبل');
  for (let r = 0; r < 3; r++) { const q = (await data('specialNumbers')).rounds[r]; for (let i = 0; i < q.nums.length; i++) if (RIDDLES[q.k](q.nums[i])) await panelClick(`.stone[data-i="${i}"]`); await sheetBtn('#benchGo'); }
};

/* ═══ الفصل الثاني — الوحدة ١: القياس (مطبخ المهرجان) ═══ */
const ST5 = () => W.festival.ST5, ST6 = () => W.festival.ST6;
const mod = (v, m) => ((v % m) + m) % m;
// ٣٧. الكتلة والسعة (١): أثقال تساوي كتلة الكيس، وإبريق يُصب ٥٠ مل في كل ضغطة
S.massCapacity1 = async () => {
  await station(ST5().scale, '⚖️ ميزان المطبخ');
  await sheetBtn('#benchGo');   // خطأ: كفة بلا أثقال
  expect((await data('massCapacity1')).r === 0, 'وزن خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const q = (await data('massCapacity1')).rounds[r];
    if (q.t === 'w') for (const w of coinsFor(q.g, [1000, 500, 200, 100, 50])) await panelClick(`.money[data-v="${w}"]`);
    else for (let i = 0; i < q.ml / 50; i++) { await G(() => { const b = document.getElementById('pour'); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); }); await sleep(40); }
    await sheetBtn('#benchGo'); await until(async () => (await data('massCapacity1')).r > r, 'جولة المطبخ');
  }
};
// ٣٨. الكتلة والسعة (٢): المقدار × (عدد الضيوف ÷ ٤)
S.massCapacity2 = async () => {
  await station(ST5().recipe, '🍲 دفتر الوصفات');
  await sheetBtn('#benchGo');   // خطأ: مقادير صفرية
  expect((await data('massCapacity2')).r === 0, 'وصفة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const q = (await data('massCapacity2')).rounds[r];
    for (const [i, k] of ['a', 'b', 'c'].entries()) { const v = q.ing[i][2] * q.p / 4; for (let n = 0; n < Math.floor(v / 100); n++) await panelClick(`[data-c="${k}"][data-v="100"]`); for (let n = 0; n < v % 100 / 10; n++) await panelClick(`[data-c="${k}"][data-v="10"]`); }
    await sheetBtn('#benchGo');
  }
};
// ٣٩. تحويل الوقت: عقارب ساعة (كل ١٢ ساعة دورة)، ثم أيام → ساعات
S.timeConvert = async () => {
  await station(ST5().clock, '⏰ آلة ساعة البرج');
  await sheetBtn('#benchGo');   // خطأ: الساعة كما هي
  expect((await data('timeConvert')).r === 0, 'وقت خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const d = await data('timeConvert'), q = d.rounds[r];
    if (q.t === 'c') await steps(mod(q.ans - d.tm, 720), 60, 5, '[data-m="60"]', '', '[data-m="5"]', '');
    else await setCounter('n', 0, q.ans);
    await sheetBtn('#benchGo');
  }
};
// ٤٠. المناطق الزمنية (١): وقت المدينة = وقت مسقط + الفرق
S.timeZones1 = async () => {
  await station(ST5().calls, '🌍 جدار الساعات');
  await sheetBtn('#benchGo');   // خطأ: وقت مسقط نفسه
  expect((await data('timeZones1')).r === 0, 'ساعة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) { const d = await data('timeZones1'), q = d.rounds[r]; await steps(mod(q.ans - (d.tm || q.m), 1440), 60, 15, '[data-m="60"]', '', '[data-m="15"]', ''); await sheetBtn('#benchGo'); }
};
// ٤١. المساحة والمحيط: بُعد ناقص من المساحة أو المحيط، ثم مساحة شكل L
S.areaPerimeter = async () => {
  await station(ST5().guest, '🏠 مخططات البيت');
  await sheetBtn('#build');   // خطأ: طول ١ م
  expect((await data('areaPerimeter')).r === 0, 'بُعد خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const d = await data('areaPerimeter'), q = d.rounds[r];
    if (q.t === 'L') { await typePad(q.ans); continue; }
    for (let i = d.n; i < q.ans; i++) await panelClick('[data-s="1"]');
    await sheetBtn('#build');
  }
};

/* ═══ الوحدة ٢: معالجة البيانات (ساحة المهرجان) ═══ */
// ٤٢. الرسم الخطي: نقطة لكل ساعة (س = ٤٠ + ٥٢ × الزمن، ص = ١٩٦ − المسافة ÷ أقصى مسافة × ١٧٠)
S.lineGraphs = async () => {
  await station(ST6().graph, '📈 لوح الرحلة');
  await sheetBtn('#benchGo');   // خطأ: بلا نقاط
  expect((await data('lineGraphs')).r === 0, 'رسم ناقص قُبل');
  for (let t = 1; t <= 5; t++) await canvasClick('gr', 40 + t * 52, 196 - t / 5 * 170);
  await sheetBtn('#benchGo');
  for (let r = 1; r < 3; r++) await typePad((await data('lineGraphs')).rounds[r].ans);
};
// ٤٣. المخططات الدائرية: النسب بخطوات ٥٪، ثم نسبة مئوية من عدد
S.pieCharts = async () => {
  await station(ST6().pie, '🥧 خطة الحقل');
  await sheetBtn('#benchGo');   // خطأ: حقل فارغ
  expect((await data('pieCharts')).r === 0, 'تقسيم خاطئ قُبل');
  for (let r = 0; r < 2; r++) { const q = (await data('pieCharts')).rounds[r]; for (let i = 0; i < 3; i++) for (let k = 0; k < q.ans[i] / 5; k++) await panelClick(`[data-i="${i}"][data-v="5"]`); await sheetBtn('#benchGo'); }
  await typePad((await data('pieCharts')).rounds[2].ans);
};
// ٤٤. المتوسط: نقل التمر من السلال الممتلئة إلى الناقصة حتى تتساوى، ثم حساب المتوسط
S.statsAverage = async () => {
  await station(ST6().harvest, '🧺 سلال التمر');
  await sheetBtn('#benchGo');   // خطأ: السلال غير متساوية
  expect((await data('statsAverage')).r === 0, 'سلال غير متساوية قُبلت');
  const basket = i => canvasClick('bk', 34 + i * 63, 140);
  for (;;) {
    const d = await data('statsAverage'), m = d.rounds[0].m, from = d.bk.findIndex(v => v > m), to = d.bk.findIndex(v => v < m);
    if (from < 0) break;
    await basket(from); await basket(to);
  }
  await sheetBtn('#benchGo');
  for (let r = 1; r < 3; r++) await typePad((await data('statsAverage')).rounds[r].ans);
};
// ٤٥. استخدام الإحصاء: سؤال الزوار، ثم أعمدة تطابق علامات العدّ، ثم المنوال
S.usingStats = async () => {
  const V = W.festival.VISITORS;
  for (;;) { const i = (await data('usingStats')).asked.findIndex(a => !a); if (i < 0) break; await goTo(V[i].x, V[i].y + 10); await press('📋 اسأل الزائر'); }
  await station(ST6().survey, '📊 لوح الاستبيان');
  await sheetBtn('#benchGo');   // خطأ: أعمدة صفرية
  expect(!(await G(() => !!document.querySelector('#panel [data-pick]'))), 'مخطط خاطئ قُبل');
  const ans = (await data('usingStats')).ans, tally = [0, 1, 2].map(k => ans.filter(x => x === k).length);
  for (let k = 0; k < 3; k++) for (let i = 0; i < tally[k]; i++) await panelClick(`[data-k="${k}"][data-v="1"]`);
  await sheetBtn('#benchGo');
  await sheetBtn(`[data-pick="${tally.indexOf(Math.max(...tally))}"]`);
};
// ٤٦. لغة الاحتمال: عدد القطاعات الحمراء من ٨ (القطاع i عند الزاوية (i + ½) × ٤٥° + دوران القرص)
const RED = [4, 2, 6, 8, 0];   // متساوٍ، غير مرجّح، مرجّح، مؤكد، مستحيل
S.probabilityLang = async () => {
  await station(ST6().spinner, '🎡 دوّار المهرجان');
  // ننتظر توقف الدوّار: إما تتقدم الجولة أو تظهر رسالة خطأ جديدة (رسالة الخطأ السابقة قد تبقى ظاهرة)
  const msg = () => G(() => document.getElementById('benchMsg')?.textContent);
  const spin = async r => { const before = await msg(); await sheetBtn('#benchGo'); await until(async () => (await data('probabilityLang')).r > r || (await msg()) !== before, 'الدوّار'); await sleep(200); };
  await spin(0);   // خطأ: لا أحمر (لا تطلبه الجولة الأولى أبداً)
  expect((await data('probabilityLang')).r === 0, 'تلوين خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const d = await data('probabilityLang');
    for (let i = 0; i < RED[d.rounds[r]]; i++) { const a = (i + .5) * Math.PI / 4 + d.rot; await canvasClick('sp', 120 + 60 * Math.cos(a), 124 + 60 * Math.sin(a)); }
    await spin(r);
  }
};

/* ═══ الوحدة ٣: العدد (سوق الجمعية) ═══ */
const ST7 = () => W.coop.ST7;
// زر «اضغط مطولاً»: ضغطة قصيرة = خطوة واحدة
const tap = (sel, inPanel = true) => G(([sel, inPanel]) => {
  const b = inPanel ? document.querySelector('#panel ' + sel) : [...document.querySelectorAll('#actions button')].find(b => b.textContent === sel && !b.disabled);
  if (!b) throw new Error('غير موجود: ' + sel);
  b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
}, [sel, inPanel]).then(() => sleep(60));
// ٤٧. نظام الأعداد (٢): عجلات القفل (مئات، عشرات، آحاد، أعشار، أجزاء من مئة)
S.numberSystem2 = async () => {
  await station(ST7().vault, '🔐 قفل الخزينة');
  await sheetBtn('#benchGo');   // خطأ: ٠٠٠٫٠٠
  expect((await data('numberSystem2')).r === 0, 'رمز خاطئ فتح الخزينة');
  for (let r = 0; r < 3; r++) {
    const c = Math.round((await data('numberSystem2')).rounds[r].ans * 100), dg = [Math.floor(c / 10000), Math.floor(c / 1000) % 10, Math.floor(c / 100) % 10, Math.floor(c / 10) % 10, c % 10];
    for (let i = 0; i < 5; i++) for (let k = 0; k < dg[i]; k++) await panelClick(`[data-w="${i}"][data-v="1"]`);
    await sheetBtn('#benchGo');
  }
};
// ٤٨. الأرقام الرومانية
const ROM = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const roman = n => { let s = ''; for (const [v, r] of ROM) while (n >= v) { s += r; n -= v; } return s; };
S.numberHistory2 = async () => {
  await station(ST7().roman, '🏛️ لوح الرومان');
  await sheetBtn('#benchGo');   // خطأ: لوح فارغ
  expect((await data('numberHistory2')).r === 0, 'نقش خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const q = (await data('numberHistory2')).rounds[r];
    if (q.t === 'r') { await typePad(q.v); continue; }
    for (const ch of roman(q.v)) await panelClick(`[data-r="${ch}"]`);
    await sheetBtn('#benchGo');
  }
};
// ٤٩ و٥٠. دفتر البقالة وسوق السمك: لوحة أرقام
S.addSub1 = padLesson('addSub1', '🧾 دفتر البقالة', () => ST7().grocery, (d, r) => d.rounds[r].ans);
S.mulDiv = padLesson('mulDiv', '🐟 صندوق السمك', () => ST7().fish, (d, r) => d.rounds[r].ans);
// ٥١. الجمع والطرح (٢): أزواج مجموعها ١٠ (القيم مخزنة × ١٠٠)
S.addSub2 = async () => {
  await station(ST7().pairs, '🔟 لوح العشرات');
  const tile = i => sheetBtn(`.tile[data-i="${i}"]`);
  const t0 = (await data('addSub2')).rounds[0].tiles;
  await tile(0); await tile(t0.findIndex((v, i) => i > 0 && v + t0[0] !== 1000));   // خطأ: زوج مجموعه ليس ١٠
  expect((await data('addSub2')).gone.length === 0, 'زوج خاطئ قُبل');
  for (let r = 0; r < 2; r++) {
    const tiles = (await data('addSub2')).rounds[r].tiles;
    for (let i = 0; i < 6; i++) { const j = tiles.findIndex((v, k) => k > i && v + tiles[i] === 1000); if (j > 0) { await tile(i); await tile(j); } }
  }
  await typePad((await data('addSub2')).rounds[2].ans);
};
// ٥٢. ترتيب العمليات: داخل أعمق قوس، الضرب والقسمة قبل الجمع والطرح، والأسبق في القراءة أولاً
const firstOp = tk => {
  let lo = 0, hi = tk.length - 1;
  const open = tk.lastIndexOf('(');
  if (open >= 0) { lo = open + 1; hi = tk.indexOf(')', open) - 1; }
  const ops = tk.map((x, i) => i).filter(i => i >= lo && i <= hi && '+−×÷'.includes(tk[i]));
  return ops.find(i => '×÷'.includes(tk[i])) ?? ops[0];
};
S.operationLaws = async () => {
  await station(ST7().machine, '⚙️ آلة الأقواس');
  const tk0 = (await data('operationLaws')).cur, ok0 = firstOp(tk0);
  await sheetBtn(`.tok[data-i="${tk0.findIndex((x, i) => i !== ok0 && '+−×÷'.includes(x))}"]`);   // خطأ: عملية ليست الأولى
  expect((await data('operationLaws')).cur.length === tk0.length, 'عملية خاطئة نُفّذت');
  for (let r = 0; r < 2; r++) {
    for (;;) { const tk = (await data('operationLaws')).cur; if (!tk || tk.length === 1) break; await sheetBtn(`.tok[data-i="${firstOp(tk)}"]`); }
    await sheetBtn('#benchGo');
  }
  await typePad((await data('operationLaws')).rounds[2].ans);
};
// ٥٣. الكسور والقسمة: نصيب الطفل = الكعكات ÷ الأطفال
S.fractionDiv = async () => {
  await station(ST7().cakes, '🍰 طاولة الكعك');
  await sheetBtn('#benchGo');   // خطأ: كسر فارغ
  expect((await data('fractionDiv')).r === 0, 'كسر خاطئ قُبل');
  const q = (await data('fractionDiv')).rounds[0];
  await setCounter('fn', 0, q.cakes); await setCounter('fd', 0, q.kids); await sheetBtn('#benchGo');
  for (let r = 1; r < 3; r++) await typePad((await data('fractionDiv')).rounds[r].ans);
};
// ٥٤. النسب المئوية: الكسر من مئة، ثم السعر بعد الخصم
S.percentages = async () => {
  await station(ST7().sale, '🏷️ لافتات التخفيض');
  await sheetBtn('#benchGo');   // خطأ: ٠٪
  expect((await data('percentages')).r === 0, 'نسبة خاطئة قُبلت');
  await steps((await data('percentages')).rounds[0].ans, 10, 1, '[data-p="10"]', '', '[data-p="1"]', ''); await sheetBtn('#benchGo');
  for (let r = 1; r < 3; r++) await typePad((await data('percentages')).rounds[r].ans);
};
// ٥٥. النسبة والتناسب
S.ratioProportion = async () => {
  await station(ST7().mix, '🥣 طاولة الخلط');
  await sheetBtn('#benchGo');   // خطأ: سلة فارغة
  expect((await data('ratioProportion')).r === 0, 'نسبة خاطئة قُبلت');
  const q = (await data('ratioProportion')).rounds;
  await setCounter('o', 0, q[0].ans); await sheetBtn('#benchGo');
  await typePad(q[1].ans);
  await setCounter('A', 0, q[2].A); await setCounter('B', 0, q[2].B); await sheetBtn('#benchGo');
};
// ٥٦. الكسور: قطع اللوح = الكسر × عدد القطع، ثم كسر التفاح الأحمر
S.fractions = async () => {
  await station(ST7().choco, '🍫 ألواح الشوكولاتة');
  await sheetBtn('#benchGo');   // خطأ: بلا قطع
  expect((await data('fractions')).r === 0, 'قطع خاطئة قُبلت');
  for (let r = 0; r < 2; r++) { const [N, , , a, b] = (await data('fractions')).rounds[r].bar; for (let i = 0; i < a * N / b; i++) await panelClick(`.piece[data-i="${i}"]`); await sheetBtn('#benchGo'); }
  const q = (await data('fractions')).rounds[2];
  await setCounter('fn', 0, q.y); await setCounter('fd', 0, q.g + q.y); await sheetBtn('#benchGo');
};
// ٥٧. الأعداد الكسرية: ضخ أجزاء البراميل، ثم تحويل كسر غير اعتيادي
S.mixedNumbers = async () => {
  await station(ST7().barrels, '🛢️ مضخة البراميل');
  await sheetBtn('#benchGo');   // خطأ: براميل فارغة
  expect((await data('mixedNumbers')).r === 0, 'مقدار خاطئ قُبل');
  for (let r = 0; r < 2; r++) { const q = (await data('mixedNumbers')).rounds[r]; for (let i = 0; i < q.parts; i++) await tap('#pump'); await sheetBtn('#benchGo'); }
  const q = (await data('mixedNumbers')).rounds[2];
  await setCounter('fw', 0, Math.floor(q.tot / q.den)); await setCounter('fn', 0, q.tot % q.den); await setCounter('fd', 0, q.den); await sheetBtn('#benchGo');
};
// ٥٨. الكسور والكسور العشرية: كل خزان عشرة أقسام، والهدف كسر أو عشري أو نسبة
S.decimalFractions = async () => {
  const T = W.village.TANKS, m = () => G(() => window.__game.state.missions.tanks);
  for (let i = 0; i < 3; i++) {
    await goTo(T[i].x, T[i].y + 10);
    const want = (await m()).targets[i].v;
    for (let k = 0; k < want + (i === 0 ? 1 : 0); k++) await tap('💧 اضخ (اضغط مطولاً)', false);
    if (i === 0) {   // خطأ: قسم زائد
      await press('🔒 أغلق الصمام'); expect(!(await m()).done[0], 'خزان فائض قُبل');
      await press('↩ صرّف قليلاً');
    }
    await press('🔒 أغلق الصمام');
  }
};

/* ═══ الوحدة ٤: القياس (٢) (طريق القافلة) ═══ */
const ST8 = () => W.caravan.ST8, ST9 = () => W.workshop.ST9;
// مطابقة: اضغط العنصر i ثم بطاقته (البطاقة تحمل رقم عنصرها في data-v)
const matchAll = async n => { for (let i = 0; i < n; i++) { await sheetBtn(`[data-r="${i}"]`); await sheetBtn(`.mt.val[data-v="${i}"]`); } };
const matchWrong = async (id) => { await sheetBtn('[data-r="0"]'); await sheetBtn('.mt.val[data-v="1"]'); expect((await data(id)).gone.length === 0, 'مطابقة خاطئة قُبلت'); };
// ٥٩. السعة والكتلة: غالون = ٤ كوارت، ١٠ لترات ≈ ٢٫٢ غالون، ١ كغ ≈ ٢٫٢ رطل
S.capacityMass = async () => {
  await station(ST8().fuel, '⛽ مضخة الوقود');
  await sheetBtn('#benchGo');   // خطأ: صفر كوارت
  expect((await data('capacityMass')).r === 0, 'كمية خاطئة قُبلت');
  const q = (await data('capacityMass')).rounds;
  await setCounter('q', 0, q[0].ans); await sheetBtn('#benchGo');
  await typePad(q[1].ans); await typePad(q[2].ans);
};
// ٦٠. المسافة: تحويلات، ثم ترتيب الأطوال من الأقصر
S.distance = async () => {
  await station(ST8().signs, '🧭 خرائط الدليل');
  const q = (await data('distance')).rounds;
  await typePad(q[0].ans + 1);   // خطأ
  expect((await data('distance')).r === 0, 'تحويل خاطئ قُبل');
  await typePad(q[0].ans); await typePad(q[1].ans);
  for (const i of q[2].items.map((it, i) => i).sort((a, b) => q[2].items[a].mm - q[2].items[b].mm)) await sheetBtn(`.tile[data-i="${i}"]`);
  await sheetBtn('#benchGo');
};
// ٦١. المناطق الزمنية (٢): الوصول = الإقلاع + المدة + فرق التوقيت
S.timeZones2 = async () => {
  await station(ST8().flights, '✈️ لوحة الوصول');
  const d0 = await data('timeZones2'); if (mod(d0.rounds[0].ans - d0.tm, 1440) === 0) await sheetBtn('[data-m="60"]');
  await sheetBtn('#benchGo');   // خطأ: وقت الإقلاع
  expect((await data('timeZones2')).r === 0, 'وقت خاطئ قُبل');
  for (let r = 0; r < 3; r++) { const d = await data('timeZones2'); await steps(mod(d.rounds[r].ans - d.tm, 1440), 60, 15, '[data-m="60"]', '', '[data-m="15"]', ''); await sheetBtn('#benchGo'); }
};
// ٦٢. السنوات الكبيسة: تُقسم على ٤ إلا سنوات القرن التي لا تُقسم على ٤٠٠
const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
S.leapYears = async () => {
  await station(ST8().century, '📜 جدار القرن');
  const y0 = (await data('leapYears')).rounds[0].years;
  await panelClick(`.stone[data-i="${y0.findIndex(y => !leap(y))}"]`); await sheetBtn('#benchGo');   // خطأ: سنة ليست كبيسة
  expect((await data('leapYears')).r === 0, 'سنة غير كبيسة قُبلت');
  await panelClick(`.stone[data-i="${y0.findIndex(y => !leap(y))}"]`);   // إلغاء اختيارها
  for (let r = 0; r < 2; r++) { const ys = (await data('leapYears')).rounds[r].years; for (let i = 0; i < ys.length; i++) if (leap(ys[i])) await panelClick(`.stone[data-i="${i}"]`); await sheetBtn('#benchGo'); }
  await typePad((await data('leapYears')).rounds[2].ans);
};
// ٦٣. المستطيلات: مطابقة المساحات ثم المحيطات، ثم الطول = المساحة ÷ العرض
S.rectangles = async () => {
  await station(ST8().rects, '🌿 بطاقات الأحواض');
  await matchWrong('rectangles');
  await matchAll(3); await matchAll(3);
  await typePad((await data('rectangles')).rounds[2].ans);
};
// ٦٤. الأشكال غير المنتظمة: المربعات الكاملة + نصف عدد الأنصاف، ومتوازي الأضلاع = القاعدة × الارتفاع
S.irregularShapes = padLesson('irregularShapes', '🌱 مخطط الواحة', () => ST8().oasis, (d, r) => d.rounds[r].ans);

/* ═══ الوحدة ٥: الهندسة (ورشة البنّاء) ═══ */
// ٦٥. تصنيف الرباعيات: أضلاع متساوية، زوايا قائمة، زوج واحد متوازٍ، زوجان متوازيان
const QUADS = { sq: [1, 1, 0, 1], rect: [0, 1, 0, 1], rh: [1, 0, 0, 1], para: [0, 0, 0, 1], trap: [0, 0, 1, 0], kite: [0, 0, 0, 0], irr: [0, 0, 0, 0] };
S.classifyShapes = async () => {
  await station(ST9().tiles, '🕌 لوح البلاط');
  await sheetBtn('#benchGo');   // خطأ: صف بلا بلاط
  expect((await data('classifyShapes')).r === 0, 'تصنيف خاطئ قُبل');
  for (let r = 0; r < 3; r++) { const q = (await data('classifyShapes')).rounds[r]; for (let i = 0; i < q.tiles.length; i++) if (QUADS[q.tiles[i]][q.k]) await panelClick(`.stone[data-i="${i}"]`); await sheetBtn('#benchGo'); }
};
// ٦٦. تحويل المضلعات: نقاط على المستوى الإحداثي (الأصل عند ١٥٠، ١١٦ وكل وحدة ٢٤ بكسل)
S.transformPolygons = async () => {
  await station(ST9().flag, '🚩 قماش العلم');
  await sheetBtn('#benchGo');   // خطأ: بلا نقاط
  expect((await data('transformPolygons')).r === 0, 'صورة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) { for (const [x, y] of (await data('transformPolygons')).rounds[r].image) await canvasClick('cp', 150 + x * 24, 116 - y * 24); await sheetBtn('#benchGo'); }
};
// ٦٧. الزوايا: على مستقيم ١٨٠°، حول نقطة ٣٦٠°، القائمة ٩٠° (المنقلة تبدأ عند ٣٠°)
S.measureAngles = async () => {
  await station(ST9().protractor, '📐 المنقلة');
  if ((await data('measureAngles')).rounds[0].ans === 30) await sheetBtn('[data-a="1"]');
  await sheetBtn('#benchGo');   // خطأ: الزاوية الابتدائية
  expect((await data('measureAngles')).r === 0, 'زاوية خاطئة قُبلت');
  for (let r = 0; r < 3; r++) { const d = await data('measureAngles'); await steps(d.rounds[r].ans - d.set, 10, 1, '[data-a="10"]', '[data-a="-10"]', '[data-a="1"]', '[data-a="-1"]'); await sheetBtn('#benchGo'); }
};
// ٦٨. المنشورات والأهرامات: مطابقة الرؤوس ثم الأوجه، ثم عدد الحواف
const SOL = [['prism', 4], ['prism', 3], ['prism', 5], ['pyr', 4], ['pyr', 3], ['pyr', 5]];
S.prisms = async () => {
  await station(ST9().crates, '📦 بطاقات الصناديق');
  await matchWrong('prisms');
  await matchAll(3); await matchAll(3);
  const [t, k] = SOL[(await data('prisms')).rounds[2].s]; await typePad(t === 'prism' ? 3 * k : 2 * k);
};
// ٦٩. المجسمات المنتظمة: شكل الوجه وعدد الأوجه، ثم أويلر: الحواف = الأوجه + الرؤوس − ٢
const PLAT = [[3, 4, 4], [4, 6, 8], [3, 8, 6], [5, 12, 20], [3, 20, 12]];   // [أضلاع الوجه، الأوجه، الرؤوس]
S.regularPolyhedra = async () => {
  await station(ST9().crystals, '💎 فرن الكريستال');
  await sheetBtn('#benchGo');   // خطأ: بلا وجه
  expect((await data('regularPolyhedra')).r === 0, 'كريستالة خاطئة قُبلت');
  for (let r = 0; r < 2; r++) { const [f, F] = PLAT[(await data('regularPolyhedra')).rounds[r].s]; await sheetBtn(`.facebtn[data-f="${f}"]`); await setCounter('nf', 0, F); await sheetBtn('#benchGo'); }
  const [, F, V] = PLAT[(await data('regularPolyhedra')).rounds[2].s]; await typePad(F + V - 2);
};

/* ── البوابات: لا طريق عبرها قبل وقتها ── */
const GATES = [
  { after: 'sequences', name: 'بوابة السوق', a: { x: 1380, y: 640 }, b: { x: 1620, y: 640 } },
  { after: 'areaPerimeterT1', name: 'بوابة الميناء', a: { x: 2200, y: 640 }, b: { x: 2400, y: 640 } },
  { after: 'coordinates', name: 'بوابة القلعة', a: { x: 1240, y: 1660 }, b: { x: 1240, y: 1780 } },
  { after: 'specialNumbers', name: 'بوابة ساحة المهرجان', a: { x: 1240, y: 2540 }, b: { x: 1240, y: 2680 } },
  { after: 'probabilityLang', name: 'بوابة سوق الجمعية', a: { x: 1240, y: 3440 }, b: { x: 1240, y: 3580 } },
  { after: 'decimalFractions', name: 'بوابة طريق القافلة', a: { x: 1240, y: 4440 }, b: { x: 1240, y: 4580 } },
  { after: 'irregularShapes', name: 'بوابة ورشة البنّاء', a: { x: 1240, y: 5440 }, b: { x: 1240, y: 5580 } }
];
const pathLen = (a, b) => G(([a, b]) => window.__game.findPath(a, b).length, [a, b]);

/* ── رمز التقدّم ── */
async function checkProgressCode(played) {
  const before = await G(() => JSON.stringify(window.__game.state.quests.done));
  await G(() => document.getElementById('bBag').click()); await sleep(150);
  await panelClick('#codeBtn');
  await until(() => G(() => document.getElementById('codeBox')?.value.startsWith('RM')), 'ظهور الرمز');
  const code = await G(() => document.getElementById('codeBox').value);
  console.log(`   طول الرمز: ${code.length} حرفاً`);
  await G(() => localStorage.clear()); await page.reload();
  await page.click('#bCode');
  await page.fill('#codeIn', code.slice(0, -12)); await page.click('#bCheck'); await sleep(300);   // رمز مقطوع
  expect(await G(() => !!document.getElementById('bCheck') && !document.getElementById('bYes')), 'رمز مقطوع قُبل');
  await page.fill('#codeIn', '  ' + code + '\n'); await page.click('#bCheck');   // مسافات حول الرمز كما يحدث عند اللصق
  await until(() => G(() => !!document.getElementById('bYes')), 'قبول الرمز');
  const msg = await G(() => document.getElementById('codeMsg').textContent);
  expect(msg.includes('مختبر') && msg.includes(ar(played)), 'معاينة خاطئة: ' + msg);
  await page.click('#bYes');
  await until(() => G(() => !!window.__game.W), 'دخول القرية بعد الاستعادة');
  await settle();
  expect(await G(() => JSON.stringify(window.__game.state.quests.done)) === before, 'الدروس المستعادة لا تطابق الأصل');
  expect(await G(() => localStorage.getItem('ramimath_village_v1') !== null), 'المغامرة المستعادة لم تُحفظ على الجهاز');
}

/* ── التشغيل ── */
let failures = 0;
function expect(ok, msg) { if (!ok) throw new Error(msg); }
try {
  await page.goto(URL_);
  await G(() => localStorage.clear()); await page.reload();
  await page.click('#bNew'); await page.fill('#hname', 'مختبر'); await page.click('#bGo');
  await until(() => G(() => !!window.__game.W), 'دخول القرية');
  await settle();
  const vil = await G(async () => { const v = await import('./world/village.js'), c = await import('./missions/convoy.js'), t = await import('./missions/tanks.js'); return { PILE: v.PILE, SIGNAL: v.SIGNAL, VAN: c.VAN, TANKS: t.TANKS }; });
  W.village = vil;
  W.market = await G(async () => { const m = await import('./world/market.js'); return { BENCH: m.BENCH, BOARD: m.BOARD, BAYS: m.BAYS, CAL: m.CAL, PEN: m.PEN }; });
  W.harbor = await G(async () => { const h = await import('./world/harbor.js'); return { PIER_Y: h.PIER_Y, SEA_X: h.SEA_X, CRATES: h.CRATES, FRAME_TABLE: h.FRAME_TABLE, GIFT_TABLE: h.GIFT_TABLE, ROOF_TABLE: h.ROOF_TABLE, FISH_STAND: h.FISH_STAND, POOL_STAND: h.POOL_STAND, MILL_STAND: h.MILL_STAND, BEACH: h.BEACH }; });
  W.fort = await G(async () => { const f = await import('./world/fort.js'); return { BW: f.BW, ST4: f.ST4 }; });
  W.festival = await G(async () => { const f = await import('./world/festival.js'); return { ST5: f.ST5, ST6: f.ST6, VISITORS: f.VISITORS }; });
  W.coop = await G(async () => { const c = await import('./world/coop.js'); return { ST7: c.ST7 }; });
  W.caravan = await G(async () => { const c = await import('./world/caravan.js'); return { ST8: c.ST8 }; });
  W.workshop = await G(async () => { const w = await import('./world/workshop.js'); return { ST9: w.ST9 }; });
  const lessons = await G(async () => (await import('./content/lessons.js')).LESSONS.map(l => ({ id: l.id, title: l.title, giver: l.giver, u: l.u })));
  if (!FROM) for (const g of GATES) expect(await pathLen(g.a, g.b) === 0, `${g.name} مفتوحة قبل وقتها`);
  if (FROM) {   // الدروس السابقة منجزة (بنجمة) ثم إعادة التحميل لتُبنى البوابات من الحفظ
    await G(ids => { const g = window.__game, s = g.state; ids.forEach(id => { s.quests.done[id] = Date.now(); const d = g.quests.data(id); d.stars = d.stars || 1; d.chStage = 0; }); s.levelSeen = 10; }, lessons.slice(0, FROM).map(l => l.id));
    await G(async () => (await import('./core/events.js')).bus.emit('save')); await sleep(800);
    await page.reload(); await sleep(1500); await page.click('#bCont'); await until(() => G(() => !!window.__game.W), 'العودة إلى القرية'); await settle();
    console.log(`⏩ بدء من الدرس ${FROM + 1}: «${lessons[FROM].title}»`);
  }
  let played = 0;
  for (const [idx, l] of lessons.entries()) {
    if (idx < FROM) continue;
    if (played >= UPTO) break;
    if (!S[l.id]) { console.log(`⏸  توقف عند «${l.title}» (${l.id}): لم يُكتب حله في الاختبار بعد`); break; }
    const t0 = Date.now(), e0 = errors.length;
    try {
      await talk(l.giver);
      await S[l.id]();
      const ch = await solveChallenge(l.id);
      await until(() => isDone(l.id), 'إنهاء الدرس', 60000);
      await settle(60000, 2000);
      if (errors.length > e0) throw new Error('أخطاء في الكونسول: ' + errors.slice(e0).join(' / '));
      console.log(`✅ ${l.title}${ch ? ' + التحدي' : ''} (${((Date.now() - t0) / 1000).toFixed(1)} ث)`);
      if (l.id === 'sequences') {   // مغامرة ختام الوحدة الأولى
        await settle(); await G(() => window.__game.finale(0)); await until(() => G(() => !!document.querySelector('#panel #acGo')), 'بداية الختام', 5000); await panelClick('#acGo');
        await solveRounds(() => G(() => { const f = window.__game.state.finales[0]; return f.run ? f.run.ch : { i: 10 }; }));
        await until(() => G(() => !!document.querySelector('#panel #acEnd')), 'نهاية الختام', 8000);
        expect(await G(() => window.__game.state.finales[0].plays === 1), 'سجل الختام'); await panelClick('#acEnd'); await settle();
        console.log('👑 مغامرة ختام الوحدة الأولى: ١٠ جولات');
      }
      if (idx === 2) {   // المستويات: بعد ثلاثة دروس ونشاط واحد يرتقي إلى المستوى ٢، ويُعرض الاحتفال
        await until(() => G(() => window.__game.state.levelSeen >= 2 && document.getElementById('lvlN').textContent === '٢'), 'الارتقاء إلى المستوى ٢', 8000);
        if (await G(() => !!document.querySelector('#panel .lvUp'))) { await G(() => document.querySelector('#panel [data-close]').click()); await settle(); }   // قد يكون الاحتفال ظهر قبلها
        console.log('⭐ ارتقى إلى المستوى ٢ وظهر الاحتفال');
        const ach = await G(() => window.__game.state.achievements), stats = await G(() => window.__game.state.stats);   // الأوسمة: المثابرة تُكسب من المحاولات الخاطئة المقصودة
        expect(ach.b_persist && stats.persist >= 20, 'وسام المثابر لم يُفتح: ' + JSON.stringify(stats));
        await G(() => document.getElementById('bAch').click()); await until(() => G(() => document.querySelectorAll('#panel .bd.on').length >= 1), 'لوحة الأوسمة', 5000);
        await G(() => document.querySelector('#panel [data-close]').click()); await settle();
        console.log('🏅 وسام «المثابر» مفتوح ويظهر في لوحة الأوسمة');
        const gm = await G(() => window.__game.state.gems); expect(gm >= 24, 'الجواهر لم تُجمع: ' + gm);   // ٣ تحديات × ٨ + نشاط
        await G(() => document.getElementById('gemPill').click()); await until(() => G(() => !!document.querySelector('#panel [data-buy="flowers"]')), 'متجر الزينة', 5000);
        await panelClick('[data-buy="flowers"]'); expect(await G(() => !!window.__game.state.decor.flowers), 'لم تُشترَ الزينة');
        await G(() => document.querySelector('#panel [data-close]').click()); await settle();
        console.log(`💎 ${gm} جوهرة، واشترى أصيص زهور لساحة البئر`);
      }
      if (idx === 0 && ch) {   // النشاط الاختياري بعد أول درس: من رحلة الدروس، ثم إعادة اللعب
        await G(id => window.__game.activity(id), l.id);
        await until(() => G(() => !!document.querySelector('#panel #acGo')), 'شاشة بداية النشاط', 5000); await panelClick('#acGo');
        await solveRounds(() => G(id => { const a = window.__game.state.activities[id]; return a.run ? a.run.ch : { i: 6 }; }, l.id));
        await until(() => G(() => !!document.querySelector('#panel #acEnd')), 'نهاية النشاط', 8000);
        const r = await G(id => window.__game.state.activities[id], l.id); expect(r.plays === 1 && r.best === 1 && !r.run, 'سجل النشاط: ' + JSON.stringify(r));
        await panelClick('#acEnd'); await settle();
        console.log('🎲 نشاط الدرس: ٦ جولات، ثم الحفظ والرجوع');
        await G(id => { window.__game.quests.data(id).stars = 3; }, l.id);   // تحدي الخبير يُفتح بثلاث نجوم
        await G(id => window.__game.expert(id), l.id); await until(() => G(() => !!document.querySelector('#panel #acGo')), 'بداية الخبير', 5000); await panelClick('#acGo');
        await solveRounds(() => G(id => { const e = window.__game.state.expert[id]; return e.run ? e.run.ch : { i: 6 }; }, l.id));
        await until(() => G(() => !!document.querySelector('#panel #acEnd')), 'نهاية الخبير', 8000);
        expect(await G(id => window.__game.state.expert[id].plays === 1, l.id), 'سجل الخبير'); await panelClick('#acEnd'); await settle();
        console.log('⚡ تحدي الخبير: ٦ جولات صعبة');
        const T1 = await G(() => window.__game.TREASURES[0]); await goTo(T1.x, T1.y + 14); await press('🎁 افتح الكنز');   // كنز القرية الأول
        await until(() => G(() => !!document.querySelector('#panel #acGo')), 'صندوق الكنز', 5000); await panelClick('#acGo');
        await solveRounds(() => G(() => { const r = window.__game.state.treasureRun; return r ? r.ch : { i: 1 }; }));
        await until(() => G(() => !!document.querySelector('#panel #acEnd')), 'فتح الكنز', 8000); await panelClick('#acEnd'); await settle();
        expect(await G(() => !!window.__game.state.treasure.t1), 'لم يُسجل الكنز'); console.log('🎁 كنز مخفي فُتح بلغز');
        await settle(); await G(() => window.__game.daily()); await until(() => G(() => !!document.querySelector('#panel .chSheet')), 'فتح مهمة اليوم', 5000); await solveRounds(() => G(() => { const r = window.__game.state.daily.run; return r ? r.ch : { i: 3 }; }));   // مهمة اليوم
        await until(() => G(() => !!document.querySelector('#panel #acEnd')), 'نهاية مهمة اليوم', 8000); await panelClick('#acEnd'); await settle();
        expect(await G(() => window.__game.state.daily.streak === 1), 'سلسلة الأيام'); console.log('📅 مهمة اليوم: ٣ جولات مراجعة');
      }
      played++;
    } catch (e) {
      failures++; console.log(`❌ ${l.title} (${l.id}): ${e.message}`);
      await page.screenshot({ path: join(ROOT, 'tests', `fail-${l.id}.png`) });
      break;   // الدروس مرتبة: لا معنى للمتابعة بعد درس فاشل
    }
    for (const g of GATES) {
      const due = await isDone(g.after), open = await pathLen(g.a, g.b) > 0;
      if (due && !open) { failures++; console.log(`❌ ${g.name} لم تُفتح بعد «${l.title}»`); }
      else if (!due && open) { failures++; console.log(`❌ ${g.name} فُتحت قبل وقتها (بعد «${l.title}»)`); }
      else if (g.after === l.id) console.log(`🚪 ${g.name} فُتحت في وقتها`);
    }
  }
  if (FROM + played === lessons.length) {   // النهاية: الهدف يشير إلى منصة التخرّج
    const obj = await G(() => document.getElementById('objective').textContent);
    if (obj.includes('التخرّج')) console.log('🎓 ظهر هدف منصة التخرّج'); else { failures++; console.log(`❌ الهدف بعد آخر درس: «${obj}»`); }
    const ach = await G(() => window.__game.state.achievements), want = ['unit1', 'unit2', 'unit3', 'unit4', 'term1', 't2u1', 't2u2', 't2u3', 't2u4', 't2u5', 'all69'], miss = want.filter(a => !ach[a]).filter(a => !FROM || want.indexOf(a) >= want.length - 4)   // في وضع الدفعات: إنجازات الوحدات التي لُعبت في هذه الدفعة فقط;
    if (miss.length) { failures++; console.log('❌ إنجازات الوحدات الناقصة: ' + miss.join('، ')); } else console.log('🏆 إنجازات الوحدات كلها مفتوحة');
  }
  if (!failures) {   // رمز التقدّم: نسخ من الحقيبة، مسح الجهاز، رفض رمز تالف، ثم استعادة كاملة
    try { await checkProgressCode(FROM + played); console.log('🔑 رمز التقدّم: نُسخ، ورُفض الرمز التالف، واستُعيدت المغامرة كاملة'); }
    catch (e) { failures++; console.log('❌ رمز التقدّم: ' + e.message); }
  }
  console.log(`\nالنتيجة: نجح ${played} من ${lessons.length} درساً${failures ? ` — وفشل ${failures}` : ''}`);
} catch (e) { failures++; console.log('❌ ' + e.message); }
finally { await browser.close(); server.close(); }
process.exit(failures ? 1 : 0);
