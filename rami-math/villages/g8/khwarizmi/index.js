// قرية الوحدة الخامسة للصف الثامن: «ميزان الخوارزمي» (المعادلات والعبارات الجبرية والصيغ) — بوحدات العالم المفتوح (بكسل).
// من الشمال: تلال ← دار الحكمة بقبابها ورواقها المقوّس، ومرصد النجوم برجاً بقبة ومنظار، وساحة الميزان الكبير، وحديقة رباعية
// بأحواض ونافورة، ومدرسة بألواح، وورشة صناديق، وجناح ساعة الماء، ودكاكين الورّاقين ← قرية حديثة شارعها الكبير شرقاً ودوّارها
// نصبه كرة الحلقات (ذات الحلق) تدور. لكل درس محطة وصاحبها من أهل دار الحكمة.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';
import { lifeInit, lifeUpdate } from '../../street.js';

const W = 2400, H = 1800, YARD = 820, TOP = 120;
const HOUSE_SPECS = [
  { x: 80, y: 880, w: 200, h: 120, kind: 'step' }, { x: 360, y: 880, w: 190, h: 115, kind: 'villa' }, { x: 630, y: 870, w: 190, h: 170, kind: 'court' }, { x: 900, y: 880, w: 210, h: 110, kind: 'L' },
  { x: 1190, y: 880, w: 190, h: 120, kind: 'villa' }, { x: 1830, y: 880, w: 190, h: 115, kind: 'step' }, { x: 2100, y: 880, w: 200, h: 120, kind: 'villa' },
  { x: 90, y: 1360, w: 190, h: 115, kind: 'villa' }, { x: 370, y: 1360, w: 200, h: 160, kind: 'court' }, { x: 920, y: 1360, w: 190, h: 120, kind: 'L' }, { x: 1200, y: 1360, w: 190, h: 115, kind: 'step' },
  { x: 1860, y: 1360, w: 190, h: 120, kind: 'villa' }, { x: 2130, y: 1360, w: 180, h: 160, kind: 'court' },
  { x: 120, y: 1600, w: 200, h: 110, kind: 'L' }, { x: 640, y: 1600, w: 190, h: 115, kind: 'villa' }, { x: 920, y: 1600, w: 200, h: 110, kind: 'step' }, { x: 1900, y: 1600, w: 190, h: 120, kind: 'villa' }
].map((h, i) => ({ ...h, seed: 611 + i * 19 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 640, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#0F766E', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + MOSQUE.w - 34, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// دار الحكمة وما حولها
const LIB = { x: 160, y: TOP + 50, w: 540, h: 220, H: 120 };   // دار الحكمة (قبتان ورواق)
const OBS = { x: 900, y: 330, r: 62, H: 230 };   // مرصد النجوم
const BAL = { x: 1250, y: 470, r: 54 };   // الميزان الكبير في الساحة
const GARDEN = { x: 1500, y: 190, w: 420, h: 300 };   // حديقة رباعية: أربعة أحواض ونافورة في الوسط
const BEDS = [[GARDEN.x + 20, GARDEN.y + 20], [GARDEN.x + 230, GARDEN.y + 20], [GARDEN.x + 20, GARDEN.y + 170], [GARDEN.x + 230, GARDEN.y + 170]].map(([x, y]) => ({ x, y, w: 170, h: 110 }));
const SCHOOL = { x: 2010, y: TOP + 60, w: 300, h: 180, H: 100 };   // المدرسة
const SHOP = { x: 2050, y: 520, w: 220, h: 110, H: 84 };   // ورشة الصناديق
const CLOCK = { x: 980, y: 640, r: 40 };   // جناح ساعة الماء
const STALLS = [[300, 770, '#0F766E'], [400, 770, '#B45309'], [500, 770, '#7C3AED'], [1500, 770, '#BE185D']];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 1570, x1: 1730, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 1650, y: 1240, r: 175, island: 82 };
const FOUNT = [380, 1700, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const PALMS = [
  ...[60, 200, 340, 480, 620, 760, 900, 1040, 1180, 1320, 1460, 1840, 1980, 2120, 2260].filter(x => !avoid(x, [[1460, 1860]])).map(x => [x, 1172, 1]),
  ...[60, 200, 340, 480, 900, 1040, 1180, 1320, 1840, 1980, 2120, 2260].filter(x => !avoid(x, [[600, 880], [1460, 1860]])).map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[1534, y, 1], [1786, y, 1]]),
  [1230, 300, 1.05], [1440, 640, 1], [760, 520, .95], [1960, 640, 1]
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[1540, 920], [1780, 920], [1540, 1460], [1780, 1460], [1540, 1700], [1780, 1700], [1000, 1300], [300, 1180], [2200, 1180], [1100, 560], [1400, 560]];

const rect = (x, y, w, h) => ({ x, y, w, h });
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[400, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1150, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[280, 1640, 90, 36], [430, 1640, 90, 36], [1400, 1440, 110, 40]],
  fountains: [FOUNT],
  signs: [{ x: 1440, y: 1176, lines: ['⬆ دار الحكمة', '⬅ المسجد', '➡ المدرسة'] }, { x: 1830, y: 1330, lines: ['⬆ المرصد', '⬇ الحديقة'] }],
  mailboxes: villas, benches: [[300, 1690], [460, 1690], [1100, 1150], [2200, 1150]], rugs: [],
  sitters: [{ x: 300, y: 1702, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0F766E', beard: '#E5E5E5', elder: true } }, { x: 460, y: 1702, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#1E3A8A', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  goats: [], goatArea: [0, 0, 1, 1],
  pitch: [1000, 1450, 240, 115],
  bike: { x0: 60, x1: 1500, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 1710, xDown: 1610, col: '#0F766E', truck: true }, { from: 1760, to: 1440, xUp: 1710, xDown: 1610, col: '#B45309' }],
  birdC: [900, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: الحلقات تدور، والميزان يتمايل، والنافورة
export default {
  id: 'khwarizmi',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, LIB, OBS, BAL, GARDEN, BEDS, SCHOOL, SHOP, CLOCK, STALLS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 1650, y: 1740 },
  mood: { sky: '#A9D8F2', fog: '#EFE4D2', fogNear: 1800, fogFar: 5600, exposure: .96,
    hemi: ['#FFFFFF', '#A88E70', 1.25], sun: { color: '#FFF0D2', i: 2.4, dir: [-.45, 1, .6] }, accent: '#14B8A6', sky2d: '#BDE2F6' },
  ambience: 'fort', music: 'village',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    rect(LIB.x, LIB.y, LIB.w, LIB.h), rect(SCHOOL.x, SCHOOL.y, SCHOOL.w, SCHOOL.h), rect(SHOP.x, SHOP.y, SHOP.w, SHOP.h),
    ...BEDS.map(b => rect(b.x, b.y, b.w, b.h)),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    { x: OBS.x, y: OBS.y, r: OBS.r + 4 }, { x: BAL.x, y: BAL.y, r: BAL.r }, { x: CLOCK.x, y: CLOCK.y, r: CLOCK.r + 6 }, { x: GARDEN.x + GARDEN.w / 2, y: GARDEN.y + GARDEN.h / 2, r: 30 },
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: [
    { id: 'equations8', x: 1250, y: 580, stand: { x: 1250, y: 650 }, label: 'الميزان الكبير', icon: '⚖️', kind: 'scale', mh: 210 },
    { id: 'simplifyExpr8', x: 440, y: 470, stand: { x: 440, y: 540 }, label: 'رفوف المخطوطات', icon: '📜', kind: 'shelf', mh: 200 },
    { id: 'writeExpr8', x: 640, y: 750, stand: { x: 640, y: 805 }, label: 'دكّان الورّاق', icon: '✒️', kind: 'quill', mh: 190 },
    { id: 'substitute8', x: 900, y: 460, stand: { x: 900, y: 530 }, label: 'مرصد النجوم', icon: '🔭', kind: 'astro', mh: 210 },
    { id: 'formulas8', x: 980, y: 730, stand: { x: 980, y: 795 }, label: 'ساعة الماء', icon: '⏳', kind: 'clock', mh: 190 },
    { id: 'factorise8', x: 2160, y: 700, stand: { x: 2160, y: 770 }, label: 'صانعة الصناديق', icon: '📦', kind: 'boxes', mh: 200 },
    { id: 'algFrac8', x: 2160, y: 400, stand: { x: 2160, y: 470 }, label: 'ألواح زهرة', icon: '🧮', kind: 'slates', mh: 200 },
    { id: 'expandTwo8', x: 1710, y: 580, stand: { x: 1710, y: 650 }, label: 'حديقة جابر', icon: '🌷', kind: 'beds', mh: 200 }
  ],
  people: [
    { id: 'yusuf', x: 1340, y: 610, look: { kind: 'man', skin: '#A8764E', robe: '#F8FAFC', accent: '#0F766E', beard: '#E5E5E5', elder: true, glasses: true } },
    { id: 'layla', x: 530, y: 500, look: { kind: 'woman', skin: '#C99A72', robe: '#1E3A8A', accent: '#FBBF24', glasses: true } },
    { id: 'warraq', x: 720, y: 780, look: { kind: 'man', skin: '#B88660', robe: '#E7E5E4', accent: '#7C2D12', beard: '#3F2A1E' } },
    { id: 'hilal', x: 990, y: 490, look: { kind: 'man', skin: '#B5835A', robe: '#334155', accent: '#FDE68A', beard: '#2B2118' } },
    { id: 'badr', x: 1070, y: 760, look: { kind: 'man', skin: '#C68A5B', robe: '#F4F1E8', accent: '#B45309', hat: 'cap' } },
    { id: 'aisha', x: 2250, y: 730, look: { kind: 'woman', skin: '#B5835A', robe: '#9D174D', accent: '#FDE68A', apron: '#FDE68A' } },
    { id: 'zahra', x: 2250, y: 440, look: { kind: 'woman', skin: '#C99A72', robe: '#0F766E', accent: '#FFFFFF' } },
    { id: 'jaber', x: 1800, y: 600, look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#15803D', hat: 'cap' } }
  ],
  walkers: [
    { path: [[760, 700], [1440, 700]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#0F766E' } },
    { path: [[200, 620], [700, 620]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C3AED', beard: '#2B2118' } },
    { path: [[1960, 300], [1960, 760]], look: { kind: 'girl', skin: '#C68A5B', robe: '#F472B6', accent: '#FFFFFF' } },
    { path: [[60, 1165], [1450, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[1850, 1560], [2300, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { equations8: () => import('./equations8.js'), simplifyExpr8: () => import('./simplifyExpr8.js'), writeExpr8: () => import('./writeExpr8.js'), substitute8: () => import('./substitute8.js'),
    formulas8: () => import('./formulas8.js'), factorise8: () => import('./factorise8.js'), algFrac8: () => import('./algFrac8.js'), expandTwo8: () => import('./expandTwo8.js') },
  adventure: () => import('./adventure.js'),   // «مخطوطة الخوارزمي المفقودة» بعد إنهاء الدروس الثمانية
  kit3d, kit2d
};
