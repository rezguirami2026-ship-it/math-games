// مؤثرات صوتية مولّدة بلا ملفات
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
export function sfx(k) {
  if (k === 'pick') tone(520, .07, 'triangle', .1);
  if (k === 'drop') tone(330, .09, 'triangle', .12);
  if (k === 'cough') { tone(90, .25, 'sawtooth', .07); tone(70, .3, 'sawtooth', .06, .25); }
  if (k === 'engine') { tone(110, .6, 'sawtooth', .05); tone(150, .6, 'sawtooth', .04, .3); }
  if (k === 'win') [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', .11, i * .12));
  if (k === 'good') { tone(880, .15, 'sine', .1); tone(1320, .2, 'sine', .08, .1); }
  if (k === 'talk') tone(700, .05, 'square', .04);
  if (k === 'plant') [392, 523, 659].forEach((f, i) => tone(f, .2, 'sine', .09, i * .1));
}
