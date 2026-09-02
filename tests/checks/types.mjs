/** Type checking, and whether it is allowed to go backwards. */

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { repo_root } from "../lib/context.mjs";
import { error, warn } from "../lib/report.mjs";
import { source_files } from "../lib/source.mjs";

/**
 * TypeScript's own entry script, or null when nobody has installed it.
 *
 * Deliberately not `node_modules/.bin/tsc` - that is a shell script on one platform and a
 * `.cmd` shim on the other, and Node refuses to spawn a `.cmd` without a shell (EINVAL). The
 * package's real entry point is plain JavaScript, so `node` can run it anywhere.
 */
function tsc_path() {
    const full = path.join(repo_root, "node_modules", "typescript", "bin", "tsc");
    return fs.existsSync(full) ? full : null;
}

/**
 * Which files TypeScript can check clean, asked of TypeScript rather than remembered.
 *
 * Run against a throwaway config with `checkJs` on for everything, so the answer is "what
 * would pass if this file were opted in" for every file at once. Two seconds, and it needs no
 * list to maintain.
 */
function files_that_would_pass(tsc) {
    const config = {
        compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "bundler",
            allowJs: true,
            checkJs: true,
            noEmit: true,
            strict: false,
            skipLibCheck: true,
        },
        include: ["src/**/*.js"],
    };
    //Written into the repo root, not the temp directory. An `include` pattern resolves against
    //the config file's OWN directory, so a config in /tmp asking for a pattern under src/
    //matches nothing - and tsc then exits clean, having checked nothing, which read as "every
    //file passes" and asked for a pragma on all 38 files that do not.
    const written = path.join(repo_root, `.typecheck-probe-${process.pid}.json`);
    fs.writeFileSync(written, JSON.stringify(config));

    let output = "";
    let ran = true;
    try {
        //1690 errors is a megabyte and a half of text, and execFileSync's default maxBuffer is
        //one megabyte - over which it KILLS the process and hands back empty output rather
        //than raising. That read as "tsc found nothing", which is the answer this check most
        //needs to never get wrong.
        execFileSync(process.execPath, [tsc, "-p", written], {cwd: repo_root, encoding: "utf8",
            maxBuffer: 64 * 1024 * 1024});
    } catch (failure) {
        //tsc exits non-zero when it reports anything, which is the normal case here. A null
        //status is not that: it means tsc never exited on its own, so its output is not an
        //answer and must not be treated as one.
        ran = failure.status !== null && failure.status !== undefined;
        output = `${failure.stdout ?? ""}${failure.stderr ?? ""}`;
    } finally {
        fs.rmSync(written, {force: true});
    }

    const complained = new Set();
    for (const line of output.split("\n")) {
        const m = /^(.+?)\((\d+),(\d+)\): error TS/.exec(line.trim());
        if (!m) continue;
        //Paths come back either absolute or relative to the repo, so normalise both.
        const relative = path.relative(repo_root, path.resolve(repo_root, m[1]))
            .replaceAll("\\", "/");
        complained.add(relative);
    }

    return {complained, ran, saw_output: output.length > 0};
}

/**
 * A file that type-checks clean carries `// @ts-check`.
 *
 * The opt-in is the whole design (P-42): `checkJs` is off in `jsconfig.json` because turning
 * it on reports 1667 errors across 38 of 56 files, and a gate nobody can go green on is a gate
 * that gets deleted. So a file opts in with a pragma - and the danger of an opt-in is that it
 * only ever has to go **backwards** to keep passing. Delete the pragma and the errors go away.
 *
 * This is the ratchet. It asks TypeScript which files would pass if they were checked, and
 * every one of those has to be opted in. There is no list to maintain and no number to keep
 * in step: fix a file and the check tells you to opt it in; silence a file by removing its
 * pragma and the check puts it straight back.
 */
function check_checked_files_stay_checked() {
    const tsc = tsc_path();
    if (tsc === null) {
        error("typescript is a devDependency and is not installed - run `npm install`. "
            + "check_checked_files_stay_checked cannot say anything without it, and a check "
            + "that quietly skips is a check that has stopped working.");
        return;
    }

    const {complained, ran, saw_output} = files_that_would_pass(tsc);
    if (!ran) {
        error("tsc did not exit on its own, so this check has no answer about which files "
            + "would pass. It is not reporting an empty result as a clean one.");
        return;
    }
    if (!saw_output) {
        warn("tsc reported nothing at all with checkJs on for everything, which has never been "
            + "true of this codebase. check_checked_files_stay_checked may be misreading it.");
    }

    const opted_in = new Set();
    const clean = [];
    for (const relative of source_files(repo_root)) {
        const source = fs.readFileSync(path.join(repo_root, relative), "utf8");
        //Only the pragma near the top counts, which is where TypeScript looks for it too.
        if (/^[\s\S]{0,400}?\/\/\s*@ts-check/.test(source)) {
            opted_in.add(relative);
            /*
                And it has to come before every STATEMENT, which is the rule that had this
                whole gate inert for four versions.

                `// @ts-check` must sit in the file's leading comment block. `"use strict";`
                is a statement, so a pragma written under it is an ordinary comment and
                TypeScript does not check the file at all. Twenty-six files were opted in
                that way and `npm run check:types` passed while checking **nothing** -
                proved by planting `const x = "not a number"` under a `@type {Number}` in an
                opted-in file and watching the gate stay green.

                This check could not have noticed on its own: it measures which files WOULD
                pass using a project-wide `checkJs` probe, and that probe ignores pragmas
                entirely. So the placement is asserted here, from the source.
            */
            const before = source.slice(0, source.search(/\/\/\s*@ts-check/));
            //Comments and blank lines may precede the pragma; nothing else may.
            const statement = before
                .replace(/\/\*[\s\S]*?\*\//g, "")
                .replace(/^\s*\/\/.*$/gm, "")
                .trim();
            if (statement.length > 0) {
                const first = statement.split("\n")[0].trim().slice(0, 30);
                error(`${relative} carries "// @ts-check" after "${first}". The pragma has `
                    + `to precede every statement - TypeScript reads it out of the leading `
                    + `comment block only - so this file is NOT being checked, and the gate `
                    + `passes without having looked at it.`);
            }
        }
        if (!complained.has(relative)) {
            clean.push(relative);
        }
    }

    for (const relative of clean) {
        if (opted_in.has(relative)) continue;
        error(`${relative} passes type checking and does not carry "// @ts-check", so nothing `
            + `is checking it. Add the pragma: the opt-in set is meant to grow, and a file `
            + `that already passes costs nothing to hold.`);
    }

    /*
        And the other direction, as a warning: a pragma on a file that does not pass would fail
        `npm run check:types` anyway, so it needs no error of its own here - but saying it is
        useful, because the failure will be a wall of tsc output rather than a sentence.
    */
    for (const relative of opted_in) {
        if (!complained.has(relative)) continue;
        warn(`${relative} carries "// @ts-check" and does not pass; npm run check:types will `
            + `say what is wrong with it.`);
    }

    console.log(`[check] type checking: ${opted_in.size} of ${source_files(repo_root).length} `
        + `file(s) opted in, ${clean.length} would pass`);
}

export { check_checked_files_stay_checked };
