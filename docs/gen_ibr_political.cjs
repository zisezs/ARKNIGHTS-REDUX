/*
 * IBR 政治国策簇生成器
 *   node docs/gen_ibr_political.cjs
 * 产物（幂等，重跑字节一致）：
 *   common/national_focus/IBR_political_shared.txt
 *   localisation/simp_chinese/ARF_IBR_political_l_simp_chinese.yml
 *   common/national_focus/IBR.txt  —— 末尾的 shared_focus 引用区（自动生成 起/止 标记之间）
 *   docs/_ibr_political_layout.svg —— 整棵 IBR 树的排版图（主树+军事簇+发展度簇+政治簇）
 * 数据表改完重跑即可；勿手改产物。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VANILLA_GOALS = 'D:/s/steamapps/common/Hearts of Iron IV/gfx/interface/goals';

/* 草案 NEW_tree.txt 的坐标 → 本工程坐标（整簇平移到主树与军事簇之间的空行带） */
const XOFF = -11, YOFF = +5;

/* pre：每个 { } 是一块 prerequisite；块内多 id = 「或」，多块 = 「与」
   mx：mutually_exclusive
   dx/dy：草案坐标 */
const NODES = [
  { n: 1,  id: 'IBR_pol_wrath_and_change',   name: '永恒愤怒，永恒变革',        icon: 'focus_IBR_pol_wrath_and_change',                 dx: -1, dy: 3,
    note: '待实装前置：伊比利亚内战已经结束（现在不实装；【处于和平】是它的近义条件，已挂在 available）',
    pre: [['IBR_eternal_lighthouse']],
    avail: ['has_war = no'],
    desc: '国防军与惩戒军刺向同胞的利刃、旧王室与旧贵族的卑鄙怯懦、岛上人与陆上人的仇视、阿戈尔人与黎博利人种族仇杀已经让卡门无比地愤怒了，可愤怒之后呢？\\n他必须做出改变。' },
  { n: 2,  id: 'IBR_pol_golden_century',     name: '伊比利亚·黄金世纪',          icon: 'focus_IBR_pol_golden_century',           dx: 2,  dy: 4, pre: [[1]], mx: [3] },
  { n: 3,  id: 'IBR_pol_pure_heart',         name: '伊比利亚·纯白之心',          icon: 'focus_IBR_pol_pure_heart',              dx: -4, dy: 4, pre: [[1]], mx: [2],
    note: '国策正文待填（用户：暂无）；决议组 IBR_purification_category 由类目 allowed 里的本格前置自动解锁' },
  { n: 4,  id: 'IBR_pol_scrap_wreck_anchor',   name: '废铁、烂船与破锚',            icon: 'focus_IBR_pol_scrap_wreck_anchor',             dx: 5,  dy: 6, pre: [[5]] },
  { n: 5,  id: 'IBR_pol_trickster_leader_king',     name: '骗子、统帅与国王',            icon: 'focus_IBR_pol_trickster_leader_king',                 dx: 5,  dy: 5, pre: [[2]] },
  { n: 6,  id: 'IBR_pol_who_fires_guns',     name: '铳枪为谁而轰鸣',              icon: 'focus_IBR_pol_who_fires_guns',                     dx: -7, dy: 5, pre: [[3]] },
  { n: 7,  id: 'IBR_pol_who_draws_blade',    name: '刺剑为谁而出鞘',              icon: 'focus_IBR_pol_who_draws_blade',                 dx: -7, dy: 6, pre: [[6]] },
  { n: 8,  id: 'IBR_pol_islanders_landsmen', name: '岛民与陆民',                 icon: 'focus_IBR_pol_islanders_landsmen', dx: -1, dy: 5, pre: [[3, 2]] },
  { n: 9,  id: 'IBR_pol_who_judges_sin',     name: '罪孽为谁而审判',              icon: 'focus_IBR_pol_who_judges_sin',                          dx: -7, dy: 7, pre: [[7]] },
  { n: 10, id: 'IBR_pol_army_of_inquisition',name: '审判庭的惩戒军？',            icon: 'focus_IBR_pol_army_of_inquisition',         dx: -8, dy: 8, pre: [[9]] },
  { n: 11, id: 'IBR_pol_army_of_the_people', name: '伊比利亚人民的惩戒军！',      icon: 'focus_IBR_pol_army_of_the_people',                      dx: -6, dy: 8, pre: [[9]] },
  { n: 12, id: 'IBR_pol_aegir_and_libertini',     name: '阿戈尔人与黎博利人',          icon: 'focus_IBR_pol_aegir_and_libertini',             dx: -1, dy: 6, pre: [[8]] },
  { n: 13, id: 'IBR_pol_reorganize_mutual_aid',     name: '改组互助会',                 icon: 'focus_IBR_pol_reorganize_mutual_aid',                       dx: 0,  dy: 7, pre: [[12]] },
  { n: 14, id: 'IBR_pol_suppress_mutual_aid',       name: '镇压互助会',                 icon: 'focus_IBR_pol_suppress_mutual_aid',                dx: -2, dy: 7, pre: [[12]] },
  { n: 15, id: 'IBR_pol_you_are_iberian',    name: '你们是伊比利亚人！',          icon: 'focus_IBR_pol_you_are_iberian',         dx: -2, dy: 8, pre: [[14]] },
  { n: 16, id: 'IBR_pol_we_are_iberian',     name: '大家是伊比利亚人！',          icon: 'focus_IBR_pol_we_are_iberian',               dx: 0,  dy: 8, pre: [[13]] },
  { n: 17, id: 'IBR_pol_i_honour_you',       name: '伊比利亚人，我敬你！',        icon: 'focus_IBR_pol_i_honour_you',              dx: -1, dy: 9, pre: [[15], [16]] },
  { n: 18, id: 'IBR_pol_secret_conclave',    name: '审判庭秘密会议',              icon: 'focus_IBR_pol_secret_conclave',                         dx: -7, dy: 9, pre: [[10], [11]] },
  { n: 19, id: 'IBR_pol_saint_irene',        name: '圣徒艾丽妮万岁！',            icon: 'focus_IBR_pol_saint_irene',              dx: -4, dy: 13, pre: [[31], [34]], mx: [28] },
  { n: 20, id: 'IBR_pol_three_forces',       name: '惩戒军、国防军与深海舰队',    icon: 'focus_IBR_pol_three_forces',                dx: 6,  dy: 7, pre: [[4]] },
  { n: 21, id: 'IBR_pol_true_crown_false_king',         name: '真王冠、真王座与假国王',      icon: 'focus_IBR_pol_true_crown_false_king',   dx: 4,  dy: 7, pre: [[4]] },
  { n: 22, id: 'IBR_pol_toledo_fallen_star', name: '德·托莱多家族的黯淡之星！',  icon: 'focus_IBR_pol_toledo_fallen_star',             dx: 5,  dy: 8, pre: [[20], [21]] },
  { n: 23, id: 'IBR_pol_king_not_master',    name: '要国王，不要主人！',          icon: 'focus_IBR_pol_king_not_master',           dx: 4,  dy: 9, pre: [[22]] },
  { n: 24, id: 'IBR_pol_subjects_not_slaves',name: '是臣民，不是奴仆！',          icon: 'focus_IBR_pol_subjects_not_slaves',  dx: 6,  dy: 9, pre: [[22]] },
  { n: 25, id: 'IBR_pol_carmen_secret_letter', name: '圣徒卡门的密信',            icon: 'focus_IBR_pol_carmen_secret_letter',          dx: 4,  dy: 12, pre: [[26], [23]] },
  { n: 26, id: 'IBR_pol_prepare_first_election',     name: '筹备伊比利亚第一次大选！',    icon: 'focus_IBR_pol_prepare_first_election',                      dx: 5,  dy: 11 },
  { n: 27, id: 'IBR_pol_clementia_aid',      name: '克莱门莎的援助',              icon: 'focus_IBR_pol_clementia_aid',                  dx: 6,  dy: 12, pre: [[26], [24]] },
  { n: 28, id: 'IBR_pol_empress_estefania',  name: '女皇埃斯特菲尼娅万岁！',      icon: 'focus_IBR_pol_empress_estefania',          dx: 2,  dy: 13, pre: [[26], [31]], mx: [19] },
  { n: 29, id: 'IBR_pol_restore_confidence', name: '重建黄金时代的自信',          icon: 'focus_IBR_pol_restore_confidence',                     dx: 0,  dy: 10, pre: [[17]] },
  { n: 30, id: 'IBR_pol_restore_courage',    name: '重拾开拓时代的勇气',          icon: 'focus_IBR_pol_restore_courage',             dx: -2, dy: 10, pre: [[17]] },
  { n: 31, id: 'IBR_pol_golden_age_returns', name: '黄金时代将再次归来！',        icon: 'focus_IBR_pol_golden_age_returns',               dx: -1, dy: 11, pre: [[29], [30]] },
  { n: 32, id: 'IBR_pol_review_dogma',       name: '极端教条再审核',              icon: 'focus_IBR_pol_review_dogma',                 dx: -6, dy: 10, pre: [[18]] },
  { n: 33, id: 'IBR_pol_retrial_records',    name: '争议卷宗再审判',              icon: 'focus_IBR_pol_retrial_records',                dx: -8, dy: 10, pre: [[18]] },
  { n: 34, id: 'IBR_pol_saint_last_journey', name: '圣徒的退休前旅行',            icon: 'focus_IBR_pol_saint_last_journey',              dx: -7, dy: 11, pre: [[32], [33]] },
];

