// «تحدي الشخصية»: المرحلة الثانية من كل درس — رحلة جولات قصيرة متنوعة تغطي مخرجات الدرس التي لا تغطيها مهمة العالم.
// أنواع الجولات: choice (اختر واحداً)، multi (اختر كل الصحيح)، num (اكتب العدد)، order (رتّب بالضغط بالترتيب)،
// build (كوّن عدداً من بطاقات الأرقام)، sort (وزّع البطاقات على صندوقين)، match (صِل كل بطاقة بما يناسبها)، tf (صح أم خطأ ثم السبب).
// لا مؤقت ولا عقاب: الخطأ يعطي تلميحاً وتعاد المحاولة، وكل جولة تضيف جوهرة. النجوم تكافئ الإجابة من المحاولة الأولى فقط.
// item = { type, out, q, opts?, ans, hint, why?, tail?, art?, bins?, left?, right? }
import { ar } from '../core/util.js';
import { sfx, cheer } from '../core/sound.js';
import { OUT } from '../content/outcomes.js';
import { game } from '../core/state.js';
import { addGems } from '../world/decor.js';
import { changed, finish, sheetOpen, sheetClose, msgBox, setMsg, numPad, btn, dec } from './bench.js';
import { miss, hit } from './review.js';
import { praise } from '../core/voices.js';
import { weeklyTick } from './weekly.js';

const PEOPLE_ICON = { salem: '🧔🏽', yousef: '👦🏽', hamad: '👨🏽‍🌾', saeed: '📮', umkhalid: '👩🏽', rashed: '👨🏽‍🔧', naser: '🧔🏽', mubarak: '🪚', khalid: '🧑🏽‍🏫', abdullah: '👨🏽‍✈️', shaikha: '👵🏽', juma: '🐑', saif: '⚓', reem: '👷🏽‍♀️', layla: '🎁', ali: '🧱', badr: '🎣', hind: '🎨', sulaiman: '🌬️', majid: '🗺️', hamdan: '🌉', muna: '🏺', zaid: '💍', aisha: '🍮', fahad: '🎒', harith: '🪣', qais: '🔔', mariam: '🏪', khamis: '🌾', saleh: '🌴', murad: '🧱', zahra: '🍬', azzan: '🛡️', safiya: '🍲', umsaid: '👵🏽', mudhaffar: '🕰️', nawal: '📞', tariq: '🏠', hamid: '🚌', sara: '🌱', khalfan: '🌴', noor: '🎪', yaqoob: '🎡', jamal: '🏦', ruqaya: '📜', saud: '🛒', obaid: '🐟', hessa: '🎲', adil: '⚙️', latifa: '🎂', ghanim: '🏷️', shamsa: '🥣', raya: '🍫', humaid: '🛢️', mansour: '⛽', sultan: '🐪', lubna: '✈️', faisal: '📅', wafa: '🌷', buthaina: '🏜️', hamood: '🔲', amna: '🚩', mohsen: '📐', zainab: '📦', jaber: '💎' };
export const DRAW = {};   // رسوم canvas داخل السؤال: <canvas data-draw="اسم"> تملؤها DRAW[اسم](canvas) بعد العرض
const PRAISE = ['أحسنت!', 'رائع!', 'ممتاز!', 'عبقري!', 'بطل!', 'إجابة ذكية!', 'هكذا تماماً!', 'تفكير جميل!'];

/* يبدأ التحدي (أو يستأنفه) بعد مهمة العالم. d: بيانات الدرس (يُحفظ فيها التقدّم d.ch) */
export function runChallenge(W, d, cfg) {
  if (!d.ch) { d.ch = { items: cfg.make(), i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 }; changed(); }
  return new Promise(resolve => { cfg.resolve = resolve; render(W, d, cfg, null); });
}

