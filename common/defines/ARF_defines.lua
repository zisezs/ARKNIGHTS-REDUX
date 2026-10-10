NDefines.NGame.START_DATE = "1094.6.1.12"
NDefines.NGame.END_DATE = "1145.1.4.19"
NDefines.HANDS_OFF_START_TAG = "ZZZ" --与原版不同

NDefines.NCountry.MIN_STABILITY = -1.0 --与原版不同

NDefines.NProduction.MAX_CIV_FACTORIES_PER_LINE = 20 --与原版不同	-- Max number of factories that can be assigned a single production line.
NDefines.NProduction.MAX_MIL_FACTORIES_PER_LINE = 200 --与原版不同
NDefines.NProduction.MAX_MIL_FACTORIES_VISIBLE_FOR_MIL_EQUIPMENT_LINE = 20 --与原版不同

NDefines.NBuildings.MAX_SHARED_SLOTS = 36 --25				-- Max slots shared by factories

NDefines.NMilitary.BASE_FEMALE_DIVISIONAL_COMMANDER_CHANCE = 0.5

NDefines.NMilitary.EQUIPMENT_COMBAT_LOSS_FACTOR = 0.25 -- 0.68
NDefines.NMilitary.LAND_COMBAT_STR_DAMAGE_MODIFIER = 0.01 -- 0.06
NDefines.NMilitary.LAND_COMBAT_ORG_DAMAGE_MODIFIER = 0.03 -- 0.053
NDefines.NMilitary.RETREAT_SPEED_FACTOR = 1.0 -- 0.25
NDefines.NMilitary.SUPPLY_GRACE = 240 --72				-- troops always carry 3 days of food and supply
NDefines.NMilitary.OUT_OF_SUPPLY_SPEED = -0.6	-- -0.8
NDefines.NMilitary.NON_CORE_SUPPLY_SPEED = -0.25 -- -0.5
NDefines.NMilitary.NON_CORE_SUPPLY_AIR_SPEED = -0.15 -- -0.25
NDefines.NMilitary.OUT_OF_SUPPLY_MORALE = -0.15 -- -0.2
NDefines.NMilitary.MAX_ARMY_EXPERIENCE = 1000 -- 500
NDefines.NMilitary.MAX_NAVY_EXPERIENCE = 1000 -- 500
NDefines.NMilitary.MAX_AIR_EXPERIENCE = 1000 -- 500

NDefines.NMilitary.MAX_DIVISION_BRIGADE_WIDTH = 6 -- 5		-- Max width of regiments in division designer (non-HQ templates).
NDefines.NMilitary.MAX_DIVISION_BRIGADE_HEIGHT = 6 -- 5		-- Max height of regiments in division designer (non-HQ templates).
NDefines.NMilitary.MIN_DIVISION_BRIGADE_HEIGHT = 5 -- 4		-- Min height of regiments in division designer.
NDefines.NMilitary.MAX_DIVISION_SUPPORT_WIDTH = 2 -- 1		-- Max width of support in division designer (non-HQ templates).
NDefines.NMilitary.MAX_DIVISION_SUPPORT_HEIGHT = 6 -- 5		-- Max height of support in division designer (non-HQ templates).
NDefines.NMilitary.MAX_REGIMENTAL_SUPPORT_WIDTH = 6 -- 5	-- Max width of regimental supports in division designer.
NDefines.NMilitary.MAX_REGIMENTAL_SUPPORT_HEIGHT = 2 -- 1	-- Max height of regimental supports in division designer.
NDefines.NMilitary.MAX_HQ_SUPPORT_WIDTH = 2 -- 1			-- Max width of support in division designer (Army HQ templates).
NDefines.NMilitary.REGIMENTAL_SUPPORT_REQUIRED_BATTALIONS = { 3, 4 } -- For each regimental support row, how many battalions are required in the regiment to be able to place a support in that row.
	
NDefines.NAir.COMBAT_BETTER_AGILITY_DAMAGE_REDUCTION = 0.85 -- 0.45
NDefines.NAir.DETECT_CHANCE_FROM_AIRCRAFTS_EFFECTIVE_COUNT = 350 -- 3000
NDefines.NAir.ANTI_AIR_PLANE_DAMAGE_FACTOR = 0.02 -- 0.8
NDefines.NAir.ANTI_AIR_PLANE_DAMAGE_CHANCE = 0.03 -- 0.1
NDefines.NAir.ANTI_AIR_ATTACK_TO_DAMAGE_REDUCTION_FACTOR = 0.1 -- 1.0
NDefines.NAir.AIR_DEPLOYMENT_DAYS = 1 -- 2

NDefines.NSupply.RAILWAY_CONVERSION_COOLDOWN = 2  --与原版不同 -- railways will be put on cooldown when they are captured by enemy and will not be usable during the cooldown
NDefines.NSupply.RAILWAY_CONVERSION_COOLDOWN_CORE = 1 --与原版不同
-- ==== 2026-09-22 指挥上限 / 人口补给 ====
NDefines.NMilitary.CORPS_COMMANDER_DIVISIONS_CAP = 48 -- 24  军团指挥官可指挥师数上限
NDefines.NMilitary.FIELD_MARSHAL_DIVISIONS_CAP = 48 -- 24  元帅可指挥师数上限
NDefines.NSupply.AVAILABLE_MANPOWER_STATE_SUPPLY = 0.54 -- 0.18  人口（可用人力）对州补给上限的贡献，+200%
