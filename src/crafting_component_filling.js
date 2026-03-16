"use strict";
import { item_templates, ShieldComponent, WeaponComponent } from "./items.js";
import { capitalize_first_letter } from "./display.js";

const base_value = 35; //todo: base it on material prices instead

const component_types = {
    SHORT_BLADE: "short blade",
    LONG_BLADE: "long blade",
    AXE_HEAD: "axe head",
    HAMMER_HEAD: "hammer head",

    SHORT_HANDLE: "short handle",
    MEDIUM_HANDLE: "medium handle",
    LONG_HANDLE: "long handle",
    
    SHIELD_HANDLE: "shield handle",
    SHIELD_BASE: "shield base",
};

/**
 * 100 is a default value for most cases
 * 50 is the minimum weight for weapon handles, going lower will result in heavier components of same material being faster (i.e. long faster than short)
 * 60 is the minimum strength for shield bases
 */
const material_properties = {
    "rough wood": {
        tier: 1,
        weight: 60,
        strength: 60,
        name: "simple",
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE, 
            component_types.SHIELD_HANDLE, component_types.SHIELD_BASE,
        ]
    },
    "cheap iron": {
        tier: 1,
        weight: 100,
        strength: 100,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_BASE,
        ]
    },
    "wood": {
        tier: 2,
        weight: 60,
        strength: 60,
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_HANDLE, component_types.SHIELD_BASE,
        ]
    },
    "iron": {
        tier: 2,
        weight: 100,
        strength: 100,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_BASE,
        ]
    },
    "ash wood": {
        tier: 3,
        weight: 60,
        strength: 60,
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_HANDLE, component_types.SHIELD_BASE,
        ]
    },
    "week bone": {
        tier: 3,
        weight: 80,
        strength: 80,
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
            component_types.SHIELD_BASE,
        ]
    },
    "hickory wood": {
        tier: 4,
        weight: 60,
        strength: 60,
        name: "hickory",
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_HANDLE, component_types.SHIELD_BASE,
        ]
    },
    "turtleshell": {
        tier: 4,
        weight: 80,
        strength: 80,
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_HANDLE, component_types.SHIELD_BASE,
        ],
        additional_stats: {
            attack_points: {
                multiplier: 1.1,
            }
        }
    },
    "white iron": {
        tier: 4,
        weight: 130,
        strength: 100,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_BASE,
        ]
    },
    "black iron": {
        tier: 4,
        weight: 80,
        strength: 110,
        types: [
            component_types.SHORT_BLADE, component_types.LONG_BLADE, component_types.AXE_HEAD, component_types.HAMMER_HEAD,
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_BASE,
        ]
    },
    "alchemical wood": {
        tier: 5,
        weight: 60,
        strength: 60,
        name: "alchemical",
        types: [
            component_types.SHORT_HANDLE, component_types.MEDIUM_HANDLE, component_types.LONG_HANDLE,
            component_types.SHIELD_HANDLE, component_types.SHIELD_BASE,
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
            component_types.SHIELD_BASE,
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
            component_types.SHIELD_BASE,
        ]
    },

};

/**
 * weight impact on dmg
 */
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

