/* IBR 图标数据表：114 张国策 + 38 张民族精神 → 字形 / 拉丁铭文 / 档位
 * 真源：docs/gen_ibr_icons.cjs 读取本表；改表重跑即可。
 * 轴带（route）按解析后 x 自动落带：eco ≤-9｜pol -7..-1｜army 1..7｜sea 9..15｜abyss ≥18
 * seq = 该格在本线内的档位（右下余烬刻度），0 = 不画刻度
 */

/* —— 主树 85 格（id → 字形, 拉丁, 档位） —— */
const MAIN = {
	IBR_crossroads: ['arch', 'ITER', 0],

	/* 经济轴 */
	IBR_axis_recovery: ['wheat', 'RESTAU', 0],
	IBR_salt_land_reclamation: ['plow', 'SALS', 1],
	IBR_inland_survey: ['pick', 'FOSSA', 1],
	IBR_rebuild_fishing_ports: ['fishing', 'PORTUS', 2],
	IBR_doblon_credit: ['coin', 'NUMMUS', 2],
	IBR_originium_refinery: ['crystal', 'ORIGINI', 2],
	IBR_rum_industry: ['barrel', 'VINUM', 3],
	IBR_agri_scholars: ['lens', 'SCIENTIA', 3],
	IBR_sargon_engineers: ['gear', 'FABER', 3],
	IBR_steel_concessions: ['scroll', 'FERRO', 3],
	IBR_victoria_trade: ['globe', 'MERCAT', 4],
	IBR_salt_ship_mass_production: ['engine', 'AMBUL', 4],
	IBR_military_industrial_draft: ['factory', 'BELLI', 4],
	IBR_harvest_of_revival: ['sheaf', 'MESIS', 5],
	IBR_energy_independence: ['bolt', 'VIS', 5],

	/* 政治轴 */
	IBR_axis_soul: ['eyes_open', 'ANIMA', 0],
	IBR_will_of_the_saint: ['mitre', 'SANCTUS', 1],
	IBR_carmen_reform_declaration: ['scroll', 'EDICTUM', 1],
	IBR_fortify_faith_border: ['brick_wall', 'LIMES', 2],
	IBR_shadow_of_castile: ['horus_eye', 'UMBRA', 2],
	IBR_abolish_islander_laws: ['flame', 'ABOLIT', 2],
	IBR_royal_ties: ['hands', 'JUGLUM', 2],
	IBR_purify_heretics: ['pyre', 'PURGA', 3],
	IBR_carlist_pact: ['key', 'CONJURA', 3],
	IBR_invite_overseas_scholars: ['quill', 'VOCAT', 3],
	IBR_constitution_draft: ['tablet', 'FOEDUS', 3],
	IBR_inquisition_army_authority: ['cross_swords', 'AUCTOR', 4],
	IBR_religious_tolerance: ['scales', 'TOLERAN', 4],
	IBR_free_press: ['press', 'LIBER', 4],
	IBR_sever_laterano: ['broken_staff', 'SECTIO', 5],
	IBR_holy_arsenal: ['stockpile', 'ARSENAL', 5],
	IBR_laterano_reconciliation: ['gate', 'REDO', 5],
	IBR_eternal_lighthouse: ['pharos', 'PHARUS', 6],
	IBR_crown_carlos: ['crown', 'CAROLUS', 6],
	IBR_new_iberia_declaration: ['banner', 'LIBERTA', 6],

	/* 陆军轴 */
	IBR_axis_army: ['cross_swords', 'GLADIUS', 0],
	IBR_supreme_fencing_academy: ['sword', 'ACADEM', 1],
	IBR_rebuild_defense_army: ['cohort', 'ORDO MIL', 1],
	IBR_inquisitor_selection: ['medal', 'EXAMEN', 2],
	IBR_hand_cannon_license: ['cannon', 'SCLOPUS', 2],
	IBR_levy_reform: ['ledger', 'LECTUS', 2],
	IBR_grand_formation_reform: ['shield', 'PHALAN', 3],
	IBR_lantern_staff_research: ['lantern', 'LUCERNA', 3],
	IBR_penitent_expansion: ['pike', 'DILATA', 3],
	IBR_holy_sword_order: ['helmet', 'ORDENS', 4],
	IBR_sword_masters_legacy: ['key', 'TRADITIO', 4],
	IBR_salt_mechanized_brigade: ['engine', 'SALSAM', 4],
	IBR_coastal_defense_system: ['fort', 'MUNIMEN', 4],
	IBR_guardians_of_the_dawn: ['bell', 'VIGIL', 5],
	IBR_levy_en_masse: ['scythe', 'COGIS', 5],

	/* 海权轴 */
	IBR_axis_sea: ['waves', 'MARE', 0],
	IBR_salvage_ships: ['dock', 'REFICTA', 1],
	IBR_lost_blueprints: ['chart', 'CARTA', 1],
	IBR_rebuild_shipyards: ['wharf', 'NAVALE', 2],
	IBR_abyss_beacon: ['sonar', 'SPECULA', 2],
	IBR_recall_shipwrights: ['anvil', 'ARTIFEX', 2],
	IBR_corsair_decree: ['skull', 'PIRATA', 3],
	IBR_restore_lighthouse_network: ['pharos', 'PHARI', 3],
	IBR_underwater_tech: ['horus_eye', 'SPECU', 3],
	IBR_stultifera_sighted: ['lens', 'VISIO', 3],
	IBR_grand_fleet_concept: ['fleet_row', 'CLASSIS MAG', 4],
	IBR_line_of_battle: ['cannon_row', 'ORDIN', 4],
	IBR_energy_system_rebuild: ['engine', 'VIS NOV', 4],
	IBR_boarding_expedition: ['pike', 'SCALAE', 4],
	IBR_naval_storm_academy: ['sextant', 'MAGISTER', 5],
	IBR_amphibious_design: ['torpedo', 'UNDARUM', 5],
	IBR_breogan_legacy: ['key', 'BREOGAN', 5],
	IBR_golden_fleet_sails: ['galleon', 'CLASSIS AUR', 6],
	IBR_deep_sea_fleet: ['flagship', 'PROFUND', 6],
	IBR_stultifera_relance: ['compass', 'RELANS', 6],

	/* 海嗣战争轴 */
	IBR_letter_to_iberia: ['scroll', 'EPISTULA', 0],
	IBR_penitent_assembly: ['bell', 'CONCIO', 1],
	IBR_lighthouse_supply_system: ['stockpile', 'ANNONA', 1],
	IBR_iberian_prayer: ['hands', 'ORATIO', 1],
	IBR_coastal_mobilization: ['fort', 'LITORIS', 2],
	IBR_arms_capacity_integration: ['factory', 'FABRICA', 2],
	IBR_inquisitor_sermon: ['lantern', 'SERMO', 2],
	IBR_inquisitor_special_recruit: ['helmet', 'ELECTI', 3],
	IBR_seaborn_biology_research: ['serpent', 'BIO', 3],
	IBR_rebuild_heroic_memory: ['tomb', 'MEMORIA', 3],
	IBR_total_mobilization_decree: ['banner', 'COGIS TOT', 4],
	IBR_aegir_aid_coordination: ['buoy', 'AEGIR', 4],
	IBR_children_lighthouse_education: ['book', 'PUER', 4],
	IBR_wash_the_tide_operation: ['waves', 'TIDIS', 5],
};

