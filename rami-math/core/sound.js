// مؤثرات صوتية مولّدة بلا ملفات. كل مؤثر يُعلَن أيضاً على bus ليتحرك البطل معه (التقاط، وضع، احتفال)
import { bus } from './events.js';
let AC = null; export const sound = { on: true };
function tone(f, d, type, vol, when) {
  if (!sound.on) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime + (when || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol || .12, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d);
  } catch (e) {}
}
function glide(f1, f2, d, type, vol, when) {   // نغمة تنزلق بين ترددين (نورس، صفير)
  if (!sound.on || !AC) return;
  try {
    const t = AC.currentTime + (when || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + d * .2); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .05);
  } catch (e) {}
}
/* ── أصوات البيئة لكل منطقة: «فراش» من ضجيج مولّد (ريح/موج، وهمهمة ناس) تتبدل مستوياته بنعومة، وأحداث متفرقة.
   كل شيء مولّد بلا ملفات، ولا يبدأ إلا بعد أن يُنشأ AudioContext بلمسة من اللاعب (شرط المتصفحات) ── */
const AMB = {   // wind: [المستوى، تردد المرشح، دورة التموج بالثواني، عمق التموج]، murmur: مستوى همهمة الناس، ev: [الحدث، أقل فاصل، أكبر فاصل]
  village: { wind: [.02, 500, 9, .4], murmur: 0, ev: [['bird', 7, 15]] },
  market: { wind: [.006, 500, 9, .3], murmur: .045, ev: [['bird', 14, 24], ['coin', 8, 15], ['clack', 6, 12]] },
  harbor: { wind: [.05, 650, 7, .9], murmur: 0, ev: [['gull', 8, 16]] },
  fort: { wind: [.03, 900, 11, .55], murmur: .012, ev: [['bell', 24, 40], ['bird', 16, 26]] },
  festival: { wind: [.006, 500, 9, .3], murmur: .06, ev: [['drum', 5, 9], ['coin', 10, 18]] },
  coop: { wind: [.006, 500, 9, .3], murmur: .05, ev: [['coin', 7, 13], ['clack', 9, 16]] },
  caravan: { wind: [.05, 1100, 9, .6], murmur: 0, ev: [['camel', 9, 17]] },
  workshop: { wind: [.012, 600, 10, .35], murmur: .02, ev: [['hammer', 4, 8]] }
};
let bed = null;
function makeBed() {   // ضجيج بني متكرر يغذّي مرشحين: منخفض للريح والموج، وتمريري للهمهمة
  const n = AC.sampleRate * 3, buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0); let last = 0;
  for (let i = 0; i < n; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = .9;
  const gw = AC.createGain(), gm = AC.createGain(); gw.gain.value = 0; gm.gain.value = 0;
  src.connect(lp); lp.connect(gw); gw.connect(AC.destination); src.connect(bp); bp.connect(gm); gm.connect(AC.destination); src.start();
  return { lp, bp, gw, gm, t: 0, next: {} };
}
export function ambience(area, dt) {
  if (!AC) return;   // لم يلمس اللاعب الشاشة بعد
  try {
    bed = bed || makeBed(); bed.t += dt;
    const P = AMB[area] || AMB.village, on = sound.on && !document.hidden, now = AC.currentTime, [wl, wf, wp, wd] = P.wind;
    const swell = 1 - wd * (.5 + .5 * Math.cos(bed.t * 2 * Math.PI / wp));   // الموج يعلو ويهبط، والريح تهب وتسكن
    const mur = P.murmur * (.8 + .2 * Math.sin(bed.t * 1.3) * Math.sin(bed.t * .37));
    bed.gw.gain.setTargetAtTime(on ? wl * swell : 0, now, .4); bed.lp.frequency.setTargetAtTime(wf * (.75 + .5 * swell), now, .6);
    bed.gm.gain.setTargetAtTime(on ? mur : 0, now, .8);
    if (!on) return;
    P.ev.forEach(([k, a, b]) => {   // أحداث متفرقة لكل منطقة بفواصل عشوائية
      const key = area + k; if (bed.next[key] === undefined) bed.next[key] = bed.t + a * Math.random();
      if (bed.t >= bed.next[key]) { bed.next[key] = bed.t + a + Math.random() * (b - a); event(k); }
    });
  } catch (e) {}
}
function event(k) {
  if (k === 'bird') sfx('bird');
  if (k === 'gull') { glide(1400, 900, .35, 'sine', .03); glide(1500, 950, .3, 'sine', .025, .42); }
  if (k === 'bell') { tone(660, 2.2, 'sine', .035); tone(1320, 1.4, 'sine', .015); tone(990, 1.8, 'sine', .012); }
  if (k === 'coin') { tone(2100, .08, 'sine', .018); tone(2700, .12, 'sine', .014, .06); }
  if (k === 'clack') { tone(520, .05, 'square', .012); tone(380, .06, 'square', .01, .09); }
  if (k === 'drum') [0, .32, .48].forEach((w, i) => { tone(i ? 110 : 80, .22, 'triangle', .07, w); });
  if (k === 'camel') [0, .18, .36, .7, .88].forEach(w => tone(1650 + Math.random() * 200, .12, 'triangle', .016, w));
  if (k === 'hammer') [0, .28, .56].forEach(w => { tone(1900, .03, 'square', .012, w); tone(240, .08, 'triangle', .04, w); });
}
/* تغريد خافت (بقي للتوافق؛ الأصوات الآن عبر ambience) */
export function ambient() { if (AC && sound.on) sfx('bird'); }
export function sfx(k) {
  bus.emit('sfx', k);
  if (k === 'pick') tone(520, .07, 'triangle', .1);
  if (k === 'drop') tone(330, .09, 'triangle', .12);
  if (k === 'cough') { tone(90, .25, 'sawtooth', .07); tone(70, .3, 'sawtooth', .06, .25); }
  if (k === 'engine') { tone(110, .6, 'sawtooth', .05); tone(150, .6, 'sawtooth', .04, .3); }
  if (k === 'win') [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', .11, i * .12));
  if (k === 'good') { tone(880, .15, 'sine', .1); tone(1320, .2, 'sine', .08, .1); }
  if (k === 'talk') tone(700, .05, 'square', .04);
  if (k === 'plant') [392, 523, 659].forEach((f, i) => tone(f, .2, 'sine', .09, i * .1));
  if (k === 'gate') { tone(140, .5, 'sawtooth', .04); tone(180, .4, 'sawtooth', .03, .25); tone(70, .35, 'triangle', .14, .8); }   // صرير خشب ثم ارتطام
  if (k === 'region') [587, 784, 988].forEach((f, i) => tone(f, .5, 'sine', .06, i * .16));   // نغمة دخول منطقة
  if (k === 'newRegion') [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .45, 'triangle', .08, i * .13));   // أول زيارة
  if (k === 'bird') { const b = 2200 + Math.random() * 900; [0, .09, .2].forEach((w, i) => tone(b + i * 160, .07, 'sine', .022, w)); }   // تغريد خافت في الخلفية
}
