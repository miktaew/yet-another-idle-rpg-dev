"use strict";
import { process_conditions } from "../conditions.js";
import { language } from "../main.js";
import { translationManager } from "../translation.js";
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
    constructor({
        starting_text,
        action_id,
        action_name,
        description,
        action_text,
        success_text,
        success_texts = [],
        getSuccessText,
        failure_texts = {},
        required = {},
        display_conditions = {},
        conditions = [],
        rewards = {},
        attempt_duration = 0,
        success_chances = [1,1],
        keep_progress = false,
        is_unlocked = false,
        repeatable = false,
        check_conditions_on_finish = true,
        unlock_text,
    }) {
        this.starting_text = starting_text; //text on the button to start
        this.action_name = action_name || starting_text;
        this.action_id = action_id;
        this.description = description; //description on hover
        this.action_text = action_text; //text displayed during action animation
        this.failure_texts = failure_texts; //text displayed on failure
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
        this.success_text = success_text; //text displayed on success
                                          //if action is supposed to be "impossible" for narrative purposes, just make it finish without unlocks and with text that says it failed
        
        this.success_texts = success_texts; //array; the idea is to use this for getSuccessText if it's not default, so that possible results can still be checked by verifier
        this.getSuccessText = getSuccessText || function(){return this.success_text};

        /*
            The text fields above all hold TEXT IDS. The accessors below resolve
            them; the raw fields stay ids so the verifier can still match an
            action by them, and so a save never sees a translated string.
        */

        this.getStartingText = () => translationManager.getText(language, this.starting_text);
        this.getActionName = () => translationManager.getText(language, this.action_name);
        this.getDescription = () => translationManager.getText(language, this.description);
        this.getActionText = () => translationManager.getText(language, this.action_text);

        /** The unlock message, or undefined when the action has none. */
        this.getUnlockText = () => this.unlock_text
            ? translationManager.getText(language, this.unlock_text)
            : this.unlock_text;

        /**
         * Resolves whichever success text getSuccessText picked. A custom
         * getSuccessText returns an id like the default one does, so both go
         * through here.
         */
        this.getResolvedSuccessText = (...args) => translationManager.getText(language, this.getSuccessText(...args));

        /** One failure line, resolved. The stored value is an id. */
        this.resolveText = (id) => translationManager.getText(language, id);
        /*
            Availability lives in the component now, and the fields below are accessors
            onto it. Everything that reads or writes action.is_unlocked, .is_finished,
            .required, .conditions and so on keeps working unchanged - which is the
            point: the architecture moves without the save format or twenty call sites
            moving with it.

            `required` is the component's start_conditions and `conditions` its
            success_conditions; the names differ because upstream renamed them and our
            content has not.
        */
        if(conditions.length > 2) {
            throw new Error('LocationAction cannot have more than 2 sets of conditions!');
        }
        this.#availability = new AvailabilityComponent({
            is_unlocked,
            is_finished: false,
            display_conditions,
            start_conditions: required,
            success_conditions: conditions,
            //Stated rather than defaulted: the component's own default is upstream's
            //`true`, and ours has always been false.
            repeatable,
            unlock_message: unlock_text,
        });
        availabilities["action"][this.action_id] = this.#availability;
        
        this.check_conditions_on_finish = check_conditions_on_finish; 
        //means an action with duration can be attempted even if conditions are not met;
        //setting it to false will check them on start instead
        this.rewards = rewards; //{unlocks, money, items,move_to}?
        this.attempt_duration = attempt_duration; //0 means instantaneous, otherwise there's a progress bar
        this.success_chances = success_chances; 
        //chances to succeed; to guarantee that multiple attempts will be needed, just make a few consecutive actions with same text
        this.keep_progress = keep_progress;
        //will make progress persist through leaving the action and through save/load; 
        //should be used only for actions that guarantee success if conditions are met, to not encourage save scumming
        this.accumulated_progress = 0;
        this.completion_count = 0; //only used for repeatables
    }

    getAvailabilityComponent() {
        return this.#availability;
    }

    /*
        Upstream's accessors for the two mutable counters. Our own call sites still touch
        accumulated_progress and completion_count directly - main.js increments the count
        and the save reads it - so these exist for their API rather than replacing ours,
        and they keep the two files closer than they would otherwise be.

        `|| this` on both setters is upstream's: passing 0 or undefined leaves the value
        alone rather than clearing it.
    */
    getCurrentProgress() {
        return this.accumulated_progress;
    }

    setCurrentProgress(progress) {
        this.accumulated_progress = progress || this.accumulated_progress;
    }

    getCompletionCount() {
        return this.completion_count;
    }

    setCompletionCount(count) {
        this.completion_count = count || this.completion_count;
    }

    /*
        The old field names, kept as accessors onto the component. Save and load in
        main.js write and read these by name, as does lock_action; nothing had to
        change for the component to arrive.
    */
    get is_unlocked() { return this.#availability.is_unlocked; }
    set is_unlocked(value) { this.#availability.is_unlocked = value; }

    get is_finished() { return this.#availability.is_finished; }
    set is_finished(value) { this.#availability.is_finished = value; }

    get is_locked() { return this.#availability.is_locked; }
    set is_locked(value) { this.#availability.is_locked = value; }

    get repeatable() { return this.#availability.repeatable; }

    get required() { return this.#availability.start_conditions[0]; }
    get conditions() { return this.#availability.success_conditions; }
    get display_conditions() { return this.#availability.display_conditions[0]; }
    get unlock_text() { return this.#availability.unlock_message; }

    /**
     * @returns {Number} the degree at which conditions are met. 0 means failure (some requirement is not met at all),
     * everything else is for calculating final success chance (based on minimal and maximal chance, with 1 meaning that it's just the maximal).
     * Items do not get fuzzy treatment, they are either all met or not.
     */
    get_conditions_status(character) {
        return this.#availability.get_conditions_status(character);
    }

    /**
     * @returns {Boolean} if start conditions are met
     */
    can_be_started(character) {
        /*
            Conditions only, deliberately. The component's canBeStarted also requires the
            action to be unlocked and unfinished; every caller of this one has already
            established that by displaying the action, and folding the flags in here
            would be a silent behaviour change rather than a refactor. The stricter
            version is available as canBeStarted().
        */
        return process_conditions([this.required], character);
    }

    /**
     * 
     * @returns  {Boolean} if display conditions are met
     */
    can_be_displayed(character) {
        //Flags included. All three callers were checking is_unlocked && !is_finished by
        //hand before calling this; they no longer have to.
        return this.#availability.canBeDisplayed(character);
    }
}

availability_havers.push(GameAction);

export {GameAction};