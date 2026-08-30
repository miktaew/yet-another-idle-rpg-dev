/**
 * Merge the quest progress of an older save into a newer one.
 *
 *     node scripts/restore-quests.js <newer-save.txt> <older-save.txt> [out.txt]
 *
 * Why this exists: between two exports on 2026-08-30 a save came back with its quest
 * block flattened - every quest is_active false, is_finished false, task_status empty -
 * while the rest of the character was intact. The bug that did it is fixed and the
 * round-trip is clean again, but a save written while it was live carries the loss
 * forward, and replaying the older export would give up everything earned since.
 *
 * The merge NEVER takes progress away. For each quest:
 *
 *   is_finished   true in either save wins
 *   is_active     true in either save wins, unless it is already finished
 *   task_status   index by index, true wins
 *
 * so running it against a healthy pair is a no-op, and running it twice changes
 * nothing the first run did not.
 *
 * task_status is positional, and quests have gained tasks since. The array is matched
 * against the CURRENT definition rather than either save: extra entries are dropped and
 * missing ones are filled with false, so a restored quest cannot claim a task that no
 * longer exists or leave the game reading past the end of its own list.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { load_browser_free } from "../tests/lib/browser-free-src.mjs";

const repo_root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** The save is UTF-8 bytes, base64-encoded - see to_base64 in src/save_load.js. */
function decode(file) {
    const raw = fs.readFileSync(file, "utf8").trim();
    const bytes = Buffer.from(raw, "base64");
    return JSON.parse(new TextDecoder().decode(bytes));
}

function encode(save) {
    return Buffer.from(new TextEncoder().encode(JSON.stringify(save))).toString("base64");
}

const [, , newer_path, older_path, out_path] = process.argv;
if (!newer_path || !older_path) {
    console.error("usage: node scripts/restore-quests.js <newer-save.txt> <older-save.txt> [out.txt]");
    process.exit(2);
}

const newer = decode(newer_path);
const older = decode(older_path);

if (!newer.quests || !older.quests) {
    console.error("one of those saves has no quest block at all; nothing to merge.");
    process.exit(1);
}

//How many tasks each quest actually has today, so a restored array cannot outlive them.
const quests_module = await load_browser_free(repo_root, "src/quests.js");
const task_count = {};
for (const [key, quest] of Object.entries(quests_module.quests)) {
    task_count[key] = (quest.quest_tasks ?? []).length;
}

let restored_finished = 0, restored_active = 0, restored_tasks = 0, skipped = 0;
for (const key of Object.keys(newer.quests)) {
    const now = newer.quests[key];
    const then = older.quests[key];
    if (!then) continue;
    //A quest the game no longer defines is left exactly as it was found.
    if (!(key in task_count)) { skipped++; continue; }

    if (!now.is_finished && then.is_finished) {
        now.is_finished = true;
        restored_finished++;
    }
    if (!now.is_active && then.is_active && !now.is_finished) {
        now.is_active = true;
        restored_active++;
    }

    const width = task_count[key];
    const merged = [];
    for (let i = 0; i < width; i++) {
        merged.push(Boolean((now.task_status ?? [])[i]) || Boolean((then.task_status ?? [])[i]));
    }
    const before = JSON.stringify(now.task_status ?? []);
    if (JSON.stringify(merged) !== before) restored_tasks++;
    now.task_status = merged;
}

const out = out_path ?? newer_path.replace(/\.txt$/, "") + " gorevler-geri.txt";
fs.writeFileSync(out, encode(newer), "utf8");

const finished = k => Object.keys(k.quests).filter(q => k.quests[q].is_finished).length;
console.log(`[restore] finished quests: ${finished(older)} in the older save, `
    + `${finished(newer)} after the merge`);
console.log(`[restore] restored ${restored_finished} finished, ${restored_active} active, `
    + `${restored_tasks} task lists${skipped ? `; ${skipped} quest(s) no longer defined, left alone` : ""}`);
console.log(`[restore] written to ${out}`);
