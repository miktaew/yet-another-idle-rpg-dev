"use strict";

/*

        DO NOT IMPORT ANYTHING, PASS ALL DATA THROUGH CONTEXT

*/

/*
    either single set of values or two sets, one for minimum chance provided and one for maximum
    two-set approach does not apply to items, so it only checks them for conditions[0]
    if applicable, items get removed both on failure and on success; if action requires them, it would be a better approach to have a guaranteed success
    removing anything on visibility check is a generally a bad idea
    chance is only properly used on action success, other systems use a binary approach (since they generally ignore success chance as they don't even have a corresponding logic)

    {
        money: {
            number: Number, //how much money to require
            remove: Boolean //if should be removed from inventory (false -> its kept)
        }
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

        location_clears: {
            location_key: {
                at_least: Number,
                at_most: Number
            }
        }

        quests_completed: [String] //quest keys
        quests_not_completed: [String] //quest keys

        season: { //either season that needs to be active or season that CAN'T be active
            not: String,
            yes: String,
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
     * Analyzes passed conditions, returns their status (0 or 1 if single element array, fuzzy value if two element array)
     * @param {Object} context for any data for conditions to be checked against (do not import anything in conditions.js)
     * @param {Object} condition 
    **/
const process_conditions = (conditions, context) => {
    const character = context.character;

    const full_stats = character.getFullStats();

    let met = 1;


    if(conditions.length == 0) {
        //no conditions mean nothing to fail
        return 1;
    }

    //check money
    if(conditions[0].money && character.money < conditions[0].money) {
        met = 0;
        return met;
    } else if(conditions[1]?.money && conditions[1].money > conditions[0].money && character.money < conditions[1].money) {
        met *= (1 + character.money - conditions[0].money)/(conditions[1].money - conditions[0].money);
    }

    if(!met) {
        return met;
    }
    //check skills
    if(conditions[0].skills) {
        Object.keys(conditions[0].skills).forEach(skill_id => {
            if(character.getTotalSkillLevel(skill_id) < conditions[0].skills[skill_id]) {
                met = 0;
            } else if(conditions[1]?.skills && conditions[1].skills[skill_id] > conditions[0].skills[skill_id] && character.getTotalSkillLevel(skill_id) < conditions[1].skills[skill_id]) {
                met *= (1+character.getTotalSkillLevel(skill_id) - conditions[0].skills[skill_id])/(conditions[1].skills[skill_id] - conditions[0].skills[skill_id]);
            }
        });
    }

    if(conditions[0].hero_level) {
        if(character.getCurrentLvl() < conditions[0].hero_level) {
            met = 0;
            return met;
        } else if(conditions[1]?.hero_level && conditions[1].hero_level > character.getCurrentLvl()) {
            met *= (1 + character.getCurrentLvl() - conditions[0].hero_level)/(conditions[1].hero_level - conditions[0].hero_level);
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
            Object.keys(character.getItems()).forEach(item_key => {
                if(found) {
                    return;
                }
                
                const {id} = JSON.parse(item_key);
                if(id === item_id && character.getItems()[item_key].count >= conditions[0].items_by_id[item_id].count) {
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
            if(full_stats[stat_key] < conditions[0].stats[stat_key]) {
                met = 0;
            } else if(conditions[1]?.stats && conditions[1].stats[stat_key] > conditions[0].stats[stat_key] && full_stats[stat_key] < conditions[1].stats[stat_key]) {
                met *= (full_stats[stat_key] - conditions[0].stats[stat_key])/(conditions[1].stats[stat_key] - conditions[0].stats[stat_key]);
            }
        });
    }

    if(conditions[0].location_clears) {
        Object.keys(conditions[0].location_clears).forEach(location_key => {
            const location = context.locations[location_key];
            if(!location) {
                console.error(`A condition asks for clears of "${location_key}", which is not a location.`);
                met = 0;
                return;
            }

            /*
                A location with no enemy_count - every non-combat one - would divide to
                NaN, and every comparison against NaN is false, so an at_least gate would
                silently OPEN instead of closing. Zero clears is the honest answer.
            */
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

    if(conditions[0].quests_completed) {
        for(let i = 0; i < conditions[0].quests_completed.length; i++) {
            const quest = context.quests[conditions[0].quests_completed[i]];
            if(!quest) {
                console.error(`A condition requires quest "${conditions[0].quests_completed[i]}" to be finished, but no such quest exists.`);
                met = 0;
            } else if(!quest.isFinished()) {
                //isFinished(), not .is_finished: the field moved into the availability
                //component, so reading it off the instance is always undefined and this
                //gate always reported "not finished".
                met = 0;
            }
        }
    }

    if(conditions[0].quests_not_completed) {
        for(let i = 0; i < conditions[0].quests_not_completed.length; i++) {
            //context.quests, not a bare `quests`: this file imports nothing on purpose,
            //so the bare reference threw ReferenceError the first time content used it.
            const quest = context.quests[conditions[0].quests_not_completed[i]];
            if(!quest) {
                console.error(`A condition requires quest "${conditions[0].quests_not_completed[i]}" to be unfinished, but no such quest exists.`);
                met = 0;
            } else if(quest.isFinished()) {
                met = 0;
            }
        }
    }

    //checks season
    if(conditions[0].season) {
        if(conditions[0].season.yes) {
            if(context.current_game_time.getSeason() !== conditions[0].season.yes) {
                met = 0;
            }
        } else if(conditions[0].season.not) {
            if(context.current_game_time.getSeason() === conditions[0].season.not) {
                met = 0;
            }
        }
    }

    //checks tools
    if(conditions[0].tools_by_slot) {
        for(let i = 0; i < conditions[0].tools_by_slot.length; i++) {
            if(!character.getEquipment()[conditions[0].tools_by_slot[i]]) {
                met = 0;
                break;
            }
        }
    }

    //checks reputation
    if(conditions[0].reputation) {
        Object.keys(conditions[0].reputation).forEach(rep_region => {
            if(character.reputation[rep_region] < conditions[0].reputation[rep_region]) {
                met = 0;
                return met;
            } else if(conditions[1]?.reputation && conditions[1].reputation[rep_region] > conditions[0].reputation[rep_region] && character.reputation[rep_region] < conditions[1].reputation[rep_region]) {
                met *= (1 + character.reputation[rep_region] - conditions[0].reputation[rep_region])/(conditions[1].reputation[rep_region] - conditions[0].reputation[rep_region]);
            }
        });
    }
    
    //check flags
    if(conditions[0].flags) {
        for(let i = 0; i < conditions[0].flags.length; i++) {
            if(!context.global_flags[conditions[0].flags[i]]) {
                met = 0;
                break;
            }
        }
    }

    if(conditions[0].relative_height) {
        if(conditions[0].relative_height.at_least) {
            if(context.height_values[conditions[0].relative_height.at_least] < context.height_values[character.bio.height]) {
                met = 0;
            }
        }
        if(conditions[0].relative_height.exactly) {
            if(conditions[0].relative_height.at_least !== character.bio.height) {
                met = 0;
            }
        }
        if(conditions[0].relative_height.at_most) {
            if(context.height_values[conditions[0].relative_height.at_most] > context.height_values[character.bio.height]) {
                met = 0;
            }
        }
    }

    if(conditions[0].universal_height) {
        if(conditions[0].universal_height.at_least) {
            if(context.height_values[conditions[0].universal_height.at_least] < character.getNumericalHeight()) {
                met = 0;
            }
        }
        if(conditions[0].relative_height.exactly) {
            if(context.height_values[conditions[0].universal_height.exactly] !== character.getNumericalHeight()) {
                met = 0;
            }
        }
        if(conditions[0].universal_height.at_most) {
            if(context.height_values[conditions[0].universal_height.at_most] > character.getNumericalHeight()) {
                met = 0;
            }
        }
    }

    if(conditions[0].race) {
        if(character.bio.race !== conditions[0].race) {
            met = 0;
        }
    }

    if(conditions[0].race_type) {
        const race = context.playable_races[character.bio.race];
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

export {process_conditions};