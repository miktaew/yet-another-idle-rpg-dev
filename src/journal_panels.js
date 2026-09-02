/** The journal's panels: the bestiary, the book list, the lore page and Discoveries. */

import { get_current_book, global_flags, language } from "./main.js";
import { translationManager } from "./translation.js";
import { capitalize_first_letter, clear_HTML_content, compare_display_names, insert_HTML,
         matches_search, set_HTML } from "./ui_helpers.js";
import { book_stats, item_log, item_templates } from "./items.js";
import { enemy_killcount, enemy_templates } from "./enemies.js";
import { locations } from "./data/locations.js";
import { dialogues } from "./data/dialogues.js";
import { skills } from "./data/skills.js";
import { titles } from "./data/titles.js";
import { traders } from "./traders.js";
import { game_state } from "./game_state.js";
import { enemy_zones, item_sources, lore_unit_of, lore_units, lore_threads, lore_thread_of,
         training_places } from "./world_index.js";
import { create_item_tooltip, create_item_tooltip_content, obscure_name } from "./item_tooltips.js";
import {

        } from "./display.js";
import { item_divs } from "./inventory_display.js";

/*
    item_divs is the one name this module takes back out of display.js - the inventory's
    own map of item id to row, which a discovery line reads to say whether the player is
    holding one. It is read inside a function and never while this module is being
    evaluated, so display.js can still be part-built when this one is entered.
*/

const booklist_entry_divs = {};

const booklist_list = document.getElementById("books_list");

const bestiary_entry_divs = {};

const bestiary_list = document.getElementById("bestiary_list");

/**
 * An enemy tag's name, for the bestiary tooltip.
 *
 * Tags are registry keys - "living", "beast", "wolf rat", plus the size - and the
 * bestiary is the one place a player reads them.
 */
function enemy_tag_label(tag) {
    return translationManager.getText(language, `ui enemy tag ${tag}`);
}

function update_displayed_book(book_id) {
    const book = item_templates[book_id];
    const book_key = book.getInventoryKey();
    if(book_stats[book.name].is_finished) {
        item_divs[book_key].classList.add("book_finished");
        item_divs[book_key].classList.remove("book_active");
    } else if(get_current_book() === book.name) {
        item_divs[book_key].classList.add("book_active");
    } else {
        item_divs[book_key].classList.remove("book_active");
    }

    item_divs[book_key].getElementsByClassName("item_tooltip")[0].remove();
    item_divs[book_key].getElementsByClassName("item_book")[0].appendChild(create_item_tooltip(book));
}

/**
 * creates a new bestiary entry;
 * called when a new enemy is killed (or, you know, loading a save)
 * @param {String} enemy_name 
 */
function create_new_bestiary_entry(enemy_name) {
    const enemy = enemy_templates[enemy_name];

    bestiary_entry_divs[enemy_name] = create_bestiary_entry_content(enemy_name);

    bestiary_entry_divs[enemy_name].setAttribute("data-bestiary_rank", enemy.rank);
    bestiary_entry_divs[enemy_name].classList.add("bestiary_entry_div");
    bestiary_list.appendChild(bestiary_entry_divs[enemy_name]);

    //sorts bestiary_list div by enemy rank
    [...bestiary_list.children].sort((a,b)=> {
        const rank_a = parseInt(a.getAttribute("data-bestiary_rank"));
        const rank_b = parseInt(b.getAttribute("data-bestiary_rank"));
        if(rank_a != rank_b) {
            return rank_a - rank_b;
        } else {
            return compare_display_names(
                a.querySelector(".bestiary_entry_name").innerText,
                b.querySelector(".bestiary_entry_name").innerText);
        }
    }).forEach(node=>bestiary_list.appendChild(node));
}

function create_bestiary_entry_content(enemy_name) {
    const entry_div = document.createElement("div");

    const name_div = document.createElement("div");
    //The key names the entry; the enemy names itself.
    name_div.innerText = enemy_templates[enemy_name].getName();
    name_div.classList.add("bestiary_entry_name");
    const kill_counter = document.createElement("div");
    kill_counter.innerText = enemy_killcount[enemy_name];
    kill_counter.classList.add("bestiary_entry_kill_count");
    
    entry_div.appendChild(name_div);
    entry_div.appendChild(kill_counter);
    entry_div.appendChild(create_bestiary_entry_tooltip(enemy_name));
    return entry_div;
}

