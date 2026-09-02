"use strict";
// @ts-check

import { GameAction } from "./game_action.js";

/**
 * A GameAction that belongs to a conversation rather than to a place.
 *
 * The two extra fields are what a dialogue needs and a location does not: the label on
 * the button that abandons the attempt, and the little strings that float up when the
 * player clicks.
 */
class DialogueAction extends GameAction {
    constructor(data) {
        super(data);
        this.giveup_text = data.giveup_text;
        this.floating_click_effects = data.floating_click_effects;
    }
}

export default DialogueAction;
