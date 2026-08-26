"use strict";

import { GameAction } from "./actions.js";
import { language } from "./main.js";
import { translationManager } from "./translation.js";

const dialogues = {};

class Dialogue {
    constructor({ 
        name,
        getName = () =>{return this.name},
        id,
        //OPTIONAL text id for the button that opens this dialogue. Left out,
        //getStartingText builds "Talk to the <name>" from the display name.
        starting_text,
        //assembleName rather than getText: the parts go into the LANGUAGE'S
        //pattern, so a language is free to put the name first, and it
        //capitalises the assembled result - which is the only way to get a
        //capital there when the name leads the sentence.
        getStartingText = () => this.starting_text
            ? translationManager.getText(language, this.starting_text)
            : translationManager.assembleName(language, "ui talk to",
                {v1: `name ${this.name}`}, {capitalise: true}),
        //TEXT ID for the option that ends the conversation.
        ending_text = "ui go back",
        getEndingText = () => translationManager.getText(language, this.ending_text),
        is_unlocked = true,
        is_finished = false,
        textlines = {},
        actions = {},
        description = "",
        getDescription = ()=>{return this.description;},
        location_name
    })  {
        this.name = name; //displayed name, e.g. "Village elder"; if id is not provided, name must match the key dialogue has in dialogues object
        this.getName = getName;
        this.id = id || this.name;
        this.starting_text = starting_text;
        this.getStartingText = getStartingText;
        this.ending_text = ending_text; //TEXT ID for the option to finish talking
        this.getEndingText = getEndingText;
        this.is_unlocked = is_unlocked;
        this.is_finished = is_finished; //separate bool to hide dialogue option if it's considered to be finished
        this.textlines = textlines; //all the lines in dialogue
        this.actions = actions;
        this.description = description;
        this.getDescription = getDescription;

        this.location_name = location_name; //this is purely informative and wrong value shouldn't cause any actual issues
    }
}

class Textline {
    constructor({name,
                 text,
                 getText,
                 is_unlocked = true,
                 is_finished = false,
                 is_branch_only = false,
                 rewards = {textlines: [],
                            locations: [],
                            dialogues: [],
                            traders: [],
                            stances: [],
                            flags: [],
                            items: [],
                            locks: {},
                            //reputation reward from textlines is currently not supported
                            },
                branches_into = [],
                locks_lines = [], //for lines to be locked in >same< dialogue
                //it's a simplified version of doing rewards: {locks: textlines: {...blah blah blah, values from it are actually autofilled in that form in a script at the end of this file
                otherUnlocks,
                required_flags,
                display_conditions = [],
            }) 
    {
        this.name = name; // displayed option to click, don't make it too long
        this.text = text; // what's shown after clicking
        this.getText = getText || function(){return this.text;};
        this.otherUnlocks = otherUnlocks || function(){return;};
        this.is_unlocked = is_unlocked;
        this.is_finished = is_finished;
        this.is_branch_only = is_branch_only; //if true, textline won't be displayed in overall view and instead will only be available as a branch dialogue
        this.rewards = rewards || {};
        this.branches_into = branches_into;
        
        this.rewards.textlines = rewards.textlines || [];
        this.rewards.locations = rewards.locations || [];
        this.rewards.dialogues = rewards.dialogues || [];
        this.rewards.traders = rewards.traders || [];
        this.rewards.stances = rewards.stances || [];
        this.rewards.flags = rewards.flags || [];
        this.rewards.items = rewards.items || [];
        
        this.display_conditions = [display_conditions];
        this.required_flags = required_flags; //generally could be handled via display_conditions but offers a bit more freedom allowing a condition of /not/ having a flag too

        this.locks_lines = locks_lines;

        this.rewards.locks = rewards.locks || {};
        if(!this.rewards.locks.textlines) {
            this.rewards.locks.textlines = {};
        }
        //related text lines that get locked; might be itself, might be some previous line 
        //e.g. line finishing quest would also lock line like "remind me what I was supposed to do"
        //should be alright if it's limited only to lines in same Dialogue
        //just make sure there won't be Dialogues with ALL lines unavailable
    }
}

class DialogueAction extends GameAction {
    constructor(data) {
        super(data);
        this.giveup_text = data.giveup_text;
        this.floating_click_effects = data.floating_click_effects;
    }
}

