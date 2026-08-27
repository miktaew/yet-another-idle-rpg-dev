"use strict";

/**
 * Post-build validation. Two independent groups of checks:
 *
 *   SITE  - the assembled _site/ is actually deployable (all files present,
 *           index.html wired to the bundle, no dev-mode leftovers).
 *   LOCALE- every locale file agrees with the default locale on its key set.
 *
 * The locale group is the important one for a bilingual project: a key that
 * exists in a translation but not in the default locale is dead weight, and a
 * key missing from a translation renders as "text not found, id: ..." in game
 * (see TranslationManager.getText in src/translation.js).
 *
 * Failure policy:
 *   - unknown keys in a translation        -> ERROR (always a bug: typo or drift)
 *   - orphaned mofu# variant without base  -> ERROR (variant can never be reached)
 *   - keys missing from a translation      -> WARNING + coverage percentage,
 *                                             or ERROR under LOCALE_STRICT=1.
 *
 * The warning existed for a translation still in progress. Turkish is at 100%,
 * so CI now sets LOCALE_STRICT=1: leaving it a warning would let the first
 * untranslated key ship silently. Adding a language that is NOT complete means
 * turning that off again, deliberately.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { get_game_version } from "../src/game_version.js";
import { load_generated_item_templates } from "./lib/generated-items.mjs";

const repo_root = path.resolve(import.meta.dirname, "..");
const site_dir = path.join(repo_root, "_site");
const locales_dir = path.join(repo_root, "locales");
const version = get_game_version();
const strict_locales = process.env.LOCALE_STRICT === "1";

// Must stay in sync with src/translation.js.
const default_language = "english";
const variant_prefix = "mofu#";

const errors = [];
const warnings = [];

function error(message) { errors.push(message); }
function warn(message) { warnings.push(message); }

function check_site() {
    if (!fs.existsSync(site_dir)) {
        error("_site/ does not exist - run `npm run build` first.");
        return;
    }

    const expected = [
        "index.html",
        "help.html",
        "help.tr.html",
        "changelog.html",
        "changelog.tr.html",
        "style.css",
        "favicon.ico",
        "robots.txt",
        "dist/bundle.js",
        "locales/english.js",
        "resources/js/HackTimer/HackTimer.min.js",
    ];
    for (const rel of expected) {
        if (!fs.existsSync(path.join(site_dir, rel))) {
            error(`_site/${rel} is missing.`);
        }
    }

    const index_path = path.join(site_dir, "index.html");
    if (!fs.existsSync(index_path)) return;

    const html = fs.readFileSync(index_path, "utf8");

    if (/src\s*=\s*"src\/main\.js"/.test(html)) {
        error("_site/index.html still loads src/main.js - the deployed site must load the bundle.");
    }
    if (!html.includes(`dist/bundle.js?version=${version}`)) {
        error(`_site/index.html does not load dist/bundle.js?version=${version}.`);
    }
    if (!html.includes(`style.css?version=${version}`)) {
        error(`_site/index.html does not load style.css?version=${version}.`);
    }

    const script_tags = html.match(/<script\b[^>]*\bsrc\s*=/g) || [];
    if (script_tags.length < 2) {
        error(`_site/index.html has ${script_tags.length} external script tag(s); expected the HackTimer tag and the bundle tag.`);
    }

    // The sourcemap must not be deployed. It is 3 MB and it publishes the whole
    // unminified source; it was being served to every visitor for as long as dist/
    // was copied wholesale. The map is still built into dist/ for local use.
    if (fs.existsSync(path.join(site_dir, "dist/bundle.js.map"))) {
        error("_site/dist/bundle.js.map exists - the sourcemap must not be deployed."
            + " build-site.js copies the bundle on its own for exactly this reason.");
    }
    const bundle_path = path.join(site_dir, "dist/bundle.js");
    if (fs.existsSync(bundle_path)
        && fs.readFileSync(bundle_path, "utf8").includes("sourceMappingURL")) {
        error("_site/dist/bundle.js still references a sourceMappingURL, so every devtools"
            + " session would chase a file that is deliberately not deployed.");
    }
}

async function load_locale(name) {
    const url = pathToFileURL(path.join(locales_dir, `${name}.js`)).href;
    const module = await import(url);
    if (!module.default || typeof module.default !== "object") {
        error(`locales/${name}.js must have a default export that is an object.`);
        return null;
    }
    return module.default;
}

function base_key(key) {
    return key.startsWith(variant_prefix) ? key.slice(variant_prefix.length) : key;
}

/**
 * Reports ids declared more than once in a locale FILE.
 *
 * This cannot be done on the imported object: a duplicate key in a JavaScript
 * object literal is not an error, the last one silently wins, and by the time the
 * module is loaded the earlier value is gone. So the source text is scanned
 * instead. The failure it catches is a translator writing the same id twice with
 * different text - the game would show one of them and nobody would know which.
 *
 * @param {String} name locale name, e.g. "turkish"
 */
function check_duplicate_keys(name) {
    const source_path = path.join(locales_dir, `${name}.js`);
    const source = fs.readFileSync(source_path, "utf8");

    // Property lines in these files are one per line, indented, quoted key, colon.
    const declared = [...source.matchAll(/^\s+"((?:[^"\\]|\\.)*)"\s*:/gm)].map(match => match[1]);

    const seen = new Set();
    const duplicated = new Set();
    for (const key of declared) {
        if (seen.has(key)) {
            duplicated.add(key);
        }
        seen.add(key);
    }

    for (const key of duplicated) {
        error(`locales/${name}.js declares "${key}" more than once; a later duplicate silently overwrites the earlier one.`);
    }
    return { declared: declared.length, unique: seen.size };
}

/**
 * Every locale must be imported STATICALLY by src/translation.js and listed in its
 * bundled_locales map, and every language offered by main.js must be one of them.
 *
 * The startup sequence in main.js renders player-facing text long before it awaits
 * translationManager.init, so a locale that only arrives through the dynamic
 * import is a locale that does not exist for the first render - which is exactly
 * what produced the "text not found, id: ui save game version" loading screen.
 *
 * @param {String[]} names locale names found in locales/
 */
function check_locales_are_bundled(names) {
    const source = fs.readFileSync(path.join(repo_root, "src/translation.js"), "utf8");

    const block = source.match(/const bundled_locales = \{([^}]*)\}/);
    if (!block) {
        error("src/translation.js has no `const bundled_locales = { ... }` map - this check is out of date.");
        return;
    }
    const bundled = block[1].split(",").map(entry => entry.trim()).filter(Boolean);

    for (const name of names) {
        if (!source.includes(`from "../locales/${name}.js"`)) {
            error(`src/translation.js does not statically import locales/${name}.js,`
                + " so that language is missing for everything main.js renders before init.");
        }
        if (!bundled.includes(name)) {
            error(`src/translation.js does not list "${name}" in bundled_locales,`
                + " so that language is missing for everything main.js renders before init.");
        }
    }

    // A language offered in the selector with no bundled locale behind it is the
    // same bug from the other end.
    const main_source = fs.readFileSync(path.join(repo_root, "src/main.js"), "utf8");
    const languages_block = main_source.match(/const languages = \{([^}]*)\}/);
    if (!languages_block) {
        error("src/main.js has no `const languages = { ... }` map - this check is out of date.");
        return;
    }
    const offered = [...languages_block[1].matchAll(/^\s*([A-Za-z0-9_]+)\s*:/gm)].map(match => match[1]);
    for (const name of offered) {
        if (!bundled.includes(name)) {
            error(`src/main.js offers language "${name}", which src/translation.js does not bundle.`);
        }
    }
}

async function check_locales() {
    if (!fs.existsSync(locales_dir)) {
        error("locales/ does not exist.");
        return;
    }

    const names = fs.readdirSync(locales_dir)
        .filter(f => f.endsWith(".js"))
        .map(f => f.slice(0, -3));

    if (!names.includes(default_language)) {
        error(`the default locale locales/${default_language}.js is missing.`);
        return;
    }

    check_locales_are_bundled(names);

    const reference = await load_locale(default_language);
    if (!reference) return;

    for (const name of names) {
        const counts = check_duplicate_keys(name);
        if (counts.declared !== counts.unique) {
            console.log(`[check] ${name}: ${counts.declared} lines declared, ${counts.unique} unique`);
        }
    }

    const reference_keys = Object.keys(reference);
    const reference_set = new Set(reference_keys);

    // A mofu# variant whose base key does not exist can never be shown, because
    // getText falls back to the base key when the variant is absent, never the
    // other way around.
    for (const key of reference_keys) {
        if (key.startsWith(variant_prefix) && !reference_set.has(base_key(key))) {
            error(`locales/${default_language}.js: variant key "${key}" has no base key "${base_key(key)}".`);
        }
    }

    console.log(`[check] ${default_language}: ${reference_keys.length} keys (reference)`);

    for (const name of names) {
        if (name === default_language) continue;

        const locale = await load_locale(name);
        if (!locale) continue;

        const keys = Object.keys(locale);
        const key_set = new Set(keys);

        const unknown = keys.filter(k => !reference_set.has(k));
        const missing = reference_keys.filter(k => !key_set.has(k));

        for (const key of unknown) {
            error(`locales/${name}.js: key "${key}" does not exist in ${default_language} (typo or stale key).`);
        }
        for (const key of keys) {
            if (key.startsWith(variant_prefix) && !key_set.has(base_key(key))) {
                error(`locales/${name}.js: variant key "${key}" has no base key "${base_key(key)}".`);
            }
        }

        const coverage = reference_keys.length === 0
            ? 100
            : ((reference_keys.length - missing.length) / reference_keys.length) * 100;

        console.log(`[check] ${name}: ${keys.length} keys, ${coverage.toFixed(1)}% coverage, ${missing.length} missing`);

        if (missing.length > 0) {
            // Show a bounded sample; the full list would drown the log.
            const sample = missing.slice(0, 10).map(k => `"${k}"`).join(", ");
            const suffix = missing.length > 10 ? `, ... (+${missing.length - 10} more)` : "";
            const message = `locales/${name}.js is missing ${missing.length} key(s): ${sample}${suffix}`;
            if (strict_locales) {
                error(message);
            } else {
                warn(message);
            }
        }
    }
}

/**
 * Content files declare TEXT IDS rather than sentences. A typo in one of those ids
 * does not throw - it renders as "text not found" in front of a player - so the
 * declared ids are checked against the default locale here.
 *
 * Only the fields that were deliberately migrated are scanned. Commented-out code
 * is stripped first, because the template at the bottom of src/quests.js documents
 * the convention with ids that intentionally have no text.
 */
