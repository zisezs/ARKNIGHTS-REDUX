#!/usr/bin/env node
/*
 * 「酒神的大地巡演」静态体检
 * 运行：node docs/validate_scr_bacchanal.cjs
 *
 * 检查项：
 *  1. .gui 的 iconType/buttonType 没有 size 键
 *  2. buttonType 使用 quadTextureSprite（不是 buttonSprite）
 *  3. .gui 引用的 sprite 全部已注册
 *  4. .gui 的静态文本键全部存在于本地化
 *  5. 决议 / 分类 / 动态修正 / 地图模式的引用键存在
 *  6. 本地化 BOM / CRLF / 首行语言头
 *  7. scripted_gui 元素名与 .gui 对账
 *  8. 州级修正的 modifier token 存在性（对照原版文档）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const files = {
  gui: path.join(ROOT, 'interface', '_ARF_Gui', 'SCR_Bacchanal.gui'),
  gfx: path.join(ROOT, 'interface', '_ARF_Gui', 'SCR_Bacchanal.gfx'),
  sg: path.join(ROOT, 'common', 'scripted_guis', 'SCR_Bacchanal_GUI.txt'),
  eff: path.join(ROOT, 'common', 'scripted_effects', 'SCR_Bacchanal_effects.txt'),
  dec: path.join(ROOT, 'common', 'decisions', 'SCR_Bacchanal_Decisions.txt'),
  cat: path.join(ROOT, 'common', 'decisions', 'categories', 'SCR_decision_categories.txt'),
  dm: path.join(ROOT, 'common', 'dynamic_modifiers', 'SCR_dynamic_modifiers.txt'),
  mm: path.join(ROOT, 'common', 'map_modes', 'SCR_bacchanal_map_mode.txt'),
  loc: path.join(ROOT, 'localisation', 'simp_chinese', 'SCR_l_simp_chinese.yml'),
};
const errors = [];
const read = (f) => fs.readFileSync(f, 'utf8');
const exists = (f) => fs.existsSync(f);

// ---------- 1/2/3. GUI 结构 + sprite ----------
const gui = read(files.gui);
const guiLines = gui.split(/\r?\n/);
let inIcon = false, inButton = false, depth = 0;
for (let i = 0; i < guiLines.length; i++) {
  const line = guiLines[i];
  if (/^\s*iconType\s*=\s*\{/.test(line)) { inIcon = true; inButton = false; depth = 0; }
  else if (/^\s*buttonType\s*=\s*\{/.test(line)) { inButton = true; inIcon = false; depth = 0; }
  if (inIcon || inButton) {
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    if (/\bsize\s*=/.test(line)) errors.push(`GUI ${i + 1}: iconType/buttonType 不允许 size`);
    if (/buttonSprite\s*=/.test(line)) errors.push(`GUI ${i + 1}: 应使用 quadTextureSprite`);
    if (depth <= 0 && /\}/.test(line) && !/\{/.test(line)) { inIcon = false; inButton = false; }
  }
}

// 收集 sprite 注册：本模块 + 既有 SCR ideas + 全 interface .gfx
const gfxFiles = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith('.gfx')) gfxFiles.push(p);
  }
}
walk(path.join(ROOT, 'interface'));
const registered = new Set();
for (const f of gfxFiles) {
  const t = read(f);
  for (const m of t.matchAll(/\bname\s*=\s*"([^"]+)"/g)) registered.add(m[1]);
}
const usedSprites = new Set();
for (const m of gui.matchAll(/(?:spriteType|quadTextureSprite)\s*=\s*"([^"]+)"/g)) usedSprites.add(m[1]);
for (const s of usedSprites) if (!registered.has(s)) errors.push(`GUI: sprite 未注册: ${s}`);

// ---------- 4. 本地化 ----------
const locText = read(files.loc).replace(/^﻿/, '');
const loc = new Map();
for (const line of locText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+):\s*"((?:[^"]|"")*)"/);
  if (m) loc.set(m[1], m[2]);
}
for (const m of gui.matchAll(/\btext\s*=\s*"([^"]+)"/g)) {
  const key = m[1];
  if (/[\s\[\]£]/.test(key) || key === ' ') continue;
  if (!/^[A-Za-z0-9_]+$/.test(key)) continue;
  if (!loc.has(key)) errors.push(`GUI: 本地化键缺失: ${key}`);
}
for (const m of gui.matchAll(/\bbuttonText\s*=\s*"([^"]+)"/g)) {
  const key = m[1];
  if (key === ' ') continue;
  if (!loc.has(key)) errors.push(`GUI: buttonText 本地化键缺失: ${key}`);
}

// ---------- 5. 决议 / 修正 / 地图模式 ----------
const dec = read(files.dec);
for (const m of dec.matchAll(/icon\s*=\s*(GFX_[A-Za-z0-9_]+)/g)) {
  if (!registered.has(m[1])) errors.push(`决议: 图标未注册: ${m[1]}`);
}
for (const m of dec.matchAll(/\b(SCR_bacchanal_[A-Za-z0-9_]+)\s*=\s*\{/g)) {
  if (!loc.has(m[1]) && m[1] !== 'SCR_bacchanal_tour_category') errors.push(`决议: 本地化键缺失: ${m[1]}`);
  if (!loc.has(m[1] + '_desc') && m[1] !== 'SCR_bacchanal_tour_category') errors.push(`决议: 本地化键缺失: ${m[1]}_desc`);
}
if (!loc.has('SCR_bacchanal_tour_category')) errors.push('分类: 本地化键缺失');
if (!loc.has('SCR_bacchanal_tour_category_desc')) errors.push('分类 desc: 本地化键缺失');

const dm = read(files.dm);
for (const m of dm.matchAll(/\bicon\s*=\s*(GFX_[A-Za-z0-9_]+)/g)) {
  if (m[1].startsWith('GFX_idea_SCR_tour_') && !registered.has(m[1])) errors.push(`动态修正: 图标未注册: ${m[1]}`);
}
for (const name of ['SCR_tour_dm_der_ring', 'SCR_tour_dm_one_hundred_one_days', 'SCR_tour_dm_wonderland', 'SCR_tour_dm_frost_deer', 'SCR_tour_dm_mother_wolf']) {
  if (!new RegExp(`^${name}\\s*=\\s*\\{`, 'm').test(dm)) errors.push(`动态修正缺失: ${name}`);
}
const mm = read(files.mm);
if (!/scr_bacchanal_map_mode\s*=\s*\{/.test(mm)) errors.push('地图模式缺失');
for (const k of ['MAPMODE_SCR_BACCHANAL_MAP_MODE', 'MAPMODE_SCR_BACCHANAL_MAP_MODE_NAME', 'MAPMODE_SCR_BACCHANAL_MAP_MODE_DESCRIPTION', 'scr_bacchanal_map_mode_tooltip', 'scr_bacchanal_map_mode_tooltip_delayed']) {
  if (!loc.has(k)) errors.push(`地图模式本地化缺失: ${k}`);
}
for (const s of ['GFX_mapmode_buttons_deselected_small_scr_bacchanal_map_mode', 'GFX_mapmode_buttons_selected_small_scr_bacchanal_map_mode']) {
  if (!registered.has(s)) errors.push(`地图模式按钮未注册: ${s}`);
}

// ---------- 6. 编码 ----------
const buf = fs.readFileSync(files.loc);
if (buf[0] !== 0xEF || buf[1] !== 0xBB || buf[2] !== 0xBF) errors.push('loc: 缺少单个 UTF-8 BOM');
if (buf.slice(3, 6).toString() === '﻿') errors.push('loc: 双 BOM');
const locRaw = buf.toString('utf8');
if (/[^\r]\n/.test(locRaw)) errors.push('loc: 存在裸 LF（必须 CRLF）');
if (!locRaw.replace(/^﻿/, '').startsWith('l_simp_chinese:')) errors.push('loc: 首行必须是 l_simp_chinese:');

// ---------- 7. scripted_gui 元素名对账 ----------
const sg = read(files.sg);
const guiNames = new Set([...gui.matchAll(/\bname\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
for (const m of sg.matchAll(/^\s*([A-Za-z0-9_]+)_(click|visible|click_enabled)\s*=\s*\{/gm)) {
  const element = m[1];
  if (!guiNames.has(element)) errors.push(`scripted_gui: 元素名在 GUI 中不存在: ${element}`);
}
// 每个按钮必须有 click 效果
const buttonNames = [];
{
  let inButton = false, depth = 0, name = null;
  for (const line of guiLines) {
    if (/^\s*buttonType\s*=\s*\{/.test(line)) { inButton = true; depth = 0; name = null; }
    if (inButton) {
      depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      const nm = line.match(/^\s*name\s*=\s*"([^"]+)"/);
      if (nm) name = nm[1];
      if (depth <= 0 && /\}/.test(line) && !/\{/.test(line)) {
        if (name) buttonNames.push(name);
        inButton = false;
      }
    }
  }
}
for (const b of buttonNames) {
  if (!new RegExp(`\\b${b}_click\\s*=\\s*\\{`).test(sg)) errors.push(`按钮缺少 click 效果: ${b}`);
}
const markers = buttonNames.filter((b) => b.startsWith('SCR_Bac_MapM_'));
for (const b of markers) {
  if (!new RegExp(`\\b${b}_visible\\s*=\\s*\\{`).test(sg)) errors.push(`地图标记缺少 visible 触发器: ${b}`);
}
console.log(`  面板地图标记 ${markers.length} 个`);

// ---------- 7b. 面板地图 FX 州块 ----------
const eff = read(files.eff);
const fxIcons = new Set([...gui.matchAll(/name = "SCR_Bac_Fx_(\d+)"/g)].map((m) => m[1]));
const fxProps = new Set([...sg.matchAll(/SCR_Bac_Fx_(\d+) = \{ frame = SCR_fx_\d+ \}/g)].map((m) => m[1]));
const fxInit = new Set([...eff.matchAll(/set_variable = \{ SCR_fx_(\d+) = 0 \}/g)].map((m) => m[1]));
const fxSet = new Set([...eff.matchAll(/ROOT\.SCR_fx_(\d+) = ROOT\.SCR_tour_play/g)].map((m) => m[1]));
const fxGfx = new Set([...read(path.join(ROOT, 'interface', '_ARF_Gui', 'SCR_Bacchanal_Fx.gfx')).matchAll(/name = "GFX_SCR_bac_fx_(\d+)"/g)].map((m) => m[1]));
for (const [name, set] of [['FX 图标', fxIcons], ['FX 属性', fxProps], ['FX 初始化变量', fxInit], ['FX 设置效果', fxSet], ['FX sprite', fxGfx]]) {
  if (set.size !== 1087) errors.push(`${name} 数量不是 1087: ${set.size}`);
  for (const id of fxIcons) {
    if (!set.has(id)) { errors.push(`${name} 缺少州 ${id}`); break; }
  }
}
console.log(`  面板效果州块 ${fxIcons.size} 个`);

// ---------- 8. 州级修正 token 对照原版文档 ----------
const modDoc = path.join('D:', 's', 'steamapps', 'common', 'Hearts of Iron IV', 'documentation', 'modifiers_documentation.md');
if (exists(modDoc)) {
  const doc = read(modDoc);
  for (const key of ['local_factories', 'local_resources_factor', 'recruitable_population_factor', 'state_production_speed_buildings_factor', 'local_supplies']) {
    if (!new RegExp(`## ${key}\\b`).test(doc) && !new RegExp(`\\[${key}\\]`).test(doc)) {
      errors.push(`modifier token 未在原版文档中出现: ${key}`);
    }
  }
} else {
  console.log('⚠ 未找到原版 modifiers_documentation.md，跳过 modifier token 核对');
}

if (errors.length) {
  console.error('体检失败：');
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log('体检通过：酒神的大地巡演');
console.log(`  GUI 元素 ${guiNames.size} 个 / 按钮 ${buttonNames.length} 个 / 本地化 ${loc.size} 键`);
