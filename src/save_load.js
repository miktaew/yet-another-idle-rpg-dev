"use strict";

/**
 * Saving and loading: the save file, local storage, backups and the other release.
 *
 * 1871 lines, 29% of what main.js used to be. What kept them there was never size - it
 * was that an imported binding is read-only and these functions assigned to eleven
 * module-scope bindings, which no module but their own can do. game_state.js took eight
 * of those, two were dead writes that change_stance already made, and `language` now
 * goes through a setter. They write nothing now, so they can live anywhere.
 *
 * The import list below is generated from what the code actually reaches for, not
 * written by hand, so it cannot be short by omission.
 */

import { ActiveEffect, effect_templates } from "./active_effects.js";
import { activities } from "./activities.js";
import { add_to_character_inventory, character, equip_item, update_character_stats } from "./character.js";
import { stances } from "./combat_stances.js";
import { config } from "./config.js";
import { recipes } from "./crafting_recipes.js";
import { dialogues } from "./data/dialogues.js";
import { favourite_locations, locations } from "./data/locations.js";
import { skills } from "./data/skills.js";
import { player_storage } from "./data/storage.js";
import {
         change_completed_quest_visibility,
         format_money,
         get_message_log_history,
         log_message,
         restore_message_log,
         set_loading_screen_errors_warning,
         set_loading_screen_progress,
         set_loading_screen_versions,
         set_loading_screen_warnings_warning,
         update_displayed_character_inventory,
         update_displayed_effects,
         update_displayed_health,
         update_displayed_item_log,
         update_displayed_money,
         update_displayed_quest,
         update_displayed_reputation,
         update_displayed_time,
        } from "./display.js";
import { enemy_killcount } from "./enemies.js";
import { game_state } from "./game_state.js";
import { current_game_time } from "./game_time.js";
import { game_version } from "./game_version.js";
import { book_stats, getArmorSlot, getItem, item_log, item_templates } from "./items.js";
import { active_effects, add_xp_to_character, add_xp_to_skill, backup_key, change_location, change_stance, cold_status_counters, current_activity, current_location, current_stance, dev_backup_key, dev_save_key, fav_stance, faved_stances, favourite_consumables, favourite_items, game_options, get_date, give_export_reward, global_flags, is_on_dev, is_reading, is_sleeping, language, message_log_filters, name_field, option_bed_return, option_change_background_color, option_combat_autoswitch, option_do_background_animations, option_do_dynamic_loot_message, option_do_enemy_onhit_animations, option_expo_threshold, option_hide_max_level_skills, option_mofu_mofu_mode, option_remember_filters, option_skip_play_button, option_uniform_textsize, option_use_text_outlines_for_bars, option_use_text_outlines_for_tooltips, option_use_uncivilised_temperature_scale, process_rewards, save_key, selected_stance, set_language, start_activity, start_reading, start_sleeping, time_field, unlocked_beds } from "./main.js";
import { capped_at, loot_sold_count, market_region_mapping, set_loot_sold_count } from "./market_saturation.js";
import { compare_game_version, get_component_name, get_item_mapping, is_JSON, is_a_older_than_b } from "./misc.js";
import { active_quests, questManager, quests } from "./quests.js";
import { run_stats } from "./run_stats.js";
import { add_to_trader_inventory } from "./trade.js";
import { traders } from "./traders.js";
import { translationManager } from "./translation.js";
import { create_displayed_crafting_recipes } from "./crafting_display.js";
import { create_new_bestiary_entry, update_booklist_entry } from "./journal_panels.js";
import { skill_category_order, skill_list, update_displayed_stance_list } from "./skills_display.js";
/**
 * puts all important stuff into a string
 * @returns string with save data
 */
function create_save() {
    try{
        const save_data = {};
        save_data["game version"] = game_version;
        save_data["current time"] = current_game_time;
        save_data["language"] = language;
        save_data.saved_at = get_date();
        save_data.total_playtime = run_stats.total_playtime;
        //The message log, so a reload does not wipe what the player was just told.
        save_data.message_log = get_message_log_history();
        save_data.total_deaths = run_stats.total_deaths;
        save_data.total_crafting_attempts = run_stats.total_crafting_attempts;
        save_data.total_crafting_successes = run_stats.total_crafting_successes;
        save_data.total_kills = run_stats.total_kills;
        save_data.total_crits_done = run_stats.total_crits_done;
        save_data.total_crits_taken = run_stats.total_crits_taken;
        save_data.total_hits_done = run_stats.total_hits_done;
        save_data.total_hits_taken = run_stats.total_hits_taken;
        save_data.strongest_hit = run_stats.strongest_hit;
        save_data.gathered_materials = game_state.gathered_materials;
        save_data.global_flags = global_flags;
        save_data.lore_last = game_state.lore_last;
        save_data.last_rewarded_export = game_state.last_rewarded_export || 0;
        save_data["character"] = {
                                name: character.name, titles: character.titles,
                                personal: character.personal,
                                inventory: {}, equipment: character.equipment,
                                money: character.money, 
                                xp: {
                                    total_xp: character.xp.total_xp,
                                },
                                hp_to_full: character.stats.full.max_health - character.stats.full.health,
                                stamina_to_full: character.stats.full.max_stamina - character.stats.full.stamina,
                                reputation: character.reputation,
                            };
        //stats don't get saved, they will be recalculated upon loading
        save_data["player_storage"] = {inventory: {}};

        save_data.rain_counter = game_state.rain_counter;
        save_data.cold_status_counters = cold_status_counters;

        save_data.are_finished_quests_hidden = document.getElementById("quest_hiding_button").checked;

        Object.keys(character.inventory).forEach(key =>{
            save_data["character"].inventory[key] = {count: character.inventory[key].count};
        });
        
        Object.keys(player_storage.inventory).forEach(key =>{
            save_data["player_storage"].inventory[key] = {count: player_storage.inventory[key].count};
        });
       
        //Object.keys(character.equipment).forEach(key =>{
            //save_data["character"].equipment[key] = true;
            //need to rewrite equipment loading first
        //});

        save_data["favourite_consumables"] = favourite_consumables;
        save_data["favourite_items"] = favourite_items;

        save_data["recipes"] = {};
        Object.keys(recipes).forEach(category => {
            save_data["recipes"][category] = {};
            Object.keys(recipes[category]).forEach(subcategory => {
                save_data["recipes"][category][subcategory] = {};
                Object.keys(recipes[category][subcategory]).forEach(recipe_id => {
                    save_data["recipes"][category][subcategory][recipe_id] = {};
                    save_data["recipes"][category][subcategory][recipe_id].is_unlocked = recipes[category][subcategory][recipe_id].is_unlocked;
                    save_data["recipes"][category][subcategory][recipe_id].is_finished = recipes[category][subcategory][recipe_id].is_finished;
                });
            });
        });

        save_data["skill_category_order"] = skill_category_order;
        save_data["skills"] = {};
        Object.keys(skills).forEach(function(key) {
            if(!skills[key].is_parent){
                save_data["skills"][skills[key].skill_id] = {total_xp: skills[key].total_xp}; 
                //a bit redundant, but keep it in case key in skills is different than skill_id
            }
        }); //only save total xp of each skill, again in case of any changes
        
        save_data["current location"] = current_location.id;

        save_data["locations"] = {};
        Object.keys(locations).forEach(function(key) { 
            save_data["locations"][key] = {};
            if(locations[key].is_unlocked) {      
                save_data["locations"][key].is_unlocked = true;
            }
            if(locations[key].is_finished) {      
                save_data["locations"][key].is_finished = true;
            }

            if("parent_location" in locations[key]) { //combat zone //check for is_unlocked too?
                save_data["locations"][key]["enemy_groups_killed"] = locations[key].enemy_groups_killed;
            }

            if(locations[key].activities) {
                save_data["locations"][key]["unlocked_activities"] = []
                Object.keys(locations[key].activities).forEach(activity_key => {
                    if(locations[key].activities[activity_key].is_unlocked) {
                        save_data["locations"][key]["unlocked_activities"].push(activity_key);
                    }
                });
            }
            if(locations[key].actions) {
                save_data["locations"][key]["actions"] = {};
                Object.keys(locations[key].actions).forEach(action_key => {
                    if(locations[key].actions[action_key].is_unlocked || locations[key].actions[action_key].is_finished) {
                        save_data["locations"][key]["actions"][action_key] = {};

                        if(locations[key].actions[action_key].is_unlocked) {
                            save_data["locations"][key]["actions"][action_key].is_unlocked = true;
                            if(locations[key].actions[action_key].keep_progress) {
                                save_data["locations"][key]["actions"][action_key].accumulated_progress = locations[key].actions[action_key].accumulated_progress;
                            }
                            if(locations[key].actions[action_key].repeatable) {
                                save_data["locations"][key]["actions"][action_key].completion_count = locations[key].actions[action_key].completion_count;
                            }
                        }
                        if(locations[key].actions[action_key].is_finished) {
                            save_data["locations"][key]["actions"][action_key].is_finished = true;
                        }
                    }
                    
                });
            }
            if(locations[key].housing?.is_unlocked) {
                save_data["locations"][key].housing_unlocked = true;
            }
            if(locations[key].crafting?.is_unlocked) {
                save_data["locations"][key].crafting_unlocked = true;
            }
        }); //save locations' (and their activities'/actions') unlocked status and their killcounts

        save_data.favourite_locations = favourite_locations;

        save_data["activities"] = {};
        Object.keys(activities).forEach(function(activity) {
            if(activities[activity].is_unlocked) {
                save_data["activities"][activity] = {is_unlocked: true};
            }
        }); //save activities' unlocked status (this is separate from unlock status in location)

        if(current_activity) {
            save_data["current_activity"] = {activity_id: current_activity.id,
                                             earnings: current_activity.earnings,
                                             gathering_time: current_activity.gathering_time,
                                             gathered_materials: current_activity.gathered_materials,
                                            };
        }
        
        save_data["dialogues"] = {};
        Object.keys(dialogues).forEach(function(dialogue) {
            save_data["dialogues"][dialogue] = {is_unlocked: dialogues[dialogue].is_unlocked, is_finished: dialogues[dialogue].is_finished, textlines: {}, actions: {}};
            if(dialogues[dialogue].textlines) {
                Object.keys(dialogues[dialogue].textlines).forEach(textline_key => {
                    save_data["dialogues"][dialogue].textlines[textline_key] = {is_unlocked: dialogues[dialogue].textlines[textline_key].is_unlocked,
                                                                is_finished: dialogues[dialogue].textlines[textline_key].is_finished,
                                                                is_heard: dialogues[dialogue].textlines[textline_key].is_heard};
                });
            }
            if(dialogues[dialogue].actions) {
                Object.keys(dialogues[dialogue].actions).forEach(action_key => {
                    save_data["dialogues"][dialogue].actions[action_key] = {is_unlocked: dialogues[dialogue].actions[action_key].is_unlocked,
                                                                is_finished: dialogues[dialogue].actions[action_key].is_finished};

                    if(dialogues[dialogue].actions[action_key].keep_progress) {
                        save_data["dialogues"][dialogue].actions[action_key].accumulated_progress = dialogues[dialogue].actions[action_key].accumulated_progress;
                    }
                    if(dialogues[dialogue].actions[action_key].repeatable) {
                        save_data["dialogues"][dialogue].actions[action_key].completion_count = dialogues[dialogue].actions[action_key].completion_count;
                    }
                });
            }
        }); //save dialogues' and their textlines' unlocked/finished statuses

        save_data["traders"] = {};
        Object.keys(traders).forEach(function(trader) {
            if(traders[trader].is_finished) {
                //trader is no longer accessible
                save_data["traders"][trader] = {is_unlocked: traders[trader].is_unlocked,
                                                is_finished: traders[trader].is_finished};

            } else if(traders[trader].is_unlocked) {
                if(traders[trader].last_refresh == -1 || traders[trader].can_refresh()) {
                    //no need to save inventory, as trader would be anyway refreshed on any visit
                    save_data["traders"][trader] = {last_refresh: -1,
                                                    is_unlocked: traders[trader].is_unlocked};
                } else {
                    const temp_inventory = {};
                    Object.keys(traders[trader].inventory).forEach(key =>{
                        temp_inventory[key] = {count: traders[trader].inventory[key].count};
                    });
                    save_data["traders"][trader] = {inventory: temp_inventory,
                                                    last_refresh: traders[trader].last_refresh,
                                                    is_unlocked: traders[trader].is_unlocked,
                                                    is_finished: traders[trader].is_finished,
                                                };
                }
            }
        });

        save_data["books"] = {};
        Object.keys(book_stats).forEach(book => {
            if(book_stats[book].accumulated_time > 0 || book_stats[book].is_finished) {
                //check both conditions, on loading set as finished if either 'is_finished' or has enough time accumulated
                save_data["books"][book] = {
                    accumulated_time: book_stats[book].accumulated_time,
                    is_finished: book_stats[book].is_finished,
                };
            }
        });

        save_data["quests"] = {};
        Object.keys(quests).forEach(quest_id => {
            //save quest status and their tasks' statuses

            save_data["quests"][quest_id] = {
                is_active: quest_id in active_quests,
                is_finished: quests[quest_id].is_finished,
                task_status: [],
            };

            for(let i = 0; i < quests[quest_id].quest_tasks.length; i++) {
                if(quests[quest_id].quest_tasks[i].is_finished) {
                    save_data["quests"][quest_id].task_status[i] = {is_finished: true};
                } else {
                    if(quest_id in active_quests){
                        //save the progress and return, as only up to the first not-completed needs to be saved, anything after that cannot have  progress
                        save_data["quests"][quest_id].task_status[i] = {progress: active_quests[quest_id].quest_tasks[i].task_condition};
                        return;
                    }
                }
            }
        });

        save_data["is_reading"] = is_reading;

        save_data["is_sleeping"] = is_sleeping;

        save_data["active_effects"] = active_effects;

        save_data["enemy_killcount"] = enemy_killcount;
        save_data["item_log"] = item_log.items;

        save_data["loot_sold_count"] = loot_sold_count;

        save_data["last_combat_location"] = game_state.last_combat_location;
        save_data["last_location_with_bed"] = game_state.last_location_with_bed;

        save_data["options"] = game_options;

        save_data["stances"] = {};
        Object.keys(stances).forEach(stance => {
            if(stances[stance].is_unlocked) {
                save_data["stances"][stance] = true;
            }
        }) 
        save_data["current_stance"] = current_stance;
        save_data["selected_stance"] = selected_stance;
        save_data["faved_stances"] = faved_stances;

        save_data["message_filters"] = {
            unlocks: document.documentElement.style.getPropertyValue('--message_unlocks_display') !== "none",
            events: document.documentElement.style.getPropertyValue('--message_events_display') !== "none",
            combat: document.documentElement.style.getPropertyValue('--message_combat_display') !== "none",
            loot: document.documentElement.style.getPropertyValue('--message_loot_display') !== "none",
            background: document.documentElement.style.getPropertyValue('--message_background_display') !== "none",
            crafting: document.documentElement.style.getPropertyValue('--message_crafting_display') !== "none",
        };

        save_data["skill_list_state"] = {};
        for (let i = 0; i < skill_list.childElementCount; i++) {
            save_data["skill_list_state"][i] = skill_list.children[i].classList.contains("skill_category_expanded");
        }

        return JSON.stringify(save_data);
    } catch(error) {
        console.error("Something went wrong on saving the game!");
        console.error(error);
        log_message(translationManager.getText(language, "log failed to create a save"), "message_critical");
    }
} 

