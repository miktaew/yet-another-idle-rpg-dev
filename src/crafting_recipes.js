"use strict";

import { character } from "./character.js";
import { Armor, ArmorComponent, Shield, ShieldComponent, Weapon, WeaponComponent, item_templates } from "./items.js";
import { skills } from "./skills.js";

const crafting_recipes = {items: {}, components: {}, equipment: {}};
const cooking_recipes = {items: {}};
const smelting_recipes = {items: {}};
const forging_recipes = {items: {}, components: {}};
const alchemy_recipes = {items: {}};

/*
    recipes can be treated differently for display based on if they are in items/components/equipment category

    non-equipment recipes have a success rate (presented with min-max value, where max should be 1) that shall scale with skill level and with crafting station level
    for equipment recipes, there is no success rate in favor of equipment's "quality" property

    resulting quality of equipment is based on component quality; 100% (with slight variation) with 100% components and required skill, more at higher levels
    
    overal max quality achievable scales with related skills
*/

class Recipe {
    constructor({
        name,
        id,
        is_unlocked = true, //TODO: change to false when unlocking is implemented!
        recipe_type,
        result, //{name, count}
        getResult,
        recipe_level = [1,1],
        recipe_skill,
    }) {
        this.name = name;
        this.id = id || name;
        this.is_unlocked = is_unlocked;
        this.recipe_type = recipe_type;
        this.result = result;
        this.getResult = getResult || function(){return this.result};
        this.recipe_level = recipe_level;
        this.recipe_skill = recipe_skill;
    }
}

class ItemRecipe extends Recipe {
    constructor({
        name,
        id,
        materials = [], //{name, count}
        is_unlocked = true, //TODO: change to false when unlocking is implemented!
        recipe_type,
        result, //{name, count}
        getResult,
        recipe_level,
        recipe_skill,
        success_chance = [1,1],
    }) {
        super({name, id, is_unlocked, recipe_type, result, getResult, recipe_level, recipe_skill});
        this.materials = materials;
        this.success_chance = success_chance;
        if(this.success_chance[0]==0){
            this.success_chance[0] = 0.1;
        }
    }

    get_success_chance(station_tier=1) {
        const level = Math.min(this.recipe_level[1]-this.recipe_level[0]+1, Math.max(0,skills[this.recipe_skill].current_level-this.recipe_level[0]+1));
        const skill_modifier = Math.min(1,(0||(level+(station_tier-1))/(this.recipe_level[1]-this.recipe_level[0]+1)));
        return this.success_chance[0]*(this.success_chance[1]/this.success_chance[0])**skill_modifier;
    }

    get_availability() {
        for(let i = 0; i < this.materials.length; i++) {
            const key = item_templates[this.materials[i].material_id].getInventoryKey();
            if(!character.inventory[key] || character.inventory[key].count < this.materials[i].count) {
                return false;
            }
        }
        return true;
    }

    get_is_any_material_present() {
        for(let i = 0; i < this.materials.length; i++) {
            
            if(character.inventory[this.materials[i].material_id]) {
                return true;
            }
        }
        return false;
    }
}

class ComponentRecipe extends ItemRecipe{
    constructor({
        name,
        id,
        materials = [], 
        is_unlocked = true, //TODO: change to false when unlocking is implemented!
        result, //{item, count, result_name} where result_name is an item_templates key
        component_type,
        recipe_skill,
        item_type,
    }) {
        super({name, id, materials, is_unlocked, recipe_type: "component", result, recipe_level: [1,1], recipe_skill, getResult: null, success_rate: [1,1]})
        this.component_type = component_type;
        this.item_type = item_type;
        this.getResult = function(material, station_tier = 1){
            const result = item_templates[this.materials.filter(x => x.material_id===material.id)[0].result_id];
            //return based on material used
            let quality = this.get_quality((station_tier-result.component_tier) || 0);
            if(result.tags["clothing"]) {
                //means its a clothing (wearable internal part of armor)
                return new Armor({...item_templates[result.id], quality: quality});
            } else if(result.tags["armor component"]) {

                return new ArmorComponent({...item_templates[result.id], quality: quality});
            } else if(result.tags["weapon component"]) {

                return new WeaponComponent({...item_templates[result.id], quality: quality});
            } else if(result.tags["shield component"]) {

                return new ShieldComponent({...item_templates[result.id], quality: quality});
            } else {
                throw new Error(`Component recipe ${this.name} does not produce a valid result!`);
            }
        }
    }

