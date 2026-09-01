/** The generated item templates, and the recipes that name them. */

import * as fs from "node:fs";
import * as path from "node:path";
import { default_language, repo_root } from "../lib/context.mjs";
import { error, errors } from "../lib/report.mjs";
import { load_generated_item_templates } from "../lib/generated-items.mjs";
import { load_locale } from "../lib/locale-files.mjs";
import { strip_comments } from "../lib/source.mjs";

/**
 * The generated items: 203 components built at runtime from a material and a
 * component type. Their shown names are assembled from locale rows, so this
 * loads the real generator with stubbed item classes and checks two things.
 *
 * First, that every text id the generator hands to the translation layer exists.
 *
 * Second, and the reason this check is worth its length: the ASSEMBLED ENGLISH
 * name has to come out equal to the registry key. Registry keys are written into
 * save files, so if a pattern row is edited carelessly the shown name and the
 * saved key drift apart and every affected item is quietly renamed on screen.
 */
async function check_generated_items() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const { generated, problem } = await load_generated_item_templates(repo_root);
    if (problem) {
        error(`${problem} - this check is out of date.`);
        return;
    }

    const missing = new Set();
    const resolve = (id) => {
        const text = reference[id];
        if (text === undefined) { missing.add(id); }
        return text;
    };
    const fill = (text, params) =>
        typeof text === "string" ? text.replace(/\{([a-z_]+)\}/g, (whole, slot) => params[slot] ?? whole) : text;
    const capitalise = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

    const entries = Object.entries(generated);
    let checked = 0;
    let renamed = 0;

    for (const [key, item] of entries) {
        if (item.description) { resolve(item.description); }
        if (item.description_params) {
            for (const id of Object.values(item.description_params)) { resolve(id); }
        }
        if (!item.name_parts) continue;   //custom-named, covered by its own "name X" row

        checked++;
        const parts = {};
        for (const [slot, id] of Object.entries(item.name_parts.parts)) { parts[slot] = resolve(id); }
        const assembled = capitalise(fill(resolve(item.name_parts.pattern), parts));
        if (assembled !== key) {
            renamed++;
            error(`generated item "${key}" assembles in ${default_language} as "${assembled}".`
                + " The assembled name must equal the registry key, which is save data.");
        }
    }

    //The equippable name patterns, checked the same way against the English the
    //generator itself produced for shield_name and full_armor_name.
    let equippable = 0;
    for (const [, item] of entries) {
        if (item.shield_name && item.material_id) {
            equippable++;
            const assembled = capitalise(fill(resolve("pattern name shield"),
                {material: resolve(`material name ${item.material_id}`)}));
            if (assembled !== item.shield_name) {
                error(`shield name "${item.shield_name}" assembles as "${assembled}".`);
            }
        }
        if (item.full_armor_name && item.material_id && item.armor_piece) {
            equippable++;
            const assembled = capitalise(fill(resolve("pattern name armor"), {
                material: resolve(`material name ${item.material_id}`),
                piece: resolve(`armor piece ${item.armor_piece}`),
            }));
            if (assembled !== item.full_armor_name) {
                error(`armor name "${item.full_armor_name}" assembles as "${assembled}".`);
            }
        }
    }

    //The weapon words are not attached to a generated item, so they are listed.
    for (const word of ["sword", "dagger", "spear", "axe", "battle hammer"]) {
        resolve(`weapon type ${word}`);
    }
    resolve("pattern name weapon");

    for (const id of missing) {
        error(`the component generator references text id "${id}", which does not exist in locales/${default_language}.js.`);
    }

    console.log(`[check] generated items: ${entries.length} built, ${checked} assembled names`
        + ` and ${equippable} equippable names verified against their registry keys`
        + (renamed ? `, ${renamed} MISMATCHED` : ""));
}

/**
 * Every item a recipe names has to exist.
 *
 * `crafting_component_filling.js` opens with the instruction that makes this
 * necessary:
 *
 *   DOES NOT AUTO-FILL CRAFTING RECIPES, DO IT MANUALLY AND MAKE SURE NAMES MATCH
 *
 * The generator builds component templates from a material and a component type, and
 * the recipes that produce them are written by hand against those names. A typo on
 * either side is silent: the recipe is listed, the player has the materials, and the
 * result is undefined.
 *
 * The item's name may be declared in items.js or built by the generator, so both
 * sets count. Recipes only - `shield_name` and `armor_name` on a component are
 * display strings rather than template references, which is why they are not checked
 * here: the comment above Shield.getDisplayName says so, and treating them as
 * references produces forty false positives.
 */
