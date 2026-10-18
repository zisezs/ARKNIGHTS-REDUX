#!/usr/bin/env node
/**
 * 「科西嘉线」共享国策树静态校验。
 * 用法：NODE_PATH=E:/tmp/lud/node_modules node docs/validate_scr_corsica.cjs
 * 退出码 0 = 全部通过；1 = 有失败项。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const P = {
  shared: path.join(ROOT, 'common/national_focus/SCR_corsica_shared.txt'),
  parent: path.join(ROOT, 'common/national_focus/SCR.txt'),
  dev: path.join(ROOT, 'common/national_focus/DEV_development_shared.txt'),
  loc: path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_corsica_l_simp_chinese.yml'),
  gfx: path.join(ROOT, 'interface/_ARF_goals/SCR_corsica_goals.gfx'),
  names: path.join(ROOT, 'docs/SCR_科西嘉线_设计/国策名称.yml'),
};

const OLD_WAR_IDS = [
  'SCR_second_war_of_four_emperors',
  'SCR_old_guard_reformed',
  'SCR_citizens_take_arms',
  'SCR_sing_troupe_eagle',
  'SCR_originium_furnace_faster',
  'SCR_infected_come_here',
  'SCR_everyone_drink_originium',
  'SCR_gaul_no_retreat',
  'SCR_lingones_we_stay',
  'SCR_dream_of_scorched_earth',
];

let failed = 0;
function check(ok, label, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failed++;
}

const shared = fs.readFileSync(P.shared, 'utf8');
const parent = fs.readFileSync(P.parent, 'utf8');
const loc = fs.readFileSync(P.loc, 'utf8');
const gfx = fs.readFileSync(P.gfx, 'utf8');
const namesSrc = fs.readFileSync(P.names, 'utf8');

const ids = [...shared.matchAll(/^shared_focus = \{\n\tid = (SCR_corsica_\d+)/gm)].map((m) => m[1]);
const blocks = [...shared.matchAll(/shared_focus = \{([\s\S]*?)\n\}/g)].map((m) => m[1]);

check(ids.length === 78, '共享国策 78 格', String(ids.length));
check(new Set(ids).size === ids.length, '国策 id 无重复');
check(!/focus_tree\s*=/.test(shared), '子文件没有 focus_tree 外壳');
check(
  blocks.every((b) => /^\n\tid = SCR_corsica_\d+\n\ticon = /m.test(b)),
  '每格顶层关键字都是 shared_focus'
);

const missingPre = [];
for (const b of blocks) {
  const id = (b.match(/id = (\S+)/) || [])[1];
  for (const m of b.matchAll(/focus = (SCR_corsica_\d+)/g)) {
    if (m[1] === id || !ids.includes(m[1])) missingPre.push(`${id} -> ${m[1]}`);
  }
}
check(missingPre.length === 0, '前置/互斥引用闭合', missingPre.join(', '));

const coords = [
  ...shared.matchAll(/\tid = (SCR_corsica_\d+)\n\ticon[^\n]*\n\tx = (-?\d+)\n\ty = (-?\d+)/g),
].map((m) => [m[1], +m[2], +m[3]]);
const cells = new Map();
const dupCells = [];
for (const [id, x, y] of coords) {
  const k = `${x},${y}`;
  if (cells.has(k)) dupCells.push(`${k}:${cells.get(k)}/${id}`);
  cells.set(k, id);
}
const xs = coords.map((c) => c[1]);
const ys = coords.map((c) => c[2]);
check(dupCells.length === 0, '格点无撞车', dupCells.join(', '));
check(
  Math.min(...xs) >= 5 && Math.max(...xs) <= 29 && Math.min(...ys) >= 9 && Math.max(...ys) <= 20,
  '整体落在原树下方（x 5..29 / y 9..20）',
  `x ${Math.min(...xs)}..${Math.max(...xs)} / y ${Math.min(...ys)}..${Math.max(...ys)}`
);

const includes = [...parent.matchAll(/^\tshared_focus = (SCR_corsica_\d+)$/gm)].map((m) => m[1]);
check(includes.length === 78, '父树引用 78 条', String(includes.length));
check(
  ids.every((id) => includes.includes(id)) && includes.every((id) => ids.includes(id)),
  '定义 ↔ 引用一一对应'
);
check(!OLD_WAR_IDS.some((id) => parent.includes(`id = ${id}`)), '旧「第二次四皇会战」支线已移除');

// 原树 / DEV 的落点关系
const mainCoords = [...parent.matchAll(/^\t\tx = (-?\d+)\n\t\ty = (-?\d+)$/gm)].map((m) => [+m[1], +m[2]]);
const mainMaxY = Math.max(...mainCoords.map((c) => c[1]));
const dev = fs.readFileSync(P.dev, 'utf8');
const devOff = [
  ...dev.matchAll(
    /\toffset = \{\n\t\tx = (-?\d+)\n\t\ty = (-?\d+)\n\t\ttrigger = \{\n\t\t\thas_focus_tree = SCR_tree_initial\n\t\t\}\n\t\}/g
  ),
].map((m) => [+m[1], +m[2]]);
check(mainMaxY <= 7, '原树包围盒底线仍是 y=7', String(mainMaxY));
check(devOff.length === 25 && Math.min(...devOff.map((c) => c[1])) >= 23, 'SCR 的 DEV 树已让到 y>=23');

// 图标
const regs = [...gfx.matchAll(/name = "(GFX_focus_SCR_corsica_\d+)"/g)].map((m) => m[1]);
const used = [...shared.matchAll(/icon = (GFX_focus_SCR_corsica_\d+)/g)].map((m) => m[1]);
check(
  regs.length === 78 && used.length === 78,
  '78 张图标已引用并注册（12 专属配图 + 66 幕布花体字）',
  `used ${used.length} / reg ${regs.length}`
);
check(
  used.every((u) => regs.includes(u)),
  '引用 ↔ 注册一一对应'
);
let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  /* 下面只用文件头检查尺寸 */
}
const badIcons = [];
for (const u of used) {
  const id = u.replace('GFX_focus_', '');
  const p = path.join(ROOT, 'gfx/interface/goals/SCR', id + '.png');
  if (!fs.existsSync(p)) {
    badIcons.push(id + ':missing');
    continue;
  }
  const b = fs.readFileSync(p);
  const w = b.readUInt32BE(16);
  const h = b.readUInt32BE(20);
  if (w !== 110 || h !== 98) badIcons.push(`${id}:${w}x${h}`);
}
check(badIcons.length === 0, '图标全部为 110x98 PNG', badIcons.join(', '));

// 本地化
const keys = [...loc.matchAll(/^\s*(SCR_corsica_\d+):/gm)].map((m) => m[1]);
check(loc.charCodeAt(0) === 0xfeff, 'loc 文件带单个 UTF-8 BOM');
check(keys.length === 78 && keys.every((k) => ids.includes(k)), '78 条国策名齐全');
const names = {};
for (const m of namesSrc.matchAll(/^\s*NEW_focus_(\d+):\s*"([^"]*)"/gm)) names[m[1]] = m[2];
const nameDiff = [];
for (const m of loc.matchAll(/^\s*SCR_corsica_(\d+):\s*"([^"]*)"/gm)) {
  if (names[m[1]] !== m[2]) nameDiff.push(m[1]);
}
check(nameDiff.length === 0, '国策名与设计稿一致', nameDiff.join(', '));

// 语法
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
check(bal(shared) === 0 && bal(parent) === 0, '花括号配平');

console.log(failed === 0 ? '\nIS_PASS' : `\nIS_FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
