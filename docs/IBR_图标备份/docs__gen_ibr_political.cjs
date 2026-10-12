/*
 * IBR 政治国策簇生成器
 *   node docs/gen_ibr_political.cjs
 * 产物（幂等，重跑字节一致）：
 *   common/national_focus/IBR_political_shared.txt
 *   localisation/simp_chinese/ARF_IBR_political_l_simp_chinese.yml
 *   common/national_focus/IBR.txt  —— 末尾的 shared_focus 引用区（自动生成 起/止 标记之间）
 *   docs/_ibr_political_layout.svg —— 整棵 IBR 树的排版图（主树+军事簇+发展度簇+政治簇）
 * 数据表改完重跑即可；勿手改产物。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VANILLA_GOALS = 'D:/s/steamapps/common/Hearts of Iron IV/gfx/interface/goals';

/* 草案 NEW_tree.txt 的坐标 → 本工程坐标（整簇平移到主树与军事簇之间的空行带） */
const XOFF = -11, YOFF = +5;

/* pre：每个 { } 是一块 prerequisite；块内多 id = 「或」，多块 = 「与」
   mx：mutually_exclusive
   dx/dy：草案坐标 */
const NODES = [
  { n: 1,  id: 'IBR_pol_eternal_wrath',      name: '永恒愤怒，永恒变革',        icon: 'goal_generic_national_unity',                 dx: -1, dy: 3 },
  { n: 2,  id: 'IBR_pol_golden_century',     name: '伊比利亚·黄金世纪',          icon: 'focus_CHL_restore_the_old_kingdom',           dx: 2,  dy: 4, pre: [[1]], mx: [3] },
  { n: 3,  id: 'IBR_pol_pure_heart',         name: '伊比利亚·纯白之心',          icon: 'focus_ICE_break_with_the_crown',              dx: -4, dy: 4, pre: [[1]], mx: [2] },
  { n: 4,  id: 'IBR_pol_scrap_and_anchor',   name: '废铁、烂船与破锚',            icon: 'focus_FIN_salvaged_and_retooled',             dx: 5,  dy: 6, pre: [[5]] },
  { n: 5,  id: 'IBR_pol_trickster_king',     name: '骗子、统帅与国王',            icon: 'goal_generic_dangerous_deal',                 dx: 5,  dy: 5, pre: [[2]] },
  { n: 6,  id: 'IBR_pol_who_fires_guns',     name: '铳枪为谁而轰鸣',              icon: 'goal_generic_small_arms',                     dx: -7, dy: 5, pre: [[3]] },
  { n: 7,  id: 'IBR_pol_who_draws_blade',    name: '刺剑为谁而出鞘',              icon: 'goal_generic_special_forces',                 dx: -7, dy: 6, pre: [[6]] },
  { n: 8,  id: 'IBR_pol_islanders_landsmen', name: '岛民与陆民',                 icon: 'focus_AST_realize_the_value_of_british_citizenship', dx: -1, dy: 5, pre: [[3, 2]] },
  { n: 9,  id: 'IBR_pol_who_judges_sin',     name: '罪孽为谁而审判',              icon: 'focus_BRA_tribunal',                          dx: -7, dy: 7, pre: [[7]] },
  { n: 10, id: 'IBR_pol_army_of_inquisition',name: '审判庭的惩戒军？',            icon: 'focus_AUS_properly_trained_militias',         dx: -8, dy: 8, pre: [[9]] },
  { n: 11, id: 'IBR_pol_army_of_the_people', name: '伊比利亚人民的惩戒军！',      icon: 'focus_CHI_popular_army',                      dx: -6, dy: 8, pre: [[9]] },
  { n: 12, id: 'IBR_pol_agor_libertini',     name: '阿戈尔人与黎博利人',          icon: 'focus_generic_league_of_nations',             dx: -1, dy: 6, pre: [[8]] },
  { n: 13, id: 'IBR_pol_reorganize_aid',     name: '改组互助会',                 icon: 'goal_generic_alliance',                       dx: 0,  dy: 7, pre: [[12]] },
  { n: 14, id: 'IBR_pol_suppress_aid',       name: '镇压互助会',                 icon: 'goal_generic_forceful_treaty',                dx: -2, dy: 7, pre: [[12]] },
  { n: 15, id: 'IBR_pol_you_are_iberian',    name: '你们是伊比利亚人！',          icon: 'focus_ETH_in_the_name_of_the_people',         dx: -2, dy: 8, pre: [[14]] },
  { n: 16, id: 'IBR_pol_we_are_iberian',     name: '大家是伊比利亚人！',          icon: 'focus_GER_the_peoples_victory',               dx: 0,  dy: 8, pre: [[13]] },
  { n: 17, id: 'IBR_pol_i_honour_you',       name: '伊比利亚人，我敬你！',        icon: 'goal_generic_improve_relations',              dx: -1, dy: 9, pre: [[15], [16]] },
  { n: 18, id: 'IBR_pol_secret_conclave',    name: '审判庭秘密会议',              icon: 'focus_generic_court',                         dx: -7, dy: 9, pre: [[10], [11]] },
  { n: 19, id: 'IBR_pol_saint_elini',        name: '圣徒艾丽妮万岁！',            icon: 'focus_BEL_the_european_crusade',              dx: -4, dy: 13, pre: [[31], [34]] },
  { n: 20, id: 'IBR_pol_three_forces',       name: '惩戒军、国防军与深海舰队',    icon: 'goal_generic_position_armies',                dx: 6,  dy: 7, pre: [[4]] },
  { n: 21, id: 'IBR_pol_true_crown',         name: '真王冠、真王座与假国王',      icon: 'focus_CHL_crown_antoine_as_sovereign_king',   dx: 4,  dy: 7, pre: [[4]] },
  { n: 22, id: 'IBR_pol_toledo_fallen_star', name: '德·托莱多家族的黯淡之星！',  icon: 'goal_generic_political_pressure',             dx: 5,  dy: 8, pre: [[20], [21]] },
  { n: 23, id: 'IBR_pol_king_not_master',    name: '要国王，不要主人！',          icon: 'focus_HUN_elect_a_democratic_king',           dx: 4,  dy: 9, pre: [[22]] },
  { n: 24, id: 'IBR_pol_subjects_not_slaves',name: '是臣民，不是奴仆！',          icon: 'focus_BUL_the_peoples_republic_of_bulgaria',  dx: 6,  dy: 9, pre: [[22]] },
  { n: 25, id: 'IBR_pol_carmen_secret_letter', name: '圣徒卡门的密信',            icon: 'goal_generic_intelligence_exchange',          dx: 4,  dy: 12, pre: [[26], [23]] },
  { n: 26, id: 'IBR_pol_first_election',     name: '筹备伊比利亚第一次大选！',    icon: 'focus_generic_election',                      dx: 5,  dy: 11 },
  { n: 27, id: 'IBR_pol_clementia_aid',      name: '克莱门莎的援助',              icon: 'goal_generic_military_deal',                  dx: 6,  dy: 12, pre: [[26], [24]] },
  { n: 28, id: 'IBR_pol_empress_estphenia',  name: '女皇埃斯特菲尼娅万岁！',      icon: 'focus_ETH_rally_around_the_emperor',          dx: 2,  dy: 13, pre: [[26], [31]] },
  { n: 29, id: 'IBR_pol_restore_confidence', name: '重建黄金时代的自信',          icon: 'goal_generic_propaganda',                     dx: 0,  dy: 10, pre: [[17]] },
  { n: 30, id: 'IBR_pol_restore_courage',    name: '重拾开拓时代的勇气',          icon: 'goal_generic_amphibious_assault',             dx: -2, dy: 10, pre: [[17]] },
  { n: 31, id: 'IBR_pol_golden_age_returns', name: '黄金时代将再次归来！',        icon: 'focus_por_reclaim_crown_jewel',               dx: -1, dy: 11, pre: [[29], [30]] },
  { n: 32, id: 'IBR_pol_review_dogma',       name: '极端教条再审核',              icon: 'goal_generic_army_doctrines',                 dx: -6, dy: 10, pre: [[18]] },
  { n: 33, id: 'IBR_pol_retrial_records',    name: '争议卷宗再审判',              icon: 'focus_AUS_lawmaking_leniency',                dx: -8, dy: 10, pre: [[18]] },
  { n: 34, id: 'IBR_pol_saint_last_journey', name: '圣徒的退休前旅行',            icon: 'focus_generic_military_mission',              dx: -7, dy: 11, pre: [[32], [33]] },
];

