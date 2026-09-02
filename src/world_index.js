// @ts-check
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
import { traders, inventory_templates, stock_lists_of } from "./traders.js";
import { recipes } from "./crafting_recipes.js";
import { activities } from "./activities.js";
import { dialogues } from "./data/dialogues.js";
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
            /*
                Through stock_list_name_of, not by indexing the raw field. The field holds
                a name OR a function that derives one, and indexing it raw is how this
                panel silently lost every item the bay trader sells the day that shelf
                started changing with the season - white and black iron ore included, from
                the only place in the game that sells them. Nothing threw; the panel just
                stopped knowing. Calling forEach on the name is what threw the first time,
                which is the other half of the same lesson.
            */
            /*
                Every list this trader can use, not the one it is using now: this index is
                built once and cached for the session, so reading the current list would
                pin the panel to whatever was on the shelf the first time it was opened.
            */
            stock_lists_of(traders[trader_key]).forEach(list_name => {
                as_list(inventory_templates[list_name]).forEach(stocked => {
                    if(stocked.item_name) {
                        note(stocked.item_name, {kind: "trade", location_key, via: trader_key});
                    }
                });
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
 * The zones a creature can be met in.
 *
 * Returns the LOCATION OBJECTS, not names, and in declaration order. The previous
 * description - "named and sorted for reading", with `@returns {String[]}` - was the
 * journal panel's line about them rather than this function's: `journal_panels.js` is
 * where the `.getName()` and the sort happen, and `world_index.js` reads `.id` off
 * each one. Nothing was broken by it, but it made every caller look wrong.
 *
 * @param {String} enemy_name the registry key, which is what the zones list
 * @returns {Array} the zones, or an empty array
 */
function enemy_zones(enemy_name) {
    if(!enemy_locations_index) {
        enemy_locations_index = build_enemy_locations_index();
    }
    return enemy_locations_index[enemy_name] || [];
}

/*
    Which places train which skill.

    Declared forwards, like everything else here: a location lists its activities, and an
    activity lists the skills it feeds. Fifteen skills can be trained somewhere.
*/
let training_index;

function build_training_index() {
    const index = {};
    Object.keys(locations).forEach(location_key => {
        Object.values(locations[location_key].activities || {}).forEach(local => {
            const activity = activities[local.activity_name];
            as_list(activity?.base_skills_names).forEach(skill_id => {
                if(!index[skill_id]) {
                    index[skill_id] = [];
                }
                if(!index[skill_id].includes(locations[location_key])) {
                    index[skill_id].push(locations[location_key]);
                }
            });
        });
    });
    return index;
}

/**
 * Every skill that can be trained somewhere, with the places that train it.
 *
 * @returns {Object} skill id -> live location objects
 */
function training_places() {
    if(!training_index) {
        training_index = build_training_index();
    }
    return training_index;
}

/**
 * The zones that field any creature carrying a given tag.
 *
 * `kill_any` tasks name a tag rather than a creature - "kill 10 Pest" - so the hint for
 * one has to go through every creature that carries it.
 *
 * @param {String} tag e.g. "beast"
 * @returns {Array} live location objects
 */
function zones_for_enemy_tag(tag) {
    const zones = [];
    Object.keys(enemy_templates).forEach(enemy_key => {
        if(!enemy_templates[enemy_key].tags?.[tag]) {
            return;
        }
        enemy_zones(enemy_key).forEach(zone => {
            if(!zones.includes(zone)) {
                zones.push(zone);
            }
        });
    });
    return zones;
}

/*
    What advances each quest task.

    73 tasks exist and 5 declare a task_condition; the rest are advanced by a
    `quest_progress` reward hung off a dialogue line, a dialogue action or a location
    action. This walks all three and indexes them by quest and task, so the journal can
    say what to do rather than only what is being counted.
*/
let advancers_index;

function build_advancers_index() {
    const index = {};

    const note = (progress, entry) => {
        as_list(progress).forEach(step => {
            if(!step?.quest_id || step.task_index === undefined) {
                return;
            }
            const key = `${step.quest_id}#${step.task_index}`;
            if(!index[key]) {
                index[key] = [];
            }
            const already = index[key].some(other => other.kind === entry.kind
                && other.via === entry.via && other.location_key === entry.location_key);
            if(!already) {
                index[key].push(entry);
            }
        });
    };

    //Where each conversation happens, so a hint can point at a place and not just a name.
    const host_of = {};
    Object.keys(locations).forEach(location_key => {
        as_list(locations[location_key].dialogues).forEach(dialogue_key => {
            host_of[dialogue_key] = location_key;
        });

        Object.keys(locations[location_key].actions || {}).forEach(action_key => {
            note(locations[location_key].actions[action_key].rewards?.quest_progress,
                {kind: "action", via: action_key, location_key});
        });

        //Clearing the zone itself. Eight zones advance a quest this way, and without
        //it the two Giant Enemy Crab tasks - "beat the crab once", "beat it twice" -
        //had nothing to point at.
        ["first_reward", "repeatable_reward"].forEach(which => {
            note(locations[location_key][which]?.quest_progress,
                {kind: "clear", via: location_key, location_key});
        });
    });

    Object.keys(dialogues).forEach(dialogue_key => {
        const location_key = host_of[dialogue_key];

        Object.values(dialogues[dialogue_key].textlines || {}).forEach(line => {
            note(line.rewards?.quest_progress,
                {kind: "talk", via: dialogue_key, location_key});
        });

        Object.values(dialogues[dialogue_key].actions || {}).forEach(action => {
            note(action.rewards?.quest_progress,
                {kind: "talk", via: dialogue_key, location_key});
        });
    });

    return index;
}

/*
    What opens a locked thing.

    A reward can unlock an action or a dialogue line, and both say so in the same shape
    the advancers do. Indexed by what is opened, so a locked step can be walked backwards
    to the first thing the player can actually do.

    Keys are "action:<location>#<action>" and "line:<dialogue>#<line>".
*/
let unlock_sources_index;

function build_unlock_sources_index() {
    const index = {};

    const note = (rewards, opener) => {
        if(!rewards) {
            return;
        }
        const add = (key) => {
            if(!index[key]) {
                index[key] = [];
            }
            const already = index[key].some(other => other.kind === opener.kind
                && other.via === opener.via && other.location_key === opener.location_key);
            if(!already) {
                index[key].push(opener);
            }
        };

        as_list(rewards.actions).forEach(step => {
            if(step?.location && step?.action) {
                add(`action:${step.location}#${step.action}`);
            }
        });
        as_list(rewards.textlines).forEach(step => {
            if(!step?.dialogue) {
                return;
            }
            as_list(step.lines).forEach(line => add(`line:${step.dialogue}#${line}`));
        });
    };

    Object.keys(locations).forEach(location_key => {
        Object.keys(locations[location_key].actions || {}).forEach(action_key => {
            note(locations[location_key].actions[action_key].rewards,
                {kind: "action", via: action_key, location_key});
        });
        ["first_reward", "repeatable_reward"].forEach(which => {
            note(locations[location_key][which],
                {kind: "clear", via: location_key, location_key});
        });
    });

    const host_of = {};
    Object.keys(locations).forEach(location_key => {
        as_list(locations[location_key].dialogues).forEach(dialogue_key => {
            host_of[dialogue_key] = location_key;
        });
    });

    Object.keys(dialogues).forEach(dialogue_key => {
        const location_key = host_of[dialogue_key];
        //The line key travels with the opener: the elder can be available while the one
        //line that matters is still locked, and "talk to the elder" would then be a hint
        //that leads nowhere.
        Object.entries(dialogues[dialogue_key].textlines || {}).forEach(([line_key, line]) => {
            note(line.rewards, {kind: "talk", via: dialogue_key, location_key, line: line_key});
        });
        Object.values(dialogues[dialogue_key].actions || {}).forEach(action => {
            note(action.rewards, {kind: "talk", via: dialogue_key, location_key});
        });
    });

    return index;
}

/**
 * Whether a step can be done right now.
 */
function is_step_available(step) {
    const location = locations[step.location_key];
    if(!location?.is_unlocked) {
        return false;
    }
    if(step.kind === "talk") {
        if(!dialogues[step.via]?.is_unlocked) {
            return false;
        }
        return step.line
            ? !!dialogues[step.via].textlines?.[step.line]?.is_unlocked
            : true;
    }
    if(step.kind === "clear") {
        return !location.is_finished;
    }
    const action = location.actions?.[step.via];
    return !!action?.is_unlocked && !action.is_finished;
}

/**
 * The first thing the player can do that leads to a locked step, walking backwards.
 *
 * "build a hearth" is locked until the village elder mentions a hollow, and he cannot
 * until a flue is cut on the mountain - so the answer to "where do I build a hearth" is
 * a mountain, three links away. Content may be circular, so the walk is cycle-guarded and
 * depth-capped: a hint is not worth a hang.
 *
 * @param {String} key "action:<location>#<action>" or "line:<dialogue>#<line>"
 * @returns {Object|null} an available step, or null if nothing in the chain is reachable
 */
function first_available_opener(key, depth = 0, seen = new Set()) {
    if(depth > 4 || seen.has(key)) {
        return null;
    }
    seen.add(key);

    if(!unlock_sources_index) {
        unlock_sources_index = build_unlock_sources_index();
    }

    const openers = unlock_sources_index[key] || [];
    for(const opener of openers) {
        if(is_step_available(opener)) {
            return opener;
        }
    }
    //Nothing here is available, so ask what would open each opener in turn.
    for(const opener of openers) {
        const next = opener.kind === "talk"
            ? (opener.line ? `line:${opener.via}#${opener.line}` : null)
            : `action:${opener.location_key}#${opener.via}`;
        const found = next && first_available_opener(next, depth + 1, seen);
        if(found) {
            return found;
        }
    }
    return null;
}
/**
 * What advances one quest task.
 *
 * @param {String} quest_id
 * @param {Number} task_index
 * @returns {Array} {kind: "talk"|"action"|"clear", via, location_key}
 */
function quest_task_advancers(quest_id, task_index) {
    if(!advancers_index) {
        advancers_index = build_advancers_index();
    }
    return advancers_index[`${quest_id}#${task_index}`] || [];
}

/*
    What the conversations left behind, and which of it carries the thread.

    Two derived rules and one authored override - see docs/PROPOSALS.md P-13/1 and 36 for
    what the panel is for. The numbers below were measured against the content and hold:
    233 textlines collapse to 171 units, of which the world rule keeps 75.
*/
let lore_index;

//What a line can change that means the story moved. Not items, money, xp or reputation:
//those are payment. Not textlines: that only means the conversation carried on.
const LORE_WORLD_REWARDS = ["locations", "dialogues", "traders", "activities",
    "global_activities", "flags", "stances", "recipes", "crafting", "actions", "quests",
    "quest_progress"];

function changes_the_world(line) {
    const rewards = line.rewards;
    if(!rewards) {
        return false;
    }
    for(const field of LORE_WORLD_REWARDS) {
        const value = rewards[field];
        const size = Array.isArray(value) ? value.length : Object.keys(value || {}).length;
        if(size > 0) {
            return true;
        }
    }
    return (rewards.locks?.quests?.length ?? 0) > 0
        || (rewards.locks?.traders?.length ?? 0) > 0;
}

function build_lore_index() {
    //Who unlocks whom, so a line that only ever follows one other can be recognised.
    const unlocked_by = {};
    Object.keys(dialogues).forEach(dialogue_key => {
        Object.entries(dialogues[dialogue_key].textlines || {}).forEach(([line_key, line]) => {
            as_list(line.rewards?.textlines).forEach(step => {
                as_list(step?.lines).forEach(target => {
                    const key = `${step.dialogue}#${target}`;
                    (unlocked_by[key] ??= new Set()).add(`${dialogue_key}#${line_key}`);
                });
            });
        });
    });

    //A -> B when A unlocks exactly one line, B is in A's own dialogue, B ships locked and
    //nothing else opens it. That is one beat continuing, not a new question.
    const successor = {};
    const absorbed = new Set();
    Object.keys(dialogues).forEach(dialogue_key => {
        const textlines = dialogues[dialogue_key].textlines || {};
        Object.entries(textlines).forEach(([line_key, line]) => {
            const steps = as_list(line.rewards?.textlines);
            if(steps.length !== 1 || steps[0]?.dialogue !== dialogue_key) {
                return;
            }
            const targets = as_list(steps[0].lines);
            if(targets.length !== 1) {
                return;
            }
            const target = textlines[targets[0]];
            if(!target || target.is_unlocked) {
                return;
            }
            if((unlocked_by[`${dialogue_key}#${targets[0]}`]?.size ?? 0) !== 1) {
                return;
            }
            successor[`${dialogue_key}#${line_key}`] = targets[0];
            absorbed.add(`${dialogue_key}#${targets[0]}`);
        });
    });

    const units = [];
    Object.keys(dialogues).forEach(dialogue_key => {
        Object.keys(dialogues[dialogue_key].textlines || {}).forEach(line_key => {
            if(absorbed.has(`${dialogue_key}#${line_key}`)) {
                return;
            }
            const keys = [line_key];
            let at = `${dialogue_key}#${line_key}`;
            while(successor[at]) {
                keys.push(successor[at]);
                at = `${dialogue_key}#${successor[at]}`;
            }
            units.push({dialogue: dialogue_key, head: line_key, keys});
        });
    });

    return units;
}

/**
 * Every unit of conversation, in the order the dialogues declare them.
 *
 * A unit is one question and the answer it led to, with any line that merely continued
 * that answer folded in.
 */
function lore_all_units() {
    if(!lore_index) {
        lore_index = build_lore_index();
    }
    return lore_index;
}

/**
 * Whether a unit belongs in the panel: heard, and carrying the thread.
 *
 * `lore` on any of its lines decides it outright - false drops, true keeps - and
 * otherwise it is kept when something in it changed the world.
 */
function is_lore_worth_keeping(unit) {
    const lines = unit.keys.map(key => dialogues[unit.dialogue].textlines[key]).filter(Boolean);
    if(!lines.some(line => line.is_heard)) {
        return false;
    }
    if(lines.some(line => line.lore === false)) {
        return false;
    }
    return lines.some(line => line.lore === true || changes_the_world(line));
}

/**
 * The thread a unit belongs to, or null.
 *
 * A unit can fold several lines into one beat, so the first line that names a thread
 * decides for the whole unit. Two lines of one beat naming different threads would be
 * an authoring mistake rather than a case to support, and check_lore_threads_resolve
 * says so.
 */
function lore_thread_of(unit) {
    const lines = unit.keys.map(key => dialogues[unit.dialogue].textlines[key]).filter(Boolean);
    return lines.find(line => line.lore_thread)?.lore_thread ?? null;
}

/**
 * The threads, and the units in each, in the order the threads first appear.
 *
 * Declaration order rather than alphabetical: dialogues are declared in roughly the
 * order the player meets them, so a thread's place in the list is where the player
 * first ran into it. Within a thread the units keep index order for the same reason.
 *
 * @param {Boolean} everything whether to keep what the lore rule would drop
 * @returns {{thread: String, units: Object[]}[]}
 */
function lore_threads(everything) {
    const grouped = new Map();
    lore_units(everything).forEach(unit => {
        const thread = lore_thread_of(unit);
        if(!thread) {
            return;
        }
        if(!grouped.has(thread)) {
            grouped.set(thread, []);
        }
        grouped.get(thread).push(unit);
    });
    return [...grouped].map(([thread, units]) => ({thread, units}));
}

/**
 * The units to show, and every unit heard - the second for the "everything" view.
 *
 * @param {Boolean} everything whether to keep what the thread rule would drop
 */
function lore_units(everything) {
    return lore_all_units().filter(unit => everything
        ? unit.keys.some(key => dialogues[unit.dialogue].textlines[key]?.is_heard)
        : is_lore_worth_keeping(unit));
}

/**
 * The unit a given line belongs to, so "where you left off" can show the whole beat
 * rather than the fragment the player happened to stop on.
 */
function lore_unit_of(dialogue_key, line_key) {
    return lore_all_units().find(unit => unit.dialogue === dialogue_key
        && unit.keys.includes(line_key)) ?? null;
}
//Exported for the tests: the raw index, so a walk can be inspected without a browser.
function unlock_sources_for(key) {
    if(!unlock_sources_index) {
        unlock_sources_index = build_unlock_sources_index();
    }
    return unlock_sources_index[key] || [];
}

export { enemy_zones, zones_for_enemy_tag, item_sources, training_places, unlock_sources_for,
    lore_units, lore_unit_of, lore_all_units, lore_threads, lore_thread_of,
    first_available_opener, is_step_available,
    quest_task_advancers };
