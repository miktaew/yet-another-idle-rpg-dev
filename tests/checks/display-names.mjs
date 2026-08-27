/**
 * Everything a player reads that is derived from a registry key.
 *
 * Keys are save data and stay English forever; what gets translated is a separate
 * shown-name row per entry. These checks are the ones that keep those two in step -
 * every entry has a row, every computed family has a row for every value it can
 * produce, and no two shown names collide.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { default_language, repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { load_locale } from "../lib/locale-files.mjs";
import { braced_body, strip_comments, top_level_keys } from "../lib/source.mjs";

/**
 * Every dialogue needs a "name <key>" row for its display name.
 *
 * The default getStartingText assembles the button label from it, and the label is
 * the only place a dialogue's name reaches the player, so a missing row shows up
 * as a placeholder on a button rather than anywhere a test would look. The
 * registry key stays English and stays save data; the row is the shown name.
 *
 * The three names the "suspicious man" returns from its own getName override -
 * itself, "puppy" and "no-longer-suspicious guy" - are checked as literals,
 * because they are chosen by arbitrary logic rather than declared as a field.
 */
const dialogue_name_variants = ["puppy", "no-longer-suspicious guy"];

async function check_dialogue_display_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/dialogues.js"), "utf8"));

    // The lookup key is the Dialogue's `name` FIELD, not its registry key: getName
    // returns this.name, and one dialogue's name ("proprietress") differs from its
    // key ("nekomimi proprietress"). Checking the key instead passes while the
    // button it is meant to protect renders a placeholder - which is exactly what
    // happened. The field cannot be renamed to match, because `id` defaults to it
    // and the id is save data.
    const declarations = [...source.matchAll(/dialogues\["([^"]+)"\]\s*=\s*new Dialogue\(\{/g)];
    if (declarations.length === 0) {
        error("src/dialogues.js declares no dialogues - this check is out of date.");
        return;
    }

    const shown_names = [];
    for (const [index, declaration] of declarations.entries()) {
        const start = declaration.index;
        const end = declarations[index + 1]?.index ?? source.length;
        // The Dialogue's own fields sit at eight spaces; a Textline's sit deeper,
        // so the indentation is what keeps this off the textline names.
        const field = source.slice(start, end).match(/^ {8}name:\s*"([^"]+)"/m);
        shown_names.push(field ? field[1] : declaration[1]);
    }

    for (const name of [...shown_names, ...dialogue_name_variants]) {
        if (!(`name ${name}` in reference)) {
            error(`locales/${default_language}.js has no "name ${name}" row;`
                + " the dialogue's button label would render as a placeholder.");
        }
    }
    console.log(`[check] dialogue display names: ${shown_names.length + dialogue_name_variants.length} resolved`);
}

/**
 * Hand-written items need a "name <key>" row, or their shown name falls back to
 * the English registry key.
 *
 * Comments are blanked first, and that is the whole difference between a small
 * problem and an imaginary one: measured on the raw source this reported 124
 * missing rows, because 118 of them are hand-written components that the runtime
 * generator superseded and that sit inside commented-out blocks. The real number
 * was six, so they were written rather than warned about, and this errors.
 *
 * Generated items are not included: their names are assembled, and
 * check_generated_items already verifies the assembly against the registry key.
 */
async function check_item_display_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8"));
    const keys = [...source.matchAll(/item_templates\["([^"]+)"\]\s*=\s*new /g)].map(match => match[1]);
    if (keys.length === 0) {
        error("src/items.js declares no items - this check is out of date.");
        return;
    }

    const missing = keys.filter(key => !(`name ${key}` in reference));
    console.log(`[check] item display names: ${keys.length - missing.length}/${keys.length} have a name row`);
    for (const key of missing) {
        error(`locales/${default_language}.js has no "name ${key}" row for item "${key}";`
            + " its shown name would fall back to the English registry key.");
    }
}

async function check_trader_display_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = fs.readFileSync(path.join(repo_root, "src/traders.js"), "utf8");
    const declarations = [...source.matchAll(/traders\["([^"]+)"\]\s*=\s*new Trader\(\{([\s\S]*?)\n {4}\}\);/g)];
    if (declarations.length === 0) {
        error("src/traders.js declares no traders - this check is out of date.");
        return;
    }

    for (const [, key, body] of declarations) {
        const name = body.match(/(?<![A-Za-z0-9_])name:\s*"([^"]+)"/);
        const display = body.match(/(?<![A-Za-z0-9_])display_name:\s*"([^"]+)"/);
        const shown = (display ?? name)?.[1];
        if (!shown) {
            error(`src/traders.js trader "${key}" declares neither name nor display_name.`);
            continue;
        }
        if (!(`name ${shown}` in reference)) {
            error(`locales/${default_language}.js has no "name ${shown}" row, shown by trader "${key}";`
                + " its shop button would fall back to the English name.");
        }
    }
    console.log(`[check] trader display names: ${declarations.length} resolved`);
}

