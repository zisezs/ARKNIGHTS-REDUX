#!/usr/bin/env node
/**
 * SCR 决议「收复林贡斯（LIG）」静态校验。
 * 用法：node docs/validate_scr_recover_lingons.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEC = path.join(ROOT, 'common/decisions/SCR_Decisions.txt');
const LOC = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml');
const BAK = path.join(ROOT, 'docs/SCR_收复林贡斯_备份');

let failed = 0;
function check(ok, label, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failed++;
}

const dec = fs.readFileSync(DEC, 'utf8');
const loc = fs.readFileSync(LOC, 'utf8');

check((dec.match(/SCR_recover_lingons = \{/g) || []).length === 1, '决议只出现一次');
const catStart = dec.indexOf('SCR_theatre_category = {');
const decPos = dec.indexOf('SCR_recover_lingons = {');
const tourPos = dec.indexOf('SCR_tour_category = {');
check(catStart >= 0 && decPos > catStart && tourPos > decPos, '决议位于 SCR_theatre_category（幕后）内');
check(/available = \{[\s\S]*?date > 1095\.9\.30[\s\S]*?\}/.test(dec), '1095 年 10 月 1 日起可用');
check(/custom_trigger_tooltip = \{[\s\S]*?SCR_recover_lingons_date_tt[\s\S]*?date > 1095\.9\.30/.test(dec), '日期条件有自定义 tooltip');
check(/LIG = \{ exists = yes \}/.test(dec), 'LIG 必须存在');
check(/fire_only_once = yes/.test(dec), '一次性决议');
check(
  /LIG = \{\n\t\t\t\tevery_owned_state = \{\n\t\t\t\t\tlimit = \{ is_core_of = LIG \}\n\t\t\t\t\tadd_core_of = ROOT\n\t\t\t\t\}\n\t\t\t\}\n\t\t\tannex_country = \{ target = LIG \}/.test(
    dec
  ),
  '先转核心再吞并 LIG'
);
check(/cost = 0/.test(dec), '决议成本 0');
check(/icon = GFX_decision_generic_nationalism/.test(dec), '决议图标存在');

check(loc.charCodeAt(0) === 0xfeff, 'loc 文件带单个 UTF-8 BOM');
for (const k of [
  'SCR_recover_lingons:',
  'SCR_recover_lingons_desc:',
  'SCR_recover_lingons_tt:',
  'SCR_recover_lingons_date_tt:',
]) {
  check(loc.includes(k), `loc 键 ${k.replace(':', '')}`);
}
check(loc.includes('1095 年 10 月之后'), 'desc/date tooltip 写明启用时间');

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
check(bal(dec) === 0, 'SCR_Decisions.txt 花括号配平');

for (const f of [
  'common__decisions__SCR_Decisions.txt',
  'localisation__simp_chinese__ARF_SCR_corsica_effects_l_simp_chinese.yml',
]) {
  const p = path.join(BAK, f);
  check(fs.existsSync(p), `改动前备份存在：${f}`);
  if (fs.existsSync(p)) check(!fs.readFileSync(p, 'utf8').includes('SCR_recover_lingons'), `备份是改动前版本：${f}`);
}
for (const f of [
  'after/common__decisions__SCR_Decisions.txt',
  'after/localisation__simp_chinese__ARF_SCR_corsica_effects_l_simp_chinese.yml',
]) {
  check(fs.existsSync(path.join(BAK, f)), `改动后快照存在：${f}`);
}

console.log(failed === 0 ? '\nIS_PASS' : `\nIS_FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