const COST = 5;
const byN = new Map(NODES.map(v => [v.n, v]));
NODES.forEach(v => { v.x = v.dx + XOFF; v.y = v.dy + YOFF; });

/* ---------------- 校验 ---------------- */
const problems = [];
const ok = (cond, msg) => { if (!cond) problems.push(msg); };

/* 1. 坐标唯一 + 同排间距 */
const cells = new Map();
for (const v of NODES) {
  const k = v.x + ',' + v.y;
  ok(!cells.has(k), `撞格 ${k}: ${v.id} 与 ${cells.get(k)}`);
  cells.set(k, v.id);
}
const rows = new Map();
NODES.forEach(v => { (rows.get(v.y) || rows.set(v.y, []).get(v.y)).push(v); });
for (const [y, list] of rows) {
  list.sort((a, b) => a.x - b.x);
  for (let i = 1; i < list.length; i++)
    ok(list[i].x - list[i - 1].x >= 2, `同排贴格 y=${y}: ${list[i - 1].id}(x=${list[i - 1].x}) / ${list[i].id}(x=${list[i].x}) Δx=${list[i].x - list[i - 1].x}`);
}

/* 2. 悬空引用 + 前置方向 */
for (const v of NODES) {
  for (const blk of (v.pre || [])) for (const n of blk) {
    const p = byN.get(n);
    ok(!!p, `前置号 ${n} 不存在（${v.id}）`);
    if (p) ok(p.y < v.y, `前置向上：${p.id}(${p.x},${p.y}) → ${v.id}(${v.x},${v.y})`);
  }
  for (const n of (v.mx || [])) ok(!!byN.get(n), `互斥号 ${n} 不存在（${v.id}）`);
}

