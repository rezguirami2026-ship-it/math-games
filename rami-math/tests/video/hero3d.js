// بطل مجسّم للفيديو: نفس مجسّمات اللعبة (people.js) على canvas خاص، يُرسم مع كل لقطة بزمن الفيديو (لا حلقة خاصة).
// bust: الرأس والكتفان يملآن الإطار الدائري للمتكلم؛ وإلا الجسم كاملاً لبطاقة العنوان.
import * as THREE from '/lib/three/three.module.min.js';
import { buildPerson, animatePerson } from '/renderer3d/people.js';

export function hero3d(canvas, look, { bust = false } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(canvas.width, canvas.height, false);
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight('#FFF4DC', '#B0784A', 1.6));
  const key = new THREE.DirectionalLight('#FFE6BE', 2.5); key.position.set(-40, 90, 80); sc.add(key);
  const rim = new THREE.DirectionalLight('#9FD6FF', 1.6); rim.position.set(60, 50, -60); sc.add(rim);
  const cam = new THREE.PerspectiveCamera(bust ? 22 : 24, canvas.width / canvas.height, 1, 1000);
  const P = buildPerson(look); P.lockDir = true; sc.add(P.root);
  // التأطير من حجم المجسّم الفعلي: الرأس قرب أعلى الصندوق
  const box = new THREE.Box3().setFromObject(P.root), top = box.max.y, h = top - box.min.y;
  if (bust) { const cy = top - h * .2; cam.position.set(0, cy + 2, h * .95); cam.lookAt(0, cy - 1, 0); }
  else { const cy = box.min.y + h * .5; cam.position.set(0, cy + h * .06, h * 3.15); cam.lookAt(0, cy, 0); }
  let last = null;
  return {
    render(t, anim = null) {
      const dt = last == null ? 1 / 30 : Math.max(0, Math.min(.05, t - last)); last = t;
      P.lastX = null; animatePerson(P, { x: 0, y: 0, moving: false, dir: 'down', anim, animT: (t * .9) % 1 }, dt, t);
      P.yaw = Math.sin(t * .6) * (bust ? .12 : .28); P.root.rotation.y = P.yaw;
      r.render(sc, cam);
    }
  };
}
