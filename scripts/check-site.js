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

check_site();
await check_locales();

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
