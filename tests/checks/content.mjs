/** Content: text ids, reachability, location types, actions, flags and shops. */

import * as fs from "node:fs";
import * as path from "node:path";
import { braced_body, strip_comments, top_level_keys } from "../lib/source.mjs";
import { default_language, repo_root } from "../lib/context.mjs";
import { error, errors } from "../lib/report.mjs";
import { load_locale } from "../lib/locale-files.mjs";

async function check_content_text_ids() {
    const reference = await load_locale(default_language);
    if (!reference) return;

    const scanned = [
        { file: "src/quests.js", patterns: [
            /(?<![A-Za-z0-9_])quest_name:\s*"([^"]+)"/g,
            /(?<![A-Za-z0-9_])quest_description:\s*"([^"]+)"/g,
            /(?<![A-Za-z0-9_])task_description:\s*"([^"]+)"/g,
            //The quest-progress log lines are parameterised, so they are getText
            //calls rather than a field. Unscanned, they were the last place three
            //hard-coded English sentences survived a whole localisation pass.
            /translationManager\.getText\(language,\s*"((?:log) [^"]+)"/g,
        ]},
        { file: "src/data/skills.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
            //The effect readouts are parameterised, so they are getText calls rather
            //than a field.
            /translationManager\.getText\(language,\s*"((?:skill effect) [^"]+)"/g,
        ]},
        { file: "src/data/locations.js", patterns: [
            /(?<![A-Za-z0-9_])messages:\s*\[\s*"([^"]+)"\s*\]/g,
            //Every text field in a location, an activity or a game action now holds
            //an id. The dynamic getDescription and getBackgroundNoises bodies call
            //getText directly, so those are matched by the call rather than a field.
            /(?<![A-Za-z0-9_])(?:description|starting_text|success_text|action_text|action_name|unlock_text|leave_text|custom_text|use_text|text_to_sleep):\s*"((?:desc|action|activity|loc|travel|noise|ui) [^"]+)"/g,
            /(?<![A-Za-z0-9_])(?:conditional_loss|random_loss|unable_to_begin):\s*\[\s*"((?:action) [^"]+)"\s*\]/g,
            /translationManager\.getText\(language,\s*"((?:desc|action|activity|loc|travel|noise|ui) [^"]+)"/g,
        ]},
        { file: "src/items.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"(desc [^"]+)"/g,
        ]},
        { file: "src/enemies.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
            //The on_hit / on_damaged combat messages.
            /translationManager\.getText\(language,\s*"((?:log) [^"]+)"/g,
        ]},
        { file: "src/data/dialogues.js", patterns: [
            //Textline fields sit at sixteen spaces; the Dialogue's own `name` sits at
            //eight and is a registry key, not an id, so the indentation is what keeps
            //the two apart. Comments are blanked before this runs, which matters here:
            //a whole commented-out dialogue ("cute little rat") still holds raw
            //English, and it is unreachable content rather than a translation gap.
            /^ {16}(?:name|text):\s*"([^"]+)"/gm,
            /(?<![A-Za-z0-9_])(?:description|starting_text):\s*"((?:desc|ui|sup|g |sus|elder|craftsman|guard|nekomimi|swamp|slum) [^"]*)"/g,
        ]},
        { file: "src/races.js", patterns: [
            //Race fields hold ids, not English, so a typo here shows up as the
            //placeholder inside a hero creation tooltip - a screen the player sees
            //exactly once and only on a new game.
            /(?<![A-Za-z0-9_])(?:name|alternative_name|description|gameplay_description):\s*"([^"]+)"/g,
        ]},
        { file: "src/combat_stances.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
        ]},
        { file: "src/active_effects.js", patterns: [
            /(?<![A-Za-z0-9_])description:\s*"([^"]+)"/g,
        ]},
        { file: "src/activities.js", patterns: [
            /(?<![A-Za-z0-9_])(?:description|action_text):\s*"([^"]+)"/g,
        ]},
        { file: "src/main.js", patterns: [
            //The log messages are parameterised, so they are getText calls. The
            //loading-screen messages live here rather than in display.js, so "ui"
            //is matched too - otherwise a typo in one of them is only visible to
            //whoever happens to boot the game.
            /translationManager\.getText\(language,\s*"((?:log|ui) [^"]+)"/g,
        ]},
        { file: "src/display.js", patterns: [
            //Interface labels, resolved where they are rendered.
            /translationManager\.getText\(language,\s*"((?:ui) [^"]+)"/g,
        ]},
    ];

    let checked = 0;
    const errors_before = errors.length;
    for (const entry of scanned) {
        const full_path = path.join(repo_root, entry.file);
        if (!fs.existsSync(full_path)) {
            error(`${entry.file} is missing - this check is out of date.`);
            continue;
        }
        // Blank out comments so documented templates and commented-out blocks are
        // not scanned, without the regex swallowing live code between them.
        const source = strip_comments(fs.readFileSync(full_path, "utf8"));

        for (const pattern of entry.patterns) {
            for (const match of source.matchAll(pattern)) {
                const text_id = match[1];
                checked++;
                if (!(text_id in reference)) {
                    error(`${entry.file} declares text id "${text_id}", which does not exist in locales/${default_language}.js.`);
                }
            }
        }
    }
    const unresolved = errors.length - errors_before;
    console.log(`[check] content text ids: ${checked} declared, ${checked - unresolved} resolved`);
}