/* ───── 三条线的可升级精神（变量驱动 DM）─────
   每键一枚独立变量；百分比键 +0.05/档、稳定与战争支持 +0.01/档、消费品 −0.05/档（负=好）；满档 +25% / +5%。
   变量初值一律 0（未定义按 0 处理），线首格挂 DM、线尾与终幕 clamp 封顶。 */
const ROUTE_VARS = {
  ph: ['org', 'atk', 'def', 'exp', 'pp', 'stab'],
  un: ['res', 'build', 'cons', 'pp', 'ws', 'stab'],
  gc: ['eff', 'out', 'cg', 'pp', 'ws', 'stab'],
};
const VARNAME = (r, k) => 'IBR_pol_' + r + '_' + k;
const STEP = k => (k === 'stab' || k === 'ws' ? 0.01 : k === 'cg' ? -0.05 : 0.05);
const CAP = k => (k === 'stab' || k === 'ws' ? 0.05 : 0.25);

/* 每格的阶梯推进：三条线各把 6 枚键各推 5 档（30 次），最终正好落在 +25% / +5% 上限上，
   中途任何一步都不越界，所以收尾 clamp 只是保险。（终幕 19 / 28 不再推档，改为一次性大礼包 + clamp） */
const LADDER = {
  /* 左线 · 纯白之心 */
  3: ['ph:org', 'ph:atk', 'ph:def'],
  6: ['ph:exp', 'ph:pp', 'ph:stab'],
  7: ['ph:org', 'ph:atk', 'ph:def'],
  9: ['ph:exp', 'ph:pp', 'ph:stab'],
  10: ['ph:org', 'ph:atk', 'ph:def'],
  11: ['ph:exp', 'ph:pp', 'ph:stab'],
  18: ['ph:org', 'ph:atk', 'ph:def'],
  32: ['ph:exp', 'ph:pp', 'ph:stab'],
  33: ['ph:org', 'ph:atk', 'ph:def'],
  34: ['ph:exp', 'ph:pp', 'ph:stab'],
  /* 中线 · 团结之国 */
  8: ['un:res', 'un:build', 'un:cons'],
  12: ['un:pp', 'un:ws', 'un:stab'],
  13: ['un:res', 'un:build', 'un:cons'],
  14: ['un:pp', 'un:ws', 'un:stab'],
  15: ['un:res', 'un:build', 'un:cons'],
  16: ['un:pp', 'un:ws', 'un:stab'],
  17: ['un:res', 'un:build', 'un:cons'],
  29: ['un:pp', 'un:ws', 'un:stab'],
  30: ['un:res', 'un:build', 'un:cons'],
  31: ['un:pp', 'un:ws', 'un:stab'],
  /* 右线 · 黄金世纪 */
  2: ['gc:eff', 'gc:out', 'gc:cg'],
  5: ['gc:pp', 'gc:ws', 'gc:stab'],
  4: ['gc:eff', 'gc:out', 'gc:cg'],
  20: ['gc:pp', 'gc:ws', 'gc:stab'],
  21: ['gc:eff', 'gc:out', 'gc:cg'],
  22: ['gc:pp', 'gc:ws', 'gc:stab'],
  23: ['gc:eff', 'gc:out'],
  24: ['gc:cg', 'gc:pp'],
  25: ['gc:ws', 'gc:stab'],
  26: ['gc:eff', 'gc:out'],
  27: ['gc:cg', 'gc:pp'],
  28: ['gc:ws', 'gc:stab'],
};
/* 线首格挂 DM（防并行列重复挂） */
const MOUNT = { 3: ['ph', 'IBR_pol_pure_heart_dm'], 8: ['un', 'IBR_pol_unity_nation_dm'], 2: ['gc', 'IBR_pol_golden_century_dm'] };
/* 线尾 / 终幕 clamp 封顶 */
const CLAMP = { 19: 'ph', 31: 'un', 28: 'gc' };
/* 溃局换缓和档（swap_ideas） */
const DEBUFF = {
  9: ['IBR_broken_garrisons', 'IBR_inquisition_reforming'],
  12: ['IBR_aegir_malicious_interference', 'IBR_mirialium_cautious_contact'],
  5: ['IBR_bandits_and_warlords', 'IBR_countryside_regathering'],
};
/* 缓和档彻底清零 */
const DEBUFF_CLEAR = { 34: 'IBR_inquisition_reforming', 30: 'IBR_mirialium_cautious_contact', 26: 'IBR_countryside_regathering' };
/* 一次性效果 */
const ONCE = {
  1: '\t\tadd_ideas = {\n\t\t\tIBR_broken_garrisons\n\t\t\tIBR_bandits_and_warlords\n\t\t\tIBR_aegir_malicious_interference\n\t\t}',
  2: '\t\tadd_political_power = 25',
  3: '\t\tadd_political_power = 25\n\t\tcustom_effect_tooltip = IBR_pol_pure_heart_tt',
  4: '\t\tadd_offsite_building = { type = industrial_complex level = 1 }',
  6: '\t\tarmy_experience = 25',
  7: '\t\tarmy_experience = 25',
  8: '\t\trandom_owned_controlled_state = { add_manpower = 20000 }',
  10: '\t\tadd_political_power = 25',
  11: '\t\tarmy_experience = 50',
  12: '\t\tadd_stability = 0.02',
  13: '\t\tadd_stability = 0.02',
  14: '\t\tadd_political_power = 25\n\t\tadd_war_support = 0.03',
  15: '\t\trandom_owned_controlled_state = { add_manpower = 25000 }',
  16: '\t\tadd_stability = 0.03',
  17: '\t\tadd_political_power = 50',
  18: '\t\tadd_political_power = 50',
  19: '\t\tadd_political_power = 75\n\t\tadd_stability = 0.05\n\t\tarmy_experience = 75\n\t\tcustom_effect_tooltip = IBR_pol_saint_irene_tt\n\t\thidden_effect = {\n\t\t\tcountry_event = { id = ibr_pol.1 days = 1 }\n\t\t}',
  20: '\t\tarmy_experience = 25\n\t\tnavy_experience = 25',
  21: '\t\tadd_stability = 0.02',
  22: '\t\tadd_political_power = 50',
  23: '\t\tadd_stability = 0.03',
  24: '\t\tadd_war_support = 0.05',
  25: '\t\tadd_stability = 0.03',
  26: '\t\tadd_political_power = 50',
  27: '\t\tadd_offsite_building = { type = arms_factory level = 1 }',
  28: '\t\tadd_political_power = 100\n\t\tadd_stability = 0.05\n\t\tadd_war_support = 0.05\n\t\tcustom_effect_tooltip = IBR_pol_empress_estefania_tt\n\t\thidden_effect = {\n\t\t\tcountry_event = { id = ibr_pol.2 days = 1 }\n\t\t}',
  29: '\t\tadd_war_support = 0.05',
  30: '\t\tadd_stability = 0.03',
  31: '\t\tadd_political_power = 50\n\t\tarmy_experience = 50\n\t\tnavy_experience = 50\n\t\tadd_stability = 0.05',
  32: '\t\tadd_political_power = 25\n\t\tadd_stability = 0.02',
  33: '\t\tadd_stability = 0.03',
  34: '\t\tadd_research_slot = 1',
};

