// معاينة البطل المجسّم في شاشات البداية واختيار الشخصية: إضاءة ناعمة، قاعدة دائرية، ودوران بطيء وتلويح بين حين وآخر.
import * as THREE from '../lib/three/three.module.min.js';
import { buildPerson, animatePerson } from './people.js';

const live = new Set();
export function stopPreviews() { live.forEach(p => p.dispose()); live.clear(); }

/* canvas: عنصر الرسم الموجود، look(): مظهر البطل الحالي (قد يتغير باختيار اللون أو النوع) */
export function previewHero(canvas, look) {
  const W = canvas.width, H = canvas.height;
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setSize(W, H, false);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight('#FFF4DC', '#B0784A', 1.5));
  const key = new THREE.DirectionalLight('#FFE6BE', 2.4); key.position.set(-40, 90, 70); key.castShadow = true; key.shadow.mapSize.set(512, 512);
  Object.assign(key.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50 }); sc.add(key);
  const rimL = new THREE.DirectionalLight('#9FD6FF', 1.4); rimL.position.set(60, 50, -60); sc.add(rimL);   // إضاءة خلفية زرقاء تفصل الشخصية
  const base = new THREE.Mesh(new THREE.CylinderGeometry(26, 28, 4, 40), new THREE.MeshStandardMaterial({ color: '#F2E3C0', roughness: .7 })); base.position.y = -2; base.receiveShadow = true; sc.add(base);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(27, 1.2, 8, 48), new THREE.MeshStandardMaterial({ color: '#E3B04B', metalness: .8, roughness: .3 })); ring.rotation.x = Math.PI / 2; sc.add(ring);
  const cam = new THREE.PerspectiveCamera(26, W / H, 1, 1000); cam.position.set(0, 44, 140); cam.lookAt(0, 33, 0);
  let P = null, lk = '', t = 0, last = performance.now(), raf = 0, waveT = 2 + Math.random() * 2;
  const loop = now => {
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    const L = look(), k = JSON.stringify(L);
    if (k !== lk) { if (P) sc.remove(P.root); P = buildPerson(L); P.lockDir = true; sc.add(P.root); lk = k; }
    waveT -= dt; const waving = waveT < 0 && waveT > -1.6; if (waveT < -1.6) waveT = 4 + Math.random() * 3;
    P.lastX = null; animatePerson(P, { x: 0, y: 0, moving: false, dir: 'down', anim: waving ? 'wave' : null, animT: waving ? (-waveT / 1.6) : 0 }, dt, t);
    P.yaw = Math.sin(t * .5) * .35; P.root.rotation.y = P.yaw;
    r.render(sc, cam); raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  const ctl = { dispose() { cancelAnimationFrame(raf); r.dispose(); r.forceContextLoss && r.forceContextLoss(); } };
  live.add(ctl); return ctl;
}