/**
 * Blanks out comments, keeping every other byte at its original offset so line
 * numbers in an error still point at the right place.
 *
 * A plain /*...*\/ regex is not enough here: a source file with several
 * commented-out blocks, or with a "*\/" inside a string, makes it pair the wrong
 * delimiters and swallow live code, which silently shrinks this check.
 */
function strip_comments(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    while (i < n) {
        const c = src[i], next = src[i + 1];
        if (c === "/" && next === "*") {
            let end = src.indexOf("*/", i + 2);
            end = end === -1 ? n : end + 2;
            out += src.slice(i, end).replace(/[^\n]/g, " ");
            i = end;
        } else if (c === "/" && next === "/") {
            let end = src.indexOf("\n", i);
            if (end === -1) { end = n; }
            out += " ".repeat(end - i);
            i = end;
        } else if (c === '"' || c === "'" || c === "`") {
            const start = i;
            i++;
            while (i < n && src[i] !== c) {
                if (src[i] === "\\") { i++; }
                i++;
            }
            i++;
            out += src.slice(start, Math.min(i, n));
        } else {
            out += c;
            i++;
        }
    }
    return out;
}
/**
 * The generated items: 203 components built at runtime from a material and a
 * component type. Their shown names are assembled from locale rows, so this
 * loads the real generator with stubbed item classes and checks two things.
 *
 * First, that every text id the generator hands to the translation layer exists.
 *
 * Second, and the reason this check is worth its length: the ASSEMBLED ENGLISH
 * name has to come out equal to the registry key. Registry keys are written into
 * save files, so if a pattern row is edited carelessly the shown name and the
 * saved key drift apart and every affected item is quietly renamed on screen.
 */
async function check_generated_items() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const { generated, problem } = await load_generated_item_templates(repo_root);
    if (problem) {
        error(`${problem} - this check is out of date.`);
        return;
    }

    const missing = new Set();
    const resolve = (id) => {
        const text = reference[id];
        if (text === undefined) { missing.add(id); }
        return text;
    };
    const fill = (text, params) =>
        typeof text === "string" ? text.replace(/\{([a-z_]+)\}/g, (whole, slot) => params[slot] ?? whole) : text;
    const capitalise = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

    const entries = Object.entries(generated);
    let checked = 0;
    let renamed = 0;

    for (const [key, item] of entries) {
        if (item.description) { resolve(item.description); }
        if (item.description_params) {
            for (const id of Object.values(item.description_params)) { resolve(id); }
        }
        if (!item.name_parts) continue;   //custom-named, covered by its own "name X" row

        checked++;
        const parts = {};
        for (const [slot, id] of Object.entries(item.name_parts.parts)) { parts[slot] = resolve(id); }
        const assembled = capitalise(fill(resolve(item.name_parts.pattern), parts));
        if (assembled !== key) {
            renamed++;
            error(`generated item "${key}" assembles in ${default_language} as "${assembled}".`
                + " The assembled name must equal the registry key, which is save data.");
        }
    }

    //The equippable name patterns, checked the same way against the English the
    //generator itself produced for shield_name and full_armor_name.
    let equippable = 0;
    for (const [, item] of entries) {
        if (item.shield_name && item.material_id) {
            equippable++;
            const assembled = capitalise(fill(resolve("pattern name shield"),
                {material: resolve(`material name ${item.material_id}`)}));
            if (assembled !== item.shield_name) {
                error(`shield name "${item.shield_name}" assembles as "${assembled}".`);
            }
        }
        if (item.full_armor_name && item.material_id && item.armor_piece) {
            equippable++;
            const assembled = capitalise(fill(resolve("pattern name armor"), {
                material: resolve(`material name ${item.material_id}`),
                piece: resolve(`armor piece ${item.armor_piece}`),
            }));
            if (assembled !== item.full_armor_name) {
                error(`armor name "${item.full_armor_name}" assembles as "${assembled}".`);
            }
        }
    }

    //The weapon words are not attached to a generated item, so they are listed.
    for (const word of ["sword", "dagger", "spear", "axe", "battle hammer"]) {
        resolve(`weapon type ${word}`);
    }
    resolve("pattern name weapon");

    for (const id of missing) {
        error(`the component generator references text id "${id}", which does not exist in locales/${default_language}.js.`);
    }

    console.log(`[check] generated items: ${entries.length} built, ${checked} assembled names`
        + ` and ${equippable} equippable names verified against their registry keys`
        + (renamed ? `, ${renamed} MISMATCHED` : ""));
}
async function check_content_text_ids() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const scanned = [
        { file: "src/quests.js", patterns: [
            /(?<![A-Za-z0-9_])quest_name:\s*"([^"]+)"/g,
            /(?<![A-Za-z0-9_])quest_description:\s*"([^"]+)"/g,
            /(?<![A-Za-z0-9_])task_description:\s*"([^"]+)"/g,
            //The quest-progress log lines are parameterised, so they are getText
            //calls rather than a field. Unscanned, they were the last place three
            //hard-coded English sentences survived a whole localisation pass.
            /translationManager\.getText\(language,\s*"((?:log) [^"]+)"/g,
        ]},
        { file: "src/skills.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
            //The effect readouts are parameterised, so they are getText calls rather
            //than a field.
            /translationManager\.getText\(language,\s*"((?:skill effect) [^"]+)"/g,
        ]},
        { file: "src/locations.js", patterns: [
            /(?<![A-Za-z0-9_])messages:\s*\[\s*"([^"]+)"\s*\]/g,
            //Every text field in a location, an activity or a game action now holds
            //an id. The dynamic getDescription and getBackgroundNoises bodies call
            //getText directly, so those are matched by the call rather than a field.
            /(?<![A-Za-z0-9_])(?:description|starting_text|success_text|action_text|action_name|unlock_text|leave_text|custom_text|use_text|text_to_sleep):\s*"((?:desc|action|activity|loc|travel|noise|ui) [^"]+)"/g,
            /(?<![A-Za-z0-9_])(?:conditional_loss|random_loss|unable_to_begin):\s*\[\s*"((?:action) [^"]+)"\s*\]/g,
            /translationManager\.getText\(language,\s*"((?:desc|action|activity|loc|travel|noise|ui) [^"]+)"/g,
        ]},
        { file: "src/items.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"(desc [^"]+)"/g,
        ]},
        { file: "src/enemies.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
            //The on_hit / on_damaged combat messages.
            /translationManager\.getText\(language,\s*"((?:log) [^"]+)"/g,
        ]},
        { file: "src/dialogues.js", patterns: [
            //Textline fields sit at sixteen spaces; the Dialogue's own `name` sits at
            //eight and is a registry key, not an id, so the indentation is what keeps
            //the two apart. Comments are blanked before this runs, which matters here:
            //a whole commented-out dialogue ("cute little rat") still holds raw
            //English, and it is unreachable content rather than a translation gap.
            /^ {16}(?:name|text):\s*"([^"]+)"/gm,
            /(?<![A-Za-z0-9_])(?:description|starting_text):\s*"((?:desc|ui|sup|g |sus|elder|craftsman|guard|nekomimi|swamp|slum) [^"]*)"/g,
        ]},
        { file: "src/races.js", patterns: [
            //Race fields hold ids, not English, so a typo here shows up as the
            //placeholder inside a hero creation tooltip - a screen the player sees
            //exactly once and only on a new game.
            /(?<![A-Za-z0-9_])(?:name|alternative_name|description|gameplay_description):\s*"([^"]+)"/g,
        ]},
        { file: "src/combat_stances.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
        ]},
        { file: "src/active_effects.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
        ]},
        { file: "src/activities.js", patterns: [
            /(?<![A-Za-z0-9_])(?:description|action_text):\s*"([^"]+)"/g,
        ]},
        { file: "src/main.js", patterns: [
            //The log messages are parameterised, so they are getText calls. The
            //loading-screen messages live here rather than in display.js, so "ui"
            //is matched too - otherwise a typo in one of them is only visible to
            //whoever happens to boot the game.
            /translationManager\.getText\(language,\s*"((?:log|ui) [^"]+)"/g,
        ]},
        { file: "src/display.js", patterns: [
            //Interface labels, resolved where they are rendered.
            /translationManager\.getText\(language,\s*"((?:ui) [^"]+)"/g,
        ]},
    ];

    let checked = 0;
    const errors_before = errors.length;
    for (const entry of scanned) {
        const full_path = path.join(repo_root, entry.file);
        if (!fs.existsSync(full_path)) {
            error(`${entry.file} is missing - this check is out of date.`);
            continue;
        }
        // Blank out comments so documented templates and commented-out blocks are
        // not scanned, without the regex swallowing live code between them.
        const source = strip_comments(fs.readFileSync(full_path, "utf8"));

        for (const pattern of entry.patterns) {
            for (const match of source.matchAll(pattern)) {
                const text_id = match[1];
                checked++;
                if (!(text_id in reference)) {
                    error(`${entry.file} declares text id "${text_id}", which does not exist in locales/${default_language}.js.`);
                }
            }
        }
    }
    const unresolved = errors.length - errors_before;
    console.log(`[check] content text ids: ${checked} declared, ${checked - unresolved} resolved`);
}

/**
 * Panels built imperatively - once, at startup, straight into the DOM - are
 * invisible to translateUI, which only rewrites elements carrying a
 * data-translation attribute. A language switch therefore has to repaint them by
 * hand, and forgetting one fails silently: the panel simply keeps the language it
 * was built in, which on a new game is always the default, because it is built
 * before the player can choose anything. That is the bug the hero creation panel
 * shipped with while the confirm button beside it switched correctly.
 *
 * Adding another such panel means adding its repaint here.
 */
const language_switch_repaints = [
    "fill_character_bio()",
    "characterCreator.refresh_language()",
];

function check_language_switch_repaints() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/main.js"), "utf8"));

    const body = source.match(/async function option_language\(option\) \{([\s\S]*?)\n\}/);
    if (!body) {
        error("src/main.js has no `async function option_language(option) { ... }` - this check is out of date.");
        return;
    }
    if (!body[1].includes("translationManager.translateUI(language)")) {
        error("option_language does not call translationManager.translateUI(language),"
            + " so nothing carrying a data-translation attribute would change language at all.");
    }
    for (const call of language_switch_repaints) {
        if (!body[1].includes(call)) {
            error(`option_language does not call ${call}; that panel is built imperatively,`
                + " so a language switch would leave it in the language it was built in.");
        }
    }
}