/* 3. 极值列/行不留孤点（根格在顶行是预期的） */
const xs = NODES.map(v => v.x), ys = NODES.map(v => v.y);
const box = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
for (const edge of [box.x0, box.x1]) {
  const on = NODES.filter(v => v.x === edge);
  ok(on.length >= 2, `极值列 x=${edge} 只有 ${on.length} 格`);
}
for (const v of NODES.filter(v => v.y === box.y1)) ok((v.pre || []).length, `底行 ${v.id} 无前置（悬空）`);
const rootish = NODES.filter(v => !(v.pre || []).length);
ok(rootish.length <= 2, `无前置的根格过多：${rootish.map(v => v.id).join(',')}`);

/* 4. 图标在原版存在 */
let iconFiles = null;
try { iconFiles = new Set(fs.readdirSync(VANILLA_GOALS).map(f => f.toLowerCase().replace(/\.dds$/, ''))); }
catch (e) { problems.push('读不到原版 goals 目录：' + e.message); }
if (iconFiles) for (const v of NODES) ok(iconFiles.has(v.icon.toLowerCase()), `原版没有这张图：GFX_${v.icon}（${v.id}）`);

/* ---------------- 产物 1：shared_focus 文件 ---------------- */
const HEADER = `######################
## 伊比利亚（IBR）政治国策簇 —— 共享国策
## 由 common/national_focus/IBR.txt 末尾的 shared_focus 引用并入主树 IBR_torch_of_iberia
##
## 依据：《昨日海》剧情（审判庭 / 岛民互助会 / 阿戈尔打捞三方）。
## 34 格、一对互斥（黄金世纪 ↔ 纯白之心）；草案见 Downloads/NEW_tree.txt（编号 1..34 的映射在下面的对照表）。
##
## 本版只搭骨架：格名、坐标、前置与互斥已定，completion_reward 一律留空，
##   国策正文（loc 里的 <id>_desc）与具体效果后续逐格补。
##
## 版式：整簇落在主树与军事簇之间的空行带 —— 列带 x = ${box.x0}..${box.x1}，行带 y = ${box.y0}..${box.y1}。
##   主树 y 0..7；军事簇 y 15..21 占 x -3..11；发展度簇 y 23..27 占 x -4..4；三区与本簇均不撞格。
##   同排任意两格 Δx ≥ 2；根格 (${byN.get(1).x},${byN.get(1).y}) 落在包围盒水平中线上；
##   极值列不留孤点；连线一律向下（dy ≥ 1），汇聚格取双肩列的中点。
##
## 与草案的两处差别（草案里 25/27 的前置 26 排在它们下面，箭头朝上）：
##   25 圣徒卡门的密信、27 克莱门莎的援助 各下移一行到 y=${byN.get(25).y}，
##   26 筹备大选 仍留在 y=${byN.get(26).y}（照草案保持「无前置的第二入口」，同军事簇根格）。
##
## 图标全部借用原版通用图（gfx/interface/goals/*.dds 自动注册），美术出图后换成 GFX_focus_IBR_pol_*。
## 局部化：localisation/simp_chinese/ARF_IBR_political_l_simp_chinese.yml
##
## 生成器 docs/gen_ibr_political.cjs（改数据表重跑，勿手改产物）
######################
## 草案编号对照：
${NODES.map(v => `##   ${String(v.n).padStart(2)}  ${v.id}  ${v.name}`).join('\n')}
##`;