/* ───── 效果文案：从 LADDER/MOUNT/DEBUFF/ONCE 同一张表拼出，保证与实装效果永不脱节 ─────
   写法照 潜龙腾渊 LRD_national_focus_PRC_military.txt：每格一条 custom_effect_tooltip，
   用 §Y 名称§! / §G+5%§! 逐项写明变化。 */
const VAR_LABEL = {
  org: '陆军组织度', atk: '陆军攻击', def: '陆军防御', exp: '陆军经验获取',
  pp: '政治点数获取', stab: '稳定度', res: '研究速度', build: '建造速度',
  cons: '可征募人口', ws: '战争支持度', eff: '生产效率上限', out: '工厂产出', cg: '生活消费品需求',
};
const ROUTE_NAME = { ph: '伊比利亚·纯白之心', un: '团结之国', gc: '黄金世纪' };
const IDEA_NAME = {
  IBR_broken_garrisons: '溃散的地方驻军', IBR_bandits_and_warlords: '盗匪与军阀横行',
  IBR_aegir_malicious_interference: '阿戈尔的恶意干涉',
  IBR_inquisition_reforming: '重整中的惩戒军', IBR_countryside_regathering: '收拢中的乡野',
  IBR_mirialium_cautious_contact: '谨慎接触中的弥利亚留姆',
};
/* 一档的显示值：消费品是「降低」（负值但对我们有利，标绿） */
const PCT = k => (k === 'stab' || k === 'ws' ? '1%' : k === 'cg' ? '−5%' : '5%');
const SIGN = k => (k === 'cg' ? '' : '+');

