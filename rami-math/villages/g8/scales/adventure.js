// مغامرة ميناء الموازين «لغز الحاوية الخضراء»: تُشغَّل بمحرك المغامرات (وعارضه ثلاثي الأبعاد إن كان العرض مجسّماً).
// onDone({ stars, gems }) عند الإكمال، وnull عند الخروج قبل النهاية (التقدّم محفوظ).
export async function playAdventure({ onDone }) {
  const E = await import('../../../adventure/engine.js');
  if (E.want3D()) { try { E.setAdv3D((await import('../../../adventure/render3d.js')).createAdv3D); } catch (e) { console.warn('[adv3d]', e); } }
  const def = (await import('./story.js')).default;
  E.runAdventure(def, res => { const R = E.advRec(def.id); onDone(res && res.done ? { stars: Math.max(1, Math.min(3, Math.ceil((R.best || 0) * 3 / (def.stars || 5)))), gems: 40 } : null); });
}
