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
const GRADE = +((process.argv.find(a => a.startsWith('--grade=')) || '--grade=6').split('=')[1]);   // --grade=5: دروس الصف الخامس (بحفظه المنفصل)
const URL_ = `http://localhost:${server.address().port}/` + (D3 ? '?3d=1' : '?2d=1') + (GRADE !== 6 ? `&grade=${GRADE}` : '');   // العرض ثلاثي الأبعاد صار الافتراضي؛ النسخة العادية تُختبر صراحةً

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
  if (!ok) throw new Error(`الزر غير موجود: «${label}» — الأزرار: ${await G(() => [...document.querySelectorAll('#actions button')].map(b => b.textContent).join(' | '))} — الحالة: ${await G(async () => JSON.stringify({ busy: window.__game.game.busy, pl: [Math.round(window.__game.W.player.x), Math.round(window.__game.W.player.y)], dialog: document.getElementById('dialog').className, panel: document.getElementById('panel').className, screen: document.getElementById('screen').className, extra: [...document.querySelectorAll('.advUnlock, .hall, .grand, .tour, .lvUp')].map(e => e.className).join(','), cur: window.__game.quests.current()?.id, started: window.__game.quests.current() && window.__game.quests.isStarted(window.__game.quests.current().id), t1: window.__game.W.savedAt, t2: (await new Promise(r => setTimeout(r, 400)), window.__game.W.savedAt) }))}`);
  await sleep(wait);
}
// يذهب إلى صاحب الدرس ويتحدث معه (يبدأ الدرس أو يستأنفه)
async function talk(giver) {
  const n = await G(id => { const n = window.__game.W.npcs.find(n => n.id === id); return { x: n.x, y: n.y, name: n.name }; }, giver);
  await goTo(n.x, n.y + 26);
  for (let k = 0; k < 3; k++) {   // في 3D بعد إعادة التحميل قد تضيع النقرة الأولى أثناء بناء المنطقة: نعيدها ما دام الدرس لم يبدأ
    await press('💬 ' + n.name);
    await settle(20000, D3 ? 1500 : 600);   // بعد بطاقة الوحدة يظهر حوار المقدمة بعد لحظة (أبطأ في 3D): ننتظر هدوءاً قصيراً حتى لا نغادر قبله
    if (await G(() => { const q = window.__game.quests, c = q.current(); return !c || q.isStarted(c.id) || !document.querySelector('#actions button'); })) break;
  }
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
      await until(async () => { if (await G(() => document.getElementById('dialog').classList.contains('on'))) await G(() => document.getElementById('dialog').click());   // حوار متأخر فوق التحدي (أبطأ في 3D): نتقدم فيه كما يفعل الطالب
        return (await getCh()).i === i + 1 && await G(n => { const s = document.querySelector('#panel .chSheet'); return !s || !s.querySelector('.chBurst') && (+s.dataset.i === n || !!s.querySelector('#chFin, #acEnd')); }, i + 1); }, `حل الجولة ${i + 1} (${it.type}: ${it.q.replace(/<[^>]+>/g, '').slice(0, 50)})`, 5000);
    } catch (e) { throw new Error(e.message + ' — الحالة: ' + JSON.stringify(await G(() => ({ busy: window.__game.game.busy, dialog: document.getElementById('dialog').className + ':' + document.getElementById('dialog').textContent.slice(0, 80), screen: document.getElementById('screen').className, panel: document.getElementById('panel').className, msg: document.getElementById('benchMsg')?.textContent, pad: document.getElementById('npd')?.textContent, head: document.getElementById('panel').textContent.replace(/s+/g, ' ').slice(0, 160), di: (window.__game.state.daily && window.__game.state.daily.run) ? window.__game.state.daily.run.ch.i : null })))); }
  }
}
async function solveChallenge(id) {
  await until(async () => { if (await G(() => document.getElementById('dialog').classList.contains('on'))) await G(() => document.getElementById('dialog').click());   // جملة الختام قد تسبق التحدي (الصف الخامس)
    return (await isDone(id)) || (await data(id)).chStage === 2; }, 'إنهاء مهمة العالم', 60000);
  if (await isDone(id)) return false;
  await until(async () => { const st = await G(() => ({ ch: !!document.querySelector('#panel .chSheet'), dialog: document.getElementById('dialog').classList.contains('on') }));
    if (st.dialog) await G(() => document.getElementById('dialog').click());
    else if (!st.ch) await G(() => { const p = document.getElementById('panel'); if (p.classList.contains('on') && p.querySelector('[data-close]') && !p.querySelector('.chSheet')) p.querySelector('[data-close]').click();   // نافذة أخرى (احتفال الارتقاء) غطّت التحدي
      else { const b = [...document.querySelectorAll('#actions button')].find(b => b.textContent.startsWith('🎯')); if (b && !p.classList.contains('on')) b.click(); } });   // كما يفعل الطالب: زر «🎯» يستأنف التحدي
    return st.ch; }, 'فتح التحدي', 30000).catch(async e => { throw new Error(e.message + ' — ' + await G(() => JSON.stringify({ busy: window.__game.game.busy, panel: document.getElementById('panel').className, panelHTML: document.getElementById('panel').innerHTML.slice(0, 120), dialog: document.getElementById('dialog').className, btns: [...document.querySelectorAll('#actions button')].map(b => b.textContent) }))); });
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
  const q0 = (await data('mentalAddSub')).rounds[0], wrong = q0.P - q0.p === 50 ? 100 : 50;   // مبلغ خاطئ فعلاً (إن كان الباقي الصحيح ٥٠ نعطي ١٠٠)
  await panelClick(`.money[data-v="${wrong}"]`); await sheetBtn('#benchGo');
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

/* ═══ الصف السابع — من المرسى فما بعد: محطات missions/g7/kit.js تُحل من بيانات الجولة نفسها ═══ */
async function kitRound(id, r, wrong) {
  const q = (await data(id)).rounds[r];
  if (q.t === 'kp') return typePad(wrong ? q.ans + 1 : q.ans);
  if (q.t === 'pick') return sheetBtn(`[data-o="${q.opts.findIndex(s => (s === q.ans) !== wrong)}"]`);
  if (q.t === 'multi') { if (!wrong) for (const s of q.ok) await panelClick(`[data-q="${q.opts.indexOf(s)}"]`); return sheetBtn('#benchGo'); }
  if (q.t === 'order') { for (const s of wrong ? q.want.slice().reverse() : q.want) await panelClick(`[data-q="${q.items.indexOf(s)}"]`); return sheetBtn('#benchGo'); }
  if (!wrong) {   // dial: المؤشر يبدأ من s (غير الجواب)، فالخطأ تثبيته كما هو
    let diff = Math.round(q.ans * 1000) - (await data(id)).k;
    for (const s of q.st.map(s => Math.round(s * 1000)).sort((a, b) => b - a)) { while (diff >= s) { await panelClick(`[data-dv="${s / 1000}"]`); diff -= s; } while (diff <= -s) { await panelClick(`[data-dv="${-s / 1000}"]`); diff += s; } }
  }
  return sheetBtn('#benchGo');
}
const kitLesson = (id, reg, key, label, n = 3) => async () => {
  await station(W.g7[reg][key], label);
  await kitRound(id, 0, true);
  expect((await data(id)).r === 0, 'جواب خاطئ قُبل');
  for (let r = 0; r < n; r++) await kitRound(id, r, false);
};
const KIT7 = [
  ['orderDec7', 'H', 'depths', '⚓ أعماق المرسى'], ['roundDec7', 'H', 'fuel', '⛽ عدّاد الوقود'], ['addSubDec7', 'H', 'load', '🚤 حمولة القارب'],
  ['mulDec7', 'H', 'nets', '🕸️ حبال الشباك'], ['divDec7a', 'H', 'catch', '🐟 تقسيم الصيد'], ['divDec7b', 'H', 'oil', '🫒 قوارير الزيت'],
  ['tenths7', 'H', 'map', '🗺️ خريطة المقياس'], ['estimate7', 'H', 'quick', '⚡ الحساب السريع'], ['units7', 'H', 'store', '🏗️ مستودع الشحن'],
  ['chooseUnits7', 'H', 'cards', '🏷️ بطاقات الشحن'],
  ['nameAngles7', 'F', 'towers', '🏹 أبراج الرماية'], ['measureAngles7', 'F', 'catapult', '🎯 منجنيق القلعة'], ['angleProblems7', 'F', 'gate', '🚪 بوابة الزوايا'],
  ['parallelLines7', 'F', 'bridge', '🌉 جسر الحبال'], ['simplify7', 'F', 'maps', '🗺️ خرائط الأقسام'], ['compareFrac7', 'F', 'rations', '🍯 حصص المؤونة'],
  ['improperMixed7', 'F', 'loaves', '🍞 أرغفة الحرس'], ['addSubFrac7', 'F', 'clay', '🧱 خليط الطين'], ['fracQuantity7', 'F', 'store', '🏺 مخزن القلعة'],
  ['fracToDec7', 'F', 'sand', '⏳ ساعة الرمل'], ['orderFrac7', 'F', 'ladder', '🪜 سلّم الأسوار'], ['remainders7', 'F', 'tents', '⛺ خيام الحرس'],
  ['areaUnits7', 'E', 'carpet', '🟥 سجادة المسرح'], ['rectArea7', 'E', 'stage', '🎭 منصة العرض'], ['triArea7', 'E', 'flags', '🚩 رايات المثلثات'],
  ['paraTrap7', 'E', 'tent', '⛺ خيمة المهرجان'], ['circle7', 'E', 'ring', '⭕ حلبة الدائرة'], ['compound7', 'E', 'play', '🛝 ساحة الألعاب'],
  ['simplePct7', 'E', 'balloons', '🎈 بالونات النسبة'], ['equivPct7', 'E', 'board', '🔁 لوحة التكافؤ'], ['pctQuantity7', 'E', 'tickets', '🎟️ تذاكر المهرجان'],
  ['pctApply7', 'E', 'prizes', '🏆 جوائز السحب'],
  ['congruent7', 'D', 'seedlings', '🌱 شتلات متطابقة'], ['lineSym7', 'D', 'mirror', '🪞 أحواض المرآة'], ['rotSym7', 'D', 'wheel', '🎡 دولاب الماء'],
  ['symProps7', 'D', 'windows', '🪟 نوافذ البيت الزجاجي'], ['classifyQuad7', 'D', 'tree', '🌳 شجرة الرباعيات'], ['dataTypes7', 'D', 'ledger', '📒 سجل البستان'],
  ['findData7', 'D', 'sources', '🔎 مصادر المعلومات'], ['surveys7', 'D', 'survey', '📝 استبانة الزوار'], ['collectData7', 'D', 'tally', '✏️ ورقة العدّ'],
  ['freqTables7', 'D', 'freq', '📊 جدول التكرار'],
  ['addSubFrac7b', 'C', 'spices', '🌶️ ميزان البهارات'], ['fracQty7b', 'C', 'coupons', '🎟️ كوبونات الجمعية'], ['wholeTimesFrac7', 'C', 'juice', '🧃 صناديق العصير'],
  ['wholeDivFrac7', 'C', 'cakes', '🎂 تقطيع الكعك'], ['mulDivFrac7', 'C', 'recipes', '📜 وصفات الجمعية'], ['probScale7', 'C', 'luck', '🎯 مقياس الحظ'],
  ['outcomes7', 'C', 'prizes', '🎡 عجلة الجوائز'], ['exclusive7', 'C', 'balls', '🎱 سحب الكرات'], ['estimateProb7', 'C', 'dice', '🎲 تجربة المكعب'],
  ['mulDec7b', 'K', 'weights', '⚖️ أوزان القافلة'], ['divDec7c', 'K', 'water', '💧 حصص الماء'], ['pctCalc7', 'K', 'tolls', '🧾 رسوم الطريق'],
  ['pctChange7', 'K', 'prices', '🏷️ أسعار المحطات'], ['findPct7', 'K', 'trip', '🧭 نسبة الرحلة'], ['pieCharts7', 'K', 'ring', '🥧 حلقة الحمولة'],
  ['statMeasures7', 'K', 'log', '📏 سجل المسافات'], ['mean7', 'K', 'speed', '🐪 سرعة الجمال'], ['compareDist7', 'K', 'two', '🐫 قافلتان'],
  ['conclusions7', 'K', 'report', '📋 تقرير الرحلة'],
  ['expand7b', 'W', 'floor', '🧱 ألواح الأرضية'], ['formulas7b', 'W', 'mix', '🪣 جداول الخلطة'], ['coords7', 'W', 'site', '🗺️ مخطط الموقع'],
  ['axisLines7', 'W', 'plumb', '📏 خيوط الشاقول'], ['graphEq7', 'W', 'rail', '🛤️ سكة العربة'], ['ymxc7', 'W', 'ramp', '🏗️ منحدر الرافعة'],
  ['volume7', 'W', 'molds', '🧊 قوالب الخرسانة'], ['surfaceArea7', 'W', 'wrap', '🎁 تغليف الصناديق'], ['otherSurfaces7', 'W', 'paint', '🖌️ طلاء المجسمات']
];
for (const [id, reg, key, label] of KIT7) S[id] = kitLesson(id, reg, key, label);

/* ── البوابات: لا طريق عبرها قبل وقتها ── */
/* ═══ الصف السابع — قرية الخير (missions/g7/village.js) ═══ */
const clickN = async (sel, n) => { for (let i = 0; i < n; i++) await panelClick(sel); };
S.addSubInt7 = async () => {
  await station(W.g7.V.well, '🪣 مصعد البئر');
  await sheetBtn('#benchGo');   // خطأ: الدلو في نقطة البداية
  expect((await data('addSubInt7')).r === 0, 'موضع خاطئ قُبل');
  for (let r = 0; r < 3; r++) {
    const d = await data('addSubInt7'), q = d.rounds[r];
    if (q.t === 'gap') { await typePad(q.top - q.b); continue; }
    const lv = d.lvr === r ? d.lv : q.s;
    await steps(q.ans - lv, 5, 1, '[data-v="5"]', '[data-v="-5"]', '[data-v="1"]', '[data-v="-1"]');
    await sheetBtn('#benchGo');
  }
};
S.mulDivInt7 = async () => {
  await station(W.g7.V.ledger, '📒 دفتر الدكان');
  { const q = (await data('mulDivInt7')).rounds[0]; await typePad(q.l * q.k); }   // خطأ: بلا إشارة
  expect((await data('mulDivInt7')).r === 0, 'إشارة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const q = (await data('mulDivInt7')).rounds[r];
    if (q.t === 'loss') await typePad(-q.l * q.k);
    else if (q.t === 'debt') await typePad(-q.q);
    else { if (q.tgt < 0) await sheetBtn('[data-i="0"]'); await sheetBtn('#benchGo'); }
  }
};
S.multiples7 = async () => {
  await station(W.g7.V.falaj, '💧 مواعيد الفلج');
  { const q = (await data('multiples7')).rounds[0]; await sheetBtn(`[data-day="${q.ch[0]}"]`); }   // خطأ: تُفتح قناة واحدة
  expect((await data('multiples7')).r === 0, 'يوم خاطئ قُبل');
  for (let r = 0; r < 3; r++) await sheetBtn(`[data-day="${(await data('multiples7')).rounds[r].ans}"]`);
};
S.factors7 = async () => {
  await station(W.g7.V.beds, '🌷 أحواض الزهور');
  await sheetBtn('#benchGo');   // خطأ: صفّان فقط
  expect((await data('factors7')).r === 0, 'صفوف خاطئة قُبلت');
  { const q = (await data('factors7')).rounds[0]; let k = q.lo + 1; while (q.n % k) k++; await clickN('[data-v="1"]', k - 2); await sheetBtn('#benchGo'); }
  { const q = (await data('factors7')).rounds[1], g = (a, b) => b ? g(b, a % b) : a; await clickN('[data-v="1"]', g(q.a, q.b) - 2); await sheetBtn('#benchGo'); }
  { const q = (await data('factors7')).rounds[2]; for (let i = 0; i < q.cards.length; i++) if (q.cards[i] % q.k === 0) await panelClick(`[data-c="${i}"]`); await sheetBtn('#benchGo'); }
};
S.primes7 = async () => {
  await station(W.g7.V.sieve, '🌾 غربال البذور');
  await sheetBtn('#benchGo');   // خطأ: لم يُشطب شيء
  expect((await data('primes7')).r === 0, 'غربال ناقص قُبل');
  for (const v of [9, 15, 21, 27, 33, 39, 45]) await panelClick(`[data-n="${v}"]`);
  await sheetBtn('#benchGo');
  for (const v of [25, 35, 49]) await panelClick(`[data-n="${v}"]`);
  await sheetBtn('#benchGo');
  let n = (await data('primes7')).rounds[2].n;
  for (const p of [2, 3, 5, 7, 11]) while (n % p === 0) { await sheetBtn(`[data-p="${p}"]`); n /= p; }
};
S.powers7 = async () => {
  await station(W.g7.V.hive, '🐝 خلايا النحل');
  await sheetBtn('#benchGo');   // خطأ: إطار ضلعه ١٠
  expect((await data('powers7')).r === 0, 'إطار خاطئ قُبل');
  { const q = (await data('powers7')).rounds[0]; await clickN('[data-v="1"]', q.n - 10); await sheetBtn('#benchGo'); }
  { const v = (await data('powers7')).rounds[1].v; let be = null; for (let b = 2; b <= 10 && !be; b++) for (let e = 2; e <= 7; e++) if (b ** e === v) { be = [b, e]; break; }
    await clickN('[data-k="b"][data-v="1"]', be[0] - 2); await clickN('[data-k="e"][data-v="1"]', be[1] - 2); await sheetBtn('#benchGo'); }
  await typePad((await data('powers7')).rounds[2].n ** 3);
};
S.powersRoots7 = async () => {
  await station(W.g7.V.crates, '📦 صناديق التمر');
  await sheetBtn('#benchGo');   // خطأ: ضلع ٣
  expect((await data('powersRoots7')).r === 0, 'صندوق خاطئ قُبل');
  { const q = (await data('powersRoots7')).rounds[0]; await clickN('[data-v="1"]', q.n - 3); await sheetBtn('#benchGo'); }
  await typePad(-(await data('powersRoots7')).rounds[1].m);
  await sheetBtn(`[data-a="${(await data('powersRoots7')).rounds[2].n}"]`);
};
S.orderOps7 = async () => {
  await station(W.g7.V.board, '🧮 لغز اللوح');
  await panelClick('[data-k="0"]'); await panelClick('[data-k="3"]'); await sheetBtn('#benchGo');   // خطأ: القوس حول العملية كلها
  expect((await data('orderOps7')).r === 0, 'أقواس خاطئة قُبلت');
  for (let r = 0; r < 3; r++) { const [i, j] = (await data('orderOps7')).rounds[r].br; await panelClick(`[data-k="${i}"]`); await panelClick(`[data-k="${j}"]`); await sheetBtn('#benchGo'); }
};

/* ═══ الصف السابع — سوق الجبر (missions/g7/market.js) ═══ */
const setCf = async (k, v) => { const s = v > 0 ? 1 : -1; let n = Math.abs(v); while (n >= 10) { await panelClick(`[data-c="${k}"][data-v="${s * 10}"]`); n -= 10; } for (; n > 0; n--) await panelClick(`[data-c="${k}"][data-v="${s}"]`); };   // تغيير العدّاد بمقدار v (بخطوات ١٠ ثم ١)
S.algExpr7 = async () => {
  await station(W.g7.M.bags, '🍬 أكياس السوق');
  await sheetBtn('#benchGo');   // خطأ: العبارة صفر
  expect((await data('algExpr7')).r === 0, 'عبارة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) { const q = (await data('algExpr7')).rounds[r]; await setCf('a', q.a); await setCf('b', q.b); await sheetBtn('#benchGo'); }
};
S.likeTerms7 = async () => {
  await station(W.g7.M.sort, '🧺 فرز البضائع');
  await sheetBtn('#benchGo');   // خطأ: السلال فارغة
  expect((await data('likeTerms7')).r === 0, 'فرز خاطئ قُبل');
  for (let r = 0; r < 3; r++) { const w = (await data('likeTerms7')).rounds[r].want; await setCf('x', w.x); await setCf('y', w.y); await setCf('k', w.k); await sheetBtn('#benchGo'); }
};
S.expandBrackets7 = async () => {
  await station(W.g7.M.orders, '📦 طلبيات الجملة');
  { const q = (await data('expandBrackets7')).rounds[0]; await setCf('x', q.k * q.a); await setCf('k', q.b); await sheetBtn('#benchGo'); await setCf('k', -q.b); }   // خطأ: العدد دون ضرب
  expect((await data('expandBrackets7')).r === 0, 'فك خاطئ قُبل');
  for (let r = 0; r < 3; r++) { const q = (await data('expandBrackets7')).rounds[r], d = await data('expandBrackets7'); await setCf('x', q.k * q.a - d.cf.x); await setCf('k', q.k * q.b - d.cf.k); await sheetBtn('#benchGo'); }
};
S.formulas7 = async () => {
  await station(W.g7.M.prices, '🌶️ آلة الأسعار');
  { const q = (await data('formulas7')).rounds[0]; await setCf('a', q.b); await setCf('b', q.a); await sheetBtn('#benchGo'); await setCf('a', q.a - q.b); await setCf('b', q.b - q.a); }   // خطأ: الدوران مبدّلان
  expect((await data('formulas7')).r === 0, 'صيغة خاطئة قُبلت');
  await sheetBtn('#benchGo');
  { const q = (await data('formulas7')).rounds[1]; await typePad(q.a * q.n + q.b); }
  { const q = (await data('formulas7')).rounds[2]; await typePad(q.m); }
};
S.equations7 = async () => {
  await station(W.g7.M.scale, '⚖️ الكفّتان');
  const pick = async ok => {   // المعادلة الصحيحة: «أس + ب = ج» كما تكتبها اللعبة
    const i = await G(ok => { const q = window.__game.quests.data('equations7').rounds[0], ar = n => String(n).replace(/\d/g, x => '٠١٢٣٤٥٦٧٨٩'[x]), want = `${ar(q.a)}س + ${ar(q.b)} = ${ar(q.c)}`;
      return [...document.querySelectorAll('#panel [data-o]')].findIndex(b => (b.textContent === want) === ok); }, ok);
    await sheetBtn(`[data-o="${i}"]`); };
  await pick(false);   // خطأ: معادلة لا تصف الميزان
  expect((await data('equations7')).r === 0, 'معادلة خاطئة قُبلت');
  await pick(true);
  for (let r = 1; r < 3; r++) {
    const q = (await data('equations7')).rounds[r];
    if (q.a > 1) await sheetBtn('[data-m="d"]');   // خطأ: القسمة قبل إزالة الأوزان (تُرفض)
    let b = q.b; while (b >= 5) { await sheetBtn('[data-m="5"]'); b -= 5; } while (b > 0) { await sheetBtn('[data-m="1"]'); b--; }
    if (q.a > 1) await sheetBtn('[data-m="d"]');
    await sheetBtn('#benchGo');
  }
};

/* ═══ الصف الخامس — قرية الخير (missions/g5/village.js) ═══ */
S.placeValue5 = async () => {
  await station(W.g5.V.meter, '💧 عدّاد الخزان');
  await sheetBtn('#benchGo');   // خطأ: العدّاد على الأصفار
  expect((await data('placeValue5')).r === 0, 'قراءة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const d = await data('placeValue5'), want = [100000, 10000, 1000, 100, 10, 1].map(p => Math.floor(d.rounds[r].ans / p) % 10);
    for (let i = 0; i < 6; i++) for (let k = 0; k < (want[i] - d.dg[i] + 10) % 10; k++) await panelClick(`[data-w="${i}"][data-v="1"]`);
    await sheetBtn('#benchGo');
  }
};
S.orderRound5 = async () => {
  await station(W.g5.V.race, '🐪 بوابات السباق');
  const put = async (idx) => { for (const i of idx) await panelClick(`[data-c="${i}"]`); await sheetBtn('#benchGo'); };
  const sorted = (list, up) => list.map((v, i) => i).sort((a, b) => up ? list[a] - list[b] : list[b] - list[a]);
  { const q = (await data('orderRound5')).rounds[0]; await put(sorted(q.list, false)); }   // خطأ: ترتيب معكوس
  expect((await data('orderRound5')).r === 0, 'ترتيب خاطئ قُبل');
  for (let r = 0; r < 4; r++) {
    const q = (await data('orderRound5')).rounds[r];
    if (q.t === 'ord') await put(sorted(q.list, q.up)); else await typePad(Math.round(q.x / q.u) * q.u);
  }
};
S.sequences5a = async () => {
  await station(W.g5.V.beads, '📿 عقد اللؤلؤ');
  const fill = async (i, v) => { await panelClick(`[data-h="${i}"]`); await panelClick(`[data-v="${v}"]`); };
  for (let r = 0; r < 3; r++) {
    const d = await data('sequences5a'), q = d.rounds[r];
    if (r === 0) {   // خطأ: أول خرزة ناقصة بخرزة لا تتبع القاعدة
      const tray = (await data('sequences5a')).trays[0], wrong = tray.find(v => !q.holes.some(i => q.terms[i] === v));
      await fill(q.holes[0], wrong); for (const i of q.holes.slice(1)) await fill(i, q.terms[i]);
      await sheetBtn('#benchGo'); expect((await data('sequences5a')).r === 0, 'عقد خاطئ قُبل');
      await fill(q.holes[0], q.terms[q.holes[0]]);
    } else for (const i of q.holes) await fill(i, q.terms[i]);
    await sheetBtn('#benchGo');
  }
};
S.addSub5a = async () => {
  await station(W.g5.V.scale, '⚖️ ميزان التمر');
  await panelClick('[data-wt="1"]'); await sheetBtn('#benchGo');   // خطأ: ثقل واحد فقط
  expect((await data('addSub5a')).r === 0, 'وزن خاطئ قُبل');
  await panelClick('#wUndo');
  const q = (await data('addSub5a')).rounds;
  let diff = q[0].to - q[0].from; for (const w of [1000, 100, 10, 1]) { for (let k = 0; k < Math.floor(diff / w); k++) await panelClick(`[data-wt="${w}"]`); diff %= w; }
  await sheetBtn('#benchGo');
  await typePad(Math.round((q[1].a + q[1].b) * 10) / 10);
  await typePad(Math.round((q[2].a - q[2].b) * 10) / 10);
};
S.addMore5 = async () => {
  await station(W.g5.V.box, '💚 صندوق الخير');
  const q = (await data('addMore5')).rounds, tot = q[0].led.reduce((s, x) => s + x, 0);
  await typePad(tot + 1); expect((await data('addMore5')).r === 0, 'مجموع خاطئ قُبل');
  await typePad(tot);
  await panelClick('[data-t="0"]'); await sheetBtn('#benchGo'); expect((await data('addMore5')).r === 1, 'قارب خاطئ أبحر');   // خطأ: سلحفاة واحدة
  await panelClick('[data-t="0"]');
  const m = q[1].masses; let pick = null;
  for (let mask = 1; mask < 1 << m.length && !pick; mask++) { const idx = m.map((_, i) => i).filter(i => mask & 1 << i); if (idx.reduce((s, i) => s + m[i], 0) === q[1].cap) pick = idx; }
  for (const i of pick) await panelClick(`[data-t="${i}"]`); await sheetBtn('#benchGo');
  await typePad(q[2].days[q[2].miss]);
};

/* ═══ الصف الخامس — السوق الأسبوعي (missions/g5/market.js) ═══ */
S.multFacts5 = async () => {
  await station(W.g5.M.trays, '🍬 صواني الحلوى');
  await sheetBtn('#benchGo');   // خطأ: صينية ١ × ١
  expect((await data('multFacts5')).r === 0, 'صينية خاطئة قُبلت');
  for (let r = 0; r < 4; r++) {
    const q = (await data('multFacts5')).rounds[r];
    if (q.t === 'arr') { const k = q.rows !== undefined ? 'cl' : 'rw'; for (let i = 1; i < q.ans; i++) await panelClick(`[data-a="${k}"][data-v="1"]`); await sheetBtn('#benchGo'); }
    else await typePad(q.t === 'div' ? q.ans : q.price * q.n);
  }
};
S.writtenMult5 = async () => {
  await station(W.g5.M.carpet, '🧶 بساط الضرب');
  const parts = q => { if (q.dec) { const w = Math.floor(q.a), f = Math.round((q.a - w) * 10) / 10; return [w * q.b, Math.round(f * q.b * 10) / 10, Math.round(q.a * q.b * 10) / 10]; }
    const A = [q.a - q.a % 10, q.a % 10], B = [q.b - q.b % 10, q.b % 10]; return [A[0] * B[0], A[1] * B[0], A[0] * B[1], A[1] * B[1], q.a * q.b]; };
  for (let r = 0; r < 3; r++) {
    const v = parts((await data('writtenMult5')).rounds[r]);
    if (r === 0) { await typePad(v[0] + 10); for (const x of v.slice(1)) await typePad(x); expect((await data('writtenMult5')).r === 0, 'شبكة خاطئة قُبلت'); await typePad(v[0]); }
    else for (const x of v) await typePad(x);
  }
};
S.moreMult5 = async () => {
  await station(W.g5.M.orders, '🧾 طلبيات المطعم');
  for (let r = 0; r < 3; r++) {
    const d = await data('moreMult5'), q = d.rounds[r], o = d.opts[r];
    if (r === 0) { await panelClick(`[data-o="${o.findIndex(x => x !== q.ok)}"]`); expect((await data('moreMult5')).pick !== 0, 'عبارة خاطئة قُبلت'); }
    await panelClick(`[data-o="${o.indexOf(q.ok)}"]`); await sleep(100);
    await typePad(q.ans);
  }
};
S.writtenDiv5 = async () => {
  await station(W.g5.M.spice, '🌶️ آلة التعبئة');
  await sheetBtn('#benchGo');   // خطأ: إنهاء قبل التعبئة
  expect((await data('writtenDiv5')).r === 0, 'تعبئة ناقصة قُبلت');
  const q = (await data('writtenDiv5')).rounds; let k = Math.floor(q[0].n / q[0].b);
  for (const x of [10, 5, 1]) { for (let i = 0; i < Math.floor(k / x); i++) await panelClick(`[data-x="${x}"]`); k %= x; }
  await sheetBtn('#benchGo');
  await typePad(Math.ceil(q[1].need / q[1].per)); await typePad(Math.floor(q[2].money / q[2].price));
};
S.multSquares5 = async () => {
  await station(W.g5.M.tiles, '🟫 بلاط الساحة');
  await sheetBtn('#benchGo'); expect((await data('multSquares5')).r === 0, 'ساحة خاطئة قُبلت');
  for (let r = 0; r < 2; r++) { const q = (await data('multSquares5')).rounds[r]; for (let i = 1; i < q.ans; i++) await panelClick('[data-s="1"]'); await sheetBtn('#benchGo'); }
  const q = (await data('multSquares5')).rounds[2];
  await panelClick('[data-m="1"]'); await sheetBtn('#benchGo'); expect((await data('multSquares5')).r === 2, 'لون خاطئ قُبل');
  for (let v = q.k; v <= q.top; v += q.k) await panelClick(`[data-m="${v}"]`);
  await sheetBtn('#benchGo');
};
S.divisibility5 = async () => {
  await station(W.g5.M.gates, '🚦 بوابات الفرز');
  const q = (await data('divisibility5')).rounds, gate = v => { const k = [100, 10, 5, 2].findIndex(g => v % g === 0); return k < 0 ? 4 : k; };
  await panelClick(`[data-g="${(gate(q[0].list[0]) + 1) % 5}"]`); expect((await data('divisibility5')).i === 0, 'فرز خاطئ قُبل');
  for (const v of q[0].list) await panelClick(`[data-g="${gate(v)}"]`);
  for (const r of [1, 2]) { for (const ch of String(q[r].best)) await panelClick(`[data-c="${q[r].digits.indexOf(+ch)}"]`); await sheetBtn('#benchGo'); }
};
S.factors5 = async () => {
  await station(W.g5.M.bridges, '🌉 جسور العوامل');
  for (let r = 0; r < 3; r++) {
    const q = (await data('factors5')).rounds[r], pairs = []; for (let a = 1; a * a <= q.n; a++) if (q.n % a === 0) pairs.push([a, q.n / a]);
    if (r === 0) { const [a, b] = q.stones.flatMap(x => q.stones.map(y => [x, y])).find(([x, y]) => x !== y && x * y !== q.n); await panelClick(`[data-v="${a}"]`); await panelClick(`[data-v="${b}"]`); expect((await data('factors5')).done.length === 0, 'جسر خاطئ بُني'); }
    for (const [a, b] of pairs) { await panelClick(`[data-v="${a}"]`); await panelClick(`[data-v="${b}"]`); }
    await sheetBtn('#benchGo');
  }
};

/* ═══ الصف الخامس — الميناء (missions/g5/harbor.js) ═══ */
const svgPt = (x, y) => G(p => { const c = document.querySelector(`#panel [data-p="${p}"]`); if (!c) throw new Error('نقطة غير موجودة: ' + p); c.dispatchEvent(new MouseEvent('click', { bubbles: true })); }, `${x},${y}`).then(() => sleep(60));
S.parallelPerp5 = async () => {
  await station(W.g5.H.ropes, '⚓ حبال المرسى');
  await sheetBtn('#benchGo'); expect((await data('parallelPerp5')).r === 0, 'حبل خاطئ رُبط');   // البداية ليست موازية ولا متعامدة
  for (let r = 0; r < 3; r++) { const d = await data('parallelPerp5'), q = d.rounds[r], diff = ((d.a2 - q.a1) % 180 + 180) % 180, want = q.k === 'par' ? 0 : 90;
    for (let i = 0; i < ((want - diff) % 180 + 180) % 180 / 15; i++) await panelClick('#rotL'); await sheetBtn('#benchGo'); }
};
S.triangles5a = async () => {
  await station(W.g5.H.sails, '⛵ أشرعة السفن');
  const T = { iso: [[0, 0], [4, 0], [2, 3]], sca: [[0, 0], [4, 0], [1, 3]], rightIso: [[0, 0], [3, 0], [0, 3]] };
  for (const p of [[0, 0], [1, 0], [2, 0]]) await svgPt(...p); await sheetBtn('#benchGo'); expect((await data('triangles5a')).r === 0, 'دبابيس على خط قُبلت');
  for (let r = 0; r < 3; r++) { const k = (await data('triangles5a')).rounds[r]; for (const p of T[k]) await svgPt(...p); await sheetBtn('#benchGo'); }
};
S.cuboids5 = async () => {
  await station(W.g5.H.boxes, '📦 صناديق الشحن');
  const put = async cs => { for (const [x, y] of cs) await panelClick(`[data-c="${x},${y}"]`); };
  const bad = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
  await put(bad); await sheetBtn('#benchGo'); expect((await data('cuboids5')).r === 0, 'شبكة خاطئة طُويت'); await put(bad);
  for (const cs of [[[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0], [3, 2]]]) { await put(cs); await sheetBtn('#benchGo'); }
};
S.coords5a = async () => {
  await station(W.g5.H.buoys, '🛟 عوامات الميناء');
  const q = (await data('coords5a')).rounds, [x0, y0] = q[0].p;
  await svgPt(x0 === y0 ? (x0 + 1) % 8 : y0, x0); expect((await data('coords5a')).r === 0, 'عوامة في مكان خاطئ قُبلت');
  for (const r of q) await svgPt(...r.p);
};
S.transReflect5 = async () => {
  await station(W.g5.H.mirror, '🪞 رصيف المرايا');
  await sheetBtn('#benchGo'); expect((await data('transReflect5')).r === 0, 'قارب في مكان خاطئ ثُبّت');
  const q = (await data('transReflect5')).rounds;
  for (const r of q.slice(0, 2)) { const dx = r.to[0] - r.at[0], dy = r.to[1] - r.at[1];
    for (let i = 0; i < Math.abs(dx); i++) await panelClick(`[data-m="${Math.sign(dx)},0"]`); for (let i = 0; i < Math.abs(dy); i++) await panelClick(`[data-m="0,${Math.sign(dy)}"]`); await sheetBtn('#benchGo'); }
  for (const [x, y] of q[2].A) await svgPt(2 * q[2].k - x, y); await sheetBtn('#benchGo');
};

/* ═══ الصف الخامس — القلعة (missions/g5/fort.js) ═══ */
S.mass5 = async () => {
  await station(W.g5.F.scale, '🌾 مخزن الحبوب');
  await panelClick('[data-w="1"]'); await sheetBtn('#benchGo'); expect((await data('mass5')).r === 0, 'كيس خاطئ رُبط');   // خطأ: ١٠٠ غم فقط
  await panelClick('[data-w="-1"]');
  for (let r = 0; r < 2; r++) { const w = (await data('mass5')).rounds[r].w; for (let i = 0; i < Math.floor(w / 10); i++) await panelClick('[data-w="10"]'); for (let i = 0; i < w % 10; i++) await panelClick('[data-w="1"]'); await sheetBtn('#benchGo'); }
  await typePad((await data('mass5')).rounds[2].w * 100);
};
S.readTime5 = async () => {
  await station(W.g5.F.clock, '🕰️ ساعة البرج');
  await sheetBtn('#benchGo'); expect((await data('readTime5')).r === 0, 'وقت خاطئ قُبل');   // الساعة على ١٢:٠٠
  for (let r = 0; r < 3; r++) { const d = await data('readTime5'), want = d.rounds[r].ans % 1440; let diff = ((want - d.t) % 1440 + 1440) % 1440;
    for (let i = 0; i < Math.floor(diff / 60); i++) await panelClick('[data-t="60"]'); diff %= 60; for (let i = 0; i < Math.floor(diff / 5); i++) await panelClick('[data-t="5"]'); for (let i = 0; i < diff % 5; i++) await panelClick('[data-t="1"]');
    await sheetBtn('#benchGo'); }
};
S.timetables5 = async () => {
  await station(W.g5.F.roster, '📋 نوبات الحراسة');
  const q = (await data('timetables5')).rounds, b = q[0].B[q[0].k];
  await typePad(Math.floor(b / 60) * 100 + b % 60 + 1); expect((await data('timetables5')).r === 0, 'وقت خاطئ قُبل');
  await typePad(Math.floor(b / 60) * 100 + b % 60);
  await typePad(q[1].w);
  await panelClick(`[data-day="${q[2].day + q[2].gap}"]`);
};
S.area5a = async () => {
  await station(W.g5.F.carpet, '🟩 سجاد القاعة');
  const q = (await data('area5a')).rounds, put = async cs => { for (const [x, y] of cs) await panelClick(`[data-c="${x},${y}"]`); };
  await put([[0, 0], [1, 0]]); await sheetBtn('#benchGo'); expect((await data('area5a')).r === 0, 'سجادة خاطئة قُبلت'); await panelClick('#cClr');
  const A = q[0].A, w = [8, 6, 5, 4, 3].find(k => A % k === 0 && A / k <= 6), cells = []; for (let i = 0; i < A; i++) cells.push([i % w, Math.floor(i / w)]); await put(cells); await sheetBtn('#benchGo');
  const B = q[1].A, free = []; for (let i = 0; i < B - 1; i++) free.push([i % 8, Math.floor(i / 8)]); free.push([0, Math.floor((B - 2) / 8) + 1]);   // صفوف كاملة ثم مربع ناتئ: ليست مستطيلاً
  await put(free); await sheetBtn('#benchGo');
  await typePad(q[2].mm);
};
S.perimeter5a = async () => {
  await station(W.g5.F.fence, '🌿 سور البستان');
  await sheetBtn('#benchGo'); expect((await data('perimeter5a')).r === 0, 'سور خاطئ رُكّب');   // ١ × ١
  const q = (await data('perimeter5a')).rounds, set = async (L, Wd) => { for (let i = 1; i < L; i++) await panelClick('[data-k="L"][data-v="1"]'); for (let i = 1; i < Wd; i++) await panelClick('[data-k="Wd"][data-v="1"]'); await sheetBtn('#benchGo'); };
  await set(q[0].P / 2 - 2, 2);
  const h = q[1].P / 2; let L = 1; for (let a = 1; a < h; a++) if (a * (h - a) === q[1].A) { L = a; break; } await set(Math.max(L, h - L), Math.min(L, h - L));
  await typePad(q[2].sides.reduce((a, b) => a + b, 0));
};

/* ═══ الصف الخامس — ساحة المهرجان (missions/g5/festival.js) ═══ */
S.sequences5b = async () => {
  await station(W.g5.E.rockets, '🎆 سلّم الألعاب');
  for (let r = 0; r < 3; r++) { const q = (await data('sequences5b')).rounds[r];
    for (const [k, i] of q.holes.entries()) { await panelClick(`[data-h="${i}"]`); await typePad(r === 0 && k === 0 ? q.terms[i] + 1 : q.terms[i]); }
    await sheetBtn('#benchGo');
    if (r === 0) { expect((await data('sequences5b')).r === 0, 'درجة خاطئة قُبلت'); await typePad(q.terms[q.holes[0]]); await sheetBtn('#benchGo'); } }
};
S.generalStatements5 = async () => {
  await station(W.g5.E.sage, '🦉 تحدي الحكيم');
  for (let r = 0; r < 3; r++) { const d = await data('generalStatements5'), q = d.rounds[r];
    if (r === 0) { await sheetBtn(q.ok ? '#sFalse' : '#sTrue'); expect((await data('generalStatements5')).r === 0, 'حكم خاطئ قُبل'); }
    if (q.ok) { await sheetBtn('#sTrue'); continue; }
    await sheetBtn('#sFalse'); const o = (await data('generalStatements5')).opts[r]; await sheetBtn(`[data-o="${o.indexOf(q.ex.good)}"]`); }
};
S.negatives5 = async () => {
  await station(W.g5.E.thermo, '🌡️ مقياس الحرارة');
  await panelClick('#tUp'); await sheetBtn('#benchGo'); expect((await data('negatives5')).r === 0, 'درجة خاطئة سُجّلت'); await panelClick('#tDn');
  for (let r = 0; r < 3; r++) { const d = await data('negatives5'), a = d.rounds[r].ans; for (let i = 0; i < Math.abs(a - d.t); i++) await panelClick(a > d.t ? '#tUp' : '#tDn'); await sheetBtn('#benchGo'); }
};
S.decimals5 = async () => {
  await station(W.g5.E.tickets, '🎫 شباك التذاكر');
  await sheetBtn('#benchGo'); expect((await data('decimals5')).r === 0, 'سعر خاطئ طُبع');
  const q = (await data('decimals5')).rounds, dg = [Math.floor(q[0].ans / 1000), Math.floor(q[0].ans / 100) % 10, Math.floor(q[0].ans / 10) % 10, q[0].ans % 10];
  for (let i = 0; i < 4; i++) for (let k = 0; k < dg[i]; k++) await panelClick(`[data-w="${i}"][data-v="1"]`); await sheetBtn('#benchGo');
  for (const i of q[1].L.map((v, i) => i).sort((a, b) => q[1].L[a] - q[1].L[b])) await panelClick(`[data-i="${i}"]`); await sleep(150);
  await typePad(Math.round(q[2].v / 100));
};
S.decimalFacts5 = async () => {
  await station(W.g5.E.juice, '🧃 أكواب العصير');
  for (let r = 0; r < 3; r++) { const q = (await data('decimalFacts5')).rounds[r], T = q.tot * 10, c = q.cups.map(v => Math.round(v * 10));
    if (r === 0) { const [x, y] = c.flatMap((a, i) => c.map((b, j) => [i, j])).find(([i, j]) => i < j && c[i] + c[j] !== T); await panelClick(`[data-c="${x}"]`); await panelClick(`[data-c="${y}"]`); await sheetBtn('#benchGo'); expect((await data('decimalFacts5')).r === 0, 'كوبان خاطئان قُبلا'); }
    const [x, y] = c.flatMap((a, i) => c.map((b, j) => [i, j])).find(([i, j]) => i < j && c[i] + c[j] === T); await panelClick(`[data-c="${x}"]`); await panelClick(`[data-c="${y}"]`); await sheetBtn('#benchGo'); }
};
S.multStrategies5 = async () => {
  await station(W.g5.E.gifts, '🎁 كشك الهدايا');
  await panelClick('[data-op="5"]'); await sheetBtn('#benchGo'); expect((await data('multStrategies5')).r === 0, 'ناتج خاطئ قُبل');   // ×٢ فقط
  for (let r = 0; r < 3; r++) { const k = (await data('multStrategies5')).rounds[r].k, ops = { 19: [0, 4], 21: [0, 3], 25: [1, 2] }[k]; for (const o of ops) await panelClick(`[data-op="${o}"]`); await sheetBtn('#benchGo'); }
};
S.doubleHalve5 = async () => {
  await station(W.g5.E.mirror, '🪞 المرآة السحرية');
  for (let r = 0; r < 3; r++) { const q = (await data('doubleHalve5')).rounds[r]; let v = q.from;
    for (let k = 0; k < q.steps; k++) { await sheetBtn(q.dir === 2 ? '#mDbl' : '#mHalf'); if (r === 0 && k === 0) { await typePad(v * q.dir + 1); expect((await data('doubleHalve5')).cur === v, 'ناتج خاطئ قُبل'); } v = Math.round(v * q.dir * 100) / 100; await typePad(v); } }
};
S.subtract5 = async () => {
  await station(W.g5.E.track, '🏃 مضمار السباق');
  await panelClick('[data-j="1"]'); await sheetBtn('#benchGo'); expect((await data('subtract5')).r === 0, 'وصول خاطئ قُبل'); await panelClick('#jUndo');
  for (let r = 0; r < 2; r++) { const q = (await data('subtract5')).rounds[r]; let diff = q.a - q.b; for (const j of [1000, 100, 10, 1]) { for (let i = 0; i < Math.floor(diff / j); i++) await panelClick(`[data-j="${j}"]`); diff %= j; } await sheetBtn('#benchGo'); await typePad(q.a - q.b); }
  const c = (await data('subtract5')).rounds[2]; await typePad(c.x - c.k);
};
S.add5 = async () => {
  await station(W.g5.E.score, '🏆 لوحة النقاط');
  for (let r = 0; r < 3; r++) { const q = (await data('add5')).rounds[r], s = q.a + q.b, cols = Math.max(String(s).length, String(q.a).length), dg = String(s).padStart(cols, '0').split('').reverse().map(Number);
    if (r === 0) { for (const [i, x] of dg.entries()) await panelClick(`[data-d="${i === 0 ? (x + 1) % 10 : x}"]`); await sheetBtn('#benchGo'); expect((await data('add5')).r === 0, 'مجموع خاطئ قُبل'); }
    for (const x of (r === 0 ? dg : dg)) await panelClick(`[data-d="${x}"]`); await sheetBtn('#benchGo'); }
};
S.money5 = async () => {
  await station(W.g5.E.shop, '🍭 دكان المهرجان');
  for (let r = 0; r < 3; r++) { const q = (await data('money5')).rounds[r]; let ch = q.paid - q.tot;
    if (r === 0) { await panelClick('[data-c="5"]'); await sheetBtn('#benchGo'); expect((await data('money5')).r === 0, 'باقٍ خاطئ قُبل'); await panelClick('#cUndo'); }
    for (const c of [500, 100, 50, 25, 10, 5]) { for (let i = 0; i < Math.floor(ch / c); i++) await panelClick(`[data-c="${c}"]`); ch %= c; } await sheetBtn('#benchGo'); }
};
S.multDiv5 = async () => {
  await station(W.g5.E.rides, '🎡 عربات الملاهي');
  await sheetBtn('#benchGo'); expect((await data('multDiv5')).r === 0, 'عدد عربات خاطئ قُبل');   // ١٠ عربات لا تكفي
  const q = (await data('multDiv5')).rounds; let k = Math.ceil(q[0].n / q[0].b) - 10;
  for (let i = 0; i < Math.floor(k / 10); i++) await panelClick('[data-k="10"]'); for (let i = 0; i < k % 10; i++) await panelClick('[data-k="1"]'); await sheetBtn('#benchGo');
  await typePad(q[1].a * q[1].c); await typePad(q[2].rem);
};

/* ═══ الصف الخامس — بستان البيانات (missions/g5/datayard.js) ═══ */
S.survey5 = async () => {
  await station(W.g5.D.survey, '📋 استبيان الفاكهة');
  const q = (await data('survey5')).rounds;
  await panelClick(`[data-k="${(q[0].ans[0] + 1) % 4}"]`); expect((await data('survey5')).i === 0, 'علامة خاطئة قُبلت');
  for (const a of q[0].ans) await panelClick(`[data-k="${a}"]`);
  await typePad(q[1].ans.length);
  const qo = (await data('survey5')).qo || null; await sleep(100); const o = (await data('survey5')).qo; await panelClick(`[data-q="${o.findIndex(x => x[1])}"]`);
};
S.checkData5 = async () => {
  await station(W.g5.D.bars, '📊 لوحة الأعمدة');
  await sheetBtn('#benchGo'); expect((await data('checkData5')).r === 0, 'لوحة خاطئة عُلّقت');
  for (let r = 0; r < 2; r++) { const q = (await data('checkData5')).rounds[r]; for (let i = 0; i < 4; i++) for (let k = 0; k < q.v[i] / q.st; k++) await panelClick(`[data-b="${i}"][data-v="1"]`); await sheetBtn('#benchGo'); }
  const v = (await data('checkData5')).rounds[2].v; await typePad(Math.max(...v) - Math.min(...v));
};
S.chance5 = async () => {
  await station(W.g5.D.luck, '🎲 صندوق الحظ');
  const W5 = ['مستحيل', 'غير مرجّح', 'متساوي الفرص', 'مرجّح', 'مؤكد'], want = { 'مستحيل': 0, 'غير مرجّح': 2, 'متساوي الفرص': 5, 'مرجّح': 8, 'مؤكد': 10 };
  for (let r = 0; r < 3; r++) { const d = await data('chance5'), w = d.rounds[r];
    if (r === 0) { const bad = w === 'غير مرجّح' ? 5 : 2; for (let i = 0; i < Math.abs(bad - d.red); i++) await panelClick(`[data-k="${bad > d.red ? 1 : -1}"]`); await sheetBtn('#benchGo'); expect((await data('chance5')).r === 0, 'كيس خاطئ قُبل'); }
    const d2 = await data('chance5'); for (let i = 0; i < Math.abs(want[w] - d2.red); i++) await panelClick(`[data-k="${want[w] > d2.red ? 1 : -1}"]`); await sheetBtn('#benchGo'); }
};
S.lineGraph5 = async () => {
  await station(W.g5.D.weather, '🌤️ محطة الطقس');
  await sheetBtn('#benchGo'); expect((await data('lineGraph5')).r === 0, 'رسم خاطئ نُشر');
  const q = (await data('lineGraph5')).rounds; for (let i = 0; i < 6; i++) for (let k = 0; k < q[0].T[i] / 2; k++) await panelClick(`[data-p="${i}"][data-v="1"]`); await sheetBtn('#benchGo');
  await typePad((q[1].T[q[1].i] + q[1].T[q[1].i + 1]) / 2);
  await sheetBtn('#mNo');
};
S.mode5 = async () => {
  await station(W.g5.D.basket, '🧺 سلة الأكثر');
  for (let r = 0; r < 2; r++) { const q = (await data('mode5')).rounds[r];
    if (r === 0) { await panelClick(`[data-k="${(q.items[0] + 1) % 4}"]`); expect((await data('mode5')).i === 0, 'فرز خاطئ قُبل'); }
    for (const k of q.items) await panelClick(`[data-k="${k}"]`); await panelClick(`[data-k="${q.m}"]`); await sleep(100); }
  const L = (await data('mode5')).rounds[2].L, c = {}; L.forEach(v => c[v] = (c[v] || 0) + 1); await typePad(+Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]);
};

/* ═══ الصف الخامس — سوق الجمعية (missions/g5/coop.js) ═══ */
S.measureLines5 = async () => {
  await station(W.g5.C.cloth, '✂️ قماش الخيّاطة');
  const q = (await data('measureLines5')).rounds;
  await typePad(q[0].mm + 10); expect((await data('measureLines5')).r === 0, 'قياس خاطئ قُبل'); await typePad(q[0].mm);
  for (const i of q[1].L.map((x, i) => i).sort((a, b) => q[1].L[a][0] - q[1].L[b][0])) await panelClick(`[data-i="${i}"]`); await sleep(150);
  await typePad(q[2].tot - q[2].cut);
};
S.measureTime5 = async () => {
  await station(W.g5.C.oven, '🍞 فرن الخبز');
  await panelClick('[data-s="60"]'); await sheetBtn('#benchGo'); expect((await data('measureTime5')).r === 0, 'مؤقت خاطئ قُبل'); await panelClick('#sClr');
  for (let r = 0; r < 3; r++) { let s = (await data('measureTime5')).rounds[r].ans; for (const v of [3600, 600, 60, 10]) { for (let i = 0; i < Math.floor(s / v); i++) await panelClick(`[data-s="${v}"]`); s %= v; } await sheetBtn('#benchGo'); }
};
S.calendars5 = async () => {
  await station(W.g5.C.calendar, '📅 تقويم الجمعية');
  const q = (await data('calendars5')).rounds, D = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], want = q[0].day + q[0].gap - D[q[0].m];
  await panelClick(`[data-d="${q[0].m}-${q[0].day + 1}"]`); expect((await data('calendars5')).r === 0, 'تاريخ خاطئ قُبل');
  await panelClick(`[data-d="${q[0].m + 1}-${want}"]`); await sleep(120);
  await panelClick(`[data-m="${q[1].m0 + q[1].k}"]`); await sleep(120);
  await typePad(2026 - q[2].y);
};
S.area5b = async () => {
  await station(W.g5.C.shelves, '🗄️ رفوف العرض');
  const q = (await data('area5b')).rounds, o = q[0].opts;
  await panelClick(`[data-o="${o.findIndex(([a, b]) => a * b !== q[0].A)}"]`); expect((await data('area5b')).r === 0, 'رف خاطئ قُبل');
  await panelClick(`[data-o="${o.findIndex(([a, b]) => a * b === q[0].A)}"]`); await sleep(120);
  await typePad(q[1].ans); await typePad(q[2].BW * q[2].BH - q[2].w * q[2].h);
};
S.perimeter5b = async () => {
  await station(W.g5.C.frames, '🖼️ إطارات الصور');
  const q = (await data('perimeter5b')).rounds, p = q[0].pile, used = [], take = v => { const i = p.findIndex((x, k) => x === v && !used.includes(k)); used.push(i); return i; };
  for (const i of [0, 1, 2, 3]) await panelClick(`[data-i="${i}"]`); const bad = [0, 1, 2, 3].map(i => p[i]).sort((a, b) => a - b).join() === [q[0].Wp, q[0].Wp, q[0].Lp, q[0].Lp].sort((a, b) => a - b).join();
  await sheetBtn('#benchGo'); if (!bad) expect((await data('perimeter5b')).r === 0, 'إطار خاطئ رُكّب');
  if ((await data('perimeter5b')).r === 0) { for (const v of [q[0].Lp, q[0].Lp, q[0].Wp, q[0].Wp]) await panelClick(`[data-i="${take(v)}"]`); await sheetBtn('#benchGo'); }
  await typePad(2 * (q[1].Lp + q[1].Wp)); await typePad(q[2].n * q[2].s);
};

