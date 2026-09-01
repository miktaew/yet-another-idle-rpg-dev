"use strict";

import { traders, inventory_templates } from "./traders.js";
import { game_state } from "./game_state.js";
import { current_trader, to_buy, to_sell } from "./trade.js";
import { skills, get_unlocked_skill_rewards, get_next_skill_milestone } from "./data/skills.js";
import { character, get_skill_xp_gain, get_hero_xp_gain, get_skills_overall_xp_gain, get_total_skill_coefficient, get_total_skill_level, get_effect_with_bonuses, cold_status_temperatures, get_character_cold_tolerance, lowest_tolerable_temperature, get_skill_xp_gain_bonus, tool_slots } from "./character.js";
import { current_enemies, game_options, 
    can_work, current_location, 
    active_effects, enough_time_for_earnings, 
    get_current_book, faved_stances, 
    selected_stance, 
    global_flags,
    unlocked_beds,
    favourite_consumables,
    travel_times, 
    language,
    language_tags,
    favourite_items,
    get_effective_skill_xp_gain} from "./main.js";
import { dialogues } from "./data/dialogues.js";
import { activities } from "./activities.js";
import { format_time, split_duration, current_game_time, seasons } from "./game_time.js";
import { book_stats, item_templates, Weapon, Armor, Shield, rarity_multipliers, getItemRarity, getItemFromKey, item_log } from "./items.js";
import { favourite_locations, get_location_type_penalty, location_types, locations } from "./data/locations.js";
import { enemy_killcount, enemy_tag_to_skill_mapping, enemy_templates } from "./enemies.js";
import { expo, get_hit_chance, round_item_price, celsius_to_fahrenheit, is_a_older_than_b, select_outline_class } from "./misc.js"
import { set_HTML, insert_HTML, clear_HTML_content, compare_display_names,
    capitalize_first_letter, uncapitalize_first_letter, toggle_exclusive_class,
    remove_class_from_all, is_element_above_x, matches_search } from "./ui_helpers.js";
//import { stances } from "./combat_stances.js";
import { get_recipe_xp_value, find_recipe_material, get_component_stats, recipes } from "./crafting_recipes.js";
import { lore_units, lore_unit_of,
    enemy_zones, zones_for_enemy_tag, item_sources, training_places,
    first_available_opener,
    quest_task_advancers } from "./world_index.js";
import { effect_templates } from "./active_effects.js";
import { player_storage } from "./data/storage.js";
import { quests } from "./quests.js";
import { get_current_light_level, get_current_light_level_for_roofed_location, get_current_temperature_smoothed, is_raining } from "./weather.js";
import { PointyStarParticle, RainParticle, SnowParticle } from "./particles.js";
import { get_game_version } from "./game_version.js";
import { process_conditions } from "./conditions.js";
import { translationManager } from "./translation.js";
import { playable_races } from "./races.js";
import { config } from "./config.js";
import { height_stats } from "./person.js";
import { create_effect_tooltip, create_item_tooltip, create_item_tooltip_content,
         create_recipe_tooltip_content, obscure_name, rarity_colors, rarity_outlines,
         stat_label_short } from "./item_tooltips.js";
import { close_crafting_window, create_displayed_crafting_recipes, open_crafting_window,
         switch_crafting_recipes_page, switch_crafting_recipes_subpage,
         update_displayed_component_choice, update_displayed_crafting_recipes,
         update_displayed_material_choice, update_item_recipe_tooltips,
         update_item_recipe_visibility, update_recipe_tooltip } from "./crafting_display.js";
import { booklist_entry_divs, clear_bestiary, create_new_bestiary_entry,
         create_travel_line, update_bestiary_entry, update_bestiary_entry_killcount,
         update_bestiary_entry_tooltip, update_booklist_entry, update_displayed_book,
         update_displayed_discoveries, update_displayed_lore } from "./journal_panels.js";
import { clear_skill_bars, clear_skill_list, create_new_skill_bar, skill_category_order,
         skill_list, sort_displayed_skills, update_all_displayed_skills_xp_gain,
         update_displayed_faved_stances, update_displayed_skill_bar,
         update_displayed_skill_description, update_displayed_skill_level,
         update_displayed_skill_xp_gain, update_displayed_stance,
         update_displayed_stance_list, update_stance_tooltip } from "./skills_display.js";
import { equipment_slots_divs, exit_displayed_trade, item_divs, sort_displayed_inventory,
         update_displayed_character_inventory, update_displayed_storage_inventory,
         update_displayed_trader, update_displayed_trader_inventory } from "./inventory_display.js";
let activity_anim; //for the activity and gameAction animation interval

let location_choice_divs = {}; //for dropdowns
const action_div = document.getElementById("location_actions_div");
const trade_div = document.getElementById("trade_div");
const storage_div = document.getElementById("storage_div");

const location_name_span = document.getElementById("location_name_span");
const location_icon_span = document.getElementById("location_icon_span");
const location_types_div = document.getElementById("location_types_div");
const location_tooltip = document.getElementById("location_name_tooltip");

//for visual effects
let canvas;
let context;
let background_animation;
let background_animation_timeout;
let background_animation_particles = [];

//inventory display









//message log
const message_log = document.getElementById("message_box_div");
let dynamic_loot_message = null;

//enemy info
const combat_div = document.getElementById("combat_div");
const enemies_div = document.getElementById("enemies_div");

const enemy_count_div = document.getElementById("enemy_count_div");
const clear_count_div = document.getElementById("clear_count_div");

//enemy onhit animation
const onhitAnimation = [
    {
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "rotate": "0deg",
    },
    {
        "backgroundColor": "rgba(255, 0, 0, 0.2)",
        "rotate": "0.3deg",
    }
]
const onhitAnimationTiming = {
    duration: 100,
	iterations: 2,
    direction: "alternate",
}

const onstartAnimation = [
    {
        "opacity": "0.2",
        "backgroundColor": "rgba(0, 124, 17, 0.2)",
    },
    {
        "opacity": "1",
    },
]
const onstartAnimationTiming = {
    duration: 800,
	iterations: 1,
}

const enemy_animations = {};

//character health display
const current_health_value_div = document.getElementById("character_health_value");
const current_health_bar = document.getElementById("character_healthbar_current");
const health_tooltip_div = document.getElementById("character_health_tooltip");

//character stamina display
const current_stamina_value_div = document.getElementById("character_stamina_value");
const current_stamina_bar = document.getElementById("character_stamina_bar_current");
const stamina_tooltip_div = document.getElementById("character_stamina_tooltip");

//character xp display
const character_xp_div = document.getElementById("character_xp_div");
const character_level_div = document.getElementById("character_level_div");
const xp_bar_tooltip_div = document.getElementById("character_xp_tooltip");

//active effects display
const active_effects_tooltip = document.getElementById("effects_tooltip");
const active_effect_count = document.getElementById("active_effect_count");

const time_field = document.getElementById("time_div");
const weather_field = document.getElementById("weather_div");














const combat_switch = document.getElementById("switch_to_combat")
const inventory_switch = document.getElementById("switch_to_inventory")

const quest_entry_divs = {};
const quest_list = document.getElementById("quest_list");
const quest_hiding_button = document.getElementById("quest_hiding_button");

const data_entry_divs = {
    reputation: document.getElementById("data_tab_reputation_div"),
    item_log: document.getElementById("data_tab_item_log_div")
};













const message_count = {
    message_combat: 0,
    message_unlocks: 0,
    message_loot: 0,
    message_events: 0,
    message_background: 0,
    message_crafting: 0,
};

const dynamic_loot_message_types = {
    combat_loot: true,
    gathered_loot: true,
    total_gathered_loot: true,
}


const stats_divs = {strength: document.getElementById("strength_slot"), agility: document.getElementById("agility_slot"),
                    dexterity: document.getElementById("dexterity_slot"), intuition: document.getElementById("intuition_slot"),
                    magic: document.getElementById("magic_slot"), 
                    attack_speed: document.getElementById("attack_speed_slot"), attack_power: document.getElementById("attack_power_slot"), 
                    defense: document.getElementById("defense_slot"), crit_rate: document.getElementById("crit_rate_slot"), 
                    crit_multiplier: document.getElementById("crit_multiplier_slot")
                    };

const other_combat_divs = {attack_points: document.getElementById("hit_chance_slot"), defensive_action: document.getElementById("defensive_action_slot"),
                           defensive_points: document.getElementById("defensive_action_chance_slot")
                          };

let effect_divs = {};

const character_attack_bar = document.getElementById("character_attack_bar");

//equipment slots




/**
 * A rarity's name, for the quality line of an item tooltip.
 *
 * getItemRarity turns a quality number into one of seven English words, so a rarity is
 * a computed registry value rather than written text - and like the other registry
 * values it needs a row of its own to be readable in another language.
 */


/** A location type's name, for the header beside the location's own name. */
function location_type_label(type) {
    return translationManager.getText(language, `loctype ${type}`);
}










const loading_progress_div = document.getElementById("loading_screen_loading_progress");

const backup_load_button = document.getElementById("backup_load_button");
const other_save_load_button = document.getElementById("import_other_save_button");

const export_button_tooltip = document.getElementById("export_button_tooltip");

//Read at render time rather than at import: a const here is evaluated before a
//language has been chosen, so it could only ever hold the default one.
function default_dialogue_return_text() {
    return translationManager.getText(language, "ui nevermind");
}




/**
 * Capitalises the first letter.
 *
 * @param {String} some_string
 * @param {Boolean} is_translated whether the input is text in the ACTIVE language.
 *        Locale-aware casing is only correct for translated text: Turkish maps "i"
 *        to "İ" and "ı" to "I", which is what a Turkish word needs - but applying
 *        it to a raw English stat key would render "intuition" as "İntuition".
 *        Callers that pass an untranslated identifier must leave this false.
 */
/**
 * Display name for whatever a quest task is counting.
 *
 * The target is a registry key whose meaning depends on the task type: an enemy
 * group for a kill, a location for a clear or an entry, a skill for reach_skill.
 * Each of those already knows its own display name, so this only has to pick the
 * right registry. An unknown type falls back to the key, visibly, rather than to
 * undefined.
 */
function quest_target_label(task_type, target_id) {
    if(task_type === "reach_skill") {
        return skills[target_id]?.name() ?? target_id;
    }
    if(task_type === "clear" || task_type === "enter_location") {
        return locations[target_id]?.getName() ?? translationManager.getDisplayName(language, target_id);
    }
    return translationManager.getDisplayName(language, target_id);
}
/**
 * A comma-separated season list, translated.
 *
 * game_time.js returns seasons as English strings and has to keep doing so -
 * conditions.js compares getSeason() against a `season: {yes: "Summer"}` written in
 * content. The job availability tooltip was interpolating that list directly, so it
 * read "Winter boyunca müsait değil".
 */
function season_list(season_names) {
    return season_names
        .map(season => translationManager.getText(language, `season ${season}`))
        .join(", ");
}




/**
 * Display name for a stat or xp-bonus SOURCE, e.g. "skill_milestones".
 *
 * These are the keys of character.stats.flat / .multiplier and
 * character.xp_bonuses.multiplier, and they were printed by replacing the
 * underscore with a space. Unlike the stat keys these had no rows, so they have
 * their own now.
 */
function stat_source_label(source_key) {
    return translationManager.getText(language, `ui stat source ${source_key}`);
}







function create_floating_effect(text, pos) {
    const effect_elem = document.createElement("div");
    pos.x = pos.x + Math.random()*80-40;

    effect_elem.style.top = pos.y + "px";
    effect_elem.style.left = pos.x + "px";
    effect_elem.classList.add("floating_effect");
    effect_elem.innerText = text;

    effect_elem.posX = pos.x;
    effect_elem.posY = pos.y;

    document.body.appendChild(effect_elem);
    
    let timer = 0;

    let anim_interval;
    if(Math.random() > 0.5) {
        anim_interval = setInterval(()=> {
            effect_elem.style.top = effect_elem.posY - 2*timer**0.95 + "px";
            effect_elem.style.left = effect_elem.posX - Math.sin(timer/10)*20 + "px";
            effect_elem.style.opacity = (100-timer**.95)/100;
            timer++;
        }, 30);
    } else {
        anim_interval = setInterval(()=> {
            effect_elem.style.top = effect_elem.posY - 2*timer**0.95 + "px";
            effect_elem.style.left = effect_elem.posX - Math.cos(timer/8)*16 + "px";
            effect_elem.style.opacity = (100-timer**.95)/100;
            timer++;
        }, 30);
    }

    setTimeout(()=>{
        clearInterval(anim_interval);
        effect_elem.remove();
    }, 4*1000);
}



function clear_action_div() {
    while(action_div.lastElementChild) {
        action_div.removeChild(action_div.lastElementChild);
        location_choice_divs = {};
    }
}









function end_activity_animation(remove) {
    clearInterval(activity_anim);
    const div = document.getElementById("action_status_div");
    if(remove && div) {
        clear_HTML_content(div);
    }
}

/**
 * writes message to the message log; automatically swaps "%HeroName%" for player character name
 * @param {String} message_to_add text to display
 * @param {String} message_type used for adding proper class to html element
 */
/*
    What has been logged, so the log can be saved and put back.

    The arguments rather than the divs: a restored log then goes through log_message
    like any other message, so the classification, the per-group caps and the pruning
    are the same code and cannot drift from the live path.

    Capped because a save is a text file a player exports by hand. 300 is comfortably
    more than the per-group caps add up to, so nothing visible is lost.
*/
const message_log_history = [];
const message_log_history_cap = 300;

function get_message_log_history() {
    return message_log_history;
}

/**
 * Replays a saved log.
 *
 * `is_restoring` stops each replayed line being pushed back onto the history, which
 * would double it on every save-load cycle.
 */
function restore_message_log(history) {
    if(!Array.isArray(history)) {
        return;
    }
    clear_message_log();
    for(const entry of history) {
        log_message(entry.text, entry.type, true);
    }
    message_log_history.length = 0;
    message_log_history.push(...history.slice(-message_log_history_cap));
}

 function log_message(message_to_add, message_type, is_restoring = false) {
    if(typeof message_to_add === 'undefined') {
        return;
    }

    //Recorded before the substitutions, so a replay produces the same line again.
    if(!is_restoring) {
        message_log_history.push({text: message_to_add, type: message_type});
        if(message_log_history.length > message_log_history_cap) {
            message_log_history.shift();
        }
    }

    message_to_add = message_to_add.replaceAll("%HeroName%", character.name).replaceAll("\n","<br>");
    //message_to_add = message_to_add.replaceAll("%HeroName%", character.name).replaceAll("<br>","\n");

    let message = document.createElement("div");
    message.classList.add("message_common");

    let class_to_add = "message_default";
    let group_to_add = "message_events";

    //selects proper class to add based on argument
    switch(message_type) {
        case "enemy_defeated":
            class_to_add = "message_victory";
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;
        case "hero_defeat":
            class_to_add = "message_hero_defeated";
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;
        case "enemy_attacked":
            class_to_add = "message_enemy_attacked";
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;
        case "enemy_attacked_critically":
            class_to_add = "message_enemy_attacked_critically";
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;
        case "hero_attacked":
            class_to_add = "message_hero_attacked";
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;
        case "hero_missed":
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;
        case "hero_blocked":
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;    
        case "enemy_missed":
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;    
        case "hero_attacked_critically":
            class_to_add = "message_hero_attacked_critically";
            group_to_add = "message_combat";
            message_count.message_combat += 1;
            break;

        case "combat_loot":
            class_to_add = "message_items_obtained";
            group_to_add = "message_loot";
            message_count.message_loot += 1;
            break;
        case "gathered_loot":
            class_to_add = "message_items_obtained";
            group_to_add = "message_loot";
            message_count.message_loot += 1;
            break;
        case "total_gathered_loot":
            class_to_add = "message_total_items_obtained";
            group_to_add = "message_loot";
            message_count.message_loot += 1;
            break;
        case "location_reward":
            group_to_add = "message_loot";
            message_count.message_loot += 1;
            break;

        case "skill_raised":
            class_to_add = "message_skill_leveled_up";
            group_to_add = "message_unlocks";
            message_count.message_unlocks += 1;
            break;
        case "level_up":
            group_to_add = "message_unlocks";
            message_count.message_unlocks += 1;
            break;
        case "activity_unlocked": 
            //currently uses default style class
            group_to_add = "message_unlocks";
            message_count.message_unlocks += 1;
            break;
        case "location_unlocked":
            class_to_add = "message_location_unlocked";
            group_to_add = "message_unlocks";
            message_count.message_unlocks += 1;
            break;
        case "dialogue_unlocked":
            group_to_add = "message_unlocks";
            message_count.message_unlocks += 1;
            break;

        case "message_travel":
            class_to_add = "message_travel";
            group_to_add = "message_events";
            message_count.message_events += 1;
            break;
        case "export_reward":
            class_to_add = "message_export_reward";
            group_to_add = "message_events";
            message_count.message_events += 1;
            break;
        case "activity_finished":
            group_to_add = "message_events";
            message_count.message_events += 1;
            break;
        case "activity_money":
            group_to_add = "message_events";
            message_count.message_events += 1;
            break;
        case "notification":
            message_count.message_events += 1;
            group_to_add = "message_events";
            class_to_add = "message_notification";
            break;
        case "background":
            message_count.message_background +=1;
            group_to_add = "message_background";
            break;
        case "crafting":
            message_count.message_crafting +=1;
            group_to_add = "message_crafting";
            break;
        case "message_critical":
            message_count.message_events += 1;
            group_to_add = "message_events";
            class_to_add = "message_critical";
            break;
    }

    if(dynamic_loot_message_types[message_type] && game_options.do_dynamic_loot_message) {
        if(dynamic_loot_message) {
            dynamic_loot_message.remove();
            message_count.message_loot--; //count gets increased in the other place, so this is necessary to balance it (since the actual message number stays unchanged in this case)
        }

        dynamic_loot_message = message;
    }

    if(group_to_add === "message_combat" && message_count.message_combat > 80
    || group_to_add === "message_loot" && message_count.message_loot > 28
    || group_to_add === "message_unlocks" && message_count.message_unlocks > 40
    || group_to_add === "message_events" && message_count.message_events > 40
    || group_to_add === "message_background" && message_count.message_background > 28
    || group_to_add === "message_crafting" && message_count.message_crafting > 28
    ) {
        // find first child with specified group
        // delete it
        message_log.removeChild(message_log.getElementsByClassName(group_to_add)[0]);
        message_count[group_to_add]--;
    }
        
    message.classList.add(class_to_add, group_to_add);
    set_HTML(message, message_to_add);
    //message.innerText = message_to_add;
    insert_HTML(message, "<div class='message_border'> </>");

    message_log.appendChild(message);

    const button_id = group_to_add.replace("_","_show_"); //not the best way but likelihood of the ids being changed is quite low
    if(document.getElementById(button_id).classList.contains("active_selection_button")) {
        //scroll the message log but only if added message is in a not hidden category
        message_log.scrollTop = message_log.scrollHeight;
    }
    
}

