"use strict";

/**
 * Regression tests for the skill xp model and the height/race helpers.
 *
 * Why the modules are loaded the way they are:
 *   Most of src/ cannot be imported directly in Node. The project's imports are
 *   circular by design — thirteen modules import back from main.js — and that
 *   cycle only resolves in the browser, where main.js is the entry point.
 *   Importing src/skills.js on its own dies with "Cannot access 'InventoryHaver'
 *   before initialization".
 *
 *   So the real source text is read, the import statements that reach into the
 *   cycle are replaced with stubs, and the result is imported from a temp file.
 *   The code under test is therefore the shipped code, not a reimplementation of
 *   it — which is the whole point. Imports that do NOT reach into the cycle are
 *   left alone, so the test uses real data where it can: src/races.js has no
 *   imports at all, so the racial height modifiers below are the real ones.
 *
 *   Each loader asserts its own assumptions about the source, so if a module
 *   stops matching them this fails loudly at load rather than silently testing
 *   nothing.
 *
 * Run with: npm test
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const repo_root = path.resolve(import.meta.dirname, "..");

/**
 * Loads a module from src/, replacing the imports named in `strip` with the given
 * stub source. Imports not named in `strip` are left in place.
 *
 * @param {String} relative_path e.g. "src/skills.js"
 * @param {String[]} strip module specifiers whose import lines are removed
 * @param {String} stub_source declarations replacing what those imports provided
 */
async function load_with_stubs(relative_path, strip, stub_source) {
    const source_path = path.join(repo_root, relative_path);
    let source = fs.readFileSync(source_path, "utf8");

    for (const specifier of strip) {
        const pattern = new RegExp(`^import .*${specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*$`, "m");
        if (!pattern.test(source)) {
            throw new Error(`${relative_path} no longer imports from ${specifier} - this harness is out of date.`);
        }
        source = source.replace(pattern, "");
    }

    if (!source.includes('"use strict";')) {
        throw new Error(`${relative_path} no longer starts with "use strict" - cannot place the stubs.`);
    }
    source = source.replace('"use strict";', '"use strict";\n' + stub_source);

    const temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), "yairp-test-"));
    // Keep the original basename so relative imports left in place still resolve
    // against a copy of src/.
    const src_copy = path.join(temp_dir, "src");
    fs.cpSync(path.join(repo_root, "src"), src_copy, { recursive: true });
    const temp_path = path.join(src_copy, path.basename(relative_path));
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

// ===========================================================================
// src/skills.js — the skill xp model
// ===========================================================================

const { skills } = await load_with_stubs(
    "src/skills.js",
    ["./character.js", "./crafting_recipes.js", "./misc.js"],
    `
const get_total_level_bonus = () => 0;
const get_total_skill_coefficient = () => 1;
const get_total_skill_level = (id) => (skills[id] ? skills[id].current_level : 0);
const get_crafting_quality_caps = () => ({});
const stat_names = {};
`);

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
    skill.add_xp({ xp_to_add: skill.base_xp_cost * 5 });
    check("a mid-range gain yields a sane level",
        Number.isFinite(skill.current_level) && skill.current_level > 0 && skill.current_level < skill.max_level,
        `level=${skill.current_level}`);
    check("a mid-range gain keeps xp numeric",
        Number.isFinite(skill.current_xp) && Number.isFinite(skill.xp_to_next_lvl),
        `current_xp=${skill.current_xp} xp_to_next_lvl=${skill.xp_to_next_lvl}`);
}

// --- the invariant the display code relies on ------------------------------
// The activity panel and the skill bars decide maxed-ness from current_xp ===
// "Max" plus current_level >= max_level. That is only sound if add_xp sets the
// two together, so pin it down.
{
    const maxed = skills["Mining"];
    const not_maxed = skills["Herbalism"];

    check("a maxed skill reports both sentinel and level",
        maxed.current_xp === "Max" && maxed.current_level === maxed.max_level,
        `current_xp=${maxed.current_xp} level=${maxed.current_level}/${maxed.max_level}`);

    check("an unmaxed skill claims neither",
        not_maxed.current_xp !== "Max" && not_maxed.current_level < not_maxed.max_level,
        `current_xp=${not_maxed.current_xp} level=${not_maxed.current_level}/${not_maxed.max_level}`);

    const inconsistent = Object.values(skills).filter(s =>
        (s.current_xp === "Max") !== (s.current_level >= s.max_level));
    check("no skill disagrees with its own max sentinel",
        inconsistent.length === 0,
        inconsistent.map(s => `${s.skill_id}(xp=${s.current_xp}, ${s.current_level}/${s.max_level})`).join(", "));
}

// --- the per-gain cap must leave every skill levelable ---------------------
// skills.js warns when base_xp_cost < 1/skill_xp_gains_cap. The cap is live now,
// so a future skill below that floor would be unlevelable rather than just noisy.
{
    const cap = 0.1; // skill_xp_gains_cap
    const under_floor = Object.values(skills).filter(s => s.base_xp_cost * cap < 1);
    check("every skill stays levelable under the per-gain cap",
        under_floor.length === 0,
        under_floor.map(s => `${s.skill_id}(base_xp_cost=${s.base_xp_cost})`).join(", "));
}

// --- the parent multiplier must never be non-finite ------------------------
{
    const skill = skills["Fishing"];
    check("Fishing has a parent skill to test against", Boolean(skill.parent_skill), `parent=${skill.parent_skill}`);

    const parent = skills[skill.parent_skill];
    const saved_level = parent.current_level;

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

// ===========================================================================
// src/person.js — height and race
// ===========================================================================
// Only the inventory import reaches into the cycle; src/races.js has no imports,
// so the racial modifiers exercised here are the real ones.

const { Person } = await load_with_stubs(
    "src/person.js",
    ["./inventory.js"],
    `
class InventoryHaver {
    constructor() {}
}
`);

{
    const make = (height, race) => new Person({ height, race, age: "adult" });

    // The bug: both lookups read off the instance instead of this.personal, so
    // every character measured 170 - exactly height_values["average"].
    const distinct = new Set([
        make("short", "human").getNumericalHeight(),
        make("average", "human").getNumericalHeight(),
        make("tall", "human").getNumericalHeight(),
    ]);
    check("numerical height varies with the chosen height", distinct.size === 3,
        `values=${[...distinct].join(",")}`);

    check("the relative height choice is read from personal",
        make("short", "human").getNumericalHeight() < make("tall", "human").getNumericalHeight());

    check("the racial modifier is read from personal",
        make("average", "dwarf").getNumericalHeight() < make("average", "human").getNumericalHeight(),
        `dwarf=${make("average", "dwarf").getNumericalHeight()} human=${make("average", "human").getNumericalHeight()}`);

    check("universal height is not the same answer for everyone",
        new Set([
            make("short", "dwarf").getUniversalHeight(),
            make("average", "human").getUniversalHeight(),
            make("tall", "elf").getUniversalHeight(),
        ]).size === 3);

    // This is the case that makes dialogues.js's "very short" branch reachable.
    check('a short nekomimi measures "very short"',
        make("short", "nekomimi").getUniversalHeight() === "very short",
        `got=${make("short", "nekomimi").getUniversalHeight()}`);

    check('an average human still measures "average"',
        make("average", "human").getUniversalHeight() === "average",
        `got=${make("average", "human").getUniversalHeight()}`);

    // An unset personal.height must still fall back rather than throw.
    check("an unset height falls back instead of throwing",
        Number.isFinite(new Person({}).getNumericalHeight()),
        `got=${new Person({}).getNumericalHeight()}`);
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