/* ═══ الصف الخامس — طريق القافلة (missions/g5/caravan.js) ═══ */
S.mentalStrategies5 = async () => {
  await station(W.g5.K.camelCalc, '🐪 حساب الجمّال');
  for (let r = 0; r < 3; r++) { const d = await data('mentalStrategies5'), q = d.rounds[r], o = (d.order || {})[r] || (await G(() => 0), (await data('mentalStrategies5')).order[r]);
    if (r === 0) { await panelClick(`[data-o="${o.indexOf(q.wrong[0])}"]`); expect((await data('mentalStrategies5')).picked !== 0, 'حيلة خاطئة قُبلت'); }
    await panelClick(`[data-o="${o.indexOf(q.right)}"]`); await sleep(120); await typePad(q.ans); }
};
S.decimalsFractions5 = async () => {
  await station(W.g5.K.stations, '🚏 مسافات المحطات');
  const setR = v => G(v => { const r = document.querySelector('#panel #nlR'); r.value = v; r.dispatchEvent(new Event('input')); }, v);
  for (let r = 0; r < 2; r++) { const q = (await data('decimalsFractions5')).rounds[r], i = Math.round((q.v - q.lo) / q.st);
    if (r === 0) { await setR(i === 0 ? 1 : 0); await sheetBtn('#benchGo'); expect((await data('decimalsFractions5')).r === 0, 'موضع خاطئ قُبل'); }
    await setR(i); await sheetBtn('#benchGo'); }
  await typePad(Math.round((await data('decimalsFractions5')).rounds[2].v));
};
S.percentages5 = async () => {
  await station(W.g5.K.waterskins, '💧 قِرَب الماء');
  await panelClick('[data-k="1"]'); await sheetBtn('#benchGo'); expect((await data('percentages5')).r === 0, 'قربة خاطئة رُبطت'); await panelClick('[data-k="-1"]');
  for (let r = 0; r < 2; r++) { const v = (await data('percentages5')).rounds[r].v; for (let i = 0; i < Math.floor(v / 10); i++) await panelClick('[data-k="10"]'); for (let i = 0; i < v % 10; i++) await panelClick('[data-k="1"]'); await sheetBtn('#benchGo'); }
  const q = (await data('percentages5')).rounds[2]; await typePad(q.tot * q.p / 100);
};
S.equivFractions5 = async () => {
  await station(W.g5.K.flags, '🚩 رايات القافلة');
  for (let r = 0; r < 3; r++) { const q = (await data('equivFractions5')).rounds[r];
    if (r === 0) { const c = (await data('equivFractions5')).cards[0]; await panelClick(`[data-d="${c.decs.find(v => v !== q[2])}"]`); await panelClick(`[data-p="${q[3]}"]`); await sheetBtn('#benchGo'); expect((await data('equivFractions5')).r === 0, 'راية خاطئة رُفعت'); }
    await panelClick(`[data-d="${q[2]}"]`); await panelClick(`[data-p="${q[3]}"]`); await sheetBtn('#benchGo'); }
};
S.mixedNumbers5 = async () => {
  await station(W.g5.K.loaves, '🫓 أرغفة الرحلة');
  await sheetBtn('#benchGo'); expect((await data('mixedNumbers5')).r === 0, 'ترتيب خاطئ قُبل');
  for (let r = 0; r < 3; r++) { const q = (await data('mixedNumbers5')).rounds[r];
    if (q.t === 'toMixed') { for (let i = 0; i < q.w; i++) await panelClick('[data-k="a"][data-v="1"]'); for (let i = 0; i < q.n; i++) await panelClick('[data-k="b"][data-v="1"]'); }
    else for (let i = 0; i < q.w * q.dd + q.n; i++) await panelClick('[data-k="a"][data-v="1"]');
    await sheetBtn('#benchGo'); }
};
S.addSub5b = async () => {
  await station(W.g5.K.loads, '📦 أحمال الجمال');
  for (let r = 0; r < 2; r++) { const q = (await data('addSub5b')).rounds[r], c = q.bags.map(v => Math.round(v * 100)), cap = Math.round(q.cap * 100), pr = c.flatMap((a, i) => c.map((b, j) => [i, j])).filter(([i, j]) => i < j);
    if (r === 0) { const [x, y] = pr.find(([i, j]) => c[i] + c[j] !== cap); await panelClick(`[data-i="${x}"]`); await panelClick(`[data-i="${y}"]`); await sheetBtn('#benchGo'); expect((await data('addSub5b')).r === 0, 'حمل خاطئ قُبل'); }
    const [x, y] = pr.find(([i, j]) => c[i] + c[j] === cap); await panelClick(`[data-i="${x}"]`); await panelClick(`[data-i="${y}"]`); await sheetBtn('#benchGo'); }
  const q = (await data('addSub5b')).rounds[2]; await typePad(Math.round((q.s - q.u) * 100) / 100);
};
S.fractionsDivision5 = async () => {
  await station(W.g5.K.dates, '🌴 تقاسم التمر');
  await sheetBtn('#benchGo'); expect((await data('fractionsDivision5')).r === 0, 'قسمة خاطئة قُبلت');
  const q = (await data('fractionsDivision5')).rounds; for (let i = 0; i < q[0].w; i++) await panelClick('[data-k="w"][data-v="1"]'); for (let i = 0; i < q[0].r; i++) await panelClick('[data-k="p"][data-v="1"]'); await sheetBtn('#benchGo');
  await typePad(q[1].qq / q[1].dd * q[1].nn); await typePad(q[2].k);
};
S.inverseBrackets5 = async () => {
  await station(W.g5.K.well, '🪣 لغز البئر');
  await panelClick('[data-op="2"]'); await panelClick('[data-op="0"]'); await sheetBtn('#benchGo'); expect((await data('inverseBrackets5')).r === 0, 'ترتيب عكسي خاطئ قُبل');
  for (let r = 0; r < 2; r++) { await panelClick('[data-op="0"]'); await panelClick('[data-op="2"]'); await sheetBtn('#benchGo'); }
  const b = (await data('inverseBrackets5')).br; await G(t => [...document.querySelectorAll('#panel [data-o]')].find(x => x.dataset.o === t).click(), `(${ar(b.a)} + ${ar(b.b)}) × ${ar(b.c)}`); await sleep(150);
};
S.ratio5 = async () => {
  await station(W.g5.K.coffee, '☕ وصفة القهوة');
  await sheetBtn('#benchGo'); expect((await data('ratio5')).r === 0, 'وصفة خاطئة قُبلت');
  for (let r = 0; r < 2; r++) { const q = (await data('ratio5')).rounds[r]; for (let i = 0; i < 3; i++) for (let k = 0; k < q.base[i] * q.k; k++) await panelClick(`[data-i="${i}"][data-v="1"]`); await sheetBtn('#benchGo'); }
  await typePad((await data('ratio5')).rounds[2].sets);
};

