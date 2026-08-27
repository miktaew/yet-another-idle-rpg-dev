"use strict";

const skills = {};
const skill_categories = {};

import { get_total_level_bonus, get_total_skill_coefficient, get_total_skill_level } from "./character.js";
import { get_crafting_quality_caps } from "./crafting_recipes.js";
import { translationManager } from "./translation.js";
import { language } from "./main.js";

/**
 * Abbreviated display name for a stat key: "max_health" -> "hp".
 *
 * Was stat_names from misc.js, which is an English-only table. Every one of its
 * keys has a "<key>" locale row holding the same abbreviation, so this reads the
 * locale instead and the milestone list stops being English under a Turkish
 * interface.
 */
function stat_label_short(stat_key) {
    return translationManager.getText(language, stat_key);
}

const weapon_type_to_skill = {
    "axe": "Axes",
    "dagger": "Daggers",
    "hammer": "Hammers",
    "sword": "Swords",
    "spear": "Spears",
    "staff": "Staffs",
    "wand": "Wands"
};

//for display foldering and for different treatment when it comes to xp gain caps
const skill_category_crafting = "Crafting";

const skill_xp_gains_cap = 0.1; //limits xp per single gain, as a relation of xp needed to next level (0.1 = need to gain it at least 10 times)
const crafting_skill_xp_gains_cap = 0.25; //same but for crafting skills

let unknown_skill_name = "?????";

const which_skills_affect_skill = {};

class Skill {
    constructor({skill_id, 
                  names, 
                  description, 
                  flavour_text, 
                  max_level = 60, 
                  max_level_coefficient = 1, 
                  max_level_bonus = 0, 
                  base_xp_cost = 40, 
                  visibility_treshold = 10,
                  get_effect_description = () => { return ''; }, 
                  parent_skill = null, 
                  milestones = {},
                  xp_scaling = 1.8,
                  is_unlocked = true,
                  category,
                  get_stat_modifiers = () => {return {}},
                  parent_multiplier = 1.1,
                }) 
    {
        if(skill_id === "all" || skill_id === "hero" || skill_id === "all_skill") {
            //would cause problem with how xp_bonuses are implemented
            throw new Error(`Id "${skill_id}" is not allowed for skills`);
        }

        this.skill_id = skill_id;
        this.names = names; // put only {0: name} to have skill always named the same, no matter the level
        this.description = description;
        this.flavour_text = flavour_text;
        this.current_level = 0; //initial lvl
        this.max_level = max_level; //max possible lvl, dont make it too high
        this.max_level_coefficient = max_level_coefficient; //multiplicative bonus for levels
        this.max_level_bonus = max_level_bonus; //other type bonus for levels
        this.current_xp = 0; // how much of xp_to_next_lvl there is currently
        this.total_xp = 0; // total collected xp, on loading calculate lvl based on this (so to not break skills if scaling ever changes)
        this.base_xp_cost = base_xp_cost; //xp to go from lvl 1 to lvl 2
        if(base_xp_cost < 1/skill_xp_gains_cap) {
            console.warn(`Skill "${this.skill_id}" has base xp cost lower than what would be needed due to skill xp gains cap!`);
        }
        this.visibility_treshold = visibility_treshold < base_xp_cost ? visibility_treshold : base_xp_cost; 
        this.is_unlocked = is_unlocked;
        //xp needed for skill to become visible and to get "unlock" message; try to keep it less than xp needed for lvl
        this.xp_to_next_lvl = base_xp_cost; //for display only
        this.total_xp_to_next_lvl = base_xp_cost; //total xp needed to lvl up
        this.get_effect_description = get_effect_description;
        this.is_parent = false;
        if(!category) {
            console.warn(`Skill "${this.skill_id}" has no category defined and was defaulted to miscellaneous`);
            this.category = "Miscellaneous";
        } else {
            this.category = category;
        }
        skill_categories[this.category] = true;
        
        if(parent_skill) {
            if(skills[parent_skill]) {
                this.parent_skill = parent_skill;
                skills[parent_skill].is_parent = true;
            } else {
                throw new Error(`Skill "${parent_skill}" doesn't exist, so it can't be set as a parent skill`)
            }
        }

        this.milestones = milestones;

        this.xp_scaling = xp_scaling > 1 ? xp_scaling : 1.6;
        //how many times more xp needed for next level

        this.get_stat_modifiers = get_stat_modifiers;
        //refer to how it's used in "Pest killer"/"Giant slayer"

        this.parent_multiplier = parent_multiplier; //used only in parent skills, ignored otherwise; multiplier to xp per level of difference with parent
    }

    /**
     * The skill's displayed name at its current level, translated if the active
     * language has an entry for it.
     *
     * Only the shown text changes. skill_id stays the registry key and is what
     * the save file holds, so nothing here can affect a save.
     */
    name() {
        return translationManager.getDisplayName(language, this.english_name());
    }

    /**
     * The skill's description. this.description holds a TEXT ID now; the text itself
     * lives in locales/, moved rather than copied so there is one source of truth.
     */
    getDescription() {
        return translationManager.getText(language, this.description);
    }

    /** The canonical English name for the current level. Also the translation key. */
    english_name() {
        if(this.visibility_treshold > this.total_xp || !this.is_unlocked) {
            return unknown_skill_name;
        }
 
        const keys = Object.keys(this.names);
        if (keys.length == 1) {
            return (this.names[keys[0]]);
        }
        else {
            let rank_name;
            for (var i = 0; i <= keys.length; i++) {
                if (this.current_level >= parseInt(keys[i])) {
                    rank_name = this.names[keys[i]];
                }
                else {
                    break;
                }
            }
            return rank_name;
        }
    }

    add_xp({xp_to_add = 0}) {
        //Non-finite values have to be rejected here, not just at the call site:
        //this is the last gate before total_xp is mutated, and "xp_to_add == 0"
        //does not stop them (NaN == 0 is false). NaN would propagate into
        //total_xp and current_xp and render as "NaN" in every panel that shows
        //this skill, and Infinity would make the level-up loop below unable to
        //terminate, hanging the tab.
        if(!Number.isFinite(xp_to_add)) {
            console.error(`Tried to add non-finite xp (${xp_to_add}) to skill "${this.skill_id}"`);
            return {};
        }
        if(xp_to_add == 0 || !this.is_unlocked) {
            return {};
        }
        xp_to_add = Math.round(xp_to_add*100)/100;
        let skill_name = this.name();
        //grab name beforehand, in case it changes after levelup (levelup message should appear BEFORE skill name change message, so this is necessary)

        this.total_xp = Math.round(100*(this.total_xp + xp_to_add))/100;
        if(this.current_level < this.max_level) { //not max lvl

            if(Math.round(100*(xp_to_add + this.current_xp))/100 < this.xp_to_next_lvl) { // no levelup
                this.current_xp = Math.round(100*(this.current_xp + xp_to_add))/100;
            } else { //levelup
                
                let level_after_xp = 0;
                let unlocks = {skills: [], recipes: [], quests: []};

                //its alright if this goes over max level, it will be overwritten in a if-else below that
                //The max_level bound is what guarantees termination. Without it a
                //total_xp large enough to push total_xp_to_next_lvl past
                //Number.MAX_VALUE leaves the condition permanently true, because
                //Infinity >= Infinity. Stopping at max_level costs nothing: the
                //if-else below overwrites everything once max level is reached.
                while(this.total_xp >= this.total_xp_to_next_lvl && level_after_xp < this.max_level) {

                    level_after_xp += 1;
                    this.total_xp_to_next_lvl = Math.round(100*this.base_xp_cost * (1 - this.xp_scaling ** (level_after_xp + 1)) / (1 - this.xp_scaling))/100;

                    if(this.milestones[level_after_xp]?.unlocks?.skills) {
                        unlocks.skills.push(...this.milestones[level_after_xp].unlocks.skills);
                    }
                    if(this.milestones[level_after_xp]?.unlocks?.recipes) {
                        unlocks.recipes.push(...this.milestones[level_after_xp].unlocks.recipes);
                    }
                    if(this.milestones[level_after_xp]?.unlocks?.quests) {
                        unlocks.quests.push(...this.milestones[level_after_xp].unlocks.quests);
                    }
                } //calculates lvl reached after adding xp
                //probably could be done much more efficiently, but it shouldn't be a problem anyway

                
                let total_xp_to_previous_lvl = Math.round(100*this.base_xp_cost * (1 - this.xp_scaling ** level_after_xp) / (1 - this.xp_scaling))/100;
                //xp needed for current lvl, same formula but for n-1

                if(level_after_xp == 0) { //this was for an older issue that seems to have been long fixed
                    console.warn(`Something went wrong, calculated level of skill "${this.skill_id}" after a levelup was 0.`
                    +`\nxp_added: ${xp_to_add};\nprevious level: ${this.current_level};\ntotal xp: ${this.total_xp};`
                    +`\ntotal xp for that level: ${total_xp_to_previous_lvl};\ntotal xp for next level: ${this.total_xp_to_next_lvl}`);
                }

                let gains;
                if(level_after_xp < this.max_level) { //wont reach max lvl
                    gains = this.get_bonus_stats(level_after_xp);
                    this.xp_to_next_lvl = Math.round(100*(this.total_xp_to_next_lvl - total_xp_to_previous_lvl))/100;
                    this.current_level = level_after_xp;
                    this.current_xp = Math.round(100*(this.total_xp - total_xp_to_previous_lvl))/100;
                } else { //will reach max lvl
                    gains = this.get_bonus_stats(this.max_level);
                    this.current_level = this.max_level;
                    this.total_xp_to_next_lvl = "Already reached max lvl";
                    this.current_xp = "Max";
                    this.xp_to_next_lvl = Infinity;
                }

                skill_name = skill_name===unknown_skill_name?this.name():skill_name;
                //swap name if it was unknown, otherwise leave it as it was (for properly messaging skill name change)
                //Text ids, like every other line the player reads. Finishing two skill
                //families made these appear far more often, which is how they were noticed.
                let message = translationManager.getText(language, "log skill reached level",
                    {v1: skill_name, v2: this.current_level});

                if (Object.keys(gains.stats).length > 0 || Object.keys(gains.xp_multipliers).length > 0) { 
                    message += "\n\n " + translationManager.getText(language,
                        "log skill milestone gained", {v1: skill_name});

                    if (gains.stats) {
                        Object.keys(gains.stats).forEach(stat => {
                            if(gains.stats[stat].flat) {
                                message += `\n ${translationManager.getText(language, "log milestone flat", {v1: gains.stats[stat].flat, v2: stat_label_short(stat)})}`;
                            }
                            if(gains.stats[stat].multiplier) {
                                message += `\n ${translationManager.getText(language, "log milestone multiplier", {v1: Math.round(100*gains.stats[stat].multiplier)/100, v2: stat_label_short(stat)})}`;
                            }   
                        });
                    }

                    if (gains.xp_multipliers) {
                        Object.keys(gains.xp_multipliers).forEach(xp_multiplier => {
                            let name;
                            if(xp_multiplier !== "all" && xp_multiplier !== "hero" && xp_multiplier !== "all_skill" && !xp_multiplier.includes("category_")) {
                                name = skills[xp_multiplier].name();
                                if(!skills[xp_multiplier]) {
                                    console.warn(`Skill ${this.skill_id} tried to reward an xp multiplier for something that doesn't exist: ${xp_multiplier}. I could be a misspelled skill name`);
                                }
                            } else {
                                
                                if(xp_multiplier.includes("category_")) {
                                    name = translationManager.getText(language, "ui skill category heading",
                                        {v1: translationManager.getText(language, `ui skill category ${xp_multiplier.replace("category_", "")}`)});
                                } else {
                                    name = translationManager.getText(language, `ui xp target ${xp_multiplier}`);
                                }
                            }

                            message += `\n ${translationManager.getText(language, "log milestone xp gain", {v1: Math.round(100*gains.xp_multipliers[xp_multiplier])/100, v2: name})}`;
                            
                        });
                    }
                }

                return {message, gains, unlocks};
            }
        }
        return {};
    }

