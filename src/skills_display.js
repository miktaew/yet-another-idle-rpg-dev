/** The skill bars and the stance list: two panels that share their sorting. */

import { faved_stances, language, language_tags, selected_stance } from "./main.js";
import { clear_HTML_content, insert_HTML, set_HTML } from "./ui_helpers.js";
import { character, get_skill_xp_gain, get_total_skill_level } from "./character.js";
import { expo } from "./misc.js";
import { stat_label_short } from "./item_tooltips.js";
import { translationManager } from "./translation.js";
import { get_next_skill_milestone, get_unlocked_skill_rewards, skills } from "./data/skills.js";

/*
    This module takes nothing back out of display.js. The seven pieces of state it looked
    like it needed - the bar divs, the two lists, the sort order and direction - are read
    by nothing else and moved with it, so the import is one-way and there is no cycle
    here to reason about.

    update_displayed_faved_stances still takes the stance registry as an argument rather
    than importing it. display.js keeps that import commented out on purpose because the
    edge breaks the bundle, and inheriting the workaround is cheaper than testing whether
    it has stopped being necessary.
*/

const skill_bar_divs = {};

const skill_list = document.getElementById("skill_list");

const skill_category_order = [];

const stance_bar_divs = {};

const stance_list = document.getElementById("stance_list");

let skill_sorting = "name";

let skill_sorting_direction = "asc";

function clear_skill_bars() {
    Object.keys(skill_bar_divs).forEach(function(key) {
        delete skill_bar_divs[key];
    });
}

/**
 * //creates new skill bar
 * @param {Skill} skill 
 */
