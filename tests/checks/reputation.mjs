/** Standing: what grants it, what it opens, and what repairs it. */

import { repo_root } from "../lib/context.mjs";
import { error, warn } from "../lib/report.mjs";
import { load_browser_free } from "../lib/browser-free-src.mjs";

/**
 * Every reputation source and gate in the game, read off the live objects.
 *
 * Read from the registries rather than the source text, and that is not a style choice: the
 * first measurement of P-38 scanned the source for `reputation: {...}` near a `rewards:` and
 * counted two `display_conditions` blocks as grants, because the words sit four lines apart.
 * It reported a shortfall of 140 in a region that had none. An object cannot be misread that
 * way - a grant is under `rewards`, a gate is under `display_conditions` or `required`, and
 * nothing else can look like either.
 */
async function reputation_sources() {
    const [dialogues_module, locations_module, quests_module, titles_module] =
        await load_browser_free(repo_root, ["src/data/dialogues.js", "src/data/locations.js",
            "src/quests.js", "src/data/titles.js"]);

    const grants = [];
    const gates = [];

    const read_gates = (holder, where) => {
        for (const field of ["display_conditions", "required", "conditions"]) {
            /*
                Every constructor stores display_conditions wrapped in an array, and the
                two-set condition form is an array as well, so both shapes are walked.
            */
            const declared = holder[field];
            if (!declared) continue;
            for (const set of [declared].flat(2)) {
                const wanted = set?.reputation;
                if (!wanted) continue;
                for (const [region, value] of Object.entries(wanted)) {
                    const at_least = typeof value === "number" ? value : value?.at_least;
                    if (typeof at_least === "number") {
                        gates.push({region, at_least, where});
                    }
                }
            }
        }
    };

    const read_grant = (granted, where, repeatable) => {
        if (!granted) return;
        for (const [region, amount] of Object.entries(granted)) {
            grants.push({region, amount, where, repeatable});
        }
    };

    const read = (holder, where) => {
        read_grant(holder.rewards?.reputation, where, Boolean(holder.repeatable));
        read_gates(holder, where);
    };

    for (const [name, dialogue] of Object.entries(dialogues_module.dialogues)) {
        read_gates(dialogue, name);
        for (const bucket of ["textlines", "actions"]) {
            for (const [key, entry] of Object.entries(dialogue[bucket] || {})) {
                read(entry, `${name}/${key}`);
            }
        }
    }
    for (const [name, location] of Object.entries(locations_module.locations)) {
        for (const [key, action] of Object.entries(location.actions || {})) {
            read(action, `${name}/${key}`);
        }
        /*
            A cleared zone pays in three more shapes, and the first sweep of this check knew
            none of them - which is how it came to report that the elder's amulet, gated at
            400 with the village, could never be opened by anyone. A real save had 460.

            repeatable_reward is paid again on every clear, so a region it grants has no
            ceiling at all; that is carried through as `repeatable` rather than counted once.
        */
        read_grant(location.first_reward?.reputation, `${name} (first clear)`, false);
        read_grant(location.repeatable_reward?.reputation, `${name} (each clear)`, true);
        for (const tier of location.rewards_with_clear_requirement || []) {
            read_grant(tier.reputation,
                `${name} (${tier.required_clear_count} clears)`, false);
        }
    }

    /*
        Quests pay too, on the quest as a whole and on individual tasks - 260 of the
        village's standing comes from one quest - and leaving them out is what made the
        second sweep of this check still call the elder's amulet unreachable.
    */
    for (const [name, quest] of Object.entries(quests_module.quests)) {
        read_grant(quest.quest_rewards?.reputation, `quest ${name}`, false);
        for (const [index, task] of Object.entries(quest.quest_tasks || quest.tasks || [])) {
            read_grant(task.task_rewards?.reputation, `quest ${name} task ${index}`, false);
        }
    }

    /*
        A title is a gate and never a grant: it is something standing opens, which makes an
        unreachable one exactly the failure this file is about.
    */
    for (const [name, title] of Object.entries(titles_module.titles)) {
        read_gates({display_conditions: title.condition}, `title "${name}"`);
    }

    return {grants, gates};
}

