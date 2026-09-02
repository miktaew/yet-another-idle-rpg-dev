"use strict";

import { current_game_time, is_night } from "./game_time.js";
import { run_stats } from "./run_stats.js";
import { game_state } from "./game_state.js";
import { item_templates, item_log, getItem, book_stats, rarity_multipliers, getArmorSlot, getItemFromKey, getItemRarity, Weapon} from "./items.js";
import { loot_sold_count, market_region_mapping, recover_item_prices, trickle_market_saturations, set_loot_sold_count, capped_at } from "./market_saturation.js";
import { locations, favourite_locations, location_types } from "./data/locations.js";
import { crafting_skill_xp_gains_cap, skill_categories, skill_xp_gains_cap, skills, weapon_type_to_skill, which_skills_affect_skill } from "./data/skills.js";
import { dialogues } from "./data/dialogues.js";
//money_spent decides both whether and how much an attempt takes, and it lives
//beside the gate that let the action start so the two cannot read the shape
//differently. It is pure and covered by npm test; the code here is not.
import { money_spent } from "./conditions.js";
import { enemy_killcount, enemy_tag_to_skill_mapping, enemy_templates, tags_for_droprate_modifier_skills } from "./enemies.js";
import { traders } from "./traders.js";
import { is_in_trade, start_trade, cancel_trade, accept_trade, exit_trade, add_to_trader_inventory,
         add_to_buying_list, remove_from_buying_list, add_to_selling_list, remove_from_selling_list} from "./trade.js";
import { character, 
         add_to_character_inventory, remove_from_character_inventory,
         equip_item_from_inventory, unequip_item, equip_item,
         update_character_stats,
         get_skill_xp_gain, 
         get_total_skill_level,
         time_until_wet,
         cold_status_temperatures,
         time_until_cold,
         time_until_cold_when_wet,
         cold_status_effects,
         get_character_cold_tolerance,
         is_rat} from "./character.js";
import { activities } from "./activities.js";
import { refresh_open_journal_panels,
         end_activity_animation,
         update_displayed_money,
         log_message,
         //The message log's save and restore. Exported from display.js because that
         //is where the log and its history live.
         get_message_log_history,
         restore_message_log,
         update_displayed_enemies,
         update_displayed_health_of_enemies,
         update_displayed_combat_location,
         update_displayed_normal_location,
         log_loot,
         update_displayed_equipment,
         update_displayed_health,
         update_displayed_stamina,
         format_money,
         update_displayed_stats,
         update_displayed_effects,
         update_displayed_effect_durations,
         update_displayed_time,
         update_displayed_character_xp,
         start_sleeping_display,
         update_displayed_ongoing_activity,
         update_enemy_attack_bar,
         update_character_attack_bar,
         remove_fast_travel_choice,
         start_reading_display,
         update_displayed_xp_bonuses,
         update_displayed_stamina_efficiency,
         update_gathering_tooltip,
         update_displayed_location_types,
         update_backup_load_button,
         update_other_save_load_button,
         set_game_action_finish_text,
         update_game_action_progress_bar,
         update_game_action_finish_button,
         update_location_icon,
         update_displayed_temperature,
         update_displayed_quest,
         start_rain_animation,
         start_snow_animation,
         stop_background_animation,
         update_displayed_total_price,
         start_stars_animation,
         update_export_button_tooltip,
         update_displayed_reputation,
         hide_loading_screen,
         set_loading_screen_versions,
         set_loading_screen_errors_warning,
         set_loading_screen_progress,
         hide_loading_text,
         show_play_button,
         set_loading_screen_warnings_warning,
         fill_action_box,
         set_play_button_text,
         do_enemy_onhit_animation,
         remove_enemy_onhit_animation,
         create_floating_effect,
         do_enemy_onstart_animation,
         update_location_kill_count,
         change_completed_quest_visibility,
         update_fav_display,
         update_displayed_item_log,
         set_light_based_background_color,
         unassign_dynamic_loot_message,
         fill_character_bio,
         retranslate_interface,
         insert_HTML,
        } from "./display.js";
import { compare_game_version, crafting_tags_to_skills, get_component_name, get_hit_chance, is_a_older_than_b, get_item_mapping, random_range, skill_consumable_tags, rtp, is_JSON} from "./misc.js";
import { stances } from "./combat_stances.js";
import { get_recipe_xp_value, get_component_stats, recipes } from "./crafting_recipes.js";
import { game_version, get_game_version } from "./game_version.js";
import { ActiveEffect, effect_templates } from "./active_effects.js";
import { open_storage, close_storage, move_item_to_storage, remove_item_from_storage, player_storage, is_storage_open } from "./data/storage.js";
import { Verify_Game_Objects } from "./verifier.js";
import { ReputationManager } from "./reputation.js";
import { quests, questManager, active_quests } from "./quests.js";
import { get_current_temperature_smoothed, is_raining } from "./weather.js";
import { Pathfinder, speed_modifiers_from_skills } from "./pathfinding.js";
import { translationManager } from "./translation.js";
import { characterCreator } from "./character_creation.js";
import { config } from "./config.js";
import { fill_availability_methods } from "./component_management.js";

/*
    Last on purpose. The import cycle here is load-bearing and its order is what
    resolves it - the browser-free test loader replays this very list to reproduce
    the browser's order - so a new module goes at the end, where everything it needs
    has already been entered.

    Only for window.use_recipe: the page's surface stays in one file.
*/
import { use_recipe } from "./crafting.js";
/*
    Last on purpose: the cycle here resolves by evaluation order, and the
    browser-free test loader replays this very list to reproduce it.
*/
import { save_to_file, save_to_localStorage, save_progress, load, load_from_file, load_from_localstorage, load_backup, load_other_release_save } from "./save_load.js";
import { close_crafting_window, create_displayed_crafting_recipes, 
         open_crafting_window, switch_crafting_recipes_page, 
         switch_crafting_recipes_subpage, update_displayed_component_choice, 
         update_displayed_crafting_recipes, update_displayed_material_choice, 
         update_item_recipe_tooltips, update_item_recipe_visibility, 
         update_recipe_tooltip } from "./crafting_display.js";
import { booklist_entry_divs, create_new_bestiary_entry, update_bestiary_entry_killcount,
         update_bestiary_entry_tooltip, update_booklist_entry, update_displayed_book,
         update_displayed_discoveries, update_displayed_lore, update_displayed_titles } from "./journal_panels.js";
import { create_new_skill_bar, skill_category_order, skill_list, sort_displayed_skills,
         update_all_displayed_skills_xp_gain, update_displayed_faved_stances,
         update_displayed_skill_bar, update_displayed_skill_description,
         update_displayed_skill_xp_gain, update_displayed_stance,
         update_displayed_stance_list, update_stance_tooltip } from "./skills_display.js";
import { sort_displayed_inventory, update_displayed_character_inventory,
         update_displayed_storage_inventory, update_displayed_trader_inventory } from "./inventory_display.js";
import { is_title_earned, titles } from "./data/titles.js";
//At the end of the list on purpose: main.js's import order is load-bearing and a
//new edge goes last. ui_helpers.js imports nothing from the cycle, so it is safe here.
import { place_tooltip_vertically } from "./ui_helpers.js";
import { rolls_a_sighting } from "./data/marrowmoth.js";
import { accept_from_board, job_after_kill, job_is_done, refreshed_board,
         standing_paid_for } from "./guild_jobs.js";
import { update_displayed_guild_board } from "./guild_display.js";
const save_key = "save data";
const dev_save_key = "dev save data";
const backup_key = "backup save";
const dev_backup_key = "dev backup save";

const global_flags = {
    is_gathering_unlocked: false,
    is_crafting_unlocked: false,
    is_strength_proved: false, //this role could be fulfilled by a quest, but it was originally added before that mechanic; besides, flags are cool and elegant
    is_mofu_mofu_enabled: true,
    is_guard_met: false,
    /*
        P-14 phase 7. Set by reading the shallows at the Forest lake, and read by the
        lake's own background noises: once the player has seen the print, the water makes
        a different set of sounds. A flag rather than a quest because there is no quest -
        the arc has not started and the player is not supposed to be sure it will.
    */
    has_read_the_shallows: false,
    //The second trace, in the basin's rock shelters. Set by reading them, and read by the
    //basin's own noise - which it badly needed, having exactly one.
    has_read_the_shelters: false,
    /*
        P-14 phase 7, and the answer to Q-13: the thing the traces belong to can be met,
        at about one in ten thousand, in the two places that carry a trace. Set by that
        roll in update() and read by the Forest lake's description, which stops being
        about reeds once the reader knows what flattened them.

        Not earnable retroactively and so not in save_repairs.js: there is no finished
        content whose reward this is. It is a thing that either happened to you or did not.
    */
    has_seen_the_animal: false,
    is_hero_created: false, //changed after going through hero creation panel
    //P-10 region 4. Read live by the Mountain camp's crafting tiers, so the flue is
    //a flag rather than a saved tier - global_flags are already saved and loaded.
    is_mountain_forge_built: false,
    //P-11. Same shape as the mountain flue, one tier lower, for the same reason the
    //old craftsman gave: down here the draught is a boy and a boy gets tired.
    is_village_hearth_built: false,
    /*
        P-14 phase 6. The tallyman says the day he writes it down it becomes a guild
        matter; he will not. The player can, at the clerk, and the row hears about it -
        which is the whole of this flag: it is not a gate, it is something the world
        remembers about a choice nobody made you make.
    */
    is_marrowmoth_a_guild_matter: false,
    //P-11. The slums have a buyer. Read by the room's own description, which already
    //changes once for the gang - this is the second thing that ever changed there.
    is_slums_account_open: false,
};
//TEXT IDS, resolved where the message is logged.
const flag_unlock_texts = {
    is_gathering_unlocked: "ui unlocked gathering",
    is_crafting_unlocked: "ui unlocked crafting",
}

const play_button = document.getElementById("loading_screen_play_button");

const languages = {
    english: "english",
    turkish: "turkish",
};
//Shown in the language selector. Each language names itself in its own language,
//which is the convention players expect from a language menu.
const language_names = {
    english: "English",
    turkish: "Türkçe",
};
//BCP 47 tags for localeCompare. Sorting translated names with a plain ">" orders
//by code unit, which puts every accented letter after "z" - wrong in any language
//that has them.
const language_tags = {
    english: "en",
    turkish: "tr",
};
let language = languages.english;


//in seconds

//some random stats to keep count of in case they ever become relevant

//keeping the time to use it for export bonus

//temperature
let current_temperature = 20;

const cold_status_counters = [0,0,0,0];

let was_raining = false;
let was_starry = false;

//current enemy
let current_enemies = null;

const enemy_attack_loops = {};
let enemy_attack_cooldowns;
let enemy_timer_variance_accumulator = [];
let enemy_timer_adjustment = [];
let enemy_timers = [];
let character_attack_loop;

let character_timer_variance_accumulator = 0;
let character_timer_adjustment = 0;
let character_timers = [];

const maximum_time_correction = 10;
//maximum time correction for combat, in miliseconds

//current location
let current_location;

let current_activity;

let game_action_interval;
//The running action's tick, kept so a speed change can re-arm its interval.
let game_action_tick;
let current_game_action;

//loot from currently active source (combat location or specific activity), used for display if dynamic loot logging option is enabled
const current_loot = {
    recent: {},
    total: {},
}

//time needed to travel from A to B
let travel_times = {};
let pathfinder;

//locations for fast travel
let unlocked_beds = {};

//resting, true -> health regenerates
let is_resting = true;

//sleeping, true -> health regenerates, timer goes up faster
let is_sleeping = false;


//reading, either null or book name
let is_reading = null;

//ticks between saves, 60 = ~1 minute
const save_period = 60;

//ticks between backup saves, 60 = ~1 minute
const backup_period = 3600;
let backup_counter = 0;

//let, not const: set_game_speed multiplies it. See the speed control below.
let tickrate = config.tickrate;

//accumulates deviations
let time_variance_accumulator = 0;
//all 3 used for calculating and adjusting tick durations
let time_adjustment = 0;
let start_date;
let end_date;

let current_dialogue;
//The last line the player read, so the lore panel can open on where they left off.
const active_effects = {};
//e.g. health regen from food

let selected_stance = stances["normal"];
let current_stance = stances["normal"];
const faved_stances = {};

const favourite_consumables = {};
//consumables that are to be used automatically if their effect runs out

const favourite_items = {};
//items to be displayed with "show faves" option in inventory

//stuff from options panel
const game_options = {
    uniform_text_size_in_action: false,
    auto_return_to_bed: true,
    remember_message_log_filters: false,
    remember_sorting_options: false, //not in use?
    combat_disable_autoswitch: false,

    do_dynamic_loot_message: false,

    auto_use_when_longest_runs_out: true, //can't actually be changed by a player; despite the name, it decides whether to first use longest-duration item or shortest-duration item
    use_uncivilised_temperature_scale: false, //true -> swap Celsius for Fahrenheit
    do_background_animations: false,
    change_background_color: false,
    skip_play_button: false, //not really skips, just automatically clicks it right after loading
    mofu_mofu_mode: true,
    do_enemy_onhit_animations: true,
    expo_threshold: 9,
    hide_max_level_skills: false,
    use_text_outlines_for_tooltips: true,
    use_text_outlines_for_bars: true,

    stop_crafting_on_material_change: true, //not changeable
};

let message_log_filters = {
    unlocks: true,
    events: true,
    combat: true,
    loot: true,
    crafting: true,
    background: true,
};

//holds the stack of dialogues/textlines and actions/activities
const content_stack = [];
const content_stack_removal_options = {TOP: "top", ALL: "all"};

//character name
const name_field = document.getElementById("character_name_field");
name_field.value = character.name;
name_field.addEventListener("change", () => character.name = name_field.value.toString().trim().length>0?name_field.value:"Hero");

const time_field = document.getElementById("time_div");
time_field.innerText = current_game_time.toString();

(function setup(){
    Object.keys(skills).forEach(skill => {
        character.xp_bonuses.total_multiplier[skill] = 1;
        character.bonus_skill_levels.full[skill] = 0;
    });
    
    Object.keys(skill_categories).forEach(category => {
        character.xp_bonuses.total_multiplier["category_"+category] = 1;
    });
})();

function option_uniform_textsize(option) {
    //doesn't really force same textsize, just changes some variables so they match
    const checkbox = document.getElementById("options_textsize");
    if(checkbox.checked || option) {
        game_options.uniform_text_size_in_action = true;    
        document.documentElement.style.setProperty('--options_action_textsize', '20px');
    } else {
        game_options.uniform_text_size_in_action = false;
        document.documentElement.style.setProperty('--options_action_textsize', '16px');
    }

    if(option !== undefined) {
        checkbox.checked = option;
    }
}

function option_bed_return(option) {
    const checkbox = document.getElementById("options_bed_return");

    if(option !== undefined) {
        game_options.auto_return_to_bed = option;
        checkbox.checked = option;
    } else {
        game_options.auto_return_to_bed = checkbox.checked;
    }
}

function option_remember_filters(option) {
    const checkbox = document.getElementById("options_save_messagelog_settings");
    if(checkbox.checked || option) {
        game_options.remember_message_log_filters = true;
    } else {
        game_options.remember_message_log_filters = false;
    }

    if(option !== undefined) {
        checkbox.checked = option;

        if(message_log_filters.unlocks){
            document.documentElement.style.setProperty('--message_unlocks_display', 'inline-block');
        } else {
            document.documentElement.style.setProperty('--message_unlocks_display', 'none');
            document.getElementById("message_show_unlocks").classList.remove("active_selection_button");
        }

        if(message_log_filters.combat) {
            document.documentElement.style.setProperty('--message_combat_display', 'inline-block');
        } else {
            document.documentElement.style.setProperty('--message_combat_display', 'none');
            document.getElementById("message_show_combat").classList.remove("active_selection_button");
        }

        if(message_log_filters.events) {
            document.documentElement.style.setProperty('--message_events_display', 'inline-block');
        } else {
            document.documentElement.style.setProperty('--message_events_display', 'none');
            document.getElementById("message_show_events").classList.remove("active_selection_button");
        }

        if(message_log_filters.loot) {
            document.documentElement.style.setProperty('--message_loot_display', 'inline-block');
        } else {
            document.documentElement.style.setProperty('--message_loot_display', 'none');
            document.getElementById("message_show_loot").classList.remove("active_selection_button");
        }

        if(message_log_filters.crafting) {
            document.documentElement.style.setProperty('--message_crafting_display', 'inline-block');
        } else {
            document.documentElement.style.setProperty('--message_crafting_display', 'none');
            document.getElementById("message_show_crafting").classList.remove("active_selection_button");
        }

        if(message_log_filters.background) {
            document.documentElement.style.setProperty('--message_background_display', 'inline-block');
        } else {
            document.documentElement.style.setProperty('--message_background_display', 'none');
            document.getElementById("message_show_background").classList.remove("active_selection_button");
        }
    }
}

function option_combat_autoswitch(option) {
    const checkbox = document.getElementById("options_dont_autoswitch_to_combat");

    if(checkbox.checked || option) {
        game_options.disable_combat_autoswitch = true;
    } else {
        game_options.disable_combat_autoswitch = false;
    }

    if(option !== undefined) {
        checkbox.checked = option;
    }
}

/**
 * Switches the active language.
 *
 * Follows the same shape as the other option handlers: called with no argument it
 * reads the control, called with a value it sets the control first, which is how
 * the load path restores a saved setting.
 *
 * The switch is live rather than a reload. translateUI covers everything carrying
 * a data-translation attribute; everything else - dialogue lines, tooltips, quest
 * text - goes through getText when its panel is drawn, so it changes over as the
 * player moves around. Text already on screen keeps the old language until its
 * panel is redrawn.
 */
/**
 * The standalone pages - the help and the in-game changelog - open in a new tab,
 * so they cannot go through the translation layer. Each language gets its own
 * file, and a language with no translated page keeps the English one.
 */
const translated_pages = {
    help: {
        english: "help.html",
        turkish: "help.tr.html",
    },
    changelog: {
        english: "changelog.html",
        turkish: "changelog.tr.html",
    },
};

function update_translated_page_links() {
    document.querySelectorAll("a[data-page]").forEach(link => {
        const pages = translated_pages[link.dataset.page];
        if(!pages) {
            console.warn(`No page map for "${link.dataset.page}".`);
            return;
        }
        link.setAttribute("href", pages[language] ?? pages[default_language_for_pages]);
    });
}
const default_language_for_pages = "english";

/**
 * Sets the language, for a caller that is not the options panel.
 *
 * `language` is a module-scope binding here and an imported - therefore read-only - one
 * everywhere else, so a module that has to set it needs a function rather than an
 * assignment. That is the last of the three writes keeping save/load inside this file.
 *
 * Deliberately NOT moved into game_state.js: 694 references across 21 files to relocate a
 * single assignment. A setter costs one line.
 *
 * @param {String} chosen a key of `languages`
 * @returns {Boolean} whether it was a language this build knows
 */
function set_language(chosen) {
    if(!languages[chosen]) {
        return false;
    }
    language = chosen;
    return true;
}

async function option_language(option) {
    const selector = document.getElementById("options_language");

    if(option !== undefined) {
        selector.value = option;
    }

    const chosen = selector.value;
    if(!languages[chosen]) {
        console.error(`Language "${chosen}" is not registered in languages.`);
        selector.value = language;
        return;
    }

    language = chosen;
    await translationManager.init(language);
    translationManager.translateUI(language);

    update_translated_page_links();

    //translateUI has just done the markup. Everything else is painted imperatively
    //and only when its own panel changes, so without this the interface stays
    //visibly half translated - the tabs and stat labels turn over, the room the
    //player is standing in does not, and it keeps its old language until they walk
    //somewhere else.
    fill_character_bio();
    update_save_load_buttons();
    //The stance list takes the current stance and the favourites, which live here.
    update_displayed_stance_list(stances, current_stance);
    retranslate_interface({
        location: current_location,
        active_quest_ids: Object.keys(active_quests),
    });

    //The hero creation panel is built once and never again, so its race names and
    //tooltips would stay in the language it was built in - which on a new game is
    //always the default. No-op once the hero exists and the panel is gone.
    characterCreator.refresh_language();
}

function option_expo_threshold(option) {
    const input = document.getElementById("options_expo_threshold");

    game_options.expo_threshold = option || input.value || 0;

    if(option !== undefined) {
        input.value = option;
    }
    input.nextElementSibling.value = '1e'+game_options.expo_threshold;
}

function option_use_uncivilised_temperature_scale(option) {
    const checkbox = document.getElementById("options_use_uncivilised_temperature_scale");
    if(checkbox.checked || option) {
        game_options.use_uncivilised_temperature_scale = true;
    } else {
        game_options.use_uncivilised_temperature_scale = false;
    }

    if(option !== undefined) {
        checkbox.checked = option;
    }

    update_displayed_temperature();
}

function option_do_background_animations(option) {
    const checkbox = document.getElementById("options_do_background_animations");
    if(checkbox.checked || option) {
        game_options.do_background_animations = true;
    } else {
        game_options.do_background_animations = false;
        stop_background_animation();
        
        window.removeEventListener("resize", start_snow_animation);
        window.removeEventListener("resize", start_rain_animation);
        window.removeEventListener("resize", start_stars_animation);
    }

    if(option !== undefined) {
        checkbox.checked = option;
    }
}

