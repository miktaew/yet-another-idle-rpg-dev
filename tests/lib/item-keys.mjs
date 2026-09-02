"use strict";

/**
 * Which item template keys the code declares, wherever it declares them.
 *
 * There are two places now (P-42 step 2). `src/items.js` still holds the declarations that
 * cannot be data - anything carrying a function - and `src/data/*.json` holds the families
 * that are pure literals. The materials moved first: 111 of the 112, the exception being
 * `Rough wood log`, whose `getName` calls `is_rat()`.
 *
 * This exists because five separate places used to grep items.js for
 * `item_templates["X"] = new ` and each would have gone quietly wrong the moment a family
 * left the file - not by failing, but by reporting that real items were not templates. That
 * is exactly what happened on the first attempt at the move: 171 check errors and 76 from
 * `check:save`, every one of them naming a material that was working perfectly.
 *
 * So: one place, used by all of them, and moving the next family costs a filename here
 * rather than five greps updated in step.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { strip_comments } from "./source.mjs";

/**
 * The JSON data files that hold item templates, and what each row means.
 *
 * `name` is only present in a row when it differs from the key - the key is the registry id
 * and the save identity, the name is what a player reads - so a reader wanting the shown
 * name has to fall back to the key exactly as `setup_ids()` does at runtime.
 */
const item_data_files = ["src/data/materials.json"];

/**
 * Every key declared in `src/items.js` itself.
 *
 * Comments stripped first, and that is load-bearing rather than tidy: **118 declarations in
 * that file sit inside block comments**, superseded by the components
 * `crafting_component_filling.js` generates at runtime. Reading them as real cost 111 check
 * errors on the first attempt at this helper, each demanding a display-name row for a
 * clothing item that no longer exists.
 */
function keys_declared_in_source(repo_root) {
    const source = strip_comments(
        fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8"));
    return [...source.matchAll(/item_templates\["([^"]+)"\]\s*=\s*new /g)]
        .map(found => found[1]);
}

/** Every key declared in the JSON data files, with the row it came from. */
function rows_declared_in_data(repo_root) {
    const rows = new Map();
    for (const file of item_data_files) {
        const full = path.join(repo_root, file);
        if (!fs.existsSync(full)) {
            throw new Error(`${file} is listed as an item data file and does not exist.`);
        }
        const parsed = JSON.parse(fs.readFileSync(full, "utf8"));
        for (const [key, row] of Object.entries(parsed)) {
            rows.set(key, {...row, from: file});
        }
    }
    return rows;
}

/**
 * Every item template key the code declares, from both places.
 *
 * @param {String} repo_root
 * @returns {Set<String>}
 */
function declared_item_keys(repo_root) {
    return new Set([
        ...keys_declared_in_source(repo_root),
        ...rows_declared_in_data(repo_root).keys(),
    ]);
}

/**
 * The shown name for every key declared in data, resolved the way runtime resolves it.
 *
 * @param {String} repo_root
 * @returns {Map<String, String>} key to shown name
 */
function data_item_names(repo_root) {
    const names = new Map();
    for (const [key, row] of rows_declared_in_data(repo_root)) {
        names.set(key, row.name ?? key);
    }
    return names;
}

export { declared_item_keys, data_item_names, rows_declared_in_data, item_data_files };
