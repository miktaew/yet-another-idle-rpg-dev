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

/**
 * A gather job counts what the player holds across every stack of it.
 *
 * **The finding this exists for was a measurement, not a guess.** An inventory key is JSON
 * and carries the quality when an item has one, so a material out of a quality-rolling
 * activity is held in one stack per quality. The owner's save holds Ratfish in **seven**
 * stacks, Carp in six, Mackerel shark in six - and seven of the thirty gatherable materials
 * are quality-rolled, so roughly a quarter of gather jobs name one.
 *
 * The engine's own `items_by_id` condition asks whether ONE stack holds enough. That is
 * right for the sixteen declared places that use it, none of which names a quality-rolled
 * material, and it would have been wrong here in the least diagnosable way possible: an
 * inventory with forty fish in it and a hand-in that refuses, with nothing logged and
 * nothing failing.
 *
 * So this drives `held_of` and `job_is_done` against a split inventory, and it fails if
 * either goes back to reading one stack.
 */
async function check_a_gather_job_counts_every_stack() {
    const [jobs_module] = await load_browser_free(repo_root, ["src/guild_jobs.js"]);
    const {held_of, job_progress, job_is_done, gatherable_materials} = jobs_module;

    if (typeof held_of !== "function" || typeof job_is_done !== "function") {
        error("hand-in's rules are not where this expects them - "
            + "check_a_gather_job_counts_every_stack is out of date.");
        return;
    }

    const material = [...gatherable_materials()][0];
    if (material === undefined) {
        error("nothing is gatherable, so a gather job cannot be tested.");
        return;
    }

    //Three stacks of the same id, the way a quality-rolled material is really held.
    const split = {
        [JSON.stringify({id: material})]: {count: 4},
        [JSON.stringify({id: material, quality: 41})]: {count: 5},
        [JSON.stringify({id: material, quality: 96})]: {count: 6},
        [JSON.stringify({id: "something else entirely"})]: {count: 99},
        //A malformed key is not impossible in a hand-edited save, and must not throw.
        "not json at all": {count: 3},
    };

    if (held_of(material, split) !== 15) {
        error(`held_of counted ${held_of(material, split)} of ${material} across three `
            + `stacks holding 4, 5 and 6. A gather job would refuse a hand-in from an `
            + `inventory that has the goods in it, which is the failure with no symptom.`);
    }
    if (held_of(material, {}) !== 0 || held_of(material, undefined) !== 0) {
        error("held_of does not answer 0 for an empty or missing inventory.");
    }

    const job = {type: "gather", target: material, count: 15};
    if (job_progress(job, split) !== 15) {
        error("job_progress does not read a gather job's progress off the inventory.");
    }
    if (!job_is_done(job, split)) {
        error(`a gather job for 15 ${material} is not done with 15 held across stacks.`);
    }
    if (job_is_done({...job, count: 16}, split)) {
        error("a gather job is done one short of its count.");
    }

    console.log(`[check] gather hand-in: ${material} counted across 3 stacks`);
}

/**
 * A hunt job advances on the kills it asked for, stops at its count, and ignores the rest.
 *
 * Progress accumulates because a kill cannot un-happen, which means it is the one number
 * here that a bug can quietly inflate or strand. Four ways that goes wrong and all four are
 * silent: it counts a kill it did not ask for (the job finishes on the wrong work), it
 * counts nothing (the job can never finish), it runs past the brief (the panel shows 30 of
 * 8), and it advances a gather job (whose progress must come from the inventory, so a stored
 * count would contradict what the player is holding).
 */
async function check_a_hunt_job_counts_only_its_own_kills() {
    const [jobs_module] = await load_browser_free(repo_root, ["src/guild_jobs.js"]);
    const {job_after_kill, counts_towards_job} = jobs_module;

    if (typeof job_after_kill !== "function") {
        error("job_after_kill is not where this expects it - "
            + "check_a_hunt_job_counts_only_its_own_kills is out of date.");
        return;
    }

    const job = {type: "hunt", target: "wolf rat", count: 2, progress: 0};

    const wrong = job_after_kill(job, {"stone crab": true});
    if (wrong !== job) {
        error("a hunt job advances on a kill that does not carry its target tag.");
    }

    const once = job_after_kill(job, {"wolf rat": true, living: true});
    if (once === job || once.progress !== 1) {
        error("a hunt job does not advance on a kill carrying its target tag.");
    }

    const twice = job_after_kill(once, {"wolf rat": true});
    if (twice.progress !== 2) {
        error("a hunt job stops advancing before it reaches its count.");
    }

    const past = job_after_kill(twice, {"wolf rat": true});
    if (past !== twice) {
        error(`a finished hunt job kept counting, to ${past.progress} of ${job.count}. The `
            + `panel would show more work done than was asked for.`);
    }

    const gather = {type: "gather", target: "anything", count: 2, progress: 0};
    if (job_after_kill(gather, {anything: true}) !== gather) {
        error("a gather job accumulates kills. Its progress has to come from the inventory, "
            + "so a stored count would disagree with what the player is holding.");
    }

    if (counts_towards_job(null, {a: true}) || counts_towards_job(job, undefined)) {
        error("counts_towards_job does not answer false for a missing job or missing tags.");
    }

    console.log("[check] hunt hand-in: counts its own kills, stops at the brief");
}

/**
 * Every hunt the board can offer names a tag some COUNTABLE enemy carries.
 *
 * Progress comes from the kill hook in `kill_enemy`, and that hook sits inside
 * `if(target.add_to_bestiary)`. Seven of the game's enemies have that false - the two
 * village-guard variants, the suspicious wall and man, the mountain goat, and both giant
 * crabs - so a kill of one of those advances nothing.
 *
 * Which is fine while every offered tag has at least one countable carrier, and is measured
 * rather than assumed: today none of them is entirely uncountable. It stops being fine the
 * moment content moves, and the symptom would be a job that simply never progresses no
 * matter how much of the right thing the player kills.
 */
async function check_every_hunt_target_can_be_counted() {
    const [jobs_module, enemies_module, reputation_module] = await load_browser_free(
        repo_root, ["src/guild_jobs.js", "src/enemies.js", "src/reputation.js"]);
    const {hunt_targets_for} = jobs_module;
    const {enemy_templates} = enemies_module;
    const {guild_ranks} = reputation_module;

    let checked = 0;
    const seen = new Set();
    for (let index = 0; index < guild_ranks.length; index++) {
        for (const tag of hunt_targets_for(index)) {
            if (seen.has(tag)) continue;
            seen.add(tag);
            checked++;

            const carriers = Object.entries(enemy_templates)
                .filter(([, enemy]) => Boolean(enemy.tags?.[tag]));
            const countable = carriers.filter(([, enemy]) => enemy.add_to_bestiary);

            if (countable.length === 0) {
                error(`the board can offer a hunt for "${tag}", and every enemy carrying it `
                    + `(${carriers.map(([name]) => name).join(", ")}) has `
                    + `add_to_bestiary false. The kill hook is inside that guard, so the job `
                    + `would never advance however many the player killed.`);
            }
        }
    }

    console.log(`[check] hunt targets: ${checked} tag(s) offered, each carried by something `
        + `the kill hook counts`);
}

export { check_every_guild_rank_can_be_given_work,
    check_the_board_keeps_what_was_taken_off_it,
    check_a_restored_board_drops_jobs_that_name_nothing,
    check_a_gather_job_counts_every_stack,
    check_a_hunt_job_counts_only_its_own_kills,
    check_every_hunt_target_can_be_counted };