    /**
     * @description only called on leveling; calculates all the bonuses gained, so they can be added to hero and logged in message log
     * @param {*} level 
     * @returns bonuses from milestones
     */
    get_bonus_stats(level) {
        //probably should rename, since it's not just stats anymore
        const gains = {stats: {}, xp_multipliers: {}};

        let stats;
        let xp_multipliers;

        for (let i = this.current_level + 1; i <= level; i++) {
            if (this.milestones[i]) {
                stats = this.milestones[i].stats;
                xp_multipliers = this.milestones[i].xp_multipliers;
                
                if(stats) {
                    Object.keys(stats).forEach(stat => {
                        if(!gains.stats[stat]) {
                            gains.stats[stat] = {};
                        }
                        if(stats[stat].flat) {
                            gains.stats[stat].flat = (gains.stats[stat].flat || 0) + stats[stat].flat;
                        }
                        if(stats[stat].multiplier) {
                            gains.stats[stat].multiplier =  (gains.stats[stat].multiplier || 1) * stats[stat].multiplier;
                        }
                        
                    });
                }

                if(xp_multipliers) {
                    Object.keys(xp_multipliers).forEach(multiplier_key => {
                        gains.xp_multipliers[multiplier_key] = (gains.xp_multipliers[multiplier_key] || 1) * xp_multipliers[multiplier_key];
                        if(which_skills_affect_skill[multiplier_key]) {
                            if(!which_skills_affect_skill[multiplier_key].includes(this.skill_id)) {
                                which_skills_affect_skill[multiplier_key].push(this.skill_id);
                            }
                        } else {
                            which_skills_affect_skill[multiplier_key] = [this.skill_id];
                        }
                       
                    });
                }
            }
        }
        
        Object.keys(gains.stats).forEach((stat) => {
            if(gains.stats[stat].multiplier) {
                gains.stats[stat].multiplier = Math.round(100 * gains.stats[stat].multiplier) / 100;
            }
        });
        
        return gains;
    }
    get_coefficient({scaling_type, skill_level}) { //starts from 1
        //maybe lvl as param, with current lvl being used if it's undefined?
        switch (scaling_type) {
            case "flat":
                return 1 + Math.round((this.max_level_coefficient - 1) * (skill_level || this.current_level) / this.max_level * 1000) / 1000;
            case "multiplicative":
                return Math.round(Math.pow(this.max_level_coefficient, (skill_level || this.current_level) / this.max_level) * 1000) / 1000;
            default: //same as on multiplicative
                return Math.round(Math.pow(this.max_level_coefficient, (skill_level || this.current_level) / this.max_level) * 1000) / 1000;
        }
    }
    get_level_bonus(level) { //starts from 0
        return this.max_level_bonus * (level || this.current_level) / this.max_level;
    }
    get_parent_xp_multiplier() {
        if(!this.parent_skill) {
            return 1;
        }
        const parent_skill = skills[this.parent_skill];
        const level_difference = Math.max(0, parent_skill.current_level - this.current_level);

        //Math.max(0, NaN) is NaN, and anything ** NaN is NaN. This multiplier is
        //applied directly to xp_to_add in add_xp_to_skill, so a single bad level
        //value here would poison the skill's stored xp rather than just one gain.
        if(!Number.isFinite(level_difference)) {
            console.error(`Could not compute the parent xp multiplier for skill "${this.skill_id}": `
                + `level of "${this.parent_skill}" is ${parent_skill.current_level}, own level is ${this.current_level}`);
            return 1;
        }
        return parent_skill.parent_multiplier ** level_difference;
    }
}

/**
 * @param {String} skill_id key from skills object
 * @returns all unlocked leveling rewards, formatted to string
 */
function get_unlocked_skill_rewards(skill_id) {
    let unlocked_rewards = '';
    const skill = skills[skill_id];
    
        const milestones = Object.keys(skill.milestones).filter(level => level <= skill.current_level);
        if(milestones.length > 0) {
            unlocked_rewards = `lvl ${milestones[0]}: ${format_skill_rewards(skill.milestones[milestones[0]])}`;
            for(let i = 1; i < milestones.length; i++) {
                unlocked_rewards += `<br>\n\nlvl ${milestones[i]}: ${format_skill_rewards(skill.milestones[milestones[i]])}`;
            }
        } else { //no rewards
            return '';
        }

    return unlocked_rewards;
}

/**
 * 
 * @param {*} skill_id key used in skills object
 * @returns next lvl at which skill has any rewards
 */
function get_next_skill_milestone(skill_id){

    return Object.keys(skills[skill_id].milestones).find(
        level => level > skills[skill_id].current_level);
}

/**
 * @param milestone milestone from object rewards - {stats: {stat1, stat2... }} 
 * @returns rewards formatted to a nice string
 */
function format_skill_rewards(milestone){
    let formatted = '';
    if(milestone.stats) {
        let temp = '';
        Object.keys(milestone.stats).forEach(stat => {
            if(milestone.stats[stat].flat) {
                if(formatted) {
                    formatted += `, +${milestone.stats[stat].flat} ${stat_label_short(stat)}`;
                } else {
                    formatted = `+${milestone.stats[stat].flat} ${stat_label_short(stat)}`;
                }
            }
            if(milestone.stats[stat].multiplier) {
                if(temp) {
                    temp += `, x${milestone.stats[stat].multiplier} ${stat_label_short(stat)}`;
                } else {
                    temp = `x${milestone.stats[stat].multiplier} ${stat_label_short(stat)}`;
                }
            }
        });

        if(formatted) {
            if(temp) {
                formatted += ", " + temp;
            }
        } else {
            formatted = temp;
        }
    }

    if(milestone.xp_multipliers) {
        const xp_multipliers = Object.keys(milestone.xp_multipliers);
        let name;
        if(xp_multipliers[0] !== "all" && xp_multipliers[0] !== "hero" && xp_multipliers[0] !== "all_skill") {
            if(xp_multipliers[0].includes("category_")) {
                name = xp_multipliers[0].replace("category_", "") + " skills";
            } else {
                name = skills[xp_multipliers[0]].name();
            }
        } else {
            name = xp_multipliers[0].replace("_"," ");
        }
        if(formatted) {
            formatted += ", " + translationManager.getText(language, "log milestone xp gain", {v1: milestone.xp_multipliers[xp_multipliers[0]], v2: name});
        } else {
            formatted = translationManager.getText(language, "log milestone xp gain", {v1: milestone.xp_multipliers[xp_multipliers[0]], v2: name});
        }
        for(let i = 1; i < xp_multipliers.length; i++) {
            let name;
            if(xp_multipliers[i] !== "all" && xp_multipliers[i] !== "hero" && xp_multipliers[i] !== "all_skill") {
                if(xp_multipliers[i].includes("category_")) {
                    name = xp_multipliers[i].replace("category_", "") + " skills";
                } else {
                    name = skills[xp_multipliers[i]].name();
                }
            } else {
                name = xp_multipliers[i].replace("_"," ");
            }
            formatted += ", " + translationManager.getText(language, "log milestone xp gain", {v1: milestone.xp_multipliers[xp_multipliers[i]], v2: name});
        }
    }
    if(milestone.unlocks) {
        if(milestone.unlocks.skills) {
            const unlocked_skills = milestone.unlocks.skills;
            if(formatted) {
                formatted += `, <br> Unlocked skill "${milestone.unlocks.skills[0]}"`;
            } else {
                formatted = `Unlocked skill "${milestone.unlocks.skills[0]}"`;
            }
            for(let i = 1; i < unlocked_skills.length; i++) {
                formatted += `, "${milestone.unlocks.skills[i]}"`;
            }
        }
        if(milestone.unlocks.recipes) {
            const phrasing = milestone.unlocks.recipes.length > 1?"new recipes":"a new recipe";
            if(formatted) {
                formatted += `, <br> Unlocked ${phrasing}`;
            } else {
                formatted = `Unlocked ${phrasing}`;
            }
        }
        
    }
    return formatted;
}

