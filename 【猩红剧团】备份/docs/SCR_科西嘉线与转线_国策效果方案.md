# 猩红剧团「科西嘉线」「转线」国策效果设计方案

> 状态：**仅设计，未实装**
> 范围：`common/national_focus/SCR_corsica_shared.txt`（78 格）与 `common/national_focus/SCR_switch_shared.txt`（6 格）
> 目标：让两条目前完全空白的共享国策树拥有完整、可玩、与本体已有的四幕动态精神/决议/部队体系咬合的效果；政治线终点更换领袖与政党名称。

---

## 0. 现状核查

| 树 | 文件 | 格数 | `completion_reward` |
|---|---|---:|---|
| 科西嘉线 | `SCR_corsica_shared.txt` | 78 | **全部为空** |
| 转线 | `SCR_switch_shared.txt` | 6 | **全部为空** |
| 主树 | `SCR.txt` | 66 | 全部有奖励（其中 10 格只有 20～50 字符的轻量奖励） |

主树里 10 格轻量奖励（`SCR_the_marriage_contract`、`SCR_forged_genealogy`、`SCR_dressers_of_the_aristocracy`、`SCR_voices_in_the_assembly`、`SCR_homeward_act`、`SCR_requiem_for_the_capital` 等）不是本次目标；本方案不动主树。

**生成器归属**：两条树分别由 `docs/gen_scr_corsica.cjs`、`docs/gen_scr_switch.cjs` 生成，文件头写明「勿手改」。实装时必须把效果表写进生成器（增加 per-focus `completion_reward` 映射），再重跑生成器，不能直接改 `*_shared.txt`。

---

## 1. 设计原则

1. **复用现有系统**：优先使用已存在的 `SCR_dyn_leadership / control / army / rebuild / gaul_gaul` 动态精神、`SCR_tour_category` 巡演决议、`SCR_recruit_vanguard / SCR_recruit_dolls` 招聘决议、`SCR_remake_soul_category` 重塑高卢之魂决议。
2. **新增一套科西嘉线专属成长精神** `SCR_dyn_corsica`（「世界之都的倒影」），由科西嘉线与转线共同升级，作为这条线的身份标识。
3. **限时精神**统一走 `add_timed_idea`，90～365 天，覆盖巡演、总动员、加冕、终战等节奏。
4. **科技与资源**：
   - 不把 `set_technology` 当常规奖励（工程既有铁律：国策奖励尽量不解锁科技）；
   - 只在「生成部队模板必须有科技」的两处保留：`SCR_vanguard_guard_unlock_effect`（摩托化）、`SCR_dolls_recruit_effect`（山地）；
   - 科技感通过**研究槽、研究速度、装备库存、资源、工厂**表达。
5. **外交只留在文案里**：塔拉、卡西米尔、哥伦比亚相关国策给国内等价效果（陆军经验、演习限时精神、情报/科研），不写同盟、军事通行、宣战。宣战单独做成决议（`declare_war_on`）。
6. **政治终点换人换党**：按 `hoi4-leader-change` 的实证顺序实现；换领袖的动作放进事件（`hidden_effect = { country_event = ... }`），不直接写在国策 reward 里，避免 tooltip 反复求值刷日志。

### 效果记号

- `主+x` = `add_to_variable = { SCR_dyn_corsica = x }` + `add_dynamic_modifier = { modifier = SCR_dyn_corsica }`
- `lite+x` = `SCR_dyn_corsica_lite`；`军+x` = `SCR_dyn_corsica_army`；`谍+x` = `SCR_dyn_corsica_int`
- `PP` = 政治点数；`稳定` = `add_stability`；`战支` = `add_war_support`
- `限时ID(d)` = `add_timed_idea = { idea = ID days = d }`
- 所有动态精神加值后都要重新 `add_dynamic_modifier` 刷新。

---

## 2. 新增支撑内容

### 2.1 新可升级民族精神：`SCR_dyn_corsica`「世界之都的倒影」

建议新增于 `common/dynamic_modifiers/SCR_dynamic_modifiers.txt`：

```txt
SCR_dyn_corsica = {
	icon = GFX_idea_SCR_dyn_corsica
	enable = { always = yes }
	remove_trigger = { always = no }
	political_power_gain = SCR_dyn_corsica
	stability_factor = SCR_dyn_corsica
	war_support_factor = SCR_dyn_corsica
	research_speed_factor = SCR_dyn_corsica_lite
	production_speed_buildings_factor = SCR_dyn_corsica_lite
	army_attack_factor = SCR_dyn_corsica_army
	army_defence_factor = SCR_dyn_corsica_army
	army_morale_factor = SCR_dyn_corsica_army
	encryption = SCR_dyn_corsica_int
	decryption = SCR_dyn_corsica_int
}
```

