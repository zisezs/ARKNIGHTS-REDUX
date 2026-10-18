#!/usr/bin/env node
/**
 * 猩红剧团（SCR）「转线」小国策树 —— 6 格，放在科西嘉线政治簇左边
 *
 * - 使用废弃的「不够蓝」蓝罗马边框 + 法语艺术字
 * - 坐标：设计稿 NEW_focus_81..86 平移 x+6 / y+11 后为 x 1..3 / y 9..12，
 *   正好在政治簇（x>=5）左侧、原旧树（y<=7）下方，不越出既有面板范围。
 * - 6 格只有名称/前置，没有效果（与设计稿一致）。
 *
 * 产物：
 *   common/national_focus/SCR_switch_shared.txt
 *   interface/_ARF_goals/SCR_switch_goals.gfx
 *   localisation/simp_chinese/ARF_SCR_switch_l_simp_chinese.yml
 *   gfx/interface/goals/SCR/SCR_switch_*.png (110x98)
 *   SCR.txt 内的 shared_focus 引用块
 *
 * 用法：NODE_PATH=E:/tmp/lud/node_modules node docs/gen_scr_switch.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { SWITCH_REWARDS } = require('./scr_corsica_rewards.cjs');

const ROOT = path.resolve(__dirname, '..');
const FRAME = path.join(ROOT, 'docs/SCR_科西嘉线_设计/幕布/blue_roman_old.png');
const OUT_FOCUS = path.join(ROOT, 'common/national_focus/SCR_switch_shared.txt');
const OUT_GFX = path.join(ROOT, 'interface/_ARF_goals/SCR_switch_goals.gfx');
const OUT_LOC = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_switch_l_simp_chinese.yml');
const ICON_DIR = path.join(ROOT, 'gfx/interface/goals/SCR');
const PARENT = path.join(ROOT, 'common/national_focus/SCR.txt');
const BACKUP = path.join(ROOT, 'docs/SCR_转线树_备份');
const PREVIEW = path.join(ROOT, 'docs/SCR_转线树_预览.png');

const INC_START = '\t# ---- 【转线树】shared_focus 引用 自动生成 起 ----';
const INC_END = '\t# ---- 【转线树】shared_focus 引用 自动生成 止 ----';
const DEV_MARK = '\t# ---- 发展度共享国策树（DEV）shared_focus 引用 自动生成 起 ----';

const W = 110;
const H = 98;

// n = 设计稿 NEW_focus_81..86；x/y 已按科西嘉线整体平移 +6/+11
const FOCUS = [
  { n: 1, x: 2, y: 9, name: '剧团长的审美疲劳', lines: ['FATIGUE'], prereq: [] },
  { n: 2, x: 1, y: 10, name: '猩红孤钻意犹未尽...', lines: ['ENCORE'], prereq: [1] },
  { n: 3, x: 3, y: 10, name: '世界之都的倒影...', lines: ['MIROIR'], prereq: [1] },
  { n: 4, x: 3, y: 11, name: '长生者的禁忌技艺', lines: ['INTERDIT'], prereq: [3] },
  { n: 5, x: 1, y: 11, name: '男主角，女主角', lines: ['ACTEURS'], prereq: [2] },
  { n: 6, x: 2, y: 12, name: '新剧目《皇女复国记》！', lines: ['PRINCESSE'], prereq: [4, 5] },
];

const ID = (n) => `SCR_switch_${n}`;
const GFX = (n) => `GFX_focus_SCR_switch_${n}`;

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function put(rel, content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  if (fs.existsSync(rel)) {
    const old = fs.readFileSync(rel);
    if (old.equals(buf)) return false;
    fs.mkdirSync(BACKUP, { recursive: true });
    fs.writeFileSync(path.join(BACKUP, path.relative(ROOT, rel).replace(/[\\/]/g, '__')), old);
  }
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  fs.writeFileSync(rel, buf);
  return true;
}

function buildFocusFile() {
  const head = [
    '######################################################',
    '# 猩红剧团（SCR）「转线」小国策树',
    '# 6 格 · 位于科西嘉线政治簇左侧（x 1..3 / y 9..12）',
    '# 图标：废弃蓝罗马边框 + 法语艺术字（与民族精神同一套边框）',
    '# 生成器：docs/gen_scr_switch.cjs（勿手改本文件）',
    '######################################################',
    '',
  ].join('\n');
  const body = FOCUS.map((f) => {
    const lines = [
      'shared_focus = {',
      `\tid = ${ID(f.n)}`,
      `\ticon = ${GFX(f.n)}`,
      `\tx = ${f.x}`,
      `\ty = ${f.y}`,
      '\tcost = 5',
    ];
    for (const p of f.prereq) {
      lines.push('\tprerequisite = {', `\t\tfocus = ${ID(p)}`, '\t}');
    }
    const reward = SWITCH_REWARDS[f.n];
    if (!reward || !reward.length) throw new Error(`转线国策 ${f.n} 缺少 completion_reward 设计`);
    lines.push('\tcompletion_reward = {');
    for (const eff of reward) lines.push('\t\t' + eff);
    lines.push('\t}');
    lines.push('\tai_will_do = {', '\t\tfactor = 1', '\t}', '}', '');
    return lines.join('\n');
  }).join('\n');
  return head + body;
}

function buildGfx() {
  const head = [
    '# 猩红剧团（SCR）「转线」小国策树图标注册 —— 110x98 PNG',
    '# 废弃蓝罗马边框 + 法语艺术字',
    '# 生成器：docs/gen_scr_switch.cjs（勿手改）',
    'spriteTypes = {',
  ];
  const lines = FOCUS.map(
    (f) =>
      `\tSpriteType = { name = "${GFX(f.n)}"  texturefile = "gfx/interface/goals/SCR/${ID(f.n)}.png"  transparencecheck = yes  legacy_lazy_load = no }`
  );
  return head.concat(lines, ['}', '']).join('\n');
}

function buildLoc() {
  return [
    '\uFEFFl_simp_chinese:',
    '',
    ' # 猩红剧团（SCR）「转线」小国策树',
    ' # 生成器：docs/gen_scr_switch.cjs（勿手改本文件）',
    ...FOCUS.map((f) => ` ${ID(f.n)}: "${f.name}"`),
    '',
  ].join('\n');
}

function patchParent() {
  let text = read(PARENT);
  const before = text;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  text = text.replace(new RegExp(esc(INC_START) + '[\\s\\S]*?' + esc(INC_END) + '\\n?', 'g'), '');

  const block =
    INC_START + '\n' + FOCUS.map((f) => `\tshared_focus = ${ID(f.n)}`).join('\n') + '\n' + INC_END + '\n';
  let at = text.indexOf(DEV_MARK);
  if (at < 0) {
    at = text.lastIndexOf('\n}');
    if (at < 0) throw new Error('找不到 focus_tree 结尾');
    at += 1;
  }
  text = text.slice(0, at) + block + text.slice(at);
  if (text !== before) put(PARENT, text);
}

async function makeIcon(sharp, lines) {
  const frame = await sharp(FRAME).resize(W, H, { fit: 'cover', position: 'centre' }).ensureAlpha().toBuffer();
  const maxLineLen = Math.max(...lines.map((l) => l.length));
  let fontSize = lines.length === 1 ? 22 : 17;
  const maxTextW = W * 0.64;
  if (maxLineLen * fontSize * 0.56 > maxTextW) {
    fontSize = Math.max(9, Math.floor(maxTextW / (maxLineLen * 0.56)));
  }
  const gap = fontSize * 1.12;
  const totalH = (lines.length - 1) * gap;
  const centerY = H * 0.46;
  const texts = lines
    .map((line, i) => {
      const y = centerY - totalH / 2 + i * gap;
      const safe = line.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Segoe Script" font-size="${fontSize}" fill="#f4e7c4" stroke="#0a1220" stroke-width="${Math.max(0.6, fontSize * 0.06)}" paint-order="stroke">${safe}</text>`;
    })
    .join('\n');
  const lineY = centerY + totalH / 2 + fontSize * 0.95;
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
      `<rect x="${W * 0.17}" y="${H * 0.18}" width="${W * 0.66}" height="${H * 0.6}" rx="3" fill="rgba(0,0,0,0.45)"/>` +
      texts +
      `<line x1="${W / 2 - 14}" y1="${lineY}" x2="${W / 2 + 14}" y2="${lineY}" stroke="#d4af5a" stroke-width="1" opacity="0.9"/>` +
      `</svg>`
  );
  return sharp(frame).composite([{ input: svg }]).png({ compressionLevel: 9 }).toBuffer();
}

async function installIcons() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.warn('  ! 未找到 sharp，跳过图标生成。');
    return 0;
  }
  let n = 0;
  for (const f of FOCUS) {
    const buf = await makeIcon(sharp, f.lines);
    if (put(path.join(ICON_DIR, `${ID(f.n)}.png`), buf)) n++;
  }
  return n;
}

async function makePreview() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    return;
  }
  const minX = Math.min(...FOCUS.map((f) => f.x));
  const maxX = Math.max(...FOCUS.map((f) => f.x));
  const minY = Math.min(...FOCUS.map((f) => f.y));
  const maxY = Math.max(...FOCUS.map((f) => f.y));
  const DX = 126;
  const DY = 132;
  const M = 40;
  const cw = (maxX - minX + 1) * DX + M * 2;
  const ch = (maxY - minY + 1) * DY + M * 2;
  const cx = (x) => M + (x - minX) * DX + DX / 2;
  const cy = (y) => M + (y - minY) * DY + DY / 2;
  const icons = [];
  for (const f of FOCUS) {
    const buf = await sharp(path.join(ICON_DIR, `${ID(f.n)}.png`)).resize(110, 98).toBuffer();
    icons.push({ input: buf, left: cx(f.x) - 55, top: cy(f.y) - 49 });
  }
  const lines = [];
  for (const f of FOCUS) {
    for (const p of f.prereq) {
      const q = FOCUS.find((v) => v.n === p);
      lines.push(
        `<line x1="${cx(q.x)}" y1="${cy(q.y) + 49}" x2="${cx(f.x)}" y2="${cy(f.y) - 49}" stroke="#8a7a58" stroke-width="2"/>`
      );
    }
  }
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}"><rect width="${cw}" height="${ch}" fill="#f4f1e8"/>${lines.join('')}</svg>`
  );
  await sharp(svg).composite(icons).png().toFile(PREVIEW);
}

(async () => {
  if (!fs.existsSync(FRAME)) throw new Error(`废弃蓝框缺失：${FRAME}`);
  put(OUT_FOCUS, buildFocusFile());
  put(OUT_GFX, buildGfx());
  put(OUT_LOC, buildLoc());
  patchParent();
  const n = await installIcons();
  await makePreview();
  console.log(`  - 转线树 6 格 / 图标新写入 ${n}`);
  console.log(`  - 预览：${path.relative(ROOT, PREVIEW)}`);
})().catch((e) => {
  console.error('失败：' + e.message);
  process.exit(1);
});