/**
 * called from index.html
 * @returns save string encoded to base64
 */
/**
 * Base64 for text that is not Latin-1.
 *
 * btoa refuses any character above U+00FF, which in Turkish means the four letters
 * outside Latin-1: s-cedilla, g-breve, dotless i, dotted I. The save has carried the
 * message log since the log started surviving a reload, so the first Turkish sentence
 * logged made every export throw and the button appeared to do nothing.
 *
 * Older exports still load. One could only ever have been produced from pure ASCII -
 * btoa would have thrown otherwise - and decoding ASCII as UTF-8 gives ASCII back.
 *
 * The loops are deliberate: String.fromCharCode(...bytes) and its inverse spread a
 * whole savefile across the argument list and overflow the stack on a long one.
 */
function to_base64(text) {
    const bytes = new TextEncoder().encode(text);
    let latin1 = "";
    for(let i = 0; i < bytes.length; i++) {
        latin1 += String.fromCharCode(bytes[i]);
    }
    return btoa(latin1);
}

function from_base64(encoded) {
    const latin1 = atob(encoded);
    const bytes = new Uint8Array(latin1.length);
    for(let i = 0; i < latin1.length; i++) {
        bytes[i] = latin1.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

function save_to_file() {
    if(Date.now() - game_state.last_rewarded_export > config.time_between_export_rewards) {
        game_state.last_rewarded_export = Date.now();
        give_export_reward();
    }

    //will create save twice...
    save_progress();
    return to_base64(create_save());
}

/**
 * saves game state to localStorage, on manual saves also logs message about it being done
 * @param {Boolean} is_manual 
 */
function save_to_localStorage({key, is_manual}) {
    const save = create_save();
    if(save) {
        localStorage.setItem(key, save);
        if(is_manual) {
            log_message(translationManager.getText(language, "log saved the game manually"));
            game_state.save_counter = 0;
        }
    }
    return JSON.parse(save).saved_at;
}

function save_progress() {
    if(is_on_dev()) {
        save_to_localStorage({key: dev_save_key, is_manual: true});
    } else {
        save_to_localStorage({key: save_key, is_manual: true});
    }
}

//core function for loading
function load(save_data) {
    try{
        //single loading method
        
        //current enemies are not saved

        //Read FIRST, before anything below can render. The locales are in memory
        //from the start (see the static imports in translation.js), so the only
        //thing that can still put the wrong language on screen is reading the
        //save's language late - and load() renders a lot: the version block, the
        //progress messages, change_location, the inventory, the quest log.
        //Reading it here also means a load that throws further down keeps the
        //player's language for the error message and for the next save, instead
        //of silently downgrading it to the default.
        if(save_data.language) {
            //Through the setter rather than by assignment: this is the one write that used
            //to make save/load unmovable, and a binding cannot be assigned from another
            //module.
            if(!set_language(save_data.language) && save_data.language !== "mofu_english") {
                console.warn(`Language ${save_data.language} could not be found.`);
            }
        }

        let any_warnings = false;

        current_game_time.loadTime(save_data["current time"]);
        time_field.innerText = current_game_time.toString();
        //set game time

        Object.keys(save_data.global_flags||{}).forEach(flag => {
            
            if(flag === "is_deep_forest_beaten") { //compatibility for pre-0.5
                global_flags["is_strength_proved"] = save_data.global_flags[flag];
            } else {
                global_flags[flag] = save_data.global_flags[flag];
            }
        });

        //Absent in a save from before the lore panel, which is fine: the panel simply
        //has no "where you left off" until the next line is read.
        game_state.lore_last = save_data.lore_last || null;

        game_state.last_rewarded_export = save_data.last_rewarded_export || game_state.last_rewarded_export;

        run_stats.total_playtime = save_data.total_playtime || 0;
        //Older saves have no log; restore_message_log ignores anything that is not
        //an array, so there is nothing to guard here.
        restore_message_log(save_data.message_log);
        run_stats.total_deaths = save_data.total_deaths || 0;
        run_stats.total_crafting_attempts = save_data.total_crafting_attempts || 0;
        run_stats.total_crafting_successes = save_data.total_crafting_successes || 0;
        run_stats.total_kills = save_data.total_kills || 0;
        run_stats.total_crits_done = save_data.total_crits_done || 0;
        run_stats.total_crits_taken = save_data.total_crits_taken || 0;
        run_stats.total_hits_done = save_data.total_hits_done || 0;
        run_stats.total_hits_taken = save_data.total_hits_taken || 0;
        run_stats.strongest_hit = save_data.strongest_hit || 0;
        game_state.gathered_materials = save_data.gathered_materials || {};

        name_field.value = save_data.character.name;
        character.name = save_data.character.name;
        Object.keys(character.personal).forEach(info => {
            character.personal[info] = save_data.character?.personal?.[info];
        });

        game_state.last_location_with_bed = save_data.last_location_with_bed;
        game_state.last_combat_location = save_data.last_combat_location;

        game_options.uniform_text_size_in_action = save_data.options?.uniform_text_size_in_action;
        option_uniform_textsize(game_options.uniform_text_size_in_action);

        game_options.auto_return_to_bed = save_data.options?.auto_return_to_bed;
        option_bed_return(game_options.auto_return_to_bed);

        game_options.disable_combat_autoswitch = save_data.options?.disable_combat_autoswitch;
        option_combat_autoswitch(game_options.disable_combat_autoswitch);

        game_options.remember_message_log_filters = save_data.options?.remember_message_log_filters;
        if(save_data.message_filters) {
            Object.keys(message_log_filters).forEach(filter => {
                message_log_filters[filter] = save_data.message_filters[filter] ?? true;
            })
        }

        option_remember_filters(game_options.remember_message_log_filters);


        game_options.do_background_animations = save_data.options?.do_background_animations;
        option_do_background_animations(game_options.do_background_animations);

        game_options.skip_play_button = save_data.options?.skip_play_button;
        option_skip_play_button(game_options.skip_play_button);

        game_options.mofu_mofu_mode = save_data.options?.mofu_mofu_mode;
        option_mofu_mofu_mode(game_options.mofu_mofu_mode);

        game_options.do_enemy_onhit_animations = save_data.options?.do_enemy_onhit_animations;
        option_do_enemy_onhit_animations(game_options.do_enemy_onhit_animations);

        game_options.expo_threshold = save_data.options?.expo_threshold;
        option_expo_threshold(game_options.expo_threshold);

        game_options.hide_max_level_skills = save_data.options?.hide_max_level_skills;
        option_hide_max_level_skills(game_options.hide_max_level_skills);

        game_options.use_text_outlines_for_tooltips = save_data.options?.use_text_outlines_for_tooltips;
        option_use_text_outlines_for_tooltips(game_options.use_text_outlines_for_tooltips);

        game_options.use_text_outlines_for_bars = save_data.options?.use_text_outlines_for_bars;
        option_use_text_outlines_for_bars(game_options.use_text_outlines_for_bars);

        document.getElementById("quest_hiding_button").checked = save_data.are_finished_quests_hidden;
        change_completed_quest_visibility();

        //compatibility for old saves, can be removed at some point
        const is_from_before_eco_rework = compare_game_version("v0.3.5", save_data["game version"]) == 1;

        character.money = (save_data.character.money || 0) * ((is_from_before_eco_rework == 1)*10 || 1);
        update_displayed_money();

        add_xp_to_character(save_data.character.xp.total_xp, false);

        game_state.rain_counter = save_data.rain_counter || 0;
        for(let i = 0; i < save_data.cold_status_counters?.length; i++) {
            cold_status_counters[i] = save_data.cold_status_counters[i] || 0;
        }

        Object.keys(save_data.favourite_consumables || {}).forEach(key => {
            favourite_consumables[key] = true;
        });
        Object.keys(save_data.favourite_items || {}).forEach(key =>{
            favourite_items[key] = true;
        })

        /*
        Object.keys(save_data.character.reputation || {}).forEach(rep_region => {
            if(rep_region in character.reputation) {
                character.reputation[rep_region] = save_data.character.reputation[rep_region];
            } else {
                console.warn(`Skipped reputation, no such region as "${rep_region}"`);
                any_warnings = true;
            }
        });
        */
        update_displayed_reputation();

        set_loading_screen_progress(translationManager.getText(language, "ui loading books"));
        
        if(save_data.skill_category_order) {
            save_data.skill_category_order.forEach((elem, idx) => {
                skill_category_order[idx] = elem;
            });
        }

        if(save_data.books) {
            let total_book_xp = 0;
            const literacy_xp = save_data.skills["Literacy"].total_xp;
            Object.keys(save_data.books).forEach(book=>{
                if(!item_templates[book]) {
                    console.warn(`Book ${book} couldn't be found and was skipped!`);
                    any_warnings = true;
                }

                if(save_data.books[book].accumulated_time > 0) {
                    if(save_data.books[book].is_finished) {
                        item_templates[book].setAsFinished();
                        character.stats.add_book_bonus(book_stats[book].bonuses);
                        process_rewards({rewards: book_stats[book].rewards, only_unlocks: true, inform_overall: false, is_from_loading: true});

                        total_book_xp += book_stats[book].required_time * book_stats[book].literacy_xp_rate;
                    } else {
                        item_templates[book].addProgress(save_data.books[book].accumulated_time);
                        total_book_xp += book_stats[book].accumulated_time * book_stats[book].literacy_xp_rate;
                    }
                }

                update_booklist_entry(book, save_data.books[book].is_finished);
            });
            if(total_book_xp > literacy_xp) {
                add_xp_to_skill({skill: skills["Literacy"], should_info: false, xp_to_add: total_book_xp, use_bonus: false, cap_gained_xp: false, is_from_loading: true});
                console.warn(`Saved XP for "Literacy skill" was less than it should be based on progress with books (${literacy_xp} vs ${total_book_xp}), so it was adjusted to match it!`);
                any_warnings = true;
            } else {
                add_xp_to_skill({skill: skills["Literacy"], should_info: false, xp_to_add: literacy_xp, use_bonus: false, cap_gained_xp: false, is_from_loading: true});
            }
        }
        
        Object.keys(save_data.skills).forEach(key => { 
            if(key === "Literacy") {
                return; //done separately, for compatibility with older saves (can be eventually removed)
            }
            if(skills[key] && !skills[key].is_parent){
                const saved_xp = save_data.skills[key].total_xp;
                if(Number.isFinite(saved_xp) && saved_xp > 0) {
                    add_xp_to_skill({
                                        skill: skills[key], xp_to_add: saved_xp, 
                                        should_info: false, add_to_parent: true, use_bonus: false, cap_gained_xp: false,
                                        is_from_loading: true
                                    });
                } else if(saved_xp !== 0) {
                    //JSON.stringify writes NaN and Infinity as null, so a skill whose
                    //xp was corrupted during an earlier session arrives here as null.
                    //The old "> 0" test skipped it in silence, which quietly wiped
                    //that skill's entire progress. Report it instead.
                    console.error(`Skill "${key}" was saved with an unusable total_xp (${saved_xp}) and could not be restored.`);
                    any_warnings = true;
                }
            } else if(save_data.skills[key].total_xp > 0) {
                    console.warn(`Skill "${key}" couldn't be found!`);
                    any_warnings = true;
            }
        }); //add xp to skills

        if(save_data["stances"]) {
            Object.keys(save_data["stances"]).forEach(stance => {
                if(save_data["stances"]) {
                    stances[stance].is_unlocked = true;
                } 
            });
        }

        update_displayed_stance_list(stances, current_stance);

        if(save_data.faved_stances) {
            Object.keys(save_data.faved_stances).forEach(stance_id=> {
                if(stances[stance_id] && stances[stance_id].is_unlocked) {
                    fav_stance(stance_id);
                }
            });
        }

        if(save_data.current_stance) {
            /*
                Both assignments used to be written out here and both were dead. change_stance
                is called without is_temporary, so it takes the branch that sets
                selected_stance AND current_stance - and it sets current_stance from the
                SELECTED one, so a save where the two differ ended up with them equal anyway.

                Writing them here is what kept save/load inside main.js: an imported binding
                cannot be assigned, so two of the three writes that pinned it are gone with
                this.

                The id is taken the way it always was, because an old save stores the stance
                as a bare string rather than an object.
            */
            const saved_stance = stances[save_data.selected_stance?.id]
                ? save_data.selected_stance.id
                : save_data.selected_stance;

            change_stance({stance_id: stances[saved_stance] ? saved_stance : "normal"});
        }

        Object.keys(save_data.character.equipment).forEach(function(key){
            if(save_data.character.equipment[key] != null) {
                const quality_mult = compare_game_version("v0.4.4", save_data["game version"]) == 1?100:1; //x100 if its from before quality rework
                if(key === "weapon") {
                    const {quality, equip_slot} = save_data.character.equipment[key];
                    let components;
                    if(save_data.character.equipment[key].components) {
                        components = save_data.character.equipment[key].components
                    } else {
                        const {head, handle} = save_data.character.equipment[key];
                        components = {head, handle};
                    }

                    Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                    if(!item_templates[components.head]){
                        console.warn(`Skipped item: weapon head component "${components.head}" couldn't be found!`);
                        any_warnings = true;
                    } else if(!item_templates[components.handle]) {
                        console.warn(`Skipped item: weapon handle component "${components.handle}" couldn't be found!`);
                        any_warnings = true;
                    } else {
                        const item = getItem({components, quality:quality*quality_mult, equip_slot, item_type: "EQUIPPABLE"});
                        equip_item(item, true);
                    }
                } else if(key === "off-hand") {
                    const {quality, equip_slot} = save_data.character.equipment[key];
                    let components;
                    if(save_data.character.equipment[key].components) {
                        components = save_data.character.equipment[key].components
                    } else {
                        const {shield_base, handle} = save_data.character.equipment[key];
                        components = {shield_base, handle};
                    }

                    Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                    if(!item_templates[components.shield_base]){
                        console.warn(`Skipped item: shield base component "${components.shield_base}" couldn't be found!`);
                        any_warnings = true;
                    } else if(!item_templates[components.handle]) {
                        console.warn(`Skipped item: shield handle "${components.handle}" couldn't be found!`);
                        any_warnings = true;
                    } else {
                        const item = getItem({components, quality:quality*quality_mult, equip_slot, item_type: "EQUIPPABLE"});
                        equip_item(item, true);
                    }
                } else if(save_data.character.equipment[key].equip_slot === "artifact" || save_data.character.equipment[key].tags?.tool) {
                    //no components
                    equip_item(getItem({...item_templates[save_data.character.equipment[key].id]}), true);
                } else { //armor
                    
                    const {quality, equip_slot} = save_data.character.equipment[key];
                    
                    if(save_data.character.equipment[key].components && save_data.character.equipment[key].components.internal.includes(" [component]")) {
                        //compatibility for armors from before v0.4.3
                        const item = getItem({...item_templates[save_data.character.equipment[key].components.internal.replace(" [component]","")], quality:quality*quality_mult});
                        equip_item(item, true);
                    } else if(save_data.character.equipment[key].components) {
                        let components = save_data.character.equipment[key].components;
                        
                        Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                        if(!item_templates[components.internal]){
                            console.warn(`Skipped item: internal armor component "${components.internal}" couldn't be found!`);
                            any_warnings = true;
                        } else if(components.external && !item_templates[components.external]) {
                            console.warn(`Skipped item: external armor component "${components.external}" couldn't be found!`);
                            any_warnings = true;
                        } else {
                            const item = getItem({components, quality:quality*quality_mult, equip_slot, item_type: "EQUIPPABLE"});
                            equip_item(item, true);
                        }
                    } else {
                        const item = getItem({...item_templates[save_data.character.equipment[key].name], quality:quality*quality_mult});
                        equip_item(item, true);
                    }

                }
            }
        }); //equip proper items

        if(character.equipment.weapon === null) {
            equip_item(null, true);
        }

        if(save_data.item_log) {
            item_log.items = save_data.item_log;
        }
        update_displayed_item_log();

        const item_list = [];

        Object.keys(save_data.character.inventory).forEach(key => {
            if(is_JSON(key)) {
                //case where this is False is left as compatibility for saves before v0.4.4
                let {id, components, quality} = JSON.parse(key);
                if(id && !quality) { 
                    //id is just a key of item_templates
                    //if it's present, item is "simple" (no components)
                    //and if it has no quality, it's something non-equippable
                    const mapped_item = get_item_mapping(id);
                    id = mapped_item.item_id;
                    if(item_templates[id]) {
                        const new_item_key = item_templates[id].getInventoryKey();

                        if(id === "Coal" && is_a_older_than_b(save_data["game version"], "v0.4.6.12")) {
                            item_list.push({item_key: item_templates["Charcoal"].getInventoryKey(), count: save_data.character.inventory[key].count, quality: quality});
                        } else {
                            item_list.push({item_key: new_item_key, count: Math.round(mapped_item.item_count * save_data.character.inventory[key].count), quality: quality});
                        }
                    } else {
                        console.warn(`Inventory item "${key}" from save on version "${save_data["game version"]} couldn't be found!`);
                        any_warnings = true;
                        return;
                    }
                } else if(components) {
                    Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                    const {head, handle, shield_base, internal, external} = components;
                    if(head) { //weapon
                        if(!item_templates[head]){
                            console.warn(`Skipped item: weapon head component "${head}" couldn't be found!`);
                            any_warnings = true;
                            return;
                        } else if(!item_templates[handle]) {
                            console.warn(`Skipped item: weapon handle component "${handle}" couldn't be found!`);
                            any_warnings = true;
                            return;
                        } else {
                            const item = getItem({components, quality, equip_slot: "weapon", item_type: "EQUIPPABLE"});
                            item_list.push({item_key: item.getInventoryKey(), count: save_data.character.inventory[key].count, quality: quality});
                        }
                    } else if(shield_base){ //shield
                        if(!item_templates[shield_base]){
                            console.warn(`Skipped item: shield base component "${shield_base}" couldn't be found!`);
                            any_warnings = true;
                            return;
                        } else if(!item_templates[handle]) {
                            console.warn(`Skipped item: shield handle component "${handle}" couldn't be found!`);
                            any_warnings = true;
                            return;
                        } else {
                            const item = getItem({components, quality, equip_slot: "off-hand", item_type: "EQUIPPABLE"});
                            item_list.push({item_key: item.getInventoryKey(), count: save_data.character.inventory[key].count, quality: quality});
                        }
                    } else if(internal) { //armor
                        if(!item_templates[internal]){
                            console.warn(`Skipped item: internal armor component "${internal}" couldn't be found!`);
                            any_warnings = true;
                            return;
                        } else if(!item_templates[external]) {
                            console.warn(`Skipped item: external armor component "${external}" couldn't be found!`);
                            any_warnings = true;
                            return;
                        } else {
                            let equip_slot = getArmorSlot(internal);
                            if(!equip_slot) {
                                return;
                            }
                            const item = getItem({components, quality, equip_slot:  getArmorSlot(internal), item_type: "EQUIPPABLE"});
                            item_list.push({item_key: item.getInventoryKey(), count: save_data.character.inventory[key].count, quality: quality});
                        }
                    } else {
                        console.error(`Intentory key "${key}" from save on version "${save_data["game version"]} seems to refer to non-existing item type!`);
                    }
                } else if(quality) { //no comps but quality (clothing / artifact /)
                    const item_id = get_component_name(id);
                    //const new_item_key = item_templates[item_id].getInventoryKey();
                    item_list.push({item_id: item_id, count: save_data.character.inventory[key].count, quality: quality});
                } else {
                    console.error(`Intentory key "${key}" from save on version "${save_data["game version"]} is incorrect!`);
                }
            } else { //older savefile, probably can be deleted at this point
                if(Array.isArray(save_data.character.inventory[key])) { //is a list of unstackable items (equippables or books), needs to be added 1 by 1
                    for(let i = 0; i < save_data.character.inventory[key].length; i++) {
                        if(save_data.character.inventory[key][i].item_type === "EQUIPPABLE" ) {
                            if(save_data.character.inventory[key][i].equip_slot === "weapon") {
                                
                                const {quality} = save_data.character.inventory[key][i];
                                let components;
                                if(save_data.character.inventory[key][i].components) {
                                    components = save_data.character.inventory[key][i].components
                                } else {
                                    const {head, handle} = save_data.character.inventory[key][i];
                                    components = {head, handle};
                                }

                                Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                                if(!item_templates[components.head]){
                                    console.warn(`Skipped item: weapon head component "${components.head}" couldn't be found!`);
                                    any_warnings = true;
                                } else if(!item_templates[components.handle]) {
                                    console.warn(`Skipped item: weapon handle component "${components.handle}" couldn't be found!`);
                                    any_warnings = true;
                                } else {
                                    const item = getItem({item_type: "EQUIPPABLE", equip_slot: "weapon", components});
                                    item_list.push({item_key: item.getInventoryKey(), count: 1, quality: quality*100});
                                }
                            } else if(save_data.character.inventory[key][i].equip_slot === "off-hand") {
                                const {quality} = save_data.character.inventory[key][i];
                                let components;
                                if(save_data.character.inventory[key][i].components) {
                                    components = save_data.character.inventory[key][i].components
                                } else {
                                    const {shield_base, handle} = save_data.character.inventory[key][i];
                                    components = {shield_base, handle};
                                }

                                Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                                if(!item_templates[components.shield_base]){
                                    console.warn(`Skipped item: shield base component "${components.shield_base}" couldn't be found!`);
                                    any_warnings = true;
                                } else if(!item_templates[components.handle]) {
                                    console.warn(`Skipped item: shield handle "${components.handle}" couldn't be found!`);
                                    any_warnings = true;
                                } else {
                                    const item = getItem({item_type: "EQUIPPABLE", equip_slot: "off-hand", components});
                                    item_list.push({item_key: item.getInventoryKey(), count: 1, quality: quality*100});
                                }
                            } else if(save_data.character.inventory[key][i].equip_slot === "artifact" || save_data.character.inventory[key][i].equip_slot === "amulet") {
                                item_list.push({item_key: key, count: 1});
                            } else { //armor    
                                if(save_data.character.inventory[key][i].components && save_data.character.inventory[key][i].components.internal.includes(" [component]")) {
                                    //compatibility for armors from before v0.4.3
                                    //const item = getItem({item_type: "EQUIPPABLE", equip_slot: "weapon", components});
                                    item_list.push({item_key: key, count: 1});
                                } else if(save_data.character.inventory[key][i].components) {
                                    let components = save_data.character.inventory[key][i].components;

                                    Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                                    if(!item_templates[components.internal]){
                                        console.warn(`Skipped item: internal armor component "${components.internal}" couldn't be found!`);
                                        any_warnings = true;
                                    } else if(components.external && !item_templates[components.external]) {
                                        console.warn(`Skipped item: external armor component "${components.external}" couldn't be found!`);
                                        any_warnings = true;
                                    } else {
                                        const item = getItem({item_type: "EQUIPPABLE", components});
                                        item_list.push({item_key: item.getInventoryKey(), count: 1, quality: save_data.character.inventory[key][i].quality*100});
                                    }
                                } else {
                                    item_list.push({item_id: key, count: 1});
                                }
                            }
                        } else {
                            item_list.push({item_id: key, count: 1, quality: save_data.character.inventory[key][i].quality*100});
                        }
                        
                    }
                } else { //is stackable 
                    if(item_templates[key]) {
                        item_list.push({item_id: key, count: save_data.character.inventory[key].count});
                    } else {
                        console.warn(`Inventory item "${key}" from save on version "${save_data["game version"]}" couldn't be found!`);
                        any_warnings = true;
                        return;
                    }
                }
            }
        }); //add all loaded items to list
        const skip_item_log = !is_a_older_than_b(save_data["game version"], "v0.5.5.9");
        add_to_character_inventory(item_list, skip_item_log); // and then to inventory

        const storage_item_list = [];
        if(save_data.player_storage) {
            Object.keys(save_data.player_storage.inventory).forEach(function(key){
                if(is_JSON(key)) {
                    let {id, components, quality} = JSON.parse(key);
                    if(id && !quality) { 
                        //id is just a key of item_templates
                        //if it's present, item is "simple" (no components)
                        //and if it has no quality, it's something non-equippable

                        const mapped_item = get_item_mapping(id);
                        id = mapped_item.item_id;

                        if(item_templates[id]) {
                            const new_item_key = item_templates[id].getInventoryKey();
                            storage_item_list.push({item_key: new_item_key, count: Math.round(mapped_item.item_count * save_data.player_storage.inventory[key].count), quality: quality});
                        } else {
                            console.warn(`Inventory item "${key}" from save on version "${save_data["game version"]} couldn't be found!`);
                            any_warnings = true;
                            return;
                        }
                    } else if(components) {

                        Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                        const {head, handle, shield_base, internal, external} = components;
                        if(head) { //weapon
                            if(!item_templates[head]){
                                console.warn(`Skipped item: weapon head component "${head}" couldn't be found!`);
                                any_warnings = true;
                                return;
                            } else if(!item_templates[handle]) {
                                console.warn(`Skipped item: weapon handle component "${handle}" couldn't be found!`);
                                any_warnings = true;
                                return;
                            } else {
                                const item = getItem({components, quality, equip_slot: "weapon", item_type: "EQUIPPABLE"});
                                storage_item_list.push({item_key: item.getInventoryKey(), count: save_data.player_storage.inventory[key].count, quality: quality});
                            }
                        } else if(shield_base){ //shield
                            if(!item_templates[shield_base]){
                                console.warn(`Skipped item: shield base component "${shield_base}" couldn't be found!`);
                                any_warnings = true;
                                return;
                            } else if(!item_templates[handle]) {
                                console.warn(`Skipped item: shield handle component "${handle}" couldn't be found!`);
                                any_warnings = true;
                                return;
                            } else {
                                const item = getItem({components, quality, equip_slot: "off-hand", item_type: "EQUIPPABLE"});
                                storage_item_list.push({item_key: item.getInventoryKey(), count: save_data.player_storage.inventory[key].count, quality: quality});
                            }
                        } else if(internal) { //armor
                            if(!item_templates[internal]){
                                console.warn(`Skipped item: internal armor component "${internal}" couldn't be found!`);
                                any_warnings = true;
                                return;
                            } else if(!item_templates[external]) {
                                console.warn(`Skipped item: external armor component "${external}" couldn't be found!`);
                                any_warnings = true;
                                return;
                            } else {
                                let equip_slot = getArmorSlot(internal);
                                if(!equip_slot) {
                                    return;
                                }
                                const item = getItem({components, quality, equip_slot: getArmorSlot(internal), item_type: "EQUIPPABLE"});
                                storage_item_list.push({item_key: item.getInventoryKey(), count: save_data.player_storage.inventory[key].count, quality: quality});
                            }
                        } else {
                            console.error(`Intentory key "${key}" from save on version "${save_data["game version"]} seems to refer to non-existing item type!`);
                        }
                    } else if(quality) { //no comps but quality (clothing / artifact?)
                        const item_id = get_component_name(id);
                        storage_item_list.push({item_id: item_id, count: save_data.player_storage.inventory[key].count, quality: quality});
                    } else {
                        console.error(`Intentory key "${key}" from save on version "${save_data["game version"]} is incorrect!`);
                    }
                } //storage didn't exist before everything became stackable, so no need to check the other case
            }); //add all loaded items to list
            player_storage.add_to_inventory(storage_item_list); // and then to storage inventory
        }

        set_loading_screen_progress(translationManager.getText(language, "ui loading meowing"));

        Object.keys(save_data.dialogues).forEach(function(dialogue) {
            if(dialogues[dialogue]) {
                dialogues[dialogue].is_unlocked = save_data.dialogues[dialogue].is_unlocked;
                dialogues[dialogue].is_finished = save_data.dialogues[dialogue].is_finished;
            } else {
                if(dialogue === "cute little rat" && is_a_older_than_b(save_data["game version"], "v0.5.0")) {
                    return;
                }
                console.warn(`Dialogue "${dialogue}" couldn't be found!`);
                any_warnings = true;
                return;
            }
            if(save_data.dialogues[dialogue].textlines) {  
                Object.keys(save_data.dialogues[dialogue].textlines).forEach(textline_key => {
                    if(dialogues[dialogue].textlines[textline_key]) {
                        dialogues[dialogue].textlines[textline_key].is_unlocked = save_data.dialogues[dialogue].textlines[textline_key].is_unlocked;
                        dialogues[dialogue].textlines[textline_key].is_finished = save_data.dialogues[dialogue].textlines[textline_key].is_finished;
                        /*
                            A save from before the lore panel has no is_heard, so it
                            falls back to is_finished. That inherits the ten lines
                            another line locks - finished without being read - once,
                            for one save, which beats back-filling nothing at all.
                        */
                        dialogues[dialogue].textlines[textline_key].is_heard =
                            save_data.dialogues[dialogue].textlines[textline_key].is_heard
                            ?? save_data.dialogues[dialogue].textlines[textline_key].is_finished;
                    } else {
                        console.warn(`Textline "${textline_key}" in dialogue "${dialogue}" couldn't be found!`);
                        any_warnings = true;
                        return;
                    }
                });
            }
            if(save_data.dialogues[dialogue].actions) {  
                Object.keys(save_data.dialogues[dialogue].actions).forEach(action_key => {
                    if(dialogues[dialogue].actions[action_key]) {
                        dialogues[dialogue].actions[action_key].is_unlocked = save_data.dialogues[dialogue].actions[action_key].is_unlocked;
                        dialogues[dialogue].actions[action_key].is_finished = save_data.dialogues[dialogue].actions[action_key].is_finished;

                        if(dialogues[dialogue].actions[action_key].keep_progress && save_data.dialogues[dialogue].actions[action_key].accumulated_progress) {
                            dialogues[dialogue].actions[action_key].accumulated_progress = save_data.dialogues[dialogue].actions[action_key].accumulated_progress;
                        }
                        if(dialogues[dialogue].actions[action_key].repeatable) {
                            dialogues[dialogue].actions[action_key].completion_count = save_data.dialogues[dialogue].actions[action_key].completion_count || 0;
                        }
                    } else {
                        console.warn(`Textline "${action_key}" in dialogue "${dialogue}" couldn't be found!`);
                        any_warnings = true;
                        return;
                    }
                });
            }
        }); //load for dialogues and their textlines and actions their unlocked/finished status

        if(is_a_older_than_b(save_data["game version"], "v0.5.1")) {
            //compatibility for some dialogues
            process_rewards({
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["crab rumors"]}]
                },
                inform_overall: false,
            });

            if(dialogues["village guard"].textlines["hello"].is_finished) {
                process_rewards({
                    rewards: {
                        flags: ["is_guard_met"],
                        textlines: [
                            {dialogue: "village elder", lines: ["about guard"]},
                            {dialogue: "old craftsman", lines: ["about guard"]},
                            {dialogue: "village millers", lines: ["about guard"]},
                        ],
                    },
                    inform_overall: false,
                });
            }

            if(dialogues["village guard"].textlines["wide"].is_finished) {
                process_rewards({
                    rewards: {
                        textlines: [{dialogue: "village guard", lines: ["hi", "tips 2", "serious", "teach more"]}]
                    },
                    inform_overall: false,
                });
            }
        }

        if(is_a_older_than_b(save_data["game version"], "v0.5.2")) {
            //dealt with boars but didn't yet start task to deal with ants -> unlock additional line that explains that more work will be available after winter ends
            if(dialogues["farm supervisor"].textlines["defeated boars"].is_finished && !dialogues["farm supervisor"].textlines["troubled"].is_finished) {
                process_rewards({
                    rewards: {
                        textlines: [{dialogue: "farm supervisor", lines: ["troubled unavailable"]}]
                    },
                    inform_overall: false,
                });
            }

            if(dialogues["village elder"].textlines["money"].is_finished) {
                process_rewards({
                    rewards: {
                        textlines: [{dialogue: "village elder", lines: ["other work"]}]
                    },
                    inform_overall: false,
                });
            }

            if(dialogues["village elder"].textlines["cleared cave"].is_finished) {
                process_rewards({
                    rewards: {
                        locks: {
                            textlines: {"village elder": ["leave for materials"]}
                        }
                    },
                    inform_overall: false,
                });
            }
        }

        Object.keys(save_data.traders).forEach(function(trader) { 
            let trader_item_list = [];
            if(traders[trader]){
                traders[trader].is_unlocked = save_data.traders[trader].is_unlocked;

                if(save_data.traders[trader].is_finished) {
                    traders[trader].is_finished = true;
                    return;
                }

                if(save_data.traders[trader].inventory) {
                    Object.keys(save_data.traders[trader].inventory).forEach(function(key){
                        if(is_JSON(key)) {
                            let {id, components, quality} = JSON.parse(key);
                            if(id && !quality) { 
                                //id is just a key of item_templates
                                //if it's present, item is "simple" (no components)
                                //and if it has no quality, it's something non-equippable and not a component

                                const mapped_item = get_item_mapping(id);
                                id = mapped_item.item_id;

                                if(item_templates[id]) {
                                    const new_item_key = item_templates[id].getInventoryKey();
                                    trader_item_list.push({item_key: new_item_key, count: Math.round(mapped_item.item_count * save_data.traders[trader].inventory[key].count), quality: quality});
                                } else {
                                    console.warn(`Inventory item "${key}" from save on version "${save_data["game version"]} couldn't be found!`);
                                    any_warnings = true;
                                    return;
                                }
                            } else if(components) {

                                Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                                const {head, handle, shield_base, internal, external} = components;

                                if(head) { //weapon
                                    if(!item_templates[head]){
                                        console.warn(`Skipped item: weapon head component "${head}" couldn't be found!`);
                                        any_warnings = true;
                                        return;
                                    } else if(!item_templates[handle]) {
                                        console.warn(`Skipped item: weapon handle component "${handle}" couldn't be found!`);
                                        any_warnings = true;
                                        return;
                                    } else {
                                        const item = getItem({components, quality, equip_slot: "weapon", item_type: "EQUIPPABLE"});
                                        trader_item_list.push({item_key: item.getInventoryKey(), count: save_data.traders[trader].inventory[key].count, quality});
                                    }
                                } else if(shield_base){ //shield
                                    if(!item_templates[shield_base]){
                                        console.warn(`Skipped item: shield base component "${shield_base}" couldn't be found!`);
                                        any_warnings = true;
                                        return;
                                    } else if(!item_templates[handle]) {
                                        console.warn(`Skipped item: shield handle component "${handle}" couldn't be found!`);
                                        any_warnings = true;
                                        return;
                                    } else {
                                        const item = getItem({components, quality, equip_slot: "off-hand", item_type: "EQUIPPABLE"});
                                        trader_item_list.push({item_key: item.getInventoryKey(), count: save_data.traders[trader].inventory[key].count, quality});
                                    }
                                } else if(internal) { //armor
                                    if(!item_templates[internal]){
                                        console.warn(`Skipped item: internal armor component "${internal}" couldn't be found!`);
                                        any_warnings = true;
                                        return;
                                    } else if(!item_templates[external]) {
                                        console.warn(`Skipped item: external armor component "${external}" couldn't be found!`);
                                        any_warnings = true;
                                        return;
                                    } else {
                                        if(!getArmorSlot(internal)) {
                                            return;
                                        }

                                        const item = getItem({components, quality, equip_slot: getArmorSlot(internal), item_type: "EQUIPPABLE"});
                                        trader_item_list.push({item_key: item.getInventoryKey(), count: save_data.traders[trader].inventory[key].count, quality});
                                    }
                                } else {
                                    console.error(`Intentory key "${key}" from save on version "${save_data["game version"]} seems to refer to non-existing item type!`);
                                }
                            } else if(quality) { //no comps but quality (clothing / artifact?)
                                const item_id = get_component_name(id);
                                trader_item_list.push({item_id: item_id, count: save_data.traders[trader].inventory[key].count, quality});
                            } else {
                                console.error(`Intentory key "${key}" from save on version "${save_data["game version"]} is incorrect!`);
                            }
                            
                        } else { //compatibility for saves before v0.4.4
                            if(Array.isArray(save_data.traders[trader].inventory[key])) { //is a list of unstackable (equippable or book) item, needs to be added 1 by 1
                                for(let i = 0; i < save_data.traders[trader].inventory[key].length; i++) {
                                    if(save_data.traders[trader].inventory[key][i].item_type === "EQUIPPABLE"){
                                        if(save_data.traders[trader].inventory[key][i].equip_slot === "weapon") {
                                            const {quality} = save_data.traders[trader].inventory[key][i];
                                            let components;
                                            if(save_data.traders[trader].inventory[key][i].components) {
                                                components = save_data.traders[trader].inventory[key][i].components
                                            } else {
                                                const {head, handle} = save_data.traders[trader].inventory[key][i];
                                                components = {head, handle};
                                            }

                                            Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                                            if(!item_templates[components.head]){
                                                console.warn(`Skipped item: weapon head component "${components.head}" couldn't be found!`);
                                                any_warnings = true;
                                            } else if(!item_templates[components.handle]) {
                                                console.warn(`Skipped item: weapon handle component "${components.handle}" couldn't be found!`);
                                                any_warnings = true;
                                            } else {
                                                const item = getItem({components, item_type: "EQUIPPABLE", equip_slot: "weapon"});
                                                trader_item_list.push({item_key: item.getInventoryKey(), count: 1, quality: quality*100});
                                            }
                                        } else if(save_data.traders[trader].inventory[key][i].equip_slot === "off-hand") {
                                            
                                            const {quality} = save_data.traders[trader].inventory[key][i];
                                            let components;
                                            if(save_data.traders[trader].inventory[key][i].components) {
                                                components = save_data.traders[trader].inventory[key][i].components
                                            } else {
                                                const {shield_base, handle} = save_data.traders[trader].inventory[key][i];
                                                components = {shield_base, handle};
                                            }

                                            Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                                            if(!item_templates[components.shield_base]){
                                                console.warn(`Skipped item: shield base component "${components.shield_base}" couldn't be found!`);
                                                any_warnings = true;
                                            } else if(!item_templates[components.handle]) {
                                                console.warn(`Skipped item: shield handle "${components.handle}" couldn't be found!`);
                                                any_warnings = true;
                                            } else {
                                                //trader_item_list.push({item_key: key, count: 1, quality: quality*100});
                                                const item = getItem({components, item_type: "EQUIPPABLE", equip_slot: "off-hand"});
                                                trader_item_list.push({item_key: item.getInventoryKey(), count: 1, quality: quality*100});
                                            }
                                        } else { //armor
                                            const {quality} = save_data.traders[trader].inventory[key][i];
                                            if(save_data.traders[trader].inventory[key][i].components && save_data.traders[trader].inventory[key][i].components.internal.includes(" [component]")) {
                                                //compatibility for armors from before v0.4.3
                                                const item = getItem({...item_templates[key]});
                                                trader_item_list.push({item_key: item.getInventoryKey(), count: 1, quality: quality*100});
                                            } else if(save_data.traders[trader].inventory[key][i].components) {
                                                let components = save_data.traders[trader].inventory[key][i].components;

                                                Object.keys(components).forEach(comp => components[comp] = get_component_name(components[comp]));

                                                if(!item_templates[components.internal]){
                                                    console.warn(`Skipped item: internal armor component "${components.internal}" couldn't be found!`);
                                                    any_warnings = true;
                                                } else if(components.external && !item_templates[components.external]) {
                                                    console.warn(`Skipped item: external armor component "${components.external}" couldn't be found!`);
                                                    any_warnings = true;
                                                } else {
                                                    //trader_item_list.push({item_key: key, count: 1, quality: quality*100});
                                                    const item = getItem({components, item_type: "EQUIPPABLE", equip_slot: "armor"});
                                                    trader_item_list.push({item_key: item.getInventoryKey(), count: 1, quality: quality*100});
                                                }
                                            } else { //no components, so clothing? not sure, it's old stuff
                                                trader_item_list.push({item_id: key, count: 1, quality: quality*100});
                                            }
                                        }
                                    } else {
                                        console.warn(`Skipped item, no such item type as "${0}" could be found`)
                                        any_warnings = true;
                                    }
                                }
                            } else {
                                save_data.traders[trader].inventory[key].item.value = item_templates[key].value;
                                if(item_templates[key].item_type === "EQUIPPABLE") {
                                    save_data.traders[trader].inventory[key].item.equip_effect = item_templates[key].equip_effect;
                                } else if(item_templates[key].item_type === "USABLE") {
                                    save_data.traders[trader].inventory[key].item.use_effect = item_templates[key].use_effect;
                                }
                                trader_item_list.push({item_id: key, count: save_data.traders[trader].inventory[key].count});
                            }
                        }
                    });
                    
                }
                traders[trader].refresh();
                traders[trader].inventory = {};
                add_to_trader_inventory(trader, trader_item_list);

                traders[trader].last_refresh = save_data.traders[trader].last_refresh; 
            }
            else {
                console.warn(`Trader "${trader} couldn't be found!`);
                any_warnings = true;
                return;
            }
        }); //load trader inventories

        set_loading_screen_progress(translationManager.getText(language, "ui loading rats"));

        Object.keys(save_data.locations).forEach(function(key) {
            if(locations[key]) {
                if(save_data.locations[key].is_unlocked) {
                    locations[key].is_unlocked = true;
                }
                if(save_data.locations[key].is_finished) {
                    locations[key].is_finished = true;
                }
                if("parent_location" in locations[key]) { // if combat zone
                    locations[key].enemy_groups_killed = save_data.locations[key].enemy_groups_killed || 0;   

                    if(is_a_older_than_b(save_data["game version"], "v0.4.6")) { //compatibility patch for pre-rep and/or pre-rewrite of rewards with required clear count
                        if(locations[key].rewards_with_clear_requirement) {
                            //process rewards with clear req, as these won't be checked on further clears
                            for(let i = 0; i < locations[key].rewards_with_clear_requirement.length; i++) {
                                if(locations[key].enemy_groups_killed == locations[key].enemy_count * locations[key].rewards_with_clear_requirement[i].required_clear_count)
                                {
                                    //always do it if there was enough or more than enough clears
                                    process_rewards({
                                                        rewards: locations[key].rewards_with_clear_requirement[i], source_type: "location", 
                                                        source_name: locations[key].name, is_first_clear: false, source_id: locations[key].id,
                                                        is_from_loading: true
                                                    });
                                }
                            }
                        }
                    } else {
                        if(locations[key].rewards_with_clear_requirement) {
                            //process rewards with clear req, as these won't be checked on further clears
                            for(let i = 0; i < locations[key].rewards_with_clear_requirement.length; i++) {
                                if(locations[key].enemy_groups_killed >= locations[key].enemy_count * locations[key].rewards_with_clear_requirement[i].required_clear_count)
                                {
                                    //always do it if there was enough or more than enough clears
                                    process_rewards({
                                                        rewards: locations[key].rewards_with_clear_requirement[i], source_type: "location", 
                                                        source_name: locations[key].name, is_first_clear: false, source_id: locations[key].id, 
                                                        only_unlocks: true, is_from_loading: true
                                                    });
                                }
                            }
                        }
                    }

                    if(locations[key].first_reward) {
                        //process first clear reward, as it won't be checked on further clears
                        process_rewards({
                            rewards: locations[key].first_reward, 
                            source_type: "location", 
                            is_first_clear: true, 
                            source_id: location.id,
                            is_from_loading: true,
                            only_unlocks: true,
                        });
                    }
                }

                //unlock activities
                if(save_data.locations[key].unlocked_activities) {
                    for(let i = 0; i < save_data.locations[key].unlocked_activities.length; i++) {
                        if(!locations[key].activities[save_data.locations[key].unlocked_activities[i]]) {
                            continue;
                        }
                        if(save_data.locations[key].unlocked_activities[i] === "plowing the fields") { //old compatibility patch
                            locations[key].activities["fieldwork"].is_unlocked = true;
                        } else {
                            locations[key].activities[save_data.locations[key].unlocked_activities[i]].is_unlocked = true;
                        }
                    }
                }

                if(save_data.locations[key].actions) {
                    Object.keys(save_data.locations[key].actions).forEach(action_key => {
                        if(save_data.locations[key].actions[action_key].is_unlocked) {
                            locations[key].actions[action_key].is_unlocked = true;
                            if(locations[key].actions[action_key].keep_progress && save_data.locations[key].actions[action_key].accumulated_progress) {
                                locations[key].actions[action_key].accumulated_progress = save_data.locations[key].actions[action_key].accumulated_progress;
                            }
                            if(locations[key].actions[action_key].repeatable) {
                                locations[key].actions[action_key].completion_count = save_data.locations[key].actions[action_key].completion_count || 0;
                            }
                        }

                        if(save_data.locations[key].actions[action_key].is_finished) {
                            locations[key].actions[action_key].is_finished = true;
                        }

                    });
                }

                if(save_data.locations[key].housing_unlocked) {
                    if(!Object.keys(locations[key].housing).length) {
                        console.warn(`Location "${locations[key].name}" was saved as having a bed unlocked, but it no longer has this mechanic and was skipped!`);
                        any_warnings = true;
                    } else {
                        locations[key].housing.is_unlocked = true;
                        if(save_data.locations[key].is_unlocked) {
                            unlocked_beds[key] = true;
                        }
                    }
                } else if(locations[key].housing?.is_unlocked){ 
                    unlocked_beds[key] = true;
                }

                if(save_data.locations[key].crafting_unlocked) {
                    if(!Object.keys(locations[key].crafting).length) {
                        console.warn(`Location "${locations[key].name}" was saved as having a crafting unlocked, but it no longer has this mechanic and was skipped!`);
                        any_warnings = true;
                    } else {
                        locations[key].crafting.is_unlocked = true;
                    }
                }

            } else {
                console.warn(`Location "${key}" couldn't be found!`);
                any_warnings = true;
                return;
            }
        }); //load for locations their unlocked status and their killcounts

        if(is_a_older_than_b(save_data["game version"], "v0.5")) {
            //unlock status was swapped from local activity to global activity, so a need for this
            if(locations["Nearby cave"].activities["climbing"].is_unlocked) {
                activities["climbing"].is_unlocked = true;
            }
        }

        if(is_a_older_than_b(save_data["game version"], "v0.5.1.4")) {
            //lake camp was fused with lake beach
            if(save_data.locations["Lake camp"]?.is_unlocked) {
                locations["Lake beach"].housing.is_unlocked = true;

                if(save_data["current location"] === "Lake camp") {
                    save_data["current location"] = "Lake beach";
                }
            }
        }

        if(is_a_older_than_b(save_data["game version"], "v0.5.1.11")) {
            if(locations["Lake beach"].actions["create lake camp"].is_finished) {
                process_rewards({
                    rewards: {
                        crafting: ["Lake beach"],
                    }, 
                    inform_overall: false
                });
            }
        }

        if(is_a_older_than_b(save_data["game version"], "v0.5.1.5")) {
            if(game_state.last_location_with_bed === "Lake camp") {
                game_state.last_location_with_bed = "Lake beach";
            }

            if(locations["Lake beach"].actions["create lake camp"].is_finished) {
                process_rewards({
                    rewards: {
                        housing: ["Lake beach"],
                    }, 
                    inform_overall: false
                });
            }
        }

        if(is_a_older_than_b(save_data["game version"], "v0.4.6.7")) {
            locations["Town square"].is_unlocked = false;
            if(save_data["current location"] === "Town square") {
                save_data["current location"] = "Village";
            }
            //tiny lock and location swap as it was accidentally unlocked in 4.6.0 - 4.6.6
        }
        

        Object.keys(save_data.activities).forEach(function(activity) {
            if(activities[activity]) {
                activities[activity].is_unlocked = save_data.activities[activity].is_unlocked || false;
            } else if(activity === "plowing the fields") { //old compatibility patch
                activities["fieldwork"].is_unlocked = save_data.activities[activity].is_unlocked || false;
            } else {
                console.warn(`Activity "${activity}" couldn't be found!`);
                any_warnings = true;
            }
        });

        if(is_a_older_than_b(save_data["game version"], "v0.5")) {
            //save from before v0.5: 
            // - split sold count equally between traders
            // - add an "Old shovel"
            const loot_count = {};
            const divisor = Object.keys(market_region_mapping).length;
            Object.keys(save_data.loot_sold_count).forEach(loot_key => {
                const count = save_data.loot_sold_count[loot_key];
                Object.keys(market_region_mapping).forEach(region_key => {
                    if(!loot_count[region_key]) {
                        loot_count[region_key] = {};
                    }
                    
                    loot_count[region_key][loot_key] = [{sold: 0, recovered: 0}];
                    loot_count[region_key][loot_key][0].sold = Math.floor(count.sold/divisor);
                    loot_count[region_key][loot_key][0].recovered = Math.floor(count.recovered/divisor);
                });
            });
            set_loot_sold_count(loot_count);
            
            if(dialogues["old craftsman"].textlines["learn"].is_finished) {
                add_to_character_inventory([{item_id: "Old shovel"}]);
            }
        } else if(is_a_older_than_b(save_data["game version"], "v0.5.0.22") && is_a_older_than_b("v0.5", save_data["game version"])) {
            //save between 0.5 and trickle rate fix
            const loot_count = {};
            
            Object.keys(save_data.loot_sold_count).forEach(region_key => {
                loot_count[region_key] = {};
                Object.keys(save_data.loot_sold_count[region_key]).forEach(trade_key => {
                    loot_count[region_key][trade_key] = [];
                    for(let i = 0; i < save_data.loot_sold_count[region_key][trade_key].length; i++) {
                        if(save_data.loot_sold_count[region_key][trade_key][i].sold > capped_at) {
                            console.warn(`Encountered a large sold count (${save_data.loot_sold_count[region_key][trade_key][i].sold}) of a trade group "${trade_key}" at tier ${i}. Due to the save being from a game version where a certain bug`
                                    + ` could make these values keep growing by themselves, it was reduced to ${capped_at}, and it's recovered_count was lowered proportionally.`);

                            const ratio = save_data.loot_sold_count[region_key][trade_key][i].recovered/save_data.loot_sold_count[region_key][trade_key][i].sold;
                            save_data.loot_sold_count[region_key][trade_key][i].sold = capped_at;
                            save_data.loot_sold_count[region_key][trade_key][i].recovered = capped_at*ratio;
                        }

                        loot_count[region_key][trade_key].push({sold: save_data.loot_sold_count[region_key][trade_key][i].sold, recovered: save_data.loot_sold_count[region_key][trade_key][i].recovered});
                    }
                });
            });

            set_loot_sold_count(loot_count);
        } else {
            //set it normally
            set_loot_sold_count(save_data.loot_sold_count || {});
        }

        //load active effects if save is not from before their rework
        if(compare_game_version(save_data["game version"], "v0.4.4") >= 0){
            Object.keys(save_data.active_effects).forEach(function(effect) {
                active_effects[effect] =  new ActiveEffect({...effect_templates[effect], duration: save_data.active_effects[effect].duration});
            });
            character.stats.add_active_effect_bonus();
        }

        set_loading_screen_progress(translationManager.getText(language, "ui loading vet"));

        if(save_data.character.hp_to_full == null || save_data.character.hp_to_full >= character.stats.full.max_health) {
            character.stats.full.health = 1;
        } else {
            character.stats.full.health = character.stats.full.max_health - save_data.character.hp_to_full;
        }
        
        //if missing hp is null (save got corrupted) or its more than max_health, set health to minimum allowed (which is 1)
        //otherwise just do simple substraction
        //then same with stamina below
        if(save_data.character.stamina_to_full == null || save_data.character.stamina_to_full >= character.stats.full.max_stamina) {
            character.stats.full.stamina = 0;
        } else {
            character.stats.full.stamina = character.stats.full.max_stamina - save_data.character.stamina_to_full;
        }

        set_loading_screen_progress(translationManager.getText(language, "ui loading rats again"));

        if(save_data["enemy_killcount"]) {
            Object.keys(save_data["enemy_killcount"]).forEach(enemy_name => {
                enemy_killcount[enemy_name] = save_data["enemy_killcount"][enemy_name];
                create_new_bestiary_entry(enemy_name);
            });
        }

        set_loading_screen_progress(translationManager.getText(language, "ui loading procrastinating"));

        if(save_data["quests"]) {
            Object.keys(save_data["quests"]).forEach(quest => {

                if(save_data["quests"][quest].is_finished) {
                    //finished => all tasks are also finished, don't care about their specifics
                    for(let i = 0; i < quests[quest].quest_tasks.length; i++) {
                        quests[quest].quest_tasks[i].is_finished = true;
                    }
                    questManager.startQuest({quest_id: quest, should_inform: false});
                    questManager.finishQuest({quest_id: quest, should_inform: false, only_unlocks: true, is_from_loading: true});

                } else if(save_data["quests"][quest].is_active) {
                    questManager.startQuest({quest_id: quest, should_inform: false});
                    //active => at least 1 task is unfinished and its specifics matter
                    for(let i = 0; i < save_data["quests"][quest].task_status.length-1; i++) {
                        //set all but last to finished
                        questManager.finishQuestTask({quest_id: quest, task_index: i, only_unlocks: true, skip_warning: true, skip_message: true, is_from_loading: true});
                    }

                    //set progress of the first unfinished task
                    const unfinished_index = save_data["quests"][quest].task_status.length-1;
                    const first_unfinished_task = save_data["quests"][quest].task_status[unfinished_index].progress;


                    Object.keys(first_unfinished_task || {}).forEach(task_group => {
                        if(!quests[quest].quest_tasks[unfinished_index].task_condition[task_group]) {
                            console.warn(`Skipped loading progress for quest "${quest}", no such task group as "${task_group}" was present.`);
                            any_warnings = true;
                            return;
                        }
                        Object.keys(first_unfinished_task[task_group]).forEach(task_type =>{
                            if(!quests[quest].quest_tasks[unfinished_index].task_condition[task_group][task_type]) {
                                console.warn(`Skipped loading progress for quest "${quest}", no such task type as "${task_type}" was present.`);
                                any_warnings = true;
                                return;
                            }
                            Object.keys(first_unfinished_task[task_group][task_type]).forEach(task_target_id => {
                                if(!quests[quest].quest_tasks[unfinished_index].task_condition[task_group][task_type][task_target_id]) {
                                    console.warn(`Skipped loading progress for quest "${quest}", no such task target as "${task_target_id}" was present.`);
                                    any_warnings = true;
                                    return;
                                }
                                quests[quest].quest_tasks[unfinished_index].task_condition[task_group][task_type][task_target_id].current = first_unfinished_task[task_group][task_type][task_target_id].current;
                            });
                        });
                    });
                    if(!quests[quest].is_hidden) {
                        update_displayed_quest(quest);
                    }
                }
            });
        }

        //save from before quests, need to manually setup story quests
        if(is_a_older_than_b(save_data["game version"], "v0.5.0")){
            
            //memory line
            questManager.startQuest({quest_id: "Lost memory", should_inform: false});
            if(dialogues["village elder"].textlines["what happened"].is_finished) {
                questManager.finishQuestTask({quest_id: "Lost memory", task_index: 0, skip_message: true});

                if(dialogues["village elder"].textlines["need to"].is_finished) {
                    questManager.finishQuestTask({quest_id: "Lost memory", task_index: 1, skip_message: true});

                    if(dialogues["village elder"].textlines["cleared cave"].is_finished) {
                        questManager.finishQuestTask({quest_id: "Lost memory", task_index: 2, skip_message: true});
    
                        if(dialogues["suspicious man"].textlines["defeated"].is_finished) {
                            questManager.finishQuestTask({quest_id: "Lost memory", task_index: 3, skip_message: true});
                        }
                    }
                }
                
            }

            //rat saga line
            if(locations["Suspicious wall"].is_finished) {
                questManager.startQuest({quest_id: "The Infinite Rat Saga", should_inform: false});

                if(locations["Mysterious gate"].enemy_groups_killed >= locations["Mysterious gate"].enemy_count) {
                    questManager.finishQuestTask({quest_id: "The Infinite Rat Saga", task_index: 0, skip_message: true});

                    if(locations["Nearby cave"].actions["open the gate"].is_finished) {
                        questManager.finishQuestTask({quest_id: "The Infinite Rat Saga", task_index: 1, skip_message: true});

                        if(locations["Writhing tunnel"].enemy_groups_killed >= locations["Writhing tunnel"].enemy_count) {
                            questManager.finishQuestTask({quest_id: "The Infinite Rat Saga", task_index: 2, skip_message: true});
                        }
                    }
                }
            }

            //slums line
            if(dialogues["suspicious man"].textlines["gang"].is_finished) {
                questManager.startQuest({quest_id: "Light in the darkness", should_inform: false});
                questManager.finishQuestTask({quest_id: "Light in the darkness", task_index: 0, skip_message: true});

                if(locations["Gang hideout"].is_finished) {
                    questManager.finishQuestTask({quest_id: "Light in the darkness", task_index: 1, skip_message: true});
                }
            }

            //town farm quest
            if(dialogues["farm supervisor"].textlines["fight0"].is_finished || dialogues["farm supervisor"].textlines["fight"].is_finished) {
                questManager.startQuest({quest_id: "Ploughs to swords", should_inform: false});

                if(dialogues["farm supervisor"].textlines["fight"].is_finished) {
                    questManager.finishQuestTask({quest_id: "Ploughs to swords", task_index: 0, skip_message: true});
                    
                    if(dialogues["farm supervisor"].textlines["defeated boars"].is_finished) {
                        questManager.finishQuestTask({quest_id: "Ploughs to swords", task_index: 1, skip_message: true});
                    }
                }
            }
        }

        //reposted because "fight" textline was originally not included, causing issues
        if(is_a_older_than_b(save_data["game version"], "v0.5.0.7") && is_a_older_than_b("v0.5.0", save_data["game version"])){ 
             if(dialogues["farm supervisor"].textlines["fight0"].is_finished || dialogues["farm supervisor"].textlines["fight"].is_finished) {
                questManager.startQuest({quest_id: "Ploughs to swords", should_inform: false});

                if(dialogues["farm supervisor"].textlines["fight"].is_finished) {
                    questManager.finishQuestTask({quest_id: "Ploughs to swords", task_index: 0, skip_message: true});
                    
                    if(dialogues["farm supervisor"].textlines["defeated boars"].is_finished) {
                        questManager.finishQuestTask({quest_id: "Ploughs to swords", task_index: 1, skip_message: true});
                    }
                }
            }
        }

        //continuation for compatibility as there was no good place in dialogues to put it in...
        if(dialogues["farm supervisor"].textlines["defeated boars"].is_finished) {
            dialogues["farm supervisor"].textlines["troubled"].is_unlocked = true;
        }
        
        set_loading_screen_progress(translationManager.getText(language, "ui loading catnip"));

        if(save_data["recipes"]) {
            Object.keys(save_data["recipes"]).forEach(category => {
                Object.keys(save_data["recipes"][category]).forEach(subcategory => {
                    Object.keys(save_data["recipes"][category][subcategory]).forEach(recipe_id => {
                        if(!recipes[category][subcategory][recipe_id]) {
                            if(is_a_older_than_b(save_data["game version"], "v0.5.0")){
                                if(
                                    (
                                        category === "crafting" 
                                        && subcategory === "items" 
                                        && (recipes["butchering"]["items"][recipe_id] || recipes["woodworking"]["items"][recipe_id])
                                    )
                                    || recipe_id === "Shield base" 
                                    || recipe_id === "Shield handle"
                                ) {
                                    //don't warn as they were moved to different category
                                    return;
                                }
                            }

                            console.warn(`Could not find recipe "${category}"->"${subcategory}"->"${recipe_id}". It might have been removed.`);
                            any_warnings = true;
                            return;
                        }
                        if(save_data["recipes"][category][subcategory][recipe_id].is_unlocked) {
                            recipes[category][subcategory][recipe_id].is_unlocked = true;
                        }
                        if(save_data["recipes"][category][subcategory][recipe_id].is_finished) {
                            recipes[category][subcategory][recipe_id].is_finished = true;
                        }
                    });
                });
            });
        }

        set_loading_screen_progress(translationManager.getText(language, "ui loading finishing pats"));

        if(save_data.favourite_locations) {
            Object.keys(save_data.favourite_locations).forEach(location_key => {
                if(locations[location_key]) {
                    if(!locations[location_key]?.housing?.is_unlocked) { 
                        //tiny little check that's not even worth including a version comparison in it
                        //adds location to favs only if it is not an unlocked housing
                        favourite_locations[location_key] = true;
                    }
                } else {
                    console.warn(`Saved favourite locations included "${location_key}", which is not a valid location id`);
                    any_warnings = true;
                }
            });
        }

        if(save_data.skill_list_state) {
            Object.keys(save_data.skill_list_state).forEach(index => {
                if (skill_list.childElementCount > 0 && save_data.skill_list_state[index]) {
                    skill_list.children[index].classList.add("skill_category_expanded");
                }
            })
        }

        update_character_stats();
        update_displayed_character_inventory();

        update_displayed_health();
        //load current health
        
        update_displayed_effects();
        
        create_displayed_crafting_recipes();
        change_location({location_id: save_data["current location"], skip_travel_time: true, do_quest_events: false, skip_combat: true});

        //temperature and background are location dependent so display settings are loaded after location is set
        game_options.use_uncivilised_temperature_scale = save_data.options?.use_uncivilised_temperature_scale;
        option_use_uncivilised_temperature_scale(game_options.use_uncivilised_temperature_scale);

        game_options.change_background_color = save_data.options?.change_background_color;
        option_change_background_color(game_options.change_background_color);

        game_options.do_dynamic_loot_message = save_data.options?.do_dynamic_loot_message;
        option_do_dynamic_loot_message(game_options.do_dynamic_loot_message);

        //set activity if any saved
        if(save_data.current_activity) {
            //search for it in location from save_data
            const activity_id = save_data.current_activity.activity_id;
            if(typeof activity_id !== "undefined" && current_location.activities[activity_id] && activities[current_location.activities[activity_id].activity_name]) {
                
                start_activity(activity_id);
                if(activities[current_location.activities[activity_id].activity_name].type === "JOB") {
                    current_activity.earnings = save_data.current_activity.earnings * ((is_from_before_eco_rework == 1)*10 || 1);
                    document.getElementById("action_end_earnings").innerText = translationManager.getText(language, "ui earnings",
                        {v1: format_money(current_activity.earnings)});
                } else if(activities[current_location.activities[activity_id].activity_name].type === "GATHERING") {
                    //current_activity.gathered_materials = save_data.current_activity.gathered_materials || {};
                    //pretty sure this was used only for logging purposes, but let's just leave it commented out instead of deleting
                }

                current_activity.gathering_time = save_data.current_activity.gathering_time;
                
            } else {
                console.warn(`Couldn't find saved activity "${activity_id}"! It might have been removed`);
                any_warnings = true;
            }
        }

        if(save_data.is_sleeping) {
            start_sleeping();
        }
        if(save_data.is_reading) {
            start_reading(save_data.is_reading);
        }

        if(any_warnings) {
            set_loading_screen_warnings_warning();
        }

        update_displayed_time();
        set_loading_screen_versions(save_data["game version"]);
    } catch(error) {
        set_loading_screen_versions(save_data["game version"]);
        throw error;
    }
} 

