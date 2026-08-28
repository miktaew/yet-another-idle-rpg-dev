"use strict";

import AvailabilityComponent from "../components/availability_component.js";
import { config } from "../config.js";
import { character } from "../data/character.js";
import { availability_havers } from "../data/component_references.js";
import { skill_categories, skills } from "../data/skills.js";
import { stat_names } from "../misc.js";

const which_skills_affect_skill = {};

let unknown_skill_name = "?????";

class Skill {

    #availability;

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
                  category,
                  get_stat_modifiers = () => {return {}},
                  parent_multiplier = 1.1,
                  is_unlocked = true,
                  xp_gain_conditions = {},
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
        this.max_level = max_level; //max possible lvl, dont make it too high
        this.max_level_coefficient = max_level_coefficient; //multiplicative bonus for levels
        this.max_level_bonus = max_level_bonus; //other type bonus for levels
        this.base_xp_cost = base_xp_cost; //xp to go from lvl 1 to lvl 2
        if(base_xp_cost < 1/config.skill_xp_gains_cap) {
            console.warn(`Skill "${this.skill_id}" has base xp cost lower than what would be needed due to skill xp gains cap!`);
        }
        this.visibility_treshold = visibility_treshold < base_xp_cost ? visibility_treshold : base_xp_cost;
        //xp needed for skill to become visible and to get "unlock" message; try to keep it less than xp needed for lvl

        this.#availability = new AvailabilityComponent({is_unlocked, start_conditions: xp_gain_conditions});
        //is_unlocked is the only functional property; 
        //canBeStarted (through canGainXP) is the only functional method and decides whether skill can gain xp
        //that is done separately from basic xp addition, allowing some silly approaches like having an activity only provide xp during specific season
        
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

    getAvailabilityComponent() {
        return this.#availability;
    }

    canGainXP(context) {
        return this.getAvailabilityComponent().canBeStarted(context);
    }

    getDefaultSkillXP() {
        return character.getSkillXPObject({skill_id: this.skill_id});
    }

    /**
     * 
     * @returns total xp
     */
    getTotalXP() {
        return this.getDefaultSkillXP().total_xp;
    }

    /**
     * 
     * @returns total xp needed for next lvl (counting from lvl 0)
     */
    getTotalXPToNextLvl() {
        return this.getDefaultSkillXP().total_xp_to_next_lvl;
    }

    /**
     * 
     * @returns current lvl
     */
    getCurrentLvl() {
        return this.getDefaultSkillXP().current_level;
    }

    /**
     * 
     * @returns total xp to next level minus total xp to current lvl
     */
    getXPToNextLvl() {
        return this.getDefaultSkillXP().xp_to_next_lvl;
    }

    /**
     * 
     * @returns what's needed for next lvl minus total xp (basically the value that decides state of xp progress bar)
     */
    getCurrentXP() {
        return this.getDefaultSkillXP().current_xp;
    }

    getName(skillXP) {
        if(!skillXP) {
            skillXP = this.getDefaultSkillXP();
        }

        if(this.visibility_treshold > skillXP.total_xp || !this.isUnlocked()) {
            return unknown_skill_name;
        }
 
        const keys = Object.keys(this.names);
        if (keys.length == 1) {
            return (this.names[keys[0]]);
        }
        else {
            let rank_name;
            for (var i = 0; i <= keys.length; i++) {
                if (skillXP.current_level >= parseInt(keys[i])) {
                    rank_name = this.names[keys[i]];
                }
                else {
                    break;
                }
            }
            return rank_name;
        }
    }

