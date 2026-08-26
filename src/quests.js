"use strict";

import { add_quest_to_display, log_message, update_displayed_quest, update_displayed_quest_task } from "./display.js";
import { language, process_rewards } from "./main.js";
import { translationManager } from "./translation.js";

const quests = {};
const active_quests = {};

/**
 * Resolves a quest text id into displayable text.
 *
 * An empty or missing id yields an empty string, so a hidden quest - which has no
 * name and no description - renders as nothing rather than as a "text not found"
 * placeholder. Same for a task that deliberately has no description.
 *
 * @param {String} text_id
 * @returns {String}
 */
function resolve_quest_text(text_id) {
    if(!text_id) {
        return "";
    }
    return translationManager.getText(language, text_id);
}

class QuestTask {
    constructor({
        task_description = "", //optional
        task_condition = {}, 
        //conditions for task to be completed; can be skipped if it's meant to be achieved via some rewards object  
        task_rewards = {}, //generally skipped in favour of quest reward but could sometimes have something?
        is_hidden = false, //keep it false most of the time, but can be used as a way of making quests with no visible requirement for progress
        is_finished = false,
        skip_message = false, //mostly for hidden tasks to be fully hidden instead of mentioning some vague progress
    })
    {
        this.task_description = task_description;
        this.task_condition = task_condition;
        this.task_rewards = task_rewards;
        this.is_hidden = is_hidden;
        this.is_finished = is_finished;
        this.skip_message = skip_message;

        Object.keys(this.task_condition).forEach(task_group => {
            Object.keys(this.task_condition[task_group]).forEach(task_type => {
                    Object.keys(this.task_condition[task_group][task_type]).forEach(task_target_id => {
                        this.task_condition[task_group][task_type][task_target_id].current = 0;
                    });
            });
        });
    }
}
    
class Quest {
    constructor({
                quest_name, //TEXT ID of the displayed name; can be skipped if getQuestName covers all possibilities
                quest_id, //can be skipped, will be set by a short script at the end of the file
                quest_description, //TEXT ID of the description; the text lives in locales/
                questline, //questline for grouping or something, skippable
                quest_tasks = [], //an array of tasks that need to be completed one by one
                quest_condition, //conditions for task to be completed; can be skipped if it's meant to be achieved via some rewards object; works the same as in QuestTask
                quest_rewards, //may include a new quest to automatically start
                display_priority = Infinity, //the lower, the higher up it will show
                is_hidden = false, //hidden quests are not visible and are meant to function as additional unlock mechanism; name and description are skipped
                is_finished = false,
                is_repeatable = false, //true => doesn't get locked after completion and can be gained again
                getQuestName = ()=>{return this.quest_name;},
                getQuestDescription = ()=>{return this.quest_description;},
    }) {
        this.quest_name = quest_name;
        this.quest_id = quest_id;
        this.questline = questline;
        this.quest_tasks = quest_tasks;
        this.quest_description = quest_description;
        this.quest_rewards = quest_rewards || {};
        this.display_priority = display_priority; 
        this.is_hidden = is_hidden;
        this.is_finished = is_finished;
        this.is_repeatable = is_repeatable;
        this.quest_condition = quest_condition;
        //The content-facing accessors return a TEXT ID, not a sentence. These
        //wrappers resolve it, so every existing caller keeps receiving displayable
        //text without knowing about the translation layer. quest_id stays the
        //untranslated registry key, and that is what the save file holds.
        this.getQuestNameId = getQuestName;
        this.getQuestDescriptionId = getQuestDescription;
        this.getQuestName = () => resolve_quest_text(this.getQuestNameId());
        this.getQuestDescription = () => resolve_quest_text(this.getQuestDescriptionId());
    }

    getCompletedTaskCount(){
        if(this.quest_tasks.length == 0) {
            return 0;
        } else {
            return this.quest_tasks.filter(task => task.is_finished).length;
        }
    }
}

