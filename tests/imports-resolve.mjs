/**
 * Every imported name exists in the module it is imported from.
 *
 *     node tests/imports-resolve.mjs
 *
 * Standalone and dependency-free, like tests/bundle-loads.mjs. Exits non-zero on a
 * finding, so it can be a build step or left alone.
 *
 * The point: esbuild does not object to `import { update } from "./main.js"` when
 * main.js has no such export. The bundle builds, the game runs, and the only thing that
 * refuses is the browser's own module loader - so a repository that ships a bundle can
 * carry a broken import for a long time and only the un-bundled page says so.
 *
 * Found three in src/mods/glassmaking.js, which had been importing from paths that
 * moved into src/data/ and src/models/ and had not been loadable since.
 */

import * as fs from "node:fs";
import * as path from "node:path";

const repo_root = path.resolve(import.meta.dirname, "..");

/** Every .js file under src/, at any depth. */
function source_files(dir, prefix = "src") {
    const found = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const relative = `${prefix}/${entry.name}`;
        if (entry.isDirectory()) {
            found.push(...source_files(path.join(dir, entry.name), relative));
        } else if (entry.name.endsWith(".js")) {
            found.push(relative);
        }
    }
    return found;
}

/*
    Comments are blanked rather than removed, so every offset stays where it was and a
    commented-out import cannot be mistaken for a live one.
*/
function strip_comments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, block => block.replace(/[^\n]/g, " "))
        .replace(/(^|[^:])\/\/[^\n]*/g, (line, before) =>
            before + " ".repeat(line.length - before.length));
}

/*
    Exists AND is spelled the way it was asked for.

    fs.existsSync answers case-insensitively on Windows and macOS, so "../models/NPC.js"
    looks fine on the machine it was written on and resolves to nothing on Linux. Walking
    the directory listing instead compares against the real name on disk, so the answer
    is the same everywhere - which is the point, since the platform that disagrees is
    usually the one nobody runs the check on.
*/
function exists_with_exact_case(relative) {
    let here = repo_root;
    for (const segment of relative.split("/")) {
        if (segment === "" || segment === ".") continue;
        let listing;
        try {
            listing = fs.readdirSync(here);
        } catch {
            return false;
        }
        if (!listing.includes(segment)) return false;
        here = path.join(here, segment);
    }
    return true;
}

const files = source_files(path.join(repo_root, "src"));

//What each module offers, under the name an importer would ask for.
const exported_by = new Map();
for (const file of files) {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, file), "utf8"));
    const names = new Set();
    for (const block of source.matchAll(/export\s*\{([^}]*)\}/g)) {
        for (const part of block[1].split(",")) {
            const piece = part.trim();
            if (!piece) continue;
            //`a as b` is offered as b, which is the name an importer writes.
            const halves = piece.split(/\s+as\s+/);
            names.add((halves[1] ?? halves[0]).trim());
        }
    }
    for (const inline of source.matchAll(
            /export\s+(?:async\s+)?(?:function|const|let|var|class)\s+(\w+)/g)) {
        names.add(inline[1]);
    }
    if (/export\s+default/.test(source)) {
        names.add("default");
    }
    exported_by.set(file, names);
}

const problems = [];
let checked = 0;
for (const file of files) {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, file), "utf8"));

    /*
        Where a path points is asked of EVERY form of import, because the forms that
        carry no braces are not the safe ones: `import NPC from "../models/NPC.js"` is
        exactly how the case bug above was written.
    */
    for (const statement of source.matchAll(
            /import\s+[^"';]*?from\s*["']([^"']+)["']|import\s*\(?\s*["']([^"']+)["']/g)) {
        const target = statement[1] ?? statement[2];
        //Only relative paths: a package or a node builtin is not this check's business.
        if (!target.startsWith(".")) continue;

        const resolved = path.posix.normalize(
            path.posix.join(path.posix.dirname(file), target));
        if (exported_by.has(resolved)) continue;
        if (!exists_with_exact_case(resolved)) {
            //Name the case trap outright, because on this machine it may look present.
            const miscased = fs.existsSync(path.join(repo_root, resolved));
            problems.push(miscased
                ? `${file} imports from "${target}", which is spelled differently on `
                  + `disk. It resolves here and will not resolve on Linux.`
                : `${file} imports from "${target}", which resolves to no file.`);
        }
    }

    //`import Default, { named } from` counts as well as `import { named } from`.
    for (const block of source.matchAll(
            /import\s+(?:\w+\s*,\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
        const target = block[2];
        if (!target.startsWith(".")) continue;

        const resolved = path.posix.normalize(
            path.posix.join(path.posix.dirname(file), target));
        const exports = exported_by.get(resolved);
        /*
            A path that resolves to nothing was reported above; do not say it twice. A
            path that leaves src/ has no export list here, and nothing to say about it.
        */
        if (!exports) continue;

        for (const part of block[1].split(",")) {
            const piece = part.trim();
            if (!piece) continue;
            const name = piece.split(/\s+as\s+/)[0].trim();
            if (!/^[A-Za-z_]\w*$/.test(name)) continue;
            checked++;
            if (!exports.has(name)) {
                problems.push(`${file} imports "${name}" from ${target}, which does not export it.`);
            }
        }
    }
}

if (problems.length > 0) {
    console.error(`[imports] ${problems.length} unresolved import(s):`);
    for (const problem of problems) {
        console.error(`  ${problem}`);
    }
    process.exit(1);
}
console.log(`[imports] ${checked} imported names across ${files.length} files all resolve.`);
