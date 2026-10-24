// قرية الوحدة التاسعة للصف الثامن: «مصبغة الألوان» (النسبة والتناسب) — بوحدات العالم المفتوح (بكسل).
// في الشمال: أحواض الصبغ الملوّنة غرباً (أحواض الصبغ) ← حبال تجفيف الأقمشة الطويلة ← تعاونية النسيج ← محل الطلاء بعلبه الملوّنة
// ← مخزن الجملة شرقاً؛ وقناة ماء تجري أمام الأحواض. وجنوبها قرية حديثة شارعها الكبير في أقصى الغرب، ونصب الدوّار عجلة ألوان.
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
].map((h, i) => ({ ...h, seed: 907 + i * 37 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1290, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#7C3AED', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + 4, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// أحواض الصبغ: شبكة أحواض دائرية بألوانها (مثل مدابغ المدن القديمة)
const VCOL = ['#DC2626', '#2563EB', '#FACC15', '#16A34A', '#7C3AED', '#F97316', '#0EA5E9', '#DB2777', '#92400E', '#14B8A6', '#E11D48', '#F8FAFC'];
const VATS = Array.from({ length: 12 }, (_, k) => [190 + (k % 4) * 118, 210 + Math.floor(k / 4) * 96, 38, VCOL[k]]);
const CANAL = { x0: 150, x1: 660, y: 500 };   // قناة الماء أمام الأحواض (وجسر صغير في طرفها الشرقي)
const LINES = [[760, 1180, 220], [760, 1180, 310], [760, 1180, 400]];   // حبال التجفيف: [س١، س٢، ص]
const COOP = { x: 1270, y: 170, w: 320, h: 150, H: 120, wall: '#FBE7D3', door: '#B45309', style: 'shop', sign: 'تعاونية النسيج' };
const PAINT = { x: 1680, y: 180, w: 260, h: 140, H: 96, wall: '#E0F2FE', door: '#2563EB', style: 'shop', sign: 'محل الطلاء' };
const STORE = { x: 2020, y: 160, w: 300, h: 170, H: 130 };   // مخزن الجملة بسقف معدني
const CRATES = [[2050, 400], [2110, 420], [2280, 400]];
const PROM = { y0: 590, y1: 640 };
const STALLS = [[560, 760, '#7C3AED'], [1060, 780, '#DC2626'], [1500, 790, '#16A34A'], [2300, 780, '#F59E0B']];
const BANNERS = [[[740, 560], [1200, 560]], [[1260, 560], [1640, 560]], [[1700, 560], [1980, 560]]];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 290, x1: 450, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 370, y: 1240, r: 175, island: 82 };
const FOUNT = [1930, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const SOUQ_PALMS = [[700, 300], [1230, 420], [1640, 400], [2340, 400], [150, 760], [900, 780], [1940, 760]];
const PALMS = [
  ...[2340, 2200, 2060, 1920, 1780, 1640, 1500, 1360, 1220, 1080, 940, 800, 660, 140].filter(x => !avoid(x, [[160, 560]])).map(x => [x, 1172, 1]),
  ...[2340, 2200, 2060, 1920, 1780, 1220, 1080, 800, 660].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[254, y, 1], [506, y, 1]]),
  ...SOUQ_PALMS.map(([x, y]) => [x, y, .95])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[254, 940], [506, 940], [254, 1460], [506, 1460], [254, 1700], [506, 1700], [1400, 1300], [2100, 1180], [870, 1180], [700, 680], [1220, 680], [1660, 680], [2000, 680]];

const rect = (x, y, w, h) => ({ x, y, w, h });
// أكشاك الدروس: كشك بمظلة (قاعدته صلبة) وصاحبه بجانبه
const STATIONS = [
  { id: 'simplifyRatio8', x: 420, y: 600, stand: { x: 420, y: 665 }, label: 'أحواض الصبغ', icon: '🎨', col: '#DC2626', mh: 200 },
  { id: 'shareRatio8', x: 1430, y: 470, stand: { x: 1430, y: 535 }, label: 'تعاونية النسيج', icon: '🧶', col: '#B45309', mh: 200 },
  { id: 'compareRatio8', x: 1810, y: 470, stand: { x: 1810, y: 535 }, label: 'محل الطلاء', icon: '🖌️', col: '#2563EB', mh: 200 },
  { id: 'ratioProblems8', x: 2190, y: 520, stand: { x: 2190, y: 585 }, label: 'سوق الجملة', icon: '📦', col: '#0F766E', mh: 200 }
];
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[1944, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1194, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1780, 1640, 60, 36], [530, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 540, y: 1176, lines: ['⬆ أحواض الصبغ', '➡ تعاونية النسيج', '➡ مخزن الجملة'] }, { x: 190, y: 1330, lines: ['⬆ المصبغة', '➡ المسجد'] }],
  mailboxes: villas, benches: [[2000, 1700], [1860, 1700], [1300, 1150], [780, 1150], [1000, 500], [1620, 660]], rugs: [],
  sitters: [{ x: 2000, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#E5E5E5', elder: true } }, { x: 1860, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  pitch: [980, 1610, 240, 105],
  bike: { x0: 560, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 430, xDown: 330, col: '#7C3AED', truck: true }, { from: 1760, to: 1440, xUp: 430, xDown: 330, col: '#DC2626' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: تموج الأقمشة والماء وعجلة الألوان
export default {
  id: 'dyes',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, VATS, CANAL, LINES, COOP, PAINT, STORE, CRATES, PROM, STALLS, BANNERS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 370, y: 1740 },
  mood: { sky: '#A7D8F0', fog: '#EFE3CF', fogNear: 1800, fogFar: 5600, exposure: .98,
    hemi: ['#FFFFFF', '#9A8F7A', 1.25], sun: { color: '#FFF0D0', i: 2.4, dir: [-.45, 1, .6] }, accent: '#7C3AED', sky2d: '#C2E2F5' },
  ambience: 'coop', music: 'village',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    rect(COOP.x, COOP.y, COOP.w, COOP.h), rect(PAINT.x, PAINT.y, PAINT.w, PAINT.h), rect(STORE.x, STORE.y, STORE.w, STORE.h),
    rect(CANAL.x0, CANAL.y - 14, CANAL.x1 - CANAL.x0 - 80, 28),
    ...CRATES.map(([x, y]) => rect(x - 26, y - 22, 52, 26)),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...STATIONS.map(q => rect(q.x - 52, q.y - 56, 104, 24)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    ...VATS.map(([x, y, r]) => ({ x, y, r: r + 4 })), ...LINES.flatMap(([a, b, y]) => [{ x: a, y, r: 6 }, { x: b, y, r: 6 }, { x: (a + b) / 2, y, r: 6 }]),
    ...BANNERS.flat().map(([x, y]) => ({ x, y, r: 5 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: STATIONS,
  people: [
    { id: 'ghalib', x: 510, y: 630, look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#DC2626', beard: '#D6D3D1', elder: true, apron: '#7C3AED' } },
    { id: 'maysa', x: 1520, y: 500, look: { kind: 'woman', skin: '#C99A72', robe: '#9A3412', accent: '#FDE68A' } },
    { id: 'talal', x: 1900, y: 500, look: { kind: 'man', skin: '#C68A5B', robe: '#E0F2FE', accent: '#2563EB', hat: 'cap', apron: '#93C5FD' } },
    { id: 'amna', x: 2280, y: 550, look: { kind: 'woman', skin: '#B5835A', robe: '#115E59', accent: '#FFFFFF', elder: true, glasses: true } }
  ],
  walkers: [
    { path: [[200, 615], [1100, 615]], look: { kind: 'girl', skin: '#C68A5B', robe: '#FB923C', accent: '#FFFFFF' } },
    { path: [[1400, 615], [2300, 615]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[760, 460], [1180, 460]], look: { kind: 'woman', skin: '#B5835A', robe: '#1F2937', accent: '#F59E0B' } },
    { path: [[2240, 1165], [600, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[2100, 1560], [1300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { simplifyRatio8: () => import('./simplifyRatio8.js'), shareRatio8: () => import('./shareRatio8.js'), compareRatio8: () => import('./compareRatio8.js'), ratioProblems8: () => import('./ratioProblems8.js') },
  adventure: () => import('./adventure.js'),   // «ثوب العرس الضائع» بعد إنهاء الدروس الأربعة
  kit3d, kit2d
};