/**
 * The in-game changelogs must carry an entry for the version being shipped, and
 * both of them, so the two languages cannot drift apart.
 *
 * They are the player-facing history: a release that bumps the version without
 * writing an entry ships a game whose own changelog does not mention it. A heading
 * may carry a release title and dates after the version, so only its first token
 * has to match.
 *
 * The version span is checked in the BUILT copy, because that is where
 * build-site.js stamps it - the repository copies deliberately hold a readable
 * literal instead.
 */
function check_changelogs_cover_version() {
    for (const file of ["changelog.html", "changelog.tr.html"]) {
        const html = fs.readFileSync(path.join(repo_root, file), "utf8");

        const headings = [...html.matchAll(/<button[^>]*class="collapsible"[^>]*>([^<]+)<\/button>/g)]
            .map(match => match[1].trim().split(/\s+/)[0]);
        if (headings.length === 0) {
            error(`${file} has no collapsible version headings - this check is out of date.`);
            continue;
        }
        if (!headings.includes(version)) {
            error(`${file} has no entry for ${version} - its newest heading is "${headings[0]}".`
                + " The in-game changelog is the player-facing history and has to cover the shipped version.");
        }

        const built = path.join(site_dir, file);
        if (!fs.existsSync(built)) continue;
        if (!fs.readFileSync(built, "utf8").includes(`<span class="game_version">${version}</span>`)) {
            error(`_site/${file} does not show ${version} in its game_version span;`
                + " build-site.js did not stamp it.");
        }
    }
}

/**
 * Every dialogue needs a "name <key>" row for its display name.
 *
 * The default getStartingText assembles the button label from it, and the label is
 * the only place a dialogue's name reaches the player, so a missing row shows up
 * as a placeholder on a button rather than anywhere a test would look. The
 * registry key stays English and stays save data; the row is the shown name.
 *
 * The three names the "suspicious man" returns from its own getName override -
 * itself, "puppy" and "no-longer-suspicious guy" - are checked as literals,
 * because they are chosen by arbitrary logic rather than declared as a field.
 */
const dialogue_name_variants = ["puppy", "no-longer-suspicious guy"];

async function check_dialogue_display_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/dialogues.js"), "utf8"));

    // The lookup key is the Dialogue's `name` FIELD, not its registry key: getName
    // returns this.name, and one dialogue's name ("proprietress") differs from its
    // key ("nekomimi proprietress"). Checking the key instead passes while the
    // button it is meant to protect renders a placeholder - which is exactly what
    // happened. The field cannot be renamed to match, because `id` defaults to it
    // and the id is save data.
    const declarations = [...source.matchAll(/dialogues\["([^"]+)"\]\s*=\s*new Dialogue\(\{/g)];
    if (declarations.length === 0) {
        error("src/dialogues.js declares no dialogues - this check is out of date.");
        return;
    }

    const shown_names = [];
    for (const [index, declaration] of declarations.entries()) {
        const start = declaration.index;
        const end = declarations[index + 1]?.index ?? source.length;
        // The Dialogue's own fields sit at eight spaces; a Textline's sit deeper,
        // so the indentation is what keeps this off the textline names.
        const field = source.slice(start, end).match(/^ {8}name:\s*"([^"]+)"/m);
        shown_names.push(field ? field[1] : declaration[1]);
    }

    for (const name of [...shown_names, ...dialogue_name_variants]) {
        if (!(`name ${name}` in reference)) {
            error(`locales/${default_language}.js has no "name ${name}" row;`
                + " the dialogue's button label would render as a placeholder.");
        }
    }
    console.log(`[check] dialogue display names: ${shown_names.length + dialogue_name_variants.length} resolved`);
}

/**
 * Every trader needs a "name <display_name>" row.
 *
 * The lookup key is display_name, NOT the registry key - two traders deliberately
 * share a shown name while keeping separate keys and separate inventories
 * ("suspicious trader 2" shows as "suspicious trader"), and one has a name field
 * that differs from its key outright. Checking the registry key instead reports
 * three phantom gaps and misses the only row that matters.
 *
 * A missing row leaves getDisplayName falling back to the English name, so the
 * shop button in a Turkish game would read half in English.
 */
/**
 * Hand-written items need a "name <key>" row, or their shown name falls back to
 * the English registry key.
 *
 * Comments are blanked first, and that is the whole difference between a small
 * problem and an imaginary one: measured on the raw source this reported 124
 * missing rows, because 118 of them are hand-written components that the runtime
 * generator superseded and that sit inside commented-out blocks. The real number
 * was six, so they were written rather than warned about, and this errors.
 *
 * Generated items are not included: their names are assembled, and
 * check_generated_items already verifies the assembly against the registry key.
 */
async function check_item_display_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8"));
    const keys = [...source.matchAll(/item_templates\["([^"]+)"\]\s*=\s*new /g)].map(match => match[1]);
    if (keys.length === 0) {
        error("src/items.js declares no items - this check is out of date.");
        return;
    }

    const missing = keys.filter(key => !(`name ${key}` in reference));
    console.log(`[check] item display names: ${keys.length - missing.length}/${keys.length} have a name row`);
    for (const key of missing) {
        error(`locales/${default_language}.js has no "name ${key}" row for item "${key}";`
            + " its shown name would fall back to the English registry key.");
    }
}

async function check_trader_display_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = fs.readFileSync(path.join(repo_root, "src/traders.js"), "utf8");
    const declarations = [...source.matchAll(/traders\["([^"]+)"\]\s*=\s*new Trader\(\{([\s\S]*?)\n {4}\}\);/g)];
    if (declarations.length === 0) {
        error("src/traders.js declares no traders - this check is out of date.");
        return;
    }

    for (const [, key, body] of declarations) {
        const name = body.match(/(?<![A-Za-z0-9_])name:\s*"([^"]+)"/);
        const display = body.match(/(?<![A-Za-z0-9_])display_name:\s*"([^"]+)"/);
        const shown = (display ?? name)?.[1];
        if (!shown) {
            error(`src/traders.js trader "${key}" declares neither name nor display_name.`);
            continue;
        }
        if (!(`name ${shown}` in reference)) {
            error(`locales/${default_language}.js has no "name ${shown}" row, shown by trader "${key}";`
                + " its shop button would fall back to the English name.");
        }
    }
    console.log(`[check] trader display names: ${declarations.length} resolved`);
}

/**
 * Every pair that reaches slerp must have two positive ends.
 *
 * slerp interpolates GEOMETRICALLY, and that has no reading when a pair starts at
 * zero or holds a negative: it used to come back NaN and travel into gathering
 * times, drop chances and crafting success. It now falls back to linear instead,
 * but a fallback is a different curve from the one the author drew, so the pair
 * itself is what should be caught.
 *
 * Verify_Game_Objects reports the same thing, but only when a human opens the
 * browser console and calls it. This runs on every push.
 *
 * Read from the source text rather than by importing: locations.js reaches
 * display.js, which needs a document. Comments are blanked first, so a
 * commented-out recipe is not held to the rule.
 */
function check_interpolated_pairs() {
    const scanned = [
        { file: "src/locations.js", patterns: [
            [/(?<![A-Za-z0-9_])(time_period|chance):\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/g,
             match => [[match[1], match[2], match[3]]]],
            // ammount is [[min_low, max_low], [min_high, max_high]] and slerp is
            // called down the COLUMNS - [min_low, min_high] and [max_low, max_high] -
            // not across the rows, which is the easy thing to get wrong here.
            [/(?<![A-Za-z0-9_])ammount:\s*\[\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]\s*,\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]\s*\]/g,
             match => [["minimum ammount", match[1], match[3]],
                       ["maximum ammount", match[2], match[4]]]],
        ]},
        { file: "src/crafting_recipes.js", patterns: [
            [/(?<![A-Za-z0-9_])(success_chance):\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/g,
             match => [[match[1], match[2], match[3]]]],
        ]},
    ];

    let checked = 0;
    for (const entry of scanned) {
        const full_path = path.join(repo_root, entry.file);
        if (!fs.existsSync(full_path)) {
            error(`${entry.file} is missing - this check is out of date.`);
            continue;
        }
        const source = strip_comments(fs.readFileSync(full_path, "utf8"));

        for (const [pattern, expand] of entry.patterns) {
            for (const match of source.matchAll(pattern)) {
                for (const [label, from, to] of expand(match)) {
                    checked++;
                    if (!(Number(from) > 0) || !(Number(to) > 0)) {
                        error(`${entry.file} declares a ${label} of [${from}, ${to}];`
                            + " both ends of an interpolated pair must be positive, or slerp"
                            + " falls back to a linear curve instead of the geometric one.");
                    }
                }
            }
        }
    }
    if (checked === 0) {
        error("found no interpolated pairs to check - this check is out of date.");
    }
    console.log(`[check] interpolated pairs: ${checked} checked`);
}

/**
 * Every money requirement in the content must use the spendable object form.
 *
 * The gate accepts a bare number too, but a bare number can never be charged - the
 * removal in main.js only fires for the object form, and it reads
 * remove_on_success / remove_on_fail on an action's `required` and `remove` on its
 * `conditions`. A price written as a bare number would therefore gate correctly and
 * silently cost nothing, which is the same class of failure as the bug this
 * mechanism was fixed for: a check that passes while nothing happens.
 *
 * Nothing required money before quest 4, so this starts with one site to protect.
 */
const money_removal_flags = ["remove", "remove_on_success", "remove_on_fail"];

function check_money_requirements() {
    let checked = 0;
    for (const file of ["src/dialogues.js", "src/locations.js"]) {
        const full_path = path.join(repo_root, file);
        if (!fs.existsSync(full_path)) {
            error(`${file} is missing - this check is out of date.`);
            continue;
        }
        const source = strip_comments(fs.readFileSync(full_path, "utf8"));

        // Only inside a requirement: a bare `money:` elsewhere is a REWARD, which is
        // a plain number by design and must not be caught here.
        for (const block of source.matchAll(/(?:required|conditions):\s*\[?\s*\{([\s\S]*?)\n\s{16}\}/g)) {
            // The braced alternative comes first, or the bare one truncates the
            // object at its first comma and loses the removal flag.
            const money = block[1].match(/(?<![A-Za-z0-9_])money:\s*(\{[^}]*\}|[^,\n]+)/);
            if (!money) continue;
            checked++;

            const value = money[1].trim();
            if (!value.startsWith("{")) {
                error(`${file} requires money as a bare value (${value}); a requirement that`
                    + " should be paid needs the object form, or it gates correctly and costs"
                    + " nothing.");
                continue;
            }
            const amount = value.match(/number:\s*(-?[\d.]+)/);
            if (!amount || !(Number(amount[1]) > 0)) {
                error(`${file} has a money requirement whose number is ${amount?.[1]};`
                    + " it must be a positive amount.");
            }
            if (!money_removal_flags.some(flag => value.includes(flag + ":"))) {
                error(`${file} has a money requirement with no removal flag; add one of`
                    + ` ${money_removal_flags.join(", ")}, or the price is never charged.`);
            }
        }
    }
    console.log(`[check] money requirements: ${checked} checked`);
}