    get_quality_range(tier = 0) {
        const skill = skills[this.recipe_skill];
        const quality = (140+(3*skill.current_level-skill.max_level)+(20*tier))/100;
        return [Math.max(10,Math.round(25*(quality-0.15))*4), Math.max(10,Math.round(25*(quality+0.1))*4)];
    }

    get_quality_cap() {
        const skill = skills[this.recipe_skill];
        return Math.min(Math.round(100*(1+2*skill.current_level/skill.max_level)),200);
    }

    get_quality(tier = 0) {
        const quality_range = this.get_quality_range(tier);
        return Math.min(Math.round(((quality_range[1]-quality_range[0])*Math.random()+quality_range[0])/4)*4, this.get_quality_cap());
    }
}

class EquipmentRecipe extends Recipe {
    constructor({
        name,
        id,
        components = [], //pair of component types; first letter not capitalized; blade-handle or internal-external
        is_unlocked = true, //TODO: change to false when unlocking is implemented
        result = null,
        recipe_skill = "Crafting",
        item_type, //Weapon/Armor/Shield
        //no recipe level, difficulty based on selected components
    }) {
        super({name, id, is_unlocked, recipe_type: "equipment", result, getResult: null, recipe_level: [1,1], recipe_skill, success_rate: [1,1]})
        this.components = components;
        this.item_type = item_type;
        this.getResult = function(component_1, component_2, station_tier = 1){
            const comp_quality_weighted = this.get_component_quality_weighted(component_1, component_2);
            let quality = this.get_quality(comp_quality_weighted, (station_tier-Math.max(component_1.component_tier, component_2.component_tier)) || 0);
            //return based on components used
            if(this.item_type === "Weapon") {
                return new Weapon(
                    {
                        components: {
                            head: component_1.id,
                            handle: component_2.id,
                        },
                        quality: quality,
                    }
                );
            } else if(this.item_type === "Armor") {
                return new Armor(
                    {
                        components: {
                            internal: component_1.id,
                            external: component_2.id,
                        },
                        quality: quality,
                    }
                );
            } else if(this.item_type === "Shield") {
                return new Shield(
                    {
                        components: {
                            shield_base: component_1.id,
                            handle: component_2.id,
                        },
                        quality: quality,
                    }
                );
            } else {
                throw new Error(`Recipe "${this.name}" has an incorrect item_type provided ("${this.item_type}")`);
            }
        }
    }

    get_quality_range(component_quality, tier = 0) {
        const skill = skills[this.recipe_skill];
        const quality = (40+component_quality+(3*skill.current_level-skill.max_level)+20*(tier));
        return [Math.max(10,Math.round(quality-15)), Math.max(10,Math.round(quality+15))];
    }

    get_quality_cap() {
        const skill = skills[this.recipe_skill];
        return Math.min(Math.round(100*(1+2*skill.current_level/skill.max_level)),250);
    }

    get_quality(component_quality, tier = 0) {
        const quality_range = this.get_quality_range(component_quality, tier);
        return Math.min(((quality_range[1]-quality_range[0])*Math.random()+quality_range[0]), this.get_quality_cap());
    }

    get_component_quality_weighted(component_1, component_2) {
        return (component_1.quality*component_1.component_tier + component_2.quality*component_2.component_tier)/(component_1.component_tier+component_2.component_tier);
    }
}