/* —— 军事簇 29 格 —— */
const MIL = {
	IBR_mil_root: ['coin', 'AURUM', 0],
	IBR_mil_lessons_1: ['ledger', 'NOMEN', 1], IBR_mil_lessons_2: ['scroll', 'ARCHIV', 2],
	IBR_mil_lessons_3: ['cannon', 'FULMEN', 3], IBR_mil_lessons_4: ['pharos', 'EXCUB', 4],
	IBR_mil_lessons_5: ['compass', 'STUDIUM', 5], IBR_mil_lessons_6: ['medal', 'LAURUS', 6],
	IBR_mil_lessons_7: ['keel', 'CARINA', 7], IBR_mil_lessons_8: ['lens', 'DOCTRINA', 8],
	IBR_mil_lessons_9: ['tablet', 'MANUAL', 9],
	IBR_mil_shield_1: ['banner', 'MISSUM', 1], IBR_mil_shield_2: ['mount', 'MONS', 2],
	IBR_mil_shield_3: ['fort', 'TURRIS', 3], IBR_mil_shield_4: ['anvil', 'FORGIS', 4],
	IBR_mil_shield_5: ['chain', 'CURA', 5], IBR_mil_shield_6: ['horseshoe', 'EQUUS', 6],
	IBR_mil_shield_7: ['crutches', 'MISER', 7], IBR_mil_shield_8: ['cohort', 'ORDO', 8],
	IBR_mil_shield_9: ['shield', 'LEGIO', 9],
	IBR_mil_navy_1: ['anchor', 'GURGES', 1], IBR_mil_navy_2: ['buoy', 'SODALIS', 2],
	IBR_mil_navy_3: ['chart', 'MENSURA', 3], IBR_mil_navy_4: ['torpedo', 'NOX', 4],
	IBR_mil_navy_5: ['dock', 'NAVAL', 5], IBR_mil_navy_6: ['fleet_row', 'COMITES', 6],
	IBR_mil_navy_7: ['flagship', 'DUCE', 7], IBR_mil_navy_8: ['hourglass', 'ANNUS', 8],
	IBR_mil_navy_9: ['galleon', 'CLASSIS', 9],
	IBR_mil_final: ['sun', 'SINE FINE', 0],
};