/**
 * An action must not declare a branch it can never take.
 *
 * Two shapes, both found on the `gaze` action:
 *
 *   - `conditional_loss` with no `conditions`. process_conditions returns 1 when the
 *     condition list is empty (conditions.js: "no conditions mean nothing to fail"),
 *     so conditions_status is never 0 and that text cannot be reached. Gaze's copy
 *     was pasted from the deep dive and talked about lung capacity.
 *   - a success text with `success_chances` all zero. `action_result > Math.random()`
 *     is never true at 0, so the success branch cannot fire. Gaze's pointed at a row
 *     whose content was "[TBD]".
 *
 * Neither is a crash. Both are text that looks written and is not reachable, which is
 * the most expensive kind of dead content because it reads as finished.
 */
/**
 * A content object may not use a key its class does not accept.
 *
 * This is the check that was missing when two Textlines carried
 * `unlocks: { textlines: [...] }`. Textline has no such parameter and process_rewards
 * reads only `rewards`, so both blocks did nothing - and the harbour tallyman chain
 * stopped at its first line, taking the salt house, the bay trader, two more lines and
 * a four-task quest with it.
 *
 * Neither existing check could see it. check_reward_keys only opens blocks named
 * rewards / first_reward / repeatable_reward; check_content_is_reachable scans for the
 * {dialogue, lines} shape anywhere in the file, so the dead block counted as a real
 * unlock and the content read as reachable.
 *
 * So this compares each literal against the parameter list its constructor actually
 * destructures. A misspelled key, a key borrowed from another class, or one invented
 * on the spot is silent at runtime and loud here.
 */
/**
 * Every quest task's `items_from` names a real action that really requires items.
 *
 * A gathering task shows how many of each material the player has by reading the
 * requirement off the action that consumes them, rather than repeating the numbers in
 * the task. That keeps one source of truth and costs one pointer - and a pointer that
 * does not resolve produces a console error in a browser nobody is watching, and a
 * journal entry that quietly shows no progress at all.
 */
/**
 * An action that can fail declares the line it fails with.
 *
 * The failure line is picked as `list[Math.floor(list.length * Math.random())]`, and
 * for an empty list that is undefined - so the player was shown
 * "text not found, id: undefined" where the story should be. Five actions were in that
 * state: four of the region 3 and 4 actions and sparring with the guard, all of them
 * with a success chance below 1 and no random_loss line.
 *
 * Two shapes are checked, because they fail for different reasons and the player is
 * owed a different sentence for each: random_loss is needed when any success chance is
 * below 1 (you were good enough and the attempt did not land), conditional_loss when
 * the action has success conditions at all (you were not good enough).
 */
function check_actions_can_explain_failure() {
    let checked = 0;
    for (const relative of ["src/data/locations.js", "src/data/dialogues.js"]) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const match of source.matchAll(/new (?:Dialogue)?(?:Game)?Action\(\{/g)) {
            const open = source.indexOf("{", match.index + match[0].length - 1);
            const body = braced_body(source, open);
            if (body === null) {
                continue;
            }
            checked++;

            const id = body.match(/action_id:\s*"([^"]+)"/);
            const name = id ? id[1] : "an unnamed action";
            const line = source.slice(0, match.index).split("\n").length;

            const chances = body.match(/success_chances:\s*\[([^\]]*)\]/);
            const values = chances
                ? (chances[1].match(/[\d.]+/g) ?? []).map(Number)
                : [1];
            const can_fail_the_roll = values.some(value => value < 1);

            //`conditions:` and not `display_conditions:`, which is a different gate.
            const has_conditions = /(?<!display_)conditions:\s*\[/.test(body);

            if (can_fail_the_roll && !body.includes("random_loss")) {
                error(`${relative}:${line} the action "${name}" can fail its roll and has no`
                    + ` random_loss line, so a failure would print a missing-text marker.`);
            }
            if (has_conditions && !body.includes("conditional_loss")) {
                error(`${relative}:${line} the action "${name}" has success conditions and no`
                    + ` conditional_loss line, so failing them would print a missing-text marker.`);
            }
        }
    }

    if (checked < 40) {
        error(`only ${checked} actions were inspected - this check is out of date.`);
        return;
    }

    console.log(`[check] actions can explain failure: ${checked} actions`);
}

