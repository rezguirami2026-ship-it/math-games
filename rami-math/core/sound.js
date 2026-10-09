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
  musicTick(area);
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
/* رعد: ضجيج منخفض يتدحرج (للعاصفة في المغامرات) */
export function thunder() {
  if (!sound.on) return;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const n = AC.sampleRate * 2.2, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); let l = 0;
    for (let i = 0; i < n; i++) { l = (l + .03 * (Math.random() * 2 - 1)) / 1.03; d[i] = l * 6 * Math.min(1, i / 2000) * Math.pow(1 - i / n, 1.6); }
    const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = 'lowpass'; f.frequency.value = 260; g.gain.value = .5; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(AC.currentTime + .25); } catch (e) {}
}
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

/* ── الموسيقى الخلفية: ألحان شرقية هادئة مولّدة (مقام الحجاز ومقام الراست)، عود مقطوف وطبلة خفيفة، لكل منطقة طابعها.
   مستوى منخفض جداً، وزر إيقاف منفصل عن المؤثرات (يُحفظ على الجهاز: ramimath_music) ── */
export const music = { on: (() => { try { return localStorage.getItem('ramimath_music') !== 'off'; } catch (e) { return true; } })() };
export function setMusic(v) { music.on = v; try { localStorage.setItem('ramimath_music', v ? 'on' : 'off'); } catch (e) {} }
const SCALES = { hijaz: [0, 1, 4, 5, 7, 8, 10, 12], rast: [0, 2, 3.5, 5, 7, 9, 10.5, 12], nahawand: [0, 2, 3, 5, 7, 8, 11, 12] };
const MUS = {   // [المقام، الأساس (هرتز)، الإيقاع (نبضة/دقيقة)، طبلة؟]
  village: ['rast', 196, 84, false], market: ['hijaz', 220, 104, true], harbor: ['nahawand', 174.6, 76, false], fort: ['hijaz', 146.8, 88, true],
  festival: ['rast', 220, 112, true], coop: ['nahawand', 196, 92, true], caravan: ['hijaz', 164.8, 80, true], workshop: ['rast', 174.6, 96, false]
};
let M = null;
function phrase(seed) { let a = seed, x = 3; const r = () => (a = (a * 9301 + 49297) % 233280) / 233280; return Array.from({ length: 16 }, (_, i) => { if (i % 4 === 3 && r() < .4) return null; x = Math.max(0, Math.min(7, x + Math.round((r() - .5) * 3))); return x; }); }
function pluck(f, t, vol, dur) {
  const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter();
  o.type = 'triangle'; o2.type = 'sine'; o.frequency.setValueAtTime(f, t); o2.frequency.setValueAtTime(f * 2, t); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2200, t); lp.frequency.exponentialRampToValueAtTime(500, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(M.out); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
}
function drum(t, low) { const o = AC.createOscillator(), g = AC.createGain(); o.type = low ? 'sine' : 'triangle'; o.frequency.setValueAtTime(low ? 120 : 420, t); o.frequency.exponentialRampToValueAtTime(low ? 55 : 260, t + .12);
  g.gain.setValueAtTime(low ? .5 : .22, t); g.gain.exponentialRampToValueAtTime(.0001, t + (low ? .25 : .08)); o.connect(g); g.connect(M.out); o.start(t); o.stop(t + .3); }
