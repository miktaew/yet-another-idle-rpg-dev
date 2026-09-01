/** Every markdown file: paired, at the same version, and its links point somewhere. */

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";

/*
    Build output, dependencies and vendored third-party code are not ours to hold to
    any of this. HackTimer ships its own README under its own licence.
*/
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "_site", "dist", ".playwright-mcp"]);
const VENDORED = ["resources/js/HackTimer/"];

/**
 * What git actually tracks, or null when git cannot answer.
 *
 * The walk below says "tracked-looking" and never asked. The difference shows up the
 * moment a draft is sitting in the tree unadded - a plan for a later session, a file
 * being written - and the pair rule fails on something the repository does not ship
 * yet. Staging it is what makes it ours, and `git ls-files` reads the index, so a new
 * document is held to the rule from the moment it is added rather than the moment it
 * is committed.
 */
function tracked_markdown(root) {
    try {
        const listed = execFileSync("git", ["-C", root, "ls-files", "-z", "--", "*.md"],
            { encoding: "utf8" });
        return new Set(listed.split("\0").filter(Boolean));
    } catch {
        //No git, or not a checkout - a tarball still deserves the rest of the check.
        return null;
    }
}

/** Every tracked-looking .md file, at any depth. */
function markdown_files(root) {
    const found = [];
    const walk = (dir, prefix) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                if (!SKIP_DIRECTORIES.has(entry.name)) walk(path.join(dir, entry.name), relative);
            } else if (entry.name.endsWith(".md") && !VENDORED.some(v => relative.startsWith(v))) {
                found.push(relative);
            }
        }
    };
    walk(root, "");
    const tracked = tracked_markdown(root);
    return (tracked ? found.filter(f => tracked.has(f)) : found).sort();
}

/**
 * D-3 says documentation ships as a pair, and nothing enforced it.
 *
 * A translation falling behind is invisible: a stale Turkish file reads perfectly well
 * right up to the paragraph that is no longer true. The header of each file carries
 * `doc-source` - which English file it mirrors - and `doc-version`, bumped on every
 * content change, so requiring the two to agree turns "the translation is behind" into
 * a failing check at the moment it happens.
 *
 * This covers every markdown file in the repository rather than only docs/. The root
 * AGENTS.md and README.md have Turkish counterparts too and had never been checked,
 * which is exactly the kind of gap the rule was written to close.
 *
 * It cannot check that the Turkish says what the English says - that is D-7's business
 * and a human's.
 */
