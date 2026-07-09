"use strict";

import { TradeItem, TradeItemGroup } from "../models/trade_item.js";


const item_conditions = { //key: conditions, for easier assignment
    gang_cleared: {
        location_clears: {
            "Gang hideout": {
                at_least: 1,
            }
        }
    },
    gang_not_cleared: {
        location_clears: {
            "Gang hideout": {
                at_most: 0,
            }
        }
    },
    swamp_quest_not_done: {
        quests_not_finished: ["In Times of Need"],
    },
    swamp_quest_done: {
        quests_finished: ["In Times of Need"],
    }
}

const inventory_templates = {};

inventory_templates["Basic"] = 
[
    new TradeItemGroup({
        items: [
            new TradeItem({item_name: "Cheap iron spear", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron dagger", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron sword", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron axe", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron battle hammer", count: [1], quality: [40, 90], chance: 0.8}),

            new TradeItem({item_name: "Cheap iron spear", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron dagger", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron sword", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron axe", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron battle hammer", count: [1], quality: [91, 120], chance: 0.4}),

            new TradeItem({item_name: "Iron spear", count: [1], quality: [70, 90], chance: 0.4}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [70, 90], chance: 0.4}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [70, 90], chance: 0.4}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [70, 90], chance: 0.4}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [70, 90], chance: 0.4}),

            new TradeItem({item_name: "Wooden training shield", count: [1], quality: [100,100]}),
            new TradeItem({item_name: "Cheap wooden shield", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap wooden shield", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Crude wooden shield", count: [1], chance: 0.7, quality: [40, 90]}),
            new TradeItem({item_name: "Crude wooden shield", count: [1], chance: 0.4, quality: [91, 120]}),

            new TradeItem({item_name: "Cheap leather vest", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather vest", count: [1], chance: 0.5, quality: [91, 120]}),
            new TradeItem({item_name: "Cheap leather pants", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather pants", count: [1], chance: 0.5, quality: [91, 120]}),
            new TradeItem({item_name: "Cheap leather hat", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather hat", count: [1], chance: 0.5, quality: [91, 120]}),
            new TradeItem({item_name: "Cheap leather shoes", count: [1], chance: 0.5, quality: [91, 120]}),

            new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.4, quality: [91, 120]}),
            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.7, quality: [70, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.7, quality: [70, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.7, quality: [70, 120]}),
            new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.7, quality: [70, 120]}),
            new TradeItem({item_name: "Work shoes", count: [1,2], chance: 0.6, quality: [100, 100]}),

            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.3, quality: [60, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.3, quality: [60, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.3, quality: [60, 120]}),

            new TradeItem({item_name: "Rat pelt cape", count: [1,3], chance: 1, quality: [70, 120]}),

            new TradeItem({item_name: "Stale bread", count: [7,14]}),
            new TradeItem({item_name: "Bread kwas", count: [3,5], chance: 0.6}),
            new TradeItem({item_name: "Fresh bread", count: [4,7]}),
            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),
            new TradeItem({item_name: "Cooking herbs", count: [2,4], chance: 0.5}),

            new TradeItem({item_name: "Coal", count: [5,20]}),

            new TradeItem({item_name: "ABC for kids", count: [1], chance: 1}),
            new TradeItem({item_name: "Old combat manual", count: [1], chance: 0.5}),
            new TradeItem({item_name: "Butchering and you", count: [1], chance: 0.2}),
            new TradeItem({item_name: "Medicine for dummies", count: [1], chance: 0.2}),
            new TradeItem({item_name: "Ode to Whimsy, and other poems", count: [1], chance: 0.2}),
            new TradeItem({item_name: "A Glint On The Sand", count: [1], chance: 0.2}),
            
            new TradeItem({item_name: "Glass phial", count: [5,10], chance: 1}),
            new TradeItem({item_name: "Glass bottle", count: [4,8], chance: 1}),

            new TradeItem({item_name: "Camping supplies", count: [1,3], chance: 1}),
            new TradeItem({item_name: "Coil of rope", count: [1,3], chance: 1}),


            new TradeItem({item_name: "Old pickaxe", count: [1], chance: 1}),
            new TradeItem({item_name: "Old axe", count: [1], chance: 1}),
            new TradeItem({item_name: "Old sickle", count: [1], chance: 1}),
            new TradeItem({item_name: "Old shovel", count: [1], chance: 1}),
        ]
    })
];

