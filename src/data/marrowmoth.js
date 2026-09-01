"use strict";

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

export { marrowmoth_seasons, is_marrowmoth_in_port };