function option_change_background_color(option) {
    const checkbox = document.getElementById("options_change_background_color");
    if(checkbox.checked || option) {
        game_options.change_background_color = true;
        set_light_based_background_color(!current_location.is_under_roof);
    } else {
        game_options.change_background_color = false;
        document.documentElement.style.setProperty('--background_opacity', 0);
    }

    if(option !== undefined) {
        checkbox.checked = option;
    }
}

function option_skip_play_button(option) {
    const checkbox = document.getElementById("options_skip_play_button");
    if(checkbox.checked || option) {
        game_options.skip_play_button = true;
    } else {
        game_options.skip_play_button = false;
    }
    
    if(option !== undefined) {
        checkbox.checked = option;
    }
}

function option_mofu_mofu_mode(option) {
    const checkbox = document.getElementById("options_mofu_mofu_mode");

    if(option !== undefined) {
        checkbox.checked = option;
    }

    if(checkbox.checked) {
        game_options.mofu_mofu_mode = true;
        global_flags.is_mofu_mofu_enabled = true;
    } else {
        game_options.mofu_mofu_mode = false;
        global_flags.is_mofu_mofu_enabled = false;
    }
}

function option_do_enemy_onhit_animations(option) {
    const checkbox = document.getElementById("options_do_enemy_onhit_animations");
    if(checkbox.checked || option) {
        game_options.do_enemy_onhit_animations = true;
    } else {
        game_options.do_enemy_onhit_animations = false;
    }
    
    if(option !== undefined) {
        checkbox.checked = option;
    }
}

function option_hide_max_level_skills(option) {
    const checkbox = document.getElementById("options_hide_max_level_skills");
    if(checkbox.checked || option) {
        game_options.hide_max_level_skills = true;
        document.documentElement.style.setProperty('--maxxed_skill_display', 'none');
    } else {
        game_options.hide_max_level_skills = false;
        document.documentElement.style.setProperty('--maxxed_skill_display', 'block');
    }
    
    if(option !== undefined) {
        checkbox.checked = option;
    }
}

function option_use_text_outlines_for_tooltips(option) {
    const checkbox = document.getElementById("options_tooltip_outline");
    if(checkbox.checked || option) {
        game_options.use_text_outlines_for_tooltips = true;
        document.documentElement.style.setProperty('--outline_white', document.documentElement.style.getPropertyValue("--outline_white_default"));
        document.documentElement.style.setProperty('--outline_black', document.documentElement.style.getPropertyValue("--outline_white_default"));
    } else {
        game_options.use_text_outlines_for_tooltips = false;
        document.documentElement.style.setProperty('--outline_white', '0');
        document.documentElement.style.setProperty('--outline_black', '0');
    }
    
    if(option !== undefined) {
        checkbox.checked = option;
    }
}

function option_use_text_outlines_for_bars(option) {
    const checkbox = document.getElementById("options_bar_outline");
    if(checkbox.checked || option) {
        game_options.use_text_outlines_for_bars = true;
        document.getElementById("character_xp_value").classList.add("outline_black_static");
        document.getElementById("character_stamina_value").classList.add("outline_black_static");
        document.getElementById("character_mana_value").classList.add("outline_black_static");
        document.getElementById("character_health_value").classList.add("outline_black_static");
    } else {
        game_options.use_text_outlines_for_bars = false;
        document.getElementById("character_xp_value").classList.remove("outline_black_static");
        document.getElementById("character_stamina_value").classList.remove("outline_black_static");
        document.getElementById("character_mana_value").classList.remove("outline_black_static");
        document.getElementById("character_health_value").classList.remove("outline_black_static");
    }
    
    if(option !== undefined) {
        checkbox.checked = option;
    }
}

function option_do_dynamic_loot_message(option) {
    const checkbox = document.getElementById("options_dynamic_message");
    clear_loot_information(); //reset it in both cases

    if(option !== undefined) {
        checkbox.checked = option;
    }

    if(checkbox.checked) {
        game_options.do_dynamic_loot_message = true;
    } else {
        game_options.do_dynamic_loot_message = false;
    }
}

/**
 * 
 * @param {Object} params
 * @param {Event} params.event
 * @param {Boolean} params.skip_combat used to not call start_combat function, used in loading as it's only called after 'PLAY' button is clicked
 */
/**
 * Travels somewhere, ending whatever is under way first.
 *
 * While an action or activity runs, its panel replaces the location panel, so the
 * ordinary travel lines cannot be clicked - the game's guard against leaving mid-action
 * is that there is nothing to click. The journal's hint and discovery buttons are on
 * screen the whole time, so they need the guard written down: without it the action kept
 * running while the player walked away, and its animation went on ticking at a panel
 * that was no longer there.
 *
 * end_activity is what the in-game stop button calls, so an activity still hands over
 * what it gathered rather than losing it.
 */
function travel_to(location_id) {
    if(current_activity) {
        end_activity();
    } else if(current_game_action) {
        end_game_action();
    }
    change_location({location_id});
}
function change_location({location_id, event, skip_travel_time = false, do_quest_events = true, skip_combat = false}) {
    if(event?.target.classList.contains("fast_travel_removal_button")) {
        return;
    }

    const previous_location = current_location;
    let location = locations[location_id] || current_location;

    if(location_id !== current_location?.name && location.is_finished) {
        //refuse to change location if it's finished and it's not the current one
        return;
    }

    clear_all_enemy_attack_loops();
    clear_character_attack_loop();
    clear_enemies();

    if(!location) {
        throw `No such location as "${location_id}"`;
    }

    if(do_quest_events) {
        do_quest_event({
            quest_event_type: "enter_location",
            quest_event_target: location.id,
            quest_event_count: 1,
        });
    } 

    if(typeof current_location !== "undefined" && current_location.id !== location.id){
        //so it's not called when initializing the location on page load or on reloading current location due to new unlocks
        //getName, not name: the second is the registry key, so this line read
        //"[ Village bölgesine giriliyor ]".
        log_message(translationManager.getText(language, "log entering v1", {v1: location.getName()}), "message_travel");
    }

    if(location.crafting) {
        update_displayed_crafting_recipes();
    }

    clear_loot_information();
    
    current_location = location;

    if(!pathfinder) {
        pathfinder = new Pathfinder();
        pathfinder.fill_connections(locations);
    }

    if(!travel_times[current_location.id]) {
        travel_times[current_location.id] = pathfinder.find_shortest_paths(current_location.id);
    }

    if(previous_location && !skip_travel_time) {
        progress_time({value: travel_times[previous_location.id][current_location.id], source: "travel"});
    }

    update_displayed_temperature();
    if(game_options.change_background_color) {
        set_light_based_background_color(!current_location.is_under_roof);
    }
    
    update_character_stats();

    if("connected_locations" in current_location) { 
        // basically means it's a normal location and not a combat zone (as combat zone has only "parent")
        update_displayed_normal_location(current_location);
    } else { //so if entering combat zone
        update_displayed_combat_location(current_location);
        if(!skip_combat) {
            start_combat();
        }

        if(!current_location.is_challenge) {
            game_state.last_combat_location = current_location.id;
        }
    }

    process_rewards({rewards: current_location.entrance_rewards});
}

function handle_location_icon_click() {
    if(current_location.housing && current_location.housing.is_unlocked) {
        return;
        //nothing
    } else if(favourite_locations[current_location.id]) {
        remove_location_from_favourites({location_id: current_location.id, update_choices: false});
    } else {
        add_location_to_favourites({location_id: current_location.id});
    }
}

/**
 * 
 * @param {Object} selected_activity - {id} of activity in Location's activities list??
 */
function start_activity(selected_activity) {
    current_activity = Object.assign({},current_location.activities[selected_activity]);
    current_activity.id = selected_activity;

    if(!activities[current_activity.activity_name]) {
        throw `No such activity as ${current_activity.activity_name} could be found`;
    }

    if(activities[current_activity.activity_name].type === "JOB") {
        if(!can_work(current_activity)) {
            current_activity = null;
            return;
        }
    } else if(activities[current_activity.activity_name].type === "TRAINING") {
        if(!can_work(current_activity)) {
            current_activity = null;
            return;
        }
    } else if(activities[current_activity.activity_name].type === "GATHERING") { 
        
        let has_proper_tool = !activities[current_activity.activity_name].required_tool_type || character.equipment[activities[current_activity.activity_name].required_tool_type];
        //just check if slot is not empty

        if(!has_proper_tool) {
            log_message(translationManager.getText(language, "log you need to equip a"));
            current_activity = null;
            return;
        }
        current_activity.gathered_materials = {};
    } else throw `"${activities[current_activity.activity_name].type}" is not a valid activity type!`;

    current_activity.earnings = 0;
    current_activity.gathering_time = 0;
    current_activity.gathering_time_needed = current_activity.getActivityEfficiency().gathering_time_needed;

    add_to_content_stack({content_type: "activity", data: {activity: current_activity}});

    //start_activity_display(current_activity);
}

function end_activity() {
    
    log_message(translationManager.getText(language, "log heroname finished v1", {v1: translationManager.getDisplayName(language, current_activity.activity_name)}), "activity_finished");
    
    if(current_activity.earnings) {
        log_message(translationManager.getText(language, "log heroname earned v1", {v1: format_money(current_activity.earnings)}), "activity_money");
        add_money_to_character(current_activity.earnings);
    }

    if(current_activity.gathered_materials) {
        const loot = []; 
        Object.keys(current_activity.gathered_materials).forEach(mat_key => {
            loot.push({item_id: mat_key, count: current_activity.gathered_materials[mat_key]});
        });

        if(!game_options.do_dynamic_loot_message) {
            process_current_loot({loot_list: loot, is_summary: true});
        }
    }
    end_activity_animation(); //clears the "animation"
    current_activity = null;
    clear_loot_information();
    remove_from_content_stack(content_stack_removal_options.TOP);
}

/**
 * Starts selected action, checks conditions if applicable, launches action animations
 * @param {String} action_key
 * @param {String} source either "location" or "dialogue"
 * @returns 
 */
function start_game_action(action_key, event) {
    current_game_action = action_key;
    let game_action;
    if(current_dialogue) {
        game_action = dialogues[current_dialogue].actions[action_key];
    } else{
        game_action = current_location.actions[action_key];
    }
    let conditions_status; //[0,...,1]

    add_to_content_stack({content_type:"action", data: {dialogue_key: current_dialogue, action_key: action_key}});
    //start_game_action_display(selected_action);

    if(!game_action.can_be_started(character)) {
        finish_game_action({action_key, conditions_status: -1, dialogue_key: current_dialogue});
        return;
    }
    
    if(!game_action.check_conditions_on_finish) {
        conditions_status = game_action.get_conditions_status(character);

        if(conditions_status == 0) {
            finish_game_action({action_key, conditions_status: 0, dialogue_key: current_dialogue});
            return;
        }
    }

    if(event && game_action.floating_click_effects) {
        const random_effect = game_action.floating_click_effects[Math.floor(Math.random()*game_action.floating_click_effects.length)];
        create_floating_effect(random_effect, {x: event.pageX, y: event.pageY});
    }

    if(game_action.attempt_duration > 0) {
        let current_iterations = game_action.keep_progress?game_action.accumulated_progress:0;
        const total_iterations = game_action.attempt_duration/0.1;

        game_action_tick = () => {
            if(current_iterations >= total_iterations - 1) {
                stop_game_action_interval();
                finish_game_action({action_key, conditions_status, dialogue_key: current_dialogue});
            }

            current_iterations++;
            if(game_action.keep_progress) {
                game_action.accumulated_progress = current_iterations;
            }
            update_game_action_progress_bar(current_iterations/total_iterations);
        };
        game_action_interval = setInterval(game_action_tick, game_action_period());
    } else {
        update_game_action_progress_bar(1);
        finish_game_action({action_key, conditions_status,dialogue_key: current_dialogue});
    }
}

/** How long one tenth of an action-second lasts at the current speed. */
function game_action_period() {
    return 1000 * 0.1 / tickrate;
}

function stop_game_action_interval() {
    clearInterval(game_action_interval);
    game_action_interval = undefined;
    game_action_tick = undefined;
}

/**
 * Re-arms the running game action at the current speed.
 *
 * setInterval keeps the period it was created with, so raising the speed while an
 * action was under way used to change nothing until the action was over - which is the
 * one moment the speed was no longer wanted. Progress lives in the tick's closure, so
 * swapping the interval out from under it loses nothing.
 */
function rearm_game_action_interval() {
    if(!game_action_tick) {
        return;
    }
    clearInterval(game_action_interval);
    game_action_interval = setInterval(game_action_tick, game_action_period());
}

/**
 * One line out of a failure list, or nothing when the list is empty.
 *
 * An empty array indexed at Math.floor(0 * random) is undefined, and getText prints
 * "text not found, id: undefined" where the story should be - which is what five
 * actions did on a failed roll. A missing line is a content gap and the check now
 * fails the build over it; this keeps the gap from reaching the player as a marker.
 */
function pick_failure_text(action, which) {
    const lines = action.failure_texts?.[which];
    if(!lines?.length) {
        return translationManager.getText(language, "ui action fell through");
    }
    return action.resolveText(lines[Math.floor(lines.length * Math.random())]);
}
/**
 * Handles the finish, successful or not, of a game action. Not to be mistaken for end_game_action
 * @param {String} action_key 
 * @param {Number} conditions_status
 * @param {String} dialogue_key optional, only passed if action is from dialogue instead of from location
 */
function finish_game_action({action_key, conditions_status, dialogue_key}){
    end_activity_animation(true);

    let action;
    if(dialogue_key) {
        action = dialogues[dialogue_key].actions[action_key];
    } else {
        action = current_location.actions[action_key];
    }

    if(typeof conditions_status === 'undefined') {
        if(dialogue_key) {
            conditions_status = dialogues[dialogue_key].actions[action_key].get_conditions_status(character);
        } else {
            conditions_status = current_location.actions[action_key].get_conditions_status(character);
        }
    }
    
    let result_message = translationManager.getText(language, "ui action fell through");

    if(conditions_status == -1) {
        //not meeting requirements to begin
        result_message = pick_failure_text(action, "unable_to_begin");
    } else if(conditions_status == 0) {
        //lost by failing to meet conditions, nothing to check, deal with it
        result_message = pick_failure_text(action, "conditional_loss");
    } else {
        const action_result = get_game_action_result({action_key, conditions_status, dialogue_key});
        let is_won = false;
        if(action_result > Math.random()) {
            //win

            result_message = action.getResolvedSuccessText({character});
            if(!action.repeatable) {
                lock_action({dialogue_key, location_key: current_location.id, action_key});
            } else {
                action.completion_count++;
            }
            process_rewards({rewards: action.rewards, source_type: "action", source_name: dialogue_key || current_location.id});
            is_won = true;
        } else {
            //random loss

            result_message = pick_failure_text(action, "random_loss");
        }

        Object.keys(action.conditions[0]?.items_by_id || {}).forEach(item_id => {
            //no need to check if they are in inventory, as without them action would have been conditionally failed before reaching here
            if(action.conditions[0].items_by_id[item_id].remove) {
                remove_from_character_inventory([{item_key: item_templates[item_id].getInventoryKey(), item_count: action.conditions[0].items_by_id[item_id].count}]);
            }
        });
        Object.keys(action.required.items_by_id || {}).forEach(item_id => {
            //again no need to check
            if(action.required.items_by_id[item_id].remove_on_success && is_won || action.required.items_by_id[item_id].remove_on_fail && !is_won) {
                remove_from_character_inventory([{item_key: item_templates[item_id].getInventoryKey(), item_count: action.required.items_by_id[item_id].count}]);
            }
        });

        //Money, on the same terms as items and through the same helper the reward
        //path uses, so the displayed purse follows it. money_spent decides both
        //whether and how much, because it sits next to the gate that let the action
        //start and the two have to read the shape the same way.
        const spent = money_spent(action.conditions[0], is_won) + money_spent(action.required, is_won);
        if(spent) {
            add_money_to_character(-spent);
        }
    }

    /*
        A dialogue's instant action drops straight back to the conversation below, so there
        is no result screen for a second button to sit on.
    */
    const result_screen_stays = !dialogue_key || action.attempt_duration > 0;
    update_game_action_finish_button({
        can_retry: result_screen_stays && action.offers_a_retry(character),
        action_key,
    });

    if(!dialogue_key) {
        set_game_action_finish_text(result_message);
    } else {
        pass_data_down_the_content_stack({data: {upstack_result_message: result_message}});

        if(action.attempt_duration == 0) { //if action is instant, just jump back to dialogue without bothering with display of results, leave that stuff to dialogue answer
            remove_from_content_stack(content_stack_removal_options.TOP);
        }
    }
}

/**
 * Runs the same action again from its own result screen (P-34).
 *
 * Ends the finished attempt first so the content stack does not grow one action box per try;
 * `current_dialogue` is untouched by that, so a dialogue's action repeats inside its
 * conversation and a location's inside the location.
 *
 * Nothing is skipped or discounted - this is the same call the location list makes, so every
 * requirement is checked and every cost charged exactly as on a first attempt.
 */
function retry_game_action(action_key) {
    end_game_action();
    start_game_action(action_key);
}

/**
 * Handles quitting a game action, no matter the results. Not to be mistaken for finish_game_action which deals with what happens on timer finish (and with the results)
 */
function end_game_action() {
    end_activity_animation();
    stop_game_action_interval();
    current_game_action = null;
    remove_from_content_stack(content_stack_removal_options.TOP);
}

/**
 * 
 * @param {String} action_key 
 * @param {Number} conditions_status assumed to be more than 0
 * @param {String} dialogue_key
 * @returns {Boolean} did_succeed
 */
function get_game_action_result({action_key, conditions_status, dialogue_key}) {
    let action;
    if(dialogue_key) {
        action = dialogues[dialogue_key].actions[action_key];
    } else {
        action = current_location.actions[action_key];
    }
    if(action.success_chances.length == 1) {
        return action.success_chances[0];
    } else if(conditions_status == 1 && action.success_chances[1]) {
        return action.success_chances[1];
    } else {
        return action.success_chances[0] + (action.success_chances[1]-action.success_chances[0]) * conditions_status;
    }
}

/**
 * @description Globally unlocks an activity and adds a proper message to the message log, local children might still need to be unlocked separately. NOT called on loading a save.
 * @param {String} activity_id
 */
function unlock_global_activity({activity_id}) {
    if(!activities[activity_id].is_unlocked){
        activities[activity_id].is_unlocked = true;
        
        let message = "";
        if(activities[activity_id].unlock_text) {
           message = rtp(activities[activity_id].unlock_text)+":\n";
        }
        log_message(message + translationManager.getText(language, "log gained the ability of", {v1: activities[activity_id].getName()}), "activity_unlocked");
    }
}

/**
 * @description Unlocks an activity and adds a proper message to the message log
 * @param {Object} activity_data {activity, location_name}
 */
function unlock_activity(activity_data) {
    if(!activity_data.activity.is_unlocked){
        activity_data.activity.is_unlocked = true;
        
        if(!activity_data.skip_message) {
            let message = "";
            if(locations[activity_data.location].activities[activity_data.activity.activity_id].unlock_text) {
                message = locations[activity_data.location].activities[activity_data.activity.activity_id].getUnlockText()+":\n";
            }

            if(
                (activities[activity_data.activity.activity_name].type !== "GATHERING" || global_flags.is_gathering_unlocked) 
                && 
                activities[activity_data.activity.activity_name].is_unlocked
                &&
                activities[activity_data.activity.activity_name].base_skills_names.filter(skill_id => skills[skill_id].is_unlocked).length > 0
            ) {
                log_message(message + translationManager.getText(language, "log unlocked activity in location", {v1: translationManager.getDisplayName(language, activity_data.activity.activity_name), v2: translationManager.getDisplayName(language, activity_data.location)}), "activity_unlocked");
            }
        }
        
    }
}

function unlock_action(action_data) {
    if(!action_data.action.is_unlocked) {
        action_data.action.is_unlocked = true;
        
        if(!action_data.skip_message) {
            let message = "";
            if(action_data.location) {
                if(locations[action_data.location].actions[action_data.action.action_id].unlock_text) {
                    message = locations[action_data.location].actions[action_data.action.action_id].getUnlockText()+":\n";
                    log_message(message + translationManager.getText(language, "log unlocked action in location", {v1: action_data.action.getActionName(), v2: translationManager.getDisplayName(language, action_data.location)}), "activity_unlocked");
                }
            } else if(action_data.dialogue) {
                if(dialogues[action_data.dialogue].actions[action_data.action.action_id].unlock_text) {
                    message = dialogues[action_data.dialogue].actions[action_data.action.action_id].getUnlockText()+":\n";
                    log_message(message + translationManager.getText(language, "log unlocked action with", {v1: action_data.action.getActionName(), v2: translationManager.getDisplayName(language, action_data.dialogue)}), "activity_unlocked");
                }
            }
        }
    }
}

function lock_action({location_key, dialogue_key, action_key}) {
    if(dialogue_key) {
        dialogues[dialogue_key].actions[action_key].is_finished = true;
    } else  {
        locations[location_key].actions[action_key].is_finished = true;
    }
}

function add_money_to_character(money_num) {
    character.money += money_num;
    update_displayed_money();
}