async function check_docs_are_paired() {
    const files = markdown_files(repo_root);
    if (files.length === 0) {
        error("no markdown files found - this check is out of date.");
        return;
    }

    const header = (file) => {
        const first = fs.readFileSync(path.join(repo_root, file), "utf8").split("\n")[0];
        return {
            source: (/doc-source:\s*(\S+)/.exec(first) ?? [])[1],
            version: (/doc-version:\s*(\d+)/.exec(first) ?? [])[1],
        };
    };

    let paired = 0;
    const english = files.filter(file => !file.endsWith(".TR.md"));
    for (const file of english) {
        const turkish = file.replace(/\.md$/, ".TR.md");
        if (!files.includes(turkish)) {
            error(`${file} has no Turkish counterpart. Every documentation file ships as a`
                + ` pair (D-3): ${turkish} is missing.`);
            continue;
        }

        const en = header(file);
        const tr = header(turkish);

        if (!en.version) {
            error(`${file} has no doc-version in its first line. The version is what lets the`
                + " pair be checked; without it the translation can drift unseen.");
            continue;
        }
        //Both halves name the ENGLISH file as their source: that one is canonical.
        if (tr.source !== file) {
            error(`${turkish} declares doc-source ${tr.source ?? "(none)"} rather than ${file}.`
                + " The translation names the file it mirrors, and the English file is the"
                + " canonical one.");
        }
        if (en.version !== tr.version) {
            error(`${turkish} is at doc-version ${tr.version ?? "(none)"} while ${file} is at`
                + ` ${en.version}. The translation is behind: update it and match the version,`
                + " or the pair silently stops meaning the same thing.");
        } else {
            paired++;
        }
    }

    /*
        A link that points at nothing is the other way a documentation set rots, and the
        cheapest to catch. Anchors are not followed - a heading can be renamed for good
        reasons - but the file half of `FILE.md#anchor` has to exist.
    */
    let links = 0;
    for (const file of files) {
        const text = fs.readFileSync(path.join(repo_root, file), "utf8");
        for (const link of text.matchAll(/\[[^\]]*\]\(([^)\s]+)/g)) {
            const target = link[1].trim();
            if (/^(https?:|mailto:|#)/.test(target)) continue;
            const [where] = target.split("#");
            if (!where) continue;
            links++;
            if (!fs.existsSync(path.resolve(repo_root, path.dirname(file), where))) {
                error(`${file} links to "${target}", which does not exist.`);
            }
        }
    }

    /*
        A finished proposal leaves PROPOSALS.md (D-9). It is a backlog, not an archive:
        64 of its 78 items were `done` before this rule, which meant the fourteen still
        open were buried in the record of everything that was not. The account lives in
        CHANGELOG.md at developer depth instead.

        The status vocabulary table and the conventions section explain the marker, so
        only numbered items and proposal headings are read.
    */
    for (const file of ["docs/PROPOSALS.md", "docs/PROPOSALS.TR.md"]) {
        const full = path.join(repo_root, file);
        if (!fs.existsSync(full)) continue;
        for (const line of fs.readFileSync(full, "utf8").split("\n")) {
            const is_entry = /^\d+\. \*\*/.test(line) || /^### P-\d+/.test(line);
            /*
                The marker is not always the bare word. Five items said
                `done, as labels rather than behaviour`, `done for what is detectable`
                and the like, and an exact match let all of them sit in the backlog
                after they were finished - so the span only has to START with it.
            */
            if (is_entry && /`(done|bitti|tamam)\b/.test(line)) {
                error(`${file}: "${line.trim().slice(0, 60)}" is finished and still here.`
                    + " Write it up in CHANGELOG.md and remove it - the backlog is what is"
                    + " still open (D-9).");
            }
        }
    }

    if (paired === english.length) {
        console.log(`[check] documentation: ${paired} pairs at matching versions,`
            + ` ${links} relative links resolving, across ${files.length} files`);
    }
}

/**
 * A `---` under a paragraph is not a rule, it is a heading.
 *
 * Markdown reads a run of `-` (or `=`) directly beneath a non-blank line as a setext
 * heading over that line, so a section divider written without the blank line above it
 * silently promotes the sentence before it. It reads correctly in the source and wrong
 * in every viewer, which is how it survived: P-14's closing sentence had been rendering
 * as an `<h2>` in both PROPOSALS halves since it was written, and nothing said so.
 *
 * The guard is the class rather than that one line. Every tracked markdown file is
 * read, fenced code is skipped because markdown is not parsing it, and table delimiter
 * rows never reach here because they start with `|`.
 */
async function check_thematic_breaks_are_not_headings() {
    const files = markdown_files(repo_root);
    let rules = 0;
    let flagged = 0;

    for (const file of files) {
        const lines = fs.readFileSync(path.join(repo_root, file), "utf8").split("\n");
        let fenced = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (/^(```|~~~)/.test(line)) {
                fenced = !fenced;
                continue;
            }
            //Line 0 cannot underline anything, and is where YAML front matter opens.
            if (fenced || i === 0) continue;
            if (!/^(-+|=+)$/.test(line)) continue;

            if (lines[i - 1].trim() === "") {
                rules++;
                continue;
            }
            flagged++;
            error(`${file}:${i + 1} has "${line}" directly under "`
                + `${lines[i - 1].trim().slice(0, 50)}". Markdown reads that as a setext`
                + " heading over the line above rather than as a rule, so the sentence"
                + " renders as a heading. Put a blank line between them.");
        }
    }

    if (flagged === 0) {
        console.log(`[check] markdown rules: ${rules} thematic breaks across ${files.length}`
            + " files, none doubling as a heading");
    }
}

export {
    check_docs_are_paired,
    check_thematic_breaks_are_not_headings,
};
