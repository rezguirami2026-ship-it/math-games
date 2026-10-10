// «خريطة إتقاني»: يرى الطالب كل مهارات المنهج مجمّعة في ١١ مجالاً، ولكل مجال شريط إتقان من نجوم دروسه
// (أفضل نجوم التحدي أو النشاط، والنجمة الذهبية لتحدي الخبير)، وما ينتظر المراجعة من أخطائه. منها يفتح «تدرّب» على أضعف درس.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';
import { LESSONS } from '../content/lessons.js';
import * as quests from '../missions/quests.js';
import { pendingOf, reviews } from '../missions/review.js';

export const SKILLS = [
  ['place', '🔢', 'القيمة المكانية والأعداد', '#3FA3F5', ['placeValue', 'compareRound', 'sequences', 'numberLineEstimate', 'hieroNumbers', 'decimalSystem', 'numberSystem2', 'numberHistory2']],
  ['special', '🔑', 'العوامل والأعداد الخاصة', '#8E6CF6', ['factorsMultiples', 'oddEven', 'primeNumbers', 'commonMultiples', 'divisibility', 'specialNumbers']],
  ['muldiv', '✖️', 'الضرب والقسمة', '#E2475C', ['powerOf10', 'multiplyStrategies', 'division1', 'multiplyStrategies2', 'multiplyT2', 'division2', 'mulDiv', 'operationLaws']],
  ['addsub', '➕', 'الجمع والطرح والأعداد العشرية', '#2E9E5B', ['decimalAdd', 'decimalOperations', 'decimalApplications', 'integers', 'mentalAddSub', 'addSub1', 'addSub2']],
  ['fraction', '🍰', 'الكسور والنسب', '#F08A24', ['fractionDiv', 'percentages', 'ratioProportion', 'fractions', 'mixedNumbers', 'decimalFractions']],
  ['measure', '📏', 'الطول والكتلة والسعة', '#1E9BB0', ['lengthMeasure', 'lineDrawing', 'massCapacity1', 'massCapacity2', 'capacityMass', 'distance']],
  ['time', '⏰', 'الزمن والتقويم', '#C2410C', ['timeTables', 'calendars', 'timeConvert', 'timeZones1', 'timeZones2', 'leapYears']],
  ['area', '⬛', 'المساحة والمحيط', '#6B8E23', ['areaPerimeterT1', 'areaPerimeter', 'rectangles', 'irregularShapes']],
  ['shapes', '🔷', 'الأشكال والمجسمات والزوايا', '#1E4FBF', ['shapesIdentify', 'shapes3D', 'nets', 'triangleAngles', 'classifyShapes', 'measureAngles', 'prisms', 'regularPolyhedra']],
  ['moves', '🔄', 'التحويلات والإحداثيات', '#B5179E', ['translation', 'reflection', 'rotation', 'coordinates', 'transformPolygons']],
  ['data', '📊', 'البيانات والاحتمال', '#0F8B6E', ['lineGraphs', 'pieCharts', 'statsAverage', 'usingStats', 'probabilityLang']]
];
const title = id => (LESSONS.find(l => l.id === id) || {}).title || id;
/* نجوم الدرس: أفضل ما ناله في التحدي أو النشاط (٠–٣)، و٤ = النجمة الذهبية في تحدي الخبير */
export function lessonStars(id, s = game.state) {
  if (!quests.isDone(id)) return -1;
  const st = Math.max(quests.data(id).stars || 0, ((s.activities || {})[id] || {}).best || 0, 1);
  return st >= 3 && ((s.expert || {})[id] || {}).gold ? 4 : st;
}
export function skillOf(sk, s = game.state) {
  const ids = sk[4], st = ids.map(id => lessonStars(id, s)), done = st.filter(x => x >= 0).length;
  const pts = st.reduce((a, x) => a + Math.max(0, Math.min(3, x)), 0), pct = Math.round(pts / (ids.length * 3) * 100);
  const pend = ids.reduce((a, id) => a + pendingOf(id), 0);
  const weak = ids.filter((id, k) => st[k] >= 0).sort((a, b) => (pendingOf(b) - pendingOf(a)) || (lessonStars(a, s) - lessonStars(b, s)))[0];
  return { ids, st, done, pct, pend, weak, q: done ? pts / (done * 3) : 0 };   // q: جودة الدروس المنجزة وحدها
}
const level = (k, pct) => k.done === 0 ? ['🔒', 'لم تبدأ بعد', 'lock'] : k.pend ? ['🔁', 'تحتاج مراجعة', 'rv'] : pct >= 90 ? ['🌟', 'متقن', 'top'] : pct >= 60 ? ['💪', 'جيد جداً', 'good'] : ['🌱', 'في الطريق', 'grow'];