const questManager = {
    startQuest({quest_id, should_inform = true}) {
        const quest = quests[quest_id];
        if((!quest.is_finished || quest.is_repeatable) && !this.isQuestActive(quest_id)) {
            active_quests[quest_id] = new Quest(quests[quest_id]);
        }

        if(!quest.is_hidden) {
            add_quest_to_display(quest_id);
            if(should_inform) {
                //getQuestName already resolves to displayable text, and a
                //getText param is substituted literally, so it goes in as-is.
                log_message(translationManager.getText(language, "log started a new quest",
                    {v1: quests[quest_id].getQuestName()}));
            }
        }
    },

    isQuestActive(quest_id) {
        return quest_id in active_quests;
    },

    isQuestFinished(quest_id) {
        return quests[quest_id].is_finished;
    },

    finishQuest({quest_id, only_unlocks, is_from_loading, skip_rewards}) {
        if(this.isQuestActive(quest_id)) {
            const quest = quests[quest_id];

            if(is_from_loading) {
                for(let i = 0; i < quest.quest_tasks.length; i++) {
                    //get unlocks from all tasks
                    this.finishQuestTask({quest_id, task_index: i, only_unlocks: true, skip_warning: true, skip_message: true, is_from_loading, allowed_to_finish_quest: false});
                }
            }

            if(!quest.is_repeatable) {
                quest.is_finished = true;
            }
            delete active_quests[quest_id];
            if(!quests[quest_id].is_hidden) {
                update_displayed_quest(quest_id);
                if(!is_from_loading) {
                    log_message(translationManager.getText(language, "log finished a quest",
                        {v1: quests[quest_id].getQuestName()}));
                }
            }

            if(!skip_rewards) {
                process_rewards({rewards: quests[quest_id].quest_rewards, source_type: "Quest", source_name: quests[quest_id].getQuestName(), only_unlocks: only_unlocks, is_from_loading});
            }
        }
    },

    finishQuestTask({quest_id, task_index, only_unlocks, skip_warning = false, allowed_to_finish_quest = true, skip_message = false, is_from_loading = false}) {
        if(this.isQuestActive(quest_id)) {
            let quest = quests[quest_id];
            quest.quest_tasks[task_index].is_finished = true;
            if(!quests[quest_id].is_hidden) {
                //update_displayed_quest_task(quest_id, task_index);
                update_displayed_quest(quest_id);
                if(!skip_message) {
                    if(!quests[quest_id].quest_tasks[task_index].is_hidden) {
                        log_message(translationManager.getText(language, "log finished a quest task",
                            {v1: quests[quest_id].getQuestName()}));
                    } else if(!quests[quest_id].quest_tasks[task_index].skip_message){
                        log_message(translationManager.getText(language, "log quest progress",
                            {v1: quests[quest_id].getQuestName()}));
                    }
                }
            }

            process_rewards({rewards: quest.quest_tasks[task_index].task_rewards, source_type: "QuestTask", source_name: quests[quest_id].getQuestName(), only_unlocks: only_unlocks, is_from_loading});

            const remaining_tasks = active_quests[quest_id].quest_tasks.filter(task => !task.is_finished);
            if(allowed_to_finish_quest && remaining_tasks.length == 0) { //no more tasks
                this.finishQuest({quest_id: quest_id, only_unlocks: only_unlocks});
            }

        } else {
            if(!skip_warning) {
                console.warn(`Cannot finish task at index ${task_index} for quest "${quest_id}", as it's not a currently active quest!`);
            }
        }
    },

    catchQuestEvent({quest_event_type, quest_event_target, quest_event_count, additional_quest_tags = {}}) {
        Object.keys(active_quests).forEach(active_quest_id => {
            if(!(active_quest_id in active_quests)) {
                //can happen if one quest deletes another
                return;
            }

            const current_task_index = active_quests[active_quest_id].quest_tasks.findIndex(task => !task.is_finished); //get the first unfinished
            const current_task = active_quests[active_quest_id].quest_tasks[current_task_index];

            if(!("any" in current_task.task_condition) && !("all" in current_task.task_condition)) {
                //no conditions (meaning it's progressed via rewards), nothing to check
                return;
            }

            let is_any_met = false;//"any" in current_task.task_condition?false:true;
            let is_all_met = true;//"all" in current_task.task_condition?true:false;
            Object.keys(current_task.task_condition).forEach(task_group => { //any/all
            /*
                task_group (any/all): {
                    task_type (kill/kill_any/clear/reach_skill/enter_location/something_else?): { <- quest_event_type
                        task_target_id (some related id): { <- quest_event_target
                            target: Number,   //for enter_location, best put it at 1; for reach_skill, value is set to quest_event_count instead of being incremented by it
                            current: Number,
                            requirements: {}, //additional tags needed, like "weapon: unarmed" making it required to use unarmed
                            restrictions: {} //opposite of requirements, like "weapon: unarmed" making it required to NOT use unarmed
                        }
                    }
                }

                //

                any: {
                    kill: { //by id
                            "Wolf rat": { target: 10, current: 0, requirements: [],}, 
                            "Wolf": {target: 5, current: 0, requirements: [],}
                    },
                    kill_any: {"Pest": {requirements: [], target: , current: ,}}}, //by tags
                    clear: {"Infested field": {}} //by id
                }
                all:{
                    //same
                }
            */

                
                Object.keys(current_task.task_condition[task_group]).forEach(task_type => { //kill/kill_any/reach_skill/etc
                    Object.keys(current_task.task_condition[task_group][task_type]).forEach(task_target_id => { //"Village", "Wolf", etc
                        if(!current_task.task_condition[task_group][task_type][task_target_id].current) {
                            current_task.task_condition[task_group][task_type][task_target_id].current = 0;
                        }

                        //if event is of proper type, check further conditions, increase the count and check if it's completed
                        if(quest_event_type === task_type && quest_event_target === task_target_id) {

                            let requirements_met = true;

                            //check if additional requirements are not met (present in additional tags)
                            const requirements = current_task.task_condition[task_group][task_type][task_target_id].requirements;
                            Object.keys(requirements || {}).forEach(requirement => {
                                if(!additional_quest_tags[requirement] || additional_quest_tags[requirement] != requirements[requirement]) {
                                    requirements_met = false;
                                }
                            });

                            if(requirements_met) {
                                const restrictions = current_task.task_condition[task_group][task_type][task_target_id].restrictions;
                                Object.keys(restrictions || {}).forEach(restriction => {
                                    
                                    if(additional_quest_tags[restriction] && additional_quest_tags[restriction] === restrictions[restriction]) {
                                        requirements_met = false;
                                    }
                                });
                            }

                            //if they are not met, return without changing .current
                            if(!requirements_met) {
                                is_all_met = false; //set to false as current task_target cannot be possibly fulfilled in this action but the other check wouldn't be reached
                                return;
                            }

                            if(task_type === "reach_skill") {
                                current_task.task_condition[task_group][task_type][task_target_id].current = quest_event_count;
                            } else {
                                current_task.task_condition[task_group][task_type][task_target_id].current += quest_event_count;
                            }
                        }

                        //any => set to true after first met, as only one is needed
                        //all => set to false after first not met, as all are needed
                        //check if conditions are met, do it irrespectible of quest_event_type/target as is_all_met needs to consider all (duh), instead of just the one type that was passed
                        if(task_group === "any" && current_task.task_condition[task_group][task_type][task_target_id].current >= current_task.task_condition[task_group][task_type][task_target_id].target) {
                            is_any_met = true;
                        } else if(task_group === "all" && current_task.task_condition[task_group][task_type][task_target_id].current < current_task.task_condition[task_group][task_type][task_target_id].target) {
                            is_all_met = false;
                        }
                    });
                });
            });

            
            
            if((is_any_met || !("any" in current_task.task_condition)) && (is_all_met || !("all" in current_task.task_condition))) { //completed
                this.finishQuestTask({quest_id: active_quest_id, task_index: current_task_index, allowed_to_finish_quest: false});
            } else {
                if(!active_quests[active_quest_id].is_hidden && !active_quests[active_quest_id].quest_tasks[current_task_index.is_hidden]) {
                    update_displayed_quest_task(active_quest_id, current_task_index);
                }
            }

            const remaining_tasks = active_quests[active_quest_id].quest_tasks.filter(task => !task.is_finished);
            if(remaining_tasks.length == 0) { //no more tasks
                this.finishQuest({quest_id: active_quest_id});
            }
        });
    },
};