/**
 * Every key inside a `rewards: { ... }` must be one process_rewards actually reads.
 *
 * A reward key nobody reads is silent: the content looks like it grants something,
 * the game grants nothing, and no check notices. That is not hypothetical - the
 * forest lake's deep dive rewarded `action: [...]` singular, which is not a key, so
 * unlocking the game's only silver tap did nothing for as long as it existed. The
 * author's note beside it read "locked as the reward doesn't really have any uses
 * yet", and it was half right for the wrong reason.
 *
 * The list is taken from what main.js reads, not from the schema in
 * src/rewards.js - that document is missing `global_activities` and `skills`, so
 * trusting it would reject two working keys.
 */
const reward_keys = [
    "actions", "activities", "crafting", "dialogues", "flags", "global_activities",
    "housing", "items", "locations", "locks", "messages", "money", "move_to",
    "quest_progress", "quests", "recipes", "reputation", "skill_xp", "skills",
    "stances", "textlines", "traders", "xp",
];
const lock_keys = ["actions", "dialogues", "locations", "quests", "textlines", "traders"];

/** The source text of the object literal starting at the `{` at `open`. */
function braced_body(source, open) {
    let depth = 0;
    for (let i = open; i < source.length; i++) {
        if (source[i] === "{") { depth++; }
        else if (source[i] === "}") {
            depth--;
            if (depth === 0) { return source.slice(open + 1, i); }
        }
    }
    return null;
}

/** Top-level `key:` names of an object literal body, ignoring nested ones. */
function top_level_keys(body) {
    const keys = [];
    let depth = 0;
    for (const line of body.split("\n")) {
        const trimmed = line.trim();
        if (depth === 0) {
            const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:/);
            if (match) { keys.push(match[1]); }
        }
        for (const character of line) {
            if (character === "{" || character === "[") { depth++; }
            else if (character === "}" || character === "]") { depth--; }
        }
    }
    return keys;
}

function check_reward_keys() {
    let blocks = 0;
    for (const file of ["src/locations.js", "src/dialogues.js", "src/quests.js", "src/enemies.js"]) {
        const full_path = path.join(repo_root, file);
        if (!fs.existsSync(full_path)) {
            error(`${file} is missing - this check is out of date.`);
            continue;
        }
        const source = strip_comments(fs.readFileSync(full_path, "utf8")).split("\r\n").join("\n");

        for (const match of source.matchAll(/(?:rewards|first_reward|repeatable_reward):\s*\{/g)) {
            const open = match.index + match[0].length - 1;
            const body = braced_body(source, open);
            if (body === null) {
                error(`${file} has a reward object that never closes - this check is out of date.`);
                continue;
            }
            blocks++;

            for (const key of top_level_keys(body)) {
                if (!reward_keys.includes(key)) {
                    error(`${file} has a reward key "${key}", which nothing reads.`
                        + ` Valid keys: ${reward_keys.join(", ")}.`);
                }
            }

            const locks = body.match(/(?<![A-Za-z0-9_])locks:\s*\{/);
            if (locks) {
                const lock_body = braced_body(body, locks.index + locks[0].length - 1);
                for (const key of top_level_keys(lock_body ?? "")) {
                    if (!lock_keys.includes(key)) {
                        error(`${file} has a lock key "${key}", which nothing reads.`
                            + ` Valid keys: ${lock_keys.join(", ")}.`);
                    }
                }
            }
        }
    }
    if (blocks === 0) {
        error("found no reward objects to check - this check is out of date.");
    }
    console.log(`[check] reward objects: ${blocks} checked`);
}

/**
 * Removes every ${...} from a template literal body, nesting included.
 *
 * A regex cannot do this: `${getText(language, "id", {v1: getText(...)})}` is three
 * levels of braces deep, and a non-nesting pattern stops at the first `}` and
 * leaves the tail behind as what looks like prose.
 */
function strip_interpolations(body) {
    let out = "";
    let i = 0;
    while (i < body.length) {
        if (body[i] === "$" && body[i + 1] === "{") {
            let depth = 0;
            i++;
            do {
                if (body[i] === "{") { depth++; }
                if (body[i] === "}") { depth--; }
                i++;
            } while (i < body.length && depth > 0);
            out += " ";
            continue;
        }
        out += body[i];
        i++;
    }
    return out;
}

/**
 * A module must import every name it calls from another module.
 *
 * `main.js` called `restore_message_log(...)` without importing it. esbuild does not
 * object - an unresolved identifier is a legitimate reference to a runtime global -
 * so the bundle built, the checks passed, and the game threw
 * `ReferenceError: restore_message_log is not defined` in the browser on load. The
 * whole startup after that point did not run, which is what a player saw.
 *
 * This is the narrow, high-value slice of what a linter would do: for every source
 * module, take the names it calls, and fail if any of them is exported by a DIFFERENT
 * module in src/ and not imported here. It cannot catch a typo that matches nothing
 * anywhere, but it catches exactly the mistake above - calling something real that
 * this file cannot see - which is the one that ships.
 */
async function check_modules_import_what_they_call() {
    const dir = path.join(repo_root, "src");
    const files = fs.readdirSync(dir).filter(file => file.endsWith(".js"));

    const sources = new Map();
    for (const file of files) {
        sources.set(file, strip_comments(fs.readFileSync(path.join(dir, file), "utf8")));
    }

    //What each module exports, from its `export { ... }` list and inline `export function`.
    const exported_by = new Map();
    for (const [file, source] of sources) {
        const names = new Set();
        for (const block of source.matchAll(/export\s*\{([^}]*)\}/g)) {
            for (const part of block[1].split(",")) {
                const name = part.trim().split(/\s+as\s+/)[0].trim();
                if (name) names.add(name);
            }
        }
        for (const inline of source.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)) {
            names.add(inline[1]);
        }
        exported_by.set(file, names);
    }

    let checked = 0;
    for (const [file, source] of sources) {
        //What this module imports, under whatever local name.
        const imported = new Set();
        for (const block of source.matchAll(/import\s*\{([^}]*)\}\s*from/g)) {
            for (const part of block[1].split(",")) {
                const piece = part.trim();
                if (!piece) continue;
                const as = piece.split(/\s+as\s+/);
                imported.add((as[1] ?? as[0]).trim());
            }
        }
        for (const star of source.matchAll(/import\s+(?:\*\s+as\s+)?(\w+)\s+from/g)) {
            imported.add(star[1]);
        }

        //Names declared in this module, at any depth. Coarse on purpose: a name
        //declared anywhere here is not the bug this check is looking for.
        const declared = new Set();
        for (const pattern of [/(?:^|\s)(?:async\s+)?function\s+(\w+)/g,
                               /(?:const|let|var)\s+(\w+)\s*=/g,
                               /class\s+(\w+)/g]) {
            for (const match of source.matchAll(pattern)) declared.add(match[1]);
        }

        //Every name used in call position.
        for (const call of source.matchAll(/(?<![.\w$])([a-z_][A-Za-z0-9_]*)\s*\(/g)) {
            const name = call[1];
            if (declared.has(name) || imported.has(name)) continue;

            const owner = [...exported_by].find(([other, names]) => other !== file && names.has(name));
            if (!owner) continue;

            checked++;
            error(`src/${file} calls ${name}(), which src/${owner[0]} exports and this file does`
                + " not import. esbuild treats an unresolved identifier as a runtime global, so this"
                + " builds and then throws ReferenceError in the browser.");
        }
    }
    if (checked === 0) {
        console.log(`[check] modules import what they call: ${files.length} files`);
    }
}

/**
 * Every item a recipe names has to exist.
 *
 * `crafting_component_filling.js` opens with the instruction that makes this
 * necessary:
 *
 *   DOES NOT AUTO-FILL CRAFTING RECIPES, DO IT MANUALLY AND MAKE SURE NAMES MATCH
 *
 * The generator builds component templates from a material and a component type, and
 * the recipes that produce them are written by hand against those names. A typo on
 * either side is silent: the recipe is listed, the player has the materials, and the
 * result is undefined.
 *
 * The item's name may be declared in items.js or built by the generator, so both
 * sets count. Recipes only - `shield_name` and `armor_name` on a component are
 * display strings rather than template references, which is why they are not checked
 * here: the comment above Shield.getDisplayName says so, and treating them as
 * references produces forty false positives.
 */
