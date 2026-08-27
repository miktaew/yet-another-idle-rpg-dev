/** No English written straight into the DOM. */

import * as fs from "node:fs";
import * as path from "node:path";
import { default_language, repo_root } from "../lib/context.mjs";
import { error, warn } from "../lib/report.mjs";
import { load_locale } from "../lib/locale-files.mjs";
import { read_string_literals, strip_comments, strip_interpolations } from "../lib/source.mjs";

/**
 * No English may be written straight into the DOM.
 *
 * This is the check that should have existed before the interface was translated
 * panel by panel from screenshots. A screenshot only shows what is on screen; a
 * scan sees the crafting window, the bestiary and the stance list too, and it found
 * twenty-eight more sites after the last screenshot had been fixed.
 *
 * It looks at every string literal on a line that assigns innerText / innerHTML or
 * calls set_HTML / insert_HTML, and subtracts what is legitimately not prose:
 *
 *   - locale text ids (those ARE the translation)
 *   - markup: tags, attributes, entities, ${...} interpolations
 *   - material-icons glyph names and CSS class lists, which are single tokens
 *   - the explicit allowlist below, for the handful of real exceptions
 *
 * What is left is a word a player can read that no translation can reach.
 */
async function check_no_english_in_dom() {
    const reference = await load_locale(default_language);
    if (!reference) return;
    const locale_keys = new Set(Object.keys(reference));

    //Literals that reach the DOM and are correctly not translated. Each one needs a
    //reason, because the point of the check is that "it is only a word" is not one.
    const allowed = new Set([
        //A unit that reads the same in both languages, in markup nothing ever rewrites.
        "mana",
    ]);

    //=[^=] and not just =: `innerText === "[Comp]"` reads the DOM, it does not write
    //to it, and flagging a comparison would push a translation into a sort key.
    const writers = /(?:innerText|innerHTML)\s*=[^=]|set_HTML\(|insert_HTML\(/;

    let flagged = 0;
    let checked = 0;
    for (const relative of ["src/display.js", "src/main.js"]) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const literal of read_string_literals(source)) {
            //Everything back to the previous statement boundary. Whether a literal
            //reaches the DOM is a property of its statement, not of the line it starts
            //on - a template literal can span four lines.
            const boundary = Math.max(source.lastIndexOf(";", literal.start),
                                      source.lastIndexOf("{", literal.start),
                                      source.lastIndexOf("}", literal.start));
            const statement = source.slice(boundary + 1, literal.start);
            if (!writers.test(statement)) continue;
            //A diagnostic is for the developer's console, not for the player.
            if (/console\.(warn|error|log)|throw new Error/.test(statement)) continue;

            checked++;
            if (locale_keys.has(literal.body)) continue;
            if (allowed.has(literal.body.trim())) continue;

            const text = strip_interpolations(literal.body)
                .replace(/<i\b[^>]*material-icons[^>]*>[^<]*<\/i>/g, " ")
                .replace(/<[^>]*>/g, " ")
                .replace(/&[a-z]+;/g, " ")
                .replace(/\\[nrt]/g, " ")
                .trim();
            if (!text) continue;
            //A single lowercase token is an id, a class name or an icon glyph name.
            if (/^[a-z0-9_.\-]+$/.test(text)) continue;
            //Needs two adjacent letters somewhere to be a word rather than a symbol.
            if (!/[A-Za-z]{2}/.test(text)) continue;

            flagged++;
            error(`${relative}:${literal.line} writes "${text.slice(0, 60)}" into the DOM as a`
                + " literal. Player-facing text goes through a locale row; if this one is not"
                + " player-facing, add it to the allowlist in check_no_english_in_dom with a"
                + " reason.");
        }
    }
    if (flagged === 0) {
        console.log(`[check] no English written straight into the DOM: ${checked} literals`);
    }
}

/**
 * Nothing may call btoa or atob directly.
 *
 * btoa throws on any character above U+00FF, and four Turkish letters live above it:
 * s-cedilla, g-breve, dotless i and dotted I. The savefile has carried the message
 * log since the log started surviving a reload, so the first Turkish sentence a player
 * was shown made every export throw - and because the throw happened inside an onclick,
 * the Export button simply did nothing.
 *
 * to_base64 and from_base64 encode to UTF-8 bytes first. This keeps the next caller
 * from reaching for the raw pair again.
 */
/**
 * A season name may not be stringified straight into markup.
 *
 * game_time.js returns seasons in English and must keep doing so: conditions.js
 * compares getSeason() against `season: {yes: "Summer"}` written in content, and the
 * save's saved_at goes through toString(). So a season on screen has to pass through
 * season_list(), which maps each name through its `season <name>` row.
 *
 * Two of the four call sites did not. The job tooltip used season_list; the activity
 * tooltip built its list with .toString().replaceAll(",", ", ") and printed "Winter
 * boyunca müsait değil" in a Turkish interface. An interpolation is the one shape
 * check_no_english_in_dom cannot see, so this looks for the shape instead of the text.
 */
async function check_seasons_go_through_the_accessor() {
    const relative = "src/display.js";
    const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));
    const lines = source.split(/\r?\n/);

    let checked = 0;
    for (let i = 0; i < lines.length; i++) {
        if (!/season/i.test(lines[i])) {
            continue;
        }
        checked++;
        if (/seasons?\b[^;]*\.toString\s*\(/.test(lines[i])) {
            error(`${relative}:${i + 1} turns a season into a string directly. Use`
                + ` season_list(), which maps each name through its "season <name>" row -`
                + ` game_time.js has to keep returning English.`);
        }
    }

    if (checked === 0) {
        error(`${relative} mentions no seasons at all - this check is out of date.`);
    }

    console.log(`[check] seasons go through the accessor: ${checked} lines mention one`);
}

async function check_base64_is_utf8_safe() {
    const allowed = new Set([
        "function to_base64(text) {",
        "function from_base64(encoded) {",
    ]);

    let checked = 0;
    for (const relative of fs.readdirSync(path.join(repo_root, "src"))
            .filter(name => name.endsWith(".js")).map(name => `src/${name}`)
            .concat(["index.html"])) {
        const source = fs.readFileSync(path.join(repo_root, relative), "utf8");
        const lines = strip_comments(source).split(/\r?\n/);

        //Which helper, if any, each line sits inside. The helpers are the only callers.
        let inside = null;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const opener of allowed) {
                if (line.includes(opener.slice(0, -2))) {
                    inside = opener;
                }
            }
            if (inside && line === "}") {
                inside = null;
                continue;
            }
            if (!/(?<![\w.])(?:btoa|atob)\s*\(/.test(line)) {
                continue;
            }
            checked++;
            if (!inside) {
                error(`${relative}:${i + 1} calls btoa or atob directly. Use to_base64 /`
                    + ` from_base64: btoa throws on the four Turkish letters above U+00FF,`
                    + ` and the savefile carries the message log.`);
            }
        }
    }

    if (checked === 0) {
        error("no btoa or atob calls found at all - the base64 helpers have moved and this check is out of date.");
    }

    console.log(`[check] base64 is utf8-safe: ${checked} call sites`);
}

export {
    check_base64_is_utf8_safe,
    check_seasons_go_through_the_accessor,
    check_no_english_in_dom,
};
