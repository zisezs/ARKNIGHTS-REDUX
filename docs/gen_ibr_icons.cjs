/*
 * 伊比利亚（IBR）图标 · 方框 + 硬核黑魂矢量风
 * ===================================================
 * 版式（国策 100x100 / 精神 60x60；几何全部写在 100 空间里，靠 viewBox + 3 倍超采样光栅化）：
 *   甲板 = 炭黑磨砂渐变 + 极淡斜纹 + 余烬飞灰 + 中心微光 + 四角暗角
 *   方框 = 黑描边 + 路线色铁框 + 内暗线 + 四角金纹拐饰与铆钉 + 顶边拱心石 + 底边中挺
 *   字面 = 按路线着色的骨白剪影 + 一处余烬橙高光
 *   铭文 = 左下拉丁缩写，右下余烬档位刻度（本路线内第几格）
 *
 * 用法：
 *   node docs/gen_ibr_icons.cjs                画样例并出对照图
 *   node docs/gen_ibr_icons.cjs --install      写进 gfx/ + 生成 .gfx 注册 + 改 icon/picture 行
 *   node docs/gen_ibr_icons.cjs --pol          只装政治簇 34 张（gfx/ + .gfx 追加 + 改 gen_ibr_political.cjs 的 icon）
 *
 * 本工程（Redux）注意：--install 会去改 docs/gen_ibr_military.cjs 与 common/ideas/IBR_ideas (Iberia).txt，
 *   这两样在本工程的路径/文件名与母模组不同，别在这里跑 --install；要出图一律用 --pol。
 */
