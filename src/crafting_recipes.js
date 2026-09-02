"use strict";

import recipe_data from "./data/recipes.json" with { type: "json" };
import { character, get_total_skill_level } from "./character.js";
import { Armor, ArmorComponent, Cape, Shield, ShieldComponent, Weapon, WeaponComponent, Amulet, item_templates } from "./items.js";
import { skills } from "./data/skills.js";
import { clamp, random_range, slerp } from "./misc.js";
import { config } from "./config.js";
import { game_options } from "./main.js";

const crafting_recipes = {items: {}, components: {}, equipment: {}};
const cooking_recipes = {items: {}};
const smelting_recipes = {items: {}};
const forging_recipes = {items: {}, components: {}};
const alchemy_recipes = {items: {}};
const butchering_recipes = { items: {} };
const woodworking_recipes = {items: {}, components: {}};

/*
    recipes can be treated differently for display based on if they are in items/components/equipment category

    non-equipment recipes have a success rate (presented with min-max value, where max should be 1) that shall scale with skill level and with crafting station level
    for equipment recipes, there is no success rate in favor of equipment's "quality" property

    resulting quality of equipment is based on component quality, result tier, crafting station tier and relevant skill level
    
    overal max quality achievable scales with related skills
*/

function round_quality(quality, precision) {
    return Math.round(quality/precision)*precision;
}

/*
    The caps as a player can actually reach them. get_quality_range clamps the roll to
    the cap and then rounds it to the recipe's grid, so an unrounded cap is a number that
    is never rolled: at Crafting 1 the raw components cap is 102, and the reachable
    ceiling is 104.
*/
function get_crafting_quality_caps(skill_name) {
    return {
        components: round_quality(Math.min(Math.round(100+2*get_total_skill_level(skill_name)),200),
            config.item_crafting_quality_precision),
        equipment: round_quality(Math.min(Math.round(100+2.8*get_total_skill_level(skill_name)),250),
            config.equipment_crafting_quality_precision),
    }
}

/*
    Which recipes the player has ever actually made.

    Asked for as a discovered / not-discovered marker on the crafting pages: "craftable but
    never crafted" is not something anything recorded, so like the acquisition order in P-32
    this is a field that had to start existing and start being saved (P-39).

    Keyed by recipe id and NOT by category/subcategory/id, deliberately. Nine ids appear in
    two or three categories - a Short hilt can be made by crafting, by forging or by
    woodworking - and the question the marker answers is "have I ever made one of these",
    not "have I ever made one of these this particular way".

    Not folded into item_log, which was the first idea: that is keyed by ITEM, and a
    component recipe's item depends on the material it is made from, so "Short hilt" has no
    single item to hang a flag on.
*/
const crafted_recipes = {};

/** Records that a recipe has been used successfully at least once. */
function mark_recipe_crafted(recipe_id) {
    if(recipe_id) {
        crafted_recipes[recipe_id] = true;
    }
}

/** Whether this recipe has ever been made. */
function was_ever_crafted(recipe_id) {
    return Boolean(crafted_recipes[recipe_id]);
}

class Recipe {
    constructor({
        name,
        id,
        is_unlocked = true,
        recipe_type,
        result, //{name, count}
        getResult,
        recipe_level = [1,1],
        recipe_skill,
        scale_results = true, //only matters for recipes rewarding multiple of an item, checked in use_recipe to scale result count with skill;
                              //false will mean that recipe can only succeed or fail, true will mean it can succeed partially
    }) {
        this.name = name;
        this.id = id;
        this.is_unlocked = is_unlocked;
        this.recipe_type = recipe_type;
        this.result = result;
        this.scale_results = scale_results;
        this.getResult = getResult || function(){return this.result};
        this.recipe_level = recipe_level;
        this.recipe_skill = recipe_skill;
        this.quality_precision = config.item_crafting_quality_precision;
    }

    get_success_chance(station_tier=1) {
        const level = clamp(get_total_skill_level(this.recipe_skill), 0, this.recipe_level[1]) - this.recipe_level[0] + 1;
        const skill_modifier = Math.min(1,(0||(level+(station_tier-1))/(this.recipe_level[1]-this.recipe_level[0]+1)));
        //Was an inline copy of slerp, carrying the same divide-by-zero trap.
        return slerp(this.success_chance, skill_modifier);
    }

