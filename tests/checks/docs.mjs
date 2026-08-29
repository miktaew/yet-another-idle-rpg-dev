/** Every English doc has a Turkish counterpart, at the same version. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";

/**
 * D-3 says documentation ships as a pair: NAME.md and NAME.TR.md, English canonical.
 * Nothing enforced it, so the only thing keeping a translation current was remembering
 * to update it - and the pair drifts silently, because a stale Turkish file reads
 * perfectly well right up to the paragraph that is no longer true.
 *
 * The header of each file carries `doc-source` (which English file it mirrors) and
 * `doc-version` (bumped on every content change). Requiring the two to agree turns
 * "the translation is behind" into a failing check at the moment it happens, rather
 * than a discovery months later.
 *
 * This checks that the pair exists and claims the same version. It cannot check that
 * the Turkish text actually says what the English text says - that is D-7's business
 * and a human's.
 */
async function check_docs_are_paired() {
    const docs = path.join(repo_root, "docs");
    if (!fs.existsSync(docs)) {
        error("docs/ is missing - this check is out of date.");
        return;
    }

    const header = (file) => {
        const first = fs.readFileSync(path.join(docs, file), "utf8").split("\n")[0];
        return {
            source: (/doc-source:\s*(\S+)/.exec(first) ?? [])[1],
            version: (/doc-version:\s*(\d+)/.exec(first) ?? [])[1],
        };
    };

    const english = fs.readdirSync(docs)
        .filter(name => name.endsWith(".md") && !name.endsWith(".TR.md"));

    let paired = 0;
    for (const file of english) {
        const turkish = file.replace(/\.md$/, ".TR.md");
        if (!fs.existsSync(path.join(docs, turkish))) {
            error(`docs/${file} has no Turkish counterpart. Every documentation file ships`
                + ` as a pair (D-3): docs/${turkish} is missing.`);
            continue;
        }

        const en = header(file);
        const tr = header(turkish);

        if (!en.version) {
            error(`docs/${file} has no doc-version in its first line. The version is what`
                + " lets the pair be checked; without it the translation can drift unseen.");
            continue;
        }
        //Both halves name the ENGLISH file as their source: the English one is canonical.
        if (tr.source !== `docs/${file}`) {
            error(`docs/${turkish} declares doc-source ${tr.source ?? "(none)"} rather than`
                + ` docs/${file}. The translation names the file it mirrors, and the English`
                + " file is the canonical one.");
        }
        if (en.version !== tr.version) {
            error(`docs/${turkish} is at doc-version ${tr.version ?? "(none)"} while`
                + ` docs/${file} is at ${en.version}. The translation is behind: update it and`
                + " match the version, or the pair silently stops meaning the same thing.");
        } else {
            paired++;
        }
    }

    if (paired === english.length) {
        console.log(`[check] documentation pairs: ${paired} English files, each with a Turkish`
            + " counterpart at the same version");
    }
}

export {
    check_docs_are_paired,
};
