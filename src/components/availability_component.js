"use strict";
// @ts-check

import { process_conditions } from "../conditions.js";

/**
 * Whether a thing is available, and under what conditions.
 *
 * Taken from upstream, which introduced it to replace the loose is_unlocked /
 * is_finished / conditions fields that every unlockable class carried its own copy of -
 * locations, dialogues, textlines, traders, actions, activities. One place now answers
 * "can this be shown", "can this be started" and "did it succeed", and the classes
 * delegate.
 *
 * Two deliberate differences from upstream's version:
 *
 *   - `is_locked` is carried but nothing here sets it, exactly as upstream ships it. It
 *     means "made unavailable by a differing choice" as opposed to "completed"; our
 *     content records that as is_finished today. Carrying the field costs nothing and
 *     keeps us mergeable; acting on the distinction is a separate decision.
 *   - `repeatable` has NO default. Upstream defaults it to true; our GameAction has
 *     always defaulted it to false, and silently flipping that would make every
 *     one-shot action repeatable. Each caller states it.
 *
 * The `context` a condition is evaluated against is whatever our process_conditions
 * expects - the character - rather than upstream's assembled context object.
 */
class AvailabilityComponent {
    constructor({
        is_unlocked,
        is_finished,
        is_locked,
        display_conditions = {},
        start_conditions = {},
        success_conditions = [],
        repeatable,
        unlock_message,
    }) {
        this.is_unlocked = is_unlocked ?? false;

        //Permanently unavailable, as opposed to completed. Carried, never set here.
        this.is_locked = is_locked ?? false;

        //Completed. Unlock rewards can be processed again on every load.
        this.is_finished = is_finished ?? false;

        //Conditions for being shown at all. A single set: display is not meant to be
        //fuzzy, so there is nothing to interpolate between.
        this.display_conditions = [display_conditions];

        //Conditions for being allowed to start - the requirements.
        this.start_conditions = [start_conditions];

        if(success_conditions?.length > 2) {
            throw new Error("Unlockables cannot have more than 2 sets of conditions for success!");
        }
        //Conditions for succeeding: one set, or two to interpolate a chance between.
        this.success_conditions = success_conditions;

        this.repeatable = repeatable;

        //A TEXT ID. Resolving it is the owner's job, because only the owner knows
        //whether it has one.
        this.unlock_message = unlock_message;
    }

    getUnlockMessage() {
        return this.unlock_message;
    }

    isRepeatable() {
        return this.repeatable;
    }

    /**
     * The three predicates all fold in the availability flags, which is the point of the
     * component: a caller asks one question instead of remembering to check three fields
     * and then evaluate conditions.
     */
    canBeDisplayed(context) {
        return this.is_unlocked && !this.is_locked && !this.is_finished
            && Boolean(process_conditions(this.display_conditions, context));
    }

    canBeStarted(context) {
        return this.is_unlocked && !this.is_locked && !this.is_finished
            && Boolean(process_conditions(this.start_conditions, context));
    }

    canSucceed(context) {
        return this.is_unlocked && !this.is_locked && !this.is_finished
            && Boolean(process_conditions(this.success_conditions, context));
    }

    /**
     * @returns {Number} how far the success conditions are met. 0 is failure; anything
     * else scales the success chance between its minimum and maximum, 1 being the
     * maximum. Money, reputation, levels and stats interpolate; everything else is 0 or 1.
     */
    get_conditions_status(context) {
        return process_conditions(this.success_conditions, context);
    }

    getStatus() {
        return {
            is_unlocked: this.is_unlocked,
            is_finished: this.is_finished,
            is_locked: this.is_locked,
        };
    }

    /**
     * A declared default of `true` for is_unlocked wins over a saved `false`, which is
     * how content that becomes unlocked-by-default in a later version reaches players
     * who already have a save.
     */
    setStatus({is_unlocked, is_finished, is_locked}) {
        this.is_unlocked = is_unlocked || this.is_unlocked;
        this.is_finished = is_finished ?? this.is_finished;
        this.is_locked = is_locked ?? this.is_locked;
    }
}

/**
 * The three flags as one number, 0-7, for a compact save.
 *
 * Not used by our save format yet - ours records the fields per entity - but kept so the
 * two trees stay mergeable and so adopting the compact form later is a change to main.js
 * alone.
 */
function status_to_flag(status) {
    return (status.is_unlocked << 0) | (status.is_finished << 1) | (status.is_locked << 2);
}

function flag_to_status(flag) {
    return {
        is_unlocked: Boolean((flag >> 0) & 1),
        is_finished: Boolean((flag >> 1) & 1),
        is_locked: Boolean((flag >> 2) & 1),
    };
}

export default AvailabilityComponent;
export { status_to_flag, flag_to_status };