/**
 * material str impact on damage
 */
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
    
    "shield handle": 4,
    "shield base": 6,
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
                let component_stats = structuredClone(material.additional_stats) || {};

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

                    let attack_value = base_attack * (1 + strength_impact_per_type[material.types[i]]*(material.strength/100)) * material.tier * (1 + weight_impact_per_type[material.types[i]]*(material.weight/100))/8;

                    let attack_speed = Math.round(100*
                        (1 + (material.tier-1)/10)/(1 + (weight_impact_on_speed_per_type[material.types[i]]*material.weight)/1000)
                    )/100;

                    if(material.types[i] === component_types.SHORT_BLADE) {
                        //CRIT BONUS FOR SHORT BLADES
                        let crit_bonus = 0.05 * material.tier;
                        if(component_stats.crit_bonus?.flat) {
                            component_stats.crit_bonus.flat += crit_bonus;
                        } else {
                            if(!component_stats.crit_bonus) component_stats.crit_bonus = {};
                            component_stats.crit_bonus.flat = crit_bonus;
                        }
                    } else if(material.types[i] === component_types.LONG_BLADE) {
                        //AP BONUS FOR LONG BLADES 
                        let AP_multi = 1 +  0.05 * material.tier;
                        if(component_stats.attack_points?.multiplier) {
                            component_stats.attack_points.multiplier *= AP_multi;
                        } else {
                            if(!component_stats.attack_points) component_stats.attack_points = {};
                            component_stats.attack_points.multiplier = AP_multi;
                        }

                        //SMALLER CRIT BONUS FOR SHORT BLADES
                        let crit_bonus = 0.02 * material.tier;
                        if(component_stats.crit_bonus?.flat) {
                            component_stats.crit_bonus.flat += crit_bonus;
                        } else {
                            if(!component_stats.crit_bonus) component_stats.crit_bonus = {};
                            component_stats.crit_bonus.flat = crit_bonus;
                        }
                    }
                    
                
                    item = new WeaponComponent({ 
                        name: item_id,
                        description,
                        component_type: material.types[i],
                        value: Math.round(material.tier * base_value * material_count_per_type[material_key]/10)*10 + 10,
                        name_prefix: capitalize_first_letter(material.name || material_key),
                        component_tier: material.tier,
                        attack_value: Math.floor(attack_value),
                                    
                        component_stats: {
                            attack_speed: {
                                multiplier: attack_speed,
                            },
                        }
                    });

                } else if(material.types[i] === component_types.SHORT_HANDLE|| material.types[i] === component_types.MEDIUM_HANDLE || material.types[i] ===  component_types.LONG_HANDLE) {
                    //WEAPON HANDLES
                    
                    let attack_multiplier = Math.floor(100*(
                        1 + (1 + material.tier/20) * (1 + weight_impact_per_type[material.types[i]]*(material.weight - 40))/1000
                    ))/100;

                    let attack_speed = Math.floor(100*(
                        (1 + material.tier/20)/(1 + (weight_impact_on_speed_per_type[material.types[i]]*(material.weight - 50))/1000)
                    ))/100;

                    if(component_stats.attack_speed?.multiplier) {
                        component_stats.attack_speed.multiplier *= attack_speed;
                    } else {
                        if(!component_stats.attack_speed) component_stats.attack_speed = {};
                        component_stats.attack_speed.multiplier = attack_speed;
                    }

                    if(component_stats.attack_power?.multiplier) {
                        component_stats.attack_power.multiplier *= attack_multiplier;
                    } else {
                        if(!component_stats.attack_power) component_stats.attack_power = {};
                        component_stats.attack_power.multiplier = attack_multiplier;
                    }
                    
                    item = new WeaponComponent({ 
                        name: item_id,
                        description,
                        component_type: material.types[i],
                        value: Math.round(material.tier * base_value * material_count_per_type[material_key]/10)*10 + 10,
                        name_prefix: capitalize_first_letter(material.name || material_key),
                        component_tier: material.tier,
                        component_stats,
                    });
                } else if(material.types[i] === component_types.SHIELD_HANDLE) {
                    item = new ShieldComponent({ 
                        name: item_id,
                        description,
                        component_type: material.types[i],
                        value: Math.round(material.tier * base_value * material_count_per_type[material_key]/10)*10 + 10,
                        name_prefix: capitalize_first_letter(material.name || material_key),
                        component_tier: material.tier,
                        component_stats: {
                             block_strength: {
                                multiplier: 1+Math.floor((material.tier-1)*0.75*10)/10,
                            }
                        }
                    });
                } else if(material.types[i] === component_types.SHIELD_BASE) {
                    item = new ShieldComponent({ 
                        name: item_id,
                        description,
                        component_type: material.types[i],
                        value: Math.round(material.tier * base_value * material_count_per_type[material_key]/10)*10 + 10,
                        name_prefix: capitalize_first_letter(material.name || material_key),
                        component_tier: material.tier,

                        shield_strength: Math.floor(
                            (1+(material.strength)/50)**2 * (1+(material.tier-1)/4)**2 * (1+(material.tier-2)/10)**2 * (1+(material.weight-30)/150)**2
                            //way too complicated
                        ),
                        component_stats: {
                            attack_speed: {
                                multiplier: Math.min(1,Math.floor(100*(1-((material.weight-50)/200)))/100)
                            }
                        }
                    });
                }
                if(!item_templates[item_id]) {
                    item_templates[item_id] = item;
                } else {
                    continue;
                    //todo remove the continue;
                    //todo: make sure this wont be needed by removing old stuff and replacing items in old saves
                    console.error(`Item templates already include something with an id of "${item_id}",`
                        + ` please either remove it or remove "${material.types[i]}" from component types for material "${material_key}"`);
                }
            }
        });
    }
};



export { crafting_component_manager };