/** No English written straight into the DOM. */

import * as fs from "node:fs";
import * as path from "node:path";
import { default_language, repo_root } from "../lib/context.mjs";
import { error, warn } from "../lib/report.mjs";
import { load_locale } from "../lib/locale-files.mjs";
import { read_string_literals, source_files, strip_comments, strip_interpolations } from "../lib/source.mjs";

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
/**
 * Every function an onclick names is reachable as a global.
 *
 * An onclick is a string resolved against the global object at click time, so a function
 * that loses its `window.` assignment fails there and nowhere else: not in the build, not
 * in a check, not in the bundle-load test. The button just stops working.
 *
 * That makes this the net under any move of code out of main.js, which is where 89 of
 * those assignments live. Two sources of onclick are read - the attributes in index.html
 * and the ones display.js sets with setAttribute - and functions declared inline in
 * index.html count, since they are globals already.
 */
/**
 * Every journal panel is given a height and a display rule.
 *
 * The tabs share one box and are swapped by setting `display` on them, so a panel that no
 * rule hides is visible next to whichever tab is open, and a panel with no height grows
 * past the box and over whatever is underneath it. The Lore tab did both.
 *
 * Nothing else in the build reads CSS, so this is the only place that can say so.
 */
function check_journal_panels_are_styled() {
    const html = fs.readFileSync(path.join(repo_root, "index.html"), "utf8");
    const css = fs.readFileSync(path.join(repo_root, "style.css"), "utf8");

    const start = html.indexOf('<div id = "journal_content_div">');
    if (start === -1) {
        error("index.html has no #journal_content_div - this check is out of date.");
        return;
    }
    //To the start of the next sibling panel of the journal, which is the character box.
    const end = html.indexOf('<div id = "character_div"', start);
    const region = html.slice(start, end === -1 ? html.length : end);

    const panels = [...region.matchAll(/id\s*=\s*"(\w+_box_div)"/g)].map(match => match[1]);
    if (panels.length < 4) {
        error(`found ${panels.length} journal panels - this check is out of date.`);
        return;
    }

    //Selector plus body for every rule, so a panel can be looked up in the selectors that
    //actually set the property rather than anywhere its name appears.
    const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
        .map(match => ({selector: match[1], body: match[2]}));

    const sets = (panel, property) => rules.some(rule =>
        rule.selector.includes(`#${panel}`)
        && new RegExp(`(^|[;{\\s])${property}\\s*:`).test(rule.body));

    for (const panel of panels) {
        if (!sets(panel, "height")) {
            error(`#${panel} is a journal panel and no rule gives it a height, so it would`
                + ` grow past the journal box and over what is underneath it.`);
        }
        if (!sets(panel, "display")) {
            error(`#${panel} is a journal panel and no rule sets its display, so it would be`
                + ` on screen next to whichever tab is open.`);
        }
    }

    /*
        A fixed-height panel needs something in it that scrolls, or its content runs off
        the bottom - the fault reported twice, for Discoveries and then for Lore, and the
        one the two rules above cannot see. The panel is the right height; what is inside
        it is not.

        Either place will do, and the project uses both on purpose. The bestiary, the book
        list and the data tab scroll the BOX. Discoveries, Lore and Titles cannot: each has
        a row of controls or a header that has to stay put while the list under it moves,
        so the LIST scrolls and takes whatever that row leaves. Demanding one shape would
        be the check inventing a rule the design deliberately does not follow.
    */
    const scrolls = (element) => sets(element, "overflow-y") || sets(element, "overflow");

    /*
        Which ids live inside a given panel, read from the markup rather than guessed
        from the panel's own name. Guessing `${panel}_list` worked for six of the seven
        and quietly failed for the quests tab, whose list is #quest_list - singular. The
        box scrolled at the time, so the miss cost nothing and stayed invisible until
        the scrolling moved to the list.
    */
    const ids_inside = (panel) => {
        const opens = region.indexOf(`id = "${panel}"`);
        if (opens === -1) return [];
        const next = panels
            .map(other => other === panel ? -1 : region.indexOf(`id = "${other}"`, opens))
            .filter(at => at > opens);
        const closes = next.length ? Math.min(...next) : region.length;
        return [...region.slice(opens, closes).matchAll(/id\s*=\s*"(\w+)"/g)]
            .map(match => match[1])
            .filter(id => id !== panel);
    };

    for (const panel of panels) {
        const inside = ids_inside(panel);
        const list = inside.find(id => id.endsWith("_list"));
        const has_list = list !== undefined;
        if (scrolls(panel) || inside.some(scrolls)) {
            continue;
        }
        error(`#${panel} has a fixed height and nothing in it scrolls - neither the box nor`
            + `${has_list ? ` #${list}` : " a list of its own"}. Its content runs off the`
            + " bottom once there is enough of it. #lore_list is the shape to copy when the"
            + " panel has a header that must stay put.");
    }

    /*
        A height in pixels is a guess about how tall the tab bar is, and the tab bar
        wraps. Seven tabs take three rows where five took two, so adding the Titles tab
        silently invalidated `#journal_content_div { height: 287px }` and every panel
        below it painted past the bottom of the journal - reported as the titles, the
        discoveries and the quest list all spilling over the panel border at once.

        Nothing above could see it: each panel HAD a height and something in it DID
        scroll. The height was simply a number about a different layout.

        So the height has to be relative - 100% of whatever the row above left, or a
        flex basis - and then no one has to remember to change it when a tab is added.
    */
    const fixed_px_height = (element) => rules.find(rule =>
        rule.selector.includes(`#${element}`)
        && /(^|[;{\s])height\s*:\s*\d+(\.\d+)?px/.test(rule.body));

    for (const element of [...panels, "journal_content_div"]) {
        const rule = fixed_px_height(element);
        if (rule) {
            const height = /height\s*:\s*([^;]+)/.exec(rule.body)[1].trim();
            error(`#${element} is given height: ${height}. That is a guess about how tall`
                + " the journal's tab bar is, and the bar wraps to another row when a tab"
                + " is added - which puts this panel past the bottom of the journal, where"
                + " nothing clips it. Use a relative height (100%, or a flex basis) so the"
                + " panel takes whatever the bar leaves.");
        }
    }

    console.log(`[check] journal panels: ${panels.length} styled, none sized against the`
        + " tab bar's height");
}
function check_onclick_names_are_reachable() {
    const html = fs.readFileSync(path.join(repo_root, "index.html"), "utf8");
    const source = source_files(repo_root)
        .map(relative => fs.readFileSync(path.join(repo_root, relative), "utf8"))
        .join("\n");

    const reachable = new Set();
    for (const match of source.matchAll(/window\.(\w+)\s*=/g)) {
        reachable.add(match[1]);
    }
    for (const match of source.matchAll(/window\[["'](\w+)["']\]\s*=/g)) {
        reachable.add(match[1]);
    }
    //A function declared in the markup is a global without being assigned to one.
    for (const match of html.matchAll(/function\s+(\w+)\s*\(/g)) {
        reachable.add(match[1]);
    }
    /*
        And whatever those handlers declare for themselves. prepareGame alone defines a
        dozen local helpers, and a scan that cannot see them reports every one of them
        as an unreachable global - seventeen false alarms against one real fault.
    */
    for (const match of html.matchAll(/(?:const|let|var)\s+(\w+)\s*=/g)) {
        reachable.add(match[1]);
    }
    for (const match of html.matchAll(/(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>)/g)) {
        reachable.add(match[1]);
    }
    //The dev console attaches its helpers in a loop, by name, at runtime.
    const dev_console = /window\[name\]\s*=/.test(source);

    const called = new Map();
    const record = (name, where) => {
        if (!called.has(name)) called.set(name, new Set());
        called.get(name).add(where);
    };
    for (const match of html.matchAll(/onclick\s*=\s*["']([^"']+)["']/g)) {
        for (const call of match[1].matchAll(/(?<![\w.])([A-Za-z_]\w*)\s*\(/g)) {
            record(call[1], "index.html");
        }
    }
    for (const match of source.matchAll(
            /setAttribute\(\s*["']onclick["']\s*,\s*(["'`])([\s\S]*?)\1/g)) {
        for (const call of match[2].matchAll(/(?<![\w.])([A-Za-z_]\w*)\s*\(/g)) {
            record(call[1], "a setAttribute in src/");
        }
    }

    /*
        The second hop. An onclick names a handler declared in the markup, and that
        handler then calls module functions - which only work if something assigned them
        to window. Checking the first hop alone let `showTitles()` ship calling an
        `update_displayed_titles` that was not a global: the tab drew nothing and only a
        click said so.

        Browser builtins are listed rather than guessed at, because there is no way to
        tell one from a missing global by shape alone.
    */
    //`if (`, `for (`, `while (` and `function (` all look like a call to a matcher that
    //only knows "a name followed by a bracket".
    const keywords = new Set(["if", "for", "while", "switch", "catch", "return", "function",
        "typeof", "new", "do", "else", "await", "delete", "void", "in", "of"]);
    const browser_builtins = new Set([
        "getComputedStyle", "setTimeout", "setInterval", "clearTimeout", "clearInterval",
        "requestAnimationFrame", "parseInt", "parseFloat", "alert", "confirm", "prompt",
        "isNaN", "encodeURIComponent", "decodeURIComponent", "fetch", "structuredClone",
        //rgba() only ever appears inside a CSS colour string being assembled.
        "rgba", "rgb", "url", "calc", "translate",
    ]);
    for (const declaration of html.matchAll(/function\s+(\w+)\s*\([^)]*\)\s*\{/g)) {
        const open = html.indexOf("{", declaration.index + declaration[0].length - 1);
        let depth = 0;
        let end = open;
        for (let i = open; i < html.length; i++) {
            if (html[i] === "{") { depth++; }
            else if (html[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
        }
        for (const call of html.slice(open, end).matchAll(/(?<![\w.$])([a-z_][A-Za-z0-9_]*)\s*\(/g)) {
            if (keywords.has(call[1]) || browser_builtins.has(call[1])) continue;
            record(call[1], `${declaration[1]}() in index.html`);
        }
    }

    for (const [name, wheres] of called) {
        if (reachable.has(name)) continue;
        error(`${[...wheres].join(" and ")} calls "${name}" from an onclick, but nothing`
            + ` assigns it to window. That button would do nothing, and only a click would`
            + ` say so.`);
    }

    if (called.size < 50 || reachable.size < 50) {
        error(`found ${called.size} onclick names and ${reachable.size} globals`
            + ` - this check is out of date.`);
        return;
    }

    console.log(`[check] onclick names: ${called.size} reachable`
        + `${dev_console ? " (plus the dev console's, attached by name)" : ""}`);
}
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
    for (const relative of source_files(repo_root).concat(["index.html"])) {
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
    check_onclick_names_are_reachable,
    check_journal_panels_are_styled,
};
