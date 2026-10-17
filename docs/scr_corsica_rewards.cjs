'use strict';

/**
 * 猩红剧团「科西嘉线」/「转线」国策奖励真源。
 * 由 docs/gen_scr_corsica.cjs 与 docs/gen_scr_switch.cjs 读取并写入 shared_focus 的 completion_reward。
 * 数组里每一行是一条脚本效果，生成器统一缩进后输出。
 */

const timed = (idea, days) => `if = { limit = { has_idea = ${idea} } remove_idea = ${idea} } add_timed_idea = { idea = ${idea} days = ${days} }`;
const idea = (id) => `add_ideas = ${id}`;
const pp = (n) => `add_political_power = ${n}`;
const stab = (n) => `add_stability = ${n}`;
const ws = (n) => `add_war_support = ${n}`;
const xpA = (n) => `army_experience = ${n}`;
const xpN = (n) => `navy_experience = ${n}`;

// 新科西嘉精神：主 / lite / 军 / 谍
function dyn(main = 0, lite = 0, army = 0, int = 0) {
  const r = [];
  if (main) r.push(`add_to_variable = { SCR_dyn_corsica = ${main} tooltip = SCR_dyn_corsica_value_tt }`);
  if (lite) r.push(`add_to_variable = { SCR_dyn_corsica_lite = ${lite} tooltip = SCR_dyn_corsica_lite_value_tt }`);
  if (army) r.push(`add_to_variable = { SCR_dyn_corsica_army = ${army} tooltip = SCR_dyn_corsica_army_value_tt }`);
  if (int) r.push(`add_to_variable = { SCR_dyn_corsica_int = ${int} tooltip = SCR_dyn_corsica_int_value_tt }`);
  r.push('add_dynamic_modifier = { modifier = SCR_dyn_corsica }');
  return r;
}

// 既有四幕精神的小幅加值
function oldDyn(name, value, tooltip, modifier) {
  return [
    `add_to_variable = { ${name} = ${value} tooltip = ${tooltip} }`,
    `add_dynamic_modifier = { modifier = ${modifier || name} }`,
  ];
}

// 经济线升级精神：每格都给少量产出 / 科研 / 消费品
function quietEcon() {
  return [
    'add_to_variable = { SCR_dyn_corsica_economy = 0.008 tooltip = SCR_dyn_corsica_economy_value_tt }',
    'add_to_variable = { SCR_dyn_corsica_economy_lite = 0.003 tooltip = SCR_dyn_corsica_economy_lite_value_tt }',
    'add_to_variable = { SCR_dyn_corsica_economy_cg = -0.003 tooltip = SCR_dyn_corsica_economy_cg_value_tt }',
    'add_dynamic_modifier = { modifier = SCR_dyn_corsica_economy }',
  ];
}

// 军事线升级精神：每格都给少量陆军三维 / 经验 / 征兵 / 挖掘
function quietMil() {
  return [
    'add_to_variable = { SCR_dyn_corsica_military = 0.006 tooltip = SCR_dyn_corsica_military_value_tt }',
    'add_to_variable = { SCR_dyn_corsica_military_lite = 0.003 tooltip = SCR_dyn_corsica_military_lite_value_tt }',
    'add_dynamic_modifier = { modifier = SCR_dyn_corsica_military }',
  ];
}

// 其余树：保证每格也有一点点总精神成长
function quietGen() {
  return [
    'add_to_variable = { SCR_dyn_corsica = 0.005 tooltip = SCR_dyn_corsica_value_tt }',
    'add_dynamic_modifier = { modifier = SCR_dyn_corsica }',
  ];
}