async function check_recipe_item_names() {
    const { generated, problem } = await load_generated_item_templates(repo_root);
    if (problem) {
        error(`${problem} - this check is out of date.`);
        return;
    }

    const items = strip_comments(fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8"));
    const known = new Set([
        ...Object.keys(generated),
        ...[...items.matchAll(/item_templates\["([^"]+)"\]\s*=\s*new /g)].map(match => match[1]),
    ]);

    const recipes = strip_comments(fs.readFileSync(path.join(repo_root, "src/crafting_recipes.js"), "utf8"));

    let checked = 0;
    const reported = new Set();
    for (const match of recipes.matchAll(/\b(material_id|result_id):\s*"([^"]+)"/g)) {
        const [, field, name] = match;
        checked++;
        if (known.has(name) || reported.has(`${field}:${name}`)) continue;
        reported.add(`${field}:${name}`);
        error(`src/crafting_recipes.js names ${field} "${name}", which is neither declared in`
            + " items.js nor built by crafting_component_filling.js. The recipe would list and"
            + " produce nothing.");
    }
    console.log(`[check] recipe item names: ${checked} resolved against ${known.size} templates`);
}

/**
 * An item's display name must not be another item's registry key.
 *
 * `item_templates["Cooked potato"]` carried `name: "Potato"`. `getDisplayName`
 * resolves `name ${this.getName()}`, so a cooked potato looked up the RAW potato's
 * row and displayed as "Potato" - while `"name Cooked potato"` sat in both locales,
 * written by somebody who meant it to be its own item and never read.
 *
 * A name that differs from the key is normal and deliberate here: `Goat meat` shows
 * as "Mountain goat meat", `Cooked clam` as "Boiled clam", `Cooking herbs` as
 * "Parsley, sage, rosemary and thyme". That is the display-name indirection the
 * whole project is built on. What is never right is a name that IS another key,
 * because then two items resolve to one row and the second one's translation can
 * never be reached.
 *
 * Not a save-data concern: setup_ids assigns `item_templates[id].id = id` from the
 * key and createInventoryKey uses this.id, so the name field is display only.
 */
function check_item_name_collisions() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8"));

    //Each declaration runs to the start of the next one, rather than being matched
    //with a lazy `[\s\S]*?` up to the first `\n\s+});` - that stops at whichever
    //nested object closes first, a stats block or a component list, and a name field
    //below it would be invisible.
    //
    //The count this reports is smaller than the number of `name:` fields in the file
    //that differ from their key, and that is correct: 118 of items.js's declarations
    //sit inside block comments, superseded by the components
    //crafting_component_filling.js generates, and strip_comments removes them. A
    //collision planted inside one of those is dead code and is right not to be
    //reported.
    const starts = [...source.matchAll(/item_templates\["([^"]+)"\]\s*=\s*new \w+\(\{/g)];
    if (starts.length === 0) {
        error("could not read any item_templates declarations out of src/items.js"
            + " - this check is out of date.");
        return;
    }

    const keys = new Set(starts.map(match => match[1]));
    let differing = 0;

    for (let i = 0; i < starts.length; i++) {
        const key = starts[i][1];
        const from = starts[i].index + starts[i][0].length;
        const to = i + 1 < starts.length ? starts[i + 1].index : source.length;
        const body = source.slice(from, to);

        const name = body.match(/\n\s+name:\s*"([^"]+)"/);
        if (!name || name[1] === key) continue;
        differing++;

        if (keys.has(name[1])) {
            error(`item_templates["${key}"] has name: "${name[1]}", which is another item's key.`
                + " getDisplayName resolves `name ${getName()}`, so this item would show the other"
                + ` one's name and its own "name ${key}" row could never be reached.`);
        }
    }
    console.log(`[check] item name collisions: ${differing} names differ from their key, none collide`);
}

/**
 * Every choice on the hero creation panel needs a locale row for its VALUE.
 *
 * The panel's buttons carry two different strings and only one of them was ever
 * checked. `data-translation` is the button's own label and `translateUI` resolves
 * it. `data-age` / `data-height` / `data-race_id` is the value that goes into
 * `character.personal`, into the save, and back out through
 * `getText(language, character.personal.age)` in fill_character_bio - and nothing
 * verified that one.
 *
 * `data-age="middle aged"` had no row, because the row was written `"middle-aged"`
 * with a hyphen. Every player who picked the third age option read
 * `Age: text not found, id: middle aged` in their own character bio, in both
 * languages, from the moment they made the character.
 *
 * The hyphen is what has to move, not the attribute: the attribute value is save
 * data. That is the same rule the registry keys follow.
 */
async function check_creation_panel_values() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const html = fs.readFileSync(path.join(repo_root, "index.html"), "utf8");

    //field -> where the value ends up, for the error message. Race is not here:
    //its buttons are built by character_creation.js from playable_races, so the
    //value cannot drift from the registry the way a hand-written attribute can, and
    //the race name goes through playable_races[key].name rather than the key itself.
    const fields = [
        { attribute: "data-age", stored_as: "character.personal.age" },
        { attribute: "data-height", stored_as: "character.personal.height" },
    ];

    let checked = 0;
    for (const { attribute, stored_as } of fields) {
        const values = new Set([...html.matchAll(new RegExp(`${attribute}="([^"]*)"`, "g"))]
            .map(match => match[1]));
        if (values.size === 0) {
            error(`index.html has no ${attribute} attributes - this check is out of date.`);
            continue;
        }

        for (const value of values) {
            checked++;
            if (!(value in reference)) {
                error(`index.html offers ${attribute}="${value}", which has no row in`
                    + ` locales/${default_language}.js. That value is stored as ${stored_as} and`
                    + " looked up as a text id, so the character bio would read \"text not found,"
                    + ` id: ${value}\". Fix the row's key - the attribute value is save data.`);
            }
        }
    }
    console.log(`[check] hero creation panel values: ${checked} resolved`);
}

/**
 * A translation must not contain English function words.
 *
 * This is the cheapest possible guard on the thing that matters most about a
 * bilingual build: a row that was copied across and never translated. Function
 * words are the tell, because "the", "with", "from" and "would" appear in no
 * Turkish sentence.
 *
 * Two traps this had to avoid, and both of them were fallen into first:
 *
 *   - whole words only. A run-of-lowercase match finds "are" inside "Fare", which
 *     is Turkish for mouse, and reports every line the mill mice speak.
 *   - no homographs. "her" is Turkish for every, "has" appears in "kendine has",
 *     "not" is a note, "his" is a feeling. Any of those in the word list turns the
 *     output into noise.
 *
 * The list is therefore short and conservative on purpose. It is meant to catch a
 * row nobody translated, not to grade prose.
 */
async function check_translations_have_no_english() {
    const english_only = new Set(("the and you your with from that this these those they them "
        + "their there what when where which while would could should have having been being "
        + "was were about into onto over under after before because but for our ours its his "
        + "him she hers does doing cannot something someone anything everything somebody "
        + "nobody nothing always never really quite such another said says told asked knew "
        + "thought wanted made took gave came going").split(" "));

    //Turkish words that are also English words. Listed so the next person can see
    //that the omissions are deliberate rather than oversights.
    const homographs = new Set(["her", "has", "not", "his", "an", "at", "on", "o", "bu", "ne",
        "de", "da", "ol", "el", "en", "in", "il", "is", "it", "as", "am", "are", "be", "by",
        "to", "no", "so", "we", "me", "my", "if", "of", "or", "a", "i"]);

    const names = fs.readdirSync(locales_dir)
        .filter(file => file.endsWith(".js"))
        .map(file => file.slice(0, -3))
        .filter(name => name !== default_language);

    //Any letter, Turkish included. \p{L} rather than a-z, or every ş and ğ becomes a
    //word boundary and the scan reports fragments.
    const word = /\p{L}+/gu;

    let scanned = 0;
    for (const name of names) {
        const source = fs.readFileSync(path.join(locales_dir, `${name}.js`), "utf8");

        source.split(/\r?\n/).forEach((line, index) => {
            const row = line.match(/^\s+"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (!row) return;
            scanned++;

            const found = new Set();
            for (const match of row[2].matchAll(word)) {
                const lower = match[0].toLowerCase();
                //Capitalised words are names: Marrowmoth, Obaru, and the item and
                //location names a translation legitimately keeps.
                if (match[0][0] !== lower[0]) continue;
                if (homographs.has(lower)) continue;
                if (english_only.has(lower)) found.add(lower);
            }
            if (found.size) {
                error(`locales/${name}.js:${index + 1} "${row[1]}" still contains English:`
                    + ` ${[...found].join(", ")}. If one of those is a word in this language,`
                    + " add it to the homographs list in check_translations_have_no_english.");
            }
        });
    }
    console.log(`[check] no English in the translations: ${scanned} rows scanned`);
}

/**
 * Every locale row has to be reachable.
 *
 * check_content_text_ids does the forward direction - every id the source names
 * exists in the locale, so nothing renders "text not found". This is the reverse: a
 * row no code path can ask for is dead weight that a translator still translates.
 *
 * The whole difficulty is the computed ids. Most of this game's text is reached
 * through an assembled key - `name ${registry_key}`, `desc item ${item_name}`,
 * `material ${material}`, `ui slot ${slot}` - so a scan for the literal key reports
 * thousands of rows that are perfectly alive. The prefixes below are those families.
 * Adding a new one is a deliberate act and belongs in this list.
 */
async function check_no_unused_locale_rows() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    let source = "";
    for (const file of fs.readdirSync(path.join(repo_root, "src")).filter(f => f.endsWith(".js"))) {
        source += strip_comments(fs.readFileSync(path.join(repo_root, "src", file), "utf8"));
    }
    source += fs.readFileSync(path.join(repo_root, "index.html"), "utf8");

    //Id families assembled at runtime from a registry key or another value.
    const computed = [
        "name ", "desc item ", "desc enemy ", "desc location ", "desc skill ",
        "material ", "material name ", "component ", "armor piece ",
        "ui slot ", "material type ", "weapon type ", "ui component slot ",
        "ui stat source ", "ui xp target ", "ui task type ", "ui task group ",
        "ui skill category ", "season ", "weekday ", "time of day ",
        "skill effect ", "skill milestone ", "book ", "effect ",
        "loc ", "noise ", "travel ", "activity ", "action ", "quest ", "recipe ",
        "age ", "height ", "race ", "ui rarity ", "ui enemy tag ", "loctype ",
    ];

    //Stat keys are looked up bare and with a " long" suffix, off a runtime key.
    const stat_block = strip_comments(fs.readFileSync(path.join(repo_root, "src/character.js"), "utf8"))
        .match(/this\.base_stats = \{([\s\S]*?)\n\s{16}\};/);
    const stat_keys = new Set(stat_block
        ? [...stat_block[1].matchAll(/([a-z_]+)\s*:/g)].map(match => match[1])
        : []);

    const unused = [];
    for (const key of Object.keys(reference)) {
        //A mofu# variant is reached exactly when its base is.
        const probe = key.startsWith(variant_prefix) ? key.slice(variant_prefix.length) : key;
        if (source.includes(`"${probe}"`) || source.includes(`\`${probe}\``)
            || source.includes(`'${probe}'`)) continue;
        if (computed.some(prefix => probe.startsWith(prefix))) continue;
        const bare = probe.endsWith(" long") ? probe.slice(0, -5) : probe;
        if (stat_keys.has(bare)) continue;
        unused.push(key);
    }

    for (const key of unused) {
        error(`locales/${default_language}.js declares "${key}", which nothing in src/ asks for.`
            + " Delete it, or - if it belongs to a family of ids assembled at runtime - add that"
            + " prefix to the computed list in check_no_unused_locale_rows.");
    }
    console.log(`[check] locale rows reachable: ${Object.keys(reference).length - unused.length}`
        + `/${Object.keys(reference).length}`);
}

