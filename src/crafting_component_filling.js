"use strict";
import { item_templates, WeaponComponent } from "./items.js";
import { capitalize_first_letter } from "./display.js";

const component_types = {
    SHORT_BLADE: "short blade",
    LONG_BLADE: "long blade",
    AXE_HEAD: "axe head",
    HAMMER_HEAD: "hammer head",
}

/**
 * 100 is a default, balanced value
 */
const material_properties = {
    "cheap iron": {
        tier: 1,
        weight: 100,
        strength: 100,
        types: [component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD]
    },
    "iron": {
        tier: 2,
        weight: 100,
        strength: 100,
        types: [component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD]
    },
    "steel": {
        tier: 3,
        weight: 100,
        strength: 100,
        types: [component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD]
    },
    "white iron": {
        tier: 4,
        weight: 120,
        strength: 120,
        types: [component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD]
    },
    "black iron": {
        tier: 4,
        weight: 80,
        strength: 100,
        types: [component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD]
    },
    "white steel": {
        tier: 5,
        weight: 120,
        strength: 120,
        name: "white",
        types: [component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD]
    },
    "black steel": {
        tier: 5,
        weight: 80,
        strength: 100,
        name: "black",
        types: [component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD]
    },
};

const weight_impact_per_type = {
    "short handle": 0,
    "medium handle": 1,
    "long handle": 3,

    "short blade": 0,
    "long blade": 1,
    "axe head": 3,
    "hammer head": 4,
};

const strength_impact_per_type = {
    "short blade": 4,
    "long blade": 4,
    "axe head": 2,
    "hammer head": 1,
}

const material_count_per_type = {
    "short blade": 2,
    "long blade": 3,
    "axe head": 4,
    "hammer head": 4,
};

const base_attack = 3;


const crafting_component_manager = {

    /**
     * Fills components for item_templates; does NOT create crafting recipes
     */
    fill_components: () => {
        Object.keys(material_properties).forEach(material_key => {
            const material = material_properties[material_key];
            for(let i = 0; i < material.types.length; i++) {
                let description;
                let attack_value;
                let attack_speed;
                switch(material.types[i]) {
                    case component_types.SHORT_BLADE:
                        description = `A short blade made of ${material_key}, perfect for a dagger or a spear`;
                        break;
                    case component_types.LONG_BLADE:
                        description = `A long blade made of ${material_key}, perfect for a sword`;
                        break;
                    case component_types.AXE_HEAD:
                        description = `An axe head made of ${material_key}`;
                        break;
                    case component_types.HAMMER_HEAD:
                        description = `A hammer head made of ${material_key}`;
                        break;       
                }

                //attack_value = base_attack * material.strength * material.tier/100 * (1 + weight_impact_per_type[material.types[i]]*(1+(material.weight-100)/100));
                //todo: include strength impact

                attack_speed = (1 + (material.tier-1)/10)/(1 + (weight_impact_per_type[material.types[i]]*material.weight)/1000);
                //todo: nothing? this seems to give fine values

                const item_id = capitalize_first_letter(material.name || material_key) + " " + material.types[i];
                const item = new WeaponComponent({ 
                    name: item_id,
                    description,
                    component_type: material.types[i],
                    value: Math.round(material.tier * 35 * material_count_per_type[material_key]/10)*10 + 10,
                    name_prefix: capitalize_first_letter(material.name || material_key),
                    component_tier: material.tier,
                    attack_value: Math.floor(attack_value),
                                 
                    component_stats: {
                        attack_speed: {
                            multiplier: attack_speed, 
                        }
                    }
                });

                console.log(item_id, item.attack_value, "/", item.component_stats.attack_speed.multiplier);
                if(!item_templates[item_id]) {
                    item_templates[item_id] = item;
                } else {
                    continue;
                    console.error(`Item templates already include something with an id of "${item_id}",`
                        + ` please either remove it or remove "${material.types[i]}" from component types for material "${material_key}"`);
                }
            }
        });
    }
};



export { crafting_component_manager };