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

export {
    check_effect_tags_match_their_numbers,
};
