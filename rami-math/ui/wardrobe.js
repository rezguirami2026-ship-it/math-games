// خزانة البطل: مكان يرى فيه اللاعب شخصيته (مجسّمة في العرض ثلاثي الأبعاد) ويجرّب ما فتحه بإنجازاته.
// لكل قطعة «خانة» (slot): ارتداء قطعة يخلع ما يشاركها الخانة (وشاحان لا يُلبسان معاً). قطع الوحدات تُفتح بإكمال الوحدة.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { drawHuman } from '../character/human.js';
import { heroLook } from './screens.js';
import { unlock } from '../achievements/achievements.js';
import { sfx } from '../core/sound.js';
import { finaleOpen } from '../missions/activity.js';
import { UNITS } from '../content/lessons.js';
import { gfx } from './hud.js';

/* أيقونات مرسومة (SVG) بدل الرموز التعبيرية: قطعة واحدة بخطوط ناعمة وتدرّج على بلاطة ملوّنة */
const svg = (inner, bg) => `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="gb${bg[0].slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect x="1" y="1" width="46" height="46" rx="13" fill="url(#gb${bg[0].slice(1)})"/><rect x="1" y="1" width="46" height="23" rx="13" fill="#fff" opacity=".18"/>${inner}</svg>`;
const ICON = {
  bag: svg('<path d="M15 19a9 9 0 0 1 18 0v15a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4z" fill="#F2A33A" stroke="#7A4A12" stroke-width="2"/><path d="M19 19v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#7A4A12" stroke-width="2.4"/><rect x="18" y="25" width="12" height="7" rx="2" fill="#FFD27A" stroke="#7A4A12" stroke-width="1.6"/>', ['#FFB25C', '#E0712B']),
  flask: svg('<path d="M20 10h8v6l5 6v13a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V22l5-6z" fill="#7FD3F5" stroke="#16627E" stroke-width="2"/><path d="M16 27h16v8a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="#2E9BCB"/><rect x="19" y="8" width="10" height="4" rx="1.5" fill="#8A5A2B"/>', ['#8EE0FF', '#2F86C9']),
  shovel: svg('<path d="M30 9l9 9-12 12-9-9z" fill="#B7C2CC" stroke="#3E4A55" stroke-width="2"/><path d="M22 26l-11 11" stroke="#8A5A2B" stroke-width="4.5" stroke-linecap="round"/><circle cx="10" cy="38" r="3" fill="#6B4520"/>', ['#C9E6A0', '#6FA23C']),
  gold: svg('<path d="M24 8l4.5 9 10 1.5-7.2 7 1.7 10L24 30.8 15 35.5l1.7-10-7.2-7 10-1.5z" fill="#FFD54A" stroke="#9A6A10" stroke-width="2" stroke-linejoin="round"/><path d="M14 40h20" stroke="#FFE88A" stroke-width="3" stroke-dasharray="3 3" stroke-linecap="round"/>', ['#6B4FD0', '#3A2A8A']),
  silver: svg('<path d="M24 8l4.5 9 10 1.5-7.2 7 1.7 10L24 30.8 15 35.5l1.7-10-7.2-7 10-1.5z" fill="#E6EDF3" stroke="#5E6B78" stroke-width="2" stroke-linejoin="round"/><path d="M14 40h20" stroke="#fff" stroke-width="3" stroke-dasharray="3 3" stroke-linecap="round"/>', ['#3A6E9E', '#1F3F60']),
  cape: svg('<path d="M16 11h16l5 27c-4 3-22 3-26 0z" fill="#C0263E" stroke="#5E0F1C" stroke-width="2"/><path d="M11 38c4 3 22 3 26 0" fill="none" stroke="#FFD54A" stroke-width="3"/><circle cx="24" cy="13" r="3" fill="#FFD54A" stroke="#9A6A10" stroke-width="1.4"/>', ['#FF8A8A', '#B0243C']),
  bisht: svg('<path d="M16 11h16l5 27c-4 3-22 3-26 0z" fill="#5A3A1E" stroke="#2A1A0C" stroke-width="2"/><path d="M19 11l-4 27M29 11l4 27" stroke="#FFD54A" stroke-width="2.4"/><path d="M11 38c4 3 22 3 26 0" fill="none" stroke="#FFD54A" stroke-width="3"/>', ['#D9A86A', '#7A5230']),
  festcape: svg('<path d="M16 11h16l5 27c-4 3-22 3-26 0z" fill="#2E8B57" stroke="#14462A" stroke-width="2"/><path d="M11 38c4 3 22 3 26 0" fill="none" stroke="#FFD54A" stroke-width="3"/><circle cx="20" cy="24" r="2" fill="#FFE88A"/><circle cx="28" cy="29" r="2" fill="#FFE88A"/><circle cx="24" cy="19" r="1.6" fill="#FFE88A"/>', ['#8EE6B0', '#2E8B57']),
  medal: svg('<path d="M17 7l7 13 7-13" fill="none" stroke="#C0392B" stroke-width="5" stroke-linejoin="round"/><circle cx="24" cy="29" r="11" fill="#FFD54A" stroke="#9A6A10" stroke-width="2.2"/><path d="M24 22.5l2 4.2 4.6.6-3.3 3.2.8 4.5-4.1-2.2-4.1 2.2.8-4.5-3.3-3.2 4.6-.6z" fill="#FFF4C4"/>', ['#FFE7A0', '#E3A21A']),
  glasses: svg('<circle cx="15.5" cy="25" r="7" fill="#BFE8FF" stroke="#1E2A36" stroke-width="2.6"/><circle cx="32.5" cy="25" r="7" fill="#BFE8FF" stroke="#1E2A36" stroke-width="2.6"/><path d="M22.5 24h3M8.5 23L5 20M39.5 23l3.5-3" stroke="#1E2A36" stroke-width="2.4" stroke-linecap="round"/><path d="M12 22l3-2.5M29 22l3-2.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>', ['#9FD8F0', '#3C8DB8']),
  cane: svg('<path d="M27 40V17a7 7 0 0 0-14 0" fill="none" stroke="#7A4A2A" stroke-width="4.5" stroke-linecap="round"/><path d="M27 40V17a7 7 0 0 0-14 0" fill="none" stroke="#B5763F" stroke-width="1.6" stroke-linecap="round"/><rect x="24.5" y="27" width="5" height="3" rx="1" fill="#FFD54A"/>', ['#E8C9A0', '#9C6B3C']),
  vest: svg('<path d="M17 10l-6 6v22h11V18zM31 10l6 6v22H26V18z" fill="#1F4E79" stroke="#0E2840" stroke-width="2"/><path d="M11 27h11M26 27h11" stroke="#DDE6EE" stroke-width="2.4"/><circle cx="29" cy="22" r="1.4" fill="#FFD54A"/><circle cx="29" cy="31" r="1.4" fill="#FFD54A"/>', ['#9CC6EA', '#2F6FB2']),
  sandvest: svg('<path d="M17 10l-6 6v22h11V18zM31 10l6 6v22H26V18z" fill="#C9955A" stroke="#6E4520" stroke-width="2"/><path d="M11 22h11M26 22h11M11 31h11M26 31h11" stroke="#7A3F98" stroke-width="2"/>', ['#F3D79C', '#C99248']),
  postbag: svg('<path d="M10 9l26 22" stroke="#6B4520" stroke-width="3"/><rect x="20" y="24" width="20" height="15" rx="3" fill="#A8692E" stroke="#5A3410" stroke-width="2"/><path d="M20 28h20l-3 6H23z" fill="#8B5A2B" stroke="#5A3410" stroke-width="1.6"/><rect x="28" y="31" width="4" height="3" rx="1" fill="#FFD54A"/>', ['#F0C99A', '#B37A40']),
  crown: svg('<path d="M10 33l2-17 7 8 5-12 5 12 7-8 2 17z" fill="#FFD54A" stroke="#9A6A10" stroke-width="2.2" stroke-linejoin="round"/><rect x="10" y="33" width="28" height="6" rx="2" fill="#E3A21A" stroke="#9A6A10" stroke-width="2"/><circle cx="24" cy="36" r="2" fill="#E2475C"/><circle cx="17" cy="36" r="1.6" fill="#2F9BD6"/><circle cx="31" cy="36" r="1.6" fill="#2E8B57"/>', ['#B48CFF', '#5B3CB8'])
};

