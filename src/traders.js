"use strict";
import { language } from "./main.js";
import { translationManager } from "./translation.js";

import { character, get_total_level_bonus } from "./character.js";
import { current_game_time } from "./game_time.js";
import { InventoryHaver } from "./components/inventory_component.js";
import { item_templates, getItem} from "./items.js";
import { is_marrowmoth_in_port } from "./data/marrowmoth.js";

const traders = {};
const inventory_templates = {};

/**
 * The name of the stock list a trader is using right now.
 *
 * `inventory_template` holds a NAME, or a function that derives one - the bay's shelf
 * changes with the season (P-14, Q-10). Anything that wants to know what a trader sells
 * has to go through here rather than indexing `inventory_templates` with the raw field,
 * and that is not a style preference: the Discoveries index did index it raw, so the day
 * the bay's became a function every item that trader sells silently vanished from the
 * panel - white and black iron ore included, and the bay is the only place in the game
 * that sells them. Nothing failed. The panel simply stopped knowing.
 *
 * check_trader_stock_lists holds every reader to this function for that reason.
 */
function stock_list_name_of(trader) {
    return typeof trader?.inventory_template === "function"
        ? trader.inventory_template()
        : trader?.inventory_template;
}

/**
 * EVERY stock list a trader can ever use, not the one it is using now.
 *
 * These are two different questions and only one of them had an answer. What a trader
 * sells today decides what the player can buy today; what it can EVER sell decides what
 * the Discoveries panel should say about an item, and the panel was asking the first
 * question. `item_sources` is built once on first use and cached for the session, so it
 * baked in whichever list happened to be current when the panel was first opened - and
 * out-of-season items would then have had no source listed for the rest of the session.
 *
 * Harmless so far by luck: the bay's two lists hold the same fifteen item names and
 * differ only in counts and chances. It stops being luck the moment a derived list
 * carries something the other does not, which is exactly what a shelf gated on standing
 * is for (P-25) - and there the item the player has not earned yet is precisely the one
 * the panel most needs to name.
 *
 * A function-valued `inventory_template` therefore has to declare its lists, and
 * check_trader_stock_lists verifies the declaration against the function's own source so
 * the two cannot drift.
 */
function stock_lists_of(trader) {
    if(trader?.stock_lists) {
        return trader.stock_lists;
    }
    const current = stock_list_name_of(trader);
    return current ? [current] : [];
}


class Trader extends InventoryHaver {
    constructor({
                name,
                display_name,
                trade_text,
                unlock_message = null,
                refresh_time = 4,
                refresh_shift = 0,
                inventory_template,
                stock_lists = null, //required when inventory_template is a function
                profit_margin = 3,
                is_unlocked = true,
            }) 
    {
        super();
        this.name = name;
        this.display_name = display_name || name;
        //A TEXT ID when given; otherwise the default sentence is assembled from
        //the shown name at render time, so it can be reordered per language.
        this.trade_text = trade_text;

        /** The shown name. this.name is the registry key and stays English. */
        this.getDisplayName = () => translationManager.getDisplayName(language, this.display_name);

        /**
         * The label on the button that opens the shop.
         *
         * assembleName rather than getText for the default: trader display
         * names are stored lowercase, and a language that puts the name first
         * - Turkish does - would otherwise open the button with a lowercase
         * letter. Capitalising the assembled result leaves English untouched,
         * because there the pattern's own first word already carries it.
         */
        this.getTradeText = () => this.trade_text
            ? translationManager.getText(language, this.trade_text)
            : translationManager.assembleName(language, "ui trade with",
                {v1: `name ${this.display_name}`}, {capitalise: true});

        /** The unlock message, or null for a trader with none. */
        this.getUnlockMessage = () => this.unlock_message
            ? translationManager.getText(language, this.unlock_message)
            : this.unlock_message;
        this.unlock_message = unlock_message,
        this.last_refresh = -1;  
        //just the day_count from game_time at which trader was supposedly last refreshed

        this.refresh_time = refresh_time; 
        //7 would mean it's refreshed every 7 days (with shift at 0 it's every monday)
        
        this.refresh_shift = refresh_shift; 
        //shift refreshing days, e.g. time 7 + shift 2 would be every wednesday, shift 4 would push it to every friday
        //pretty much pointless if refresh time is not N*7
        
        this.inventory_template = inventory_template;
        /*
            Every list the template above can return. Only a derived template needs it;
            for a plain name, stock_lists_of falls back to the name itself.
        */
        this.stock_lists = stock_lists;
        //a template for the trader to use, so multiple traders can have same predefined item selection (but still separate and with certain randomness)
        /*
            It may also be a FUNCTION returning a template name, which is how a shelf
            that changes with the world is done here. It has to be derived rather than
            stored: this field is not written to the save, so a template swapped onto a
            trader at runtime survives until the tab is closed and then quietly reverts,
            with nothing failing to say so (P-14, Q-10). Resolving it at every refresh
            means the world decides, every time, and the save never has an opinion.
        */

        this.profit_margin = profit_margin;
        //how much more expensive are the trader's items than their actual value, with default being 2 (so 2x more)
        //don't make it too low to prevent easy xp grinding for the haggling skill
        this.is_unlocked = is_unlocked;

        this.is_finished = false; 
        //for permalocking a trader; named like this for consistency with other things that can get locked; only for some fringe situations (e.g. swapping some trader for a better one instead of simply unlocking another)
    }
    
