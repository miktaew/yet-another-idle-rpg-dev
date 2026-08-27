/** The built site itself: the files, the version stamp, the language switch. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
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
function check_changelogs_cover_version() {
    for (const file of ["changelog.html", "changelog.tr.html"]) {
        const html = fs.readFileSync(path.join(repo_root, file), "utf8");

        const headings = [...html.matchAll(/<button[^>]*class="collapsible"[^>]*>([^<]+)<\/button>/g)]
            .map(match => match[1].trim().split(/\s+/)[0]);
        if (headings.length === 0) {
            error(`${file} has no collapsible version headings - this check is out of date.`);
            continue;
        }
        if (!headings.includes(version)) {
            error(`${file} has no entry for ${version} - its newest heading is "${headings[0]}".`
                + " The in-game changelog is the player-facing history and has to cover the shipped version.");
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
    check_language_switch_repaints,
    check_site,
};
