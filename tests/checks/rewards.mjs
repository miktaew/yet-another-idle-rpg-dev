/** Rewards and requirements: the keys they may use, and what they spend. */

import * as fs from "node:fs";
import * as path from "node:path";
import { braced_body, source_files, strip_comments, top_level_keys } from "../lib/source.mjs";
import { error } from "../lib/report.mjs";
import { load_generated_item_templates } from "../lib/generated-items.mjs";
import { repo_root } from "../lib/context.mjs";
import { declared_item_keys } from "../lib/item-keys.mjs";

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
/*
    Top-level `key: value` entries of an object literal body, and the top-level members of
    an array literal body. Both split on commas at depth zero.

    top_level_keys is line-oriented and returns one key per line, which is why the first
    version of the rolled-reward rule below could not fail: a group written
    `rewards: {items: [...], flags: [...]}` on one line reported only `items`, so the
    unlock kind planted in a negative test went straight through. Found by planting it.
*/
function split_top_level(body) {
    const parts = [];
    let depth = 0;
    let start = 0;

    for (let i = 0; i < body.length; i++) {
        const character = body[i];
        if ("{[(".includes(character)) { depth++; }
        else if ("}])".includes(character)) { depth--; }
        else if (character === "," && depth === 0) {
            parts.push(body.slice(start, i));
            start = i + 1;
        }
    }
    parts.push(body.slice(start));
    return parts.map((part) => part.trim()).filter(Boolean);
}

/** The `key: value` pairs of an object literal body, nested commas ignored. */
function entries_of(body) {
    const entries = [];
    for (const part of split_top_level(body)) {
        const match = /^(\w+)\s*:\s*([\s\S]*)$/.exec(part);
        if (match) { entries.push({ key: match[1], value: match[2].trim() }); }
    }
    return entries;
}

/*
    Read out of main.js rather than written down, which the comment above already claimed
    and the list did not do. It was hand-maintained, so two reward kinds added in the same
    change as this comment were rejected as unknown - the same shape as
    reachable_item_names() being documented as shared while having one caller.

    `rewards.<key>`, not `<something>.rewards`, so `book.rewards` and `action.rewards` do
    not leak in. A floor is asserted below, because a scan that finds nothing would
    otherwise accept every key there is.
*/
function reward_keys_read_by_main() {
    const source = strip_comments(
        fs.readFileSync(path.join(repo_root, "src/main.js"), "utf8"));
    return [...new Set([...source.matchAll(/(?<![.\w])rewards\.(\w+)/g)]
        .map((match) => match[1]))].sort();
}

/*
    And the kinds a rolled reward group may hold: the ones the LOAD PATH skips.

    A finished book re-applies its rewards on every load with only_unlocks and
    is_from_loading both set, so a kind guarded by EITHER flag is skipped then and is safe
    to roll. Everything else is state that load path re-applies, and a rolled outcome must
    not be state: it would be re-rolled on every load, granted once and missing the next
    time, with nothing failing.

    Both flags, because reading only one of them called `messages` unsafe - it is guarded
    by !is_from_loading rather than !only_unlocks, and a log line is exactly the kind of
    thing a rolled group wants. Derived from main.js for the same reason as the list above.
*/
function reward_keys_not_reapplied_on_load() {
    const source = strip_comments(
        fs.readFileSync(path.join(repo_root, "src/main.js"), "utf8"));
    return new Set([...source.matchAll(/if\s*\(rewards\.(\w+)[^)]*?!(?:only_unlocks|is_from_loading)/g)]
        .map((match) => match[1]));
}

const reward_keys = reward_keys_read_by_main();

const lock_keys = ["actions", "dialogues", "locations", "quests", "textlines", "traders"];

