// ناقل أحداث: الأنظمة تتواصل دون أن يعرف أحدها تفاصيل الآخر
const handlers = {};
export const bus = {
  on(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); },
  emit(ev, data) { (handlers[ev] || []).forEach(fn => fn(data)); }
};
