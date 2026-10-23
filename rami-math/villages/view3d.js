// العرض ثلاثي الأبعاد للقرية: يقرأ نموذج grid.js والحالة فقط (طبقة عرض)، ولا يغيّر اللعب.
// كاميرا مائلة ٤٥° (نفس زاوية العرض العادي متساوي القياس فيتطابق العرضان)، شمس بظلال حول البطل، ضباب ولون جو لكل قرية،
// وتوهج ناعم في الجودة العالية. أدوات القرية (kit3d في ملف القرية) تبني أرضها وجدرانها ومعالمها ومحطاتها.
import * as THREE from '../lib/three/three.module.min.js';
import { buildPerson, animatePerson } from '../renderer3d/people.js';
import { makeComposer } from '../renderer3d/post.js';
import { Parts } from '../renderer3d/geom.js';

export const S = 48;   // بلاطة واحدة = ٤٨ وحدة (البطل نحو ٦٤ وحدة: بلاطة وثلث)

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}

export function createView3D(canvas, grid, def, opts = {}) {
  const high = opts.quality !== 'low', mob = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const r = new THREE.WebGLRenderer({ canvas, antialias: !high || !mob, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, high ? (mob ? 1.5 : 1.75) : 1.25));
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = def.mood.exposure ?? 1;
  r.shadowMap.enabled = true; r.shadowMap.type = high ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;

  const M = def.mood, sc = new THREE.Scene();
  sc.background = new THREE.Color(M.sky); sc.fog = new THREE.Fog(M.fog || M.sky, M.fogNear ?? 500, M.fogFar ?? 1500);
  const hemi = new THREE.HemisphereLight(M.hemi[0], M.hemi[1], M.hemi[2]); sc.add(hemi);
  const sun = new THREE.DirectionalLight(M.sun.color, M.sun.i); sun.castShadow = true;
  sun.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024); sun.shadow.bias = -.0004; sun.shadow.normalBias = .6;
  Object.assign(sun.shadow.camera, { left: -420, right: 420, top: 420, bottom: -420, near: 10, far: 1600 });
  sc.add(sun, sun.target);
  const sunDir = new THREE.Vector3(...M.sun.dir).normalize();

  // الأرض والجدران: كل مادة شبكة واحدة مدموجة (رسم قليل الاستدعاءات على الأجهزة الضعيفة)
  const kit = def.kit3d(THREE, { S, Parts, high });
  const P = new Parts();
  if (kit.init) kit.init(grid);
  grid.cells.forEach(c => { if (c.wall) kit.wall(P, c); else kit.floor(P, c); });
  const terrain = P.build(); sc.add(terrain);
  if (kit.decor) sc.add(kit.decor(grid));   // ما حول الخريطة وزينتها الثابتة

  const things = new Map();   // المعالم والمحطات: id → Object3D (لها update(t, st) اختيارية)
  const addThing = (id, o) => { if (!o) return; things.set(id, o); sc.add(o); };
  (def.props || []).forEach((p, i) => addThing('p' + i, kit.prop(p)));
  (def.stations || []).forEach(st => addThing('st:' + st.id, kit.station(st)));

  // علامة الهدف: حلقة مضيئة ومعين يطفو فوق المحطة الحالية
  const marker = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(26, 2.2, 8, 40), new THREE.MeshBasicMaterial({ color: M.accent || '#FFD54A', transparent: true, opacity: .85 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 2;
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(9, 0), new THREE.MeshStandardMaterial({ color: M.accent || '#FFD54A', emissive: M.accent || '#FFD54A', emissiveIntensity: 1.4, roughness: .3 }));
  marker.add(ring, gem); marker.visible = false; sc.add(marker);
  // دائرة الوجهة حين ينقر الطالب
  const dest = new THREE.Mesh(new THREE.RingGeometry(10, 14, 32), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false }));
  dest.rotation.x = -Math.PI / 2; dest.position.y = 1.5; sc.add(dest);

  // البطل
  let hero = null, heroKey = '';
  const ensureHero = look => { const k = JSON.stringify(look); if (k === heroKey) return; if (hero) sc.remove(hero.root); hero = buildPerson(look); hero.lastX = null; sc.add(hero.root); heroKey = k; };

  // غبار متطاير في الضوء (الجودة العالية)
  let motes = null;
  if (high && M.motes) {
    const n = 220, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 900; pos[i * 3 + 1] = 10 + Math.random() * 160; pos[i * 3 + 2] = (Math.random() - .5) * 900; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    motes = new THREE.Points(g, new THREE.PointsMaterial({ color: M.motes, size: 2.2, transparent: true, opacity: .55, depthWrite: false }));
    sc.add(motes);
  }

  const cam = new THREE.PerspectiveCamera(38, 1, 10, 4000);
  const view = { yaw: Math.PI / 4, pitch: .92, dist: 560, zoom: 1 };   // ٤٥° مثل العرض العادي
  const camAt = new THREE.Vector3(), camGoal = new THREE.Vector3();
  let comp = null;
  const resize = () => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    r.setSize(w, h, false); cam.aspect = w / h; view.dist = (w < h ? 1050 : 600);   // الشاشة الطولية (الهاتف): كاميرا أبعد ترى ما حول البطل cam.updateProjectionMatrix();
    if (comp) comp.setSize(w, h);
  };
  if (high) try { comp = makeComposer(r, sc, cam); } catch (e) { comp = null; }
  resize();

  let t = 0, last = performance.now(), first = true;
  function frame(st) {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    ensureHero(st.look);
    const px = st.hero.x * S, pz = st.hero.y * S;
    animatePerson(hero, { x: px, y: pz, moving: st.hero.moving, phase: st.hero.phase, run: false, dir: st.hero.dir, anim: st.hero.anim, animT: st.hero.animT }, dt, t);
    // الكاميرا: تتبع البطل بنعومة
    camGoal.set(px, 30, pz);
    if (first) { camAt.copy(camGoal); first = false; } else camAt.lerp(camGoal, 1 - Math.exp(-dt * 5));
    const d = view.dist / view.zoom;
    cam.position.set(camAt.x + Math.sin(view.yaw) * Math.cos(view.pitch) * d, camAt.y + Math.sin(view.pitch) * d, camAt.z + Math.cos(view.yaw) * Math.cos(view.pitch) * d);
    cam.lookAt(camAt);
    sun.position.set(px + sunDir.x * 700, sunDir.y * 700, pz + sunDir.z * 700); sun.target.position.set(px, 0, pz); sun.target.updateMatrixWorld();
    // المحطة الحالية
    const goal = st.goal && things.get('st:' + st.goal);
    marker.visible = !!goal;
    if (goal) { marker.position.set(goal.position.x, 0, goal.position.z); gem.position.y = 96 + Math.sin(t * 2.4) * 6; gem.rotation.y = t * 1.6; ring.scale.setScalar(1 + .08 * Math.sin(t * 3)); ring.material.opacity = .55 + .3 * Math.sin(t * 3); }
    if (st.dest) { dest.position.x = st.dest.x * S; dest.position.z = st.dest.y * S; dest.material.opacity = Math.max(0, st.dest.k); dest.scale.setScalar(1.6 - st.dest.k * .6); } else dest.material.opacity = 0;
    things.forEach((o, id) => o.userData.update && o.userData.update(t, st, id));
    if (motes) { motes.position.set(px, 0, pz); motes.rotation.y = t * .03; }
    if (comp) comp.render(); else r.render(sc, cam);
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  function pick(cx, cy) {   // نقرة الشاشة → موضع على الأرض بوحدة البلاطة
    const b = canvas.getBoundingClientRect(); ndc.set(((cx - b.left) / b.width) * 2 - 1, -((cy - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    return ray.ray.intersectPlane(ground, hit) ? { x: hit.x / S, y: hit.z / S } : null;
  }
  function project(x, y, h = 0) {   // موضع بالبلاطة → نقطة على الشاشة (لفقاعات الكلام)
    const v = new THREE.Vector3(x * S, h, y * S).project(cam), b = canvas.getBoundingClientRect();
    return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height };
  }
  function dispose() {
    sc.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    r.dispose(); r.forceContextLoss && r.forceContextLoss();
  }
  return { kind: '3d', frame, pick, project, resize, dispose, zoom: z => { view.zoom = Math.min(1.8, Math.max(.6, z)); }, get zoomV() { return view.zoom; } };
}
