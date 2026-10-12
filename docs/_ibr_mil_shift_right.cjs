/* 一次性：把 IBR 军事共享国策簇整体右移一格（x +1），并同步改注释里的坐标带说明。
 * 幂等护栏：只有当坐标集合正好等于移动前的那一组时才动手。 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const F = 'common/national_focus/IBR_military_shared.txt';
const p = path.join(ROOT, F);
const OLD = [-3, -2, -1, 3, 4, 5, 9, 10, 11];   /* 移动前的列带（含收尾列 -2/4/10 与乙线中轴 5） */
const NEW = OLD.map(v => v + 1);          /* 移动后：-2, 0, 4, 5, 6, 10, 12 */

const src = fs.readFileSync(p, 'utf8').replace(/\r/g, '\n');
const lines = src.split('\n');
const coord = /^\s*x = (-?\d+)\s*$/;
const found = lines.map((l, i) => [i, coord.exec(l)]).filter(x => x[1]);
console.log('坐标行', found.length, '处，取值', [...new Set(found.map(f => +f[1][1]))].sort((a, b) => a - b).join(','));

const set = [...new Set(found.map(f => +f[1][1]))].sort((a, b) => a - b).join(',');
if (set === NEW.slice().sort((a, b) => a - b).join(',')) { console.log('已经是移动后的坐标，跳过。'); process.exit(0); }
if (set !== OLD.join(',')) { console.error('坐标集合与预期不符，中止：' + set); process.exit(1); }

fs.writeFileSync(p + '.bak_shift', src, 'utf8');
for (const [i, m] of found) lines[i] = lines[i].replace(coord, (_a, v) => '	x = ' + (+v + 1));
let out = lines.join('\n');
const before = out;
out = out
  .replace('## 坐标区 x = -3..11, y = 15..21', '## 坐标区 x = -2..12, y = 15..21')
  .replace('##       三条线以陆军轴 x = 4 为中轴左右展开：甲线 -3/-1、乙线 3/5、丙线 9/11',
    '##       三条线以陆军轴 x = 5 为中轴左右展开：甲线 -2/0、乙线 4/6、丙线 10/12\n##       （2026-10-11 整簇右移一格：与政治簇 x=-5 的列之间从 Δx=2 放宽到 Δx=3）');
if (out === before) console.error('⚠ 注释里的坐标带说明没匹配上，请手改');
fs.writeFileSync(p, out, 'utf8');
console.log('已右移一格，注释同步', out === before ? '失败' : '完成', '；备份 ' + F + '.bak_shift');
