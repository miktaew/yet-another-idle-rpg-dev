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

export {
    check_visible_tasks_can_be_finished,
};