/* slot: الخانة؛ unit: فهرس الوحدة التي تفتحها (UNITS)، وإلا how يشرح طريقة الفتح */
export const GEAR = [
  { id: 'bag', name: 'حقيبة المغامر', slot: 'bag', how: 'تُفتح بإطلاق قافلة المزرعة' },
  { id: 'flask', name: 'قربة الماء', slot: 'flask', how: 'تُفتح بملء خزانات البيوت' },
  { id: 'shovel', name: 'مجرفة المزارع', slot: 'back', how: 'تُفتح بإتمام مشتريات الدكان' },
  { id: 'gold', name: 'التطريز الذهبي', slot: 'accent', how: 'يُفتح بزراعة ثلاث نخلات' },
  { id: 'glasses', name: 'نظارة المستكشف', slot: 'glasses', unit: 0 },
  { id: 'cane', name: 'عصا الرحّالة', slot: 'tool', unit: 1 },
  { id: 'vest', name: 'سترة البحّار', slot: 'vest', unit: 2 },
  { id: 'postbag', name: 'حقيبة المراسل', slot: 'postbag', unit: 3 },
  { id: 'bisht', name: 'البشت المذهّب', slot: 'cape', unit: 4 },
  { id: 'festcape', name: 'وشاح المهرجان', slot: 'cape', unit: 5 },
  { id: 'silver', name: 'التطريز الفضي', slot: 'accent', unit: 6 },
  { id: 'sandvest', name: 'سترة القافلة', slot: 'vest', unit: 7 },
  { id: 'crown', name: 'تاج قرية الخير', slot: 'crown', unit: 8 },
  { id: 'cape', name: 'وشاح حامي القرية', slot: 'cape', how: 'يُفتح بإكمال مغامرة «إنقاذ القرية»' },
  { id: 'medal', name: 'وسام البطل الأكبر الذهبي', slot: 'medal', how: 'يُفتح بإكمال المغامرات التسع' }
].map(g => Object.assign(g, { icon: ICON[g.id] }));
GEAR.forEach(g => { if (g.unit != null) g.how = `تُفتح بإكمال وحدة «${UNITS[g.unit].title}» (الفصل ${UNITS[g.unit].term === 1 ? 'الأول' : 'الثاني'})`; });

