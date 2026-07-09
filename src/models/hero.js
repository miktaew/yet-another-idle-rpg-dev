"use strict";

import { equipments } from "../components/equipment_component.js";
import { inventories } from "../components/inventory_component.js";
import { update_displayed_character_inventory, update_displayed_equipment, update_displayed_health, update_displayed_item_log, update_displayed_location_types, update_displayed_skill_level, update_displayed_stamina, update_displayed_stamina_efficiency, update_displayed_stats } from "../display.js";
import { is_night } from "../game_time.js";
import { getItemFromKey, item_log, item_templates } from "../items.js";
import { current_location, current_stance, favourite_consumables, favourite_items, remove_consumable_from_favourites, remove_item_from_favourites } from "../main.js";
import { skill_consumable_tags } from "../misc.js";
import { skills } from "../data/skills.js";
import { levels, bios } from "../data/component_references.js";
import { Person } from "./person.js";

class Hero extends Person {
    constructor(data) {
        super(data);
        this.titles = {};
        this.reputation = { //effects would go up to 1000?
                Village: 0,
                Slums: 0,
                Town: 0,
        };
        this.money = 0;

        this.id = data.id;

        //assign them directly, as hero is not placed in NPCRegistry (obviously) so it can't be handled by it
        inventories["person"][this.id] = this.getInventoryComponent();
        equipments["person"][this.id] = this.getEquipmentComponent();
        levels["person"][this.id] = this.getLevelableComponent();
        bios[this.id] = this.getBioComponent();

        this.is_inventory_viewable = true; //just so code knows whether certain items in inventory need to have their displays updated in certain situations
    }

    getBio() {
        return this.getBioComponent().getBio();
    }

    //stupid little thing for a stupid easter egg
    isRat() {
        return this.name.match(/\b(?<![\w])rat\b/i);
    }

    getOwnedMoney() {
        return this.money;
    }

    /**
     * adds skill milestone bonuses to hero stats
     * called when a new milestone is reached
     * @param {{flats, multipliers}} bonuses 
     */
    addBookBonus({multipliers = {}, xp_multipliers = {}}) {
        const levelable = this.getLevelableComponent();
        Object.keys(levelable.base_stats).forEach(stat => {
            if(multipliers[stat]) {
                levelable.stats.multiplier.books[stat] = (levelable.stats.multiplier.books[stat] || 1) * multipliers[stat];
            }
        });
       
        if(xp_multipliers?.hero) {
            levelable.xp_bonuses.multiplier.books.hero = (levelable.xp_bonuses.multiplier.books.hero || 1) * xp_multipliers.hero;
        }
        if(xp_multipliers?.all) {
            levelable.xp_bonuses.multiplier.books.all = (levelable.xp_bonuses.multiplier.books.all || 1) * xp_multipliers.all;
        }
        if(xp_multipliers?.all_skill) {
            levelable.xp_bonuses.multiplier.books.all_skill = (levelable.xp_bonuses.multiplier.books.all_skill || 1) * xp_multipliers.all_skill;
        }

        Object.keys(skills).forEach(skill => {
            if(xp_multipliers[skill]) {
                levelable.xp_bonuses.multiplier.books[skill] = (levelable.xp_bonuses.multiplier.books[skill] || 1) * xp_multipliers[skill];
            }
        });
    }

    addActiveEffectBonus(active_effects) {
        const levelable = this.getLevelableComponent();

        levelable.stats.flat.active_effects = {};
        levelable.stats.multiplier.active_effects = {};
        levelable.bonus_skill_levels.flat.active_effects = {};
        levelable.xp_bonuses.multiplier.active_effects = {};

        Object.keys(active_effects).forEach(effect_key => {
            let multiplier = 1;

            let effects = this.getEffectWithBonuses(active_effects[effect_key]);
            for(const [key, value] of Object.entries(effects.stats)) {
                if(value.flat) {
                    levelable.stats.flat.active_effects[key] = (levelable.stats.flat.active_effects[key] || 0) + value.flat*multiplier;
                }

                if(value.multiplier) {
                    levelable.stats.multiplier.active_effects[key] = (levelable.stats.multiplier.active_effects[key] || 1) * value.multiplier*multiplier;
                }
            }
            for(const [key, value] of Object.entries(effects.bonus_skill_levels)) {
                levelable.bonus_skill_levels.flat.active_effects[key] = (levelable.bonus_skill_levels.flat.active_effects[key] || 0) + value;
            }
            for(const [key, value] of Object.entries(effects.xp_multipliers)) {
                levelable.xp_bonuses.multiplier.active_effects[key] = (levelable.xp_bonuses.multiplier.active_effects[key] || 1) * value;
            }
        });
    }

