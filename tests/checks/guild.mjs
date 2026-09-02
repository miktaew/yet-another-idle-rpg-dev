/** The guild's board, and whether every rank can be given work. */

import { repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { load_browser_free } from "../lib/browser-free-src.mjs";

/**
 * Every guild rank can be offered a job, and every job names something real.
 *
 * The generator derives its targets from the game's own data rather than a table - enemy
 * `rank` for how hard a hunt is, material `value` for goods, the guild ladder for the pay -
 * and that is the right way round, but it means the pools move when the content moves. A rank
 * whose window ends up empty offers **nothing**, and the only symptom is a board with a gap in
 * it that reads like a board the player has not unlocked.
 *
 * Two pools were wrong on the first attempt and the measurement caught both before anything
 * shipped: hunts were offering `living` and `beast`, which are on all eleven enemy ranks and
 * so name no particular work, and gathers were offering *Black iron chainmail*, which is a
 * MATERIAL by type and a piece of armour by nature. This is the net under both.
 */
async function check_every_guild_rank_can_be_given_work() {
    const [jobs_module, reputation_module, enemies_module, items_module] =
        await load_browser_free(repo_root, ["src/guild_jobs.js", "src/reputation.js",
            "src/enemies.js", "src/items.js"]);

    const {guild_ranks} = reputation_module;
    const {generate_guild_job, standing_paid_for} = jobs_module;

    if (!Array.isArray(guild_ranks) || typeof generate_guild_job !== "function") {
        error("the guild job generator is not where this expects it - "
            + "check_every_guild_rank_can_be_given_work is out of date.");
        return;
    }

    /*
        Every tag any enemy carries, and how many of the game's enemy ranks each spans -
        worked out here rather than asked of the generator. Importing its own
        `too_broad_to_be_a_brief` was the first version of this and could not fail: loosening
        the limit in the module loosened the check along with it, and the two agreed all the
        way to a board offering "hunt sixteen living things" again.
    */
    const real_tags = new Set();
    const ranks_of = new Map();
    const all_ranks = new Set();
    for (const enemy of Object.values(enemies_module.enemy_templates)) {
        all_ranks.add(enemy.rank);
        for (const tag of Object.keys(enemy.tags || {})) {
            real_tags.add(tag);
            if (!ranks_of.has(tag)) ranks_of.set(tag, new Set());
            ranks_of.get(tag).add(enemy.rank);
        }
    }
    //Two thirds of the ranks and it names no particular work. Measured: living and beast are
    //on all eleven, medium on eight.
    const broad = new Set([...ranks_of]
        .filter(([, ranks]) => ranks.size >= all_ranks.size * (2 / 3))
        .map(([tag]) => tag));

    /*
        A fixed sequence rather than Math.random: a check that rolls dice reports a different
        thing on different runs, and a flaky check is one people learn to re-run instead of
        read. Enough draws per rank to see every branch of the generator.
    */
    let seed = 7;
    const random = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
    };

    const {hunt_targets_for, gather_targets_for} = jobs_module;

    let drawn = 0;
    for (const [index, entry] of guild_ranks.entries()) {
        /*
            Both pools, separately. Requiring only that SOME job comes out let one of the two
            go empty unnoticed - hunts filled the board while the gather pool was returning
            nothing at all, which is half the feature missing and no error anywhere.
        */
        if (hunt_targets_for(index).length === 0) {
            error(`the guild has nothing for a rank ${entry.rank} player to hunt: no enemy tag `
                + `in that rank's window is carried by more than one enemy without being spread `
                + `across most of the game.`);
        }
        if (gather_targets_for(index).length === 0) {
            error(`the guild has nothing for a rank ${entry.rank} player to gather: no material `
                + `any gathering activity yields falls in that rank's value window, and the `
                + `nearest-by-value fallback found none either.`);
        }

        for (let attempt = 0; attempt < 40; attempt++) {
            const job = generate_guild_job({rank: entry.rank, random});
            if (!job) {
                error(`the guild can offer rank ${entry.rank} no job at all. Its hunt and `
                    + `gather pools are both empty, so a board built for a player at that rank `
                    + `has a hole in it that reads like content they have not unlocked.`);
                break;
            }
            drawn++;

            if (job.type === "hunt") {
                if (!real_tags.has(job.target)) {
                    error(`a rank ${entry.rank} hunt names the tag "${job.target}", which no `
                        + `enemy carries. The kill would never be counted.`);
                } else if (broad.has(job.target)) {
                    error(`a rank ${entry.rank} hunt names the tag "${job.target}", which is `
                        + `spread across most of the game's enemy ranks. It tells the player `
                        + `nothing about where to go.`);
                }
            } else if (job.type === "gather") {
                if (!items_module.item_templates[job.target]) {
                    error(`a rank ${entry.rank} gather names "${job.target}", which is not an `
                        + `item. Nobody could ever hand it in.`);
                }
            } else {
                error(`a rank ${entry.rank} job has type "${job.type}", which nothing handles.`);
            }

            if (!(job.count >= 1)) {
                error(`a rank ${entry.rank} job asks for ${job.count} of "${job.target}".`);
            }
            if (!(standing_paid_for(job, 0) > 0)) {
                error(`a rank ${entry.rank} job pays ${standing_paid_for(job, 0)} standing to `
                    + `somebody with none, so doing it would not promote anybody.`);
            }
        }
    }

    //And the ceiling Q-14 requires: past the top of the ladder the board stops paying.
    const top = guild_ranks[guild_ranks.length - 1].at_least;
    const job = generate_guild_job({rank: guild_ranks[guild_ranks.length - 1].rank, random});
    if (job && standing_paid_for(job, top) !== 0) {
        error(`at the top of the ladder (${top} standing) a job still pays `
            + `${standing_paid_for(job, top)}. Guild standing would be unbounded, and an `
            + `unbounded region is one check_a_standing_gate_can_be_reached cannot speak about.`);
    }

    console.log(`[check] guild jobs: ${guild_ranks.length} rank(s), ${drawn} job(s) drawn, `
        + `each naming something real and paying into the ladder`);
}

