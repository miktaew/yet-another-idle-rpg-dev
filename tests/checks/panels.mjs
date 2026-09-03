/** Panels and the state they show. */

import * as fs from "node:fs";
import * as path from "node:path";
import { repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { source_files, strip_comments } from "../lib/source.mjs";

const FUNCTION_HEAD =
    /(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s*)?(?:function)?\s*\([^)]*\)\s*(?:=>)?\s*\{)/g;

/**
 * The brace that opens a function's BODY, found by walking past its parameter list.
 *
 * `function process_rewards({rewards = {}, ...})` and `add_reputation: ({region}) => {` both
 * put a brace inside the parentheses, so "the next `{` after the name" lands in the middle of
 * the arguments and gives the function a span ending before its own first statement. Every
 * write inside it then belongs to whichever function came before.
 */
function body_brace(source, from) {
    const paren = source.indexOf("(", from);
    if (paren === -1) return -1;
    let depth = 0;
    for (let i = paren; i < source.length; i++) {
        if (source[i] === "(") depth++;
        else if (source[i] === ")") {
            depth--;
            if (depth === 0) return source.indexOf("{", i);
        }
    }
    return -1;
}

/** Every named function in src/, with the span it actually covers. */
function read_functions() {
    const sources = new Map();
    const spans = new Map();
    for (const relative of source_files(repo_root)) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));
        sources.set(relative, source);

        const found = [];
        for (const m of source.matchAll(FUNCTION_HEAD)) {
            const open = body_brace(source, m.index);
            if (open === -1) continue;
            let depth = 0;
            for (let i = open; i < source.length; i++) {
                if (source[i] === "{") depth++;
                else if (source[i] === "}") {
                    depth--;
                    if (depth === 0) {
                        found.push({name: m[1] ?? m[2], start: m.index,
                                    body: source.slice(m.index, i + 1)});
                        break;
                    }
                }
            }
        }
        spans.set(relative, found);
    }
    return {sources, spans};
}

/*
    A function that puts something on screen. `create_new_bestiary_entry` belongs here as
    much as `update_bestiary_entry_killcount` does - it builds the entry and appends it -
    and leaving it out made a first kill look like a count written after its panel was
    drawn, when the panel does not exist until that call makes it. The `_content` builders
    are here for the same reason: create_bestiary_entry_content is the function that writes
    the kill counter into the entry it is building.
*/
const is_drawer = (name) =>
    /^(update_displayed_|update_bestiary_|update_booklist_|refresh_|create_new_\w+_entry|create_\w+_content)/
        .test(name);

/*
    Written before the state it shows, by design: both fill everything in and then draw
    everything, so the order inside them says nothing.
*/
const draws_everything_afterwards = new Set([
    "load", "start_game", "create_character",
    /*
        And the developer console, which is not a path a player takes. Setting a flag from
        the console without redrawing a panel is a developer's problem for the moment they
        are in, not a fault in the game - see docs/DEV_CONSOLE.md.
    */
    "enable_dev_console", "set_flag",
]);

/**
 * A panel is never redrawn just before the value it shows changes.
 *
 * The owner asked whether the panels update when the thing they show changes (P-37), and
 * this is the half of that question a static check can answer honestly. Reachability - "is a
 * redraw called somewhere on this path" - cannot: it says nothing about **order**, and a
 * panel rebuilt just before the value changes is a panel showing the old value with a redraw
 * on the path to prove it is fine.
 *
 * That is exactly what `unlock_location` did. It rebuilt the player's location - which draws
 * the fast travel list from `unlocked_beds` - and registered the newly unlocked bed on the
 * line after, so the bed was missing from the list until something else happened to redraw
 * it. Every reachability measure called that path warm.
 *
 * **The pairing is derived, not written down here, and that is deliberate.** Six hand-written
 * pairs produced six false alarms while this was being worked out: the bestiary paired with
 * the combat enemy list, the effect registry with the stat bonus table, a new game's starting
 * purse read as a stray write. A table of pairs encodes the mistakes of whoever writes it, so
 * the panels are asked what they read instead.
 */
