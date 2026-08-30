"use strict";

import InventoryComponent, { inventories } from "../components/inventory_component.js";
import { playable_races, racial_height_modifiers } from "../races.js";
import LevelableComponent from "../components/levelable_component.js";
import BioComponent from "../components/bio_component.js";
import { config } from "../config.js";
import { skill_categories, skills, weapon_type_to_skill } from "../data/skills.js";
import EquipmentComponent, { equipments } from "../components/equipment_component.js";
import { getItemFromKey } from "../items.js";
import { levels, talkables } from "../data/component_references.js";

inventories["person"] = {};
equipments["person"] = {};
levels["person"] = {};
talkables["person"] = {};

const height_values = {
    "very short": 145,
    short: 155,
    average: 170,
    tall: 180,
    "very tall": 190,
};

//for relative heights selected in hero creation
const height_stats = {
    short: {
        strength: {multiplier: 0.9},
        max_health: {multiplier: 0.9},
        agility: {multiplier: 1.1},
        stamina_efficiency: {multiplier: 1.1},
    },
    average: {
        //too average to have anything
    },
    tall: {
        strength: {multiplier: 1.1},
        max_health: {multiplier: 1.1},
        agility: {multiplier: 0.9},
        stamina_efficiency: {multiplier: 0.9},
    }
}

//extended by Hero and by NPC
class Person{

    #inventory;
    #equipment;
    #levelable;
    #bio;

    constructor(data){
        this.id = data.id || data.name;
        this.name = data.name || "";
        this.getName = data.getName || function(){return this.name};
        this.#inventory = new InventoryComponent(data.inventory);
        this.#equipment = new EquipmentComponent(data.equipment);
        this.#levelable = new LevelableComponent(data.levelable || {});
        this.#bio = new BioComponent(data.bio || {});

        this.is_inventory_viewable = false;  //just so code knows whether certain items in inventory need to have their displays updated in certain situations

        this.xp_multiplier = 1;
        this.skill_xp_multiplier = 1;
    }

    getInventoryComponent() {
        return this.#inventory;
    }

    getItems() {
        return this.getInventoryComponent().getItems();
    }

    /**
     * 
     * @param {Array} items 
     * @returns whether anything new was added
     */
    addToInventory(items) {
        return this.getInventoryComponent().addToInventory(items);
    }

    _removeFromInventory(items) {
        this.getInventoryComponent().removeFromInventory(items);
    }

    getBioComponent() {
        return this.#bio;
    }

    getHeight() {
        return this.getBioComponent().height;
    }
    getRace(){
        return this.getBioComponent().race;
    }

    getNumericalHeight() {
        return (height_values[this.getHeight()] || height_values["average"]) + (racial_height_modifiers[this.getRace()] || 0);
    }

    getUniversalHeight()  {
        const height = this.getNumericalHeight();
        if(height >= height_values["very tall"]) {
            return "very tall";
        } else if(height >= height_values["tall"]) {
            return "tall";
        } else if(height >= height_values["average"]) {
            return "average";
        } else if(height >= height_values["short"]) {
            return "short";
        } else {
            return "very short";
        }
    }

    getEquipmentComponent(){
        return this.#equipment;
    }

    getEquipment() {
        return this.getEquipmentComponent().contents;
    }

    getLevelableComponent() {
        return this.#levelable;
    }

    getHealthRegenerationTotal() {
        return this.getLevelableComponent().getHealthRegenerationTotal();
    }
    getHealthLossTotal() {
        return this.getLevelableComponent().getHealthLossTotal();
    }
    getStaminaRegenerationTotal() {
        return this.getLevelableComponent().getStaminaRegenerationTotal();
    }
    getManaRegenerationTotal() {
        return this.getLevelableComponent().getManaRegenerationTotal();
    }

    getAttackSpeed() {
        return this.getLevelableComponent().getAttackSpeed();
    }

    getAttackPower() {
        return this.getLevelableComponent().getAttackPower();
    }

    getTotalXP() {
        return this.getLevelableComponent().getTotalXP();
    }

    getCurrentLvl() {
        return this.getLevelableComponent().getCurrentLvl();
    }

