// قرية الوحدة الثالثة للصف الثامن: «مصنع التغليف» (الشبكات والزوايا) — بوحدات العالم المفتوح (بكسل).
// من الشمال: تلال بعيدة ← مجمّع المصنع: قاعة كبيرة بمدخنة، سير إنتاج خارجي تتحرك عليه الصناديق، رصيف تحميل وشاحنة، منصّات صناديق،
// رافعة شوكية تتجول، وخزان ماء ← قرية حديثة ملوّنة: حديقة ببحيرة وبطّ، ودوّار نصبه مكعب عملاق بشبكته، وأهل وسيارات.
import { kit3d } from './kit3d.js';
import { kit2d } from './kit2d.js';
import { composeHouse } from '../../houses.js';
import { lifeInit, lifeUpdate } from '../../street.js';

const W = 2400, H = 1800, YARD = 800, TOP = 120;
const HOUSE_SPECS = [
  { x: 1480, y: 880, w: 190, h: 120, kind: 'villa' }, { x: 1750, y: 880, w: 200, h: 115, kind: 'step' }, { x: 2020, y: 870, w: 190, h: 170, kind: 'court' },
  { x: 120, y: 1360, w: 200, h: 110, kind: 'L' }, { x: 400, y: 1360, w: 190, h: 120, kind: 'step' }, { x: 1560, y: 1360, w: 190, h: 160, kind: 'court' },
  { x: 1830, y: 1360, w: 190, h: 115, kind: 'villa' }, { x: 2110, y: 1370, w: 180, h: 110, kind: 'L' },
  { x: 250, y: 1600, w: 190, h: 115, kind: 'villa' }, { x: 530, y: 1600, w: 200, h: 110, kind: 'step' }, { x: 1650, y: 1600, w: 200, h: 150, kind: 'court' }, { x: 1940, y: 1600, w: 190, h: 110, kind: 'villa' }
].map((h, i) => ({ ...h, seed: 211 + i * 17 }));
const HOMES = HOUSE_SPECS.map(composeHouse);
const MOSQUE = { x: 680, y: 1360, w: 210, h: 140, wall: '#F3EEE3', door: '#7C3AED', mosque: 1, H: 84, style: 'mosque', doorW: 46, doorH: 72 };
const MINARET = { x: MOSQUE.x + MOSQUE.w - 34, y: MOSQUE.y + MOSQUE.h - 34, s: 30, H: 116 };
// مجمّع المصنع
const HALL = { x: 860, y: TOP + 60, w: 680, h: 240, H: 130 };   // القاعة الكبرى (أرضيتها) وبابها جنوباً
const CHIMNEY = { x: 1480, y: TOP + 120, r: 26, H: 260 };
const BELT = { x0: 1640, x1: 2300, y: 470 };   // سير إنتاج خارجي شرق القاعة
const LAB = { x: 300, y: 420, w: 240, h: 120, H: 100 };   // مختبر القصّ غرب القاعة
const TOWERW = { x: 160, y: 300, r: 40, H: 200 };   // خزان الماء
const PALLETS = [[700, 560], [780, 560], [1620, 640], [1700, 640], [2240, 620], [620, 660]];
const DOCK = { x: 1560, y: 560, w: 60, h: 120 };
const ROAD = { y0: 1196, y1: 1284, sw: 15 }, BLVD = { x0: 1070, x1: 1230, sw: 28, top: YARD - 60, bottom: 1800 }, RING = { x: 1150, y: 1240, r: 175, island: 82 };
const POND = { x: 420, y: 1000, rx: 230, ry: 90 };   // بحيرة الحديقة غرب الشارع
const avoid = (x, ranges) => ranges.some(([a, b]) => x > a && x < b);
const inside0 = (x, y) => HOMES.some(H => H.solids.concat(H.parts.map(p => ({ x: p.x - 10, y: p.y, w: p.w + 20, h: p.h + 80 }))).some(q => x > q.x - 14 && x < q.x + q.w + 14 && y > q.y - 10 && y < q.y + q.h + 24));
const inPond = (x, y, m = 30) => ((x - POND.x) / (POND.rx + m)) ** 2 + ((y - POND.y) / (POND.ry + m)) ** 2 < 1;
const PALMS = [
  ...[80, 230, 380, 530, 680, 830, 1760, 1910, 2060, 2210, 2360].filter(x => !avoid(x, [[1300, 1720]])).map(x => [x, 1172, 1]),
  ...[80, 230, 380, 530, 1560, 1760, 1910, 2060, 2210, 2360].filter(x => !avoid(x, [[1290, 1500], [640, 900]])).map(x => [x, 1318, .95]),
  ...[880, 1000, 1100, 1400, 1520, 1640, 1760].flatMap(y => [[1024, y, 1], [1276, y, 1]]),
  [130, 900, 1.1], [720, 900, 1], [160, 1090, .95], [700, 1100, 1.05]   // نخيل الحديقة حول البحيرة
].filter(([x, y]) => Math.hypot(x - RING.x, y - RING.y) > RING.r + 30 && !inside0(x, y) && !inPond(x, y));
const LAMPS = [[1030, 920], [1270, 920], [1030, 1460], [1270, 1460], [1030, 1700], [1270, 1700], [460, 1300], [1960, 1180], [300, 870], [600, 1110]];
const STALLS = [[1380, 1120, '#C2410C'], [1480, 1120, '#0E7490'], [1580, 1120, '#7C3AED'], [1350, 1345, '#15803D'], [1450, 1345, '#BE185D']];

