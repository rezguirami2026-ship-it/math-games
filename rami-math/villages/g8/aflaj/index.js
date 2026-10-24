// قرية الوحدة السادسة للصف الثامن: «مزارع الأفلاج» (المساحة والمحيط والحجم) — بوحدات العالم المفتوح (بكسل).
// من الشمال: تلال وأم الفلج (البئر الأم) ← ساقية الفلج تجري جنوباً إلى «الشريعة» حيث تتفرع غرباً وشرقاً، وبجانبها الأثر (مزولة الظل)
// ← غرباً: الحارة القديمة ببيوت الطين وبرجها، وبستان نخيل، والجابية الدائرية، وحقول البرسيم؛ وشرقاً: البيدر، وبيتا زراعة نصف
// أسطوانيين، وخزّانات ماء أسطوانية، وبيت المضخة، وبرج المراقبة ← قرية حديثة شارعها الكبير في أقصى الشرق، ودوّارها نصبه جرّة
// تصبّ الماء في حوض. لكل درس محطة وصاحبها من أهل المزارع.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';
import { lifeInit, lifeUpdate } from '../../street.js';

const W = 2400, H = 1800, YARD = 820, TOP = 120;
const HOUSE_SPECS = [
  { x: 80, y: 880, w: 200, h: 120, kind: 'step' }, { x: 350, y: 880, w: 190, h: 115, kind: 'villa' }, { x: 620, y: 870, w: 190, h: 170, kind: 'court' }, { x: 890, y: 880, w: 210, h: 110, kind: 'L' },
  { x: 1180, y: 880, w: 190, h: 120, kind: 'villa' }, { x: 1450, y: 880, w: 190, h: 115, kind: 'step' }, { x: 1690, y: 880, w: 170, h: 115, kind: 'villa' }, { x: 2220, y: 880, w: 160, h: 115, kind: 'villa' },
  { x: 90, y: 1360, w: 190, h: 115, kind: 'villa' }, { x: 370, y: 1360, w: 200, h: 160, kind: 'court' }, { x: 640, y: 1360, w: 190, h: 120, kind: 'L' }, { x: 1200, y: 1360, w: 190, h: 115, kind: 'step' },
  { x: 1460, y: 1360, w: 190, h: 120, kind: 'villa' }, { x: 2240, y: 1360, w: 150, h: 115, kind: 'villa' },
  { x: 120, y: 1600, w: 200, h: 110, kind: 'L' }, { x: 640, y: 1600, w: 190, h: 115, kind: 'villa' }, { x: 920, y: 1600, w: 200, h: 110, kind: 'step' }, { x: 1520, y: 1600, w: 200, h: 110, kind: 'L' }, { x: 2220, y: 1600, w: 160, h: 115, kind: 'villa' }
].map((h, i) => ({ ...h, seed: 733 + i * 23 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 900, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#15803D', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + MOSQUE.w - 34, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// الفلج: البئر الأم، والساقية الرئيسة جنوباً، والشريعة (التفرّع)، والفروع. CH: قطع مستقيمة [x0, y0, x1, y1]
const SRC = { x: 1200, y: 190, r: 34 };
const SHARIA = { x: 1200, y: 440 };
const JABIA = { x: 820, y: 440, r: 62 };   // الجابية الدائرية على الفرع الغربي
const CH = [[1200, 224, 1200, 790], [1200, 440, JABIA.x + JABIA.r, 440], [JABIA.x - JABIA.r, 440, 150, 440], [415, 440, 415, 790], [150, 440, 150, 790],
  [1200, 440, 1420, 440], [1420, 440, 1420, 790], [1200, 555, 1240, 555]];
const DIAL = { x: 1110, y: 380 };   // الأثر: مزولة يقيس ظلّها دور الماء
const BASIN = { x: 1240, y: 520, w: 130, h: 70 };   // حوض السقي
const PLOTS = [[180, 520, 215, 110], [440, 520, 230, 110], [180, 660, 215, 110], [440, 660, 230, 110], [960, 600, 220, 90]];
const OLD = [{ x: 120, y: 170, w: 170, h: 110 }, { x: 330, y: 160, w: 150, h: 120 }, { x: 520, y: 180, w: 160, h: 100 }].map((b, i) => ({ ...b, H: 86 + i * 6, wall: ['#C8A273', '#BF9663', '#CFAB7C'][i], door: '#7C4A1E', mud: true }));
const FORT = { x: 760, y: 280, r: 46, H: 170 };   // برج الحارة
const BAIDAR = { x: 1640, y: 320, r: 74 };   // البيدر: أرض دائرية مرصوصة
const GREEN = [{ x: 1470, y: 520, w: 300, h: 80 }, { x: 1470, y: 650, w: 300, h: 80 }];   // بيتا زراعة نصف أسطوانيين
const TANKS = [[1960, 300, 44, 120], [2070, 300, 44, 120], [2180, 300, 44, 120]];   // خزّانات أسطوانية [x، y، نصف القطر، الارتفاع]
const PUMP = { x: 1860, y: 470, w: 150, h: 90, H: 80 };
const WATCH = { x: 2300, y: 210, r: 38, H: 200 };
const STALLS = [[1000, 780, '#15803D'], [1100, 780, '#B45309'], [560, 800, '#0F766E']];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 1950, x1: 2110, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 2030, y: 1240, r: 175, island: 82 };
const FOUNT = [470, 1730, 40];
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const onChannel = (x, y) => CH.some(([a, b, c, d]) => x > Math.min(a, c) - 26 && x < Math.max(a, c) + 26 && y > Math.min(b, d) - 26 && y < Math.max(b, d) + 26);
const FARM_PALMS = [
  ...[180, 270, 360, 450, 540, 630].flatMap(x => [[x, 360, .95], [x + 45, 420 - 20, .9]]),
  ...[200, 300, 470, 570, 660].map(x => [x, 650, .9]),
  [1000, 520, 1], [1080, 470, .95], [1330, 380, 1], [1300, 260, .95], [1520, 440, .9], [1780, 440, .95], [880, 600, .9], [700, 520, .95], [700, 760, .95]
].filter(([x, y]) => !onChannel(x, y) && Math.hypot(x - JABIA.x, y - JABIA.y) > JABIA.r + 30 && Math.hypot(x - FORT.x, y - FORT.y) > FORT.r + 30 && !OLD.some(b => x > b.x - 20 && x < b.x + b.w + 20 && y > b.y - 10 && y < b.y + b.h + 50));
const PALMS = [
  ...[60, 200, 340, 480, 620, 760, 900, 1040, 1180, 1320, 1460, 1600, 1740, 2260].filter(x => !avoid(x, [[1840, 2240]])).map(x => [x, 1172, 1]),
  ...[60, 200, 340, 480, 620, 1180, 1320, 1600, 1740].map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1420, 1540, 1660].flatMap(y => [[1914, y, 1], [2166, y, 1]]),
  ...FARM_PALMS
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[1914, 940], [2166, 940], [1914, 1460], [2166, 1460], [1914, 1700], [2166, 1700], [1000, 1300], [300, 1180], [1530, 1180], [1300, 460], [1110, 700], [1600, 790]];

const rect = (x, y, w, h) => ({ x, y, w, h });
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[400, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1150, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 850, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[560, 1640, 60, 36], [1760, 1720, 110, 36]],
  fountains: [FOUNT],
  signs: [{ x: 1860, y: 1176, lines: ['⬆ المزارع', '⬅ الحارة القديمة', '➡ برج المراقبة'] }, { x: 2210, y: 1330, lines: ['⬆ الخزّانات', '⬅ المسجد'] }],
  mailboxes: villas, benches: [[400, 1700], [540, 1700], [1100, 1150], [1620, 1150]], rugs: [],
  sitters: [{ x: 400, y: 1712, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#15803D', beard: '#E5E5E5', elder: true } }, { x: 540, y: 1712, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#7C2D12', accent: '#FBBF24', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  goats: [[300, 720], [340, 740], [520, 700]], goatArea: [190, 690, 660, 760],
  pitch: [1180, 1610, 240, 105],
  bike: { x0: 60, x1: 1840, y: 1294 },
  shuttles: [{ from: 1700, to: YARD - 20, xUp: 2090, xDown: 1990, col: '#15803D', truck: true }, { from: 1760, to: 1440, xUp: 2090, xDown: 1990, col: '#B45309' }],
  birdC: [1200, 900]
};
const life = lifeInit(STREET);
const kit = { t: 0 };   // زمن مشترك: الماء الجاري، وظل المزولة، وبكرة البئر، والجرّة
export default {
  id: 'aflaj',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, kit, MOSQUE, MINARET, SRC, SHARIA, JABIA, CH, DIAL, BASIN, PLOTS, OLD, FORT, BAIDAR, GREEN, TANKS, PUMP, WATCH, STALLS, RING, FOUNT, PALMS, LAMPS,
  start: { x: 2030, y: 1740 },
  mood: { sky: '#A3D5F0', fog: '#E9E2CC', fogNear: 1800, fogFar: 5600, exposure: .97,
    hemi: ['#FFFFFF', '#8E9A62', 1.25], sun: { color: '#FFF2D6', i: 2.4, dir: [-.45, 1, .6] }, accent: '#22C55E', sky2d: '#BFE3F5' },
  ambience: 'datayard', music: 'village',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); kit.t += dt; },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...OLD.map(b => rect(b.x, b.y, b.w, b.h)), rect(BASIN.x, BASIN.y, BASIN.w, BASIN.h), rect(PUMP.x, PUMP.y, PUMP.w, PUMP.h),
    ...GREEN.map(b => rect(b.x, b.y, b.w, b.h)),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: FOUNT[0], y: FOUNT[1] - 6, r: FOUNT[2] }, ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    { x: SRC.x, y: SRC.y, r: SRC.r + 6 }, { x: JABIA.x, y: JABIA.y, r: JABIA.r + 6 }, { x: FORT.x, y: FORT.y, r: FORT.r + 4 }, { x: WATCH.x, y: WATCH.y, r: WATCH.r + 4 }, { x: DIAL.x, y: DIAL.y, r: 12 },
    { x: SHARIA.x, y: SHARIA.y, r: 22 }, ...TANKS.map(([x, y, r]) => ({ x, y, r: r + 4 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: [
    { id: 'convUnits8', x: 1305, y: 650, stand: { x: 1305, y: 715 }, label: 'حوض السقي', icon: '🪣', kind: 'basin', mh: 200 },
    { id: 'circle8', x: 820, y: 545, stand: { x: 820, y: 610 }, label: 'الجابية', icon: '⭕', kind: 'pool', mh: 200 },
    { id: 'prismCyl8', x: 2110, y: 440, stand: { x: 2110, y: 505 }, label: 'خزّانات المزرعة', icon: '🛢️', kind: 'tanks', mh: 200 }
  ],
  people: [
    { id: 'khalfan', x: 1395, y: 680, look: { kind: 'man', skin: '#A8764E', robe: '#F8FAFC', accent: '#15803D', beard: '#E5E5E5', elder: true } },
    { id: 'muna', x: 910, y: 575, look: { kind: 'woman', skin: '#B5835A', robe: '#166534', accent: '#FDE68A', apron: '#FDE68A' } },
    { id: 'hamdan', x: 2200, y: 470, look: { kind: 'man', skin: '#C68A5B', robe: '#E2E8F0', accent: '#1D4ED8', hat: 'cap', vest: '#F97316' } }
  ],
  walkers: [
    { path: [[1240, 260], [1240, 760]], look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C2D12', beard: '#2B2118' } },
    { path: [[200, 480], [700, 480]], look: { kind: 'girl', skin: '#C68A5B', robe: '#F472B6', accent: '#FFFFFF' } },
    { path: [[1480, 470], [1840, 470]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#15803D' } },
    { path: [[60, 1165], [1840, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[300, 1560], [1100, 1560]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { convUnits8: () => import('./convUnits8.js'), circle8: () => import('./circle8.js'), prismCyl8: () => import('./prismCyl8.js') },
  adventure: () => import('./adventure.js'),   // «الفلج العطشان» بعد إنهاء الدروس الثلاثة
  kit3d, kit2d
};