const cards = (it, cls = 'chOpt') => it.opts.map((o, k) => `<button class="${cls}" data-k="${k}">${o}</button>`).join('');
function render(W, d, cfg, msg) {
  const C = d.ch, it = C.items[C.i], n = C.items.length, face = PEOPLE_ICON[cfg.who] || '🧑🏽';
  const trail = C.items.map((_, k) => `<i class="${k < C.i ? 'ok' : k === C.i ? 'now' : ''}">${k === C.i ? `<span>${face}</span>` : k < C.i ? '💎' : ''}</i>`).join('') + '<b class="chChest">🎁</b>';
  const out = it.out && OUT[it.out] ? `<div class="chOut" title="${OUT[it.out]}">🎯 ${OUT[it.out]}</div>` : '';
  let body = '';
  if (it.type === 'choice' || it.type === 'tf') body = `<div class="chOpts">${it.type === 'tf' ? ['✔ صحيح', '✘ خطأ'].map((o, k) => `<button class="chOpt" data-k="${k}">${o}</button>`).join('') : cards(it)}</div>`;
  if (it.type === 'multi') body = `<div class="chOpts multi">${cards(it)}</div><button class="act go" id="chGo">✓ تحقّق</button>`;
  if (it.type === 'order' || it.type === 'build') body = `<div class="chOrder${it.type === 'build' ? ' build' : ''}" id="chSeq"></div><div class="chOpts${it.type === 'build' ? ' tiles' : ''}">${cards(it)}</div><div class="row2"><button class="act ghost" id="chUndo">↩ تراجع</button><button class="act go" id="chGo">✓ تحقّق</button></div>`;
  if (it.type === 'sort') body = `<div class="chBins">${it.bins.map((b, i) => `<div class="chBin b${i}" data-b="${i}"><h4>${b}</h4><div class="chBinIn"></div></div>`).join('')}</div><div class="chPool">${cards(it, 'chCard')}</div><button class="act go" id="chGo">✓ تحقّق</button>`;
  if (it.type === 'match') body = `<div class="chMatch"><div>${it.left.map((o, k) => `<button class="chL" data-k="${k}">${o}</button>`).join('')}</div><div>${it.right.map((o, k) => `<button class="chR" data-k="${k}">${o}</button>`).join('')}</div></div><button class="act go" id="chGo">✓ تحقّق</button>`;
  if (it.type === 'num') body = `<div id="chPad"></div>`;
  if (it.type === 'line') body = `<div class="chNL"><svg viewBox="0 0 320 70" class="chLine"><line x1="20" y1="40" x2="300" y2="40" stroke="#2A1B66" stroke-width="3"/>${it.ticks.map(t => `<line x1="${20 + (t.v - it.lo) / (it.hi - it.lo) * 280}" y1="${t.l ? 30 : 34}" x2="${20 + (t.v - it.lo) / (it.hi - it.lo) * 280}" y2="${t.l ? 50 : 46}" stroke="#2A1B66" stroke-width="${t.l ? 2.2 : 1.2}"/>${t.l ? `<text x="${20 + (t.v - it.lo) / (it.hi - it.lo) * 280}" y="66" text-anchor="middle" font-size="12" font-weight="900" fill="#2A1B66" font-family="Cairo,sans-serif" direction="ltr">${t.l}</text>` : ''}`).join('')}<path id="chNLm" d="M0 30 l-8 -16 h16z" fill="#E2475C"/></svg>
    <input type="range" id="chNLr" min="0" max="1000" value="500" dir="ltr"></div><button class="act go" id="chGo">📍 هنا</button>`;
  if (it.type === 'memory') body = `<div class="chMem">${it.cards.map((c, k) => `<button class="chMc" data-k="${k}"><span>❔</span><b>${c.t}</b></button>`).join('')}</div>`;
  if (it.type === 'error') body = `<div class="chSteps">${it.steps.map((st, k) => `<button class="chStep" data-k="${k}"><em>${ar(k + 1)}</em><span>${st}</span></button>`).join('')}</div>`;
  sheetOpen(`<div class="chHead"><span class="chFace">${face}</span><div><b>${cfg.title}</b><small>الجولة ${ar(C.i + 1)} من ${ar(n)} · بلا مؤقت 🙂</small></div>
      ${(C.streak || 0) >= 2 ? `<span class="chStreak">🔥 ${ar(C.streak)}</span>` : ''}<span class="chGems">💎 ${ar(C.gems || 0)}</span>${cfg.exit ? '<button class="chExit" id="chExit" aria-label="خروج">✕</button>' : ''}</div>
    ${cfg.scene ? `<div class="acScene">${cfg.scene(C.i, n)}</div>` : `<div class="chTrail">${trail}</div>`}
    ${out}${it.art ? `<div class="chArt">${it.art}</div>` : ''}
    <div class="chQ">${it.q}${it.tail ? `<div class="chTail">${it.tail}</div>` : ''}</div>
    ${msgBox(msg ? msg.t : '', msg ? msg.k : '')}${body}`);
  const el = document.getElementById('panel'), sheet = el.querySelector('.sheet');
  sheet.classList.add('chSheet'); sheet.dataset.i = C.i;
  const gold = n >= 6 && C.i === n - 1;   // سؤال الكنز: الجولة الأخيرة ذهبية وبجوهرتين
  if (it.rv) { const q = sheet.querySelector('.chQ'); if (q) q.insertAdjacentHTML('beforebegin', '<div class="chRvTag">🔁 مراجعة: مهارة أخطأت فيها سابقاً — أنت أقوى الآن!</div>'); }
  const src = it.src || cfg.id;   // الدرس الذي جاء منه السؤال (للمراجعة الذكية)
  if (gold) { sheet.classList.add('chGold'); const q = sheet.querySelector('.chQ'); if (q) q.insertAdjacentHTML('beforebegin', '<div class="chGoldTag">🎁 سؤال الكنز · جوهرتان 💎💎</div>'); }
  el.querySelectorAll('canvas[data-draw]').forEach(cv => { try { DRAW[cv.dataset.draw] && DRAW[cv.dataset.draw](cv); } catch (e) { console.warn('رسم التحدي', e); } });
  if (cfg.exit) btn('chExit', () => { sheetClose(); cfg.exit(); });   // النشاط اختياري: يخرج منه متى شاء بلا خسارة
  let locked = false;
  const ok = () => { if (locked) return; locked = true;
    const gold = n >= 6 && C.i === n - 1; if (gold) { C.gems = (C.gems || 0) + 1; addGems(1); }
    const first = C.tries === 0, rvr = hit(src, it.out, first); C.firstTry += first ? 1 : 0; C.streak = first ? (C.streak || 0) + 1 : 0; C.gems = (C.gems || 0) + 1; C.tries = 0; C.i++; addGems(1);   // جوهرة لكل إجابة صحيحة (تُصرف في متجر الزينة)
   
    const S = game.state.stats = game.state.stats || {}; if (!first) S.persist = (S.persist || 0) + 1; S.streak = Math.max(S.streak || 0, C.streak);   // للأوسمة: المثابرة وأطول سلسلة
    sfx('good'); changed(); praise(cfg.who);   // الشخصية تمدح بصوتها
    const praiseT = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    // الإطراء والشرح يظهران بعد الإجابة مباشرة في الاحتفال، والسؤال التالي يبدأ برسالة محايدة
    const fc = sheet.querySelector('.chFace'); if (fc) { fc.classList.remove('cheer'); void fc.offsetWidth; fc.classList.add('cheer'); }   // الشخصية تقفز فرحاً
    const MS = { 3: ['🔥', 'ثلاثة متتالية!'], 5: ['⚡', 'خمسة متتالية! مذهل!'], 8: ['🌟', 'ثمانية متتالية! أسطورة!'] }, ms = rvr === 'mastered' ? ['🧠', 'أتقنتَ هذه المهارة!'] : MS[C.streak];   // سلسلة الإجابات، أو إتقان مهارة من المراجعة
    if (ms) { cheer('medal', C.streak); setTimeout(() => cheer('medal', C.streak + 4), 140); setTimeout(() => cheer('sparkle'), 260); }
    if (gold) setTimeout(() => cheer('sparkle'), 120);
    sheet.insertAdjacentHTML('beforeend', `<div class="chBurst${it.why ? ' why' : ''}${ms ? ' streak' : ''}${gold ? ' gold' : ''}"><div class="chCheer"><i>${face}</i><em>👏</em></div><b>${gold ? '💎💎' : ms ? ms[0] : '💎'}</b><span>${ms ? ms[1] : gold ? 'كنز!' : praiseT}</span>${it.why ? `<p>${it.why}</p>` : ''}${'<i></i>'.repeat(10)}</div>`);
    setTimeout(() => { if (C.i >= n) done(W, d, cfg); else render(W, d, cfg, null); }, it.why ? 2200 : ms || gold ? 1300 : 850); };
  const bad = extra => { const fc = sheet.querySelector('.chFace'); if (fc) { fc.classList.remove('think'); void fc.offsetWidth; fc.classList.add('think'); }   // تفكّر معك، لا تغضب
    if (C.tries === 0) miss(src, it.out); C.tries++; C.streak = 0; sfx('cough'); changed(); setMsg('💡 ' + (extra || it.hint) + (C.tries >= 2 ? '<button class="chHowBtn" id="chHow">📖 كيف نحلّها؟</button>' : ''), 'bad');
    if (C.tries >= 2) btn('chHow', () => howTo(sheet, it, face)); sheet.classList.add('shake'); setTimeout(() => sheet.classList.remove('shake'), 450); };
  const wrongCount = w => w === 1 ? 'بطاقة واحدة ليست في مكانها. ' : `${ar(w)} بطاقات ليست في مكانها. `;
  if (it.type === 'choice' || it.type === 'tf') el.querySelectorAll('.chOpt').forEach(b => b.onclick = e => { e.stopPropagation(); +b.dataset.k === it.ans ? (b.classList.add('on'), ok()) : (b.classList.add('no'), bad()); });
  if (it.type === 'multi') { const sel = new Set(); el.querySelectorAll('.chOpt').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.k; sel.has(k) ? sel.delete(k) : sel.add(k); b.classList.toggle('on'); sfx('click'); });
    btn('chGo', () => { const a = new Set(it.ans); if (sel.size === a.size && [...sel].every(k => a.has(k))) ok(); else bad(sel.size < a.size && [...sel].every(k => a.has(k)) ? 'صحيح ما اخترته، لكن ما زال هناك المزيد.' : null); }); }
  if (it.type === 'order' || it.type === 'build') { const seq = [], box = el.querySelector('#chSeq'), ph = it.type === 'build' ? 'اضغط البطاقات لتكوّن العدد' : 'اضغط البطاقات بالترتيب';
    const show = () => { box.innerHTML = seq.length ? (it.type === 'build' ? `<b>${seq.map(k => it.opts[k]).join('')}</b>` : seq.map(k => `<b>${it.opts[k]}</b>`).join('<em>،</em>')) : `<span class="ph">${ph}</span>`; el.querySelectorAll('.chOpt').forEach(b => b.disabled = seq.includes(+b.dataset.k)); };
    show();
    el.querySelectorAll('.chOpt').forEach(b => b.onclick = e => { e.stopPropagation(); seq.push(+b.dataset.k); sfx('click'); show(); });
    btn('chUndo', () => { seq.pop(); show(); });
    btn('chGo', () => { if (seq.length < it.ans.length) return bad('استعمل كل البطاقات أولاً.'); seq.every((k, i) => k === it.ans[i]) ? ok() : bad(); }); }
  if (it.type === 'sort') { const place = it.opts.map(() => -1); let sel = -1;
    const show = () => el.querySelectorAll('.chCard').forEach(b => { const k = +b.dataset.k; b.classList.toggle('sel', k === sel);
      const home = place[k] < 0 ? el.querySelector('.chPool') : el.querySelector(`.chBin[data-b="${place[k]}"] .chBinIn`); if (b.parentNode !== home) home.appendChild(b); });
    el.querySelectorAll('.chCard').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.k; if (place[k] >= 0) { place[k] = -1; sel = k; } else sel = sel === k ? -1 : k; sfx('click'); show(); });
    el.querySelectorAll('.chBin').forEach(b => b.onclick = e => { e.stopPropagation(); if (sel < 0) return; place[sel] = +b.dataset.b; sel = -1; sfx('click'); show(); });
    btn('chGo', () => { if (place.includes(-1)) return bad('ضع كل البطاقات في الصناديق أولاً: اضغط البطاقة ثم الصندوق.'); const w = place.filter((p, k) => p !== it.ans[k]).length; w ? bad(wrongCount(w) + it.hint) : ok(); }); }
  if (it.type === 'match') { const pair = it.left.map(() => -1); let sel = -1;
    const show = () => { el.querySelectorAll('.chL').forEach(b => { const k = +b.dataset.k; b.className = 'chL' + (pair[k] >= 0 ? ' p' + k : '') + (k === sel ? ' sel' : ''); });
      el.querySelectorAll('.chR').forEach(b => { const r = +b.dataset.k, l = pair.indexOf(r); b.className = 'chR' + (l >= 0 ? ' p' + l : ''); }); };
    el.querySelectorAll('.chL').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.k; pair[k] = -1; sel = sel === k ? -1 : k; sfx('click'); show(); });
    el.querySelectorAll('.chR').forEach(b => b.onclick = e => { e.stopPropagation(); if (sel < 0) return setMsg('اضغط أولاً بطاقة من العمود الأيمن، ثم ما يناسبها.', ''); const r = +b.dataset.k, old = pair.indexOf(r); if (old >= 0) pair[old] = -1; pair[sel] = r; sel = -1; sfx('click'); show(); });
    btn('chGo', () => { if (pair.includes(-1)) return bad('صِل كل البطاقات أولاً.'); const w = pair.filter((r, k) => r !== it.ans[k]).length; w ? bad(`${w === 1 ? 'وصلة واحدة غير صحيحة' : ar(w) + ' وصلات غير صحيحة'}. ${it.hint}`) : ok(); }); }
  if (it.type === 'line') { const r = el.querySelector('#chNLr'), m = el.querySelector('#chNLm'), val = () => it.lo + r.value / 1000 * (it.hi - it.lo);
    const show = () => m.setAttribute('transform', `translate(${20 + r.value / 1000 * 280} 0)`); r.oninput = show; show(); r.onpointerdown = e => e.stopPropagation();
    btn('chGo', () => Math.abs(val() - it.ans) <= it.tol ? ok() : bad(val() < it.ans ? 'أبعد قليلاً نحو اليمين.' : 'ارجع قليلاً نحو اليسار.')); }
  if (it.type === 'memory') { let open = [], done = new Set();   // ذاكرة: اقلب بطاقتين متطابقتين
    el.querySelectorAll('.chMc').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.k; if (done.has(k) || open.includes(k) || open.length >= 2) return;
      b.classList.add('up'); open.push(k); sfx('click');
      if (open.length === 2) { const [a, c] = open, same = it.cards[a].p === it.cards[c].p;
        setTimeout(() => { if (same) { done.add(a); done.add(c); el.querySelectorAll('.chMc').forEach(x => { if (open.includes(+x.dataset.k)) x.classList.add('ok'); }); sfx('good'); if (done.size === it.cards.length) ok(); }
          else { el.querySelectorAll('.chMc').forEach(x => { if (open.includes(+x.dataset.k)) x.classList.remove('up'); }); C.tries++; setMsg('💡 ' + it.hint, 'bad'); }
          open = []; }, same ? 250 : 900); } }); }
  if (it.type === 'error') el.querySelectorAll('.chStep').forEach(b => b.onclick = e => { e.stopPropagation(); +b.dataset.k === it.ans ? (b.classList.add('on'), ok()) : (b.classList.add('no'), bad()); });
  if (it.type === 'num') { const pad = numPad(el.querySelector('#chPad'), 'تحقّق', v => { Math.round(v * 1000) === Math.round(it.ans * 1000) ? ok() : (bad(), pad.clear()); }, { neg: it.neg, dot: it.dot !== false }); }
}
/* «كيف نحلّها؟»: بعد خطأين في السؤال نفسه — شرح من أربع خطوات يظهر تباعاً: المطلوب، الفكرة، الحل، ثم دورك.
   لا يُنهي الجولة عنه: الطالب يُدخل الحل بنفسه (والإجابة المضيئة تساعده في أسئلة الاختيار) */