/**
 * No locale row may be a placeholder.
 *
 * `"action gaze success": "[TBD]"` shipped in both locales for as long as the action
 * existed. It was unreachable, which is why nobody saw it, but "unreachable" is a
 * property of today's success_chances and not a promise - the row was one edit away
 * from being the text a player read.
 *
 * The Nekomimi cafe's nine `lorem ipsum` strings were the same class of thing and
 * were caught by reading the file. This is that read, every build.
 */
async function check_no_placeholder_text() {
    const placeholder = /\[TBD\]|\[tbd\]|lorem ipsum|LOREM IPSUM|\bTODO\b|\bFIXME\b|XXXX/;

    const names = fs.readdirSync(locales_dir)
        .filter(file => file.endsWith(".js"))
        .map(file => file.slice(0, -3));

    for (const name of names) {
        const source = fs.readFileSync(path.join(locales_dir, `${name}.js`), "utf8");

        source.split(/\r?\n/).forEach((line, index) => {
            const row = line.match(/^\s+"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (!row) return;
            //"[tbc]" at the end of the four-legged bird line is the author's tease and
            //the player is meant to read it - it is the only intentional one, and it is
            //intentional because the action can never resolve past it.
            if (row[1] === "action gaze fail random_loss 1") return;
            if (placeholder.test(row[2])) {
                error(`locales/${name}.js:${index + 1} "${row[1]}" is still placeholder text:`
                    + ` "${row[2].slice(0, 40)}". Write it or delete the row.`);
            }
        });
    }
    console.log("[check] no placeholder text in the locales");
}

/**
 * An action must not declare a branch it can never take.
 *
 * Two shapes, both found on the `gaze` action:
 *
 *   - `conditional_loss` with no `conditions`. process_conditions returns 1 when the
 *     condition list is empty (conditions.js: "no conditions mean nothing to fail"),
 *     so conditions_status is never 0 and that text cannot be reached. Gaze's copy
 *     was pasted from the deep dive and talked about lung capacity.
 *   - a success text with `success_chances` all zero. `action_result > Math.random()`
 *     is never true at 0, so the success branch cannot fire. Gaze's pointed at a row
 *     whose content was "[TBD]".
 *
 * Neither is a crash. Both are text that looks written and is not reachable, which is
 * the most expensive kind of dead content because it reads as finished.
 */
function check_action_branches() {
    let checked = 0;
    for (const relative of ["src/locations.js", "src/dialogues.js"]) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const match of source.matchAll(/new (?:GameAction|DialogueAction)\(\{([\s\S]*?)\n\s{8,12}\}\)/g)) {
            const body = match[1];
            const id = body.match(/action_id:\s*"([^"]+)"/);
            const name = id ? id[1] : "(action with no id)";
            checked++;

            const has_conditions = /\n\s+conditions:\s*\[\s*\{/.test(body);
            if (/conditional_loss:/.test(body) && !has_conditions) {
                error(`action "${name}" in ${relative} declares a conditional_loss text but has no`
                    + " conditions. process_conditions returns 1 for an empty list, so that text"
                    + " can never be shown.");
            }

            const chances = body.match(/success_chances:\s*\[([^\]]*)\]/);
            const all_zero = chances
                && chances[1].split(",").filter(part => part.trim()).every(part => Number(part) === 0);
            if (all_zero && /\n\s+success_text(s)?:|getSuccessText/.test(body)) {
                error(`action "${name}" in ${relative} has success_chances of zero but declares a`
                    + " success text, which no player can reach. Either give it a chance of"
                    + " succeeding or drop the text.");
            }
        }
    }
    console.log(`[check] action branches: ${checked} actions`);
}

/**
 * Every global_flags name referenced outside main.js has to exist in main.js.
 *
 * The flags are a string-keyed object, so a rename or a typo is silent in both
 * directions: `global_flags.is_mountain_forge_buit` is undefined, which is falsy,
 * which means the Mountain camp's forge would simply never appear and nothing would
 * say why. A reward granting a flag that main.js does not declare adds a key
 * nothing reads.
 *
 * This is the check the mountain forge needed, because the whole mechanism is a
 * getter reading one flag name: `get tiers()` on the camp's crafting object
 * evaluates at the moment of the craft (main.js and display.js both read
 * current_location.crafting.tiers[category] live), and a falsy tier hides the
 * category button entirely. That behaviour is right, and it is also exactly why a
 * misspelled flag would look like a design decision rather than a bug.
 */
async function check_global_flags() {
    const main_source = strip_comments(fs.readFileSync(path.join(repo_root, "src/main.js"), "utf8"));

    const block = main_source.match(/const global_flags = \{([\s\S]*?)\n\};/);
    if (!block) {
        error("src/main.js has no `const global_flags = { ... }` - this check is out of date.");
        return;
    }
    const declared = new Set([...block[1].matchAll(/^\s+([A-Za-z_][A-Za-z0-9_]*)\s*:/gm)]
        .map(match => match[1]));
    if (declared.size === 0) {
        error("could not read any names out of global_flags - this check is out of date.");
        return;
    }

    //Two ways a flag is named: read as a property, or granted as a reward string.
    const scanned = ["src/locations.js", "src/dialogues.js", "src/quests.js", "src/enemies.js"];
    let references = 0;
    for (const relative of scanned) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const match of source.matchAll(/global_flags\.([A-Za-z_][A-Za-z0-9_]*)/g)) {
            references++;
            if (!declared.has(match[1])) {
                error(`${relative} reads global_flags.${match[1]}, which src/main.js does not`
                    + " declare. An undeclared flag is undefined, which is falsy, so whatever it"
                    + " gates would silently never appear.");
            }
        }
        //Three shapes, all of which name a flag as a string: `flags: ["is_x"]` in a
        //rewards object, `required_flags: {yes: [...], no: [...]}` on a textline, and
        //`display_conditions: {flags: [...]}`. The first version of this pattern
        //excluded a preceding underscore to avoid matching a property called
        //something_flags, which also excluded required_flags - the one of the three
        //that gates whether a line can be seen at all.
        for (const list of source.matchAll(/\b(?:required_)?flags\s*:\s*(\{[^}]*\}|\[[^\]]*\])/g)) {
            for (const name of list[1].matchAll(/"([A-Za-z_][A-Za-z0-9_]*)"/g)) {
                references++;
                if (!declared.has(name[1])) {
                    error(`${relative} names flag "${name[1]}", which src/main.js does not declare`
                        + " in global_flags.");
                }
            }
        }
    }
    console.log(`[check] global flags: ${declared.size} declared, ${references} references resolved`);
}

/**
 * A location with a trader needs a market region, and the region has to exist.
 *
 * The game has its own verifier (src/verifier.js) which says exactly this, and it
 * is the one that caught the salt house - in a browser, after `npm run check` had
 * already passed. That is the wrong order: the verifier needs the whole module
 * graph and the circular imports that only resolve in a browser, so it cannot run
 * here, but this particular assertion is plain text and belongs in the build.
 *
 * Without a region, market_saturation has no counter for the shop and the prices it
 * quotes are not the prices it charges.
 */
async function check_trader_market_regions() {
    const locations_source = strip_comments(fs.readFileSync(path.join(repo_root, "src/locations.js"), "utf8"));
    const market_source = strip_comments(fs.readFileSync(path.join(repo_root, "src/market_saturation.js"), "utf8"));

    const mapping = market_source.match(/const market_region_mapping = \{([\s\S]*?)\n\};/);
    if (!mapping) {
        error("src/market_saturation.js has no `const market_region_mapping = { ... }`"
            + " - this check is out of date.");
        return;
    }
    const regions = new Set([...mapping[1].matchAll(/"([^"]+)"\s*:/g)].map(match => match[1]));
    //The mapping is symmetrised at load: anything named as a neighbour becomes a
    //region of its own too.
    for (const match of mapping[1].matchAll(/:\s*\[([^\]]*)\]/g)) {
        for (const neighbour of match[1].matchAll(/"([^"]+)"/g)) {
            regions.add(neighbour[1]);
        }
    }

    //Each `locations["X"] = new Location({ ... });` block, so traders and
    //market_region can be read as belonging to the same room. Only Location: a
    //Combat_zone cannot hold a shop.
    const blocks = [...locations_source.matchAll(/locations\["([^"]+)"\]\s*=\s*new Location\(\{([\s\S]*?)\n {4}\}\);/g)];
    if (blocks.length === 0) {
        error("could not read any location blocks out of src/locations.js - this check is out of date.");
        return;
    }

    //Anchored at the room's own indentation. A `traders:` nested inside a reward is
    //a different thing entirely: Gang hideout's repeatable_reward carries
    //`locks: {traders: [...]}`, which is a trader being taken away from the Slums,
    //and reading that as a shop inside a combat zone is how this check first
    //reported a defect that was not there.
    const own_field = (body, field) => body.match(new RegExp(`^ {8}${field}\\s*:\\s*(.*)$`, "m"));

    let with_traders = 0;
    for (const [, name, body] of blocks) {
        const traders = own_field(body, "traders");
        if (!traders || !/\[\s*"/.test(traders[1])) continue;
        with_traders++;

        const region_field = own_field(body, "market_region");
        const region = region_field && region_field[1].match(/^"([^"]+)"/);
        if (!region) {
            error(`location "${name}" has a trader but no market_region, so market saturation has`
                + " no counter for its shop. src/verifier.js refuses this at runtime.");
            continue;
        }
        if (!regions.has(region[1])) {
            error(`location "${name}" claims market_region "${region[1]}", which is not a region in`
                + " market_region_mapping.");
        }
    }
    console.log(`[check] trader market regions: ${with_traders} shops across ${regions.size} regions`);
}

/**
 * Registry VALUES that reach the screen need rows too.
 *
 * The DOM scan cannot find these: `${item.material_type}` is an interpolation, and
 * stripping interpolations is exactly what lets that check ignore the parts which
 * are already display names. So this one goes the other way - it reads the values
 * the content declares and requires a row for each.
 *
 * A missing row here renders as "text not found, id: material type bone" in game,
 * which is at least loud. Before the row existed at all the tooltip printed the raw
 * value instead, which is quiet and is how "Material type: bread" survived a full
 * Turkish pass.
 */
/**
 * Every skill category a skill declares needs a name row.
 *
 * The skill list headings and the milestone reward lines both build their id as
 * `ui skill category <category>` straight from the skill's own field, so a category
 * with no row shows the player `text not found, id: ...` where its heading belongs -
 * which is what the Crafting heading did for as long as the panel existed.
 *
 * Crafting is the only category written through a constant rather than a literal, and
 * that is precisely why writing these rows by reading the file missed it. So the
 * constants get resolved here rather than matched as text.
 */
/**
 * A computed id family whose values can be enumerated needs a row for every value.
 *
 * Neither of the two checks that guard translated text can see these:
 *
 *   - check_no_english_in_dom looks for string literals, and these arrive as `${tag}`
 *     - an interpolation, which is exactly what that check subtracts;
 *   - check_registry_value_names reads `field: "value"` declarations, and these are
 *     array members and registry keys instead.
 *
 * Which is how the bestiary came to print "[living] [beast] [wolf rat] [small]" and the
 * location header "narrow" and "dark II" in a Turkish interface, with every other check
 * passing. Add a family here whenever a new registry's keys start being shown.
 */
async function check_enumerable_id_families() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const read = (relative) => strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

    const collect = (source, pattern) => {
        const found = new Set();
        for (const match of source.matchAll(pattern)) {
            found.add(match[1]);
        }
        return found;
    };

    const enemies = read("src/enemies.js");

    //tags: ["living", "beast", "wolf rat"] - the members, not the field.
    const enemy_tags = new Set();
    for (const match of enemies.matchAll(/tags:\s*\[([^\]]*)\]/g)) {
        for (const member of match[1].matchAll(/"([^"]+)"/g)) {
            enemy_tags.add(member[1]);
        }
    }
    //Every enemy also carries its size as a tag, from the enemy_sizes enum.
    for (const size of collect(enemies, /^\s*(?:SMALL|MEDIUM|LARGE):\s*"([^"]+)"/gm)) {
        enemy_tags.add(size);
    }

    const families = [
        {
            what: "enemy tag",
            prefix: "ui enemy tag",
            values: enemy_tags,
            shown_by: "the bestiary tooltip",
        },
        {
            what: "location type",
            prefix: "loctype",
            values: collect(read("src/locations.js"), /location_types\["([^"]+)"\]\s*=/g),
            shown_by: "the location header",
        },
    ];

    let total = 0;
    for (const { what, prefix, values, shown_by } of families) {
        if (values.size === 0) {
            error(`no ${what} values found - this check is out of date.`);
            continue;
        }
        for (const value of values) {
            if (!(`${prefix} ${value}` in reference)) {
                error(`locales/${default_language}.js has no "${prefix} ${value}" row, so`
                    + ` ${shown_by} would show the ${what} "${value}" untranslated.`);
            }
        }
        total += values.size;
    }

    console.log(`[check] enumerable id families: ${total} values resolved`);
}

