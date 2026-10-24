// قرية الوحدة الثانية للصف الثامن: «ميناء الموازين» (القيمة المكانية والترتيب والتقريب) — بوحدات العالم المفتوح (بكسل).
// من الشمال: البحر بقواربه ومرسيين خشبيين ← رصيف حجري وكورنيش بنخيل ومقاعد ← منطقة الميناء: سوق السمك (ميزان السمك)،
// مستودع الملصقات، ساحة الحاويات برافعتها الجسرية، وبرج المراقبة ← قرية حديثة ملوّنة بدوّار نصبه مرساة كبيرة وملعب وأهل.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';
import { lifeInit, lifeUpdate } from '../../street.js';

const W = 2400, H = 1800, SEA = 400, QUAY = 430, YARD = 800;
const HOUSE_SPECS = [
  { x: 80, y: 880, w: 200, h: 120, kind: 'step' }, { x: 340, y: 870, w: 190, h: 120, kind: 'villa' }, { x: 1470, y: 880, w: 210, h: 110, kind: 'L' },
  { x: 1750, y: 870, w: 180, h: 170, kind: 'court' }, { x: 2020, y: 880, w: 190, h: 120, kind: 'villa' },
  { x: 110, y: 1360, w: 190, h: 115, kind: 'villa' }, { x: 380, y: 1360, w: 200, h: 160, kind: 'court' }, { x: 1580, y: 1360, w: 190, h: 120, kind: 'step' },
  { x: 1840, y: 1360, w: 210, h: 110, kind: 'L' }, { x: 2120, y: 1370, w: 180, h: 110, kind: 'villa' },
  { x: 240, y: 1600, w: 200, h: 110, kind: 'L' }, { x: 520, y: 1600, w: 190, h: 150, kind: 'court' }, { x: 1640, y: 1600, w: 190, h: 110, kind: 'villa' }, { x: 1920, y: 1600, w: 200, h: 110, kind: 'step' }
].map((h, i) => ({ ...h, seed: 101 + i * 13 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 660, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#0F766E', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + MOSQUE.w - 34, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// منطقة الميناء
const MARKET = [[470, 610, '#0E7490'], [570, 610, '#E11D48'], [670, 610, '#F59E0B'], [470, 720, '#16A34A'], [570, 720, '#7C3AED']];
const WAREHOUSE = { x: 900, y: 470, w: 300, h: 130, H: 104 };
const TOWER = { x: 260, y: 560, r: 46, H: 230 };
const STACKS = [];   // ساحة الحاويات: أكوام بألوان، والرافعة الجسرية فوق الممر الأوسط
[[1520, 480], [1700, 480], [2060, 480], [2240, 480], [1520, 640], [1700, 640], [2060, 640], [2240, 640]].forEach(([x, y], i) => STACKS.push({ x, y, w: 130, h: 56, n: 1 + (i * 7 % 3), col: ['#E11D48', '#2563EB', '#F59E0B', '#16A34A', '#7C3AED', '#0EA5E9'][i % 6] }));
const CRANE = { x0: 1840, x1: 2020, y: 600 };   // قائمتا الرافعة الجسرية تمشيان على قضبان شمال-جنوب
const PIERS = [[430, 60, 150], [1030, 60, 150], [1700, 60, 150]];   // [x يسار المرسى، عرضه، طرفه الشمالي] مراسٍ خشبية تمتد في البحر
const BOATS = [{ x: 400, y: 240, c: '#E11D48' }, { x: 520, y: 330, c: '#2563EB' }, { x: 1110, y: 200, c: '#F59E0B' }, { x: 1640, y: 300, c: '#16A34A' }, { x: 1790, y: 220, c: '#F8FAFC' }];
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 1070, x1: 1230, sw: 28, top: YARD - 40, bottom: 1800 }, RING = { x: 1150, y: 1240, r: 175, island: 82 };
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const PALMS = [
  ...[60, 200, 760, 1300, 1430, 2380].map(x => [x, QUAY + 40, 1.05]),   // نخيل الكورنيش
  ...[80, 230, 380, 530, 680, 830, 1760, 1910, 2060, 2210, 2360].filter(x => !avoid(x, [[1300, 1720]])).map(x => [x, 1172, 1]),
  ...[80, 230, 380, 530, 1560, 1760, 1910, 2060, 2210, 2360].filter(x => !avoid(x, [[1290, 1500], [640, 890]])).map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1400, 1520, 1640, 1760].flatMap(y => [[1024, y, 1], [1276, y, 1]])
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y));
const LAMPS = [[130, QUAY + 30], [330, QUAY + 30], [830, QUAY + 30], [1300, QUAY + 30], [1500, QUAY + 30], [2300, QUAY + 30], [1030, 920], [1270, 920], [1030, 1460], [1270, 1460], [1030, 1700], [1270, 1700], [460, 1300], [1960, 1180]];
const STALLS = [[1380, 1120, '#C2410C'], [1480, 1120, '#0E7490'], [1580, 1120, '#7C3AED'], [1350, 1345, '#15803D'], [1450, 1345, '#BE185D']];