- 需要国家变量：`SCR_dyn_corsica`、`_lite`、`_army`、`_int`（在 `history/countries/SCR - Crimson Troupe.txt` 里初始化为 0）。
- 预期满值（两条树全点）：主 +0.18～0.22、lite +0.08～0.10、军 +0.10、谍 +2。属于「国家级」量级，和主树四幕精神相加后仍低于终战精神 `SCR_dyn_gaul_gaul`。
- 同一批国策同时给既有 `SCR_dyn_leadership/control/army/rebuild` 加少量数值，保证两条树不是孤岛。

### 2.2 新增限时民族精神

| ID | 名称 | 天数 | 修正 |
|---|---|---:|---|
| `SCR_timed_gaul_name` | 以高卢之名 | 90 | 稳定 +5%、战支 +5%、征兵 +3% |
| `SCR_timed_scavenging` | 废土求生 | 90 | 消费品 −5%、补给消耗 −5% |
| `SCR_timed_return` | 高卢归来 | 180 | PP 获取 +10%、稳定 +5%、战支 +5% |
| `SCR_timed_three_dawns` | 黄昏·正午·黎明 | 180 | PP +10%、科研 +5%、稳定 +5% |
| `SCR_timed_blazing_sun` | 灿如烈阳 | 90 | 陆军攻击 +10%、士气 +5% |
| `SCR_timed_overload` | 为高卢过载 | 180 | 工厂最大效率 +10%、消费品 +5%、战支 +5% |
| `SCR_timed_mobilization` | 总动员 | 180 | 征兵 +5%、战支 +5%、陆军攻击 +5% |
| `SCR_timed_borrowed_time` | 用未来换当下 | 365 | 建造速度 +15%、科研 +10%、消费品 +10%、稳定 −5% |
| `SCR_timed_coronation` | 加冕彩排 | 180 | PP +15%、稳定 +10%、消费品 −5% |
| `SCR_timed_final_war` | 第二次四皇会战 | 365 | 陆军攻击 +10%、战支 +10%、PP +10% |
| `SCR_timed_burn_out` | 燃烧殆尽 | 365 | 陆军攻击 +15%、战支 +15%、稳定 −10%、消费品 +10% |
| `SCR_timed_night_ops` | 暗夜行动 | 90 | 行动成果 +15%、破译 +1、陆军攻击 +5% |
| `SCR_timed_parade` | 战前阅兵 | 90 | 陆军攻击 +5%、稳定 +10%、PP +10% |
| `SCR_timed_infected_amnesty` | 感染者同胞 | 180 | 人口增长 +5%、稳定 +5% |
| `SCR_timed_exercise` | 联合军演 | 120 | 陆军防御 +10%、挖掘上限 +25% |
| `SCR_timed_terror` | 白色恐怖 | 90 | 稳定 +10%、战支 −5%、PP +10% |
| `SCR_timed_consensus` | 高卢共识 | 120 | 稳定 +5%、PP +10%、战支 +5% |
| `SCR_timed_reflection_tour` | 倒影巡演 | 180 | 稳定 +10%、神秘主义漂移 +0.01、PP +5% |

> 同一 idea 被重复 `add_timed_idea` 会报错；决议侧用「已有则先 `remove_idea` 再挂」或 `days_re_enable` 控制。

### 2.3 新增/改造决议

**新分类 `SCR_corsica_category`「倒影宫廷」**（完成科西嘉线根国策或转线 1 后可见）：

| 决议 | 成本/冷却 | 效果 |
|---|---|---|
| `SCR_corsica_coronation_rehearsal` 加冕彩排 | 50 PP / 180 天 | `SCR_timed_coronation`(180) |
| `SCR_corsica_tour_reflection` 倒影巡演 | 50 PP / 90 天 | `SCR_timed_reflection_tour`(180) |
| `SCR_corsica_rebuild_fund` 重建基金 | 150 PP / 180 天 | 首都州（483）+1 建筑槽、+1 民用工厂 |
| `SCR_corsica_salvage_flagship` 打捞科西嘉旗舰 | 100 PP / 仅一次 | 海军经验 +75、2 艘驱逐舰（实装时核对装备原型名） |
| `SCR_recruit_militia` 剧团招聘：乡土自卫队 | 25 PP / 180 天 | 首都生成 1 个「乡土自卫队」师（新模板：6 步兵营） |
| `SCR_corsica_declare_final_war` 第二次四皇会战 | 200 PP / 仅一次 | 需完成 80 与 `SCR_final_offensive_flag`；分别对 VIC、LTN 执行 `declare_war_on`（吞并目标） |
| `SCR_lucian_purge` 白色恐怖 | 50 PP / 90 天 | `SCR_timed_terror`(90) |
| `SCR_corsica_congress` 高卢共识 | 50 PP / 120 天 | `SCR_timed_consensus`(120) |
| `SCR_decapitation_strike` 斩首行动 | 50 PP / 120 天 | `SCR_timed_night_ops`(90) |

> 另需新增 scripted effect `SCR_militia_unlock_effect`：首次执行时创建 6 步兵营锁定模板「乡土自卫队」并在首都生成 1 个满编师；已创建则只补 1 个师。