export function openMastery() {
  const s = game.state, el = document.getElementById('panel'); game.busy = true; sfx('talk');
  const K = SKILLS.map(sk => ({ sk, k: skillOf(sk, s) })), started = K.filter(x => x.k.done);
  const total = Math.round(K.reduce((a, x) => a + x.k.pct * x.sk[4].length, 0) / LESSONS.length);
  const best = started.slice().sort((a, b) => (b.k.q - a.k.q) || (b.k.done - a.k.done))[0];
  const need = started.filter(x => x.k.pend).sort((a, b) => b.k.pend - a.k.pend)[0] || started.filter(x => x.k.q < .9).sort((a, b) => a.k.q - b.k.q)[0];
  const pendAll = Object.keys(reviews()).length;
  el.innerHTML = `<div class="sheet mastery"><h3>📊 خريطة إتقان ${s.hero.name}</h3>
    <div class="msTop"><div class="msRing" style="--p:${total}"><b>${ar(total)}٪</b><small>من المنهج</small></div>
      <div class="msFacts"><span>📘 <b>${ar(Object.keys(s.quests.done || {}).filter(id => LESSONS.some(l => l.id === id)).length)}</b> درساً من ${ar(LESSONS.length)}</span>
      <span>🧠 <b>${ar(s.mastered || 0)}</b> مهارة أتقنتها بالمراجعة</span><span>🔁 <b>${ar(pendAll)}</b> تنتظر المراجعة في مهمة اليوم</span></div></div>
    ${started.length ? `<div class="msTips">${best ? `<p>💪 أقوى مجالاتك: <b>${best.sk[2]}</b></p>` : ''}${need && need !== best ? `<p>🎯 تدرّب أكثر على: <b>${need.sk[2]}</b></p>` : ''}</div>` : '<p class="muted">أنجز دروسك الأولى لتبدأ خريطتك بالامتلاء ✨</p>'}
    <div class="msGrid">${K.map(({ sk, k }) => { const L = level(k, k.pct); return `<div class="msCard ${L[2]}" style="--c:${sk[3]}">
      <div class="msHead"><i>${sk[1]}</i><div><b>${sk[2]}</b><small>${L[0]} ${L[1]}${k.pend ? `، ${k.pend === 1 ? 'مهارة واحدة' : k.pend === 2 ? 'مهارتان' : ar(k.pend) + ' مهارات'} للمراجعة` : ''}</small></div><em>${ar(k.pct)}٪</em></div>
      <div class="msBar"><span style="width:${k.pct}%"></span></div>
      <div class="msLessons">${k.ids.map((id, j) => { const x = k.st[j]; return `<span class="msL ${x < 0 ? 'lock' : ''}" title="${title(id)}">${title(id)} <u>${x < 0 ? '🔒' : x === 4 ? '🌟' : '★'.repeat(x) + '<s>' + '☆'.repeat(3 - x) + '</s>'}</u>${pendingOf(id) ? ' 🔁' : ''}</span>`; }).join('')}</div>
      ${k.weak && (k.pct < 100 || k.pend) ? `<button class="act msGo" data-l="${k.weak}">🎲 تدرّب: ${title(k.weak)}</button>` : ''}</div>`; }).join('')}</div>
    <p class="muted">★ نجوم التحدي أو النشاط · 🌟 النجمة الذهبية في تحدي الخبير · 🔁 مهارة أخطأت فيها وستعود في مهمة اليوم حتى تتقنها</p>
    <button class="act" id="msOut">رجوع إلى القرية</button></div>`;
  el.classList.add('on');
  const close = () => { el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
  el.querySelectorAll('[data-l]').forEach(b => b.onclick = e => { e.stopPropagation(); close(); setTimeout(() => bus.emit('openActivity', b.dataset.l), 120); });
  document.getElementById('msOut').onclick = e => { e.stopPropagation(); close(); };
}
