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

export { late_reputation_repairs, late_reputation_owed, reputation_owed_by_finished_content };
