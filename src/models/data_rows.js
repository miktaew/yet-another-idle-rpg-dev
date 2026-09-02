// @ts-check
"use strict";

/**
 * The shapes of the JSON data files (P-42 step 2).
 *
 * **These typedefs are checked, not documentation.** TypeScript types a JSON import from the
 * file's actual contents, so asserting an imported file against a typedef validates every
 * row in it at `npm run check:types` - naming the offending key and field. A row with
 * `"value": "four"` in it fails here rather than becoming `NaN` somewhere in a shop.
 *
 * That is worth more than the runtime validator this replaces, and it is why the model was
 * the step after the move rather than before it: until the data was data, there was nothing
 * to point a shape at. Before this, each family's shape was asserted in three places that
 * had no way of agreeing - the loader that spread the row into a constructor, the test
 * helper that read the same rows back, and the guard that checked a couple of fields by
 * hand.
 *
 * No runtime code lives here on purpose: it is types and nothing else, so nothing imports it
 * for behaviour and deleting it changes only what is checked.
 */

/**
 * One material, as `src/data/materials.json` writes it.
 *
 * `name` is present only when the shown name differs from the registry key - four of the 111
 * - because `setup_ids()` fills the name from the key otherwise. `description` is absent
 * entirely: all 112 were `desc item <key>`, so the loader derives it and a description that
 * disagrees with its key cannot be written.
 *
 * @typedef {Object} MaterialRow
 * @property {Number} value what a trader pays before margins
 * @property {String} [name] only when it differs from the key
 * @property {String} [material_type] the group a recipe can ask for by type
 * @property {Number} [base_size] how much of a stack one unit takes
 * @property {Boolean} [use_quality] whether a quality is rolled onto it
 */

/**
 * One material a recipe consumes, or produces.
 *
 * The same shape appears inside `materials: [...]` and as `result: {...}`, which is why the
 * test helper walks rows rather than matching field names in text: `result_id` can sit
 * beside a `material_id` in the same object, meaning "spend this, get that".
 *
 * @typedef {Object} RecipeMaterial
 * @property {String} [material_id] a specific item
 * @property {String} [material_type] any item of a group, when the recipe does not care
 * @property {Number} [count] how many, defaulting to one
 * @property {String} [result_id] what this particular input produces
 * @property {Number} [result_count] how many of it
 */

/**
 * One recipe, as `src/data/recipes.json` writes it.
 *
 * `type` is carried per row rather than inferred from the subcategory, because the
 * subcategory does not determine it: `equipment` holds EquipmentRecipe, ComponentRecipe and
 * ComponentlessEquipRecipe. `name` is absent: all 148 equalled their key.
 *
 * @typedef {Object} RecipeRow
 * @property {String} type which recipe constructor builds it
 * @property {Array<RecipeMaterial>} [materials] what it consumes
 * @property {RecipeMaterial} [result] what it produces, when there is one result
 * @property {String} [recipe_skill] the skill it trains and reads
 * @property {String} [recipe_type] what kind of thing comes out
 * @property {String} [item_type] for the recipes that name one
 * @property {String} [component_type] for component recipes
 * @property {String} [material_type] for recipes that take a group
 * @property {Array<Number>} [success_chance] [low, high], interpolated by level
 * @property {Array<Number>} [recipe_level] [low, high] of the skill range
 * @property {Boolean} [is_unlocked] whether it starts available
 * @property {Array<Object>} [components] for equipment assembled from parts
 * @property {Boolean} [scale_results] whether the result count follows the input
 * @property {Number} [success_rate] a flat chance, where a range makes no sense
 */

/**
 * The recipe file: category, then subcategory, then key.
 *
 * @typedef {Record<String, Record<String, Record<String, RecipeRow>>>} RecipeFile
 */

/**
 * The material file: key to row.
 *
 * @typedef {Record<String, MaterialRow>} MaterialFile
 */

export {};
