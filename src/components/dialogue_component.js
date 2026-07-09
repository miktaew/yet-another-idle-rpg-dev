"use strict";

import { availability_havers } from "../data/component_references.js";
import AvailabilityComponent from "./availability_component.js";

const dialogue_owners = {};

class DialogueComponent {
    
    #availability;

    constructor({
        name,
        getName,
        starting_text,
        getStartingText = function(){return this.starting_text},
        ending_text = "go back",
        is_unlocked,
        textlines = {},
        actions = {},
        description = "",
        getDescription = function(){return this.description},
        location_name
    }){ 
        this.name = name; //functions mostly as an id
        this.getName = getName || function(){return this.name;};
        this.starting_text = starting_text;
        this.getStartingText = getStartingText;
        this.ending_text = ending_text;
        this.#availability = new AvailabilityComponent({is_unlocked: is_unlocked ?? true});
        this.textlines = textlines;
        this.actions = actions;
        this.description = description;
        this.getDescription = getDescription;

        this.location_name = location_name; //this is purely informative and wrong value shouldn't cause any actual issues
    }

    getAvailabilityComponent() {
        return this.#availability;
    }
}

class Textline {

    #availability;

    constructor({
                name,
                text,
                getText,
                is_branch_only = false,
                is_unlocked,
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

        this.#availability = new AvailabilityComponent({is_unlocked: is_unlocked ?? true, display_conditions});
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
    
    getAvailabilityComponent() {
        return this.#availability;
    }
}

availability_havers.push(DialogueComponent, Textline);

export { DialogueComponent, Textline, dialogue_owners };