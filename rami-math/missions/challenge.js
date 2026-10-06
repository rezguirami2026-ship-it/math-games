// «تحدي الشخصية»: المرحلة الثانية من كل درس — جولات قصيرة متنوعة تغطي مخرجات الدرس التي لا تغطيها مهمة العالم.
// أنواع الجولات: choice (اختر واحداً)، multi (اختر كل الصحيح)، num (اكتب العدد)، order (رتّب بالضغط بالترتيب)، tf (صح أم خطأ ثم السبب).
// لا مؤقت ولا عقاب: الخطأ يعطي تلميحاً مفيداً وتعاد المحاولة. كل جولة مرتبطة برمز مخرجها (content/outcomes.js).
// item = { type, out, q, opts?, ans, hint, why?, tail?, art? } — ans: فهرس (choice/tf)، مصفوفة فهارس (multi/order)، أو عدد (num).
import { ar } from '../core/util.js';
import { sfx } from '../core/sound.js';
import { OUT } from '../content/outcomes.js';
import { changed, finish, sheetOpen, sheetClose, msgBox, setMsg, numPad, btn } from './bench.js';
import { game } from '../core/state.js';

const PEOPLE_ICON = { salem: '🧔🏽', yousef: '👦🏽', hamad: '👨🏽‍🌾', saeed: '📮', umkhalid: '👩🏽', rashed: '👨🏽‍🔧', naser: '🧔🏽' };

/* يبدأ التحدي (أو يستأنفه) بعد مهمة العالم. d: بيانات الدرس (يُحفظ فيها التقدّم d.ch) */
export function runChallenge(W, d, cfg) {
  if (!d.ch) { d.ch = { items: cfg.make(), i: 0, firstTry: 0, tries: 0 }; changed(); }
  return new Promise(resolve => { cfg.resolve = resolve; render(W, d, cfg, null); });
}

function render(W, d, cfg, msg) {
  const C = d.ch, it = C.items[C.i], n = C.items.length;
  const dots = C.items.map((_, k) => `<i class="${k < C.i ? 'ok' : k === C.i ? 'now' : ''}"></i>`).join('');
  const out = it.out && OUT[it.out] ? `<div class="chOut" title="${OUT[it.out]}">🎯 ${OUT[it.out]}</div>` : '';
  let body = '';
  if (it.type === 'choice' || it.type === 'tf') body = `<div class="chOpts">${(it.type === 'tf' ? ['✔ صحيح', '✘ خطأ'] : it.opts).map((o, k) => `<button class="chOpt" data-k="${k}">${o}</button>`).join('')}</div>`;
  if (it.type === 'multi') body = `<div class="chOpts multi">${it.opts.map((o, k) => `<button class="chOpt" data-k="${k}">${o}</button>`).join('')}</div><button class="act go" id="chGo">✓ تحقّق</button>`;
  if (it.type === 'order') body = `<div class="chOrder" id="chSeq">${'<span class="ph">اضغط البطاقات بالترتيب</span>'}</div><div class="chOpts">${it.opts.map((o, k) => `<button class="chOpt" data-k="${k}">${o}</button>`).join('')}</div><div class="row2"><button class="act ghost" id="chUndo">↩ تراجع</button><button class="act go" id="chGo">✓ تحقّق</button></div>`;
  if (it.type === 'num') body = `<div id="chPad"></div>`;
  sheetOpen(`<div class="chHead"><span class="chFace">${PEOPLE_ICON[cfg.who] || '🧑🏽'}</span><div><b>${cfg.title}</b><div class="chDots">${dots}</div></div><small>${ar(C.i + 1)} / ${ar(n)}</small></div>
    ${out}${it.art ? `<div class="chArt">${it.art}</div>` : ''}
    <div class="chQ">${it.q}${it.tail ? `<div class="chTail">${it.tail}</div>` : ''}</div>
    ${msgBox(msg ? msg.t : 'خذ وقتك، لا يوجد مؤقت 🙂', msg ? msg.k : '')}${body}`);
  const el = document.getElementById('panel');
  el.querySelector('.sheet').classList.add('chSheet');
  const ok = () => { C.firstTry += C.tries === 0 ? 1 : 0; C.tries = 0; C.i++; sfx('good'); changed();
    if (C.i >= n) { done(W, d, cfg); return; }
    render(W, d, cfg, { t: it.why ? '✓ ' + it.why : '✓ أحسنت!', k: 'ok' }); };
  const bad = extra => { C.tries++; sfx('cough'); changed(); setMsg('💡 ' + (extra || it.hint), 'bad'); el.querySelector('.sheet').classList.add('shake'); setTimeout(() => { const s = el.querySelector('.sheet'); s && s.classList.remove('shake'); }, 450); };
  if (it.type === 'choice' || it.type === 'tf') el.querySelectorAll('.chOpt').forEach(b => b.onclick = e => { e.stopPropagation(); +b.dataset.k === it.ans ? ok() : (b.classList.add('no'), bad()); });
  if (it.type === 'multi') { const sel = new Set(); el.querySelectorAll('.chOpt').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.k; sel.has(k) ? sel.delete(k) : sel.add(k); b.classList.toggle('on'); sfx('click'); });
    btn('chGo', () => { const a = new Set(it.ans); if (sel.size === a.size && [...sel].every(k => a.has(k))) ok(); else bad(sel.size < a.size && [...sel].every(k => a.has(k)) ? 'صحيح ما اخترته، لكن ما زال هناك المزيد.' : null); }); }
  if (it.type === 'order') { const seq = [], box = el.querySelector('#chSeq');
    const show = () => { box.innerHTML = seq.length ? seq.map(k => `<b>${it.opts[k]}</b>`).join('<em>،</em>') : '<span class="ph">اضغط البطاقات بالترتيب</span>'; el.querySelectorAll('.chOpt').forEach(b => b.disabled = seq.includes(+b.dataset.k)); };
    el.querySelectorAll('.chOpt').forEach(b => b.onclick = e => { e.stopPropagation(); seq.push(+b.dataset.k); sfx('click'); show(); });
    btn('chUndo', () => { seq.pop(); show(); }); btn('chGo', () => { seq.length === it.ans.length && seq.every((k, i) => k === it.ans[i]) ? ok() : bad(); }); }
  if (it.type === 'num') { const pad = numPad(el.querySelector('#chPad'), 'تحقّق', v => { Math.round(v * 1000) === Math.round(it.ans * 1000) ? ok() : (bad(), pad.clear()); }, { neg: it.neg, dot: it.dot !== false }); }
}
async function done(W, d, cfg) {
  const C = d.ch, n = C.items.length, stars = C.firstTry >= n ? 3 : C.firstTry >= n - 2 ? 2 : 1;
  d.stars = Math.max(d.stars || 0, stars); changed();
  sheetOpen(`<div class="chEnd"><div class="chStars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
    <h3>أنجزتَ ${cfg.title}!</h3><p class="muted">أجبت ${ar(C.firstTry)} من ${ar(n)} من المحاولة الأولى. ${stars < 3 ? 'تستطيع إعادة الدرس لاحقاً من «رحلة الدروس» لتجمع النجوم الثلاث.' : 'إتقان كامل! 🌟'}</p>
    <button class="act big" id="chFin">متابعة</button></div>`);
  sfx('win');
  btn('chFin', async () => { sheetClose(); d.chDone = true; d.chStage = 3; changed(); const r = cfg.resolve; cfg.resolve = null; await finish(W, cfg.id, cfg.lines, cfg.reward || 25); r && r(); });
}

