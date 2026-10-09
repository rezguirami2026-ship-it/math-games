// «ألبوم الذكريات»: بطاقة مرسومة لكل لحظة مهمة (أول درس، دخول كل منطقة، إكمال كل وحدة ومغامرة، الاحتفال الكبير)،
// تُستخرج من الحفظ نفسه بتواريخها، ويُرسم فيها البطل بما يرتديه. و«الألقاب»: لقب يختاره الطالب يظهر فوق بطله في العالم.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';
import { LESSONS, UNITS } from '../content/lessons.js';
import { levelOf } from '../core/levels.js';
import { drawHuman } from '../character/human.js';
import { heroLookWorn } from './wardrobe.js';

const AREAS = { market: ['🛒', 'السوق الأسبوعي', '#EFCB97'], harbor: ['⚓', 'الميناء', '#9FD3EC'], fort: ['🏰', 'القلعة', '#DCC39A'], festival: ['🎪', 'ساحة المهرجان', '#EBCFC0'], datayard: ['📊', 'بستان البيانات', '#CFE3B0'], coop: ['🏪', 'سوق الجمعية', '#D9DDB4'], caravan: ['🐪', 'طريق القافلة', '#EBCB93'], workshop: ['🛠️', 'ورشة البنّاء', '#D8C7AE'] };
const ADV = { rescue: '🏘️ إنقاذ القرية', storm: '🌪️ العاصفة الكبرى', island: '🏝️ الجزيرة المفقودة', oldcity: '🏛️ سر المدينة القديمة', lanterns: '🏮 فوانيس المهرجان', lighthouse: '🗼 الفنار والضباب', desert: '🏜️ مهمة في الصحراء', mountain: '⛰️ قمة جبل شمس', castle: '🏰 القلعة المظلمة' };
const date = t => { if (!t || t === 1) return ''; const d = new Date(t); return `${ar(d.getDate())} / ${ar(d.getMonth() + 1)} / ${ar(d.getFullYear())}`; };
/* الذكريات من الحفظ: [الرمز، العنوان، السطر، اللون، الوقت] */
export function memories(s = game.state) {
  const M = [], done = (s.quests && s.quests.done) || {};
  M.push(['🌱', 'بداية الرحلة', `وصل ${s.hero.name} إلى قرية الخير`, '#E9D6A2', (s.story && s.story.startedAt) || Math.min(...Object.values(done).filter(Number.isFinite), Date.now())]);
  const first = LESSONS.find(l => done[l.id]); if (first) M.push(['📘', 'أول درس', `أنجز «${first.title}»`, '#BFE3F2', done[first.id]]);
  UNITS.forEach((u, i) => { const ls = LESSONS.filter(l => l.u === i); if (ls.length && ls.every(l => done[l.id])) M.push(['🏅', `أكمل وحدة «${u.title}»`, `الفصل ${u.term === 1 ? 'الأول' : 'الثاني'} · ${u.place}`, '#FFE7A0', Math.max(...ls.map(l => done[l.id]))]); });
  Object.entries((s.world && s.world.visited) || {}).forEach(([id, t]) => { const a = AREAS[id]; if (a) M.push([a[0], `دخل ${a[1]}`, 'منطقة جديدة في العالم', a[2], t]); });
  Object.entries(s.adventures || {}).forEach(([id, r]) => { if (r && r.done && ADV[id]) M.push([ADV[id].split(' ')[0], `أكمل مغامرة «${ADV[id].replace(/^\S+ /, '')}»`, `⭐ ${ar(r.best || 0)} من ٥ نجوم مخفية`, '#D9CCF2', r.at]); });
  if (s.grandSeen) M.push(['👑', 'بطل قرية الخير الأكبر', 'أكمل المغامرات التسع كلها', '#FFD54A', s.grandSeen]);
  if (done.polyhedra) M.push(['🎓', 'أتمّ الدروس التسعة والستين', 'منهج الصف السادس كاملاً', '#C7E8C9', done.polyhedra]);
  return M.sort((a, b) => (a[4] || 9e15) - (b[4] || 9e15));   // ما لا تاريخ له في الآخر
}

/* الألقاب: [معرّف، اللقب، طريقة الفتح، شرط] */
const cnt = (s, ids) => ids.filter(id => s.quests && s.quests.done[id]).length;
export const TITLES = [
  ['explorer', 'المستكشف الصغير', 'متاح من البداية', () => true],
  ['numbers', 'سيد الأعداد', 'أكمل وحدتي الأعداد في الفصل الأول', s => unitDone(s, 0) && unitDone(s, 3)],
  ['fractions', 'سيد الكسور', 'أكمل دروس الكسور والنسب', s => cnt(s, ['fractions', 'mixedNumbers', 'decimalFractions', 'percentages']) === 4],
  ['engineer', 'مهندس القرية', 'أكمل وحدتي الهندسة', s => unitDone(s, 2) && unitDone(s, 8)],
  ['treasure', 'صيّاد الكنوز', 'افتح ٨ كنوز مخفية', s => Object.keys(s.treasure || {}).length >= 8],
  ['adventurer', 'بطل المغامرات', 'أكمل ٥ مغامرات', s => Object.values(s.adventures || {}).filter(r => r && r.done).length >= 5],
  ['kind', 'صديق الخير', 'تبرّع من صندوق الخير ٣ مرات', s => ((s.charity || {}).n || 0) >= 3],
  ['racer', 'فارس السباق', 'افز في سباق الجمال ٣ مرات', s => (((s.mini || {}).wins || {}).race || 0) >= 3],
  ['secrets', 'حارس الأسرار', 'اكتشف الممرات السرية الثلاثة', s => Object.keys((s.events || {}).secrets || {}).length >= 3],
  ['sage', 'حكيم القرية', 'صل إلى المستوى العاشر', s => levelOf(s).n >= 10],
  ['legend', 'أسطورة قرية الخير', 'أكمل المغامرات التسع', s => !!s.grandSeen]
];
function unitDone(s, u) { const ls = LESSONS.filter(l => l.u === u); return ls.length > 0 && ls.every(l => s.quests && s.quests.done[l.id]); }
export const heroTitle = (s = game.state) => { if (!s || !s.title) return null; const t = TITLES.find(x => x[0] === s.title); return t && t[3](s) ? t[1] : null; };

