"use strict";

/**
 * Audits an exported savegame against the current registries.
 *
 * Registry keys are save data - item ids, location keys, dialogue and textline
 * keys, skill ids, recipe ids, activity names, flag names - and renaming any of
 * them silently breaks every existing save. That rule is written down in
 * docs/AGENTS.md section 5, but nothing checked it against an actual save until
 * this script. `npm run check` can only verify the code against itself; this
 * verifies the code against a real player's file.
 *
 * Usage:
 *     node tests/save.mjs "<exported save>.txt"
 *
 * The export is base64-encoded JSON. It is NOT committed - it is real character
 * data - and .gitignore holds a pattern for the export's default filename.
 *
 * Registries are read from the SOURCE TEXT rather than imported: every content
 * module reaches src/display.js, which needs a document, so none of them load
 * outside a browser. The pattern being matched is the one documented in
 * docs/AGENTS.md section 4 - a `const X = {}` at the top of the file, filled by
 * `X["key"] = new Something({...})` - so a module that stops following it makes
 * this check report zero declarations rather than silently pass.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { load_generated_item_templates } from "./lib/generated-items.mjs";

const repo_root = path.resolve(import.meta.dirname, "..");
const errors = [];
const notes = [];
function error(message) { errors.push(message); }
const save_path = process.argv[2];
if (!save_path) {
    console.error("[check-save] usage: node tests/save.mjs \"<exported save>.txt\"");
    process.exit(2);
}
if (!fs.existsSync(save_path)) {
    console.error(`[check-save] no such file: ${save_path}`);
    process.exit(2);
}

let save;
try {
    const raw = fs.readFileSync(save_path, "utf8").trim();
    save = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
} catch (problem) {
    console.error(`[check-save] could not decode the save: ${problem.message}`);
    console.error("[check-save] exports are base64-encoded JSON; a hand-edited file may have lost its encoding.");
    process.exit(2);
}

/** Keys declared in a module, read from its source text. */
function declared(file, pattern) {
    const full_path = path.join(repo_root, file);
    if (!fs.existsSync(full_path)) {
        error(`${file} is missing - this check is out of date.`);
        return new Set();
    }
    const found = new Set(
        [...fs.readFileSync(full_path, "utf8").matchAll(pattern)].map(match => match[1]));
    if (found.size === 0) {
        error(`${file} declares nothing matching the expected registry pattern - this check is out of date.`);
    }
    return found;
}

const registries = {
    locations: declared("src/data/locations.js", /locations\["([^"]+)"\]\s*=\s*new /g),
    dialogues: declared("src/data/dialogues.js", /dialogues\["([^"]+)"\]\s*=\s*new /g),
    skills: declared("src/data/skills.js", /skills\["([^"]+)"\]\s*=\s*new /g),
    activities: declared("src/activities.js", /activities\["([^"]+)"\]\s*=\s*new /g),
    traders: declared("src/traders.js", /traders\["([^"]+)"\]\s*=\s*new /g),
    quests: declared("src/quests.js", /quests\["([^"]+)"\]\s*=\s*new /g),
    books: declared("src/items.js", /book_stats\["([^"]+)"\]\s*=\s*new /g),
    // Recipes are grouped per skill and then per kind, and the same recipe name
    // legitimately appears under several skills, so this is a set of NAMES.
    recipes: declared("src/crafting_recipes.js", /\.(?:items|components|equipment)\["([^"]+)"\]\s*=\s*new /g),
};

/** Recipe names in the save, which are nested skill -> kind -> name. */
function saved_recipe_names() {
    const names = [];
    for (const kinds of Object.values(save.recipes ?? {})) {
        for (const entries of Object.values(kinds ?? {})) {
            if (entries && typeof entries === "object") {
                names.push(...Object.keys(entries));
            }
        }
    }
    return names;
}

const groups = [
    ["locations", Object.keys(save.locations ?? {})],
    ["dialogues", Object.keys(save.dialogues ?? {})],
    ["skills", Object.keys(save.skills ?? {})],
    ["activities", Object.keys(save.activities ?? {})],
    ["traders", Object.keys(save.traders ?? {})],
    ["quests", Object.keys(save.quests ?? {})],
    ["books", Object.keys(save.books ?? {})],
    ["recipes", saved_recipe_names()],
];

