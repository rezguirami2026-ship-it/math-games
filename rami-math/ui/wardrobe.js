// خزانة البطل: مكان داخل العالم يرى فيه اللاعب شخصيته ويجرّب ما فتحه بإنجازاته
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { drawHuman } from '../character/human.js';
import { heroLook } from './screens.js';
import { unlock } from '../achievements/achievements.js';
import { sfx } from '../core/sound.js';
export const GEAR = [
  { id: 'bag', icon: '🎒', name: 'حقيبة المغامر', how: 'تُفتح بإطلاق قافلة المزرعة' },
  { id: 'flask', icon: '💧', name: 'قربة الماء', how: 'تُفتح بملء خزانات البيوت' },
  { id: 'shovel', icon: '⛏️', name: 'مجرفة المزارع', how: 'تُفتح بإتمام مشتريات الدكان' },
  { id: 'gold', icon: '⭐', name: 'التطريز الذهبي', how: 'يُفتح بزراعة ثلاث نخلات' },
  { id: 'cape', icon: '🦸', name: 'وشاح حامي القرية', how: 'يُفتح بإكمال مغامرة «إنقاذ القرية»' },
  { id: 'medal', icon: '🏅', name: 'وسام البطل الأكبر الذهبي', how: 'يُفتح بإكمال المغامرات التسع' }
];
export const GOLD = '#C9971C';
export function heroLookWorn(s) {
  const L = heroLook(s.hero), w = s.gear.worn;
  L.gear = { bag: !!w.bag, flask: !!w.flask, shovel: !!w.shovel, cape: w.cape ? '#B0243C' : false, medal: !!w.medal };
  if (w.gold) L.accent = GOLD;
  return L;
}
let anim = 0;
export function openWardrobe() {
  const s = game.state, el = document.getElementById('panel');
  game.busy = true; sfx('talk');
  const draw = () => {
    el.innerHTML = `<div class="sheet wardrobe"><h3>🚪 خزانة البطل</h3>
      <canvas id="wardPrev" width="220" height="200"></canvas>
      <div class="gear">${GEAR.map(g => { const own = !!s.gear.owned[g.id], on = !!s.gear.worn[g.id];
        return `<div class="gitem ${own ? '' : 'locked'}"><span>${own ? g.icon : '🔒'}</span><div><b>${g.name}</b><small>${own ? (on ? 'يرتديه البطل الآن' : 'جاهز للارتداء') : g.how}</small></div>
          ${own ? `<button class="act ${on ? 'ghost' : ''}" data-g="${g.id}">${on ? 'اخلع' : 'ارتدِ'}</button>` : ''}</div>`; }).join('')}</div>
      <button class="act" id="wardOut">اخرج إلى القرية</button></div>`;
    el.classList.add('on');
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = e => { e.stopPropagation(); const id = b.dataset.g; s.gear.worn[id] = !s.gear.worn[id]; sfx('pick'); if (s.gear.worn[id]) unlock('stylish'); bus.emit('save'); draw(); });
    document.getElementById('wardOut').onclick = e => { e.stopPropagation(); cancelAnimationFrame(anim); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
    const c = document.getElementById('wardPrev'), x = c.getContext('2d'), dirs = ['down', 'left', 'up', 'right'];
    cancelAnimationFrame(anim);
    const loop = now => {
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
      x.fillStyle = '#F3E4C0'; x.beginPath(); x.ellipse(110, 182, 70, 14, 0, 0, 7); x.fill();
      drawHuman(x, Object.assign(heroLookWorn(s), { x: 110, y: 182, s: 2.3, dir: dirs[Math.floor(now / 1300) % 4], moving: false }));
      anim = requestAnimationFrame(loop);
    };
    anim = requestAnimationFrame(loop);
  };
  draw();
}
