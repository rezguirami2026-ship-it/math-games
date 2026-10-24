// قرية الوحدة الثامنة للصف الثامن: «سوق العروض» (النسب المئوية) — بوحدات العالم المفتوح (بكسل).
// في الشمال: السوق المسقوف بأقواسه ودكاكينه غرباً (لوحة الأسعار) ← الساحة وبرج الساعة ولوحة الاستبيان ← معرض السيارات الزجاجي وسياراته
// ← بنك السوق بأعمدته شرقاً؛ وبينها ممشى مظلّل بلافتات التخفيضات وبسطات الفاكهة. وجنوبها قرية حديثة شارعها الكبير في أقصى الغرب،
// ونصب الدوّار علامة «٪» كبيرة.
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
].map((h, i) => ({ ...h, seed: 853 + i * 31 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1290, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#0F766E', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + 4, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// السوق المسقوف: صف دكاكين بواجهات ملوّنة تحت رواق من الأقواس
const SHOPS = [['#F59E0B', 'العطور'], ['#0EA5E9', 'الأقمشة'], ['#DC2626', 'الخناجر'], ['#16A34A', 'البهارات'], ['#7C3AED', 'الذهب'], ['#EA580C', 'الحلويات']]
  .map(([col, name], k) => ({ x: 170 + k * 150, y: 190, w: 140, h: 110, H: 92, wall: '#F3E3C6', door: col, style: 'shop', sign: name, col }));
const ARCADE = { x0: 160, x1: 1070, y: 300, d: 46, H: 84 };   // رواق الأقواس أمام الدكاكين
const TOWER = { x: 1280, y: 380, s: 56, H: 230 };   // برج الساعة في الساحة
const SHOWROOM = { x: 1500, y: 170, w: 380, h: 150, H: 104 };   // معرض السيارات الزجاجي
const CARS = [[1560, 430, '#2563EB'], [1690, 450, '#DC2626'], [1820, 430, '#F8FAFC']];   // سيارات العرض أمامه
const BANK = { x: 1980, y: 170, w: 330, h: 160, H: 140, wall: '#ECEBE6', door: '#0F766E', style: 'shop', sign: 'بنك السوق' };
const PROM = { y0: 590, y1: 640 };
const STALLS = [[560, 760, '#16A34A'], [1060, 780, '#F59E0B'], [1500, 790, '#DC2626'], [2300, 780, '#0EA5E9']];   // بسطات الفاكهة والخضار
const BANNERS = [[[200, 560], [620, 560]], [[740, 560], [1130, 560]], [[1440, 560], [1860, 560]], [[1960, 560], [2320, 560]]];   // حبال لافتات «تخفيضات»
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 290, x1: 450, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 370, y: 1240, r: 175, island: 82 };
const FOUNT = [1930, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const SOUQ_PALMS = [[150, 450], [1140, 300], [1420, 300], [1940, 380], [2340, 400], [150, 760], [900, 780], [1940, 760]];
const PALMS = [
  ...[2340, 2200, 2060, 1920, 1780, 1640, 1500, 1360, 1220, 1080, 940, 800, 660, 140].filter(x => !avoid(x, [[160, 560]])).map(x => [x, 1172, 1]),
  ...[2340, 2200, 2060, 1920, 1780, 1220, 1080, 800, 660].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[254, y, 1], [506, y, 1]]),
  ...SOUQ_PALMS.map(([x, y]) => [x, y, .95])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[254, 940], [506, 940], [254, 1460], [506, 1460], [254, 1700], [506, 1700], [1400, 1300], [2100, 1180], [870, 1180], [700, 680], [1150, 680], [1640, 680], [2200, 680]];

const rect = (x, y, w, h) => ({ x, y, w, h });
// أكشاك الدروس: كشك بمظلة (قاعدته صلبة) وصاحبه بجانبه
const STATIONS = [
  { id: 'mentalPct8', x: 640, y: 470, stand: { x: 640, y: 535 }, label: 'لوحة الأسعار', icon: '🏷️', col: '#EA580C', mh: 200 },
  { id: 'compareQty8', x: 1270, y: 700, stand: { x: 1270, y: 765 }, label: 'لوحة الاستبيان', icon: '📋', col: '#0F766E', mh: 200 },
  { id: 'pctChange8', x: 1700, y: 560, stand: { x: 1700, y: 625 }, label: 'معرض السيارات', icon: '🚗', col: '#2563EB', mh: 200 },
  { id: 'pctPractical8', x: 2140, y: 470, stand: { x: 2140, y: 535 }, label: 'البنك والفواتير', icon: '🏦', col: '#7C3AED', mh: 200 }
];
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[1944, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1194, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1780, 1640, 60, 36], [530, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 540, y: 1176, lines: ['⬆ السوق المسقوف', '➡ معرض السيارات', '➡ بنك السوق'] }, { x: 190, y: 1330, lines: ['⬆ برج الساعة', '➡ المسجد'] }],
  mailboxes: villas, benches: [[2000, 1700], [1860, 1700], [1300, 1150], [780, 1150], [1180, 470], [1380, 470]], rugs: [],
  sitters: [{ x: 2000, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#E5E5E5', elder: true } }, { x: 1860, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  pitch: [980, 1610, 240, 105],
  bike: { x0: 560, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 430, xDown: 330, col: '#EA580C', truck: true }, { from: 1760, to: 1440, xUp: 430, xDown: 330, col: '#0F766E' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: عقربا الساعة، ولافتات التخفيضات، ودوران منصة السيارة
export default {
  id: 'offers',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, SHOPS, ARCADE, TOWER, SHOWROOM, CARS, BANK, PROM, STALLS, BANNERS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 370, y: 1740 },
  mood: { sky: '#A7D8F0', fog: '#EFE3CF', fogNear: 1800, fogFar: 5600, exposure: .98,
    hemi: ['#FFFFFF', '#9A8F7A', 1.25], sun: { color: '#FFF0D0', i: 2.4, dir: [-.45, 1, .6] }, accent: '#EA580C', sky2d: '#C4E4F4' },
  ambience: 'market', music: 'village',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...SHOPS.map(s => rect(s.x, s.y, s.w, s.h)), rect(ARCADE.x0, ARCADE.y, ARCADE.x1 - ARCADE.x0, 10),
    rect(TOWER.x - TOWER.s / 2, TOWER.y - TOWER.s, TOWER.s, TOWER.s), rect(SHOWROOM.x, SHOWROOM.y, SHOWROOM.w, SHOWROOM.h), rect(BANK.x, BANK.y, BANK.w, BANK.h),
    ...CARS.map(([x, y]) => rect(x - 58, y - 26, 116, 30)),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...STATIONS.map(q => rect(q.x - 52, q.y - 56, 104, 24)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    ...Array.from({ length: 8 }, (_, k) => ({ x: ARCADE.x0 + 20 + k * (ARCADE.x1 - ARCADE.x0 - 40) / 7, y: ARCADE.y + ARCADE.d, r: 9 })),
    ...BANNERS.flat().map(([x, y]) => ({ x, y, r: 5 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: STATIONS,
  people: [
    { id: 'thuwaini', x: 730, y: 500, look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#EA580C', beard: '#2B2118' } },
    { id: 'badriya', x: 1360, y: 730, look: { kind: 'woman', skin: '#C99A72', robe: '#115E59', accent: '#FDE68A', glasses: true } },
    { id: 'mazin', x: 1790, y: 590, look: { kind: 'man', skin: '#C68A5B', robe: '#E0F2FE', accent: '#1D4ED8', hat: 'cap', vest: '#1E3A8A' } },
    { id: 'ruqaya', x: 2230, y: 500, look: { kind: 'woman', skin: '#B5835A', robe: '#5B21B6', accent: '#FFFFFF', tall: true } }
  ],
  walkers: [
    { path: [[200, 615], [1100, 615]], look: { kind: 'girl', skin: '#C68A5B', robe: '#FB923C', accent: '#FFFFFF' } },
    { path: [[1400, 615], [2300, 615]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[220, 380], [1040, 380]], look: { kind: 'woman', skin: '#B5835A', robe: '#1F2937', accent: '#F59E0B' } },
    { path: [[2240, 1165], [600, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[2100, 1560], [1300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { mentalPct8: () => import('./mentalPct8.js'), compareQty8: () => import('./compareQty8.js'), pctChange8: () => import('./pctChange8.js'), pctPractical8: () => import('./pctPractical8.js') },
  adventure: () => import('./adventure.js'),   // «ليلة التخفيضات الكبرى» بعد إنهاء الدروس الأربعة
  kit3d, kit2d
};
