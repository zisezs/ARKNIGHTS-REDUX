#!/usr/bin/env node
/**
 * SCR 民族精神数值规范化
 *
 * 目标：
 *   - 每个可见常驻精神的最终数值约 25%（负面约 -25%，整数加密/破译 +2）
 *   - 每个国策只增加干净的 1% / 2% / 5% 步进，不再出现 3% / 1.5% / 0.8% / 0.3%
 *   - 焦点 tooltip 不显示小数点；精神总览 tooltip 写清最终数值
 *
 * 做法：
 *   1. 重写所有 add_to_variable 的步进为 0.02 / 0.01 / 0.005 / -0.02 / -0.01 / 1
 *   2. 移除 SCR_dyn_gaul / _gaul_lite（战争精神的固定数值直接写在动态修正里）
 *   3. 移除 SCR_dyn_corsica_lite（科西嘉政治的科研/建造改用主变量）
 *   4. 新增 on_actions：初始化变量并每月 clamp 到 ±25% / ±2
 *   5. 更新 tooltip 格式为 0 位小数，并重写精神总览文案
 *
 * 用法：node docs/gen_scr_spirit_numbers.cjs
 * 幂等：连跑两次逐字节一致。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// 主树 SCR.txt 的第三/第四幕已改为“讲故事”的差异化步进，不再参与统一 2% 规范化。
const FILES = [
  path.join(ROOT, 'common/national_focus/SCR_corsica_shared.txt'),
  path.join(ROOT, 'common/national_focus/SCR_switch_shared.txt'),
];
const DYNAMIC = path.join(ROOT, 'common/dynamic_modifiers/SCR_dynamic_modifiers.txt');
const ON_ACTIONS = path.join(ROOT, 'common/on_actions/SCR_spirit_balance_on_actions.txt');
const LOC1 = path.join(ROOT, 'localisation/simp_chinese/SCR_l_simp_chinese.yml');
const LOC2 = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml');
const BACKUP = path.join(ROOT, 'docs/SCR_精神数值规范化_备份');

const CLEAN = {
  SCR_dyn_leadership: 0.02,
  SCR_dyn_leadership_lite: 0.02,
  SCR_dyn_leadership_drift: 0.005,
  SCR_dyn_control: 0.02,
  SCR_dyn_control_neg: -0.02,
  SCR_dyn_control_int: 1,
  SCR_dyn_army: 0.02,
  SCR_dyn_army_lite: 0.02,
  SCR_dyn_army_neg: -0.02,
  SCR_dyn_army_supply: -0.05,
  SCR_dyn_rebuild: 0.02,
  SCR_dyn_rebuild_lite: 0.02,
  SCR_dyn_rebuild_neg: -0.02,
  SCR_dyn_corsica: 0.02,
  SCR_dyn_corsica_army: 0.02,
  SCR_dyn_corsica_int: 1,
  SCR_dyn_corsica_economy: 0.01,
  SCR_dyn_corsica_economy_lite: 0.01,
  SCR_dyn_corsica_economy_cg: -0.01,
  SCR_dyn_corsica_military: 0.02,
  SCR_dyn_corsica_military_lite: 0.02,
};

const CLAMPS = [
  ['SCR_dyn_leadership', 0, 0.25],
  ['SCR_dyn_leadership_lite', 0, 0.25],
  ['SCR_dyn_leadership_drift', 0, 0.06],
  ['SCR_dyn_control', 0, 0.25],
  ['SCR_dyn_control_neg', -0.25, 0],
  ['SCR_dyn_control_int', 0, 2],
  ['SCR_dyn_army', 0, 0.25],
  ['SCR_dyn_army_lite', 0, 0.25],
  ['SCR_dyn_army_neg', -0.25, 0],
  ['SCR_dyn_army_supply', -0.25, 0],
  ['SCR_dyn_rebuild', 0, 0.25],
  ['SCR_dyn_rebuild_lite', 0, 0.25],
  ['SCR_dyn_rebuild_neg', -0.25, 0],
  ['SCR_dyn_corsica', 0, 0.25],
  ['SCR_dyn_corsica_army', 0, 0.25],
  ['SCR_dyn_corsica_int', 0, 2],
  ['SCR_dyn_corsica_economy', 0, 0.25],
  ['SCR_dyn_corsica_economy_lite', 0, 0.25],
  ['SCR_dyn_corsica_economy_cg', -0.25, 0],
  ['SCR_dyn_corsica_military', 0, 0.25],
  ['SCR_dyn_corsica_military_lite', 0, 0.25],
];

const TOOLTIPS = {
  SCR_dyn_leadership_tooltip:
    '§G高卢的冠冕：政治点数获取、稳定度、战争支持度各 +25%；科研速度、建造速度各 +25%；意识形态漂移 +6%。§!',
  SCR_dyn_control_tooltip:
    '§G舞台监督的花名册：工厂效率、最大效率、行动成果各 +25%；反颠覆、抵抗增长 -25%；政治点数获取 +10%；顺从度增长 +10%；加密/破译 +2。§!',
  SCR_dyn_army_tooltip:
    '§G返场的军团：这支军队在攻击、防御、士气与战争支持之间取舍；经验、征兵与挖掘能力也不会同时到达顶点。§!',
  SCR_dyn_rebuild_tooltip:
    '§G不谢幕的脚手架：重建在工业、稳定、科研与民生之间拉扯；每一项推进都要从别处挪来资源。§!',
  SCR_dyn_corsica_tooltip:
    '§G世界之都的倒影：政治点数、稳定度、战争支持各 +25%；科研、建造各 +25%；陆军攻防士气各 +25%；加密/破译 +2；神秘主义漂移 +2%；消费品需求 -5%；行动成果 +10%；抵抗增长 -10%；顺从度增长 +10%。§!',
  SCR_dyn_corsica_economy_tooltip:
    '§G新经济秩序：建造速度、工厂效率、最大效率各 +25%；科研 +25%；消费品需求 -25%；月度人口 +10%；经验损失 -10%。§!',
  SCR_dyn_corsica_military_tooltip:
    '§G高卢战争机器：陆军攻击、防御、士气各 +25%；陆军经验、征兵、挖掘上限各 +25%；科研 +5%；非核心人力 +2%；补给消耗 -5%；陆军学说花费 -10%。§!',
  SCR_dyn_gaul_gaul_desc:
    '「让我们齐唱颂歌——皇帝万岁，高卢万岁！」战争时期的所有国策加成，都汇进这一声呐喊。军队、宫廷与工厂都在等待这场谢幕演出，而高卢会把每一分力量都推上舞台。',
};

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function put(rel, content) {
  const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  if (fs.existsSync(rel)) {
    const old = fs.readFileSync(rel);
    if (old.equals(data)) return false;
    fs.mkdirSync(BACKUP, { recursive: true });
    const bak = path.join(BACKUP, path.relative(ROOT, rel).replace(/[\\/]/g, '__'));
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, old);
  }
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  fs.writeFileSync(rel, data);
  return true;
}

function cleanIncrements(text) {
  // 移除战争变量（改由 hidden idea 提供）与科西嘉 lite（改用主变量）
  text = text.replace(/^[ \t]*add_to_variable = \{[^\n]*SCR_dyn_gaul(?:_lite)?[^\n]*\}\n/gm, '');
  text = text.replace(/^[ \t]*add_to_variable = \{[^\n]*SCR_dyn_corsica_lite[^\n]*\}\n/gm, '');

  // 重写所有剩余变量的步进
  text = text.replace(
    /(add_to_variable = \{\s*)(SCR_dyn_[a-z0-9_]+)(\s*=\s*)([-0-9.]+)/g,
    (m, pre, id, eq) => {
      if (!(id in CLEAN)) throw new Error(`未配置清理值：${id}`);
      return pre + id + eq + CLEAN[id];
    }
  );
  return text;
}

function patchFocusFiles() {
  for (const f of FILES) {
    let text = read(f);
    const before = text;
    text = cleanIncrements(text);
    if (text !== before) {
      put(f, text);
      console.log(`  - 已规范化数值：${path.basename(f)}`);
    }
  }
}

function patchDynamic() {
  let text = read(DYNAMIC);
  const before = text;
  text = text
    .replace('research_speed_factor = SCR_dyn_corsica_lite', 'research_speed_factor = SCR_dyn_corsica')
    .replace('production_speed_buildings_factor = SCR_dyn_corsica_lite', 'production_speed_buildings_factor = SCR_dyn_corsica');
  if (text !== before) {
    put(DYNAMIC, text);
    console.log('  - 科西嘉政治科研/建造改用主变量');
  }
}

function buildOnActions() {
  const inits = CLAMPS.map(
    ([id]) => `\t\t\t\tif = { limit = { NOT = { has_variable = ${id} } } set_variable = { ${id} = 0 } }`
  ).join('\n');
  const clamps = CLAMPS.map(
    ([id, min, max]) => `\t\t\t\tclamp_variable = { var = ${id} min = ${min} max = ${max} }`
  ).join('\n');
  return [
    '######################################################',
    '# SCR 民族精神数值规范化 — 初始化与月度封顶',
    '# 生成器：docs/gen_scr_spirit_numbers.cjs（勿手改）',
    '# 目标：常驻精神各项最终值约 ±25%，加密/破译 ±2',
    '######################################################',
    '',
    'on_actions = {',
    '\ton_startup = {',
    '\t\teffect = {',
    '\t\t\tSCR = {',
    inits,
    '\t\t\t}',
    '\t\t}',
    '\t}',
    '\ton_monthly_SCR = {',
    '\t\teffect = {',
    clamps,
    '\t\t}',
    '\t}',
    '}',
    '',
  ].join('\n');
}

function patchOnActions() {
  put(ON_ACTIONS, buildOnActions());
}

function spiritPrefix(key) {
  if (key.startsWith('SCR_dyn_corsica_economy')) return '§Y新经济秩序§!：';
  if (key.startsWith('SCR_dyn_corsica_military')) return '§Y高卢战争机器§!：';
  if (key.startsWith('SCR_dyn_corsica')) return '§Y世界之都的倒影§!：';
  if (key.startsWith('SCR_dyn_leadership')) return '§Y高卢的冠冕§!：';
  if (key.startsWith('SCR_dyn_control')) return '§Y舞台监督的花名册§!：';
  if (key.startsWith('SCR_dyn_army')) return '§Y返场的军团§!：';
  if (key.startsWith('SCR_dyn_rebuild')) return '§Y不谢幕的脚手架§!：';
  if (key.startsWith('SCR_dyn_gaul')) return '§Y高卢，高卢！§!：';
  return '';
}

function prefixValueTooltips(text) {
  return text
    .split('\n')
    .map((line) => {
      const cr = line.endsWith('\r');
      const l = cr ? line.slice(0, -1) : line;
      const m = l.match(/^(\s*)(SCR_dyn_[a-z0-9_]+_value_tt):\s*"(.*)"$/);
      if (!m) return line;
      const body = m[3].replace(/^\s+/, '');
      if (body.startsWith('§Y')) return line;
      const res = m[1] + m[2] + ': "' + spiritPrefix(m[2]) + body + '"';
      return cr ? res + '\r' : res;
    })
    .join('\n');
}

function patchLoc() {
  for (const f of [LOC1, LOC2]) {
    let text = read(f);
    const before = text;
    text = text.replace(/\$RIGHT\|\+=%1\$/g, '$RIGHT|+=%0$');
    // 意识形态漂移是 0.5% 步进，保留一位小数
    text = text.replace(
      /(SCR_dyn_leadership_drift_value_tt:[^\n]*?)\$RIGHT\|\+=%0\$/,
      '$1$RIGHT|+=%1$'
    );
    text = prefixValueTooltips(text);
    for (const [k, v] of Object.entries(TOOLTIPS)) {
      const re = new RegExp(`^(\\s*${k}:\\s*)"[^"]*"$`, 'm');
      if (re.test(text)) text = text.replace(re, `$1"${v}"`);
      else console.warn(`  ! 未找到 loc 键 ${k}`);
    }
    if (text !== before) {
      put(f, text);
      console.log(`  - 已更新 tooltip：${path.basename(f)}`);
    }
  }
}

patchFocusFiles();
patchDynamic();
patchOnActions();
patchLoc();
console.log('完成。');
