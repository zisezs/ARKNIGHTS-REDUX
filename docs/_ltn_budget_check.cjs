// 莱塔尼亚「联合帝国预算计划」政治带自检
// 用法：node docs/_ltn_budget_check.cjs
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const P = (...a) => path.join(ROOT, ...a);

const err = [];
const warn = [];
const PK = (f) => path.relative(ROOT, f).replace(/\\/g, "/");

function read(rel) {
  const p = P(rel);
  if (!fs.existsSync(p)) { err.push(`缺文件 ${rel}`); return ""; }
  return fs.readFileSync(p, "utf8");
}
function bal(txt, rel) {
  let d = 0;
  for (const c of txt) { if (c === "{") d++; else if (c === "}") d--; if (d < 0) break; }
  if (d !== 0) err.push(`${rel} 花括号不平衡：净 ${d}`);
}

// ---------- 1. 读入 ----------
const FILES = {
  focus: "common/national_focus/LTN_political.txt",
  events: "events/LTN_budget.txt",
  ideas: "common/ideas/LTN budget_ideas.txt",
  dm: "common/dynamic_modifiers/LTN_budget_dynamic_modifiers.txt",
  dec: "common/decisions/LTN_budget_decisions.txt",
  fx: "common/scripted_effects/LTN_budget_effects.txt",
  oa: "common/on_actions/LTN_on_actions.txt",
  hist: "history/countries/LTN - Leithanien.txt",
  loc: "localisation/simp_chinese/ARF_LTN_budget_l_simp_chinese.yml",
  gfx: "interface/_ARF_goals/LTN_goals.gfx",
};
const src = {};
for (const [k, rel] of Object.entries(FILES)) { src[k] = read(rel); bal(src[k], rel); }

// ---------- 2. 本地化键 ----------
const locKeys = new Map();
src.loc.split(/\r?\n/).forEach((l, i) => {
  const m = l.match(/^\s*([A-Za-z][\w.]*):\s*(.*)$/);
  if (!m) return;
  if (locKeys.has(m[1])) err.push(`loc 键重复：${m[1]}（第 ${locKeys.get(m[1])} 行与第 ${i + 1} 行）`);
  else locKeys.set(m[1], i + 1);
});
const bom = fs.readFileSync(P(FILES.loc));
if (bom[0] !== 0xef || bom[1] !== 0xbb || bom[2] !== 0xbf) err.push("loc 缺 BOM（整份不会加载）");
if (bom[3] === 0xef && bom[4] === 0xbb && bom[5] === 0xbf) err.push("loc 双 BOM（可能启动崩溃）");
if (/l_simp_chinese:\s*\r?\n\s*l_simp_chinese:/.test(src.loc)) err.push("loc 出现两行 l_simp_chinese: 头");

function need(key, where) { if (!locKeys.has(key)) err.push(`${where} 引用的 loc 键不存在：${key}`); }

// 收集全工程已有 loc（旧文件的键也算存在）
const allLoc = new Set(locKeys.keys());
const locDir = P("localisation/simp_chinese");
for (const f of fs.readdirSync(locDir)) {
  if (!f.endsWith(".yml")) continue;
  for (const m of fs.readFileSync(path.join(locDir, f), "utf8").matchAll(/^\s*([A-Za-z][\w.]*):/gm)) allLoc.add(m[1]);
}
function needAny(key, where) { if (!allLoc.has(key)) err.push(`${where} 引用的 loc 键不存在：${key}`); }

// ---------- 3. 国策结构 ----------
const band = src.focus.split(/\r?\n/);
const focuses = [];
let cur = null;
let inMx = false;
band.forEach((l, i) => {
  let m = l.match(/^\t\tid = (\w+)\s*$/);
  if (m) { if (cur) focuses.push(cur); cur = { id: m[1], line: i + 1, pre: [], mx: [], icon: null, cost: null, ai: null, body: [] }; inMx = false; return; }
  if (!cur) return;
  cur.body.push(l);
  m = l.match(/^\t\ticon = (\w+)/); if (m) cur.icon = m[1];
  m = l.match(/^\t\tcost = ([\d.]+)/); if (m) cur.cost = +m[1];
  m = l.match(/^\t\tprerequisite = \{\s*$/); if (m) { cur._pre = true; return; }
  if (cur._pre) { m = l.match(/^\t\t\tfocus = (\w+)/); if (m) cur.pre.push(m[1]); if (/^\t\t\}/.test(l)) cur._pre = false; }
  m = l.match(/^\t\tmutually_exclusive = \{\s*$/); if (m) { cur._mx = true; return; }
  if (cur._mx) { m = l.match(/^\t\t\tfocus = (\w+)/); if (m) cur.mx.push(m[1]); if (/^\t\t\}/.test(l)) cur._mx = false; }
  m = l.match(/^\t\tx = (-?\d+)/); if (m && cur.x === undefined) cur.x = +m[1];
  m = l.match(/^\t\ty = (-?\d+)/); if (m && cur.y === undefined) cur.y = +m[1];
  m = l.match(/^\t\t\tbase = (\d+)/); if (m && cur.ai === null) cur.ai = +m[1];
});
if (cur) focuses.push(cur);

