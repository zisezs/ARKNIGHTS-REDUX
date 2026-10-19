#!/usr/bin/env node
/**
 * SCR 民族精神数值规范化静态校验。
 * 用法：node docs/validate_scr_spirit_numbers.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// 主树 SCR.txt 已改为差异化步进，不再按统一 1%/2%/5% 校验。
const FILES = [
  path.join(ROOT, 'common/national_focus/SCR_corsica_shared.txt'),
  path.join(ROOT, 'common/national_focus/SCR_switch_shared.txt'),
];
const ON_ACTIONS = path.join(ROOT, 'common/on_actions/SCR_spirit_balance_on_actions.txt');
const LOC1 = path.join(ROOT, 'localisation/simp_chinese/SCR_l_simp_chinese.yml');
const LOC2 = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml');
const HIDDEN = path.join(ROOT, 'common/ideas/SCR_consolidated_hidden_ideas.txt');
const BAK = path.join(ROOT, 'docs/SCR_精神数值规范化_备份');

const CLEAN = new Set(['0.02', '0.01', '0.005', '-0.02', '-0.01', '-0.05', '1']);

let failed = 0;
function check(ok, label, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failed++;
}

for (const f of FILES) {
  const text = fs.readFileSync(f, 'utf8');
  const vals = [...text.matchAll(/add_to_variable = \{\s*(SCR_dyn_[a-z0-9_]+)\s*=\s*([-0-9.]+)/g)].map(
    (m) => [m[1], m[2]]
  );
  const bad = vals.filter(([id, v]) => !CLEAN.has(v));
  check(bad.length === 0, `${path.basename(f)} 步进全部为 1%/2%/5%/0.5%/1 点`, bad.map((x) => x.join('=')).join(', '));
  check(!/SCR_dyn_gaul(_lite)?\s*=/.test(text), `${path.basename(f)} 不再给战争变量加数`);
  check(!/SCR_dyn_corsica_lite\s*=/.test(text), `${path.basename(f)} 不再给科西嘉 lite 加数`);
}

check(fs.existsSync(ON_ACTIONS), '新增数值封顶 on_actions 已生成');
const oa = fs.readFileSync(ON_ACTIONS, 'utf8');
for (const id of [
  'SCR_dyn_leadership',
  'SCR_dyn_leadership_lite',
  'SCR_dyn_leadership_drift',
  'SCR_dyn_control',
  'SCR_dyn_control_neg',
  'SCR_dyn_control_int',
  'SCR_dyn_army',
  'SCR_dyn_army_lite',
  'SCR_dyn_army_neg',
  'SCR_dyn_army_supply',
  'SCR_dyn_rebuild',
  'SCR_dyn_rebuild_lite',
  'SCR_dyn_rebuild_neg',
  'SCR_dyn_corsica',
  'SCR_dyn_corsica_army',
  'SCR_dyn_corsica_int',
  'SCR_dyn_corsica_economy',
  'SCR_dyn_corsica_economy_lite',
  'SCR_dyn_corsica_economy_cg',
  'SCR_dyn_corsica_military',
  'SCR_dyn_corsica_military_lite',
]) {
  check(new RegExp(`clamp_variable = \\{ var = ${id} min = [-0-9.]+ max = [-0-9.]+ \\}`).test(oa), `月度封顶 ${id}`);
}
check(/min = 0 max = 0\.25/.test(oa) && /min = -0\.25 max = 0/.test(oa), '百分比封顶 ±25%');
check(/var = SCR_dyn_control_int min = 0 max = 2/.test(oa) && /var = SCR_dyn_corsica_int min = 0 max = 2/.test(oa), '加密/破译封顶 2');

const loc = fs.readFileSync(LOC1, 'utf8') + '\n' + fs.readFileSync(LOC2, 'utf8');
check(/SCR_dyn_leadership_value_tt:.*\$RIGHT\|=%0\$/.test(loc) || /SCR_dyn_leadership_value_tt:.*\$RIGHT\|\+=%0\$/.test(loc), '百分比 tooltip 0 位小数');
check(/SCR_dyn_leadership_drift_value_tt:.*\$RIGHT\|\+=%1\$/.test(loc), '漂移 tooltip 保留 1 位小数');
check(/SCR_dyn_leadership_tooltip:.*\+25%/.test(loc), '高卢的冠冕总览写 25%');
check(/SCR_dyn_army_tooltip:.*取舍/.test(loc), '返场的军团总览改为取舍说明');
check(/SCR_dyn_corsica_tooltip:.*\+25%/.test(loc), '世界之都的倒影总览写 25%');
check(/SCR_dyn_corsica_military_tooltip:.*\+25%/.test(loc), '高卢战争机器总览写 25%');
const hidden = fs.readFileSync(HIDDEN, 'utf8');
check(
  /SCR_dyn_gaul_gaul = \{[\s\S]*?modifier = \{[\s\S]*?army_attack_factor = 0\.25[\s\S]*?army_defence_factor = 0\.25[\s\S]*?army_morale_factor = 0\.25/.test(hidden),
  '高卢，高卢！固定数值写在可见 idea 里（引擎可渲染）'
);
check(
  /SCR_gaul_gaul_timed_effect = \{[\s\S]*?add_timed_idea = \{ idea = SCR_dyn_gaul_gaul days = 30 \}/.test(
    fs.readFileSync(path.join(ROOT, 'common/scripted_effects/SCR_scripted_effects.txt'), 'utf8')
  ),
  '高卢，高卢！以 30 天限时精神挂载'
);
check(
  /SCR_gaul_vic_bonus = \{[\s\S]*?targeted_modifier = \{[\s\S]*?tag = VIC[\s\S]*?attack_bonus_against = 0\.1/.test(hidden),
  '对维多利亚的目标国修正放在可见 country 类 idea'
);

check(!/SCR_hidden_gaul_gaul/.test(hidden), '不再使用 hidden_ideas 承载目标国修正');
check(!/conscription_factor = 0\.07/.test(hidden), '不再出现 7% 这类零碎值');

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
check(bal(oa) === 0 && bal(hidden) === 0, 'on_actions / hidden ideas 花括号配平');
check(FILES.every((f) => bal(fs.readFileSync(f, 'utf8')) === 0), '焦点文件花括号配平');

for (const f of [
  'common__national_focus__SCR.txt',
  'common__national_focus__SCR_corsica_shared.txt',
  'common__national_focus__SCR_switch_shared.txt',
  'common__dynamic_modifiers__SCR_dynamic_modifiers.txt',
  'localisation__simp_chinese__SCR_l_simp_chinese.yml',
  'localisation__simp_chinese__ARF_SCR_corsica_effects_l_simp_chinese.yml',
]) {
  check(fs.existsSync(path.join(BAK, f)), `改动前备份存在：${f}`);
}

console.log(failed === 0 ? '\nIS_PASS' : `\nIS_FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