    add_xp({skillXP, xp_to_add = 0}) {
        if(!skillXP) {
            skillXP = this.getDefaultSkillXP();
        }
        if(xp_to_add == 0 || !this.isUnlocked()) {
            return {};
        }
        xp_to_add = Math.round(xp_to_add*100)/100;
        let skill_name = this.getName(skillXP);
        //grab name beforehand, in case it changes after levelup (levelup message should appear BEFORE skill name change message, so this is necessary)

        skillXP.total_xp = Math.round(100*(skillXP.total_xp + xp_to_add))/100;
        if(skillXP.current_level < this.max_level) { //not max lvl
            if(Math.round(100*(xp_to_add + skillXP.current_xp))/100 < skillXP.xp_to_next_lvl) { // no levelup
                skillXP.current_xp = Math.round(100*(skillXP.current_xp + xp_to_add))/100;
            } else { //levelup
                
                let level_after_xp = 0;
                let unlocks = {skills: [], recipes: [], quests: []};

                //its alright if this goes over max level, it will be overwritten in a if-else below that
                while(skillXP.total_xp >= skillXP.total_xp_to_next_lvl) {

                    level_after_xp += 1;
                    skillXP.total_xp_to_next_lvl = Math.round(100*this.base_xp_cost * (1 - this.xp_scaling ** (level_after_xp + 1)) / (1 - this.xp_scaling))/100;

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
                    +`\nxp_added: ${xp_to_add};\nprevious level: ${skillXP.current_level};\ntotal xp: ${skillXP.total_xp};`
                    +`\ntotal xp for that level: ${total_xp_to_previous_lvl};\ntotal xp for next level: ${skillXP.total_xp_to_next_lvl}`);
                }

                let gains;
                if(level_after_xp < this.max_level) { //wont reach max lvl
                    gains = this.get_bonus_stats({skillXP, level: level_after_xp});
                    skillXP.xp_to_next_lvl = Math.round(100*(skillXP.total_xp_to_next_lvl - total_xp_to_previous_lvl))/100;
                    skillXP.current_level = level_after_xp;
                    skillXP.current_xp = Math.round(100*(skillXP.total_xp - total_xp_to_previous_lvl))/100;
                } else { //will reach max lvl
                    gains = this.get_bonus_stats({skillXP, level: this.max_level});
                    skillXP.current_level = this.max_level;
                    skillXP.total_xp_to_next_lvl = "Already reached max lvl";
                    skillXP.current_xp = "Max";
                    skillXP.xp_to_next_lvl = Infinity;
                }

                skill_name = skill_name===unknown_skill_name?this.getName(skillXP):skill_name;
                //swap name if it was unknown, otherwise leave it as it was (for properly messaging skill name change)
                let message = `${skill_name} has reached level ${skillXP.current_level}`;

                if (Object.keys(gains.stats).length > 0 || Object.keys(gains.xp_multipliers).length > 0) { 
                    message += `\n\n Thanks to ${skill_name} reaching a new milestone, %HeroName% gained: `;

                    if (gains.stats) {
                        Object.keys(gains.stats).forEach(stat => {
                            if(gains.stats[stat].flat) {
                                message += `\n +${gains.stats[stat].flat} ${stat_names[stat].replace("_"," ")}`;
                            }
                            if(gains.stats[stat].multiplier) {
                                message += `\n x${Math.round(100*gains.stats[stat].multiplier)/100} ${stat_names[stat].replace("_"," ")}`;
                            }   
                        });
                    }

                    if (gains.xp_multipliers) {
                        Object.keys(gains.xp_multipliers).forEach(xp_multiplier => {
                            let name;
                            if(xp_multiplier !== "all" && xp_multiplier !== "hero" && xp_multiplier !== "all_skill" && !xp_multiplier.includes("category_")) {
                                //The check has to come first: it was written to explain
                                //this crash and was sitting underneath it, so it could
                                //never print.
                                if(!skills[xp_multiplier]) {
                                    console.warn(`Skill ${this.skill_id} tried to reward an xp multiplier for something that doesn't exist: ${xp_multiplier}. I could be a misspelled skill name`);
                                    name = xp_multiplier;
                                } else {
                                    name = skills[xp_multiplier].getName();
                                }
                            } else {
                                
                                if(xp_multiplier.includes("category_")) {
                                    name = xp_multiplier.replace("category_", "") + " skills";
                                } else {
                                    name = xp_multiplier.replace("_"," ");
                                }
                            }

                            message += `\n x${Math.round(100*gains.xp_multipliers[xp_multiplier])/100} ${name} xp gain`;
                            
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
    get_bonus_stats({skillXP, level}) {
        //probably should rename, since it's not just stats anymore
        const gains = {stats: {}, xp_multipliers: {}};

        let stats;
        let xp_multipliers;

        for (let i = skillXP.current_level + 1; i <= level; i++) {
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
    get_coefficient({skillXP, scaling_type, skill_level}) { //starts from 1

        if(!skillXP) {
            skillXP = this.getDefaultSkillXP();
        }

        switch (scaling_type) {
            case "flat":
                return 1 + Math.round((this.max_level_coefficient - 1) * (skill_level || skillXP.current_level) / this.max_level * 1000) / 1000;
            case "multiplicative":
                return Math.round(Math.pow(this.max_level_coefficient, (skill_level || skillXP.current_level) / this.max_level) * 1000) / 1000;
            default: //same as on multiplicative
                return Math.round(Math.pow(this.max_level_coefficient, (skill_level || skillXP.current_level) / this.max_level) * 1000) / 1000;
        }
    }
    get_level_bonus(level) { //starts from 0
        return this.max_level_bonus * (level || this.getDefaultSkillXP().current_level) / this.max_level;
    }
    get_parent_xp_multiplier(skillXP) {
        if(this.parent_skill) {
            if(!skillXP) {
                skillXP = this.getDefaultSkillXP();
            }
            const parent_skill = skills[this.parent_skill];
            const parentSkillXP = character.getSkillXPObject({skill_id: this.parent_skill});
            return (parent_skill.parent_multiplier**Math.max(0,parentSkillXP.current_level-skillXP.current_level));
        } else {
            return 1;
        }
    }
}

/**
 * @param {String} skill_id key from skills object
 * @returns all unlocked leveling rewards, formatted to string
 */
function get_unlocked_skill_rewards(skill_id) {
    const skillXP = character.getSkillXPObject({skill_id});
    let unlocked_rewards = '';
    const skill = skills[skill_id];
    
        const milestones = Object.keys(skill.milestones).filter(level => level <= skillXP.current_level);
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
    const skillXP = character.getSkillXPObject({skill_id});

    return Object.keys(skills[skill_id].milestones).find(
        level => level > skillXP.current_level);
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
                    formatted += `, +${milestone.stats[stat].flat} ${stat_names[stat]}`;
                } else {
                    formatted = `+${milestone.stats[stat].flat} ${stat_names[stat]}`;
                }
            }
            if(milestone.stats[stat].multiplier) {
                if(temp) {
                    temp += `, x${milestone.stats[stat].multiplier} ${stat_names[stat]}`;
                } else {
                    temp = `x${milestone.stats[stat].multiplier} ${stat_names[stat]}`;
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
                name = skills[xp_multipliers[0]].getName();
            }
        } else {
            name = xp_multipliers[0].replace("_"," ");
        }
        if(formatted) {
            formatted += `, x${milestone.xp_multipliers[xp_multipliers[0]]} ${name} xp gain`;
        } else {
            formatted = `x${milestone.xp_multipliers[xp_multipliers[0]]} ${name} xp gain`;
        }
        for(let i = 1; i < xp_multipliers.length; i++) {
            let name;
            if(xp_multipliers[i] !== "all" && xp_multipliers[i] !== "hero" && xp_multipliers[i] !== "all_skill") {
                if(xp_multipliers[i].includes("category_")) {
                    name = xp_multipliers[i].replace("category_", "") + " skills";
                } else {
                    name = skills[xp_multipliers[i]].getName();
                }
            } else {
                name = xp_multipliers[i].replace("_"," ");
            }
            formatted += `, x${milestone.xp_multipliers[xp_multipliers[i]]} ${name} xp gain`;
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

availability_havers.push(Skill);

export { 
    Skill, 
    get_next_skill_milestone, get_unlocked_skill_rewards, format_skill_rewards, 
    which_skills_affect_skill
};