function create_new_skill_bar(skill) {
    if(!skill_bar_divs[skill.category]) {
        skill_bar_divs[skill.category] = {};

        const skill_category_div = document.createElement("div");
        //skill.category is a registry key: "Weapon", "Environmental".
        insert_HTML(skill_category_div, `<i class="material-icons icon skill_dropdown_icon"> keyboard_double_arrow_down </i>${translationManager.getText(language, "ui skill category heading",
            {v1: translationManager.getText(language, `ui skill category ${skill.category}`)})}`);
        skill_category_div.dataset.skill_category = skill.category;
        skill_category_div.classList.add("skill_category_div");

        //add reordering buttons
        const btn_up = document.createElement('a');
        btn_up.className = "material-icons icon";
        btn_up.style.float = 'right';
        btn_up.innerText = 'keyboard_arrow_up';
        btn_up.addEventListener("click", () => {
            let idx = skill_category_order.indexOf(skill.category);
            if (idx > 0) {
                [skill_category_order[idx], skill_category_order[idx - 1]] = [skill_category_order[idx - 1], skill_category_order[idx]];
                sort_displayed_skill_categories();
                update_skill_category_order();
            }
        });
        const btn_down = document.createElement('a');
        btn_down.className = "material-icons icon";
        btn_down.style.float = 'right';
        btn_down.innerText = 'keyboard_arrow_down';
        btn_down.addEventListener("click", () => {
            let idx = skill_category_order.indexOf(skill.category);
            if (idx < skill_category_order.length - 1) {
                [skill_category_order[idx], skill_category_order[idx + 1]] = [skill_category_order[idx + 1], skill_category_order[idx]];
                sort_displayed_skill_categories();
                update_skill_category_order();
            }
        });
        skill_category_div.appendChild(btn_up);
        skill_category_div.appendChild(btn_down);

        const skill_category_skills = document.createElement("div");
        skill_category_skills.dataset.skill_category_skills = true;
        skill_category_div.appendChild(skill_category_skills);
        
        skill_list.appendChild(skill_category_div);

        skill_category_div.addEventListener("click", (event)=>{
            if(event.target.classList.contains("skill_category_div")) {
                event.target.classList.toggle("skill_category_expanded");
            } else if(event.target.classList.contains("skill_dropdown_icon")) {
                event.target.parentNode.classList.toggle("skill_category_expanded");
            }
        })

        if(skill_category_order.indexOf(skill.category) == -1) {
            skill_category_order.push(skill.category);
        }
    }
    if(skill_bar_divs[skill.category][skill.skill_id]) {
        console.trace(`Tried to create a skillbar for skill "${skill.skill_id}", but it already has one!`);
        return;
    }
    skill_bar_divs[skill.category][skill.skill_id] = document.createElement("div");

    const skill_bar_max = document.createElement("div");
    const skill_bar_current = document.createElement("div");
    const skill_bar_text = document.createElement("div");
    const skill_bar_name = document.createElement("div");
    const skill_bar_xp = document.createElement("div");

    const skill_tooltip = document.createElement("div");
    const tooltip_xp = document.createElement("div");
    const tooltip_xp_gain = document.createElement("div");
    const tooltip_desc = document.createElement("div");
    const tooltip_effect = document.createElement("div");
    const tooltip_milestones = document.createElement("div");
    const tooltip_next = document.createElement("div");
    const tooltip_ranks = document.createElement("div");
    
    skill_bar_max.classList.add("skill_bar_max");
    skill_bar_current.classList.add("skill_bar_current");
    skill_bar_text.classList.add("skill_bar_text");
    skill_bar_name.classList.add("skill_bar_name");
    skill_bar_xp.classList.add("skill_bar_xp");
    skill_tooltip.classList.add("skill_tooltip");
    tooltip_next.classList.add("skill_tooltip_next_milestone");
    tooltip_ranks.classList.add("skill_tooltip_ranks");

    skill_bar_text.appendChild(skill_bar_name);
    skill_bar_text.append(skill_bar_xp);

    tooltip_xp_gain.classList.add("skill_xp_gain");

    skill_tooltip.appendChild(tooltip_xp);
    skill_tooltip.appendChild(tooltip_xp_gain);
    skill_tooltip.appendChild(tooltip_desc);
    skill_tooltip.appendChild(tooltip_effect);
    skill_tooltip.appendChild(tooltip_milestones);
    skill_tooltip.appendChild(tooltip_next);
    //Last, because update_displayed_skill_bar addresses these children by index.
    skill_tooltip.appendChild(tooltip_ranks);

    let html_content = `<span class="skill_id">id: "${skill.skill_id}"</span><br><br>${skill.getDescription()}<br>`;
    if(skill.flavour_text) {
        //A text id now, like every other line of content. Four skills carry one and
        //all four were English.
        html_content += `<br><span class="skill_flavour_text">"${translationManager.getText(language, skill.flavour_text)}"</span>`;
    }

    if(skill.parent_skill) {
        //name(), not getDisplayName on the key: a skill's shown name depends on its
        //level, so the key resolves to nothing and the English key was printed.
        html_content += `<br>${translationManager.getText(language, "ui parent skill")}: ${skills[skill.parent_skill]?.name() ?? skill.parent_skill}<br><br>`; 
    }
    
    insert_HTML(tooltip_desc, html_content);
    skill_bar_max.appendChild(skill_bar_text);
    skill_bar_max.appendChild(skill_bar_current);
    skill_bar_max.appendChild(skill_tooltip);

    skill_bar_divs[skill.category][skill.skill_id].appendChild(skill_bar_max);
    skill_bar_divs[skill.category][skill.skill_id].setAttribute("data-skill", skill.skill_id);
    skill_bar_divs[skill.category][skill.skill_id].classList.add("skill_div");
    skill_list.querySelector(`[data-skill_category=${skill.category}]`).querySelector("[data-skill_category_skills]").appendChild(skill_bar_divs[skill.category][skill.skill_id]);

    //sorts skill_list div alphabetically
    sort_displayed_skills({});
    sort_displayed_skill_categories();
    update_displayed_skill_xp_gain(skill);
}

/**
 * A skill's rank ladder, with where the player currently stands on it.
 *
 * 58 skills rename themselves as they level, so a player watching Tough skin become
 * Wooden skin has no way to know what came before or what is still ahead. Returns "" for
 * the skills that keep one name, which have no ladder to show.
 */
function create_skill_rank_ladder(skill) {
    const rungs = Object.keys(skill.names || {})
        .map(Number)
        .sort((first, second) => first - second);
    if(rungs.length < 2) {
        return "";
    }

    //The rung the player is on: the highest one at or below the current level, which is
    //the same rule english_name() picks by.
    let current = rungs[0];
    for(const level of rungs) {
        if(skill.current_level >= level) {
            current = level;
        }
    }

    const parts = rungs.map(level => {
        const name = translationManager.getDisplayName(language, skill.names[level]);
        //Level 0 is where everyone starts, so printing "(0)" beside it says nothing.
        const at = level > 0 ? ` (${level})` : "";
        if(level === current) {
            return `<span class="skill_rank_current">${name}${at}</span>`;
        }
        if(level > skill.current_level) {
            return `<span class="skill_rank_ahead">${name}${at}</span>`;
        }
        return `${name}${at}`;
    });

    return `<br><span class="skill_rank_label">`
        + `${translationManager.getText(language, "ui skill ranks")}:</span> `
        + parts.join(" &rsaquo; ");
}

