// المفاجأة والاكتشاف: حدث مختلف كل يوم في ساحة القرية (تاجر متجوّل، قارب صياد يحتاج مساعدة، عرس في القرية)،
// وليل حقيقي (من السابعة مساءً حتى الخامسة فجراً بساعة الجهاز) يظهر فيه «الراوي العجوز» بلغز، وتلمع فيه ثلاثة ممرات سرية.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx, cheer } from '../core/sound.js';
import { ar } from '../core/util.js';
import { addGems, DECOR } from '../world/decor.js';

export const VISITOR = { x: 1190, y: 548 }, TELLER = { x: 1020, y: 556 };
export const SECRETS = [{ id: 's1', x: 1235, y: 110, name: 'ممر خلف المسجد' }, { id: 's2', x: 60, y: 520, name: 'نفق قديم عند سور القرية' }, { id: 's3', x: 1470, y: 420, name: 'باب حجري مخفي' }];
const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const dayNo = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
export const isNight = () => { if (/[?&]night=1/.test(location.search)) return true; if (/[?&]night=0/.test(location.search)) return false; const h = new Date().getHours(); return h >= 19 || h < 5; };
const ev = () => { const s = game.state; s.events = s.events || { done: {}, secrets: {}, nights: {} }; return s.events; };
export const todayEvent = () => ['merchant', 'fisher', 'wedding'][dayNo() % 3];
export const eventDone = () => !!ev().done[dayKey()];
const RARE = ['falcon', 'dhowModel', 'goldDallah'];
const LOOK = {
  merchant: { id: 'visitor', name: 'التاجر المتجوّل', kind: 'man', robe: '#5A3A1E', accent: '#C9971C', skin: '#B97F52', beard: '#3A3A3A', hat: 'cap', vest: '#7B3F98' },
  fisher: { id: 'visitor', name: 'الصياد بدر', kind: 'man', robe: '#DCE6F0', accent: '#1F4E79', skin: '#8B5A38', beard: '#5A5A5A', hat: 'straw' },
  wedding: { id: 'visitor', name: 'العريس هلال', kind: 'man', robe: '#FFFFFF', accent: '#C9971C', skin: '#C98E5F', beard: '#2B2B2B', vest: '#3A2A20' },
  teller: { id: 'teller', name: 'الراوي العجوز', kind: 'man', robe: '#2F2A44', accent: '#E3B04B', skin: '#B97F52', beard: '#EEEEEE', elder: true, tool: 'cane' }
};
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const panel = () => document.getElementById('panel');
const close = () => { const el = panel(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
const opts = (a, n = 3) => { const s = new Set([a]); for (let k = 1; s.size < n + 1; k++) [a + k, a - k, a + 10 * k].forEach(v => v > 0 && s.size < n + 1 && s.add(v)); return shuffle([...s]); };

/* شخصيات الحدث في العالم (للعرضين) */
export function eventPeople() {
  const out = []; if (!game.state) return out;
  if (!eventDone()) out.push(Object.assign({}, LOOK[todayEvent()], VISITOR, { dir: 'down', phase: 0, moving: false, anim: todayEvent() === 'wedding' ? { name: 'celebrate', t: (performance.now() / 900) % 1 } : null }));
  if (isNight()) out.push(Object.assign({}, LOOK.teller, TELLER, { dir: 'down', phase: 0, moving: false, anim: null }));
  return out;
}
export const eventMark = id => (id === 'visitor' && !eventDone()) || (id === 'teller' && !ev().nights[dayKey()]) ? '!' : null;

/* ── قائمة الأسئلة القصيرة (٣ جولات) ثم المكافأة ── */
function quiz(title, intro, make, reward, thanks) {
  const el = panel(); game.busy = true; let i = 0, ok = 0; const N = 3;
  const draw = (msg, kind) => {
    if (i >= N) { ev().done[dayKey()] = Date.now(); addGems(reward.gems); game.state.good += reward.good; bus.emit('good'); bus.emit('save'); cheer('fanfare');
      el.innerHTML = `<div class="sheet mini"><div class="mgEnd"><div class="mgBig">${reward.icon}</div><h3>${thanks}</h3><p class="chGot">+${ar(reward.gems)} 💎 · +${ar(reward.good)} 💚</p><button class="act go" id="evOut">رجوع إلى القرية</button></div></div>`;
      document.getElementById('evOut').onclick = e => { e.stopPropagation(); close(); }; return; }
    const q = make(i); el.innerHTML = `<div class="sheet mini"><div class="mgHead"><b>${title}</b><button class="chExit" id="evX">✕</button></div>${i === 0 ? `<p class="muted">${intro}</p>` : ''}
      <div class="mgQ" style="font-size:20px;line-height:1.7">${q.q}</div><div class="mgMeta">${ar(i + 1)} من ${ar(N)}</div>${msg ? `<div class="mgMsg ${kind}">${msg}</div>` : ''}
      <div class="mgOpts">${opts(q.a).map(v => `<button class="chOpt" data-v="${v}">${ar(v)}</button>`).join('')}</div></div>`; el.classList.add('on');
    document.getElementById('evX').onclick = e => { e.stopPropagation(); close(); };
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); if (+b.dataset.v === q.a) { i++; ok++; sfx('good'); bus.emit('sfx', 'good'); draw('صحيح! 👏', 'good'); } else { sfx('cough'); draw('💡 ' + q.hint, 'bad'); } });
  };
  draw();
}
export function openVisitor() {
  const kind = todayEvent();
  if (kind === 'merchant') return merchant();
  if (kind === 'fisher') return quiz('🎣 قارب الصياد بدر', 'عاد الصياد بدر من البحر بصيد وفير، ويحتاج من يساعده في توزيعه وحسابه.', i => {
    if (i === 0) { const b = R(4, 8), k = R(6, 12); return { q: `اصطاد ${ar(b * k)} سمكة، ويريد توزيعها بالتساوي على ${ar(b)} سلال. كم سمكة في كل سلة؟`, a: k, hint: `اقسم ${ar(b * k)} على ${ar(b)}.` }; }
    if (i === 1) { const p = R(3, 9), n = R(4, 9); return { q: `يبيع السمكة الواحدة بـ ${ar(p)} ريالات. كم يربح من بيع ${ar(n)} سمكات؟`, a: p * n, hint: `اضرب ${ar(p)} × ${ar(n)}.` }; }
    const a = R(40, 90), c = R(12, 35); return { q: `كان في القارب ${ar(a)} سمكة، وأهدى منها ${ar(c)} لجيرانه. كم سمكة بقيت؟`, a: a - c, hint: `اطرح ${ar(c)} من ${ar(a)}.` };
  }, { gems: 6, good: 20, icon: '🎣' }, 'شكراً يا بطل! أهداك الصياد بدر من صيده.');
  return quiz('🎉 عرس في القرية', 'القرية تحتفل بعرس هلال! ساعد أهل العرس في توزيع الحلوى والقهوة على الضيوف.', i => {
    if (i === 0) { const t = R(4, 9), k = R(6, 12); return { q: `${ar(t * k)} قطعة حلوى عُمانية توزَّع بالتساوي على ${ar(t)} صوانٍ. كم قطعة في كل صينية؟`, a: k, hint: `اقسم ${ar(t * k)} على ${ar(t)}.` }; }
    if (i === 1) { const r = R(5, 9), c = R(6, 12); return { q: `في المجلس ${ar(r)} صفوف، في كل صف ${ar(c)} ضيوف. كم ضيفاً في المجلس؟`, a: r * c, hint: `اضرب ${ar(r)} × ${ar(c)}.` }; }
    const f = R(30, 60), s = R(20, 45); return { q: `صُبّ ${ar(f)} فنجان قهوة للرجال و${ar(s)} للنساء. كم فنجاناً صُبّ كله؟`, a: f + s, hint: `اجمع ${ar(f)} + ${ar(s)}.` };
  }, { gems: 6, good: 20, icon: '🎉' }, 'ألف مبروك! شكرك أهل العرس على مساعدتك.');
}
function merchant() {
  const s = game.state, el = panel(); game.busy = true; const id = RARE[dayNo() % RARE.length], d = DECOR.find(x => x.id === id), price = 30;
  const draw = msg => { const own = !!(s.decor || {})[id];
    el.innerHTML = `<div class="sheet mini"><h3>🧳 التاجر المتجوّل</h3><p class="muted">«مرحباً يا ${s.hero.name}! جئت من بلاد بعيدة بقطعة نادرة لا تجدها في متجر القرية، اليوم فقط.»</p>${msg ? `<div class="mgMsg good">${msg}</div>` : ''}
      <div class="mgList"><div class="mgCard on"><span>${d.icon}</span><b>${d.name}</b><small>قطعة نادرة لساحة القرية</small>
      ${own ? '<em>✓ في ساحتك</em>' : `<button class="act go" id="evBuy" ${(s.gems || 0) < price ? 'disabled' : ''}>اشترِ ${ar(price)} 💎</button>`}</div></div>
      <p class="mgMeta">كل يوم حدث مختلف في الساحة: التاجر، أو الصياد، أو عرس. عُد غداً!</p><button class="act" id="evOut">رجوع إلى القرية</button></div>`; el.classList.add('on');
    const b = document.getElementById('evBuy'); if (b) b.onclick = e => { e.stopPropagation(); if ((s.gems || 0) < price) return; s.gems -= price; s.decor = s.decor || {}; s.decor[id] = Date.now(); ev().done[dayKey()] = Date.now(); bus.emit('gems'); bus.emit('save'); cheer('fanfare'); draw(`🎁 «${d.name}» صارت في ساحة القرية!`); };
    document.getElementById('evOut').onclick = e => { e.stopPropagation(); close(); };
  };
  draw();
}
/* ── الراوي العجوز (ليلاً): لغز واحد كل ليلة ── */
const RIDDLES = [['عدد إذا ضربته في نفسه صار ٤٩، فما هو؟', 7, 'فكّر في جدول الضرب: ما العدد الذي مربعه ٤٩؟'], ['أنا عدد زوجي بين ١٠ و٢٠، وأقبل القسمة على ٧. من أنا؟', 14, 'مضاعفات ٧: ٧، ١٤، ٢١…'], ['لديّ ٣ دراهم، ضاعفتها مرتين. كم صار معي؟', 12, 'ضاعِف ٣ فيصير ٦، ثم ضاعِف ٦.'], ['كم ضلعاً للمسدس؟', 6, 'المسدس شكل له ستة أضلاع.'], ['عدد أولي بين ٢٠ و٢٥. ما هو؟', 23, 'العدد الأولي لا يقبل القسمة إلا على ١ وعلى نفسه.'], ['كم دقيقة في ساعة ونصف؟', 90, 'الساعة ٦٠ دقيقة، ونصفها ٣٠.']];
export function openTeller() {
  const s = game.state, el = panel(); game.busy = true; const [q, a, hint] = RIDDLES[dayNo() % RIDDLES.length], done = ev().nights[dayKey()];
  const draw = (msg, kind) => {
    el.innerHTML = `<div class="sheet mini"><h3>🌙 الراوي العجوز</h3><p class="muted">«لا أظهر إلا في الليل يا ${s.hero.name}… وعندي لك لغز. ${done ? 'وقد حللتَ لغز الليلة، تعال غداً!' : 'إن حللتَه نلتَ جائزتي، وأخبرتك بسرّ.'}»</p>
      ${done ? '' : `<div class="mgQ" style="font-size:20px;line-height:1.7">${q}</div>${msg ? `<div class="mgMsg ${kind}">${msg}</div>` : ''}<div class="mgOpts">${opts(a).map(v => `<button class="chOpt" data-v="${v}">${ar(v)}</button>`).join('')}</div>`}
      <button class="act" id="evOut">رجوع</button></div>`; el.classList.add('on');
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); if (+b.dataset.v !== a) { sfx('cough'); return draw('💡 ' + hint, 'bad'); }
      ev().nights[dayKey()] = Date.now(); addGems(5); bus.emit('save'); cheer('fanfare');
      const left = SECRETS.filter(x => !ev().secrets[x.id]); el.innerHTML = `<div class="sheet mini"><div class="mgEnd"><div class="mgBig">🌙</div><h3>أحسنت يا ذكي!</h3><p class="chGot">+٥ 💎</p><p>${left.length ? `«سأخبرك بسرّ: في الليل يلمع <b>${left[0].name}</b>. ابحث عنه!»` : '«لقد وجدتَ كل أسرار القرية. أنت مكتشف حقيقي!»'}</p><button class="act go" id="evOut">رجوع</button></div></div>`;
      document.getElementById('evOut').onclick = ev2 => { ev2.stopPropagation(); close(); }; });
    document.getElementById('evOut').onclick = e => { e.stopPropagation(); close(); };
  };
  draw();
}
/* ── الممرات السرية: تلمع ليلاً فقط، ويُكتشف الممر بالوقوف عليه ── */
export function checkSecrets(pl, toast) {
  if (!isNight() || !game.state) return; const E = ev();
  SECRETS.forEach(x => { if (E.secrets[x.id] || Math.hypot(pl.x - x.x, pl.y - x.y) > 34) return;
    E.secrets[x.id] = Date.now(); addGems(8); sfx('win'); cheer('sparkle'); bus.emit('save');
    const n = Object.keys(E.secrets).length; toast(`🗝️ اكتشفتَ «${x.name}»! +٨ 💎 (${ar(n)} من ${ar(SECRETS.length)} أسرار)`); });
}
export function secretItems(view) {
  if (!isNight() || !game.state) return []; const t = performance.now() / 1000;
  return SECRETS.filter(x => !ev().secrets[x.id] && (!view || (x.x > view.x - 60 && x.x < view.x + view.w + 60 && x.y > view.y - 60 && x.y < view.y + view.h + 60))).map(x => ({ y: x.y - 1, x: x.x, draw: c => {
    const k = .5 + Math.sin(t * 3 + x.x) * .5; c.fillStyle = `rgba(160,220,255,${.25 + k * .35})`; c.beginPath(); c.ellipse(x.x, x.y, 22, 9, 0, 0, 7); c.fill();
    c.fillStyle = `rgba(255,255,255,${.5 + k * .5})`; for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.6; c.beginPath(); c.arc(x.x + Math.cos(a) * 14, x.y - 8 - Math.abs(Math.sin(a)) * 16, 1.8, 0, 7); c.fill(); } } }));
}
