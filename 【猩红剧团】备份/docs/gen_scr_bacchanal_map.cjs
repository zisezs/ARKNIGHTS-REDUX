#!/usr/bin/env node
/*
 * 生成「酒神的大地巡演」面板内静态州界地图的可点击标记。
 *
 * 数据源：地块数据编辑器 cache/oaqkib/州几何.json（5632x2048 像素坐标）
 * 产物（全部是注入到既有文件里的生成块，幂等）：
 *   - interface/_ARF_Gui/SCR_Bacchanal.gui 的 SCR_BAC_MAP_MARKERS 段
 *   - common/scripted_guis/SCR_Bacchanal_GUI.txt 的 MAP_EFFECTS / MAP_TRIGGERS 段
 *
 * 运行：node docs/gen_scr_bacchanal_map.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GEOM = 'E:/1.19.2(p)/langou123/mod/123456789/紫色的懒人MOD工具包/地块数据编辑器/cache/oaqkib/州几何.json';
const GUI = path.join(ROOT, 'interface', '_ARF_Gui', 'SCR_Bacchanal.gui');
const SG = path.join(ROOT, 'common', 'scripted_guis', 'SCR_Bacchanal_GUI.txt');

const MAP_X = 576, MAP_Y = 206, MAP_W = 760, MAP_H = 276;
const SRC_W = 5632, SRC_H = 2048;
const MARK = 22;
const RING = 34; // 选中舞台的金色描边（略大于标记）

if (!fs.existsSync(GEOM)) throw new Error('缺少州几何数据: ' + GEOM);
const geo = JSON.parse(fs.readFileSync(GEOM, 'utf8')).states;

function replaceBetween(text, startMark, endMark, body) {
  const a = text.indexOf(startMark);
  const b = text.indexOf(endMark);
  if (a < 0 || b < 0 || b < a) throw new Error('找不到注入标记: ' + startMark);
  return text.slice(0, a + startMark.length) + '\n' + body + '\n' + text.slice(b);
}

const ids = Object.keys(geo)
  .map(Number)
  .filter((id) => Number.isFinite(id) && geo[id])
  .sort((a, b) => a - b);

let buttons = [];
let effects = [];
let triggers = [];
let selRings = [];
let selTriggers = [];

for (const id of ids) {
  const g = geo[id];
  const cx = Number(g.cx), cy = Number(g.cy);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) continue;
  const px = MAP_X + Math.round(cx * MAP_W / SRC_W);
  const py = MAP_Y + Math.round(cy * MAP_H / SRC_H);
  let x = px - MARK / 2;
  let y = py - MARK / 2;
  x = Math.max(MAP_X + 1, Math.min(MAP_X + MAP_W - MARK - 1, x));
  y = Math.max(MAP_Y + 1, Math.min(MAP_Y + MAP_H - MARK - 1, y));
  const rx = Math.max(MAP_X, Math.min(MAP_X + MAP_W - RING, px - RING / 2));
  const ry = Math.max(MAP_Y, Math.min(MAP_Y + MAP_H - RING, py - RING / 2));

  buttons.push(
`		buttonType = {
			name = "SCR_Bac_MapM_${id}"
			position = { x = ${x} y = ${y} }
			quadTextureSprite = "GFX_SCR_bac_marker"
			clicksound = click_default
			pdx_tooltip = SCR_BAC_MAP_MARKER_TT
		}`
  );

  effects.push(
`			SCR_Bac_MapM_${id}_click = {
				set_variable = { SCR_tour_click = ${id} }
				SCR_Bacchanal_PickByVariable = yes
			}`
  );

  triggers.push(
`			SCR_Bac_MapM_${id}_visible = {
				NOT = { check_variable = { SCR_fx_${id} > 0 } }
				any_controlled_state = {
					state = ${id}
				}
			}`
  );

  // 选中舞台的金色描边：位置固定，只由 SCR_tour_state 决定显隐。
  selRings.push(
`		iconType = {
			name = "SCR_Bac_Sel_${id}"
			position = { x = ${rx} y = ${ry} }
			spriteType = "GFX_SCR_bac_selring"
			alwaystransparent = yes
		}`
  );
  selTriggers.push(
`			SCR_Bac_Sel_${id}_visible = { check_variable = { SCR_tour_state = ${id} compare = equals } }`
  );
}

let gui = fs.readFileSync(GUI, 'utf8');
gui = replaceBetween(gui, '# >>> SCR_BAC_MAP_MARKERS_START', '# >>> SCR_BAC_MAP_MARKERS_END', buttons.join('\n'));
gui = replaceBetween(gui, '# >>> SCR_BAC_SELRING_START', '# >>> SCR_BAC_SELRING_END', selRings.join('\n'));
fs.writeFileSync(GUI, gui);

let sg = fs.readFileSync(SG, 'utf8');
sg = replaceBetween(sg, '# >>> SCR_BAC_MAP_EFFECTS_START', '# >>> SCR_BAC_MAP_EFFECTS_END', effects.join('\n'));
sg = replaceBetween(sg, '# >>> SCR_BAC_MAP_TRIGGERS_START', '# >>> SCR_BAC_MAP_TRIGGERS_END', triggers.join('\n'));
sg = replaceBetween(sg, '# >>> SCR_BAC_SELRING_TRIGGERS_START', '# >>> SCR_BAC_SELRING_TRIGGERS_END', selTriggers.join('\n'));
fs.writeFileSync(SG, sg);

console.log(`map markers: ${buttons.length} 个州 / ${ids.length} 条几何记录`);
