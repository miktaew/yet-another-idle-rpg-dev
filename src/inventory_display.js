/** The three inventories and the trade window, which share their sorting and rows. */

import { character, tool_slots } from "./character.js";
import { current_location, favourite_consumables, favourite_items, get_current_book,
         language, language_tags } from "./main.js";
import { translationManager } from "./translation.js";
import { clear_HTML_content, compare_display_names, insert_HTML, set_HTML } from "./ui_helpers.js";
import { book_stats, getItemFromKey, item_templates } from "./items.js";
import { player_storage } from "./data/storage.js";
import { traders } from "./traders.js";
import { current_trader, to_buy, to_sell } from "./trade.js";
import { round_item_price } from "./misc.js";
import { create_item_tooltip, rarity_colors, rarity_outlines } from "./item_tooltips.js";
import { action_div, format_money, trade_div, update_displayed_quest_item_counts } from "./display.js";

/*
    Four names come back out of display.js: two DOM handles it takes once at module
    scope, the money formatter, and the quest-counter redraw. All four are used inside
    these functions and never while this module is being evaluated, so display.js can
    still be part-built when this one is entered.
*/

const inventory_div = document.getElementById("inventory_content_div");

let item_divs = {};

let trader_item_divs = {};

let storage_item_divs = {};

let item_buying_divs = {};

let item_selling_divs = {};

const trader_inventory_div = document.getElementById("trader_inventory_div");

const storage_inventory_div = document.getElementById("storage_inventory_div");

let trader_inventory_sorting = "name";

let trader_inventory_sorting_direction = "asc";

let storage_sorting = "name";

let storage_sorting_direction = "asc";

let character_inventory_sorting = "name";

let character_inventory_sorting_direction = "asc";

/**
 * How the player's own lists are sorted, for the save to carry.
 *
 * The character's inventory and the storage only. A trader's sort is left out on purpose:
 * that panel is opened per trader and closed with the trade, so it has no "last time" to
 * return to - and it is the one target with three sort buttons rather than four, since a
 * trader's stock has no order the player picked things up in.
 */
function inventory_sorting_state() {
    return {
        character: {by: character_inventory_sorting,
                    direction: character_inventory_sorting_direction},
        storage: {by: storage_sorting, direction: storage_sorting_direction},
    };
}

/** The sort buttons, per target, keyed by the sort they choose. */
const sorting_button_ids = {
    character: (by) => `inventory_sort_by_${by}`,
    storage: (by) => `storage_sort_by_${by}`,
};

/**
 * Puts a target's sort back, button highlight included.
 *
 * The highlight is the half that is easy to forget, because nothing in the drawing code
 * touches it: `set_active_button` in index.html moves it on click and that is the only
 * thing that ever does. Restore the sort without it and the list comes back ordered by
 * "latest" with "name" still lit, which is a worse state than not remembering at all -
 * the panel would be lying about itself rather than merely forgetting.
 *
 * Not `toggle_exclusive_class`, which is a toggle: handed the button that is already
 * active - "name", the common case - it would take the highlight off and leave nothing
 * lit. This has to set, not toggle.
 *
 * A sort this version no longer offers is ignored rather than trusted, so an old save
 * cannot leave the list sorted by something with no button to say so.
 */
function restore_inventory_sorting(saved) {
    if(!saved || typeof saved !== "object") {
        return;
    }
    for(const [target, ids] of Object.entries(sorting_button_ids)) {
        const wanted = saved[target];
        if(!wanted) {
            continue;
        }
        const button = document.getElementById(ids(wanted.by));
        if(!button) {
            continue;
        }
        if(target === "character") {
            character_inventory_sorting = wanted.by;
            character_inventory_sorting_direction = wanted.direction === "desc" ? "desc" : "asc";
        } else {
            storage_sorting = wanted.by;
            storage_sorting_direction = wanted.direction === "desc" ? "desc" : "asc";
        }
        for(const sibling of button.parentNode.children) {
            sibling.classList.remove("active_selection_button");
        }
        button.classList.add("active_selection_button");
    }
}

const equipment_slots_divs = {head: document.getElementById("head_slot"), torso: document.getElementById("torso_slot"),
                              arms: document.getElementById("arms_slot"), ring: document.getElementById("ring_slot"),
                              weapon: document.getElementById("weapon_slot"), "off-hand": document.getElementById("off-hand_slot"),
                              legs: document.getElementById("legs_slot"), feet: document.getElementById("feet_slot"),
                              amulet: document.getElementById("amulet_slot"), artifact: document.getElementById("artifact_slot"),
                              cape: document.getElementById("cape_slot"),
                              pickaxe: document.getElementById("pickaxe_slot"),
                              axe: document.getElementById("axe_slot"),
                              sickle: document.getElementById("sickle_slot"),
                              shovel: document.getElementById("shovel_slot"),
                              fishing_pole: document.getElementById("fishing_slot"),
};

function update_displayed_trader() {
    action_div.style.display = "none";
    trade_div.style.display = "flex";
    document.getElementById("trader_cost_mult_value").textContent = `${Math.round(100 * (traders[current_trader].getProfitMargin(current_location.market_region)))}%`
    update_displayed_trader_inventory();
}