/**
 * A standing gate can be reached by a player who does everything.
 *
 * This is the design error that turned P-38 from a shortfall into a dead end: the swamp's
 * highest gate wants 200 and its grants total 300, which is fine - but a region whose gates
 * ask for more than its content can ever hand out is content nobody can open, and it reads
 * as perfectly ordinary data. Nothing else in the build compares the two, because grants and
 * gates are written in the same shape and only their surroundings tell them apart.
 *
 * Only positive grants count towards the total. A reward that subtracts is a cost, and a gate
 * a player can only reach by not paying it is still reachable.
 */
async function check_a_standing_gate_can_be_reached() {
    const {grants, gates} = await reputation_sources();
    if (grants.length === 0 || gates.length === 0) {
        error("reputation: no grants or no gates found at all - this check is out of date.");
        return;
    }

    const available = {};
    const unbounded = new Set();
    for (const grant of grants) {
        if (grant.amount <= 0) {
            continue;
        }
        if (grant.repeatable) {
            //Paid again every time, so there is no total to compare a gate against.
            unbounded.add(grant.region);
        }
        available[grant.region] = (available[grant.region] || 0) + grant.amount;
    }

    const highest = {};
    for (const gate of gates) {
        if (!highest[gate.region] || gate.at_least > highest[gate.region].at_least) {
            highest[gate.region] = gate;
        }
    }

    for (const [region, gate] of Object.entries(highest)) {
        const total = available[region] || 0;
        if (gate.at_least > total && !unbounded.has(region)) {
            error(`reputation: "${gate.where}" is gated at ${gate.at_least} standing with `
                + `${region}, and everything in the game that grants it adds up to ${total}. `
                + `No player can open it.`);
        }
    }

    console.log(`[check] standing gates: ${Object.keys(highest).length} region(s) gated, `
        + `${grants.length} grants, highest gate reachable in each`);
}

/**
 * A late repair can still find the grants it exists to replay.
 *
 * The repairs in save_repairs.js pay a player for content they finished before the reward for
 * finishing it existed. They find that content by walking the live rewards, which means a
 * renamed delivery or a grant moved to another region turns a repair into a silent no-op:
 * nothing throws, nothing is logged, and the standing it was written to restore stays at
 * nought.
 *
 * Measured by running the shipped calculation against a save built to say that every source
 * granting that region is finished. If the repair cannot find anything to pay there, it can
 * never find anything at all.
 */
async function check_a_late_repair_still_finds_its_grants() {
    const {grants} = await reputation_sources();
    const [repairs] = await load_browser_free(repo_root, ["src/save_repairs.js"]);
    const registry = repairs.late_reputation_repairs;

    if (!Array.isArray(registry) || registry.length === 0) {
        //Nothing to repair is a valid state - it means every reward has always been payable.
        console.log("[check] late repairs: none registered");
        return;
    }

    for (const repair of registry) {
        const owed_by = grants.filter(g => g.region === repair.region && g.amount > 0);
        if (owed_by.length === 0) {
            error(`reputation: the late repair for "${repair.region}" (${repair.reported_as}) `
                + `has nothing in the game that grants that region any more, so it can never `
                + `pay anybody. Remove the repair, or restore what it was written for.`);
            continue;
        }

        /*
            A save that says every one of those sources is finished. The repair should then
            owe their whole total - which also proves the walk reaches both the dialogue and
            the location halves, since the sources come from both.
        */
        const save = {dialogues: {}, locations: {}};
        for (const grant of owed_by) {
            const [holder, key] = grant.where.split("/");
            for (const target of [save.dialogues, save.locations]) {
                target[holder] = target[holder] || {textlines: {}, actions: {}};
                target[holder].textlines[key] = {is_finished: true};
                target[holder].actions[key] = {is_finished: true};
            }
        }

        const found = repairs.late_reputation_owed(save, {[repair.region]: 0});
        const paid = found.find(f => f.region === repair.region);
        if (!paid) {
            error(`reputation: the late repair for "${repair.region}" pays nothing even when `
                + `every source granting it is marked finished. It is a no-op.`);
            continue;
        }

        const total = owed_by.reduce((sum, g) => sum + g.amount, 0);
        if (paid.missing !== total) {
            error(`reputation: the late repair for "${repair.region}" would pay `
                + `${paid.missing} where its sources grant ${total}, so it is reaching some `
                + `of them and not others.`);
        }

        console.log(`[check] late repairs: ${repair.region} (${repair.reported_as}) `
            + `finds ${owed_by.length} grant(s) worth ${total}`);
    }
}