function unassign_dynamic_loot_message() {
    dynamic_loot_message = null;
}



function clear_message_log() {
    clear_HTML_content(message_log);
    //The history goes with it, or a save right after clearing would put it back.
    message_log_history.length = 0;
}

/**
 * @param {Array} loot_list [{item, count},...] 
 */
function log_loot({loot_list, is_combat=false, is_a_summary=false, is_dynamic=false}) {

    let message;
    let message_type;
    if(is_combat) {
        message_type = "combat_loot";
        message = translationManager.getText(language, "ui looted") + ' "';
    } else if(is_a_summary) {
        message_type = "total_gathered_loot";
        message = translationManager.getText(language, "ui gained in total") + ': "';
    } else {
        message_type = "gathered_loot";
        message = translationManager.getText(language, "ui gained") + ' "';
    }

    const recent_loot = Object.values(loot_list.recent);
    const total_loot = Object.values(loot_list.total);

    if(recent_loot.length == 0) {
        //if dynamic is enabled, it will already be displayed; if not, there's nothing to display anyway
        return;
    }

    const loot_to_use = is_dynamic?total_loot:recent_loot;
    let gains_msg = is_dynamic?`(+${recent_loot[0].item_count})`:"";

    let item;
    if(loot_to_use[0].item_id) {
        item = item_templates[loot_to_use[0].item_id];
    } else if(loot_to_use[0].item_key) {
        item = getItemFromKey(loot_to_use[0].item_key);
    }

    message += item.getDisplayName() + `" x` + loot_to_use[0].item_count + gains_msg;

    if(loot_to_use.length > 1) {
        for(let i = 1; i < loot_to_use.length; i++) {
            gains_msg = is_dynamic&&recent_loot[i]?`(+${recent_loot[i].item_count})`:"";

            if(loot_to_use[i].item_id) {
                item = item_templates[loot_to_use[i].item_id];
            } else if(loot_to_use[i].item_key) {
                item = getItemFromKey(loot_to_use[i].item_key);
            }
            message += (`, "` + item.getDisplayName() + `" x` + loot_to_use[i].item_count + gains_msg);
        }
    }
    
    log_message(message, message_type);
}

/**
 * Originally created for activities, despite the name, but is now used for actions as well.
 * @param {Object} settings 
 */
function start_activity_animation(settings) {
    end_activity_animation();
    activity_anim = setInterval(() => { //sets a tiny little "animation" for activity text
        const action_status_div = document.getElementById("action_status_div");
        if(!action_status_div) {
            //The panel this animates is gone - travelling out of an action used to
            //leave this ticking at nothing, throwing on every beat from a timer.
            end_activity_animation();
            return;
        }
        let end = "";
        if(action_status_div.innerText.endsWith("...")) {
            end = "...";
        } else if(action_status_div.innerText.endsWith("..")) {
            end = "..";
        } else if(action_status_div.innerText.endsWith(".")) {
            end = ".";
        }

        if(settings?.book_title) {
            const html_content = action_status_div.innerText;
            set_HTML(action_status_div, html_content.split(",")[0] + `, ${translationManager.getText(language, "ui time left", {v1: format_reading_time(item_templates[settings.book_title].getRemainingTime())})}` + end);
        }

        if(end.length < 3){
            insert_HTML(action_status_div, ".");
        } else {
            const html_content = action_status_div.innerText;
            set_HTML(action_status_div, html_content.substring(0, html_content.length - 3));
        }

     }, 600);
}



function update_displayed_storage() {
    action_div.style.display = "none";
    storage_div.style.display = "flex";
    update_displayed_storage_inventory();
}

function update_displayed_money() {
    set_HTML(document.getElementById("money_div"), `${translationManager.getText(language, "ui purse contains", {v1: format_money(character.money)})}`);
}

function update_displayed_total_price(total_price) {
    set_HTML(document.getElementById("trade_price_value"), format_money(total_price));
}











function exit_displayed_storage() {
    action_div.style.display = "";
    storage_div.style.display = "none";
}



/**
 * updates the displayed worn items + attaches tooltips
 */
function update_displayed_equipment() {
    Object.keys(equipment_slots_divs).forEach(function(key) {
        let eq_tooltip; 

        if(character.equipment[key] == null) { //no item in slot
            eq_tooltip = document.createElement("span");
            eq_tooltip.classList.add("item_tooltip");
            //The "ui slot <key>" rows have existed all along - the label was built
            //from the raw key instead, which is why every empty slot read English.
            //fishing_pole is the one key with an underscore, and its row keeps it.
            const slot_text_id = `ui slot ${key}`;
            set_HTML(equipment_slots_divs[key], translationManager.getText(language, "ui empty slot",
                {v1: translationManager.getText(language, slot_text_id)}));
            equipment_slots_divs[key].classList.add("equipment_slot_empty");
            set_HTML(eq_tooltip, `${translationManager.getText(language, "ui your slot", {v1: translationManager.getText(language, `ui slot ${key}`)})}`);
        } else {
            set_HTML(equipment_slots_divs[key], character.equipment[key].getDisplayName());
            equipment_slots_divs[key].classList.remove("equipment_slot_empty");
            
            eq_tooltip = create_item_tooltip(character.equipment[key]);
        }
        equipment_slots_divs[key].appendChild(eq_tooltip);
    });
}

/**
 * updates displayed star icon to match whether target is in favs or not
 * @param {HTMLDivElement} node 
 * @param {Boolean} is_fav 
 */
function update_fav_display(node, is_fav) {
    if(is_fav) {
        node.children[0].innerText = "star";
        node.parentNode.parentNode.classList.add("character_item_faved");
    } else {
        node.children[0].innerText = "star_border";
        node.parentNode.parentNode.classList.remove("character_item_faved");
    }
}



/**
 * sets visibility of divs for enemies (based on how many there are in current combat),
 * and enemies' AP / EP
 * 
 * called when new enemies get loaded and when player stats change
 */
function update_displayed_enemies() {
    for(let i = 0; i < 8; i++) { //go to max enemy count
        if(i < current_enemies.length) {
            enemies_div.children[i].children[0].style.display = null;
            set_HTML(enemies_div.children[i].children[0].children[0], current_enemies[i].getName())

            let disp_speed;

            if(current_enemies[i].stats.attack_speed > 20) {
                disp_speed = Math.round(current_enemies[i].stats.attack_speed);
            } else if (current_enemies[i].stats.attack_speed > 2) {
                disp_speed = Math.round(current_enemies[i].stats.attack_speed*10)/10;
            } else {
                disp_speed = Math.round(current_enemies[i].stats.attack_speed*100)/100;
            }

            let hero_hit_chance_modifier = current_enemies.filter(enemy => enemy.is_alive).length**(-1/4); // down to ~ 60% if there's full 8 enemies
            let hero_evasion_chance_modifier = current_enemies.filter(enemy => enemy.is_alive).length**(-1/3); //down to .5 if there's full 8 enemies (multiple attackers make it harder to evade attacks)

            let target = current_enemies[i];
            Object.keys(target.tags).forEach(enemy_tag => {
                if(enemy_tag_to_skill_mapping[enemy_tag]) {
                    for(let i = 0; i < enemy_tag_to_skill_mapping[enemy_tag].length; i++) {
                        const skill = skills[enemy_tag_to_skill_mapping[enemy_tag][i]];
                        const {modifier_to_hit_chance, modifier_to_evasion} = skill.get_stat_modifiers();
                        hero_hit_chance_modifier *= modifier_to_hit_chance || 1;
                        hero_evasion_chance_modifier *= modifier_to_evasion || 1;
                    }
                }
            });
        
            const evasion_chance = 1 - get_hit_chance(character.stats.full.attack_points*hero_hit_chance_modifier, current_enemies[i].stats.agility * Math.sqrt(current_enemies[i].stats.intuition ?? 1));
            let hit_chance = get_hit_chance(current_enemies[i].stats.dexterity * Math.sqrt(current_enemies[i].stats.intuition ?? 1), character.stats.full.evasion_points*hero_evasion_chance_modifier);

            if(character.equipment["off-hand"]?.offhand_type === "shield") { //has shield
                hit_chance = 1;
            }

            let html_string = `${translationManager.getText(language, "ui abbr attack")}: ${current_enemies[i].stats.attack}${translationManager.getText(language, "ui abbr damage")}`;
            
            if(current_enemies[i].stats.attack_count > 1) {
                html_string +=` x${current_enemies[i].stats.attack_count}`;
            }
            enemies_div.children[i].children[0].children[1].children[0].innerText = html_string;
            enemies_div.children[i].children[0].children[1].children[1].innerText = `${translationManager.getText(language, "ui abbr speed")}: ${disp_speed}`;
            enemies_div.children[i].children[0].children[1].children[2].innerText = `${translationManager.getText(language, "ui abbr hit")}: ${Math.min(100,Math.max(0,Math.round(100*hit_chance)))}%`; //100% if shield!
            enemies_div.children[i].children[0].children[1].children[3].innerText = `${translationManager.getText(language, "ui abbr dodge")}: ${Math.min(100,Math.max(0,Math.round(100*evasion_chance)))}%`;
            enemies_div.children[i].children[0].children[1].children[4].innerText = `${translationManager.getText(language, "ui abbr defense")}: ${current_enemies[i].stats.defense}`;

        } else {
            enemies_div.children[i].children[0].style.display = "none"; //just hide it
        }     
    }
}

/**
 * updates displayed health and healthbars of enemies
 */
function update_displayed_health_of_enemies() {
    for(let i = 0; i < current_enemies.length; i++) {
        if(current_enemies[i].is_alive) {
            enemies_div.children[i].children[0].style.filter = "brightness(100%)";
        } else {
            enemies_div.children[i].children[0].style.filter = "brightness(30%)";
            update_displayed_enemies();
        }

        //update size of health bar
        enemies_div.children[i].children[0].children[2].children[0].children[0].style.width = 
            Math.max(0, 100*current_enemies[i].stats.health/current_enemies[i].stats.max_health) + "%";

            enemies_div.children[i].children[0].children[2].children[1].innerText = `${Math.ceil(current_enemies[i].stats.health)}/${Math.ceil(current_enemies[i].stats.max_health)} ${translationManager.getText(language, "ui abbr health")}`;

    }
}

/**
 * Whether a connected location should be offered to the player right now.
 *
 * display_conditions is evaluated here rather than when the location is declared,
 * so a condition on a runtime flag - such as the Nekomimi cafe's
 * is_mofu_mofu_enabled gate - takes effect without a reload.
 *
 * The `|| []` is load-bearing: Combat_zone is a separate class from Location, not
 * a subclass, and process_conditions reads .length on its argument. Any location
 * class that does not declare the property would otherwise throw here.
 *
 * @param {Object} location a Location, Combat_zone or Challenge_zone
 * @returns {Boolean}
 */
function is_location_offered(location) {
    return location.is_unlocked
        && !location.is_finished
        && Boolean(process_conditions(location.display_conditions || [], character));
}