    /**
     * refreshes trader inventory
     * @returns boolean informing if it was able to refresh
     */
    refresh() {
        if(this.can_refresh()) {
            //refresh inventory
            this.inventory = this.get_inventory_from_template();

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

    /**
     * creates new choice of items for the trader, based on assigned inventory template
     * @returns {null}
     */
    get_inventory_from_template() {
        const inventory = {};
        const template_name = stock_list_name_of(this);
        const inventory_template = inventory_templates[template_name];
        if(!inventory_template) {
            //Loud rather than an empty shop: a name that resolves to nothing is a typo
            //in content, and an empty shelf is indistinguishable from a bad roll.
            console.error(`Trader "${this.name}" asked for stock list "${template_name}", which does not exist.`);
            return inventory;
        }

        for (let i = 0; i < inventory_template.length; i++) {
            if (inventory_template[i].chance >= Math.random()) {
                let item_count = inventory_template[i].count.length == 1 ?
                inventory_template[i].count[0] : Math.round(Math.random() *
                    (inventory_template[i].count[1] - inventory_template[i].count[0]) + inventory_template[i].count[0]);
                
                if(inventory_template[i].quality) {
                    let quality = Math.round(Math.random() *
                        (inventory_template[i].quality[1] - inventory_template[i].quality[0]) + inventory_template[i].quality[0]);

                    const item = getItem({...item_templates[inventory_template[i].item_name], quality});
                    inventory[item.getInventoryKey()] = { item: item, count: item_count };
                } else {
                    inventory[item_templates[inventory_template[i].item_name].getInventoryKey()] = { item: getItem(item_templates[inventory_template[i].item_name]), count: item_count }; 
                }
            }
        }

        //just add items based on their chances and counts in inventory_template
        return inventory;
    }

    /**
     * 
     * @returns {Number} trader's profit margin multiplied by bonus from the haggling skill and by reputation impact
     */
    getProfitMargin(region) {

        const skill_multi = (1-get_total_level_bonus("Haggling"));
        const rep_multi = (1-Math.min(1000,character.reputation[region])/2000) || 1;

        return 1 + (this.profit_margin - 1) * skill_multi * rep_multi;
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

class TradeItem {
    constructor({ item_name,
                  chance = 1,
                  count = [1],
                  quality = null,
                }) 
    {
        this.item_name = item_name;
        this.chance = chance; //chance for item to appear, 1 is 100%
        this.count = count; 
        //how many can appear, will randomly choose something between min and max if specificed, otherwise will go with specific ammount
        
        this.quality = quality; //min and max quality of item
    }
}

//create traders
(function(){
    traders["village trader"] = new Trader({
        name: "village trader",
        inventory_template: "Basic",
        is_unlocked: false,
        trade_text: "ui trade village market",
        unlock_message: "ui unlocked village market",
        profit_margin: 4,
    });
    traders["suspicious trader"] = new Trader({
        name: "suspicious trader",
        inventory_template: "Basic plus",
        is_unlocked: true,
        profit_margin: 6,
    });
    traders["suspicious trader 2"] = new Trader({
        name: "suspicious trader 2",
        display_name: "suspicious trader",
        inventory_template: "Intermediate",
        is_unlocked: false,
        profit_margin: 6,
    });
    traders["swampland trader"] = new Trader({
        name: "swampland trader",
        inventory_template: "Swamp",
        is_unlocked: true,
        profit_margin: 7,
    });
    traders["swampland trader 2"] = new Trader({
        name: "swampland trader",
        inventory_template: "Swamp plus",
        is_unlocked: false,
        profit_margin: 5,
    });
    /*
        The bay trader. Locked until the region is - the salt house is inside it.

        Its stock is deliberately assembled out of templates that already exist. The
        cook promised "many spice and meat and metal and leather... from very far
        away", and the honest way to deliver that is a shelf holding things the
        player has only ever had to make or hunt for, at a price that says somebody
        carried them a long way. Not new loot.
    */
    traders["bay trader"] = new Trader({
        name: "bay trader",
        //Derived at every refresh, never stored - see the note on the field. In the two
        //seasons the Marrowmoth can work the ebb, the shed is holding what she landed;
        //the rest of the year it is down to what is left of it.
        inventory_template: () => is_marrowmoth_in_port(current_game_time.getSeason()) ? "Bay in port" : "Bay",
        //Both of them, so the Discoveries panel knows what this shed can hold rather
        //than only what is on the shelf the day it first looked.
        stock_lists: ["Bay in port", "Bay"],
        is_unlocked: false,
        //Higher than the swamp and the slums both. Everything here has been on a
        //boat, and the price says so.
        profit_margin: 8,
    });
    traders["nekomimi trader"] = new Trader({
        name: "nekomimi cafe trader",
        inventory_template: "Cat cafe",
        is_unlocked: false,
        profit_margin: 20, //it's the kind of place where you pay for the company as much as for the food
    });
    traders["cat cafe trader"] = new Trader({
        name: "cat cafe trader",
        inventory_template: "Cat cafe",
        is_unlocked: false,
        profit_margin: 18, //it's the kind of place where you pay for the company as much as for the food, but slightly less
    });
})();

//create inventory templates
(function(){
    inventory_templates["Basic"] = 
    [
            new TradeItem({item_name: "Cheap iron spear", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron dagger", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron sword", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron axe", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron battle hammer", count: [1], quality: [40, 90], chance: 0.8}),

            new TradeItem({item_name: "Cheap iron spear", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron dagger", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron sword", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron axe", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron battle hammer", count: [1], quality: [91, 120], chance: 0.4}),

            new TradeItem({item_name: "Iron spear", count: [1], quality: [70, 90], chance: 0.4}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [70, 90], chance: 0.4}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [70, 90], chance: 0.4}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [70, 90], chance: 0.4}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [70, 90], chance: 0.4}),

            new TradeItem({item_name: "Wooden training shield", count: [1], quality: [100,100]}),
            new TradeItem({item_name: "Cheap wooden shield", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap wooden shield", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Crude wooden shield", count: [1], chance: 0.7, quality: [40, 90]}),
            new TradeItem({item_name: "Crude wooden shield", count: [1], chance: 0.4, quality: [91, 120]}),

            new TradeItem({item_name: "Cheap leather vest", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather vest", count: [1], chance: 0.5, quality: [91, 120]}),
            new TradeItem({item_name: "Cheap leather pants", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather pants", count: [1], chance: 0.5, quality: [91, 120]}),
            new TradeItem({item_name: "Cheap leather hat", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather hat", count: [1], chance: 0.5, quality: [91, 120]}),
            new TradeItem({item_name: "Cheap leather shoes", count: [1], chance: 0.5, quality: [91, 120]}),

            new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.4, quality: [91, 120]}),
            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.7, quality: [70, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.7, quality: [70, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.7, quality: [70, 120]}),
            new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.7, quality: [70, 120]}),
            new TradeItem({item_name: "Work shoes", count: [1,2], chance: 0.6, quality: [100, 100]}),

            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.3, quality: [60, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.3, quality: [60, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.3, quality: [60, 120]}),

            new TradeItem({item_name: "Rat pelt cape", count: [1,3], chance: 1, quality: [70, 120]}),

            new TradeItem({item_name: "Stale bread", count: [7,14]}),
            new TradeItem({item_name: "Bread kwas", count: [3,5], chance: 0.6}),
            new TradeItem({item_name: "Fresh bread", count: [4,7]}),

            //A carrot and a potato, which the village had no way to sell anybody
            //despite both being fully authored. The raw potato gives Slight food
            //poisoning and its own description says "just remember to cook it
            //first!", so selling it raw is the joke working as intended.
            new TradeItem({item_name: "Carrot", count: [4,9]}),
            new TradeItem({item_name: "Potato", count: [4,9]}),
            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),
            new TradeItem({item_name: "Cooking herbs", count: [2,4], chance: 0.5}),

            new TradeItem({item_name: "Coal", count: [5,20]}),

            new TradeItem({item_name: "ABC for kids", count: [1], chance: 1}),
            new TradeItem({item_name: "Old combat manual", count: [1], chance: 0.5}),
            new TradeItem({item_name: "Butchering and you", count: [1], chance: 0.2}),
            new TradeItem({item_name: "Medicine for dummies", count: [1], chance: 0.2}),
            new TradeItem({item_name: "Ode to Whimsy, and other poems", count: [1], chance: 0.2}),
            new TradeItem({item_name: "A Glint On The Sand", count: [1], chance: 0.2}),
            
            new TradeItem({item_name: "Glass phial", count: [5,10], chance: 1}),
            new TradeItem({item_name: "Glass bottle", count: [4,8], chance: 1}),

            new TradeItem({item_name: "Camping supplies", count: [1,3], chance: 1}),
            new TradeItem({item_name: "Coil of rope", count: [1,3], chance: 1}),


            new TradeItem({item_name: "Old pickaxe", count: [1], chance: 1}),
            new TradeItem({item_name: "Old axe", count: [1], chance: 1}),
            new TradeItem({item_name: "Old sickle", count: [1], chance: 1}),
            new TradeItem({item_name: "Old shovel", count: [1], chance: 1}),
    ];

    inventory_templates["Basic plus"] = 
    [
            new TradeItem({item_name: "Iron spear", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [40, 80], chance: 0.8}),

            new TradeItem({item_name: "Iron spear", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [81, 120], chance: 0.8}),

            new TradeItem({item_name: "Steel spear", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [70, 100], chance: 0.5}),
            
            new TradeItem({item_name: "Steel spear", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [81, 120], chance: 0.4}),

            new TradeItem({item_name: "Wooden shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Wooden shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.6, quality: [40, 80]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.4, quality: [81, 120]}),
            new TradeItem({item_name: "Steel shield", count: [1], chance: 0.3, quality: [81, 100]}),
            new TradeItem({item_name: "Ash wood shield", count: [1], chance: 0.3, quality: [81, 100]}),

            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Work shoes", count: [2,3], chance: 0.6, quality: [100, 100]}),

            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.8, quality: [91, 120]}),

            new TradeItem({item_name: "Rat pelt cape", count: [1,2], chance: 0.6, quality: [70, 120]}),
            new TradeItem({item_name: "Wolf pelt cape", count: [1], chance: 0.9, quality: [70, 120]}),
            
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.6, quality: [81, 120]}),
            
            new TradeItem({item_name: "Stale bread", count: [4,10]}),
            new TradeItem({item_name: "Fresh bread", count: [2,5]}),
            new TradeItem({item_name: "Bread kwas", count: [1,3]}),
            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),
            new TradeItem({item_name: "Oneberry juice", count: [2,5]}),
            new TradeItem({item_name: "Cooking herbs", count: [1,4], chance: 0.6}),

