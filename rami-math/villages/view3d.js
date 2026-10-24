// العرض ثلاثي الأبعاد للقرية بوحدات العالم المفتوح (بكسل = وحدة) وزاوية كاميرته (٤٣°)، ويقرأ الحالة فقط.
// الأرض هي رسم العرض العادي نفسه (kit2d.ground) في قطع ٥١٢ فيتطابق العرضان، والمباني والنخيل والشخصيات من مكتبة renderer3d
// عبر kit3d في ملف القرية. شمس بظلال حول البطل، سماء وسحب وجبال بعيدة، وتوهج ناعم في الجودة العالية.
import * as THREE from '../lib/three/three.module.min.js';
import { buildPerson, animatePerson } from '../renderer3d/people.js';
import { makeComposer } from '../renderer3d/post.js';
import { wind } from '../renderer3d/nature.js';
import { FLAGS } from '../world/art.js';

const FOV = 42, PITCH = 43 * Math.PI / 180, CH = 512;
export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}

export function createView3D(canvas, grid, def, opts = {}) {
  const high = opts.quality !== 'low', mob = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const r = new THREE.WebGLRenderer({ canvas, antialias: !high || !mob, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, high ? (mob ? 1.5 : 1.75) : 1.25));
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = def.mood.exposure ?? .95;
  r.shadowMap.enabled = true; r.shadowMap.type = high ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
  const M = def.mood, sc = new THREE.Scene();
  sc.background = new THREE.Color(M.sky); sc.fog = new THREE.Fog(M.fog || M.sky, M.fogNear ?? 1600, M.fogFar ?? 5200);
  sc.add(new THREE.HemisphereLight(M.hemi[0], M.hemi[1], M.hemi[2]));
  const sun = new THREE.DirectionalLight(M.sun.color, M.sun.i); sun.castShadow = true;
  sun.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024); sun.shadow.bias = -.0005; sun.shadow.normalBias = .8;
  Object.assign(sun.shadow.camera, { left: -900, right: 900, top: 900, bottom: -900, near: 10, far: 4000 });
  sc.add(sun, sun.target);
  const sunDir = new THREE.Vector3(...M.sun.dir).normalize();

  // الأرض: قطع من رسم العرض العادي نفسه
  FLAGS.three = true;
  const k2 = def.kit2d(def), groundG = new THREE.Group();
  // تُبنى القطع حول البطل فقط (قطعتان كل إطار) وتُحذف البعيدة: العالم المتصل أعرض من أن يُرسم كله
  const tiles = new Map(), NC = Math.ceil(grid.W / CH), NR = Math.ceil(grid.H / CH);
  function makeTile(cx, cy) {
    const c = document.createElement('canvas'); c.width = c.height = CH; const g = c.getContext('2d'); g.translate(-cx * CH, -cy * CH); k2.ground(g, cx * CH, cy * CH, CH, CH);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(CH, CH), new THREE.MeshStandardMaterial({ map: tex, roughness: .95, alphaTest: .5 })   /* الشفاف من رسم الأرض (كالبحر) يُظهر ما تحته */);
    m.rotation.x = -Math.PI / 2; m.position.set(cx * CH + CH / 2, 0, cy * CH + CH / 2); m.receiveShadow = true; groundG.add(m); return m;
  }
  function groundAround(hx, budget) {
    const c0 = Math.floor(hx / CH), want = [];
    for (let cx = Math.max(0, c0 - 6); cx <= Math.min(NC - 1, c0 + 6); cx++) for (let cy = 0; cy < NR; cy++) if (!tiles.has(cx + ',' + cy)) want.push([cx, cy]);
    want.sort((a, b) => Math.abs(a[0] - c0) - Math.abs(b[0] - c0)).slice(0, budget).forEach(([cx, cy]) => tiles.set(cx + ',' + cy, makeTile(cx, cy)));
    tiles.forEach((m, k) => { if (Math.abs(+k.split(',')[0] - c0) > 9) { groundG.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); tiles.delete(k); } });
  }
  groundAround(def.start.x, 28);
  // أرض ممتدة خلف حدود القرية حتى الأفق (لا فراغ عند الأطراف)
  const far = new THREE.Mesh(new THREE.PlaneGeometry(grid.W + 9000, grid.H + 9000), new THREE.MeshStandardMaterial({ color: M.far || '#DDBF8C', roughness: 1 }));
  far.rotation.x = -Math.PI / 2; far.position.set(grid.W / 2, -.6, grid.H / 2); far.receiveShadow = true; groundG.add(far);
  sc.add(groundG);
  // القرية: مبانٍ ونخيل ومعالم ومحطات من ملفها
  const K = def.kit3d(THREE, { high, def, grid });
  sc.add(K.group);
  // علامة الهدف ودائرة الوجهة
  const marker = new THREE.Group(), acc = M.accent || '#FFC94A';
  const ring = new THREE.Mesh(new THREE.TorusGeometry(44, 3, 8, 48), new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: .85 })); ring.rotation.x = Math.PI / 2; ring.position.y = 3;
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(14, 0), new THREE.MeshStandardMaterial({ color: acc, emissive: acc, emissiveIntensity: 1.3, roughness: .3 }));
  marker.add(ring, gem); marker.visible = false; sc.add(marker);
  const dest = new THREE.Mesh(new THREE.RingGeometry(14, 19, 32), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0, depthWrite: false }));
  dest.rotation.x = -Math.PI / 2; dest.position.y = 2; sc.add(dest);
  // الشخصيات: أكبر من العالم المفتوح وبنسب أقرب للواقع (رأس أصغر وجسم أطول) لطلاب الثامن
  const teen = P => { P.head.scale.multiplyScalar(.82); P.root.scale.multiplyScalar(1.22); P.root.scale.y *= 1.12; P.lastX = null; return P; };
  const folk = (def.people || []).map(q => { const P = teen(buildPerson(q.look)); sc.add(P.root); return { q, P }; });
  const walkers = new Map();
  let hero = null, heroKey = '';
  const ensureHero = look => { const k = JSON.stringify(look); if (k === heroKey) return; if (hero) sc.remove(hero.root); hero = teen(buildPerson(look)); sc.add(hero.root); heroKey = k; };

  const cam = new THREE.PerspectiveCamera(FOV, 1, 20, 14000);
  const at = new THREE.Vector3(), goalV = new THREE.Vector3();
  let zoom = 1, vw = 1, vh = 1, comp = null, intro = 1;   // intro: الكاميرا تبدأ واسعة ترى القرية ثم تقترب
  const resize = () => { vw = canvas.clientWidth || innerWidth; vh = canvas.clientHeight || innerHeight; r.setSize(vw, vh, false); cam.aspect = vw / vh; cam.updateProjectionMatrix(); if (comp) comp.setSize(vw, vh); };
  if (high) try { comp = makeComposer(r, sc, cam); } catch (e) { comp = null; }
  resize();
  let t = 0, last = performance.now(), first = true;
  function frame(st) {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; wind.value = t;
    ensureHero(st.look); FLAGS.three = true; groundAround(st.hero.x, 2);
    const h = st.hero;
    animatePerson(hero, { x: h.x, y: h.y, moving: h.moving, phase: h.phase, run: h.run, dir: h.dir2d, anim: h.anim, animT: h.animT, faceCam: true }, dt, t);
    folk.forEach(({ q, P }) => { const near = Math.hypot(q.x - h.x, q.y - h.y) < 160; animatePerson(P, { x: q.x, y: q.y, moving: false, phase: 0, dir: q.dir || 'down', face: near ? { x: h.x, y: h.y } : null, anim: st.talking === q.id ? 'talk' : null, animT: 0 }, dt, t); });
    (st.walkers || []).concat(st.walkersExtra || []).forEach(w => { let P = walkers.get(w); if (!P) { P = teen(buildPerson(w.look)); sc.add(P.root); walkers.set(w, P); } animatePerson(P, { x: w.x, y: w.y, moving: w.moving, phase: w.phase, dir: w.dir, anim: w.anim, animT: (t * .8) % 1 }, dt, t); });
    // الكاميرا: من الجنوب بزاوية العالم المفتوح، وعرض الرؤية يتسع عند الدخول ثم يقترب
    intro = Math.max(0, intro - dt * .45);
    const viewW = (vw < vh ? 700 : 1300) / zoom * (1 + intro * intro * 1.4), dist = (viewW / 2) / (Math.tan(FOV * Math.PI / 360) * cam.aspect);
    goalV.set(h.x, 0, h.y + 40);
    if (first) { at.copy(goalV); first = false; } else at.lerp(goalV, 1 - Math.exp(-dt * 4));
    cam.position.set(at.x, Math.sin(PITCH) * dist, at.z + Math.cos(PITCH) * dist); cam.lookAt(at.x, 0, at.z);
    sun.position.set(h.x + sunDir.x * 1500, sunDir.y * 1500, h.y + sunDir.z * 1500); sun.target.position.set(h.x, 0, h.y); sun.target.updateMatrixWorld();
    const goal = st.goalPt;
    marker.visible = !!goal;
    if (goal) { marker.position.set(goal.x, 0, goal.y); gem.position.y = (goal.mh || 150) + Math.sin(t * 2.4) * 8; gem.rotation.y = t * 1.6; ring.material.opacity = .55 + .3 * Math.sin(t * 3); }
    if (st.dest) { dest.position.x = st.dest.x; dest.position.z = st.dest.y; dest.material.opacity = Math.max(0, st.dest.k); dest.scale.setScalar(1.6 - st.dest.k * .6); } else dest.material.opacity = 0;
    if (K.update) K.update(t, st, cam);
    if (comp) comp.render(); else r.render(sc, cam);
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  function pick(cx, cy) { const b = canvas.getBoundingClientRect(); ndc.set(((cx - b.left) / b.width) * 2 - 1, -((cy - b.top) / b.height) * 2 + 1); ray.setFromCamera(ndc, cam); return ray.ray.intersectPlane(plane, hit) ? { x: hit.x, y: hit.z } : null; }
  function project(x, y, hh = 0) { const v = new THREE.Vector3(x, hh, y).project(cam), b = canvas.getBoundingClientRect(); return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height }; }
  function dispose() { FLAGS.three = false; sc.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.map && o.material.map.isCanvasTexture) o.material.map.dispose(); }); r.dispose(); r.forceContextLoss && r.forceContextLoss(); }
  return { kind: '3d', frame, pick, project, resize, dispose, zoom: z => { zoom = Math.min(1.9, Math.max(.55, z)); }, get zoomV() { return zoom; } };
}
