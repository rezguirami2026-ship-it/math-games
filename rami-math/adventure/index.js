// فهرس المغامرات: تُفتح كل مغامرة بإكمال وحدة. القائمة (من الحقيبة)، ونافذة «فُتحت مغامرة جديدة»، والتشغيل/المتابعة.
// القصص تُحمَّل عند الطلب (import) فلا تُثقل تحميل اللعبة.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';
import { UNITS } from '../content/lessons.js';
import { finaleOpen } from '../missions/activity.js';
import { runAdventure, advRec } from './engine.js';
import { track } from '../core/ops.js';
import { PREVIEW } from '../save/save.js';

export const ADVENTURES = [
  { id: 'rescue', unit: 0, icon: '🏘️', title: 'إنقاذ القرية', blurb: 'هاجمت «عصابة الظلال» القرية ليلاً وخطفت أربعة من أهلها. استكشف وتسلّل وأنقذهم!', load: () => import('./stories/rescue.js') },
  { id: 'storm', unit: 1, icon: '🌪️', title: 'العاصفة الكبرى', blurb: 'عاصفة رعدية تضرب سوق الوادي: احتمِ من الريح، قُد الناس إلى الملجأ، أصلح الجسر، أعد الماعز، واقرع جرس البرج!', load: () => import('./stories/storm.js') },
  { id: 'island', unit: 2, icon: '🏝️', title: 'الجزيرة المفقودة', blurb: 'تحطّم مركب القبطان سيف على جزيرة مجهولة: سرطانات وأدغال وكهف مظلم ولغز مرايا… ابنِ طوفاً وعُد إلى القرية!', load: () => import('./stories/island.js') },
  { id: 'oldcity', unit: 3, icon: '🏛️', title: 'سر المدينة القديمة', blurb: 'مدينة الشمس المدفونة تحت الرمال: نقوش تحكي قصتها، وتماثيل وألغاز، ومستكشفة محاصرة، ومعبد مظلم يحرسه حارس من حجر!', load: () => import('./stories/oldcity.js') },
  { id: 'lanterns', unit: 4, icon: '🏮', title: 'فوانيس المهرجان', blurb: 'ليلة المهرجان… واختفت الفوانيس السحرية! تتبّع اللص الغامض بين الأكشاك والألعاب وأعِد النور إلى الساحة.', load: () => import('./stories/lanterns.js') },
  { id: 'lighthouse', unit: 5, icon: '🗼', title: 'الفنار والضباب', blurb: 'ضباب كثيف يغطي الميناء ومراكب الصيادين تائهة في البحر. أصلح الفنار القديم وأرشدها إلى البر.', load: () => import('./stories/lighthouse.js') },
  { id: 'desert', unit: 6, icon: '🏜️', title: 'مهمة في الصحراء', blurb: 'عاصفة رملية والجمل سهيل ضائع! اتبع آثاره، احفر الرمال، اهتدِ بالنجم القطبي، وأنقذه في الواحة.', load: () => import('./stories/desert.js') },
  { id: 'mountain', unit: 7, icon: '⛰️', title: 'قمة جبل شمس', blurb: 'رحلة إلى أعلى جبال عُمان: اسقِ المدرّجات بماء الفلج، أصلح الجسر المعلّق فوق الهاوية، تفادَ الصخور، وافتح صندوق الجد الأكبر عند الغروب.', load: () => import('./stories/mountain.js') },
  { id: 'castle', unit: 8, icon: '🏰', title: 'القلعة المظلمة', blurb: 'المغامرة الكبرى: سيد الظلال سرق قنديل الخير! أصلح الجسر بين الحراس، حرّر زياد، وجّه نور القمر، واكشف سر القلعة… ثم احتفل مع كل أصدقائك.', load: () => import('./stories/castle.js') }
];
export const advUnlocked = a => PREVIEW || finaleOpen(a.unit);   // ?preview=1: معاينة للمعلم بحفظ منفصل، كل المغامرات مفتوحة

/* تشغيل مغامرة (أو متابعتها من حيث توقف الطالب) */
export async function playAdventure(id, onDone) {
  const a = ADVENTURES.find(x => x.id === id); if (!a || a.soon || !advUnlocked(a)) return;
  const def = (await a.load()).default, R = advRec(id);
  if (!R.st) track('adventure_started', id);
  sfx('newRegion');
  runAdventure(def, res => { if (res && res.done) track('adventure_completed', id); bus.emit('save'); if (onDone) onDone(res); });
}

/* لوحة المغامرات */
export function openAdventures() {
  const el = document.getElementById('panel'), s = game.state;
  const card = a => {
    const R = (s.adventures || {})[a.id], open = advUnlocked(a), u = UNITS[a.unit];
    const st = a.soon ? `<em class="advSoon">🛠️ قريباً</em>` : !open ? `<em class="advLock">🔒 تُفتح بإكمال وحدة «${u.title}»</em>`
      : R && R.done ? `<em class="advDone">✅ أكملتها · ⭐ ${ar(R.best)}</em><button class="act ghost" data-adv="${a.id}">🔁 العب من جديد</button>`
      : `<button class="act go" data-adv="${a.id}">${R && R.st ? '▶ تابع المغامرة' : '▶ ابدأ المغامرة'}</button>`;
    return `<div class="advCard ${open && !a.soon ? 'open' : 'locked'}"><div class="advCardIcon">${a.icon}</div><div class="advCardBody"><b>${a.title}</b><p>${a.blurb}</p>${st}</div></div>`;
  };
  el.innerHTML = `<div class="sheet advList"><h3>🗺️ المغامرات</h3><p class="muted">بعد كل وحدة تُفتح مغامرة: قصة وشخصيات واستكشاف وألغاز… بلا حساب!</p>${ADVENTURES.map(card).join('')}<button class="act" data-close>رجوع إلى العالم</button></div>`;
  el.classList.add('on');
  el.querySelectorAll('[data-adv]').forEach(b => b.onclick = e => { e.stopPropagation(); el.classList.remove('on'); el.innerHTML = ''; playAdventure(b.dataset.adv); });
}

/* «فُتحت مغامرة جديدة»: مرة واحدة لكل مغامرة، في لحظة فراغ (بعد حوارات إنهاء الوحدة) */
let waiting = 0;
export function checkAdventureUnlocks() {
  const s = game.state; if (!s) return; s.advSeen = s.advSeen || {};
  const a = ADVENTURES.find(x => !x.soon && advUnlocked(x) && !s.advSeen[x.id]); if (!a || waiting) return;
  waiting = setInterval(() => {
    const free = !game.busy && !document.getElementById('panel').classList.contains('on') && !document.querySelector('#dialog.on') && !document.querySelector('.adv');
    if (!free) return; clearInterval(waiting); waiting = 0; s.advSeen[a.id] = Date.now(); bus.emit('save'); sfx('win');
    const m = document.createElement('div'); m.className = 'opsModal on advUnlock';
    m.innerHTML = `<div class="opsCard"><div class="advUnlockIcon">${a.icon}</div><p class="advUnlockTag">⭐ فُتحت مغامرة جديدة!</p><h3>${a.title}</h3><p>${a.blurb}</p>
      <button class="act big go" data-go>▶ ابدأ المغامرة الآن</button><button class="act ghost" data-later>لاحقاً (من الحقيبة ← المغامرات)</button></div>`;
    document.body.appendChild(m);
    m.querySelector('[data-go]').onclick = () => { m.remove(); playAdventure(a.id); };
    m.querySelector('[data-later]').onclick = () => m.remove();
  }, 1500);
}