function get_recipe_xp_value({category, subcategory, recipe_id, material_count, result_tier, selected_components, rarity_multiplier}) {
    //
    //for components: multiplied by material count (so every component of same tier is equally profitable to craft)
    //for equipment: based on component tier average
    if(!category || !subcategory || !recipe_id) {
        //shouldn't be possible to reach this
        throw new Error(`Tried to use a recipe but either category, subcategory, or recipe id was not passed: ${category} - ${subcategory} - ${recipe_id}`);
    }
    let exp_value = 8;
    const selected_recipe = recipes[category][subcategory][recipe_id];
    const skill_level = skills[selected_recipe.recipe_skill].current_level;
    if(!selected_recipe) {
        throw new Error(`Tried to use a recipe that doesn't exist: ${category} -> ${subcategory} -> ${recipe_id}`);
    }
    if(subcategory === "items") {
        exp_value = Math.max(exp_value,1.5*selected_recipe.recipe_level[1]);
        //maybe scale with materials needed?
        
        if(selected_recipe.recipe_level[1] < skill_level) {
            exp_value = Math.max(1,exp_value * Math.max(0,Math.min(5,(selected_recipe.recipe_level[1]+6-skill_level))/5));
        }
    } else if (subcategory === "components" || selected_recipe.recipe_type === "component") {
        const result_level = 8*result_tier;

        exp_value = Math.max(exp_value,result_tier * 4 * material_count);
        exp_value = Math.max(1,exp_value*(rarity_multiplier**0.5 - (skill_level/result_level))*rarity_multiplier);
    } else {
        const result_level = 8*Math.max(selected_components[0].component_tier,selected_components[1].component_tier);
        exp_value = Math.max(exp_value,(selected_components[0].component_tier+selected_components[1].component_tier) * 4);
        exp_value = Math.max(1,exp_value*(rarity_multiplier**0.5 - (skill_level/result_level))*rarity_multiplier);
    }

    return exp_value;
}