const SEP = '<em class="chHowSep">←</em>';
function solution(it) {
  const o = it.opts || [];
  if (it.type === 'choice' || it.type === 'error') return it.type === 'error' ? `الخطأ في الخطوة ${ar(it.ans + 1)}: <bdi>${it.steps[it.ans]}</bdi>` : `<b>${o[it.ans]}</b>`;
  if (it.type === 'tf') return it.ans === 0 ? 'العبارة <b>صحيحة</b> ✔' : 'العبارة <b>خاطئة</b> ✘';
  if (it.type === 'multi') return it.ans.map(k => `<b>${o[k]}</b>`).join('، ');
  if (it.type === 'order') return it.ans.map(k => `<b>${o[k]}</b>`).join(SEP);
  if (it.type === 'build') return `<b dir="ltr">${it.ans.map(k => o[k]).join('')}</b>`;
  if (it.type === 'sort') return it.bins.map((b, i) => `<div class="chHowBin"><u>${b}</u> ${o.filter((_, k) => it.ans[k] === i).map(x => `<b>${x}</b>`).join(' ')}</div>`).join('');
  if (it.type === 'match') return it.left.map((l, k) => `<div class="chHowBin"><b>${l}</b> ⟷ <b>${it.right[it.ans[k]]}</b></div>`).join('');
  if (it.type === 'num') return `<b>${dec(it.ans)}</b>`;
  if (it.type === 'line') { const t = (it.ticks || []).find(t => t.l && Math.abs(t.v - it.ans) < 1e-9); return `السهم عند <b>${t ? t.l : dec(it.ans)}</b>`; }
  return '';
}
const YOUR_TURN = { choice: 'اضغط الإجابة المضيئة ✨', tf: 'اضغط الإجابة المضيئة ✨', error: 'اضغط الخطوة المضيئة ✨', multi: 'اختر الإجابات المضيئة ✨ ثم «تحقّق»', order: 'اضغط البطاقات بهذا الترتيب', build: 'كوّن العدد من البطاقات', sort: 'ضع كل بطاقة في صندوقها', match: 'صِل كل بطاقة بما يقابلها', num: 'اكتب العدد في اللوحة', line: 'حرّك السهم إلى مكانه' };
function howTo(sheet, it, face) {
  const old = sheet.querySelector('.chHowBg'); if (old) old.remove();
  const steps = [
    ['🔍', 'ماذا يطلب السؤال؟', it.out && OUT[it.out] ? `المهارة: ${OUT[it.out]}` : 'اقرأ السؤال مرة أخرى بهدوء، وحدّد الأعداد والمطلوب.'],
    ['💡', 'الفكرة', it.hint || 'فكّر في القاعدة التي تعلمتها في هذا الدرس.'],
    ['✅', 'الحل', solution(it) + (it.why ? `<p>${it.why}</p>` : '')],
    ['👆', 'دورك الآن', YOUR_TURN[it.type] || 'جرّب مرة أخرى']];
  sheet.insertAdjacentHTML('beforeend', `<div class="chHowBg"><div class="chHowBox"><div class="chHowHead"><span class="chFace">${face}</span><b>📖 كيف نحلّها؟ خطوة بخطوة</b></div>
    ${steps.map((st, k) => `<div class="chHowStep${k === 2 ? ' sol' : ''}" style="animation-delay:${k * .55}s"><em>${ar(k + 1)}</em><i>${st[0]}</i><div><h5>${st[1]}</h5><div>${st[2]}</div></div></div>`).join('')}
    <button class="act go big" id="chHowOk">فهمت، سأجرّب ✋</button></div></div>`);
  sfx('click');
  btn('chHowOk', () => { sheet.querySelector('.chHowBg').remove();
    const lit = it.type === 'multi' ? it.ans : ['choice', 'tf', 'error'].includes(it.type) ? [it.ans] : [];
    sheet.querySelectorAll(it.type === 'error' ? '.chStep' : '.chOpt').forEach(b => { if (lit.includes(+b.dataset.k)) b.classList.add('chLit'); }); });
}
// عند الإنهاء تُحذف الأسئلة من الحفظ ويبقى ملخصها فقط (رمز التقدّم أقصر)
async function done(W, d, cfg) {
  const C = d.ch, n = C.items.length, stars = C.firstTry >= n ? 3 : C.firstTry >= n - 2 ? 2 : 1;
  weeklyTick();   // كل تحدٍّ منجز يُحسب لهدف الأسبوع
  if (cfg.onDone) return cfg.onDone(stars, C);   // نشاط اختياري: له شاشة نهاية خاصة
  d.stars = Math.max(d.stars || 0, stars); changed();
  sheetOpen(`<div class="chEnd"><div class="chDance"><i>${PEOPLE_ICON[cfg.who] || '🧑🏽'}</i><span>🎉</span><span>🎊</span></div><div class="chTreasure">🎁</div><div class="chStars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
    <h3>أنجزتَ ${cfg.title}!</h3><p class="chGot">جمعتَ <b>${ar(C.gems || n)}</b> 💎</p><p class="muted">أجبت ${ar(C.firstTry)} من ${ar(n)} من المحاولة الأولى. ${stars < 3 ? 'تستطيع لعب «نشاط الدرس» لاحقاً من الخريطة 🗺️ لتجمع النجوم الثلاث.' : 'إتقان كامل! 🌟'}</p>
    <button class="act big" id="chFin">متابعة</button></div>`);
  document.querySelector('#panel .sheet').classList.add('chSheet');
  sfx('win');
  btn('chFin', async () => { sheetClose(); d.chDone = true; d.chStage = 3; d.ch = { n, firstTry: C.firstTry, gems: C.gems || n }; changed(); const r = cfg.resolve; cfg.resolve = null; await finish(W, cfg.id, cfg.lines, cfg.reward || 25); r && r(); });
}

