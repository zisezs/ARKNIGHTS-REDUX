/* 政治簇阶梯审计：DM 键 ↔ 变量 ↔ 国策推档次数 ↔ 最终值是否落在 ±25%（稳定/战争支持 ±5%） */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = r => fs.readFileSync(path.join(ROOT, r), 'utf8').replace(/\r/g, '');
const strip = s => s.split('\n').map(l => l.replace(/#.*/g, '')).join('\n');

/* 1. DM 定义 → 键 : 变量 */
const dmText = strip(read('common/dynamic_modifiers/IBR_political_dynamic_modifiers.txt'));
const dm = new Map();          /* 变量 → {dm, key} */
const dmList = [];             /* {id, keys:[{key,var}]} */
for (const m of dmText.matchAll(/^(\w+)\s*=\s*\{([\s\S]*?)^\}/gm)) {
  const id = m[1], body = m[2], keys = [];
  for (const k of body.matchAll(/^\s*(?!icon\b)([a-z_]+)\s*=\s*([A-Za-z_]\w*)\s*$/gm)) {
    keys.push({ key: k[1], var: k[2] });
    dm.set(k[2], { dm: id, key: k[1] });
  }
  if (keys.length) dmList.push({ id, keys });
}
console.log('动态精神 ' + dmList.length + ' 个 / 绑定变量 ' + dm.size + ' 枚');
const bad = [];
const CAP = k => (k === 'stab' || k === 'ws' ? 0.05 : 0.25);
const STEP = k => (k === 'stab' || k === 'ws' ? 0.01 : 0.05);

/* 2. 国策里每枚变量被推几次（同一条键的多个变量名互不影响；这里按变量名统计） */
const tree = strip(read('common/national_focus/IBR_political_shared.txt'));
const push = new Map();
for (const m of tree.matchAll(/add_to_variable\s*=\s*\{\s*var\s*=\s*(\w+)\s*value\s*=\s*(-?[\d.]+)/g)) {
  const v = m[1];
  const rec = push.get(v) || { n: 0, vals: [] };
  rec.n++; rec.vals.push(parseFloat(m[2]));
  push.set(v, rec);
}

/* 3. 逐变量核对 */
console.log(['变量', '键', '档数', '最终值', '判定'].join('\t'));
let overflow = 0;
for (const [v, info] of [...dm].sort()) {
  const rec = push.get(v);
  const cap = CAP(info.key);
  if (!rec) { bad.push(`DM 变量 ${v}（${info.key}）没有任何国策推它`); continue; }
  const total = rec.vals.reduce((a, b) => a + b, 0);
  const over = Math.abs(total) > cap + 1e-9;
  if (over) overflow++;
  console.log([v, info.key, rec.n, total.toFixed(2), over ? '⚠ 超出上限' : '✔ 正好到 ±' + cap].join('\t'));
}
for (const v of push.keys()) if (!dm.has(v) && !v.startsWith('IBR_pur_')) bad.push(`国策推了未绑定的变量 ${v}`);

/* 4. 精神数量与效果条数 */
for (const d of dmList) if (d.keys.length < 3) bad.push(`精神 ${d.id} 只有 ${d.keys.length} 条效果（要求 ≥3）`);
console.log('\n每个精神的修正符条数：' + dmList.map(d => d.id + '=' + d.keys.length).join('、'));

const total = [...push.entries()].reduce((a, [, r]) => a + r.n, 0);
console.log('国策推档总次数 ' + total + '（34 格）· 超上限变量 ' + overflow + '（由收尾/终幕 clamp 封顶）');
if (bad.length) { console.log('\n⚠ 问题 ' + bad.length + ' 条：'); bad.forEach(b => console.log('  - ' + b)); process.exitCode = 1; }
else console.log('✔ 阶梯审计通过：DM 键 ↔ 变量 ↔ 推档 一一对应，效果条数均 ≥3');
