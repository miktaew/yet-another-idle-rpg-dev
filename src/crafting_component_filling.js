"use strict";
import { item_templates, WeaponComponent } from "./items.js";
import { capitalize_first_letter } from "./display.js";

const component_types = {
    SHORT_BLADE: "short blade",
    LONG_BLADE: "long blade",
    AXE_HEAD: "axe head",
    HAMMER_HEAD: "hammer head",

    SHORT_HANDLE: "short handle",
    MEDIUM_HANDLE: "medium handle",
    LONG_HANDLE: "long handle",
};

const component_type_names = {
    SHORT_BLADE: "short blade",
    LONG_BLADE: "long blade",
    AXE_HEAD: "axe head",
    HAMMER_HEAD: "hammer head",

    SHORT_HANDLE: "short hilt", //
    MEDIUM_HANDLE: "medium handle",
    LONG_HANDLE: "long shaft", //
}

/**
 * 100 is a default value
 * 50 is the minimum for weapon handles, going lower will result in heavier components of same material being faster (i.e. long faster than short)
 */
const material_properties = {
    "rough wood": {
        tier: 1,
        weight: 60,
        name: "simple",
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "cheap iron": {
        tier: 1,
        weight: 100,
        strength: 100,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "wood": {
        tier: 2,
        weight: 60,
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "iron": {
        tier: 2,
        weight: 100,
        strength: 100,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "ash wood": {
        tier: 3,
        weight: 60,
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "steel": {
        tier: 3,
        weight: 100,
        strength: 100,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "hickory wood": {
        tier: 4,
        weight: 60,
        name: "hickory",
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "white iron": {
        tier: 4,
        weight: 130,
        strength: 100,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "black iron": {
        tier: 4,
        weight: 80,
        strength: 110,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "alchemical wood": {
        tier: 5,
        weight: 60,
        name: "alchemical",
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "white steel": {
        tier: 5,
        weight: 130,
        strength: 100,
        name: "white",
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },
    "black steel": {
        tier: 5,
        weight: 80,
        strength: 110,
        name: "black",
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
        ]
    },

};

const weight_impact_per_type = {
    "short handle": 1,
    "medium handle": 3,
    "long handle": 8,

    "short blade": 0,
    "long blade": 0.5,
    "axe head": 5,
    "hammer head": 12,
};

const weight_impact_on_speed_per_type = {
    "short handle": 1,
    "medium handle": 5,
    "long handle": 12,

    "short blade": 0.5,
    "long blade": 2,
    "axe head": 4,
    "hammer head": 5,
};

const strength_impact_per_type = {
    "short blade": 8,
    "long blade": 7,
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
                let attack_value = 0;
                let attack_speed = 1;
                let attack_multiplier = 1;

                const item_id = capitalize_first_letter(material.name || material_key) + " " + material.types[i];
                let item;

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
                
                if(material.types[i] === component_types.SHORT_BLADE || material.types[i] === component_types.LONG_BLADE || material.types[i] === component_types.AXE_HEAD || material.types[i] === component_types.HAMMER_HEAD) {
                    //WEAPON HEADS
                    attack_value = base_attack * (1 + strength_impact_per_type[material.types[i]]*(material.strength/100)) * material.tier * (1 + weight_impact_per_type[material.types[i]]*(material.weight/100))/8;

                    attack_speed = Math.round(100*
                        (1 + (material.tier-1)/10)/(1 + (weight_impact_on_speed_per_type[material.types[i]]*material.weight)/1000)
                    )/100;
                
                    item = new WeaponComponent({ 
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
                            },
                        }
                    });

                    //console.log(item_id, item.attack_value, item.component_stats.attack_speed.multiplier);

                } else if(material.types[i] === component_types.SHORT_HANDLE|| material.types[i] === component_types.MEDIUM_HANDLE || material.types[i] ===  component_types.LONG_HANDLE) {
                    //WEAPON HANDLES
                    
                    attack_multiplier = Math.floor(100*(
                        1 + (1 + material.tier/20) * (1 + weight_impact_per_type[material.types[i]]*(material.weight - 40))/1000
                    ))/100;

                    attack_speed = Math.floor(100*(
                        (1 + material.tier/20)/(1 + (weight_impact_on_speed_per_type[material.types[i]]*(material.weight - 50))/1000)
                    ))/100;

                    item = new WeaponComponent({ 
                        name: item_id,
                        description,
                        component_type: material.types[i],
                        value: Math.round(material.tier * 35 * material_count_per_type[material_key]/10)*10 + 10,
                        name_prefix: capitalize_first_letter(material.name || material_key),
                        component_tier: material.tier,
                                    
                        component_stats: {
                            attack_speed: {
                                multiplier: attack_speed,
                            },
                            attack_power: {
                                multiplier: attack_multiplier,
                            }
                        }
                    });

                    console.log(item_id, item.component_stats.attack_power?.multiplier, "/", item.component_stats.attack_speed?.multiplier);
                }

                if(!item_templates[item_id]) {
                    item_templates[item_id] = item;
                } else {
                    console.error(`Item templates already include something with an id of "${item_id}",`
                        + ` please either remove it or remove "${material.types[i]}" from component types for material "${material_key}"`);
                }
            }
        });
    }
};



export { crafting_component_manager };