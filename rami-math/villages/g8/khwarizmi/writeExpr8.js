// ٥-٣ كتابة العبارات الجبرية — «دكّان الورّاق»: الورّاق سالم يكتب للناس بالحروف ما لا يعرفون قيمته. الطالب يختار العبارة التي
// تصف «فكّر في عدد» (مع الأقواس حين يلزم)، ويكتب محيط ورقة مستطيلة ومساحتها وثمن التذاكر بحرفين في أبسط صورة.
// التحدي: ٨ أسئلة من 8Ae4 (الكتاب ص٨٢–٨٤).
import { mission } from '../../mission.js';
import { N, R, fr, pw, ex } from '../../math.js';
import { choice, tf, match } from '../../../missions/challenge.js';
import { parchment, rectLabeled, slab, say, INKC } from './art.js';

const who = { name: 'الورّاق سالم', face: '🧔🏽', id: 'warraq' };
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; parchment(g, w, h);
  if (r.mode === 'rect') rectLabeled(g, w * .3, h * .22, w * .4, h * .5, { top: [`${r.a === 1 ? '' : N(r.a)}س`], right: [`${r.b === 1 ? '' : N(r.b)}ص`] }, 'rgba(253,230,138,.5)');
  else if (r.mode === 'tickets') { [[w * .3, '#0F766E', r.na, 'س'], [w * .7, '#B45309', r.nc, 'ص']].forEach(([x, col, n, v]) => { for (let k = 0; k < n; k++) { g.fillStyle = col; g.fillRect(x - 70 + (k % 4) * 36, h * .25 + Math.floor(k / 4) * 40, 30, 34); g.fillStyle = '#FFF'; g.font = '900 16px Cairo'; g.textAlign = 'center'; g.fillText(v, x - 55 + (k % 4) * 36, h * .25 + Math.floor(k / 4) * 40 + 23); } });
    say(g, 'تذاكر البالغين', w * .3, h * .2, 15); say(g, 'تذاكر الأطفال', w * .7, h * .2, 15); }
  else { slab(g, w * .16, h * .18, w * .68, h * .56, '#FFFDF6'); g.strokeStyle = INKC; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(w * .22, h * .3 + k * h * .09); g.lineTo(w * .78 - (k % 2) * 40, h * .3 + k * h * .09); g.stroke(); }
    g.save(); g.translate(w * .8, h * .62 + Math.sin(t * 4) * 4); g.rotate(-.7); g.fillStyle = '#F8FAFC'; g.beginPath(); g.ellipse(0, -30, 6, 30, 0, 0, 7); g.fill(); g.restore(); }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

/* «فكّر في عدد م»: أربع صيغ متقاربة، واحدة صحيحة */
const STORIES = [
  (a, b) => [`يضاعف العدد ثم يضيف ${N(b)}`, `${N(2)}م + ${N(b)}`, [`${N(2)}(م + ${N(b)})`, `م + ${N(2 + b)}`, `${N(2 * b)}م`]],
  (a, b) => [`يضيف ${N(b)} إلى العدد ثم يضرب الناتج في ${N(a)}`, `${N(a)}(م + ${N(b)})`, [`${N(a)}م + ${N(b)}`, `م + ${N(a * b)}`, `${N(a + b)}م`]],
  (a, b) => [`يقسم العدد على ${N(a)} ثم يطرح ${N(b)}`, `${fr('م', a)} − ${N(b)}`, [`${fr(`م − ${N(b)}`, a)}`, `${N(a)}م − ${N(b)}`, `${fr('م', b)} − ${N(a)}`]],
  (a, b) => [`يطرح ${N(b)} من العدد ثم يقسم الناتج على ${N(a)}`, fr(`م − ${N(b)}`, a), [`${fr('م', a)} − ${N(b)}`, `${N(b)} − ${fr('م', a)}`, fr(`${N(b)} − م`, a)]],
  (a, b) => [`يضرب العدد في نفسه ثم ينصّف الناتج`, fr(pw('م', 2), 2), [`${N(2)}م`, fr('م', 2), `${N(2)}${pw('م', 2)}`]]
];

