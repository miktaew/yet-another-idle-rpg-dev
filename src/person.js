"use strict";

import { InventoryHaver } from "./inventory.js";
import { racial_height_modifiers } from "./races.js";

const height_values = {
    "very short": 145,
    short: 155,
    average: 170,
    tall: 180,
    "very tall": 190,
};

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
        return (height_values[this.height] || height_values["average"]) + (racial_height_modifiers[this.race] || 0);
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
    Person
}