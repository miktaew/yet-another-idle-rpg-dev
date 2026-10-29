"use strict";

import { Rewards } from "./rewards.js";

//delays are provided separately (there's just no need to have them here, plus this allows them to differ for same thing depending on source)
const delayed_rewards = {
    temple_ritual: new Rewards({
        textlines: [{dialogue: "temple priest", lines: ["restore"]}],
    }),
}


export { delayed_rewards} ;