const REWARDS = {
  // ---------- 复国与情报 ----------
  1: [
    pp(50), stab(0.05), ws(0.05),
    ...dyn(0.02, 0.01),
    'unlock_decision_category_tooltip = SCR_corsica_category',
    'set_country_flag = SCR_corsica_act1_flag',
  ],
  2: [pp(25), timed('SCR_timed_gaul_name', 90), ...dyn(0.01)],
  3: [pp(40), stab(0.05), 'add_to_variable = { SCR_inspiration = 1 tooltip = SCR_inspiration_gain_tt }', ...dyn(0.01)],
  4: [timed('SCR_timed_scavenging', 90), pp(25), ...oldDyn('SCR_dyn_rebuild_lite', 0.01, 'SCR_dyn_rebuild_lite_value_tt', 'SCR_dyn_rebuild')],
  5: ['custom_effect_tooltip = SCR_militia_unlock_tt', 'hidden_effect = { SCR_militia_unlock_effect = yes }', pp(25)],
  6: [pp(25), ...dyn(0.01, 0, 0, 1), timed('SCR_timed_night_ops', 90)],
  7: [pp(25), ...dyn(0.01, 0, 0, 1)],
  8: [pp(100), stab(0.10), ws(0.10), ...dyn(0.02), timed('SCR_timed_return', 180), 'set_country_flag = SCR_gaul_returned_flag'],
  9: [pp(50), xpA(25), ...dyn(0.01)],
  10: [idea('SCR_bloody_diplomacy'), ws(0.05), ...dyn(0, 0, 0, 1)],
  11: [idea('SCR_eternal_tour'), pp(25), ws(0.05)],

  // ---------- 新经济 ----------
  12: [pp(50), 'add_to_variable = { SCR_dyn_rebuild = 0.02 tooltip = SCR_dyn_rebuild_value_tt }', 'add_to_variable = { SCR_dyn_rebuild_lite = 0.01 tooltip = SCR_dyn_rebuild_lite_value_tt }', 'add_dynamic_modifier = { modifier = SCR_dyn_rebuild }'],
  13: ['add_research_slot = 1', ...oldDyn('SCR_dyn_rebuild_lite', 0.01, 'SCR_dyn_rebuild_lite_value_tt', 'SCR_dyn_rebuild'), pp(25)],
  14: [idea('SCR_harvest_festival'), pp(25)],
  15: ['capital_scope = { add_extra_state_shared_building_slots = 2 add_building = { building = industrial_complex level = 1 instant = yes } }', pp(25), ...oldDyn('SCR_dyn_rebuild', 0.01, 'SCR_dyn_rebuild_value_tt')],
  16: ['capital_scope = { add_extra_state_shared_building_slots = 1 add_building_construction = { type = dockyard level = 1 instant_build = yes } }', xpN(25), ...dyn(0, 0, 0, 1)],
  17: ['capital_scope = { add_resource = { type = steel amount = 24 } add_resource = { type = aluminium amount = 16 } add_extra_state_shared_building_slots = 2 }', timed('SCR_timed_scavenging', 90)],
  18: ['add_research_slot = 1', idea('SCR_puppet_craft'), pp(25)],
  19: [pp(50), stab(0.05), timed('SCR_timed_three_dawns', 180)],
  20: ['add_to_variable = { SCR_dyn_army_supply = -0.05 }', 'add_dynamic_modifier = { modifier = SCR_dyn_army }', ...oldDyn('SCR_dyn_rebuild_lite', 0.01, 'SCR_dyn_rebuild_lite_value_tt', 'SCR_dyn_rebuild'), pp(25)],
  21: ['capital_scope = { add_extra_state_shared_building_slots = 2 add_building = { building = arms_factory level = 2 instant = yes } }', ...oldDyn('SCR_dyn_rebuild', 0.01, 'SCR_dyn_rebuild_value_tt'), timed('SCR_timed_overload', 180)],
  22: ['add_equipment_to_stockpile = { type = artillery_equipment amount = 500 }', timed('SCR_timed_three_dawns', 180), pp(25)],
  23: [idea('SCR_armament_decree_1'), xpA(15), ...dyn(0, 0, 0.01)],
  24: [pp(75), ws(0.10), timed('SCR_timed_blazing_sun', 90)],
  25: [pp(50), timed('SCR_timed_three_dawns', 180), ...oldDyn('SCR_dyn_rebuild_lite', 0.01, 'SCR_dyn_rebuild_lite_value_tt', 'SCR_dyn_rebuild')],
  26: [idea('SCR_puppet_legion'), stab(0.05), timed('SCR_timed_infected_amnesty', 180)],

  // ---------- 动员与战争机器 ----------
  27: ['capital_scope = { add_extra_state_shared_building_slots = 2 add_building = { building = industrial_complex level = 2 instant = yes } }', ...oldDyn('SCR_dyn_rebuild_lite', 0.01, 'SCR_dyn_rebuild_lite_value_tt', 'SCR_dyn_rebuild'), pp(25)],
  28: ['capital_scope = { add_extra_state_shared_building_slots = 2 add_building = { building = arms_factory level = 2 instant = yes } }', ...dyn(0, 0, 0, 1), pp(25)],
  29: [timed('SCR_timed_overload', 180), ws(0.05), pp(25)],
  30: [idea('SCR_blood_of_gaul'), pp(25)],
  31: [idea('SCR_banner_of_empire'), timed('SCR_timed_mobilization', 180)],
  32: [xpA(50), ...dyn(0, 0.01, 0.02), pp(25)],
  33: [
    idea('SCR_triumph'), xpA(25), ...dyn(0, 0, 0.03),
    'add_to_variable = { SCR_dyn_gaul = 0.03 tooltip = SCR_dyn_gaul_value_tt }',
    'add_to_variable = { SCR_dyn_gaul_lite = 0.02 tooltip = SCR_dyn_gaul_lite_value_tt }',
    'add_dynamic_modifier = { modifier = SCR_dyn_gaul_gaul }',
    'custom_effect_tooltip = SCR_vanguard_recruit_tt', 'custom_effect_tooltip = SCR_corsica_dolls_tt', 'hidden_effect = { SCR_vanguard_guard_recruit_effect = yes SCR_dolls_recruit_effect = yes }', pp(100),
  ],
  72: [pp(50), stab(-0.05), ws(0.10), timed('SCR_timed_mobilization', 180), 'add_to_variable = { SCR_dyn_rebuild_neg = -0.05 }', 'add_dynamic_modifier = { modifier = SCR_dyn_rebuild }'],
  73: [pp(100), stab(0.05), timed('SCR_timed_terror', 90), ...dyn(0, 0, 0, 1)],
  74: [timed('SCR_timed_borrowed_time', 365), pp(50), stab(-0.05)],

  // ---------- 政治线 ----------
  34: [pp(75), ...dyn(0.02), 'set_country_flag = SCR_lucian_play_flag'],
  35: [pp(75), ...dyn(0.02), 'set_country_flag = SCR_corsica_play_flag'],
  36: [pp(50), stab(0.05), idea('SCR_oath_of_restoration'), ...dyn(0.01)],
  37: [pp(50), stab(0.05), idea('SCR_imperial_banner'), ...dyn(0.01)],
  42: [pp(100), stab(0.10), ws(0.05), idea('SCR_gallic_echo'), ...dyn(0.02)],
  38: [pp(50), stab(-0.05), ws(0.05), ...dyn(0, 0, 0, 2), 'set_country_flag = SCR_lucian_path_flag'],
  39: [pp(50), stab(0.05), 'set_country_flag = SCR_corsica_path_flag'],
  40: [
    pp(100), idea('SCR_triumph'), ...dyn(0.03),
    'add_to_variable = { SCR_dyn_gaul = 0.05 tooltip = SCR_dyn_gaul_value_tt }',
    'add_dynamic_modifier = { modifier = SCR_dyn_gaul_gaul }',
    'set_country_flag = SCR_gaul_path_lucian_flag',
    'hidden_effect = { country_event = { id = scr.26 } }',
  ],
  41: [
    pp(100), idea('SCR_celebration_of_all_things'), ...dyn(0.03),
    'set_country_flag = SCR_gaul_reshaped_flag',
    'set_country_flag = SCR_gaul_path_corsica_flag',
    'hidden_effect = { country_event = { id = scr.27 } }',
  ],

  // ---------- 军事线 ----------
  44: [pp(50), xpA(25), ...dyn(0, 0, 0.02)],
  45: [idea('SCR_blood_diamond_legacy'), xpA(25), ...dyn(0, 0, 0.01)],
  46: [pp(50), ws(0.05), timed('SCR_timed_blazing_sun', 90)],
  47: [idea('SCR_star_surgery'), xpA(25), ...dyn(0, 0.01)],
  48: [idea('SCR_flyleaf_masters'), ...dyn(0, 0, 0, 1)],
  49: [pp(25), ...dyn(0, 0, 0, 2), timed('SCR_timed_night_ops', 90)],
  50: [idea('SCR_blood_altar'), pp(25)],
  51: [timed('SCR_timed_blazing_sun', 90), xpA(25), ...dyn(0, 0, 0.01)],
  52: [xpA(15), ...dyn(0, 0, 0.01, 1)],
  53: [timed('SCR_timed_night_ops', 90), ...dyn(0, 0, 0.01), pp(25)],
  54: ['capital_scope = { add_extra_state_shared_building_slots = 2 add_building = { building = arms_factory level = 2 instant = yes } }', idea('SCR_armament_decree_1'), pp(25)],
  55: ['capital_scope = { add_extra_state_shared_building_slots = 1 add_building_construction = { type = dockyard level = 1 instant_build = yes } }', xpN(50), ...dyn(0, 0, 0.01)],
  56: [xpN(75), 'capital_scope = { add_extra_state_shared_building_slots = 1 add_building_construction = { type = dockyard level = 1 instant_build = yes } }', ...dyn(0, 0, 0.01)],
  57: ['custom_effect_tooltip = SCR_corsica_vanguard_unlock_tt', 'hidden_effect = { SCR_vanguard_guard_unlock_effect = yes }', pp(25), ...dyn(0, 0, 0.01)],
  58: [idea('SCR_temple_of_pain'), xpA(25), ws(0.05)],
  59: [xpN(75), ...dyn(0, 0, 0, 1)],
  60: [timed('SCR_timed_three_dawns', 180), xpN(50), ...oldDyn('SCR_dyn_rebuild_lite', 0.01, 'SCR_dyn_rebuild_lite_value_tt', 'SCR_dyn_rebuild')],
  61: [xpA(50), xpN(50), idea('SCR_puppet_craft'), ...dyn(0, 0, 0.01)],
  62: [pp(100), ws(0.10), timed('SCR_timed_parade', 90), 'set_country_flag = SCR_parade_done_flag'],
  63: ['custom_effect_tooltip = SCR_corsica_dolls_tt', 'hidden_effect = { SCR_dolls_recruit_effect = yes }', pp(25), ...dyn(0, 0, 0.01)],
  64: ['custom_effect_tooltip = SCR_vanguard_recruit_tt', 'hidden_effect = { SCR_vanguard_guard_cap_effect = yes SCR_vanguard_guard_recruit_effect = yes }', idea('SCR_blood_of_gaul'), ...dyn(0, 0, 0.01)],
  65: [pp(50), ws(0.05), ...dyn(0, 0, 0.02), 'set_country_flag = SCR_final_offensive_flag'],

  // ---------- 外部线与终幕 ----------
  66: [idea('SCR_gallic_echo'), pp(25), timed('SCR_timed_gaul_name', 90)],
  67: [idea('SCR_shield_of_gallia'), xpA(25), timed('SCR_timed_exercise', 120)],
  68: [pp(75), ws(0.10), idea('SCR_oath_of_restoration'), 'set_country_flag = SCR_proclamation_flag', ...dyn(0.01)],
  69: [timed('SCR_timed_blazing_sun', 90), xpA(25), ...dyn(0, 0, 0.01)],
  70: [timed('SCR_timed_exercise', 120), xpA(50), ...dyn(0, 0, 0.01)],
  80: [
    'set_country_flag = SCR_second_four_emperors_flag',
    'add_to_variable = { SCR_dyn_gaul = 0.05 tooltip = SCR_dyn_gaul_value_tt }',
    'add_to_variable = { SCR_dyn_gaul_lite = 0.03 tooltip = SCR_dyn_gaul_lite_value_tt }',
    'add_dynamic_modifier = { modifier = SCR_dyn_gaul_gaul }',
    idea('SCR_triumph'), pp(100), ws(0.10), timed('SCR_timed_final_war', 365),
    'custom_effect_tooltip = SCR_vanguard_recruit_tt', 'custom_effect_tooltip = SCR_corsica_dolls_tt', 'custom_effect_tooltip = SCR_militia_unlock_tt', 'hidden_effect = { SCR_vanguard_guard_recruit_effect = yes SCR_dolls_recruit_effect = yes SCR_militia_unlock_effect = yes }',
    ,
  ],
  71: [timed('SCR_timed_burn_out', 365), ...dyn(0, 0, 0.03), 'add_to_variable = { SCR_dyn_gaul = 0.03 tooltip = SCR_dyn_gaul_value_tt }', 'add_dynamic_modifier = { modifier = SCR_dyn_gaul_gaul }', pp(50), stab(-0.05)],
  76: [...dyn(0, 0, 0, 2), timed('SCR_timed_three_dawns', 180), pp(25)],
  77: [timed('SCR_timed_blazing_sun', 90), 'custom_effect_tooltip = SCR_militia_unlock_tt', 'hidden_effect = { SCR_militia_unlock_effect = yes }', pp(25)],
  78: ['capital_scope = { add_building_construction = { type = bunker level = 3 instant_build = yes } add_dynamic_modifier = { modifier = SCR_londinium_heart } }', pp(25), stab(0.05)],
  79: [...dyn(0, 0, 0, 2), idea('SCR_mirror_man'), timed('SCR_timed_night_ops', 90)],
};

