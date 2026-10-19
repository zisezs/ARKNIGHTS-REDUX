#!/usr/bin/env node
/**
 * SCR 决议组「进军维多利亚」
 *
 * - 开局显示，1095 年 12 月 1 日起可用
 * - 四步依次：VFA → VVI → BRT → BGD
 * - 每步：50 政治点、30 天冷却、AI 高权重
 * - 效果：对目标宣战（annex_everything），并把目标拥有的全部地区设为本国核心
 * - 上一步完成后，下一步才解锁；共享 30 天冷却旗标
 *
 * 改动：
 *   common/decisions/categories/SCR_decision_categories.txt  新增分类
 *   common/decisions/SCR_Decisions.txt                       新增分类容器与 4 条决议
 *   localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml  新增 loc
 *
 * 用法：node docs/gen_scr_march_victoria.cjs
 * 幂等：连跑两次逐字节一致。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CATEGORIES = path.join(ROOT, 'common/decisions/categories/SCR_decision_categories.txt');
const DECISIONS = path.join(ROOT, 'common/decisions/SCR_Decisions.txt');
const LOC = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml');
const BACKUP = path.join(ROOT, 'docs/SCR_进军维多利亚_备份');

const CAT = 'SCR_march_victoria_category';
const CAT_START = '# ---- 【进军维多利亚】分类 起 ----';
const CAT_END = '# ---- 【进军维多利亚】分类 止 ----';
const DEC_START = '# ---- 【进军维多利亚】决议组 起 ----';
const DEC_END = '# ---- 【进军维多利亚】决议组 止 ----';
const LOC_START = ' # ---- 【进军维多利亚】起 ----';
const LOC_END = ' # ---- 【进军维多利亚】止 ----';

const STEPS = [
  {
    tag: 'VFA',
    id: 'SCR_march_victoria_vfa',
    name: '进军维多利亚第一集团军',
    desc:
      '维多利亚第一集团军挡在进军路上。先打掉它，再把它的地盘写进高卢的地图。\\n\\n§Y效果：§!对维多利亚第一集团军宣战，并将其拥有的全部地区设为本国核心。',
    prev: null,
    flag: 'SCR_march_victoria_vfa_done',
  },
  {
    tag: 'VVI',
    id: 'SCR_march_victoria_vvi',
    name: '进军文森特伯爵领',
    desc:
      '文森特伯爵领是维多利亚在高卢地区的又一根钉子。拔掉它，进军线才能继续向西。\\n\\n§Y效果：§!对文森特伯爵领宣战，并将其拥有的全部地区设为本国核心。',
    prev: 'SCR_march_victoria_vfa_done',
    flag: 'SCR_march_victoria_vvi_done',
  },
  {
    tag: 'BRT',
    id: 'SCR_march_victoria_brt',
    name: '进军布列塔尼军区',
    desc:
      '布列塔尼军区的边防军还在替帝国守门。门后是高卢的旧土，门前的他们该退场了。\\n\\n§Y效果：§!对布列塔尼军区宣战，并将其拥有的全部地区设为本国核心。',
    prev: 'SCR_march_victoria_vvi_done',
    flag: 'SCR_march_victoria_brt_done',
  },
  {
    tag: 'BGD',
    id: 'SCR_march_victoria_bgd',
    name: '进军勃艮第非军事区',
    desc:
      '勃艮第非军事区的中立只是账面上的。最后一步，把它也纳入高卢的版图。\\n\\n§Y效果：§!对勃艮第非军事区宣战，并将其拥有的全部地区设为本国核心。',
    prev: 'SCR_march_victoria_brt_done',
    flag: 'SCR_march_victoria_bgd_done',
  },
];

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
    // 只保留第一次改动前的原件
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, old);
  }
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  fs.writeFileSync(rel, data);
  return true;
}

function removeMarkerBlock(text, start, end) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(esc(start) + '[\\s\\S]*?' + esc(end) + '\\n?', 'g'), '');
}

function decisionBlock(s) {
  const lines = [
    `\t${s.id} = {`,
    '\t\ticon = GFX_decision_generic_army_support',
    '\t\tcost = 50',
    '\t\tdays_re_enable = 30',
    '\t\tfire_only_once = yes',
    '',
    '\t\tallowed = { original_tag = SCR }',
    '\t\tvisible = { original_tag = SCR }',
    '\t\tavailable = {',
    '\t\t\tcustom_trigger_tooltip = {',
    '\t\t\t\ttooltip = SCR_march_victoria_date_tt',
    '\t\t\t\tdate > 1095.11.30',
    '\t\t\t}',
    '\t\t\tcustom_trigger_tooltip = {',
    '\t\t\t\ttooltip = SCR_march_victoria_cooldown_tt',
    '\t\t\t\tNOT = { has_country_flag = SCR_march_victoria_cd }',
    '\t\t\t}',
  ];
  if (s.prev) {
    lines.push(
      '\t\t\tcustom_trigger_tooltip = {',
      '\t\t\t\ttooltip = SCR_march_victoria_prev_tt',
      `\t\t\t\thas_country_flag = ${s.prev}`,
      '\t\t\t}'
    );
  }
  lines.push(
    '\t\t}',
    '',
    '\t\tcomplete_effect = {',
    '\t\t\tcustom_effect_tooltip = SCR_march_victoria_tt',
    '\t\t\tif = {',
    `\t\t\t\tlimit = { ${s.tag} = { exists = yes } }`,
    `\t\t\t\t${s.tag} = {`,
    '\t\t\t\t\tevery_owned_state = {',
    '\t\t\t\t\t\tadd_core_of = ROOT',
    '\t\t\t\t\t}',
    '\t\t\t\t}',
    '\t\t\t\tif = {',
    `\t\t\t\t\tlimit = { NOT = { has_war_with = ${s.tag} } }`,
    `\t\t\t\t\tdeclare_war_on = { target = ${s.tag} type = annex_everything }`,
    '\t\t\t\t}',
    '\t\t\t}',
    `\t\t\tset_country_flag = ${s.flag}`,
    '\t\t\tset_country_flag = { flag = SCR_march_victoria_cd days = 30 value = 1 }',
    '\t\t}',
    '',
    '\t\tai_will_do = { base = 1000 }',
    '\t}'
  );
  return lines.join('\n');
}

function patchCategories() {
  let text = read(CATEGORIES);
  const before = text;
  text = removeMarkerBlock(text, CAT_START, CAT_END);
  if (!text.endsWith('\n')) text += '\n';
  text +=
    CAT_START +
    '\n' +
    [
      `${CAT} = {`,
      '\ticon = GFX_decision_generic_army_support',
      '\tallowed = {',
      '\t\toriginal_tag = SCR',
      '\t}',
      '\tvisible = {',
      '\t\toriginal_tag = SCR',
      '\t}',
      '}',
    ].join('\n') +
    '\n' +
    CAT_END +
    '\n';
  if (text !== before) {
    put(CATEGORIES, text);
    console.log('  - 已新增决议分类「进军维多利亚」');
  }
}

function patchDecisions() {
  let text = read(DECISIONS);
  const before = text;
  text = removeMarkerBlock(text, DEC_START, DEC_END);
  if (!text.endsWith('\n')) text += '\n';
  text +=
    DEC_START +
    '\n' +
    [
      `${CAT} = {`,
      ...STEPS.map(decisionBlock),
      '}',
    ].join('\n') +
    '\n' +
    DEC_END +
    '\n';
  if (text !== before) {
    put(DECISIONS, text);
    console.log('  - 已新增 4 条决议');
  }
}

function patchLoc() {
  let text = read(LOC);
  const before = text;
  text = removeMarkerBlock(text, LOC_START, LOC_END);
  if (!text.endsWith('\n')) text += '\n';
  const lines = [
    LOC_START,
    ` ${CAT}: "进军维多利亚"`,
    ` ${CAT}_desc: "维多利亚的旧秩序正在裂开。剧团不打算等它自己倒下——按顺序把挡路的国家一个个请下舞台。"`,
    ...STEPS.flatMap((s) => [
      ` ${s.id}: "${s.name}"`,
      ` ${s.id}_desc: "${s.desc}"`,
    ]),
    ' SCR_march_victoria_date_tt: "1095 年 12 月之后"',
    ' SCR_march_victoria_date_tt_NOT: "尚未到 1095 年 12 月"',
    ' SCR_march_victoria_cooldown_tt: "距上一次进军已满 30 天"',
    ' SCR_march_victoria_cooldown_tt_NOT: "距上一次进军未满 30 天"',
    ' SCR_march_victoria_prev_tt: "已完成上一步进军"',
    ' SCR_march_victoria_prev_tt_NOT: "尚未完成上一步进军"',
    ' SCR_march_victoria_tt: "§Y对目标宣战，并将其拥有的全部地区设为本国核心。§!"',
    LOC_END,
  ];
  text += lines.join('\n') + '\n';
  if (text !== before) {
    put(LOC, text);
    console.log('  - 已新增决议组本地化');
  }
}

function writeReadme() {
  const readme = [
    '# SCR 决议组「进军维多利亚」— 改动说明',
    '',
    '- 分类：`SCR_march_victoria_category`「进军维多利亚」，开局显示',
    '- 启用：`date > 1095.11.30`，即 1095 年 12 月 1 日起',
    '- 顺序：VFA → VVI → BRT → BGD，上一步完成后下一步才解锁',
    '- 每步：50 政治点 / 30 天冷却 / AI 权重 1000',
    '- 效果：对目标宣战（`annex_everything`），并把目标拥有的全部地区设为本国核心',
    '',
    '改动前原件备份：',
    '- `common__decisions__categories__SCR_decision_categories.txt`',
    '- `common__decisions__SCR_Decisions.txt`',
    '- `localisation__simp_chinese__ARF_SCR_corsica_effects_l_simp_chinese.yml`',
    '',
    '改动后快照：`after/` 下同名文件。',
    '',
  ].join('\n');
  fs.mkdirSync(BACKUP, { recursive: true });
  fs.writeFileSync(path.join(BACKUP, 'README.md'), readme);
}

patchCategories();
patchDecisions();
patchLoc();
writeReadme();
console.log('完成。');
