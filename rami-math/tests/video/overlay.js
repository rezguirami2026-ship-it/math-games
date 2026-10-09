// طبقة الفيديو فوق اللعبة: ترجمة الكلام مع صورة المتكلم (البطل/البطلة) وهو يتحدث، شارة القسم، بطاقة العنوان، والانتقال بالإظلام.
// تُحقن بعد تحميل الصفحة؛ __vo.frame(t) يُستدعى مع كل لقطة بزمن المشهد.
(() => {
  const css = `
  body.vid .toast,body.vid .region,body.vid .ver3d,body.vid .advToast{display:none!important}
  #voCap{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(20px);width:min(980px,90vw);display:flex;align-items:center;gap:18px;direction:rtl;z-index:9998;
    padding:14px 22px 14px 26px;border-radius:26px;background:linear-gradient(135deg,rgba(24,18,64,.92),rgba(20,60,96,.9));border:2.5px solid #E3B04B;box-shadow:0 14px 40px rgba(0,0,0,.45);opacity:0;transition:opacity .25s,transform .3s}
  #voCap.on{opacity:1;transform:translateX(-50%)}
  #voPic{flex:none;width:112px;height:112px;border-radius:50%;background:radial-gradient(circle at 50% 35%,#FFF6DA,#F2D79A);border:4px solid #E3B04B;box-shadow:0 0 0 4px rgba(255,255,255,.18)}
  #voCap .who{display:inline-block;font:900 20px Cairo,sans-serif;color:#3A2400;background:linear-gradient(180deg,#FFF1B8,#FFD54A);border-radius:14px;padding:1px 14px;margin-bottom:4px}
  #voCap.g .who{background:linear-gradient(180deg,#FFD6E4,#FF8FB3);color:#4A0F28}
  #voCap p{margin:0;font:800 29px/1.55 Cairo,sans-serif;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35)}
  body.noHud #hud,body.noHud .ver3d{display:none!important}
  body.vid .adv .advTop,body.vid .adv .advAct,body.vid .adv .advInv,body.vid .adv .advLog,body.vid .gSkip{display:none!important}
  body:has(.grand) #voLbl{display:none!important}
  #voCap.top{top:22px;bottom:auto}
  #voLbl.low{top:auto;bottom:26px}
  #voLbl{position:fixed;top:24px;right:28px;z-index:9998;direction:rtl;font:900 26px Cairo,sans-serif;color:#3A2400;padding:8px 24px;border-radius:30px;
    background:linear-gradient(180deg,#FFF1B8,#FFD54A 55%,#E3A21A);box-shadow:0 5px 0 #8A5A00,0 10px 26px rgba(0,0,0,.35);opacity:0;transform:translateX(30px);transition:all .4s cubic-bezier(.3,1.5,.5,1)}
  #voLbl.on{opacity:1;transform:none}
  #voFade{position:fixed;inset:0;background:#05030F;z-index:9999;pointer-events:none;opacity:0}
  #voTitle{position:fixed;inset:0;z-index:9997;display:none;place-items:center;direction:rtl;background:radial-gradient(ellipse at 50% 40%,rgba(30,22,80,.55),rgba(5,3,15,.85))}
  #voTitle.on{display:grid}
  #voTitle .tIn{text-align:center;transform:translateY(-70px)}
  #voTitle h1{margin:0;font:900 128px/1.1 Cairo,sans-serif;background:linear-gradient(180deg,#FFFFFF,#FFE88A 45%,#E3A21A);-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(0 6px 0 rgba(120,70,0,.6)) drop-shadow(0 0 30px rgba(255,200,60,.5));animation:tPop 1s cubic-bezier(.3,1.6,.5,1) both}
  #voTitle .rib{display:inline-block;margin-top:8px;font:900 34px Cairo,sans-serif;color:#fff;padding:6px 34px;border-radius:40px;background:linear-gradient(90deg,#1F6E73,#1F4E79);border:3px solid #E3B04B;animation:tPop 1s .3s cubic-bezier(.3,1.6,.5,1) both}
  #voTitle .sub{margin-top:14px;font:800 24px Cairo,sans-serif;color:#FFE3A0;animation:tPop 1s .6s both}
  #voTitle canvas{position:absolute;bottom:150px;width:250px;height:300px}
  #voTitle .hb{right:15%}#voTitle .hg{left:15%}
  #voTitle .cta{margin-top:26px;display:inline-block;font:900 34px Cairo,sans-serif;color:#3A2400;padding:12px 44px;border-radius:40px;background:linear-gradient(180deg,#FFF1B8,#FFD54A 55%,#E3A21A);box-shadow:0 7px 0 #8A5A00;animation:tPop .8s both,ctaB 1.4s 1s ease-in-out infinite}
  @keyframes tPop{from{opacity:0;transform:scale(.6)}}
  @keyframes ctaB{50%{transform:scale(1.06)}}
  #voChip{position:fixed;top:96px;right:28px;z-index:9998;direction:rtl;font:900 30px Cairo,sans-serif;color:#fff;padding:8px 22px;border-radius:18px;background:rgba(10,8,34,.78);border:2px solid #E3B04B;opacity:0;transition:opacity .3s}
  #voChip.on{opacity:1}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  document.body.classList.add('vid');
  const el = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); const n = d.firstChild; document.body.appendChild(n); return n; };
  const cap = el('<div id="voCap"><canvas id="voPic" width="224" height="224"></canvas><div><span class="who"></span><p></p></div></div>');
  const lbl = el('<div id="voLbl"></div>'), fade = el('<div id="voFade"></div>'), chip = el('<div id="voChip"></div>');
  const title = el('<div id="voTitle"><div class="tIn"><h1>قرية الخير</h1><div class="rib">مغامرة رامي ماث</div><div class="sub"></div><div class="ctaW"></div></div><canvas class="hb" width="500" height="600"></canvas><canvas class="hg" width="500" height="600"></canvas></div>');
  let drawHuman = null, heroLook = null;
  Promise.all([import('/character/human.js'), import('/ui/screens.js')]).then(([h, s]) => { drawHuman = h.drawHuman; heroLook = s.heroLook; });
  const LOOK = () => ({ b: heroLook({ kind: 'boy', skin: '#C98E5F', color: '#2F6FB2' }), g: heroLook({ kind: 'girl', skin: '#D9A374', color: '#2E8B57' }) });
  let S = { lines: [], label: '', dur: 0, title: null, dips: [], chips: [] }, curKey = '';
  const V = window.__vo = {
    scene(s) { S = Object.assign({ lines: [], label: '', dur: 0, title: null, dips: [], chips: [], hud: true, capTop: false }, s); curKey = ''; document.body.classList.toggle('noHud', S.hud === false); lbl.classList.toggle('low', !!S.capTop); lbl.textContent = S.label; lbl.classList.remove('on'); cap.classList.remove('on');
      title.classList.toggle('on', !!S.title); if (S.title) { title.querySelector('.sub').textContent = S.title.sub || ''; title.querySelector('.ctaW').innerHTML = S.title.cta ? `<span class="cta">${S.title.cta}</span>` : ''; } },
    frame(t) {
      // الإظلام: أول المشهد وآخره، وعند كل قطع داخلي
      let f = 0; if (t < .35) f = 1 - t / .35; if (S.dur - t < .35) f = Math.max(f, 1 - (S.dur - t) / .35);
      S.dips.forEach(d => { const k = Math.abs(t - d); if (k < .3) f = Math.max(f, 1 - k / .3); }); fade.style.opacity = Math.max(0, Math.min(1, f));
      lbl.classList.toggle('on', !!S.label && t > .4 && S.dur - t > .3);
      const ch = S.chips.find(c => t >= c.from && t < c.to); chip.textContent = ch ? ch.text : ''; chip.classList.toggle('on', !!ch);
      const ln = S.lines.find(l => t >= l.start - .05 && t < l.start + l.dur + .35);
      if (ln) { const key = ln.start + ln.who; if (key !== curKey) { curKey = key; cap.className = ln.who + (S.capTop ? ' top' : ''); cap.querySelector('.who').textContent = ln.who === 'b' ? 'البطل' : 'البطلة'; cap.querySelector('p').textContent = ln.text; void cap.offsetWidth; } cap.classList.add('on'); }
      else cap.classList.remove('on');
      if (!drawHuman) return;
      const L = LOOK(), speaking = ln && t < ln.start + ln.dur ? ln.who : null;
      const pc = cap.querySelector('canvas'), x = pc.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 224, 224);
      if (ln) { x.save(); x.beginPath(); x.arc(112, 112, 112, 0, 7); x.clip(); drawHuman(x, Object.assign({}, L[ln.who], { x: 112, y: 505, s: 9.5, dir: 'down', anim: speaking ? 'talk' : 'idle', animT: (t * 1.6) % 1 })); x.restore(); }
      if (S.title) [['hb', 'b'], ['hg', 'g']].forEach(([c, w]) => { const cv = title.querySelector('.' + c), y = cv.getContext('2d'); y.setTransform(1, 0, 0, 1, 0, 0); y.clearRect(0, 0, 500, 600);
        y.fillStyle = 'rgba(255,214,90,.25)'; y.beginPath(); y.ellipse(250, 572, 150, 24, 0, 0, 7); y.fill();
        drawHuman(y, Object.assign({}, L[w], { x: 250, y: 570, s: 6.2, dir: 'down', anim: speaking === w ? 'talk' : (S.title.cheer ? 'celebrate' : 'wave'), animT: (t * (speaking === w ? 1.6 : .8) + (w === 'g' ? .5 : 0)) % 1 })); });
    }
  };
})();