    /**
     * add all stat bonuses/penalties from stances
     * called in stat updates
     * multipliers only 
     */
    addAllStanceBonus() {
        const levelable = this.getLevelableComponent();

        const multipliers = current_stance.getStats();
        Object.keys(levelable.base_stats).forEach(stat => {
            if(multipliers[stat]) {
                levelable.stats.multiplier.stance[stat] = multipliers[stat] || 1;
                //replacing instead of multiplying, since these come from singular source
            } else {
                levelable.stats.multiplier.stance[stat] = 1;
            }
        });
}

    /**
     * only supports multiplicative penalties for now
     */
    addLocationPenalties(location) {
        const levelable = this.getLevelableComponent();

        let effects = {};
        let light_modifier = 1;
        
        if(location) {
            if(!location.tags.safe_zone) {
                effects = location.get_total_effect().hero_penalty;
            }

            if(location.light_level === "dark" || location.light_level === "normal" && is_night()) {
                light_modifier = 0.5 + 0.5 * this.getTotalSkillLevel("Night vision")/skills["Night vision"].max_level;
                levelable.stats.multiplier.light_level.evasion_points = light_modifier;
                levelable.stats.multiplier.light_level.attack_points = light_modifier;
            } else {
                levelable.stats.multiplier.light_level.evasion_points = 1;
                levelable.stats.multiplier.light_level.attack_points = 1;
            }
        }

        levelable.stats.multiplier.environment = {};
        levelable.stats.flat.environment = {};
        Object.keys(effects.multipliers || {}).forEach(effect => {
            levelable.stats.multiplier.environment[effect] = effects.multipliers[effect];
        });
        Object.keys(effects.flats || {}).forEach(effect => {
            levelable.stats.flat.environment[effect] = effects.flats[effect];
        });
    }