**复用现有决议**（只改 `available` 门槛，让新树也能开启）：

- `SCR_recruit_vanguard`：`available` 增加 `OR = { has_completed_focus = SCR_march_music has_completed_focus = SCR_corsica_44 }`
- `SCR_recruit_dolls`：增加 `has_completed_focus = SCR_corsica_63`
- `SCR_remake_soul_category`：由科西嘉政治终点 / 转线 6 设置 `SCR_gaul_reshaped_flag` 后开启

**新增巡演剧目决议**（挂在 `SCR_tour_category`）：

| 决议 | 解锁 | 效果 |
|---|---|---|
| `SCR_tour_requiem` 林贡斯安魂曲 | 转线 3 | `SCR_play_lullaby`(90) |
| `SCR_tour_empress` 皇女复国记 | 转线 5/6 | `SCR_play_heria`(90) |
| `SCR_tour_reflection` 高卢倒影 | 转线 3 | `SCR_play_frost_deer`(90) |

### 2.4 政治终局：换领袖 + 换政党名称

#### A. 卢西恩线（40「唯有高卢！」）

- 复用现有角色 `SCR_lucian_gaul_char`（已静态挂 `country_leader = { ideology = despotism_subtype }`）。
- 不要对他调 `add_country_leader_role`（已静态挂块会被拒）。
- 顺序：`set_politics = { ruling_party = despotism elections_allowed = no }` → 兜底 `retire_country_leader` + `promote_character`。
- 党名用现成键：`SCR_despotism_subtype_party`（先锋国执政团）/ `_party_long`（高卢先锋国——先锋国执政团）。
- 国名会随执政意识形态自动变为「高卢先锋国」（`SCR_despotism`）。

```txt
# scr.26（由 40 的 hidden_effect 触发）
set_politics = { ruling_party = despotism elections_allowed = no }
if = {
	limit = { NOT = { has_country_leader = { character = SCR_lucian_gaul_char ruling_only = yes } } }
	retire_country_leader = yes
	promote_character = { character = SCR_lucian_gaul_char ideology = despotism_subtype }
}
set_party_name = {
	ideology = despotism
	name = SCR_despotism_subtype_party
	long_name = SCR_despotism_subtype_party_long
}
```

#### B. 科西嘉莉线（41「唯有高卢？」/ 转线 6「新剧目《皇女复国记》！」）

- 需要新增角色 `SCR_corsica_char`（科西嘉莉），并给她一个 `country_leader` 块。
- 推荐在 `special` 组下新增子意识形态 `corsica_subtype = { can_be_randomly_selected = no }`，避免与卢西恩争 `despotism` 党魁位；`special` 是现成的、不会给所有国家多出一行政党。
- 新增 loc：`SCR_corsica_char`（科西嘉莉）、`SCR_corsica_party`（高卢倒影皇廷）、`SCR_corsica_party_long`（高卢倒影皇廷——皇女复国记）。
- 顺序（`scr.27`）：

```txt
set_popularities = {
	communism = 1 socialism = 1 progressivism = 2 liberalism = 3
	conservatism = 4 authoritarianism = 8 despotism = 8 fascism = 3
	mysticism = 15 special = 55
}
set_politics = { ruling_party = special elections_allowed = no }
if = {
	limit = { NOT = { has_country_leader = { character = SCR_corsica_char ruling_only = yes } } }
	retire_country_leader = yes
	promote_character = { character = SCR_corsica_char ideology = corsica_subtype }
}
set_party_name = {
	ideology = special
	name = SCR_corsica_party
	long_name = SCR_corsica_party_long
}
```

- 两个终局互斥：建议在实现时给 40 / 41 加 `mutually_exclusive`（或由旗标做 `available` 门控），避免同一条线点出两个皇帝。
- 可选：加 `set_cosmetic_tag = SCR_GALLIC_REFLECTION`（国名「高卢倒影」），需要同时在 cosmetic 定义里补 color / color_ui；不加也不影响本次「换领袖 + 换党名」的要求。

---

## 3. 科西嘉线 78 格逐格效果

### 3.1 复国与情报（1–11）

