// «ألعاب الساحة»: ثلاث ألعاب قصيرة بحساب ذهني، بلا مؤقت ولا عقاب (الخطأ لا يُنقص شيئاً، فقط لا يتقدم):
// سباق الجمال (كل إجابة صحيحة تقدّم جملك، والمنافس يتقدّم خطوة ثابتة مع كل سؤال)، صيد السمك (انقر السمكة التي تحمل الجواب)،
// قطاف التمر (اقطف كل العناقيد التي تحقق الشرط). جوهرة لكل إجابة صحيحة ومكافأة الفوز. وزينة الرفيق «سهيل».
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx, cheer } from '../core/sound.js';
import { ar } from '../core/util.js';
import { addGems } from '../world/decor.js';

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const rec = () => { const s = game.state; s.mini = s.mini || { plays: 0, wins: {}, best: {} }; return s.mini; };
/* سؤال حساب ذهني بمستوى الصف السادس: ضرب، قسمة، جمع وطرح، مضاعفات ١٠ و١٠٠، نصف وضعف */
function question() {
  const k = R(0, 5);
  if (k === 0) { const a = R(3, 12), b = R(3, 12); return { q: `${ar(a)} × ${ar(b)}`, a: a * b }; }
  if (k === 1) { const b = R(3, 12), a = b * R(3, 12); return { q: `${ar(a)} ÷ ${ar(b)}`, a: a / b }; }
  if (k === 2) { const a = R(25, 95), b = R(12, 60); return { q: `${ar(a)} + ${ar(b)}`, a: a + b }; }
  if (k === 3) { const a = R(60, 150), b = R(15, 55); return { q: `${ar(a)} − ${ar(b)}`, a: a - b }; }
  if (k === 4) { const a = R(2, 9), m = pick([10, 100]); return { q: `${ar(a)} × ${ar(m)}`, a: a * m }; }
  const a = R(6, 49) * 2; return { q: `نصف ${ar(a)}`, a: a / 2 };
}
const wrongs = (a, n) => { const s = new Set([a]); for (let i = 0; i < 40 && s.size < n + 1; i++) { const v = a + pick([-10, -2, -1, 1, 2, 10, -3, 3]) * (i % 3 + 1); if (v > 0) s.add(v); } s.delete(a); return [...s].slice(0, n); };
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const panel = () => document.getElementById('panel');
const close = () => { const el = panel(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
const prize = n => { if (n > 0) { addGems(n); bus.emit('save'); } };

export function openMiniGames() {
  const el = panel(), m = rec(); game.busy = true; sfx('talk');
  el.innerHTML = `<div class="sheet mini"><h3>🎮 ألعاب الساحة</h3><p class="muted">حساب ذهني سريع ممتع، بلا مؤقت. كل إجابة صحيحة جوهرة 💎، والفوز بمكافأة إضافية.</p>
    <div class="mgList">
      <button class="mgCard" data-g="race"><span>🐪</span><b>سباق الجمال</b><small>كل إجابة صحيحة تقدّم جملك نحو خط النهاية</small><em>${m.wins.race ? `🏆 فزتَ ${ar(m.wins.race)}` : 'جديدة'}</em></button>
      <button class="mgCard" data-g="fish"><span>🐟</span><b>صيد السمك</b><small>اصطد السمكة التي تحمل الجواب الصحيح</small><em>${m.best.fish ? `🎣 أفضل صيد ${ar(m.best.fish)}` : 'جديدة'}</em></button>
      <button class="mgCard" data-g="dates"><span>🌴</span><b>قطاف التمر</b><small>اقطف كل العناقيد التي تحقق الشرط</small><em>${m.best.dates ? `🧺 أفضل قطاف ${ar(m.best.dates)}` : 'جديدة'}</em></button>
    </div><button class="act" id="mgOut">رجوع إلى القرية</button></div>`;
  el.classList.add('on');
  el.querySelectorAll('[data-g]').forEach(b => b.onclick = e => { e.stopPropagation(); sfx('click'); ({ race, fish, dates })[b.dataset.g](); });
  document.getElementById('mgOut').onclick = e => { e.stopPropagation(); close(); };
}
function frame(title, body, onBack) {
  const el = panel(); el.innerHTML = `<div class="sheet mini"><div class="mgHead"><b>${title}</b><button class="chExit" id="mgBack" aria-label="رجوع">✕</button></div>${body}</div>`; el.classList.add('on');
  document.getElementById('mgBack').onclick = e => { e.stopPropagation(); onBack ? onBack() : openMiniGames(); };
  return el;
}
const endCard = (icon, title, line, gems, again) => {
  const el = frame(icon + ' ' + title, `<div class="mgEnd"><div class="mgBig">${icon}</div><h3>${title}</h3><p>${line}</p><p class="chGot">+${ar(gems)} 💎</p>
    <div class="row2"><button class="act go" id="mgAgain">🔁 مرة أخرى</button><button class="act ghost" id="mgHub">🎮 ألعاب الساحة</button></div></div>`);
  document.getElementById('mgAgain').onclick = e => { e.stopPropagation(); again(); }; document.getElementById('mgHub').onclick = e => { e.stopPropagation(); openMiniGames(); };
};

/* ── سباق الجمال: ١٠ مواقع للنهاية؛ الصحيح يتقدم خطوتين، والمنافس خطوة مع كل سؤال ── */
function race() {
  const G = { me: 0, rival: 0, END: 12, gems: 0, n: 0 };
  const draw = (msg, kind) => {
    const q = G.q = question(), opts = shuffle([q.a, ...wrongs(q.a, 3)]);
    const lane = (pos, col, who) => `<div class="mgLane"><span class="mgFlag">🏁</span><i class="mgCamel" style="right:${pos / G.END * 86}%">🐪<em style="background:${col}">${who}</em></i></div>`;
    frame('🐪 سباق الجمال', `<div class="mgTrack">${lane(G.me, '#2F6FB2', 'جملك')}${lane(G.rival, '#C0392B', 'المنافس')}</div>
      <div class="mgQ">${q.q} = ؟</div>${msg ? `<div class="mgMsg ${kind}">${msg}</div>` : ''}<div class="mgOpts">${opts.map(v => `<button class="chOpt" data-v="${v}">${ar(v)}</button>`).join('')}</div>`);
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); const right = +b.dataset.v === q.a; G.n++;
      if (right) { G.me += 2; G.gems++; sfx('good'); bus.emit('sfx', 'good'); } else sfx('cough');
      G.rival += 1;
      if (G.me >= G.END || G.rival >= G.END) { const won = G.me >= G.END; const bonus = won ? 3 : 0, m = rec(); m.plays++; if (won) { m.wins.race = (m.wins.race || 0) + 1; cheer('fanfare'); } prize(G.gems + bonus);
        return endCard(won ? '🏆' : '🐪', won ? 'فاز جملك!' : 'كاد جملك يفوز!', won ? `وصلتَ أولاً بعد ${ar(G.n)} سؤالاً. أحسنت!` : 'المنافس سبقك هذه المرة، جرّب مرة أخرى!', G.gems + bonus, race); }
      draw(right ? 'صحيح! جملك يقفز للأمام 🐪💨' : `الجواب ${ar(q.a)}. لا بأس، السؤال التالي!`, right ? 'good' : 'bad'); });
  };
  draw();
}