function make(i) {
  if (i <= 1) { const k = i === 0 ? R(0, 2) * 2 : [1, 3, 4][R(0, 2)], a = R(3, 6), b = [2, 3, 7, 8, 9].filter(x => x !== a)[R(0, 3)], [txt, right, wrong] = STORIES[k](a, b), opts = shuffle([right, ...wrong]);
    return { q: `يفكّر أحمد في عدد م، ثم ${txt}. أي عبارة تصف ما فعله؟`, input: { type: 'pick', opts }, ok: x => opts[x] === right,
      hint: 'اكتب الخطوات بالترتيب نفسه: ما الذي حدث للعدد أولاً؟ وهل تحتاج إلى قوس ليتم الجمع قبل الضرب؟', bad: x => /\(/.test(opts[x]) !== /\(/.test(right) ? 'انتبه للأقواس: أيّ العمليتين تأتي أولاً؟' : '', good: 'أحسنت!', data: { mode: 'paper' } }; }
  if (i <= 3) { const a = R(2, 9), b = R(2, 9), per = i === 2;
    return { q: per ? `ورقة مستطيلة طولها ${N(a)}س وعرضها ${N(b)}ص. اكتب محيطها في أبسط صورة.` : `ورقة مستطيلة طولها ${N(a)}س وعرضها ${N(b)}ص. اكتب مساحتها في أبسط صورة.`,
      input: { type: 'blanks', tpl: per ? '{}س + {}ص' : '{}س ص' }, sol: per ? [2 * a, 2 * b] : [a * b], ok: x => per ? x[0] === 2 * a && x[1] === 2 * b : x[0] === a * b,
      hint: per ? 'المحيط مجموع الأضلاع الأربعة: كم ضلعاً طوله ' + N(a) + 'س؟' : 'المساحة = الطول × العرض: اضرب الأعداد معاً والحروف معاً.',
      bad: x => per && x[0] === a && x[1] === b ? 'هذا ضلعان فقط: للمستطيل أربعة أضلاع.' : !per && x[0] === a + b ? 'في المساحة نضرب لا نجمع.' : '', good: per ? `أحسنت! ${ex([2 * a, 'س'], [2 * b, 'ص'])}` : `أحسنت! ${N(a * b)}س ص`,
      data: { mode: 'rect', a, b } }; }
  const na = R(2, 6), nc = R(2, 6);
  return { q: `ثمن تذكرة البالغ س ريالاً وتذكرة الطفل ص ريالاً. اكتب ثمن ${N(na)} تذاكر للبالغين و${N(nc)} للأطفال.`, input: { type: 'blanks', tpl: '{}س + {}ص' }, sol: [na, nc], ok: x => x[0] === na && x[1] === nc,
    hint: 'كم مرة نحسب ثمن تذكرة البالغ؟ وكم مرة ثمن تذكرة الطفل؟', bad: x => x[0] === nc && x[1] === na ? 'بدّلتَ العددين: س لتذاكر البالغين.' : '', good: `أحسنت! ${ex([na, 'س'], [nc, 'ص'])}`, data: { mode: 'tickets', na, nc } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b] = fresh(() => { const a = R(3, 7); return [a, [2, 8, 9][R(0, 2)]]; }); const [txt, right, wrong] = STORIES[1](a, b); items.push(choice(`فكّر في عدد م، ثم ${txt}:`, right, wrong, 'العملية الأولى داخل القوس.', '8Ae4')); }
  { const [a, b] = fresh(() => { const a = R(3, 7); return [a, [2, 8, 9][R(0, 2)]]; }); const [txt, right, wrong] = STORIES[2](a, b); items.push(choice(`فكّر في عدد م، ثم ${txt}:`, right, wrong, 'قسمة العدد وحده أم الناتج كله؟', '8Ae4')); }
  { const [a, b] = fresh(() => [R(2, 8), R(2, 8)]); items.push(choice(`محيط مستطيل طوله ${N(a)}س وعرضه ${N(b)}ص:`, ex([2 * a, 'س'], [2 * b, 'ص']), [ex([a, 'س'], [b, 'ص']), `${N(a * b)}س ص`, ex([a + b, 'س'])], 'اجمع الأضلاع الأربعة.', '8Ae4')); }
  { const [a, b] = fresh(() => [R(2, 8), R(2, 8)]); items.push(choice(`مساحة مستطيل طوله ${N(a)}س وعرضه ${N(b)}ص:`, `${N(a * b)}س ص`, [ex([a, 'س'], [b, 'ص']), ex([2 * a, 'س'], [2 * b, 'ص']), `${N(a + b)}س ص`], 'اضرب الطول في العرض.', '8Ae4')); }
  items.push(tf('«أضف ٣ إلى العدد م ثم اضرب في ٤» تُكتب ٤م + ٣.', false, 'أيّ العمليتين أولاً؟', '8Ae4', 'الصحيح ٤(م + ٣): القوس يجعل الجمع أولاً.'));
  items.push(tf('الفرق بين ثمن تذكرة البالغ س وتذكرة الطفل ص يُكتب س − ص.', true, 'الفرق طرح.', '8Ae4', 'إذا كانت تذكرة البالغ أغلى.'));
  items.push(match('صِل كل وصف بعبارته:', [['ضعف العدد ن', `${N(2)}ن`], ['العدد ن مربعاً', pw('ن', 2)], ['نصف العدد ن', fr('ن', 2)], ['العدد ن مضافاً إليه ٢', 'ن + ٢']], 'اقرأ كل وصف كلمة كلمة.', '8Ae4'));
  { const [n] = fresh(() => [R(3, 9)]); items.push(choice(`ثمن ${N(n)} أقلام سعر كل منها ق ريالاً:`, `${N(n)}ق`, [`ق + ${N(n)}`, fr('ق', n), `${N(n)} − ق`], 'كم مرة يتكرر ثمن القلم؟', '8Ae4')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'دكّان الورّاق', icon: '✒️', who, rounds: 5, make, draw,
  intro: ['أنا الورّاق، أكتب للناس رسائلهم… وأحياناً أكتب ما لا نعرف قيمته بعد!', 'الحرف يقوم مقام العدد المجهول، والعبارة تحكي ما حدث له.'],
  outro: ['كتبتَ العبارات كما يكتبها علماء الجبر.', 'لنختبر كتابة العبارات بأسئلة متنوعة.'],
  challenge: { title: 'تحدي كتابة العبارات', make: challenge }
});
export { make, challenge };