const blocks = NODES.map(v => {
  const L = [];
  L.push(`shared_focus = { #${v.name}`);
  L.push(`\tid = ${v.id}`);
  L.push(`\ticon = GFX_${v.icon}`);
  L.push(`\tx = ${v.x}`);
  L.push(`\ty = ${v.y}`);
  L.push(`\tcost = ${v.cost || COST}`);
  for (const blk of (v.pre || [])) {
    L.push('\tprerequisite = {');
    for (const n of blk) L.push(`\t\tfocus = ${byN.get(n).id}`);
    L.push('\t}');
  }
  if (v.mx && v.mx.length) {
    L.push('\tmutually_exclusive = {');
    for (const n of v.mx) L.push(`\t\tfocus = ${byN.get(n).id}`);
    L.push('\t}');
  }
  L.push('\tavailable_if_capitulated = yes');
  L.push('');
  L.push('\tai_will_do = {');
  L.push('\t\tfactor = 1');
  L.push('\t}');
  L.push('');
  L.push('\tcompletion_reward = {');
  L.push('\t\t# 效果待填充');
  L.push('\t}');
  L.push('}');
  return L.join('\n');
});

const SHARED_OUT = path.join(ROOT, 'common/national_focus/IBR_political_shared.txt');
writeLf(SHARED_OUT, HEADER + '\n\n' + blocks.join('\n\n') + '\n');

/* ---------------- 产物 2：局部化（UTF-8 BOM + LF，只给格名） ---------------- */
const locLines = ['l_simp_chinese:', ''];
locLines.push('# ===== 伊比利亚政治国策簇（生成器 docs/gen_ibr_political.cjs，勿手改）=====');
for (const v of NODES) locLines.push(` ${v.id}: "${v.name}"`);
locLines.push('');
const LOC_OUT = path.join(ROOT, 'localisation/simp_chinese/ARF_IBR_political_l_simp_chinese.yml');
fs.writeFileSync(LOC_OUT, '﻿' + locLines.join('\n'), 'utf8');

