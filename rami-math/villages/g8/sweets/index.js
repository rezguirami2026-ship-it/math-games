// قرية الوحدة الرابعة للصف الثامن: «مطبخ الحلوى» (الكسور) — بوحدات العالم المفتوح (بكسل).
// من الشمال: تلال ← بستان نخيل بمسطاح تمر يجفّ وماعز، و«بيت الحلوى» الكبير وأمامه قدور نحاسية تغلي على الحطب، وحديقة ورد
// الجبل الأخضر بمقطرة ماء الورد وجرارها الفخارية، ومناحل، ودكّان الحلوى، وسوق صغير ← قرية حديثة ملوّنة شارعها الكبير غرباً
// ودوّارها نصبه دلّة قهوة عملاقة وفناجين، وحديقة بنافورة. لكل درس محطة وصاحبها من أهل المطبخ.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';
import { lifeInit, lifeUpdate } from '../../street.js';

const W = 2400, H = 1800, YARD = 820, TOP = 120;
const HOUSE_SPECS = [
  { x: 70, y: 880, w: 190, h: 120, kind: 'villa' }, { x: 340, y: 880, w: 210, h: 110, kind: 'L' }, { x: 950, y: 880, w: 190, h: 115, kind: 'step' },
  { x: 1220, y: 870, w: 190, h: 170, kind: 'court' }, { x: 1500, y: 880, w: 190, h: 120, kind: 'villa' }, { x: 1780, y: 880, w: 200, h: 110, kind: 'step' }, { x: 2070, y: 880, w: 200, h: 115, kind: 'L' },
  { x: 90, y: 1360, w: 190, h: 160, kind: 'court' }, { x: 370, y: 1360, w: 190, h: 115, kind: 'villa' }, { x: 950, y: 1360, w: 190, h: 120, kind: 'villa' },
  { x: 1230, y: 1360, w: 200, h: 110, kind: 'L' }, { x: 1830, y: 1360, w: 190, h: 120, kind: 'step' }, { x: 2110, y: 1360, w: 180, h: 110, kind: 'villa' },
  { x: 110, y: 1600, w: 190, h: 110, kind: 'step' }, { x: 390, y: 1600, w: 190, h: 115, kind: 'villa' }, { x: 960, y: 1600, w: 200, h: 105, kind: 'L' }, { x: 1250, y: 1600, w: 190, h: 150, kind: 'court' }
].map((h, i) => ({ ...h, seed: 401 + i * 13 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 1530, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#B45309', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + MOSQUE.w - 34, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// المطبخ وما حوله
const HOUSE = { x: 800, y: TOP + 50, w: 560, h: 230, H: 120 };   // بيت الحلوى
const POTS = [[860, 520], [1000, 520], [1140, 520], [1280, 520]];   // قدور نحاسية على الحطب (نصف القطر ٣٦)
const GROVE = [110, 210, 310, 410, 510].flatMap(x => [200, 310, 420].map((y, j) => [x + (j % 2) * 30, y, 1.05 - j * .05]));   // بستان النخيل
const MATS = [[90, 500, 210, 70], [330, 500, 210, 70]];   // مسطاح التمر
const ROSES = [210, 300, 390].map(y => ({ x: 1580, y, w: 700, h: 40 }));   // أحواض الورد
const STILL = { x: 1900, y: 470, w: 220, h: 110, H: 90 };   // المقطرة
const JARS = [[1700, 520], [1790, 520]];   // جرار التقطير الفخارية على النار
const HIVES = [[2200, 600], [2280, 600], [2360, 600]];
const SHOP = { x: 110, y: 640, w: 200, h: 100, H: 84 };   // دكّان الحلوى
const TABLE = { x: 1440, y: 600, w: 130, h: 40 };   // طاولة التعبئة
const STALLS = [[560, 770, '#B45309'], [660, 770, '#BE185D'], [1600, 770, '#0E7490'], [1700, 770, '#7C3AED']];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 680, x1: 840, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 760, y: 1240, r: 175, island: 82 };
const FOUNT = [1640, 1690, 44];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const PALMS = [
  ...[60, 200, 340, 480, 920, 1060, 1200, 1340, 1480, 1620, 1760, 1900, 2040, 2180, 2320].filter(x => !avoid(x, [[560, 960]])).map(x => [x, 1172, 1]),
  ...[60, 200, 340, 480, 920, 1060, 1200, 1340, 1820, 1960, 2100, 2240, 2360].filter(x => !avoid(x, [[1480, 1780]])).map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[634, y, 1], [886, y, 1]])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[640, 920], [880, 920], [640, 1460], [880, 1460], [640, 1700], [880, 1700], [1500, 1300], [2000, 1180], [300, 1180], [1640, 1600]];