/**
 * @description Handles health change from beneficial and harmful sources
 * @param {Object} params
 * @param {Number} params.ammount 
 * @param {Boolean} params.add_xp 
 * @param {Number} params.xp_to_add skippable
 * @returns 
 */
function update_health({ammount_to_restore = 0, ammount_to_loose = 0, add_xp = true} = {}) {
    if(!ammount_to_restore && !ammount_to_loose) {
        //no change, nothing to do
        return;
    }

    //actual change: smaller between missing and balance of lose/restoration
    const actual_health_change = Math.min(character.stats.full.max_health - character.stats.full.health, ammount_to_restore-ammount_to_loose);
    //actual healing: smaller between missing+lose and restoration
    const actual_healing_done = Math.min(character.stats.full.max_health - character.stats.full.health + ammount_to_loose, ammount_to_restore);

    //anything changed - update health and display
    if(actual_health_change) {
        character.stats.full.health += actual_health_change;

        update_displayed_health();
    }

    //anything actually healed - add xp
    if(actual_healing_done && add_xp && actual_healing_done > 0) {
        add_xp_to_skill({skill: skills["Regeneration"], xp_to_add: actual_healing_done});
    }

    //out of hp - set hp to 0, kill
    if(character.stats.full.health <= 0) {
        character.stats.full.health = 0;
        kill_player({is_combat: "parent_location" in current_location});
    }
}

//single tick of resting
function do_resting() {
    if(character.stats.full.health < character.stats.full.max_health) {
        const resting_heal_ammount =  Math.round(Math.max(character.stats.full.max_health * 0.01, 2) * (1 + 3*get_total_skill_level("Regeneration")/skills["Regeneration"].max_level));

        update_health({ammount_to_restore: resting_heal_ammount});
    }

    if(character.stats.full.stamina < character.stats.full.max_stamina) {
        const resting_stamina_ammount = Math.round(Math.max(character.stats.full.max_stamina/120, 2));
        //todo: scale it with skill as well

        character.stats.full.stamina += (resting_stamina_ammount);
        if(character.stats.full.stamina > character.stats.full.max_stamina) {
            character.stats.full.stamina = character.stats.full.max_stamina;
        } 
        
        update_displayed_stamina();
    }
}

function do_sleeping() {
    if(character.stats.full.health < character.stats.full.max_health) {
        const sleeping_heal_ammount = Math.round(Math.max(character.stats.full.max_health * 0.04, 5) * (1 + get_total_skill_level("Sleeping")/skills["Sleeping"].max_level) * (1 + 3*get_total_skill_level("Regeneration")/skills["Regeneration"].max_level));
        
        update_health({ammount_to_restore: sleeping_heal_ammount});
    }

    if(character.stats.full.stamina < character.stats.full.max_stamina) {
        const sleeping_stamina_ammount = Math.round(Math.max(character.stats.full.max_stamina/30, 5) * (1 + get_total_skill_level("Sleeping")/skills["Sleeping"].max_level));

        character.stats.full.stamina += (sleeping_stamina_ammount);
        if(character.stats.full.stamina > character.stats.full.max_stamina) {
            character.stats.full.stamina = character.stats.full.max_stamina;
        } 
        update_displayed_stamina();
    }
}

function start_sleeping() {
    start_sleeping_display();
    is_sleeping = true;

    game_state.last_location_with_bed = current_location.id;
}

function end_sleeping() {
    is_sleeping = false;
    change_location({location_id: current_location.id, skip_travel_time: true});
    end_activity_animation();
}

function start_reading(book_key) {
    
    const book_id = is_JSON(book_key)?JSON.parse(book_key).id:book_key;
    if(current_location?.parent_location) {
        return; //no reading in combat areas
    }

    if(is_reading === book_id) {
        end_reading();
        return; 
        //reading the same one, cancel
    } else if(is_reading) {
        end_reading();
    }

    if(book_stats[book_id].is_finished) {
        return; //already read
    }

    /*
        A book may ask for a skill (Q-12). Reading needs nothing in general - that is what a
        book is for - but a mastery book is about a skill at a level its reader has to have
        reached, and asking for it is the point of the series.

        Refused with a sentence naming what it wants, not hidden: this project's rule is that
        a locked door nobody can see is not a goal. The book stays in the bag and stays
        clickable, and clicking it says why not yet.
    */
    const wanted = book_stats[book_id].required_skills || {};
    const short_of = Object.keys(wanted).find(skill_id =>
        (skills[skill_id]?.current_level ?? 0) < wanted[skill_id]);
    if(short_of) {
        log_message(translationManager.getText(language, "log book needs skill", {
            v1: translationManager.getDisplayName(language, short_of),
            v2: wanted[short_of],
        }), "notification");
        return;
    }

    if(is_sleeping) {
        end_sleeping();
    }
    if(current_activity) {
        end_activity();
    }


    is_reading = book_id;
    start_reading_display(book_id);

    update_displayed_book(is_reading);
}

function end_reading() {
    change_location({location_id: current_location.id, skip_travel_time: true});
    end_activity_animation();
    
    const book_id = is_reading;
    is_reading = null;

    update_displayed_book(book_id);
}

function do_reading() {
    item_templates[is_reading].addProgress();

    update_displayed_book(is_reading);
    const book = book_stats[is_reading];
    add_xp_to_skill({skill: skills["Literacy"], xp_to_add: book.literacy_xp_rate});

    if(book.is_finished) {
        log_message(translationManager.getText(language, "log finished the book v1", {v1: is_reading}));
        update_booklist_entry(is_reading, true);
        end_reading();

        character.stats.add_book_bonus(book.bonuses);
        update_character_stats();
        process_rewards({rewards: book.rewards});
    }
}

function get_current_book() {
    return is_reading;
}

/**
 * 
 * @param {*} selected_activity location activity property (job or training)
 * @returns if current time is within working hours
 */
function can_work(selected_activity) {
    //if can start at all
    if(!selected_activity.infinite) {
        if(selected_activity.availability_time){
            if(selected_activity.availability_time.end > selected_activity.availability_time.start) {
                //ends on the same day
                if(current_game_time.hour * 60 + current_game_time.minute > selected_activity.availability_time.end*60
                    ||  //too late
                    current_game_time.hour * 60 + current_game_time.minute < selected_activity.availability_time.start*60
                    ) {  //too early
                    
                    return false;
                }
                if(!selected_activity.availability_seasons?.includes(current_game_time.getSeason())) {
                    //can't be done in current season
                    return false;
                }  
            } else { //ends on the next day (i.e. working through the night)
                if(!selected_activity.availability_seasons?.includes(current_game_time.getSeason(1))) {
                    //ends on new season during which it's not available
                    return false;
                }  

                if(current_game_time.hour * 60 + current_game_time.minute > selected_activity.availability_time.start*60
                    //too late
                    ||
                    current_game_time.hour * 60 + current_game_time.minute < selected_activity.availability_time.end*60
                    //too early

                ) {  
                    return false;
                }
            }
        } else {
            if(!selected_activity.availability_seasons?.includes(current_game_time.getSeason())) {
                //can't be done in current season
                return false;
            }  
        }
    }

    return true;
}

/**
 * 
 * @param {} selected_job location job property
 * @returns if there's enough time to earn anything
 */
function enough_time_for_earnings(selected_job) {

    if(!selected_job.infinite) {
        //if enough time for at least 1 working period
        if(selected_job.availability_time.end > selected_job.availability_time.start) {
            //ends on the same day
            if(current_game_time.hour * 60 + current_game_time.minute + selected_job.gathering_time_needed - selected_job.gathering_time%selected_job.gathering_time_needed > selected_job.availability_time.end*60
                ||  //not enough time left for another work period
                current_game_time.hour * 60 + current_game_time.minute < selected_job.availability_time.start*60
                ) {  //too early to start (shouldn't be allowed to start and get here at all)
                return false;
            }
        } else {
            //ends on the next day (i.e. working through the night)
  
            if(!selected_job.availability_time.includes(current_game_time.getSeason(1))) {
                //ends on new season during which it's not available
                return false;
            } 

            if(current_game_time.hour * 60 + current_game_time.minute > selected_job.availability_time.start*60
                //timer is past the starting hour, so it's the same day as job starts
                && 
                current_game_time.hour * 60 + current_game_time.minute + selected_job.working_period  - selected_job.gathering_time%selected_job.gathering_time_needed > selected_job.availability_time.end*60 + 24*60
                //time available on this day + time available on next day are less than time needed
                ||
                current_game_time.hour * 60 + current_game_time.minute < selected_job.availability_time.start*60
                //timer is less than the starting hour, so it's the next day
                &&
                current_game_time.hour * 60 + current_game_time.minute + selected_job.working_period  - selected_job.gathering_time%selected_job.gathering_time_needed > selected_job.availability_time.end*60
                //time left on this day is not enough to finish
                ) {  
                return false;
            }
        }
    }

    return true;
}

/**
 * 
 * @param {String} dialogue_key 
 */
function start_dialogue(dialogue_key) {
    add_to_content_stack({content_type: "dialogue", data: {dialogue_key: dialogue_key}});
}

function end_dialogue() {
    current_dialogue = null;
    remove_from_content_stack(content_stack_removal_options.TOP);
}

function reload_normal_location() {
    update_displayed_normal_location(current_location);
}

/**
 * 
 * @param {String} textline_key 
 */
function start_textline(textline_key){
    const dialogue = dialogues[current_dialogue];
    const textline = dialogue.textlines[textline_key];

    //Before the rewards, which can lock this very line: what matters is that it was
    //read, and this is the only place in the game where that is true.
    textline.is_heard = true;
    game_state.lore_last = {dialogue: current_dialogue, textline: textline_key};
    /*
        And the lore panel, if it is open. Same case as a pickup and the Discoveries panel
        (P-31): the panel is rebuilt when its tab opens and was not while it was already
        open, so a line heard with the journal on screen did not appear until the player
        switched tabs.
    */
    refresh_open_journal_panels();

    process_rewards({rewards: textline.rewards, source_type: "textline", inform_textline: false, source_name: current_dialogue})

    if(textline.otherUnlocks) {
        textline.otherUnlocks();
    }

    
    //start_dialogue(current_dialogue);
    let text = get_textline_answer(textline);

    /*
        A very stupid easter egg that totally won't be annoying: a 1% chance for one word
        of the answer to come out as "rat", if the hero's name says as much.

        It has to work on the sentence, not on the id above it - splitting an id on
        spaces and swapping a word made an id that resolves to nothing, so the egg used
        to replace the whole answer with "text not found" rather than one word with a
        rodent.
    */
    let text_is_resolved = false;
    if(is_rat() && Math.random() <= 0.01) {
        const words = translationManager.getText(language, text).split(" ");
        const index = Math.floor(words.length * Math.random());
        words[index] = translationManager.getText(language, "ui easter egg rat");
        text = words.join(" ");
        text_is_resolved = true;
    }

    if(textline.branches_into?.length) {
        fill_action_box({content_type: "dialogue_branch", data: {text, text_is_resolved, dialogue_key: current_dialogue, textlines: textline.branches_into}});
    } else {
        fill_action_box({content_type: "dialogue_answer", data: {text, text_is_resolved, dialogue_key: current_dialogue}});
    }
}

/**
 * Attaches some context to textline's .getText()
 * @param {Textline} textline 
 * @returns textline answer
 */
function get_textline_answer(textline) {
    return textline.getText({
            season: current_game_time.getSeason(),
            //to be expanded with more stuff when needed
        });
}

function unlock_combat_stance(stance_id) {
    if(!stances[stance_id]) {
        console.warn(`Tried to unlock stance "${stance_id}", but no such stance exists!`);
        return;
    }

    if(!stances[stance_id].is_unlocked) {
        log_message(translationManager.getText(language, "log you have learned a new", {v1: stances[stance_id].getName()}), "location_unlocked");
    }
    stances[stance_id].is_unlocked = true;
    update_displayed_stance_list(stances, current_stance);
}

function change_stance({stance_id, is_temporary = false}) {
    if(is_temporary) {
        if(!stances[stance_id]) {
            throw new Error(`No such stance as "${stance_id}"`);
        }
        if(!stances[stance_id].is_unlocked) {
            throw new Error(`Stance "${stance_id}" is not yet unlocked!`);
        }

    } else {
        selected_stance = stances[stance_id];
        update_displayed_stance(selected_stance);
    }
    
    current_stance = stances[stance_id];

    update_character_stats();
    if(current_enemies) {
        reset_combat_loops(true); //param will be used to award 'Persistence' xp only when change was due to low stamina and not to a player click
        update_displayed_enemies();
    }
}

/**
 * @description handle faving/unfaving of stances
 * @param {String} stance_id 
 */
function fav_stance(stance_id) {
    if(faved_stances[stance_id]) {
        delete faved_stances[stance_id];
    } else if(stances[stance_id].is_unlocked){
        faved_stances[stance_id] = true;
    } else {
        console.warn(`Tried to fav a stance '${stance_id}' despite it not being unlocked!`);
    }
    update_displayed_faved_stances(stances);
}

/**
 * @description sets attack cooldowns and new enemies, either from provided list or from current location, called whenever a new enemy group starts
 * @param {List<Enemy>} enemies 
 */
function set_new_combat({enemies} = {}) {
    if(!current_location.get_next_enemies){
        clear_all_enemy_attack_loops();
        clear_character_attack_loop();
        return;
    }

    //remove animations
    for(let i = 0; i < current_enemies?.length; i++) {
        remove_enemy_onhit_animation(i);
    }

    current_enemies = enemies || current_location.get_next_enemies();
    clear_all_enemy_attack_loops();

    let character_attack_cooldown = 1/(character.stats.full.attack_speed);
    enemy_attack_cooldowns = [...current_enemies.map(x => 1/x.stats.attack_speed)];

    let fastest_cooldown = [character_attack_cooldown, ...enemy_attack_cooldowns].sort((a,b) => a - b)[0];

    //scale all attacks to be not faster than 1 per second
    if(fastest_cooldown < 1) {
        const cooldown_multiplier = 1/fastest_cooldown;
        
        character_attack_cooldown *= cooldown_multiplier;
        for(let i = 0; i < current_enemies.length; i++) {
            enemy_attack_cooldowns[i] *= cooldown_multiplier;
            enemy_timer_variance_accumulator[i] = 0;
            enemy_timer_adjustment[i] = 0;
            enemy_timers[i] = [Date.now(), Date.now()];
        }
    } else {
        for(let i = 0; i < current_enemies.length; i++) {
            enemy_timer_variance_accumulator[i] = 0;
            enemy_timer_adjustment[i] = 0;
            enemy_timers[i] = [Date.now(), Date.now()];
        }
    }
    character_timer_variance_accumulator = 0;
    character_timer_adjustment = 0;
    character_timers = [Date.now(), Date.now()];

    //attach loops and animations
    for(let i = 0; i < current_enemies.length; i++) {
        if(game_options.do_enemy_onhit_animations) {
            do_enemy_onstart_animation(i);
        }
        
        do_enemy_attack_loop(i, 0, true);
    }

    set_character_attack_loop({base_cooldown: character_attack_cooldown});
    
    update_displayed_enemies();
    update_displayed_health_of_enemies();
}

/**
 * @description Recalculates attack speeds;
 * 
 * For enemies, modifies their existing cooldowns, for hero it restarts the attack bar with a new cooldown 
 */
function reset_combat_loops(skip_persistence_xp_for_stance_change) {
    if(!current_enemies) { 
        return;
    }

    let character_attack_cooldown = 1/(character.stats.full.attack_speed);
    enemy_attack_cooldowns = [...current_enemies.map(x => 1/x.stats.attack_speed)];

    let fastest_cooldown = [character_attack_cooldown, ...enemy_attack_cooldowns].sort((a,b) => a - b)[0];

    //scale all attacks to be not faster than 1 per second
    if(fastest_cooldown < 1) {
        const cooldown_multiplier = 1/fastest_cooldown;
        character_attack_cooldown *= cooldown_multiplier;
        for(let i = 0; i < current_enemies.length; i++) {
            enemy_attack_cooldowns[i] *= cooldown_multiplier;
        }
    }

    set_character_attack_loop({base_cooldown: character_attack_cooldown, skip_persistence_xp_for_stance_change});
}

/**
 * @description Creates an Interval responsible for performing the attack loop of enemy and updating their attack_bar progress
 * @param {*} enemy_id 
 * @param {*} cooldown 
 */
function do_enemy_attack_loop(enemy_id, count, is_new = false) {
    count = count || 0;
    update_enemy_attack_bar(enemy_id, count/60);

    if(is_new) {
        enemy_timer_variance_accumulator[enemy_id] = 0;
        enemy_timer_adjustment[enemy_id] = 0;
    }

    clearTimeout(enemy_attack_loops[enemy_id]);
    enemy_attack_loops[enemy_id] = setTimeout(() => {
        enemy_timers[enemy_id][0] = Date.now();
        enemy_timer_variance_accumulator[enemy_id] += ((enemy_timers[enemy_id][0] - enemy_timers[enemy_id][1]) - enemy_attack_cooldowns[enemy_id]*1000/(60*tickrate));

        enemy_timers[enemy_id][1] = Date.now();
        update_enemy_attack_bar(enemy_id, count/60);
        count++;
        if(count >= 60) {
            count = 0;
            do_enemy_combat_action(enemy_id);
        }
        do_enemy_attack_loop(enemy_id, count);

        if(enemy_timer_variance_accumulator[enemy_id] <= maximum_time_correction/tickrate && enemy_timer_variance_accumulator[enemy_id] >= -maximum_time_correction/tickrate) {
            enemy_timer_adjustment[enemy_id] = enemy_timer_variance_accumulator[enemy_id];
        } else {
            if(enemy_timer_variance_accumulator[enemy_id] > maximum_time_correction/tickrate) {
                enemy_timer_adjustment[enemy_id] = maximum_time_correction/tickrate;
            }
            else {
                if(enemy_timer_variance_accumulator[enemy_id] < -maximum_time_correction/tickrate) {
                    enemy_timer_adjustment[enemy_id] = -maximum_time_correction/tickrate;
                }
            }
        } //limits the maximum correction, just to be safe

    }, enemy_attack_cooldowns[enemy_id]*1000/(60*tickrate) - enemy_timer_adjustment[enemy_id]);
}

function clear_enemy_attack_loop(enemy_id) {
    clearTimeout(enemy_attack_loops[enemy_id]);
}

/**
 * 
 * @param {Number} base_cooldown basic cooldown based on attack speeds of enemies and character (ignoring stamina penalty) 
 * @param {String} attack_type type of attack, not yet implemented
 */
function set_character_attack_loop({base_cooldown, skip_persistence_xp_for_stance_change}) {
    clear_character_attack_loop();

    //little safety, as this function would occasionally throw an error due to not having any enemies left 
    //(can happen on forced leave after first win)
    if(!current_enemies) {
        return;
    }

    //tries to switch stance back to the one that was actually selected if there's enough stamina, otherwise tries to switch stance to "normal" if not enough stamina
    if(character.stats.full.stamina >= (selected_stance.stamina_cost / character.stats.full.stamina_efficiency)){ 
        if(selected_stance.id !== current_stance.id) {
            change_stance({stance_id: selected_stance.id});
            return;
        }
    } else if(current_stance.id !== "normal") {
        change_stance({stance_id: "normal", is_temporary: true});
        return;
    }

    let target_count = current_stance.target_count;
    if(target_count > 1 && current_stance.related_skill) {
        target_count = target_count + Math.round(target_count * get_total_skill_level(current_stance.related_skill)/skills[current_stance.related_skill].max_level);
    }

    if(current_stance.randomize_target_count) {
        target_count = Math.floor(Math.random()*target_count) || 1;
    }

    let targets = [];
    const alive_targets = current_enemies.filter(enemy => enemy.is_alive).slice(-target_count);

    while(alive_targets.length>0) {
        targets.push(alive_targets.pop());
    }

    use_stamina({stamina_to_use: current_stance.stamina_cost, skip_persistence_xp_for_stance_change});
    let actual_cooldown = base_cooldown / character.get_stamina_multiplier();

    let attack_power = character.get_attack_power();
    do_character_attack_loop({base_cooldown, actual_cooldown, attack_power, targets, target_count});
}

/**
 * @description updates character's attack bar, performs combat action when it reaches full
 * @param {Number} base_cooldown 
 * @param {Number} actual_cooldown 
 * @param {String} attack_power 
 * @param {String} attack_type 
 */
