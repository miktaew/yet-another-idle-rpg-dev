// @ts-check
"use strict";
import { language } from "./main.js";
import { translationManager } from "./translation.js";

const activities = {};

/*
    A bit complicated with activities defined both here and in locations, but:
    - multiple locations can have "same" activity available, though with different xp/money gains
    - activity can be overall unlocked, but not yet available in specific location (or vice versa)
*/

class Activity {
    constructor({ name,
                  description,
                  action_text,
                  base_skills_names,
                  is_unlocked = false,
                  getBackgroundNoises,
        }) 
    {
        this.name = name;
        this.description = description; //description on job
        this.action_text = action_text; //text displayed in action div, e.g. "Working the fields"
        this.base_skills_names = base_skills_names;
        //skills that affect efficiency of an activity and are raised when performing it
        //originally meant to allow multiple, but with current implementation of stuff, doing that would break a lot of things
        this.tags = [];
        this.is_unlocked = is_unlocked;

        this.getBackgroundNoises = getBackgroundNoises || function(){return [];}

        /**
         * The shown name. this.name stays the canonical English because the
         * activities registry is keyed by it, and a LocationActivity points at it
         * through activity_name.
         */
        this.getName = () => translationManager.getDisplayName(language, this.name);

        /** this.description and this.action_text hold TEXT IDS. */
        this.getDescription = () => this.description
            ? translationManager.getText(language, this.description)
            : this.description;
        this.getActionText = () => this.action_text
            ? translationManager.getText(language, this.action_text)
            : this.action_text;
    }
}

class Job extends Activity {
    constructor(activity_data) {
        super(activity_data);
        this.type = "JOB";
        this.payment_type = activity_data.payment_type;
    }
}

class Training extends Activity {
    constructor(activity_data) {
        super(activity_data);
        this.type = "TRAINING";
    }
}

class Gathering extends Training {
    constructor({ name,
        description,
        action_text,
        base_skills_names,
        is_unlocked = false,
        //Optional, and the default says so. Five of the game's gathering activities need
        //no tool at all - animal care does not want a sickle - and main.js reads this as
        //`!required_tool_type`, so null and undefined behave identically there.
        required_tool_type = null,
        getBackgroundNoises = null
    }) {
        super({name, description, action_text, base_skills_names, is_unlocked, getBackgroundNoises});
        this.type = "GATHERING";
        this.tags["gathering"] = true;
        this.required_tool_type = required_tool_type;
        //drops are defined in locations
    }
}
/*
    All 3 types of activity can yield loot.
    For trainings and jobs, it doesn't require a tool and is a small bonus on top of xp/money, plus their skills get xp every tick.
    For gatherings, tools are required and loot is the main focus, plus their skills get xp when work period is finished
*/

//jobs
(function(){
    activities["fieldwork"] = new Job({
        name: "fieldwork",
        action_text: "activity text fieldwork",
        description: "desc activity fieldwork",
        base_skills_names: ["Farming"],
        is_unlocked: true,
    });
    activities["patrolling"] = new Job({
        name: "patrolling",
        action_text: "activity text patrolling",
        description: "desc activity patrolling",
        base_skills_names: ["Spatial awareness"],
        is_unlocked: true,
    })
})();

//trainings
(function(){
    activities["running"] = new Training({
        name: "running",
        action_text: "activity text running",
        description: "desc activity running",
        base_skills_names: ["Running"],
        is_unlocked: true,
    });
    activities["weightlifting"] = new Training({
        name: "weightlifting",
        action_text: "activity text weightlifting",
        description: "desc activity weightlifting",
        base_skills_names: ["Weightlifting"],
        is_unlocked: true,
    });
    activities["balancing"] = new Training({
        name: "balancing",
        action_text: "activity text balancing",
        description: "desc activity balancing",
        base_skills_names: ["Equilibrium"],
        is_unlocked: true,
    });
    activities["swimming"] = new Training({
        name: "swimming",
        action_text: "activity text swimming",
        description: "desc activity swimming",
        base_skills_names: ["Swimming"],
        is_unlocked: false,
    });
    activities["meditating"] = new Training({
        name: "meditating",
        action_text: "activity text meditating",
        description: "desc activity meditating",
        base_skills_names: ["Meditation"],
        is_unlocked: true,
    });
    activities["climbing"] = new Training({
        name: "climbing",
        action_text: "activity text climbing",
        description: "desc activity climbing",
        base_skills_names: ["Climbing"],
        is_unlocked: false,
    });
    activities["enduring"] = new Training({
        name: "enduring",
        action_text: "activity text enduring",
        description: "desc activity enduring",
        base_skills_names: ["Persistence"],
        is_unlocked: true,
    });
})();

//resource gatherings
(function(){
    activities["mining"] = new Gathering({
        name: "mining",
        action_text: "activity text mining",
        description: "desc activity mining",
        base_skills_names: ["Mining"],
        is_unlocked: true,
        required_tool_type: "pickaxe",
        getBackgroundNoises: () => ["clang clang", "clink clink", "tink tink", "crunch", "*Your pickaxe strikes the heart of the rock*"]
    });
    activities["digging"] = new Gathering({
        name: "digging",
        action_text: "activity text digging",
        description: "desc activity digging",
        base_skills_names: ["Digging"],
        is_unlocked: true,
        required_tool_type: "shovel",
        getBackgroundNoises: () => ["plap plap", "plop plop", "crunch", "thwack", "scrape", "squelch"]
    });
    activities["woodcutting"] = new Gathering({
        name: "woodcutting",
        action_text: "activity text woodcutting",
        description: "desc activity woodcutting",
        base_skills_names: ["Woodcutting"],
        is_unlocked: true,
        required_tool_type: "axe",
        getBackgroundNoises: () => ["chop", "CHOP chop", "chop CHOP", "chop chop", "creeeak", "Sap oozes from the gash", "*Splinters burst from under your axe*", "*A pinecone falls on you*", "*A squirrel is upset with you*"]
    });

    activities["herbalism"] = new Gathering({
        name: "herbalism",
        action_text: "activity text herbalism",
        description: "desc activity herbalism",
        base_skills_names: ["Herbalism"],
        is_unlocked: true,
        required_tool_type: "sickle",
        getBackgroundNoises: () => ["*rustle*", "A frog is watching you work", "You find a particularly impressive snail under a leaf"]
    });

    activities["animal care"] = new Gathering({
        name: "animal care",
        action_text: "activity text animal care",
        description: "desc activity animal care",
        base_skills_names: ["Animal handling"],
        is_unlocked: true,
    });

    activities["fishing"] = new Gathering({
        name: "fishing",
        action_text: "activity text fishing",
        description: "desc activity fishing",
        base_skills_names: ["Fishing"],
        is_unlocked: true,
        required_tool_type: "fishing_pole",
        getBackgroundNoises: () => ["*Nothing bites*", "*You feel a light tug, but no bite*", "*The fish escapes before you can reel it in*", "*The fish steals your bait*", "*Your catch gets swiped by a bigger fish*", "*Your catch gets swiped by a passing bird*", "*Your catch flies away*"]
    });
})();


export {activities, Gathering};