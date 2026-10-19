#!/usr/bin/env node
/*
 * 猩红剧团 ·「酒神的大地巡演」素材生成器
 * 运行：NODE_PATH=E:/tmp/lud/node_modules node docs/gen_scr_bacchanal_assets.cjs
 *
 * 说明：
 *  - 古典剧场主背景由生图工具产出（docs/SCR_bacchanal_bg_source.png），
 *    本脚本只负责裁掉右下角水印、压暗中央可读区并缩放到 1760x1000。
 *  - 卡片 / 底板 / 按钮 / 地图图标 / 地图模式按钮全部用矢量 SVG + sharp 现画。
 *  - 所有 iconType / buttonType 的显示尺寸 = PNG 原生尺寸，故尺寸写死在文件名里。
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'gfx', 'interface', 'SCR_bacchanal');
const IDEAS = path.join(ROOT, 'gfx', 'interface', 'ideas', 'SCR');
fs.mkdirSync(OUT, { recursive: true });

const GOLD = '#c8a45c';
const GOLD_HI = '#f0d79a';
const GOLD_DK = '#6d4b1d';
const CRIMSON = '#6f0d1d';
const CRIMSON_HI = '#a51a2f';
const INK = '#0b0608';

const goldGrad = (id) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${GOLD_HI}"/>
    <stop offset=".45" stop-color="${GOLD}"/>
    <stop offset="1" stop-color="${GOLD_DK}"/>
  </linearGradient>`;
const crimsonGrad = (id) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3a050d"/>
    <stop offset=".5" stop-color="${CRIMSON}"/>
    <stop offset="1" stop-color="#250309"/>
  </linearGradient>`;

function card(selected) {
  const w = 440, h = 112;
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}${crimsonGrad('c')}
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${selected ? '#7d1024' : '#170a0d'}" stop-opacity=".96"/>
        <stop offset=".55" stop-color="${selected ? '#4a0714' : '#10080a'}" stop-opacity=".92"/>
        <stop offset="1" stop-color="#090506" stop-opacity=".88"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="7" fill="url(#fade)"
          stroke="${selected ? GOLD_HI : '#8f6d32'}" stroke-width="${selected ? 2.4 : 1.6}"/>
    <rect x="9" y="9" width="${w - 18}" height="${h - 18}" rx="4" fill="none"
          stroke="${GOLD}" stroke-opacity="${selected ? '.62' : '.28'}" stroke-width="1"/>
    <rect x="0" y="16" width="6" height="${h - 32}" fill="${selected ? GOLD_HI : CRIMSON_HI}"/>
    <path d="M14 7 h18 M14 7 v18" stroke="${selected ? GOLD_HI : GOLD}" stroke-opacity=".75" stroke-width="2"/>
    <path d="M${w - 14} ${h - 7} h-18 M${w - 14} ${h - 7} v-18" stroke="${selected ? GOLD_HI : GOLD}" stroke-opacity=".75" stroke-width="2"/>
    <circle cx="32" cy="56" r="27" fill="#090506" stroke="${GOLD}" stroke-opacity=".5" stroke-width="1"/>
    <circle cx="${w - 24}" cy="17" r="3" fill="${selected ? GOLD_HI : CRIMSON_HI}"/>
  </svg>`;
}

const panelSvg = (w, h) => `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0d0709" stop-opacity=".9"/>
        <stop offset=".5" stop-color="#090506" stop-opacity=".84"/>
        <stop offset="1" stop-color="#050304" stop-opacity=".92"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="6" fill="url(#bg)" stroke="${GOLD_DK}" stroke-width="2"/>
    <rect x="9" y="9" width="${w - 18}" height="${h - 18}" rx="3" fill="none" stroke="${GOLD}" stroke-opacity=".35" stroke-width="1"/>
    <path d="M10 42 V10 H42 M${w - 10} 42 V10 H${w - 42} M10 ${h - 42} V${h - 10} H42 M${w - 10} ${h - 42} V${h - 10} H${w - 42}"
          fill="none" stroke="${GOLD}" stroke-opacity=".72" stroke-width="2"/>
    <path d="M46 15 H118 M${w - 46} 15 H${w - 118}" stroke="${GOLD}" stroke-opacity=".5" stroke-width="1"/>
    <circle cx="34" cy="15" r="3" fill="${GOLD}"/>
    <circle cx="${w - 34}" cy="15" r="3" fill="${GOLD}"/>
  </svg>`;

function buttonSvg(w, h, primary) {
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}${crimsonGrad('c')}</defs>
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="5" fill="${primary ? 'url(#c)' : '#10080a'}"
          stroke="${primary ? GOLD_HI : GOLD}" stroke-width="2"/>
    <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="2" fill="none"
          stroke="${GOLD}" stroke-opacity="${primary ? '.55' : '.3'}" stroke-width="1"/>
    <path d="M14 ${h / 2} h${w - 28}" stroke="${GOLD}" stroke-opacity=".25" stroke-width="1"/>
    <path d="M${w / 2 - 5} 7 l5 -5 l5 5 M${w / 2 - 5} ${h - 7} l5 5 l5 -5"
          fill="none" stroke="${GOLD_HI}" stroke-opacity=".8" stroke-width="1.4"/>
  </svg>`;
}

function closeSvg() {
  return `
  <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
    <circle cx="23" cy="23" r="20" fill="#0b0608" fill-opacity=".76" stroke="${GOLD}" stroke-width="1.6"/>
    <circle cx="23" cy="23" r="15" fill="none" stroke="${GOLD}" stroke-opacity=".35" stroke-width="1"/>
    <path d="M16 16 L30 30 M30 16 L16 30" stroke="${GOLD_HI}" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

function mapIconSvg(size, decision) {
  const inner = decision ? 22 : 10;
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}${crimsonGrad('c')}</defs>
    <circle cx="16" cy="16" r="14.5" fill="#0a0507" fill-opacity=".86" stroke="url(#g)" stroke-width="2"/>
    <circle cx="16" cy="16" r="11" fill="url(#c)" stroke="${GOLD}" stroke-opacity=".6" stroke-width="1"/>
    <path d="M9.5 13.2c1.2-3 4-4.2 6.5-4.2s5.3 1.2 6.5 4.2c-1 2.7-3.5 4.3-6.5 4.3s-5.5-1.6-6.5-4.3z"
          fill="none" stroke="${GOLD_HI}" stroke-width="1.4"/>
    <path d="M12 12.3c.9 0 1.5.7 1.5 1.5s-.6 1.4-1.5 1.4-1.5-.6-1.5-1.4.6-1.5 1.5-1.5z
             M20 12.3c.9 0 1.5.7 1.5 1.5s-.6 1.4-1.5 1.4-1.5-.6-1.5-1.4.6-1.5 1.5-1.5z" fill="${GOLD_HI}"/>
    <path d="M12.5 19.2c2.2 1.8 4.8 1.8 7 0" fill="none" stroke="${GOLD_HI}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M16 3.3 l1.5 2.4 l2.8 .7 l-2 2.1 l.4 2.9 l-2.7-1.3 l-2.7 1.3 l.4-2.9 l-2-2.1 l2.8-.7z"
          fill="${GOLD_HI}" fill-opacity=".9" transform="translate(0,-1.5) scale(.62) translate(9.8,1.4)"/>
    <circle cx="16" cy="16" r="14.5" fill="none" stroke="${GOLD_HI}" stroke-opacity=".25" stroke-width="${inner > 15 ? 2 : 1}"/>
  </svg>`;
}

function plaqueSvg() {
  return `
  <svg width="560" height="112" viewBox="0 0 560 112" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}
      <linearGradient id="p" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#1a090d" stop-opacity=".94"/>
        <stop offset=".6" stop-color="#0b0608" stop-opacity=".9"/>
        <stop offset="1" stop-color="#090506" stop-opacity=".82"/>
      </linearGradient>
    </defs>
    <path d="M22 3 H538 Q557 3 557 22 V90 Q557 109 538 109 H22 Q3 109 3 90 V22 Q3 3 22 3Z"
          fill="url(#p)" stroke="${GOLD}" stroke-width="1.8"/>
    <path d="M18 12 H542 M18 100 H542" stroke="${GOLD}" stroke-opacity=".28" stroke-width="1"/>
    <path d="M3 38 V22 Q3 3 22 3 H38 M522 3 H538 Q557 3 557 22 V38
             M557 74 V90 Q557 109 538 109 H522 M38 109 H22 Q3 109 3 90 V74"
          fill="none" stroke="${GOLD_HI}" stroke-opacity=".85" stroke-width="2"/>
    <circle cx="28" cy="56" r="9" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
    <path d="M28 48 l2.2 4.6 l5 .7 l-3.6 3.5 l.9 5 l-4.5-2.4 l-4.5 2.4 l.9-5 l-3.6-3.5 l5-.7z" fill="${GOLD}" fill-opacity=".8"/>
  </svg>`;
}

function sealSvg() {
  return `
  <svg width="104" height="104" viewBox="0 0 104 104" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}</defs>
    <circle cx="52" cy="52" r="44" fill="#3d0711" stroke="url(#g)" stroke-width="3"/>
    <circle cx="52" cy="52" r="36" fill="none" stroke="${GOLD_HI}" stroke-opacity=".65" stroke-width="1.2"/>
    <path d="M52 22 l7.4 15.6 l17.2 2.3 l-12.6 11.9 l3.2 17 l-15.2-8.3 l-15.2 8.3 l3.2-17 l-12.6-11.9 l17.2-2.3z"
          fill="${GOLD_HI}" fill-opacity=".92"/>
    <circle cx="52" cy="52" r="31" fill="none" stroke="${GOLD}" stroke-opacity=".45" stroke-width="1"/>
  </svg>`;
}

function dividerSvg() {
  return `
  <svg width="1000" height="4" viewBox="0 0 1000 4" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="d" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${GOLD}" stop-opacity="0"/>
        <stop offset=".2" stop-color="${GOLD}" stop-opacity=".7"/>
        <stop offset=".5" stop-color="${GOLD_HI}" stop-opacity=".95"/>
        <stop offset=".8" stop-color="${GOLD}" stop-opacity=".7"/>
        <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="1" width="1000" height="2" fill="url(#d)"/>
    <circle cx="500" cy="2" r="2.5" fill="${GOLD_HI}"/>
  </svg>`;
}

function mapmodeSvg(selected) {
  return `
  <svg width="20" height="18" viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="18" height="16" rx="2" fill="${selected ? '#6f0d1d' : '#160a0d'}"
          stroke="${selected ? GOLD_HI : GOLD_DK}" stroke-width="1.3"/>
    <path d="M5 13 V7 M10 13 V5 M15 13 V9" stroke="${selected ? GOLD_HI : GOLD}" stroke-width="1.5"/>
    <circle cx="10" cy="4" r="1.2" fill="${selected ? GOLD_HI : GOLD}"/>
  </svg>`;
}

function mapFrameSvg() {
  return `
  <svg width="780" height="296" viewBox="0 0 780 296" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}</defs>
    <rect x="1" y="1" width="778" height="294" fill="none" stroke="${GOLD_DK}" stroke-width="2"/>
    <rect x="8" y="8" width="764" height="280" fill="none" stroke="${GOLD}" stroke-opacity=".38" stroke-width="1"/>
    <path d="M9 44 V9 H44 M771 44 V9 H736 M9 252 V287 H44 M771 252 V287 H736"
          fill="none" stroke="${GOLD_HI}" stroke-opacity=".9" stroke-width="2.4"/>
    <path d="M9 44 q14 -14 28 0 M771 44 q-14 -14 -28 0 M9 252 q14 14 28 0 M771 252 q-14 14 -28 0"
          fill="none" stroke="${GOLD}" stroke-opacity=".7" stroke-width="1.4"/>
    <path d="M390 3 l-14 9 h28 z" fill="${GOLD_HI}" fill-opacity=".9"/>
    <circle cx="390" cy="3" r="2.4" fill="#3d0711" stroke="${GOLD_HI}" stroke-width="1"/>
  </svg>`;
}

function infoPanelSvg() {
  return `
  <svg width="320" height="276" viewBox="0 0 320 276" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}
      <linearGradient id="ib" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#150a0d" stop-opacity=".94"/>
        <stop offset="1" stop-color="#080405" stop-opacity=".9"/>
      </linearGradient>
    </defs>
    <path d="M16 2 H304 Q318 2 318 16 V260 Q318 274 304 274 H16 Q2 274 2 260 V16 Q2 2 16 2Z"
          fill="url(#ib)" stroke="${GOLD_DK}" stroke-width="1.8"/>
    <path d="M10 20 V10 H20 M300 10 H310 V20 M310 256 V266 H300 M20 266 H10 V256"
          fill="none" stroke="${GOLD}" stroke-opacity=".85" stroke-width="2"/>
    <path d="M24 28 H296" stroke="${GOLD}" stroke-opacity=".45" stroke-width="1"/>
    <path d="M24 248 H296" stroke="${GOLD}" stroke-opacity=".3" stroke-width="1"/>
    <circle cx="160" cy="28" r="2.6" fill="${GOLD_HI}"/>
  </svg>`;
}

function markerSvg() {
  return `
  <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}${crimsonGrad('c')}</defs>
    <circle cx="16" cy="16" r="13.5" fill="#0a0507" fill-opacity=".78" stroke="url(#g)" stroke-width="2.2"/>
    <circle cx="16" cy="16" r="9.6" fill="url(#c)" stroke="${GOLD_HI}" stroke-opacity=".7" stroke-width="1"/>
    <path d="M10.8 14.1c1-2.5 3.1-3.5 5.2-3.5s4.2 1 5.2 3.5c-.9 2.2-2.8 3.5-5.2 3.5s-4.3-1.3-5.2-3.5z"
          fill="none" stroke="${GOLD_HI}" stroke-width="1.1"/>
    <path d="M13.2 13.4c.6 0 1 .4 1 1s-.4 1-1 1-.9-.4-.9-1 .4-1 .9-1z
             M18.8 13.4c.6 0 1 .4 1 1s-.4 1-1 1-.9-.4-.9-1 .4-1 .9-1z" fill="${GOLD_HI}"/>
    <path d="M13.5 18.4c1.6 1.2 3.4 1.2 5 0" fill="none" stroke="${GOLD_HI}" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`;
}

// 选中舞台的金色描边（34x34，底图州块/面具标记之外再套一圈）
function selRingSvg() {
  return `
  <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
    <defs>${goldGrad('g')}
      <radialGradient id="glow" cx=".5" cy=".5" r=".5">
        <stop offset=".55" stop-color="${GOLD_HI}" stop-opacity="0"/>
        <stop offset=".82" stop-color="${GOLD_HI}" stop-opacity=".30"/>
        <stop offset="1" stop-color="${GOLD_HI}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="17" cy="17" r="15.5" fill="url(#glow)"/>
    <circle cx="17" cy="17" r="13.2" fill="none" stroke="url(#g)" stroke-width="2.4"/>
    <circle cx="17" cy="17" r="10.6" fill="none" stroke="${GOLD_HI}" stroke-opacity=".55" stroke-width="1"/>
    <path d="M17 1.2 l2.2 3.2 -2.2 3.2 -2.2 -3.2z" fill="${GOLD_HI}"/>
    <path d="M17 32.8 l2.2 -3.2 -2.2 -3.2 -2.2 3.2z" fill="${GOLD_HI}"/>
  </svg>`;
}

async function main() {
  const src = path.join(ROOT, 'docs', 'SCR_bacchanal_bg_source.png');
  if (!fs.existsSync(src)) throw new Error('缺少 docs/SCR_bacchanal_bg_source.png');

  // 1) 主背景：裁掉底部水印区，再压成 1760x1000；中央压暗以保证文字可读。
  const bg = await sharp(src)
    .extract({ left: 67, top: 0, width: 2682, height: 1524 })
    .resize(1760, 1000, { fit: 'fill' })
    .modulate({ brightness: 0.92, saturation: 0.94 })
    .composite([
      {
        input: Buffer.from(`<svg width="1760" height="1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="l" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#000" stop-opacity=".55"/>
              <stop offset=".18" stop-color="#000" stop-opacity=".20"/>
              <stop offset=".72" stop-color="#000" stop-opacity=".22"/>
              <stop offset="1" stop-color="#000" stop-opacity=".62"/>
            </linearGradient>
            <radialGradient id="v" cx=".5" cy=".48" r=".78">
              <stop offset=".35" stop-color="#000" stop-opacity="0"/>
              <stop offset="1" stop-color="#000" stop-opacity=".42"/>
            </radialGradient>
          </defs>
          <rect width="1760" height="1000" fill="url(#l)"/>
          <rect width="1760" height="1000" fill="url(#v)"/>
          <rect x="0" y="936" width="1760" height="64" fill="#070405" fill-opacity=".98"/>
          <path d="M0 937 H1760" stroke="#6d4b1d" stroke-opacity=".9" stroke-width="1.5"/>
          <path d="M0 943 H1760" stroke="#c8a45c" stroke-opacity=".45" stroke-width="1"/>
          <path d="M860 931 l20 6 l-20 6 l-20 -6z" fill="#c8a45c" fill-opacity=".85"/>
        </svg>`),
        blend: 'over',
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'bg_main.png'));

  // 2) 面板地图框 / 州信息栏 / 可点击标记（底图与州块由 gen_scr_bacchanal_fx.cjs 生成）
  await sharp(Buffer.from(mapFrameSvg())).png().toFile(path.join(OUT, 'map_frame.png'));
  await sharp(Buffer.from(infoPanelSvg())).png().toFile(path.join(OUT, 'info_panel.png'));
  await sharp(Buffer.from(markerSvg())).png().toFile(path.join(OUT, 'panel_marker.png'));
  await sharp(Buffer.from(selRingSvg())).png().toFile(path.join(OUT, 'panel_selring.png'));

  // 3) 卡片 / 底板 / 按钮
  await sharp(Buffer.from(card(false))).png().toFile(path.join(OUT, 'card_normal.png'));
  await sharp(Buffer.from(card(true))).png().toFile(path.join(OUT, 'card_selected.png'));
  await sharp(Buffer.from(panelSvg(1150, 780))).png().toFile(path.join(OUT, 'panel_detail.png'));
  await sharp(Buffer.from(buttonSvg(520, 70, true))).png().toFile(path.join(OUT, 'btn_depart.png'));
  await sharp(Buffer.from(buttonSvg(338, 50, false))).png().toFile(path.join(OUT, 'btn_secondary.png'));
  await sharp(Buffer.from(buttonSvg(210, 50, false))).png().toFile(path.join(OUT, 'btn_small.png'));
  await sharp(Buffer.from(closeSvg())).png().toFile(path.join(OUT, 'btn_close.png'));
  await sharp(Buffer.from(plaqueSvg())).png().toFile(path.join(OUT, 'plaque_state.png'));
  await sharp(Buffer.from(sealSvg())).png().toFile(path.join(OUT, 'seal.png'));
  await sharp(Buffer.from(dividerSvg())).png().toFile(path.join(OUT, 'divider.png'));

  // 3) 地图图标 / 决议图标 / 地图模式按钮
  await sharp(Buffer.from(mapIconSvg(32, false))).png().toFile(path.join(OUT, 'mapicon.png'));
  await sharp(Buffer.from(mapIconSvg(64, true))).png().toFile(path.join(OUT, 'decision_icon.png'));
  await sharp(Buffer.from(mapmodeSvg(false))).png().toFile(
    path.join(OUT, 'mapmode_buttons_deselected_small_scr_bacchanal_map_mode.png'));
  await sharp(Buffer.from(mapmodeSvg(true))).png().toFile(
    path.join(OUT, 'mapmode_buttons_selected_small_scr_bacchanal_map_mode.png'));

  // 4) 州级动态修正图标（32x32）从既有 60x60 剧目图缩放
  const playIcons = {
    der_ring: 'scr_play_der_ring.png',
    one_hundred_one_days: 'scr_play_101_days.png',
    wonderland: 'scr_play_wonderland.png',
    frost_deer: 'scr_play_frost_deer.png',
    mother_wolf: 'scr_play_mother_wolf.png',
  };
  for (const [key, file] of Object.entries(playIcons)) {
    await sharp(path.join(IDEAS, file))
      .resize(32, 32, { fit: 'cover' })
      .png()
      .toFile(path.join(OUT, `dm_${key}.png`));
  }

  console.log('done:', OUT);
  console.log('bg_main:', bg.width + 'x' + bg.height);
}

main().catch((e) => { console.error(e); process.exit(1); });