async function check_skill_category_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/skills.js"), "utf8"));

    //const skill_category_crafting = "Crafting";
    const constants = new Map();
    for (const match of source.matchAll(/const\s+(skill_category_\w+)\s*=\s*"([^"]+)"/g)) {
        constants.set(match[1], match[2]);
    }

    /*
        A skill's own category, and not the `{category, subcategory, recipe_id}` triples
        that milestones use to unlock recipes - those name a recipe page, which is a
        different registry and carries no heading.
    */
    const categories = new Set();
    const pattern = /(?<!\w)category\s*:\s*(?:"([^"]+)"|([A-Za-z_]\w*))(?!\s*,\s*subcategory)/g;
    for (const match of source.matchAll(pattern)) {
        const [, literal, identifier] = match;
        if (literal) {
            categories.add(literal);
        } else if (constants.has(identifier)) {
            categories.add(constants.get(identifier));
        } else {
            error(`src/skills.js sets a skill category to ${identifier}, which this check`
                + ` cannot resolve to a value - so it cannot tell whether it has a name row.`);
        }
    }

    if (categories.size === 0) {
        error("no skill categories found in src/skills.js - this check is out of date.");
        return;
    }

    for (const category of categories) {
        if (!(`ui skill category ${category}` in reference)) {
            error(`locales/${default_language}.js has no "ui skill category ${category}" row,`
                + ` so the ${category} heading in the skill list reads as a missing text id.`);
        }
    }

    console.log(`[check] skill category names: ${categories.size} resolved`);
}

async function check_registry_value_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    //field -> {files, prefix}. Add a row here when a new registry field starts
    //being shown to the player.
    const shown_values = [
        { field: "material_type", files: ["src/items.js", "src/crafting_recipes.js"], prefix: "material type" },
        { field: "weapon_type", files: ["src/items.js"], prefix: "weapon type" },
        //getItemRarity assigns these rather than declaring them as a field, and the
        //quality line of every item tooltip prints one.
        { field: "rarity", files: ["src/items.js"], prefix: "ui rarity" },
    ];

    let total = 0;
    for (const { field, files, prefix } of shown_values) {
        const values = new Set();
        for (const relative of files) {
            const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));
            const pattern = new RegExp(`${field}\\s*[:=]\\s*"([^"]+)"`, "g");
            for (const match of source.matchAll(pattern)) {
                values.add(match[1]);
            }
        }
        if (values.size === 0) {
            error(`no ${field} values found in ${files.join(", ")} - this check is out of date.`);
            continue;
        }

        for (const value of values) {
            //items.js calls a hammer a "battle hammer" everywhere it shows one, and the
            //row follows the shown name rather than the stored one.
            const shown = field === "weapon_type" && value === "hammer" ? "battle hammer" : value;
            if (!(`${prefix} ${shown}` in reference)) {
                error(`locales/${default_language}.js has no "${prefix} ${shown}" row, so an item`
                    + ` with ${field} "${value}" would show that value untranslated.`);
            }
        }
        total += values.size;
    }
    console.log(`[check] registry value names: ${total} resolved`);
}

/**
 * No English may be written straight into the DOM.
 *
 * This is the check that should have existed before the interface was translated
 * panel by panel from screenshots. A screenshot only shows what is on screen; a
 * scan sees the crafting window, the bestiary and the stance list too, and it found
 * twenty-eight more sites after the last screenshot had been fixed.
 *
 * It looks at every string literal on a line that assigns innerText / innerHTML or
 * calls set_HTML / insert_HTML, and subtracts what is legitimately not prose:
 *
 *   - locale text ids (those ARE the translation)
 *   - markup: tags, attributes, entities, ${...} interpolations
 *   - material-icons glyph names and CSS class lists, which are single tokens
 *   - the explicit allowlist below, for the handful of real exceptions
 *
 * What is left is a word a player can read that no translation can reach.
 */
async function check_no_english_in_dom() {
    const reference = await load_locale(default_language);
    if (!reference) return;
    const locale_keys = new Set(Object.keys(reference));

    //Literals that reach the DOM and are correctly not translated. Each one needs a
    //reason, because the point of the check is that "it is only a word" is not one.
    const allowed = new Set([
        //A unit that reads the same in both languages, in markup nothing ever rewrites.
        "mana",
    ]);

    //=[^=] and not just =: `innerText === "[Comp]"` reads the DOM, it does not write
    //to it, and flagging a comparison would push a translation into a sort key.
    const writers = /(?:innerText|innerHTML)\s*=[^=]|set_HTML\(|insert_HTML\(/;

    let flagged = 0;
    let checked = 0;
    for (const relative of ["src/display.js", "src/main.js"]) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const literal of read_string_literals(source)) {
            //Everything back to the previous statement boundary. Whether a literal
            //reaches the DOM is a property of its statement, not of the line it starts
            //on - a template literal can span four lines.
            const boundary = Math.max(source.lastIndexOf(";", literal.start),
                                      source.lastIndexOf("{", literal.start),
                                      source.lastIndexOf("}", literal.start));
            const statement = source.slice(boundary + 1, literal.start);
            if (!writers.test(statement)) continue;
            //A diagnostic is for the developer's console, not for the player.
            if (/console\.(warn|error|log)|throw new Error/.test(statement)) continue;

            checked++;
            if (locale_keys.has(literal.body)) continue;
            if (allowed.has(literal.body.trim())) continue;

            const text = strip_interpolations(literal.body)
                .replace(/<i\b[^>]*material-icons[^>]*>[^<]*<\/i>/g, " ")
                .replace(/<[^>]*>/g, " ")
                .replace(/&[a-z]+;/g, " ")
                .replace(/\\[nrt]/g, " ")
                .trim();
            if (!text) continue;
            //A single lowercase token is an id, a class name or an icon glyph name.
            if (/^[a-z0-9_.\-]+$/.test(text)) continue;
            //Needs two adjacent letters somewhere to be a word rather than a symbol.
            if (!/[A-Za-z]{2}/.test(text)) continue;

            flagged++;
            error(`${relative}:${literal.line} writes "${text.slice(0, 60)}" into the DOM as a`
                + " literal. Player-facing text goes through a locale row; if this one is not"
                + " player-facing, add it to the allowlist in check_no_english_in_dom with a"
                + " reason.");
        }
    }
    if (flagged === 0) {
        console.log(`[check] no English written straight into the DOM: ${checked} literals`);
    }
}

/**
 * Every string literal in the source, with its offset and starting line.
 *
 * Walks characters because a template literal can span lines, and splitting on
 * newlines first reports each half as if it were a whole string - which is how a
 * `<i class="material-icons">` opening tag came to look like prose once the closing
 * tag moved to the next line. Comments are already blanked by strip_comments, so
 * anything quoted here is real code.
 *
 * @returns {{body: String, start: Number, line: Number}[]}
 */
function read_string_literals(source) {
    const found = [];
    let i = 0;
    let line = 1;
    while (i < source.length) {
        const c = source[i];
        if (c === "\n") { line++; i++; continue; }
        if (c !== '"' && c !== "'" && c !== "`") { i++; continue; }

        const start = i;
        const start_line = line;
        let body = "";
        i++;
        while (i < source.length && source[i] !== c) {
            if (source[i] === "\\") { body += source[i] + (source[i + 1] ?? ""); i += 2; continue; }
            if (source[i] === "\n") { line++; }
            body += source[i];
            i++;
        }
        i++;
        found.push({ body, start, line: start_line });
    }
    return found;
}

/**
 * Every equipment slot needs a "ui slot <key>" row.
 *
 * The empty-slot label is built from the slot key at runtime -
 * `ui slot ${key}` - so the content-id scan cannot see the finished id and
 * deliberately refuses to guess at a concatenation. This replaces that coverage
 * by checking the same list display.js builds its slot map from.
 *
 * Before this, the label was assembled from the raw key instead of the locale,
 * which is why every empty slot read "head slot", "fishing pole slot" and so on in
 * English while the rows to translate them had existed all along.
 */
