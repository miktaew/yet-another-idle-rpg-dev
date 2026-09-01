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

import { load_browser_free } from "./lib/browser-free-src.mjs";

const repo_root = path.resolve(import.meta.dirname, "..");

/**
 * Loads a module from src/, replacing the imports named in `strip` with the given
 * stub source. Imports not named in `strip` are left in place.
 *
 * @param {String} relative_path e.g. "src/data/skills.js"
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
    // Keep the original basename and the original directory layout so relative
    // imports left in place still resolve - src/translation.js reaches sideways
    // for ../locales at runtime, not just for its own siblings.
    const src_copy = path.join(temp_dir, "src");
    fs.cpSync(path.join(repo_root, "src"), src_copy, { recursive: true });
    fs.cpSync(path.join(repo_root, "locales"), path.join(temp_dir, "locales"), { recursive: true });
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
    "src/data/skills.js",
    ["./character.js", "./crafting_recipes.js", "./translation.js", "./main.js"],
    `
const get_total_level_bonus = () => 0;
const get_total_skill_coefficient = () => 1;
const get_total_skill_level = (id) => (skills[id] ? skills[id].current_level : 0);
const get_crafting_quality_caps = () => ({});
const language = "english";
// Skill.name() asks the translation layer for a display name and falls back to the
// English it already holds. The stub reproduces the fallback, which is the branch
// that matters here: these tests are about xp, not about localisation.
// getText now also carries the stat abbreviations that stat_names in misc.js used
// to hold, so the stub returns the id for those the same way.
const translationManager = {
    getDisplayName: (lang, english_name) => english_name,
    getText: (lang, id) => id,
};
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
    //Upstream moved this file; our content, their path.
    ["./components/inventory_component.js"],
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

// ===========================================================================
// src/conditions.js — the gate that decides whether a textline or a location
// is offered. A wrong shape here silently opens or closes content, so the exact
// argument shapes used by the content are pinned down.
// ===========================================================================

// Set before loading: the stub captures these object references at module
// evaluation time, and the tests below mutate their properties.
globalThis.__test_levels = {};
globalThis.__test_flags = { is_mofu_mofu_enabled: true };
globalThis.__test_season = "Summer";

const { process_conditions } = await load_with_stubs(
    "src/conditions.js",
    ["./character.js", "./game_time.js", "./main.js", "./person.js", "./races.js",
     "./registries.js"],
    `
const get_total_skill_level = (id) => __levels[id] || 0;
const current_game_time = { season: "Summer", hour: 12, day: 1, month: 1, year: 1,
    getSeason: () => globalThis.__test_season };
const global_flags = __flags;
const height_values = { "very short": 145, short: 155, average: 170, tall: 180, "very tall": 190 };
const playable_races = {};
//conditions.js reads the two registries through src/registries.js, which imports
//nothing - that indirection is what keeps the module graph acyclic. The tests fill
//them through __test_locations / __test_quests, like the levels and flags above.
const registries = {
    locations: globalThis.__test_locations ??= {},
    quests: globalThis.__test_quests ??= {},
};
`.replace("__levels", "globalThis.__test_levels").replace("__flags", "globalThis.__test_flags"));

{
    const hero = (town) => ({ reputation: { Village: 0, Slums: 0, Town: town }, money: 0, personal: {} });

    // Textline and Location both wrap the declared value in an array, so this is
    // the shape process_conditions actually receives.
    const wrap = (declared) => [declared];

    const rep_gate = wrap({ reputation: { Town: 150 } });

    check("a reputation gate is shut at 0", !process_conditions(rep_gate, hero(0)));
    check("a reputation gate is shut just below the threshold", !process_conditions(rep_gate, hero(149)));
    check("a reputation gate opens exactly at the threshold", Boolean(process_conditions(rep_gate, hero(150))));
    check("a reputation gate stays open above it", Boolean(process_conditions(rep_gate, hero(200))));

    // The default for both classes is [], wrapped to [[]]. That must read as "no
    // conditions", not as "conditions unmet".
    check("an undeclared condition offers the content", Boolean(process_conditions(wrap([]), hero(0))));
    // And a bare [] - what is_location_offered falls back to for a class that does
    // not declare the property at all - must also pass.
    check("an empty condition array offers the content", Boolean(process_conditions([], hero(0))));

    const mofu_gate = wrap({ flags: ["is_mofu_mofu_enabled"] });
    check("a flag gate is open while the flag is set", Boolean(process_conditions(mofu_gate, hero(0))));
    globalThis.__test_flags.is_mofu_mofu_enabled = false;
    check("a flag gate shuts when the flag is cleared", !process_conditions(mofu_gate, hero(0)));
    globalThis.__test_flags.is_mofu_mofu_enabled = true;
}

{
    /*
        The two condition shapes ported from upstream 19011a0. The tests that matter
        most are the guards: upstream divides by enemy_count unguarded, and every
        comparison against the resulting NaN is false - so an at_least gate written
        against a non-combat location OPENS instead of closing. Silent permissiveness
        is the failure mode worth a test.
    */
    const hero = () => ({ reputation: {}, money: 0, personal: {} });
    const wrap = (declared) => [declared];

    globalThis.__test_locations["Infested field"] = { enemy_count: 10, enemy_groups_killed: 0 };
    globalThis.__test_locations["Village"] = {};   //a Location: no enemy_count at all

    const one_clear = wrap({ location_clears: { "Infested field": { at_least: 1 } } });
    check("a clear gate is shut before the zone is cleared", !process_conditions(one_clear, hero()));

    globalThis.__test_locations["Infested field"].enemy_groups_killed = 9;
    check("a clear gate is shut one group short", !process_conditions(one_clear, hero()));

    globalThis.__test_locations["Infested field"].enemy_groups_killed = 10;
    check("a clear gate opens on the first full clear", Boolean(process_conditions(one_clear, hero())));

    globalThis.__test_locations["Infested field"].enemy_groups_killed = 25;
    check("a clear gate stays open above the threshold", Boolean(process_conditions(one_clear, hero())));

    const at_most_none = wrap({ location_clears: { "Infested field": { at_most: 0 } } });
    check("an at_most gate shuts once the zone is cleared", !process_conditions(at_most_none, hero()));
    globalThis.__test_locations["Infested field"].enemy_groups_killed = 0;
    check("an at_most gate is open while the zone is uncleared", Boolean(process_conditions(at_most_none, hero())));

    globalThis.__test_locations["Infested field"].enemy_groups_killed = 20;
    const between = wrap({ location_clears: { "Infested field": { at_least: 1, at_most: 3 } } });
    check("a range gate is open inside the range", Boolean(process_conditions(between, hero())));
    globalThis.__test_locations["Infested field"].enemy_groups_killed = 40;
    check("a range gate shuts above the range", !process_conditions(between, hero()));

    //The NaN trap: a location with no enemy_count counts as zero clears, not as unknown.
    const village_clear = wrap({ location_clears: { "Village": { at_least: 1 } } });
    check("a non-combat location reads as zero clears rather than passing",
        !process_conditions(village_clear, hero()));

    const nowhere = wrap({ location_clears: { "Nowhere at all": { at_least: 1 } } });
    check("an unknown location key shuts the gate rather than throwing",
        !process_conditions(nowhere, hero()));

    globalThis.__test_quests["Lost memory"] = { is_finished: false };
    const done = wrap({ quests_completed: ["Lost memory"] });
    const not_done = wrap({ quests_not_completed: ["Lost memory"] });

    check("quests_completed is shut while the quest is unfinished", !process_conditions(done, hero()));
    check("quests_not_completed is open while the quest is unfinished", Boolean(process_conditions(not_done, hero())));

    globalThis.__test_quests["Lost memory"].is_finished = true;
    check("quests_completed opens once the quest is finished", Boolean(process_conditions(done, hero())));
    check("quests_not_completed shuts once the quest is finished", !process_conditions(not_done, hero()));

    check("an unknown quest key shuts a completed gate",
        !process_conditions(wrap({ quests_completed: ["No such quest"] }), hero()));
    check("an unknown quest key shuts an unfinished gate too",
        !process_conditions(wrap({ quests_not_completed: ["No such quest"] }), hero()));
}