export const GOLD = '#C9971C', SILVER = '#B8C4CE';
/* قطع الوحدات تُملك تلقائياً حين تكتمل وحدتها (يُحفظ وقت الفتح أول مرة)؛ تُرجع القطع الجديدة */
export function syncUnitGear(s = game.state) {
  if (!s) return []; s.gear = s.gear || { owned: {}, worn: {} }; const fresh = [];
  GEAR.forEach(g => { if (g.unit != null && !s.gear.owned[g.id] && finaleOpen(g.unit)) { s.gear.owned[g.id] = Date.now(); fresh.push(g); } });
  return fresh;
}
export function heroLookWorn(s) {
  const L = heroLook(s.hero), w = s.gear.worn;
  const capeCol = w.cape ? '#B0243C' : w.bisht ? '#5A3A1E' : w.festcape ? '#2E8B57' : false;
  L.gear = { bag: !!w.bag, flask: !!w.flask, shovel: !!w.shovel, cape: capeCol, medal: !!w.medal, crown: !!w.crown };
  if (w.gold) L.accent = GOLD; else if (w.silver) L.accent = SILVER;
  if (w.glasses) L.glasses = true;
  if (w.cane) L.tool = 'cane';
  if (w.vest) L.vest = '#1F4E79'; else if (w.sandvest) L.vest = '#C9955A';
  if (w.postbag) L.postbag = true;
  return L;
}
let anim = 0, prev3 = null;
const stop3 = () => { if (prev3) { prev3.dispose(); prev3 = null; } };
export function openWardrobe() {
  const s = game.state, el = document.getElementById('panel');
  game.busy = true; sfx('talk'); syncUnitGear(s);
  const use3d = gfx.d3();
  const draw = () => {
    const n = GEAR.filter(g => s.gear.owned[g.id]).length;
    el.innerHTML = `<div class="sheet wardrobe"><h3>🚪 خزانة البطل</h3>
      <div class="wardStage"><canvas id="wardPrev" width="260" height="240"></canvas><span class="wardCount">${n} / ${GEAR.length}</span></div>
      <div class="gear">${GEAR.map(g => { const own = !!s.gear.owned[g.id], on = !!s.gear.worn[g.id];
        return `<div class="gitem ${own ? '' : 'locked'} ${on ? 'on' : ''}"><span class="gic">${g.icon}${own ? '' : '<i class="glock">🔒</i>'}</span><div><b>${g.name}</b><small>${own ? (on ? '✓ يرتديه البطل الآن' : 'جاهز للارتداء') : g.how}</small></div>
          ${own ? `<button class="act ${on ? 'ghost' : ''}" data-g="${g.id}">${on ? 'اخلع' : 'ارتدِ'}</button>` : ''}</div>`; }).join('')}</div>
      <button class="act" id="wardOut">اخرج إلى القرية</button></div>`;
    el.classList.add('on');
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = e => { e.stopPropagation(); const id = b.dataset.g, g = GEAR.find(x => x.id === id);
      const on = !s.gear.worn[id]; if (on) GEAR.forEach(o => { if (o.slot === g.slot) s.gear.worn[o.id] = false; }); s.gear.worn[id] = on;
      sfx('pick'); if (on) unlock('stylish'); bus.emit('save'); draw(); });
    document.getElementById('wardOut').onclick = e => { e.stopPropagation(); cancelAnimationFrame(anim); stop3(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
    const c = document.getElementById('wardPrev');
    cancelAnimationFrame(anim); stop3();
    if (use3d && window.WebGLRenderingContext) {   // المجسّم نفسه الذي يمشي في العالم
      import('../renderer3d/preview.js').then(m => { if (c.isConnected) prev3 = m.previewHero(c, () => heroLookWorn(s), { full: true, spin: true }); }).catch(() => draw2d(c));
    } else draw2d(c);
  };
  const draw2d = c => {
    const x = c.getContext('2d'), dirs = ['down', 'left', 'up', 'right'];
    const loop = now => {
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
      x.fillStyle = '#F3E4C0'; x.beginPath(); x.ellipse(130, 222, 74, 14, 0, 0, 7); x.fill();
      drawHuman(x, Object.assign(heroLookWorn(s), { x: 130, y: 222, s: 2.5, dir: dirs[Math.floor(now / 1300) % 4], moving: false }));
      anim = requestAnimationFrame(loop);
    };
    anim = requestAnimationFrame(loop);
  };
  draw();
}
