// @ts-check
"use strict";

/**
 * The JSON data files, read once and typed on the way through.
 *
 * This module exists to be **checkable**. `items.js` and `crafting_recipes.js` are not
 * type-checked yet - they carry 12 and rather more errors respectively - so a typedef
 * asserted inside them would sit there unverified. Here it is verified: this file is small,
 * it is `@ts-check` clean, and the two `@type` annotations below are what make TypeScript
 * compare **every row of both data files** against `src/models/data_rows.js` on every
 * `npm run check:types`.
 *
 * So a malformed row is a type error naming the key and the field, rather than a `NaN` that
 * surfaces in a shop three screens away. That is the whole return on the model, and it only
 * works because the data is data: there was nothing to point a shape at before the move.
 *
 * The import attribute is required rather than decorative - esbuild accepts a bare JSON
 * import and Node refuses it, and the checks load these files through Node.
 */

import materials from "./materials.json" with { type: "json" };
import recipes from "./recipes.json" with { type: "json" };

/**
 * @typedef {import("../models/data_rows.js").MaterialFile} MaterialFile
 * @typedef {import("../models/data_rows.js").RecipeFile} RecipeFile
 */

/** Every material, keyed by registry key. @type {MaterialFile} */
const material_rows = materials;

/** Every recipe, by category then subcategory then key. @type {RecipeFile} */
const recipe_rows = recipes;

export { material_rows, recipe_rows };
