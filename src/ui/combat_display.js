"use strict";

import { skills } from "../data/skills.js";
import { clear_HTML_content, set_HTML } from "../display.js";
import { enemy_tag_to_skill_mapping } from "../enemies.js";
import { current_combat } from "../main.js";
import { get_hit_chance } from "../misc.js";

const attacker_attack_bar = document.getElementById("attacker_attack_bar");

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

const defender_animations = {};


function fill_attacker_divs() {
    for(let i = 0; i < current_combat.attackers.length; i++) {
        current_combat.attackers_ui_slot.appendChild(create_attacker_div(i));
    }
}

function create_attacker_div(i) {
    const attacker_div = document.createElement("div");
    attacker_div.id = `enemy_${i}_div`;
    attacker_div.classList.add("attacker_div");
    
    return attacker_div;
}

function clear_defender_divs() {
    const parent = document.getElementsByClassName("defender_div")[0]?.parentNode;
    if(parent) {
        clear_HTML_content(parent);
    }
}

function clear_attacker_divs() {
    const parent = document.getElementsByClassName("attacker_div")[0]?.parentNode;
    if(parent) {
        clear_HTML_content(parent);
    }
}

function clear_combat_divs() {
    clear_defender_divs();
    clear_attacker_divs();
}

function fill_defender_divs() {
    clear_defender_divs();
    for(let i = 0; i < current_combat.defenders.length; i++) {
        current_combat.defenders_ui_slot.appendChild(create_defender_div(i));
    }

    update_defender_stats();
}

function create_defender_div(i) {
    const attacker_div = document.createElement("div");
    attacker_div.id = `enemy_${i}_div`;
    attacker_div.classList.add("defender_div", "enemy_div");

    const name_div = document.createElement("div");
    name_div.classList.add("enemy_name");

    const stats_div = document.createElement("div");
    stats_div.classList.add("enemy_stats");
    
    for(let i = 0; i < 5; i++) {
        const stat_div = document.createElement("div");
        stat_div.classList.add("enemy_stat", i==0?"enemy_stat_long":"enemy_stat_short");
        stats_div.appendChild(stat_div);
    }

    const health_div = document.createElement("div");
    health_div.classList.add("enemy_health_div");

    const healthbar_max_div = document.createElement("div");
    healthbar_max_div.classList.add("enemy_healthbar_max");

    const healthbar_current_div = document.createElement("div");
    healthbar_current_div.classList.add("enemy_healthbar_current");

    const enemy_health_value = document.createElement("div");
    enemy_health_value.classList.add("enemy_health_value");

    healthbar_max_div.appendChild(healthbar_current_div);
    health_div.appendChild(healthbar_max_div);
    health_div.appendChild(enemy_health_value);

    const enemy_attack_bar = document.createElement("div");
    enemy_attack_bar.classList.add("enemy_attack_bar");
    enemy_attack_bar.dataset.attack_bar = true;

    attacker_div.appendChild(name_div);
    attacker_div.appendChild(stats_div);
    attacker_div.appendChild(health_div);
    attacker_div.appendChild(enemy_attack_bar);

    return attacker_div;
}

function update_attacker_stats() {
    //todo
}