inventory_templates["Basic plus"] = 
[
    new TradeItemGroup({
        items: [
            new TradeItem({item_name: "Iron spear", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [40, 80], chance: 0.8}),

            new TradeItem({item_name: "Iron spear", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [81, 120], chance: 0.8}),

            new TradeItem({item_name: "Steel spear", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [70, 100], chance: 0.5}),
            
            new TradeItem({item_name: "Steel spear", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [81, 120], chance: 0.4}),

            new TradeItem({item_name: "Wooden shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Wooden shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.6, quality: [40, 80]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.4, quality: [81, 120]}),
            new TradeItem({item_name: "Steel shield", count: [1], chance: 0.3, quality: [81, 100]}),
            new TradeItem({item_name: "Ash wood shield", count: [1], chance: 0.3, quality: [81, 100]}),

            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Work shoes", count: [2,3], chance: 0.6, quality: [100, 100]}),

            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.8, quality: [91, 120]}),

            new TradeItem({item_name: "Rat pelt cape", count: [1,2], chance: 0.6, quality: [70, 120]}),
            new TradeItem({item_name: "Wolf pelt cape", count: [1], chance: 0.9, quality: [70, 120]}),
            
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.6, quality: [81, 120]}),
            
            new TradeItem({item_name: "Stale bread", count: [4,10]}),
            new TradeItem({item_name: "Fresh bread", count: [2,5]}),
            new TradeItem({item_name: "Bread kwas", count: [1,3]}),
            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),
            new TradeItem({item_name: "Oneberry juice", count: [2,5]}),
            new TradeItem({item_name: "Cooking herbs", count: [1,4], chance: 0.6}),

            new TradeItem({item_name: "Coal", count: [20,50]}),

            new TradeItem({item_name: "Twist liek a snek", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Butchering and you", count: [1], chance: 0.6}),
            new TradeItem({item_name: "Medicine for dummies", count: [1], chance: 0.6}),
            new TradeItem({item_name: "Ode to Whimsy, and other poems", count: [1], chance: 0.4}),
            new TradeItem({item_name: "A Glint On The Sand", count: [1], chance: 0.4}),
            new TradeItem({item_name: "Counting Mice", count: [1], chance: 0.9}),

            new TradeItem({item_name: "Glass phial", count: [5,10], chance: 1}),
            new TradeItem({item_name: "Glass bottle", count: [4,8], chance: 1}),

            new TradeItem({item_name: "Camping supplies", count: [1], chance: 1}),
            new TradeItem({item_name: "Coil of rope", count: [1], chance: 1}),

            new TradeItem({item_name: "Iron sickle", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron pickaxe", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron chopping axe", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron shovel", count: [1], chance: 0.8}),
        ]
    }),
];

inventory_templates["Intermediate"] = 
[
    new TradeItemGroup({
        items: [
            new TradeItem({item_name: "Iron spear", count: [1], quality: [100, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [100, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [100, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [100, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [100, 120], chance: 0.8}),

            new TradeItem({item_name: "Steel spear", count: [1], quality: [80, 100], chance: 0.8}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [80, 100], chance: 0.8}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [80, 100], chance: 0.8}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [80, 100], chance: 0.8}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [80, 100], chance: 0.8}),

            new TradeItem({item_name: "Steel spear", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [81, 120], chance: 0.8}),

            new TradeItem({item_name: "Wooden shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Wooden shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.6, quality: [40, 80]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.4, quality: [81, 120]}),
            new TradeItem({item_name: "Steel shield", count: [1], chance: 0.4, quality: [81, 120]}),
            new TradeItem({item_name: "Ash wood shield", count: [1], chance: 0.4, quality: [81, 120]}),

            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Work shoes", count: [2,3], chance: 0.6, quality: [100, 100]}),

            new TradeItem({item_name: "Goat leather vest", count: [1], chance: 0.5, quality: [81, 120]}),
            new TradeItem({item_name: "Goat leather pants", count: [1], chance: 0.5, quality: [81, 120]}),
            new TradeItem({item_name: "Goat leather hat", count: [1], chance: 0.5, quality: [81, 120]}),
            new TradeItem({item_name: "Goat leather shoes", count: [1], chance: 0.5, quality: [81, 120]}),
            new TradeItem({item_name: "Goat leather gloves", count: [1], chance: 0.5, quality: [81, 120]}),

            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.8, quality: [91, 120]}),
            
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.8, quality: [81, 120]}),

            new TradeItem({item_name: "Steel chainmail armor", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Steel chainmail pants", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Steel chainmail helmet", count: [1], chance: 0.6, quality: [81, 120]}),

            new TradeItem({item_name: "Wolf pelt cape", count: [1], chance: 0.9, quality: [70, 120]}),
            new TradeItem({item_name: "Boar hide cape", count: [1], chance: 0.9, quality: [70, 120]}),
            new TradeItem({item_name: "Goat hide cape", count: [1], chance: 0.9, quality: [70, 120]}),
            new TradeItem({item_name: "Bear hide cape", count: [1], chance: 0.5, quality: [70, 120]}),
            
            
            new TradeItem({item_name: "Fresh bread", count: [4,10]}),
            new TradeItem({item_name: "Bread kwas", count: [2,5]}),
            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),
            new TradeItem({item_name: "Oneberry juice", count: [2,5]}),
            new TradeItem({item_name: "Healing powder", count: [2,5]}),
            new TradeItem({item_name: "Healing potion", count: [2,5]}),
            new TradeItem({item_name: "Cooking herbs", count: [2,5], chance: 0.8}),

            new TradeItem({item_name: "Coal", count: [20,50]}),

            new TradeItem({item_name: "Twist liek a snek", count: [1], chance: 1}),
            new TradeItem({item_name: "Butchering and you", count: [1], chance: 1}),
            new TradeItem({item_name: "Medicine for dummies", count: [1], chance: 1}),
            new TradeItem({item_name: "Ode to Whimsy, and other poems", count: [1], chance: 0.4}),
            new TradeItem({item_name: "A Glint On The Sand", count: [1], chance: 0.4}),
            new TradeItem({item_name: "Wood for Witches", count: [1], chance: 0.2}),
            new TradeItem({item_name: "Counting Mice", count: [1], chance: 0.9}),

            new TradeItem({item_name: "Glass phial", count: [10,16], chance: 1}),
            new TradeItem({item_name: "Glass bottle", count: [6,12], chance: 1}),

            new TradeItem({item_name: "Camping supplies", count: [1], chance: 1}),
            new TradeItem({item_name: "Coil of rope", count: [1], chance: 1}),

            new TradeItem({item_name: "Iron sickle", count: [1], chance: 1}),
            new TradeItem({item_name: "Iron pickaxe", count: [1], chance: 1}),
            new TradeItem({item_name: "Iron chopping axe", count: [1], chance: 1}),
            new TradeItem({item_name: "Iron shovel", count: [1], chance: 1}),
        ]
    })
];