/* 把 ONCE 里的原始效果行翻译成人话 */
function onceText(v) {
  const raw = ONCE[v.n]; if (!raw) return [];
  const out = [];
  for (const line of raw.split('\n')) {
    const s = line.trim(); let m;
    if ((m = /^add_political_power = ([\d.]+)$/.exec(s))) out.push(`政治点数 §G+${m[1]}§!`);
    else if ((m = /^add_stability = ([\d.]+)$/.exec(s))) out.push(`稳定度 §G+${(+m[1] * 100).toFixed(0)}%§!`);
    else if ((m = /^add_war_support = ([\d.]+)$/.exec(s))) out.push(`战争支持度 §G+${(+m[1] * 100).toFixed(0)}%§!`);
    else if ((m = /^army_experience = ([\d.]+)$/.exec(s))) out.push(`陆军经验 §G+${m[1]}§!`);
    else if ((m = /^navy_experience = ([\d.]+)$/.exec(s))) out.push(`海军经验 §G+${m[1]}§!`);
    else if ((m = /add_manpower = (\d+)/.exec(s))) out.push(`人力 §G+${m[1]}§!`);
    else if ((m = /add_offsite_building = \{ type = (\w+) level = (\d+)/.exec(s)))
      out.push(`获得 §G${m[2]}§! 座${m[1] === 'arms_factory' ? '军用' : '民用'}工厂`);
    else if ((m = /^add_research_slot = (\d+)$/.exec(s))) out.push(`研究槽 §G+${m[1]}§!`);
    else if (/^add_ideas = \{/.test(s)) out.push('获得三个溃局民族精神：§R溃散的地方驻军§!、§R盗匪与军阀横行§!、§R阿戈尔的恶意干涉§!');
  }
  return out;
}

/* 一格的效果说明（多行） */
function describe(v) {
  const out = [];
  const m = MOUNT[v.n];
  if (m) out.push(`获得可升级民族精神 §Y${ROUTE_NAME[m[0]]}§!（本格起逐格成长，满档见精神面板）`);
  const byRoute = {};
  for (const spec of (LADDER[v.n] || [])) { const [r, k] = spec.split(':'); (byRoute[r] = byRoute[r] || []).push(k); }
  for (const r of Object.keys(byRoute)) {
    out.push(`§Y${ROUTE_NAME[r]}§!：` + byRoute[r].map(k => `${VAR_LABEL[k]} §G${SIGN(k)}${PCT(k)}§!`).join('　'));
  }
  const d = DEBUFF[v.n];
  if (d) out.push(`§R${IDEA_NAME[d[0]]}§! §G减轻§! 为 §Y${IDEA_NAME[d[1]]}§!`);
  if (DEBUFF_CLEAR[v.n]) out.push(`§R${IDEA_NAME[DEBUFF_CLEAR[v.n]]}§! 被彻底清除`);
  const once = onceText(v);
  if (once.length) out.push(once.join('　'));
  return out.join('\\n');
}

/* 把一格的所有效果行拼出来 */
function fxLines(v) {
  const L = [];
  if (v.note) L.push('\t\t# ' + v.note);
  /* 效果说明（照范例：一条 custom_effect_tooltip 把变化逐项写明；键名加 _fx_tt 以免与手写键撞） */
  const txt = describe(v);
  if (txt) L.push('\t\tcustom_effect_tooltip = ' + v.id + '_fx_tt');
  const m = MOUNT[v.n];
  if (m) L.push('\t\tif = {\n\t\t\tlimit = { NOT = { has_dynamic_modifier = { modifier = ' + m[1] + ' } } }\n\t\t\tadd_dynamic_modifier = { modifier = ' + m[1] + ' }\n\t\t}');
  for (const spec of (LADDER[v.n] || [])) {
    const [r, k] = spec.split(':');
    L.push('\t\tadd_to_variable = { var = ' + VARNAME(r, k) + ' value = ' + STEP(k).toFixed(2) + ' }');
  }
  const d = DEBUFF[v.n];
  if (d) L.push('\t\tswap_ideas = {\n\t\t\tremove_idea = ' + d[0] + '\n\t\t\tadd_idea = ' + d[1] + '\n\t\t}');
  if (DEBUFF_CLEAR[v.n]) L.push('\t\tremove_ideas = { ' + DEBUFF_CLEAR[v.n] + ' }');
  if (ONCE[v.n]) L.push(ONCE[v.n]);
  const c = CLAMP[v.n];
  if (c) for (const k of ROUTE_VARS[c])
    L.push('\t\tclamp_variable = { var = ' + VARNAME(c, k) + ' min = ' + (k === 'cg' ? -CAP(k) : 0) + ' max = ' + CAP(k) + ' }');
  return L;
}

const COST = 5;
const byN = new Map(NODES.map(v => [v.n, v]));
NODES.forEach(v => { v.x = v.dx + XOFF; v.y = v.dy + YOFF; });

/* ---------------- 校验 ---------------- */
const problems = [];
const ok = (cond, msg) => { if (!cond) problems.push(msg); };

/* 1. 坐标唯一 + 同排间距 */
const cells = new Map();
for (const v of NODES) {
  const k = v.x + ',' + v.y;
  ok(!cells.has(k), `撞格 ${k}: ${v.id} 与 ${cells.get(k)}`);
  cells.set(k, v.id);
}
const rows = new Map();
NODES.forEach(v => { (rows.get(v.y) || rows.set(v.y, []).get(v.y)).push(v); });
for (const [y, list] of rows) {
  list.sort((a, b) => a.x - b.x);
  for (let i = 1; i < list.length; i++)
    ok(list[i].x - list[i - 1].x >= 2, `同排贴格 y=${y}: ${list[i - 1].id}(x=${list[i - 1].x}) / ${list[i].id}(x=${list[i].x}) Δx=${list[i].x - list[i - 1].x}`);
}

/* 2. 悬空引用 + 前置方向（前置可写簇内编号，也可写主树国策 id） */
const ALL_FOCUS = new Set();
for (const f of fs.readdirSync(path.join(ROOT, 'common/national_focus')).filter(x => x.endsWith('.txt')))
  for (const m of fs.readFileSync(path.join(ROOT, 'common/national_focus', f), 'utf8').replace(/\r/g, '').matchAll(/^\s*id\s*=\s*([A-Za-z0-9_]+)/gm)) ALL_FOCUS.add(m[1]);
for (const v of NODES) {
  for (const blk of (v.pre || [])) for (const n of blk) {
    if (typeof n === 'number') {
      const p = byN.get(n);
      ok(!!p, `前置号 ${n} 不存在（${v.id}）`);
      if (p) ok(p.y < v.y, `前置向上：${p.id}(${p.x},${p.y}) → ${v.id}(${v.x},${v.y})`);
    } else {
      ok(ALL_FOCUS.has(n), `跨树前置 ${n} 在工程里找不到（${v.id}）`);
    }
  }
  for (const n of (v.mx || [])) ok(!!byN.get(n), `互斥号 ${n} 不存在（${v.id}）`);
}

/* 3. 极值列/行不留孤点（根格在顶行是预期的） */
const xs = NODES.map(v => v.x), ys = NODES.map(v => v.y);
const box = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
for (const edge of [box.x0, box.x1]) {
  const on = NODES.filter(v => v.x === edge);
  ok(on.length >= 2, `极值列 x=${edge} 只有 ${on.length} 格`);
}
for (const v of NODES.filter(v => v.y === box.y1)) ok((v.pre || []).length, `底行 ${v.id} 无前置（悬空）`);
const rootish = NODES.filter(v => !(v.pre || []).length);
ok(rootish.length <= 2, `无前置的根格过多：${rootish.map(v => v.id).join(',')}`);

/* 4. 图标：本簇专属图（gen_ibr_icons.cjs --pol 出）要贴图 + 图集帧都在；
      万一退回原版通用图，则查原版 goals 目录 */
const ownDir = path.join(ROOT, 'gfx/interface/goals/IBR');
const ownPng = new Set(fs.existsSync(ownDir) ? fs.readdirSync(ownDir).map(f => f.replace(/\.png$/i, '')) : []);
const atlas = fs.readFileSync(path.join(ROOT, 'interface/_ARF_goals/IBR_goals.gfx'), 'utf8');
for (const v of NODES) {
  if (!v.icon.startsWith('focus_IBR_')) continue;
  ok(ownPng.has(v.icon.replace(/^focus_/, '')), `缺贴图：gfx/interface/goals/IBR/${v.icon.replace(/^focus_/, '')}.png（${v.id}）`);
  ok(atlas.includes('name = "GFX_' + v.icon + '"'), `图集缺帧：GFX_${v.icon}（${v.id}）`);
}
let iconFiles = null;
try { iconFiles = new Set(fs.readdirSync(VANILLA_GOALS).map(f => f.toLowerCase().replace(/\.dds$/, ''))); }
catch (e) { problems.push('读不到原版 goals 目录：' + e.message); }
if (iconFiles) for (const v of NODES) if (!v.icon.startsWith('focus_IBR_'))
  ok(iconFiles.has(v.icon.toLowerCase()), `原版没有这张图：GFX_${v.icon}（${v.id}）`);

/* ---------------- 产物 1：shared_focus 文件 ---------------- */
const HEADER = `######################
## 伊比利亚（IBR）政治国策簇 —— 共享国策
## 由 common/national_focus/IBR.txt 末尾的 shared_focus 引用并入主树 IBR_torch_of_iberia
##
## 依据：《昨日海》剧情（审判庭 / 岛民互助会 / 阿戈尔打捞三方）。
## 34 格、两对互斥（线首 黄金世纪 ↔ 纯白之心；两个终幕 圣徒艾丽妮万岁 ↔ 女皇埃斯特菲尼娅万岁）；
##   草案见 Downloads/NEW_tree.txt（编号 1..34 的映射在下面的对照表）。
##
## 分批填充中：格名/坐标/前置/互斥已全部定稿，正文与效果按批次逐格补 ——
##   数据表里有 desc 的就生成 <id>_desc、有 fx 的就写进 completion_reward，两者都没有的仍是空块占位。
##   效果已按 LADDER/ONCE/DEBUFF 三张表铺满三条线（含两个终幕的换领袖事件）；国策正文 <id>_desc 目前只有根格。
##
## 版式：整簇落在主树与军事簇之间的空行带 —— 列带 x = ${box.x0}..${box.x1}，行带 y = ${box.y0}..${box.y1}。
##   主树占 y 0..7，军事簇占 y 15..21，发展度簇占 y 23..27 —— 本簇与三区的格点互不重叠，
##   由 docs/_ibr_political_check.cjs 硬校验（军事簇 2026-10-11 整簇右移过一格，别在这里抄死它的坐标）。
##   同排任意两格 Δx ≥ 2；根格 (${byN.get(1).x},${byN.get(1).y}) 落在包围盒水平中线上；
##   极值列不留孤点；连线一律向下（dy ≥ 1），汇聚格取双肩列的中点。
##
## 与草案的两处差别（草案里 25/27 的前置 26 排在它们下面，箭头朝上）：
##   25 圣徒卡门的密信、27 克莱门莎的援助 各下移一行到 y=${byN.get(25).y}，
##   26 筹备大选 仍留在 y=${byN.get(26).y}（照草案保持「无前置的第二入口」，同军事簇根格）。
##
## 图标 34 张已实装：GFX_focus_IBR_pol_*，100x100 PNG 在 gfx/interface/goals/IBR/，帧注册在 interface/_ARF_goals/IBR_goals.gfx；
##   字形/拉丁铭文/轴带色写在 docs/ibr_icon_data.cjs 的 POL 表，改表重跑 node docs/gen_ibr_icons.cjs --pol 即可（勿跑 --install）。
## 局部化：localisation/simp_chinese/ARF_IBR_political_l_simp_chinese.yml
##
## 生成器 docs/gen_ibr_political.cjs（改数据表重跑，勿手改产物）
######################
## 草案编号对照：
${NODES.map(v => `##   ${String(v.n).padStart(2)}  ${v.id}  ${v.name}`).join('\n')}
##`;

const blocks = NODES.map(v => {
  const L = [];
  L.push(`shared_focus = { #${v.name}`);
  L.push(`\tid = ${v.id}`);
  L.push(`\ticon = GFX_${v.icon}`);
  L.push(`\tx = ${v.x}`);
  L.push(`\ty = ${v.y}`);
  L.push(`\tcost = ${v.cost || COST}`);
  for (const blk of (v.pre || [])) {
    L.push('\tprerequisite = {');
    for (const n of blk) L.push(`\t\tfocus = ${typeof n === 'number' ? byN.get(n).id : n}`);
    L.push('\t}');
  }
  if (v.avail) { L.push('\tavailable = {'); for (const a of v.avail) L.push('\t\t' + a); L.push('\t}'); }
  if (v.mx && v.mx.length) {
    L.push('\tmutually_exclusive = {');
    for (const n of v.mx) L.push(`\t\tfocus = ${byN.get(n).id}`);
    L.push('\t}');
  }
  L.push('\tavailable_if_capitulated = yes');
  L.push('');
  L.push('\tai_will_do = {');
  L.push('\t\tfactor = 1');
  L.push('\t}');
  L.push('');
  L.push('\tcompletion_reward = {');
  const fx = fxLines(v);
  if (fx.length) L.push(...fx);
  else L.push('\t\t# 效果待填充');
  L.push('\t}');
  L.push('}');
  return L.join('\n');
});

const SHARED_OUT = path.join(ROOT, 'common/national_focus/IBR_political_shared.txt');
writeLf(SHARED_OUT, HEADER + '\n\n' + blocks.join('\n\n') + '\n');

/* ---------------- 产物 2：局部化（UTF-8 BOM + LF，只给格名） ---------------- */
const locLines = ['l_simp_chinese:', ''];
locLines.push('# ===== 伊比利亚政治国策簇（生成器 docs/gen_ibr_political.cjs，勿手改）=====');
for (const v of NODES) {
  locLines.push(` ${v.id}: "${v.name}"`);
  if (v.desc) locLines.push(` ${v.id}_desc: "${v.desc.replace(/"/g, '""')}"`);
}
locLines.push(' IBR_pol_pure_heart_tt: "审判庭开始清点自己：解锁决议组§Y审判庭大净化§!，审判官纯洁性、惩戒军纪律性与民众信任度各从 §Y50%§! 起算，每 7 天回落 §R1%§!。"');
/* 每格的效果说明：与 completion_reward 里的 custom_effect_tooltip 同源（describe()） */
for (const v of NODES) { const t = describe(v); if (t) locLines.push(` ${v.id}_fx_tt: "${t}"`); }
locLines.push('');
const LOC_OUT = path.join(ROOT, 'localisation/simp_chinese/ARF_IBR_political_l_simp_chinese.yml');
fs.writeFileSync(LOC_OUT, '﻿' + locLines.join('\n'), 'utf8');

/* ---------------- 产物 3：IBR.txt 里的 shared_focus 引用区 ---------------- */
const IBR = path.join(ROOT, 'common/national_focus/IBR.txt');
const MARK = 'IBR 政治国策簇';
let ibr = fs.readFileSync(IBR, 'utf8').replace(/\r/g, '');
const start = `	# ---- ${MARK} shared_focus 引用 自动生成 起 ----`;
const end = `	# ---- ${MARK} shared_focus 引用 自动生成 止 ----`;
const region = start + '\n' + NODES.map(v => `\tshared_focus = ${v.id}`).join('\n') + '\n' + end;
fs.writeFileSync(IBR + '.bak_poltree', fs.existsSync(IBR + '.bak_poltree') ? fs.readFileSync(IBR + '.bak_poltree') : ibr, 'utf8');
const si = ibr.indexOf(start), ei = ibr.indexOf(end);
if (si >= 0 && ei > si) {
  ibr = ibr.slice(0, si) + region + ibr.slice(ei + end.length);
} else {
  /* 插到 focus_tree 的收尾 } 之前（即文件最后一个单独成行的 }） */
  const tail = ibr.lastIndexOf('\n}');
  ok(tail > 0, '找不到 IBR.txt 的 focus_tree 收尾花括号');
  ibr = ibr.slice(0, tail) + '\n\n' + region + ibr.slice(tail);
}
writeLf(IBR, ibr);

/* ---------------- 产物 4：整树排版预览 SVG ---------------- */
const all = [] /* {id,x,y,kind} */;
function stripComments(s) { return s.split('\n').map(l => l.replace(/#.*/g, '')).join('\n'); }
function blocksOf(file, topKey) {
  const src = stripComments(fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r/g, '')).split('\n');
  const out = [];
  for (let i = 0; i < src.length; i++) {
    const m = new RegExp('^\\s*' + topKey + '\\s*=\\s*\\{').exec(src[i]);
    if (!m) continue;
    let d = 0, body = [];
    for (let j = i; j < src.length; j++) {
      const line = src[j];
      for (const ch of line) { if (ch === '{') d++; else if (ch === '}') d--; }
      body.push(line);
      if (d === 0 && j > i) break;
    }
    const text = body.join('\n');
    const g = (re) => { const r = re.exec(text); return r ? r[1] : null; };
    const id = g(/^\s*id\s*=\s*([A-Za-z0-9_.]+)/m);
    if (!id) continue;
    out.push({ id, x: +(g(/^\s*x\s*=\s*(-?\d+)/m) || 0), y: +(g(/^\s*y\s*=\s*(-?\d+)/m) || 0), text });
  }
  return out;
}
/* 主树：relative_position_id 递归展开 */
const main = blocksOf('common/national_focus/IBR.txt', 'focus');
const byId = new Map(main.map(v => [v.id, v]));
const rpOf = (v) => { const m = /^\s*relative_position_id\s*=\s*([A-Za-z0-9_]+)/m.exec(v.text); return m ? m[1] : null; };
function absolute(v, seen) {
  seen = seen || new Set();
  const rp = rpOf(v);
  if (!rp || seen.has(rp) || !byId.has(rp)) return { x: v.x, y: v.y };
  seen.add(rp);
  const p = absolute(byId.get(rp), seen);
  return { x: p.x + v.x, y: p.y + v.y };
}
main.forEach(v => { const a = absolute(v); all.push({ id: v.id, x: a.x, y: a.y, kind: 'main' }); });
blocksOf('common/national_focus/IBR_military_shared.txt', 'shared_focus')
  .forEach(v => all.push({ id: v.id, x: v.x, y: v.y, kind: 'mil' }));
blocksOf('common/national_focus/IBR_political_shared.txt', 'shared_focus')
  .forEach(v => all.push({ id: v.id, x: v.x, y: v.y, kind: 'pol' }));
/* 发展度簇：基准位 + 本树的 offset */
blocksOf('common/national_focus/DEV_development_shared.txt', 'shared_focus').forEach(v => {
  const m = /offset\s*=\s*\{[^}]*?x\s*=\s*(-?\d+)[^}]*?y\s*=\s*(-?\d+)[^}]*?has_focus_tree\s*=\s*IBR_torch_of_iberia/.exec(v.text);
  if (m) all.push({ id: v.id, x: v.x + (+m[1]), y: v.y + (+m[2]), kind: 'dev' });
});
/* 撞格总检查（四区合并） */
const merged = new Map();
for (const p of all) {
  const k = p.x + ',' + p.y;
  if (merged.has(k)) problems.push(`整树撞格 ${k}: ${merged.get(k)} / ${p.id}`);
  else merged.set(k, p.id);
}

const COLORS = { main: ['#3b4c5e', '#c9b071'], mil: ['#394b3a', '#9fc08a'], dev: ['#4a3f56', '#c3a3d6'], pol: ['#5a3f3a', '#e8b07a'] };
const SX = 92, SY = 62, BW = 86, BH = 54, PAD = 60;
const ax0 = Math.min(...all.map(p => p.x)), ax1 = Math.max(...all.map(p => p.x));
const ay0 = Math.min(...all.map(p => p.y)), ay1 = Math.max(...all.map(p => p.y));
const W = (ax1 - ax0 + 1) * SX + PAD * 2, H = (ay1 - ay0 + 1) * SY + PAD * 2 + 40;
const px = x => PAD + (x - ax0) * SX + (SX - BW) / 2;
const py = y => PAD + 40 + (y - ay0) * SY;
const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Microsoft YaHei,Noto Sans CJK SC,sans-serif">`);
svg.push(`<rect width="${W}" height="${H}" fill="#141d26"/>`);
const posMap = new Map(NODES.map(v => [v.id, v]));
/* 连线（政治簇） */
for (const v of NODES) for (const blk of (v.pre || [])) for (const n of blk) {
  /* 前置可以是簇内编号，也可以是主树国策 id（如 IBR_eternal_lighthouse），后者从 all 里查绝对坐标 */
  const p = typeof n === 'number' ? byN.get(n) : all.find(q => q.id === n);
  if (!p) continue;
  svg.push(`<line x1="${px(p.x) + BW / 2}" y1="${py(p.y) + BH}" x2="${px(v.x) + BW / 2}" y2="${py(v.y)}" stroke="#e8b07a" stroke-width="2"/>`);
}
/* 互斥：红色虚线，一对只画一次 */
for (const v of NODES) for (const n of (v.mx || [])) {
  const p = byN.get(n);
  if (!p || p.n < v.n) continue;
  svg.push(`<line x1="${px(p.x) + BW / 2}" y1="${py(p.y) + BH / 2}" x2="${px(v.x) + BW / 2}" y2="${py(v.y) + BH / 2}" stroke="#c2503f" stroke-width="2" stroke-dasharray="6 5"/>`);
}
for (const p of all) {
  const [fill, stroke] = COLORS[p.kind];
  svg.push(`<g><rect x="${px(p.x)}" y="${py(p.y)}" width="${BW}" height="${BH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
    `<text x="${px(p.x) + BW / 2}" y="${py(p.y) + BH / 2 + 4}" fill="#eef2f5" font-size="10" text-anchor="middle">${p.kind === 'pol' ? posMap.get(p.id).name : p.id.replace(/^IBR_|^DEV_/, '')}</text></g>`);
}
svg.push(`<text x="${PAD}" y="28" fill="#eef2f5" font-size="18" font-weight="bold">IBR_torch_of_iberia 全树排版（主树 / 军事簇 / 政治簇 / 发展度簇）</text>`);
const legend = [['main', '主树'], ['mil', '军事簇'], ['pol', '政治簇（本次新增）'], ['dev', '发展度簇']];
svg.push(legend.map(([k, t], i) =>
  `<rect x="${PAD + i * 250}" y="${H - 30}" width="18" height="12" fill="${COLORS[k][0]}" stroke="${COLORS[k][1]}"/><text x="${PAD + i * 250 + 24}" y="${H - 20}" fill="#cfdbe4" font-size="12">${t}</text>`).join(''));
svg.push('</svg>');
writeLf(path.join(ROOT, 'docs/_ibr_political_layout.svg'), svg.join('\n'));

/* ---------------- 报告 ---------------- */
console.log(`政治簇 ${NODES.length} 格 · x ${box.x0}..${box.x1} · y ${box.y0}..${box.y1} · 根 ${byN.get(1).id}(${byN.get(1).x},${byN.get(1).y})`);
console.log(`无前置：${rootish.map(v => v.n + ':' + v.id).join(', ')}`);
console.log('整树格数：' + all.length + '（主树 ' + main.length + ' / 军事 ' + blocksOf('common/national_focus/IBR_military_shared.txt', 'shared_focus').length +
  ' / 政治 ' + NODES.length + ' / 发展度 ' + all.filter(p => p.kind === 'dev').length + '）');
if (problems.length) { console.log('\n⚠ 问题 ' + problems.length + ' 条：'); problems.forEach(p => console.log('  - ' + p)); process.exitCode = 1; }
else console.log('✔ 校验通过：撞格 / 同排间距 / 前置方向 / 极值孤点 / 图标存在性 / 四区无重叠');

function writeLf(file, text) {
  fs.writeFileSync(file, text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'), 'utf8');
}
