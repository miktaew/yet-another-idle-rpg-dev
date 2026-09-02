/** A visible quest task tells the player how, not only what. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";
import { braced_body, strip_comments } from "../lib/source.mjs";
import { load_browser_free } from "../lib/browser-free-src.mjs";

/**
 * A task the player can see has to be answerable.
 *
 * The journal builds a hint under each task from the content that advances it - a
 * dialogue line, a dialogue action, a location action, or a zone's clear rewards. When
 * a task has advancers the player has not found yet the hint says so without naming
 * them. When it has none at all there is no hint block, and the task stands there as a
 * name with nothing under it, which a player reported as "I know what to do and not
 * how".
 *
 * check_hidden_tasks_can_be_hinted covers tasks marked is_hidden. This is the other
 * half: a task that shows its own wording still needs a way to be finished.
 *
 * Two things legitimately count instead of an advancer, and both are checked for rather
 * than assumed:
 *
 *   - `task_condition`, which finishes the task from play itself - reaching a skill
 *     level, killing a number of something - with no content entry to index.
 *   - a quest marked `is_hidden` at the QUEST level, which never appears in the journal
 *     at all, so no task of it is ever shown to anybody. All three of the current cases
 *     are these: the swimming and climbing unlocks, which watch Running and
 *     Weightlifting and surface only as their reward.
 */
