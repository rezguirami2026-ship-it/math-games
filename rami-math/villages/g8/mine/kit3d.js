// منجم الأعماق مجسّماً: صخر بحواف مكسّرة، أرض حجرية وألواح خشب وسكة بعوارض، هوّة بتوهج بلّوري، مصابيح بضوء حقيقي
// (في الجودة العالية)، بلورات متوهجة، وأربع محطات: قفص المصعد، عرق البلّور، منصة التضاعف، والبوابة الكبرى بأقفالها.
import { box, cyl, sphere } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { signMesh } from '../../../renderer3d/omani.js';

export function kit3d(THREE, { S, Parts, high }) {
  const rock = material('flat', '#5A5048', { rough: .95 }), plank = material('wood', '#7B5232');
  const iron = material('metal', '#8C8F96', { rough: .5, metal: .8 }), timber = material('wood', '#6A4428'), glow = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.6, roughness: .25, metalness: .1 });
  const rnd = (x, y, k = 0) => { const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
  const H = c => (c.h || 1) * S;
  // صخر بلون من رؤوس الشكل نفسه (بلا خامات): مادة واحدة مسطّحة التظليل لكل الصخر والأرض
  const rockM = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .95, metalness: 0 });
  const col = new THREE.Color(), tmp = new THREE.Color();
  function paint(g, hex, jit = .12, hTop = 0) {   // لون لكل رأس: تفاوت بسيط، وتعتيم قرب الأرض (بديل الإطباق المحيطي)
    g = g.index ? g.toNonIndexed() : g; const p = g.attributes.position, c = new Float32Array(p.count * 3); col.set(hex);
    for (let k = 0; k < p.count; k++) { const y = p.getY(k), n = (Math.sin(p.getX(k) * .11 + p.getZ(k) * .07) * .5 + .5) * jit, ao = hTop ? .55 + .45 * Math.min(1, Math.max(0, y / hTop)) : 1;
      tmp.copy(col).multiplyScalar((1 - jit / 2 + n) * ao); c[k * 3] = tmp.r; c[k * 3 + 1] = tmp.g; c[k * 3 + 2] = tmp.b; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.deleteAttribute('uv'); return g;
  }
  function jag(g, sx, sy) {   // حواف مكسّرة: إزاحة كل رأس حسب موضعه (الرؤوس المشتركة تبقى ملتصقة)
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k), d = 1 + (rnd(Math.round(x * 3) + sx, Math.round(z * 3) + Math.round(y * 5) + sy) - .5) * .32; p.setXYZ(k, x * d, y * d, z * d); }
    g.computeVertexNormals(); return g;
  }
  const hAt = (vx, vz) => (rnd(Math.round(vx), Math.round(vz), 9) - .5) * 3;   // ارتفاع رؤوس الأرض: نفس القيمة للرأس المشترك بين بلاطتين
  function ground(cx, cy, pal = ['#4A4139', '#52483E', '#463D35']) {
    const g = new THREE.PlaneGeometry(S, S, 2, 2).rotateX(-Math.PI / 2).translate((cx + .5) * S, 0, (cy + .5) * S), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) p.setY(k, hAt(p.getX(k), p.getZ(k)));
    g.computeVertexNormals(); return paint(g, pal[(cx * 3 + cy) % 3], .3);
  }
  const edge = (c, grid) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const n = grid && grid.at(c.x + dx, c.y + dy); return n && !n.wall; });
  let gridRef = null;
  return {
    floor(P, c) {
      const x = (c.x + .5) * S, z = (c.y + .5) * S;
      if (c.floor === 'chasm') {   // هوّة: جدران داخلية مظلمة وقاع يتوهج بلوناً بلّورياً بعيداً
        P.add(material('flat', '#0B0A10', { rough: 1 }), box(S, 2, S, x, -150, z)); return;
      }
      if (c.floor === 'sand') { P.add(rockM, ground(c.x, c.y, ['#DDBF8A', '#D6B47C', '#E3C795']), { uv: false }); return; }   // ساحة القرية
      if (c.floor === 'planks') {   // ألواح خشب بدرجات بنية متفاوتة وفواصل داكنة بينها
        P.add(rockM, paint(box(S, 2, S, x, -1, z), '#2A1D14', .1), { uv: false });
        for (let i = 0; i < 4; i++) P.add(rockM, paint(box(S - 1.5, 4, S / 4 - 2, x, 1.5 + rnd(c.x, c.y, i) * .8, c.y * S + S / 8 + i * S / 4 + 1), ['#8A5A34', '#7A4E2C', '#946540', '#6F4728'][(c.x + i * 3 + c.y * 2) % 4], .2), { uv: false });
        return; }
      P.add(rockM, ground(c.x, c.y), { uv: false });   // أرض صخرية متصلة الارتفاع بين البلاطات
      if (rnd(c.x, c.y, 7) < .28) for (let i = 0; i < 3; i++) { const r = 2 + rnd(c.x, c.y, i + 20) * 3.5; P.add(rockM, paint(new THREE.DodecahedronGeometry(r, 0).translate(x + (rnd(c.x, c.y, i + 30) - .5) * S * .8, r * .4, z + (rnd(c.x, c.y, i + 40) - .5) * S * .8), '#6E6256', .15), { uv: false }); }
      if (c.floor === 'rail') {   // عوارض خشبية وقضيبان حديديان على امتداد النفق
        const along = gridRef && (gridRef.at(c.x + 1, c.y)?.floor === 'rail' || gridRef.at(c.x - 1, c.y)?.floor === 'rail') ? 'x' : 'z';
        for (let i = 0; i < 3; i++) { const o = -S / 2 + S / 6 + i * S / 3; P.add(timber, along === 'x' ? box(7, 4, S * .8, c.x * S + S / 2 + o, 4, z) : box(S * .8, 4, 7, x, 4, c.y * S + S / 2 + o)); }
        for (const o of [-11, 11]) P.add(iron, along === 'x' ? box(S, 3, 3, x, 7.5, z + o) : box(3, 3, S, x + o, 7.5, z));
      }
    },
    wall(P, c) {
      const x = (c.x + .5) * S, z = (c.y + .5) * S, h = H(c);
      if (c.wall === 'house') {   // بيت طيني: جدران جصية، حافة سقف بارزة، وباب ونافذة على الوجه المطل على الساحة
        P.add(rockM, paint(box(S, h, S, x, h / 2, z), '#E6D3AE', .12, h), { uv: false });
        P.add(rockM, paint(box(S + 4, 5, S + 4, x, h + 2, z), '#CDB58C', .1), { uv: false });
        const south = gridRef && gridRef.at(c.x, c.y + 1) && !gridRef.at(c.x, c.y + 1).wall, east = gridRef && gridRef.at(c.x + 1, c.y) && !gridRef.at(c.x + 1, c.y).wall;
        if (south) P.add(rockM, paint(c.x % 2 ? box(14, 30, 2, x, 15, z + S / 2 + 1) : box(12, 12, 2, x, h * .62, z + S / 2 + 1), c.x % 2 ? '#6B4226' : '#2B4C6F', .05), { uv: false });
        if (east) P.add(rockM, paint(box(2, 12, 12, x + S / 2 + 1, h * .62, z), '#2B4C6F', .05), { uv: false });
        return;
      }
      if (c.wall === 'hill') {   // تلال من الحجر الرملي حول القرية
        for (let i = 0; i < 2; i++) { const r = S * (.5 + rnd(c.x, c.y, i + 2) * .2), g = jag(new THREE.IcosahedronGeometry(r, 1), c.x * 5 + i, c.y * 3 + i);
          g.scale(1, (h + 14) / (r * 1.6), 1); g.translate(x + (rnd(c.x, c.y, i + 5) - .5) * S * .4, (h + 14) * .42, z + (rnd(c.x, c.y, i + 6) - .5) * S * .4);
          P.add(rockM, paint(g, ['#C9A26E', '#B98E5B', '#D2AE7C'][(c.x + c.y + i) % 3], .16, h), { uv: false }); }
        return;
      }
      if (!edge(c, gridRef)) { P.add(rockM, paint(box(S, 6, S, x, h + (rnd(c.x, c.y) - .5) * 10, z), '#1C1814', .25), { uv: false }); return; }   // صخر داخلي: سطح مظلم فقط
      // صخرة حافة: كتلتان أو ثلاث بحواف مكسّرة، أغمق عند القاعدة وأفتح عند القمة
      const n = 2 + (rnd(c.x, c.y, 1) > .5 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const r = S * (.42 + rnd(c.x, c.y, i + 2) * .22), g = jag(new THREE.IcosahedronGeometry(r, 1), c.x * 7 + i, c.y * 5 + i);
        g.scale(1, (h + 10) / (r * 1.7) * (.8 + rnd(c.x, c.y, i + 4) * .4), 1);
        g.translate(x + (rnd(c.x, c.y, i + 5) - .5) * S * .45, (h + 10) * .42, z + (rnd(c.x, c.y, i + 6) - .5) * S * .45);
        P.add(rockM, paint(g, ['#6B5F54', '#5E5349', '#7A6B5C'][(c.x + c.y + i) % 3], .18, h), { uv: false });
      }
    },
    init(grid) { gridRef = grid; },   // قبل البناء: الجدران تعرف حوافها والسكة اتجاهها
    decor(grid) {   // قاع الهوّة المتوهج
      const g = new THREE.Group();
      grid.cells.filter(c => c.floor === 'chasm').forEach(c => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshBasicMaterial({ color: '#2A6CFF', transparent: true, opacity: .55 }));
        m.rotation.x = -Math.PI / 2; m.position.set((c.x + .5) * S, -140, (c.y + .5) * S); g.add(m);
      });
      return g;
    },
    prop(p) {
      const g = new THREE.Group(), Pp = new Parts(); g.position.set(p.x * S, 0, p.y * S);
      if (p.kind === 'palm') {   // نخلة: جذع بحلقات منحنٍ قليلاً وسعف أخضر متدلٍّ
        const k = p.s || 1, H2 = 120 * k;
        for (let i = 0; i < 6; i++) Pp.add(rockM, paint(new THREE.CylinderGeometry(4.2 * k, 5 * k, H2 / 6, 7).translate(i * 1.2 * k, H2 / 12 + i * H2 / 6, 0), i % 2 ? '#8B6A45' : '#7A5B3A', .1), { uv: false });
        for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, f = new THREE.ConeGeometry(6 * k, 62 * k, 4); f.scale(1, 1, .25); f.translate(0, 31 * k, 0); f.rotateX(1.15 + (i % 2) * .25); f.rotateY(a); f.translate(7 * k, H2, 0);
          Pp.add(rockM, paint(f, i % 2 ? '#3F8A3A' : '#4E9E45', .12), { uv: false }); }
        g.add(Pp.build());
      } else if (p.kind === 'well') {   // بئر القرية: حلقة حجرية وقائمان وعارضة ودلو
        Pp.add(rockM, paint(new THREE.CylinderGeometry(20, 22, 20, 14, 1, true).translate(0, 10, 0), '#BFA27A', .2), { uv: false });
        Pp.add(rockM, paint(new THREE.CylinderGeometry(23, 23, 4, 14).translate(0, 21, 0), '#D8BE96', .1), { uv: false });
        Pp.add(rockM, paint(new THREE.CircleGeometry(19, 14).rotateX(-Math.PI / 2).translate(0, 8, 0), '#2A5F86', .05), { uv: false });
        for (const o of [-22, 22]) Pp.add(timber, box(5, 50, 5, o, 25, 0)); Pp.add(timber, box(52, 5, 5, 0, 50, 0)); Pp.add(rockM, paint(box(9, 10, 9, 0, 34, 0), '#6B4226', .1), { uv: false });
        g.add(Pp.build());
      } else if (p.kind === 'sign') {   // لافتة المنجم على قائمين
        for (const o of [-26, 26]) Pp.add(timber, box(5, 60, 5, o, 30, 0)); Pp.add(material('wood', '#5A3A20'), box(64, 26, 4, 0, 52, 0)); g.add(Pp.build());
        const sg = signMesh('⛏️ منجم الأعماق', 13); sg.position.set(0, 52, 3); g.add(sg);
      } else if (p.kind === 'lamp') {
        Pp.add(timber, box(6, 70, 6, 0, 35, 0)); Pp.add(timber, box(22, 5, 5, 8, 68, 0)); Pp.add(iron, cyl(5, 6, 3, 16, 64, 0, 8));
        g.add(Pp.build()); const bulb = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8), glow('#FFC46B')); bulb.position.set(16, 58, 0); g.add(bulb);
        if (high) { const L = new THREE.PointLight('#FFB870', 15000, 300, 2); L.position.set(16, 56, 0); g.add(L); }
        g.userData.update = t => { bulb.material.emissiveIntensity = 1.5 + .2 * Math.sin(t * 9 + p.x); };
      } else if (p.kind === 'beam') {   // إطار دعامة خشبي يعبر النفق
        const ax = p.axis === 'x';
        for (const o of [-S, S]) Pp.add(timber, box(9, 74, 9, ax ? o : 0, 37, ax ? 0 : o));
        Pp.add(timber, ax ? box(S * 2 + 12, 10, 11, 0, 76, 0) : box(11, 10, S * 2 + 12, 0, 76, 0));
        g.add(Pp.build());
      } else if (p.kind === 'cart') {
        Pp.add(iron, box(34, 20, 24, 0, 18, 0)); Pp.add(material('metal', '#5C4033', { rough: .7, metal: .4 }), box(38, 4, 28, 0, 29, 0));
        for (const a of [-12, 12]) for (const b of [-13, 13]) Pp.add(material('metal', '#2B2B2F'), new THREE.CylinderGeometry(6, 6, 4, 10).rotateX(Math.PI / 2).translate(a, 7, b));
        g.add(Pp.build());
        const ore = new THREE.Mesh(new THREE.DodecahedronGeometry(13, 0), material('flat', p.ore, { rough: .6 })); ore.position.set(0, 31, 0); ore.scale.set(1.2, .6, .9); g.add(ore);
        if (p.axis === 'y') g.rotation.y = Math.PI / 2;
      } else if (p.kind === 'crystal') {
        const s = p.s || 1, m = glow(p.c);
        [[0, 0, 26, 0], [9, 4, 18, .5], [-8, -3, 15, -.4], [3, -9, 13, .3]].forEach(([dx, dz, h, tilt]) => {
          const c = new THREE.Mesh(new THREE.ConeGeometry(5.5 * s, h * s, 6), m); c.position.set(dx * s, h * s / 2, dz * s); c.rotation.z = tilt * .5; c.rotation.x = tilt * .3; g.add(c);
        });
        if (high) { const L = new THREE.PointLight(p.c, 7000, 160, 2); L.position.y = 20; g.add(L); }
        g.userData.update = t => { m.emissiveIntensity = 1.3 + .4 * Math.sin(t * 1.7 + p.x * 3); };
      } else if (p.kind === 'barrel') {
        Pp.add(material('wood', '#7A4E2A'), cyl(10, 11, 24, 0, 12, 0, 12)); for (const y of [5, 19]) Pp.add(iron, cyl(11.3, 11.3, 2.5, 0, y, 0, 12));
        g.add(Pp.build());
      } else if (p.kind === 'ore') {
        for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(6 + rnd(p.x, p.y, i) * 6, 0), material('flat', i % 2 ? p.c : '#4A403A', { rough: .7 })); m.position.set((rnd(p.x, i) - .5) * 26, 5 + (i > 3 ? 8 : 0), (rnd(p.y, i) - .5) * 26); g.add(m); }
      }
      return g;
    },
    station(st) {
      const g = new THREE.Group(), Pp = new Parts(); g.position.set(st.x * S, 0, st.y * S);
      if (st.kind === 'elevator') {   // برج رفع خشبي (أربع قوائم مائلة ودعامات متقاطعة) ببكرة في قمته، وقفص حديدي شبكي يتدلى بحبل، ولوحة طوابق
        const legs = [[-30, -24], [30, -24], [-30, 24], [30, 24]], top = 150;
        legs.forEach(([a, b]) => { const g2 = new THREE.CylinderGeometry(3.2, 4.2, top, 6); g2.rotateZ(-a / 700); g2.rotateX(b / 700); g2.translate(a * .82, top / 2, b * .82); Pp.add(timber, g2); });
        [50, 100].forEach(y => { const k = 1 - y / top * .18; Pp.add(timber, box(60 * k, 4, 4, 0, y, 24 * k * .82)); Pp.add(timber, box(60 * k, 4, 4, 0, y, -24 * k * .82)); Pp.add(timber, box(4, 4, 48 * k, 30 * k * .82, y, 0)); Pp.add(timber, box(4, 4, 48 * k, -30 * k * .82, y, 0)); });
        Pp.add(timber, box(64, 6, 52, 0, top, 0));
        Pp.add(material('metal', '#B88A2E', { rough: .35, metal: .9 }), new THREE.CylinderGeometry(16, 16, 5, 20).rotateX(Math.PI / 2).translate(0, top + 16, 0));
        Pp.add(iron, box(3, 34, 3, 0, top + 2, 0));
        // القفص: إطار وقضبان رفيعة (يُرى ما بداخله)
        const cy0 = 4, cH = 58;
        [[-17, -14], [17, -14], [-17, 14], [17, 14]].forEach(([a, b]) => Pp.add(iron, box(3, cH, 3, a, cy0 + cH / 2, b)));
        [cy0, cy0 + cH].forEach(y => { Pp.add(iron, box(37, 3, 3, 0, y, 14)); Pp.add(iron, box(37, 3, 3, 0, y, -14)); Pp.add(iron, box(3, 3, 31, 17, y, 0)); Pp.add(iron, box(3, 3, 31, -17, y, 0)); });
        for (let k = -11; k <= 11; k += 5.5) { Pp.add(iron, box(1.2, cH, 1.2, k, cy0 + cH / 2, 14)); Pp.add(iron, box(1.2, cH, 1.2, 17, cy0 + cH / 2, k * .8)); }
        Pp.add(plank, box(34, 3, 28, 0, cy0, 0)); Pp.add(material('metal', '#5C4033', { rough: .7, metal: .3 }), box(37, 4, 31, 0, cy0 + cH + 2, 0));
        Pp.add(material('flat', '#3A3A3A', { rough: .6 }), box(1.5, top - cy0 - cH - 4, 1.5, 0, (top + cy0 + cH) / 2 + 2, 0));
        // لوحة الطوابق على قائم خشبي بجانب البئر
        Pp.add(timber, box(5, 70, 5, 40, 35, 26)); Pp.add(material('wood', '#4A2E18'), box(30, 34, 4, 40, 62, 28));
        g.add(Pp.build());
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), glow('#FFC46B')); lamp.position.set(0, cy0 + cH - 8, 0); g.add(lamp);
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(22, 24), glow('#FF9F43')); scr.position.set(40, 62, 30.2); g.add(scr);
        if (high) { const L = new THREE.PointLight('#FFC46B', 9000, 200, 2); L.position.set(0, cy0 + cH - 10, 0); g.add(L); }
      } else if (st.kind === 'crystals') {   // عرق بلّوري: بلورات مربعة ومكعبة متدرجة الحجم على قاعدة صخرية
        Pp.add(rock, box(70, 18, 30, 0, 9, -6)); g.add(Pp.build());
        [[-24, 10, '#5FD3FF'], [0, 16, '#B28CFF'], [24, 22, '#7CF5C8']].forEach(([dx, s, c]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), glow(c)); m.position.set(dx, 18 + s / 2, -4); m.rotation.y = .5; g.add(m); });
      } else if (st.kind === 'doubler') {   // منصة دائرية ببلورة طافية تنقسم
        Pp.add(rock, cyl(30, 34, 10, 0, 5, 0, 24)); Pp.add(material('metal', '#B88A2E', { rough: .35, metal: .9 }), cyl(31, 31, 3, 0, 11, 0, 24));
        g.add(Pp.build());
        const cr = new THREE.Mesh(new THREE.OctahedronGeometry(12, 0), glow('#FFB347')); cr.position.y = 50; g.add(cr);
        g.userData.update = t => { cr.rotation.y = t * 1.2; cr.position.y = 50 + Math.sin(t * 2) * 5; };
      } else if (st.kind === 'gate') {   // البوابة الكبرى: إطار حجري ضخم بمصراعين وأربعة أقفال دائرية
        for (const a of [-44, 44]) Pp.add(rock, box(22, 130, 26, a, 65, 0));
        Pp.add(rock, box(110, 24, 28, 0, 134, 0)); Pp.add(material('metal', '#3E3A36', { rough: .5, metal: .7 }), box(66, 118, 8, 0, 59, 0));
        g.add(Pp.build());
        [[-16, 86], [16, 86], [-16, 50], [16, 50]].forEach(([x, y]) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 4, 20), glow('#FFC94A')); d.rotation.x = Math.PI / 2; d.position.set(x, y, 5); g.add(d); });
      }
      return g;
    }
  };
}
