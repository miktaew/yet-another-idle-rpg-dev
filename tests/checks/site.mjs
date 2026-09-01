/** The built site itself: the files, the version stamp, the language switch. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { load_locale } from "../lib/locale-files.mjs";
import { repo_root, site_dir, version } from "../lib/context.mjs";
import { strip_comments } from "../lib/source.mjs";

function check_site() {
    if (!fs.existsSync(site_dir)) {
        error("_site/ does not exist - run `npm run build` first.");
        return;
    }

    const expected = [
        "index.html",
        "help.html",
        "help.tr.html",
        "changelog.html",
        "changelog.tr.html",
        "style.css",
        "favicon.ico",
        "robots.txt",
        "dist/bundle.js",
        "locales/english.js",
        "resources/js/HackTimer/HackTimer.min.js",
    ];
    for (const rel of expected) {
        if (!fs.existsSync(path.join(site_dir, rel))) {
            error(`_site/${rel} is missing.`);
        }
    }

    const index_path = path.join(site_dir, "index.html");
    if (!fs.existsSync(index_path)) return;

    const html = fs.readFileSync(index_path, "utf8");

    if (/src\s*=\s*"src\/main\.js"/.test(html)) {
        error("_site/index.html still loads src/main.js - the deployed site must load the bundle.");
    }
    if (!html.includes(`dist/bundle.js?version=${version}`)) {
        error(`_site/index.html does not load dist/bundle.js?version=${version}.`);
    }
    if (!html.includes(`style.css?version=${version}`)) {
        error(`_site/index.html does not load style.css?version=${version}.`);
    }

    const script_tags = html.match(/<script\b[^>]*\bsrc\s*=/g) || [];
    if (script_tags.length < 2) {
        error(`_site/index.html has ${script_tags.length} external script tag(s); expected the HackTimer tag and the bundle tag.`);
    }

    // The sourcemap must not be deployed. It is 3 MB and it publishes the whole
    // unminified source; it was being served to every visitor for as long as dist/
    // was copied wholesale. The map is still built into dist/ for local use.
    if (fs.existsSync(path.join(site_dir, "dist/bundle.js.map"))) {
        error("_site/dist/bundle.js.map exists - the sourcemap must not be deployed."
            + " build-site.js copies the bundle on its own for exactly this reason.");
    }
    const bundle_path = path.join(site_dir, "dist/bundle.js");
    if (fs.existsSync(bundle_path)
        && fs.readFileSync(bundle_path, "utf8").includes("sourceMappingURL")) {
        error("_site/dist/bundle.js still references a sourceMappingURL, so every devtools"
            + " session would chase a file that is deliberately not deployed.");
    }
}

/**
 * Panels built imperatively - once, at startup, straight into the DOM - are
 * invisible to translateUI, which only rewrites elements carrying a
 * data-translation attribute. A language switch therefore has to repaint them by
 * hand, and forgetting one fails silently: the panel simply keeps the language it
 * was built in, which on a new game is always the default, because it is built
 * before the player can choose anything. That is the bug the hero creation panel
 * shipped with while the confirm button beside it switched correctly.
 *
 * Adding another such panel means adding its repaint here.
 */
const language_switch_repaints = [
    "fill_character_bio()",
    "characterCreator.refresh_language()",
];

function check_language_switch_repaints() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/main.js"), "utf8"));

    const body = source.match(/async function option_language\(option\) \{([\s\S]*?)\n\}/);
    if (!body) {
        error("src/main.js has no `async function option_language(option) { ... }` - this check is out of date.");
        return;
    }
    if (!body[1].includes("translationManager.translateUI(language)")) {
        error("option_language does not call translationManager.translateUI(language),"
            + " so nothing carrying a data-translation attribute would change language at all.");
    }
    for (const call of language_switch_repaints) {
        if (!body[1].includes(call)) {
            error(`option_language does not call ${call}; that panel is built imperatively,`
                + " so a language switch would leave it in the language it was built in.");
        }
    }
}

