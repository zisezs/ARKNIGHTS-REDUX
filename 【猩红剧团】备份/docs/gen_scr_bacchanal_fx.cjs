#!/usr/bin/env node
/*
 * 「酒神的大地巡演」面板地图 · 按效果着色版
 *
 * 产出：
 *   gfx/interface/SCR_bacchanal/map_state.png        中性地形底图（地形 + 州界 + 省界）
 *   gfx/interface/SCR_bacchanal/fx/fx_<id>.png       每个州的 6 帧彩色州块
 *   interface/_ARF_Gui/SCR_Bacchanal_Fx.gfx          1087 个 6 帧 sprite 注册
 *   interface/_ARF_Gui/SCR_Bacchanal.gui             FX 图标层（1087 个 iconType）
 *   common/scripted_guis/SCR_Bacchanal_GUI.txt       1087 条 frame 属性
 *   common/scripted_effects/SCR_Bacchanal_effects.txt InitFx / SetFx
 *
 * 数据源：
 *   地块数据编辑器 cache/oaqkib/{hitmap.png,州几何.json,地表底图.png,边界.png}
 *   本模组 map/provinces.bmp（省界）
 *
 * 运行：NODE_PATH=E:/tmp/lud/node_modules node docs/gen_scr_bacchanal_fx.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { decodeBmp } = require('E:/1.19.2(p)/langou123/mod/123456789/紫色的懒人MOD工具包/地块数据编辑器/src/core/geomcore.js');

const ROOT = path.resolve(__dirname, '..');
const CACHE = 'E:/1.19.2(p)/langou123/mod/123456789/紫色的懒人MOD工具包/地块数据编辑器/cache/oaqkib';
const GEOM = path.join(CACHE, '州几何.json');
const HITMAP = path.join(CACHE, 'hitmap.png');
const TERRAIN = path.join(CACHE, '地表底图.png');
const STATE_BORDER = path.join(CACHE, '边界.png');
const PROVINCES = path.join(ROOT, 'map', 'provinces.bmp');

const OUT = path.join(ROOT, 'gfx', 'interface', 'SCR_bacchanal');
const FX = path.join(OUT, 'fx');
const GUI = path.join(ROOT, 'interface', '_ARF_Gui', 'SCR_Bacchanal.gui');
const GFX = path.join(ROOT, 'interface', '_ARF_Gui', 'SCR_Bacchanal_Fx.gfx');
const SG = path.join(ROOT, 'common', 'scripted_guis', 'SCR_Bacchanal_GUI.txt');
const EFF = path.join(ROOT, 'common', 'scripted_effects', 'SCR_Bacchanal_effects.txt');

const SRC_W = 5632, SRC_H = 2048;
const MAP_X = 576, MAP_Y = 206, MAP_W = 760, MAP_H = 276;
const FRAMES = 6;
const GOLD = [240, 215, 154];
const EDGE = [24, 12, 7];
const PLAY_COLORS = {
  1: [47, 143, 91],    // 湖中至宝（翡翠绿，避免与羊皮纸金线混色）
  2: [165, 26, 47],    // 一百零一日
  3: [122, 75, 179],   // 梦中奇缘
  4: [159, 199, 217],  // 霜牡与雪牝
  5: [138, 74, 42],    // 七丘的狼母
};

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(FX, { recursive: true });

function replaceBetween(text, startMark, endMark, body) {
  const a = text.indexOf(startMark);
  const b = text.indexOf(endMark);
  if (a < 0 || b < 0 || b < a) throw new Error('找不到注入标记: ' + startMark);
  return text.slice(0, a + startMark.length) + '\n' + body + '\n' + text.slice(b);
}

function goldOverlay(mask, w, h, alphaScale) {
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const a = Math.min(255, Math.round(mask[i] * alphaScale));
    const o = i * 4;
    buf[o] = GOLD[0]; buf[o + 1] = GOLD[1]; buf[o + 2] = GOLD[2]; buf[o + 3] = a;
  }
  return { input: buf, raw: { width: w, height: h, channels: 4 }, blend: 'over' };
}

async function resizeMask(raw, w, h, tw, th) {
  const out = await sharp(raw, { raw: { width: w, height: h, channels: 1 } })
    .resize(tw, th, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const buf = Buffer.alloc(tw * th);
  for (let i = 0; i < buf.length; i++) buf[i] = out.data[i * out.info.channels];
  return buf;
}

function dilate(mask, w, h, passes) {
  let cur = mask;
  for (let p = 0; p < passes; p++) {
    const out = Buffer.alloc(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (cur[i] >= 8) { out[i] = 255; continue; }
        let hit = false;
        for (let dy = -1; dy <= 1 && !hit; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= w) continue;
            if (cur[yy * w + xx] >= 8) { hit = true; break; }
          }
        }
        out[i] = hit ? 255 : 0;
      }
    }
    cur = out;
  }
  return cur;
}

async function makeBaseMap() {
  if (!fs.existsSync(TERRAIN)) throw new Error('缺少地形底图: ' + TERRAIN);
  if (!fs.existsSync(STATE_BORDER)) throw new Error('缺少州界图: ' + STATE_BORDER);
  if (!fs.existsSync(PROVINCES)) throw new Error('缺少省份图: ' + PROVINCES);

  // 省界：比较相邻像素颜色。provinces.bmp 是 24bpp/8bpp，geomcore 已翻成 RGB 上行。
  const bmp = decodeBmp(fs.readFileSync(PROVINCES));
  const provMask = Buffer.alloc(bmp.w * bmp.h);
  for (let y = 0; y < bmp.h; y++) {
    for (let x = 0; x < bmp.w; x++) {
      const i = (y * bmp.w + x) * 3;
      const r = bmp.px[i], g = bmp.px[i + 1], b = bmp.px[i + 2];
      let edge = 0;
      if (x > 0) {
        const j = i - 3;
        if (bmp.px[j] !== r || bmp.px[j + 1] !== g || bmp.px[j + 2] !== b) edge = 1;
      }
      if (!edge && y > 0) {
        const j = i - bmp.w * 3;
        if (bmp.px[j] !== r || bmp.px[j + 1] !== g || bmp.px[j + 2] !== b) edge = 1;
      }
      provMask[y * bmp.w + x] = edge ? 255 : 0;
    }
  }

  // 州界：边界.png 的 alpha 通道就是线稿。
  const borderRaw = await sharp(STATE_BORDER).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const stateMask = Buffer.alloc(borderRaw.info.width * borderRaw.info.height);
  for (let i = 0; i < stateMask.length; i++) {
    stateMask[i] = borderRaw.data[i * 4 + 3];
  }

  const provD = dilate(provMask, bmp.w, bmp.h, 2);
  const stateD = dilate(stateMask, borderRaw.info.width, borderRaw.info.height, 3);
  const provSmall = await resizeMask(provD, bmp.w, bmp.h, MAP_W, MAP_H);
  const stateSmall = await resizeMask(stateD, borderRaw.info.width, borderRaw.info.height, MAP_W, MAP_H);

  // 中性羊皮纸底图：不用政区色，也不用 normal map 的紫蓝色；地形只留一层很淡的浮雕。
  const paper = await sharp(Buffer.from(`<svg width="${MAP_W}" height="${MAP_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3d2a19"/>
        <stop offset=".5" stop-color="#4a3520"/>
        <stop offset="1" stop-color="#2a1b10"/>
      </linearGradient>
      <radialGradient id="v" cx=".5" cy=".46" r=".72">
        <stop offset=".35" stop-color="#c8a45c" stop-opacity=".10"/>
        <stop offset="1" stop-color="#000" stop-opacity=".58"/>
      </radialGradient>
    </defs>
    <rect width="${MAP_W}" height="${MAP_H}" fill="url(#p)"/>
    <rect width="${MAP_W}" height="${MAP_H}" fill="url(#v)"/>
  </svg>`)) .png().toBuffer();

  const relief = await sharp(TERRAIN)
    .resize(MAP_W, MAP_H, { fit: 'fill' })
    .greyscale()
    .modulate({ brightness: 0.55 })
    .ensureAlpha(0.14)
    .png()
    .toBuffer();

  const terrain = await sharp(paper)
    .composite([{ input: relief, blend: 'over' }])
    .composite([goldOverlay(provSmall, MAP_W, MAP_H, 0.10)])
    .composite([goldOverlay(stateSmall, MAP_W, MAP_H, 0.92)])
    .png({ compressionLevel: 9 });

  await terrain.toFile(path.join(OUT, 'map_state.png'));
}

async function makeSilhouettes() {
  const geo = JSON.parse(fs.readFileSync(GEOM, 'utf8')).states;
  const hit = await sharp(HITMAP).raw().toBuffer({ resolveWithObject: true });
  const hw = hit.info.width, hh = hit.info.height, hc = hit.info.channels;
  const ids = Object.keys(geo).map(Number).sort((a, b) => a - b);

  const guiBlocks = [];
  const gfxBlocks = [];
  const props = [];
  const initVars = [];
  const setFx = [];
  const visTriggers = [];

  for (const id of ids) {
    const g = geo[id];
    const [bx, by, bw, bh] = g.bbox;
    const sx = Math.max(0, Math.round(bx * MAP_W / SRC_W));
    const sy = Math.max(0, Math.round(by * MAP_H / SRC_H));
    const sw = Math.max(1, Math.round(bw * MAP_W / SRC_W));
    const sh = Math.max(1, Math.round(bh * MAP_H / SRC_H));

    // 从 hitmap 提取该州 bbox 内的 0/255 mask
    const mask = Buffer.alloc(bw * bh);
    for (let y = 0; y < bh; y++) {
      const yy = by + y;
      if (yy < 0 || yy >= hh) continue;
      for (let x = 0; x < bw; x++) {
        const xx = bx + x;
        if (xx < 0 || xx >= hw) continue;
        const i = (yy * hw + xx) * hc;
        const sid = hit.data[i] + hit.data[i + 1] * 256 + hit.data[i + 2] * 65536;
        if (sid === id) mask[y * bw + x] = 255;
      }
    }

    const small = await resizeMask(mask, bw, bh, sw, sh);
    const sheet = Buffer.alloc(sw * FRAMES * sh * 4);

    for (let f = 0; f < FRAMES; f++) {
      const color = PLAY_COLORS[f] || [0, 0, 0];
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const m = small[y * sw + x];
          if (m < 8) continue;
          const left = x > 0 ? small[y * sw + x - 1] : 0;
          const right = x + 1 < sw ? small[y * sw + x + 1] : 0;
          const up = y > 0 ? small[(y - 1) * sw + x] : 0;
          const down = y + 1 < sh ? small[(y + 1) * sw + x] : 0;
          const edge = left < 32 || right < 32 || up < 32 || down < 32;
          const o = ((y * sw * FRAMES) + (f * sw) + x) * 4;
          if (f === 0) continue;
          if (edge) {
            sheet[o] = EDGE[0]; sheet[o + 1] = EDGE[1]; sheet[o + 2] = EDGE[2]; sheet[o + 3] = 238;
          } else {
            sheet[o] = color[0]; sheet[o + 1] = color[1]; sheet[o + 2] = color[2]; sheet[o + 3] = 158;
          }
        }
      }
    }

    const file = path.join(FX, `fx_${id}.png`);
    await sharp(sheet, { raw: { width: sw * FRAMES, height: sh, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(file);

    guiBlocks.push(
`		iconType = {
			name = "SCR_Bac_Fx_${id}"
			position = { x = ${MAP_X + sx} y = ${MAP_Y + sy} }
			spriteType = "GFX_SCR_bac_fx_${id}"
			alwaystransparent = yes
		}`
    );
    gfxBlocks.push(
`	SpriteType = {
		name = "GFX_SCR_bac_fx_${id}"
		texturefile = "gfx/interface/SCR_bacchanal/fx/fx_${id}.png"
		noOfFrames = ${FRAMES}
		transparencecheck = yes
		legacy_lazy_load = no
	}`
    );
    props.push(`			SCR_Bac_Fx_${id} = { frame = SCR_fx_${id} }`);
    initVars.push(`	set_variable = { SCR_fx_${id} = 0 }`);
    setFx.push(`	if = {
		limit = { state = ${id} }
		set_variable = { ROOT.SCR_fx_${id} = ROOT.SCR_tour_play }
	}`);
    visTriggers.push(`			SCR_Bac_Fx_${id}_visible = { check_variable = { SCR_fx_${id} > 0 } }`);
  }

  fs.writeFileSync(GFX, `# 自动生成：docs/gen_scr_bacchanal_fx.cjs\n# 每个州一张 6 帧州块（0 = 无巡演，1..5 = 五出剧目）\n\nspriteTypes = {\n${gfxBlocks.join('\n')}\n}\n`);

  let gui = fs.readFileSync(GUI, 'utf8');
  gui = replaceBetween(gui, '# >>> SCR_BAC_FX_START', '# >>> SCR_BAC_FX_END', guiBlocks.join('\n'));
  fs.writeFileSync(GUI, gui);

  let sg = fs.readFileSync(SG, 'utf8');
  sg = replaceBetween(sg, '# >>> SCR_BAC_FX_PROPS_START', '# >>> SCR_BAC_FX_PROPS_END', props.join('\n'));
  sg = replaceBetween(sg, '# >>> SCR_BAC_FX_VIS_START', '# >>> SCR_BAC_FX_VIS_END', visTriggers.join('\n'));
  fs.writeFileSync(SG, sg);

  let eff = fs.readFileSync(EFF, 'utf8');
  eff = replaceBetween(eff, '# >>> SCR_BAC_FX_INIT_START', '# >>> SCR_BAC_FX_INIT_END', initVars.join('\n'));
  eff = replaceBetween(eff, '# >>> SCR_BAC_FX_SET_START', '# >>> SCR_BAC_FX_SET_END', setFx.join('\n'));
  fs.writeFileSync(EFF, eff);

  console.log(`fx silhouettes: ${ids.length} 个州 / 每州 ${FRAMES} 帧`);
}

async function main() {
  await makeBaseMap();
  await makeSilhouettes();
  console.log('done:', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
