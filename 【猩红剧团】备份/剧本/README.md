# 猩红剧团 · 剧本（Bookmark / 开局剧本）

HOI4 的「剧本」就是 `common/bookmarks/` 下的 bookmark。猩红剧团的专属剧本是 **`bm0.txt`**：
开局日期 `1094.6.1.12`，默认国家 `SCR`，剧本卡图为 `GFX_ARK_bookmark0`。

`bm2.txt` 是维多利亚剧本，其中也把 `SCR` 列为可选国家（带 4 个开局国策）。

## 文件说明

| 文件 | 作用 |
|---|---|
| `common/bookmarks/bm0.txt` | **猩红剧团专属剧本**。默认国家 SCR，初始民族精神 `SCR_theatre_is_truth`，初始国策 `SCR_Route_*` |
| `common/bookmarks/bm2.txt` | 维多利亚剧本；其中 `"SCR"` 条目让猩红剧团可作为可选国家开局 |
| `localisation/simp_chinese/bookmarks_l_simp_chinese.yml` | 剧本名 `ARK_SCENARIO0_NAME`（「尊敬的客人们……」）与描述 `ARK_SCENARIO0_DESC`；另含 `ARK_SCENARIO2_*` |
| `gfx/interface/bookmarks/ARK_bookmark0.png` | 剧本选择界面的剧本卡图（`GFX_ARK_bookmark0`） |
| `gfx/interface/bookmarks/episode_0.png` | 剧本描述里 `£episode_0` 引用的剧集插图 |
| `interface/frontendgamesetupview.gfx` | 注册 `GFX_ARK_bookmark0`～`GFX_ARK_bookmark11`（共享文件，仅需保留含 bookmark0 的注册段） |
| `interface/_ARF_Gui/bookmarks.gfx` | 注册 `GFX_episode_0`～`GFX_episode_11`（共享文件） |
| `_通用界面/` | 剧本选择界面的通用底图与左右翻页按钮，所有剧本共用，非猩红剧团专属 |
| `源文件/` | 剧本卡图与剧集插图的 `.pdn` 源文件 |

## 恢复

`common/`、`localisation/`、`gfx/`、`interface/` 目录按原相对路径覆盖回 mod 根目录。
`_通用界面/` 与 `源文件/` 只作参考，不参与游戏加载。

注意：`interface/frontendgamesetupview.gfx` 和 `interface/_ARF_Gui/bookmarks.gfx`
是**共享注册文件**，直接覆盖会把其它国家后来新增的注册一起回滚；恢复时只合并
`GFX_ARK_bookmark0` / `GFX_episode_0` 相关段落即可。

## 剧本正文（localisation 摘录）

- 名称：`ARK_SCENARIO0_NAME` —「尊敬的客人们：此处驻演的剧团叫做“猩红剧团”。历史悠久，剧目优秀。但要观看他们的演出，需要遵守些许规则……」
- 描述：`ARK_SCENARIO0_DESC` — `£episode_0`
- 国家登场文本：`SCR_ARK_SCENARIO_DESC` —「高卢旧领，现维多利亚境内的克莱布拉松。雾气笼罩的林地深处，荒废的古堡亮起了烛火……」
