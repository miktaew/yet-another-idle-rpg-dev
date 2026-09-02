/**
 * The crafting quality model: who rolls a quality, and whether the roll knows what
 * went into it.
 *
 * These exist because the four crafting paths drifted apart without anyone noticing.
 * Only equipment assembly ever consulted its inputs; component crafting rolled from
 * the station tier alone and ignored which stack the player had picked, and item
 * recipes did not roll at all - the result was added at the template's own inventory
 * key, so a dish cooked from a good fish came out with quality null. Fishing is the
 * only thing outside crafting that makes a quality, which is why the symptom that
 * surfaced was "fish quality disappears after cooking" (P-22).
 *
 * The drift was possible because each class carried its own roll_quality body. They
 * share one now, and these checks are about keeping the shape they share.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { load_browser_free } from "../lib/browser-free-src.mjs";
import { strip_comments } from "../lib/source.mjs";

/**
 * The arguments of the call whose opening parenthesis is at `open`, split on
 * top-level commas only.
 *
 * A regex cannot do this: two of the six call sites pass an argument containing its
 * own parentheses or brackets, and one spans three lines. Returns null if the
 * parentheses do not close, so a malformed match is reported rather than guessed at.
 */
function call_arguments(source, open) {
    let depth = 0;
    let start = open + 1;
    const args = [];

    for (let i = open; i < source.length; i++) {
        const character = source[i];
        if ("([{".includes(character)) {
            depth++;
        } else if (")]}".includes(character)) {
            depth--;
            if (depth === 0) {
                args.push(source.slice(start, i));
                return args;
            }
        } else if (character === "," && depth === 1) {
            args.push(source.slice(start, i));
            start = i + 1;
        }
    }
    return null;
}