{
    /*
        Season gates. `yes` and `not` each take a season or a LIST of seasons, which is
        what "twice a year" needs and the whole of what it needs: two seasons come round
        on their own, so a recurring window costs no scheduler (P-14, Q-10).

        The single-string shape is the older one and is still what the supplier's two
        winter lines use, so both shapes are pinned here - widening a condition that
        content already depends on is exactly the change that breaks quietly.
    */
    const hero = () => ({ reputation: {}, money: 0, personal: {} });
    const wrap = (declared) => [declared];
    const in_season = (season, gate) => {
        globalThis.__test_season = season;
        return Boolean(process_conditions(gate, hero()));
    };

    const one_yes = wrap({ season: { yes: "Winter" } });
    check("a single-season yes opens in that season", in_season("Winter", one_yes));
    check("a single-season yes shuts in another", !in_season("Summer", one_yes));

    const one_not = wrap({ season: { not: "Winter" } });
    check("a single-season not shuts in that season", !in_season("Winter", one_not));
    check("a single-season not opens in another", in_season("Summer", one_not));

    //Two seasons is the twice-a-year window the Marrowmoth arc is built on.
    const twice = wrap({ season: { yes: ["Spring", "Autumn"] } });
    check("a two-season yes opens in the first", in_season("Spring", twice));
    check("a two-season yes opens in the second", in_season("Autumn", twice));
    check("a two-season yes shuts between them", !in_season("Summer", twice));
    check("a two-season yes shuts after them", !in_season("Winter", twice));

    const twice_not = wrap({ season: { not: ["Spring", "Autumn"] } });
    check("a two-season not shuts in the first", !in_season("Spring", twice_not));
    check("a two-season not shuts in the second", !in_season("Autumn", twice_not));
    check("a two-season not opens outside them", in_season("Summer", twice_not));

    //A list of one is a list, not a special case.
    const listed_one = wrap({ season: { yes: ["Winter"] } });
    check("a one-item yes list behaves like the bare string", in_season("Winter", listed_one));
    check("a one-item yes list shuts elsewhere", !in_season("Autumn", listed_one));

    /*
        An empty list shuts in every season there is. That is the honest reading - no
        season is listed, so no season matches - and it is unreachable content, which is
        why check_seasonal_content_is_reachable refuses to let one ship rather than this
        being fixed up at runtime.
    */
    const empty = wrap({ season: { yes: [] } });
    check("an empty yes list shuts in every season",
        !in_season("Spring", empty) && !in_season("Summer", empty)
        && !in_season("Autumn", empty) && !in_season("Winter", empty));

    globalThis.__test_season = "Summer";
}

// ===========================================================================
// src/data/marrowmoth.js - the one hull's timetable
// ===========================================================================
// Imports nothing, so it is imported for real rather than stubbed. Three modules
// read this window - the salt house's shelf, the quay's noise and the guild clerk's
// rumour - and the whole reason it is a module instead of three inline literals is
// that a copy that drifted would fail silently: a season gate that never opens looks
// exactly like content nobody has reached yet.

