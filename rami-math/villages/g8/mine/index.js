// قرية الوحدة الأولى للصف الثامن: «منجم الأعماق» (الأعداد الصحيحة والقوى والجذور) — بوحدات العالم المفتوح (بكسل).
// من الجنوب إلى الشمال: بوابة القرية ← حارات بيوت عُمانية ومسجد بمئذنة وسوق صغير وساحة بئر ونخيل ← ساحة المنجم (سكك وعربات
// وأكوام خام وبرج الرفع فوق البئر) ← الجبل وفي أسفله كهف البلّور وكهف التضاعف والبوابة الكبرى المنحوتة.
// لكل درس محطة (معرّفها = معرّف الدرس) ومعها صاحبها من أهل المنجم، والمهام في ملفات الدروس تُحمَّل عند فتح محطتها.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';
import { lifeInit, lifeUpdate } from '../../street.js';

const W = 2400, H = 1800, CLIFF = 430, YARD = 800;
// البيوت الحديثة الملوّنة (villages/houses.js): الشكل والموضع، والألوان من البذرة. villa بحديقة أمامية، L بجناح، step بطابق متراجع، court بفناء
const HOUSE_SPECS = [
  { x: 90, y: 870, w: 190, h: 120, kind: 'villa' }, { x: 360, y: 870, w: 220, h: 110, kind: 'L' }, { x: 1480, y: 880, w: 180, h: 120, kind: 'step' },
  { x: 1740, y: 870, w: 180, h: 170, kind: 'court' }, { x: 2020, y: 870, w: 200, h: 120, kind: 'villa' },
  { x: 120, y: 1360, w: 190, h: 160, kind: 'court' }, { x: 400, y: 1360, w: 190, h: 115, kind: 'villa' }, { x: 1560, y: 1360, w: 200, h: 110, kind: 'L' },
  { x: 1820, y: 1360, w: 190, h: 120, kind: 'step' }, { x: 2100, y: 1360, w: 180, h: 110, kind: 'villa' },
  { x: 250, y: 1600, w: 190, h: 110, kind: 'step' }, { x: 540, y: 1600, w: 190, h: 105, kind: 'villa' }, { x: 1650, y: 1600, w: 200, h: 100, kind: 'L' }, { x: 1930, y: 1600, w: 190, h: 150, kind: 'court' }
].map((h, i) => ({ ...h, seed: 11 + i * 7 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 640, y: 880, w: 210, h: 140, wall: '#F3EEE3', door: '#7A4A2A', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + MOSQUE.w - 34, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };   // المئذنة على ركن السطح الأمامي (كمسجد القرية في العالم المفتوح)
const STALLS = [[1380, 1120, '#C2410C'], [1480, 1120, '#0E7490'], [1580, 1120, '#7C3AED'], [1680, 1120, '#B45309'], [1350, 1345, '#15803D'], [1450, 1345, '#BE185D']];
const WELL = { x: 1150, y: 1255, r: 40 };   // في جزيرة الدوّار
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 1070, x1: 1230, sw: 28, top: 740, bottom: 1800 }, RING = { x: 1150, y: 1240, r: 175, island: 82 };
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const PALMS = [
  ...[80, 230, 380, 530, 1760, 1910, 2060, 2210, 2360].filter(x => !avoid(x, [[620, 920], [1300, 1720]])).map(x => [x, 1172, 1]),
  ...[80, 230, 380, 530, 680, 830, 1560, 1760, 1910, 2060, 2210, 2360].filter(x => !avoid(x, [[1290, 1500]])).map(x => [x, 1318, .95]),
  ...[860, 980, 1100, 1400, 1520, 1640, 1760].flatMap(y => [[1024, y, 1], [1276, y, 1]])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const PALMS_OK = PALMS.filter(([x, y]) => !inside0(x, y));
const LAMPS = [[1030, 920], [1270, 920], [1030, 1040], [1270, 1040], [1030, 1460], [1270, 1460], [1030, 1700], [1270, 1700], [460, 1300], [1960, 1180], [2260, 1300], [180, 1180]];
// ساحة المنجم: سكك من الكهوف إلى برج الرفع، عربات، وأكوام خام
const CAVES = [{ id: 'crystal', x: 600, w: 170 }, { id: 'doubling', x: 1450, w: 170 }, { id: 'gate', x: 2000, w: 230 }];
const RAILS = [[[600, CLIFF + 20], [600, 640], [1100, 640]], [[1450, CLIFF + 20], [1450, 640], [1200, 640]], [[2000, CLIFF + 40], [2000, 700], [1260, 700]]];
const CARTS = [[760, 640, '#C98A3B'], [1330, 640, '#7FD3FF'], [1700, 700, '#B28CFF']];
const ORE = [[300, 560, '#C98A3B'], [380, 620, '#7A6B5C'], [1800, 560, '#7FD3FF'], [2250, 620, '#C98A3B'], [900, 520, '#B28CFF']];

const rect = (x, y, w, h) => ({ x, y, w, h });
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  pitch: [645, 1045, 255, 120],
  falaj: { y: 1553, h: 22, bridges: [[190, 240], [470, 520], [610, 660], [BLVD.x0 - BLVD.sw, BLVD.x1 + BLVD.sw], [1725, 1775], [2000, 2050]] },
  zebras: [[600, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1760, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 1010, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1290, 1440, 120, 40], [880, 1440, 120, 40], [1290, 950, 110, 40], [900, 1120, 70, 50]],
  fountains: [[1860, 1120, 42]],
  signs: [{ x: 1320, y: 1176, lines: ['⬆ المنجم', '⬅ المسجد', '➡ السوق'] }, { x: 975, y: 1330, lines: ['⬆ المنجم', '➡ السوق'] }],
  mailboxes: villas, benches: [[380, 1150], [2060, 1150], [1960, 1335], [1420, 1460]], rugs: [[190, 1118]],
  sitters: [{ x: 150, y: 1110, dir: 'right', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#8C1C2B', beard: '#E5E5E5', elder: true } }, { x: 232, y: 1112, dir: 'left', look: { kind: 'man', skin: '#B5835A', robe: '#F7F5EF', accent: '#2F6FB2', beard: '#2B2118' } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  goats: [[2330, 1420], [2360, 1480], [2310, 1500]], goatArea: [2300, 1390, 2390, 1530],
  bike: { x0: 1520, x1: 2340, y: 1294 },
  shuttles: [{ from: 1050, to: 790, xUp: 1190, xDown: 1110, col: '#F59E0B', truck: true }, { from: 1880, to: 1440, xUp: 1190, xDown: 1110, col: '#2563EB' }],
  birdC: [1150, 1200]
};
const life = lifeInit(STREET);
export default {
  id: 'mine',
  size: { w: W, h: H }, CLIFF, YARD,
  HOMES, STREET, life, MOSQUE, MINARET, STALLS, WELL, PALMS: PALMS_OK, LAMPS, CAVES, RAILS, CARTS, ORE,
  start: { x: 1050, y: 1740 },
  gate: { x: 2260, y: 1760 },   // بوابة القرية التالية (villages/gate.js)
  mood: { sky: '#9CCBEF', fog: '#D6E9F7', fogNear: 1800, fogFar: 5600, exposure: .95,
    hemi: ['#FFFFFF', '#B08A60', 1.25], sun: { color: '#FFF1D6', i: 2.4, dir: [-.45, 1, .6] }, accent: '#FFC94A', sky2d: '#B9DCF5' },
  ambience: 'market', music: 'village',
  update: (dt, st) => lifeUpdate(life, STREET, st, dt, W),
  // التصادم: الجبل والمباني والأكشاك والبئر وبرج الرفع، والدوائر للنخيل والعربات وأكوام الخام والأعمدة
  solids: [
    rect(0, 0, W, CLIFF),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)),
    ...STREET.falaj.bridges.reduce((acc, [a, b], i, arr) => { const prev = i ? arr[i - 1][1] : 0; acc.push(rect(prev, STREET.falaj.y - 4, a - prev, STREET.falaj.h + 8)); if (i === arr.length - 1) acc.push(rect(b, STREET.falaj.y - 4, W - b, STREET.falaj.h + 8)); return acc; }, []),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12)),
    rect(1090, 600, 120, 50)   // بئر المنجم تحت برج الرفع
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, ...STREET.fountains.map(([x, y, r]) => ({ x, y: y - 6, r })), ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })), ...PALMS_OK.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...CARTS.map(([x, y]) => ({ x, y, r: 22 })), ...ORE.map(([x, y]) => ({ x, y, r: 26 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  // المحطات: معرّف الدرس، موضعها (أسفل المعلم)، وأين يقف البطل، وارتفاع علامة الهدف
  stations: [
    { id: 'directed8', x: 1150, y: 655, stand: { x: 1150, y: 735 }, label: 'مصعد المنجم', icon: '🛗', kind: 'elevator', mh: 300 },
    { id: 'roots8', x: 600, y: CLIFF + 40, stand: { x: 600, y: CLIFF + 110 }, label: 'كهف البلّور', icon: '💎', kind: 'crystals', mh: 230 },
    { id: 'indices8', x: 1450, y: CLIFF + 40, stand: { x: 1450, y: CLIFF + 110 }, label: 'كهف التضاعف', icon: '✨', kind: 'doubler', mh: 230 },
    { id: 'useIndices8', x: 2000, y: CLIFF + 50, stand: { x: 2000, y: CLIFF + 130 }, label: 'بوابة القوانين', icon: '🚪', kind: 'gate', mh: 300 }
  ],
  // أهل المنجم: كل واحد بجانب محطة درسه (يلتفت إلى البطل، ومنه فقاعة الكلام)
  people: [
    { id: 'saleh', x: 1240, y: 730, look: { kind: 'man', skin: '#B5835A', robe: '#5E5040', accent: '#E3B04B', hat: 'cap', vest: '#C9772E', beard: '#2B2118', tool: 'hoe' } },
    { id: 'maryam', x: 690, y: CLIFF + 100, look: { kind: 'woman', skin: '#C99A72', robe: '#3E5C76', accent: '#E3B04B', vest: '#C9772E' } },
    { id: 'noura', x: 1540, y: CLIFF + 100, look: { kind: 'woman', skin: '#B88660', robe: '#4B2E6B', accent: '#FFC94A', elder: true, glasses: true } },
    { id: 'hamdan', x: 2110, y: CLIFF + 120, look: { kind: 'man', skin: '#A8764E', robe: '#F2EEE4', accent: '#8C1C2B', beard: '#1C1410', tall: 1.05, build: 1.1 } }
  ],
  // أهل القرية يمشون بين هذه النقاط (حياة في الحارات والسوق)
  walkers: [
    { path: [[1052, 900], [1052, 1150]], look: { kind: 'man', skin: '#B07A50', robe: '#F4F1E8', accent: '#2F6FB2' } },
    { path: [[1250, 1340], [1250, 1780]], look: { kind: 'woman', skin: '#C99A72', robe: '#0F766E', accent: '#FFC94A' } },
    { path: [[1370, 1165], [1720, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[300, 1186], [940, 1186]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } },
    { path: [[1300, 1388], [2250, 1388]], look: { kind: 'girl', skin: '#C68A5B', robe: '#D85C7B', accent: '#E3B04B' } },
    { path: [[400, 700], [900, 700], [900, 560]], look: { kind: 'man', skin: '#A8764E', robe: '#6B5A48', accent: '#E3B04B', hat: 'cap', vest: '#C9772E' } },
    { path: [[1600, 760], [2200, 760]], look: { kind: 'man', skin: '#B88660', robe: '#5E5040', accent: '#E3B04B', hat: 'cap', vest: '#E3B04B' } }
  ],
  lessons: {   // مهمة كل درس تُحمَّل عند فتح محطتها
    directed8: () => import('./directed8.js'), roots8: () => import('./roots8.js'),
    indices8: () => import('./indices8.js'), useIndices8: () => import('./useIndices8.js')
  },
  adventure: () => import('./adventure.js'),   // مغامرة الوحدة بعد إنهاء الدروس الأربعة
  kit3d, kit2d
};
