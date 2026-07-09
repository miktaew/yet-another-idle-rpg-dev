"use strict";

import Hero from "../models/hero.js";

const tool_slots = ["axe", "pickaxe", "sickle", "shovel", "fishing_pole"];

const hero_id = "main_character";

//6 things below: for weather; why here? because it's related to the hero, I guess
const time_until_wet = 10; //snowing accumulates it at a slower rate
const time_until_cold = 60;
const time_until_cold_when_wet = 20;

//temperatures for effects 'cold','very cold','freezing','hypothermia'
//not exactly realistic
const cold_status_temperatures = [14,8,2,-4];
const lowest_tolerable_temperature = cold_status_temperatures[0];
//array for matching the names of aforementioned effects
const cold_status_effects = ["Cold","Very cold","Freezing","Hypothermia"];

const character = new Hero({bio: {}, id: hero_id});

export {character,  
        time_until_wet, time_until_cold, time_until_cold_when_wet, 
        cold_status_temperatures, cold_status_effects,
        lowest_tolerable_temperature, tool_slots,
        hero_id
};
