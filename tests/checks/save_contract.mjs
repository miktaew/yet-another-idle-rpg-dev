/** Every key the save writes is a key the load reads. */

import * as fs from "node:fs";
import * as path from "node:path";
import { error } from "../lib/report.mjs";
import { repo_root } from "../lib/context.mjs";
import { strip_comments } from "../lib/source.mjs";

/**
 * A save key is a contract with every save a player already has on disk.
 *
 * Moving eight fields into game_state.js rewrote `last_combat_location` to
 * `game_state.last_combat_location` throughout save_load.js - including inside the two
 * quoted save keys. The save then wrote `save_data["game_state.last_combat_location"]`
 * while the loader still read `save_data.last_combat_location`, so the value came back
 * undefined, and the next save wrote undefined - which JSON.stringify drops. The key
 * left the save file entirely and the game forgot which bed to return to. Nothing
 * failed: it built, the checks passed, and the loss only showed up by diffing two
 * exported saves days apart.
 *
 * So: collect the keys written to save_data and the keys read from it, and require
 * that every written key is read somewhere. A key written under a name nobody reads is
 * a field that silently stops persisting, which is the shape of the bug above.
 */
async function check_save_keys_round_trip() {
    const file = "src/save_load.js";
    const full = path.join(repo_root, file);
    if (!fs.existsSync(full)) {
        error(`${file} is missing - this check is out of date.`);
        return;
    }
    const source = strip_comments(fs.readFileSync(full, "utf8"));

    /*
        The whole identifier is matched first and classified afterwards. Writing the read
        side as `save_data\.(\w+)(?!\s*=)` looks equivalent and is not: the lookahead
        backtracks until the name is short enough to satisfy it, so `save_data.lore_last =`
        is happily reported as a read of "lore_las".
    */
    const written = new Set();
    const read = new Set();
    for (const use of source.matchAll(/save_data\[\s*"([^"]+)"\s*\]\s*(=(?!=))?/g)) {
        (use[2] ? written : read).add(use[1]);
    }
    for (const use of source.matchAll(/save_data\.([A-Za-z_]\w*)\s*(=(?!=))?/g)) {
        (use[2] ? written : read).add(use[1]);
    }
    //`saved_at` is read off a freshly parsed save rather than through save_data.
    //One level of nesting, for JSON.parse(localStorage.getItem(save_key)).saved_at.
    for (const use of source.matchAll(/JSON\.parse\((?:[^()]|\([^()]*\))*\)\.([A-Za-z_]\w*)/g)) {
        read.add(use[1]);
    }

    const orphans = [...written].filter(key => !read.has(key));
    for (const key of orphans) {
        error(`${file} writes save key "${key}" and never reads it. A save key is a contract`
            + " with saves players already hold: renaming the written side leaves the value"
            + " undefined on load, and the next save drops the key entirely.");
    }

    //The other direction is not an error on its own - the loader reads keys that old
    //saves carry and current ones no longer write - so it is reported, not failed.
    const unwritten = [...read].filter(key => !written.has(key));
    if (orphans.length === 0) {
        console.log(`[check] save keys round-trip: ${written.size} written, ${read.size} read`
            + (unwritten.length ? `, ${unwritten.length} read-only (older saves)` : ""));
    }
}

/**
 * An exported save names the version that wrote it, and when.
 *
 * The version is inside the file as well, and that is what the loader and check:save read -
 * but a file listing is not a file. A folder of six exports, all named the same but for the
 * timestamp, cannot answer the first question ever asked of an old save: which version wrote
 * this. That question opened P-38 and it opens every compatibility question after it.
 *
 * Nothing else in the build looks at the download name, and it is one template on one line
 * in index.html - exactly the kind of thing a tidy-up drops without anything noticing, since
 * the export keeps working and only stops being identifiable.
 */
