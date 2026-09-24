"use strict";

class Rewards {
    //realisticaly you can just skip the class and do a raw object with those fields, all it will change is lack of a check for unused keys on creation
    constructor(data = {}) {
        this.required_clear_count = data.required_clear_count;
        //clear count is for location rewards only and will be processed before rewards are passed to process_rewards function
        this.chance = data.chance;
        //if not provided, chance will be assumed to be 100%;
        //rewards with clear count will be processed only once (when clear count is reached), so try to not use chance on them;
        //unlocks will in many cases be reprocessed on load, so do not put chance on rewards that include them

        this.messages = data.messages; 
        // [String] // messages to be logged together with rewards
        this.money = data.money; 
        //Number // flat monetary reward
        this.xp = data.xp; 
        //Number // flat xp reward
        this.skill_xp = data.skill_xp; 
        //{ "skill_id": xp_value }
        this.locations = data.locations; 
        // { location: String, skip_message: Boolean}, where location is a location key;
        this.flags = data.flags; 
        // [String] // global flag keys
        this.textlines = data.textlines;
        /* 
        [
            {
                lines: [String] //an array with textline keys
                dialogue: String //dialogue key (NOT the NPC)
                skip_message: Boolean
            }
        ] 
        */
       this.npcs = data.npcs;
       /*
        [
        {
            npc: String, // npc key
            skip_message: Boolean
        }
        ]
       */
        this.dialogues = data.dialogues; 
        // [String] // dialogue keys
        this.traders = data.traders;
        /*
        [
            {
                trader: String //trader key
                skip_message: Boolean
            }
        ]
        */
        this.housing = data.housing;
        //[String] // location keys
        this.crafting = data.crafting;
        //[String] // location keys
        this.activities = data.activities;
        /*
        [
            {
                activity: String //activity key
                location: String //location key
            }
        ]
        */
        this.actions = data.actions;
        /*
        [
            {
                action: String //action key

                location: String //location key
                OR
                npc: String //npc string
            }
        ]
        */
        this.stances = data.stances;
        //[String], stance keys
        this.recipes = data.recipes;
        /*
        [
            {
                category: String,
                subcategory: String,
                recipe_id: String
            }
        ]
        */
        this.reputation = data.reputation;
        //{ "region_key": Number } //flat value of rep gained, key should match one of market_region keys if it's supposed to affect any trade
        this.quests = data.quests;
        // [String] // quest ids
        this.quest_progress = data.quest_progress;
        /*
        [ 
            {
                quest_id: String,
                task_index: Number,
            }
        ]
        */
        this.items = data.items;
        /*
        [
            {
                item: String //item key
                count: Number //item count
                quality: //item quality, skipped if it's not gear/component/fish
            }
            //OR
            String // item key; 
            // just that, count will be defaulted to 1; can be mixed, e.g. items: ["Fresh bread", {item: "Stale bread", count:5 }]
            
            semi-important: rewards listed as strings instead of objects will never be grouped in display, applies also to what's defined in mixed rewards
        ]
        */
        this.active_effects = data.active_effects;
        //{"effect_id": duration} //duration in in-game minutes (irl seconds)
        this.move_to = data.move_to;
        //{location: String} //location key

        this.locks = data.locks;
        /*
        {
            locations: [String] //an array with location keys
            textlines: {
                "dialogue_key": [String] //an array with textline keys
            },
            npcs: [String] //an array with npc keys
        }
        */

        warn_about_unread_reward_keys(data);
    }
}

class MixedRewards {
    constructor(data) {
        this.rewards_array = data;
        /*
        random_rewards_mixed: [
            {
                chance_to_be_in_mix: Number,
                possible_rewards:  [{rewards_1}, ..., {rewards_n}] //with each elem having same chance, based on length
            }
        ]

        chance_to_be_in_mix will be assumed to be 100% if not provided;

        included Rewards objects can still have individual chance provided, but it doesn't really make much sense to do it?

        do not include reputation, as it's something that is recalculated on loading and should only be in non-random sources

        recommended uses: minor actions (especially repeatable ones and action failures), location clearings
        */
    }
}

const reward_keys = [
    "actions", "activities", "crafting", "dialogues", "flags", "global_activities",
    "housing", "items", "locations", "locks", "messages", "money", "move_to", "npcs",
    "quest_progress", "quests", "recipes", "reputation", "skill_xp", "skills", "stances",
    "textlines", "traders", "xp", "active_effects",
];
const special_keys = ["required_clear_count", "chance"];
const lock_keys = ["actions", "locations", "npcs", "quests", "textlines"];

function warn_about_unread_reward_keys(rewards, source_type, source_name) {
    const where = source_name ? ` (${source_type} "${source_name}")` : "";
    const valid_keys = [...reward_keys, ...special_keys];
    for(const key of Object.keys(rewards)) {
        if(!valid_keys.includes(key)) {
            console.warn(`Reward key "${key}"${where} is not a valid reward key and will be ignored`);
        }
    }
    for(const key of Object.keys(rewards.locks || {})) {
        if(!lock_keys.includes(key)) {
            console.warn(`Lock key "${key}"${where} is not a valid reward key and will be ignored`);
        }
    }
}

//very lame example; 50% chance to include either 10 xp or 10 money; 100% chance to include either 100 xp or 100 money, 100% chance to include 1000 xp or 1000 money
//actual rewards could include items, active effects, skill xp (instead of hero xp), etc
/*
const mixed_example = new MixedRewards(
    [
        {
            chance_to_be_in_mix: 0.5,
            possible_rewards: [
                new Rewards({xp: 10}),
                new Rewards({money: 10}),
            ]
        },
        {
            chance_to_be_in_mix: 1,
            possible_rewards: [
                new Rewards({xp: 100}),
                new Rewards({money: 100}),
            ]
        },
        {
            chance_to_be_in_mix: 1,
            possible_rewards: [
                new Rewards({xp: 1000}),
                new Rewards({money: 1000}),
                new Rewards({}) //empty for further manipulation of the chances
            ]
        }
    ]
);
*/
export {
    Rewards, MixedRewards,
}