/* لكل درس: مهمة العالم ثم التحدي. mod.challenge = { who, title, make: () => items, lines (حوار الختام), reward } */
export async function stage2(W, d, mod) { d.chStage = 2; changed(); await runChallenge(W, d, Object.assign({ id: mod.id }, mod.challenge)); }
export const challengeGoal = mod => `🎯 ${mod.challenge.title}: أجب عن أسئلة ${mod.challenge.title.replace(/^تحدي\s*/, '')}`;

/* ── أدوات توليد الجولات ── */
export const pickN = (arr, k) => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).slice(0, k).map(x => x[1]);
export function choice(q, right, wrongs, hint, out, extra = {}) {   // يخلط الخيارات ويحفظ مكان الصحيح
  wrongs = wrongs.filter((w, i, A) => String(w) !== String(right) && A.findIndex(x => String(x) === String(w)) === i).slice(0, 3);   // بلا تكرار
  const opts = pickN([right, ...wrongs], wrongs.length + 1); return Object.assign({ type: 'choice', q, opts: opts.map(String), ans: opts.indexOf(right), hint, out }, extra);
}
export function multi(q, items, isRight, hint, out, extra = {}) { const opts = pickN(items, items.length); return Object.assign({ type: 'multi', q, opts: opts.map(v => typeof v === 'number' ? ar(v) : String(v)), ans: opts.map((v, k) => isRight(v) ? k : -1).filter(k => k >= 0), hint, out }, extra); }
export function order(q, items, cmp, hint, out, extra = {}) { const opts = pickN(items, items.length), sorted = items.slice().sort(cmp); return Object.assign({ type: 'order', q, opts: opts.map(o => String(o.label ?? o)), ans: sorted.map(v => opts.indexOf(v)), hint, out }, extra); }
// build: بطاقات مختلفة؛ right = نصوص البطاقات بالترتيب الصحيح
export function build(q, right, hint, out, extra = {}) { const opts = pickN(right, right.length); return Object.assign({ type: 'build', q, opts, ans: right.map(t => opts.indexOf(t)), hint, out }, extra); }
// sort: list = [{ label, bin }] — bin فهرس الصندوق الصحيح
export function sort(q, bins, list, hint, out, extra = {}) { const c = pickN(list, list.length); return Object.assign({ type: 'sort', q, bins, opts: c.map(x => String(x.label)), ans: c.map(x => x.bin), hint, out }, extra); }
// match: pairs = [[يمين, يسار]] — العمود الثاني يُخلط
export function match(q, pairs, hint, out, extra = {}) { const p = pickN(pairs, pairs.length), right = pickN(p.map(x => String(x[1])), p.length);
  return Object.assign({ type: 'match', q, left: p.map(x => String(x[0])), right, ans: p.map(x => right.indexOf(String(x[1]))), hint, out }, extra); }