function update_displayed_normal_location(location) {
    clear_action_div();
    clear_HTML_content(location_types_div);
    combat_div.style.display = "none";
    location_tooltip.innerText = "";

    document.documentElement.style.setProperty('--location_desc_tooltip_visibility', "hidden");

    enemy_count_div.style.display = "none";
    clear_count_div.style.display = "none";
    document.documentElement.style.setProperty('--actions_div_height', getComputedStyle(document.body).getPropertyValue('--actions_div_height_default'));
    document.documentElement.style.setProperty('--actions_div_top', getComputedStyle(document.body).getPropertyValue('--actions_div_top_default'));
    
    inventory_switch.click();
    combat_switch.style.pointerEvents = "none";
    combat_switch.style.cursor = "default";
    combat_switch.style.color = "gray";

    location_name_span.innerText = current_location.getName();
    document.getElementById("location_description_div").innerText = current_location.getDescription();

    update_location_icon(location);

    /////////////////////////////////
    //add butttons to change location

    const available_locations = location.connected_locations.filter(loc => (is_location_offered(loc.location) && !loc.location.is_challenge));
    if(available_locations.length > 0) {
        location_choice_divs["locations"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice travel"), icon: "directions", class_name: "choice_travel"});

        location_choice_divs["locations"].append(...create_location_choices({location: location, category: "travel"}));
    }
    
    /////////////////////////////
    //add buttons for fast travel

    const available_fast_travel = 
    [
        ...Object.keys(favourite_locations).filter(key => (key !== current_location.id)), 
        ...Object.keys(unlocked_beds).filter(key => (key !== current_location.id && locations[key].is_unlocked && !locations[key].is_finished))
    ];

    if((available_fast_travel.length + (game_state.last_combat_location?1:0)) > 0) {
        location_choice_divs["fast_travel"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice fast travel"), icon: "directions", class_name: "choice_travel"});

        location_choice_divs["fast_travel"].append(...create_location_choices({location: location, category: "fast_travel"}));
    }

    /////////////////////////////
    //add button to open crafting
    if(global_flags.is_crafting_unlocked) {
        if(location.crafting?.is_unlocked) {
            const crafting_button = document.createElement("div");
            crafting_button.classList.add("location_choices", "choice_craft");
            crafting_button.setAttribute("onclick", 'openCraftingWindow()');
            insert_HTML(crafting_button, `<i class="material-icons">construction</i> ${translationManager.getText(language, location.crafting.use_text)}`);
            location_choice_divs["crafting"] = crafting_button;
            //action_div.appendChild(crafting_button);
        }
    }

    ///////////////////////////
    //add button to go to sleep

    if(location.housing?.is_unlocked) { 
        const start_sleeping_div = document.createElement("div");
        
        insert_HTML(start_sleeping_div, '<i class="material-icons">bed</i>  ' + translationManager.getText(language, location.housing.text_to_sleep));
        start_sleeping_div.id = "start_sleeping_div";
        start_sleeping_div.setAttribute('onclick', 'start_sleeping()');

        const open_storage_div = document.createElement("div");
        
        insert_HTML(open_storage_div, `<i class="material-icons">inventory_2</i>  ${translationManager.getText(language, "ui open chest")}`);
        open_storage_div.id = "open_storage_div";
        open_storage_div.setAttribute('onclick', 'openStorage()');

        location_choice_divs["sleeping"] = start_sleeping_div;
        location_choice_divs["storage"] = open_storage_div;
        //action_div.appendChild(start_sleeping_div);
        //action_div.appendChild(open_storage_div);
    }
    
    ////////////////////////////////////
    //add buttons for starting dialogues

    const available_dialogues = location.dialogues.filter(dialogue => {
        if(!dialogues[dialogue].is_unlocked || dialogues[dialogue].is_finished) {
            return false;
        } else {
            let lines_available = false;
            let actions_available = false;
            Object.keys(dialogues[dialogue].textlines).forEach(line => {
                if(lines_available) {
                    return;
                } else {
                    lines_available = dialogues[dialogue].textlines[line].is_unlocked && !dialogues[dialogue].textlines[line].is_finished;
                }
            });
            Object.keys(dialogues[dialogue].actions).forEach(action => {
                if(actions_available) {
                    return;
                } else {
                    actions_available = dialogues[dialogue].actions[action].is_unlocked && !dialogues[dialogue].actions[action].is_finished;
                }
            });
            return lines_available || actions_available;
        }
    });

    if(available_dialogues.length > 0) {
        location_choice_divs["dialogues"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice dialogue"), icon: "question_answer", class_name: "choice_dialogue"});

        location_choice_divs["dialogues"].append(...create_location_choices({location: location, category: "talk"}));
    }

    /////////////////////////
    //add buttons for trading

    const available_traders = location.traders.filter(trader => traders[trader].is_unlocked && !traders[trader].is_finished);

    if(available_traders.length > 0) {
        location_choice_divs["traders"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice trade"), icon: "storefront", class_name: "choice_trade"});

        location_choice_divs["traders"].append(...create_location_choices({location: location, category: "trade"}));
    }
    

    ///////////////////////////
    //add buttons to start jobs

    const available_jobs = Object.values(location.activities).filter(activity => activities[activity.activity_name].type === "JOB" 
                                                                    && activities[activity.activity_name].is_unlocked
                                                                    && activity.is_unlocked
                                                                    && activities[activity.activity_name].base_skills_names.filter(skill => !skills[skill].is_unlocked).length == 0);
    
    if(available_jobs.length > 0) {
        location_choice_divs["jobs"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice work"), icon: "work_outline", class_name: "choice_work"});

        location_choice_divs["jobs"].append(...create_location_choices({location: location, category: "work"}));
    }


    ///////////////////////////////
    //add buttons to start training

    const available_trainings = Object.values(location.activities).filter(activity => activities[activity.activity_name].type === "TRAINING" 
                                                                    && activities[activity.activity_name].is_unlocked
                                                                    && activity.is_unlocked
                                                                    && activities[activity.activity_name].base_skills_names.filter(skill => !skills[skill].is_unlocked).length == 0);
    
    if(available_trainings.length > 0) {
        location_choice_divs["trainings"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice train"), icon: "fitness_center", class_name: "choice_train"});

        location_choice_divs["trainings"].append(...create_location_choices({location: location, category: "train"}));
    }

    ////////////////////////////////
    //add buttons to start gathering

    if(global_flags.is_gathering_unlocked) {
        const available_gatherings = Object.values(location.activities).filter(activity => activities[activity.activity_name].type === "GATHERING" 
                                                                        && activities[activity.activity_name].is_unlocked
                                                                        && activity.is_unlocked
                                                                        && activities[activity.activity_name].base_skills_names.filter(skill => !skills[skill].is_unlocked).length == 0);
        
        
        if(available_gatherings.length > 0) {
            location_choice_divs["gatherings"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice gather"), icon: "search", class_name: "choice_gather"});
    
            location_choice_divs["gatherings"].append(...create_location_choices({location: location, category: "gather"}));
        }
        
    }

    //can_be_displayed folds in unlocked/finished now; it used to be checked here by hand.
    const available_actions = Object.values(location.actions).filter(action => action.can_be_displayed(character));
    if(available_actions.length > 0) {
        location_choice_divs["actions"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice action"), icon: "circle", class_name: "choice_action"});

        location_choice_divs["actions"].append(...create_location_choices({location: location, category: "action"}));
    }

    ////////////////////////////
    //add buttons for challenges

    const available_challenges = location.connected_locations.filter(loc => (loc.location.is_challenge && loc.location.is_unlocked && !loc.location.is_finished));
    if(available_challenges.length > 0) {
        location_choice_divs["challenges"] = create_location_choice_dropdown({name: translationManager.getText(language, "ui choice challenge"), icon: "warning_amber", class_name: "choice_travel"});

        location_choice_divs["challenges"].append(...create_location_choices({location: location, category: "challenge"}));
    }


    action_div.append(...Object.values(location_choice_divs));
}

function update_location_icon() {
    if(current_location.housing && current_location.housing.is_unlocked) {
        set_HTML(location_icon_span, '<i class="material-icons location_bed_icon">bed</i>');
    } else if(favourite_locations[current_location.id]) {
        set_HTML(location_icon_span, '<i class="material-icons">star</i>');
    } else {
        set_HTML(location_icon_span, '<i class="material-icons">star_border</i>');
    }
}

function create_location_choice_dropdown({name, icon, class_name}) {

    const elem = document.createElement("div");
    insert_HTML(elem, `<i class="material-icons">${icon}</i> ${name}`);
    elem.classList.add("location_choice_dropdown", class_name);

    elem.addEventListener("click", (event)=>{
        let target = event.target;
        if(target.classList.contains("material-icons")) {
            target = target.parentNode;
        }

        if(target.classList.contains("location_choice_dropdown")) {
            target.classList.toggle("location_choice_dropdown_expanded");

            //done after toggling class, so it will trigger if class was NOT present when clicked
            if(target.classList.contains("location_choice_dropdown_expanded")) {
                target.scrollIntoView({block: "end", inline: "nearest", behavior: "smooth"});
            }
        }
    });

    return elem;
}

/**
 * 
 * @param {*} location 
 * @param {*} category 
 * @return {Array} an array of html nodes presenting the available choices
 */
function create_location_choices({location, category, is_combat = false}) {
    let choice_list = [];

    if(category === "talk") {
        for(let i = 0; i < location.dialogues.length; i++) { 
            if(!dialogues[location.dialogues[i]].is_unlocked || dialogues[location.dialogues[i]].is_finished) { //skip if dialogue is not available
                continue;
            } 

            const lines_available = Object.values(dialogues[location.dialogues[i]].textlines).filter(textline => {
                return textline.is_unlocked && !textline.is_finished;
            }).length;

            const actions_available = Object.values(dialogues[location.dialogues[i]].actions).filter(action => {
                return action.is_unlocked && !action.is_finished;
            }).length;
            
            if(!lines_available && !actions_available) {
                continue;
            }
            
            const dialogue_div = document.createElement("div");
            
            insert_HTML(dialogue_div, `<i class="material-icons location_choice_icon">check_box_outline_blank</i> ` + dialogues[location.dialogues[i]].getStartingText({is_mofu_mofu_enabled: global_flags.is_mofu_mofu_enabled}));
            dialogue_div.classList.add("start_dialogue", "location_choice");
            dialogue_div.setAttribute("data-dialogue", location.dialogues[i]);
            dialogue_div.setAttribute("onclick", "start_dialogue(this.getAttribute('data-dialogue'));");
            choice_list.push(dialogue_div);
        }
    } else if (category === "trade") {
        for(let i = 0; i < location.traders.length; i++) { 
            if(!traders[location.traders[i]].is_unlocked || traders[location.traders[i]].is_finished) { //skip if trader is not available
                continue;
            } 
            
            const trader_div = document.createElement("div");  

            insert_HTML(trader_div, `<i class="material-icons location_choice_icon">check_box_outline_blank</i> ` + traders[location.traders[i]].getTradeText());
            trader_div.classList.add("start_trade", "location_choice");
            trader_div.setAttribute("data-trader", location.traders[i]);
            trader_div.setAttribute("onclick", "startTrade(this.getAttribute('data-trader'));");
            choice_list.push(trader_div);
        }
    } else if (category === "work") {
        Object.keys(location.activities).forEach(key => {
            if(!activities[location.activities[key].activity_name]?.is_unlocked 
                || !location.activities[key]?.is_unlocked 
                || activities[location.activities[key].activity_name].type !== "JOB") 
            {
                return;
            }
            
            const activity_div = document.createElement("div");

            activity_div.classList.add("activity_div", "location_choice");
            activity_div.setAttribute("data-activity", key);
            

            if(can_work(location.activities[key])) {
                activity_div.classList.add("start_activity");
                activity_div.setAttribute("onclick", "start_activity(this.getAttribute('data-activity'));");
            } else {
                activity_div.classList.add("activity_unavailable");
            }

            const job_tooltip = document.createElement("div");
            let job_tooltip_content = "";
            job_tooltip.classList.add("job_tooltip");
            if(!location.activities[key].infinite){
                if(location.activities[key].availability_time) {
                    job_tooltip_content = `${translationManager.getText(language, "ui available from to", {v1: location.activities[key].availability_time.start, v2: location.activities[key].availability_time.end})} <br>`;
                }
                if(location.activities[key].availability_seasons) {
                    if(location.activities[key].availability_seasons.length === 3) {
                        const unavailable_seasons = seasons.filter(x => !location.activities[key].availability_seasons.includes(x));
                        job_tooltip_content += `${translationManager.getText(language, "ui not available during", {v1: season_list(unavailable_seasons)})} <br>`;
                    } else {
                        job_tooltip_content += `${translationManager.getText(language, "ui available during", {v1: season_list(location.activities[key].availability_seasons)})} <br>`;
                    }
                }
            }
            const {gathering_time_needed} =  location.activities[key].getActivityEfficiency();
            job_tooltip_content += `${translationManager.getText(language, "ui pays per worked", {v1: format_money(location.activities[key].get_payment()), v2: format_working_time(gathering_time_needed)})}`;
            insert_HTML(job_tooltip, job_tooltip_content);
            activity_div.appendChild(job_tooltip);
    
            insert_HTML(activity_div, `<i class="material-icons location_choice_icon">check_box_outline_blank</i> ` + location.activities[key].getStartingText());
            choice_list.push(activity_div);
        });
    } else if (category === "train") {
        Object.keys(location.activities).forEach(key => {
            if(!activities[location.activities[key].activity_name]?.is_unlocked 
                || !location.activities[key]?.is_unlocked 
                || activities[location.activities[key].activity_name].type !== "TRAINING"
                || activities[location.activities[key].activity_name].base_skills_names.filter(skill => !skills[skill].is_unlocked).length > 0) 
            {
                return;
            }

            const activity_div = document.createElement("div");

            activity_div.classList.add("activity_div", "start_activity", "location_choice");
            activity_div.setAttribute("data-activity", key);
            activity_div.setAttribute("onclick", "start_activity(this.getAttribute('data-activity'));");

            if(location.activities[key].availability_seasons) {
                const activity_tooltip = document.createElement("div");
                activity_tooltip.classList.add("job_tooltip");
                if(location.activities[key].availability_seasons.length === 3) {
                    const unavailable_seasons = seasons.filter(x => !location.activities[key].availability_seasons.includes(x));
                    insert_HTML(activity_tooltip, `${translationManager.getText(language, "ui not available during", {v1: season_list(unavailable_seasons)})} <br>`);
                } else {
                    insert_HTML(activity_tooltip, `${translationManager.getText(language, "ui available during", {v1: season_list(location.activities[key].availability_seasons)})} <br>`);
                }
                activity_div.appendChild(activity_tooltip);
            }

            insert_HTML(activity_div, `<i class="material-icons location_choice_icon">check_box_outline_blank</i> ` + location.activities[key].getStartingText());
            choice_list.push(activity_div);
        });
    } else if (category === "gather") {
        Object.keys(location.activities).forEach(key => {
            if(!activities[location.activities[key].activity_name]?.is_unlocked 
                || !location.activities[key]?.is_unlocked 
                || activities[location.activities[key].activity_name].type !== "GATHERING"
                || activities[location.activities[key].activity_name].base_skills_names.filter(skill => !skills[skill].is_unlocked).length > 0) 
            {
                return;
            }

            const activity_div = document.createElement("div");

            activity_div.classList.add("activity_div", "start_activity", "location_choice");
            activity_div.setAttribute("data-activity", key);
            

            if(can_work(location.activities[key])) {
                activity_div.classList.add("start_activity");
                activity_div.setAttribute("onclick", "start_activity(this.getAttribute('data-activity'));");
            } else {
                activity_div.classList.add("activity_unavailable");
            }

            activity_div.appendChild(create_gathering_tooltip(location.activities[key]));

            insert_HTML(activity_div, `<i class="material-icons location_choice_icon">check_box_outline_blank</i> ` + location.activities[key].getStartingText());
            choice_list.push(activity_div);
        });
    } else if (category === "travel") {
        if(!is_combat){
            for(let i = 0; i < location.connected_locations.length; i++) { 
                
                if(!is_location_offered(location.connected_locations[i].location)) { //skip if not unlocked, finished, or conditions unmet
                    continue;
                }
                if(location.connected_locations[i].location.is_challenge) {
                    continue;
                    //challenges displayed separately
                }

                const action = document.createElement("div");
                let action_html_content = "";
                
                const travel_time = format_time({time: {minutes: travel_times[location.id][location.connected_locations[i].location.id]}});

                if("connected_locations" in location.connected_locations[i].location) {// check again if connected location is normal or combat
                    action.classList.add("travel_normal");
                    if("custom_text" in location.connected_locations[i]) {
                        action_html_content = `<div class='location_choice_icon_box'><i class="material-icons location_choice_icon">check_box_outline_blank</i></div> ` + translationManager.getText(language, location.connected_locations[i].custom_text) + " [" + travel_time + "]";
                    } else {
                        action_html_content = `<div class='location_choice_icon_box'><i class="material-icons location_choice_icon">check_box_outline_blank</i></div> ` + translationManager.getText(language, "ui travel go to") + " [" + location.connected_locations[i].location.getName()+"]"+" [" + travel_time + "]";
                    }
                } else {
                    action.classList.add("travel_combat");
                    if("custom_text" in location.connected_locations[i]) {
                        action_html_content = `<div class='location_choice_icon_box'><i class="material-icons">warning_amber</i></div> ` + translationManager.getText(language, location.connected_locations[i].custom_text) + " [" + travel_time + "]";
                    } else {
                        action_html_content = `<div class='location_choice_icon_box'><i class="material-icons">warning_amber</i></div>  ` + translationManager.getText(language, "ui travel enter the") + " [" + location.connected_locations[i].location.getName()+"] [" + travel_time + "]";
                    }
                }

                insert_HTML(action, action_html_content);
            
                action.classList.add("action_travel", "location_choice");
                action.setAttribute("data-travel", location.connected_locations[i].location.id);
                action.setAttribute("onclick", "change_location({location_id: this.getAttribute('data-travel')});");
        
                choice_list.push(action);
            } 
        } else {
            const action = document.createElement("div");
            let action_html_content = "";
            action.classList.add("travel_normal", "action_travel", "location_choice");

            const travel_time = format_time({time: {minutes: travel_times[location.id][location.parent_location.id]}});
            let travel_time_text = "";
            if(travel_time) {
                travel_time_text = " [" + travel_time + "]";
            }
            if(location.leave_text) {
                action_html_content = translationManager.getText(language, location.leave_text) + travel_time_text;
            } else {
                action_html_content = translationManager.getText(language, "ui travel go back to") + " [" + location.parent_location.getName() + "]" + travel_time_text;
            }

            insert_HTML(action, action_html_content);
            action.setAttribute("data-travel", location.parent_location.id);
            action.setAttribute("onclick", "change_location({location_id:this.getAttribute('data-travel')});");

            choice_list.push(action);
        }

        if(game_state.last_location_with_bed && !location.housing?.is_unlocked && !location.connected_locations) {
            const last_bed = locations[game_state.last_location_with_bed];

            const action = document.createElement("div");
            let action_html_content = "";
            action.classList.add("action_travel", "travel_normal", "location_choice");

            const travel_time = format_time({time: {minutes: travel_times[location.id][last_bed.id]}});
            
            if(!is_combat) {
                action_html_content += `<i class="material-icons location_choice_icon">check_box_outline_blank</i> `
            }
            if(travel_time) {
                action_html_content += `${translationManager.getText(language, "ui travel quick return", {v1: last_bed.getName()})}` +" [" + travel_time + "]";
            } else {
                action_html_content += `${translationManager.getText(language, "ui travel quick return", {v1: last_bed.getName()})}`;
            }

            insert_HTML(action, action_html_content);
            action.setAttribute("data-travel", last_bed.name);
            action.setAttribute("onclick", "change_location({location_id:this.getAttribute('data-travel')});");
    
            choice_list.push(action);
        }

        choice_list.sort((a,b) => b.classList.contains("travel_normal") - a.classList.contains("travel_normal"));
    } else if (category === "challenge") {
        const available_challenges = location.connected_locations.filter(loc => (loc.location.is_challenge && loc.location.is_unlocked && !loc.location.is_finished));
       
        for(let i = 0; i < available_challenges.length; i++) { 
            const action = document.createElement("div");
            let action_html_content = "";
            action.classList.add("travel_combat", "location_choice");
            if("custom_text" in available_challenges[i]) {
                action_html_content = `<i class="material-icons">warning_amber</i>  ` + translationManager.getText(language, available_challenges[i].custom_text);
            } else {
                action_html_content = `<i class="material-icons">warning_amber</i>  ` + translationManager.getText(language, "ui travel enter the") + " " + available_challenges[i].location.getName();
            }
            
            insert_HTML(action, action_html_content);
            action.classList.add("action_travel");
            action.setAttribute("data-travel", available_challenges[i].location.id);
            action.setAttribute("onclick", "change_location({location_id:this.getAttribute('data-travel')});");
    
            choice_list.push(action);
        }
    } else if (category === "action") {
        Object.keys(location.actions).forEach(key => {
            if(!location.actions[key].can_be_displayed(character)) {
                return;
            }

            const location_action_div = document.createElement("div");

            location_action_div.classList.add("location_action_div", "start_game_action", "location_choice");
            location_action_div.setAttribute("data-location_action", key);
            location_action_div.setAttribute("onclick", "start_game_action(this.getAttribute('data-location_action'));");

            location_action_div.appendChild(create_location_action_tooltip(location.actions[key]));
    
            /*
                getActionName, not getStartingText. starting_text is documented in the
                model as "text on the button" and most of them read like one, but six
                actions carry a narrative sentence there and were rendering a hundred
                characters of prose inside a button - "You mark it out behind the well.
                Within the hour there are more people carrying brick than you asked
                for." was the label for Build the village hearth.

                Every one of those six already declares action_name with the short
                label written and unused, and the model falls back to
                `action_name || starting_text`, so the other eighty-one labels are
                byte-for-byte what they were.
            */
            insert_HTML(location_action_div, `<i class="material-icons location_choice_icon">check_box_outline_blank</i> ` + location.actions[key].getActionName());
            choice_list.push(location_action_div);
        });
    } else if (category === "fast_travel") {
        choice_list = create_fast_travel_choices();
    }

    return choice_list;
}

function create_fast_travel_choices() {
    let choice_list = [];

    let available_fast_travel = 
    [
        ...Object.keys(favourite_locations).filter(key => (key !== current_location.id)),
        ...Object.keys(unlocked_beds).filter(key => (key !== current_location.id && locations[key].is_unlocked && !locations[key].is_finished))
    ];

    if(game_state.last_combat_location && !available_fast_travel.includes(game_state.last_combat_location)) {
        available_fast_travel.push(game_state.last_combat_location);
    }

    available_fast_travel = available_fast_travel.sort((a,b) => {
        if(locations[a].housing?.is_unlocked && !locations[b].housing?.is_unlocked) {
            return -1;
        } else if(!locations[a].housing?.is_unlocked && locations[b].housing?.is_unlocked) {
            return 1;
        } else {
            if(locations[a].tags.safe_zone && !locations[b].tags.safe_zone) {
                return -1;
            } else if(!locations[a].tags.safe_zone && locations[b].tags.safe_zone) {
                return 1;
            } else {
                return 0;
            }
        }
    });

    for(let i = 0; i < available_fast_travel.length; i++) { 
        if(!locations[available_fast_travel[i]].is_unlocked || locations[available_fast_travel[i]].is_finished) { //skip if not unlocked or if finished
            continue;
        }
        if(available_fast_travel[i] === current_location.id) { //do not show current location as a valid destination
            continue;
        }

        const action = document.createElement("div");
        let action_html_content = "";
        const travel_time = format_time({time: {minutes: travel_times[current_location.id][available_fast_travel[i]]}});

        if(locations[available_fast_travel[i]].tags.safe_zone) {
        
            action.classList.add("travel_normal");

            if(locations[available_fast_travel[i]].housing?.is_unlocked) {
                action_html_content = `<i class="material-icons">bed</i> <span class="fast_travel_name">` + translationManager.getText(language, "ui travel travel to") + " [" + locations[available_fast_travel[i]].getName()+"] [" + travel_time + "]</span>";
            } else {
                action_html_content = `<i class="material-icons location_choice_icon">check_box_outline_blank</i> <span class="fast_travel_name">` + translationManager.getText(language, "ui travel travel to") + " [" + locations[available_fast_travel[i]].getName()+"] [" + travel_time + "]</span>";
            }
            
            action.classList.add("action_travel", "location_choice");
            action.setAttribute("data-travel", locations[available_fast_travel[i]].id);
            action.setAttribute("onclick", "change_location({location_id:this.getAttribute('data-travel'), event});");
        } else {            
            action.classList.add("travel_combat");
            
            action_html_content = `<i class="material-icons">warning_amber</i> <span class="fast_travel_name">${translationManager.getText(language, "ui travel travel to")} [${locations[available_fast_travel[i]].getName()}] [${travel_time}] </span>`;
            
            action.classList.add("action_travel", "location_choice");
            action.setAttribute("data-travel", locations[available_fast_travel[i]].id);
            action.setAttribute("onclick", "change_location({location_id: this.getAttribute('data-travel'), event});");
        }

        insert_HTML(action, action_html_content);

        if(!locations[available_fast_travel[i]].housing?.is_unlocked && locations[available_fast_travel[i]].id !== game_state.last_combat_location) {
            const removal_button = document.createElement("span");
            insert_HTML(removal_button, `<i class="material-icons fast_travel_removal_button">close</i>`);
            removal_button.setAttribute("onclick","remove_location_from_favourites({location_id:this.parentNode.getAttribute('data-travel')})");
            action.appendChild(removal_button);
        }

        choice_list.push(action);
    }
    return choice_list;
}

function remove_fast_travel_choice({location_id}) {
    if(!location_choice_divs["fast_travel"]) {
        return;
    }
    
    const element = location_choice_divs["fast_travel"].querySelector(`[data-travel="${location_id}"`);

    if(!element) {
        return;
    }

    if(location_id === game_state.last_combat_location || locations[location_id].housing?.is_unlocked) {
        //remove only button
        element.getElementsByClassName("fast_travel_removal_button")[0].parentNode.remove();
    } else {
        //remove full element
        element.remove();
    }
}

function update_displayed_combat_location(location) {

    document.documentElement.style.setProperty('--location_desc_tooltip_visibility', "visible");
    clear_action_div();
    clear_HTML_content(location_types_div);
    let action;

    update_location_icon(location);

    clear_count_div.style.display = "block";
    enemy_count_div.style.display = "block";
    combat_div.style.display = "block";

    if(!game_options.disable_combat_autoswitch) {
        combat_switch.click();
        combat_switch.classList.add("active_selection_button");
        inventory_switch.classList.remove("active_selection_button");
    } 
    combat_switch.style.pointerEvents = "auto";
    combat_switch.style.cursor = "pointer";
    combat_switch.style.color = "white";

    document.documentElement.style.setProperty('--actions_div_height', getComputedStyle(document.body).getPropertyValue('--actions_div_height_combat'));
    document.documentElement.style.setProperty('--actions_div_top', getComputedStyle(document.body).getPropertyValue('--actions_div_top_combat'));


    enemy_count_div.children[0].children[1].innerText = location.enemy_count - location.enemy_groups_killed % location.enemy_count + " / " + location.enemy_count;
    clear_count_div.children[0].children[0].innerText = translationManager.getText(language, "ui clears") + ": [" + Math.floor(location.enemy_groups_killed / location.enemy_count) +"]";

    action = create_location_choices({location: location, category: "travel", is_combat: true});

    action_div.append(...action);

    location_name_span.innerText = current_location.getName();
    if(current_location.types.length == 0) {
        document.documentElement.style.setProperty('--location_name_div_width', '390px');
    } else {
        document.documentElement.style.setProperty('--location_name_div_width', '250px');
    }

    location_tooltip.innerText = current_location.getDescription();
    location_tooltip.classList.add("location_tooltip");
    
    document.getElementById("location_description_div").innerText = current_location.getDescription();
    create_location_types_display(current_location);
}

function update_location_kill_count(location) {
    enemy_count_div.children[0].children[1].innerText = location.enemy_count - location.enemy_groups_killed % location.enemy_count + " / " + location.enemy_count;
    clear_count_div.children[0].children[0].innerText = translationManager.getText(language, "ui clears") + ": [" + Math.floor(location.enemy_groups_killed / location.enemy_count) +"]";
}

function create_location_types_display(current_location){
    for(let i = 0; i < current_location.types?.length; i++) {
        const type_div = document.createElement("div");

        insert_HTML(type_div, location_type_label(current_location.types[i].type)
            + (current_location.types[i].stage>1?` ${"I".repeat(current_location.types[i].stage)}`:""));
        type_div.classList.add("location_type_div");

        const type_tooltip = document.createElement("div");
        //The stage description is a text id, and the type's own name is a display
        //name, so both go through the translation layer.
        let type_tooltip_html_content = translationManager.getText(language,
            location_types[current_location.types[i].type].stages[current_location.types[i].stage].description);
        type_tooltip.classList.add("location_type_tooltip");

        const {type, stage} = current_location.types[i];
        const {effects} = location_types[type].stages[stage];
        if(Object.keys(effects || {}).length > 0) {
            type_tooltip_html_content += `<br>`;

            Object.keys(effects).forEach(stat => {
                if(effects[stat].multiplier) {
                    const base = effects[stat].multiplier;
                    const actual = get_location_type_penalty(type, stage, stat, "multiplier");
                    type_tooltip_html_content += `<br>${stat_label_short(stat)} x${Math.round(1000*actual)/1000}`;
                    if(base != actual) {
                        type_tooltip_html_content += ` [${translationManager.getText(language, "ui base value", {v1: "x" + effects[stat].multiplier})}]`;
                    }
                }
                if(effects[stat].flat) {
                    const base = effects[stat].flat;
                    const actual = get_location_type_penalty(type, stage, stat, "flat");
                    type_tooltip_html_content += `<br>${stat_label_short(stat)}: ${Math.round(1000*actual)/1000}`;
                    if(base != actual) {
                        type_tooltip_html_content += ` [${translationManager.getText(language, "ui base value", {v1: effects[stat].flat})}]`;
                    }
                }
                
            });

        } //other effects to be done when/if they are added

        insert_HTML(type_tooltip, type_tooltip_html_content);
        type_div.appendChild(type_tooltip);
        location_types_div.appendChild(type_div);
    }
}

function update_displayed_location_types(current_location) {
    clear_HTML_content(location_types_div);
    create_location_types_display(current_location);
}






































function create_location_action_tooltip(location_action) {
    const action_tooltip = document.createElement("div");
    action_tooltip.classList.add("job_tooltip","location_action_tooltip");
    action_tooltip.innerText = location_action.getDescription();
    if(location_action.keep_progress) {
        action_tooltip.innerText += "\n\n" + translationManager.getText(language, "ui pausing keeps progress");
    }

    return action_tooltip;
}

/**
 * 
 * @param {LocationActivity} location_activity 
 */
function create_gathering_tooltip(location_activity) {
    const gathering_tooltip = document.createElement("div");
    gathering_tooltip.classList.add("job_tooltip");
    gathering_tooltip.dataset.job_tooltip = location_activity.activity_id;
    
    const {gathering_time_needed, gained_resources} = location_activity.getActivityEfficiency();

    let skill_names = "";
    let tooltip_content = "";

    //TODO mayhap extract to its own method
    if(location_activity.availability_seasons) {
        if(location_activity.availability_seasons.length === 3) {
            const unavailable_seasons = seasons.filter(x => !location_activity.availability_seasons.includes(x));
            tooltip_content += `${translationManager.getText(language, "ui not available during", {v1: unavailable_seasons.join(", ")})} <br>`;
        } else {
            tooltip_content += `${translationManager.getText(language, "ui available during", {v1: location_activity.availability_seasons.join(", ")})} <br>`;
        }
    }

    for(let i = 0; i < activities[location_activity.activity_name].base_skills_names.length; i++) {
        skill_names += skills[activities[location_activity.activity_name].base_skills_names[i]].name();
    }

    if(location_activity.gained_resources.skill_required) {
        tooltip_content += `<span class="activity_efficiency_info">${translationManager.getText(language, "ui efficiency scaling")}:<br>${translationManager.getText(language, "ui skill level range", {v1: skill_names, v2: location_activity.gained_resources.skill_required[0], v3: location_activity.gained_resources.skill_required[1]})}</span><br><br>`;
    }

    tooltip_content += `${translationManager.getText(language, "ui every chance to find", {v1: format_working_time(gathering_time_needed)})}`;
    for(let i = 0; i < gained_resources.length; i++) {
        const count = gained_resources[i].count;
        tooltip_content += `<br>x${count[0]===count[1]?count[0]:`${count[0]}-${count[1]}`} "${obscure_name(gained_resources[i].name)}" at ${Math.round(100*gained_resources[i].chance)}%`;
    }

    set_HTML(gathering_tooltip, tooltip_content);
    return gathering_tooltip;
}

/**
 * Updates gathering tooltip, both for location view and for an ongoing gathering
 * @param {LocationActivity} activity 
 * @returns 
 */
function update_gathering_tooltip(activity) {
    let parent = document.querySelector(`[data-activity="${activity.activity_id}"]`);
    let gathering_tooltip;
    if(parent) {
        gathering_tooltip = parent.getElementsByClassName("job_tooltip")[0];
    } else {
        gathering_tooltip = document.getElementById("gathering_progress_bar_max")?.querySelector(`[data-job_tooltip="${activity.activity_id}"]`);
    }

    if(!gathering_tooltip) {
        return;
    }
    
    const {gathering_time_needed, gained_resources} = activity.getActivityEfficiency();

    let skill_names = "";
    let tooltip_content = "";
    for(let i = 0; i < activities[activity.activity_name].base_skills_names.length; i++) {
        skill_names += skills[activities[activity.activity_name].base_skills_names[i]].name();
    }

    if(activity.gained_resources.skill_required) {
        tooltip_content = `<span class="activity_efficiency_info">${translationManager.getText(language, "ui efficiency scaling")}:<br>${translationManager.getText(language, "ui skill level range", {v1: skill_names, v2: activity.gained_resources.skill_required[0], v3: activity.gained_resources.skill_required[1]})}</span><br><br>`;
    }
    tooltip_content += `${translationManager.getText(language, "ui every chance to find", {v1: format_working_time(gathering_time_needed)})}`;
    for (let i = 0; i < gained_resources.length; i++) {
        const shown_count = gained_resources[i].count[0] === gained_resources[i].count[1]
            ? gained_resources[i].count[0]
            : `${gained_resources[i].count[0]}-${gained_resources[i].count[1]}`;
        tooltip_content += `<br>${translationManager.getText(language, "ui resource at chance",
            {v1: shown_count, v2: obscure_name(gained_resources[i].name), v3: Math.round(100*gained_resources[i].chance)})}`;
    }
    set_HTML(gathering_tooltip, tooltip_content);
}

function update_displayed_health() { //call it when using healing items, resting or getting hit
    const total_regen = character.stats.get_health_regeneration_total() + character.stats.get_health_loss_total();
    const sign = total_regen > 0 ? "+":"";
    current_health_value_div.innerText = Math.ceil(character.stats.full.health) + "/" + Math.ceil(character.stats.full.max_health)
        + (total_regen != 0 ? " ("+ sign + expo({number: total_regen, precision: 1}) + "/s) " : "")
        + " " + translationManager.getText(language, "ui bar hp");
    current_health_bar.style.width = (character.stats.full.health*100/character.stats.full.max_health).toString() +"%";
}
function update_displayed_stamina() { //call it when eating, resting or fighting
    const total_regen = character.stats.get_stamina_regeneration_total();
    const sign = total_regen > 0 ? "+":"";
    //The label was concatenated with no leading space, so with no regeneration to
    //print between them this read "40/40stamina". The health bar above has the
    //space; this one never did.
    current_stamina_value_div.innerText = Math.round(character.stats.full.stamina) + "/" + Math.round(character.stats.full.max_stamina)
        + (total_regen != 0 ? " (" + sign + expo({number: total_regen, precision: 1}) + "/s) " : "")
        + " " + translationManager.getText(language, "ui bar stamina");
    current_stamina_bar.style.width = (character.stats.full.stamina*100/character.stats.full.max_stamina).toString() +"%";
}

/**
 * updates displayed stats and their breakdowns (including health and stamina)
 */
function update_displayed_stats() {
    Object.keys(stats_divs).forEach(function(key){
        if(key === "crit_rate" || key === "crit_multiplier") {
            stats_divs[key].innerText = `${(character.stats.full[key]*100).toFixed(1)}%`;
        } 
        else if(key === "attack_speed") {
            stats_divs[key].innerText = `${(character.get_attack_speed()).toFixed(1)}`;
        }
        else if(key === "attack_power") {
            stats_divs[key].innerText = `${(character.get_attack_power()).toFixed(1)}`;
        }
        else {
            stats_divs[key].innerText = `${(character.stats.full[key]).toFixed(1)}`;
        }
        update_stat_description(key);
    });

    const attack_stats = document.getElementById("attack_stats");

    const ap = Math.round(character.stats.full.attack_points);
    other_combat_divs.attack_points.innerText = `${ap}`;

    if(character.equipment["off-hand"] != null && character.equipment["off-hand"].offhand_type === "shield") { //HAS SHIELD
        const dp = (character.stats.full.block_chance*100).toFixed(1)
        other_combat_divs.defensive_action.innerText = translationManager.getText(language, "ui label block") + " :";
        other_combat_divs.defensive_points.innerText = `${dp}%`;
        other_combat_divs.defensive_points.parentNode.children[2].children[0].innerText = translationManager.getText(language, "ui tooltip block chance");

        attack_stats.children[3].innerText = `${translationManager.getText(language, "ui label block")} : ${Math.round(dp)}%`;
    }
    else { //NO SHIELD
        const ep = Math.round(character.stats.full.evasion_points);
        other_combat_divs.defensive_action.innerText = translationManager.getText(language, "ui abbr evasion points") + " : ";
        other_combat_divs.defensive_points.innerText = `${ep}`;
        other_combat_divs.defensive_points.parentNode.children[2].children[0].innerText = 
        translationManager.getText(language, "ui tooltip evasion points");

        attack_stats.children[3].innerText = `${translationManager.getText(language, "ui abbr evasion points")}: ${Math.round(ep)} `;
    }

    update_stat_description("defensive_points");
    update_stat_description("attack_points");
    update_bar_tooltips();

    let atk = character.get_attack_power();
    if(atk > 100) {
        atk = Math.round(atk);
    } else {
        atk = Math.round(10*atk)/10;
    }
    //The abbreviation rows already existed for the enemy tooltip; this strip was
    //spelling them out in English instead.
    attack_stats.children[0].innerText = `${translationManager.getText(language, "ui abbr attack")}: ${atk}`;
    attack_stats.children[1].innerText = `${translationManager.getText(language, "ui abbr speed")}: ${Math.round(character.get_attack_speed()*100)/100}`;
    attack_stats.children[2].innerText = `${translationManager.getText(language, "ui label ap")}  ${Math.round(ap)}`;
    attack_stats.children[4].innerText = `${translationManager.getText(language, "ui abbr defense")}: ${Math.round(character.stats.full.defense)} `;
}

function update_stat_description(stat) {
    let target;

    if(stats_divs[stat]){
        target = stats_divs[stat].parentNode.children[2].children[1];
    } else if(other_combat_divs[stat] && stat !== "defensive_action") {
        target = other_combat_divs[stat].parentNode.children[2].children[1]; 
    } else {
        return;
    }

    set_HTML(target, create_stat_breakdown(stat));
    
    return;
}

function update_bar_tooltips(){
    update_health_bar_tooltip();
    update_stamina_bar_tooltip();
    update_xp_bar_tooltip();
}

/**
 * health bar tooltip, max health only
 */
function update_health_bar_tooltip() {
    let html_content = "<b>" + translationManager.getText(language, "ui stat max health") + ":</b> " + Math.ceil(character.stats.full.max_health) + "<br>";
    html_content += create_stat_breakdown("max_health");

    if(character.stats.full.health_regeneration_flat) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat health regen flat") + ":</b> " + Math.round(10*character.stats.full.health_regeneration_flat)/10 + "<br>";
        html_content += create_stat_breakdown("health_regeneration_flat");
    }

    if(character.stats.full.health_regeneration_percent) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat health regen percent") + ":</b> " + Math.round(10*character.stats.full.health_regeneration_percent)/10 + "<br>";
        html_content += create_stat_breakdown("health_regeneration_percent");
    }

    if(character.stats.full.health_loss_flat) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat health loss flat") + ":</b> " + Math.round(10*character.stats.full.health_loss_flat)/10 + "<br>";
        html_content += create_stat_breakdown("health_loss_flat");
    }

    if(character.stats.full.health_loss_percent) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat health loss percent") + ":</b> " + Math.round(10*character.stats.full.health_loss_percent)/10 + "<br>";
        html_content += create_stat_breakdown("health_loss_percent");
    }

    const health_recovery_balance = character.stats.full.health_regeneration_flat + character.stats.full.health_loss_flat + character.stats.full.max_health * (character.stats.full.health_regeneration_percent + character.stats.full.health_loss_percent)/100;

    html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat total health balance") + ":</b> " + (health_recovery_balance>0?"+":"") + Math.round(10*health_recovery_balance)/10 + "<br>";

    set_HTML(health_tooltip_div, html_content);
}

/**
 * stamina bar tooltip, max and efficiency only
 */
function update_stamina_bar_tooltip() {
    let html_content;
    html_content = "<b>" + translationManager.getText(language, "ui stat max stamina") + ":</b> " + Math.round(character.stats.full.max_stamina) + "<br>";
    html_content += create_stat_breakdown("max_stamina");

    if(character.stats.full.stamina_efficiency != 1) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat stamina efficiency") + ":</b> " + Math.round(100*character.stats.full.stamina_efficiency)/100 + "<br>";
        html_content += create_stat_breakdown("stamina_efficiency");
    }

    if(character.stats.full.stamina_regeneration_flat) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat stamina regen flat") + ":</b> " + Math.round(10*character.stats.full.stamina_regeneration_flat)/10 + "<br>";
        html_content += create_stat_breakdown("stamina_regeneration_flat");
    }

    if(character.stats.full.stamina_regeneration_percent) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat stamina regen percent") + ":</b> " + Math.round(10*character.stats.full.stamina_regeneration_percent)/10 + "<br>";
        html_content += create_stat_breakdown("stamina_regeneration_percent");
    }

    set_HTML(stamina_tooltip_div, html_content);
}

function update_xp_bar_tooltip() {


    let html_content = "";
    if(character.xp_bonuses.total_multiplier.all != 1) {
        html_content += "<b>" + translationManager.getText(language, "ui stat global xp multiplier") + ":</b> " + Math.round(100*character.xp_bonuses.total_multiplier.all)/100 + "<br>";
        html_content += create_xp_bonus_breakdown("all", false);
    } else {
        html_content += "<b>" + translationManager.getText(language, "ui stat no global xp multipliers") + "</b><br>";
    }

    if(character.xp_bonuses.total_multiplier.hero != 1) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat hero xp multiplier") + ":</b> " + Math.round(100*character.xp_bonuses.total_multiplier.hero)/100 
                                        + " " + translationManager.getText(language, "ui with global",
                                            {v1: Math.round(get_hero_xp_gain()*100)/100}) + "<br>";
        html_content += create_xp_bonus_breakdown("hero", false);
    }

    if(character.xp_bonuses.total_multiplier.all_skill != 1) {
        html_content += "<br>------------------------<br><b>" + translationManager.getText(language, "ui stat skill xp multiplier") + ":</b> " + Math.round(100*character.xp_bonuses.total_multiplier.all_skill)/100
                                        + " " + translationManager.getText(language, "ui with global",
                                            {v1: Math.round(get_skills_overall_xp_gain()*100)/100}) + "<br>";
        html_content += create_xp_bonus_breakdown("all_skill", false);
    }

    set_HTML(xp_bar_tooltip_div, html_content);
}

