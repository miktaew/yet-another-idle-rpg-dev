"use strict";

import { config } from "../config.js";
import StatHaver from "../models/stat_haver.js";
import { bonus_levels, skill_categories, skills, xp_multipliers } from "../data/skills.js";

class SkillXP {
    constructor(skill_id) {
        this.current_level = 0;
        this.total_xp = 0; // total collected xp, on loading lvl is calculated based on this (so to not break skills if scaling ever changes)
        this.current_xp = 0; // how much of xp_to_next_lvl there is currently
        this.total_xp_to_next_lvl = skills[skill_id].base_xp_cost;
        this.xp_to_next_lvl = skills[skill_id].base_xp_cost;
    }
}

class LevelableComponent extends StatHaver {
    constructor(data) {
        super(data);

        this.current_level = 0;
        this.total_xp = 0;
        this.current_xp = 0;
        this.base_xp_cost = data.base_xp_cost || config.base_xp_cost;
        this.xp_to_next_lvl = this.base_xp_cost;
        this.total_xp_to_next_lvl = this.base_xp_cost;
        this.xp_scaling = data.xp_scaling || 1.6;

        this.skill_progress = {}; //skill_id : new SkillXP()

        this.bonus_skill_levels = {
            full: {
                ...bonus_levels
            },
            flat: {
                equipment: {},
                active_effects: {},
                skills: {}, //for some rare cases, generally bonuses should be limited to "temporary" sources
            }
        };
        this.xp_bonuses = {
            total_multiplier: {
                hero: 1,
                all: 1,
                all_skill: 1,
                ...xp_multipliers
            },
            multiplier: {
                race: {},
                levels: {},
                skills: {},
                //equipment: {},
                books: {},
                active_effects: {},
            }
        };
    }

    getTotalXP() {
        return this.total_xp;
    }

    addXP({xp_to_add, use_bonus = true, xp_bonus = 1, name=""}) {

        if(use_bonus) {
            xp_to_add *= xp_bonus;
        }

        this.total_xp += xp_to_add;

        if(xp_to_add + this.current_xp < this.xp_to_next_lvl) { // no levelup
            this.current_xp += xp_to_add;
        } else { //levelup
            let level_after_xp = 0;
            
            while(this.total_xp >= this.total_xp_to_next_lvl) {
                level_after_xp += 1;
                
                this.total_xp_to_next_lvl = Math.round(this.base_xp_cost * (1 - this.xp_scaling ** (level_after_xp + 1))/(1 - this.xp_scaling));
            } //calculates lvl reached after adding xp

            let total_xp_to_previous_lvl = Math.round(this.base_xp_cost * (1 - this.xp_scaling ** level_after_xp)/(1 - this.xp_scaling));
            //xp needed for current lvl, same formula but for n-1

            const gains = this.getLevelBonus(level_after_xp);

            this.xp_to_next_lvl = this.total_xp_to_next_lvl - total_xp_to_previous_lvl;
            this.current_level = level_after_xp;
            this.current_xp = this.total_xp - total_xp_to_previous_lvl;		
            return `${name} is getting stronger. Reached level ${this.current_level} ${gains}`;
        }
    }

    getCurrentLvl() {
        return this.current_level;
    }

    fillSkillXPObject({skill_id}) {
        if(!this.skill_progress[skill_id]) {
            this.skill_progress[skill_id] = new SkillXP(skill_id);
        }
    }

    getSkillXPObject({skill_id}) {
        this.fillSkillXPObject({skill_id});
        return this.skill_progress[skill_id];
    }