// خط أعداد بسهم يُسحب: ticks = [{ v, l }]، tol = السماح
export const line = (q, lo, hi, ans, ticks, tol, hint, out, extra = {}) => Object.assign({ type: 'line', q, lo, hi, ans, ticks, tol, hint, out }, extra);
// ذاكرة: pairs = [[نص، نص مطابق]] تُخلط البطاقات
export function memory(q, pairs, hint, out, extra = {}) { const cards = pickN(pairs.flatMap((p, i) => [{ t: String(p[0]), p: i }, { t: String(p[1]), p: i }]), pairs.length * 2); return Object.assign({ type: 'memory', q, cards, hint, out }, extra); }
// اكتشف الخطأ: steps خطوات حل، bad = فهرس الخطوة الخاطئة
export const error = (q, steps, bad, hint, out, extra = {}) => Object.assign({ type: 'error', q, steps, ans: bad, hint, out }, extra);
export const num = (q, ans, hint, out, extra = {}) => Object.assign({ type: 'num', q, ans, hint, out }, extra);
export const tf = (q, isTrue, hint, out, why, extra = {}) => Object.assign({ type: 'tf', q, ans: isTrue ? 0 : 1, hint, out, why }, extra);
/* أعداد جديدة في كل جولة: لا يتكرر عدد في جولتين من التحدي نفسه */
export function fresh() {
  const used = new Set(), R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const r = (a, b, ok = () => true) => { for (let t = 0; t < 400; t++) { const v = R(a, b); if (!used.has(v) && ok(v)) { used.add(v); return v; } } const v = R(a, b); used.add(v); return v; };
  r.take = (list, ok = () => true) => { const c = pickN(list.filter(v => !used.has(v) && ok(v)), 1)[0] ?? pickN(list, 1)[0]; used.add(c); return c; };
  r.digits = (k, zero = true) => { const ds = pickN(zero ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9], k); if (ds[0] === 0) ds.push(ds.shift()); return ds; };   // أرقام مختلفة، والأول ليس صفراً
  r.has = v => used.has(v); r.mark = v => used.add(v);
  return r;
}