function do_character_attack_loop({base_cooldown, actual_cooldown, attack_power, targets, count = 0, is_new = true, target_count = 1, do_quest_events = true}) {
    update_character_attack_bar(count/60);

    if(is_new) {
        character_timer_variance_accumulator = 0;
        character_timer_adjustment = 0;
    }

    clear_character_attack_loop();
    character_attack_loop = setTimeout(() => {
        character_timers[0] = Date.now();
        character_timer_variance_accumulator += ((character_timers[0] - character_timers[1]) - actual_cooldown*1000/(60*tickrate));

        character_timers[1] = Date.now();
        update_character_attack_bar(count/60);
        count++;
        if(count >= 60) {
            count = 0;
            let leveled = false;

            for(let i = 0; i < targets.length; i++) {
                do_character_combat_action({target: targets[i], attack_power, target_count: targets.length});
            }

            if(current_stance.related_skill) {
                leveled = add_xp_to_skill({skill: skills[current_stance.related_skill], xp_to_add: targets.reduce((sum,enemy)=>sum+enemy.xp_value,0)/targets.length});
                
                if(leveled) {
                    update_stance_tooltip(current_stance);
                    update_character_stats();
                }
            }

            if(current_enemies.filter(enemy => enemy.is_alive).length != 0) { //set next loop if there's still an enemy left;
                set_character_attack_loop({base_cooldown});
            } else { //all enemies defeated, do relevant things and set new combat
                current_location.enemy_groups_killed += 1;
                if(current_location.enemy_groups_killed > 0 && current_location.enemy_groups_killed % current_location.enemy_count == 0) {
                    get_location_rewards(current_location);

                    if(do_quest_events) {
                        do_quest_event({
                            quest_event_type: "clear",
                            quest_event_target: current_location.id,
                            quest_event_count: 1,
                        });
                    }
                }
                update_location_kill_count(current_location);
                set_new_combat();
            }
        } else {
            do_character_attack_loop({base_cooldown, actual_cooldown, attack_power, targets, target_count, count, is_new: false});
        }

        if(character_timer_variance_accumulator <= maximum_time_correction/tickrate && character_timer_variance_accumulator >= -maximum_time_correction/tickrate) {
            character_timer_adjustment = character_timer_variance_accumulator;
        } else {
            if(character_timer_variance_accumulator > maximum_time_correction/tickrate) {
                character_timer_adjustment = maximum_time_correction/tickrate;
            }
            else {
                if(character_timer_variance_accumulator < -maximum_time_correction/tickrate) {
                    character_timer_adjustment = -maximum_time_correction/tickrate;
                }
            }
        } //limits the maximum correction, just to be safe
    }, actual_cooldown*1000/(60*tickrate) - character_timer_adjustment);
}

function clear_character_attack_loop() {
    clearTimeout(character_attack_loop);
}

function clear_all_enemy_attack_loops() {
    Object.keys(enemy_attack_loops).forEach((key) => {
        clearTimeout(enemy_attack_loops[key]);
    });
}

function start_combat() {
    if(current_enemies == null) {
        set_new_combat();
    }
}

/**
 * performs a single combat action (that is attack, as there isn't really any other kind for now),
 * called when attack cooldown finishes
 * 
 * @param {String} attacker id of enemy
*/ 
function do_enemy_combat_action(enemy_id) {
    
    /*
    tiny workaround, as character being defeated while facing multiple enemies,
    sometimes results in enemy attack animation still finishing before character retreats,
    launching this function and causing an error
    */
    if(!current_enemies) { 
        return;
    }

    const enemy_count_xp_mod = current_enemies.filter(enemy => enemy.is_alive).length**(2/3);
    
    const attacker = current_enemies[enemy_id];

    let evasion_chance_modifier = current_enemies.filter(enemy => enemy.is_alive).length**(-1/3); //down to .5 if there's full 8 enemies (multiple attackers make it harder to evade attacks)
    let defense_modifier = 0;
    
    Object.keys(attacker.tags).forEach(enemy_tag => {
        if(enemy_tag_to_skill_mapping[enemy_tag]) {
            for(let i = 0; i < enemy_tag_to_skill_mapping[enemy_tag].length; i++) {
                const skill = skills[enemy_tag_to_skill_mapping[enemy_tag][i]];
                add_xp_to_skill({skill, xp_to_add: attacker.xp_value/enemy_count_xp_mod});
                const {modifier_to_evasion, modifier_to_defense} = skill.get_stat_modifiers();
                evasion_chance_modifier *= modifier_to_evasion || 1;
                defense_modifier += modifier_to_defense || 1;
            }
        }
    });

    const enemy_base_damage = attacker.stats.attack;

    let damages_dealt = [];

    let critted = false;

    let partially_blocked = false; //only used for combat info in message log

    for(let i = 0; i < attacker.stats.attack_count; i++) {
        damages_dealt.push(enemy_base_damage * (1.2 - Math.random() * 0.4)); //basic 20% deviation for damage
    }

    damages_dealt = damages_dealt.sort((a,b)=>b-a);
    
    let blocked_by_shield = false;

    if(character.equipment["off-hand"]?.offhand_type === "shield") { //HAS SHIELD
        if(character.stats.full.block_chance > Math.random()) {//BLOCKED THE ATTACK

            if(!character.equipment["off-hand"].tags["ignore_skill"]){
                damages_dealt = damages_dealt.map(x => x*(1-get_total_skill_level("Shield blocking")/100));
            }

            add_xp_to_skill({skill: skills["Shield blocking"], xp_to_add: attacker.xp_value/enemy_count_xp_mod});
            const blocked = character.equipment["off-hand"].getShieldStrength() * (character.equipment["off-hand"].tags.ignore_skill?1:character.stats.total_multiplier.block_strength);

            if(blocked > damages_dealt[0]) {
                log_message(translationManager.getText(language, "log heroname blocked an attack"), "hero_blocked");
                return; //damage fully blocked, nothing more can happen 
            } else {
                damages_dealt = damages_dealt.map(val => Math.max(0,val-blocked));
                partially_blocked = true;
                blocked_by_shield = true;
            }
         } else {
            add_xp_to_skill({skill: skills["Shield blocking"], xp_to_add: attacker.xp_value/(2*enemy_count_xp_mod)});
         }
    }

    /*
        An attack the shield did not stop still gets dodged, if the character is quick
        enough. This used to be the else-branch of the shield check, so carrying a
        shield removed the dodge outright - and base_block_chance is 0.75, which means a
        starter shield turned three quarters of the attacks into "reduced by the shield's
        strength" and handed the remaining quarter a free full hit. A shield whose
        strength is smaller than the damage it faces was therefore strictly worse than
        carrying nothing at all.

        An attack that WAS blocked skips this: it connected with the shield, so there is
        nothing left to dodge.
    */
    if(!blocked_by_shield) {
        const hit_chance = get_hit_chance(attacker.stats.dexterity * Math.sqrt(attacker.stats.intuition ?? 1), character.stats.full.evasion_points*evasion_chance_modifier);

        if(hit_chance < Math.random()) { //EVADED ATTACK
            const xp_to_add = character.wears_armor() ? attacker.xp_value : attacker.xp_value * 1.5;
            //50% more evasion xp if going without armor
            add_xp_to_skill({skill: skills["Evasion"], xp_to_add: xp_to_add/enemy_count_xp_mod});
            log_message(translationManager.getText(language, "log heroname evaded an attack"), "enemy_missed");
            return; //damage fully evaded, nothing more can happen
        } else {
            add_xp_to_skill({skill: skills["Evasion"], xp_to_add: attacker.xp_value/(2*enemy_count_xp_mod)});
        }
    }

    run_stats.total_hits_taken++;
    if(config.enemy_crit_chance > Math.random()){
        damages_dealt = damages_dealt.map(val => val*config.enemy_crit_damage);
        critted = true;
        run_stats.total_crits_taken++;
    }

    if(!character.wears_armor()) //no armor so either completely naked or in things with 0 def
    {
        add_xp_to_skill({skill: skills["Iron skin"], xp_to_add: attacker.xp_value/enemy_count_xp_mod});
    } 
    
    let {damage_taken, fainted} = character.take_damage({damage_values: damages_dealt, defense_modifier});

    add_xp_to_skill({skill: skills["Fortitude"], xp_to_add: (damage_taken**0.6)/enemy_count_xp_mod});

    const hit_count_msg = damages_dealt.length > 1?` x${damages_dealt.length}`:"";

    if(critted) {
        if(partially_blocked) {
            log_message(translationManager.getText(language, "log hero partially blocked critically hit", {v1: hit_count_msg, v2: Math.ceil(10*damage_taken)/10}), "hero_attacked_critically");
        } 
        else {
            log_message(translationManager.getText(language, "log hero critically hit", {v1: hit_count_msg, v2: Math.ceil(10*damage_taken)/10}), "hero_attacked_critically");
        }
    } else {
        if(partially_blocked) {
            log_message(translationManager.getText(language, "log hero partially blocked hit", {v1: hit_count_msg, v2: Math.ceil(10*damage_taken)/10}), "hero_attacked");
        }
        else {
            log_message(translationManager.getText(language, "log hero hit", {v1: hit_count_msg, v2: Math.ceil(10*damage_taken)/10}), "hero_attacked");
        }
    }

    attacker.on_hit(character);

    if(fainted) {
        kill_player();
        return;
    }

    update_displayed_health();
}

function do_character_combat_action({target, attack_power, target_count}) {
    const hero_base_damage = attack_power;

    const groupsize_xp_multiplier = current_enemies.length**0.3334;

    let damage_dealt;
    
    let critted = false;
    
    let hit_chance_modifier = current_enemies.filter(enemy => enemy.is_alive).length**(-1/4); // down to ~ 60% if there's full 8 enemies
    let damage_modifier = 1;
    
    add_xp_to_skill({skill: skills["Combat"], xp_to_add: target.xp_value*groupsize_xp_multiplier/target_count});

    Object.keys(target.tags).forEach(enemy_tag => {
        if(enemy_tag_to_skill_mapping[enemy_tag]) {
            for(let i = 0; i < enemy_tag_to_skill_mapping[enemy_tag].length; i++) {
                const skill = skills[enemy_tag_to_skill_mapping[enemy_tag][i]];
                add_xp_to_skill({skill, xp_to_add: target.xp_value*groupsize_xp_multiplier/target_count});
                const {modifier_to_damage, modifier_to_hit_chance} = skill.get_stat_modifiers();
                hit_chance_modifier *= modifier_to_hit_chance || 1;
                damage_modifier *= modifier_to_damage || 1;
            }
        }
    });

    const hit_chance = get_hit_chance(character.stats.full.attack_points * hit_chance_modifier, target.stats.agility * Math.sqrt(target.stats.intuition ?? 1));

    if(hit_chance > Math.random()) {//hero's attack hits

        run_stats.total_hits_done++;
        if(character.equipment.weapon != null) {
            //if has weapon
            damage_dealt = Math.round(10 * damage_modifier * hero_base_damage * (1.2 - Math.random() * 0.4))/10;

            add_xp_to_skill({skill: skills[weapon_type_to_skill[character.equipment.weapon.weapon_type]], xp_to_add: target.xp_value*groupsize_xp_multiplier/target_count});

        } else {
            //if has no weapon
            damage_dealt = Math.round(10 * hero_base_damage * (1.2 - Math.random() * 0.4) )/10;
            add_xp_to_skill({skill: skills['Unarmed'], xp_to_add: target.xp_value*groupsize_xp_multiplier/target_count});
        }
        //small randomization by up to 20%, then bonus from skill

        if(game_options.do_enemy_onhit_animations) {
            const enemy_id = current_enemies.findIndex(enemy => enemy===target);
            do_enemy_onhit_animation(enemy_id);
        }
        if(character.stats.full.crit_rate > Math.random()) {
            damage_dealt = Math.round(10*damage_dealt * character.stats.full.crit_multiplier)/10;
            critted = true;
            run_stats.total_crits_done++;
            add_xp_to_skill({skill: skills['Perception'], xp_to_add: 1/target_count}); //gains unaffected by damage nor by enemy xp value
        }
        else {
            critted = false;
        }
        
        damage_dealt = Math.ceil(10*Math.max(damage_dealt - Math.max(0,target.stats.defense-character.stats.full.armor_penetration), damage_dealt*0.1, 1))/10;

        target.stats.health -= damage_dealt;
        if(damage_dealt > run_stats.strongest_hit) {
            run_stats.strongest_hit = damage_dealt;
        }
        if(critted) {
            log_message(translationManager.getText(language, "log target critically hit", {v1: target.getName(), v2: damage_dealt}), "enemy_attacked_critically");
        }
        else {
            log_message(translationManager.getText(language, "log target hit", {v1: target.getName(), v2: damage_dealt}), "enemy_attacked");
        }

        target.on_damaged(character);

        if(target.stats.health <= 0) {
            run_stats.total_kills++;
            target.stats.health = 0; //to not go negative on displayed value
            target.on_death(character);

            log_message(translationManager.getText(language, "log target defeated", {v1: target.getName()}), "enemy_defeated");

            //gained xp multiplied by TOTAL size of enemy group raised to 1/3
            let xp_reward = target.xp_value * groupsize_xp_multiplier;
            add_xp_to_character(xp_reward/target_count, true);

            let loot = target.get_loot({drop_chance_modifier: 1/target_count**0.6667});
            if(loot.length > 0) {
                process_current_loot({loot_list: loot, is_combat: true});
                loot = loot.map(x => {return {item_key: item_templates[x.item_id].getInventoryKey(), count: x.count}});
                add_to_character_inventory(loot);
            }
            
            kill_enemy(target);
        }

        update_displayed_health_of_enemies();
    } else {
        log_message(translationManager.getText(language, "log heroname has missed"), "hero_missed");
    }
}

/**
 * sets enemy to dead, disabled their attack, checks if that was the last enemy in group
 * @param {Enemy} enemy 
 * @return {Boolean} if that was the last of an enemy group
 */
function kill_enemy(target, do_quest_events = true) {
    target.is_alive = false;
    if(target.add_to_bestiary) {
        if(enemy_killcount[target.name]) {
            enemy_killcount[target.name] += 1;
            update_bestiary_entry_killcount(target.name);
        } else {
            enemy_killcount[target.name] = 1;
            create_new_bestiary_entry(target.name);
        }
    }
    const enemy_id = current_enemies.findIndex(enemy => enemy===target);
    clear_enemy_attack_loop(enemy_id);

    if(do_quest_events) {
        do_quest_event({
            quest_event_type: "kill",
            quest_event_target: target.id,
            quest_event_count: 1,
        });

        Object.keys(target.tags || {}).forEach(tag => {
            do_quest_event({
                quest_event_type: "kill_any",
                quest_event_target: tag,
                quest_event_count: 1,
            });
        })

        /*
            And the guild's job, if it is a hunt for something this was (P-41). Here rather
            than in a loop of its own because the tags are already in hand, and inside the
            same `do_quest_events` guard as the events above for the same reason those are:
            a replay must not count a kill twice.

            job_after_kill returns the same object when the kill was nothing to do with the
            job, so the comparison is what decides whether anything is redrawn.
        */
        if(game_state.guild_board?.accepted) {
            const advanced = job_after_kill(game_state.guild_board.accepted, target.tags);
            if(advanced !== game_state.guild_board.accepted) {
                game_state.guild_board = {...game_state.guild_board, accepted: advanced};
                update_displayed_guild_board();
            }
        }
    }
}

function kill_player({is_combat = true} = {}) {
    if(is_combat) {
        run_stats.total_deaths++;
        log_message(translationManager.getText(language, "log heroname has lost consciousness"), "hero_defeat");

        update_displayed_health();
        if(game_options.auto_return_to_bed && game_state.last_location_with_bed) {
            change_location({location_id: game_state.last_location_with_bed});
            start_sleeping();
        } else {
            change_location({location_id: current_location.parent_location.id});
        }
    }

    add_active_effect("Recovering", 2);
}

function use_stamina({stamina_to_use = 1, skip_persistence_xp_for_stance_change = false}) {
    
    character.stats.full.stamina -= stamina_to_use/(character.stats.full.stamina_efficiency || 1);

    if(character.stats.full.stamina < 0)  {
        character.stats.full.stamina = 0;
    }

    if(character.stats.full.stamina < 1) {

        //double the gain if hp under 20%
        if(character.stats.full.health/character.stats.full.max_health < 0.2) {
            stamina_to_use *= 2;
        }
        for(let i = 0; i < cold_status_effects.length; i++) {
            if(active_effects[cold_status_effects[i]]) {
                stamina_to_use *= (1.19**i); //~x2 at i==4
            }
        }

        if(!skip_persistence_xp_for_stance_change) {
            add_xp_to_skill({skill: skills["Persistence"], xp_to_add: stamina_to_use});
        }
        update_displayed_stats();
    }

    update_displayed_stamina();
}

/**
 * adds xp to skills, handles their levelups and tooltips
 * @param skill - skill object 
 * @param {Number} xp_to_add 
 * @param {Boolean} should_info 
 * @returns {Boolean}
 */
/**
 * How much xp a single gain actually adds to a skill, after the multiplier chain
 * and the per-gain cap.
 *
 * Exported so the activity panel can estimate a level-up time the engine will
 * really deliver. The panel used to recompute this itself and got it wrong in
 * three ways - no global multiplier, no parent-skill multiplier, and no cap -
 * which only became visible once the cap started working. One function, one
 * answer, no drift.
 *
 * @param {Object} skill a Skill instance
 * @param {Number} xp_to_add the raw amount before any modifier
 * @param {Boolean} use_bonus apply the multiplier chain
 * @param {Boolean} cap_gained_xp apply the per-gain cap
 * @returns {Number}
 */
function get_effective_skill_xp_gain({skill, xp_to_add, use_bonus = true, cap_gained_xp = true}) {
    let gain = xp_to_add;

    if(use_bonus) {
        gain = gain * config.global_xp_multiplier * get_skill_xp_gain(skill.skill_id);

        if(skill.parent_skill) {
            gain *= skill.get_parent_xp_multiplier();
        }
    }

    //Number.isFinite, not `typeof ... === "number"`: xp_to_next_lvl is Infinity
    //once a skill maxes out, and capping against Infinity is meaningless. The
    //original condition compared typeof (a string) against the Number
    //constructor, so it was never true and this cap never applied at all.
    if(cap_gained_xp && Number.isFinite(skill.xp_to_next_lvl)) {
        //cap on singular gains for non-crafting skills; cap for crafting skills handled in crafting code as it's dependent on how many items are made at once
        gain = Math.min(gain, skill.xp_to_next_lvl*skill_xp_gains_cap);
    }

    return gain;
}

function add_xp_to_skill({skill, xp_to_add = 1, should_info = true, use_bonus = true, add_to_parent = true, cap_gained_xp = true, is_from_loading = false, do_quest_events = true})
{
    let leveled = false;
    if(xp_to_add == 0) {
        return leveled;
    } else if(xp_to_add < 0) {
        console.error(`Tried to add negative xp to skill ${skill.skill_id}`);
        return leveled;
    } else if(!Number.isFinite(xp_to_add)) {
        //Covers Infinity as well as NaN: isNaN(Infinity) is false, so the
        //previous check let it straight through into the skill's stored xp.
        console.error(`Tried to add non-finite xp (${xp_to_add}) to skill ${skill.skill_id}`);
        return leveled;
    }

    xp_to_add = get_effective_skill_xp_gain({skill, xp_to_add, use_bonus, cap_gained_xp});
    
    const prev_name = skill.name();
    const was_hidden = skill.visibility_treshold > skill.total_xp;

    let {message, gains, unlocks} = skill.add_xp({xp_to_add: xp_to_add});
    const new_name = skill.name();
    if(skill.parent_skill && add_to_parent) {
        if(skill.total_xp > skills[skill.parent_skill].total_xp) {
            /*
                add xp to parent if skill would now have more than the parent
                calc xp ammount so that it's no more than the difference between child and parent
            */
            let xp_for_parent = Math.min(skill.total_xp - skills[skill.parent_skill].total_xp, xp_to_add);
            add_xp_to_skill({skill: skills[skill.parent_skill], xp_to_add: xp_for_parent, should_info, use_bonus: false, add_to_parent, cap_gained_xp: false, is_from_loading});
        }
    }

    const is_visible = skill.visibility_treshold <= skill.total_xp;


    if(was_hidden && is_visible) {
        //skill only now became visible, so it needs to be added to display
        create_new_skill_bar(skill);
        update_displayed_skill_bar(skill, false);
        
        if(typeof should_info === "undefined" || should_info) {
            log_message(translationManager.getText(language, "log unlocked new skill v1", {v1: skill.name()}), "skill_raised");
        }
    } 

    if(gains) { 
        character.stats.add_skill_milestone_bonus(gains);
        if(skill.skill_id === "Unarmed") {
            character.stats.add_all_equipment_bonus();
        }
    }
    
    if(is_visible) {
        if(prev_name !== new_name) { //skill name has changed; this may trigger on levelup OR on becoming visible
            if(which_skills_affect_skill[skill.skill_id]) {
                for(let i = 0; i < which_skills_affect_skill[skill.skill_id].length; i++) {
                    update_displayed_skill_bar(skills[which_skills_affect_skill[skill.skill_id][i]], false);
                }
            }

            Object.keys(booklist_entry_divs).forEach(book_id => {
                //update anthology entry
                const bonuses = book_stats[book_id]?.bonuses?.xp_multipliers || {};
                if(bonuses[skill.skill_id]) {
                    update_booklist_entry(book_id, true);
                }
            });
            Object.keys(character.inventory).forEach(inv_key => {
                //update equippable/useable/book item
                const item = getItemFromKey(inv_key);
                if(item.tags.usable) {
                    const effects = item.effects;
                    for(let i = 0; i < effects.length; i++) {
                        if(effect_templates[effects[i].effect].effects?.bonus_skill_levels?.[skill.skill_id]) {
                            update_displayed_character_inventory({item_key: inv_key});
                            return;
                        }
                    }
                } else if(item.tags.book) {
                    const bonuses = book_stats[item.id]?.bonuses?.xp_multipliers || {};
                    if(bonuses[skill.skill_id]) {
                        update_displayed_character_inventory({item_key: inv_key});
                    }
                } else if(item.tags.equippable) {
                    const bonuses = item.getBonusSkillLevels();
                    if(bonuses[skill.skill_id]) {
                        update_displayed_character_inventory({item_key: inv_key});
                    }
                }
            });
            Object.keys(character.equipment).forEach(eq_slot => {
                //update equipped item
                if(!character.equipment[eq_slot]) {
                    return;
                }
                const bonuses = character.equipment[eq_slot].getBonusSkillLevels(); {
                    if(bonuses[skill.skill_id]) {
                        update_displayed_equipment();
                        update_displayed_character_inventory({equip_slot: eq_slot});
                    }
                }
            });
        }

        if(typeof message !== "undefined"){ 
        //not undefined => levelup happened and levelup message was returned
            leveled = true;

            update_displayed_skill_bar(skill, true);

            if(typeof should_info === "undefined" || should_info)
            {
                update_character_stats();
            }

            if(typeof skill.get_effect_description !== "undefined")
            {
                update_displayed_skill_description(skill);
            }

            if(skill.is_parent) {
                update_all_displayed_skills_xp_gain();
            } else {
                update_displayed_skill_xp_gain(skill);
            }

            //no point doing any checks for optimization
            update_displayed_stamina_efficiency();
            
            process_rewards({source_name: skill.skill_id, source_type: "skill", rewards: unlocks, inform_overall: should_info});
            
            if(typeof should_info === "undefined" || should_info){
                log_message(message, "skill_raised");
            }

            if(prev_name !== new_name) { //skill name has changed
                //display of skill name in other places (like tooltips of other skills) is handled slightly earlier
                if(!was_hidden && (typeof should_info === "undefined" || should_info)) {
                    log_message(translationManager.getText(language, "log skill v1 upgraded to v2", {v1: prev_name, v2: new_name}), "skill_raised");
                }

                if(current_location?.connected_locations && !current_activity) {
                    Object.keys(current_location.activities).forEach(activity_key => {
                        if(activities[current_location.activities[activity_key].activity_name].base_skills_names.includes(skill.skill_id)) {
                            update_gathering_tooltip(current_location.activities[activity_key]);
                        }
                    });
                }

                update_displayed_effects();
                //a bit lazy, but there shouldn't ever be enough to have any performance impact
            }

            if(speed_modifiers_from_skills[skill.skill_id] && !is_from_loading) {
                //check if skill affects any travel times, update pathing if so
                pathfinder = new Pathfinder();
                pathfinder.fill_connections(locations);
                travel_times = {};
                travel_times[current_location.id] = pathfinder.find_shortest_paths(current_location.id);
                //shouldn't need any display updates
            }

            if(tags_for_droprate_modifier_skills[skill.skill_id]) { 
                //this skill affects some droprates, so bestiary update is required
                
                //go through enemy types that were killed, check if relevant tag is present, update related display if so
                Object.keys(enemy_killcount).forEach(enemy_id => {
                    if(enemy_templates[enemy_id].tags[tags_for_droprate_modifier_skills[skill.skill_id]]) {
                        //update_bestiary_entry(enemy_id);
                        update_bestiary_entry_tooltip(enemy_id);
                    }
                });
            }

            if(do_quest_events) {
                do_quest_event({
                    quest_event_type: "reach_skill",
                    quest_event_target: skill.skill_id,
                    quest_event_count: skill.current_level,
                });
            }
        } else {
            update_displayed_skill_bar(skill, false);
        }
    } else {
        //
    }

    return leveled;
}

