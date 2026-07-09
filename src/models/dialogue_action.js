"use strict";

import { GameAction } from "./game_action.js";

class DialogueAction extends GameAction {
    constructor(data) {
        super(data);
        this.giveup_text = data.giveup_text;
        this.floating_click_effects = data.floating_click_effects;
    }
}

export default DialogueAction;