function update_displayed_skill_bar(skill, leveled_up=true) {
    /*
    skill_bar divs: 
        skill -> children (1): 
            skill_bar_max -> children(3): 
                skill_bar_text -> children(2):
                    skill_bar_name,
                    skill_bar_xp
                skill_bar_current, 
                skill_tooltip -> children(7):
                    tooltip_xp,
                    tooltip_xp_gain,
                    tooltip_desc,
                    tooltip_effect,
                    tooltip_milestones,
                    tooltip_next,
                    tooltip_ranks
    */

    //The guard was one level too shallow: a whole category can be absent from
    //skill_bar_divs, and reading [skill_id] off undefined throws rather than
    //returning. Nothing called either of these for a skill in an unbuilt category
    //until the language switch began repainting every unlocked skill.
    if(!skill_bar_divs[skill.category]?.[skill.skill_id]) {
        return;
    }

    update_displayed_skill_level(skill);

    if (skill.current_xp !== "Max") {
        skill_bar_divs[skill.category][skill.skill_id].children[0].classList.remove("skill_bar_capped");
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[0].children[1].innerText = `${100*Math.floor(skill.current_xp/skill.xp_to_next_lvl*1000)/1000}%`;
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[0].innerText = `${expo({number: skill.current_xp})} / ${expo({number: skill.xp_to_next_lvl})}`;
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[1].style.width = `${100*skill.current_xp/skill.xp_to_next_lvl}%`;

    } else {
        skill_bar_divs[skill.category][skill.skill_id].children[0].classList.add("skill_bar_capped");
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[0].children[1].innerText = translationManager.getText(language, "ui max short");
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[0].innerText = `${translationManager.getText(language, "ui maxed out")}`;
        //Set explicitly: .skill_bar_current has no width rule in style.css, so a
        //stale inline width from just before the final level-up would survive.
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[1].style.width = "100%";
    }
    //skill_bar_xp && tooltip_xp && skill_bar_current
    //The width assignment lives in both branches on purpose. It used to sit after
    //this if-else, where a maxed skill computed 100*"Max"/Infinity and wrote
    //"NaN%" - which the CSSOM silently drops, leaving the bar stuck at whatever
    //fraction it showed one level earlier. Farming and Literacy cap at level 10,
    //so this was reachable in ordinary play.

    if(get_unlocked_skill_rewards(skill.skill_id)) {
        set_HTML(skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[4], `<br>${get_unlocked_skill_rewards(skill.skill_id)}`);
    }

    if(typeof get_next_skill_milestone(skill.skill_id) !== "undefined") {
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[5].innerText  = translationManager.getText(language, "ui next milestone unknown",
            {v1: get_next_skill_milestone(skill.skill_id)});
    } else {
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[5].innerText = "";
    }

    if(typeof skill.get_effect_description !== "undefined") {
        skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[3].innerText = `${skill.get_effect_description()}`;
        //tooltip_effect
    }
    
    //children[6]: the rank ladder. Rebuilt rather than patched, because a level-up can
    //move which rung is current and a language switch changes every name on it.
    set_HTML(skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[6],
        create_skill_rank_ladder(skill));

    if(leveled_up) {
        sort_displayed_skills({sort_by: skill_sorting}); //in case of a name change on levelup
    }
}

function update_displayed_skill_level(skill) {
    if(!skill_bar_divs[skill.category]?.[skill.skill_id]) {
        return;
    }

    let html_content = translationManager.getText(language, "ui skill bar level",
        {v1: skill.name(), v2: skill.current_level, v3: skill.max_level});
    const bonus = character.bonus_skill_levels.full[skill.skill_id];
    if(bonus != 0) {
        html_content += ` <b>[${bonus>0?"+":""}${bonus}]</b>`;
    }

    set_HTML(skill_bar_divs[skill.category][skill.skill_id].children[0].children[0].children[0], html_content);
}

