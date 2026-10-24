// قرية الوحدة الثانية عشرة للصف الثامن: «دار الفسيفساء» (المضلعات والزوايا) — بوحدات العالم المفتوح (بكسل).
// في الشمال: ورشة البلاط بفرنها غرباً ← الدار الكبيرة بفنائها المبلّط بنجوم ثمانية ونوافذ الزجاج الملوّن ← القبة المزخرفة ← الجدار المرمَّم
// بسقالته شرقاً؛ وبينها نافورة ثمانية الأضلاع. وجنوبها قرية حديثة، ونصب الدوّار نجمة ثمانية من البلاط.
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
].map((h, i) => ({ ...h, seed: 1103 + i * 47 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1290, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#1E3A8A', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + 4, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// ورشة البلاط، والدار الكبيرة وفناؤها، والقبة، والجدار المرمَّم بسقالته، والنافورة الثمانية
const WORK = { x: 150, y: 180, w: 260, h: 140, H: 96, wall: '#FDE68A', door: '#B45309', style: 'shop', sign: 'ورشة البلاط' };
const KILN = { x: 470, y: 300, r: 40 };   // فرن الطين
const DAR = { x: 640, y: 160, w: 520, h: 150, H: 130, wall: '#FAF5EA', door: '#1E3A8A', style: 'shop', sign: 'دار الفسيفساء' };
const COURT = { x: 640, y: 330, w: 520, h: 190 };   // الفناء المبلّط
const DOME = { x: 1300, y: 170, w: 260, h: 170, H: 110, wall: '#E0F2FE', door: '#0F766E', style: 'shop', sign: 'القبة المزخرفة' };
const WALLR = { x: 1720, y: 170, w: 420, h: 60, H: 150 };   // الجدار المرمَّم
const FOUNT8 = { x: 1450, y: 480, r: 52 };   // النافورة الثمانية
const PROM = { y0: 590, y1: 640 };
const STALLS = [[560, 760, '#1E3A8A'], [1060, 780, '#D97706'], [1500, 790, '#0F766E'], [2300, 780, '#DB2777']];
const BANNERS = [[[150, 560], [600, 560]], [[1700, 560], [2160, 560]]];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 290, x1: 450, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 370, y: 1240, r: 175, island: 82 };
const FOUNT = [1930, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const SOUQ_PALMS = [[580, 200], [1220, 420], [1640, 420], [2340, 380], [150, 760], [900, 780], [1940, 760]];
const PALMS = [
  ...[2340, 2200, 2060, 1920, 1780, 1640, 1500, 1360, 1220, 1080, 940, 800, 660, 140].filter(x => !avoid(x, [[160, 560]])).map(x => [x, 1172, 1]),
  ...[2340, 2200, 2060, 1920, 1780, 1220, 1080, 800, 660].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[254, y, 1], [506, y, 1]]),
  ...SOUQ_PALMS.map(([x, y]) => [x, y, .95])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[254, 940], [506, 940], [254, 1460], [506, 1460], [254, 1700], [506, 1700], [1400, 1300], [2100, 1180], [870, 1180], [560, 660], [1200, 660], [1700, 660], [2200, 660]];

const rect = (x, y, w, h) => ({ x, y, w, h });
// أكشاك الدروس: كشك بمظلة (قاعدته صلبة) وصاحبه بجانبه
const STATIONS = [
  { id: 'regPoly8', x: 300, y: 500, stand: { x: 300, y: 565 }, label: 'ورشة البلاط', icon: '🔷', col: '#1E3A8A', mh: 200 },
  { id: 'morePoly8', x: 900, y: 700, stand: { x: 900, y: 765 }, label: 'نوافذ الشمسيات', icon: '🪟', col: '#DB2777', mh: 200 },
  { id: 'polyAngles8', x: 1640, y: 520, stand: { x: 1640, y: 585 }, label: 'سقف القبة', icon: '🕌', col: '#0F766E', mh: 200 },
  { id: 'pythagoras8', x: 2050, y: 480, stand: { x: 2050, y: 545 }, label: 'سقالة الترميم', icon: '🪜', col: '#D97706', mh: 200 }
];
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[1944, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1194, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1780, 1640, 60, 36], [530, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 540, y: 1176, lines: ['⬆ دار الفسيفساء', '➡ القبة المزخرفة', '➡ الجدار المرمَّم'] }, { x: 190, y: 1330, lines: ['⬆ ورشة البلاط', '➡ المسجد'] }],
  mailboxes: villas, benches: [[2000, 1700], [1860, 1700], [1300, 1150], [780, 1150], [1340, 560], [1560, 560]], rugs: [],
  sitters: [{ x: 2000, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#E5E5E5', elder: true } }, { x: 1860, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  pitch: [980, 1610, 240, 105],
  bike: { x0: 560, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 430, xDown: 330, col: '#1E3A8A', truck: true }, { from: 1760, to: 1440, xUp: 430, xDown: 330, col: '#D97706' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: ماء النافورة، ودخان الفرن، وبريق الزجاج
export default {
  id: 'mosaic',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, WORK, KILN, DAR, COURT, DOME, WALLR, FOUNT8, PROM, STALLS, BANNERS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 370, y: 1740 },
  mood: { sky: '#A7D8F0', fog: '#EFE3CF', fogNear: 1800, fogFar: 5600, exposure: .98,
    hemi: ['#FFFFFF', '#9A8F7A', 1.25], sun: { color: '#FFF0D0', i: 2.4, dir: [-.45, 1, .6] }, accent: '#1E3A8A', sky2d: '#C6E3F5' },
  ambience: 'fort', music: 'village',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...[WORK, DAR, DOME].map(b => rect(b.x, b.y, b.w, b.h)), rect(WALLR.x, WALLR.y, WALLR.w, WALLR.h),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...STATIONS.map(q => rect(q.x - 52, q.y - 56, 104, 24)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    { x: KILN.x, y: KILN.y, r: KILN.r }, { x: FOUNT8.x, y: FOUNT8.y, r: FOUNT8.r + 4 }, ...[0, 1, 2, 3, 4].map(k => ({ x: WALLR.x + 30 + k * 90, y: WALLR.y + WALLR.h + 30, r: 6 })),
    ...BANNERS.flat().map(([x, y]) => ({ x, y, r: 5 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: STATIONS,
  people: [
    { id: 'nizar', x: 390, y: 530, look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#1E3A8A', beard: '#E5E5E5', elder: true, apron: '#92400E' } },
    { id: 'huda', x: 990, y: 730, look: { kind: 'woman', skin: '#C99A72', robe: '#9D174D', accent: '#FDE68A', glasses: true } },
    { id: 'basim', x: 1730, y: 550, look: { kind: 'man', skin: '#C68A5B', robe: '#E0F2FE', accent: '#0F766E', hat: 'cap', vest: '#F59E0B' } },
    { id: 'asma', x: 2140, y: 510, look: { kind: 'woman', skin: '#B5835A', robe: '#1F2937', accent: '#F59E0B', apron: '#D97706' } }
  ],
  walkers: [
    { path: [[200, 615], [1100, 615]], look: { kind: 'girl', skin: '#C68A5B', robe: '#FB923C', accent: '#FFFFFF' } },
    { path: [[1400, 615], [2300, 615]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[660, 540], [1140, 540]], look: { kind: 'woman', skin: '#B5835A', robe: '#1F2937', accent: '#F59E0B' } },
    { path: [[2240, 1165], [600, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[2100, 1560], [1300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { regPoly8: () => import('./regPoly8.js'), morePoly8: () => import('./morePoly8.js'), polyAngles8: () => import('./polyAngles8.js'), pythagoras8: () => import('./pythagoras8.js') },
  adventure: () => import('./adventure.js'),   // «بلاط الفناء السحري» بعد إنهاء الدروس الأربعة
  kit3d, kit2d
};
