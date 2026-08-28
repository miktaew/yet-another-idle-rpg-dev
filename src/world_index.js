"use strict";

/**
 * What the world holds, indexed the other way round.
 *
 * The content declares things forwards - a zone lists the creatures it fields, a
 * creature lists what it drops, a location lists what can be gathered there and who
 * trades there. The panels need the reverse: where does THIS creature live, where does
 * THIS item come from. Both indexes are that same content read backwards, built once on
 * first use and cached.
 *
 * Nothing here renders or translates. The values are the live registry objects, so a
 * caller reads current state off them and names them however it wants to.
 */

import { locations } from "./data/locations.js";
import { enemy_templates } from "./enemies.js";
import { traders, inventory_templates } from "./traders.js";
import { recipes } from "./crafting_recipes.js";
/**
 * A list, or an empty one - and a word about it when the value was neither.
 *
 * The index reads four fields it does not own, and the first version of it assumed all
 * four were arrays. One was not, and a panel threw while drawing instead of saying which
 * field had surprised it.
 */
function as_list(value, what) {
    if(Array.isArray(value)) {
        return value;
    }
    if(value !== undefined && value !== null) {
        console.warn(`Expected a list${what ? ` for ${what}` : ""}, got ${typeof value}.`);
    }
    return [];
}
/*
    Where each item can be found, built once from the content itself.

    Three sources, all of them already declared somewhere: a location's gathering
    activities name what they yield, a trader's stock names what it sells, and an enemy's
    loot_list names what it drops - and the enemy index above says where that enemy lives.

    Crafted items are left out on purpose. The crafting panel answers "how is this made",
    and a recipe is not somewhere a player can walk to.
*/
let item_sources_index;

function build_item_sources_index() {
    const index = {};

    const note = (item_id, entry) => {
        if(!index[item_id]) {
            index[item_id] = [];
        }
        //Two activities at one place, or one trader stocking an item twice, is one line.
        const already = index[item_id].some(other => other.kind === entry.kind
            && other.location_key === entry.location_key && other.via === entry.via);
        if(!already) {
            index[item_id].push(entry);
        }
    };

    Object.keys(locations).forEach(location_key => {
        const location = locations[location_key];

        Object.values(location.activities || {}).forEach(activity => {
            as_list(activity.gained_resources?.resources, "gained_resources.resources")
                .forEach(resource => {
                note(resource.name, {kind: "gather", location_key});
            });
        });

        as_list(location.traders).forEach(trader_key => {
            //inventory_template holds the NAME of a stock list, not the list - the lists
            //live in inventory_templates. Calling forEach on the name is what threw when
            //this panel was first opened.
            const stock = inventory_templates[traders[trader_key]?.inventory_template];
            as_list(stock).forEach(stocked => {
                if(stocked.item_name) {
                    note(stocked.item_name, {kind: "trade", location_key, via: trader_key});
                }
            });
        });
    });

    Object.keys(enemy_templates).forEach(enemy_key => {
        as_list(enemy_templates[enemy_key].loot_list, "loot_list").forEach(loot => {
            if(!loot.item_name) {
                return;
            }
            enemy_zones(enemy_key).forEach(zone => {
                note(loot.item_name, {kind: "drop", location_key: zone.id, via: enemy_key});
            });
        });
    });


    /*
        Made rather than found. A recipe is not a place, so these lines carry no travel
        button - but "you can craft this" is still the answer to where an item comes
        from, and leaving it out made every craftable read as having no source at all.
    */
    const note_if = (item_id, category) => {
        if(item_id) {
            note(item_id, {kind: "craft", via: category});
        }
    };

    Object.keys(recipes).forEach(category => {
        Object.values(recipes[category] || {}).forEach(subcategory => {
            Object.values(subcategory || {}).forEach(recipe => {
                /*
                    Three places a recipe names what it makes, and a recipe uses one of
                    them: a declared result, a result per material (which is how components
                    and ingots work - one recipe, one result for each material it accepts),
                    or a getResult() that answers for the recipe as a whole.

                    Reading only the third missed 214 items - every blade, handle, shield
                    base, ingot and cooked dish - and they all showed as having no source.
                */
                note_if(recipe.result?.result_id, category);
                as_list(recipe.materials).forEach(material => {
                    note_if(material.result_id, category);
                });

                try {
                    note_if(recipe.getResult?.()?.result_id, category);
                } catch {
                    //Equipment recipes answer per component set, so a bare call can throw.
                    //Their results are generated equippables, covered by their components.
                }
            });
        });
    });
    return index;
}

function item_sources(item_id) {
    if(!item_sources_index) {
        item_sources_index = build_item_sources_index();
    }
    return item_sources_index[item_id] || [];
}

/**
 * One source line: where it is, what makes it available there, and a way to go.
 *
 * The travel button is only offered for a place the player has already unlocked - the
 * whole list is rebuilt each time the tab is opened, so that stays current.
 */

/*
    Which zones each enemy can be met in - the reverse of what the zones declare.

    Built once on first use and cached. The values are the live location objects rather
    than their names, so anything read off them here is read fresh.
*/
let enemy_locations_index;

function build_enemy_locations_index() {
    const index = {};
    Object.values(locations).forEach(zone => {
        //Two shapes, and a zone can carry both: a flat list of possible enemies, and
        //predefined groups holding their own lists.
        const names = new Set(zone.enemies_list || []);
        (zone.enemy_groups_list || []).forEach(group => {
            (group.enemies || []).forEach(name => names.add(name));
        });

        names.forEach(name => {
            if(!index[name]) {
                index[name] = [];
            }
            index[name].push(zone);
        });
    });
    return index;
}

/**
 * The zones a creature can be met in, named and sorted for reading.
 *
 * @param {String} enemy_name the registry key, which is what the zones list
 * @returns {String[]} display names, or an empty array
 */
function enemy_zones(enemy_name) {
    if(!enemy_locations_index) {
        enemy_locations_index = build_enemy_locations_index();
    }
    return enemy_locations_index[enemy_name] || [];
}

export { enemy_zones, item_sources };