    addXPToSkill({skill, xp_to_add, xp_multiplier, should_info, use_bonus, add_to_parent, cap_gained_xp}) {
        this.fillSkillXPObject({skill_id: skill.skill_id})
        
        let leveled = false;
        const skillXP = this.getSkillXPObject({skill_id: skill.skill_id});
        if(xp_to_add == 0) {
            return leveled;
        } else if(xp_to_add < 0) {
            console.error(`Tried to add negative xp to skill ${skill.skill_id}, for ${this.name}`);
            return leveled;
        } else if(isNaN(xp_to_add)) {
            console.error(`Tried to add NaN xp to skill ${skill.skill_id}, for ${this.name}`);
            return leveled;
        }


        if(use_bonus) {
            xp_to_add = xp_to_add * config.global_xp_multiplier * this.getSkillXPGain(skill.skill_id) * (xp_multiplier ?? 1);

            if(skill.parent_skill) {
                xp_to_add *= skill.get_parent_xp_multiplier();
            }
        }

        if(cap_gained_xp && typeof skillXP.xp_to_next_lvl === Number) {
            //cap on singular gains for non-crafting skills; cap for crafting skills handled in crafting code as it's dependent on how many items are made at once
            xp_to_add = Math.min(xp_to_add, skillXP.xp_to_next_lvl*config.skill_xp_gains_cap);
        }
        
        const prev_name = skill.getName();
        const was_hidden = skill.visibility_treshold > skillXP.total_xp;
        
        let {message, gains, unlocks} = skill.add_xp({skillXP, xp_to_add: xp_to_add});
        
        
        const new_name = skill.getName();
        if(skill.parent_skill && add_to_parent) {
            if(skillXP.total_xp > skills[skill.parent_skill].total_xp) {
                /*
                    add xp to parent if skill would now have more than the parent
                    calc xp ammount so that it's no more than the difference between child and parent
                */
                let xp_for_parent = Math.min(skillXP.total_xp - skills[skill.parent_skill].total_xp, xp_to_add);
                this.addXPToSkill({skill: skills[skill.parent_skill], xp_to_add: xp_for_parent, should_info, use_bonus: false, add_to_parent, cap_gained_xp: false});
            }
        }

        return {leveled, prev_name, new_name, was_hidden, message, unlocks, gains};
    }

    getLevelBonus(level) {
        let gained_hp = 0;
        let gained_stamina = 0;
        let gained_str = 0;
        let gained_agi = 0;
        let gained_dex = 0;
        let gained_int = 0;

        const gained_skill_xp_multiplier = 1.03;
        let total_skill_xp_multiplier = 1;

        for(let i = this.current_level + 1; i <= level; i++) {
            if(i % 2 == 1) {
                gained_str += Math.ceil(i/10);
                gained_int += Math.ceil(i/10);
            } else {
                gained_agi += Math.ceil(i/10);
                gained_dex += Math.ceil(i/10);
            }

            gained_hp += 10 * Math.ceil(i/10);
            gained_stamina += 5; //5 * Math.ceil(i/10) ?;
            total_skill_xp_multiplier = total_skill_xp_multiplier * gained_skill_xp_multiplier;
        }

        this.stats.flat.level.max_health = (this.stats.flat.level.max_health || 0) + gained_hp;
        this.stats.flat.level.health = this.stats.flat.level.max_health;
        this.stats.flat.level.max_stamina = (this.stats.flat.level.max_stamina || 0) + gained_stamina;
        this.stats.flat.level.stamina = this.stats.flat.level.max_stamina;
        this.stats.flat.level.strength = (this.stats.flat.level.strength || 0) + gained_str;
        this.stats.flat.level.intuition = (this.stats.flat.level.intuition || 0) + gained_int;
        this.stats.flat.level.agility = (this.stats.flat.level.agility || 0) + gained_agi;
        this.stats.flat.level.dexterity = (this.stats.flat.level.dexterity || 0) + gained_dex;

        this.xp_bonuses.multiplier.levels.all_skill = (this.xp_bonuses.multiplier.levels.all_skill || 1) * total_skill_xp_multiplier;

        let gains = `\nHP increased by ${gained_hp}\nStamina increased by ${gained_stamina}`;
        if(gained_str > 0) {
            gains += `\nStrength increased by ${gained_str}`;
        }
        if(gained_agi > 0) {
            gains += `\nAgility increased by ${gained_agi}`;
        }
        if(gained_dex > 0) {
            gains += `\nDexterity increased by ${gained_dex}`;
        }
        if(gained_int > 0) {
            gains += `\nIntuition increased by ${gained_int}`;
        }

        gains += `\nSkill xp gains increased by ${Math.round((gained_skill_xp_multiplier-1)*100)}%`;
        
        return gains;
    }

