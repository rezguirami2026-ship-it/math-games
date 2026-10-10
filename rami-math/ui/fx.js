// مؤثرات صغيرة فوق كل شيء: الجواهر تطير من مكان كسبها إلى عدّاد الجواهر في الأعلى، ومعها «+ن» يطفو.
// لا تعترض اللمس، وتُحذف بعد انتهائها.
import { ar } from '../core/util.js';
export function flyGems(n, x, y) {
  const pill = document.querySelector('#panel.on .chGems') || document.getElementById('gemPill'); if (!pill || !n || document.hidden) return;   // داخل التحدي: عدّاد اللوحة نفسها
  const r = pill.getBoundingClientRect(), tx = r.left + r.width * .3, ty = r.top + r.height / 2;
  if (x == null) { const sh = document.querySelector('#panel.on .sheet'), q = sh ? sh.getBoundingClientRect() : null; x = q ? q.left + q.width / 2 : innerWidth / 2; y = q ? q.top + Math.min(q.height, innerHeight) * .45 : innerHeight / 2; }
  const k = Math.min(n, 6);
  for (let i = 0; i < k; i++) {
    const g = document.createElement('i'); g.className = 'fxGem'; g.textContent = '💎';
    const sx = x + (Math.random() - .5) * 60, sy = y + (Math.random() - .5) * 40;
    g.style.left = sx + 'px'; g.style.top = sy + 'px'; document.body.appendChild(g);
    const mx = (sx + tx) / 2 + (Math.random() - .5) * 160, my = Math.max(50, (sy + ty) / 2 - 40 - Math.random() * 60);   // قوس لا يخرج من أعلى الشاشة
    const a = g.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 1, offset: .15 },
      { transform: `translate(calc(-50% + ${mx - sx}px), calc(-50% + ${my - sy}px)) scale(1.1)`, offset: .55 },
      { transform: `translate(calc(-50% + ${tx - sx}px), calc(-50% + ${ty - sy}px)) scale(.6)`, opacity: .9 }], { duration: 900 + i * 90, delay: i * 70, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' });
    a.onfinish = () => { g.remove(); pill.classList.remove('fxBump'); void pill.offsetWidth; pill.classList.add('fxBump'); };
  }
  const p = document.createElement('b'); p.className = 'fxPlus'; p.textContent = '+' + ar(n) + ' 💎'; p.style.left = tx + 'px'; p.style.top = (ty + 26) + 'px';
  setTimeout(() => { document.body.appendChild(p); setTimeout(() => p.remove(), 1300); }, 900);
}
