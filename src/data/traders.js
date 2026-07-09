"use strict";

import { TraderComponent } from "../components/trader_component.js";

const traders = {};

//create traders
(function(){
    traders["village trader"] = new TraderComponent({
        inventory_template: "Basic",
        is_unlocked: false,
        trade_text: "Trade on the village market",
        unlock_message: "You can now visit the village market",
        profit_margin: 4,
    });
    traders["suspicious trader"] = new TraderComponent({
        inventory_template: "Slums",
        is_unlocked: true,
        profit_margin: 6,
    });
    traders["swampland trader"] = new TraderComponent({
        inventory_template: "Swamp",
        is_unlocked: true,
        profit_margin: 7,
    });
    traders["nekomimi trader"] = new TraderComponent({
        inventory_template: "Cafe trader",
        is_unlocked: false,
        profit_margin: 20, //it's the kind of place where you pay for the company as much as for the food
    });
    traders["cat cafe trader"] = new TraderComponent({
        inventory_template: "Cafe trader",
        is_unlocked: false,
        profit_margin: 18, //it's the kind of place where you pay for the company as much as for the food, but slightly less
    });
})();


export { traders };