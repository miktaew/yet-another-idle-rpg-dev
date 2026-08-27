"use strict";

const config = {
    trade_price_recovery_flat: 5, //flat recovery of market saturation
    trade_price_recovery_ratio: 1/360, //% recover of market saturation
    //larger of two is used (sold count * ratio or flat value)
    market_saturation_trickle_rate: 0.2, //what % of saturation difference trickles to neighboring market regions every in-game day

    time_between_export_rewards: 1000*60*60*20, //1000 miliseconds -> 1s, x60 -> 1m, x60 -> 1h, x20 -> 20h

    enemy_crit_chance: 0.1,
    enemy_crit_damage: 2, //multiplier

    tickrate: 1,
    //how many ticks per second
    //1 is the default value; going too high might make the game unstable

    global_xp_multiplier: 1,

    do_hero_creation: true,

    //Whether the hitscounter.dev badge is added to the bottom panel. Off means
    //the request is never made, which is the point - hiding the image with CSS
    //would still hand the tracker a page view.
    show_visitor_counter: false,

    //Deployment identity, matched against location.host + location.pathname.
    //Kept here rather than hardcoded in main.js so a fork or a mirror only has
    //to edit this block.
    //
    //WARNING: is_on_dev() decides which localStorage key holds the save
    //("save data" vs "dev save data", see main.js). Do NOT point `dev` at a
    //live deployment - existing players would silently be handed an empty
    //save slot. Trailing slashes are ignored; protocol and query are not part
    //of the comparison.
    release_ids: {
        main: "kuroiteiken.github.io/yairp",
        dev: "kuroiteiken.github.io/yairp-dev",
    },

    //when changing either, make sure to remove text in hero creation panel that says they are purely cosmetic
    use_racial_bonuses: false, //check detailed bonuses in race.js; current values were not tested and might be terribly unbalanced
    use_height_bonuses: false, //based on relative height (short/average/tall), not on universal height

    /*
        The grids crafted quality is rounded to. A roll is clamped to the cap and then
        rounded, so the cap has to be rounded the same way before it is shown -
        otherwise the number printed is one the player cannot actually reach.
    */
    equipment_crafting_quality_precision: 2,
    item_crafting_quality_precision: 4,
};



export {config};