//basic combat skills
(function(){
    skills["Combat"] = new Skill({
                                names: {0: "Combat"}, 
                                category: "Combat",
                                description: "desc skill Combat",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Combat", {v1: Math.round(get_total_skill_coefficient({skill_id:"Combat",scaling_type:"multiplicative"})*1000)/1000});
                                }});
    
    skills["Pest killer"] = new Skill({
                                names: {0: "Pest killer", 15: "Pest slayer"}, 
                                description: "desc skill Pest killer",
                                max_level_coefficient: 2,
                                category: "Combat",
                                base_xp_cost: 100,
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Pest killer", {v1: Math.round(get_total_skill_coefficient({skill_id:"Pest killer",scaling_type:"multiplicative"})*1000)/1000});
                                },
                                milestones: {
                                    1: {
                                        xp_multipliers: {
                                            Combat: 1.05,
                                        },
                                    },
                                    2: {
                                        xp_multipliers: {
                                            category_Combat: 1.05,
                                        },
                                    },
                                    3: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    5: {
                                        stats: {
                                            dexterity: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            Evasion: 1.05,
                                            "Shield blocking": 1.05,
                                        }
                                    },
                                    7: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Combat: 1.05,
                                        }
                                    },
                                    10: {
                                        stats: {
                                            dexterity: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            category_Combat: 1.05,
                                            Perception: 1.1,
                                        }
                                    },
                                    12: {
                                        stats: {
                                            dexterity: {flat: 2},
                                        },
                                        xp_multipliers: {
                                            Combat: 1.05,
                                        }
                                    },
                                    
                                },
                                get_stat_modifiers: () => {
                                    return {
                                       modifier_to_hit_chance: get_total_skill_coefficient({scaling_type: "multiplicative", skill_id: "Pest killer"})
                                    };
                                }
                            });    
                                
    skills["Giant slayer"] = new Skill({
                                names: {0: "Giant killer", 15: "Giant slayer"}, 
                                description: "desc skill Giant slayer",
                                max_level_coefficient: 2,
                                category: "Combat",
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Giant slayer", {v1: Math.round(get_total_skill_coefficient({skill_id:"Giant slayer",scaling_type:"multiplicative"})*1000)/1000});
                                },
                                get_stat_modifiers: () => {
                                    return {
                                       modifier_to_evasion: get_total_skill_coefficient({scaling_type: "multiplicative", skill_id: "Giant slayer"}) 
                                    };
                                }
                            });
                                

    skills["Evasion"] = new Skill({
                                names: {0: "Evasion"},                                
                                description: "desc skill Evasion",
                                max_level_coefficient: 2,
                                base_xp_cost: 20,
                                category: "Combat",
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Evasion", {v1: Math.round(get_total_skill_coefficient({skill_id:"Evasion",scaling_type:"multiplicative"})*1000)/1000});
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "agility": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "agility": {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Equilibrium: 1.05,
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "agility": {
                                                flat: 1,
                                                multiplier: 1.05,
                                            }
                                        },
                                    },
                                    7: {
                                        stats: {
                                            "agility": {flat: 2},
                                        },
                                        xp_multipliers: {
                                            Equilibrium: 1.05,
                                        }
                                    },
                                    10: {
                                        stats: {
                                            "agility": {
                                                flat: 1,
                                                multiplier: 1.05,
                                            }
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "agility": {flat: 2},
                                        },
                                        xp_multipliers: {
                                            Equilibrium: 1.05,
                                        }
                                    },
                                    15: {
                                        stats: {
                                            "agility": {flat: 5},
                                        },
                                    },
                                    20: {
                                        xp_multipliers: {
                                            Climbing: 1.2,
                                            Swimming: 1.2,
                                            Running: 1.2,
                                        }
                                    }
                                }
                            });
    skills["Shield blocking"] = new Skill({
                                    names: {0: "Shield blocking"}, 
                                    description: "desc skill Shield blocking",
                                    max_level: 30, 
                                    max_level_bonus: 0.2,
                                    category: "Combat",
                                    get_effect_description: ()=> {
                                        return translationManager.getText(language, "skill effect Shield blocking", {v1: Math.round(get_total_level_bonus("Shield blocking")*1000)/10, v2: Math.round(get_total_level_bonus("Shield blocking")*5000)/10, v3: get_total_skill_level("Shield blocking")});
                                    },
                                    milestones: {
                                        1: {
                                            stats: {
                                                "strength": {flat: 1},
                                            }
                                        },
                                        3: {
                                            stats: {
                                                "strength": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.05,
                                            }
                                        },
                                        5: {
                                            stats: {
                                                "strength": {flat: 1},
                                                "dexterity": {flat: 1},
                                                "agility": {flat: 1}
                                            },
                                        },
                                        7: {
                                            stats: {
                                                "strength": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Fortitude: 1.05,
                                            }
                                        },
                                        10: {
                                            stats: {
                                                "strength": {
                                                    flat: 1,
                                                    multiplier: 1.05,
                                                },
                                                "dexterity": {flat: 2},
                                                "agility": {flat: 1}
                                            },
                                            xp_multipliers: {
                                                Perception: 1.1,
                                            }
                                        },
                                        12: {
                                            stats: {
                                                "strength": {flat: 2},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.05,
                                            }
                                        },
                                        15: {
                                            stats: {
                                                "strength": {flat: 4},
                                                "dexterity": {flat: 4},
                                                "agility": {flat: 2}
                                            }
                                        },
                                        20: {
                                            xp_multipliers: {
                                                Weightlifting: 1.2,
                                                Fortitude: 1.2,
                                                Combat: 1.2,
                                            },
                                            stats: {
                                                "strength": {multiplier: 1.05}
                                            }
                                        }
                                    }
                                });
    
     skills["Unarmed"] = new Skill({ 
                                    names: {0: "Unarmed", 10: "Brawling", 20: "Martial arts"}, 
                                    description: "desc skill Unarmed",
                                    category: "Combat",
                                    get_effect_description: ()=> {
                                        return translationManager.getText(language, "skill effect Unarmed", {v1: Math.round(get_total_skill_coefficient({skill_id:"Unarmed",scaling_type:"multiplicative"})*1000)/1000, v2: Math.round((get_total_skill_coefficient({skill_id:"Unarmed",scaling_type:"multiplicative"})**0.3333)*1000)/1000, v3: skills["Unarmed"].current_level/10});
                                    },
                                    max_level_coefficient: 64, //even with 8x more it's still gonna be worse than just using a weapon lol
                                    milestones: {
                                        2: {
                                            stats: {
                                                "strength": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.05,
                                            }
                                        },
                                        4: {
                                            stats: {
                                                "strength": {flat: 1},
                                                "dexterity": {flat: 1},
                                            }
                                        },
                                        6: {
                                            stats: {
                                                "strength": {flat: 1},
                                                "dexterity": {flat: 1},
                                                "agility": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.1,
                                            }
                                        },
                                        8: {
                                            stats: {
                                                "strength": {flat: 1},
                                                "dexterity": {flat: 1},
                                                "agility": {flat: 1},
                                            }
                                        },
                                        10: {
                                            stats: {
                                                "strength": {flat: 2},
                                                "dexterity": {flat: 1},
                                                "agility": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Running: 1.2,
                                            }
                                        },
                                        12: {
                                            stats: {
                                                "strength": {flat: 2},
                                                "dexterity": {flat: 2},
                                                "agility": {flat: 2},
                                            }
                                        },
                                        15: {
                                            stats: {
                                                "strength": {flat: 5},
                                                "dexterity": {flat: 5},
                                                "agility": {flat: 5},
                                            }
                                        },
                                        20: {
                                            xp_multipliers: {
                                                Breathing: 1.1,
                                                Equilibrium: 1.1,
                                                Weightlifting: 1.1,
                                                Running: 1.1,
                                            },
                                        },
                                    }});
})();

//combat stances
(function(){
    skills["Stance mastery"] = new Skill({
                                    names: {0: "Stance proficiency", 10: "Stance mastery"}, 
                                    description: "desc skill Stance mastery",
                                    base_xp_cost: 60,
                                    category: "Stance",
                                    max_level: 30,
                                    get_effect_description: function() {
                                        return translationManager.getText(language, "skill effect Stance mastery", {v1: this.parent_multiplier});
                                    },
                                });
    skills["Quick steps"] = new Skill({
                                names: {0: "Quick steps"}, 
                                parent_skill: "Stance mastery",
                                description: "desc skill Quick steps",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Quick steps");
                                }});
    skills["Heavy strike"] = new Skill({
                                names: {0: "Crushing force"}, 
                                parent_skill: "Stance mastery",
                                description: "desc skill Heavy strike",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Heavy strike");
                                }});
    skills["Wide swing"] = new Skill({ 
                                names: {0: "Broad arc"}, 
                                parent_skill: "Stance mastery",
                                description: "desc skill Wide swing",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Wide swing");
                                }});
    skills["Defensive measures"] = new Skill({
                                names: {0: "Defensive measures"}, 
                                parent_skill: "Stance mastery",
                                description: "desc skill Defensive measures",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Defensive measures");
                                }});
    skills["Berserker's stride"] = new Skill({ 
                                names: {0: "Berserker's stride"}, 
                                parent_skill: "Stance mastery",
                                description: "desc skill Berserker's stride",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Berserker's stride");
                                }});                  
    skills["Flowing water"] = new Skill({
                                names: {0: "Flowing water"}, 
                                parent_skill: "Stance mastery",
                                description: "desc skill Flowing water",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Flowing water");
                                }});         
                               
})();