/**
 * adds xp to character, handles levelups
 * @param {Number} xp_to_add 
 * @param {Boolean} should_info 
 */
function add_xp_to_character(xp_to_add, should_info = true, use_bonus) {
    const level_up = character.add_xp({xp_to_add, use_bonus});
    
    if(level_up) {
        if(should_info) {
            log_message(level_up, "level_up");
        }
        
        character.stats.full.health = character.stats.full.max_health; //free healing on level up, because it's a nice thing to have
        update_character_stats();
    }

    update_displayed_character_xp(level_up);
}

/**
 * @param {Location} location game Location object
 * @description handles all the rewards for clearing location (both first and subsequent clears), adding xp and unlocking stuff
 */
function get_location_rewards(location) {

    let should_return = false;

    if(location.enemy_groups_killed == location.enemy_count || location.is_challenge) { //first clear

        if(location.is_challenge) {
            lock_location({location, challenge_self_lock: true});
        }
        should_return = true;
        
        if(location.first_reward) {
            process_rewards({rewards: location.first_reward, source_type: "location", source_name: location.getName(), is_first_clear: true, source_id: location.id});
        }
    } else if(location.repeatable_reward.xp && typeof location.repeatable_reward.xp === "number") {
        process_rewards({rewards: {xp: location.repeatable_reward.xp}, source_type: "location", source_name: location.getName(), is_first_clear: false, source_id: location.id});
    }

    if(location.rewards_with_clear_requirement) {
        for(let i = 0; i < location.rewards_with_clear_requirement.length; i++) {
            if(location.enemy_groups_killed == location.enemy_count * location.rewards_with_clear_requirement[i].required_clear_count)
            {
                //only once, on N-th clear
                process_rewards({rewards: location.rewards_with_clear_requirement[i], source_type: "location", source_name: location.getName(), is_first_clear: false, source_id: location.id});
            }
        }
    }

    //calls in first clear give xp, this call omits xp to avoid repeating it
    //repeatable rewards are indeed intended to be called on first clear as well (with the exception of xp, duh)
    process_rewards({rewards: {...location.repeatable_reward, xp: null}, source_type: "location", source_name: location.getName(), is_first_clear: false, source_id: location.id});

    location.otherUnlocks();

    //return if need be; additional check in case it was already performed by rewards
    if(should_return && current_location?.parent_location) {
        change_location({location_id: current_location.parent_location.id}); //go back to parent location, only on first clear
    }
}

/**
 * processes rewards and logs all necessary messages
 * @param {Object} rewards_data
 * @param {Object} rewards_data.rewards //the standard object with rewards
 * @param {String} rewards_data.source_type //location, gameAction, textline
 * @param {Boolean} rewards_data.is_first_clear //exclusively for location rewards (and only for a single message to be logged)
 * @param {Boolean} rewards_data.inform_overall //if unlocks are to be logged
 * @param {Boolean} rewards_data.inform_textline //if textline unlock is to be logged (requires inform_overall to also be true)
 * @param {String} rewards_data.source_name //in case it's needed for logging a message
 * @param {Boolean} rewards_data.only_unlocks //processes only unlock-type rewards (skips money, item, etc; doesn't skip rep)
 */
function process_rewards({rewards = {}, source_type, source_name, is_first_clear, inform_overall = true, inform_textline = true, only_unlocks = false, is_from_loading = false}) {
    let was_any_location_availability_changed = false;
    let is_current_location_reload_needed = false;

    if(rewards.messages && !is_from_loading) {
        for(let i = 0; i < rewards.messages.length; i++) {
            //These are text ids, like every other piece of player-facing text.
            log_message(translationManager.getText(language, rewards.messages[i]));
        }
    }

    if(rewards.money && typeof rewards.money === "number" && !only_unlocks) {
        if(inform_overall) {
            log_message(translationManager.getText(language, "log heroname earned v1", {v1: format_money(rewards.money)}));
        }
        add_money_to_character(rewards.money);
    }

    if(rewards.xp && typeof rewards.xp === "number" && !only_unlocks) {
        if(source_type === "location") {
            if(inform_overall) {
                if(is_first_clear) {
                    log_message(translationManager.getText(language, "log obtained v1 xp for clearing", {v1: rewards.xp, v2: source_name}), "location_reward");
                } else {
                    log_message(translationManager.getText(language, "log obtained additional v1 xp for", {v1: rewards.xp, v2: source_name}), "location_reward");
                }
            }
        } else {
            //other sources
            log_message(translationManager.getText(language, "log gained v1 xp", {v1: rewards.xp}), "location_reward");
        }
        add_xp_to_character(rewards.xp);
    }

    if(rewards.skill_xp && !only_unlocks) {
        Object.keys(rewards.skill_xp).forEach(skill_key => {
            if(typeof rewards.skill_xp[skill_key] === "number") {
                if(inform_overall) {
                    log_message(translationManager.getText(language, "log heroname gained v1 xp to", {v1: rewards.skill_xp[skill_key], v2: skills[skill_key].name()}));
                }
                add_xp_to_skill({skill: skills[skill_key], xp_to_add: rewards.skill_xp[skill_key], cap_gained_xp: false});
            }
        });
    }
    
    if(rewards.locations) {
        for(let i = 0; i < rewards.locations.length; i++) {
            was_any_location_availability_changed = 
                unlock_location({location: locations[rewards.locations[i].location], skip_message: (inform_overall && rewards.locations[i].skip_message || is_from_loading)}) 
                || was_any_location_availability_changed;
                
        }
    }

    /*
        A title a piece of content hands over directly, for the ones no counter can
        see - finishing something, being told something, being somewhere. The
        condition-less titles in the registry exist for exactly this.
    */
    if(rewards.titles) {
        for(let i = 0; i < rewards.titles.length; i++) {
            const title = titles[rewards.titles[i]];
            if(!title) {
                console.error(`No such title as "${rewards.titles[i]}" - reward skipped.`);
                continue;
            }
            if(title.is_earned) {
                continue;
            }
            title.is_earned = true;
            if(inform_overall) {
                log_message(translationManager.getText(language, "log title earned",
                            {v1: title.getName()}), "message_travel");
            }
            update_displayed_titles();
        }
    }

    if(rewards.flags) {
        for(let i = 0; i < rewards.flags.length; i++) {
            const flag = global_flags[rewards.flags[i]];
            global_flags[rewards.flags[i]] = true;
            if(!flag && flag_unlock_texts[rewards.flags[i]] && inform_overall) {
                log_message(translationManager.getText(language, flag_unlock_texts[rewards.flags[i]]), "activity_unlocked");
            }
        }
    }

    if(rewards.textlines) {
        for(let i = 0; i < rewards.textlines.length; i++) {
            let any_unlocked = false;
            for(let j = 0; j < rewards.textlines[i].lines.length; j++) {
                if(dialogues[rewards.textlines[i].dialogue].textlines[rewards.textlines[i].lines[j]].is_unlocked == false) {
                    any_unlocked = true;
                    dialogues[rewards.textlines[i].dialogue].textlines[rewards.textlines[i].lines[j]].is_unlocked = true;
                }
            }
            if(any_unlocked && inform_textline && inform_overall && !rewards.textlines[i].skip_message && source_name !== rewards.textlines[i].dialogue) {

                //getName returns the canonical English name, so it has to go
                //through the display-name layer or the English would sit inside
                //the translated sentence. assembleName does that and capitalises
                //the result, which Turkish needs because its pattern opens with
                //the name and NPC names are stored lowercase.
                log_message(translationManager.assembleName(language, "log you should talk to v1",
                    {v1: `name ${dialogues[rewards.textlines[i].dialogue]
                        .getName({is_mofu_mofu_enabled: global_flags.is_mofu_mofu_enabled})}`},
                    {capitalise: true}), "dialogue_unlocked");
                //maybe do this only when there's just 1 dialogue with changes?
            }
        }
    }

    if(rewards.dialogues) {
        for(let i = 0; i < rewards.dialogues?.length; i++) {
            const dialogue = dialogues[rewards.dialogues[i]]
            if(!dialogue.is_unlocked) {
                dialogue.is_unlocked = true;
                //getDisplayName over getName, as display.js does it: getName returns the
                //English name, so this line read "Artık old craftsman ile konuşabilirsin".
                log_message(translationManager.getText(language, "log you can now talk with",
                    {v1: translationManager.getDisplayName(language, dialogue.getName({is_mofu_mofu_enabled: global_flags.is_mofu_mofu_enabled}))}), "activity_unlocked");
            }
        }
    }

    if(rewards.traders) { 
        for(let i = 0; i < rewards.traders.length; i++) {
            const trader = traders[rewards.traders[i].trader];
            if(!trader.is_unlocked) {
                trader.is_unlocked = true;
                if(!rewards.traders[i].skip_message) {
                    if(trader.unlock_message) {
                        log_message(trader.getUnlockMessage(), "activity_unlocked");
                    } else {
                        log_message(translationManager.getText(language, "log you can now trade with", {v1: trader.getDisplayName()}), "activity_unlocked");
                    }
                }
            }
        }
    }

    if(rewards.housing) {
        for(let i = 0; i < rewards.housing.length; i++){
            locations[rewards.housing[i]].housing.is_unlocked = true;

            if(favourite_locations[rewards.housing[i]]) {
                //unfavourite the location as it will be added to fast travel anyways due to having housing=true
                remove_location_from_favourites({location_id: rewards.housing[i]});
            }
        }
    }

    if(rewards.crafting) {
        for(let i = 0; i < rewards.crafting.length; i++) {
            locations[rewards.crafting[i]].crafting.is_unlocked = true;
            log_message(translationManager.getText(language, "log you can now use a",
                {v1: locations[rewards.crafting[i]].getName()}), "activity_unlocked");
        }
    }

    if(rewards.global_activities) {
        for(let i = 0; i < rewards.global_activities?.length; i++) {
            unlock_global_activity({activity_id: rewards.global_activities[i]});
        }
    }


    if(rewards.activities) {
        for(let i = 0; i < rewards.activities?.length; i++) {
            if(!locations[rewards.activities[i].location].activities[rewards.activities[i].activity].tags?.gathering || global_flags.is_gathering_unlocked) {

                unlock_activity({location: locations[rewards.activities[i].location].name, 
                                activity: locations[rewards.activities[i].location].activities[rewards.activities[i].activity],
                                skip_message: is_from_loading,
                            });

            }
        }
    }

    if(rewards.actions) {
        for(let i = 0; i < rewards.actions?.length; i++) {
            if(rewards.actions[i].dialogue) {
                unlock_action({
                                dialogue: dialogues[rewards.actions[i].dialogue]?.name,
                                action: dialogues[rewards.actions[i].dialogue].actions[rewards.actions[i].action],
                                skip_message: is_from_loading,
                            });
            } else if(rewards.actions[i].location){
                unlock_action({
                                location: locations[rewards.actions[i].location]?.name,
                                action: locations[rewards.actions[i].location].actions[rewards.actions[i].action],
                                skip_message: is_from_loading,
                            });
            }
        }
    }

    if(rewards.stances) {  
        for(let i = 0; i < rewards.stances.length; i++) {
            unlock_combat_stance(rewards.stances[i]);
        }
    }

    if(rewards.skills) {
        for(let i = 0; i < rewards.skills.length; i++) {
            if(!skills[rewards.skills[i]].is_unlocked) {
                skills[rewards.skills[i]].is_unlocked = true;
                create_new_skill_bar(skills[rewards.skills[i]]);
                update_displayed_skill_bar(skills[rewards.skills[i]], false);
                if(inform_overall) {
                    log_message(translationManager.getText(language, "log unlocked new skill v1", {v1: skills[rewards.skills[i]].name()}));
                }

                if(source_type === "skill") {
                    if(!which_skills_affect_skill[rewards.skills[i]]) {
                        which_skills_affect_skill[rewards.skills[i]] = [];
                    }

                    if(skills[source_name]) {
                        which_skills_affect_skill[rewards.skills[i]].push(source_name);
                        //shouldn't cause issues, as it will only trigger on skill unlocks by other skills
                    } else {
                        console.error(`Tried to register skill "${source_name}" as related to "${rewards.skills[i]}", but the former does not exist!`);
                    }
                }

                //update all related skills; may be none if unlock was not from another skill, so need to check with '?'
                for(let j = 0; j < which_skills_affect_skill[rewards.skills[i]]?.length; j++) {
                    update_displayed_skill_bar(skills[which_skills_affect_skill[rewards.skills[i]][j]], false);
                }
            }
        }
    }

    if(rewards.recipes) {
        for(let i = 0; i < rewards.recipes.length; i++) {
            if(!recipes[rewards.recipes[i].category][rewards.recipes[i].subcategory][rewards.recipes[i].recipe_id].is_unlocked) {
                recipes[rewards.recipes[i].category][rewards.recipes[i].subcategory][rewards.recipes[i].recipe_id].is_unlocked = true;
                if(inform_overall) {
                    //getDisplayName, as the crafting window does it: most recipe names are
                    //the name of the item they produce, so they resolve through `name <x>`.
                    log_message(translationManager.getText(language, "log unlocked new recipe v1",
                        {v1: translationManager.getDisplayName(language,
                            recipes[rewards.recipes[i].category][rewards.recipes[i].subcategory][rewards.recipes[i].recipe_id].name)}));
                }
            }
        }
    }

    if(rewards.quests) {
        for(let i = 0; i < rewards.quests.length; i++) {
            if(!questManager.isQuestActive(rewards.quests[i]) && !questManager.isQuestFinished(rewards.quests[i])) {
                questManager.startQuest({quest_id: rewards.quests[i]});
                if(inform_overall) {
                    //No log here: Quest.startQuest already logs it, with the id that is
                    //actually live ("log started a new quest"). This line named a second row
                    //saying the same thing, which was the only dead row in the locale.
                    //already done in quests
                }
            }
        }
    }

    if(rewards.quest_progress) {
        for(let i = 0; i < rewards.quest_progress.length; i++) {
            const quest_id = rewards.quest_progress[i].quest_id;
            const task_index = rewards.quest_progress[i].task_index;
            const completed = quests[quest_id]?.getCompletedTaskCount();
            if(task_index == completed) {
                if(quests[quest_id]?.quest_tasks[task_index]) {
                    questManager.finishQuestTask({quest_id: quest_id, task_index: task_index, skip_warning: true});
                } else {
                    console.warn(`Tried to complete ${task_index}'th task for quest '${quest_id}', but either quest or index does not exist!`);
                }
            } else if(quests[quest_id]) {
                //Deliberate - tasks run in order - but silent, which is the problem. Doing
                //the right thing for step three while step two is unfinished looks exactly
                //like doing nothing, and that is how three quests came to look stalled.
                console.warn(`Quest progress for '${quest_id}' task ${task_index} was`
                    + ` dropped: ${completed} task(s) are finished, so only task ${completed}`
                    + ` can advance right now.`);
            }
        }
    }

    if(rewards.locks) {
        if(rewards.locks.textlines) {
            Object.keys(rewards.locks.textlines).forEach(dialogue_key => {
                for(let i = 0; i < rewards.locks.textlines[dialogue_key].length; i++) {
                    dialogues[dialogue_key].textlines[rewards.locks.textlines[dialogue_key][i]].is_finished = true;
                }
            });
        }
        if(rewards.locks.dialogues) {
            for(let i = 0; i < rewards.locks.dialogues.length; i++) {
                dialogues[rewards.locks.dialogues[i]].is_finished = true;
                if(current_location.dialogues.includes(rewards.locks.dialogues[i])) {
                    is_current_location_reload_needed = true;
                }
            }
        }
        if(rewards.locks.locations) {
            for(let i = 0; i < rewards.locks.locations.length; i++) {
                was_any_location_availability_changed = lock_location({location: locations[rewards.locks.locations[i]]}) || was_any_location_availability_changed;
            }
        }
        if(rewards.locks.traders) {
            for(let i = 0; i < rewards.locks.traders.length; i++) {
                traders[rewards.locks.traders[i]].is_finished = true;
            }
        }
        if(rewards.locks.quests) {
            for(let i = 0; i < rewards.locks.quests.length; i++) {
                questManager.finishQuest({quest_id: rewards.locks.quests[i], skip_rewards: true})
            }
        }
        if(rewards.locks.actions) {
            for(let i = 0; i < rewards.locks.actions.length; i++) {
                lock_action({
                            dialogue_key: rewards.locks.actions[i].dialogue,
                            location_key: rewards.locks.actions[i].location,
                            action_key: rewards.locks.actions[i].action
                        });
            }
        }
    }

    if(rewards.items && !only_unlocks) {
        for(let i = 0; i < rewards.items.length; i++) {
            const entry = rewards.items[i];
            const is_bare_name = typeof entry === "string";
            const item_id = is_bare_name ? entry : entry.item;
            const template = item_templates[item_id];

            if(!template) {
                console.error(`No such item as "${item_id}" - reward skipped.`);
                continue;
            }

            const count = is_bare_name ? 1 : (entry.count || 1);
            const quality = is_bare_name ? undefined : entry.quality;

            /*
                A fresh item rather than the template with a quality stamped on it.
                getInventoryKey() caches, and a template's key is cached long before any
                reward is granted, so the stamp never reached the key - the five starter
                weapons asking for quality 50 arrived at 100 - while still landing on the
                shared template for getBaseValue's fallback to read. This is the path
                InventoryHaver.add_to_inventory already uses: the constructor recomputes
                the key, so the quality is in it and the template is untouched.
            */
            const item = quality ? getItem({...template, quality}) : template;

            //getDisplayName, not getName: getName is the canonical English and the
            //translation key, so the log read English in every language.
            log_message(translationManager.getText(language, "log heroname obtained v1 x v2", {v1: item.getDisplayName(), v2: count}));
            add_to_character_inventory([{item_key: item.getInventoryKey(), count}]);
        }
    }

    if(rewards.reputation) {
        Object.keys(rewards.reputation).forEach(region => {
            ReputationManager.add_reputation({region, reputation: rewards.reputation[region]});
        });
        update_displayed_reputation();
    }

    if(was_any_location_availability_changed && !is_from_loading) {
        //pathing update
        pathfinder = new Pathfinder();
        pathfinder.fill_connections(locations);
        travel_times = {};
        travel_times[current_location.id] = pathfinder.find_shortest_paths(current_location.id);

        //shouldn't need any display updates
    }

    /*
        An active effect as a reward, which the twenty-three kinds above could not express.

        Every one of them gives something; a reward that takes has to go through
        add_active_effect, which is how food, enemies and the dev console already apply
        one. A trap in a chest lid is a debuff for a while, and that is a COST - the thing
        you opened is still yours. Nothing else in the game could say that.

        It does not log; add_active_effect is silent. Pair it with `messages` so the player
        knows what bit them.
    */
    if(rewards.effects && !only_unlocks && !is_from_loading) {
        for(let i = 0; i < rewards.effects.length; i++) {
            const entry = rewards.effects[i];
            if(!effect_templates[entry.effect]) {
                console.error(`No such effect as "${entry.effect}" - reward skipped.`);
                continue;
            }
            add_active_effect(entry.effect, entry.duration);
        }
        update_displayed_effects();
        character.stats.add_active_effect_bonus();
        update_character_stats();
    }

    if(rewards.move_to && !only_unlocks) {
        if(source_type !== "action") {
            change_location({location_id: rewards.move_to.location});
        } else {
            current_location = locations[rewards.move_to.location];
        }
    } else if(is_current_location_reload_needed) {
        change_location({location_id: current_location.id});
    }

    /*
        Reward groups that only sometimes happen, rolled independently of each other.

        Every reward above is certain, which is why a chest could hold exactly one thing:
        an action has a single success path and nothing on it could carry a chance. So a
        chest was the same coin and the same scarf every time, and "sometimes it bites"
        could not be written at all (P-24).

        `chance` may be a NUMBER or a function deriving one, the same shape a trader's
        inventory_template takes and for the same reason: a trap a skilled picker spots
        more often has to read the skill at the moment it is rolled, and storing a
        computed chance would be the "derive, do not store" mistake Q-10 settled.

        Skipped entirely when only_unlocks or is_from_loading, and
        check_chance_rewards_are_not_unlocks refuses unlock kinds inside one. Both halves
        of the same hazard: a finished book re-applies its rewards on every load, so a
        chance-gated unlock would be re-rolled - granted on one load and missing on the
        next, with nothing failing.
    */
    if(rewards.chance_of && !only_unlocks && !is_from_loading) {
        for(let i = 0; i < rewards.chance_of.length; i++) {
            const group = rewards.chance_of[i];
            const chance = typeof group.chance === "function" ? group.chance() : group.chance;

            if(Math.random() < chance) {
                process_rewards({
                    rewards: group.rewards,
                    source_type,
                    source_name,
                    is_first_clear,
                    inform_overall,
                    inform_textline,
                });
            }
        }
    }
}

