"use strict";

import { enemy_templates, Enemy } from "./enemies.js";
import { skills } from "./skills.js";
import { current_game_time } from "./game_time.js";
import { activities } from "./activities.js";
import { get_total_skill_level, get_skill_modifier, is_rat } from "./character.js";
import { GameAction } from "./actions.js";
import { fill_market_regions, market_regions } from "./market_saturation.js";
import { global_flags, language } from "./main.js";
import { translationManager } from "./translation.js";
import { clamp, slerp } from "./misc.js";
const locations = {}; //contains all the created locations
const location_types = {};

const favourite_locations = {};

class Location {
    constructor({
                name, 
                id,
                description, 
                connected_locations = [], 
                is_unlocked = true, 
                is_finished = false,
                dialogues = [], 
                traders = [],
                market_region = null,
                types = [], //{type, xp per tick}
                housing = {},
                light_level = "normal",
                getDescription,
                background_noises = [],
                getBackgroundNoises,
                crafting = null,
                tags = {},
                is_temperature_static = false,
                static_temperature = null,
                reverse_day_night_temperatures = false,
                temperature_range_modifier = 1,
                temperature_modifier = 0,
                is_under_roof = false,
                entrance_rewards, //rewards gained on entering it, to be used for unlocks
                display_conditions = [], //same shape as on a Textline; checked at render time, so a runtime flag works
            }) {
        // always a safe zone

        this.name = name;
        this.id = id;
        this.description = description;
        //A static description is a TEXT ID; a getDescription passed in resolves its
        //own text, because it branches on game state and each branch is its own id.
        this.getDescription = getDescription || function(){
            return description ? translationManager.getText(language, description) : description;
        }
        this.background_noises = background_noises;
        this.getBackgroundNoises = getBackgroundNoises || function(){return background_noises;}
        this.connected_locations = connected_locations; 
        //[{location: Location, custom_text: String (replaces 'Go to [X]'), travel_time: Number, travel_time_skills: [String] (skill ids, if skipped defaults to ['Running'])}]
        //for combat zones, it's symmetrical; otherwise it doesn't have to be as such
        //for challenge zones, travel times are expected to be 0 and therefore not displayed, so setting them to something different would require display changes
        this.is_unlocked = is_unlocked;
        this.is_finished = is_finished; //for when it's in any way or form "completed" and player shouldn't be allowed back
        this.dialogues = dialogues;
        this.traders = traders;
        this.market_region = market_region; //for separate regions for market saturation
        //Wrapped the same way Textline does it, because process_conditions reads
        //conditions[0]. This option was already being passed by content (the
        //Nekomimi cafe) but the constructor did not accept it, so it was silently
        //dropped and the intended gate never applied.
        this.display_conditions = [display_conditions];
        if(market_region) {
            market_regions[market_region] = true;
        }
        this.activities = {};
        this.actions = {};
        this.types = types;
        this.housing = housing;
        /*
            housing: {
                is_unlocked: Boolean, 
                sleeping_xp_per_tick: Number,
                text_to_start: String
            }
        */

        this.light_level = light_level; //not really used for this type
        this.crafting = crafting;
        this.tags = tags;
        this.tags["safe_zone"] = true;
        this.entrance_rewards = entrance_rewards;
        /* 
        crafting: {
            is_unlocked: Boolean, 
            use_text: String, 
            tiers: {
                crafting: Number,
                forging: Number,
                smelting: Number,
                cooking: Number,
                alchemy: Number,
                butchering: Number,
                woodworking: Number,
            }
        },
         */

        this.is_temperature_static = is_temperature_static; //true -> uses static temperature, either provided or default
        this.static_temperature = static_temperature;
        this.reverse_day_night_temperatures = reverse_day_night_temperatures; //true -> nights are warmer, days are colder
        this.temperature_range_modifier = temperature_range_modifier; //multiplier to how much temperature varies from base; lower value will make both max and min temps closer do base
        this.temperature_modifier = temperature_modifier; //flat modifier to temperature, applied AFTER range modifier
        this.is_under_roof = is_under_roof; //only for weather display
    }
    /**
     * The shown name. this.name stays the canonical English: main.js compares a
     * location id against it and hands it to unlock_activity as a key, so it is
     * part of the identity and can never be replaced.
     */
    getName() {
        return translationManager.getDisplayName(language, this.name);
    }
}

class Combat_zone {
    constructor({name, 
                id,
                 description, 
                 getDescription,
                 is_unlocked = true, 
                 is_finished = false,
                 types = [], //{type, xp_gain}
                 enemy_groups_list = [],
                 is_enemy_groups_list_random = true,
                 predefined_lineup_on_nth_group = 1,
                 enemies_list = [], 
                 enemy_group_size = [1,1],
                 enemy_count = 30,
                 enemy_stat_variation = 0,
                 parent_location, 
                 leave_text,
                 first_reward = {},
                 repeatable_reward = {},
                 rewards_with_clear_requirement = [],
                 otherUnlocks,
                 unlock_text,
                 is_challenge = false,
                 tags = {},
                 is_temperature_static = false,
                 static_temperature = null,
                 reverse_day_night_temperatures = false,
                 temperature_range_modifier = 1,
                 temperature_modifier = 0,
                 is_under_roof = false,
                 display_conditions = [], //see the Location constructor; Combat_zone is a separate class, not a subclass
                }) {

        this.name = name;
        this.id = id;
        this.unlock_text = unlock_text;
        this.display_conditions = [display_conditions];
        this.description = description;
        //A static description is a TEXT ID; a getDescription passed in resolves its
        //own text, because it branches on game state and each branch is its own id.
        this.getDescription = getDescription || function(){
            return description ? translationManager.getText(language, description) : description;
        }
        this.otherUnlocks = otherUnlocks || function() {return;} //try not to use it if possible
        this.is_unlocked = is_unlocked;
        this.is_finished = is_finished;
        this.types = types; //special properties of the location, e.g. "narrow" or "dark"
        this.enemy_groups_list = enemy_groups_list; //predefined enemy teams, names only
        this.is_enemy_groups_list_random = is_enemy_groups_list_random; //only used when enemy_groups_list is present; false will result in enemy groups being used in the provided order
        this.predefined_lineup_on_nth_group = predefined_lineup_on_nth_group; //if not 0, every nth fight will be from enemy_groups_list instead of randomized from enemies_list
        this.enemies_list = enemies_list; //possible enemies (to be used if there's no enemy_groups_list or if it exists but is to only be used every n fights), names only
        this.enemy_group_size = enemy_group_size; // [min, max], used only if enemy_groups_list is not provided
        if(!this.enemy_groups_list){
            if(this.enemy_group_size[0] < 1) {
                this.enemy_group_size[0] = 1;
                console.error(`Minimum enemy group size in zone "${this.name}" is set to unallowed value of ${this.enemy_group_size[0]} and was corrected to lowest value possible of 1`);
            }
            if(this.enemy_group_size[0] > 8) {
                this.enemy_group_size[0] = 8;
                console.error(`Minimum enemy group size in zone "${this.name}" is set to unallowed value of ${this.enemy_group_size[0]} and was corrected to highest value possible of 8`);
            }
            if(this.enemy_group_size[1] < 1) {
                this.enemy_group_size[1] = 1;
                console.error(`Maximum enemy group size in zone "${this.name}" is set to unallowed value of ${this.enemy_group_size[1]} and was corrected to lowest value possible of 1`);
            }
            if(this.enemy_group_size[1] > 8) {
                this.enemy_group_size[1] = 8;
                console.error(`Maximum enemy group size in zone "${this.name}" is set to unallowed value of ${this.enemy_group_size[1]} and was corrected to highest value possible of 8`);
            }
        }
        this.enemy_count = enemy_count; //how many enemy groups need to be killed for the clearing reward

        if(this.enemy_groups_list.length == 0 && this.enemies_list.length == 0 ) {
            throw new Error(`No enemies provided for zone "${this.name}"`);
        }

        this.enemy_groups_killed = 0; //killcount for clearing

        this.enemy_stat_variation = enemy_stat_variation; // e.g. 0.1 means each stat can go 10% up/down from base value; random for each enemy in group
        if(this.enemy_stat_variation < 0) {
            this.enemy_stat_variation = 0;
            console.error(`Stat variation for enemies in zone "${this.name}" is set to unallowed value and was corrected to a default 0`);
        }

        this.parent_location = parent_location;

        //A TEXT ID. Read through translationManager where it is displayed, since
        //Combat_zone hands it to the travel list rather than rendering it itself.
        this.leave_text = leave_text; //text on option to leave
        this.first_reward = first_reward; //reward for first clear
        this.repeatable_reward = repeatable_reward; //reward for each clear, including first; all unlocks should be in this, just in case
        this.rewards_with_clear_requirement = rewards_with_clear_requirement; //rewards that are only given on N-th clear

        this.is_challenge = is_challenge;
        //challenges can be completed only once 

        //skills and their xp gain on every tick, based on location types;
        this.gained_skills = this.types
            ?.map(type => {return {skill: skills[location_types[type.type].stages[type.stage || 1].related_skill], xp: type.xp_gain}})
            .filter(skill => skill.skill);
       
        const temp_types = this.types.map(type => type.type);
        if(temp_types.includes("bright")) {
            this.light_level = "bright";
        }
        else if(temp_types.includes("dark")) {
            this.light_level = "dark";
        } else {
            this.light_level = "normal";
        }

        this.tags = tags;
        this.tags["combat zone"] = true;

        this.is_temperature_static = is_temperature_static; //true -> uses static temperature, either provided or default
        this.static_temperature = static_temperature;
        this.reverse_day_night_temperatures = reverse_day_night_temperatures; //true -> nights are warmer, days are colder
        this.temperature_range_modifier = temperature_range_modifier; //flat modifier to how much temperature varies from base
        this.temperature_modifier = temperature_modifier; //flat modifier to temperature, applied AFTER range modifier
        this.is_under_roof = is_under_roof; //only for weather display
    }

    get_next_enemies() {

        const enemies = [];
        let enemy_group = [];

        if(this.enemy_groups_list.length > 0 && this.enemy_groups_killed%this.predefined_lineup_on_nth_group == 0 && (this.enemy_groups_killed > 0 || this.predefined_lineup_on_nth_group == 0)) { // PREDEFINED GROUPS EXIST

            if(this.is_enemy_groups_list_random) { 
                //choose randomly
                const index = Math.floor(Math.random() * this.enemy_groups_list.length);
                enemy_group = this.enemy_groups_list[index].enemies; //names
            } else { 
                //choose in order provided
                const index = this.enemy_groups_killed % this.enemy_groups_list.length;
                enemy_group = this.enemy_groups_list[index].enemies; //names
            }
            

        } else {  // PREDEFINED GROUPS DON'T EXIST

            const group_size = this.enemy_group_size[0] + Math.round(Math.random() * (this.enemy_group_size[1] - this.enemy_group_size[0]));
            for(let i = 0; i < group_size; i++) {
                enemy_group.push(this.enemies_list[Math.floor(Math.random() * this.enemies_list.length)]);
            }
        }
 
        for(let i = 0; i < enemy_group.length; i++) {
            const enemy = enemy_templates[enemy_group[i]];
            let newEnemy;

            if(this.enemy_stat_variation != 0) {

                const variation = Math.random() * this.enemy_stat_variation;

                const base = 1 + variation;
                const vary = 2 * variation;
                newEnemy = new Enemy({...enemy,
                    stats: {
                        health: Math.round(enemy.stats.health * (base - Math.random() * vary)),
                        attack: Math.round(enemy.stats.attack * (base - Math.random() * vary)),
                        agility: Math.round(enemy.stats.agility * (base - Math.random() * vary)),
                        dexterity: Math.round(enemy.stats.dexterity * (base - Math.random() * vary)),
                        magic: Math.round(enemy.stats.magic * (base - Math.random() * vary)),
                        intuition: Math.round(enemy.stats.intuition * (base - Math.random() * vary)),
                        attack_speed: Math.round(enemy.stats.attack_speed * (base - Math.random() * vary) * 100) / 100,
                        attack_count: Math.round((enemy.stats.attack_count || 1) * (base - Math.random() * vary)),
                        defense: Math.round(enemy.stats.defense * (base - Math.random() * vary))
                    },
                });
            } else {
                newEnemy = new Enemy({...enemy, stats: {...enemy.stats, attack_count: enemy.stats.attack_count || 1}});
            }
            newEnemy.is_alive = true;

            enemies.push(newEnemy);
        }
        return enemies;
    }

    //calculates total penalty with and without hero skills
    //launches on every combat action (which is probably suboptimal as it could instead be stored and recalculated only on skill change)
    get_total_effect() {
        const effects = {multipliers: {}, flats: {}};
        const hero_effects = {multipliers: {}, flats: {}};
        
        //iterate over types of location
        for(let i = 0; i < this.types.length; i++) {
            const type = location_types[this.types[i].type].stages[this.types[i].stage];

            if(!type.related_skill || !type.effects) { 
                continue; 
            }

            //iterate over effects each type has 

            Object.keys(type.effects).forEach(stat => { 
                if(type.effects[stat].multiplier) {
                    effects.multipliers[stat] = (effects.multipliers[stat] || 1) * type.effects[stat].multiplier;
                
                    hero_effects.multipliers[stat] = (hero_effects.multipliers[stat] || 1) * get_location_type_penalty(this.types[i].type, this.types[i].stage, stat, "multiplier");
                }

                if(type.effects[stat].flat) {
                    effects.flats[stat] = (effects.flats[stat] || 0) + type.effects[stat].flat;
                
                    hero_effects.flats[stat] = (hero_effects.flats[stat] || 0) + get_location_type_penalty(this.types[i].type, this.types[i].stage, stat, "flat");
                }

            })
        }

        

        return {base_penalty: effects, hero_penalty: hero_effects};
    }
    /**
     * The shown name. this.name stays the canonical English: main.js compares a
     * location id against it and hands it to unlock_activity as a key, so it is
     * part of the identity and can never be replaced.
     */
    getName() {
        return translationManager.getDisplayName(language, this.name);
    }
}

class Challenge_zone extends Combat_zone {
    constructor(data) 
    {
        super({...data, enemy_stat_variation: 0, is_challenge: true});
    }
}

class LocationActivity{
    constructor({activity_name, 
                 starting_text, 
                 get_payment = ()=>{return 1},
                 is_unlocked = true, 
                 working_period = 1,
                 infinite = true,
                 availability_time,
                 availability_seasons,
                 gained_skills, //{skill_1: xp_gain, skill_2: xp_gain, ...}
                 skill_xp_per_tick = 1, //only used for default skills (attached to activity of activity_name key in activities)
                 xp_given_per_working_period = false, //true => xp every working period, false => xp every in-game minute
                 unlock_text,
                 gained_resources,
                 require_tool = false,
                 applied_effects = [],
                })
    {
        this.activity_name = activity_name; //name of activity from activities.js
        this.starting_text = starting_text; //TEXT ID for the button that starts it

        /** The button label, resolved. this.starting_text holds the id. */
        this.getStartingText = () => translationManager.getText(language, this.starting_text);

        /** The unlock message, or undefined when the activity has none. */
        this.getUnlockText = () => this.unlock_text
            ? translationManager.getText(language, this.unlock_text)
            : this.unlock_text;

        this.get_payment = get_payment;
        this.is_unlocked = is_unlocked;
        this.unlock_text = unlock_text;
        this.working_period = working_period; //if exists -> time that needs to be worked to earn anything; only for jobs
        this.infinite = infinite; //if true -> can be done 24/7, otherwise requires availability time/season

        if(availability_time && availability_seasons) {
            this.infinite = false;
        }

        if(!this.infinite) {
            if(!(availability_seasons || availability_time)) {
                console.error("Activity is set to limited availability, but has neither availability_seasons nor availability_time provided for it");
            }
        } else if((availability_time || availability_seasons)) {
            this.infinite = false;
        }
        
        this.availability_time = availability_time; //if not infinite -> hours between which it's available; used only for work and for training
        this.availability_seasons = availability_seasons; //if not infinite -> seasons when it's available; used for work and for training

        this.gained_skills = gained_skills;
        this.skill_xp_per_tick = skill_xp_per_tick.length ? skill_xp_per_tick : [skill_xp_per_tick]; //skill xp gained per game tick (default -> 1 in-game minute)

        this.require_tool = require_tool; //if false, can be started without tool equipped

        this.applied_effects = applied_effects;

        this.gained_resources = gained_resources; 
        /*
            {
                resources: [{name, ammount: [[min,max], [min,max]], chance: [min,max]}], 
                time_period: [min,max], 
                skill_required: [min_efficiency, max_efficiency]
                scales_with_skill: deprecated, all checks are done through 'skill_required'
                roll_quality: boolean, whether dropped items have quality
            }
        */
        //every 2-value array is oriented [starting_value, value_with_required_skill_level], except for subarrays of ammount (which are for randomizing gained item count) and for skill_required
        //                                                                                   (ammount array itself follows the mentioned orientation)
        //ammounts can be skipped if they are meant to be [[1,1],[1,1]] (auto-filled just below the comments)
        //value start scaling after reaching min_efficiency skill lvl, before that they are just all at min
        //skill required refers to level of every skill

        for(let i = 0; i < this.gained_resources?.resources.length; i++) {
            if(!this.gained_resources.resources[i].ammount) {
                this.gained_resources.resources[i].ammount = [[1,1],[1,1]];
            }
        }
    }

    getActivityEfficiency = function () {
        let gathering_time_needed = this.working_period;
        const gained_resources = [];

        if (!this.gained_resources) {
            return {gathering_time_needed, gained_resources};
        }

        let skill_modifier = 1;
        if(this.gained_resources.skill_required && this.gained_resources.skill_required.length == 2){
            let skill_level_sum = 0;
            for (let i = 0; i < activities[this.activity_name].base_skills_names?.length; i++) {
                skill_level_sum += get_skill_modifier(activities[this.activity_name].base_skills_names[i], this.gained_resources.skill_required);
            }
            skill_modifier = (skill_level_sum/(activities[this.activity_name].base_skills_names?.length || 1));
        }
        gathering_time_needed = Math.floor(slerp(this.gained_resources.time_period, skill_modifier));

        for(let i = 0; i < this.gained_resources.resources.length; i++) {

            const chance = slerp(this.gained_resources.resources[i].chance, skill_modifier);
            const min = Math.round(slerp([this.gained_resources.resources[i].ammount[0][0], this.gained_resources.resources[i].ammount[1][0]], skill_modifier));
            const max = Math.round(slerp([this.gained_resources.resources[i].ammount[0][1], this.gained_resources.resources[i].ammount[1][1]], skill_modifier));
            gained_resources.push({name: this.gained_resources.resources[i].name, count: [min,max], chance: chance});
        }

        if (!this.gained_resources.roll_quality) {
            return { gathering_time_needed, gained_resources };
        }
        else {
            const skill = skills[activities[this.activity_name].base_skills_names[0]];
            const quality_cap = Math.min(Math.round(100+2*get_total_skill_level(skill.skill_id)),200);
            const quality = (3 * get_total_skill_level(skill.skill_id) - skill.max_level) + 130/* + (15 * tier)*/;
            const quality_range = [
                clamp(Math.round(quality - 15), 10, quality_cap),
                clamp(Math.round(quality + 10), 10, quality_cap),
            ];
            return { gathering_time_needed, gained_resources, quality_range}
        }
    }
}