            new TradeItem({item_name: "Coal", count: [20,50]}),

            new TradeItem({item_name: "Twist liek a snek", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Butchering and you", count: [1], chance: 0.6}),
            new TradeItem({item_name: "Medicine for dummies", count: [1], chance: 0.6}),
            new TradeItem({item_name: "Ode to Whimsy, and other poems", count: [1], chance: 0.4}),
            new TradeItem({item_name: "A Glint On The Sand", count: [1], chance: 0.4}),
            new TradeItem({item_name: "Counting Mice", count: [1], chance: 0.9}),

            new TradeItem({item_name: "Glass phial", count: [5,10], chance: 1}),
            new TradeItem({item_name: "Glass bottle", count: [4,8], chance: 1}),

            new TradeItem({item_name: "Camping supplies", count: [1], chance: 1}),
            new TradeItem({item_name: "Coil of rope", count: [1], chance: 1}),

            new TradeItem({item_name: "Iron sickle", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron pickaxe", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron chopping axe", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron shovel", count: [1], chance: 0.8}),
    ];

    inventory_templates["Intermediate"] = 
    [
        new TradeItem({item_name: "Iron spear", count: [1], quality: [100, 120], chance: 0.8}),
        new TradeItem({item_name: "Iron dagger", count: [1], quality: [100, 120], chance: 0.8}),
        new TradeItem({item_name: "Iron sword", count: [1], quality: [100, 120], chance: 0.8}),
        new TradeItem({item_name: "Iron axe", count: [1], quality: [100, 120], chance: 0.8}),
        new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [100, 120], chance: 0.8}),

        new TradeItem({item_name: "Steel spear", count: [1], quality: [80, 100], chance: 0.8}),
        new TradeItem({item_name: "Steel dagger", count: [1], quality: [80, 100], chance: 0.8}),
        new TradeItem({item_name: "Steel sword", count: [1], quality: [80, 100], chance: 0.8}),
        new TradeItem({item_name: "Steel axe", count: [1], quality: [80, 100], chance: 0.8}),
        new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [80, 100], chance: 0.8}),