const fs = require('fs');
const path = require('path');
const sharp = require('E:/tmp/lud/node_modules/sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT = 'E:/tmp/ibr_icons_out';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const SS = 3, MARGIN = 9, FRAME_W = 5, BLACK_W = 3.2;

/* 路线色（去饱和的黑魂盘） */
const ROUTE = {
	head: [206, 168, 96],        // 起点·终幕：余烬金
	eco: [172, 130, 72],         // 经济轴：黄铜
	pol: [108, 148, 136],        // 政治轴：铜绿
	army: [170, 88, 72],         // 陆军轴：锈红
	sea: [86, 132, 162],         // 海权轴：深海青
	abyss: [132, 106, 170],      // 海嗣战争轴：深渊紫
	mil_a: [152, 134, 112],      // 军事甲线：骨灰
	mil_b: [162, 78, 66],        // 军事乙线：血锈
	mil_c: [78, 124, 152],       // 军事丙线：洋青
	faith: [188, 156, 92],       // 审判庭/圣座：祭台金
	royal: [156, 84, 104],       // 政治簇王权线：王室紫红
};
const rgb = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
const mixc = (c, t, k) => c.map((v, i) => Math.max(0, Math.min(255, Math.round(v + (t[i] - v) * k))));
const lighten = (c, k) => mixc(c, [255, 255, 255], k);
const darken = (c, k) => mixc(c, [8, 9, 11], k);
const EMBER = '#e0762a';                     // 余烬橙（统一高光）
const GOLD = '#c9a54e';                      // 角饰金

/* ───────────────────────── 甲板 ───────────────────────── */
function plate(c) {
	const q = MARGIN - 2, sz = 100 - 2 * q, p = [];
	p.push(`<defs>
	<linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0" stop-color="${rgb(darken(c, 0.62))}"/>
		<stop offset="0.55" stop-color="${rgb(darken(c, 0.9))}"/>
		<stop offset="1" stop-color="${rgb(darken(c, 0.97))}"/></linearGradient>
	<pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
		<line x1="0" y1="0" x2="0" y2="9" stroke="${rgb(mixc(darken(c, 0.5), [255, 255, 255], 0.05))}" stroke-width="1.5"/></pattern>
	<radialGradient id="vig" cx="0.5" cy="0.44" r="0.62">
		<stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
		<stop offset="1" stop-color="#000000" stop-opacity="0.5"/></radialGradient>
	<radialGradient id="halo" cx="0.5" cy="0.42" r="0.4">
		<stop offset="0" stop-color="${rgb(lighten(c, 0.5))}" stop-opacity="0.22"/>
		<stop offset="1" stop-color="${rgb(lighten(c, 0.5))}" stop-opacity="0"/></radialGradient></defs>`);
	p.push(`<rect x="${q}" y="${q}" width="${sz}" height="${sz}" fill="url(#pg)"/>`);
	p.push(`<rect x="${q}" y="${q}" width="${sz}" height="${sz}" fill="url(#hatch)" opacity="0.45"/>`);
	p.push(`<rect x="${q}" y="${q}" width="${sz}" height="${sz}" fill="url(#halo)"/>`);
	// 飞灰：固定伪随机（不用 Math.random，保证重跑逐字节一致）
	let seed = 7;
	const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
	let ash = '';
	for (let i = 0; i < 16; i++) {
		const x = q + rnd() * sz, y = q + rnd() * sz, r = 0.5 + rnd() * 0.9;
		ash += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="${rgb(lighten(c, 0.7))}" opacity="${(0.1 + rnd() * 0.22).toFixed(2)}"/>`;
	}
	p.push(`<g>${ash}</g>`);
	p.push(`<rect x="${q}" y="${q}" width="${sz}" height="${sz}" fill="url(#vig)"/>`);
	return p;
}

/* ───────────────────────── 方框 ───────────────────────── */
function frame(c, opt) {
	const m = MARGIN, w = FRAME_W, ink = rgb(c), p = [];
	p.push(`<rect x="${m - BLACK_W / 2}" y="${m - BLACK_W / 2}" width="${100 - 2 * m + BLACK_W}" height="${100 - 2 * m + BLACK_W}" fill="none" stroke="#08090b" stroke-width="${BLACK_W}"/>`);
	p.push(`<rect x="${m}" y="${m}" width="${100 - 2 * m}" height="${100 - 2 * m}" fill="none" stroke="${ink}" stroke-width="${w}"/>`);
	p.push(`<rect x="${m + w}" y="${m + w}" width="${100 - 2 * m - 2 * w}" height="${100 - 2 * m - 2 * w}" fill="none" stroke="${rgb(darken(c, 0.55))}" stroke-width="1.7"/>`);
	p.push(`<rect x="${m + w / 2}" y="${m + w / 2}" width="${100 - 2 * m - w}" height="${100 - 2 * m - w}" fill="none" stroke="${rgb(lighten(c, 0.3))}" stroke-width="1" opacity="0.5"/>`);
	const L = 15, t = 2.4, o = m;                       // 四角金纹拐饰（L 形双线）+ 铆钉
	for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
		const x = sx > 0 ? o : 100 - o, y = sy > 0 ? o : 100 - o;
		p.push(`<path d="M${x} ${y + sy * L} V${y + sy * t / 2} H${x + sx * (L - t)}" fill="none" stroke="${GOLD}" stroke-width="${t}" opacity="0.9"/>`);
		p.push(`<path d="M${x + sx * (t + 2.6)} ${y + sy * (L - t * 2)} V${y + sy * (t + 3)} H${x + sx * (L - t * 3)}" fill="none" stroke="${GOLD}" stroke-width="1.3" opacity="0.6"/>`);
		p.push(`<circle cx="${x + sx * 4.6}" cy="${y + sy * 4.6}" r="2.3" fill="${rgb(lighten(c, 0.62))}"/>`);
		p.push(`<circle cx="${x + sx * 4.6}" cy="${y + sy * 4.6}" r="1" fill="#08090b"/>`);
	}
	const e = 50;                                       // 顶边拱心石 + 底边中挺
	if (opt.keystone !== false) {
		p.push(`<path d="M${e - 7} ${m} L${e} ${m - 4.6} L${e + 7} ${m} L${e + 5} ${m + w} L${e - 5} ${m + w} Z" fill="${GOLD}"/>`);
		p.push(`<circle cx="${e}" cy="${m - 1.4}" r="1.5" fill="${EMBER}"/>`);
	}
	if (opt.midstud !== false) p.push(`<rect x="${e - 5}" y="${100 - m - w / 2}" width="10" height="${w}" fill="${rgb(darken(c, 0.35))}" stroke="${rgb(lighten(c, 0.4))}" stroke-width="0.9"/>`);
	return p;
}

/* ───────────────────────── 字形库（100 空间，主体占 26..74） ───────────────────────── */
let INK = '#ffffff', INK2 = '#dddddd', BG = '#0c0e11';
const S = (d, w, extra) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="square" ${extra || ''}/>`;
const F = d => `<path d="${d}" fill="${INK}"/>`;
const E = d => `<path d="${d}" fill="${EMBER}"/>`;
const ES = (d, w) => `<path d="${d}" fill="none" stroke="${EMBER}" stroke-width="${w || 3}"/>`;
const C = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f || INK}"/>`;

const G = {};
/* —— 光与火 —— */
G.pharos = () => S('M40 72 V36 a10 10 0 0 1 20 0 V72', 5) + F('M41 32 h18 l-3 -7 h-12 z') +
	E('M46 25 h8 v6 h-8 z') +
	`<g stroke="${EMBER}" stroke-width="2.4" opacity="0.85">${[0, 1].map(i => `<path d="M${35 - i * 4} ${22 + i * 6} L${44 - i * 2} ${27}"/><path d="M${65 + i * 4} ${22 + i * 6} L${56 + i * 2} ${27}"/>`).join('')}</g>` +
	S('M33 74 H67', 5) + `<g stroke="${BG}" stroke-width="2.6"><path d="M40 52 h20 M40 62 h20"/></g>`;
G.lantern = () => S('M43 24 h14 M50 24 v5', 4) + F('M38 30 h24 l4 28 h-32 z') +
	`<path d="M34 58 h32 l-4 11 h-24 z" fill="${INK2}"/>` + E('M44 36 h12 v20 h-12 z') +
	`<g stroke="${INK}" stroke-width="2.6"><path d="M46 30 v28 M54 30 v28"/></g>`;
G.bonfire = () => F('M28 70 l12 -9 10 9 10 -9 12 9 z') +
	`<path d="M50 22 c9 12 13 19 8 27 c-4 7 -14 7 -16 0 c-1 -5 3 -9 -1 -14 c-5 4 -9 1 -8 -5 c2 -8 9 -9 17 -8 z" fill="${EMBER}"/>` +
	S('M32 76 H68', 4);
G.flame = () => `<path d="M50 22 c11 15 17 22 12 32 c-4 9 -19 11 -23 1 c-2 -6 4 -13 0 -19 c-6 4 -11 0 -9 -8 c3 -11 11 -6 20 -6 z" fill="${EMBER}"/>` +
	`<path d="M50 46 c4 6 6 10 3 14 c-3 4 -10 3 -10 -2 c0 -4 5 -7 7 -12 z" fill="${INK}"/>`;
G.pyre = () => S('M30 72 H70', 5) + `<g stroke="${INK}" stroke-width="4">${[0, 1, 2].map(i => `<path d="M${34 + i * 10} 72 l9 -15"/>`).join('')}</g>` +
	ES('M50 22 c8 11 11 17 6 24 c-3 5 -12 5 -13 -1 c-1 -5 4 -9 0 -13 c-4 3 -8 0 -7 -5 c2 -8 8 -6 14 -5 z', 3) + E('M47 34 h6 v7 h-6 z');
/* —— 刀剑盾甲 —— */
G.sword = () => F('M50 20 l5 9 v33 h-10 v-33 z') + S('M35 62 H65', 5) + F('M46 66 h8 v10 l-4 5 -4 -5 z') +
	`<g stroke="${BG}" stroke-width="2.4"><path d="M50 30 v28"/></g>` + E('M48 24 h4 v5 h-4 z');
G.cross_swords = () => S('M30 26 L70 68 M70 26 L30 68', 5.5) +
	`<g fill="${INK}"><path d="M26 22 l9 2 -2 9 -7 -5 z"/><path d="M74 22 l-9 2 2 9 7 -5 z"/></g>` + C(50, 47, 4.6, EMBER);
G.shield = () => F('M30 27 h40 v23 c0 14 -12 23 -20 27 c-8 -4 -20 -13 -20 -27 z') +
	`<path d="M50 33 v37 M37 47 h26" stroke="${BG}" stroke-width="3.4" fill="none"/>` + E('M46 42 h8 v9 h-8 z');
G.pike = () => S('M34 74 L61 32', 5) + F('M61 32 l-4 -13 13 10 z') +
	`<g stroke="${INK2}" stroke-width="3">${[0, 1].map(i => `<path d="M${41 + i * 6} ${62 - i * 11} l6 4"/>`).join('')}</g>`;
G.horse = () => F('M32 72 c0 -14 6 -22 16 -25 l4 -12 h7 l-3 10 c7 1 12 5 15 12 l5 -3 -2 9 c-4 8 -12 9 -18 9 z') +
	C(48, 40, 2.4, BG) + `<g stroke="${INK}" stroke-width="4"><path d="M38 72 v-8 M60 72 v-8"/></g>` + E('M30 34 l10 4 -2 5 -9 -4 z');
G.helmet = () => F('M32 54 c0 -16 8 -26 18 -26 s18 10 18 26 v6 h-36 z') +
	`<path d="M50 28 v32 M38 52 h24" stroke="${BG}" stroke-width="3" fill="none"/>` + S('M30 62 H70', 4) +
	`<g stroke="${EMBER}" stroke-width="3.4"><path d="M50 28 v-8"/></g>`;
G.fort = () => F('M28 72 V46 h7 v-7 h7 v7 h7 v-7 h7 v7 h7 v-7 h7 v7 h5 v26 z') +
	`<g stroke="${BG}" stroke-width="3"><path d="M44 72 v-13 h12 v13"/></g>` + E('M48 34 h4 v6 h-4 z');
G.mount = () => F('M24 70 l16 -26 9 11 9 -19 16 34 z') + `<g stroke="${BG}" stroke-width="2.8"><path d="M38 52 l6 7"/></g>` +
	S('M22 74 H78', 4) + E('M60 40 h4 v4 h-4 z');
/* —— 海 —— */
G.galleon = () => F('M28 60 h44 l-9 13 h-26 z') + S('M40 60 V28 M60 60 V34', 4) +
	`<g fill="${INK}"><path d="M41 30 h17 l-17 12 z"/><path d="M59 36 h-15 l15 10 z"/></g>` +
	S('M24 78 q13 -6 26 0 t26 0', 3.4) + E('M38 24 h4 v4 h-4 z');
G.flagship = () => F('M24 62 h52 l-10 13 h-32 z') + S('M38 62 V24 M52 62 V30 M64 62 V36', 3.6) +
	`<g fill="${INK}"><path d="M39 26 h15 l-15 11 z"/><path d="M53 32 h-13 l13 9 z"/><path d="M65 38 h-12 l12 8 z"/></g>` +
	F('M38 24 l-9 -6 v11 z') + S('M22 78 q14 -6 28 0 t28 0', 3.4) + E('M36 20 h4 v4 h-4 z');
G.fleet_row = () => `<g fill="${INK}">${[0, 1, 2].map(i => `<path d="M${24 + i * 17} ${40 + i * 10} h13 l-3 6 h-7 z"/>`).join('')}</g>` +
	`<g stroke="${INK}" stroke-width="3">${[0, 1, 2].map(i => `<path d="M${30 + i * 17} ${40 + i * 10} v-8"/>`).join('')}</g>` +
	ES('M22 72 q14 -6 28 0 t28 0', 2.8);
G.anchor = () => `<circle cx="50" cy="26" r="5" fill="none" stroke="${INK}" stroke-width="4"/>` +
	S('M50 31 V68', 5) + S('M34 50 a16 16 0 0 0 32 0', 5) +
	F('M29 48 l9 -7 v11 z M71 48 l-9 -7 v11 z') + S('M40 38 H60', 4) + E('M48 62 h4 v5 h-4 z');
G.waves = () => `<g stroke="${INK}" stroke-width="4.6" fill="none">${[0, 1, 2].map(i => `<path d="M24 ${40 + i * 12} q9 -8 18 0 t18 0 t18 0"/>`).join('')}</g>` +
	`<g stroke="${EMBER}" stroke-width="3" fill="none"><path d="M38 30 q7 -7 14 0"/></g>`;
G.tentacle = () => S('M34 76 c0 -24 8 -36 20 -42 c9 -4 15 1 12 9 c-3 8 -12 8 -13 1', 5.5) +
	`<g fill="${INK2}">${[0, 1, 2, 3].map(i => `<circle cx="${37 + i * 4}" cy="${67 - i * 11}" r="2.3"/>`).join('')}</g>` +
	C(57, 30, 3.6, EMBER);
G.sonar = () => `<g fill="none" stroke="${INK}" stroke-width="4">${[10, 19, 28].map(r => `<path d="M50 ${62 - r} a${r} ${r} 0 0 1 ${r * 2} ${r}"/>`).join('')}</g>` +
	F('M46 62 h8 v10 h-8 z') + C(50, 34, 4, EMBER);
G.compass = () => `<circle cx="50" cy="48" r="21" fill="none" stroke="${INK}" stroke-width="4.6"/>` +
	F('M50 31 l6 21 -6 -5 -6 5 z') + S('M50 21 v5 M50 75 v-5 M23 48 h5 M72 48 h-5', 3.6) + E('M48 44 h4 v4 h-4 z');
G.chart = () => F('M28 30 h44 v40 h-44 z') + `<g stroke="${BG}" stroke-width="2.8">${[0, 1, 2].map(i => `<path d="M34 ${40 + i * 9} h24"/>`).join('')}</g>` +
	ES('M38 62 q11 -14 24 -6', 3) + `<g stroke="${INK2}" stroke-width="2.6"><path d="M28 30 h44"/></g>`;
G.dock = () => S('M30 72 H72', 5) + F('M40 72 v-30 l22 -8 v8 l-14 5 v25 z') +
	S('M54 44 V60', 3.6) + C(54, 63, 3.2, INK2) + `<g stroke="${INK}" stroke-width="4"><path d="M36 72 v9 M66 72 v9"/></g>` + E('M62 32 h4 v3 h-4 z');
G.knot = () => `<g fill="none" stroke="${INK}" stroke-width="5"><path d="M40 36 c-14 8 -8 26 8 22 c10 -3 14 -12 6 -18"/><path d="M60 36 c14 8 8 26 -8 22 c-10 -3 -14 -12 -6 -18"/></g>` +
	S('M34 72 l8 -10 M66 72 l-8 -10', 4) + E('M47 45 h6 v6 h-6 z');
/* —— 工与商 —— */
G.factory = () => S('M28 70 V46 l11 8 11 -8 11 8 11 -8 V70', 5) + S('M28 70 H72', 5) +
	F('M61 26 h7 v14 h-7 z') + `<g stroke="${EMBER}" stroke-width="2.6" fill="none"><path d="M64.5 24 q4 -3 0 -7"/></g>`;
G.gear = () => `<g fill="${INK}">${Array.from({ length: 8 }, (_, i) => `<rect x="-3.6" y="-23" width="7.2" height="7.5" transform="translate(50 48) rotate(${i * 45})"/>`).join('')}</g>` +
	`<circle cx="50" cy="48" r="16" fill="none" stroke="${INK}" stroke-width="5.6"/><circle cx="50" cy="48" r="4.6" fill="${BG}"/>` +
	`<path d="M50 32 v6" stroke="${EMBER}" stroke-width="3"/>`;
G.anvil = () => F('M28 38 h36 c7 0 7 9 0 9 h-7 v11 h11 v7 h-32 v-7 h9 v-11 h-17 z') +
	S('M40 72 H62', 4) + E('M52 33 h7 v4 h-7 z');
G.coin = () => `<circle cx="50" cy="48" r="20" fill="none" stroke="${INK}" stroke-width="5"/>` +
	`<circle cx="50" cy="48" r="13" fill="none" stroke="${INK2}" stroke-width="2.6"/>` + F('M47 38 h6 v20 h-6 z M43 44 h14 v5 h-14 z') +
	E('M50 29 l3 4 -6 0 z');
G.barrel = () => `<ellipse cx="50" cy="50" rx="18" ry="22" fill="none" stroke="${INK}" stroke-width="5"/>` +
	`<g stroke="${INK}" stroke-width="3.4">${[0, 1].map(i => `<path d="M32 ${40 + i * 20} h36"/>`).join('')}</g>` +
	S('M44 29 v42 M56 29 v42', 3) + E('M48 46 h4 v8 h-4 z');
G.wheat = () => S('M50 74 V34', 4.4) + `<g fill="${INK}">${[0, 1, 2, 3].map(i =>
	`<ellipse cx="43" cy="${38 + i * 8}" rx="3.6" ry="6.4" transform="rotate(-28 43 ${38 + i * 8})"/><ellipse cx="57" cy="${38 + i * 8}" rx="3.6" ry="6.4" transform="rotate(28 57 ${38 + i * 8})"/>`).join('')}</g>` +
	`<circle cx="50" cy="30" r="3" fill="${EMBER}"/>`;
G.salt = () => F('M50 24 L68 44 L50 74 L32 44 Z') + `<g stroke="${BG}" stroke-width="2.6" fill="none"><path d="M50 24 V74 M32 44 H68"/></g>` +
	E('M47 41 h6 v6 h-6 z');
G.crystal = () => F('M50 22 L66 44 L50 76 L34 44 Z') + `<g stroke="${BG}" stroke-width="2.6" fill="none"><path d="M50 22 V76 M34 44 H66"/></g>` +
	ES('M50 30 L60 44', 3);
G.pick = () => S('M40 74 L60 26', 5) + F('M50 32 c10 -8 20 -6 22 -2 c-8 -2 -14 2 -18 8 z') +
	F('M50 32 c-10 -8 -20 -6 -22 -2 c8 -2 14 2 18 8 z') + E('M58 22 h4 v4 h-4 z');
G.engine = () => `<rect x="30" y="40" width="40" height="26" fill="none" stroke="${INK}" stroke-width="5"/>` +
	`<g stroke="${INK}" stroke-width="4">${[0, 1, 2].map(i => `<path d="M38 40 V28 M50 40 V28 M62 40 V28"/>`).join('')}</g>` +
	S('M34 28 H66', 4) + `<g stroke="${EMBER}" stroke-width="3"><path d="M50 66 v9"/></g>` + C(50, 78, 2.8, INK2);
G.crutch = () => S('M42 34 v38', 5) + S('M42 34 a9 9 0 0 1 17 2', 5) + S('M32 48 h20', 4.6) +
	F('M50 70 h16 v5 h-16 z') + `<g stroke="${EMBER}" stroke-width="3"><path d="M60 40 h9"/></g>`;
/* —— 文与政 —— */
G.ledger = () => F('M32 26 h36 v48 h-36 z') + `<g stroke="${BG}" stroke-width="3">${[0, 1, 2, 3].map(i => `<path d="M38 ${36 + i * 10} h22"/>`).join('')}</g>` +
	S('M32 26 v48', 5) + `<g stroke="${EMBER}" stroke-width="3">${[0, 1].map(i => `<path d="M30 ${32 + i * 12} h-6"/>`).join('')}</g>`;
G.scroll = () => S('M34 30 h32 v40 h-32 z', 4.6) + `<g stroke="${INK}" stroke-width="3">${[0, 1, 2].map(i =>
	`<path d="M40 ${40 + i * 8} h20"/>`).join('')}</g>` +
	`<path d="M34 30 a6 6 0 0 0 0 12 M66 70 a6 6 0 0 1 0 -12" fill="none" stroke="${INK}" stroke-width="4"/>` + E('M60 34 h5 v5 h-5 z');
G.book = () => F('M30 30 h40 v42 h-40 z') + S('M50 30 V72', 3.6) + `<g stroke="${BG}" stroke-width="2.8">${[0, 1].map(i =>
	`<path d="M36 ${40 + i * 12} h10"/><path d="M54 ${40 + i * 12} h10"/>`).join('')}</g>` + E('M48 24 h4 v6 h-4 z');
G.quill = () => S('M34 72 L64 26', 4.4) + F('M56 20 c12 2 16 10 12 18 c-6 10 -18 8 -22 0 c-2 -6 4 -14 10 -18 z') +
	S('M30 76 l6 -6', 3.6) + E('M40 62 l4 4');
G.press = () => S('M30 68 H70', 5) + F('M36 44 h28 v16 h-28 z') + S('M50 44 V26', 5) +
	S('M40 26 H60', 5) + `<g stroke="${EMBER}" stroke-width="3"><path d="M44 52 h12"/></g>`;
G.law = () => S('M50 24 V70', 5) + S('M30 34 H70', 4.6) + `<g stroke="${INK}" stroke-width="3.6">${[0, 1].map(i =>
	`<path d="M${34 + i * 32} 34 l-6 14 h12 z"/>`).join('')}</g>` + F('M42 70 h16 v4 h-16 z') + E('M50 21 l3 4 -6 0 z');
G.crown = () => F('M30 60 L34 34 L42 48 L50 30 L58 48 L66 34 L70 60 Z') + S('M30 66 H70', 5) +
	C(50, 27, 3, EMBER) + `<g fill="${EMBER}">${[0, 1, 2].map(i => `<circle cx="${38 + i * 12}" cy="56" r="2.2"/>`).join('')}</g>`;
G.mitre = () => F('M36 60 c0 -22 6 -34 14 -34 s14 12 14 34 z') + S('M32 62 h36', 5) +
	S('M50 30 V56 M42 42 h16', 3.4) + E('M48 24 h4 v4 h-4 z') + `<g stroke="${INK2}" stroke-width="3">${[0, 1, 2].map(i => `<path d="M${40 + i * 10} 68 v7"/>`).join('')}</g>`;
G.banner = () => S('M34 22 V76', 5) + F('M36 26 h30 l-8 11 8 11 h-30 z') + `<g stroke="${BG}" stroke-width="3"><path d="M44 37 h12"/></g>` + E('M50 30 h3 v3 h-3 z');
G.eyes_open = () => `<g fill="none" stroke="${INK}" stroke-width="4.4">${[0, 1].map(i =>
	`<path d="M${28 + i * 26} 48 q11 -13 22 0 q-11 13 -22 0 z"/>`).join('')}</g>` +
	`<g fill="${INK}">${[0, 1].map(i => `<circle cx="${39 + i * 26}" cy="48" r="4"/>`).join('')}</g>` + E('M38 46 h2 v2 h-2 z');
G.tablet = () => F('M32 26 h36 v46 h-36 z') + `<g stroke="${BG}" stroke-width="3">${[0, 1, 2, 3].map(i => `<path d="M38 ${36 + i * 9} h24"/>`).join('')}</g>` +
	E('M46 22 h8 v4 h-8 z');
G.seal = () => `<path d="M50 24 l8 6 10 -1 3 10 6 9 -6 9 -3 10 -10 -1 -8 6 -8 -6 -10 1 -3 -10 -6 -9 6 -9 3 -10 10 1 z" fill="${INK}"/>` +
	`<circle cx="50" cy="49" r="9" fill="${BG}"/>` + E('M47 46 h6 v7 h-6 z');
/* —— 纪念 · 终局 —— */
G.skull = () => F('M32 42 c0 -14 8 -22 18 -22 s18 8 18 22 c0 8 -4 12 -4 18 h-28 c0 -6 -4 -10 -4 -18 z') +
	C(42, 44, 5, BG) + C(58, 44, 5, BG) + `<g fill="${BG}">${[0, 1, 2].map(i => `<rect x="${42 + i * 5}" y="58" width="3" height="10"/>`).join('')}</g>` +
	ES('M50 20 v-6', 3);
G.medal = () => `<g fill="${INK2}"><path d="M36 24 h10 l6 22 h-10 z M54 24 h10 l-6 22 h-10 z"/></g>` +
	`<circle cx="50" cy="58" r="14" fill="none" stroke="${INK}" stroke-width="4.6"/>` + E('M50 52 l4 6 -4 6 -4 -6 z');
G.hourglass = () => S('M32 26 H68 M32 74 H68', 5) + F('M38 30 h24 l-12 18 12 18 h-24 l12 -18 z') +
	`<g stroke="${BG}" stroke-width="2.6"><path d="M44 62 h12"/></g>` + E('M48 46 h4 v4 h-4 z');
G.key = () => `<circle cx="38" cy="40" r="10" fill="none" stroke="${INK}" stroke-width="4.6"/>` +
	S('M46 47 L68 70', 5) + `<g stroke="${INK}" stroke-width="4">${[0, 1].map(i => `<path d="M${59 + i * 6} ${61 + i * 6} l4 -4"/>`).join('')}</g>` + E('M36 38 h4 v4 h-4 z');
G.chain = () => `<g fill="none" stroke="${INK}" stroke-width="4.4">${[0, 1, 2].map(i =>
	`<ellipse cx="${38 + i * 12}" cy="${40 + i * 8}" rx="7" ry="10" transform="rotate(${i % 2 ? 26 : -26} ${38 + i * 12} ${40 + i * 8})"/>`).join('')}</g>` +
	`<path d="M62 66 l6 6" stroke="${EMBER}" stroke-width="4"/>`;
G.hands = () => F('M28 56 c8 -12 16 -14 22 -8 c6 -6 14 -4 22 8 c-6 12 -16 18 -22 16 c-6 2 -16 -4 -22 -16 z') +
	`<g stroke="${BG}" stroke-width="2.8">${[0, 1, 2].map(i => `<path d="M${40 + i * 8} 48 v14"/>`).join('')}</g>` + E('M48 42 h4 v4 h-4 z');
G.sun = () => `<circle cx="50" cy="46" r="14" fill="none" stroke="${INK}" stroke-width="4.6"/>` +
	`<circle cx="50" cy="46" r="7" fill="${EMBER}"/>` + `<g stroke="${INK}" stroke-width="3.6">${[0, 45, 90, 135, 180, 225, 270, 315].map(a =>
	`<path d="M50 26 v-6" transform="rotate(${a} 50 46)"/>`).join('')}</g>` + S('M28 72 H72', 4.6);
G.torch_road = () => S('M30 76 L66 32', 4.6) + F('M62 20 c9 6 11 15 4 21 c-7 5 -13 0 -11 -8 c1 -5 4 -9 7 -13 z') +
	E('M58 24 h5 v5 h-5 z') + `<g stroke="${INK2}" stroke-width="3">${[0, 1].map(i => `<path d="M${34 + i * 11} ${76 - i * 4} l4 -6"/>`).join('')}</g>`;
G.cannon = () => F('M28 74 h44 v-9 h-44 z') + `<g stroke="${BG}" stroke-width="3">${[0, 1, 2].map(i => `<path d="M${34 + i * 12} 74 v-9"/>`).join('')}</g>` +
	F('M36 62 l22 -22 9 9 -22 22 z') + `<circle cx="40" cy="62" r="5" fill="${INK}"/>` +
	ES('M64 36 l8 -8 M60 32 l6 -6 M68 40 l8 -6', 3) + E('M66 34 h5 v5 h-5 z');
G.cannon_row = () => `<g stroke="${INK}" stroke-width="4.4">${[0, 1, 2].map(i => `<path d="M${32 + i * 13} 68 v-16"/>`).join('')}</g>` +
	F('M28 70 h44 v6 h-44 z') + `<g stroke="${EMBER}" stroke-width="3">${[0, 1, 2].map(i => `<path d="M${32 + i * 13} 50 l4 -6"/>`).join('')}</g>`;
G.torpedo = () => `<ellipse cx="50" cy="48" rx="22" ry="8" transform="rotate(-18 50 48)" fill="none" stroke="${INK}" stroke-width="4.6"/>` +
	F('M68 34 l9 -2 -2 11 z') + `<g stroke="${EMBER}" stroke-width="3">${[0, 1].map(i => `<path d="M28 ${58 + i * 7} q7 4 13 2"/>`).join('')}</g>`;
G.horus_eye = () => S('M28 50 q22 -22 44 0', 5) + C(50, 50, 7, INK) + S('M42 60 l-8 13 M58 60 q11 9 -2 15', 4) + ES('M32 42 q7 -7 14 -4', 3);
G.arch = () => S('M32 74 V46 a18 18 0 0 1 36 0 V74', 5) + `<g stroke="${BG}" stroke-width="3">${[0, 1, 2].map(i =>
	`<path d="M${38 + i * 8} 74 v-${10 + (i % 2) * 6}"/>`).join('')}</g>` + E('M47 40 h6 v7 h-6 z');
G.gate = () => S('M30 72 V36 h40 v36', 5) + `<path d="M38 72 V46 a12 12 0 0 1 24 0 v26 z" fill="${INK2}"/>` +
	S('M50 46 v26', 3.4) + E('M50 40 h3 v4 h-3 z');
G.urn = () => F('M38 34 h24 l-3 8 h-18 z') + `<path d="M36 42 h28 c0 16 -6 26 -14 26 s-14 -10 -14 -26 z" fill="${INK}"/>` +
	S('M32 74 H68', 4.6) + E('M47 48 h6 v10 h-6 z');
G.scales = () => S('M50 26 V64', 5) + S('M30 34 H70', 4.6) + `<g stroke="${INK}" stroke-width="3.4">${[0, 1].map(i =>
	`<path d="M${32 + i * 36} 34 l-6 13 h12 z"/>`).join('')}</g>` + F('M40 66 h20 v5 h-20 z') + E('M48 22 h4 v4 h-4 z');
G.plow = () => S('M26 68 H74', 4.6) + F('M40 66 l-6 -20 h11 l4 20 z') + S('M46 46 L66 28', 4.4) +
	`<g stroke="${EMBER}" stroke-width="3">${[0, 1].map(i => `<path d="M${52 + i * 8} 60 q6 -5 12 -3"/>`).join('')}</g>`;
G.fishing = () => S('M30 66 q10 -24 24 -28', 4.4) + F('M54 38 l10 -4 -3 11 z') +
	`<g stroke="${INK}" stroke-width="3.4"><path d="M64 34 q9 9 -2 15"/></g>` + S('M24 74 q13 -6 26 0 t26 0', 3.2) + E('M44 30 h3 v3 h-3 z');
G.map_room = () => `<rect x="26" y="28" width="48" height="34" fill="none" stroke="${INK}" stroke-width="4.6"/>` +
	`<g stroke="${INK2}" stroke-width="2.8">${[0, 1, 2].map(i => `<path d="M32 ${38 + i * 8} h36"/>`).join('')}</g>` +
	S('M50 62 V74 M38 74 H62', 4) + E('M58 42 h5 v5 h-5 z');
G.stockpile = () => `<g fill="${INK}">${[0, 1, 2].map(i => `<circle cx="${36 + i * 12}" cy="60" r="6"/>`).join('')}</g>` +
	`<g fill="${INK}"><circle cx="42" cy="48" r="6"/><circle cx="54" cy="48" r="6"/></g><circle cx="48" cy="37" r="6" fill="${INK}"/>` +
	E('M62 30 h5 v5 h-5 z');
G.wharf = () => S('M26 70 H74', 5) + `<g stroke="${INK}" stroke-width="4">${[0, 1, 2].map(i => `<path d="M${34 + i * 14} 70 v-14"/>`).join('')}</g>` +
	S('M30 56 h34', 4) + F('M62 40 h8 v16 h-8 z') + E('M34 46 h6 v6 h-6 z');
G.lens = () => `<circle cx="44" cy="42" r="15" fill="none" stroke="${INK}" stroke-width="5"/>` + S('M56 54 L72 70', 7) +
	`<g stroke="${EMBER}" stroke-width="3"><path d="M37 42 h14"/></g>`;
G.sextant = () => `<path d="M50 24 a26 26 0 0 1 0 46" fill="none" stroke="${INK}" stroke-width="5"/>` +
	S('M50 24 V70', 4) + S('M34 47 H64', 4) + C(58, 38, 3.6, EMBER) + `<g stroke="${INK2}" stroke-width="3"><path d="M40 60 l12 -12"/></g>`;
G.tomb = () => S('M34 72 V44 a16 16 0 0 1 32 0 V72', 5) + `<g stroke="${BG}" stroke-width="3">${[0, 1].map(i =>
	`<path d="M42 ${52 + i * 12} h16"/>`).join('')}</g>` + S('M28 74 H72', 4.6) + E('M48 40 h4 v6 h-4 z');
G.bell = () => F('M36 56 c0 -18 6 -26 14 -26 s14 8 14 26 z') + S('M32 58 h36', 5) +
	F('M46 62 h8 l2 8 h-12 z') + `<g stroke="${EMBER}" stroke-width="3"><path d="M50 26 v-6"/></g>` + C(50, 74, 2.6, INK2);
G.brick_wall = () => `<g fill="none" stroke="${INK}" stroke-width="4">${[0, 1, 2].map(r =>
	`<path d="M28 ${36 + r * 13} h44"/><path d="M28 ${49 + r * 13} h44"/>`).join('')}</g>` +
	`<g stroke="${INK}" stroke-width="4"><path d="M42 36 v13 M58 36 v13 M35 49 v13 M50 49 v13 M65 49 v13 M42 62 v13 M58 62 v13"/></g>` + E('M48 30 h4 v4 h-4 z');
G.spire = () => F('M30 72 V50 h9 v22 z M39 72 V34 h12 v38 z M51 72 V44 h9 v28 z M60 72 V56 h10 v16 z') +
	S('M45 34 v-9', 3.4) + C(45, 22, 2.6, EMBER) + `<g stroke="${BG}" stroke-width="2.4"><path d="M43 44 h4 M43 54 h4"/></g>`;
G.globe = () => `<circle cx="50" cy="48" r="20" fill="none" stroke="${INK}" stroke-width="4.6"/>` +
	`<ellipse cx="50" cy="48" rx="9" ry="20" fill="none" stroke="${INK}" stroke-width="3"/>` + S('M30 48 H70', 3.4) +
	`<g stroke="${EMBER}" stroke-width="3"><path d="M62 26 l6 -6"/></g>`;
/* —— 样例返工补的六个（马蹄铁 / 双拐 / 编制格 / 龙骨肋 / 救生环 / 海蛇） —— */
G.horseshoe = () => `<path d="M32 72 v-16 a18 18 0 0 1 36 0 v16" fill="none" stroke="${INK}" stroke-width="8"/>` +
	`<g fill="${BG}">${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${34 + (i % 3) * 13}" cy="${i < 3 ? 40 : 62}" r="2"/>`).join('')}</g>` +
	E('M47 26 h6 v5 h-6 z');
G.crutches = () => S('M33 28 h14 M43 28 l-4 46', 5) + S('M67 28 h-14 M57 28 l4 46', 5) +
	S('M34 74 H66', 4.6) + `<g stroke="${INK2}" stroke-width="3">${[0, 1].map(i => `<path d="M${40 + i * 16} 46 h4"/>`).join('')}</g>` + E('M48 34 h4 v4 h-4 z');
G.cohort = () => `<rect x="28" y="30" width="44" height="38" fill="none" stroke="${INK}" stroke-width="4.6"/>` +
	`<g fill="${INK}">${[0, 1, 2].map(r => [0, 1, 2].map(c => `<circle cx="${38 + c * 12}" cy="${40 + r * 11}" r="3.4"/>`).join('')).join('')}</g>` +
	S('M34 74 H66', 4) + E('M48 47 h5 v5 h-5 z');
G.keel = () => `<path d="M24 38 q26 44 52 0" fill="none" stroke="${INK}" stroke-width="5.6"/>` +
	`<g stroke="${INK}" stroke-width="4">${[0, 1, 2, 3].map(i => `<path d="M${33 + i * 11} ${44 + (i === 1 || i === 2 ? 6 : 0)} v${14 - (i === 1 || i === 2 ? 6 : 0)}"/>`).join('')}</g>` +
	S('M22 34 H78', 4.6) + E('M26 28 h5 v5 h-5 z');
G.buoy = () => `<circle cx="50" cy="46" r="18" fill="none" stroke="${INK}" stroke-width="8"/>` +
	`<g stroke="${BG}" stroke-width="4">${[0, 1, 2, 3].map(i => `<path d="M50 46 m0 -22 l0 8" transform="rotate(${i * 90} 50 46)"/>`).join('')}</g>` +
	S('M58 62 q10 6 4 12', 3.6) + E('M47 25 h6 v5 h-6 z');
G.spiral = () => `<path d="M50 48 a5 5 0 1 1 -5 5 a11 11 0 1 0 11 -11 a17 17 0 1 0 -17 17" fill="none" stroke="${INK}" stroke-width="5"/>` + S('M50 24 v-7 M44 17 h12', 4) + E('M47 45 h6 v6 h-6 z');
G.serpent = () => `<g fill="none" stroke="${INK}" stroke-width="5.6"><path d="M22 60 q8 -15 16 0 t16 0"/></g>` +
	F('M54 52 c4 -12 14 -14 18 -6 l-6 4 2 6 -10 4 z') + C(66, 44, 2, BG) +
	S('M24 72 q13 -6 26 0 t26 0', 3.4) + ES('M60 34 l6 -6', 3);

/* ───────────────────────── 渲染 ───────────────────────── */
async function render(rec, N) {
	const c = ROUTE[rec.route] || ROUTE.head;
	const parts = plate(c).concat(frame(c, rec.frame || {}));
	INK = rgb(lighten(c, 0.72)); INK2 = rgb(lighten(c, 0.36)); BG = rgb(darken(c, 0.9));
	const glyph = (G[rec.glyph] || G.gear)();
	const top = rec.code ? 41 : 47;
	parts.push(`<g transform="translate(50 ${top}) scale(${rec.code ? 0.79 : 0.86}) translate(-50 -48)">${glyph}</g>`);
	if (rec.code) parts.push(`<text x="${MARGIN + 3.6}" y="79.5" font-family="Trajan Pro, Georgia, serif" font-size="9.4" fill="${rgb(lighten(c, 0.55))}" letter-spacing="0.6" opacity="0.95">${rec.code}</text>`);
	for (let i = 0; i < Math.min(rec.seq || 0, 9); i++) {
		parts.push(`<rect x="${100 - MARGIN - 2.2 - i * 2.4}" y="74" width="1.7" height="6" fill="${i === 0 ? EMBER : rgb(lighten(c, 0.5))}"/>`);
	}
	const B = 100 * SS;
	return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${B}" viewBox="0 0 100 100">${parts.join('')}</svg>`))
		.resize(N, N, { kernel: 'lanczos3' }).png().toBuffer();
}