//Main story quests
(()=>{
    quests["Lost memory"] = new Quest({
        quest_name: "quest Lost memory",
        display_priority: 0,
        getQuestDescription: ()=>{
            const completed_tasks =  quests["Lost memory"].getCompletedTaskCount();
            //Ranges, not equality: the second task is hidden and completes together
            //with the first, so the count jumps 0 -> 2 and an "== 1" branch is never
            //taken. The chain previously answered for 0 and 1 only, so from the very
            //first elder conversation onward it returned undefined.
            if(completed_tasks == 0) {
                return "quest Lost memory desc 1";
            } else if(completed_tasks <= 3) {
                return "quest Lost memory desc 2";
            } else if(completed_tasks == 4) {
                return "quest Lost memory desc 3";
            } else {
                return "quest Lost memory desc 4";
            }
        },
        questline: "Lost memory",
        quest_tasks: [
            new QuestTask({task_description: "quest Lost memory task 0"}), //talk to elder
            new QuestTask({is_hidden: true}), //so that the 1st task is completed but the next is not yet displayed
            new QuestTask({task_description: "quest Lost memory task 2"}), //talk to elder after dealing with them
            new QuestTask({task_description: "quest Lost memory task 3"}), //talk to suspicious guy
            new QuestTask({task_description: "quest Lost memory task 4"}), //completed by the gate guard's "known" line
        ]
    });

    quests["The Infinite Rat Saga"] = new Quest({
        quest_name: "quest The Infinite Rat Saga",
        display_priority: 0,
        getQuestDescription: ()=>{
            return "quest The Infinite Rat Saga desc 1";
        },
        questline: "The Infinite Rat Saga",
        quest_tasks: [
            new QuestTask({task_description: "quest The Infinite Rat Saga task 0"}), //beat the 'Mysterious gate'
            new QuestTask({task_description: "quest The Infinite Rat Saga task 1"}),
            new QuestTask({task_description: "quest The Infinite Rat Saga task 2"}), 
            new QuestTask({task_description: "quest The Infinite Rat Saga task 3"}), //not yet possible to open 2nd gate
        ]
    });
})();

