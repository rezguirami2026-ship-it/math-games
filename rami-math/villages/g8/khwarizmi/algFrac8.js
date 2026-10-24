// ٥-٧ جمع الكسور الجبرية وطرحها — «ألواح زهرة»: لوحان من الأردواز عليهما كسران جبريان، والمعلّمة زهرة تجمعهما على لوح ثالث.
// كما في الكسور العددية: مقام مشترك (المضاعف المشترك الأصغر)، ثم البسط، ثم أبسط صورة؛ والحروف المختلفة لا تُجمع.
// التحدي: ٨ أسئلة من 8Ae6 (الكتاب ص٩٢–٩٤).
import { mission } from '../../mission.js';
import { N, R, fr, gcd, lcm } from '../../math.js';
import { choice, tf, num } from '../../../missions/challenge.js';
import { parchment, say } from './art.js';

const who = { name: 'المعلّمة زهرة', face: '👩🏽‍🏫', id: 'zahra' };
const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const T = (c, v) => `${c === 1 ? '' : N(c)}${v}`;
const fb = (top, d) => fr(top, d);   // كسر جبري HTML
const BL = '<span class="vm-fbl">{}</span>';

/* لوح أردواز وعليه كسر (بسط ومقام نصاً) */
function board(g, x, y, w, h, top, bot, col = '#F8FAFC') {
  g.fillStyle = '#7C4A1E'; g.fillRect(x - 6, y - 6, w + 12, h + 12); g.fillStyle = '#1F2D2A'; g.fillRect(x, y, w, h);
  if (top == null) return; g.font = '900 24px Cairo'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col;
  g.fillText(top, x + w / 2, y + h / 2 - 8); g.fillRect(x + w * .2, y + h / 2, w * .6, 3); g.fillText(bot, x + w / 2, y + h / 2 + 30);
}
function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; parchment(g, w, h);
  if (!r.a) return;
  board(g, w * .62, h * .12, w * .26, h * .42, r.a[0], r.a[1]); say(g, r.op, w * .5, h * .36, 30, '#3B2412'); board(g, w * .12, h * .12, w * .26, h * .42, r.b[0], r.b[1]);
  board(g, w * .32, h * .62, w * .36, h * .34, S.done ? r.res[0] : '؟', S.done ? r.res[1] : '', S.done ? '#86EFAC' : '#94A3B8');
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  const V = ['س', 'ص', 'ط', 'ع'][R(0, 3)];
  if (i <= 2) {   // الحرف نفسه: أ/ب ح ± ج/د ح
    let a, b, c, d, op, n, D; for (let k = 0; k < 80; k++) { b = [2, 3, 4, 5, 6, 8, 9][R(0, 6)]; d = [2, 3, 4, 5, 6, 9, 10][R(0, 6)]; a = R(1, 5); c = R(1, 5); op = i === 1 ? -1 : 1; if (i === 0) d = b;
      const L = lcm(b, d); [n, D] = red(a * L / b + op * c * L / d, L); if (n > 0 && D > 1 && L <= 30 && (i === 0 || b !== d)) break; }
    const sol = n === 1 ? [D] : [n, D], tpl = fr(n === 1 ? V : `${BL}${V}`, BL);
    return { q: `بسّط: ${fb(T(a, V), b)} ${op > 0 ? '+' : '−'} ${fb(T(c, V), d)}`, input: { type: 'blanks', tpl }, sol, ok: x => x.length === sol.length && x.every((v, k) => v === sol[k]),
      hint: b === d ? 'المقامان متساويان: ماذا تفعل بالبسطين؟ ثم هل يمكن التبسيط؟' : 'ما المضاعف المشترك الأصغر للمقامين؟ أعد كتابة كل كسر به.',
      bad: x => x[x.length - 1] === b + d ? 'المقامات لا تُجمع: وحّدها أولاً.' : '', good: 'أحسنت!',
      data: { a: [T(a, V), N(b)], b: [T(c, V), N(d)], op: op > 0 ? '+' : '−', res: [n === 1 ? V : T(n, V), N(D)] } }; }
  // حرفان مختلفان: ل/أ + د/ب = (ل + ك د)/أ حين ب يقسم أ، أو (ك ل − م د)/ج
  if (i === 3) { const d2 = [2, 3, 4][R(0, 2)], k = R(2, 3), a = d2 * k;
    return { q: `بسّط: ${fb('ل', a)} + ${fb('د', d2)}`, input: { type: 'blanks', tpl: fr(`ل + ${BL}د`, BL) }, sol: [k, a], ok: x => x[0] === k && x[1] === a,
      hint: `المقام المشترك ${N(a)}: بكم نضرب بسط الكسر الثاني ومقامه؟ والحرفان المختلفان لا يُجمعان.`, bad: x => x[1] === a + d2 ? 'المقامات لا تُجمع.' : '', good: 'أحسنت! ل ود حدّان مختلفان يبقيان منفصلين.',
      data: { a: ['ل', N(a)], b: ['د', N(d2)], op: '+', res: [`ل + ${T(k, 'د')}`, N(a)] } }; }
  const [b, d] = [[6, 4], [4, 6], [3, 4], [6, 9], [4, 10], [3, 5]][R(0, 5)], L = lcm(b, d), p = R(1, b - 1), q = R(1, d - 1);
  if (gcd(p, b) !== 1 || gcd(q, d) !== 1) return make(4);
  return { q: `بسّط: ${fb(T(p, 'ك'), b)} − ${fb(T(q, 'م'), d)}`, input: { type: 'blanks', tpl: fr(`${BL}ك − ${BL}م`, BL) }, sol: [p * L / b, q * L / d, L], ok: x => x[0] === p * L / b && x[1] === q * L / d && x[2] === L,
    hint: 'وحّد المقامين بالمضاعف المشترك الأصغر، واضرب كل بسط في العدد نفسه الذي ضربت فيه مقامه.', bad: x => x[0] === p && x[1] === q ? 'اضرب البسطين أيضاً، لا المقامين فقط.' : '', good: 'أحسنت!',
    data: { a: [T(p, 'ك'), N(b)], b: [T(q, 'م'), N(d)], op: '−', res: [`${T(p * L / b, 'ك')} − ${T(q * L / d, 'م')}`, N(L)] } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [b] = fresh(() => [R(3, 9)]); items.push(choice(`${fb('س', b)} + ${fb('س', b)} =`, fb(`${N(2)}س`, b) , [fb(`${N(2)}س`, 2 * b), fb('س', 2 * b), fb('س<sup>٢</sup>', b)], 'المقامان متساويان: اجمع البسطين فقط.', '8Ae6')); }
  { const [b, d] = fresh(() => [[2, 3, 4][R(0, 2)], [5, 7][R(0, 1)]]); items.push(num(`ما المقام المشترك الأصغر لـ ${fb('ص', b)} + ${fb('ص', d)}؟`, lcm(b, d), 'أصغر عدد يقبل القسمة على المقامين.', '8Ae6')); }
  items.push(choice(`${fb('ص', '٣')} − ${fb('ص', '٩')} =`, fb('٢ص', '٩'), [fb('ص', '٦'), fb('٠', '٦'), fb('٢ص', '٣')], 'حوّل الكسر الأول إلى تسعات.', '8Ae6'));
  items.push(tf(`${fb('ل', '٨')} + ${fb('د', '٤')} = ${fb('ل + ٢د', '٨')}`, true, 'وحّد المقامين إلى ٨.', '8Ae6', 'د/٤ = ٢د/٨، والحرفان مختلفان فلا يُجمعان.'));
  items.push(tf(`${fb('س', '٢')} + ${fb('س', '٣')} = ${fb('٢س', '٥')}`, false, 'هل نجمع المقامات؟', '8Ae6', 'الصحيح ٣س/٦ + ٢س/٦ = ٥س/٦.'));
  { const [a, c] = fresh(() => [R(1, 4), R(1, 4)]); const [n, D] = red(a * 3 + c * 5, 15); items.push(choice(`${fb(T(a, 'ط'), '٥')} + ${fb(T(c, 'ط'), '٣')} =`, fb(T(n, 'ط'), N(D)), [fb(T(a + c, 'ط'), '٨'), fb(T(a + c, 'ط'), '١٥'), fb(T(a * c, 'ط'), '١٥')].filter(x => x !== fb(T(n, 'ط'), N(D))), 'المقام المشترك ١٥.', '8Ae6')); }
  items.push(choice('لجمع كسرين جبريين مقاماهما مختلفان نبدأ بـ:', 'إيجاد مقام مشترك', ['جمع المقامين', 'ضرب البسطين', 'حذف الحروف'], 'كما في الكسور العددية.', '8Ae6'));
  { const [b] = fresh(() => [R(4, 9)]); items.push(num(`${fb('٣ع', b)} − ${fb('ع', b)} = ؟ع/${N(b)}. ما معامل ع في البسط؟`, 2, 'المقامان متساويان: اطرح البسطين.', '8Ae6')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'ألواح زهرة', icon: '🧮', who, rounds: 5, make, draw,
  intro: ['الكسر الجبري كسر فيه حرف، مثل س على ٤ (ربع س).', 'نجمعه كما نجمع الكسور: مقام مشترك أولاً، ثم البسط، ثم أبسط صورة.'],
  outro: ['امتلأت الألواح بكسور جبرية مبسطة!', 'لنختبر جمع الكسور الجبرية وطرحها بأسئلة متنوعة.'],
  challenge: { title: 'تحدي الكسور الجبرية', make: challenge }
});
export { make, challenge };