function enemy_location_names(enemy_name) {
    return enemy_zones(enemy_name).map(zone => zone.getName()).sort(compare_display_names);
}

function create_bestiary_entry_tooltip(enemy_name) {
    const enemy = enemy_templates[enemy_name];
    const bestiary_tooltip = document.createElement("div");
    bestiary_tooltip.classList.add("bestiary_entry_tooltip");

    const tooltip_xp = document.createElement("div"); //base xp enemy gives
    insert_HTML(tooltip_xp, `<br>${translationManager.getText(language, "ui base xp value")}: ${enemy.xp_value} <br><br>`);
    const tooltip_desc = document.createElement("div"); //enemy description
    tooltip_desc.innerText = enemy.getDescription();

    const tooltip_tags = document.createElement("div"); //enemy description

    Object.keys(enemy.tags).forEach(tag => {
        tooltip_tags.innerText += `[${enemy_tag_label(tag)}] `
    });

    insert_HTML(tooltip_tags, "<br><br>");

    const tooltip_stats = document.createElement("div"); //base enemy stats
    insert_HTML(tooltip_stats, translationManager.getText(language, "ui bestiary stats") + " <br>");

    const stat_line_0 = document.createElement("div");
    stat_line_0.classList.add("grid_container");
    stat_line_0.append(create_bestiary_stat_entry(enemy, "Health"), create_bestiary_stat_entry(enemy, "Defense"));

    const stat_line_2 = document.createElement("div");
    stat_line_2.classList.add("grid_container");
    stat_line_2.append(create_bestiary_stat_entry(enemy, "Attack power"), create_bestiary_stat_entry(enemy, "Attack speed"));

    const stat_line_4 = document.createElement("div");
    stat_line_4.classList.add("grid_container");
    stat_line_4.append(create_bestiary_stat_entry(enemy, "AP"), create_bestiary_stat_entry(enemy, "EP"));
    
    tooltip_stats.appendChild(stat_line_0);
    tooltip_stats.appendChild(stat_line_2);
    tooltip_stats.appendChild(stat_line_4);

    const tooltip_drops = document.createElement("div"); //enemy drops
    tooltip_drops.classList.add("loot_slots_div");
    if(enemy.loot_list.length > 0) {
        tooltip_drops.appendChild(create_bestiary_loot_line());
    }

    for(let i = 0; i < enemy.loot_list.length; i++) {
        tooltip_drops.appendChild(create_bestiary_loot_line(enemy, enemy.loot_list[i]));
    }
    
    //Where to find one. Last, because it is what a player reads after deciding the
    //creature is worth looking for.
    const found_in = enemy_location_names(enemy_name);
    const tooltip_where = document.createElement("div");
    if(found_in.length > 0) {
        insert_HTML(tooltip_where, `<br>`
            + `${translationManager.getText(language, "ui bestiary found in")}: `
            + found_in.join(", "));
    }

    bestiary_tooltip.appendChild(tooltip_desc);
    bestiary_tooltip.appendChild(tooltip_xp);
    bestiary_tooltip.appendChild(tooltip_tags);
    bestiary_tooltip.appendChild(tooltip_stats);
    bestiary_tooltip.appendChild(tooltip_drops);
    bestiary_tooltip.appendChild(tooltip_where);

    return bestiary_tooltip;
}

function update_bestiary_entry_tooltip(enemy_name) {
    const tooltip = bestiary_entry_divs[enemy_name].querySelector(".bestiary_entry_tooltip");
    tooltip.replaceWith(create_bestiary_entry_tooltip(enemy_name));
}

/**
 * updates the entire bestiary entry of an enemy
 * @param {String} enemy_name 
 */
function update_bestiary_entry(enemy_name) {
    set_HTML(bestiary_entry_divs[enemy_name], create_bestiary_entry_content(enemy_name));
}