//environment related skills
(function(){
    skills["Spatial awareness"] = new Skill({
                                            names: {0: "Spatial awareness"}, 
                                            description: "desc skill Spatial awareness",
                                            get_effect_description: ()=> {
                                                return translationManager.getText(language, "skill effect Spatial awareness");
                                            },
                                            category: "Environmental",
                                            milestones: {
                                                1: {
                                                    xp_multipliers:{ 
                                                        Evasion: 1.1,
                                                        "Shield blocking": 1.1,
                                                    },
                                                },
                                                3: {
                                                    xp_multipliers: {
                                                        Combat: 1.1,
                                                    }
                                                },
                                                5: {
                                                    xp_multipliers: {
                                                        category_Combat: 1.1,
                                                    },
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    }
                                                },
                                                8: {
                                                    xp_multipliers: {
                                                        all_skill: 1.1,
                                                    }
                                                },
                                                10: {
                                                    xp_multipliers:{ 
                                                        Evasion: 1.1,
                                                        "Shield blocking": 1.1,
                                                        Combat: 1.1,
                                                        Perception: 1.1,
                                                    },
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    }
                                                },
                                                15: {
                                                    xp_multipliers: {
                                                        category_Combat: 1.1,
                                                    },
                                                    stats: {
                                                        intuition: {flat: 3},
                                                    }
                                                },
                                                20: {
                                                    xp_multipliers: {
                                                        all_skill: 1.2,
                                                    }
                                                }
                                            }
                                        });
    skills["Tight maneuvers"] = new Skill({
                                        names: {0: "Tight maneuvers"}, 
                                        description: "desc skill Tight maneuvers",
                                        category: "Environmental",
                                        get_effect_description: ()=> {
                                            return translationManager.getText(language, "skill effect Tight maneuvers");
                                        },
                                        milestones: {
                                            3: {
                                                xp_multipliers: {
                                                    Evasion: 1.1,
                                                    "Shield blocking": 1.1,
                                                }
                                            },
                                            5: {
                                                xp_multipliers: {
                                                    Combat: 1.1,
                                                }
                                            },
                                            7: {
                                                xp_multipliers: {
                                                    Evasion: 1.1,
                                                    "Shield blocking": 1.1,
                                                }
                                            },
                                            10: {
                                                xp_multipliers: {
                                                    Evasion: 1.1,
                                                    "Shield blocking": 1.1,
                                                    Combat: 1.1,
                                                }
                                            },
                                            15: {
                                                xp_multipliers: {
                                                    Equilibrium: 1.1,
                                                },
                                                stats: {
                                                    agility: {flat: 5},
                                                }
                                            },
                                            20: {
                                                xp_multipliers: {
                                                    Evasion: 1.2,
                                                    "Shield blocking": 1.2,
                                                    Combat: 1.2,
                                                }
                                            }
                                        }
                                    });
    skills["Night vision"] = new Skill({
                                    names: {0: "Night vision"},
                                    description: "desc skill Night vision",
                                    base_xp_cost: 600,
                                    xp_scaling: 1.9,
                                    max_level: 10,
                                    category: "Environmental",
                                    get_effect_description: () => {
                                        return translationManager.getText(language, "skill effect Night vision");
                                    },
                                    milestones: {
                                        2: {
                                            stats: {
                                                intuition: {flat: 1},
                                            }
                                        },
                                        3: {
                                            xp_multipliers: {
                                                Evasion: 1.05,
                                                "Shield blocking": 1.05,
                                            }
                                        },
                                        5: {
                                            stats: {
                                                intuition: {flat: 1},
                                            },
                                            xp_multipliers: {
                                                "Presence sensing": 1.05,
                                                Perception: 1.1,
                                            }

                                            },
                                        7: {    
                                            xp_multipliers: 
                                            {
                                                Combat: 1.1,
                                            },
                                            stats: {
                                                intuition: {multiplier: 1.05},
                                            }
                                        },
                                        8: {
                                            xp_multipliers: {
                                                "Presence sensing": 1.1,
                                            }
                                        },
                                        10: {
                                            xp_multipliers: {
                                                "Presence sensing": 1.2,
                                                Evasion: 1.05,
                                                "Shield blocking": 1.05,
                                                Perception: 1.1,
                                            },
                                            stats: {
                                                intuition: {multiplier: 1.05},
                                            }
                                        }
                                    }
                            });
    skills["Presence sensing"] = new Skill({
                names: {0: "Presence sensing"},
                description: "desc skill Presence sensing",
                base_xp_cost: 60,
                xp_scaling: 2,
                max_level: 20,
                category: "Environmental",
                get_effect_description: () => {
                    return translationManager.getText(language, "skill effect Presence sensing");
                },
                milestones: {
                    1: {
                        stats: {
                            intuition: {flat: 1},
                        },
                        xp_multipliers: {
                            "Night vision": 1.2,
                        }
                    },
                    
                    2: {
                        xp_multipliers: {
                            Evasion: 1.1,
                            "Shield blocking": 1.2,
                        }
                    },
                    4: {
                        stats: {
                            intuition: {flat: 1},
                        },
                        xp_multipliers: {
                            "Combat": 1.1,
                            Perception: 1.1,
                        }

                        },
                    5: {    
                        xp_multipliers: 
                        {
                            all_skill: 1.05,
                            "Night vision": 1.2,
                        },
                        stats: {
                            intuition: {multiplier: 1.1},
                        }
                    },
                    7: {
                        stats: {
                            intuition: {flat: 2},
                        },
                        xp_multipliers: {
                            hero: 1.05,
                            "Night vision": 1.2,
                            Perception: 1.1,
                        }
                    },
                    10: {
                        xp_multipliers: {
                            all_skill: 1.05,
                            "Night vision": 1.2,
                            Perception: 1.2,
                        }
                    },
                    12: {
                        xp_multipliers: {
                            all: 1.05,
                            Perception: 1.1,
                        },
                        stats: {
                            intuition: {
                                flat: 5,
                                multiplier: 1.05,
                            },
                        }
                    },
                    15: {
                        xp_multipliers: {
                            all_skill: 1.05,
                            "Night vision": 1.2, //if it's somehow not maxxed out by this point
                            Perception: 1.1,
                        },
                    },
                    20: {
                        xp_multipliers: {
                            all: 1.1,
                            Perception: 1.1,
                            Combat: 1.1,
                            "Spatial awareness": 1.1,
                        },
                        stats: {
                            intuition: {multiplier: 1.1},
                        }
                    },
                }
    });

    skills["Strength of mind"] = new Skill({
        names: {0: "Strength of mind", 15: "Iron will", 30: "Heart of steel"}, 
        description: "desc skill Strength of mind",
        category: "Environmental",
        flavour_text: "skill flavour Strength of mind", //40k ref
        base_xp_cost: 400,
        max_level: 40,
        xp_scaling: 1.7,
        get_effect_description: ()=> {
            return translationManager.getText(language, "skill effect Strength of mind");
        },
        milestones: {
            1: {
                xp_multipliers: {
                    all_skill: 1.05,
                }
            },
            2: {    
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Literacy": 1.05,
                    "Persistence": 1.05,
                    "Fortitude": 1.05,
                    Perception: 1.1,
                }
            },
            3: {
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            5: {
                xp_multipliers: {
                    all_skill: 1.05,
                }
            },
            7: {    
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Literacy": 1.05,
                    "Persistence": 1.05,
                    "Fortitude": 1.05,
                }
            },
            8: {
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            10: {
                xp_multipliers: {
                    all: 1.05,
                    Perception: 1.1,
                }
            },
            12: {    
                stats: {
                    intuition: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Literacy": 1.05,
                    "Persistence": 1.05,
                    "Fortitude": 1.05,
                }
            },
            15: {    
                stats: {
                    intuition: {flat: 5, multiplier: 1.05},
                },
            },
            20: {    
                stats: {
                    intuition: {multiplier: 1.1},
                },
                xp_multipliers: {
                    all: 1.1,
                    Literacy: 1.1,
                    Persistence: 1.1,
                    Fortitude: 1.1,
                }
            },
        }
    });

    skills["Scrambling"] = new Skill({
		names: {0: "Scrambling"}, 
        description: "desc skill Scrambling",
        category: "Environmental",
        base_xp_cost: 400,
        max_level: 60,
        xp_scaling: 1.7,
        get_effect_description: ()=> {
            return translationManager.getText(language, "skill effect Scrambling");
        },
        milestones: {
            1: {
                stats: {
					dexterity: {
						flat: 1
                    },
					agility: {
						flat: 1
                    },
                    max_stamina: {
                        multiplier: 1.1,
                    }
                }
            },
            3: {
                stats: {
					dexterity: {
						multiplier: 1.05
                    },
					agility: {
						multiplier: 1.05
                    },
                }
            },
            5: {
                stats: {
					dexterity: {
						flat: 3
                    },
					agility: {
						flat: 3
                    },
                },
                xp_multipliers: {
                    Running: 1.2,
                }
            },
            8: {
				stats: {
                    stamina_regeneration_flat: {
                        flat: 0.2,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    }
                },
            },
            10: {
				stats: {
                    attack_speed: {
                        multiplier: 1.01,
                    },
                },
            },
            13: {
                stats: {
					dexterity: {
						flat: 2
                    },
					agility: {
						flat: 2
                    },
                    max_stamina: {
                        multiplier: 1.2,
                    },
                }
            },
            15: {
                stats: {
					dexterity: {
						multiplier: 1.1
                    },
					agility: {
						multiplier: 1.1
                    },
                }
            },
            18: {
                stats: {
					dexterity: {
						flat: 4},
					agility: {
						flat: 4},
                },
                xp_multipliers: {
                    "Scrambling": 1.2,
                },
            },
            20: {
				stats: {
                    attack_speed: { multiplier: 1.02},
                    stamina_regeneration_flat: { flat: 0.3},
                    stamina_efficiency: { multiplier: 1.05 },
                },
            },
        }
    });

    skills["Heat resistance"] = new Skill({
        names: {0: "Heat resistance"},
        description: "desc skill Heat resistance",
        base_xp_cost: 100,
        max_level: 40,
        category: "Environmental",
    });
    skills["Cold resistance"] = new Skill({
        names: {0: "Cold resistance"},
        description: "desc skill Cold resistance",
        base_xp_cost: 200,
        xp_scaling: 1.8,
        max_level: 40,
        category: "Environmental",
        get_effect_description: ()=>{
            return translationManager.getText(language, "skill effect Cold resistance", {v1: skills["Cold resistance"].current_level*0.5});
        },
    });

    skills["Dazzle resistance"] = new Skill({
        names: {0: "Dazzle resistance"},
        description: "desc skill Dazzle resistance",
        base_xp_cost: 60,
        max_level: 30,
        category: "Environmental",
        get_effect_description: ()=> {
            return translationManager.getText(language, "skill effect Dazzle resistance");
        },
        max_level_bonus: 0.5
    });
})();