function check_a_panel_is_not_redrawn_before_the_value_changes() {
    const {sources, spans} = read_functions();

    //What each panel reads, asked of the panels.
    const state = new Map();
    const registries = ["enemy_killcount", "item_log", "active_effects", "titles",
                        "global_flags", "unlocked_beds"];
    for (const [, found] of spans) {
        for (const f of found) {
            if (!is_drawer(f.name)) continue;
            for (const m of f.body.matchAll(/(?<![.\w])character\.(\w+)/g)) {
                const key = `character.${m[1]}`;
                if (!state.has(key)) state.set(key, new Set());
                state.get(key).add(f.name);
            }
            for (const name of registries) {
                if (!new RegExp(`(?<![.\\w])${name}(?![\\w])`).test(f.body)) continue;
                if (!state.has(name)) state.set(name, new Set());
                state.get(name).add(f.name);
            }
        }
    }
    if (state.size === 0) {
        error("no panel reads any state - check_a_panel_is_not_redrawn_before_the_value_changes "
            + "is out of date.");
        return;
    }

    let pairs = 0;
    let faults = 0;
    for (const [key, drawers] of state) {
        const field = key.startsWith("character.") ? `character\\.${key.slice(10)}` : key;
        //Both shapes: `character.money += 5` and `character.reputation[region] = 0`.
        const write = new RegExp(
            `(?<![.\\w])${field}(?:\\[[^\\]]+\\])?\\s*(?:=[^=>]|\\+=|-=|\\+\\+)`, "g");
        //A default in a signature is not somebody changing the value.
        const in_signature = new RegExp(`[({,]\\s*${field}\\s*=`);

        /*
            Everything that redraws this panel: the drawers themselves, and anything that
            calls one. unlock_location draws nothing itself - it calls change_location, which
            rebuilds the place the player is standing in.
        */
        const redraws = new Set(drawers);
        for (const [, found] of spans) {
            for (const f of found) {
                if (redraws.has(f.name)) continue;
                if ([...drawers].some(d => f.body.includes(`${d}(`))) redraws.add(f.name);
            }
        }

        for (const [relative, found] of spans) {
            for (const f of found) {
                if (is_drawer(f.name) || draws_everything_afterwards.has(f.name)) continue;

                const writes_at = [];
                for (const m of f.body.matchAll(write)) {
                    const around = f.body.slice(Math.max(0, m.index - 2), m.index + m[0].length);
                    if (in_signature.test(around)) continue;
                    writes_at.push(m.index);
                }
                if (writes_at.length === 0) continue;

                const redraws_at = [];
                for (const name of redraws) {
                    for (const m of f.body.matchAll(new RegExp(`(?<!\\w)${name}\\s*\\(`, "g"))) {
                        redraws_at.push(m.index);
                    }
                }
                if (redraws_at.length === 0) continue;

                pairs++;
                /*
                    Every write needs a redraw somewhere after it - not "the last write
                    before the first redraw", which branches break. kill_enemy writes the
                    killcount and redraws in one arm, then writes and redraws again in the
                    other; each arm is in order, and comparing the extremes called it wrong.
                */
                const last_redraw = Math.max(...redraws_at);
                if (writes_at.some(at => at > last_redraw)) {
                    faults++;
                    error(`${relative.replace("src/", "")}: ${f.name} redraws what shows `
                        + `"${key}" before it finishes writing it, so the panel is built from `
                        + `the old value and nothing redraws it again.`);
                }
            }
        }
    }

    console.log(`[check] panel ordering: ${state.size} piece(s) of state read by a panel, `
        + `${pairs} function(s) both writing and redrawing one, ${faults} out of order`);
}


/**
 * Every journal panel drawn from the inventory is redrawn when the inventory changes.
 *
 * The owner watched a gather job say "4 of 20" while picking up the seventh. The number was
 * right when it was drawn; nothing drew it again. `refresh_open_journal_panels` exists for
 * exactly this - it is called whenever the inventory changes - and the guild board, added
 * after that function was written, was never put in it. The worse half was the Hand in
 * button, which appears only when the job is done and is read the same way, so the work could
 * be finished with no way on screen to hand it in.
 *
 * **The panels are asked, rather than listed.** The journal's tabs come from the markup - the
 * buttons in `journal_control_div` and the openers they name - so a tab added to index.html
 * is in this check the day it is added, which is precisely how the guild board slipped past.
 * A list written here would have been written by whoever forgot the board.
 *
 * **What "shows the inventory" means is followed, not matched.** No panel updater reads
 * `character.inventory` in its own body; the guild board reads it two calls down, in the row
 * builder. So the call graph is walked, and a panel counts if the read is anywhere under it.
 *
 * **Two routes count as refreshed, because both are real.** `refresh_open_journal_panels` is
 * one. The other is `update_displayed_character_inventory`, which the quests panel rides: it
 * calls `update_displayed_quest_item_counts` at the top, so every gathering counter follows
 * the inventory without the journal helper knowing anything about it. Demanding the helper
 * alone would have reported that working panel as broken.
 */