class LocationGatheringActivity extends LocationActivity{
    constructor(data) {
        super(data);
        this.xp_given_per_working_period = true;
    }
}

class LocationType{
    constructor({name, related_skill, scaling_lvl, stages = {}}) {
        this.name = name;
        this.scaling_lvl = scaling_lvl;

        if(related_skill) {
            if(!skills[related_skill]) {
                throw new Error(`No such skill as "${related_skill}"`);
            }
            else { 
                this.related_skill = related_skill; //one per each; skill xp defined in location/combat_zone
            }
        }
        this.stages = stages; //up to 3
        /* 
        >number<: {
            description,
            related_skill,
            effects,
            applied_effects // relates to active_effects, just like same-named property on activities
        }

        */
    }
    /**
     * The shown name. this.name stays the canonical English: main.js compares a
     * location id against it and hands it to unlock_activity as a key, so it is
     * part of the identity and can never be replaced.
     */
    getName() {
        return translationManager.getDisplayName(language, this.name);
    }
}

function get_location_type_penalty(type, stage, stat, category) {
    
    const skill = skills[location_types[type].stages[stage].related_skill];

    //maybe give all stages a range of skill lvls where they start scaling and where they get fully nullified?

    const scaling_lvl = location_types[type].stages[stage].scaling_lvl || skill.max_level;

    if(category === "multiplier") {
        const base = location_types[type].stages[stage].effects[stat].multiplier;
    
        return base**(1- Math.min(scaling_lvl,get_total_skill_level(skill.skill_id))/scaling_lvl);
    } else if(category === "flat") {
        const base = location_types[type].stages[stage].effects[stat].flat;

        return base*(1-Math.min(scaling_lvl,get_total_skill_level(skill.skill_id))/scaling_lvl)**0.66667;
    } else {
        throw new Error(`Unsupported category of stat effects "${category}", should be either "flat" or "multiplier"!`);
    }
    
}

//create location types
(function(){ 
    location_types["bright"] = new LocationType({
        name: "bright",
        stages: {
            1: {
                description: "desc loctype bright 1",
            },
            2: {
                description: "desc loctype bright 2",
                related_skill: "Dazzle resistance",
                effects: {
                    attack_points: {multiplier: 0.5},
                    evasion_points: {multiplier: 0.5},
                }
            },
            3: {
                description: "desc loctype bright 3",
                related_skill: "Dazzle resistance",
                effects: {
                    attack_points: {multiplier: 0.1},
                    evasion_points: {multiplier: 0.1},
                }
            }
        }
    });
    location_types["dark"] = new LocationType({
        name: "dark",
        stages: {
            1: {
                description: "desc loctype dark 1",
                related_skill: "Night vision",
                //no effects here, since in this case they are provided via the overall "night" penalty
            },
            2: {
                description: "desc loctype dark 2",
                related_skill: "Night vision",
                effects: {
                    //they dont need to be drastic since they apply on top of 'night' penalty
                    attack_points: {multiplier: 0.8},
                    evasion_points: {multiplier: 0.8},
                }
            },
            3: {
                description: "desc loctype dark 3",
                related_skill: "Presence sensing",
                effects: {
                    attack_points: {multiplier: 0.15},
                    evasion_points: {multiplier: 0.15},
                }
            }
        }
    });
    location_types["narrow"] = new LocationType({
        name: "narrow",
        stages: {
            1: {
                description: "desc loctype narrow 1",
                related_skill: "Tight maneuvers",
                scaling_lvl: 20,
                effects: {
                    evasion_points: {multiplier: 0.5},
                }
            },
            2: {
                description: "desc loctype narrow 2",
                related_skill: "Tight maneuvers",
                effects: {
                    evasion_points: {multiplier: 0.333},
                },
                scaling_lvl: 40,
            },
            3: {
                description: "desc loctype narrow 3",
                related_skill: "Tight maneuvers",
                effects: {
                    evasion_points: {
                        multiplier: 0.1
                    },
                    dexterity: {
                        multiplier: 0.5,
                    }
                }        
            },
            4: {
                description: "desc loctype narrow 4",
                related_skill: "Tight maneuvers",
                effects: {
                    evasion_points: {
                        multiplier: 0.05
                    },
                    dexterity: {
                        multiplier: 0.5,
                    }
                },
                scaling_lvl: 50,
            }
        }
    });
    location_types["open"] = new LocationType({
        name: "open",
        stages: {
            1: {
                description: "desc loctype open 1",
                related_skill: "Spatial awareness",
                scaling_lvl: 30,
                effects: {
                    evasion_points: {multiplier:  0.75},
                }
            },
            2: {
                description: "desc loctype open 2",
                related_skill: "Spatial awareness",
                effects: {
                    evasion_points: {multiplier: 0.5},
                }
            }
        }
    });
    location_types["thin air"] = new LocationType({
        name: "thin air",
        stages: {
            1: {
                description: "desc loctype thin air 1",
                related_skill: "Breathing",
                scaling_lvl: 25,
                effects: {
                    stamina_efficiency: {multiplier: 0.5},
                    agility: {multiplier: 0.8},
                    strength: {multiplier: 0.8},
                    dexterity: {multiplier: 0.8},
                    intuition: {multiplier: 0.8},
                }
            },
            2: {
                description: "desc loctype thin air 2",
                related_skill: "Breathing",
                effects: {
                    stamina_efficiency: {multiplier: 0.1},
                    agility: {multiplier: 0.5},
                    strength: {multiplier: 0.5},
                    dexterity: {multiplier: 0.5},
                    intuition: {multiplier: 0.5},
                }
            }
        }
    });
    location_types["eldritch"] = new LocationType({
        name: "eldritch",
        stages: {
            1: {
                description: "desc loctype eldritch 1",
                related_skill: "Strength of mind",
                scaling_lvl: 30,
                effects: {
                    agility: {multiplier: 0.8},
                    dexterity: {multiplier: 0.8},
                    intuition: {multiplier: 0.5},
                    stamina_efficiency: {multiplier: 0.75},
                    health_loss_flat: {flat: -5},
                }
            },
            2: {
                description: "desc loctype eldritch 2",
                related_skill: "Strength of mind",
                effects: {
                    agility: {multiplier: 0.3},
                    dexterity: {multiplier: 0.3},
                    intuition: {multiplier: 0.2},
                    stamina_efficiency: {multiplier: 0.5},
                    health_loss_flat: {flat: -50},
                }
            }
        }
    });
	location_types["rough"] = new LocationType({
        name: "rough",
        stages: {
            1: {
                description: "desc loctype rough 1",
                related_skill: "Scrambling",
                scaling_lvl: 20, 
                effects: {
                    agility: {multiplier: 0.5},
                    dexterity: {multiplier: 0.5},
                    attack_points: {multiplier: 0.5},
                    evasion_points: {multiplier: 0.5},
					attack_speed: {multiplier: 0.7},
                }
            },
            2: {
                description: "desc loctype rough 2",
                related_skill: "Scrambling",
				scaling_lvl: 30,
                effects: {
                    agility: {multiplier: 0.2},
                    dexterity: {multiplier: 0.2},
                    attack_points: {multiplier: 0.2},
                    evasion_points: {multiplier: 0.2},
					attack_speed: {multiplier: 0.4},
                }
            },
			3: {
                description: "desc loctype rough 3",
                related_skill: "Scrambling",
				scaling_lvl: 60, //not implemented, intended for if in slick high viscosity fluids above waist height
                effects: {
                    agility: {multiplier: 0.08},
                    dexterity: {multiplier: 0.08},
                    attack_points: {multiplier: 0.08},
                    evasion_points: {multiplier: 0.08},
					attack_speed: {multiplier: 0.15},
                }
            }
        }
    });
    location_types["wet"] = new LocationType({
        name: "wet",
        stages: {
            1: {
                description: "desc loctype wet 1",
                applied_effects: [{effect: "Wet", duration: 30}]
            }
        }
    });

    location_types["aquatic"] = new LocationType({
        name: "aquatic",
        stages: {
            1: {
                description: "desc loctype aquatic 1",
                related_skill: "Swimming",
                scaling_lvl: 30,
                effects: {
                    agility: {multiplier: 0.75},
                    dexterity: {multiplier: 0.75},
                    stamina_efficiency: {multiplier: 0.75},
                },
                applied_effects: [{effect: "Wet", duration: 30}]
            },
            2: {
                description: "desc loctype aquatic 2",
                related_skill: "Swimming",
                scaling_lvl: 40,
                effects: {
                    agility: {multiplier: 0.5},
                    dexterity: { multiplier: 0.5 },
                    attack_speed: {multiplier: 0.5 },
                    stamina_efficiency: { multiplier: 0.5 },
                },
                applied_effects: [{effect: "Wet", duration: 30}]
            },
            3: {
                description: "desc loctype aquatic 3",
                related_skill: "Swimming",
                effects: {
                    agility: {multiplier: 0.1},
                    dexterity: {multiplier: 0.1},
                    attack_speed: {multiplier: 0.25},
                    stamina_efficiency: {multiplier: 0.25}
                },
                applied_effects: [{effect: "Wet", duration: 30}]
            },
            4: {
                description: "desc loctype aquatic 4",
                related_skill: "Swimming",
                effects: {
                    agility: {multiplier: 0.01},
                    dexterity: {multiplier: 0.01},
                    attack_speed: {multiplier: 0.1},
                    stamina_efficiency: {multiplier: 0.1},
                    health_loss_flat: {flat: -1000},
                },
                applied_effects: [{effect: "Wet", duration: 30}]
            }
        }
    });
})();