const NEW = ["LTN_new_year", "LTN_tell_the_ministers", "LTN_elector_loyalty_problem", "LTN_open_budget_plan",
  "LTN_break_the_silence", "LTN_the_count_is_right", "LTN_voice_on_tour", "LTN_hush_the_liberals",
  "LTN_white_empress_plan", "LTN_open_imperial_diet", "LTN_fair_competition", "LTN_useful_bureaucracy",
  "LTN_open_final_vote", "LTN_narrow_passage", "LTN_budget_defeat", "LTN_hlinmarts_plan",
  "LTN_lambs_and_goats_return", "LTN_where_is_your_other_half", "LTN_silent_her_and_crown",
  "LTN_victory_of_eternal_festival", "LTN_imperial_overture", "LTN_ludwig_purge", "LTN_round_table_law",
  "LTN_serious_research", "LTN_dream_comes_true", "LTN_laurel_of_victory"];

const ids = focuses.map(f => f.id);
const byId = new Map(focuses.map(f => [f.id, f]));
if (new Set(ids).size !== ids.length) err.push("国策 id 有重复");
for (const id of NEW) if (!byId.has(id)) err.push(`新政治带缺格：${id}`);
for (const dead of ["LTN_twin_rule", "LTN_new_golden_law", "LTN_read_the_score", "LTN_gendarme_and_spy"])
  if (byId.has(dead)) err.push(`旧政治段格子未删净：${dead}`);