| # | 国策 | 效果 |
|---:|---|---|
| 1 | 璀璨焦土 | PP+50；稳定+5%；战支+5%；主+0.02、lite+0.01；解锁「倒影宫廷」决议分类与「加冕彩排」；置 `SCR_corsica_act1_flag` |
| 2 | 以高卢之名 | PP+25；`SCR_timed_gaul_name`(90)；主+0.01 |
| 3 | 唤醒民族意识 | PP+40；稳定+5%；灵感 `SCR_inspiration` +1；主+0.01 |
| 4 | 废土求生指南 | `SCR_timed_scavenging`(90)；PP+25；重建 lite+0.01 |
| 5 | 废土自卫手册 | 解锁「乡土自卫队」模板并立刻生成 1 个师；解锁 `SCR_recruit_militia`；PP+25 |
| 6 | 清除敌国密探 | 谍+1；主+0.01；`SCR_timed_night_ops`(90)；PP+25 |
| 7 | 重建信使体系 | 谍+1；加密/破译各 +1；主+0.01；PP+25 |
| 8 | 高卢啊，我已归来！ | PP+100；稳定+10%；战支+10%；主+0.02；`SCR_timed_return`(180)；置 `SCR_gaul_returned_flag` |
| 9 | 筹备第二次四皇会战 | PP+50；陆军经验+25；主+0.01；解锁终战决议 `SCR_corsica_declare_final_war`（需 80） |
| 10 | 维多利亚之崩溃 | 加精神 `SCR_bloody_diplomacy`（对 VIC 攻防 +5%、PP +5%）；战支+5%；谍+1 |
| 11 | 莱塔尼亚之嘶哑 | 加精神 `SCR_eternal_tour`（宣战理由时间 −25%）；PP+25；战支+5% |

### 3.2 新经济（12–26）

| # | 国策 | 效果 |
|---:|---|---|
| 12 | 新蕊破土 | PP+50；重建主+0.02、重建 lite+0.01；解锁「重建基金」决议 |
| 13 | 薪火重燃 | **+1 研究槽**；重建 lite+0.01；PP+25 |
| 14 | 旧时代，新经济 | 加精神 `SCR_harvest_festival`（消费品 −5%、建造速度 +5%）；PP+25 |
| 15 | 改造移动城市 | 首都州：+2 建筑槽、+1 民用工厂；PP+25；重建主+0.01 |
| 16 | 战舰、城邦与尸骸 | 首都州：+1 船坞；海军经验+25；2 艘驱逐舰（核对原型名）；谍+0.01 |
| 17 | 废土、源石与小麦 | 首都州：钢铁 +24、铝 +16、+2 建筑槽；`SCR_timed_scavenging`(90) |
| 18 | 铳枪、歌剧与猩红 | **+1 研究槽**；加精神 `SCR_puppet_craft`（科研 +3%、陆军经验 +10%）；PP+25 |
| 19 | 黄昏、正午与黎明 | PP+50；稳定+5%；`SCR_timed_three_dawns`(180) |
| 20 | 重整物资供应体系 | `SCR_dyn_army_supply` −0.05（补给消耗 −5%）；重建 lite+0.01；PP+25 |
| 21 | 建设源石供能体系 | 首都州：+2 建筑槽、+2 军工厂；重建主+0.01；`SCR_timed_overload`(180) |
| 22 | 白面包和黑火药 | 库存 +500 门火炮；`SCR_timed_three_dawns`(180)；PP+25 |
| 23 | 蓬蓬裙和穿甲炮 | 加精神 `SCR_armament_decree_1`（步兵装备造价 −20%）；陆军经验+15；军+0.01 |
| 24 | 灿如烈阳 | PP+75；战支+10%；`SCR_timed_blazing_sun`(90) |
| 25 | 迫近的地平线 | PP+50；`SCR_timed_three_dawns`(180)；重建 lite+0.01 |
| 26 | 感染者同胞们... | 加精神 `SCR_puppet_legion`（非核心人力 +2%、补给 −5%）；稳定+5%；`SCR_timed_infected_amnesty`(180) |

### 3.3 动员与战争机器（27–33、72–74）

| # | 国策 | 效果 |
|---:|---|---|
| 27 | 作坊和工厂们... | 首都州：+2 民用工厂；重建 lite+0.01；PP+25 |
| 28 | ...发光发热吧！ | 首都州：+2 军工厂；谍+0.01；PP+25 |
| 29 | ...为高卢过载！ | `SCR_timed_overload`(180)；战支+5%；PP+25 |
| 30 | 永恒战备法案 | 加精神 `SCR_blood_of_gaul`（征兵 +5%、宣战理由 −15%）；PP+25 |
| 31 | 高卢总动员令 | 加精神 `SCR_banner_of_empire`（战支 +10%、征兵 +2%）；`SCR_timed_mobilization`(180) |
| 32 | 高卢战争机器 | 军+0.02、军 lite+0.01；陆军经验+50；PP+25 |
| 33 | 永不谢幕的军团 | 加精神 `SCR_triumph`；军+0.03、军 lite+0.02；`SCR_dyn_gaul`+0.03 / lite+0.02 并挂 `SCR_dyn_gaul_gaul`；各生成 1 个近卫军之锋与颂乐人偶；PP+100 |
| 72 | 转为战时经济 | PP+50；稳定−5%、战支+10%；`SCR_timed_mobilization`(180)；`SCR_dyn_rebuild_neg` −0.05（消费品 −5%，刷新重建精神） |
| 73 | 绞杀投机与资敌者 | PP+100；稳定+5%；`SCR_timed_terror`(90)；谍+0.01 |
| 74 | 用未来换当下 | `SCR_timed_borrowed_time`(365)；PP+50；稳定−5% |

