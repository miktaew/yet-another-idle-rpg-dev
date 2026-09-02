"use strict";
// @ts-check

/**
 * Counters for the current run: what has been killed, crafted, survived and hit hardest.
 *
 * An object rather than ten exported `let`s, and the difference is the whole point: an
 * imported binding is read-only, so a module that is not main.js cannot write
 * `total_crafting_attempts += n`. Reaching through an object it can, which is what lets
 * the crafting code live outside main.js at all.
 *
 * This module imports nothing. The cycle around main.js is load-bearing - one extra edge
 * once reordered evaluation enough to construct a class before its own definition ran -
 * so a leaf is the only safe shape for something everything may want to read.
 *
 * The keys are save data: create_save writes each one under its own name.
 */
const run_stats = {
    total_playtime: 0,
    total_deaths: 0,
    total_crafting_attempts: 0,
    total_crafting_successes: 0,
    total_kills: 0,
    total_crits_done: 0,
    total_crits_taken: 0,
    total_hits_done: 0,
    total_hits_taken: 0,
    strongest_hit: 0,
};

export { run_stats };
