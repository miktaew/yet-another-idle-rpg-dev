"use strict";
// @ts-check

/**
 * When the Marrowmoth is in port, and nothing else.
 *
 * The tallyman's book says she goes out on the ebb and is back twice a year. Twice a
 * year is two seasons (P-14, Q-10), and which two is not a coin toss: a hull that can
 * only come in and leave on the ebb needs the year's biggest tidal ranges, and those
 * fall around the equinoxes. Spring and Autumn - the same two the ebb approach in a
 * later phase has to be timed against, so the choice pays for itself twice.
 *
 * This module imports nothing on purpose. The shelf in the salt house, the noise on
 * the quay and the clerk's rumour all have to agree about the window, and they live in
 * three modules that already sit in a graph that is circular by design; a constant read
 * from a leaf adds no edge at all, which is the same reason registries.js exists. Three
 * inline copies of ["Spring", "Autumn"] would be three chances to drift apart, and the
 * one that drifted would fail silently - a season gate that never opens looks exactly
 * like content nobody has reached yet.
 *
 * It is not a world-event framework and must not become one (Q-10). It is one hull's
 * timetable. A second event wanting the same wiring is when an abstraction would have
 * earned itself, and not before.
 */
const marrowmoth_seasons = ["Spring", "Autumn"];

/**
 * Whether she is alongside.
 *
 * Takes the season rather than reading the clock, so this module keeps its no-imports
 * promise and every caller reads game_time exactly once at the point it already does.
 *
 * @param {String} season what current_game_time.getSeason() returned
 * @returns {Boolean}
 */
function is_marrowmoth_in_port(season) {
    return marrowmoth_seasons.includes(season);
}

/**
 * Where the thing the traces belong to can actually be met (P-14 phase 7, Q-13).
 *
 * The two places that carry a trace, and nowhere else: the print is in the Forest lake's
 * shallows, the lying-up place is in the Waterfall basin's rock shelters. "Certain places
 * only" is what the owner decided, and the arc has already chosen which - inventing a third
 * would put the animal somewhere nothing has ever suggested it goes.
 */
const sighting_places = ["Forest lake", "Waterfall basin"];

/**
 * One in ten thousand, per in-game minute spent in one of those places.
 *
 * The owner's figure, and the unit is the part that had to be measured rather than picked.
 * `update()` ticks once per in-game minute and there is no other cadence in this loop that
 * a rare world event could hang on: an action tick is a tenth of an action-second, which
 * would make this land every few minutes, and arriving in a location happens a few hundred
 * times in a long save, which would make it land never. Per minute in place, this is about
 * seven in-game days of standing at the water - long enough that almost nobody sees it,
 * short enough that it is genuinely out there. Which is the whole of Q-13.
 */
const sighting_chance = 1 / 10000;

/**
 * Whether the sighting is even in play right now.
 *
 * Gated on having read the shelters, which requires having read the shallows - so one test
 * covers both traces, the same shortcut the lake's own description takes. That gate is the
 * arc's rule rather than a convenience: the player has to have been made unsure the thing
 * exists before they are allowed to find out, and until they have read a trace they have no
 * reason to be looking at anything.
 *
 * And it is over once it has happened. A once-in-a-save moment that can happen twice is a
 * moment the second telling makes ordinary.
 *
 * @param {{location_name: String, has_read_the_shelters: Boolean, has_seen_the_animal: Boolean}} where
 * @returns {Boolean}
 */
function can_be_sighted({location_name, has_read_the_shelters, has_seen_the_animal}) {
    return has_read_the_shelters
        && !has_seen_the_animal
        && sighting_places.includes(location_name);
}

/**
 * The roll itself, with the randomness passed in.
 *
 * Injected rather than reached for, so the check can drive both ends of it - a roll that
 * always lands and a roll that never does - without a browser and without waiting seven
 * in-game days. A one-in-ten-thousand event that is wired so it can never fire looks
 * exactly like an event nobody has been lucky enough to see yet, and that is the failure
 * this shape exists to make impossible.
 *
 * @param {{location_name: String, has_read_the_shelters: Boolean, has_seen_the_animal: Boolean, random?: function(): Number}} roll
 * @returns {Boolean}
 */
function rolls_a_sighting({location_name, has_read_the_shelters, has_seen_the_animal,
        random = Math.random}) {
    if(!can_be_sighted({location_name, has_read_the_shelters, has_seen_the_animal})) {
        return false;
    }
    return random() < sighting_chance;
}

export { marrowmoth_seasons, is_marrowmoth_in_port, sighting_places, sighting_chance,
    can_be_sighted, rolls_a_sighting };
