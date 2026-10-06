// طبقة العرض ثلاثية الأبعاد (Three.js): تقرأ حالة اللعبة وكاميرا المحرك ولا تعدّل شيئاً.
// الأرض = رسم الأرض ثنائي الأبعاد نفسه مفروشاً كخامات (الطرق والساحات في أماكنها بالضبط)، وفوقها المجسّمات.
// تحويل الإحداثيات: نقطة اللعبة (x, y) هي (x, 0, y) في المشهد، والارتفاع على المحور الصاعد.
import * as THREE from '../lib/three/three.module.min.js';
import { RoomEnvironment } from '../lib/three/addons/RoomEnvironment.js';
import { material, setAniso } from './textures.js';
import { wind, sky, mountains, sea } from './nature.js';
import { buildVillage } from './world.js';

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}

const FOV = 36, PITCH = 36 * Math.PI / 180, TILE = 512;

/* opts: { quality: 'high'|'low', paintGround(ctx, rect), world: {w, h}, onProgress(k) } */
export async function create3D(opts) {
  const q = opts.quality === 'low' ? 'low' : 'high', step = async (k) => { opts.onProgress && opts.onProgress(k); await new Promise(r => setTimeout(r, 0)); };
  const canvas = document.createElement('canvas'); canvas.id = 'game3d';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;z-index:-1';   // تحت كل شيء: الـcanvas ثنائي الأبعاد الشفاف والواجهة فوقه
  document.body.insertBefore(canvas, document.body.firstChild);
  document.body.style.background = 'transparent';   // خلفية الصفحة كانت ستغطي المشهد (هو تحتها)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: q === 'high', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q === 'high' ? 1.75 : 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .92;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = q === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  setAniso(Math.min(8, renderer.capabilities.getMaxAnisotropy()));
  await step(.05);

  const scene = new THREE.Scene();
  const HORIZON = '#EAD9B8';
  scene.fog = new THREE.Fog(HORIZON, 1600, 5600);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 20, 14000);

  // الإضاءة: شمس نهارية دافئة من الشمال الغربي (الظلال نحو الجنوب الشرقي كما في الرسم ثنائي الأبعاد)، وسماء، وبيئة للانعكاسات
  const hemi = new THREE.HemisphereLight('#CFE4FA', '#B08D62', 1.05); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFE9C4', 2.7); sun.castShadow = true;
  const SM = q === 'high' ? 2048 : 1024; sun.shadow.mapSize.set(SM, SM); sun.shadow.bias = -.0004; sun.shadow.normalBias = .6; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const SUN_DIR = new THREE.Vector3(-.52, 1, -.62).normalize();
  const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .32;
  scene.add(sky());
  await step(.12);

  const W = opts.world, bounds = { x0: 0, z0: 0, x1: 2930, z1: W.h };
  scene.add(mountains(bounds));
  const seaM = sea(2930, -2000, W.h + 2000); scene.add(seaM);
  // رمل خارج العالم حتى الجبال
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(14000, 14000), material('sand', '#fff', { repeat: [60, 60] }));
  outer.rotation.x = -Math.PI / 2; outer.position.set(1465, -1.2, W.h / 2); outer.receiveShadow = true; scene.add(outer);
  await step(.2);

  /* ── الأرض بقطع ٥١٢: كل قطعة تُرسم من الرسم ثنائي الأبعاد (بلا ظلال مرسومة: الظلال الحقيقية من الشمس) ── */
  const PPU = q === 'high' ? 1.5 : 1, tiles = new Map(), groundNormal = material('sand', '#fff').normalMap.clone(); groundNormal.repeat.set(5, 5); groundNormal.needsUpdate = true;
  const tileGeo = new THREE.PlaneGeometry(TILE, TILE); tileGeo.rotateX(-Math.PI / 2);
  function makeTile(tx, ty) {
    const key = tx + ',' + ty; if (tiles.has(key)) return tiles.get(key);
    const c = document.createElement('canvas'); c.width = c.height = Math.round(TILE * PPU); const x = c.getContext('2d');
    x.setTransform(PPU, 0, 0, PPU, -tx * TILE * PPU, -ty * TILE * PPU);
    try { opts.paintGround(x, { x: tx * TILE, y: ty * TILE, w: TILE, h: TILE }); } catch (e) { console.error('ground tile', e); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); t.generateMipmaps = true;
    const m = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({ map: t, color: '#E9E0D0', normalMap: groundNormal, normalScale: new THREE.Vector2(.5, .5), roughness: 1 }));
    m.position.set(tx * TILE + TILE / 2, 0, ty * TILE + TILE / 2); m.receiveShadow = true; scene.add(m);
    const T = { mesh: m, tex: t, used: 0 }; tiles.set(key, T); return T;
  }
  function dropFar(keep) {
    if (tiles.size <= keep) return;
    [...tiles.entries()].sort((a, b) => a[1].used - b[1].used).slice(0, tiles.size - keep).forEach(([k, T]) => { scene.remove(T.mesh); T.tex.dispose(); T.mesh.material.dispose(); tiles.delete(k); });
  }

  /* ── المجسّمات: قلب القرية (المرحلة ١) ── */
  const village = buildVillage({ quality: q }); scene.add(village.group);
  await step(.75);

  /* ── الكاميرا: تتبع كاميرا المحرك، بزاوية مرتفعة ثابتة، والمسافة تحفظ عرض الرؤية نفسه ── */
  const target = new THREE.Vector3(), tmp = new THREE.Vector3(), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let frame = 0, view = { x: 0, y: 0, w: 1, h: 1 }, W2 = 0, H2 = 0;
  function resize() {
    W2 = window.innerWidth; H2 = window.innerHeight;
    renderer.setSize(W2, H2, false); camera.aspect = W2 / H2; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();
  const toNDC = (sx, sy) => new THREE.Vector2(sx / W2 * 2 - 1, -(sy / H2) * 2 + 1);
  function groundAt(sx, sy) { ray.setFromCamera(toNDC(sx, sy), camera); const p = ray.ray.intersectPlane(plane, tmp); return p ? { x: p.x, y: p.z } : null; }
  function project(x, y, h = 0) { const v = new THREE.Vector3(x, h, y).project(camera); return { x: (v.x + 1) / 2 * W2, y: (1 - v.y) / 2 * H2 }; }

  /* ── طبقة الأرض المتغيرة (المزرعة، البركة، رسومات الدروس على الأرض): canvas يُرسم حول ما تراه الكاميرا ويُفرش
     على الأرض نفسها، فتقف المجسّمات فوقه وتلقي ظلالها عليه. تُحدَّث بمعدل محدود حتى لا تُثقل الأجهزة الضعيفة ── */
  const decal = { canvas: document.createElement('canvas'), tex: null, mesh: null, last: -1, rect: null };
  decal.ctx = decal.canvas.getContext('2d');
  decal.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }));
  decal.mesh.receiveShadow = true; decal.mesh.renderOrder = 1; decal.mesh.visible = false; scene.add(decal.mesh);
  const DECAL_HZ = q === 'high' ? 30 : 20, DECAL_PPU = q === 'high' ? 1.1 : .75;
  function paintDecal(t, paint) {
    if (decal.last >= 0 && t - decal.last < 1 / DECAL_HZ) return;
    decal.last = t;
    const r = { x: Math.max(0, Math.floor(view.x / 64) * 64 - 64), y: Math.max(0, Math.floor(view.y / 64) * 64 - 64) };
    r.w = Math.min(1800, Math.ceil((view.w + 128) / 64) * 64); r.h = Math.min(1800, Math.ceil((view.h + 128) / 64) * 64);
    const cw = Math.round(r.w * DECAL_PPU), ch = Math.round(r.h * DECAL_PPU), c = decal.canvas, x = decal.ctx;
    if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; if (decal.tex) decal.tex.dispose(); decal.tex = new THREE.CanvasTexture(c); decal.tex.colorSpace = THREE.SRGBColorSpace; decal.tex.generateMipmaps = false; decal.tex.minFilter = THREE.LinearFilter; decal.mesh.material.map = decal.tex; decal.mesh.material.needsUpdate = true; }
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cw, ch);
    x.setTransform(DECAL_PPU, 0, 0, DECAL_PPU, -r.x * DECAL_PPU, -r.y * DECAL_PPU);
    paint(x, r);
    decal.tex.needsUpdate = true;
    decal.mesh.scale.set(r.w, 1, r.h); decal.mesh.position.set(r.x + r.w / 2, .4, r.y + r.h / 2); decal.mesh.visible = true;
  }

  const L = {
    canvas, renderer, scene, camera,
    /* الرسم على الأرض المتغيرة: paint(ctx, rect) بإحداثيات اللعبة */
    ground: null,
    /* يُستدعى في كل إطار من المحرك */
    frame(E, t, state) {
      frame++;
      const zoom = E.zoom * (1 + E.punch * .06), viewW = E.w / zoom;
      const dist = (viewW / 2) / (Math.tan(FOV * Math.PI / 360) * camera.aspect);
      target.set(E.cam.x, 0, E.cam.y + 46);
      const qx = E.quake ? (Math.random() - .5) * 6 * E.quake : 0, qy = E.quake ? (Math.random() - .5) * 6 * E.quake : 0;
      camera.position.set(target.x + qx, Math.sin(PITCH) * dist + qy, target.z + Math.cos(PITCH) * dist);
      camera.lookAt(target.x + qx, 0, target.z); camera.updateMatrixWorld();
      // الظل يتبع ما تراه الكاميرا
      const ext = Math.min(1700, Math.max(520, dist * .75)), sc = sun.shadow.camera;
      if (sc.right !== ext) { sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 10; sc.far = 4200; sc.updateProjectionMatrix(); }
      sun.position.copy(target).addScaledVector(SUN_DIR, 1800); sun.target.position.copy(target); sun.target.updateMatrixWorld();
      // ما يُرى من الأرض (للاستبعاد في الرسم فوقها)
      const pts = [[0, 0], [W2, 0], [0, H2], [W2, H2]].map(([a, b]) => groundAt(a, b) || { x: target.x, y: target.z - 2000 });
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
      view = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
      // قطع الأرض المطلوبة: الظاهرة وحولها، قطعتان جديدتان في كل إطار على الأكثر حتى لا يتقطع اللعب
      let made = 0;
      for (let ty = Math.floor((view.y - 200) / TILE); ty <= Math.floor((view.y + view.h + 200) / TILE); ty++)
        for (let tx = Math.floor((view.x - 200) / TILE); tx <= Math.floor((view.x + view.w + 200) / TILE); tx++) {
          if (tx < 0 || ty < 0 || tx * TILE >= 2930 || ty * TILE >= W.h) continue;
          const key = tx + ',' + ty; let T = tiles.get(key);
          if (!T && (made < 2 || frame < 3)) { T = makeTile(tx, ty); made++; }
          if (T) T.used = frame;
        }
      dropFar(q === 'high' ? 30 : 18);
      wind.value = t; seaM.userData.tick(t);
      village.update(state, t, E.follow);
      if (L.ground) try { paintDecal(t, L.ground); } catch (e) { if (!L._gErr) { L._gErr = 1; console.error('ground layer', e); } }
      renderer.render(scene, camera);
      return view;
    },
    get view() { return view; },
    /* من الشاشة إلى أرض اللعبة (للنقر) */
    pick: (sx, sy) => groundAt(sx, sy) || { x: target.x, y: target.z },
    /* من نقطة في اللعبة على ارتفاع h إلى الشاشة */
    project,
    /* تحويل الرسم ثنائي الأبعاد لعنصر قاعدته على الصف y: x خطي تماماً، والارتفاع بمقياس الصف */
    itemTransform(y) {
      const cx = target.x, p0 = project(cx, y), p1 = project(cx + 100, y), p2 = project(cx, y, 100);
      const k = (p1.x - p0.x) / 100, kv = (p0.y - p2.y) / 100;
      return [k, 0, 0, kv, p0.x - cx * k, p0.y - y * kv];
    },
    /* تحويل تقريبي لرسم مسطّح على الأرض (دقيق قرب مركز الشاشة) */
    groundTransform() {
      const cx = target.x, cy = target.z, p0 = project(cx, cy), px = project(cx + 100, cy), py = project(cx, cy + 100);
      const a = [(px.x - p0.x) / 100, (px.y - p0.y) / 100], b = [(py.x - p0.x) / 100, (py.y - p0.y) / 100];
      return [a[0], a[1], b[0], b[1], p0.x - a[0] * cx - b[0] * cy, p0.y - a[1] * cx - b[1] * cy];
    }
  };
  await step(1);
  return L;
}