//General side quests
(()=>{
    quests["It won't mill itself"] = new Quest({
        quest_name: "quest It won't mill itself",
        display_priority: 1,
        getQuestDescription: ()=>{
            if(!quests["It won't mill itself"].quest_tasks[0].is_finished) {
                return "quest It won't mill itself desc 1";
            } else {
                return "quest It won't mill itself desc 2";
            }
        },
        quest_tasks: [
            new QuestTask({task_description: "quest It won't mill itself task 0"}), //gained on talking to elder after clearing 'Cave room'
            new QuestTask({task_description: "quest It won't mill itself task 1"}),
            new QuestTask({task_description: "quest It won't mill itself task 2"}),
        ],
        quest_rewards: {
            money: 500,
            xp: 250,
            reputation: {
                Village: 100,
            }
        }
    });

    quests["Village expansion"] = new Quest({
        quest_name: "quest Village expansion",
        display_priority: 1,
        getQuestDescription: ()=>{
            return "quest Village expansion desc 1";
        },
        quest_tasks: [
            new QuestTask({task_description: "quest Village expansion task 0"}), //finished by completing the dig
            new QuestTask({is_hidden: true, task_rewards: {reputation: {Village: 20}}, skip_message: true}), //finished by talking after finishing digging
            new QuestTask({is_hidden: true, skip_message: true}), //finished by asking for next work after digging
            new QuestTask({task_description: "quest Village expansion task 3"}), //finished by constructing the bridge
            new QuestTask({is_hidden: true, task_rewards: {reputation: {Village: 120}}, skip_message: true}), //finished by reporting afterwards
            new QuestTask({is_hidden: true, skip_message: true}), //finished by asking for further work
            new QuestTask({task_description: "quest Village expansion task 6", task_rewards: {reputation: {Village: 20}}}), //finished by reporting afterwards
            new QuestTask({task_description: "quest Village expansion task 7"}), //tbc, duh
        ],
        quest_rewards: {
        }
    });

    quests["Bonemeal delivery"] = new Quest({
        quest_name: "quest Bonemeal delivery",
        quest_description: "quest Bonemeal delivery desc 1",
        quest_tasks: [
            new QuestTask({task_description: "quest Bonemeal delivery task 0"}),
            
        ],
        quest_rewards: {
            money: 6000,
            xp: 5000,
            reputation: {
                Town: 40,
            }
        }
    });
    quests["Light in the darkness"] = new Quest({
        quest_name: "quest Light in the darkness",
        display_priority: 1,
        getQuestDescription: ()=>{
            return "quest Light in the darkness desc 1";
        },
        quest_tasks: [
            new QuestTask({is_hidden: true}), //gained on entry
            new QuestTask({task_description: "quest Light in the darkness task 1"}), //gained on talking with sus guy
            new QuestTask({task_description: "quest Light in the darkness task 2"}), //next update maybe
        ]
    });
    quests["Ploughs to swords"] = new Quest({
        quest_name: "quest Ploughs to swords",
        display_priority: 1,
        getQuestDescription: ()=>{
            if(!quests["Ploughs to swords"].quest_tasks[1].is_finished) {
                return "quest Ploughs to swords desc 1";
            } else {
                return "quest Ploughs to swords desc 2";
            }
        },
        quest_tasks: [
            new QuestTask({task_description: "quest Ploughs to swords task 0"}), //gained on asking about work without having is_strength_proved flag, gained AND finished on asking with having the flag
            new QuestTask({task_description: "quest Ploughs to swords task 1"}),
            new QuestTask({is_hidden: true}), //completed by asking for more work when it's not winter
            new QuestTask({task_description: "quest Ploughs to swords task 3"}),
        ],
        quest_rewards: {
            money: 5000,
            xp: 50000, //50k
            reputation: {
                Town: 60,
            }
        }
    });
})();

