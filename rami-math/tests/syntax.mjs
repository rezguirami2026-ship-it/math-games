// فحص صياغة كل ملفات الوحدات قبل الاختبار والنشر (يكشف مثلاً تعليق // في منتصف سطر ابتلع بقيته)
// node --experimental-vm-modules tests/syntax.mjs
import vm from 'node:vm';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'), skip = new Set(['tests', 'lib', 'node_modules', 'server', '.git']);
let bad = 0, n = 0;
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (skip.has(f)) continue; if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.js') && f !== 'sw.js') { n++; try { new vm.SourceTextModule(readFileSync(p, 'utf8')); } catch (e) { bad++; console.log('❌', p.slice(root.length + 1), e.message); } } } })(root);
console.log(bad ? `❌ ${bad} ملف فيه خطأ صياغة من ${n}` : `✅ صياغة ${n} ملفاً سليمة`); process.exit(bad ? 1 : 0);
