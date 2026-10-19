#!/usr/bin/env node
/*
 * 「酒神的大地巡演」离线版式预览
 * 运行：NODE_PATH=E:/tmp/lud/node_modules node docs/preview_scr_bacchanal.cjs
 * 产出：docs/out/preview_scr_bacchanal.png（1760x1000，按真机坐标合成）
 *
 * 文字直接从 SCR_l_simp_chinese.yml 取，避免预览和游戏内文案对不上。
 */
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'out');
const G = path.join(ROOT, 'gfx', 'interface', 'SCR_bacchanal');
const LOC = path.join(ROOT, 'localisation', 'simp_chinese', 'SCR_l_simp_chinese.yml');
const GEOM = 'E:/1.19.2(p)/langou123/mod/123456789/紫色的懒人MOD工具包/地块数据编辑器/cache/oaqkib/州几何.json';
const GEO = fs.existsSync(GEOM) ? JSON.parse(fs.readFileSync(GEOM, 'utf8')).states : {};
const MAP_X = 576, MAP_Y = 206, MAP_W = 760, MAP_H = 276;
fs.mkdirSync(OUT, { recursive: true });

GlobalFonts.registerFromPath('C:/Windows/Fonts/msyhbd.ttc', 'MSYH');
GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc', 'MSYH');

function readLoc() {
  const text = fs.readFileSync(LOC, 'utf8').replace(/^\uFEFF/, '');
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+):\s*"((?:[^"]|"")*)"/);
    if (m) out[m[1]] = m[2].replace(/""/g, '"').replace(/\\n/g, '\n');
  }
  return out;
}
const L = readLoc();
const clean = (s) => (s || '').replace(/§[A-Za-z0-9!]/g, '');
const S = (k) => clean(L[k] || k);

async function img(name) { return loadImage(path.join(G, name)); }

function wrap(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  const lines = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line); line = ch;
      } else line += ch;
    }
    lines.push(line);
  }
  let n = 0;
  for (const line of lines) {
    if (n >= maxLines) break;
    ctx.fillText(line, x, y + n * lineHeight);
    n++;
  }
  return n * lineHeight;
}

function colored(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  // 简单支持 §G §R §Y §!：逐行去色后按第一段的颜色画。
  let color = '#d9cfbf';
  const plain = text.replace(/§G/g, '').replace(/§R/g, '').replace(/§Y/g, '').replace(/§!/g, '');
  if (text.startsWith('§G')) color = '#7ed08a';
  if (text.startsWith('§R')) color = '#df7b7b';
  if (text.startsWith('§Y')) color = '#e8c878';
  ctx.fillStyle = color;
  return wrap(ctx, plain, x, y, maxWidth, lineHeight, maxLines);
}

