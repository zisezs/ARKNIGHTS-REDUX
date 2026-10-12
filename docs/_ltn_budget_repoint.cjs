// 把旧政治段 15 个被外部当门槛用的国策 id，改指到新预算带。
// 用法：node docs/_ltn_budget_repoint.cjs [--apply]
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const MAP = {
  LTN_twin_rule: "LTN_new_year",
  LTN_bridge_of_towers: "LTN_tell_the_ministers",
  LTN_empress_festival: "LTN_voice_on_tour",
  LTN_royal_orchestra: "LTN_voice_on_tour",
  LTN_fix_the_capital: "LTN_tell_the_ministers",
  LTN_read_the_score: "LTN_tell_the_ministers",
  LTN_nine_copies: "LTN_elector_loyalty_problem",
  LTN_electors_consent: "LTN_elector_loyalty_problem",
  LTN_gendarme_and_spy: "LTN_imperial_overture",
  LTN_hall_of_the_law: "LTN_hlinmarts_plan",
  LTN_annihilation_warrant: "LTN_hlinmarts_plan",
  LTN_kill_at_the_start: "LTN_lambs_and_goats_return",
  LTN_the_rehearsal: "LTN_open_final_vote",
  LTN_new_golden_law: "LTN_round_table_law",
  LTN_art_patronage: "LTN_serious_research",
};

const FILES = [
  "common/decisions/categories/LTN_categories.txt",
  "common/decisions/LTN_decisions.txt",
  "common/decisions/LTN_ops_decisions.txt",
  "common/military_industrial_organization/organizations/LTN_organization.txt",
  "common/bookmarks/bm1.txt",
];

const log = [];
for (const rel of FILES) {
  const p = path.join(ROOT, rel);
  const src = fs.readFileSync(p, "utf8");
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const lines = src.split(/\r?\n/);
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // 只改门槛语义：has_completed_focus / prerequisite / 裸 focus 列表项；不动 flag、不动图标名
    const isBare = rel === "common/bookmarks/bm1.txt";
    if (!/has_completed_focus\s*=\s*LTN_|^\s*focus\s*=\s*LTN_/.test(l) && !(isBare && /^\s*LTN_\w+\s*$/.test(l))) continue;
    for (const [oldId, newId] of Object.entries(MAP)) {
      const re = new RegExp("(=\\s*)" + oldId + "\\b");
      const reBare = isBare ? new RegExp("^(\\s*)" + oldId + "\\s*$") : null;
      if (re.test(l)) {
        lines[i] = l.replace(re, "$1" + newId);
        log.push(`${rel}:${i + 1}  ${oldId} -> ${newId}`);
        n++;
      } else if (reBare && reBare.test(l)) {
        lines[i] = l.replace(reBare, "$1" + newId);
        log.push(`${rel}:${i + 1}  ${oldId} -> ${newId}（书签路线卡）`);
        n++;
      }
    }
  }
  // OR 块里若出现连续重复行，折叠成一行
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && lines[i].trim() === lines[i - 1].trim() && /^\s*(has_completed_focus|focus) = LTN_/.test(lines[i])) {
      log.push(`${rel}:${i + 1}  折叠重复条件 ${lines[i].trim()}`);
      continue;
    }
    out.push(lines[i]);
  }
  if (APPLY && (n || out.length !== lines.length)) fs.writeFileSync(p, out.join(eol), "utf8");
}
console.log(log.join("\n"));
console.log(`\n共 ${log.filter(s => !s.includes("折叠")).length} 处改指，${log.filter(s => s.includes("折叠")).length} 处折叠重复。${APPLY ? "已写入。" : "--dry（未写入）"}`);