### 3.4 政治线（34–42）

| # | 国策 | 效果 |
|---:|---|---|
| 34 | 卢西恩剧团长的巡演！ | PP+75；主+0.02；置 `SCR_lucian_play_flag`；解锁「加冕彩排」 |
| 35 | 科西嘉莉陛下在行动！ | PP+75；主+0.02；置 `SCR_corsica_play_flag`；解锁「倒影巡演」 |
| 36 | 旧世界与新高卢 | PP+50；稳定+5%；加精神 `SCR_oath_of_restoration`；主+0.01 |
| 37 | 新皇帝与旧贵族 | PP+50；稳定+5%；加精神 `SCR_imperial_banner`；主+0.01 |
| 42 | 和声 | PP+100；稳定+10%；战支+5%；加精神 `SCR_gallic_echo`；主+0.02 |
| 38 | …异议？ | PP+50；稳定−5%；战支+5%；谍+0.02；置 `SCR_lucian_path_flag`；解锁「白色恐怖」决议（`SCR_timed_terror`，50 PP/90 天） |
| 39 | 共识… | PP+50；稳定+5%；置 `SCR_corsica_path_flag`；解锁「高卢共识」决议（`SCR_timed_consensus`，50 PP/120 天） |
| 40 | 唯有高卢！ | **卢西恩终局**：`scr.26` 换领袖/党名；PP+100；加精神 `SCR_triumph`；主+0.03；`SCR_dyn_gaul`+0.05；与 41 互斥 |
| 41 | 唯有高卢？ | **科西嘉莉终局**：`scr.27` 换领袖/党名；PP+100；加精神 `SCR_celebration_of_all_things`；主+0.03；置 `SCR_gaul_reshaped_flag`；与 40 互斥 |

### 3.5 军事线（44–65）

| # | 国策 | 效果 |
|---:|---|---|
| 44 | 林贡斯建军会议 | PP+50；陆军经验+25；军+0.02；让「剧团招聘」两决议对本线开放 |
| 45 | 卢西恩：猩红血钻 | 加精神 `SCR_blood_diamond_legacy`；陆军经验+25；军+0.01 |
| 46 | 高卢人，我为你羞愧！ | PP+50；战支+5%；`SCR_timed_blazing_sun`(90) |
| 47 | 科西嘉莉：引擎轰鸣 | 加精神 `SCR_star_surgery`；陆军经验+25；军 lite+0.01 |
| 48 | 暗杀、潜伏与斩首... | 加精神 `SCR_flyleaf_masters`（破译 +1、行动成果 +10%）；谍+1 |
| 49 | 暗夜魅影 | 谍+0.02；`SCR_timed_night_ops`(90)；PP+25 |
| 50 | 血色乐章 | 加精神 `SCR_blood_altar`（抵抗增长 −10%、顺从增长 +10%）；PP+25 |
| 51 | 白英花战术 | `SCR_timed_blazing_sun`(90)；陆军经验+25；军+0.01 |
| 52 | 击敌要害 | 陆军经验+15；军+0.01；谍+1；解锁「斩首行动」决议（`SCR_timed_night_ops`，50 PP/120 天） |
| 53 | 夜幕突袭 | `SCR_timed_night_ops`(90)；军+0.01；PP+25 |
| 54 | 钢铁、黄铜与火药！ | 首都州：+2 军工厂；加精神 `SCR_armament_decree_1`；PP+25 |
| 55 | 舰炮至上主义 | 首都州：+1 船坞；海军经验+50；2 艘驱逐舰（核对原型名）；军+0.01 |
| 56 | 怒雷惊涛 | 海军经验+75；3 艘驱逐舰（核对原型名）；军+0.01 |
| 57 | 老近卫军之锋 | 调用 `SCR_vanguard_guard_unlock_effect`（建模板 + 2 个满编师）；PP+25；军+0.01 |
| 58 | 战场没有顾忌 | 加精神 `SCR_temple_of_pain`；陆军经验+25；战支+5% |
| 59 | 发掘科西嘉旗舰 | 海军经验+75；2 艘驱逐舰；解锁「打捞科西嘉旗舰」决议；谍+0.01 |
| 60 | 反思舰群战术 | `SCR_timed_three_dawns`(180)；海军经验+50；重建 lite+0.01 |
| 61 | 汲取列国实战经验 | 陆军经验+50；海军经验+50；加精神 `SCR_puppet_craft`；军+0.01 |
| 62 | 战前最后一次阅兵 | PP+100；战支+10%；`SCR_timed_parade`(90)；置 `SCR_parade_done_flag` |
| 63 | 颂乐人偶 | 调用 `SCR_dolls_recruit_effect`（建模板 + 2 个满编师）；PP+25；军+0.01 |
| 64 | 近卫军之魂 | `SCR_vanguard_guard_cap_effect` + 再生成 1 个近卫军之锋；加精神 `SCR_blood_of_gaul`；军+0.01 |
| 65 | 覆水难收 | PP+50；战支+5%；军+0.02；置 `SCR_final_offensive_flag`；解锁终战决议 |

