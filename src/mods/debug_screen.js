"use strict";

import { locations } from "../data/locations.js"
import { enemy_templates } from "../enemies.js"
//import { Material, Book, BookData, item_templates, book_stats } from "../items.js"
//import { inventory_templates, TradeItem } from "../traders.js"
import { recipes, ItemRecipe } from "../crafting_recipes.js"
import { material_properties } from "../crafting_component_filling.js";

class DataViewer {
    debug_window;
    window_content;

    current_keys;
    current_data;

    show_debug_window() {
        if (!this.debug_window) {
            const debug_div = document.createElement("div");
            debug_div.id = "debug_div";
            debug_div.classList.add("box_div");

            const tabs = document.createElement("div");


            const tabNames = ["Mobs", "Materials", "Crafting mats", "Unlocks [WIP]"];
            const tabMethods = [
                () => this.list_enemies(),
                () => this.show_materials(),
                () => this.list_crafting_materials(),
                () => this.show_unlocks()];

            for (var i = 0; i < tabNames.length; i++) {
                let tab = document.createElement("a");
                tab.classList.add("journal_control_button");
                tab.innerText = tabNames[i];
                tab.onclick = tabMethods[i];
                tabs.appendChild(tab);
            }

            debug_div.appendChild(tabs);
            
            this.window_content = document.createElement("div");
            debug_div.appendChild(this.window_content);

            document.body.appendChild(debug_div);

            this.debug_window = debug_div;
        }
        else {
            this.debug_window.style.display = 'block';
        }
    }


    show_materials() {
        this.current_keys = Object.keys(material_properties["rough wood"]);
        this.current_data = Object.keys(material_properties).map((key) => {
            material_properties[key].key = key;
            return material_properties[key];
        });

        this.window_content.innerHTML = this.tabulate_data("tier");
    }

    tabulate_data(sort_by) {
        console.log(sort_by);

        let keys = this.current_keys;
        let values = this.current_data;

        values.sort((a, b) => {
            if (a[sort_by] > b[sort_by])
                return 1;
            if (a[sort_by] < b[sort_by])
                return -1;
            return 0;
        });

        let html = `<table><tr><th><a onclick="sort_data_viewer('key')">Id</a></th>`;
        for (let key of keys) {
            html += `<th><a onclick="sort_data_viewer('${key}')">${key}</a></th>`;
        }
        html += "</tr>";

        for (let material of values) {

            html += `<tr><td>${material.key}</td>`;
            for (let key of keys) {
                html += `<td>${material[key]||""}</td>`;
            }
            html += "</tr>";
        }

        html += "</table>";

        return html;
    }

    sort(key) {
        this.window_content.innerHTML = this.tabulate_data(key);
    }