inventory_templates["Slums"] = [
    new TradeItemGroup({
        start_conditions: item_conditions.gang_not_cleared,
        items: [
            new TradeItem({item_name: "Iron spear", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [70, 90], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [40, 80], chance: 0.8}),

            new TradeItem({item_name: "Iron spear", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [81, 120], chance: 0.8}),

            new TradeItem({item_name: "Steel spear", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [70, 100], chance: 0.5}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [70, 100], chance: 0.5}),
            
            new TradeItem({item_name: "Steel spear", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [81, 120], chance: 0.4}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [81, 120], chance: 0.4}),

            new TradeItem({item_name: "Wooden shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Wooden shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.6, quality: [40, 80]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.4, quality: [81, 120]}),
            new TradeItem({item_name: "Steel shield", count: [1], chance: 0.3, quality: [81, 100]}),
            new TradeItem({item_name: "Ash wood shield", count: [1], chance: 0.3, quality: [81, 100]}),

            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Work shoes", count: [2,3], chance: 0.6, quality: [100, 100]}),

            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.8, quality: [91, 120]}),

            new TradeItem({item_name: "Rat pelt cape", count: [1,2], chance: 0.6, quality: [70, 120]}),
            new TradeItem({item_name: "Wolf pelt cape", count: [1], chance: 0.9, quality: [70, 120]}),
            
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.6, quality: [81, 120]}),
            
            new TradeItem({item_name: "Stale bread", count: [4,10]}),
            new TradeItem({item_name: "Fresh bread", count: [2,5]}),
            new TradeItem({item_name: "Bread kwas", count: [1,3]}),
            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),
            new TradeItem({item_name: "Oneberry juice", count: [2,5]}),
            new TradeItem({item_name: "Cooking herbs", count: [1,4], chance: 0.6}),

            new TradeItem({item_name: "Coal", count: [20,50]}),

            new TradeItem({item_name: "Twist liek a snek", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Butchering and you", count: [1], chance: 0.6}),
            new TradeItem({item_name: "Medicine for dummies", count: [1], chance: 0.6}),
            new TradeItem({item_name: "Ode to Whimsy, and other poems", count: [1], chance: 0.4}),
            new TradeItem({item_name: "A Glint On The Sand", count: [1], chance: 0.4}),
            new TradeItem({item_name: "Counting Mice", count: [1], chance: 0.9}),

            new TradeItem({item_name: "Glass phial", count: [5,10], chance: 1}),
            new TradeItem({item_name: "Glass bottle", count: [4,8], chance: 1}),

            new TradeItem({item_name: "Camping supplies", count: [1], chance: 1}),
            new TradeItem({item_name: "Coil of rope", count: [1], chance: 1}),

            new TradeItem({item_name: "Iron sickle", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron pickaxe", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron chopping axe", count: [1], chance: 0.8}),
            new TradeItem({item_name: "Iron shovel", count: [1], chance: 0.8}),
        ]
    }),
    new TradeItemGroup({
        start_conditions: item_conditions.gang_cleared,
        items: [
            new TradeItem({item_name: "Iron spear", count: [1], quality: [100, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [100, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [100, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [100, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [100, 120], chance: 0.8}),

            new TradeItem({item_name: "Steel spear", count: [1], quality: [80, 100], chance: 0.8}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [80, 100], chance: 0.8}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [80, 100], chance: 0.8}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [80, 100], chance: 0.8}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [80, 100], chance: 0.8}),

            new TradeItem({item_name: "Steel spear", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Steel dagger", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Steel sword", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Steel axe", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Steel battle hammer", count: [1], quality: [81, 120], chance: 0.8}),

            new TradeItem({item_name: "Wooden shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Wooden shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Cheap iron shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.6, quality: [40, 80]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.4, quality: [81, 120]}),
            new TradeItem({item_name: "Steel shield", count: [1], chance: 0.4, quality: [81, 120]}),
            new TradeItem({item_name: "Ash wood shield", count: [1], chance: 0.4, quality: [81, 120]}),

            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Work shoes", count: [2,3], chance: 0.6, quality: [100, 100]}),

            new TradeItem({item_name: "Goat leather vest", count: [1], chance: 0.5, quality: [81, 120]}),
            new TradeItem({item_name: "Goat leather pants", count: [1], chance: 0.5, quality: [81, 120]}),
            new TradeItem({item_name: "Goat leather hat", count: [1], chance: 0.5, quality: [81, 120]}),
            new TradeItem({item_name: "Goat leather shoes", count: [1], chance: 0.5, quality: [81, 120]}),
            new TradeItem({item_name: "Goat leather gloves", count: [1], chance: 0.5, quality: [81, 120]}),

            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.8, quality: [91, 120]}),
            
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.8, quality: [81, 120]}),

            new TradeItem({item_name: "Steel chainmail armor", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Steel chainmail pants", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Steel chainmail helmet", count: [1], chance: 0.6, quality: [81, 120]}),

            new TradeItem({item_name: "Wolf pelt cape", count: [1], chance: 0.9, quality: [70, 120]}),
            new TradeItem({item_name: "Boar hide cape", count: [1], chance: 0.9, quality: [70, 120]}),
            new TradeItem({item_name: "Goat hide cape", count: [1], chance: 0.9, quality: [70, 120]}),
            new TradeItem({item_name: "Bear hide cape", count: [1], chance: 0.5, quality: [70, 120]}),
            
            
            new TradeItem({item_name: "Fresh bread", count: [4,10]}),
            new TradeItem({item_name: "Bread kwas", count: [2,5]}),
            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),
            new TradeItem({item_name: "Oneberry juice", count: [2,5]}),
            new TradeItem({item_name: "Healing powder", count: [2,5]}),
            new TradeItem({item_name: "Healing potion", count: [2,5]}),
            new TradeItem({item_name: "Cooking herbs", count: [2,5], chance: 0.8}),

            new TradeItem({item_name: "Coal", count: [20,50]}),

            new TradeItem({item_name: "Twist liek a snek", count: [1], chance: 1}),
            new TradeItem({item_name: "Butchering and you", count: [1], chance: 1}),
            new TradeItem({item_name: "Medicine for dummies", count: [1], chance: 1}),
            new TradeItem({item_name: "Ode to Whimsy, and other poems", count: [1], chance: 0.4}),
            new TradeItem({item_name: "A Glint On The Sand", count: [1], chance: 0.4}),
            new TradeItem({item_name: "Wood for Witches", count: [1], chance: 0.2}),
            new TradeItem({item_name: "Counting Mice", count: [1], chance: 0.9}),

            new TradeItem({item_name: "Glass phial", count: [10,16], chance: 1}),
            new TradeItem({item_name: "Glass bottle", count: [6,12], chance: 1}),

            new TradeItem({item_name: "Camping supplies", count: [1], chance: 1}),
            new TradeItem({item_name: "Coil of rope", count: [1], chance: 1}),

            new TradeItem({item_name: "Iron sickle", count: [1], chance: 1}),
            new TradeItem({item_name: "Iron pickaxe", count: [1], chance: 1}),
            new TradeItem({item_name: "Iron chopping axe", count: [1], chance: 1}),
            new TradeItem({item_name: "Iron shovel", count: [1], chance: 1}),
        ]
    })
]

