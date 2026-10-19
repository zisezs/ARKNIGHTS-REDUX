# 猩红剧团（SCR）·「异世界的亡国法兰西」幕僚与军工补充

日期：2026-10-17

## 主题

四国战争之后，高卢共和国的首都林贡斯被夷平，共和国本身也只剩流亡政府、旧军官与散落各国的侨民。猩红剧团把亡国的兵工体系、旧内阁与残军收进自己的巡演车队：机床藏在布景板后面，部长在化妆间里签发命令，元帅在舞台侧幕研究地图。

因此本批内容不是"新建一套法国风味的军工与内阁"，而是**亡国机器的残响**：

- 军工企业都是旧共和国兵工机构的流亡分部；
- 内阁成员都是旧共和国的部长、次长、会计与警察；
- 将领都是四国战争中活下来的旧军官，以及后来在沦陷区打游击的人；
- 所有姓名均为虚构，避免把真实法国政治人物安到架空国家上。

## 一、军工企业（MIO）8 家

文件：`common/military_industrial_organization/organizations/SCR_organization.txt`

| # | 组织 | 装备域 | 树骨架 |
|---|---|---|---|
| 1 | 林贡斯兵工厂联合体 | 步兵、支援装备 | modern_infantry_equipment_organization |
| 2 | 旧王炮兵铸造局 | 火炮、反坦克、防空、火箭炮 | generic_artillery_organization |
| 3 | 阿维尔尼机动车工场 | 摩托化、机械化、装甲车 | generic_motorized_mechanized_organization |
| 4 | 塞夸尼装甲工场 | 轻/中/重型坦克 | generic_tank_organization |
| 5 | 特雷维尔航空制造局 | 全部飞机 | generic_general_aircraft_organization |
| 6 | 阿莫里克船台总局 | 航母、巡洋舰、驱逐舰 | generic_task_force_ship_organization |
| 7 | 先锋国军需总局 | 支援装备 | generic_support_equipment_organization |
| 8 | 猩红剧团道具工坊 | 施术装备、支援装备 | generic_support_equipment_organization |

每家 = 1 条初始特质 + 4 条专属特质。专属特质挂在预设叶子节点下方（y≤5），由 SCR 国策逐条解锁：

- 锻造合唱、铁之舞台、炮兵间奏、废墟清点、重建道路、旧军团阅兵、将军的箱子、口耳网络、林贡斯重新点灯等。
- 数值口径：单项装备加成 5%–10%，生产类 8%–10%，单项累计不超过 ±25%。

图标：`gfx/interface/military_industrial_organization/SCR/*.png`（64×64 RGBA），生成器 `docs/gen_scr_mio_icons.cjs`，精灵注册 `interface/military_industrial_organization/SCR_organization_icons.gfx`。

## 二、核心幕僚 14 名（开局可任用）

文件：`common/characters/SCR.txt`，招募在 `history/countries/SCR - Crimson Troupe.txt`。

### 副团长（second_in_command ×1）

- 塞维兰·德·欧坦「副团长」——剧团与流亡政府之间的联系人。

### 政治顾问（political_advisor，池内 6 人）

- 克莱芒丝·奥德兰「流亡国库总管」——消费商品、民用工业、政治点数。
- 于贝尔·德·锡安「前外交次长」——改善关系、政治点数。
- 热纳维耶芙·帕斯卡「侨民事务专员」——可招募人口、月度人口、稳定度。
- 米歇尔·布朗夏尔「工业重建委员会主席」——建筑速度、工厂效率、消费商品。
- 泰奥多尔·卢梭「旧警察总监」——特工位、情报网、抵抗增长。
- 玛格丽特·瓦卢瓦「王家剧院总监」——政治点数、神秘主义倾向、稳定度。

### 三军部长

- 费迪南·德·拉瓦勒「亡国陆军部长」（army_chief）——陆军组织度、训练、动员、陆军学说。
- 阿德里安·科斯特「残舰舰队司令」（navy_chief）——舰船航程、海军学说、海军经验。
- 埃利亚斯·罗兰「航空事务专员」（air_chief）——飞机机动、空军学说、陆空协同。

### 高级指挥部（high_command ×3 席，池内 4 人）

- 莱昂·马尔索「旧军团总参谋长」——计划上限、计划速度。
- 索菲·德·蒙福尔「侨民自卫军总监」——征召、可招募人口、士气。
- 加斯帕尔·维尼奥「军需与交通总监」——补给消耗、组织度、动员。
- 奥古斯特·佩兰「旧军校教官」——研究速度、陆军学说、陆军经验。

> 注：本工程 `common/idea_tags/00_idea.txt` 的 `research_production` 没有声明
> `character_slot = theorist`，`slot_ledgers` 里该槽停在 `invalid`；为避免顾问
> 在政府面板中不显示，佩兰改挂 `high_command`，与另外三名参谋竞争 3 个席位。

## 三、将领 7 名

| 军衔 | 姓名 | 定位 | 自定义特质 |
|---|---|---|---|
| 元帅 | 埃克托尔·德·维尔纳夫「亡国元帅」 | 防御/组织 | 亡国元帅 |
| 军团指挥官 | 加布里埃尔·杜兰「旧近卫军旅长」 | 进攻/突破 | 旧近卫军冲锋 |
| 军团指挥官 | 伊莎贝尔·莫罗「高卢女猎手」 | 防御/侦察 | 林间猎手 |
| 军团指挥官 | 尼古拉·勒克莱尔「流亡炮兵指挥官」 | 进攻/炮火 | 流亡炮手 |
| 军团指挥官 | 艾蒂安·博纳尔「战地工程师」 | 防御/后勤 | 战地工兵 |
| 军团指挥官 | 吕西安·法尔热「流亡骑兵指挥官」 | 突破/侦察 | 残骑冲锋 |
| 军团指挥官 | 雷米·沙泰勒「外籍军团招募官」 | 经验/补充 | 外籍军团 |

将领特质文件：`common/unit_leader/SCR_traits.txt`。

## 四、接线与维护

- 本地化：`localisation/simp_chinese/SCR_l_simp_chinese.yml`（UTF-8 BOM + LF，单 BOM）。
- 体检器：`node docs/validate_scr_staff_mio.cjs`。
  - 角色/特质/本地化键三方对账；
  - 军工企业图标 → 精灵 → PNG 三方对齐，PNG 必须 64×64；
  - MIO 节点 y≤5、`relative_position_id` 必须存在于 include 的预设；
  - 国策门槛 id 必须真实存在。
- 图标重生成：`node docs/gen_scr_mio_icons.cjs`（勿手改 PNG）。
- 头像：军事岗位暂用项目通用的 `gfx/leaders/_unknown/404_unknown.dds`，政治岗位复用 `_generic` 头像；后续出图后只改角色块里的路径。

## 五、设计注意

- 这批顾问是**开局池**，与第二幕「高卢点名册」12 位随国策登场的顾问并存；政治顾问槽位仍为 5 席，池子更深，玩家自行取舍。
- 所有顾问都写了 `allowed = { original_tag = SCR }`，避免他国雇佣。
- 同一角色没有重复 advisor 槽位。
- 军工企业不需要国策解锁，`allowed = { original_tag = SCR }` 会在开局自动分配；分支节点才由国策逐个解锁。
- 该批内容只在 SCR 自己的文件内追加，没有改动共享文件。
