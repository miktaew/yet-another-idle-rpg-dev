"use strict";
// @ts-check

/**
 * The guild's job generator (P-41, decided in Q-14).
 *
 * Every quest in the game is a literal in `quests.js` and nothing anywhere builds one at
 * runtime, so a board of randomised work is new machinery. This is the first piece of it and
 * deliberately the smallest: given a rank, produce a job. No board, no acceptance, no save -
 * those come next and all three read what this returns.
 *
 * **Nothing here is a table of invented difficulty.** The game already declares how hard
 * things are and this reads it:
 *
 *   - every enemy carries a `rank`, 1 to 11, which is the difficulty the game itself assigns;
 *   - every material carries a `value`, 1 to 275, which is the same thing for goods;
 *   - the guild's own ladder carries the standing between one rank and the next.
 *
 * So a job's target, its size and its pay are all derived from data that was already there,
 * which is this project's rule about reclamation over invention.
 */

import { locations } from "./data/locations.js";
import { enemy_templates } from "./enemies.js";
import { item_templates } from "./items.js";
import { guild_ranks, get_guild_rank } from "./reputation.js";

/*
    How much bigger the brief gets. The owner's own example: "bring 10" becomes "bring 30",
    "kill 100" becomes "kill 300" - so the span is about threefold, and the difficulty is a
    property of the job rather than of the rank. Two jobs of one rank do not pay the same.
*/
const job_difficulties = [
    {difficulty: "plain", size: 1, pay: 1},
    {difficulty: "long", size: 2, pay: 1.6},
    {difficulty: "brutal", size: 3, pay: 2.5},
];

/*
    Guild ranks: 9. Enemy ranks: 11. The two spans are mapped onto each other rather than
    paired by hand, so adding a rank at either end does not need a table edited to match.
*/
const enemy_rank_span = {lowest: 1, highest: 11};

/** The enemy rank a guild rank's work is drawn from, and how wide the window is. */
function enemy_rank_for(index) {
    const rungs = guild_ranks.length - 1;
    const span = enemy_rank_span.highest - enemy_rank_span.lowest;
    const centre = enemy_rank_span.lowest + Math.round((index / rungs) * span);
    return {
        centre,
        lowest: Math.max(enemy_rank_span.lowest, centre - 1),
        highest: Math.min(enemy_rank_span.highest, centre + 1),
    };
}

/**
 * The standing one job of a rank is worth, before difficulty.
 *
 * Derived from the ladder rather than tabled: the gap to the next rank divided by how many
 * jobs a promotion should take. That keeps one source of truth - move a threshold and the pay
 * moves with it - and it is why a rank-F job is worth a fraction of a rank-A one.
 */
const jobs_per_promotion = 8;

function standing_for_rank(index) {
    const here = guild_ranks[index];
    const next = guild_ranks[index + 1];
    //At the top of the ladder there is no gap left, so the last one is used.
    const gap = next
        ? next.at_least - here.at_least
        : here.at_least - guild_ranks[index - 1].at_least;
    return Math.max(1, Math.round(gap / jobs_per_promotion));
}

/**
 * What a job actually pays, given where the player already stands.
 *
 * **This is the ceiling Q-14 requires.** A board that pays for ever makes Guild standing
 * unbounded, and an unbounded region is one `check_a_standing_gate_can_be_reached` cannot say
 * anything about - which would switch that check off for the one region whose standing is
 * about to matter most. Past the top of the ladder the board pays nothing, so the total the
 * guild can ever grant is the top threshold plus whatever the written content pays.
 */
function standing_paid_for(job, standing) {
    const top = guild_ranks[guild_ranks.length - 1].at_least;
    if(standing >= top) {
        return 0;
    }
    const earned = Math.round(standing_for_rank(job.rank_index) * job.pay_multiplier);
    //And never past the ceiling in one go.
    return Math.min(earned, top - standing);
}

/*
    A tag is a brief only if it narrows something down. Measured: `living` and `beast` are on
    every one of the eleven enemy ranks and `medium` is on eight of them, so "hunt sixteen
    living things" tells the player nothing about where to go. The rule is derived from the
    spread rather than written as a list of banned names, so a tag added later is judged the
    same way.
*/
const tag_breadth_limit = 0.7;

/** Tags that appear across most of the game's enemy ranks, and so name no particular work. */
function too_broad_to_be_a_brief() {
    const ranks_of = new Map();
    const all_ranks = new Set();
    for(const enemy of Object.values(enemy_templates)) {
        all_ranks.add(enemy.rank);
        for(const tag of Object.keys(enemy.tags || {})) {
            if(!ranks_of.has(tag)) {
                ranks_of.set(tag, new Set());
            }
            ranks_of.get(tag).add(enemy.rank);
        }
    }
    const broad = new Set();
    for(const [tag, ranks] of ranks_of) {
        if(ranks.size >= all_ranks.size * tag_breadth_limit) {
            broad.add(tag);
        }
    }
    return broad;
}