/**
 * @param {String} enemy_name 
 */
function update_bestiary_entry_killcount(enemy_name) {
    bestiary_entry_divs[enemy_name].children[1].innerText = enemy_killcount[enemy_name];
}

function create_discovery_source_line(source) {
    const line = document.createElement("div");
    line.classList.add("discovery_source_line");

    const label = {
        gather: "ui discovery gathered at",
        drop: "ui discovery dropped by",
        trade: "ui discovery sold by",
        craft: "ui discovery crafted",
        train: "ui discovery trained at",
    }[source.kind];

    //Crafting has no place attached to it, so it is a line and never a button.
    if(source.kind === "craft") {
        const made = document.createElement("div");
        made.classList.add("discovery_source_text");
        //A recipe category IS a skill - cooking, smelting, forging - so it is named by
        //that skill's level-0 name. Not name(), which is the player's current rank in it
        //and would have this line change as they level.
        const discipline = skills[capitalize_first_letter(source.via)];
        made.innerText = `${translationManager.getText(language, label)}: `
            + (discipline
                ? translationManager.getDisplayName(language, discipline.names[0])
                : source.via);
        line.appendChild(made);
        return line;
    }

    const location = locations[source.location_key];
    if(!location) {
        return line;
    }

    //`drop` and `trade` name the creature or the trader as well as the place, because
    //"in the Deep forest" is not an answer on its own when a zone holds several.
    let text = `${translationManager.getText(language, label)}: `;
    if(source.kind === "drop") {
        text += `${enemy_templates[source.via]?.getName() ?? source.via} - ${location.getName()}`;
    } else if(source.kind === "trade") {
        text += `${traders[source.via]?.getDisplayName() ?? source.via} - ${location.getName()}`;
    } else {
        text += location.getName();
    }

    const text_div = document.createElement("div");
    text_div.innerText = text;
    text_div.classList.add("discovery_source_text");
    line.appendChild(text_div);

    //The button itself comes from create_travel_line, which the quest journal uses too.
    const with_button = create_travel_line(location, text);
    line.replaceChildren(...with_button.childNodes);

    return line;
}

/**
 * The "where to train" section: fifteen skills and the places that feed them.
 *
 * Above the items rather than below, because it is fifteen rows against several hundred
 * and a section behind all of those is a section nobody reads.
 */
function append_training_section(list) {
    const places = training_places();
    const skill_ids = Object.keys(places)
        .filter(skill_id => skills[skill_id])
        .sort((first, second) => compare_display_names(
            skills[first].name(), skills[second].name()));

    if(skill_ids.length === 0) {
        return;
    }

    const heading = document.createElement("div");
    heading.classList.add("discovery_heading");
    heading.innerText = translationManager.getText(language, "ui discovery training header");
    list.appendChild(heading);

    skill_ids.forEach(skill_id => {
        const entry = document.createElement("div");
        entry.classList.add("discovery_entry");

        const name = document.createElement("div");
        name.classList.add("discovery_entry_name");
        name.innerText = skills[skill_id].name();
        entry.appendChild(name);

        places[skill_id]
            .slice()
            .sort((first, second) => compare_display_names(first.getName(), second.getName()))
            .forEach(place => {
                entry.appendChild(create_discovery_source_line({kind: "train", location_key: place.id}));
            });

        list.appendChild(entry);
    });
}

/**
 * One remembered exchange: the question asked, and the answer given.
 *
 * A unit can fold several lines into one beat - the swamp scout's account is nine - so
 * the answers are joined rather than listed as separate entries.
 */
function create_lore_entry(unit) {
    const dialogue = dialogues[unit.dialogue];
    const lines = unit.keys.map(key => dialogue.textlines[key]).filter(Boolean);

    const entry = document.createElement("div");
    entry.classList.add("lore_entry");

    const question = document.createElement("div");
    question.classList.add("lore_question");
    question.innerText = translationManager.getText(language, lines[0].name);
    entry.appendChild(question);

    lines.filter(line => line.is_heard).forEach(line => {
        const answer = document.createElement("div");
        answer.classList.add("lore_answer");
        answer.innerText = translationManager.getText(language, line.getText());
        entry.appendChild(answer);
    });

    return entry;
}