### 3.6 外部线与终幕（66–71、76–80）

| # | 国策 | 效果 |
|---:|---|---|
| 66 | 鬼魂与红龙 | 加精神 `SCR_gallic_echo`；PP+25；`SCR_timed_gaul_name`(90) |
| 67 | 骑士与巫师 | 加精神 `SCR_shield_of_gallia`；陆军经验+25；`SCR_timed_exercise`(120) |
| 68 | 告高卢同胞书 | PP+75；战支+10%；加精神 `SCR_oath_of_restoration`；置 `SCR_proclamation_flag`；主+0.01 |
| 69 | 塔拉人，我们上！ | `SCR_timed_blazing_sun`(90)；陆军经验+25；军+0.01 |
| 70 | 高卢-卡西米尔联合军演 | `SCR_timed_exercise`(120)；陆军经验+50；军+0.01 |
| 80 | 第二次四皇会战 | 置 `SCR_second_four_emperors_flag`；`SCR_dyn_gaul`+0.05 / lite+0.03 并挂 `SCR_dyn_gaul_gaul`；加精神 `SCR_triumph`；生成 3 个师（近卫军/颂乐人偶/乡土自卫队，按已解锁模板）；PP+100；战支+10%；`SCR_timed_final_war`(365)；解锁宣战决议 |
| 71 | 直至...燃烧殆尽！ | `SCR_timed_burn_out`(365)；军+0.03；`SCR_dyn_gaul`+0.03；PP+50；稳定−5% |
| 76 | 配合哥伦比亚 | 谍+0.02；`SCR_timed_three_dawns`(180)；PP+25 |
| 77 | 奥尔良攻势 | `SCR_timed_blazing_sun`(90)；生成 1 个师（按已解锁模板）；PP+25 |
| 78 | 林贡斯堡垒 | 首都州：+3 陆上要塞；挂州级 `SCR_londinium_heart`；PP+25；稳定+5% |
| 79 | 煽动巫王残党 | 谍+2（整数）；加精神 `SCR_mirror_man`；`SCR_timed_night_ops`(90)，额外破译 +2 |

---

## 4. 转线 6 格逐格效果

| # | 国策 | 效果 |
|---:|---|---|
| 1 | 剧团长的审美疲劳 | PP+50；主+0.01；解锁「倒影宫廷」分类与「加冕彩排」 |
| 2 | 猩红孤钻意犹未尽... | PP+75；战支+5%；主+0.01；`SCR_timed_blazing_sun`(90) |
| 3 | 世界之都的倒影... | PP+50；lite+0.01；解锁巡演决议「林贡斯安魂曲」「高卢倒影」 |
| 4 | 长生者的禁忌技艺 | 加精神 `SCR_undying_art`（人口增长 +10%、经验损失 −25%）；主+0.01；PP+25 |
| 5 | 男主角，女主角 | PP+75；主+0.01；军+0.01；置 `SCR_corsica_star_flag`；解锁巡演决议「皇女复国记」 |
| 6 | 新剧目《皇女复国记》！ | **科西嘉莉终局**：调用与 41 相同的 `scr.27` 换领袖/党名；加精神 `SCR_celebration_of_all_things`；主+0.03；PP+100；`SCR_timed_coronation`(180)；置 `SCR_corsica_ending_flag` |

---

## 5. 平衡与依赖检查

- **动态精神总增量**：科西嘉线全点后 `SCR_dyn_corsica` 约 +0.18～0.22，三条既有线各再获 +0.03～0.06；不会压过主树四幕与终战精神。
- **研究槽**：科西嘉线只给 2 个（13、18）；转线不给。避免与主树/发展度树叠加过多。
- **部队**：科西嘉线可稳定获得 2 个近卫军之锋 + 2 个颂乐人偶 + 若干乡土自卫队；上限仍受 `SCR_vanguard_guard_cap`（26）约束。
- **资源**：钢铁 +24、铝 +16 只在首都州，量级与原版国策（钢铁 +16）相近；不会破坏资源平衡。
- **政治终局互斥**：40 / 41 必须互斥；转线 6 与 41 可能同时被点，实装时用 `SCR_corsica_ending_flag` / `SCR_gaul_path_*` 做 `available` 门控，保证只执行一次换人换党。

---

## 6. 实装清单与风险

