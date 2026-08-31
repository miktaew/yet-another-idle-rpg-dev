"use strict";

const config = {
    trade_price_recovery_flat: 5, //flat recovery of market saturation
    trade_price_recovery_ratio: 1/360, //% recover of market saturation
    //larger of two is used (sold count * ratio or flat value)
    market_saturation_trickle_rate: 0.2, //what % of saturation difference trickles to neighboring market regions every in-game day

    time_between_export_rewards: 1000*60*60*20, //1000 miliseconds -> 1s, x60 -> 1m, x60 -> 1h, x20 -> 20h

    enemy_crit_chance: 0.1,
    enemy_crit_damage: 2, //multiplier

    default_character_name: "Hero",

    tickrate: 1,
    //how many ticks per second
    //1 is the default value; going too high might make the game unstable

    time_speedup_when_sleeping: 6,

    global_xp_multiplier: 1, //this does not ignore the xp gain cap

    base_xp_cost: 10, //base xp for level up of a levelable character/npc

    skill_xp_gains_cap: 0.1, //limits xp per single gain, as a relation of xp needed to next level (0.1 = need to gain it at least 10 times)
    crafting_skill_xp_gains_cap: 0.25, //same but for crafting skills

    base_block_chance: 0.75, //+ another 0.2 from the skill

    do_hero_creation: true,

    //when changing either, make sure to remove text in hero creation panel that says they are purely cosmetic
    use_racial_bonuses: false, //check detailed bonuses in race.js; current values were not tested and might be terribly unbalanced
    use_height_bonuses: false, //based on relative height (short/average/tall), not on universal height


    equipment_crafting_quality_precision: 2,
    item_crafting_quality_precision: 4,

    enable_dev_mode: false,
};



export {config};