async function check_recipe_item_names() {
    const { generated, problem } = await load_generated_item_templates(repo_root);
    if (problem) {
        error(`${problem} - this check is out of date.`);
        return;
    }

    const items = strip_comments(fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8"));
    const known = new Set([
        ...Object.keys(generated),
        ...[...items.matchAll(/item_templates\["([^"]+)"\]\s*=\s*new /g)].map(match => match[1]),
    ]);

    const recipes = strip_comments(fs.readFileSync(path.join(repo_root, "src/crafting_recipes.js"), "utf8"));

    let checked = 0;
    const reported = new Set();
    for (const match of recipes.matchAll(/\b(material_id|result_id):\s*"([^"]+)"/g)) {
        const [, field, name] = match;
        checked++;
        if (known.has(name) || reported.has(`${field}:${name}`)) continue;
        reported.add(`${field}:${name}`);
        error(`src/crafting_recipes.js names ${field} "${name}", which is neither declared in`
            + " items.js nor built by crafting_component_filling.js. The recipe would list and"
            + " produce nothing.");
    }
    console.log(`[check] recipe item names: ${checked} resolved against ${known.size} templates`);
}


/*
    Generated components nothing in the game can produce, grouped by why.

    The list is the point of the check rather than an exemption from it. A name is on
    it because somebody looked and found no way to get the item, and the reason is
    written down; a name that leaves the list has been made reachable. Both directions
    are enforced below, so the list cannot rot into a suppression file.
*/
const known_unmade = {
    /*
        A material listing a component type nobody wrote a recipe for. `turtleshell`
        asks for both shield components and only the base has one; `turtle shellplate`
        is a second turtle material whose five armour pieces duplicate the hand-written
        `Turtleshell *` ones in items.js that the recipes actually name; and the two
        cloth shoes are exteriors on materials whose recipes stop at the interior.

        Inherited from upstream's generator and harmless - an item nothing produces is
        dead weight rather than a bug - but it is the shape a real oversight has, which
        is why it is written down instead of tolerated silently.
    */
    "a component type no recipe was written for": [
        "Wool shoes", "Linen shoes", "Turtleshell shield handle",
        "Turtle shellplate helmet armor", "Turtle shellplate chestplate armor",
        "Turtle shellplate greaves", "Turtle shellplate shoe armor",
        "Turtle shellplate glove armor",
    ],
};

/**
 * Every generated component has some way of reaching a player's hands.
 *
 * check_recipe_item_names reads the arrow one way - a recipe naming an item that does
 * not exist. This is the other way, and it catches a different mistake: the generator
 * builds a component out of a material and a type list, so **widening a material's
 * `types` array silently creates items nothing produces**. They cost nothing at
 * runtime and they are invisible in play, which is exactly why they accumulate - 44
 * of the 203 the generator builds are in that state today.
 *
 * It is also the check that would have caught a documentation drift. P-12 said tier 5
 * was blocked on two missing locale rows; the rows are there and have been, and what
 * is actually missing is every recipe. A backlog entry describing the wrong blocker
 * costs whoever picks it up the same measurement twice, so the measurement lives here
 * where it re-runs on every push.
 *
 * Reachable means: produced by a recipe, stocked by a trader, dropped by an enemy, or
 * handed over as a reward. All four are read rather than assumed - today every
 * reachable generated component arrives by one of the first two, and hard-coding that
 * would fire falsely the day one becomes a quest reward.
 */
/**
 * Every item name anything in the game can hand to the player.
 *
 * Shared by check_components_can_be_made and check_books_can_be_got, because "can this be
 * got at all" is one question that used to live inside one of them. A new kind of source
 * is taught to both here, once.
 */
function reachable_item_names() {
    const read = (file) => strip_comments(fs.readFileSync(path.join(repo_root, file), "utf8"));
    const names_in = (source, pattern) => [...source.matchAll(pattern)].map(match => match[1]);

    const reachable = new Set([
        ...names_in(read("src/crafting_recipes.js"), /result_id:\s*"([^"]+)"/g),
        ...names_in(read("src/traders.js"), /item_name:\s*"([^"]+)"/g),
        ...names_in(read("src/enemies.js"), /item_name:\s*"([^"]+)"/g),
    ]);
    //Rewards name an item either bare inside `items: [...]` or as `{item: "..."}`.
    for (const file of ["src/data/dialogues.js", "src/data/locations.js", "src/quests.js"]) {
        const source = read(file);
        for (const name of names_in(source, /item:\s*"([^"]+)"/g)) {
            reachable.add(name);
        }
        for (const group of source.matchAll(/items:\s*\[([^\]]*)\]/g)) {
            for (const name of names_in(group[1], /"([^"]+)"/g)) {
                reachable.add(name);
            }
        }
    }
    return reachable;
}

