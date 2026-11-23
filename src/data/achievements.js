"use strict";

import Achievement from "../models/achievement.js";
import { availabilities } from "./component_references.js";

availabilities["achievement"] = {};
availabilities["achievement_notification"] = {};

const achievements = {};

(()=>{
    achievements["Rat"] = new Achievement({
        //for eating rat meat with full possible rat equipment
        name: "achievement rat name",
        description: "achievement rat desc",
        bonuses: {
            xp_multipliers: {
                Perception: 1.1,
            }
        },
        is_finished: true,
    });
    achievements["Master of fate"] = new Achievement({
        //for doing the memory restoration ritual
        name: "achievement fate name",
        description: "achievement fate desc",
        bonuses: {
            xp_multipliers: {
                all: 2, //big big buff
            }
        }
    });
})();




Object.keys(achievements).forEach(id => {
    achievements[id].achievement_id = id;

    availabilities["achievement"][id] = achievements[id].getAvailabilityComponent();
    availabilities["achievement_notification"][id] = achievements[id].getNotificationComponent().getAvailabilityComponent();
});

export { achievements };