{
    const marrowmoth = await import(
        pathToFileURL(path.join(repo_root, "src/data/marrowmoth.js")).href);

    check("the window is exactly two seasons",
        marrowmoth.marrowmoth_seasons.length === 2,
        `got ${marrowmoth.marrowmoth_seasons.length}: ${marrowmoth.marrowmoth_seasons.join(", ")}`);

    //Spring and Autumn rather than any other two: the equinoxes are where the year's
    //biggest tidal ranges fall, and she can only work the ebb.
    check("she is in port in Spring", marrowmoth.is_marrowmoth_in_port("Spring"));
    check("she is in port in Autumn", marrowmoth.is_marrowmoth_in_port("Autumn"));
    check("she is gone in Summer", !marrowmoth.is_marrowmoth_in_port("Summer"));
    check("she is gone in Winter", !marrowmoth.is_marrowmoth_in_port("Winter"));

    //Twice a year has to mean twice: a window covering three seasons is a hull that
    //is mostly there, which is not what the tallyman's book says.
    check("the window leaves two seasons empty",
        ["Spring", "Summer", "Autumn", "Winter"]
            .filter(s => !marrowmoth.is_marrowmoth_in_port(s)).length === 2);

    check("a season that does not exist is not in port",
        !marrowmoth.is_marrowmoth_in_port("Harvest"));
}

// ===========================================================================
// src/translation.js — the lookup and the fallback
// ===========================================================================
// The Turkish locale is deliberately partial, so the fallback is what keeps the
// game readable rather than showing "text not found" everywhere. These checks
// exist because that failure mode is invisible until a player sees it.

// An id present in English and deliberately absent from every other locale, to
// exercise the fallback. See the block below for why it is planted rather than found.
const english_only_id = "test fixture english only id";
const { translationManager, translations } = await load_with_stubs(
    "src/translation.js",
    ["./main.js"],
    `
const global_flags = globalThis.__test_flags;
`);

// Checked BEFORE any init() call in this file, deliberately: the game renders
// player-facing text throughout its startup sequence and only awaits
// translationManager.init at the end of it, so a lookup has to work at module
// evaluation time. When the locales were fetched instead of imported, every one of
// those renders came out as "text not found, id: ...". These use the exact ids
// from that bug report.
{
    check("the locales are registered without init being called",
        translations.english !== undefined && translations.turkish !== undefined,
        `registered=${Object.keys(translations).join(",")}`);

    check("a loading-screen id resolves before init",
        translationManager.getText("english", "ui save game version") === "Save game version",
        `got=${translationManager.getText("english", "ui save game version")}`);

    check("it resolves in the chosen language, not through the English fallback",
        translationManager.getText("turkish", "ui version none") === "yok",
        `got=${translationManager.getText("turkish", "ui version none")}`);

    check("nothing pre-init falls through to the not-found placeholder",
        !translationManager.getText("turkish", "ui current game version").startsWith("text not found"));
}

