// القسمة بوصفها توزيعاً متساوياً — منطق رياضي صِرف لا يعرف شيئاً عن الرسم
export function inspectLoads(loads, total) {
  const sum = loads.reduce((a, b) => a + b, 0), share = total / loads.length;
  return {
    sum, share,
    allLoaded: sum === total,
    equal: loads.every(n => n === share),
    heavy: loads.map((n, i) => (n > share ? i : -1)).filter(i => i >= 0),
    light: loads.map((n, i) => (n < share ? i : -1)).filter(i => i >= 0)
  };
}
