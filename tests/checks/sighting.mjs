/** The one-in-ten-thousand meeting, and whether it can happen at all. */

import * as fs from "node:fs";
import * as path from "node:path";
import { repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { load_browser_free } from "../lib/browser-free-src.mjs";
import { strip_comments } from "../lib/source.mjs";

/**
 * The sighting can land, and then it stops.
 *
 * This is the check the whole shape of `rolls_a_sighting` exists for. One in ten thousand per
 * in-game minute means nobody is ever going to notice it is broken: a roll wired so it can
 * **never** fire looks exactly like a roll nobody has been lucky enough to see yet, and there
 * is no bug report that ever comes in for that. Passing the randomness in makes both ends of
 * it answerable in a millisecond instead of seven in-game days.
 *
 * Five cases, and each one is a way this has of dying quietly: it never lands; it lands
 * somewhere it should not; it lands before the traces have been read, which is the arc's own
 * rule; it lands again after it has already happened, which makes a once-in-a-save moment
 * ordinary; and it lands on a roll it should have lost.
 */
async function check_the_sighting_can_land_and_then_stops() {
    const [marrowmoth] = await load_browser_free(repo_root, ["src/data/marrowmoth.js"]);
    const {rolls_a_sighting, sighting_places, sighting_chance} = marrowmoth;

    if (typeof rolls_a_sighting !== "function" || !Array.isArray(sighting_places)) {
        error("the sighting roll is not where this expects it - "
            + "check_the_sighting_can_land_and_then_stops is out of date.");
        return;
    }
    if (!sighting_places.length) {
        error("sighting_places is empty, so the meeting can never happen anywhere. "
            + "Q-13 decided it can be met.");
        return;
    }

    const somewhere_else = "Village";
    if (sighting_places.includes(somewhere_else)) {
        error(`this check uses "${somewhere_else}" as a place the sighting must NOT happen `
            + `in, and it is now one of the places it does. Pick another.`);
        return;
    }

    const ready = {
        location_name: sighting_places[0],
        has_read_the_shelters: true,
        has_seen_the_animal: false,
    };

    const cases = [
        {
            what: "land on a winning roll where it should",
            roll: {...ready, random: () => 0},
            expected: true,
            why: "the meeting can never happen, whatever the player does",
        },
        {
            what: "stay away from places that carry no trace",
            roll: {...ready, location_name: somewhere_else, random: () => 0},
            expected: false,
            why: `it can happen in "${somewhere_else}", which the arc has never pointed at`,
        },
        {
            what: "wait for the traces to have been read",
            roll: {...ready, has_read_the_shelters: false, random: () => 0},
            expected: false,
            why: "the player can meet it before being made unsure it exists",
        },
        {
            what: "happen only once",
            roll: {...ready, has_seen_the_animal: true, random: () => 0},
            expected: false,
            why: "it keeps rolling after it has happened, and can be told twice",
        },
        {
            what: "lose a losing roll",
            roll: {...ready, random: () => 1},
            expected: false,
            why: "the chance is not being compared against anything",
        },
    ];

    for (const {what, roll, expected, why} of cases) {
        if (rolls_a_sighting(roll) === expected) continue;
        error(`the sighting does not ${what}: ${why}.`);
    }

    /*
        And the odds themselves, as the loosest possible bound - not "is it 1/10000", which
        would be this check restating the constant back to itself, but "is it a probability
        that can be reached and is not a certainty". A chance of 0 passes every case above
        except the first, and a chance of 1 makes it happen the instant the traces are read.
    */
    if (!(sighting_chance > 0 && sighting_chance < 1)) {
        error(`sighting_chance is ${sighting_chance}, which is not a chance: at 0 the meeting `
            + `cannot happen and at 1 or more it happens immediately.`);
    }
}

/**
 * The sighting happens where the traces are, and the roll can actually recognise those places.
 *
 * Derived from the location data rather than from the module being checked, because the
 * interesting failure is a place name that no longer resolves. Two ways that happens, and
 * both are silent:
 *
 * - a place is renamed or removed, and the roll keeps comparing against a string nothing
 *   answers to;
 * - a place is added to the list by its **registry key**, when the roll compares against
 *   `current_location.name` - and the two are allowed to differ. `locations["Frogs"]` is
 *   called "Water's edge", so a sighting placed at "Frogs" would never once fire.
 *
 * The rule it holds the list to is the arc's own: the meeting happens where a trace is, and
 * a trace is a place whose own text is gated on one of the trace flags. That is read out of
 * `locations.js` here, so moving a trace moves what this check demands.
 */
async function check_the_sighting_places_are_the_traced_places() {
    const [marrowmoth] = await load_browser_free(repo_root, ["src/data/marrowmoth.js"]);
    const {sighting_places} = marrowmoth;
    if (!Array.isArray(sighting_places)) {
        error("sighting_places is not where this expects it - "
            + "check_the_sighting_places_are_the_traced_places is out of date.");
        return;
    }

    const source = strip_comments(
        fs.readFileSync(path.join(repo_root, "src", "data", "locations.js"), "utf8"));

    /*
        Which locations read a trace flag.

        Attributed by the nearest preceding ASSIGNMENT to a location, which has to include
        `locations["X"].actions = {` and not only `locations["X"] = new Location({`. The
        first attempt split on declarations alone, and the shelters action - declared in an
        actions block a couple of thousand lines below its own location - landed inside
        whichever location happened to be declared last. It reported that the animal ought
        to be findable in the Forest den traversal.

        A mention that is not an assignment starts nothing: `{location:
        locations["Forest road"]}` and `locations["X"].connected_locations.push(...)` are
        both one location being named from inside another one's body.
    */
    const trace_flags = ["has_read_the_shallows", "has_read_the_shelters"];
    const assignment = /locations\[\s*"([^"]+)"\s*\]\s*(?:\.\w+\s*)?=\s*(new\s+\w+\()?/g;
    const starts = [];
    for (const found of source.matchAll(assignment)) {
        starts.push({key: found[1], at: found.index, declares: Boolean(found[2])});
    }
    if (starts.length < 2) {
        error("no location assignments found in locations.js - "
            + "check_the_sighting_places_are_the_traced_places is out of date.");
        return;
    }

    const traced = new Set();
    //`name` is the identity the roll compares against, and only a declaration carries one.
    const name_of = new Map();
    for (let i = 0; i < starts.length; i++) {
        const body = source.slice(starts[i].at,
            i + 1 < starts.length ? starts[i + 1].at : source.length);
        if (trace_flags.some(flag => body.includes(flag))) {
            traced.add(starts[i].key);
        }
        if (!starts[i].declares) continue;
        const named = /\bname\s*:\s*"([^"]+)"/.exec(body);
        name_of.set(starts[i].key, named ? named[1] : null);
    }
    if (!traced.size) {
        error(`nothing in locations.js reads ${trace_flags.join(" or ")}, so the traces this `
            + `check derives the sighting places from are gone.`);
        return;
    }

    for (const place of sighting_places) {
        const key = [...name_of.keys()].find(k => name_of.get(k) === place);
        if (key === undefined) {
            const as_a_key = name_of.has(place)
                ? ` locations["${place}"] exists but is called "${name_of.get(place)}", and `
                    + `the roll compares against the name, not the key`
                : "";
            error(`the sighting can happen in "${place}", which no location answers to, so it `
                + `can never happen there.${as_a_key}`);
            continue;
        }
        if (!traced.has(key)) {
            error(`the sighting can happen in "${place}", which carries none of the arc's `
                + `traces (${trace_flags.join(", ")}). Q-13 put the meeting where the traces `
                + `are; a place nothing has pointed at is a place the animal has no reason `
                + `to be.`);
        }
    }

    for (const key of traced) {
        const name = name_of.get(key);
        if (name === null || sighting_places.includes(name)) continue;
        error(`locations["${key}"] carries one of the arc's traces and the sighting cannot `
            + `happen there. Either add "${name}" to sighting_places or say in the module `
            + `why that trace is not somewhere the animal goes.`);
    }

    console.log(`[check] the sighting: ${sighting_places.length} place(s), `
        + `${traced.size} carrying a trace`);
}

export { check_the_sighting_can_land_and_then_stops,
    check_the_sighting_places_are_the_traced_places };
