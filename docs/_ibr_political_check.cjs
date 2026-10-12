const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const strip = s => s.split('\n').map(l => l.replace(/#.*/g, '')).join('\n');
function blocksOf(file, topKey) {
  const src = strip(fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r/g, '')).split('\n');
  const out = [];
  const re = new RegExp('^\\s*' + topKey + '\\s*=\\s*\\{');
  for (let i = 0; i < src.length; i++) {
    if (!re.test(src[i])) continue;
    let d = 0; const body = [];
    for (let j = i; j < src.length; j++) {
      const line = src[j];
      for (const ch of line) { if (ch === '{') d++; else if (ch === '}') d--; }
      body.push(line);
      if (d === 0 && j > i) break;
    }
    const text = body.join('\n');
    const g = r => { const m = r.exec(text); return m ? m[1] : null; };
    const id = g(/^\s*id\s*=\s*([A-Za-z0-9_.]+)/m);
    if (!id) continue;
    out.push({ id, x: +(g(/^\s*x\s*=\s*(-?\d+)/m) || 0), y: +(g(/^\s*y\s*=\s*(-?\d+)/m) || 0), text });
  }
  return out;
}
const range = a => a.length ? `n=${a.length} x ${Math.min(...a.map(p => p.x))}..${Math.max(...a.map(p => p.x))} y ${Math.min(...a.map(p => p.y))}..${Math.max(...a.map(p => p.y))}` : 'EMPTY';
const main = blocksOf('common/national_focus/IBR.txt', 'focus');
const byId = new Map(main.map(v => [v.id, v]));
const rpOf = v => { const m = /^\s*relative_position_id\s*=\s*([A-Za-z0-9_]+)/m.exec(v.text); return m ? m[1] : null; };
function ab(v, seen) {
  seen = seen || new Set();
  const rp = rpOf(v);
  if (!rp || seen.has(rp) || !byId.has(rp)) return { x: v.x, y: v.y };
  seen.add(rp);
  const p = ab(byId.get(rp), seen);
  return { x: p.x + v.x, y: p.y + v.y };
}
const M = main.map(v => { const a = ab(v); return { id: v.id, x: a.x, y: a.y }; });
console.log('main  ', range(M));
console.log('  最右 6 格:', M.slice().sort((a, b) => b.x - a.x).slice(0, 6).map(p => p.id + '@(' + p.x + ',' + p.y + ')').join(' '));
console.log('  最下 6 格:', M.slice().sort((a, b) => b.y - a.y).slice(0, 6).map(p => p.id + '@(' + p.x + ',' + p.y + ')').join(' '));
const mil = blocksOf('common/national_focus/IBR_military_shared.txt', 'shared_focus');
console.log('mil   ', range(mil));
const pol = blocksOf('common/national_focus/IBR_political_shared.txt', 'shared_focus');
console.log('pol   ', range(pol));
const dev = blocksOf('common/national_focus/DEV_development_shared.txt', 'shared_focus').map(v => {
  const m = /offset\s*=\s*\{[^}]*?x\s*=\s*(-?\d+)[^}]*?y\s*=\s*(-?\d+)[^}]*?has_focus_tree\s*=\s*IBR_torch_of_iberia/.exec(v.text);
  return m ? { id: v.id, x: v.x + (+m[1]), y: v.y + (+m[2]) } : null;
}).filter(Boolean);
console.log('dev   ', range(dev));
/* 合并撞格 */
const all = [...M.map(p => ({ ...p, k: 'main' })), ...mil.map(p => ({ ...p, k: 'mil' })), ...pol.map(p => ({ ...p, k: 'pol' })), ...dev.map(p => ({ ...p, k: 'dev' }))];
const seen = new Map(); const clash = [];
for (const p of all) { const key = p.x + ',' + p.y; if (seen.has(key)) clash.push(key + ': ' + seen.get(key) + ' / ' + p.k + '.' + p.id); else seen.set(key, p.k + '.' + p.id); }
console.log('合并', all.length, '格 · 撞格', clash.length);
clash.forEach(c => console.log('   ', c));
/* 政治簇与别区的同排最近间距 */
for (const p of pol) {
  let best = null;
  for (const q of all) {
    if (q === p || q.k === 'pol') continue;
    if (Math.abs(q.y - p.y) === 0 && q.x !== p.x) { const d = Math.abs(q.x - p.x); if (!best || d < best.d) best = { d, other: q.k + '.' + q.id + '@' + q.x }; }
  }
  if (best && best.d < 2) console.log('贴格风险 y=' + p.y + ' ' + p.id + '(' + p.x + ') ↔ ' + best.other + ' Δx=' + best.d);
}
console.log('done');