async function grid(items, cols, scale, gap) {
	const rows = Math.ceil(items.length / cols);
	const W = cols * 100 * scale + gap * (cols + 1), H = rows * 100 * scale + gap * (rows + 1);
	const comp = [];
	for (let i = 0; i < items.length; i++) {
		comp.push({ input: await sharp(items[i]).resize(100 * scale, 100 * scale, { kernel: 'lanczos3' }).png().toBuffer(), left: gap + (i % cols) * (100 * scale + gap), top: gap + Math.floor(i / cols) * (100 * scale + gap) });
	}
	return sharp({ create: { id: 'bg', width: W, height: H, channels: 4, background: '#1a1d21' } }).composite(comp).png().toBuffer();
}


/* ───────────────────────── 全量数据（读 docs/ibr_icon_data.cjs） ───────────────────────── */
const DATA = require('./ibr_icon_data.cjs');

/* 主树补的四个母题 */
G.sheaf = () => S('M50 74 V40', 4.4) + `<g fill="${INK}">${[0, 1, 2, 3].map(i =>
	`<ellipse cx="${40 + i * 6.6}" cy="${44 + (i % 2) * 3}" rx="3.4" ry="7" transform="rotate(${-24 + i * 16} ${40 + i * 6.6} 44)"/>`).join('')}</g>` +
	S('M36 62 q14 8 28 0', 4.6) + E('M47 60 h6 v5 h-6 z');