export function musicTick(area) {
  if (!AC) return;
  try {
    if (!M) { M = { out: AC.createGain(), next: 0, step: 0, area: null, mel: null }; M.out.gain.value = 0; M.out.connect(AC.destination); }
    const on = sound.on && music.on && !document.hidden, now = AC.currentTime;
    M.out.gain.setTargetAtTime(on ? .085 : 0, now, .8);
    if (!on) { M.next = 0; return; }
    const [sc, root, bpm, drums] = MUS[area] || MUS.village;
    if (M.area !== area) { M.area = area; M.mel = phrase(area.length * 97 + bpm); M.step = 0; }
    const beat = 60 / bpm / 2; if (M.next < now) M.next = now + .1;
    while (M.next < now + .35) {   // جدولة استباقية خفيفة
      const s = M.step % 32, deg = M.mel[s % 16], oct = s >= 16 && s % 4 === 0 ? 2 : 1;
      if (deg != null) pluck(root * Math.pow(2, SCALES[sc][deg] / 12) * oct, M.next, .16, beat * 2.6);
      if (s % 8 === 0) pluck(root / 2, M.next, .14, beat * 7);   // نغمة قرار
      if (drums) { if (s % 8 === 0 || s % 8 === 3) drum(M.next, true); if (s % 8 === 6 || s % 4 === 2) drum(M.next, false); }
      M.next += beat; M.step++;
    }
  } catch (e) {}
}

/* ── أصوات الاحتفال الكبير: قرع طبول متصاعد، رنين الأوسمة (يعلو مع كل وسام)، نفير احتفالي، هتاف وألعاب نارية ── */
function noise(d, f, vol, when, type = 'bandpass', q = .8) {
  if (!sound.on) return;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const n = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, n, AC.sampleRate), x = b.getChannelData(0);
    for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.5);
    const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = vol;
    s.connect(fl); fl.connect(g); g.connect(AC.destination); s.start(AC.currentTime + (when || 0)); } catch (e) {}
}
export function cheer(k, i = 0) {
  if (k === 'roll') for (let j = 0; j < 22; j++) tone(95 + j * 2, .09, 'triangle', .05 + j * .004, j * .07);
  if (k === 'medal') { const f = 660 * Math.pow(2, (i % 9) / 12); tone(f, .9, 'sine', .07); tone(f * 2, .6, 'sine', .03, .02); tone(f * 3, .35, 'sine', .015, .03); }
  if (k === 'fanfare') { [[523, 0, .18], [523, .18, .12], [523, .3, .12], [698, .42, .5], [659, .95, .18], [698, 1.13, .18], [784, 1.31, .9]].forEach(([f, w, d]) => { tone(f, d + .1, 'sawtooth', .035, w); tone(f, d + .15, 'triangle', .07, w); tone(f / 2, d + .2, 'triangle', .05, w); });
    [0, .42, 1.31].forEach(w => tone(65, .4, 'sine', .25, w)); }
  if (k === 'crowd') { noise(2.2, 900, .22, 0, 'bandpass', .6); noise(1.8, 1500, .12, .3, 'bandpass', .9); [0, .25, .5, .8, 1.1].forEach(w => noise(.08, 2500, .25, w + Math.random() * .1, 'highpass')); }
  if (k === 'boom') { tone(80 + Math.random() * 30, .5, 'sine', .22); noise(.6, 3000, .08, .05, 'highpass'); for (let j = 0; j < 6; j++) noise(.03, 4000, .06, .15 + Math.random() * .5, 'highpass'); }
  if (k === 'sparkle') [0, .07, .14, .21].forEach((w, j) => tone(1800 + j * 260, .18, 'sine', .03, w));
}
/* ── موسيقى المغامرات: لحن لكل مغامرة على الطريقة نفسها (تُستدعى من حلقة المغامرة) ── */
Object.assign(MUS, {
  rescue: ['hijaz', 164.8, 96, true], storm: ['nahawand', 146.8, 104, true], island: ['rast', 196, 88, false], oldcity: ['hijaz', 146.8, 76, false],
  lanterns: ['rast', 220, 108, true], lighthouse: ['nahawand', 174.6, 72, false], desert: ['hijaz', 164.8, 84, true], mountain: ['rast', 174.6, 80, false],
  castle: ['nahawand', 130.8, 70, true], castle_win: ['rast', 220, 112, true]
});
export function advMusic(id) { if (!AC) return; musicTick(id); }