/**
 * called from index.html;
 * loads game from file by resetting everything that needs to be reset and then calling main loading method with same parameter;
 * @param {String} save_string 
 */
function load_from_file(save_string) {
    try{
        if(is_on_dev()) {
            localStorage.setItem(dev_save_key, from_base64(save_string));
        } else {
            localStorage.setItem(save_key, from_base64(save_string));
        }        
        window.location.reload(false);
    } catch (error) {
        console.error("Something went wrong on preparing to load from file!");
        console.error(error);
    }
} 

/**
 * loads the game from localStorage
 * it's called when page is refreshed, so there's no need for it to reset anything
 */
function load_from_localstorage() {
    try{
        if(is_on_dev()) {
            if(localStorage.getItem(dev_save_key)){
                load(JSON.parse(localStorage.getItem(dev_save_key)));
                log_message(translationManager.getText(language, "log loaded dev save if you"));
            } else {
                //no need to check if it should import or do a fresh start (in case it's a result of hard reset), as that's already handled elsewhere
                load(JSON.parse(localStorage.getItem(save_key)));
                log_message(translationManager.getText(language, "log dev save was not found"));
            }
        } else {
            load(JSON.parse(localStorage.getItem(save_key)));
        }
    } catch(error) {
        game_state.is_loading_error = true;
        set_loading_screen_progress(translationManager.getText(language, "ui loading something went wrong"));
        set_loading_screen_errors_warning();
        console.error("Something went wrong on loading from localStorage!");
        console.error(error);
    }
}

