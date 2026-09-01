"use strict";

/**
 * Repairs for rewards added to content a player may already have finished.
 *
 * The case that prompted this (P-38): five swampland deliveries began granting reputation in
 * v0.7.21, and a player who had already made those deliveries could never receive it. The
 * grant was written, the trigger was spent, and the region's standing sat at nought with
 * nothing left in the game able to raise it - which also put `swampchief standing`, gated at
 * 200, permanently out of reach.
 *
 * **Why the save's version cannot be the test.** The obvious gate - "repair anything older
 * than v0.7.21" - is what save_load.js does everywhere else, and here it fails: the owner's
 * save reads v0.7.25 because that is when it was last WRITTEN, while the deliveries were
 * finished long before. A version says nothing about when the content was done.
 *
 * **So the test is arithmetic instead.** Work out what the finished content owes the region
 * and compare it with the standing. Below it, the difference was never paid; at or above it,
 * there is nothing to do. That is idempotent by construction - the second load computes the
 * same floor and finds it already met - so it needs no ledger of what has been applied, and
 * it cannot pay twice.
 *
 * **Scoped to the regions named below, deliberately.** Measured across every source in the
 * game, the floor is NOT a reliable lower bound: for one save it came out ten above the
 * town's actual standing, which may be another grant of exactly this kind or may be
 * something else entirely. Repairing a region nobody reported, on a number that cannot be
 * explained, is not a repair. Each entry here is a reported case with a measured cause.
 */

import { dialogues } from "./data/dialogues.js";
import { locations } from "./data/locations.js";
import { traders } from "./traders.js";
import { titles } from "./data/titles.js";

/**
 * The regions whose grants arrived after the content that hands them out.
 *
 * `added_in` is not read as a gate - see above - and is recorded because a repair with no
 * note of what it repairs is unreadable a year later.
 */
const late_reputation_repairs = [
    {region: "Swamp", added_in: "v0.7.21", reported_as: "P-38"},
];

/**
 * What the content this save has already finished owes one region.
 *
 * Only sources whose completion the save actually records can be counted: a one-time entry
 * marked finished, or a repeatable one with a completion count. Anything else contributes
 * nothing, which keeps the total a floor rather than a guess - undercounting leaves standing
 * unpaid, and overcounting invents it.
 *
 * Negative grants count too. One reward in the game subtracts from the slums for helping the
 * guild, and a floor that ignored it would hand back standing the player spent.
 *
 * @param {Object} params
 * @param {String} params.region
 * @param {Object} params.save_data the parsed save
 * @returns {Object} {owed, from} - the total, and the sources it came from
 */
function reputation_owed_by_finished_content({region, save_data}) {
    let owed = 0;
    const from = [];

    const count = (granted, saved, where) => {
        if(!granted || !(region in granted) || !saved?.is_finished) {
            return;
        }
        const times = saved.completion_count || 1;
        owed += granted[region] * times;
        from.push({where, amount: granted[region], times});
    };

    for(const [name, dialogue] of Object.entries(dialogues)) {
        for(const bucket of ["textlines", "actions"]) {
            for(const [key, entry] of Object.entries(dialogue[bucket] || {})) {
                count(entry.rewards?.reputation,
                    save_data.dialogues?.[name]?.[bucket]?.[key], `${name}/${key}`);
            }
        }
    }

    for(const [name, location] of Object.entries(locations)) {
        for(const [key, action] of Object.entries(location.actions || {})) {
            count(action.rewards?.reputation,
                save_data.locations?.[name]?.actions?.[key], `${name}/${key}`);
        }
    }

    return {owed, from};
}

/**
 * What this save is short of, region by region, for the repairs listed above.
 *
 * Returns what should be granted rather than granting it: the caller pays it through
 * process_rewards, so a repaired standing goes through exactly the path a freshly earned one
 * does, and this stays a calculation that can be measured on its own.
 *
 * @param {Object} save_data the parsed save
 * @param {Object} reputation the standing as loaded, {region: value}
 * @returns {Array} [{region, missing, owed, standing, from}]
 */
