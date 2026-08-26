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
check_content_is_reachable();
check_money_requirements();
check_changelogs_cover_version();
check_language_switch_repaints();
await check_locales();
await check_dialogue_display_names();
await check_trader_display_names();
await check_item_display_names();
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
