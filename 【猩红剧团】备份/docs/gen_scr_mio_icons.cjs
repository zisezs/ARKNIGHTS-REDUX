#!/usr/bin/env node
/*
 * 猩红剧团（SCR）军工企业组织图标生成器
 * --------------------------------------------------------------------------
 * 主题：异世界的亡国法兰西。八家军工机构不是新建工业，而是亡国兵工体系
 * 流亡到剧团巡演车队后的残响。统一版式：
 *   深酒红底板 + 双层金线边 + 底部撕裂幕布 + 金色几何徽记。
 * 全部为代码绘制矢量图（SVG -> sharp），不使用 AI 生图。
 *
 * 用法：
 *   node docs/gen_scr_mio_icons.cjs           # 生成并写入
 *   node docs/gen_scr_mio_icons.cjs --check   # 只检查现有文件
 *
 * 输出：gfx/interface/military_industrial_organization/SCR/*.png（64x64 RGBA）
 */
'use strict';

const fs = require('fs');
const path = require('path');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('E:/tmp/lud/node_modules/sharp'); } // 本机惯例位置

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'gfx/interface/military_industrial_organization/SCR');

const BG_TOP = '#241016';
const BG_BOT = '#10070b';
const CRIMSON = '#8f1d2c';
const CRIMSON_LIGHT = '#b8323f';
const GOLD = '#d9b45b';
const GOLD_LIGHT = '#f0d98a';

function frame(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BG_TOP}"/>
      <stop offset="1" stop-color="${BG_BOT}"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GOLD_LIGHT}"/>
      <stop offset="0.55" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="#9c7428"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="62" height="62" rx="9" fill="url(#bg)"/>
  <rect x="1" y="1" width="62" height="62" rx="9" fill="none" stroke="${CRIMSON}" stroke-width="2"/>
  <rect x="4.5" y="4.5" width="55" height="55" rx="6" fill="none" stroke="${GOLD}" stroke-width="0.9" opacity="0.65"/>
  <path d="M8 55 Q20 50 32 55 Q44 60 56 55" fill="none" stroke="${CRIMSON_LIGHT}" stroke-width="2.2" opacity="0.55"/>
  <path d="M8 58 Q20 53 32 58 Q44 63 56 58" fill="none" stroke="${CRIMSON}" stroke-width="1.2" opacity="0.5"/>
  ${inner}
