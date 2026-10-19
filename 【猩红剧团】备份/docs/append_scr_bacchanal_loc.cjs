#!/usr/bin/env node
/*
 * 将「酒神的大地巡演」本地化键追加到 SCR_l_simp_chinese.yml。
 * 幂等：以文件内 MARK 为界，重跑会替换该标记之后的整段。
 * 必须保持：单个 UTF-8 BOM + CRLF + 首行 l_simp_chinese:。
 */
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'localisation', 'simp_chinese', 'SCR_l_simp_chinese.yml');
const MARK = ' # ---- 酒神的大地巡演 ----';
const keys = `
 SCR_bacchanal_tour_category: "酒神的大地巡演"
 SCR_bacchanal_tour_category_desc: "酒神走到哪里，哪里的土地就得学会鼓掌。把任意一个州选作舞台——包括他国领土——为一地带来剧目对应的地块修正；每一场巡演都会为剧团添置一座地图外民用工厂，随后进入 30 天冷却。"

 SCR_bacchanal_tour_terminal: "【酒神的大地巡演】"
 SCR_bacchanal_tour_terminal_desc: "摊开巡演地图，选任意一座州——哪怕它属于别人——挑一出剧目。幕布升起之后，土地会替剧团记住这场演出——无论它愿不愿意。"
 SCR_bacchanal_play_1: "排演《湖中至宝》"
 SCR_bacchanal_play_1_desc: "金库与湖水都留在当地。工厂更卖力，矿脉更慷慨，代价是年轻人会追着湖中的倒影离开。"
 SCR_bacchanal_play_2: "排演《一百零一日》"
 SCR_bacchanal_play_2_desc: "一百零一日后，故事会传进王酋的耳朵；一百零一日内，所有听见故事的人都会收到一张征召名册。"
 SCR_bacchanal_play_3: "排演《梦中奇缘》"
 SCR_bacchanal_play_3_desc: "梦游者会在夜里替剧团修好屋顶、铺好道路、清点粮仓。天亮后他们什么也不记得，只记得昨夜的戏很好看。"
 SCR_bacchanal_play_4: "排演《霜牡与雪牝》"
 SCR_bacchanal_play_4_desc: "霜牡与雪牝的愿望只能实现一个。剧团替他们选了：让这片土地在寒冬里继续开工。"
 SCR_bacchanal_play_5: "排演《七丘的狼母》"
 SCR_bacchanal_play_5_desc: "狼母离巢前留下的规矩，剧团抄进了巡演手册。补给车队沿着七丘旧道穿过荒原，沿途村庄会少掉一些年轻人。"

 SCR_BAC_MAP_HEAD: "巡演足迹"
 SCR_BAC_MAP_MARKER_TT: "点击选定此州作为巡演舞台"
 SCR_BAC_TITLE: "酒神的大地巡演"
 SCR_BAC_SUBTITLE: "「酒神走到哪里，哪里的土地就得学会鼓掌。」——剧团长手记"
 SCR_BAC_LIST_TITLE: "剧目单"
 SCR_BAC_DETAIL_HEAD: "剧目提要"
 SCR_BAC_STATE_LABEL: "本季舞台"
 SCR_BAC_NO_STATE: "尚未选定舞台"
 SCR_BAC_STATE_HINT: "点面具标记选我方州；「显示全世界」后关闭面板，在世界地图点任意州。\\n\\n彩色州块为巡演足迹。"
 SCR_BAC_CARD_1: "§G工厂 +25% / 资源 +15%§!\\n§R人力 -10%§!"
 SCR_BAC_CARD_2: "§G人力 +25%§!\\n§R工厂 -15%§!"
 SCR_BAC_CARD_3: "§G人力 +20% / 建造 +10%§!\\n§R资源 -10%§!"
 SCR_BAC_CARD_4: "§G工厂 +15% / 建造 +15%§!\\n§R人力 -15%§!"
 SCR_BAC_CARD_5: "§G补给 +2 / 工厂 +10%§!\\n§R人力 -10%§!"
 SCR_BAC_P1_DESC: "湖中的至宝从不属于卡普里尼的手指。剧团把整座湖搬进剧院，让观众在幕间低头看见自己的倒影——倒影里的人都比他们富有。"
 SCR_BAC_P1_POS: "§G当地工厂产出 +25%§!\\n§G当地资源产出 +15%§!"
 SCR_BAC_P1_NEG: "§R当地可用人力 -10%§!"
 SCR_BAC_P2_DESC: "一百零一日后，故事会传进王酋的耳朵；一百零一日内，所有听见故事的人都会收到一张征召名册。剧团只负责让名册看起来像节目单。"
 SCR_BAC_P2_POS: "§G当地可用人力 +25%§!"
 SCR_BAC_P2_NEG: "§R当地工厂产出 -15%§!"
 SCR_BAC_P3_DESC: "梦游者会在夜里替剧团修好屋顶、铺好道路、清点粮仓。天亮后他们什么也不记得，只记得昨夜的戏很好看。"
 SCR_BAC_P3_POS: "§G当地可用人力 +20%§!\\n§G当地建造速度 +10%§!"
 SCR_BAC_P3_NEG: "§R当地资源产出 -10%§!"
 SCR_BAC_P4_DESC: "霜牡与雪牝的愿望只能实现一个。剧团替他们选了：让这片土地在寒冬里继续开工，至于暖炉前的空椅子，无人过问。"
 SCR_BAC_P4_POS: "§G当地工厂产出 +15%§!\\n§G当地建造速度 +15%§!"
 SCR_BAC_P4_NEG: "§R当地可用人力 -15%§!"
 SCR_BAC_P5_DESC: "狼母离巢前留下的规矩，剧团抄进了巡演手册。补给车队沿着七丘的旧道穿过荒原，沿途的村庄会少掉一些年轻人。"
 SCR_BAC_P5_POS: "§G当地补给 +2§!\\n§G当地工厂产出 +10%§!"
 SCR_BAC_P5_NEG: "§R当地可用人力 -10%§!"
 SCR_BAC_COST: "§Y启程代价：75 政治点§!"
 SCR_BAC_REWARD: "§Y巡演回报：§!剧团获得 §G1 座地图外民用工厂§!。\\n每座州只能承办一次巡演；地块修正持续 §Y365 天§!。"
 SCR_BAC_DEPART: "启程巡演"
 SCR_BAC_PICK: "另选一州"
 SCR_BAC_ALL_ON: "显示全世界"
 SCR_BAC_ALL_OFF: "仅显示我方"
 SCR_BAC_COOLDOWN: "巡演冷却：[?SCR_tour_cd] 天"
 SCR_BAC_DEPART_HINT: "选中任意一个尚未巡演的州（含他国领土）即可启程；每次巡演后冷却 30 天。"
 SCR_BAC_MAPMODE_HINT: "底部地图模式「酒神巡演」实时显示当前生效剧目：绿《湖中至宝》、红《一百零一日》、紫《梦中奇缘》、冰蓝《霜牡与雪牝》、暗金《七丘的狼母》；灰为已巡演，暖白为可巡演。"
 SCR_BAC_STATS: "已巡演 [?SCR_tour_count] 州　·　地图外民用工厂 +[?SCR_tour_factory]"
 SCR_BAC_MAPICON_TT: "§Y[FROM.GetName]§!\\n点击选定为本季巡演舞台。"

 SCR_tour_dm_der_ring: "巡演·湖中至宝"
 SCR_tour_dm_der_ring_desc: "湖中的至宝留在了当地。工厂与矿脉都记得那场演出，只有年轻人追着倒影离开了。"
 SCR_tour_dm_one_hundred_one_days: "巡演·一百零一日"
 SCR_tour_dm_one_hundred_one_days_desc: "征召名册伪装成节目单发遍了全城。人手充足，车间却空了一半。"
 SCR_tour_dm_wonderland: "巡演·梦中奇缘"
 SCR_tour_dm_wonderland_desc: "梦游者修好了屋顶与道路，也顺手搬空了仓库里的矿石。"
 SCR_tour_dm_frost_deer: "巡演·霜牡与雪牝"
 SCR_tour_dm_frost_deer_desc: "寒冬里机器不停，暖炉前却少了许多熟悉的面孔。"
 SCR_tour_dm_mother_wolf: "巡演·七丘的狼母"
 SCR_tour_dm_mother_wolf_desc: "补给车队沿七丘旧道穿过荒原，村庄的年轻人被编进了随行剧团。"

 MAPMODE_SCR_BACCHANAL_MAP_MODE_NAME: "酒神巡演"
 MAPMODE_SCR_BACCHANAL_MAP_MODE: "§Y酒神巡演§!"
 MAPMODE_SCR_BACCHANAL_MAP_MODE_DESCRIPTION: "按正在上演的剧目给州上色，并标出剧团可巡演与已巡演的土地。"
 scr_bacchanal_map_mode_tooltip: "§Y[FROM.GetName]§!\\n酒神巡演：地块实时状态"
 scr_bacchanal_map_mode_tooltip_delayed: "金色为《湖中至宝》，猩红为《一百零一日》，紫色为《梦中奇缘》，冰蓝为《霜牡与雪牝》，暗金为《七丘的狼母》；灰色为已巡演，暖白为可巡演。"
`;

let buf = fs.readFileSync(file);
// 去掉 BOM 后再按文本处理；输出时只放回一个 BOM。
let text = buf.toString('utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
const idx = text.indexOf(MARK);
if (idx >= 0) text = text.slice(0, idx);
text = text.replace(/\s+$/, '');
const out = '﻿' + (text + MARK + keys).replace(/\n/g, '\r\n');
fs.writeFileSync(file, out, 'utf8');
console.log('loc updated:', file);
