"use strict";
// @ts-check

/**
 * The small helpers every panel uses: writing into an element, comparing two display
 * names, casing a word, moving a class between siblings.
 *
 * Lifted out of display.js so that anything else lifted out of display.js can have them
 * without importing display.js back - which would be a two-module cycle, and one of those
 * has already cost a release. Six of the nine touch nothing but the DOM; the three that
 * case or sort text need to know the language, because Turkish capitalises i differently
 * and sorting is locale-dependent.
 */

import { language, language_tags } from "./main.js";
/**
 * general function for clearing HTML content of an element, for easier management if approach changes
 * @param {HTMLElement} element 
 */
function clear_HTML_content(element) {
    if(!element) {return;}
    element.replaceChildren();
}

/**
 * general function for inserting HTML content to an element, for easier management if approach changes
 * @param {HTMLElement} element 
 * @param {String} html_string
 */
function insert_HTML(element, html_string) {
    element.insertAdjacentHTML("beforeend", html_string);
}

/**
 * general function for setting HTML content of an element, for easier management if approach changes
 * @param {HTMLElement} element 
 * @param {String} html_string
 */
function set_HTML(element, html_string) {
    clear_HTML_content(element);
    element.insertAdjacentHTML("beforeend", html_string);
}

function capitalize_first_letter(some_string, is_translated = false) {
    const tag = is_translated ? language_tags[language] : undefined;
    return some_string.charAt(0).toLocaleUpperCase(tag) + some_string.slice(1);
}

/**
 * Orders two display names the way a reader of this interface would.
 *
 * `>` on strings compares UTF-16 code units, which puts every Turkish letter carrying
 * a diacritic after Z - so a bestiary sorted that way listed Çakal below Zebra.
 */
function compare_display_names(first, second) {
    return String(first).localeCompare(String(second), language_tags[language]);
}

/** Mirror of capitalize_first_letter; the same locale caveat applies. */
function uncapitalize_first_letter(some_string, is_translated = false) {
    const tag = is_translated ? language_tags[language] : undefined;
    return some_string.charAt(0).toLocaleLowerCase(tag) + some_string.slice(1);
}

/**
 * Toggles a specificed class for target 'element', removing it from any other element that might have had it.
 * If 'siblings_only' is true, class will be removed only from siblings
 * @param {Object} params
 * @param {HTMLElement} params.element
 * @param {Boolean} [params.siblings_only]
 * @param {String} params.class_name
 */
function toggle_exclusive_class({element, siblings_only=false, class_name}) {
    const elems = siblings_only?element.parentNode.querySelectorAll(`.${class_name}`):document.getElementsByClassName(class_name);
    const has_class = element.classList.contains(class_name);
    for(let i = 0; i < elems.length; i++) {
        elems[i].classList.remove(class_name);
    }

    if(!has_class) {
        element.classList.add(class_name);
    }
}

function remove_class_from_all(class_name) {
    const elems = document.getElementsByClassName(class_name);
    while(elems.length > 0) {
        elems.item(0).classList.remove(class_name);
    }
}

function is_element_above_x(element, x) {
    const rect = element.getBoundingClientRect();
    const rect2 = x.getBoundingClientRect();

    return rect.bottom <= rect2.top;
}


/*
    Turkish has two i's and five other letters an English keyboard does not, and a search
    box is the one place a player should not have to care. Both the name and the query are
    folded to the same plain letters before comparing, so "cekic" finds Çekiç, "isik"
    finds Işık, and "iron" finds Iron - which locale-aware lowercasing alone does NOT do:
    under Turkish rules "Iron" lowercases to "ıron" while "iron" stays "iron", and the two
    stop matching.
*/
/**
 * Each entry is a pattern and its plain replacement.
 *
 * Annotated because the inferred type of a literal array of pairs is
 * `(RegExp | String)[][]`, which makes both halves of the destructuring either kind and
 * so matches no overload of `String.replace`. The pairing is the whole point of the table.
 *
 * @type {Array<[RegExp, String]>}
 */
const SEARCH_FOLDING = [
    [/[İIıi]/g, "i"],
    [/[çÇ]/g, "c"],
    [/[ğĞ]/g, "g"],
    [/[öÖ]/g, "o"],
    [/[şŞ]/g, "s"],
    [/[üÜ]/g, "u"],
];

function fold_for_search(text) {
    let folded = String(text ?? "");
    for(const [pattern, plain] of SEARCH_FOLDING) {
        folded = folded.replace(pattern, plain);
    }
    //After the folding, so the two i's are already one letter and cannot diverge again.
    return folded.toLocaleLowerCase("en");
}

/**
 * Whether a display name matches what somebody typed into a search box.
 *
 * An empty query matches everything, which is what makes an empty box mean "no filter".
 */
function matches_search(display_name, query) {
    if(!query) {
        return true;
    }
    return fold_for_search(display_name).includes(fold_for_search(query));
}

/**
 * Where a tooltip's top edge goes, given where the cursor is.
 *
 * Below the cursor by default, because that is where a pointer expects it. When there
 * is not room below, **above the cursor** rather than pinned to the bottom edge: pinning
 * keeps a tooltip on screen but slides it up over the row the player is pointing at, so
 * the thing they are reading about is behind the thing they are reading. Flipping keeps
 * both visible, which is the whole point of the tooltip.
 *
 * Only when it fits in neither direction does it clamp, and it clamps to whichever edge
 * leaves more of it visible. A tooltip taller than the window is a content problem rather
 * than a placement one, and this is not the place to pretend otherwise.
 *
 * Pure, and separate from the DOM on purpose: the tooltip movers live in an inline script
 * in index.html, which no test can reach. The arithmetic is the part that was wrong and
 * the part worth checking, so it lives here where `npm test` can ask it questions.
 *
 * Everything is in viewport pixels. The caller scales.
 *
 * @param {Number} cursor viewport y of the pointer
 * @param {Number} height the tooltip's height
 * @param {Number} viewport the usable height, scrollbar already subtracted
 * @param {Number} shift the gap between pointer and tooltip
 * @returns {Number} viewport y for the tooltip's top edge
 */
function place_tooltip_vertically(cursor, height, viewport, shift = 0) {
    const below = cursor + shift;
    if(below + height <= viewport) {
        return below;
    }

    const above = cursor - shift - height;
    if(above >= 0) {
        return above;
    }


    //Fits neither way. Show as much of it as there is room for, from the top, because a
    //tooltip read from its first line is worth more than one read from its last.
    return Math.max(0, Math.min(below, viewport - height));
}

export {
    set_HTML,
    insert_HTML,
    clear_HTML_content,
    compare_display_names,
    capitalize_first_letter,
    uncapitalize_first_letter,
    toggle_exclusive_class,
    remove_class_from_all,
    is_element_above_x,
    matches_search,
    place_tooltip_vertically,
};
