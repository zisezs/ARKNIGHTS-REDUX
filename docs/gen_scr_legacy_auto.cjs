#!/usr/bin/env node
/**
 * 猩红剧团（SCR）旧国策树 · 核心圈式自动演出
 *
 * 做什么：
 *   1. 玩家点完根国策「大幕拉开」(SCR_the_curtain_rises) 后，
 *      旧树其余 65 格全部锁住（不可手动点），由脚本按文件顺序逐格自动完成。
 *   2. 每格 35 天（= 原 cost 5 周），当前格冒金光，完成后再启动下一格。
 *   3. 隐藏事件 + 定时 35 天；月度兜底防断链。
 *
 * 产物：
 *   common/scripted_effects/SCR_legacy_auto_effects.txt
 *   events/SCR_legacy_auto.txt
 *   common/on_actions/SCR_legacy_auto_on_actions.txt
 *   localisation/simp_chinese/ARF_SCR_legacy_auto_l_simp_chinese.yml
 *   并幂等改写 common/national_focus/SCR.txt：
 *     - 根格 completion_reward 末尾加 SCR_legacy_auto_start = yes
 *     - 其余 65 格加 available 锁（金光格显示剩余天数）
 *
 * 用法：node docs/gen_scr_legacy_auto.cjs
 * 幂等：连跑两次逐字节一致。
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
const TIMELINE = path.join(ROOT, 'docs/SCR_旧树自动演出_推进表.md');
const PARENT_LOC = path.join(ROOT, 'localisation/simp_chinese/SCR_l_simp_chinese.yml');

const ROOT_ID = 'SCR_the_curtain_rises';
const DAYS = 35;

// 旧树里唯一带手动可用条件的格：林贡斯重新点灯（owns_state + 完全控制 483）。
// 自动演出保留这个门槛：条件没满足时停在最后一格等，不硬完成。
const GATED_FOCUS = {
  id: 'SCR_lights_of_londinium_again',
  triggers: ['owns_state = 483', 'has_full_control_of_state = 483'],
};

const LOCK_START = '\t\t# ---- 【旧树自动演出】自动推进锁 起 ----';
const LOCK_END = '\t\t# ---- 【旧树自动演出】自动推进锁 止 ----';
const START_START = '\t\t\t# ---- 【旧树自动演出】启动 起 ----';
const START_END = '\t\t\t# ---- 【旧树自动演出】启动 止 ----';

function read(rel) {
  return fs.readFileSync(rel, 'utf8');
}

function put(rel, content, backupDir) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  if (fs.existsSync(rel)) {
    const old = fs.readFileSync(rel);
    if (old.equals(buf)) return false;
    if (backupDir) {
      fs.mkdirSync(backupDir, { recursive: true });
      fs.writeFileSync(
        path.join(backupDir, path.relative(ROOT, rel).replace(/[\\/]/g, '__')),
        old
      );
    }
  }
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  fs.writeFileSync(rel, buf);
  return true;
}

function findMatchingBrace(text, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const c = text[i];
    if (c === '#') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** 解析 SCR.txt 里的 focus 块（含在原文中的起止位置）。 */
function parseFocusBlocks(text) {
  const blocks = [];
  const re = /\tfocus = \{\n/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index;
    const open = text.indexOf('{', start);
    const close = findMatchingBrace(text, open);
    if (close < 0) throw new Error(`focus 块花括号不闭合，起点 ${start}`);
    const end = close + 1;
    const body = text.slice(start, end);
    const id = (body.match(/^\tfocus = \{\n\t\tid = (\S+)$/m) || [])[1];
    if (!id) {
      re.lastIndex = end;
      continue;
    }
    const prereq = [
      ...body.matchAll(/prerequisite = \{\n\t\t\tfocus = (\S+)\n\t\t\}/g),
    ].map((x) => x[1]);
    blocks.push({ id, start, end, body, prereq });
    re.lastIndex = end;
  }
  return blocks;
}

function removeMarkerBlock(text, startMark, endMark) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(esc(startMark) + '[\\s\\S]*?' + esc(endMark) + '\\n?', 'g'), '');
}