/**
 * 
 * @returns {HTMLElement}
 */
function create_trade_buttons() {

    const trade_buttons = document.createElement("div");
    trade_buttons.classList.add("trade_ammount_buttons");

    const trade_button_5 = document.createElement("div");
    trade_button_5.classList.add("trade_ammount_button");
    trade_button_5.innerText = "5";
    trade_button_5.setAttribute("data-trade_ammount", 5);
    trade_buttons.appendChild(trade_button_5);

    const trade_button_10 = document.createElement("div");
    trade_button_10.classList.add("trade_ammount_button");
    trade_button_10.innerText = "10";
    trade_button_10.setAttribute("data-trade_ammount", 10);
    trade_buttons.appendChild(trade_button_10);

    const trade_button_max = document.createElement("div");
    trade_button_max.classList.add("trade_ammount_button");
    trade_button_max.innerText = "all";
    trade_button_max.setAttribute("data-trade_ammount", Infinity);
    trade_buttons.appendChild(trade_button_max);
    
    return trade_buttons;
}

function sort_displayed_inventory({sort_by, target = "character", change_direction = false}) {
    let plus;
    let minus;
    if(target === "trader") {
        if(sort_by){
            if(change_direction) {
                if(sort_by === trader_inventory_sorting) {
                    if(trader_inventory_sorting_direction === "asc") {
                        trader_inventory_sorting_direction = "desc";
                    } else {
                        trader_inventory_sorting_direction = "asc";
                    }
                } else {
                    trader_inventory_sorting_direction = "asc";
                }
            }
        } else {
            sort_by = trader_inventory_sorting;
        }

        target = trader_inventory_div;
        plus = trader_inventory_sorting_direction==="asc"?1:-1;
        minus = trader_inventory_sorting_direction==="asc"?-1:1;
        trader_inventory_sorting = sort_by || "name";

    } else if(target === "character") {
        if(sort_by) {
            if(change_direction){
                if(sort_by === character_inventory_sorting) {
                    if(character_inventory_sorting_direction === "asc") {
                        character_inventory_sorting_direction = "desc";
                    } else {
                        character_inventory_sorting_direction = "asc";
                    }
                } else {
                    character_inventory_sorting_direction = "asc";
                }
            }
        } else {
            sort_by = character_inventory_sorting;
        }
        target = inventory_div;
        plus = character_inventory_sorting_direction==="asc"?1:-1;
        minus = character_inventory_sorting_direction==="asc"?-1:1;
        character_inventory_sorting = sort_by || "name";
    } else if(target === "storage"){
        if(sort_by) {
            if(change_direction){
                if(sort_by === storage_sorting) {
                    if(storage_sorting_direction === "asc") {
                        storage_sorting_direction = "desc";
                    } else {
                        storage_sorting_direction = "asc";
                    }
                } else {
                    storage_sorting_direction = "asc";
                }
            }
        } else {
            sort_by = storage_sorting;
        }

        target = storage_inventory_div;
        plus = storage_sorting_direction==="asc"?1:-1;
        minus = storage_sorting_direction==="asc"?-1:1;
        storage_sorting = sort_by || "name";

    } else {
        console.warn(`Something went wrong, no such inventory as '${target}'`);
        return;
    }

    [...target.children].sort((a,b) => {
        //equipped items on top
        if(a.classList.contains("equipped_item_control") && !b.classList.contains("equipped_item_control")) {
            return -1;
        } else if(!a.classList.contains("equipped_item_control") && b.classList.contains("equipped_item_control")){
            return 1;
        } 

        //traded items on bottom
        if(a.classList.contains("item_to_trade") && !b.classList.contains("item_to_trade")) {
            return 1;
        } else if(!a.classList.contains("item_to_trade") && b.classList.contains("item_to_trade")) {
            return -1;
        }

        /*
            The category rules below - and they are rules about WHAT a thing is, not when it
            arrived - are skipped for "latest", which would otherwise answer the wrong
            question: a sword just picked up would sit below every scrap of leather in the
            bag, and the whole point of the sort is that the newest thing is at the top.

            The two rules above this stay in force for every sort, because they are about
            where a row belongs rather than how it compares: an equipped item is not really
            in the list, and a row queued for a trade belongs at the bottom of it.
        */
        if(sort_by !== "latest") {
            //equippables below non-equippables
            if(a.classList.contains("character_item_equippable") && !b.classList.contains("character_item_equippable")) {
                return 1;
            } else if(!a.classList.contains("character_item_equippable") && b.classList.contains("character_item_equippable")){
                return -1;
            } 
            if(a.classList.contains("trader_item_equippable") && !b.classList.contains("trader_item_equippable")) {
                return 1;
            } else if(!a.classList.contains("trader_item_equippable") && b.classList.contains("trader_item_equippable")){
                return -1;
            } 
            if(a.classList.contains("storage_item_equippable") && !b.classList.contains("storage_item_equippable")) {
                return 1;
            } else if(!a.classList.contains("storage_item_equippable") && b.classList.contains("storage_item_equippable")){
                return -1;
            } 

            //components below non-components
            if(a.children[0].children[0].children[0].innerText === "[Comp]" && b.children[0].children[0].children[0].innerText !== "[Comp]") {
                return 1;
            } else if(a.children[0].children[0].children[0].innerText !== "[Comp]" && b.children[0].children[0].children[0].innerText === "[Comp]") {
                return -1;
            }

            //books below non-books
            if(a.children[0].children[0].children[0].innerText === "[Book]" && b.children[0].children[0].children[0].innerText !== "[Book]") {
                return 1;
            } else if(a.children[0].children[0].children[0].innerText !== "[Book]" && b.children[0].children[0].children[0].innerText === "[Book]") {
                return -1;
            }
        }



        const slot_a = a.dataset.item_slot;
        const slot_b = b.dataset.item_slot;
        /*
        //tools above non-tools
        if(!tool_slots.includes(slot_a) && tool_slots.includes(slot_b)) {
            return 1;
        } else if(tool_slots.includes(slot_a) && !tool_slots.includes(slot_b)){
            return -1;
        }
        */
        
        //other items by properties, name or otherwise by value
        if(sort_by === "type") {
            //slot
            
            if(slot_a != slot_b) { 
                return Object.keys(equipment_slots_divs).indexOf(a.dataset.item_slot) - Object.keys(equipment_slots_divs).indexOf(b.dataset.item_slot);
            }

            //usable
            if(a.classList.contains("character_item_usable") != b.classList.contains("character_item_usable")) {
                return b.classList.contains("character_item_usable") > a.classList.contains("character_item_usable") ? plus : minus;
            }
            if(a.classList.contains("trader_item_usable") != b.classList.contains("trader_item_usable")) {
                return b.classList.contains("trader_item_usable") > a.classList.contains("trader_item_usable") ? plus : minus;
            }
            if(a.classList.contains("storage_item_usable") != b.classList.contains("storage_item_usable")) {
                return b.classList.contains("storage_item_usable") > a.classList.contains("storage_item_usable") ? plus : minus;
            }

            let item_template_a = null;
            let item_template_b = null;

            if (target === inventory_div) {
                item_template_a = item_templates[JSON.parse(a.dataset.character_item).id];
                item_template_b = item_templates[JSON.parse(b.dataset.character_item).id];
            }
            else if (target === trader_inventory_div) {
                item_template_a = item_templates[JSON.parse(a.dataset.trader_item).id];
                item_template_b = item_templates[JSON.parse(b.dataset.trader_item).id];
            }
            else if (target === storage_inventory_div) {
                item_template_a = item_templates[JSON.parse(a.dataset.storage_item).id];
                item_template_b = item_templates[JSON.parse(b.dataset.storage_item).id];
            }

            if (item_template_a && item_template_b) {
                if (item_template_a.material_type != item_template_b.material_type) { 
                    return item_template_a.material_type > item_template_b.material_type ? plus : minus;
                }
                if (item_template_a.component_type != item_template_b.component_type) { 
                    return item_template_a.component_type > item_template_b.component_types ? plus : minus;
                }
                if (item_template_a.component_tier != item_template_b.component_tier) { 
                    return item_template_a.component_tier > item_template_b.component_tier ? plus : minus;
                }
                if (item_template_a.item_tier != item_template_b.item_tier) { 
                    return item_template_a.item_tier > item_template_b.item_tier ? plus : minus;
                }
            }

            //...otherwise, fall back to sorting by name in the parts below
        }

        if(sort_by === "latest") {
            const order_a = Number.parseInt(a.dataset.obtained_order) || 0;
            const order_b = Number.parseInt(b.dataset.obtained_order) || 0;

            if(order_a !== order_b) {
                /*
                    Inverted against the others on purpose: the newest entry has the highest
                    order and belongs first, so "asc" - which is what a fresh click on the
                    button gives - reads as "latest first". Clicking again still flips it.
                */
                return order_a > order_b ? minus : plus;
            }

            //same order, so fall through to the name below and keep it stable
        }

        if(sort_by === "name" || sort_by === "type" || sort_by === "latest") {
            //These are rendered names, so both the case folding and the comparison
            //have to be locale aware. Plain toLowerCase turns Turkish "İ" into an
            //"i" followed by a combining dot instead of a plain "i", and a ">"
            //comparison orders by code unit, which sorts every letter carrying a
            //diacritic after "z".
            const tag = language_tags[language];
            const name_a = a.querySelector(".item_name").innerText.toLocaleLowerCase(tag).replaceAll('"',"");
            const name_b = b.querySelector(".item_name").innerText.toLocaleLowerCase(tag).replaceAll('"',"");
            const name_comparison = name_a.localeCompare(name_b, tag);
            if(name_comparison > 0) {
                return plus;
            } else if(name_comparison < 0) {
                return minus;
            } else {
                //if same name, sort based on quality 
                //works similar to sorting by value but is more precise
                //(shouldn't be possible to reach this for quality-less items)
                let value_a = Number.parseInt(a.dataset.item_quality);
                let value_b = Number.parseInt(b.dataset.item_quality);
                
                if(value_a > value_b) {
                    return plus;
                } else {
                    return minus;
                }
            }

        } else if(sort_by === "price") {
            
            let value_a = Number.parseInt(a.getAttribute(`data-item_value`));
            let value_b = Number.parseInt(b.getAttribute(`data-item_value`));
      
            if(value_a > value_b) {
                return plus;
            } else {
                if(value_a === value_b && "item_quality" in a.dataset && "item_quality" in b.dataset) {
                    if(Number.parseInt(a.dataset.item_quality) > Number.parseInt(b.dataset.item_quality)) {
                        return plus;
                    } else {
                        return minus;
                    }
                }
                return minus;
            }
        }
    }).forEach(node => target.appendChild(node));
}