/* ---------------- 产物 3：IBR.txt 里的 shared_focus 引用区 ---------------- */
const IBR = path.join(ROOT, 'common/national_focus/IBR.txt');
const MARK = 'IBR 政治国策簇';
let ibr = fs.readFileSync(IBR, 'utf8').replace(/\r/g, '');
const start = `	# ---- ${MARK} shared_focus 引用 自动生成 起 ----`;
const end = `	# ---- ${MARK} shared_focus 引用 自动生成 止 ----`;
const region = start + '\n' + NODES.map(v => `\tshared_focus = ${v.id}`).join('\n') + '\n' + end;
fs.writeFileSync(IBR + '.bak_poltree', fs.existsSync(IBR + '.bak_poltree') ? fs.readFileSync(IBR + '.bak_poltree') : ibr, 'utf8');
const si = ibr.indexOf(start), ei = ibr.indexOf(end);
if (si >= 0 && ei > si) {
  ibr = ibr.slice(0, si) + region + ibr.slice(ei + end.length);
} else {
  /* 插到 focus_tree 的收尾 } 之前（即文件最后一个单独成行的 }） */
  const tail = ibr.lastIndexOf('\n}');
  ok(tail > 0, '找不到 IBR.txt 的 focus_tree 收尾花括号');
  ibr = ibr.slice(0, tail) + '\n\n' + region + ibr.slice(tail);
}
writeLf(IBR, ibr);

/* ---------------- 产物 4：整树排版预览 SVG ---------------- */
const all = [] /* {id,x,y,kind} */;
function stripComments(s) { return s.split('\n').map(l => l.replace(/#.*/g, '')).join('\n'); }
function blocksOf(file, topKey) {
  const src = stripComments(fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r/g, '')).split('\n');
  const out = [];
  for (let i = 0; i < src.length; i++) {
    const m = new RegExp('^\\s*' + topKey + '\\s*=\\s*\\{').exec(src[i]);
    if (!m) continue;
    let d = 0, body = [];
    for (let j = i; j < src.length; j++) {
      const line = src[j];
      for (const ch of line) { if (ch === '{') d++; else if (ch === '}') d--; }
      body.push(line);
      if (d === 0 && j > i) break;
    }
    const text = body.join('\n');
    const g = (re) => { const r = re.exec(text); return r ? r[1] : null; };
    const id = g(/^\s*id\s*=\s*([A-Za-z0-9_.]+)/m);
    if (!id) continue;
    out.push({ id, x: +(g(/^\s*x\s*=\s*(-?\d+)/m) || 0), y: +(g(/^\s*y\s*=\s*(-?\d+)/m) || 0), text });
  }
  return out;
}
/* 主树：relative_position_id 递归展开 */
const main = blocksOf('common/national_focus/IBR.txt', 'focus');
const byId = new Map(main.map(v => [v.id, v]));
const rpOf = (v) => { const m = /^\s*relative_position_id\s*=\s*([A-Za-z0-9_]+)/m.exec(v.text); return m ? m[1] : null; };
function absolute(v, seen) {
  seen = seen || new Set();
  const rp = rpOf(v);
  if (!rp || seen.has(rp) || !byId.has(rp)) return { x: v.x, y: v.y };
  seen.add(rp);
  const p = absolute(byId.get(rp), seen);
  return { x: p.x + v.x, y: p.y + v.y };
}
main.forEach(v => { const a = absolute(v); all.push({ id: v.id, x: a.x, y: a.y, kind: 'main' }); });
blocksOf('common/national_focus/IBR_military_shared.txt', 'shared_focus')
  .forEach(v => all.push({ id: v.id, x: v.x, y: v.y, kind: 'mil' }));
blocksOf('common/national_focus/IBR_political_shared.txt', 'shared_focus')
  .forEach(v => all.push({ id: v.id, x: v.x, y: v.y, kind: 'pol' }));
/* 发展度簇：基准位 + 本树的 offset */
blocksOf('common/national_focus/DEV_development_shared.txt', 'shared_focus').forEach(v => {
  const m = /offset\s*=\s*\{[^}]*?x\s*=\s*(-?\d+)[^}]*?y\s*=\s*(-?\d+)[^}]*?has_focus_tree\s*=\s*IBR_torch_of_iberia/.exec(v.text);
  if (m) all.push({ id: v.id, x: v.x + (+m[1]), y: v.y + (+m[2]), kind: 'dev' });
});
/* 撞格总检查（四区合并） */
const merged = new Map();
for (const p of all) {
  const k = p.x + ',' + p.y;
  if (merged.has(k)) problems.push(`整树撞格 ${k}: ${merged.get(k)} / ${p.id}`);
  else merged.set(k, p.id);
}