    get_quality_range(tier = 0, component_quality) {
        const skill = skills[this.recipe_skill];
        if (component_quality) {
            const quality = (3 * get_total_skill_level(this.recipe_skill) - skill.max_level) + 50 + component_quality + (10 * tier);
            return [
                round_quality(clamp(Math.round(quality - 15), 10, this.get_quality_cap()), this.quality_precision),
                round_quality(clamp(Math.round(quality + 15), 10, this.get_quality_cap()), this.quality_precision)
            ];
        }
        else {
            const quality = (3 * get_total_skill_level(this.recipe_skill) - skill.max_level) + 130 + (15 * tier);
            return [
                round_quality(clamp(Math.round(quality - 15), 10, this.get_quality_cap()), this.quality_precision),
                round_quality(clamp(Math.round(quality + 10), 10, this.get_quality_cap()), this.quality_precision)
            ];
        }
    }
}

class ItemRecipe extends Recipe {
    constructor({
        name,
        id,
        materials = [], //{name, count}
        is_unlocked = true,
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

    get_availability() {
        let amount = Infinity;
        let materials = [];
        for (let i = 0; i < this.materials.length; i++) {
            let material = find_recipe_material({material: this.materials[i], needed_count: this.materials[i].count});
            amount = Math.floor(Math.min(material.count / this.materials[i].count, amount));
            materials.push(material);

            if (amount == 0) {
                break;
            }
        }
        
        return {available_ammount: amount, materials};
    }

    /*
        Item recipes had no cap of their own because they had no roll at all: use_recipe's
        item branch added the result at the template's own inventory key, so a dish cooked
        from a 130% trout came out with quality null and the fish's quality simply
        vanished (P-22). Nothing an item recipe makes is equipment, so the components cap
        is the right ceiling; ComponentRecipe and ComponentlessEquipRecipe override this
        with their own because what they make can be.
    */
    get_quality_cap() {
        return get_crafting_quality_caps(this.recipe_skill).components;
    }

    /*
        input_quality is the quality of what actually went in - for an item recipe the
        weighted quality of everything consumed, for a component recipe the quality of the
        one selected material.

        It is falsy whenever nothing that went in carried a quality, and get_quality_range
        answers a falsy quality with its no-input branch, so a recipe fed unqualitied
        materials rolls exactly the range it rolled before this parameter existed. That is
        what keeps the change to the recipes it is about: fishing is the only thing outside
        crafting that makes a quality, so today this is the fish and nothing else - but the
        rule is about materials rather than about fish, and anything given a quality later
        starts mattering here on its own.

        The two branches meet at 80 (50 + 80 = 130), so a real input quality is not a
        blanket buff: it is symmetric around the 80 the no-input branch has always
        silently assumed. A poor fish makes a poor meal.

        Every subclass that makes something with a quality shares this body now. Two of
        them used to carry their own copy that took a tier and nothing else, which is how
        the item and equipment paths were able to drift apart in the first place.
    */
    roll_quality(input_quality, tier = 0) {
        const quality_range = this.get_quality_range(tier, input_quality);
        return round_quality(random_range(quality_range[0], quality_range[1]), this.quality_precision);
    }
}

class ComponentRecipe extends ItemRecipe{
    constructor({
        name,
        id,
        materials = [], 
        is_unlocked = true,
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
            let quality = this.roll_quality(material.quality, (station_tier-result.component_tier) || 0);
            if(result.tags["clothing"]) {
                //means its a clothing (wearable internal part of armor)
                return new Armor({...item_templates[result.id], quality: quality});
            } else if(result.tags["armor component"]) {

                return new ArmorComponent({...item_templates[result.id], quality: quality});
            } else if(result.tags["weapon component"]) {

                return new WeaponComponent({...item_templates[result.id], quality: quality});
            } else if (result.tags["shield component"]) {

                return new ShieldComponent({ ...item_templates[result.id], quality: quality });
            } else if (result.tags["amulet"]) {

                return new Amulet({ ...item_templates[result.id], quality: quality });
            } else {
                throw new Error(`Component recipe ${this.name} does not produce a valid result!`);
            }
        }
    }

    get_quality_cap() {
        if(this.item_type === "Armor") {
            return get_crafting_quality_caps(this.recipe_skill).equipment;
        } else {
            return get_crafting_quality_caps(this.recipe_skill).components;
        }
    }
    //roll_quality is ItemRecipe's; this class only differs in what it may cap at.
}

class ComponentlessEquipRecipe extends ItemRecipe{
    constructor({
        name,
        id,
        materials = [], 
        is_unlocked = true,
        result, //{item, count, result_name} where result_name is an item_templates key
        recipe_skill,
        item_type,
    }) {
        super({name, id, materials, is_unlocked, recipe_type: "componentless", result, recipe_level: [1,1], recipe_skill, getResult: null, success_rate: [1,1]})
        this.item_type = item_type;
        this.getResult = function(material, station_tier = 1){
            const result = item_templates[this.materials.filter(x => x.material_id===material.id)[0].result_id];
            //return based on material used
            let quality = this.roll_quality(material.quality, (station_tier-result.item_tier) || 0);
            return new Cape({...item_templates[result.id], quality: quality});
        }
    }

    get_quality_cap() {
        return get_crafting_quality_caps(this.recipe_skill).equipment;
    }
    //roll_quality is ItemRecipe's; this class only differs in what it may cap at.
}

/**
 * How many of a component type the player is holding.
 *
 * The one place that asks. The component-choice list in crafting_display.js filtered the
 * inventory by `component_type` inline, so "which components could go here" would have been
 * written twice the moment anything else needed to know (P-39).
 */
function count_components_of_type(component_type) {
    let count = 0;
    for(const entry of Object.values(character.inventory)) {
        if(entry.item.component_type === component_type) {
            count += entry.count;
        }
    }
    return count;
}

class EquipmentRecipe extends Recipe {
    constructor({
        name,
        id,
        components = [], //pair of component types; first letter not capitalized; blade-handle or internal-external
        is_unlocked = true,
        result = null,
        recipe_skill = "Crafting",
        item_type, //Weapon/Armor/Shield
        //no recipe level, difficulty based on selected components
    }) {
        super({name, id, is_unlocked, recipe_type: "equipment", result, getResult: null, recipe_level: [1,1], recipe_skill, success_rate: [1,1]})
        this.components = components;
        this.item_type = item_type;
        this.quality_precision = config.equipment_crafting_quality_precision;

        /**
         * Whether the player is holding a component for every slot this needs.
         *
         * ItemRecipe has had one of these all along and EquipmentRecipe never did, which is
         * why the greying-out on the equipment page is commented out and why a "only what I
         * can make" filter had nothing to read there (P-39).
         *
         * The number is the smallest set of complete sets the inventory could supply, so it
         * means what the item recipes' number means. Quality and tier are not consulted: any
         * blade will make some axe, and which blade is the player's choice to make.
         *
         * @returns {Object} {available_ammount, components}
         */
        this.get_availability = function() {
            let amount = Infinity;
            const components = [];
            for(const component_type of this.components) {
                const count = count_components_of_type(component_type);
                components.push({component_type, count});
                amount = Math.min(amount, count);
                if(amount === 0) {
                    break;
                }
            }
            return {available_ammount: amount === Infinity ? 0 : amount, components};
        };
        this.getResult = function (components, station_tier = 1) {
            const component_stats = get_component_stats(components);
            let quality = this.roll_quality(component_stats.weighted_quality, station_tier - component_stats.max_tier);
            
            //return based on components used
            if(this.item_type === "Weapon") {
                return new Weapon(
                    {
                        components: {
                            head: components[0].item.id,
                            handle: components[1].item.id,
                        },
                        quality: quality,
                    }
                );
            } else if(this.item_type === "Armor") {
                return new Armor(
                    {
                        components: {
                            internal: components[0].item.id,
                            external: components[1].item.id,
                        },
                        quality: quality,
                    }
                );
            } else if(this.item_type === "Shield") {
                return new Shield(
                    {
                        components: {
                            shield_base: components[0].item.id,
                            handle: components[1].item.id,
                        },
                        quality: quality,
                    }
                );
            } else {
                throw new Error(`Recipe "${this.name}" has an incorrect item_type provided ("${this.item_type}")`);
            }
        }
    }

    get_quality_cap() {
        return get_crafting_quality_caps(this.recipe_skill).equipment;
    }

    roll_quality(component_quality, tier = 0) {
        const quality_range = this.get_quality_range(tier, component_quality);
        return round_quality(random_range(quality_range[0], quality_range[1]),this.quality_precision);
    }
}

/**
 * @description Finds and returns how much of a provided material (by id or by key) is available for recipe, together with references to it
 * @param {Object} data
 * @param {Object} data.material material_id/material_type, count, result_id?
 * @param {Boolean} data.ignore_stop ignores the optional stop when material changes, used for display purposes
 * @param {Number} data.needed_count only used when stopping on material change is enabled
 * @returns { count, items[] } - items: [{item_key, count, item_id (if no key), quality (optional if no key)},...] - same as inventory
 */
function find_recipe_material({material, ignore_stop, needed_count}) {
    /*
        One walk for both ways a recipe can name what it wants.

        The two used to be separate, and the id one was a single lookup of
        item_templates[material_id].getInventoryKey() - the TEMPLATE's key, which carries
        no quality. That was correct for as long as nothing a recipe names by id could
        have one, and it stopped being correct the moment something could: a Fish fillet
        butchered from a good catfish is stored under {"id":"Fish fillet","quality":68},
        and the Fish steak recipe that asks for it by id then found nothing at all. Ten
        fillets in the bag and the recipe reads unavailable.

        The predicate was the only real difference between the two branches, so it is the
        only difference now. Cheapest first, which for something that carries a quality
        means the poorest is spent first and the good ones are kept - the same rule the
        material_type walk has always used.
    */
    const matches = material.material_id
        ? (entry) => entry.item.id === material.material_id
        : (entry) => Boolean(material.material_type)
            && entry.item.material_type === material.material_type;

    const available = Object.values(character.inventory)
        .filter(matches)
        .sort((a,b) => a.item.getBaseValue()-b.item.getBaseValue());

    let count = 0;
    const items = [];

    if(game_options.stop_crafting_on_material_change && !ignore_stop) {
        //crafting stops when material changes
        if(available[0]) {
            count = available[0].count;
            items.push(available[0]);
            //add it to list either way, no matter if it's enough

            let i = 1;
            while(count < needed_count && available[i]) {
                /*
                there is not enough, check next cheapest, add it, and so on
                this way:
                    if there's enough of first mat, on click it will only use first mat
                    if there's not enough of first mat, on click it will use first mat and next mat, and so on, until it has enough
                */
                count += available[i].count;
                items.push(available[i]);
                i++;
            }
        }
    } else {
        //grab total count of everything that matches
        available.forEach(entry => {
            count += entry.count;
            items.push(entry);
        });
    }

    return { count, items };
}

/**
 * @description The quality of what a recipe would consume, weighted by how much of it it
 * would consume - or undefined when nothing it consumes carries one.
 *
 * Defined once because it has two callers that must agree: use_recipe, which rolls the
 * result's quality from it, and the recipe tooltip, which tells the player what that roll
 * is going to produce. A second copy of this is how the crafting paths drifted apart the
 * first time.
 *
 * @param {Object} data
 * @param {Array} data.recipe_materials the recipe's own material list
 * @param {Array} data.materials what find_recipe_material found for each of them, in order
 * @param {Number} data.craft_count how many crafts to account for
 * @returns {Number|undefined}
 */
function get_consumed_quality({recipe_materials, materials, craft_count = 1}) {
    let total = 0;
    let counted = 0;

    for (let i = 0; i < recipe_materials.length; i++) {
        let to_take = recipe_materials[i].count * craft_count;

        for (let j = 0; j < (materials[i]?.items.length ?? 0) && to_take > 0; j++) {
            const taken = Math.min(materials[i].items[j].count, to_take);
            const quality = materials[i].items[j].item.quality;

            if(quality) {
                total += quality * taken;
                counted += taken;
            }
            to_take -= taken;
        }
    }

    return counted ? total/counted : undefined;
}

function get_component_stats(components) {
    let total_quality = 0;
    let total_tier = 0;
    let max_tier = 0;

    for (let i in components) {
        let component = components[i].item;

        total_quality += component.quality * component.component_tier;
        total_tier += component.component_tier;
        max_tier = Math.max(max_tier, component.component_tier);
    }

    let result_level = max_tier * 8;
    let weighted_quality = total_quality / total_tier;

    return { total_quality, total_tier, max_tier, result_level, weighted_quality };
}

//TODO decouple from categories
function get_recipe_xp_value({category, subcategory, recipe_id, material_count, result_tier, selected_components, rarity_multiplier}) {
    //
    //for components: multiplied by material count (so every component of same tier is equally profitable to craft)
    //for equipment: based on component tier average
    if(!category || !subcategory || !recipe_id) {
        //shouldn't be possible to reach this
        throw new Error(`Tried to use a recipe but either category, subcategory, or recipe id was not passed: ${category} - ${subcategory} - ${recipe_id}`);
    }
    let exp_value = 4;
    const selected_recipe = recipes[category][subcategory][recipe_id];
    const skill_level = skills[selected_recipe.recipe_skill].current_level; //don't use buffed level as that would only result in reduced xp gain, which is not desired here
    if(!selected_recipe) {
        throw new Error(`Tried to use a recipe that doesn't exist: ${category} -> ${subcategory} -> ${recipe_id}`);
    }
    if(subcategory === "items") {
        exp_value = Math.max(exp_value,1.5*selected_recipe.recipe_level[1])**1.1;
        //maybe scale with materials needed?
        
        if(selected_recipe.recipe_level[1] < skill_level) {
            exp_value = Math.max(1,exp_value * Math.max(0,Math.min(5,(selected_recipe.recipe_level[1]+6-skill_level))/5));
            //penalty kicks in when more than 5 levels more than needed, goes down to 0 within further 5 levels
        }
    } else if (subcategory === "components" || selected_recipe.recipe_type === "component" || selected_recipe.recipe_type === "componentless") {
        const result_level = 8*result_tier;
        exp_value = Math.max(exp_value**1.2,((result_tier * 4)**1.1) * material_count);

        if(result_level > skill_level*rarity_multiplier**0.5) {
            //full value
            exp_value = Math.max(0.5*material_count,exp_value*rarity_multiplier);
        } else {
            //scaled value
            exp_value = Math.max(0.5*material_count,exp_value*rarity_multiplier*Math.max(0,Math.min(5,result_level*rarity_multiplier**0.5+5-skill_level))/5);
        }
        //penalty kicks in when skill level is more than 8*item_tier, but is delayed by sqrt of rarity multiplier
    } else {
        //TODO

        const component_stats = get_component_stats(selected_components);

        exp_value = Math.max(exp_value, component_stats.total_tier * 4)**1.1;

        if(component_stats.result_level > skill_level*rarity_multiplier**0.5) {
            //full value
            exp_value = Math.max(1,exp_value*rarity_multiplier);
        } else {
            //scaled value
            exp_value = Math.max(1,exp_value*rarity_multiplier*Math.max(0,Math.min(5,component_stats.result_level*rarity_multiplier**0.5+5-skill_level))/5);
        }
        //penalty kicks in when skill level is more than 8*item_tier, but is delayed by sqrt of rarity multiplier
    }
    return Math.round(10*exp_value)/10;
}

//weapon components
(()=>{



/*
    The recipes, read from data rather than declared (P-42 step 2, second family).

    Measured before the move: 148 declarations and **none** carrying a function, so unlike
    items.js there is no exception left behind. All 148 names equalled their key, so `name`
    is derived here and 148 redundant strings are gone along with the chance of one drifting
    from the key it belongs to.

    The type is carried per row rather than inferred from the subcategory, because the
    subcategory does not determine it: `equipment` holds EquipmentRecipe (11),
    ComponentRecipe (6) and ComponentlessEquipRecipe (1).

    The import attribute is required rather than decorative - esbuild accepts a bare JSON
    import and Node refuses it, and the checks load this file through Node.
*/
const recipe_constructors = {
    ItemRecipe,
    ComponentRecipe,
    EquipmentRecipe,
    ComponentlessEquipRecipe,
};

const recipe_lists = {
    crafting: crafting_recipes,
    cooking: cooking_recipes,
    smelting: smelting_recipes,
    forging: forging_recipes,
    alchemy: alchemy_recipes,
    butchering: butchering_recipes,
    woodworking: woodworking_recipes,
};

for(const [category, subcategories] of Object.entries(recipe_data)) {
    for(const [subcategory, rows] of Object.entries(subcategories)) {
        for(const [key, row] of Object.entries(rows)) {
            const {type, ...fields} = row;
            const Recipe = recipe_constructors[type];
            if(!Recipe) {
                throw new Error(`Recipe "${key}" asks for type "${type}", which is not a `
                    + `recipe constructor.`);
            }
            recipe_lists[category][subcategory][key] = new Recipe({...fields, name: key});
        }
    }
}

})();

//shield components
(()=>{



})();

//armor components
(()=>{

    









})();

//equipment
(()=>{
    //full weapons

    //full shields

    //full armor
})();
    
//clothes (which is also equipment, but also components, therefore separate)
(()=>{





})();

//componentless equipment (currently just capes)
(()=>{
})();

//materials
(function(){

    /*
        The sink silver was waiting for.

        Deliberately expensive in ore rather than in level: three ingots is
        fifteen ore, and the only tap is a second-stage dive that needs Swimming,
        Breathing and Perception together. Nothing else in the game consumes
        silver, so the price is the whole of the gate's cost.
    */


    //Tier 4 chainmail, one band above steel's. Two ingots each, like every other
    //chainmail in the game.
    /*
        Plate is three ingots where chainmail is two, and a band harder to get right:
        beating a sheet flat and even is the part a smith gets wrong, not the rings.
    */



    /*
        Tier 4. Five ore and a coal, the same shape as iron and steel, at 15 to 25 -
        one band above steel.

        Two metals rather than one variant of a metal: the component generator gives
        white iron weight 130 / strength 100 and black iron weight 80 / strength 110.
        Heavy and durable against light and sharp, which is a choice the player gets
        to make and which was already designed.
    */
    /*
        Tier 5, and it reads the same way steel does: an ore plus a reagent plus coal.
        Steel is iron ore and Atratan; white and black steel are their own iron ore and
        heavy sand, which is only diggable on the flats and only while she is on them.
        Two ores in and one ingot out, at a worse chance than tier 4 and ten levels above
        it, because the whole tier is meant to be work rather than shopping.
    */
    //Was commented out "waiting for a sink". It has one now: the divining rod
    //below, and through it the second gate under the village.







})();

//misc
(function(){

})();

//consumables
(function(){
    /*
        The two cooked vegetables. Both items existed with descriptions in two
        languages and a Basic meal effect, and nothing turned a raw one into a cooked
        one - so neither form could be obtained at all.

        Level 1 to 4, below roasted rat meat: boiling a potato is the easiest thing
        anybody in this game does. is_unlocked because the recipe list has to hold
        something before the player has read a book.
    */
    


})();

//trinkets and jewellery
(function(){

})();

const recipes = {
    crafting: crafting_recipes, 
    cooking: cooking_recipes, 
    smelting: smelting_recipes, 
    forging: forging_recipes, 
    alchemy: alchemy_recipes,
    butchering: butchering_recipes,
    woodworking: woodworking_recipes,
}


Object.keys(recipes).forEach(recipe_category => {
    Object.keys(recipes[recipe_category]).forEach(recipe_subcategory => {
        Object.keys(recipes[recipe_category][recipe_subcategory]).forEach(recipe_key => {
            recipes[recipe_category][recipe_subcategory][recipe_key].id = recipe_key;
        });
    });
});

export {
    crafted_recipes, mark_recipe_crafted, was_ever_crafted, recipes, find_recipe_material, get_consumed_quality, get_recipe_xp_value, get_crafting_quality_caps, get_component_stats, ItemRecipe }