function update_displayed_skill_description(skill) {
    //The guard was one level too shallow: a whole category can be absent from
    //skill_bar_divs, and reading [skill_id] off undefined throws rather than
    //returning. Nothing called either of these for a skill in an unbuilt category
    //until the language switch began repainting every unlocked skill.
    if(!skill_bar_divs[skill.category]?.[skill.skill_id]) {
        return;
    }
    skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[3].innerText = `${skill.get_effect_description()}`;
}

function update_displayed_skill_xp_gain(skill) {
    if(!skill_bar_divs[skill.category] || !skill_bar_divs[skill.category][skill.skill_id]){
        return;
    }
    const xp_gain = Math.round(100*skill.get_parent_xp_multiplier()*get_skill_xp_gain(skill.skill_id))/100 || 1;
    set_HTML(skill_bar_divs[skill.category][skill.skill_id].children[0].children[2].children[1], `${translationManager.getText(language, "ui xp gain")}: x${xp_gain}<br><span>${translationManager.getText(language, "ui xp cost scaling")}: x${skill.xp_scaling}</span>`);
}

function update_all_displayed_skills_xp_gain(){
    Object.keys(skill_bar_divs).forEach(category => {
        Object.keys(skill_bar_divs[category]).forEach(skill_id => {
            update_displayed_skill_xp_gain(skills[skill_id]);
        });
    });
}

function sort_displayed_skills({sort_by="name", change_direction=false}) {
    if(change_direction){
        if(sort_by && sort_by === skill_sorting) {
            if(skill_sorting_direction === "asc") {
                skill_sorting_direction = "desc";
            } else {
                skill_sorting_direction = "asc";
            }
        } else {
            if(sort_by === "level") {
                skill_sorting_direction = "desc";
            } else {
                skill_sorting_direction = "asc";
            }
        }
    }

    skill_sorting = sort_by;

    let plus = skill_sorting_direction=="asc"?1:-1;
    let minus = skill_sorting_direction==="asc"?-1:1;
    for(let i = 0; i < skill_list.children.length; i++) {
        
        [...skill_list.children[i].querySelector("[data-skill_category_skills]").children].sort((a,b) => {
            let elem_a;
            let elem_b;
            if (sort_by === "level") {
                skill_sorting = sort_by;
                elem_a = skills[a.getAttribute("data-skill")].current_level;
                elem_b = skills[b.getAttribute("data-skill")].current_level;
            } else if (sort_by === "progress") {
                if (isNaN(skills[a.getAttribute("data-skill")].current_xp)) return 1;
                if (isNaN(skills[b.getAttribute("data-skill")].current_xp)) return -1;

                elem_a = -skills[a.getAttribute("data-skill")].current_xp / skills[a.getAttribute("data-skill")].xp_to_next_lvl;
                elem_b = -skills[b.getAttribute("data-skill")].current_xp / skills[b.getAttribute("data-skill")].xp_to_next_lvl ;
            } else {
                elem_a = skills[a.getAttribute("data-skill")].name();
                elem_b = skills[b.getAttribute("data-skill")].name();
                skill_sorting = "name";

                //Names are displayed text and need locale-aware collation. A plain
                //">" orders by code unit, which puts every letter carrying a
                //diacritic after "z". Returned here rather than falling through,
                //because the other branches compare numbers where localeCompare
                //would be wrong.
                const name_comparison = elem_a.localeCompare(elem_b, language_tags[language]);
                return name_comparison > 0 ? plus : name_comparison < 0 ? minus : 0;
            }
    
            if(elem_a > elem_b) {
                return plus;
            } else {
                return minus;
            }
    
    
        }).forEach(node=>skill_list.children[i].querySelector("[data-skill_category_skills").appendChild(node));
    }
}

/**
 * sorts displayed skill categories alphabeticaly
 */
function sort_displayed_skill_categories() {
    [...skill_list.children].sort((a, b) => {

        let pos_a = skill_category_order.indexOf(a.dataset.skill_category);
        let pos_b = skill_category_order.indexOf(b.dataset.skill_category);

        if (pos_a == -1 || pos_b == -1) {
            //if it doesn't have a specific position assigned, place it alphabetically
            return a.dataset.skill_category > b.dataset.skill_category ? 1 : -1;
        }
        else {
            return pos_a > pos_b ? 1 : -1;
        }
    }).forEach(node=>skill_list.appendChild(node));
}

