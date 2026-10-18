#!/usr/bin/env node
/**
 * SCR 决议「收复林贡斯（LIG）」
 *
 * - 1095 年 10 月 1 日起可启用（date > 1095.9.30）
 * - 效果：吞并 LIG，并把 LIG 拥有的全部核心地区设为本国核心
 * - 放在 SCR_theatre_category（幕后主决议页，对 SCR 始终可见）
 *
 * 产物 / 改动：
 *   common/decisions/SCR_Decisions.txt
 *   localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml
 *   改动前原件同步备份到 docs/SCR_收复林贡斯_备份/
 *
 * 用法：node docs/gen_scr_recover_lingons.cjs
 * 幂等：连跑两次逐字节一致。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECISIONS = path.join(ROOT, 'common/decisions/SCR_Decisions.txt');
const LOC = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml');
const BACKUP = path.join(ROOT, 'docs/SCR_收复林贡斯_备份');

const MARK_START = '\t# ---- 【收复林贡斯】决议 起 ----';
const MARK_END = '\t# ---- 【收复林贡斯】决议 止 ----';
const LOC_START = ' # ---- 【收复林贡斯】起 ----';
const LOC_END = ' # ---- 【收复林贡斯】止 ----';

const DECISION_BLOCK = [
  MARK_START,
  '\tSCR_recover_lingons = {',
  '\t\ticon = GFX_decision_generic_nationalism',
  '\t\tcost = 0',
  '\t\tfire_only_once = yes',
  '',
  '\t\tallowed = { original_tag = SCR }',
  '\t\tvisible = { original_tag = SCR }',
  '\t\tavailable = {',
  '\t\t\tcustom_trigger_tooltip = {',
  '\t\t\t\ttooltip = SCR_recover_lingons_date_tt',
  '\t\t\t\tdate > 1095.9.30',
  '\t\t\t}',
  '\t\t\tLIG = { exists = yes }',
  '\t\t}',
  '',
  '\t\tcomplete_effect = {',
  '\t\t\tcustom_effect_tooltip = SCR_recover_lingons_tt',
  '\t\t\t# annex_country 不给核心：先把 LIG 的核心州转成我们的核心，再吞并',
  '\t\t\tLIG = {',
  '\t\t\t\tevery_owned_state = {',
  '\t\t\t\t\tlimit = { is_core_of = LIG }',
  '\t\t\t\t\tadd_core_of = ROOT',
  '\t\t\t\t}',
  '\t\t\t}',
  '\t\t\tannex_country = { target = LIG }',
  '\t\t}',
  '',
  '\t\tai_will_do = { base = 100 }',
  '\t}',
  MARK_END,
].join('\n');

const LOC_BLOCK = [
  LOC_START,
  ' SCR_recover_lingons: "收复林贡斯"',
  ' SCR_recover_lingons_desc: "林贡斯本该是高卢的心脏，如今却挂着一面不属于我们的旗。剧团不需要再等一场谈判——把属于高卢的城市拿回来。\\n\\n§Y效果：§!吞并林贡斯（LIG），并将其全部核心地区设为本国核心。\\n\\n§Y启用时间：§!1095 年 10 月之后。"',
  ' SCR_recover_lingons_tt: "§Y吞并林贡斯（LIG），并获得其全部核心。§!"',
  ' SCR_recover_lingons_date_tt: "1095 年 10 月之后"',
  LOC_END,
].join('\n');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function put(rel, content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  if (fs.existsSync(rel)) {
    const old = fs.readFileSync(rel);
    if (old.equals(buf)) return false;
    fs.mkdirSync(BACKUP, { recursive: true });
    const bak = path.join(BACKUP, path.relative(ROOT, rel).replace(/[\\/]/g, '__'));
    // 只保留第一次改动前的原件；后续重跑不覆盖
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, old);
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

function patchDecisions() {
  let text = read(DECISIONS);
  const before = text;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  text = text.replace(new RegExp(esc(MARK_START) + '[\\s\\S]*?' + esc(MARK_END) + '\\n?', 'g'), '');

  // 放在主决议分类「幕后」：该分类对 SCR 始终可见，
  // 不会被科西嘉线根国策的 unlock_decision_category 挡住。
  const cat = text.indexOf('SCR_theatre_category = {');
  if (cat < 0) throw new Error('找不到 SCR_theatre_category');
  const open = text.indexOf('{', cat);
  const close = findMatchingBrace(text, open);
  if (close < 0) throw new Error('SCR_theatre_category 花括号不闭合');

  const nl = text.lastIndexOf('\n', close);
  text = text.slice(0, nl) + '\n' + DECISION_BLOCK + text.slice(nl);
  if (text !== before) {
    put(DECISIONS, text);
    console.log('  - 已写入决议 SCR_recover_lingons');
  }
}

function patchLoc() {
  let text = read(LOC);
  const before = text;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  text = text.replace(new RegExp(esc(LOC_START) + '[\\s\\S]*?' + esc(LOC_END) + '\\n?', 'g'), '');
  if (!text.endsWith('\n')) text += '\n';
  text += LOC_BLOCK + '\n';
  if (text !== before) {
    put(LOC, text);
    console.log('  - 已写入 3 条本地化');
  }
}

function writeReadme() {
  const readme = [
    '# SCR 收复林贡斯（LIG）— 改动说明',
    '',
    '- 决议 id：`SCR_recover_lingons`',
    '- 分类：`SCR_theatre_category`（幕后主决议页，对 SCR 始终可见）',
    '- 启用：`date > 1095.9.30`，即 1095 年 10 月 1 日起',
    '- 条件：`SCR`、`LIG` 仍存在',
    '- 效果：先把 LIG 拥有的核心州 `add_core_of = ROOT`，再 `annex_country = { target = LIG }`',
    '',
    '改动前原件备份：',
    '- `common__decisions__SCR_Decisions.txt`',
    '- `localisation__simp_chinese__ARF_SCR_corsica_effects_l_simp_chinese.yml`',
    '',
  ].join('\n');
  fs.mkdirSync(BACKUP, { recursive: true });
  fs.writeFileSync(path.join(BACKUP, 'README.md'), readme);
}

patchDecisions();
patchLoc();
writeReadme();
console.log('完成。');