function check_an_export_names_its_version() {
    const html = strip_comments(
        fs.readFileSync(path.join(repo_root, "index.html"), "utf8"));

    const assignment = /a\s*\.\s*download\s*=\s*`([^`]*)`/.exec(html);
    if (assignment === null) {
        error("no `a.download = `...`` in index.html - the export no longer names its file "
            + "there, and check_an_export_names_its_version is out of date.");
        return;
    }

    const template = assignment[1];
    for (const [what, pattern] of [["version", /get_game_version\s*\(\s*\)|game_version/],
                                   ["date", /getDate\s*\(\s*\)/]]) {
        if (!pattern.test(template)) {
            error(`an exported save is named "${template}", which does not say the ${what} `
                + `it was written at. A folder of exports cannot then be told apart.`);
        }
    }

    console.log(`[check] export name: "${template}"`);
}


/**
 * Every field the save writes into `character` is read back when it loads.
 *
 * `check_save_keys_round_trip` above asks this of the save's top-level keys and has caught a
 * real loss. It could not see this one: the player's own fields are written as one nested
 * object literal - `save_data["character"] = {name, money, xp, reputation, ...}` - so
 * `reputation` never appears as a `save_data.<key>` write and neither side of that check knew
 * it existed.
 *
 * **What that hid.** Reputation was written on every save and read by nothing: the restore
 * had been commented out upstream in favour of recomputing standing from the rewards of
 * finished content, replayed on load. That holds only while every source of standing is
 * replayable, and ours are not - a guild job pays when it is handed in, the board then drops
 * the job, and nothing is left to replay. So a player handed in four notices, watched their
 * standing rise, reloaded, and was back where they started. Measured: a save edited to hold
 * Village 777, Swamp 999 and Guild 4242 loaded as 460, 300 and 100.
 *
 * A field written and never read is worse than an absent one, because the save looks complete
 * and the export carries a number that means nothing. That is the class, and it is the same
 * class the top-level check was written for - so this asks the same question one level down
 * rather than being a second check with its own idea of what a save is.
 *
 * Comments are stripped first, which is the whole point: the read that was missing was still
 * there to read, inside a block comment.
 */
function check_saved_character_fields_are_read_back() {
    const file = "src/save_load.js";
    const full = path.join(repo_root, file);
    if (!fs.existsSync(full)) {
        error(`${file} is missing - this check is out of date.`);
        return;
    }
    const source = strip_comments(fs.readFileSync(full, "utf8"));

    const at = source.indexOf(`save_data["character"] = {`);
    if (at === -1) {
        error(`${file} no longer writes save_data["character"] as one object literal - `
            + `check_saved_character_fields_are_read_back cannot find the payload and would `
            + `accept anything.`);
        return;
    }

    /*
        Only the literal's own keys. `xp: {total_xp}` is one field of the character and
        total_xp is a field of the xp object - reading them at the same level would demand
        `save_data.character.total_xp`, which nothing writes and nothing should read.
    */
    const open = source.indexOf("{", at);
    let depth = 0;
    let close = -1;
    for (let i = open; i < source.length; i++) {
        if (source[i] === "{") depth++;
        else if (source[i] === "}") {
            depth--;
            if (depth === 0) { close = i; break; }
        }
    }
    if (close === -1) {
        error(`${file}: the character payload literal is unterminated.`);
        return;
    }

    const fields = [];
    depth = 0;
    for (let i = open + 1; i < close; i++) {
        const c = source[i];
        if (c === "{" || c === "[" || c === "(") depth++;
        else if (c === "}" || c === "]" || c === ")") depth--;
        else if (depth === 0) {
            const rest = source.slice(i, close);
            const key = /^([A-Za-z_]\w*)\s*:/.exec(rest);
            if (key && !/[\w.]/.test(source[i - 1] ?? "")) {
                fields.push(key[1]);
                i += key[0].length - 1;
            }
        }
    }
    if (fields.length < 5) {
        error(`only ${fields.length} character field(s) were read out of the save payload - `
            + `check_saved_character_fields_are_read_back is out of date.`);
        return;
    }

    const load_at = source.indexOf("function load(save_data)");
    const loader = load_at === -1 ? source : source.slice(load_at);

    const orphans = fields.filter(field => {
        //Every way the loader reaches one, optional chaining and bracket form included.
        const dotted = new RegExp(`save_data\\??\\.character\\??\\.\\s*${field}(?![\\w])`);
        const bracket = new RegExp(`save_data\\??\\.character\\??\\[\\s*["']${field}["']`);
        return !dotted.test(loader) && !bracket.test(loader);
    });

    for (const field of orphans) {
        error(`${file} saves character.${field} and the loader never reads it back. The save `
            + `looks complete and the value is dead: whatever the player earned in it is `
            + `replaced on load by whatever the game happens to compute instead, with no `
            + `message to say anything was taken.`);
    }

    if (orphans.length === 0) {
        console.log(`[check] saved character fields: ${fields.length} written, `
            + `all read back on load`);
    }
}

export {
    check_saved_character_fields_are_read_back,
    check_save_keys_round_trip,
    check_an_export_names_its_version,
};
