/** The crafting window: its pages, its recipe rows and its component pickers. */

import { character } from "./character.js";
import { current_location, language, language_tags } from "./main.js";
import { Armor, Shield, Weapon, item_log, item_templates } from "./items.js";
import { clear_HTML_content, insert_HTML, is_element_above_x, remove_class_from_all,
         set_HTML, toggle_exclusive_class } from "./ui_helpers.js";
import { find_recipe_material, recipes } from "./crafting_recipes.js";
import { translationManager } from "./translation.js";
import { create_item_tooltip, create_recipe_tooltip_content } from "./item_tooltips.js";
import { action_div, update_displayed_normal_location } from "./display.js";

/*
    Two names come back out of display.js: action_div, which is a DOM handle taken once
    at module scope there, and update_displayed_normal_location, which redraws the panel
    this window sits in. Both are used inside these functions and never while this module
    is being evaluated, so display.js can still be part-built when this one is entered.
*/

const crafting_pages = {};

let selected_crafting_category;

let selected_crafting_subcategory;

function open_crafting_window() {
    action_div.style.display = "none";
    document.getElementById("crafting_window").style.display = "flex";

    //only show available categories
    let first_available_category = null;

    const elements = document.getElementById('crafting_mainpage_buttons').children;
    for (let i = 0; i < elements.length; i++) {
        let is_available = current_location.crafting.tiers[elements[i].dataset.crafting_category]

        elements[i].style.display = is_available ? "" : "none";
        //TODO maybe just graying it out would make more obvious what is happening?

        if (is_available && !first_available_category) {
            first_available_category = elements[i];
        }
        if (!is_available && selected_crafting_category == elements[i].dataset.crafting_category) {
            selected_crafting_category = null;
        }
    }

    if (!selected_crafting_category || !selected_crafting_subcategory) {
        if (!first_available_category) {
            throw new Error(`${current_location} has crafting enabled but no available crafting stations!`);
        }

        first_available_category.click();
    }

    update_displayed_crafting_recipes();
}

function close_crafting_window() {
    action_div.style.display = "block";
    document.getElementById("crafting_window").style.display = "none";
    update_displayed_normal_location(current_location);
}

/**
 * switches between main pages of crafting menu (crafting, alchemy, cooking, etc)
 * @param {String} category 
 */
function switch_crafting_recipes_page(category) {
    selected_crafting_category = category;

    //only show buttons for subcategories that exist
    const elements = document.getElementById('crafting_subpage_buttons').children;
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = recipes[category][elements[i].dataset.crafting_subcategory] ? "" : "none";
    }

    elements[0].click();

    unexpand_displayed_recipes();
}

/**
 * switches between subpages of a crafting page (items-components-equipment)
 * @param {String} category 
 * @param {String} subcategory 
 */
function switch_crafting_recipes_subpage(subcategory) {
    selected_crafting_subcategory = subcategory;

    const elements = document.querySelectorAll(`[data-crafting_category][data-crafting_subcategory]`);
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].dataset.crafting_category == selected_crafting_category && elements[i].dataset.crafting_subcategory == selected_crafting_subcategory) {
            elements[i].style.display = "";
        }
        else {
            elements[i].style.display = "none";
        }
    }

    unexpand_displayed_recipes();
}

function unexpand_displayed_recipes() {
    const classes = ["selected_recipe", "selected_component_list", "selected_component_category"];
    for(let i = 0; i < classes.length; i++) {
        const elements = document.getElementsByClassName(classes[i]);
        for(let j = 0 ; j < elements.length; j++) {
            elements[j].classList.remove(classes[i]);
        }
    }
}

function get_recipe_page(category, subcategory) {
    if (!crafting_pages[category]) {
        crafting_pages[category] = {};
    }
    if (!crafting_pages[category][subcategory]) {
        crafting_pages[category][subcategory] = document.querySelector(`[data-crafting_category="${category}"][data-crafting_subcategory="${subcategory}"]`);
    }
    if (!crafting_pages[category][subcategory]) {
        let new_category = document.createElement('div');
        new_category.classList.add("crafting_category");
        new_category.classList.add("crafting_recipe_list");
        new_category.dataset.crafting_category = category;
        new_category.dataset.crafting_subcategory = subcategory;


        crafting_pages[category][subcategory] = document.getElementById("recipe_categories").appendChild(new_category);
    }

    return crafting_pages[category][subcategory];
}