//Hidden quests for unlocks
(()=>{
    quests["Swimming/climbing unlock"] = new Quest({
        //climbing can still be unlocked via fights in the cave
        is_hidden: true,
        quest_tasks: [
            new QuestTask({
                task_condition: {
                    all: {
                        reach_skill: {
                            "Running": {target: 12},
                            "Weightlifting": {target: 12},
                        }
                    }
                }
            })
        ],
        quest_rewards: {
            textlines: [{dialogue: "village elder", lines: ["more training"], skip_message: true}],
        }
    });
    quests["Swimming alternative unlock"] = new Quest({
        //climbing can still be unlocked via fights in the cave
        is_hidden: true,
        quest_rewards: {
            global_activities: ["swimming"],
            messages: ["reward msg swimming tempting"],
        },
        quest_tasks: [
            new QuestTask({
                task_condition: {
                    all: {
                        reach_skill: {
                            "Running": {target: 15},
                            "Weightlifting": {target: 15},
                        }
                    }
                }
            }),
            new QuestTask({
                task_condition: {
                    any: {
                        enter_location: {
                            "Village": {
                                target: 1,
                                restrictions: {season: "Winter"}, //won't trigger in winter
                            },
                            "Forest lake": {
                                target: 1,
                                restrictions: {season: "Winter"}, //won't trigger in winter
                            },
                        }
                    }
                }
            }),
        ],
    });
})();