const SWITCH_REWARDS = {
  1: [pp(50), ...dyn(0.01), 'unlock_decision_category_tooltip = SCR_corsica_category'],
  2: [pp(75), ws(0.05), ...dyn(0.01), timed('SCR_timed_blazing_sun', 90)],
  3: [pp(50), ...dyn(0, 0.01)],
  4: [idea('SCR_undying_art'), ...dyn(0.01), pp(25)],
  5: [pp(75), ...dyn(0.01, 0, 0.01), 'set_country_flag = SCR_corsica_star_flag'],
  6: [
    pp(100), idea('SCR_celebration_of_all_things'), ...dyn(0.03),
    'set_country_flag = SCR_corsica_ending_flag', 'set_country_flag = SCR_gaul_reshaped_flag',
    timed('SCR_timed_coronation', 180),
    'hidden_effect = { country_event = { id = scr.27 } }',
  ],
};

// 每个国策都至少给一点升级型精神数值：
// 经济簇 → 新经济秩序；军事簇 → 高卢战争机器；其余 → 世界之都的倒影。
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const ECON_IDS = new Set([...range(12, 33), 72, 73, 74]);
const MIL_IDS = new Set([...range(44, 65), ...range(66, 71), ...range(76, 80)]);
for (const [k, arr] of Object.entries(REWARDS)) {
  const n = Number(k);
  if (ECON_IDS.has(n)) {
    if (!arr.some((l) => l.includes('SCR_dyn_corsica_economy'))) arr.push(...quietEcon());
  } else if (MIL_IDS.has(n)) {
    if (!arr.some((l) => l.includes('SCR_dyn_corsica_military'))) arr.push(...quietMil());
  } else if (!arr.some((l) => l.includes('SCR_dyn_corsica') && !l.includes('SCR_dyn_corsica_economy') && !l.includes('SCR_dyn_corsica_military'))) {
    arr.push(...quietGen());
  }
}

module.exports = { REWARDS, SWITCH_REWARDS };
