// قرية الوحدة السابعة للصف الثامن: «مهرجان الألعاب» (الاحتمالات) — بوحدات العالم المفتوح (بكسل).
// ساحة المهرجان في الشمال: المسرح بأضوائه ولوحة التوقعات غرباً ← الدوّامة بخيولها ← العجلة الدوّارة الكبيرة في الوسط ←
// الخيمة الكبيرة المخططة ← برج الأرجوحة شرقاً؛ وبينها ممشى مبلّط تحت حبال الرايات وأكشاك الألعاب (البطاقات، النردان، مختبر الرمي)
// وعربات الحلوى والبالونات. وجنوبها قرية حديثة شارعها الكبير في أقصى الغرب، ونصب الدوّار حجرا نرد كبيران.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';
import { lifeInit, lifeUpdate } from '../../street.js';

const W = 2400, H = 1800, YARD = 820, TOP = 120;
const HOUSE_SPECS = [
  { x: 2120, y: 880, w: 200, h: 120, kind: 'step' }, { x: 1860, y: 880, w: 190, h: 115, kind: 'villa' }, { x: 1590, y: 870, w: 190, h: 170, kind: 'court' }, { x: 1300, y: 880, w: 210, h: 110, kind: 'L' },
  { x: 1030, y: 880, w: 190, h: 120, kind: 'villa' }, { x: 760, y: 880, w: 190, h: 115, kind: 'step' }, { x: 540, y: 880, w: 170, h: 115, kind: 'villa' }, { x: 20, y: 880, w: 160, h: 115, kind: 'villa' },
  { x: 2120, y: 1360, w: 190, h: 115, kind: 'villa' }, { x: 1830, y: 1360, w: 200, h: 160, kind: 'court' }, { x: 1570, y: 1360, w: 190, h: 120, kind: 'L' }, { x: 1010, y: 1360, w: 190, h: 115, kind: 'step' },
  { x: 750, y: 1360, w: 190, h: 120, kind: 'villa' }, { x: 10, y: 1360, w: 150, h: 115, kind: 'villa' },
  { x: 2080, y: 1600, w: 200, h: 110, kind: 'L' }, { x: 1570, y: 1600, w: 190, h: 115, kind: 'villa' }, { x: 1280, y: 1600, w: 200, h: 110, kind: 'step' }, { x: 680, y: 1600, w: 200, h: 110, kind: 'L' }, { x: 20, y: 1600, w: 160, h: 115, kind: 'villa' }
].map((h, i) => ({ ...h, seed: 811 + i * 29 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1290, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#B91C1C', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + 4, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// ساحة المهرجان
const STAGE = { x: 140, y: 170, w: 300, h: 120, H: 54 };   // المسرح: منصة بخلفية وأضواء
const CAROUSEL = { x: 700, y: 380, r: 100 };   // الدوّامة
const WHEEL = { x: 1230, y: 470, r: 175, hub: 215 };   // العجلة الدوّارة: y خط القاعدة، hub ارتفاع المحور
const TENT = { x: 1880, y: 320, r: 128 };   // الخيمة الكبيرة
const SWING = { x: 2190, y: 520, r: 84, H: 190 };   // برج الأرجوحة
const PROM = { y0: 560, y1: 610 };   // الممشى المبلّط الشرقي الغربي
const STALLS = [[560, 800, '#DB2777'], [1180, 790, '#F59E0B'], [1730, 800, '#7C3AED'], [2300, 790, '#0EA5E9']];   // عربات الحلوى والفشار
const BALLOONS = [[1060, 640], [2250, 700]];
const STRINGS = [[[150, 520], [640, 520]], [[760, 520], [1080, 520]], [[1380, 520], [1720, 520]], [[1840, 520], [2300, 520]], [[300, 680], [800, 700]], [[1300, 690], [1760, 690]]];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 290, x1: 450, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 370, y: 1240, r: 175, island: 82 };
const FOUNT = [1930, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const FAIR_PALMS = [[160, 420], [160, 760], [960, 230], [1520, 230], [2090, 210], [2330, 360], [1480, 760], [880, 780], [2330, 640]];
const PALMS = [
  ...[2340, 2200, 2060, 1920, 1780, 1640, 1500, 1360, 1220, 1080, 940, 800, 660, 140].filter(x => !avoid(x, [[160, 560]])).map(x => [x, 1172, 1]),
  ...[2340, 2200, 2060, 1920, 1780, 1220, 1080, 800, 660].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[254, y, 1], [506, y, 1]]),
  ...FAIR_PALMS.map(([x, y]) => [x, y, .95])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[254, 940], [506, 940], [254, 1460], [506, 1460], [254, 1700], [506, 1700], [1400, 1300], [2100, 1180], [870, 1180], [600, 640], [1460, 640], [1900, 640]];

const rect = (x, y, w, h) => ({ x, y, w, h });
// أكشاك الدروس: كشك بمظلة مخططة (قاعدته صلبة) وصاحبه بجانبه
const STATIONS = [
  { id: 'notHappen8', x: 330, y: 470, stand: { x: 330, y: 535 }, label: 'لوحة التوقعات', icon: '📊', col: '#2563EB', mh: 200 },
  { id: 'equallyLikely8', x: 920, y: 700, stand: { x: 920, y: 765 }, label: 'كشك البطاقات', icon: '🃏', col: '#DB2777', mh: 200 },
  { id: 'sampleSpace8', x: 1560, y: 700, stand: { x: 1560, y: 765 }, label: 'طاولة النردين', icon: '🎲', col: '#16A34A', mh: 200 },
  { id: 'expTheory8', x: 2040, y: 720, stand: { x: 2040, y: 785 }, label: 'مختبر الرمي', icon: '🧪', col: '#7C3AED', mh: 200 }
];
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[1944, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1194, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1780, 1640, 60, 36], [530, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 540, y: 1176, lines: ['⬆ المهرجان', '➡ العجلة الدوّارة', '⬅ المسرح'] }, { x: 190, y: 1330, lines: ['⬆ الدوّامة', '➡ المسجد'] }],
  mailboxes: villas, benches: [[2000, 1700], [1860, 1700], [1300, 1150], [780, 1150]], rugs: [],
  sitters: [{ x: 2000, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#B91C1C', beard: '#E5E5E5', elder: true } }, { x: 1860, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#1E3A8A', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  pitch: [980, 1610, 240, 105],
  bike: { x0: 560, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 430, xDown: 330, col: '#DB2777', truck: true }, { from: 1760, to: 1440, xUp: 430, xDown: 330, col: '#7C3AED' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: دوران العجلة والدوّامة والأرجوحة، وأضواء المسرح
export default {
  id: 'fair',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, STAGE, CAROUSEL, WHEEL, TENT, SWING, PROM, STALLS, BALLOONS, STRINGS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 370, y: 1740 },
  mood: { sky: '#9DD3F2', fog: '#EADFD0', fogNear: 1800, fogFar: 5600, exposure: .98,
    hemi: ['#FFFFFF', '#9A8F7A', 1.25], sun: { color: '#FFF2D6', i: 2.4, dir: [-.45, 1, .6] }, accent: '#DB2777', sky2d: '#BFE3F5' },
  ambience: 'festival', music: 'festival',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    rect(STAGE.x, STAGE.y, STAGE.w, STAGE.h), rect(WHEEL.x - 120, WHEEL.y - 40, 240, 44),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...STATIONS.map(q => rect(q.x - 52, q.y - 56, 104, 24)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    { x: CAROUSEL.x, y: CAROUSEL.y, r: CAROUSEL.r + 6 }, { x: TENT.x, y: TENT.y, r: TENT.r + 4 }, { x: SWING.x, y: SWING.y, r: 34 },
    ...BALLOONS.map(([x, y]) => ({ x, y, r: 12 })), ...STRINGS.flat().map(([x, y]) => ({ x, y, r: 5 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: STATIONS,
  people: [
    { id: 'haitham', x: 420, y: 500, look: { kind: 'man', skin: '#C68A5B', robe: '#F8FAFC', accent: '#2563EB', hat: 'cap', vest: '#1D4ED8' } },
    { id: 'farida', x: 1010, y: 730, look: { kind: 'woman', skin: '#B5835A', robe: '#9D174D', accent: '#FDE68A' } },
    { id: 'muhannad', x: 1650, y: 730, look: { kind: 'boy', skin: '#A8764E', robe: '#F7F5EF', accent: '#16A34A', tall: true } },
    { id: 'sanaa', x: 2130, y: 750, look: { kind: 'girl', skin: '#C99A72', robe: '#5B21B6', accent: '#FFFFFF', glasses: true, tall: true } }
  ],
  walkers: [
    { path: [[200, 585], [1100, 585]], look: { kind: 'girl', skin: '#C68A5B', robe: '#F472B6', accent: '#FFFFFF' } },
    { path: [[1400, 585], [2300, 585]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[560, 250], [560, 700]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#DB2777' } },
    { path: [[2240, 1165], [600, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[2100, 1560], [1300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { notHappen8: () => import('./notHappen8.js'), equallyLikely8: () => import('./equallyLikely8.js'), sampleSpace8: () => import('./sampleSpace8.js'), expTheory8: () => import('./expTheory8.js') },
  adventure: () => import('./adventure.js'),   // «لغز صانع الألعاب» بعد إنهاء الدروس الأربعة
  kit3d, kit2d
};