function update_skill_category_order() {
    skill_category_order.length = 0;
    [...skill_list.children].forEach((elem, idx) => {
        skill_category_order[idx] = elem.dataset.skill_category;
    });
}

/**
 * @description updates the list of stances, 
 */
function update_displayed_stance_list(stances, current_stance) {

    clear_HTML_content(stance_list);

    Object.keys(stance_bar_divs).forEach(bar => {
        delete stance_bar_divs[bar];
    })

    set_HTML(stance_list, 
        `<tr class="stance_list_entry stance_list_header">
            <th class="stance_list_header stance_list_header_fav">${translationManager.getText(language, "ui stance col fav")}</th>
            <th class="stance_list_header stance_list_header_select">${translationManager.getText(language, "ui stance col select")}</th>
            <th class="stance_list_header stance_list_header_name">${translationManager.getText(language, "ui stance col name")}</th>
        </tr>`
    ); //why is this not in .html file...?

    Object.keys(stances).forEach(stance => {
        if(stances[stance].is_unlocked) {
            stance_bar_divs[stance] = document.createElement("tr");
            stance_bar_divs[stance].classList.add("stance_list_entry");
            stance_bar_divs[stance].dataset.stance = stance;

            const fav_selection = `<td class="stances_button stances_button_checkbox"><input type="checkbox" id="stances_fav_${stance}" name="stance_fav_selection" onclick="fav_stance('${stance}')"></td>`;
            const stance_selection = `<td class="stances_button stances_button_radio"><input type="radio" id="stances_select_${stance}" name="stance_list_selection" onclick="select_stance('${stance}')"></td>`;
            const stance_info = 
                `<td class="stances_name"><label for="stances_select_${stance}">${stances[stance].getName()}</td>`

            set_HTML(stance_bar_divs[stance], fav_selection + stance_selection + stance_info);
            
            const stance_tooltip_row = document.createElement("td");
            
            stance_tooltip_row.appendChild(create_stance_tooltip(stances[stance]));
            stance_bar_divs[stance].appendChild(stance_tooltip_row);
            stance_list.append(stance_bar_divs[stance]);
        }
    });

    //different stamina cost: cheaper first; same stamina cost: sort alphabetically
    [...stance_list.children].sort((a,b)=>{
        const stance_a = stances[a.getAttribute("data-stance")];
        const stance_b = stances[b.getAttribute("data-stance")];
        if(!stance_b) {
            return 1;
        } else if(!stance_a) {
            return -1;
        }

        if(!stance_a || !stance_b || !stance_a.is_unlocked || !stance_b.is_unlocked) {
            console.error(`No such stance as either '${stance_a}' or '${stance_b}', or at least one of them is not yet unlocked!`);
        }
        
        if(stance_a.stamina_cost < stance_b.stamina_cost) {
            return -1;
        } else if(stance_a.stamina_cost > stance_b.stamina_cost) {
            return 1;
        } else {
            if(stance_a.name > stance_b.name) {
                return 1;
            } else {
                return -1;
            }
        }
    }).forEach(node=>stance_list.appendChild(node));

    update_displayed_stance(current_stance);
    update_displayed_faved_stances(stances);
}

function create_stance_tooltip(stance) {
    const tooltip_div = document.createElement("div");
    tooltip_div.classList.add("stance_tooltip");
    let html_content = 
        `<div>${stance.getName()}</div><br>
        <div>${stance.getDescription()}</div><br>
        <div>${translationManager.getText(language, "ui stance stamina cost", {v1: stance.stamina_cost})}</div>
        <div class='stance_tooltip_stats'>${create_stance_tooltip_stats(stance)}</div`;

    let target_count = stance.target_count;
    if(target_count > 1 && stance.related_skill) {
        target_count = target_count + Math.round(target_count * get_total_skill_level(stance.related_skill)/skills[stance.related_skill].max_level);
    }

    if(target_count > 1) {
        html_content += `
            <br><div class='stance_tooltip_hitcount'>${translationManager.getText(language, stance.randomize_target_count ? "ui randomly hits up to" : "ui hits up to", {v1: target_count})}</div>`;
    }

    insert_HTML(tooltip_div, html_content);
    return tooltip_div;
}