(async () => {
  const canvas = createCanvas(1760, 1000);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(await img('bg_main.png'), 0, 0);

  // ---- 顶部 ----
  ctx.fillStyle = '#efe4c8';
  ctx.font = '26px MSYH';
  ctx.textBaseline = 'top';
  ctx.fillText(S('SCR_BAC_TITLE'), 92, 42);
  ctx.fillStyle = '#b9aa8d';
  ctx.font = '18px MSYH';
  ctx.fillText(S('SCR_BAC_SUBTITLE'), 94, 82);
  ctx.drawImage(await img('seal.png'), 1572, 34);
  ctx.drawImage(await img('btn_close.png'), 1688, 34);

  // ---- 左栏 ----
  ctx.fillStyle = '#d9bf82';
  ctx.font = '18px MSYH';
  ctx.fillText(S('SCR_BAC_LIST_TITLE'), 72, 136);

  const playIcons = ['scr_play_der_ring.png', 'scr_play_101_days.png', 'scr_play_wonderland.png', 'scr_play_frost_deer.png', 'scr_play_mother_wolf.png'];
  const playNames = ['SCR_play_der_ring', 'SCR_play_101_days', 'SCR_play_wonderland', 'SCR_play_frost_deer', 'SCR_play_mother_wolf'];
  const cardEffects = ['SCR_BAC_CARD_1', 'SCR_BAC_CARD_2', 'SCR_BAC_CARD_3', 'SCR_BAC_CARD_4', 'SCR_BAC_CARD_5'];
  for (let i = 0; i < 5; i++) {
    const y = 176 + i * 124;
    ctx.drawImage(await img(i === 0 ? 'card_selected.png' : 'card_normal.png'), 68, y);
    ctx.drawImage(await loadImage(path.join(ROOT, 'gfx', 'interface', 'ideas', 'SCR', playIcons[i])), 86, y + 26);
    ctx.fillStyle = i === 0 ? '#f2dfac' : '#cbbfa8';
    ctx.font = '18px MSYH';
    ctx.fillText(S(playNames[i]), 160, y + 14);
    colored(ctx, L[cardEffects[i]] || '', 160, y + 44, 330, 18, 2);
  }
  ctx.drawImage(await img('divider.png'), 78, 804);
  ctx.fillStyle = '#bfb29c';
  ctx.font = '16px MSYH';
  ctx.fillText('已巡演 3 州　·　地图外民用工厂 +3', 72, 826);

  // ---- 右栏底板 ----
  ctx.drawImage(await img('panel_detail.png'), 540, 150);

  // 静态州界地图 + 框 + 标记（预览只画几个示例州）
  ctx.fillStyle = '#d9bf82';
  ctx.font = '18px MSYH';
  ctx.fillText(S('SCR_BAC_MAP_HEAD'), 576, 168);
  ctx.drawImage(await img('map_frame.png'), 566, 196);
  ctx.drawImage(await img('map_state.png'), MAP_X, MAP_Y);

  // 示例：按效果着色的州块（真实游戏里由 properties.frame 切换）
  const sampleFx = [[839, 1], [966, 2], [15, 3], [6, 4], [144, 5]];
  for (const [id, frame] of sampleFx) {
    const g = GEO[id];
    if (!g) continue;
    const [bx, by, bw, bh] = g.bbox;
    const sx = Math.max(0, Math.round(bx * MAP_W / 5632));
    const sy = Math.max(0, Math.round(by * MAP_H / 2048));
    const sw = Math.max(1, Math.round(bw * MAP_W / 5632));
    const sh = Math.max(1, Math.round(bh * MAP_H / 2048));
    const file = path.join(G, 'fx', `fx_${id}.png`);
    if (!fs.existsSync(file)) continue;
    const fx = await loadImage(file);
    ctx.drawImage(fx, frame * sw, 0, sw, sh, MAP_X + sx, MAP_Y + sy, sw, sh);
  }

  const sampleStates = [867];
  for (const id of sampleStates) {
    const g = GEO[id];
    if (!g) continue;
    const x = MAP_X + Math.round(g.cx * MAP_W / 5632) - 11;
    const y = MAP_Y + Math.round(g.cy * MAP_H / 2048) - 11;
    ctx.drawImage(await img('panel_marker.png'), x, y);
  }
  ctx.drawImage(await img('info_panel.png'), 1352, 206);
  ctx.fillStyle = '#9c8e76';
  ctx.font = '16px MSYH';
  ctx.fillText(S('SCR_BAC_STATE_LABEL'), 1372, 224);
  ctx.fillStyle = '#f1e6c9';
  ctx.font = '18px MSYH';
  wrap(ctx, '克莱布拉松林地', 1372, 252, 280, 22, 2);
  ctx.fillStyle = '#a99b83';
  ctx.font = '16px MSYH';
  wrap(ctx, S('SCR_BAC_STATE_HINT'), 1372, 314, 280, 20, 5);
  ctx.fillText('已巡演 3 州', 1372, 424);
  ctx.fillText('地图外民用工厂 +3', 1372, 448);

  // 剧目详情
  ctx.fillStyle = '#d9bf82';
  ctx.font = '18px MSYH';
  ctx.fillText(S('SCR_BAC_DETAIL_HEAD'), 576, 498);
  ctx.fillStyle = '#e9d49c';
  ctx.fillText(S('SCR_play_der_ring'), 580, 528);
  ctx.fillStyle = '#c8bda8';
  ctx.font = '16px MSYH';
  wrap(ctx, S('SCR_BAC_P1_DESC'), 580, 558, 1050, 20, 3);
  colored(ctx, L['SCR_BAC_P1_POS'] || '', 580, 632, 1050, 20, 2);
  colored(ctx, L['SCR_BAC_P1_NEG'] || '', 580, 676, 1050, 20, 1);

  ctx.drawImage(await img('divider.png'), 580, 706);
  ctx.fillStyle = '#e8c878';
  ctx.font = '18px MSYH';
  ctx.fillText(S('SCR_BAC_COST'), 580, 716);
  ctx.fillStyle = '#d8c9ab';
  ctx.font = '16px MSYH';
  ctx.fillText('巡演冷却：18 天', 1000, 716);
  ctx.fillStyle = '#c8bda8';
  ctx.font = '16px MSYH';
  wrap(ctx, S('SCR_BAC_REWARD'), 580, 742, 1050, 20, 2);

  ctx.drawImage(await img('btn_depart.png'), 578, 790);
  ctx.fillStyle = '#fff1cd';
  ctx.font = '18px MSYH';
  ctx.textAlign = 'center';
  ctx.fillText(S('SCR_BAC_DEPART'), 838, 816);
  ctx.textAlign = 'left';

  ctx.drawImage(await img('btn_secondary.png'), 1112, 800);
  ctx.fillStyle = '#d8c9ab';
  ctx.font = '16px MSYH';
  ctx.textAlign = 'center';
  ctx.fillText(S('SCR_BAC_PICK'), 1281, 818);

  ctx.drawImage(await img('btn_small.png'), 1462, 800);
  ctx.fillStyle = '#d8c9ab';
  ctx.font = '16px MSYH';
  ctx.fillText(S('SCR_BAC_ALL_ON'), 1567, 818);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#9c8e76';
  ctx.font = '16px MSYH';
  ctx.fillText(S('SCR_BAC_DEPART_HINT'), 580, 866);

  ctx.drawImage(await img('divider.png'), 580, 884);
  ctx.fillStyle = '#a99b83';
  ctx.font = '16px MSYH';
  wrap(ctx, S('SCR_BAC_MAPMODE_HINT'), 580, 890, 1060, 18, 2);

  // ---- 底部条 ----
  ctx.fillStyle = '#8a7656';
  ctx.font = '14px MSYH';
  ctx.fillText('SCR · THE BACCHANAL TOUR', 72, 956);
  ctx.textAlign = 'right';
  ctx.fillText('1760 × 1000', 1688, 956);
  ctx.textAlign = 'left';

  fs.writeFileSync(path.join(OUT, 'preview_scr_bacchanal.png'), canvas.toBuffer('image/png'));
  console.log('preview:', path.join(OUT, 'preview_scr_bacchanal.png'));
})().catch((e) => { console.error(e); process.exit(1); });