const rect = (x, y, w, h) => ({ x, y, w, h });
const villas = HOMES.flatMap(Hm => Hm.gates.map(gt => [gt.x + gt.gap / 2 + 24, gt.y + 16, gt.col]));
const STREET = { W, grassTop: YARD + 30, road: ROAD, blvd: BLVD, ring: RING,
  zebras: [[600, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [1760, ROAD.y0, 56, ROAD.y1 - ROAD.y0], [BLVD.x0, 1440, BLVD.x1 - BLVD.x0, 44, true], [BLVD.x0, 830, BLVD.x1 - BLVD.x0, 44, true]],
  beds: [[1290, 1440, 120, 40], [880, 1440, 120, 40], [1290, 960, 110, 40], [820, 880, 90, 40]],
  fountains: [[1880, 1120, 42]],
  signs: [{ x: 1320, y: 1176, lines: ['⬆ المصنع', '⬅ الحديقة', '➡ السوق'] }, { x: 975, y: 1330, lines: ['⬆ المصنع', '⬇ المسجد'] }],
  mailboxes: villas, benches: [[250, 1110], [620, 1108], [420, 885], [2060, 1150]], rugs: [],
  sitters: [{ x: 560, y: 1120, dir: 'up', look: { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#7C3AED', beard: '#E5E5E5', elder: true } }, { x: 300, y: 1120, dir: 'up', look: { kind: 'woman', skin: '#C99A72', robe: '#0F766E', accent: '#FFC94A', elder: true } }],
  cats: HOMES.flatMap(Hm => Hm.walls.slice(0, 1).map(q => [q.x + 5, q.y + 30, 34])).slice(0, 4),
  goats: [], goatArea: [0, 0, 1, 1],
  bike: { x0: 1520, x1: 2340, y: 1294 },
  shuttles: [{ from: 1060, to: YARD - 20, xUp: 1190, xDown: 1110, col: '#7C3AED', truck: true }, { from: 1880, to: 1440, xUp: 1190, xDown: 1110, col: '#16A34A' }],
  birdC: [1150, 900]
};
const life = lifeInit(STREET);
// حياة المصنع: صناديق على السير، ورافعة شوكية تتنقل بين المنصّات، وبطّ في البحيرة
const fac = { t: 0, boxes: [0, .2, .4, .6, .8], fork: { x: 640, y: 720, i: 0, dir: 'right' }, ducks: [0, 1.5, 3.2, 4.6] };
const FORK_PATH = [[640, 720], [1500, 720], [1500, 640], [1800, 720], [2200, 720], [1500, 720]];
export default {
  id: 'packing',
  size: { w: W, h: H }, YARD, TOP,
  HOMES, STREET, life, fac, FORK_PATH, MOSQUE, MINARET, HALL, CHIMNEY, BELT, LAB, TOWERW, PALLETS, DOCK, POND, PALMS, LAMPS, STALLS, RING,
  start: { x: 1050, y: 1740 },
  gate: { x: 2260, y: 1760 },   // بوابة القرية التالية (villages/gate.js)
  mood: { sky: '#A5D8F5', fog: '#DCEFF9', fogNear: 1800, fogFar: 5600, exposure: .95,
    hemi: ['#FFFFFF', '#A89070', 1.25], sun: { color: '#FFF1D6', i: 2.4, dir: [-.45, 1, .6] }, accent: '#FB923C', sky2d: '#B9E0F7' },
  ambience: 'workshop', music: 'workshop',
  update: (dt, st) => { lifeUpdate(life, STREET, st, dt, W); fac.t += dt;
    fac.boxes = fac.boxes.map(u => (u + dt * .07) % 1);
    const f = fac.fork, [tx, ty] = FORK_PATH[(f.i + 1) % FORK_PATH.length], dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy), sp = 70 * dt;
    if (d < sp) { f.i = (f.i + 1) % FORK_PATH.length; f.x = tx; f.y = ty; } else { f.x += dx / d * sp; f.y += dy / d * sp; f.ang = Math.atan2(dy, dx); } },
  solids: [
    rect(0, 0, W, TOP),
    ...HOMES.flatMap(H => H.solids), rect(MOSQUE.x, MOSQUE.y, MOSQUE.w, MOSQUE.h),
    ...STALLS.map(([x, y]) => rect(x - 40, y - 30, 80, 30)),
    rect(HALL.x, HALL.y, HALL.w, HALL.h), rect(LAB.x, LAB.y, LAB.w, LAB.h), rect(BELT.x0, BELT.y - 30, BELT.x1 - BELT.x0, 40), rect(DOCK.x, DOCK.y, DOCK.w, DOCK.h),
    ...PALLETS.map(([x, y]) => rect(x - 32, y - 26, 64, 30)),
    ...STREET.benches.map(([x, y]) => rect(x - 18, y - 12, 36, 12))
  ],
  obstacles: [{ x: RING.x, y: RING.y, r: RING.island }, { x: CHIMNEY.x, y: CHIMNEY.y, r: CHIMNEY.r }, { x: TOWERW.x, y: TOWERW.y, r: TOWERW.r }, ...STREET.fountains.map(([x, y, r]) => ({ x, y: y - 6, r })), ...STREET.signs.map(q => ({ x: q.x, y: q.y, r: 6 })),
    ...PALMS.map(([x, y]) => ({ x, y: y - 3, r: 10 })), ...LAMPS.map(([x, y]) => ({ x, y, r: 6 })), ...Array.from({ length: 18 }, (_, k) => { const a = k / 18 * Math.PI * 2; return { x: POND.x + Math.cos(a) * POND.rx * .72, y: POND.y + Math.sin(a) * POND.ry * .72, r: Math.min(POND.rx, POND.ry) * .55 }; })],
  stations: [
    { id: 'nets8', x: 1960, y: 530, stand: { x: 1960, y: 600 }, label: 'خط الطيّ', icon: '📦', kind: 'fold', mh: 190 },
    { id: 'angleProps8', x: 420, y: 590, stand: { x: 420, y: 660 }, label: 'مختبر الزوايا', icon: '📐', kind: 'lab', mh: 210 },
    { id: 'angleProb8', x: 1200, y: 560, stand: { x: 1200, y: 630 }, label: 'سيور الإنتاج', icon: '⚙️', kind: 'belts', mh: 210 }
  ],
  people: [
    { id: 'suad', x: 2050, y: 600, look: { kind: 'woman', skin: '#C99A72', robe: '#C2410C', accent: '#FB923C', vest: '#FACC15' } },
    { id: 'tariq', x: 510, y: 640, look: { kind: 'man', skin: '#B88660', robe: '#F2EEE4', accent: '#1E3A8A', beard: '#2B2118', glasses: true } },
    { id: 'hind', x: 1290, y: 620, look: { kind: 'woman', skin: '#B5835A', robe: '#334155', accent: '#0EA5E9', vest: '#FACC15' } }
  ],
  walkers: [
    { path: [[900, 640], [1450, 640]], look: { kind: 'man', skin: '#A8764E', robe: '#475569', accent: '#FACC15', hat: 'cap', vest: '#FACC15' } },
    { path: [[1700, 760], [2300, 760]], look: { kind: 'woman', skin: '#C99A72', robe: '#7C3AED', accent: '#FACC15', vest: '#FACC15' } },
    { path: [[200, 868], [640, 868]], look: { kind: 'girl', skin: '#C68A5B', robe: '#F472B6', accent: '#FFFFFF' } },
    { path: [[1370, 1165], [1700, 1165]], look: { kind: 'woman', skin: '#C99A72', robe: '#8E3B5E', accent: '#2E8B57' } },
    { path: [[1300, 1388], [2250, 1388]], look: { kind: 'boy', skin: '#B5835A', robe: '#F7F5EF', accent: '#B8413A' } }
  ],
  lessons: { nets8: () => import('./nets8.js'), angleProps8: () => import('./angleProps8.js'), angleProb8: () => import('./angleProb8.js') },
  adventure: () => import('./adventure.js'),   // «يوم العطل الكبير» بعد إنهاء الدروس الثلاثة
  kit3d, kit2d
};
