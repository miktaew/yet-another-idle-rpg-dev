/** A visible quest task tells the player how, not only what. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";
import { braced_body, strip_comments } from "../lib/source.mjs";

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

export {
    check_hints_say_when_they_cannot_point,
    check_visible_tasks_can_be_finished,
};
