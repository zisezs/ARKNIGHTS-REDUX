/* IBR 树完整性：shared_focus 引用与定义一一对应、id 全局唯一、loc 键无重复无冲突 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const NF = path.join(ROOT, 'common/national_focus');
const strip = s => s.split('\n').map(l => l.replace(/#.*/g, '')).join('\n');
const defined = new Map(); /* id -> [files] */
for (const f of fs.readdirSync(NF).filter(x => x.endsWith('.txt'))) {
  const src = strip(fs.readFileSync(path.join(NF, f), 'utf8').replace(/\r/g, ''));
  for (const m of src.matchAll(/^\s*(?:shared_focus|joint_focus|focus)\s*=\s*\{\s*\n?\s*id\s*=\s*([A-Za-z0-9_]+)/gm)) {
    if (!defined.has(m[1])) defined.set(m[1], []);
    defined.get(m[1]).push(f);
  }
}
const dup = [...defined].filter(([, v]) => v.length > 1);
console.log('定义国策 id 总数', defined.size, '· 重复定义', dup.length);
dup.forEach(([id, v]) => console.log('   重复', id, v.join(',')));

/* 每棵树内的引用（含 shared_focus 行）是否都能解析 */
const trees = {};
for (const [f, txt] of fs.readdirSync(NF).filter(x => x.endsWith('.txt')).map(x => [x, strip(fs.readFileSync(path.join(NF, x), 'utf8').replace(/\r/g, ''))])) {
  for (const m of txt.matchAll(/focus_tree\s*=\s*\{\s*\n\s*id\s*=\s*([A-Za-z0-9_]+)/g)) trees[m[1]] = { file: f, txt };
}
let dangling = 0;
for (const [tid, t] of Object.entries(trees)) {
  const refs = [...t.txt.matchAll(/^\s*shared_focus\s*=\s*([A-Za-z0-9_]+)/gm)].map(m => m[1]);
  const own = [...t.txt.matchAll(/^\s*focus\s*=\s*\{\s*\n\s*id\s*=\s*([A-Za-z0-9_]+)/gm)].map(m => m[1]);
  const have = new Set([...refs, ...own]);
  for (const id of refs) if (!defined.has(id)) { console.log('悬空 shared_focus', id, '@', tid); dangling++; }
  for (const m of t.txt.matchAll(/prerequisite\s*=\s*\{([^}]*)\}/g))
    for (const p of m[1].matchAll(/focus\s*=\s*([A-Za-z0-9_]+)/g))
      if (!defined.has(p[1]) && !have.has(p[1])) { console.log('悬空前置', p[1], '@', tid); dangling++; }
  if (tid === 'IBR_torch_of_iberia') console.log('IBR 树：自有格', own.length, '· shared 引用', refs.length, '· 其中政治簇', refs.filter(x => x.startsWith('IBR_pol_')).length);
}
console.log('悬空引用', dangling);

/* loc 检查 */
const locFile = path.join(ROOT, 'localisation/simp_chinese/ARF_IBR_political_l_simp_chinese.yml');
const raw = fs.readFileSync(locFile);
console.log('loc BOM', raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF, '· CRLF', raw.includes(13), '· 行数', raw.toString('utf8').split('\n').length);
const keys = [...raw.toString('utf8').matchAll(/^\s*([A-Za-z0-9_]+)\s*:/gm)].map(m => m[1]);
const seen = new Set(), dupl = [];
keys.forEach(k => { if (seen.has(k)) dupl.push(k); seen.add(k); });
console.log('loc 键', keys.length, '· 文件内重复', dupl.join(',') || 0);
const missing = [...defined.keys()].filter(id => id.startsWith('IBR_pol_') && !seen.has(id));
console.log('政治簇缺名的格', missing.length, missing.join(','));
/* 与其它 loc 文件的键冲突：只查生成器文件里的 34 格名，内容文件（DM 名/决议名/精神名）本来就在别处 */
const others = new Set();
const genKeys = new Set([...raw.toString('utf8').matchAll(/^\s*(IBR_pol_[A-Za-z0-9_]+)\s*:/gm)].map(m => m[1]));
for (const f of fs.readdirSync(path.join(ROOT, 'localisation/simp_chinese')).filter(x => x.endsWith('.yml'))) {
  if (f === 'ARF_IBR_political_l_simp_chinese.yml') continue;
  for (const m of fs.readFileSync(path.join(ROOT, 'localisation/simp_chinese', f), 'utf8').matchAll(/^\s*(IBR_pol_[A-Za-z0-9_]+)\s*:/gm))
    if (genKeys.has(m[1])) others.add(m[1] + '@' + f);
}
console.log('生成器文件的键与别处重名', others.size, [...others].slice(0, 6).join(', '));