{
    await translationManager.init("turkish");

    check("a translated id answers in Turkish",
        translationManager.getText("turkish", "ui create") === "Kahramanını oluştur",
        `got=${translationManager.getText("turkish", "ui create")}`);

    // Ids a locale has not reached yet must show the English text, not the "text
    // not found" placeholder. The gap is PLANTED here rather than discovered: an
    // earlier version of this check picked the first still-missing id at runtime,
    // which passed only while the Turkish locale was partial and started failing
    // the moment it reached full coverage. Planting it also keeps the check
    // honest in the other direction - it tests the fallback, not the backlog.
    // The id has no mofu# counterpart, so nothing but the fallback is in play.
    translations.english[english_only_id] = "English only text";
    const untranslated = translationManager.getText("turkish", english_only_id);
    check("an id missing from the active language falls back to English",
        untranslated === "English only text",
        `got=${String(untranslated).slice(0, 40)}`);
    check("the fallback is not the not-found placeholder",
        !untranslated.startsWith("text not found"));

    // -------------------------------------------------------- parameterised text
    // 203 of the game's items are generated from a material and a component type,
    // so their names and descriptions are assembled from patterns rather than
    // written out. These checks cover the substitution those patterns rely on.
    check("a {slot} is substituted",
        translationManager.getText("english", "pattern component name",
            {material: "iron", type: "short blade"}) === "iron short blade");

    // A missing slot stays written out. Blanking it would lose a word silently;
    // leaving it visible puts the broken pattern on screen where it gets noticed.
    check("a slot with no value is left written out",
        translationManager.getText("english", "pattern component name",
            {material: "iron"}) === "iron {type}");

    check("params are resolved as text ids, not passed through as strings",
        JSON.stringify(translationManager.resolveParams("english",
            {material: "material name rough wood"})) === JSON.stringify({material: "simple wooden"}));

    // The assembled English has to equal the registry key, which is save data.
    check("an assembled name matches its registry key",
        translationManager.assembleName("english", "pattern component name",
            {material: "material name rough wood", type: "component long handle"},
            {capitalise: true}) === "Simple wooden long handle",
        `got=${translationManager.assembleName("english", "pattern component name", {material: "material name rough wood", type: "component long handle"}, {capitalise: true})}`);

    check("the same name assembles in Turkish",
        translationManager.assembleName("turkish", "pattern component name",
            {material: "material name rough wood", type: "component long handle"},
            {capitalise: true}) === "Basit ahşap uzun sap",
        `got=${translationManager.assembleName("turkish", "pattern component name", {material: "material name rough wood", type: "component long handle"}, {capitalise: true})}`);

    // Turkish upper-cases a dotless i to I, not to İ. A plain toUpperCase() would
    // give "İşlenmiş" here and be wrong in exactly the place a player looks first.
    check("capitalising an assembled Turkish name respects the dotless i",
        translationManager.assembleName("turkish", "pattern name armor",
            {material: "material name black steel", piece: "armor piece armored pants"},
            {capitalise: true}) === "Siyah zırhlı pantolon");

    // A material whose name differs from its key: the description says what the
    // item is made of, the name says how it is described. Mixing them up renames items.
    check("the two material forms are kept apart",
        translationManager.getText("english", "material rough wood") === "rough wood"
        && translationManager.getText("english", "material name rough wood") === "simple wooden");

    // Two invariants per component description, both about the slot.
    //
    // Turkish cannot suffix a slot value - the ablative would need -dan/-den/-tan/
    // -ten chosen from the material's last sounds - so the pattern must leave the
    // slot bare. If someone "improves" it into "{material}dan", the first check
    // fails. Position-independent on purpose: the earlier version of this check
    // asserted startsWith, which conflated "unsuffixed" with "slot first" and
    // failed the moment the slot was moved for the reason below.
    //
    // And the slot must NOT open the text. Material names are stored lowercase, so
    // a pattern beginning with {material} produces a tooltip that starts
    // mid-sentence in lowercase where the English one starts with "A short blade".
    for(const id of ["desc component short blade", "desc component long blade",
                     "desc component axe head", "desc component hammer head"]) {
        const filled = translationManager.getText("turkish", id, {material: "kaba odun"});
        check(`${id} leaves its slot unsuffixed in Turkish`,
            /kaba odun(?!\p{L})/u.test(filled), `got=${filled}`);
        check(`${id} does not open with its slot in Turkish`,
            !translations.turkish[id].startsWith("{material}"),
            `got=${translations.turkish[id]}`);
    }
    // %HeroName% is substituted by the log itself, not by the translation layer, so
    // a locale that translates or drops it silently loses the hero's name from every
    // combat line. Checked across every language, not just Turkish.
    {
        const reference_language = "english";
        const log_ids = Object.keys(translations[reference_language]).filter(id => id.startsWith("log "));
        const with_hero = log_ids.filter(id => translations[reference_language][id].includes("%HeroName%"));
        check("there are log messages carrying %HeroName% to check",
            with_hero.length >= 8, `found=${with_hero.length}`);
        const broken = [];
        for(const name of Object.keys(translations)) {
            for(const id of with_hero) {
                const text = translations[name][id];
                if(text !== undefined && !text.includes("%HeroName%")) { broken.push(`${name}:${id}`); }
            }
        }
        check("every locale keeps %HeroName% intact", broken.length === 0, broken.slice(0, 3).join(", "));

        // The same for slots: a locale that drops one loses a number off the screen.
        const slot_of = (text) => [...text.matchAll(/\{([a-z_][a-z0-9_]*)\}/g)].map(m => m[1]).sort().join(",");
        const mismatched = [];
        for(const name of Object.keys(translations)) {
            if(name === reference_language) continue;
            for(const id of Object.keys(translations[reference_language])) {
                const other = translations[name][id];
                if(other === undefined) continue;
                if(slot_of(translations[reference_language][id]) !== slot_of(other)) { mismatched.push(`${name}:${id}`); }
            }
        }
        check("every locale keeps the same {slots} as the reference",
            mismatched.length === 0, mismatched.slice(0, 3).join(", "));
    }
    check("an id that exists nowhere still reports itself",
        translationManager.getText("turkish", "no such id at all").startsWith("text not found"));

    // Loading a non-default language must pull the default in as well, or there is
    // nothing to fall back to.
    check("initialising Turkish also loaded English",
        translationManager.getText("english", "ui create") === "Create your hero");

    // A language that has the base text but no racial variant must stay in its own
    // language rather than borrowing the English variant.
    globalThis.__test_flags.is_mofu_mofu_enabled = true;
    check("a language without a variant keeps its own base text",
        translationManager.getText("turkish", "ui create") === "Kahramanını oluştur");

    // English has both, so the variant wins there.
    const english_variant = translationManager.getText("english", "elder description");
    check("the racial variant wins where it exists",
        english_variant.includes("horns"), `got=${english_variant.slice(0, 60)}`);

    globalThis.__test_flags.is_mofu_mofu_enabled = false;
    const english_base = translationManager.getText("english", "elder description");
    check("the base text is used with the variant disabled",
        !english_base.includes("horns"), `got=${english_base.slice(0, 60)}`);
    globalThis.__test_flags.is_mofu_mofu_enabled = true;
}

// --- display names --------------------------------------------------------
// Registry entries carry their English name in code and that name is part of
// their identity, so a translation is optional decoration on top. The contract
// is: translate if there is an entry, otherwise hand back the English unchanged -
// never a placeholder, because the caller has nothing better to show.
{
    check("a translated display name comes back in Turkish",
        translationManager.getDisplayName("turkish", "Quick Steps") === "Hızlı adımlar",
        `got=${translationManager.getDisplayName("turkish", "Quick Steps")}`);

    check("a stance and its same-named skill agree despite the casing difference",
        translationManager.getDisplayName("turkish", "Quick Steps")
            === translationManager.getDisplayName("turkish", "Quick steps"));

    check("an untranslated display name is handed back unchanged",
        translationManager.getDisplayName("turkish", "Some Item Nobody Translated") === "Some Item Nobody Translated");

    check("English asks for a display name and gets its own text",
        translationManager.getDisplayName("english", "Quick Steps") === "Quick Steps");

    check("a falsy name is passed straight through rather than becoming a key",
        translationManager.getDisplayName("turkish", "") === "");

    // getOptionalText is the general form and must NOT fall back or placeholder.
    check("getOptionalText returns undefined for an id the language lacks",
        translationManager.getOptionalText("turkish", "no such id at all") === undefined);
    check("getOptionalText does not fall back to the default language",
        translationManager.getOptionalText("turkish", english_only_id) === undefined,
        `id=${english_only_id}`);
}

