// قرية الوحدة الأولى للصف الثامن: «منجم الأعماق» (الأعداد الصحيحة والقوى والجذور) — بوحدات العالم المفتوح (بكسل).
// من الجنوب إلى الشمال: بوابة القرية ← حارات بيوت عُمانية ومسجد بمئذنة وسوق صغير وساحة بئر ونخيل ← ساحة المنجم (سكك وعربات
// وأكوام خام وبرج الرفع فوق البئر) ← الجبل وفي أسفله كهف البلّور وكهف التضاعف والبوابة الكبرى المنحوتة.
// لكل درس محطة (معرّفها = معرّف الدرس) ومعها صاحبها من أهل المنجم، والمهام في ملفات الدروس تُحمَّل عند فتح محطتها.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';

const W = 2400, H = 1800, CLIFF = 430, YARD = 800;
// البيوت الحديثة الملوّنة (villages/houses.js): الشكل والموضع، والألوان من البذرة. villa بحديقة أمامية، L بجناح، step بطابق متراجع، court بفناء
const HOUSE_SPECS = [
  { x: 90, y: 870, w: 190, h: 120, kind: 'villa' }, { x: 360, y: 870, w: 220, h: 110, kind: 'L' }, { x: 1480, y: 880, w: 180, h: 120, kind: 'step' },
  { x: 1740, y: 870, w: 180, h: 170, kind: 'court' }, { x: 2020, y: 870, w: 200, h: 120, kind: 'villa' },
  { x: 120, y: 1360, w: 190, h: 160, kind: 'court' }, { x: 400, y: 1360, w: 190, h: 115, kind: 'villa' }, { x: 1560, y: 1360, w: 200, h: 110, kind: 'L' },
  { x: 1820, y: 1360, w: 190, h: 120, kind: 'step' }, { x: 2100, y: 1360, w: 180, h: 110, kind: 'villa' },
  { x: 250, y: 1600, w: 190, h: 110, kind: 'step' }, { x: 540, y: 1600, w: 190, h: 105, kind: 'villa' }, { x: 1650, y: 1600, w: 200, h: 100, kind: 'L' }, { x: 1930, y: 1600, w: 190, h: 150, kind: 'court' }
].map((h, i) => ({ ...h, seed: 11 + i * 7 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 640, y: 880, w: 210, h: 140, wall: '#F3EEE3', door: '#7A4A2A', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + MOSQUE.w - 34, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };   // المئذنة على ركن السطح الأمامي (كمسجد القرية في العالم المفتوح)
const STALLS = [[1340, 1150, '#C2410C'], [1440, 1150, '#0E7490'], [1540, 1150, '#7C3AED'], [1640, 1150, '#B45309'], [1340, 1290, '#15803D'], [1440, 1290, '#BE185D']];
const WELL = { x: 1150, y: 1235, r: 44 };
const PALMS = [[1010, 1150, 1.05], [1300, 1175, .95], [1000, 1330, 1], [1310, 1330, 1.1], [560, 1090, 1], [300, 1100, .9], [1950, 1110, 1.05], [2250, 1180, .95],
  [700, 1500, 1], [880, 1700, 1.1], [1430, 1520, .95], [2250, 1530, 1], [80, 1700, .9], [2330, 960, 1], [960, 860, .9], [1380, 860, 1]];
const inside = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const PALMS_OK = PALMS.filter(([x, y]) => !inside(x, y));
const LAMPS = [[1065, 830], [1235, 830], [1065, 1010], [1235, 1010], [1065, 1470], [1235, 1470], [1065, 1700], [1235, 1700]];
// ساحة المنجم: سكك من الكهوف إلى برج الرفع، عربات، وأكوام خام
const CAVES = [{ id: 'crystal', x: 600, w: 170 }, { id: 'doubling', x: 1450, w: 170 }, { id: 'gate', x: 2000, w: 230 }];
const RAILS = [[[600, CLIFF + 20], [600, 640], [1100, 640]], [[1450, CLIFF + 20], [1450, 640], [1200, 640]], [[2000, CLIFF + 40], [2000, 700], [1260, 700]]];
const CARTS = [[760, 640, '#C98A3B'], [1330, 640, '#7FD3FF'], [1700, 700, '#B28CFF']];
const ORE = [[300, 560, '#C98A3B'], [380, 620, '#7A6B5C'], [1800, 560, '#7FD3FF'], [2250, 620, '#C98A3B'], [900, 520, '#B28CFF']];

const rect = (x, y, w, h) => ({ x, y, w, h });
export default {
  id: 'mine',
  size: { w: W, h: H }, CLIFF, YARD,
  HOMES, MOSQUE, MINARET, STALLS, WELL, PALMS: PALMS_OK, LAMPS, CAVES, RAILS, CARTS, ORE,
  start: { x: 1150, y: 1720 },
  mood: { sky: '#9CCBEF', fog: '#D6E9F7', fogNear: 1800, fogFar: 5600, exposure: .95,
    hemi: ['#FFFFFF', '#B08A60', 1.25], sun: { color: '#FFF1D6', i: 2.4, dir: [-.45, 1, .6] }, accent: '#FFC94A', sky2d: '#B9DCF5' },
  ambience: 'village', music: 'village',
  // التصادم: الجبل والمباني والأكشاك والبئر وبرج الرفع، والدوائر للنخيل والعربات وأكوام الخام والأعمدة
  solids: [
    rect(0, 0, W, CLIFF),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), rect(WELL.x - WELL.r, WELL.y - 22, WELL.r * 2, 26),
    rect(1090, 600, 120, 50)   // بئر المنجم تحت برج الرفع
  ],
  obstacles: [...PALMS_OK.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...CARTS.map(([x, y]) => ({ x, y, r: 22 })), ...ORE.map(([x, y]) => ({ x, y, r: 26 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  // المحطات: معرّف الدرس، موضعها (أسفل المعلم)، وأين يقف البطل، وارتفاع علامة الهدف
  stations: [
    { id: 'directed8', x: 1150, y: 655, stand: { x: 1150, y: 735 }, label: 'مصعد المنجم', icon: '🛗', kind: 'elevator', mh: 300 },
    { id: 'roots8', x: 600, y: CLIFF + 40, stand: { x: 600, y: CLIFF + 110 }, label: 'كهف البلّور', icon: '💎', kind: 'crystals', mh: 230 },
    { id: 'indices8', x: 1450, y: CLIFF + 40, stand: { x: 1450, y: CLIFF + 110 }, label: 'كهف التضاعف', icon: '✨', kind: 'doubler', mh: 230 },
    { id: 'useIndices8', x: 2000, y: CLIFF + 50, stand: { x: 2000, y: CLIFF + 130 }, label: 'بوابة القوانين', icon: '🚪', kind: 'gate', mh: 300 }
  ],
  // أهل المنجم: كل واحد بجانب محطة درسه (يلتفت إلى البطل، ومنه فقاعة الكلام)
  people: [
    { id: 'saleh', x: 1240, y: 730, look: { kind: 'man', skin: '#B5835A', robe: '#5E5040', accent: '#E3B04B', hat: 'cap', vest: '#C9772E', beard: '#2B2118', tool: 'hoe' } },
    { id: 'maryam', x: 690, y: CLIFF + 100, look: { kind: 'woman', skin: '#C99A72', robe: '#3E5C76', accent: '#E3B04B', vest: '#C9772E' } },
    { id: 'noura', x: 1540, y: CLIFF + 100, look: { kind: 'woman', skin: '#B88660', robe: '#4B2E6B', accent: '#FFC94A', elder: true, glasses: true } },
    { id: 'hamdan', x: 2110, y: CLIFF + 120, look: { kind: 'man', skin: '#A8764E', robe: '#F2EEE4', accent: '#8C1C2B', beard: '#1C1410', tall: 1.05, build: 1.1 } }
  ],
  // أهل القرية يمشون بين هذه النقاط (حياة في الحارات والسوق)
  walkers: [
    { path: [[1075, 900], [1075, 1700]], look: { kind: 'man', skin: '#B07A50', robe: '#F4F1E8', accent: '#2F6FB2' } },
    { path: [[1380, 1220], [1900, 1220], [1900, 1300], [1380, 1300]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[300, 1250], [950, 1250]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } },
    { path: [[1250, 1565], [2050, 1565]], look: { kind: 'girl', skin: '#C68A5B', robe: '#D85C7B', accent: '#E3B04B' } },
    { path: [[400, 700], [900, 700], [900, 560]], look: { kind: 'man', skin: '#A8764E', robe: '#6B5A48', accent: '#E3B04B', hat: 'cap', vest: '#C9772E' } },
    { path: [[1600, 760], [2200, 760]], look: { kind: 'man', skin: '#B88660', robe: '#5E5040', accent: '#E3B04B', hat: 'cap', vest: '#E3B04B' } }
  ],
  lessons: {   // مهمة كل درس تُحمَّل عند فتح محطتها
    directed8: () => import('./directed8.js'), roots8: () => import('./roots8.js'),
    indices8: () => import('./indices8.js'), useIndices8: () => import('./useIndices8.js')
  },
  adventure: () => import('./adventure.js'),   // مغامرة الوحدة بعد إنهاء الدروس الأربعة
  kit3d, kit2d
};
