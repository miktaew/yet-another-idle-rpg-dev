"use strict";

import { DialogueComponent } from "../components/dialogue_component.js";
import { Person } from "./person.js";
import AvailabilityComponent from "../components/availability_component.js";
import { availability_havers } from "../data/component_references.js";

class NPC extends Person {

    #dialogue;
    #availability;
    #trader;

    constructor(data) {
        super(data);
        this.tags = {"npc": true};

        if(data.dialogue) {
            this.tags["talkable"] = true;
            this.#dialogue = data.dialogue;
            if(!this.#dialogue.starting_text) {
                this.#dialogue.starting_text = `Talk to ${this.getName()}`;
            }
        } else {
            this.#dialogue = new DialogueComponent({});
        }
        
        if(data.trader) {
            this.tags["trader"] = true;
            this.#trader = data.trader;

            if(!this.#trader.name) {
                this.#trader.name = this.name;
            }
            if(!this.#trader.trade_text) { 
                this.#trader.trade_text = `Trade with ${this.name}`;
            }
        }

        this.description = data.description || this.#dialogue.description;
        this.getDescription = data.getDescription || this.#dialogue.getDescription;
    
        this.unlock_message = this.#dialogue?.unlock_message || this.#trader?.unlock_message;

        this.#availability = new AvailabilityComponent({is_unlocked: data.is_unlocked ?? true});


        //disables xp gains; xp can still be set by passing use_bonus=false to xp adding functions
        this.xp_multiplier = 0;
        this.skill_xp_multiplier = 0;
    }

    refreshTraderInventory(context) {
        this.#trader.refresh(context);
    }

    addToTraderInventory(items){
        this.#trader.addToInventory(items);
    }

    removeFromTraderInventory(items) {
        this.#trader.removeFromInventory(items);
    }

    canBeTradedWith(context) {
        return this.#trader && this.#trader.canBeDisplayed(context);
    }

    getAvailabilityComponent() {
        return this.#availability;
    }

    getDialogueComponent() {
        return this.#dialogue;
    }

    getDialogueAvailability() {
        return this.getDialogueComponent().getAvailabilityComponent();
    }

    getTraderComponent() {
        return this.#trader || {};
    }

    /**
     * 
     * @returns {Object}
     */
    getTraderAvailability() {
        return this.getTraderComponent()?.getAvailabilityComponent?.() || {};
    }

    getTraderAvailabilityStatus() {
        return this.getTraderComponent()?.getAvailabilityComponent?.()?.getStatus() || {};
    }

    getTraderInventory() {
        return this.getTraderComponent()?.getInventoryComponent?.().getItems?.() || {};
    }

    getTextlines() {
        return this.#dialogue.textlines;
    }

    getAvailableTextlines(context) {
        const lines = this.getTextlines();
        const available_lines = {};
        Object.keys(lines).forEach(line_key => {
            if(lines[line_key].canBeDisplayed(context)) {
                available_lines[line_key] = lines[lines];
            }
        });
        return available_lines;
    }

    //specifically GameActions
    getActions() {
        return this.#dialogue.actions;
    }

    //specifically GameActions
    getAvailableActions(context) {
        const actions = this.getTextlines();
        const available_actions = {};
        Object.keys(actions).forEach(action_key => {
            if(actions[action_key].canBeDisplayed(context)) {
                available_actions[action_key] = actions[actions];
            }
        });
        return available_actions;
    }
}

availability_havers.push(NPC);

export default NPC;