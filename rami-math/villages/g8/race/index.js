// قرية الوحدة الرابعة عشرة للصف الثامن: «مضمار السباق» (الرسوم البيانية الواقعية والقياسات المركبة) — بوحدات العالم المفتوح (بكسل).
// في الشمال: مضمار جري بيضوي بحاراته البيضاء وعدّائين يركضون، والمدرّج الملوّن بجمهوره، وقوس البداية والنهاية، وبرج التوقيت بساعته الرقمية،
// وعيادة المضمار، ومسار الدراجات. وجنوبها قرية حديثة، ونصب الدوّار ساعة توقيت عملاقة.
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
].map((h, i) => ({ ...h, seed: 1259 + i * 59 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1290, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#DC2626', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + 4, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// المضمار البيضوي، والمدرّج، وقوس البداية، وبرج التوقيت، والعيادة
const OVAL = { x: 1180, y: 330, rx: 520, ry: 150, lane: 70 };   // مركز المضمار ونصفا قطريه الخارجيين وعرض الحارات
const STAND = { x: 760, y: 140, w: 840, h: 60, H: 80 };   // المدرّج شمال المضمار
const ARCH = { x: 1180, y: 520 };   // قوس البداية والنهاية على الحارات الجنوبية
const TIMER = { x: 1820, y: 230, s: 60, H: 200 };   // برج التوقيت
const CLINIC = { x: 160, y: 190, w: 260, h: 130, H: 96, wall: '#FFF1F2', door: '#DC2626', style: 'shop', sign: 'عيادة المضمار' };
const SHOP = { x: 1980, y: 300, w: 260, h: 120, H: 90, wall: '#FEF3C7', door: '#B45309', style: 'shop', sign: 'سوق المضمار' };
const PROM = { y0: 590, y1: 640 };
const STALLS = [[560, 760, '#DC2626'], [1060, 780, '#2563EB'], [1500, 790, '#16A34A'], [2300, 780, '#F59E0B']];
const BANNERS = [[[150, 560], [600, 560]], [[1760, 560], [2200, 560]]];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 290, x1: 450, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 370, y: 1240, r: 175, island: 82 };
const FOUNT = [1930, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const SOUQ_PALMS = [[520, 300], [1840, 450], [2340, 420], [150, 760], [900, 780], [1940, 760]];
const PALMS = [
  ...[2340, 2200, 2060, 1920, 1780, 1640, 1500, 1360, 1220, 1080, 940, 800, 660, 140].filter(x => !avoid(x, [[160, 560]])).map(x => [x, 1172, 1]),
  ...[2340, 2200, 2060, 1920, 1780, 1220, 1080, 800, 660].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[254, y, 1], [506, y, 1]]),
  ...SOUQ_PALMS.map(([x, y]) => [x, y, .95])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[254, 940], [506, 940], [254, 1460], [506, 1460], [254, 1700], [506, 1700], [1400, 1300], [2100, 1180], [870, 1180], [480, 660], [940, 660], [1420, 660], [1900, 660]];

const rect = (x, y, w, h) => ({ x, y, w, h });
// أكشاك الدروس: كشك بمظلة (قاعدته صلبة) وصاحبه بجانبه
const STATIONS = [
  { id: 'realGraph8a', x: 300, y: 480, stand: { x: 300, y: 545 }, label: 'لوحة المراحل', icon: '📈', col: '#DC2626', mh: 200 },
  { id: 'realGraph8b', x: 700, y: 700, stand: { x: 700, y: 765 }, label: 'سباق الدراجتين', icon: '🚴', col: '#2563EB', mh: 200 },
  { id: 'measureProb8', x: 1180, y: 700, stand: { x: 1180, y: 765 }, label: 'عيادة القياس', icon: '🩺', col: '#BE123C', mh: 200 },
  { id: 'avgSpeed8', x: 1640, y: 700, stand: { x: 1640, y: 765 }, label: 'لوحة التوقيت', icon: '⏱️', col: '#7C3AED', mh: 200 },
  { id: 'compound8', x: 2100, y: 500, stand: { x: 2100, y: 565 }, label: 'سوق المضمار', icon: '🛍️', col: '#B45309', mh: 200 }
];
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[1944, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1194, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1780, 1640, 60, 36], [530, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 540, y: 1176, lines: ['⬆ مضمار السباق', '➡ برج التوقيت', '➡ سوق المضمار'] }, { x: 190, y: 1330, lines: ['⬆ عيادة المضمار', '➡ المسجد'] }],
  mailboxes: villas, benches: [[2000, 1700], [1860, 1700], [1300, 1150], [780, 1150], [500, 500], [1900, 520]], rugs: [],
  sitters: [{ x: 2000, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#E5E5E5', elder: true } }, { x: 1860, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  pitch: [980, 1610, 240, 105],
  bike: { x0: 560, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 430, xDown: 330, col: '#DC2626', truck: true }, { from: 1760, to: 1440, xUp: 430, xDown: 330, col: '#2563EB' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: العدّاؤون على الحارات، وأرقام ساعة البرج، وجمهور المدرّج
export default {
  id: 'race',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, OVAL, STAND, ARCH, TIMER, CLINIC, SHOP, PROM, STALLS, BANNERS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 370, y: 1740 },
  mood: { sky: '#A7D8F0', fog: '#EFE3CF', fogNear: 1800, fogFar: 5600, exposure: .98,
    hemi: ['#FFFFFF', '#9A8F7A', 1.25], sun: { color: '#FFF0D0', i: 2.4, dir: [-.45, 1, .6] }, accent: '#DC2626', sky2d: '#C4E4F4' },
  ambience: 'festival', music: 'festival',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    rect(STAND.x, STAND.y, STAND.w, STAND.h), rect(CLINIC.x, CLINIC.y, CLINIC.w, CLINIC.h), rect(SHOP.x, SHOP.y, SHOP.w, SHOP.h), rect(TIMER.x - TIMER.s / 2, TIMER.y - TIMER.s / 2, TIMER.s, TIMER.s),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...STATIONS.map(q => rect(q.x - 52, q.y - 56, 104, 24)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    { x: ARCH.x - 110, y: ARCH.y, r: 8 }, { x: ARCH.x + 110, y: ARCH.y, r: 8 },
    ...BANNERS.flat().map(([x, y]) => ({ x, y, r: 5 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: STATIONS,
  people: [
    { id: 'adel', x: 390, y: 510, look: { kind: 'man', skin: '#A8764E', robe: '#FEE2E2', accent: '#DC2626', hat: 'cap', vest: '#DC2626' } },
    { id: 'waleed', x: 790, y: 730, look: { kind: 'man', skin: '#C68A5B', robe: '#F8FAFC', accent: '#2563EB', hat: 'cap' } },
    { id: 'lubna', x: 1270, y: 730, look: { kind: 'woman', skin: '#C99A72', robe: '#FFFFFF', accent: '#BE123C' } },
    { id: 'omar8', x: 1730, y: 730, look: { kind: 'man', skin: '#A8764E', robe: '#EDE9FE', accent: '#7C3AED', beard: '#2B2118' } },
    { id: 'halima', x: 2190, y: 530, look: { kind: 'woman', skin: '#B5835A', robe: '#78350F', accent: '#FDE68A', elder: true } }
  ],
  walkers: [
    { path: [[200, 615], [1100, 615]], look: { kind: 'girl', skin: '#C68A5B', robe: '#FB923C', accent: '#FFFFFF' } },
    { path: [[1400, 615], [2300, 615]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[700, 470], [1660, 470]], look: { kind: 'boy', skin: '#B5835A', robe: '#FEF08A', accent: '#16A34A', tall: true } },
    { path: [[2240, 1165], [600, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[2100, 1560], [1300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { realGraph8a: () => import('./realGraph8a.js'), realGraph8b: () => import('./realGraph8b.js'), measureProb8: () => import('./measureProb8.js'), avgSpeed8: () => import('./avgSpeed8.js'), compound8: () => import('./compound8.js') },
  adventure: () => import('./adventure.js'),   // «راية البداية» بعد إنهاء الدروس الخمسة
  kit3d, kit2d
};