/** 去掉 focus 块里已有的顶层 available 块（自动演出接管手动可用条件）。 */
function removeAvailableBlock(block) {
  const m = /\n\t\tavailable = \{/.exec(block);
  if (!m) return block;
  const open = block.indexOf('{', m.index);
  const close = findMatchingBrace(block, open);
  if (close < 0) throw new Error('available 块不闭合');
  return block.slice(0, m.index) + block.slice(close + 1);
}

function lockBlock(id) {
  const lines = [
    LOCK_START,
    '\t\tavailable = {',
    '\t\t\tif = {',
    `\t\t\t\tlimit = { has_shine_effect_on_focus = ${id} }`,
    '\t\t\t\tcustom_override_tooltip = {',
    '\t\t\t\t\ttooltip = {',
    '\t\t\t\t\t\tlocalization_key = SCR_legacy_auto_progress_tt',
    '\t\t\t\t\t\tFLAG_DAYS = [?SCR_legacy_auto_prog:days]',
    '\t\t\t\t\t}',
    '\t\t\t\t\talways = no',
    '\t\t\t\t}',
    '\t\t\t}',
  ];
  if (id === GATED_FOCUS.id) {
    lines.push(
      '\t\t\telse_if = {',
      '\t\t\t\tlimit = {',
      '\t\t\t\t\tNOT = {',
      ...GATED_FOCUS.triggers.map((t) => `\t\t\t\t\t\t${t}`),
      '\t\t\t\t\t}',
      '\t\t\t\t}',
      '\t\t\t\tcustom_override_tooltip = {',
      '\t\t\t\t\ttooltip = SCR_legacy_auto_wait_tt',
      '\t\t\t\t\talways = no',
      '\t\t\t\t}',
      '\t\t\t}'
    );
  }
  lines.push(
    '\t\t\telse = {',
    '\t\t\t\tcustom_override_tooltip = {',
    '\t\t\t\t\ttooltip = SCR_legacy_auto_tt',
    '\t\t\t\t\talways = no',
    '\t\t\t\t}',
    '\t\t\t}',
    '\t\t}',
    LOCK_END
  );
  return lines.join('\n');
}

function insertLock(block, id) {
  const m = /\n\t\tcost = -?\d+\n/.exec(block);
  if (!m) throw new Error(`${id} 找不到 cost 行`);
  const at = m.index + m[0].length;
  return block.slice(0, at) + lockBlock(id) + '\n' + block.slice(at);
}

function insertStart(block, id) {
  const m = /\n\t\tcompletion_reward = \{/.exec(block);
  if (!m) throw new Error(`${id} 找不到 completion_reward`);
  const open = block.indexOf('{', m.index);
  const close = findMatchingBrace(block, open);
  if (close < 0) throw new Error(`${id} 的 completion_reward 不闭合`);
  const nl = block.lastIndexOf('\n', close);
  const insert = [
    '',
    START_START,
    '\t\t\tcustom_effect_tooltip = SCR_legacy_auto_start_tt',
    '\t\t\tSCR_legacy_auto_start = yes',
    START_END,
  ].join('\n');
  return block.slice(0, nl) + insert + block.slice(nl);
}

function patchTree() {
  let text = read(TREE);
  const before = text;

  // 幂等：先清掉上一轮的标记块
  text = removeMarkerBlock(text, LOCK_START, LOCK_END);
  text = removeMarkerBlock(text, START_START, START_END);

  const blocks = parseFocusBlocks(text);
  if (blocks.length !== 66) throw new Error(`旧树解析到 ${blocks.length} 格，预期 66 格`);
  const rootIndex = blocks.findIndex((b) => b.id === ROOT_ID);
  if (rootIndex < 0) throw new Error(`找不到根国策 ${ROOT_ID}`);

  // 文件顺序必须满足前置（脚本按这个顺序推进）
  const index = new Map(blocks.map((b, i) => [b.id, i]));
  for (const b of blocks) {
    for (const p of b.prereq) {
      if (!index.has(p) || index.get(p) >= index.get(b.id)) {
        throw new Error(`前置顺序不满足：${b.id} <- ${p}`);
      }
    }
  }

  let out = '';
  let last = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    let body = b.body;
    if (i === rootIndex) {
      body = insertStart(body, b.id);
    } else {
      body = removeAvailableBlock(body);
      body = insertLock(body, b.id);
    }
    out += text.slice(last, b.start) + body;
    last = b.end;
  }
  out += text.slice(last);
  text = out;

  if (text !== before) {
    put(TREE, text, path.join(ROOT, 'docs', 'SCR_旧树自动演出_备份'));
    console.log('  - 已改写 SCR.txt：根格启动 + 65 格自动推进锁');
  }
  return blocks;
}

function buildEffects(ids) {
  const shineOr = ids.map((id) => `\t\t\t\thas_shine_effect_on_focus = ${id}`).join('\n');
  // 注意：排程链的链头是上面的「已在推进」if，所以这里全部用 else_if。
  const schedule = ids
    .map((id) => {
      const gate =
        id === GATED_FOCUS.id
          ? '\n' + GATED_FOCUS.triggers.map((t) => `\t\t\t${t}`).join('\n')
          : '';
      return [
        '\telse_if = {',
        '\t\tlimit = {',
        `\t\t\tNOT = { has_completed_focus = ${id} }${gate}`,
        '\t\t}',
        `\t\tactivate_shine_on_focus = ${id}`,
        `\t\tset_country_flag = { flag = SCR_legacy_auto_prog days = ${DAYS} value = 1 }`,
        `\t\tcountry_event = { id = SCR_legacy_auto.1 days = ${DAYS} }`,
        '\t}',
      ].join('\n');
    })
    .join('\n');
  const step = ids
    .map((id, i) => {
      const kw = i === 0 ? 'if' : 'else_if';
      return [
        `\t${kw} = {`,
        `\t\tlimit = { has_shine_effect_on_focus = ${id} }`,
        `\t\tdeactivate_shine_on_focus = ${id}`,
        `\t\tcomplete_national_focus = { focus = ${id} use_side_message = yes }`,
        '\t}',
      ].join('\n');
    })
    .join('\n');

  return [
    '######################################################',
    '# 猩红剧团（SCR）旧国策树 · 核心圈式自动演出',
    '# 根国策完成 → 其余 65 格按文件顺序逐格自动完成，每格 35 天（原 cost 5 周）',
    '# 生成器：docs/gen_scr_legacy_auto.cjs（勿手改本文件）',
    '######################################################',
    '',
    '# 启动：根国策 completion_reward 调用；已完成根的旧档由 on_actions 兜底',
    'SCR_legacy_auto_start = {',
    '\tif = {',
    '\t\tlimit = { NOT = { has_country_flag = SCR_legacy_auto_done } }',
    '\t\tSCR_legacy_auto_schedule = yes',
    '\t}',
    '}',
    '',
    '# 排程：已在推进则不动；否则点亮下一个未完成格并预约 35 天后的结算事件',
    'SCR_legacy_auto_schedule = {',
    '\tif = {',
    '\t\tlimit = {',
    '\t\t\tOR = {',
    shineOr,
    '\t\t\t}',
    '\t\t}',
    '\t\t# 已在推进，什么都不做',
    '\t}',
    schedule,
    '\telse = {',
    '\t\tif = {',
    `\t\t\tlimit = { NOT = { has_completed_focus = ${GATED_FOCUS.id} } }`,
    '\t\t\t# 最后一格在等林贡斯光复：不设 done，月度兜底会重试',
    '\t\t}',
    '\t\telse = {',
    '\t\t\tset_country_flag = SCR_legacy_auto_done',
    '\t\t\tclr_country_flag = SCR_legacy_auto_prog',
    '\t\t}',
    '\t}',
    '}',
    '',
    '# 结算：完成正在冒金光的那一格，然后排下一格',
    'SCR_legacy_auto_step = {',
    step,
    '\tSCR_legacy_auto_schedule = yes',
    '}',
    '',
  ].join('\n');
}

function buildEvents() {
  return [
    '######################################################',
    '# 猩红剧团（SCR）旧国策树 · 自动演出结算事件',
    '# 生成器：docs/gen_scr_legacy_auto.cjs（勿手改本文件）',
    '######################################################',
    '',
    'add_namespace = SCR_legacy_auto',
    '',
    'country_event = {',
    '\tid = SCR_legacy_auto.1',
    '\thidden = yes',
    '\tis_triggered_only = yes',
    '',
    '\timmediate = {',
    '\t\tSCR_legacy_auto_step = yes',
    '\t}',
    '}',
    '',
  ].join('\n');
}

function buildOnActions() {
  return [
    '######################################################',
    '# 猩红剧团（SCR）旧国策树 · 自动演出兜底',
    '# 生成器：docs/gen_scr_legacy_auto.cjs（勿手改本文件）',
    '# 同名 on_action 跨文件合并执行；这里只追加，不影响 SCR_on_actions.txt',
    '######################################################',
    '',
    'on_actions = {',
    '\ton_startup = {',
    '\t\teffect = {',
    '\t\t\tSCR = {',
    '\t\t\t\tif = {',
    '\t\t\t\t\tlimit = {',
    '\t\t\t\t\t\thas_completed_focus = SCR_the_curtain_rises',
    '\t\t\t\t\t\tNOT = { has_country_flag = SCR_legacy_auto_done }',
    '\t\t\t\t\t}',
    '\t\t\t\t\tSCR_legacy_auto_schedule = yes',
    '\t\t\t\t}',
    '\t\t\t}',
    '\t\t}',
    '\t}',
    '\t# on_monthly_SCR：本引擎支持 on_monthly_<TAG> 国家作用域月度钩子',
    '\ton_monthly_SCR = {',
    '\t\teffect = {',
    '\t\t\tif = {',
    '\t\t\t\tlimit = {',
    '\t\t\t\t\thas_completed_focus = SCR_the_curtain_rises',
    '\t\t\t\t\tNOT = { has_country_flag = SCR_legacy_auto_done }',
    '\t\t\t\t}',
    '\t\t\t\tSCR_legacy_auto_schedule = yes',
    '\t\t\t}',
    '\t\t}',
    '\t}',
    '}',
    '',
  ].join('\n');
}

function buildLoc() {
  return [
    '﻿l_simp_chinese:',
    '',
    ' # 猩红剧团（SCR）旧国策树 · 核心圈式自动演出',
    ' # 生成器：docs/gen_scr_legacy_auto.cjs（勿手改本文件）',
    ' SCR_legacy_auto_tt: "§Y这一幕由猩红剧团自动演出。§!\\n完成国策「大幕拉开」后，本树其余国策将按剧本逐幕自动完成，无需手动选择。"',
    ' SCR_legacy_auto_start_tt: "§G旧树自动演出启动§!：本树其余国策将由剧团按剧本逐幕自动完成，每格 35 天。"',
    ' SCR_legacy_auto_progress_tt: "§Y剧团正在演出这一幕。§!\\n已执行 §G$FLAG_DAYS$§! 天 / 每格 35 天。"',
    ' SCR_legacy_auto_wait_tt: "§Y这一幕还在等林贡斯。§!\\n自动演出会在我国拥有并完全控制林贡斯（483 号地区）后继续。"',
    '',
  ].join('\n');
}

function buildTimeline(ids) {
  const parentLoc = read(PARENT_LOC);
  const names = {};
  for (const m of parentLoc.matchAll(/^\s*(SCR_[a-z0-9_]+):\s*"([^"]*)"/gm)) names[m[1]] = m[2];
  const lines = [
    '# 猩红剧团旧国策树 · 自动演出推进表',
    '',
    `完成根国策「大幕拉开」后开始；每格 ${DAYS} 天。相对天数以根国策完成为第 0 天。`,
    '',
    '| 序 | 国策 id | 名称 | 相对天数 |',
    '|---:|---|---|---:|',
  ];
  ids.forEach((id, i) => {
    lines.push(`| ${i + 1} | ${id} | ${names[id] || ''} | ${(i + 1) * DAYS} |`);
  });
  return lines.join('\n') + '\n';
}

// ---------- main ----------

const blocks = patchTree();
// 根格由玩家手动完成，不进自动序列——避免 completion_reward 执行时
// 「根是否已完成」的判定顺序歧义。
const ids = blocks.filter((b) => b.id !== ROOT_ID).map((b) => b.id);
if (ids[ids.length - 1] !== GATED_FOCUS.id) {
  throw new Error(`带门槛的末格必须是序列最后一格，当前是 ${ids[ids.length - 1]}`);
}

put(EFFECTS, buildEffects(ids), path.join(ROOT, 'docs', 'SCR_旧树自动演出_备份'));
put(EVENTS, buildEvents(), path.join(ROOT, 'docs', 'SCR_旧树自动演出_备份'));
put(ON_ACTIONS, buildOnActions(), path.join(ROOT, 'docs', 'SCR_旧树自动演出_备份'));
put(LOC, buildLoc(), path.join(ROOT, 'docs', 'SCR_旧树自动演出_备份'));
put(TIMELINE, buildTimeline(ids), path.join(ROOT, 'docs', 'SCR_旧树自动演出_备份'));

console.log(`  - 自动演出序列 ${ids.length} 格（根格手动）/ 每格 ${DAYS} 天`);
console.log('完成。');