// ---------------------------------------------------------------------------
// slerp - the interpolation behind gathering times, drop chances and crafting
// success. It used to return NaN for any pair starting at zero, which then
// reached the skill-xp guard in main.js as a non-numeric gain: the console
// warning this was reported as. These checks pin both the geometric curve and
// the fallback that replaced the NaN.
// ---------------------------------------------------------------------------
{
    const { slerp } = await load_with_stubs("src/misc.js", ["./main.js"], `
const game_options = {};
`);

    const close = (a, b) => Math.abs(a - b) < 1e-9;

    // The geometric form, which is the one all live content uses.
    check("slerp returns the low end at t = 0", slerp([30, 10], 0) === 30);
    check("slerp returns the high end at t = 1", close(slerp([30, 10], 1), 10));
    check("slerp is geometric in between, not linear",
        close(slerp([1, 100], 0.5), 10),
        `got=${slerp([1, 100], 0.5)} (linear would be 50.5)`);

    // The cases that used to produce NaN. Endpoints must still be exact, because a
    // fallback that moved them would change what the author wrote.
    check("a pair starting at zero no longer gives NaN",
        Number.isFinite(slerp([0, 10], 0.5)), `got=${slerp([0, 10], 0.5)}`);
    check("a pair starting at zero keeps both endpoints",
        slerp([0, 10], 0) === 0 && slerp([0, 10], 1) === 10);
    check("a pair starting at zero interpolates linearly",
        close(slerp([0, 10], 0.5), 5), `got=${slerp([0, 10], 0.5)}`);
    check("a zero-to-zero pair gives zero rather than NaN",
        slerp([0, 0], 0.5) === 0, `got=${slerp([0, 0], 0.5)}`);
    check("a negative end no longer gives NaN",
        Number.isFinite(slerp([10, -10], 0.5)), `got=${slerp([10, -10], 0.5)}`);

    // The old expression, kept here as the thing being guarded against: if someone
    // "simplifies" slerp back to it, the checks above start failing and this one
    // documents why.
    const old_form = (arr, t) => arr[0] * (arr[1] / arr[0]) ** t;
    check("the old expression really did produce NaN, so these checks are not vacuous",
        Number.isNaN(old_form([0, 10], 0.5)));
}

// ---------------------------------------------------------------------------
// The money condition. Its documented shape was an object while the check
// compared the raw value, so a condition written as documented compared a number
// against an object - never less than it - and the gate silently passed. Nothing
// in the content used it, so nothing caught it until quest 4 needed money to
// actually leave the purse.
// ---------------------------------------------------------------------------
{
    const { process_conditions, money_required, money_spent } = await load_with_stubs(
        "src/conditions.js",
        ["./character.js", "./game_time.js", "./main.js", "./person.js", "./races.js",
     "./registries.js"],
        `
const get_total_skill_level = () => 0;
const current_game_time = { getSeason: () => "summer" };
const global_flags = {};
const height_values = {};
const playable_races = {};
//conditions.js reads the two registries through src/registries.js, which imports
//nothing - that indirection is what keeps the module graph acyclic. The tests fill
//them through __test_locations / __test_quests, like the levels and flags above.
const registries = {
    locations: globalThis.__test_locations ??= {},
    quests: globalThis.__test_quests ??= {},
};
`);

    const purse = amount => ({ money: amount, inventory: {}, equipment: {}, stats: {full: {}},
                               xp: {current_level: 1}, reputation: {} });

    check("money_required reads a bare number", money_required({money: 500}) === 500);
    check("money_required reads the object form", money_required({money: {number: 500}}) === 500);
    check("money_required returns null when no money is named",
        money_required({}) === null && money_required(undefined) === null);
    check("money_required does not confuse zero with absent",
        money_required({money: 0}) === 0);

    // The object form is the one that used to pass unconditionally.
    check("the object form blocks a purse that is short",
        process_conditions([{money: {number: 500, remove: true}}], purse(499)) === 0,
        `got=${process_conditions([{money: {number: 500, remove: true}}], purse(499))}`);
    check("the object form allows a purse that is exactly enough",
        process_conditions([{money: {number: 500, remove: true}}], purse(500)) === 1);
    check("the bare form still blocks a purse that is short",
        process_conditions([{money: 500}], purse(499)) === 0);
    check("no money named means the purse is irrelevant",
        process_conditions([{}], purse(0)) === 1);

    // The old expression, kept as the thing being guarded against: comparing a
    // number against an object is false, so the gate opened on an empty purse.
    check("the old comparison really did pass on an empty purse, so these are not vacuous",
        !(0 < {number: 500}));

    // The exact shape quest 4 uses, with the flag name `required` takes rather than
    // the one `conditions` takes. The gate must not care which flag is present -
    // only the charge does - so both spellings have to pass the check at the same
    // amount.
    const q4 = {money: {number: 30000, remove_on_success: true}};
    check("the required-side flag does not change what the gate asks for",
        money_required(q4) === 30000);
    check("quest 4's price blocks a purse one coin short",
        process_conditions([q4], purse(29999)) === 0);
    check("quest 4's price allows a purse that covers it",
        process_conditions([q4], purse(30000)) === 1);

    // ---------------------------------------------------------------------
    // money_spent: how much actually leaves the purse. Separate from the gate
    // on purpose - a bare number gates and takes nothing - and pure so that it
    // can be tested at all. The equivalent logic used to sit inside a DOM-bound
    // function in main.js where no test could reach it.
    // ---------------------------------------------------------------------
    check("a bare number requires money but never spends it",
        money_spent({money: 500}, true) === 0 && money_spent({money: 500}, false) === 0);
    check("nothing named spends nothing",
        money_spent({}, true) === 0 && money_spent(undefined, true) === 0);

    check("remove_on_success spends only on a win",
        money_spent(q4, true) === 30000 && money_spent(q4, false) === 0);
    const on_fail = {money: {number: 700, remove_on_fail: true}};
    check("remove_on_fail spends only on a loss",
        money_spent(on_fail, false) === 700 && money_spent(on_fail, true) === 0);
    const both = {money: {number: 900, remove_on_success: true, remove_on_fail: true}};
    check("both flags spend either way",
        money_spent(both, true) === 900 && money_spent(both, false) === 900);

    // `remove` is the conditions-side flag, and it does not care about the outcome,
    // which is how items_by_id behaves in the same position.
    const on_conditions = {money: {number: 400, remove: true}};
    check("the conditions-side remove flag spends regardless of the outcome",
        money_spent(on_conditions, true) === 400 && money_spent(on_conditions, false) === 400);

    // The object form with no flag at all is the shape `check` rejects in content:
    // it gates correctly and charges nothing, which is a silent pass.
    check("an object with no removal flag spends nothing",
        money_spent({money: {number: 30000}}, true) === 0);

    // The gate and the charge must agree, which is the whole reason both live here.
    check("what is spent equals what was required, for the shape quest 4 uses",
        money_spent(q4, true) === money_required(q4));
}