G.bolt = () => F('M56 22 L34 54 h12 l-6 24 24 -34 h-13 z') + ES('M64 26 l6 -6 M66 40 h8', 3) + E('M46 44 h5 v5 h-5 z');
G.broken_staff = () => S('M44 22 v20 M50 22 h-12 M50 22 v14', 4.6) + S('M56 52 v22 M50 74 h14', 4.6) +
	`<g stroke="${EMBER}" stroke-width="3.4"><path d="M40 46 l8 4 M60 44 l-8 6"/></g>` + F('M46 44 l10 6 -4 6 -10 -6 z');
G.scythe = () => `<path d="M28 30 q26 -8 34 16" fill="none" stroke="${INK}" stroke-width="5.6"/>` +
	S('M40 74 L60 34', 5) + `<g stroke="${INK2}" stroke-width="3">${[0, 1].map(i => `<path d="M${42 + i * 8} ${64 - i * 12} l6 3"/>`).join('')}</g>` + E('M30 26 h5 v5 h-5 z');

/* 解析主树每格的绝对坐标 → 轴带色 */
function resolveMainRoutes() {
	const t = fs.readFileSync(path.join(ROOT, 'common/national_focus/IBR.txt'), 'latin1').replace(/\r/g, '');
	const rel = {};
	for (const b of t.split(/\bfocus = \{/).slice(1)) {
		const id = (b.match(/id = (IBR_\w+)/) || [])[1]; if (!id) continue;
		rel[id] = {
			x: +(b.match(/^\s*x = (-?\d+)/m) || [0, 0])[1], y: +(b.match(/^\s*y = (-?\d+)/m) || [0, 0])[1],
			rp: (b.match(/relative_position_id = (\w+)/) || [])[1],
		};
	}
	const memo = {};
	const abs = (id, d) => {
		if (memo[id]) return memo[id];
		const n = rel[id]; if (!n) return [0, 0];
		const p = n.rp ? abs(n.rp, d + 1) : [0, 0];
		memo[id] = [p[0] + n.x, p[1] + n.y]; return memo[id];
	};
	const band = x => (x <= -9 ? 'eco' : x <= -1 ? 'pol' : x <= 7 ? 'army' : x <= 15 ? 'sea' : 'abyss');
	const out = {};
	for (const id of Object.keys(rel)) { const a = abs(id, 0); out[id] = id === 'IBR_crossroads' ? 'head' : band(a[0]); }
	return out;
}

function buildRows() {
	const routes = resolveMainRoutes();
	const rows = [];
	for (const [id, g] of Object.entries(DATA.MAIN)) rows.push({ id, kind: 'focus', route: routes[id] || 'head', glyph: g[0], code: g[1], seq: g[2] });
	for (const [id, g] of Object.entries(DATA.MIL)) rows.push({ id, kind: 'focus', route: DATA.MIL_ROUTE(id), glyph: g[0], code: g[1], seq: g[2] });
	for (const [id, g] of Object.entries(DATA.POL || {})) rows.push({ id, kind: 'focus', route: DATA.POL_ROUTE(id), glyph: g[0], code: g[1], seq: g[2] });
	for (const [id, g] of Object.entries(DATA.POL_SPIRIT || {})) rows.push({ id, kind: 'spirit', route: (DATA.POL_SPIRIT_ROUTE || {})[id] || 'pol', glyph: g[0], code: '', seq: g[1] });
	for (const [id, g] of Object.entries(DATA.SPIRIT)) rows.push({ id, kind: 'spirit', route: DATA.spiritRoute(id), glyph: g[0], code: '', seq: g[1] });
	return rows;
}

/* ───────────────────────── 安装：备份 → 出图 → 注册 → 改引用 ───────────────────────── */
const BAK = path.join(ROOT, 'docs/IBR_图标备份');
const GOAL_DIR = 'gfx/interface/goals/IBR';
const IDEA_DIR = 'gfx/interface/ideas/IBR';
const CRLF = '\r\n';
const eolOf = t => (t.includes('\r\n') ? '\r\n' : '\n');      // 行尾照抄原文件

function backup(files) {
	if (!fs.existsSync(BAK)) fs.mkdirSync(BAK, { recursive: true });
	for (const rel of files) {
		const src = path.join(ROOT, rel);
		if (!fs.existsSync(src)) continue;
		const dst = path.join(BAK, rel.replace(/[\\/]/g, '__'));
		if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
	}
	return files.length;
}

function writeFileRel(rel, buf) {
	const p = path.join(ROOT, rel);
	fs.mkdirSync(path.dirname(p), { recursive: true });
	fs.writeFileSync(p, buf);
}

/* 主树：把每个 focus 块里的 icon = X 换成 GFX_focus_<id> */
function retargetFocusIcons(text, ids) {
	let n = 0;
	for (const id of ids) {
		const re = new RegExp('(id = ' + id + '\\s*\\r?\\n\\s*icon = )\\w+');
		if (re.test(text)) { text = text.replace(re, '$1GFX_focus_' + id); n++; }
		else console.log('  ! 未找到 icon 行：' + id);
	}
	return { text, n };
}

/* ideas：每个精神块内 picture = 本 id（没有就插一行） */
function retargetIdeaPictures(text, ids) {
	let set = 0, added = 0;
	const EOL = eolOf(text);
	for (const id of ids) {
		const open = '\t\t' + id + ' = {';
		const i = text.indexOf(open);
		if (i < 0) { console.log('  ! ideas 里找不到块：' + id); continue; }
		const end = text.indexOf('\n\t\t}', i);
		const block = text.slice(i, end);
		if (/\r?\n\s*picture = \w+/.test(block)) {
			const nb = block.replace(/(\r?\n\s*picture = )\w+/, '$1' + id);
			text = text.slice(0, i) + nb + text.slice(end); set++;
		} else {
			const nb = open + EOL + '\t\t\tpicture = ' + id + block.slice(open.length);
			text = text.slice(0, i) + nb + text.slice(end); added++;
		}
	}
	return { text, set, added };
}

/* ───────────────────────── 政治簇通道：只出 IBR_pol_*，别的一律不碰 ───────────────────────── */
const POL_GEN = 'docs/gen_ibr_political.cjs';
const ATLAS = 'interface/_ARF_goals/IBR_goals.gfx';
const IDEAS_ATLAS = 'interface/ideas/IBR_ideas.gfx';

async function installPol() {
	const all = buildRows();
	const rows = all.filter(r => (DATA.POL && DATA.POL[r.id]) || (DATA.POL_SPIRIT && DATA.POL_SPIRIT[r.id]));
	const focusRows = rows.filter(r => r.kind === 'focus'), spiritRows = rows.filter(r => r.kind === 'spirit');
	if (focusRows.length !== Object.keys(DATA.POL || {}).length || spiritRows.length !== Object.keys(DATA.POL_SPIRIT || {}).length)
		throw new Error(`表 ${Object.keys(DATA.POL || {}).length}+${Object.keys(DATA.POL_SPIRIT || {}).length} 条、可渲染 ${focusRows.length}+${spiritRows.length} 条，字形名对不上，中止`);
	backup([ATLAS, IDEAS_ATLAS, POL_GEN]);
	const bufs = {};
	for (const r of rows) bufs[r.id] = await render(r, r.kind === 'spirit' ? 60 : 100);
	for (const r of focusRows) writeFileRel(GOAL_DIR + '/' + r.id + '.png', bufs[r.id]);
	for (const r of spiritRows) writeFileRel(IDEA_DIR + '/' + r.id + '.png', bufs[r.id]);

	/* 图集同步：先清掉表里已不存在的帧（改名后不留孤儿），再补缺的 */
	const keep = new Set(rows.map(r => r.id));
	const syncAtlas = (file, kind, dir, list, orphanRe) => {
		let txt = fs.readFileSync(path.join(ROOT, file), 'utf8');
		const EOL = eolOf(txt); const dropped = [];
		if (orphanRe) txt = txt.replace(/\n*\tSpriteType = \{[^}]*name = "GFX_[a-z]+_([A-Za-z0-9_]+)"[^}]*\}/g,
			(whole, id) => { if (!orphanRe.test(id) || keep.has(id)) return whole; dropped.push(id); return ''; });
		const add = [];
		for (const r of list) if (!txt.includes('name = "GFX_' + kind + '_' + r.id + '"'))
			add.push(`\tSpriteType = { ${EOL}\t\tname = "GFX_${kind}_${r.id}"${EOL}\t\ttexturefile = "${dir}/${r.id}.png"${EOL}\t}`);
		if (add.length) {
			const cut = txt.lastIndexOf('}');
			txt = txt.slice(0, cut) + EOL + EOL + add.join(EOL + EOL) + EOL + EOL + txt.slice(cut);
		}
		if (add.length || dropped.length) writeFileRel(file, txt);
		return { added: add.length, dropped: dropped.length };
	};
	const atlas = syncAtlas(ATLAS, 'focus', GOAL_DIR, focusRows, /^IBR_pol_/);
	const ideaAtlas = syncAtlas(IDEAS_ATLAS, 'idea', IDEA_DIR, spiritRows, null);
	let orphan = 0;
	for (const f of fs.readdirSync(path.join(ROOT, GOAL_DIR))) {
		const m = /^(IBR_pol_\w+)\.png$/.exec(f);
		if (m && !keep.has(m[1])) { fs.unlinkSync(path.join(ROOT, GOAL_DIR, f)); orphan++; }
	}

	/* 政治簇生成器的 icon 换成本簇专属图 */
	let gen = fs.readFileSync(path.join(ROOT, POL_GEN), 'utf8');
	let hit = 0;
	for (const r of focusRows) {
		const re = new RegExp("(id: '" + r.id + "'[^\\n]*?icon: ')[^']+(')");
		if (re.test(gen)) { gen = gen.replace(re, '$1focus_' + r.id + '$2'); hit++; } else console.log('  ! 生成器里没找到：' + r.id);
	}
	if (hit !== focusRows.length) throw new Error(`icon 改写 ${hit}/${focusRows.length}，中止`);
	writeFileRel(POL_GEN, gen);

	fs.writeFileSync(OUT + '/ALL_pol_1x.png', await grid(focusRows.map(r => bufs[r.id]), 6, 1, 3));
	fs.writeFileSync(OUT + '/ALL_pol_2x.png', await grid(focusRows.map(r => bufs[r.id]), 6, 2, 6));
	fs.writeFileSync(OUT + '/ALL_pol_spirit.png', await grid(spiritRows.map(r => bufs[r.id]), 4, 3, 8));
	console.log(`政治簇：国策图 ${focusRows.length} 张（图集 +${atlas.added} −${atlas.dropped}、删孤儿 ${orphan}）、精神图 ${spiritRows.length} 张（图集 +${ideaAtlas.added}）、icon 改写 ${hit} 处 -> ${OUT}`);
}

