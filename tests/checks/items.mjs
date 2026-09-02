/** The generated item templates, and the recipes that name them. */

import * as fs from "node:fs";
import * as path from "node:path";
import { default_language, locales_dir, repo_root } from "../lib/context.mjs";
import { error, errors } from "../lib/report.mjs";
import { load_generated_item_templates } from "../lib/generated-items.mjs";
import { load_browser_free } from "../lib/browser-free-src.mjs";
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
/*
    Plain items nothing gives, with the reason each one is allowed to stay.

    The list is the point. An item nothing can give is either dead weight or an oversight
    and the two look identical, so the difference has to be written down by somebody who
    looked - which is what `known_unmade` above does for the generated components.
*/
const known_unreachable_items = {
    /*
        Its description says what it is for - "necessary for crafting equipment" - and no
        recipe asks for it. That reads as an intent that was never wired rather than a
        leftover, so it stays until somebody decides whether equipment should want a
        binding and a screw. Deleting it would throw away the idea; sourcing it would
        invent the system it implies.
    */
    "an intent that was never wired": ["Basic spare parts"],
};

/**
 * Every item name anything in the game can hand to the player.
 *
 * Shared by check_components_can_be_made, check_books_can_be_got and
 * check_items_can_be_got, because "can this be got at all" is one question that used to
 * live inside one of them. A new kind of source is taught to all three here, once.
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

    /*
        Gathering, which this helper did not know about until a third caller asked it about
        every item in the game rather than only components and books.

        The doc above said all four kinds are read rather than assumed. There were five. A
        LocationActivity names what it yields as `resources: [{name: "..."}]`, and that is
        where every ore, log, herb, wool and sand in the game comes from - about a fifth of
        the plain item registry. Neither of the first two callers had a gathered thing to
        ask about, so an incomplete set never showed.
    */
    const location_source = read("src/data/locations.js");
    for (const opener of location_source.matchAll(/resources:\s*\[/g)) {
        /*
            Depth-counted rather than matched with a lazy `[\s\S]*?\]`, which stops at
            the first `]` - and a resource carries `ammount: [[1,1], [1,3]]`, so the first
            `]` is two levels in. That truncation hid every fish.
        */
        const open = opener.index + opener[0].length - 1;
        let depth = 0;
        let close = -1;
        for (let i = open; i < location_source.length; i++) {
            if (location_source[i] === "[") { depth++; }
            else if (location_source[i] === "]") {
                depth--;
                if (depth === 0) { close = i; break; }
            }
        }
        if (close === -1) continue;

        for (const name of names_in(location_source.slice(open, close), /name:\s*"([^"]+)"/g)) {
            reachable.add(name);
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

    /*
        The shared helper, which was documented as shared and had one caller: this
        function kept its own copy of the same eight patterns. Three checks ask the
        question now, so a copy is a copy that can fall behind - and the whole reason the
        helper exists is that "a new kind of source is taught to both here, once".
    */
    const reachable = reachable_item_names();

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

/**
 * A hand-written item nothing can give you.
 *
 * The third of the "can this be got at all" family, and the one that covers what the other
 * two do not. check_components_can_be_made asks it of the 203 generated components and
 * check_books_can_be_got of the books; nothing asked it of the plain item declarations,
 * and four of them had been sitting there since before this fork - written, priced,
 * described in both languages, and reachable by nothing.
 *
 * What counts as reachable, and why each one is not this check's business:
 *   - named as a recipe result, a trader's stock, an enemy's loot, or a reward;
 *   - or it carries `components`, which means it is assembled and its parts are
 *     check_components_can_be_made's business - the hand-written shields look orphaned
 *     because an assembled shield's inventory key is built from its components rather
 *     than from the template's own name;
 *   - or it carries a `component_type`, so it IS a component;
 *   - or it is a Book, which check_books_can_be_got covers in both directions.
 *
 * Anything left is either dead weight or an oversight, and the two have the same shape -
 * which is why the excuse list carries a reason rather than just a name.
 */
async function check_items_can_be_got() {
    const before = errors.length;

    const [{ item_templates }] = await load_browser_free(
        repo_root, ["src/items.js"]);

    const reachable = reachable_item_names();

    const excused = new Map();
    for (const [reason, names] of Object.entries(known_unreachable_items)) {
        for (const name of names) {
            excused.set(name, reason);
        }
    }

    let asked = 0;
    for (const id of Object.keys(item_templates)) {
        const item = item_templates[id];

        //Somebody else's question.
        if (item.components) continue;
        if (item.component_type) continue;
        if (item.tags?.book) continue;

        asked++;
        if (reachable.has(id)) {
            if (excused.has(id)) {
                error(`"${id}" is on the unreachable list as "${excused.get(id)}" and `
                    + `something gives it after all. Take it off the list.`);
            }
            continue;
        }
        if (excused.has(id)) continue;

        error(`nothing can give the player "${id}": no recipe makes it, no trader stocks `
            + `it, nothing drops it and no reward hands it over. It is written, priced and `
            + `described in both languages, and unreachable. Give it a source, delete it, `
            + `or put it on known_unreachable_items with the reason.`);
    }

    if (asked === 0) {
        error("no plain item declarations to ask about - this check is out of date.");
        return;
    }

    if (errors.length === before) {
        console.log(`[check] items can be got: ${asked} plain items, `
            + `${excused.size} excused, every other one reachable`);
    }
}

/**
 * Two items the player cannot tell apart.
 *
 * check_item_name_collisions compares an item's `name:` FIELD against other items' keys,
 * which catches one shape and not this one: two different keys whose `name <key>` locale
 * rows resolve to the same string. The player then sees the same name twice - in the
 * inventory, in a trade list, in Discoveries - with no way to know which is which.
 *
 * It happened. `White chainmail` shipped in v0.7.5 with the display name "White steel
 * chainmail", which is also the display name of `White steel chainmail`, an older item
 * nothing has ever produced. Two entries, one name, and the collision check passed because
 * neither item's `name:` field was the other's key.
 */
async function check_no_two_items_share_a_name() {
    const before = errors.length;

    const [{ item_templates }] = await load_browser_free(repo_root, ["src/items.js"]);
    const names = fs.readdirSync(locales_dir)
        .filter((file) => file.endsWith(".js"))
        .map((file) => file.slice(0, -3));

    let compared = 0;
    for (const locale_name of names) {
        const rows = await load_locale(locale_name);
        if (!rows) continue;

        const shown = new Map();
        for (const id of Object.keys(item_templates)) {
            /*
                The row an item's own name resolves through. Only items that HAVE one are
                compared: a generated component assembles its name from a pattern, which
                check_generated_items verifies against the registry key already.
            */
            const row = rows[`name ${id}`];
            if (!row) continue;
            compared++;

            if (shown.has(row)) {
                error(`in locales/${locale_name}.js both "${shown.get(row)}" and "${id}" `
                    + `display as "${row}". The player sees the same name twice with no `
                    + `way to tell which is which - in the inventory, in a trade list and `
                    + `in Discoveries.`);
                continue;
            }
            shown.set(row, id);
        }
    }

    if (compared === 0) {
        error("no item resolves a name row - this check is out of date.");
        return;
    }

    if (errors.length === before) {
        console.log(`[check] item display names: ${compared} names across `
            + `${names.length} locales, none shared`);
    }
}

/**
 * An item that shows the player its own registry key.
 *
 * P-33, from an inventory screenshot: `[ayak] Snakeskin boots` between two properly
 * translated items. The first diagnosis was wrong and worth recording - it looked like two
 * missing `component <type>` rows, and measuring showed those rows all exist.
 *
 * What actually happens: `Armor.getDisplayName` resolves `name <key>` first, then tries to
 * assemble from `components.external`, then falls back to the key. Seven clothing templates
 * have neither - no `name` row, and no external component because they ARE components - so
 * the key is what the player reads. In English that is invisible, because the key is
 * English; in every other language it is the only untranslated thing on the screen.
 *
 * Which is why nothing caught it. `check_item_display_names` reports every item that HAS a
 * name row as having one, and `check_no_two_items_share_a_name` compares the rows that
 * exist. Neither asks whether an item that needs a row has one.
 *
 * The rule: in every locale, an item must either resolve a `name <key>` row or assemble a
 * name that differs from the key. An explicit row whose value happens to equal the key is
 * fine - `"name Iron ore": "Iron ore"` is a translation, not a fallback.
 */
async function check_no_item_shows_its_key() {
    const before = errors.length;

    const [{ item_templates }, { translationManager }] = await load_browser_free(
        repo_root, ["src/items.js", "src/translation.js"]);

    const names = fs.readdirSync(locales_dir)
        .filter((file) => file.endsWith(".js"))
        .map((file) => file.slice(0, -3));

    let asked = 0;
    for (const locale_name of names) {
        if (!await load_locale(locale_name)) continue;

        for (const id of Object.keys(item_templates)) {
            asked++;
            //An explicit row is a translation whatever it says.
            if (translationManager.getOptionalText(locale_name, `name ${id}`) !== undefined) {
                continue;
            }
            //Otherwise the name has to be assembled into something that is not the key.
            let shown;
            try {
                shown = item_templates[id].getDisplayName();
            } catch (problem) {
                error(`"${id}" throws while resolving its shown name in `
                    + `locales/${locale_name}.js: ${problem.message}`);
                continue;
            }
            if (shown === id) {
                error(`"${id}" has no "name ${id}" row in locales/${locale_name}.js and `
                    + `assembles no name, so the player reads the registry key. In the `
                    + `reference language that is invisible - the key is English - and in `
                    + `every other one it is the only untranslated thing on the screen.`);
            }
        }
    }

    if (asked === 0) {
        error("no item was asked for its shown name - this check is out of date.");
        return;
    }

    if (errors.length === before) {
        console.log(`[check] item keys: ${asked} name lookups across ${names.length} `
            + `locales, none falling back to a registry key`);
    }
}

/**
 * A book that asks for a skill asks for one that exists.
 *
 * Since Q-12 a book may require a skill, and `start_reading` reads the level out of the skill
 * registry: `(skills[id]?.current_level ?? 0) < wanted[id]`. A misspelt id is not there, the
 * `?? 0` makes it nought, nought is below any requirement, and the book is refused **for
 * ever** - while the refusal names a skill with no display row, so the sentence the player is
 * shown has a registry key in it.
 *
 * Nothing else can see it. The book builds, ships, sits in a trader's stock and is bought;
 * only reading it fails, and it fails the way a book you have not earned yet fails.
 *
 * The whole field is new, so this is a net under it from the first day rather than after the
 * first mistake.
 */
async function check_books_ask_for_real_skills() {
    const [items_module, skills_module] = await load_browser_free(repo_root,
        ["src/items.js", "src/data/skills.js"]);

    const books = Object.entries(items_module.book_stats ?? {});
    if (books.length === 0) {
        error("there are no books at all - check_books_ask_for_real_skills is out of date.");
        return;
    }

    let asking = 0;
    for (const [title, stats] of books) {
        const wanted = stats.required_skills ?? {};
        const names = Object.keys(wanted);
        if (names.length === 0) continue;
        asking++;

        for (const skill_id of names) {
            if (!skills_module.skills[skill_id]) {
                error(`the book "${title}" requires the skill "${skill_id}", which is not in `
                    + `the skill registry. start_reading reads a missing skill as level 0, so `
                    + `the book can never be read by anybody, and the refusal it prints names `
                    + `a skill that does not exist.`);
                continue;
            }
            const level = wanted[skill_id];
            const cap = skills_module.skills[skill_id].max_level;
            if (typeof level !== "number" || level <= 0) {
                error(`the book "${title}" requires "${skill_id}" at ${JSON.stringify(level)}, `
                    + `which is not a level. A requirement of nought is not a requirement.`);
            } else if (typeof cap === "number" && level > cap) {
                error(`the book "${title}" requires "${skill_id}" at ${level}, and that skill `
                    + `stops at ${cap}. Nobody can ever read it.`);
            }
        }
    }

    console.log(`[check] book requirements: ${books.length} books, ${asking} asking for a `
        + `skill, each naming a real one at a reachable level`);
}


/**
 * Every row on every trader's shelf names an item that exists.
 *
 * The bay trader threw on open from the day it was written until v0.7.46. Three of its rows
 * named items that had **never existed** - "Piece of iron ore", "Piece of leather", "Piece
 * of rough leather" - and the failure is worth describing because it is the shape this
 * check exists for:
 *
 *     const item = getItem({...item_templates[row.item_name], quality});
 *     inventory[item.getInventoryKey()] = ...
 *
 * Spreading `undefined` is legal and silent. `getItem` gets an object with only a quality on
 * it, returns nothing, and the next line reads `getInventoryKey` off nothing. So the shop
 * did not sell less; it took the whole panel down with a TypeError, and only for the players
 * who got far enough to reach it.
 *
 * Nothing else could see it. The rows are data, the build does not resolve them, and
 * `check:save` reads trader KEYS rather than their stock. `LOCALE_STRICT=1` says nothing
 * either: a name that is not an item is also not a text id anybody asked for.
 *
 * Measured across every template rather than every trader, because a template is shared -
 * the two cafes have one between them - and a bad row in a shared list is a bad row twice.
 */
async function check_trader_stock_names_resolve() {
    const [traders_module, items_module] = await load_browser_free(repo_root,
        ["src/traders.js", "src/items.js"]);
    const {inventory_templates} = traders_module;
    const {item_templates} = items_module;

    if (!inventory_templates || typeof inventory_templates !== "object") {
        error("traders.js no longer exports inventory_templates - "
            + "check_trader_stock_names_resolve is out of date.");
        return;
    }

    let rows = 0;
    for (const [template, list] of Object.entries(inventory_templates)) {
        if (!Array.isArray(list)) {
            error(`the stock list "${template}" is not a list.`);
            continue;
        }
        for (const row of list) {
            rows++;
            if (row?.item_name === undefined) {
                error(`a row in the stock list "${template}" names no item at all.`);
                continue;
            }
            if (item_templates[row.item_name]) continue;
            error(`the stock list "${template}" offers "${row.item_name}", which is not an `
                + `item. Opening that trader THROWS: getItem spreads an undefined template, `
                + `returns nothing, and getInventoryKey is read off nothing.`);
        }
    }

    console.log(`[check] trader stock: ${Object.keys(inventory_templates).length} list(s), `
        + `${rows} row(s), each naming a real item`);
}

export {
    check_trader_stock_names_resolve,
    check_books_can_be_got,
    check_books_ask_for_real_skills,
    check_no_item_shows_its_key,
    check_items_can_be_got,
    check_no_two_items_share_a_name,
    check_components_can_be_made,
    check_generated_items,
    check_recipe_item_names,
};
