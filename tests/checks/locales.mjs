/** The locale files: coverage, duplicates, placeholders, and untranslated rows. */

import * as fs from "node:fs";
import * as path from "node:path";
import { base_key, load_locale } from "../lib/locale-files.mjs";
import { default_language, locales_dir, repo_root, strict_locales, variant_prefix } from "../lib/context.mjs";
import { error, warn } from "../lib/report.mjs";
import { source_files, strip_comments } from "../lib/source.mjs";

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
        { file: "src/data/locations.js", patterns: [
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
    for (const relative of source_files(repo_root)) {
        source += strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));
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

export {
    check_duplicate_keys,
    check_interpolated_pairs,
    check_locales,
    check_locales_are_bundled,
    check_no_placeholder_text,
    check_no_unused_locale_rows,
    check_translations_have_no_english,
};