function update_displayed_trader_inventory({item_key, trader_sorting="name", sorting_direction="asc", was_anything_new_added=false} = {}) {
    const trader = traders[current_trader];

    //removal of unneeded divs
    if(!item_key){
        Object.keys(trader_item_divs).forEach(div_key => {
            if(!trader.inventory[div_key]) {
                trader_item_divs[div_key].remove();
                delete trader_item_divs[div_key];
            }
        });
        Object.keys(item_selling_divs).forEach(div_key => {
            if(to_sell.items.filter(x => x.item_key === div_key).length === 0){
                //not in trade list - remove
                item_selling_divs[div_key].remove();
                delete item_selling_divs[div_key];
            }
        });
    }

    //creation of missing divs and updating of others

    if(item_key) {
        //key passed -> deal only with this singular item
        let item_count = trader.inventory[item_key].count;

        //find if item is in to_buy, if so then grab the count and subtract it
        for(let i = 0; i < to_buy.items.length; i++) {
                if(item_key === to_buy.items[i].item_key) {
                    item_count -= Number(to_buy.items[i].count);

                    if(item_count == 0) {
                        trader_item_divs[item_key]?.remove();
                        delete trader_item_divs[item_key];
                        return;
                    }
                    if(item_count < 0) {
                        //shouldn't be possible to reach but who knows
                        throw new Error('Something is wrong with trader item count');
                    }
                    break;
                }
        }

        was_anything_new_added = trader_item_divs[item_key];
        const item_div = create_inventory_item_div({key: item_key, item_count, target: "trader", is_trade: true});

        if(trader_item_divs[item_key]) {
            trader_item_divs[item_key].replaceWith(item_div);
            trader_item_divs[item_key] = item_div;
        } else {
            trader_item_divs[item_key] = item_div;
            trader_inventory_div.appendChild(item_div);
        }
    } else {
        //no key passed - go through all items

        //go through inventory items
        Object.keys(trader.inventory).forEach(inventory_key => {
            let item_count = trader.inventory[inventory_key].count;

            //find if item is in to_buy, if so then grab the count and subtract it
            for(let i = 0; i < to_buy.items.length; i++) {
                if(inventory_key === to_buy.items[i].item_key) {
                    item_count -= Number(to_buy.items[i].count);

                    if(item_count == 0) {
                        trader_item_divs[inventory_key]?.remove();
                        delete trader_item_divs[inventory_key];
                        return;
                    }
                    if(item_count < 0) {
                        //shouldn't be possible to reach but who knows
                        throw new Error('Something is wrong with trader item count');
                    }
                    break;
                }
            }

            if(!trader_item_divs[inventory_key]) {
                //item is not present in display, create a new one
                trader_item_divs[inventory_key] = create_inventory_item_div({key: inventory_key, item_count, target: "trader", is_trade: true});
                trader_inventory_div.appendChild(trader_item_divs[inventory_key]);
                was_anything_new_added = true;
            } else {
                //item is present
                
                //grab the displayed count
                let div_count = Number.parseInt(trader_item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText.replace("x",""));
                if(Number.isNaN(div_count)) {
                    div_count = 0;
                }
                //compare displayed count with actual count, update display to proper value if they differ
                if(div_count != item_count) {
                    if(item_count > 1) {
                        trader_item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText = ` x${item_count}`;
                    } else {
                        trader_item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText = ``;
                    }
                }

                //overwrite tooltip (for displayed prices)
                const tooltip_div = trader_item_divs[inventory_key].querySelector(".item_tooltip");
                tooltip_div.replaceWith(create_item_tooltip(trader.inventory[inventory_key].item, {trader: true}, true));

                const price_span = trader_item_divs[inventory_key].getElementsByClassName("item_value")[0];
                set_HTML(price_span, `${format_money(round_item_price(trader.inventory[inventory_key].item.getValue({region: current_location.market_region, multiplier: (traders[current_trader].getProfitMargin(current_location.market_region) || 1)})), true)}`);
            }
        });

        //go through to_sell items
        for(let i = 0; i < to_sell.items.length; i++) {
            const key = to_sell.items[i].item_key;
            if(!item_selling_divs[key]) {
                //item not present - add to display
                item_selling_divs[key] = create_inventory_item_div({target: "trader", trade_index: i, is_trade: true});
                trader_inventory_div.appendChild(item_selling_divs[key]);
            } else {
                //verify and update count
                
                let div_count = trader_item_divs[key]?.dataset.item_count ?? 0;

                let item_count = to_sell.items[i].count;
                if(div_count !== item_count) {
                    if(item_count > 1) {
                        item_selling_divs[key].getElementsByClassName("item_count")[0].innerText = ` x${item_count}`;
                    } else {
                        item_selling_divs[key].getElementsByClassName("item_count")[0].innerText = ``;
                    }
                }
            }
        }
    }
    
    if(was_anything_new_added) {
        sort_displayed_inventory({target: "trader", sort_by: trader_sorting, direction: sorting_direction});
    }
}