const pos = new Map();
for (const f of focuses) {
  if (!NEW.includes(f.id)) continue;
  if (f.icon === null) err.push(`${f.id} 没有 icon`);
  else {
    const g = new RegExp(`name = "?${f.icon}"?`).exec(src.gfx);
    if (!g) err.push(`${f.id} 的图标未注册：${f.icon}`);
    else {
      const tex = new RegExp(`name = "?${f.icon}"?\\s*\\n\\s*texturefile = "([^"]+)"`).exec(src.gfx);
      if (tex && !fs.existsSync(P(tex[1]))) err.push(`${f.id} 图标注册的贴图文件不存在：${tex[1]}`);
    }
  }
  if (f.cost === null) err.push(`${f.id} 没有 cost`);
  if (f.ai === null || f.ai === 0) warn.push(`${f.id} 的 ai_will_do base 可疑：${f.ai}`);
  if (f.x === undefined || f.y === undefined) { err.push(`${f.id} 缺 x/y`); continue; }
  const k = `${f.x},${f.y}`;
  if (pos.has(k)) err.push(`坐标重叠：${f.id} 与 ${pos.get(k)} 都在 x=${f.x} y=${f.y}`);
  else pos.set(k, f.id);
  for (const p of f.pre) if (!byId.has(p)) err.push(`${f.id} 的前置不存在：${p}`);
  for (const mx of f.mx) if (!byId.has(mx)) err.push(`${f.id} 的互斥对象不存在：${mx}`);
  for (const p of f.pre) {
    const pf = byId.get(p);
    if (pf && pf.y >= f.y) err.push(`${f.id}(y=${f.y}) 的前置 ${p} 在其同排或下方(y=${pf.y})`);
  }
  need(f.id, "loc/国策名");
  need(`${f.id}_desc`, "loc/国策描述");
  const body = f.body.join("\n");
  for (const m of body.matchAll(/custom_effect_tooltip = (\w+)/g)) needAny(m[1], f.id);
  for (const m of body.matchAll(/(?:add_ideas|remove_ideas) = (\w+)/g))
    if (!new RegExp(`\\b${m[1]} = \\{`).test(src.ideas)) err.push(`${f.id} 引用了不存在的 idea：${m[1]}`);
  for (const m of body.matchAll(/add_dynamic_modifier = \{ modifier = (\w+) \}/g))
    if (!new RegExp(`^${m[1]} = \\{`, "m").test(src.dm)) err.push(`${f.id} 引用了不存在的动态修正：${m[1]}`);
  for (const m of body.matchAll(/country_event = \{ id = ([\w.]+)/g))
    if (!new RegExp(`id = ${m[1].replace(".", "\\.")}\\b`).test(src.events)) err.push(`${f.id} 触发的事件不存在：${m[1]}`);
  for (const m of body.matchAll(/division_template = \\"([^\\"]+)\\"/g))
    if (!fs.readFileSync(P("history/units/LTN_Start.txt"), "utf8").includes(`name = "${m[1]}"`))
      err.push(`${f.id} create_unit 用的师模板不存在：${m[1]}`);
}

// 包围盒与版式
const nb = focuses.filter(f => NEW.includes(f.id));
const xs = nb.map(f => f.x), ys = nb.map(f => f.y);
const xmin = Math.min(...xs), xmax = Math.max(...xs);
if (xmin !== -xmax) warn.push(`包围盒不对称：x∈[${xmin},${xmax}]`);
const colCount = {};
for (const x of [xmin, -xmin, xmax]) colCount[x] = nb.filter(f => f.x === x).length;
for (const [x, n] of Object.entries(colCount)) if (n < 2) err.push(`极值列 x=${x} 只有 ${n} 格（孤立节点会让树显示不全）`);
const root = byId.get("LTN_new_year");
if (root && (root.x !== 0 || root.y !== Math.min(...ys))) err.push("起始格不在顶行中线");
if (!/initial_show_position = \{\s*\n\t\tfocus = LTN_new_year/.test(src.focus)) err.push("initial_show_position 不是 LTN_new_year");

// 三条旧线整体下移是否生效
for (const [id, want] of [["LTN_imperial_treasury", 20], ["LTN_muster_roll", 27], ["LTN_foreign_towers", 34]])
  if (byId.get(id) && byId.get(id).y !== want) err.push(`${id} 应平移到 y=${want}，实为 ${byId.get(id).y}`);

// 变量成对写入：同一 reward 里同一变量只能出现一次
for (const f of nb) {
  const c = {};
  for (const m of f.body.join("\n").matchAll(/(?:add_to_variable|subtract_from_variable) = \{ (\w+)/g)) {
    c[m[1]] = (c[m[1]] || 0) + 1;
    if (c[m[1]] > 1 && m[1].startsWith("LTN_ebl")) err.push(`${f.id} 在同一 reward 里第二次写精神变量 ${m[1]}`);
  }
}

// ---------- 4. 事件 ----------
let n = 0;
src.events.split(/\r?\n/).forEach((l, i) => {
  const m = l.match(/^\tid = (LTN_budget\.\d+)\s*$/);
  if (m) n++;
  if (m) {
    need(`${m[1]}.t`, `事件 ${m[1]} 标题`);
    need(`${m[1]}.d`, `事件 ${m[1]} 描述`);
  }
  const o = l.match(/^\t\tname = (LTN_budget\.\d+\.o[a-z])\s*$/);
  if (o) need(o[1], "事件选项");
});
if (n !== 15) err.push(`事件数应为 15，实为 ${n}`);
if (!/add_namespace = LTN_budget/.test(src.events)) err.push("events/LTN_budget.txt 缺 add_namespace");
for (const m of src.events.matchAll(/custom_effect_tooltip = (\w+)/g)) needAny(m[1], "events");
for (const m of src.events.matchAll(/trigger = \{[^}]*?has_country_flag = (\w+)/g)) void m;
const optIdx = {};
for (const m of src.events.matchAll(/name = (LTN_budget\.\d+)\.([a-z]+)\b/g)) {
  (optIdx[m[1]] = optIdx[m[1]] || []).push(m[2]);
}
for (const [ev, list] of Object.entries(optIdx)) {
  if (list.includes("d")) err.push(`${ev} 有选项名 .d，会和 desc 键抢同一个 loc`);
  if (new Set(list).size !== list.length) err.push(`${ev} 选项名重复：${list.join(",")}`);
}

// ---------- 5. 决议 / 精神 / 脉冲 ----------
for (const m of src.dec.matchAll(/^\t(LTN_dec_\w+) = \{/gm)) { need(m[1], "决议名"); need(`${m[1]}_desc`, "决议描述"); }
for (const m of src.dec.matchAll(/has_completed_focus = (LTN_\w+)/g))
  if (!byId.has(m[1])) err.push(`决议门槛指向已删除的国策：${m[1]}`);
for (const m of src.ideas.matchAll(/^\t\t(LTN_\w+) = \{/gm)) need(`${m[1]}_desc`, `精神 ${m[1]} 描述`);
need("LTN_dyn_elector_bloc", "动态修正名");
const dmVars = [...src.dm.matchAll(/^\t(\w+) = (LTN_\w+)$/gm)].map(m => m[2]);
const histVars = [...src.hist.matchAll(/set_variable = \{ (LTN_\w+) =/g)].map(m => m[1]);
for (const v of dmVars) if (!histVars.includes(v)) err.push(`动态修正读取的变量未在 history 初始化：${v}`);
if (!/LTN_budget_effect_init = yes/.test(src.oa)) err.push("on_startup 没接 LTN_budget_effect_init");
if (!/LTN_budget_effect_tick = yes/.test(src.oa)) err.push("on_monthly_LTN 没接 LTN_budget_effect_tick");
if (!/LTN_budget_effect_init = yes/.test(src.focus)) warn.push("政治带起始格没调 init（只靠 history 初值）");

// 外部门槛残留
for (const rel of ["common/decisions/categories/LTN_categories.txt", "common/decisions/LTN_decisions.txt",
  "common/decisions/LTN_ops_decisions.txt", "common/military_industrial_organization/organizations/LTN_organization.txt",
  "common/bookmarks/bm1.txt"]) {
  const t = read(rel);
  for (const m of t.matchAll(/has_completed_focus = (LTN_\w+)/g))
    if (!byId.has(m[1])) err.push(`${PK(P(rel))} 门槛指向已删除的国策：${m[1]}`);
  bal(t, PK(P(rel)));
}


// 引擎实测拒绝的写法（2026-10-11 error.log 实证）：
//   ideas 里 `desc =` → Unexpected token: desc（描述走 loc 键 <id>_desc，引擎自动读）
//   ideas 里 `picture = ""` → Icon definition "" does neither look like a file path nor a GFX entry
//   `has_ideas =` → Unknown trigger-type（判精神存在不能用它）
const LINT = [
  [/picture\s*=\s*""/g, 'picture = ""（引擎报 Icon definition "" …，精神图标坏掉）'],
  [/\bhas_ideas\s*=/g, "has_ideas（Unknown trigger-type）"],
];
for (const rel of ["common/ideas/LTN budget_ideas.txt", "common/ideas/LTN ideas (Leithanien).txt",
  "common/scripted_effects/LTN_budget_effects.txt", "common/decisions/LTN_budget_decisions.txt",
  "common/dynamic_modifiers/LTN_budget_dynamic_modifiers.txt"]) {
  const t = read(rel);
  for (const [re, msg] of LINT) if (re.test(t)) err.push(`${rel}：${msg}`);
  // 只有 ideas 文件里 desc = 非法；事件文件的 desc 是正当键
  if (rel.includes("ideas") && /\n\s*desc\s*=/.test(t))
    err.push(`${rel}：ideas 里不能写 desc =（引擎报 Unexpected token: desc；描述由 loc 键 <id>_desc 自动取）`);
}

// 启动后冒烟：error.log 里只要提到本批文件就是真错（原版也报的噪音不算）
const ELOG = P("../../logs/error.log");
if (fs.existsSync(ELOG)) {
  const st = fs.statSync(ELOG);
  const newestFile = Math.max(...[FILES.focus, FILES.events, FILES.ideas, FILES.dec, FILES.fx, FILES.loc]
    .filter(f => fs.existsSync(P(f))).map(f => fs.statSync(P(f)).mtimeMs));
  const stale = st.mtimeMs < newestFile;   // 这份日志是修复之前那次启动留下的
  const lines = fs.readFileSync(ELOG, "utf8").split(/\r?\n/);
  const mine = lines.filter(l => /LTN_budget|LTN budget_|national_focus\/LTN_political/.test(l));
  mine.slice(0, 12).forEach(l => (stale ? warn : err).push(
    (stale ? "上次启动（修复前）的 error.log：" : "本次启动的 error.log：") + l.slice(0, 150)));
  console.log(`error.log 最后修改 ${new Date(st.mtime).toLocaleTimeString("zh-CN")}，命中本批文件 ${mine.length} 行` + (stale ? "（早于本次修复，重启后应清零）" : ""));
}

console.log(`国策 ${focuses.length} 格（新政治带 ${nb.length} 格）/ 事件 ${n} 个 / loc 键 ${locKeys.size} 条`);
console.log(`新政治带纵深 y ${Math.min(...ys)}..${Math.max(...ys)}，宽 x ${xmin}..${xmax}`);
warn.forEach(w => console.log("  · 注意 " + w));
console.log(err.length ? `\n✗ ${err.length} 个错误：\n` + err.map(e => "  ✗ " + e).join("\n") : "\n✓ 全部检查通过");
process.exitCode = err.length ? 1 : 0;