/**
 * The unlock repair knows every kind of unlock a one-time line can grant.
 *
 * A textline locks itself when it is done, so a reward added or corrected after a player has
 * already heard the line can never fire. `save_repairs.js` re-applies the unlocks missed that
 * way - which is what unsealed the bay, where the greeting had been heard while the line that
 * opens the rest of the conversation was still written as `unlocks:`, a parameter Textline
 * does not have. The tallyman was left unlocked with nothing to say, and a dialogue is only
 * offered when `is_unlocked && !is_finished` holds for one of its lines, so the whole region
 * showed nothing but the road out.
 *
 * The failure this holds is the repair going quietly out of date. Add a `recipes:` unlock to a
 * dialogue line and the repair walks past it: nothing throws, the content works for every new
 * player, and only someone who finished that line at the wrong version is left short - which
 * is not a state any test can stumble into.
 *
 * So every reward kind declared on a one-time entry has to be either repaired or named in
 * `unlock_kinds_left_alone` with a reason. A kind in neither list is the accident. Both lists
 * come out of the module - the repaired one derived from the dispatch table itself - so this
 * cannot come to agree with itself.
 */
async function check_the_unlock_repair_knows_every_kind() {
    const [dialogues_module, locations_module, repairs] = await load_browser_free(repo_root,
        ["src/data/dialogues.js", "src/data/locations.js", "src/save_repairs.js"]);

    const repaired = new Set(repairs.repairable_unlock_kinds || []);
    const excused = repairs.unlock_kinds_left_alone || {};
    if (repaired.size === 0) {
        error("save_repairs.js exports no repairable_unlock_kinds - this check is out of date.");
        return;
    }

    /*
        A constructor fills every reward field in, so an empty one is a default and not
        something the content declared. Counting those would have this check demanding a
        reason for every kind in the game whether or not anything uses it.
    */
    const declared = new Map();
    const note = (entry, where) => {
        //A repeatable entry can fire its reward again, so a late one is not lost.
        if (entry.repeatable) return;
        for (const [kind, value] of Object.entries(entry.rewards || {})) {
            const has_content = Array.isArray(value)
                ? value.length > 0
                : (value && typeof value === "object")
                    ? Object.keys(value).length > 0
                    : Boolean(value);
            if (!has_content) continue;
            if (!declared.has(kind)) declared.set(kind, where);
        }
    };
    for (const [name, dialogue] of Object.entries(dialogues_module.dialogues)) {
        for (const bucket of ["textlines", "actions"]) {
            for (const [key, entry] of Object.entries(dialogue[bucket] || {})) {
                note(entry, `${name}/${key}`);
            }
        }
    }
    //Both sources the repair walks, so the two cannot drift apart.
    for (const [name, location] of Object.entries(locations_module.locations)) {
        for (const [key, action] of Object.entries(location.actions || {})) {
            note(action, `${name}/${key}`);
        }
    }
    if (declared.size === 0) {
        error("no one-time reward declares anything at all - this check is out of date.");
        return;
    }

    for (const [kind, where] of declared) {
        if (repaired.has(kind) || kind in excused) continue;
        error(`the unlock repair does not handle "${kind}" (declared on ${where}) and `
            + `unlock_kinds_left_alone does not say why. A player who finished that line `
            + `before the reward existed can never receive it, and nothing reports it. `
            + `Handle it in save_repairs.js, or name it there with a reason.`);
    }

    //And the other direction: an excuse for a kind nothing declares is an excuse to delete.
    for (const kind of Object.keys(excused)) {
        if (declared.has(kind) || repaired.has(kind)) continue;
        warn(`unlock_kinds_left_alone excuses "${kind}", which no one-time reward `
            + `declares on a one-time entry. The excuse can go.`);
    }

    const counted = [...declared.keys()].filter(kind => repaired.has(kind)).length;
    console.log(`[check] unlock repair: ${declared.size} reward kind(s) declared on one-time `
        + `lines, ${counted} repaired, ${declared.size - counted} excused by name`);
}

