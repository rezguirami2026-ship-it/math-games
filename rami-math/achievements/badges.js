// الأوسمة: تُكسب بالإتقان والمواظبة والمثابرة (لا بالسرعة). كل وسام له تقدّم ظاهر [الحالي، الهدف]، ويُفتح مرة واحدة عبر unlock().
// تُحسب من الحفظ نفسه (نجوم الدروس، سجل الأنشطة، المستوى) ومن عدادين في state.stats: persist (جولات أُكملت بعد خطأ) وstreak (أطول سلسلة).
import { game } from '../core/state.js';
import { ar } from '../core/util.js';
import { LESSONS, UNITS } from '../content/lessons.js';
import { levelOf } from '../core/levels.js';

const stars = (s, id) => ((s.quests && s.quests.data && s.quests.data[id]) || {}).stars || 0;
const allStars = s => LESSONS.reduce((a, l) => a + stars(s, l.id), 0);
const full = (s, ids) => ids.filter(id => stars(s, id) >= 3).length;
const plays = s => Object.values(s.activities || {}).reduce((a, r) => a + (r.plays || 0), 0);
const st = s => s.stats || {};
const UNIT_ICON = ['🔢', '📏', '⚓', '🏰', '🍲', '📊', '🧮', '🐪', '💎'];
const DOMAIN = [
  ['frac', '🍕', 'خبير الكسور', ['fractions', 'mixedNumbers', 'decimalFractions', 'fractionDiv', 'percentages', 'ratioProportion']],
  ['time', '⏰', 'سيد الوقت', ['timeTables', 'calendars', 'timeConvert', 'timeZones1', 'timeZones2', 'leapYears']],
  ['geo', '📐', 'مهندس الأشكال', ['shapesIdentify', 'shapes3D', 'nets', 'triangleAngles', 'classifyShapes', 'measureAngles', 'prisms', 'regularPolyhedra']],
  ['move', '🧭', 'سيد التحويلات', ['translation', 'reflection', 'rotation', 'coordinates', 'transformPolygons']],
  ['data', '📊', 'محلل البيانات الماهر', ['lineGraphs', 'pieCharts', 'statsAverage', 'usingStats', 'probabilityLang']],
  ['measure', '⚖️', 'خبير القياس', ['lengthMeasure', 'massCapacity1', 'massCapacity2', 'capacityMass', 'distance', 'areaPerimeterT1', 'areaPerimeter', 'rectangles', 'irregularShapes']]
];
export const BADGES = [
  { id: 'b_first3', icon: '🌟', name: 'الإتقان الأول', desc: 'ثلاث نجوم في درس لأول مرة', prog: s => [Math.min(1, full(s, LESSONS.map(l => l.id))), 1] },
  { id: 'b_stars30', icon: '✨', name: 'جامع النجوم', desc: 'اجمع ٣٠ نجمة في الدروس', prog: s => [allStars(s), 30] },
  { id: 'b_stars100', icon: '💫', name: 'سماء النجوم', desc: 'اجمع ١٠٠ نجمة في الدروس', prog: s => [allStars(s), 100] },
  { id: 'b_stars207', icon: '🌌', name: 'الإتقان الكامل', desc: 'ثلاث نجوم في الدروس الـ٦٩ كلها', prog: s => [allStars(s), 207] },
  { id: 'b_act10', icon: '🎲', name: 'لاعب نشيط', desc: 'العب ١٠ أنشطة', prog: s => [plays(s), 10] },
  { id: 'b_act40', icon: '🏅', name: 'المتدرب المجتهد', desc: 'العب ٤٠ نشاطاً', prog: s => [plays(s), 40] },
  { id: 'b_persist', icon: '💪', name: 'المثابر', desc: 'أكمل ٢٠ جولة بعد محاولة خاطئة (الخطأ طريق التعلم!)', prog: s => [st(s).persist || 0, 20] },
  { id: 'b_streak8', icon: '🔥', name: 'سلسلة النار', desc: '٨ إجابات صحيحة متتالية من المحاولة الأولى', prog: s => [Math.min(8, st(s).streak || 0), 8] },
  { id: 'b_expert1', icon: '🌟', name: 'الخبير', desc: 'انل أول نجمة ذهبية في تحدي الخبير', prog: s => [Math.min(1, Object.values(s.expert || {}).filter(e => e.gold).length), 1] },
  { id: 'b_expert10', icon: '⚡', name: 'الخبير الكبير', desc: '١٠ نجوم ذهبية في تحدي الخبير', prog: s => [Object.values(s.expert || {}).filter(e => e.gold).length, 10] },
  { id: 'b_treasure4', icon: '🗝️', name: 'صائد الكنوز', desc: 'افتح ٤ كنوز مخفية في العالم', prog: s => [Object.keys(s.treasure || {}).length, 4] },
  { id: 'b_treasure16', icon: '🏴‍☠️', name: 'مكتشف العالم', desc: 'افتح الكنوز المخفية الستة عشر كلها', prog: s => [Object.keys(s.treasure || {}).length, 16] },
  { id: 'b_daily3', icon: '📅', name: 'المواظب', desc: 'أنجز مهمة اليوم ٣ أيام متتالية', prog: s => [Math.min(3, (s.daily || {}).best || 0), 3] },
  { id: 'b_daily7', icon: '🗓️', name: 'أسبوع المثابرة', desc: 'أنجز مهمة اليوم ٧ أيام متتالية', prog: s => [Math.min(7, (s.daily || {}).best || 0), 7] },
  { id: 'b_lvl5', icon: '🛤️', name: 'نصف الطريق', desc: 'صل إلى المستوى ٥', prog: s => [Math.min(5, levelOf(s).n), 5] },
  { id: 'b_adv_rescue', icon: '🦸', name: 'حامي القرية', desc: 'أكمل مغامرة «إنقاذ القرية»', prog: s => [((s.adventures || {}).rescue || {}).done ? 1 : 0, 1] },
  { id: 'b_adv_storm', icon: '🌪️', name: 'بطل العاصفة', desc: 'أكمل مغامرة «العاصفة الكبرى»', prog: s => [((s.adventures || {}).storm || {}).done ? 1 : 0, 1] },
  { id: 'b_adv_island', icon: '🏝️', name: 'ناجي الجزيرة', desc: 'أكمل مغامرة «الجزيرة المفقودة»', prog: s => [((s.adventures || {}).island || {}).done ? 1 : 0, 1] },
  { id: 'b_adv_oldcity', icon: '🏛️', name: 'كاشف الأسرار', desc: 'أكمل مغامرة «سر المدينة القديمة»', prog: s => [((s.adventures || {}).oldcity || {}).done ? 1 : 0, 1] },
  { id: 'b_adv_desert', icon: '🏜️', name: 'دليل الصحراء', desc: 'أكمل مغامرة «مهمة في الصحراء»', prog: s => [((s.adventures || {}).desert || {}).done ? 1 : 0, 1] },
  { id: 'b_adv_castle', icon: '👑', name: 'بطل قرية الخير', desc: 'أكمل مغامرة «القلعة المظلمة»', prog: s => [((s.adventures || {}).castle || {}).done ? 1 : 0, 1] },
  { id: 'b_lvl10', icon: '👑', name: 'حكيم القرية', desc: 'صل إلى المستوى ١٠', prog: s => [levelOf(s).n, 10] },
  ...DOMAIN.map(([k, icon, name, ids]) => ({ id: 'b_' + k, icon, name, desc: `ثلاث نجوم في ${ids.length === 6 ? 'ستة' : ids.length === 5 ? 'خمسة' : ids.length === 8 ? 'ثمانية' : 'تسعة'} دروس من هذا المجال`, prog: s => [full(s, ids), ids.length] })),
  ...UNITS.map((u, i) => { const ids = LESSONS.filter(l => l.u === i).map(l => l.id); return { id: 'b_u' + i, icon: UNIT_ICON[i] || '⭐', name: `نجوم ${u.title}`, desc: `ثلاث نجوم في كل دروس وحدة ${u.title} (${u.term === 1 ? 'الفصل الأول' : 'الفصل الثاني'})`, prog: s => [full(s, ids), ids.length] }; })
];
// ألوان حيّة لكل وسام (تدرّج الميدالية)
const VIVID = [['#FF6B6B', '#C9184A'], ['#FFB627', '#E36414'], ['#4CC9F0', '#3A0CA3'], ['#7BE495', '#16803A'], ['#C77DFF', '#5A189A'], ['#FF8FAB', '#D6336C'], ['#2EC4B6', '#0B6E69'], ['#FFD60A', '#E85D04'], ['#4895EF', '#1D3557']];
BADGES.forEach((b, i) => { b.col = VIVID[i % VIVID.length]; });
/* بطاقة الوسام (تُستعمل في لوحة اللعبة والشاشة الرئيسية) */
export function badgeCard(b, s) {
  const [c, g] = b.prog(s), on = !!(s.achievements && s.achievements[b.id]), p = Math.min(1, c / g);
  return `<div class="bd ${on ? 'on' : ''}" style="--c1:${b.col[0]};--c2:${b.col[1]}"><span class="bdm"><i>${b.icon}</i>${on ? '' : '<em class="bdl">🔒</em>'}</span><b>${b.name}</b><small>${b.desc}</small>${on ? '<em class="bdok">✓ مكتسب</em>' : `<i class="bdp"><u style="width:${Math.round(p * 100)}%"></u></i><em class="bdn">${ar(Math.min(c, g))} / ${ar(g)}</em>`}</div>`;
}
/* يفحص كل الأوسمة ويفتح ما اكتمل (unlock يتجاهل المفتوح سابقاً) */
export function checkBadges(unlock) {
  const s = game.state; if (!s) return;
  BADGES.forEach(b => { if (s.achievements[b.id]) return; const [c, g] = b.prog(s); if (c >= g) unlock(b.id); });
}