(async () => {
	if (process.argv.includes('--pol')) return installPol();
	const rows = buildRows();
	const focusRows = rows.filter(r => r.kind === 'focus');
	const spiritRows = rows.filter(r => r.kind === 'spirit');
	const install = process.argv.includes('--install');
	if (install) console.log('备份 ' + backup([
		'common/national_focus/IBR.txt', 'common/ideas/IBR_ideas (Iberia).txt',
		'common/dynamic_modifiers/IBR_military_dynamic_modifiers.txt', 'docs/gen_ibr_military.cjs',
		'interface/ideas/IBR_ideas.gfx', 'interface/_ARF_goals/IBR_goals.gfx',
	]) + ' 项 -> docs/IBR_图标重制_备份_20260928/（贴图另目录）');

	const bufs = {};
	for (const r of rows) bufs[r.id] = await render(r, r.kind === 'spirit' ? 60 : 100);

	if (install) {
		for (const r of focusRows) writeFileRel(GOAL_DIR + '/' + r.id + '.png', bufs[r.id]);
		for (const r of spiritRows) writeFileRel(IDEA_DIR + '/' + r.id + '.png', bufs[r.id]);

		writeFileRel('interface/_ARF_goals/IBR_goals.gfx',
			'spriteTypes = {' + CRLF + CRLF + focusRows.map(r =>
				`\tSpriteType = { ${CRLF}\t\tname = "GFX_focus_${r.id}"${CRLF}\t\ttexturefile = "${GOAL_DIR}/${r.id}.png"${CRLF}\t}`).join(CRLF + CRLF) + CRLF + CRLF + '}' + CRLF);
		writeFileRel('interface/ideas/IBR_ideas.gfx',
			'# IBR 民族精神贴图（生成器 docs/gen_ibr_icons.cjs，勿手改）' + CRLF + 'spriteTypes = {' + CRLF + CRLF + spiritRows.map(r =>
				`\tSpriteType = { ${CRLF}\t\tname = "GFX_idea_${r.id}"${CRLF}\t\ttexturefile = "${IDEA_DIR}/${r.id}.png"${CRLF}\t}`).join(CRLF + CRLF) + CRLF + CRLF + '}' + CRLF);

		const treePath = 'common/national_focus/IBR.txt';
		let tree = fs.readFileSync(path.join(ROOT, treePath), 'utf8');
		const ids = Object.keys(DATA.MAIN);
		const r1 = retargetFocusIcons(tree, ids);
		if (r1.n !== ids.length) throw new Error(`主树 icon 改写 ${r1.n}/${ids.length}，中止`);
		writeFileRel(treePath, r1.text);

		const ideaPath = 'common/ideas/IBR_ideas (Iberia).txt';
		let ideas = fs.readFileSync(path.join(ROOT, ideaPath), 'utf8');
		const DYNAMIC = ['IBR_hollow_roster', 'IBR_reclaimed_sea_heritage', 'IBR_shield_of_the_south', 'IBR_armada_reforged', 'IBR_sun_over_the_south'];
		const spiritIds = Object.keys(DATA.SPIRIT).filter(k => !DYNAMIC.includes(k));
		const r2 = retargetIdeaPictures(ideas, spiritIds);
		writeFileRel(ideaPath, r2.text);
		console.log(`ideas：改写 picture ${r2.set} 处、新增 ${r2.added} 处（共 ${spiritIds.length} 个静态精神）`);

		/* 军事簇的图标名写在生成器里，改生成器再重跑 */
		const genPath = 'docs/gen_ibr_military.cjs';
		let gen = fs.readFileSync(path.join(ROOT, genPath), 'utf8');
		let hit = 0;
		for (const id of Object.keys(DATA.MIL)) {
			const re = new RegExp("(id: '" + id + "'[^\\n]*?icon: ')[^']+(')");
			if (re.test(gen)) { gen = gen.replace(re, '$1GFX_focus_' + id + '$2'); hit++; } else console.log('  ! 生成器里没找到：' + id);
		}
		const DM_SWAP = {
			'GFX_idea_IBR_aftermath_of_Profound_Silence': 'GFX_idea_IBR_hollow_roster',
			'GFX_idea_IBR_lost_maritime_heritage': 'GFX_idea_IBR_reclaimed_sea_heritage',
			'GFX_idea_IBR_inquisition_iron_curtain': 'GFX_idea_IBR_shield_of_the_south',
			'GFX_idea_generic_navy_europe_1': 'GFX_idea_IBR_armada_reforged',
			'GFX_idea_IBR_legacy_of_supreme_swordsmanship': 'GFX_idea_IBR_sun_over_the_south',
		};
		let dm = 0;
		for (const [a, b] of Object.entries(DM_SWAP)) if (gen.includes(a)) { gen = gen.split(a).join(b); dm++; }
		writeFileRel(genPath, gen);
		console.log(`军事簇生成器：国策 icon ${hit}/${Object.keys(DATA.MIL).length}、精神 icon ${dm}/5（需重跑 gen_ibr_military.cjs）`);
	}

	/* 对照图（无论是否安装都出） */
	fs.writeFileSync(OUT + '/ALL_focus_114_1x.png', await grid(focusRows.map(r => bufs[r.id]), 12, 1, 3, '#23282d'));
	fs.writeFileSync(OUT + '/ALL_focus_114_2x.png', await grid(focusRows.map(r => bufs[r.id]), 10, 2, 6));
	fs.writeFileSync(OUT + '/ALL_spirit_39.png', await grid(spiritRows.map(r => bufs[r.id]), 10, 3, 8));
	console.log(`国策 ${focusRows.length} 张 / 精神 ${spiritRows.length} 张${install ? '（已写入 gfx/ 并改引用）' : '（仅样例，未安装）'} -> ${OUT}`);
})();