async function check_equipment_slot_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/display.js"), "utf8"));
    const map = source.match(/const equipment_slots_divs\s*=\s*\{([\s\S]*?)\n\};/);
    if (!map) {
        error("src/display.js has no `const equipment_slots_divs = { ... }` - this check is out of date.");
        return;
    }

    // Keys are bare or quoted: `head:` and `"off-hand":` both appear.
    const slots = [...map[1].matchAll(/(?:^|,)\s*"?([A-Za-z_-]+)"?\s*:/g)].map(match => match[1]);
    if (slots.length === 0) {
        error("could not read any slot keys out of equipment_slots_divs - this check is out of date.");
        return;
    }

    for (const slot of slots) {
        if (!(`ui slot ${slot}` in reference)) {
            error(`locales/${default_language}.js has no "ui slot ${slot}" row, so that empty`
                + " equipment slot would render a placeholder.");
        }
    }
    console.log(`[check] equipment slot names: ${slots.length} resolved`);
}

/**
 * Every location type a zone claims must exist, at a stage that exists.
 *
 * The stages are where a type's effects and skill scaling live, so a zone asking
 * for a stage the type does not define asks for nothing: it reads as a configured
 * environment and behaves as an unconfigured one. Caught while writing the plains,
 * which claimed `open` at stage 3 when `open` defines 1 and 2.
 *
 * The stage numbers are read from the LocationType declarations rather than
 * hard-coded, so adding a stage to a type does not need a change here.
 */
function check_location_types() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/locations.js"), "utf8"))
        .split("\r\n").join("\n");

    const defined = new Map();
    for (const match of source.matchAll(/location_types\["([^"]+)"\]\s*=\s*new LocationType\(\{/g)) {
        const body = braced_body(source, match.index + match[0].length - 1);
        if (body === null) continue;
        defined.set(match[1], [...body.matchAll(/^\s{12}(\d+):\s*\{/gm)].map(stage => Number(stage[1])));
    }
    if (defined.size === 0) {
        error("src/locations.js declares no location types - this check is out of date.");
        return;
    }

    let checked = 0;
    for (const match of source.matchAll(/\{type:\s*"([^"]+)",\s*stage:\s*(\d+)/g)) {
        checked++;
        const [, type, stage] = match;
        if (!defined.has(type)) {
            error(`a zone claims location type "${type}", which is not declared.`);
        } else if (!defined.get(type).includes(Number(stage))) {
            error(`a zone claims location type "${type}" at stage ${stage}, which it does not`
                + ` define (it has ${defined.get(type).join(", ")}). The stage carries the`
                + " type's effects and scaling, so the zone would get none of them.");
        }
    }
    console.log(`[check] location types: ${checked} claims across ${defined.size} types`);
}

/**
 * Every locked textline and action must be unlocked by something, and every unlock
 * must name something that exists.
 *
 * A textline with is_unlocked: false that nothing ever unlocks is dead content the
 * author cannot see is dead. That is not hypothetical: the "cute little rat"
 * dialogue's ~who~ line sat unreachable from the day it was written, because the
 * line before it unlocked ~walls~ instead - a copy-paste slip no test could notice
 * and no player could report, since nobody could reach the dialogue at all.
 *
 * Three mechanisms unlock things and all three are counted: rewards.textlines,
 * rewards.actions, and the otherUnlocks callbacks that assign .is_unlocked
 * directly. Rewards are read from five files, not two - quests unlock textlines
 * too, and missing that reported the village elder's "more training" as dead when
 * quests.js is what unlocks it.
 */
function check_content_is_reachable() {
    const read = file => strip_comments(fs.readFileSync(path.join(repo_root, file), "utf8"))
        .split("\r\n").join("\n");

    const dialogues_src = read("src/dialogues.js");
    const locations_src = read("src/locations.js");
    const reward_sources = [dialogues_src, locations_src,
        ...["src/quests.js", "src/enemies.js", "src/actions.js"].map(read)];

    /** key -> is it declared locked */
    const declared = new Map();

    const collect = (owner, body, kind, constructor_name) => {
        const marker = new RegExp(`${kind}:\\s*\\{`);
        const found = body.match(marker);
        if (!found) return;
        const group = braced_body(body, found.index + found[0].length - 1);
        if (group === null) return;

        const entries = new RegExp(`"([^"]+)":\\s*new ${constructor_name}\\(\\{`, "g");
        for (const entry of group.matchAll(entries)) {
            const inner = braced_body(group, entry.index + entry[0].length - 1);
            declared.set(`${owner}|${entry[1]}|${kind}`, /is_unlocked:\s*false/.test(inner ?? ""));
        }
    };

    for (const match of dialogues_src.matchAll(/dialogues\["([^"]+)"\]\s*=\s*new Dialogue\(\{/g)) {
        const body = braced_body(dialogues_src, match.index + match[0].length - 1);
        if (body === null) continue;
        collect(match[1], body, "textlines", "Textline");
        collect(match[1], body, "actions", "DialogueAction");
    }
    for (const match of locations_src.matchAll(/locations\["([^"]+)"\]\.actions\s*=\s*\{/g)) {
        const group = braced_body(locations_src, match.index + match[0].length - 1);
        if (group === null) continue;
        for (const entry of group.matchAll(/"([^"]+)":\s*new GameAction\(\{/g)) {
            const inner = braced_body(group, entry.index + entry[0].length - 1);
            declared.set(`${match[1]}|${entry[1]}|actions`, /is_unlocked:\s*false/.test(inner ?? ""));
        }
    }

    const unlocked = new Set();
    for (const source of reward_sources) {
        // Both property orders, because content uses both.
        for (const match of source.matchAll(/\{\s*dialogue:\s*"([^"]+)"\s*,\s*lines:\s*\[([^\]]*)\]/g)) {
            for (const line of match[2].matchAll(/"([^"]+)"/g)) {
                unlocked.add(`${match[1]}|${line[1]}|textlines`);
            }
        }
        for (const match of source.matchAll(/\{\s*lines:\s*\[([^\]]*)\]\s*,\s*dialogue:\s*"([^"]+)"/g)) {
            for (const line of match[1].matchAll(/"([^"]+)"/g)) {
                unlocked.add(`${match[2]}|${line[1]}|textlines`);
            }
        }
        for (const match of source.matchAll(/\{\s*(?:dialogue|location):\s*"([^"]+)"\s*,\s*action:\s*"([^"]+)"\s*\}/g)) {
            unlocked.add(`${match[1]}|${match[2]}|actions`);
        }
        for (const match of source.matchAll(/\{\s*action:\s*"([^"]+)"\s*,\s*(?:dialogue|location):\s*"([^"]+)"\s*\}/g)) {
            unlocked.add(`${match[2]}|${match[1]}|actions`);
        }
        for (const match of source.matchAll(
            /(?:dialogues|locations)\["([^"]+)"\]\.(textlines|actions)\["([^"]+)"\]\.is_unlocked\s*=\s*true/g)) {
            unlocked.add(`${match[1]}|${match[3]}|${match[2]}`);
        }
    }

    if (declared.size === 0 || unlocked.size === 0) {
        error("found no content to check reachability for - this check is out of date.");
        return;
    }

    for (const [key, locked] of declared) {
        if (locked && !unlocked.has(key)) {
            const [owner, name, kind] = key.split("|");
            error(`${kind.replace(/s$/, "")} "${name}" on "${owner}" starts locked and nothing`
                + " unlocks it, so no player can ever reach it.");
        }
    }
    for (const key of unlocked) {
        if (!declared.has(key)) {
            const [owner, name, kind] = key.split("|");
            error(`something unlocks ${kind.replace(/s$/, "")} "${name}" on "${owner}",`
                + " which is not declared there.");
        }
    }
    console.log(`[check] content reachability: ${declared.size} declared,`
        + ` ${[...declared.values()].filter(Boolean).length} locked, ${unlocked.size} unlocks`);
}

/**
 * Every item id named by a requirement has to be a real template.
 *
 * `items_by_id` is how actions charge the player in goods, and a typo there is
 * silent in the worst way: process_conditions looks for an id nothing has, finds
 * nothing, and the action can never be begun. The player sees a delivery they can
 * never satisfy while holding a full inventory of the thing.
 *
 * Generated templates count, so this asks the generator rather than only grepping.
 */
async function check_required_items() {
    const source_items = fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8");
    const known = new Set([...strip_comments(source_items)
        .matchAll(/item_templates\["([^"]+)"\]\s*=\s*new /g)].map(match => match[1]));

    const { generated, problem } = await load_generated_item_templates(repo_root);
    if (problem) {
        error(`${problem} - this check is out of date.`);
    }
    for (const key of Object.keys(generated ?? {})) { known.add(key); }

    let checked = 0;
    for (const file of ["src/locations.js", "src/dialogues.js"]) {
        const full_path = path.join(repo_root, file);
        if (!fs.existsSync(full_path)) {
            error(`${file} is missing - this check is out of date.`);
            continue;
        }
        const source = strip_comments(fs.readFileSync(full_path, "utf8"));

        for (const block of source.matchAll(/items_by_id:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g)) {
            for (const entry of block[1].matchAll(/"([^"]+)"\s*:/g)) {
                checked++;
                if (!known.has(entry[1])) {
                    error(`${file} requires item "${entry[1]}", which is not a template.`
                        + " The requirement can never be satisfied, so the action can never begin.");
                }
            }
        }
    }
    console.log(`[check] required items: ${checked} checked`);
}

check_site();
check_interpolated_pairs();
check_reward_keys();
check_location_types();
check_content_is_reachable();
check_money_requirements();
check_changelogs_cover_version();
check_language_switch_repaints();
await check_locales();
await check_dialogue_display_names();
await check_trader_display_names();
await check_item_display_names();
await check_equipment_slot_names();
await check_no_english_in_dom();
await check_registry_value_names();
await check_skill_category_names();
await check_enumerable_id_families();
await check_trader_market_regions();
await check_global_flags();
await check_no_placeholder_text();
await check_translations_have_no_english();
await check_no_unused_locale_rows();
await check_creation_panel_values();
check_item_name_collisions();
await check_recipe_item_names();
await check_modules_import_what_they_call();
check_action_branches();
await check_required_items();
await check_content_text_ids();
await check_generated_items();

for (const message of warnings) {
    console.warn(`[check] WARN  ${message}`);
}
for (const message of errors) {
    console.error(`[check] ERROR ${message}`);
}

if (errors.length > 0) {
    console.error(`[check] failed with ${errors.length} error(s).`);
    process.exit(1);
}
console.log(`[check] passed${warnings.length > 0 ? ` with ${warnings.length} warning(s)` : ""}.`);