/**
 * creates full breakdown for provided stat
 * @param {} stat 
 * @returns 
 */
function create_stat_breakdown(stat) {
    let html_string = "";

    if(stat === "attack_power") {
        html_string += 
        `<br>${translationManager.getText(language, "ui breakdown")}
        <br>${translationManager.getText(language, "ui base value weapon")} ${Math.round(100* character.stats.total_flat.attack_power)/100}`;
    } else if (stat === "attack_points"){
        html_string += 
        `<br>${translationManager.getText(language, "ui breakdown")}
        <br>${translationManager.getText(language, "ui base value heading")} ${Math.round(100* character.stats.total_flat.attack_points)/100}`;
    } else if(stat === "defensive_points"){
        if(character.equipment["off-hand"] != null && character.equipment["off-hand"].offhand_type === "shield") {
            stat = "block_chance";
        } else {
            stat = "evasion_points";
        }
        html_string += 
            `<br>${translationManager.getText(language, "ui breakdown")}
            <br>${translationManager.getText(language, "ui base value heading")} ${Math.round(100 * character.stats.total_flat[stat])/100}`;
    } else {
       html_string += 
        `<br>${translationManager.getText(language, "ui breakdown")}
        <br>${translationManager.getText(language, "ui base value heading")} ${Math.round(100*character.base_stats[stat])/100}`;
    }

    Object.keys(character.stats.flat).forEach(stat_type => {
        if(character.stats.flat[stat_type][stat] && character.stats.flat[stat_type][stat] !== 0) {
            const sign = character.stats.flat[stat_type][stat]>=0?"+":"";
            html_string +=  `<br>${stat_source_label(stat_type)}: ${sign}${Math.round(100*character.stats.flat[stat_type][stat])/100}`;
        }
    });

    Object.keys(character.stats.multiplier).forEach(stat_type => {
        if(character.stats.multiplier[stat_type][stat] && character.stats.multiplier[stat_type][stat] !== 1) {
            html_string +=  `<br>${stat_source_label(stat_type)}: x${Math.round(100*character.stats.multiplier[stat_type][stat])/100}`;
        }
    });

    return html_string;
}

