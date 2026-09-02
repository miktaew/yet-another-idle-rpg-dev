// @ts-check
"use strict";

import { get_total_skill_level } from "./character.js";
import { current_game_time } from "./game_time.js";
import { global_flags } from "./main.js";
import { height_values } from "./person.js";
import { playable_races } from "./races.js";
import { registries } from "./registries.js";

/*
    either single set of values or two sets, one for minimum chance provided and one for maximum
    two-set approach does not apply to items, so it only checks them for conditions[0]
    if applicable, items get removed both on failure and on success; if action requires them, it would be a better approach to have a guaranteed success
    for dialogues, passing two sets is meaningless as returned value will be treated as true/false
    for dialogues, removing anything on visibility check is a terrible idea as it would remove item every time the dialogue is opened

    {
        money: Number //how much to require, taking nothing
        //  ...or, when it should also be SPENT:
        money: {
            number: Number,  //how much to require
            remove: Boolean, //spend it (only read off conditions[0], like items)
        }
        //On an action's `required` instead of its `conditions`, the spending flags
        //are remove_on_success / remove_on_fail, matching items_by_id there.
        stats: [
            "stat_id": Number //required stat
        ],

        skills: [
            "skill_id": Number //required level
        ],

        hero_level: Number //required hero level

        items_by_id: 
        [
            {
                "item_id": {
                    count: Number,
                    remove: Boolean
            }
        ],

        tools_by_slot: [
            
        ]

        location_clears: { //how many times a zone has been cleared
            location_key: {
                at_least: Number,
                at_most: Number
            }
        }

        quests_completed: [String] //quest keys that must be finished
        quests_not_completed: [String] //quest keys that must NOT be finished
        season: { //either season(s) that need to be active or season(s) that CAN'T be active
            not: String | [String],
            yes: String | [String],
        }

        reputation: { //standing in a region
            region: Number //at least this much - the shape every gate used before P-25
            //  ...or, to bound it on either side or both:
            region: {
                at_least: Number,
                at_most: Number, //inclusive, like location_clears
            }
        }

        moon: { //lunar phase(s) that must, or must not, be current
            not: String | [String],
            yes: String | [String],
        }

        flags: [String] //global flags required

        relative_height: { //short / average / tall, relative to race
            at_least: String
            exactly: String
            at_most: String
        }

        universal_height: { //very short / short / average / tall / very tall
            at_least: String
            exactly: String
            at_most: String
        }

        race: String
        race_type: {
            any: [String],
            all: [String]
        }
    }
*/


/**
 * The amount a condition names, from either accepted shape.
 *
 * Exported because main.js has to spend exactly what this checked: two readings of
 * the shape would let a gate pass on one number and charge another.
 *
 * @param {Object} condition one entry of a conditions array, or an action's `required`
 * @returns {Number|null} the amount, or null when no money is named
 */
function money_required(condition) {
    const money = condition?.money;
    if(money == null) {
        return null;
    }
    return typeof money === "object" ? money.number : money;
}

/**
 * How much money an attempt should actually take, which is a different question
 * from how much it required.
 *
 * A bare number gates and takes nothing; only the object form can be spent, and
 * which flag it uses depends on where it was written. A `conditions` entry uses
 * `remove`, matching items_by_id there; an action's `required` uses
 * `remove_on_success` / `remove_on_fail`, matching items_by_id there. Both are
 * handled here rather than at the call site, because this sits next to
 * money_required and the two have to agree about the shape - a gate that asks for
 * one number while the charge reads another is the failure this whole mechanism
 * was rebuilt to avoid.
 *
 * Pure, so it can be tested. The DOM-bound function in main.js that held this
 * logic could not be.
 *
 * @param {Object} condition a conditions entry, or an action's `required`
 * @param {Boolean} is_won whether the attempt succeeded
 * @returns {Number} the amount to remove, 0 when nothing should be
 */
function money_spent(condition, is_won) {
    const money = condition?.money;
    if(typeof money !== "object" || money === null) {
        return 0;
    }
    const takes_it = money.remove
        || (money.remove_on_success && is_won)
        || (money.remove_on_fail && !is_won);
    return takes_it ? (money.number ?? 0) : 0;
}