/* —— 军事簇三线的轴带色 —— */
const MIL_ROUTE = id => (id.includes('_lessons_') ? 'mil_a' : id.includes('_shield_') ? 'mil_b' : id.includes('_navy_') ? 'mil_c' : 'head');

/* —— 38 张民族精神（id → 字形, 档位；60x60，无拉丁铭文） —— */
const SPIRIT = {
	IBR_aftermath_of_Profound_Silence: ['hourglass', 0],
	IBR_aftermath_mended: ['bonfire', 0],
	IBR_beacon_network: ['pharos', 0],
	IBR_lighthouse_works: ['dock', 0],
	IBR_specimen_analysis: ['urn', 0],
	IBR_threat_of_deep_sea_church: ['spiral', 0],
	IBR_threat_of_deep_sea_church_surge: ['serpent', 0],
	IBR_church_crushed: ['pyre', 0],
	IBR_unauthorized_government: ['banner', 0],
	IBR_inquisition_iron_curtain: ['fort', 0],
	IBR_holy_see_idea: ['mitre', 0],
	IBR_independent_church: ['gate', 0],
	IBR_purge_scholar_drain: ['quill', 0],
	IBR_reform_unrest: ['flame', 0],
	IBR_lost_maritime_heritage: ['anchor', 0],
	IBR_legacy_of_supreme_swordsmanship: ['sword', 0],
	IBR_schism_ended: ['knot', 0],
	IBR_golden_age_1: ['coin', 1], IBR_golden_age_2: ['coin', 2], IBR_golden_age_3: ['coin', 3], IBR_golden_age_4: ['coin', 4],
	IBR_inquisition_fire_1: ['cross_swords', 1], IBR_inquisition_fire_2: ['cross_swords', 2],
	IBR_inquisition_fire_3: ['cross_swords', 3], IBR_inquisition_fire_4: ['cross_swords', 4],
	IBR_deep_fleet_1: ['galleon', 1], IBR_deep_fleet_2: ['galleon', 2], IBR_deep_fleet_3: ['galleon', 3],
	IBR_deep_fleet_4: ['galleon', 4], IBR_deep_fleet_5: ['galleon', 5],
	IBR_tide_splitter_1: ['pike', 1], IBR_tide_splitter_2: ['pike', 2], IBR_tide_splitter_3: ['pike', 3], IBR_tide_splitter_4: ['pike', 4],
	/* 军事簇五个可成长精神 */
	IBR_hollow_roster: ['ledger', 0],
	IBR_reclaimed_sea_heritage: ['waves', 0],
	IBR_shield_of_the_south: ['cohort', 0],
	IBR_armada_reforged: ['flagship', 0],
	IBR_sun_over_the_south: ['sun', 0],
};

