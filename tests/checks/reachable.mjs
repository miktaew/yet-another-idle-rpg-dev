/** Content nothing in the game can hand out. */

import * as fs from "node:fs";
import * as path from "node:path";
import { repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { load_browser_free } from "../lib/browser-free-src.mjs";

/**
 * Every reward block in the game, wherever it is written.
 *
 * There are more shapes than a reader remembers, and forgetting one is how a check comes to
 * report that something is unreachable when it is not: an earlier sweep of the standing-gate
 * check knew only dialogue and location-action rewards and called a real, reachable gate
 * impossible. So all of them, from the live objects:
 *
 *   - a dialogue's textlines and its actions
 *   - a location's actions, and its entrance_rewards - paid for walking in
 *   - a combat zone's first_reward, its repeatable_reward, and its clear-count tiers
 *   - a quest's own reward and each task's reward
 *   - a skill's milestone `unlocks`, which is a level deeper than the milestone itself
 *
 * Writing this taught it three of those. The first sweep knew dialogues, location actions and
 * the clear rewards, and reported four reachable quests as unstartable: two live in
 * entrance_rewards on the slums and the swampland fields, and two are handed out by a
 * Breathing milestone. `locks: {quests: [...]}` is deliberately NOT a grant - it is the
 * opposite - and that one turned out to be a real finding rather than a gap.
 */
async function every_reward_block() {
    const [dialogues_module, locations_module, quests_module, skills_module] =
        await load_browser_free(repo_root, ["src/data/dialogues.js", "src/data/locations.js",
            "src/quests.js", "src/data/skills.js"]);

    const blocks = [];
    const add = (rewards, where) => {
        if (rewards && typeof rewards === "object") blocks.push({rewards, where});
    };

    for (const [name, dialogue] of Object.entries(dialogues_module.dialogues)) {
        for (const bucket of ["textlines", "actions"]) {
            for (const [key, entry] of Object.entries(dialogue[bucket] || {})) {
                add(entry.rewards, `${name}/${key}`);
            }
        }
    }
    for (const [name, location] of Object.entries(locations_module.locations)) {
        for (const [key, action] of Object.entries(location.actions || {})) {
            add(action.rewards, `${name}/${key}`);
        }
        add(location.entrance_rewards, `${name} (on arrival)`);
        add(location.first_reward, `${name} (first clear)`);
        add(location.repeatable_reward, `${name} (each clear)`);
        for (const tier of location.rewards_with_clear_requirement || []) {
            add(tier, `${name} (${tier.required_clear_count} clears)`);
        }
    }
    for (const [name, quest] of Object.entries(quests_module.quests)) {
        add(quest.quest_rewards, `quest ${name}`);
        for (const [index, task] of Object.entries(quest.quest_tasks || [])) {
            add(task.task_rewards, `quest ${name} task ${index}`);
        }
    }
    for (const [name, skill] of Object.entries(skills_module.skills)) {
        for (const [level, milestone] of Object.entries(skill.milestones || {})) {
            //A milestone's grants sit under `unlocks`, beside its stats and multipliers.
            add(milestone.unlocks, `skill ${name} at ${level}`);
        }
    }

    return {blocks, quests: quests_module.quests, locations: locations_module.locations};
}

/**
 * Names granted by some reward block, for one kind of reward.
 *
 * Each kind is written both as a bare string and as an object in different places, so both
 * are read.
 */
function granted_names(blocks, kind, field) {
    const granted = new Map();
    for (const {rewards, where} of blocks) {
        for (const target of rewards[kind] || []) {
            const name = typeof target === "string" ? target : target[field];
            if (name && !granted.has(name)) granted.set(name, where);
        }
    }
    return granted;
}

/**
 * Every quest can be started by something.
 *
 * A quest is started by a `quests:` reward or by a direct `startQuest` call, and
 * `questManager.finishQuestTask` opens with `if(this.isQuestActive(quest_id))` - so a quest
 * nothing starts is not merely unlisted, it is inert: every `quest_progress` reward aimed at
 * it does nothing at all. The player can do the whole of the work and the journal never
 * mentions it.
 *
 * That is how `Out on the Ebb` and `One Unweighed Crate` shipped (P-40). Six actions and a
 * dialogue line advanced tasks that could never be advanced, and nothing anywhere reported
 * it, because a reward pointing at an inactive quest is silently ignored by design.
 *
 * This asks whether something grants it, not whether that something is itself reachable -
 * a full reachability walk would have to model combat clears, quest chains and unlock order,
 * and a check that models the game is a check that disagrees with it. "Nothing at all hands
 * this out" is the failure that actually happened, twice.
 */
async function check_every_quest_can_be_started() {
    const {blocks, quests} = await every_reward_block();
    const granted = granted_names(blocks, "quests", "quest_id");

    //And the ones started in code rather than by a reward - the opening quest is one.
    const code = fs.readFileSync(path.join(repo_root, "src", "main.js"), "utf8");
    for (const match of code.matchAll(/startQuest\(\s*\{\s*quest_id:\s*"([^"]+)"/g)) {
        if (!granted.has(match[1])) granted.set(match[1], "main.js");
    }

    const names = Object.keys(quests);
    if (names.length === 0 || granted.size === 0) {
        error("no quests, or nothing grants any - check_every_quest_can_be_started is out of date.");
        return;
    }

    for (const name of names) {
        if (granted.has(name)) continue;
        error(`nothing in the game starts the quest "${name}". finishQuestTask does nothing `
            + `for a quest that was never started, so every quest_progress reward aimed at it `
            + `is silently ignored and the journal never mentions it.`);
    }

    console.log(`[check] quest starts: ${names.length} quest(s), each granted by something`);
}

/**
 * Every location can be unlocked by something.
 *
 * The same failure in a different currency, and it was sitting beside the other one: `The
 * tidal flats` shipped with `is_unlocked: false` and nothing anywhere granting it, which put
 * its three actions, the lower hold beyond it and the crate at the end of that out of reach
 * as well - the whole second half of a region, written and unreachable.
 *
 * A location that starts unlocked needs no grant. Everything else does - unless there is
 * nothing in it. `Mages guild` is locked, granted by nothing, and holds no dialogue, trader,
 * action, activity or bed: an empty room waiting for the guild work in P-41, and unlocking it
 * would give the player a room with nothing in it, which is worse than not having it.
 *
 * So the rule is what the failure actually is - **unreachable content**, not unreachable
 * emptiness - and it is a rule rather than a list of excused names. Write anything into that
 * room without wiring a way in and this fails, which is the moment it should.
 */
async function check_every_location_can_be_unlocked() {
    const {blocks, locations} = await every_reward_block();
    const granted = granted_names(blocks, "locations", "location");

    const names = Object.keys(locations);
    if (names.length === 0) {
        error("no locations at all - check_every_location_can_be_unlocked is out of date.");
        return;
    }

    let locked = 0;
    const reserved = [];
    for (const name of names) {
        const location = locations[name];
        if (location.is_unlocked) continue;
        locked++;
        if (granted.has(name)) continue;

        const holds = [
            ...(location.dialogues || []),
            ...(location.traders || []),
            ...Object.keys(location.actions || {}),
            ...Object.keys(location.activities || {}),
            ...Object.keys(location.housing || {}),
        ];
        if (holds.length === 0) {
            //Reserved and empty. Nothing is lost by it being shut.
            reserved.push(name);
            continue;
        }

        error(`nothing in the game unlocks the location "${name}", and it does not start `
            + `unlocked, and it holds ${holds.length} thing(s) - ${holds.slice(0, 4).join(", ")}`
            + `${holds.length > 4 ? ", …" : ""}. None of that can be reached by anybody.`);
    }

    console.log(`[check] location unlocks: ${names.length} location(s), ${locked} locked at `
        + `the start, each of those either granted by something or empty`
        + `${reserved.length ? ` (${reserved.length} reserved and empty: ${reserved.join(", ")})` : ""}`);
}

/**
 * An activity that names its hours also names its seasons.
 *
 * Both branches of the availability test in main.js end in the same line:
 *
 *     if(!selected_activity.availability_seasons?.includes(...)) { return false; }
 *
 * so an activity with `availability_time` and no `availability_seasons` is refused at every
 * hour of every day, for ever - while `display.js` goes on writing "available from 20 to 6"
 * into its tooltip. The player is told when to come back and is turned away when they do.
 *
 * Nothing else can see it. The constructor is happy, the build is happy, and the only symptom
 * is an activity that never works, which reads exactly like an activity nobody has unlocked.
 * The town square's night watch (P-36) is the first thing in the game to use the wrap-around
 * branch at all, and writing it without the season list would have shipped precisely this.
 *
 * The other direction is fine: seasons without hours is a summer job, and that works.
 */
async function check_a_timed_activity_can_ever_be_started() {
    const [locations_module] = await load_browser_free(repo_root, ["src/data/locations.js"]);

    let timed = 0;
    let through_the_night = 0;
    for (const [name, place] of Object.entries(locations_module.locations)) {
        for (const [key, activity] of Object.entries(place.activities || {})) {
            if (!activity.availability_time) continue;
            timed++;
            if (activity.availability_time.end <= activity.availability_time.start) {
                through_the_night++;
            }
            if (!activity.availability_seasons?.length) {
                error(`"${name}/${key}" is available from ${activity.availability_time.start} `
                    + `to ${activity.availability_time.end} and names no seasons. Every branch `
                    + `of the availability check ends in availability_seasons.includes(...), `
                    + `so it can never be started at all - and its tooltip still advertises `
                    + `the hours.`);
            }
        }
    }

    if (timed === 0) {
        error("no activity declares hours at all - this check is out of date.");
        return;
    }

    console.log(`[check] timed activities: ${timed} with hours, ${through_the_night} running `
        + `through the night, each naming its seasons`);
}

export {
    check_every_quest_can_be_started,
    check_every_location_can_be_unlocked,
    check_a_timed_activity_can_ever_be_started,
};