/**
 * The in-game changelogs must carry an entry for the version being shipped, and
 * both of them, so the two languages cannot drift apart.
 *
 * They are the player-facing history: a release that bumps the version without
 * writing an entry ships a game whose own changelog does not mention it. A heading
 * may carry a release title and dates after the version, so only its first token
 * has to match.
 *
 * The version span is checked in the BUILT copy, because that is where
 * build-site.js stamps it - the repository copies deliberately hold a readable
 * literal instead.
 */
/**
 * The help page's map names every location, in both languages.
 *
 * Which region a place belongs to is a narrative fact - the order the story walks
 * them - so the grouping is authored by hand. Which places EXIST is not: they are in
 * src/locations.js, and a new one that no region claims would simply be absent from
 * the map with nothing to say so.
 *
 * The map marks each place with data-location="<registry key>", which is also what
 * lets it read the save, so the keys are checkable directly.
 */
function check_help_map_covers_the_world() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/data/locations.js"), "utf8"));
    const declared = new Set();
    for (const match of source.matchAll(/locations\["([^"]+)"\]\s*=\s*new\s+\w+\(\{/g)) {
        declared.add(match[1]);
    }

    if (declared.size === 0) {
        error("no locations found in src/locations.js - this check is out of date.");
        return;
    }

    let checked = 0;
    for (const page of ["help.html", "help.tr.html"]) {
        const full = path.join(repo_root, page);
        if (!fs.existsSync(full)) {
            error(`${page} is missing.`);
            continue;
        }
        const markup = fs.readFileSync(full, "utf8");
        const mapped = new Set();
        for (const match of markup.matchAll(/data-location="([^"]+)"/g)) {
            mapped.add(match[1]);
        }

        for (const key of declared) {
            if (!mapped.has(key)) {
                error(`${page}: the map does not name the location "${key}". Add it to a`
                    + ` region, or the players who read the map will not know it exists.`);
            }
        }
        for (const key of mapped) {
            if (!declared.has(key)) {
                error(`${page}: the map names "${key}", which is not a location any more.`);
            }
        }
        checked += mapped.size;
    }

    console.log(`[check] help map covers the world: ${declared.size} locations,`
        + ` ${checked} entries across both pages`);
}

/**
 * A reputation region the help page never mentions.
 *
 * The map check covers places, and P-21 measured what it does not: the help page's account
 * of standing had said "reputation reduces prices" and named no regions at all, so `Guild`
 * arrived as a fourth region and a row on the character sheet that the page could not
 * explain. That is the whole class - the page can fall behind the game in ways the map
 * check cannot see.
 *
 * It is deliberately narrow. What a page *should* explain is a judgement and cannot be
 * checked; that every region the game declares is at least named on both pages can be.
 * The changelog symmetry works because a version bump forces an entry; there is no
 * equivalent for help, and this is the closest honest thing to one.
 *
 * Matched on a `data-region` attribute rather than on the visible words, the same way the
 * map is matched on `data-location`. Two earlier versions of this check searched for the
 * shown name as a substring and could not fail: "guild" appears in the town's description
 * and in the answer about where content ends, and Turkish agglutinates - "loncanın" contains
 * "lonca". A check that cannot fail is worse than no check, so the markup carries the
 * registry key and the prose is free to read however it reads in each language.
 */
