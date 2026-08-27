/**
 * Where the repository is and what it is called, for every check that reads it.
 */

import * as path from "node:path";
import { get_game_version } from "../../src/game_version.js";

//tests/lib -> the repository root is two levels up.
const repo_root = path.resolve(import.meta.dirname, "..", "..");
const site_dir = path.join(repo_root, "_site");
const locales_dir = path.join(repo_root, "locales");
const version = get_game_version();
const strict_locales = process.env.LOCALE_STRICT === "1";

// Must stay in sync with src/translation.js.
const default_language = "english";
const variant_prefix = "mofu#";

export {
    default_language,
    locales_dir,
    repo_root,
    site_dir,
    strict_locales,
    variant_prefix,
    version,
};