/**
 * Performs logging of provided loot
 * @param {*} param0 
 */
function process_current_loot({loot_list, is_combat, is_summary}) {
    current_loot.recent = {};

    loot_list.forEach(loot_list_entry => {
        const key = loot_list_entry.item_id || loot_list_entry.item_key;

        current_loot.recent[key] = {item_id: loot_list_entry.item_id, item_key: loot_list_entry.item_key, item_count: loot_list_entry.count};
        
        if(!current_loot.total[key] && loot_list_entry.count) {
            current_loot.total[key] = {item_id: loot_list_entry.item_id, item_key: loot_list_entry.item_key, item_count: loot_list_entry.count};
        } else {
            current_loot.total[key].item_count += loot_list_entry.count;
        }
    });
    
    log_loot({loot_list: current_loot, is_combat, is_dynamic: game_options.do_dynamic_loot_message, is_a_summary: is_summary && !game_options.do_dynamic_loot_message});
}

function clear_loot_information() {
    //called whenever changing a location or stopping an activity
    current_loot.recent = {};
    current_loot.total = {};
    unassign_dynamic_loot_message();
}

/**
 * 
 * @param location game location object 
 * @returns whether it was actually unlocked (false meaning it was already available before)
 */
function unlock_location({location, skip_message}) {
    let was_unlocked = false;
    if(!location.is_unlocked){
        location.is_unlocked = true;
        was_unlocked = true;
        if(!skip_message) {
            const message = (location.unlock_text ? translationManager.getText(language, location.unlock_text) : null)
                || translationManager.getText(language, "log unlocked location", {v1: location.getName()});
            log_message(message, "location_unlocked");
        }

    }

    /*
        Before the reload below, and that order is the whole point (P-37). The fast travel
        list is built by reading unlocked_beds, so registering the bed AFTER the display has
        been rebuilt left a newly unlocked bed off the list until something else happened to
        redraw it.

        Outside the `if` on purpose, as it always was: unlocking a location that is already
        unlocked still has to register its bed.
    */
    if(location.housing?.is_unlocked) {
        unlocked_beds[location.id] = true;
    }

    /*
        Reloads the current location just in case it needs the new unlock to be added to
        current display. Only on an actual unlock - the current action check is most
        probably unnecessary.
    */
    if(was_unlocked && current_location && !current_dialogue && !current_game_action) {
        change_location({location_id: current_location.id, skip_travel_time: true});
    }

    return was_unlocked;
}

/**
 * 
 * @param {*} param0 
 * @returns whether it was actually locked (false meaning it was already locked before)
 */
function lock_location({location, challenge_self_lock = false}) {
    let was_locked = false;
    if(favourite_locations[location.id]) {
        delete favourite_locations[location.id];
        if(!challenge_self_lock) {
            remove_fast_travel_choice({location_id: location.id});
        }
    }

    if(!location.is_finished) {
        was_locked = true;
        location.is_finished = true;
    }
    if(game_state.last_combat_location === location.id) {
        game_state.last_combat_location = null;
    }

    return was_locked;
}

function add_location_to_favourites({location_id}) {
    if(favourite_locations[location_id]) {
        console.warn(`Tried to favourite location "${locations[location_id].name}" despite it already being in favourites`);
        return;
    }

    favourite_locations[location_id] = true;
    update_location_icon();
}

function remove_location_from_favourites({location_id, update_choices = true}) {
    if(!favourite_locations[location_id]) {
        console.warn(`Tried to unfavourite location "${locations[location_id].name}" despite it not being in favourites`);
        return;
    }

    delete favourite_locations[location_id];
    update_location_icon();
    if(update_choices) {
        remove_fast_travel_choice({location_id});
    }
}

function clear_enemies() {
    current_enemies = null;
    for(let i = 0; i < 7; i++) {
        remove_enemy_onhit_animation(i);
    }
}


function add_to_content_stack({content_type, data, what_to_remove = content_stack_removal_options.TOP}) {
    content_stack.push({content_type, data, what_to_remove});

    switch_action_box_content();
}

function remove_from_content_stack() {
    const content = content_stack.pop();
    const what_to_remove = content.what_to_remove || content_stack_removal_options.TOP;

    if(what_to_remove === content_stack_removal_options.TOP) {
        //nothing - already done
    } else if(what_to_remove === content_stack_removal_options.ALL) {
        //clear it completely, which will default to location display
        while(content_stack[0]) {
            content_stack.pop();
        }
    } else {
        throw new Error(`No such content stack removal option as "${what_to_remove}"`);
    }

    switch_action_box_content();
}

function pass_data_down_the_content_stack({data}) {
    if(content_stack.length > 1) {
        content_stack[content_stack.length - 2].data.special = data;
    }
}

function switch_action_box_content() {
    //cancel everything when switching
    if(current_dialogue) {
        current_dialogue = null;
    } else if(current_activity) {
        current_activity = null;
        end_activity_animation();
    } else if(current_game_action) {
        current_game_action = null;
        end_activity_animation();
        stop_game_action_interval();
    }

    if(content_stack.length) {
        let {content_type, data} = content_stack[content_stack.length - 1];

        if(content_type.startsWith("dialogue")) {
            current_dialogue = data.dialogue_key;
        }
        if(content_type === "dialogue") {

            //nothing?
        } else if(content_type === "dialogue_answer") {
            //no need to handle this one? (and it's expected to not appear here), as there's no need to put the answer to the stack
        } else if(content_type === "dialogue_branch") {
            //need to handle this one, to allow infinite depth branching?
        } else if(content_type === "action") {
            //everything else is handled in action code
            current_dialogue = data.dialogue_key;
            current_game_action = data.action_key;
        } else if(content_type === "activity") {
            current_activity = data.activity;
            //no need to do much as nothing should be stackable on top of it
        } else {
            throw new Error(`Error on switching action box content: no such content type as "${content_type}"`);
        }

        if(content_type) {
            //something -> pass it forward
            fill_action_box({content_type, data});
        } else {
            //nothing -> shouldn't be possible
        }
        
    } else {
        //stack is empty, just display the current location

        change_location({location_id: current_location.id, skip_travel_time: true});
    }
}

function character_equip_item(item_key) {
    equip_item_from_inventory(item_key);
    if(current_enemies) {
        reset_combat_loops(true);
        update_displayed_enemies();
    } else if(current_location.tags.safe_zone) {
        //update resource gathering tooltips in case there's a skill lvl bonus change
        //done on any change as of now, but could be slightly optimized
        Object.keys(current_location.activities).forEach(activity_key => {
            if(current_location.activities[activity_key].gained_resources) {
                update_gathering_tooltip(current_location.activities[activity_key]);
            }
        });
    }
}

function character_unequip_item(item_slot) {
    unequip_item(item_slot);
    if(current_enemies) {
        reset_combat_loops(true);
        update_displayed_enemies();
    }
}

function use_item(item_key) { 
    const {id} = JSON.parse(item_key);
    const item_effects = item_templates[id].effects;
    let used = false;
    for(let i = 0; i < item_effects.length; i++) {
        used = add_active_effect(item_effects[i].effect,item_effects[i].duration, true) || used;
        /*
        const duration = item_templates[id].effects[i].duration;
        if(!active_effects[item_effects[i].effect] || active_effects[item_effects[i].effect].duration < duration) {

            active_effects[item_effects[i].effect] = new ActiveEffect({...effect_templates[item_effects[i].effect], duration});
            used = true;
        }
        */
    }
    
    if(used) {
        update_displayed_effects();
        character.stats.add_active_effect_bonus();
        update_character_stats();

        const recovered = [];
        Object.keys(item_templates[id].recovery_chances).forEach(recoverable => {
            const chance = item_templates[id].recovery_chances[recoverable];
            if(chance > Math.random()) {
                recovered.push({item_id: recoverable});
            }
        });
        add_to_character_inventory(recovered);

        //update consuming-related skills if relevant tags are present
        Object.keys(skill_consumable_tags).forEach(skill_id => {
            if(item_templates[id].tags[skill_consumable_tags[skill_id]]) {
                let leveled = add_xp_to_skill({skill: skills[skill_id], xp_to_add: (item_templates[id].value/10)**.6667});
                //if levelup, update all related tooltips
                if(leveled) {
                    character.stats.add_active_effect_bonus();
                    update_character_stats();
                    Object.keys(character.inventory).forEach(item_key => {
                        if(character.inventory[item_key].item.tags[skill_consumable_tags[skill_id]]) {
                            update_displayed_character_inventory({item_key});
                        }
                    });
                }
            }
        });

        remove_from_character_inventory([{item_key}]);
    }
}

function add_consumable_to_favourites(item_id) {
    if(!item_templates[item_id]) {
        throw new Error(`Tried to add "${item_id}" to auto consume, but no such item exists.`);
    } else if(!item_templates[item_id].tags.usable) {
        throw new Error(`Tried to add "${item_id}" to auto consume, but it's not a consumable.`);
    }
    favourite_consumables[item_id] = true;
    //update autouse button display? currently done in .html
}

function remove_consumable_from_favourites(item_id) {
    if(!favourite_consumables[item_id]) {
        throw new Error(`Tried to remove "${item_id}" from auto consume, but it's not there.`);
    }
    delete favourite_consumables[item_id];
    if(character.inventory[item_templates[item_id].getInventoryKey()]) {
        //update autouse button display? currently done in .html
    }
}

function change_consumable_favourite_status(item_id) {
    if(!item_templates[item_id]) {
        throw new Error(`Tried to change "${item_id}" auto consum status, but no such item exists.`);
    } else if(!item_templates[item_id].tags.usable) {
        throw new Error(`Tried to change "${item_id}" auto consume status, but it's not a consumable.`);
    }

    if(favourite_consumables[item_id]) {
        remove_consumable_from_favourites(item_id);
    } else {
        add_consumable_to_favourites(item_id);
    }

    if(character.inventory[item_templates[item_id].getInventoryKey()]) {
        //update autouse button display? currently done in .html
    }
}

function add_item_to_favourites(item_key) {
    favourite_items[item_key] = true;
}

function remove_item_from_favourites(item_key) {
    delete favourite_items[item_key];
}

function change_item_favourite_status(target, item_key) {
    if(item_key in favourite_items) {
        remove_item_from_favourites(item_key);
        update_fav_display(target, false);
    } else {
        add_item_to_favourites(item_key);
        update_fav_display(target, true);
    }

    if(character.inventory[item_key]) {
        //it's in inventory, update display in inventory
        update_displayed_character_inventory({item_key});
    } 


    const equip_slot = getItemFromKey(item_key).equip_slot;
    if(equip_slot && character.equipment[equip_slot]?.getInventoryKey() === item_key) {
        //it's in equips, update equipment part of inventory display
        update_displayed_character_inventory({equip_slot});
    }
}

/**
 * 
 * @param {String} effect_key 
 * @param {Number} duration 
 * @param {Boolean} was_xp_added whether this code should skip xp gain for relevant skill (if such exists) 
 * @returns {Boolean} whether effect was in fact applied (it wasn't active, it had shorter duration, or a weaker was active)
 */
function add_active_effect(effect_key, duration, was_xp_added){
    let do_not_apply_because_stronger_is_active = false; //readable names are good, right?
    const was_already_active = active_effects[effect_key];
    const old_duration = active_effects[effect_key]?.duration ?? 0;

    if(!was_already_active) {
        Object.keys(active_effects).forEach(effect => {
            if(do_not_apply_because_stronger_is_active) {
                return;
            }
            Object.keys(effect_templates[effect].group_tags).forEach(group_tag => {
                if(do_not_apply_because_stronger_is_active) {
                    return;
                }
                if(group_tag in effect_templates[effect_key].group_tags) {
                    if(effect_templates[effect].group_tags[group_tag] > effect_templates[effect_key].group_tags[group_tag]) {
                        //stronger effect is active, skip
                        do_not_apply_because_stronger_is_active = true; 
                    } else {
                        //existing effect is weaker, aply the effect normally, remove the weaker
                        delete active_effects[effect];
                    }
                }
            });
        });

        if(do_not_apply_because_stronger_is_active) {
            //shouldn't need any recalculations or display updates as nothing was changed
            return;
        }
    } else {
        delete active_effects[effect_key];
    }
    active_effects[effect_key] = new ActiveEffect({...effect_templates[effect_key], duration});
    update_displayed_effects();
    
    if(!was_already_active) {
        character.stats.add_active_effect_bonus();
        update_character_stats();
    }

    //no need to check for whether effect was activated, code won't reach this point if it wasn't
    if(!was_xp_added) {
        //update consuming-related skills if relevant tags are present
        Object.keys(skill_consumable_tags).forEach(skill_id => {
            if(effect_templates[effect_key].tags[skill_consumable_tags[skill_id]]) {
                let leveled = add_xp_to_skill({skill: skills[skill_id], xp_to_add: (effect_templates[effect_key].base_xp_value * active_effects[effect_key].duration **.3333)});
                //if levelup, update all related tooltips
                if(leveled) {
                    character.stats.add_active_effect_bonus();
                    update_character_stats();
                    Object.keys(character.inventory).forEach(item_key => {
                        if(character.inventory[item_key].item.tags[skill_consumable_tags[skill_id]]) {
                            update_displayed_character_inventory({item_key});
                        }
                    });
                }
            }
        });
    }

    return old_duration < active_effects[effect_key].duration;
}

function add_xp_to_activity_skills() {
    if(current_activity.gained_skills) {
        const gained_skills = current_activity.gained_skills;
        Object.keys(gained_skills).forEach(skill_key => {
            add_xp_to_skill({skill: skills[skill_key], xp_to_add: gained_skills[skill_key]});
        });
    } else {
        const skill_names = activities[current_activity.activity_name].base_skills_names;
        for (let i = 0; i < skill_names?.length; i++) {
            add_xp_to_skill({skill: skills[skill_names[i]], xp_to_add: current_activity.skill_xp_per_tick[i]});
        }
    }
}

/**
 * Handles preliminary management of quest events, simplifying work by automatically providing all the additional data
 * @param {Object} quest_event_data 
 */
function do_quest_event({quest_event_type, quest_event_target, quest_event_count}) {

    questManager.catchQuestEvent({
        quest_event_type,
        quest_event_target,
        quest_event_count,
        additional_quest_tags: {
            location: current_location?.id || "",
            season: current_game_time.getSeason() || "",
            //just whatever might be possibly needed, to be updated as things expand
        }
    })
}

/**
 * 
 */
function give_export_reward() {
    add_active_effect("Spark of Inspiration", 1800);
    log_message(translationManager.getText(language, "log gained a spark of inspiration"), "export_reward");
}

function get_date() {
    const date = new Date();
    const year = date.getFullYear();
    const month_num = date.getMonth()+1;
    const month = month_num > 9 ? month_num.toString() : "0" + month_num.toString();
    const day = date.getDate() > 9 ? date.getDate().toString() : "0" + date.getDate().toString();
    const hour = date.getHours() > 9 ? date.getHours().toString() : "0" + date.getHours().toString();
    const minute = date.getMinutes() > 9 ? date.getMinutes().toString() : "0" + date.getMinutes().toString();
    const second = date.getSeconds() > 9 ? date.getSeconds().toString() : "0" + date.getSeconds().toString();
    return `${year}-${month}-${day} ${hour}_${minute}_${second}`;
}

/**
 * Normalized identity of the current deployment: host plus path, without the
 * protocol, query, hash or a trailing slash. Comparing on this instead of the
 * full href means "/yairp", "/yairp/" and "/yairp/?debug" all resolve to the
 * same release, which the previous exact-href comparison did not.
 * @returns {string}
 */
function get_release_id() {
    return (window.location.host + window.location.pathname).replace(/\/+$/, "");
}

function is_on_dev() {
    return get_release_id() === config.release_ids.dev;
}
function is_on_main() {
    return get_release_id() === config.release_ids.main;
}












function hard_reset() {
    let confirmation = prompt(`This will erase all your progress and you will have to start from the very beginning. If you are sure this is what you want, type "reset" below`);

    if(confirmation === "reset" || confirmation === `"reset"`) {
        if(is_on_dev()) {
            localStorage.removeItem(dev_save_key);
            localStorage.setItem("skip_live_import", "true");
        } else {
            localStorage.removeItem(save_key);
        }
        window.location.reload();
        return false;
    } else {
        console.log("Hard reset was cancelled.");
    }
}

//update game time
/**
 * Grants any title whose condition has come true.
 *
 * Called once per in-game minute rather than from each event that could earn one.
 * Twelve declarative conditions are cheap to re-read, and the alternative - a hook in
 * every place that raises a kill count, a skill level or a reputation - is a list that
 * silently goes out of date the first time somebody adds a fourteenth way to earn one.
 *
 * A title stays earned once earned. The condition is not re-tested afterwards, because
 * reputation can be spent and a skill can be recalculated, and a record of what the
 * player did should not quietly stop being true.
 */
function check_earned_titles() {
    for(const title_id in titles) {
        const title = titles[title_id];
        if(title.is_earned || !is_title_earned(title)) {
            continue;
        }
        title.is_earned = true;
        log_message(translationManager.getText(language, "log title earned", {v1: title.getName()}),
                    "message_travel");
        update_displayed_titles();
    }
}

function update_timer(time_in_minutes) {
    const was_night = is_night(current_game_time);
    current_game_time.goUp(time_in_minutes || (is_sleeping ? 6 : 1));

    //update_character_stats(); //done every second, probably only used for day-night cycle at this point
    const daynight_change = was_night !== is_night(current_game_time);
    if(daynight_change) {
        update_character_stats();
    }
    
    update_displayed_time();
    check_earned_titles();
}

function progress_time({value = 0, source}) {
    update_timer(value);

    update_effect_durations({time_in_minutes: value, is_sleep: is_sleeping, is_travel: source==="travel"});
}

/**
 * 
 * @param {Object} param0
 * @param {String} param0.source skipped -> assume it's normal game ticks
 */
function update_effect_durations({time_in_minutes = 1, is_travel}) {
    let were_stats_updated = false;
    Object.keys(active_effects).forEach(key => {
        if(!is_travel || is_travel && active_effects[key].affected_by_travel) {

            active_effects[key].duration-= time_in_minutes;
            if(active_effects[key].duration <= 0) {
                //duration ended - remove effect
                delete active_effects[key];
                character.stats.add_active_effect_bonus();
                update_character_stats();
                were_stats_updated = true; //only for use later, as skipping update in here would be bad
            }
        }
    });

    return were_stats_updated;
}

