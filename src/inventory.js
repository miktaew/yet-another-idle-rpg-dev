"use strict";

import { equip_item_from_inventory } from "./character.js";


//extended by character and traders, as their inventories are supposed to work the same way
class InventoryHaver {
    
    constructor() {
        this.inventory = {}; //currently items are stored separately and are re-added on load
    }

    /**
     * @description adds items from the list to inventory; don't use this method directly, there are other methods that call this one and take care of display
     * @param {Array} items - [{item, count},...]
     */
    add_to_inventory(items) {
        for(let i = 0; i < items.length; i++){            
            if(!(items[i].item.id in this.inventory)) //not in inventory
            {
                if(items[i].item.stackable)
                {
                    if(!items[i].count) {
                        items[i].count=1;
                    }
                    this.inventory[items[i].item.id] = items[i];
                } else 
                {
                    this.inventory[items[i].item.id] = [items[i].item];
                }
            }
            else //in inventory 
            {
                if(items[i].item.stackable)
                {
                    this.inventory[items[i].item.id].count += (items[i].count || 1);
                } 
                else 
                {
                    this.inventory[items[i].item.id].push(items[i].item);
                }
            }

            if(items[i].item.tags.tool) {
                equip_item_from_inventory({item_name: items[i].item.id, item_id: 0});
            }
        }
    }

    /**
     * @description removes specified item from the inventory; don't use this method directly, there are other methods that call this one and take care of display
     * @param {*} item_name name of the item
     * @param {*} item_count number of items to remove (for stackable items)
     * @param {*} item_id id of an item to remove (for unstackable items)  
     */
    remove_from_inventory({item_name, item_count, item_id}) {

        if(item_name in this.inventory) { //check if its in inventory, just in case, probably not needed
            if("item" in this.inventory[item_name]) { //stackable
    
                if(typeof item_count === "number" && Number.isInteger(item_count) && item_count >= 1) 
                {
                    this.inventory[item_name].count -= item_count;
                } 
                else 
                {
                    this.inventory[item_name].count -= 1;
                }
    
                if(this.inventory[item_name].count == 0) //less than 0 shouldn't happen so no need to check
                {
                    delete this.inventory[item_name];
                    //removes item from inventory if it's county is less than 1
                }
            }
            else { //unstackable
                this.inventory[item_name].splice(item_id, 1);
                //removes item from the array
                //dont need to check if .id even exists, as splice by default uses 0 (even when undefined is passed)
    
                if(this.inventory[item_name].length == 0) 
                {
                    delete this.inventory[item_name];
                    //removes item array from inventory if its empty
                } 
            }
        }
    }
}

export {InventoryHaver};