function create_displayed_crafting_recipes() {
    Object.keys(recipes).forEach(recipe_category => {
        Object.keys(recipes[recipe_category]).forEach(recipe_subcategory => {
            if(recipe_subcategory === "items") {
                clear_HTML_content(get_recipe_page(recipe_category, recipe_subcategory));
            }
            Object.keys(recipes[recipe_category][recipe_subcategory]).forEach(recipe => {
                add_crafting_recipe_to_display({category: recipe_category, subcategory: recipe_subcategory, recipe_id: recipe});
            });
        });
    });

    update_item_recipe_visibility();
}

function add_crafting_recipe_to_display({ category, subcategory, recipe_id }) {
    if (!recipes[category] || !recipes[category][subcategory] || !recipes[category][subcategory][recipe_id]) {
        throw new Error(`No such recipe as "${subcategory}/${subcategory}/${recipe_id}"`);
    }

    const recipe = recipes[category][subcategory][recipe_id];
    if(!recipe.is_unlocked) {
        return;
    }
    const recipe_div = document.createElement("div");

    const recipe_name_span = document.createElement("span");
    //Most recipe names are the name of the item they produce, so they resolve
    //through the same flat display-name namespace; the crafting category names
    //("Short blade", "Chestplate") have rows of their own.
    recipe_name_span.innerText = translationManager.getDisplayName(language, recipe.name);

    recipe_div.append(recipe_name_span);
    recipe_div.classList.add("recipe_div");
    recipe_div.dataset.recipe_id = recipe_id;

    if(subcategory === "items") {
        recipe_name_span.classList.add("recipe_item_name");
        const result_count = recipe.getResult().count;
        set_HTML(recipe_div.children[0], '<i class="material-icons icon" style="visibility:hidden"> keyboard_double_arrow_down </i>' + recipe_div.children[0].innerText + (result_count>1?` x${result_count}`:''));
        //invisible icon added just so it properly matches in height and text position with recipes in other subcategories
        if(!recipe.get_availability().available_ammount) {
            recipe_div.classList.add("recipe_unavailable");
        }

        recipe_div.addEventListener("click", (event)=>{
            if(event.target.classList.contains("recipe_item_name") && !event.target.parentNode.classList.contains("recipe_unavailable")) {
                window.useRecipe(event.target);
            } else if(event.target.classList.contains("craft_ammount_button")) {
                window.useRecipe(event.target.parentNode, Number(event.target.dataset.craft_ammount));
            }
        });
        recipe_div.append(create_craft_amount_buttons());
        recipe_div.append(create_recipe_tooltip({category, subcategory, recipe_id}));
    } else if(subcategory === "components") {
        recipe_name_span.classList.add("recipe_name");
        set_HTML(recipe_div.children[0], '<i class="material-icons icon crafting_dropdown_icon"> keyboard_double_arrow_down </i>' + recipe_div.children[0].innerText);
        const material_selection = document.createElement("div");
        material_selection.classList.add("folded_material_list");
        recipe_div.addEventListener("click", (event)=>{
            if(event.target.classList.contains("recipe_name") || event.target.classList.contains("crafting_dropdown_icon")) {
                window.updateDisplayedMaterialChoice({category, subcategory, recipe_id});
                toggle_exclusive_class({element: recipe_div, class_name: "selected_recipe"});
            } 
        });

        recipe_div.append(material_selection);
    } else if(recipe.recipe_type === "component" || recipe.recipe_type === "componentless") {
        //component but from other category, which generally means clothing, or componentless, which currently means only capes
        
        recipe_name_span.classList.add("recipe_name");
        
        if(recipe.item_type === "Armor") {
            recipe_div.classList.add("clothing_recipe");
        }

        set_HTML(recipe_div.children[0], '<i class="material-icons icon crafting_dropdown_icon"> keyboard_double_arrow_down </i>' + recipe_div.children[0].innerText);
        const material_selection = document.createElement("div");
        material_selection.classList.add("folded_material_list");
        recipe_div.addEventListener("click", (event)=>{
            if(event.target.classList.contains("recipe_name") || event.target.classList.contains("crafting_dropdown_icon")) {

                remove_class_from_all("selected_component_list");
                remove_class_from_all("selected_component_category");
                
                window.updateDisplayedMaterialChoice({category, subcategory, recipe_id});
                toggle_exclusive_class({element: recipe_div, class_name: "selected_recipe"});
            } 
        });

        recipe_div.append(material_selection);
    } else if(subcategory === "equipment") {
        if(recipe.item_type === "Armor") {
            recipe_div.classList.add("armor_recipe");
        } else if(recipe.item_type === "Weapon") {
            recipe_div.classList.add("weapon_recipe");
        } else if(recipe.item_type === "Shield") {
            recipe_div.classList.add("shield_recipe");
        } else {
            console.warn(`Recipe "${category}" -> "${subcategory}" -> "${recipe_id}" has wrong type of resulting item ("${recipe.item_type}")`)
        }

        recipe_name_span.classList.add("recipe_name");
        
        set_HTML(recipe_div.children[0], '<i class="material-icons icon crafting_dropdown_icon"> keyboard_double_arrow_down </i>' +  recipe_div.children[0].innerText);

        const component_selections = document.createElement("div");

        for (var i = 0; i < recipe.components.length; i++) {
            const component_selection = document.createElement("div");

            set_HTML(component_selection, `<span class="crafting_selection"><i class="material-icons icon subcrafting_dropdown_icon"> keyboard_double_arrow_down </i>${translationManager.getText(language, "ui select a component", {v1: translationManager.getText(language, `component ${recipe.components[i]}`)})}</span>`);
        
            const component_list = document.createElement("div");
            component_selection.appendChild(component_list);

            component_selections.append(component_selection);
        }

        recipe_div.addEventListener("click", (event)=>{
            if(event.target.classList.contains("recipe_name") || event.target.classList.contains("crafting_dropdown_icon")) {

                remove_class_from_all("selected_component_list");
                remove_class_from_all("selected_component_category");

                toggle_exclusive_class({element: recipe_div, class_name: "selected_recipe"});

                window.updateDisplayedComponentChoice({category, subcategory, recipe_id});

                update_recipe_tooltip({category, subcategory, recipe_id, components: []});
            }
        });

        const accept_recipe_button = document.createElement("div");
        insert_HTML(accept_recipe_button, "<span class='recipe_creation_span'>"
            + translationManager.getText(language, "ui recipe create") + "</span>");

        accept_recipe_button.classList.add("recipe_creation_button");
        accept_recipe_button.append(create_craft_amount_buttons());

        accept_recipe_button.addEventListener("click", (event)=>{
            if(event.target.classList.contains("recipe_creation_button")) {
                window.useRecipe(event.target);
            } else if(!event.target.classList.contains("craft_ammount_button")) {
                window.useRecipe(event.target.parentNode);
            } else {
                window.useRecipe(event.target.parentNode.parentNode, Number(event.target.dataset.craft_ammount));
            }
        });

        recipe_div.append(component_selections);
        recipe_div.append(accept_recipe_button);
        accept_recipe_button.append(create_recipe_tooltip({category, subcategory, recipe_id, components: []}));
    } else {
        throw new Error(`No such crafting subcategory as "${subcategory}"`);
    }

    get_recipe_page(category, subcategory).appendChild(recipe_div);
}

