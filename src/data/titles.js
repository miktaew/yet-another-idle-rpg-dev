/** Titles: a record of what the player has done. */

import { character } from "../character.js";
import { enemy_killcount } from "../enemies.js";
import { skills } from "./skills.js";
import { run_stats } from "../run_stats.js";
import { language } from "../main.js";
import { translationManager } from "../translation.js";

/**
 * The other half of the lore panel.
 *
 * The lore panel records what the player was TOLD, kept after the dialogue closed. A
 * title records what they DID, kept after the moment passed. Between them the journal
 * holds both halves of a playthrough's memory, which is what the panel was always
 * missing.
 *
 * **A title is a record and nothing else.** Adapted from Echoes-Beneath, whose titles
 * may carry a `talent()` applied once when earned - deliberately left behind, because
 * skill milestones already hand out stats at thresholds and two systems doing that at
 * the same moment is how they start disagreeing about a number.
 *
 * Conditions are declarative rather than functions so that a check can read them: a
 * title naming a skill or an enemy that does not exist is caught before it ships,
 * which a `() => ...` could not be.
 */
class Title {
    /**
     * @param {Object} data
     * @param {String} data.title_id registry key, and save data - never renamed
     * @param {Object} [data.condition] what earns it; omit for a title only content grants
     */
    constructor({title_id, condition = null}) {
        this.title_id = title_id;
        this.condition = condition;
        this.is_earned = false;

        /** The shown name. The id stays the canonical key, as everywhere else. */
        this.getName = () => translationManager.getText(language, `title ${title_id} name`);
        this.getDescription = () => translationManager.getText(language, `title ${title_id} desc`);
    }
}

const titles = {};

/*
    Twelve, and each one records something the game already counts. Nothing here needs a
    new counter, which is the test of whether a title is about play or about itself.
*/

//--- what you fought -----------------------------------------------------------
titles["first blood"] = new Title({
    title_id: "first blood",
    condition: {kills: 1},
});
titles["rat catcher"] = new Title({
    title_id: "rat catcher",
    condition: {killed: {"Wolf rat": 100}},
});
titles["giant slayer"] = new Title({
    title_id: "giant slayer",
    condition: {kills: 1000},
});
titles["heavy hand"] = new Title({
    title_id: "heavy hand",
    condition: {strongest_hit: 500},
});
//Wry rather than punishing: the game already counts deaths, and having one is a
//story about the player rather than a failure to hide from them.
titles["learned the hard way"] = new Title({
    title_id: "learned the hard way",
    condition: {deaths: 1},
});

//--- what you made -------------------------------------------------------------
titles["hands worth having"] = new Title({
    title_id: "hands worth having",
    condition: {crafted: 100},
});
titles["smith"] = new Title({
    title_id: "smith",
    condition: {skill: {Forging: 20}},
});
titles["provisioner"] = new Title({
    title_id: "provisioner",
    condition: {skill: {Cooking: 20}},
});

//--- where you are known -------------------------------------------------------
titles["of the village"] = new Title({
    title_id: "of the village",
    condition: {reputation: {Village: 400}},
});
titles["of the row"] = new Title({
    title_id: "of the row",
    condition: {reputation: {Slums: 300}},
});
titles["of the square"] = new Title({
    title_id: "of the square",
    condition: {reputation: {Town: 250}},
});
//The one that needs all three, and the only one that says something the separate
//reputations do not: not liked anywhere in particular, known everywhere.
titles["a name on both sides of the wall"] = new Title({
    title_id: "a name on both sides of the wall",
    condition: {reputation: {Village: 300, Slums: 250, Town: 200}},
});

//--- what content hands over directly ------------------------------------------
/*
    No condition: nothing the game counts can see this one. It marks having cut the
    flax that grew back in the wet woods once the Drowned grove was cleared through,
    which is a moment rather than a number.
*/
titles["the woods are quiet"] = new Title({
    title_id: "the woods are quiet",
});

/**
 * Whether a title's condition is met right now.
 *
 * Reads live state and never caches: a reputation can be spent, a skill can be
 * recalculated, and a title that has been earned stays earned through `is_earned`
 * rather than by the condition staying true.
 */
function is_title_earned(title) {
    const condition = title.condition;
    if(!condition) {
        return false;   //granted by content only
    }

    if(condition.kills !== undefined && run_stats.total_kills < condition.kills) {
        return false;
    }
    if(condition.crafted !== undefined && run_stats.total_crafting_successes < condition.crafted) {
        return false;
    }
    if(condition.deaths !== undefined && run_stats.total_deaths < condition.deaths) {
        return false;
    }
    if(condition.strongest_hit !== undefined && run_stats.strongest_hit < condition.strongest_hit) {
        return false;
    }
    if(condition.killed) {
        for(const enemy_name in condition.killed) {
            if((enemy_killcount[enemy_name] || 0) < condition.killed[enemy_name]) {
                return false;
            }
        }
    }
    if(condition.skill) {
        for(const skill_id in condition.skill) {
            if((skills[skill_id]?.current_level || 0) < condition.skill[skill_id]) {
                return false;
            }
        }
    }
    if(condition.reputation) {
        for(const region in condition.reputation) {
            if((character.reputation[region] || 0) < condition.reputation[region]) {
                return false;
            }
        }
    }
    return true;
}

export {
    Title,
    titles,
    is_title_earned,
};