/**
 * creates full breakdown for provided bonus category (skill id, skill category, all, all skill, hero)
 * @param {*} bonus 
 * @param {*} include_multipliers 
 * @returns 
 */
function create_xp_bonus_breakdown(bonus, include_multipliers) {
    let html_string = "";
    let xp_bonus_value = 1;

    if(include_multipliers) {
        if(bonus !== "all") {
            if(bonus !== "all_skill" && bonus !== "hero") {
                xp_bonus_value = get_skill_xp_gain_bonus(bonus);
            } else {
                xp_bonus_value *= (character.xp_bonuses.total_multiplier.all || 1);
            }
        }
    }

    html_string += `<br>${translationManager.getText(language, "ui breakdown")}
        <br>${translationManager.getText(language, "ui base value heading")} ${Math.round(100*xp_bonus_value)/100}`;
    
    Object.keys(character.xp_bonuses.multiplier).forEach(bonus_type => {
        if(character.xp_bonuses.multiplier[bonus_type]?.[bonus] && character.xp_bonuses.multiplier[bonus_type]?.[bonus] !== 1) {
            html_string +=  `<br>${stat_source_label(bonus_type)}: x${Math.round(100*character.xp_bonuses.multiplier[bonus_type][bonus])/100}`;
        }
    });

    return html_string;
}

function update_displayed_effects() {
    const effect_count = Object.keys(active_effects).length;
    active_effect_count.innerText = effect_count;
    if(effect_count > 0) {
        //effects exist, refresh the whole displayed content
        clear_HTML_content(active_effects_tooltip);
        
        Object.values(effect_divs).forEach(eff => {
            eff.remove();
        });

        effect_divs = {};
        Object.values(active_effects).forEach(effect => {
            effect_divs[effect.name] = create_effect_tooltip({effect_name: effect.name, duration: effect.duration, add_bonus: true});
            active_effects_tooltip.appendChild(effect_divs[effect.name]);
        });
    } else {
        //no effects
        set_HTML(active_effects_tooltip, translationManager.getText(language, "ui no active effects"));
        effect_divs = {};
    }
    update_displayed_effect_durations();
}

function update_displayed_effect_durations() {
    Object.keys(effect_divs).forEach(key => {
        if(!active_effects[key]?.duration) {
            effect_divs[key].remove();
            delete effect_divs[key];
        } else {
            effect_divs[key].querySelector(".active_effect_duration").innerText = format_time({time: {minutes: active_effects[key].duration}, round: false});
        }
    });
}

/**
 * Paints the date line, translating the parts that are words.
 *
 * game_time.js returns the season, the weekday and the time of day as ENGLISH
 * strings and has to keep doing so: conditions.js compares getSeason() against a
 * `season: {yes: "Summer"}` written in content, and toString() feeds the save's
 * saved_at stamp. Translating them at the source would break a condition quietly
 * and put Turkish into save data.
 *
 * So the numbers come from the clock and the words come from the locale, keyed on
 * the English the clock returns - the same split the registry keys use.
 */
function update_displayed_time() {
    const season = current_game_time.getSeason();
    const weekday = current_game_time.getDayOfTheWeek();
    const time_of_the_day = current_game_time.getTimeOfDaySimple();

    const pad = (value) => value > 9 ? `${value}` : `0${value}`;
    const date = `${pad(current_game_time.day)}/${pad(current_game_time.month)}/`
        + `${current_game_time.year} ${pad(current_game_time.hour)}:${pad(current_game_time.minute)}`;

    set_HTML(time_field, `${date}, `
        + `${translationManager.getText(language, "season " + season)}, `
        + `${translationManager.getText(language, "weekday " + weekday)}`
        + `, <b>${translationManager.getText(language, "time of day " + time_of_the_day)}</b>`);
}

function update_displayed_temperature() {
    const temperature = get_current_temperature_smoothed();
    let displayed_temperature = Math.round(10*(game_options.use_uncivilised_temperature_scale?celsius_to_fahrenheit(temperature):temperature))/10;
    let html_content;
    const temperature_unit = game_options.use_uncivilised_temperature_scale?"°F":"°C";

    //whether temperature is low enough to give any cold effect
    const is_cold = temperature < (cold_status_temperatures[0]-get_character_cold_tolerance())?true:false;
    let temperature_class = "normal_temperature";
    if(is_cold) {
        temperature_class = "cold_temperature";
    }

    displayed_temperature = displayed_temperature.toString();
    if(!displayed_temperature.includes(".")) {
        //checks if there's a decimal, adds a trailing zero if not
        displayed_temperature += ".0";
    }

    clear_HTML_content(weather_field);

    if(current_location.is_under_roof) {
        html_content = displayed_temperature + temperature_unit;
    } else {
        if(is_raining()) {
            if(temperature > 0) {
                //rain/clouds
                html_content = `<span class="material-icons icon">cloud</span><span class="${temperature_class}">` + displayed_temperature + temperature_unit+"</span>";
            } else {
                //snow
                html_content =  `<span class="material-icons icon">ac_unit</span><span class="${temperature_class}">` + displayed_temperature + temperature_unit+"</span>";
            }
        } else {
            //normal weather, no icon
            html_content =  `<span class="${temperature_class}">` + displayed_temperature + temperature_unit+"</span>";
        }
    }

    insert_HTML(weather_field, html_content);

    weather_field.appendChild(create_temperature_tooltip());
}

function create_temperature_tooltip() {
    const tooltip = document.createElement("div");

    tooltip.id = "temperature_tooltip";
    clear_HTML_content(tooltip);
    let html_content = "";
    if(!game_options.use_uncivilised_temperature_scale) {
        html_content = `${translationManager.getText(language, "ui lowest tolerable temperature")}: <strong>${Math.round(10*(lowest_tolerable_temperature - get_character_cold_tolerance()))/10}</strong>`;
        html_content += `<br>${translationManager.getText(language, "ui cold protection breakdown",
            {v1: `<strong>${lowest_tolerable_temperature}</strong>`,
             v2: `<strong>${Math.round(10*get_character_cold_tolerance())/10}</strong>`})}<br>`;
        html_content += create_stat_breakdown("cold_tolerance");
    } else {
        html_content = `${translationManager.getText(language, "ui lowest tolerable temperature")}: <strong>${Math.round(10*(celsius_to_fahrenheit(lowest_tolerable_temperature - get_character_cold_tolerance())))/10}</strong>`;
        html_content += `<br>${translationManager.getText(language, "ui cold protection breakdown",
            {v1: `<strong>${Math.round(10*celsius_to_fahrenheit(lowest_tolerable_temperature))/10}</strong>`,
             v2: `<strong>${Math.round(10*celsius_to_fahrenheit(get_character_cold_tolerance())-320)/10}</strong>`})}<br>`;
        html_content += create_stat_breakdown("cold_tolerance");
        html_content += `<br>${translationManager.getText(language, "ui scale conversion")}`;
    }

    insert_HTML(tooltip, html_content);

    return tooltip;
}

/** 
 * formats money to a nice string in form x..x G xx S xx C (gold/silver/copper) 
 * @param {Number} num value to be formatted
 * @param {Boolean} round if the value should be rounded a bit
 */
/*
    Moved here from misc.js, which is a leaf utility module: making it read the
    locale meant importing translation.js, and translation.js imports main.js,
    which imports display.js - so a module that only did arithmetic ended up
    pulling the whole game in, and the test harness that loads misc.js on its own
    broke on `document is not defined`.

    display.js is where the other formatter that composes player-facing words
    already lives, and it was the only caller of these two.
*/
/*
    Both time formatters built their units in English, so a Turkish tooltip read
    "Sonraki seviyeye kalan 25 minutes".

    Turkish does not pluralise a noun after a number - "2 saat", "25 dakika" - so the
    singular rows exist for English's sake and both languages read correctly.
*/
function format_reading_time(time) {
    if(time >= 120) {
        return translationManager.getText(language, "ui time hours", {v1: Math.floor(time/60)});
    } else if(time >= 60) {
        return translationManager.getText(language, "ui time hour", {v1: 1});
    } else {
        return translationManager.getText(language, "ui time minutes", {v1: Math.round(time)});
    }
}

function format_working_time(time) {
    let formatted = "";
    const hours = Math.floor(time/60);
    const minutes = time%60;

    if(hours > 0) {
        formatted += translationManager.getText(language,
            hours > 1 ? "ui time hours" : "ui time hour", {v1: hours});
    }
    if(minutes > 0) {
        if(hours > 0) {
            formatted += " ";
        }
        formatted += translationManager.getText(language,
            minutes > 1 ? "ui time minutes" : "ui time minute", {v1: minutes});
    }
    return formatted;
}

function format_money(num) {
    let value;
    const sign = num >= 0 ? '' : '-';
    num = Math.abs(num);
    
    if(num > 0) {
        value = (num%10 != 0 ? `${num%10}<span class="coin coin_wood">W</span>` : '');

        if(num > 9) {
            value = (Math.floor(num/10)%100 != 0?`${Math.floor(num/10)%100}<span class="coin coin_copper">C</span>${value?" ":""}` :'') + value;
            if(num > 999) {
                value = (Math.floor(num/1000)%100 != 0?`${Math.floor(num/1000)%100}<span class="coin coin_silver">S</span>${value?" ":""}` :'') + value;
                if(num > 99999) {
                    value = `${Math.floor(num/100000)}<span class="coin coin_gold">G</span>${value?" ":""}` + value;
                }
            
            }  
        }

        return sign + value;

    } else {
        //Was the literal 'nothing'. A return value rather than a DOM write, which is
        //why check_no_english_in_dom could not see it - it showed up as the trade
        //window's total price.
        return translationManager.getText(language, "ui money nothing");
    }
}

function update_displayed_character_xp(did_level = false) {
    /*
    character_xp_div
        character_xp_bar_max
            character_xp_bar_current
        charaxter_xp_value
    */
    character_xp_div.children[0].children[0].style.width = `${100*character.xp.current_xp/character.xp.xp_to_next_lvl}%`;
    character_xp_div.children[1].innerText = `${expo({number: character.xp.current_xp})} / ${expo({number: character.xp.xp_to_next_lvl})} ${translationManager.getText(language, "ui bar xp")}`;

    //Written every time rather than only on a level-up: the markup in index.html
    //carried a hard-coded "Lvl: 0" that stood until the first level, in English and
    //in different words from the ones this line uses.
    character_level_div.innerText = translationManager.getText(language, "ui level", {v1: character.xp.current_level});

    if(did_level) {
        update_displayed_health();
    }
}

function update_displayed_xp_bonuses() {
    update_xp_bar_tooltip();
}

function update_displayed_stamina_efficiency() {
    update_stamina_bar_tooltip();
}

/**
 * updates displayed reputation, only showing regions where value is > 0
 */
function update_displayed_reputation() {
    clear_HTML_content(data_entry_divs.reputation);

    Object.keys(character.reputation).forEach(reputation_region => {
        if(character.reputation[reputation_region] > 0) {
            const rep_div = document.createElement("div");
            const rep_name_span = document.createElement("span");
            const rep_value_span = document.createElement("span");
            rep_div.classList.add("data_entry");
            rep_name_span.classList.add("data_entry_name");
            rep_value_span.classList.add("data_entry_value");

            clear_HTML_content(rep_name_span);
            clear_HTML_content(rep_value_span);

            //The region is a registry key and has a "name <region>" row like every
            //other name in the game.
            insert_HTML(rep_name_span, translationManager.getText(language, "ui region reputation",
                {v1: translationManager.getDisplayName(language, reputation_region)}));
            insert_HTML(rep_value_span, character.reputation[reputation_region]);

            rep_div.appendChild(rep_name_span);
            rep_div.appendChild(rep_value_span);

            data_entry_divs.reputation.appendChild(rep_div);
        }
    });
}

//TODO: some display polishing + maybe move to a dedicated tab?
/**
 * Whether a journal tab is actually on screen.
 *
 * changeTab (index.html) writes `display` inline - "none" on every tab it hides, "flex" or
 * "block" on the one it shows - so this is a string read rather than a layout question.
 * offsetParent would be stricter and would force layout, which is the wrong trade for
 * something asked once per item picked up.
 *
 * The journal is tested too, because changeTab leaves the last tab's inline display set
 * when the whole journal is closed. One case still says yes with nothing visible - the
 * journal open behind another panel - and the cost of being wrong there is one rebuild
 * nobody sees.
 */
function is_journal_tab_open(tab_id) {
    const journal = document.getElementById("journal_div");
    if(!journal || journal.style.display === "none") {
        return false;
    }
    const tab = document.getElementById(tab_id);
    return Boolean(tab) && tab.style.display !== "none" && tab.style.display !== "";
}

/**
 * Redraws whichever journal panel is looking at something that just changed.
 *
 * Both panels are already rebuilt when their tab is opened - showDiscoveries and showLore
 * each call their update, which P-31's first reading missed. What neither had was a redraw
 * while ALREADY open: the player watches the panel, picks something up, and the count does
 * not move until they switch tabs or touch a filter. That is what was reported as "it
 * looks stateless".
 *
 * Guarded on being open, because the alternative is rebuilding a two-hundred entry list on
 * every pickup of a long idle session for a panel nobody is looking at.
 *
 * It lives here rather than in journal_panels.js because character.js is the caller and
 * character.js already imports from this file: journal_panels imports items, items imports
 * character, so a direct import there would close a new cycle. This file was already
 * importing both updaters and using neither, which was the other half of the finding.
 */
function refresh_open_journal_panels() {
    if(is_journal_tab_open("discoveries_box_div")) {
        update_displayed_discoveries();
    }
    if(is_journal_tab_open("lore_box_div")) {
        update_displayed_lore();
    }
}

/*
    The units of a spoken duration, in the order they are said. The row ids are the
    existing `ui time hour` / `ui time hours` family, which display.js already resolved for
    the two smallest units and which now covers all five.
*/
const duration_units = ["year", "month", "day", "hour", "minute"];

/**
 * A duration in words: "2 days 15 hours 22 minutes", in whatever language is loaded.
 *
 * This used to be format_time's `long_names` flag, which built the unit words into the
 * string as English literals - the only untranslated thing on a Turkish panel (P-29). The
 * arithmetic stays in game_time.js as split_duration; the wording is here because this is
 * where the locale is, and game_time.js is a leaf that cannot reach it without closing a
 * cycle through main.js.
 *
 * Singular and plural are separate rows because English needs them. Turkish does not
 * pluralise after a number - "2 gün", not "2 günler" - so both of its rows say the same
 * thing, which is the right answer rather than a duplicate.
 *
 * @param {Object} time {minutes, hours, days, months, years}
 * @returns {String}
 */
function format_duration_in_words(time) {
    const carried = split_duration({time});
    const said = [];

    for(const unit of duration_units) {
        const amount = carried[`${unit}s`];
        if(!(amount > 0)) {
            continue;
        }
        said.push(translationManager.getText(language,
            amount === 1 ? `ui time ${unit}` : `ui time ${unit}s`, {v1: amount}));
    }

    return said.join(" ");
}