</svg>`;
}

const ICONS = {
  // 1 林贡斯兵工厂联合体：交叉步枪
  lingons_arsenal: `<g transform="translate(32 30)">
    <g transform="rotate(-30)">
      <rect x="-2" y="-17" width="4" height="29" rx="1.2" fill="url(#gold)"/>
      <rect x="-3.4" y="9" width="6.8" height="8" rx="1" fill="${CRIMSON_LIGHT}"/>
      <rect x="-1.4" y="-18.5" width="2.8" height="4" rx="0.8" fill="${GOLD_LIGHT}"/>
    </g>
    <g transform="rotate(30)">
      <rect x="-2" y="-17" width="4" height="29" rx="1.2" fill="url(#gold)"/>
      <rect x="-3.4" y="9" width="6.8" height="8" rx="1" fill="${CRIMSON_LIGHT}"/>
      <rect x="-1.4" y="-18.5" width="2.8" height="4" rx="0.8" fill="${GOLD_LIGHT}"/>
    </g>
    <path d="M-13 19 L0 13 L13 19" fill="none" stroke="${GOLD_LIGHT}" stroke-width="1.6" stroke-linecap="round"/>
  </g>`,

  // 2 旧王炮兵铸造局：火炮与炮轮
  royal_foundry: `<g transform="translate(32 32) rotate(-18)">
    <rect x="-6" y="-4" width="30" height="7" rx="2" fill="url(#gold)"/>
    <rect x="22" y="-6.5" width="5" height="12" rx="1.2" fill="${GOLD_LIGHT}"/>
    <path d="M-6 -4 L-12 -9 L-12 1 Z" fill="${GOLD_LIGHT}"/>
    <circle cx="-12" cy="9" r="7" fill="none" stroke="${GOLD_LIGHT}" stroke-width="2.4"/>
    <circle cx="-12" cy="9" r="2" fill="${CRIMSON_LIGHT}"/>
    <path d="M-19 9 L-5 9 M-12 2 L-12 16" stroke="${GOLD}" stroke-width="1" opacity="0.8"/>
  </g>`,

  // 3 阿维尔尼机动车工场：齿轮与车轮
  arvern_motors: `<g transform="translate(32 31)">
    <g fill="url(#gold)">
      <rect x="-2.6" y="-18" width="5.2" height="7" rx="1" transform="rotate(0)"/>
      <rect x="-2.6" y="-18" width="5.2" height="7" rx="1" transform="rotate(45)"/>
      <rect x="-2.6" y="-18" width="5.2" height="7" rx="1" transform="rotate(90)"/>
      <rect x="-2.6" y="-18" width="5.2" height="7" rx="1" transform="rotate(135)"/>
      <rect x="-2.6" y="-18" width="5.2" height="7" rx="1" transform="rotate(180)"/>
      <rect x="-2.6" y="-18" width="5.2" height="7" rx="1" transform="rotate(225)"/>
      <rect x="-2.6" y="-18" width="5.2" height="7" rx="1" transform="rotate(270)"/>
      <rect x="-2.6" y="-18" width="5.2" height="7" rx="1" transform="rotate(315)"/>
    </g>
    <circle r="12" fill="none" stroke="url(#gold)" stroke-width="4"/>
    <circle r="5" fill="none" stroke="${GOLD_LIGHT}" stroke-width="2"/>
    <circle r="1.8" fill="${CRIMSON_LIGHT}"/>
  </g>`,

  // 4 塞夸尼装甲工场：坦克剪影
  sequani_armor: `<g transform="translate(32 33)">
    <rect x="-19" y="3" width="38" height="10" rx="4" fill="url(#gold)"/>
    <rect x="-13" y="-6" width="19" height="9" rx="2.2" fill="url(#gold)"/>
    <rect x="2" y="-4" width="21" height="4" rx="1.2" fill="${GOLD_LIGHT}"/>
    <rect x="-5" y="-10" width="4" height="4" rx="1" fill="${GOLD_LIGHT}"/>
    <g fill="${CRIMSON_LIGHT}">
      <circle cx="-13" cy="13" r="2.2"/><circle cx="-5" cy="13" r="2.2"/>
      <circle cx="3" cy="13" r="2.2"/><circle cx="11" cy="13" r="2.2"/>
    </g>
  </g>`,

  // 5 特雷维尔航空制造局：飞机
  treveri_aero: `<g transform="translate(32 32)">
    <path d="M0 -19 L4 -4 L21 3 L21 7 L4 4 L3 13 L9 17 L9 19.5 L0 17 L-9 19.5 L-9 17 L-3 13 L-4 4 L-21 7 L-21 3 L-4 -4 Z"
          fill="url(#gold)" stroke="${GOLD_LIGHT}" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="2.2" fill="${CRIMSON_LIGHT}"/>
  </g>`,

  // 6 阿莫里克船台总局：船锚
  armorica_dockyards: `<g transform="translate(32 31)">
    <path d="M-21 4 L21 4 L13 15 L-13 15 Z" fill="url(#gold)"/>
    <rect x="-17" y="-1" width="34" height="4.2" rx="1.2" fill="${GOLD_LIGHT}"/>
    <line x1="0" y1="-19" x2="0" y2="-1" stroke="${GOLD_LIGHT}" stroke-width="2.4"/>
    <path d="M0 -18 L12 -11 L0 -4 Z" fill="${CRIMSON_LIGHT}" stroke="${GOLD_LIGHT}" stroke-width="0.8"/>
    <path d="M-21 19 Q-13 15 -5 19 Q3 23 11 19 Q17 16 21 19"
          fill="none" stroke="${GOLD}" stroke-width="1.6" opacity="0.85"/>
  </g>`,

  // 7 先锋国军需总局：板条箱与月桂
  vanguard_intendance: `<g transform="translate(32 32)">
    <g fill="none" stroke="url(#gold)" stroke-width="1.8">
      <rect x="-17" y="-3" width="15" height="13" rx="1"/>
      <rect x="2" y="-3" width="15" height="13" rx="1"/>
      <rect x="-7.5" y="-15" width="15" height="10" rx="1"/>
    </g>
    <g stroke="${GOLD_LIGHT}" stroke-width="1" opacity="0.9">
      <path d="M-17 -3 L-2 10 M-2 -3 L-17 10"/>
      <path d="M2 -3 L17 10 M17 -3 L2 10"/>
      <path d="M-7.5 -15 L7.5 -5 M7.5 -15 L-7.5 -5"/>
    </g>
    <path d="M-21 13 Q0 21 21 13" fill="none" stroke="${CRIMSON_LIGHT}" stroke-width="2"/>
  </g>`,

  // 8 猩红剧团道具工坊：面具与火
  crimson_props: `<g transform="translate(28 33)">
    <path d="M-11 -9 Q0 -17 11 -9 Q11 7 0 13 Q-11 7 -11 -9 Z"
          fill="none" stroke="url(#gold)" stroke-width="2.6"/>
    <circle cx="-4.6" cy="-3" r="1.9" fill="${GOLD_LIGHT}"/>
    <circle cx="4.6" cy="-3" r="1.9" fill="${GOLD_LIGHT}"/>
    <path d="M-4.6 4 Q0 8.5 4.6 4" fill="none" stroke="${GOLD_LIGHT}" stroke-width="1.5" stroke-linecap="round"/>
  </g>
  <path d="M48 43 Q43 36 47 29 Q48 35 51 33 Q50 38 54 37 Q55 43 51 47 Q50 45 48 43 Z"
        fill="${CRIMSON_LIGHT}" stroke="${GOLD_LIGHT}" stroke-width="0.8"/>`,
};

const FILES = [
  ['lingons_arsenal', 'SCR_mio_lingons_arsenal.png'],
  ['royal_foundry', 'SCR_mio_royal_foundry.png'],
  ['arvern_motors', 'SCR_mio_arvern_motors.png'],
  ['sequani_armor', 'SCR_mio_sequani_armor.png'],
  ['treveri_aero', 'SCR_mio_treveri_aero.png'],
  ['armorica_dockyards', 'SCR_mio_armorica_dockyards.png'],
  ['vanguard_intendance', 'SCR_mio_vanguard_intendance.png'],
  ['crimson_props', 'SCR_mio_crimson_props.png'],
];

async function main() {
  const checkOnly = process.argv.includes('--check');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [key, file] of FILES) {
    const svg = Buffer.from(frame(ICONS[key]), 'utf8');
    const png = await sharp(svg, { density: 384 }).resize(64, 64).png().toBuffer();
    const out = path.join(OUT_DIR, file);
    if (checkOnly) {
      if (!fs.existsSync(out)) throw new Error('缺少 ' + out);
      const cur = fs.readFileSync(out);
      if (!cur.equals(png)) console.log('需更新 ' + file);
      continue;
    }
    fs.writeFileSync(out, png);
    console.log('写入 ' + path.relative(ROOT, out));
  }
  if (checkOnly) console.log('检查完成');
}

main().catch(e => { console.error(e); process.exit(1); });