    /**
     * @param {*} active_effect 
     * @returns effects modified by relevant skill bonuses 
     */
    getEffectWithBonuses(active_effect) {
        let multiplier = 1;
        Object.keys(skill_consumable_tags).forEach(skill_id => {
                if(active_effect.tags[skill_consumable_tags[skill_id]]) {
                    multiplier *= this.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: skill_id});
                }
        });
        let boosted = {stats: {}, bonus_skill_levels: {...active_effect.effects.bonus_skill_levels}, xp_multipliers: {...active_effect.effects.xp_multipliers}};
        for(const [key, value] of Object.entries(active_effect.effects.stats)) {
            boosted.stats[key] = {};
            if(value.flat) {
                if(key.includes("_percent")) {
                    //this exclusively means percent based regeneration and is therefore treated as multiplicative effect
                    if(value.flat > 0) {
                        boosted.stats[key].flat = value.flat*(multiplier>1?multiplier:1);
                    } else {
                        boosted.stats[key].flat = value.flat/(multiplier>1?multiplier:1);
                    }
                } else {
                    if(value.flat > 0) {
                        boosted.stats[key].flat = value.flat*(multiplier>1?multiplier:1)**2;
                    } else {
                        boosted.stats[key].flat = value.flat/(multiplier>1?multiplier:1);
                    }
                }
            } else if(value.multiplier) {
                if(value.multiplier > 1) {
                    boosted.stats[key].multiplier = value.multiplier*(multiplier>1?multiplier:1);
                } else {
                    boosted.stats[key].multiplier = 1 + (value.multiplier-1)/(multiplier>1?multiplier:1);
                }
            }
        }
        return boosted;
    }

    /**
     * @param {String} skill_id 
     * @param {Array<Number>} level_range 
     * @returns basically level / level_required, but scaled from minimum level instead of from 0
     */
    getSkillModifier(skill_id, level_range) {
        return Math.min(1, Math.max(0, (this.getTotalSkillLevel(skill_id) - level_range[0] + 1) / (level_range[1] - level_range[0] + 1)));
    }

    /**
     * @param {Array} items [{item_key or item_id, count},...] 
     */
    addToInventory(items, skip_item_log) {
        const was_anything_new_added = this.getInventoryComponent().addToInventory(items);

        if(!skip_item_log) {
            item_log.log_items(items);
        }
        
        update_displayed_character_inventory({ was_anything_new_added });
        update_displayed_item_log();
    }

    /**
     * @param {Array} items [{item_key, item_count}]
     */
    removeFromInventory(items) {
        const equipment = this.getEquipment();
        this._removeFromInventory(items);
        update_displayed_character_inventory();

        for(let i = 0; i < items.length; i++) {
            if(this.getItems()[items[i].item_key]) {
                continue;
            }

            const {id} = JSON.parse(items[i].item_key);
            if(id && item_templates[id].tags.usable && favourite_consumables[id]) {
                remove_consumable_from_favourites(id);
            } else if(favourite_items[items[i].item_key]) {
                const item = getItemFromKey(items[i].item_key);
                if(item.tags.component || item.tags.equippable) {
                    //check if item might be possibly equipped, if not then remove from favs
                    if(!(equipment[item.equip_slot]?.getInventoryKey() === item.getInventoryKey())) {
                        remove_item_from_favourites(items[i].item_key);
                    }
                }
            }
        }
    }

    /**
     * @description equips passed item, doesn't do anything more with it; updates inventory display and equipment display
     * don't call this one directly (except for when loading save data), but via equip_item_from_inventory()
     * @param: game item object
     */
    equipItem(item, skip_sorting) {
        const prev_item = this._equipItem(item);
        update_displayed_equipment();
        update_displayed_character_inventory({skip_sorting});
    
        if(item) {
            this.manageChangedSkillBonuses(item);
            if(prev_item) {
                this.manageChangedSkillBonuses(prev_item);
            }
        }
    }

    /**
     * equips item and removes it from inventory
     * @param item_key
     **/
    equipItemFromInventory(item_key) {
        const items = this.getItems();
        if(item_key in items) { //check if its in inventory, just in case
            //add specific item to equipment slot
            // -> id and name tell which exactly item it is, then also check slot in item object and thats all whats needed
            this.equipItem(items[item_key].item);
            this.removeFromInventory([{item_key}]);
            
            //update_character_stats(); //called in equip_item()
        }
    }
        
    unequipItem(item_slot, already_calculated=false) {
        const equipment = this.getEquipment();
        if(equipment[item_slot] != null) {
            const item = equipment[item_slot];
            this.addToInventory([{item_key: item.getInventoryKey()}], true);
            equipment[item_slot] = null;
            update_displayed_equipment();
            update_displayed_character_inventory();
            if(!already_calculated){
                this.addAllEquipmentBonus();
                this.updateStatsAndDisplay();
                this.manageChangedSkillBonuses(item);
            }
        }
    }

    
    /**
     * Updates display of related skills
     * @param {*} item 
     */
    manageChangedSkillBonuses(item) {
        const bonus_skill_levels = Object.keys(item.getBonusSkillLevels());
        if(bonus_skill_levels.length > 0) {
            for(let i = 0; i < bonus_skill_levels.length; i++) {
                if(bonus_skill_levels[i].includes("category_")) {
                    continue;
                }
                update_displayed_skill_level(skills[bonus_skill_levels[i]]);
            }

            if(current_location?.tags["combat_zone"]) {
                update_displayed_location_types(current_location);
            }
        }
    }

    updateDisplayedInventory(data) {
        update_displayed_character_inventory(data);
    }

    updateDisplayedEquipment() {
        update_displayed_equipment();
    }

    updateDisplayedStats() {
        update_displayed_stats();
    }

    updateDisplayedHealth() {
        update_displayed_health();
    }

    updateDisplayedStamina() {
        update_displayed_stamina();
    }

    updateDisplayedStaminaEfficiency() {
        update_displayed_stamina_efficiency();
    }
}


export default Hero;