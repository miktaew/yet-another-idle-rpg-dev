/** The inventory list and what it is allowed to sort by. */

import * as fs from "node:fs";
import * as path from "node:path";
import { repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { strip_comments } from "../lib/source.mjs";

/*
    `item` is exempt from the rule below because the inventory key IS the item - that is
    what the load path rebuilds the entry from.
*/
const entry_properties_the_key_carries = ["item"];

/**
 * Anything the list sorts an inventory entry by is kept in the save.
 *
 * A comparator reads its values off the row's dataset, and the row builder fills that in
 * from the inventory entry - so a sort can quietly come to depend on a field that only
 * exists for as long as the tab is open. It looks like working code: the button sorts, the
 * order is right, and then a reload throws the field away and the sort silently orders by
 * something arbitrary, with no error anywhere.
 *
 * That is what "latest" would have been (P-32). An entry was {item, count} and nothing
 * else, so the acquisition order had to start existing AND start being written down; the
 * writing-down is the half a check can hold onto.
 */
function check_a_sorted_field_is_saved() {
    const display = strip_comments(
        fs.readFileSync(path.join(repo_root, "src", "inventory_display.js"), "utf8"));
    const save = strip_comments(
        fs.readFileSync(path.join(repo_root, "src", "save_load.js"), "utf8"));

    /*
        Every read of an inventory entry's property, whichever inventory it belongs to:
        character.inventory[key].count, player_storage.inventory[key].obtained_order,
        traders[current_trader].inventory[key].item, and so on.
    */
    const read = new Set();
    for (const match of display.matchAll(/\.inventory\[[^\]]+\]\.([a-zA-Z_][a-zA-Z0-9_]*)/g)) {
        read.add(match[1]);
    }
    if (read.size === 0) {
        error("inventory display: no inventory entry property is read at all - this check is out of date.");
        return;
    }

    /*
        And what each save write puts in. The two owners are read separately: a field added
        to the character's save and forgotten in the storage's is the same bug, half-fixed.
    */
    const owners = [
        {name: "character", written: written_properties(save, "character")},
        {name: "player_storage", written: written_properties(save, "player_storage")},
    ];
    for (const owner of owners) {
        if (owner.written === null) {
            error(`inventory save: nothing writes the ${owner.name} inventory into the save - `
                + `this check is out of date.`);
            return;
        }
    }

    /*
        A property is only required in the save if a comparator actually sorts by it. The
        row builder reads plenty that no sort touches, and demanding those be saved would be
        inventing a rule nobody asked for.
    */
    const sorted_by = [...read].filter(property => sorts_by(display, property));
    if (sorted_by.length === 0) {
        error("inventory display: no comparator reads a field taken from an inventory entry - "
            + "this check is out of date.");
        return;
    }

    let checked = 0;
    for (const property of sorted_by) {
        if (entry_properties_the_key_carries.includes(property)) {
            continue;
        }
        checked++;
        for (const owner of owners) {
            if (!owner.written.includes(property)) {
                error(`inventory sorting: the list sorts by "${property}", which it takes off an `
                    + `inventory entry, and save_load.js does not write it into the saved `
                    + `${owner.name} inventory. The sort works until the game is reloaded and `
                    + `then silently orders by something else.`);
            }
        }
    }

    console.log(`[check] inventory sorting: ${checked} sorted field(s) kept in the save, `
        + `${read.size} entry properties read across ${owners.length} saved inventories`);
}

/**
 * The properties one owner's save write assigns, on one line or spread over several.
 *
 * Returns null when the write is not there at all, which means this check has gone stale
 * rather than that a field is missing.
 */
function written_properties(save, owner) {
    const target = `save_data["${owner}"].inventory[key]`;
    const at = save.indexOf(target);
    if (at === -1) {
        return null;
    }
    const opening = save.indexOf("{", at);
    const closing = save.indexOf("}", opening);
    if (opening === -1 || closing === -1) {
        return null;
    }
    return [...save.slice(opening, closing).matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g)].map(m => m[1]);
}