/** Who said it, and where they were. */
function lore_speaker_label(dialogue_key) {
    const dialogue = dialogues[dialogue_key];
    const who = capitalize_first_letter(translationManager.getDisplayName(language,
        dialogue.getName({is_mofu_mofu_enabled: global_flags.is_mofu_mofu_enabled})), true);
    const place = locations[dialogue.location_name]?.getName();
    return place ? `${who} - ${place}` : who;
}

/**
 * Redraws the Lore tab.
 *
 * Built fresh each time it is opened, like Discoveries: what is on it changes with every
 * conversation, and it is only on screen while somebody is reading it.
 */
function update_displayed_lore() {
    const list = document.getElementById("lore_list");
    if(!list) {
        return;
    }
    clear_HTML_content(list);

    const everything = document.getElementById("lore_show_everything")?.checked;
    const query = document.getElementById("lore_search")?.value.trim() ?? "";

    const matches = (unit) => {
        if(!query) {
            return true;
        }
        const haystack = [lore_speaker_label(unit.dialogue)].concat(
            unit.keys.map(key => {
                const line = dialogues[unit.dialogue].textlines[key];
                if(!line) {
                    return "";
                }
                return `${translationManager.getText(language, line.name)} `
                    + translationManager.getText(language, line.getText());
            }),
        ).join(" ");
        return matches_search(haystack, query);
    };

    const units = lore_units(everything).filter(matches);

    if(units.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("discovery_empty");
        empty.innerText = translationManager.getText(language, "ui lore none");
        list.appendChild(empty);
        return;
    }

    /*
        Where you left off, which is the half of this the owner asked for twice: a player
        coming back after a week should know what they were in the middle of. Only when
        the last thing heard is still in view - filtering it away and leaving it pinned
        would be a lie about what the list is showing.
    */
    const last = game_state.lore_last && lore_unit_of(game_state.lore_last.dialogue, game_state.lore_last.textline);
    if(last && units.some(unit => unit.dialogue === last.dialogue && unit.head === last.head)) {
        const heading = document.createElement("div");
        heading.classList.add("discovery_heading");
        heading.innerText = translationManager.getText(language, "ui lore resume header");
        list.appendChild(heading);

        const resume = document.createElement("div");
        resume.classList.add("lore_resume");
        const who = document.createElement("div");
        who.classList.add("lore_speaker");
        who.innerText = lore_speaker_label(last.dialogue);
        resume.appendChild(who);
        resume.appendChild(create_lore_entry(last));
        list.appendChild(resume);
    }

    /*
        Threads first, then everybody else.

        A threaded unit appears here and NOT under its speaker below. Splitting it
        across both would put the same beat on the page twice, and the whole point of a
        thread is that six facts learned from three people are one thing rather than
        three conversations (Q-8). Who said it is still on the entry itself.
    */
    const threads = lore_threads(everything)
        .map(group => ({thread: group.thread, units: group.units.filter(matches)}))
        .filter(group => group.units.length > 0);

    if(threads.length > 0) {
        const threads_heading = document.createElement("div");
        threads_heading.classList.add("discovery_heading");
        threads_heading.innerText = translationManager.getText(language, "ui lore threads header");
        list.appendChild(threads_heading);

        threads.forEach(group => {
            const block = document.createElement("details");
            block.classList.add("lore_speaker_block");
            //Open the one the player was last reading, same rule as the speaker blocks.
            block.open = !!last && group.units.some(unit => unit.dialogue === last.dialogue
                && unit.head === last.head);

            const summary = document.createElement("summary");
            summary.classList.add("lore_speaker");
            summary.innerText = `${translationManager.getText(language, group.thread)}`
                + ` · ${group.units.length}`;
            block.appendChild(summary);

            group.units.forEach(unit => block.appendChild(create_lore_entry(unit)));
            list.appendChild(block);
        });
    }

    //Grouped by who said it, in the order the dialogues are declared, which is the order
    //the player meets them.
    const by_speaker = {};
    units.filter(unit => !lore_thread_of(unit)).forEach(unit => {
        (by_speaker[unit.dialogue] ??= []).push(unit);
    });

    //Only when there is something under it: a heading over an empty list reads as a
    //bug, and everything heard being threaded is a perfectly ordinary state.
    if(Object.keys(by_speaker).length === 0) {
        return;
    }

    const heading = document.createElement("div");
    heading.classList.add("discovery_heading");
    heading.innerText = translationManager.getText(language, "ui lore heard header");
    list.appendChild(heading);

    Object.keys(dialogues).filter(key => by_speaker[key]).forEach(dialogue_key => {
        //<details> rather than a class toggle: no click handler, no window assignment,
        //and it works from a keyboard.
        const block = document.createElement("details");
        block.classList.add("lore_speaker_block");
        //The one the player is in the middle of is the one they came back for.
        block.open = !!last && last.dialogue === dialogue_key;

        const summary = document.createElement("summary");
        summary.classList.add("lore_speaker");
        summary.innerText = `${lore_speaker_label(dialogue_key)} · ${by_speaker[dialogue_key].length}`;
        block.appendChild(summary);

        by_speaker[dialogue_key].forEach(unit => block.appendChild(create_lore_entry(unit)));
        list.appendChild(block);
    });
}

