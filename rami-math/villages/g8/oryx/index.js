// قرية الوحدة الخامسة عشرة للصف الثامن: «محمية المها» (المخططات والجداول التكرارية) — بوحدات العالم المفتوح (بكسل).
// في الشمال: مركز الزوار غرباً ← حظيرة المها الكبيرة المسيّجة بأشجار الغاف والمها ترعى فيها ← حوض الماء ← برج المراقبة ← مشتل الغاف
// بصفوف شتلاته شرقاً. وجنوبها قرية حديثة، ونصب الدوّار تمثال مهاة عربية بقرنين طويلين.
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
].map((h, i) => ({ ...h, seed: 1321 + i * 61 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1290, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#4D7C0F', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + 4, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// مركز الزوار، وحظيرة المها، وحوض الماء، وبرج المراقبة، والمشتل
const CENTER = { x: 150, y: 180, w: 300, h: 140, H: 100, wall: '#F5EFE0', door: '#4D7C0F', style: 'shop', sign: 'مركز الزوار' };
const PEN = { x: 560, y: 170, w: 900, h: 330 };   // الحظيرة المسيّجة (يرى البطل المها من خلف السياج)
const ORYX = [[640, 260], [760, 330], [900, 240], [1040, 380], [1150, 280], [1290, 350], [1380, 230]];
const GHAF = [[620, 420], [980, 200], [1330, 440], [820, 450]];
const TROUGH = { x: 1180, y: 440, w: 120, h: 24 };
const WATCH = { x: 1600, y: 300, H: 170 };   // برج المراقبة الخشبي
const NURSERY = { x: 1760, y: 180, w: 520, h: 230 };   // مشتل الغاف
const PROM = { y0: 590, y1: 640 };
const STALLS = [[1060, 790, '#4D7C0F'], [2300, 790, '#B45309']];
const BANNERS = [[[150, 560], [520, 560]], [[1760, 560], [2200, 560]]];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 290, x1: 450, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 370, y: 1240, r: 175, island: 82 };
const FOUNT = [1930, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const SOUQ_PALMS = [[500, 400], [1540, 460], [2340, 450], [150, 760], [900, 780], [1940, 760]];
const PALMS = [
  ...[2340, 2200, 2060, 1920, 1780, 1640, 1500, 1360, 1220, 1080, 940, 800, 660, 140].filter(x => !avoid(x, [[160, 560]])).map(x => [x, 1172, 1]),
  ...[2340, 2200, 2060, 1920, 1780, 1220, 1080, 800, 660].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[254, y, 1], [506, y, 1]]),
  ...SOUQ_PALMS.map(([x, y]) => [x, y, .95])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[254, 940], [506, 940], [254, 1460], [506, 1460], [254, 1700], [506, 1700], [1400, 1300], [2100, 1180], [870, 1180], [520, 660], [1040, 660], [1560, 660], [2200, 660]];

const rect = (x, y, w, h) => ({ x, y, w, h });
// أكشاك الدروس: كشك بمظلة (قاعدته صلبة) وصاحبه بجانبه
const STATIONS = [
  { id: 'freqTable8', x: 300, y: 480, stand: { x: 300, y: 545 }, label: 'سجلّ الوزن', icon: '📒', col: '#4D7C0F', mh: 200 },
  { id: 'freqDiagram8', x: 750, y: 700, stand: { x: 750, y: 765 }, label: 'لوحة الزوار', icon: '📊', col: '#B45309', mh: 200 },
  { id: 'freqPolygon8', x: 2020, y: 480, stand: { x: 2020, y: 545 }, label: 'مشتل الغاف', icon: '🌱', col: '#15803D', mh: 200 },
  { id: 'lineGraphs8', x: 1300, y: 700, stand: { x: 1300, y: 765 }, label: 'سجل القطيع', icon: '📉', col: '#0F766E', mh: 200 },
  { id: 'compareDist8', x: 1720, y: 700, stand: { x: 1720, y: 765 }, label: 'تقرير المحمية', icon: '📝', col: '#7C2D12', mh: 200 }
];
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[1944, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1194, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1780, 1640, 60, 36], [530, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 540, y: 1176, lines: ['⬆ محمية المها', '➡ برج المراقبة', '➡ مشتل الغاف'] }, { x: 190, y: 1330, lines: ['⬆ مركز الزوار', '➡ المسجد'] }],
  mailboxes: villas, benches: [[2000, 1700], [1860, 1700], [1300, 1150], [780, 1150], [980, 540], [1500, 540]], rugs: [],
  sitters: [{ x: 2000, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#E5E5E5', elder: true } }, { x: 1860, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  pitch: [980, 1610, 240, 105],
  bike: { x0: 560, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 430, xDown: 330, col: '#4D7C0F', truck: true }, { from: 1760, to: 1440, xUp: 430, xDown: 330, col: '#B45309' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: المها ترعى وتمشي، وماء الحوض، وراية البرج
export default {
  id: 'oryx',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, CENTER, PEN, ORYX, GHAF, TROUGH, WATCH, NURSERY, PROM, STALLS, BANNERS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 370, y: 1740 },
  mood: { sky: '#A7D8F0', fog: '#EFE3CF', fogNear: 1800, fogFar: 5600, exposure: .98,
    hemi: ['#FFFFFF', '#9A8F7A', 1.25], sun: { color: '#FFF0D0', i: 2.4, dir: [-.45, 1, .6] }, accent: '#4D7C0F', sky2d: '#C4E4F4' },
  ambience: 'caravan', music: 'village',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    rect(CENTER.x, CENTER.y, CENTER.w, CENTER.h), rect(PEN.x, PEN.y, PEN.w, PEN.h), rect(NURSERY.x, NURSERY.y, NURSERY.w, NURSERY.h),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...STATIONS.map(q => rect(q.x - 52, q.y - 56, 104, 24)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    { x: WATCH.x, y: WATCH.y, r: 30 },
    ...BANNERS.flat().map(([x, y]) => ({ x, y, r: 5 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: STATIONS,
  people: [
    { id: 'salma8', x: 390, y: 510, look: { kind: 'woman', skin: '#C99A72', robe: '#4D7C0F', accent: '#FDE68A', hat: 'straw' } },
    { id: 'faisal', x: 840, y: 730, look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#B45309', beard: '#2B2118' } },
    { id: 'rashid8', x: 2110, y: 510, look: { kind: 'man', skin: '#C68A5B', robe: '#ECFCCB', accent: '#15803D', hat: 'straw', tool: 'hoe' } },
    { id: 'nasser8', x: 1390, y: 730, look: { kind: 'man', skin: '#B5835A', robe: '#E0F2FE', accent: '#0F766E', glasses: true } },
    { id: 'khawla', x: 1810, y: 730, look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FFFFFF', tall: true } }
  ],
  walkers: [
    { path: [[200, 615], [1100, 615]], look: { kind: 'girl', skin: '#C68A5B', robe: '#FB923C', accent: '#FFFFFF' } },
    { path: [[1400, 615], [2300, 615]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[600, 540], [1440, 540]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#4D7C0F' } },
    { path: [[2240, 1165], [600, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[2100, 1560], [1300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { freqTable8: () => import('./freqTable8.js'), freqDiagram8: () => import('./freqDiagram8.js'), freqPolygon8: () => import('./freqPolygon8.js'), lineGraphs8: () => import('./lineGraphs8.js'), compareDist8: () => import('./compareDist8.js') },
  adventure: () => import('./adventure.js'),   // «صغير المها التائه» بعد إنهاء الدروس الخمسة
  kit3d, kit2d
};
