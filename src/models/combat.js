"use strict";

import { config } from "../config.js";
import { log_message, update_displayed_enemies } from "../display.js";
import { finish_combat_round, game_options, game_stats, selected_stance, tickrate } from "../main.js";
import { get_hit_chance } from "../misc.js";
import { do_defender_onstart_animation, fill_attacker_divs, fill_defender_divs, update_displayed_health_of_defenders } from "../ui/combat_display.js";

let maximum_time_correction = 10;

class Combat {

    #data = {
        defenders: {
            attack_loops: [],
            attack_cooldowns: [],
            time_variance_acumulators: [],
            timer_adjustments: [],
            timers: [],
        },
        attackers: {
            attack_loops: [],
            attack_cooldowns: [],
            time_variance_acumulators: [],
            timer_adjustments: [],
            timers: [],
        }
    }

    constructor({
        attackers = [], //in standard case, player
        defenders = [], //in standard case, enemies
        attackers_ui_slot, //this is expected to have no children, otherwise they might get deleted
        defenders_ui_slot, //this is expected to have no children, otherwise they might get deleted
        is_special_combat, //true -> skips loot, rewards, location progress, etc (esp since it might not even involve player)
        show_stance_controls, //generally just ignore it let it be auto set
    }) {
        this.attackers = attackers;
        this.defenders = defenders;
        this.attackers_ui_slot = attackers_ui_slot || document.getElementById(config.ui_element_for_hero_combat_display);
        this.defenders_ui_slot = defenders_ui_slot || document.getElementById(config.ui_element_for_enemy_display);
        this.is_special_combat = is_special_combat ?? false;
        this.show_stance_controls = show_stance_controls ?? !this.is_special_combat;
    }

    #setupDisplay() {
        fill_attacker_divs(this.attackers, this.attackers_ui_slot);
        fill_defender_divs(this.defenders, this.defenders_ui_slot);
    }

    reset() {
        for(let i = 0; i < this.attackers.length; i++) {
            this.attackers[i].is_alive = true;
        }
        for(let i = 0; i < this.defenders.length; i++) {
            this.defenders[i].is_alive = true;
        }

        Object.keys(this.#data).forEach(fighter_type => {
            const loops = this.#data[fighter_type].attack_loops;
            for(let i = 0; i < loops.length; i++) {
                clearTimeout(loops[i]);
            }
        });

        this.clearUI();
    }

    clearUI() {
        if(this.attackers_ui_slot) this.attackers_ui_slot.replaceChildren();
        if(this.defenders_ui_slot) this.defenders_ui_slot.replaceChildren();
    }

    start() {
        this.#setupDisplay();

        //do something with stats for standarized access, or just add levelable component to enemies? 
        //start a combat loop interval


        this.#data.attackers.attack_cooldowns = this.attackers.map(x => 1/x.getFullStats().attack_speed);
        this.#data.defenders.attack_cooldowns = this.defenders.map(x => 1/x.getFullStats().attack_speed);

        let fastest_cooldown = [... this.#data.attackers.attack_cooldowns, ... this.#data.defenders.attack_cooldowns].sort((a,b) => a - b)[0];

        //scale all attacks to be not faster than 1 per second
        const cooldown_multiplier = fastest_cooldown < 1 ? 1/fastest_cooldown : 1;
            
        Object.keys(this.#data).forEach(fighter_type => {
            for(let i = 0; i < this.#data[fighter_type].length; i++) {
                this.#data[fighter_type].attack_cooldowns[i] *= cooldown_multiplier;
                this.#data[fighter_type].time_variance_acumulators[i] = 0;
                this.#data[fighter_type].timer_adjustments[i] = 0;
                this.#data[fighter_type].timers[i] = [Date.now(), Date.now()];
            }
        });

        update_displayed_enemies();
        update_displayed_health_of_defenders();

        //attach loops and animations
        /*
        for(let i = 0; i < this.defenders.length; i++) {
            if(game_options.do_enemy_onhit_animations) {
                do_defender_onstart_animation(i);
            }
            
            this.do_defender_attack_loop(i, 0, true);
        }
        */

        for(let i = 0; i < this.defenders.length; i++) {
            if(game_options.do_enemy_onhit_animations) {
                do_defender_onstart_animation(i);
            }
            this.set_attack_loop({target: this.defenders[i], base_cooldown: character_attack_cooldown});
        }
        for(let i = 0; i < this.attackers.length; i++) {
            this.set_attack_loop({target: this.attackers[i], base_cooldown: character_attack_cooldown});
        }

        //set_character_attack_loop({base_cooldown: character_attack_cooldown});
    }

    /**
     * 
     * @param {*} data
     * @param {Boolean} data.is_attacker - false equals it being a defender
     * @returns 
     */
    set_attack_loop({fighter_index, base_cooldown, is_attacker}) {
        clear_character_attack_loop();

        const fighter = is_attacker ? this.attackers[fighter_index] : this.defenders[fighter_index];

        //tries to switch stance back to the one that was actually selected if there's enough stamina, otherwise tries to switch stance to "normal" if not enough stamina
        if(fighter.tags?.main_character && !this.is_special_combat) {
            if(fighter.getFullStats().stamina >= (selected_stance.stamina_cost / fighter.getFullStats().stamina_efficiency)){ 
                if(selected_stance.id !== current_stance.id) {
                    change_stance({stance_id: selected_stance.id});
                    return;
                }
            } else if(current_stance.id !== "normal") {
                change_stance({stance_id: "normal", is_temporary: true});
                return;
            }
        }

        let target_count = 1;
        if(fighter.tags?.main_character && !this.is_special_combat) {
            if(target_count > 1 && current_stance.related_skill) {
                target_count = target_count + Math.round(target_count * character.getTotalSkillLevel(current_stance.related_skill)/skills[current_stance.related_skill].max_level);
            }

            if(current_stance.randomize_target_count) {
                target_count = Math.floor(Math.random()*target_count) || 1;
            }
        }

        let targets = [];
        let alive_targets = (is_attacker ? this.defenders : this.attackers).filter(x => x.is_alive).slice(-target_count);

        while(alive_targets.length>0) {
            targets.push(alive_targets.pop());
        }

        let actual_cooldown = base_cooldown;

        if(fighter.tags?.main_character && !this.is_special_combat) {
            use_stamina({stamina_to_use: current_stance.stamina_cost, skip_persistence_xp_for_stance_change});
            actual_cooldown = base_cooldown / character.getStaminaMultiplier();
        }

        let attack_power = fighter.getAttackPower();
        //do_character_attack_loop({base_cooldown, actual_cooldown, attack_power, targets, target_count});
        do_attack_loop({base_cooldown, actual_cooldown, attack_power, targets, target_count});
    }

    do_attack_loop({fighter_index, is_attacker, base_cooldown, actual_cooldown, attack_power, targets, target_count, is_new = false, count = 0}) {

        const fighter = is_attacker ? this.attackers[fighter_index] : this.defenders[fighter_index];

        update_attack_bar({fighter_index, is_attacker, progress: count/60});

        const target_data = is_attacker ? this.#data.attackers : this.#data.defenders;

        if(is_new) {
            target_data.time_variance_acumulators[fighter_index] = 0;
            target_data.timer_adjustments[fighter_index] = 0;
        }

        clear_attack_loop({fighter_index, is_attacker});
        target_data.attack_loops[fighter_index] = setTimeout(() => {

            target_data.timers[fighter_index][0] = Date.now();
            target_data.time_variance_acumulators[fighter_index] = Date.now();

            target_data.time_variance_acumulators[fighter_index] += 
                ((target_data.timers[fighter_index][0] - target_data.timers[fighter_index][1]) - actual_cooldown*1000/(60*tickrate))

            target_data.timers[fighter_index][1] = Date.now();

            update_attack_bar({fighter_index, is_attacker, progress: count/60});
            count++;
            if(count >= 60) {
                count = 0;
                let leveled = false;

                for(let i = 0; i < targets.length; i++) {
                    do_combat_action({fighter_index, is_attacker, target: targets[i], attack_power, target_count: targets.length});
                }

                if(fighter.tags?.main_character && current_stance.related_skill) {
                    leveled = add_xp_to_skill({skill: skills[current_stance.related_skill], xp_to_add: targets.reduce((sum,enemy)=>sum+enemy.xp_value,0)/targets.length});
                    
                    if(leveled) {
                        update_stance_tooltip(current_stance);
                        character.updateStatsAndDisplay();
                    }
                }

                if((is_attacker ? this.defenders : this.attackers).filter(enemy => enemy.is_alive).length != 0) { //set next loop if there's still an enemy left;
                    set_attack_loop({fighter_index, base_cooldown, is_attacker});
                } else { //all enemies defeated, do relevant things and set new combat if applicable
                    if(!this.is_special_combat) { 
                        this.clear_all_attack_loops();
                    } else {
                        finish_combat_round(this.is_special_combat);                        
                    }
                }
            } else {
                do_attack_loop({fighter_index, is_attacker, base_cooldown, actual_cooldown, attack_power, targets, target_count, count, is_new: false});
            }

            if(Math.abs(target_data.time_variance_acumulators[fighter_index] <= maximum_time_correction/tickrate)) {
                target_data.timer_adjustments[fighter_index] = target_data.time_variance_acumulators[fighter_index];
            } else {
                if(target_data.time_variance_acumulators[fighter_index] > maximum_time_correction/tickrate) {
                    target_data.timer_adjustments[fighter_index] = maximum_time_correction/tickrate;
                } else {
                    if(target_data.time_variance_acumulators[fighter_index] < -maximum_time_correction/tickrate) {
                        target_data.timer_adjustments[fighter_index] = -maximum_time_correction/tickrate;
                    }
                }
            } //limits the maximum correction, just to be safe
        }, actual_cooldown*1000/(60*tickrate) - target_data.timer_adjustments[fighter_index]);
    }

    /**
     * @description performs a combat action, launched for a singular opponent (in fight against multiple with multi-target stance, gets launched separately for each target)
     * @param {Object} data
     * @param {Number} data.fighter_index
     * @param {Boolean} data.is_attacker
     * @param {Object} data.target
     * @param {Number} data.attack_power
     * @param {Number} data.target_count only used for xp calculations (if applicable)
     */
    do_combat_action({fighter_index, is_attacker, target, attack_power, target_count}) {

        const fighters = is_attacker ? this.attackers : this.defenders;
        const fighter = fighters[fighter_index];
        const opponents = is_attacker ? this.defenders : this.attackers;
        const base_damage = attack_power;
        const opponent_count_xp_multiplier = this.is_special_combat? 1 : opponents.length**(1/3);
        //xp mult for fighting multiple targets, up to x2 at 8 (assuming standard combat size, since it's technically uncapped)
        //based on raw opponent count instead of only on living ones, because Mik sometimes is a benevolent cat

        const target_count_xp_modifier = opponent_count_xp_multiplier/target_count;
        //with penalty for xp from attacking, since multi-target attacks would be too powerful at farming xp otherwise

        let evasion_chance_modifier = fighters.filter(x => x.is_alive).length**(-1/3); //down to .5 if there's full 8 enemies (multiple attackers make it harder to evade attacks)
        let defense_modifier = 0;

        let hit_chance_modifier = opponents.filter(x => x.is_alive).length**(-1/4); // down to ~ 60% if there's full 8 enemies
        let damage_modifier = 1;

        if(!this.is_special_combat) {
            if(fighter.tags.main_character){
                add_xp_to_skill({skill: skills["Combat"], xp_to_add: target.xp_value*target_count_xp_modifier});
                Object.keys(target.tags).forEach(tag => {
                    if(enemy_tag_to_skill_mapping[tag]) {
                        for(let i = 0; i < enemy_tag_to_skill_mapping[tag].length; i++) {
                            const skill = skills[enemy_tag_to_skill_mapping[tag][i]];

                            add_xp_to_skill({skill, xp_to_add: target.xp_value*target_count_xp_modifier});

                            const {modifier_to_damage, modifier_to_hit_chance} = skill.get_stat_modifiers();

                            hit_chance_modifier *= modifier_to_hit_chance || 1;
                            damage_modifier *= modifier_to_damage || 1;
                        }
                    }
                });
            } else if(target.tags.main_character){
                Object.keys(fighters.tags).forEach(tag => {
                    if(enemy_tag_to_skill_mapping[tag]) {
                        for(let i = 0; i < enemy_tag_to_skill_mapping[tag].length; i++) {
                            const skill = skills[enemy_tag_to_skill_mapping[tag][i]];

                            add_xp_to_skill({skill, xp_to_add: defender.xp_value*target_count_xp_modifier});

                            const {modifier_to_evasion, modifier_to_defense} = skill.get_stat_modifiers();
                            
                            evasion_chance_modifier *= modifier_to_evasion || 1;
                            defense_modifier += modifier_to_defense || 0;
                        }
                    }
                });
            }
        }

        let damages_dealt = [];

        let critted = false;

        let partially_blocked = false; //only used for combat info in message log

        const hit_chance = 
            get_hit_chance(fighter.getFullStats().attack_points * hit_chance_modifier, target.getFullStats().agility * Math.sqrt(target.getFullStats().intuition ?? 1));


        for(let i = 0; i < fighter.getFullStats().attack_count; i++) {
            damages_dealt.push(Math.round(10 * damage_modifier * base_damage * (1.2 - Math.random() * 0.4))/10); //basic 20% deviation for damage
        }

        damages_dealt = damages_dealt.sort((a,b)=>b-a);

        if(target.hasShield()) {
            if(target.getFullStats().block_chance > Math.random()) {//BLOCKED THE ATTACK

                if(!target.getEquipment()["off-hand"].tags["ignore_skill"]){
                    damages_dealt = damages_dealt.map(x => x*(1-target.getTotalSkillLevel("Shield blocking")/100));
                }
                
                if(!this.is_special_combat && target.tags.main_character) {
                    add_xp_to_skill({skill: skills["Shield blocking"], xp_to_add: defender.xp_value*target_count_xp_modifier});
                }

                const blocked = target.getEquipment()["off-hand"].getShieldStrength() * (target.getEquipment()["off-hand"].tags.ignore_skill?1:target.getStats().total_multiplier.block_strength);

                if(blocked > damages_dealt[0]) {
                    log_message(target.name + " blocked an attack", (!this.is_special_combat && target.tags.main_character ? "hero_blocked" : "hero_missed"));
                    return; //damage fully blocked, nothing more can happen 
                } else {
                    damages_dealt = damages_dealt.map(val => Math.max(0,val-blocked));
                    partially_blocked = true;
                }
            } else if(!this.is_special_combat && target.tags.main_character){
                add_xp_to_skill({skill: skills["Shield blocking"], xp_to_add: defender.xp_value*target_count_xp_modifier/2});
            }
        } else { // HAS NO SHIELD
            const hit_chance = get_hit_chance(defender.stats.dexterity * Math.sqrt(defender.stats.intuition ?? 1), full_stats.evasion_points*evasion_chance_modifier);

            if(hit_chance < Math.random()) { //EVADED ATTACK
                log_message(target.name + " evaded an attack", (!this.is_special_combat && fighter.tags.main_character ? "hero_missed" : "enemy_missed"));

                if(!this.is_special_combat && target.tags.main_character){
                    const xp_to_add = character.isWearingArmor() ? defender.xp_value : defender.xp_value * 1.5;
                    //50% more evasion xp if going without armor
                    add_xp_to_skill({skill: skills["Evasion"], xp_to_add: xp_to_add*});
                }
                
                return; //damage fully evaded, nothing more can happen
            } else {
                if(!this.is_special_combat && target.tags.main_character){
                    add_xp_to_skill({skill: skills["Evasion"], xp_to_add: defender.xp_value*target_count_xp_modifier/2});
                }
            }
        }

        //if this point is reached, attack has successfully struck its target, possibly partially blocked on the way

        game_stats.total_hits_taken += (!this.is_special_combat && target.tags.main_character);
        game_stats.total_hits_done += (!this.is_special_combat && fighter.tags.main_character);
        if(fighter.getFullStats().crit_rate > Math.random()){
            damages_dealt = damages_dealt.map(val => val*fighter.getFullStats().crit_multiplier);
            critted = true;
            game_stats.total_crits_taken += (!this.is_special_combat && target.tags.main_character);

            if(!this.is_special_combat && fighter.tags.main_character) {
                game_stats.total_crits_done++;
                add_xp_to_skill({skill: skills['Perception'], xp_to_add: 1/target_count});
            }
        }

        if(damage_dealt > game_stats.strongest_hit) {
            game_stats.strongest_hit = damage_dealt;
        }

        let {damage_taken, fainted} = target.takeDamage({damage_values: damages_dealt, defense_modifier, give_skill_xp: (!this.is_special_combat && target.tags.main_character)});

        target.on_damaged(fighter);
        fighter.on_hit(target);

        if(!this.is_special_combat && target.tags.main_character) {
            
            if(!target.isWearingArmor()) {
                //no armor so either completely naked or in things with 0 def
                add_xp_to_skill({skill: skills["Iron skin"], xp_to_add: fighter.xp_value * target_count_xp_modifier});
            }

            add_xp_to_skill({skill: skills["Fortitude"], xp_to_add: (damage_taken**0.6)*target_count_xp_modifier});
        }

        const hit_count_msg = damages_dealt.length > 1?` x${damages_dealt.length}`:"";

        if(critted) {
            if(partially_blocked) {
                log_message(target.name + " partially blocked, was critically hit" + hit_count_msg + " for " + Math.ceil(10*damage_taken)/10 + " dmg", "hero_attacked_critically");
            } 
            else {
                log_message(target.name + " was critically hit" + hit_count_msg + " for " + Math.ceil(10*damage_taken)/10 + " dmg", "hero_attacked_critically");
            }
        } else {
            if(partially_blocked) {
                log_message(target.name + " partially blocked, was hit" + hit_count_msg + " for " + Math.ceil(10*damage_taken)/10 + " dmg", "hero_attacked");
            }
            else {
                log_message(target.name + " was hit" + hit_count_msg + " for " + Math.ceil(10*damage_taken)/10 + " dmg", "hero_attacked");
            }
        }


        if(fainted) {
            if(target.tags.main_character) {
                kill_player();
                return;
            } else {
                target.on_death(character);

                log_message(target.name + " was defeated", "enemy_defeated");

                if(!this.is_special_combat && fighter.tags.main_character && target.get_loot) {
                    add_xp_to_character(target.xp_value * target_count_xp_modifier, true);

                    let loot = target.get_loot({drop_chance_modifier: 1/target_count**0.6667});
                    if(loot.length > 0) {
                        process_current_loot({loot_list: loot, is_combat: true});
                        loot = loot.map(x => {return {item_key: item_templates[x.item_id].getInventoryKey(), count: x.count}});
                        character.addToInventory(loot);
                    }
                }
                
                kill_enemy(target);
            }
        } else {

        }
    }

    clear_all_attack_loops() {
        for(let i = 0; i < this.attackers; i++) {
            this.clear_attack_loop({fighter_index: i, is_attacker: true});
        }
        for(let i = 0; i < this.defenders; i++) {
            this.clear_attack_loop({fighter_index: i});
        }
    }

    clear_attack_loop({fighter_index, is_attacker}) {
        clearTimeout(is_attacker ? this.#data.attackers.attack_loops[fighter_index] : this.#data.defenders.attack_loops[fighter_index]);
    }

    reset_combat_loops(skip_persistence_xp_for_stance_change) {
        if(this.is_special_combat) {
            return;
        }

        //todo
        //only if it's not a special fight
        //reset main character's loop, rescale all others
    }

}

export default Combat;