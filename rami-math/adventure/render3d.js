// عرض المغامرات ثلاثي الأبعاد (Three.js): يقرأ حالة المحرّك (الخريطة والعناصر والبطل) ولا يغيّر منطقها.
// يعيد استعمال أدوات القرية: البيوت العُمانية، النخيل، الشجيرات، البئر، والشخصيات المتحركة بمفاصل.
// الأرض لوحة مرسومة من بلاطات المغامرة نفسها (طرق وماء ناعمة)، والجدران والأشياء مجسّمات، والليل أضواء حقيقية متراقصة.
import * as THREE from '../lib/three/three.module.min.js';
import { material } from '../renderer3d/textures.js';
import { palms, shrubs, sidrTree, wind } from '../renderer3d/nature.js';
import { omaniHouse } from '../renderer3d/omani.js';
import { well as well3d } from '../renderer3d/props.js';
import { buildPerson, animatePerson } from '../renderer3d/people.js';
import { box, cyl, sphere, Parts } from '../renderer3d/geom.js';
import { T, THEMES, drawTile, drawSoft } from './art.js';

const MOB = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();
const std = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .8 }, o));
const glow = color => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6, roughness: .5 });
function shadowed(o) { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; }
function iconTexture(txt, ring = '#E2B95A') {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,252,243,.95)'; x.beginPath(); x.arc(64, 64, 54, 0, 7); x.fill(); x.lineWidth = 8; x.strokeStyle = ring; x.stroke();
  x.font = '64px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function markTexture(txt, bg) {
  const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
  x.fillStyle = bg; x.beginPath(); x.arc(48, 48, 40, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke();
  x.fillStyle = '#fff'; x.font = '900 52px Cairo, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 48, 52);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const sprite = (tex, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); m.scale.set(s, s, 1); m.renderOrder = 10; return m; };

export function createAdv3D(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOB, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOB ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, 10, 6000);
  const hemi = new THREE.HemisphereLight('#CFE4FA', '#8A6A48', 1), sun = new THREE.DirectionalLight('#FFE9C4', 2.4);
  sun.castShadow = true; sun.shadow.mapSize.set(MOB ? 1024 : 2048, MOB ? 1024 : 2048); sun.shadow.bias = -.0005; sun.shadow.normalBias = .5;
  const sc = sun.shadow.camera; sc.left = -700; sc.right = 700; sc.top = 700; sc.bottom = -700; sc.near = 10; sc.far = 3000;
  scene.add(hemi, sun, sun.target);
  const lights = []; for (let i = 0; i < (MOB ? 4 : 6); i++) { const l = new THREE.PointLight('#FFB060', 0, 260, 1.6); scene.add(l); lights.push(l); }
  const heroLight = new THREE.PointLight('#FFD08A', 0, 300, 1.4); scene.add(heroLight);
  let builtTV = 0, sky0 = new THREE.Color(), root = null, built = null, people = new Map(), objs = new Map(), cutSeen = new Set(), tileObj = new Map(), marker, goalArrow, fxPts, W = 1, H = 1, last = 0;

  function resize(w, h) { W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }

  /* ── بناء منطقة ── */
  function build(V) {
    if (root) { scene.remove(root); root.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    root = new THREE.Group(); scene.add(root); objs = new Map(); people.forEach(P => scene.remove(P.root)); people = new Map(); cutSeen = new Set(); tileObj = new Map();
    const { map, theme } = V, th = THEMES[theme], mw = map[0].length, mh = map.length, night = V.dark;
    built = V.areaId;
    // السماء والضباب والإضاءة حسب العالم والليل
    scene.background = new THREE.Color('#8CC4EE'); scene.fog = new THREE.Fog('#8CC4EE', 900, 2600); void night;
    // الأرض: لوحة واحدة مرسومة من البلاطات
    const S = Math.min(2, 2048 / Math.max(mw, mh) / T), gc = document.createElement('canvas'); gc.width = Math.ceil(mw * T * S); gc.height = Math.ceil(mh * T * S);
    const g = gc.getContext('2d'); g.scale(S, S); const soft = [];
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) { const ch = V.tileAt(x, y); drawTile(g, ch === ';' ? ',' : (ch === '#' || ch === 'T' || ch === '"' || ch === 'R' || ch === '=') ? '.' : ch, theme, x, y, S); if (ch === '_' || ch === '~' || ch === '=') soft.push([x, y, ch]); }
    drawSoft(g, soft, theme, 0);
    const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace; gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(mw * T, mh * T), new THREE.MeshStandardMaterial({ map: gt, roughness: .95 }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(mw * T / 2, 0, mh * T / 2); ground.receiveShadow = true; root.add(ground);
    const outer = new THREE.Mesh(new THREE.PlaneGeometry(mw * T + 4000, mh * T + 4000), std(th.g[0], { roughness: 1 })); outer.rotation.x = -Math.PI / 2; outer.position.set(mw * T / 2, -.5, mh * T / 2); outer.receiveShadow = true; root.add(outer);
    // الماء: سطح لامع فوق بلاطات الماء
    const wl = []; for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) if (V.tileAt(x, y) === '~') wl.push(box(T + 2, 3, T + 2, x * T + T / 2, 1.5, y * T + T / 2));
    if (wl.length) { const wp = new Parts(); const wm = new THREE.MeshStandardMaterial({ color: th.water[0], roughness: .12, metalness: .25, transparent: true, opacity: .88 }); wl.forEach(q => wp.add(wm, q, { uv: false })); const wg = wp.build({ cast: false, ao: false }); wg.userData.water = wm; root.add(wg); }
    // الجسور
    const br = new Parts(), wood = material('wood', '#8A5A30'); for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) if (V.tileAt(x, y) === '=') br.add(wood, box(T + 2, 6, T - 6, x * T + T / 2, 5, y * T + T / 2)); root.add(br.build());
    // الجدران: أسوار من حجر بارتفاع حقيقي وشُرفات
    const wp = new Parts(), wm = material('stone', th.wall[0]), wt = material('plaster', th.wall[1]);
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) if (V.tileAt(x, y) === '#' && y >= mh - 2) wp.add(wm, box(T + .5, 22, T + .5, x * T + T / 2, 11, y * T + T / 2));   // الحافة القريبة من الكاميرا منخفضة فلا تحجب المشهد
    for (let y = 0; y < mh - 2; y++) for (let x = 0; x < mw; x++) if (V.tileAt(x, y) === '#') { wp.add(wm, box(T + .5, 66, T + .5, x * T + T / 2, 33, y * T + T / 2)); wp.add(wt, box(T + 3, 5, T + 3, x * T + T / 2, 66, y * T + T / 2)); if ((x + y) % 2 === 0) wp.add(wm, box(T * .45, 12, T * .45, x * T + T / 2, 74, y * T + T / 2)); }
    root.add(wp.build());
    // الأشجار: نخيل/سدر/صبار/صخور حسب العالم
    const tl = [], low = []; for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) if (V.tileAt(x, y) === 'T') (y >= mh - 2 ? low : tl).push({ x: x * T + T / 2, y: y * T + T / 2, s: .78, r: 18 });
    if (low.length) root.add(shrubs(low));   // أشجار الحافة القريبة من الكاميرا: شجيرات منخفضة بدل نخيل يغطي الرؤية
    if (th.tree === 'palm') root.add(palms(tl));
    else if (th.tree === 'round') tl.forEach(p => root.add(sidrTree(p.x, p.y, .9)));
    else if (th.tree === 'cactus') tl.forEach(p => root.add(cactus(p.x, p.y)));
    else tl.forEach(p => root.add(rockMesh(p.x, p.y, 1.3, th.tree === 'dead' ? '#4A4050' : '#6E655C')));
    // الشوك والصخور القابلة للإزالة، والعشب الطويل
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const ch = map[y][x], k = x + ',' + y;
      if (ch === '"') { const o = thorn(x * T + T / 2, y * T + T / 2); root.add(o); tileObj.set(k, o); }
      if (ch === 'R') { const o = rockMesh(x * T + T / 2, y * T + T / 2, 1, '#9C9488'); root.add(o); tileObj.set(k, o); }
      if (ch === ';') root.add(tallGrass(x * T + T / 2, y * T + T / 2));
    }
    // العناصر
    V.ents.forEach(e => { const o = makeEnt(e, V); if (o) { root.add(o); objs.set(e, o); } });
    marker = new THREE.Group(); const dia = new THREE.Mesh(new THREE.OctahedronGeometry(8), glow('#FFC23D')); dia.scale.y = 1.5; marker.add(dia);
    const ring = new THREE.Mesh(new THREE.RingGeometry(18, 24, 32), new THREE.MeshBasicMaterial({ color: '#FFD54A', transparent: true, opacity: .7, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = -126; marker.add(ring); marker.visible = false; root.add(marker);
    fxPts = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ size: 7, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fxPts.frustumCulled = false; root.add(fxPts);
  }
  function cactus(x, z) { const P = new Parts(), m = std('#5E9C48'); P.add(m, cyl(7, 8, 70, x, 35, z, 10), { uv: false }); P.add(m, cyl(5, 5, 28, x - 16, 42, z, 8), { uv: false }); P.add(m, box(16, 6, 6, x - 9, 30, z), { uv: false }); P.add(m, cyl(5, 5, 24, x + 15, 48, z, 8), { uv: false }); return P.build(); }
  function rockMesh(x, z, s, col) { const g = new THREE.DodecahedronGeometry(20 * s, 0); g.scale(1.2, .8, 1); g.translate(x, 14 * s, z); const m = new THREE.Mesh(g, std(col, { flatShading: true })); return shadowed(m); }
  function thorn(x, z) { const g = shrubs([{ x, y: z, r: 20 }]); const sp = new Parts(), sm = std('#5A3A1A'); for (let i = 0; i < 10; i++) { const a = i * 2.4, r = 14 + (i % 3) * 4; const c = new THREE.ConeGeometry(1.4, 9, 4); c.rotateZ(Math.PI / 2 * (i % 2 ? 1 : -1) * .6); c.translate(x + Math.cos(a) * r, 14 + (i % 4) * 5, z + Math.sin(a) * r); sp.add(sm, c, { uv: false }); } g.add(sp.build()); return g; }
  function tallGrass(x, z) { const P = new Parts(), m = std('#5E8E3A', { side: THREE.DoubleSide }); for (let i = 0; i < 16; i++) { const c = new THREE.ConeGeometry(2.2, 30 + (i * 7 % 13), 3); c.translate(x - 20 + (i % 4) * 13 + (i * 3 % 5), 16, z - 20 + Math.floor(i / 4) * 13); P.add(m, c, { uv: false }); } const g = P.build(); g.userData.sway = 1; return g; }

  /* ── مجسّم لكل نوع عنصر ── */
  function makeEnt(e, V) {
    const x = e.x * T + T / 2, z = e.y * T + T / 2, P = new Parts(), wood = material('wood', '#8A5A30'), dark = std('#3A3A44', { metalness: .4, roughness: .5 });
    const G = new THREE.Group(); G.position.set(x, 0, z);
    switch (e.kind) {
      case 'house': { const w = (e.w || 3) * T, d = (e.h || 2) * T, g = omaniHouse({ x: e.x * T, y: (e.y - (e.h || 2) + 1) * T, w, h: d, H: (e.h || 2) >= 3 ? 150 : 96, wall: e.roof }); return shadowed(g); }
      case 'well': return shadowed(well3d(x, z, 22, true));
      case 'chest': { P.add(wood, box(36, 22, 26, 0, 11, 0, 3)); P.add(material('metal', '#C9971C'), box(38, 3, 28, 0, 15, 0)); G.add(P.build()); const lid = new THREE.Group(); lid.position.set(0, 22, -13); const lm = new THREE.Mesh(box(36, 8, 26, 0, 4, 13, 3), wood); lid.add(lm); G.add(lid); G.userData.lid = lid; break; }
      case 'lever': { P.add(std('#6A6A72'), box(26, 8, 14, 0, 4, 0, 2), { uv: false }); G.add(P.build()); const arm = new THREE.Group(); arm.position.y = 8; const st = new THREE.Mesh(cyl(1.8, 1.8, 26, 0, 13, 0, 8), dark); const kn = new THREE.Mesh(sphere(5, 0, 27, 0), std(e.color || '#E2475C', { emissive: e.color || '#E2475C', emissiveIntensity: .35 })); arm.add(st, kn); G.add(arm); G.userData.arm = arm; break; }
      case 'plate': { const m = new THREE.Mesh(box(40, 5, 40, 0, 2.5, 0, 2), new THREE.MeshStandardMaterial({ color: '#B89A3A', emissive: '#6A5010', emissiveIntensity: .6, metalness: .5, roughness: .4 })); m.receiveShadow = true; G.add(m); G.userData.plate = m; break; }
      case 'block': { const hl = new THREE.Mesh(new THREE.RingGeometry(26, 31, 28), new THREE.MeshBasicMaterial({ color: '#FFD54A', transparent: true, opacity: .75, side: THREE.DoubleSide })); hl.rotation.x = -Math.PI / 2; hl.position.y = 1.2; G.add(hl); G.userData.hl = hl;
        P.add(material('wood', '#C88A4A'), box(42, 40, 42, 0, 20, 0, 2)); P.add(material('wood', '#6E4520'), box(44, 5, 44, 0, 3, 0)); P.add(material('wood', '#6E4520'), box(44, 5, 44, 0, 37, 0)); G.add(P.build()); break; }
      case 'gate': case 'cage': { const n = e.kind === 'cage' ? 7 : 5, wdt = e.kind === 'cage' ? 46 : 44; for (let i = 0; i < n; i++) P.add(dark, cyl(1.8, 1.8, 70, -wdt / 2 + i * wdt / (n - 1), 35, e.kind === 'cage' ? 20 : 0, 8), { uv: false });
        if (e.kind === 'cage') for (let i = 0; i < n; i++) P.add(dark, cyl(1.8, 1.8, 70, -wdt / 2 + i * wdt / (n - 1), 35, -20, 8), { uv: false });
        P.add(dark, box(wdt + 6, 5, e.kind === 'cage' ? 46 : 6, 0, 72, 0), { uv: false }); if (e.kind === 'cage') { P.add(dark, box(5, 70, 44, -wdt / 2, 35, 0), { uv: false }); P.add(dark, box(5, 70, 44, wdt / 2, 35, 0), { uv: false }); } G.add(P.build()); G.userData.bars = 1; if (e.kind === 'gate') G.position.z = z + T / 2 - 4; break; }
      case 'door': { P.add(material('wood', '#6B3E1E'), box(40, 62, 6, 0, 31, 0, 2)); P.add(material('metal', '#C9971C'), box(5, 5, 8, 10, 30, 0)); G.add(P.build()); G.position.z = z + T / 2 + 1; break; }
      case 'sign': { P.add(wood, box(5, 34, 5, 0, 17, 0)); P.add(material('wood', '#C9955A'), box(42, 24, 4, 0, 38, 0, 2)); G.add(P.build()); break; }
      case 'fire': case 'safe': { for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(cyl(2.6, 2.6, 28, 0, 3, 0, 6), material('wood', '#5A3A1A')); l.rotation.z = Math.PI / 2; l.rotation.y = i * 1.05; G.add(l); }
        const ring = new THREE.Group(); for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(4, 0), std('#8C8478', { flatShading: true })); s.position.set(Math.cos(i * .785) * 15, 2, Math.sin(i * .785) * 15); ring.add(s); } G.add(ring); G.add(flame(1)); G.userData.light = 1; break; }
      case 'beacon': { P.add(material('stone', '#C9BFA9'), cyl(15, 20, 96, 0, 48, 0, 10)); P.add(material('stone', '#B8AE98'), box(46, 10, 46, 0, 5, 0, 2)); P.add(material('metal', '#5A4632'), cyl(22, 13, 12, 0, 102, 0, 12)); G.add(shadowed(P.build())); const f = flame(2); f.position.y = 106; G.add(f); G.userData.beacon = f; const r = new THREE.Mesh(new THREE.RingGeometry(26, 32, 32), new THREE.MeshBasicMaterial({ color: '#FFB060', transparent: true, opacity: .5, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.y = 1.5; G.add(r); G.userData.bring = r; break; }
      case 'tent': { const c = new THREE.ConeGeometry(42, 66, 4); c.rotateY(Math.PI / 4); c.translate(0, 33, 0); G.add(shadowed(new THREE.Mesh(c, std(e.color || '#8E3B3B', { roughness: .9 })))); const dr = new THREE.Mesh(new THREE.PlaneGeometry(18, 30), std('#2A1A10')); dr.position.set(0, 15, 30.5); dr.rotation.x = -.42; G.add(dr); break; }
      case 'crates': { [[-13, 0, 13], [13, 0, 13], [0, 26, 13]].forEach(([dx, dy]) => P.add(material('wood', '#9C6438'), box(26, 26, 26, dx, dy + 13, 0, 1.5))); G.add(P.build()); break; }
      case 'barrel': { P.add(material('wood', '#8A5A30'), cyl(13, 13, 34, 0, 17, 0, 14)); P.add(dark, cyl(13.6, 13.6, 3, 0, 7, 0, 14), { uv: false }); P.add(dark, cyl(13.6, 13.6, 3, 0, 27, 0, 14), { uv: false }); G.add(P.build()); break; }
      case 'banner': { P.add(wood, cyl(2, 2, 90, -26, 45, 0, 8)); P.add(wood, cyl(2, 2, 90, 26, 45, 0, 8)); P.add(wood, box(56, 3, 3, 0, 88, 0)); G.add(P.build());
        (e.colors || []).forEach((col, i) => { const s = new THREE.Shape(); s.moveTo(-7, 0); s.lineTo(7, 0); s.lineTo(0, -24); s.closePath(); const m = new THREE.Mesh(new THREE.ShapeGeometry(s), std(col, { side: THREE.DoubleSide, emissive: col, emissiveIntensity: .25 })); m.position.set(-17 + i * 17, 86, 1); G.add(m); }); break; }
      case 'star': { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 14, a = i * Math.PI / 5 - Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
        const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 4, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2 }), new THREE.MeshStandardMaterial({ color: '#FFD54A', emissive: '#FFB020', emissiveIntensity: .9, metalness: .6, roughness: .3 }));
        m.position.y = 30; G.add(m); G.userData.spin = m; break; }
      case 'item': { const sp = sprite(iconTexture(V.itemIcon(e.item)), 34); sp.position.y = 34; G.add(sp); G.userData.bob = sp; const rg = new THREE.Mesh(new THREE.RingGeometry(14, 18, 24), new THREE.MeshBasicMaterial({ color: '#FFD54A', transparent: true, opacity: .55, side: THREE.DoubleSide })); rg.rotation.x = -Math.PI / 2; rg.position.y = 1; G.add(rg); break; }
      case 'exit': { const a = new THREE.Mesh(new THREE.ConeGeometry(10, 22, 3), glow('#7CD6FF')); a.rotation.z = e.x === 0 ? Math.PI / 2 : -Math.PI / 2; a.position.y = 18; G.add(a); G.userData.bob = a; const rg = new THREE.Mesh(new THREE.RingGeometry(16, 22, 28), new THREE.MeshBasicMaterial({ color: '#7CD6FF', transparent: true, opacity: .6, side: THREE.DoubleSide })); rg.rotation.x = -Math.PI / 2; rg.position.y = 1; G.add(rg); break; }
      case 'hazard': case 'animal': { const c = creature(e.creature || 'crab'); G.add(c); G.userData.creature = c;
        if (e.kind === 'animal') { const mk = sprite(markTexture('!', '#E2475C'), 18); mk.position.y = 70; mk.visible = false; G.add(mk); G.userData.mark = mk; }
        return shadowed(G); }
      case 'rot': { G.add(rotMesh(e.style || 'statue')); G.userData.rot = G.children[0]; G.userData.rot.rotation.y = -(e.r || 0) * Math.PI / 2; break; }
      case 'tablet': { P.add(material('stone', '#B8AE98'), box(36, 46, 14, 0, 23, 0, 2)); G.add(P.build()); const sp = sprite(iconTexture((V.symbols || [])[e.sym || 0] || '?', '#8C7A5A'), 30); sp.material.depthTest = true; sp.position.set(0, 30, 9); G.add(sp); G.userData.tab = sp; break; }
      case 'crystal': { const c = new THREE.Mesh(new THREE.OctahedronGeometry(14), new THREE.MeshStandardMaterial({ color: '#7CD6FF', emissive: '#2A7AB8', emissiveIntensity: .4, metalness: .2, roughness: .15, transparent: true, opacity: .9 })); c.scale.y = 1.6; c.position.y = 34; P.add(material('stone', '#8C8478'), cyl(12, 15, 12, 0, 6, 0, 8)); G.add(P.build(), c); G.userData.crystal = c; break; }
      case 'beam': { P.add(material('stone', '#B8AE98'), cyl(12, 15, 30, 0, 15, 0, 10)); G.add(P.build()); const s = new THREE.Mesh(sphere(10, 0, 40, 0), glow('#FFD54A')); G.add(s); break; }
      case 'fence': { P.add(wood, box(e.vertical ? 6 : T, 6, e.vertical ? T : 6, 0, 22, 0)); P.add(wood, box(e.vertical ? 6 : T, 6, e.vertical ? T : 6, 0, 10, 0)); [-1, 1].forEach(s => P.add(wood, box(7, 32, 7, e.vertical ? 0 : s * T / 2.3, 16, e.vertical ? s * T / 2.3 : 0))); G.add(P.build()); break; }
      case 'pillar': { P.add(material('stone', e.color || '#C9BFA9'), cyl(13, 15, e.h || 90, 0, (e.h || 90) / 2, 0, 12)); P.add(material('stone', '#B5AB97'), box(34, 8, 34, 0, (e.h || 90) + 4, 0)); G.add(P.build()); break; }
      case 'torchw': { P.add(dark, cyl(2, 2, 40, 0, 20, 0, 6), { uv: false }); G.add(P.build()); const f = flame(.8); f.position.y = 40; G.add(f); G.userData.light = 1; break; }
      case 'site': { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.RingGeometry(20, 26, 4), new THREE.MeshBasicMaterial({ color: '#FFD54A', transparent: true, opacity: .7, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.rotation.z = Math.PI / 4; ring.position.y = 1.5; g.add(ring); G.add(g); G.userData.site = ring;
        const b = buildModel(e.model || 'raft'); b.visible = !!e.built; G.add(b); G.userData.built = b; break; }
      case 'boat': { G.add(buildModel('dhow')); break; }
      case 'npc': case 'guard': { const Pp = buildPerson(V.look(e)); Pp.root.position.set(x, 0, z); people.set(e, Pp); shadowed(Pp.root); scene.add(Pp.root);
        if (e.kind === 'guard') { const cone = new THREE.Mesh(new THREE.CircleGeometry((e.range || 4) * T, 24, -(e.fov || .5), (e.fov || .5) * 2), new THREE.MeshBasicMaterial({ color: '#FFD54A', transparent: true, opacity: .28, depthWrite: false, side: THREE.DoubleSide }));
          cone.rotation.x = -Math.PI / 2; cone.position.y = 1.5; G.add(cone); G.userData.cone = cone; const lan = new THREE.Mesh(sphere(4, 14, 40, 6), glow('#FFC86A')); G.add(lan); }
        const mk = sprite(markTexture('!', '#E2475C'), 18); mk.position.y = 96; mk.visible = false; G.add(mk); G.userData.mark = mk; return G; }
      default: return null;
    }
    shadowed(G); return G;
  }
  /* أسهم مضيئة على الأرض من الصندوق إلى لوحته */
  const guides = new Map();
  function guide(b, pl, t) {
    let g = guides.get(b); if (!g || g.parent !== root) { g = new THREE.Group(); for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(8, 18, 3), glow('#FFE27A')); c.rotation.x = Math.PI / 2; g.add(c); } root.add(g); guides.set(b, g); }
    const bx = (b.px != null ? b.px : b.x) * T + T / 2, bz = (b.py != null ? b.py : b.y) * T + T / 2, px = pl.x * T + T / 2, pz = pl.y * T + T / 2, d = Math.hypot(px - bx, pz - bz);
    g.visible = d > 4 && !b.hidden; if (!g.visible) return; const ang = Math.atan2(px - bx, pz - bz);
    g.children.forEach((c, i) => { const f = ((i / 6 + t * .35) % 1); c.position.set(bx + (px - bx) * f, 3, bz + (pz - bz) * f); c.rotation.set(Math.PI / 2, 0, -ang + Math.PI); c.visible = f * d > 26 && f * d < d - 10; });
  }
  /* مخلوقات بسيطة جميلة: سرطان، عقرب، ماعز، جمل، صخرة متدحرجة */
  function creature(kind) {
    const g = new THREE.Group(), P = new Parts();
    if (kind === 'crab') { const m = std('#D9482E', { roughness: .5 }); P.add(m, sphere(13, 0, 9, 0, 12, 8), { uv: false }); [-1, 1].forEach(s => { for (let i = 0; i < 3; i++) P.add(m, box(14, 2.5, 2.5, s * 16, 4, -6 + i * 6), { uv: false }); P.add(m, sphere(6, s * 16, 12, 13), { uv: false }); }); P.add(std('#111'), sphere(2.2, -4, 18, 9), { uv: false }); P.add(std('#111'), sphere(2.2, 4, 18, 9), { uv: false }); g.add(P.build()); g.scale.set(1, .9, 1); }
    else if (kind === 'scorpion') { const m = std('#3A2A1E', { roughness: .6 }); P.add(m, box(16, 7, 26, 0, 6, 0, 3), { uv: false }); for (let i = 0; i < 5; i++) P.add(m, sphere(4.5 - i * .5, 0, 9 + i * 6, -14 - i * 3), { uv: false }); P.add(std('#C9971C'), new THREE.ConeGeometry(2.4, 8, 6).translate(0, 38, -26), { uv: false });
      [-1, 1].forEach(s => { for (let i = 0; i < 4; i++) P.add(m, box(12, 2, 2, s * 12, 3, -8 + i * 5), { uv: false }); P.add(m, sphere(5, s * 9, 6, 16), { uv: false }); }); g.add(P.build()); }
    else if (kind === 'goat' || kind === 'camel') { const camel = kind === 'camel', m = std(camel ? '#C9955A' : '#F2EDE2'), dk = std(camel ? '#9C6A3A' : '#5A4A3A'), s = camel ? 1.6 : 1;
      P.add(m, box(16 * s, 14 * s, 30 * s, 0, 22 * s, 0, 5), { uv: false }); if (camel) P.add(m, sphere(9 * s, 0, 32 * s, -2), { uv: false });
      P.add(m, box(8 * s, 16 * s, 8 * s, 0, 32 * s, 16 * s, 3), { uv: false }); P.add(m, box(9 * s, 9 * s, 13 * s, 0, 38 * s, 22 * s, 3), { uv: false });
      [[-5, -10], [5, -10], [-5, 10], [5, 10]].forEach(([a, b]) => P.add(dk, box(3.4 * s, 15 * s, 3.4 * s, a * s, 7.5 * s, b * s), { uv: false })); if (!camel) { P.add(dk, new THREE.ConeGeometry(1.6, 9, 5).translate(-3, 46, 20), { uv: false }); P.add(dk, new THREE.ConeGeometry(1.6, 9, 5).translate(3, 46, 20), { uv: false }); }
      P.add(std('#111'), sphere(1.4 * s, -3.4 * s, 40 * s, 27 * s), { uv: false }); P.add(std('#111'), sphere(1.4 * s, 3.4 * s, 40 * s, 27 * s), { uv: false }); g.add(P.build()); }
    else { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(20, 1), std('#8C8072', { flatShading: true })); r.position.y = 20; g.add(r); g.userData.roll = r; }
    return g;
  }
  function rotMesh(style) {
    const g = new THREE.Group(), P = new Parts(), st = material('stone', '#C9BFA9');
    if (style === 'vane') { P.add(material('metal', '#5A5664'), cyl(2.5, 2.5, 70, 0, 35, 0, 8), { uv: false }); P.add(material('metal', '#C9971C'), box(6, 4, 40, 0, 70, 6), { uv: false }); P.add(material('metal', '#C9971C'), new THREE.ConeGeometry(7, 14, 4).rotateX(Math.PI / 2).translate(0, 70, 30), { uv: false }); P.add(material('metal', '#C9971C'), box(2, 16, 14, 0, 70, -16), { uv: false }); }
    else if (style === 'mirror') { P.add(st, cyl(12, 14, 14, 0, 7, 0, 10)); const f = new THREE.Mesh(box(40, 44, 4, 0, 36, 0, 2), material('wood', '#7A4A22')); f.rotation.y = Math.PI / 4; const glass = new THREE.Mesh(new THREE.PlaneGeometry(34, 38), new THREE.MeshStandardMaterial({ color: '#DDEBFF', metalness: .95, roughness: .05, emissive: '#3A5A7A', emissiveIntensity: .3 })); glass.position.set(0, 36, 0); glass.rotation.y = Math.PI / 4; glass.translateZ(2.5); g.add(f, glass); }
    else { P.add(st, box(30, 14, 30, 0, 7, 0, 2)); P.add(material('stone', '#BDB39E'), cyl(9, 12, 46, 0, 37, 0, 10)); P.add(material('stone', '#BDB39E'), sphere(9, 0, 66, 0)); P.add(material('stone', '#BDB39E'), box(5, 5, 26, 6, 52, 14), { uv: false }); P.add(material('metal', '#C9971C'), new THREE.ConeGeometry(4, 10, 6).rotateX(Math.PI / 2).translate(6, 52, 30), { uv: false }); }
    g.add(P.build()); return g;
  }
  function buildModel(kind) {
    const P = new Parts(), wd = material('wood', '#9C6438'), g = new THREE.Group();
    if (kind === 'raft') { for (let i = 0; i < 5; i++) P.add(wd, cyl(5, 5, 60, -20 + i * 10, 5, 0, 8).rotateX(0), { uv: false }); P.add(material('wood', '#6E4520'), box(56, 3, 6, 0, 10, -20)); P.add(material('wood', '#6E4520'), box(56, 3, 6, 0, 10, 20)); P.add(wd, cyl(2, 2, 70, 0, 45, 0, 6)); const sail = new THREE.Mesh(new THREE.PlaneGeometry(40, 46), std('#F2EAD8', { side: THREE.DoubleSide })); sail.position.set(0, 52, 2); g.add(sail); }
    else if (kind === 'bridge') { for (let i = 0; i < 6; i++) P.add(wd, box(T, 4, 8, 0, 6, -20 + i * 8)); }
    else if (kind === 'bell') { P.add(wd, box(6, 90, 6, -24, 45, 0)); P.add(wd, box(6, 90, 6, 24, 45, 0)); P.add(wd, box(56, 6, 8, 0, 90, 0)); g.add(new THREE.Mesh(new THREE.CylinderGeometry(8, 16, 24, 14).translate(0, 74, 0), new THREE.MeshStandardMaterial({ color: '#E3B04B', emissive: '#7A5410', emissiveIntensity: .5, metalness: .3, roughness: .35 }))); }
    else { const hull = new THREE.Mesh(new THREE.CylinderGeometry(22, 14, 120, 10, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), material('wood', '#8A5A30')); hull.position.y = 18; hull.rotation.x = Math.PI; g.add(hull); P.add(wd, cyl(3, 3, 110, 0, 60, 0, 6)); const sail = new THREE.Mesh(new THREE.PlaneGeometry(60, 70), std('#EFE3CC', { side: THREE.DoubleSide })); sail.position.set(0, 72, 0); sail.rotation.y = .4; g.add(sail); }
    g.add(P.build()); return shadowed(g);
  }
  /* الأشعة: أسطوانات مضيئة بين النقاط */
  const beamPool = [];
  function drawBeams(list) {
    let n = 0; list.forEach(pts => { for (let i = 0; i + 1 < pts.length; i++) { let m = beamPool[n]; if (!m) { m = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#FFE27A', transparent: true, opacity: .85, depthWrite: false })); scene.add(m); beamPool.push(m); }
      const [a, b] = [pts[i], pts[i + 1]], ax = a[0] * T + T / 2, az = a[1] * T + T / 2, bx = b[0] * T + T / 2, bz = b[1] * T + T / 2, len = Math.hypot(bx - ax, bz - az);
      m.visible = len > 1; m.scale.set(1, len, 1); m.position.set((ax + bx) / 2, 38, (az + bz) / 2); m.rotation.set(Math.PI / 2, 0, -Math.atan2(bx - ax, bz - az) + Math.PI); m.rotation.order = 'YXZ'; m.rotation.set(Math.PI / 2, Math.atan2(bx - ax, bz - az), 0); n++; } });
    for (let i = n; i < beamPool.length; i++) beamPool[i].visible = false;
  }
  function flame(s) { const g = new THREE.Group(); const o = new THREE.Mesh(new THREE.ConeGeometry(9 * s, 26 * s, 8), new THREE.MeshBasicMaterial({ color: '#FF8A1E', transparent: true, opacity: .92 })); o.position.y = 13 * s; const i = new THREE.Mesh(new THREE.ConeGeometry(5 * s, 16 * s, 8), new THREE.MeshBasicMaterial({ color: '#FFE070' })); i.position.y = 9 * s; g.add(o, i); g.userData.flame = 1; return g; }

  /* ── الطقس: الظلام والسماء والضباب تتغير بنعومة (عاصفة تهدأ، ليل، غبار)، والمطر والرمل جزيئات حول الكاميرا ── */
  const wz = { dark: -1, sand: 0, rain: 0 };
  let rain = null, rainbowM = null;
  const C = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);
  function weatherFrame(V, dt) {
    const w = V.weather || {}, k = Math.min(1, dt * 1.5);
    wz.dark = wz.dark < 0 ? V.dark : wz.dark + (V.dark - wz.dark) * k; wz.sand += ((w.sand ? 1 : 0) - wz.sand) * k; wz.rain += ((w.rain ? 1 : 0) - wz.rain) * k;
    const d = wz.dark, storm = Math.max(wz.rain * .6, 0);
    const sky = d > .4 ? C('#6E8AB8', '#0E1530', Math.min(1, (d - .1) / .7)) : C('#8CC4EE', '#6E8AB8', Math.min(1, d / .4));
    if (storm) sky.lerp(new THREE.Color('#4A5568'), storm); if (wz.sand > .01) sky.lerp(new THREE.Color('#D9A86A'), wz.sand * .8);
    scene.background.copy(sky); scene.fog.color.copy(sky); scene.fog.far = 2600 - wz.sand * 1700 - storm * 900; scene.fog.near = 900 - wz.sand * 700 - storm * 300;
    hemi.color.copy(C('#CFE4FA', '#5A6AA8', Math.min(1, d * 1.6))); hemi.groundColor.copy(C('#8A6A48', '#2A2030', Math.min(1, d * 1.6))); hemi.intensity = 1.05 - d * .55;
    sun.color.copy(C('#FFE9C4', '#9FB4FF', Math.min(1, d * 1.6))); sun.intensity = Math.max(.35, 2.5 - d * 2.6 - storm * 1.2);
    // قوس قزح بعد العاصفة: قريب من الكاميرا أمامها فيُرى من الزاوية العالية
    if (w.rainbow && !rainbowM) { rainbowM = new THREE.Group(); ['#E2475C', '#F08A1E', '#FFD54A', '#4CC36B', '#3F8BE8', '#5A4FD0', '#9B4FD0'].forEach((col, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(240 - i * 9, 4.5, 8, 64, Math.PI), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .55, depthWrite: false, fog: false })); rainbowM.add(m); }); scene.add(rainbowM); }
    if (rainbowM) { rainbowM.visible = !!w.rainbow; rainbowM.position.set(V.cam.x, -150, V.cam.y - 300); }
    // جزيئات المطر/الرمل
    const on = wz.rain > .05 || wz.sand > .05;
    if (on && !rain) { const n = MOB ? 700 : 1400, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 1600; p[i * 3 + 1] = Math.random() * 500; p[i * 3 + 2] = (Math.random() - .5) * 1400; } g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      rain = new THREE.Points(g, new THREE.PointsMaterial({ size: 3, color: '#CFE0F0', transparent: true, opacity: .7, depthWrite: false })); rain.frustumCulled = false; scene.add(rain); }
    if (rain) { rain.visible = on; if (on) { const p = rain.geometry.attributes.position, wd = V.wind && V.wind.on ? V.wind : { dx: -.6, dy: 0, gust: 0 }, sandy = wz.sand > wz.rain;
      rain.material.color.set(sandy ? '#E3B878' : '#CFE0F0'); rain.material.size = sandy ? 4 : 3; rain.material.opacity = Math.max(wz.rain, wz.sand) * .75;
      const vy = sandy ? -40 : -900, vx = (wd.dx || 0) * (sandy ? 700 : 260) * (1 + (wd.gust || 0) * 2);
      for (let i = 0; i < p.count; i++) { let x = p.getX(i) + vx * dt, y = p.getY(i) + vy * dt; if (y < 0) y += 500; if (x < -800) x += 1600; if (x > 800) x -= 1600; p.setX(i, x); p.setY(i, y); } p.needsUpdate = true;
      rain.position.set(V.cam.x, 0, V.cam.y); } }
  }

  /* ── كل إطار ── */
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), v3 = new THREE.Vector3();
  function frame(V) {
    if (built !== V.areaId || builtTV !== V.tilesV) { build(V); builtTV = V.tilesV; }
    const t = V.t, dt = Math.min(.05, Math.max(0, t - last)); last = t; wind.value = t;
    weatherFrame(V, dt);
    // البطل
    let hp = people.get('hero'); if (!hp || hp.lookKey !== V.heroKey) { if (hp) scene.remove(hp.root); hp = buildPerson(V.heroLook); hp.lookKey = V.heroKey; shadowed(hp.root); scene.add(hp.root); people.set('hero', hp); }
    animatePerson(hp, { x: V.P.x * T, y: V.P.y * T, moving: V.P.moving, phase: V.P.phase, dir: V.P.dir, faceCam: false }, dt, t);
    // العناصر
    const nearL = [];
    objs.forEach((o, e) => {
      o.visible = !e.hidden && !e.got;
      if (e.kind === 'block') { const bx = (e.px != null ? e.px : e.x) * T + T / 2, bz = (e.py != null ? e.py : e.y) * T + T / 2; o.position.set(bx, 0, bz); }
      if (o.userData.lid) o.userData.lid.rotation.x += ((e.open ? -1.9 : 0) - o.userData.lid.rotation.x) * Math.min(1, dt * 6);
      if (o.userData.arm) o.userData.arm.rotation.z += ((e.on ? -.6 : .6) - o.userData.arm.rotation.z) * Math.min(1, dt * 10);
      if (o.userData.plate) { const pulse = V.pressed(e) ? 1 : 1 + Math.sin(t * 5) * .08; o.userData.plate.scale.set(pulse, 1, pulse); nearL.push([o.position.x, 30, o.position.z, .45]); }
      if (o.userData.hl) { const pl = e.to && V.A.ent(e.to), on = pl && pl.x === e.x && pl.y === e.y; o.userData.hl.visible = !on; o.userData.hl.material.opacity = .5 + Math.sin(t * 4) * .3; }
      if (e.kind === 'block' && e.to) guide(e, V.A.ent(e.to), t);
      if (o.userData.plate) { const on = V.pressed(e); o.userData.plate.material.color.set(on ? '#FFD54A' : '#B89A3A'); o.userData.plate.material.emissiveIntensity = on ? 1.2 : .5 + Math.sin(t * 5) * .3; }
      if (o.userData.bars) { const tgt = e.open ? -74 : 0; o.position.y += (tgt - o.position.y) * Math.min(1, dt * 4); if (e.open && o.position.y < -70) o.visible = false; }
      if (e.kind === 'door' && e.open) o.visible = false;
      if (o.userData.spin) { o.userData.spin.rotation.y = t * 1.6; o.userData.spin.position.y = 30 + Math.sin(t * 3 + e.x) * 4; }
      if (o.userData.bob) o.userData.bob.position.y = (e.kind === 'exit' ? 18 : 34) + Math.sin(t * 3 + e.y) * 4;
      if (o.userData.beacon) { o.userData.beacon.visible = !!e.lit; o.userData.bring.visible = !e.lit; o.userData.bring.material.opacity = .3 + Math.sin(t * 4) * .2; if (e.lit) nearL.push([o.position.x, 130, o.position.z, 2.6]); }
      if (o.userData.light && e.lit !== false) nearL.push([o.position.x, 30, o.position.z, 1]);
      o.traverse(m => { if (m.userData.flame) { const k = 1 + Math.sin(t * 13 + e.x * 3) * .12; m.scale.set(1, k, 1); } });
      if (o.userData.creature) { const px = ((e.kind === 'hazard') ? e.px + .5 : e.follow ? e.fx : e.x + .5) * T, pz = ((e.kind === 'hazard') ? e.py + .5 : e.follow ? e.fy : e.y + .5) * T;
        const dx = px - o.position.x, dz = pz - o.position.z; if (dx * dx + dz * dz > .5) o.rotation.y = Math.atan2(dx, dz); o.position.set(px, 0, pz);
        const cr = o.userData.creature; cr.position.y = (e.kind === 'hazard' || e.moving) ? Math.abs(Math.sin(t * 10)) * 2 : 0; if (cr.userData.roll) cr.userData.roll.rotation.x += dt * 4;
        if (o.userData.mark) { const mt = e.mark ? e.mark(V.A) : null; o.userData.mark.visible = !!mt; }
        if (e.kind === 'hazard') nearL.push([px, 30, pz, .35]); }
      if (o.userData.rot) { const tgt = -(e.r || 0) * Math.PI / 2; let d = tgt - o.userData.rot.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.userData.rot.rotation.y += d * Math.min(1, dt * 8); }
      if (o.userData.tab && o.userData.symNow !== e.sym) { o.userData.symNow = e.sym; o.userData.tab.material.map = iconTexture((V.symbols || [])[e.sym || 0] || '?', '#8C7A5A'); o.userData.tab.material.needsUpdate = true; }
      if (o.userData.crystal) { o.userData.crystal.material.emissiveIntensity = e.lit ? 2.2 + Math.sin(t * 8) * .4 : .4; o.userData.crystal.rotation.y = t * (e.lit ? 2 : .4); if (e.lit) nearL.push([o.position.x, 40, o.position.z, 1.2]); }
      if (o.userData.site) { o.userData.site.visible = !e.built; o.userData.site.material.opacity = .4 + Math.sin(t * 4) * .3; o.userData.built.visible = !!e.built; }
      if (e.kind === 'npc' || e.kind === 'guard') {
        const Pp = people.get(e); if (!Pp) return; Pp.root.visible = !e.hidden;
        const px = e.follow ? e.fx * T : (e.kind === 'guard' ? e.px : e.x) * T + T / 2, pz = e.follow ? e.fy * T : (e.kind === 'guard' ? e.py : e.y) * T + T / 2;
        const face = e.kind === 'guard' ? { x: px + Math.cos(e.ang) * 50, y: pz + Math.sin(e.ang) * 50 } : (Math.hypot(V.P.x * T - px, V.P.y * T - pz) < 160 ? { x: V.P.x * T, y: V.P.y * T } : null);
        animatePerson(Pp, { x: px, y: pz, moving: (e.kind === 'guard' && !e.pause && !e.spin) || !!(e.follow && e.moving), phase: e.ph || 0, dir: e.face || 'down', face: e.follow ? null : face }, dt, t);
        o.position.set(px, 0, pz);
        if (o.userData.cone) { o.userData.cone.rotation.z = -e.ang; o.userData.cone.material.color.set(V.caught === e ? '#FF4646' : '#FFD54A'); }
        const mt = e.kind === 'guard' ? (V.caught === e ? '!' : null) : e.mark ? e.mark(V.A) : null; o.userData.mark.visible = !!mt && !e.hidden; o.userData.mark.position.y = 96 + Math.sin(t * 4) * 4;
        if (e.kind === 'guard') nearL.push([px + Math.cos(e.ang) * 14, 40, pz + Math.sin(e.ang) * 14, .7]);
      }
    });
    // الشوك والصخور المقطوعة
    V.cutList().forEach(k => { if (!cutSeen.has(k)) { cutSeen.add(k); const o = tileObj.get(k); if (o) o.visible = false; } });
    tileObj.forEach((o, k) => { if (o.visible && V.canCut(k)) { const s = 1 + Math.sin(t * 5) * .04; o.scale.set(s, s, s); } });
    // أقرب الأضواء للبطل
    const hx = V.P.x * T, hz = V.P.y * T; nearL.sort((a, b) => Math.hypot(a[0] - hx, a[2] - hz) - Math.hypot(b[0] - hx, b[2] - hz));
    lights.forEach((l, i) => { const q = nearL[i]; if (!q || V.dark < .1) { l.intensity = 0; return; } l.position.set(q[0], q[1], q[2]); l.distance = 260 * q[3]; l.intensity = (6000 + Math.sin(t * 9 + i) * 600) * q[3]; });
    heroLight.intensity = V.dark > .3 ? (V.lantern ? 9000 : 2600) : 0; heroLight.distance = V.lantern ? 330 : 170; heroLight.position.set(hx, 70, hz + 10);
    drawBeams(V.beams || []);
    // هدف المهمة الحالية: ماسة ذهبية فوق الهدف
    const g = V.goalAt; marker.visible = !!g; if (g) { const tall = V.ents.find(e => e.kind === 'beacon' && e.x === g.x && e.y === g.y); marker.position.set(g.x * T + T / 2, (tall ? 170 : 128) + Math.sin(t * 3) * 6, g.y * T + T / 2); marker.rotation.y = t * 1.5; }
    // الماء والجزيئات
    root.traverse(o => { if (o.userData.water) o.userData.water.color.offsetHSL(0, 0, Math.sin(t * 2) * .0006); });
    const fx = V.fx; if (fx.length) { const pos = new Float32Array(fx.length * 3), col = new Float32Array(fx.length * 3), c = new THREE.Color();
      fx.forEach((p, i) => { pos[i * 3] = p.x; pos[i * 3 + 1] = 30 + (p.h || 0); pos[i * 3 + 2] = p.y; c.set(p.col); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; });
      fxPts.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3)); fxPts.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3)); fxPts.visible = true; } else fxPts.visible = false;
    // الكاميرا: من الجنوب بزاوية عالية تتبع البطل
    const ci = V.cine == null ? 1 : Math.min(1, V.cine), e = 1 - Math.pow(1 - ci, 3);   // لقطة افتتاحية: من فوق القرية إلى البطل
    const dist = (W < H ? 900 : 760) / V.zoom * (V.userZoom || 1) * (1 + (1 - e) * 1.8), pitch = (34 + (1 - e) * 30) * Math.PI / 180, cx = V.cam.x, cz = V.cam.y - 10;
    camera.position.set(cx + V.shake * (Math.random() - .5) * 10, Math.sin(pitch) * dist, cz + Math.cos(pitch) * dist); camera.lookAt(cx, 0, cz);
    sun.position.set(cx - 380, 900, cz - 520); sun.target.position.set(cx, 0, cz); sun.target.updateMatrixWorld();
    renderer.render(scene, camera);
  }
  /* من الشاشة إلى الأرض (للنقر) */
  function pick(sx, sy) { ray.setFromCamera({ x: sx / W * 2 - 1, y: -(sy / H) * 2 + 1 }, camera); return ray.ray.intersectPlane(plane, v3) ? { x: v3.x, y: v3.z } : null; }
  function dispose() { renderer.dispose(); people.forEach(P => scene.remove(P.root)); if (root) root.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  return { frame, pick, resize, dispose };
}
