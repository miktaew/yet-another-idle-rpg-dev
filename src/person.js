"use strict";

import { InventoryHaver } from "./components/inventory_component.js";
import { racial_height_modifiers } from "./races.js";

const height_values = {
    "very short": 145,
    short: 155,
    average: 170,
    tall: 180,
    "very tall": 190,
};


//for relative heights selected in hero creation
const height_stats = {
    short: {
        strength: {multiplier: 0.9},
        max_health: {multiplier: 0.9},
        agility: {multiplier: 1.1},
        stamina_efficiency: {multiplier: 1.1},
    },
    average: {
        //too average to have anything
    },
    tall: {
        strength: {multiplier: 1.1},
        max_health: {multiplier: 1.1},
        agility: {multiplier: 0.9},
        stamina_efficiency: {multiplier: 0.9},
    }
}

class Person extends InventoryHaver {
    constructor(data = {}){
        super(data);
        this.personal = {
            race: data.race,
            height: data.height,
            age: data.age,
        }
    }

    getNumericalHeight() {
        //this.personal, not this - the constructor stores race/height/age there,
        //and so does character creation. Reading them off the instance made both
        //lookups miss, both fallbacks fire, and this function return a constant
        //170 for every character, which is exactly height_values["average"]. The
        //visible effect was that getUniversalHeight() answered "average" for
        //everyone, so the short/tall choice and the racial modifiers did nothing
        //and the "very short" dialogue branch could never be taken.
        return (height_values[this.personal.height] || height_values["average"])
            + (racial_height_modifiers[this.personal.race] || 0);
    }

    getUniversalHeight()  {
        const height = this.getNumericalHeight();
        if(height >= height_values["very tall"]) {
            return "very tall";
        } else if(height >= height_values["tall"]) {
            return "tall";
        } else if(height >= height_values["average"]) {
            return "average";
        } else if(height >= height_values["short"]) {
            return "short";
        } else {
            return "very short";
        }
    }
}


export {
    Person,
    height_stats, height_values
}