    /**
     * adds skill milestone bonuses to stats
     * called when a new milestone is reached
     * @param {{flats, multipliers}} bonuses
     */
    addSkillMilestoneBonus = function ({stats = {}, xp_multipliers = {}}) {
        Object.keys(stats).forEach(stat => {
            if(stats[stat].flat) {
                this.stats.flat.skill_milestones[stat] = (this.stats.flat.skill_milestones[stat] || 0) + stats[stat].flat;
            }
            if(stats[stat].multiplier) {
                this.stats.multiplier.skill_milestones[stat] = (this.stats.multiplier.skill_milestones[stat] || 1) * stats[stat].multiplier;
            }
        });

        if(xp_multipliers?.hero) {
            this.xp_bonuses.multiplier.skills.hero = (this.xp_bonuses.multiplier.skills.hero || 1) * xp_multipliers.hero;
        }
        if(xp_multipliers?.all) {
            this.xp_bonuses.multiplier.skills.all = (this.xp_bonuses.multiplier.skills.all || 1) * xp_multipliers.all;
        }
        if(xp_multipliers?.all_skill) {
            this.xp_bonuses.multiplier.skills.all_skill = (this.xp_bonuses.multiplier.skills.all_skill || 1) * xp_multipliers.all_skill;
        }

        Object.keys(skills).forEach(skill => {
            if(xp_multipliers[skill]) {
                this.xp_bonuses.multiplier.skills[skill] = (this.xp_bonuses.multiplier.skills[skill] || 1) * xp_multipliers[skill];
            }
        });
        Object.keys(skill_categories).forEach(category => {
            const cat = "category_"+category; //meow
            if(xp_multipliers[cat]) {
                this.xp_bonuses.multiplier.skills[cat] = (this.xp_bonuses.multiplier.skills[cat] || 1) * xp_multipliers[cat];
            }
        });
    }

    getBonusSkillLevels() {
        return this.bonus_skill_levels.full;
    }

    getTotalSkillLevel(skill_id) {
        return this.getSkillXPObject({skill_id}).current_level + (this.bonus_skill_levels.full[skill_id] || 0);
    }

    getTotalLevelBonus(skill_id) {
        return skills[skill_id].get_level_bonus(this.getTotalSkillLevel(skill_id));
    }

    getTotalSkillCoefficient({scaling_type, skill_id}) {
        return skills[skill_id].get_coefficient({scaling_type, skill_level: this.getTotalSkillLevel(skill_id)});
    }

    /**
     * 
     * @param {*} skill_name 
     * @returns total xp gains for provided skill 
     */
    getSkillXPGain(skill_name) {
        return (this.xp_bonuses.total_multiplier[skill_name] || 1) * this.getSkillXPGainBonus(skill_name);
    }

    /**
     * @description purely for display, returns all xp multis except things that apply to skill by name and this value is treated as base while skill-specific bonuses get a breakdown
     * @param {String} skill_id 
     * @returns almost-total multiplier to xp gains of provided skill
     */
    getSkillXPGainBonus(skill_id) {
        const category = "category_"+skills[skill_id].category;
        return (this.xp_bonuses.total_multiplier.all_skill || 1) 
            * (this.xp_bonuses.total_multiplier.all || 1) 
            * (this.xp_bonuses.total_multiplier[category] || 1);
    }

    getTotalXPMultipliers() {
        return this.xp_bonuses.total_multiplier;
    }

    getXPBonuses() {
        return this.xp_bonuses;
    }

    getSkillsOveralXPGain() {
        return (this.xp_bonuses.total_multiplier.all_skill || 1) * (this.xp_bonuses.total_multiplier.all || 1);
    }

    getMainXPGain() {
        return (this.xp_bonuses.total_multiplier.hero || 1) * (this.xp_bonuses.total_multiplier.all || 1);
    }

    getHealthRegenerationTotal() {
        return this.stats.full.health_regeneration_flat + (this.stats.full.max_health * this.stats.full.health_regeneration_percent / 100);
    }

    getHealthLossTotal() {
        return this.stats.full.health_loss_flat + (this.stats.full.max_health * this.stats.full.health_loss_percent / 100);
    }

    getStaminaRegenerationTotal() {
        return this.stats.full.stamina_regeneration_flat + (this.stats.full.max_stamina * this.stats.full.stamina_regeneration_percent / 100);
    }

    getManaRegenerationTotal() {
        return this.stats.full.mana_regeneration_flat + (this.stats.full.max_mana * this.stats.full.mana_regeneration_percent / 100);
    }

    getAttackSpeed = function () {
        return this.stats.full.attack_speed * this.getStaminaMultiplier();
    }

    getAttackPower = function () {
        return this.stats.full.attack_power * this.getStaminaMultiplier();
    }

    getStaminaMultiplier() {
        return this.stats.full.stamina == 0 ? 0.5 + this.getTotalLevelBonus("Persistence") : 1;
    }

    getFullStats() {
        return this.stats.full;
    }

    getStats() {
        return this.stats;
    }

    getBaseStats() {
        return this.base_stats;
    }
}


export default LevelableComponent;