//Swampland expansion quests
(()=>{
    quests["Giant Enemy Crab"] = new Quest({            //reference to the old "Sony E3 2006 / Giant Enemy Crab" meme
        quest_name: "quest Giant Enemy Crab",
        display_priority: 9,
        getQuestDescription: ()=>{
            if(quests["Giant Enemy Crab"].quest_tasks[1].is_finished) {
                return "quest Giant Enemy Crab desc 3";
            } else if(quests["Giant Enemy Crab"].quest_tasks[0].is_finished) {
                return "quest Giant Enemy Crab desc 2";
            } else {
                return "quest Giant Enemy Crab desc 1";
            }
        },
        questline: "Giant Enemy Crab",
        quest_tasks: [
            new QuestTask({task_description: "quest Giant Enemy Crab task 0"}), //beat the crab once
            new QuestTask({task_description: "quest Giant Enemy Crab task 1"}), //beat the crab twice
        ]
    });
    /*
        Quest 3 of "The Merchant's Word". Its name is the robber's own phrasing.

        The three tasks are the three things the player does not know yet: where
        the man is, why the road was worth robbing, and where what was taken
        went. Who paid is deliberately not among them.
    */
    quests["Somewhere in the Town"] = new Quest({
        quest_name: "quest Somewhere in the Town",
        display_priority: 10,
        getQuestDescription: ()=>{
            if(quests["Somewhere in the Town"].quest_tasks[2].is_finished) {
                return "quest Somewhere in the Town desc 3";
            } else if(quests["Somewhere in the Town"].quest_tasks[1].is_finished) {
                return "quest Somewhere in the Town desc 2";
            } else {
                return "quest Somewhere in the Town desc 1";
            }
        },
        questline: "The Merchant's Word",
        quest_tasks: [
            new QuestTask({task_description: "quest Somewhere in the Town task 1"}),
            new QuestTask({task_description: "quest Somewhere in the Town task 2"}),
            new QuestTask({task_description: "quest Somewhere in the Town task 3"}),
        ]
    });
    /*
        Quest 4. The name is the state the hero woke up in, and the collector
        confirms why: he sold the clothes and kept the one piece worth a card.

        Tasks: establish that the lot was yours, pay for it, and hear what else
        was in it. The third is the one that matters.
    */
    quests["Nothing but Pants"] = new Quest({
        quest_name: "quest Nothing but Pants",
        display_priority: 11,
        getQuestDescription: ()=>{
            if(quests["Nothing but Pants"].quest_tasks[2].is_finished) {
                return "quest Nothing but Pants desc 3";
            } else if(quests["Nothing but Pants"].quest_tasks[0].is_finished) {
                return "quest Nothing but Pants desc 2";
            } else {
                return "quest Nothing but Pants desc 1";
            }
        },
        questline: "The Merchant's Word",
        quest_tasks: [
            new QuestTask({task_description: "quest Nothing but Pants task 1"}),
            new QuestTask({task_description: "quest Nothing but Pants task 2"}),
            new QuestTask({task_description: "quest Nothing but Pants task 3"}),
        ]
    });
    /*
        Quest 6, and the name is hers: "Sorry, but I'm way too strong for you~".

        Two tasks, because there are only two things to do: ask the question again
        now that it is not a joke, and stay upright long enough to steal something.
        Whether she is the adventurer the millers recognise is not a task and never
        becomes one.
    */
    quests["Way Too Strong for You"] = new Quest({
        quest_name: "quest Way Too Strong for You",
        display_priority: 12,
        getQuestDescription: ()=>{
            if(quests["Way Too Strong for You"].quest_tasks[1].is_finished) {
                return "quest Way Too Strong for You desc 3";
            } else if(quests["Way Too Strong for You"].quest_tasks[0].is_finished) {
                return "quest Way Too Strong for You desc 2";
            } else {
                return "quest Way Too Strong for You desc 1";
            }
        },
        questline: "The Merchant's Word",
        quest_tasks: [
            new QuestTask({task_description: "quest Way Too Strong for You task 1"}),
            new QuestTask({task_description: "quest Way Too Strong for You task 2"}),
        ]
    });
    /*
        Quest 1 of the arc, built last. The gate names two keys and only the
        citizen one existed; this is the other, and it is the premise the arc is
        named for - the hero enters the town as a supplier, not as a hero.

        Five tasks: get him talking, three deliveries, and the note.
    */
    quests["The Merchant's Word"] = new Quest({
        quest_name: "quest The Merchant's Word",
        display_priority: 8,
        getQuestDescription: ()=>{
            if(quests["The Merchant's Word"].quest_tasks[3].is_finished) {
                return "quest The Merchant's Word desc 3";
            } else if(quests["The Merchant's Word"].quest_tasks[0].is_finished) {
                return "quest The Merchant's Word desc 2";
            } else {
                return "quest The Merchant's Word desc 1";
            }
        },
        questline: "The Merchant's Word",
        quest_tasks: [
            new QuestTask({task_description: "quest The Merchant's Word task 1"}),
            new QuestTask({task_description: "quest The Merchant's Word task 2"}),
            new QuestTask({task_description: "quest The Merchant's Word task 3"}),
            new QuestTask({task_description: "quest The Merchant's Word task 4"}),
            new QuestTask({task_description: "quest The Merchant's Word task 5"}),
        ]
    });
    /*
        P-10 region 1. Three tasks and the last one is telling him, because the
        region's premise is his loss rather than the player's gain.
    */
    quests["Where We Gathered"] = new Quest({
        quest_name: "quest Where We Gathered",
        display_priority: 13,
        getQuestDescription: ()=>{
            if(quests["Where We Gathered"].quest_tasks[1].is_finished) {
                return "quest Where We Gathered desc 3";
            } else if(quests["Where We Gathered"].quest_tasks[0].is_finished) {
                return "quest Where We Gathered desc 2";
            } else {
                return "quest Where We Gathered desc 1";
            }
        },
        questline: "The Snake's Soul",
        quest_tasks: [
            new QuestTask({task_description: "quest Where We Gathered task 1"}),
            new QuestTask({task_description: "quest Where We Gathered task 2"}),
            new QuestTask({task_description: "quest Where We Gathered task 3"}),
        ]
    });
    /*
        P-10 region 2. Four tasks, and the fourth is the only one that matters: the
        chief hears it. Whether the banished half is alive is not a task and does
        not become one.
    */
    quests["No Snakes Go to the Plains"] = new Quest({
        quest_name: "quest No Snakes Go to the Plains",
        display_priority: 14,
        getQuestDescription: ()=>{
            if(quests["No Snakes Go to the Plains"].quest_tasks[2].is_finished) {
                return "quest No Snakes Go to the Plains desc 3";
            } else if(quests["No Snakes Go to the Plains"].quest_tasks[0].is_finished) {
                return "quest No Snakes Go to the Plains desc 2";
            } else {
                return "quest No Snakes Go to the Plains desc 1";
            }
        },
        questline: "The Snake's Soul",
        quest_tasks: [
            new QuestTask({task_description: "quest No Snakes Go to the Plains task 1"}),
            new QuestTask({task_description: "quest No Snakes Go to the Plains task 2", is_hidden: true}),
            new QuestTask({task_description: "quest No Snakes Go to the Plains task 3"}),
            new QuestTask({task_description: "quest No Snakes Go to the Plains task 4"}),
        ]
    });
    /*
        P-10 region 3. Four tasks, and the last one is a page in a book.

        The quest is named after the cook's line about the bay - "It good place to
        go! To leave!" - because the whole region is built on the second half of it.
        He meant it as the way out. The player goes there to find out what used it.

        The reward is not an item and not a name. It is an entry: a hull, a tide, and
        a name column somebody left empty. Who paid for the robbery is one of the
        things STORY.md keeps open and this does not touch it.
    */
    quests["A Good Place to Leave"] = new Quest({
        quest_name: "quest A Good Place to Leave",
        display_priority: 15,
        getQuestDescription: ()=>{
            if(quests["A Good Place to Leave"].quest_tasks[2].is_finished) {
                return "quest A Good Place to Leave desc 4";
            } else if(quests["A Good Place to Leave"].quest_tasks[1].is_finished) {
                return "quest A Good Place to Leave desc 3";
            } else if(quests["A Good Place to Leave"].quest_tasks[0].is_finished) {
                return "quest A Good Place to Leave desc 2";
            } else {
                return "quest A Good Place to Leave desc 1";
            }
        },
        questline: "The Snake's Soul",
        quest_tasks: [
            new QuestTask({task_description: "quest A Good Place to Leave task 1"}),
            new QuestTask({task_description: "quest A Good Place to Leave task 2"}),
            new QuestTask({task_description: "quest A Good Place to Leave task 3"}),
            new QuestTask({task_description: "quest A Good Place to Leave task 4"}),
        ],
        quest_rewards: {
            xp: 40000,
            money: 20000,
            reputation: {
                Town: 40,
            },
            textlines: [{dialogue: "harbour tallyman", lines: ["tallyman after"]}],
        }
    });
    quests["In Times of Need"] = new Quest({
        quest_name: "quest In Times of Need",
        display_priority: 9,
        getQuestDescription: ()=>{
            if(quests["In Times of Need"].quest_tasks[quests["In Times of Need"].quest_tasks.length-1].is_finished) {    //update upon completion of final task
                return "quest In Times of Need desc 3";
            } else if(quests["In Times of Need"].quest_tasks[0].is_finished) {
                return "quest In Times of Need desc 2";
            } else {
                return "quest In Times of Need desc 1";
            }
        },
        questline: "In Times of Need",
        quest_tasks: [
            new QuestTask({is_hidden: true}), //Gained on entry
            new QuestTask({task_description: "quest In Times of Need task 1"}), //From talking to chief
            new QuestTask({task_description: "quest In Times of Need task 2"}), //From talking to cook
            new QuestTask({is_hidden: true}), //filler after bringing meat, before being told to talk to tailor
            new QuestTask({task_description: "quest In Times of Need task 4"}), //flax delivery part 1
            new QuestTask({task_description: "quest In Times of Need task 5"}), //flax delivery part 2
            new QuestTask({task_description: "quest In Times of Need task 6"}), //tanner delivery part 1
            new QuestTask({task_description: "quest In Times of Need task 7"}), //tanner delivery part 2
            new QuestTask({is_hidden: true}), //filler after bringing alligator skin, before being told to bring snake skin
            new QuestTask({task_description: "quest In Times of Need task 9"}), //tanner delivery part 3
            new QuestTask({task_description: "quest In Times of Need task 10"}), //properly finishes the quest, rewards come in dialogue
        ]
    });
})();


/*
quests["Test quest"] = new Quest({
    quest_name: "quest Test quest",              //a text id; the text lives in locales/
    id: "Test quest",                            //the registry key, never translated
    quest_description: "quest Test quest desc 1", //also a text id
    quest_tasks: [
        new QuestTask({
            task_description: "quest Test quest task 0",
            task_condition: {
                any: {
                    kill: {
                        "Wolf rat": {target: 10}
                    }
                }
            }
        }),
        new QuestTask({
            task_description: "quest Test quest task 1",
            is_hidden: true,
        }),
        new QuestTask({
            task_description: "quest Test quest task 2",
            task_condition: {
                any: {
                    kill: {
                        "Wolf rat": {target: 20}
                    }
                }
            }
        }),
    ]
});
*/

Object.keys(quests).forEach(quest => {
    quests[quest].quest_id = quest;
});

export { quests, active_quests, questManager};