/**
 * The board refreshes, and what has been taken off it does not go with the day.
 *
 * This is the half of Q-14 that is a rule rather than a number: *"it can refresh per game
 * day, but a job that has been taken must not disappear."* A board is generated from scratch
 * every time the day turns, so the accepted job is carried across by hand - and the failure
 * is the quietest kind there is. The player takes a brutal SS job, leaves the game running
 * overnight, comes back and it is simply not there. Nothing throws, nothing logs, and the
 * only evidence is a player saying they are sure they had a job.
 *
 * Four things, in one pass because they are one mechanism: the same day gives the same board
 * back, a new day replaces the offer, an accepted job survives that, and a second job cannot
 * be taken while one is held.
 */
async function check_the_board_keeps_what_was_taken_off_it() {
    const [jobs_module] = await load_browser_free(repo_root, ["src/guild_jobs.js"]);
    const {refreshed_board, accept_from_board} = jobs_module;

    if (typeof refreshed_board !== "function" || typeof accept_from_board !== "function") {
        error("the board's rules are not where this expects them - "
            + "check_the_board_keeps_what_was_taken_off_it is out of date.");
        return;
    }

    //Walks 0, 0.5, 0, 0.5 … so two boards rolled from it differ without being random.
    let step = 0;
    const random = () => (step++ % 2) * 0.5;

    const first = refreshed_board({board: null, day: 10, standing: 600, random});
    if (!first.offered.length) {
        error("a board rolled for a player at 600 standing offers nothing at all, so "
            + "nothing below this can be tested.");
        return;
    }

    //The same day hands the same board back, or the offer would reroll every tick.
    const again = refreshed_board({board: first, day: 10, standing: 600, random});
    if (again !== first) {
        error("the board is rebuilt on a tick within the same day, so its offer would "
            + "change continuously and no job could be read before it was gone.");
    }

    const held = accept_from_board({board: first, index: 0});
    if (held === first || !held.accepted) {
        error("a job on the board cannot be taken off it.");
        return;
    }
    if (held.offered.length !== first.offered.length - 1) {
        error("taking a job leaves it on the board, so it could be taken twice.");
    }

    const twice = accept_from_board({board: held, index: 0});
    if (twice !== held) {
        error("a second job can be taken while one is already held, which is not what the "
            + "panel tells the player and not the save shape the board has.");
    }

    const tomorrow = refreshed_board({board: held, day: 11, standing: 600, random});
    if (tomorrow.accepted !== held.accepted) {
        error("the accepted job does not survive the day turning. Q-14: the board may "
            + "refresh per game day, but a job that has been taken must not disappear.");
    }
    if (tomorrow === held) {
        error("the day turned and the board handed back the same object, so the offer "
            + "never refreshes.");
    }

    console.log(`[check] guild board: ${first.offered.length} job(s) offered, refreshing by `
        + `the day and keeping what was taken`);
}