    addXP({xp_to_add, use_bonus = true}) {
        const levelable = this.getLevelableComponent();

        let xp_bonus = (levelable.xp_bonuses.total_multiplier.hero || 1) * (levelable.xp_bonuses.total_multiplier.all || 1) * this.xp_multiplier;

        const gains_message = levelable.addXP({xp_to_add, use_bonus, xp_bonus, name: this.name});

        return gains_message;
    }
    /**
     * @param {*} param0 
     * @returns 
     */
    addXPToSkill({skill, xp_to_add, should_info, use_bonus, add_to_parent, cap_gained_xp, is_from_loading}) {
        const results = this.getLevelableComponent().addXPToSkill({skill, xp_to_add, xp_multiplier: this.xp_multiplier, should_info, use_bonus, add_to_parent, cap_gained_xp, is_from_loading});

        if(results.gains) {
            this.addSkillMilestoneBonus(results.gains);
            if(skill.skill_id === "Unarmed") {
                this.addAllEquipmentBonus();
            }
        }

        return results;
    }

    getSkillXPObject({skill_id}) {
        return this.getLevelableComponent().getSkillXPObject({skill_id});
    }


    /**
     * adds race bonuses to stats
     */
    addRaceBonus() {
        if(!config.use_racial_bonuses) {
            return;
        }
        const {stats, xp_multipliers} = playable_races[this.getRace()];
        const levelable = this.getLevelableComponent();

        Object.keys(stats).forEach(stat => {
            if(stats[stat].flat) {
                levelable.stats.flat.race[stat] = (levelable.stats.flat.race[stat] || 0) + stats[stat].flat;
            }
            if(stats[stat].multiplier) {
                levelable.stats.multiplier.race[stat] = (levelable.stats.multiplier.race[stat] || 1) * stats[stat].multiplier;
            }
        });

        if(xp_multipliers?.hero) {
            levelable.xp_bonuses.multiplier.race.hero = (levelable.xp_bonuses.multiplier.race.hero || 1) * xp_multipliers.hero;
        }
        if(xp_multipliers?.all) {
            levelable.xp_bonuses.multiplier.race.all = (levelable.xp_bonuses.multiplier.race.all || 1) * xp_multipliers.all;
        }
        if(xp_multipliers?.all_skill) {
            levelable.xp_bonuses.multiplier.race.all_skill = (levelable.xp_bonuses.multiplier.race.all_skill || 1) * xp_multipliers.all_skill;
        }

        Object.keys(skills).forEach(skill => {
            if(xp_multipliers[skill]) {
                levelable.xp_bonuses.multiplier.race[skill] = (levelable.xp_bonuses.multiplier.race[skill] || 1) * xp_multipliers[skill];
            }
        });
        Object.keys(skill_categories).forEach(category => {
            const cat = "category_"+category;
            if(xp_multipliers[cat]) {
                levelable.xp_bonuses.multiplier.race[cat] = (levelable.xp_bonuses.multiplier.race[cat] || 1) * xp_multipliers[cat];
            }
        });
    }

    /**
     * adds height bonuses to stats
     */
    addHeightBonus () {
        if(!config.use_height_bonuses) {
            return;
        }

        const levelable = this.getLevelableComponent();

        const stats = height_stats[this.getHeight()] || {};

        Object.keys(stats).forEach(stat => {
            if(stats[stat].flat) {
                levelable.stats.flat.height[stat] = (levelable.stats.flat.height[stat] || 0) + stats[stat].flat;
            }
            if(stats[stat].multiplier) {
                levelable.stats.multiplier.height[stat] = (levelable.stats.multiplier.height[stat] || 1) * stats[stat].multiplier;
            }
        });
    }