//weapon skills
(function(){
    skills["Weapon mastery"] = new Skill({
                                    names: {0: "Weapon proficiency", 15: "Weapon mastery"}, 
                                    description: "desc skill Weapon mastery",
                                    category: "Weapon",
                                    get_effect_description: function() {
                                        return translationManager.getText(language, "skill effect Weapon mastery", {v1: this.parent_multiplier});
                                    },
                                });
    skills["Swords"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Swordsmanship"}, 
                                category: "Weapon",
                                description: "desc skill Swords",
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Swords", {v1: Math.round(get_total_skill_coefficient({skill_id:"Swords",scaling_type:"multiplicative"})*1000)/1000, v2: Math.round((get_total_skill_coefficient({skill_id:"Swords",scaling_type:"multiplicative"})**0.3333)*1000)/1000});
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "agility": {flat: 1},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "strength": {flat: 1},
                                            "crit_rate": {flat: 0.01},
                                        },
                                    },
                                    7: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    10: {
                                        stats: {
                                            "agility": {flat: 1},
                                            "crit_multiplier": {flat: 0.1}, 
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "dexterity": {flat: 2},
                                        }
                                    },
                                },
                                max_level_coefficient: 8
                            });

    skills["Axes"] = new Skill({ 
                                parent_skill: "Weapon mastery",
                                names: {0: "Axe combat"}, 
                                category: "Weapon",
                                description: "desc skill Axes",
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Axes", {v1: Math.round(get_total_skill_coefficient({skill_id:"Axes",scaling_type:"multiplicative"})*1000)/1000, v2: Math.round((get_total_skill_coefficient({skill_id:"Axes",scaling_type:"multiplicative"})**0.3333)*1000)/1000});
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "strength": {flat: 1},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                            "strength": {flat: 1},
                                        },

                                    },
                                    7: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    10: {
                                        stats: {
                                                "strength": {multiplier: 1.05},
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "dexterity": {flat: 2},
                                        }
                                    },
                                },
                                max_level_coefficient: 8});

    skills["Spears"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Spearmanship"}, 
                                category: "Weapon",
                                description: "desc skill Spears",
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Spears", {v1: Math.round(get_total_skill_coefficient({skill_id:"Spears",scaling_type:"multiplicative"})*1000)/1000, v2: Math.round((get_total_skill_coefficient({skill_id:"Spears",scaling_type:"multiplicative"})**0.3333)*1000)/1000});
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "strength": {flat: 1},
                                            "crit_rate": {flat: 0.01},
                                        },
                                    },
                                    7: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    10: {
                                        stats: {
                                            "strength": {flat: 1},
                                            "crit_multiplier": {flat: 0.1}, 
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "dexterity": {flat: 2},
                                        }
                                    },
                                },
                                max_level_coefficient: 8
                            });

    skills["Hammers"] = new Skill({ 
                                        parent_skill: "Weapon mastery",
                                        names: {0: "Hammer combat"}, 
                                        category: "Weapon",
                                        description: "desc skill Hammers",
                                        get_effect_description: ()=> {
                                            return translationManager.getText(language, "skill effect Hammers", {v1: Math.round(get_total_skill_coefficient({skill_id:"Hammers",scaling_type:"multiplicative"})*1000)/1000, v2: Math.round((get_total_skill_coefficient({skill_id:"Hammers",scaling_type:"multiplicative"})**0.3333)*1000)/1000});
                                        },
                                        milestones: {
                                            1: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                }
                                            },
                                            3: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                }
                                            },
                                            5: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                    "dexterity": {flat: 1},
                                                },
                                            },
                                            7: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                }
                                            },
                                            10: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                    "dexterity": {flat: 1}, 
                                                },
                                            },
                                            12: {
                                                stats: {
                                                    "dexterity": {flat: 2},
                                                }
                                            },
                                        },
                                        max_level_coefficient: 8
                                    });

    skills["Daggers"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Dagger combat"},
                                category: "Weapon",
                                description: "desc skill Daggers",
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Daggers", {v1: Math.round(get_total_skill_coefficient({skill_id:"Daggers",scaling_type:"multiplicative"})*1000)/1000, v2: Math.round((get_total_skill_coefficient({skill_id:"Daggers",scaling_type:"multiplicative"})**0.3333)*1000)/1000});
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "agility": {flat: 1},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "crit_multiplier": {flat: 0.1},
                                            "crit_rate": {flat: 0.01},
                                        },
                                    },
                                    7: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    10: {
                                        stats: {
                                            "crit_rate": {flat: 0.02},
                                            "crit_multiplier": {flat: 0.1}, 
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "dexterity": {flat: 2},
                                        }
                                    },
                                },
                                max_level_coefficient: 8
                            });

    skills["Wands"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Wand casting"}, 
                                category: "Weapon",
                                description: "desc skill Wands",
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Wands", {v1: Math.round(get_total_skill_coefficient({skill_id:"Wands",scaling_type:"multiplicative"})*1000)/1000});
                                },
                                max_level_coefficient: 8});

    skills["Staffs"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Staff casting"}, 
                                category: "Weapon",
                                description: "desc skill Staffs",
                                get_effect_description: ()=> {
                                    return translationManager.getText(language, "skill effect Staffs", {v1: Math.round(get_total_skill_coefficient({skill_id:"Staffs",scaling_type:"multiplicative"})*1000)/1000});
                                },
                                max_level_coefficient: 8});
})();

//work related
(function(){
    skills["Farming"] = new Skill({
                                names: {0: "Farming"}, 
                                description: "desc skill Farming",
                                base_xp_cost: 40,
                                category: "Activity",
                                max_level: 10,
                                xp_scaling: 1.6,
                                max_level_coefficient: 2,
                                milestones: {
                                    1: {
                                        stats: {
                                            max_stamina: {flat: 2},
                                        },
                                    },
                                    2: {
                                        stats: {
                                            strength: {flat: 1}
                                        },
                                    },
                                    3: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            max_stamina: {flat: 2},
                                        }
                                    },
                                    4: {
                                        stats: {
                                            strength: {flat: 1},
                                            max_stamina: {flat: 2},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            strength: {flat: 1},
                                            max_stamina: {flat: 2},
                                        },
                                        xp_multipliers: {
                                            "Herbalism": 1.05,
                                        }
                                    },
                                    6: {
                                        stats: {
                                            strength: {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Weightlifting: 1.1,
                                        }
                                    },
                                    7: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            max_stamina: {flat: 2},
                                        },
                                        xp_multipliers: {
                                            "Unarmed": 1.05,
                                        }
                                    },
                                    8: {
                                        stats: {
                                            strength: {flat: 1},
                                            max_stamina: {flat: 2},
                                        }
                                    },
                                    9: {
                                        stats: {
                                            strength: {flat: 1},
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    10: {
                                        stats: {
                                            max_stamina: {flat: 4},
                                            strength: {multiplier: 1.05},
                                            dexterity: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            "Unarmed": 1.1,
                                            "Herbalism": 1.1,
                                            "Digging": 1.1,
                                        }
                                    }
                                }});
})();

//non-work activity related
(function(){
    skills["Sleeping"] = new Skill({
                                    names: {0: "Sleeping"}, 
                                    description: "desc skill Sleeping",
                                    get_effect_description: ()=>{
                                        return translationManager.getText(language, "skill effect Sleeping", {v1: Math.round(100*(1 + get_total_skill_level("Sleeping")/skills["Sleeping"].max_level))/100});
                                    },
                                    base_xp_cost: 1000,
                                    flavour_text: "skill flavour Sleeping",
                                    visibility_treshold: 300,
                                    xp_scaling: 2,
                                    category: "Activity",
                                    max_level: 10,
                                    max_level_coefficient: 2.5,    
                                    milestones: {
                                        2: {
                                            stats: {
                                                "max_health": {
                                                    flat: 10,
                                                    multiplier: 1.04,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.05,
                                            }
                                        },
                                        4: {
                                            stats: {
                                                "max_health": {
                                                    flat: 20,
                                                    multiplier: 1.04,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.05,
                                            },
                                        },
                                        5: {
                                            unlocks: {
                                                skills: [
                                                    "Meditation"
                                                ]
                                            }
                                        },
                                        6: {
                                            stats: {
                                                "max_health": {
                                                    flat: 30,
                                                    multiplier: 1.04,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.05,
                                                "Meditation": 1.1,
                                            }
                                        },
                                        8: {
                                            stats: {
                                                "max_health": {
                                                    flat: 30,
                                                    multiplier: 1.04,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.05,
                                            }
                                        },
                                        10: {
                                            stats: {
                                                "max_health": {
                                                    flat: 40,
                                                    multiplier: 1.1,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.1,
                                                "Meditation": 1.2,
                                            },
                                            unlocks: {
                                                recipes: [
                                                    {category: "crafting", subcategory: "items", recipe_id: "Simple dream catcher"},
                                                ]
                                            }
                                        }
                                    }
                                });                         
    skills["Meditation"] = new Skill({
        names: {0: "Meditation"}, 
        description: "desc skill Meditation",
        base_xp_cost: 200,
        category: "Activity",
        max_level: 30, 
        max_level_coefficient: 2,
        is_unlocked: false,
        visibility_treshold: 0,
        milestones: {
            2: {
                stats: {
                    "intuition": {flat: 1},
                },
                xp_multipliers: {
                    all: 1.05,
                    "Presence sensing": 1.05,
                }
            },
            4: {
                stats: {
                    "intuition": {
                        flat: 1, 
                        multiplier: 1.05
                    }
                },
                xp_multipliers: {
                    all: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            5: {
                xp_multipliers: {
                    "Sleeping": 1.1,
                    "Breathing": 1.1,
                    "Presence sensing": 1.05,
                }
            },
            6: {
                stats: {
                    "intuition": {
                        flat: 2,
                    }
                },
                xp_multipliers: {
                    "Strength of mind": 1.05,
                }
            },
            8: {
                stats: {
                    "intuition": {
                        multiplier: 1.05
                    },
                },
                xp_multipliers: {
                    all: 1.05,
                    "Sleeping": 1.1,
                    "Breathing": 1.1,
                    "Presence sensing": 1.05,
                }
            },
            10: {
                stats: {
                    "intuition": {
                        flat: 2,
                        multiplier: 1.05
                    }
                },
                xp_multipliers: {
                    all: 1.1,
                    "Sleeping": 1.1,
                    "Breathing": 1.1,
                    "Presence sensing": 1.1,
                    "Strength of mind": 1.1,
                }
            },
            12: {
                stats: {
                    "intuition": {
                        flat: 2,
                    }
                },
                xp_multipliers: {
                    all: 1.05,
                    "Presence sensing": 1.1,
                }
            },
            15: {
                xp_multipliers: {
                    all: 1.1,
                }
            },
            20: {
                stats: {
                    "intuition": {
                        multiplier: 1.05,
                    }
                },
                xp_multipliers: {
                    all_skill: 1.1,
                    "Presence sensing": 1.2,
                    Sleeping: 1.2,
                }
            }
        },
        get_effect_description: ()=> {
            let value = get_total_skill_coefficient({skill_id:"Meditation",scaling_type:"multiplicative"})
            return translationManager.getText(language, "skill effect Meditation", {v1: Math.round(value*100)/100});
        },
    });                  
    skills["Running"] = new Skill({
        description: "desc skill Running",
        names: {0: "Running"},
        max_level: 50,
        category: "Activity",
        max_level_coefficient: 2,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    agility: {
                        flat: 1
                    },
                },
            },
            3: {
                stats: {
                    agility: {
                        flat: 1
                    },
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                }
            },
            5: {
                stats: {
                    agility: {
                        flat: 1,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },                                          
            },
            7: {
                stats: {
                    agility: {
                        flat: 1,
                        multiplier: 1.05,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.05,
                }
            },
            10: {
                stats: {
                    agility: {
                        flat: 1,
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                }
            },
            12: {
                stats: {
                    agility: {
                        flat: 2
                    },
                    max_stamina: {
                        flat: 5
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.05,
                },
                unlocks: {
                            quests: [
                                "Swimming/climbing unlock",
                                "Swimming alternative unlock"
                            ]
                        }
            },
            15: {
                stats: {
                    agility: {
                        flat: 3
                    },
                    max_stamina: {
                        flat: 5
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                },
            },
            20: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.1,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.2,
                },
            }
        },
        get_effect_description: ()=> {
            let value = get_total_skill_coefficient({skill_id:"Running",scaling_type:"multiplicative"})
            return translationManager.getText(language, "skill effect Running", {v1: Math.round(value*100)/100});
        },
    });
    skills["Weightlifting"] = new Skill({
        description: "desc skill Weightlifting",
        names: {0: "Weightlifting"},
        max_level: 50,
        category: "Activity",
        max_level_coefficient: 4,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
            },
            3: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
                xp_multipliers: {
                    "Unarmed": 1.05,
                }
            },
            5: {
                stats: {
                    strength: {
                        flat: 1,
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
            },
            7: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
                xp_multipliers: {
                    "Unarmed": 1.1,
                }
            },
            10: {
                stats: {
                    strength: {
                        flat: 1, 
                        multiplier: 1.05
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
            },
            12: {
                stats: {
                    strength: {
                        flat: 2
                    },
                    max_stamina: {
                        flat: 5
                    }
                },
                unlocks: {
                            quests: [
                                "Swimming/climbing unlock",
                                "Swimming alternative unlock"
                            ]
                        }
            },
            15: {
                stats: {
                    strength: {
                        flat: 2
                    },
                    max_stamina: {
                        flat: 5
                    }
                },
            },
            20: {
                stats: {
                    strength: {
                        flat: 5,
                        multiplier: 1.05
                    },
                    max_stamina: {
                        flat: 20,
                    },
                },
            }
        },
        get_effect_description: ()=> {
        let value = get_total_skill_coefficient({skill_id:"Weightlifting",scaling_type:"multiplicative"})
        return translationManager.getText(language, "skill effect Weightlifting", {v1: Math.round(value*100)/100});
        },
    });
    skills["Swimming"] = new Skill({
        description: "desc skill Swimming",
        get_effect_description: ()=> {
            let value = get_total_skill_coefficient({skill_id:"Swimming",scaling_type:"multiplicative"})
            return translationManager.getText(language, "skill effect Swimming", {v1: Math.round(value*100)/100});
        },
        names: {0: "Swimming"},
        max_level: 50,
        category: "Activity",
        max_level_coefficient: 2,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    agility: {
                        flat: 1
                    },
                },
            },
            3: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
                xp_multipliers: {
                    "Breathing": 1.05,
                }
            },
            5: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
            },
            7: {
                stats: {
                    agility: {
                        flat: 1,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                }
            },
            10: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
            },
            12: {
                stats: {
                    agility: {
                        flat: 2,
                    },
                    max_stamina: {
                        flat: 10,
                    }
                }
            },
            15: {
                stats: {
                    agility: {
                        flat: 2,
                    },
                    max_stamina: {
                        flat: 10,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                }
            },
            20: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.2,
                }
            }
        },
        
    });

    skills["Equilibrium"] = new Skill({
        description: "desc skill Equilibrium",
        names: {0: "Equilibrium"},
        category: "Activity",
        max_level: 50,
        max_level_coefficient: 4,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    agility: {flat: 1},
                },
            },
            3: {
                stats: {
                    intuition: {flat: 1},
                }
            },
            5: {
                stats: {
                    agility: {
                        flat: 1,
                        multiplier: 1.05,
                    },
                    strength: {flat: 1},
                    max_stamina: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Unarmed": 1.1,
                }
            },
            7: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            9: {
                stats: {
                    strength: {flat: 1},
                }
            },
            10: {
                stats: {
                    agility: {flat: 1},
                    intuition: {multiplier: 1.05},
                    max_stamina: {multiplier: 1.05},
                },
            },
            12: {
                stats: {
                    agility: {flat: 1},
                    strength: {flat: 1},
                }
            },
            15: {
                stats: {
                    agility: {flat: 5},
                    strength: {flat: 5},
                }
            },
            20: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Unarmed": 1.2,
                }
            }
        },
        get_effect_description: ()=> {
        let value = get_total_skill_coefficient({skill_id:"Equilibrium",scaling_type:"multiplicative"});
        return translationManager.getText(language, "skill effect Equilibrium", {v1: Math.round(value*100)/100});
        },
    });

    skills["Climbing"] = new Skill({
        description: "desc skill Climbing",
        names: {0: "Climbing"},
        max_level: 50,
        category: "Activity",
        max_level_coefficient: 2,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    agility: {
                        flat: 1
                    },
                },
            },
            3: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
            },
            5: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.03,
                    }
                },
            },
            7: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
            },
            10: {
                stats: {
                    strength: {
                        multiplier: 1.05
                    },
                    max_stamina: {
                        multiplier: 1.03,
                    }
                },
                xp_multipliers: {
                    Perception: 1.1, //because when climbing you need to find things that you can hold to, right?
                }
            },
            12: {
                stats: {
                    strength: {
                        flat: 2
                    },
                    agility: {
                        flat: 2
                    }
                }
            },
            15: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                }
            },
            20: {
                stats: {
                    strength: {
                        multiplier: 1.05,
                    },
                    intuition: {
                        flat: 3,
                    }
                }
            }
        },
        get_effect_description: ()=> {
          let value = get_total_skill_coefficient({skill_id:"Climbing",scaling_type:"multiplicative"});

          return translationManager.getText(language, "skill effect Climbing", {v1: Math.round(value*100)/100});
        },
    });
})();