/**
 * updates displayed inventory of the character (only inventory, worn equipment is managed by separate method)
 * 
 * if item_key/equip_slot is passed, it will instead only update the display of that one item
 * 
 * @param {Object} data
 * @param {Boolean} data.is_trade whethere player is in trade, affecting whether displayed price be basic or trade-specific
 */
function update_displayed_character_inventory({item_key, equip_slot, character_sorting, sorting_direction="asc", was_anything_new_added=false, is_trade=false, skip_sorting=false, rebuild=false} = {}) {    
    //A gathering task counts what is in the inventory, so it follows every change to it.
    update_displayed_quest_item_counts();

    //removal of unneeded divs
    if(!item_key){
        Object.keys(item_divs).forEach(div_key => {
            if(item_divs[div_key].classList.contains("equipped_item_control")) {
                //since equipment is keyed with slots and not item_keys, there might be something different under it, so needs additional check
                //div_key is the slot
                const item_key = item_divs[div_key].dataset.character_item;
                if(!character.equipment[div_key] || item_key !== character.equipment[div_key].getInventoryKey()) {
                    //character has nothing in this slot - remove
                    //character has something else in this slot - remove, will be recreated later
                    item_divs[div_key].remove();
                    delete item_divs[div_key];
                }
            } else {
                if(!character.inventory[div_key]) {
                    item_divs[div_key].remove();
                    delete item_divs[div_key];
                }
            }
        });

        Object.keys(item_buying_divs).forEach(div_key => {
            if(to_buy.items.filter(x => x.item_key === div_key).length === 0){
                //not in trade list - remove
                item_buying_divs[div_key].remove();
                delete item_buying_divs[div_key];
            }
        });
    }
    //creation of missing divs and updating of others
    if(item_key) {
        //specific item to be updated
        let item_count = character.inventory[item_key].count;

        //find if item is in to_sell, if so then grab the count and subtract it
        for(let i = 0; i < to_sell.items.length; i++) {
            if(item_key === to_sell.items[i].item_key) {
                item_count -= Number(to_sell.items[i].count);
                if(item_count == 0) {
                    item_divs[item_key]?.remove();
                    delete item_divs[item_key];
                    return;
                }
                if(item_count < 0) {
                    //shouldn't be possible to reach but who knows
                    throw new Error('Something is wrong with character item count');
                }
                break;
            }
        }

        was_anything_new_added = trader_item_divs[item_key];
        const item_div = create_inventory_item_div({key: item_key, item_count, target: "character", is_trade: is_trade});

        if(item_divs[item_key]) {
            item_divs[item_key].replaceWith(item_div);
            item_divs[item_key] = item_div;
        } else {
            item_divs[item_key] = item_div;
            inventory_div.appendChild(item_div);
        }

    } else if(equip_slot){
        //specific item slot to be updated
        const equip_div = create_inventory_item_div({key: equip_slot, target: "character", is_equipped: true, is_trade});

        if(item_divs[equip_slot]) {
            item_divs[equip_slot].replaceWith(equip_div);
            item_divs[equip_slot] = equip_div;
        } else {
            item_divs[equip_slot] = equip_div;
            inventory_div.appendChild(equip_div);
        }
    } else {
        //inventory items
        Object.keys(character.inventory).forEach(inventory_key => {
            let item_count = character.inventory[inventory_key].count;

            //find if item is in to_sell, if so then grab the count and subtract it
            for(let i = 0; i < to_sell.items.length; i++) {
                if(inventory_key === to_sell.items[i].item_key) {
                    item_count -= Number(to_sell.items[i].count);

                    if(item_count == 0) {
                        item_divs[inventory_key]?.remove();
                        delete item_divs[inventory_key];
                        return;
                    }
                    if(item_count < 0) {
                        //shouldn't be possible to reach but who knows
                        throw new Error('Something is wrong with character item count');
                    }
                    break;
                }
            }

            if(!item_divs[inventory_key]) {
                //not in display, add it
                item_divs[inventory_key] = create_inventory_item_div({key: inventory_key, item_count, target: "character", is_trade});
                inventory_div.appendChild(item_divs[inventory_key]);
                was_anything_new_added = true;
            } else if(rebuild) {
                //Replaced rather than patched: the branch below only touches the count,
                //the tooltip and the price, so an item name and its [use]/[equip]
                //buttons would keep whatever language they were first written in.
                //replaceWith keeps the DOM position, so the sort order survives.
                const rebuilt = create_inventory_item_div({key: inventory_key, item_count, target: "character", is_trade});
                item_divs[inventory_key].replaceWith(rebuilt);
                item_divs[inventory_key] = rebuilt;
            } else {
                //in display, just update it
                let div_count = Number.parseInt(item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText.replace("x",""));
                if(Number.isNaN(div_count)) {
                    div_count = 0;
                }
                if(div_count != item_count) {
                    if(item_count > 1) {
                        item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText = ` x${item_count}`;
                    } else {
                        item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText = ``;
                    }
                }

                //overwrite tooltip (for displayed prices)
                const tooltip_div = item_divs[inventory_key].querySelector(".item_tooltip");
                tooltip_div.replaceWith(create_item_tooltip(character.inventory[inventory_key].item, {}, is_trade));

                //grab and update price div, do it for all as trading can affect prices of multiple items
                if(!character.inventory[inventory_key].item.tags.unsellable) {
                    const price_span = item_divs[inventory_key].getElementsByClassName("item_value")[0];
                    if(is_trade) {
                        set_HTML(price_span , `${format_money(round_item_price(character.inventory[inventory_key].item.getValue({region: current_location.market_region})), true)}`);
                    } else {
                        set_HTML(price_span, `${format_money(round_item_price(character.inventory[inventory_key].item.getBaseValue()), true)}`);
                    }
                }
            }
        });

        Object.keys(character.equipment).forEach(eq_slot => {
            if(!item_divs[eq_slot]) {
                if(character.equipment[eq_slot]) {
                    if(character.equipment[eq_slot]?.tags.tool) {
                        //don't display the equipped tools
                        return;
                    }
    
                    item_divs[eq_slot] = create_inventory_item_div({key: eq_slot, target: "character", is_equipped: true,is_trade});
                    inventory_div.appendChild(item_divs[eq_slot]);
                    was_anything_new_added = true;
                }
            } else if(rebuild) {
                const rebuilt = create_inventory_item_div({key: eq_slot, target: "character", is_equipped: true, is_trade});
                item_divs[eq_slot].replaceWith(rebuilt);
                item_divs[eq_slot] = rebuilt;
            }
        });

        for(let i = 0; i < to_buy.items.length; i++) {
            const key = to_buy.items[i].item_key;
            if(!item_buying_divs[key]) {
                item_buying_divs[key] = create_inventory_item_div({target: "character", trade_index: i,is_trade});
                inventory_div.appendChild(item_buying_divs[key]);
            } else {
                //verify and update count
                
                let div_count = item_divs[key]?.dataset.item_count ?? 0;

                let item_count = to_buy.items[i].count;
                if(div_count !== item_count) {
                    if(item_count > 1) {
                        item_buying_divs[key].getElementsByClassName("item_count")[0].innerText = ` x${item_count}`;
                    } else {
                        item_buying_divs[key].getElementsByClassName("item_count")[0].innerText = ``;
                    }
                }
            }
        }
    }
    
    /*
        Re-sorted when something new appeared - and also on every change while sorting by
        "latest", because adding to a stack that is already there is not "anything new" and
        yet it is exactly what that sort is meant to notice. Without this the order on the
        entry moves and the row does not, until the next new item or a click on the button.
    */
    if((was_anything_new_added || character_inventory_sorting === "latest") && !skip_sorting) {
        sort_displayed_inventory({target: "character", sort_by: character_sorting, direction: sorting_direction});
    }
}

