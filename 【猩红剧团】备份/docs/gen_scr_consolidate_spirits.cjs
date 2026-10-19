#!/usr/bin/env node
/**
 * SCR 常驻民族精神整合（2026-10-18）
 *
 * 目标：精神栏里的常驻精神不超过 8 个。
 * 做法：
 *   - 保留 8 个可见动态修正：
 *       高卢的冠冕 / 舞台监督的花名册 / 返场的军团 / 不谢幕的脚手架
 *       世界之都的倒影 / 新经济秩序 / 高卢战争机器 / 高卢，高卢！
 *   - 把零碎小 idea 的效果按线路汇总进 8 个「hidden_ideas」。
 *     hidden_ideas 不显示在精神栏，但效果照常生效。
 *   - 目标国修正例外：targeted_modifier 只有挂在可见 country 类 idea 上才参与结算，
 *     因此「高卢，高卢！」的对维多利亚攻防放在 SCR_gaul_vic_bonus 里单独显示。
 *   - 移除小 idea 的 add_ideas 授予；限时精神不动。
 *   - 合并值全额相加后按项目规则封顶：百分比 ±25%，整数（加解密）±2。
 *
 * 用法：node docs/gen_scr_consolidate_spirits.cjs
 * 幂等：连跑两次逐字节一致。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HISTORY = path.join(ROOT, 'history/countries/SCR - Crimson Troupe.txt');
const OLD_TREE = path.join(ROOT, 'common/national_focus/SCR.txt');
const CORSI = path.join(ROOT, 'common/national_focus/SCR_corsica_shared.txt');
const SWITCH = path.join(ROOT, 'common/national_focus/SCR_switch_shared.txt');
const DECISIONS = path.join(ROOT, 'common/decisions/SCR_Decisions.txt');
const HIDDEN = path.join(ROOT, 'common/ideas/SCR_consolidated_hidden_ideas.txt');
const BACKUP = path.join(ROOT, 'docs/SCR_民族精神整合_备份');

// 需要移除授予的零碎常驻 idea（限时 idea 不在此列）
const SMALL_IDEAS = [
  'SCR_armament_decree_1',
  'SCR_armament_decree_2',
  'SCR_deep_state',
  'SCR_bloody_diplomacy',
  'SCR_eternal_tour',
  'SCR_harvest_festival',
  'SCR_puppet_craft',
  'SCR_puppet_legion',
  'SCR_blood_of_gaul',
  'SCR_banner_of_empire',
  'SCR_triumph',
  'SCR_oath_of_restoration',
  'SCR_imperial_banner',
  'SCR_celebration_of_all_things',
  'SCR_gallic_echo',
  'SCR_blood_diamond_legacy',
  'SCR_star_surgery',
  'SCR_flyleaf_masters',
  'SCR_blood_altar',
  'SCR_temple_of_pain',
  'SCR_shield_of_gallia',
  'SCR_mirror_man',
  'SCR_undying_art',
];

// 可见动态修正 -> 隐藏 idea（只给有零碎效果并入的线）
const UNLOCKS = [
  { file: OLD_TREE, modifier: 'SCR_dyn_control', idea: 'SCR_hidden_old_control' },
  { file: CORSI, modifier: 'SCR_dyn_corsica', idea: 'SCR_hidden_corsica' },
  { file: CORSI, modifier: 'SCR_dyn_corsica_economy', idea: 'SCR_hidden_corsica_economy' },
  { file: CORSI, modifier: 'SCR_dyn_corsica_military', idea: 'SCR_hidden_corsica_military' },
];

const HIDDEN_FILE = [
  '######################################################',
  '# SCR 常驻民族精神整合 — 隐藏 idea（不显示在精神栏）',
  '# 由 docs/gen_scr_consolidate_spirits.cjs 生成，勿手改。',
  '# 合并值：全额相加后按项目规则封顶（百分比 ±25%，加解密 ±2）。',
  '######################################################',
  '',
  'ideas = {',
  '\thidden_ideas = {',
  '',
  '\t\t# 开局三精神 → 隐藏',
  '\t\tSCR_hidden_start_theatre = {',
  '\t\t\tallowed = { always = no }',
  '\t\t\tremoval_cost = -1',
  '\t\t\tmodifier = {',
  '\t\t\t\tpolitical_power_gain = 0.10',
  '\t\t\t\tmysticism_drift = 0.02',
  '\t\t\t}',
  '\t\t}',
  '\t\tSCR_hidden_start_tragic = {',
  '\t\t\tallowed = { always = no }',
  '\t\t\tremoval_cost = -1',
  '\t\t\tmodifier = {',
  '\t\t\t\tstability_factor = -0.10',
  '\t\t\t\twar_support_factor = 0.20',
  '\t\t\t\tconscription_factor = -0.05',
  '\t\t\t}',
  '\t\t}',
  '\t\tSCR_hidden_start_eye = {',
  '\t\t\tallowed = { always = no }',
  '\t\t\tremoval_cost = -1',
  '\t\t\tmodifier = {',
  '\t\t\t\tencryption = 1',
  '\t\t\t\tdecryption = 1',
  '\t\t\t\tpolitical_power_gain = 0.05',
  '\t\t\t}',
  '\t\t}',
  '',
  '\t\t# 旧树控制线（深层政府）——只保留动态修正块没有的效果，避免叠加',
  '\t\tSCR_hidden_old_control = {',
  '\t\t\tallowed = { always = no }',
  '\t\t\tremoval_cost = -1',
  '\t\t\tmodifier = {',
  '\t\t\t\tpolitical_power_gain = 0.10',
  '\t\t\t\tcompliance_growth = 0.10',
  '\t\t\t}',
  '\t\t}',
  '',
  '\t\t# 科西嘉政治线：只保留动态修正块没有的效果',
  '\t\tSCR_hidden_corsica = {',
  '\t\t\tallowed = { always = no }',
  '\t\t\tremoval_cost = -1',
  '\t\t\tmodifier = {',
  '\t\t\t\tmysticism_drift = 0.02',
  '\t\t\t\tconsumer_goods_factor = -0.05',
  '\t\t\t\toperation_outcome = 0.10',
  '\t\t\t\tresistance_growth = -0.10',
  '\t\t\t\tcompliance_growth = 0.10',
  '\t\t\t}',
  '\t\t}',
  '',
  '\t\t# 科西嘉经济线：只保留动态修正块没有的效果',
  '\t\tSCR_hidden_corsica_economy = {',
  '\t\t\tallowed = { always = no }',
  '\t\t\tremoval_cost = -1',
  '\t\t\tmodifier = {',
  '\t\t\t\tmonthly_population = 0.10',
  '\t\t\t\texperience_loss_factor = -0.10',
  '\t\t\t}',
  '\t\t}',
  '',
  '\t\t# 科西嘉军事线：只保留动态修正块没有的效果',
  '\t\tSCR_hidden_corsica_military = {',
  '\t\t\tallowed = { always = no }',
  '\t\t\tremoval_cost = -1',
  '\t\t\tmodifier = {',
  '\t\t\t\tresearch_speed_factor = 0.05',
  '\t\t\t\tnon_core_manpower = 0.02',
  '\t\t\t\tsupply_consumption_factor = -0.05',
  '\t\t\t\tland_doctrine_cost_factor = -0.10',
  '\t\t\t}',
  '\t\t}',
  '',
  '',
  '\t}',
  '',
  '\tcountry = {',
  '\t\t# 战争线（高卢，高卢！）：30 天限时精神',
  '\t\tSCR_dyn_gaul_gaul = {',
  '\t\t\tname = SCR_dyn_gaul_gaul',
  '\t\t\tpicture = SCR_dyn_gaul_gaul',
  '\t\t\tallowed = { original_tag = SCR }',
  '\t\t\tallowed_civil_war = { always = yes }',
  '\t\t\tremoval_cost = -1',
  '\t\t\tmodifier = {',
  '\t\t\t\tarmy_attack_factor = 0.25',
  '\t\t\t\tarmy_defence_factor = 0.25',
  '\t\t\t\tarmy_morale_factor = 0.25',
  '\t\t\t\twar_support_factor = 0.25',
  '\t\t\t\tconscription_factor = 0.10',
  '\t\t\t\tstability_factor = 0.10',
  '\t\t\t\tpolitical_power_gain = 0.25',
  '\t\t\t\tjustify_war_goal_time = -0.25',
  '\t\t\t\tarmy_core_attack_factor = 0.10',
  '\t\t\t\tarmy_core_defence_factor = 0.10',
  '\t\t\t}',
  '\t\t}',
  '',
  '\t\t# 战争线（高卢，高卢！）：目标国修正',
  '\t\t# targeted_modifier 必须挂在可见的 country 类 idea 上才会参与结算。',
  '\t\tSCR_gaul_vic_bonus = {',
  '\t\t\tname = SCR_gaul_vic_bonus',
  '\t\t\tpicture = SCR_dyn_gaul_gaul',
  '\t\t\tallowed = { original_tag = SCR }',
  '\t\t\tallowed_civil_war = { always = yes }',
  '\t\t\tremoval_cost = -1',
  '\t\t\ttargeted_modifier = {',
  '\t\t\t\ttag = VIC',
  '\t\t\t\tattack_bonus_against = 0.10',
  '\t\t\t\tdefense_bonus_against = 0.10',
  '\t\t\t}',
  '\t\t}',
  '\t}',
  '}',
  '',
].join('\n');

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

function removeIdeaGrants(text) {
  const alt = SMALL_IDEAS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return text.replace(new RegExp(`^[ \\t]*add_ideas = (${alt})[ \\t]*\\n`, 'gm'), '');
}

function removeHiddenGrant(text, idea) {
  return text.replace(new RegExp(`^[ \\t]*add_ideas = ${idea}[ \\t]*\\n`, 'gm'), '');
}

function insertAfterFirstModifier(text, modifier, idea) {
  text = removeHiddenGrant(text, idea);
  const needle = `add_dynamic_modifier = { modifier = ${modifier} }`;
  const i = text.indexOf(needle);
  if (i < 0) throw new Error(`找不到 ${modifier} 的 add_dynamic_modifier`);
  const lineStart = text.lastIndexOf('\n', i) + 1;
  const indent = text.slice(lineStart, i);
  const lineEnd = text.indexOf('\n', i) + 1;
  return text.slice(0, lineEnd) + `${indent}add_ideas = ${idea}\n` + text.slice(lineEnd);
}

function insertAfterAllModifiers(text, modifier, idea) {
  text = removeHiddenGrant(text, idea);
  const needle = `add_dynamic_modifier = { modifier = ${modifier} }`;
  if (!text.includes(needle)) throw new Error(`找不到 ${modifier} 的 add_dynamic_modifier`);
  return text
    .split('\n')
    .map((line) => {
      const i = line.indexOf(needle);
      if (i < 0) return line;
      return line + '\n' + line.slice(0, i) + `add_ideas = ${idea}`;
    })
    .join('\n');
}

function patchHistory() {
  let text = read(HISTORY);
  const before = text;
  text = text.replace(
    /(^[ \t]*)SCR_theatre_is_truth\n\1SCR_tragic_aesthetics\n\1SCR_eye_of_the_director\n/m,
    '$1SCR_hidden_start_theatre\n$1SCR_hidden_start_tragic\n$1SCR_hidden_start_eye\n'
  );
  if (text !== before) {
    put(HISTORY, text);
    console.log('  - 开局三精神已换成隐藏 idea');
  }
}

function patchFocusFiles() {
  for (const file of [OLD_TREE, CORSI, SWITCH]) {
    let text = read(file);
    const before = text;
    text = removeIdeaGrants(text);
    if (text !== before) {
      put(file, text);
      console.log(`  - 已移除零碎 idea 授予：${path.basename(file)}`);
    }
  }
}

function patchUnlocks() {
  for (const u of UNLOCKS) {
    let text = read(u.file);
    const before = text;
    // 清理旧版隐藏目标 idea 的授予（历史数据迁移）
    text = text.replace(/^[ \t]*add_ideas = SCR_hidden_gaul_gaul[ \t]*\n/gm, '');
    text = u.all
      ? insertAfterAllModifiers(text, u.modifier, u.idea)
      : insertAfterFirstModifier(text, u.modifier, u.idea);
    if (text !== before) {
      put(u.file, text);
      console.log(`  - ${u.modifier} 解锁时并入 ${u.idea}`);
    }
  }
}

function findMatchingBrace(text, openIdx) {
  let d = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === '{') d++;
    else if (text[i] === '}') {
      d--;
      if (d === 0) return i;
    }
  }
  return -1;
}

function patchGaulTimed() {
  let text = read(CORSI);
  const before = text;
  // 旧版：add_dynamic_modifier + 常驻目标国精神 → 统一换成一个 30 天限时效果。
  text = text.replace(
    /^([ \t]*)add_dynamic_modifier = \{ modifier = SCR_dyn_gaul_gaul \}[ \t]*\n/gm,
    '$1SCR_gaul_gaul_timed_effect = yes\n'
  );
  text = text.replace(/^[ \t]*add_ideas = SCR_gaul_vic_bonus[ \t]*\n/gm, '');
  if (text !== before) {
    put(CORSI, text);
    console.log('  - 【高卢，高卢！】改为 30 天限时精神');
  }
}

function patchWarSpirit() {
  let text = read(DECISIONS);
  const before = text;
  const marker = '\t\t\t# ---- 【精神整合】战争精神 起 ----';
  const markerEnd = '\t\t\t# ---- 【精神整合】战争精神 止 ----';
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  text = text.replace(new RegExp(esc(marker) + '[\\s\\S]*?' + esc(markerEnd) + '\\n?', 'g'), '');

  const start = text.indexOf('\tSCR_march_victoria_vfa = {');
  if (start < 0) throw new Error('找不到 SCR_march_victoria_vfa');
  const ce = text.indexOf('complete_effect = {', start);
  if (ce < 0) throw new Error('VFA 找不到 complete_effect');
  const open = text.indexOf('{', ce);
  const close = findMatchingBrace(text, open);
  if (close < 0) throw new Error('VFA complete_effect 不闭合');
  const nl = text.lastIndexOf('\n', close);
  const block = [
    '',
    marker,
    '\t\t\tSCR_gaul_gaul_timed_effect = yes',
    markerEnd,
  ].join('\n');
  text = text.slice(0, nl) + block + text.slice(nl);
  if (text !== before) {
    put(DECISIONS, text);
    console.log('  - 首条「进军维多利亚」已接入 30 天【高卢，高卢！】');
  }
}

put(HIDDEN, HIDDEN_FILE);
patchHistory();
patchFocusFiles();
patchUnlocks();
patchGaulTimed();
patchWarSpirit();
console.log('完成。');