1. **改生成器，不改产物**：`docs/gen_scr_corsica.cjs` / `docs/gen_scr_switch.cjs` 增加 `REWARDS` 映射并写入 `completion_reward`；重跑后备份 `docs/SCR_科西嘉线_备份/`、`docs/SCR_转线树_备份/`。
2. **政治效果走事件**：新增 `scr.26`（卢西恩）、`scr.27`（科西嘉莉），国策 reward 里只写 `hidden_effect = { country_event = { id = scr.26 } }`；事件内再执行 `set_politics` / `retire_country_leader` / `promote_character` / `set_party_name`。
3. **科西嘉莉角色与子意识形态**：`SCR_corsica_char` 走 `special` 组新子类型；不要和卢西恩共用 `despotism_subtype`，否则党魁位竞争。
4. **timed idea 刷新**：同一限时精神重复挂会报错；决议用 `days_re_enable`，事件用「有则先移除再挂」。
5. **`add_resource` 是州作用域**：写成 `483 = { add_resource = { type = steel amount = 24 } }`；不要在国家作用域直接写（DUB 里那条国家作用域写法需另行核验）。
6. **装备原型名**：驱逐舰、火炮、步兵装备的 `type` 实装前在本 mod 的 `common/units/equipment` 里逐一核对，避免库存效果静默失效。
7. **外交不写进 reward**：塔拉/卡西米尔/哥伦比亚只给国内效果；对 VIC/LTN 的宣战做成决议 `declare_war_on`。
8. **loc**：新限时精神、决议、角色、党名键统一追加到 `localisation/simp_chinese/` 对应文件，保留单个 UTF-8 BOM；新增文件按现有 Routes 文件用 LF + 尾换行。
9. **静态自检**：实现后跑「84 格全部有 `completion_reward`」「每格引用的 idea/决议/角色/GFX 都存在」「动态变量初始化齐全」「40/41 互斥」「换领袖后 `has_country_leader` 断言」五组检查。

---

## 7. 待用户拍板的三处

1. **科西嘉莉的政党归属**：`special` 新子类型（推荐，干净）还是直接接管 `mysticism`（需让剧团长退场）？
2. **科西嘉终局是否改国名**：只换领袖 + 党名（本方案默认），还是额外做 `set_cosmetic_tag = 高卢倒影`（需补 cosmetic 颜色）？
3. **40/41 是否强制互斥**：本方案建议互斥；若想保留「先卢西恩后科西嘉莉」的双皇共治彩蛋，则改成先后顺序而不是互斥。

---

## 8. 实装记录（2026-10-17）

已按本方案完成实装。与设计稿的差异与落点如下。

### 8.1 新增 / 修改文件

| 文件 | 内容 |
|---|---|
| `docs/scr_corsica_rewards.cjs` | 84 格国策奖励真源，两个生成器共同读取 |
| `docs/gen_scr_corsica.cjs` / `docs/gen_scr_switch.cjs` | 增加 `completion_reward` 注入 |
| `common/national_focus/SCR_corsica_shared.txt` / `SCR_switch_shared.txt` | 重新生成，78 + 6 格全部带奖励 |
| `common/dynamic_modifiers/SCR_dynamic_modifiers.txt` | 新增 `SCR_dyn_corsica` |
| `history/countries/SCR - Crimson Troupe.txt` | 初始化四个成长变量；招募科西嘉莉 |
| `common/ideas/SCR ideas (Crimson Troupe).txt` | 新增 18 个限时民族精神 |
| `interface/ideas/SCR_ideas.gfx` | 注册 19 个新精神图标 |
| `gfx/interface/ideas/SCR/` | 19 张 60x60 图标（代码绘制幕布法语字） |
| `common/decisions/SCR_Decisions.txt` | 新增「倒影宫廷」分类 11 条决议；放开近卫军招聘门槛 |
| `common/scripted_effects/SCR_scripted_effects.txt` | 新增 `SCR_militia_unlock_effect` |
| `common/characters/SCR.txt` | 新增 `SCR_corsica_char` 与立绘 |
| `common/country_leader/00_traits.txt` | 新增领袖特质 `the_empress` |
| `common/ideologies/00_ideologies.txt` | `special` 组新增 `special_corsica_subtype` |
| `common/countries/cosmetic.txt` | 新增 `SCR_Gallic_Reflection`（高卢倒影） |
| `events/SCR.txt` | 新增 `scr.26`（卢西恩终局）与 `scr.27`（科西嘉莉终局） |
| `localisation/simp_chinese/ARF_SCR_corsica_effects_l_simp_chinese.yml` | 新内容全部本地化（BOM + LF） |
| `gfx/leaders/SCR/corsica.png` / `corsica_small.png` | 科西嘉莉立绘 156x210 / 65x67 |

### 8.2 实装时的调整