// --- a reward's quality has to reach the inventory key ---------------------
/*
    process_rewards used to stamp the quality onto the shared template:

        item = item_templates[entry.item];
        item.quality = entry.quality;

    getInventoryKey() caches into this.inventory_key, and a template's key is cached
    long before any reward is granted, so the stamp never reached the key - the five
    starter weapons that ask for quality 50 arrived at 100 - while still landing on the
    shared template, where getBaseValue's `quality || this.quality || 100` reads it.

    These call the shipped accessors through the browser-free loader, so what is
    asserted is what the game does.
*/
{
    const items = await load_browser_free(repo_root, "src/items.js");
    const { item_templates, getItem } = items;

    const template = item_templates["Iron sword"];
    //Cached first, on purpose: this is the state every template is in by the time a
    //reward is granted, and it is what hid the bug.
    const key_before = template.getInventoryKey();

    const granted = getItem({...template, quality: 120});
    check("a reward's quality reaches the inventory key",
        JSON.parse(granted.getInventoryKey()).quality === 120,
        `got ${granted.getInventoryKey()}`);

    check("granting a quality does not touch the shared template",
        template.getInventoryKey() === key_before && template.quality === 100,
        `key ${template.getInventoryKey()}, quality ${template.quality}`);

    //The old code's actual effect, kept as a test so it cannot come back: stamping the
    //quality on a template is invisible to the key.
    const ore = item_templates["Iron ore"];
    const ore_key = ore.getInventoryKey();
    ore.quality = 77;
    check("stamping a quality on a template does not change its key",
        ore.getInventoryKey() === ore_key,
        `${ore_key} became ${ore.getInventoryKey()}`);
    delete ore.quality;

    //An item with no quality of its own still gets one when a reward asks.
    const fresh_ore = getItem({...item_templates["Iron ore"], quality: 88});
    check("a quality-less item can still be granted with a quality",
        JSON.parse(fresh_ore.getInventoryKey()).quality === 88,
        `got ${fresh_ore.getInventoryKey()}`);

    //And the five the content actually asks for, at the quality it asks for.
    const starters = ["Cheap iron dagger", "Cheap iron sword", "Cheap iron spear",
        "Cheap iron axe", "Cheap iron battle hammer"];
    const at_fifty = starters.every(name =>
        JSON.parse(getItem({...item_templates[name], quality: 50}).getInventoryKey()).quality === 50);
    check("the smith's five starter weapons can be granted at quality 50", at_fifty);
}
// ===========================================================================
// skill milestones — every one of them has to render in every language
// ===========================================================================
/*
    275 of the milestones are generated (P-13/33: every skill's bar grants something
    every five levels to the top), so a mistake here would be systematic rather than
    local. What a player actually reads is get_unlocked_skill_rewards, which names each
    stat through stat_label_short and each xp target through xp_target_label - so a key
    with no locale row surfaces as "text not found, id: ..." in the tooltip itself.

    This loads skills.js a second time with the REAL translationManager rather than the
    stub the xp tests use: a stub answers every lookup and would prove nothing.
*/
{
    globalThis.__real_tm = translationManager;

    const stub = `
const get_total_level_bonus = () => 0;
const get_total_skill_coefficient = () => 1;
const get_total_skill_level = (id) => (skills[id] ? skills[id].current_level : 0);
const get_crafting_quality_caps = () => ({});
const language = globalThis.__lang;
const translationManager = globalThis.__real_tm;
`;

    const markers = ["text not found", "undefined", "NaN", "[object Object]"];
    let rendered = 0;
    let printed = 0;
    let short_of_max = [];
    let with_markers = [];

    for (const lang of ["english", "turkish"]) {
        globalThis.__lang = lang;
        const { skills: fresh, get_unlocked_skill_rewards } = await load_with_stubs(
            "src/data/skills.js",
            ["./character.js", "./crafting_recipes.js", "./translation.js", "./main.js"],
            stub);

        for (const id of Object.keys(fresh)) {
            const skill = fresh[id];
            if (!skill.milestones || Object.keys(skill.milestones).length === 0) continue;

            //add_xp refuses a locked skill, and two are locked until content unlocks
            //them - Meditation and Butchering.
            skill.is_unlocked = true;
            skill.add_xp({ xp_to_add: 1e30 });

            if (skill.current_level !== skill.max_level) {
                short_of_max.push(`${id} ${skill.current_level}/${skill.max_level}`);
            }

            const text = get_unlocked_skill_rewards(id);
            rendered++;
            if (lang === "english") printed += Object.keys(skill.milestones).length;

            const hit = markers.find(marker => text.includes(marker));
            if (hit) {
                with_markers.push(`${lang}/${id}: ${hit}`);
            }
        }
    }

    check("every skill with milestones reaches its own max level",
        short_of_max.length === 0, short_of_max.slice(0, 5).join("; "));

    check("every milestone renders in both languages with no missing text",
        with_markers.length === 0, with_markers.slice(0, 5).join("; "));

    //A guard on the guard: if the loader silently stopped finding skills, the two checks
    //above would pass while testing nothing.
    check("the milestone render covered the whole skill list",
        rendered >= 90 && printed >= 550, `${rendered} blocks, ${printed} milestones`);
}
// ===========================================================================
// src/world_index.js - lore threads
// ===========================================================================
/*
    Q-8's answer to "where do investigation notes live": not a fifth journal panel, but
    an optional `lore_thread` id on a Textline and a grouping above the by-speaker list.

    The threading is injected here rather than asserted against content, because no
    content is threaded yet - the first real thread is the Marrowmoth's manifest. Both
    modules are loaded into ONE graph so the mutation is visible to the index; two
    separate calls are two unrelated copies of src/ and would prove nothing.

    The case being tested is the exact one Q-8 describes: two beats, two speakers, one
    subject. Under the by-speaker list alone they read as two conversations.
*/
{
    const [world, dialogue_data] = await load_browser_free(repo_root,
        ["src/world_index.js", "src/data/dialogues.js"]);

    /*
        The arc's own thread, in the real content rather than injected. It was written
        across two speakers on purpose - the tallyman on the quay and the guild clerk a
        month's walk inland - which is exactly the case Q-8 was written for and the one
        the by-speaker list gets wrong.
    */
    const marrowmoth_beats = world.lore_all_units()
        .filter(unit => world.lore_thread_of(unit) === "lore thread the Marrowmoth");
    check("the Marrowmoth thread is declared on more than one beat",
        marrowmoth_beats.length >= 2, `${marrowmoth_beats.length}`);
    check("and by more than one speaker",
        new Set(marrowmoth_beats.map(unit => unit.dialogue)).size >= 2,
        [...new Set(marrowmoth_beats.map(unit => unit.dialogue))].join());

    //Declaring a thread is not the same as having heard any of it: a fresh save draws
    //no threads at all, which is what keeps the panel honest about what the player knows.
    check("a thread is not drawn until something in it is heard",
        world.lore_threads(true).length === 0);

    const heard = (dialogue, line, thread) => {
        const textline = dialogue_data.dialogues[dialogue].textlines[line];
        textline.is_heard = true;
        textline.lore = true;
        textline.lore_thread = thread;
    };

    //Declared earlier in the file than the clerk, so its thread is the earlier of the two.
    heard("guild factor", "hello", "ui lore heard header");
    heard("square broker", "hello", "ui lore threads header");

    /*
        The clerk's beat is a fold: "hello" unlocks "board" and nothing else does, so the
        index absorbs the second into the first. The thread is put on the SECOND line on
        purpose - a beat is one thing, so naming the thread anywhere in it has to thread
        the whole beat. Reading only the head line passes every other check here.
    */
    heard("guild clerk", "hello", undefined);
    heard("guild clerk", "board", "ui lore threads header");

    const groups = world.lore_threads(false);
    check("two threads come back", groups.length === 2, `got ${groups.length}`);

    const marrow = groups.find(group => group.thread === "ui lore threads header");
    check("a thread gathers beats from different speakers",
        marrow?.units.length === 2, `got ${marrow?.units.length}`);
    check("and they are the two that were threaded",
        marrow?.units.map(unit => unit.dialogue).join() === "guild clerk,square broker",
        marrow?.units.map(unit => unit.dialogue).join());

    //A unit folds several lines into one beat; the thread belongs to the beat, not to
    //whichever half of it happened to name the thread.
    check("a folded beat joins the thread whole",
        marrow?.units[0].keys.length === 2, marrow?.units[0].keys.join());

    check("threads keep the order they first appear in",
        groups[0].thread === "ui lore heard header", groups[0].thread);

    //The half that keeps the panel honest: a threaded beat is in its thread and nowhere
    //else, or the same six facts are on the page twice.
    const unthreaded = world.lore_units(false).filter(unit => !world.lore_thread_of(unit));
    check("a threaded beat is not left in the by-speaker list", unthreaded.length === 0,
        `${unthreaded.length} of ${world.lore_units(false).length} still unthreaded`);

    check("an unheard beat is in no thread",
        world.lore_thread_of({dialogue: "guild clerk", head: "asking", keys: ["asking"]}) === null);
}