function update_displayed_item_log() {

    set_HTML(data_entry_divs.item_log,`<div id='item_log_header'>${translationManager.getText(language, "ui item log")}</div>`)

    let html_content = "<table id='item_log_table'><tr><th width='100%'>" + translationManager.getText(language, "ui column item") + "</th><th>" + translationManager.getText(language, "ui column best") + "</th><th>" + translationManager.getText(language, "ui column total") + "</th></tr>";

    Object.values(item_log.items).forEach(item => {
        if(!item_templates[item.id] || item_templates[item.id].components) {
            return;
            /*
            skip stuff with components 
                bundling things with same name but different composition seems like a bad approach,
                and so does keeping each combination separate since it would potentially create way too many options
            */
        }

        const name = item_templates[item.id]?.getDisplayName() || item.id;

        html_content += `<tr><td>${name}</td ><td>`;

        if(item.quality_highest > 0 && item_templates[item.id].use_quality) {
            const color = rarity_colors[getItemRarity(item.quality_highest)];
            const outline_class = select_outline_class(color);
            //html_content += `${item.quality_lowest}-${item.quality_highest}%`;
            html_content += `<span class="${outline_class}" style="color: ${color}">${item.quality_highest}%</span>`; 
            //skip the lowest and show just the highest, seems better for display purposes?
        }

        html_content += `</td><td>${item.number < 1e6? item.number : expo({number: item.number, precision: 2, treshold: 6})}</td></tr>`;
        //html_content += `</td><td>${item.number}</td>${create_item_tooltip(item_templates[item.id]).outerHTML}</tr>`;
    });

    html_content += "</table>";

    insert_HTML(data_entry_divs.item_log, html_content);
}


/**
 * 
 * @param {String} dialogue_key 
 * @param {Object} textlines that still belong to the dialogue, but are to be displayed alone for some reason (i.e. because they are from dialogue branching)
 * @param {String} origin - the key of textline that created a dialogue branch, ignored if textlines is not passed
 */
function update_displayed_dialogue({dialogue_key, textlines, origin}) {
    const dialogue = dialogues[dialogue_key];
    
    clear_action_div();
    const dialogue_name_div = document.createElement("div");
    insert_HTML(dialogue_name_div, capitalize_first_letter(translationManager.getDisplayName(language, dialogues[dialogue_key].getName({is_mofu_mofu_enabled: global_flags.is_mofu_mofu_enabled})), true));
    dialogue_name_div.id = "dialogue_name_div";
    action_div.appendChild(dialogue_name_div);

    const dialogue_answer_div = document.createElement("div");
    dialogue_answer_div.id = "dialogue_answer_div";
    action_div.appendChild(dialogue_answer_div);
    if(!textlines) {
        Object.keys(dialogue.textlines).forEach(key => { //add buttons for textlines
            if(dialogue.textlines[key].is_unlocked && !dialogue.textlines[key].is_finished && !dialogue.textlines[key].is_branch_only && process_conditions(dialogue.textlines[key].display_conditions, character)) { 
                //do only if text_line is not unavailable and not a branch
                if(dialogue.textlines[key].required_flags) {
                    if(dialogue.textlines[key].required_flags.yes && !Array.isArray(dialogue.textlines[key].required_flags.yes) || dialogue.textlines[key].required_flags.no && !Array.isArray(dialogue.textlines[key].required_flags.no)) {
                        console.error(`Textline "${key}" in dialogue "${dialogue_key}" has required flag passed as a single value but it should be an array!`)
                    }
                    if(dialogue.textlines[key].required_flags.yes) {
                        for(let i = 0; i < dialogue.textlines[key].required_flags.yes.length; i++) {
                            
                            if(!global_flags[dialogue.textlines[key].required_flags.yes[i]]) {
                                return;
                            }
                        }
                    }
                    if(dialogue.textlines[key].required_flags.no) {
                        for(let i = 0; i < dialogue.textlines[key].required_flags.no.length; i++) {
                            if(global_flags[dialogue.textlines[key].required_flags.no[i]]) {
                                return;
                            }
                        }
                    }
                }
                
                const textline_div = document.createElement("div");
                insert_HTML(textline_div, `"${translationManager.getText(language, dialogue.textlines[key].name)}"`);
                textline_div.classList.add("dialogue_textline");
                textline_div.setAttribute("data-textline", key);
                textline_div.setAttribute("onclick", `start_textline(this.getAttribute('data-textline'))`);
                action_div.appendChild(textline_div);
            }
        });

        Object.keys(dialogue.actions).forEach(key => { //add buttons for actions
            if(dialogue.actions[key].can_be_displayed(character)) { 
                const dialogue_action_div = document.createElement("div");
                insert_HTML(dialogue_action_div, `${translationManager.getText(language,dialogue.actions[key].starting_text)}`);
                dialogue_action_div.classList.add("dialogue_textline");
                dialogue_action_div.setAttribute("data-location_action", key);
                dialogue_action_div.setAttribute("onclick", `start_game_action(this.getAttribute('data-location_action'), event)`);
                action_div.appendChild(dialogue_action_div);
            }
        });

        if(dialogue.trader) {
            const trade_div = document.createElement("div");
            insert_HTML(trade_div, `<i class="material-icons">storefront</i>  ` + traders[dialogue.trader].getTradeText());
            trade_div.classList.add("dialogue_trade")
            trade_div.setAttribute("data-trader", dialogue.trader);
            trade_div.setAttribute("onclick", "startTrade(this.getAttribute('data-trader'))")
            action_div.appendChild(trade_div);
        }

        const end_dialogue_div = document.createElement("div");

        insert_HTML(end_dialogue_div, "<i class='material-icons'>arrow_back</i> " + dialogue.getEndingText());
        end_dialogue_div.classList.add("end_dialogue_button");
        end_dialogue_div.setAttribute("onclick", "end_dialogue()");

        action_div.appendChild(end_dialogue_div);
    } else {
        //textlines are passed, use only them instead of all the dialogue has (minus branches)
        for(let i = 0; i < textlines.length; i++) {
            const key = textlines[i];
            //get key from passed array, read relevant entry from dialogue
            if(dialogue.textlines[key].is_unlocked && !dialogue.textlines[key].is_finished && process_conditions(dialogue.textlines[key].display_conditions, character)) { //do only if text_line is not unavailable
                if(dialogue.textlines[key].required_flags) {
                    if(dialogue.textlines[key].required_flags.yes && !Array.isArray(dialogue.textlines[key].required_flags.yes) || dialogue.textlines[key].required_flags.no && !Array.isArray(dialogue.textlines[key].required_flags.no)) {
                        console.error(`Textline "${key}" in dialogue "${dialogue_key}" has required flag passed as a single value but it should be an array!`)
                    }
                    if(dialogue.textlines[key].required_flags.yes) {
                        for(let i = 0; i < dialogue.textlines[key].required_flags.yes.length; i++) {
                            
                            if(!global_flags[dialogue.textlines[key].required_flags.yes[i]]) {
                                return;
                            }
                        }
                    }
                    if(dialogue.textlines[key].required_flags.no) {
                        for(let i = 0; i < dialogue.textlines[key].required_flags.no.length; i++) {
                            if(global_flags[dialogue.textlines[key].required_flags.no[i]]) {
                                return;
                            }
                        }
                    }
                }
                
                const textline_div = document.createElement("div");
                insert_HTML(textline_div, `"${translationManager.getText(language,dialogue.textlines[key].name)}"`);
                textline_div.classList.add("dialogue_textline");
                textline_div.setAttribute("data-textline", key);
                textline_div.setAttribute("onclick", `start_textline(this.getAttribute('data-textline'), ${origin})`); //additional param compared to when there's no textlines passed
                action_div.appendChild(textline_div);
            }
        }

        const backstep_dialogue_div = document.createElement("div");

        insert_HTML(backstep_dialogue_div, "<i class='material-icons'>arrow_back</i> " + default_dialogue_return_text());
        backstep_dialogue_div.classList.add("backstep_dialogue_button");
        backstep_dialogue_div.setAttribute("onclick", `start_dialogue("${dialogue_key}")`);

        action_div.appendChild(backstep_dialogue_div);
    }
}

/**
 * Writes the line the other party says.
 *
 * `text` is a text id, unless text_is_resolved says otherwise - which one caller needs,
 * because an action's result message is built and resolved by the action before it is
 * passed down the content stack. Resolving that again looked the finished sentence up
 * as an id and printed "text not found" where the answer belonged.
 */
function update_displayed_textline_answer({text, is_description, text_is_resolved = false}) {
    if(!text_is_resolved) {
        text = translationManager.getText(language, text);
    }
    
    if(is_description) {
        document.getElementById("dialogue_answer_div").innerText =  "*"+text+"*";
        document.getElementById("dialogue_answer_div").classList.remove("italic");
    } else {
        document.getElementById("dialogue_answer_div").innerText = text;
        document.getElementById("dialogue_answer_div").classList.add("italic");
    }
}



function start_activity_display(current_activity) {
    const base_activity = activities[current_activity.activity_name];
    const is_job = base_activity.type === "JOB";

    clear_action_div();
    const action_status_div = document.createElement("div");
    action_status_div.innerText = base_activity.getActionText();
    action_status_div.id = "action_status_div";

    const action_xp_div = document.createElement("div");
    action_xp_div.id = "action_xp_div";
    if (!base_activity.base_skills_names) {
        console.warn(`Activity "${current_activity.activity_name}" has no skills assigned!`);
    }

    const action_end_div = document.createElement("div");
    action_end_div.setAttribute("onclick", "end_activity()");
    action_end_div.id = "action_end_div";

    const action_end_text = document.createElement("div");
    //activity_name is the registry key; getName is the display name.
    action_end_text.innerText = translationManager.getText(language, "ui finish activity",
        {v1: base_activity.getName()});
    action_end_text.id = "action_end_text";

    action_end_div.appendChild(action_end_text);

    if(is_job) {
        const action_end_earnings = document.createElement("div");        
        action_end_earnings.innerText = translationManager.getText(language, "ui earnings", {v1: format_money(0)});
        action_end_earnings.id = "action_end_earnings";

        action_end_div.appendChild(action_end_earnings);
    }

    action_div.appendChild(action_status_div);
    action_div.appendChild(action_xp_div);

    if(current_activity.gathering_time_needed != 1) {
        const action_progress_bar_max = document.createElement("div");
        const action_progress_bar = document.createElement("div");
        action_progress_bar_max.appendChild(action_progress_bar);
        action_progress_bar.id = "gathering_progress_bar";
        action_progress_bar.style.width = 385*current_activity.gathering_time/current_activity.gathering_time_needed+"px";
        action_progress_bar_max.id = "gathering_progress_bar_max";
        action_div.appendChild(action_progress_bar_max);
        if (current_activity.gained_resources) {
            action_progress_bar_max.appendChild(create_gathering_tooltip(current_activity));
        }
    }
    
    action_div.appendChild(action_end_div);

    if(is_job) 
    {
        const time_info_div = document.createElement("div");
        time_info_div.id = "time_for_earnings_div";
        action_div.insertBefore(time_info_div, action_div.children[2]);
    }

    start_activity_animation();
    update_displayed_ongoing_activity(current_activity);
}

function update_displayed_ongoing_activity(current_activity) {
    const base_activity = activities[current_activity.activity_name];

    if(base_activity.type === "JOB") {
        set_HTML(document.getElementById("action_end_earnings"),
            translationManager.getText(language, "ui earnings", {v1: format_money(current_activity.earnings)}));
        const time_info_div = document.getElementById("time_for_earnings_div");
        
        if(!enough_time_for_earnings(current_activity)) {
            time_info_div.innerText = `${translationManager.getText(language, "ui not enough time left", {v1: character.name})}`;
        } else {
            time_info_div.innerText = `${translationManager.getText(language, "ui next earnings in")}: ${format_working_time(current_activity.gathering_time_needed - current_activity.gathering_time%current_activity.gathering_time_needed)}`;
        }
    }

    const action_xp_div = document.getElementById("action_xp_div");
    if(!action_xp_div) {
        console.warn(`Failed to find htmlElement with id "action_xp_div" for activity "${current_activity.activity_id}"`);
        return;
    }

    const is_obj = typeof current_activity.gained_skills === "object";

    const skill_names = is_obj ? Object.keys(current_activity.gained_skills) : base_activity.base_skills_names;
    const xp_rates = is_obj ? Object.values(current_activity.gained_skills) : current_activity.skill_xp_per_tick;
    for(let i = 0; i < skill_names.length; i++) {
        if(i > 0) {
            insert_HTML(action_xp_div, "<br><br>");
        } else {
            action_xp_div.innerText = "";
        }

        const skill = skills[skill_names[i]];
        const xp_rate = xp_rates[i];
        //Maxed-ness comes from the skill's own sentinel and its own level, never
        //from get_total_skill_level: that adds bonus_skill_levels and is not
        //clamped to max_level (character.js), so with an axe granting +3
        //Woodcutting the total reads 60 while the skill is really at 57. Both
        //comparison directions are wrong against it - an equality test failed for
        //a genuinely maxed skill and printed "NaN% [NaN / Infinity]" here, and a
        //>= test reports "Maxed out!" for every level inside the bonus window.
        //current_xp and current_level are set together when a skill maxes out, so
        //testing the skill itself is both correct and cheap.
        const is_maxed = skill.current_xp === "Max" || skill.current_level >= skill.max_level;

        //The skill name is a parameter rather than a suffix: Turkish puts it at the
        //front of the sentence, and a fragment ending in "to" cannot be translated.
        const xp_line_id = base_activity.type !== "GATHERING"
            ? "ui xp per game minute"
            : "ui xp per gathering cycle";
        action_xp_div.innerText += translationManager.getText(language, xp_line_id, {v1: xp_rate, v2: skill.name()});

        if (is_maxed) {
            action_xp_div.innerText += ` (${translationManager.getText(language, "ui maxed out")})`;
        } else {
            //Read as numbers and check them before use. is_maxed above covers the
            //normal max-level sentinels; these guards cover a skill whose stored
            //numbers were corrupted by a bad xp gain, so the panel degrades to "?"
            //instead of printing NaN at the player.
            const curr_xp = Math.floor(Number(skill.current_xp));
            const needed_xp = Math.ceil(Number(skill.xp_to_next_lvl));
            const has_usable_xp = Number.isFinite(curr_xp) && Number.isFinite(needed_xp) && needed_xp > 0;

            if(!has_usable_xp) {
                console.error(`Skill "${skill.skill_id}" has unusable xp values for display: `
                    + `current_xp=${skill.current_xp}, xp_to_next_lvl=${skill.xp_to_next_lvl}`);
            }

            const percent_xp = has_usable_xp ? `${Math.floor(10000 * curr_xp / needed_xp) / 100}%` : "?";
            const shown_curr_xp = has_usable_xp ? expo({number: curr_xp}) : "?";
            const shown_needed_xp = has_usable_xp ? expo({number: needed_xp}) : "?";

            action_xp_div.innerText += ` (${percent_xp}  [${shown_curr_xp} / ${shown_needed_xp}])`;

            //Must match what add_xp_to_skill will really grant, including the
            //global and parent-skill multipliers and the per-gain cap. Computing
            //it here by hand is how this line came to promise a level-up sooner
            //than the engine could deliver it.
            const xp_per_cycle = get_effective_skill_xp_gain({skill, xp_to_add: xp_rate});
            const cycle_length = current_activity.xp_given_per_working_period ? current_activity.gathering_time_needed : 1;
            const time_needed = has_usable_xp && xp_per_cycle > 0
                ? Math.ceil((needed_xp - curr_xp) / xp_per_cycle) * cycle_length
                : NaN;

            if(Number.isFinite(time_needed)) {
                insert_HTML(action_xp_div, `<br>${translationManager.getText(language, "ui next level in")} ${format_reading_time(time_needed)} (${format_duration_in_words({ minutes: time_needed / 60 })}${translationManager.getText(language, "ui realtime")})`);
            } else {
                insert_HTML(action_xp_div, `<br>${translationManager.getText(language, "ui next level unknown")}`);
            }
        }
    }

    if(current_activity.gathering_time_needed != 1) {
        document.getElementById("gathering_progress_bar").style.width = 385*current_activity.gathering_time/current_activity.gathering_time_needed+"px";
    }
}

function start_game_action_display(dialogue_key, action_key) {
    clear_action_div();

    let action;
    if(dialogue_key) {
        action = dialogues[dialogue_key].actions[action_key];
    } else {
        action = current_location.actions[action_key];
        
    }
    const action_status_div = document.createElement("div");
    action_status_div.innerText = action.getActionText();
    action_status_div.id = "action_status_div";
    action_div.appendChild(action_status_div);

    const action_progress_bar_max = document.createElement("div");
    const action_progress_bar = document.createElement("div");
    action_progress_bar_max.appendChild(action_progress_bar);
    action_progress_bar.id = "action_progress_bar";
    action_progress_bar.style.width = "0px";
    action_progress_bar_max.id = "action_progress_bar_max";
    action_div.appendChild(action_progress_bar_max);

    const action_end_div = document.createElement("div");
    action_end_div.setAttribute("onclick", "end_game_action()");
    action_end_div.id = "action_end_div";


    const action_end_text = document.createElement("div");
    action_end_text.innerText = translationManager.getText(language, "ui give up for now");
    action_end_text.id = "action_end_text";


    action_end_div.appendChild(action_end_text);
    action_div.appendChild(action_end_div);


    start_activity_animation();
}

function update_game_action_progress_bar(percent) {
    document.getElementById("action_progress_bar").style.width = 385*percent+"px";
}

function set_game_action_finish_text(text) {
    document.getElementById("action_status_div").innerText = text;
}

function update_game_action_finish_button() {
    document.getElementById("action_end_div").innerText = translationManager.getText(language, "ui finish");
}

/**
 * Pseudo-generalized function for updating displayed content
 * @param {*} param0 
 */
