"use strict";

import { global_flags } from "./main.js";

//For now, translations are only used for dialogues

const translations = {};
const default_language = "english";
const variant_prefix = "mofu#";

//Ids already reported as missing, so a text that is fetched every render tick is
//only complained about once instead of flooding the console.
const reported_missing = new Set();

class TranslationManager {
    constructor() {}

    load = async(language) => {
        if(!translations[language]) {
            const module = await import(`../locales/${language}.js`);
            translations[language] = module.default;
            console.log(`Language '${language}' loaded!`);
        }
    };

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

    getText = (language, text_id) => {
        const text = this.lookup(language, text_id);
        if(text !== undefined) {
            return text;
        }

        if(language !== default_language) {
            const fallback = this.lookup(default_language, text_id);
            if(fallback !== undefined) {
                if(!reported_missing.has(text_id)) {
                    reported_missing.add(text_id);
                    console.warn(`Text "${text_id}" is not translated into '${language}' yet; showing the ${default_language} text.`);
                }
                return fallback;
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