/** Whether a comparator branch reads this property off a row. */
function sorts_by(display, property) {
    const sort = comparator_source(display);
    return sort !== null && sort.includes(`dataset.${property}`);
}

/** The body of sort_displayed_inventory, which is where every comparator branch lives. */
function comparator_source(display) {
    const at = display.indexOf("function sort_displayed_inventory");
    if (at === -1) {
        return null;
    }
    const next = display.indexOf("\nfunction ", at + 1);
    return display.slice(at, next === -1 ? display.length : next);
}

/**
 * Every sort button asks for a sort the comparator knows, and every sort it knows has one.
 *
 * The buttons pass their sort as a bare string through an onclick, so a name that no branch
 * matches is a button that reorders nothing when clicked - no error, no console line, just a
 * button that looks like the three next to it and does nothing. A branch with no button is
 * the same waste from the other end: an ordering no player can reach.
 */
function check_every_sort_button_is_understood() {
    const html = fs.readFileSync(path.join(repo_root, "index.html"), "utf8");
    const display = strip_comments(
        fs.readFileSync(path.join(repo_root, "src", "inventory_display.js"), "utf8"));
    const sort = comparator_source(display);
    if (sort === null) {
        error("inventory sorting: sort_displayed_inventory is gone - this check is out of date.");
        return;
    }

    const asked = new Map();
    for (const match of html.matchAll(/sort(Character|Trader|Storage)Inventory\("([^"]+)"\)/g)) {
        if (!asked.has(match[2])) {
            asked.set(match[2], []);
        }
        asked.get(match[2]).push(match[1].toLowerCase());
    }
    if (asked.size === 0) {
        error("inventory sorting: index.html has no sort buttons - this check is out of date.");
        return;
    }

    //A branch is `sort_by === "name"`, however many of them share one `if`.
    const understood = new Set(
        [...sort.matchAll(/sort_by\s*[!=]==\s*"([^"]+)"/g)].map(match => match[1]));

    for (const [name, owners] of asked) {
        if (!understood.has(name)) {
            error(`inventory sorting: the ${[...new Set(owners)].join(" and ")} inventory has a button `
                + `asking to sort by "${name}", and no branch of sort_displayed_inventory mentions it. `
                + `Clicking it reorders nothing.`);
        }
    }
    for (const name of understood) {
        if (!asked.has(name)) {
            error(`inventory sorting: sort_displayed_inventory handles "${name}" and no button asks for `
                + `it, so no player can reach that ordering.`);
        }
    }

    console.log(`[check] inventory sorting: ${asked.size} ordering(s) offered by button, `
        + `${understood.size} understood by the comparator`);
}


/**
 * A remembered sort can actually be put back - button highlight included.
 *
 * `check_every_sort_button_is_understood` above asks that a button's ordering exists in the
 * comparator. This asks the question that only matters once the choice is saved: can the
 * restore find the button again, and does it move the highlight when it does.
 *
 * **The highlight is the half with no other owner.** It is moved by `set_active_button` in
 * index.html, on click, and by nothing else - no drawing code touches it. So a restore that
 * sets the sort and leaves the highlight alone brings the list back ordered by "latest" with
 * "name" lit, which is worse than not remembering at all: the panel would be lying about
 * itself rather than merely forgetting. Nothing else in the build can notice that, because
 * both halves are individually correct.
 *
 * **And the ids are built rather than listed**, which is the part that rots. The restore
 * turns a sort key into `inventory_sort_by_${by}`; the markup writes those ids out one by
 * one. Rename a button and the sort still works, the save still round-trips, and the restore
 * quietly finds nothing - the `if(!button) continue` that keeps an old save safe is the same
 * line that would swallow a typo. So every ordering a persisted target offers is checked to
 * resolve to an id that exists.
 */
function check_a_remembered_sort_can_be_put_back() {
    const html = fs.readFileSync(path.join(repo_root, "index.html"), "utf8");
    const display = strip_comments(
        fs.readFileSync(path.join(repo_root, "src", "inventory_display.js"), "utf8"));

    //Which targets the save carries, asked of the function that builds what is saved.
    const state_at = display.indexOf("function inventory_sorting_state(");
    if (state_at === -1) {
        error("inventory sorting: inventory_sorting_state is gone - "
            + "check_a_remembered_sort_can_be_put_back is out of date.");
        return;
    }
    const state_body = display.slice(state_at, display.indexOf("\n}", state_at));
    const persisted = [...state_body.matchAll(/^\s{8}(\w+):\s*\{/gm)].map(m => m[1]);

    //And how the restore turns a sort into an element id.
    const ids_at = display.indexOf("const sorting_button_ids = {");
    if (ids_at === -1) {
        error("inventory sorting: sorting_button_ids is gone - "
            + "check_a_remembered_sort_can_be_put_back is out of date.");
        return;
    }
    const ids_body = display.slice(ids_at, display.indexOf("\n};", ids_at));
    const patterns = new Map();
    for (const found of ids_body.matchAll(/(\w+):\s*\(by\)\s*=>\s*`([^`]+)`/g)) {
        patterns.set(found[1], found[2]);
    }

    if (persisted.length === 0 || patterns.size === 0) {
        error(`inventory sorting: read ${persisted.length} persisted target(s) and `
            + `${patterns.size} id pattern(s) - check_a_remembered_sort_can_be_put_back `
            + `would accept anything.`);
        return;
    }

    for (const target of persisted) {
        if (!patterns.has(target)) {
            error(`inventory sorting: the save carries the ${target} sort and `
                + `sorting_button_ids has no id for it, so restore_inventory_sorting cannot `
                + `find a button and the remembered choice is dropped in silence.`);
        }
    }

    //Every ordering each persisted target offers, and the id of the button that offers it.
    const offered = new Map();
    for (const button of html.matchAll(
            /id\s*=\s*"([^"]+)"[^>]*onclick\s*=\s*'sort(Character|Trader|Storage)Inventory\("([^"]+)"\)'/g)) {
        const target = button[2] === "Character" ? "character" : button[2].toLowerCase();
        if (!offered.has(target)) {
            offered.set(target, new Map());
        }
        offered.get(target).set(button[3], button[1]);
    }
    if (offered.size === 0) {
        error("inventory sorting: no sort button ids could be read out of index.html - "
            + "check_a_remembered_sort_can_be_put_back is out of date.");
        return;
    }

    let resolved = 0;
    for (const target of persisted) {
        const pattern = patterns.get(target);
        const buttons = offered.get(target);
        if (!pattern || !buttons) {
            continue;
        }
        for (const [by, id] of buttons) {
            const built = pattern.replace("${by}", by);
            resolved++;
            if (built === id) {
                continue;
            }
            error(`inventory sorting: the ${target} list can be sorted by "${by}" and the `
                + `save remembers it, but restore_inventory_sorting looks for "${built}" `
                + `while the button is "${id}". The sort comes back and the highlight does `
                + `not move, so the list is ordered one way and says another.`);
        }
    }

    //And the restore has to move the highlight at all.
    const restore_at = display.indexOf("function restore_inventory_sorting(");
    if (restore_at === -1) {
        error("inventory sorting: restore_inventory_sorting is gone - "
            + "check_a_remembered_sort_can_be_put_back is out of date.");
        return;
    }
    const restore_body = display.slice(restore_at, display.indexOf("\n}", restore_at));
    if (!/active_selection_button/.test(restore_body)) {
        error("inventory sorting: restore_inventory_sorting puts the sort back without "
            + "touching active_selection_button. Nothing else moves that highlight - "
            + "set_active_button in index.html only runs on click - so the restored list "
            + "would come back ordered by one thing with another lit.");
    }

    console.log(`[check] remembered sort: ${persisted.length} target(s) saved, `
        + `${resolved} ordering(s) resolving to a real button`);
}

export { check_a_sorted_field_is_saved,
         check_every_sort_button_is_understood,
         check_a_remembered_sort_can_be_put_back };