function update() {
    setTimeout(() => {
        end_date = Date.now();
        //basically when previous tick ends, used for timer smoothing

        time_variance_accumulator += ((end_date - start_date) - 1000/tickrate);
        //duration of previous tick, minus time it was supposed to take
        //important to keep it between setting end_date and start_date, so they are 2 completely separate values

        start_date = Date.now();
        /*
        basically when current tick starts
        so before this assignment, start_date is when previous tick started
        and end_date is when previous_tick ended
        */

        let were_stats_updated = false;
        const prev_day = current_game_time.day;
        update_timer();

        if(start_date - game_state.last_rewarded_export > config.time_between_export_rewards) {
            document.getElementById("save_to_file_button").classList.add("export_button_with_reward");
        } else {
            document.getElementById("save_to_file_button").classList.remove("export_button_with_reward");
        }

        update_export_button_tooltip(start_date - game_state.last_rewarded_export, config.time_between_export_rewards);

        const curr_day = current_game_time.day;
        if(curr_day > prev_day) {
            recover_item_prices(config.trade_price_recovery_flat, config.trade_price_recovery_ratio);
            trickle_market_saturations(config.market_saturation_trickle_rate);
            if(is_in_trade()) {
                //update displayed prices due to recovery
                update_displayed_character_inventory({is_trade: true});
                update_displayed_trader_inventory();
            }
        }

        /*
            P-14 phase 7, Q-13. One roll per in-game minute, only in the two places that
            carry a trace and only once the player has read them - the module holds all
            three of those conditions and the odds.

            Here rather than anywhere else because this tick IS the in-game minute, which
            is the only cadence in the game that makes one in ten thousand mean what the
            owner meant by it. The rain counter two blocks down is the same shape already:
            a per-tick thing that only happens in some places.

            No interruption, no dialogue, nothing to click. The player is in the middle of
            whatever they were doing and this happens next to them, which is the entire
            point of it not being a scene the story walks you into.
        */
        if(rolls_a_sighting({location_name: current_location.name,
                has_read_the_shelters: global_flags.has_read_the_shelters,
                has_seen_the_animal: global_flags.has_seen_the_animal})) {
            global_flags.has_seen_the_animal = true;
            log_message(translationManager.getText(language, "log the animal seen"),
                "notification");
            /*
                The lake's description gains its last paragraph, so redraw - but only when
                the plain location is what is on screen. An empty content stack is what
                that means here, and redrawing over a running activity or an open dialogue
                would throw away the panel the player is actually using.
            */
            if(!content_stack.length) {
                reload_normal_location();
            }
        }

        /*
            The guild's board (P-41, Q-14: per game day). Asked every tick rather than
            hooked onto the day boundary two blocks up, because refreshed_board hands back
            the SAME object when the day has not turned - so the comparison below is the
            whole cost, and a board loaded from a save with no day in it rolls one on the
            next tick without needing a special case anywhere.
        */
        const board = refreshed_board({
            board: game_state.guild_board,
            day: current_game_time.day_count,
            standing: character.reputation["Guild"] ?? 0,
        });
        if(board !== game_state.guild_board) {
            game_state.guild_board = board;
            update_displayed_guild_board();
        }

        //update effect durations and displays;
        were_stats_updated = were_stats_updated || update_effect_durations({time_in_minutes: 1});
        update_displayed_effect_durations();
        update_displayed_effects();

        const new_temperature = get_current_temperature_smoothed();

        if(!current_location.is_under_roof) {
            //not under roof, background animations can happen
            if(is_raining()) {
                if(game_state.rain_counter >= time_until_wet) {
                //been in rain long enough, add wet even if present
                    add_active_effect("Wet",30);
                } else {
                    //haven't been in rain long enough, increase the counter

                    if(new_temperature < 0)
                        //snowing, doesn't soak the player as much the rain
                        game_state.rain_counter += 0.25
                    else 
                        game_state.rain_counter++;
                }

                if(!was_raining && game_options.do_background_animations) {

                    window.removeEventListener("resize", start_stars_animation);

                    if(new_temperature >= 0) {
                        window.addEventListener("resize", start_rain_animation);
                        window.removeEventListener("resize", start_snow_animation);
                        start_rain_animation();
                    } else {
                        window.addEventListener("resize", start_snow_animation);
                        window.removeEventListener("resize", start_rain_animation);
                        start_snow_animation();
                    }
                }

                was_raining = true && game_options.do_background_animations;
            } else {
                //not raining

                if(game_state.rain_counter > 0) {
                    //not in rain -> reduce rain counter
                    game_state.rain_counter--;
                }
                was_raining = false;

                //not in rain -> sky visible
                if(!was_starry && is_night()) {

                    if(game_options.do_background_animations) {
                        window.addEventListener("resize", start_stars_animation);
                        window.removeEventListener("resize", start_snow_animation);
                        window.removeEventListener("resize", start_rain_animation);
                        start_stars_animation();
                    }
                    was_starry = true && game_options.do_background_animations;
                } else if(was_starry && !is_night()) {
                    stop_background_animation();
                    window.removeEventListener("resize", start_stars_animation);
                }
            }

            if(game_options.change_background_color) {
                set_light_based_background_color(true);
            }
            
        } else {
            //under roof
            if(was_raining || was_starry) {
                //was animation - stop doing that
                stop_background_animation();
                window.removeEventListener("resize", start_stars_animation);
                window.removeEventListener("resize", start_snow_animation);
                window.removeEventListener("resize", start_rain_animation);
            }
            was_raining = false;
            was_starry = false;
            if(game_options.change_background_color) {
                set_light_based_background_color(false);
            }
        }

        //temperature changed => update stats if needed, update display
        if(current_temperature !== new_temperature) {
            if(!were_stats_updated) {
                update_character_stats();
            }

            update_displayed_temperature();
        }
        
        current_temperature = new_temperature;

        //add cold status if applicable
        let was_effect_added = false;
        for(let i = cold_status_temperatures.length - 1; i >= 0; i--) {
            if(current_temperature + get_character_cold_tolerance() <= cold_status_temperatures[i]) {
                if((active_effects["Wet"] && cold_status_counters[i] >= time_until_cold_when_wet) || (cold_status_counters[i] >= time_until_cold)) {
                    if(was_effect_added) {
                        continue;
                    }
                    add_active_effect(cold_status_effects[i],60);
                } else {
                    cold_status_counters[i]++;
                }

                add_xp_to_skill({skill: skills["Cold resistance"], xp_to_add: 0.2});
            } else {
                if(cold_status_counters[i] > 0) {
                    cold_status_counters[i]--;
                }
            }
        }

        if("parent_location" in current_location){ //if it's a combat_zone

            //use consumables if their longest effect ran out
            //remove them from list if there are no more in inventory
            Object.keys(favourite_consumables).forEach(item_id => {
                const inv_key = item_templates[item_id].getInventoryKey();
                if(!character.inventory[inv_key]) {
                    //if out of item, remove it from auto-consume
                    remove_consumable_from_favourites(item_id);
                    return;
                }

                const effects = item_templates[item_id].effects.sort((a,b) => {
                    if(game_options.auto_use_when_longest_runs_out) {
                        return b.duration-a.duration;
                    } else {
                         return a.duration-b.duration;
                    }
                });

                //if effect not active, use item and return
                if(!active_effects[effects[0].effect]) {
                    use_item(inv_key);
                    //use will call 'remove item' which will call 'remove consumable from favs', so nothing more to do here
                    return;
                }
            });


            //go through location's types, check if any of them applie active effects, if so then add them
            for(let i = 0; i < current_location.types.length; i++) {
                const effect_key = current_location.types[i].type;
                const stage = current_location.types[i].stage;
                if(location_types[effect_key].stages[stage].applied_effects) {
                    for(let j = 0; j < location_types[effect_key].stages[stage].applied_effects.length; j++) {
                        add_active_effect(location_types[effect_key].stages[stage].applied_effects[j].effect, location_types[effect_key].stages[stage].applied_effects[j].duration);
                    }
                }
            }

            add_xp_to_skill({skill: skills["Breathing"], xp_to_add: 0.1});
        } else { //everything other than combat
            if(is_sleeping) {
                do_sleeping();
                add_xp_to_skill({skill: skills["Sleeping"], xp_to_add: current_location.housing?.sleeping_xp_per_tick});
            }
            else {
                if(is_resting) {
                    do_resting();
                }
                if(is_reading) {
                    do_reading();
                }
            } 

            if(selected_stance.id !== current_stance.id) {
                change_stance({stance_id: selected_stance.id});
            }

            if(current_activity) { //in activity

                //if effects: add them
                if(current_activity.applied_effects) {
                    for(let i = 0; i < current_activity.applied_effects.length; i++) {
                        add_active_effect(current_activity.applied_effects[i].effect, current_activity.applied_effects[i].duration);
                    }
                }

                if(activities[current_activity.activity_name].type === "TRAINING") {
                    add_xp_to_skill({skill: skills["Breathing"], xp_to_add: 0.5});
                } else {
                    add_xp_to_skill({skill: skills["Breathing"], xp_to_add: 0.1});
                }

                //ticks are varied for gathering activities, 1 second for most other activities
                current_activity.gathering_time += 1;

                if(!current_activity.xp_given_per_working_period) {
                    add_xp_to_activity_skills();
                }

                if(current_activity.gathering_time >= current_activity.gathering_time_needed) { 
                    const {gathering_time_needed, gained_resources, quality_range} = current_activity.getActivityEfficiency();
                    const items = [];

                    //add xp
                    if(current_activity.xp_given_per_working_period) {
                        add_xp_to_activity_skills();
                    }

                    //add resource drops (if defined)
                    if (gained_resources) {
                        for(let i = 0; i < gained_resources.length; i++) {
                            if(Math.random() > (1-gained_resources[i].chance)) {
                                const count = random_range(gained_resources[i].count[0], gained_resources[i].count[1]);
                                let quality = null;

                                //quality
                                if (quality_range) {
                                    quality = Math.round(random_range(quality_range[0], quality_range[1]) / 4) * 4;
                                }

                                items.push({item_id: gained_resources[i].name, quality: quality, count: count});

                                game_state.gathered_materials[gained_resources[i].name] = (game_state.gathered_materials[gained_resources[i].name] || 0) + count;
                            }
                        }

                        if(items.length > 0) {
                            process_current_loot({loot_list: items});
                            

                            for(let i = 0; i < items.length; i++) {
                                current_activity.gathered_materials[items[i].item_id] = (current_activity.gathered_materials[items[i].item_id] + items[i].count || items[i].count);
                            }
                        
                            add_to_character_inventory(items);
                        }

                        update_gathering_tooltip(current_activity);
                    }

                    //if job: payment
                    if (activities[current_activity.activity_name].type === "JOB") {
                        current_activity.earnings += current_activity.get_payment();
                    }

                    current_activity.gathering_time = 0;
                    current_activity.gathering_time_needed = gathering_time_needed;
                }

                update_displayed_ongoing_activity(current_activity);

                if(!can_work(current_activity)) {
                    end_activity();
                }
                
            } else {
                //no current activity

                add_xp_to_skill({skill: skills["Breathing"], xp_to_add: 0.1});
                const divs = document.getElementsByClassName("activity_div");
                //go through all displayed activities, if they are of proper type check if they are available and if there's a change, modify their display
                for(let i = 0; i < divs.length; i++) {
                    const activity = current_location.activities[divs[i].getAttribute("data-activity")];

                    if(activities[activity.activity_name].type === "JOB" || activities[activity.activity_name].type === "TRAINING") {
                        if(can_work(activity)) {
                            divs[i].classList.remove("activity_unavailable");
                            divs[i].classList.add("start_activity");
                        } else {
                            divs[i].classList.remove("start_activity");
                            divs[i].classList.add("activity_unavailable");
                        }
                        
                    }
                }
            }

            let sounds = current_location.getBackgroundNoises();
            if(sounds.length > 0){
                if(Math.random() < 1/600) {
                    log_message(`"${sounds[Math.floor(Math.random()*sounds.length)]}"`, "background");
                }
            }
            if (current_activity && Math.random() < 1/100) {
                sounds = activities[current_activity.activity_name].getBackgroundNoises();
                if(sounds.length > 0){
                    log_message(`"${sounds[Math.floor(Math.random()*sounds.length)]}"`, "background");
                }
            }
        }

        let health_to_add = 0;
        let health_to_subtract = 0
        //health regen
        if(character.stats.full.health_regeneration_flat) {
            health_to_add += character.stats.full.health_regeneration_flat;
        }
        if(character.stats.full.health_regeneration_percent) {
            health_to_add += character.stats.full.max_health * character.stats.full.health_regeneration_percent/100;
        }
        //health loss
        if(character.stats.full.health_loss_flat) {
            health_to_subtract -= character.stats.full.health_loss_flat;
        }
        if(character.stats.full.health_loss_percent) {
            health_to_subtract += character.stats.full.max_health * character.stats.full.health_loss_percent/100;
        }

        update_health({ammount_to_restore: health_to_add, ammount_to_loose: health_to_subtract});

        //stamina regen
        if(character.stats.full.stamina_regeneration_flat) {
            character.stats.full.stamina += character.stats.full.stamina_regeneration_flat;
        }
        if(character.stats.full.stamina_regeneration_percent) {
            character.stats.full.stamina += character.stats.full.max_stamina * character.stats.full.stamina_regeneration_percent/100;
        }
        //mana regen
        if(character.stats.full.mana_regeneration_flat) {
            character.stats.full.mana += character.stats.full.mana_regeneration_flat
        }
        if(character.stats.full.mana_regeneration_percent) {
            character.stats.full.mana += character.stats.full.max_mana * character.stats.full.mana_regeneration_percent/100;
        }

        if(character.stats.full.stamina > character.stats.full.max_stamina) {
            character.stats.full.stamina = character.stats.full.max_stamina
        } else if(character.stats.full.stamina < 0) {
            character.stats.full.stamina = 0;
        }

        if(character.stats.full.stamina_regeneration_flat || character.stats.full.stamina_regeneration_percent) {
            update_displayed_stamina();
        }
        
        game_state.save_counter += 1;
        if(game_state.save_counter >= save_period*tickrate) {
            game_state.save_counter = 0;
            if(is_on_dev()) {
                save_to_localStorage({key: dev_save_key});
            } else {
                save_to_localStorage({key: save_key});
            }
            console.log("Auto-saved the game!");
        } //save in regular intervals, irl time independent from tickrate

        backup_counter += 1;
        if(backup_counter >= backup_period*tickrate) {
            backup_counter = 0;
            let saved_at;
            if(is_on_dev()) {
                saved_at = save_to_localStorage({key: dev_backup_key});
            } else {
                saved_at = save_to_localStorage({key: backup_key});
            }

            if(saved_at) {
                update_backup_load_button(saved_at);
            }
            console.log("Created an automatic backup!");
        }

        if(!is_sleeping && current_location && current_location.light_level === "normal" && is_night()) {
            add_xp_to_skill({skill: skills["Night vision"], xp_to_add: 1});
        }

        //add xp to proper skills based on location types
        if(current_location) {
            const skills = current_location.gained_skills;
            let leveled = false;
            for(let i = 0; i < skills?.length; i++) {
                leveled = add_xp_to_skill({skill: current_location.gained_skills[i].skill, xp_to_add: current_location.gained_skills[i].xp}) || leveled;
            }
            if(leveled){
                update_displayed_location_types(current_location);
            }
        }

        //limiting maximum adjustment, to avoid any absurd results;
        if(time_variance_accumulator <= 100/tickrate && time_variance_accumulator >= -100/tickrate) {
            time_adjustment = time_variance_accumulator;
        }
        else {
            if(time_variance_accumulator > 100/tickrate) {
                time_adjustment = 100/tickrate;
            }
            else {
                if(time_variance_accumulator < -100/tickrate) {
                    time_adjustment = -100/tickrate;
                }
            }
        }

        run_stats.total_playtime += 1/tickrate;
        update();
    }, 1000/tickrate - time_adjustment);
    //uses time_adjustment based on time_variance_accumulator for more precise overall stabilization
    //(instead of only stabilizing relative to previous tick, it stabilizes relative to sum of deviations)
    //probably completely unnecessary lol, but hey, it sounds cool
}

function run() {
    /*
        Grafts the shared availability methods onto every class that registered a
        component. Done here rather than at module scope because it has to happen after
        the modules that declare those classes have evaluated, and main.js is the entry
        point - its body runs last.
    */
    fill_availability_methods();

    if(typeof current_location === "undefined") {
        change_location({location_id: "Village", skip_travel_time: true});
    } 

    if(current_location.parent_location) {
        start_combat();
    }
    
    update_displayed_health();
    fill_character_bio();
        
    start_date = Date.now();
    update();

    if(game_options.change_background_color) {
        set_light_based_background_color(!current_location.is_under_roof);
    }
}

//The tooltip movers are in an inline script in index.html, which cannot import.
window.place_tooltip_vertically = place_tooltip_vertically;
window.equip_item = character_equip_item;
window.unequip_item = character_unequip_item;

window.change_location = change_location;
/**
 * Taking a job off the guild's board.
 *
 * @param {Number} index which of the offered jobs
 */
function accept_guild_job(index) {
    const board = accept_from_board({board: game_state.guild_board, index});
    if(board === game_state.guild_board) {
        //Nothing to say: either a job is already held, which the panel states, or the
        //index named nothing, which the player cannot do from the buttons that exist.
        return;
    }
    game_state.guild_board = board;
    log_message(translationManager.getText(language, "log guild job taken"), "notification");
    update_displayed_guild_board();
}

/**
 * Handing the taken job back to the clerk.
 *
 * Everything is re-checked here rather than trusted from the panel. The button is only
 * drawn when the job is done, but the panel is redrawn on a tick and a click is not - and
 * a gather job can stop being done between the two, because selling the goods is a thing
 * a player does while the journal is open.
 */
function hand_in_guild_job() {
    const board = game_state.guild_board;
    const job = board?.accepted;
    if(!job || !job_is_done(job, character.inventory)) {
        return;
    }

    if(job.type === "gather") {
        /*
            Removed by inventory key, and the count can span several stacks - a
            quality-rolled material is held in one stack per quality. Taken cheapest first
            so a player who has kept a good one keeps it: the guild asked for a count, not
            for the best of what you have.
        */
        let owed = job.count;
        const stacks = Object.keys(character.inventory)
            .filter(key => {
                try {
                    return JSON.parse(key)?.id === job.target;
                } catch (malformed) {
                    return false;
                }
            })
            .sort((first, second) => {
                const quality = (key) => {
                    try {
                        return JSON.parse(key)?.quality ?? 0;
                    } catch (malformed) {
                        return 0;
                    }
                };
                return quality(first) - quality(second);
            });

        for(const key of stacks) {
            if(owed <= 0) {
                break;
            }
            const taking = Math.min(owed, character.inventory[key].count);
            remove_from_character_inventory([{item_key: key, item_count: taking}]);
            owed -= taking;
        }
        update_displayed_character_inventory();
    }

    const standing = standing_paid_for(job, character.reputation["Guild"] ?? 0);
    game_state.guild_board = {...board, accepted: null};

    /*
        Through process_rewards, so the standing is granted and displayed the way every
        other grant in the game is rather than written straight onto the character - and
        skipped entirely when there is nothing to grant.

        Nothing to grant means the top of the ladder, which is the ceiling Q-14 asked for.
        The work is still taken in; it is the book that has no further up to go, and the
        line says which of the two happened rather than claiming a promotion it did not
        give.
    */
    if(standing > 0) {
        process_rewards({
            rewards: {reputation: {Guild: standing}},
            source_type: "action",
            source_name: "guild clerk",
        });
    }

    log_message(translationManager.getText(language, standing > 0
        ? "log guild job handed in"
        : "log guild job handed in at the top"), "notification");
    update_displayed_guild_board();
}

window.hand_in_guild_job = hand_in_guild_job;
window.accept_guild_job = accept_guild_job;
window.reload_normal_location = reload_normal_location;
window.handleLocationIconClick = handle_location_icon_click;
window.remove_location_from_favourites = remove_location_from_favourites;

window.start_dialogue = start_dialogue;
window.end_dialogue = end_dialogue;
window.start_textline = start_textline;

window.remove_fast_travel_choice = remove_fast_travel_choice;

window.start_activity = start_activity;
window.travel_to = travel_to;
window.end_activity = end_activity;

window.start_game_action = start_game_action;
window.retry_game_action = retry_game_action;
window.end_game_action = end_game_action;

window.start_sleeping = start_sleeping;
window.end_sleeping = end_sleeping;

window.start_reading = start_reading;
window.end_reading = end_reading;

window.start_trade = start_trade;
window.exit_trade = exit_trade;
window.add_to_buying_list = add_to_buying_list;
window.remove_from_buying_list = remove_from_buying_list;
window.add_to_selling_list = add_to_selling_list;
window.remove_from_selling_list = remove_from_selling_list;
window.cancel_trade = cancel_trade;
window.accept_trade = accept_trade;
window.is_in_trade = is_in_trade;
window.update_displayed_total_price = update_displayed_total_price;

window.open_storage = open_storage;
window.exit_storage = close_storage;
window.move_item_to_storage = move_item_to_storage;
window.remove_item_from_storage = remove_item_from_storage;
window.is_storage_open = is_storage_open;

window.format_money = format_money;
window.get_character_money = character.get_character_money;

window.use_item = use_item;
window.change_consumable_favourite_status = change_consumable_favourite_status;
window.change_item_favourite_status = change_item_favourite_status;
window.update_fav_display = update_fav_display;