function create_craft_amount_buttons() {
    const craft_amount_buttons = document.createElement("div");
    craft_amount_buttons.classList.add("craft_ammount_buttons");
        
    const button_5 = document.createElement("div");
    button_5.innerText = "5";
    button_5.dataset.craft_ammount = 5;
    button_5.classList.add("craft_ammount_button");
    craft_amount_buttons.append(button_5);

    const button_10 = document.createElement("div");
    button_10.innerText = "10";
    button_10.dataset.craft_ammount = 10;
    button_10.classList.add("craft_ammount_button");
    craft_amount_buttons.append(button_10);

    const button_all = document.createElement("div");
    button_all.innerText = "all";
    button_all.dataset.craft_ammount = Infinity;
    button_all.classList.add("craft_ammount_button");

    craft_amount_buttons.append(button_all);

    return craft_amount_buttons;
}

/**
 * updates all displayed recipes; 
 * needs to be called whenever something is crafted (in case some recipe became unavailable due to lack of materials) and/or whenever a crafting-related skill levels up
 */
function update_displayed_crafting_recipes() {
    Object.keys(recipes).forEach(recipe_category => {
        Object.keys(recipes[recipe_category]).forEach(recipe_subcategory => {
            Object.keys(recipes[recipe_category][recipe_subcategory]).forEach(recipe => {
                if(recipes[recipe_category][recipe_subcategory][recipe].is_unlocked){
                    //get_recipe_page rather than crafting_pages directly: the map is filled
                    //lazily by create_displayed_crafting_recipes, so if that has not run for
                    //a category this used to throw "Cannot read properties of undefined
                    //(reading 'items')" - which is how one failure earlier in startup turned
                    //into two errors in the console.
                    if(get_recipe_page(recipe_category, recipe_subcategory).querySelector(`[data-recipe_id="${recipe}"]`)) {
                        update_displayed_crafting_recipe({category: recipe_category, subcategory: recipe_subcategory, recipe_id: recipe});
                    } else {
                        add_crafting_recipe_to_display({category: recipe_category, subcategory: recipe_subcategory, recipe_id: recipe});
                    }
                }
            })
        })
    });
}

