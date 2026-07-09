"use strict";

import AvailabilityComponent from "../components/availability_component.js";
import { availability_havers } from "../data/component_references.js";

class TradeItem {

    #availability;

    constructor(data)
    {
        this.item_name = data.item_name;
        this.chance = data.chance || 1; //chance for item to appear, 1 is 100%
        this.count = data.count || [1]; 
        //how many can appear, will randomly choose something between min and max if specificed, otherwise will go with specific ammount
        
        this.quality = data.quality; //min and max quality of item
        this.#availability = new AvailabilityComponent({...data, is_unlocked: true});
        //component not saved to availabilities, not meant to use unlock status for this class, just conditions
    }

    getAvailabilityComponent() {
        return this.#availability;
    }
}

class TradeItemGroup {
    #availability;

    constructor(data)
    {
        this.items = data.items;
        this.#availability = new AvailabilityComponent({...data, is_unlocked: true});
        //component not saved to availabilities, not meant to use unlock status for this class, just conditions
    }

    getAvailabilityComponent() {
        return this.#availability;
    }
}

availability_havers.push(TradeItem, TradeItemGroup);

export {TradeItem, TradeItemGroup};