//resource gathering related
(function(){
    skills["Gathering mastery"] = new Skill({
        names: {0: "Beginner gatherer", 10: "Apprentice gatherer", 25: "Adept gatherer", 35: "Expert gatherer", 50: "Master gatherer"}, 
        description: "desc skill Gathering mastery",
        milestones: {
            5: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            10: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            15: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            25: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            30: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
        },
        base_xp_cost: 10,
        xp_scaling: 1.6,
        visibility_treshold: 4,
        parent_multiplier: 1.05,
        category: "Gathering",
        get_effect_description: function() {
            return translationManager.getText(language, "skill effect Gathering mastery", {v1: this.parent_multiplier});
        },
    });
    skills["Woodcutting"] = new Skill({
        names: {0: "Woodcutting"},
        parent_skill: "Gathering mastery",
        description: "desc skill Woodcutting",
        milestones: {
            1: {
                stats: {
                    strength: {flat: 1},
                },
            },
            3: {
                stats: {
                    strength: {flat: 1},
                },
                xp_multipliers: {
                    "Weightlifting": 1.1,
                },
            },
            5: {
                stats: {
                    strength: {multiplier: 1.05},
                    dexterity: {flat: 1},
                },
            },
            7: {
                stats: {
                    strength: {flat: 2},
                },
            },
            10: {
                stats: {
                    strength: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Weightlifting": 1.1,
                },
            },
            15: {
                stats: {
                    strength: {flat: 2},
                },
            },
            20: {
                stats: {
                    strength: {multiplier: 1.05},
                },
            },
        },
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Mining"] = new Skill({
        names: {0: "Mining"},
        parent_skill: "Gathering mastery",
        description: "desc skill Mining",
        milestones: {
            1: {
                stats: {
                    strength: {flat: 1},
                },
            },
            3: {
                stats: {
                    dexterity: {flat: 1},
                },
                xp_multipliers: {
                    "Weightlifting": 1.1,
                },
            },
            5: {
                stats: {
                    strength: {multiplier: 1.05},
                },
            },
            7: {
                stats: {
                    strength: {flat: 2},
                },
            },
            10: {
                stats: {
                    dexterity: {flat: 2},
                },
                xp_multipliers: {
                    "Perception": 1.1,
                },
            },
            15: {
                stats: {
                    strength: {flat: 2},
                },
            },
            20: {
                stats: {
                    strength: {multiplier: 1.05},
                },
            },
        },
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Digging"] = new Skill({
        names: {0: "Digging"},
        parent_skill: "Gathering mastery",
        description: "desc skill Digging",
        milestones: {
            1: {
                stats: {
                    strength: {flat: 1},
                },
            },
            3: {
                stats: {
                    max_stamina: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Running": 1.1,
                },
            },
            5: {
                stats: {
                    strength: {flat: 1},
                },
            },
            7: {
                stats: {
                    max_stamina: {multiplier: 1.05},
                },
            },
            10: {
                stats: {
                    strength: {flat: 2},
                },
                xp_multipliers: {
                    "Weightlifting": 1.1,
                },
            },
            15: {
                stats: {
                    strength: {flat: 2},
                },
            },
            20: {
                stats: {
                    max_stamina: {multiplier: 1.05},
                },
            },
        },
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Herbalism"] = new Skill({
        names: {0: "Herbalism"},
        parent_skill: "Gathering mastery",
        description: "desc skill Herbalism",
        milestones: {
            1: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            3: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Perception": 1.1,
                },
            },
            5: {
                stats: {
                    intuition: {multiplier: 1.05},
                    dexterity: {flat: 1},
                },
            },
            7: {
                stats: {
                    intuition: {flat: 2},
                },
            },
            10: {
                stats: {
                    dexterity: {flat: 2},
                },
                xp_multipliers: {
                    "Perception": 1.1,
                },
            },
            15: {
                stats: {
                    intuition: {flat: 2},
                },
            },
            20: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
            },
        },
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Animal handling"] = new Skill({
        names: {0: "Animal handling"},
        parent_skill: "Gathering mastery",
        description: "desc skill Animal handling",
        milestones: {
            1: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            3: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Presence sensing": 1.1,
                },
            },
            5: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
            },
            7: {
                stats: {
                    intuition: {flat: 2},
                },
            },
            10: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Persistence": 1.1,
                },
            },
            15: {
                stats: {
                    intuition: {flat: 2},
                },
            },
            20: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
            },
        },
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Fishing"] = new Skill({
        names: {0: "Fishing"},
        parent_skill: "Gathering mastery",
        description: "desc skill Fishing",
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
        milestones: {
            1: {
                stats: {
                    intuition: {flat: 1},
                }
            },
            3: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    Persistence: 1.1,
                }
            },
            5: {
                stats: {
                    intuition: {multiplier: 1.05},
                    dexterity: {flat: 1},
                },
                xp_multipliers: {
                    Perception: 1.1,
                }
            },
            7: {    
                stats: {
                    intuition: {flat: 2},
                },
            },
            9: {
                stats: {
                    intuition: {flat: 2},
                }
            },
            10: {
                stats: {
                    intuition: {multiplier: 1.05},
                    dexterity: {flat: 2},
                },
                xp_multipliers: {
                    Perception: 1.1,
                    Meditation: 1.1,
                }
            },
            12: {    
                stats: {
                    intuition: {flat: 4},
                },
                xp_multipliers: {
                    "Presence sensing": 1.2
                }
            },
            15: {    
                stats: {
                    intuition: {multiplier: 1.05},
                    dexterity: {flat: 3},
                },
                xp_multipliers: {
                    Perception: 1.1,
                    "Swimming": 1.05,
                    "Animal handling": 1.05
                }
            },
            18: {
                stats: {
                    intuition: {flat: 5}
                },
                xp_multipliers: {
                    Perception: 1.1,
                    Persistence: 1.1
                }
            },
            20: {    
                stats: {
                    intuition: { multiplier: 1.1, flat: 5 },
                    dexterity: {flat: 5},
                },
                xp_multipliers: {
                    all: 1.05,
                    "Presence sensing": 1.2,
                    Meditation: 1.2
                }
            },
        }
    });
})();

