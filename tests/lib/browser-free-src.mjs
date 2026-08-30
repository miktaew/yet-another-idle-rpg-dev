/**
 * Loads a module from src/ for real, by cutting the import cycle at its two ends.
 *
 * Most of src/ cannot be imported in Node. The imports are circular by design - thirteen
 * modules import back from main.js - and main.js reaches display.js, which touches
 * `document` at module scope. The cycle only resolves in a browser, where main.js is the
 * entry point.
 *
 * So main.js and display.js are replaced with generated stub modules that export every
 * name the rest of src/ imports from them, and nothing else is touched. items.js,
 * translation.js, the component generator and the real locale files all load unchanged,
 * which means a test can call the SHIPPED accessors - getDisplayName(), getDefense(),
 * getName() - rather than a reimplementation of them.
 *
 * The export lists are derived from the source at load time rather than written down, so
 * a new import from main.js or display.js cannot silently break this.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

/** Every .js file under src/, at any depth. */
function source_files(dir) {
    const found = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            found.push(...source_files(full));
        } else if (entry.name.endsWith(".js")) {
            found.push(full);
        }
    }
    return found;
}

/**
 * Every name anything under src/ imports from <module>.js, except that module itself.
 *
 * Both spellings, and every depth: a module in src/data/ reaches display.js as
 * "../display.js", and scanning only src/*.js for "./display.js" left those names out of
 * the stub - which failed as "does not provide an export named ..." the moment the loader
 * could reach that far.
 */
function imported_names(repo_root, module_basename) {
    const dir = path.join(repo_root, "src");
    const names = new Set();
    const pattern = new RegExp(
        String.raw`import\s*\{([^}]*)\}\s*from\s*"\.\.?/${module_basename}\.js"`, "g");

    for (const file of source_files(dir)) {
        if (path.basename(file) === `${module_basename}.js`) continue;
        const source = fs.readFileSync(file, "utf8");
        for (const match of source.matchAll(pattern)) {
            //A comment can sit inside the braces, so each part is filtered rather than trusted.
            for (const part of match[1].split(",")) {
                const name = part.replace(/\/\/.*$/gm, "").split(" as ")[0].trim();
                if (/^[A-Za-z_]\w*$/.test(name)) {
                    names.add(name);
                }
            }
        }
    }
    return [...names].sort();
}

/**
 * Values that have to be more than a no-op for the modules under test to work. Anything
 * not listed becomes a function returning undefined, which is enough for a name that is
 * only ever called for its side effects.
 */
const REAL_ENOUGH = {
    language: '"turkish"',
    language_tags: '{english: "en", turkish: "tr"}',
    global_flags: "{}",
    game_options: "{use_bg_music: false, auto_sort_inventory: false}",
    active_effects: "{}",
    current_enemies: "[]",
    current_location: "null",
    current_stance: '"normal"',
    selected_stance: '"normal"',
    faved_stances: "{}",
    favourite_items: "{}",
    favourite_consumables: "{}",
    travel_times: "{}",
    unlocked_beds: "{}",
    last_combat_location: "null",
    last_location_with_bed: "null",
    run: "() => {}",
    skill_category_order: "[]",
    skill_list: "null",
    booklist_entry_divs: "{}",
    format_money: "(n) => String(n)",
    capitalize_first_letter: "(s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s",
    uncapitalize_first_letter: "(s) => s ? s.charAt(0).toLowerCase() + s.slice(1) : s",
    get_effective_skill_xp_gain: "() => 1",
    get_current_book: "() => null",
    can_work: "() => true",
    enough_time_for_earnings: "() => true",
};

function stub_source(names) {
    return names.map(name => {
        const value = REAL_ENOUGH[name] ?? "() => undefined";
        return `export const ${name} = ${value};`;
    }).join("\n") + "\n";
}

/**
 * The modules main.js imports, in the order it imports them.
 *
 * character.js and items.js import each other, and items.js builds its templates at
 * module scope - so which of the two is entered first decides whether a name that calls
 * is_rat() lands before or after character.js has defined it. In a browser main.js is the
 * entry and this order is what settles it, so the loader replays it.
 *
 * Read from the REAL main.js: the copy in the temp directory has been replaced by a stub.
 */
function main_import_order(repo_root) {
    const source = fs.readFileSync(path.join(repo_root, "src", "main.js"), "utf8");
    const order = [];
    for (const match of source.matchAll(/^import[\s\S]*?from\s*"\.\/([^"]+)"/gm)) {
        if (!order.includes(match[1])) {
            order.push(match[1]);
        }
    }
    return order;
}
/**
 * @param {String} repo_root absolute path to the repository root
 * @param {String} module_path e.g. "src/items.js"
 * @returns {Promise<Object>} the module's exports
 */
export async function load_browser_free(repo_root, module_path) {
    const temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), "yairp-browser-free-"));
    fs.cpSync(path.join(repo_root, "src"), path.join(temp_dir, "src"), { recursive: true });
    fs.cpSync(path.join(repo_root, "locales"), path.join(temp_dir, "locales"), { recursive: true });

    for (const basename of ["main", "display"]) {
        const names = imported_names(repo_root, basename);
        if (names.length === 0) {
            throw new Error(`nothing imports from src/${basename}.js any more - this loader is out of date.`);
        }
        fs.writeFileSync(path.join(temp_dir, "src", `${basename}.js`), stub_source(names));
    }

    /*
        Imported through an entry that replays main.js's import order rather than
        directly, so the import cycle resolves the way it does in a browser. Loading
        enemies.js directly used to throw a TDZ error out of items.js, which was an
        artefact of the entry point and not a fault in either module.

        The target is taken as a namespace rather than re-exported with `export *`, so a
        default export comes through as well.
    */
    const order = main_import_order(repo_root);
    if (order.length === 0) {
        throw new Error("main.js imports nothing - this loader is out of date.");
    }

    //The relative path as given, so a module in a sub-folder of src/ resolves too.
    const target = "./" + ["src", ...module_path.split("/").slice(1)].join("/");
    //The target is NOT filtered out of the order. Removing it changes the order, which is
    //the one thing this is for: with items.js taken out, market_saturation.js was entered
    //first and items.js then read group_key_prefix out of a half-evaluated module.
    const entry_source = order
        .map(relative => `import "./src/${relative}";`)
        .join("\n")
        + `\nimport * as target from "${target}";\nexport { target };\n`;

    const entry = path.join(temp_dir, "browser-free-entry.mjs");
    fs.writeFileSync(entry, entry_source);

    /*
        A minimal `document`, because a module can reach for one at module scope and Node
        has none. display.js and main.js are stubbed for the import cycle, not for this -
        journal_panels.js is neither, and it takes two element handles as it loads.

        Stubbing the global rather than adding each such module to the stub list: the
        list would have to grow with every split of display.js, and a module that only
        holds the handle it was given evaluates perfectly well when the handle is null.
    */
    if (typeof globalThis.document === "undefined") {
        globalThis.document = {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: () => ({ classList: { add() {}, remove() {} }, style: {},
                                    appendChild() {}, setAttribute() {} }),
        };
    }

    const loaded = await import(pathToFileURL(entry).href);
    return loaded.target;
}
