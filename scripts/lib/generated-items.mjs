"use strict";

/**
 * Runs the component generator in isolation and returns the templates it builds.
 *
 * 203 equipment templates are created at RUNTIME from a material and a component
 * type, so their registry keys - which are save data - exist in no source literal.
 * Any check that needs to know whether an item id is real has to ask the
 * generator, not grep for it.
 *
 * The generator cannot simply be imported: it reaches src/items.js and
 * src/display.js, and display.js needs a document. So its two imports are stripped
 * and replaced with stubs holding just enough shape for the generator to fill, the
 * result is written to a temporary module, and that is imported. The code being
 * exercised is the shipped code; only its two dependencies are fake.
 *
 * Both `npm run check` and `scripts/check-save.js` use this, so the stubbing lives
 * in one place: two copies would drift, and a drifted copy of this reports a clean
 * result while checking nothing.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const item_import =
    'import { Armor, ArmorComponent, item_templates, ShieldComponent, WeaponComponent } from "./items.js";';
const display_import = 'import { capitalize_first_letter } from "./display.js";';

const shim = [
    "const item_templates = {};",
    "const capitalize_first_letter = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;",
    "class Stub { constructor(d) { Object.assign(this, d); } }",
    "class Armor extends Stub { }",
    "class ArmorComponent extends Stub { }",
    "class ShieldComponent extends Stub { }",
    "class WeaponComponent extends Stub { }",
    "",
].join("\n");

const tail = "\ncrafting_component_manager.fill_components();\nexport const generated = item_templates;\n";

/**
 * @param {String} repo_root absolute path to the repository root
 * @returns {Promise<{generated: Object|null, problem: String|null}>} the templates
 *          keyed by registry key, or a message explaining why they could not be built
 */
export async function load_generated_item_templates(repo_root) {
    const generator_path = path.join(repo_root, "src", "crafting_component_filling.js");
    if (!fs.existsSync(generator_path)) {
        return { generated: null, problem: "src/crafting_component_filling.js is missing" };
    }

    let source = fs.readFileSync(generator_path, "utf8").split("\r\n").join("\n");
    if (!source.includes(item_import) || !source.includes(display_import)) {
        return {
            generated: null,
            problem: "src/crafting_component_filling.js no longer has the imports this stubs out",
        };
    }
    source = source.replace(item_import, "").replace(display_import, "");

    const temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), "yairp-generated-"));
    const temp_file = path.join(temp_dir, "generator.mjs");
    fs.writeFileSync(temp_file, shim + source + tail);

    try {
        const { generated } = await import(pathToFileURL(temp_file).href);
        return { generated, problem: null };
    } catch (problem) {
        return {
            generated: null,
            problem: `the component generator could not be run in isolation: ${problem.message}`,
        };
    } finally {
        fs.rmSync(temp_dir, { recursive: true, force: true });
    }
}