function update_displayed_storage_inventory({item_key, sorting_direction="asc", was_anything_new_added=false} = {}) {

    //removal of unneeded divs
    if(!item_key){
        Object.keys(storage_item_divs).forEach(div_key => {
            if(!player_storage.inventory[div_key]) {
                storage_item_divs[div_key].remove();
                delete storage_item_divs[div_key];
            }
        });
    }

    //creation of missing divs and updating of others
    if(item_key) {
        const item_count = player_storage.inventory[item_key].count;
        storage_item_divs[item_key].remove();
        delete storage_item_divs[item_key];
        storage_item_divs[item_key] = create_inventory_item_div({key: item_key, item_count, target: "storage"});
        storage_inventory_div.appendChild(storage_item_divs[item_key]);
        was_anything_new_added = true;
    } else {
        Object.keys(player_storage.inventory).forEach(inventory_key => {
            let item_count = player_storage.inventory[inventory_key].count;


            if(!storage_item_divs[inventory_key]) {
                //not in display, add it
                storage_item_divs[inventory_key] = create_inventory_item_div({key: inventory_key, item_count, target: "storage"});
                storage_inventory_div.appendChild(storage_item_divs[inventory_key]);
                was_anything_new_added = true;
            } else {
                //in display, just update it
                let div_count = Number.parseInt(storage_item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText.replace("x",""));
                if(Number.isNaN(div_count)) {
                    div_count = 0;
                }
                if(div_count != item_count) {
                    if(item_count > 1) {
                        storage_item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText = ` x${item_count}`;
                    } else {
                        storage_item_divs[inventory_key].getElementsByClassName("item_count")[0].innerText = ``;
                    }
                }
            }
        });

    }
    
    if(!item_key && (was_anything_new_added || storage_sorting === "latest")) {
        sort_displayed_inventory({target: "storage", direction: sorting_direction});
    }
}

