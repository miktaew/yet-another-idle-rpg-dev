/** Every imported name exists in the module it is imported from. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";
import { source_files, strip_comments } from "../lib/source.mjs";

/**
 * `import { update } from "./main.js"` when main.js does not export `update`.
 *
 * esbuild tolerates this: the bundle built, every check passed, and the game ran. The
 * browser's own ES module loader does not - the un-bundled path failed outright with
 * "The requested module './main.js' does not provide an export named 'update'", and so
 * did any test that loaded the real module graph. crafting.js had carried exactly that
 * for as long as crafting.js had existed, imported and never called, and it surfaced
 * only when an unrelated change pulled that part of the graph into a test.
 *
 * This is the mirror of check_modules_import_what_they_call: that one catches a name
 * used and not imported, this one a name imported and not there. Between them a module's
 * import list has to agree with reality in both directions.
 */
async function check_imports_resolve() {
    const files = source_files(repo_root).map(file => file.replace(/\\/g, "/"));

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

    let checked = 0;
    for (const file of files) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, file), "utf8"));
        //`import Default, { named } from` counts too; see modules.mjs.
        for (const block of source.matchAll(/import\s+(?:\w+\s*,\s*)?\{([^}]*)\}\s*from\s*"([^"]+)"/g)) {
            const target = block[2];
            //Only our own modules: a package or a node builtin is not ours to verify.
            if (!target.startsWith(".")) continue;

            const resolved = path.posix.normalize(
                path.posix.join(path.posix.dirname(file), target));
            const exports = exported_by.get(resolved);
            if (!exports) {
                /*
                    A path may legitimately leave src/ - verifier.js reads
                    "../locales/english.js", which exists and is not a module this
                    check indexes. Only a path that resolves to NOTHING is a fault, so
                    the filesystem is asked before anything is reported.
                */
                if (!fs.existsSync(path.join(repo_root, resolved))) {
                    error(`${file} imports from "${target}", which resolves to no file at`
                        + " all. A path that resolves to nothing fails at load time.");
                }
                continue;
            }

            for (const part of block[1].split(",")) {
                const piece = part.trim();
                if (!piece) continue;
                const name = piece.split(/\s+as\s+/)[0].trim();
                if (!/^[A-Za-z_]\w*$/.test(name)) continue;
                checked++;
                if (!exports.has(name)) {
                    error(`${file} imports "${name}" from ${target}, which does not export it.`
                        + " esbuild tolerates this and the browser's own module loader does not,"
                        + ' so the bundle builds and the un-bundled page fails with "does not'
                        + ' provide an export named".');
                }
            }
        }
    }

    if (checked === 0) {
        error("no named imports found under src/ - this check is out of date.");
        return;
    }
    console.log(`[check] imports resolve: ${checked} imported names across ${files.length} files`);
}

export {
    check_imports_resolve,
};
