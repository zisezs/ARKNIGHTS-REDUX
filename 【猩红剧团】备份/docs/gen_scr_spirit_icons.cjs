#!/usr/bin/env node
/**
 * 猩红剧团（SCR）民族精神图标重制 —— 「废弃蓝罗马边框」+ 法语艺术字
 *
 * 只处理 interface/ideas/SCR_ideas.gfx 里标注 60x60 的 31 条国家精神；
 * 32x32 的州级修正不动。
 *
 * 用法：NODE_PATH=E:/tmp/lud/node_modules node docs/gen_scr_spirit_icons.cjs
 * 幂等：连跑两次逐字节一致；覆盖前备份到 docs/SCR_民族精神_备份/。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GFX = path.join(ROOT, 'interface/ideas/SCR_ideas.gfx');
const FRAME = path.join(ROOT, 'docs/SCR_科西嘉线_设计/幕布/blue_roman_old.png');
const FRAME_DIR = path.join(ROOT, 'docs/SCR_科西嘉线_设计/幕布');
const TEMP_FRAME = 'temporary_silver.png';

// 8 个可见常驻精神按分类着色（单色 tint，保留金属纹理）
const PERMANENT = {
  // 政治 / 领导：金色
  SCR_dyn_leadership: { tint: '#d4a63a', text: '#fff4d0', stroke: '#2a1a05', accent: '#ffe08a' },
  // 控制 / 情报：紫色
  SCR_dyn_control: { tint: '#8e5bd8', text: '#f0e0ff', stroke: '#1a0a2a', accent: '#c9a0ff' },
  // 旧树陆军：猩红
  SCR_dyn_army: { tint: '#c84040', text: '#ffe0d0', stroke: '#2a0505', accent: '#ff8a70' },
  // 旧树经济 / 重建：翠绿
  SCR_dyn_rebuild: { tint: '#3f9e58', text: '#e0ffe0', stroke: '#052008', accent: '#7fe090' },
  // 科西嘉政治：宝蓝
  SCR_dyn_corsica: { tint: '#2f6fd0', text: '#e6f0ff', stroke: '#04101f', accent: '#80b8ff' },
  // 科西嘉经济：青绿
  SCR_dyn_corsica_economy: { tint: '#2a9d8f', text: '#d8fff8', stroke: '#04201a', accent: '#5fe0c8' },
  // 科西嘉军事：钢灰
  SCR_dyn_corsica_military: { tint: '#8a949c', text: '#f0f4f8', stroke: '#0a0c0e', accent: '#c0c8d0' },
  // 战时总动员：暗红
  SCR_dyn_gaul_gaul: { tint: '#6a1a1a', bright: 0.7, text: '#ffd8d0', stroke: '#120202', accent: '#e05a4a' },
  // 【皇帝的归来】开局皇帝：金色
  SCR_dyn_new_emperor: { tint: '#c9a24a', text: '#fff4d0', stroke: '#241805', accent: '#ffe08a' },
  // 【皇帝的归来】三重灾难：暗红
  SCR_dyn_old_gaul_disaster: { tint: '#5a1515', bright: 0.7, text: '#ffd8d0', stroke: '#120202', accent: '#e05a4a' },
  // 【皇帝的归来】国家不是玩具：暗紫
  SCR_dyn_not_a_toy: { tint: '#4a3a6a', text: '#f0e8ff', stroke: '#120a1f', accent: '#b49aff' },
  // 【皇帝的归来】荣耀之手：旧金
  SCR_dyn_glory_hand: { tint: '#8a7a3a', text: '#fff4d0', stroke: '#1f1805', accent: '#ffe08a' },
  // 州级「世界之都」不是国家精神，但也用同一套金色永久框
  SCR_londinium_heart: { tint: '#d4a63a', text: '#fff4d0', stroke: '#2a1a05', accent: '#ffe08a' },
};

const TEMP_SPEC = {
  frame: TEMP_FRAME,
  text: '#f2f5f7',
  stroke: '#101418',
  accent: '#aeb8c0',
};
const BACKUP = path.join(ROOT, 'docs/SCR_民族精神_备份');
const PREVIEW = path.join(ROOT, 'docs/SCR_民族精神_图标一览.png');
const TABLE = path.join(ROOT, 'docs/SCR_民族精神_图标表.md');
const LOC = path.join(ROOT, 'localisation/simp_chinese/SCR_l_simp_chinese.yml');
const SIZE = 60;

// sprite id -> 法语艺术字（1~2 行）
const SPIRITS = {
  SCR_theatre_is_truth: ['THÉÂTRE'],
  SCR_tragic_aesthetics: ['DRAME'],
  SCR_eye_of_the_director: ['REGARD'],
  SCR_terminus_of_all_things: ['FIN'],
  SCR_celebration_of_all_things: ['FÊTE'],
  SCR_triumph: ['GLOIRE'],
  SCR_tragic_aesthetics_hardened: ['TREMPE'],
  SCR_play_der_ring: ['ANNEAU'],
  SCR_play_101_days: ['101', 'JOURS'],
  SCR_play_wonderland: ['RÊVE'],
  SCR_play_frost_deer: ['GIVRE'],
  SCR_play_heria: ['HÉRIA'],
  SCR_play_mother_wolf: ['LOUVE'],
  SCR_play_wild_gold: ['OR', 'SAUVAGE'],
  SCR_play_lullaby: ['BERCEUSE'],
  SCR_play_carnival: ['CARNAVAL'],
  SCR_deep_state: ['MIROIR'],
  SCR_old_guard_broken: ['GARDE', 'BRISÉE'],
  SCR_gallic_martyrs: ['MARTYRS'],
  SCR_armament_decree_1: ['USINE'],
  SCR_armament_decree_2: ['ACHATS'],
  SCR_londinium_lights: ['LUEURS'],
  SCR_morale_high: ['MORAL'],
  SCR_manmade_originium_storm: ['TEMPÊTE'],
  SCR_dyn_leadership: ['TRÔNE'],
  SCR_dyn_control: ['LISTE'],
  SCR_dyn_army: ['LÉGION'],
  SCR_dyn_rebuild: ['SCÈNE'],
  SCR_londinium_heart: ['CŒUR'],
  SCR_dyn_gaul_gaul: ['GAULE !'],
  SCR_dyn_new_emperor: ['EMPIRE'],
  SCR_dyn_old_gaul_disaster: ['FLÉAU'],
  SCR_dyn_not_a_toy: ['JOUET'],
  SCR_dyn_glory_hand: ['GLOIRE'],
  SCR_bloody_carnival: ['CARNAGE'],

  // 2026-10 并行会话新增的限时精神 / 科西嘉线经济军事精神
  SCR_dyn_corsica: ['ÉCHO'],
  SCR_timed_gaul_name: ['NOM'],
  SCR_timed_scavenging: ['SURVIE'],
  SCR_timed_return: ['RETOUR'],
  SCR_timed_three_dawns: ['AUBE'],
  SCR_timed_blazing_sun: ['SOLEIL'],
  SCR_timed_overload: ['SURCHARGE'],
  SCR_timed_mobilization: ['LEVÉE'],
  SCR_timed_borrowed_time: ['SACRIFICE'],
  SCR_timed_coronation: ['SACRE'],
  SCR_timed_final_war: ['GUERRE'],
  SCR_timed_burn_out: ['CENDRES'],
  SCR_timed_night_ops: ['NUIT'],
  SCR_timed_parade: ['DÉFILÉ'],
  SCR_timed_infected_amnesty: ['FRÈRES'],
  SCR_timed_exercise: ['EXERCICE'],
  SCR_timed_terror: ['TERREUR'],
  SCR_timed_consensus: ['CONSENSUS'],
  SCR_timed_reflection_tour: ['TOURNÉE'],
  SCR_dyn_corsica_economy: ['ÉCONOMIE'],
  SCR_dyn_corsica_military: ['MACHINE'],
};

function put(rel, buf) {
  const data = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8');
  if (fs.existsSync(rel)) {
    const old = fs.readFileSync(rel);
    if (old.equals(data)) return false;
    fs.mkdirSync(BACKUP, { recursive: true });
    const safe = path.relative(ROOT, rel).replace(/[\\/]/g, '__');
    const bak = path.join(BACKUP, safe);
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, old);
  }
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  fs.writeFileSync(rel, data);
  return true;
}

function parseSprites() {
  const text = fs.readFileSync(GFX, 'utf8');
  const out = [];
  for (const m of text.matchAll(
    /name = "GFX_idea_(SCR_[a-z0-9_]+)"\s+texturefile = "([^"]+)"[^\n]*# (60x60|32x32)/g
  )) {
    out.push({ id: m[1], file: m[2], size: m[3] });
  }
  return out;
}

async function makeIcon(sharp, id, lines) {
  const spec = PERMANENT[id] || TEMP_SPEC;
  const framePath = path.join(FRAME_DIR, spec.frame || path.basename(FRAME));
  if (!fs.existsSync(framePath)) throw new Error(`精神边框缺失：${framePath}`);

  let frameSharp = sharp(framePath)
    .resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
    .ensureAlpha();
  if (spec.tint) frameSharp = frameSharp.tint(spec.tint);
  if (spec.bright !== undefined) frameSharp = frameSharp.modulate({ brightness: spec.bright });
  const frame = await frameSharp.toBuffer();

  const maxLineLen = Math.max(...lines.map((l) => l.length));
  let fontSize = lines.length === 1 ? 13 : 10;
  const maxTextW = SIZE * 0.635;
  if (maxLineLen * fontSize * 0.56 > maxTextW) {
    fontSize = Math.max(7, Math.floor(maxTextW / (maxLineLen * 0.56)));
  }
  const gap = fontSize * 1.12;
  const totalH = (lines.length - 1) * gap;
  const centerY = SIZE * 0.46;
  const texts = lines
    .map((line, i) => {
      const y = centerY - totalH / 2 + i * gap;
      const safe = line.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<text x="${SIZE / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Segoe Script" font-size="${fontSize}" fill="${spec.text}" stroke="${spec.stroke}" stroke-width="${Math.max(0.5, fontSize * 0.06)}" paint-order="stroke">${safe}</text>`;
    })
    .join('\n');
  const lineY = centerY + totalH / 2 + fontSize * 0.95;
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">` +
      `<rect x="${SIZE * 0.13}" y="${SIZE * 0.13}" width="${SIZE * 0.74}" height="${SIZE * 0.74}" rx="2" fill="rgba(0,0,0,0.45)"/>` +
      texts +
      `<line x1="${SIZE / 2 - 7}" y1="${lineY}" x2="${SIZE / 2 + 7}" y2="${lineY}" stroke="${spec.accent}" stroke-width="0.8" opacity="0.9"/>` +
      `</svg>`
  );
  return sharp(frame).composite([{ input: svg }]).png({ compressionLevel: 9 }).toBuffer();
}

function buildTable(sprites) {
  const names = {};
  const text = fs.readFileSync(LOC, 'utf8');
  for (const m of text.matchAll(/^\s*(SCR_[a-z0-9_]+):\s*"([^"]*)"/gm)) names[m[1]] = m[2];
  const rows = sprites.map(
    (s) => `| ${s.id} | ${names[s.id] || ''} | ${SPIRITS[s.id].join(' / ')} |`
  );
  return [
    '# 猩红剧团民族精神 · 彩色分类边框图标表',
    '',
    '8 个可见常驻精神按分类着色（政治金 / 控制紫 / 陆军猩红 / 经济翠绿 / 科西嘉政治宝蓝 / 科西嘉经济青绿 / 科西嘉军事钢灰 / 战时暗红）。',
    '其余限时与隐藏精神使用银灰沙漏边框。32x32 州级修正未改。',
    '',
    '| Sprite / 精神 id | 中文名 | 法语艺术字 |',
    '|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('需要 sharp：NODE_PATH=E:/tmp/lud/node_modules node docs/gen_scr_spirit_icons.cjs');
    process.exit(1);
  }
  if (!fs.existsSync(FRAME)) throw new Error(`废弃蓝框缺失：${FRAME}`);

  const sprites = parseSprites().filter((s) => s.size === '60x60');
  const missing = sprites.filter((s) => !SPIRITS[s.id]);
  const extra = Object.keys(SPIRITS).filter((id) => !sprites.some((s) => s.id === id));
  if (missing.length) throw new Error(`缺少法语文本：${missing.map((s) => s.id).join(', ')}`);
  if (extra.length) throw new Error(`SPIRITS 里有 gfx 中不存在的 id：${extra.join(', ')}`);

  put(TABLE, buildTable(sprites));

  let written = 0;
  const tiles = [];
  for (const s of sprites) {
    const buf = await makeIcon(sharp, s.id, SPIRITS[s.id]);
    if (put(path.join(ROOT, s.file), buf)) written++;
    tiles.push({ id: s.id, buf });
  }

  // 一览图（4x，8 列）
  const scale = 3;
  const cw = SIZE * scale;
  const cols = 8;
  const rows = Math.ceil(tiles.length / cols);
  const comps = tiles.map((t, i) => ({
    input: t.buf,
    left: 10 + (i % cols) * (cw + 8),
    top: 10 + Math.floor(i / cols) * (cw + 8),
  }));
  await sharp({
    create: {
      width: 20 + cols * (cw + 8),
      height: 20 + rows * (cw + 8),
      channels: 4,
      background: { r: 28, g: 30, b: 34, alpha: 1 },
    },
  })
    .composite(comps)
    .png()
    .toFile(PREVIEW);

  console.log(`  - 民族精神图标 ${sprites.length} 张 / 新写入 ${written}`);
  console.log(`  - 一览：${path.relative(ROOT, PREVIEW)}`);
}

main().catch((e) => {
  console.error('失败：' + e.message);
  process.exit(1);
});