/**
 * A book nothing sells, drops or hands over.
 *
 * A book is the cheapest teaching surface this game has - no location, no NPC, no combat -
 * and that is exactly why one can be written, translated, given a `book_stats` entry with
 * real rewards behind it, and never once reach a player. Nothing would fail: the item
 * exists, the reading timer works, the reward fires if it is ever read. It just never is.
 *
 * All ten books before P-15 were sold by a trader, which is the shape to hold to. This is
 * `check_components_can_be_made` pointed at books - not "does this book name a real
 * reward" but "can this book be got at all".
 *
 * Both directions, like its sibling: reading data with no item is unreadable, and an item
 * with no reading data reads instantly and teaches nothing, which looks like a bug to the
 * player and to nobody else.
 */
function check_books_can_be_got() {
    const before = errors.length;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8"));
    const books = [...source.matchAll(/book_stats\["([^"]+)\"\]\s*=/g)].map(m => m[1]);
    if (books.length === 0) {
        error("src/items.js declares no book_stats entries - check_books_can_be_got is out"
            + " of date.");
        return;
    }

    const templated = new Set(
        [...source.matchAll(/item_templates\["([^"]+)\"\]\s*=\s*new Book\(/g)]
            .map(m => m[1]));
    const reachable = reachable_item_names();

    for (const book of books) {
        if (!templated.has(book)) {
            error(`book_stats has an entry for "${book}" and no \`new Book\` template names`
                + " it. The reading data exists and there is no item to read, so nothing in"
                + " the game can ever reach it.");
            continue;
        }
        if (!reachable.has(book)) {
            error(`the book "${book}" has no source: no trader stocks it, nothing drops it,`
                + " no reward hands it over and no recipe makes it. It would be written,"
                + " translated and unreadable, and nothing else would say so.");
        }
    }

    for (const template of templated) {
        if (!books.includes(template)) {
            error(`"${template}" is a Book item with no book_stats entry, so it has no`
                + " reading time and no reward. Give it one, or make it an ordinary item.");
        }
    }

    if (errors.length === before) {
        console.log(`[check] books: ${books.length} books, all templated and all reachable`);
    }
}

async function check_components_can_be_made() {
    const { generated, problem } = await load_generated_item_templates(repo_root);
    if (problem) {
        error(`${problem} - this check is out of date.`);
        return;
    }

    const read = (file) => strip_comments(fs.readFileSync(path.join(repo_root, file), "utf8"));
    const names_in = (source, pattern) => [...source.matchAll(pattern)].map(match => match[1]);

    const reachable = new Set([
        ...names_in(read("src/crafting_recipes.js"), /result_id:\s*"([^"]+)"/g),
        ...names_in(read("src/traders.js"), /item_name:\s*"([^"]+)"/g),
        ...names_in(read("src/enemies.js"), /item_name:\s*"([^"]+)"/g),
    ]);
    //Rewards name an item either bare inside `items: [...]` or as `{item: "..."}`.
    for (const file of ["src/data/dialogues.js", "src/data/locations.js", "src/quests.js"]) {
        const source = read(file);
        for (const name of names_in(source, /item:\s*"([^"]+)"/g)) {
            reachable.add(name);
        }
        for (const group of source.matchAll(/items:\s*\[([^\]]*)\]/g)) {
            for (const name of names_in(group[1], /"([^"]+)"/g)) {
                reachable.add(name);
            }
        }
    }

    const excused = new Map();
    for (const [reason, names] of Object.entries(known_unmade)) {
        for (const name of names) {
            excused.set(name, reason);
        }
    }

    const keys = Object.keys(generated);
    const built = new Set(keys);
    let unreachable = 0;

    for (const key of keys) {
        if (reachable.has(key)) {
            if (excused.has(key)) {
                error(`the generated component "${key}" is listed under "${excused.get(key)}"`
                    + " in check_components_can_be_made, but something produces it now."
                    + " Take it off the list - a list that keeps names it no longer"
                    + " explains stops being a record of what is missing.");
            }
            continue;
        }
        unreachable++;
        if (excused.has(key)) {
            continue;
        }
        error(`crafting_component_filling.js builds "${key}", and no recipe produces it,`
            + " no trader stocks it, nothing drops it and no reward hands it over. Either"
            + " give it a way to be made or add it to known_unmade with the reason.");
    }

    for (const name of excused.keys()) {
        if (!built.has(name)) {
            error(`check_components_can_be_made excuses "${name}", which the generator does`
                + " not build. The entry is stale.");
        }
    }

    const groups = Object.keys(known_unmade).length;
    console.log(`[check] generated components can be made: ${keys.length - unreachable} of`
        + ` ${keys.length}, ${unreachable} known unmade in ${groups} group${groups === 1 ? "" : "s"}`);
}

export {
    check_books_can_be_got,
    check_components_can_be_made,
    check_generated_items,
    check_recipe_item_names,
};