/**
 * An item's display name must not be another item's registry key.
 *
 * `item_templates["Cooked potato"]` carried `name: "Potato"`. `getDisplayName`
 * resolves `name ${this.getName()}`, so a cooked potato looked up the RAW potato's
 * row and displayed as "Potato" - while `"name Cooked potato"` sat in both locales,
 * written by somebody who meant it to be its own item and never read.
 *
 * A name that differs from the key is normal and deliberate here: `Goat meat` shows
 * as "Mountain goat meat", `Cooked clam` as "Boiled clam", `Cooking herbs` as
 * "Parsley, sage, rosemary and thyme". That is the display-name indirection the
 * whole project is built on. What is never right is a name that IS another key,
 * because then two items resolve to one row and the second one's translation can
 * never be reached.
 *
 * Not a save-data concern: setup_ids assigns `item_templates[id].id = id` from the
 * key and createInventoryKey uses this.id, so the name field is display only.
 */
function check_item_name_collisions() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/items.js"), "utf8"));

    //Each declaration runs to the start of the next one, rather than being matched
    //with a lazy `[\s\S]*?` up to the first `\n\s+});` - that stops at whichever
    //nested object closes first, a stats block or a component list, and a name field
    //below it would be invisible.
    //
    //The count this reports is smaller than the number of `name:` fields in the file
    //that differ from their key, and that is correct: 118 of items.js's declarations
    //sit inside block comments, superseded by the components
    //crafting_component_filling.js generates, and strip_comments removes them. A
    //collision planted inside one of those is dead code and is right not to be
    //reported.
    const starts = [...source.matchAll(/item_templates\["([^"]+)"\]\s*=\s*new \w+\(\{/g)];
    if (starts.length === 0) {
        error("could not read any item_templates declarations out of src/items.js"
            + " - this check is out of date.");
        return;
    }

    const keys = new Set(starts.map(match => match[1]));
    let differing = 0;

    for (let i = 0; i < starts.length; i++) {
        const key = starts[i][1];
        const from = starts[i].index + starts[i][0].length;
        const to = i + 1 < starts.length ? starts[i + 1].index : source.length;
        const body = source.slice(from, to);

        const name = body.match(/\n\s+name:\s*"([^"]+)"/);
        if (!name || name[1] === key) continue;
        differing++;

        if (keys.has(name[1])) {
            error(`item_templates["${key}"] has name: "${name[1]}", which is another item's key.`
                + " getDisplayName resolves `name ${getName()}`, so this item would show the other"
                + ` one's name and its own "name ${key}" row could never be reached.`);
        }
    }
    console.log(`[check] item name collisions: ${differing} names differ from their key, none collide`);
}

/**
 * Every choice on the hero creation panel needs a locale row for its VALUE.
 *
 * The panel's buttons carry two different strings and only one of them was ever
 * checked. `data-translation` is the button's own label and `translateUI` resolves
 * it. `data-age` / `data-height` / `data-race_id` is the value that goes into
 * `character.personal`, into the save, and back out through
 * `getText(language, character.personal.age)` in fill_character_bio - and nothing
 * verified that one.
 *
 * `data-age="middle aged"` had no row, because the row was written `"middle-aged"`
 * with a hyphen. Every player who picked the third age option read
 * `Age: text not found, id: middle aged` in their own character bio, in both
 * languages, from the moment they made the character.
 *
 * The hyphen is what has to move, not the attribute: the attribute value is save
 * data. That is the same rule the registry keys follow.
 */
async function check_creation_panel_values() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const html = fs.readFileSync(path.join(repo_root, "index.html"), "utf8");

    //field -> where the value ends up, for the error message. Race is not here:
    //its buttons are built by character_creation.js from playable_races, so the
    //value cannot drift from the registry the way a hand-written attribute can, and
    //the race name goes through playable_races[key].name rather than the key itself.
    const fields = [
        { attribute: "data-age", stored_as: "character.personal.age" },
        { attribute: "data-height", stored_as: "character.personal.height" },
    ];

    let checked = 0;
    for (const { attribute, stored_as } of fields) {
        const values = new Set([...html.matchAll(new RegExp(`${attribute}="([^"]*)"`, "g"))]
            .map(match => match[1]));
        if (values.size === 0) {
            error(`index.html has no ${attribute} attributes - this check is out of date.`);
            continue;
        }

        for (const value of values) {
            checked++;
            if (!(value in reference)) {
                error(`index.html offers ${attribute}="${value}", which has no row in`
                    + ` locales/${default_language}.js. That value is stored as ${stored_as} and`
                    + " looked up as a text id, so the character bio would read \"text not found,"
                    + ` id: ${value}\". Fix the row's key - the attribute value is save data.`);
            }
        }
    }
    console.log(`[check] hero creation panel values: ${checked} resolved`);
}