function late_reputation_owed(save_data, reputation) {
    const found = [];

    for(const repair of late_reputation_repairs) {
        const {region} = repair;
        if(!(region in reputation)) {
            //The region was renamed or dropped; the repair has outlived its subject.
            continue;
        }
        const {owed, from} = reputation_owed_by_finished_content({region, save_data});
        const standing = reputation[region] ?? 0;
        if(owed > standing) {
            found.push({region, missing: owed - standing, owed, standing, from});
        }
    }

    return found;
}


/**
 * Unlocks that a finished one-time line was supposed to grant and never did.
 *
 * The same shape of problem as the reputation above, and the one that sealed a whole region.
 * `tallyman hello` unlocks `tallyman what leaves`; a player heard the greeting while that
 * reward was still written as `unlocks:` - a parameter Textline does not have - and the line
 * locks itself when it is done. The reward was corrected, the trigger was already spent, and
 * the bay was left with an unlocked tallyman who has nothing left to say: a dialogue is only
 * offered when `is_unlocked && !is_finished` holds for one of its lines, so the quay showed
 * no conversation, no actions, and no way on to the salt house or the flats. Reported three
 * times as "there are no actions in the bay", and twice diagnosed as something else.
 *
 * Read from the live registries after they have been restored, not from the save text: what
 * matters is the state the game is actually in once everything else has loaded.
 *
 * **What is NOT re-applied, and why it matters.** `process_rewards({only_unlocks: true})`
 * skips money, xp, items and effects but explicitly does not skip reputation, so replaying a
 * whole rewards block on every load would be a reputation pump. Each unlock is therefore
 * applied on its own, as a reward object holding nothing but that one unlock. Quests are left
 * out as well: a quest nothing ever started is a content fault and was fixed as one (P-40).
 *
 * Re-unlocking something already unlocked, or already finished, changes nothing anywhere -
 * every availability test in the game is `is_unlocked && !is_finished` - so this is safe to
 * run on every load and needs no record of having run.
 *
 * @param {Object} [state] registries this module does not import, passed in by the caller
 *                          rather than imported: save_load.js already holds them, and
 *                          reaching for main.js from here would close a cycle through the
 *                          module that imports this one.
 * @param {Object} [state.global_flags]
 * @param {Object} [state.stances]
 * @returns {Array} [{kind, target, from}] ready to hand to process_rewards one at a time
 */
/**
 * "Has this unlock already landed?", one test per kind of unlock.
 *
 * A factory rather than a plain object so that repairable_unlock_kinds below can be its keys
 * rather than a second list beside it - a hand-written list of what the repair handles is a
 * list that comes to disagree with the repair.
 *
 * A missing target reads as already open: content can name something that no longer exists,
 * and a repair is not the place to complain about it.
 */
const unlock_landed_tests = ({global_flags = null, stances = null} = {}) => ({
        textlines: (target) => (target.lines || []).every(line => {
            const state = dialogues[target.dialogue]?.textlines?.[line];
            return !state || state.is_unlocked || state.is_finished;
        }),
        actions: (target) => {
            //Two shapes: {location, action} for a place, {dialogue, action} for a person.
            const holder = target.location
                ? locations[target.location]?.actions
                : dialogues[target.dialogue]?.actions;
            const state = holder?.[target.action];
            return !state || state.is_unlocked || state.is_finished;
        },
        locations: (target) => {
            const where = locations[typeof target === "string" ? target : target.location];
            return !where || where.is_unlocked;
        },
        dialogues: (target) => {
            const who = dialogues[typeof target === "string" ? target : target.dialogue];
            return !who || who.is_unlocked;
        },
        traders: (target) => {
            const trader = traders[typeof target === "string" ? target : target.trader];
            return !trader || trader.is_unlocked;
        },
        activities: (target) => {
            const activity = locations[target.location]?.activities?.[target.activity];
            return !activity || activity.is_unlocked;
        },
        flags: (target) => global_flags === null || Boolean(global_flags[target]),
        housing: (target) => {
            const where = locations[typeof target === "string" ? target : target.location];
            return !where?.housing || where.housing.is_unlocked;
        },
        titles: (target) => {
            const title = titles[typeof target === "string" ? target : target.title];
            return !title || title.is_earned;
        },
        stances: (target) => {
            const stance = stances?.[typeof target === "string" ? target : target.stance];
            return stances === null || !stance || stance.is_unlocked;
        },
});

