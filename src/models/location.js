"use strict";
import { clamp, slerp } from "../misc.js";
import AvailabilityComponent from "../components/availability_component.js";
import { activities } from "../activities.js";
import { availabilities } from "../data/component_references.js";
import { enemy_templates, Enemy } from "../enemies.js";
import { market_regions } from "../market_saturation.js";
import { skills } from "../data/skills.js";
import { location_types } from "../data/locations.js";
import { character } from "../data/character.js";
import { availability_havers } from "../data/component_references.js";


availabilities["location"] = {};

class LocationHousing {
    #availability;
    constructor({
        is_unlocked = true, 
        sleeping_xp_per_tick = 1,
        text_to_sleep = "sleep text generic",
    }) {
        this.#availability = new AvailabilityComponent({is_unlocked});
        this.sleeping_xp_per_tick = sleeping_xp_per_tick;
        this.text_to_sleep = text_to_sleep
    }
    getAvailabilityComponent() {
        return this.#availability;
    }
}

class LocationCrafting {
    #availability;

    /**
     * 
     * @param {Object} param0
     * @param {Boolean} param0.is_unlocked
     * @param {String} param0.use_text
     * @param {Object} param0.tiers
     * @param {Number} param0.tiers.crafting
     * @param {Number} param0.tiers.forging
     * @param {Number} param0.tiers.smelting
     * @param {Number} param0.tiers.cooking
     * @param {Number} param0.tiers.alchemy
     * @param {Number} param0.tiers.butchering
     * @param {Number} param0.tiers.woodworking
     */
    constructor({
        is_unlocked = true,
        use_text = "craft text generic",
        tiers = {
            crafting: 1,
            forging: 1,
            smelting: 1,
            cooking: 1,
            alchemy: 1,
            butchering: 1,
            woodworking: 1,
        }
    }) {
        this.#availability = new AvailabilityComponent({is_unlocked});
        this.use_text = use_text;
        this.tiers = {
            crafting: tiers.crafting || 1,
            forging: tiers.forging || 1,
            smelting: tiers.smelting || 1,
            cooking: tiers.cooking || 1,
            alchemy: tiers.alchemy || 1,
            butchering: tiers.butchering || 1,
            woodworking: tiers.woodworking || 1,
        }
        
    }
    getAvailabilityComponent() {
        return this.#availability;
    }
}

class BaseLocation {

    #availability;

    constructor({
        name, 
        id,
        description, 
        is_unlocked = true, 
        types = [], //{type, xp per tick}
        light_level = "normal",
        getDescription,
        tags = {},
        is_temperature_static = false,
        static_temperature = null,
        reverse_day_night_temperatures = false,
        temperature_range_modifier = 1,
        temperature_modifier = 0,
        is_under_roof = false,
        entrance_rewards, //rewards gained on entering it, to be used for unlocks
    }) {


        this.name = name;
        this.id = id || name;
        this.#availability = new AvailabilityComponent({is_unlocked});
        availabilities["location"][this.id] = this.#availability;
        this.description = description;
        this.getDescription = getDescription || function(){return description;}

        this.types = types;

        this.light_level = light_level; //not really used for this type
        this.tags = tags;
        this.entrance_rewards = entrance_rewards;

        this.is_temperature_static = is_temperature_static; //true -> uses static temperature, either provided or default
        this.static_temperature = static_temperature;
        this.reverse_day_night_temperatures = reverse_day_night_temperatures; //true -> nights are warmer, days are colder
        this.temperature_range_modifier = temperature_range_modifier; //multiplier to how much temperature varies from base; lower value will make both max and min temps closer do base
        this.temperature_modifier = temperature_modifier; //flat modifier to temperature, applied AFTER range modifier
        this.is_under_roof = is_under_roof; //only for weather display
    }

    getAvailabilityComponent() {
        return this.#availability;
    }
}