/* ═══ الصف الخامس — ورشة البنّاء (missions/g5/workshop.js) ═══ */
S.angles5 = async () => {
  await station(W.g5.W.windows, '🪟 زوايا النوافذ');
  await sheetBtn('#benchGo'); expect((await data('angles5')).r === 0, 'زاوية خاطئة ثُبّتت');
  { const t = (await data('angles5')).rounds[0].ans; let a = (await data('angles5')).ang;
    while (a !== t) { const st = Math.abs(t - a) >= 15 ? 15 : 5; await panelClick(`[data-a="${t > a ? st : -st}"]`); a += t > a ? st : -st; }
    await sheetBtn('#benchGo'); }
  { const q = (await data('angles5')).rounds[1], K = v => v < 90 ? 'حادة' : v === 90 ? 'قائمة' : 'منفرجة';
    await panelClick(`[data-i="${q.cards.findIndex(v => K(v) !== q.want)}"]`); expect((await data('angles5')).r === 1, 'نوع خاطئ قُبل');
    await panelClick(`[data-i="${q.cards.findIndex(v => K(v) === q.want)}"]`); await sleep(150); }
  await typePad(180 - (await data('angles5')).rounds[2].a);
};
S.triangles5b = async () => {
  await station(W.g5.W.roof, '🔺 دعامات السقف');
  const ty = s => s[0] === s[2] ? 0 : s[0] === s[1] || s[1] === s[2] ? 1 : 2;
  for (let r = 0; r < 3; r++) { const q = (await data('triangles5b')).rounds[r], p = q.pile, tri = [];
    for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) for (let k = j + 1; k < 7; k++) tri.push([i, j, k]);
    const sv = t => t.map(i => p[i]).sort((a, b) => a - b), good = tri.find(t => { const s = sv(t); return s[0] + s[1] > s[2] && ty(s) === q.want; });
    if (r === 0) { const bad = tri.find(t => { const s = sv(t); return s[0] + s[1] <= s[2]; }); for (const i of bad) await panelClick(`[data-i="${i}"]`); await sheetBtn('#benchGo'); expect((await data('triangles5b')).r === 0, 'دعامات لا تلتقي قُبلت'); }
    for (const i of good) await panelClick(`[data-i="${i}"]`); await sheetBtn('#benchGo'); }
};
S.polySymmetry5 = async () => {
  await station(W.g5.W.star, '✴️ نجمة الزخرفة');
  const OK = { rect: [1, 1, 0, 0], square: [1, 1, 1, 1], iso: [1, 0, 0], kite: [1, 0, 0] };
  for (let r = 0; r < 2; r++) { const q = (await data('polySymmetry5')).rounds[r];
    if (r === 0) { await panelClick('[data-l="2"]'); await sheetBtn('#benchGo'); expect((await data('polySymmetry5')).r === 0, 'خط تماثل خاطئ قُبل'); }
    for (const [i, v] of OK[q.k].entries()) if (v) await panelClick(`[data-l="${i}"]`); await sheetBtn('#benchGo'); }
  const q = (await data('polySymmetry5')).rounds[2]; await panelClick(`[data-o="${q.opts.indexOf(360 / q.n)}"]`); await sleep(150);
};
S.patternSymmetry5 = async () => {
  await station(W.g5.W.mosaic, '🧩 بلاط الموزاييك');
  await sheetBtn('#benchGo'); expect((await data('patternSymmetry5')).r === 0, 'نمط ناقص قُبل');
  for (let r = 0; r < 3; r++) { const q = (await data('patternSymmetry5')).rounds[r], giv = new Set(q.given.map(c => c.join(','))), want = new Set();
    q.given.forEach(([x, y]) => { want.add(`${x},${y}`); want.add(`${5 - x},${y}`); if (q.two) { want.add(`${x},${5 - y}`); want.add(`${5 - x},${5 - y}`); } });
    for (const k of want) if (!giv.has(k)) await panelClick(`[data-c="${k}"]`); await sheetBtn('#benchGo'); }
};
S.netsShapes5 = async () => {
  await station(W.g5.W.molds, '📦 قوالب البناء');
  { const q = (await data('netsShapes5')).rounds[0]; await panelClick(`[data-i="${q.cards.findIndex(c => c !== q.want)}"]`); expect((await data('netsShapes5')).r === 0, 'شبكة خاطئة قُبلت');
    await panelClick(`[data-i="${q.cards.indexOf(q.want)}"]`); await sleep(150); }
  await panelClick(`[data-i="${(await data('netsShapes5')).rounds[1].gi}"]`); await sleep(150);
  await typePad((await data('netsShapes5')).rounds[2].q[2]);
};
S.coordTransform5 = async () => {
  await station(W.g5.W.plan, '📐 مخطط البيت');
  await sheetBtn('#benchGo'); expect((await data('coordTransform5')).r === 0, 'موضع خاطئ ثُبّت');
  const move = async (dx, dy) => { for (let i = 0; i < Math.abs(dx); i++) await panelClick(`[data-m="${dx > 0 ? 'R' : 'L'}"]`); for (let i = 0; i < Math.abs(dy); i++) await panelClick(`[data-m="${dy > 0 ? 'U' : 'D'}"]`); };
  for (let r = 0; r < 2; r++) { const q = (await data('coordTransform5')).rounds[r]; await move(q.m[0], q.m[1]); await sheetBtn('#benchGo'); }
  const q = (await data('coordTransform5')).rounds[2]; await move(2 * (q.k - q.A[0]), 0); await sheetBtn('#benchGo');
};
S.volCapMass5 = async () => {
  await station(W.g5.W.mixer, '🪣 خلاطة الإسمنت');
  await sheetBtn('#benchGo'); expect((await data('volCapMass5')).r === 0, 'كمية خاطئة صُبّت');
  for (let r = 0; r < 2; r++) { let v = (await data('volCapMass5')).rounds[r].ans; const st = r === 0 ? [500, 100, 50] : [1000, 500, 100];
    for (const s of st) while (v >= s) { await panelClick(`[data-s="${s}"]`); v -= s; } await sheetBtn('#benchGo'); }
  const q = (await data('volCapMass5')).rounds[2]; await typePad(q.tank * 1000 / q.cap);
};
S.moreTime5 = async () => {
  await station(W.g5.W.schedule, '🗓️ جدول المشروع');
  const q = (await data('moreTime5')).rounds;
  await panelClick(`[data-m="${q[0].m0 + q[0].a}"]`); expect((await data('moreTime5')).r === 0, 'شهر خاطئ قُبل');
  await panelClick(`[data-m="${q[0].m0 + q[0].a + q[0].b}"]`); await sleep(150);
  await typePad(q[1].w); await typePad(q[2].k * 10);
};
S.areaPerimeter5 = async () => {
  await station(W.g5.W.tiling, '🟫 تبليط الغرفة');
  await sheetBtn('#benchGo'); expect((await data('areaPerimeter5')).r === 0, 'غرفة خاطئة بُلّطت');
  for (let r = 0; r < 3; r++) { const [A, P] = (await data('areaPerimeter5')).rounds[r], h = Array.from({ length: 12 }, (_, i) => i + 1).find(h => A % h === 0 && 2 * (A / h + h) === P), w = A / h;
    const d0 = await data('areaPerimeter5'); for (let i = d0.w; i < w; i++) await panelClick('[data-k="w"][data-v="1"]'); for (let i = d0.w; i > w; i--) await panelClick('[data-k="w"][data-v="-1"]');
    for (let i = d0.h; i < h; i++) await panelClick('[data-k="h"][data-v="1"]'); for (let i = d0.h; i > h; i--) await panelClick('[data-k="h"][data-v="-1"]'); await sheetBtn('#benchGo'); }
};

