/** The generated item templates, and the recipes that name them. */

import * as fs from "node:fs";
import * as path from "node:path";
import { default_language, repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { load_generated_item_templates } from "../lib/generated-items.mjs";
import { load_locale } from "../lib/locale-files.mjs";
import { strip_comments } from "../lib/source.mjs";

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

export {
    check_generated_items,
    check_recipe_item_names,
};
