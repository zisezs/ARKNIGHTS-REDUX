#!/usr/bin/env node
/**
 * SCR 旧国策树「核心圈式自动演出」静态校验。
 * 用法：node docs/validate_scr_legacy_auto.cjs
 * 退出码 0 = 全部通过；1 = 有失败项。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TREE = path.join(ROOT, 'common/national_focus/SCR.txt');
const EFFECTS = path.join(ROOT, 'common/scripted_effects/SCR_legacy_auto_effects.txt');
const EVENTS = path.join(ROOT, 'events/SCR_legacy_auto.txt');
const ON_ACTIONS = path.join(ROOT, 'common/on_actions/SCR_legacy_auto_on_actions.txt');
const LOC = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_legacy_auto_l_simp_chinese.yml');
const ROOT_ID = 'SCR_the_curtain_rises';

let failed = 0;
function check(ok, label, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failed++;
}

const tree = fs.readFileSync(TREE, 'utf8');
const effects = fs.readFileSync(EFFECTS, 'utf8');
const events = fs.readFileSync(EVENTS, 'utf8');
const onActions = fs.readFileSync(ON_ACTIONS, 'utf8');
const loc = fs.readFileSync(LOC, 'utf8');

const blocks = [...tree.matchAll(/\tfocus = \{\n([\s\S]*?)\n\t\}/g)].map((m) => m[1]);
const ids = blocks.map((b) => (b.match(/id = (\S+)/) || [])[1]);
check(blocks.length === 66, '旧树 66 格', String(blocks.length));
check(new Set(ids).size === ids.length, '旧树 id 无重复');

const root = blocks.find((b) => (b.match(/id = (\S+)/) || [])[1] === ROOT_ID);
check(!!root, '根国策存在');
check(root.includes('SCR_legacy_auto_start = yes'), '根国策 completion_reward 已接自动演出');
check(!root.includes('【旧树自动演出】自动推进锁'), '根国策没有被锁');

const locked = blocks.filter((b) => b.includes('【旧树自动演出】自动推进锁 起'));
check(locked.length === 65, '其余 65 格全部上锁', String(locked.length));
check(
  locked.every((b) => b.includes('custom_override_tooltip') && b.includes('always = no')),
  '锁块使用 custom_override_tooltip + always = no'
);
check(
  locked.every((b) => (b.match(/\n\t\tavailable = \{/g) || []).length === 1),
  '每格只有一个 available 锁（旧手动条件已清除）'
);
check((root.match(/\n\t\tavailable = \{/g) || []).length === 0, '根格没有 available 锁');

const effectsIds = [...effects.matchAll(/\bactivate_shine_on_focus = (\S+)/g)].map((m) => m[1]);
const completedIds = [...effects.matchAll(/complete_national_focus = \{ focus = (\S+) use_side_message = yes \}/g)].map(
  (m) => m[1]
);
const shineChecks = [...effects.matchAll(/has_shine_effect_on_focus = (\S+)/g)].map((m) => m[1]);
const seq = ids.filter((id) => id !== ROOT_ID);
check(effectsIds.length === 65, '排程链 65 格（不含根）', String(effectsIds.length));
check(completedIds.length === 65, '结算链 65 格', String(completedIds.length));
check(shineChecks.length === 130, '金光检查 65+65 条', String(shineChecks.length));
check(
  effectsIds.join('|') === seq.join('|') && completedIds.join('|') === seq.join('|'),
  '推进顺序 = 国策文件顺序'
);
check(new Set(effectsIds).size === 65, '序列无重复');

check(/country_event = \{ id = SCR_legacy_auto\.1 days = 35 \}/.test(effects), '调度事件 35 天');
check(/set_country_flag = SCR_legacy_auto_done/.test(effects), '完成旗标存在');
check(/SCR_legacy_auto_schedule = yes/.test(effects), '链尾继续排程');
check(
  /NOT = \{ has_completed_focus = SCR_lights_of_londinium_again \}\n\t\t\towns_state = 483\n\t\t\thas_full_control_of_state = 483/.test(
    effects
  ),
  '末格保留林贡斯占有门槛'
);
check(/NOT = \{ has_completed_focus = SCR_lights_of_londinium_again \}/.test(effects), '末格未满足时停链等待');
const gated = locked.find((b) => b.includes('id = SCR_lights_of_londinium_again'));
check(!!gated && gated.includes('SCR_legacy_auto_wait_tt'), '末格锁 tooltip 提示等待林贡斯');
check(/add_namespace = SCR_legacy_auto/.test(events), '事件命名空间已声明');
check(/id = SCR_legacy_auto\.1/.test(events) && /is_triggered_only = yes/.test(events), '结算事件定义完整');

check(/on_startup = \{/.test(onActions) && /on_monthly_SCR = \{/.test(onActions), 'on_startup / on_monthly_SCR 兜底存在');
check((onActions.match(/SCR_legacy_auto_schedule = yes/g) || []).length === 2, '兜底两处调用排程');

const locKeys = [...loc.matchAll(/^\s*(SCR_legacy_auto_[a-z_]+):/gm)].map((m) => m[1]);
check(loc.charCodeAt(0) === 0xfeff, 'loc 文件带单个 UTF-8 BOM');
for (const k of [
  'SCR_legacy_auto_tt',
  'SCR_legacy_auto_start_tt',
  'SCR_legacy_auto_progress_tt',
  'SCR_legacy_auto_wait_tt',
]) {
  check(locKeys.includes(k), `loc 键 ${k}`);
}
check(/SCR_legacy_auto_progress_tt:.*已执行.*\$FLAG_DAYS\$/.test(loc), '进度文本使用「已执行 X 天」');
check(!/剩余/.test(loc) && !/天后完成/.test(loc), '进度文本不再写「剩余/天后完成」');

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
check(bal(tree) === 0, 'SCR.txt 花括号配平');
check(bal(effects) === 0, 'effects 花括号配平');
check(bal(events) === 0, 'events 花括号配平');
check(bal(onActions) === 0, 'on_actions 花括号配平');

console.log(failed === 0 ? '\nIS_PASS' : `\nIS_FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