/* 精神图取色：按语义归到最近的轴带 */
const SPIRIT_ROUTE = {
	IBR_aftermath_of_Profound_Silence: 'mil_a', IBR_aftermath_mended: 'mil_a', IBR_beacon_network: 'faith',
	IBR_lighthouse_works: 'sea', IBR_threat_of_deep_sea_church: 'abyss', IBR_threat_of_deep_sea_church_surge: 'abyss',
	IBR_church_crushed: 'faith', IBR_unauthorized_government: 'pol', IBR_inquisition_iron_curtain: 'faith',
	IBR_holy_see_idea: 'faith', IBR_independent_church: 'pol', IBR_purge_scholar_drain: 'pol', IBR_reform_unrest: 'pol',
	IBR_lost_maritime_heritage: 'sea', IBR_legacy_of_supreme_swordsmanship: 'army', IBR_schism_ended: 'pol',
	IBR_hollow_roster: 'mil_a', IBR_reclaimed_sea_heritage: 'mil_c', IBR_shield_of_the_south: 'mil_b',
	IBR_armada_reforged: 'mil_c', IBR_sun_over_the_south: 'head',
};
const spiritRoute = id => SPIRIT_ROUTE[id] || (id.includes('golden_age') ? 'eco' : id.includes('inquisition_fire') ? 'army'
	: id.includes('deep_fleet') ? 'sea' : id.includes('tide_splitter') ? 'abyss' : 'pol');

/* —— 政治簇 34 格（IBR_pol_*，骨架见 common/national_focus/IBR_political_shared.txt） ——
 * 列序：左＝审判庭/惩戒军（faith）、中＝岛民与互助会（pol）、右＝王权与大选（royal）；
 * 根格与两个终幕取 head（余烬金）。seq = 本线内档位。 */