//create locations and zones
(function(){ 
    locations["Village"] = new Location({ 
        getDescription: function() {
            let base_text = translationManager.getText(language, "desc location Village dyn 1")
            //todo: change text after bridge is built
            if(locations["Infested field"].enemy_groups_killed >= 5 * locations["Infested field"].enemy_count) { 
                base_text += translationManager.getText(language, "desc location Village dyn 2");
            } else if(locations["Infested field"].enemy_groups_killed >= 2 * locations["Infested field"].enemy_count) {
                base_text += translationManager.getText(language, "desc location Village dyn 3");
            } else {
                base_text += translationManager.getText(language, "desc location Village dyn 4");
            }

            return base_text + translationManager.getText(language, "desc location Village dyn 5", {
                bridge: translationManager.getText(language, locations["Village"].actions["bridge construction"].is_finished
                    ? "desc location Village bridge built" : "desc location Village bridge none"),
                villagers: translationManager.getText(language, locations["Infested woods"].enemy_groups_killed >= locations["Infested woods"].enemy_count
                    ? "desc location Village villagers busy" : "desc location Village villagers idle"),
            });
        },
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Village 1")];
            if(current_game_time.hour > 4 && current_game_time.hour <= 20) {
                noises.push(translationManager.getText(language, "noise Village 2"), translationManager.getText(language, "noise Village 3"), translationManager.getText(language, "noise Village 4"), translationManager.getText(language, "noise Village 5"));

                if(locations["Infested field"].enemy_groups_killed <= 3) {
                    noises.push(translationManager.getText(language, "noise Village 6"));
                    if(is_rat()) {
                        //you can blame Mercurius for this line
                        //pasted 3 times for increased chance
                        noises.push(translationManager.getText(language, "noise Village 7"),translationManager.getText(language, "noise Village 7"),translationManager.getText(language, "noise Village 7"));
                    }
                } else if(is_rat()) {
                    //also possible after clear condition is done, but less common
                    noises.push(translationManager.getText(language, "noise Village 7"));
                }
            }

            if(current_game_time.hour > 3 && current_game_time.hour < 10) {
                noises.push(translationManager.getText(language, "noise Village 8"), translationManager.getText(language, "noise Village 9"));
            } else if(current_game_time.hour > 18 && current_game_time.hour < 22) {
                noises.push(translationManager.getText(language, "noise Village 10"));
            } 

            if(current_game_time.hour > 8 && current_game_time.hour < 10) {     //limited timeframe because rumors, and also that Oblivion reference should be obscure
                noises.push(translationManager.getText(language, "noise Village 11"), translationManager.getText(language, "noise Village 12"));
            } else if(current_game_time.hour > 16 && current_game_time.hour < 18) {
                noises.push(translationManager.getText(language, "noise Village 13"));
            } 

            return noises;
        },
        dialogues: ["village elder", "village guard", "old craftsman"],
        traders: ["village trader"],
        market_region: "Village",
        name: "Village", 
        crafting: {
            is_unlocked: true, 
            use_text: "ui craft use Village", 
            tiers: {
                crafting: 1,
                forging: 1,
                smelting: 1,
                cooking: 1,
                alchemy: 1,
                butchering: 1,
                woodworking: 1,
            }
        },
    });

    locations["Shack"] = new Location({
        connected_locations: [{location: locations["Village"], custom_text: "travel Go outside to [Village]", travel_time: 10}],
        description: "desc location Shack",
        name: "Shack",
        is_unlocked: false,
        housing: {
            is_unlocked: true,
            text_to_sleep: "ui sleep Shack",
            sleeping_xp_per_tick: 1},
        temperature_range_modifier: 0.4,
        is_under_roof: true,
    });

    locations["Village"].connected_locations.push({location: locations["Shack"], travel_time: 10});
    //remember to always add it like that, otherwise travel will be possible only in one direction and location might not even be reachable

    locations["Eastern mill"] = new Location({
        name: "Eastern mill",
        is_unlocked: false,
        connected_locations: [{location: locations["Village"], travel_time: 30, custom_text: "travel Go outside to [Village]"}],
        description: "desc location Eastern mill",
        getBackgroundNoises: function() {
            let noises = [
                translationManager.getText(language, "noise Eastern mill 1"), translationManager.getText(language, "noise Eastern mill 2"), 
                translationManager.getText(language, "noise Eastern mill 3"),translationManager.getText(language, "noise Eastern mill 4"),
                translationManager.getText(language, "noise Eastern mill 5"), translationManager.getText(language, "noise Eastern mill 6"), 
            ];

            if(is_rat()) {
                noises.push(translationManager.getText(language, "noise Eastern mill 7"));
            }

            if(global_flags.is_mofu_mofu_enabled) {
                noises.push(translationManager.getText(language, "noise Eastern mill 8"), translationManager.getText(language, "noise Eastern mill 9"));
            }

            if(current_game_time.hour > 20 ) {
                noises.push(translationManager.getText(language, "noise Eastern mill 10"), translationManager.getText(language, "noise Eastern mill 11"), translationManager.getText(language, "noise Eastern mill 12"));
            } else if(current_game_time.hour < 4) {
                noises.push(translationManager.getText(language, "noise Eastern mill 13"), translationManager.getText(language, "noise Eastern mill 14"));
            } 

            return noises;
        },
        dialogues: ["village millers"],
    });
    locations["Village"].connected_locations.push({location: locations["Eastern mill"], travel_time: 30});

    locations["Eastern storehouse"] = new Combat_zone({
        name: "Eastern storehouse",
        is_unlocked: false,
        description: "",
        enemies_list: ["Wolf rat"],
        types: [{type: "narrow", stage: 1, xp_gain: 3}, {type: "dark", stage: 1, xp_gain: 2}],
        enemy_count: 25,
        enemy_group_size: [3,5],
        enemy_stat_variation: 0.2,
        parent_location: locations["Eastern mill"],
        first_reward: {
            xp: 40,
        },
        repeatable_reward: {
            textlines: [{dialogue: "village millers", lines: ["cleared storage"]}],
            locks: {
                locations: ["Eastern storehouse"]
            }, 
            move_to: {location: "Eastern mill"},
        },
        temperature_range_modifier: 0.8,
        is_under_roof: true,   
    });
    locations["Eastern mill"].connected_locations.push({location: locations["Eastern storehouse"], travel_time: 10});

    locations["Infested field"] = new Combat_zone({
        description: "desc location Infested field",
        enemy_count: 15, 
        enemies_list: ["Starving wolf rat", "Wolf rat"],
        types: [{type: "open", stage: 1, xp_gain: 1}],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "Infested field", 
        parent_location: locations["Village"],
        first_reward: {
            xp: 10,
            reputation: {Village: 20},
        },
        repeatable_reward: {
            textlines: [
                {dialogue: "village elder", lines: ["cleared field", "cleared field alt",]},
            ],
            xp: 5,
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 2,
                reputation: {Village: 10},
            },
            {
                required_clear_count: 4,
                reputation: {Village: 30},
            },
            {
                required_clear_count: 10,
                reputation: {Village: 50},
            }
        ]
    });
    locations["Village"].connected_locations.push({location: locations["Infested field"], travel_time: 15});

    locations["Infested woods"] = new Combat_zone({
        description: "",
        enemy_count: 40,
        enemies_list: ["Huge dragonfly"],
        types: [{type: "narrow", stage: 1, xp_gain: 4}],
        enemy_groups_list: [{enemies: ["Dragonfly queen", "Huge dragonfly", "Huge dragonfly", "Huge dragonfly", "Huge dragonfly", "Huge dragonfly"]}],
        predefined_lineup_on_nth_group: 5,
        enemy_group_size: [6,6],
        enemy_stat_variation: 0.2,
        is_unlocked: false,
        name: "Infested woods",
        leave_text: "loc Infested woods leave",
        parent_location: locations["Village"],
        first_reward: {
            xp: 1500,
        },
        repeatable_reward: {
            textlines: [{dialogue: "village elder", lines: ["dragonflies killed"]}],
            xp: 750,
        },
    });

    locations["Village"].connected_locations.push({location: locations["Infested woods"], travel_time: 40});


    locations["Nearby cave"] = new Location({ 
        connected_locations: [{location: locations["Village"], custom_text: "travel Go outside and to the [Village]", travel_time: 60}], 
        getDescription: function() {
            if(locations["Pitch black tunnel"].enemy_groups_killed >= locations["Pitch black tunnel"].enemy_count) { 
                return translationManager.getText(language, "desc location Nearby cave dyn 1");
            }
            else if(locations["Hidden tunnel"].enemy_groups_killed >= locations["Hidden tunnel"].enemy_count) { 
                return translationManager.getText(language, "desc location Nearby cave dyn 2");
            }
            else if(locations["Cave depths"].enemy_groups_killed >= locations["Cave depths"].enemy_count) { 
                return translationManager.getText(language, "desc location Nearby cave dyn 3");
            }
            else if(locations["Cave room"].enemy_groups_killed >= locations["Cave room"].enemy_count) {
                return translationManager.getText(language, "desc location Nearby cave dyn 4");
            } else {
                return translationManager.getText(language, "desc location Nearby cave dyn 5");
            }
        },
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Nearby cave 1"), translationManager.getText(language, "noise Nearby cave 2"), ];
            return noises;
        },
        temperature_range_modifier: 0.8,
        name: "Nearby cave",
        is_unlocked: false,
        is_under_roof: true,
    });
    locations["Village"].connected_locations.push({location: locations["Nearby cave"], travel_time: 60});
    //remember to always add it like that, otherwise travel will be possible only in one direction and location might not even be reachable

    locations["Cave room"] = new Combat_zone({
        description: "desc location Cave room",
        enemy_count: 25, 
        types: [{type: "narrow", stage: 1,  xp_gain: 3}, {type: "bright", stage:1}],
        enemies_list: ["Wolf rat"],
        enemy_group_size: [2,3],
        enemy_stat_variation: 0.2,
        is_unlocked: true, 
        name: "Cave room", 
        leave_text: "loc Cave room leave",
        parent_location: locations["Nearby cave"],
        temperature_range_modifier: 0.7,
        is_under_roof: true,
        first_reward: {
            xp: 30,
        },
        repeatable_reward: {
            textlines: [{dialogue: "village elder", lines: ["cleared room"]}],
            locations: [{location: "Cave depths"}],
            xp: 15,
            activities: [{location:"Nearby cave", activity:"weightlifting"}, {location:"Nearby cave", activity:"mining"}, {location:"Village", activity:"balancing"}],
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 1,
                reputation: {Village: 10},
            },
            {
                required_clear_count: 4,
                reputation: {Village: 20},
            },
        ],
    });
    locations["Nearby cave"].connected_locations.push({location: locations["Cave room"], travel_time: 5});

    locations["Cave depths"] = new Combat_zone({
        description: "desc location Cave depths",
        enemy_count: 40,
        types: [{type: "narrow", stage: 1,  xp_gain: 3}, {type: "dark", stage: 2, xp_gain: 3}],
        enemies_list: ["Wolf rat"],
        enemy_group_size: [5,8],
        enemy_stat_variation: 0.2,
        is_unlocked: false, 
        name: "Cave depths", 
        leave_text: "loc Cave depths leave",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 100,
        },
        repeatable_reward: {
            textlines: [{dialogue: "village elder", lines: ["cleared cave"]}],
            xp: 50,
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 4,
                locations: [{location: "Suspicious wall"}],
                reputation: {Village: 40},
            }
        ],
        temperature_range_modifier: 0.6,
        is_under_roof: true,
    });
    
    locations["Hidden tunnel"] = new Combat_zone({
        description: "desc location Hidden tunnel",
        enemy_count: 50, 
        types: [{type: "narrow", stage: 1,  xp_gain: 3}, {type: "dark", stage: 3, xp_gain: 1}],
        enemies_list: ["Elite wolf rat"],
        enemy_group_size: [1,2],
        enemy_stat_variation: 0.2,
        is_unlocked: false, 
        name: "Hidden tunnel", 
        leave_text: "loc Hidden tunnel leave",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 120,
        },
        repeatable_reward: {
            locations: [{location: "Pitch black tunnel"}],
            xp: 60,
            activities: [{location:"Nearby cave", activity:"mining2"}],
        },
        is_temperature_static: false,
        temperature_range_modifier: 0.5,
        is_under_roof: true,
        unlock_text: "loc Hidden tunnel unlock"
    });
    locations["Pitch black tunnel"] = new Combat_zone({
        description: "desc location Pitch black tunnel",
        enemy_count: 50,
        types: [{type: "narrow", stage: 1,  xp_gain: 6}, {type: "dark", stage: 3, xp_gain: 3}],
        enemies_list: ["Elite wolf rat"],
        enemy_group_size: [6,8],
        enemy_stat_variation: 0.2,
        is_unlocked: false,
        name: "Pitch black tunnel",
        leave_text: "loc Pitch black tunnel leave",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 520,
            messages: ["reward msg go up"],
        },
        repeatable_reward: {
            xp: 260,
            global_activities: ["climbing"],
            actions: [{location: "Nearby cave", action: "climb the mountain"}],
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 4,
                locations: [{location: "Mysterious gate"}],
            }
        ],
        is_temperature_static: true,
        static_temperature: 16,
        is_under_roof: true,
        unlock_text: "loc Pitch black tunnel unlock"
    });

    locations["Mysterious gate"] = new Combat_zone({
        description: "desc location Mysterious gate",
        enemy_count: 50, 
        types: [{type: "dark", stage: 3, xp_gain: 5}],
        enemies_list: ["Elite wolf rat guardian"],
        enemy_group_size: [6,8],
        enemy_stat_variation: 0.2,
        is_unlocked: false,
        name: "Mysterious gate", 
        leave_text: "loc Mysterious gate leave",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 2000,
        },
        repeatable_reward: {
            xp: 1000,
            activities: [{location:"Nearby cave", activity:"meditating"}, {location:"Nearby cave", activity:"mining3"}],
            actions: [{action: "open the gate", location:"Nearby cave"}],
            quest_progress: [
                {quest_id: "The Infinite Rat Saga", task_index: 0},
            ],
            flags: ["is_strength_proved"],
        },
        is_temperature_static: true,
        static_temperature: 18,
        is_under_roof: true,
        unlock_text: "loc Mysterious gate unlock"
    });

    locations["Nearby cave"].connected_locations.push(
        {location: locations["Cave depths"], travel_time: 20}, 
        {location: locations["Hidden tunnel"], custom_text: "travel Enter the [Hidden tunnel]", travel_time: 40}, 
        {location: locations["Pitch black tunnel"], custom_text: "travel Go into the [Pitch black tunnel]", travel_time: 60},
        {location: locations["Mysterious gate"], custom_text: "travel Go to the [Mysterious gate]", travel_time: 90}
    );

    locations["Writhing tunnel"] = new Combat_zone({
        description: "desc location Writhing tunnel",
        enemy_count: 50, 
        types: [{type: "dark", stage: 3, xp_gain: 5}, {type: "narrow", stage: 2, xp_gain: 5}, {type: "eldritch", stage: 1, xp_gain: 1}],
        enemies_list: ["Wall rat"],
        enemy_group_size: [4,4], //4, because they are on all 4 sides - left, right, above, below
        enemy_stat_variation: 0.2,
        is_unlocked: false,
        name: "Writhing tunnel", 
        leave_text: "loc Writhing tunnel leave",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 4000,
        },
        repeatable_reward: {
            xp: 2000,
            locations: [{location: "Mysterious depths"}],
            quest_progress: [
                {quest_id: "The Infinite Rat Saga", task_index: 2},
            ]
        },
        is_temperature_static: true,
        static_temperature: 20,
        is_under_roof: true,
        unlock_text: "loc Writhing tunnel unlock"
    });

    locations["Nearby cave"].connected_locations.push({location: locations["Writhing tunnel"], travel_time: 100});

    locations["Mysterious depths"] = new Location({ //not yet unlockable
        connected_locations: [{location: locations["Nearby cave"], custom_text: "travel Climb back up to the main level of [Nearby cave]", travel_time: 100}], 
        getDescription: function() {
            return translationManager.getText(language, "desc location Mysterious depths dyn 1");
        },
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Mysterious depths 1"), translationManager.getText(language, "noise Mysterious depths 2"), translationManager.getText(language, "noise Mysterious depths 3"), translationManager.getText(language, "noise Mysterious depths 4"), translationManager.getText(language, "noise Mysterious depths 5")];
            return noises;
        },
        name: "Mysterious depths",
        is_unlocked: false,
        unlock_text: "loc Mysterious depths unlock",
        is_temperature_static: true,
        static_temperature: 20,
        is_under_roof: true,
    });

    locations["Nearby cave"].connected_locations.push({location: locations["Mysterious depths"], custom_text: "travel Climb down to [Mysterious depths]", travel_time: 120});

    /*
        Behind the second gate. Small, warm, lit by nothing, and containing a
        cushion - which is the joke the rat has been waiting to land since before
        this fork.
    */
    locations["Throne room"] = new Location({
        connected_locations: [{location: locations["Mysterious depths"], travel_time: 20}],
        description: "desc location Throne room",
        dialogues: ["cute little rat"],
        name: "Throne room",
        is_unlocked: false,
        unlock_text: "loc Throne room unlock",
        getBackgroundNoises: function() {
            return [translationManager.getText(language, "noise Throne room 1"),
                    translationManager.getText(language, "noise Throne room 2")];
        },
        is_temperature_static: true,
        static_temperature: 26,
        is_under_roof: true,
    });

    locations["Mysterious depths"].connected_locations.push(
        {location: locations["Throne room"], custom_text: "travel Step through the second gate", travel_time: 20});

    locations["Forest road"] = new Location({ 
        connected_locations: [{location: locations["Village"], travel_time: 240}],
        description: "desc location Forest road",
        name: "Forest road",
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Forest road 1"), translationManager.getText(language, "noise Forest road 2"), translationManager.getText(language, "noise Forest road 3"), translationManager.getText(language, "noise Forest road 4")];

            return noises;
        },
        is_unlocked: false,
    });
    locations["Village"].connected_locations.push({location: locations["Forest road"], custom_text: "travel Leave the village towards [Forest road]", travel_time: 240});

    locations["Forest"] = new Combat_zone({
        description: "desc location Forest",
        enemies_list: ["Starving wolf", "Young wolf"],
        types: [{type: "narrow", stage: 1, xp_gain: 1}],
        enemy_count: 30, 
        enemy_stat_variation: 0.2,
        name: "Forest", 
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 60,
        },
        repeatable_reward: {
            xp: 30,
            locations: [{location:"Deep forest"}],
            activities: [{location:"Forest road", activity: "herbalism"}],
        },
    });
    locations["Forest road"].connected_locations.push({location: locations["Forest"], custom_text: "travel Leave the safe path and walk into the [Forest]", travel_time: 30});

    locations["Deep forest"] = new Combat_zone({
        description: "desc location Deep forest",
        enemies_list: ["Wolf", "Starving wolf", "Young wolf"],
        types: [{type: "narrow", stage: 1, xp_gain: 2}],
        enemy_count: 50, 
        enemy_group_size: [2,3],
        enemy_stat_variation: 0.2,
        is_unlocked: false,
        name: "Deep forest", 
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 300,
        },
        repeatable_reward: {
            xp: 150,
            flags: ["is_strength_proved"],
            activities: [{location:"Forest road", activity: "woodcutting"}],
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 4,
                actions: [{action: "follow the trail", location:"Forest road"}]
            }
        ],
    });
    locations["Forest road"].connected_locations.push({location: locations["Deep forest"], custom_text: "travel Venture into the [Deep forest]", travel_time: 60});

    locations["Forest clearing"] = new Combat_zone({
        description: "desc location Forest clearing",
        enemies_list: ["Boar"],
        enemy_count: 50,
        enemy_group_size: [4,7],
        is_unlocked: false,
        enemy_stat_variation: 0.2,
        name: "Forest clearing", 
        types: [{type: "open", stage: 2, xp_gain: 7}],
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 1000,
        },
        repeatable_reward: {
            xp: 500,
            textlines: [{dialogue: "farm supervisor", lines: ["defeated boars"]}],
            activities: [{location: "Forest road", activity: "woodcutting2"}],
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 5,
                actions: [{action: "What was that noise?", location:"Forest road"}]
            }
        ],
    });
    locations["Forest road"].connected_locations.push({location: locations["Forest clearing"], custom_text: "travel Go towards the [Forest clearing] in the north", travel_time: 60});

    locations["Carya Canyon"] = new Location({ 
        connected_locations: [{location: locations["Forest road"], travel_time: 300}],
        description: "desc location Carya Canyon",
        name: "Carya Canyon",
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Carya Canyon 1"), translationManager.getText(language, "noise Carya Canyon 2"), translationManager.getText(language, "noise Carya Canyon 3")];

            return noises;
        },
        is_unlocked: false,
    });
    locations["Forest road"].connected_locations.push({location: locations["Carya Canyon"], custom_text: "travel Hike to [Carya Canyon]", travel_time: 120});
    
    locations["Precarious tree bridge"] = new Challenge_zone({
        description: "desc location Precarious tree bridge",
        enemy_count: 1, 
        types: [],
        enemies_list: ["Warthog"],
        enemy_group_size: [1,1],
        enemy_stat_variation: 0,
        is_unlocked: false, 
        name: "Warthog", 
        leave_text: "loc Precarious tree bridge leave",
        parent_location: locations["Carya Canyon"],
        repeatable_reward: {
            activities: [
                {location:"Carya Canyon", activity: "woodcutting"},
                {location:"Carya Canyon", activity: "herbalism"},
            ],
        },
        unlock_text: "loc Precarious tree bridge unlock",
        is_under_roof: false,
        temperature_range_modifier: 1,
    });
    locations["Carya Canyon"].connected_locations.push({location: locations["Precarious tree bridge"], custom_text: "travel To to cross the [Precarious tree bridge]", travel_time: 30});
    
    locations["Forest den"] = new Combat_zone({
        description: "desc location Forest den",
        enemies_list: ["Direwolf"],
        enemy_count: 50,
        enemy_group_size: [2,3],
        enemy_groups_list: [{enemies: ["Direwolf hunter"]}],
        predefined_lineup_on_nth_group: 4,
        is_unlocked: false,
        enemy_stat_variation: 0.2,
        name: "Forest den", 
        types: [{type: "narrow", stage: 2, xp_gain: 5}, {type: "dark", stage: 2, xp_gain: 5}],
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 1000,
            items: ["Warrior's necklace"],
        },
        repeatable_reward: {
            xp: 500,
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 2,
                actions: [{action: "search predator", location:"Forest road"}]
            },
            {
                required_clear_count: 4,
                messages: ["reward msg rushing water"],
                locations: [{location:"Forest den traversal"}]
            }
        ],
        temperature_range_modifier: 0.8,
        is_under_roof: true,
    });
    locations["Forest road"].connected_locations.push({location: locations["Forest den"], custom_text: "travel Enter the [Forest den]", travel_time: 90});

    locations["Bears' den"] = new Combat_zone({
        description: "desc location Bears' den",
        enemies_list: ["Forest bear"],
        enemy_count: 20,
        is_unlocked: false,
        enemy_stat_variation: 0.2,
        name: "Bears' den", 
        types: [{type: "narrow", stage: 2, xp_gain: 10}, {type: "dark", stage: 2, xp_gain: 10}],
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 500,
        },
        repeatable_reward: {
            xp: 250,
        },
        temperature_range_modifier: 0.8,
        is_under_roof: true,
    });

    locations["Forest road"].connected_locations.push({location: locations["Bears' den"], custom_text: "travel Enter the [Bears' den]", travel_time: 180});

    locations["Forest lake"] = new Location({
        connected_locations: [{location: locations["Forest road"], travel_time: 120}],
        description: "desc location Forest lake",
        name: "Forest lake",
        getBackgroundNoises: () => [translationManager.getText(language, "noise Forest lake 1"), translationManager.getText(language, "noise Forest lake 2"), translationManager.getText(language, "noise Forest lake 3"), translationManager.getText(language, "noise Forest lake 4"), translationManager.getText(language, "noise Forest lake 5"), translationManager.getText(language, "noise Forest lake 6")],
        is_unlocked: false,
    });
    locations["Forest road"].connected_locations.push({ location: locations["Forest lake"], travel_time: 120 });

    locations["Frogs"] = new Combat_zone({
        description: "desc location Frogs",
        enemies_list: ["Frog"],
        enemy_count: 50,
        is_unlocked: false,
        enemy_stat_variation: 0.2,
        name: "Water's edge",
        types: [{type: "aquatic", stage: 1, xp_gain: 3}, {type: "open", stage: 1, xp_gain: 5}],
        parent_location: locations["Forest lake"],
        first_reward: {
            xp: 1600,
        },
        repeatable_reward: {
            xp: 800,
            actions: [{location: "Forest lake", action: "search2"}],
        },
        temperature_range_modifier: 0.8,
        is_under_roof: false,
    });
    locations["Forest lake"].connected_locations.push({location: locations["Frogs"], custom_text: "travel Challenge the apex predator"});

    locations["Forest ant nest"] = new Combat_zone({ 
        description: "desc location Forest ant nest",
        enemies_list: ["Red ant swarm"],
        enemy_groups_list: [{enemies: ["Red ant queen", "Red ant swarm", "Red ant swarm", "Red ant swarm", "Red ant swarm", "Red ant swarm", "Red ant swarm", "Red ant swarm"]}],
        predefined_lineup_on_nth_group: 99,
        types: [{type: "narrow", stage: 3, xp_gain: 10}, {type: "dark", stage: 2, xp_gain: 7}],
        enemy_count: 100,
        is_unlocked: false,
        enemy_group_size: [8,8],
        enemy_stat_variation: 0.1,
        id: "Forest ant nest",
        name: "Red ant nest",
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 6000,
        },
        repeatable_reward: {
            xp: 3000,
        },
        temperature_range_modifier: 0.7,
        is_under_roof: true,
    });
    locations["Forest road"].connected_locations.push({location: locations["Forest ant nest"], custom_text: "travel Enter the [Red ant nest]", travel_time: 120});

    locations["Town outskirts"] = new Location({ 
        connected_locations: [{location: locations["Forest road"], custom_text: "travel Return to the [Forest road]", travel_time: 240}],
        description: "desc location Town outskirts",
        name: "Town outskirts",
        is_unlocked: true,
        dialogues: ["gate guard", "guild factor"],
    });
    locations["Forest road"].connected_locations.push({location: locations["Town outskirts"], custom_text: "travel Go towards the [Town outskirts]", travel_time: 240});

    locations["Slums"] = new Location({ 
        connected_locations: [{location: locations["Town outskirts"], travel_time: 60}],
        getDescription: function() {
            if(locations["Gang hideout"].is_finished) {
                return translationManager.getText(language, "desc location Slums dyn 1");
            }

            return translationManager.getText(language, "desc location Slums dyn 2");
        },
        name: "Slums",
        is_unlocked: true,
        dialogues: ["suspicious man", "old woman of the slums"],
        traders: ["suspicious trader", "suspicious trader 2"],
        market_region: "Slums",
        entrance_rewards: {
            quests: ["Light in the darkness"],
        },
        temperature_range_modifier: 0.9,
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Slums 1"), translationManager.getText(language, "noise Slums 2"), translationManager.getText(language, "noise Slums 3"), translationManager.getText(language, "noise Slums 4"), translationManager.getText(language, "noise Slums 5"), translationManager.getText(language, "noise Slums 6")];
            
            if(current_game_time.hour > 4 && current_game_time.hour <= 20) {
                noises.push(translationManager.getText(language, "noise Slums 7"));
            } else {
                if(!locations["Gang hideout"].is_finished) {
                    noises.push(translationManager.getText(language, "noise Slums 8"), translationManager.getText(language, "noise Slums 9"), translationManager.getText(language, "noise Slums 10"));
                }
            }
            if(!locations["Gang hideout"].is_finished) {
                noises.push(translationManager.getText(language, "noise Slums 11"));
            } else {
                noises.push(translationManager.getText(language, "noise Slums 12"), translationManager.getText(language, "noise Slums 13"), translationManager.getText(language, "noise Slums 14"));
            }
            return noises;
        },
    });
    locations["Town farms"] = new Location({ 
        connected_locations: [{location: locations["Town outskirts"], travel_time: 60}],
        description: "desc location Town farms",
        name: "Town farms",
        is_unlocked: true,
        dialogues: ["farm supervisor"],
        getBackgroundNoises: function() {
            let noises = [];
            if(current_game_time.hour > 4 && current_game_time.hour <= 20) {
                noises.push(translationManager.getText(language, "noise Town farms 1"), translationManager.getText(language, "noise Town farms 2"), translationManager.getText(language, "noise Town farms 3"), translationManager.getText(language, "noise Town farms 4"), translationManager.getText(language, "noise Town farms 5"), translationManager.getText(language, "noise Town farms 6"));
            } else {
                noises.push(translationManager.getText(language, "noise Town farms 7"), translationManager.getText(language, "noise Town farms 8"));
            }

            if(current_game_time.hour > 3 && current_game_time.hour < 10) {
                noises.push(translationManager.getText(language, "noise Town farms 9"), translationManager.getText(language, "noise Town farms 10"));
            } else if(current_game_time.hour > 18 && current_game_time.hour < 22) {
                noises.push(translationManager.getText(language, "noise Town farms 11"));
            } 

            return noises;
        },
    });

    locations["Red ant nest 1"] = new Combat_zone({ 
        description: "desc location Red ant nest 1",
        enemies_list: ["Red ant swarm"],
        enemy_groups_list: [{enemies: ["Red ant queen"]}],
        predefined_lineup_on_nth_group: 99,
        types: [{type: "narrow", stage: 3, xp_gain: 10}, {type: "dark", stage: 2, xp_gain: 7}],
        enemy_count: 100,
        is_unlocked: false,
        enemy_group_size: [5,6],
        enemy_stat_variation: 0.1,
        id: "Red ant nest 1",
        name: "Red ant nest",
        parent_location: locations["Town farms"],
        first_reward: {
            xp: 4000,
        },
        repeatable_reward: {
            locks: {
                locations: ["Red ant nest 1"],
            }, 
            move_to: {location: "Town farms"},
            actions: [
                {location: "Town farms", action: "dig for ants 2"}
            ]
        },
        temperature_range_modifier: 0.7,
        is_under_roof: true,
    });
    locations["Red ant nest 2"] = new Combat_zone({ 
        description: "desc location Red ant nest 2",
        enemies_list: ["Red ant swarm"],
        enemy_groups_list: [{enemies: ["Red ant queen"]}],
        predefined_lineup_on_nth_group: 99,
        types: [{type: "narrow", stage: 3, xp_gain: 10}, {type: "dark", stage: 2, xp_gain: 7}],
        enemy_count: 100,
        is_unlocked: false,
        enemy_group_size: [5,6],
        enemy_stat_variation: 0.1,
        id: "Red ant nest 2",
        name: "Red ant nest",
        parent_location: locations["Town farms"],
        first_reward: {
            xp: 4000,
        },
        repeatable_reward: {
            locks: {
                locations: ["Red ant nest 2"],
            }, 
            move_to: {location: "Town farms"},
            actions: [
                {location: "Town farms", action: "dig for ants 3"}
            ]
        },
        temperature_range_modifier: 0.7,
        is_under_roof: true,
    });
    locations["Red ant nest 3"] = new Combat_zone({ 
        description: "desc location Red ant nest 3",
        enemies_list: ["Red ant swarm"],
        enemy_groups_list: [{enemies: ["Red ant queen"]}],
        predefined_lineup_on_nth_group: 99,
        types: [{type: "narrow", stage: 3, xp_gain: 10}, {type: "dark", stage: 2, xp_gain: 7}],
        enemy_count: 100,
        is_unlocked: false,
        enemy_group_size: [5,6],
        enemy_stat_variation: 0.1,
        id: "Red ant nest 3",
        name: "Red ant nest",
        parent_location: locations["Town farms"],
        first_reward: {
            xp: 4000,
        },
        repeatable_reward: {
            locks: {
                locations: ["Red ant nest 3"],
            }, 
            move_to: {location: "Town farms"},
            actions: [
                {location: "Town farms", action: "follow ant trail"}
            ],
            textlines: [{dialogue: "farm supervisor", lines: ["eliminated ants"]}],
        },
        temperature_range_modifier: 0.7,
        is_under_roof: true,
    });

    locations["Town farms"].connected_locations.push(
        {location: locations["Red ant nest 1"], custom_text: "travel Enter the [Red ant nest]", travel_time: 10},
        {location: locations["Red ant nest 2"], custom_text: "travel Enter the [Red ant nest]", travel_time: 10},
        {location: locations["Red ant nest 3"], custom_text: "travel Enter the [Red ant nest]", travel_time: 10},
    );

    locations["Gang hideout"] = new Combat_zone({ 
        description: "desc location Gang hideout",
        enemies_list: ["Slums thug"],
        types: [{type: "narrow", stage: 2, xp_gain: 3}, {type: "dark", stage: 1, xp_gain: 3}],
        enemy_count: 30,
        is_unlocked: false,
        enemy_group_size: [4,5],
        enemy_stat_variation: 0.1,
        name: "Gang hideout", 
        parent_location: locations["Slums"],
        first_reward: {
            xp: 1000,
            reputation: {Slums: 200, Town: 50},
            money: 1840,
        },
        repeatable_reward: {
            traders: [{trader: "suspicious trader 2", skip_message: true}],
            textlines: [{dialogue: "suspicious man", lines: ["defeated gang"]}],
            locks: {
                traders: ["suspicious trader"],
                locations: ["Gang hideout"],
                textlines: { "suspicious man": ["behave 2"] }
            }, 
            move_to: {location: "Slums"},
            quest_progress: [{quest_id: "Light in the darkness", task_index: 1}],
        },
        temperature_range_modifier: 0.6,
        is_under_roof: true,
    });
    locations["Slums"].connected_locations.push({location: locations["Gang hideout"], travel_time: 10});

    locations["Town square"] = new Location({ 
        connected_locations: [{location: locations["Town outskirts"], travel_time: 40}],
        description: "desc location Town square",
        dialogues: ["square broker"],
        name: "Town square",
        is_unlocked: false,
        getBackgroundNoises: function() {
            let noises = [
                translationManager.getText(language, "noise Town square 1"), translationManager.getText(language, "noise Town square 2"), translationManager.getText(language, "noise Town square 3"), 
                //IFYKYK

                translationManager.getText(language, "noise Town square 4"), translationManager.getText(language, "noise Town square 5"), translationManager.getText(language, "noise Town square 6"),
                translationManager.getText(language, "noise Town square 7"), translationManager.getText(language, "noise Town square 8"), translationManager.getText(language, "noise Town square 9"),
            ];
            return noises;
        },
    });

    locations["Town outskirts"].connected_locations.push(
                                                        {location: locations["Town farms"], travel_time: 60}, 
                                                        {location: locations["Slums"], travel_time: 60}, 
                                                        {location: locations["Town square"], travel_time: 40}
                                                    );

    locations["Cat cafe"] = new Location({ 
        connected_locations: [{location: locations["Town square"], travel_time: 4}],
        description: "desc location Cat cafe",
        name: "Cat café",
        is_unlocked: true,
        getBackgroundNoises: function() {
            let noises = [
                translationManager.getText(language, "noise Cat cafe 1"), translationManager.getText(language, "noise Cat cafe 2"), translationManager.getText(language, "noise Cat cafe 3"), translationManager.getText(language, "noise Cat cafe 4"), translationManager.getText(language, "noise Cat cafe 5"),
                translationManager.getText(language, "noise Cat cafe 6"), translationManager.getText(language, "noise Cat cafe 7"), translationManager.getText(language, "noise Cat cafe 8"), translationManager.getText(language, "noise Cat cafe 9")
            ];
            return noises;
        },
        is_under_roof: true,
        is_temperature_static: true,
        static_temperature: 20,
    });

    locations["Nekomimi cafe"] = new Location({
        connected_locations: [{location: locations["Town square"], travel_time: 4}],
        description: "desc location Nekomimi cafe",
        name: "Nekomimi café",
        is_unlocked: true,
        getBackgroundNoises: function() {
            let noises = [
                translationManager.getText(language, "noise Nekomimi cafe 1"), translationManager.getText(language, "noise Nekomimi cafe 2"), translationManager.getText(language, "noise Nekomimi cafe 3"), translationManager.getText(language, "noise Nekomimi cafe 4"), translationManager.getText(language, "noise Nekomimi cafe 5"),
                translationManager.getText(language, "noise Nekomimi cafe 6"), translationManager.getText(language, "noise Nekomimi cafe 7"), translationManager.getText(language, "noise Nekomimi cafe 8"),
                translationManager.getText(language, "noise Nekomimi cafe 9"),
                translationManager.getText(language, "noise Nekomimi cafe 10"),
            ];
            return noises;
        },
        dialogues: ["nekomimi proprietress"],
        display_conditions: {
            flags: ["is_mofu_mofu_enabled"]
        },
        is_under_roof: true,
        is_temperature_static: true,
        static_temperature: 20,
    });

    locations["Antique store"] = new Location({
        connected_locations: [{location: locations["Town square"], travel_time: 4}],
        description: "desc location Antique store",
        dialogues: ["antique collector"],
        name: "Antique store",
        is_unlocked: true,
        getBackgroundNoises: function() {
            let noises = [
                translationManager.getText(language, "noise Antique store 1")
            ];
            return noises;
        },
        is_under_roof: true,
        is_temperature_static: true,
        static_temperature: 20,
    });
    locations["Adventurer's guild"] = new Location({
        connected_locations: [{location: locations["Town square"], travel_time: 4}],
        description: "desc location Adventurer's guild",
        dialogues: ["guild clerk"],
        name: "Adventurer's guild",
        is_unlocked: true,
        getBackgroundNoises: function() {
            let noises = [
                translationManager.getText(language, "noise Adventurer's guild 1"), translationManager.getText(language, "noise Adventurer's guild 2"), translationManager.getText(language, "noise Adventurer's guild 3"),
                translationManager.getText(language, "noise Adventurer's guild 4"), translationManager.getText(language, "noise Adventurer's guild 5"), translationManager.getText(language, "noise Adventurer's guild 6"),
                translationManager.getText(language, "noise Adventurer's guild 7"), translationManager.getText(language, "noise Adventurer's guild 8"),
                translationManager.getText(language, "noise Adventurer's guild 9"), translationManager.getText(language, "noise Adventurer's guild 10"),
                translationManager.getText(language, "noise Adventurer's guild 11"), translationManager.getText(language, "noise Adventurer's guild 12"), translationManager.getText(language, "noise Adventurer's guild 13"),
                translationManager.getText(language, "noise Adventurer's guild 14"),
                translationManager.getText(language, "noise Adventurer's guild 15"), translationManager.getText(language, "noise Adventurer's guild 16"),
                translationManager.getText(language, "noise Adventurer's guild 17"), translationManager.getText(language, "noise Adventurer's guild 18"),
                translationManager.getText(language, "noise Adventurer's guild 19"),

                translationManager.getText(language, "noise Adventurer's guild 20"), translationManager.getText(language, "noise Adventurer's guild 21"), translationManager.getText(language, "noise Adventurer's guild 22"),
                translationManager.getText(language, "noise Adventurer's guild 23"), translationManager.getText(language, "noise Adventurer's guild 24"), translationManager.getText(language, "noise Adventurer's guild 25"), translationManager.getText(language, "noise Adventurer's guild 26"),
                translationManager.getText(language, "noise Adventurer's guild 27"), translationManager.getText(language, "noise Adventurer's guild 28"), translationManager.getText(language, "noise Adventurer's guild 29"), translationManager.getText(language, "noise Adventurer's guild 30"),
                translationManager.getText(language, "noise Adventurer's guild 31"), translationManager.getText(language, "noise Adventurer's guild 32"), translationManager.getText(language, "noise Adventurer's guild 33"),

                translationManager.getText(language, "noise Adventurer's guild 34"), translationManager.getText(language, "noise Adventurer's guild 35"), translationManager.getText(language, "noise Adventurer's guild 36"), translationManager.getText(language, "noise Adventurer's guild 37"),
                translationManager.getText(language, "noise Adventurer's guild 38"), translationManager.getText(language, "noise Adventurer's guild 39"), translationManager.getText(language, "noise Adventurer's guild 40"),
                translationManager.getText(language, "noise Adventurer's guild 41"),
            ];
            if(!global_flags.is_mofu_mofu_enabled) {
                noises.push(translationManager.getText(language, "noise Adventurer's guild 42"), translationManager.getText(language, "noise Adventurer's guild 43"), translationManager.getText(language, "noise Adventurer's guild 44"), translationManager.getText(language, "noise Adventurer's guild 45"));
            } else {
                noises.push(translationManager.getText(language, "noise Adventurer's guild 46"), translationManager.getText(language, "noise Adventurer's guild 47"));
            }
            noises.push(translationManager.getText(language, "noise Adventurer's guild 48"), translationManager.getText(language, "noise Adventurer's guild 49"),translationManager.getText(language, "noise Adventurer's guild 50"), translationManager.getText(language, "noise Adventurer's guild 51"));
            return noises;
        },
        is_under_roof: true,
        is_temperature_static: true,
        static_temperature: 20,
    });
    locations["Mages guild"] = new Location({
        connected_locations: [{location: locations["Town square"], travel_time: 4}],
        description: "desc location Mages guild",
        name: "Mages guild",
        is_unlocked: false,
        getBackgroundNoises: function() {
            let noises = [
                translationManager.getText(language, "noise Mages guild 1"), translationManager.getText(language, "noise Mages guild 2"),
                translationManager.getText(language, "noise Mages guild 3"), translationManager.getText(language, "noise Mages guild 4"),
                translationManager.getText(language, "noise Mages guild 5"), translationManager.getText(language, "noise Mages guild 6"),
                translationManager.getText(language, "noise Mages guild 7"),
            ];
            return noises;
        },
        is_under_roof: true,
        is_temperature_static: true,
        static_temperature: 20,
    });

    locations["Town square"].connected_locations.push(
        {location: locations["Cat cafe"], travel_time: 4},
        {location: locations["Nekomimi cafe"], travel_time: 4},
        {location: locations["Adventurer's guild"], travel_time: 4},
        {location: locations["Mages guild"], travel_time: 4},
        {location: locations["Antique store"], travel_time: 4}

    );

    locations["Mountain path"] = new Location({
        connected_locations: [{location: locations["Nearby cave"], custom_text: "travel Climb down to [Nearby Cave]", travel_time: 20, travel_time_skills: ["Climbing"]}],
        description: "desc location Mountain path",
        name: "Mountain path",
        is_unlocked: false,
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Mountain path 1"), translationManager.getText(language, "noise Mountain path 2")];
            return noises;
        },
        temperature_modifier: -2,
        unlock_text: "loc Mountain path unlock",
    });
    locations["Nearby cave"].connected_locations.push({location: locations["Mountain path"], custom_text: "travel Climb up to [Mountain path]", travel_time: 60, travel_time_skills: ["Climbing"]});

    locations["Small flat area in mountains"] = new Location({
        connected_locations: [{location: locations["Mountain path"], travel_time: 120}],
        description: "desc location Small flat area in mountains",
        name: "Small flat area in mountains",
        is_unlocked: false,
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Small flat area in mountains 1"), translationManager.getText(language, "noise Small flat area in mountains 2"), translationManager.getText(language, "noise Small flat area in mountains 3")];
            return noises;
        },
        temperature_modifier: -2,
        unlock_text: "loc Small flat area in mountains unlock",
    });
    locations["Mountain path"].connected_locations.push({location: locations["Small flat area in mountains"], travel_time: 120});
    
    locations["Mountain camp"] = new Location({
        connected_locations: [{location: locations["Nearby cave"], custom_text: "travel Climb down to [Nearby cave]", travel_time: 140, travel_time_skills: ["Climbing", "Running"]}],
        description: "desc location Mountain camp",
        name: "Mountain camp",
        housing: {
            is_unlocked: true,
            sleeping_xp_per_tick: 8,
            text_to_sleep: "ui sleep Mountain camp",
        },
        crafting: {
            is_unlocked: true,
            use_text: "ui craft use Mountain camp",
            tiers: {
                cooking: 1
            }
        },
        is_unlocked: false,
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Mountain camp 1"), translationManager.getText(language, "noise Mountain camp 2"), translationManager.getText(language, "noise Mountain camp 3")];
            return noises;
        },
        temperature_range_modifier: 0.5,
        is_under_roof: true,
    });
    locations["Nearby cave"].connected_locations.push({location: locations["Mountain camp"], travel_time: 140, travel_time_skills: ["Climbing", "Running"]});
    locations["Mountain path"].connected_locations.push({location: locations["Mountain camp"], travel_time: 120});

    locations["Gentle mountain slope"] = new Combat_zone({
        description: "desc location Gentle mountain slope",
        enemies_list: ["Angry mountain goat"],
        enemy_count: 50,
        enemy_group_size: [3,4],
        is_unlocked: false,
        enemy_stat_variation: 0.2,
        name: "Gentle mountain slope", 
        types: [{type: "open", stage: 1, xp_gain: 5}, {type: "thin air", stage: 1, xp_gain: 3}],
        parent_location: locations["Mountain camp"],
        first_reward: {
            xp: 1000,
            flags: ["is_strength_proved"],
        },
        repeatable_reward: {
            xp: 500,
        },
        temperature_modifier: -2,
    });
    locations["Mountain camp"].connected_locations.push({location: locations["Gentle mountain slope"], travel_time: 120});
	
    locations["Downstream from the village"] = new Location({       //start of the new content
        connected_locations: [{location: locations["Village"], custom_text: "travel Make the long hike back to the [Village]", travel_time: 2160}], 
        description: "desc location Downstream from the village",
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Downstream from the village 1"), translationManager.getText(language, "noise Downstream from the village 2"), translationManager.getText(language, "noise Downstream from the village 3")];
            return noises;
        },
        temperature_modifier: 0.5,
        name: "Downstream from the village",
        is_unlocked: false,
    });
    locations["Village"].connected_locations.push({location: locations["Downstream from the village"], custom_text: "travel Hike down the river", travel_time: 2160});

    locations["Riverbank"] = new Location({ 
        connected_locations: [{location: locations["Village"], custom_text: "travel Make the long hike back to the [Village]", travel_time: 2160}], 
        getDescription: function() {
		if(locations["Riverbank shore"].enemy_groups_killed >= 10 * locations["Riverbank shore"].enemy_count) { 
                return translationManager.getText(language, "desc location Riverbank dyn 1");
            } else if(locations["Riverbank shore"].enemy_groups_killed >= 5 * locations["Riverbank shore"].enemy_count) {
                return translationManager.getText(language, "desc location Riverbank dyn 2");
            } else {
                return translationManager.getText(language, "desc location Riverbank joined 1");
            }},
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Riverbank 1"), translationManager.getText(language, "noise Riverbank 2"), translationManager.getText(language, "noise Riverbank 3")];
            return noises;
        },
        temperature_modifier: 1,
        name: "Riverbank",
        is_unlocked: false,
    });
    locations["Village"].connected_locations.push({location: locations["Riverbank"], custom_text: "travel Hike down the river", travel_time: 2160});
  
	locations["Downstream from the village"].connected_locations.push({location: locations["Riverbank"], custom_text: "travel Move down to the [Riverbank]", travel_time: 30});

    locations["Riverbank shore"] = new Combat_zone({
        description: "desc location Riverbank shore",
        enemy_count: 50, 
        types: [{type: "open", stage: 1,  xp_gain: 2}, {type: "rough", stage: 1,  xp_gain: 1}],
        enemies_list: ["River crab"],
        enemy_group_size: [2,4],
        enemy_stat_variation: 0.2,
        is_unlocked: true, 
        name: "Riverbank shore", 
        leave_text: "loc Riverbank shore leave",
        parent_location: locations["Riverbank"],
        temperature_range_modifier: 0.5,
        first_reward: {
            xp: 1800,
        },
        repeatable_reward: {
			xp: 900,
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 5,
                locations: [{location: "Further downstream"}]
            },
        ],
    });
    locations["Riverbank"].connected_locations.push({location: locations["Riverbank shore"], custom_text: "travel Climb down to the [Riverbank shore]", travel_time: 15});
	
    locations["Further downstream"] = new Location({ 
        connected_locations: [{location: locations["Riverbank"], custom_text: "travel Go back along the path you've made to the [Riverbank]", travel_time: 240}], 
        description: "desc location Further downstream",
        getBackgroundNoises: function() {
            let noises = [];
            if(current_game_time.hour > 4 && current_game_time.hour <= 20) {
                noises.push(translationManager.getText(language, "noise Further downstream 1"), translationManager.getText(language, "noise Further downstream 2"), translationManager.getText(language, "noise Further downstream 3")); //reference to sans undertale
            } else {
                noises.push(translationManager.getText(language, "noise Further downstream 1"), translationManager.getText(language, "noise Further downstream 2"));
            }
            return noises;
        },
        temperature_range_modifier: 0.8,
        name: "Further downstream",
        is_unlocked: false,
    });
    locations["Riverbank"].connected_locations.push({location: locations["Further downstream"], custom_text: "travel Follow the giant crab's trail", travel_time: 240});

    locations["Lake beach"] = new Location({ 
        connected_locations: [{location: locations["Riverbank"], custom_text: "travel Go back along the path you've made to the [Riverbank]", travel_time: 180, travel_time_skills: ["Scrambling"]}], 
        getBackgroundNoises: function() {
            let noises = [];
            if(current_game_time.hour > 4 && current_game_time.hour <= 20) {
                noises.push(translationManager.getText(language, "noise Lake beach 1"), translationManager.getText(language, "noise Lake beach 2"), translationManager.getText(language, "noise Lake beach 3"));
            } else {
                if(locations["Lake beach"].housing.is_unlocked) {
                    noises.push(translationManager.getText(language, "noise Lake beach 4"));
                }
                noises.push(translationManager.getText(language, "noise Lake beach 1"), translationManager.getText(language, "noise Lake beach 2"));
            }
            return noises;
        },
        getDescription: () => {
            if(locations["Lake beach"].housing.is_unlocked) {
                return translationManager.getText(language, "desc location Lake beach joined 1");
            } else {
                return translationManager.getText(language, "desc location Lake beach joined 2");
            }
        },
        housing: {
            is_unlocked: false,
            sleeping_xp_per_tick: 8,
            text_to_sleep: "ui sleep Lake beach",
        },
        crafting: {
            is_unlocked: false,
            use_text: "ui craft use Lake beach",
            tiers: {
                cooking: 1
            }
        },
        temperature_modifier: 1.5,
        unlock_text: "loc Lake beach unlock",        //intended to show up after beating the giant crab for the second time, playing off the old "fisherman lying about the size of his catch" trope
        name: "Lake beach",
        is_unlocked: false,
    });
    locations["Riverbank"].connected_locations.push({location: locations["Lake beach"], custom_text: "travel Go to the [Lake beach]",  travel_time: 180, travel_time_skills: ["Scrambling"]});
  
    locations["Further downstream"].connected_locations.push({location: locations["Lake beach"], custom_text: "travel Go to the [Lake beach]", travel_time: 240}); //Pretty sure "Further downstream" should be locked by this point, but if it's not or if it gets unlocked, it should reconnect I suppose

    locations["Waterfall basin"] = new Location({ 
        connected_locations: [{location: locations["Lake beach"], custom_text: "travel Climb up the cliffside and return to the [Lake beach]", travel_time: 80, travel_time_skills: ["Climbing"]}], 
        getDescription: function() {
            if(locations["Crab spawning grounds"].enemy_groups_killed >= 6 * locations["Crab spawning grounds"].enemy_count) { 
                return translationManager.getText(language, "desc location Waterfall basin dyn 1");
            } else if(locations["Crab spawning grounds"].enemy_groups_killed >= 3 * locations["Crab spawning grounds"].enemy_count) {
                return translationManager.getText(language, "desc location Waterfall basin dyn 2");
            } else {
                return translationManager.getText(language, "desc location Waterfall basin dyn 3");
            }
        },
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Waterfall basin 1")];
            return noises;
        },
        temperature_modifier: 2,
        name: "Waterfall basin",
        is_unlocked: false,
    });
    locations["Lake beach"].connected_locations.push({location: locations["Waterfall basin"], custom_text: "travel Rappel down to the [Waterfall basin]", travel_time: 40, travel_time_skills: ["Climbing"]});

    /*
        P-10 REGION 1 - the wet woods.

        "South of the falling water! The wet woods! That was where we gathered!
        But now?! It is just home of the walking rocks!" - the swamp cook, whose
        geography lesson is the specification for all four regions.

        The stone crabs are his walking rocks and they already existed; the region
        needed no new bestiary, only the ground they took.
    */
    locations["Wet woods"] = new Location({
        connected_locations: [{location: locations["Waterfall basin"],
            custom_text: "travel Follow the water back up to the [Waterfall basin]", travel_time: 60}],
        getDescription: function() {
            //Mirrors the Waterfall basin: the room reports how much of it has been
            //taken back, so the region reads as recovering rather than as a switch.
            if(locations["Drowned grove"].enemy_groups_killed >= locations["Drowned grove"].enemy_count) {
                return translationManager.getText(language, "desc location Wet woods dyn 1");
            } else if(locations["Drowned grove"].enemy_groups_killed >= locations["Drowned grove"].enemy_count / 2) {
                return translationManager.getText(language, "desc location Wet woods dyn 2");
            } else {
                return translationManager.getText(language, "desc location Wet woods dyn 3");
            }
        },
        getBackgroundNoises: function() {
            return [translationManager.getText(language, "noise Wet woods 1"),
                    translationManager.getText(language, "noise Wet woods 2"),
                    translationManager.getText(language, "noise Wet woods 3"),
                    translationManager.getText(language, "noise Wet woods 4")];
        },
        name: "Wet woods",
        is_unlocked: false,
        unlock_text: "loc Wet woods unlock",
        temperature_modifier: 1.5,
        is_under_roof: false,
    });

    locations["Waterfall basin"].connected_locations.push({location: locations["Wet woods"],
        custom_text: "travel Wade south into the [Wet woods]", travel_time: 60});

    locations["Drowned grove"] = new Combat_zone({
        description: "desc location Drowned grove",
        enemies_list: ["Stone crab"],
        types: [{type: "wet", stage: 1, xp_gain: 3}, {type: "narrow", stage: 2, xp_gain: 5}],
        enemy_count: 40,
        enemy_group_size: [2, 3],
        enemy_stat_variation: 0.15,
        is_unlocked: true,
        name: "Drowned grove",
        leave_text: "loc Drowned grove leave",
        parent_location: locations["Wet woods"],
        first_reward: {
            xp: 5000,
        },
        repeatable_reward: {
            xp: 2500,
            activities: [{location: "Wet woods", activity: "herbalism"}],
            textlines: [{dialogue: "swampland cook", lines: ["swampcook woods"]}],
            quest_progress: [{quest_id: "Where We Gathered", task_index: 1}],
        },
        temperature_range_modifier: 0.8,
        is_under_roof: false,
    });

    locations["Wet woods"].connected_locations.push({location: locations["Drowned grove"],
        custom_text: "travel Push into the [Drowned grove]", travel_time: 20});

    locations["Crab spawning grounds"] = new Combat_zone({
        description: "desc location Crab spawning grounds",       //final punchline to the "big crab nest/big crabs' nest/big crab's nest" setup
        enemy_count: 50, 
        types: [{type: "open", stage: 2, xp_gain: 10}, {type: "rough", stage: 1, xp_gain: 3}, {type: "wet", stage: 1}],
        enemies_list: ["Stone crab"],
        enemy_group_size: [3,5],
        enemy_stat_variation: 0.2,
        is_unlocked: true, 
        name: "Crab spawning grounds", 
        leave_text: "loc Crab spawning grounds leave",
        parent_location: locations["Waterfall basin"],
        temperature_modifier: 1,
        first_reward: {
            xp: 4000,
        },
        repeatable_reward: {
			xp: 2000,
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 3,
                activities: [{location:"Waterfall basin", activity:"meditating"}],
            },
            {
                required_clear_count: 6,
                locations: [{location: "Swampland fields"}]
            }]
        });
    locations["Waterfall basin"].connected_locations.push({location: locations["Crab spawning grounds"], travel_time: 20});
	
    locations["Swampland fields"] = new Location({ 
        connected_locations: [{location: locations["Waterfall basin"], custom_text: "travel Crawl through the muck and brush and return to the [Waterfall basin]", travel_time: 45, travel_time_skills: ["Scrambling"]}], 
        getDescription: function() {
          if(locations["The swamplands"].enemy_groups_killed >= 100 * locations["The swamplands"].enemy_count) { //10000 enemies killed
                  return translationManager.getText(language, "desc location Swampland fields dyn 1");
              } else if(locations["The swamplands"].enemy_groups_killed >= 10 * locations["The swamplands"].enemy_count) {
                  return translationManager.getText(language, "desc location Swampland fields dyn 2");
              } else if(locations["The swamplands"].enemy_groups_killed >= 3 * locations["The swamplands"].enemy_count) {
                  return translationManager.getText(language, "desc location Swampland fields dyn 3");
              } else {
                  return translationManager.getText(language, "desc location Swampland fields dyn 4");
          }
        },
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Swampland fields 1"), translationManager.getText(language, "noise Swampland fields 2"), translationManager.getText(language, "noise Swampland fields 3"), translationManager.getText(language, "noise Swampland fields 4"), translationManager.getText(language, "noise Swampland fields 5"), translationManager.getText(language, "noise Swampland fields 6"), translationManager.getText(language, "noise Swampland fields 7"), translationManager.getText(language, "noise Swampland fields 8"), translationManager.getText(language, "noise Swampland fields 9"), translationManager.getText(language, "noise Swampland fields 10")];
            return noises;
        },
        temperature_range_modifier: 0.5,
        temperature_modifier: 3,
        unlock_text: "loc Swampland fields unlock",
        name: "Swampland fields",
        is_unlocked: false,
    });
    locations["Waterfall basin"].connected_locations.push({location: locations["Swampland fields"], custom_text: "travel Crawl through the muck and brush to the [Swampland fields]", travel_time: 45, travel_time_skills: ["Scrambling"]});

    locations["The swamplands"] = new Combat_zone({
        description: "desc location The swamplands",
        enemy_count: 100, 
        types: [{type: "rough", stage: 2, xp_gain: 7}, {type: "wet", stage: 1}],
        enemies_list: ["Alligator", "Snapping turtle", "Giant snake"],
        enemy_stat_variation: 0.2,
        is_unlocked: true, 
        name: "The swamplands", 
        leave_text: "loc The swamplands leave",
        parent_location: locations["Swampland fields"],
        temperature_modifier: 5.5,
        temperature_range_modifier: 0.5,
        first_reward: {
            xp: 8000,
        },
        repeatable_reward: {
			xp: 4000,
        },
        rewards_with_clear_requirement: [
            {
                required_clear_count: 3,
                locations: [{location: "Swampland tribe"}]
            }
        ]
    });
    locations["Swampland fields"].connected_locations.push({location: locations["The swamplands"], custom_text: "travel Wander randomly in the swamplands", travel_time: 45});

    locations["Swampland tribe"] = new Location({
        connected_locations: [{location: locations["Swampland fields"], custom_text: "travel Leave the safety of the settlement and return to the [Swampland fields]", travel_time: 90, travel_time_skills: ["Scrambling", "Running"]}], 
        getDescription: function() {
            return translationManager.getText(language, "desc location Swampland tribe dyn 1");
        },
        getBackgroundNoises: function() {
            let noises = [translationManager.getText(language, "noise Swampland tribe 1"), translationManager.getText(language, "noise Swampland tribe 2"), translationManager.getText(language, "noise Swampland tribe 3"), translationManager.getText(language, "noise Swampland tribe 4"), translationManager.getText(language, "noise Swampland tribe 5"), translationManager.getText(language, "noise Swampland tribe 6"), translationManager.getText(language, "noise Swampland tribe 7")];
            return noises;
        },
        temperature_modifier: 2,
        temperature_range_modifier: 0.5,
        dialogues: ["swampland chief", "swampland cook", "swampland tailor", "swampland tanner"],
        traders: ["swampland trader", "swampland trader 2"],
        market_region: "Swamp",
        name: "Swampland tribe", 
        is_unlocked: false,
        crafting: {
            is_unlocked: false,
            use_text: "ui craft use Swampland tribe", 
            tiers: {
                crafting: 2,
                forging: 1,
                smelting: 1,
                cooking: 2,
                alchemy: 2,
                butchering: 2,
                woodworking: 2,
            }
        },
        entrance_rewards: {
            quests: ["In Times of Need"],
        }
    });
    locations["Swampland fields"].connected_locations.push({location: locations["Swampland tribe"], travel_time: 90, travel_time_skills: ["Scrambling", "Running"]});

    /*
        P-10 REGION 2 - the plains.

        "Southeast! The snake would hunt! But the snake split! And now no snakes go
        to the plains!"

        No snakes is a hard constraint, so none of the swamp's bestiary is here.
        What makes it dangerous is the absence: the apex predator left and nothing
        replaced it, so the prey did. The warthog the player met once as a single
        boss at Carya Canyon runs in herds here, for the same reason.

        The description is static, unlike the wet woods. That region was
        recovering; this one is not.
    */
    locations["The plains"] = new Location({
        connected_locations: [{location: locations["Swampland fields"],
            custom_text: "travel Head back northwest into the [Swampland fields]", travel_time: 120}],
        description: "desc location The plains",
        getBackgroundNoises: function() {
            return [translationManager.getText(language, "noise The plains 1"),
                    translationManager.getText(language, "noise The plains 2"),
                    translationManager.getText(language, "noise The plains 3"),
                    translationManager.getText(language, "noise The plains 4")];
        },
        name: "The plains",
        is_unlocked: false,
        unlock_text: "loc The plains unlock",
        temperature_modifier: 1.2,
        is_under_roof: false,
    });

    locations["Swampland fields"].connected_locations.push({location: locations["The plains"],
        custom_text: "travel Walk southeast out onto [The plains]", travel_time: 120});

    locations["Old hunting ground"] = new Combat_zone({
        description: "desc location Old hunting ground",
        enemies_list: ["Warthog"],
        types: [{type: "open", stage: 2, xp_gain: 8}],
        enemy_count: 60,
        enemy_group_size: [3, 4],
        enemy_stat_variation: 0.2,
        is_unlocked: true,
        name: "Old hunting ground",
        leave_text: "loc Old hunting ground leave",
        parent_location: locations["The plains"],
        first_reward: {
            xp: 6000,
        },
        repeatable_reward: {
            xp: 3000,
            quest_progress: [{quest_id: "No Snakes Go to the Plains", task_index: 1}],
        },
        temperature_range_modifier: 1.1,
        is_under_roof: false,
    });

    locations["The plains"].connected_locations.push({location: locations["Old hunting ground"],
        custom_text: "travel Walk out into the [Old hunting ground]", travel_time: 30});

    /*
        The traces. This is the region's whole point and it must not resolve: the
        banished half of the tribe is one of the things STORY.md keeps open, so what
        is found is that people were here, that they built properly, and that they
        left on purpose. Not who, not where, not whether they are alive.
    */
    locations["The plains"].actions = {
        "read the ground": new GameAction({
            action_id: "read the ground",
            action_name: "action read the ground name",
            starting_text: "action read the ground starting",
            description: "action read the ground desc",
            action_text: "action read the ground during",
            success_text: "action read the ground success",
            is_unlocked: true,
            conditions: [
                {skills: {Perception: 12}},
                {skills: {Perception: 30}},
            ],
            failure_texts: {
                conditional_loss: ["action read the ground fail conditional_loss 1"],
            },
            attempt_duration: 240,
            success_chances: [0.3, 1],
            rewards: {
                skill_xp: {Perception: 900},
                quest_progress: [{quest_id: "No Snakes Go to the Plains", task_index: 2}],
                textlines: [{dialogue: "swampland chief", lines: ["swampchief plains"]}],
            },
        }),
    };
	

    /*
        P-10 REGION 3 - the bay.

        "A-ha~! Far to the north! Many spice and meat and metal and leather come
        from there! From very far away! It good place to go! To leave!"

        Built as a departure. The other three regions are places the snake's soul
        lost; this one was never the snake's, and the cook is the only person in the
        game who talks about leaving as a good outcome.

        It hangs off the Town outskirts rather than off the swamp, because the
        factor's road is the only road there is: he sits at a folding table writing
        down what comes up it. Everything in this region is a ledger of one kind or
        another.
    */
    locations["Coast road"] = new Combat_zone({
        description: "desc location Coast road",
        //Reused rather than invented: a long road that carries everything worth
        //carrying, with nobody living along it, is what direwolves are for. The
        //region's own danger is that it is empty, not that it is exotic.
        enemies_list: ["Direwolf", "Direwolf hunter"],
        types: [{type: "open", stage: 2, xp_gain: 9}, {type: "wet", stage: 1, xp_gain: 4}],
        enemy_count: 80,
        enemy_group_size: [2, 4],
        enemy_stat_variation: 0.2,
        is_unlocked: false,
        name: "Coast road",
        unlock_text: "loc Coast road unlock",
        leave_text: "loc Coast road leave",
        parent_location: locations["Town outskirts"],
        first_reward: {
            xp: 8000,
            locations: [{location: "The bay"}],
        },
        repeatable_reward: {
            xp: 4000,
            quest_progress: [{quest_id: "A Good Place to Leave", task_index: 1}],
        },
        temperature_range_modifier: 1.1,
        is_under_roof: false,
    });

    locations["Town outskirts"].connected_locations.push({location: locations["Coast road"],
        custom_text: "travel Take the [Coast road] north", travel_time: 300});

    locations["The bay"] = new Location({
        connected_locations: [{location: locations["Town outskirts"],
            custom_text: "travel Start the long walk back south to the [Town outskirts]", travel_time: 300}],
        description: "desc location The bay",
        dialogues: ["harbour tallyman"],
        getBackgroundNoises: function() {
            return [translationManager.getText(language, "noise The bay 1"),
                    translationManager.getText(language, "noise The bay 2"),
                    translationManager.getText(language, "noise The bay 3"),
                    translationManager.getText(language, "noise The bay 4"),
                    translationManager.getText(language, "noise The bay 5"),
                    translationManager.getText(language, "noise The bay 6")];
        },
        name: "The bay",
        is_unlocked: false,
        unlock_text: "loc The bay unlock",
        //Warmer than the coast road and less variable: a working harbour with water
        //on three sides does not swing the way an open road does.
        temperature_modifier: 1.1,
        temperature_range_modifier: 0.7,
        is_under_roof: false,
    });

    //Off the outskirts, not off the road: a Combat_zone has a parent_location and a
    //leave_text and no travel list of its own, so the road cannot be a waypoint. It
    //is the obstacle instead - clearing it is what puts the bay on the map.
    locations["Town outskirts"].connected_locations.push({location: locations["The bay"],
        custom_text: "travel Walk the whole coast road north to [The bay]", travel_time: 300});

    /*
        The salt house. The cook's line is a shopping list - "many spice and meat and
        metal and leather" - so the region has to hold a trader or the line is a lie.
        Its stock is assembled from templates that already exist, because the point
        of the room is that things arrive here from further away than the player can
        go, not that there is new loot in the game.
    */
    locations["The salt house"] = new Location({
        connected_locations: [{location: locations["The bay"],
            custom_text: "travel Step back out onto the quay", travel_time: 4}],
        description: "desc location The salt house",
        name: "The salt house",
        is_unlocked: false,
        traders: ["bay trader"],
        //Its own market, linked to nothing. Saturation models how much of a thing
        //the player has already dumped in one place, and the bay is a month's walk
        //from every other market in the game - which is the whole reason the region
        //is worth walking to.
        market_region: "Bay",
        getBackgroundNoises: function() {
            return [translationManager.getText(language, "noise The salt house 1"),
                    translationManager.getText(language, "noise The salt house 2"),
                    translationManager.getText(language, "noise The salt house 3"),
                    translationManager.getText(language, "noise The salt house 4")];
        },
        is_under_roof: true,
        is_temperature_static: true,
        static_temperature: 14,
    });

    locations["The bay"].connected_locations.push({location: locations["The salt house"],
        custom_text: "travel Go into [The salt house]", travel_time: 4});

    /*
        The departures book, which is the region's answer and the whole of it.

        Mirrors "read the ground" on the plains: an action on the hub room, gated on
        Perception, that hands back a fact rather than an item. What it hands back is
        deliberately incomplete - a hull, a tide, and a name column somebody left
        empty. The plains keep the banished tribe open; the bay keeps who paid open.
    */
    locations["The bay"].actions = {
        "read the departures": new GameAction({
            action_id: "read the departures",
            action_name: "action read the departures name",
            starting_text: "action read the departures starting",
            description: "action read the departures desc",
            action_text: "action read the departures during",
            success_text: "action read the departures success",
            is_unlocked: false,
            conditions: [
                {skills: {Perception: 15}},
                {skills: {Perception: 34}},
            ],
            failure_texts: {
                conditional_loss: ["action read the departures fail conditional_loss 1"],
            },
            attempt_duration: 300,
            success_chances: [0.3, 1],
            rewards: {
                skill_xp: {Perception: 1200},
                quest_progress: [{quest_id: "A Good Place to Leave", task_index: 3}],
            },
        }),
    };

    locations["Longhouse"] = new Location({
        connected_locations: [{location: locations["Swampland tribe"], custom_text: "travel Go back out to the [Swampland tribe]", travel_time: 5}],
        description: "desc location Longhouse",
        name: "Longhouse",
        is_unlocked: false,
        housing: {
            is_unlocked: true,
            text_to_sleep: "ui sleep Longhouse",
            sleeping_xp_per_tick: 3
        },
        temperature_modifier: 1.5,
        temperature_range_modifier: 0.5,
        dialogues: ["swampland scout"],
        is_under_roof: true,
    });

    locations["Swampland tribe"].connected_locations.push({location: locations["Longhouse"], travel_time: 5});
})();



