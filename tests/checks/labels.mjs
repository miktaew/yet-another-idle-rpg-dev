/** A button label is a label, not a paragraph. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root, default_language } from "../lib/context.mjs";
import { braced_body, strip_comments } from "../lib/source.mjs";

/**
 * An action's button carries `action_name`, falling back to `starting_text`.
 *
 * Six actions had written a narrative sentence into `starting_text` - which the model
 * documents as "text on the button" - and the display was rendering it verbatim inside
 * the button. "You mark it out behind the well. Within the hour there are more people
 * carrying brick than you asked for." was the label on Build the village hearth, at 105
 * characters. Nothing failed; it just looked broken, in the same family as the
 * Discoveries panel running off the bottom of the page.
 *
 * The threshold comes from the content rather than taste. Across the 87 action and
 * activity labels the median is 36 characters and the 75th percentile is 48; every
 * label above 80 was either one of those six sentences or a deliberate upstream joke on
 * an activity ("Stupidly risk your life by trying to balance on some rocks"). So: 80
 * characters, actions only, both locales.
 *
 * Turkish is checked too and not just English, because Turkish runs longer than English
 * almost everywhere and is the language this project ships first.
 */
const LABEL_LIMIT = 80;

async function check_action_labels_fit_a_button() {
    const source_path = path.join(repo_root, "src/data/locations.js");
    if (!fs.existsSync(source_path)) {
        error("src/data/locations.js is missing - this check is out of date.");
        return;
    }
    const source = strip_comments(fs.readFileSync(source_path, "utf8"));

    //The id each action's button will actually use.
    const label_ids = new Set();
    for (const start of source.matchAll(/new GameAction\(\s*\{/g)) {
        const open = source.indexOf("{", start.index + start[0].length - 1);
        const body = braced_body(source, open);
        if (body === null) continue;
        const named = /action_name:\s*"([^"]+)"/.exec(body);
        const starting = /starting_text:\s*"([^"]+)"/.exec(body);
        const id = (named ?? starting)?.[1];
        if (id) label_ids.add(id);
    }
    if (label_ids.size === 0) {
        error("src/data/locations.js declares no GameAction labels - this check is out of date.");
        return;
    }

    const locales = fs.readdirSync(path.join(repo_root, "locales"))
        .filter(name => name.endsWith(".js"));

    let longest = 0;
    for (const locale of locales) {
        const rows = fs.readFileSync(path.join(repo_root, "locales", locale), "utf8");
        const text_of = new Map();
        for (const row of rows.matchAll(/^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/gm)) {
            text_of.set(row[1], row[2]);
        }
        for (const id of label_ids) {
            const text = text_of.get(id);
            if (text === undefined) continue;
            longest = Math.max(longest, text.length);
            if (text.length > LABEL_LIMIT) {
                error(`locales/${locale}: "${id}" is ${text.length} characters and is drawn`
                    + ` inside an action button (limit ${LABEL_LIMIT}). Give the action an`
                    + " action_name with a short label and leave the prose to description or"
                    + ` action_text. It reads: "${text.slice(0, 60)}..."`);
            }
        }
    }

    console.log(`[check] action button labels: ${label_ids.size} actions across`
        + ` ${locales.length} locales, longest ${longest} of ${LABEL_LIMIT} characters`
        + ` (reference ${default_language})`);
}

export {
    check_action_labels_fit_a_button,
};
