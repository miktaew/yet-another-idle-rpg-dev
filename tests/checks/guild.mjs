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

export { check_every_guild_rank_can_be_given_work };