    /**
     * add all stat bonuses from equipment, including def/atk
     * called on equipment changes
     */
    addAllEquipmentBonus() {
        const levelable = this.getLevelableComponent();
        const equipment = this.getEquipment();
        //reset as they will be recalculated
        levelable.stats.flat.equipment = {};
        levelable.stats.multiplier.equipment = {};
        levelable.bonus_skill_levels.flat.equipment = {};

        //iterate over slots
        Object.keys(equipment).forEach(slot => {
            if(!equipment[slot]) {
                return;
            }
            
            if(equipment[slot].getDefense) {
                levelable.stats.flat.equipment.defense = (levelable.stats.flat.equipment.defense || 0) + equipment[slot].getDefense();
            }
            const stats = equipment[slot].getStats();
            const bonuses = equipment[slot].getBonusSkillLevels();
            //iterate over stats in slotted item
            Object.keys(stats).forEach(stat => {
                if(stats[stat].flat) {
                    levelable.stats.flat.equipment[stat] = (levelable.stats.flat.equipment[stat] || 0) + stats[stat].flat;
                }

                if(stats[stat].multiplier) {
                    levelable.stats.multiplier.equipment[stat] = (levelable.stats.multiplier.equipment[stat] || 1) * stats[stat].multiplier;
                }
            });

            Object.keys(bonuses).forEach(bonus => {
                if(bonuses[bonus]) {
                    levelable.bonus_skill_levels.flat.equipment[bonus] = (levelable.bonus_skill_levels.flat.equipment[bonus] || 0) + bonuses[bonus];
                }
            });
        });
    }