function check_quest_task_item_sources() {
    const quests_source = strip_comments(fs.readFileSync(path.join(repo_root, "src/quests.js"), "utf8"));
    const locations_source = strip_comments(fs.readFileSync(path.join(repo_root, "src/data/locations.js"), "utf8"));

    let checked = 0;
    const pattern = /items_from:\s*\{\s*location:\s*"([^"]+)"\s*,\s*action:\s*"([^"]+)"\s*\}/g;
    for (const match of quests_source.matchAll(pattern)) {
        const [, location, action] = match;
        checked++;

        //The action's declaration, then its own braces, so a `required` belonging to a
        //neighbouring action cannot be mistaken for this one's.
        const at = locations_source.indexOf(`action_id: "${action}"`);
        if (at < 0) {
            error(`a quest task reads its item counts from the action "${action}", which`
                + ` does not exist.`);
            continue;
        }
        const opens = locations_source.lastIndexOf("new GameAction({", at);
        const body = braced_body(locations_source, locations_source.indexOf("{", opens + "new GameAction(".length));
        if (!body || !body.includes("items_by_id")) {
            error(`a quest task reads its item counts from the action "${action}", which`
                + ` requires no items - so the counter it feeds would show nothing.`);
            continue;
        }

        if (!locations_source.includes(`locations["${location}"]`)) {
            error(`a quest task names the location "${location}" for its item counts,`
                + ` which is not a location.`);
        }
    }

    console.log(`[check] quest task item sources: ${checked} resolved`);
}

function check_content_object_keys() {
    //Where each class is declared, and which files construct it.
    const classes = [
        {name: "Dialogue", declared_in: "src/data/dialogues.js", used_in: ["src/data/dialogues.js"]},
        {name: "Textline", declared_in: "src/data/dialogues.js", used_in: ["src/data/dialogues.js"]},
        {name: "Location", declared_in: "src/data/locations.js", used_in: ["src/data/locations.js"]},
        {name: "Combat_zone", declared_in: "src/data/locations.js", used_in: ["src/data/locations.js"]},
        {name: "LocationActivity", declared_in: "src/data/locations.js", used_in: ["src/data/locations.js"]},
        {name: "LocationType", declared_in: "src/data/locations.js", used_in: ["src/data/locations.js"]},
    ];

    const read = (relative) =>
        strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

    let checked = 0;
    for (const {name, declared_in, used_in} of classes) {
        const declaration = read(declared_in);

        //The destructured parameter list of `class X { constructor({ ... })`.
        const at = declaration.indexOf(`class ${name}`);
        if (at < 0) {
            error(`class ${name} is not declared in ${declared_in} any more`
                + ` - this check is out of date.`);
            continue;
        }
        const ctor = declaration.indexOf("constructor({", at);
        if (ctor < 0) {
            error(`${name} no longer takes a destructured object - this check is out of date.`);
            continue;
        }
        /*
            A destructured parameter list is `{name, text, is_unlocked = true, ...}` -
            bare identifiers with optional defaults, not the `key: value` pairs
            top_level_keys reads. So the names are taken at depth zero, each one being
            whatever precedes an `=` or a `,`.
        */
        const parameter_body = braced_body(declaration,
            declaration.indexOf("{", ctor + "constructor(".length));
        const accepted = new Set();
        let depth = 0;
        let token = "";
        for (const character of parameter_body) {
            if ("{[(".includes(character)) depth++;
            else if ("}])".includes(character)) depth--;

            if (depth === 0 && (character === "," || character === "=")) {
                const name = token.trim();
                if (/^[A-Za-z_]\w*$/.test(name)) {
                    accepted.add(name);
                }
                //Everything up to the next top-level comma is a default value.
                token = character === "=" ? " " : "";
                continue;
            }
            if (depth === 0 && token !== " ") {
                token += character;
            }
        }
        const tail = token.trim();
        if (/^[A-Za-z_]\w*$/.test(tail)) {
            accepted.add(tail);
        }
        if (accepted.size === 0) {
            error(`${name}'s parameter list came out empty - this check is out of date.`);
            continue;
        }

        for (const relative of used_in) {
            const source = read(relative);
            const pattern = new RegExp(`new\\s+${name}\\(\\{`, "g");
            for (const match of source.matchAll(pattern)) {
                const open = source.indexOf("{", match.index + match[0].length - 1);
                const keys = top_level_keys(braced_body(source, open));
                checked++;
                for (const key of keys) {
                    if (accepted.has(key)) {
                        continue;
                    }
                    const line = source.slice(0, match.index).split("\n").length;
                    error(`${relative}:${line} builds a ${name} with "${key}", which is not`
                        + ` one of its constructor parameters. Nothing reads it, so whatever it`
                        + ` was meant to do does not happen.`);
                }
            }
        }
    }

    if (checked < 100) {
        error(`only ${checked} content objects were inspected - this check is out of date.`);
        return;
    }

    console.log(`[check] content object keys: ${checked} objects against their constructors`);
}

