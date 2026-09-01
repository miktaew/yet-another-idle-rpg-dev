"use strict";

/**
 * Crafting: turning a recipe, some materials and a station into items.
 *
 * Lifted out of main.js whole. It was the one 350-line piece of that file that owed it
 * nothing back - four names in, none out - which is what made it the first cut worth
 * making, ahead of save/load at five times the size and seventy names deep.
 *
 * `window.use_recipe` still lives in main.js with the rest of the page's surface, so the
 * markup keeps one place to look.
 */

import { character, add_to_character_inventory, remove_from_character_inventory,
    update_character_stats, get_skill_xp_gain } from "./character.js";
import { recipes, get_recipe_xp_value, get_component_stats } from "./crafting_recipes.js";
import { skills, crafting_skill_xp_gains_cap } from "./data/skills.js";
import {
         log_message,
        } from "./display.js";
import { item_templates, getItemRarity, rarity_multipliers } from "./items.js";
import { crafting_tags_to_skills } from "./misc.js";
import { run_stats } from "./run_stats.js";
import { translationManager } from "./translation.js";

//The four this still needs from main.js. `language` and `current_location` are live
//bindings - read here, written there - and the other two are the game's own paths for
//granting xp and redrawing.
import { language, current_location, add_xp_to_skill } from "./main.js";
import { update_displayed_component_choice, update_displayed_crafting_recipes, 
         update_displayed_material_choice, update_item_recipe_tooltips, 
         update_item_recipe_visibility } from "./crafting_display.js";
