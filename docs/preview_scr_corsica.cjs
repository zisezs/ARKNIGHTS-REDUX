#!/usr/bin/env node
/**
 * 「科西嘉线」排版预览：把生成的 shared_focus 画成一张 PNG。
 * 用法：NODE_PATH=E:/tmp/lud/node_modules node docs/preview_scr_corsica.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const shared =
  fs.readFileSync(path.join(ROOT, 'common/national_focus/SCR_corsica_shared.txt'), 'utf8') +
  '\n' +
  fs.readFileSync(path.join(ROOT, 'common/national_focus/SCR_switch_shared.txt'), 'utf8');
const loc =
  fs.readFileSync(path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_corsica_l_simp_chinese.yml'), 'utf8') +
  '\n' +
  fs.readFileSync(path.join(ROOT, 'localisation/simp_chinese/ARF_SCR_switch_l_simp_chinese.yml'), 'utf8');

const names = {};
for (const m of loc.matchAll(/^\s*(SCR_(?:corsica|switch)_\d+):\s*"([^"]*)"/gm)) names[m[1]] = m[2];

const nodes = [];
for (const m of shared.matchAll(
  /shared_focus = \{\n\tid = (SCR_(?:corsica|switch)_\d+)\n\ticon = ([^\n]+)\n\tx = (-?\d+)\n\ty = (-?\d+)([\s\S]*?)\n\}/g
)) {
  const body = m[5];
  const prereq = [...body.matchAll(/prerequisite = \{\n\t\tfocus = (SCR_(?:corsica|switch)_\d+)\n\t\}/g)].map(
    (x) => x[1]
  );
  nodes.push({ id: m[1], icon: m[2], x: +m[3], y: +m[4], prereq });
}

const minX = Math.min(...nodes.map((n) => n.x));
const maxX = Math.max(...nodes.map((n) => n.x));
const minY = Math.min(...nodes.map((n) => n.y));
const maxY = Math.max(...nodes.map((n) => n.y));

const DX = Number(process.env.DX || 126);
const DY = Number(process.env.DY || 132);
const ICON_W = 110;
const ICON_H = 98;
const M = 80;
const W = (maxX - minX + 1) * DX + M * 2;
const H = (maxY - minY + 1) * DY + M * 2 + 40;
const cx = (x) => M + (x - minX) * DX + DX / 2;
const cy = (y) => M + (y - minY) * DY + DY / 2;

const iconCache = {};
function iconData(icon) {
  if (!/^GFX_focus_SCR_(?:corsica|switch)_/.test(icon)) return null;
  const id = icon.replace('GFX_focus_', '');
  if (!iconCache[id]) {
    const p = path.join(ROOT, 'gfx/interface/goals/SCR', id + '.png');
    iconCache[id] = 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  }
  return iconCache[id];
}

const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Microsoft YaHei,Noto Sans CJK SC,sans-serif">`);
svg.push(
  `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#a3906a"/></marker></defs>`
);
svg.push(`<rect width="${W}" height="${H}" fill="#f7f5ef"/>`);
// connections
for (const n of nodes) {
  for (const p of n.prereq) {
    const q = nodes.find((v) => v.id === p);
    svg.push(
      `<line x1="${cx(q.x)}" y1="${cy(q.y) + ICON_H / 2}" x2="${cx(n.x)}" y2="${cy(n.y) - ICON_H / 2}" stroke="#a3906a" stroke-width="2" marker-end="url(#ar)"/>`
    );
  }
}
for (const n of nodes) {
  const x = cx(n.x) - ICON_W / 2;
  const y = cy(n.y) - ICON_H / 2;
  const data = iconData(n.icon);
  if (data) {
    svg.push(`<image x="${x}" y="${y}" width="${ICON_W}" height="${ICON_H}" href="${data}"/>`);
  } else {
    svg.push(`<rect x="${x}" y="${y}" width="${ICON_W}" height="${ICON_H}" rx="4" fill="#ddd8c8" stroke="#b8ab86"/>`);
  }
  const label = names[n.id] || n.id;
  svg.push(
    `<text x="${cx(n.x)}" y="${y + ICON_H + 18}" text-anchor="middle" font-size="15" fill="#2c2a24">${label
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')}</text>`
  );
  svg.push(
    `<text x="${cx(n.x)}" y="${y + ICON_H + 33}" text-anchor="middle" font-size="11" fill="#8a8272">${n.id.replace(
      'SCR_corsica_',
      '#'
    )}</text>`
  );
}
svg.push('</svg>');

const out = path.join(
  ROOT,
  'docs',
  process.env.DX ? `SCR_科西嘉线_排版预览_间距${DX}x${DY}.png` : 'SCR_科西嘉线_排版预览.png'
);
sharp(Buffer.from(svg.join('\n')))
  .png()
  .toFile(out)
  .then(() => console.log(out + '  ' + W + 'x' + H))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
