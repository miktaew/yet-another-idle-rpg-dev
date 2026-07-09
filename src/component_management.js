"use strict";

import { availability_havers } from "./data/component_references.js";

function fill_availability_methods() {
    for(let i = 0; i < availability_havers.length; i++) {
        availability_havers[i].prototype.isUnlocked ||= isUnlocked;
        availability_havers[i].prototype.isLocked ||= isLocked;
        availability_havers[i].prototype.isFinished ||= isFinished;
        availability_havers[i].prototype.setUnlocked ||= setUnlocked;
        availability_havers[i].prototype.setLocked ||= setLocked;
        availability_havers[i].prototype.setFinished ||= setFinished;
        availability_havers[i].prototype.setStatus ||= setStatus;
        availability_havers[i].prototype.canBeDisplayed ||= canBeDisplayed;
        availability_havers[i].prototype.canBeStarted ||= canBeStarted;
        availability_havers[i].prototype.getConditionsStatus ||= getConditionsStatus;
        availability_havers[i].prototype.getUnlockMessage ||= getUnlockMessage;
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
function canBeDisplayed(context) {
    if(typeof context === "function") {
        console.error(`Looks like you passed a get_context function as a param, instead of calling it and passing its returned value`);
    } else if(!context) {
        console.error(`No context object passed!`);
    }
    return this.getAvailabilityComponent().canBeDisplayed(context);
}
function canBeStarted(context) {
    if(typeof context === "function") {
        console.error(`Looks like you passed a get_context function as a param, instead of calling it and passing its returned value`);
    } else if(!context) {
        console.error(`No context object passed!`);
    }
    return this.getAvailabilityComponent().canBeStarted(context);
}
function getConditionsStatus(context) {
    if(typeof context === "function") {
        console.error(`Looks like you passed a get_context function as a param, instead of calling it and passing its returned value`);
    } else if(!context) {
        console.error(`No context object passed!`);
    }
    return this.getAvailabilityComponent().get_conditions_status(context);
}
function getUnlockMessage() {
    return this.getAvailabilityComponent().getUnlockMessage();
}

export { fill_availability_methods };