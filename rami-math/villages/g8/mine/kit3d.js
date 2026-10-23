// منجم الأعماق مجسّماً بمكتبة العالم المفتوح (renderer3d): بيوت عُمانية ومسجد بقبة ومئذنة (omani.js)، نخيل يتمايل وجبال بعيدة
// وسحب (nature.js)، أعمدة إنارة وبئر (props.js)، جمل في السوق (animals.js)؛ ومن صنع القرية: جبل من الحجر الرملي بأفواه كهوف
// يتوهج البلّور فيها، والبوابة الكبرى المنحوتة، وبرج الرفع ببكرة تدور، وأكشاك بمظلات مخططة، وعربات وأكوام خام، ورايات.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds } from '../../../renderer3d/nature.js';
import { streetLamps, well } from '../../../renderer3d/props.js';
import { buildCamel, animateCamel } from '../../../renderer3d/animals.js';

export function kit3d(THREE, { high, def: D }) {
  const W = D.size.w, CLIFF = D.CLIFF, root = new THREE.Group(), ticks = [];
  const rnd = (x, y, k = 0) => { const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
  const rockM = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .95 }), col = new THREE.Color(), tmp = new THREE.Color();
  const paint = (g, hex, jit = .14, hTop = 0) => { g = g.index ? g.toNonIndexed() : g; const p = g.attributes.position, c = new Float32Array(p.count * 3); col.set(hex);
    for (let k = 0; k < p.count; k++) { const n = (Math.sin(p.getX(k) * .05 + p.getZ(k) * .03 + p.getY(k) * .04) * .5 + .5) * jit, ao = hTop ? .6 + .4 * Math.min(1, Math.max(0, p.getY(k) / hTop)) : 1; tmp.copy(col).multiplyScalar((1 - jit / 2 + n) * ao); c[k * 3] = tmp.r; c[k * 3 + 1] = tmp.g; c[k * 3 + 2] = tmp.b; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); if (g.attributes.uv) g.deleteAttribute('uv'); return g; };
  const jag = (g, s) => { const p = g.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k), d = 1 + (rnd(Math.round(x), Math.round(z) + Math.round(y), s) - .5) * .3; p.setXYZ(k, x * d, y * d, z * d); } g.computeVertexNormals(); return g; };
  const glowM = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.5, roughness: .25 });
  const wood = material('wood', '#7A4A2A'), iron = material('metal', '#8C8F96', { rough: .5, metal: .8 });

  // ١. البيوت والمسجد والمئذنة
  D.HOUSES.forEach((b, i) => root.add(omaniHouse(b, i === 0 ? { tower: 'left' } : i === 8 ? { tower: 'right' } : {})));
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  // ٢. النخيل والإنارة والبئر
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  // بساتين نخيل خارج حدود القرية (شرقاً وغرباً وجنوباً) تملأ الأفق
  { const ring = []; for (let i = 0; i < 70; i++) { const side = i % 3, u = rnd(i, 21), v = rnd(i, 22);
      ring.push(side === 0 ? { x: -60 - v * 500, y: 500 + u * 1500, s: .9 + v * .4 } : side === 1 ? { x: W + 60 + v * 500, y: 500 + u * 1500, s: .9 + v * .4 } : { x: u * W, y: D.size.h + 60 + v * 500, s: .9 + v * .4 }); }
    root.add(palms(ring)); }
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  root.add(well(D.WELL.x, D.WELL.y - 14, D.WELL.r - 4, true));
  // ٣. أكشاك السوق: قوائم ومظلة مخططة وطاولة وبضاعة ملوّنة
  D.STALLS.forEach(([x, y, c]) => { const P = new Parts();
    [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12)));
    P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15));
    for (let k = 0; k < 5; k++) P.add(material('flat', k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12));
    ['#C46A1E', '#4E7A34', '#E3B04B', '#B8413A'].forEach((g2, k) => { for (let i = 0; i < 3; i++) P.add(material('flat', g2), new THREE.SphereGeometry(4, 8, 6).translate(x - 28 + k * 18 + i * 4, 37, y - 18 + (i % 2) * 6)); });
    root.add(P.build()); });
  // ٤. الجبل: كتل حجر رملي مكسّرة بارتفاعات مختلفة، وأفواه الكهوف والبوابة الكبرى
  { const P = new Parts();
    for (let row = 0; row < 4; row++) for (let x = -40; x < W + 80; x += 70) {
      const caveNear = D.CAVES.some(cv => Math.abs(cv.x - x) < cv.w / 2 + 30) && row === 3; if (caveNear) continue;
      const r = 70 + rnd(x, row) * 50, hgt = (row === 3 ? 180 : 230 + row * 30) + rnd(x, row, 2) * 140, g = jag(new THREE.IcosahedronGeometry(r, 1), x + row);
      g.scale(1.1, hgt / (r * 2), .9); g.translate(x + (rnd(x, row, 3) - .5) * 30, hgt * .45, CLIFF - 40 - row * 105 + (rnd(x, row, 4) - .5) * 30);
      P.add(rockM, paint(g, ['#C9A26E', '#B98E5B', '#D2AE7C', '#A9825A'][(Math.round(x / 70) + row) % 4], .16, hgt), { uv: false });
    }
    D.CAVES.forEach(cv => {   // جانبا الفم وسقفه صخر، والداخل مظلم
      const x = cv.x, w = cv.w, hh = cv.id === 'gate' ? 220 : 165;
      [-1, 1].forEach(sd => { const g = jag(new THREE.IcosahedronGeometry(70, 1), x + sd * 9); g.scale(.9, hh * 1.2 / 140, .8); g.translate(x + sd * (w / 2 + 50), hh * .55, CLIFF - 50); P.add(rockM, paint(g, '#B98E5B', .16, hh), { uv: false }); });
      const top = jag(new THREE.IcosahedronGeometry(w * .62, 1), x + 77); top.scale(1, .55, .8); top.translate(x, hh + 40, CLIFF - 60); P.add(rockM, paint(top, '#C9A26E', .16), { uv: false });
      P.add(rockM, paint(box(w + 10, hh + 20, 30, x, (hh + 20) / 2, CLIFF - 95), '#21170F', .05), { uv: false });
      if (cv.id === 'gate') {   // إطار حجري ومصراعان بأقفال ذهبية
        P.add(material('stone', '#8C7E70'), box(26, hh, 30, x - w / 2 - 12, hh / 2, CLIFF - 70)); P.add(material('stone', '#8C7E70'), box(26, hh, 30, x + w / 2 + 12, hh / 2, CLIFF - 70)); P.add(material('stone', '#8C7E70'), box(w + 70, 28, 34, x, hh + 10, CLIFF - 70));
        P.add(material('metal', '#4A443E', { rough: .55, metal: .6 }), box(w - 8, hh - 10, 8, x, (hh - 10) / 2, CLIFF - 72));
      } else {   // إطار خشبي يسند الفم
        [-1, 1].forEach(sd => P.add(wood, box(14, hh * .62, 14, x + sd * (w / 2 - 8), hh * .31, CLIFF - 70))); P.add(wood, box(w, 14, 16, x, hh * .62, CLIFF - 70));
      }
    });
    root.add(P.build());
    D.CAVES.forEach(cv => {   // البلّور المتوهج داخل الكهفين، والأقفال الذهبية على البوابة
      if (cv.id === 'gate') { [[-40, 150], [40, 150], [-40, 90], [40, 90]].forEach(([a, b]) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 5, 20), glowM('#FFC94A')); d.rotation.x = Math.PI / 2; d.position.set(cv.x + a, b, CLIFF - 66); root.add(d); }); return; }
      const c = cv.id === 'crystal' ? '#5FD3FF' : '#FFB347', m = glowM(c);
      [[-40, 1.2], [0, 1.6], [42, 1.1], [-15, .8], [22, .9]].forEach(([dx, k]) => { const cn = new THREE.Mesh(new THREE.ConeGeometry(9 * k, 46 * k, 6), m); cn.position.set(cv.x + dx, 23 * k, CLIFF - 72 + (rnd(dx, k) - .5) * 10); cn.rotation.z = (rnd(dx, 3) - .5) * .5; root.add(cn); });
      if (high) { const L = new THREE.PointLight(c, 30000, 360, 2); L.position.set(cv.x, 60, CLIFF - 40); root.add(L); }
      ticks.push(t => { m.emissiveIntensity = 1.3 + .4 * Math.sin(t * 1.7 + cv.x); });
    });
  }
  // ٥. ساحة المنجم: عربات وأكوام خام
  D.CARTS.forEach(([x, y, c]) => { const P = new Parts(); P.add(iron, box(56, 26, 32, x, 22, y - 14)); P.add(material('metal', '#5C4033', { rough: .7, metal: .3 }), box(60, 4, 36, x, 36, y - 14));
    [-18, 18].forEach(a => [-16, 16].forEach(b => P.add(material('metal', '#2B2B2F'), new THREE.CylinderGeometry(7, 7, 4, 12).rotateX(Math.PI / 2).translate(x + a, 8, y - 14 + b))));
    P.add(rockM, paint(new THREE.DodecahedronGeometry(18, 0).scale(1.3, .55, .9).translate(x, 40, y - 14), c, .2), { uv: false }); root.add(P.build()); });
  D.ORE.forEach(([x, y, c]) => { const P = new Parts(); for (let i = 0; i < 9; i++) { const r = 9 + rnd(x, i) * 8; P.add(rockM, paint(new THREE.DodecahedronGeometry(r, 0).translate(x + (rnd(x, i) - .5) * 50, r * .6 + (i > 5 ? 14 : 0), y - 10 + (rnd(y, i) - .5) * 26), i % 3 ? c : '#6E6256', .2), { uv: false }); } root.add(P.build()); });
  // ٦. برج الرفع (محطة المصعد): قوائم خشبية مائلة ودعامات وبكرة تدور، وقفص فوق البئر
  { const s = D.stations.find(q => q.kind === 'elevator'), x = s.x, z = s.y - 30, P = new Parts(), Ht = 270;
    P.add(rockM, paint(box(120, 6, 50, x, 3, z - 5), '#21170F', .05), { uv: false });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const g = new THREE.CylinderGeometry(5, 6.5, Ht + 10, 7); g.rotateZ(-a * .17); g.rotateX(b * .12); g.translate(x + a * 47, Ht / 2, z + b * 20); P.add(wood, g); });
    for (let k = 1; k < 5; k++) { const y = Ht * k / 5, sp = 70 - 44 * k / 5; P.add(wood, box(sp * 2, 6, 6, x, y, z + 22 - 14 * k / 5)); P.add(wood, box(sp * 2, 6, 6, x, y, z - 22 + 14 * k / 5)); }
    P.add(wood, box(70, 10, 50, x, Ht, z));
    P.add(iron, box(3, 140, 3, x, Ht - 70 - 30, z));
    [[-24, -18], [24, -18], [-24, 18], [24, 18]].forEach(([a, b]) => P.add(iron, box(4, 64, 4, x + a, 82, z + b))); [50, 114].forEach(y => { P.add(iron, box(52, 4, 4, x, y, z + 18)); P.add(iron, box(52, 4, 4, x, y, z - 18)); P.add(iron, box(4, 4, 40, x + 24, y, z)); P.add(iron, box(4, 4, 40, x - 24, y, z)); });
    for (let k = -16; k <= 16; k += 8) P.add(iron, box(1.6, 64, 1.6, x + k, 82, z + 18));
    root.add(P.build());
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(24, 3.5, 8, 24), material('metal', '#B88A2E', { rough: .35, metal: .9 })); wheel.position.set(x, Ht + 22, z); root.add(wheel);
    ticks.push(t => { wheel.rotation.z = t * 1.4; });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(4.5, 10, 8), glowM('#FFC46B')); lamp.position.set(x, 104, z); root.add(lamp);
    const sg = signMesh('🛗 مصعد المنجم', 16); sg.position.set(x + 100, 60, z + 30); root.add(sg);
    const post = new Parts(); post.add(wood, box(6, 60, 6, x + 100, 30, z + 26)); root.add(post.build());
  }
  // ٧. قوس مدخل المنجم ولافتات الكهوف
  { const P = new Parts(), y = D.YARD; [-92, 92].forEach(o => P.add(wood, box(12, 140, 12, 1150 + o, 70, y))); P.add(wood, box(212, 14, 14, 1150, 140, y)); root.add(P.build());
    const sg = signMesh('⛏️ منجم الأعماق', 22); sg.position.set(1150, 118, y + 8); root.add(sg);
    D.stations.forEach(s => { if (s.kind === 'elevator') return; const t2 = { crystals: '💎 كهف البلّور', doubler: '✨ كهف التضاعف', gate: '🚪 بوابة القوانين' }[s.kind]; const m = signMesh(t2, 18); m.position.set(s.x, s.kind === 'gate' ? 268 : 205, CLIFF - 20); root.add(m); });
  }
  // ٨. رايات ملوّنة فوق الشارع الرئيسي
  [[1010, ['#C2410C', '#FFC94A', '#0E7490', '#15803D']], [1470, ['#7C3AED', '#FFC94A', '#BE185D', '#0E7490']]].forEach(([y, cols]) => {
    const a = new THREE.Vector3(1065, 92, y), b = new THREE.Vector3(1235, 92, y), n = 9;
    for (let k = 0; k < n; k++) { const u = (k + .5) / n, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22;
      const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), material('flat', cols[k % cols.length])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); }
  });
  // ٩. جمل في السوق، وجبال بعيدة، وسحب
  const camel = buildCamel(); root.add(camel.root); const cst = { x: 1800, y: 1250, dir: -1, moving: false, phase: 0, saddle: true, bells: true };
  try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) { console.error('[قرية الخير] الجبال البعيدة', e); }
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); animateCamel(camel, cst, 1 / 60, t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
