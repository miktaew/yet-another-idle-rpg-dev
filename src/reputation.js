import { character } from "./character.js";

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


export {ReputationManager}