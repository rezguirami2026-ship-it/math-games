// الإنجازات: تُفتح بما يفعله اللاعب في العالم
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
export const ACH = [
  { id: 'convoy', icon: '🚚', name: 'قائد القافلة', desc: 'أطلقتَ القافلة بحمولات متساوية' },
  { id: 'sharp', icon: '🎯', name: 'عين الخبير', desc: 'أطلقتَ القافلة من المحاولة الأولى' },
  { id: 'tree1', icon: '🌱', name: 'يد خضراء', desc: 'زرعتَ أول نخلة في القرية' },
  { id: 'grove', icon: '🌴', name: 'حارس الواحة', desc: 'زرعتَ ثلاث نخلات في الساحة' },
  { id: 'friend', icon: '🤝', name: 'صديق القرية', desc: 'تحدثتَ مع كل أهل القرية' }
];
export function unlock(id) {
  const s = game.state; if (s.achievements[id]) return;
  s.achievements[id] = Date.now(); bus.emit('achievement', ACH.find(a => a.id === id)); bus.emit('save');
}
