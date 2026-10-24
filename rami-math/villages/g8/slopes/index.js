// قرية الوحدة الحادية عشرة للصف الثامن: «منحدرات التزلج» (الرسوم البيانية) — بوحدات العالم المفتوح (بكسل).
// منتجع التزلج على الرمل: في الشمال كثبان عالية عليها مسارات تزلج خشبية بميول مختلفة، ومصعد كراسٍ يصعد من الممشى إلى قمة الكثيب الكبير،
// واستراحة المنتجع، وبرج الإنقاذ، وكشك التذاكر، ولوحات الميل. وجنوبها قرية حديثة، ونصب الدوّار مستقيم ص = م س + جـ على شبكة.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';
import { lifeInit, lifeUpdate } from '../../street.js';

const W = 2400, H = 1800, YARD = 820, TOP = 120;
const HOUSE_SPECS = [
  { x: 2120, y: 880, w: 200, h: 120, kind: 'villa' }, { x: 1860, y: 880, w: 190, h: 160, kind: 'court' }, { x: 1590, y: 870, w: 190, h: 120, kind: 'step' }, { x: 1300, y: 880, w: 210, h: 110, kind: 'villa' },
  { x: 1030, y: 880, w: 190, h: 120, kind: 'L' }, { x: 760, y: 880, w: 190, h: 115, kind: 'villa' }, { x: 540, y: 880, w: 170, h: 115, kind: 'step' }, { x: 20, y: 880, w: 160, h: 115, kind: 'villa' },
  { x: 2120, y: 1360, w: 190, h: 115, kind: 'L' }, { x: 1830, y: 1360, w: 200, h: 120, kind: 'villa' }, { x: 1570, y: 1360, w: 190, h: 160, kind: 'court' }, { x: 1010, y: 1360, w: 190, h: 115, kind: 'villa' },
  { x: 750, y: 1360, w: 190, h: 120, kind: 'step' }, { x: 10, y: 1360, w: 150, h: 115, kind: 'villa' },
  { x: 2080, y: 1600, w: 200, h: 110, kind: 'villa' }, { x: 1570, y: 1600, w: 190, h: 115, kind: 'L' }, { x: 1280, y: 1600, w: 200, h: 110, kind: 'villa' }, { x: 680, y: 1600, w: 200, h: 110, kind: 'step' }, { x: 20, y: 1600, w: 160, h: 115, kind: 'L' }
].map((h, i) => ({ ...h, seed: 1031 + i * 43 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1290, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#0369A1', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + 4, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// الكثبان شمالاً (صلبة)، ومسارات التزلج عليها، ومصعد الكراسي، والاستراحة، وبرج الإنقاذ
const DUNES = [[120, 120, 520, 230, 120], [600, 110, 640, 260, 150], [1300, 120, 560, 220, 110], [1900, 115, 440, 200, 100]];   // [س، ص، عرض، عمق، ارتفاع]
const RUNS = [[260, 300, 360, 540, '#B45309'], [820, 330, 900, 540, '#0369A1'], [1050, 320, 1000, 540, '#DC2626'], [1560, 300, 1680, 520, '#15803D']];   // مسار: من القمة (س١، ص١) إلى القاعدة (س٢، ص٢)
const LIFT = { x0: 1200, y0: 560, x1: 980, y1: 250, n: 5 };   // مصعد الكراسي: من القاعدة إلى القمة
const LODGE = { x: 1780, y: 330, w: 320, h: 140, H: 110, wall: '#FEF3C7', door: '#0369A1', style: 'shop', sign: 'استراحة المنتجع' };
const RESCUE = { x: 2230, y: 420 };   // برج الإنقاذ
const PROM = { y0: 590, y1: 640 };
const STALLS = [[1340, 790, '#0369A1'], [2310, 790, '#F59E0B']];
const BANNERS = [[[150, 560], [700, 560]], [[1700, 560], [2160, 560]]];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 290, x1: 450, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 370, y: 1240, r: 175, island: 82 };
const FOUNT = [1930, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const SOUQ_PALMS = [[1240, 440], [2340, 330], [150, 760], [1050, 790], [1960, 780], [700, 790]];
const PALMS = [
  ...[2340, 2200, 2060, 1920, 1780, 1640, 1500, 1360, 1220, 1080, 940, 800, 660, 140].filter(x => !avoid(x, [[160, 560]])).map(x => [x, 1172, 1]),
  ...[2340, 2200, 2060, 1920, 1780, 1220, 1080, 800, 660].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[254, y, 1], [506, y, 1]]),
  ...SOUQ_PALMS.map(([x, y]) => [x, y, .95])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[254, 940], [506, 940], [254, 1460], [506, 1460], [254, 1700], [506, 1700], [1400, 1300], [2100, 1180], [870, 1180], [420, 680], [1020, 660], [1680, 680], [2000, 640]];

const rect = (x, y, w, h) => ({ x, y, w, h });
// أكشاك الدروس: كشك بمظلة (قاعدته صلبة) وصاحبه بجانبه
const STATIONS = [
  { id: 'midpoint8', x: 250, y: 720, stand: { x: 250, y: 785 }, label: 'محطة المنتصف', icon: '📍', col: '#B45309', mh: 200 },
  { id: 'gradient8', x: 560, y: 520, stand: { x: 560, y: 585 }, label: 'لوحة الميل', icon: '📐', col: '#0369A1', mh: 200 },
  { id: 'lineEq8', x: 870, y: 720, stand: { x: 870, y: 785 }, label: 'إشارات المسارات', icon: '🪧', col: '#DC2626', mh: 200 },
  { id: 'lineGraph8', x: 1180, y: 720, stand: { x: 1180, y: 785 }, label: 'رسّام المسارات', icon: '✏️', col: '#7C3AED', mh: 200 },
  { id: 'simulGraph8', x: 1520, y: 520, stand: { x: 1520, y: 585 }, label: 'تقاطع المسارين', icon: '🛟', col: '#15803D', mh: 200 },
  { id: 'directProp8', x: 1840, y: 720, stand: { x: 1840, y: 785 }, label: 'عدّاد التذاكر', icon: '🎟️', col: '#F59E0B', mh: 200 },
  { id: 'practicalGraph8', x: 2140, y: 680, stand: { x: 2140, y: 745 }, label: 'منحنى الرحلة', icon: '📈', col: '#0F766E', mh: 200 }
];
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[1944, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1194, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1780, 1640, 60, 36], [530, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 540, y: 1176, lines: ['⬆ منحدرات التزلج', '➡ مصعد الكراسي', '➡ الاستراحة'] }, { x: 190, y: 1330, lines: ['⬆ الكثبان', '➡ المسجد'] }],
  mailboxes: villas, benches: [[2000, 1700], [1860, 1700], [1300, 1150], [780, 1150], [1000, 480], [1660, 520]], rugs: [],
  sitters: [{ x: 2000, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#E5E5E5', elder: true } }, { x: 1860, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  pitch: [980, 1610, 240, 105],
  bike: { x0: 560, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 430, xDown: 330, col: '#0369A1', truck: true }, { from: 1760, to: 1440, xUp: 430, xDown: 330, col: '#B45309' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: كراسي المصعد، والمتزلجون على المسارات، وراية البرج
export default {
  id: 'slopes',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, DUNES, RUNS, LIFT, LODGE, RESCUE, PROM, STALLS, BANNERS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 370, y: 1740 },
  mood: { sky: '#A7D8F0', fog: '#EFE3CF', fogNear: 1800, fogFar: 5600, exposure: .98,
    hemi: ['#FFFFFF', '#9A8F7A', 1.25], sun: { color: '#FFF0D0', i: 2.4, dir: [-.45, 1, .6] }, accent: '#0369A1', sky2d: '#BFE6F8' },
  ambience: 'caravan', music: 'village',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...DUNES.map(([x, y, w, d]) => rect(x, y, w, d)), rect(LODGE.x, LODGE.y, LODGE.w, LODGE.h),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...STATIONS.map(q => rect(q.x - 52, q.y - 56, 104, 24)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    { x: RESCUE.x, y: RESCUE.y, r: 30 }, ...Array.from({ length: LIFT.n }, (_, k) => ({ x: LIFT.x0 + (LIFT.x1 - LIFT.x0) * k / (LIFT.n - 1), y: LIFT.y0 + (LIFT.y1 - LIFT.y0) * k / (LIFT.n - 1), r: 10 })).filter(o => o.y > 360),
    ...BANNERS.flat().map(([x, y]) => ({ x, y, r: 5 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: STATIONS,
  people: [
    { id: 'lamya', x: 340, y: 750, look: { kind: 'woman', skin: '#C99A72', robe: '#B45309', accent: '#FDE68A' } },
    { id: 'khalil', x: 650, y: 550, look: { kind: 'man', skin: '#A8764E', robe: '#E0F2FE', accent: '#0369A1', hat: 'cap' } },
    { id: 'saif', x: 960, y: 750, look: { kind: 'man', skin: '#C68A5B', robe: '#FEE2E2', accent: '#DC2626', hat: 'cap', vest: '#B91C1C' } },
    { id: 'dana', x: 1270, y: 750, look: { kind: 'woman', skin: '#B5835A', robe: '#5B21B6', accent: '#FACC15', glasses: true } },
    { id: 'majid', x: 1610, y: 550, look: { kind: 'man', skin: '#A8764E', robe: '#FDE047', accent: '#DC2626', vest: '#DC2626', tall: true } },
    { id: 'ramiz', x: 1930, y: 750, look: { kind: 'boy', skin: '#C68A5B', robe: '#F7F5EF', accent: '#F59E0B', tall: true } },
    { id: 'yousef8', x: 2230, y: 710, look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#2B2118' } }
  ],
  walkers: [
    { path: [[200, 615], [1100, 615]], look: { kind: 'girl', skin: '#C68A5B', robe: '#FB923C', accent: '#FFFFFF' } },
    { path: [[1400, 615], [2300, 615]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[1700, 500], [2300, 500]], look: { kind: 'woman', skin: '#B5835A', robe: '#1F2937', accent: '#F59E0B' } },
    { path: [[2240, 1165], [600, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[2100, 1560], [1300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { midpoint8: () => import('./midpoint8.js'), gradient8: () => import('./gradient8.js'), lineEq8: () => import('./lineEq8.js'), lineGraph8: () => import('./lineGraph8.js'), simulGraph8: () => import('./simulGraph8.js'), directProp8: () => import('./directProp8.js'), practicalGraph8: () => import('./practicalGraph8.js') },
  adventure: () => import('./adventure.js'),   // «تلفريك الواحة» بعد إنهاء الدروس السبعة
  kit3d, kit2d
};