/**
 * Analyzes passed conditions, returns their status (0 or 1 if single element array,
 * fuzzy value if two element array).
 *
 * The names and the order were both wrong: it documented `character` first and called
 * the first parameter `condition`, which is neither its name nor singular.
 *
 * @param {Array} conditions the condition list, in declaration order
 * @param {Object} character who is being tested against them
 * @returns {Number} 0, 1, or a value between them
 */
const process_conditions = (conditions, character) => {
    let met = 1;

    if(conditions.length == 0) {
        //no conditions mean nothing to fail
        return 1;
    }

    //check money
    //
    //The schema above documents money as an OBJECT, and this used to compare
    //`character.money < conditions[0].money` against it directly. A condition
    //written the documented way therefore compared a number against an object,
    //which is never less than it, so the gate silently passed and nothing was ever
    //spent. No content used it, which is why it went unnoticed - Q4 of the town arc
    //is the first thing that needs money to actually leave the purse.
    //
    //Both forms are accepted: a bare number requires that much and takes nothing,
    //an object can also spend it. Spending happens where items are removed, in
    //main.js, on the same terms.
    const required_money = money_required(conditions[0]);
    const upper_money = money_required(conditions[1]);
    if(required_money && character.money < required_money) {
        met = 0;
        return met;
    } else if(upper_money && upper_money > required_money && character.money < upper_money) {
        met *= (1 + character.money - required_money)/(upper_money - required_money);
    }

    if(!met) {
        return met;
    }
    //check skills
    if(conditions[0].skills) {
        Object.keys(conditions[0].skills).forEach(skill_id => {
            if(get_total_skill_level(skill_id) < conditions[0].skills[skill_id]) {
                met = 0;
            } else if(conditions[1]?.skills && conditions[1].skills[skill_id] > conditions[0].skills[skill_id] && get_total_skill_level(skill_id) < conditions[1].skills[skill_id]) {
                met *= (1+get_total_skill_level(skill_id) - conditions[0].skills[skill_id])/(conditions[1].skills[skill_id] - conditions[0].skills[skill_id]);
            }
        });
    }

    if(conditions[0].hero_level) {
        if(character.xp.current_level < conditions[0].hero_level) {
            met = 0;
            return met;
        } else if(conditions[1]?.hero_level && conditions[1].hero_level > character.xp.current_level) {
            met *= (1 + character.xp.current_level - conditions[0].hero_level)/(conditions[1].hero_level - conditions[0].hero_level);
        }
    }

    if(!met) {
        return met;
    }
    //check items
    if(conditions[0].items_by_id) {
        Object.keys(conditions[0].items_by_id).forEach(item_id => {
            let found = false;
            //iterate through inventory, set found to true if id is present and count is enough
            Object.keys(character.inventory).forEach(item_key => {
                if(found) {
                    return;
                }
                
                const {id} = JSON.parse(item_key);
                if(id === item_id && character.inventory[item_key].count >= conditions[0].items_by_id[item_id].count) {
                    found = true;
                }
            });

            if(!found) {
                met = 0;
            }
        });
    }
    if(!met) {
        return met;
    }
    //checks stats
    if(conditions[0].stats) {
        Object.keys(conditions[0].stats).forEach(stat_key => {
            if(character.stats.full[stat_key] < conditions[0].stats[stat_key]) {
                met = 0;
            } else if(conditions[1]?.stats && conditions[1].stats[stat_key] > conditions[0].stats[stat_key] && character.stats.full[stat_key] < conditions[1].stats[stat_key]) {
                met *= (character.stats.full[stat_key] - conditions[0].stats[stat_key])/(conditions[1].stats[stat_key] - conditions[0].stats[stat_key]);
            }
        });
    }


    /*
        Clears of a location. Binary, like items and flags: only conditions[0] is read,
        because a partial clear count has no sensible fuzzy meaning.

        Both guards matter. An unknown key closes the gate and says so, instead of
        throwing on the next property read; and a location with no enemy_count - every
        non-combat Location - counts as zero clears rather than dividing to NaN. That
        second one is not defensive padding: every comparison against NaN is false, so
        an at_least gate written against a non-combat location would have OPENED.
    */
    if(conditions[0].location_clears) {
        Object.keys(conditions[0].location_clears).forEach(location_key => {
            const location = registries.locations[location_key];
            if(!location) {
                console.error(`A condition asks for clears of "${location_key}", which is not a location.`);
                met = 0;
                return;
            }
            const clears = location.enemy_count
                ? Math.floor(location.enemy_groups_killed / location.enemy_count)
                : 0;
            const wanted = conditions[0].location_clears[location_key];
            if("at_least" in wanted && clears < wanted.at_least) {
                met = 0;
            }
            if("at_most" in wanted && clears > wanted.at_most) {
                met = 0;
            }
        });
    }

    /*
        Finished quests. `is_finished` is the same field questManager.isQuestFinished
        reads, so the gate and the manager cannot disagree. An unknown quest key closes
        the gate in both directions - a typo must be visible, not permissive.
    */
    if(conditions[0].quests_completed) {
        for(let i = 0; i < conditions[0].quests_completed.length; i++) {
            const quest = registries.quests[conditions[0].quests_completed[i]];
            if(!quest) {
                console.error(`A condition requires quest "${conditions[0].quests_completed[i]}" to be finished, but no such quest exists.`);
                met = 0;
            } else if(!quest.is_finished) {
                met = 0;
            }
        }
    }

    if(conditions[0].quests_not_completed) {
        for(let i = 0; i < conditions[0].quests_not_completed.length; i++) {
            const quest = registries.quests[conditions[0].quests_not_completed[i]];
            if(!quest) {
                console.error(`A condition requires quest "${conditions[0].quests_not_completed[i]}" to be unfinished, but no such quest exists.`);
                met = 0;
            } else if(quest.is_finished) {
                met = 0;
            }
        }
    }
    /*
        Season. `yes` and `not` each take a season or a list of them.

        The list is what a thing that happens twice a year needs, and it is all it
        needs: seasons come round on their own, so two of them is a recurring window
        and no scheduler has to exist to open it (P-14, Q-10). The single string is
        the older shape and still the common one, so this widens rather than replaces
        it - and a list is already the project's way of naming several seasons, since
        an Activity's `availability_seasons` has been one all along.
    */
    if(conditions[0].season) {
        const season = current_game_time.getSeason();
        const listed = (declared) => Array.isArray(declared) ? declared : [declared];
        if(conditions[0].season.yes) {
            if(!listed(conditions[0].season.yes).includes(season)) {
                met = 0;
            }
        } else if(conditions[0].season.not) {
            if(listed(conditions[0].season.not).includes(season)) {
                met = 0;
            }
        }
    }

    /*
        The moon, in the same shape as the season above and for the same reason: a
        recurring window that opens on its own with no scheduler behind it.

        Where it differs is the period. A season is a quarter of the year, which is the
        right rhythm for a boat that comes twice a year and much too slow for anything
        that is meant to feel occasional. A phase is a quarter of 29.5 days - about 7.4 -
        so it comes round every month and a trader refreshing every four days will
        usually land inside it once. That is what P-25's "turns up occasionally" needs,
        and the day of the week could not do it: refreshes snap to a multiple of
        refresh_time, so a weekday condition and a four-day grid only meet every 28 days,
        which is an artifact of two grids rather than a rhythm anybody designed.

        Names are the four getMoonPhaseName returns; check_moon_phases_are_real holds
        content to them, because a misspelt phase compares false against every phase
        there is and behaves exactly like a window that never opens.
    */
    if(conditions[0].moon) {
        const phase = current_game_time.getMoonPhaseName(current_game_time.getMoonPhase());
        const listed = (declared) => Array.isArray(declared) ? declared : [declared];
        if(conditions[0].moon.yes) {
            if(!listed(conditions[0].moon.yes).includes(phase)) {
                met = 0;
            }
        } else if(conditions[0].moon.not) {
            if(listed(conditions[0].moon.not).includes(phase)) {
                met = 0;
            }
        }
    }

    //checks tools
    if(conditions[0].tools_by_slot) {
        for(let i = 0; i < conditions[0].tools_by_slot.length; i++) {
            if(!character.equipment[conditions[0].tools_by_slot[i]]) {
                met = 0;
                break;
            }
        }
    }

    /*
        Standing, as a floor and - since P-25 - optionally as a ceiling.

        A bare number is a floor and stays one, which is what all six gates written
        before this were. The bounded form is {at_least, at_most}, borrowed verbatim from
        location_clears rather than invented: at_most is inclusive there and is inclusive
        here.

        A ceiling is what "low standing" needs and what the game could not say. Every
        gate until now read standing as a threshold to pass, so a place could only get
        warmer; nothing could be written that a stranger hears and a regular does not.
        Note what that means here specifically: standing is floored at 0 and almost
        nothing subtracts from it, so a ceiling reads as *new*, not as *disliked*.

        The two-set ramp - conditions[1] scaling `met` between a floor and a ceiling for
        an action's success chance - only ever made sense for the numeric form, and is
        left to it.
    */
    if(conditions[0].reputation) {
        Object.keys(conditions[0].reputation).forEach(rep_region => {
            const wanted = conditions[0].reputation[rep_region];
            //Declared regions all exist; the fallback is so an absent one reads as 0
            //rather than making every comparison against undefined quietly false.
            const standing = character.reputation[rep_region] ?? 0;

            const at_least = typeof wanted === "number" ? wanted : wanted.at_least;
            const at_most = typeof wanted === "number" ? undefined : wanted.at_most;

            if(at_least !== undefined && standing < at_least) {
                met = 0;
                return;
            }
            if(at_most !== undefined && standing > at_most) {
                met = 0;
                return;
            }

            const ramp_ceiling = conditions[1]?.reputation?.[rep_region];
            if(typeof wanted === "number" && typeof ramp_ceiling === "number"
                && ramp_ceiling > wanted && standing < ramp_ceiling) {
                met *= (1 + standing - wanted)/(ramp_ceiling - wanted);
            }
        });
    }
    
    //check flags
    if(conditions[0].flags) {
        for(let i = 0; i < conditions[0].flags.length; i++) {
            if(!global_flags[conditions[0].flags[i]]) {
                met = 0;
                break;
            }
        }
    }

    //Both height blocks below were unreachable dead code - no content defines a
    //height condition - and all six comparisons in them were wrong. Every bound
    //test was inverted (an "at_least" failed when the character was TALLER than
    //the minimum), the relative "exactly" branch compared against .at_least, and
    //the universal block read conditions[0].relative_height.exactly, which throws
    //for a condition that sets universal_height without relative_height. Fixed
    //before any content starts relying on it.
    //
    //Semantics: put the character's own height on the left of every comparison,
    //so "at_least" fails when the character falls short and "at_most" fails when
    //the character exceeds it.
    if(conditions[0].relative_height) {
        if(conditions[0].relative_height.at_least) {
            if(height_values[character.personal.height] < height_values[conditions[0].relative_height.at_least]) {
                met = 0;
            }
        }
        if(conditions[0].relative_height.exactly) {
            if(conditions[0].relative_height.exactly !== character.personal.height) {
                met = 0;
            }
        }
        if(conditions[0].relative_height.at_most) {
            if(height_values[character.personal.height] > height_values[conditions[0].relative_height.at_most]) {
                met = 0;
            }
        }
    }

    if(conditions[0].universal_height) {
        if(conditions[0].universal_height.at_least) {
            if(character.getNumericalHeight() < height_values[conditions[0].universal_height.at_least]) {
                met = 0;
            }
        }
        if(conditions[0].universal_height.exactly) {
            if(character.getNumericalHeight() !== height_values[conditions[0].universal_height.exactly]) {
                met = 0;
            }
        }
        if(conditions[0].universal_height.at_most) {
            if(character.getNumericalHeight() > height_values[conditions[0].universal_height.at_most]) {
                met = 0;
            }
        }
    }

    if(conditions[0].race) {
        if(character.personal.race !== conditions[0].race) {
            met = 0;
        }
    }

    if(conditions[0].race_type) {
        const race = playable_races[character.personal.race];
        let is_any_met = false;
        Object.keys(conditions[0].race_type.any || {}).forEach(race_type => {
            if(race.tags[race_type]) {
                is_any_met = true;
            }
        });

        if(!is_any_met) {
            met = 0;
        }

        Object.keys(conditions[0].race_type.all || {}).forEach(race_type => {
            if(!race.tags[race_type]) {
                met = 0;
            }
        });
    }

    return met;
}




export {process_conditions, money_required, money_spent};