//challenge zones
(function(){
    locations["Sparring with the village guard (heavy)"] = new Challenge_zone({
        description: "desc location Sparring with the village guard (heavy)",
        enemy_count: 1, 
        enemies_list: ["Village guard (heavy)"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        name: "Sparring with the village guard (heavy)", 
        leave_text: "loc Sparring with the village guard (heavy) leave",
        parent_location: locations["Village"],
        first_reward: {
            xp: 30,
            reputation: {Village: 10},
        },
        repeatable_reward: {
            textlines: [{dialogue: "village guard", lines: ["heavy"]}],
        },
        unlock_text: "loc Sparring with the village guard (heavy) unlock"
    });
    locations["Sparring with the village guard (quick)"] = new Challenge_zone({
        description: "desc location Sparring with the village guard (quick)",
        enemy_count: 1, 
        enemies_list: ["Village guard (quick)"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        name: "Sparring with the village guard (quick)", 
        leave_text: "loc Sparring with the village guard (quick) leave",
        parent_location: locations["Village"],
        first_reward: {
            xp: 30,
            reputation: {Village: 10},
        },
        repeatable_reward: {
            textlines: [{dialogue: "village guard", lines: ["quick"]}],
        },
        unlock_text: "loc Sparring with the village guard (quick) unlock"
    });
    locations["Village"].connected_locations.push(
        {location: locations["Sparring with the village guard (heavy)"], custom_text: "travel Spar with the guard [heavy]", travel_time: 0},
        {location: locations["Sparring with the village guard (quick)"], custom_text: "travel Spar with the guard [quick]", travel_time: 0}
    );

    locations["Suspicious wall"] = new Challenge_zone({
        description: "desc location Suspicious wall",
        enemy_count: 1, 
        types: [],
        enemies_list: ["Suspicious wall"],
        enemy_group_size: [1,1],
        enemy_stat_variation: 0,
        is_unlocked: false, 
        name: "Suspicious wall", 
        leave_text: "loc Suspicious wall leave",
        parent_location: locations["Nearby cave"],
        repeatable_reward: {
            locations: [{location: "Hidden tunnel"}],
            textlines: [{dialogue: "village elder", lines: ["new tunnel"]}],
            xp: 20,
            quests: ["The Infinite Rat Saga"],
        },
        unlock_text: "loc Suspicious wall unlock",
        is_under_roof: true,
        temperature_range_modifier: 0.8,
    });
    locations["Nearby cave"].connected_locations.push({location: locations["Suspicious wall"], custom_text: "travel Try to break the suspicious wall", travel_time: 0});

    locations["Fight off the assailant"] = new Challenge_zone({
        description: "desc location Fight off the assailant",
        enemy_count: 1, 
        types: [],
        enemies_list: ["Suspicious man"],
        enemy_group_size: [1,1],
        enemy_stat_variation: 0,
        is_unlocked: false, 
        name: "Fight off the assailant", 
        leave_text: "loc Fight off the assailant leave",
        parent_location: locations["Slums"],
        repeatable_reward: {
            textlines: [{dialogue: "suspicious man", lines: ["defeated"]}],
            xp: 40,
        },
        unlock_text: "loc Fight off the assailant unlock"
    });
    locations["Slums"].connected_locations.push({location: locations["Fight off the assailant"], custom_text: "travel Fight off the suspicious man", travel_time: 0});

    locations["Fight the angry mountain goat"] = new Challenge_zone({
        description: "desc location Fight the angry mountain goat",
        enemy_count: 1, 
        types: [{type: "narrow", stage: 1, xp_gain: 1}, {type: "thin air", stage: 1, xp_gain: 3}],
        enemies_list: ["Angry-looking mountain goat"],
        enemy_group_size: [1,1],
        enemy_stat_variation: 0,
        is_unlocked: false, 
        name: "Fight the angry mountain goat", 
        leave_text: "loc Fight the angry mountain goat leave",
        parent_location: locations["Mountain path"],
        repeatable_reward: {
            locations: [{location: "Small flat area in mountains"}],
            xp: 500,
        },
        unlock_text: "loc Fight the angry mountain goat unlock",
        temperature_modifier: -2,
    });
    locations["Mountain path"].connected_locations.push({location: locations["Fight the angry mountain goat"], custom_text: "travel Fight the angry goat", travel_time: 0});

    locations["Fight the giant crab"] = new Challenge_zone({
        //crab 1
        description: "desc location Fight the giant crab",
        enemy_count: 1, 
        types: [{type: "open", stage: 1, xp_gain: 2}],
        enemies_list: ["Giant crab"],
        enemy_stat_variation: 0,
        is_unlocked: true, 
        name: "Fight the giant crab", 
        leave_text: "loc Fight the giant crab leave",
        parent_location: locations["Downstream from the village"],
        repeatable_reward: {
            locations: [{location: "Riverbank"}],
            xp: 2000,
            move_to: {location: "Riverbank"},
            quest_progress: [{quest_id: "Giant Enemy Crab", task_index: 0}],
            locks: {locations: ["Downstream from the village"]}, 
        },
        unlock_text: "loc Fight the giant crab unlock",
        temperature_modifier: 0.6,
    });
    locations["Downstream from the village"].connected_locations.push({location: locations["Fight the giant crab"], custom_text: "travel Fight the giant crab", travel_time: 5});


    locations["Fight the giant crab again"] = new Challenge_zone({      //crab 2
        description: "desc location Fight the giant crab again",
        enemy_count: 1, 
        types: [{type: "open", stage: 2, xp_gain: 5}, {type: "rough", stage: 1, xp_gain: 3}],
        enemies_list: ["Enraged giant crab"],
        enemy_stat_variation: 0,
        is_unlocked: true, 
        name: "Fight the giant crab again!", 
        leave_text: "loc Fight the giant crab again leave",
        parent_location: locations["Further downstream"],
        repeatable_reward: {
            locations: [{location: "Lake beach"}],
            xp: 5000,
            move_to: {location: "Lake beach"},
            quest_progress: [{quest_id: "Giant Enemy Crab", task_index: 1}],
            locks: {locations: ["Further downstream"]}, 
        },
        unlock_text: "loc Fight the giant crab again unlock",
        temperature_modifier: 1,
    });
    locations["Further downstream"].connected_locations.push({location: locations["Fight the giant crab again"], custom_text: "travel Fight the giant crab again", travel_time: 5});
  
    locations["Forest den traversal"] = new Challenge_zone({
        description: "desc location Forest den traversal",
        enemies_list: ["Direwolf"],
        enemy_count: 50,
        enemy_group_size: [2,3],
        enemy_groups_list: [{enemies: ["Direwolf hunter"]}],
        predefined_lineup_on_nth_group: 4,
        is_unlocked: false,
        enemy_stat_variation: 0.2,
        name: "Forest den traversal",
        types: [{type: "narrow", stage: 2, xp_gain: 5}, {type: "dark", stage: 2, xp_gain: 5}],
        parent_location: locations["Forest road"],
        repeatable_reward: {
            xp: 1000,
            messages: ["reward msg through the water"],
            locations: [{ location: "Forest lake" }],
            move_to: {location: "Forest lake"}
        },
        temperature_range_modifier: 0.8,
        is_under_roof: true,
    });
    locations["Forest road"].connected_locations.push({location: locations["Forest den traversal"], custom_text: "travel Try to get to the other side of the [Forest den]", travel_time: 90});
})();

//add activities
(function(){
    locations["Village"].activities = {
        "fieldwork": new LocationActivity({
            activity_name: "fieldwork",
            starting_text: "activity Village fieldwork starting",
            get_payment: () => {
                return 15 + Math.round(25 * get_total_skill_level("Farming")/skills["Farming"].max_level);
            },
            is_unlocked: false,
            working_period: 60*2,
            availability_time: {start: 6, end: 20},
            availability_seasons: ["Spring","Summer","Autumn"],
            skill_xp_per_tick: 1,
        }),
        "running": new LocationActivity({
            activity_name: "running",
            starting_text: "activity Village running starting",
            skill_xp_per_tick: 1,
            is_unlocked: false,
        }),
        "weightlifting": new LocationActivity({
            activity_name: "weightlifting",
            starting_text: "activity Village weightlifting starting",
            skill_xp_per_tick: 1,
            is_unlocked: false,
        }),
        "swimming": new LocationActivity({
            activity_name: "swimming",
            starting_text: "activity Village swimming starting",
            infinite: false,
            availability_seasons: ["Spring", "Summer", "Autumn"],
            skill_xp_per_tick: 1,
            is_unlocked: true,
            applied_effects: [{effect: "Wet", duration: 30}],
        }),
        "balancing": new LocationActivity({
            activity_name: "balancing",
            starting_text: "activity Village balancing starting",
            unlock_text: "activity Village balancing unlock",
            skill_xp_per_tick: 1,
            is_unlocked: false,
        }),
        "meditating": new LocationActivity({
            activity_name: "meditating",
            starting_text: "activity Village meditating starting",
            skill_xp_per_tick: 1,
            is_unlocked: true,
        }),
        "patrolling": new LocationActivity({
            activity_name: "patrolling",
            starting_text: "activity Village patrolling starting",
            get_payment: () => {return 50},
            is_unlocked: false,
            working_period: 60*2,
            skill_xp_per_tick: 1
        }),
        "woodcutting": new LocationGatheringActivity({
            activity_name: "woodcutting",
            starting_text: "activity Village woodcutting starting",
            skill_xp_per_tick: 1,
            is_unlocked: true,
            gained_resources: {
                resources: [{name: "Rough wood log", ammount: [[1,1], [1,1]], chance: [0.5, 1]}, {name: "Tree sap", ammount: [[1,1], [1,1]], chance: [0.01, 0.1]}], 
                time_period: [30, 10],
                skill_required: [0, 15]
            },
            require_tool: true,
        }),
        "sand": new LocationGatheringActivity({
            activity_id: "sand",
            activity_name: "digging",
            starting_text: "activity Village sand starting",
            skill_xp_per_tick: 1,
            is_unlocked: false,
            gained_resources: {
                resources: [{ name: "Silica Sand", ammount: [[1, 1], [1, 3]], chance: [0.4, 1.0] }],
                time_period: [60, 30],
                skill_required: [0, 15]
            },
            require_tool: true,
            unlock_text: "activity Village sand unlock",
        }),
        "fishing": new LocationGatheringActivity({
            activity_name: "fishing",
            starting_text: "activity Village fishing starting",
            availability_seasons: ["Spring", "Summer", "Autumn"],
            skill_xp_per_tick: 1,
            is_unlocked: true,
            gained_resources: {
                resources: [
                    {name: "Ratfish", chance: [0.3, 0.5]},
                    {name: "Minnow", chance: [0.1, 0.5]},
                    {name: "Trout", chance: [0.01, 0.20]},
                    {name: "Mackerel shark", chance: [0.001, 0.05]}
                ],
                roll_quality: true,
                time_period: [80, 20],
                skill_required: [0, 15],
            },
            require_tool: true,
        })
    };
    locations["Nearby cave"].activities = {
        "weightlifting": new LocationActivity({
            activity_name: "weightlifting",
            starting_text: "activity Nearby cave weightlifting starting",
            skill_xp_per_tick: 4,
            is_unlocked: false,
            unlock_text: "activity Nearby cave weightlifting unlock",
        }),
        "climbing": new LocationActivity({
            activity_name: "climbing",
            starting_text: "activity Nearby cave climbing starting",
            skill_xp_per_tick: 1,
            is_unlocked: true,
        }),
        "meditating": new LocationActivity({
            activity_name: "meditating",
            starting_text: "activity Nearby cave meditating starting",
            skill_xp_per_tick: 4,
            is_unlocked: false,
            unlock_text: "activity Nearby cave meditating unlock"
        }),
        "mining stone": new LocationGatheringActivity({
            activity_name: "mining",
            starting_text: "activity Nearby cave mining stone starting",
            skill_xp_per_tick: 0.5,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Stone brick", ammount: [[1,1], [1,1]], chance: [0.2, 1]}],
                time_period: [40, 10],
                skill_required: [0, 15],
            },
            require_tool: true,
        }),
        "mining": new LocationGatheringActivity({
            activity_name: "mining",
            starting_text: "activity Nearby cave mining starting",
            skill_xp_per_tick: 1,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Low quality iron ore", ammount: [[1,1], [1,3]], chance: [0.4, 1]}], 
                time_period: [40, 15],
                skill_required: [0, 15]
            },
            unlock_text: "activity Nearby cave mining unlock",
        }),
        "mining2": new LocationGatheringActivity({
            activity_name: "mining",
            starting_text: "activity Nearby cave mining2 starting",
            skill_xp_per_tick: 5,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Iron ore", ammount: [[1,1], [1,3]], chance: [0.3, 1]}],
                time_period: [90, 20],
                skill_required: [7, 24]
            },
            unlock_text: "activity Nearby cave mining2 unlock",
        }),
        "mining3": new LocationGatheringActivity({
            activity_name: "mining",
            starting_text: "activity Nearby cave mining3 starting",
            skill_xp_per_tick: 16,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Atratan ore", ammount: [[1,1], [1,3]], chance: [0.3, 1]}],
                time_period: [120, 40],
                skill_required: [12, 30]
            },
            unlock_text: "activity Nearby cave mining3 unlock",
        }),
    };
    locations["Forest road"].activities = {
        "running": new LocationActivity({
            activity_name: "running",
            starting_text: "activity Forest road running starting",
            skill_xp_per_tick: 4,
        }),
        "woodcutting": new LocationGatheringActivity({
            activity_name: "woodcutting",
            starting_text: "activity Forest road woodcutting starting",
            skill_xp_per_tick: 5,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Wood log", ammount: [[1,1], [1,1]], chance: [0.3, 1]}, {name: "Tree sap", ammount: [[1,1], [1,1]], chance: [0.01, 0.1]}],
                time_period: [120, 30],
                skill_required: [7, 22]
            },
        }),
        "woodcutting2": new LocationGatheringActivity({
            activity_name: "woodcutting",
            starting_text: "activity Forest road woodcutting2 starting",
            skill_xp_per_tick: 12,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Ash wood log", ammount: [[1,1], [1,1]], chance: [0.3, 1]}, {name: "Tree sap", ammount: [[1,1], [1,1]], chance: [0.01, 0.1]}],
                time_period: [120, 45],
                skill_required: [12, 30]
            },
            unlock_text: "activity Forest road woodcutting2 unlock",
        }),
        "herbalism": new LocationGatheringActivity({
            activity_name: "herbalism",
            starting_text: "activity Forest road herbalism starting",
            skill_xp_per_tick: 2,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    {name: "Oneberry", chance: [0.1, 0.5]},
                    {name: "Golmoon leaf", chance: [0.1, 0.7]},
                    {name: "Belmart leaf", chance: [0.1, 0.7]}
                ], 
                time_period: [120, 20],
                skill_required: [0, 15]
            },
            require_tool: true,
        }),
    };
    locations["Carya Canyon"].activities = {
        "woodcutting": new LocationGatheringActivity({
            activity_name: "woodcutting",
            starting_text: "activity Carya Canyon woodcutting starting",
            skill_xp_per_tick: 16,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Hickory wood log", ammount: [[1,1], [1,1]], chance: [0.3, 1]}, {name: "Tree sap", ammount: [[1,1], [1,1]], chance: [0.01, 0.1]}],
                time_period: [120, 45],
                skill_required: [20, 35],
                scales_with_skill: true,
            },
            unlock_text: "activity Carya Canyon woodcutting unlock",
        }),
        "herbalism": new LocationGatheringActivity({
            activity_name: "herbalism",
            starting_text: "activity Carya Canyon herbalism starting",
            skill_xp_per_tick: 5,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    {name: "Belmart leaf", ammount: [[1,1], [1,2]], chance: [0.2, 1]},
                    {name: "Golmoon leaf", chance: [0.05, 0.4]},
                ],
                time_period: [120, 30],
                skill_required: [10, 25],
            },
            require_tool: true,
            unlock_text: "activity Carya Canyon herbalism unlock",
        }),
    };

    /*
        The second gate, in two steps, because the room's own line is about
        understanding rather than force: first you work out what the floor is doing
        and what that means you need, then you make it and use it.

        The rod is REQUIRED but not removed. It is a key, not a consumable.
    */
    locations["Mysterious depths"].actions = {
        "read the tiles": new GameAction({
            action_id: "read the tiles",
            action_name: "action read the tiles name",
            starting_text: "action read the tiles starting",
            description: "action read the tiles desc",
            action_text: "action read the tiles during",
            success_text: "action read the tiles success",
            is_unlocked: true,
            conditions: [
                {skills: {Perception: 10}},
                {skills: {Perception: 25}},
            ],
            failure_texts: {
                conditional_loss: ["action read the tiles fail conditional_loss 1"],
            },
            attempt_duration: 120,
            success_chances: [0.3, 1],
            rewards: {
                skill_xp: {Perception: 600},
                recipes: [{category: "crafting", subcategory: "items", recipe_id: "Silver divining rod"}],
            },
        }),
        "trace the pattern": new GameAction({
            action_id: "trace the pattern",
            action_name: "action trace the pattern name",
            starting_text: "action trace the pattern starting",
            description: "action trace the pattern desc",
            action_text: "action trace the pattern during",
            success_text: "action trace the pattern success",
            is_unlocked: false,
            required: {
                items_by_id: {"Silver divining rod": {count: 1}},
            },
            failure_texts: {
                unable_to_begin: ["action trace the pattern fail unable_to_begin 1"],
            },
            attempt_duration: 180,
            success_chances: [1],
            rewards: {
                xp: 3000,
                locations: [{location: "Throne room"}],
                quest_progress: [{quest_id: "The Infinite Rat Saga", task_index: 3}],
            },
        }),
    };
    locations["Mysterious depths"].actions["read the tiles"].rewards.actions =
        [{location: "Mysterious depths", action: "trace the pattern"}];

    locations["Town outskirts"].activities = {
        "herbalism": new LocationGatheringActivity({
            activity_name: "herbalism",
            starting_text: "activity Town outskirts herbalism starting",
            skill_xp_per_tick: 4,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    {name: "Cooking herbs", ammount: [[1,1], [2,4]], chance: [0.1, 1]},
                ], 
                time_period: [120, 20],
                skill_required: [5, 20]
            },
            require_tool: true,
            unlock_text: "activity Town outskirts herbalism unlock"
        }),
    };
    locations["Town farms"].activities = {
        "fieldwork": new LocationActivity({
            activity_name: "fieldwork",
            starting_text: "activity Town farms fieldwork starting",
            get_payment: () => {
                return 30 + Math.round(30 * get_total_skill_level("Farming")/skills["Farming"].max_level);
            },
            is_unlocked: false,
            working_period: 60*2,
            availability_time: {start: 6, end: 20},
            availability_seasons: ["Spring", "Summer", "Autumn"],
            skill_xp_per_tick: 2,
        }),
        "animal care": new LocationGatheringActivity({
            activity_name: "animal care",
            starting_text: "activity Town farms animal care starting",
            skill_xp_per_tick: 3,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    {name: "Wool", ammount: [[1,1], [1,3]], chance: [0.1, 1]},
                ], 
                time_period: [120, 30],
                skill_required: [0, 15]
            },
        }),
    };
    locations["Mountain path"].activities = {
        "balancing": new LocationActivity({
            activity_name: "balancing",
            starting_text: "activity Mountain path balancing starting",
            skill_xp_per_tick: 4,
            is_unlocked: true,
        }),
    };
    locations["Mountain camp"].activities = {
        "herbalism": new LocationGatheringActivity({
            activity_name: "herbalism",
            starting_text: "activity Mountain camp herbalism starting",
            skill_xp_per_tick: 6,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    { name: "Silver thistle", chance: [0.1, 1] },
                ],
                time_period: [120, 40],
                skill_required: [7, 24]
            },
            require_tool: true,
        }),
        "balancing": new LocationActivity({
            activity_name: "balancing",
            starting_text: "activity Mountain camp balancing starting",
            skill_xp_per_tick: 4,
            is_unlocked: true,
        }),
        "climbing": new LocationActivity({
            activity_name: "climbing",
            starting_text: "activity Mountain camp climbing starting",
            skill_xp_per_tick: 4,
            is_unlocked: true,
        }),
    }
	
    locations["Riverbank"].activities = {
        "herbalism": new LocationGatheringActivity({
            activity_name: "herbalism",
            starting_text: "activity Riverbank herbalism starting",
            skill_xp_per_tick: 9,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Flax", ammount: [[1,1], [1,3]], chance: [0.4, 1]}], 
                time_period: [120, 40],
                skill_required: [12, 27]
            },
            require_tool: true,
        }),
    };
	
    locations["Lake beach"].activities = {
        "swimming": new LocationActivity({
            activity_name: "swimming",
            starting_text: "activity Lake beach swimming starting",
            infinite: false,
            availability_seasons: ["Spring", "Summer", "Autumn"],
            skill_xp_per_tick: 7,
            is_unlocked: false,
            applied_effects: [{effect: "Wet", duration: 30}],
        }),
        "sand": new LocationGatheringActivity({
            activity_id: "sand",
            activity_name: "digging",
            starting_text: "activity Lake beach sand starting",
            skill_xp_per_tick: 10,
            is_unlocked: false,
            gained_resources: {
                resources: [{ name: "Clam", ammount: [[1, 3], [1, 3]], chance: [0.34, 1.0] }],
                time_period: [60, 20],
                skill_required: [10, 22]
            },
            require_tool: true,
        }),
        "climbing": new LocationActivity({
            activity_name: "climbing",
            starting_text: "activity Lake beach climbing starting",
            skill_xp_per_tick: 10,
            is_unlocked: false,
        }),
        "weightlifting": new LocationActivity({
            activity_name: "weightlifting",
            starting_text: "activity Lake beach weightlifting starting",
            skill_xp_per_tick: 10,
            is_unlocked: false,
        }),
        "running": new LocationActivity({
            activity_name: "running",
            starting_text: "activity Lake beach running starting",
            skill_xp_per_tick: 10,
            is_unlocked: true,
        }),
    };

    locations["Forest lake"].activities = {
        "swimming": new LocationActivity({
            activity_name: "swimming",
            starting_text: "activity Forest lake swimming starting",
            skill_xp_per_tick: 4,
            is_unlocked: true,
            infinite: false,
            availability_seasons: ["Spring", "Summer", "Autumn"],
            applied_effects: [{ effect: "Wet", duration: 30 }],
        }),
        "balancing": new LocationActivity({
            activity_name: "balancing",
            starting_text: "activity Forest lake balancing starting",
            skill_xp_per_tick: 7,
            is_unlocked: true,
            applied_effects: [{ effect: "Wet", duration: 30 }],
        }),
        "woodcutting": new LocationGatheringActivity({
            activity_name: "woodcutting",
            starting_text: "activity Forest lake woodcutting starting",
            skill_xp_per_tick: 10,
            is_unlocked: true,
            gained_resources: {
                resources: [{name: "Piece of willow wood", ammount: [[1,1], [2,5]], chance: [0.3, 1]}, {name: "Tree sap", ammount: [[1,1], [1,1]], chance: [0.01, 0.1]}],
                time_period: [20, 10],
                skill_required: [12, 25]
            }
        }),
        "mining": new LocationGatheringActivity({
            activity_name: "mining",
            starting_text: "activity Forest lake mining starting",
            skill_xp_per_tick: 1,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Silver ore", ammount: [[1,1], [1,3]], chance: [0.3, 0.7]}],
                time_period: [120, 30],
                skill_required: [10, 22]
            },
            unlock_text: "activity Forest lake mining unlock",
        }),
        "fishing": new LocationGatheringActivity({
            activity_name: "fishing",
            starting_text: "activity Forest lake fishing starting",
            skill_xp_per_tick: 4,
            is_unlocked: true,
            gained_resources: {
                resources: [
                    { name: "Ratfish", chance: [0.2, 0.8] },
                    { name: "Carp", chance: [0.1, 0.5] },
                    { name: "Mackerel shark", chance: [0.05, 0.2] },
                    { name: "Catfish", chance: [0.01, 0.1] }
                ],
                time_period: [120, 30],
                skill_required: [10, 22],
                roll_quality: true,
            },
            require_tool: true,
        }),
    };
	
    locations["Waterfall basin"].activities = {
        "enduring": new LocationActivity({
            activity_name: "enduring",
            starting_text: "activity Waterfall basin enduring starting",
            applied_effects: [{effect: "Wet", duration: 30}],
            infinite: false,
            availability_seasons: ["Spring", "Summer", "Autumn"],
            gained_skills: {"Iron skin": 2, "Persistence": 1},
        }),
        "meditating": new LocationActivity({
            activity_name: "meditating",
            starting_text: "activity Waterfall basin meditating starting",
            skill_xp_per_tick: 8,
            is_unlocked: false,
            unlock_text: "activity Waterfall basin meditating unlock",
        }),
    };
	

    /*
        What they gathered. Flax is the point: the guild factor wants twenty Linen
        cloth, a cloth is ten Flax, and until now all two hundred had to come from
        a single Riverbank activity on the far side of the map. A tribe gathering
        ground that yields the tribe's own cloth material closes that loop.

        Locked until the grove is cleared, because the crabs are the reason nobody
        gathers here.
    */
    locations["Wet woods"].activities = {
        "herbalism": new LocationGatheringActivity({
            activity_name: "herbalism",
            starting_text: "activity Wet woods herbalism starting",
            skill_xp_per_tick: 12,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    {name: "Flax", ammount: [[2, 3], [4, 6]], chance: [0.6, 1]},
                    {name: "Cooking herbs", ammount: [[1, 1], [1, 2]], chance: [0.2, 0.5]},
                ],
                time_period: [100, 35],
                skill_required: [15, 28],
            },
            require_tool: true,
            unlock_text: "activity Wet woods herbalism unlock",
        }),
    };

    locations["Swampland tribe"].activities = {
        "herbalism": new LocationGatheringActivity({
            activity_name: "herbalism",
            starting_text: "activity Swampland tribe herbalism starting",
            skill_xp_per_tick: 14,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    {name: "Wild onion", chance: [0.2, 0.65]},
                    {name: "Wild garlic", chance: [0.2, 0.65]},
                    {name: "Wild potato", ammount: [[1,1], [1,2]], chance: [0.3, 0.6]},
                    {name: "Cooking herbs", ammount: [[1,1], [1,2]], chance: [0.3, 0.6]}
                ], 
                time_period: [90, 30],
                skill_required: [21, 30],
            }
        }),
    };
})();