class SafeLocation extends BaseLocation {
    constructor({
                name, 
                id,
                description, 
                connected_locations = [], 
                is_unlocked = true, 
                npcs = [],
                market_region = null,
                types = [], //{type, xp per tick}
                housing = null,
                crafting = null,
                light_level = "normal",
                getDescription,
                background_noises = [],
                getBackgroundNoises,
                tags = {},
                is_temperature_static = false,
                static_temperature = null,
                reverse_day_night_temperatures = false,
                temperature_range_modifier = 1,
                temperature_modifier = 0,
                is_under_roof = false,
                entrance_rewards, //rewards gained on entering it, to be used for unlocks
            }) {
        // always a safe zone

        super({
            name, id, description, getDescription,
            types, light_level, tags, 
            is_temperature_static, static_temperature, reverse_day_night_temperatures, temperature_range_modifier, temperature_modifier, is_under_roof,
            entrance_rewards, is_unlocked
        });

        this.background_noises = background_noises;
        this.getBackgroundNoises = getBackgroundNoises || function(){return background_noises;}
        this.connected_locations = connected_locations; 
        //[{location: Location, custom_text: String (replaces 'Go to [X]'), travel_time: Number, travel_time_skills: [String] (skill ids, if skipped defaults to ['Running'])}]
        //for combat zones, it's symmetrical; otherwise it doesn't have to be as such
        //for challenge zones, travel times are expected to be 0 and therefore not displayed, so setting them to something different would require display changes

        this.npcs = npcs;

        this.market_region = market_region; //for separate regions for market saturation
        if(market_region) {
            market_regions[market_region] = true;
        }
        this.activities = {};
        this.actions = {};
        this.housing = housing;
        if(housing) {
            availabilities["location"][this.id+":housing"] = this.housing.getAvailabilityComponent();
        }
        this.crafting = crafting;
        if(crafting) {
            availabilities["location"][this.id+":crafting"] = this.crafting.getAvailabilityComponent();
        }

        this.tags["safe_zone"] = true;
    }
}

class CombatZone extends BaseLocation {
    constructor({name, 
                id,
                 description, 
                 getDescription,
                 is_unlocked = true, 
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
                 entrance_rewards = {},
                 light_level = null, //generally handled through type for those
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
                }) {

        super({
            name, id, description, getDescription,
            types, light_level, tags, 
            is_temperature_static, static_temperature, reverse_day_night_temperatures, temperature_range_modifier, temperature_modifier, is_under_roof,
            entrance_rewards, is_unlocked
        });

        this.unlock_text = unlock_text;
        this.otherUnlocks = otherUnlocks;

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

        this.tags["combat_zone"] = true;
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
}

class ChallengeZone extends CombatZone {
    constructor(data) 
    {
        super({...data, enemy_stat_variation: 0, is_challenge: true});
    }
}

class LocationActivity {

    #availability;

    constructor({activity_name, 
                 starting_text, 
                 get_payment = ()=>{return 1},
                 is_unlocked, 
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
        this.starting_text = starting_text; //text displayed on button to start action

        this.get_payment = get_payment;
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

        this.#availability = new AvailabilityComponent({is_unlocked: is_unlocked ?? true});
        
        //unrelated to component
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

    getAvailabilityComponent() {
        return this.#availability;
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
                skill_level_sum += character.getSkillModifier(activities[this.activity_name].base_skills_names[i], this.gained_resources.skill_required);
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
            const quality_cap = Math.min(Math.round(100+2*character.getTotalSkillLevel(skill.skill_id)),200);
            const quality = (3 * character.getTotalSkillLevel(skill.skill_id) - skill.max_level) + 130/* + (15 * tier)*/;
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
}

function get_location_type_penalty(type, stage, stat, category) {
    
    const skill = skills[location_types[type].stages[stage].related_skill];

    //maybe give all stages a range of skill lvls where they start scaling and where they get fully nullified?

    const scaling_lvl = location_types[type].stages[stage].scaling_lvl || skill.max_level;

    if(category === "multiplier") {
        const base = location_types[type].stages[stage].effects[stat].multiplier;
    
        return base**(1- Math.min(scaling_lvl, character.getTotalSkillLevel(skill.skill_id))/scaling_lvl);
    } else if(category === "flat") {
        const base = location_types[type].stages[stage].effects[stat].flat;

        return base*(1-Math.min(scaling_lvl, character.getTotalSkillLevel(skill.skill_id))/scaling_lvl)**0.66667;
    } else {
        throw new Error(`Unsupported category of stat effects "${category}", should be either "flat" or "multiplier"!`);
    }   
}

availability_havers.push(BaseLocation, LocationHousing, LocationCrafting, LocationActivity);

export {
    LocationHousing, LocationCrafting, LocationGatheringActivity, LocationType, LocationActivity,
    SafeLocation, CombatZone, ChallengeZone,
    get_location_type_penalty
};