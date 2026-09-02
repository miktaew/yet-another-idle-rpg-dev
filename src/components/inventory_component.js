"use strict";
// @ts-check

import { getItem, getItemFromKey, item_templates } from "../items.js";

/*
    A counter that only ever goes up, handed out one number per addition to any inventory.

    An inventory entry used to be {item, count} and that was all of it, which means there
    was nothing on it that said WHEN it was got - so "show me what I picked up last" was not
    a comparator waiting to be written, it was a field that had to start existing (P-32).

    Shared across every InventoryHaver rather than one counter each, so the numbers stay
    comparable if an item is ever moved between two of them. Gaps in the sequence are fine;
    only the order matters.
*/
let next_obtained_order = 1;

/**
 * Keeps the counter above an order that came from somewhere else - a save, in practice.
 *
 * Without this, loading a game would hand the next picked-up item the number 1 and it would
 * sort below everything the save already carried.
 */
function remember_obtained_order(order) {
    if(order >= next_obtained_order) {
        next_obtained_order = order + 1;
    }
}

/**
 * Puts the saved acquisition order back onto a freshly loaded inventory.
 *
 * Done after the inventory is built rather than carried through the load list, because that
 * list is filled from nineteen different push sites - most of them migration branches for
 * saves far older than this field - and matching a saved key against the built inventory is
 * one place instead of nineteen.
 *
 * An entry whose key changed under a migration simply does not match and keeps the order it
 * was handed while loading. Those are old saves, which have no order recorded anyway.
 *
 * @param {InventoryHaver} haver
 * @param {Object} saved_inventory save_data.<owner>.inventory
 */
function restore_obtained_order(haver, saved_inventory) {
    Object.keys(saved_inventory || {}).forEach(key => {
        const order = saved_inventory[key]?.obtained_order;
        if(!(order > 0) || !(key in haver.inventory)) {
            return;
        }
        haver.inventory[key].obtained_order = order;
        remember_obtained_order(order);
    });
}

//extended by character and traders, as their inventories are supposed to work the same way
class InventoryHaver {
    
    constructor() {
        this.inventory = {}; //currently items are stored separately and are re-added on load
    }

    /**
     * @description adds items from the list to inventory; don't use this method directly, there are other methods that call this one and take care of display
     * @param {Array} items - [{item_key, count, item_id (if no key), quality (optional if no key)},...]
     */
    add_to_inventory(items) {
        let anything_new = false;
        
        for(let i = 0; i < items.length; i++){
            let item_key;
            if(items[i].item_key){
                item_key = items[i].item_key;
            } else {
                //this part is so stupid (recreating item just to grab it's key)
                //but at least it wont break if code for creating inventory keys changes
                let item;
                if(items[i].quality) {
                    item = getItem({...item_templates[items[i].item_id], quality:items[i].quality});
                } else {
                    item = getItem({...item_templates[items[i].item_id]});
                }
                item_key = item.getInventoryKey();
            } 

            if(!(item_key in this.inventory)) {//not in inventory
                if(!items[i].count) {
                    items[i].count = 1;
                }
                const item = getItemFromKey(item_key);
                this.inventory[item_key] = {item, count: items[i].count, obtained_order: next_obtained_order++};
                anything_new = true;
            } else { //in inventory
                if(items[i].count === undefined) {
                    this.inventory[item_key].count += 1;
                } else if(typeof items[i].count === "number" && !isNaN(items[i].count)){
                    this.inventory[item_key].count += items[i].count;
                } else {
                    throw new TypeError(`Tried to add "${items[i].count}" items, which is not a valid number!`);
                }

                /*
                    Topping up a stack counts as getting the item, so the stack moves back to
                    the top of the "latest" sort. That is what was asked for - the most
                    recently obtained items first - and a stack you keep adding to is a stack
                    you keep getting.
                */
                this.inventory[item_key].obtained_order = next_obtained_order++;
            }
        }
        return anything_new;
    }

    /**
     * @description removes specified items (array of {item_key, count}) from the inventory; don't use this method directly, there are other methods that call this one and take care of display
     * @param {Array} items [{item_key, item_count}]
     **/
    remove_from_inventory(items) {
        for(let i = 0; i < items.length; i++){       
            if(items[i].item_key in this.inventory) { //check if its in inventory, just in case, probably not needed

                if(typeof items[i].item_count === "number" && Number.isInteger(items[i].item_count) && items[i].item_count >= 1)  {
                    this.inventory[items[i].item_key].count -= items[i].item_count;
                }  else {
                    this.inventory[items[i].item_key].count -= 1; //remove one if count was not passed
                }
    
                if(this.inventory[items[i].item_key].count == 0) {
                    delete this.inventory[items[i].item_key]; 
                    //removes item from inventory if it's county is 0
                } else if(this.inventory[items[i].item_key].count < 0 || isNaN(this.inventory[items[i].item_key].count)) {
                    throw new Error(`Item count for key "${items[i].item_key}" reached an illegal value of "${this.inventory[items[i].item_key].count}"`);
                }
                
            } else { 
                    throw new Error("Tried to remove item that was not present in inventory");
            }
        }
    }
}

export {InventoryHaver, remember_obtained_order, restore_obtained_order};