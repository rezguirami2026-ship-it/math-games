// منجم الأعماق مجسّماً: صخر بحواف مكسّرة، أرض حجرية وألواح خشب وسكة بعوارض، هوّة بتوهج بلّوري، مصابيح بضوء حقيقي
// (في الجودة العالية)، بلورات متوهجة، وأربع محطات: قفص المصعد، عرق البلّور، منصة التضاعف، والبوابة الكبرى بأقفالها.
import { box, cyl, sphere } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';

export function kit3d(THREE, { S, Parts, high }) {
  const rock = material('stone', '#5A5048'), rockTop = material('flat', '#1A1714', { rough: 1 }), stone = material('stone', '#7A7064'), plank = material('wood', '#7B5232');
  const iron = material('metal', '#8C8F96', { rough: .5, metal: .8 }), timber = material('wood', '#6A4428'), glow = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.6, roughness: .25, metalness: .1 });
  const rnd = (x, y, k = 0) => { const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
  const H = c => (c.h || 1) * S;
  const edge = (c, grid) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const n = grid && grid.at(c.x + dx, c.y + dy); return n && !n.wall; });
  let gridRef = null;
  return {
    floor(P, c) {
      const x = (c.x + .5) * S, z = (c.y + .5) * S;
      if (c.floor === 'chasm') {   // هوّة: جدران داخلية مظلمة وقاع يتوهج بلوناً بلّورياً بعيداً
        P.add(material('flat', '#0B0A10', { rough: 1 }), box(S, 2, S, x, -150, z)); return;
      }
      if (c.floor === 'planks') { for (let i = 0; i < 4; i++) P.add(plank, box(S, 4, S / 4 - 1.2, x, 1, c.y * S + S / 8 + i * S / 4 + .6)); return; }
      P.add(stone, box(S, 4, S, x, -1 - rnd(c.x, c.y) * 1.5, z));
      if (c.floor === 'rail') {   // عوارض خشبية وقضيبان حديديان على امتداد النفق
        const along = gridRef && (gridRef.at(c.x + 1, c.y)?.floor === 'rail' || gridRef.at(c.x - 1, c.y)?.floor === 'rail') ? 'x' : 'z';
        for (let i = 0; i < 3; i++) { const o = -S / 2 + S / 6 + i * S / 3; P.add(timber, along === 'x' ? box(7, 4, S * .8, c.x * S + S / 2 + o, 3, z) : box(S * .8, 4, 7, x, 3, c.y * S + S / 2 + o)); }
        for (const o of [-11, 11]) P.add(iron, along === 'x' ? box(S, 3, 3, x, 6, z + o) : box(3, 3, S, x + o, 6, z));
      }
    },
    wall(P, c) {
      const x = (c.x + .5) * S, z = (c.y + .5) * S, h = H(c);
      if (!edge(c, gridRef)) { P.add(rockTop, box(S, 4, S, x, h, z), { uv: false }); return; }   // صخر داخلي: سطح مظلم فقط (رسم أخف)
      const j = (rnd(c.x, c.y) - .5) * 14;
      P.add(rock, box(S, h + j, S, x, (h + j) / 2, z));
      // كتل مكسّرة على الحافة تكسر الخط المستقيم
      for (let i = 0; i < 2; i++) { const r = 10 + rnd(c.x, c.y, i) * 12; const g = new THREE.DodecahedronGeometry(r, 0); g.translate(x + (rnd(c.x, c.y, i + 3) - .5) * S * .8, h + j - 4 + r * .3, z + (rnd(c.x, c.y, i + 5) - .5) * S * .8); P.add(rock, g); }
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
      if (p.kind === 'lamp') {
        Pp.add(timber, box(6, 70, 6, 0, 35, 0)); Pp.add(timber, box(22, 5, 5, 8, 68, 0)); Pp.add(iron, cyl(5, 6, 3, 16, 64, 0, 8));
        g.add(Pp.build()); const bulb = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8), glow('#FFC46B')); bulb.position.set(16, 58, 0); g.add(bulb);
        if (high) { const L = new THREE.PointLight('#FFB65C', 26000, 330, 2); L.position.set(16, 56, 0); g.add(L); }
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
      if (st.kind === 'elevator') {   // قفص مصعد: أعمدة حديدية، أرضية، بكرة في الأعلى، ولوحة طوابق
        for (const a of [-20, 20]) for (const b of [-16, 16]) Pp.add(iron, box(4, 120, 4, a, 60, b));
        Pp.add(iron, box(44, 4, 36, 0, 120, 0)); Pp.add(plank, box(40, 4, 32, 0, 3, 0));
        Pp.add(material('metal', '#B88A2E', { rough: .35, metal: .9 }), new THREE.CylinderGeometry(10, 10, 6, 16).rotateX(Math.PI / 2).translate(0, 132, 0));
        Pp.add(material('flat', '#2B2118'), box(26, 30, 3, 30, 50, 20));
        g.add(Pp.build());
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(20, 22), glow('#FF9F43')); scr.position.set(30, 50, 21.8); g.add(scr);
      } else if (st.kind === 'crystals') {   // عرق بلّوري: بلورات مربعة ومكعبة متدرجة الحجم على قاعدة صخرية
        Pp.add(rock, box(70, 18, 30, 0, 9, -6)); g.add(Pp.build());
        [[-24, 10, '#5FD3FF'], [0, 16, '#B28CFF'], [24, 22, '#7CF5C8']].forEach(([dx, s, c]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), glow(c)); m.position.set(dx, 18 + s / 2, -4); m.rotation.y = .5; g.add(m); });
      } else if (st.kind === 'doubler') {   // منصة دائرية ببلورة طافية تنقسم
        Pp.add(stone, cyl(30, 34, 10, 0, 5, 0, 24)); Pp.add(material('metal', '#B88A2E', { rough: .35, metal: .9 }), cyl(31, 31, 3, 0, 11, 0, 24));
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
