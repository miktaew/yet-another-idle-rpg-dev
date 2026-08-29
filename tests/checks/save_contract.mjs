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

export {
    check_save_keys_round_trip,
};