function create_stance_tooltip_stats(stance) {
    let desc = "";
    const stats = stance.getStats()
    Object.keys(stats).forEach(stat => {
        desc += `<br>x${Math.round(100*stats[stat])/100} ${stat_label_short(stat)}`;
    });

    return desc;
}

function update_stance_tooltip(stance) {
    set_HTML(stance_bar_divs[stance.id].querySelector(".stance_tooltip_stats"),  create_stance_tooltip_stats(stance));

    let target_count = stance.target_count;
    if(target_count > 1){
        if(stance.related_skill) {
            target_count = target_count + Math.round(target_count * get_total_skill_level(stance.related_skill)/skills[stance.related_skill].max_level);
        }
        set_HTML(stance_bar_divs[stance.id].querySelector(".stance_tooltip_hitcount"), `${translationManager.getText(language, stance.randomize_target_count ? "ui randomly hits up to" : "ui hits up to", {v1: target_count})}</div>`);
    } 
}

/**
 * 
 * @param {Stance} stance current stance 
 */
function update_displayed_stance(stance) {
    stance_bar_divs[stance.id].children[1].children[0].checked = true;
    document.getElementById("character_stance_name").children[0].innerText = stance.getName();

    const selection = document.getElementById("character_stance_selection");

    if(selection.children) {
        if(selection.querySelector(`[data-stance='${stance.id}']`)) {
            selection.querySelector(`[data-stance='${stance.id}']`).children[0].checked = true;
        } else if(!faved_stances[stance.id] && selection.querySelector('[data-stance] :checked')) {
            selection.querySelector('[data-stance] :checked').checked = false;
        }
    }
}

/**
 * Redraws the quick-select bar under the character sheet.
 *
 * The argument is the stance REGISTRY, not the faved_stances map: which ids are
 * starred is imported from main.js, and what is needed here is the object those ids
 * resolve through. Passing the map instead is what threw
 * "getName is not a function" the moment a stance was favourited.
 */
function update_displayed_faved_stances(stances) {
    
    const list = document.getElementById("character_stance_selection");
    clear_HTML_content(list);
    let html_content = "";
    Object.keys(faved_stances).forEach(stance => {
        stance_bar_divs[stance].children[0].children[0].checked = true;

        html_content += `<div data-stance="${stance}"><input type="radio" id="stances_quick_select_${stance}" name="stance_quick_selection" onclick="select_stance('${stance}')">
            <label for="stances_quick_select_${stance}">${stances[stance].getName()}</div>`;
    });

    insert_HTML(list, html_content);

    //different stamina cost: cheaper first; same stamina cost: sort alphabetically
    [...list.children].sort((a,b)=>{
        const stance_a = stances[a.getAttribute("data-stance")];
        const stance_b = stances[b.getAttribute("data-stance")];

        if(!stance_a || !stance_b) {
            console.error(`No such stance as either '${stance_a}' or '${stance_b}'!`);
        }
        
        if(stance_a.stamina_cost < stance_b.stamina_cost) {
            return -1;
        } else if(stance_a.stamina_cost > stance_b.stamina_cost) {
            return 1;
        } else {
            if(stance_a.name > stance_b.name) {
                return 1;
            } else {
                return -1;
            }
        }
    }).forEach(node=>list.appendChild(node));

    //mark selected stance as checked in quick selection

    const selection = document.getElementById("character_stance_selection");
    if(selection.children && selection.querySelector(`[data-stance='${selected_stance}']`)) {
        selection.querySelector(`[data-stance='${selected_stance}']`).children[0].checked = true;
    }
}

/**
 * Redraws the Discoveries tab.
 *
 * Rebuilt in full each time the tab is opened rather than kept in step with the
 * inventory: what is on it changes with every pickup and every unlock, and it is only
 * ever on screen while a player is looking at it.
 */





















function clear_skill_list(){
    clear_HTML_content(skill_list);
    //remove skill bars from display
}

export {
    clear_skill_bars,
    clear_skill_list,
    create_new_skill_bar,
    skill_category_order,
    skill_list,
    sort_displayed_skills,
    update_all_displayed_skills_xp_gain,
    update_displayed_faved_stances,
    update_displayed_skill_bar,
    update_displayed_skill_description,
    update_displayed_skill_level,
    update_displayed_skill_xp_gain,
    update_displayed_stance,
    update_displayed_stance_list,
    update_stance_tooltip,
};
