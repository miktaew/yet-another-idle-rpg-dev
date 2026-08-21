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
 *                                             so CI stays green while a
 *                                             translation is still in progress.
 *     Set LOCALE_STRICT=1 to promote missing keys to an error once a
 *     translation is meant to be complete.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { get_game_version } from "../src/game_version.js";

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
        "changelog.html",
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
async function check_content_text_ids() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const scanned = [
        { file: "src/quests.js", patterns: [
            /(?<![A-Za-z0-9_])quest_name:\s*"([^"]+)"/g,
            /(?<![A-Za-z0-9_])quest_description:\s*"([^"]+)"/g,
            /(?<![A-Za-z0-9_])task_description:\s*"([^"]+)"/g,
        ]},
        { file: "src/skills.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
        ]},
        { file: "src/locations.js", patterns: [
            /(?<![A-Za-z0-9_])messages:\s*\[\s*"([^"]+)"\s*\]/g,
        ]},
        { file: "src/items.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"(desc [^"]+)"/g,
        ]},
        { file: "src/enemies.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
        ]},
        { file: "src/combat_stances.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
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

check_site();
await check_locales();
await check_content_text_ids();

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