        new TradeItem({item_name: "Steel spear", count: [1], quality: [81, 120], chance: 0.8}),
        new TradeItem({item_name: "Steel dagger", count: [1], quality: [81, 120], chance: 0.8}),
        new TradeItem({item_name: "Steel sword", count: [1], quality: [81, 120], chance: 0.8}),
        new TradeItem({item_name: "Steel axe", count: [1], quality: [81, 120], chance: 0.8}),
        new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [81, 120], chance: 0.8}),

        new TradeItem({item_name: "Wooden shield", count: [1], quality: [40, 80]}),
        new TradeItem({item_name: "Wooden shield", count: [1], chance: 0.8, quality: [81, 120]}),
        new TradeItem({item_name: "Cheap iron shield", count: [1], quality: [40, 80]}),
        new TradeItem({item_name: "Cheap iron shield", count: [1], chance: 0.8, quality: [81, 120]}),
        new TradeItem({item_name: "Iron shield", count: [1], chance: 0.6, quality: [40, 80]}),
        new TradeItem({item_name: "Iron shield", count: [1], chance: 0.4, quality: [81, 120]}),
        new TradeItem({item_name: "Steel shield", count: [1], chance: 0.4, quality: [81, 120]}),
        new TradeItem({item_name: "Ash wood shield", count: [1], chance: 0.4, quality: [81, 120]}),

        new TradeItem({item_name: "Leather vest", count: [1], chance: 0.9, quality: [81, 120]}),
        new TradeItem({item_name: "Leather pants", count: [1], chance: 0.9, quality: [81, 120]}),
        new TradeItem({item_name: "Leather hat", count: [1], chance: 0.9, quality: [81, 120]}),
        new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.8, quality: [91, 120]}),
        new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.8, quality: [91, 120]}),
        new TradeItem({item_name: "Work shoes", count: [2,3], chance: 0.6, quality: [100, 100]}),

        new TradeItem({item_name: "Goat leather vest", count: [1], chance: 0.5, quality: [81, 120]}),
        new TradeItem({item_name: "Goat leather pants", count: [1], chance: 0.5, quality: [81, 120]}),
        new TradeItem({item_name: "Goat leather hat", count: [1], chance: 0.5, quality: [81, 120]}),
        new TradeItem({item_name: "Goat leather shoes", count: [1], chance: 0.5, quality: [81, 120]}),
        new TradeItem({item_name: "Goat leather gloves", count: [1], chance: 0.5, quality: [81, 120]}),

        new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.8, quality: [91, 120]}),
        new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.8, quality: [91, 120]}),
        new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.8, quality: [91, 120]}),
        
        new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.8, quality: [81, 120]}),
        new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.8, quality: [81, 120]}),
        new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.8, quality: [81, 120]}),

        new TradeItem({item_name: "Steel chainmail armor", count: [1], chance: 0.6, quality: [81, 120]}),
        new TradeItem({item_name: "Steel chainmail pants", count: [1], chance: 0.6, quality: [81, 120]}),
        new TradeItem({item_name: "Steel chainmail helmet", count: [1], chance: 0.6, quality: [81, 120]}),

        new TradeItem({item_name: "Wolf pelt cape", count: [1], chance: 0.9, quality: [70, 120]}),
        new TradeItem({item_name: "Boar hide cape", count: [1], chance: 0.9, quality: [70, 120]}),
        new TradeItem({item_name: "Goat hide cape", count: [1], chance: 0.9, quality: [70, 120]}),
        new TradeItem({item_name: "Bear hide cape", count: [1], chance: 0.5, quality: [70, 120]}),
        
        
        new TradeItem({item_name: "Fresh bread", count: [4,10]}),
        new TradeItem({item_name: "Bread kwas", count: [2,5]}),
        new TradeItem({item_name: "Weak healing powder", count: [2,5]}),
        new TradeItem({item_name: "Oneberry juice", count: [2,5]}),
        new TradeItem({item_name: "Healing powder", count: [2,5]}),
        new TradeItem({item_name: "Healing potion", count: [2,5]}),
        new TradeItem({item_name: "Cooking herbs", count: [2,5], chance: 0.8}),

        new TradeItem({item_name: "Coal", count: [20,50]}),

        new TradeItem({item_name: "Twist liek a snek", count: [1], chance: 1}),
        new TradeItem({item_name: "Butchering and you", count: [1], chance: 1}),
        new TradeItem({item_name: "Medicine for dummies", count: [1], chance: 1}),
        new TradeItem({item_name: "Ode to Whimsy, and other poems", count: [1], chance: 0.4}),
        new TradeItem({item_name: "A Glint On The Sand", count: [1], chance: 0.4}),
        new TradeItem({item_name: "Wood for Witches", count: [1], chance: 0.2}),
        new TradeItem({item_name: "Counting Mice", count: [1], chance: 0.9}),

        new TradeItem({item_name: "Glass phial", count: [10,16], chance: 1}),
        new TradeItem({item_name: "Glass bottle", count: [6,12], chance: 1}),

        new TradeItem({item_name: "Camping supplies", count: [1], chance: 1}),
        new TradeItem({item_name: "Coil of rope", count: [1], chance: 1}),

        new TradeItem({item_name: "Iron sickle", count: [1], chance: 1}),
        new TradeItem({item_name: "Iron pickaxe", count: [1], chance: 1}),
        new TradeItem({item_name: "Iron chopping axe", count: [1], chance: 1}),
        new TradeItem({item_name: "Iron shovel", count: [1], chance: 1}),
    ];

	inventory_templates["Swamp"] = 
    [
            new TradeItem({item_name: "Alligator jerky", count: [1,2]}),
            new TradeItem({item_name: "Snake jerky", count: [1,2]}),
            new TradeItem({item_name: "Turtle jerky", count: [1,2]}),

            new TradeItem({item_name: "Cooking herbs", count: [1,3]}),
            new TradeItem({item_name: "Wild onion", count: [1,3]}),
            new TradeItem({item_name: "Wild garlic", count: [1,3]}),
            new TradeItem({item_name: "Wild potato", count: [1,3]}),
    ];
	inventory_templates["Bay"] =
    [
            //The spice and the meat. The far-away part is the price, not the item.
            new TradeItem({item_name: "Cooking herbs", count: [6,12]}),
            new TradeItem({item_name: "Wild garlic", count: [6,12]}),
            new TradeItem({item_name: "Wild onion", count: [6,12]}),
            new TradeItem({item_name: "Snake jerky", count: [3,6]}),
            new TradeItem({item_name: "Turtle jerky", count: [3,6]}),

            //The metal. Iron and steel bars in quantity, which the player has only
            //ever had by smelting them one at a time.
            new TradeItem({item_name: "Iron ingot", count: [4,8], chance: 0.8}),
            new TradeItem({item_name: "Steel ingot", count: [2,5], chance: 0.5}),
            new TradeItem({item_name: "Piece of iron ore", count: [6,12], chance: 0.6}),

            //The leather.
            new TradeItem({item_name: "Piece of leather", count: [4,9], chance: 0.7}),
            new TradeItem({item_name: "Piece of rough leather", count: [4,9], chance: 0.7}),

            /*
                And the metal the cook actually promised: "Many spice and meat and
                metal and leather come from there! From very far away!"

                White and black iron ore. Nothing in this country mines either and
                nothing else sells them, so the bay is the whole supply - which is
                what "from very far away" has to mean if it means anything. Small
                counts and a low chance: the shed has what the last hull brought.
            */
            new TradeItem({item_name: "White iron ore", count: [3,7], chance: 0.35}),
            new TradeItem({item_name: "Black iron ore", count: [3,7], chance: 0.35}),

            new TradeItem({item_name: "Healing balm", count: [1,3], chance: 0.3}),
            new TradeItem({item_name: "Healing powder", count: [1,3], chance: 0.3}),

            //The region's only book, and the only place that sells it (P-15).
            new TradeItem({item_name: "Nothing Bites Here", count: [1], chance: 0.5}),

            //The region's only book, and the only place that sells it (P-15).
    ];
	inventory_templates["Bay in port"] =
    [
            /*
                The same shed, with a hull alongside it.

                Nothing here is new: the whole list is "Bay" with the far-away half
                turned certain. That is the point of the change and the reason it can
                be read without a word of explanation - the player who walked up here
                in summer and found two sacks of white iron ore at a third of a chance
                comes back in autumn and finds the floor covered in it. A shelf saying
                a ship came in is worth more than a notification saying so, and it is
                the only thing at the bay that says it out loud.

                Prices are untouched. The bay's profit margin is already the highest in
                the game because everything here has been on a boat; a glut does not
                make the carriage cheaper, it only means there is some.
            */
            new TradeItem({item_name: "Cooking herbs", count: [12,20]}),
            new TradeItem({item_name: "Wild garlic", count: [12,20]}),
            new TradeItem({item_name: "Wild onion", count: [12,20]}),
            new TradeItem({item_name: "Snake jerky", count: [6,10]}),
            new TradeItem({item_name: "Turtle jerky", count: [6,10]}),

            new TradeItem({item_name: "Iron ingot", count: [8,16]}),
            new TradeItem({item_name: "Steel ingot", count: [5,10]}),
            new TradeItem({item_name: "Piece of iron ore", count: [12,24]}),

            new TradeItem({item_name: "Piece of leather", count: [9,16]}),
            new TradeItem({item_name: "Piece of rough leather", count: [9,16]}),

            //The two ores nothing in this country mines. Out of season the shed has
            //what is left of the last landing; in season it has the landing.
            new TradeItem({item_name: "White iron ore", count: [8,16]}),
            new TradeItem({item_name: "Black iron ore", count: [8,16]}),

            new TradeItem({item_name: "Healing balm", count: [2,5], chance: 0.7}),
            new TradeItem({item_name: "Healing powder", count: [2,5], chance: 0.7}),

            new TradeItem({item_name: "Nothing Bites Here", count: [1], chance: 0.9}),

    ];
	inventory_templates["Swamp plus"] = 
    [
            new TradeItem({item_name: "Alligator jerky", count: [2,5]}),
            new TradeItem({item_name: "Snake jerky", count: [2,5]}),
            new TradeItem({item_name: "Turtle jerky", count: [2,5]}),

            new TradeItem({item_name: "Cooking herbs", count: [3,6]}),
            new TradeItem({item_name: "Wild onion", count: [3,6]}),
            new TradeItem({item_name: "Wild garlic", count: [3,6]}),
            new TradeItem({item_name: "Wild potato", count: [5,9]}),

            new TradeItem({item_name: "Alligator armor", count: [1], quality: [70, 100], chance: 0.05}),
            new TradeItem({item_name: "Alligator helmet", count: [1], quality: [70, 100], chance: 0.05}),
            new TradeItem({item_name: "Alligator armored pants", count: [1], quality: [70, 100], chance: 0.05}),

            new TradeItem({item_name: "Turtleshell platemail armor", count: [1], quality: [70, 100], chance: 0.01}),
            new TradeItem({item_name: "Turtleshell platemail helmet", count: [1], quality: [70, 100], chance: 0.01}),
            new TradeItem({item_name: "Turtleshell platemail pants", count: [1], quality: [70, 100], chance: 0.01}),
            new TradeItem({item_name: "Turtleshell shield", count: [1], quality: [70, 100], chance: 0.01}),

            new TradeItem({item_name: "Shellfish desires", count: [1], chance: 0.5}),

            new TradeItem({item_name: "Healing balm", count: [1,2], chance: 0.15}),
            new TradeItem({item_name: "Healing powder", count: [1,3], chance: 0.2}),
            new TradeItem({item_name: "Healing potion", count: [1,3], chance: 0.25}),

            new TradeItem({item_name: "Oneberry", count: [1,4], chance: 0.1}),
            new TradeItem({item_name: "Silver thistle", count: [1,3], chance: 0.1}),
            new TradeItem({item_name: "Golmoon leaf", count: [1,3], chance: 0.1}),
            new TradeItem({item_name: "Belmart leaf", count: [1,3], chance: 0.1}),
    ];

    inventory_templates["Cat cafe"] = 
    [
        new TradeItem({item_name: "Fresh bread", count: [2,5]}), //for clients with simpler taste
        new TradeItem({item_name: "Bread kwas", count: [8,12]}),
        new TradeItem({item_name: "Cooked clam", count: [4,6]}),
        new TradeItem({item_name: "Crab bisque", count: [4,6]}),
        new TradeItem({item_name: "Kingsized frog legs", count: [4,6]}),
        new TradeItem({item_name: "Fish steak", count: [4,6]}),

        /*
            The menu the proprietress actually reads out. Asked what the place
            serves, she answers "Coffee, cider, cake, and whatever the kitchen
            managed not to drop today" - and none of the first three were on the
            shelf. All four items were fully authored, with descriptions in both
            languages and working effects, and no player could get one.

            Cake is two items because the game has two: an apple pie and a carrot
            cake, both "Sweet dessert". Listing both is what "cake" means here.
        */
        new TradeItem({item_name: "Black coffee", count: [4,8]}),
        new TradeItem({item_name: "Cider", count: [3,6]}),
        new TradeItem({item_name: "Apple pie", count: [2,4]}),
        new TradeItem({item_name: "Carrot cake", count: [2,4]}),
    ]

})();
export { traders, inventory_templates, TradeItem, stock_list_name_of, stock_lists_of };