/**
 * The [...] starting at `open_at`, brackets balanced. The sibling of braced_body.
 */
function bracketed_body(text, open_at) {
    let depth = 0;
    for (let index = open_at; index < text.length; index++) {
        if (text[index] === "[") depth++;
        else if (text[index] === "]") {
            depth--;
            if (depth === 0) return text.slice(open_at, index + 1);
        }
    }
    return "";
}
/**
 * Every enemy is fielded by some zone, and every zone fields real enemies.
 *
 * Both directions fail silently in the game. A zone naming an enemy that is not a
 * template produces a spawn that never happens - the fight is just smaller, with nothing
 * to say why. A template no zone lists is content no player can reach, and now also a
 * bestiary entry with no answer to "where is one found".
 *
 * Two shapes are read, and a zone can carry both: enemies_list, and enemy_groups_list
 * whose entries hold their own lists.
 */
/**
 * Every trader stocks a list that exists.
 *
 * A Trader carries the NAME of its stock list and the lists live in
 * inventory_templates, so a name with no list behind it leaves the trader with nothing
 * to sell and nothing to say about it - get_inventory_from_template reads length off
 * undefined and throws when the shop is opened.
 */
/**
 * A skill's rank names all sit within the levels it can reach.
 *
 * A skill renames itself as it levels, and english_name() picks the highest rung at or
 * below current_level. A rung above max_level is therefore a name no player can ever see -
 * dead content that looks like content. At max_level exactly is fine and deliberate: Iron
 * skin is named after its own top rung.
 */
