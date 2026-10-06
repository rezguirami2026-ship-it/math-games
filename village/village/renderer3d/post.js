// المعالجة اللاحقة (الجودة العالية فقط): توهج ناعم للأضواء والسماء، ثم تدرّج لوني سينمائي خفيف
// (تباين، تشبّع، ظلال باردة قليلاً وأضواء دافئة) وتعتيم أطراف لطيف يركّز النظر على البطل.
import * as THREE from '../lib/three/three.module.min.js';
import { EffectComposer } from '../lib/three/addons/EffectComposer.js';
import { RenderPass } from '../lib/three/addons/RenderPass.js';
import { UnrealBloomPass } from '../lib/three/addons/UnrealBloomPass.js';
import { ShaderPass } from '../lib/three/addons/ShaderPass.js';
import { OutputPass } from '../lib/three/addons/OutputPass.js';

const Grade = {
  uniforms: { tDiffuse: { value: null }, contrast: { value: 1.08 }, saturation: { value: 1.14 }, warm: { value: new THREE.Vector3(1.04, 1.0, .93) }, cool: { value: new THREE.Vector3(.94, .98, 1.06) }, vig: { value: .28 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float contrast, saturation, vig; uniform vec3 warm, cool; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(l), col, saturation);                         // تشبّع
      col = (col - 0.5) * contrast + 0.5;                          // تباين
      col *= mix(cool, warm, smoothstep(0.15, 0.75, l));          // ظلال باردة وأضواء دافئة
      vec2 d = vUv - vec2(0.5, 0.48); col *= 1.0 - vig * smoothstep(0.35, 0.85, length(d * vec2(1.1, 1.0)));   // تعتيم الأطراف
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);
    }`
};

export function makeComposer(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
  const comp = new EffectComposer(renderer, rt);
  comp.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 4, size.y / 4), .22, .55, .9); comp.addPass(bloom);
  comp.addPass(new OutputPass());
  comp.addPass(new ShaderPass(Grade));
  return { rt, render: () => comp.render(), setSize: (w, h) => { comp.setSize(w, h); bloom.resolution.set(w / 4, h / 4); }, setPixelRatio: r => comp.setPixelRatio(r) };
}
