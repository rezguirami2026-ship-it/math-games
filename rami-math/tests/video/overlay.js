// طبقة الفيديو فوق اللعبة: ترجمة الكلام مع صورة المتكلم (البطل/البطلة) وهو يتحدث، شارة القسم، بطاقة العنوان، والانتقال بالإظلام.
// تُحقن بعد تحميل الصفحة؛ __vo.frame(t) يُستدعى مع كل لقطة بزمن المشهد.
(() => {
  const css = `
  body.vid .toast,body.vid .region,body.vid .ver3d,body.vid .advToast{display:none!important}
  #voCap{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(20px);width:min(980px,90vw);display:flex;align-items:center;gap:18px;direction:rtl;z-index:9998;
    padding:14px 22px 14px 26px;border-radius:26px;background:linear-gradient(135deg,rgba(24,18,64,.92),rgba(20,60,96,.9));border:2.5px solid #E3B04B;box-shadow:0 14px 40px rgba(0,0,0,.45);opacity:0;transition:opacity .25s,transform .3s}
  #voCap.on{opacity:1;transform:translateX(-50%)}
  #voPic{flex:none;position:relative;width:118px;height:118px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 30%,#FFF6DA,#F2D79A 60%,#E2B862);border:4px solid #E3B04B;box-shadow:0 0 0 4px rgba(255,255,255,.18),inset 0 -8px 16px rgba(120,70,0,.25)}
  #voPic canvas{position:absolute;inset:0;width:100%;height:100%}
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
  #voFade{position:fixed;inset:0;background:#05030F;z-index:10001;pointer-events:none;opacity:0}
  #voWipe{position:fixed;top:-12%;left:-20%;width:140%;height:124%;z-index:10000;pointer-events:none;visibility:hidden;display:grid;place-items:center;
    background:linear-gradient(90deg,#FFE88A 0,#E3B04B 1.6%,#8A5A00 2.2%,transparent 2.2%,transparent 97.8%,#8A5A00 97.8%,#E3B04B 98.4%,#FFE88A 100%),
      repeating-linear-gradient(45deg,transparent 0 30px,rgba(227,176,75,.13) 30px 32px),repeating-linear-gradient(-45deg,transparent 0 30px,rgba(227,176,75,.13) 30px 32px),
      radial-gradient(ellipse at 50% 50%,#1D5A8E 0%,#0B2A4A 55%,#051528 100%);box-shadow:0 0 60px rgba(0,0,0,.6)}
  #voWipe .wIn{transform:skewX(12deg);text-align:center;direction:rtl}
  #voWipe .wStar{font-size:44px;color:#FFD54A;filter:drop-shadow(0 0 14px rgba(255,213,74,.8))}
  #voWipe b{display:block;font:900 72px/1.2 Cairo,sans-serif;background:linear-gradient(180deg,#FFF6D0,#FFD54A 55%,#C98A12);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 rgba(0,0,0,.4))}
  #voTitle{position:fixed;inset:0;z-index:9997;display:none;place-items:center;direction:rtl;background:radial-gradient(ellipse at 50% 40%,rgba(30,22,80,.55),rgba(5,3,15,.85))}
  #voTitle.on{display:grid}
  #voTitle .tIn{text-align:center;transform:translateY(-70px)}
  #voTitle h1{margin:0;font:900 128px/1.1 Cairo,sans-serif;background:linear-gradient(180deg,#FFFFFF,#FFE88A 45%,#E3A21A);-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(0 6px 0 rgba(120,70,0,.6)) drop-shadow(0 0 30px rgba(255,200,60,.5));animation:tPop 1s cubic-bezier(.3,1.6,.5,1) both}
  #voTitle .rib{display:inline-block;margin-top:8px;font:900 34px Cairo,sans-serif;color:#fff;padding:6px 34px;border-radius:40px;background:linear-gradient(90deg,#1F6E73,#1F4E79);border:3px solid #E3B04B;animation:tPop 1s .3s cubic-bezier(.3,1.6,.5,1) both}
  #voTitle .sub{margin-top:14px;font:800 24px Cairo,sans-serif;color:#FFE3A0;animation:tPop 1s .6s both}
  #voTitle canvas{position:absolute;bottom:150px;width:270px;height:400px}
  #voTitle .hb{right:9%}#voTitle .hg{left:9%}
  #voTitle .glow{position:absolute;bottom:120px;width:300px;height:60px;border-radius:50%;background:radial-gradient(rgba(255,214,90,.45),transparent 70%)}
  #voTitle .gb{right:9%}#voTitle .gg{left:9%}
  #voTitle .cta{margin-top:26px;display:inline-block;font:900 34px Cairo,sans-serif;color:#3A2400;padding:12px 44px;border-radius:40px;background:linear-gradient(180deg,#FFF1B8,#FFD54A 55%,#E3A21A);box-shadow:0 7px 0 #8A5A00;animation:tPop .8s both,ctaB 1.4s 1s ease-in-out infinite}
  @keyframes tPop{from{opacity:0;transform:scale(.6)}}
  @keyframes ctaB{50%{transform:scale(1.06)}}
  #voChip{position:fixed;top:96px;right:28px;z-index:9998;direction:rtl;font:900 30px Cairo,sans-serif;color:#fff;padding:8px 22px;border-radius:18px;background:rgba(10,8,34,.78);border:2px solid #E3B04B;opacity:0;transition:opacity .3s}
  #voChip.on{opacity:1}
  #voCred{position:fixed;inset:0;z-index:9996;display:none;direction:rtl;overflow:hidden;background:radial-gradient(ellipse at 70% 45%,#174E7E 0%,#0B2A4A 45%,#051528 100%)}
  #voCred.on{display:block}
  #voCred .pat{position:absolute;inset:0;opacity:.13;background:repeating-linear-gradient(45deg,transparent 0 26px,#E3B04B 26px 28px),repeating-linear-gradient(-45deg,transparent 0 26px,#E3B04B 26px 28px)}
  #voCred .rays{position:absolute;right:6%;top:18%;width:520px;height:520px;border-radius:50%;background:radial-gradient(rgba(140,200,255,.35),transparent 65%);animation:cGlow 4s ease-in-out infinite}
  @keyframes cGlow{50%{opacity:.6;transform:scale(1.08)}}
  #voCred .band{position:absolute;top:0;left:50%;transform:translateX(-50%);width:700px;height:182px;border-radius:0 0 350px 350px/0 0 130px 130px;background:linear-gradient(180deg,#FFFDF6,#F6EBD2);box-shadow:0 0 0 5px #E3B04B,0 14px 40px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;gap:34px;animation:cDown 1s cubic-bezier(.3,1.4,.5,1) both}
  #voCred .band img{height:150px;mix-blend-mode:multiply}
  #voCred .band .moe{height:150px}
  #voCred .band i{width:3px;height:120px;background:linear-gradient(#fff0,#C9971C,#fff0)}
  @keyframes cDown{from{transform:translate(-50%,-110%)}}
  #voCred .arch{position:absolute;right:7%;bottom:-6px;width:400px;height:540px;border-radius:200px 200px 0 0;overflow:hidden;border:7px solid #E3B04B;border-bottom:0;box-shadow:0 0 0 3px rgba(255,255,255,.25),0 0 60px rgba(255,214,90,.35),0 30px 60px rgba(0,0,0,.5);background:#DCE3E8;animation:cRise 1.1s .4s cubic-bezier(.3,1.2,.5,1) both}
  #voCred .arch img{width:100%;height:100%;object-fit:cover;object-position:50% 6%}
  #voCred .arch::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 62%,rgba(5,21,40,.6))}
  @keyframes cRise{from{opacity:0;transform:translateY(80px) scale(.94)}}
  #voCred .card{position:absolute;left:6%;top:222px;width:600px;text-align:center;animation:cFade .9s 1s both}
  #voCred .orn{display:flex;align-items:center;justify-content:center;gap:12px;color:#E3B04B;font-size:26px}
  #voCred .orn b{height:2px;width:150px;background:linear-gradient(90deg,transparent,#E3B04B,transparent)}
  #voCred .box{margin:14px auto;padding:20px 26px 24px;border:3px solid #E3B04B;border-radius:28px;background:linear-gradient(180deg,rgba(11,42,74,.88),rgba(5,21,40,.92));box-shadow:inset 0 0 0 6px rgba(227,176,75,.18),0 18px 40px rgba(0,0,0,.4);position:relative;overflow:hidden}
  #voCred .box small{display:block;font:800 30px Cairo,sans-serif;color:#F3F6FF;animation:cFade .8s 1.4s both}
  #voCred .box strong{display:block;margin-top:4px;font:900 76px/1.5 Cairo,sans-serif;padding:0 14px 10px;background:linear-gradient(180deg,#FFF6D0,#FFD54A 50%,#C98A12);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 rgba(0,0,0,.35));animation:cFade .9s 1.8s both}
  #voCred .box::after{content:"";position:absolute;top:0;bottom:0;width:120px;left:-160px;background:linear-gradient(100deg,transparent,rgba(255,255,255,.3),transparent);animation:cShine 2.4s 2.6s ease-in-out infinite}
  @keyframes cShine{to{left:120%}}
  #voCred .sch{font:800 26px Cairo,sans-serif;color:#FFE3A0;animation:cFade .8s 2.3s both}
  #voCred .game{margin-top:8px;font:700 22px Cairo,sans-serif;color:#C9D8EA;animation:cFade .8s 2.7s both}
  @keyframes cFade{from{opacity:0;transform:translateY(16px)}}
  #voCred .rib{position:absolute;left:-140px;bottom:-250px;width:780px;height:340px;border-radius:50%;border-top:10px solid #E3B04B;transform:rotate(-12deg);opacity:.85}
  #voCred .rib2{left:-190px;bottom:-292px;border-top-width:4px;opacity:.5}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  document.body.classList.add('vid');
  const el = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); const n = d.firstChild; document.body.appendChild(n); return n; };
  const cap = el('<div id="voCap"><div id="voPic"><canvas class="pb" width="240" height="240"></canvas><canvas class="pg" width="240" height="240"></canvas></div><div><span class="who"></span><p></p></div></div>');
  const lbl = el('<div id="voLbl"></div>'), fade = el('<div id="voFade"></div>'), wipe = el('<div id="voWipe"><div class="wIn"><div class="wStar">✦</div><b>قرية الخير</b></div></div>'), chip = el('<div id="voChip"></div>');
  const cred = el('<div id="voCred"><div class="pat"></div><div class="rays"></div><div class="rib"></div><div class="rib rib2"></div><div class="band"><img class="sch" alt=""><i></i><img class="moe" alt=""></div><div class="arch"><img class="me" alt=""></div><div class="card"><div class="orn"><b></b>✦<b></b></div><div class="box"><small>إعداد وتنفيذ الأستاذ</small><strong>رامي الرزقي</strong></div><div class="sch">مدرسة الخوير للتعليم الأساسي (٥–٩)</div><div class="game">لعبة «قرية الخير» · رياضيات الصف السادس</div><div class="orn" style="margin-top:14px"><b></b>✦<b></b></div></div></div>');
  const title = el('<div id="voTitle"><div class="tIn"><h1>قرية الخير</h1><div class="rib">مغامرة رامي ماث</div><div class="sub"></div><div class="ctaW"></div></div><span class="glow gb"></span><span class="glow gg"></span><canvas class="hb" width="600" height="800"></canvas><canvas class="hg" width="600" height="800"></canvas></div>');
  let drawHuman = null, heroLook = null, H3 = null;
  Promise.all([import('/character/human.js'), import('/ui/screens.js'), import('/tests/video/hero3d.js')]).then(([h, s, m]) => { drawHuman = h.drawHuman; heroLook = s.heroLook;
    const L = { b: heroLook({ kind: 'boy', skin: '#C98E5F', color: '#2F6FB2' }), g: heroLook({ kind: 'girl', skin: '#D9A374', color: '#2E8B57' }) };
    H3 = { pb: m.hero3d(cap.querySelector('.pb'), L.b, { bust: true }), pg: m.hero3d(cap.querySelector('.pg'), L.g, { bust: true }), hb: m.hero3d(title.querySelector('.hb'), L.b), hg: m.hero3d(title.querySelector('.hg'), L.g) }; });
  const LOOK = () => ({ b: heroLook({ kind: 'boy', skin: '#C98E5F', color: '#2F6FB2' }), g: heroLook({ kind: 'girl', skin: '#D9A374', color: '#2E8B57' }) });
  let S = { lines: [], label: '', dur: 0, title: null, dips: [], chips: [] }, curKey = '';
  const V = window.__vo = {
    credits(img) { cred.querySelector('img.sch').src = img.school; cred.querySelector('img.moe').src = img.moe; cred.querySelector('img.me').src = img.me; },
    scene(s) { S = Object.assign({ lines: [], label: '', dur: 0, title: null, dips: [], chips: [], hud: true, capTop: false }, s); curKey = ''; document.body.classList.toggle('noHud', S.hud === false); lbl.classList.toggle('low', !!S.capTop); lbl.textContent = S.label; lbl.classList.remove('on'); cap.classList.remove('on');
      title.classList.toggle('on', !!S.title); cred.classList.toggle('on', !!S.credits); if (S.title) { title.querySelector('.sub').textContent = S.title.sub || ''; title.querySelector('.ctaW').innerHTML = S.title.cta ? `<span class="cta">${S.title.cta}</span>` : ''; } },
    frame(t) {
      // الإظلام: أول المشهد وآخره، وعند كل قطع داخلي
      // الانتقال: لوح «قرية الخير» يعبر الشاشة من اليمين إلى اليسار ويغطيها لحظة القطع؛ الإظلام فقط في أول الفيديو وآخره
      const WD = .5, ez = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; let f = 0, wx = null;
      if (t < WD) { if (S.first) f = 1 - t / WD; else wx = -ez(t / WD); }
      if (S.dur - t < WD) { const k = 1 - (S.dur - t) / WD; if (S.last) f = Math.max(f, k); else wx = 1 - ez(Math.min(1, k)); }
      S.dips.forEach(d => { if (t > d - WD && t <= d) wx = 1 - ez((t - (d - WD)) / WD); else if (t > d && t < d + WD) wx = -ez((t - d) / WD); });
      fade.style.opacity = Math.max(0, Math.min(1, f)); wipe.style.visibility = wx == null ? 'hidden' : 'visible'; if (wx != null) wipe.style.transform = `translateX(${wx * 135}%) skewX(-12deg)`;
      lbl.classList.toggle('on', !!S.label && t > .4 && S.dur - t > .3);
      const ch = S.chips.find(c => t >= c.from && t < c.to); chip.textContent = ch ? ch.text : ''; chip.classList.toggle('on', !!ch);
      const ln = S.lines.find(l => t >= l.start - .05 && t < l.start + l.dur + .35);
      if (ln) { const key = ln.start + ln.who; if (key !== curKey) { curKey = key; cap.className = ln.who + (S.capTop ? ' top' : ''); cap.querySelector('.who').textContent = ln.who === 'b' ? 'البطل' : 'البطلة'; cap.querySelector('p').textContent = ln.text; void cap.offsetWidth; } cap.classList.add('on'); }
      else cap.classList.remove('on');
      if (!H3) return;
      const speaking = ln && t < ln.start + ln.dur ? ln.who : null;
      if (ln) { const w = ln.who; cap.querySelector('.pb').style.visibility = w === 'b' ? 'visible' : 'hidden'; cap.querySelector('.pg').style.visibility = w === 'g' ? 'visible' : 'hidden'; H3['p' + w].render(t, speaking ? 'talk' : null); }
      if (S.title) ['b', 'g'].forEach(w => H3['h' + w].render(t + (w === 'g' ? .4 : 0), speaking === w ? 'talk' : (S.title.cheer ? 'celebrate' : (Math.floor(t / 2.2) % 2 ? 'wave' : null))));
    }
  };
})();