function check_skill_rank_levels() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/data/skills.js"), "utf8"));

    let ranked = 0;
    let checked = 0;
    for (const match of source.matchAll(/skills\["([^"]+)"\]\s*=\s*new Skill\(\{/g)) {
        const body = braced_body(source, source.indexOf("{", match.index + match[0].length - 1));
        if (body === null) continue;

        const names = body.match(/names:\s*\{([^}]*)\}/);
        if (!names) continue;
        checked++;

        const rungs = [...names[1].matchAll(/(\d+)\s*:\s*"([^"]+)"/g)]
            .map(rung => ({level: Number(rung[1]), name: rung[2]}));
        if (rungs.length > 1) ranked++;

        const max_level = Number((body.match(/max_level:\s*(\d+)/) || [, 60])[1]);
        for (const rung of rungs) {
            if (rung.level > max_level) {
                error(`the skill "${match[1]}" is renamed to "${rung.name}" at level`
                    + ` ${rung.level}, but it stops at ${max_level} - so that name can never`
                    + ` be seen.`);
            }
        }
    }

    if (checked < 50) {
        error(`only ${checked} skills inspected - this check is out of date.`);
        return;
    }

    console.log(`[check] skill rank names: ${ranked} of ${checked} skills rank up`);
}
function check_trader_stock_lists() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/traders.js"), "utf8"));

    const lists = new Set([...source.matchAll(/inventory_templates\["([^"]+)"\]\s*=/g)]
        .map(match => match[1]));

    let checked = 0;
    for (const match of source.matchAll(/inventory_template:\s*"([^"]+)"/g)) {
        checked++;
        if (!lists.has(match[1])) {
            error(`a trader stocks "${match[1]}", which is not an inventory template.`
                + ` Its shop would be empty and would throw when opened.`);
        }
    }

    if (checked === 0 || lists.size === 0) {
        error(`found ${checked} traders and ${lists.size} stock lists - this check is out of date.`);
        return;
    }

    console.log(`[check] trader stock: ${checked} traders across ${lists.size} lists`);
}
function check_every_enemy_has_a_home() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/data/locations.js"), "utf8"));
    const enemies = strip_comments(fs.readFileSync(path.join(repo_root, "src/enemies.js"), "utf8"));

    const templates = new Set([...enemies.matchAll(/enemy_templates\["([^"]+)"\]\s*=/g)]
        .map(match => match[1]));

    //The ones that ask to stay out of the bestiary.
    const hidden = new Set();
    for (const match of enemies.matchAll(/enemy_templates\["([^"]+)"\]\s*=\s*new Enemy\(\{/g)) {
        const body = braced_body(enemies, enemies.indexOf("{", match.index + match[0].length - 1));
        if (body !== null && /add_to_bestiary:\s*false/.test(body)) {
            hidden.add(match[1]);
        }
    }

    const listed = new Map();
    const combat_zones = new Set();
    let zones = 0;
    for (const match of source.matchAll(/locations\["([^"]+)"\]\s*=\s*new (Combat_zone|Challenge_zone)\(\{/g)) {
        const body = braced_body(source, source.indexOf("{", match.index + match[0].length - 1));
        if (body === null) continue;
        zones++;
        if (match[2] === "Combat_zone") {
            combat_zones.add(match[1]);
        }

        for (const key of ["enemies_list", "enemy_groups_list"]) {
            const found = body.match(new RegExp(key + String.raw`:\s*\[`));
            if (!found) continue;
            const list = bracketed_body(body, body.indexOf("[", found.index));
            for (const quoted of list.matchAll(/"([^"]+)"/g)) {
                if (!listed.has(quoted[1])) listed.set(quoted[1], []);
                listed.get(quoted[1]).push(match[1]);
            }
        }
    }

    for (const [name, zone_keys] of listed) {
        if (!templates.has(name)) {
            error(`the zone "${zone_keys[0]}" fields "${name}", which is not an enemy`
                + ` template. That spawn never happens and the fight is silently smaller.`);
        }
    }
    for (const name of templates) {
        if (!listed.has(name)) {
            error(`the enemy "${name}" is fielded by no zone, so no player can meet it`
                + ` - and its bestiary entry would have nowhere to point at.`);
        }
    }


    /*
        add_to_bestiary is meant to hide challenge bosses, and its own comment in
        enemies.js says to "set it false only for SOME of challenges and keep true for
        everything else". An enemy a normal Combat_zone fields is not that: hiding it
        leaves a creature the player fights repeatedly with no entry and no kill count,
        which is how a warthog went missing from the list.
    */
    for (const [name, zone_keys] of listed) {
        if (!hidden.has(name)) continue;
        const ordinary = zone_keys.filter(key => combat_zones.has(key));
        if (ordinary.length > 0) {
            error(`the enemy "${name}" is hidden from the bestiary but is fielded by`
                + ` "${ordinary[0]}", an ordinary combat zone - so it is fought over and`
                + ` over with no entry and no kill count. add_to_bestiary: false is for`
                + ` challenge bosses.`);
        }
    }
    if (zones < 20 || templates.size < 20) {
        error(`only ${zones} zones and ${templates.size} enemies found - this check is out of date.`);
        return;
    }

    console.log(`[check] enemy homes: ${templates.size} enemies across ${zones} zones`);
}
function check_action_branches() {
    let checked = 0;
    for (const relative of ["src/data/locations.js", "src/data/dialogues.js"]) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const match of source.matchAll(/new (?:GameAction|DialogueAction)\(\{([\s\S]*?)\n\s{8,12}\}\)/g)) {
            const body = match[1];
            const id = body.match(/action_id:\s*"([^"]+)"/);
            const name = id ? id[1] : "(action with no id)";
            checked++;

            const has_conditions = /\n\s+conditions:\s*\[\s*\{/.test(body);
            if (/conditional_loss:/.test(body) && !has_conditions) {
                error(`action "${name}" in ${relative} declares a conditional_loss text but has no`
                    + " conditions. process_conditions returns 1 for an empty list, so that text"
                    + " can never be shown.");
            }

            const chances = body.match(/success_chances:\s*\[([^\]]*)\]/);
            const all_zero = chances
                && chances[1].split(",").filter(part => part.trim()).every(part => Number(part) === 0);
            if (all_zero && /\n\s+success_text(s)?:|getSuccessText/.test(body)) {
                error(`action "${name}" in ${relative} has success_chances of zero but declares a`
                    + " success text, which no player can reach. Either give it a chance of"
                    + " succeeding or drop the text.");
            }
        }
    }
    console.log(`[check] action branches: ${checked} actions`);
}