function update_displayed_discoveries() {
    const list = document.getElementById("discoveries_list");
    if(!list) {
        return;
    }
    clear_HTML_content(list);

    //Fifteen rows before several hundred: a section behind all the items is a
    //section nobody reads.
    append_training_section(list);

    //getDisplayName, not getName: getName is the canonical English and the translation
    //key, so the whole list came out in English whatever the language was.
    const hide_sourceless = document.getElementById("discoveries_hide_sourceless")?.checked;
    const hide_crafted = document.getElementById("discoveries_hide_crafted")?.checked;
    const hide_traded = document.getElementById("discoveries_hide_traded")?.checked;
    const query = document.getElementById("discoveries_search")?.value.trim() ?? "";

    const found = Object.keys(item_log.items)
        .filter(item_id => item_templates[item_id])
        .filter(item_id => matches_search(item_templates[item_id].getDisplayName(), query))
        .filter(item_id => {
            const sources = item_sources(item_id);
            if(hide_sourceless && sources.length === 0) {
                return false;
            }
            //Only what is nothing BUT crafted: an item you can also gather still has a
            //place to go, which is what the page is for.
            if(hide_crafted && sources.length > 0 && sources.every(s => s.kind === "craft")) {
                return false;
            }
            if(hide_traded && sources.length > 0 && sources.every(s => s.kind === "trade")) {
                return false;
            }
            return true;
        })
        .sort((first, second) => compare_display_names(
            item_templates[first].getDisplayName(), item_templates[second].getDisplayName()));

    if(found.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("discovery_empty");
        empty.innerText = translationManager.getText(language, "ui discovery none");
        list.appendChild(empty);
        return;
    }

    const items_heading = document.createElement("div");
    items_heading.classList.add("discovery_heading");
    items_heading.innerText = translationManager.getText(language, "ui discovery items header");
    list.appendChild(items_heading);

    found.forEach(item_id => {
        const entry = document.createElement("div");
        entry.classList.add("discovery_entry");

        const name = document.createElement("div");
        name.classList.add("discovery_entry_name");
        name.innerText = item_templates[item_id].getDisplayName();
        entry.appendChild(name);

        const count = document.createElement("div");
        count.classList.add("discovery_entry_count");
        count.innerText = translationManager.getText(language, "ui discovery found count",
            {v1: item_log.items[item_id].number});
        entry.appendChild(count);

        const sources = item_sources(item_id);
        if(sources.length === 0) {
            const unknown = document.createElement("div");
            unknown.classList.add("discovery_source_line");
            unknown.innerText = translationManager.getText(language, "ui discovery no source");
            entry.appendChild(unknown);
        } else {
            sources.forEach(source => entry.appendChild(create_discovery_source_line(source)));
        }

        list.appendChild(entry);
    });
}