/** Every `roll_quality` declaration in the source, as {parameters, line}. */
function quality_roll_declarations(source) {
    const found = [];
    for (const match of source.matchAll(/(?<![.\w])roll_quality\s*\(/g)) {
        const open = match.index + match[0].length - 1;
        const parameters = call_arguments(source, open);
        if (parameters === null) continue;

        //A declaration is followed by its body; a call is not.
        const closing = open + 1 + parameters.join(",").length;
        if (!/^\)\s*\{/.test(source.slice(closing))) continue;

        found.push({
            parameters,
            line: source.slice(0, match.index).split("\n").length,
        });
    }
    return found;
}

/**
 * Every roll of a crafting quality has to be able to take the quality of what went
 * in - which means its FIRST parameter, because that is the one the shipped callers
 * fill.
 *
 * The old signature was roll_quality(tier = 0): the tier in first position, no way to
 * say anything about the materials. Three of the four recipe classes had it, so
 * passing an input quality was not something a caller could do wrong - it was
 * something a caller could not do at all. That is the shape this refuses.
 */
function check_quality_rolls_take_an_input_quality() {
    const declarations = [];

    for (const relative of ["src/crafting_recipes.js"]) {
        const source = strip_comments(
            fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const found of quality_roll_declarations(source)) {
            declarations.push({ ...found, file: relative });
        }
    }

    if (declarations.length === 0) {
        error("crafting quality: found no roll_quality declaration at all - "
            + "this check is out of date and has stopped guarding anything.");
        return;
    }

    console.log(`[check] crafting quality: ${declarations.length} quality roll`
        + ` declaration(s), each taking what went in`);

    for (const { parameters, line, file } of declarations) {
        const first = (parameters[0] ?? "").trim();

        if (!/quality/.test(first)) {
            error(`crafting quality: roll_quality at ${file}:${line} takes `
                + `"${first || "nothing"}" first, so a caller has no way to say what `
                + `went into the craft. The input quality goes first and the tier `
                + `second - see ItemRecipe.roll_quality.`);
        }
    }
}

/**
 * And every caller has to actually say it.
 *
 * A signature that accepts an input quality buys nothing if the call sites keep
 * passing only a tier, and that is exactly how the item path stayed broken while the
 * machinery to fix it - get_quality_range's two branches - had been sitting in the
 * base class the whole time. So: two arguments, and the first one is about quality.
 *
 * Passing a falsy quality is fine and is the point: get_quality_range answers a falsy
 * one with its no-input branch, so a recipe whose materials carry no quality rolls
 * what it always rolled.
 */
function check_crafting_passes_the_input_quality() {
    const sites = [];

    for (const relative of ["src/crafting.js", "src/crafting_recipes.js"]) {
        const source = strip_comments(
            fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const match of source.matchAll(/\.roll_quality\s*\(/g)) {
            const open = match.index + match[0].length - 1;
            sites.push({
                args: call_arguments(source, open),
                line: source.slice(0, match.index).split("\n").length,
                file: relative,
            });
        }
    }

    /*
        And the item branch's result has to be able to carry one.

        The count below would catch its roll being deleted outright, but not its roll
        being kept while the result went back to the template's own key - which is the
        exact line the fish's quality used to die on, and it read innocently:
        add_to_character_inventory([{item_key: item_templates[result_id].getInventoryKey()}]).
        A key built from the template can never carry a quality, so that call is
        refused by shape. Building the key from the template and then adding a quality
        to it, as use_recipe does now, is not this pattern.
    */
    const crafting_source = strip_comments(
        fs.readFileSync(path.join(repo_root, "src/crafting.js"), "utf8"));

    for (const match of crafting_source.matchAll(
        /add_to_character_inventory\(\[\{\s*item_key:\s*item_templates\[[^\]]+\]\.getInventoryKey\(\)/g)) {
        const line = crafting_source.slice(0, match.index).split("\n").length;
        error(`crafting quality: src/crafting.js:${line} adds a crafted item at its `
            + `template's own inventory key, which cannot carry a quality. Roll one `
            + `from what went in and put it on the key - that line is where a good `
            + `fish became an ordinary meal (P-22).`);
    }

    //Six as of P-22: three in use_recipe's branches, three in the getResult bodies.
    if (sites.length < 6) {
        error(`crafting quality: found ${sites.length} roll_quality call site(s), `
            + `expected at least 6 - this check is out of date.`);
        return;
    }

    console.log(`[check] crafting quality: ${sites.length} roll_quality call site(s)`
        + ` passing an input quality`);

    for (const { args, line, file } of sites) {
        if (args === null) {
            error(`crafting quality: could not read the arguments of the `
                + `roll_quality call at ${file}:${line}.`);
            continue;
        }
        if (args.length < 2) {
            error(`crafting quality: roll_quality at ${file}:${line} is called with `
                + `${args.length} argument(s). It takes the input quality first and `
                + `the tier second; a one-argument call passes the tier as the `
                + `quality, which is how the fish path lost its quality.`);
            continue;
        }
        const first = args[0].trim();
        if (!/quality/.test(first)) {
            error(`crafting quality: roll_quality at ${file}:${line} passes `
                + `"${first}" as the input quality, which does not look like one. If `
                + `the craft genuinely has no input quality, pass undefined and say `
                + `so - do not pass the tier.`);
        }
    }
}

/**
 * What the parameter is for, measured through the shipped roll rather than restated:
 * a better input has to give a better result, and no input has to change nothing.
 *
 * The middle assertion is the one that keeps this honest. get_quality_range's two
 * branches meet at an input quality of 80 - 50 + 80 is the 130 the no-input branch
 * adds - so the branch that item recipes have always used is literally "assume the
 * materials were 80". That is why passing the real quality is not a blanket buff: it
 * is symmetric around the number the game was already assuming. If someone retunes
 * one branch and not the other, the two stop meeting and a poor fish silently becomes
 * free money, or a good one a penalty.
 */
async function check_a_better_input_makes_a_better_result() {
    const [{ recipes }] = await load_browser_free(
        repo_root, ["src/crafting_recipes.js", "src/items.js"]);

    //One of each kind that rolls: an item recipe, a component recipe, an assembly.
    const under_test = [
        ["cooking item recipe", recipes.cooking?.items?.["Fried fish"]],
        ["forging component recipe", Object.values(recipes.forging?.components ?? {})[0]],
        ["equipment assembly", Object.values(recipes.crafting?.equipment ?? {})[0]],
    ];

    console.log(`[check] crafting quality: ${under_test.length} recipe kinds measured`
        + ` through the shipped roll`);

    for (const [label, recipe] of under_test) {
        if (!recipe) {
            error(`crafting quality: no ${label} to test - this check is out of date.`);
            continue;
        }

        /*
            Sampled through roll_quality rather than read off get_quality_range,
            because the parameter being threaded from the signature to the range is
            half of what broke: a roll_quality that takes only a tier still answers
            get_quality_range correctly, and a check that asked the range directly
            passed while the shipped roll was reading 130 as a station tier.
        */
        const sample = (input) => {
            const rolled = [];
            for (let i = 0; i < 40; i++) { rolled.push(recipe.roll_quality(input, 0)); }
            return rolled;
        };

        const poor = sample(40);
        const good = sample(130);
        const unqualitied = recipe.get_quality_range(0);
        const assumed = recipe.get_quality_range(0, 80);

        if (Math.min(...good) <= Math.max(...poor)) {
            error(`crafting quality: the ${label} rolled `
                + `${Math.min(...good)}-${Math.max(...good)} from a 130% input and `
                + `${Math.min(...poor)}-${Math.max(...poor)} from a 40% one, so what `
                + `went in does not decide what comes out.`);
        }

        if (unqualitied[0] !== assumed[0]) {
            error(`crafting quality: the ${label}'s no-input range starts at `
                + `${unqualitied[0]} but an input of 80 starts at ${assumed[0]}. The `
                + `two branches of get_quality_range are meant to meet at 80, so that `
                + `passing a real quality is symmetric around what the game already `
                + `assumed rather than a buff or a nerf.`);
        }

        //And the fallback has to be the no-input branch, not a roll from nothing.
        for (const nothing of [undefined, null, 0]) {
            const rolled = sample(nothing);
            const outside = rolled.filter(
                (quality) => quality < unqualitied[0] || quality > unqualitied[1]);

            if (outside.length > 0) {
                error(`crafting quality: the ${label} rolled ${outside[0]} for an input `
                    + `quality of ${String(nothing)}, outside the `
                    + `${JSON.stringify(unqualitied)} it rolls for none. A material `
                    + `with no quality has to leave the roll as it was.`);
            }
        }
    }
}

/**
 * A quality the player cannot see is worse than no quality at all.
 *
 * Both places that draw one - the tooltip and the inventory row - ask the item for
 * use_quality first, and all 39 usable items said false because until P-22 no cooked
 * thing had a quality to draw. Wiring the quality through without this would have left
 * a dish saved, priced and traded on a number shown nowhere on it: the exact pairing -
 * invisible and consequential at once - that this project has spent versions hunting.
 *
 * So the rule is derived rather than listed: walk the item recipes from everything that
 * shows a quality today, and every result a quality can reach has to show one too. Give
 * another material a quality, or add a recipe that consumes one, and this names what
 * would swallow it.
 */
async function check_inherited_quality_is_shown() {
    const [{ item_templates }, { recipes }] = await load_browser_free(
        repo_root, ["src/items.js", "src/crafting_recipes.js"]);

    const by_material_type = {};
    for (const id of Object.keys(item_templates)) {
        const type = item_templates[id].material_type;
        if (type) { (by_material_type[type] ??= []).push(id); }
    }

    /*
        Every item recipe as {result, inputs}. A recipe that names a material_type
        rather than an id stands for every item of that type, which is how the six fish
        reach three different cooking recipes.
    */
    const item_recipes = [];
    for (const category of Object.keys(recipes)) {
        for (const key of Object.keys(recipes[category].items ?? {})) {
            const recipe = recipes[category].items[key];
            const inputs = [];
            for (const material of recipe.materials ?? []) {
                if (material.material_id) {
                    inputs.push(material.material_id);
                } else if (material.material_type) {
                    inputs.push(...(by_material_type[material.material_type] ?? []));
                }
            }
            inputs.forEach((id) => {
                if (!item_templates[id]) {
                    error(`crafting quality: ${category}/${key} names a material `
                        + `"${id}" that is not an item - this check is out of date.`);
                }
            });
            item_recipes.push({
                where: `${category}/${key}`,
                result: recipe.result?.result_id,
                inputs,
            });
        }
    }

    if (item_recipes.length === 0) {
        error("crafting quality: found no item recipes to walk - "
            + "this check is out of date and has stopped guarding anything.");
        return;
    }

    //Everything that shows a quality today, then everything a recipe can pass one to.
    const carriers = new Set(
        Object.keys(item_templates).filter((id) => item_templates[id].use_quality));

    for (let growing = true; growing; ) {
        growing = false;
        for (const { result, inputs } of item_recipes) {
            if (result && !carriers.has(result) && inputs.some((id) => carriers.has(id))) {
                carriers.add(result);
                growing = true;
            }
        }
    }

    /*
        And showing one means being able to answer for it. Both drawing sites colour the
        number by item.getRarity(), which lived on three subclasses and not on Item - so
        UsableItem and OtherItem, the two classes the fish dishes are, had no getRarity
        at all and the first qualitied meal would have thrown a TypeError and taken the
        inventory display down with it. Asked of every template, not only the carriers,
        because the next thing given a quality should not have to rediscover this.
    */
    for (const id of Object.keys(item_templates)) {
        if (typeof item_templates[id].getRarity !== "function") {
            error(`crafting quality: "${id}" is a `
                + `${item_templates[id].constructor.name} and cannot answer getRarity, `
                + `so it would crash the inventory display the moment it carried a `
                + `quality. getRarity belongs on Item.`);
        }
    }

    let reached = 0;
    for (const { where, result, inputs } of item_recipes) {
        const from = inputs.filter((id) => carriers.has(id));
        if (from.length === 0 || !result) continue;
        reached++;

        if (!item_templates[result]?.use_quality) {
            error(`crafting quality: ${where} makes "${result}" out of ${from.join(", ")}, `
                + `which carry a quality, but "${result}" does not set use_quality - so `
                + `the quality it inherits would be saved and priced without ever being `
                + `shown. Set use_quality on it, or take the quality off the input.`);
        }
    }

    console.log(`[check] crafting quality: ${reached} recipe(s) can inherit a quality, `
        + `every result showing one`);
}

/**
 * A material a recipe names by id has to stay findable once it carries a quality.
 *
 * This is the regression v0.7.12 shipped and this check reproduces. find_recipe_material
 * had two branches, and the id one was a single lookup of
 * item_templates[material_id].getInventoryKey() - the TEMPLATE's key, which carries no
 * quality. Correct for as long as nothing named by id could have one; wrong the moment
 * Fish fillet could. A fillet butchered from a good catfish is stored under
 * {"id":"Fish fillet","quality":68}, the Fish steak recipe asked for it by id, and found
 * nothing: ten fillets in the bag and the recipe read unavailable.
 *
 * Asked of every id an item recipe names, with and without a quality, because the class is
 * "a recipe can find what it asks for" and not "the fillet works now".
 */
async function check_qualitied_materials_can_still_be_found() {
    const [{ recipes, find_recipe_material }, { item_templates, getItem }, { character }] =
        await load_browser_free(repo_root,
            ["src/crafting_recipes.js", "src/items.js", "src/character.js"]);

    const named = new Set();
    for (const category of Object.keys(recipes)) {
        for (const key of Object.keys(recipes[category].items ?? {})) {
            for (const material of recipes[category].items[key].materials ?? []) {
                if (material.material_id) { named.add(material.material_id); }
            }
        }
    }

    if (named.size === 0) {
        error("crafting quality: no item recipe names a material by id - "
            + "this check is out of date and has stopped guarding anything.");
        return;
    }

    let checked = 0;
    for (const id of named) {
        if (!item_templates[id]) {
            error(`crafting quality: a recipe names the material "${id}", which is not `
                + `an item - this check is out of date.`);
            continue;
        }

        //Once as it sits on the shelf, once as it comes out of a good catfish.
        for (const quality of [undefined, 68]) {
            let stored;
            try {
                stored = quality
                    ? getItem({...item_templates[id], quality})
                    : item_templates[id];
                character.inventory = {};
                character.inventory[stored.getInventoryKey()] = {item: stored, count: 7};
            } catch (problem) {
                error(`crafting quality: could not put "${id}" in an inventory to test `
                    + `with (${problem.message}) - this check is out of date.`);
                continue;
            }

            const found = find_recipe_material({
                material: {material_id: id, count: 1},
                ignore_stop: true,
                needed_count: 1,
            });

            if (found.count !== 7) {
                error(`crafting quality: 7 of "${id}"`
                    + `${quality ? ` at ${quality}% quality` : ""} in the inventory and a `
                    + `recipe that names it by id finds ${found.count}. A stack whose key `
                    + `carries a quality is not the template's key, so a recipe cannot be `
                    + `looked up by the template - that is how the Fish steak recipe went `
                    + `uncraftable the moment the fillet got a quality.`);
            }
            checked++;
        }
    }
    character.inventory = {};

    console.log(`[check] crafting quality: ${checked} material lookup(s) across `
        + `${named.size} id-named material(s), each found with and without a quality`);
}

/**
 * And the prediction has to be read from the same place the roll is.
 *
 * The recipe tooltip tells the player what a craft will come out at; use_recipe decides
 * what it actually comes out at. Those were separate arithmetic once - which is the whole
 * history of this file - so the weighting lives in get_consumed_quality and both ask it.
 * A prediction that can disagree with the result is worse than no prediction, so
 * re-inlining either copy has to fail here.
 */
function check_the_prediction_and_the_roll_share_one_source() {
    const definitions = [];
    const callers = [];

    for (const relative of ["src/crafting_recipes.js", "src/crafting.js",
                            "src/item_tooltips.js"]) {
        const source = strip_comments(
            fs.readFileSync(path.join(repo_root, relative), "utf8"));

        if (/function\s+get_consumed_quality\s*\(/.test(source)) {
            definitions.push(relative);
        }
        //Not preceded by `function`, so the definition does not count as a caller.
        if (/(?<!function\s)get_consumed_quality\s*\(\s*\{/.test(source)) {
            callers.push(relative);
        }
    }

    if (definitions.length !== 1) {
        error(`crafting quality: get_consumed_quality is defined in `
            + `${definitions.length} place(s) (${definitions.join(", ") || "none"}). One `
            + `definition is the point - two copies of the weighting is how the roll and `
            + `the prediction drifted apart before.`);
    }

    for (const needed of ["src/crafting.js", "src/item_tooltips.js"]) {
        if (!callers.includes(needed)) {
            error(`crafting quality: ${needed} does not call get_consumed_quality. The `
                + `roll and the tooltip's prediction of it both have to come from that `
                + `one function, or the tooltip can promise a quality the craft will not `
                + `produce.`);
        }
    }

    console.log(`[check] crafting quality: 1 weighting, `
        + `${callers.length} caller(s) sharing it`);
}

/**
 * A component tier that is not worth reaching.
 *
 * `roll_quality` reads `station_tier - component_tier`, so a component made above the
 * best station in the game rolls at a penalty: 15 quality points per tier for a
 * component, 10 for an assembled piece. The game's best forge is 3 and components go to
 * 5, so every tier-5 component is made at minus two - which is what P-12 asked about, and
 * the question it asked was whether the answer is a better forge.
 *
 * Measured, and the answer is no. The penalty costs quality and never the ORDERING: at
 * Forging and Crafting 20 the long-blade ladder runs 16, 32, 46, 68, 81 in attack, and at
 * 60 it runs 49, 98, 142, 207, 261. A tier-5 blade at its penalised quality beats a
 * tier-3 blade at its unpenalised one, because attack comes mostly from the component's
 * base stats and only secondarily from quality. And the penalty closes on its own: the
 * quality cap is 100 + 2 per skill level, so from Forging 50 the two ranges are identical.
 *
 * So no station above 3 is needed, and this check is what makes that answer keep being
 * true rather than being a note in a document. It is falsifiable, which was verified
 * rather than assumed: quadrupling the tier coefficient from 15 to 60 - a plausible
 * retune - takes the ladder at skills 20 to 16, 32, 46, 46, **24**, and the tier-5 blade
 * becomes worse than the tier-3 one. That is the day a better forge stops being optional,
 * and this is what says so.
 */
async function check_higher_tiers_are_still_worth_reaching() {
    const [{ recipes }, { item_templates, getItem }, { skills }, { locations }, main] =
        await load_browser_free(repo_root, [
            "src/crafting_recipes.js",
            "src/items.js",
            "src/data/skills.js",
            "src/data/locations.js",
            "src/main.js",
        ]);

    /*
        Every station tier in the game sits behind a flag - the village hearth, the
        mountain flue - so the ceiling is what a player who has built everything can
        reach. The flag names are read out of the source rather than listed here, so a
        third station cannot be added without this seeing it.
    */
    const location_source = strip_comments(
        fs.readFileSync(path.join(repo_root, "src/data/locations.js"), "utf8"));
    for (const match of location_source.matchAll(/global_flags\.(\w+)/g)) {
        main.global_flags[match[1]] = true;
    }

    let best_forging = 0;
    let best_assembly = 0;
    for (const key of Object.keys(locations)) {
        const station = locations[key].crafting;
        if (!station) continue;
        best_forging = Math.max(best_forging, station.tiers.forging ?? 0);
        best_assembly = Math.max(best_assembly, station.tiers.crafting ?? 0);
    }

    if (best_forging === 0 || best_assembly === 0) {
        error(`tier ladder: read a best forging tier of ${best_forging} and a best `
            + `assembly tier of ${best_assembly}; one of them is zero, so the station `
            + `tiers are not being read - this check is out of date.`);
        return;
    }

    const component_recipe = Object.values(recipes.forging?.components ?? {})[0];
    const equipment_recipe = Object.values(recipes.crafting?.equipment ?? {})[0];
    if (!component_recipe || !equipment_recipe) {
        error("tier ladder: no component recipe or no equipment recipe - "
            + "this check is out of date.");
        return;
    }

    //The two weapon-head families, because attack is the stat that can be compared.
    const families = {};
    for (const id of Object.keys(item_templates)) {
        const component = item_templates[id];
        if ((component.component_type === "long blade"
            || component.component_type === "short blade") && component.component_tier) {
            const family = families[component.component_type] ??= {};
            //One head per tier is enough; they share their tier's stats.
            family[component.component_tier] ??= id;
        }
    }

    const handles = {
        "long blade": "Simple wooden long handle",
        "short blade": "Simple wooden short handle",
    };

    let compared = 0;
    for (const [type, by_tier] of Object.entries(families)) {
        const handle = handles[type];
        if (!item_templates[handle]) {
            error(`tier ladder: "${handle}" is not an item, so the ${type} ladder cannot `
                + `be assembled - this check is out of date.`);
            continue;
        }
        const handle_tier = item_templates[handle].component_tier ?? 1;
        const tiers = Object.keys(by_tier).map(Number).sort((a, b) => a - b);
        if (tiers.length < 2) {
            error(`tier ladder: the ${type} family has ${tiers.length} tier(s) - `
                + `this check is out of date.`);
            continue;
        }

        /*
            Three points on the curve rather than all sixty: the penalty is worst at low
            skill, half gone by 40 and absorbed by the cap from 50, so 20 / 40 / 60 covers
            the shape. 20 is where an inversion shows up first.
        */
        for (const level of [20, 40, 60]) {
            for (const skill of ["Forging", "Crafting"]) {
                if (skills[skill]) { skills[skill].current_level = level; }
            }

            let previous = null;
            for (const tier of tiers) {
                const component_quality =
                    component_recipe.get_quality_range(best_forging - tier)[1];
                const assembled_quality = equipment_recipe.get_quality_range(
                    best_assembly - Math.max(tier, handle_tier), component_quality)[1];

                const weapon = getItem({
                    components: { head: by_tier[tier], handle },
                    quality: assembled_quality,
                    equip_slot: "weapon",
                    item_type: "EQUIPPABLE",
                });
                const attack = weapon.getAttack(assembled_quality);

                if (previous && attack <= previous.attack) {
                    error(`tier ladder: at Forging and Crafting ${level}, a `
                        + `"${by_tier[tier]}" (tier ${tier}) makes a weapon of ${attack} `
                        + `attack while a "${previous.head}" (tier ${previous.tier}) makes `
                        + `${previous.attack}. The higher tier is not worth reaching, `
                        + `which means the station penalty has grown past what the tier `
                        + `gains - the game needs a better station, or a gentler penalty.`);
                }
                previous = { tier, attack, head: by_tier[tier] };
                compared++;
            }
        }
    }

    console.log(`[check] tier ladder: ${compared} tier/skill points across `
        + `${Object.keys(families).length} families, best forge ${best_forging}, best `
        + `assembly ${best_assembly}, every tier still worth reaching`);
}

/**
 * Every craft that hands over its result records that it was made.
 *
 * The crafting pages mark a recipe the player has never actually made (P-39), and the mark
 * clears when `mark_recipe_crafted` is called. A branch that adds the result to the inventory
 * without that call leaves the recipe marked "never made" for ever - and nothing reports it,
 * because the craft works: the item arrives, the xp is granted, only the ring beside the name
 * never goes out.
 *
 * `use_recipe` has three of those branches - items, components, equipment - and they are far
 * enough apart in one long function that a fourth would very easily be written without it.
 */
function check_every_craft_records_that_it_happened() {
    const source = strip_comments(
        fs.readFileSync(path.join(repo_root, "src", "crafting.js"), "utf8"));

    const hands_over = [...source.matchAll(/add_to_character_inventory\s*\(/g)];
    const records = [...source.matchAll(/mark_recipe_crafted\s*\(/g)];

    if (hands_over.length === 0) {
        error("crafting.js hands the player nothing - check_every_craft_records_that_it_happened "
            + "is out of date.");
        return;
    }

    /*
        Each handover needs a record after it and before the next handover. Counting them and
        comparing the totals would pass on three records crammed against one branch.
    */
    let unrecorded = 0;
    for (let i = 0; i < hands_over.length; i++) {
        const from = hands_over[i].index;
        const to = i + 1 < hands_over.length ? hands_over[i + 1].index : source.length;
        if (!records.some(r => r.index > from && r.index < to)) {
            unrecorded++;
            const line = source.slice(0, from).split("\n").length;
            error(`crafting.js:${line} hands the player a crafted item and never calls `
                + `mark_recipe_crafted, so that recipe stays marked as one they have never `
                + `made however many they craft.`);
        }
    }

    console.log(`[check] crafted marks: ${hands_over.length} craft path(s) handing over a `
        + `result, ${hands_over.length - unrecorded} recording it`);
}

/**
 * Every recipe can say whether it can be made right now.
 *
 * The crafting pages carry a "only what I can make" box (P-39), and it works by asking each
 * recipe `get_availability`. A kind of recipe that cannot answer does not fail loudly - the
 * optional call returns undefined, the row is treated as unmakeable or as makeable depending
 * on how the caller reads it, and a whole page quietly filters wrongly.
 *
 * That was the state this found: `get_availability` was on `ItemRecipe` and inherited by
 * component recipes, and `EquipmentRecipe extends Recipe` had none - which is also why the
 * greying-out on two of the three pages sits commented out to this day. The proposal had
 * called the filter "a predicate that exists and a checkbox that reads it"; two thirds of it
 * existed.
 */
async function check_every_recipe_can_say_if_it_is_makeable() {
    const [recipes_module] = await load_browser_free(repo_root, ["src/crafting_recipes.js"]);

    let counted = 0;
    const mute = new Set();
    for (const [category, subs] of Object.entries(recipes_module.recipes)) {
        for (const [subcategory, list] of Object.entries(subs)) {
            for (const [id, recipe] of Object.entries(list)) {
                counted++;
                if (typeof recipe.get_availability !== "function") {
                    mute.add(`${category}/${subcategory} (${recipe.constructor?.name ?? "?"}), `
                        + `e.g. "${id}"`);
                }
            }
        }
    }

    if (counted === 0) {
        error("there are no recipes at all - check_every_recipe_can_say_if_it_is_makeable is "
            + "out of date.");
        return;
    }

    for (const where of mute) {
        error(`recipes in ${where} have no get_availability, so nothing can tell whether the `
            + `player can make one. The "only what I can make" filter shows that whole page `
            + `unfiltered and says nothing about it.`);
    }

    console.log(`[check] recipe availability: ${counted} recipe(s), `
        + `${mute.size === 0 ? "each able to say whether it can be made" : `${mute.size} kind(s) mute`}`);
}

export {
    check_a_better_input_makes_a_better_result,
    check_higher_tiers_are_still_worth_reaching,
    check_qualitied_materials_can_still_be_found,
    check_the_prediction_and_the_roll_share_one_source,
    check_inherited_quality_is_shown,
    check_crafting_passes_the_input_quality,
    check_every_craft_records_that_it_happened,
    check_every_recipe_can_say_if_it_is_makeable,
    check_quality_rolls_take_an_input_quality,
};
