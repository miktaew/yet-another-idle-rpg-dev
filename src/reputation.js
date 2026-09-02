// @ts-check
import { character } from "./character.js";

/*
    The guild's ranks (P-41, decided in Q-14).

    Nine of them, and a rank is **derived from Guild standing rather than saved**. That is the
    whole reason there is no new key here: the owner's rule is that taking work above your
    rank promotes you faster, and higher-rank work pays more standing - so standing already
    IS the promotion track, and a second currency beside it would be two numbers counting the
    same thing. A derived rank also cannot be renamed out from under a save, which is what the
    ladder question was about.

    The thresholds are set against what the game can already pay: 255 Guild standing is
    grantable from the existing content, which lands somebody who has done all of it at D.
    The arc carries you to the middle of the letters and the board is how you climb past it -
    which is also why the numbers keep going well past anything currently obtainable.

    SS and SSS are deliberately far out. They are meant to be rare.
*/
const guild_ranks = [
    {rank: "F", at_least: 0},
    {rank: "E", at_least: 100},
    {rank: "D", at_least: 250},
    {rank: "C", at_least: 500},
    {rank: "B", at_least: 900},
    {rank: "A", at_least: 1500},
    {rank: "S", at_least: 2500},
    {rank: "SS", at_least: 4000},
    {rank: "SSS", at_least: 6000},
];

/**
 * The guild rank a standing buys, and where the next one starts.
 *
 * @param {Number} standing Guild reputation
 * @returns {Object} {rank, index, at_least, next} - next is null at the top of the ladder
 */
function get_guild_rank(standing = 0) {
    let index = 0;
    for(let i = 0; i < guild_ranks.length; i++) {
        if(standing >= guild_ranks[i].at_least) {
            index = i;
        } else {
            break;
        }
    }
    return {
        rank: guild_ranks[index].rank,
        index,
        at_least: guild_ranks[index].at_least,
        next: guild_ranks[index + 1] ?? null,
    };
}

/**
 * The ranks whose work a player of this standing is offered: their own, one below, one above.
 *
 * The choice the board exists to offer - reaching up is faster and harder - so the range is
 * the mechanism rather than a presentation detail.
 */
function get_offered_guild_ranks(standing = 0) {
    const {index} = get_guild_rank(standing);
    return guild_ranks
        .slice(Math.max(0, index - 1), index + 2)
        .map(entry => entry.rank);
}


const ReputationManager = {

    add_reputation: ({reputation, region}) => {
        if(Number.isInteger(reputation)) {
            if(region in character.reputation) {
                /*
                    Floored at 0, and that floor went in with the first reward in the game
                    that subtracts (P-14 phase 6).

                    Without it a region can go negative and then disappear:
                    update_displayed_reputation draws only regions above 0, so a player at
                    -20 in the slums sees no row at all and has no way to know they are in
                    a hole or how deep. Every gate still reads shut, so the state is
                    invisible and consequential at the same time - which is the shape of
                    every bug this project has spent a version chasing.

                    Zero is "they do not know you", which is where everyone starts. It is
                    the right bottom for a number that means how a place feels about you.
                */
                character.reputation[region] = Math.max(0,
                    character.reputation[region] + reputation);
            } else {
                throw new Error(`Tried to add reputation to "${region}", which is not a valid reputation region!`);
            }
        } else {
            throw new Error(`Tried to add "${reputation}", which is not a valid integer!`);
        }
    },


    //for future: some unlocks for reaching certain values?
    //they could be handled via unmarked quests, but doing that here should be cleaner
}


export {ReputationManager, guild_ranks, get_guild_rank, get_offered_guild_ranks}