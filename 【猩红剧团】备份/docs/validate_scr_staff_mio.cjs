#!/usr/bin/env node
/*
 * 猩红剧团（SCR）核心幕僚与军工企业体检器
 * --------------------------------------------------------------------------
 * 检查项：
 *   1 花括号平衡、关键文件存在
 *   2 角色：advisor 槽位不重复 / 引用的特质已定义
 *   3 历史文件：recruit_character 的角色都存在
 *   4 顾问特质 / 将领特质：loc 名称存在
 *   5 军工企业：图标 sprite 已注册、PNG 存在且为 64x64、
 *      add_trait 的 relative_position_id 可在 include 的预设里找到、
 *      available 里的国策 id 存在、y 坐标 <= 5
 *   6 本地化：BOM 只有一个、MIO 名称键齐全
 *
 * 用法：node docs/validate_scr_staff_mio.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const P = {
  chars: 'common/characters/SCR.txt',
  advTraits: 'common/country_leader/SCR_advisor_traits.txt',
  unitTraits: 'common/unit_leader/SCR_traits.txt',
  history: 'history/countries/SCR - Crimson Troupe.txt',
  mio: 'common/military_industrial_organization/organizations/SCR_organization.txt',
  genericMio: 'common/military_industrial_organization/organizations/00_generic_organization.txt',
  mioGfx: 'interface/military_industrial_organization/SCR_organization_icons.gfx',
  loc: 'localisation/simp_chinese/SCR_l_simp_chinese.yml',
  focusDir: 'common/national_focus',
};

const errors = [];
const warns = [];
function err(m) { errors.push(m); }
function warn(m) { warns.push(m); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

// ---------- 1 基础 ----------
for (const [k, rel] of Object.entries(P)) {
  if (k === 'focusDir') continue;
  if (!exists(rel)) err(`缺少文件：${rel}`);
}
function braceBalance(rel) {
  const s = read(rel);
  let n = 0;
  for (const ch of s) { if (ch === '{') n++; else if (ch === '}') n--; if (n < 0) break; }
  if (n !== 0) err(`${rel} 花括号不平衡（${n > 0 ? '少' : '多'} ${Math.abs(n)} 个 }）`);
}
[P.chars, P.advTraits, P.unitTraits, P.history, P.mio, P.mioGfx].forEach(rel => { if (exists(rel)) braceBalance(rel); });

// ---------- 2 角色 ----------
const charsSrc = read(P.chars);
const charIds = [...charsSrc.matchAll(/^\t\t([A-Za-z0-9_]+) = \{/gm)].map(m => m[1]);
const charSet = new Set(charIds);
if (charSet.size !== charIds.length) err('角色 id 有重复');

// 逐个角色检查 advisor 槽位与 traits
const charBlocks = {};
{
  const lines = charsSrc.split(/\r?\n/);
  let cur = null, depth = 0;
  for (const line of lines) {
    const m = line.match(/^\t\t([A-Za-z0-9_]+) = \{/);
    if (m) { cur = m[1]; charBlocks[cur] = { advisors: [], traits: [] }; depth = 1; continue; }
    if (!cur) continue;
    if (line.match(/^\t\t\tadvisor = \{/)) charBlocks[cur].advisors.push({ slots: [], traits: [] });
    if (line.match(/^\t\t\tfield_marshal = \{/) || line.match(/^\t\t\tcorps_commander = \{/)) charBlocks[cur].advisors.push({ slots: ['(military)'], traits: [] });
    const dm = line.match(/^\t\t\t\tdesc = ([A-Za-z0-9_]+)/);
    if (dm) (charBlocks[cur].descs ||= []).push(dm[1]);
    const sm = line.match(/^\t\t\t\tslot = ([a-z_]+)/);
    if (sm && charBlocks[cur].advisors.length) charBlocks[cur].advisors.at(-1).slots.push(sm[1]);
    if (/^\t\t\t\ttraits = \{/.test(line)) {
      const tr = [...line.matchAll(/([A-Za-z0-9_]+)/g)].map(x => x[1]).filter(x => x !== 'traits');
      const last = charBlocks[cur].advisors.at(-1);
      if (last) last.traits.push(...tr);
      else charBlocks[cur].traits.push(...tr);
    }
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    if (depth <= 0) cur = null;
  }
}
for (const [id, b] of Object.entries(charBlocks)) {
  const slots = b.advisors.flatMap(a => a.slots);
  const realSlots = slots.filter(s => s !== '(military)');
  if (new Set(realSlots).size !== realSlots.length) err(`${id} 有重复 advisor 槽位：${realSlots.join(', ')}`);
}

// ---------- 3 特质定义 ----------
const advTraitIds = new Set([...read(P.advTraits).matchAll(/^\t([A-Za-z0-9_]+) = \{/gm)].map(m => m[1]));
const unitTraitIds = new Set([...read(P.unitTraits).matchAll(/^\t([A-Za-z0-9_]+) = \{/gm)].map(m => m[1]));
for (const [id, b] of Object.entries(charBlocks)) {
  for (const tr of b.traits) if (!unitTraitIds.has(tr)) err(`角色 ${id} 引用了未定义的将领特质 ${tr}`);
  for (const a of b.advisors) for (const tr of a.traits) {
    if (unitTraitIds.has(tr) || advTraitIds.has(tr)) continue;
    // 原版军种特质（army_chief_* / organizer / infantry_leader 等）不在此处校验
  }
}

// ---------- 4 历史招募 ----------
const historySrc = read(P.history);
const recruits = [...historySrc.matchAll(/^recruit_character = ([A-Za-z0-9_]+)/gm)].map(m => m[1]);
for (const id of recruits) if (!charSet.has(id)) err(`历史文件招募了不存在的角色 ${id}`);
for (const id of charSet) if (!recruits.includes(id)) warn(`角色 ${id} 未在历史文件招募（若由国策/事件招募可忽略）`);

// ---------- 5 本地化 ----------
const locRaw = fs.readFileSync(path.join(ROOT, P.loc));
if (!(locRaw[0] === 0xEF && locRaw[1] === 0xBB && locRaw[2] === 0xBF)) err('本地化文件缺少 UTF-8 BOM');
if (locRaw[3] === 0xEF && locRaw[4] === 0xBB && locRaw[5] === 0xBF) err('本地化文件有双 BOM');
// 键可能在其它 SCR loc 文件中，收集整个 simp_chinese 目录
const locKeys = new Set();
const locDir = path.join(ROOT, 'localisation/simp_chinese');
for (const f of fs.readdirSync(locDir)) {
  if (!f.endsWith('.yml')) continue;
  const s = fs.readFileSync(path.join(locDir, f), 'utf8');
  for (const m of s.matchAll(/^ ([A-Za-z0-9_.]+):/gm)) locKeys.add(m[1]);
}
function needLoc(k, who) { if (!locKeys.has(k)) err(`缺少本地化键 ${k}（${who}）`); }

for (const id of Object.keys(charBlocks)) needLoc(id, '角色名');
for (const [id, b] of Object.entries(charBlocks)) for (const d of (b.descs || [])) needLoc(d, `角色 ${id} 小传`);
for (const id of advTraitIds) { needLoc(id, '顾问特质名'); }
for (const id of unitTraitIds) needLoc(id, '将领特质名');

// ---------- 6 军工企业 ----------
const mioSrc = read(P.mio);
const genericSrc = read(P.genericMio);
const gfxSrc = read(P.mioGfx);
const spriteNames = new Set([...gfxSrc.matchAll(/name = "(GFX_[A-Za-z0-9_]+)"/g)].map(m => m[1]));
const focusIds = new Set();
for (const f of fs.readdirSync(path.join(ROOT, P.focusDir))) {
  if (!f.endsWith('.txt')) continue;
  const s = fs.readFileSync(path.join(ROOT, P.focusDir, f), 'utf8');
  for (const m of s.matchAll(/^\t\tid = ([A-Za-z0-9_]+)/gm)) focusIds.add(m[1]);
}

// 预设里出现过的 token（用于 relative_position_id 校验）
const presetTokens = new Set([...genericSrc.matchAll(/^\t\ttoken = ([A-Za-z0-9_]+)/gm)].map(m => m[1]));
const ownTokens = new Set([...mioSrc.matchAll(/^\t\ttoken = ([A-Za-z0-9_]+)/gm)].map(m => m[1]));

const orgBlocks = [];
{
  const lines = mioSrc.split(/\r?\n/);
  let cur = null, depth = 0;
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_]+)_organization = \{/);
    if (m) { cur = { id: m[0].replace(/ = \{/, ''), traits: [] }; orgBlocks.push(cur); depth = 1; continue; }
    if (!cur) continue;
    let mm;
    if (mm = line.match(/^\ticon = (GFX_[A-Za-z0-9_]+)/)) cur.icon = mm[1];
    if (mm = line.match(/^\tinclude = ([A-Za-z0-9_]+)/)) cur.include = mm[1];
    if (mm = line.match(/^\t\trelative_position_id = ([A-Za-z0-9_]+)/)) cur.traits.push({ rel: mm[1] });
    if (mm = line.match(/^\t\tposition = \{ x = (-?\d+) y = (-?\d+) \}/)) cur.traits.at(-1) && (cur.traits.at(-1).y = +mm[2]);
    if (mm = line.match(/^\t\t\tFROM = \{ has_completed_focus = ([A-Za-z0-9_]+) \}/)) cur.traits.at(-1) && (cur.traits.at(-1).focus = mm[1]);
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    if (depth <= 0) cur = null;
  }
}
if (orgBlocks.length !== 8) err(`军工企业数量为 ${orgBlocks.length}，预期 8`);

function pngSize(file) {
  const b = fs.readFileSync(file);
  if (!(b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG')) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
for (const org of orgBlocks) {
  if (!org.icon) { err(`${org.id} 缺少 icon`); continue; }
  if (!spriteNames.has(org.icon)) err(`${org.id} 的 icon ${org.icon} 未在 gfx 注册`);
  const png = path.join(ROOT, 'gfx/interface/military_industrial_organization/SCR', org.icon.replace('GFX_scr_mio_', 'SCR_mio_') + '.png');
  if (!fs.existsSync(png)) err(`${org.id} 的图标文件不存在：${path.relative(ROOT, png)}`);
  else { const sz = pngSize(png); if (!sz || sz.w !== 64 || sz.h !== 64) err(`${org.id} 图标不是 64x64：${JSON.stringify(sz)}`); needLoc(org.id, 'MIO 名称'); }
  for (const t of org.traits) {
    if (t.rel && !presetTokens.has(t.rel) && !ownTokens.has(t.rel)) err(`${org.id} 的 relative_position_id ${t.rel} 在预设与自家文件中都不存在`);
    if (t.y !== undefined && t.y > 5) err(`${org.id} 有节点 y=${t.y} 超出可视区（>5）`);
    if (t.focus && !focusIds.has(t.focus)) err(`${org.id} 引用了不存在的国策 ${t.focus}`);
  }
}
// MIO 特质名 loc
for (const tok of ownTokens) needLoc(tok, 'MIO 特质名');

// ---------- 输出 ----------
console.log(`角色 ${charSet.size} 名；顾问特质 ${advTraitIds.size}；将领特质 ${unitTraitIds.size}；军工企业 ${orgBlocks.length} 家`);
if (warns.length) { console.log('\n警告：'); warns.forEach(w => console.log('  - ' + w)); }
if (errors.length) { console.log('\n错误：'); errors.forEach(e => console.log('  ✗ ' + e)); process.exit(1); }
console.log('\n全部检查通过。');