function card(c, m, s, W, H) {
  const [icon, title, line, col, t] = m;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, col); g.addColorStop(1, '#FFFDF6'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc((i * 71) % W, 20 + (i * 37) % 60, 14 + i * 3, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(90,60,20,.18)'; c.beginPath(); c.ellipse(W * .3, H * .78, 40, 9, 0, 0, 7); c.fill();
  try { drawHuman(c, Object.assign(heroLookWorn(s), { x: W * .3, y: H * .78, s: 1.9, dir: 'down', anim: 'celebrate', animT: .25 })); } catch (e) {}
  c.font = '52px sans-serif'; c.textAlign = 'center'; c.fillText(icon, W * .72, H * .48);
  c.strokeStyle = '#fff'; c.lineWidth = 8; c.strokeRect(4, 4, W - 8, H - 8); c.strokeStyle = '#E3B04B'; c.lineWidth = 2; c.strokeRect(9, 9, W - 18, H - 18);
}
export function openAlbum() {
  const s = game.state, el = document.getElementById('panel'); game.busy = true; sfx('talk');
  const draw = msg => {
    const M = memories(s), cur = heroTitle(s);
    el.innerHTML = `<div class="sheet album"><h3>📸 ألبوم ذكريات ${s.hero.name}</h3><p class="muted">كل لحظة مهمة في رحلتك تُحفظ هنا بتاريخها: ${ar(M.length)} ذكرى حتى الآن.</p>
      <div class="alGrid">${M.map((m, i) => `<figure class="alCard" style="--r:${(i % 2 ? 1.6 : -1.4)}deg"><canvas width="300" height="200" data-i="${i}"></canvas><figcaption><b>${m[1]}</b><small>${m[2]}</small>${date(m[4]) ? `<em>${date(m[4])}</em>` : ''}</figcaption></figure>`).join('')}</div>
      <h3 style="margin-top:14px">🎖️ ألقابي</h3><p class="muted">اختر لقباً يظهر فوق بطلك في القرية.${cur ? ` لقبك الآن: <b>«${cur}»</b>` : ''}</p>${msg ? `<div class="mgMsg good">${msg}</div>` : ''}
      <div class="alTitles">${TITLES.map(([id, name, how, ok]) => { const open = ok(s), on = s.title === id && open; return `<button class="alT ${open ? '' : 'lock'} ${on ? 'on' : ''}" data-t="${id}" ${open ? '' : 'disabled'}><b>${open ? '🎖️' : '🔒'} ${name}</b><small>${on ? '✓ لقبك الآن' : open ? 'اضغط لاختياره' : how}</small></button>`; }).join('')}
        <button class="alT ${!cur ? 'on' : ''}" data-t=""><b>بلا لقب</b><small>${!cur ? '✓ الآن' : 'إخفاء اللقب'}</small></button></div>
      <button class="act" id="alOut">رجوع إلى القرية</button></div>`;
    el.classList.add('on');
    el.querySelectorAll('canvas[data-i]').forEach(cv => card(cv.getContext('2d'), M[+cv.dataset.i], s, cv.width, cv.height));
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = e => { e.stopPropagation(); s.title = b.dataset.t || null; sfx('pick'); bus.emit('save'); draw(b.dataset.t ? `صار لقبك «${TITLES.find(x => x[0] === b.dataset.t)[1]}»!` : 'أخفيتَ اللقب.'); });
    document.getElementById('alOut').onclick = e => { e.stopPropagation(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
  };
  draw();
}
/* شريط اللقب فوق البطل: (x, y) نقطة فوق الرأس على الشاشة أو في العالم */
export function drawTitle(c, x, y, title) {
  c.save(); c.font = '900 12px Cairo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl';
  const w = c.measureText(title).width + 22; c.fillStyle = 'rgba(58,36,0,.25)'; c.beginPath(); c.roundRect(x - w / 2 + 1, y - 9, w, 19, 10); c.fill();
  const g = c.createLinearGradient(0, y - 10, 0, y + 10); g.addColorStop(0, '#FFF1B8'); g.addColorStop(1, '#E3A21A'); c.fillStyle = g; c.beginPath(); c.roundRect(x - w / 2, y - 10, w, 19, 10); c.fill();
  c.strokeStyle = '#8A5A00'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#3A2400'; c.fillText('🎖️ ' + title, x, y); c.restore();
}
