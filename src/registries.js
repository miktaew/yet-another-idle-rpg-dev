"use strict";
// @ts-check

/**
 * Registries a low-level module needs to read at call time, without importing the module
 * that owns them.
 *
 * conditions.js has to look up locations and quests for the `location_clears` and
 * `quests_completed` gates. Importing those modules directly adds
 * `conditions -> locations -> actions -> conditions` to a graph that is already circular
 * by design, and that one extra edge was enough to change esbuild's evaluation order and
 * construct a class before its own definition had run: the bundle threw
 * "ee is not a constructor" on load, while the build and all 31 checks passed.
 *
 * This module imports nothing, so reading through it adds no edge at all. Owners fill it
 * at their own module scope; readers see it populated long before any gameplay code runs,
 * because every read happens inside a function rather than at evaluation time.
 */
export const registries = {
    locations: {},
    quests: {},
};
