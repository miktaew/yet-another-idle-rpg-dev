"use strict";

/**
 * Regression tests for the skill xp model.
 *
 * Why this loads the source the way it does:
 *   src/skills.js cannot be imported directly in Node. The project's imports are
 *   circular by design — thirteen modules import back from main.js — and that
 *   cycle only resolves in the browser, where main.js is the entry point.
 *   Importing skills.js on its own dies with "Cannot access 'InventoryHaver'
 *   before initialization".
 *
 *   So the real source text is read, its import statements are replaced with
 *   stubs for the three functions the Skill class actually uses, and the result
 *   is imported from a temp file. The code under test is therefore the shipped
 *   code, not a reimplementation of it — which is the whole point. If the class
 *   ever stops depending only on those three functions, this will fail loudly at
 *   load rather than silently test nothing.
 *
 * What is covered: the guards that stop a non-finite xp amount from poisoning a
 * skill permanently. That failure mode is nasty and silent — once total_xp is
 * NaN, NaN + x is NaN, so every later legitimate gain is lost, the level-up
 * branch recomputes a level of 0 forever, and the panels render "NaN".
 *
 * Run with: npm test
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const repo_root = path.resolve(import.meta.dirname, "..");

const STUBS = `
// --- injected by scripts/test-skills.mjs: stand-ins for the circular imports ---
const get_total_level_bonus = () => 0;
const get_total_skill_coefficient = () => 1;
const get_total_skill_level = (id) => (skills[id] ? skills[id].current_level : 0);
const get_crafting_quality_caps = () => ({});
const stat_names = {};
`;

async function load_skills_module() {
    const source_path = path.join(repo_root, "src/skills.js");
    let source = fs.readFileSync(source_path, "utf8");

    const import_count = (source.match(/^import .*$/gm) || []).length;
    if (import_count === 0) {
        throw new Error("src/skills.js has no import statements - this harness's assumptions no longer hold.");
    }
    source = source.replace(/^import .*$/gm, "");

    if (!source.includes('"use strict";')) {
        throw new Error('src/skills.js no longer starts with "use strict" - cannot place the stubs.');
    }
    source = source.replace('"use strict";', '"use strict";' + STUBS);

    const temp_path = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "yairp-test-")), "skills.mjs");
    fs.writeFileSync(temp_path, source);
    return import(pathToFileURL(temp_path).href);
}

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
    if (condition) {
        passed++;
        console.log(`  ok    ${name}`);
    } else {
        failures.push(`${name} ${detail}`.trim());
        console.log(`  FAIL  ${name} ${detail}`);
    }
}

/** Collects console.error output so the tests can assert that a guard reported itself. */
function capture_errors(run) {
    const captured = [];
    const original = console.error;
    console.error = (...args) => captured.push(args.join(" "));
    try {
        run();
    } finally {
        console.error = original;
    }
    return captured;
}

const { skills } = await load_skills_module();

console.log(`skills loaded: ${Object.keys(skills).length}`);

// --- non-finite xp must never reach total_xp -------------------------------
{
    const skill = skills["Woodcutting"];
    const before = skill.total_xp;

    const nan_errors = capture_errors(() => skill.add_xp({ xp_to_add: NaN }));
    check("NaN xp leaves total_xp untouched", skill.total_xp === before, `total_xp=${skill.total_xp}`);
    check("NaN xp is reported", nan_errors.some(e => e.includes("non-finite")));

    // isNaN(Infinity) is false, which is how Infinity used to get through.
    const inf_errors = capture_errors(() => skill.add_xp({ xp_to_add: Infinity }));
    check("Infinity xp leaves total_xp untouched", skill.total_xp === before, `total_xp=${skill.total_xp}`);
    check("Infinity xp is reported", inf_errors.some(e => e.includes("non-finite")));

    skill.add_xp({ xp_to_add: 25 });
    check("a normal gain still applies",
        Number.isFinite(skill.total_xp) && skill.total_xp > 0 && Number.isFinite(skill.current_xp),
        `total_xp=${skill.total_xp} current_xp=${skill.current_xp} level=${skill.current_level}`);
}

// --- the level-up loop must terminate and settle exactly on max level ------
{
    const skill = skills["Mining"];
    const started_at = process.hrtime.bigint();
    skill.add_xp({ xp_to_add: 1e30 });
    const elapsed_ms = Number(process.hrtime.bigint() - started_at) / 1e6;

    check("a huge finite gain does not hang the level-up loop", elapsed_ms < 2000, `${elapsed_ms.toFixed(0)}ms`);
    check("it settles on max level", skill.current_level === skill.max_level,
        `level=${skill.current_level}/${skill.max_level}`);
    check("the max-level sentinels are set",
        skill.current_xp === "Max" && skill.xp_to_next_lvl === Infinity,
        `current_xp=${skill.current_xp} xp_to_next_lvl=${skill.xp_to_next_lvl}`);
}

// --- levels below the cap are unaffected by the loop bound -----------------
{
    const skill = skills["Herbalism"];
    // Enough for a few levels, nowhere near max.
    skill.add_xp({ xp_to_add: skill.base_xp_cost * 5 });
    check("a mid-range gain yields a sane level",
        Number.isFinite(skill.current_level) && skill.current_level > 0 && skill.current_level < skill.max_level,
        `level=${skill.current_level}`);
    check("a mid-range gain keeps xp numeric",
        Number.isFinite(skill.current_xp) && Number.isFinite(skill.xp_to_next_lvl),
        `current_xp=${skill.current_xp} xp_to_next_lvl=${skill.xp_to_next_lvl}`);
}

// --- the parent multiplier must never be non-finite ------------------------
{
    const skill = skills["Fishing"];
    check("Fishing has a parent skill to test against", Boolean(skill.parent_skill), `parent=${skill.parent_skill}`);

    const parent = skills[skill.parent_skill];
    const saved_level = parent.current_level;

    // Math.max(0, NaN) is NaN and anything ** NaN is NaN. This multiplier is
    // applied straight to xp_to_add, so one bad level would poison stored xp.
    let multiplier;
    const errors = capture_errors(() => {
        parent.current_level = NaN;
        multiplier = skill.get_parent_xp_multiplier();
    });
    check("a corrupted parent level yields a finite multiplier", Number.isFinite(multiplier), `multiplier=${multiplier}`);
    check("a corrupted parent level is reported", errors.some(e => e.includes("parent xp multiplier")));

    parent.current_level = saved_level;
    check("a healthy parent yields a finite multiplier", Number.isFinite(skill.get_parent_xp_multiplier()));
}

console.log("");
if (failures.length > 0) {
    console.error(`${failures.length} check(s) failed:`);
    for (const failure of failures) {
        console.error(`  - ${failure}`);
    }
    process.exit(1);
}
console.log(`all ${passed} checks passed.`);
