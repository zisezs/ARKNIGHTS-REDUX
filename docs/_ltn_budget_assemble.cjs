// 把新的政治带拼进 LTN_political.txt，并把经济/军事/外交三带整体下移 13 行。
// 用法：node docs/_ltn_budget_assemble.cjs [--dry]
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const FOCUS = path.join(ROOT, "common/national_focus/LTN_political.txt");
const BAND = path.join(ROOT, "docs/_ltn_budget_band.txt");
const DRY = process.argv.includes("--dry");

const SHIFT = 13;

const HEADER = `# ============================================================================
# 莱塔尼亚联合帝国 (LTN) · 国策树
#
# 【政治带】=「联合帝国预算计划」26 格，y=0..18（2026-10-11 重做）
#   起始格 LTN_new_year（新的一年）；顶替旧「双塔共治」政治段 33 格。
#   主轴：预算计划 → 帝国会议 → 最终投票 → 赫琳玛特百日集权 → 新金律
#   版式：中轴 x=0 + 菱形双肩 x=±4，死头格 LTN_elector_loyalty_problem 走内列 x=-2；
#         包围盒 x∈[-4,4] 对称、起始格落在顶行中线、极值列各有 6~7 格（无孤立节点）。
#
# 【经济带】金库与工坊  y=20..25   线首 LTN_imperial_treasury
# 【军事带】点兵册      y=27..32   线首 LTN_muster_roll
# 【外交带】双塔之外    y=34..39   线首 LTN_foreign_towers
#   —— 三条带的节点内容一字未改，只做 y+13 平移（2026-10-11 为让开新政治带）。
#   各自线首无前置，跨带零前置引用，所以平移不影响可达性。
#
# 政治带配套文件（改政治线先看这些）：
#   事件    events/LTN_budget.txt                        （命名空间 LTN_budget，15 个）
#   决议    common/decisions/LTN_budget_decisions.txt    （选帝侯在行动 / 拉拢选帝侯）
#   精神    common/ideas/LTN budget_ideas.txt            （9 条一次性精神）
#   仪表    common/dynamic_modifiers/LTN_budget_dynamic_modifiers.txt（诸侯的效忠）
#   脉冲    common/scripted_effects/LTN_budget_effects.txt + common/on_actions/LTN_on_actions.txt
#   初值    history/countries/LTN - Leithanien.txt 末尾的「预算计划」段
#   文案    localisation/simp_chinese/ARF_LTN_budget_l_simp_chinese.yml
#   自检    node docs/_ltn_budget_check.cjs
#
# 旧政治段被外部当门槛用的 15 格，门槛已全部改指新格，对照表见
#   docs/_ltn_budget_gate_map.txt（决议/军工企业/书签三处）
#
# 图标：26 格全部复用 interface/_ARF_goals/LTN_goals.gfx 已注册的 GFX_focus_LTN_*，不新出图。
# 定位：initial_show_position = LTN_new_year
# ============================================================================`;

function main() {
  const src = fs.readFileSync(FOCUS, "utf8");
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const lines = src.split(/\r?\n/);

  const openIdx = lines.findIndex(l => l.trim() === "focus_tree = {");
  if (openIdx < 0) throw new Error("找不到 focus_tree = {");

  const showIdx = lines.findIndex(l => /^\s*initial_show_position = \{\s*$/.test(l));
  if (showIdx < 0) throw new Error("找不到 initial_show_position");
  let showClose = showIdx;
  while (!/^\t\}\s*$/.test(lines[showClose])) showClose++;

  const econIdx = lines.findIndex(l => l.includes("经济带【金库与工坊】"));
  if (econIdx < 0) throw new Error("找不到经济带标题行");

  // 已经拼过一遍就不再重复（幂等）
  const already = lines.some(l => /^\s*id = LTN_new_year\s*$/.test(l));
  if (already) {
    console.log("政治带已是新版（含 LTN_new_year），只做必要校验，不重复拼接。");
    return;
  }

  const band = fs.readFileSync(BAND, "utf8").split(/\r?\n/);
  // 碎片末尾自带经济带 3 行表头，所以正文取到 econIdx-1（含）之前
  const head = [HEADER, ...lines.slice(openIdx, showClose + 1)].map(l =>
    /^\t\tfocus = LTN_twin_rule\s*$/.test(l) ? "\t\tfocus = LTN_new_year" : l
  );
  const tail = lines.slice(econIdx + 2).map(l => {
    const m = l.match(/^(\t\ty = )(-?\d+)(\s*)$/);
    if (m) return m[1] + (parseInt(m[2], 10) + SHIFT) + m[3];
    return l
      .replace(/y=7\.\.12/g, `y=${20}..${25}`)
      .replace(/y=14\.\.19/g, `y=${27}..${32}`)
      .replace(/y=21\.\.26/g, `y=${34}..${39}`);
  });

  const out = [...head, "", ...band, ...tail].join(eol);
  const yCount = (out.match(/^\t\ty = /gm) || []).length;
  const idCount = (out.match(/^\t\tid = /gm) || []).length;
  console.log(`经济带表头 ${econIdx + 1} 行 / 政治带 ${band.length} 行 / 尾段 ${tail.length} 行`);
  console.log(`拼接后：focus 数 ${idCount}（应 26 + 其余三线 72 = 98），y 行 ${yCount}`);

  if (DRY) {
    fs.writeFileSync(path.join(ROOT, "docs/_ltn_budget_preview.txt"), out, "utf8");
    console.log("--dry：写到 docs/_ltn_budget_preview.txt，原文件未动");
    return;
  }
  fs.writeFileSync(FOCUS + ".tmp", out, "utf8");
  fs.renameSync(FOCUS + ".tmp", FOCUS);
  console.log("已写入 " + FOCUS);
}

main();