import { update_displayed_character_inventory } from "./inventory_display.js";
function use_recipe(target, ammount_wanted_to_craft = 1) {

    const category = target.parentNode.parentNode.dataset.crafting_category;
    const subcategory = target.parentNode.parentNode.dataset.crafting_subcategory;
    const recipe_id = target.parentNode.dataset.recipe_id;
    const station_tier = current_location.crafting.tiers[category];

    if(!category || !subcategory || !recipe_id) {
        //shouldn't be possible to reach this
        throw new Error(`Tried to use a recipe but either category, subcategory, or recipe id was not passed: ${category} - ${subcategory} - ${recipe_id}`);
    } else if(!recipes[category][subcategory][recipe_id]) {
        //shouldn't be possible to reach this
        throw new Error(`Tried to use a recipe that doesn't exist: ${category} -> ${subcategory} -> ${recipe_id}`);
    } else {
        const selected_recipe = recipes[category][subcategory][recipe_id];
        const recipe_div = document.querySelector(`[data-crafting_category="${category}"][data-crafting_subcategory="${subcategory}"] [data-recipe_id="${recipe_id}"]`);
        let leveled = false;
        let result;
        let xp_to_add;
        if(subcategory === "items") {
            const { available_ammount, materials } = selected_recipe.get_availability();    //TODO check, using new method
            let ammount_that_can_be_crafted = Math.min(ammount_wanted_to_craft, available_ammount);

            let attempted_crafting_ammount = ammount_that_can_be_crafted; //ammount that will be attempted (e.g. 100)
            let successful_crafting_ammount; //ammount that will succeed (e.g. 100 * 75.6% success = 75.6 -> 75 + 60% for another 1)
            //all 3 are 'crafting actions', not result counts

            if(ammount_that_can_be_crafted > 0) { 
                const success_chance = selected_recipe.get_success_chance(station_tier);
                let {result_id, count} = selected_recipe.getResult();

                const scale_results = selected_recipe.scale_results && count > 1;

                const recipe_skill = skills[selected_recipe.recipe_skill];
                const needed_xp = (recipe_skill.total_xp_to_next_lvl - recipe_skill.total_xp) || Infinity;
                //const xp_per_craft = get_recipe_xp_value({category, subcategory, recipe_id});
                const xp_per_craft = Math.min(recipe_skill.xp_to_next_lvl*crafting_skill_xp_gains_cap, get_recipe_xp_value({category, subcategory, recipe_id})*get_skill_xp_gain(recipe_skill.skill_id));
                const estimated_xp_per_craft = xp_per_craft * success_chance;
                const needed_crafts = Math.ceil(needed_xp/estimated_xp_per_craft);
                
                attempted_crafting_ammount = Math.min(needed_crafts, ammount_that_can_be_crafted);
                successful_crafting_ammount = Math.floor(attempted_crafting_ammount*success_chance);
                
                //chance to get 1 more if it was not an integer
                const variable_craft = Math.random()<(attempted_crafting_ammount*success_chance - successful_crafting_ammount)?1:0;
                successful_crafting_ammount += variable_craft;
                
                //const current_gained_xp = (attempted_crafting_ammount-1)*estimated_xp_per_craft + (variable_craft?xp_per_craft:(xp_per_craft/4));
                const current_gained_xp = (successful_crafting_ammount + (attempted_crafting_ammount-successful_crafting_ammount)/4)*xp_per_craft;
                let success = 0;
                let fail = 0;
                
                if(attempted_crafting_ammount < ammount_that_can_be_crafted && current_gained_xp < needed_xp) {
                    //if more can be crafted and failed to get enough for a levelup, try to make up to 3 more (since it's 1/4th per fail and there's already 1 fail)
                    for(let i = 0; i < 2 && attempted_crafting_ammount+success+fail < ammount_that_can_be_crafted; i++) {
                        
                        if(Math.random()<success_chance) {
                            success++;
                        } else {
                            fail++;
                        }
                        
                        if((current_gained_xp + xp_per_craft*(success+fail/4)) >= needed_xp) {
                            break;
                        }
                    }
                    attempted_crafting_ammount += success + fail;
                    successful_crafting_ammount += success;
                }

                xp_to_add = current_gained_xp + xp_per_craft*(success+fail/4);

                run_stats.total_crafting_attempts += attempted_crafting_ammount;
                run_stats.total_crafting_successes += successful_crafting_ammount;

                /*
                    P-22. What actually went in, weighted by how much of it went in.

                    This loop is the only place that knows: get_availability hands back the
                    real inventory entries rather than the recipe's material list, so the
                    stacks being consumed - and the quality each of them carries - are
                    right here, and were being walked past.

                    Only materials that carry a quality are counted, so a recipe whose
                    inputs have none leaves this at 0 and the result is created from the
                    template exactly as it was before. Fishing is the only thing outside
                    crafting that makes a quality today, so today this is the fish.
                */
                let consumed_quality_total = 0;
                let consumed_quality_count = 0;

                //remove used materials
                for (let i = 0; i < selected_recipe.materials.length; i++) {
                    let to_remove = selected_recipe.materials[i].count * attempted_crafting_ammount;

                    for (let j = 0; j < materials[i].items.length && to_remove > 0; j++) {
                        const removed = Math.min(materials[i].items[j].count, to_remove);
                        const key = materials[i].items[j].item.inventory_key;
                        const consumed_quality = materials[i].items[j].item.quality;

                        if(consumed_quality) {
                            consumed_quality_total += consumed_quality * removed;
                            consumed_quality_count += removed;
                        }

                        remove_from_character_inventory([{ item_key: key, item_count: removed }]);

                        to_remove -= removed;
                    }
                }

                const input_quality = consumed_quality_count
                    ? consumed_quality_total/consumed_quality_count
                    : undefined;

                const final_result_count =  count * successful_crafting_ammount; 
                //recipe is either full success or full fail

                const fuzzy_result = count * attempted_crafting_ammount * success_chance;
                const fuzzy_final_result_count = Math.floor(fuzzy_result) + (Math.random()<(fuzzy_result - Math.floor(fuzzy_result))?1:0);
                //recipe can be a partial success; ignores successful_crafting_ammount for crafting gains but still uses it for xp as of now
 
                const final_count = scale_results ? fuzzy_final_result_count : final_result_count;

                if(final_count) {
                    /*
                        One roll for the batch, because this branch is a batch: it makes
                        final_count of one thing in one call and never loops per item, so
                        a mixed bucket of fish cooks into a batch of one quality rather
                        than splitting the stack a dozen ways.

                        No result of an item recipe declares a tier today, so the station's
                        tier contributes nothing; if one ever does, it contributes exactly
                        what it does for a component.
                    */
                    const result_tier = item_templates[result_id].item_tier;
                    const result_key = input_quality
                        ? JSON.stringify({
                            ...JSON.parse(item_templates[result_id].getInventoryKey()),
                            quality: selected_recipe.roll_quality(input_quality,
                                result_tier ? station_tier - result_tier : 0),
                        })
                        : item_templates[result_id].getInventoryKey();

                    add_to_character_inventory([{item_key: result_key, count: final_count}]);
                    const made = item_templates[result_id].getDisplayName();
                    const tried = count * attempted_crafting_ammount;
                    log_message((attempted_crafting_ammount > 1 || scale_results)
                        ? translationManager.getText(language, "log crafting made out of", {v1: made, v2: final_count, v3: tried})
                        : translationManager.getText(language, "log crafting made", {v1: made, v2: final_count}),
                        "crafting");
                } else {
                    const missed = item_templates[result_id].getDisplayName();
                    const tried = count * attempted_crafting_ammount;
                    log_message((attempted_crafting_ammount > 1 || scale_results)
                        ? translationManager.getText(language, "log crafting failed out of", {v1: missed, v2: tried})
                        : translationManager.getText(language, "log crafting failed", {v1: missed, v2: tried}),
                        "crafting");
                }

                leveled = add_xp_to_skill({skill: recipe_skill, xp_to_add: xp_to_add, cap_gained_xp: false, use_bonus: false});
                //no cap, as it was already capped; skip bonus as it was already added
                Object.keys(item_templates[result_id].tags).forEach(tag => {
                    const skill_id = crafting_tags_to_skills[tag];
                    if(skill_id) {
                        let leveled = add_xp_to_skill({skill: skills[skill_id], xp_to_add: xp_to_add/2, cap_gained_xp: true, use_bonus: false});
                        //cap, as it's assumed to not be a crafting skill; skip bonus as it was already added
                        if(leveled) {
                            character.stats.add_active_effect_bonus();
                            update_character_stats();
                            Object.keys(character.inventory).forEach(item_key => {
                                if(character.inventory[item_key].item.tags.medicine) {
                                    //update display if medicine skill leveled up, as it would affect tooltips
                                    update_displayed_character_inventory({item_key});
                                }
                            });
                        }
                    }
                });
                
                if(attempted_crafting_ammount < ammount_that_can_be_crafted) {
                    use_recipe(target, ammount_that_can_be_crafted - attempted_crafting_ammount);
                }
                
                update_item_recipe_visibility();
                update_item_recipe_tooltips();
                
                if(leveled) {
                    //reload all recipe tooltips of matching category, except it's kinda pointless if reload happens anyway?
                }
            } else {
                console.warn(`Tried to use a recipe without having enough materials!`);
            }
            
        } else if(subcategory === "components" || selected_recipe.recipe_type === "component" || selected_recipe.recipe_type === "componentless" ) {
            //either component, clothing, or componentless
            //read the selected material, pass it as param

            const material_div = recipe_div.children[1].querySelector(".selected_material");
            if(!material_div) {
                return;
            } else {
                const material_1_key = material_div.dataset.item_key;
                const {id} = JSON.parse(material_1_key);
                const recipe_material = selected_recipe.materials.filter(x=> x.material_id===id)[0];

                if(recipe_material.count <= character.inventory[material_1_key]?.count) {

                    const recipe_skill = skills[selected_recipe.recipe_skill];
                    let ammount_that_can_be_crafted = Math.min(ammount_wanted_to_craft, Math.floor(character.inventory[material_1_key].count/recipe_material.count));
                    let needed_xp = recipe_skill.total_xp_to_next_lvl - recipe_skill.total_xp;
                    let accumulated_xp = 0;
                    let crafted_items = {};
                    let crafted_count = 0;
                    const all_crafted = {};
                    const result = selected_recipe.getResult(character.inventory[material_1_key].item, station_tier);

                    let quality;

                    for(let i = 0; i < ammount_that_can_be_crafted; i++) {
                        //loop for every item to be crafted, as they differ in quality and resultingly in xp too
                        const result_tier = result.component_tier ?? result.item_tier;
                        /*
                            The selected stack's own quality, which this roll used to
                            ignore - the player picks a specific stack and the pick meant
                            nothing (P-22).

                            It is unreachable as of this version and deliberately wired
                            anyway: no material a component recipe takes has a quality yet
                            (only fishing makes one), and update_displayed_material_choice
                            still keys its rows from the template rather than from the
                            stacks, which is the TODO sitting on it. Leaving the parameter
                            out here is how the item and equipment paths drifted apart to
                            begin with; the mechanism goes in first and the chooser follows
                            when there is a qualitied ingot for it to offer.
                        */
                        quality = selected_recipe.roll_quality(
                            character.inventory[material_1_key].item.quality,
                            station_tier - result_tier);

                        crafted_items[quality] = (crafted_items[quality]+1 || 1);
                        all_crafted[quality] = (all_crafted[quality]+1 || 1);
                        crafted_count++;

                        accumulated_xp += Math.min(
                            recipe_skill.xp_to_next_lvl*crafting_skill_xp_gains_cap, 
                            get_recipe_xp_value({category, subcategory, recipe_id, material_count:recipe_material.count, result_tier: result_tier, rarity_multiplier: rarity_multipliers[getItemRarity(quality)]})* get_skill_xp_gain(recipe_skill.skill_id)
                        );
                        if(accumulated_xp  >= needed_xp) {
                            const qualities = Object.keys(crafted_items).map(x => Number(x)).sort((a,b)=>b-a);
                            const highest_qual = qualities[0];

                            if(crafted_count > 1) {
                                log_message(translationManager.getText(language, "log created v1 x v2 highest", {v1: result.getDisplayName(), v2: crafted_count, v3: highest_qual, v4: crafted_items[highest_qual], v5: Math.floor(accumulated_xp)}), "crafting");
                            } else {
                                log_message(translationManager.getText(language, "log created v1 v2 quality x1", {v1: result.getDisplayName(), v2: highest_qual, v3: Math.floor(accumulated_xp)}), "crafting");
                            }

                            add_xp_to_skill({skill: recipe_skill, xp_to_add: accumulated_xp, cap_gained_xp: false, use_bonus: false});

                            crafted_items = {};
                            crafted_count = 0;
                            accumulated_xp = 0;
                            needed_xp = recipe_skill.total_xp_to_next_lvl - recipe_skill.total_xp;
                        }
                    }
                    run_stats.total_crafting_attempts+=ammount_that_can_be_crafted;
                    run_stats.total_crafting_successes+=ammount_that_can_be_crafted;

                    if(crafted_count > 0) {
                        const qualities = Object.keys(crafted_items).map(x => Number(x)).sort((a,b)=>b-a);
                        const highest_qual = qualities[0];

                        if(crafted_count > 1) {
                            log_message(translationManager.getText(language, "log created v1 x v2 highest", {v1: result.getDisplayName(), v2: crafted_count, v3: highest_qual, v4: crafted_items[highest_qual], v5: Math.floor(accumulated_xp)}), "crafting");

                        } else {
                            log_message(translationManager.getText(language, "log created v1 v2 quality x1", {v1: result.getDisplayName(), v2: highest_qual, v3: Math.floor(accumulated_xp)}), "crafting");
                        }
                        add_xp_to_skill({skill: recipe_skill, xp_to_add: accumulated_xp, cap_gained_xp: false, use_bonus: false});
                    }

                    //grab key, modify it with proper quality value, add (together with count) to list for adding to inv
                    const result_key = result.getInventoryKey();
                    const parsed_key = JSON.parse(result_key);
                    const crafted_qualities = Object.keys(all_crafted).map(x => Number(x));
                    const to_add = [];
                    for(let i = 0; i < crafted_qualities.length; i++ ) {
                        const new_key = JSON.stringify({...parsed_key, quality: crafted_qualities[i]});
                        to_add.push({item_key: new_key, count: all_crafted[crafted_qualities[i]]});
                    }
                    add_to_character_inventory(to_add);

                    //remove used mats
                    remove_from_character_inventory([{item_key: material_1_key, item_count: recipe_material.count*ammount_that_can_be_crafted}]);

                    //update display
                    material_div.classList.remove("selected_material");
                    if(character.inventory[material_1_key]) { 
                        //if item is still present in inventory + if there's not enough of it = change recipe color
                        if(recipe_material.count > character.inventory[material_1_key].count) { 
                            material_div.classList.add("recipe_unavailable");
                        }
                    } else {
                        material_div.remove();
                    }
                    
                    update_displayed_material_choice({category, subcategory, recipe_id, refreshing: true});
                    //update_displayed_crafting_recipes();
                } else {
                    console.log("Tried to create an item without having necessary materials");
                }
            }
            
        } else if (subcategory === "equipment") {
            let ammount_that_can_be_crafted = ammount_wanted_to_craft;
            const comp = [];
            const component_keys = {};

            //read the selected components, pass them as params
            for (var i = 0; i < selected_recipe.components.length; i++) {
                const component_1_key = recipe_div.children[1].children[i].children[1].querySelector(".selected_component")?.dataset.item_key;
                if(!component_1_key) {
                    return;
                }
                if(!character.inventory[component_1_key] || !character.inventory[component_1_key].count) {
                    //a probably unnecessary check to see if they are actually in inventory
                    //no need to check how many there is as crafting always takes only 1
                    throw new Error(`Tried to create item with components that are not present in the inventory!`);
                }

                ammount_that_can_be_crafted = Math.min(ammount_that_can_be_crafted, character.inventory[component_1_key].count);
                comp.push(character.inventory[component_1_key]);
                component_keys[component_1_key] = true;
            }

            const recipe_skill = skills[selected_recipe.recipe_skill]; //should always be "Crafting" but who knows what changes in the future?
            let needed_xp = recipe_skill.total_xp_to_next_lvl - recipe_skill.total_xp;
            let accumulated_xp = 0;
            let crafted_items = {};
            let crafted_count = 0;
            const all_crafted = {};
            const result = selected_recipe.getResult(comp, station_tier);

            let quality;

            const component_stats = get_component_stats(comp);

            const comp_quality_weighted = component_stats.weighted_quality;
            const comp_tier_max = component_stats.max_tier;

            for(let i = 0; i < ammount_that_can_be_crafted; i++) {
                quality = selected_recipe.roll_quality(comp_quality_weighted, station_tier-comp_tier_max);

                crafted_items[quality] = (crafted_items[quality]+1 || 1);
                all_crafted[quality] = (all_crafted[quality]+1 || 1);
                crafted_count++;

                accumulated_xp += Math.min(
                    recipe_skill.xp_to_next_lvl, 
                    get_recipe_xp_value({category, subcategory, recipe_id, selected_components: comp, rarity_multiplier: rarity_multipliers[getItemRarity(quality)]})*get_skill_xp_gain(recipe_skill.skill_id)
                );
                            
                if(accumulated_xp >= needed_xp) {
                    const qualities = Object.keys(crafted_items).map(x => Number(x)).sort((a,b)=>b-a);
                    const highest_qual = qualities[0];

                    if(crafted_count > 1) {
                        log_message(translationManager.getText(language, "log created v1 x v2 highest", {v1: result.getDisplayName(), v2: crafted_count, v3: highest_qual, v4: crafted_items[highest_qual], v5: Math.floor(accumulated_xp)}), "crafting");
                    } else {
                        log_message(translationManager.getText(language, "log created v1 v2 quality x1", {v1: result.getDisplayName(), v2: highest_qual, v3: Math.floor(accumulated_xp)}), "crafting");
                    }

                    add_xp_to_skill({skill: recipe_skill, xp_to_add: accumulated_xp, use_bonus: false, cap_gained_xp: false});

                    crafted_items = {};
                    crafted_count = 0;
                    accumulated_xp = 0;
                    needed_xp = recipe_skill.total_xp_to_next_lvl - recipe_skill.total_xp;
                }
            }

            run_stats.total_crafting_attempts+=ammount_that_can_be_crafted;
            run_stats.total_crafting_successes+=ammount_that_can_be_crafted;

            if(crafted_count > 0) {
                const qualities = Object.keys(crafted_items).map(x => Number(x)).sort((a,b)=>b-a);
                const highest_qual = qualities[0];

                if(crafted_count > 1) {
                    log_message(translationManager.getText(language, "log created v1 x v2 highest", {v1: result.getDisplayName(), v2: crafted_count, v3: highest_qual, v4: crafted_items[highest_qual], v5: Math.floor(accumulated_xp)}), "crafting");

                } else {
                    log_message(translationManager.getText(language, "log created v1 v2 quality x1", {v1: result.getDisplayName(), v2: highest_qual, v3: Math.floor(accumulated_xp)}), "crafting");
                }
                add_xp_to_skill({skill: recipe_skill, xp_to_add: accumulated_xp, use_bonus: false, cap_gained_xp: false});
            }

            //grab key, modify it with proper quality value, add (together with count) to list for adding to inv
            const result_key = result.getInventoryKey();
            const parsed_key = JSON.parse(result_key);
            const crafted_qualities = Object.keys(all_crafted).map(x => Number(x));
            const to_add = [];
            for(let i = 0; i < crafted_qualities.length; i++ ) {
                const new_key = JSON.stringify({...parsed_key, quality: crafted_qualities[i]});
                to_add.push({item_key: new_key, count: all_crafted[crafted_qualities[i]]});
            }
            add_to_character_inventory(to_add);

            //remove used mats
            for (let i in comp) {
                remove_from_character_inventory([{ item_key: comp[i].item.getInventoryKey(), item_count: ammount_that_can_be_crafted }]);
            }

            update_displayed_component_choice({ category, subcategory, recipe_id, component_keys });
        }  
    }
}

export { use_recipe };