// ===========================================================================
// src/world_index.js — the reverse indexes, against the real registries
// ===========================================================================
/*
    This is the test that could not exist before. The Discoveries index read a trader's
    inventory_template - which holds the NAME of a stock list - as if it were the list,
    and threw the first time the page was opened. It could not be caught: the index was
    in display.js, which touches `document` at module scope, and the loader could not
    construct traders.js, enemies.js or data/locations.js either.

    Both indexes are built here from the real objects, so a field that is not the shape
    the index assumes fails here rather than in front of a player.
*/
{
    const world = await load_browser_free(repo_root, "src/world_index.js");
    const { enemy_templates } = await load_browser_free(repo_root, "src/enemies.js");
    const { item_templates } = await load_browser_free(repo_root, "src/items.js");

    //Every creature the bestiary can show has somewhere to be met.
    const placed = Object.keys(enemy_templates)
        .filter(name => world.enemy_zones(name).length > 0);
    check("every enemy resolves to at least one zone",
        placed.length === Object.keys(enemy_templates).length,
        `${placed.length}/${Object.keys(enemy_templates).length}`);

    //And what comes back are locations, not names or ids.
    const a_zone = world.enemy_zones("Wolf rat")[0];
    check("a zone comes back as the location object itself",
        typeof a_zone?.getName === "function" && typeof a_zone?.id === "string",
        `got ${typeof a_zone}`);

    //The item index: every kind of source has to actually appear, because each one is a
    //separate walk over a separate registry and any of them could silently yield nothing.
    const kinds = {};
    let with_sources = 0;
    for (const item_id of Object.keys(item_templates)) {
        const sources = world.item_sources(item_id);
        if (sources.length) with_sources++;
        for (const source of sources) {
            kinds[source.kind] = (kinds[source.kind] || 0) + 1;
        }
    }

    for (const kind of ["gather", "drop", "trade", "craft"]) {
        check(`the item index finds ${kind} sources`, (kinds[kind] || 0) > 0,
            `found ${kinds[kind] || 0}`);
    }

    //trade is the one that broke: a trader carries the NAME of its stock list, and
    //reading the name as a list yielded zero trade sources and threw on the way.
    check("trade sources are found through the stock list a trader names",
        (kinds["trade"] || 0) >= 100, `found ${kinds["trade"] || 0}`);

    //372 of 450 at the time of writing. The rest genuinely have neither a recipe nor a
    //drop yet - the tier 4 and 5 plate pieces mostly - and the page says so rather than
    //guessing. The floor is here to catch a walk that stops finding things, not to pretend
    //the content is finished.
    check("most items have somewhere to come from",
        with_sources >= 350, `${with_sources} of ${Object.keys(item_templates).length}`);

    //Every source either points at a real location or is a craft, which has none.
    const { locations } = await load_browser_free(repo_root, "src/data/locations.js");
    const dangling = [];
    for (const item_id of Object.keys(item_templates)) {
        for (const source of world.item_sources(item_id)) {
            if (source.kind === "craft") continue;
            if (!locations[source.location_key]) {
                dangling.push(`${item_id} -> ${source.location_key}`);
            }
        }
    }
    check("every source points at a location that exists",
        dangling.length === 0, dangling.slice(0, 3).join("; "));

    //The training index: skills to the places that feed them, read out of the same
    //forward declarations - a location lists its activities, an activity lists its skills.
    const training = world.training_places();
    const trainable = Object.keys(training);
    check("skills resolve to places that train them", trainable.length >= 12,
        `${trainable.length} skills`);

    const bad_places = trainable.flatMap(skill_id =>
        training[skill_id].filter(place => typeof place?.getName !== "function")
            .map(() => skill_id));
    check("a training place comes back as the location object itself",
        bad_places.length === 0, bad_places.slice(0, 3).join(", "));

    /*
        What advances a quest task. This is the index the journal needs most: 73 tasks
        exist and 5 declare a condition, so 68 of them show a player a line with no
        numbers and no clue unless something says what moves it.
    */
    const { quests } = await load_browser_free(repo_root, "src/quests.js");
    let conditionless = 0;
    let hinted = 0;
    for (const [quest_id, quest] of Object.entries(quests)) {
        (quest.quest_tasks || []).forEach((task, index) => {
            const conditions = Object.values(task.task_condition || {})
                .reduce((count, group) => count + Object.keys(group).length, 0);
            if (conditions > 0) return;
            conditionless++;
            if (world.quest_task_advancers(quest_id, index).length) hinted++;
        });
    }
    check("most conditionless quest tasks resolve to something that advances them",
        hinted >= 50, `${hinted} of ${conditionless}`);

    //Every advancer names a real place, or the hint would point at nothing.
    const { locations: places } = await load_browser_free(repo_root, "src/data/locations.js");
    const bad_steps = [];
    for (const [quest_id, quest] of Object.entries(quests)) {
        (quest.quest_tasks || []).forEach((task, index) => {
            for (const step of world.quest_task_advancers(quest_id, index)) {
                if (!places[step.location_key]) {
                    bad_steps.push(`${quest_id}#${index} -> ${step.location_key}`);
                }
            }
        });
    }
    check("every quest hint names a location that exists",
        bad_steps.length === 0, bad_steps.slice(0, 3).join("; "));
}
/*
    The wet woods' ending.

    `location_clears` is a condition the engine has supported since the conditions
    rewrite and that no content had used until now, so this is the first thing that
    proves it works on real data rather than in the abstract. The action that ends the
    region is gated on one full clear of the Drowned grove, which is the same state its
    own description reaches - grey shapes gone, flax standing.
*/
{
    //Both from ONE graph: separate calls build separate copies of src/, and the
    //condition would read a registry this test never touched.
    const [{ locations }, { process_conditions }] =
        await load_browser_free(repo_root, ["src/data/locations.js", "src/conditions.js"]);

    const grove = locations["Drowned grove"];
    check("the Drowned grove is a zone with a group count to clear",
        grove !== undefined && grove.enemy_count > 0, `enemy_count=${grove?.enemy_count}`);

    const gate = [{location_clears: {"Drowned grove": {at_least: 1}}}];

    grove.enemy_groups_killed = 0;
    check("the wet woods' ending is shut before the grove is cleared",
        !process_conditions(gate, false));

    //One short of a clear: the floor division must not round a nearly-finished run up.
    grove.enemy_groups_killed = grove.enemy_count - 1;
    check("one group short does not count as a clear",
        !process_conditions(gate, false), `${grove.enemy_groups_killed}/${grove.enemy_count}`);

    grove.enemy_groups_killed = grove.enemy_count;
    check("the ending opens on the clear the description already reacts to",
        Boolean(process_conditions(gate, false)));

    const ending = locations["Wet woods"].actions?.["cut the standing flax"];
    check("the wet woods have an ending action at all", ending !== undefined);
    check("it grants the title that marks the region closed",
        ending?.rewards?.titles?.includes("the woods are quiet") === true);
    //It has to lock itself: there is no is_unique on a GameAction, and an ending that
    //can be repeated is not an ending.
    check("and locks itself once done",
        ending?.rewards?.locks?.actions?.some(entry =>
            entry.location === "Wet woods" && entry.action === "cut the standing flax") === true);
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