    show_unlocks() {
        //type, name, area, reward[], requiremenbts, total_requirements =

        const table = [];
        const list = Object.values(locations);


        for (let e of list) {
            if (e.parent_location) {
                let rewards = [];
                rewards = rewards.concat(this.list_rewards(e.first_reward)).concat(this.list_rewards(e.repeatable_reward));
                for (let i in e.rewards_with_clear_requirement) {
                    rewards = rewards.concat(this.list_rewards(e.rewards_with_clear_requirement[i]));
                }

                table.push({
                    content_key: "location:" + e.id,
                    type: "location",
                    name: e.name,
                    zone: e.parent_location,
                    rewards: rewards,
                    reqs: [],
                });
            }
        }

        for (let e of list) {
            if (!e.activities) {
                continue;
            }
            for (let a of Object.values(e.activities)) {
                table.push({
                    content_key: "activity:" + e.name + "/" + a.activity_id,
                    type: "activity",
                    name: a.activity_name,
                    zone: e,
                    rewards: ["xp:" + a.skill_xp_per_tick],
                    reqs: [],
                });
            }
        }

        for (let e of list) {
            if (!e.actions) {
                continue;
            }
            for (let a of Object.values(e.actions)) {
                table.push({
                    content_key: "action:" + e.name + "/" + a.action_id,
                    type: "action",
                    name: a.action_name,
                    zone: e,
                    rewards: this.list_rewards(a.rewards),
                    reqs: this.list_conditions(a.getAvailabilityComponent()),
                });

                //start_conditions
                //success_conditions
            }
        }

        for (let a of Object.values(recipes)) {
            table.push({
                content_key: "recipe:" + a.name,
                type: "recipe",
                name: a.name,
                zone: "",
                rewards: [],
                reqs: [],
            });
        }

        //TODO quests
        //TODO dialogues

        let lookup = {};
        for (let line of table) {
            lookup[line.content_key] = line;
        }
        for (let line of table) {
            
            for (let r of line.rewards) {
                if (!lookup[r]) {
                    console.log("not found: " + r);
                }
                else {
                    lookup[r].reqs.push(line.content_key);
                }
            }
        }

        let html = `<table border="1">
        <tr>
            <th>Type</th>
            <th>Zone</th>
            <th>Name</th>
            <th>Requirements</th>
            <th>Requirements (total)</th>
            <th>Rewards</th>
        </tr>
        `;

        for (let line of table) {
            html += `<tr>
            <td>${line.content_key}</td>
            <td>${line.zone.name}</td>
            <td>${line.name}</td>
            <td>${line.reqs.join("<br>")}</td>
            <td>${this.list_reqs_recursively(line.content_key, [], lookup).join("<br>")}</td>
            <td>${line.rewards.join("<br>")}</td>
            </tr>`;
        }

        html += "</table>";

        this.window_content.innerHTML = html;
    }

    list_reqs_recursively(key, reqs, lookup) {
        let obj = lookup[key];

        reqs.push(key);
        if (obj) {
            for (let req of obj.reqs) {
                reqs.concat(this.list_reqs_recursively(req, reqs, lookup));
            }
        }

        return reqs;
    }

    list_enemies() {
        //enemies
        const elist = Object.entries(enemy_templates).sort((a, b) => (a[1].rank != b[1].rank ? a[1].rank - b[1].rank : a[1].xp_value - b[1].xp_value));

        let html = `<table>
        <tr>
            <td>Name</td>
            <td>Rank</td>
            <td>XP</td>
            <td>Size</td>
            <td>Health</td>
            <td>Atack</td>
            <td>Speed</td>
            <td>Defense</td>
            <td>Hit</td>
            <td>Eva</td>
            <td>Int</td>
        </tr>
        `;

        for (let e of elist) {
            let enemy = e[1];
            console.log(enemy);
            html += `<tr>
            <td>${enemy.name}</td>
            <td>${enemy.rank}</td>
            <td>${enemy.xp_value}</td>
            <td>${enemy.size}</td>
            <td>${enemy.stats.health}</td>
            <td>${enemy.stats.attack}</td>
            <td>${enemy.stats.attack_speed}</td>
            <td>${enemy.stats.defense}</td>
            <td>${enemy.stats.dexterity}</td>
            <td>${enemy.stats.agility}</td>
            <td>${enemy.stats.intuition}</td>
            </tr>`;
        }

        html += "</table>";
        this.window_content.innerHTML = html;
    }

    list_crafting_materials() {
        const materials = {};

        for (let recipe_type of Object.values(recipes)) {
            for (let recipe_group of Object.values(recipe_type)) {
                for (let recipe of Object.values(recipe_group)) {
                    if (!recipe.materials) {
                        continue;
                    }

                    for (let material of recipe.materials) {
                        let mat_id = material.material_id || material.material_type;
                        let result = material.result_id || recipe.result.result_id

                        if (!materials[mat_id]) {
                            materials[mat_id] = {
                                key: mat_id
                            }
                        }
                        if (!materials[mat_id][recipe.recipe_skill]) {
                            materials[mat_id][recipe.recipe_skill] = [];
                        }
                        materials[mat_id][recipe.recipe_skill].push(result);
                    }
                }
            }
        }


        console.log(materials);
        console.log(Object.values(materials));

        this.current_keys = ["key", "Crafting", "Smelting", "Forging", "Woodworking", "Butchering", "Cooking", "Alchemy"];
        this.current_data = Object.values(materials);

        this.window_content.innerHTML = this.tabulate_data("key");

    }