function create_bestiary_loot_line(enemy, loot) {
    const loot_line = document.createElement("div");
    const loot_name = document.createElement("div");
    const loot_chance = document.createElement("div");
    const loot_chance_base = document.createElement("div");
    const loot_chance_current = document.createElement("div");

    loot_line.classList.add("loot_slot_div");
    loot_name.classList.add("loot_name");
    loot_chance.classList.add("loot_chance");
    loot_chance_base.classList.add("loot_chance_base");
    loot_chance_current.classList.add("loot_chance_current");

    if(enemy) {
        //create based on data passed
        loot_name.innerText = `${obscure_name(loot.item_name)}`;
        loot_chance_base.innerText = `[${loot.chance*100}%]`;
        loot_chance_current.innerText = `${Math.round(10000*loot.chance*enemy.get_droprate_modifier())/100}%`;
        loot_chance.append(loot_chance_current, loot_chance_base);
        loot_line.append(loot_name, loot_chance);
    } else {
        //create a header line
        loot_name.innerText = translationManager.getText(language, "ui column item name");
        loot_chance_base.innerText = translationManager.getText(language, "ui column base percent");
        loot_chance_current.innerText = translationManager.getText(language, "ui column current percent");
        loot_chance.append(loot_chance_current, loot_chance_base);
        loot_line.append(loot_name, loot_chance);
    }

    return loot_line;
}

function create_bestiary_stat_entry(enemy, stat_name) {
    const stat_entry = document.createElement("div");
    const stat_name_div = document.createElement("div");
    const stat_value_div = document.createElement("div");

    stat_entry.classList.add("stat_slot_div");
    stat_name_div.classList.add("stat_name");
    stat_value_div.classList.add("stat_value");


    switch(stat_name) {
        case "Health": 
            stat_name_div.innerText = translationManager.getText(language, "ui stat label health");
            stat_value_div.innerText = `${enemy.stats.health}`;
            stat_entry.append(stat_name_div, stat_value_div);
        break;
        case "Defense":
            stat_name_div.innerText = translationManager.getText(language, "ui stat label defense");
            stat_value_div.innerText = `${enemy.stats.defense}`;
            stat_entry.append(stat_name_div, stat_value_div);
        break;
        case "Attack power":
            stat_name_div.innerText = translationManager.getText(language, "ui stat label attack power");
            stat_value_div.innerText = `${enemy.stats.attack}`;
            if(enemy.stats.attack_count > 1) {
                stat_value_div.innerText += `x${enemy.stats.attack_count}`;
            }
            stat_entry.append(stat_name_div, stat_value_div);
        break;
        case "Attack speed":
            stat_name_div.innerText = translationManager.getText(language, "ui stat label attack speed");
            stat_value_div.innerText = `${enemy.stats.attack_speed}`;
            stat_entry.append(stat_name_div, stat_value_div);
        break;
        case "AP":
            stat_name_div.innerText = translationManager.getText(language, "ui label ap");
            stat_value_div.innerText = `${Math.round(enemy.stats.dexterity * Math.sqrt(enemy.stats.intuition || 1))}`;
            stat_entry.append(stat_name_div, stat_value_div);
        break;
        case "EP":
            stat_name_div.innerText = translationManager.getText(language, "ui stat label ep");
            stat_value_div.innerText = `${Math.round(enemy.stats.agility * Math.sqrt(enemy.stats.intuition || 1))}`;
            stat_entry.append(stat_name_div, stat_value_div);
        break;
    }

    return stat_entry;
}

function clear_bestiary() {
    Object.keys(bestiary_entry_divs).forEach((enemy) => {
        delete bestiary_entry_divs[enemy];
    });
}

/**
 * creates a new booklist entry;
 * called when a new enemy is killed (or, you know, loading a save)
 * @param {String} enemy_name 
 */