/**
 * A board read back from a save names only things that still exist.
 *
 * A job holds an enemy TAG or a material name, and both are registry keys. A save written
 * before a tag stopped being carried by more than one enemy, or before a material was
 * renamed, comes back holding a brief nobody can fill: it cannot be completed, so it cannot
 * be handed in, so it sits in the save for the rest of that playthrough and the player's one
 * job slot is gone for good.
 *
 * Which makes this the load-bearing half of the save shape. The rest of a broken board
 * recovers by itself - `day: null` rolls a fresh offer on the next tick - but a stuck
 * accepted job has no recovery at all, which is why it is dropped here rather than repaired
 * later.
 */
async function check_a_restored_board_drops_jobs_that_name_nothing() {
    const [jobs_module, reputation_module] =
        await load_browser_free(repo_root, ["src/guild_jobs.js", "src/reputation.js"]);
    const {restored_board, generate_guild_job, job_target_resolves} = jobs_module;
    const {guild_ranks} = reputation_module;

    if (typeof restored_board !== "function") {
        error("restored_board is not where this expects it - "
            + "check_a_restored_board_drops_jobs_that_name_nothing is out of date.");
        return;
    }

    //A real job, taken from the generator rather than written here, so the shape stays true.
    let real = null;
    for (const entry of guild_ranks) {
        real = generate_guild_job({rank: entry.rank, random: () => 0.5});
        if (real && job_target_resolves(real)) break;
        real = null;
    }
    if (real === null) {
        error("the generator produced no job whose target resolves, so this check cannot "
            + "tell a kept job from a dropped one.");
        return;
    }

    const gone = {...real, target: "a thing no registry has ever held"};

    const restored = restored_board({day: 4, offered: [real, gone], accepted: gone});
    if (restored.offered.length !== 1 || restored.offered[0] !== real) {
        error(`a board restored from a save kept ${restored.offered.length} of two offered `
            + `jobs, one of which names nothing. A job nobody can fill sits on the board.`);
    }
    if (restored.accepted !== null) {
        error("an accepted job naming something that no longer exists survives the load. It "
            + "cannot be completed or handed in, so the player's one job slot is gone for "
            + "the rest of that save.");
    }
    if (restored.day !== 4) {
        error("a restored board loses the day it was rolled for, so it rerolls immediately "
            + "and the player sees a different offer than the one they left.");
    }

    //And the other direction: nonsense in the save must not throw, and must recover.
    for (const nonsense of [undefined, null, {}, {offered: "not a list"}, {day: "Tuesday"}]) {
        let recovered;
        try {
            recovered = restored_board(nonsense);
        } catch (thrown) {
            error(`restored_board threw on ${JSON.stringify(nonsense) ?? "undefined"}, so a `
                + `save with an unexpected board in it would fail to load rather than `
                + `starting the player with an empty one.`);
            continue;
        }
        if (!Array.isArray(recovered.offered) || recovered.accepted !== null) {
            error(`restored_board turned ${JSON.stringify(nonsense) ?? "undefined"} into `
                + `something the board cannot use.`);
        }
    }

    console.log("[check] guild board save: jobs naming nothing are dropped, and nonsense "
        + "recovers to an empty board");
}

export { check_every_guild_rank_can_be_given_work,
    check_the_board_keeps_what_was_taken_off_it,
    check_a_restored_board_drops_jobs_that_name_nothing };