const rect = (x, y, w, h) => ({ x, y, w, h });
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  pitch: [700, 1050, 240, 115],
  zebras: [[600, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1760, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 830, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1290, 1440, 120, 40], [880, 1440, 120, 40], [1290, 960, 110, 40]],
  fountains: [[1880, 1120, 42]],
  signs: [{ x: 1320, y: 1176, lines: ['⬆ الميناء', '⬅ الملعب', '➡ السوق'] }, { x: 975, y: 1330, lines: ['⬆ الميناء', '⬇ المسجد'] }],
  mailboxes: villas, benches: [[600, QUAY + 40], [1350, QUAY + 40], [2000, QUAY + 40], [380, 1150], [2060, 1150]], rugs: [[200, 1118]],
  sitters: [{ x: 160, y: 1110, dir: 'right', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#0E7490', beard: '#E5E5E5', elder: true } }, { x: 242, y: 1112, dir: 'left', look: { kind: 'man', skin: '#B5835A', robe: '#F7F5EF', accent: '#B45309', beard: '#2B2118' } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  goats: [], goatArea: [0, 0, 1, 1],
  bike: { x0: 1520, x1: 2340, y: 1294 },
  shuttles: [{ from: 1060, to: YARD - 10, xUp: 1190, xDown: 1110, col: '#0EA5E9', truck: true }, { from: 1880, to: 1440, xUp: 1190, xDown: 1110, col: '#E11D48' }],
  birdC: [1200, 300]
};
const life = lifeInit(STREET);
// القوارب في البحر: تتهادى في أماكنها، وقارب صيد يبحر ذهاباً وإياباً
const boatLife = { t: 0, sail: { x: 200, dir: 1 } };
export default {
  id: 'scales',
  size: { w: W, h: H }, SEA, QUAY, YARD,
  HOMES, STREET, life, boatLife, MOSQUE, MINARET, MARKET, WAREHOUSE, TOWER, STACKS, CRANE, PIERS, BOATS, STALLS, PALMS, LAMPS, RING,
  start: { x: 1050, y: 1740 },
  gate: { x: 2260, y: 1760 },   // بوابة القرية التالية (villages/gate.js)
  mood: { sky: '#8FD0F5', fog: '#D3EEFB', fogNear: 1800, fogFar: 5600, exposure: .95,
    hemi: ['#FFFFFF', '#8FA9B8', 1.25], sun: { color: '#FFF4DE', i: 2.4, dir: [-.45, 1, .6] }, accent: '#38BDF8', sky2d: '#A9DCF7' },
  ambience: 'harbor', music: 'harbor',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); boatLife.t += dt; const s = boatLife.sail; s.x += s.dir * 40 * dt; if (s.x > W - 150 || s.x < 150) s.dir *= -1; },
  solids: [
    rect(0, 0, W, 150), ...[[0, 430], [490, 1030], [1090, 1700], [1760, W]].map(([a, b]) => rect(a, 150, b - a, SEA - 150 + 10)),   // البحر عدا المراسي الثلاثة
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)), ...MARKET.map(([x, y]) => rect(x - 40, y - 30, 80, 30)),
    rect(WAREHOUSE.x, WAREHOUSE.y, WAREHOUSE.w, WAREHOUSE.h), rect(TOWER.x - TOWER.r, TOWER.y - 30, TOWER.r * 2, 36),
    ...STACKS.map(s => rect(s.x, s.y, s.w, s.h)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, ...STREET.fountains.map(([x, y, r]) => ({ x, y: y - 6, r })), ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })), ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 }))],
  stations: [
    { id: 'mentalDec8', x: 800, y: 660, stand: { x: 800, y: 730 }, label: 'ميزان السمك', icon: '⚖️', kind: 'scale', mh: 170 },
    { id: 'powersTen8', x: 1930, y: 730, stand: { x: 1930, y: 790 }, label: 'رافعة الحاويات', icon: '🏗️', kind: 'crane', mh: 330 },
    { id: 'rounding8', x: 1050, y: 650, stand: { x: 1050, y: 715 }, label: 'ملصقات الشحنات', icon: '🏷️', kind: 'printer', mh: 200 },
    { id: 'orderOps8', x: 260, y: 600, stand: { x: 260, y: 680 }, label: 'برج المراقبة', icon: '🗼', kind: 'tower', mh: 330 }
  ],
  people: [
    { id: 'hamood', x: 880, y: 700, look: { kind: 'man', skin: '#B5835A', robe: '#F7F5EF', accent: '#0E7490', apron: '#0E7490', beard: '#2B2118' } },
    { id: 'nawal', x: 2010, y: 760, look: { kind: 'woman', skin: '#C99A72', robe: '#1E3A8A', accent: '#F59E0B', vest: '#F59E0B' } },
    { id: 'khalfan', x: 1140, y: 680, look: { kind: 'man', skin: '#A8764E', robe: '#E5E7EB', accent: '#B45309', beard: '#1C1410', glasses: true } },
    { id: 'rashed', x: 340, y: 670, look: { kind: 'man', skin: '#B88660', robe: '#F2EEE4', accent: '#1E3A8A', beard: '#2B2118', tall: 1.05 } }
  ],
  walkers: [
    { path: [[150, QUAY + 60], [950, QUAY + 60]], look: { kind: 'woman', skin: '#C99A72', robe: '#0F766E', accent: '#FFC94A' } },
    { path: [[1320, QUAY + 60], [2350, QUAY + 60]], look: { kind: 'man', skin: '#B07A50', robe: '#F4F1E8', accent: '#2F6FB2' } },
    { path: [[455, 200], [455, QUAY + 10]], look: { kind: 'man', skin: '#A8764E', robe: '#6B5A48', accent: '#E3B04B', hat: 'cap' } },
    { path: [[1370, 1165], [1700, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[300, 1186], [960, 1186]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } },
    { path: [[1300, 1388], [2250, 1388]], look: { kind: 'girl', skin: '#C68A5B', robe: '#D85C7B', accent: '#E3B04B' } }
  ],
  lessons: {
    mentalDec8: () => import('./mentalDec8.js'), powersTen8: () => import('./powersTen8.js'),
    rounding8: () => import('./rounding8.js'), orderOps8: () => import('./orderOps8.js')
  },
  adventure: () => import('./adventure.js'),   // «لغز الحاوية الخضراء» بعد إنهاء الدروس الأربعة
  kit3d, kit2d
};