/** Everything a hunt at this rank could name: enemies inside the rank window, by tag. */
function hunt_targets_for(index) {
    const window = enemy_rank_for(index);
    const tags = new Map();
    for(const [name, enemy] of Object.entries(enemy_templates)) {
        if(enemy.rank < window.lowest || enemy.rank > window.highest) {
            continue;
        }
        for(const tag of Object.keys(enemy.tags || {})) {
            if(!tags.has(tag)) {
                tags.set(tag, []);
            }
            tags.get(tag).push(name);
        }
    }
    /*
        Only tags that more than one enemy carries. A tag on a single enemy is that enemy
        under another name, and "kill any of these" reads as a lie when there is only one.
    */
    const broad = too_broad_to_be_a_brief();
    return [...tags]
        .filter(([tag, names]) => names.length > 1 && !broad.has(tag))
        .map(([tag]) => tag);
}

/**
 * Everything anybody can actually go out and gather.
 *
 * Not "every material", which was the first version and was wrong in a way the measurement
 * caught at once: it offered *Black iron chainmail* as something to fetch twenty of. Chainmail
 * is a MATERIAL by type and a piece of armour by nature, and a job to gather one is a job
 * nobody can do the way it is worded.
 *
 * So the pool is read from the gathering activities themselves - whatever some `gained_resources`
 * somewhere in the world actually yields. 30 of the game's 112 materials, and every one of them
 * is a thing with a place to go and get it.
 */
function gatherable_materials() {
    const yielded = new Set();
    for(const location of Object.values(locations)) {
        for(const activity of Object.values(location.activities || {})) {
            for(const resource of activity.gained_resources?.resources ?? []) {
                if(typeof resource.name === "string") {
                    yielded.add(resource.name);
                }
            }
        }
    }
    return yielded;
}

/** Everything a gather job at this rank could name: gatherable goods inside a value window. */
function gather_targets_for(index) {
    const rungs = guild_ranks.length - 1;
    const pool = [...gatherable_materials()]
        .map(name => ({name, value: item_templates[name]?.value ?? 0}))
        .filter(entry => item_templates[entry.name]);

    //The value span the pool actually has, read rather than assumed.
    let dearest = 0;
    for(const entry of pool) {
        dearest = Math.max(dearest, entry.value);
    }
    const step = dearest / (rungs + 1);
    const floor = index * step;
    const ceiling = (index + 2) * step;

    const inside = pool.filter(entry => entry.value >= floor && entry.value <= ceiling);
    /*
        A rank whose window happens to be empty still has to be able to offer work, so it
        falls back to the nearest thing by value rather than offering nothing.
    */
    if(inside.length > 0) {
        return inside.map(entry => entry.name);
    }
    const middle = (floor + ceiling) / 2;
    const nearest = pool.slice().sort((a, b) =>
        Math.abs(a.value - middle) - Math.abs(b.value - middle))[0];
    return nearest ? [nearest.name] : [];
}

/**
 * One job for one rank.
 *
 * `random` is a parameter and not a call to Math.random, for two reasons: a test has to be
 * able to ask for a particular job, and the board will have to produce the same day's work
 * twice - once when the day turns and once when the save is loaded again.
 *
 * @param {Object} params
 * @param {String} params.rank a rank from the guild ladder
 * @param {Function} [params.random] returns [0,1)
 * @returns {Object|null} the job, or null when the rank can offer none
 */
function generate_guild_job({rank, random = Math.random}) {
    const index = guild_ranks.findIndex(entry => entry.rank === rank);
    if(index === -1) {
        return null;
    }

    const pick = (list) => list.length ? list[Math.floor(random() * list.length)] : null;
    const difficulty = pick(job_difficulties);

    const hunt = hunt_targets_for(index);
    const gather = gather_targets_for(index);
    //A rank with nothing to hunt still has something to fetch, and the other way round.
    const types = [hunt.length ? "hunt" : null, gather.length ? "gather" : null].filter(Boolean);
    if(types.length === 0) {
        return null;
    }
    const type = pick(types);

    const target = type === "hunt" ? pick(hunt) : pick(gather);
    const base = type === "hunt" ? 8 : 10;
    const count = Math.max(1, Math.round(base * difficulty.size));

    return {
        rank,
        rank_index: index,
        type,
        target,
        count,
        difficulty: difficulty.difficulty,
        pay_multiplier: difficulty.pay,
    };
}

