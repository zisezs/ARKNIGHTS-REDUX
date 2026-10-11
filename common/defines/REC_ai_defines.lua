-- =============================================================================
-- 全局 AI 强度 defines（对所有国家生效，与原版 00_defines.lua 合并加载）
--
-- 只动 AI 行为常数，不动战斗/生产数值，因此不会影响玩家侧平衡。
-- 每条后面注释的是 vanilla 原值，想回调就改回那个数或直接删掉该行。
-- =============================================================================

-- ---- 陆军 XP：更愿意改编制、换装备、点学说（原版 AI 常年拿着开局模板）----
NDefines.NAI.DESIRE_USE_XP_TO_UPDATE_LAND_TEMPLATE = 4.0		-- 2.0
NDefines.NAI.DESIRE_USE_XP_TO_UPGRADE_LAND_EQUIPMENT = 2.5		-- 1.0
NDefines.NAI.DESIRE_USE_XP_TO_UNLOCK_LAND_DOCTRINE = 1.2		-- 0.5
NDefines.NAI.DAYS_BETWEEN_CHECK_BEST_TEMPLATE = 3			-- 7
NDefines.NAI.DAYS_BETWEEN_CHECK_BEST_EQUIPMENT = 3			-- 7
NDefines.NAI.DAYS_BETWEEN_CHECK_BEST_DOCTRINE = 15			-- 30
NDefines.NAI.DEFAULT_MODULE_VARIANT_CREATION_XP_CUTOFF_LAND = 15	-- 35，攒够多少 XP 才去做新改型装备
NDefines.NAI.VARIANT_CREATION_XP_RESERVE_LAND = 80			-- 50，为做改型预留的 XP

-- ---- 部署：不再把师扣在后面等练满/等满装，早期就敢拉上场 ----
NDefines.NAI.DEPLOY_MIN_TRAINING_WAR_FACTOR = 0.85			-- 0.95
NDefines.NAI.DEPLOY_MIN_EQUIPMENT_WAR_FACTOR = 0.85			-- 0.95
NDefines.NAI.DEPLOY_MIN_TRAINING_PEACE_FACTOR = 0.9			-- 0.98
NDefines.NAI.DEPLOY_MIN_EQUIPMENT_PEACE_FACTOR = 0.9			-- 0.98

-- ---- 产能：少囤装备多产装备，缺装就上线 ----
NDefines.NAI.PRODUCTION_EQUIPMENT_SURPLUS_FACTOR = 0.6		-- 0.8，在用装备之外还要囤的比例

-- ---- 进攻欲望：兵力略劣也敢推进、更敢动手 ----
NDefines.NAI.LOCATION_BALANCE_TO_ADVANCE = -0.15			-- 0.0，部队敢于向前推进的兵力比下限
NDefines.NAI.DESPERATE_AI_MIN_ORG_BEFORE_ATTACK = 0.2		-- 0.3，绝境时组织度多低也敢打
NDefines.NAI.AI_FRONT_MOVEMENT_FACTOR_FOR_READY = 0.15		-- 0.25，战线多少比例在移动才算"没就绪"
NDefines.NAI.DECLARE_WAR_RELATIVE_FORCE_FACTOR = 0.3		-- 0.5，宣战时多看重实力对比
NDefines.NAI.BASE_RELUCTANCE = 14					-- 20，所有外交提案的基础抵触
NDefines.NAI.DIPLOMATIC_ACTION_PROPOSE_SCORE = 40			-- 50，AI 主动提出外交行动的门槛
NDefines.NAI.DYNAMIC_STRATEGIES_THREAT_FACTOR = 6.0			-- 4.0，别国威胁生成战略的灵敏度

-- ---- 战区与兵力分配：主力往最重要的战线堆 ----
NDefines.NAITheatre.AI_THEATRE_AI_FRONT_MIN_DESIRED_RATIO = 0.28	-- 0.18
NDefines.NAITheatre.AI_THEATRE_DISTRIBUTION_MAX_PERCENT_UNMET_DEMAND_PER_FRONT = 0.7	-- 0.5

-- ---- 研发：更愿意追新科技、不那么偏爱短研发 ----
NDefines.NAI.RESEARCH_YEARS_BEHIND_FACTOR = 0.35			-- 0.2，落后多少年要着急
NDefines.NAI.RESEARCH_AHEAD_OF_TIME_FACTOR = 2.5			-- 4.0，太早研发的惩罚
NDefines.NAI.RESEARCH_AHEAD_BONUS_FACTOR = 35				-- 25.0，提前研发的收益
NDefines.NAI.RESEARCH_LENGTH_FACTOR = 2				-- 3，对"研发耗时长"的排斥

-- ---- 空军：飞机别闲在机场上 ----
NDefines.NAir.AI_ALLOWED_PLANES_KEPT_IN_RESERVE = 0.05		-- 0.10，留作预备的飞机比例
NDefines.NAI.AI_FRACTION_OF_FIGHTERS_RESERVED_FOR_INTERCEPTION = 0.2	-- 0.25
NDefines.NAI.WANTED_LAND_PLANES_PER_DIVISION = 30			-- 20，每个师想要多少陆基飞机
NDefines.NAI.WANTED_LAND_PLANES_TOTAL_MAX_PER_DIVISION = 130		-- 100，每师飞机需求上限