/* لكل درس: مهمة العالم ثم التحدي. يُستدعى بدل finish في نهاية مهمة العالم.
   mod.challenge = { who, title, make: () => items, lines (حوار الختام), reward } */
export async function stage2(W, d, mod) { d.chStage = 2; changed(); await runChallenge(W, d, Object.assign({ id: mod.id }, mod.challenge)); }
export const challengeGoal = mod => `🎯 ${mod.challenge.title}: أجب عن أسئلة ${mod.challenge.title.replace(/^تحدي\s*/, '')}`;

/* ── أدوات توليد الجولات ── */
export const pickN = (arr, k) => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).slice(0, k).map(x => x[1]);
export function choice(q, right, wrongs, hint, out, extra = {}) {   // يخلط الخيارات ويحفظ مكان الصحيح
  wrongs = wrongs.filter((w, i, A) => String(w) !== String(right) && A.findIndex(x => String(x) === String(w)) === i).slice(0, 3);   // بلا تكرار
  const opts = pickN([right, ...wrongs], wrongs.length + 1); return Object.assign({ type: 'choice', q, opts: opts.map(String), ans: opts.indexOf(right), hint, out }, extra);
}
export function multi(q, items, isRight, hint, out, extra = {}) { const opts = pickN(items, items.length); return Object.assign({ type: 'multi', q, opts: opts.map(String), ans: opts.map((v, k) => isRight(v) ? k : -1).filter(k => k >= 0), hint, out }, extra); }
export function order(q, items, cmp, hint, out, extra = {}) { const opts = pickN(items, items.length), sorted = items.slice().sort(cmp); return Object.assign({ type: 'order', q, opts: opts.map(o => String(o.label ?? o)), ans: sorted.map(v => opts.indexOf(v)), hint, out }, extra); }
export const num = (q, ans, hint, out, extra = {}) => Object.assign({ type: 'num', q, ans, hint, out }, extra);
export const tf = (q, isTrue, hint, out, why, extra = {}) => Object.assign({ type: 'tf', q, ans: isTrue ? 0 : 1, hint, out, why }, extra);
