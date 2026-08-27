"use strict";

/**
 * Registries the component system writes into and reads back.
 *
 * This module imports nothing on purpose. Every class that owns an availability
 * component registers itself here, and component_management.js reads the list to graft
 * the shared methods onto their prototypes - so an import edge from any of them back to
 * a module that constructs classes would reorder module evaluation and break the bundle.
 * That is not hypothetical: it is what two direct imports in conditions.js did, and it
 * shipped a game that threw on load. See src/registries.js for the same reasoning.
 *
 * `availabilities` is keyed by category ("action", "location", ...) and then by the
 * entity's registry key, which is save data and stays English.
 */
const availabilities = {};
const availability_havers = [];

export { availabilities, availability_havers };
