#!/usr/bin/env node
/**
 * SCR 常驻民族精神整合静态校验。
 * 用法：node docs/validate_scr_spirit_consolidation.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HIDDEN = path.join(ROOT, 'common/ideas/SCR_consolidated_hidden_ideas.txt');
const HISTORY = path.join(ROOT, 'history/countries/SCR - Crimson Troupe.txt');
const OLD = path.join(ROOT, 'common/national_focus/SCR.txt');
const CORSI = path.join(ROOT, 'common/national_focus/SCR_corsica_shared.txt');
const SWITCH = path.join(ROOT, 'common/national_focus/SCR_switch_shared.txt');
const DEC = path.join(ROOT, 'common/decisions/SCR_Decisions.txt');
const BAK = path.join(ROOT, 'docs/SCR_民族精神整合_备份');

const SMALL = [
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

const VISIBLE = [
  'SCR_dyn_leadership',
  'SCR_dyn_control',
  'SCR_dyn_army',
  'SCR_dyn_rebuild',
  'SCR_dyn_corsica',
  'SCR_dyn_corsica_economy',
  'SCR_dyn_corsica_military',
  'SCR_dyn_gaul_gaul',
];

const HIDDEN_IDS = [
  'SCR_hidden_start_theatre',
  'SCR_hidden_start_tragic',
  'SCR_hidden_start_eye',
  'SCR_hidden_old_control',
  'SCR_hidden_corsica',
  'SCR_hidden_corsica_economy',
  'SCR_hidden_corsica_military',
];

let failed = 0;
function check(ok, label, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failed++;
}

const hidden = fs.readFileSync(HIDDEN, 'utf8');
const history = fs.readFileSync(HISTORY, 'utf8');
const old = fs.readFileSync(OLD, 'utf8');
const corsi = fs.readFileSync(CORSI, 'utf8');
const sw = fs.readFileSync(SWITCH, 'utf8');
const dec = fs.readFileSync(DEC, 'utf8');

check(/ideas = \{\s*hidden_ideas = \{/.test(hidden), '隐藏 idea 文件结构正确');
for (const id of HIDDEN_IDS) check(hidden.includes(`${id} = {`), `隐藏 idea ${id} 存在`);
check((hidden.match(/^\t\tSCR_hidden_[a-z0-9_]+ = \{/gm) || []).length === 7, '隐藏 idea 恰好 7 个');
check(
  /country = \{[\s\S]*?SCR_gaul_vic_bonus = \{[\s\S]*?targeted_modifier = \{[\s\S]*?tag = VIC/.test(hidden),
  '目标国修正使用可见 country 类 idea（SCR_gaul_vic_bonus）'
);

check(!/add_ideas = \{[\s\S]*?SCR_theatre_is_truth[\s\S]*?\}/.test(history), '开局不再显示三个小精神');
for (const id of ['SCR_hidden_start_theatre', 'SCR_hidden_start_tragic', 'SCR_hidden_start_eye']) {
  check(history.includes(id), `开局使用 ${id}`);
}

for (const [label, text] of [
  ['SCR.txt', old],
  ['SCR_corsica_shared.txt', corsi],
  ['SCR_switch_shared.txt', sw],
]) {
  const left = SMALL.filter((id) => new RegExp(`add_ideas = ${id}\\b`).test(text));
  check(left.length === 0, `${label} 不再授予零碎常驻 idea`, left.join(', '));
}

for (const [file, text, mod, idea] of [
  ['SCR.txt', old, 'SCR_dyn_control', 'SCR_hidden_old_control'],
  ['SCR_corsica_shared.txt', corsi, 'SCR_dyn_corsica', 'SCR_hidden_corsica'],
  ['SCR_corsica_shared.txt', corsi, 'SCR_dyn_corsica_economy', 'SCR_hidden_corsica_economy'],
  ['SCR_corsica_shared.txt', corsi, 'SCR_dyn_corsica_military', 'SCR_hidden_corsica_military'],
]) {
  check(
    new RegExp(`add_dynamic_modifier = \\{ modifier = ${mod} \\}\\n[ \\t]*add_ideas = ${idea}`).test(text),
    `${file}：${mod} 解锁时并入 ${idea}`
  );
}
check(/SCR_gaul_gaul_timed_effect = yes/.test(dec), '30 天【高卢，高卢！】已接入宣战决议');
check(/SCR_gaul_gaul_timed_effect = yes/.test(corsi), '【高卢，高卢！】已接入科西嘉线全部解锁点');
check(/SCR_dyn_gaul_gaul = \{[\s\S]*?modifier = \{/.test(hidden), '【高卢，高卢！】已改为可见 idea');

for (const id of VISIBLE) {
  check(
    old.includes(id) || corsi.includes(id) || dec.includes(id) || hidden.includes(`${id} = {`),
    `可见精神 ${id} 仍有来源`
  );
}
for (const [label, text] of [
  ['SCR.txt', old],
  ['SCR_corsica_shared.txt', corsi],
  ['SCR_switch_shared.txt', sw],
]) {
  check(/add_timed_idea/.test(text), `${label} 限时精神仍保留`);
}

const bal = (s) => {
  let n = 0;
  for (const line of s.split('\n')) {
    const l = line.replace(/#.*$/, '');
    for (const c of l) {
      if (c === '{') n++;
      else if (c === '}') n--;
      if (n < 0) return -1;
    }
  }
  return n;
};
check(bal(hidden) === 0, '隐藏 idea 花括号配平');
check(bal(old) === 0 && bal(corsi) === 0 && bal(sw) === 0 && bal(dec) === 0, '改动的焦点/决议文件花括号配平');

for (const f of [
  'history__countries__SCR - Crimson Troupe.txt',
  'common__national_focus__SCR.txt',
  'common__national_focus__SCR_corsica_shared.txt',
  'common__national_focus__SCR_switch_shared.txt',
  'common__decisions__SCR_Decisions.txt',
]) {
  check(fs.existsSync(path.join(BAK, f)), `改动前备份存在：${f}`);
}

console.log(failed === 0 ? '\nIS_PASS' : `\nIS_FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
