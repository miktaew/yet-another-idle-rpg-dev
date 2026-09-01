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

export { check_a_panel_is_not_redrawn_before_the_value_changes };