const COLORS = { main: ['#3b4c5e', '#c9b071'], mil: ['#394b3a', '#9fc08a'], dev: ['#4a3f56', '#c3a3d6'], pol: ['#5a3f3a', '#e8b07a'] };
const SX = 92, SY = 62, BW = 86, BH = 54, PAD = 60;
const ax0 = Math.min(...all.map(p => p.x)), ax1 = Math.max(...all.map(p => p.x));
const ay0 = Math.min(...all.map(p => p.y)), ay1 = Math.max(...all.map(p => p.y));
const W = (ax1 - ax0 + 1) * SX + PAD * 2, H = (ay1 - ay0 + 1) * SY + PAD * 2 + 40;
const px = x => PAD + (x - ax0) * SX + (SX - BW) / 2;
const py = y => PAD + 40 + (y - ay0) * SY;
const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Microsoft YaHei,Noto Sans CJK SC,sans-serif">`);
svg.push(`<rect width="${W}" height="${H}" fill="#141d26"/>`);
const posMap = new Map(NODES.map(v => [v.id, v]));
/* 连线（政治簇） */
for (const v of NODES) for (const blk of (v.pre || [])) for (const n of blk) {
  const p = byN.get(n);
  svg.push(`<line x1="${px(p.x) + BW / 2}" y1="${py(p.y) + BH}" x2="${px(v.x) + BW / 2}" y2="${py(v.y)}" stroke="#e8b07a" stroke-width="2"/>`);
}
for (const p of all) {
  const [fill, stroke] = COLORS[p.kind];
  svg.push(`<g><rect x="${px(p.x)}" y="${py(p.y)}" width="${BW}" height="${BH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
    `<text x="${px(p.x) + BW / 2}" y="${py(p.y) + BH / 2 + 4}" fill="#eef2f5" font-size="10" text-anchor="middle">${p.kind === 'pol' ? posMap.get(p.id).name : p.id.replace(/^IBR_|^DEV_/, '')}</text></g>`);
}
svg.push(`<text x="${PAD}" y="28" fill="#eef2f5" font-size="18" font-weight="bold">IBR_torch_of_iberia 全树排版（主树 / 军事簇 / 政治簇 / 发展度簇）</text>`);
const legend = [['main', '主树'], ['mil', '军事簇'], ['pol', '政治簇（本次新增）'], ['dev', '发展度簇']];
svg.push(legend.map(([k, t], i) =>
  `<rect x="${PAD + i * 250}" y="${H - 30}" width="18" height="12" fill="${COLORS[k][0]}" stroke="${COLORS[k][1]}"/><text x="${PAD + i * 250 + 24}" y="${H - 20}" fill="#cfdbe4" font-size="12">${t}</text>`).join(''));
svg.push('</svg>');
writeLf(path.join(ROOT, 'docs/_ibr_political_layout.svg'), svg.join('\n'));

/* ---------------- 报告 ---------------- */
console.log(`政治簇 ${NODES.length} 格 · x ${box.x0}..${box.x1} · y ${box.y0}..${box.y1} · 根 ${byN.get(1).id}(${byN.get(1).x},${byN.get(1).y})`);
console.log(`无前置：${rootish.map(v => v.n + ':' + v.id).join(', ')}`);
console.log('整树格数：' + all.length + '（主树 ' + main.length + ' / 军事 ' + blocksOf('common/national_focus/IBR_military_shared.txt', 'shared_focus').length +
  ' / 政治 ' + NODES.length + ' / 发展度 ' + all.filter(p => p.kind === 'dev').length + '）');
if (problems.length) { console.log('\n⚠ 问题 ' + problems.length + ' 条：'); problems.forEach(p => console.log('  - ' + p)); process.exitCode = 1; }
else console.log('✔ 校验通过：撞格 / 同排间距 / 前置方向 / 极值孤点 / 图标存在性 / 四区无重叠');

function writeLf(file, text) {
  fs.writeFileSync(file, text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'), 'utf8');
}