/*
    The unlock kinds this repair handles, derived from the tests above rather than restated,
    so check_the_unlock_repair_knows_every_kind is reading the dispatch table itself.
*/
const repairable_unlock_kinds = Object.keys(unlock_landed_tests());

function unlocks_missed_by_finished_content({global_flags = null, stances = null} = {}) {
    const missed = [];
    const is_open = unlock_landed_tests({global_flags, stances});

    const collect = (entry, where) => {
        /*
            A repeatable entry can fire its reward again, so a reward added late is not lost
            for it - there is nothing to repair. Only a spent one-time trigger is a dead end.
        */
        if(!entry.is_finished || entry.repeatable || !entry.rewards) {
            return;
        }
        for(const [kind, landed] of Object.entries(is_open)) {
            for(const target of entry.rewards[kind] || []) {
                if(!landed(target)) {
                    missed.push({kind, target, from: where});
                }
            }
        }
    };

    for(const [name, dialogue] of Object.entries(dialogues)) {
        for(const bucket of ["textlines", "actions"]) {
            for(const [key, entry] of Object.entries(dialogue[bucket] || {})) {
                collect(entry, `${name}/${key}`);
            }
        }
    }

    /*
        And the actions on a location, which carry the same risk for the same reason: they
        finish once and lock themselves, so a reward corrected afterwards never fires. The
        reputation repair above already walks both halves; this one had only the dialogues,
        which left a whole second source of the same dead end unrepaired.
    */
    for(const [name, location] of Object.entries(locations)) {
        for(const [key, action] of Object.entries(location.actions || {})) {
            collect(action, `${name}/${key}`);
        }
    }

    return missed;
}

/*
    Unlock kinds this repair deliberately does not touch, and why. The guard
    check_the_unlock_repair_knows_every_kind requires every reward kind declared on a one-time
    entry to be either repaired above or named here - so a kind added later cannot slip
    through as an accident.
*/
const unlock_kinds_left_alone = {
    quests: "starting a quest nothing ever started is a content fault, and P-40 fixed it as "
        + "one - the two bay quests were given the lines that hand them out, rather than "
        + "being handed out by the loader. check_every_quest_can_be_started holds it now",
    quest_progress: "tasks finish in order, so replaying one out of sequence does nothing "
        + "and replaying the sequence would need the whole history",
    reputation: "repaired by late_reputation_owed, which tops standing up to a floor instead "
        + "of re-granting, because re-granting on every load is a pump",
    recipes: "a recipe lives nested under its category, so 'is it unlocked' is a different "
        + "lookup for each of four kinds - worth doing when something is measured as broken",
    crafting: "a location's crafting flag has its own unlock path and its own display state",
    global_activities: "fans out over every location that has the activity, so 'already "
        + "unlocked' is not a single question",
    /*
        And the kinds that are payouts rather than unlocks. Handing a player money, items or
        xp years later is not repairing a broken chain, it is a gift nobody asked for.

        Only the payout kinds something actually declares are listed. A kind with no excuse
        and no handler fails check_the_unlock_repair_knows_every_kind, so the moment a
        one-time line grants xp or an effect, the reason has to be written down there and
        then rather than inherited from a list nobody reads.
    */
    money: "a payout, not an unlock",
    xp: "a payout, not an unlock",
    skill_xp: "a payout, not an unlock",
    items: "a payout, not an unlock",
    move_to: "an instruction that only makes sense at the moment it is given",
    locks: "the opposite of an unlock",
};

export {
    repairable_unlock_kinds,
    unlock_kinds_left_alone,
    late_reputation_repairs,
    late_reputation_owed,
    reputation_owed_by_finished_content,
    unlocks_missed_by_finished_content,
};
