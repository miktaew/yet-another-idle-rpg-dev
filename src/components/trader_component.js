"use strict";

import { character } from "../data/character.js";
import inventory_templates from "../data/inventory_templates.js";
import { current_game_time } from "../game_time.js";
import { getItem, item_templates } from "../items.js";
import InventoryComponent, { inventories } from "./inventory_component.js";
import AvailabilityComponent from "./availability_component.js";
import { availabilities, availability_havers } from "../data/component_references.js";

inventories["trader"] = {};
availabilities["trader"] = {};

class TraderComponent {

    #inventory;
    #availability;

    constructor({
                name,
                trade_text,
                unlock_message = null,
                refresh_time = 4,
                refresh_shift = 0,
                inventory_template,
                profit_margin = 3,
                is_unlocked = false,
            } = {})
    {
        
        this.name = name;
        this.trade_text = trade_text;
        this.last_refresh = -1;  
        //just the day_count from game_time at which trader was supposedly last refreshed

        this.refresh_time = refresh_time; 
        //7 would mean it's refreshed every 7 days (with shift at 0 it's every monday)
        this.refresh_shift = refresh_shift; 
        //shift refreshing days, e.g. time 7 + shift 2 would be every wednesday, shift 4 would push it to every friday
        //pretty much pointless if refresh time is not N*7
        
        this.inventory_template = inventory_template;
        //a template for the trader to use, so multiple traders can have same predefined item selection (but still separate and with certain randomness)

        this.profit_margin = profit_margin;
        //how much more expensive are the trader's items than their actual value, with default being 2 (so 2x more)
        //don't make it too low to prevent easy xp grinding for the haggling skill

        this.#availability = new AvailabilityComponent({is_unlocked, unlock_message});

        this.#inventory = new InventoryComponent();
    }

    getTradeText() {
        return this.trade_text || `Trade with ${this.name}`;
    }
    
    /**
     * refreshes trader inventory
     * @returns boolean informing if it was able to refresh
     */
    refresh(context) {
        if(this.can_refresh()) {
            //refresh inventory
            this.emptyInventory();
            this.fillInventoryFromTemplate(context);

            this.last_refresh = (current_game_time.day_count + 1 - current_game_time.day_count % this.refresh_time);
            return true;
        }
        //otherwise do nothing
        return false;
    }

    /**
     * checks if enough time passed since last refresh
     * @returns {Boolean}
     */
    can_refresh() {
        return (this.last_refresh < 0 || current_game_time.day_count - (this.last_refresh + this.refresh_shift) >= this.refresh_time);
    }

    getAvailabilityComponent() {
        return this.#availability;
    }

    /**
     * creates new choice of items for the trader, based on assigned inventory template
     * @returns {null}
     */
    fillInventoryFromTemplate(context) {
        const items = this.getInventoryComponent().getItems();
        const inventory_template = inventory_templates[this.inventory_template];

        for (let i = 0; i < inventory_template.length; i++) {
            //inventory_template[i] is a TradeItemGroup = {start_conditions?, items}
            if(inventory_template[i].canBeStarted(context)) {
                for(let j = 0; j < inventory_template[i].items.length; j++){
                    if(inventory_template[i].items[j].canBeStarted(context)  && inventory_template[i].items[j].chance >= Math.random()) {
                        let item_count = inventory_template[i].items[j].count.length == 1 ?
                        inventory_template[i].items[j].count[0] : Math.round(Math.random() *
                            (inventory_template[i].items[j].count[1] - inventory_template[i].items[j].count[0]) + inventory_template[i].items[j].count[0]);
                        
                        if(inventory_template[i].items[j].quality) {
                            let quality = Math.round(Math.random() *
                                (inventory_template[i].items[j].quality[1] - inventory_template[i].items[j].quality[0]) + inventory_template[i].items[j].quality[0]);

                            const item = getItem({...item_templates[inventory_template[i].items[j].item_name], quality});
                            items[item.getInventoryKey()] = { item: item, count: item_count };
                        } else {
                            items[item_templates[inventory_template[i].items[j].item_name].getInventoryKey()] = { item: getItem(item_templates[inventory_template[i].items[j].item_name]), count: item_count }; 
                        }
                    }
                }
            }
        }
    }

    /**
     * 
     * @returns {Number} trader's profit margin multiplied by bonus from the haggling skill and by reputation impact
     */
    getProfitMargin(region) {
        const skill_multi = (1-character.getTotalLevelBonus("Haggling"));
        const rep_multi = (1-Math.min(1000,character.reputation[region])/2000) || 1;

        return 1 + (this.profit_margin - 1) * skill_multi * rep_multi;
    }

    emptyInventory(){
        this.getInventoryComponent().emptyInventory();
    }

    getInventoryComponent() {
        return this.#inventory;
    }

    getTradeInventory() {
        return this.getInventoryComponent().getItems();
    }

    addToInventory(items) {
        this.getInventoryComponent().addToInventory(items);
    }

    removeFromInventory(items) {
        this.getInventoryComponent().removeFromInventory(items);
    }

    /*
    getItemPrice(value, region) {
        let price = Math.ceil(value*this.getProfitMargin(region));
        if(price >= 100) {
            return Math.round(price/10)*10;
        } else if(price >= 1000) {
            return Math.round(price/100)*100;
        } else {
            return price;
        }
    }
    */  
}

availability_havers.push(TraderComponent);

export { TraderComponent };