/**
 * updates description and display color, based on resource availability and skill lvl
 */
function update_displayed_crafting_recipe({category, subcategory, recipe_id}) {
    const recipe_div = crafting_pages[category][subcategory].querySelector(`[data-recipe_id="${recipe_id}"]`);
    const recipe = recipes[category][subcategory][recipe_id];

    if(subcategory === "items") {
        if(recipe.get_availability().available_ammount) {
            recipe_div.classList.remove("recipe_unavailable");
        } else {
            recipe_div.classList.add("recipe_unavailable");
        }
        update_recipe_tooltip({category, subcategory, recipe_id});
    } else if (subcategory === "components" || recipe.recipe_type === "component") {
        //if(recipe.get_availability().available_ammount) {
        //    recipe_div.classList.remove("recipe_unavailable");
        //} else {
        //    recipe_div.classList.add("recipe_unavailable");
        //}
        update_recipe_tooltip({category, subcategory, recipe_id});
    } else if (subcategory === "equipment") {
        //if(recipe.get_availability().available_ammount) {
        //    recipe_div.classList.remove("recipe_unavailable");
        //} else {
        //    recipe_div.classList.add("recipe_unavailable");
        //}
        //update_recipe_tooltip({category, subcategory, recipe_id, material: null, components: []});
        //shouldn't actually be needed as tooltip already updates when opening recipe and when selecting components
    } else {
        console.error(`No such crafting subcategory as "${subcategory}"`);
    }
}

/**
 * creates a tooltip for the >final result<
 */
function create_recipe_tooltip({category, subcategory, recipe_id, material, components}) {
    const recipe = recipes[category][subcategory][recipe_id];
    const tooltip = document.createElement("div");
    tooltip.classList.add("recipe_tooltip");
    if(subcategory === "items") {
        set_HTML(tooltip, create_recipe_tooltip_content({category, subcategory, recipe_id}));
        tooltip.classList.add("items_recipe_tooltip");
    } else if(subcategory === "components" || recipe.recipe_type === "component") {
        if(!material) {
            throw new Error(`Component recipes require passing a material, but recipe "${category}" -> "${subcategory}" -> "${recipe_id}" had none!`);
        }
        set_HTML(tooltip, create_recipe_tooltip_content({category, subcategory, recipe_id, material}));
        tooltip.classList.add("component_recipe_tooltip");
    } else if(subcategory === "equipment") {
        set_HTML(tooltip, create_recipe_tooltip_content({category, subcategory, recipe_id, material, components}));
        tooltip.classList.add("equipment_recipe_tooltip");
    } else {
        console.error(`No such crafting subcategory as "${subcategory}"`);
    }
    return tooltip;
}

function update_item_recipe_tooltips() {
    Object.keys(recipes).forEach(recipe_category => {
        Object.keys(recipes[recipe_category]).forEach(recipe_subcategory => {
            if(recipe_subcategory === "items") {
                Object.keys(recipes[recipe_category][recipe_subcategory]).forEach(recipe => {
                    if(recipes[recipe_category][recipe_subcategory][recipe].is_unlocked){
                        update_recipe_tooltip({category: recipe_category, subcategory: "items", recipe_id: recipe});
                    }
                });
            }
        });
    });
}

