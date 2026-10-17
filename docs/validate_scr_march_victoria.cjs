#!/usr/bin/env node
/**
 * SCR 决议组「进军维多利亚」静态校验。
 * 用法：node docs/validate_scr_march_victoria.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CATEGORIES = path.join(ROOT, 'common/decisions/categories/SCR_decision_categories.txt');
const DECISIONS = path.join(ROOT, 'common/decisions/SCR_Decisions.txt');
const LOC = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml');
const BAK = path.join(ROOT, 'docs/SCR_进军维多利亚_备份');

const STEPS = [
  ['VFA', 'SCR_march_victoria_vfa', null],
  ['VVI', 'SCR_march_victoria_vvi', 'SCR_march_victoria_vfa_done'],
  ['BRT', 'SCR_march_victoria_brt', 'SCR_march_victoria_vvi_done'],
  ['BGD', 'SCR_march_victoria_bgd', 'SCR_march_victoria_brt_done'],
];

let failed = 0;
function check(ok, label, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failed++;
}

const cats = fs.readFileSync(CATEGORIES, 'utf8');
const dec = fs.readFileSync(DECISIONS, 'utf8');
const loc = fs.readFileSync(LOC, 'utf8');

check((cats.match(/SCR_march_victoria_category = \{/g) || []).length === 1, '分类元数据只出现一次');
check(/SCR_march_victoria_category = \{[\s\S]*?icon = GFX_decision_generic_army_support[\s\S]*?original_tag = SCR/.test(cats), '分类图标与 SCR 限制');
check((dec.match(/SCR_march_victoria_category = \{/g) || []).length === 1, '决议分类容器只出现一次');

const positions = [];
for (const [tag, id, prev] of STEPS) {
  const pos = dec.indexOf(`${id} = {`);
  positions.push(pos);
  check(pos >= 0, `${id} 存在`);
  const blockStart = pos;
  const blockEnd = dec.indexOf('\n\t}', pos);
  const block = dec.slice(blockStart, blockEnd);
  check(/cost = 50/.test(block), `${tag} 消耗 50 政治点`);
  check(/days_re_enable = 30/.test(block), `${tag} 冷却 30 天`);
  check(/fire_only_once = yes/.test(block), `${tag} 一次性`);
  check(/ai_will_do = \{ base = 1000 \}/.test(block), `${tag} AI 权重 1000`);
  check(/date > 1095\.11\.30/.test(block), `${tag} 1095.12.01 起可用`);
  check(/every_owned_state = \{\s*add_core_of = ROOT/.test(block), `${tag} 全部拥有地块转核心`);
  check(new RegExp(`declare_war_on = \\{ target = ${tag} type = annex_everything \\}`).test(block), `${tag} 宣战 annex_everything`);
  check(/flag = SCR_march_victoria_cd days = 30 value = 1/.test(block), `${tag} 写入 30 天冷却旗标`);
  if (prev) check(new RegExp(`has_country_flag = ${prev}`).test(block), `${tag} 需要上一步 ${prev}`);
  else check(!/has_country_flag = SCR_march_victoria_vfa_done/.test(block), 'VFA 不需要前置完成旗标');
}
check(positions.every((p, i) => i === 0 || p > positions[i - 1]), '四条决议按 VFA→VVI→BRT→BGD 排列');

check(loc.charCodeAt(0) === 0xfeff, 'loc 文件带单个 UTF-8 BOM');
for (const k of [
  'SCR_march_victoria_category:',
  'SCR_march_victoria_category_desc:',
  'SCR_march_victoria_vfa:',
  'SCR_march_victoria_vfa_desc:',
  'SCR_march_victoria_vvi:',
  'SCR_march_victoria_brt:',
  'SCR_march_victoria_bgd:',
  'SCR_march_victoria_date_tt:',
  'SCR_march_victoria_date_tt_NOT:',
  'SCR_march_victoria_cooldown_tt:',
  'SCR_march_victoria_cooldown_tt_NOT:',
  'SCR_march_victoria_prev_tt:',
  'SCR_march_victoria_prev_tt_NOT:',
  'SCR_march_victoria_tt:',
]) {
  check(loc.includes(k), `loc 键 ${k.replace(':', '')}`);
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
check(bal(cats) === 0 && bal(dec) === 0, '花括号配平');

for (const f of [
  'common__decisions__categories__SCR_decision_categories.txt',
  'common__decisions__SCR_Decisions.txt',
  'localisation__simp_chinese__ARF_SCR_corsica_effects_l_simp_chinese.yml',
]) {
  const p = path.join(BAK, f);
  check(fs.existsSync(p), `改动前备份存在：${f}`);
  if (fs.existsSync(p)) check(!fs.readFileSync(p, 'utf8').includes('SCR_march_victoria_category'), `备份是改动前版本：${f}`);
  check(fs.existsSync(path.join(BAK, 'after', f)), `改动后快照存在：${f}`);
}

console.log(failed === 0 ? '\nIS_PASS' : `\nIS_FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