function fill_action_box({content_type, data}) {

    /*
        An action's result message arrives resolved; a dialogue's description and a
        textline's answer arrive as ids. Which is which has to travel with the text,
        because the one function that displays all three cannot tell them apart.
    */
    let text = '';
    let text_is_resolved = Boolean(data.text_is_resolved);
    if(data.special?.upstack_result_message) {
        text = data.special.upstack_result_message;
        text_is_resolved = true;
    }

    if(content_type === "dialogue") {
        update_displayed_dialogue({dialogue_key: data.dialogue_key});
        if(!text) {
            text = dialogues[data.dialogue_key].getDescription();
        }
        //if(!document.getElementById("dialogue_answer_div").innerText) { //probably pointless to check?
        update_displayed_textline_answer({text, is_description: true, text_is_resolved});
        //}
    } else if(content_type === "dialogue_answer") {
        update_displayed_dialogue({dialogue_key: data.dialogue_key});
        if(!text) {
            text = data.text;
        }
        update_displayed_textline_answer({text, text_is_resolved});
    } else if(content_type === "dialogue_branch") {
        update_displayed_dialogue({dialogue_key: data.dialogue_key, textlines: data.textlines});
        if(!text) {
            text = data.text;
        }
        update_displayed_textline_answer({text, text_is_resolved});
    } else if(content_type === "action") {
        start_game_action_display(data.dialogue_key, data.action_key);
    } else if(content_type === "activity") {
        start_activity_display(data.activity);
    } else {
        throw new Error(`Error on filling action box content: no such content type as "${content_type}"`);
    }

    //call stack addition in starting dialogues / textlines / actions / activities
    //pass proper data as param
    //do whatever is needed, like setting 'current_x' values
    //then call fill_action_box with proper data
}

function start_sleeping_display(){
    clear_action_div();

    const action_status_div = document.createElement("div");
    action_status_div.innerText = translationManager.getText(language, "ui sleeping");
    action_status_div.id = "action_status_div";

    const action_end_div = document.createElement("div");
    action_end_div.setAttribute("onclick", "end_sleeping()");
    action_end_div.id = "action_end_div";


    const action_end_text = document.createElement("div");
    action_end_text.innerText = translationManager.getText(language, "ui wake up");
    action_end_text.id = "action_end_text";

    
    action_end_div.appendChild(action_end_text);

    action_div.appendChild(action_status_div);
    action_div.appendChild(action_end_div);
    start_activity_animation();
}

function start_reading_display(title) {
    clear_action_div();

    const action_status_div = document.createElement("div");
    action_status_div.innerText = `${translationManager.getText(language, "ui reading the book", {v1: format_reading_time(item_templates[title].getRemainingTime())})}`;
    action_status_div.id = "action_status_div";

    const action_end_div = document.createElement("div");
    action_end_div.setAttribute("onclick", "end_reading()");
    action_end_div.id = "action_end_div";


    const action_end_text = document.createElement("div");
    action_end_text.innerText = translationManager.getText(language, "ui stop reading");
    action_end_text.id = "action_end_text";

    action_end_div.appendChild(action_end_text);

    action_div.appendChild(action_status_div);
    action_div.appendChild(action_end_div);
    start_activity_animation({book_title: title});
}



/**
 * 
 * @param {Skill} skill 
 * @param {Boolean} leveled_up 
 * @returns 
 */















































function update_enemy_attack_bar(enemy_id, num) {
    enemies_div.children[enemy_id].querySelector(".enemy_attack_bar").style.width = `${Math.min(num*100,100)}%`;
}

function do_enemy_onhit_animation(enemy_id) {
    const enemy_div = enemies_div.children[enemy_id];
    enemy_animations[enemy_id]?.cancel(); //almost certainly unnecessary
    enemy_animations[enemy_id] = enemy_div.animate(onhitAnimation, onhitAnimationTiming);
}

function remove_enemy_onhit_animation(enemy_id) {
    enemy_animations[enemy_id]?.cancel();
}

function do_enemy_onstart_animation(enemy_id) {
    const enemy_div = enemies_div.children[enemy_id];
    enemy_animations[enemy_id]?.cancel(); //almost certainly unnecessary
    enemy_animations[enemy_id] =  enemy_div.animate(onstartAnimation, onstartAnimationTiming);
}

function update_character_attack_bar(num) {
    character_attack_bar.style.width = `${Math.min(num*100,100)}%`;
}

/**
 * Adds quest to display
 * @param {String} quest_id 
 * @returns 
 */
function add_quest_to_display(quest_id) {
    if(quest_entry_divs[quest_id]) {
        console.warn(`Tried to add quest "${quest_id}" to display, but it's already there!`);
        return;
    } else if(quests[quest_id].is_hidden) {
        //do not display hidden quests (that's the whole point)
        console.warn(`Tried to add quest "${quest_id}" to display, but it's a hidden quest!`);
        return;
    }

    const quest = quests[quest_id];

    const quest_div = create_displayed_quest_content(quest_id);
    quest_entry_divs[quest_id] = quest_div;
    quest_list.appendChild(quest_div);

    if(quest.is_finished) {
        quest_div.classList.add("quest_finished");
    }

    sort_displayed_quests();
}

/**
 * updates name, description and task list
 * @param {*} quest_id 
 * @returns 
 */
function update_displayed_quest(quest_id) {
    
    if(quests[quest_id].is_hidden) {
        console.warn(`Tried to update display of quest "${quest_id}", but it's a hidden quest!`);
        console.trace()
        return;
    } else if(!quest_entry_divs[quest_id]) {
        console.warn(`Tried to update display of quest "${quest_id}", but it's not in display!`);
        return;
    }

    const quest = quests[quest_id];

    const quest_div = document.querySelector(`[data-quest_id="${quest_id}"]`);
    const quest_name_div = quest_div.querySelector(".quest_name_div");
    quest_name_div.innerText = quest.getQuestName();

    const quest_description_div = quest_div.querySelector(".quest_description_div");
    quest_description_div.innerText = quest.getQuestDescription() ?? "";

    if(quest.is_finished) {
        quest_div.classList.add("quest_finished");
    }
    
    update_displayed_quest_tasks(quest_id);

    sort_displayed_quests();
}

function sort_displayed_quests() {
        [...quest_list.children].sort((a,b) => {
            let quest_a = quests[a.getAttribute("data-quest_id")];
            let quest_b = quests[b.getAttribute("data-quest_id")];
            if(quest_a.is_finished && !quest_b.is_finished) {
                return 1;
            } else if(!quest_a.is_finished && quest_b.is_finished) {
                return -1;
            } else {
                if(quest_a.display_priority !== quest_b.display_priority) {
                    return quest_a.display_priority - quest_b.display_priority;
                } else {
                    //localeCompare, not ">": quest names are translated now, and
                    //a plain comparison sorts by code unit, which puts every
                    //Turkish letter carrying a diacritic after "z".
                    return quest_a.getQuestName().localeCompare(quest_b.getQuestName(), language_tags[language]);
                }
            }
    
        }).forEach(node=>quest_list.appendChild(node));
    
}

/**
 * Creates and returns a quest div to be used by other functions
 * @param {String} quest_id 
 * @returns {HTMLDivElement}
 */
function create_displayed_quest_content(quest_id) {

    const quest = quests[quest_id];

    const quest_div = document.createElement("div");
    quest_div.dataset.quest_id = quest_id;
    const quest_description_div = document.createElement("div");
    const quest_name_div = document.createElement("div");
    quest_div.classList.add("quest_div");
    //add an icon to show whether finished or active
    //add a dropdown icon

    quest_name_div.innerText = quest.getQuestName();
    quest_name_div.classList.add("quest_name_div");

    //Same guard as the sibling call above: a getQuestDescription that falls off
    //the end of its if-chain returns undefined, and innerText = undefined renders
    //the literal string "undefined".
    quest_description_div.innerText = quest.getQuestDescription() ?? "";
    quest_description_div.classList.add("quest_description_div");

    quest_div.appendChild(quest_name_div);
    quest_div.appendChild(quest_description_div);
    quest_div.appendChild(create_displayed_quest_tasks_content(quest_id));

    quest_div.addEventListener("click", (event) => {
        if(event.target.classList.contains("quest_name_div")) {
            quest_div.classList.toggle("quest_div_expanded");
        }
    });

    return quest_div;
}



/**
 * Where to go for a quest task, worked out from the task itself.
 *
 * A task says what to do and never where, which is what made four quests look impossible
 * at once. Every type resolves through an index that already exists, so a hint cannot
 * drift away from the content: move a creature and its hint moves with it.
 *
 * Returns an empty array for a type with nowhere to point - and for a task whose places
 * are all still undiscovered, which is a hint the player has not earned yet.
 */
function quest_task_places(task_type, target_id) {
    switch(task_type) {
        case "kill":
            return enemy_zones(target_id);
        case "kill_any":
            return zones_for_enemy_tag(target_id);
        case "clear":
        case "enter_location":
            return locations[target_id] ? [locations[target_id]] : [];
        case "reach_skill":
            return training_places()[target_id] || [];
        default:
            return [];
    }
}

/** One hint line: a label, the thing to do, and a way to get there. */
function create_hint_line(location, text) {
    return create_travel_line(location, text);
}

/**
 * A hint block, or nothing when there is nothing worth saying.
 *
 * @param {Array} lines already-built line elements
 */
function create_hint_block(lines) {
    if(lines.length === 0) {
        return null;
    }
    const hint = document.createElement("div");
    hint.classList.add("quest_hint_div");

    const label = document.createElement("div");
    label.classList.add("quest_hint_label");
    label.innerText = translationManager.getText(language, "ui quest hint");
    hint.appendChild(label);

    lines.forEach(line => hint.appendChild(line));
    return hint;
}

/**
 * "It is somewhere you have not been yet."
 *
 * Both hint builders end up here for the same reason: the task has somewhere to be and
 * the player has not found any of it. Naming the place would be a spoiler, and saying
 * nothing at all leaves the task standing with no line under it - which is the state a
 * player reported as "I know what to do and not how". Shared rather than written twice,
 * because it was written once and the other path went without it.
 */
function create_hint_elsewhere_line() {
    const elsewhere = document.createElement("div");
    elsewhere.classList.add("discovery_source_text");
    elsewhere.innerText = translationManager.getText(language, "ui quest hint elsewhere");
    return elsewhere;
}

/**
 * Where to go for a counted task target - kill this, clear that, reach this skill.
 */
function create_quest_hint(task_type, target_id) {
    const places = quest_task_places(task_type, target_id);
    const lines = places
        .filter(place => place.is_unlocked)
        .sort((first, second) => compare_display_names(first.getName(), second.getName()))
        .map(place => create_hint_line(place, place.getName()));

    /*
        The zones exist and none of them is on the player's map yet. No visible quest
        counts anything today - the five live task_conditions all belong to hidden
        quests - so this branch cannot be reached in play right now. It is here because
        the moment a visible quest counts a kill, this path would show a 0/10 with
        nothing under it, and the fix the other path already has would have to be found
        a second time.
    */
    if(lines.length === 0 && places.length > 0) {
        lines.push(create_hint_elsewhere_line());
    }

    return create_hint_block(lines);
}

/**
 * What advances a task that counts nothing - which is 68 of the 73.
 *
 * Those tasks carry no condition at all: they move when a dialogue line is read or an
 * action is finished somewhere. Without this the journal shows a task with no numbers and
 * no clue, which is what made four quests look impossible at once.
 */
/**
 * One line for one step: talk to somebody, do something, clear somewhere.
 *
 * Shared by the steps that advance a task directly and by the ones found further back
 * up an unlock chain, so both read the same way.
 */
function create_quest_step_line(step) {
    const location = locations[step.location_key];
    //Nothing is pointed at until the place is known: a hint into an undiscovered
    //room is a spoiler, not a hint.
    if(!location?.is_unlocked) {
        return null;
    }
    if(step.kind === "talk") {
        const who = capitalize_first_letter(translationManager.getDisplayName(language,
            dialogues[step.via].getName({is_mofu_mofu_enabled: global_flags.is_mofu_mofu_enabled})), true);
        return create_hint_line(location,
            translationManager.getText(language, "ui quest hint talk",
                {v1: who, v2: location.getName()}));
    }
    if(step.kind === "clear") {
        //A zone is its own place, so naming it twice would say nothing twice.
        return create_hint_line(location,
            translationManager.getText(language, "ui quest hint clear",
                {v1: location.getName()}));
    }
    const action = location.actions?.[step.via];
    if(action?.is_finished) {
        return null;
    }
    /*
        A locked action keeps its own wording to itself, but the player still needs
        somewhere to go. What opens it is in the content - rewards say which actions
        and lines they unlock - so the chain is walked backwards to the first link
        that is reachable now.

        "build a hearth" is opened by the elder's hollow line, which is opened by
        cutting a flue on the mountain: the answer to a question about the village
        is a mountain, three links away. Falling back to the place only when the
        whole chain is still closed.
    */
    if(!action || !action.is_unlocked) {
        const opener = first_available_opener(`action:${step.location_key}#${step.via}`);
        if(opener) {
            return create_quest_step_line(opener);
        }
        return create_hint_line(location,
            translationManager.getText(language, "ui quest hint place",
                {v1: location.getName()}));
    }
    return create_hint_line(location,
        translationManager.getText(language, "ui quest hint action",
            {v1: action.getActionName(), v2: location.getName()}));
}

function create_quest_step_hint(quest_id, task_index) {
    const steps = quest_task_advancers(quest_id, task_index);
    const lines = steps.map(create_quest_step_line).filter(Boolean);

    /*
        Every step is somewhere the player has not found yet. Naming the place would be a
        spoiler, but saying nothing at all was worse: the task stood there with no line
        under it and no way to tell whether it was waiting on a place, on an unlock, or on
        nothing. This names nothing and still answers the question - it is elsewhere, go
        and look.
    */
    if(lines.length === 0 && steps.length > 0) {
        lines.push(create_hint_elsewhere_line());
    }

    return create_hint_block(lines);
}
function create_displayed_quest_tasks_content(quest_id) {
    const quest = quests[quest_id];
    const quest_tasks_div = document.createElement("div");
    quest_tasks_div.classList.add("quest_task_list_div");
    //put task description and tasks into it
    //set color based on completion status

    let unfinished_index = quest.quest_tasks.findIndex(x => !x.is_finished);
    unfinished_index = unfinished_index==-1?quest.quest_tasks.length:unfinished_index;

    for(let i = 0; i < unfinished_index; i++) {
        if(!quest.quest_tasks[i].is_hidden) {
            quest_tasks_div.appendChild(create_displayed_quest_task(quest_id, i));
        }
    }

    if(unfinished_index !== quest.quest_tasks.length) {
        //there should still be an unfinished task left, add it do display as well
        if(!quest.quest_tasks[unfinished_index].is_hidden) {
            quest_tasks_div.appendChild(create_displayed_quest_task(quest_id, unfinished_index));
        } else {
            /*
                A hidden task hides its own wording, not the whole quest. This branch used
                to append nothing at all, so a quest sitting on a hidden step showed its
                name and not one line under it - three at once in the journal, looking
                stalled, with no way to tell what was being waited on. A task only counts
                when its index equals the number already finished, so the player cannot
                skip past it either.

                The hint says where to go without saying what the step is, which is the
                distinction the hidden flag was drawn for.
            */
            const hint = create_quest_step_hint(quest_id, unfinished_index);
            if(hint) {
                quest_tasks_div.appendChild(hint);
            }
        }
    }

    return quest_tasks_div;
}

function create_displayed_quest_task(quest_id, task_index) {
    const task = quests[quest_id].quest_tasks[task_index];
    const task_div = document.createElement("div");
    task_div.classList.add("quest_task_div");

    const task_status_icon_span = document.createElement("span");
    task_status_icon_span.classList.add("task_status_icon");
    let icon_html;
    if(task.is_finished) {
        task_div.classList.add("task_finished");
        icon_html = '<i class="material-icons">check_box</i>';
    } else {
        icon_html = '<i class="material-icons">check_box_outline_blank</i>';
    }

    insert_HTML(task_status_icon_span, icon_html);

    const task_desc_div = document.createElement("div");
    task_desc_div.classList.add("task_description_div");
    //task_description holds a text id now, not a sentence. A task with no
    //description - a hidden one - has an empty id and renders as nothing.
    task_desc_div.innerText = task.task_description
        ? translationManager.getText(language, task.task_description)
        : "";

    const task_conditions_div = document.createElement("div");
    /*
        A task that is about gathering shows how far along it is. The requirement is read
        off the action that consumes the materials rather than copied into the task, so
        there is one place to change a number.

        Which action that is comes from the advancer index - the same one the hints read -
        rather than from a field somebody has to remember to fill in. All three tasks in
        the game whose advancing action consumes items had been left without one, so all
        three counted nothing. `items_from` survives as an override, for a task that
        counts something its advancer does not.
    */
    const counts_from = task.items_from ?? quest_task_advancers(quest_id, task_index)
        .filter(step => step.kind === "action")
        .map(step => ({location: step.location_key, action: step.via}))
        .find(candidate => Object.keys(
            locations[candidate.location]?.actions?.[candidate.action]?.required?.items_by_id ?? {},
        ).length > 0);

    if(counts_from && !task.is_finished) {
        const source = locations[counts_from.location]?.actions?.[counts_from.action];
        const needed = source?.required?.items_by_id;
        if(!needed) {
            console.error(`Quest task points at the action "${counts_from.action}" in`
                + ` "${counts_from.location}" for its item counts, but that action has none.`);
        } else {
            for(const item_id of Object.keys(needed)) {
                const template = item_templates[item_id];
                if(!template) {
                    console.error(`Quest task counts "${item_id}", which is not an item.`);
                    continue;
                }
                const have = character.inventory[template.getInventoryKey()]?.count ?? 0;
                const want = needed[item_id].count;

                const line = document.createElement("div");
                line.classList.add("task_item_count");
                //Enough to redraw this line on its own when the inventory changes,
                //without walking back to the quest it belongs to.
                line.dataset.item_id = item_id;
                line.dataset.item_needed = want;
                task_conditions_div.appendChild(line);
                fill_quest_item_count(line);
            }
        }
    }

    /*
    task_group (any/all): {
        task_type (kill/kill_any/clear/something_else?): { <- quest_event_type
            task_target_id (some related id): { <- quest_event_target
                target: Number,
                current: Number,
                requirements: [], //additional triggers needed, like "weapon_unarmed"
    */
    //goes through the properties and sets up display
    //
    //All three levels were printed as their registry keys: the group as "any:" or
    //"all:", the type through task_type_names in misc.js which only ever held three
    //English words, and the target as the id of the enemy group, location or skill.
    //Whether the group label is written at all is decided after the count is known,
    //rather than by searching the finished text for "any:" and deleting it.
    let total_tasks = 0;
    const group_divs = [];
    Object.keys(task.task_condition).forEach(task_group => {
        if(Object.keys(task.task_condition[task_group]).length) {
            const task_condition_div = document.createElement("div");
            task_condition_div.classList.add("task_condition_div");
            group_divs.push({div: task_condition_div, group: task_group});
            Object.keys(task.task_condition[task_group]).forEach(task_type => {
                const task_type_div = document.createElement("div");
                task_type_div.classList.add("task_type_div");
                task_type_div.innerText += translationManager.getText(language, `ui task type ${task_type}`) + ":";
                Object.keys(task.task_condition[task_group][task_type]).forEach(task_target_id => {
                    const task_target_div = document.createElement("div");
                    task_target_div.classList.add("task_target_div");
                    task_target_div.innerText += quest_target_label(task_type, task_target_id) + ": " + task.task_condition[task_group][task_type][task_target_id].current +"/"+task.task_condition[task_group][task_type][task_target_id].target;
                    task_type_div.appendChild(task_target_div);

                    //Where to go for it, worked out from the task rather than written.
                    const hint = create_quest_hint(task_type, task_target_id);
                    if(hint) {
                        task_type_div.appendChild(hint);
                    }

                    total_tasks++;
                });
                task_condition_div.appendChild(task_type_div);
            });

            task_conditions_div.appendChild(task_condition_div);
        }
    });
    
    //A single task needs no "any"/"all" label - there is nothing to choose between.
    if(total_tasks > 1) {
        for(const {div, group} of group_divs) {
            div.prepend(translationManager.getText(language, `ui task group ${group}`) + ":");
        }
    }

    task_div.appendChild(task_status_icon_span);
    task_div.appendChild(task_desc_div);
    task_div.appendChild(task_conditions_div);

    //68 of the 73 tasks count nothing at all - they move when something is said or
    //done somewhere. Those are the ones a player gets stuck on with no clue at all.
    if(total_tasks === 0 && !task.is_finished) {
        const step_hint = create_quest_step_hint(quest_id, task_index);
        if(step_hint) {
            task_div.appendChild(step_hint);
        }
    }
    return task_div;
}