function update_recipe_tooltip({category, subcategory, recipe_id, components}) {
    const recipe = recipes[category][subcategory][recipe_id];
    if(subcategory === "items") {
        const tooltip = crafting_pages[category][subcategory].querySelector(`[data-recipe_id="${recipe_id}"]`).querySelector(`.${subcategory}_recipe_tooltip`);

        set_HTML(tooltip, create_recipe_tooltip_content({category, subcategory, recipe_id}));
    } else if(subcategory === "components" || recipe.recipe_type === "component" || recipe.recipe_type === "componentless") {
        const material_selections_div = crafting_pages[category][subcategory].querySelector(`[data-recipe_id='${recipe_id}']`).children[1];
        for(let i = 0; i < material_selections_div.children.length; i++) {
            const tooltip = material_selections_div.children[i].querySelector(`[data-recipe_id="${recipe_id}"]`)?.querySelector(`.${subcategory}_recipe_tooltip`);
            if(!tooltip) {
                return;
            }
            const material_key = material_selections_div.children[i].dataset.item_key;
            const {id} = JSON.parse(material_key);
            const material_recipe = recipe.materials.filter(material => material.material_id === id);
            
            set_HTML(tooltip, create_recipe_tooltip_content({category, subcategory, recipe_id, material: material_recipe[0]}));
        }
    } else if(subcategory === "equipment") {
        const tooltip = crafting_pages[category][subcategory].querySelector(`[data-recipe_id="${recipe_id}"]`)?.querySelector(`.${subcategory}_recipe_tooltip`);
        if(!tooltip) {
            return;
        }
        set_HTML(tooltip, create_recipe_tooltip_content({category, subcategory, recipe_id, components}));
    } else {
        console.error(`No such crafting subcategory as "${subcategory}"`);
    }
}

/**
 * 
 * updates the list of selectable components for equipment crafting;
 * generally called for the recipe that was just used
 * @param {Object} data
 * @param {Object} data.category
 * @param {Object} data.subcategory
 * @param {Object} data.recipe_id
 * @param {Object} data.component_keys used to automatically select components with passed keys (to keep them selected after crafting was performed and display was reloaded)
 * 
 * @returns 
 */
function update_displayed_component_choice({category, subcategory, recipe_id, component_keys = {}}) {
    const recipe_div = crafting_pages[category][subcategory].querySelector(`[data-recipe_id="${recipe_id}"]`);
    const recipe = recipes[category][subcategory][recipe_id];

    if (!recipe.components) {
        return;
    }

    const component_selections_div = crafting_pages[category][subcategory].querySelector(`[data-recipe_id='${recipe_id}']`).children[1].children;

    for (let i = 0; i < recipe.components.length; i++) {
        clear_HTML_content(component_selections_div[i].children[1]);

        const components = Object.values(character.inventory)
            .filter(item => recipe.components[i] === item.item.component_type)
            .sort((a, b) => {
                if (a.item.component_tier != b.item.component_tier) {
                    return b.item.component_tier - a.item.component_tier;
                } else if (a.item.getDisplayName() !== b.item.getDisplayName()) {
                    //Two bugs lived here. Items have no "item_name" property - the
                    //name is reached through an accessor - so the condition compared
                    //undefined against undefined and was never true, which made this
                    //whole tier dead code. And the body returned b minus b, which is
                    //zero for numbers and NaN for the strings these actually are.
                    //Sorting follows getDisplayName(), not getName(): the list has to
                    //be ordered by what is on screen, and localeCompare because the
                    //names are displayed text.
                    return a.item.getDisplayName().localeCompare(b.item.getDisplayName(), language_tags[language]);
                } else {
                    return b.item.quality - a.item.quality;
                }
        });

        for(let j = 0; j < components.length; j++) {
            const item_div = document.createElement("div");
            insert_HTML(item_div, `<i class="material-icons icon selected_component_icon"> check </i>${components[j].item.getDisplayName()}, ${components[j].item.quality}%, x${components[j].count}`);
            item_div.classList.add("selectable_component");
            item_div.dataset.item_key = components[j].item.getInventoryKey();
            item_div.dataset.item_quality = components[j].item.quality;
            item_div.dataset.item_name = components[j].item.getName();
            item_div.dataset.component_tier = components[j].item.component_tier;
            item_div.appendChild(create_item_tooltip(components[j].item, {class_name: "recipe_tooltip"}));
            
            item_div.addEventListener("click", () => {
                toggle_exclusive_class({element: item_div, siblings_only: true, class_name: "selected_component"});
                const components = [];
                const component_1_key = recipe_div.children[1].children[0].children[1].querySelector(".selected_component")?.dataset.item_key;
                if(component_1_key && character.inventory[component_1_key]) {
                    components.push(character.inventory[component_1_key]);
                }

                const component_2_key = recipe_div.children[1].children[1].children[1].querySelector(".selected_component")?.dataset.item_key;
                if(component_2_key && character.inventory[component_2_key]) {
                    components.push(character.inventory[component_2_key]);
                }
                update_recipe_tooltip({category, subcategory, recipe_id, components});
            });
                
            component_selections_div[i].children[1].appendChild(item_div);

            if(component_keys[item_div.dataset.item_key]) {
                item_div.click();
            }
        }
    }

    if(!is_element_above_x(recipe_div.querySelector(".recipe_creation_button"), document.getElementById("exit_crafting_button"))) {
        recipe_div.querySelector(".recipe_creation_button").scrollIntoView({block: "end", inline: "nearest"});
    }
}

