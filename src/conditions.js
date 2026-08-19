"use strict";

import { get_total_skill_level } from "./character.js";
import { current_game_time } from "./game_time.js";
import { global_flags } from "./main.js";
import { height_values } from "./person.js";
import { playable_races } from "./races.js";

/*
    either single set of values or two sets, one for minimum chance provided and one for maximum
    two-set approach does not apply to items, so it only checks them for conditions[0]
    if applicable, items get removed both on failure and on success; if action requires them, it would be a better approach to have a guaranteed success
    for dialogues, passing two sets is meaningless as returned value will be treated as true/false
    for dialogues, removing anything on visibility check is a terrible idea as it would remove item every time the dialogue is opened

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
     * @param {*} character 
     * @param {*} condition 
    **/
const process_conditions = (conditions, character) => {
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

    //checks season
    if(conditions[0].season) {
        if(conditions[0].season.yes) {
            if(current_game_time.getSeason() !== conditions[0].season.yes) {
                met = 0;
            }
        } else if(conditions[0].season.not) {
            if(current_game_time.getSeason() === conditions[0].season.not) {
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




export {process_conditions};