/**
 * Every global_flags name referenced outside main.js has to exist in main.js.
 *
 * The flags are a string-keyed object, so a rename or a typo is silent in both
 * directions: `global_flags.is_mountain_forge_buit` is undefined, which is falsy,
 * which means the Mountain camp's forge would simply never appear and nothing would
 * say why. A reward granting a flag that main.js does not declare adds a key
 * nothing reads.
 *
 * This is the check the mountain forge needed, because the whole mechanism is a
 * getter reading one flag name: `get tiers()` on the camp's crafting object
 * evaluates at the moment of the craft (main.js and display.js both read
 * current_location.crafting.tiers[category] live), and a falsy tier hides the
 * category button entirely. That behaviour is right, and it is also exactly why a
 * misspelled flag would look like a design decision rather than a bug.
 */
async function check_global_flags() {
    const main_source = strip_comments(fs.readFileSync(path.join(repo_root, "src/main.js"), "utf8"));

    const block = main_source.match(/const global_flags = \{([\s\S]*?)\n\};/);
    if (!block) {
        error("src/main.js has no `const global_flags = { ... }` - this check is out of date.");
        return;
    }
    const declared = new Set([...block[1].matchAll(/^\s+([A-Za-z_][A-Za-z0-9_]*)\s*:/gm)]
        .map(match => match[1]));
    if (declared.size === 0) {
        error("could not read any names out of global_flags - this check is out of date.");
        return;
    }

    //Two ways a flag is named: read as a property, or granted as a reward string.
    const scanned = ["src/data/locations.js", "src/data/dialogues.js", "src/quests.js", "src/enemies.js"];
    let references = 0;
    for (const relative of scanned) {
        const source = strip_comments(fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const match of source.matchAll(/global_flags\.([A-Za-z_][A-Za-z0-9_]*)/g)) {
            references++;
            if (!declared.has(match[1])) {
                error(`${relative} reads global_flags.${match[1]}, which src/main.js does not`
                    + " declare. An undeclared flag is undefined, which is falsy, so whatever it"
                    + " gates would silently never appear.");
            }
        }
        //Three shapes, all of which name a flag as a string: `flags: ["is_x"]` in a
        //rewards object, `required_flags: {yes: [...], no: [...]}` on a textline, and
        //`display_conditions: {flags: [...]}`. The first version of this pattern
        //excluded a preceding underscore to avoid matching a property called
        //something_flags, which also excluded required_flags - the one of the three
        //that gates whether a line can be seen at all.
        for (const list of source.matchAll(/\b(?:required_)?flags\s*:\s*(\{[^}]*\}|\[[^\]]*\])/g)) {
            for (const name of list[1].matchAll(/"([A-Za-z_][A-Za-z0-9_]*)"/g)) {
                references++;
                if (!declared.has(name[1])) {
                    error(`${relative} names flag "${name[1]}", which src/main.js does not declare`
                        + " in global_flags.");
                }
            }
        }
    }
    console.log(`[check] global flags: ${declared.size} declared, ${references} references resolved`);
}

/**
 * A location with a trader needs a market region, and the region has to exist.
 *
 * The game has its own verifier (src/verifier.js) which says exactly this, and it
 * is the one that caught the salt house - in a browser, after `npm run check` had
 * already passed. That is the wrong order: the verifier needs the whole module
 * graph and the circular imports that only resolve in a browser, so it cannot run
 * here, but this particular assertion is plain text and belongs in the build.
 *
 * Without a region, market_saturation has no counter for the shop and the prices it
 * quotes are not the prices it charges.
 */
