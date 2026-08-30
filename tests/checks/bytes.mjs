/** No tracked text file carries a raw control byte. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";

const SKIP_DIRECTORIES = new Set([".git", "node_modules", "_site", "dist", ".playwright-mcp"]);
const VENDORED = ["resources/js/HackTimer/"];
const TEXT = [".js", ".mjs", ".json", ".md", ".html", ".css", ".yml"];

/**
 * A NUL byte written into source instead of the two-character `\0` escape.
 *
 * It cost time three times before this check existed. `tests/checks/content.mjs` used
 * the byte itself as a sentinel, which made grep call the whole file binary - a search
 * for a function inside it returned nothing at all, with no error to explain why. Then
 * both PROPOSALS files picked one up from the very entry describing the first case,
 * because a shell heredoc collapsed the escape back into the byte.
 *
 * Same value either way; the byte is the version that breaks grep, makes a diff
 * unreadable, and is one careless editor save from vanishing. So: no raw NUL, and no
 * other C0 control character except the tab, newline and carriage return that text
 * legitimately contains.
 */
function text_files(root) {
    const found = [];
    const walk = (dir, prefix) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                if (!SKIP_DIRECTORIES.has(entry.name)) walk(path.join(dir, entry.name), relative);
            } else if (TEXT.includes(path.extname(entry.name))
                       && !VENDORED.some(v => relative.startsWith(v))) {
                found.push(relative);
            }
        }
    };
    walk(root, "");
    return found;
}

async function check_no_raw_control_bytes() {
    const files = text_files(repo_root);
    if (files.length === 0) {
        error("no text files found - this check is out of date.");
        return;
    }

    let scanned = 0;
    for (const file of files) {
        const bytes = fs.readFileSync(path.join(repo_root, file));
        scanned++;
        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            //Tab, newline and carriage return are the three that belong in text.
            if (byte >= 0x20 || byte === 0x09 || byte === 0x0a || byte === 0x0d) continue;
            const around = bytes.slice(Math.max(0, i - 40), i).toString("utf8").split("\n").pop();
            error(`${file} contains a raw control byte 0x${byte.toString(16).padStart(2, "0")}`
                + ` at offset ${i}, after "${around}". Write it as an escape: the byte itself`
                + " makes grep treat the file as binary and a diff of it unreadable.");
            break;   //One report per file is enough to act on.
        }
    }

    console.log(`[check] no raw control bytes: ${scanned} text files`);
}

export {
    check_no_raw_control_bytes,
};