/* ── صيد السمك: ٨ رميات؛ أربع سمكات تسبح بأرقام، اصطد الجواب ── */
function fish() {
  const G = { i: 0, N: 8, got: 0 };
  const draw = (msg, kind) => {
    if (G.i >= G.N) { const m = rec(); m.plays++; m.best.fish = Math.max(m.best.fish || 0, G.got); const bonus = G.got >= 6 ? 3 : 0; if (bonus) cheer('fanfare'); prize(G.got + bonus);
      return endCard('🎣', G.got >= 6 ? 'صيد وفير!' : 'رحلة صيد جميلة!', `اصطدتَ ${ar(G.got)} من ${ar(G.N)} سمكات.`, G.got + bonus, fish); }
    const q = question(), vals = shuffle([q.a, ...wrongs(q.a, 3)]);
    frame('🐟 صيد السمك', `<div class="mgSea">${vals.map((v, i) => `<button class="mgFish" data-v="${v}" style="top:${16 + i * 21}%;animation-delay:${-i * 1.7}s;animation-duration:${7 + i}s"><span>🐟</span><b>${ar(v)}</b></button>`).join('')}<div class="mgBoat">⛵</div></div>
      <div class="mgQ">اصطد السمكة: ${q.q}</div><div class="mgMeta">الرمية ${ar(G.i + 1)} من ${ar(G.N)} · 🎣 ${ar(G.got)}</div>${msg ? `<div class="mgMsg ${kind}">${msg}</div>` : ''}`);
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); const right = +b.dataset.v === q.a; G.i++;
      if (right) { G.got++; sfx('good'); bus.emit('sfx', 'good'); } else sfx('cough');
      draw(right ? 'اصطدتها! 🐟' : `السمكة الصحيحة كانت ${ar(q.a)}.`, right ? 'good' : 'bad'); });
  };
  draw();
}