//crafting skills
(function(){
    skills["Crafting mastery"] = new Skill({
        skill_id: "Crafting mastery", 
        names: {0: "Crafting proficiency", 15: "Crafting mastery"}, 
        description: "desc skill Crafting mastery",
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
        milestones: {
            5: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            10: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            15: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            20: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            25: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            30: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            }
        }
    });

    skills["Crafting"] = new Skill({
        names: {0: "Tinkering"}, 
        description: "desc skill Crafting",
        milestones: {
            3: {
                stats: {
                    dexterity: {flat: 1},
                },
            },
            7: {
                stats: {
                    dexterity: {flat: 1},
                },
            },
            12: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    dexterity: {flat: 2},
                },
            },
            30: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
        },
        category: skill_category_crafting,
        parent_skill: "Crafting mastery",
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
        get_effect_description: () => {
            return translationManager.getText(language, "skill effect Crafting", {v1: get_crafting_quality_caps("Crafting").components, v2: get_crafting_quality_caps("Crafting").equipment});
        },
    });
    skills["Smelting"] = new Skill({
        names: {0: "Smelting"}, 
        description: "desc skill Smelting",
        milestones: {
            3: {
                stats: {
                    strength: {flat: 1},
                },
            },
            7: {
                stats: {
                    dexterity: {flat: 1},
                },
            },
            12: {
                stats: {
                    strength: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    strength: {flat: 2},
                },
            },
            30: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
        },
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
    });
    skills["Forging"] = new Skill({
        names: {0: "Forging"}, 
        description: "desc skill Forging",
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
        get_effect_description: () => {
            return translationManager.getText(language, "skill effect Forging", {v1: get_crafting_quality_caps("Forging").components});
        },
        //The level-10 recipe unlock was here already; the stat milestones join it
        //rather than replacing it.
        milestones: {
            3: {
                stats: {
                    strength: {flat: 1},
                },
            },
            7: {
                stats: {
                    dexterity: {flat: 1},
                },
            },
            10: {
                unlocks: {
                    recipes: [
                        {category: "smelting", subcategory: "items", recipe_id: "Steel ingot (inefficient)"},
                    ]
                }
            },
            15: {
                stats: {
                    strength: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    dexterity: {flat: 2},
                },
            },
            30: {
                stats: {
                    strength: {multiplier: 1.05},
                },
            },
        }
    });
    skills["Cooking"] = new Skill({
        names: {0: "Cooking"}, 
        description: "desc skill Cooking",
        milestones: {
            3: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            7: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Gluttony": 1.1,
                },
            },
            12: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    intuition: {flat: 2},
                },
            },
            30: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
            },
        },
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
    });
    skills["Alchemy"] = new Skill({
        names: {0: "Alchemy"}, 
        description: "desc skill Alchemy",
        milestones: {
            3: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            7: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Medicine": 1.1,
                },
            },
            12: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    intuition: {flat: 2},
                },
            },
            30: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
            },
        },
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
    });
    skills["Butchering"] = new Skill({
        skill_id: "Butchering", 
        names: {0: "Butchering"}, 
        description: "desc skill Butchering",
        milestones: {
            3: {
                stats: {
                    dexterity: {flat: 1},
                },
            },
            7: {
                stats: {
                    strength: {flat: 1},
                },
            },
            12: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    dexterity: {flat: 2},
                },
            },
            30: {
                stats: {
                    strength: {multiplier: 1.05},
                },
            },
        },
        category: skill_category_crafting,
        parent_skill: "Crafting mastery",
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level_coefficient: 2,
        max_level: 60,
        is_unlocked: false,
        visibility_treshold: 0,
        get_effect_description: () => {
            let value = get_total_skill_coefficient({skill_id:"Butchering",scaling_type:"multiplicative"});
            return translationManager.getText(language, "skill effect Butchering", {v1: Math.round(value*100)/100});},
    });
    skills["Woodworking"] = new Skill({
        skill_id: "Woodworking", 
        names: {0: "Woodworking"}, 
        description: "desc skill Woodworking",
        milestones: {
            3: {
                stats: {
                    dexterity: {flat: 1},
                },
            },
            7: {
                stats: {
                    dexterity: {flat: 1},
                },
            },
            12: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    dexterity: {flat: 2},
                },
            },
            30: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
        },
        category: skill_category_crafting,
        parent_skill: "Crafting mastery",
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
    });
})();

//defensive skills
(function(){
    skills["Iron skin"] = new Skill({
        category: "Combat",
        names: {0: "Tough skin", 10: "Wooden skin", 20: "Stone skin", 30: "Iron skin"},
        description: "desc skill Iron skin",
        base_xp_cost: 400,
        xp_scaling: 1.9,
        max_level: 30,
        max_level_bonus: 30,
        get_effect_description: ()=> {
            return translationManager.getText(language, "skill effect Iron skin", {v1: Math.round(get_total_level_bonus("Iron skin"))});
        },
        milestones: {
            3: {
                stats: {
                    max_health: {multiplier: 1.01},
                }
            },
            5: {
                stats: {
                    max_health: {multiplier: 1.01},
                    unarmed_power: {flat: 0.4},
                }
            },
            7: {
                stats: {
                    max_health: {multiplier: 1.02},
                },
                xp_multipliers: {
                    "Fortitude": 1.05,
                }
            },
            10: {
                stats: {
                    max_health: {multiplier: 1.02},
                    unarmed_power: {flat: 0.6},
                }
            },
            12: {
                stats: {
                    max_health: {multiplier: 1.02},
                },
                xp_multipliers: {
                    "Fortitude": 1.05,
                }
            },
            15: {
                stats: {
                    max_health: {multiplier: 1.1},
                    unarmed_power: {flat: 1},
                },
            },
            20: {
                stats: {
                    max_health: {multiplier: 1.1},
                },
                xp_multipliers: {
                    Fortitude: 1.2,
                    Persistence: 1.2,
                }
            }
        }
    });
    skills["Fortitude"] = new Skill({
        category: "Combat",
        names: {0: "Fortitude"},
        description: "desc skill Fortitude",
        base_xp_cost: 200,
        xp_scaling: 1.6,
        max_level: 60,
        max_level_coefficient: 4,
        get_effect_description: ()=> {
            return translationManager.getText(language, "skill effect Fortitude", {v1: Math.round(100*get_total_skill_coefficient({scaling_type: "multiplicative", skill_id: "Fortitude"}))/100});
        },
        milestones: {
            3: {
                stats: {
                    max_health: {multiplier: 1.01},
                }
            },
            5: {
                stats: {
                    defense: {flat: 1},
                },
                xp_multipliers: {
                    "Iron skin": 1.05,
                }
            },
            7: {
                stats: {
                    max_health: {multiplier: 1.02},
                }
            },
            10: {
                stats: {
                    defense: {flat: 1},
                },
                xp_multipliers: {
                    "Iron skin": 1.05,
                }
            },
            12: {
                stats: {
                    max_health: {multiplier: 1.02},
                }
            },
            15: {
                stats: {
                    max_health: {multiplier: 1.05},
                }
            },
            20: {
                stats: {
                    max_health: {multiplier: 1.02},
                },
                xp_multipliers: {
                    "Iron skin": 1.2,
                    Persistence: 1.2,
                }
            }
        }
    });
})();