/**
 * Every guild rank can actually be reached, and every rank sees work.
 *
 * The ladder is walked, not indexed: `get_guild_rank` steps up while the standing clears the
 * next threshold and **stops at the first one it does not**. So a threshold that is out of
 * order does not throw and does not warn - it makes every rank above it unreachable for ever,
 * and the only symptom is a player who stops being promoted.
 *
 * Measured behaviourally rather than by restating the rule: for each rank in the ladder, ask
 * whether any standing yields it. That catches an out-of-order threshold, a duplicate one, and
 * a first entry that is not 0 - which would leave a fresh character with no rank at all -
 * without this check having to know which of those went wrong.
 *
 * The offer window is checked too. It is the mechanism the board is built on (your rank, one
 * below, one above), so an empty one is a board with nothing on it and a wide one is a board
 * that ignores rank.
 */
async function check_every_guild_rank_can_be_reached() {
    const [reputation_module] = await load_browser_free(repo_root, ["src/reputation.js"]);
    const {guild_ranks, get_guild_rank, get_offered_guild_ranks} = reputation_module;

    if (!Array.isArray(guild_ranks) || guild_ranks.length === 0) {
        error("reputation.js exports no guild_ranks - check_every_guild_rank_can_be_reached "
            + "is out of date.");
        return;
    }

    /*
        The bottom rung has to be 0, and that is not a restatement of the data: get_guild_rank
        starts at index 0 and only ever walks up, so a first threshold above nought is ignored
        entirely - everybody is the bottom rank whether they have cleared it or not. The data
        would say one thing and the game another, which is the shape of a rule nobody can see
        being broken.
    */
    if (guild_ranks[0].at_least !== 0) {
        error(`the guild ladder starts at ${guild_ranks[0].at_least} standing, so `
            + `"${guild_ranks[0].rank}" reads as earned. get_guild_rank walks up from the `
            + `bottom rung and never below it, so that threshold is never actually tested and `
            + `a fresh character holds the rank anyway.`);
    }

    //Every threshold, and one either side of it, is enough to find any gap.
    const probes = new Set([0]);
    for (const entry of guild_ranks) {
        probes.add(Math.max(0, entry.at_least - 1));
        probes.add(entry.at_least);
        probes.add(entry.at_least + 1);
    }
    const reached = new Set([...probes].map(standing => get_guild_rank(standing).rank));

    for (const entry of guild_ranks) {
        if (reached.has(entry.rank)) continue;
        error(`the guild rank "${entry.rank}" at ${entry.at_least} standing cannot be reached `
            + `by any standing. get_guild_rank walks the ladder and stops at the first `
            + `threshold it does not clear, so a threshold out of order silently locks every `
            + `rank above it.`);
    }

    const names = new Set(guild_ranks.map(entry => entry.rank));
    for (const standing of probes) {
        const offered = get_offered_guild_ranks(standing);
        if (offered.length === 0) {
            error(`at ${standing} standing the board would offer no ranks at all.`);
        } else if (offered.length > 3) {
            error(`at ${standing} standing the board would offer ${offered.length} ranks `
                + `(${offered.join(", ")}); the rule is your own rank, one below and one above.`);
        }
        for (const rank of offered) {
            if (!names.has(rank)) {
                error(`the board would offer rank "${rank}" at ${standing} standing, and no `
                    + `such rank is in the ladder.`);
            }
        }
    }

    console.log(`[check] guild ranks: ${guild_ranks.length} rank(s), each reachable, `
        + `${probes.size} standings probed and none offering outside the ladder`);
}

export {
    check_a_standing_gate_can_be_reached,
    check_a_late_repair_still_finds_its_grants,
    check_the_unlock_repair_knows_every_kind,
    check_every_guild_rank_can_be_reached,
};