inventory_templates["Swamp"] = 
[
    new TradeItemGroup({
        start_conditions: item_conditions.swamp_quest_not_done,
        items: [
            new TradeItem({item_name: "Alligator jerky", count: [1,2]}),
            new TradeItem({item_name: "Snake jerky", count: [1,2]}),
            new TradeItem({item_name: "Turtle jerky", count: [1,2]}),

            new TradeItem({item_name: "Cooking herbs", count: [1,3]}),
            new TradeItem({item_name: "Wild onion", count: [1,3]}),
            new TradeItem({item_name: "Wild garlic", count: [1,3]}),
            new TradeItem({item_name: "Wild potato", count: [1,3]}),
        ]
    }),
    new TradeItemGroup({
        start_conditions: item_conditions.swamp_quest_done,
        items: [
            new TradeItem({item_name: "Alligator jerky", count: [2,5]}),
            new TradeItem({item_name: "Snake jerky", count: [2,5]}),
            new TradeItem({item_name: "Turtle jerky", count: [2,5]}),

            new TradeItem({item_name: "Cooking herbs", count: [3,6]}),
            new TradeItem({item_name: "Wild onion", count: [3,6]}),
            new TradeItem({item_name: "Wild garlic", count: [3,6]}),
            new TradeItem({item_name: "Wild potato", count: [5,9]}),

            new TradeItem({item_name: "Alligator armor", count: [1], quality: [70, 100], chance: 0.05}),
            new TradeItem({item_name: "Alligator helmet", count: [1], quality: [70, 100], chance: 0.05}),
            new TradeItem({item_name: "Alligator armored pants", count: [1], quality: [70, 100], chance: 0.05}),

            new TradeItem({item_name: "Turtleshell platemail armor", count: [1], quality: [70, 100], chance: 0.01}),
            new TradeItem({item_name: "Turtleshell platemail helmet", count: [1], quality: [70, 100], chance: 0.01}),
            new TradeItem({item_name: "Turtleshell platemail pants", count: [1], quality: [70, 100], chance: 0.01}),
            new TradeItem({item_name: "Turtleshell shield", count: [1], quality: [70, 100], chance: 0.01}),

            new TradeItem({item_name: "Shellfish desires", count: [1], chance: 0.5}),

            new TradeItem({item_name: "Healing balm", count: [1,2], chance: 0.15}),
            new TradeItem({item_name: "Healing powder", count: [1,3], chance: 0.2}),
            new TradeItem({item_name: "Healing potion", count: [1,3], chance: 0.25}),

            new TradeItem({item_name: "Oneberry", count: [1,4], chance: 0.1}),
            new TradeItem({item_name: "Silver thistle", count: [1,3], chance: 0.1}),
            new TradeItem({item_name: "Golmoon leaf", count: [1,3], chance: 0.1}),
            new TradeItem({item_name: "Belmart leaf", count: [1,3], chance: 0.1}),
        ]
    })
];

inventory_templates["Cat cafe"] = 
[
    new TradeItemGroup({
        items: [
            new TradeItem({item_name: "Fresh bread", count: [2,5]}), //for clients with simpler taste
            new TradeItem({item_name: "Bread kwas", count: [8,12]}),
            new TradeItem({item_name: "Cooked clam", count: [4,6]}),
            new TradeItem({item_name: "Crab bisque", count: [4,6]}),
            new TradeItem({item_name: "Kingsized frog legs", count: [4,6]}),
            new TradeItem({item_name: "Fish steak", count: [4,6]}),
            new TradeItem({item_name: "Apple pie", count: [4,6]}),
            new TradeItem({item_name: "Carrot cake", count: [4,6]}),
            new TradeItem({item_name: "Cider", count: [4,6]}),
            new TradeItem({item_name: "Black coffee", count: [4,6]}),
        ]
    })
]

export default inventory_templates;