"use strict";

/**
 * Every recipe the code declares, wherever it declares it.
 *
 * The companion to `item-keys.mjs`, and it exists for the same reason: the recipes moved out
 * of `src/crafting_recipes.js` into `src/data/recipes.json` (P-42 step 2), and six separate
 * places derived what they needed by reading that file as text - keys, `result_id`s,
 * `material_id`s, `material_type`s and `success_chance` pairs.
 *
 * Moving the declarations produced **255 check errors**, and the shape of them is the point:
 * they were not "this is broken", they were *"nothing can give the player this trophy"* -
 * the reachability check had lost sight of every recipe at once and was reporting perfectly
 * craftable items as unreachable. A derivation that reads the wrong place does not fail, it
 * lies.
 *
 * So the rows are read once, here, and the checks ask for fields rather than for text.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { strip_comments, braced_body } from "./source.mjs";

/** The JSON data files that hold recipes. */
const recipe_data_files = ["src/data/recipes.json"];

/** Recipes still declared in source, if any are left. */
function rows_from_source(repo_root) {
    const source = strip_comments(
        fs.readFileSync(path.join(repo_root, "src/crafting_recipes.js"), "utf8"));
    const declaration =
        /(\w+)_recipes\.(\w+)\[\s*"([^"]+)"\s*\]\s*=\s*new\s+(\w+)\(\s*\{/g;

    const rows = [];
    for (const found of source.matchAll(declaration)) {
        const [, category, subcategory, key, type] = found;
        const open = source.indexOf("{", found.index + found[0].length - 1);
        const body = braced_body(source, open);
        let fields = {};
        try {
            //Only literals survive in this file; anything else belongs in the JSON's
            //exception list and would throw here rather than pass silently.
            fields = new Function(`return ({${body}})`)();
        } catch (bad) {
            throw new Error(`${category}.${subcategory}.${key} in crafting_recipes.js `
                + `cannot be read as data: ${bad.message}`);
        }
        rows.push({category, subcategory, key, type, from: "src/crafting_recipes.js",
            ...fields});
    }
    return rows;
}

/** Recipes declared in the JSON data files. */
function rows_from_data(repo_root) {
    const rows = [];
    for (const file of recipe_data_files) {
        const full = path.join(repo_root, file);
        if (!fs.existsSync(full)) {
            throw new Error(`${file} is listed as a recipe data file and does not exist.`);
        }
        const parsed = JSON.parse(fs.readFileSync(full, "utf8"));
        for (const [category, subcategories] of Object.entries(parsed)) {
            for (const [subcategory, list] of Object.entries(subcategories)) {
                for (const [key, row] of Object.entries(list)) {
                    //`name` is derived from the key at load, so it is derived here too.
                    rows.push({category, subcategory, key, name: key, from: file, ...row});
                }
            }
        }
    }
    return rows;
}

/**
 * Every recipe row, from both places.
 *
 * @param {String} repo_root
 * @returns {Array<Object>} {category, subcategory, key, type, name, from, ...fields}
 */
function recipe_rows(repo_root) {
    return [...rows_from_source(repo_root), ...rows_from_data(repo_root)];
}

/** Every value a named field takes across all recipes, flattened out of nested rows. */
function recipe_field_values(repo_root, field) {
    const values = new Set();
    const walk = (value) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }
        if (typeof value === "object") {
            for (const [name, inner] of Object.entries(value)) {
                if (name === field && typeof inner === "string") {
                    values.add(inner);
                } else {
                    walk(inner);
                }
            }
        }
    };
    for (const row of recipe_rows(repo_root)) {
        for (const [name, value] of Object.entries(row)) {
            if (name === field && typeof value === "string") {
                values.add(value);
            } else {
                walk(value);
            }
        }
    }
    return values;
}

/**
 * Every `[low, high]` pair a named field takes, for the checks that bound them.
 *
 * @param {String} repo_root
 * @param {String} field
 * @returns {Array<Object>} {key, from, low, high}
 */
function recipe_ranges(repo_root, field) {
    const found = [];
    for (const row of recipe_rows(repo_root)) {
        const value = row[field];
        if (!Array.isArray(value) || value.length !== 2) continue;
        if (typeof value[0] !== "number" || typeof value[1] !== "number") continue;
        found.push({key: row.key, from: row.from, low: value[0], high: value[1]});
    }
    return found;
}

export { recipe_rows, recipe_field_values, recipe_ranges, recipe_data_files };
