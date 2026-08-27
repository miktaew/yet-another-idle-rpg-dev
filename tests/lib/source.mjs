/**
 * Reading source text without running it.
 *
 * The checks work on the text of src/ rather than on imported modules, because most
 * of src/ cannot be imported in Node: the project's imports are circular by design
 * and that cycle only resolves in a browser. These are the primitives that make
 * reading it bearable - stripping comments so a commented-out declaration does not
 * count, finding the body of an object literal, listing its top-level keys.
 */

import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Blanks out comments, keeping every other byte at its original offset so line
 * numbers in an error still point at the right place.
 *
 * A plain /*...*\/ regex is not enough here: a source file with several
 * commented-out blocks, or with a "*\/" inside a string, makes it pair the wrong
 * delimiters and swallow live code, which silently shrinks this check.
 */
function strip_comments(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    while (i < n) {
        const c = src[i], next = src[i + 1];
        if (c === "/" && next === "*") {
            let end = src.indexOf("*/", i + 2);
            end = end === -1 ? n : end + 2;
            out += src.slice(i, end).replace(/[^\n]/g, " ");
            i = end;
        } else if (c === "/" && next === "/") {
            let end = src.indexOf("\n", i);
            if (end === -1) { end = n; }
            out += " ".repeat(end - i);
            i = end;
        } else if (c === '"' || c === "'" || c === "`") {
            const start = i;
            i++;
            while (i < n && src[i] !== c) {
                if (src[i] === "\\") { i++; }
                i++;
            }
            i++;
            out += src.slice(start, Math.min(i, n));
        } else {
            out += c;
            i++;
        }
    }
    return out;
}

/** The source text of the object literal starting at the `{` at `open`. */
function braced_body(source, open) {
    let depth = 0;
    for (let i = open; i < source.length; i++) {
        if (source[i] === "{") { depth++; }
        else if (source[i] === "}") {
            depth--;
            if (depth === 0) { return source.slice(open + 1, i); }
        }
    }
    return null;
}

/** Top-level `key:` names of an object literal body, ignoring nested ones. */
function top_level_keys(body) {
    const keys = [];
    let depth = 0;
    for (const line of body.split("\n")) {
        const trimmed = line.trim();
        if (depth === 0) {
            const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:/);
            if (match) { keys.push(match[1]); }
        }
        for (const character of line) {
            if (character === "{" || character === "[") { depth++; }
            else if (character === "}" || character === "]") { depth--; }
        }
    }
    return keys;
}

/**
 * Removes every ${...} from a template literal body, nesting included.
 *
 * A regex cannot do this: `${getText(language, "id", {v1: getText(...)})}` is three
 * levels of braces deep, and a non-nesting pattern stops at the first `}` and
 * leaves the tail behind as what looks like prose.
 */
function strip_interpolations(body) {
    let out = "";
    let i = 0;
    while (i < body.length) {
        if (body[i] === "$" && body[i + 1] === "{") {
            let depth = 0;
            i++;
            do {
                if (body[i] === "{") { depth++; }
                if (body[i] === "}") { depth--; }
                i++;
            } while (i < body.length && depth > 0);
            out += " ";
            continue;
        }
        out += body[i];
        i++;
    }
    return out;
}

/**
 * Every string literal in the source, with its offset and starting line.
 *
 * Walks characters because a template literal can span lines, and splitting on
 * newlines first reports each half as if it were a whole string - which is how a
 * `<i class="material-icons">` opening tag came to look like prose once the closing
 * tag moved to the next line. Comments are already blanked by strip_comments, so
 * anything quoted here is real code.
 *
 * @returns {{body: String, start: Number, line: Number}[]}
 */
function read_string_literals(source) {
    const found = [];
    let i = 0;
    let line = 1;
    while (i < source.length) {
        const c = source[i];
        if (c === "\n") { line++; i++; continue; }
        if (c !== '"' && c !== "'" && c !== "`") { i++; continue; }

        const start = i;
        const start_line = line;
        let body = "";
        i++;
        while (i < source.length && source[i] !== c) {
            if (source[i] === "\\") { body += source[i] + (source[i + 1] ?? ""); i += 2; continue; }
            if (source[i] === "\n") { line++; }
            body += source[i];
            i++;
        }
        i++;
        found.push({ body, start, line: start_line });
    }
    return found;
}

/**
 * Every .js file under src/, at any depth, as paths relative to the repository root.
 *
 * Five checks used to call readdirSync on src/ directly, which is not recursive - so the
 * moment src/models/ appeared, every one of them silently stopped covering the files
 * inside it. A check that quietly shrinks its own scope is worse than no check, so the
 * walk lives here and they all share it.
 *
 * Sorted, so a failure lists files in the same order every run.
 */
function source_files(repo_root, sub_directory = "src") {
    const root = path.join(repo_root, sub_directory);
    const found = [];

    const walk = (directory, prefix) => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const relative = `${prefix}/${entry.name}`;
            if (entry.isDirectory()) {
                walk(path.join(directory, entry.name), relative);
            } else if (entry.name.endsWith(".js")) {
                found.push(relative);
            }
        }
    };

    walk(root, sub_directory);
    return found.sort();
}

export {
    braced_body,
    read_string_literals,
    source_files,
    strip_comments,
    strip_interpolations,
    top_level_keys,
};