/* ── قطاف التمر: ٤ نخلات؛ في كل نخلة ٨ عناقيد بأعداد، اقطف كل ما يحقق الشرط (مضاعفات، زوجي، أكبر من…) ── */
function dates() {
  const G = { tree: 0, N: 4, picked: 0, wrong: 0 };
  const RULES = [() => { const k = pick([3, 4, 5, 6]); return { t: `مضاعفات العدد ${ar(k)}`, f: v => v % k === 0 }; }, () => ({ t: 'الأعداد الزوجية', f: v => v % 2 === 0 }), () => { const k = R(30, 60); return { t: `الأعداد الأكبر من ${ar(k)}`, f: v => v > k }; }, () => ({ t: 'الأعداد التي آحادها ٥ أو ٠', f: v => v % 5 === 0 })];
  const plant = () => { const rule = pick(RULES)(); let vals; do { vals = Array.from({ length: 8 }, () => R(10, 90)); } while (vals.filter(rule.f).length < 2 || vals.filter(rule.f).length > 5 || new Set(vals).size < 8); return { rule, vals, done: new Set() }; };
  let T = plant();
  const draw = (msg, kind) => {
    const need = T.vals.filter(T.rule.f).length, got = [...T.done].filter(i => T.rule.f(T.vals[i])).length;
    frame('🌴 قطاف التمر', `<div class="mgPalm"><div class="mgTrunk"></div><div class="mgFronds">🌿🌿🌿</div>${T.vals.map((v, i) => `<button class="mgDate ${T.done.has(i) ? 'gone' : ''}" data-i="${i}" style="left:${12 + (i % 4) * 22}%;top:${28 + Math.floor(i / 4) * 24}%"><span class="dt"></span><b>${ar(v)}</b></button>`).join('')}<div class="mgBasket">🧺 ${ar(G.picked)}</div></div>
      <div class="mgQ">اقطف ${T.rule.t}</div><div class="mgMeta">النخلة ${ar(G.tree + 1)} من ${ar(G.N)} · بقي ${ar(need - got)} عنقود</div>${msg ? `<div class="mgMsg ${kind}">${msg}</div>` : ''}`);
    panel().querySelectorAll('[data-i]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i; if (T.done.has(i)) return;
      if (T.rule.f(T.vals[i])) { T.done.add(i); G.picked++; sfx('pick'); bus.emit('sfx', 'good');
        if ([...T.done].filter(k => T.rule.f(T.vals[k])).length === need) { G.tree++; sfx('win');
          if (G.tree >= G.N) { const m = rec(); m.plays++; m.best.dates = Math.max(m.best.dates || 0, G.picked); const bonus = G.wrong <= 2 ? 3 : 0; if (bonus) cheer('fanfare'); prize(G.picked + bonus);
            return endCard('🧺', 'سلة مليئة بالتمر!', `قطفتَ ${ar(G.picked)} عنقوداً من ${ar(G.N)} نخلات.`, G.picked + bonus, dates); }
          T = plant(); return draw('نخلة كاملة! إلى النخلة التالية 🌴', 'good'); }
        return draw('عنقود صحيح! 🍇', 'good'); }
      G.wrong++; sfx('cough'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); const box = panel().querySelector('.mgMsg') || panel().querySelector('.mgMeta'); if (box) box.insertAdjacentHTML('afterend', '');
      draw(`${ar(T.vals[i])} ليس من ${T.rule.t}، جرّب عنقوداً آخر.`, 'bad'); });
  };
  draw();
}

