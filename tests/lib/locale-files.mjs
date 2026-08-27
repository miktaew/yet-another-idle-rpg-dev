/**
 * Reading a locale file, for the checks that compare rows against each other.
 */

import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { error } from "./report.mjs";
import { locales_dir, variant_prefix } from "./context.mjs";

async function load_locale(name) {
    const url = pathToFileURL(path.join(locales_dir, `${name}.js`)).href;
    const module = await import(url);
    if (!module.default || typeof module.default !== "object") {
        error(`locales/${name}.js must have a default export that is an object.`);
        return null;
    }
    return module.default;
}

function base_key(key) {
    return key.startsWith(variant_prefix) ? key.slice(variant_prefix.length) : key;
}

export {
    base_key,
    load_locale,
};
