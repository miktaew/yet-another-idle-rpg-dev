/** Every module imports what it calls. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";
import { source_files, strip_comments } from "../lib/source.mjs";

/**
 * A module must import every name it calls from another module.
 *
 * `main.js` called `restore_message_log(...)` without importing it. esbuild does not
 * object - an unresolved identifier is a legitimate reference to a runtime global -
 * so the bundle built, the checks passed, and the game threw
 * `ReferenceError: restore_message_log is not defined` in the browser on load. The
 * whole startup after that point did not run, which is what a player saw.
 *
 * This is the narrow, high-value slice of what a linter would do: for every source
 * module, take the names it calls, and fail if any of them is exported by a DIFFERENT
 * module in src/ and not imported here. It cannot catch a typo that matches nothing
 * anywhere, but it catches exactly the mistake above - calling something real that
 * this file cannot see - which is the one that ships.
 */
async function check_modules_import_what_they_call() {
    //Relative to the repository root, and recursive: src/models/ has to be covered too.
    const files = source_files(repo_root);

    const sources = new Map();
    for (const file of files) {
        sources.set(file, strip_comments(fs.readFileSync(path.join(repo_root, file), "utf8")));
    }

    //What each module exports, from its `export { ... }` list and inline `export function`.
    const exported_by = new Map();
    for (const [file, source] of sources) {
        const names = new Set();
        for (const block of source.matchAll(/export\s*\{([^}]*)\}/g)) {
            for (const part of block[1].split(",")) {
                const name = part.trim().split(/\s+as\s+/)[0].trim();
                if (name) names.add(name);
            }
        }
        for (const inline of source.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)) {
            names.add(inline[1]);
        }
        exported_by.set(file, names);
    }

    let checked = 0;
    for (const [file, source] of sources) {
        //What this module imports, under whatever local name.
        const imported = new Set();
        /*
            `import Default, { named } from` counts too. Requiring the brace to follow
            `import` directly missed that form entirely, which reported every name in
            it as an unimported global - measured against upstream, where person.js
            writes exactly that, it invented two findings against correct code.
        */
        for (const block of source.matchAll(/import\s+(?:\w+\s*,\s*)?\{([^}]*)\}\s*from/g)) {
            for (const part of block[1].split(",")) {
                const piece = part.trim();
                if (!piece) continue;
                const as = piece.split(/\s+as\s+/);
                imported.add((as[1] ?? as[0]).trim());
            }
        }
        for (const star of source.matchAll(/import\s+(?:\*\s+as\s+)?(\w+)\s*(?:,|\s+from)/g)) {
            imported.add(star[1]);
        }

        //Names declared in this module, at any depth. Coarse on purpose: a name
        //declared anywhere here is not the bug this check is looking for.
        const declared = new Set();
        for (const pattern of [/(?:^|\s)(?:async\s+)?function\s+(\w+)/g,
                               /(?:const|let|var)\s+(\w+)\s*=/g,
                               /class\s+(\w+)/g]) {
            for (const match of source.matchAll(pattern)) declared.add(match[1]);
        }
        /*
            Destructured declarations too. `const {stats, xp_multipliers} = race` binds
            both names and the bare-name pattern above sees neither, so every use of
            one reads as a missing import - five false findings in one file, measured.
        */
        for (const match of source.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=/g)) {
            for (const part of match[1].split(",")) {
                const name = part.split("=")[0].split(":").pop().trim();
                if (/^[A-Za-z_]\w*$/.test(name)) declared.add(name);
            }
        }
        /*
            Parameters count as declared. display.js takes the stance registry as an argument
            because it cannot import it - line 28 keeps that import commented out on purpose,
            since the edge breaks the bundle - so `stances[...]` inside those functions is a
            parameter, not a missing import, and reporting it would be the check crying wolf
            about the very workaround that keeps the game loading.
        */
        /*
            Arrow parameters count too, and did not until the `${name}` shape was added.
            translation.js writes `load = async(language) => {` and interpolates
            `${language}` inside it, so the widened matcher reported a parameter as a
            missing import - the check crying wolf about correct code, which is worse
            than the gap it was closing.
        */
        /*
            A class method is not written `function name(...)`, so its parameters
            were invisible: hero.js declares `addBookBonus({xp_multipliers = {}})`
            and every use of that parameter inside it read as a missing import.
        */
        for (const params of source.matchAll(
                /function\s*\w*\s*\(([^)]*)\)|\(([^)]*)\)\s*=>|(?:^|[\s(,=])([A-Za-z_]\w*)\s*=>|^\s{4}(?:async\s+)?[A-Za-z_]\w*\s*\(([^)]*)\)\s*\{/gm)) {
            const list = params[1] ?? params[2] ?? params[3] ?? params[4] ?? "";
            for (const part of list.split(",")) {
                const name = part.split("=")[0].replace(/[{}[\]]/g, "").split(":").pop().trim();
                if (/^[A-Za-z_]\w*$/.test(name)) declared.add(name);
            }
        }

        /*
            A handler written as markup is not a call. display.js builds them as strings -
            setAttribute("onclick", "change_location({...})") - and the name inside one is
            resolved against the global object when somebody clicks it, which is what
            check_onclick_names_are_reachable covers instead.

            Skipped line by line rather than by stripping every quoted string first. That
            was the first attempt and it is not safe across six thousand lines: one
            unbalanced quote anywhere above desynchronises the scan below it, and measured,
            it silently stopped catching two real missing imports in save_load.js.
        */
        const source_lines = source.split("\n");

        //Every name used in call position.
        /*
            Three shapes, not one. The check began by looking only at `name(`, and
            `effect_templates[effect]` walked straight past it into a shipped build: esbuild
            left it as a runtime global, the bundle evaluated fine, and the loader threw
            ReferenceError the moment a player loaded a save - taking everything after that
            line in load() with it, which is why favourited places vanished too.

            `name[` and `new name(` are added rather than every bare mention, because a bare
            mention is mostly prose: Book, Skill and Location all appear inside console
            messages in save_load.js and none of them is a reference.
        */
        /*
            The lookbehind has to let a spread through. `{...effect_templates[effect]}` puts a
            dot immediately before the name, which is indistinguishable from property access
            to a plain `(?<![.\w$])` - and that is exactly how this one reached a player:
            the reference the check was widened to catch was hidden by the widening's own
            lookbehind.
        */
        /*
            A fourth shape: `${name}`. Moving the stance list into its own module left
            `[data-stance='${selected_stance}']` behind, which is a plain value inside a
            template literal - not a call, not a subscript, not a construction - and it
            went past all three. The bundle built and the page came up blank.

            Low noise, because an interpolation is never prose: what is inside `${}` is
            always evaluated.
        */
        /*
            And a fifth: `name.property`, which is how an imported object is normally
            used and which all four earlier shapes missed. `character.bonus_skill_levels`
            went into skills_display.js unimported, built clean, evaluated clean, and
            threw the moment a save loaded - the same failure as effect_templates, one
            shape along.

            Measured before adding, because a dot is common: across all 51 modules it
            produces exactly one hit, the real one, once module paths are excluded.
            "./character.js" otherwise reads as `character` followed by `.j`.
        */
        const reference = /(?:(?<=\.\.\.)|(?<![.\w$]))(?:([a-z_][A-Za-z0-9_]*)\s*[([.]|new\s+([A-Z]\w*)\s*\()|\$\{\s*([a-z_][A-Za-z0-9_]*)\s*[}.[]/g;
        for (const call of source.matchAll(reference)) {
            const name = call[1] ?? call[2] ?? call[3];
            if (declared.has(name) || imported.has(name)) continue;

            const line = source_lines[source.slice(0, call.index).split("\n").length - 1] ?? "";
            if (line.includes("onclick")) continue;
            //A module path is not a reference.
            if (/^\s*(?:import|export)\b/.test(line) || line.includes('from "')) continue;

            const owner = [...exported_by].find(([other, names]) => other !== file && names.has(name));
            if (!owner) continue;

            checked++;
            error(`${file} uses ${name}, which ${owner[0]} exports and this file does not`
                + " import. esbuild treats an unresolved identifier as a runtime global, so this"
                + " builds and then throws ReferenceError in the browser.");
        }
    }
    if (checked === 0) {
        console.log(`[check] modules import what they call: ${files.length} files`);
    }
}


/**
 * Every source path a check names still exists.
 *
 * The checks reach into the source by string - `readFileSync(path.join(repo_root,
 * "src/items.js"))`, `load_browser_free(repo_root, ["src/quests.js"])` - forty-one paths
 * across the suite. That is the right way to ask the source a question, and it is also a
 * reference the compiler cannot see: renaming or moving a file leaves the string pointing at
 * nothing.
 *
 * **Written before P-42's folder fold rather than after it**, because the fold is forty-three
 * files moving at once and this is the difference between finding out and not. Most of the
 * readers would throw, which is loud and fine. The ones that would not are the reason this
 * exists: a check that globs, one that collects several files and skips what it cannot read,
 * one guarded by `existsSync` that returns early having reported nothing - 115 reads in the
 * suite against 28 existence guards. A derivation reading the wrong place does not fail, it
 * lies, and this project has paid for that lesson twice: 171 errors naming materials that
 * worked perfectly, and 255 saying nothing could give the player a recipe that anyone could
 * craft.
 *
 * The paths are read out of the checks themselves rather than listed, so a check added
 * tomorrow is covered without anything being maintained here.
 */
function check_every_source_path_a_check_names_exists() {
    const named = new Map();

    const walk = (directory) => {
        for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
            const full = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(full);
                continue;
            }
            if (!/\.mjs$/.test(entry.name)) {
                continue;
            }
            const text = fs.readFileSync(full, "utf8");
            /*
                Only paths into the game itself. A check naming another check is an import,
                which the module loader has already resolved by the time this runs.
            */
            for (const found of text.matchAll(
                    /"((?:src|locales|docs)\/[A-Za-z0-9_\/.-]+\.(?:js|json|md))"/g)) {
                if (!named.has(found[1])) {
                    named.set(found[1], new Set());
                }
                named.get(found[1]).add(path.relative(repo_root, full).replace(/\\/g, "/"));
            }
        }
    };
    walk(path.join(repo_root, "tests"));

    if (named.size < 20) {
        error(`only ${named.size} source path(s) could be read out of the checks - `
            + `check_every_source_path_a_check_names_exists is out of date and would accept `
            + `anything.`);
        return;
    }

    let gone = 0;
    for (const [target, readers] of named) {
        if (fs.existsSync(path.join(repo_root, target))) {
            continue;
        }
        gone++;
        const message = `${[...readers].join(", ")} names "${target}", which does not exist. `
            + `A check that reaches into the source by string has no compiler to catch a `
            + `move: depending on how it reads, it either throws or quietly measures nothing `
            + `and reports everything as fine.`;
        error(message);
        /*
            Said immediately as well as recorded, which no other check does and this one has
            to. report.mjs collects errors and prints them at the end so a run reports
            everything it found - but a moved source file usually makes a LATER check throw
            out of the module loader, which kills the process before that flush. The first
            attempt at this check was invisible for exactly that reason: it found the missing
            file, recorded it, and the run died three checks later with
            ERR_MODULE_NOT_FOUND and no mention of it. This check runs first precisely to
            explain the crash that is about to happen, so it cannot wait for a summary that
            will not be reached.
        */
        console.error(`[check] ERROR ${message}`);
    }

    if (gone === 0) {
        console.log(`[check] source paths: ${named.size} path(s) named by the checks, `
            + `all of them present`);
    }
}

export {
    check_modules_import_what_they_call,
    check_every_source_path_a_check_names_exists,
};