function create_new_booklist_entry(book_name) {
    booklist_entry_divs[book_name] = document.createElement("div");
    
    let book = item_templates[book_name];

    let name_div = document.createElement("div");
    //The key identifies the book; the book titles itself.
    name_div.innerText = book.getDisplayName();
    name_div.classList.add("anthology_entry_name");

    let tooltip = create_item_tooltip(book);//document.createElement("div");
    tooltip.classList.add("anthology_entry_tooltip")
    //tooltip.appendChild(create_item_tooltip(book));

    booklist_entry_divs[book_name].appendChild(name_div);
    booklist_entry_divs[book_name].appendChild(tooltip);
    booklist_entry_divs[book_name].setAttribute("data-book", book_name);
    booklist_entry_divs[book_name].classList.add("anthology_entry_div");

    booklist_list.appendChild(booklist_entry_divs[book_name]);

    /*
        Sorts by the title as shown. Subtracting one title from another - which is
        what this did - is NaN for every pair of strings, so the list stayed in the
        order the books happened to be read in.
    */
    [...booklist_list.children].sort((a, b) => compare_display_names(
                                    a.querySelector(".anthology_entry_name").innerText,
                                    b.querySelector(".anthology_entry_name").innerText))
                                .forEach(node=>booklist_list.appendChild(node));
}

/**
 * updates the anthology entry of a book (style and tooltip);
 * @param {String} book_name 
 */
function update_booklist_entry(book_name, read) {
    if(!booklist_entry_divs[book_name]) {
        create_new_booklist_entry(book_name);
    }

    set_HTML(booklist_entry_divs[book_name].children[1], create_item_tooltip_content({item: item_templates[book_name]}));
    booklist_entry_divs[book_name].style.display = read ? "flex" : "none";
}

function clear_booklist() {
    Object.keys(booklist_entry_divs).forEach((book) => {
        delete booklist_entry_divs[book];
    });
}

/**
 * A line naming a place, with a button that goes there.
 *
 * Shared by the Discoveries page and the quest journal, which both answer the same
 * question - where do I go - and were about to grow two copies of this.
 *
 * The button only appears for a place the player has unlocked. Both callers rebuild on
 * open, so that stays current.
 */
function create_travel_line(location, text) {
    const line = document.createElement("div");
    line.classList.add("discovery_source_line");

    const text_div = document.createElement("div");
    text_div.innerText = text;
    text_div.classList.add("discovery_source_text");
    line.appendChild(text_div);

    if(location?.is_unlocked) {
        const travel = document.createElement("div");
        travel.classList.add("discovery_travel_button");
        travel.innerText = translationManager.getText(language, "ui discovery travel");
        travel.setAttribute("data-travel", location.id);
        //travel_to, not change_location: it ends a running action first. These buttons
        //are on screen during one, which the ordinary travel lines never are.
        travel.setAttribute("onclick",
            "travel_to(this.getAttribute('data-travel'));");
        line.appendChild(travel);
    }

    return line;
}

const titles_list = document.getElementById("titles_list");

/**
 * The titles panel: what the player has done, in the order the game granted it.
 *
 * Unearned titles are not listed at all, not even greyed out. A title is a record
 * rather than a checklist - showing the ones still to come would turn it into a list
 * of chores, which is the opposite of what it is for.
 */
function update_displayed_titles() {
    if(!titles_list) {
        return;
    }
    clear_HTML_content(titles_list);

    const earned = Object.keys(titles).filter(title_id => titles[title_id].is_earned);
    if(earned.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("discovery_source_text");
        empty.innerText = translationManager.getText(language, "ui titles empty");
        titles_list.appendChild(empty);
        return;
    }

    for(const title_id of earned) {
        const entry = document.createElement("div");
        entry.classList.add("lore_entry");

        const name = document.createElement("div");
        name.classList.add("lore_entry_speaker");
        name.innerText = titles[title_id].getName();
        entry.appendChild(name);

        const description = document.createElement("div");
        description.classList.add("discovery_source_text");
        description.innerText = titles[title_id].getDescription();
        entry.appendChild(description);

        titles_list.appendChild(entry);
    }
}

export {
    enemy_tag_label,
    update_displayed_titles,
    booklist_entry_divs,
    clear_bestiary,
    create_new_bestiary_entry,
    create_travel_line,
    update_bestiary_entry,
    update_bestiary_entry_killcount,
    update_bestiary_entry_tooltip,
    update_booklist_entry,
    update_displayed_book,
    update_displayed_discoveries,
    update_displayed_lore,
};