const rect = (x, y, w, h) => ({ x, y, w, h });
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[300, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1700, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1530, 1600, 90, 36], [1680, 1600, 90, 36], [1540, 1760, 200, 28], [900, 1440, 110, 40]],
  fountains: [FOUNT],
  signs: [{ x: 930, y: 1176, lines: ['⬆ مطبخ الحلوى', '➡ المسجد', '⬅ الدكّان'] }, { x: 590, y: 1330, lines: ['⬆ بيت الحلوى', '⬇ الحديقة'] }],
  mailboxes: villas, benches: [[1560, 1680], [1720, 1680], [1180, 1150], [2200, 1150]], rugs: [],
  sitters: [{ x: 1560, y: 1692, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#B45309', beard: '#E5E5E5', elder: true } }, { x: 1720, y: 1692, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#9D174D', accent: '#FFC94A', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  goats: [[420, 640], [520, 660], [460, 700]], goatArea: [360, 610, 620, 720],
  bike: { x0: 900, x1: 2340, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 810, xDown: 710, col: '#B45309', truck: true }, { from: 1760, to: 1440, xUp: 810, xDown: 710, col: '#DB2777' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
// حياة المطبخ: مجاديف تحرّك الحلوى في القدور، ونحل حول المناحل، وبخار المقطرة (زمن مشترك للعرضين)
const kit = { t: 0 };
export default {
  id: 'sweets',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, HOUSE, POTS, GROVE, MATS, ROSES, STILL, JARS, HIVES, SHOP, TABLE, STALLS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 760, y: 1740 },
  gate: { x: 2000, y: 1760 },   // بوابة القرية التالية (villages/gate.js)
  mood: { sky: '#AEDCF5', fog: '#F3E6D2', fogNear: 1800, fogFar: 5600, exposure: .97,
    hemi: ['#FFFFFF', '#B08A60', 1.25], sun: { color: '#FFE6C0', i: 2.45, dir: [-.45, 1, .6] }, accent: '#F59E0B', sky2d: '#BFE3F7' },
  ambience: 'market', music: 'festival',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    rect(HOUSE.x, HOUSE.y, HOUSE.w, HOUSE.h), rect(STILL.x, STILL.y, STILL.w, STILL.h), rect(SHOP.x, SHOP.y, SHOP.w, SHOP.h), rect(TABLE.x, TABLE.y, TABLE.w, TABLE.h),
    ...ROSES.map(b => rect(b.x, b.y, b.w, b.h)),
    ...HIVES.map(([x, y]) => rect(x - 20, y - 24, 40, 26)),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    ...POTS.map(([x, y]) => ({ x, y, r: 38 })), ...JARS.map(([x, y]) => ({ x, y, r: 26 })),
    ...GROVE.map(([x, y]) => ({ x, y: y - 3, r: 12 })), ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: [
    { id: 'simplestFrac8', x: 720, y: 610, stand: { x: 720, y: 680 }, label: 'صحون القصّ', icon: '🍰', kind: 'dish', mh: 200 },
    { id: 'addSubFrac8', x: 1760, y: 640, stand: { x: 1760, y: 710 }, label: 'قوارير ماء الورد', icon: '🌹', kind: 'rose', mh: 200 },
    { id: 'mulFrac8', x: 1070, y: 640, stand: { x: 1070, y: 710 }, label: 'وصفة الجدة', icon: '🥄', kind: 'pot', mh: 210 },
    { id: 'divFrac8', x: 1505, y: 690, stand: { x: 1505, y: 750 }, label: 'تعبئة العلب', icon: '🫙', kind: 'jars', mh: 200 },
    { id: 'mentalFrac8', x: 400, y: 760, stand: { x: 400, y: 800 }, label: 'دكّان الحلوى', icon: '🏪', kind: 'shop', mh: 190 }
  ],
  people: [
    { id: 'sheikha', x: 800, y: 670, look: { kind: 'woman', skin: '#B88660', robe: '#9D174D', accent: '#FBBF24', elder: true, apron: '#FDE68A' } },
    { id: 'maryam', x: 1840, y: 700, look: { kind: 'woman', skin: '#C99A72', robe: '#DB2777', accent: '#FCE7F3' } },
    { id: 'salim', x: 1160, y: 690, look: { kind: 'man', skin: '#A8764E', robe: '#F8FAFC', accent: '#B45309', beard: '#2B2118', apron: '#FFFFFF' } },
    { id: 'noura', x: 1600, y: 690, look: { kind: 'woman', skin: '#B5835A', robe: '#0F766E', accent: '#FDE68A' } },
    { id: 'hamad', x: 320, y: 790, look: { kind: 'man', skin: '#B88660', robe: '#E7E5E4', accent: '#7C2D12', beard: '#3F2A1E' } },
    { id: 'cook1', x: 930, y: 470, look: { kind: 'man', skin: '#C68A5B', robe: '#FFFFFF', accent: '#DC2626', apron: '#F8FAFC', hat: 'cap' } },
    { id: 'cook2', x: 1210, y: 470, look: { kind: 'woman', skin: '#B5835A', robe: '#7C2D12', accent: '#FDE68A', apron: '#FCA5A5' } }
  ],
  walkers: [
    { path: [[760, 704], [1380, 704]], look: { kind: 'woman', skin: '#C99A72', robe: '#B45309', accent: '#FDE68A' } },
    { path: [[1600, 460], [1600, 700]], look: { kind: 'girl', skin: '#C68A5B', robe: '#F472B6', accent: '#FFFFFF' } },
    { path: [[100, 600], [560, 600]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#15803D', hat: 'cap' } },
    { path: [[980, 1165], [1460, 1165]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } },
    { path: [[930, 1560], [1480, 1560]], look: { kind: 'woman', skin: '#C99A72', robe: '#4338CA', accent: '#FBBF24' } }
  ],
  lessons: { simplestFrac8: () => import('./simplestFrac8.js'), addSubFrac8: () => import('./addSubFrac8.js'), mulFrac8: () => import('./mulFrac8.js'), divFrac8: () => import('./divFrac8.js'), mentalFrac8: () => import('./mentalFrac8.js') },
  adventure: () => import('./adventure.js'),   // «سرّ قِدر الجدة» بعد إنهاء الدروس الخمسة
  kit3d, kit2d
};
