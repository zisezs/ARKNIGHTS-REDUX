/* IBR 政治线两位领袖的头像出图器
 *   node docs/_ibr_pol_portrait.cjs            只出候选裁切与验收拼图（不写盘）
 *   node docs/_ibr_pol_portrait.cjs --write    按选定的裁切框写 gfx/leaders/IBR/*.dds
 * 规格（本 mod 实测）：large 156x210、small 65x67，未压缩 32 位 BGRA，头 128 字节抄 Carmen_Iberia.dds，
 *   offset12=height / 16=width / 20=像素总字节(w*h*4)，alpha 全 255。
 */
const fs = require('fs');
const path = require('path');
const sharp = require('E:/tmp/lud/node_modules/sharp');

const ROOT = path.resolve(__dirname, '..');
const HEAD_SRC = 'gfx/leaders/IBR/Carmen_Iberia.dds';
const OUT = 'E:/tmp/ibr_pol_portraits';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const CHAR = [
  { key: 'Irene', src: 'C:/Users/Admin/AppData/Local/Meitu/XiuXiu/WebOpenImages/艾丽妮.png',
    /* 候选小图裁切框（源图像素）：宽取 ~77%，眼位分别落在 38% / 44% / 50% 高度 */
    cands: [[40, 34, 176, 181], [28, 60, 190, 196], [46, 96, 168, 173]] },
  { key: 'Estefania', src: 'C:/Users/Admin/AppData/Local/Meitu/XiuXiu/WebOpenImages/托莱多.png',
    cands: [[30, 30, 150, 155], [22, 52, 156, 161], [38, 78, 132, 136]] },
];
const LW = 156, LH = 210, SW = 65, SH = 67;
const PICK = { Irene: 2, Estefania: 2 };   /* --write 用哪一版候选（2026-10-11 目视选定：眼位 ~45%、脸占满） */

/* RGBA 缓冲 → BGRA（alpha 强制 255） */
function toBGRA(rgba) {
  const out = Buffer.alloc(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    out[i] = rgba[i + 2]; out[i + 1] = rgba[i + 1]; out[i + 2] = rgba[i]; out[i + 3] = 255;
  }
  return out;
}
function dds(w, h, bgra) {
  const head = Buffer.from(fs.readFileSync(path.join(ROOT, HEAD_SRC)).slice(0, 128));
  head.writeUInt32LE(h, 12); head.writeUInt32LE(w, 16); head.writeUInt32LE(w * h * 4, 20);
  return Buffer.concat([head, bgra]);
}
async function raw(buf, crop, w, h) {
  let img = sharp(buf, { failOn: 'none' });
  if (crop) img = img.extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] });
  return (await img.resize(w, h, { fit: 'cover', kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer());
}

(async () => {
  const tpl = fs.readFileSync(path.join(ROOT, HEAD_SRC));
  console.log('头模板', HEAD_SRC, tpl.length, '字节');
  for (const c of CHAR) {
    const buf = fs.readFileSync(c.src);
    const meta = await sharp(buf).metadata();
    const large = toBGRA(await raw(buf, null, LW, LH));
    if (process.argv.includes('--write')) {
      const crop = c.cands[PICK[c.key]];
      const small = toBGRA(await raw(buf, crop, SW, SH));
      const dir = path.join(ROOT, 'gfx/leaders/IBR');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, c.key + '.dds'), dds(LW, LH, large));
      fs.writeFileSync(path.join(dir, c.key + '_small.dds'), dds(SW, SH, small));
      console.log(`写入 ${c.key}.dds (156x210) 与 ${c.key}_small.dds (65x67)，小图框=${crop.join(',')}`);
      /* 回读 DDS 出验收图：BGRA→RGBA 灌 sharp（sharp 读不了这种未压缩 BGRA dds） */
      const back = f => { const b = fs.readFileSync(path.join(dir, f)); const w = b.readUInt32LE(16), h = b.readUInt32LE(12);
        const px = b.slice(128); const rgba = Buffer.alloc(px.length);
        for (let i = 0; i < px.length; i += 4) { rgba[i] = px[i + 2]; rgba[i + 1] = px[i + 1]; rgba[i + 2] = px[i]; rgba[i + 3] = px[i + 3]; }
        console.log(`  ${f}: ${w}x${h} 字节 ${b.length}（应 ${128 + w * h * 4}）alpha 全 255 = ${(() => { for (let i = 3; i < px.length; i += 4) if (px[i] !== 255) return false; return true; })()}`);
        return sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).resize(w * (w === LW ? 2 : 3), h * (w === LW ? 2 : 3)).png().toBuffer(); };
      const [p1, p2] = [await back(c.key + '.dds'), await back(c.key + '_small.dds')];
      await sharp({ create: { width: LW * 2 + SW * 3 + 12, height: LH * 2, channels: 4, background: '#1b2733' } })
        .composite([{ input: p1, left: 0, top: 0 }, { input: p2, left: LW * 2 + 12, top: 0 }]).png().toFile(`${OUT}/written_${c.key}.png`);
      continue;
    }
    console.log(`${c.key}：源图 ${meta.width}x${meta.height}`);
    /* 每角色一张横排验收图：large 2x | 候选0 3x | 候选1 3x | 候选2 3x */
    const big = await sharp(large, { raw: { width: LW, height: LH, channels: 4 } }).resize(LW * 2, LH * 2).png().toBuffer();
    const parts = [big];
    for (let i = 0; i < c.cands.length; i++) {
      parts.push(await sharp(toBGRA(await raw(buf, c.cands[i], SW, SH)), { raw: { width: SW, height: SH, channels: 4 } })
        .resize(SW * 3, SH * 3).png().toBuffer());
      console.log(`  候选 ${i}: 框 [${c.cands[i].join(', ')}]`);
    }
    const GAP = 12;
    const widths = [LW * 2, SW * 3, SW * 3, SW * 3];
    const W = widths.reduce((a, b) => a + b, 0) + GAP * (parts.length - 1);
    let acc = 0; const comp = [];
    for (let i = 0; i < parts.length; i++) { comp.push({ input: parts[i], left: acc, top: 0 }); acc += widths[i] + GAP; }
    await sharp({ create: { width: W, height: LH * 2, channels: 4, background: '#1b2733' } }).composite(comp).png().toFile(`${OUT}/${c.key}.png`);
    console.log(`  验收图 -> ${OUT}/${c.key}.png`);
  }
})();
