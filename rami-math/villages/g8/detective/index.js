// قرية الوحدة العاشرة للصف الثامن: «مكتب المحقق» (المعادلات والمتباينات) — بوحدات العالم المفتوح (بكسل).
// في الشمال حيّ قديم: مكتب المحقق بمصباحه الأزرق غرباً (لوح الأدلة) ← مقهى الشهود بمظلاته ← المحكمة بأعمدتها ← متحف القرية وخزنته
// ← برج المراقبة شرقاً وساحة مطوّقة بشريط أصفر حول قاعدة الجرّة المسروقة. وجنوبها قرية حديثة، ونصب الدوّار عدسة مكبّرة كبيرة.
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
].map((h, i) => ({ ...h, seed: 977 + i * 41 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1290, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#1E3A8A', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + 4, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// الحي القديم: مكتب المحقق، ومقهى الشهود، والمحكمة، والمتحف، وبرج المراقبة، وساحة الشريط الأصفر
const HQ = { x: 150, y: 170, w: 300, h: 150, H: 140, wall: '#DBEAFE', door: '#1E3A8A', style: 'shop', sign: 'مكتب المحقق' };
const CAFE = { x: 540, y: 190, w: 230, h: 120, H: 96, wall: '#FDE68A', door: '#92400E', style: 'shop', sign: 'مقهى الشهود' };
const TABLES = [[580, 380], [700, 380]];   // طاولتا المقهى بمظلتين
const COURT = { x: 880, y: 160, w: 360, h: 170, H: 150, wall: '#F5F5F4', door: '#78350F', style: 'shop', sign: 'المحكمة' };
const MUSEUM = { x: 1360, y: 170, w: 380, h: 160, H: 130, wall: '#E7E5E4', door: '#334155', style: 'shop', sign: 'متحف القرية' };
const TOWER = { x: 1960, y: 380, r: 44, H: 240 };   // برج المراقبة
const SCENE = { x: 2080, y: 200, w: 240, h: 150 };   // ساحة الشريط الأصفر وقاعدة الجرّة الفارغة
const PROM = { y0: 590, y1: 640 };
const STALLS = [[560, 760, '#1E3A8A'], [1060, 780, '#B45309'], [1500, 790, '#15803D'], [2300, 780, '#7C3AED']];
const BANNERS = [[[500, 560], [820, 560]], [[1300, 560], [1800, 560]]];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 290, x1: 450, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 370, y: 1240, r: 175, island: 82 };
const FOUNT = [1930, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const SOUQ_PALMS = [[480, 300], [820, 300], [1290, 420], [1800, 330], [2340, 420], [150, 760], [900, 780], [1940, 760]];
const PALMS = [
  ...[2340, 2200, 2060, 1920, 1780, 1640, 1500, 1360, 1220, 1080, 940, 800, 660, 140].filter(x => !avoid(x, [[160, 560]])).map(x => [x, 1172, 1]),
  ...[2340, 2200, 2060, 1920, 1780, 1220, 1080, 800, 660].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[254, y, 1], [506, y, 1]]),
  ...SOUQ_PALMS.map(([x, y]) => [x, y, .95])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[254, 940], [506, 940], [254, 1460], [506, 1460], [254, 1700], [506, 1700], [1400, 1300], [2100, 1180], [870, 1180], [480, 680], [1000, 680], [1640, 680], [2000, 680]];

const rect = (x, y, w, h) => ({ x, y, w, h });
// أكشاك الدروس: كشك بمظلة (قاعدته صلبة) وصاحبه بجانبه
const STATIONS = [
  { id: 'linearEq8', x: 300, y: 470, stand: { x: 300, y: 535 }, label: 'لوح الأدلة', icon: '📌', col: '#1E3A8A', mh: 200 },
  { id: 'eqProblems8', x: 650, y: 500, stand: { x: 650, y: 565 }, label: 'ألغاز الأرقام', icon: '🧩', col: '#B45309', mh: 200 },
  { id: 'simulSub8', x: 1060, y: 480, stand: { x: 1060, y: 545 }, label: 'الشاهدان', icon: '🗣️', col: '#78350F', mh: 200 },
  { id: 'simulElim8', x: 1550, y: 480, stand: { x: 1550, y: 545 }, label: 'الخزنة ذات القفلين', icon: '🔐', col: '#334155', mh: 200 },
  { id: 'inequalities8', x: 2140, y: 500, stand: { x: 2140, y: 565 }, label: 'خط الأعداد السري', icon: '📏', col: '#7C3AED', mh: 200 }
];
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[1944, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1194, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1780, 1640, 60, 36], [530, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 540, y: 1176, lines: ['⬆ مكتب المحقق', '➡ المحكمة', '➡ متحف القرية'] }, { x: 190, y: 1330, lines: ['⬆ الحي القديم', '➡ المسجد'] }],
  mailboxes: villas, benches: [[2000, 1700], [1860, 1700], [1300, 1150], [780, 1150], [1250, 480], [1820, 500]], rugs: [],
  sitters: [{ x: 2000, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#E5E5E5', elder: true } }, { x: 1860, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  pitch: [980, 1610, 240, 105],
  bike: { x0: 560, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 430, xDown: 330, col: '#1E3A8A', truck: true }, { from: 1760, to: 1440, xUp: 430, xDown: 330, col: '#B45309' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: مصباح المكتب الأزرق، وكشاف البرج، وتموج الشريط
export default {
  id: 'detective',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, HQ, CAFE, TABLES, COURT, MUSEUM, TOWER, SCENE, PROM, STALLS, BANNERS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 370, y: 1740 },
  mood: { sky: '#A7D8F0', fog: '#EFE3CF', fogNear: 1800, fogFar: 5600, exposure: .98,
    hemi: ['#FFFFFF', '#9A8F7A', 1.25], sun: { color: '#FFF0D0', i: 2.4, dir: [-.45, 1, .6] }, accent: '#1E3A8A', sky2d: '#C4E0F2' },
  ambience: 'fort', music: 'village',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...[HQ, CAFE, COURT, MUSEUM].map(b => rect(b.x, b.y, b.w, b.h)), rect(SCENE.x + 70, SCENE.y + 40, 100, 70),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...STATIONS.map(q => rect(q.x - 52, q.y - 56, 104, 24)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    { x: TOWER.x, y: TOWER.y, r: TOWER.r + 4 }, ...TABLES.map(([x, y]) => ({ x, y, r: 22 })), ...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => ({ x: SCENE.x + a * SCENE.w, y: SCENE.y + b * SCENE.h, r: 6 })),
    ...BANNERS.flat().map(([x, y]) => ({ x, y, r: 5 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: STATIONS,
  people: [
    { id: 'fahad', x: 390, y: 500, look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#1E3A8A', beard: '#2B2118', glasses: true } },
    { id: 'hanan', x: 740, y: 530, look: { kind: 'woman', skin: '#C99A72', robe: '#92400E', accent: '#FDE68A', glasses: true } },
    { id: 'jasim', x: 1150, y: 510, look: { kind: 'man', skin: '#C68A5B', robe: '#E0E7FF', accent: '#1E40AF', hat: 'cap', vest: '#1E3A8A' } },
    { id: 'nada', x: 1640, y: 510, look: { kind: 'woman', skin: '#B5835A', robe: '#334155', accent: '#FACC15', apron: '#475569' } },
    { id: 'aziz', x: 2230, y: 530, look: { kind: 'man', skin: '#A8764E', robe: '#DBEAFE', accent: '#1E3A8A', hat: 'cap', vest: '#1E40AF', tall: true } }
  ],
  walkers: [
    { path: [[200, 615], [1100, 615]], look: { kind: 'girl', skin: '#C68A5B', robe: '#FB923C', accent: '#FFFFFF' } },
    { path: [[1400, 615], [2300, 615]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[880, 420], [1740, 420]], look: { kind: 'woman', skin: '#B5835A', robe: '#1F2937', accent: '#F59E0B' } },
    { path: [[2240, 1165], [600, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[2100, 1560], [1300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { linearEq8: () => import('./linearEq8.js'), eqProblems8: () => import('./eqProblems8.js'), simulSub8: () => import('./simulSub8.js'), simulElim8: () => import('./simulElim8.js'), inequalities8: () => import('./inequalities8.js') },
  adventure: () => import('./adventure.js'),   // «لغز الجرّة المسروقة» بعد إنهاء الدروس الخمسة
  kit3d, kit2d
};