/**
 * updates the list of selectable materials for component crafting;
 * displays only the materials available in inventory; those that are in too low number are grayed out and unselectable
 */
function update_displayed_material_choice({category, subcategory, recipe_id, refreshing}) {
    const recipe = recipes[category][subcategory][recipe_id];

    const material_selections_div = crafting_pages[category][subcategory].querySelector(`[data-recipe_id='${recipe_id}']`).children[1];
    
    clear_HTML_content(material_selections_div);

    if (!recipe.materials) {
        return;
    }

    for (let i = 0; i < recipe.materials.length; i++) {
        const material_recipe = recipe.materials[i];

        //hide recipes which use undiscovered materials
        if (!item_log.is_known(material_recipe.material_id)) {
            continue;
        }

        const material = find_recipe_material({material: material_recipe, ignore_stop: true}); //TODO currently doesn't support items with quality

        const item_div = document.createElement("div");
        const name_span = document.createElement("span");
        insert_HTML(name_span, `<i class="material-icons icon selected_material_icon"> check </i>${item_templates[material_recipe.result_id].getDisplayName()}`);
        name_span.classList.add("recipe_comp_name");
        item_div.append(name_span);
        item_div.classList.add("selectable_material");
        item_div.dataset.item_key = item_templates[material_recipe.material_id].getInventoryKey();

        if(material_recipe.count <= material.count) {
            item_div.addEventListener("click", (event)=>{
                item_div.classList.add("selected_material");
                if(event.target.classList.contains("selectable_material")) {
                    window.useRecipe(event.target.parentNode);
                } else if(!event.target.classList.contains("craft_ammount_button")) {
                    window.useRecipe(event.target.parentNode.parentNode);
                } else{
                    window.useRecipe(event.target.parentNode.parentNode.parentNode, Number(event.target.dataset.craft_ammount));
                }
                item_div.classList.remove("selected_material"); //this is so stupid
            });
        } else {
            item_div.classList.add("recipe_unavailable");
        }

        item_div.append(create_craft_amount_buttons());
        item_div.append(create_recipe_tooltip({category, subcategory, recipe_id, material: material_recipe}));
        material_selections_div.appendChild(item_div);
    }
    if(!refreshing) {
        material_selections_div.lastChild?.scrollIntoView();
    }
}

function update_item_recipe_visibility() {
    Object.keys(recipes).forEach(recipe_category => {
        Object.keys(recipes[recipe_category]).forEach(recipe_subcategory => {
            if(recipe_subcategory !== "items") {
                //no need to deal with other recipe types as they would be folded and will be reloaded on unfolding
                return;
            }
            Object.keys(recipes[recipe_category][recipe_subcategory]).forEach(recipe => {
                if(!recipes[recipe_category][recipe_subcategory][recipe].is_unlocked) {
                    return;
                }
                const recipe_div = crafting_pages[recipe_category][recipe_subcategory].querySelector(`[data-recipe_id="${recipe}"`);
                if(!recipes[recipe_category][recipe_subcategory][recipe].get_availability().available_ammount) {
                    recipe_div.classList.add("recipe_unavailable");
                } else {
                    recipe_div.classList.remove("recipe_unavailable");
                }
            });
        })
    });
}

export {
    close_crafting_window,
    create_displayed_crafting_recipes,
    open_crafting_window,
    switch_crafting_recipes_page,
    switch_crafting_recipes_subpage,
    update_displayed_component_choice,
    update_displayed_crafting_recipes,
    update_displayed_material_choice,
    update_item_recipe_tooltips,
    update_item_recipe_visibility,
    update_recipe_tooltip,
};