async function check_trader_market_regions() {
    const locations_source = strip_comments(fs.readFileSync(path.join(repo_root, "src/data/locations.js"), "utf8"));
    const market_source = strip_comments(fs.readFileSync(path.join(repo_root, "src/market_saturation.js"), "utf8"));

    const mapping = market_source.match(/const market_region_mapping = \{([\s\S]*?)\n\};/);
    if (!mapping) {
        error("src/market_saturation.js has no `const market_region_mapping = { ... }`"
            + " - this check is out of date.");
        return;
    }
    const regions = new Set([...mapping[1].matchAll(/"([^"]+)"\s*:/g)].map(match => match[1]));
    //The mapping is symmetrised at load: anything named as a neighbour becomes a
    //region of its own too.
    for (const match of mapping[1].matchAll(/:\s*\[([^\]]*)\]/g)) {
        for (const neighbour of match[1].matchAll(/"([^"]+)"/g)) {
            regions.add(neighbour[1]);
        }
    }

    //Each `locations["X"] = new Location({ ... });` block, so traders and
    //market_region can be read as belonging to the same room. Only Location: a
    //Combat_zone cannot hold a shop.
    const blocks = [...locations_source.matchAll(/locations\["([^"]+)"\]\s*=\s*new Location\(\{([\s\S]*?)\n {4}\}\);/g)];
    if (blocks.length === 0) {
        error("could not read any location blocks out of src/locations.js - this check is out of date.");
        return;
    }

    //Anchored at the room's own indentation. A `traders:` nested inside a reward is
    //a different thing entirely: Gang hideout's repeatable_reward carries
    //`locks: {traders: [...]}`, which is a trader being taken away from the Slums,
    //and reading that as a shop inside a combat zone is how this check first
    //reported a defect that was not there.
    const own_field = (body, field) => body.match(new RegExp(`^ {8}${field}\\s*:\\s*(.*)$`, "m"));

    let with_traders = 0;
    for (const [, name, body] of blocks) {
        const traders = own_field(body, "traders");
        if (!traders || !/\[\s*"/.test(traders[1])) continue;
        with_traders++;

        const region_field = own_field(body, "market_region");
        const region = region_field && region_field[1].match(/^"([^"]+)"/);
        if (!region) {
            error(`location "${name}" has a trader but no market_region, so market saturation has`
                + " no counter for its shop. src/verifier.js refuses this at runtime.");
            continue;
        }
        if (!regions.has(region[1])) {
            error(`location "${name}" claims market_region "${region[1]}", which is not a region in`
                + " market_region_mapping.");
        }
    }
    console.log(`[check] trader market regions: ${with_traders} shops across ${regions.size} regions`);
}

/**
 * Every location type a zone claims must exist, at a stage that exists.
 *
 * The stages are where a type's effects and skill scaling live, so a zone asking
 * for a stage the type does not define asks for nothing: it reads as a configured
 * environment and behaves as an unconfigured one. Caught while writing the plains,
 * which claimed `open` at stage 3 when `open` defines 1 and 2.
 *
 * The stage numbers are read from the LocationType declarations rather than
 * hard-coded, so adding a stage to a type does not need a change here.
 */
function check_location_types() {
    const source = strip_comments(fs.readFileSync(path.join(repo_root, "src/data/locations.js"), "utf8"))
        .split("\r\n").join("\n");

    const defined = new Map();
    for (const match of source.matchAll(/location_types\["([^"]+)"\]\s*=\s*new LocationType\(\{/g)) {
        const body = braced_body(source, match.index + match[0].length - 1);
        if (body === null) continue;
        defined.set(match[1], [...body.matchAll(/^\s{12}(\d+):\s*\{/gm)].map(stage => Number(stage[1])));
    }
    if (defined.size === 0) {
        error("src/locations.js declares no location types - this check is out of date.");
        return;
    }

    let checked = 0;
    for (const match of source.matchAll(/\{type:\s*"([^"]+)",\s*stage:\s*(\d+)/g)) {
        checked++;
        const [, type, stage] = match;
        if (!defined.has(type)) {
            error(`a zone claims location type "${type}", which is not declared.`);
        } else if (!defined.get(type).includes(Number(stage))) {
            error(`a zone claims location type "${type}" at stage ${stage}, which it does not`
                + ` define (it has ${defined.get(type).join(", ")}). The stage carries the`
                + " type's effects and scaling, so the zone would get none of them.");
        }
    }
    console.log(`[check] location types: ${checked} claims across ${defined.size} types`);
}

/**
 * Every locked textline and action must be unlocked by something, and every unlock
 * must name something that exists.
 *
 * A textline with is_unlocked: false that nothing ever unlocks is dead content the
 * author cannot see is dead. That is not hypothetical: the "cute little rat"
 * dialogue's ~who~ line sat unreachable from the day it was written, because the
 * line before it unlocked ~walls~ instead - a copy-paste slip no test could notice
 * and no player could report, since nobody could reach the dialogue at all.
 *
 * Three mechanisms unlock things and all three are counted: rewards.textlines,
 * rewards.actions, and the otherUnlocks callbacks that assign .is_unlocked
 * directly. Rewards are read from five files, not two - quests unlock textlines
 * too, and missing that reported the village elder's "more training" as dead when
 * quests.js is what unlocks it.
 */
function check_content_is_reachable() {
    const read = file => strip_comments(fs.readFileSync(path.join(repo_root, file), "utf8"))
        .split("\r\n").join("\n");

    const dialogues_src = read("src/data/dialogues.js");
    const locations_src = read("src/data/locations.js");
    const reward_sources = [dialogues_src, locations_src,
        ...["src/quests.js", "src/enemies.js", "src/models/game_action.js"].map(read)];

    /** key -> is it declared locked */
    const declared = new Map();

    const collect = (owner, body, kind, constructor_name) => {
        const marker = new RegExp(`${kind}:\\s*\\{`);
        const found = body.match(marker);
        if (!found) return;
        const group = braced_body(body, found.index + found[0].length - 1);
        if (group === null) return;

        const entries = new RegExp(`"([^"]+)":\\s*new ${constructor_name}\\(\\{`, "g");
        for (const entry of group.matchAll(entries)) {
            const inner = braced_body(group, entry.index + entry[0].length - 1);
            declared.set(`${owner}|${entry[1]}|${kind}`, /is_unlocked:\s*false/.test(inner ?? ""));
        }
    };

    for (const match of dialogues_src.matchAll(/dialogues\["([^"]+)"\]\s*=\s*new Dialogue\(\{/g)) {
        const body = braced_body(dialogues_src, match.index + match[0].length - 1);
        if (body === null) continue;
        collect(match[1], body, "textlines", "Textline");
        collect(match[1], body, "actions", "DialogueAction");
    }
    for (const match of locations_src.matchAll(/locations\["([^"]+)"\]\.actions\s*=\s*\{/g)) {
        const group = braced_body(locations_src, match.index + match[0].length - 1);
        if (group === null) continue;
        for (const entry of group.matchAll(/"([^"]+)":\s*new GameAction\(\{/g)) {
            const inner = braced_body(group, entry.index + entry[0].length - 1);
            declared.set(`${match[1]}|${entry[1]}|actions`, /is_unlocked:\s*false/.test(inner ?? ""));
        }
    }

    const unlocked = new Set();
    for (const source of reward_sources) {
        // Both property orders, because content uses both.
        for (const match of source.matchAll(/\{\s*dialogue:\s*"([^"]+)"\s*,\s*lines:\s*\[([^\]]*)\]/g)) {
            for (const line of match[2].matchAll(/"([^"]+)"/g)) {
                unlocked.add(`${match[1]}|${line[1]}|textlines`);
            }
        }
        for (const match of source.matchAll(/\{\s*lines:\s*\[([^\]]*)\]\s*,\s*dialogue:\s*"([^"]+)"/g)) {
            for (const line of match[1].matchAll(/"([^"]+)"/g)) {
                unlocked.add(`${match[2]}|${line[1]}|textlines`);
            }
        }
        for (const match of source.matchAll(/\{\s*(?:dialogue|location):\s*"([^"]+)"\s*,\s*action:\s*"([^"]+)"\s*\}/g)) {
            unlocked.add(`${match[1]}|${match[2]}|actions`);
        }
        for (const match of source.matchAll(/\{\s*action:\s*"([^"]+)"\s*,\s*(?:dialogue|location):\s*"([^"]+)"\s*\}/g)) {
            unlocked.add(`${match[2]}|${match[1]}|actions`);
        }
        for (const match of source.matchAll(
            /(?:dialogues|locations)\["([^"]+)"\]\.(textlines|actions)\["([^"]+)"\]\.is_unlocked\s*=\s*true/g)) {
            unlocked.add(`${match[1]}|${match[3]}|${match[2]}`);
        }
    }

    if (declared.size === 0 || unlocked.size === 0) {
        error("found no content to check reachability for - this check is out of date.");
        return;
    }

    for (const [key, locked] of declared) {
        if (locked && !unlocked.has(key)) {
            const [owner, name, kind] = key.split("|");
            error(`${kind.replace(/s$/, "")} "${name}" on "${owner}" starts locked and nothing`
                + " unlocks it, so no player can ever reach it.");
        }
    }
    for (const key of unlocked) {
        if (!declared.has(key)) {
            const [owner, name, kind] = key.split("|");
            error(`something unlocks ${kind.replace(/s$/, "")} "${name}" on "${owner}",`
                + " which is not declared there.");
        }
    }
    console.log(`[check] content reachability: ${declared.size} declared,`
        + ` ${[...declared.values()].filter(Boolean).length} locked, ${unlocked.size} unlocks`);
}

export {
    check_action_branches,
    check_every_enemy_has_a_home,
    check_skill_rank_levels,
    check_trader_stock_lists,
    check_actions_can_explain_failure,
    check_quest_task_item_sources,
    check_content_object_keys,
    check_content_is_reachable,
    check_content_text_ids,
    check_global_flags,
    check_location_types,
    check_trader_market_regions,
};
