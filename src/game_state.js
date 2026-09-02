"use strict";
// @ts-check

/**
 * The state a save writes back into, held in an object rather than as loose bindings.
 *
 * An imported binding is read-only, so anything a module other than main.js has to
 * ASSIGN to cannot be imported - it has to be reached through an object. That one fact is
 * what keeps save and load, 1821 lines of it, inside main.js.
 *
 * Only what has no other way to be set lives here. `language` is written by the loader
 * too and is deliberately NOT here: 925 references across 19 files, exactly one of them
 * that write. The two stance fields stay out for the same reason - change_stance already
 * writes them, so the loader can call it.
 *
 * This module imports nothing, so it adds no edge to a cycle that resolves by evaluation
 * order.
 */
const game_state = {
    last_location_with_bed: null,
    last_combat_location: null,
    last_rewarded_export: 0,
    rain_counter: 0,
    save_counter: 0,
    gathered_materials: {},
    lore_last: null,
    is_loading_error: false,
};

export { game_state };
