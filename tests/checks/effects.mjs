/** An effect's buff/debuff tag agrees with what its numbers do. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";
import { braced_body, strip_comments } from "../lib/source.mjs";

/**
 * `add_best_effect` in the dev console applies every effect tagged `buff`, and the tag
 * is the only thing it consults. That is deliberate - a hand-written list of good
 * effects in main.js would be correct until the next effect is added and then quietly
 * wrong - but it makes the tag load-bearing: one mistyped `buff` and the console hands
 * the player a paralysing poison on request.
 *
 * The tag cannot simply be derived from the numbers instead, because it carries
 * intent the numbers do not. Tipsy raises agility and lowers dexterity and is tagged
 * debuff; the sign analysis alone would call it mixed and shrug.
 *
 * So the two are cross-checked rather than one replacing the other: an effect tagged
 * buff must not be one whose every modifier hurts, and an effect tagged debuff must
 * not be one whose every modifier helps. That leaves the mixed and the judgement calls
 * alone and still catches the mistake that matters.
 *
 * Untagged effects are not an error. The five cold stages carry `cold: N` instead, and
 * `Potion of sapping` is untagged on purpose - its own comment explains that it is a
 * utility item for spending stamina rather than a poison. None of them is tagged buff,
 * so none of them reaches `add_best_effect`.
 */
async function check_effect_tags_match_their_numbers() {
    const file = "src/active_effects.js";
    const full = path.join(repo_root, file);
    if (!fs.existsSync(full)) {
        error(`${file} is missing - this check is out of date.`);
        return;
    }
    const source = strip_comments(fs.readFileSync(full, "utf8"));

    const templates = [];
    for (const start of source.matchAll(/effect_templates\["([^"]+)"\] = new ActiveEffect\(/g)) {
        const open = source.indexOf("{", start.index + start[0].length);
        const body = open === -1 ? null : braced_body(source, open);
        if (body !== null) {
            templates.push({ name: start[1], body });
        }
    }
    if (templates.length === 0) {
        error(`${file} declares no effect templates in the expected shape - this check is`
            + " out of date.");
        return;
    }

    let buffs = 0;
    for (const template of templates) {
        const tags = /\btags:\s*\{([^}]*)\}/.exec(template.body);
        const tag_text = tags ? tags[1] : "";
        /*
            The word boundary is the whole trick. Without it `buff` matches inside
            `"debuff"`, every poison in the game reads as a buff, and the check that is
            supposed to keep poison out of add_best_effect waves all of it through.
        */
        const tagged_buff = /\bbuff["']?\s*:\s*true/.test(tag_text);
        const tagged_debuff = /\bdebuff["']?\s*:\s*true/.test(tag_text);
        if (!tagged_buff && !tagged_debuff) {
            continue;
        }
        if (tagged_buff) {
            buffs++;
        }

        //Every numeric modifier the effect declares, and which way it points.
        const numbers = [];
        for (const flat of template.body.matchAll(/(\w+):\s*\{[^}]*\bflat:\s*(-?[\d.]+)/g)) {
            numbers.push({ label: flat[1], helps: Number(flat[2]) > 0, hurts: Number(flat[2]) < 0 });
        }
        for (const mult of template.body.matchAll(/(\w+):\s*\{[^}]*\bmultiplier:\s*(-?[\d.]+)/g)) {
            numbers.push({ label: mult[1], helps: Number(mult[2]) > 1, hurts: Number(mult[2]) < 1 });
        }
        const xp = /xp_multipliers:\s*\{([^}]*)\}/.exec(template.body);
        for (const pair of (xp ? xp[1] : "").matchAll(/(\w+):\s*(-?[\d.]+)/g)) {
            numbers.push({ label: `xp ${pair[1]}`, helps: Number(pair[2]) > 1, hurts: Number(pair[2]) < 1 });
        }
        if (numbers.length === 0) {
            continue;
        }

        const listed = numbers.map(number => number.label).join(", ");
        if (tagged_buff && numbers.every(number => number.hurts)) {
            error(`${file}: "${template.name}" is tagged buff and every one of its modifiers`
                + ` makes the character worse (${listed}). The dev console's add_best_effect`
                + " applies everything tagged buff, so this would be handed to the player as a"
                + " good thing.");
        }
        if (tagged_debuff && numbers.every(number => number.helps)) {
            error(`${file}: "${template.name}" is tagged debuff and every one of its modifiers`
                + ` makes the character better (${listed}). Either the tag or the numbers is`
                + " wrong.");
        }
    }

    console.log(`[check] effect tags: ${templates.length} templates, ${buffs} tagged buff and`
        + " none contradicted by its own numbers");
}


/**
 * A reward on a timer the player does not control extends what is running, never replaces it.
 *
 * The export spark is granted on a sixteen-hour cooldown. It used to be handed over by
 * replacing the effect outright, so a player who exported with forty minutes still burning
 * got thirty back and lost ten - punished for exporting at the moment the game invited them
 * to, and with no way to see the remainder before deciding.
 *
 * **The class is "granted on a cooldown", not "is the spark".** Anything the game hands out
 * on its own schedule has the same shape: the player cannot time it to avoid the loss, so
 * replacing is a possible loss and never a gain. A consumable is the opposite - the player
 * chooses when to drink it, and refresh-to-full is what it should do - which is why `extend`
 * is opt-in and only the timer-granted callers are checked.
 *
 * **Found by the call edge, not by proximity.** The first attempt at this looked for a
 * cooldown mentioned near a grant and reported `update` four times: main.js's tick reads
 * every timer there is, so "near" catches the whole game. The honest link is narrower and
 * exact - the function that STAMPS the cooldown (`last_rewarded_x = Date.now()`) calls the
 * grant on the next line, because stamping and granting are the same decision. So the
 * stampers are found, the functions they call are followed, and those are what must extend.
 *
 * **And the extension has to be real.** `add_active_effect` is checked to add the remaining
 * duration rather than merely accept the flag, because an `extend` parameter that is read and
 * dropped would pass a check that only looked at the call site - and the call site is the
 * half that reads as done.
 */
