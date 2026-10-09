// «صندوق الخير»: يتبرّع الطالب بنقاط الخير لأعمال تنفع أهل القرية، فيشكره صاحب الحاجة ويرى أثر عطائه.
// القيمة لا الربح: لا جواهر مقابل التبرع، بل أثر في القرية (برّادة الماء في الساحة) ووسامان. يُفتح من الحقيبة.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';

export const CAUSES = [
  { id: 'iftar', icon: '🍲', name: 'إفطار صائم', cost: 30, who: 'الجدة مريم', thanks: 'جزاك الله خيراً يا بني! وصلت وجبات الإفطار إلى بيوت القرية، وفرح بها الصائمون.' },
  { id: 'water', icon: '💧', name: 'سقيا الماء', cost: 50, who: 'العم ناصر', thanks: 'بفضل عطائك وضعنا برّادة ماء باردة في ساحة القرية، يشرب منها كل عطشان.', decor: 'cooler' },
  { id: 'books', icon: '📚', name: 'كتب لمكتبة المدرسة', cost: 40, who: 'معلمة المدرسة', thanks: 'شكراً لك! صار في مكتبة المدرسة كتب جديدة يقرؤها الطلاب كل يوم.' },
  { id: 'eid', icon: '👕', name: 'كسوة العيد لأطفال القرية', cost: 60, who: 'الشيخ الحارث', thanks: 'لبس الأطفال ثياب العيد الجديدة بفضلك. العطاء يجعل العيد أجمل للجميع.' }
];
const rec = s => (s.charity = s.charity || { n: 0, total: 0, by: {} });

export function openCharity() {
  const s = game.state, el = document.getElementById('panel'); game.busy = true; sfx('talk');
  const draw = (msg) => {
    const R = rec(s);
    el.innerHTML = `<div class="sheet charity"><h3>💚 صندوق الخير</h3>
      <p class="muted">نقاط الخير تكسبها بإنجاز المهام ومساعدة أهل القرية. تبرّع بها لأعمال الخير، فتنفع غيرك وترى أثر عطائك في القرية.</p>
      <div class="chTop"><span>💚 نقاطك: <b>${ar(s.good)}</b></span><span>🤲 تبرعاتك: <b>${ar(R.n)}</b></span><span>✨ مجموع ما قدّمته: <b>${ar(R.total)}</b></span></div>
      ${msg ? `<div class="chThanks">${msg}</div>` : ''}
      <div class="chCauses">${CAUSES.map(c => `<div class="chCause"><span class="chIc">${c.icon}</span><div><b>${c.name}</b><small>${c.decor && !(s.decor || {})[c.decor] ? 'يضع أثراً دائماً في ساحة القرية' : `تبرعتَ ${ar(R.by[c.id] || 0)} ${(R.by[c.id] || 0) === 1 ? 'مرة' : 'مرات'}`}</small></div>
        <button class="act go" data-give="${c.id}" ${s.good < c.cost ? 'disabled' : ''}>تبرّع ${ar(c.cost)} 💚</button></div>`).join('')}</div>
      <p class="muted chNote">«الخير يبقى، والعطاء يجمع القلوب»</p>
      <button class="act" id="chOut">رجوع</button></div>`;
    el.classList.add('on');
    el.querySelectorAll('[data-give]').forEach(b => b.onclick = e => { e.stopPropagation(); const c = CAUSES.find(x => x.id === b.dataset.give); if (!c || s.good < c.cost) return;
      s.good -= c.cost; const R2 = rec(s); R2.n++; R2.total += c.cost; R2.by[c.id] = (R2.by[c.id] || 0) + 1;
      if (c.decor) { s.decor = s.decor || {}; s.decor[c.decor] = s.decor[c.decor] || Date.now(); }
      sfx('win'); bus.emit('good'); bus.emit('save');
      draw(`<b>${c.who}:</b> «${c.thanks}»`); });
    document.getElementById('chOut').onclick = e => { e.stopPropagation(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
  };
  draw();
}