const GATES = [
  { after: 'sequences', name: 'بوابة السوق', a: { x: 1380, y: 640 }, b: { x: 1620, y: 640 } },
  { after: 'areaPerimeterT1', name: 'بوابة الميناء', a: { x: 2200, y: 640 }, b: { x: 2400, y: 640 } },
  { after: 'coordinates', name: 'بوابة القلعة', a: { x: 1240, y: 1660 }, b: { x: 1240, y: 1780 } },
  { after: 'specialNumbers', name: 'بوابة ساحة المهرجان', a: { x: 1240, y: 2540 }, b: { x: 1240, y: 2680 } },
  { after: 'areaPerimeter', name: 'بوابة بستان البيانات', a: { x: 1240, y: 2990 }, b: { x: 1240, y: 3110 } },
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
  expect(await G(k => localStorage.getItem(k) !== null, 'ramimath_village_v1' + (GRADE !== 6 ? '_g' + GRADE : '')), 'المغامرة المستعادة لم تُحفظ على الجهاز');
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
  if (GRADE !== 6) {   // صف آخر: كل بوابة تُفتح بعد آخر درس في وحدتها (المناطق نفسها)
    GATES.forEach((g, i) => { g.after = lessons.filter(l => l.u === i).slice(-1)[0].id; });
    W.g5 = await G(async () => ({ V: (await import('./missions/g5/village.js')).ST5V, M: (await import('./missions/g5/market.js')).ST5M, H: (await import('./missions/g5/harbor.js')).ST5H, F: (await import('./missions/g5/fort.js')).ST5F, E: (await import('./missions/g5/festival.js')).ST5E, D: (await import('./missions/g5/datayard.js')).ST5D, C: (await import('./missions/g5/coop.js')).ST5C, K: (await import('./missions/g5/caravan.js')).ST5K, W: (await import('./missions/g5/workshop.js')).ST5W }));
    W.g7 = await G(async () => ({ V: (await import('./missions/g7/village.js')).ST7V, M: (await import('./missions/g7/market.js')).ST7M, H: (await import('./missions/g7/harbor.js')).ST7H, F: (await import('./missions/g7/fort.js')).ST7F, E: (await import('./missions/g7/festival.js')).ST7E, D: (await import('./missions/g7/datayard.js')).ST7D, C: (await import('./missions/g7/coop.js')).ST7C, K: (await import('./missions/g7/caravan.js')).ST7K, W: (await import('./missions/g7/workshop.js')).ST7W }));   // لكل منطقة محطاتها (أسماء مثل scale تتكرر)
    console.log(`📚 الصف ${GRADE === 5 ? 'الخامس' : 'السابع'}: ${lessons.length} درساً`);
  }
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
      await settle(60000, D3 ? 3500 : 2000);   // 3D أبطأ: جملة ختام التحدي قد تأتي بعد ثانيتين
      if (errors.length > e0) throw new Error('أخطاء في الكونسول: ' + errors.slice(e0).join(' / '));
      console.log(`✅ ${l.title}${ch ? ' + التحدي' : ''} (${((Date.now() - t0) / 1000).toFixed(1)} ث)`);
      if (l.id === GATES[0].after) {   // مغامرة ختام الوحدة الأولى
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
    const ach = await G(() => window.__game.state.achievements), want = GRADE !== 6 ? ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'term1', 't2u1', 't2u2', 't2u3', 't2u4', 'all69'] : ['unit1', 'unit2', 'unit3', 'unit4', 'term1', 't2u1', 't2u2', 't2u3', 't2u4', 't2u5', 'all69'], miss = want.filter(a => !ach[a]).filter(a => !FROM || want.indexOf(a) >= want.length - 4)   // في وضع الدفعات: إنجازات الوحدات التي لُعبت في هذه الدفعة فقط;
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
