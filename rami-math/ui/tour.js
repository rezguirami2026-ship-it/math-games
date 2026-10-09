// دليل البداية: جولة قصيرة تفاعلية بعد مقدمة القصة (مرة واحدة)، وتُعاد من الحقيبة. ضوء يحيط بالعنصر، وفقاعة شرح، والتالي/تخطَّ.
// اللعبة متوقفة أثناء الجولة (game.busy)، ولا شيء فيها إجباري.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';

const STEPS = name => [
  { icon: '👋', title: `أهلاً يا ${name}!`, text: 'جولة قصيرة لتتعرّف على قريتك… نصف دقيقة فقط.' },
  { sel: 'hero', icon: '👆', title: 'المشي', text: 'اضغط على أي مكان في الأرض فيمشي بطلك إليه. واضغط على الشخصيات لتتحدث معها.' },
  { sel: '#objective', icon: '🎯', title: 'مهمتك', text: 'هنا مهمتك الحالية دائماً، والسهم الذهبي في العالم يدلّك على مكانها.' },
  { sel: '#bBag', icon: '🎒', title: 'الحقيبة', text: 'فيها المغامرات 🗺️ ومتجر الزينة والصوت ورمز حفظ التقدّم.' },
  { sel: '#bMap', icon: '🗺️', title: 'الخريطة', text: 'خريطة العالم ورحلة الدروس، ومنها تفتح الأنشطة ومهمة اليوم.' },
  { sel: '#bAch', icon: '🏆', title: 'الإنجازات', text: 'الأوسمة التي تجمعها في رحلتك. حاول أن تجمعها كلها!' },
  { sel: '#gemPill', icon: '💎', title: 'الجواهر', text: 'تربح جوهرة مع كل إجابة صحيحة، وتزيّن بها ساحة القرية.' },
  { icon: '🌟', title: 'انطلق يا بطل!', text: 'قرية الخير تنتظرك. أول مهمة على بُعد خطوات… بالتوفيق!' }
];

export function startTour(force) {
  const s = game.state; if (!s || document.querySelector('.tour')) return Promise.resolve();
  if (navigator.webdriver && !force && !/[?&]tour=1/.test(location.search)) return Promise.resolve();   // الاختبارات الآلية تتخطاها
  return new Promise(done => {
    const steps = STEPS(s.hero.name), wasBusy = game.busy; game.busy = true;
    const el = document.createElement('div'); el.className = 'tour';
    el.innerHTML = `<div class="tourHole"></div><div class="tourTip"><div class="tourIcon"></div><b></b><p></p><div class="tourDots">${steps.map(() => '<i></i>').join('')}</div>
      <div class="tourBtns"><button class="act go" data-next></button><button class="act ghost" data-skip>تخطَّ الجولة</button></div></div>`;
    document.body.appendChild(el);
    const hole = el.querySelector('.tourHole'), tip = el.querySelector('.tourTip');
    let i = 0;
    const end = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); s.tourDone = Date.now(); bus.emit('save'); game.busy = wasBusy; window.removeEventListener('resize', show); done(); };
    function rectOf(sel) {
      if (sel === 'hero') { const w = innerWidth, h = innerHeight, r = Math.min(w, h) * .16; return { left: w / 2 - r, top: h / 2 - r * 1.3, width: r * 2, height: r * 2.2, round: true }; }
      const t = document.querySelector(sel); if (!t || !t.offsetParent) return null; const b = t.getBoundingClientRect(); const p = 8;
      return { left: b.left - p, top: b.top - p, width: b.width + p * 2, height: b.height + p * 2, round: b.width < 70 };
    }
    function show() {
      const st = steps[i], r = st.sel ? rectOf(st.sel) : null;
      tip.querySelector('.tourIcon').textContent = st.icon; tip.querySelector('b').textContent = st.title; tip.querySelector('p').textContent = st.text;
      tip.querySelector('[data-next]').textContent = i === steps.length - 1 ? '⭐ هيا نبدأ!' : `التالي (${ar(i + 1)} من ${ar(steps.length)}) ‹`;
      tip.querySelector('[data-skip]').hidden = i === steps.length - 1;
      tip.querySelectorAll('.tourDots i').forEach((d, k) => d.classList.toggle('on', k === i));
      el.classList.toggle('center', !r);
      if (r) {
        Object.assign(hole.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: r.round ? '50%' : '18px' });
        // الفقاعة تحت العنصر إن كان في النصف العلوي، وفوقه إن كان في النصف السفلي
        const below = r.top + r.height / 2 < innerHeight / 2, tw = Math.min(340, innerWidth - 24);
        tip.style.width = tw + 'px'; tip.style.left = Math.max(12, Math.min(innerWidth - tw - 12, r.left + r.width / 2 - tw / 2)) + 'px';
        tip.style.top = below ? (r.top + r.height + 14) + 'px' : ''; tip.style.bottom = below ? '' : (innerHeight - r.top + 14) + 'px';
      } else { tip.style.left = tip.style.top = tip.style.bottom = tip.style.width = ''; }
      tip.classList.remove('pop'); void tip.offsetWidth; tip.classList.add('pop');
    }
    tip.querySelector('[data-next]').onclick = e => { e.stopPropagation(); sfx('click'); if (++i >= steps.length) { sfx('win'); return end(); } show(); };
    tip.querySelector('[data-skip]').onclick = e => { e.stopPropagation(); sfx('click'); end(); };
    el.onclick = e => e.stopPropagation();
    window.addEventListener('resize', show);
    sfx('talk'); show();
  });
}