//character skills and resistances
(function(){
    skills["Persistence"] = new Skill({
        names: {0: "Persistence"},
        description: "desc skill Persistence",
        flavour_text: "skill flavour Persistence",
        base_xp_cost: 60,
        category: "Character",
        max_level: 30,
        get_effect_description: ()=> {
            return translationManager.getText(language, "skill effect Persistence", {v1: (50+Math.round(get_total_level_bonus("Persistence")*100000)/1000)/100});
        },
        milestones: {
            2: {
                stats: {
                    max_stamina: {flat: 5},
                },
                xp_multipliers: {
                    all_skill: 1.05,
                }
            },
            4: {
                stats: {
                    max_stamina: {flat: 5},
                },
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            6: {
                stats: {
                    max_stamina: {flat: 10},
                    heat_tolerance: {flat: 1},
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    all: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            8: {
                stats: {
                    max_stamina: {flat: 10},
                },
                xp_multipliers: {
                    all: 1.05,
                }
            },
            10: {
                stats: {
                    max_stamina: {multiplier: 1.1},
                },
                xp_multipliers: {
                    hero: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            12: {
                stats: {
                    max_stamina: {flat: 10},
                    heat_tolerance: {flat: 1},
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            15: {
                stats: {
                    stamina_efficiency: {multiplier: 1.1},
                },
                xp_multipliers: {
                    all_skill: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            20: {
                stats: {
                    stamina_efficiency: {multiplier: 1.1},
                    max_stamina: {flat: 10},
                    heat_tolerance: {flat: 1},
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    all: 1.1,
                }
            }
        },
        max_level_bonus: 0.3
    });
    skills["Perception"] = new Skill({
        names: {0: "Perception"}, 
        description: "desc skill Perception",
        base_xp_cost: 100,
        visibility_treshold: 80,
        xp_scaling: 1.8,
        max_level: 40,
        category: "Character",
        get_effect_description: ()=> {
            return translationManager.getText(language, "skill effect Perception", {v1: Math.min(skills["Perception"].max_level, get_total_skill_level("Perception"))});
        },
        milestones: {
            1: {
                stats: {
                    intuition: {flat: 2},
                    dexterity: {flat: 2},
                },
                xp_multipliers: {
                    all: 1.05,
                }
            },
            3: {
                stats: {
                    intuition: {flat: 2},
                    dexterity: {flat: 2},
                    crit_multiplier: {flat: 0.1},
                },
            },
            5: {
                xp_multipliers: {
                    Herbalism: 1.1,
                    Fishing: 1.1,
                }
            },
            7: {
                stats: {
                    intuition: {flat: 2},
                    dexterity: {multiplier: 1.1},
                    crit_multiplier: {flat: 0.1},
                },
            },
            10: {
                xp_multipliers: {
                    Herbalism: 1.2,
                    Fishing: 1.2,
                    hero: 1.1,
                }
            },
            15: {
                stats: {
                    intuition: {flat: 5},
                    dexterity: {multiplier: 1.1},
                    crit_multiplier: {flat: 0.2},
                },
            },
            20: {
                xp_multipliers: {
                    Herbalism: 1.2,
                    Fishing: 1.2,
                    hero: 1.2,
                },
                stats: {
                    intuition: {flat: 10},
                    dexterity: {multiplier: 1.1},
                    crit_multiplier: {flat: 0.2},
                },
            }
        }
    });
    skills["Literacy"] = new Skill({
        names: {0: "Literacy"}, 
        description: "desc skill Literacy",
        category: "Character",
        base_xp_cost: 120,
        max_level: 10,
        xp_scaling: 2,
        milestones: {
            1: {
                xp_multipliers: {
                    hero: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            2: {
                xp_multipliers: {
                    all_skill: 1.05,
                }
            },
            3: {
                xp_multipliers: {
                    all: 1.05,
                }
            },
            5: {
                xp_multipliers: {
                    hero: 1.05,
                    "Strength of mind": 1.05,
                }
            }
        }
    });
    skills["Medicine"] = new Skill({
        names: {0: "Medicine"}, 
        description: "desc skill Medicine",
        milestones: {
            3: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            7: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Regeneration": 1.1,
                },
            },
            12: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
            },
            20: {
                stats: {
                    intuition: {flat: 2},
                },
            },
        },
        category: "Character",
        max_level: 30,
        visibility_treshold: 5,
        max_level_coefficient: 2,
        get_effect_description: ()=> {
            let value = get_total_skill_coefficient({skill_id:"Medicine",scaling_type:"multiplicative"});
            return translationManager.getText(language, "skill effect Medicine", {v1: Math.round((value**2)*100)/100, v2: Math.round(value*100)/100});
        },
    });
    skills["Poison resistance"] = new Skill({
        names: {0: "Poison resistance"}, 
        description: "desc skill Poison resistance",
        category: "Character",
        max_level: 30,
        visibility_treshold: 5,
        max_level_coefficient: 10,
        get_effect_description: ()=> {
            let value = get_total_skill_coefficient({skill_id:"Poison resistance",scaling_type:"multiplicative"});
            return translationManager.getText(language, "skill effect Poison resistance", {v1: Math.round(value*100)/100});
        },
        milestones: {
            3: {
                xp_multipliers: {
                    Fortitude: 1.05,
                    Persistence: 1.05,
                }
            },
            5: {
                stats: {
                    max_health: {
                        flat: 20,
                    }
                },
                xp_multipliers: {
                    Regeneration: 1.1,
                }
            },
            7: {
                stats: {
                    health_regeneration_flat: {
                        flat: 0.1,
                    }
                }
            },
            10: {
                stats: {
                    max_stamina: {
                        flat: 20,
                    },
                },
                xp_multipliers: {
                    Fortitude: 1.1,
                    Persistence: 1.1,
                }
            },
            12: {
                stats: {
                    health_regeneration_flat: {
                        flat: 0.1,
                    }
                },
                xp_multipliers: {
                    Regeneration: 1.1,
                }
            },
            15: {
                xp_multipliers: {
                    Fortitude: 1.1,
                    Persistence: 1.1,
                }
            },
            20: {
                stats: {
                    max_stamina: {
                        multiplier: 1.1,
                    },
                    max_health: {
                        multiplier: 1.1,
                    }
                },
                xp_multipliers: {
                    Fortitude: 1.2,
                    Persistence: 1.2,
                }
            },
        }
    });
    skills["Gluttony"] = new Skill({
        names: {0: "Gluttony"}, 
        description: "desc skill Gluttony",
        category: "Character",
        max_level: 30,
        visibility_treshold: 5,
        max_level_coefficient: 2,
        get_effect_description: ()=> {
            let value = get_total_skill_coefficient({skill_id:"Gluttony",scaling_type:"multiplicative"});
            return translationManager.getText(language, "skill effect Gluttony", {v1: Math.round((value**2)*100)/100, v2: Math.round(value*100)/100});
        },
        milestones: {
            3: {
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            5: {
                stats: {
                    max_health: {
                        flat: 20,
                    }
                },
                xp_multipliers: {
                    "Regeneration": 1.1,
                }
            },
            7: {
                stats: {
                    health_regeneration_flat: {
                        flat: 0.1,
                    }
                }
            },
            10: {
                stats: {
                    stamina_regeneration_flat: {
                        flat: 0.1,
                    },
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            12: {
                stats: {
                    health_regeneration_flat: {
                        flat: 0.2,
                    }
                },
                xp_multipliers: {
                    "Regeneration": 1.1,
                }
            },
            15: {
                xp_multipliers: {
                    Regeneration: 1.1,
                    Weightlifting: 1.1,
                    Running: 1.1,
                    Climbing: 1.1,
                    Swimming: 1.1,
                }
            },
            20: {
                stats: {
                    stamina_regeneration_flat: {
                        flat: 0.2,
                    },
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    hero: 1.1,
                    Regeneration: 1.2,
                }
            },
        }
    });
    skills["Breathing"] = new Skill({
        names: {0: "Breathing"},
        description: "desc skill Breathing",
        flavour_text: "skill flavour Breathing",
        base_xp_cost: 400,
        visibility_treshold: 390,
        xp_scaling: 1.6,
        category: "Character",
        max_level_coefficient: 2,
        max_level: 40,
        milestones: {
            3: {
                xp_multipliers: {
                    Running: 1.1,
                    Meditation: 1.1,
                },
                stats: {
                    attack_speed: {
                        multiplier: 1.02,
                    }
                }
            },
            5: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    },
                },
            },
            7: {
                xp_multipliers: {
                    Running: 1.1,
                    Meditation: 1.1,
                },
                stats: {
                    stamina_regeneration_flat: {
                        flat: 0.1,
                    }
                }
            },
            10: {
                stats: {
                    strength: {
                        multiplier: 1.05
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    },
                    attack_speed: {
                        multiplier: 1.02,
                    }
                },
            },
            12: {
                stats: {
                    strength: {
                        flat: 2
                    },
                    agility: {
                        flat: 2
                    },
                },
                xp_multipliers: {
                    Running: 1.1,
                    Meditation: 1.1,
                }
            }, 
            15: {
                xp_multipliers: {
                    Running: 1.1,
                    Meditation: 1.1,
                },
                stats: {
                    attack_speed: {
                        multiplier: 1.02,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    },
                    stamina_regeneration_flat: {
                        flat: 0.1,
                    }
                }
            },
            20: {
                xp_multipliers: {
                    category_Activity: 1.2,
                },
                stats: {
                    attack_speed: {
                        multiplier: 1.02,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    }
                }
            }
        },
        get_effect_description: ()=> {
            let value = get_total_skill_coefficient({skill_id:"Breathing",scaling_type:"multiplicative"});
            return translationManager.getText(language, "skill effect Breathing", {v1: Math.round(value*100)/100});
          },
    });  
    skills["Regeneration"] = new Skill({
                                names: {0: "Regeneration"}, 
                                description: "desc skill Regeneration",
                                get_effect_description: ()=>{
                                    return translationManager.getText(language, "skill effect Regeneration", {v1: Math.round(100*(1 + 3*get_total_skill_level("Regeneration")/skills["Regeneration"].max_level))/100});
                                },
                                base_xp_cost: 1000,
                                visibility_treshold: 500,
                                xp_scaling: 1.5,
                                category: "Character",
                                max_level: 40,
                                max_level_coefficient: 2.5,    
                                milestones: {
                                    1: {
                                        stats: {
                                            health_regeneration_flat: {
                                                flat: 0.1,
                                            }
                                        }
                                    },
                                    3: {
                                        stats: {
                                            max_health: {
                                                flat: 20,
                                            }
                                        }
                                    },
                                    5: {
                                        stats: {
                                            health_regeneration_flat: {
                                                flat: 0.1,
                                            }
                                        }
                                    },
                                    7: {
                                        stats: {
                                            max_health: {
                                                flat: 20,
                                            }
                                        }
                                    },
                                    10: {
                                        stats: {
                                            max_health: {
                                                flat: 20,
                                            },
                                            health_regeneration_flat: {
                                                flat: 0.2,
                                            }
                                        }
                                    },
                                    12: {
                                        stats: {
                                            max_health: {
                                                flat: 20,
                                            },
                                        }
                                    },
                                    15: {
                                        stats: {
                                            health_regeneration_flat: {
                                                flat: 0.3,
                                            },
                                            max_health: {
                                                flat: 40,
                                            },
                                        }
                                    },
                                    20: {
                                        stats: {
                                            max_health: {
                                                multiplier: 1.1,
                                            }
                                        },
                                        xp_multipliers: {
                                            "Iron skin": 1.2,
                                            Fortitude: 1.2,
                                        }
                                    },
                                }
    });  
})();

//miscellaneous skills
(function(){
    skills["Haggling"] = new Skill({
        names: {0: "Haggling"},
        description: "desc skill Haggling",
        category: "Character",
        base_xp_cost: 100,
        max_level: 25,
        get_effect_description: ()=> {
            return translationManager.getText(language, "skill effect Haggling", {v1: Math.round((1 - get_total_level_bonus("Haggling"))*100)});
        },
        max_level_bonus: 0.5,
        milestones: {
            2: {
                stats: {
                    intuition: {
                        flat: 1
                    },
                },
            },
            3: {
                xp_multipliers: {
                    "Literacy": 1.05,
                },
            },
            5: {
                stats: {
                    intuition: {
                        flat: 2
                    },
                },
                xp_multipliers: {
                    "Literacy": 1.05,
                    "Persistence": 1.05,
                    Perception: 1.05,
                },
            },
            7: {
                stats: {
                    intuition: {
                        flat: 2
                    }
                },
            },
            10: {
                stats: {
                    intuition: {
                        flat: 2
                    },
                },
                xp_multipliers: {
                    Literacy: 1.05,
                    Persistence: 1.05,
                    Perception: 1.1,
                },
            },
            15: {
                stats: {
                    intuition: {
                        flat: 5
                    },
                },
                xp_multipliers: {
                    Literacy: 1.1,
                    Persistence: 1.1,
                    Perception: 1.1,
                },
            }
        }
    });
})();

Object.keys(skills).forEach(id => {
    skills[id].skill_id = id;
});

export {
    skills, Skill, skill_categories, 
    get_unlocked_skill_rewards, get_next_skill_milestone, 
    weapon_type_to_skill, which_skills_affect_skill, 
    skill_xp_gains_cap, crafting_skill_xp_gains_cap
};