//weapon components
(()=>{
    forging_recipes.components["Short blade"] = new ComponentRecipe({
        name: "Short blade",
        materials: [
            {material_id: "Low quality iron ingot", count: 2, result_id: "Cheap short iron blade"}, 
            {material_id: "Iron ingot", count: 2, result_id: "Short iron blade"},
        ],
        item_type: "Component",
        recipe_skill: "Forging"
    });
    forging_recipes.components["Long blade"] = new ComponentRecipe({
        name: "Long blade",
        materials: [
            {material_id: "Low quality iron ingot", count: 3, result_id: "Cheap long iron blade"}, 
            {material_id: "Iron ingot", count: 3, result_id: "Long iron blade"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
    });
    forging_recipes.components["Axe head"] = new ComponentRecipe({
        name: "Axe head",
        materials: [
            {material_id: "Low quality iron ingot", count: 4, result_id: "Cheap iron axe head"}, 
            {material_id: "Iron ingot", count: 4, result_id: "Iron axe head"},
        ],
        item_type: "Component",
        recipe_skill: "Forging"
    });
    forging_recipes.components["Hammer head"] = new ComponentRecipe({
        name: "Hammer head",
        materials: [
            {material_id: "Low quality iron ingot", count: 4, result_id: "Cheap iron hammer head"}, 
            {material_id: "Iron ingot", count: 4, result_id: "Iron hammer head"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
    });

    forging_recipes.components["Short hilt"] = new ComponentRecipe({
        name: "Short hilt",
        materials: [
            {material_id: "Low quality iron ingot", count: 1, result_id: "Cheap short iron hilt"},
            {material_id: "Iron ingot", count: 1, result_id: "Short iron hilt"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
    });
    forging_recipes.components["Medium handle"] = new ComponentRecipe({
        name: "Medium handle",
        materials: [
            {material_id: "Low quality iron ingot", count: 2, result_id: "Cheap medium iron handle"},
            {material_id: "Iron ingot", count: 2, result_id: "Medium iron handle"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
    });
    forging_recipes.components["Long shaft"] = new ComponentRecipe({
        name: "Long shaft",
        materials: [
            {material_id: "Low quality iron ingot", count: 4, result_id: "Cheap long iron shaft"},
            {material_id: "Iron ingot", count: 4, result_id: "Long iron shaft"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
    });

    crafting_recipes.components["Short hilt"] = new ComponentRecipe({
        name: "Short hilt",
        materials: [
            {material_id: "Processed rough wood", count: 1, result_id: "Simple short wooden hilt"},
            {material_id: "Processed wood", count: 1, result_id: "Short wooden hilt"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
    });
    crafting_recipes.components["Medium handle"] = new ComponentRecipe({
        name: "Medium handle",
        materials: [
            {material_id: "Processed rough wood", count: 2, result_id: "Simple medium wooden handle"},
            {material_id: "Processed wood", count: 2, result_id: "Medium wooden handle"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
    });
    crafting_recipes.components["Long shaft"] = new ComponentRecipe({
        name: "Long shaft",
        materials: [
            {material_id: "Processed rough wood", count: 4, result_id: "Simple long wooden shaft"},
            {material_id: "Processed wood", count: 4, result_id: "Long wooden shaft"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
    });
})();

//shield components
(()=>{
    crafting_recipes.components["Shield base"] = new ComponentRecipe({
        name: "Shield base",
        materials: [
            {material_id: "Processed rough wood", count: 6, result_id: "Crude wooden shield base"}, 
            {material_id: "Processed wood", count: 6, result_id: "Wooden shield base"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "shield base",
    });

    crafting_recipes.components["Shield handle"] = new ComponentRecipe({
        name: "Shield handle",
        materials: [
            {material_id: "Processed rough wood", count: 4, result_id: "Basic shield handle"}, 
            {material_id: "Processed wood", count: 4, result_id: "Wooden shield handle"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "shield handle",
    });

    forging_recipes.components["Shield base"] = new ComponentRecipe({
        name: "Shield base",
        materials: [
            {material_id: "Low quality iron ingot", count: 5, result_id: "Crude iron shield base"},
            {material_id: "Iron ingot", count: 5, result_id: "Iron shield base"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "shield base",
    });

})();

//armor components
(()=>{
    crafting_recipes.components["Helmet exterior"] = new ComponentRecipe({
        name: "Helmet exterior",
        materials: [
            {material_id: "Piece of wolf leather", count: 3, result_id: "Wolf leather helmet armor"}, 
            {material_id: "Piece of boar leather", count: 3, result_id: "Boar leather helmet armor"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "helmet exterior",
    });

    forging_recipes.components["Helmet exterior"] = new ComponentRecipe({
        name: "Helmet exterior",
        materials: [
            {material_id: "Iron chainmail", count: 3, result_id: "Iron chainmail helmet armor"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "helmet exterior",
    });
    
    crafting_recipes.components["Chestplate exterior"] = new ComponentRecipe({
        name: "Chestplate exterior",
        materials: [
            {material_id: "Piece of wolf leather", count: 5, result_id: "Wolf leather chestplate armor"}, 
            {material_id: "Piece of boar leather", count: 5, result_id: "Boar leather chestplate armor"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "chestplate exterior",
    });

    forging_recipes.components["Chestplate exterior"] = new ComponentRecipe({
        name: "Chestplate exterior",
        materials: [
            {material_id: "Iron chainmail", count: 5, result_id: "Iron chainmail vest"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "chestplate exterior",
    });

    crafting_recipes.components["Leg armor exterior"] = new ComponentRecipe({
        name: "Leg armor exterior",
        materials: [
            {material_id: "Piece of wolf leather", count: 4, result_id: "Wolf leather greaves"}, 
            {material_id: "Piece of boar leather", count: 4, result_id: "Boar leather greaves"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "leg armor exterior",
    });

    forging_recipes.components["Leg armor exterior"] = new ComponentRecipe({
        name: "Leg armor exterior",
        materials: [
            {material_id: "Iron chainmail", count: 4, result_id: "Iron chainmail greaves"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "leg armor exterior",
    });

    crafting_recipes.components["Glove exterior"] = new ComponentRecipe({
        name: "Glove exterior",
        materials: [
            {material_id: "Piece of wolf leather", count: 3, result_id: "Wolf leather glove armor"}, 
            {material_id: "Piece of boar leather", count: 3, result_id: "Boar leather glove armor"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "glove exterior",
    });

    forging_recipes.components["Glove exterior"] = new ComponentRecipe({
        name: "Glove exterior",
        materials: [
            {material_id: "Iron chainmail", count: 3, result_id: "Iron chainmail glove"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "Glove exterior",
    });

    crafting_recipes.components["Shoes exterior"] = new ComponentRecipe({
        name: "Shoes exterior",
        materials: [
            {material_id: "Piece of wolf leather", count: 3, result_id: "Wolf leather shoe armor"}, 
            {material_id: "Piece of boar leather", count: 3, result_id: "Boar leather shoe armor"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "shoes exterior",
    });

    forging_recipes.components["Shoes exterior"] = new ComponentRecipe({
        name: "Shoes exterior",
        materials: [
            {material_id: "Iron chainmail", count: 3, result_id: "Iron chainmail shoes"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "shoes exterior",
    });


})();

//equipment
(()=>{
    //full weapons
    crafting_recipes.equipment["Axe"] = new EquipmentRecipe({
        name: "Axe",
        components: ["axe head", "medium handle"],
        item_type: "Weapon",
    });
    crafting_recipes.equipment["Dagger"] = new EquipmentRecipe({
        name: "Dagger",
        components: ["short blade", "short handle"],
        item_type: "Weapon",
    });
    crafting_recipes.equipment["Hammer"] = new EquipmentRecipe({
        name: "Hammer",
        components: ["hammer head", "medium handle"],
        item_type: "Weapon",
    });
    crafting_recipes.equipment["Spear"] = new EquipmentRecipe({
        name: "Spear",
        components: ["short blade", "long handle"],
        item_type: "Weapon",
    });
    crafting_recipes.equipment["Sword"] = new EquipmentRecipe({
        name: "Sword",
        components: ["long blade", "short handle"],
        item_type: "Weapon",
    });

    //full shields
    crafting_recipes.equipment["Shield"] = new EquipmentRecipe({
        name: "Shield",
        components: ["shield base","shield handle"],
        item_type: "Shield",
    })

    //full armor
    crafting_recipes.equipment["Helmet"] = new EquipmentRecipe({
        name: "Helmet",
        components: ["helmet interior", "helmet exterior"],
        item_type: "Armor",
    });
    crafting_recipes.equipment["Chestplate"] = new EquipmentRecipe({
        name: "Chestplate",
        components: ["chestplate interior", "chestplate exterior"],
        item_type: "Armor",
    });
    crafting_recipes.equipment["Leg armor"] = new EquipmentRecipe({
        name: "Leg armor",
        components: ["leg armor interior", "leg armor exterior"],
        item_type: "Armor",
    });
    crafting_recipes.equipment["Gauntlets"] = new EquipmentRecipe({
        name: "Gauntlets",
        components: ["glove interior", "glove exterior"],
        item_type: "Armor",
    });
    crafting_recipes.equipment["Armored shoes"] = new EquipmentRecipe({
        name: "Armored shoes",
        components: ["shoes interior", "shoes exterior"],
        item_type: "Armor",
    });
})();
    
//clothes (which is also equipment, but shhhh)
(()=>{
    crafting_recipes.equipment["Hat"] = new ComponentRecipe({
        name: "Hat",
        materials: [
            {material_id: "Piece of wolf leather", count: 3, result_id: "Leather hat"},
            {material_id: "Wool cloth", count: 3, result_id: "Wool hat"}
        ],
        item_type: "Armor",
        component_type: "helmet interior",
        recipe_skill: "Crafting",
    });

    crafting_recipes.equipment["Shirt"] = new ComponentRecipe({
        name: "Shirt",
        materials: [
            {material_id: "Piece of wolf rat leather", count: 5, result_id: "Cheap leather vest"},
            {material_id: "Piece of wolf leather", count: 5, result_id: "Leather vest"},
            {material_id: "Wool cloth", count: 5, result_id: "Wool shirt"}
        ],
        item_type: "Armor",
        component_type: "chestplate interior",
        recipe_skill: "Crafting",
    });

    crafting_recipes.equipment["Pants"] = new ComponentRecipe({
        name: "Pants",
        materials: [
            {material_id: "Piece of wolf rat leather", count: 3, result_id: "Cheap leather pants"},
            {material_id: "Piece of wolf leather", count: 3, result_id: "Leather pants"},
            {material_id: "Wool cloth", count: 3, result_id: "Wool pants"}
        ],
        item_type: "Armor",
        component_type: "leg armor interior",
        recipe_skill: "Crafting",
    });

    crafting_recipes.equipment["Gloves"] = new ComponentRecipe({
        name: "Gloves",
        materials: [
            {material_id: "Piece of wolf leather", count: 2, result_id: "Leather gloves"},
            {material_id: "Wool cloth", count: 2, result_id: "Wool gloves"}
        ],
        item_type: "Armor",
        component_type: "glove interior",
        recipe_skill: "Crafting",
    });

    crafting_recipes.equipment["Shoes"] = new ComponentRecipe({
        name: "Shoes",
        materials: [
            {material_id: "Piece of wolf rat leather", count: 2, result_id: "Cheap leather shoes"},
            {material_id: "Piece of wolf leather", count: 2, result_id: "Leather shoes"}
        ],
        item_type: "Armor",
        component_type: "shoes interior",
        recipe_skill: "Crafting",
    });
    
})();

//materials
(function(){
    crafting_recipes.items["Piece of wolf rat leather"] = new ItemRecipe({
        name: "Piece of wolf rat leather",
        recipe_type: "material",
        materials: [{material_id: "Rat pelt", count: 8}], 
        result: {result_id: "Piece of wolf rat leather", count: 1},
        success_chance: [0.4,1],
        recipe_level: [1,5],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["Piece of wolf leather"] = new ItemRecipe({
        name: "Piece of wolf leather",
        recipe_type: "material",
        materials: [{material_id: "Wolf pelt", count: 8}], 
        result: {result_id: "Piece of wolf leather", count: 1},
        success_chance: [0.2,1],
        recipe_skill: "Crafting",
        recipe_level: [1,10],
    });
    crafting_recipes.items["Piece of boar leather"] = new ItemRecipe({
        name: "Piece of boar leather",
        recipe_type: "material",
        materials: [{material_id: "Boar hide", count: 8}],
        result: {result_id: "Piece of boar leather", count: 1},
        success_chance: [0.2,1],
        recipe_skill: "Crafting",
        recipe_level: [5,15],
    });
    crafting_recipes.items["Wool cloth"] = new ItemRecipe({
        name: "Wool cloth",
        recipe_type: "material",
        materials: [{material_id: "Wool", count: 5}], 
        result: {result_id: "Wool cloth", count: 1},
        success_chance: [0,1],
        recipe_skill: "Crafting",
        recipe_level: [5,15],
    });
    forging_recipes.items["Iron chainmail"] = new ItemRecipe({
        name: "Iron chainmail",
        recipe_type: "material",
        materials: [{material_id: "Iron ingot", count: 5}], 
        result: {result_id: "Iron chainmail", count: 1},
        success_chance: [0.1,1],
        recipe_skill: "Forging",
        recipe_level: [5,15],
    });

    crafting_recipes.items["Rat meat chunks"] = new ItemRecipe({
        name: "Rat meat chunks",
        recipe_type: "material",
        materials: [{material_id: "Rat tail", count: 8}], 
        result: {result_id: "Rat meat chunks", count: 1},
        success_chance: [0.4,1],
        recipe_level: [1,5],
        recipe_skill: "Crafting",
    });

    smelting_recipes.items["Low quality iron ingot"] = new ItemRecipe({
        name: "Low quality iron ingot",
        recipe_type: "material",
        materials: [{material_id: "Low quality iron ore", count: 5}], 
        result: {result_id: "Low quality iron ingot", count: 1},
        success_chance: [0.4,1],
        recipe_level: [1,5],
        recipe_skill: "Smelting",
    });
    smelting_recipes.items["Iron ingot"] = new ItemRecipe({
        name: "Iron ingot",
        recipe_type: "material",
        materials: [{material_id: "Iron ore", count: 5}], 
        result: {result_id: "Iron ingot", count: 1},
        success_chance: [0.1,1],
        recipe_level: [5,15],
        recipe_skill: "Smelting",
    });

    crafting_recipes.items["Processed rough wood"] = new ItemRecipe({
        name: "Processed rough wood",
        recipe_type: "material",
        materials: [{material_id: "Piece of rough wood", count: 5}], 
        result: {result_id: "Processed rough wood", count: 1},
        success_chance: [0.6,1],
        recipe_level: [1,5],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["Processed wood"] = new ItemRecipe({
        name: "Processed wood",
        recipe_type: "material",
        materials: [{material_id: "Piece of wood", count: 5}], 
        result: {result_id: "Processed wood", count: 1},
        success_chance: [0.2,1],
        recipe_level: [5,15],
        recipe_skill: "Crafting",
    });
})();

//consumables
(function(){
    cooking_recipes.items["Roasted rat meat"] = new ItemRecipe({
        name: "Roasted rat meat",
        recipe_type: "usable",
        materials: [{material_id: "Rat meat chunks", count: 2}], 
        result: {result_id: "Roasted rat meat", count: 1},
        success_chance: [0.4,1],
        recipe_level: [1,5],
        recipe_skill: "Cooking",
    });
    cooking_recipes.items["Roasted purified rat meat"] = new ItemRecipe({
        name: "Roasted purified rat meat",
        recipe_type: "usable",
        materials: [{material_id: "Rat meat chunks", count: 2},
                    {material_id: "Belmart leaf", count: 1},
        ],
        result: {result_id: "Roasted purified rat meat", count: 1},
        success_chance: [0.1,1],
        recipe_level: [1,10],
        recipe_skill: "Cooking",
    });
    alchemy_recipes.items["Weak healing powder"] = new ItemRecipe({
        name: "Weak healing powder",
        recipe_type: "usable",
        materials: [{material_id: "Golmoon leaf", count: 5}],
        result: {result_id: "Weak healing powder", count: 1},
        success_chance: [0.1,1],
        recipe_level: [1,10],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items["Oneberry juice"] = new ItemRecipe({
        name: "Oneberry juice",
        recipe_type: "usable",
        materials: [{material_id: "Oneberry", count: 10},
                    {material_id: "Glass phial", count: 1},
        ],
        result: {result_id: "Oneberry juice", count: 1},
        success_chance: [0.1,1],
        recipe_level: [1,10],
        recipe_skill: "Alchemy",
    });
})();

//trinkets
(function(){
    crafting_recipes.items["Wolf trophy"] = new ItemRecipe({
        name: "Wolf trophy",
        id: "Wolf trophy",
        recipe_type: "equipment",
        materials: [{material_id: "High quality wolf fang", count: 5}],
        result: {result_id: "Wolf trophy", count: 1},
        success_chance: [0.5,1],
        recipe_level: [1,10],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["Boar trophy"] = new ItemRecipe({
        name: "Boar trophy",
        id: "Boar trophy",
        recipe_type: "equipment",
        materials: [{material_id: "High quality boar tusk", count: 5}],
        result: {result_id: "Boar trophy", count: 1},
        success_chance: [0.5,1],
        recipe_level: [5,15],
        recipe_skill: "Crafting",
    });
})();

const recipes = {
    crafting: crafting_recipes, 
    cooking: cooking_recipes, 
    smelting: smelting_recipes, 
    forging: forging_recipes, 
    alchemy: alchemy_recipes
}

export {recipes, get_recipe_xp_value}
