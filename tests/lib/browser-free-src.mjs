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

/** Every name `src/*.js` imports from `./<module>.js`, except that module itself. */
function imported_names(repo_root, module_basename) {
    const dir = path.join(repo_root, "src");
    const names = new Set();
    const pattern = new RegExp(
        String.raw`import\s*\{([^}]*)\}\s*from\s*"\./${module_basename}\.js"`, "g");

    for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
        if (file === `${module_basename}.js`) continue;
        const source = fs.readFileSync(path.join(dir, file), "utf8");
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

    //The relative path as given, so a module in a sub-folder of src/ resolves too.
    const target = path.join(temp_dir, ...module_path.split("/"));
    return import(pathToFileURL(target).href);
}