const POL = {
	IBR_pol_wrath_and_change: ['bell', 'IRA NOVAT', 0],

	/* 左线 · 审判庭 */
	IBR_pol_pure_heart: ['mitre', 'CANDOR', 0],
	IBR_pol_who_fires_guns: ['cannon_row', 'TONAT', 1],
	IBR_pol_who_draws_blade: ['sword', 'GLADIUM', 2],
	IBR_pol_who_judges_sin: ['scales', 'REATUS', 3],
	IBR_pol_army_of_inquisition: ['cross_swords', 'INQUIS', 4],
	IBR_pol_army_of_the_people: ['cohort', 'POPULI', 4],
	IBR_pol_secret_conclave: ['seal', 'ARCANUM', 5],
	IBR_pol_review_dogma: ['book', 'DOCTRIN', 6],
	IBR_pol_retrial_records: ['scroll', 'DUBIA', 6],
	IBR_pol_saint_last_journey: ['sextant', 'PROFECT', 7],

	/* 中线 · 岛民与互助会 */
	IBR_pol_islanders_landsmen: ['hands', 'INSULAE', 1],
	IBR_pol_aegir_and_libertini: ['knot', 'COEUNT', 2],
	IBR_pol_reorganize_mutual_aid: ['buoy', 'SOCIUM', 3],
	IBR_pol_suppress_mutual_aid: ['chain', 'COERCE', 3],
	IBR_pol_you_are_iberian: ['tablet', 'CIVES', 4],
	IBR_pol_we_are_iberian: ['ledger', 'OMNES', 4],
	IBR_pol_i_honour_you: ['medal', 'HONOS', 5],
	IBR_pol_restore_confidence: ['coin', 'FIDUCIA', 6],
	IBR_pol_restore_courage: ['compass', 'AUDACIA', 6],
	IBR_pol_golden_age_returns: ['sun', 'REDIIT', 7],

	/* 右线 · 王权与大选 */
	IBR_pol_golden_century: ['crown', 'AUREA', 0],
	IBR_pol_trickster_leader_king: ['banner', 'TRINUS', 1],
	IBR_pol_scrap_wreck_anchor: ['anchor', 'FERRUM', 2],
	IBR_pol_three_forces: ['fleet_row', 'COPIAE', 3],
	IBR_pol_true_crown_false_king: ['gate', 'REGNUM', 3],
	IBR_pol_toledo_fallen_star: ['crystal', 'STELLA', 4],
	IBR_pol_king_not_master: ['shield', 'REX EST', 5],
	IBR_pol_subjects_not_slaves: ['broken_staff', 'LIBERI', 5],
	IBR_pol_prepare_first_election: ['press', 'COMITIA', 6],
	IBR_pol_carmen_secret_letter: ['quill', 'OCULTA', 7],
	IBR_pol_clementia_aid: ['sonar', 'CLEMENT', 7],

	/* 两个终幕 */
	IBR_pol_saint_irene: ['lantern', 'IRENE', 0],
	IBR_pol_empress_estefania: ['flagship', 'REGINA', 0],
};

const POL_ROUTE = id => (/_(pure_heart|who_|army_of|secret_conclave|review_dogma|retrial_records|saint_last)/.test(id) ? 'faith'
	: /_(golden_century|trickster|scrap|three_forces|true_crown|toledo|king_not|subjects|first_election|carmen|clementia)/.test(id) ? 'royal'
	: /_(wrath_and_change|saint_irene|empress_estefania)/.test(id) ? 'head' : 'pol');

/* —— 政治簇的民族精神（60x60，无铭文） ——
 * 三个溃局 + 三个缓和档是静态 idea；三个正面精神是变量驱动的动态修正符（icon = GFX_idea_<id>）。 */
const POL_SPIRIT = {
	/* 溃局 */
	IBR_broken_garrisons: ['fort', 0],
	IBR_bandits_and_warlords: ['skull', 0],
	IBR_aegir_malicious_interference: ['tentacle', 0],
	/* 缓和档 */
	IBR_inquisition_reforming: ['helmet', 0],
	IBR_countryside_regathering: ['plow', 0],
	IBR_mirialium_cautious_contact: ['sonar', 0],
	/* 正面（可升级精神，动态修正符） */
	IBR_pure_heart_of_iberia: ['flame', 0],
	IBR_unity_nation: ['knot', 0],
	IBR_golden_century: ['sun', 0],
	/* 终幕决议换上的轻档负面 */
	IBR_crushed_brigands: ['chain', 0],
	IBR_reassured_defence_army: ['cohort', 0],
};
const POL_SPIRIT_ROUTE = {
	IBR_broken_garrisons: 'army', IBR_bandits_and_warlords: 'mil_b',
	IBR_aegir_malicious_interference: 'abyss', IBR_pure_heart_of_iberia: 'faith',
	IBR_inquisition_reforming: 'faith', IBR_countryside_regathering: 'eco',
	IBR_mirialium_cautious_contact: 'sea', IBR_unity_nation: 'pol', IBR_golden_century: 'royal',
	IBR_crushed_brigands: 'mil_b', IBR_reassured_defence_army: 'army',
};

module.exports = { MAIN, MIL, SPIRIT, MIL_ROUTE, spiritRoute, POL, POL_ROUTE, POL_SPIRIT, POL_SPIRIT_ROUTE };