- **舰船奖励改为海军经验 + 船坞**：避免 `add_equipment_to_stockpile` 只给空船体（没有配件的船会变成空壳）。涉及 16、55、56、59 与「打捞科西嘉旗舰」决议。
- **州效果统一用 `capital_scope`**，不再硬编码 483：483 号州开局属于 LIG，SCR 的首都是 867；用首都作用域才能保证工厂/资源/船坞真的落在玩家手里。船坞改用 `add_building_construction = { type = dockyard ... }`，陆上要塞用 `type = bunker`。
- **限时精神改成「先移除再挂」刷新式**：同一限时精神被多格国策/可重复决议再次授予时不会报重复错误。
- **部队生成统一包进 `hidden_effect`**，前面挂 `custom_effect_tooltip`，避免国策 tooltip 里出现展开后的 `division_template` 长文本。
- **40 / 41 已在设计源里补 `mutually_exclusive`**，生成器输出的共享国策带互斥块。
- **科西嘉莉走 `special` 组新子类型**，避免和卢西恩争 `despotism` 党魁位；同时加 `set_cosmetic_tag = SCR_Gallic_Reflection`，终局国名显示为「高卢倒影」。
- **`SCR_recruit_vanguard` 的 `available` 与 `visible` 同时放开**到「军乐」或「林贡斯建军会议」，只改一处会导致决议仍然不可见。
- **「乡土自卫队」决议**在科西嘉线 1 或转线 1 之后出现，保证「倒影宫廷」分类在两条入口都能开启。

### 8.3 已完成的静态校验

- 78 + 6 格全部有 `completion_reward`；40/41 双向互斥。
- 国策引用的 idea、限时 idea、动态修正、事件、脚本效果全部存在。
- 18 个限时精神与 11 条决议的名称/描述 loc 齐全；24 个 `custom_effect_tooltip` 全部有键。
- 新 loc 文件为单个 UTF-8 BOM + LF；旧 loc 与生成器产物未被破坏。
- 两个生成器连跑两次产物逐字节一致。
- `docs/validate_scr_corsica.cjs` 全部 PASS。
- 未启动游戏；实机表现（领袖上台、政党名、国名、部队模板、决议可见性）待进游戏复验。

### 8.4 追加：经济 / 军事两条升级型精神

在通用精神 `SCR_dyn_corsica` 之外，又拆出两条树专属的成长精神，保证「经济树有经济精神、军事树有军事精神」：

| 精神 | 变量 | 每格增量 | 满树大致总值 |
|---|---|---|---|
| `SCR_dyn_corsica_economy`「新经济秩序」 | `_economy` / `_economy_lite` / `_economy_cg` | 建造速度、工厂效率、最大效率 +0.8%；科研 +0.3%；消费品 −0.3% | 25 格：产出 +20%、科研 +7.5%、消费品 −7.5% |
| `SCR_dyn_corsica_military`「高卢战争机器」 | `_military` / `_military_lite` | 陆军攻/防/士气 +0.6%；陆军经验、征兵、挖掘上限 +0.3% | 33 格：三维 +19.8%、经验/动员 +9.9% |

- 经济簇 = 12–33、72–74；军事簇 = 44–65、66–71、76–80。
- 其余国策（1–11、34–42、转线 1–6）若没有显式 `dyn()`，自动补一条 `SCR_dyn_corsica` +0.5% 的静默增量。**84 格现在每一格都至少给一项升级型精神加值。**
- 图标：`scr_dyn_corsica_economy.png`（金色麦穗 / RICHE）、`scr_dyn_corsica_military.png`（灰色铁血 / ARMÉE），60×60，注册在 `interface/ideas/SCR_ideas.gfx`。
- 新增 loc：`SCR_dyn_corsica_economy` / `_value_tt` / `_lite_value_tt` / `_cg_value_tt` / `_tooltip` 与军事对应键。
- 科西嘉莉头像已换用用户提供的近景立绘：大图 156×210、小头像 65×67。

### 8.5 2026-10-17 修复

- **「覆水难收」前置冲突**：`SCR_corsica_65` 的前置改为**一个** prerequisite 块，63 / 64 / 62 三选一即可解锁。生成器现在保留 prerequisite 分组语义：**一个块内多个 focus = OR，多个块 = AND**；其余汇聚格（33、42、63、64、71）仍是多个块，保持“全都要”。
- **国策效果文本清理**：移除「解锁决议分类」「追加效果」「逐级成长」等游戏外说明；分类解锁改用标准 `unlock_decision_category_tooltip`；只保留具体数值、部队、建筑与资源效果。部队提示改用简短的 `SCR_corsica_vanguard_unlock_tt` / `SCR_corsica_dolls_tt`，不再复用主树里的长说明。

### 8.6 子意识形态「剧场皇室」

- `special_corsica_subtype` 的显示名从「高卢倒影皇廷」改为 **「剧场皇室」**；政党名 `SCR_corsica_party` 仍保留「高卢倒影皇廷」，二者分工为“意识形态 / 执政党”。
- 图标：`gfx/interface/ideologies/special_corsica_subtype.dds`，84×82 未压缩 BGRA8888（与 mod 现有意识形态图标同规格），在 `interface/countrypoliticsview.gfx` 注册 `GFX_ideology_special_corsica_subtype`。
- 科西嘉莉的 `country_leader` 与 `scr.27` 仍使用 `special_corsica_subtype`，无需改脚本。
- `【猩红剧团】备份/` 已同步本次全部改动（68 个文件），并在 `文件清单.md` 追加同步记录。