function check_a_timed_reward_extends_what_is_running() {
    const sources = new Map();
    for (const relative of ["src/main.js", "src/save_load.js"]) {
        sources.set(relative, strip_comments(
            fs.readFileSync(path.join(repo_root, relative), "utf8")));
    }

    /*
        The brace that opens a function's BODY, walked past its parameter list.
        `add_active_effect(..., {extend = false} = {})` puts a brace inside the parentheses,
        so "the next brace after the name" hands back the destructuring block as the function.
    */
    const body_of = (source, at) => {
        if (at === -1) {
            return null;
        }
        const paren = source.indexOf("(", at);
        if (paren === -1) {
            return null;
        }
        let depth = 0;
        for (let i = paren; i < source.length; i++) {
            if (source[i] === "(") { depth++; }
            else if (source[i] === ")") {
                depth--;
                if (depth === 0) { return braced_body(source, source.indexOf("{", i)); }
            }
        }
        return null;
    };

    const bodies = new Map();
    for (const [relative, source] of sources) {
        for (const found of source.matchAll(/function\s+(\w+)\s*\(/g)) {
            const body = body_of(source, found.index);
            if (body && !bodies.has(found[1])) {
                bodies.set(found[1], {relative, body});
            }
        }
    }

    const adder = bodies.get("add_active_effect");
    if (!adder) {
        error("add_active_effect is gone - check_a_timed_reward_extends_what_is_running "
            + "is out of date and would accept anything.");
        return;
    }
    if (!/extend\s*\?\s*\w*old\w*duration\s*\+/.test(adder.body)) {
        error("add_active_effect takes an `extend` option and never adds the remaining "
            + "duration to the new one, so every caller asking to extend is silently "
            + "replacing instead - and the call sites all read as correct.");
        return;
    }

    //Whoever stamps a cooldown is deciding to hand the reward over.
    const granting = new Map();
    for (const [name, {body}] of bodies) {
        /*
            Stamping it, not restoring it. `load` assigns the same field from the save, and
            reading any assignment reported process_rewards as a timed reward - the loader
            replays every reward there is, so following it means following the whole game.
            A stamp is the one that sets it to now.
        */
        if (!/last_rewarded_\w+\s*=\s*Date\.now\(\)\s*;/.test(body)) {
            continue;
        }
        for (const call of body.matchAll(/(?<![.\w])(\w+)\s*\(/g)) {
            const granted = bodies.get(call[1]);
            if (granted && /add_active_effect\s*\(/.test(granted.body)) {
                granting.set(call[1], {...granted, stamped_by: name});
            }
        }
    }

    if (granting.size === 0) {
        error("no reward granted on a cooldown could be found - "
            + "check_a_timed_reward_extends_what_is_running is out of date and would accept "
            + "anything.");
        return;
    }

    for (const [name, {relative, body, stamped_by}] of granting) {
        for (const call of body.matchAll(/add_active_effect\s*\(([^;]*?)\)\s*;/g)) {
            if (/extend\s*:\s*true/.test(call[1])) {
                continue;
            }
            error(`${relative.replace("src/", "")}: ${name} is called by ${stamped_by} the `
                + `moment it stamps the cooldown, so the player does not choose when it `
                + `lands - and it replaces the effect instead of extending it. Anyone who `
                + `already has one running loses whatever was left, which makes the reward a `
                + `loss whenever the remainder was longer than the grant. Pass `
                + `{extend: true}.`);
        }
    }

    /*
        And the dev console's wrapper forwards every parameter the real one takes.

        It did not. `add_active_effect: (effect_key, duration = 600) => real(...)` stopped at
        the duration, so `{extend: true}` typed at the console never arrived and the effect
        came back at exactly the new duration - which reads as the extension being broken.
        The owner spotted it and pointed at the delete-then-add in the adder; the adder was
        right and the tool was lying. A dev tool that quietly drops an argument answers a
        question about the game with an answer about itself, and it is the one place where
        being wrong looks most like evidence.
    */
    const wrapper = /add_active_effect:\s*\(([^)]*)\)\s*=>/.exec(
        sources.get("src/main.js") ?? "");
    const declared = /function\s+add_active_effect\s*\(([^)]*)\)/
        .exec(sources.get("src/main.js") ?? "");
    if (wrapper && declared) {
        const forwarded = /real_add_active_effect\s*\(([^)]*)\)/
            .exec(sources.get("src/main.js") ?? "");
        const takes = declared[1].split(",").length;
        const passes = forwarded ? forwarded[1].split(",").length : 0;
        if (passes < takes) {
            error(`the dev console's add_active_effect wrapper passes ${passes} argument(s) `
                + `to a function that takes ${takes}, so anything after them is dropped in `
                + `silence. Typing the dropped option at the console measures the wrapper `
                + `and reports the game as broken.`);
        }
    }

    console.log(`[check] timed rewards: ${granting.size} granted the moment a cooldown is `
        + `stamped, each extending what is already running`);
}

export {
    check_a_timed_reward_extends_what_is_running,
    check_effect_tags_match_their_numbers,
};