/* ── زينة الرفيق «سهيل»: لون البطانية وقلادة الأجراس ── */
export const SADDLES = [['red', 'بطانية حمراء', '#C8102E', 0], ['blue', 'بطانية زرقاء', '#1F4E79', 10], ['green', 'بطانية خضراء', '#1F8A3B', 10], ['gold', 'بطانية ذهبية', '#C9971C', 15], ['purple', 'بطانية بنفسجية', '#7B3F98', 15]];
export const petLook = () => { const p = (game.state && game.state.pet) || {}, sd = SADDLES.find(x => x[0] === (p.saddle || 'red')) || SADDLES[0]; return { saddle: sd[2], bells: !!p.bellsOn }; };
export function openPetDecor() {
  const s = game.state, el = panel(); game.busy = true; s.pet = s.pet || {}; s.pet.own = s.pet.own || { red: 1 };
  const draw = msg => {
    const p = s.pet, gm = s.gems || 0;
    el.innerHTML = `<div class="sheet mini"><h3>🐪 زينة سهيل</h3><p class="muted">اختر لرفيقك بطانية جميلة وقلادة أجراس. تظهر عليه وهو يمشي معك.</p>${msg ? `<div class="mgMsg good">${msg}</div>` : ''}
      <div class="mgList">${SADDLES.map(([id, name, col, price]) => `<div class="mgCard pet ${p.saddle === id || (!p.saddle && id === 'red') ? 'on' : ''}"><span class="sw" style="background:${col}"></span><b>${name}</b>
        ${p.own[id] ? `<button class="act ${p.saddle === id || (!p.saddle && id === 'red') ? 'ghost' : 'go'}" data-use="${id}">${p.saddle === id || (!p.saddle && id === 'red') ? '✓ يلبسها' : 'ألبسه'}</button>` : `<button class="act go" data-buy="${id}" ${gm < price ? 'disabled' : ''}>اشترِ ${ar(price)} 💎</button>`}</div>`).join('')}
        <div class="mgCard pet ${p.bellsOn ? 'on' : ''}"><span>🔔</span><b>قلادة الأجراس</b>${p.bells ? `<button class="act ${p.bellsOn ? 'ghost' : 'go'}" data-bells="1">${p.bellsOn ? 'اخلعها' : 'ألبسه'}</button>` : `<button class="act go" data-bbuy="1" ${gm < 8 ? 'disabled' : ''}>اشترِ ٨ 💎</button>`}</div></div>
      <button class="act" id="mgOut">رجوع</button></div>`;
    el.classList.add('on');
    el.querySelectorAll('[data-use]').forEach(b => b.onclick = e => { e.stopPropagation(); s.pet.saddle = b.dataset.use; sfx('pick'); bus.emit('save'); draw(); });
    el.querySelectorAll('[data-buy]').forEach(b => b.onclick = e => { e.stopPropagation(); const sd = SADDLES.find(x => x[0] === b.dataset.buy); if ((s.gems || 0) < sd[3]) return; s.gems -= sd[3]; bus.emit('gems'); s.pet.own[sd[0]] = 1; s.pet.saddle = sd[0]; sfx('win'); bus.emit('save'); draw(`سهيل يلبس ${sd[1]} الآن!`); });
    el.querySelectorAll('[data-bbuy]').forEach(b => b.onclick = e => { e.stopPropagation(); if ((s.gems || 0) < 8) return; s.gems -= 8; bus.emit('gems'); s.pet.bells = 1; s.pet.bellsOn = true; sfx('win'); bus.emit('save'); draw('رنّت الأجراس! 🔔'); });
    el.querySelectorAll('[data-bells]').forEach(b => b.onclick = e => { e.stopPropagation(); s.pet.bellsOn = !s.pet.bellsOn; sfx('pick'); bus.emit('save'); draw(); });
    document.getElementById('mgOut').onclick = e => { e.stopPropagation(); close(); };
  };
  draw();
}
