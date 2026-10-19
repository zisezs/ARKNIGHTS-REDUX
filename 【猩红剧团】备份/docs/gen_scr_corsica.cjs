#!/usr/bin/env node
/**
 * 猩红剧团（SCR）「科西嘉线」共享国策树生成器
 *
 * 真源：
 *   docs/SCR_科西嘉线_设计/设计方案.txt    —— 78 格坐标 / 前置 / 互斥
 *   docs/SCR_科西嘉线_设计/国策名称.yml    —— 国策中文名
 *   docs/SCR_科西嘉线_设计/图标源/*.png    —— 用户提供的 12 张配图
 *
 * 产物：
 *   common/national_focus/SCR_corsica_shared.txt
 *   localisation/simp_chinese/ARF_SCR_corsica_l_simp_chinese.yml
 *   interface/_ARF_goals/SCR_corsica_goals.gfx
 *   gfx/interface/goals/SCR/SCR_corsica_<n>.png   （110x98，比标准 100x88 长宽各 +10）
 *
 * 并维护：
 *   common/national_focus/SCR.txt
 *     - 插入/刷新 shared_focus 引用块
 *     - 移除旧「第二次四皇会战」独立支线（10 格）
 *   localisation/simp_chinese/SCR_l_simp_chinese.yml
 *     - 移除旧支线的 10 条国策名/描述（保留动态修正与事件文本）
 *
 * 用法：
 *   NODE_PATH=E:/tmp/lud/node_modules node docs/gen_scr_corsica.cjs
 *   （图标缩放需要 sharp；文本产物不需要）
 *
 * 幂等：连跑两次，所有文本产物逐字节一致。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { REWARDS } = require('./scr_corsica_rewards.cjs');

const ROOT = path.resolve(__dirname, '..');
const DESIGN_DIR = path.join(ROOT, 'docs', 'SCR_科西嘉线_设计');
const OUT_FOCUS = path.join(ROOT, 'common', 'national_focus', 'SCR_corsica_shared.txt');
const OUT_LOC = path.join(ROOT, 'localisation', 'simp_chinese', 'ARF_SCR_corsica_l_simp_chinese.yml');
const OUT_GFX = path.join(ROOT, 'interface', '_ARF_goals', 'SCR_corsica_goals.gfx');
const OUT_ICON_TABLE = path.join(ROOT, 'docs', 'SCR_科西嘉线_幕布图标表.md');
const ICON_DIR = path.join(ROOT, 'gfx', 'interface', 'goals', 'SCR');
const PARENT_TREE = path.join(ROOT, 'common', 'national_focus', 'SCR.txt');
const PARENT_LOC = path.join(ROOT, 'localisation', 'simp_chinese', 'SCR_l_simp_chinese.yml');
const DEV_SHARED = path.join(ROOT, 'common', 'national_focus', 'DEV_development_shared.txt');

// 整棵树相对设计坐标的平移：落在原树包围盒（x -1..35，y 0..7）正下方、水平居中。
const SHIFT_X = 6;
const SHIFT_Y = 11;
const ID_PREFIX = 'SCR_corsica_';
const ICON_W = 110;
const ICON_H = 98;

// 配图 → 节点编号。按图片里的实际题字匹配，而不是照文件名硬套：
//   「筹备第二次四皇会战.png」里画的是「颂乐人偶」，因此给 63 号「颂乐人偶」；
//   「进攻维多利亚.png」给 9 号「筹备第二次四皇会战」作战争意象；
//   「攻占伦蒂尼姆.png」给 10 号「维多利亚之崩溃」。
const ICON_ASSIGN = {
  1: '璀璨焦土',
  2: '唤起国家认同',
  3: '唤醒民族意识',
  4: '废土求生手册',
  5: '废土自卫指南',
  6: '清除敌国密探',
  7: '重建信使体系',
  8: '高卢啊我已归来',
  9: '进攻维多利亚',
  10: '攻占伦蒂尼姆',
  11: '进攻莱塔尼亚',
  63: '筹备第二次四皇会战',
};

// 没有专属配图的 66 格：四种幕布 + 红蓝交汇。
// style: red=红色剧场（卢西恩政治线）/ blue=蓝色罗马（科西嘉莉政治线）
//        grey=灰色铁血（军事线）/ gold=金色麦穗（经济线）/ special=红蓝交汇
// lines: 幕布中央的法语花体字（1~2 行）
const CURTAIN_ICONS = {
  // 经济线 · 金色麦穗
  12: { style: 'gold', lines: ['LINGONS'] },
  13: { style: 'gold', lines: ['NOUVELLE', 'POUSSE'] },
  14: { style: 'gold', lines: ['FEU', 'RANIMÉ'] },
  15: { style: 'gold', lines: ['ÉCONOMIE', 'NOUVELLE'] },
  16: { style: 'gold', lines: ['VILLES', 'MOBILES'] },
  17: { style: 'gold', lines: ['CUIRASSÉS'] },
  18: { style: 'gold', lines: ['BLÉ &', 'RUINES'] },
  19: { style: 'gold', lines: ['OPÉRA &', 'SANG'] },
  20: { style: 'gold', lines: ['AURORE'] },
  21: { style: 'gold', lines: ['LOGISTIQUE'] },
  22: { style: 'gold', lines: ['ORIGINIUM'] },
  23: { style: 'gold', lines: ['PAIN &', 'POUDRE'] },
  24: { style: 'gold', lines: ['SOIE &', 'ACIER'] },
  25: { style: 'gold', lines: ['SOLEIL', 'ARDENT'] },
  26: { style: 'gold', lines: ['HORIZON'] },
  27: { style: 'gold', lines: ['FRÈRES', 'INFECTÉS'] },
  28: { style: 'gold', lines: ['ATELIERS'] },
  29: { style: 'gold', lines: ['RAYONNEZ'] },
  30: { style: 'gold', lines: ['SURCHARGE'] },
  31: { style: 'gold', lines: ['MOBILISATION'] },
  32: { style: 'gold', lines: ['LEVÉE'] },
  33: { style: 'gold', lines: ['MACHINE', 'DE GUERRE'] },
  72: { style: 'gold', lines: ['ÉCONOMIE', 'DE GUERRE'] },
  73: { style: 'gold', lines: ['SPÉCULATEURS'] },
  74: { style: 'gold', lines: ['SACRIFICE'] },

  // 卢西恩政治线 · 红色剧场（用户点名 34/36/38/40）
  34: { style: 'red', lines: ['TOURNÉE'] },
  36: { style: 'red', lines: ['NOUVELLE', 'GAULE'] },
  38: { style: 'red', lines: ['OBJECTION'] },
  40: { style: 'red', lines: ['GAULE !'] },

  // 科西嘉莉政治线 · 蓝色罗马（34~42 中与红色交替的 35/37/39/41）
  35: { style: 'blue', lines: ['ACTION'] },
  37: { style: 'blue', lines: ['NOBLESSE'] },
  39: { style: 'blue', lines: ['CONSENSUS'] },
  41: { style: 'blue', lines: ['DOUTE'] },

  // 和声 · 红蓝交汇
  42: { style: 'special', lines: ['HARMONIE'] },

  // 军事线 · 灰色铁血
  44: { style: 'grey', lines: ['CONSEIL', 'DE GUERRE'] },
  45: { style: 'grey', lines: ['ÉCARLATE'] },
  46: { style: 'grey', lines: ['HONNEUR'] },
  47: { style: 'grey', lines: ['MOTEURS'] },
  48: { style: 'grey', lines: ['OMBRE &', 'LAME'] },
  49: { style: 'grey', lines: ['SPECTRE'] },
  50: { style: 'grey', lines: ['REQUIEM'] },
  51: { style: 'grey', lines: ['TACTIQUE'] },
  52: { style: 'grey', lines: ['FRAPPE', 'VITALE'] },
  53: { style: 'grey', lines: ['RAID', 'NOCTURNE'] },
  54: { style: 'grey', lines: ['ACIER &', 'POUDRE'] },
  55: { style: 'grey', lines: ['MARINE'] },
  56: { style: 'grey', lines: ['TONNERRE'] },
  57: { style: 'grey', lines: ['VIEILLE', 'GARDE'] },
  58: { style: 'grey', lines: ['SANS', 'MERCI'] },
  59: { style: 'grey', lines: ['AMIRAL'] },
  60: { style: 'grey', lines: ['ESCADRE'] },
  61: { style: 'grey', lines: ['EXPÉRIENCE'] },
  62: { style: 'grey', lines: ['DÉFILÉ'] },
  64: { style: 'grey', lines: ['GARDE'] },
  65: { style: 'grey', lines: ['IRRÉVERSIBLE'] },
  66: { style: 'grey', lines: ['SPECTRE &', 'DRAGON'] },
  67: { style: 'grey', lines: ['CHEVALIER', '& MAGE'] },
  68: { style: 'grey', lines: ['PROCLAMATION'] },
  69: { style: 'grey', lines: ['EN AVANT'] },
  70: { style: 'grey', lines: ['MANŒUVRES'] },
  71: { style: 'grey', lines: ["JUSQU'AU", 'BOUT'] },
  76: { style: 'grey', lines: ['ALLIANCE'] },
  77: { style: 'grey', lines: ['ORLÉANS'] },
  78: { style: 'grey', lines: ['BASTION'] },
  79: { style: 'grey', lines: ['AGITATION'] },
  80: { style: 'grey', lines: ['QUATRE', 'EMPEREURS'] },
};

const CURTAIN_DIR = path.join(DESIGN_DIR, '幕布');
const CURTAIN_FRAMES = {
  red: 'red_theatre.png',
  blue: 'blue_roman.png',
  grey: 'grey_iron.png',
  gold: 'gold_wheat.png',
  special: 'red_blue.png',
};

const CURTAIN_STYLE = {
  red: { fill: '#f6e2b0', stroke: '#1a0d06', accent: '#d4af5a' },
  blue: { fill: '#f4e7c4', stroke: '#0a1220', accent: '#d4af5a' },
  grey: { fill: '#e9edf0', stroke: '#0a0c0e', accent: '#9aa6ae' },
  gold: { fill: '#ffe6a6', stroke: '#241405', accent: '#b07a2a' },
  special: { fill: '#f7e8c8', stroke: '#120a12', accent: '#d4af5a' },
};
const CURTAIN_STYLE_CN = {
  red: '红色剧场',
  blue: '蓝色罗马',
  grey: '灰色铁血',
  gold: '金色麦穗',
  special: '红蓝交汇',
};

function hasIcon(num) {
  return Boolean(ICON_ASSIGN[num] || CURTAIN_ICONS[num]);
}

const OLD_WAR_IDS = [
  'SCR_second_war_of_four_emperors',
  'SCR_old_guard_reformed',
  'SCR_citizens_take_arms',
  'SCR_sing_troupe_eagle',
  'SCR_originium_furnace_faster',
  'SCR_infected_come_here',
  'SCR_everyone_drink_originium',
  'SCR_gaul_no_retreat',
  'SCR_lingones_we_stay',
  'SCR_dream_of_scorched_earth',
];

const DEV_MARK = '\t# ---- 发展度共享国策树（DEV）shared_focus 引用 自动生成 起 ----';
const INC_START = '\t# ---- 【科西嘉线】shared_focus 引用 自动生成 起 ----';
const INC_END = '\t# ---- 【科西嘉线】shared_focus 引用 自动生成 止 ----';
const OLD_WAR_COMMENT =
  '\t########################################################################\n' +
  '\t# 独立支线树「第二次四皇会战」— 战时终幕（x 10-18，y 10-15）';

const OLD_LOC_HEADER =
  ' ########################\n' +
  ' # 独立支线：第二次四皇会战（战时终幕）\n' +
  ' ########################\n';

function read(rel) {
  return fs.readFileSync(rel, 'utf8');
}

function put(rel, bufOrString, backups) {
  const buf = Buffer.isBuffer(bufOrString) ? bufOrString : Buffer.from(bufOrString, 'utf8');
  if (fs.existsSync(rel)) {
    const old = fs.readFileSync(rel);
    if (old.equals(buf)) return false;
    if (backups) {
      fs.mkdirSync(backups, { recursive: true });
      const name = path.relative(ROOT, rel).replace(/[\\/]/g, '__');
      fs.writeFileSync(path.join(backups, name), old);
    }
  }
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  fs.writeFileSync(rel, buf);
  return true;
}

// ---------- 1. 读取设计 ----------

function parseDesign() {
  const src = read(path.join(DESIGN_DIR, '设计方案.txt'));
  const blocks = [];
  const re = /\tfocus = \{\n([\s\S]*?)\n\t\}\n/g;
  let m;
  while ((m = re.exec(src))) {
    const body = m[1];
    const id = (body.match(/^\t\tid = (NEW_focus_\d+)$/m) || [])[1];
    if (!id) continue;
    const num = Number(id.replace('NEW_focus_', ''));
    const x = Number((body.match(/^\t\tx = (-?\d+)$/m) || [])[1]);
    const y = Number((body.match(/^\t\ty = (-?\d+)$/m) || [])[1]);
    const cost = Number((body.match(/^\t\tcost = (-?\d+)$/m) || [])[1]);
    // 一个 prerequisite 块里的多个 focus = OR；多个 prerequisite 块 = AND。
    // 保留分组，才能让「覆水难收」这种“任意一个前置即可”的国策正确输出。
    const prereqGroups = [...body.matchAll(/prerequisite = \{\n([\s\S]*?)\n\t\t\}/g)].map((mm) =>
      [...mm[1].matchAll(/focus = (NEW_focus_\d+)/g)].map((x) => Number(x[1].replace('NEW_focus_', '')))
    );
    const prereq = prereqGroups.flat();
    const mutex = [...body.matchAll(/mutually_exclusive = \{\n\t\t\tfocus = (NEW_focus_\d+)\n\t\t\}/g)].map(
      (mm) => Number(mm[1].replace('NEW_focus_', ''))
    );
    blocks.push({ num, x, y, cost, prereq, prereqGroups, mutex });
  }
  blocks.sort((a, b) => a.num - b.num);
  if (blocks.length !== 78) throw new Error(`设计方案解析到 ${blocks.length} 格，预期 78 格`);
  const nums = new Set(blocks.map((b) => b.num));
  for (const b of blocks) {
    for (const p of b.prereq) if (!nums.has(p)) throw new Error(`前置 ${p} 不存在（${b.num}）`);
    for (const p of b.mutex) if (!nums.has(p)) throw new Error(`互斥 ${p} 不存在（${b.num}）`);
  }
  return blocks;
}

function parseNames() {
  const src = read(path.join(DESIGN_DIR, '国策名称.yml'));
  const names = {};
  for (const m of src.matchAll(/^\s*NEW_focus_(\d+):\s*"([^"]*)"/gm)) {
    names[Number(m[1])] = m[2];
  }
  return names;
}

// ---------- 2. 生成共享国策 ----------

function buildShared(blocks, names) {
  const head = [
    '######################################################',
    '# 猩红剧团（SCR）「科西嘉线」共享国策树',
    '# 78 格 · 父树 SCR_tree_initial 内逐行 shared_focus 引用',
    '# 图标：12 格专属配图 + 66 格四种幕布/红蓝交汇法语花体字',
    '# 坐标整体平移：x +' + SHIFT_X + ' / y +' + SHIFT_Y,
    '# 落点：原国策树包围盒（x -1..35，y 0..7）正下方，水平居中',
    '# 真源：docs/SCR_科西嘉线_设计/设计方案.txt / 国策名称.yml',
    '# 生成器：docs/gen_scr_corsica.cjs（勿手改本文件）',
    '######################################################',
    '',
  ].join('\n');

  const body = blocks
    .map((b) => {
      const id = ID_PREFIX + b.num;
      const icon = hasIcon(b.num) ? `GFX_focus_${id}` : 'GFX_goal_generic_national_unity';
      const lines = [
        'shared_focus = {',
        `\tid = ${id}`,
        `\ticon = ${icon}`,
        `\tx = ${b.x + SHIFT_X}`,
        `\ty = ${b.y + SHIFT_Y}`,
        `\tcost = ${Number.isFinite(b.cost) ? b.cost : 4}`,
      ];
      for (const group of b.prereqGroups) {
        lines.push('\tprerequisite = {');
        for (const p of group) lines.push(`\t\tfocus = ${ID_PREFIX + p}`);
        lines.push('\t}');
      }
      if (b.mutex.length) {
        lines.push('\tmutually_exclusive = {', `\t\tfocus = ${ID_PREFIX + b.mutex[0]}`, '\t}');
      }
      const reward = REWARDS[b.num];
      if (!reward || !reward.length) throw new Error(`国策 ${b.num} 缺少 completion_reward 设计`);
      lines.push('\tcompletion_reward = {');
      for (const eff of reward) lines.push('\t\t' + eff);
      lines.push('\t}');
      lines.push('\tai_will_do = {', '\t\tfactor = 1', '\t}', '}', '');
      return lines.join('\n');
    })
    .join('\n');

  return head + body;
}

function buildLoc(blocks, names) {
  const head = [
    '\uFEFFl_simp_chinese:',
    '',
    ' # 猩红剧团（SCR）「科西嘉线」共享国策树 · 国策名称',
    ' # 生成器：docs/gen_scr_corsica.cjs（勿手改本文件）',
    '',
  ].join('\n');
  const lines = blocks.map((b) => ` ${ID_PREFIX + b.num}: "${names[b.num] || ID_PREFIX + b.num}"`);
  return head + lines.join('\n') + '\n';
}

function buildGfx(blocks) {
  const head = [
    '# 猩红剧团（SCR）「科西嘉线」国策图标注册 —— 110x98 PNG（标准 100x88，长宽各 +10）',
    '# 12 张专属配图 + 66 张四种幕布/红蓝交汇法语花体字，共 78 张',
    '# 生成器：docs/gen_scr_corsica.cjs（勿手改）',
    'spriteTypes = {',
  ];
  const lines = blocks
    .filter((b) => hasIcon(b.num))
    .map(
      (b) =>
        `\tSpriteType = { name = "GFX_focus_${ID_PREFIX + b.num}"  texturefile = "gfx/interface/goals/SCR/${ID_PREFIX + b.num}.png"  transparencecheck = yes  legacy_lazy_load = no }`
    );
  return head.concat(lines, ['}', '']).join('\n');
}

// ---------- 3. 改父树 ----------

function patchParentTree() {
  let text = read(PARENT_TREE);
  const before = text;

  // 3.1 移除旧「第二次四皇会战」独立支线
  const oldStart = text.indexOf(OLD_WAR_COMMENT);
  if (oldStart >= 0) {
    const oldEnd = text.indexOf(DEV_MARK, oldStart);
    if (oldEnd < 0) throw new Error('找不到 DEV 引用块起点，拒绝删除旧支线');
    const region = text.slice(oldStart, oldEnd);
    for (const id of OLD_WAR_IDS) {
      if (!region.includes(`id = ${id}`)) throw new Error(`旧支线区段里找不到 ${id}，拒绝删除`);
    }
    text = text.slice(0, oldStart) + text.slice(oldEnd);
    console.log(`  - 已移除旧「第二次四皇会战」支线（${OLD_WAR_IDS.length} 格）`);
  }

  // 3.2 刷新 shared_focus 引用块
  const incBlockRe = new RegExp(
    INC_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + INC_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\n?'
  );
  text = text.replace(incBlockRe, '');

  const blocks = parseDesign();
  const incLines = blocks.map((b) => `\tshared_focus = ${ID_PREFIX + b.num}`).join('\n');
  const incBlock = `${INC_START}\n${incLines}\n${INC_END}\n`;

  let at = text.indexOf(DEV_MARK);
  if (at < 0) {
    at = text.lastIndexOf('\n}');
    if (at < 0) throw new Error('找不到 focus_tree 结尾，无法插入引用块');
    at += 1; // 保留换行
  }
  text = text.slice(0, at) + incBlock + text.slice(at);

  if (text !== before) put(PARENT_TREE, text, path.join(ROOT, 'docs', 'SCR_科西嘉线_备份'));
  console.log(`  - 已写入 ${blocks.length} 条 shared_focus 引用`);
}

// ---------- 3.5 把 SCR 的发展度共享树（DEV）让到新树下面 ----------
// DEV 原本落在 SCR 树包围盒底线 +2 行（offset x 13..21 / y 17..21）；
// 新「科西嘉线」占 y 9..20、x 5..29，会与 DEV 重叠。整块下移 6 行到 y 23..27。
function patchDevOffset() {
  let text = read(DEV_SHARED);
  const before = text;
  const re =
    /\toffset = \{\n\t\tx = (-?\d+)\n\t\ty = (-?\d+)\n\t\ttrigger = \{\n\t\t\thas_focus_tree = SCR_tree_initial\n\t\t\}\n\t\}/g;
  let total = 0;
  let moved = 0;
  text = text.replace(re, (m, x, y) => {
    total++;
    const yy = Number(y);
    if (yy >= 17 && yy <= 21) {
      moved++;
      return `\toffset = {\n\t\tx = ${x}\n\t\ty = ${yy + 6}\n\t\ttrigger = {\n\t\t\thas_focus_tree = SCR_tree_initial\n\t\t}\n\t}`;
    }
    return m;
  });
  if (total !== 25) throw new Error(`DEV 的 SCR offset 解析到 ${total} 条，预期 25 条`);
  if (moved !== 0 && moved !== 25) throw new Error(`DEV 的 SCR offset 只移动了 ${moved}/25 条，拒绝写入`);
  if (text !== before) {
    put(DEV_SHARED, text, path.join(ROOT, 'docs', 'SCR_科西嘉线_备份'));
    console.log('  - 已将 SCR 的 DEV 发展度树从 y 17..21 下移到 y 23..27');
  }
}

// ---------- 4. 改父本地化 ----------

function patchParentLoc() {
  let text = read(PARENT_LOC);
  const before = text;
  const start = text.indexOf(OLD_LOC_HEADER);
  if (start >= 0) {
    const end = text.indexOf(' SCR_dyn_gaul_gaul:', start);
    if (end < 0) throw new Error('找不到 SCR_dyn_gaul_gaul，拒绝删除旧支线 loc');
    const region = text.slice(start, end);
    for (const id of OLD_WAR_IDS) {
      if (!region.includes(` ${id}:`)) throw new Error(`旧支线 loc 区段里找不到 ${id}，拒绝删除`);
    }
    text = text.slice(0, start) + text.slice(end);
    console.log('  - 已移除旧支线 10 条国策名/描述');
  }
  if (text !== before) put(PARENT_LOC, text, path.join(ROOT, 'docs', 'SCR_科西嘉线_备份'));
}

// ---------- 5. 图标 ----------

async function makeCurtainIcon(sharp, num, spec) {
  const framePath = path.join(CURTAIN_DIR, CURTAIN_FRAMES[spec.style]);
  if (!fs.existsSync(framePath)) throw new Error(`幕布底图缺失：${framePath}`);
  const frame = await sharp(framePath)
    .resize(ICON_W, ICON_H, { fit: 'cover', position: 'centre' })
    .ensureAlpha()
    .toBuffer();

  const style = CURTAIN_STYLE[spec.style];
  const lines = spec.lines;
  const maxLineLen = Math.max(...lines.map((l) => l.length));
  let fontSize = lines.length === 1 ? 24 : 18;
  const maxTextW = ICON_W * 0.64;
  const est = maxLineLen * fontSize * 0.56;
  if (est > maxTextW) fontSize = Math.max(9, Math.floor(maxTextW / (maxLineLen * 0.56)));
  const lineGap = fontSize * 1.12;
  const totalH = (lines.length - 1) * lineGap;
  const centerY = ICON_H * 0.46;
  const texts = lines
    .map((line, i) => {
      const y = centerY - totalH / 2 + i * lineGap;
      const safe = line.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<text x="${ICON_W / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Segoe Script" font-size="${fontSize}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${Math.max(0.6, fontSize * 0.06)}" paint-order="stroke">${safe}</text>`;
    })
    .join('\n');
  const lineY = centerY + totalH / 2 + fontSize * 0.95;
  const lineHalf = ICON_W * 0.13;

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_W}" height="${ICON_H}">` +
      `<rect x="${ICON_W * 0.17}" y="${ICON_H * 0.18}" width="${ICON_W * 0.66}" height="${ICON_H * 0.6}" rx="3" fill="rgba(0,0,0,0.42)"/>` +
      texts +
      `<line x1="${ICON_W / 2 - lineHalf}" y1="${lineY}" x2="${ICON_W / 2 + lineHalf}" y2="${lineY}" stroke="${style.accent}" stroke-width="1" opacity="0.9"/>` +
      `</svg>`
  );

  return sharp(frame).composite([{ input: svg }]).png({ compressionLevel: 9 }).toBuffer();
}

async function installIcons() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.warn('  ! 未找到 sharp，跳过图标缩放。请用 NODE_PATH=E:/tmp/lud/node_modules 运行。');
    return 0;
  }
  const backup = path.join(ROOT, 'docs', 'SCR_科西嘉线_备份', 'icons');
  let n = 0;
  for (const [num, srcName] of Object.entries(ICON_ASSIGN)) {
    const src = path.join(DESIGN_DIR, '图标源', srcName + '.png');
    if (!fs.existsSync(src)) throw new Error(`图标源缺失：${src}`);
    const out = path.join(ICON_DIR, `${ID_PREFIX + num}.png`);
    const buf = await sharp(src)
      .ensureAlpha()
      .resize(ICON_W, ICON_H, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    if (put(out, buf, backup)) n++;
  }
  for (const [num, spec] of Object.entries(CURTAIN_ICONS)) {
    const out = path.join(ICON_DIR, `${ID_PREFIX + num}.png`);
    const buf = await makeCurtainIcon(sharp, Number(num), spec);
    if (put(out, buf, backup)) n++;
  }
  return n;
}

function buildIconTable(names) {
  const rows = Object.entries(CURTAIN_ICONS)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(
      ([num, spec]) =>
        `| ${num} | ${names[num] || ''} | ${CURTAIN_STYLE_CN[spec.style]} | ${spec.lines.join(' / ')} |`
    );
  return [
    '# 猩红剧团「科西嘉线」幕布图标表',
    '',
    '66 格没有专属配图的国策，使用四种幕布 + 红蓝交汇，中央填法语花体字。',
    '',
    '| 节点 | 国策 | 幕布 | 法语花体字 |',
    '|---:|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

// ---------- main ----------

(async () => {
  console.log('猩红剧团「科西嘉线」共享国策树');
  const blocks = parseDesign();
  const names = parseNames();
  const missing = blocks.filter((b) => !names[b.num]);
  if (missing.length) throw new Error(`缺少国策名：${missing.map((b) => b.num).join(', ')}`);

  const backup = path.join(ROOT, 'docs', 'SCR_科西嘉线_备份');
  put(OUT_FOCUS, buildShared(blocks, names), backup);
  put(OUT_LOC, buildLoc(blocks, names), backup);
  put(OUT_GFX, buildGfx(blocks), backup);
  put(OUT_ICON_TABLE, buildIconTable(names), backup);
  patchParentTree();
  patchParentLoc();
  patchDevOffset();
  const iconCount = await installIcons();

  console.log(
    `  - 共享国策 ${blocks.length} 格 / 专属配图 ${Object.keys(ICON_ASSIGN).length} 张 + 幕布花体字 ${Object.keys(CURTAIN_ICONS).length} 张（新写入 ${iconCount}）`
  );
  console.log('完成。');
})().catch((e) => {
  console.error('失败：' + e.message);
  process.exit(1);
});
