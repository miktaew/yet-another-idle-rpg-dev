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
    "src/skills.js",
    ["./character.js", "./crafting_recipes.js", "./misc.js", "./translation.js", "./main.js"],
    `
const get_total_level_bonus = () => 0;
const get_total_skill_coefficient = () => 1;
const get_total_skill_level = (id) => (skills[id] ? skills[id].current_level : 0);
const get_crafting_quality_caps = () => ({});
const stat_names = {};
const language = "english";
// Skill.name() asks the translation layer for a display name and falls back to the
// English it already holds. The stub reproduces the fallback, which is the branch
// that matters here: these tests are about xp, not about localisation.
const translationManager = { getDisplayName: (lang, english_name) => english_name };
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

// ===========================================================================
// src/conditions.js — the gate that decides whether a textline or a location
// is offered. A wrong shape here silently opens or closes content, so the exact
// argument shapes used by the content are pinned down.
// ===========================================================================

// Set before loading: the stub captures these object references at module
// evaluation time, and the tests below mutate their properties.
globalThis.__test_levels = {};
globalThis.__test_flags = { is_mofu_mofu_enabled: true };

const { process_conditions } = await load_with_stubs(
    "src/conditions.js",
    ["./character.js", "./game_time.js", "./main.js", "./person.js", "./races.js"],
    `
const get_total_skill_level = (id) => __levels[id] || 0;
const current_game_time = { season: "Summer", hour: 12, day: 1, month: 1, year: 1 };
const global_flags = __flags;
const height_values = { "very short": 145, short: 155, average: 170, tall: 180, "very tall": 190 };
const playable_races = {};
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

    // Turkish cannot suffix a slot value - the ablative would need -dan/-den/-tan/
    // -ten chosen from the material's last sounds - so the pattern is built to leave
    // the slot bare. If someone "improves" it into "{material}dan", this fails.
    check("a description pattern leaves its slot unsuffixed in Turkish",
        translationManager.getText("turkish", "desc component axe head",
            {material: "kaba odun"}).startsWith("kaba odun kullanılarak"),
        `got=${translationManager.getText("turkish", "desc component axe head", {material: "kaba odun"})}`);
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

console.log("");
if (failures.length > 0) {
    console.error(`${failures.length} check(s) failed:`);
    for (const failure of failures) {
        console.error(`  - ${failure}`);
    }
    process.exit(1);
}
console.log(`all ${passed} checks passed.`);