/**
 * creates a single item div for hero/trader, used to fill displayed inventories
 * @param {Object} params
 * @param {String} params.key inventory key /or/ equip slot if is_equipped
 * @param {Number} params.item_count
 * @param {String} params.target character/trader/storage
 * @param {Boolean} params.is_equipped
 * @param {Number} params.trade_index index in to_buy/to_sell
 * @param {Boolean} params.is_trade true => item is either in trader or being traded (affects display, skipping some elements)
 * @returns 
 */
function create_inventory_item_div({key, item_count, target, is_equipped, trade_index, is_trade = false}) {

    const item_control_div = document.createElement("div");
    const item_div = document.createElement("div");
    const item_name_div = document.createElement("div");
    const item_additional = document.createElement("div");
    item_additional.classList.add("item_additional_content");

    let target_item;
    let target_class_name;
    let item_class;
    /*
        When this entry was obtained, for sorting by "latest". Zero for the rows that have no
        such thing: an equipped item, and the two trade lists, both of which the sort already
        pins to the top or the bottom before it ever looks at this.
    */
    let obtained_order = 0;
    let options = {};
    let price_multiplier = 1;
    if(target === "trader") {
        options.trader = true;
        price_multiplier = traders[current_trader].getProfitMargin(current_location.market_region) || price_multiplier;
    } else if(target === "storage") {
        options.storage = true;
    }

    if(is_equipped) {
        target_item = character.equipment[key];
        key = target_item.getInventoryKey();
        item_count = item_count ?? 1;
        item_class = "equipped_item";
        target_class_name = "character_item";
    } else {
        item_class = "inventory_item";
        if(target === "character") {
            if(typeof trade_index === "undefined") {
                target_item = character.inventory[key].item;
                item_count = item_count || character.inventory[key].count;
                obtained_order = character.inventory[key].obtained_order || 0;
            } else {
                target_item = traders[current_trader].inventory[to_buy.items[trade_index].item_key].item;
                item_count = item_count || to_buy.items[trade_index].count;
            }
            target_class_name = "character_item";
        } else if(target === "trader") {
            if(typeof trade_index === "undefined") {
                target_item = traders[current_trader].inventory[key].item;
                item_count = item_count || traders[current_trader].inventory[key].count;
                obtained_order = traders[current_trader].inventory[key].obtained_order || 0;
            } else {
                target_item = character.inventory[to_sell.items[trade_index].item_key].item;
                item_count = item_count || to_sell.items[trade_index].count;
            }
            target_class_name = "trader_item";
        } else if(target === "storage") {
            target_item = player_storage.inventory[key].item;
            item_count = item_count || player_storage.inventory[key].count;
            obtained_order = player_storage.inventory[key].obtained_order || 0;
            target_class_name = "storage_item";
        } else {
            throw new Error(`"${target}" is not a correct inventory owner`);
        }
    }

    if(target_item.use_quality) {
        item_control_div.dataset.item_quality = target_item.quality;
    }

    item_control_div.dataset.obtained_order = obtained_order;

    clear_HTML_content(item_name_div);
    let item_name_div_content = "";
    if(target_item.tags?.equippable) {
        if(target_item.tags.tool) {
            item_name_div_content = `<span class = "item_slot" >[${translationManager.getText(language, "ui slot tool")}]</span> <span class="item_name">${target_item.getDisplayName()}</span>`;
        } else {
            //The equip_slot is a registry key and was printed raw, so an equipped item
            //read "[weapon]" or "[legs]" in an otherwise translated inventory. The
            //"ui slot <key>" rows cover all sixteen slots and already did.
            const equipped_slot_text_id = `ui slot ${target_item.equip_slot}`;
            item_name_div_content = `<span class = "item_slot" >[${translationManager.getText(language, equipped_slot_text_id)}]</span> <span class="item_name">${target_item.getDisplayName()}</span>`;
        }
        item_name_div.classList.add(`${item_class}_name`);
        item_div.appendChild(item_name_div);

        item_control_div.classList.add(`${item_class}_control`, `${target_class_name}_control`, `${target_class_name}_equippable`);
        item_control_div.appendChild(item_div);

        if(typeof trade_index !== "undefined") {
            item_div.classList.add(`${item_class}`, `${target_class_name}`, `trade_item_equippable`);
        } else {
            item_div.classList.add(`${item_class}`, `${target_class_name}`, `item_equippable`);
        }
        item_control_div.dataset.item_slot = target_item.equip_slot;
        //
    } else if(target_item.tags.component) {
        //
        item_name_div_content = `<span class = "item_category">[${translationManager.getText(language, "ui slot component")}]</span> <span class="item_name">${target_item.getDisplayName()}</span>`;
        item_name_div.classList.add(`${item_class}_name`);
        item_div.appendChild(item_name_div);

        item_control_div.classList.add(`${item_class}_control`, `${target_class_name}_control`, `${target_class_name}_component`);
        item_control_div.appendChild(item_div);

        item_div.classList.add(`${item_class}`, `${target_class_name}`, "item_component");
        //
    } else if(target_item.tags.book) {
        //
        //getDisplayName, not .name: every book has a "name <title>" row and none of
        //them were being read, so the inventory showed the English titles.
        item_name_div_content = `<span class = "item_category">[${translationManager.getText(language, "ui slot book")}]</span> <span class = "book_name item_name">"${target_item.getDisplayName()}"</span>`;
        item_name_div.classList.add(`${item_class}`);

        if(book_stats[target_item.name].is_finished) {
            item_div.classList.add("book_finished");
        } else if(get_current_book() === target_item.name) {
            item_control_div.classList.add("book_active");
        }
        //
    } else {
        //
        item_name_div_content = `<span class = "item_category"></span> <span class = "item_name">${target_item.getDisplayName()}</span>`;
    }

    if (target_item.use_quality && target_item.quality) {
        item_name_div_content += ` [<b class="${rarity_outlines[target_item.getRarity()]}" style="color: ${ rarity_colors[target_item.getRarity()] } ">${target_item.quality}%</b>]`;
    }

    if(item_count > 1) {
        item_name_div_content += `<span class="item_count"> x${item_count}</span>`;
    } else {
        item_name_div_content += `<span class="item_count"></span>`;
    }

    insert_HTML(item_name_div, item_name_div_content);

    item_name_div.classList.add(`${item_class}_name`);

    if(target === "character") {
        const item_faving_div = document.createElement("div");
        item_faving_div.classList.add("item_fav_div");
        const icon = document.createElement("i");
        icon.classList.add("material-icons", "item_fav_icon");
        if(typeof trade_index === "undefined") {
            if(favourite_items[key]) {
                icon.innerText = 'star';
                item_control_div.classList.add("character_item_faved");
            } else {
                icon.innerText = 'star_border';
            }
        }
        item_faving_div.appendChild(icon);

        item_div.appendChild(item_faving_div);
    }

    item_div.appendChild(item_name_div);

    item_div.classList.add(`${item_class}`, `${target_class_name}`, `item_${target_item.item_type.toLowerCase()}`);

    item_div.appendChild(create_item_tooltip(target_item, options, is_trade));

    item_control_div.classList.add(`${item_class}_control`, `${target_class_name}_control`, `${target_class_name}_${target_item.item_type.toLowerCase()}`);
    item_control_div.setAttribute(`data-${target_class_name}`, `${target_item.getInventoryKey()}`);
    item_control_div.setAttribute("data-item_count", `${item_count}`);
    item_control_div.setAttribute("data-item_value", `${target_item.getBaseValue()}`); //is only used as sorting param
    item_control_div.appendChild(item_div);

    if(target === "character") {
        if(target_item.item_type === "USABLE") {
            const item_use_button = document.createElement("div");
            item_use_button.classList.add("item_use_button");
            item_use_button.innerText = translationManager.getText(language, "ui btn use");
            const item_auto_use_button = document.createElement("div");
            item_auto_use_button.classList.add("item_auto_use_button");
            item_auto_use_button.innerText = translationManager.getText(language, "ui btn auto use");

            if(favourite_consumables[target_item.id]) {
                item_auto_use_button.classList.add("item_auto_use_button_active");
            }

            item_additional.appendChild(item_use_button);
            item_additional.appendChild(item_auto_use_button);
        } else if(target_item.item_type === "BOOK") {
            const item_read_button = document.createElement("div");
            item_read_button.classList.add("item_use_button");
            item_read_button.innerText = translationManager.getText(language, "ui btn read");
            item_additional.appendChild(item_read_button);

            item_div.classList.add("item_book");
        }
        if(typeof trade_index === "undefined" && target_item.tags.equippable) {
            if(!is_equipped) {
                let item_equip_span = document.createElement("span");
                insert_HTML(item_equip_span, translationManager.getText(language, "ui btn equip"))
                item_equip_span.classList.add("equip_item_button", "item_controls");
                item_additional.appendChild(item_equip_span);
            } else {
                let item_unequip_div = document.createElement("div");
                insert_HTML(item_unequip_div, `[${translationManager.getText(language, "ui take off")}]`)
                item_unequip_div.classList.add("unequip_item_button", "item_controls");
                item_additional.appendChild(item_unequip_div);
            }
        }
    } 

    let item_value_span = document.createElement("span");
    item_value_span.classList.add("item_value", "item_controls");

    if(!target_item.tags.unsellable) {
        item_additional.appendChild(create_trade_buttons());
        insert_HTML(item_value_span, `${format_money(round_item_price(target_item.getValue({region: current_location?.market_region, multiplier: price_multiplier})), true)}`);
    } else {
        item_control_div.setAttribute("data-unsellable", "true");
        clear_HTML_content(item_value_span);
    }

    item_additional.appendChild(item_value_span);
    item_control_div.appendChild(item_additional);

    if(typeof trade_index !== "undefined") {
        item_control_div.classList.add('item_to_trade');
    }

    return item_control_div;
}

function exit_displayed_trade() {
    action_div.style.display = "";
    trade_div.style.display = "none";
}

export {
    inventory_sorting_state,
    restore_inventory_sorting,
    equipment_slots_divs,
    exit_displayed_trade,
    item_divs,
    sort_displayed_inventory,
    update_displayed_character_inventory,
    update_displayed_storage_inventory,
    update_displayed_trader,
    update_displayed_trader_inventory,
};
