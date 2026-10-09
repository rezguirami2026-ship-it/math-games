// وقت افتراضي لتصوير الفيديو: يتجمد الوقت ويتقدم بخطوة ثابتة (١/٣٠ ثانية) قبل كل لقطة، فيخرج الفيديو سلساً مهما بطؤ الجهاز.
// يشمل performance.now وDate.now وrequestAnimationFrame وsetTimeout/setInterval وحركات CSS (getAnimations).
(() => {
  const RN = performance.now.bind(performance), RD = Date.now, RRAF = window.requestAnimationFrame.bind(window), RCAF = window.cancelAnimationFrame.bind(window);
  const RST = window.setTimeout.bind(window), RCT = window.clearTimeout.bind(window), RSI = window.setInterval.bind(window), RCI = window.clearInterval.bind(window);
  const V = window.__vt = { on: false, t: 0, base: 0, raf: new Map(), timers: new Map(), id: 1e7 };
  performance.now = () => V.on ? V.t : RN();
  Date.now = () => V.on ? Math.round(V.base + V.t) : RD();
  window.requestAnimationFrame = cb => { if (!V.on) return RRAF(cb); const id = ++V.id; V.raf.set(id, cb); return id; };
  window.cancelAnimationFrame = id => { if (V.raf.has(id)) V.raf.delete(id); else RCAF(id); };
  window.setTimeout = (cb, ms = 0, ...a) => { if (!V.on) return RST(cb, ms, ...a); const id = ++V.id; V.timers.set(id, { due: V.t + Math.max(0, +ms || 0), cb, a }); return id; };
  window.clearTimeout = id => { if (V.timers.has(id)) V.timers.delete(id); else RCT(id); };
  window.setInterval = (cb, ms = 0, ...a) => { if (!V.on) return RSI(cb, ms, ...a); const id = ++V.id; V.timers.set(id, { due: V.t + Math.max(1, +ms || 1), every: Math.max(1, +ms || 1), cb, a }); return id; };
  window.clearInterval = id => { if (V.timers.has(id)) V.timers.delete(id); else RCI(id); };
  V.start = () => { V.t = RN(); V.base = RD() - RN(); V.on = true; };
  V.step = dt => {
    const end = V.t + dt;
    for (let guard = 0; guard < 500; guard++) {   // المؤقتات المستحقة بالترتيب
      let best = null; for (const [id, t] of V.timers) if (t.due <= end && (!best || t.due < best[1].due)) best = [id, t];
      if (!best) break; const [id, t] = best; V.t = Math.max(V.t, t.due);
      if (t.every) t.due += t.every; else V.timers.delete(id);
      try { typeof t.cb === 'function' ? t.cb(...t.a) : 0; } catch (e) { console.error(e); }
    }
    V.t = end;
    const q = [...V.raf.values()]; V.raf.clear(); q.forEach(cb => { try { cb(V.t); } catch (e) { console.error(e); } });
    document.getAnimations().forEach(a => { if (!a.__v) { a.__v = 1; try { a.pause(); } catch (e) {} } try { a.currentTime = (a.currentTime || 0) + dt; } catch (e) {} });
  };
})();
