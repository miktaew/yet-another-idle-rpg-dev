"use strict";

import { availability_havers } from "./data/component_references.js";

/**
 * Grafts the shared availability methods onto every class that owns a component.
 *
 * Taken from upstream. A class registers itself in `availability_havers` and provides
 * `getAvailabilityComponent()`; everything else is written once here rather than
 * repeated in each class.
 *
 * `||=` rather than `=`, so a class that needs its own version of one of these - a
 * location whose display also depends on its parent, say - keeps it.
 *
 * Called once at startup, after the modules that declare the classes have evaluated.
 */
function fill_availability_methods() {
    for(const haver of availability_havers) {
        haver.prototype.isUnlocked ||= isUnlocked;
        haver.prototype.isLocked ||= isLocked;
        haver.prototype.isFinished ||= isFinished;
        haver.prototype.setUnlocked ||= setUnlocked;
        haver.prototype.setLocked ||= setLocked;
        haver.prototype.setFinished ||= setFinished;
        haver.prototype.setStatus ||= setStatus;
        haver.prototype.canBeDisplayed ||= canBeDisplayed;
        haver.prototype.canBeStarted ||= canBeStarted;
        haver.prototype.getConditionsStatus ||= getConditionsStatus;
        haver.prototype.getUnlockMessage ||= getUnlockMessage;
    }
}

function isUnlocked() {
    return this.getAvailabilityComponent().getStatus().is_unlocked;
}

function isLocked() {
    return this.getAvailabilityComponent().getStatus().is_locked;
}

function isFinished() {
    return this.getAvailabilityComponent().getStatus().is_finished;
}

function setUnlocked() {
    return this.getAvailabilityComponent().setStatus({is_unlocked: true});
}

function setLocked() {
    return this.getAvailabilityComponent().setStatus({is_locked: true});
}

function setFinished() {
    return this.getAvailabilityComponent().setStatus({is_finished: true});
}

function setStatus(status) {
    this.getAvailabilityComponent().setStatus(status);
}

/**
 * The context is the character. Passing the context-builder itself instead of calling it
 * is a mistake that otherwise fails silently - process_conditions would read properties
 * off a function and find undefined everywhere, which reads as "conditions met".
 */
function complain_about(context, method) {
    if(typeof context === "function") {
        console.error(`${method} was passed a function as its context - call it first.`);
    } else if(!context) {
        console.error(`${method} was passed no context.`);
    }
}

function canBeDisplayed(context) {
    complain_about(context, "canBeDisplayed");
    return this.getAvailabilityComponent().canBeDisplayed(context);
}

function canBeStarted(context) {
    complain_about(context, "canBeStarted");
    return this.getAvailabilityComponent().canBeStarted(context);
}

function getConditionsStatus(context) {
    complain_about(context, "getConditionsStatus");
    return this.getAvailabilityComponent().get_conditions_status(context);
}

function getUnlockMessage() {
    return this.getAvailabilityComponent().getUnlockMessage();
}

export { fill_availability_methods };
