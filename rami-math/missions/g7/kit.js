// الصف السابع: محطة بجولات من بيانات (المناطق من الميناء فما بعد). كل جولة تُحفظ أعدادها وجوابها في بيانات المهمة،
// ونصها ورسمها من view(r, d) في ملف الدرس، فيبقى لكل درس عالمه وفكرته ويتشارك الدرس آلية العرض والتحقق.
// أنواع الجولات: kp (لوحة أرقام)، pick (بطاقات خيار)، multi (اختر كل ما يصح)، order (رتّب بالنقر)، dial (مؤشر بخطوات ±).
// الخطأ: رسالة من bad(الجواب) إن وُجدت وإلا hint، ولا يظهر الجواب. الاختبار الآلي يحل أي جولة من بياناتها (tests/play.mjs solve7).
import { ar } from '../../core/util.js';
import { sfx } from '../../core/sound.js';
import { changed, panel, sheetOpen, msgBox, btn, numPad, setMsg, dec } from '../bench.js';
import { step, at, advance, out, H } from '../g5/common.js';
import { prop } from './village.js';
import { fixCounts } from '../../content/arabicCount.js';

const sgn = v => (v > 0 ? '+' : '−') + dec(Math.abs(v));
export function mission(o) {
  const n = o.n || 3;
  return Object.assign({
    id: o.id, giver: o.giver, intro: o.intro,
    begin(d) { d.rounds = o.make(); d.r = 0; d.k = null; d.sel = []; },
    goal: d => `${o.goal} ${step(d, n)}`,
    open(W, d, msg, kind) {
      const r = d.rounds[Math.min(d.r, n - 1)], L = [{ who: o.giver, text: o.end }];
      if (r.t === 'dial' && (d.k == null || d.kr !== d.r)) { d.k = H(r.s); d.kr = d.r; }
      if (r.t !== 'multi' && r.t !== 'order' || d.selr !== d.r) { d.sel = []; d.selr = d.r; }
      const v = o.view(r, d), head = `<h3>${o.label}</h3>${msgBox((msg ? msg + ' ' : '') + v.text, kind)}${v.visual || ''}`;
      const win = () => { d.k = null; d.sel = []; return advance(this, W, d, n, o.id, L); };
      const fail = given => { sfx('cough'); return (v.bad && v.bad(given)) || v.hint; };
      if (r.t === 'kp') {
        sheetOpen(`${head}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
        const pad = numPad(panel().querySelector('#pad'), v.label || '✓ الجواب', async x => {
          if (H(x) === H(r.ans)) return win();
          const m = fail(x); pad.clear(); setMsg(`${m} ${v.text}`, 'bad');
        }, { dot: r.dot !== false, neg: !!r.neg });
        return out();
      }
      if (r.t === 'pick') {
        sheetOpen(`${head}<div class="g5cards${r.col ? ' col' : ''}">${r.opts.map((s, i) => `<button class="g5card${v.cls ? ' ' + v.cls : ''}" data-o="${i}">${v.face ? v.face(s) : s}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
        panel().querySelectorAll('[data-o]').forEach(b => b.onclick = e => { e.stopPropagation(); const s = r.opts[+b.dataset.o]; if (s === r.ans) return win(); this.open(W, d, fail(s), 'bad'); });
        return out();
      }
      if (r.t === 'multi' || r.t === 'order') {
        const ord = r.t === 'order', list = ord ? r.items : r.opts;
        sheetOpen(`${head}${ord ? `<div class="g7seq">${d.sel.map((i, k) => `<span>${ar(k + 1)}. ${list[i]}</span>`).join('') || '<small>انقر البطاقات بالترتيب</small>'}</div>` : ''}
          <div class="g5cards">${list.map((s, i) => `<button class="g5card${d.sel.includes(i) ? ' on' : ''}" data-q="${i}"${ord && d.sel.includes(i) ? ' disabled' : ''}>${s}</button>`).join('')}</div>
          <div class="row2"><button class="act ghost" id="benchOut">رجوع</button>${ord ? '<button class="act ghost" id="kReset">↺ من جديد</button>' : ''}<button class="act go" id="benchGo">✓ تحقق</button></div>`);
        panel().querySelectorAll('[data-q]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.q; sfx('click'); d.sel = d.sel.includes(i) ? d.sel.filter(x => x !== i) : [...d.sel, i]; this.open(W, d, msg, kind); });
        if (ord) btn('kReset', () => { d.sel = []; this.open(W, d); });
        out();
        return btn('benchGo', async () => {
          const got = d.sel.map(i => list[i]);
          const ok = ord ? got.length === r.want.length && got.every((s, i) => s === r.want[i]) : got.length === r.ok.length && got.every(s => r.ok.includes(s));
          if (ok) return win();
          const m = fail(got); d.sel = []; this.open(W, d, m, 'bad');
        });
      }
      /* dial: القيمة بأجزاء من ألف حتى لا تتراكم أخطاء الكسور العشرية */
      sheetOpen(`${head}<div class="g7ctr">${r.st.map(s => `<button class="g5card sm" data-dv="${-s}">${sgn(-s)}</button>`).join('')}<b class="g7dial">${(v.show || dec)(d.k / 1000)}${v.unit ? ' ' + v.unit : ''}</b>${r.st.slice().reverse().map(s => `<button class="g5card sm" data-dv="${s}">${sgn(s)}</button>`).join('')}</div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">${v.label || '✓ ثبّت'}</button></div>`);
      panel().querySelectorAll('[data-dv]').forEach(b => b.onclick = e => { e.stopPropagation(); d.k = Math.max(H(r.lo), Math.min(H(r.hi), d.k + H(+b.dataset.dv))); sfx('click'); changed(); this.open(W, d, msg, kind); });
      out();
      btn('benchGo', async () => { if (d.k === H(r.ans)) return win(); this.open(W, d, fail(d.k / 1000), 'bad'); });
    }
  }, at(o.st, o.key, o.label, prop(o.icon, o.label, o.bg, o.side || -1)));
}
/* أدوات للمولّدات */
export const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const shuf = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
/* خيارات: الصحيح مع مشتتات مختلفة عنه (بلا تكرار) */
export const opts = (right, wrong, k = 4) => shuf([right, ...[...new Set(wrong.filter(s => s !== right))].slice(0, k - 1)]);
export const rd = (v, p = 2) => Math.round(v * 10 ** p) / 10 ** p;
/* عدد ومعدوده بقواعد العربية (٢ لترين، ٥ لترات، ١٢ لتراً) — المعدودات في content/arabicCount.js */
export const cn = (n, w) => fixCounts(`<b>${ar(n)}</b> ${w}`);
