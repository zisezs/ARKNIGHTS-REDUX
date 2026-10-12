/* 政治簇批次内容一致性检查：
   国策里引用的 idea / tooltip / 变量 / 决议，是否都能在 common 与 localisation 里找到；
   精神 picture 是否有图集帧 + 贴图；括号是否平衡；loc 是否 BOM+LF。 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r/g, '');
const strip = s => s.split('\n').map(l => l.replace(/#.*/g, '')).join('\n');
const bad = [];
const say = m => bad.push(m);

/* 1. 已定义的 idea（含 timed/动态） */
const ideaIds = new Set();
for (const f of fs.readdirSync(path.join(ROOT, 'common/ideas')).filter(x => x.endsWith('.txt')))
  for (const m of strip(read('common/ideas/' + f)).matchAll(/^\s*([A-Za-z0-9_]+)\s*=\s*\{\s*\n\s*(?:picture|modifier|allowed|removal_cost|cost|default_passive|allowed_categories)/gm)) ideaIds.add(m[1]);

/* 2. 全部 loc 键 */
const locKeys = new Set();
const LOCDIR = 'localisation/simp_chinese';
for (const f of fs.readdirSync(path.join(ROOT, LOCDIR)).filter(x => x.endsWith('.yml'))) {
  const raw = fs.readFileSync(path.join(ROOT, LOCDIR, f));
  if (!(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF)) say('loc 缺 BOM：' + f);
  if (raw.includes(13)) say('loc 是 CRLF：' + f);
  for (const m of raw.toString('utf8').matchAll(/^\s*([A-Za-z0-9_]+)\s*:\s*"/gm)) {
    if (locKeys.has(m[1])) say('loc 键重复：' + m[1] + '（' + f + '）');
    locKeys.add(m[1]);
  }
}

/* 3. 政治簇国策块 */
const tree = strip(read('common/national_focus/IBR_political_shared.txt'));
const blocks = tree.split(/\bshared_focus\s*=\s*\{/).slice(1).map(b => b.slice(0, b.indexOf('\n}\n') + 3));
console.log('政治簇块数', blocks.length);
const vars = new Set();
for (const b of blocks) {
  const id = (b.match(/id = (\w+)/) || [])[1];
  for (const m of b.matchAll(/add_ideas\s*=\s*\{([^}]*)\}/g))
    for (const i of m[1].split(/\s+/).filter(Boolean)) if (!ideaIds.has(i)) say(`${id}: add_ideas 指向不存在的 idea ${i}`);
  for (const m of b.matchAll(/custom_effect_tooltip\s*=\s*(\w+)/g)) if (!locKeys.has(m[1])) say(`${id}: custom_effect_tooltip 键 ${m[1]} 无本地化`);
  for (const m of b.matchAll(/(?:set_variable|add_to_variable|subtract_from_variable|clamp_variable)\s*=\s*\{[^}]*?var = (\w+)/g)) vars.add(m[1]);
  if (!/icon = GFX_focus_IBR_pol_/.test(b)) say(`${id}: icon 不是本簇专属图`);
  if (!locKeys.has(id)) say(`${id}: 国策名无本地化`);
}

/* 4. 决议与类目 */
const dec = strip(read('common/decisions/IBR_purification_decisions.txt'));
const cat = strip(read('common/decisions/categories/IBR_decision_categories.txt'));
for (const m of dec.matchAll(/^\t([A-Za-z0-9_]+)\s*=\s*\{/gm)) {
  if (!locKeys.has(m[1])) say(`决议 ${m[1]} 无本地化名`);
}
if (!locKeys.has('IBR_purification_category') || !locKeys.has('IBR_purification_category_desc')) say('决议组名/说明缺本地化');
for (const m of cat.matchAll(/has_completed_focus = (\w+)/g)) if (!tree.includes('id = ' + m[1])) say(`类目 allowed 引用了不存在的国策 ${m[1]}`);
/* 决议里卡的国策也要存在（含跨树引用，查全工程 id） */
const ALL_FOCUS_IDS = new Set();
for (const f of fs.readdirSync(path.join(ROOT, 'common/national_focus')).filter(x => x.endsWith('.txt')))
  for (const m of read('common/national_focus/' + f).matchAll(/^\s*id\s*=\s*([A-Za-z0-9_]+)/gm)) ALL_FOCUS_IDS.add(m[1]);
for (const m of dec.matchAll(/has_completed_focus = (\w+)/g)) if (!ALL_FOCUS_IDS.has(m[1])) say(`决议引用了不存在的国策 ${m[1]}`);
for (const m of dec.matchAll(/tooltip = (\w+)/g)) if (!locKeys.has(m[1])) say(`决议 tooltip 键 ${m[1]} 无本地化`);
for (const m of dec.matchAll(/var = (\w+)/g)) vars.add(m[1]);

/* 5. 每周钩子覆盖到的变量与国策 */
const oa = strip(read('common/on_actions/IBR_on_actions.txt'));
if (!/on_weekly_IBR\s*=\s*\{/.test(oa)) say('on_actions 里没有 on_weekly_IBR');
for (const m of oa.matchAll(/has_completed_focus = (IBR_pol_\w+)/g)) if (!tree.includes('id = ' + m[1])) say(`on_actions 引用了不存在的国策 ${m[1]}`);

/* 6. 精神的 picture → 图集帧 + 贴图 */
const gfxIdea = read('interface/ideas/IBR_ideas.gfx');
for (const f of fs.readdirSync(path.join(ROOT, 'common/ideas')).filter(x => x.startsWith('IBR'))) {
  for (const m of strip(read('common/ideas/' + f)).matchAll(/^\s*([A-Za-z0-9_]+)\s*=\s*\{\s*\n\s*picture = (\w+)/gm)) {
    if (!gfxIdea.includes('name = "GFX_idea_' + m[2] + '"')) say(`精神 ${m[1]} 的 picture ${m[2]} 没有图集帧`);
    if (!fs.existsSync(path.join(ROOT, 'gfx/interface/ideas/IBR/' + m[2] + '.png'))) say(`精神 ${m[1]} 的贴图缺失：${m[2]}.png`);
    if (!locKeys.has(m[1])) say(`精神 ${m[1]} 无本地化名`);
  }
}

/* 7. 括号平衡 */
for (const rel of ['common/ideas/IBR_political_ideas.txt', 'common/decisions/IBR_purification_decisions.txt',
  'common/decisions/categories/IBR_decision_categories.txt', 'common/on_actions/IBR_on_actions.txt',
  'common/national_focus/IBR_political_shared.txt', 'common/national_focus/IBR.txt']) {
  const s = strip(read(rel)); let d = 0, min = 0;
  for (const c of s) { if (c === '{') d++; else if (c === '}') { d--; if (d < min) min = d; } }
  if (d !== 0 || min < 0) say(`括号不平衡：${rel} 收尾深度 ${d}、最低 ${min}`);
}

/* 8. 决议键黑名单：`cooldown` 不是决议键（引擎报 persistent.cpp:67 Unexpected token），
      冷却必须用 days_re_enable；类目里的动态条件必须写 visible，allowed 只在开局判一次 */
for (const f of fs.readdirSync(path.join(ROOT, 'common/decisions')).filter(x => x.endsWith('.txt'))) {
  const t = strip(read('common/decisions/' + f));
  const hits = (t.match(/^\s*cooldown\s*=/gm) || []).length;
  if (hits) say(`决议文件 ${f} 用了无效键 cooldown（${hits} 处），应改 days_re_enable`);
}
for (const m of cat.matchAll(/^\s*(\w+)\s*=\s*\{([\s\S]*?)^\}/gm))
  if (/allowed\s*=\s*\{[^}]*has_completed_focus/.test(m[2])) say(`类目 ${m[1]} 把 has_completed_focus 写进了 allowed（开局只判一次，永不解锁），应改 visible`);

/* 9. 终幕换领袖链路：事件 id 有定义、角色有块且入池、特质有定义、tooltip 键齐全 */
const evRaw = read('events/IBR_political.txt');
if (!/^add_namespace = ibr_pol/m.test(evRaw)) say('events/IBR_political.txt 缺 add_namespace（裸写会让整份文件静默不加载）');
const evIds = new Set([...evRaw.matchAll(/id = (ibr_pol\.\d+)/g)].map(m => m[1]));
const treeRaw = read('common/national_focus/IBR_political_shared.txt');
for (const m of treeRaw.matchAll(/country_event = \{ id = (ibr_pol\.\d+)/g)) {
  if (!evIds.has(m[1])) say(`国策调用了未定义的事件 ${m[1]}`);
}
const chars = read('common/characters/IBR.txt');
const hist = read('history/countries/IBR - Iberia.txt');
const traits = read('common/country_leader/IBR_traits.txt');
for (const m of evRaw.matchAll(/character = (IBR_\w+)/g)) {
  if (!new RegExp('\\n\\s*' + m[1] + ' = \\{').test(chars)) say(`事件引用了没有角色块的角色 ${m[1]}`);
  if (!hist.includes('recruit_character = ' + m[1])) say(`角色 ${m[1]} 没在 history 里 recruit_character 入池`);
}
for (const m of evRaw.matchAll(/traits = \{ ([^}]+)\}/g))
  for (const t of m[1].split(/\s+/).filter(Boolean)) if (!traits.includes(t + ' = {')) say(`领袖特质 ${t} 未定义`);
for (const m of evRaw.matchAll(/name = (IBR_\w+)\s*\n\s*long_name = (IBR_\w+)/g))
  for (const k of [m[1], m[2]]) if (!locKeys.has(k)) say(`政党名 loc 键缺失：${k}`);
for (const m of treeRaw.matchAll(/custom_effect_tooltip = (\w+)/g)) if (!locKeys.has(m[1])) say(`国策 tooltip 键 ${m[1]} 无本地化`);
/* 头像：角色写的路径必须真有文件，且尺寸对 */
for (const m of chars.matchAll(/(large|small) = "gfx\/leaders\/IBR\/(\w+\.dds)"/g)) {
  const f = path.join(ROOT, 'gfx/leaders/IBR/' + m[2]);
  if (!fs.existsSync(f)) { say(`头像文件缺失：gfx/leaders/IBR/${m[2]}`); continue; }
  const b = fs.readFileSync(f);
  const w = b.readUInt32LE(16), h = b.readUInt32LE(12);
  const want = m[1] === 'large' ? [156, 210] : [65, 67];
  if (w !== want[0] || h !== want[1]) say(`头像尺寸不符：${m[2]} 是 ${w}x${h}，应为 ${want.join('x')}`);
  if (b.length !== 128 + w * h * 4) say(`头像字节数不符：${m[2]} = ${b.length}`);
}

console.log('政治簇用到的变量：' + [...vars].join(', '));
console.log('idea 总数 ' + ideaIds.size + ' · loc 键总数 ' + locKeys.size);
/* 本批次相关 vs 既有噪音分开报：既有 loc 里本来就有一百多条重复键，别混进来 */
const MINE = /IBR_pol_|IBR_pur|IBR_broken_garrisons|IBR_bandits_and_warlords|IBR_aegir_malicious|IBR_pure_heart_of_iberia|IBR_political|IBR_Irene|IBR_Estefania|IBR_toledo|IBR_fire_of|IBR_false_crown|事件|角色|特质|头像|政党名|tooltip/;
const mine = bad.filter(b => MINE.test(b)), legacy = bad.filter(b => !MINE.test(b));
console.log('与政治簇无关的既有问题 ' + legacy.length + ' 条（重复 loc 键 / CRLF 文件 / 旧精神缺名等），不在此列');
if (mine.length) { console.log('\n⚠ 本批次问题 ' + mine.length + ' 条：'); mine.forEach(b => console.log('  - ' + b)); process.exitCode = 1; }
else console.log('✔ 政治簇批次内容一致性通过（国策效果/精神/决议/类目/变量/图标/括号/loc 全对上）');