async function check_help_explains_standing() {
    const character = strip_comments(
        fs.readFileSync(path.join(repo_root, "src/character.js"), "utf8"));
    const declaration = /this\.reputation\s*=\s*\{([^}]*)\}/.exec(character);
    if (!declaration) {
        error("src/character.js no longer declares `this.reputation = {...}` -"
            + " check_help_explains_standing is out of date.");
        return;
    }
    const regions = [...declaration[1].matchAll(/(\w+):\s*-?\d+/g)].map(m => m[1]);
    if (regions.length === 0) {
        error("character.reputation declares no regions - this check is out of date.");
        return;
    }

    const pages = {"help.html": "english", "help.tr.html": "turkish"};
    let named = 0;
    for (const [page, locale_name] of Object.entries(pages)) {
        const full = path.join(repo_root, page);
        if (!fs.existsSync(full)) {
            error(`${page} is missing.`);
            continue;
        }
        const whole = fs.readFileSync(full, "utf8");
        const block = /<div class="standing_regions">([\s\S]*?)<\/div>/.exec(whole);
        if (!block) {
            error(`${page} has no <div class="standing_regions"> block. That block is the`
                + " page's account of what standing is, and this check reads it; without it"
                + " a new reputation region can arrive with nothing explaining it.");
            continue;
        }
        const marked = new Set(
            [...block[1].matchAll(/data-region="([^"]+)"/g)].map(match => match[1]));
        for (const region of regions) {
            named++;
            if (!marked.has(region)) {
                error(`${page}'s account of standing never names the reputation region`
                    + ` "${region}". A player earns it, sees a row for it on the character`
                    + " sheet, and finds nothing on the help page that says what it is."
                    + " Mark it with data-region in the standing_regions block.");
            }
        }
        for (const region of marked) {
            if (!regions.includes(region)) {
                error(`${page} explains a reputation region "${region}", which`
                    + " character.reputation does not have any more.");
            }
        }
    }

    console.log(`[check] help explains standing: ${regions.length} regions named across`
        + ` both pages (${named} checked)`);
}

function check_changelogs_cover_version() {
    for (const file of ["changelog.html", "changelog.tr.html"]) {
        const html = fs.readFileSync(path.join(repo_root, file), "utf8");

        const headings = [...html.matchAll(/<button[^>]*class="collapsible"[^>]*>([^<]+)<\/button>/g)]
            .map(match => match[1].trim().split(/\s+/)[0]);
        if (headings.length === 0) {
            error(`${file} has no collapsible version headings - this check is out of date.`);
            continue;
        }
        /*
            A version the player cannot see does not belong here.

            The in-game changelog is what a player reads inside the game, and
            "the tooltips moved into their own file" is not news to them - that
            reasoning belongs in docs/CHANGELOG.md, which is the developer history.
            So a version may be absent from here, as long as it is written up there:
            nothing ships unrecorded, and the player is only shown what concerns them.
        */
        if (!headings.includes(version)) {
            const developer = path.join(repo_root, "docs", "CHANGELOG.md");
            const written_up = fs.existsSync(developer)
                && fs.readFileSync(developer, "utf8").includes(version);
            if (!written_up) {
                error(`${version} appears in neither ${file} nor docs/CHANGELOG.md. A release`
                    + " has to be written up somewhere: player-facing changes go in the in-game"
                    + " changelog, maintenance in the developer one.");
            }
        }

        /*
            An empty version block reads as a release that did nothing.

            Each heading is paired with everything up to the NEXT heading rather than
            with a `</div>` at a fixed indent: v0.3.3 carries an extra
            `<p class="version_note">` and would have been skipped by a pattern that
            assumed one shape, which is the wrong way for a check to be quiet.
        */
        const sections = html.split(/(?=<button[^>]*class="collapsible"[^>]*>v)/);
        for (const section of sections) {
            const heading = /<button[^>]*class="collapsible"[^>]*>([^<]+)<\/button>/.exec(section);
            if (!heading) continue;
            if (!section.includes("<li>")) {
                error(`${file}: the entry for ${heading[1].trim()} has no items. Remove the`
                    + " version rather than shipping a heading with nothing under it.");
            }
        }

        const built = path.join(site_dir, file);
        if (!fs.existsSync(built)) continue;
        if (!fs.readFileSync(built, "utf8").includes(`<span class="game_version">${version}</span>`)) {
            error(`_site/${file} does not show ${version} in its game_version span;`
                + " build-site.js did not stamp it.");
        }
    }
}

export {
    check_changelogs_cover_version,
    check_help_explains_standing,
    check_help_map_covers_the_world,
    check_language_switch_repaints,
    check_site,
};