function check_every_inventory_panel_is_refreshed_when_it_changes() {
    const {spans} = read_functions();

    const by_name = new Map();
    for (const [relative, found] of spans) {
        for (const f of found) {
            if (!by_name.has(f.name)) by_name.set(f.name, {relative, body: f.body});
        }
    }

    /*
        Does this function end up reading the inventory? `create_guild_job_row` does, and it is
        two calls below the panel, so a direct match on the updater finds nothing at all - the
        first attempt at this check passed happily against the bug it was written for.
    */
    const reads_inventory = (name, seen = new Set()) => {
        if (seen.has(name)) return null;
        seen.add(name);
        const f = by_name.get(name);
        if (!f) return null;
        if (/(?<![.\w])character\.inventory/.test(f.body)) return name;
        for (const call of f.body.matchAll(/(?<![.\w])(\w+)\s*\(/g)) {
            const under = reads_inventory(call[1], seen);
            if (under) return `${name} -> ${under}`;
        }
        return null;
    };

    //The journal's tabs, and the updater each one runs when it is opened.
    const markup = fs.readFileSync(path.join(repo_root, "index.html"), "utf8");
    const controls = markup.indexOf('id = "journal_control_div"');
    if (controls === -1) {
        error("journal_control_div is gone from index.html - "
            + "check_every_inventory_panel_is_refreshed_when_it_changes cannot find the tabs.");
        return;
    }
    const buttons = markup.slice(controls, markup.indexOf("</div>", markup.indexOf("journal_content_div")));

    const panels = [];
    for (const button of buttons.matchAll(/onclick\s*=\s*"(\w+)\(\)"/g)) {
        const opener = button[1];
        const at = markup.indexOf(`function ${opener}(`);
        if (at === -1) continue;
        const body = markup.slice(at, markup.indexOf("\n            }", at));
        const tab = /getElementById\("(\w+)"\)/.exec(body);
        for (const call of body.matchAll(/(?<![.\w])(update_\w+)\s*\(/g)) {
            panels.push({opener, tab: tab ? tab[1] : null, updater: call[1]});
        }
    }
    if (panels.length < 3) {
        error(`only ${panels.length} journal panel(s) were read out of index.html - `
            + `check_every_inventory_panel_is_refreshed_when_it_changes is out of date and `
            + `would accept anything.`);
        return;
    }

    //What the two refresh routes reach.
    const refreshed = new Set();
    const collect = (from) => {
        const f = by_name.get(from);
        if (!f) return;
        for (const call of f.body.matchAll(/(?<![.\w])(\w+)\s*\(/g)) {
            refreshed.add(call[1]);
        }
    };
    collect("refresh_open_journal_panels");
    collect("update_displayed_character_inventory");
    if (refreshed.size === 0) {
        error("neither refresh_open_journal_panels nor update_displayed_character_inventory "
            + "could be read - this check would pass on anything.");
        return;
    }

    let shown = 0;
    for (const {opener, tab, updater} of panels) {
        const via = reads_inventory(updater);
        if (!via) continue;
        shown++;
        if (refreshed.has(updater)) continue;
        error(`${opener} draws "${tab}" with ${updater}, which reads the inventory `
            + `(${via}), but nothing redraws it when the inventory changes. The panel keeps `
            + `the count it was opened with, so a player watching it picks things up and `
            + `sees nothing move - and anything the panel only shows once the count is `
            + `reached never appears at all. Add it to refresh_open_journal_panels.`);
    }

    console.log(`[check] journal refresh: ${panels.length} panel(s) drawn on open, `
        + `${shown} of them from the inventory, each redrawn when it changes`);
}

export { check_a_panel_is_not_redrawn_before_the_value_changes,
         check_every_inventory_panel_is_refreshed_when_it_changes };