    addWeaponTypeBonuses() {
        const levelable = this.getLevelableComponent();
        const equipment = this.getEquipment();
        if(equipment.weapon == null) {
            levelable.stats.multiplier.skills.attack_power = this.getTotalSkillCoefficient({skill_id: "Unarmed"});
            levelable.stats.multiplier.skills.attack_speed = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id:"Unarmed"})**0.3333;
            levelable.stats.multiplier.skills.attack_points = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id:"Unarmed"})**0.3333;
            levelable.stats.multiplier.skills.evasion_points = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id:"Unarmed"})**0.3333;
        } else {
            levelable.stats.multiplier.skills.attack_speed = 1;
            levelable.stats.multiplier.skills.attack_power = this.getTotalSkillCoefficient({skill_id: weapon_type_to_skill[equipment.weapon.weapon_type]});
            levelable.stats.multiplier.skills.attack_points = this.getTotalSkillCoefficient({skill_id: weapon_type_to_skill[equipment.weapon.weapon_type]})**0.3333;
            levelable.stats.multiplier.skills.evasion_points = 1;
        }
    }

    addAllStanceBonus() {
        //
    }

    /**
     * add all non-milestone stat bonuses from skills
     * called on stat update
     */
    addAllSkillLevelBonus() {
        const levelable = this.getLevelableComponent();
        levelable.stats.flat.skills.defense = this.getTotalSkillCoefficient({scaling_type: "flat", skill_id: "Iron skin"});

        levelable.stats.multiplier.skills.stamina_efficiency = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Running"});

        levelable.stats.multiplier.skills.strength = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Weightlifting"}) 
                                                        * this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Climbing"})
                                                        * this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Breathing"});

        levelable.stats.multiplier.skills.block_strength = 1 + 5*this.getTotalLevelBonus("Shield blocking");

        levelable.stats.multiplier.skills.agility = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Equilibrium"}) 
                                                        * this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Climbing"})
                                                        * this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Breathing"})
                                                        * this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Swimming"});
        
        levelable.stats.multiplier.skills.dexterity = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Climbing"});                                                

        levelable.stats.multiplier.skills.max_stamina = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Breathing"})
                                                                * this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Swimming"});

        levelable.stats.multiplier.skills.max_health = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Fortitude"});

        levelable.stats.multiplier.skills.intuition = this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Meditation"});

        levelable.stats.flat.skills.unarmed_power = skills["Unarmed"].getCurrentLvl() * 0.1;

        levelable.stats.flat.skills.crit_rate = Math.min(skills["Perception"].max_level, this.getTotalSkillLevel("Perception"))/100;

        this.addWeaponTypeBonuses(); //because it's affected by skill
        levelable.stats.flat.skills.cold_tolerance = 0.5 * this.getTotalSkillLevel("Cold resistance");
    }

    addSkillMilestoneBonus({stats = {}, xp_multipliers = {}}) {
        this.getLevelableComponent().addSkillMilestoneBonus({stats, xp_multipliers});
    }


    getSkillsOveralXPGain() {
        return this.getLevelableComponent().getSkillsOveralXPGain();
    }


    getSkillXPGain(skill_id) {
        return this.getLevelableComponent().getSkillXPGain(skill_id) * this.skill_xp_multiplier;
    }

    getMainXPGain() {
        return this.getLevelableComponent().getMainXPGain() * this.xp_multiplier;
    }

    getTotalXPMultipliers() {
        return this.getLevelableComponent().getTotalXPMultipliers();
    }

    getXPBonuses() {
        return this.getLevelableComponent().getXPBonuses();
    }

    getBonusSkillLevels() {
        return this.getLevelableComponent().getBonusSkillLevels();
    }

    /**
     * @description purely for display, returns all xp multis except things that apply to skill by name and this value is treated as base while skill-specific bonuses get a breakdown
     * @param {String} skill_id 
     * @returns almost-total multiplier to xp gains of provided skill
     */
    getSkillXPGainBonus(skill_id) {
        return this.getLevelableComponent().getSkillXPGainBonus(skill_id);
    }

    getTotalSkillLevel(skill_id) {
        return this.getLevelableComponent().getTotalSkillLevel(skill_id);
    }

    getTotalLevelBonus(skill_id) {
        return this.getLevelableComponent().getTotalLevelBonus(skill_id);
    }

    getTotalSkillCoefficient({scaling_type, skill_id}) {
        return this.getLevelableComponent().getTotalSkillCoefficient({scaling_type, skill_id});
    }

    isWearingArmor() {
        const equipment = this.getEquipment();
        return  (equipment.head && equipment.head.getDefense() !== 0) ||
                (equipment.torso && equipment.torso.getDefense() !== 0) ||
                (equipment.arms && equipment.arms.getDefense() !== 0) ||
                (equipment.legs && equipment.legs.getDefense() !== 0) ||
                (equipment.feet && equipment.feet.getDefense() !== 0) ||
                (equipment.cape && equipment.cape.getDefense() !== 0);
    }

    getStaminaMultiplier() {
        return this.getLevelableComponent().getStaminaMultiplier();
    }

    getColdTolerance(){
        return this.getLevelableComponent().stats.full.cold_tolerance;
    }

    getHeatTolerance(){
        return this.getLevelableComponent().stats.full.heat_tolerance;
    }

    getStats() {
        return this.getLevelableComponent().getStats();
    }

    getBaseStats() {
        return this.getLevelableComponent().getBaseStats();
    }

    getFullStats() {
        return this.getLevelableComponent().getFullStats();
    }

    
    /**
     * 
     * @param {*}
     * @returns [actual damage taken; Boolean if target should faint] 
     */
    takeDamage({damage_values, can_faint = true, give_skill_xp = true, defense_modifier = 0}) {
        /*
        TODO:
                - damage types: "physical", "elemental", "magic"
                - each with it's own defense on equipment (and potentially spells)
                - damage elements (for elemental damage type)
                - resistance skills
        */

        const levelable = this.getLevelableComponent();
        let fainted;
    
        damage_values = damage_values.map(val => {
            if(val < 1) {
                return Math.max(Math.ceil(10*val)/10, 0);
            } else {
                return Math.ceil(10*Math.max(val - (levelable.stats.full.defense + defense_modifier), val*0.05, 1))/10;
            }
        });
        const damage_taken = damage_values.reduce((a,b)=>a+b);
        levelable.stats.full.health -= damage_taken;
    
        if(levelable.stats.full.health <= 0 && can_faint) {
            fainted = true;
            levelable.stats.full.health = 0;
        } else {
            fainted = false;
        }
    
        if(give_skill_xp) {
            //TODO once they are added, give xp to resistance skills when taking damage
        }
    
        return {damage_taken, fainted};
    }

    _equipItem(item) {
        const equipment = this.getEquipment();
        if(!item) {
            this.addAllEquipmentBonus();
            
            this._updateStats();
        } else {
            const prev_item = equipment[item.equip_slot];
            this.unequipItem(item.equip_slot, true);
            equipment[item.equip_slot] = item;
            
            this.addAllEquipmentBonus();
            
            this._updateStats();

            /*
            manage_changed_skill_bonuses(item);
            if(prev_item) {
                manage_changed_skill_bonuses(prev_item);
            }
            */
            return prev_item;
        }
    }

    unequipItem(item_slot, already_calculated=false) {
        const equipment = this.getEquipment();
        if(equipment[item_slot] != null) {
            const item = equipment[item_slot];
            this.addToInventory([{item_key: item.getInventoryKey()}], true);
            equipment[item_slot] = null;
            if(!already_calculated){
                this.addAllEquipmentBonus();
                this.updateStatsAndDisplay();
                this.manageChangedSkillBonuses(item);
            }
        }
    }

    /**
     * Updates display of related skills
     * commented out, to be used if any relavant display is ever added
     * @param {*} item 
     */
    manage_changed_skill_bonuses() {
        /*
        const bonus_skill_levels = Object.keys(item.getBonusSkillLevels());
        if(bonus_skill_levels.length > 0) {
            for(let i = 0; i < bonus_skill_levels.length; i++) {
                if(bonus_skill_levels[i].includes("category_")) {
                    continue;
                }
                this.updateDisplayedSkillLevel(skills[bonus_skill_levels[i]]);
            }
        }*/
    }

    /**
     * full stat recalculation, do not call directly but through the one that has remaining display updates
     * @returns object with skills that need to have their display updated
     */
    _updateStats() {
        const levelable = this.getLevelableComponent();
        const equipment = this.getEquipment();
        const skills_needing_update = {};
        const missing_health = Math.max((levelable.stats.full["max_health"] - levelable.stats.full["health"]), 0) || 0;   
        const missing_stamina = Math.max((levelable.stats.full["max_stamina"] - levelable.stats.full["stamina"]), 0) || 0;   
        const missing_mana = Math.max((levelable.stats.full["max_mana"] - levelable.stats.full["mana"]), 0) || 0;   
        //to avoid fully restoring all whenever this function is called

        Object.keys(levelable.bonus_skill_levels.full).forEach(bonus_target => {
            if(bonus_target.includes("category_")) {
                return;
                //this does not get calculated separately as it will instead be included individually for each skill
            }
            
            const category = "category_"+skills[bonus_target].category;
            levelable.bonus_skill_levels.full[bonus_target] = 
                    (levelable.bonus_skill_levels.flat.equipment[bonus_target] || 0) 
                    + (levelable.bonus_skill_levels.flat.active_effects[bonus_target] || 0) 
                    + (levelable.bonus_skill_levels.flat.skills[bonus_target] || 0)
                    + (levelable.bonus_skill_levels.flat.equipment[category] || 0) 
                    + (levelable.bonus_skill_levels.flat.active_effects[category] || 0) 
                    + (levelable.bonus_skill_levels.flat.skills[category] || 0);
            
            const bonus = levelable.bonus_skill_levels.full[bonus_target];

            if(bonus != 0){
                this.updateDisplayedSkillLevel(skills[bonus_target]);
            }        
        });

        this.addAllSkillLevelBonus();
        this.addAllStanceBonus();

        Object.keys(levelable.stats.full).forEach(stat => {
            let stat_sum = 0;
            let stat_mult = 1;

            if(stat === "block_chance") {
                stat_sum = config.base_block_chance + Math.round(this.getTotalLevelBonus("Shield blocking") * 10000)/10000;
            } else if(stat === "attack_points") {
                stat_sum = Math.sqrt(levelable.stats.full.intuition) * levelable.stats.full.dexterity * this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id:"Combat"});
            } else if(stat === "evasion_points") {
                stat_sum = levelable.stats.full.agility * Math.sqrt(levelable.stats.full.intuition) * this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id:"Evasion"});
            } else {
                //just sum all flats
                Object.values(levelable.stats.flat).forEach(piece => {
                    stat_sum += (piece[stat] || 0);
                });
            }

            Object.values(levelable.stats.multiplier).forEach(piece => {
                stat_mult *= (piece[stat] || 1);
            });

            levelable.stats.full[stat] = (levelable.base_stats[stat] + stat_sum) * stat_mult;

            levelable.stats.total_flat[stat] =  levelable.base_stats[stat] + stat_sum;
            levelable.stats.total_multiplier[stat] = stat_mult || 1;

            if(stat === "health") {
                levelable.stats.full.health = Math.max(0, levelable.stats.full["max_health"] - missing_health);
            } else if(stat === "stamina") {
                levelable.stats.full.stamina = Math.max(0, levelable.stats.full["max_stamina"] - missing_stamina);
            } else if(stat === "mana") {
                levelable.stats.full.mana = Math.max(0, levelable.stats.full["max_mana"] - missing_mana);
            }
        });

        
        if(equipment.weapon != null) { 
            //has weapon
            levelable.stats.full.attack_power = (levelable.stats.full.strength/10) * equipment.weapon.getAttack() * levelable.stats.total_multiplier.attack_power;
        } else {
            //has no weapon
            //levelable.stats.full.attack_power = (levelable.stats.full.strength/10) * (1+skills["Unarmed"].getCurrentLvl()*0.1) * levelable.stats.total_multiplier.attack_power;
            levelable.stats.full.attack_power = (levelable.stats.full.strength/10) * levelable.stats.total_multiplier.attack_power * levelable.stats.full.unarmed_power;
        }
        
        levelable.stats.total_flat.attack_power = levelable.stats.full.attack_power/levelable.stats.total_multiplier.attack_power;
        Object.keys(levelable.xp_bonuses.total_multiplier).forEach(bonus_target => {
            levelable.xp_bonuses.total_multiplier[bonus_target] = 
                    (levelable.xp_bonuses.multiplier.race[bonus_target] || 1)
                    * (levelable.xp_bonuses.multiplier.levels[bonus_target] || 1)
                    * (levelable.xp_bonuses.multiplier.skills[bonus_target] || 1)
                    * (levelable.xp_bonuses.multiplier.books[bonus_target] || 1)
                    * (levelable.xp_bonuses.multiplier.active_effects[bonus_target] || 1);
        });

        return skills_needing_update;
    }

    /**
     * updates character stats + their display 
     */
    updateStatsAndDisplay() {
        const levelable = this.getLevelableComponent();
        const equipment = this.getEquipment();
        const inventory = this.getItems();
        const initial_block_strength = levelable.stats.full.block_strength;

        this.addLocationPenalties();
        const skills_needing_display_update = this._updateStats();

        if(skills_needing_display_update["hero"] || skills_needing_display_update["all"]) {
            this.updateDisplayedXPBonuses();
        }

        if(skills_needing_display_update["all"] || skills_needing_display_update["all_skill"]) {
            this.updateAllDisplayedSkillXPGains();
        } else {
            Object.keys(skills_needing_display_update).forEach(key => {
                this.updateDisplayedSkillXPGains(skills[key]);
            });
        }

        this.updateDisplayedStats();
        this.updateDisplayedHealth();
        this.updateDisplayedStamina();
        this.updateDisplayedStaminaEfficiency();
        
        
        //update_displayed_mana();

        //update display of shields if the changes affected block strength
        if(this.is_inventory_viewable) {
            if(initial_block_strength !== levelable.stats.full.block_strength) {
                Object.keys(inventory).forEach(inv_key => {
                    const item = getItemFromKey(inv_key);
                    if(item.tags.shield) {
                        this.updateDisplayedInventory({item_key: inv_key});
                    }
                });

                if(equipment["off-hand"]) {
                    this.updateDisplayedEquipment();
                    this.updateDisplayedInventory({equip_slot: "off-hand"});
                }
            }
        }
    }

    addLocationPenalties() {
        //
    }

    updateDisplayedInventory() {

    }

    updateDisplayedEquipment() {
        //
    }

    updateDisplayedStats() {
        //
    }

    updateDisplayedHealth() {
        //
    }

    updateDisplayedStamina() {
        //(
    }

    updateDisplayedStaminaEfficiency() {
        //
    }

    updateDisplayedSkillLevel() {
        //skill levels, needed for all if inspecting is added
    }

    updateAllDisplayedSkillXPGains(){
         //all skill xp gains, only needed for hero
    }

    updateDisplayedSkillXPGains() {
        //specific skill xp gains, only needed for hero
    }

    updateDisplayedXPBonuses() {
        //xp bar, only needed for hero
    }
}

export {
    Person,
    height_stats, height_values,
}