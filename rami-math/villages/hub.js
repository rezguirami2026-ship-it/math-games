// «خريطة القرى»: طريق متعرج يمر بقرى الصف بالترتيب (وحدة كتاب لكل قرية)، لكل قرية شارتها وتقدّم دروسها ونجومها.
// المقفلة رمادية بقفل، والتالية تنبض. التخطيط يتكيف مع عرض الشاشة (عمودان على الهاتف، وأكثر على الحاسوب).
import { ar } from '../core/util.js';

const COLS = ['#C2410C', '#0E7490', '#7C3AED', '#B45309', '#1D4ED8', '#047857', '#BE185D', '#4D7C0F', '#9333EA', '#0F766E', '#B91C1C', '#1E40AF', '#A16207', '#15803D', '#6D28D9', '#0369A1', '#C026D3'];
const G_NAME = { 8: 'الثامن', 9: 'التاسع' };

export function openHub(root, o) {
  const { units, state } = o;
  const cur = units.findIndex((_, u) => o.unitOpen(u) && !o.unitDone(u));
  const nodes = units.map((U, u) => {
    const ls = o.unitLessons(u), done = ls.filter(l => o.isDone(l.id)).length, stars = ls.reduce((a, l) => a + o.starsOf(l.id), 0);
    return { U, u, n: ls.length, done, stars, open: o.unitOpen(u), full: done === ls.length && ls.length > 0, col: COLS[u % COLS.length] };
  });
  const total = nodes.reduce((a, n) => a + n.done, 0), all = nodes.reduce((a, n) => a + n.n, 0);
  const card = N => {
    const pct = N.n ? N.done / N.n : 0, R = 34, C = 2 * Math.PI * R;
    return `<button class="hnode ${N.open ? '' : 'lock'} ${N.full ? 'full' : ''} ${N.u === cur ? 'cur' : ''}" data-u="${N.u}" style="--c:${N.col}" ${N.open ? '' : 'aria-disabled="true"'}>
      <span class="hmed"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${R}" class="hbg"/><circle cx="40" cy="40" r="${R}" class="hpr" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
        <i>${N.open ? N.U.icon : '🔒'}</i>${N.full ? '<em>✓</em>' : ''}</span>
      <span class="hlab"><small>الوحدة ${ar(N.U.n)}</small><b>${N.U.name}</b><span>${N.U.title}</span>
        <span class="hmeta">${ar(N.done)}/${ar(N.n)} دروس · ⭐ ${ar(N.stars)}</span></span></button>`;
  };
  const term = t => nodes.filter(N => N.U.term === t);
  root.innerHTML = `<div class="hub g${o.grade}">
    <header class="hhead"><div><small>الصف ${G_NAME[o.grade] || ar(o.grade)} · ${state.hero.name}</small><h1>خريطة القرى</h1></div>
      <div class="hsum"><b>${ar(total)}/${ar(all)}</b><small>درساً</small></div><div class="hsum">💎 <b>${ar(state.gems || 0)}</b></div></header>
    <div class="hscroll">
      ${[1, 2].map(t => `<section class="hterm"><h2>الفصل الدراسي ${t === 1 ? 'الأول' : 'الثاني'}</h2><div class="hpath">${term(t).map(card).join('')}</div></section>`).join('')}
    </div></div>`;
  root.querySelectorAll('.hnode').forEach(b => b.onclick = () => {
    const u = +b.dataset.u;
    if (!o.unitOpen(u)) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return; }
    o.enter(u);
  });
  const c = root.querySelector('.hnode.cur'); if (c) setTimeout(() => c.scrollIntoView({ block: 'center', behavior: 'smooth' }), 200);
}