/** The board's offer: one job per rank the player can see, their own and one either side. */
function generate_guild_board({standing = 0, random = Math.random} = {}) {
    const {index} = get_guild_rank(standing);
    const offered = guild_ranks.slice(Math.max(0, index - 1), index + 2);
    return offered
        .map(entry => generate_guild_job({rank: entry.rank, random}))
        .filter(Boolean);
}

/**
 * Whether a saved job still names something the game has.
 *
 * A hunt names an enemy TAG and a gather names a material, and both are registry keys that
 * can stop existing between the save being written and being loaded - a tag that only one
 * enemy carries any more stops being a brief, a material can be renamed. A job holding a
 * name nothing answers to is worse than no job: it cannot be completed and it cannot be
 * handed in, so it sits on the board for ever.
 *
 * @param {Object} job as generate_guild_job returns
 * @returns {Boolean}
 */
function job_target_resolves(job) {
    if(!job || typeof job.target !== "string") {
        return false;
    }
    if(job.type === "gather") {
        return Boolean(item_templates[job.target]);
    }
    if(job.type === "hunt") {
        return Object.values(enemy_templates)
            .some(enemy => Boolean(enemy.tags?.[job.target]));
    }
    return false;
}

/**
 * The board for a given in-game day, rolled once and then left alone.
 *
 * **The accepted job survives the refresh**, which is the half of Q-14 that is a rule rather
 * than a number: *"it can refresh per game day, but a job that has been taken must not
 * disappear."* So the day turning replaces the offer and never the commitment.
 *
 * Rolled per day rather than per visit, also Q-14. Per visit would make the board something
 * to walk in and out of until it offers what you wanted, which is a different thing from a
 * board - and it is the same reason nothing here reseeds from the day number: the day's offer
 * is *kept*, in the save, so a reload shows what was there rather than rolling again.
 *
 * @param {Object} params
 * @param {Object} [params.board] the board as it stands, or nothing on a new game
 * @param {Number} params.day current_game_time.day_count
 * @param {Number} [params.standing] Guild reputation
 * @param {function(): Number} [params.random] returns [0,1). Typed precisely rather than
 *     as `Function`, which is assignable from anything callable and so is not assignable
 *     TO the narrower type generate_guild_board infers from its own `Math.random` default.
 * @returns {Object} the board, the same object when the day has not turned
 */
function refreshed_board({board, day, standing = 0, random = Math.random}) {
    if(board && board.day === day) {
        return board;
    }
    return {
        day,
        offered: generate_guild_board({standing, random}),
        accepted: board?.accepted ?? null,
    };
}

/**
 * Taking one job off the board.
 *
 * **One at a time.** Q-14 settled four things and not this one, so it is the narrow reading:
 * the owner asked to be able to *take different jobs*, which is a choice among what is
 * offered rather than a licence to hold three at once. It keeps the save shape a single
 * object and the standing per hand-in predictable, and widening it later is this function
 * and a list rather than a redesign.
 *
 * Returns a new board and never mutates the one passed in, so a refusal is simply the same
 * board back and the caller needs no error path.
 *
 * @param {Object} params
 * @param {Object} params.board
 * @param {Number} params.index which of the offered jobs
 * @returns {Object} the board, unchanged if the job cannot be taken
 */
function accept_from_board({board, index}) {
    if(!board || board.accepted) {
        return board;
    }
    const job = (board.offered || [])[index];
    if(!job) {
        return board;
    }
    return {
        ...board,
        accepted: job,
        //Taken off the board, because it has been taken off the board.
        offered: board.offered.filter((_, at) => at !== index),
    };
}

/**
 * A board read back from a save, with anything that no longer names something dropped.
 *
 * Deliberately forgiving about everything except the targets. A save from a version whose
 * board held a shape this one does not understand should leave the player with an empty
 * board and a working game, not a load that throws - `day: null` makes the next tick roll a
 * fresh offer, which is the correct recovery from every kind of nonsense here.
 *
 * @param {*} saved whatever was in the save file
 * @returns {Object} a board this version can use
 */
function restored_board(saved) {
    const offered = Array.isArray(saved?.offered)
        ? saved.offered.filter(job_target_resolves)
        : [];
    const accepted = job_target_resolves(saved?.accepted) ? saved.accepted : null;
    return {
        //A day that is not a number rolls a new offer on the next tick.
        day: typeof saved?.day === "number" ? saved.day : null,
        offered,
        accepted,
    };
}

export {
    job_difficulties,
    too_broad_to_be_a_brief,
    gatherable_materials,
    enemy_rank_for,
    standing_for_rank,
    standing_paid_for,
    hunt_targets_for,
    gather_targets_for,
    generate_guild_job,
    generate_guild_board,
    job_target_resolves,
    refreshed_board,
    accept_from_board,
    restored_board,
};