function update_defender_stats() {
    const full_stats = current_combat.attackers[0].getFullStats();

    const defenders_div = current_combat.defenders_ui_slot;
    const defenders = current_combat.defenders;
    const attackers = current_combat.attackers;
    const includes_player = attackers.filter(attacker => attacker.tags.main_character).length > 0;

    for(let i = 0; i < defenders.length; i++) { 
        defenders_div.children[i].children[0].style.display = null;

        set_HTML(defenders_div.children[i].querySelector(".enemy_name"), current_combat.defenders[i].name);

        let disp_speed;

        if(defenders[i].stats.attack_speed > 20) {
            disp_speed = Math.round(defenders[i].stats.attack_speed);
        } else if (defenders[i].stats.attack_speed > 2) {
            disp_speed = Math.round(defenders[i].stats.attack_speed*10)/10;
        } else {
            disp_speed = Math.round(defenders[i].stats.attack_speed*100)/100;
        }

        let hero_hit_chance_modifier = defenders.filter(enemy => enemy.is_alive).length**(-1/4); // down to ~ 60% if there's full 8 enemies
        let hero_evasion_chance_modifier = defenders.filter(enemy => enemy.is_alive).length**(-1/3); //down to .5 if there's full 8 enemies (multiple attackers make it harder to evade attacks)

        if(includes_player) {
            let target = defenders[i];
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
        }
    
        const evasion_chance = 1 - get_hit_chance(full_stats.attack_points*hero_hit_chance_modifier, defenders[i].stats.agility * Math.sqrt(defenders[i].stats.intuition ?? 1));
        let hit_chance = get_hit_chance(defenders[i].stats.dexterity * Math.sqrt(defenders[i].stats.intuition ?? 1), full_stats.evasion_points*hero_evasion_chance_modifier);

        if(attackers[0].getEquipment()["off-hand"]?.offhand_type === "shield") { //has shield
            hit_chance = 1;
        }

        let text_string = `Atk: ${defenders[i].stats.attack}dmg`;
        
        if(defenders[i].stats.attack_count > 1) {
            text_string +=` x${defenders[i].stats.attack_count}`;
        }

        const stats_div = defenders_div.children[i].querySelector(".enemy_stats");

        stats_div.children[0].innerText = text_string;
        stats_div.children[1].innerText = `Spd: ${disp_speed}`;
        stats_div.children[2].innerText = `Hit: ${Math.min(100,Math.max(0,Math.round(100*hit_chance)))}%`; //100% if shield!
        stats_div.children[3].innerText = `Ddg: ${Math.min(100,Math.max(0,Math.round(100*evasion_chance)))}%`;
        stats_div.children[4].innerText = `Def: ${defenders[i].stats.defense}`;
    }
}

/**
 * updates displayed health and healthbars of enemies
 */
function update_displayed_health_of_defenders() {
    const defenders = current_combat.defenders;
    const defenders_div = current_combat.defenders_ui_slot;
    for(let i = 0; i < defenders.length; i++) {
        if(defenders[i].is_alive) {
            defenders_div.children[i].children[0].style.filter = "brightness(100%)";
        } else {
            defenders_div.children[i].children[0].style.filter = "brightness(30%)";
            update_defender_stats();
        }

        //update size of health bar
        defenders_div.children[i].querySelector(".enemy_healthbar_current").style.width = 
            Math.max(0, 100*defenders[i].stats.health/defenders[i].stats.max_health) + "%";

        defenders_div.children[i].querySelector(".enemy_health_value").innerText = `${Math.ceil(defenders[i].stats.health)}/${Math.ceil(defenders[i].stats.max_health)} hp`;
    }
}

function update_displayed_health_of_fighter({fighter_index, is_attacker}) {
    const fighter = is_attacker?current_combat.attackers[fighter_index] : current_combat.defenders[fighter_index];
    const fighter_div = is_attacker?current_combat.attacker_ui_slot.children[fighter_index] : current_combat.defenders_ui_slot.children[fighter_index];

    if(fighter.is_alive) {
        fighter_div.children[0].style.filter = "brightness(100%)";
    } else {
        fighter_div.children[0].style.filter = "brightness(30%)";
        update_defender_stats();
        update_attacker_stats();
    }
}

function update_attack_bar({fighter_index, is_attacker, progress}) {
    (is_attacker ? current_combat.attackers_ui_slot : current_combat.defenders_ui_slot)
        .children[fighter_index].querySelector("[data-attack_bar]").style.width = `${Math.min(progress*100,100)}%`;
}

function do_defender_onhit_animation(defender_id) {
    const defender_div = current_combat.defenders_ui_slot.children[defender_id];
    defender_animations[defender_id]?.cancel(); //almost certainly unnecessary
    defender_animations[defender_id] = defender_div.animate(onhitAnimation, onhitAnimationTiming);
}

function remove_defender_onhit_animation(defender_id) {
    defender_animations[defender_id]?.cancel();
}

function do_defender_onstart_animation(defender_id) {
    const defender_div = current_combat.defenders_ui_slot.children[defender_id];

    defender_animations[defender_id]?.cancel(); //almost certainly unnecessary
    defender_animations[defender_id] =  defender_div.animate(onstartAnimation, onstartAnimationTiming);
}

export {
    fill_attacker_divs, fill_defender_divs,
    update_displayed_health_of_defenders,
    do_defender_onhit_animation, remove_defender_onhit_animation, do_defender_onstart_animation,
    update_defender_stats,
    update_attack_bar,
    clear_combat_divs,
    update_displayed_health_of_fighter,
}