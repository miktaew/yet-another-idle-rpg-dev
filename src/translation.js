"use strict";

import { global_flags } from "./main.js";
import english from "../locales/english.js";
import turkish from "../locales/turkish.js";

//The locales are STATIC imports, not fetches.
//
//main.js renders player-facing text all the way through its startup sequence -
//the loading-screen version block, load(), the new-game setup - and only reaches
//`await translationManager.init(language)` at the very end of it. Nothing awaited
//can answer a lookup made before that point, so with fetched locales every one of
//those renders resolved to "text not found, id: ...". Importing the locales as
//data puts them in memory before main.js's first line runs, which is the only
//thing that fixes it without moving several hundred render calls.
//
//BOTH locales, not just the default: with english only, a Turkish save would
//render its loading screen, location panel, inventory and quest log in English,
//and nothing repaints them afterwards - translateUI only rewrites elements
//carrying [data-translation].
//
//Every locale in locales/ has to be listed here, and every language offered in
//main.js's `languages` too; scripts/check-site.js enforces both, because a locale
//that only arrives through load()'s dynamic import is a locale that does not
//exist for the first render.
const bundled_locales = {
    english,
    turkish,
};

const translations = {...bundled_locales};
const default_language = "english";
const variant_prefix = "mofu#";

//Ids already reported as missing, so a text that is fetched every render tick is
//only complained about once instead of flooding the console.
const reported_missing = new Set();

//Capitalising an assembled name has to know the locale: Turkish upper-cases a
//dotless i to I and a dotted i to İ, and getting that wrong is immediately
//visible in an item list.
const locale_tags = {
    english: "en",
    turkish: "tr",
};
const language_tag = (language) => locale_tags[language] ?? "en";

class TranslationManager {
    constructor() {}

    load = async(language) => {
        if(!translations[language]) {
            const module = await import(`../locales/${language}.js`);
            translations[language] = module.default;
            console.log(`Language '${language}' loaded!`);
        }
    };

    //Kept for a locale that is NOT in bundled_locales, and for the language
    //selector, which calls it on every change. For a bundled locale both load()
    //calls below short-circuit on the `if(!translations[language])` guard, so this
    //costs one microtask and does nothing - startup no longer depends on it.
    init = async(language) => {
        await this.load(language);

        //The default locale is the fallback for every id a translation has not
        //reached yet, so it has to be in memory even when it is not the active
        //one. Without this a partially translated language shows
        //"text not found" instead of the original text.
        if(language !== default_language) {
            await this.load(default_language);
        }
    };

    /**
     * Looks an id up in one language only, honouring the racial text variant.
     * @returns {String|undefined} undefined when the language has neither the
     *          variant nor the base text
     */
    lookup = (language, text_id) => {
        const texts = translations[language];
        if(!texts) {
            return undefined;
        }

        //With the variant enabled the variant wins, but a language that has only
        //the base text still answers with it - staying in the active language
        //matters more than getting the variant.
        if(global_flags.is_mofu_mofu_enabled) {
            return texts[variant_prefix + text_id] ?? texts[text_id];
        }
        return texts[text_id];
    };

    /**
     * Resolves a text id in the ACTIVE language only, with no fallback and no
     * placeholder.
     *
     * This is what display names use. A registry entry - a skill, a stance, an
     * NPC, an item - already carries its English name in code, and that name is
     * also part of its identity, so it can never be replaced. The translation is
     * therefore optional decoration on top: if the active language has an entry,
     * show it; if not, the caller shows the English it already holds. Returning
     * undefined rather than "text not found" is the whole point.
     *
     * @returns {String|undefined}
     */
    getOptionalText = (language, text_id) => {
        return this.lookup(language, text_id);
    };

    /**
     * The locale id for a display name. One flat namespace for every kind of
     * name - skills, stances, NPCs, items - keyed by the English string, so
     * there is one convention rather than one per registry.
     */
    getDisplayName = (language, english_name) => {
        if(!english_name) {
            return english_name;
        }
        return this.lookup(language, `name ${english_name}`) ?? english_name;
    };

    /**
     * Substitutes {slot} placeholders in a resolved text.
     *
     * A slot with no value is left written out rather than blanked, so a broken
     * pattern is visible on screen instead of quietly losing a word.
     */
    fill = (text, params) => {
        if(!params || typeof text !== "string") {
            return text;
        }
        return text.replace(/\{([a-z_][a-z0-9_]*)\}/g, (whole, slot) => params[slot] ?? whole);
    };

    /**
     * Resolves every value in a params object as a text id, so a caller passes
     * ids and never pre-translated strings. One convention: a param is an id.
     */
    resolveParams = (language, params) => {
        if(!params) {
            return undefined;
        }
        const resolved = {};
        for(const slot of Object.keys(params)) {
            resolved[slot] = this.getText(language, params[slot]);
        }
        return resolved;
    };

    /**
     * A name that has to be built from parts, because it is generated rather
     * than written out - "iron" plus "short blade".
     *
     * The parts go into the LANGUAGE'S OWN pattern, which is what lets a
     * language reorder them instead of being forced into English word order.
     * Turkish happens to share the order here, because a material name is an
     * attributive with no suffix, but the indirection is the point: a language
     * that needs the other order changes its pattern row and nothing else.
     *
     * capitalise applies to the assembled result, not to the parts, so the
     * pattern decides which word ends up first.
     */
    assembleName = (language, pattern_id, part_ids, {capitalise = false} = {}) => {
        const name = this.getText(language, pattern_id, this.resolveParams(language, part_ids));
        if(!capitalise || !name) {
            return name;
        }
        return name.charAt(0).toLocaleUpperCase(language_tag(language)) + name.slice(1);
    };

    getText = (language, text_id, params) => {
        const text = this.lookup(language, text_id);
        if(text !== undefined) {
            return this.fill(text, params);
        }

        if(language !== default_language) {
            const fallback = this.lookup(default_language, text_id);
            if(fallback !== undefined) {
                //Only a LOADED language can be missing a translation. If the
                //locale is not in memory yet - a language outside
                //bundled_locales, before init - this is an ordering problem, not
                //a translation gap, and saying otherwise both misleads and,
                //because reported_missing is never cleared, permanently silences
                //the real warning for this id once the locale does arrive.
                if(translations[language] && !reported_missing.has(text_id)) {
                    reported_missing.add(text_id);
                    console.warn(`Text "${text_id}" is not translated into '${language}' yet; showing the ${default_language} text.`);
                }
                return this.fill(fallback, params);
            }
        }

        if(!reported_missing.has(text_id)) {
            reported_missing.add(text_id);
            console.error(`Text "${text_id}" does not exist in any loaded language.`);
        }
        return "text not found, id: " + text_id;
    };

    translateUI = async(language) => {
        const translatables = document.querySelectorAll('[data-translation]');
        translatables.forEach(elem => {
            elem.innerText = this.getText(language, elem.dataset.translation);
        });

    };
}

const translationManager = new TranslationManager();

export { translationManager, translations, default_language };