/**
 * A computed id family whose values can be enumerated needs a row for every value.
 *
 * Neither of the two checks that guard translated text can see these:
 *
 *   - check_no_english_in_dom looks for string literals, and these arrive as `${tag}`
 *     - an interpolation, which is exactly what that check subtracts;
 *   - check_registry_value_names reads `field: "value"` declarations, and these are
 *     array members and registry keys instead.
 *
 * Which is how the bestiary came to print "[living] [beast] [wolf rat] [small]" and the
 * location header "narrow" and "dark II" in a Turkish interface, with every other check
 * passing. Add a family here whenever a new registry's keys start being shown.
 */
async function check_enumerable_id_families() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const read = (relative) => strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

    const collect = (source, pattern, extract) => {
        const found = new Set();
        for (const match of source.matchAll(pattern)) {
            if (extract) {
                for (const value of extract(match[1])) {
                    found.add(value);
                }
            } else {
                found.add(match[1]);
            }
        }
        return found;
    };

    const character_source = read("src/character.js");

    /*
        The stat-source pieces. Two ways in, because neither alone is complete: the
        constructor declares most of them as empty objects, and the rest are created by
        assignment later on.
    */
    const stat_sources = new Set();
    //The lookbehind matters: total_multiplier holds xp TARGETS - hero, all, all_skill
    //- which have `ui xp target` rows of their own and are not stat sources.
    for (const match of character_source.matchAll(/(?<!\w)(?:flat|multiplier):\s*\{/g)) {
        const open = character_source.indexOf("{", match.index);
        for (const key of top_level_keys(braced_body(character_source, open))) {
            stat_sources.add(key);
        }
    }
    for (const match of character_source.matchAll(
            /(?:stats|xp_bonuses)\.(?:flat|multiplier)\.(\w+)/g)) {
        stat_sources.add(match[1]);
    }
    const enemies = read("src/enemies.js");

    //tags: ["living", "beast", "wolf rat"] - the members, not the field.
    const enemy_tags = new Set();
    for (const match of enemies.matchAll(/tags:\s*\[([^\]]*)\]/g)) {
        for (const member of match[1].matchAll(/"([^"]+)"/g)) {
            enemy_tags.add(member[1]);
        }
    }
    //Every enemy also carries its size as a tag, from the enemy_sizes enum.
    for (const size of collect(enemies, /^\s*(?:SMALL|MEDIUM|LARGE):\s*"([^"]+)"/gm)) {
        enemy_tags.add(size);
    }

    const families = [
        {
            what: "enemy tag",
            prefix: "ui enemy tag",
            values: enemy_tags,
            shown_by: "the bestiary tooltip",
        },
        {
            what: "season",
            prefix: "season",
            /*
                game_time.js must keep returning English here - conditions.js compares
                getSeason() against `season: {yes: "Summer"}` written in content, and the
                save's saved_at goes through toString(). So the four names are registry
                values and the rows are what a player reads.
            */
            values: collect(read("src/game_time.js"),
                /const seasons\s*=\s*\[([^\]]*)\]/g, (body) => body.match(/"([^"]+)"/g)
                    ?.map(q => q.slice(1, -1)) ?? []),
            shown_by: "the job availability line",
        },
        {
            what: "stat source",
            prefix: "ui stat source",
            /*
                Where a stat or an xp bonus came from: the keys of character.stats.flat,
                character.stats.multiplier and character.xp_bonuses.multiplier. Collected
                from the literals in the constructor AND from every dotted reference,
                because some pieces are created after construction.
            */
            values: stat_sources,
            shown_by: "the stat tooltips",
        },
        {
            what: "location type",
            prefix: "loctype",
            values: collect(read("src/locations.js"), /location_types\["([^"]+)"\]\s*=/g),
            shown_by: "the location header",
        },
    ];

    let total = 0;
    for (const { what, prefix, values, shown_by } of families) {
        if (values.size === 0) {
            error(`no ${what} values found - this check is out of date.`);
            continue;
        }
        for (const value of values) {
            if (!(`${prefix} ${value}` in reference)) {
                error(`locales/${default_language}.js has no "${prefix} ${value}" row, so`
                    + ` ${shown_by} would show the ${what} "${value}" untranslated.`);
            }
        }
        total += values.size;
    }

    console.log(`[check] enumerable id families: ${total} values resolved`);
}

