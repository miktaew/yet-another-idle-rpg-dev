"use strict";

/**
 * Site builder.
 *
 * Two things happen here, in order:
 *   1. esbuild bundles src/main.js into dist/bundle.js (same output path the
 *      legacy build.js uses, so the committed bundle stays refreshable).
 *   2. The deployable site is assembled into _site/ — a copy of the static root
 *      files with index.html rewritten to load the bundle instead of src/main.js.
 *
 * Why a separate _site/ instead of deploying dist/ or the repo root:
 *   - dist/ is a committed artifact that only ever holds the bundle; overloading
 *     it with a full site copy would make the tracked contents unpredictable.
 *   - The repo root is the DEV entry point: index.html deliberately points at
 *     src/main.js so the game runs off a plain static server with no build step.
 *     Rewriting that file in place (as build.js does) dirties a tracked file on
 *     every CI run, so the rewrite is applied to the _site/ copy only.
 *
 * IMPORTANT for translations: esbuild resolves the dynamic import in
 * src/translation.js (`import(`../locales/${language}.js`)`) by globbing the
 * locales/ directory at BUILD time and inlining every match into the bundle.
 * A newly added locale file is therefore invisible to bundle mode until the next
 * build. Dev mode (src/main.js) fetches it at runtime and needs no rebuild.
 */

import * as esbuild from "esbuild";
import * as fs from "node:fs";
import * as path from "node:path";
import { get_game_version } from "../src/game_version.js";

const repo_root = path.resolve(import.meta.dirname, "..");
const site_dir = path.join(repo_root, "_site");
const version = get_game_version();

// Static files copied verbatim into the site. Paths are repo-root relative.
const static_files = [
    "index.html",
    "help.html",
    "changelog.html",
    "style.css",
    "favicon.ico",
    "robots.txt",
];

// Directories copied recursively. `locales` is included so that a site served in
// dev mode still resolves them; in bundle mode they are already inlined.
const static_dirs = [
    "dist",
    "locales",
    "resources",
];

function fail(message) {
    console.error(`[build-site] ${message}`);
    process.exit(1);
}

async function bundle() {
    await esbuild.build({
        entryPoints: [path.join(repo_root, "src/main.js")],
        bundle: true,
        sourcemap: true,
        minify: true,
        outfile: path.join(repo_root, "dist/bundle.js"),
        platform: "browser",
        target: "es2022",
        format: "esm",
        //esbuild defaults to an ascii charset, which escapes every non-ASCII
        //character in a string literal as a six-byte \u escape where UTF-8 needs
        //two. That is a real cost once the locales are not all English, and it
        //makes the built output impossible to grep. index.html declares
        //<meta charset="UTF-8">, so emitting UTF-8 directly is safe.
        charset: "utf8",
        logLevel: "info",
    });
    console.log("[build-site] bundle written to dist/bundle.js");
}

/**
 * Rewrites the dev index.html into its deployable form.
 * Every substitution is asserted, so a change to index.html that breaks an
 * assumption fails the build loudly instead of shipping a blank page.
 */
function transform_index(html) {
    const steps = [
        {
            name: "drop the commented-out bundle script tag",
            // The dev file keeps the bundle tag commented out next to the live
            // src/main.js tag; remove it so only one script tag remains.
            // Lazy, single-line match: the tag body contains ">" characters
            // (`></script-->`), so a [^>]* run cannot reach the closing "-->".
            pattern: /[ \t]*<!--[^\n]*?dist\/bundle\.js[^\n]*?-->[ \t]*\r?\n/,
            replacement: "",
            required: true,
        },
        {
            name: "point the module script at the bundle",
            pattern: /src\s*=\s*"src\/main\.js"/,
            replacement: `src="dist/bundle.js?version=${version}"`,
            required: true,
        },
        {
            name: "stamp the stylesheet version",
            pattern: /style\.css\?version=[^&"]+/,
            replacement: `style.css?version=${version}`,
            required: true,
        },
    ];

    let out = html;
    for (const step of steps) {
        if (!step.pattern.test(out)) {
            if (step.required) {
                fail(`index.html transform failed - could not ${step.name}. ` +
                     `The file's script/style tags no longer match what this build expects.`);
            }
            continue;
        }
        out = out.replace(step.pattern, step.replacement);
    }

    if (/src\s*=\s*"src\/main\.js"/.test(out)) {
        fail("index.html still references src/main.js after transform.");
    }
    return out;
}

function assemble() {
    fs.rmSync(site_dir, { recursive: true, force: true });
    fs.mkdirSync(site_dir, { recursive: true });

    for (const file of static_files) {
        const from = path.join(repo_root, file);
        if (!fs.existsSync(from)) {
            fail(`expected static file is missing: ${file}`);
        }
        fs.copyFileSync(from, path.join(site_dir, file));
    }

    for (const dir of static_dirs) {
        const from = path.join(repo_root, dir);
        if (!fs.existsSync(from)) {
            fail(`expected directory is missing: ${dir}`);
        }
        fs.cpSync(from, path.join(site_dir, dir), { recursive: true });
    }

    const index_path = path.join(site_dir, "index.html");
    const html = fs.readFileSync(index_path, "utf8");
    fs.writeFileSync(index_path, transform_index(html));

    console.log(`[build-site] site assembled in _site/ (version ${version})`);
}

await bundle();
assemble();