console.log(`[check-save] ${path.basename(save_path)}`);
console.log(`[check-save] game version ${save["game version"]}, language ${save.language}`);

for (const [name, saved_keys] of groups) {
    const known = registries[name];
    const missing = [...new Set(saved_keys.filter(key => !known.has(key)))];
    console.log(`[check-save]   ${name.padEnd(11)} save ${String(saved_keys.length).padStart(4)}`
        + `   code ${String(known.size).padStart(4)}`
        + `   ${missing.length === 0 ? "all resolve" : `${missing.length} MISSING`}`);
    for (const key of missing) {
        error(`the save holds ${name.replace(/s$/, "")} "${key}", which no longer exists in the code.`
            + " A registry key was renamed or removed; existing saves are broken.");
    }
}

/**
 * Item ids.
 *
 * The inventory is keyed by a JSON string rather than a plain id, because a stack
 * is identified by its id AND its quality - and for equipment built from parts,
 * by its components instead of an id at all. Those composite keys have no
 * template of their own: the item is assembled from its components, each of which
 * is itself a template. So the ids worth checking are the plain ones plus every
 * component named inside a composite.
 */
function collect_item_ids() {
    const ids = new Set();

    const add_from_key = key => {
        let parsed;
        try { parsed = JSON.parse(key); } catch { ids.add(key); return; }
        if (parsed?.id) { ids.add(parsed.id); }
        for (const component of Object.values(parsed?.components ?? {})) {
            if (typeof component === "string") { ids.add(component); }
        }
    };

    Object.keys(save.character?.inventory ?? {}).forEach(add_from_key);
    for (const stack of Object.values(save.player_storage ?? {})) {
        if (stack && typeof stack === "object") { Object.keys(stack).forEach(add_from_key); }
    }
    for (const slot of Object.values(save.character?.equipment ?? {})) {
        if (slot?.id) { ids.add(slot.id); }
        for (const component of Object.values(slot?.components ?? {})) {
            if (typeof component === "string") { ids.add(component); }
        }
    }
    return ids;
}

const item_ids = collect_item_ids();
const hand_written = declared("src/items.js", /item_templates\["([^"]+)"\]\s*=\s*new /g);

/**
 * The generated templates.
 *
 * Asked of the generator rather than guessed at. A first attempt matched ids
 * against material and component names pulled out of the locale, which looked
 * plausible and was wrong: the parts are stored lowercase and the assembled key is
 * capitalised, so every generated item came back unresolved. Running the real
 * generator has no such gap.
 */
const { generated, problem: generator_problem } = await load_generated_item_templates(repo_root);
if (generator_problem) {
    error(`${generator_problem} - this check is out of date.`);
}
const generated_keys = new Set(Object.keys(generated ?? {}));

/**
 * Assembled equipment names are a third category, and not a template at all.
 *
 * A worn piece built from components carries a name assembled from them -
 * "Steel chainmail armored pants" - which the save stores as the item's id even
 * though nothing declares it. The components inside it ARE templates and are
 * collected separately above, so the assembled name only has to be recognised as
 * one the generator can still produce. `npm run check` is what verifies those
 * names still assemble to the same string.
 */
for (const item of Object.values(generated ?? {})) {
    if (item.full_armor_name) { generated_keys.add(item.full_armor_name); }
    if (item.shield_name) { generated_keys.add(item.shield_name); }
}

const unresolved = [...item_ids]
    .filter(id => !hand_written.has(id) && !generated_keys.has(id));
console.log(`[check-save]   items       save ${String(item_ids.size).padStart(4)}`
    + `   code ${String(hand_written.size + generated_keys.size).padStart(4)}`
    + `   ${unresolved.length === 0 ? "all resolve or are generated" : `${unresolved.length} UNRESOLVED`}`);
for (const id of unresolved) {
    error(`the save holds item "${id}", which is neither a hand-written template nor`
        + " shaped like a generated one. Either a template was renamed, or this check's"
        + " idea of a generated name is out of date.");
}

for (const note of notes) {
    console.log(`[check-save] NOTE  ${note}`);
}
for (const message of errors) {
    console.error(`[check-save] ERROR ${message}`);
}
if (errors.length > 0) {
    console.error(`[check-save] failed with ${errors.length} error(s).`);
    process.exit(1);
}
console.log("[check-save] passed - every key in this save still resolves.");
