/** Rewards and requirements: the keys they may use, and what they spend. */

import * as fs from "node:fs";
import * as path from "node:path";
import { braced_body, source_files, strip_comments, top_level_keys } from "../lib/source.mjs";
import { error } from "../lib/report.mjs";
import { load_generated_item_templates } from "../lib/generated-items.mjs";
import { repo_root } from "../lib/context.mjs";

/**
 * Every money requirement in the content must use the spendable object form.
 *
 * The gate accepts a bare number too, but a bare number can never be charged - the
 * removal in main.js only fires for the object form, and it reads
 * remove_on_success / remove_on_fail on an action's `required` and `remove` on its
 * `conditions`. A price written as a bare number would therefore gate correctly and
 * silently cost nothing, which is the same class of failure as the bug this
 * mechanism was fixed for: a check that passes while nothing happens.
 *
 * Nothing required money before quest 4, so this starts with one site to protect.
 */
const money_removal_flags = ["remove", "remove_on_success", "remove_on_fail"];

function check_money_requirements() {
    let checked = 0;
    for (const file of ["src/data/dialogues.js", "src/data/locations.js"]) {
        const full_path = path.join(repo_root, file);
        if (!fs.existsSync(full_path)) {
            error(`${file} is missing - this check is out of date.`);
            continue;
        }
        const source = strip_comments(fs.readFileSync(full_path, "utf8"));

        /*
            Only inside a requirement: a bare `money:` elsewhere is a REWARD, which is
            a plain number by design and must not be caught here.

            The requirement's extent is brace-matched rather than assumed. It used to
            end at the first `\n` + sixteen spaces + `}`, which is not the end of a
            requirement - it is the end of whatever object happened to be nested one
            level inside it. A requirement written with its contents inline, as
            `reputation: {Slums: 100},`, has no such line, so the scan ran on into the
            rewards below and reported a reward of 400 money as an uncharged price.
        */
        for (const start of source.matchAll(/(?:required|conditions):\s*\[?\s*\{/g)) {
            const open = source.indexOf("{", start.index + start[0].length - 1);
            const body = braced_body(source, open);
            if (body === null) continue;
            // The braced alternative comes first, or the bare one truncates the
            // object at its first comma and loses the removal flag.
            const money = body.match(/(?<![A-Za-z0-9_])money:\s*(\{[^}]*\}|[^,\n]+)/);
            if (!money) continue;
            checked++;

            const value = money[1].trim();
            if (!value.startsWith("{")) {
                error(`${file} requires money as a bare value (${value}); a requirement that`
                    + " should be paid needs the object form, or it gates correctly and costs"
                    + " nothing.");
                continue;
            }
            const amount = value.match(/number:\s*(-?[\d.]+)/);
            if (!amount || !(Number(amount[1]) > 0)) {
                error(`${file} has a money requirement whose number is ${amount?.[1]};`
                    + " it must be a positive amount.");
            }
            if (!money_removal_flags.some(flag => value.includes(flag + ":"))) {
                error(`${file} has a money requirement with no removal flag; add one of`
                    + ` ${money_removal_flags.join(", ")}, or the price is never charged.`);
            }
        }
    }
    console.log(`[check] money requirements: ${checked} checked`);
}

/**
 * Every key inside a `rewards: { ... }` must be one process_rewards actually reads.
 *
 * A reward key nobody reads is silent: the content looks like it grants something,
 * the game grants nothing, and no check notices. That is not hypothetical - the
 * forest lake's deep dive rewarded `action: [...]` singular, which is not a key, so
 * unlocking the game's only silver tap did nothing for as long as it existed. The
 * author's note beside it read "locked as the reward doesn't really have any uses
 * yet", and it was half right for the wrong reason.
 *
 * The list is taken from what main.js reads, not from the schema in
 * src/rewards.js - that document is missing `global_activities` and `skills`, so
 * trusting it would reject two working keys.
 */
const reward_keys = [
    "actions", "activities", "crafting", "dialogues", "flags", "global_activities",
    "housing", "items", "locations", "locks", "messages", "money", "move_to",
    "quest_progress", "quests", "recipes", "reputation", "skill_xp", "skills",
    "stances", "textlines", "traders", "xp",
];

const lock_keys = ["actions", "dialogues", "locations", "quests", "textlines", "traders"];

function check_reward_keys() {
    let blocks = 0;
    for (const file of ["src/data/locations.js", "src/data/dialogues.js", "src/quests.js", "src/enemies.js"]) {
        const full_path = path.join(repo_root, file);
        if (!fs.existsSync(full_path)) {
            error(`${file} is missing - this check is out of date.`);
            continue;
        }
        const source = strip_comments(fs.readFileSync(full_path, "utf8")).split("\r\n").join("\n");

        for (const match of source.matchAll(/(?:rewards|first_reward|repeatable_reward):\s*\{/g)) {
            const open = match.index + match[0].length - 1;
            const body = braced_body(source, open);
            if (body === null) {
                error(`${file} has a reward object that never closes - this check is out of date.`);
                continue;
            }
            blocks++;

            for (const key of top_level_keys(body)) {
                if (!reward_keys.includes(key)) {
                    error(`${file} has a reward key "${key}", which nothing reads.`
                        + ` Valid keys: ${reward_keys.join(", ")}.`);
                }
            }

            const locks = body.match(/(?<![A-Za-z0-9_])locks:\s*\{/);
            if (locks) {
                const lock_body = braced_body(body, locks.index + locks[0].length - 1);
                for (const key of top_level_keys(lock_body ?? "")) {
                    if (!lock_keys.includes(key)) {
                        error(`${file} has a lock key "${key}", which nothing reads.`
                            + ` Valid keys: ${lock_keys.join(", ")}.`);
                    }
                }
            }
        }
    }
    if (blocks === 0) {
        error("found no reward objects to check - this check is out of date.");
    }
    console.log(`[check] reward objects: ${blocks} checked`);
}

/**
 * Every item id named by a requirement has to be a real template.
 *
 * `items_by_id` is how actions charge the player in goods, and a typo there is
 * silent in the worst way: process_conditions looks for an id nothing has, finds
 * nothing, and the action can never be begun. The player sees a delivery they can
 * never satisfy while holding a full inventory of the thing.
 *
 * Generated templates count, so this asks the generator rather than only grepping.
 */
async function check_required_items() {
    const source_items = fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8");
    const known = new Set([...strip_comments(source_items)
        .matchAll(/item_templates\["([^"]+)"\]\s*=\s*new /g)].map(match => match[1]));

    const { generated, problem } = await load_generated_item_templates(repo_root);
    if (problem) {
        error(`${problem} - this check is out of date.`);
    }
    for (const key of Object.keys(generated ?? {})) { known.add(key); }

    let checked = 0;
    for (const file of ["src/data/locations.js", "src/data/dialogues.js"]) {
        const full_path = path.join(repo_root, file);
        if (!fs.existsSync(full_path)) {
            error(`${file} is missing - this check is out of date.`);
            continue;
        }
        const source = strip_comments(fs.readFileSync(full_path, "utf8"));

        for (const block of source.matchAll(/items_by_id:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g)) {
            for (const entry of block[1].matchAll(/"([^"]+)"\s*:/g)) {
                checked++;
                if (!known.has(entry[1])) {
                    error(`${file} requires item "${entry[1]}", which is not a template.`
                        + " The requirement can never be satisfied, so the action can never begin.");
                }
            }
        }
    }
    console.log(`[check] required items: ${checked} checked`);
}

/**
 * Nothing may write a quality onto an item template.
 *
 * Templates in item_templates are shared singletons, and getInventoryKey() caches into
 * this.inventory_key. So a stamped quality is invisible to the key - which is what an
 * inventory is addressed by - and permanent for every later reader of the template.
 * process_rewards did exactly this, and the five starter weapons the smith hands out
 * asked for quality 50 and arrived at 100.
 *
 * The way to grant a quality is a fresh item: getItem({...template, quality}), whose
 * constructor recomputes the key. That is what InventoryHaver.add_to_inventory does.
 *
 * Only variables the same file takes out of item_templates are considered, so a plain
 * key object or a constructor's own `this.quality` is not a finding.
 */
function check_nothing_stamps_a_template_quality() {
    let scanned = 0;

    for (const relative of source_files(repo_root, "src")) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        //Names this file takes out of the registry: `const x = item_templates[...]`,
        //`x = item_templates[...]`, destructuring is not used for this anywhere.
        const from_registry = new Set();
        for (const match of source.matchAll(
                /(?:const|let|var)?\s*(\w+)\s*=\s*item_templates\s*\[/g)) {
            from_registry.add(match[1]);
        }
        if (from_registry.size === 0) {
            continue;
        }
        scanned++;

        for (const match of source.matchAll(/(\w+)\.quality\s*=(?!=)/g)) {
            if (!from_registry.has(match[1])) {
                continue;
            }
            const line = source.slice(0, match.index).split("\n").length;
            error(`${relative}:${line} writes a quality onto "${match[1]}", which is an`
                + ` item template. The key is already cached, so the quality would not reach`
                + ` it, and the template is shared. Build a fresh item instead:`
                + ` getItem({...template, quality}).`);
        }
    }

    if (scanned < 4) {
        error(`only ${scanned} files read item_templates - this check is out of date.`);
        return;
    }

    console.log(`[check] no template qualities stamped: ${scanned} files read the registry`);
}
export {
    check_money_requirements,
    check_nothing_stamps_a_template_quality,
    check_required_items,
    check_reward_keys,
};