function check_reward_keys() {
    if (reward_keys.length < 20) {
        error(`only ${reward_keys.length} reward keys could be read out of main.js `
            + `- the scan is out of date and would accept anything.`);
        return;
    }

    const rollable = reward_keys_not_reapplied_on_load();
    if (rollable.size === 0) {
        error("no reward kind is guarded by !only_unlocks or !is_from_loading in "
            + "main.js - "
            + "the rolled-reward rule below cannot be checked.");
    }

    let blocks = 0;
    let rolled = 0;
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

            /*
                A rolled group may only hold what the load path does not re-apply. See
                reward_keys_not_reapplied_on_load: anything else would be granted or not
                depending on a die roll every time a save is loaded.

                Every group is read on its own rather than the whole array at once, and
                its keys are split on top-level commas rather than by line - both because
                the first version of this rule did neither and so could not fail either of
                the two negative tests written for it.
            */
            for (const opening of body.matchAll(/chance_of:\s*\[/g)) {
                let depth = 0;
                let close = -1;
                for (let i = opening.index + opening[0].length - 1; i < body.length; i++) {
                    if (body[i] === "[") { depth++; }
                    else if (body[i] === "]") {
                        depth--;
                        if (depth === 0) { close = i; break; }
                    }
                }
                if (close === -1) {
                    error(`${file} has a chance_of that never closes - this check is out `
                        + `of date.`);
                    continue;
                }

                const groups = split_top_level(
                    body.slice(opening.index + opening[0].length, close));
                if (groups.length === 0) {
                    error(`${file} has an empty chance_of, which rolls nothing.`);
                    continue;
                }

                for (const group of groups) {
                    rolled++;
                    const fields = entries_of(group.replace(/^\{/, "").replace(/\}$/, ""));
                    const chance = fields.find((field) => field.key === "chance");
                    const nested = fields.find((field) => field.key === "rewards");

                    if (!chance) {
                        error(`${file} has a rolled reward group that names no chance, so `
                            + `it rolls against undefined and never happens: `
                            + `\`${group.replace(/\s+/g, " ").slice(0, 70)}\`.`);
                    }
                    if (!nested) {
                        error(`${file} has a rolled reward group with no rewards in it: `
                            + `\`${group.replace(/\s+/g, " ").slice(0, 70)}\`.`);
                        continue;
                    }

                    for (const field of entries_of(
                        nested.value.replace(/^\{/, "").replace(/\}$/, ""))) {
                        if (!rollable.has(field.key)) {
                            error(`${file} rolls a reward group holding "${field.key}", `
                                + `which the load path does not skip - so a finished `
                                + `book's load path re-applies it and the roll would be `
                                + `repeated on every load, granted once and missing the `
                                + `next time. A rolled reward may only hold `
                                + `${[...rollable].sort().join(", ")}.`);
                        }
                    }
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
    console.log(`[check] reward objects: ${blocks} checked, ${reward_keys.length} keys read `
        + `from main.js, ${rolled} rolled group(s) holding only what a load skips`);
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
    const known = new Set(declared_item_keys(repo_root));

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
/**
 * A rolled reward set whose likeliest outcome is nothing.
 *
 * P-35, from the owner one version after the mechanism shipped: every chest gave the same
 * wool scarf. The pool was two items at 35% and 25%, so the scarf was 1.4 per dagger -
 * and, measured, **41% of opens gave nothing but the certain coin**, which was the largest
 * single outcome in the box. Repetitive and empty at once, and no adjustment of two
 * numbers fixes a pool of two things.
 *
 * That is checkable rather than a matter of taste: multiply the misses. If the chance of
 * every item-bearing group failing at once is larger than the chance of any one of them
 * hitting, the set's most likely result is that nothing came out of it, and the fix is a
 * wider pool rather than a bigger number.
 *
 * Only groups granting `items` or `money` count. A set of effects is allowed to be mostly
 * nothing - that is what a trap is - and a function-valued chance cannot be read
 * statically, so those are skipped and named in the count.
 */
function check_a_rolled_set_is_not_mostly_nothing() {
    let sets = 0;
    let skipped = 0;

    for (const relative of ["src/data/locations.js", "src/data/dialogues.js",
                            "src/quests.js"]) {
        const source = strip_comments(
            fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const opening of source.matchAll(/chance_of:\s*\[/g)) {
            let depth = 0;
            let close = -1;
            for (let i = opening.index + opening[0].length - 1; i < source.length; i++) {
                if (source[i] === "[") { depth++; }
                else if (source[i] === "]") {
                    depth--;
                    if (depth === 0) { close = i; break; }
                }
            }
            if (close === -1) continue;
            sets++;

            const chances = [];
            for (const group of split_top_level(
                source.slice(opening.index + opening[0].length, close))) {
                const fields = entries_of(group.replace(/^\{/, "").replace(/\}$/, ""));
                const chance = fields.find((field) => field.key === "chance");
                const nested = fields.find((field) => field.key === "rewards");
                if (!chance || !nested) continue;

                //A derived chance cannot be read here; it is counted, not guessed at.
                if (!/^[0-9.]+$/.test(chance.value)) { skipped++; continue; }
                if (!/(?:^|[{,\s])(?:items|money):/.test(nested.value)) continue;

                chances.push(Number(chance.value));
            }

            if (chances.length === 0) continue;

            const nothing = chances.reduce((together, one) => together * (1 - one), 1);
            const best = Math.max(...chances);

            if (nothing > best) {
                const line = source.slice(0, opening.index).split("\n").length;
                error(`${relative}:${line} rolls ${chances.length} group(s) that grant `
                    + `something, and they all miss ${(nothing * 100).toFixed(0)}% of the `
                    + `time - more often than the likeliest of them hits `
                    + `(${(best * 100).toFixed(0)}%). The most likely result is that `
                    + `nothing came out, which reads as empty however good the contents `
                    + `are. Widen the pool rather than raising a chance.`);
            }
        }
    }

    if (sets === 0) {
        error("nothing rolls a reward set - "
            + "check_a_rolled_set_is_not_mostly_nothing is out of date.");
        return;
    }

    console.log(`[check] rolled sets: ${sets} set(s), none of them likelier to give `
        + `nothing than something${skipped ? ` (${skipped} derived chance(s) skipped)` : ""}`);
}

export {
    check_a_rolled_set_is_not_mostly_nothing,
    check_money_requirements,
    check_nothing_stamps_a_template_quality,
    check_required_items,
    check_reward_keys,
};
