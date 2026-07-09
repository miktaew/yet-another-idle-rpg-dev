"use strict";

import { process_conditions } from "../conditions.js";

/**
 * generalized component class for use with anything that might be unlockable - things like locations, dialogues, textlines, traders, actions, activities, etc
 */
class AvailabilityComponent {
    constructor({is_unlocked, is_finished, is_locked, display_conditions = {}, start_conditions = {}, success_conditions = [], repeatable, unlock_message}) {
        this.is_unlocked = is_unlocked ?? false;
        //self-explanatory

        this.is_locked = is_locked ?? false; 
        //permanently unavailable

        this.is_finished = is_finished ?? false;
        //completed, unlock rewards can be processed on every game loading

        this.display_conditions = [display_conditions]; 
        //conditions for displaying, single element as it's not meant to be random; e.g. for a dialogue option 
        //can also be used for a game action, like carrying the grain cart in the Village which requires a rather high Weightlifting level 
        //        (so that it's displayed slightly before it can actually be done)

        this.start_conditions = [start_conditions];
        //conditions for starting (requirements)
        //also for *adding* item to trader inventory
        

        if(success_conditions?.length > 2) {
            throw new Error('Unlockables cannot have more than 2 sets of conditions for success!');
        }

        this.success_conditions = success_conditions;
        //conditions for succeeding, standard conditions array (either 1 or 2 elements); e.g. for a game action

        this.repeatable = repeatable ?? true;
        //if true, it won't be marked as finished upon success

        this.unlock_message = unlock_message;
    }

    getUnlockMessage() {
        return this.unlock_message;
    }

    isRepeatable() {
        return this.repeatable;
    }

    /**
     * @param {Object} context 
     * @returns {Boolean}
     */
    canBeDisplayed(context) {
        return this.is_unlocked && !this.is_locked && !this.is_finished && process_conditions(this.display_conditions, context);
    }

    /**
     * @param {Object} context 
     * @returns {Boolean}
     */
    canBeStarted(context) {
        return this.is_unlocked && !this.is_locked && !this.is_finished && process_conditions(this.start_conditions, context);
    }

    /**
     * 
     * @param {Object} context 
     * @returns {Boolean}
     */
    canSucceed(context) {
        return this.is_unlocked && !this.is_locked && !this.is_finished && process_conditions(this.success_conditions, context);
    }

    /**
     * @returns {Number} the degree at which conditions are met. 0 means failure (some requirement is not met at all),
     * everything else is for calculating final success chance (based on minimal and maximal chance, with 1 meaning that it's just the maximal).
     * Fuzzy treatment applies to money, reputation, levels and stats, while other things are just 0 or 1
     */
    get_conditions_status(context) {
        return process_conditions(this.success_conditions, context);
    }

    getStatus() {
        return {
            is_unlocked: this.is_unlocked,
            is_finished: this.is_finished,
            is_locked: this.is_locked,
        }
    }

    setStatus({is_unlocked, is_finished, is_locked}) {
        this.is_unlocked = is_unlocked || this.is_unlocked; //important, default is_unlocked value should have priority if it's true and saved is false
        this.is_finished = is_finished ?? this.is_finished;
        this.is_locked = is_locked ?? this.is_locked;
    }
}

/**
 * 
 * @param {Object} status standard availability status
 * @returns value in range 0-7 representing availability status
 */
function status_to_flag(status) {
    return (status.is_unlocked << 0) | (status.is_finished << 1) | (status.is_locked << 2);
}

/**
 * 
 * @param {Number} flag value in range 0-7
 * @returns standard availability status
 */
function flag_to_status(flag) {
    return {
        is_unlocked: Boolean((flag >> 0) & 1),
        is_finished: Boolean((flag >> 1) & 1),
        is_locked:   Boolean((flag >> 2) & 1),
    }
}

export default AvailabilityComponent;
export { status_to_flag, flag_to_status };