async function check_visible_tasks_can_be_finished() {
    const quests_path = path.join(repo_root, "src/quests.js");
    if (!fs.existsSync(quests_path)) {
        error("src/quests.js is missing - this check is out of date.");
        return;
    }
    const quests_source = strip_comments(fs.readFileSync(quests_path, "utf8"));
    const sources = ["src/data/dialogues.js", "src/data/locations.js"]
        .map(relative => strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8")))
        .join("\n");

    //Every quest_progress step the content grants, as "<quest>#<index>".
    const advanced = new Set();
    for (const match of sources.matchAll(/quest_id:\s*"([^"]+)"\s*,\s*task_index:\s*(\d+)/g)) {
        advanced.add(`${match[1]}#${match[2]}`);
    }

    let checked = 0;
    let exempt = 0;
    for (const quest of quests_source.matchAll(/quests\["([^"]+)"\]\s*=\s*new Quest\(\{/g)) {
        const open = quests_source.indexOf("{", quest.index + quest[0].length - 1);
        const body = braced_body(quests_source, open);
        if (body === null) continue;

        /*
            Quest-level is_hidden, read from the quest body BEFORE its task list, so a
            task's own is_hidden cannot be mistaken for the quest's. A hidden quest never
            reaches the journal, so none of its tasks is ever shown.
        */
        const first_task = body.indexOf("new QuestTask(");
        const header = first_task === -1 ? body : body.slice(0, first_task);
        if (/is_hidden:\s*true/.test(header)) {
            exempt++;
            continue;
        }

        //braced_body, not [^}]*: a task carrying items_from or a condition has nested
        //braces and the cheap pattern loses them.
        const tasks = [];
        for (const task of body.matchAll(/new QuestTask\(\{/g)) {
            const inner = braced_body(body, body.indexOf("{", task.index + task[0].length - 1));
            if (inner !== null) tasks.push(inner);
        }

        tasks.forEach((task, index) => {
            if (/is_hidden:\s*true/.test(task)) return;      //the other check's business
            if (/task_condition:/.test(task)) return;        //finished by play, not content
            checked++;
            if (advanced.has(`${quest[1]}#${index}`)) return;
            error(`"${quest[1]}" task ${index} is visible, has no task_condition, and nothing`
                + " in dialogues.js or locations.js advances it. The journal will show its name"
                + " with no hint under it, which leaves the player knowing what to do and not"
                + " how.");
        });
    }

    if (checked === 0) {
        error("no visible quest tasks found - this check is out of date.");
        return;
    }
    console.log(`[check] visible quest tasks: ${checked} answerable, ${exempt} hidden quests`
        + " skipped");
}


/**
 * A hint that has nowhere to point still says so.
 *
 * The journal builds a task's hint two different ways. A task that counts something -
 * kill ten of these, clear that - goes through `create_quest_hint`, which lists the
 * zones the target lives in. A task that counts nothing goes through
 * `create_quest_step_hint`, which lists what advances it. Both filter their list down
 * to places the player has actually found, and both can filter it to nothing.
 *
 * Only one of them said so. `create_quest_step_hint` was given an "it is elsewhere"
 * line for exactly this case, after a task standing with no line under it was reported
 * as "I know what to do and not how"; `create_quest_hint` was left returning null, so
 * the same state there renders a 0/10 with nothing beneath it.
 *
 * It has never been reachable: all five live `task_condition` blocks belong to hidden
 * quests, which never appear in the journal at all, so no visible task takes that path
 * today. That is precisely why it needed a check rather than a note - a gap nothing
 * exercises is a gap nobody notices, and the next arc adds quests.
 *
 * The rule is the one Q-6 settled for the language switch: name the places that must do
 * the thing, and fail when one of them stops. Both builders must reach the shared
 * `create_hint_elsewhere_line`, and the locale id must live only inside it, so a third
 * hint path cannot quietly grow its own copy or go without.
 */
async function check_hints_say_when_they_cannot_point() {
    const display_path = path.join(repo_root, "src/display.js");
    if (!fs.existsSync(display_path)) {
        error("src/display.js is missing - this check is out of date.");
        return;
    }
    const source = strip_comments(fs.readFileSync(display_path, "utf8"));

    const helper = "create_hint_elsewhere_line";
    if (!source.includes(`function ${helper}(`)) {
        error(`src/display.js has no ${helper}. Both quest hint builders fall back through`
            + " it when nothing they could point at has been found yet.");
        return;
    }

    for (const builder of ["create_quest_hint", "create_quest_step_hint"]) {
        const found = source.match(new RegExp(`function ${builder}\\s*\\([^)]*\\)\\s*\\{`));
        if (!found) {
            error(`src/display.js has no ${builder} - this check is out of date.`);
            continue;
        }
        const body = braced_body(source, source.indexOf("{", found.index + found[0].length - 1));
        if (body === null) {
            error(`could not read the body of ${builder} - this check is out of date.`);
            continue;
        }
        if (!body.includes(`${helper}(`)) {
            error(`${builder} filters its list down to what the player has found and can end`
                + ` up with nothing, and it does not call ${helper}. The task would render`
                + " with no line under it, which is the state that was reported as knowing"
                + " what to do and not how.");
        }
    }

    /*
        The id itself, not just the helper: an inlined second copy would pass the test
        above while putting the wording back in two places, which is how the two paths
        drifted apart the first time.
    */
    const id = "ui quest hint elsewhere";
    const uses = source.split(`"${id}"`).length - 1;
    if (uses !== 1) {
        error(`"${id}" is written ${uses} times in src/display.js. It belongs only inside`
            + ` ${helper}, so every hint path says it the same way.`);
    }

    console.log("[check] quest hints: 2 builders fall back through one elsewhere line");
}


/**
 * Out-of-order quest progress is filled in, not dropped.
 *
 * The bug this is the net under stalled a quest for good, and it needed three things to
 * line up - which is why the fix is at the engine and the net is here rather than on one
 * quest:
 *
 *   1. `read the ground` at The plains grants task 2 of "No Snakes Go to the Plains";
 *   2. task 1 is granted by CLEARING the Old hunting ground, so the two can be done either
 *      way round;
 *   3. the action is not repeatable, so `finish_game_action` locks it on success and
 *      processes its rewards afterwards.
 *
 * Read the ground first and the grant was discarded - tasks run in order, and only the next
 * one could advance - by which time the action that was its only granter had locked itself.
 * The only trace was a `console.warn`. Measured in the owner's export: the action
 * `is_finished`, the task `{progress:{}}`, and a hundred laps of the swamp changing nothing.
 *
 * `tasks_to_finish` is the rule, and it is pure so both ends can be driven here: content
 * asserting task 3 is done asserts 1 and 2 as well, because the player cannot have read the
 * ground without walking onto the plains.
 */
async function check_out_of_order_quest_progress_is_not_dropped() {
    const [quests_module] = await load_browser_free(repo_root, ["src/quests.js"]);
    const {tasks_to_finish} = quests_module;

    if (typeof tasks_to_finish !== "function") {
        error("tasks_to_finish is not where this expects it - "
            + "check_out_of_order_quest_progress_is_not_dropped is out of date.");
        return;
    }

    const cases = [
        {what: "the next task, which always worked",
         ask: {completed: 0, task_index: 0, total: 4}, want: [0]},
        {what: "a task two ahead, which used to be dropped and stalled the quest",
         ask: {completed: 1, task_index: 2, total: 4}, want: [1, 2]},
        {what: "the last task from nothing, which finishes the quest",
         ask: {completed: 0, task_index: 3, total: 4}, want: [0, 1, 2, 3]},
        //Falls out of the loop rather than out of a guard - see the note in quests.js.
        {what: "a task behind the count, which a repeatable reward re-grants for ever",
         ask: {completed: 3, task_index: 1, total: 4}, want: []},
        {what: "the task the count is already on, which must not be finished twice",
         ask: {completed: 2, task_index: 2, total: 4}, want: [2]},
        {what: "a task index past the end",
         ask: {completed: 0, task_index: 9, total: 4}, want: []},
        {what: "a task index that is not a number",
         ask: {completed: 0, task_index: undefined, total: 4}, want: []},
        {what: "a negative task index",
         ask: {completed: 0, task_index: -1, total: 4}, want: []},
    ];

    for (const {what, ask, want} of cases) {
        const got = tasks_to_finish(ask);
        if (JSON.stringify(got) === JSON.stringify(want)) continue;
        error(`quest progress for ${what}: tasks_to_finish returned `
            + `${JSON.stringify(got)} and should have returned ${JSON.stringify(want)}.`);
    }

    console.log(`[check] quest progress: ${cases.length} case(s), gaps filled rather than `
        + `dropped`);
}

/**
 * A quest stalled by a locked action is repaired on load.
 *
 * The engine fix stops this happening again; it does nothing for a save where it already
 * has, and that save cannot recover by playing - the action is gone, and the repeatable
 * reward that grants the earlier task is now behind the count and dropped in its turn.
 *
 * So the repair asserts what a finished action means: its rewards were earned. This drives
 * it against the exact state measured in the owner's export, and then against the same
 * world with nothing wrong, because a repair that fires when nothing is broken would hand
 * out quest progress on every load.
 */
async function check_a_stalled_quest_is_repaired_on_load() {
    const [repairs, locations_module, dialogues_module, quests_module] =
        await load_browser_free(repo_root, ["src/save_repairs.js", "src/data/locations.js",
            "src/data/dialogues.js", "src/quests.js"]);
    const {quest_progress_missed_by_finished_actions} = repairs;
    const {locations} = locations_module;
    const {dialogues} = dialogues_module;
    const {quests} = quests_module;

    if (typeof quest_progress_missed_by_finished_actions !== "function") {
        error("the quest repair is not where this expects it - "
            + "check_a_stalled_quest_is_repaired_on_load is out of date.");
        return;
    }

    /*
        First: an UNfinished action must owe nothing even when its quest is active and its
        task is open. Asking this of a freshly built world was the first version and could
        not fail - nothing is finished there and no quest is active either, so removing
        either guard left the other one holding. This stages the quest and leaves the action
        alone, which tests the is_finished guard by itself.
    */
    let sample = null;
    for (const [key, location] of Object.entries(locations)) {
        for (const [action_key, action] of Object.entries(location?.actions ?? {})) {
            for (const grant of action?.rewards?.quest_progress ?? []) {
                if (!quests[grant?.quest_id]?.quest_tasks?.[grant?.task_index]) continue;
                sample = {action, grant, where: `${key} / ${action_key}`};
                break;
            }
            if (sample) break;
        }
        if (sample) break;
    }
    if (sample === null) {
        error("no location action grants quest progress, so this check cannot stage "
            + "anything.");
        return;
    }

    const sample_quest = quests[sample.grant.quest_id];
    const sample_was_active = sample_quest.is_active;
    const sample_was_finished = sample.action.is_finished;
    sample_quest.is_active = true;
    sample_quest.quest_tasks[sample.grant.task_index].is_finished = false;
    sample.action.is_finished = false;

    const quiet = quest_progress_missed_by_finished_actions({locations, dialogues, quests});
    const wrongly_owed = quiet.filter(entry => entry.quest_id === sample.grant.quest_id
        && entry.task_index === sample.grant.task_index);

    sample_quest.is_active = sample_was_active;
    sample.action.is_finished = sample_was_finished;

    if (wrongly_owed.length !== 0) {
        error(`the repair says ${sample.where} owes "${sample.grant.quest_id}" task `
            + `${sample.grant.task_index} while that action is NOT finished. Progress the `
            + `player has not earned would be granted on every load.`);
    }

    /*
        Then the measured state: an action finished whose quest progress never landed. Any
        such pair will do, so it is found rather than named - the check outlives the one
        quest it was written for.
    */
    let staged = null;
    for (const [key, location] of Object.entries(locations)) {
        for (const [action_key, action] of Object.entries(location?.actions ?? {})) {
            for (const grant of action?.rewards?.quest_progress ?? []) {
                const quest = quests[grant?.quest_id];
                if (!quest?.quest_tasks?.[grant?.task_index]) continue;
                staged = {action, quest, grant, where: `${key} / ${action_key}`};
                break;
            }
            if (staged) break;
        }
        if (staged) break;
    }
    if (staged === null) {
        error("no location action grants quest progress, so this check cannot stage the "
            + "state it exists for.");
        return;
    }

    const was_finished = staged.action.is_finished;
    const was_active = staged.quest.is_active;
    staged.action.is_finished = true;
    staged.quest.is_active = true;
    staged.quest.quest_tasks[staged.grant.task_index].is_finished = false;

    const owed = quest_progress_missed_by_finished_actions({locations, dialogues, quests});
    const found = owed.some(entry => entry.quest_id === staged.grant.quest_id
        && entry.task_index === staged.grant.task_index);

    staged.action.is_finished = was_finished;
    staged.quest.is_active = was_active;

    if (!found) {
        error(`${staged.where} is finished and "${staged.grant.quest_id}" task `
            + `${staged.grant.task_index} is not, and the repair does not report it. A save `
            + `in that state cannot recover by playing: the action has locked itself, so `
            + `nothing can ever grant that task again.`);
    }

    console.log(`[check] quest repair: silent on a clean world, and finds a stalled task `
        + `staged at ${staged.where}`);
}

export {
    check_out_of_order_quest_progress_is_not_dropped,
    check_a_stalled_quest_is_repaired_on_load,
    check_hints_say_when_they_cannot_point,
    check_visible_tasks_can_be_finished,
};