(function(){
    dialogues["village elder"] = new Dialogue({
        //ram
        name: "village elder",
        textlines: {
            "hello": new Textline({
                name: "elder hello",
                text: "elder hello answ",
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["what happened", "where am i", "dont remember", "about"]}],
                },
                locks_lines: ["hello"],
            }),
            "what happened": new Textline({
                name: "elder head hurts",
                text: "elder head hurts answ",
                is_unlocked: false,
                locks_lines: ["what happened", "where am i", "dont remember"],
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 1"]}],
                    quest_progress: [
                        {quest_id: "Lost memory", task_index: 0},
                    ]
                },
            }),
            "where am i": new Textline({
                name: "elder where",
                text: "elder where answ",
                is_unlocked: false,
                locks_lines: ["what happened", "where am i", "dont remember"],
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 1"]}],
                    quest_progress: [
                        {quest_id: "Lost memory", task_index: 0},
                    ]
                },
            }),
            "dont remember": new Textline({
                name: "elder remember",
                text: "elder remember answ",
                is_unlocked: false,
                locks_lines: ["what happened", "where am i", "dont remember"],
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 1"]}],
                    quest_progress: [
                        {quest_id: "Lost memory", task_index: 0},
                    ]
                },
            }),
            "about": new Textline({
                name: "elder who",
                text: "elder who answ",
                is_unlocked: false,
                locks_lines: ["about"]
            }),
            "ask to leave 1": new Textline({
                name: "elder leave 1",
                text: "elder leave 1 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["need to"]}],
                },
                locks_lines: ["ask to leave 1"],
            }),
            "need to": new Textline({
                name: "elder need to",
                text: "elder need to answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["rats", "ask to leave 2", "starting gear"]}],
                    locations: [{location: "Infested field"}],
                    activities: [{location:"Village", activity:"weightlifting"}, {location:"Village",activity:"running"}],
                    quest_progress: [
                        {quest_id: "Lost memory", task_index: 1},
                    ]
                },
                locks_lines: ["need to"],
            }),
            "starting gear": new Textline({
                name: "elder starting gear",
                text: "elder starting gear answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["equipment", "dagger", "sword", "spear", "axe", "hammer", "none"]}],
                },
                branches_into: ["dagger", "sword", "spear", "axe", "hammer", "none"],
            }),
            "dagger": new Textline({
                name: "elder dagger",
                text: "elder weapon answ",
                is_unlocked: false,
                is_branch_only: true,
                locks_lines: ["starting gear"],
                rewards: {
                    items: [
                        {item: "Cheap iron dagger", quality: 50},
                    ]
                }
            }),
            "sword": new Textline({
                name: "elder sword",
                text: "elder weapon answ",
                is_unlocked: false,
                is_branch_only: true,
                locks_lines: ["starting gear"],
                rewards: {
                    items: [
                        {item: "Cheap iron sword", quality: 50},
                    ]
                }
            }),
            "spear": new Textline({
                name: "elder spear",
                text: "elder weapon answ",
                is_unlocked: false,
                is_branch_only: true,
                locks_lines: ["starting gear"],
                rewards: {
                    items: [
                        {item: "Cheap iron spear", quality: 50},
                    ]
                }
            }),
            "axe": new Textline({
                name: "elder axe",
                text: "elder weapon answ",
                is_unlocked: false,
                is_branch_only: true,
                locks_lines: ["starting gear"],
                rewards: {
                    items: [
                        {item: "Cheap iron axe", quality: 50},
                    ]
                }
            }),
            "hammer": new Textline({
                name: "elder hammer",
                text: "elder weapon answ",
                is_unlocked: false,
                is_branch_only: true,
                locks_lines: ["starting gear"],
                rewards: {
                    items: [
                        {item: "Cheap iron battle hammer", quality: 50},
                    ]
                }
            }),
            "none": new Textline({
                name: "elder none",
                text: "elder weapon none answ",
                is_unlocked: false,
                is_branch_only: true,
                locks_lines: ["starting gear"],
            }),
            "equipment": new Textline({
                name: "elder eq",
                text: "elder eq answ",
                is_unlocked: false,
                locks_lines: ["equipment"],
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["money"]}],
                    traders: [{trader: "village trader"}]
                }
            }),
            "money": new Textline({
                name: "elder money",
                text: "elder money answ",
                is_unlocked: false,
                locks_lines: ["money"],
                rewards: {
                    activities: [{location: "Village", activity: "fieldwork"}],
                }
            }),
            "other work": new Textline({
                //unlocked by same dialogue that unlocks cave, but hidden behind lvl 9 farming req
                name: "elder other work",
                text: "elder other work answ",
                is_unlocked: false,
                locks_lines: ["other work"],
                rewards: {
                    actions: [{location: "Village", action: "dig canal"}],
                    quests: ["Village expansion"],
                },
                display_conditions: {
                    skills: {"Farming": 9},
                }
            }),
            "finished digging": new Textline({
                name: "elder finished digging",
                text: "elder finished digging answ",
                is_unlocked: false,
                locks_lines: ["finished digging"],
                rewards: {
                    money: 350, //50 more than same time spent on fieldwork in town farms with lvl 10 farming
                    textlines: [{dialogue: "village elder", lines: ["other work 2"]}],
                    quest_progress: [
                        {quest_id: "Village expansion", task_index: 1},
                    ]
                },
            }),
            "other work 2": new Textline({
                name: "elder other work 2",
                text: "elder other work 2 answ",
                is_unlocked: false,
                locks_lines: ["other work 2"],
                rewards: {
                    actions: [{location: "Village", action: "bridge mat delivery"}],
                    quest_progress: [
                        {quest_id: "Village expansion", task_index: 2},
                    ],
                    textlines: [{dialogue: "village elder", lines: ["bridge materials"]}],
                },
            }),
            "bridge materials": new Textline({
                name: "elder bridge materials",
                text: "elder bridge materials answ",
                is_unlocked: false,
                locks_lines: ["bridge materials"],
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["leave for materials"]}],
                    activities: [{location:"Nearby cave", activity: "mining stone"}],
                    locations: [{location:"Nearby cave"}], //if somehow it wasn't unlocked yet
                    dialogues: ["old craftsman"], //if somehow it wasn't unlocked yet
                }
            }),
            "leave for materials": new Textline({
                name: "elder leave for materials materials",
                text: "elder leave for materials materials answ",
                is_unlocked: false,
                locks_lines: ["leave for materials"],
            }),

            "bridge finished": new Textline({
                name: "elder bridge finished",
                text: "elder bridge finished answ",
                is_unlocked: false,
                locks_lines: ["bridge materials", "bridge finished"],
                rewards: {
                    //todo: rep from task
                    money: 4000,
                    textlines: [{dialogue: "village elder", lines: ["other work 3"]}],
                    quest_progress: [
                        {quest_id: "Village expansion", task_index: 4},
                    ]
                },
            }),

            "other work 3": new Textline({
                name: "elder dragonflies",
                text: "elder dragonflies answ",
                is_unlocked: false,
                locks_lines: ["other work 3"],
                rewards: {
                    locations: [{location: "Infested woods"}],
                    quest_progress: [
                        {quest_id: "Village expansion", task_index: 5},
                    ]                   
                },
            }),

            "dragonflies killed": new Textline({
                name: "elder dragonflies killed",
                text: "elder dragonflies killed answ",
                is_unlocked: false,
                locks_lines: ["dragonflies killed"],
                rewards: {
                    money: 800,
                    textlines: [{dialogue: "village elder", lines: ["further work"]}],
                    quest_progress: [
                        {quest_id: "Village expansion", task_index: 6},
                    ]      
                },
            }),

            "further work": new Textline({
                name: "elder further work",
                text: "elder further work answ",
                is_unlocked: false,
                //doesn't lock itself for now; to be updated with lock, unlocks, and different text when more stuff is added on the other side of river
            }),

            "ask to leave 2": new Textline({
                name: "elder leave 2",
                text: "elder leave 2 answ",
                is_unlocked: false,
            }),
            "rats": new Textline({
                name: "elder rats",
                text: "elder rats answ",
                is_unlocked: false,
            }),
            "cleared field": new Textline({ //will be unlocked on clearing infested field combat_zone
                name: "elder cleared 1",
                text: "elder cleared 1 answ",
                is_unlocked: false,
                rewards: {
                    locations: [{location: "Nearby cave"}, {location: "Infested field"}, {location: "Shack"}],
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 3", "other work"]}],
                    dialogues: ["old craftsman"],
                },
                locks_lines: ["ask to leave 2", "cleared field", "cleared field alt"],
                required_flags: {no: ["is_gathering_unlocked"]},
            }),
            "cleared field alt": new Textline({ //if gathering is already unlocked, as that means player already met the craftsman
                name: "elder cleared 1 alt",
                text: "elder cleared 1 alt answ",
                is_unlocked: false,
                rewards: {
                    locations: [{location: "Nearby cave"}, {location: "Infested field"}, {location: "Shack"}],
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 3"]}],
                },
                locks_lines: ["ask to leave 2", "cleared field", "cleared field alt"],
                required_flags: {yes: ["is_gathering_unlocked"]},
            }),
            "ask to leave 3": new Textline({
                name: "elder leave 3",
                text: "elder leave 3 answ",
                rewards: {
                    locations: [{location: "Nearby cave"}, {location: "Infested field"}],
                    dialogues: ["old craftsman"],
                },
                is_unlocked: false,
            }),
            "cleared room": new Textline({
                name: "elder room clear",
                text: "elder room clear answ",
                is_unlocked: false,
                rewards: {
                    locations: [{location: "Eastern mill"}],
                    quests: ["It won't mill itself"],
                },
                locks_lines: ["cleared room"],
            }),
            "cleared cave": new Textline({
                name: "elder cave clear",
                text: "elder cave clear answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 4", "crab rumors", "amulet"]}],
                    locations: [{location: "Forest road"}, {location: "Infested field"}, {location: "Nearby cave"}],
                    dialogues: ["village guard"],
                    quest_progress: [
                        {quest_id: "Lost memory", task_index: 2},
                    ]
                },
                locks_lines: ["ask to leave 3", "rats", "cleared cave", "leave for materials"],
            }),
            "ask to leave 4": new Textline({
                name: "elder leave 4",
                text: "elder leave 4 answ",
                is_unlocked: false,
                rewards: {
                    locations: [{location: "Forest road"}, {location: "Infested field"}, {location: "Nearby cave"}],
                    dialogues: ["village guard", "old craftsman"],
                    textlines: [{dialogue: "village elder", lines: ["about guard", "amulet"]}],
                },
            }),
            "amulet": new Textline({
                name: "elder amulet",
                text: "elder amulet answ",
                is_unlocked: false,
                locks_lines: ["amulet"],
                rewards: {
                    items: ["Old ram's horn"],
                },
                display_conditions: {
                    reputation: {Village: 400},
                },
            }),
            "about guard": new Textline({
                name: "elder about guard",
                text: "elder about guard answ",
                is_unlocked: false,
                required_flags: {yes: ["is_guard_met"]},
                locks_lines: ["about guard"],
            }),
            "new tunnel": new Textline({
                name: "elder tunnel",
                text: "elder tunnel answ",
                is_unlocked: false,
                locks_lines: ["new tunnel"],
            }),

            "crab rumors": new Textline({
                name: "elder crab rumors",
                text: "elder crab rumors answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["crab where"]}],
                },
                display_conditions: {
                    hero_level: 25,
                },
                locks_lines: ["crab rumors"],
            }),
            
            "crab where": new Textline({
                name: "elder crab where",
                text: "elder crab where answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "village elder", lines: ["crab hunt"]}],
                },
                locks_lines: ["crab where"],
            }),
            "crab hunt": new Textline({
                name: "elder crab hunt",
                text: "elder crab hunt answ",
                is_unlocked: false,
                rewards: {
                    actions: [{location: "Village", action: "hike down river"}],
                    quests: ["Giant Enemy Crab"],
                },
                locks_lines: ["crab hunt"]
            }),
            
            "more training": new Textline({
                name: "elder training",
                getText: (context) => {
                    if(context?.season === "Winter") {
                        return "elder training answ 2";
                    } else {
                        return "elder training answ 1";
                    }
                },
                is_unlocked: false,
                locks_lines: ["more training"],
                rewards: {
                    global_activities: ["swimming", "climbing"],
                    actions: [{location: "Nearby cave", action: "climb the mountain"}],
                    locks: {
                        quests: ["Swimming alternative unlock"]
                    }
                }
            })
        },
        description: "elder description",
    });

    dialogues["old craftsman"] = new Dialogue({
        //badger
        name: "old craftsman",
        is_unlocked: false,
        textlines: {
            "hello": new Textline({
                name: "craftsman hello",
                text: "craftsman hello answ",
                rewards: {
                    textlines: [{dialogue: "old craftsman", lines: ["learn", "leave", "about guard"]}],
                },
                locks_lines: ["hello"],
            }),
            "learn": new Textline({
                name: "craftsman learn",
                text: "craftsman learn answ",
                rewards: {
                    textlines: [{dialogue: "old craftsman", lines: ["remind1", "remind2", "remind3", "remind4"]}],
                    items: ["Old pickaxe" ,"Old axe", "Old sickle", "Old shovel"],
                    flags: ["is_gathering_unlocked", "is_crafting_unlocked"],
                },
                locks_lines: ["learn","leave"],
                is_unlocked: false,
            }),
            "leave": new Textline({
                name: "craftsman leave",
                text: "craftsman leave answ",
                is_unlocked: false,
            }),
            
            "remind1": new Textline({
                name: "craftsman remind 1",
                text: "craftsman remind 1 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "old craftsman", lines: ["remind4"]}],
                },
            }),
            "remind2": new Textline({
                name: "craftsman remind 2",
                text: "craftsman remind 2 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "old craftsman", lines: ["remind4"]}],
                },
            }),
            "remind3": new Textline({
                name: "craftsman remind 3",
                text: "craftsman remind 3 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "old craftsman", lines: ["remind4"]}],
                },
            }),
            "remind4": new Textline({
                name: "craftsman remind 4",
                text: "craftsman remind 4 answ",
                is_unlocked: false,
            }),
            /*
                P-10 region 4. His own teaching already has this shape - "there's a
                limit to how much you can learn by working with rat leather" - and the
                limit he never named is the one in his own hearth. He cannot build the
                thing he is describing, and he says so without making it sad.
            */
            "heat": new Textline({
                name: "craftsman heat",
                text: "craftsman heat answ",
                is_unlocked: false,
                rewards: {
                    actions: [{location: "Mountain camp", action: "cut a flue"}],
                    quests: ["A Fire in a Hollow"],
                    quest_progress: [{quest_id: "A Fire in a Hollow", task_index: 0}],
                },
                locks_lines: ["heat"],
            }),
            "heat after": new Textline({
                name: "craftsman heat after",
                text: "craftsman heat after answ",
                is_unlocked: false,
            }),
            "about guard": new Textline({
                name: "craftsman about guard",
                text: "craftsman about guard answ",
                is_unlocked: false,
                required_flags: {yes: ["is_guard_met"]},
                locks_lines: ["about guard"],
            }),
        },
        description: "craftsman description",
    });

    dialogues["village guard"] = new Dialogue({
        name: "village guard",
        is_unlocked: false,
        textlines: {
            "hello": new Textline({
                name: "guard hello",
                text: "guard hello answ",
                rewards: {
                    textlines: [{dialogue: "village guard", lines: ["tips", "job", "hi"]}],
                    flags: ["is_guard_met"],
                },
                locks_lines: ["hello"],
            }),
            "job": new Textline({
                name: "guard job",
                is_unlocked: false,
                text: "guard job answ",
                rewards: {
                    activities: [{location:"Village", activity:"patrolling"}],
                },
                locks_lines: ["job"],
            }),
            "tips": new Textline({
                name: "guard tips",
                is_unlocked: false,
                text: "guard tips answ",
                rewards: {
                    textlines: [{dialogue: "village guard", lines: ["teach"]}],
                },
            }),
            "hi": new Textline({
                name: "guard hi",
                is_unlocked: false,
                text: "guard hi answ",
                display_conditions: {
                    reputation: {Village: 200},
                },
                rewards: {
                    actions: [{dialogue: "village guard", action: "ask for pats"}, {dialogue: "village guard", action: "try to pat"}],
                },
                locks_lines: ["hi"],
            }),
            "teach": new Textline({
                name: "guard teach",
                is_unlocked: false,
                text: "guard teach answ",
                rewards: {
                    locations: [{location: "Sparring with the village guard (quick)"}, {location: "Sparring with the village guard (heavy)"}],
                },
                locks_lines: ["teach"],
            }),
            "quick": new Textline({
                name: "guard quick",
                is_unlocked: false,
                text: "guard quick answ",
                otherUnlocks: () => {
                    if(dialogues["village guard"].textlines["heavy"].is_finished) {
                        dialogues["village guard"].textlines["wide"].is_unlocked = true;
                    }
                },
                locks_lines: ["quick"],
                rewards: {
                    stances: ["quick"],
                    skill_xp: {
                        Combat: 100,
                    }
                }
            }),
            "heavy": new Textline({
                name: "guard heavy",
                is_unlocked: false,
                text: "guard heavy answ",
                otherUnlocks: () => {
                    if(dialogues["village guard"].textlines["quick"].is_finished) {
                        dialogues["village guard"].textlines["wide"].is_unlocked = true;
                    }
                },
                locks_lines: ["heavy"],
                rewards: {
                    stances: ["heavy"],
                    skill_xp: {
                        Combat: 100,
                    }
                }
            }),
            "wide": new Textline({
                name: "guard wide",
                is_unlocked: false,
                text: "guard wide answ",
                locks_lines: ["wide"],
                rewards: {
                    stances: ["wide"],
                    textlines: [{dialogue: "village guard", lines: ["serious", "hi", "tips 2", "teach more"]}],
                    skill_xp: {
                        Combat: 100,
                    }
                }
            }),
            /*
                QUEST 6. Gated on hero level rather than on a flag, because what she
                is reacting to is what the player has become - the frontier is level
                25 to 30, which is where this becomes askable without being a joke.

                She grants the last two stances the same way she granted the first
                three: by sparring, which "guard teach answ" already establishes as
                her method for anything that cannot be explained.
            */
            "serious 2": new Textline({
                name: "guard serious 2",
                is_unlocked: true,
                text: "guard serious 2 answ",
                display_conditions: {hero_level: 25},
                rewards: {
                    quests: ["Way Too Strong for You"],
                    quest_progress: [{quest_id: "Way Too Strong for You", task_index: 0}],
                    actions: [{dialogue: "village guard", action: "spar"}],
                },
                locks_lines: ["serious 2", "serious"],
            }),
            "after": new Textline({
                name: "guard after",
                is_unlocked: false,
                text: "guard after answ",
                locks_lines: ["after"],
            }),
            "teach more": new Textline({
                name: "guard teach more",
                is_unlocked: false,
                text: "guard teach more answ",
                locks_lines: ["teach more"],
            }),
            "serious": new Textline({
                name: "guard serious",
                is_unlocked: false,
                text: "guard serious answ",
                locks_lines: ["serious"],
            }),
            "tips 2": new Textline({
                name: "guard tips 2",
                is_unlocked: false,
                text: "guard tips 2 answ",
                rewards: {
                    textlines: [{dialogue: "village guard", lines: ["scars"]}],
                }
            }),
            "scars": new Textline({
                name: "guard scars",
                is_unlocked: false,
                text: "guard scars answ",
                locks_lines: ["scars"],
            }),
        },
        actions: {
            "ask for pats": new DialogueAction({
                action_id: "ask for pats",
                is_unlocked: false,
                repeatable: true,
                starting_text: "guard pats",
                floating_click_effects: ['(ノ= ⩊ = )ノ', '( ´･･)ﾉ'],
                description: "",
                action_text: "",
                success_text: "guard pats answ",
                attempt_duration: 0,
                success_chances: [1],
            }),
            /*
                Deliberately not a Challenge_zone. "I'm way too strong for you" is
                canon, so this cannot be an enemy the player defeats; what is being
                measured is whether they last long enough to steal something.

                Repeatable, because she says to come at her until you stop, and
                because the stances arrive on the first success and the rest is
                practice.
            */
            "spar": new DialogueAction({
                action_id: "spar",
                is_unlocked: false,
                action_name: "guard spar name",
                starting_text: "guard spar",
                description: "guard spar desc",
                action_text: "guard spar during",
                success_text: "guard spar answ",
                repeatable: true,
                conditions: [
                    {skills: {Combat: 20, Evasion: 15}},
                    {skills: {Combat: 40, Evasion: 35}},
                ],
                failure_texts: {
                    conditional_loss: ["guard spar fail conditional_loss 1"],
                },
                attempt_duration: 90,
                success_chances: [0.25, 1],
                rewards: {
                    xp: 2500,
                    skill_xp: {Combat: 900, Evasion: 900},
                    stances: ["berserk", "flowing water"],
                    quest_progress: [{quest_id: "Way Too Strong for You", task_index: 1}],
                    textlines: [{dialogue: "village guard", lines: ["after"]}],
                },
            }),
            "try to pat": new DialogueAction({
                action_id: "try to pat",
                is_unlocked: false,
                repeatable: true,
                starting_text: "guard try",
                floating_click_effects: ['(ノ= ⩊ = )ノ', '( ´･･)ﾉ'],
                description: "",
                action_text: "",
                success_texts: ["guard try answ", "guard try answ too short"],
                getSuccessText: function(context) {
                    if(context.character.getUniversalHeight() === "very short") {
                        return this.success_texts[1];
                    } else {
                        return this.success_texts[0];
                    }
                },
                success_text: "guard try answ",
                attempt_duration: 0,
                success_chances: [1],
            }),
        },
        description: "guard description",
    });

    dialogues["village millers"] = new Dialogue({
        //cat and mouse
        name: "village millers",
        textlines: {
            "hello": new Textline({
                name: "millers hello",
                text: "millers hello answ",
                rewards: {
                    textlines: [{dialogue: "village millers", lines: ["how", "young", "about guard"]}],
                },
                locks_lines: ["hello"],
            }),
            "how": new Textline({
                is_unlocked: false,
                name: "millers how",
                text: "millers how answ",
                rewards: {
                    textlines: [{dialogue: "village millers", lines: ["sure"]}],
                },
                locks_lines: ["how"],
            }),
            "sure": new Textline({
                is_unlocked: false,
                name: "millers sure",
                text: "millers sure answ",
                rewards: {
                    quest_progress: [{quest_id: "It won't mill itself", task_index: 0}],
                    locations: [{location: "Eastern storehouse"}],
                },
                locks_lines: ["sure"],
            }),
            "young": new Textline({
                is_unlocked: false,
                name: "millers young",
                text: "millers young answ",
                locks_lines: ["young"],
            }),
            "cleared storage": new Textline({
                is_unlocked: false,
                name: "millers cleared",
                text: "millers cleared answ",
                locks_lines: ["cleared storage"],
                rewards: {
                    quest_progress: [{quest_id: "It won't mill itself", task_index: 1}],
                    actions: [{location: "Village", action: "search for delivery"}],
                },
            }),
            "delivered": new Textline({
                is_unlocked: false,
                name: "millers delivered",
                text: "millers delivered answ",
                locks_lines: ["delivered"],
                rewards: {
                    textlines: [{dialogue: "village millers", lines: ["kiss"]}],
                    quest_progress: [{quest_id: "It won't mill itself", task_index: 2}],
                    actions: [{location: "Village", action: "search for delivery"}],
                },
            }),
            "kiss": new Textline({
                is_unlocked: false,
                name: "millers kiss",
                text: "millers kiss answ",
                branches_into: ["kiss both", "kiss cat", "kiss mouse", "reject nice", "reject mean"],
            }),
            "kiss both": new Textline({
                is_branch_only: true,
                name: "millers kiss both",
                text: "millers kiss both answ",
                locks_lines: ["kiss"],
                rewards: {
                    textlines: [{dialogue: "village millers", lines: ["kiss more", "how2"]}],
                }
            }),
            "kiss cat": new Textline({
                is_branch_only: true,
                name: "millers kiss cat",
                text: "millers kiss cat answ",
                locks_lines: ["kiss"],
                rewards: {
                    textlines: [{dialogue: "village millers", lines: ["kiss more", "how2"]}],
                }
            }),
            "kiss mouse": new Textline({
                is_branch_only: true,
                name: "millers kiss mouse",
                text: "millers kiss mouse answ",
                locks_lines: ["kiss"],
                rewards: {
                    textlines: [{dialogue: "village millers", lines: ["kiss more", "how2"]}],
                }
            }),
            "reject nice": new Textline({
                is_branch_only: true,
                name: "millers reject nice",
                text: "millers reject nice answ",
                locks_lines: ["kiss"],
                rewards: {
                    textlines: [{dialogue: "village millers", lines: ["how2"]}],
                }
            }),
            "reject mean": new Textline({
                is_branch_only: true,
                name: "millers reject mean",
                text: "millers reject mean answ",
                locks_lines: ["kiss"],
                rewards: {
                    textlines: [{dialogue: "village millers", lines: ["how2"]}],
                }
            }),
            "kiss more": new Textline({
                is_unlocked: false,
                name: "millers kiss more",
                text: "millers kiss more answ",
                locks_lines: ["kiss more"],
            }),
            "how2": new Textline({
                is_unlocked: false,
                name: "millers how2",
                text: "millers how2 answ",
            }),
            "about guard": new Textline({
                name: "millers about guard",
                text: "millers about guard answ",
                is_unlocked: false,
                required_flags: {yes: ["is_guard_met"]},
                locks_lines: ["about guard"],
            }),
        },
        description: "millers description",
    });

    dialogues["gate guard"] = new Dialogue({
        name: "gate guard",
        textlines: {
            "enter": new Textline({
                name: "g guard hello",
                text: "g guard hello answ",
            }), 
            "known": new Textline({
                name: "g guard known",
                text: "g guard known answ",
                //Town reputation is the citizen path the guard names in "enter".
                //150 is the entire amount obtainable at the moment: 50 from
                //clearing the Gang hideout, 40 from Bonemeal delivery and 60 from
                //Ploughs to swords - so the gate opens once the region's own work
                //is done. If later content grants Town reputation, revisit this
                //number rather than leaving it as an accidental part-way gate.
                //display_conditions is a plain object here: the Textline
                //constructor wraps it in the array that process_conditions reads.
                display_conditions: {
                    reputation: {Town: 150},
                },
                rewards: {
                    locations: [{location: "Town square"}],
                    quest_progress: [
                        {quest_id: "Lost memory", task_index: 4},
                    ],
                    textlines: [{dialogue: "gate guard", lines: ["passed"]}],
                },
                //"enter" is locked too: its answer says the town is closed, which
                //stops being true the moment this line resolves.
                locks_lines: ["enter", "known", "supplier"],
            }), 
            /*
                The supplier path. "known" is the citizen half, gated on Town
                reputation; this is the membership half, and it is unlocked rather
                than condition-gated because the factor's note IS the condition.

                Same rewards, because it is the same gate.
            */
            "supplier": new Textline({
                name: "g guard supplier",
                is_unlocked: false,
                text: "g guard supplier answ",
                rewards: {
                    locations: [{location: "Town square"}],
                    quest_progress: [
                        {quest_id: "Lost memory", task_index: 4},
                    ],
                    textlines: [{dialogue: "gate guard", lines: ["passed"]}],
                },
                locks_lines: ["enter", "known", "supplier"],
            }),
            "passed": new Textline({
                name: "g guard passed",
                text: "g guard passed answ",
                is_unlocked: false,
            }), 
        },
        description: "g guard description",
    });
    dialogues["suspicious man"] = new Dialogue({
        name: "suspicious man",
        getName: (context)=>{
            if(dialogues["suspicious man"].actions["headpat"].is_unlocked) {
                if(context.is_mofu_mofu_enabled) {
                    return "puppy"; //yeah, whatever
                } else {
                    return "no-longer-suspicious guy";
                }
            } else {
                return dialogues["suspicious man"].name;
            }
        },
        getStartingText: (context)=>{
            //getName returns the canonical English variant - "puppy",
            //"no-longer-suspicious guy" or the key itself - and each one has a
            //"name <variant>" row, which is what the pattern takes.
            return translationManager.assembleName(language, "ui talk to",
                {v1: `name ${dialogues["suspicious man"].getName(context)}`},
                {capitalise: true});
        },
        textlines: {
            "hello": new Textline({ 
                name: "sus hello",
                text: "sus hello answ",
                rewards: {
                    locations: [{location: "Fight off the assailant"}],
                },
                locks_lines: ["hello"],
            }), 
            "defeated": new Textline({ 
                name: "sus defeated",
                is_unlocked: false,
                text: "sus defeated answ",
                locks_lines: ["defeated"],
                rewards: {
                    textlines: [
                        {dialogue: "suspicious man", lines: ["behave", "situation"]},
                        {dialogue: "guild clerk", lines: ["asking"]},
                    ],
                    quest_progress: [
                        {quest_id: "Lost memory", task_index: 3},
                    ]
                },
            }), 
            "behave": new Textline({ 
                name: "sus behave",
                is_unlocked: false,
                text: "sus behave answ",
                locks_lines: ["defeated"],
                rewards: {
                    textlines: [{dialogue: "suspicious man", lines: ["situation", "boss"]}],
                },
            }), 
            "boss": new Textline({ 
                name: "sus boss",
                is_unlocked: false,
                text: "sus boss answ",
                locks_lines: ["boss"],
            }), 
            "situation": new Textline({
                name: "sus situation",
                is_unlocked: false,
                text: "sus situation answ",
                locks_lines: ["situation"],
                rewards: {
                    textlines: [{dialogue: "suspicious man", lines: ["gang", "boss"]}],
                },
            }),
            "gang": new Textline({
                name: "sus gang",
                is_unlocked: false,
                text: "sus gang answ",
                locks_lines: ["gang", "behave"],
                rewards: {
                    textlines: [{dialogue: "suspicious man", lines: ["gang", "behave 2"]}],
                    locations: [
                        {location: "Gang hideout"},
                    ],
                    quest_progress: [{quest_id: "Light in the darkness", task_index: 0}],
                },
            }),
            "defeated gang": new Textline({
                name: "sus gang defeated",
                is_unlocked: false,
                text: "sus gang defeated answ",
                locks_lines: ["defeated gang"],
                rewards: {
                    textlines: [{dialogue: "suspicious man", lines: ["tricks", "behave 3" ]}],
                    dialogues: ["old woman of the slums"],
                }
            }),
            "behave 2": new Textline({ 
                name: "sus behave 2",
                is_unlocked: false,
                text: "sus behave 2 answ",
            }),
            "behave 3": new Textline({ 
                name: "sus behave 3",
                is_unlocked: false,
                text: "sus behave 3 answ",
                rewards: {
                    textlines: [{dialogue: "suspicious man", lines: ["tricks"]}],
                    dialogues: ["old woman of the slums"],
                    actions: [{dialogue: "suspicious man", action: "headpat"}],
                }
            }),
            "tricks": new Textline({ 
                name: "sus tricks",
                is_unlocked: false,
                text: "sus tricks answ",
                rewards: {
                    stances: ["defensive"],
                },
                locks_lines: ["tricks"],
            }),
        }, 
        getDescription: ()=>{
            if(dialogues["suspicious man"].textlines["defeated gang"].is_finished) {
                return "sus description 2";
            } else {
                return "sus description 1";
            }
        },
        actions: {
            "headpat": new DialogueAction({
                action_id: "headpat",
                is_unlocked: false,
                repeatable: true,
                starting_text: "sus headpat",
                floating_click_effects: ['(* ^ ω ^)	', '<(￣︶￣)>	', '(*≧ω≦*)	', '(ᗒ⩊ᗕ)', '(= ⩊ =)'],
                description: "",
                action_text: "",
                success_text: "sus headpat answ",
                display_conditions: {
                    flags: ["is_mofu_mofu_enabled"],
                },
                attempt_duration: 0,
                success_chances: [1],
            }),
        }
    });

    dialogues["old woman of the slums"] = new Dialogue({
        name: "old woman of the slums",
        is_unlocked: false,
        textlines: {
            "hello": new Textline({
                name: "old hello",
                text: "old hello answ",
                locks_lines: ["hello"],
                rewards: {
                    textlines: [{dialogue: "old woman of the slums", lines: ["dinner"]}],
                }
            }),
            "dinner": new Textline({
                name: "old dinner",
                is_unlocked: false,
                text: "old dinner answ",
                locks_lines: ["dinner"],
                rewards: {
                    textlines: [{dialogue: "old woman of the slums", lines: ["ingredients"]}],
                }
            }),
            "ingredients": new Textline({
                name: "old ingredients",
                is_unlocked: false,
                text: "old ingredients answ",
                locks_lines: ["ingredients"],
                rewards: {
                    activities: [{location: "Town outskirts", activity: "herbalism"}],
                }
            }),
        },
        getDescription: ()=>{
            if(dialogues["old woman of the slums"].textlines["hello"].is_finished) {
                return "old description 2";
            } else {
                return "old description 1";
            }
        }
    });

    dialogues["farm supervisor"] = new Dialogue({
        name: "farm supervisor",
        textlines: {
            "hello": new Textline({ 
                name: "sup hello",
                text: "sup hello answ",
                rewards: {
                    textlines: [{dialogue: "farm supervisor", lines: ["things", "work", "animals", "fight", "fight0", "anything"]}],
                },
                locks_lines: ["hello"],
            }),
            "work": new Textline({
                name:"sup work",
                is_unlocked: false,
                text: "sup work answ",
                rewards: {
                    activities: [{location: "Town farms", activity: "fieldwork"}],
                },
                locks_lines: ["work"],
            }),
            "anything": new Textline({
                name: "sup anything",
                is_unlocked: false,
                text: "sup anything answ",
                rewards: {
                    actions: [{dialogue: "farm supervisor", action: "bonemeal1"}],
                    quests: ["Bonemeal delivery"],
                },
                locks_lines: ["anything"],
            }),
            "more bonemeal": new Textline({
                name: "sup bonemeal",
                is_unlocked: false,
                text: "sup bonemeal answ",
                rewards: {
                    actions: [{dialogue: "farm supervisor", action: "bonemeal2"}],
                },
                locks_lines: ["more bonemeal"],
            }),
            "animals": new Textline({
                name: "sup animals",
                is_unlocked: false,
                text: "sup animals answ",
                required_flags: {yes: ["is_gathering_unlocked"]},
                rewards: {
                    activities: [{location: "Town farms", activity: "animal care"}],
                },
                locks_lines: ["animals"],
            }),
            "fight0": new Textline({
                name: "sup fight0",
                is_unlocked: false,
                text: "sup fight0 answ",
                required_flags: {no: ["is_strength_proved"]},
                rewards: {
                    quests: ["Ploughs to swords"],
                }
            }),
            "fight": new Textline({
                name: "sup fight",
                is_unlocked: false,
                text: "sup fight answ",
                required_flags: {yes: ["is_strength_proved"]},
                rewards: {
                    actions: [{location: "Forest road", action: "search for boars"}],
                    //locations: [{location: "Forest clearing"}],
                    quests: ["Ploughs to swords"],
                    quest_progress: [{quest_id: "Ploughs to swords", task_index: 0}],
                },
                locks_lines: ["fight"],
            }),
            "things": new Textline({
                is_unlocked: false,
                name: "sup things",
                text: "sup things answ",
                rewards: {
                    textlines: [{dialogue: "farm supervisor", lines: ["animals", "fight", "fight0", "anything"]}],
                }
            }), 
            "defeated boars": new Textline({
                is_unlocked: false,
                name: "sup defeated boars",
                text: "sup defeated boars answ",
                locks_lines: ["defeated boars"],
                rewards: {
                    money: 4000,
                    quest_progress: [{quest_id: "Ploughs to swords", task_index: 1}],
                    textlines: [{dialogue: "farm supervisor", lines: ["troubled", "troubled unavailable"]}],
                }
            }),
            "troubled unavailable": new Textline({
                is_unlocked: false,
                name: "sup troubled unavailable",
                text: "sup troubled unavailable answ",
                locks_lines: ["troubled unavailable"],
                display_conditions: {
                    season: {
                        yes: "Winter",
                    }
                },
            }),
            "troubled": new Textline({
                is_unlocked: false,
                name: "sup troubled",
                text: "sup troubled answ",
                locks_lines: ["troubled", "troubled unavailable"],
                display_conditions: {
                    season: {
                        not: "Winter",
                    }
                },
                rewards: {
                    quest_progress: [{quest_id: "Ploughs to swords", task_index: 2}],
                    actions: [{location: "Town farms", action: "dig for ants 1"}],
                }
            }),
            "eliminated ants": new Textline({
                is_unlocked: false,
                name: "sup eliminated",
                text: "sup eliminated answ",
                locks_lines: ["eliminated ants"],
                rewards: {
                    quest_progress: [{quest_id: "Ploughs to swords", task_index: 3}],
                    //other rewards are from quest itself
                }
            }),
        },
        actions: {
            "bonemeal1": new DialogueAction({
                action_id: "bonemeal1",
                starting_text: "sup deliver",
                description: "",
                action_text: "",
                success_text: "sup deliver answ",
                failure_texts: {
                    unable_to_begin: ["sup deliver not"],
                },
                required: {
                    items_by_id: {"Bonemeal": {count: 50, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    quest_progress: [
                        {
                            quest_id: "Bonemeal delivery",
                            task_index: 0
                        }
                    ], 
                    textlines: [{dialogue: "farm supervisor", lines: ["more bonemeal"]}],
                },
            }),
            "bonemeal2": new DialogueAction({
                action_id: "bonemeal2",
                starting_text: "sup deliver 2",
                description: "",
                action_text: "",
                success_text: "sup deliver 2 answ",
                repeatable: true,
                failure_texts: {
                    unable_to_begin: ["sup deliver 2 not"],
                },
                required: {
                    items_by_id: {"Bonemeal": {count: 50, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    money: 2500,
                },
            }),
        },
        description: "sup description",
    });

    dialogues["nekomimi proprietress"] = new Dialogue({
        name: "proprietress",
        is_unlocked: true,
        description: "nekomimi proprietress description",
        textlines: {
            "hi": new Textline({
                name: "proprietress hi",
                text: "proprietress hi answ",
                is_unlocked: true,
                rewards: {
                    textlines: [{dialogue: "nekomimi proprietress", lines: ["offer"]}],
                },
                locks_lines: ["hi"],
            }),
            "offer": new Textline({
                name: "proprietress offer",
                text: "proprietress offer answ",
                rewards: {
                    textlines: [{dialogue: "nekomimi proprietress", lines: ["special", "puns"]}],
                    //todo: unlock trade
                },
                locks_lines: ["offer"],
            }),
            "special": new Textline({
                name: "proprietress special",
                text: "proprietress special answ",
                rewards: {
                    //todo: unlock paid action
                },
                locks_lines: ["special"],
            }),
            "puns": new Textline({
                name: "proprietress puns",
                text: "proprietress puns answ",
                locks_lines: ["puns"],
            }),
        }

    });

    dialogues["swampland chief"] = new Dialogue({
        //lizard like everyone in triber, aggressive and proud
        name: "swampland chief",
        textlines: {
            "swampchief meet": new Textline({
                name: "swampchief meet",
                text: "swampchief meet answ",
                is_unlocked: true,
                rewards: {
                    textlines: [{dialogue: "swampland chief", lines: ["swampchief explain"]}],
                },
                locks_lines: ["swampchief meet"],
            }),
            "swampchief explain": new Textline({
                name: "swampchief explain",
                text: "swampchief explain answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland chief", lines: ["swampchief help"]}],
                },
                locks_lines: ["swampchief explain"],
            }),
            "swampchief help": new Textline({
                name: "swampchief help",
                text: "swampchief help answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland chief", lines: ["swampchief mid help"]}],
                    dialogues: ["swampland cook"],
                    quest_progress: [{quest_id: "In Times of Need", task_index: 0}],
                },
                locks_lines: ["swampchief help"],
            }),
            "swampchief mid help": new Textline({
                name: "swampchief mid help",
                text: "swampchief mid help answ",
                is_unlocked: false,
            }),
            "swampchief report": new Textline({
                name: "swampchief report",
                text: "swampchief report answ",
                is_unlocked: false,
                display_conditions: {
                    reputation: {Village: 50},
                }, 
                rewards: {
                    textlines: [{dialogue: "swampland chief", lines: ["swampchief confirm"]}],
                },
                locks_lines: ["swampchief report","swampchief mid help"],
            }),
            "swampchief confirm": new Textline({
                name: "swampchief confirm",
                text: "swampchief confirm answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland chief", lines: ["swampchief accept"]}],
                },
                locks_lines: ["swampchief confirm"],
            }),
            "swampchief accept": new Textline({
                name: "swampchief accept",
                text: "swampchief accept answ",
                is_unlocked: false,
                rewards: {
                    quest_progress: [{quest_id: "In Times of Need", task_index: 10}],   //finishes the quest
                    textlines: [{dialogue: "swampland chief", lines: ["swampchief generic"]}],
                    locations: [{location: "Longhouse"}],
                    items: ["Snake fang ring"],
                    traders: [{trader: "swampland trader 2"}],
                    crafting: ["Swampland tribe"],
                    locks: {
                        traders: ["swampland trader"],
                    }
                },
                locks_lines: ["swampchief accept"],
            }),
            /*
                P-10 region 2. This finishes the sentence he breaks off in
                "swampchief confirm answ" - "I should know. I'm reminded every time
                I..." - and finishes nothing else. The banished half stays where
                STORY.md puts it: open.
            */
            "swampchief plains": new Textline({
                name: "swampchief plains",
                text: "swampchief plains answ",
                is_unlocked: false,
                rewards: {
                    xp: 3000,
                    quest_progress: [{quest_id: "No Snakes Go to the Plains", task_index: 3}],
                },
                locks_lines: ["swampchief plains"],
            }),
            "swampchief generic": new Textline({
                name: "swampchief generic",
                text: "swampchief generic answ",
                is_unlocked: false,
            }),
        },
        getDescription: ()=>{
            if(dialogues["swampland chief"].textlines["swampchief confirm"].is_finished) {
                return "swampchief description 3";
            } else if (dialogues["swampland chief"].textlines["swampchief help"].is_finished) {
                return "swampchief description 2";
            } else {
                return "swampchief description 1";
            }}
        });
    dialogues["swampland cook"] = new Dialogue({
        //lizard, an outlander to the tribe. Slips foreign terms in dialogue. Speaks in odd, short sentences ending with exclamation marks
        name: "swampland cook",
        is_unlocked: false,
        textlines: {
            "swampcook greeting1": new Textline({
                name: "swampcook greeting1",
                text: "swampcook greeting1 answ",
                is_unlocked: true,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook greeting2", "swampcook obaru"]},
                ]
            },
                locks_lines: ["swampcook greeting1"],
            }),
            "swampcook greeting2": new Textline({
                name: "swampcook greeting2",
                text: "swampcook greeting2 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook help"]}]
                },
                locks_lines: ["swampcook greeting2"],
            }),
            "swampcook help": new Textline({
                name: "swampcook help",
                text: "swampcook help answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook sosso"]},
                    ],
                    actions: [
                        {dialogue: "swampland cook", action: "swampcook deliver"}
                    ],
                    quest_progress: [{quest_id: "In Times of Need", task_index: 1}],
                },
                locks_lines: ["swampcook help"],
            }),
            "swampcook know": new Textline({
                name: "swampcook know",
                text: "swampcook know answ",
                is_unlocked: false,
                rewards: {
                    textlines:[
                        {dialogue: "swampland cook", lines: ["swampcook yeslore", "swampcook nolore"]},
                    ]
                },
                locks_lines: ["swampcook know"],
            }),
            "swampcook yeslore": new Textline({
                name: "swampcook yeslore",
                text: "swampcook yeslore answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook history", "swampcook surround", "swampcook chief", "swampcook people"]},
                    ],
                    recipes: [
                        {category: "cooking", subcategory: "items", recipe_id: "Alligator jerky"},
                        {category: "cooking", subcategory: "items", recipe_id: "Turtle jerky"},
                        {category: "cooking", subcategory: "items", recipe_id: "Snake jerky"},
                        {category: "cooking", subcategory: "items", recipe_id: "Swampland skewer"},
                    ],
                },
                locks_lines: ["swampcook yeslore", "swampcook nolore"],
            }),
            "swampcook history": new Textline({
                name: "swampcook history",
                text: "swampcook history answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook history1", "swampcook historyend"]},
                    ]
                },
                locks_lines: ["swampcook history"],
            }),
            "swampcook history1": new Textline({
                name: "swampcook history1",
                text: "swampcook history1 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook history2"]}
                    ]
                },
                locks_lines: ["swampcook history1"],
            }),
            "swampcook history2": new Textline({
                name: "swampcook history2",
                text: "swampcook history2 answ",
                is_unlocked: false,
                rewards: {textlines: [
                    {dialogue: "swampland cook", lines: ["swampcook history3"]}
                ]
            },
                locks_lines: ["swampcook history2"],
            }),
            "swampcook history3": new Textline({
                name: "swampcook history3",
                text: "swampcook history3 answ",
                is_unlocked: false,
                locks_lines: ["swampcook history3"],
            }),
            "swampcook historyend": new Textline({
                name: "swampcook historyend",
                text: "swampcook historyend answ",
                is_unlocked: false,
                locks_lines: ["swampcook history1", "swampcook history2", "swampcook history3", "swampcook historyend"],
            }),
            "swampcook surround": new Textline({
                name: "swampcook surround",
                text: "swampcook surround answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook surround1", "swampcook surround2", "swampcook surround3", "swampcook surround4", "swampcook surroundend"]},
                    ]
                },
                locks_lines: ["swampcook surround"],
            }),
            "swampcook surround1": new Textline({
                name: "swampcook surround1",
                text: "swampcook surround1 answ",
                is_unlocked: false,
                locks_lines: ["swampcook surround1"],
            }),
            "swampcook surround2": new Textline({
                name: "swampcook surround2",
                text: "swampcook surround2 answ",
                is_unlocked: false,
                //Being told where the plains are is what opens them, as with the
                //wet woods. He gives directions; he does not come along.
                rewards: {
                    locations: [{location: "The plains"}],
                    quests: ["No Snakes Go to the Plains"],
                    quest_progress: [{quest_id: "No Snakes Go to the Plains", task_index: 0}],
                },
                locks_lines: ["swampcook surround2"],
            }),
            "swampcook surround3": new Textline({
                name: "swampcook surround3",
                text: "swampcook surround3 answ",
                is_unlocked: false,
                //Being told where the wet woods are is what opens them.
                rewards: {
                    locations: [{location: "Wet woods"}],
                    quests: ["Where We Gathered"],
                    quest_progress: [{quest_id: "Where We Gathered", task_index: 0}],
                },
                locks_lines: ["swampcook surround3"],
            }),
            "swampcook surround4": new Textline({
                name: "swampcook surround4",
                text: "swampcook surround4 answ",
                is_unlocked: false,
                locks_lines: ["swampcook surround4"],
            }),
            /*
                P-10 region 1. He named the wet woods in his geography lesson and
                said what they were for; this is the only line in that set that
                gets an answer.
            */
            "swampcook woods": new Textline({
                name: "swampcook woods",
                text: "swampcook woods answ",
                is_unlocked: false,
                rewards: {
                    //No reputation: nothing in the game grants or consumes a Swamp
                    //reputation, so a grant here would be a reward that looks like
                    //something and does nothing. The gathering ground IS the reward.
                    xp: 2000,
                    quest_progress: [{quest_id: "Where We Gathered", task_index: 2}],
                },
                locks_lines: ["swampcook woods"],
            }),
            "swampcook surroundend": new Textline({
                name: "swampcook surroundend",
                text: "swampcook surroundend answ",
                is_unlocked: false,
                locks_lines: ["swampcook surround1", "swampcook surround2", "swampcook surround3", "swampcook surround4", "swampcook surroundend"],
            }),
            "swampcook chief": new Textline({
                name: "swampcook chief",
                text: "swampcook chief answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook chief1", "swampcook chiefend"]},
                    ]
                },
                locks_lines: ["swampcook chief"],
            }),
            "swampcook chief1": new Textline({
                name: "swampcook chief1",
                text: "swampcook chief1 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook chief2"]}]
                },
                locks_lines: ["swampcook chief1"],
            }),
            "swampcook chief2": new Textline({
                name: "swampcook chief2",
                text: "swampcook chief2 answ",
                is_unlocked: false,
                rewards: {
                        textlines: [{dialogue: "swampland cook", lines: ["swampcook chief3"]}]
                },
                locks_lines: ["swampcook chief2"],
            }),
            "swampcook chief3": new Textline({
                name: "swampcook chief3",
                text: "swampcook chief3 answ",
                is_unlocked: false,
                locks_lines: ["swampcook chief3"],
            }),
            "swampcook chiefend": new Textline({
                name: "swampcook chiefend",
                text: "swampcook chiefend answ",
                is_unlocked: false,
                locks_lines: ["swampcook chief1", "swampcook chief2", "swampcook chief3", "swampcook chiefend"],
            }),
            "swampcook people": new Textline({
                name: "swampcook people",
                text: "swampcook people answ",
                is_unlocked: false,
                rewards: {textlines: [
                    {dialogue: "swampland cook", lines: ["swampcook cook","swampcook trader", "swampcook fangs"]},
                ]
            },
                locks_lines: ["swampcook people"],
            }),
            "swampcook cook": new Textline({
                name: "swampcook cook",
                text: "swampcook cook answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook cook2"]}]
                },
                locks_lines: ["swampcook cook"],
            }),
            "swampcook cook2": new Textline({
                name: "swampcook cook2",
                text: "swampcook cook2 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook zalgo"]}]
                },
                locks_lines: ["swampcook cook2"],
            }),
            "swampcook trader": new Textline({
                name: "swampcook trader",
                text: "swampcook trader answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook trader1", "swampcook traderend"]},
                    ]
                },
                locks_lines: ["swampcook trader"],
            }),
            "swampcook trader1": new Textline({
                name: "swampcook trader1",
                text: "swampcook trader1 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook trader2"]}]
                },
                locks_lines: ["swampcook trader1"],
            }),
            "swampcook trader2": new Textline({
                name: "swampcook trader2",
                text: "swampcook trader2 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook trader3"]}]
                },
                locks_lines: ["swampcook trader2"],
            }),
            "swampcook trader3": new Textline({
                name: "swampcook trader3",
                text: "swampcook trader3 answ",
                is_unlocked: false,
                locks_lines: ["swampcook trader3"],
            }),
            "swampcook traderend": new Textline({
                name: "swampcook traderend",
                text: "swampcook traderend answ",
                is_unlocked: false,
                locks_lines: ["swampcook trader1", "swampcook trader2", "swampcook trader3", "swampcook traderend"],
            }),
            "swampcook fangs": new Textline({
                name: "swampcook fangs",
                text: "swampcook fangs answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook tailor", "swampcook tanner", "swampcook peopleend"]},
                    ]
                },
                locks_lines: ["swampcook fangs"],
            }),
            "swampcook tailor": new Textline({
                name: "swampcook tailor",
                text: "swampcook tailor answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook tailor1", "swampcook tailorend"]},
                    ],
                },
                locks_lines: ["swampcook tailor"],
            }),
            "swampcook tailor1": new Textline({
                name: "swampcook tailor1",
                text: "swampcook tailor1 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook tailor2"]}],
                },
                locks_lines: ["swampcook tailor1"],
            }),
            "swampcook tailor2": new Textline({
                name: "swampcook tailor2",
                text: "swampcook tailor2 answ",
                is_unlocked: false,
                locks_lines: ["swampcook tailor2"],
            }),
            "swampcook tailorend": new Textline({
                name: "swampcook tailorend",
                text: "swampcook tailorend answ",
                is_unlocked: false,
                locks_lines: ["swampcook tailor1", "swampcook tailor2", "swampcook tailorend"],
            }),
            "swampcook tanner": new Textline({
                name: "swampcook tanner",
                text: "swampcook tanner answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook tanner1", "swampcook tannerend"]},
                    ]
                },
                locks_lines: ["swampcook tanner"],
            }),
            "swampcook tanner1": new Textline({
                name: "swampcook tanner1",
                text: "swampcook tanner1 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook tanner2"]}]
                },
                locks_lines: ["swampcook tanner1"],
            }),
            "swampcook tanner2": new Textline({
                name: "swampcook tanner2",
                text: "swampcook tanner2 answ",
                is_unlocked: false,
                locks_lines: ["swampcook tanner2"],
            }),
            "swampcook tannerend": new Textline({
                name: "swampcook tannerend",
                text: "swampcook tannerend answ",
                is_unlocked: false,
                locks_lines: ["swampcook tanner1", "swampcook tanner2", "swampcook tannerend"],
            }),
            "swampcook peopleend": new Textline({
                name: "swampcook peopleend",
                text: "swampcook peopleend answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook whycrab", "swampcook tumana"]},
                    ], 
                    dialogues: ["swampland tailor"],
                    quest_progress: [{quest_id: "In Times of Need", task_index: 3}],
                },
                locks_lines: ["swampcook history", "swampcook history1", "swampcook history2", "swampcook history3", "swampcook historyend", "swampcook surround",  "swampcook surround1", "swampcook surround2", "swampcook surround3", "swampcook surround4", "swampcook surroundend", "swampcook chief", "swampcook chief1", "swampcook chief2", "swampcook chief3", "swampcook chiefend", "swampcook people", "swampcook cook", "swampcook cook2", "swampcook trader", "swampcook trader1", "swampcook trader2", "swampcook trader3", "swampcook traderend", "swampcook tailor",  "swampcook tailor1", "swampcook tailor2", "swampcook tailorend", "swampcook tanner", "swampcook tanner1", "swampcook tanner2", "swampcook tannerend", "swampcook peopleend"], //should close all previous dialogue trees
            }),
            "swampcook whycrab": new Textline({
                name: "swampcook whycrab",
                text: "swampcook whycrab answ",
                is_unlocked: false,
                rewards: {textlines: [
                    {dialogue: "swampland cook", lines: ["swampcook whycrabpress", "swampcook whycrabdrop"]},
                ]
            },
                locks_lines: ["swampcook whycrab"],
            }),
            "swampcook whycrabpress": new Textline({
                name: "swampcook whycrabpress",
                text: "swampcook whycrabpress answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook liked"]}]
                },
                locks_lines: ["swampcook whycrabpress", "swampcook whycrabdrop"],
            }),
            "swampcook whycrabdrop": new Textline({
                name: "swampcook whycrabdrop",
                text: "swampcook whycrabdrop answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland cook", lines: ["swampcook liked"]}]
                },
                locks_lines: ["swampcook whycrabpress", "swampcook whycrabdrop"],
            }),
            "swampcook nolore": new Textline({
                name: "swampcook nolore",
                text: "swampcook nolore answ",
                is_unlocked: false,
                rewards: {
                    textlines:[
                        {dialogue: "swampland cook", lines: ["swampcook liked", "swampcook tumana", "swampcook noloreteach"]},
                    ],
                    dialogues: ["swampland tailor"],
                    quest_progress: [{quest_id: "In Times of Need", task_index: 3}],
                },
                locks_lines: ["swampcook yeslore", "swampcook nolore"]
            }),
            "swampcook liked": new Textline({
                name: "swampcook liked",
                text: "swampcook liked answ",
                is_unlocked: false,
                rewards: {textlines: [{dialogue: "swampland cook", lines: ["swampcook menaka"]}]
            },
            }),
            "swampcook noloreteach": new Textline({
                name: "swampcook noloreteach",
                text: "swampcook noloreteach answ",
                is_unlocked: false,
                rewards: {
                    recipes: [
                        {category: "cooking", subcategory: "items", recipe_id: "Alligator jerky"},
                        {category: "cooking", subcategory: "items", recipe_id: "Turtle jerky"},
                        {category: "cooking", subcategory: "items", recipe_id: "Snake jerky"},
                        {category: "cooking", subcategory: "items", recipe_id: "Swampland skewer"},
                    ],
                },  
                locks_lines: ["swampcook noloreteach"],
            }),
            "swampcook obaru": new Textline({
                name: "swampcook obaru",
                text: "swampcook obaru answ",
                is_unlocked: false,
                locks_lines: ["swampcook obaru"],
            }),
            "swampcook kazoku": new Textline({
                name: "swampcook kazoku",
                text: "swampcook kazoku answ",
                is_unlocked: false,
                locks_lines: ["swampcook kazoku"],
            }),
            "swampcook sosso": new Textline({
                name: "swampcook sosso",
                text: "swampcook sosso answ",
                is_unlocked: false,
                locks_lines: ["swampcook sosso"],
            }),
            "swampcook zalgo": new Textline({
                name: "swampcook zalgo",
                text: "swampcook zalgo answ",
                is_unlocked: false,
                locks_lines: ["swampcook zalgo"],
            }),
            "swampcook menaka": new Textline({
                name: "swampcook menaka",
                text: "swampcook menaka answ",
                is_unlocked: false,
            }),
            "swampcook tumana": new Textline({
                name: "swampcook tumana",
                text: "swampcook tumana answ",
                is_unlocked: false,
                locks_lines: ["swampcook tumana"],
            }),
        },
        actions: {
            "swampcook deliver": new DialogueAction({
                action_id: "swampcook deliver",
                starting_text: "swampcook deliver",
                description: "",
                action_text: "",
                success_text: "swampcook deliver answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["swampcook deliver not"],
                },
                required: {
                    items_by_id: {"Crab meat": {count: 60, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    quest_progress: [{quest_id: "In Times of Need", task_index: 2}],
                    textlines: [
                        {dialogue: "swampland cook", lines: ["swampcook know", "swampcook kazoku"]},
                    ],
                    locks: {
                        textlines: {"swampland chief": ["swampchief mid help"]},
                    }
                },
                locks_lines: ["swampcook deliver", "swampcook obaru"],
            }),
        },
        getDescription: ()=>{
            if(dialogues["swampland cook"].actions["swampcook deliver"].is_finished) {
                return "swampcook description 3";
            } else if (dialogues["swampland cook"].textlines["swampcook help"].is_finished) {
                return "swampcook description 2";
            } else {
                return "swampcook description 1";
            }}
        });
    dialogues["swampland tailor"] = new Dialogue({
        //lizard, speaks in verbose diatribes
        name: "swampland tailor",
        is_unlocked: false,
        textlines: {
            "swamptailor interrupt": new Textline({ // moves forward
                name: "swamptailor interrupt",
                text: "swamptailor interrupt answ",
                is_unlocked: true,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor cookword"]}],
                },
                locks_lines: ["swamptailor interrupt", "swamptailor listen1", "swamptailor listen2", "swamptailor listen3", "swamptailor listen4", "swamptailor listen5", "swamptailor listen6", "swamptailor listen7", "swamptailor listen8"],
            }),
            "swamptailor listen1": new Textline({
                name: "swamptailor listen1",
                text: "swamptailor listen1 answ",
                is_unlocked: true,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor listen2"]}],
                },
                locks_lines: ["swamptailor listen1"],
            }),
            "swamptailor listen2": new Textline({
                name: "swamptailor listen2",
                text: "swamptailor listen2 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor listen3"]}],
                },
                locks_lines: ["swamptailor listen2"],
            }),
            "swamptailor listen3": new Textline({
                name: "swamptailor listen3",
                text: "swamptailor listen3 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor listen4"]}],
                },
                locks_lines: ["swamptailor listen3"],
            }),
            "swamptailor listen4": new Textline({
                name: "swamptailor listen4",
                text: "swamptailor listen4 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor listen5"]}],
                },
                locks_lines: ["swamptailor listen4"],
            }),
            "swamptailor listen5": new Textline({
                name: "swamptailor listen5",
                text: "swamptailor listen5 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor listen6"]}],
                },
                locks_lines: ["swamptailor listen5"],
            }),
            "swamptailor listen6": new Textline({
                name: "swamptailor listen6",
                text: "swamptailor listen6 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor listen7"]}],
                },
                locks_lines: ["swamptailor listen6"],
            }),
            "swamptailor listen7": new Textline({
                name: "swamptailor listen7",
                text: "swamptailor listen7 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor listen8"]}],
                },
                locks_lines: ["swamptailor listen7"],
            }),
            "swamptailor listen8": new Textline({
                name: "swamptailor listen8",
                text: "swamptailor listen8 answ",
                is_unlocked: false,
                locks_lines: ["swamptailor listen8"],
            }),
            "swamptailor cookword": new Textline({
                name: "swamptailor cookword",
                text: "swamptailor cookword answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor help"]}],
                },
                locks_lines: ["swamptailor cookword"],
            }),
            "swamptailor help": new Textline({
                name: "swamptailor help",
                text: "swamptailor help answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor flax"]}],
                },
                locks_lines: ["swamptailor help"],
            }),
            "swamptailor flax": new Textline({
                name: "swamptailor flax",
                text: "swamptailor flax answ",
                is_unlocked: false,
                rewards: {
                    actions: [{dialogue: "swampland tailor", action: "swamptailor deliver"}],
                    activities: [{location: "Riverbank", activity: "herbalism"}],
                    quest_progress: [{quest_id: "In Times of Need", task_index: 4}],
                },
                locks_lines: ["swamptailor flax"],
            }),
            "swamptailor liked": new Textline({
                name: "swamptailor liked",
                text: "swamptailor liked answ",
                is_unlocked: false,
            }),
        },
        actions: {
            "swamptailor deliver": new DialogueAction({
                action_id: "swamptailor deliver",
                starting_text: "swamptailor deliver",
                description: "",
                action_text: "",
                success_text: "swamptailor deliver answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["swamptailor deliver not"],
                },
                required: {
                    items_by_id: {"Flax": {count: 200, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    quest_progress: [{quest_id: "In Times of Need", task_index: 5}], 
                    textlines: [{dialogue: "swampland tailor", lines: ["swamptailor liked"]}],
                    recipes: [{category: "crafting", subcategory: "items", recipe_id: "Linen cloth"}],
                    dialogues: ["swampland tanner"],
                },
            }),
        },
        getDescription: ()=>{
            if(dialogues["swampland tailor"].actions["swamptailor deliver"].is_finished) {
                return "swamptailor description 3";
            } else if (dialogues["swampland tailor"].textlines["swamptailor interrupt"].is_finished) {
                return "swamptailor description 2";
            } else {
                return "swamptailor description 1";
            }}
        });
    dialogues["swampland tanner"] = new Dialogue({
        //lizard, speaks in short sentences
        name: "swampland tanner",
        is_unlocked: false,
        textlines: {
            "swamptanner unknown": new Textline({
                name: "swamptanner unknown",
                text: "swamptanner unknown answ",
                is_unlocked: true,
                rewards: {
                    textlines: [{dialogue: "swampland tanner", lines: ["swamptanner help"]}],
                },
                locks_lines: ["swamptanner unknown"],
            }),
            "swamptanner help": new Textline({
                name: "swamptanner help",
                text: "swamptanner help answ",
                is_unlocked: false,
                rewards: {
                    quest_progress: [{quest_id: "In Times of Need", task_index: 6}], 
                    actions: [{dialogue: "swampland tanner", action: ["swamptanner deliver 1"]}],
                },
                locks_lines: ["swamptanner help"],
            }),
            "swamptanner known": new Textline({
                name: "swamptanner known",
                text: "swamptanner known answ",
                is_unlocked: false,
                rewards: {
                    quest_progress: [{quest_id: "In Times of Need", task_index: 8}], 
                    actions: [{dialogue: "swampland tanner", action: ["swamptanner deliver 2"]}],
                },
                locks_lines: ["swamptanner known"],
            }),
            "swamptanner liked": new Textline({
                name: "swamptanner liked",
                text: "swamptanner liked answ",
                is_unlocked: false,
            }),
        },
        actions: {
            "swamptanner deliver 1": new DialogueAction({
                action_id: "swamptanner deliver 1",
                starting_text: "swamptanner deliver 1",
                description: "",
                action_text: "",
                success_text: "swamptanner deliver 1 answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["swamptanner deliver 1 not"],
                },
                required: {
                    items_by_id: {"Alligator skin": {count: 60, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    quest_progress: [{quest_id: "In Times of Need", task_index: 7}], 
                    textlines: [{dialogue: "swampland tanner", lines: ["swamptanner known"]}],
                },
            }),
            "swamptanner deliver 2": new DialogueAction({
                action_id: "swamptanner deliver 2",
                starting_text: "swamptanner deliver 2",
                description: "",
                action_text: "",
                success_text: "swamptanner deliver 2 answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["swamptanner deliver 2 not"],
                },
                required: {
                    items_by_id: {"Giant snake skin": {count: 60, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    quest_progress: [{quest_id: "In Times of Need", task_index: 9}],
                    textlines: [{dialogue: "swampland tanner", lines: ["swamptanner liked"]}, {dialogue: "swampland chief", lines: ["swampchief report"]}],
                    recipes: [
                        {category: "butchering", subcategory: "items", recipe_id: "Piece of alligator leather"},
                        {category: "butchering", subcategory: "items", recipe_id: "Piece of snakeskin leather"},
                        {category: "butchering", subcategory: "items", recipe_id: "Turtle shellplate"},
                    ],
                    locks: {
                        textlines: {"swampland chief": ["swampchief mid help"]},
                    }
                },
            }),
        },
        getDescription: ()=>{ 
            if(dialogues["swampland tanner"].actions["swamptanner deliver 2"].is_finished) {
                return "swamptanner description 3";
            } else if (dialogues["swampland tanner"].actions["swamptanner deliver 1"].is_finished) {
                return "swamptanner description 2";
            } else {
                return "swamptanner description 1";
            }}
        });

	dialogues["swampland scout"] = new Dialogue({
        //lizard, speaks in rambling run-on sentences with long pauses
        name: "swampland scout",
        textlines: {
            "swampscout meet": new Textline({
                name: "swampscout meet",
                text: "swampscout meet answ",
                is_unlocked: true,
                rewards: {
                    textlines: [{dialogue: "swampland scout", lines: ["swampscout lore1"]}],
                },
                locks_lines: ["swampscout meet"],
            }),
            "swampscout lore1": new Textline({
                name: "swampscout lore1",
                text: "swampscout lore1 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland scout", lines: ["swampscout lore2"]}],
                },
                locks_lines: ["swampscout lore1"],
            }),
            "swampscout lore2": new Textline({
                name: "swampscout lore2",
                text: "swampscout lore2 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland scout", lines: ["swampscout lore3"]}],
                },
                locks_lines: ["swampscout lore2"],
            }),
            "swampscout lore3": new Textline({
                name: "swampscout lore3",
                text: "swampscout lore3 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland scout", lines: ["swampscout lore4"]}],
                },
                locks_lines: ["swampscout lore3"],
            }),
            "swampscout lore4": new Textline({
                name: "swampscout lore4",
                text: "swampscout lore4 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland scout", lines: ["swampscout lore5"]}],
                },
                locks_lines: ["swampscout lore4"],
            }),
            "swampscout lore5": new Textline({
                name: "swampscout lore5",
                text: "swampscout lore5 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland scout", lines: ["swampscout lore6"]}],
                },
                locks_lines: ["swampscout lore5"],
            }),
            "swampscout lore6": new Textline({
                name: "swampscout lore6",
                text: "swampscout lore6 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland scout", lines: ["swampscout lore7"]}],
                },
                locks_lines: ["swampscout lore6"],
            }),
            "swampscout lore7": new Textline({
                name: "swampscout lore7",
                text: "swampscout lore7 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [{dialogue: "swampland scout", lines: ["swampscout lore8"]}],
                },
                locks_lines: ["swampscout lore7"],
            }),
            "swampscout lore8": new Textline({
                name: "swampscout lore8",
                text: "swampscout lore8 answ",
                is_unlocked: false,
                rewards: {
                    textlines: [
                        {dialogue: "swampland scout", lines: ["swampscout generic"]},
                        {dialogue: "swampland scout", lines: ["swampscout foraging"]}
                    ],
                },
                locks_lines: ["swampscout lore8"],
            }),
            "swampscout generic": new Textline({
                name: "swampscout generic",
                text: "swampscout generic answ",
                is_unlocked: false,
                rewards: {
                    actions: [
                        {dialogue: "swampland scout", action: ["swampscout help"]},
                    ],
                },
            }),
            "swampscout foraging": new Textline({
                name: "swampscout foraging",
                text: "swampscout foraging answ",
                is_unlocked: false,
                rewards: {
                    actions: [{location: "Longhouse", action: "learn forage"}],
                },
                locks_lines: ["swampscout foraging"],
            }),
        },
        actions: {
            "swampscout help": new DialogueAction({
                action_id: "swampscout help",
                starting_text: "swampscout help",
                description: "",
                action_text: "",
                success_text: "swampscout help answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["swampscout help not"],
                },
                required: {
                    items_by_id: {"Healing potion": {count: 1, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
            }),
        },
        getDescription: ()=>{
            if(dialogues["swampland scout"].actions["swampscout help"].is_finished) {
                return "swampscout description 4";
            } else if (dialogues["swampland scout"].textlines["swampscout foraging"].is_finished) {
                return "swampscout description 3";
            } else if (dialogues["swampland scout"].textlines["swampscout meet"].is_finished) {
                return "swampscout description 2";
            } else {
                return "swampscout description 1";
            }}
        });

    /*
        QUEST 1 - "The Merchant's Word", and the supplier half of the gate.

        He stands outside the wall on purpose. A supplier does not need to be let
        in to sell; he needs to be worth letting in, which is the difference the
        gate guard's own line is about - citizenship or membership, and nothing
        else.

        Three deliveries, and all three are goods only the swamp can produce:
        linen from tribe flax, alligator leather from the tanner's recipe, jerky
        from the cook's. Nobody who has not been past the falls can bring him any
        of it, which is why the membership is worth writing.
    */
    /*
        P-10 region 3. The harbour's counterpart to the guild factor: the factor
        writes down what comes up the road, and this one writes down what goes out on
        the water. Same trade, opposite direction, and neither of them is paid to
        care what it is.

        He is the answer to quest 4's loose end and he must not close it. What he can
        give is a hull, a tide and a name column somebody left empty. Who paid is not
        in this game yet.
    */
    dialogues["harbour tallyman"] = new Dialogue({
        name: "harbour tallyman",
        is_unlocked: true,
        description: "tallyman description",
        textlines: {
            "tallyman hello": new Textline({
                name: "tallyman hello",
                text: "tallyman hello answ",
                is_unlocked: true,
                unlocks: {
                    textlines: [{dialogue: "harbour tallyman", lines: ["tallyman what leaves"]}],
                },
                locks_lines: ["tallyman hello"],
            }),
            "tallyman what leaves": new Textline({
                name: "tallyman what leaves",
                text: "tallyman what leaves answ",
                is_unlocked: false,
                rewards: {
                    locations: [{location: "The salt house"}],
                    traders: ["bay trader"],
                    quest_progress: [{quest_id: "A Good Place to Leave", task_index: 2}],
                },
                unlocks: {
                    textlines: [{dialogue: "harbour tallyman", lines: ["tallyman that night"]}],
                },
                locks_lines: ["tallyman what leaves"],
            }),
            "tallyman that night": new Textline({
                name: "tallyman that night",
                text: "tallyman that night answ",
                is_unlocked: false,
                //The book is not handed over. It is pointed at, which is what turns
                //the region's answer into an action the player has to be good enough
                //to perform.
                rewards: {
                    actions: [{location: "The bay", action: "read the departures"}],
                },
                locks_lines: ["tallyman that night"],
            }),
            "tallyman after": new Textline({
                name: "tallyman after",
                text: "tallyman after answ",
                is_unlocked: false,
            }),
        }
    });

    dialogues["guild factor"] = new Dialogue({
        name: "guild factor",
        is_unlocked: true,
        description: "factor description",
        textlines: {
            "hello": new Textline({
                name: "factor hello",
                text: "factor hello answ",
                rewards: {
                    textlines: [{dialogue: "guild factor", lines: ["buying"]}],
                },
                locks_lines: ["hello"],
            }),
            "buying": new Textline({
                name: "factor buying",
                is_unlocked: false,
                text: "factor buying answ",
                rewards: {
                    quests: ["The Merchant's Word"],
                    quest_progress: [{quest_id: "The Merchant's Word", task_index: 0}],
                    actions: [{dialogue: "guild factor", action: "deliver linen"}],
                },
                locks_lines: ["buying"],
            }),
            //Asked after the third delivery. The note is the second key the gate
            //guard names, and the only one the hero can earn from outside.
            /*
                P-10 region 3. He records arrivals for a living, so asking him what
                goes the other way is the one question he has never been paid to
                answer - and he answers it the way he answers everything, by telling
                you what it was worth.

                He gives the road, not the destination. The road is a Combat_zone and
                clearing it is what puts the bay on the map.
            */
            "road north": new Textline({
                name: "factor road north",
                text: "factor road north answ",
                is_unlocked: false,
                rewards: {
                    locations: [{location: "Coast road"}],
                    quests: ["A Good Place to Leave"],
                    quest_progress: [{quest_id: "A Good Place to Leave", task_index: 0}],
                },
                locks_lines: ["road north"],
            }),
            "note": new Textline({
                name: "factor note",
                is_unlocked: false,
                text: "factor note answ",
                rewards: {
                    reputation: {Town: 30},
                    quest_progress: [{quest_id: "The Merchant's Word", task_index: 4}],
                    textlines: [{dialogue: "gate guard", lines: ["supplier"]}],
                },
                locks_lines: ["note"],
            }),
        },
        actions: {
            "deliver linen": new DialogueAction({
                action_id: "deliver linen",
                is_unlocked: false,
                starting_text: "factor linen",
                description: "",
                action_text: "",
                success_text: "factor linen answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["factor linen not"],
                },
                required: {
                    items_by_id: {"Linen cloth": {count: 20, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    money: 6000,
                    quest_progress: [{quest_id: "The Merchant's Word", task_index: 1}],
                    actions: [{dialogue: "guild factor", action: "deliver leather"}],
                },
                locks_lines: ["deliver linen"],
            }),
            "deliver leather": new DialogueAction({
                action_id: "deliver leather",
                is_unlocked: false,
                starting_text: "factor leather",
                description: "",
                action_text: "",
                success_text: "factor leather answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["factor leather not"],
                },
                required: {
                    items_by_id: {"Piece of alligator leather": {count: 20, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    money: 9000,
                    quest_progress: [{quest_id: "The Merchant's Word", task_index: 2}],
                    actions: [{dialogue: "guild factor", action: "deliver jerky"}],
                },
                locks_lines: ["deliver leather"],
            }),
            "deliver jerky": new DialogueAction({
                action_id: "deliver jerky",
                is_unlocked: false,
                starting_text: "factor jerky",
                description: "",
                action_text: "",
                success_text: "factor jerky answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["factor jerky not"],
                },
                required: {
                    items_by_id: {"Alligator jerky": {count: 30, remove_on_success: true}},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    money: 12000,
                    quest_progress: [{quest_id: "The Merchant's Word", task_index: 3}],
                    textlines: [{dialogue: "guild factor", lines: ["note"]}],
                },
                locks_lines: ["deliver jerky"],
            }),
        },
    });

    /*
        QUEST 3 - "Somewhere in the Town".

        Both of these sit in rooms that were authored and then left empty. The
        clerk finds the name; the broker is the ex-boss the robber names in
        "sus defeated answ", and he is a broker rather than a gang leader because
        the line says "ex-boss" and means it.

        What he gives up: the job was paid, the contract named one object, and
        everything else went to the collector. What he does not give up, because
        canon keeps it open: who paid.
    */
    dialogues["guild clerk"] = new Dialogue({
        name: "guild clerk",
        is_unlocked: true,
        description: "clerk description",
        textlines: {
            "hello": new Textline({
                name: "clerk hello",
                text: "clerk hello answ",
                rewards: {
                    textlines: [{dialogue: "guild clerk", lines: ["board"]}],
                },
                locks_lines: ["hello"],
            }),
            "board": new Textline({
                name: "clerk board",
                is_unlocked: false,
                text: "clerk board answ",
                locks_lines: ["board"],
            }),
            //Unlocked by the robber's confession, which happens long before the
            //town is reachable. The line simply waits here until the player
            //arrives, which is why it needs no flag of its own.
            "asking": new Textline({
                name: "clerk asking",
                is_unlocked: false,
                text: "clerk asking answ",
                rewards: {
                    quests: ["Somewhere in the Town"],
                    quest_progress: [{quest_id: "Somewhere in the Town", task_index: 0}],
                    textlines: [{dialogue: "square broker", lines: ["confront"]}],
                },
                locks_lines: ["asking"],
            }),
        },
    });

    dialogues["square broker"] = new Dialogue({
        name: "square broker",
        is_unlocked: true,
        description: "broker description",
        textlines: {
            "hello": new Textline({
                name: "broker hello",
                text: "broker hello answ",
                locks_lines: ["hello"],
            }),
            "confront": new Textline({
                name: "broker confront",
                is_unlocked: false,
                text: "broker confront answ",
                rewards: {
                    quest_progress: [{quest_id: "Somewhere in the Town", task_index: 1}],
                    textlines: [{dialogue: "square broker", lines: ["who", "object", "rest"]}],
                },
                locks_lines: ["confront"],
            }),
            "who": new Textline({
                name: "broker who",
                is_unlocked: false,
                text: "broker who answ",
                locks_lines: ["who"],
            }),
            "object": new Textline({
                name: "broker object",
                is_unlocked: false,
                text: "broker object answ",
                locks_lines: ["object"],
            }),
            "rest": new Textline({
                name: "broker rest",
                is_unlocked: false,
                text: "broker rest answ",
                rewards: {
                    xp: 1200,
                    reputation: {Town: 40},
                    quest_progress: [{quest_id: "Somewhere in the Town", task_index: 2}],
                    textlines: [{dialogue: "antique collector", lines: ["mine"]}],
                },
                locks_lines: ["rest"],
            }),
        },
    });

    /*
        QUEST 4 - "Nothing but Pants".

        He does not sell. That is not a puzzle to be solved with a bigger number:
        the Antique store's description has called the collection "apparently not
        for sale" since long before this fork, so the way in has to be something
        other than money. It is provenance. An object with no story is furniture,
        and the hero IS the story of this one.

        Money is what it costs once he knows that, and it is the first thing in the
        game that takes money rather than giving it - see the money requirement in
        src/conditions.js, which had never been used and did not work.
    */
    dialogues["antique collector"] = new Dialogue({
        name: "antique collector",
        is_unlocked: true,
        description: "collector description",
        textlines: {
            "hello": new Textline({
                name: "collector hello",
                text: "collector hello answ",
                locks_lines: ["hello"],
            }),
            //Unlocked by the broker naming him, at the end of quest 3.
            "mine": new Textline({
                name: "collector mine",
                is_unlocked: false,
                text: "collector mine answ",
                rewards: {
                    quests: ["Nothing but Pants"],
                    quest_progress: [{quest_id: "Nothing but Pants", task_index: 0}],
                    textlines: [{dialogue: "antique collector", lines: ["price"]}],
                    actions: [{dialogue: "antique collector", action: "buy back the tally"}],
                },
                locks_lines: ["mine"],
            }),
            "price": new Textline({
                name: "collector price",
                is_unlocked: false,
                text: "collector price answ",
                locks_lines: ["price"],
            }),
            "other": new Textline({
                name: "collector other",
                is_unlocked: false,
                text: "collector other answ",
                //P-10 region 3 opens here. This is the only line in the game that
                //says the second piece left, and the factor is the only person whose
                //job is the road it left on.
                rewards: {
                    xp: 1500,
                    reputation: {Town: 60},
                    quest_progress: [{quest_id: "Nothing but Pants", task_index: 2}],
                    textlines: [{dialogue: "guild factor", lines: ["road north"]}],
                },
                locks_lines: ["other"],
            }),
        },
        actions: {
            "buy back the tally": new DialogueAction({
                action_id: "buy back the tally",
                is_unlocked: false,
                starting_text: "collector buy",
                description: "",
                action_text: "",
                success_text: "collector buy answ",
                repeatable: false,
                failure_texts: {
                    unable_to_begin: ["collector buy not"],
                },
                //The game's first money sink. remove_on_success rather than
                //`remove`, because that is the flag `required` uses.
                required: {
                    money: {number: 30000, remove_on_success: true},
                },
                attempt_duration: 0,
                success_chances: [1],
                rewards: {
                    items: ["Traveller's tally"],
                    quest_progress: [{quest_id: "Nothing but Pants", task_index: 1}],
                    textlines: [{dialogue: "antique collector", lines: ["other"]}],
                },
                locks_lines: ["buy back the tally"],
            }),
        },
    });

    /*
        Reclaimed. This was written before the localisation layer existed, so its
        text sat inline; it is behind ids now like everything else.

        Three link errors were repaired on the way in, all of them copy-paste:
        "what" unlocked "walls", which left "who" unreachable by anything;
        "walls" unlocked ITSELF and locked "monsters" instead of itself; and
        "kill" unlocked "walls" again. The tree is now
        hello -> what -> who -> monsters -> {walls, kill, mind}, each terminal.

        His register is the tribe's, not a mistake: "be" for everything, no
        articles, papa for the Rat God. Kept verbatim in English. The Turkish uses
        the same slip the swamp cast already uses - third-person agreement where
        first or second is required.
    */
    dialogues["cute little rat"] = new Dialogue({
        name: "cute little rat",
        is_unlocked: true,
        description: "rat description",
        textlines: {
            "hello": new Textline({
                name: "rat hello",
                text: "rat hello answ",
                rewards: {
                    textlines: [{dialogue: "cute little rat", lines: ["what"]}],
                },
                locks_lines: ["hello"],
            }),
            "what": new Textline({
                name: "rat what",
                is_unlocked: false,
                text: "rat what answ",
                rewards: {
                    textlines: [{dialogue: "cute little rat", lines: ["who"]}],
                },
                locks_lines: ["what"],
            }),
            "who": new Textline({
                name: "rat who",
                is_unlocked: false,
                text: "rat who answ",
                rewards: {
                    textlines: [{dialogue: "cute little rat", lines: ["monsters"]}],
                },
                locks_lines: ["who"],
            }),
            "monsters": new Textline({
                name: "rat monsters",
                is_unlocked: false,
                text: "rat monsters answ",
                rewards: {
                    textlines: [{dialogue: "cute little rat", lines: ["walls", "kill", "mind"]}],
                },
                locks_lines: ["monsters"],
            }),
            "walls": new Textline({
                name: "rat walls",
                is_unlocked: false,
                text: "rat walls answ",
                locks_lines: ["walls"],
            }),
            "mind": new Textline({
                name: "rat mind",
                is_unlocked: false,
                text: "rat mind answ",
                locks_lines: ["mind"],
            }),
            "kill": new Textline({
                name: "rat kill",
                is_unlocked: false,
                text: "rat kill answ",
                locks_lines: ["kill"],
            }),
        },
    });
})();


//setup ids
Object.keys(dialogues).forEach(dialogue_key => {
    const dial = dialogues[dialogue_key];
    dialogues[dialogue_key].id = dialogue_key;
    if(!dialogues[dialogue_key].getName()) {
        dialogues[dialogue_key].name = dialogue_key;
    }

    Object.keys(dial.textlines).forEach(textline_key => {
        const textline = dial.textlines[textline_key];
        if(textline.locks_lines) {
            if(!textline.rewards.locks.textlines[dialogue_key]) {
                textline.rewards.locks.textlines[dialogue_key] = [];
            }
            textline.rewards.locks.textlines[dialogue_key].push(...textline.locks_lines);
        }
    });
});

export {dialogues};