/**
 * Writes one gathering counter from the inventory as it is right now.
 *
 * Split out because the line has to be redrawn whenever the inventory moves, not only
 * when the quest does: the journal showed 92/100 while the player was carrying 133,
 * because the task div is only rebuilt on quest progress.
 */
function fill_quest_item_count(line) {
    const template = item_templates[line.dataset.item_id];
    if(!template) {
        return;
    }
    const needed = Number(line.dataset.item_needed);
    const have = character.inventory[template.getInventoryKey()]?.count ?? 0;

    line.classList.toggle("task_item_done", have >= needed);
    line.innerText = translationManager.getText(language, "ui task item progress",
        {v1: template.getDisplayName(), v2: Math.min(have, needed), v3: needed});
}

/** Every visible gathering counter, after the inventory has changed. */
function update_displayed_quest_item_counts() {
    for(const line of document.querySelectorAll(".task_item_count")) {
        fill_quest_item_count(line);
    }
}
function update_displayed_quest_task(quest_id, task_index) {
    const quest = quests[quest_id];
    if(quest.quest_tasks[task_index].is_hidden || quest.is_hidden) {
        return;
    }

    const quest_div = document.querySelector(`[data-quest_id="${quest_id}"]`);
    const quest_task_list_div = quest_div.querySelector(".quest_task_list_div");
    const task_div = quest_task_list_div.children.item(task_index) || quest_task_list_div.children.item(task_index-1);

    task_div.replaceWith(create_displayed_quest_task(quest_id, task_index));
}

function update_displayed_quest_tasks(quest_id) {
    const quest_div = document.querySelector(`[data-quest_id="${quest_id}"]`);
    const tasks_div = quest_div.querySelector(".quest_task_list_div");
    tasks_div.replaceWith(create_displayed_quest_tasks_content(quest_id)); //replace task list
    tasks_div.remove();
    //might need to go deeper with tasks if their content becomes foldable
}

function change_completed_quest_visibility() {
    if(quest_hiding_button.checked) {
        document.documentElement.style.setProperty("--completed_quest_display", "none");
    } else {
        document.documentElement.style.setProperty("--completed_quest_display", "block");
    }
}

/**
 * Repaints every panel that holds translated text, for a language switch.
 *
 * translateUI covers everything carrying a data-translation attribute. This covers
 * everything else, and there is a lot of it: the location's name and description,
 * its travel and dialogue choices, the inventory, the purse, the equipment, the
 * stat readouts, the active effects, the skill bars, the quest list and the date.
 *
 * Without this a switch left the interface visibly half translated. The tabs and
 * stat labels turned over because they are markup; the room the player was
 * standing in did not, and stayed English until they walked somewhere else. Q-6 in
 * PROPOSALS.md guessed that "everything else changes over as the player moves
 * around" would be good enough. It is not, and a screenshot settled it.
 *
 * Everything called here has to be safe to call at any moment, since a player can
 * switch language from anywhere. The location branch mirrors main.js: a combat zone
 * is the one with no connected_locations.
 *
 * @param {Object} params
 * @param {Object} params.location the location the player is currently in
 * @param {String[]} params.active_quest_ids ids of quests currently on the panel
 */
function retranslate_interface({location, active_quest_ids = []} = {}) {
    update_displayed_time();
    update_displayed_money();
    update_displayed_stats();
    update_displayed_equipment();
    update_displayed_effects();
    update_displayed_reputation();
    update_displayed_temperature();

    //The three bars each carry a word: "hp", "stamina", "xp".
    update_displayed_health();
    update_displayed_stamina();
    update_displayed_character_xp(true);

    //rebuild: the rows carry item names and [use]/[equip] buttons, which the
    //ordinary update path does not touch.
    //skip_sorting: the player's chosen order is not a translation and should not be
    //disturbed by changing language.
    update_displayed_character_inventory({skip_sorting: true, rebuild: true});

    for(const skill_id of Object.keys(skills)) {
        if(skills[skill_id].is_unlocked) {
            update_displayed_skill_bar(skills[skill_id], false);
        }
    }

    if(location) {
        if("connected_locations" in location) {
            update_displayed_normal_location(location);
        } else {
            update_displayed_combat_location(location);
        }
        update_displayed_location_types(location);
    }

    for(const quest_id of active_quest_ids) {
        if(quests[quest_id]) {
            update_displayed_quest(quest_id);
        }
    }
}

/**
 * Fills the character bio panel.
 *
 * Returns early while the hero does not exist yet. On a new game the creation
 * panel is up and character.personal.race is unset, so playable_races[undefined]
 * is undefined and reading .name off it throws - which is exactly what happened
 * when a player switched language on the creation screen, because
 * option_language calls this. The throw aborted the rest of that handler, so the
 * creation panel never got repainted either: the reported "race tooltips stay
 * English" had two causes, and this was the one that hid the other.
 */
function fill_character_bio() {
    if(!playable_races[character.personal.race]) {
        return;
    }
    const age_div = document.getElementById("character_age_div");
    age_div.innerText = translationManager.getText(language, "age") + ": "+ translationManager.getText(language, character.personal.age);

    const height_div = document.getElementById("character_height_div");
    height_div.innerText = translationManager.getText(language, "height") + ": "+ translationManager.getText(language, character.personal.height);

    if(config.use_height_bonuses && Object.keys(height_stats[character.personal.height]).length > 0) {
        height_div.appendChild(create_height_tooltip(character.personal.height, "character_height_tooltip"));
    }

    const race_div = document.getElementById("character_race_div");
    race_div.innerText = translationManager.getText(language, "race") + ": "+ translationManager.getText(language, playable_races[character.personal.race].name);

    race_div.appendChild(create_race_tooltip(playable_races[character.personal.race], "character_race_tooltip"));
}

function create_race_tooltip(race, css_class) {
    const tooltip = document.createElement("div");
    tooltip.classList.add(css_class);

    let tooltip_content = "";

    tooltip_content += translationManager.getText(language, race.description);
    if(race.gameplay_description) {
        tooltip_content += "\n\n" + translationManager.getText(language, race.gameplay_description);
    }

    if(config.use_racial_bonuses) {
        if(Object.keys(race.stats).length > 0) {
            tooltip_content += `\n`;
        }

        Object.keys(race.stats).forEach(effect_key => {
            if(race.stats[effect_key].multiplier != null) {
                tooltip_content +=
            `\n${capitalize_first_letter(translationManager.getText(language, effect_key+" long"), true)}: x${race.stats[effect_key].multiplier}`;
            }
        });
    }

    /*
    if(Object.keys(race.stats).length !== 0 && Object.keys(race.xp_multipliers).length !== 0) {
        tooltip_content += "\n";
    }

    Object.keys(race.xp_multipliers).forEach(effect_key => {
        if(race.xp_multipliers[effect_key] != null) {
            tooltip_content +=
        `\n${capitalize_first_letter(translationManager.getText(language, effect_key), true)}: x${race.xp_multipliers[effect_key]}`;
        }
    });
    */
    tooltip.innerText = tooltip_content;
            

    return tooltip;
}

function create_height_tooltip(height_key, css_class) {
    const stats = height_stats[height_key];
    const tooltip = document.createElement("div");
    tooltip.classList.add(css_class);

    let tooltip_content = "";
    Object.keys(stats).forEach(effect_key => {
        if(stats[effect_key].multiplier != null) {
            tooltip_content +=
        `${capitalize_first_letter(translationManager.getText(language, effect_key+" long"), true)}: x${stats[effect_key].multiplier}\n`;
        }
    });
    
    tooltip.innerText = tooltip_content;

    return tooltip;
}

function start_rain_animation() {
    start_background_animation("rain");
}

function start_snow_animation() {
    start_background_animation("snow");
}


function start_stars_animation() {
    start_background_animation("stars");
}

function start_background_animation(type) {
    
    
    stop_background_animation();

    let particle_class;
    switch(type) {
        case "snow":
            particle_class = SnowParticle;
            canvas = document.getElementById("foreground_canvas");
            break;
        case "rain":
            particle_class = RainParticle;
            canvas = document.getElementById("foreground_canvas");
            break;
        case "stars":
            particle_class = PointyStarParticle;
            canvas = document.getElementById("background_canvas");
            break;
        default:
            break;
    }

    
    context = canvas.getContext("2d");
    canvas.width = context.canvas.clientWidth;
    
    canvas.height = context.canvas.clientHeight;
    background_animation_particles = [];
    for(let i = 0; i < Math.ceil((canvas.width*canvas.height)/5000); i++) {
        background_animation_particles.push(new particle_class({canvas}));
    }

    do_background_animation();
}

function stop_background_animation() {
    canvas = canvas || document.getElementById("foreground_canvas");
    context = context || canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    cancelAnimationFrame(background_animation);
    clearTimeout(background_animation_timeout);
}

function do_background_animation() {
    background_animation_timeout = setTimeout(() => {
        background_animation = requestAnimationFrame(do_background_animation);
        context.clearRect(0,0,canvas.width, canvas.height);
        for(let i = 0; i < background_animation_particles.length; i++) {
            background_animation_particles[i].draw();
        }
    }, 1000/60);
}

function set_light_based_background_color(is_sky_visible) {
    let background_color_value;
    let background_visibility;
    if(is_sky_visible) {
        background_visibility = (get_current_light_level()-40)/60;
        if(is_raining()) {
            background_color_value = window.getComputedStyle(document.body).getPropertyValue("--rain_background_color");
        } else {
            background_color_value = window.getComputedStyle(document.body).getPropertyValue("--default_background_color");
        }
    } else {
        background_visibility = get_current_light_level_for_roofed_location()/100;
        background_color_value = window.getComputedStyle(document.body).getPropertyValue("--indoor_background_color");
    }

    document.documentElement.style.setProperty('--background_color', background_color_value);
    document.documentElement.style.setProperty('--background_opacity', background_visibility);
}

function update_export_button_tooltip(time_passed, time_until_reward) {
    if(time_passed > time_until_reward) {
        //just say reward is available
        export_button_tooltip.innerText = translationManager.getText(language, "ui reward available");
    } else {
        //calculate irl time needed until reward
        let time_needed = time_until_reward - time_passed;
        time_needed /= 1000;
        const seconds = Math.floor(time_needed%60);
        time_needed = Math.floor(time_needed/60);
        const minutes = Math.floor(time_needed%60);
        time_needed = Math.floor(time_needed/60);
        const hours = time_needed;

        export_button_tooltip.innerText = `${translationManager.getText(language, "ui reward available in", {v1: hours, v2: minutes, v3: seconds})}`;
    }
}

function update_backup_load_button(date_string){
    if(date_string) {
        backup_load_button.innerText = `${translationManager.getText(language, "ui load backup autosave", {v1: date_string.replaceAll("_",":")})}`;
        backup_load_button.style["background-image"] = `var(--options_gradient);`;
        backup_load_button.style["background-color"] = "transparent";
        backup_load_button.style.color = "white";
        backup_load_button.style.cursor = "pointer";
    } else {
        backup_load_button.innerText = translationManager.getText(language, "ui no backup autosave");
        backup_load_button.style["background-image"] = "none";
        backup_load_button.style["background-color"] = "#181818";
        backup_load_button.style.color = "gray";
        backup_load_button.style.cursor = "not-allowed";
    }
}

function update_other_save_load_button(date_string, is_dev) {
    if(is_dev) {
        other_save_load_button.innerText = translationManager.getText(language, "ui import save main");
    } else {
        other_save_load_button.innerText = translationManager.getText(language, "ui import save dev");
    }
    if(date_string !== undefined) {
        other_save_load_button.style["background-image"] = `var(--options_gradient);`;
        other_save_load_button.style["background-color"] = "transparent";
        other_save_load_button.style.color = "white";
        other_save_load_button.style.cursor = "pointer";
        if(date_string) {
            other_save_load_button.innerText += ` [${date_string.replaceAll("_",":")}]`;
        } else {
            other_save_load_button.innerText += ` [${translationManager.getText(language, "ui unknown date")}]`;
        }
    } else {
        other_save_load_button.style["background-image"] = "none";
        other_save_load_button.style["background-color"] = "#181818";
        other_save_load_button.style.color = "gray";
        other_save_load_button.style.cursor = "not-allowed";
    }
    
}

function hide_loading_screen() {
    document.getElementById("loading_screen").style.visibility = "hidden";
}

function set_loading_screen_versions(save_version) {
    const loading_screen = document.getElementById("loading_screen_version_info");
    const current_version = get_game_version();
    let html_content = `${translationManager.getText(language, "ui save game version")}: ${save_version || translationManager.getText(language, "ui version none")}<br> ${translationManager.getText(language, "ui current game version")}: ${current_version}<br>`;
    if(save_version) {
      if(save_version === current_version) {
        html_content += "<div class='top_border'>" + translationManager.getText(language, "ui no changes since") + "</div>"
        } else if(is_a_older_than_b(save_version, current_version)) {
            html_content += "<div class='top_border'>" + translationManager.getText(language, "ui game updated") + "</div>";
        } else {
            html_content += "<div class='top_border'>" + translationManager.getText(language, "ui save from newer version") + "</div>";
        }
    }

    set_HTML(loading_screen, html_content);
}

function set_loading_screen_progress(message) {
    loading_progress_div.innerText = message;
}

function hide_loading_text() {
    document.getElementById("loading_screen_loading_text").classList.add("fade");
}

function set_loading_screen_errors_warning() {
    const loading_screen_errors_field = document.getElementById("loading_screen_status");
    loading_screen_errors_field.classList.remove('loading_screen_status_warnings');
    loading_screen_errors_field.classList.add('loading_screen_status_errors');

    loading_screen_errors_field.innerText = translationManager.getText(language, "ui loading error");
}

function set_loading_screen_warnings_warning() {
    const loading_screen_errors_field = document.getElementById("loading_screen_status");
    loading_screen_errors_field.classList.add('loading_screen_status_warnings');
    loading_screen_errors_field.innerText = translationManager.getText(language, "ui loading potential issue");
}

function show_play_button() {
    const play_button = document.getElementById("loading_screen_play_button");
    play_button.classList.remove("none_display");
    play_button.classList.add("fade_in");
}

function set_play_button_text(text) {
    const play_button = document.getElementById("loading_screen_play_button");
    play_button.innerText = text;
}



export {
    update_displayed_quest_item_counts,
    trade_div,
    action_div,
    fill_action_box,
    start_activity_animation, end_activity_animation,
    update_displayed_money,
    log_message,
    clear_action_div,
    update_displayed_enemies, update_displayed_health_of_enemies, update_displayed_normal_location, update_displayed_combat_location,
    log_loot,
    update_displayed_equipment, update_displayed_health, update_displayed_stamina, update_displayed_stats, update_displayed_effects, update_displayed_effect_durations,
    capitalize_first_letter,
    format_money,
    get_message_log_history, restore_message_log,
    update_displayed_time, update_displayed_temperature,
    update_displayed_character_xp,
    update_displayed_dialogue, update_displayed_textline_answer,
    start_activity_display, start_sleeping_display,
    update_displayed_ongoing_activity,
    update_character_attack_bar,
    clear_message_log,
    update_enemy_attack_bar, 
    do_enemy_onhit_animation, remove_enemy_onhit_animation, do_enemy_onstart_animation,
    remove_fast_travel_choice,
    start_reading_display,
    update_displayed_xp_bonuses, update_displayed_stamina_efficiency, 
    update_gathering_tooltip,
    update_displayed_location_types,
    uncapitalize_first_letter,
    update_backup_load_button, update_other_save_load_button,
    start_game_action_display,
    set_game_action_finish_text,
    update_game_action_progress_bar, update_game_action_finish_button,
    update_displayed_storage, exit_displayed_storage, update_location_icon, update_location_kill_count,
    add_quest_to_display, update_displayed_quest, update_displayed_quest_task, change_completed_quest_visibility,
    start_rain_animation, start_snow_animation, start_stars_animation, stop_background_animation,
    update_displayed_total_price,
    update_export_button_tooltip,
    update_displayed_reputation,
    hide_loading_screen, set_loading_screen_versions, set_loading_screen_errors_warning, 
    set_loading_screen_progress, hide_loading_text, show_play_button, set_loading_screen_warnings_warning, set_play_button_text,
    create_floating_effect,
    update_fav_display,
    refresh_open_journal_panels,
    update_displayed_item_log,
    set_HTML,
    set_light_based_background_color,
    unassign_dynamic_loot_message,
    fill_character_bio, retranslate_interface, create_race_tooltip, create_height_tooltip,
    insert_HTML
}