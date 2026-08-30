/** Every markdown file: paired, at the same version, and its links point somewhere. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";

/*
    Build output, dependencies and vendored third-party code are not ours to hold to
    any of this. HackTimer ships its own README under its own licence.
*/
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "_site", "dist", ".playwright-mcp"]);
const VENDORED = ["resources/js/HackTimer/"];

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
    return found.sort();
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

    if (paired === english.length) {
        console.log(`[check] documentation: ${paired} pairs at matching versions,`
            + ` ${links} relative links resolving, across ${files.length} files`);
    }
}

export {
    check_docs_are_paired,
};
