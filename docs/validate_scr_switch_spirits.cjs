#!/usr/bin/env node
/**
 * SCR「转线」小国策树 + 民族精神蓝框图标 静态校验。
 * 用法：NODE_PATH=E:/tmp/lud/node_modules node docs/validate_scr_switch_spirits.cjs
 * 退出码 0 = 全部通过。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FOCUS = path.join(ROOT, 'common/national_focus/SCR_switch_shared.txt');
const PARENT = path.join(ROOT, 'common/national_focus/SCR.txt');
const CORSI = path.join(ROOT, 'common/national_focus/SCR_corsica_shared.txt');
const GFX = path.join(ROOT, 'interface/_ARF_goals/SCR_switch_goals.gfx');
const LOC = path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_switch_l_simp_chinese.yml');
const IDEAS_GFX = path.join(ROOT, 'interface/ideas/SCR_ideas.gfx');
const FRAME = path.join(ROOT, 'docs/SCR_科西嘉线_设计/幕布/blue_roman_old.png');

let failed = 0;
function check(ok, label, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failed++;
}

const focus = fs.readFileSync(FOCUS, 'utf8');
const parent = fs.readFileSync(PARENT, 'utf8');
const gfx = fs.readFileSync(GFX, 'utf8');
const loc = fs.readFileSync(LOC, 'utf8');
const ideasGfx = fs.readFileSync(IDEAS_GFX, 'utf8');

const ids = [...focus.matchAll(/^shared_focus = \{\n\tid = (SCR_switch_\d+)/gm)].map((m) => m[1]);
check(ids.length === 6, '转线树 6 格', String(ids.length));
check(new Set(ids).size === 6, '转线树 id 无重复');
check(!/focus_tree\s*=/.test(focus), '子文件没有 focus_tree 外壳');
check(
  [...focus.matchAll(/\tid = (SCR_switch_\d+)\n\ticon[^\n]*\n\tx = (-?\d+)\n\ty = (-?\d+)/g)].every(
    (m) => +m[2] >= 1 && +m[2] <= 3 && +m[3] >= 9 && +m[3] <= 12
  ),
  '坐标在政治簇左侧（x 1..3 / y 9..12）'
);
const swCoords = [...focus.matchAll(/\tid = (SCR_switch_\d+)\n\ticon[^\n]*\n\tx = (-?\d+)\n\ty = (-?\d+)/g)].map(
  (m) => `${m[2]},${m[3]}`
);
const ciCoords = [...fs.readFileSync(CORSI, 'utf8').matchAll(/\tid = (SCR_corsica_\d+)\n\ticon[^\n]*\n\tx = (-?\d+)\n\ty = (-?\d+)/g)].map(
  (m) => `${m[2]},${m[3]}`
);
check(swCoords.every((c) => !ciCoords.includes(c)), '与科西嘉线格点不撞车');

const inc = [...parent.matchAll(/^\tshared_focus = (SCR_switch_\d+)$/gm)].map((m) => m[1]);
check(inc.length === 6, '父树引用 6 条', String(inc.length));
check(ids.every((id) => inc.includes(id)) && inc.every((id) => ids.includes(id)), '定义 ↔ 引用一一对应');

const regs = [...gfx.matchAll(/name = "(GFX_focus_SCR_switch_\d+)"/g)].map((m) => m[1]);
check(regs.length === 6, '图标注册 6 条', String(regs.length));

const locKeys = [...loc.matchAll(/^\s*(SCR_switch_\d+):/gm)].map((m) => m[1]);
check(loc.charCodeAt(0) === 0xfeff, '转线树 loc 带单个 UTF-8 BOM');
check(locKeys.length === 6 && ids.every((id) => locKeys.includes(id)), '转线树 6 条国策名齐全');
check(/SCR_switch_1: "剧团长的审美疲劳"/.test(loc), '1 号根格名为「剧团长的审美疲劳」');
check(/SCR_switch_2: "猩红孤钻意犹未尽\.\.\."/.test(loc), '2 号格名为「猩红孤钻意犹未尽...」');
check(/SCR_switch_3: "世界之都的倒影\.\.\."/.test(loc), '3 号格名为「世界之都的倒影...」');
check(/SCR_switch_4: "长生者的禁忌技艺"/.test(loc), '4 号格名为「长生者的禁忌技艺」');
check(/SCR_switch_5: "男主角，女主角"/.test(loc), '5 号格名为「男主角，女主角」');
check(/SCR_switch_6: "新剧目《皇女复国记》！"/.test(loc), '6 号终格名为「新剧目《皇女复国记》！」');

let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  /* 只用文件头检查尺寸 */
}
function pngSize(p) {
  const b = fs.readFileSync(p);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}
const badSwitch = [];
for (const id of ids) {
  const p = path.join(ROOT, `gfx/interface/goals/SCR/${id}.png`);
  if (!fs.existsSync(p)) badSwitch.push(id + ':missing');
  else {
    const [w, h] = pngSize(p);
    if (w !== 110 || h !== 98) badSwitch.push(`${id}:${w}x${h}`);
  }
}
check(badSwitch.length === 0, '转线树图标全部 110x98', badSwitch.join(', '));

// 民族精神：31 条 60x60 全部在原路径且为 60x60
const spirits = [...ideasGfx.matchAll(/name = "GFX_idea_(SCR_[a-z0-9_]+)"[^\n]*texturefile = "([^"]+)"[^\n]*# 60x60/g)].map(
  (m) => ({ id: m[1], file: m[2] })
);
check(spirits.length >= 31, '民族精神 60x60 清单', String(spirits.length));
const badSpirit = [];
for (const s of spirits) {
  const p = path.join(ROOT, s.file);
  if (!fs.existsSync(p)) badSpirit.push(s.id + ':missing');
  else {
    const [w, h] = pngSize(p);
    if (w !== 60 || h !== 60) badSpirit.push(`${s.id}:${w}x${h}`);
  }
}
check(badSpirit.length === 0, '民族精神图标全部 60x60', badSpirit.join(', '));
check(fs.existsSync(FRAME), '废弃蓝罗马边框存在');

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
check(bal(focus) === 0 && bal(gfx) === 0 && bal(parent) === 0, '花括号配平');

console.log(failed === 0 ? '\nIS_PASS' : `\nIS_FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