//add actions
(function(){
    locations["Village"].actions = {
        "search for delivery": new GameAction({
            action_id: "search for delivery",
            starting_text: "action search for delivery starting",
            description: "action search for delivery desc",
            action_text: "action search for delivery during",
            success_text: "action search for delivery success",
            failure_texts: {
                random_loss: [
                    "action search for delivery fail random_loss 1",
                ],
                conditional_loss: [
                    "action search for delivery fail conditional_loss 1",
                ]
            },
            conditions: [
                {
                    skills: {
                        "Perception": 1,
                    }
                },
                {
                    skills: {
                        "Perception": 5,
                    }
                }
            ],
            attempt_duration: 15,
            success_chances: [0.5, 1],
            rewards: {
                actions: [{location: "Village", action: "carry grain"}, {location: "Village", action: "pull cart"}, {location: "Village", action: "convince horse"}, {location: "Village", action: "carry cart"}],
                skill_xp: {
                    Perception: 100,
                }
            },
        }),
        "carry grain": new GameAction({
            action_id: "carry grain",
            starting_text: "action carry grain starting",
            description: "action carry grain desc",
            action_text: "action carry grain during",
            success_text: "action carry grain success",
            failure_texts: {
                unable_to_begin: ["action carry grain fail unable_to_begin 1"],
            },
            check_conditions_on_finish: false,
            attempt_duration: 480,
            success_chances: [1],
            keep_progress: true,
            required: {
                stats: {
                    strength: 20,
                    max_stamina: 80,
                }
            },
            rewards: {
                move_to: {location: "Eastern mill"},
                skill_xp: {Weightlifting: 300},
                textlines: [{dialogue: "village millers", lines: ["delivered"]}],
                locks: {
                    actions: [{location: "Village", action: "pull cart"}, {location: "Village", action: "convince horse"}, {location: "Village", action: "carry cart"}],
                },
            },
        }),
        "pull cart": new GameAction({
            action_id: "pull cart",
            starting_text: "action pull cart starting",
            description: "action pull cart desc",
            action_text: "action pull cart during",
            success_text: "action pull cart success",
            failure_texts: {
                unable_to_begin: ["action pull cart fail unable_to_begin 1"],
            },
            check_conditions_on_finish: false,
            attempt_duration: 60,
            success_chances: [1],
            keep_progress: true,
            required: {
                    stats: {
                        strength: 45,
                    }
            },
            rewards: {
                move_to: {location: "Eastern mill"},
                skill_xp: {Weightlifting: 300},
                textlines: [{dialogue: "village millers", lines: ["delivered"]}],
                locks: {
                    actions: [{location: "Village", action: "carry grain"}, {location: "Village", action: "convince horse"}, {location: "Village", action: "carry cart"}],
                },
            },
        }),
        "convince horse": new GameAction({
            action_id: "convince horse",
            starting_text: "action convince horse starting",
            description: "action convince horse desc",
            action_text: "action convince horse during",
            success_text: "action convince horse success",
            failure_texts: {
                conditional_loss: ["action convince horse fail conditional_loss 1"],
            },
            attempt_duration: 10,
            success_chances: [1],
            conditions: [
                {
                    skills: {
                        "Animal handling": 8,
                    }
                },
            ],
            rewards: {
                move_to: {location: "Eastern mill"},
                skill_xp: {"Animal handling": 300},
                textlines: [{dialogue: "village millers", lines: ["delivered"]}],
                locks: {
                    actions: [{location: "Village", action: "pull cart"}, {location: "Village", action: "carry grain"}, {location: "Village", action: "carry cart"}],
                },
            },
        }),
        "carry cart": new GameAction({
            //BECAUSE PEOPLE ASKED AND MIK IS A BENEVOLENT CAT
            action_id: "carry cart",
            starting_text: "action carry cart starting",
            description: "action carry cart desc",
            action_text: "action carry cart during",
            success_text: "action carry cart success",
            failure_texts: {
                conditional_loss: ["action carry cart fail conditional_loss 1"],
            },
            check_conditions_on_finish: false,
            attempt_duration: 10,
            success_chances: [1],
            conditions: [
                {
                    skills: {
                        "Weightlifting": 21,
                    }
                },
            ],
            display_conditions: {
                skills: {
                    "Weightlifting": 24,
                }
            },
            rewards: {
                move_to: {location: "Eastern mill"},
                skill_xp: {"Weightlifting": 2e6},
                textlines: [{dialogue: "village millers", lines: ["delivered"]}],
                locks: {
                    actions: [{location: "Village", action: "pull cart"}, {location: "Village", action: "carry grain"},{location: "Village", action: "convince horse"}],
                },
            },
        }),
        "hike down river": new GameAction({
            action_id: "hike down river",
            starting_text: "action hike down river starting",
            description: "action hike down river desc",
            action_text: "action hike down river during",
            success_text: "action hike down river success",
            attempt_duration: 2160,
            success_chances: [1],
            rewards: {
                locations: [{location: "Downstream from the village"}],
                move_to: {location: "Downstream from the village"},
            },
        }),
        "dig canal": new GameAction({
            action_id: "dig canal",
            starting_text: "action dig canal starting",
            description: "action dig canal desc",
            action_text: "action dig canal during",
            success_text: "action dig canal success",
            failure_texts: {
                unable_to_begin: ["action dig canal fail unable_to_begin 1"],
            },
            check_conditions_on_finish: false,
            attempt_duration: 600,
            success_chances: [1],
            keep_progress: true,
            required: {
                tools_by_slot: ["shovel"],
            },
            rewards: {
                skill_xp: {Digging: 100},
                textlines: [{dialogue: "village elder", lines: ["finished digging"]}],
                quest_progress: [
                        {quest_id: "Village expansion", task_index: 0},
                    ]
            }, 
        }),
        "bridge mat delivery": new GameAction({
            action_id: "bridge mat delivery",
            starting_text: "action bridge mat delivery starting",
            description: "action bridge mat delivery desc",
            action_text: "action bridge mat delivery during",
            success_text: "action bridge mat delivery success",
            failure_texts: {
                unable_to_begin: ["action bridge mat delivery fail unable_to_begin 1"],
            },
            success_chances: [1],
            required: {
                items_by_id: {
                    "Wood log": {count: 100, remove_on_success: true},
                    "Stone brick": {count: 500, remove_on_success: true},
                },
            },
            rewards: {
                actions: [{location: "Village", action: "bridge construction"}]
            }, 
        }),

        "bridge construction": new GameAction({
            action_id: "bridge construction",
            starting_text: "action bridge construction starting",
            description: "action bridge construction desc",
            action_text: "action bridge construction during",
            success_text: "action bridge construction success",
            failure_texts: {},
            attempt_duration: 720,
            success_chances: [1],
            rewards: {
                quest_progress: [
                        {quest_id: "Village expansion", task_index: 3},
                    ],
                textlines: [{dialogue: "village elder", lines: ["bridge finished"]}],
            },
            keep_progress: true,
        }),
    };
    locations["Nearby cave"].actions = {
        "open the gate": new GameAction({
            action_id: "open the gate",
            starting_text: "action open the gate starting",
            description: "action open the gate desc",
            action_text: "action open the gate during",
            success_text: "action open the gate success",
            failure_texts: {
                conditional_loss: ["action open the gate fail conditional_loss 1"],
            },
            conditions: [
                {
                    stats: {
                        strength: 200,
                    }
                }
            ],
            attempt_duration: 10,
            success_chances: [1],
            rewards: {
                locations: [{location: "Writhing tunnel"}],
                quest_progress: [
                    {quest_id: "The Infinite Rat Saga", task_index: 1},
                ]
            },
        }),
        "climb the mountain": new GameAction({
            action_id: "climb the mountain",
            starting_text: "action climb the mountain starting",
            description: "action climb the mountain desc",
            action_text: "action climb the mountain during",
            success_text: "action climb the mountain success",
            failure_texts: {
                conditional_loss: ["action climb the mountain fail conditional_loss 1"],
                random_loss: [
                    "action climb the mountain fail random_loss 1",
                    "action climb the mountain fail random_loss 2",
                    "action climb the mountain fail random_loss 3"
                ],
                unable_to_begin: ["action climb the mountain fail unable_to_begin 1"],
            },
            required: {
                items_by_id: {"Coil of rope": {count: 1, remove_on_success: true}},
            },
            conditions: [
                {
                    skills: {
                        "Climbing": 7,
                    },
                    stats: {
                        strength: 50,
                        agility: 50,
                        max_stamina: 50,
                    }
                },
                {
                    skills: {
                        "Climbing": 12,
                    },
                    stats: {
                        strength: 120,
                        agility: 120,
                        max_stamina: 50,
                    }
                }
            ],
            attempt_duration: 60,
            success_chances: [0.3, 1],
            rewards: {
                locations: [{location: "Mountain path"}],
                move_to: {location: "Mountain path"},
                skill_xp: {
                    "Climbing": 1000,
                }
            },
        }),
    };
    locations["Mountain path"].actions = {
        "explore": new GameAction({
            action_id: "explore",
            starting_text: "action explore starting",
            description: "action explore desc",
            action_text: "action explore during",
            success_text: "action explore success",
            failure_texts: {
                random_loss: [
                    "action explore fail random_loss 1",
                    "action explore fail random_loss 2",
                ],
                conditional_loss: [
                    "action explore fail conditional_loss 1",
                ]
            },
            conditions: [
                {
                    skills: {
                        "Perception": 1,
                    }
                },
                {
                    skills: {
                        "Perception": 12,
                    }
                }
            ],
            is_unlocked: true,
            attempt_duration: 60,
            success_chances: [0.1, 1],
            rewards: {
                locations: [{location: "Fight the angry mountain goat"}],
                skill_xp: {
                    Perception: 150,
                }
            },
        }),
    };
    locations["Small flat area in mountains"].actions = {
        "create camp": new GameAction({
            action_id: "create camp",
            starting_text: "action create camp starting",
            description: "action create camp desc",
            action_text: "action create camp during",
            success_text: "action create camp success",
            conditions: [
                {
                    items_by_id: {"Camping supplies": {count: 1, remove: true}},
                }
            ],
            is_unlocked: true,
            check_conditions_on_finish: false,
            failure_texts: {
                conditional_loss: ["action create camp fail conditional_loss 1"],
            },
            attempt_duration: 180,
            success_chances: [1],
            rewards: {
                locations: [{location: "Mountain camp"}],
                move_to: {location: "Mountain camp"},
                locks: {
                    locations: ["Mountain path", "Small flat area in mountains"],
                }
            },
        }),
    },
    locations["Mountain camp"].actions = {
        "explore1": new GameAction({
            action_id: "explore1",
            starting_text: "action explore1 starting",
            description: "action explore1 desc",
            action_text: "action explore1 during",
            success_text: "action explore1 success",
            failure_texts: {
                random_loss: [
                    "action explore1 fail random_loss 1",
                    "action explore1 fail random_loss 2",
                ],
                conditional_loss: [
                    "action explore1 fail conditional_loss 1",
                ]
            },
            conditions: [
                {
                    skills: {
                        "Perception": 1,
                    }
                },
                {
                    skills: {
                        "Perception": 12,
                    }
                }
            ],
            is_unlocked: true,
            attempt_duration: 60,
            success_chances: [0.1, 1],
            rewards: {
                locations: [{location: "Gentle mountain slope"}],
                actions: [{location:"Mountain camp", action: "explore2"}],
                skill_xp: {
                    Perception: 150,
                }
            },
        }),
        "explore2": new GameAction({
            action_id: "explore2",
            starting_text: "action explore2 starting",
            description: "action explore2 desc",
            action_text: "action explore2 during",
            success_text: "action explore2 success",
            failure_texts: {
                random_loss: [
                    "action explore2 fail random_loss 1",
                    "action explore2 fail random_loss 2",
                ],
                conditional_loss: [
                    "action explore2 fail conditional_loss 1",
                    "action explore2 fail conditional_loss 2",
                ]
            },
            conditions: [
                {
                        
                    skills: {
                            "Herbalism": 6,
                            Perception: 1,
                        },
                },
                {
                        skills: {
                            "Herbalism": 10,
                            Perception: 12,
                        },
                }
            ],
            is_unlocked: false,
            attempt_duration: 60,
            success_chances: [0.5],
            rewards: {
                activities: [{location:"Mountain camp", activity:"herbalism"}],
                skill_xp: {
                    Perception: 150,
                }
            },
        }),
    }
    locations["Forest road"].actions = {
        "search for boars": new GameAction({
            action_id: "search for boars",
            starting_text: "action search for boars starting",
            description: "action search for boars desc",
            action_text: "action search for boars during",
            success_text: "action search for boars success",
            failure_texts: {
                random_loss: [
                    "action search for boars fail random_loss 1",
                ],
                conditional_loss: [
                    "action search for boars fail conditional_loss 1",
                ]
            },
            conditions: [
                {
                    skills: {
                        "Perception": 1,
                    }
                },
                {
                    skills: {
                        "Perception": 8,
                    }
                }
            ],
            attempt_duration: 90,
            success_chances: [0.5, 1],
            rewards: {
                locations: [{location: "Forest clearing"}],
                skill_xp: {
                    Perception: 100,
                }
            },
        }),
        "follow the trail": new GameAction({
            action_id: "follow the trail",
            starting_text: "action follow the trail starting",
            description: "action follow the trail desc",
            action_text: "action follow the trail during",
            success_text: "action follow the trail success",
            failure_texts: {
                random_loss: [
                    "action follow the trail fail random_loss 1",
                ],
            },
            attempt_duration: 180,
            success_chances: [0.7],
            rewards: {
                locations: [{location: "Forest den"}],
            },
            unlock_text: "action follow the trail unlock"
        }),

        "What was that noise?": new GameAction({
            action_id: "What was that noise?",
            starting_text: "action What was that noise? starting",
            description: "action What was that noise? desc",
            action_text: "action What was that noise? during",
            success_text: "action What was that noise? success",
            failure_texts: {
                random_loss: [
                    "action What was that noise? fail random_loss 1",
                ],
                conditional_loss: [
                    "action What was that noise? fail conditional_loss 1",
                ]
            },
            conditions: [
                {
                    skills: {
                        "Perception": 5
                    }
                },
                {
                    skills: {
                        "Perception": 15
                    }
                }
            ],
            attempt_duration: 180,
            success_chances: [0.2, 1],
            rewards: {
                locations: [{location: "Carya Canyon"}],
                skill_xp: {
                    Perception: 200,
                }
            },
            unlock_text: "action What was that noise? unlock"
        }),

        "search predator": new GameAction({
            action_id: "search predator",
            starting_text: "action search predator starting",
            description: "action search predator desc",
            action_text: "action search predator during",
            success_text: "action search predator success",
            failure_texts: {
                random_loss: [
                    "action search predator fail random_loss 1",
                ],
                conditional_loss: [
                    "action search predator fail conditional_loss 1",
                ]
            },
            attempt_duration: 180,
            success_chances: [0.4, 1],
            conditions: [
                {
                    skills: {
                        "Perception": 1,
                    }
                },
                {
                    skills: {
                        "Perception": 10,
                    }
                }
            ],
            rewards: {
                locations: [{location: "Bears' den"}],
                skill_xp: {
                    Perception: 200,
                }
            },
            unlock_text: "action search predator unlock",
        }),
    };

    locations["Carya Canyon"].actions = {
        "Make a bridge": new GameAction({
            action_id: "Make a bridge",
            starting_text: "action Make a bridge starting",
            description: "action Make a bridge desc",
            action_text: "action Make a bridge during",
            success_text: "action Make a bridge success",
            is_unlocked: true,
            failure_texts: {
                random_loss: [
                    "action Make a bridge fail random_loss 1",
                ],
                conditional_loss: [
                    "action Make a bridge fail conditional_loss 1",
                ]
            },
            conditions: [
                {
                    skills: {
                        "Woodcutting": 20,
                    }
                }
            ],
            attempt_duration: 240,
            success_chances: [0.7],
            rewards: {
                locations: [{location: "Precarious tree bridge"}],
            },
        }),
    }

    locations["Town farms"].actions = {
        "dig for ants 1": new GameAction({
            action_id: "dig for ants 1",
            action_name: "action dig for ants 1 name",
            starting_text: "action dig for ants 1 starting",
            description: "action dig for ants 1 desc",
            action_text: "action dig for ants 1 during",
            success_text: "action dig for ants 1 success",
            attempt_duration: 180,
            success_chances: [1],
            rewards: {
                locations: [{location: "Red ant nest 1"}],
                skill_xp: {Digging: 20},
            },
        }),
        "dig for ants 2": new GameAction({
            action_id: "dig for ants 2",
            action_name: "action dig for ants 2 name",
            starting_text: "action dig for ants 2 starting",
            description: "action dig for ants 2 desc",
            action_text: "action dig for ants 2 during",
            success_text: "action dig for ants 2 success",
            attempt_duration: 240,
            success_chances: [1],
            rewards: {
                locations: [{location: "Red ant nest 2"}],
                skill_xp: {Digging: 30},
            },
        }),
        "dig for ants 3": new GameAction({
            action_id: "dig for ants 3",
            action_name: "action dig for ants 3 name",
            starting_text: "action dig for ants 3 starting",
            description: "action dig for ants 3 desc",
            action_text: "action dig for ants 3 during",
            success_text: "action dig for ants 3 success",
            attempt_duration: 300,
            success_chances: [1],
            rewards: {
                locations: [{location: "Red ant nest 3"}],
                skill_xp: {Digging: 40},
            },
        }),
        "follow ant trail": new GameAction({
            action_id: "follow ant trail",
            action_name: "action follow ant trail name",
            starting_text: "action follow ant trail starting",
            description: "action follow ant trail desc",
            action_text: "action follow ant trail during",
            success_text: "action follow ant trail success",
            attempt_duration: 600,
            success_chances: [1],
            failure_texts: {
                unable_to_begin: ["action follow ant trail fail unable_to_begin 1"],
            },
            required: {
                tools_by_slot: ["shovel"],
            },
            rewards: {
                locations: [{location: "Forest ant nest"}],
                move_to: {location: "Forest road"},
                skill_xp: {Digging: 50},
            },
            unlock_text: "action follow ant trail unlock",
        }),
    };
    locations["Lake beach"].actions = {
        "create lake camp": new GameAction({
            action_id: "create lake camp",
            starting_text: "action create lake camp starting",
            description: "action create lake camp desc",
            action_text: "action create lake camp during",
            success_text: "action create lake camp success",
            conditions: [
                {
                    items_by_id: {"Camping supplies": {count: 1, remove: true}},
                }
            ],
            is_unlocked: true,
            check_conditions_on_finish: false,
            failure_texts: {
                conditional_loss: ["action create lake camp fail conditional_loss 1"],
            },
            attempt_duration: 120,
            success_chances: [1],
            rewards: {
                housing: ["Lake beach"],
                crafting: ["Lake beach"],
                activities: [
                    {location:"Lake beach", activity: "swimming"}, 
                    {location:"Lake beach", activity: "sand"}, 
                ],
                actions: [
                    {location:"Lake beach", action: "rappel waterfall"},
                    {location:"Lake beach", action: "create lake climbing"},
                    {location:"Lake beach", action: "create lake weightlifting"},
                ],
            },
        }),
        "rappel waterfall": new GameAction({
            action_id: "rappel waterfall",
            starting_text: "action rappel waterfall starting",
            description: "action rappel waterfall desc",
            action_text: "action rappel waterfall during",
            success_text: "action rappel waterfall success",
            failure_texts: {
                conditional_loss: ["action rappel waterfall fail conditional_loss 1"],
                random_loss: ["action rappel waterfall fail random_loss 1"],
                unable_to_begin: ["action rappel waterfall fail unable_to_begin 1"],
            },
            required: {
                items_by_id: {"Coil of rope": {count: 1, remove_on_success: true}},
            },
            conditions: [
              {
                  skills: {
                        "Climbing": 17,
                    },
                    stats: {
                        strength: 400,
                        agility: 350,
                        max_stamina: 1000,
                    }
              },
              {
                skills: {
                    "Climbing": 25,
                },
                stats: {
                    strength: 600,
                    agility: 1000,
                    max_stamina: 1500,
                },
                },
            ],
            is_unlocked: false,
            attempt_duration: 180,
            success_chances: [0.45, 1],
            rewards: {
                locations: [{location: "Waterfall basin"}],
                move_to: {location: "Waterfall basin"},
                skill_xp: {
                    "Climbing": 50000,
                }
            }
        }),
        "create lake climbing": new GameAction({
            action_id: "create lake climbing",
            starting_text: "action create lake climbing starting",
            description: "action create lake climbing desc",
            action_text: "action create lake climbing during",
            success_text: "action create lake climbing success",
            conditions: [
                {
                    items_by_id: {"Coil of rope": {count: 1, remove: true}},
                },
            ],
            is_unlocked: false,
            check_conditions_on_finish: false,
            failure_texts: {
                conditional_loss: ["action create lake climbing fail conditional_loss 1"],
            },
            attempt_duration: 60,
            success_chances: [1],
            rewards: {
                activities: [{location:"Lake beach", activity: "climbing"}],
            },
        }),
        "create lake weightlifting": new GameAction({
            action_id: "create lake weightlifting",
            starting_text: "action create lake weightlifting starting",
            description: "action create lake weightlifting desc",
            action_text: "action create lake weightlifting during",
            success_text: "action create lake weightlifting success",
            conditions: [
                {
                    items_by_id: {"Coil of rope": {count: 1, remove: true}},
                },
            ],
            is_unlocked: false,
            check_conditions_on_finish: false,
            failure_texts: {
                conditional_loss: ["action create lake weightlifting fail conditional_loss 1"],
            },
            attempt_duration: 60,
            success_chances: [1],
            rewards: {
                activities: [{location:"Lake beach", activity: "weightlifting"}],
            },
        }),
    };

    locations["Forest lake"].actions = {
        "search1": new GameAction({
            action_id: "search1",
            action_name: "action search1 name",
            starting_text: "action search1 starting",
            description: "action search1 desc",
            action_text: "action search1 during",
            success_text: "action search1 success",
            failure_texts: {
                conditional_loss: ["action search1 fail conditional_loss 1"],
                random_loss: [
                    "action search1 fail random_loss 1",
                    "action search1 fail random_loss 2",
                ],
            },
            conditions: [
                {
                    skills: {
                        "Swimming": 10,
                        "Breathing": 10,
                        Perception: 1,
                    }
                },
                {
                    skills: {
                        "Swimming": 25,
                        "Breathing": 25,
                        Perception: 10,
                    }
                }
            ],
            is_unlocked: true,
            attempt_duration: 120,
            success_chances: [0.2, 1],
            rewards: {
                locations: [{ location: "Frogs" }],
                skill_xp: { Swimming: 500, Breathing: 500, Perception: 500, },
            },
        }),
        "search2": new GameAction({
            action_id: "search2",
            action_name: "action search2 name",
            starting_text: "action search2 starting",
            description: "action search2 desc",
            action_text: "action search2 during",
            success_text: "action search2 success",
            failure_texts: {
                conditional_loss: ["action search2 fail conditional_loss 1"],
                random_loss: [
                    "action search2 fail random_loss 1",
                    "action search2 fail random_loss 2",
                ],
            },
            conditions: [
                {
                  skills: {
                        "Swimming": 10,
                        "Breathing": 10,
                        Perception: 2,
                    }
                },
                {
                    skills: {
                        "Swimming": 25,
                        "Breathing": 25,
                        Perception: 10,
                    }
                }
            ],
            is_unlocked: false,
            attempt_duration: 60,
            success_chances: [0.2, 1],
            rewards: {
                //Was `action:` with an `action` entry. `action` singular is not a
                //reward key, and mining is an activity rather than an action, so
                //this unlocked nothing twice over.
                activities: [{location: "Forest lake", activity: "mining"}],
                skill_xp: { Swimming: 800, Breathing: 800, Perception: 800, },
            },
        }),
        "gaze": new GameAction({
            action_id: "gaze",
            action_name: "action gaze name",
            starting_text: "action gaze starting",
            description: "action gaze desc",
            action_text: "action gaze during",
            success_text: "action gaze success",
            failure_texts: {
                conditional_loss: ["action gaze fail conditional_loss 1"],
                random_loss: ["action gaze fail random_loss 1"],
            },
            is_unlocked: true,
            success_chances: [0,0],
        }),
    },	
    locations["Longhouse"].actions = {
        "learn forage": new GameAction({
            action_id: "learn forage",
            starting_text: "action learn forage starting",
            description: "action learn forage desc",
            action_text: "action learn forage during",
            success_text: "action learn forage success",
            failure_texts: {
                conditional_loss: ["action learn forage fail conditional_loss 1"],
                random_loss: [
                    "action learn forage fail random_loss 1",
                    "action learn forage fail random_loss 2",
                    "action learn forage fail random_loss 3",
                    "action learn forage fail random_loss 4",
                    "action learn forage fail random_loss 5",
                    "action learn forage fail random_loss 6",
                        
              ],
            },
            conditions: [
                {
                    skills: {
                        "Herbalism": 20,
                    },
                },
                {
                    skills: {
                        "Herbalism": 25,
                    },
                },
            ],
            attempt_duration: 60,
            success_chances: [0.45, 1],
            rewards: {
                activities: [{location:"Swampland tribe", activity: "herbalism"}],
            },
        }),
    };
})();

//setup ids
(function(){
    Object.keys(locations).forEach(location_key => {
        Object.keys(locations[location_key].activities || {}).forEach(activity_key => {
            locations[location_key].activities[activity_key].activity_id = activity_key;
        });
        locations[location_key].id = location_key;
    });
})();
fill_market_regions();
export { Location, Combat_zone, LocationActivity, locations, location_types, get_location_type_penalty, favourite_locations };
