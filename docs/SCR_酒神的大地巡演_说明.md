# 猩红剧团 ·「酒神的大地巡演」

## 玩家入口

1. 决议栏新增分类 **「酒神的大地巡演」**（SCR 专属）。
2. 点击 **【酒神的大地巡演】** 打开独立浮动面板；也可以直接点五条「排演某剧目」决议，面板会带着对应剧目打开。
3. 面板打开后：
   - 默认在面板地图上标出 **剧团控制、尚未巡演** 的州；点右下角「显示全世界」后，州图标会扩展到世界地图，可关闭/拖动面板，在世界地图上点选任意一个未巡演州（含他国领土）；
   - 点击面具标记即可选定舞台；
   - 游戏大地图上也会出现同样的面具标记；
   - 若标记不方便点，面板里还有「另选一州」随机选一个未巡演州。
4. 在左侧剧目单选一出戏，右侧确认地块修正，点 **「启程巡演」**：
   - 消耗 75 政治点；
   - 启程后进入 **30 天冷却**，冷却期间按钮不可用；
   - 目标州获得持续 **365 天** 的州级动态修正（正负效果兼备）；
   - 剧团获得 **1 座地图外民用工厂**；
   - 目标州可以是任意州，包括他国领土；地块修正照常挂在当地；
   - 该州被永久标记为「已巡演」，不能再次承办巡演。

## 五出剧目

| 剧目 | 正面 | 负面 |
|---|---|---|
| 《湖中至宝》 | 当地工厂 +25%、资源 +15% | 当地可用人力 -10% |
| 《一百零一日》 | 当地可用人力 +25% | 当地工厂 -15% |
| 《梦中奇缘》 | 当地可用人力 +20%、建造速度 +10% | 当地资源 -10% |
| 《霜牡与雪牝》 | 当地工厂 +15%、建造速度 +15% | 当地可用人力 -15% |
| 《七丘的狼母》 | 当地补给 +2、当地工厂 +10% | 当地可用人力 -10% |

## 地图实时反馈

**面板内**：760×276 中性州/省界底图，不按国家政区上色。按 `州几何.json` 为 1087 个州各生成一张 6 帧州块图：州块一旦巡演，就按最近剧目着色（绿《湖中至宝》/红《一百零一日》/紫《梦中奇缘》/冰蓝《霜牡与雪牝》/暗金《七丘的狼母》），形成巡演足迹。默认只在我方控制、尚未巡演的州亮起面板地图标记；开启「显示全世界」后，世界地图上会出现任意未巡演州（含他国领土）的图标，点击即可选定。

**底部地图模式**：新增 **「酒神巡演」**，按州当前状态实时上色：

- 亮金：当前选中的舞台
- 金色 / 猩红 / 紫色 / 冰蓝 / 暗金：五种剧目正在上演
- 灰色：已巡演
- 暖白：剧团控制、尚未巡演
- 其余州透明

数据来源就是 `history/states` 的州归属/控制与州级动态修正，和「地块数据编辑器」使用的州数据是同一套。

## 文件落点

| 内容 | 文件 |
|---|---|
| 决议分类与 6 条决议 | `common/decisions/SCR_Bacchanal_Decisions.txt`、`common/decisions/categories/SCR_decision_categories.txt` |
| 独立面板 / 地图图标 | `common/scripted_guis/SCR_Bacchanal_GUI.txt`、`interface/_ARF_Gui/SCR_Bacchanal.gui` |
| 逻辑与结算 | `common/scripted_effects/SCR_Bacchanal_effects.txt` |
| 州级动态修正 | `common/dynamic_modifiers/SCR_dynamic_modifiers.txt` |
| 地图模式 | `common/map_modes/SCR_bacchanal_map_mode.txt` |
| 贴图注册 | `interface/_ARF_Gui/SCR_Bacchanal.gfx` |
| 贴图 | `gfx/interface/SCR_bacchanal/` |
| 面板内静态州界图 / 可点击标记 | `docs/gen_scr_bacchanal_map.cjs` 注入 `.gui` 与 `SCR_Bacchanal_GUI.txt` |
| 地图真源 | 地块数据编辑器 `hitmap.png` + `州几何.json` + `地表底图.png` + `边界.png`，外加本模组 `map/provinces.bmp` |
| 本地化 | `localisation/simp_chinese/SCR_l_simp_chinese.yml`（文件末尾「酒神的大地巡演」段） |
| 素材生成 / 预览 / 体检 | `docs/gen_scr_bacchanal_assets.cjs`、`docs/preview_scr_bacchanal.cjs`、`docs/validate_scr_bacchanal.cjs` |

## 调整口径

- 改数值：`common/dynamic_modifiers/SCR_dynamic_modifiers.txt` 的 5 个 `SCR_tour_dm_*`。
- 改价格 / 时长：`common/scripted_effects/SCR_Bacchanal_effects.txt` 的 `SCR_Bacchanal_Depart`（75 政治点、`days = 365`）。
- 改剧目文案 / 卡片文字：`docs/append_scr_bacchanal_loc.cjs`，改完重跑该脚本（幂等，不会重复追加）。
- 改边框 / 按钮 / 图标 / 地图底图：`docs/gen_scr_bacchanal_assets.cjs`，重跑后自动覆盖 `gfx/interface/SCR_bacchanal/`。
- 改州界/州坐标/标记数量：先更新地块数据编辑器的 `州几何.json`，再跑 `node docs/gen_scr_bacchanal_map.cjs` 与 `NODE_PATH=E:/tmp/lud/node_modules node docs/gen_scr_bacchanal_fx.cjs`（后者会重写中性底图、1087 张州块图与 FX 接线）。
- 改完跑 `node docs/validate_scr_bacchanal.cjs` 与 `NODE_PATH=E:/tmp/lud/node_modules node docs/preview_scr_bacchanal.cjs`，预览图在 `docs/out/preview_scr_bacchanal.png`。

## 已知限制

- 面板与地图图标只对玩家开放（`is_ai = no`），AI 不参与巡演。
- 巡演目标不设领土限制：面板地图默认只标我方控制州；开启「显示全世界」后，可在世界地图上点选任意州（含盟国、中立国、敌国领土）。
- 每州只能巡演一次，避免无限刷地图外工厂。
- 面板内的州/省界底图是**静态线稿**，不会随战争重绘；彩色州块是巡演足迹，会按最近一场剧目保留。
- 真正的逐州实时填色仍由底部「酒神巡演」地图模式提供。
