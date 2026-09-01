/** Object literals that quietly contradict themselves. */

import * as fs from "node:fs";
import * as path from "node:path";
import { repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { braced_body, source_files, strip_comments, top_level_keys } from "../lib/source.mjs";

/**
 * No content object declares the same key twice.
 *
 * JavaScript keeps the last of a repeated key and drops the earlier ones without a word: no
 * error, no warning, nothing at runtime. `tallyman the hold` had two `rewards:` blocks, each
 * with its own comment above it explaining what it was for, and the second silently deleted
 * the first - so the guild clerk's line, which that conversation exists to open, was never
 * granted by any version that shipped (P-40).
 *
 * That is a whole reward block lost to a syntax the language accepts. Nothing else in the
 * build can see it: it parses, it builds, the bundle loads, and the content simply does less
 * than it says.
 *
 * Constructor bodies are what is scanned - `new Textline({...})`, `new GameAction({...})` and
 * the rest - because that is where these objects are written, hundreds of lines at a time,
 * which is exactly the length at which a second `rewards:` goes unnoticed.
 *
 * `top_level_keys` reads a line at a time, so two keys sharing one line are one key to it.
 * That is the wrong shape for the bug this catches anyway: a duplicate that matters is a
 * second multi-line block, and those start on their own line.
 */
function check_no_content_object_repeats_a_key() {
    let bodies = 0;
    const duplicates = [];

    for (const relative of source_files(repo_root)) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const opener of source.matchAll(/new\s+([A-Z][A-Za-z0-9_]*)\s*\(\s*\{/g)) {
            const brace = opener.index + opener[0].length - 1;
            const body = braced_body(source, brace);
            if (body === null) continue;
            bodies++;

            const keys = top_level_keys(body);
            const seen = new Set();
            for (const key of keys) {
                if (seen.has(key)) {
                    //Name it by whatever identifies the object, so it can be found.
                    const named = /(?:name|id|action_id|quest_name|title_id)\s*:\s*"([^"]+)"/
                        .exec(body);
                    duplicates.push({
                        where: `${relative}`,
                        what: `${opener[1]}${named ? ` "${named[1]}"` : ""}`,
                        key,
                    });
                }
                seen.add(key);
            }
        }
    }

    if (bodies === 0) {
        error("no constructor literals found at all - this check is out of date.");
        return;
    }

    for (const found of duplicates) {
        error(`${found.where}: ${found.what} declares "${found.key}" twice. JavaScript keeps `
            + `the last one and drops the first without a word, so whatever the earlier block `
            + `said is not in the game.`);
    }

    console.log(`[check] repeated keys: ${bodies} constructor literal(s), `
        + `${duplicates.length === 0 ? "none repeating a key" : `${duplicates.length} repeated`}`);
}

export { check_no_content_object_repeats_a_key };