async function check_skill_category_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/skills.js"), "utf8"));

    //const skill_category_crafting = "Crafting";
    const constants = new Map();
    for (const match of source.matchAll(/const\s+(skill_category_\w+)\s*=\s*"([^"]+)"/g)) {
        constants.set(match[1], match[2]);
    }

    /*
        A skill's own category, and not the `{category, subcategory, recipe_id}` triples
        that milestones use to unlock recipes - those name a recipe page, which is a
        different registry and carries no heading.
    */
    const categories = new Set();
    const pattern = /(?<!\w)category\s*:\s*(?:"([^"]+)"|([A-Za-z_]\w*))(?!\s*,\s*subcategory)/g;
    for (const match of source.matchAll(pattern)) {
        const [, literal, identifier] = match;
        if (literal) {
            categories.add(literal);
        } else if (constants.has(identifier)) {
            categories.add(constants.get(identifier));
        } else {
            error(`src/skills.js sets a skill category to ${identifier}, which this check`
                + ` cannot resolve to a value - so it cannot tell whether it has a name row.`);
        }
    }

    if (categories.size === 0) {
        error("no skill categories found in src/skills.js - this check is out of date.");
        return;
    }

    for (const category of categories) {
        if (!(`ui skill category ${category}` in reference)) {
            error(`locales/${default_language}.js has no "ui skill category ${category}" row,`
                + ` so the ${category} heading in the skill list reads as a missing text id.`);
        }
    }

    console.log(`[check] skill category names: ${categories.size} resolved`);
}

async function check_registry_value_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    //field -> {files, prefix}. Add a row here when a new registry field starts
    //being shown to the player.
    const shown_values = [
        { field: "material_type", files: ["src/items.js", "src/crafting_recipes.js"], prefix: "material type" },
        { field: "weapon_type", files: ["src/items.js"], prefix: "weapon type" },
        //getItemRarity assigns these rather than declaring them as a field, and the
        //quality line of every item tooltip prints one.
        { field: "rarity", files: ["src/items.js"], prefix: "ui rarity" },
    ];

    let total = 0;
    for (const { field, files, prefix } of shown_values) {
        const values = new Set();
        for (const relative of files) {
            const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));
            const pattern = new RegExp(`${field}\\s*[:=]\\s*"([^"]+)"`, "g");
            for (const match of source.matchAll(pattern)) {
                values.add(match[1]);
            }
        }
        if (values.size === 0) {
            error(`no ${field} values found in ${files.join(", ")} - this check is out of date.`);
            continue;
        }

        for (const value of values) {
            //items.js calls a hammer a "battle hammer" everywhere it shows one, and the
            //row follows the shown name rather than the stored one.
            const shown = field === "weapon_type" && value === "hammer" ? "battle hammer" : value;
            if (!(`${prefix} ${shown}` in reference)) {
                error(`locales/${default_language}.js has no "${prefix} ${shown}" row, so an item`
                    + ` with ${field} "${value}" would show that value untranslated.`);
            }
        }
        total += values.size;
    }
    console.log(`[check] registry value names: ${total} resolved`);
}

/**
 * Every equipment slot needs a "ui slot <key>" row.
 *
 * The empty-slot label is built from the slot key at runtime -
 * `ui slot ${key}` - so the content-id scan cannot see the finished id and
 * deliberately refuses to guess at a concatenation. This replaces that coverage
 * by checking the same list display.js builds its slot map from.
 *
 * Before this, the label was assembled from the raw key instead of the locale,
 * which is why every empty slot read "head slot", "fishing pole slot" and so on in
 * English while the rows to translate them had existed all along.
 */
async function check_equipment_slot_names() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/display.js"), "utf8"));
    const map = source.match(/const equipment_slots_divs\s*=\s*\{([\s\S]*?)\n\};/);
    if (!map) {
        error("src/display.js has no `const equipment_slots_divs = { ... }` - this check is out of date.");
        return;
    }

    // Keys are bare or quoted: `head:` and `"off-hand":` both appear.
    const slots = [...map[1].matchAll(/(?:^|,)\s*"?([A-Za-z_-]+)"?\s*:/g)].map(match => match[1]);
    if (slots.length === 0) {
        error("could not read any slot keys out of equipment_slots_divs - this check is out of date.");
        return;
    }

    for (const slot of slots) {
        if (!(`ui slot ${slot}` in reference)) {
            error(`locales/${default_language}.js has no "ui slot ${slot}" row, so that empty`
                + " equipment slot would render a placeholder.");
        }
    }
    console.log(`[check] equipment slot names: ${slots.length} resolved`);
}

export {
    check_creation_panel_values,
    check_dialogue_display_names,
    check_enumerable_id_families,
    check_equipment_slot_names,
    check_item_display_names,
    check_item_name_collisions,
    check_registry_value_names,
    check_skill_category_names,
    check_trader_display_names,
};
