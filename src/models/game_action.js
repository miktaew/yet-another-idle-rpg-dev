"use strict";
import AvailabilityComponent from "../components/availability_component.js";
import { availabilities, availability_havers } from "../data/component_references.js";

availabilities["action"] = {};

class GameAction{


    #availability;

    /**
     * 
     * @param {Object} data
     * @param {Object} data.conditions [{stats, skills, [items_by_id: {item_id: {count, remove?}}], money: {number, remove?}}]
     */
    constructor(data){ 
        this.starting_text = data.starting_text; //text on the button to start
        this.action_name = data.action_name || data.starting_text;
        this.action_id = data.action_id;
        this.description = data.description; //description on hover
        this.action_text = data.action_text; //text displayed during action animation
        this.failure_texts = data.failure_texts || {}; //text displayed on failure
        if(!this.failure_texts.conditional_loss) {
            this.failure_texts.conditional_loss = [];
        }
        if(!this.failure_texts.random_loss) {
            this.failure_texts.random_loss = [];
        }
        if(!this.failure_texts.unable_to_begin) {
            this.failure_texts.unable_to_begin = [];
        }
        /*  conditional_loss - conditions are checked at the end and were not met
            random_loss - conditions (at least 1st part) were met, but didn't roll high enough on success chance
            unable_to_begin - .required are not fullfilled
        */
        this.success_text = data.success_text; //text displayed on success
                                          //if action is supposed to be "impossible" for narrative purposes, just make it finish without unlocks and with text that says it failed
        
        this.success_texts = data.success_texts || []; //array; the idea is to use this for getSuccessText if it's not default, so that possible results can still be checked by verifier
        this.getSuccessText = data.getSuccessText || function(){return this.success_text};
        
        this.check_conditions_on_finish = data.check_conditions_on_finish || true;
        //means an action with duration can be attempted even if conditions are not met;
        //setting it to false will check them on start instead
        this.rewards = data.rewards || {}; //{unlocks, money, items,move_to}?
        this.attempt_duration = data.attempt_duration || 0; //0 means instantaneous, otherwise there's a progress bar
        this.success_chances = data.success_chances || [1,1];
        //chances to succeed; to guarantee that multiple attempts will be needed, just make a few consecutive actions with same text
        this.keep_progress = data.keep_progress || false;
        //will make progress persist through leaving the action and through save/load; 
        //should be used only for actions that guarantee success if conditions are met, to not encourage save scumming
        this.accumulated_progress = 0;

        this.unlock_text = data.unlock_text;

        this.completion_count = 0;

        this.#availability = new AvailabilityComponent({...data, repeatable: data.repeatable ?? false});
        availabilities["action"][this.action_id] = this.getAvailabilityComponent();
    }

    getAvailabilityComponent() {
        return this.#availability;
    }

    getCurrentProgress() {
        return this.accumulated_progress;
    }

    setCurrentProgress(progress){
        this.accumulated_progress = progress || this.accumulated_progress;
    }

    getCompletionCount() {
        return this.completion_count;
    }

    setCompletionCount(count) {
        this.completion_count = count || this.completion_count;
    }
}

availability_havers.push(GameAction);

export {GameAction};