function load_backup() {
    try{
        if(is_on_dev()) {
            if(localStorage.getItem(dev_backup_key)){
                localStorage.setItem(dev_save_key, localStorage.getItem(dev_backup_key));
                window.location.reload(false);
            } else {
                console.log("Can't load backup as there is none yet.");
                log_message(translationManager.getText(language, "log can t load backup as"));
            }
        } else {
            if(localStorage.getItem(backup_key)){
                localStorage.setItem(save_key, localStorage.getItem(backup_key));
                window.location.reload(false);
            } else {
                console.log("Can't load backup as there is none yet.")
                log_message(translationManager.getText(language, "log can t load backup as"));
            }
        }
    } catch(error) {
        console.error("Something went wrong on loading from localStorage!");
        console.error(error);
    }
}

function load_other_release_save() {
    try{
        if(is_on_dev()) {
            if(localStorage.getItem(save_key)){
                localStorage.setItem(dev_save_key, localStorage.getItem(save_key));
                window.location.reload(false);
            } else {
                console.log("There are no saves on the other release.")
                log_message(translationManager.getText(language, "log there are no saves on"));
            }
        } else {
            if(localStorage.getItem(dev_save_key)){
                localStorage.setItem(save_key, localStorage.getItem(dev_save_key));
                window.location.reload(false);
            } else {
                console.log("There are no saves on the other release.");
                log_message(translationManager.getText(language, "log there are no saves on"));
            }
        }
    } catch(error) {
        console.error("Something went wrong on loading from localStorage!");
        console.error(error);
    }
}

export { save_to_file, save_to_localStorage, save_progress, load, load_from_file, load_from_localstorage, load_backup, load_other_release_save };