window.do_enemy_combat_action = do_enemy_combat_action;

window.sort_displayed_inventory = sort_displayed_inventory;
window.update_displayed_discoveries = update_displayed_discoveries;
window.update_displayed_guild_board = update_displayed_guild_board;
//The crafting page's "only what I can make" box calls it (P-39).
window.update_displayed_crafting_recipes = update_displayed_crafting_recipes;
window.update_displayed_lore = update_displayed_lore;
window.update_displayed_titles = update_displayed_titles;
window.update_displayed_character_inventory = update_displayed_character_inventory;
window.update_displayed_trader_inventory = update_displayed_trader_inventory;
window.update_displayed_storage_inventory = update_displayed_storage_inventory;

window.sort_displayed_skills = sort_displayed_skills;

window.change_stance = change_stance;
window.fav_stance = fav_stance;

window.openCraftingWindow = open_crafting_window;
window.closeCraftingWindow = close_crafting_window;
window.switchCraftingRecipesPage = switch_crafting_recipes_page;
window.switchCraftingRecipesSubpage = switch_crafting_recipes_subpage;
window.useRecipe = use_recipe;
window.updateDisplayedComponentChoice = update_displayed_component_choice;
window.updateDisplayedMaterialChoice = update_displayed_material_choice;
window.updateRecipeTooltip = update_recipe_tooltip;

window.remove_from_content_stack = remove_from_content_stack;

window.option_uniform_textsize = option_uniform_textsize;
window.option_bed_return = option_bed_return;
window.option_combat_autoswitch = option_combat_autoswitch;
window.option_remember_filters = option_remember_filters;
window.option_use_uncivilised_temperature_scale = option_use_uncivilised_temperature_scale;
window.option_do_background_animations = option_do_background_animations;
window.option_change_background_color = option_change_background_color;
window.option_skip_play_button = option_skip_play_button;
window.option_mofu_mofu_mode = option_mofu_mofu_mode;
window.option_do_enemy_onhit_animations = option_do_enemy_onhit_animations;
window.option_expo_threshold = option_expo_threshold;
window.option_language = option_language;
window.option_hide_max_level_skills = option_hide_max_level_skills;
window.option_use_text_outlines_for_tooltips = option_use_text_outlines_for_tooltips;
window.option_use_text_outlines_for_bars = option_use_text_outlines_for_bars;
window.option_do_dynamic_loot_message = option_do_dynamic_loot_message;

window.change_completed_quest_visibility = change_completed_quest_visibility;

window.getDate = get_date;

window.isOnDev = is_on_dev;

window.saveProgress = save_progress;
window.save_to_file = save_to_file;
window.load_progress = load_from_file;
window.loadBackup = load_backup;
window.importOtherReleaseSave = load_other_release_save;
window.hardReset = hard_reset;
window.get_game_version = get_game_version;

window.run = run;

//Verify_Game_Objects();
/**
 * Development console, off until it is asked for.
 *
 * Typed once in the browser console:
 *
 *     enable_dev_console()
 *
 * After that a handful of functions exist as bare globals, so a change can be
 * exercised without playing up to it:
 *
 *     add_active_effect("Coffee", 1800)
 *     give({items: ["White iron ore"], money: 50000})
 *     give({items: [{item: "Iron ore", count: 50}]})
 *     give({items: [{item: "Iron sword", quality: 120}]})
 *     give_best()
 *     add_best_effect(1800)
 *     goto("The bay")
 *
 * Deliberately NOT on by default and deliberately NOT saved. A reload turns it off
 * again. It can hand out every item in the game and walk to any room, which is
 * exactly what makes it useful and exactly why it should not be one typo away from a
 * player who opened devtools to look at something else. is_on_dev() is not the gate
 * either: the dev release is still a release somebody plays.
 *
 * The functions are the game's own. Nothing here is a second implementation of a
 * reward or an unlock - `give` is process_rewards, which is the same path a quest
 * takes, so anything granted here behaves the way the content would have granted it.
 */
/*
    The development speed multiplier.

    tickrate is the divisor of every wall-clock delay in this file - the main loop,
    the enemy timers, the character timer, the action timers - and it is also the
    divisor of every per-tick accounting term, so raising it means more ticks per
    second with each tick still worth exactly what it was. That makes it the only
    place a speed control belongs: nothing else has to know about it.

    Not saved. A reload is back to 1x, which is the right default for something that
    makes every activity, book and journey trivial.
*/
let game_speed = 1;

function set_game_speed(multiplier) {
    //10x was not enough for a book that takes 420 in-game minutes.
    const allowed = [1, 2, 5, 10, 20, 50, 100, 200, 500,1000, 2000, 5000, 10000];
    if(!allowed.includes(multiplier)) {
        console.error(`Speed must be one of ${allowed.join(", ")}.`);
        return game_speed;
    }
    game_speed = multiplier;
    tickrate = config.tickrate * game_speed;

    //An action already running holds its own interval, which has to be re-armed to
    //notice this at all.
    rearm_game_action_interval();

    //The buttons only exist once the dev console has revealed them.
    const buttons = document.getElementsByClassName("game_speed_button");
    for(let i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("active_selection_button",
            Number(buttons[i].dataset.game_speed) === game_speed);
    }
    return game_speed;
}

/**
 * Reveals the speed buttons in the bottom panel.
 *
 * Called by enable_dev_console. They are in the markup from the start so the panel's
 * layout is the same either way, and hidden with a class rather than built on demand.
 */
function show_game_speed_controls() {
    document.getElementById("game_speed_controls")?.classList.add("game_speed_visible");
    set_game_speed(game_speed);
}

/**
 * How good an equippable is, measured the way its own slot measures things.
 *
 * A weapon has attack, armour has defense, a shield has block strength; an artifact, an
 * amulet, a ring and the tools have none of those, so they are ranked by what the game
 * itself prices them at.
 */
function rank_equippable(template, quality) {
    if(template.getAttack) {
        return template.getAttack(quality);
    }
    if(template.getDefense) {
        return template.getDefense(quality);
    }
    if(template.getShieldStrength) {
        return template.getShieldStrength(quality);
    }
    return template.getBaseValue({quality});
}
/*
    The dev console across a reload, and only across a reload.

    sessionStorage is the whole mechanism, and it is the mechanism because its lifetime is
    exactly the behaviour that was asked for: it survives a refresh and dies when the tab
    closes. No flag to clear, no timer, and nothing to get out of step with anything.

    It must NOT be in the save, and that is not a style preference. The export is a file
    players hand to each other and paste into the import box; a save that carried "dev mode
    was on" would turn it on for somebody who never asked for it, on a machine where the
    console was never opened. check_dev_console_is_not_saved holds that line.

    Every access is wrapped: sessionStorage throws outright in some privacy modes rather
    than returning null, and a dev convenience must never be the reason the game fails to
    boot.
*/
const dev_console_session_key = "dev_console_on";

function remember_dev_console() {
    try {
        sessionStorage.setItem(dev_console_session_key, "true");
    } catch {
        //Blocked storage. The console still works for this page; it just will not come
        //back after a refresh, which is the lesser half of the feature.
    }
}

/** Whether this tab had the dev console on before it was reloaded. */
function was_dev_console_on() {
    try {
        return sessionStorage.getItem(dev_console_session_key) === "true";
    } catch {
        return false;
    }
}

function enable_dev_console() {
    const list = (registry) => Object.keys(registry).sort();

    //Captured before the globals are attached. Module scope would win over window
    //anyway, so `add_active_effect` inside the wrapper is already the real function -
    //but a reader should not have to know that to be sure the wrapper is not calling
    //itself.
    const real_add_active_effect = add_active_effect;

    const helpers = {
        //The one this was added for. Duration is in in-game minutes, like every
        //duration in content: {effect: "Coffee", duration: 150} is what an item says.
        add_active_effect: (effect_key, duration = 600) => {
            if(!effect_templates[effect_key]) {
                console.error(`No such effect as "${effect_key}". Try list_effects().`);
                return;
            }
            real_add_active_effect(effect_key, duration);
            return `${effect_key} for ${duration} minutes`;
        },

        //Everything the content can grant, through the path the content grants it by.
        //The shape is a rewards object exactly as written in quests.js or dialogues.js.
        give: (rewards) => {
            process_rewards({rewards, source_type: "dev console", source_name: "dev console"});
            return Object.keys(rewards);
        },


        /*
            The best of everything, into the inventory.

            Sixteen slots is sixteen `give` calls and sixteen names to remember, which is
            the whole reason this exists. Each slot's highest-ranking item is built at the
            requested quality through getItem - the same call the inventory itself makes
            for a quality that is not the template's own.

            It does NOT equip anything. Handing over sixteen items and choosing what to
            wear are two different decisions, and only the first one is tedious.

            250 by default, which is the bottom of mythical.
        */
        give_best: (quality = 250) => {
            if(typeof quality !== "number" || !(quality > 0)) {
                console.error(`Quality has to be a positive number, got "${quality}".`);
                return;
            }

            const best = {};
            Object.values(item_templates).forEach(template => {
                if(!template.equip_slot) {
                    return;
                }
                const score = rank_equippable(template, quality);
                if(!best[template.equip_slot] || score > best[template.equip_slot].score) {
                    best[template.equip_slot] = {template, score};
                }
            });

            const granted = [];
            Object.keys(best).sort().forEach(slot => {
                const item = getItem({...best[slot].template, quality});
                add_to_character_inventory([{item_key: item.getInventoryKey(), count: 1}]);
                granted.push(`${slot}: ${item.getName()}`);
            });
            return granted;
        },
        /*
            Every good effect at once, the counterpart to give_best.

            Which effects count as good is read off the templates - `tags.buff` - and
            never hand-listed here. A list written out in this file would be correct
            until the next effect is added and then quietly wrong, and the data already
            carries the answer: Tipsy raises agility and is tagged debuff, so the tag
            knows something that reading the stat signs would not.

            Effects sharing a group_tag do not stack: add_active_effect keeps the
            stronger and skips the weaker. No buff declares a group today - only the
            cold stages do - so all twenty-two currently apply together, measured in
            the browser. The skipped list is still reported rather than assumed empty,
            because the day a buff joins a group the count would otherwise just be
            quietly short.

            Duration is in in-game minutes, like every duration in content.
        */
        add_best_effect: (duration = 1800) => {
            if(typeof duration !== "number" || !(duration > 0)) {
                console.error(`Duration has to be a positive number of in-game minutes, got "${duration}".`);
                return;
            }

            const good = Object.keys(effect_templates).filter(key => effect_templates[key].tags?.buff);
            const applied = [];
            const skipped = [];
            good.sort().forEach(key => {
                real_add_active_effect(key, duration);
                (active_effects[key] ? applied : skipped).push(key);
            });

            return skipped.length
                ? {applied, held_back_by_a_stronger_effect: skipped}
                : applied;
        },
        add_money: (amount) => { add_money_to_character(amount); return character.money; },
        add_xp: (amount) => { add_xp_to_character(amount); return character.xp.current_level; },
        add_skill_xp: (skill, amount) => {
            if(!skills[skill]) {
                console.error(`No such skill as "${skill}". Try list_skills().`);
                return;
            }
            add_xp_to_skill({skill: skills[skill], xp_to_add: amount});
            return skills[skill].current_level;
        },

        //Unlocks the room first, because walking somewhere locked is the usual reason
        //this is being typed at all.
        goto: (location_name) => {
            if(!locations[location_name]) {
                console.error(`No such location as "${location_name}". Try list_locations().`);
                return;
            }
            unlock_location({location: locations[location_name], skip_message: true});
            change_location({location_id: location_name});
            return location_name;
        },

        set_flag: (flag, value = true) => {
            if(!(flag in global_flags)) {
                console.error(`No such flag as "${flag}". Known: ${list(global_flags).join(", ")}`);
                return;
            }
            global_flags[flag] = value;
            return `${flag} = ${value}`;
        },

        list_effects: () => list(effect_templates),
        list_items: () => list(item_templates),
        list_locations: () => list(locations),
        list_skills: () => list(skills),
        list_quests: () => list(quests),
        list_dialogues: () => list(dialogues),
        list_flags: () => list(global_flags),

        //Same control as the buttons, for when the console is where your hands are.
        set_speed: (multiplier) => set_game_speed(multiplier),
    };

    Object.keys(helpers).forEach(name => { window[name] = helpers[name]; });
    show_game_speed_controls();
    remember_dev_console();

    console.log("dev console on. Survives a reload, gone when you close the tab. Not saved.");
    console.log("game speed buttons are now in the bottom panel; set_speed(1|2|5|10) also works.");
    console.log(Object.keys(helpers).join("(), ") + "()");
    return Object.keys(helpers);
}

window.Verify_Game_Objects = Verify_Game_Objects;

//The only thing the dev console exposes by itself. Everything else it hands out
//appears when this is called.
window.enable_dev_console = enable_dev_console;
//Reachable from the markup's onclick, but the buttons stay hidden until the dev
//console reveals them.
window.set_game_speed = set_game_speed;

//Stays English, and this comment used to say it was because no locale was loaded
//yet. That is no longer the reason - translation.js imports the locales
//statically, so a lookup here would work. The reason now is that the save has not
//been read yet, so `language` still holds the default at this line: a translated
//string would come out English for a Turkish player anyway. Keeping it a literal
//says so on purpose rather than by accident.
set_loading_screen_progress("Waking up from a nyap...");

//check if there's an existing save file, otherwise just do some initial setup
if(!is_on_dev() && save_key in localStorage || is_on_dev() && (dev_save_key in localStorage || !("skip_live_import" in localStorage) && save_key in localStorage )) {
    load_from_localstorage();
    update_character_stats();
    update_displayed_xp_bonuses();
} else {
    set_loading_screen_versions();
    add_to_character_inventory([
                                //{item_id: "Cheap iron sword", quality: 50},
                                {item_id: "Cheap leather pants", quality: 40},
                                {item_id: "Stale bread", count: 5},
                            ]);

    add_xp_to_character(0);
    character.money = 102;
    update_displayed_money();
    update_character_stats();

    update_displayed_stance_list(stances, current_stance);
    change_stance({stance_id: "normal"});
    create_displayed_crafting_recipes();
    change_location({location_id: "Village", skip_travel_time: true});
    questManager.startQuest({quest_id: "Lost memory"});

    game_state.last_rewarded_export = Date.now() - 1000*60*60*16; //reduces timer by 16 hours, making first reward export appear in 4 hours from starting
}

//Populated from `languages` so adding a language needs no HTML edit.
const language_selector = document.getElementById("options_language");
if(language_selector) {
    language_selector.innerHTML = "";
    Object.keys(languages).forEach(key => {
        const option = document.createElement("option");
        option.value = key;
        option.innerText = language_names[key] || key;
        language_selector.append(option);
    });
    language_selector.value = language;
}

if(!game_state.is_loading_error) {
    //Deliberately untranslated flavour, and no longer for a technical reason: the
    //locales are already in memory here and the save's language has been read, so
    //this line COULD be a text id. It is not, because it is a joke - and because
    //the init below has nothing to fetch for a locale listed in translation.js's
    //bundled_locales, so this message is only ever on screen long enough to read
    //if a language is added without being bundled. If it is ever wanted
    //translated it needs an id in every locale, not a literal.
    set_loading_screen_progress("Translating the meows");
    await translationManager.init(language);
    set_loading_screen_progress(translationManager.getText(language, "ui loading waiting for play"));
    translationManager.translateUI(language);
    update_translated_page_links();
    hide_loading_text();
    show_play_button();
} else {
    hide_loading_text();
    await translationManager.init(language);
    translationManager.translateUI(language);
    update_translated_page_links();
    set_play_button_text(translationManager.getText(language, "ui play anyway"));
    show_play_button();
}

play_button.addEventListener("click", hide_loading_screen);

if(!global_flags.is_hero_created && config.do_hero_creation) {
    characterCreator.fill_creation_panel();
    //run is triggered from confirming hero creation
} else {
    play_button.addEventListener("click", run);
    characterCreator.remove_creation_panel();
}

if(config.use_racial_bonuses) {
    character.stats.add_race_bonus();
}

if(config.use_height_bonuses) {
    character.stats.add_height_bonus();
}

/*
    Turn it back on if this tab had it on. Last in the boot sequence on purpose: the panel
    it reveals is DOM, and the helpers it hands out close over registries that the load
    above fills.
*/
if(was_dev_console_on()) {
    enable_dev_console();
}

function add_stuff_for_testing() {
    const items = [];
    for(let i = 1; i < 250; i++) {
        items.push({item_id: "Iron sword", quality:i});
        items.push({item_id: "Cheap iron sword", quality:i});
    }
    add_to_character_inventory(items);
}

function add_all_stuff_to_inventory(count = 10){
    Object.keys(item_templates).forEach(item => {
        add_to_character_inventory([
            {item_id: item, count: count},
        ]);
    })
}

function add_all_active_effects(duration){
    Object.keys(effect_templates).forEach(effect_key => {
        active_effects[effect_key] = new ActiveEffect({...effect_templates[effect_key], duration});
    });
    character.stats.add_active_effect_bonus();
    update_displayed_effects();
}

//add_to_character_inventory([{item_id: "Iron sword", count: 20, quality: 100}]);
//add_to_character_inventory([{item_id: "Iron sword", count: 20, quality: 120}]);
//add_to_character_inventory([{item_id: "Potion of sapping", count: 20}]);

//add_stuff_for_testing();
//add_all_stuff_to_inventory();
//add_all_active_effects(120);
//add_consumable_to_favourites("Stale bread");

update_displayed_equipment();
sort_displayed_inventory({sort_by: "name", target: "character"});

if(game_options.skip_play_button) {
    play_button.click();
}

/**
 * Writes the two save-slot buttons from whatever is in localStorage.
 *
 * Pulled out of the startup sequence so a language switch can call it as well.
 * Their labels were translated but written exactly once, during startup, so
 * switching language left "No backup autosave" and "Import save from dev
 * version" sitting in English under an otherwise Turkish options panel.
 *
 * The dates are read here rather than passed in, because which localStorage key
 * holds which slot depends on is_on_dev() and that is main.js's business.
 */
function update_save_load_buttons() {
    const backup = is_on_dev() ? dev_backup_key : backup_key;
    const other = is_on_dev() ? save_key : dev_save_key;

    if(localStorage[backup]) {
        update_backup_load_button(JSON.parse(localStorage[backup]).saved_at);
    } else {
        update_backup_load_button();
    }

    if(localStorage[other]) {
        update_other_save_load_button(JSON.parse(localStorage[other]).saved_at || "", is_on_dev());
    } else {
        update_other_save_load_button(is_on_dev() ? null : undefined, is_on_dev() || undefined);
    }
}
if(is_on_dev()) {
    log_message(translationManager.getText(language, "log it looks like you are"), "notification");

    update_save_load_buttons();
} else {
    update_save_load_buttons();
}

//Visitor counter, off by default (config.show_visitor_counter). The whole block is
//skipped rather than hidden, so no request reaches the tracker.
//
//The tracked url is derived from the release id rather than hardcoded, so a fork
//only needs to edit config.release_ids. Deployments that are neither main nor dev
//(a local server, a preview build) get an untracked placeholder so they do not
//inflate the real counts.
if(config.show_visitor_counter) {
    const counter_release = is_on_dev() ? config.release_ids.dev
                          : is_on_main() ? config.release_ids.main
                          : null;

    const counter_query = counter_release
        ? `url=${encodeURIComponent(`https://${counter_release}/`)}&label=Visitors`
        : `label=local+build`;

    insert_HTML(
        document.getElementById("bottom_panel_div"),
        `<img id = "hits_counter" src="https://hitscounter.dev/api/hit?${counter_query}&color=%23084298&message=&style=flat&tz=UTC" alt="Visitor counter">`
    );
}
export { language_tags,
        set_language,
        //Read by the lore panel to open on where the player left off.
        current_enemies,
        current_location,
        can_work, active_effects,
        enough_time_for_earnings, add_xp_to_skill, get_effective_skill_xp_gain,
        get_current_book,
        current_stance, selected_stance,
        faved_stances, game_options,
        global_flags,
        character_equip_item,
        unlocked_beds,
        favourite_consumables,
        remove_consumable_from_favourites,
        process_rewards,
        travel_times,
        language,
        add_active_effect,
        favourite_items, remove_item_from_favourites,
        run,
        //Read by save_load.js, which used to live in this file.
        add_xp_to_character,
        backup_key,
        change_location,
        change_stance,
        cold_status_counters,
        current_activity,
        dev_backup_key,
        dev_save_key,
        fav_stance,
        get_date,
        give_export_reward,
        is_on_dev,
        is_reading,
        is_sleeping,
        message_log_filters,
        name_field,
        option_bed_return,
        option_change_background_color,
        option_combat_autoswitch,
        option_do_background_animations,
        option_do_dynamic_loot_message,
        option_do_enemy_onhit_animations,
        option_expo_threshold,
        option_hide_max_level_skills,
        option_mofu_mofu_mode,
        option_remember_filters,
        option_skip_play_button,
        option_uniform_textsize,
        option_use_text_outlines_for_bars,
        option_use_text_outlines_for_tooltips,
        option_use_uncivilised_temperature_scale,
        save_key,
        start_activity,
        start_reading,
        start_sleeping,
        time_field,
};