    list_rewards(rewards) {
        let types = [];
        
        if (rewards.locations) {
            for (let i = 0; i < rewards.locations.length; i++) {
                types.push("location:" + rewards.locations[i].location);
            }
        }
        if(rewards.flags) {
            for (let i = 0; i < rewards.flags.length; i++) {
                types.push("flag:" + rewards.flags[i]);
            }
        }
        if(rewards.textlines) {
            for(let i = 0; i < rewards.textlines.length; i++) {
                for (let j = 0; j < rewards.textlines[i].lines.length; j++) {
                    types.push("textlines:" + rewards.textlines[i].dialogue + "/" + rewards.textlines[i].lines[j]);
                }
            }
        }


        if (rewards.npcs) {
            types.push("npcs");
        }
        if (rewards.dialogues) {
            types.push("dialogues");
        }
        if (rewards.traders) {
            types.push("traders");
        }
        if (rewards.housing) {
            types.push("housing");
        }
        if (rewards.crafting) {
            types.push("crafting");
        }
        if (rewards.global_activities) {
            types.push("global_activities");
        }

        if(rewards.actions) {
            for (let i = 0; i < rewards.actions?.length; i++) {
                if (rewards.actions[i].dialogue) {
                    types.push("action-dialogue:" + rewards.actions[i].dialogue + "/" + rewards.actions[i].action);
                } else if(rewards.actions[i].location){
                    types.push("action:" + rewards.actions[i].location + "/" + rewards.actions[i].action);
                }
            }
        }

        if (rewards.activities) {
            for (let i = 0; i < rewards.activities?.length; i++) {
                types.push("activity:" + rewards.activities[i].location + "/" + rewards.activities[i].activity);
            }
        }

        if (rewards.stances) {
            types.push("stances");
        }
        if (rewards.skills) {
            types.push("skills");
        }
        if (rewards.recipes) {
            for (let i = 0; i < rewards.recipes.length; i++) {
                types.push("recipe:" + rewards.recipes[i].category + "/" + rewards.recipes[i].subcategory + "/" + rewards.recipes[i].recipe_id);
            }
        }
        if (rewards.quests) {
            types.push("quests");
        }
        if (rewards.quest_progress) {
            types.push("quest_progress");
        }
        if (rewards.locks) {
            types.push("locks");
        }



        return types;

        //TODO 
        if(rewards.npcs) {
            for(let i = 0; i < rewards.npcs?.length; i++) {
                const npc = NPCRegistry.get(rewards.npcs[i].npc);
                if(!npc.isUnlocked()) {
                    npc.setUnlocked();
                    if(!rewards.npcs[i].skip_message) {
                        log_message(`You can now interact with ${npc.name}`, "activity_unlocked");
                    }
                }
            }
        }

        if(rewards.dialogues) {
            for(let i = 0; i < rewards.dialogues?.length; i++) {
                const dialogue = dialogues[rewards.dialogues[i]]
                if(!dialogue.isUnlocked()) {
                    dialogue.setUnlocked();
                    log_message(`You can now talk with ${dialogue.name}`, "activity_unlocked");
                }
            }
        }

        if(rewards.traders) { 
            for(let i = 0; i < rewards.traders.length; i++) {
                const trader = traders[rewards.traders[i].trader];
                if(!trader.isUnlocked()) {
                    trader.setUnlocked();
                    if(!rewards.traders[i].skip_message) {
                        if(trader.getUnlockMessage()) {
                            log_message(trader.getUnlockMessage(), "activity_unlocked");
                        } else {
                            log_message(`You can now trade with ${trader.name}`, "activity_unlocked");
                        }
                    }
                }
            }
        }

        if(rewards.housing) {
            for(let i = 0; i < rewards.housing.length; i++){
                locations[rewards.housing[i]].housing.setUnlocked();

                if(favourite_locations[rewards.housing[i]]) {
                    //unfavourite the location as it will be added to fast travel anyways due to having housing=true
                    remove_location_from_favourites({location_id: rewards.housing[i]});
                }
            }
        }

        if(rewards.crafting) {
            for(let i = 0; i < rewards.crafting.length; i++) {
                locations[rewards.crafting[i]].crafting.setUnlocked();
                log_message(`You can now use a crafting station in ${locations[rewards.crafting[i]].name}`, "activity_unlocked");
            }
        }

        if(rewards.global_activities) {
            for(let i = 0; i < rewards.global_activities?.length; i++) {
                unlock_global_activity({activity_id: rewards.global_activities[i]});
            }
        }

        if(rewards.stances) {  
            for(let i = 0; i < rewards.stances.length; i++) {
                unlock_combat_stance(rewards.stances[i]);
            }
        }

        if(rewards.skills) {
            for(let i = 0; i < rewards.skills.length; i++) {
                if(!skills[rewards.skills[i]].isUnlocked()) {
                
                    skills[rewards.skills[i]].setUnlocked();
                    create_new_skill_bar(skills[rewards.skills[i]]);
                    update_displayed_skill_bar(skills[rewards.skills[i]], false);
                    if(inform_overall) {
                        log_message(`Unlocked new skill: ${skills[rewards.skills[i]].getName()}`);
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

        if(rewards.quests) {
            for(let i = 0; i < rewards.quests.length; i++) {
                if(!questManager.isQuestActive(rewards.quests[i]) && !questManager.isQuestFinished(rewards.quests[i])) {
                    questManager.startQuest({quest_id: rewards.quests[i]});
                    if(inform_overall) {
                        //log_message(`Received a new quest: ${quests[rewards.quests[i]].getQuestName()}`);
                        //already done in quests
                    }
                }
            }
        }

        if(rewards.quest_progress) {
            for(let i = 0; i < rewards.quest_progress.length; i++) {
                const quest_id = rewards.quest_progress[i].quest_id;
                const task_index = rewards.quest_progress[i].task_index;
                if(task_index == quests[quest_id].getCompletedTaskCount()) {
                    if(quests[quest_id]?.quest_tasks[task_index]) {
                        questManager.finishQuestTask({quest_id: quest_id, task_index: task_index, skip_warning: true});
                    } else {
                        console.warn(`Tried to complete ${task_index}'th task for quest '${quest_id}', but either quest or index does not exist!`);
                    }
                }
            }
        }

        if(rewards.locks) {
            if(rewards.locks.textlines) {
                Object.keys(rewards.locks.textlines).forEach(dialogue_key => {
                    const dialogue = dialogues[dialogue_key];
                    for(let i = 0; i < rewards.locks.textlines[dialogue_key].length; i++) {
                        dialogue.textlines[rewards.locks.textlines[dialogue_key][i]].setFinished();
                    }
                });
            }
            if(rewards.locks.npcs) {
                for(let i = 0; i < rewards.locks.npcs.length; i++) {
                    NPCRegistry.get(rewards.locks.npcs[i]).setFinished();
                    if(current_location.npcs.includes(rewards.locks.npcs[i])) {
                        is_current_location_reload_needed = true;
                    }
                }
            }
            if(rewards.locks.locations) {
                for(let i = 0; i < rewards.locks.locations.length; i++) {
                    was_any_location_availability_changed = lock_location({location: locations[rewards.locks.locations[i]]}) || was_any_location_availability_changed;
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
    }

    list_conditions(availability) {
        let list = [];

        for (let type of ["display_conditions", "start_conditions", "success_conditions"]) { 
            for (let conditions of availability[type]) {
                for (let key in conditions) {
                    list.push(key + ":" + JSON.stringify(conditions[key]));
                    console.log(conditions[key]);
                }
            }
        }

        return list;
    }
}

export {
    DataViewer
}