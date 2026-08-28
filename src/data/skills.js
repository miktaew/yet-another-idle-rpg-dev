"use strict";

import { character } from "./character.js";
import { get_crafting_quality_caps } from "../crafting_recipes.js";
import { Skill } from "../models/skill.js";
import { availabilities } from "./component_references.js";

availabilities["skill"] = {};

const skills = {};
const skill_categories = {};

const weapon_type_to_skill = {
    "axe": "Axes",
    "dagger": "Daggers",
    "hammer": "Hammers",
    "sword": "Swords",
    "spear": "Spears",
    "staff": "Staffs",
    "wand": "Wands"
};

//for display foldering and for different treatment when it comes to xp gain caps
const skill_category_crafting = "Crafting";

//basic combat skills
(function(){
    skills["Combat"] = new Skill({
                                names: {0: "Combat"}, 
                                category: "Combat",
                                description: "Overall combat ability", 
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                get_effect_description: ()=> {
                                    return `Multiplies AP by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Combat",scaling_type:"multiplicative"})*1000)/1000}`;
                                }});
    
    skills["Pest killer"] = new Skill({
                                names: {0: "Pest killer", 15: "Pest slayer"}, 
                                description: "Small enemies might not seem very dangerous, but it's not that easy to hit them!", 
                                max_level_coefficient: 2,
                                category: "Combat",
                                base_xp_cost: 100,
                                get_effect_description: ()=> {
                                    return `Multiplies AP against small-type enemies by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Pest killer",scaling_type:"multiplicative"})*1000)/1000}`;
                                },
                                milestones: {
                                    1: {
                                        xp_multipliers: {
                                            Combat: 1.05,
                                        },
                                    },
                                    2: {
                                        xp_multipliers: {
                                            category_Combat: 1.05,
                                        },
                                    },
                                    3: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    5: {
                                        stats: {
                                            dexterity: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            Evasion: 1.05,
                                            "Shield blocking": 1.05,
                                        }
                                    },
                                    7: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Combat: 1.05,
                                        }
                                    },
                                    10: {
                                        stats: {
                                            dexterity: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            category_Combat: 1.05,
                                            Perception: 1.1,
                                        }
                                    },
                                    12: {
                                        stats: {
                                            dexterity: {flat: 2},
                                        },
                                        xp_multipliers: {
                                            Combat: 1.05,
                                        }
                                    },
                                    15: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    20: {
                                        xp_multipliers: {
                                            category_Combat: 1.1,
                                        },
                                    },
                                    25: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Combat: 1.1,
                                        },
                                    },
                                    30: {
                                        xp_multipliers: {
                                            "Shield blocking": 1.1,
                                        },
                                    },
                                    35: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    40: {
                                        stats: {
                                            dexterity: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            category_Combat: 1.1,
                                        },
                                    },
                                    45: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    50: {
                                        xp_multipliers: {
                                            Evasion: 1.1,
                                        },
                                    },
                                    55: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Evasion: 1.1,
                                        },
                                    },
                                    60: {
                                        stats: {
                                            dexterity: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            Combat: 1.2,
                                            category_Combat: 1.2,
                                            Evasion: 1.2,
                                        },
                                    },
                                },
                                get_stat_modifiers: () => {
                                    return {
                                       modifier_to_hit_chance: character.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Pest killer"})
                                    };
                                }
                            });    
                                
    skills["Giant slayer"] = new Skill({
                                names: {0: "Giant killer", 15: "Giant slayer"}, 
                                description: "Large opponents might seem scary, but just don't get hit and you should be fine!", 
                                max_level_coefficient: 2,
                                category: "Combat",
                                get_effect_description: ()=> {
                                    return `Multiplies EP against large-type enemies by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Giant slayer",scaling_type:"multiplicative"})*1000)/1000}`;
                                },
                                get_stat_modifiers: () => {
                                    return {
                                       modifier_to_evasion: character.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Giant slayer"}) 
                                    };
                                }
                            });
                                

    skills["Evasion"] = new Skill({
                                names: {0: "Evasion"},                                
                                description:"Ability to evade attacks. You cannot do it while using a shield",
                                max_level_coefficient: 2,
                                base_xp_cost: 20,
                                category: "Combat",
                                get_effect_description: ()=> {
                                    return `Multiplies EP by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Evasion",scaling_type:"multiplicative"})*1000)/1000}`;
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "agility": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "agility": {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Equilibrium: 1.05,
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "agility": {
                                                flat: 1,
                                                multiplier: 1.05,
                                            }
                                        },
                                    },
                                    7: {
                                        stats: {
                                            "agility": {flat: 2},
                                        },
                                        xp_multipliers: {
                                            Equilibrium: 1.05,
                                        }
                                    },
                                    10: {
                                        stats: {
                                            "agility": {
                                                flat: 1,
                                                multiplier: 1.05,
                                            }
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "agility": {flat: 2},
                                        },
                                        xp_multipliers: {
                                            Equilibrium: 1.05,
                                        }
                                    },
                                    15: {
                                        stats: {
                                            "agility": {flat: 5},
                                        },
                                    },
                                    20: {
                                        xp_multipliers: {
                                            Climbing: 1.2,
                                            Swimming: 1.2,
                                            Running: 1.2,
                                        }
                                    },
                                    25: {
                                        stats: {
                                            agility: {flat: 1},
                                        },
                                    },
                                    30: {
                                        stats: {
                                            agility: {flat: 1},
                                        },
                                    },
                                    35: {
                                        stats: {
                                            agility: {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Equilibrium: 1.1,
                                        },
                                    },
                                    40: {
                                        stats: {
                                            agility: {flat: 1},
                                        },
                                    },
                                    45: {
                                        stats: {
                                            agility: {multiplier: 1.05},
                                        },
                                    },
                                    50: {
                                        stats: {
                                            agility: {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Climbing: 1.1,
                                        },
                                    },
                                    55: {
                                        stats: {
                                            agility: {flat: 1},
                                        },
                                    },
                                    60: {
                                        stats: {
                                            agility: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            Equilibrium: 1.2,
                                            Climbing: 1.2,
                                            Swimming: 1.2,
                                        },
                                    },
                                }
                            });
    skills["Shield blocking"] = new Skill({
                                    names: {0: "Shield blocking"}, 
                                    description: "Ability to block attacks with shield. You cannot evade while using one",
                                    max_level: 30, 
                                    max_level_bonus: 0.2,
                                    category: "Combat",
                                    get_effect_description: ()=> {
                                        return `Increases block chance by flat ${Math.round(character.getTotalLevelBonus("Shield blocking")*1000)/10}%. Increases blocked damage by ${Math.round(character.getTotalLevelBonus("Shield blocking")*5000)/10}%, and blocks ${character.getTotalSkillLevel("Shield blocking")}% of attack damage before other calculations.`;
                                    },
                                    milestones: {
                                        1: {
                                            stats: {
                                                "strength": {flat: 1},
                                            }
                                        },
                                        3: {
                                            stats: {
                                                "strength": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.05,
                                            }
                                        },
                                        5: {
                                            stats: {
                                                "strength": {flat: 1},
                                                "dexterity": {flat: 1},
                                                "agility": {flat: 1}
                                            },
                                        },
                                        7: {
                                            stats: {
                                                "strength": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Fortitude: 1.05,
                                            }
                                        },
                                        10: {
                                            stats: {
                                                "strength": {
                                                    flat: 1,
                                                    multiplier: 1.05,
                                                },
                                                "dexterity": {flat: 2},
                                                "agility": {flat: 1}
                                            },
                                            xp_multipliers: {
                                                Perception: 1.1,
                                            }
                                        },
                                        12: {
                                            stats: {
                                                "strength": {flat: 2},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.05,
                                            }
                                        },
                                        15: {
                                            stats: {
                                                "strength": {flat: 4},
                                                "dexterity": {flat: 4},
                                                "agility": {flat: 2}
                                            }
                                        },
                                        20: {
                                            xp_multipliers: {
                                                Weightlifting: 1.2,
                                                Fortitude: 1.2,
                                                Combat: 1.2,
                                            },
                                            stats: {
                                                "strength": {multiplier: 1.05}
                                            }
                                        },
                                        25: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                        },
                                        30: {
                                            stats: {
                                                strength: {multiplier: 1.05},
                                                dexterity: {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.2,
                                                Fortitude: 1.2,
                                                Perception: 1.2,
                                            },
                                        },
                                    }
                                });
    
     skills["Unarmed"] = new Skill({ 
                                    names: {0: "Unarmed", 10: "Brawling", 20: "Martial arts"}, 
                                    description: "It's definitely, unquestionably, undoubtedly better to just use a weapon instead of doing this. But sure, why not?",
                                    category: "Combat",
                                    get_effect_description: ()=> {
                                        return `Multiplies damage dealt in unarmed combat by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Unarmed",scaling_type:"multiplicative"})*1000)/1000}. 
Multiplies attack speed, EP and AP in unarmed combat by ${Math.round((character.getTotalSkillCoefficient({skill_id:"Unarmed",scaling_type:"multiplicative"})**0.3333)*1000)/1000}.
Adds ${skills["Unarmed"].getCurrentLvl()/10} base damage to unarmed attacks`;
                                    },
                                    max_level_coefficient: 64, //even with 8x more it's still gonna be worse than just using a weapon lol
                                    milestones: {
                                        2: {
                                            stats: {
                                                "strength": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.05,
                                            }
                                        },
                                        4: {
                                            stats: {
                                                "strength": {flat: 1},
                                                "dexterity": {flat: 1},
                                            }
                                        },
                                        6: {
                                            stats: {
                                                "strength": {flat: 1},
                                                "dexterity": {flat: 1},
                                                "agility": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.1,
                                            }
                                        },
                                        8: {
                                            stats: {
                                                "strength": {flat: 1},
                                                "dexterity": {flat: 1},
                                                "agility": {flat: 1},
                                            }
                                        },
                                        10: {
                                            stats: {
                                                "strength": {flat: 2},
                                                "dexterity": {flat: 1},
                                                "agility": {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Running: 1.2,
                                            }
                                        },
                                        12: {
                                            stats: {
                                                "strength": {flat: 2},
                                                "dexterity": {flat: 2},
                                                "agility": {flat: 2},
                                            }
                                        },
                                        15: {
                                            stats: {
                                                "strength": {flat: 5},
                                                "dexterity": {flat: 5},
                                                "agility": {flat: 5},
                                            }
                                        },
                                        20: {
                                            xp_multipliers: {
                                                Breathing: 1.1,
                                                Equilibrium: 1.1,
                                                Weightlifting: 1.1,
                                                Running: 1.1,
                                            },
                                        },
                                        25: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                        },
                                        30: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                        },
                                        35: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.1,
                                            },
                                        },
                                        40: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                        },
                                        45: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                        },
                                        50: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Running: 1.1,
                                            },
                                        },
                                        55: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                        },
                                        60: {
                                            stats: {
                                                strength: {flat: 1},
                                                dexterity: {flat: 1},
                                                agility: {flat: 1},
                                            },
                                            xp_multipliers: {
                                                Weightlifting: 1.2,
                                                Running: 1.2,
                                                Breathing: 1.2,
                                            },
                                        },
                                    }});
})();

//combat stances
(function(){
    skills["Stance mastery"] = new Skill({
                                    names: {0: "Stance proficiency", 10: "Stance mastery"}, 
                                    description: "Knowledge on how to apply different stances in combat",
                                    base_xp_cost: 60,
                                    category: "Stance",
                                    max_level: 30,
                                    get_effect_description: function() {
                                        return `Increases xp gains of all combat stance skills of level lower than this, x${this.parent_multiplier} per level of difference`;
                                    },
                                });
    skills["Quick steps"] = new Skill({
                                names: {0: "Quick steps"}, 
                                parent_skill: "Stance mastery",
                                description: "A swift and precise technique that abandons strength in favor of greater speed", 
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return `Improves efficiency of the 'Quick Steps' stance`;
                                }});
    skills["Heavy strike"] = new Skill({
                                names: {0: "Crushing force"}, 
                                parent_skill: "Stance mastery",
                                description: "A powerful and dangerous technique that abandons speed in favor of overwhelmingly strong attacks",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return `Improves efficiency of the "Crushing force" stance`;
                                }});
    skills["Wide swing"] = new Skill({ 
                                names: {0: "Broad arc"}, 
                                parent_skill: "Stance mastery",
                                description: "A special technique that allows striking multiple enemies at once, although at a cost of lower overall efficiency." 
                                            +" <br>Divides gained xp by number of enemies attacked, reduces drop rate in proportion to that number (down to 1/4th against 8).",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return `Improves efficiency of the "Broad arc" stance`;
                                }});
    skills["Defensive measures"] = new Skill({
                                names: {0: "Defensive measures"}, 
                                parent_skill: "Stance mastery",
                                description: "A careful technique focused much more on defense than on attacking",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return `Improves efficiency of the "Defensive Measures" stance`;
                                }});
    skills["Berserker's stride"] = new Skill({ 
                                names: {0: "Berserker's stride"}, 
                                parent_skill: "Stance mastery",
                                description: "A wild and dangerous technique that focuses on dealing as much damage as possible, while completely ignoring own defense",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return `Improves efficiency of the "Berserker's Stride" stance`;
                                }});                  
    skills["Flowing water"] = new Skill({
                                names: {0: "Flowing water"}, 
                                parent_skill: "Stance mastery",
                                description: "A wild and dangerous technique that focuses on dealing as much damage as possible, while completely ignoring own defense",
                                max_level_coefficient: 2,
                                base_xp_cost: 60,
                                category: "Stance",
                                max_level: 30,
                                get_effect_description: ()=> {
                                    return `Improves efficiency of the "Flowing Water" stance`;
                                }});         
                               
})();

//environment related skills
(function(){
    skills["Spatial awareness"] = new Skill({
                                            names: {0: "Spatial awareness"}, 
                                            description: "Understanding where you are in relation to other creatures and objects", 
                                            get_effect_description: ()=> {
                                                return `Reduces environmental penalty in open areas`;
                                            },
                                            category: "Environmental",
                                            milestones: {
                                                1: {
                                                    xp_multipliers:{ 
                                                        Evasion: 1.1,
                                                        "Shield blocking": 1.1,
                                                    },
                                                },
                                                3: {
                                                    xp_multipliers: {
                                                        Combat: 1.1,
                                                    }
                                                },
                                                5: {
                                                    xp_multipliers: {
                                                        category_Combat: 1.1,
                                                    },
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    }
                                                },
                                                8: {
                                                    xp_multipliers: {
                                                        all_skill: 1.1,
                                                    }
                                                },
                                                10: {
                                                    xp_multipliers:{ 
                                                        Evasion: 1.1,
                                                        "Shield blocking": 1.1,
                                                        Combat: 1.1,
                                                        Perception: 1.1,
                                                    },
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    }
                                                },
                                                15: {
                                                    xp_multipliers: {
                                                        category_Combat: 1.1,
                                                    },
                                                    stats: {
                                                        intuition: {flat: 3},
                                                    }
                                                },
                                                20: {
                                                    xp_multipliers: {
                                                        all_skill: 1.2,
                                                    }
                                                },
                                                25: {
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    },
                                                },
                                                30: {
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    },
                                                },
                                                35: {
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    },
                                                    xp_multipliers: {
                                                        Evasion: 1.1,
                                                    },
                                                },
                                                40: {
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    },
                                                },
                                                45: {
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    },
                                                },
                                                50: {
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    },
                                                    xp_multipliers: {
                                                        "Shield blocking": 1.1,
                                                    },
                                                },
                                                55: {
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    },
                                                },
                                                60: {
                                                    stats: {
                                                        intuition: {flat: 1},
                                                    },
                                                    xp_multipliers: {
                                                        Evasion: 1.2,
                                                        "Shield blocking": 1.2,
                                                        Combat: 1.2,
                                                    },
                                                },
                                            }
                                        });
    skills["Tight maneuvers"] = new Skill({
                                        names: {0: "Tight maneuvers"}, 
                                        description: "Learn how to fight in narrow environment, where there's not much space for dodging attacks", 
                                        category: "Environmental",
                                        get_effect_description: ()=> {
                                            return `Reduces environmental penalty in narrow areas`;
                                        },
                                        milestones: {
                                            3: {
                                                xp_multipliers: {
                                                    Evasion: 1.1,
                                                    "Shield blocking": 1.1,
                                                }
                                            },
                                            5: {
                                                xp_multipliers: {
                                                    Combat: 1.1,
                                                }
                                            },
                                            7: {
                                                xp_multipliers: {
                                                    Evasion: 1.1,
                                                    "Shield blocking": 1.1,
                                                }
                                            },
                                            10: {
                                                xp_multipliers: {
                                                    Evasion: 1.1,
                                                    "Shield blocking": 1.1,
                                                    Combat: 1.1,
                                                }
                                            },
                                            15: {
                                                xp_multipliers: {
                                                    Equilibrium: 1.1,
                                                },
                                                stats: {
                                                    agility: {flat: 5},
                                                }
                                            },
                                            20: {
                                                xp_multipliers: {
                                                    Evasion: 1.2,
                                                    "Shield blocking": 1.2,
                                                    Combat: 1.2,
                                                }
                                            },
                                            25: {
                                                stats: {
                                                    agility: {flat: 5},
                                                },
                                            },
                                            30: {
                                                xp_multipliers: {
                                                    "Shield blocking": 1.1,
                                                },
                                            },
                                            35: {
                                                xp_multipliers: {
                                                    Evasion: 1.1,
                                                },
                                            },
                                            40: {
                                                xp_multipliers: {
                                                    Equilibrium: 1.1,
                                                },
                                            },
                                            45: {
                                                xp_multipliers: {
                                                    Evasion: 1.1,
                                                },
                                            },
                                            50: {
                                                xp_multipliers: {
                                                    "Shield blocking": 1.1,
                                                },
                                            },
                                            55: {
                                                stats: {
                                                    agility: {flat: 5},
                                                },
                                            },
                                            60: {
                                                stats: {
                                                    agility: {flat: 5},
                                                },
                                                xp_multipliers: {
                                                    Evasion: 1.2,
                                                    "Shield blocking": 1.2,
                                                    Combat: 1.2,
                                                },
                                            },
                                        }
                                    });
    skills["Night vision"] = new Skill({
                                    names: {0: "Night vision"},
                                    description: "Ability to see in darkness",
                                    base_xp_cost: 600,
                                    xp_scaling: 1.9,
                                    max_level: 10,
                                    category: "Environmental",
                                    get_effect_description: () => {
                                        return `Reduces environmental penalty in dark areas (except for 'pure darkness')`;
                                    },
                                    milestones: {
                                        2: {
                                            stats: {
                                                intuition: {flat: 1},
                                            }
                                        },
                                        3: {
                                            xp_multipliers: {
                                                Evasion: 1.05,
                                                "Shield blocking": 1.05,
                                            }
                                        },
                                        5: {
                                            stats: {
                                                intuition: {flat: 1},
                                            },
                                            xp_multipliers: {
                                                "Presence sensing": 1.05,
                                                Perception: 1.1,
                                            }

                                            },
                                        7: {    
                                            xp_multipliers: 
                                            {
                                                Combat: 1.1,
                                            },
                                            stats: {
                                                intuition: {multiplier: 1.05},
                                            }
                                        },
                                        8: {
                                            xp_multipliers: {
                                                "Presence sensing": 1.1,
                                            }
                                        },
                                        10: {
                                            xp_multipliers: {
                                                "Presence sensing": 1.2,
                                                Evasion: 1.05,
                                                "Shield blocking": 1.05,
                                                Perception: 1.1,
                                            },
                                            stats: {
                                                intuition: {multiplier: 1.05},
                                            }
                                        }
                                    }
                            });
    skills["Presence sensing"] = new Skill({
                names: {0: "Presence sensing"},
                description: "Ability to sense a presence without using your eyes",
                base_xp_cost: 60,
                xp_scaling: 2,
                max_level: 20,
                category: "Environmental",
                get_effect_description: () => {
                    return `Reduces environmental penalty in extremely dark areas`;
                },
                milestones: {
                    1: {
                        stats: {
                            intuition: {flat: 1},
                        },
                        xp_multipliers: {
                            "Night vision": 1.2,
                        }
                    },
                    
                    2: {
                        xp_multipliers: {
                            Evasion: 1.1,
                            "Shield blocking": 1.2,
                        }
                    },
                    4: {
                        stats: {
                            intuition: {flat: 1},
                        },
                        xp_multipliers: {
                            "Combat": 1.1,
                            Perception: 1.1,
                        }

                        },
                    5: {    
                        xp_multipliers: 
                        {
                            all_skill: 1.05,
                            "Night vision": 1.2,
                        },
                        stats: {
                            intuition: {multiplier: 1.1},
                        }
                    },
                    7: {
                        stats: {
                            intuition: {flat: 2},
                        },
                        xp_multipliers: {
                            hero: 1.05,
                            "Night vision": 1.2,
                            Perception: 1.1,
                        }
                    },
                    10: {
                        xp_multipliers: {
                            all_skill: 1.05,
                            "Night vision": 1.2,
                            Perception: 1.2,
                        }
                    },
                    12: {
                        xp_multipliers: {
                            all: 1.05,
                            Perception: 1.1,
                        },
                        stats: {
                            intuition: {
                                flat: 5,
                                multiplier: 1.05,
                            },
                        }
                    },
                    15: {
                        xp_multipliers: {
                            all_skill: 1.05,
                            "Night vision": 1.2, //if it's somehow not maxxed out by this point
                            Perception: 1.1,
                        },
                    },
                    20: {
                        xp_multipliers: {
                            all: 1.1,
                            Perception: 1.1,
                            Combat: 1.1,
                            "Spatial awareness": 1.1,
                        },
                        stats: {
                            intuition: {multiplier: 1.1},
                        }
                    },
                }
    });

    skills["Strength of mind"] = new Skill({
        names: {0: "Strength of mind", 15: "Iron will", 30: "Heart of steel"}, 
        description: "Resist and reject the unnatural influence. Turn your psyche into an iron fortress",
        category: "Environmental",
        flavour_text: "Blessed is the mind too small for doubt.", //40k ref
        base_xp_cost: 400,
        max_level: 40,
        xp_scaling: 1.7,
        get_effect_description: ()=> {
            return `Reduces eldritch effects`;
        },
        milestones: {
            1: {
                xp_multipliers: {
                    all_skill: 1.05,
                }
            },
            2: {    
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Literacy": 1.05,
                    "Persistence": 1.05,
                    "Fortitude": 1.05,
                    Perception: 1.1,
                }
            },
            3: {
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            5: {
                xp_multipliers: {
                    all_skill: 1.05,
                }
            },
            7: {    
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    "Literacy": 1.05,
                    "Persistence": 1.05,
                    "Fortitude": 1.05,
                }
            },
            8: {
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            10: {
                xp_multipliers: {
                    all: 1.05,
                    Perception: 1.1,
                }
            },
            12: {    
                stats: {
                    intuition: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Literacy": 1.05,
                    "Persistence": 1.05,
                    "Fortitude": 1.05,
                }
            },
            15: {    
                stats: {
                    intuition: {flat: 5, multiplier: 1.05},
                },
            },
            20: {    
                stats: {
                    intuition: {multiplier: 1.1},
                },
                xp_multipliers: {
                    all: 1.1,
                    Literacy: 1.1,
                    Persistence: 1.1,
                    Fortitude: 1.1,
                }
            },
            25: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            30: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            35: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    all_skill: 1.1,
                },
            },
            40: {
                stats: {
                    intuition: {multiplier: 1.1},
                },
                xp_multipliers: {
                    all_skill: 1.2,
                    Literacy: 1.2,
                    Persistence: 1.2,
                },
            },
        }
    });

    skills["Scrambling"] = new Skill({
		names: {0: "Scrambling"}, 
        description: "Ability to act quickly and with secure footing in rough, loose, or unstable ground", 
        category: "Environmental",
        base_xp_cost: 400,
        max_level: 60,
        xp_scaling: 1.7,
        get_effect_description: ()=> {
            return `Reduces environmental penalty in rough terrain`;
        },
        milestones: {
            1: {
                stats: {
					dexterity: {
						flat: 1
                    },
					agility: {
						flat: 1
                    },
                    max_stamina: {
                        multiplier: 1.1,
                    }
                }
            },
            3: {
                stats: {
					dexterity: {
						multiplier: 1.05
                    },
					agility: {
						multiplier: 1.05
                    },
                }
            },
            5: {
                stats: {
					dexterity: {
						flat: 3
                    },
					agility: {
						flat: 3
                    },
                },
                xp_multipliers: {
                    Running: 1.2,
                }
            },
            8: {
				stats: {
                    stamina_regeneration_flat: {
                        flat: 0.2,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    }
                },
            },
            10: {
				stats: {
                    attack_speed: {
                        multiplier: 1.01,
                    },
                },
            },
            13: {
                stats: {
					dexterity: {
						flat: 2
                    },
					agility: {
						flat: 2
                    },
                    max_stamina: {
                        multiplier: 1.2,
                    },
                }
            },
            15: {
                stats: {
					dexterity: {
						multiplier: 1.1
                    },
					agility: {
						multiplier: 1.1
                    },
                }
            },
            18: {
                stats: {
					dexterity: {
						flat: 4},
					agility: {
						flat: 4},
                },
                xp_multipliers: {
                    "Scrambling": 1.2,
                },
            },
            20: {
				stats: {
                    attack_speed: { multiplier: 1.02},
                    stamina_regeneration_flat: { flat: 0.3},
                    stamina_efficiency: { multiplier: 1.05 },
                },
            },
            25: {
                stats: {
                    dexterity: {flat: 1},
                    agility: {flat: 1},
                    stamina_regeneration_flat: {flat: 0.2},
                },
            },
            30: {
                stats: {
                    dexterity: {flat: 1},
                    agility: {flat: 1},
                },
            },
            35: {
                stats: {
                    dexterity: {flat: 1},
                    agility: {flat: 1},
                },
                xp_multipliers: {
                    Running: 1.1,
                },
            },
            40: {
                stats: {
                    dexterity: {flat: 1},
                    agility: {flat: 1},
                },
            },
            45: {
                stats: {
                    dexterity: {flat: 1},
                    agility: {flat: 1},
                    stamina_regeneration_flat: {flat: 0.2},
                    max_stamina: {multiplier: 1.2},
                },
            },
            50: {
                stats: {
                    dexterity: {flat: 1},
                    agility: {flat: 1},
                },
                xp_multipliers: {
                    Scrambling: 1.1,
                },
            },
            55: {
                stats: {
                    dexterity: {flat: 1},
                    agility: {flat: 1},
                },
            },
            60: {
                stats: {
                    dexterity: {flat: 1},
                    agility: {flat: 1},
                    max_stamina: {multiplier: 1.2},
                },
                xp_multipliers: {
                    Running: 1.2,
                    Scrambling: 1.2,
                },
            },
        }
    });

    skills["Heat resistance"] = new Skill({
        names: {0: "Heat resistance"},
        description: "Ability to survive and function in high temperatures",
        base_xp_cost: 100,
        max_level: 40,
        category: "Environmental",
    });
    skills["Cold resistance"] = new Skill({
        names: {0: "Cold resistance"},
        description: "Ability to survive and function in low temperatures",
        base_xp_cost: 200,
        xp_scaling: 1.8,
        max_level: 40,
        category: "Environmental",
        get_effect_description: ()=>{
            return `Increases cold tolerance by ${skills["Cold resistance"].getCurrentLvl()*0.5}`;
        },
    });

    skills["Dazzle resistance"] = new Skill({
        names: {0: "Dazzle resistance"},
        description: "Don't look at the sun, it's bad for your eyes",
        base_xp_cost: 60,
        max_level: 30,
        category: "Environmental",
        get_effect_description: ()=> {
            return `Reduces hit and evasion penalty in super bright areas`;
        },
        max_level_bonus: 0.5
    });
})();

//weapon skills
(function(){
    skills["Weapon mastery"] = new Skill({
                                    names: {0: "Weapon proficiency", 15: "Weapon mastery"}, 
                                    description: "Knowledge of all weapons",
                                    category: "Weapon",
                                    get_effect_description: function() {
                                        return `Increases xp gains of all weapon skills of level lower than this, x${this.parent_multiplier} per level of difference`;
                                    },
                                });
    skills["Swords"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Swordsmanship"}, 
                                category: "Weapon",
                                description: "The noble art of swordsmanship", 
                                get_effect_description: ()=> {
                                    return `Multiplies damage dealt with swords by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Swords",scaling_type:"multiplicative"})*1000)/1000}.
Multiplies AP with swords by ${Math.round((character.getTotalSkillCoefficient({skill_id:"Swords",scaling_type:"multiplicative"})**0.3333)*1000)/1000}`;
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "agility": {flat: 1},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "strength": {flat: 1},
                                            "crit_rate": {flat: 0.01},
                                        },
                                    },
                                    7: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    10: {
                                        stats: {
                                            "agility": {flat: 1},
                                            "crit_multiplier": {flat: 0.1}, 
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "dexterity": {flat: 2},
                                        }
                                    },
                                    15: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            agility: {flat: 1},
                                            strength: {flat: 1},
                                            crit_multiplier: {flat: 0.1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    20: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    25: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    30: {
                                        stats: {
                                            agility: {flat: 1},
                                        },
                                    },
                                    35: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    40: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    45: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            agility: {flat: 1},
                                            strength: {flat: 1},
                                            crit_multiplier: {flat: 0.1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    50: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    55: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    60: {
                                        stats: {
                                            agility: {flat: 1},
                                            dexterity: {flat: 1},
                                        },
                                    },
                                },
                                max_level_coefficient: 8
                            });

    skills["Axes"] = new Skill({ 
                                parent_skill: "Weapon mastery",
                                names: {0: "Axe combat"}, 
                                category: "Weapon",
                                description: "Ability to fight with axes", 
                                get_effect_description: ()=> {
                                    return `Multiplies damage dealt with axes by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Axes",scaling_type:"multiplicative"})*1000)/1000}.
Multiplies AP with axes by ${Math.round((character.getTotalSkillCoefficient({skill_id:"Axes",scaling_type:"multiplicative"})**0.3333)*1000)/1000}`;
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "strength": {flat: 1},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                            "strength": {flat: 1},
                                        },

                                    },
                                    7: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    10: {
                                        stats: {
                                                "strength": {multiplier: 1.05},
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "dexterity": {flat: 2},
                                        }
                                    },
                                    15: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {flat: 1},
                                        },
                                    },
                                    20: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    25: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    30: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {flat: 1},
                                        },
                                    },
                                    35: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    40: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {multiplier: 1.05},
                                        },
                                    },
                                    45: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {flat: 1},
                                        },
                                    },
                                    50: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    55: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    60: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {multiplier: 1.05},
                                        },
                                    },
                                },
                                max_level_coefficient: 8});

    skills["Spears"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Spearmanship"}, 
                                category: "Weapon",
                                description: "The ability to fight with the most deadly weapon in history", 
                                get_effect_description: ()=> {
                                    return `Multiplies damage dealt with spears by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Spears",scaling_type:"multiplicative"})*1000)/1000}.
Multiplies AP with spears by ${Math.round((character.getTotalSkillCoefficient({skill_id:"Spears",scaling_type:"multiplicative"})**0.3333)*1000)/1000}`;
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "strength": {flat: 1},
                                            "crit_rate": {flat: 0.01},
                                        },
                                    },
                                    7: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    10: {
                                        stats: {
                                            "strength": {flat: 1},
                                            "crit_multiplier": {flat: 0.1}, 
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "dexterity": {flat: 2},
                                        }
                                    },
                                    15: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {flat: 1},
                                            crit_multiplier: {flat: 0.1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    20: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    25: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    30: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {flat: 1},
                                        },
                                    },
                                    35: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    40: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    45: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {flat: 1},
                                            crit_multiplier: {flat: 0.1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    50: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    55: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    60: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            strength: {flat: 1},
                                        },
                                    },
                                },
                                max_level_coefficient: 8
                            });

    skills["Hammers"] = new Skill({ 
                                        parent_skill: "Weapon mastery",
                                        names: {0: "Hammer combat"}, 
                                        category: "Weapon",
                                        description: "Ability to fight with battle hammers. Why bother trying to cut someone, when you can just crack all their bones?", 
                                        get_effect_description: ()=> {
                                            return `Multiplies damage dealt with battle hammers by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Hammers",scaling_type:"multiplicative"})*1000)/1000}.
Multiplies AP with hammers by ${Math.round((character.getTotalSkillCoefficient({skill_id:"Hammers",scaling_type:"multiplicative"})**0.3333)*1000)/1000}`;
                                        },
                                        milestones: {
                                            1: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                }
                                            },
                                            3: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                }
                                            },
                                            5: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                    "dexterity": {flat: 1},
                                                },
                                            },
                                            7: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                }
                                            },
                                            10: {
                                                stats: {
                                                    "strength": {flat: 1},
                                                    "dexterity": {flat: 1}, 
                                                },
                                            },
                                            12: {
                                                stats: {
                                                    "dexterity": {flat: 2},
                                                }
                                            },
                                            15: {
                                                stats: {
                                                    strength: {flat: 1},
                                                    dexterity: {flat: 1},
                                                },
                                            },
                                            20: {
                                                stats: {
                                                    strength: {flat: 1},
                                                },
                                            },
                                            25: {
                                                stats: {
                                                    strength: {flat: 1},
                                                    dexterity: {flat: 1},
                                                },
                                            },
                                            30: {
                                                stats: {
                                                    strength: {flat: 1},
                                                },
                                            },
                                            35: {
                                                stats: {
                                                    strength: {flat: 1},
                                                    dexterity: {flat: 1},
                                                },
                                            },
                                            40: {
                                                stats: {
                                                    strength: {flat: 1},
                                                },
                                            },
                                            45: {
                                                stats: {
                                                    strength: {flat: 1},
                                                    dexterity: {flat: 1},
                                                },
                                            },
                                            50: {
                                                stats: {
                                                    strength: {flat: 1},
                                                },
                                            },
                                            55: {
                                                stats: {
                                                    strength: {flat: 1},
                                                    dexterity: {flat: 1},
                                                },
                                            },
                                            60: {
                                                stats: {
                                                    strength: {flat: 1},
                                                },
                                            },
                                        },
                                        max_level_coefficient: 8
                                    });

    skills["Daggers"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Dagger combat"},
                                category: "Weapon",
                                description: "The disdained art of fighting (and stabbing) with daggers",
                                get_effect_description: ()=> {
                                    return `Multiplies damage dealt with daggers by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Daggers",scaling_type:"multiplicative"})*1000)/1000}.
Multiplies AP with daggers by ${Math.round((character.getTotalSkillCoefficient({skill_id:"Daggers",scaling_type:"multiplicative"})**0.3333)*1000)/1000}`;
                                },
                                milestones: {
                                    1: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    3: {
                                        stats: {
                                            "agility": {flat: 1},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            "crit_multiplier": {flat: 0.1},
                                            "crit_rate": {flat: 0.01},
                                        },
                                    },
                                    7: {
                                        stats: {
                                            "dexterity": {flat: 1},
                                        }
                                    },
                                    10: {
                                        stats: {
                                            "crit_rate": {flat: 0.02},
                                            "crit_multiplier": {flat: 0.1}, 
                                        },
                                    },
                                    12: {
                                        stats: {
                                            "dexterity": {flat: 2},
                                        }
                                    },
                                    15: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            agility: {flat: 1},
                                            crit_multiplier: {flat: 0.1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    20: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    25: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    30: {
                                        stats: {
                                            crit_multiplier: {flat: 0.1},
                                        },
                                    },
                                    35: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    40: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    45: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            agility: {flat: 1},
                                            crit_multiplier: {flat: 0.1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    50: {
                                        stats: {
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    55: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            crit_rate: {flat: 0.01},
                                        },
                                    },
                                    60: {
                                        stats: {
                                            crit_multiplier: {flat: 0.1},
                                            dexterity: {flat: 1},
                                        },
                                    },
                                },
                                max_level_coefficient: 8
                            });

    skills["Wands"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Wand casting"}, 
                                category: "Weapon",
                                description: "Ability to cast spells with magic wands, increases damage dealt", 
                                get_effect_description: ()=> {
                                    return `Multiplies damage dealt with wands by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Wands",scaling_type:"multiplicative"})*1000)/1000}`;
                                },
                                max_level_coefficient: 8});

    skills["Staffs"] = new Skill({
                                parent_skill: "Weapon mastery",
                                names: {0: "Staff casting"}, 
                                category: "Weapon",
                                description: "Ability to cast spells with magic staffs, increases damage dealt", 
                                get_effect_description: ()=> {
                                    return `Multiplies damage dealt with staffs by ${Math.round(character.getTotalSkillCoefficient({skill_id:"Staffs",scaling_type:"multiplicative"})*1000)/1000}`;
                                },
                                max_level_coefficient: 8});
})();

//work related
(function(){
    skills["Farming"] = new Skill({
                                names: {0: "Farming"}, 
                                description: "Even a simple action of plowing some fields, can be performed better with skills and experience",
                                base_xp_cost: 40,
                                category: "Activity",
                                max_level: 10,
                                xp_scaling: 1.6,
                                max_level_coefficient: 2,
                                milestones: {
                                    1: {
                                        stats: {
                                            max_stamina: {flat: 2},
                                        },
                                    },
                                    2: {
                                        stats: {
                                            strength: {flat: 1}
                                        },
                                    },
                                    3: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            max_stamina: {flat: 2},
                                        }
                                    },
                                    4: {
                                        stats: {
                                            strength: {flat: 1},
                                            max_stamina: {flat: 2},
                                        }
                                    },
                                    5: {
                                        stats: {
                                            strength: {flat: 1},
                                            max_stamina: {flat: 2},
                                        },
                                        xp_multipliers: {
                                            "Herbalism": 1.05,
                                        }
                                    },
                                    6: {
                                        stats: {
                                            strength: {flat: 1},
                                        },
                                        xp_multipliers: {
                                            Weightlifting: 1.1,
                                        }
                                    },
                                    7: {
                                        stats: {
                                            dexterity: {flat: 1},
                                            max_stamina: {flat: 2},
                                        },
                                        xp_multipliers: {
                                            "Unarmed": 1.05,
                                        }
                                    },
                                    8: {
                                        stats: {
                                            strength: {flat: 1},
                                            max_stamina: {flat: 2},
                                        }
                                    },
                                    9: {
                                        stats: {
                                            strength: {flat: 1},
                                            dexterity: {flat: 1},
                                        },
                                    },
                                    10: {
                                        stats: {
                                            max_stamina: {flat: 4},
                                            strength: {multiplier: 1.05},
                                            dexterity: {multiplier: 1.05},
                                        },
                                        xp_multipliers: {
                                            "Unarmed": 1.1,
                                            "Herbalism": 1.1,
                                            "Digging": 1.1,
                                        }
                                    }
                                }});
})();

//non-work activity related
(function(){
    skills["Sleeping"] = new Skill({
                                    names: {0: "Sleeping"}, 
                                    description: "Good, regular sleep is the basis of getting stronger and helps your body heal",
                                    get_effect_description: ()=>{
                                        return `Multiplies health restored when sleeping by ${Math.round(100*(1 + character.getTotalSkillLevel("Sleeping")/skills["Sleeping"].max_level))/100}`;
                                    },
                                    base_xp_cost: 1000,
                                    flavour_text: "One rat, two rats, three rats...",
                                    visibility_treshold: 300,
                                    xp_scaling: 2,
                                    category: "Activity",
                                    max_level: 10,
                                    max_level_coefficient: 2.5,    
                                    milestones: {
                                        2: {
                                            stats: {
                                                "max_health": {
                                                    flat: 10,
                                                    multiplier: 1.04,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.05,
                                            }
                                        },
                                        4: {
                                            stats: {
                                                "max_health": {
                                                    flat: 20,
                                                    multiplier: 1.04,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.05,
                                            },
                                        },
                                        5: {
                                            unlocks: {
                                                skills: [
                                                    "Meditation"
                                                ]
                                            }
                                        },
                                        6: {
                                            stats: {
                                                "max_health": {
                                                    flat: 30,
                                                    multiplier: 1.04,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.05,
                                                "Meditation": 1.1,
                                            }
                                        },
                                        8: {
                                            stats: {
                                                "max_health": {
                                                    flat: 30,
                                                    multiplier: 1.04,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.05,
                                            }
                                        },
                                        10: {
                                            stats: {
                                                "max_health": {
                                                    flat: 40,
                                                    multiplier: 1.1,
                                                }
                                            },
                                            xp_multipliers: {
                                                all: 1.1,
                                                "Meditation": 1.2,
                                            },
                                            unlocks: {
                                                recipes: [
                                                    {category: "crafting", subcategory: "items", recipe_id: "Simple dream catcher"},
                                                ]
                                            }
                                        }
                                    }
                                });                         
    skills["Meditation"] = new Skill({
        names: {0: "Meditation"}, 
        description: "Focus your mind",
        base_xp_cost: 200,
        category: "Activity",
        max_level: 30, 
        max_level_coefficient: 2,
        is_unlocked: false,
        visibility_treshold: 0,
        milestones: {
            2: {
                stats: {
                    "intuition": {flat: 1},
                },
                xp_multipliers: {
                    all: 1.05,
                    "Presence sensing": 1.05,
                }
            },
            4: {
                stats: {
                    "intuition": {
                        flat: 1, 
                        multiplier: 1.05
                    }
                },
                xp_multipliers: {
                    all: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            5: {
                xp_multipliers: {
                    "Sleeping": 1.1,
                    "Breathing": 1.1,
                    "Presence sensing": 1.05,
                }
            },
            6: {
                stats: {
                    "intuition": {
                        flat: 2,
                    }
                },
                xp_multipliers: {
                    "Strength of mind": 1.05,
                }
            },
            8: {
                stats: {
                    "intuition": {
                        multiplier: 1.05
                    },
                },
                xp_multipliers: {
                    all: 1.05,
                    "Sleeping": 1.1,
                    "Breathing": 1.1,
                    "Presence sensing": 1.05,
                }
            },
            10: {
                stats: {
                    "intuition": {
                        flat: 2,
                        multiplier: 1.05
                    }
                },
                xp_multipliers: {
                    all: 1.1,
                    "Sleeping": 1.1,
                    "Breathing": 1.1,
                    "Presence sensing": 1.1,
                    "Strength of mind": 1.1,
                }
            },
            12: {
                stats: {
                    "intuition": {
                        flat: 2,
                    }
                },
                xp_multipliers: {
                    all: 1.05,
                    "Presence sensing": 1.1,
                }
            },
            15: {
                xp_multipliers: {
                    all: 1.1,
                }
            },
            20: {
                stats: {
                    "intuition": {
                        multiplier: 1.05,
                    }
                },
                xp_multipliers: {
                    all_skill: 1.1,
                    "Presence sensing": 1.2,
                    Sleeping: 1.2,
                }
            },
            25: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            30: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
                xp_multipliers: {
                    all: 1.2,
                    "Presence sensing": 1.2,
                    "Strength of mind": 1.2,
                },
            },
        },
        get_effect_description: ()=> {
            let value = character.getTotalSkillCoefficient({skill_id:"Meditation",scaling_type:"multiplicative"})
            return `Multiplies intuition by ${Math.round(value*100)/100}`;
        },
    });                  
    skills["Running"] = new Skill({
        description: "Great way to improve the efficiency of the body",
        names: {0: "Running"},
        max_level: 50,
        category: "Activity",
        max_level_coefficient: 2,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    agility: {
                        flat: 1
                    },
                },
            },
            3: {
                stats: {
                    agility: {
                        flat: 1
                    },
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                }
            },
            5: {
                stats: {
                    agility: {
                        flat: 1,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },                                          
            },
            7: {
                stats: {
                    agility: {
                        flat: 1,
                        multiplier: 1.05,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.05,
                }
            },
            10: {
                stats: {
                    agility: {
                        flat: 1,
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                }
            },
            12: {
                stats: {
                    agility: {
                        flat: 2
                    },
                    max_stamina: {
                        flat: 5
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.05,
                },
                unlocks: {
                            quests: [
                                "Swimming/climbing unlock",
                                "Swimming alternative unlock"
                            ]
                        }
            },
            15: {
                stats: {
                    agility: {
                        flat: 3
                    },
                    max_stamina: {
                        flat: 5
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                },
            },
            20: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.1,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.2,
                },
            },
            25: {
                stats: {
                    agility: {flat: 1},
                    max_stamina: {flat: 5},
                },
            },
            30: {
                stats: {
                    agility: {flat: 1},
                },
            },
            35: {
                stats: {
                    agility: {flat: 1},
                },
                xp_multipliers: {
                    Breathing: 1.1,
                },
            },
            40: {
                stats: {
                    agility: {flat: 1},
                    max_stamina: {multiplier: 1.1},
                },
            },
            45: {
                stats: {
                    agility: {flat: 1},
                    max_stamina: {flat: 5},
                },
            },
            50: {
                stats: {
                    agility: {flat: 1},
                    max_stamina: {multiplier: 1.1},
                },
                xp_multipliers: {
                    Breathing: 1.2,
                },
            },
        },
        get_effect_description: ()=> {
            let value = character.getTotalSkillCoefficient({skill_id:"Running",scaling_type:"multiplicative"})
            return `Multiplies stamina efficiency by ${Math.round(value*100)/100}`;
        },
    });
    skills["Weightlifting"] = new Skill({
        description: "No better way to get stronger than by lifting heavy things",
        names: {0: "Weightlifting"},
        max_level: 50,
        category: "Activity",
        max_level_coefficient: 4,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
            },
            3: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
                xp_multipliers: {
                    "Unarmed": 1.05,
                }
            },
            5: {
                stats: {
                    strength: {
                        flat: 1,
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
            },
            7: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
                xp_multipliers: {
                    "Unarmed": 1.1,
                }
            },
            10: {
                stats: {
                    strength: {
                        flat: 1, 
                        multiplier: 1.05
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
            },
            12: {
                stats: {
                    strength: {
                        flat: 2
                    },
                    max_stamina: {
                        flat: 5
                    }
                },
                unlocks: {
                            quests: [
                                "Swimming/climbing unlock",
                                "Swimming alternative unlock"
                            ]
                        }
            },
            15: {
                stats: {
                    strength: {
                        flat: 2
                    },
                    max_stamina: {
                        flat: 5
                    }
                },
            },
            20: {
                stats: {
                    strength: {
                        flat: 5,
                        multiplier: 1.05
                    },
                    max_stamina: {
                        flat: 20,
                    },
                },
            },
            25: {
                stats: {
                    max_stamina: {flat: 5},
                    strength: {flat: 1},
                },
            },
            30: {
                stats: {
                    max_stamina: {flat: 5},
                    strength: {flat: 1},
                },
            },
            35: {
                stats: {
                    max_stamina: {flat: 5},
                    strength: {flat: 1},
                },
                xp_multipliers: {
                    Unarmed: 1.1,
                },
            },
            40: {
                stats: {
                    max_stamina: {flat: 5},
                    strength: {multiplier: 1.05},
                },
            },
            45: {
                stats: {
                    max_stamina: {flat: 5},
                    strength: {flat: 1},
                },
            },
            50: {
                stats: {
                    max_stamina: {flat: 5},
                    strength: {multiplier: 1.05},
                },
                xp_multipliers: {
                    Unarmed: 1.2,
                },
            },
        },
        get_effect_description: ()=> {
        let value = character.getTotalSkillCoefficient({skill_id:"Weightlifting",scaling_type:"multiplicative"})
        return `Multiplies strength by ${Math.round(value*100)/100}`;
        },
    });
    skills["Swimming"] = new Skill({
        description: "A nice, gentle, and relaxing exercise. Just remember to be careful",
        get_effect_description: ()=> {
            let value = character.getTotalSkillCoefficient({skill_id:"Swimming",scaling_type:"multiplicative"})
            return `Multiplies agility and stamina by ${Math.round(value*100)/100}. Reduces environmental penalty in aquatic areas.`;
        },
        names: {0: "Swimming"},
        max_level: 50,
        category: "Activity",
        max_level_coefficient: 2,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    agility: {
                        flat: 1
                    },
                },
            },
            3: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
                xp_multipliers: {
                    "Breathing": 1.05,
                }
            },
            5: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
            },
            7: {
                stats: {
                    agility: {
                        flat: 1,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                }
            },
            10: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                },
            },
            12: {
                stats: {
                    agility: {
                        flat: 2,
                    },
                    max_stamina: {
                        flat: 10,
                    }
                }
            },
            15: {
                stats: {
                    agility: {
                        flat: 2,
                    },
                    max_stamina: {
                        flat: 10,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.1,
                }
            },
            20: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    }
                },
                xp_multipliers: {
                    "Breathing": 1.2,
                }
            },
            25: {
                stats: {
                    max_stamina: {flat: 10},
                    agility: {flat: 1},
                    strength: {flat: 1},
                },
            },
            30: {
                stats: {
                    agility: {flat: 1},
                },
            },
            35: {
                stats: {
                    agility: {flat: 1},
                },
                xp_multipliers: {
                    Breathing: 1.1,
                },
            },
            40: {
                stats: {
                    agility: {multiplier: 1.05},
                },
            },
            45: {
                stats: {
                    max_stamina: {flat: 10},
                    agility: {flat: 1},
                },
            },
            50: {
                stats: {
                    agility: {multiplier: 1.05},
                    max_stamina: {flat: 10},
                },
                xp_multipliers: {
                    Breathing: 1.2,
                },
            },
        },
        
    });

    skills["Equilibrium"] = new Skill({
        description: "Nothing will throw you off your balance (at least the physical one)",
        names: {0: "Equilibrium"},
        category: "Activity",
        max_level: 50,
        max_level_coefficient: 4,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    agility: {flat: 1},
                },
            },
            3: {
                stats: {
                    intuition: {flat: 1},
                }
            },
            5: {
                stats: {
                    agility: {
                        flat: 1,
                        multiplier: 1.05,
                    },
                    strength: {flat: 1},
                    max_stamina: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Unarmed": 1.1,
                }
            },
            7: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            9: {
                stats: {
                    strength: {flat: 1},
                }
            },
            10: {
                stats: {
                    agility: {flat: 1},
                    intuition: {multiplier: 1.05},
                    max_stamina: {multiplier: 1.05},
                },
            },
            12: {
                stats: {
                    agility: {flat: 1},
                    strength: {flat: 1},
                }
            },
            15: {
                stats: {
                    agility: {flat: 5},
                    strength: {flat: 5},
                }
            },
            20: {
                stats: {
                    intuition: {multiplier: 1.05},
                },
                xp_multipliers: {
                    "Unarmed": 1.2,
                }
            },
            25: {
                stats: {
                    agility: {flat: 1},
                    strength: {flat: 1},
                    intuition: {flat: 1},
                },
            },
            30: {
                stats: {
                    agility: {flat: 1},
                    strength: {flat: 1},
                },
            },
            35: {
                stats: {
                    agility: {flat: 1},
                    strength: {flat: 1},
                },
                xp_multipliers: {
                    Unarmed: 1.1,
                },
            },
            40: {
                stats: {
                    agility: {multiplier: 1.05},
                    strength: {flat: 1},
                },
            },
            45: {
                stats: {
                    agility: {flat: 1},
                    strength: {flat: 1},
                    intuition: {flat: 1},
                },
            },
            50: {
                stats: {
                    agility: {multiplier: 1.05},
                    strength: {flat: 1},
                },
                xp_multipliers: {
                    Unarmed: 1.2,
                },
            },
        },
        get_effect_description: ()=> {
        let value = character.getTotalSkillCoefficient({skill_id:"Equilibrium",scaling_type:"multiplicative"});
        return `Multiplies agility by ${Math.round(value*100)/100}`;
        },
    });

    skills["Climbing"] = new Skill({
        description: "Intense and slightly dangerous form of training that involves majority of your muscles",
        names: {0: "Climbing"},
        max_level: 50,
        category: "Activity",
        max_level_coefficient: 2,
        base_xp_cost: 50,
        milestones: {
            1: {
                stats: {
                    agility: {
                        flat: 1
                    },
                },
            },
            3: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
            },
            5: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.03,
                    }
                },
            },
            7: {
                stats: {
                    strength: {
                        flat: 1
                    },
                },
            },
            10: {
                stats: {
                    strength: {
                        multiplier: 1.05
                    },
                    max_stamina: {
                        multiplier: 1.03,
                    }
                },
                xp_multipliers: {
                    Perception: 1.1, //because when climbing you need to find things that you can hold to, right?
                }
            },
            12: {
                stats: {
                    strength: {
                        flat: 2
                    },
                    agility: {
                        flat: 2
                    }
                }
            },
            15: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    }
                }
            },
            20: {
                stats: {
                    strength: {
                        multiplier: 1.05,
                    },
                    intuition: {
                        flat: 3,
                    }
                }
            },
            25: {
                stats: {
                    strength: {flat: 1},
                    agility: {flat: 1},
                    intuition: {flat: 3},
                },
            },
            30: {
                xp_multipliers: {
                    Perception: 1.1,
                },
            },
            35: {
                stats: {
                    strength: {flat: 1},
                },
                xp_multipliers: {
                    Perception: 1.1,
                },
            },
            40: {
                stats: {
                    agility: {multiplier: 1.05},
                },
            },
            45: {
                stats: {
                    strength: {flat: 1},
                },
            },
            50: {
                stats: {
                    agility: {multiplier: 1.05},
                    strength: {flat: 1},
                },
                xp_multipliers: {
                    Perception: 1.2,
                },
            },
        },
        get_effect_description: ()=> {
          let value = character.getTotalSkillCoefficient({skill_id:"Climbing",scaling_type:"multiplicative"});

          return `Multiplies strength, dexterity and agility by ${Math.round(value*100)/100}`;
        },
    });
})();

//resource gathering related
(function(){
    skills["Gathering mastery"] = new Skill({
        names: {0: "Beginner gatherer", 10: "Apprentice gatherer", 25: "Adept gatherer", 35: "Expert gatherer", 50: "Master gatherer"}, 
        description: "Knowledge on how to gather all the kinds of resources. "
                    +"While each of them is seemingly gathered in a completely different way, with enough practice you being to see some commonalities.",
        base_xp_cost: 10,
        xp_scaling: 1.6,
        visibility_treshold: 4,
        parent_multiplier: 1.05,
        category: "Gathering",
        get_effect_description: function() {
            return `Increases xp gains of all gathering skills of level lower than this, x${this.parent_multiplier} per level of difference`;
        },
    });
    skills["Woodcutting"] = new Skill({
        names: {0: "Woodcutting"},
        parent_skill: "Gathering mastery",
        description: "Get better with chopping the wood and recognizing useful trees",
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Mining"] = new Skill({
        names: {0: "Mining"},
        parent_skill: "Gathering mastery",
        description: "Get better with mining for ore and stone",
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Digging"] = new Skill({
        names: {0: "Digging"},
        parent_skill: "Gathering mastery",
        description: "Get better with swinging the shovel",
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Herbalism"] = new Skill({
        names: {0: "Herbalism"},
        parent_skill: "Gathering mastery",
        description: "Knowledge of useful plants and mushrooms",
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Animal handling"] = new Skill({
        names: {0: "Animal handling"},
        parent_skill: "Gathering mastery",
        description: "Knowledge and skills required to deal with a wide variety of animals",
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
    });

    skills["Fishing"] = new Skill({
        names: {0: "Fishing"},
        parent_skill: "Gathering mastery",
        description: "Get better at luring all kinds of fish",
        category: "Gathering",
        base_xp_cost: 10,
        visibility_treshold: 4,
        xp_scaling: 1.6,
        milestones: {
            1: {
                stats: {
                    intuition: {flat: 1},
                }
            },
            3: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    Persistence: 1.1,
                }
            },
            5: {
                stats: {
                    intuition: {multiplier: 1.05},
                    dexterity: {flat: 1},
                },
                xp_multipliers: {
                    Perception: 1.1,
                }
            },
            7: {    
                stats: {
                    intuition: {flat: 2},
                },
            },
            9: {
                stats: {
                    intuition: {flat: 2},
                }
            },
            10: {
                stats: {
                    intuition: {multiplier: 1.05},
                    dexterity: {flat: 2},
                },
                xp_multipliers: {
                    Perception: 1.1,
                    Meditation: 1.1,
                }
            },
            12: {    
                stats: {
                    intuition: {flat: 4},
                },
                xp_multipliers: {
                    "Presence sensing": 1.2
                }
            },
            15: {    
                stats: {
                    intuition: {multiplier: 1.05},
                    dexterity: {flat: 3},
                },
                xp_multipliers: {
                    Perception: 1.1,
                    "Swimming": 1.05,
                    "Animal handling": 1.05
                }
            },
            18: {
                stats: {
                    intuition: {flat: 5}
                },
                xp_multipliers: {
                    Perception: 1.1,
                    Persistence: 1.1
                }
            },
            20: {    
                stats: {
                    intuition: { multiplier: 1.1, flat: 5 },
                    dexterity: {flat: 5},
                },
                xp_multipliers: {
                    all: 1.05,
                    "Presence sensing": 1.2,
                    Meditation: 1.2
                }
            },
            25: {
                stats: {
                    intuition: {flat: 1},
                    dexterity: {flat: 1},
                },
            },
            30: {
                stats: {
                    intuition: {flat: 1},
                    dexterity: {flat: 1},
                },
            },
            35: {
                stats: {
                    intuition: {flat: 1},
                    dexterity: {flat: 1},
                },
                xp_multipliers: {
                    Persistence: 1.1,
                },
            },
            40: {
                stats: {
                    intuition: {flat: 1},
                    dexterity: {flat: 1},
                },
            },
            45: {
                stats: {
                    intuition: {multiplier: 1.1},
                    dexterity: {flat: 1},
                },
            },
            50: {
                stats: {
                    intuition: {flat: 1},
                    dexterity: {flat: 1},
                },
                xp_multipliers: {
                    Perception: 1.1,
                },
            },
            55: {
                stats: {
                    intuition: {flat: 1},
                    dexterity: {flat: 1},
                },
            },
            60: {
                stats: {
                    intuition: {multiplier: 1.1},
                    dexterity: {flat: 1},
                },
                xp_multipliers: {
                    Persistence: 1.2,
                    Perception: 1.2,
                    Meditation: 1.2,
                },
            },
        }
    });
})();

//crafting skills
(function(){
    skills["Crafting mastery"] = new Skill({
        skill_id: "Crafting mastery", 
        names: {0: "Crafting proficiency", 15: "Crafting mastery"}, 
        description: "A mastery of the minor crafting branches like tinkering, woodworking, or butchering",
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
        milestones: {
            5: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            10: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            15: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            20: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            25: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            30: {
                stats: {
                    dexterity: {
                        multiplier: 1.05,
                    },
                }
            },
            35: {
                xp_multipliers: {
                    Crafting: 1.1,
                },
            },
            40: {
                xp_multipliers: {
                    Butchering: 1.1,
                },
            },
            45: {
                xp_multipliers: {
                    Crafting: 1.1,
                },
            },
            50: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
            },
            55: {
                xp_multipliers: {
                    Butchering: 1.1,
                },
            },
            60: {
                stats: {
                    dexterity: {multiplier: 1.05},
                },
                xp_multipliers: {
                    Crafting: 1.2,
                    Butchering: 1.2,
                    Woodworking: 1.2,
                },
            },
        }
    });

    skills["Crafting"] = new Skill({
        names: {0: "Tinkering"}, 
        description: "Turn smaller pieces into one bigger thing",
        category: skill_category_crafting,
        parent_skill: "Crafting mastery",
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
        get_effect_description: () => {
            return `Quality cap: ${get_crafting_quality_caps("Crafting").components}% for comps, ${get_crafting_quality_caps("Crafting").equipment}% for eq`;
        },
    });
    skills["Smelting"] = new Skill({
        names: {0: "Smelting"}, 
        description: "Turning raw ore into raw metal",
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
    });
    skills["Forging"] = new Skill({
        names: {0: "Forging"}, 
        description: "Turning raw metal into something useful",
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
        get_effect_description: () => {
            return `Quality cap: ${get_crafting_quality_caps("Forging").components}% for components`;
        },
        milestones: {
            10: {
                unlocks: {
                    recipes: [
                        {category: "smelting", subcategory: "items", recipe_id: "Steel ingot (inefficient)"},
                    ]
                }
            }
        }
    });
    skills["Cooking"] = new Skill({
        names: {0: "Cooking"}, 
        description: "Making the inedible edible",
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
    });
    skills["Alchemy"] = new Skill({
        names: {0: "Alchemy"}, 
        description: "Extracting and enhancing useful properties of the ingredients",
        category: skill_category_crafting,
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
    });
    skills["Butchering"] = new Skill({
        skill_id: "Butchering", 
        names: {0: "Butchering"}, 
        description: "Making the most of what you kill",
        category: skill_category_crafting,
        parent_skill: "Crafting mastery",
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level_coefficient: 2,
        max_level: 60,
        is_unlocked: false,
        visibility_treshold: 0,
        get_effect_description: () => {
            let value = character.getTotalSkillCoefficient({skill_id:"Butchering",scaling_type:"multiplicative"});
            return `Multiplies drop chances from Beasts by ${Math.round(value*100)/100}`;},
    });
    skills["Woodworking"] = new Skill({
        skill_id: "Woodworking", 
        names: {0: "Woodworking"}, 
        description: "Turning wood logs into something useful",
        category: skill_category_crafting,
        parent_skill: "Crafting mastery",
        base_xp_cost: 40,
        xp_scaling: 1.5,
        max_level: 60,
    });
})();

//defensive skills
(function(){
    skills["Iron skin"] = new Skill({
        category: "Combat",
        names: {0: "Tough skin", 10: "Wooden skin", 20: "Stone skin", 30: "Iron skin"},
        description: "Wearing no protective armor means that your skin keeps getting damaged in combat, which leads to it regenerating over and over to become tougher",
        base_xp_cost: 400,
        xp_scaling: 1.9,
        max_level: 30,
        max_level_bonus: 30,
        get_effect_description: ()=> {
            return `Increases base defense by ${Math.round(character.getTotalLevelBonus("Iron skin"))}`;
        },
        milestones: {
            3: {
                stats: {
                    max_health: {multiplier: 1.01},
                }
            },
            5: {
                stats: {
                    max_health: {multiplier: 1.01},
                    unarmed_power: {flat: 0.4},
                }
            },
            7: {
                stats: {
                    max_health: {multiplier: 1.02},
                },
                xp_multipliers: {
                    "Fortitude": 1.05,
                }
            },
            10: {
                stats: {
                    max_health: {multiplier: 1.02},
                    unarmed_power: {flat: 0.6},
                }
            },
            12: {
                stats: {
                    max_health: {multiplier: 1.02},
                },
                xp_multipliers: {
                    "Fortitude": 1.05,
                }
            },
            15: {
                stats: {
                    max_health: {multiplier: 1.1},
                    unarmed_power: {flat: 1},
                },
            },
            20: {
                stats: {
                    max_health: {multiplier: 1.1},
                },
                xp_multipliers: {
                    Fortitude: 1.2,
                    Persistence: 1.2,
                }
            },
            25: {
                stats: {
                    unarmed_power: {flat: 0.4},
                },
            },
            30: {
                stats: {
                    unarmed_power: {flat: 0.4},
                    max_health: {multiplier: 1.1},
                },
                xp_multipliers: {
                    Fortitude: 1.2,
                    Persistence: 1.2,
                },
            },
        }
    });
    skills["Fortitude"] = new Skill({
        category: "Combat",
        names: {0: "Fortitude"},
        description: "Pretend the wounds are not there",
        base_xp_cost: 200,
        xp_scaling: 1.6,
        max_level: 60,
        max_level_coefficient: 4,
        get_effect_description: ()=> {
            return `Multiplies max health by ${Math.round(100*character.getTotalSkillCoefficient({scaling_type: "multiplicative", skill_id: "Fortitude"}))/100}`;
        },
        milestones: {
            3: {
                stats: {
                    max_health: {multiplier: 1.01},
                }
            },
            5: {
                stats: {
                    defense: {flat: 1},
                },
                xp_multipliers: {
                    "Iron skin": 1.05,
                }
            },
            7: {
                stats: {
                    max_health: {multiplier: 1.02},
                }
            },
            10: {
                stats: {
                    defense: {flat: 1},
                },
                xp_multipliers: {
                    "Iron skin": 1.05,
                }
            },
            12: {
                stats: {
                    max_health: {multiplier: 1.02},
                }
            },
            15: {
                stats: {
                    max_health: {multiplier: 1.05},
                }
            },
            20: {
                stats: {
                    max_health: {multiplier: 1.02},
                },
                xp_multipliers: {
                    "Iron skin": 1.2,
                    Persistence: 1.2,
                }
            },
            25: {
                stats: {
                    defense: {flat: 1},
                },
            },
            30: {
                xp_multipliers: {
                    Persistence: 1.1,
                },
            },
            35: {
                xp_multipliers: {
                    "Iron skin": 1.1,
                },
            },
            40: {
                xp_multipliers: {
                    Persistence: 1.1,
                },
            },
            45: {
                stats: {
                    defense: {flat: 1},
                    max_health: {multiplier: 1.05},
                },
            },
            50: {
                xp_multipliers: {
                    Persistence: 1.1,
                },
            },
            55: {
                xp_multipliers: {
                    "Iron skin": 1.1,
                },
            },
            60: {
                stats: {
                    max_health: {multiplier: 1.05},
                    defense: {flat: 1},
                },
                xp_multipliers: {
                    "Iron skin": 1.2,
                    Persistence: 1.2,
                },
            },
        }
    });
})();

//character skills and resistances
(function(){
    skills["Persistence"] = new Skill({
        names: {0: "Persistence"},
        description: "Do not give up, no matter what",
        flavour_text: "Believe in me that believes in you!",
        base_xp_cost: 60,
        category: "Character",
        max_level: 30,
        get_effect_description: ()=> {
            return `Increases low stamina stat multiplier to x${(50+Math.round(character.getTotalLevelBonus("Persistence")*100000)/1000)/100} (originally x0.5)`;
        },
        milestones: {
            2: {
                stats: {
                    max_stamina: {flat: 5},
                },
                xp_multipliers: {
                    all_skill: 1.05,
                }
            },
            4: {
                stats: {
                    max_stamina: {flat: 5},
                },
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            6: {
                stats: {
                    max_stamina: {flat: 10},
                    heat_tolerance: {flat: 1},
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    all: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            8: {
                stats: {
                    max_stamina: {flat: 10},
                },
                xp_multipliers: {
                    all: 1.05,
                }
            },
            10: {
                stats: {
                    max_stamina: {multiplier: 1.1},
                },
                xp_multipliers: {
                    hero: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            12: {
                stats: {
                    max_stamina: {flat: 10},
                    heat_tolerance: {flat: 1},
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            15: {
                stats: {
                    stamina_efficiency: {multiplier: 1.1},
                },
                xp_multipliers: {
                    all_skill: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            20: {
                stats: {
                    stamina_efficiency: {multiplier: 1.1},
                    max_stamina: {flat: 10},
                    heat_tolerance: {flat: 1},
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    all: 1.1,
                }
            },
            25: {
                stats: {
                    max_stamina: {flat: 5},
                    heat_tolerance: {flat: 1},
                    cold_tolerance: {flat: 1},
                },
            },
            30: {
                stats: {
                    max_stamina: {multiplier: 1.1},
                },
                xp_multipliers: {
                    all_skill: 1.2,
                    hero: 1.2,
                    all: 1.2,
                },
            },
        },
        max_level_bonus: 0.3
    });
    skills["Perception"] = new Skill({
        names: {0: "Perception"}, 
        description: "A better grasp on your senses allows you to notice small and hidden things, as well as to discern the true nature of what you observe",
        base_xp_cost: 100,
        visibility_treshold: 80,
        xp_scaling: 1.8,
        max_level: 40,
        category: "Character",
        get_effect_description: ()=> {
            return `Increases critical hit chance by ${Math.min(skills["Perception"].max_level, character.getTotalSkillLevel("Perception"))} points`;
        },
        milestones: {
            1: {
                stats: {
                    intuition: {flat: 2},
                    dexterity: {flat: 2},
                },
                xp_multipliers: {
                    all: 1.05,
                }
            },
            3: {
                stats: {
                    intuition: {flat: 2},
                    dexterity: {flat: 2},
                    crit_multiplier: {flat: 0.1},
                },
            },
            5: {
                xp_multipliers: {
                    Herbalism: 1.1,
                    Fishing: 1.1,
                }
            },
            7: {
                stats: {
                    intuition: {flat: 2},
                    dexterity: {multiplier: 1.1},
                    crit_multiplier: {flat: 0.1},
                },
            },
            10: {
                xp_multipliers: {
                    Herbalism: 1.2,
                    Fishing: 1.2,
                    hero: 1.1,
                }
            },
            15: {
                stats: {
                    intuition: {flat: 5},
                    dexterity: {multiplier: 1.1},
                    crit_multiplier: {flat: 0.2},
                },
            },
            20: {
                xp_multipliers: {
                    Herbalism: 1.2,
                    Fishing: 1.2,
                    hero: 1.2,
                },
                stats: {
                    intuition: {flat: 10},
                    dexterity: {multiplier: 1.1},
                    crit_multiplier: {flat: 0.2},
                },
            },
            25: {
                stats: {
                    intuition: {flat: 2},
                    dexterity: {flat: 2},
                    crit_multiplier: {flat: 0.1},
                },
            },
            30: {
                stats: {
                    intuition: {flat: 2},
                    crit_multiplier: {flat: 0.1},
                },
            },
            35: {
                stats: {
                    intuition: {flat: 2},
                    crit_multiplier: {flat: 0.1},
                },
                xp_multipliers: {
                    all: 1.1,
                },
            },
            40: {
                stats: {
                    intuition: {flat: 2},
                    crit_multiplier: {flat: 0.1},
                    dexterity: {multiplier: 1.1},
                },
                xp_multipliers: {
                    all: 1.2,
                    Herbalism: 1.2,
                    Fishing: 1.2,
                },
            },
        }
    });
    skills["Literacy"] = new Skill({
        names: {0: "Literacy"}, 
        description: "Ability to read and understand written text",
        category: "Character",
        base_xp_cost: 120,
        max_level: 10,
        xp_scaling: 2,
        milestones: {
            1: {
                xp_multipliers: {
                    hero: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            2: {
                xp_multipliers: {
                    all_skill: 1.05,
                }
            },
            3: {
                xp_multipliers: {
                    all: 1.05,
                }
            },
            5: {
                xp_multipliers: {
                    hero: 1.05,
                    "Strength of mind": 1.05,
                }
            },
            6: {
                xp_multipliers: {
                    hero: 1.1,
                },
            },
            8: {
                xp_multipliers: {
                    "Strength of mind": 1.1,
                },
            },
            10: {
                xp_multipliers: {
                    hero: 1.2,
                    "Strength of mind": 1.2,
                    all_skill: 1.2,
                },
            },
        }
    });
    skills["Medicine"] = new Skill({
        names: {0: "Medicine"}, 
        description: "Create better medicaments and improve your skill at treating wounds",
        category: "Character",
        max_level: 30,
        visibility_treshold: 5,
        max_level_coefficient: 2,
        get_effect_description: ()=> {
            let value = character.getTotalSkillCoefficient({skill_id:"Medicine",scaling_type:"multiplicative"});
            return `Multiplies additive effects of medicines by ${Math.round((value**2)*100)/100} and multiplicative effects by ${Math.round(value*100)/100}`;
        },
    });
    skills["Poison resistance"] = new Skill({
        names: {0: "Poison resistance"}, 
        description: "As your body suffers from poisons more and more, it slowly builds up a resistance to them",
        category: "Character",
        max_level: 30,
        visibility_treshold: 5,
        max_level_coefficient: 10,
        get_effect_description: ()=> {
            let value = character.getTotalSkillCoefficient({skill_id:"Poison resistance",scaling_type:"multiplicative"});
            return `Divides effects of poisons by ${Math.round(value*100)/100}`;
        },
        milestones: {
            3: {
                xp_multipliers: {
                    Fortitude: 1.05,
                    Persistence: 1.05,
                }
            },
            5: {
                stats: {
                    max_health: {
                        flat: 20,
                    }
                },
                xp_multipliers: {
                    Regeneration: 1.1,
                }
            },
            7: {
                stats: {
                    health_regeneration_flat: {
                        flat: 0.1,
                    }
                }
            },
            10: {
                stats: {
                    max_stamina: {
                        flat: 20,
                    },
                },
                xp_multipliers: {
                    Fortitude: 1.1,
                    Persistence: 1.1,
                }
            },
            12: {
                stats: {
                    health_regeneration_flat: {
                        flat: 0.1,
                    }
                },
                xp_multipliers: {
                    Regeneration: 1.1,
                }
            },
            15: {
                xp_multipliers: {
                    Fortitude: 1.1,
                    Persistence: 1.1,
                }
            },
            20: {
                stats: {
                    max_stamina: {
                        multiplier: 1.1,
                    },
                    max_health: {
                        multiplier: 1.1,
                    }
                },
                xp_multipliers: {
                    Fortitude: 1.2,
                    Persistence: 1.2,
                }
            },
            25: {
                stats: {
                    max_health: {flat: 20},
                    max_stamina: {flat: 20},
                    health_regeneration_flat: {flat: 0.1},
                },
            },
            30: {
                stats: {
                    max_stamina: {multiplier: 1.1},
                    max_health: {flat: 20},
                },
                xp_multipliers: {
                    Fortitude: 1.2,
                    Persistence: 1.2,
                    Regeneration: 1.2,
                },
            },
        }
    });
    skills["Gluttony"] = new Skill({
        names: {0: "Gluttony"}, 
        description: "The more you eat the better you will be at digesting, right?",
        category: "Character",
        max_level: 30,
        visibility_treshold: 5,
        max_level_coefficient: 2,
        get_effect_description: ()=> {
            let value = character.getTotalSkillCoefficient({skill_id:"Gluttony",scaling_type:"multiplicative"});
            return `Multiplies additive effects of foods by ${Math.round((value**2)*100)/100} and multiplicative effects by ${Math.round(value*100)/100}`;
        },
        milestones: {
            3: {
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            5: {
                stats: {
                    max_health: {
                        flat: 20,
                    }
                },
                xp_multipliers: {
                    "Regeneration": 1.1,
                }
            },
            7: {
                stats: {
                    health_regeneration_flat: {
                        flat: 0.1,
                    }
                }
            },
            10: {
                stats: {
                    stamina_regeneration_flat: {
                        flat: 0.1,
                    },
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    hero: 1.05,
                }
            },
            12: {
                stats: {
                    health_regeneration_flat: {
                        flat: 0.2,
                    }
                },
                xp_multipliers: {
                    "Regeneration": 1.1,
                }
            },
            15: {
                xp_multipliers: {
                    Regeneration: 1.1,
                    Weightlifting: 1.1,
                    Running: 1.1,
                    Climbing: 1.1,
                    Swimming: 1.1,
                }
            },
            20: {
                stats: {
                    stamina_regeneration_flat: {
                        flat: 0.2,
                    },
                    cold_tolerance: {flat: 1},
                },
                xp_multipliers: {
                    hero: 1.1,
                    Regeneration: 1.2,
                }
            },
            25: {
                stats: {
                    max_health: {flat: 20},
                    cold_tolerance: {flat: 1},
                    health_regeneration_flat: {flat: 0.1},
                    stamina_regeneration_flat: {flat: 0.1},
                },
            },
            30: {
                stats: {
                    max_health: {flat: 20},
                },
                xp_multipliers: {
                    hero: 1.2,
                    Regeneration: 1.2,
                    Weightlifting: 1.2,
                },
            },
        }
    });
    skills["Breathing"] = new Skill({
        names: {0: "Breathing"},
        description: "Oxygen is the most important resource for improving the performance of your body. Learn how to take it in more efficiently",
        flavour_text: "You are now breathing manually",
        base_xp_cost: 400,
        visibility_treshold: 390,
        xp_scaling: 1.6,
        category: "Character",
        max_level_coefficient: 2,
        max_level: 40,
        milestones: {
            3: {
                xp_multipliers: {
                    Running: 1.1,
                    Meditation: 1.1,
                },
                stats: {
                    attack_speed: {
                        multiplier: 1.02,
                    }
                }
            },
            5: {
                stats: {
                    agility: {
                        multiplier: 1.05,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    },
                },
            },
            7: {
                xp_multipliers: {
                    Running: 1.1,
                    Meditation: 1.1,
                },
                stats: {
                    stamina_regeneration_flat: {
                        flat: 0.1,
                    }
                }
            },
            10: {
                stats: {
                    strength: {
                        multiplier: 1.05
                    },
                    max_stamina: {
                        multiplier: 1.05,
                    },
                    attack_speed: {
                        multiplier: 1.02,
                    }
                },
            },
            12: {
                stats: {
                    strength: {
                        flat: 2
                    },
                    agility: {
                        flat: 2
                    },
                },
                xp_multipliers: {
                    Running: 1.1,
                    Meditation: 1.1,
                }
            }, 
            15: {
                xp_multipliers: {
                    Running: 1.1,
                    Meditation: 1.1,
                },
                stats: {
                    attack_speed: {
                        multiplier: 1.02,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    },
                    stamina_regeneration_flat: {
                        flat: 0.1,
                    }
                }
            },
            20: {
                xp_multipliers: {
                    category_Activity: 1.2,
                },
                stats: {
                    attack_speed: {
                        multiplier: 1.02,
                    },
                    stamina_efficiency: {
                        multiplier: 1.05,
                    }
                }
            },
            25: {
                stats: {
                    strength: {flat: 2},
                    agility: {flat: 2},
                    stamina_regeneration_flat: {flat: 0.1},
                },
            },
            30: {
                xp_multipliers: {
                    Meditation: 1.1,
                },
            },
            35: {
                xp_multipliers: {
                    Running: 1.1,
                },
            },
            40: {
                stats: {
                    agility: {multiplier: 1.05},
                    strength: {flat: 2},
                },
                xp_multipliers: {
                    Running: 1.2,
                    Meditation: 1.2,
                    category_Activity: 1.2,
                },
            },
        },
        get_effect_description: ()=> {
            let value = character.getTotalSkillCoefficient({skill_id:"Breathing",scaling_type:"multiplicative"});
            return `Multiplies strength, agility and stamina by ${Math.round(value*100)/100}. Reduces thin air effects`;
          },
    });  
    skills["Regeneration"] = new Skill({
                                names: {0: "Regeneration"}, 
                                description: "As your body regenerates more and more, it slowly becomes more proficient in this task",
                                get_effect_description: ()=>{
                                    return `Multiplies health restored when resting or sleeping by ${Math.round(100*(1 + 3*character.getTotalSkillLevel("Regeneration")/skills["Regeneration"].max_level))/100}`;
                                },
                                base_xp_cost: 1000,
                                visibility_treshold: 500,
                                xp_scaling: 1.5,
                                category: "Character",
                                max_level: 40,
                                max_level_coefficient: 2.5,    
                                milestones: {
                                    1: {
                                        stats: {
                                            health_regeneration_flat: {
                                                flat: 0.1,
                                            }
                                        }
                                    },
                                    3: {
                                        stats: {
                                            max_health: {
                                                flat: 20,
                                            }
                                        }
                                    },
                                    5: {
                                        stats: {
                                            health_regeneration_flat: {
                                                flat: 0.1,
                                            }
                                        }
                                    },
                                    7: {
                                        stats: {
                                            max_health: {
                                                flat: 20,
                                            }
                                        }
                                    },
                                    10: {
                                        stats: {
                                            max_health: {
                                                flat: 20,
                                            },
                                            health_regeneration_flat: {
                                                flat: 0.2,
                                            }
                                        }
                                    },
                                    12: {
                                        stats: {
                                            max_health: {
                                                flat: 20,
                                            },
                                        }
                                    },
                                    15: {
                                        stats: {
                                            health_regeneration_flat: {
                                                flat: 0.3,
                                            },
                                            max_health: {
                                                flat: 40,
                                            },
                                        }
                                    },
                                    20: {
                                        stats: {
                                            max_health: {
                                                multiplier: 1.1,
                                            }
                                        },
                                        xp_multipliers: {
                                            "Iron skin": 1.2,
                                            Fortitude: 1.2,
                                        }
                                    },
                                    25: {
                                        stats: {
                                            max_health: {flat: 20},
                                            health_regeneration_flat: {flat: 0.1},
                                        },
                                    },
                                    30: {
                                        stats: {
                                            max_health: {flat: 20},
                                            health_regeneration_flat: {flat: 0.1},
                                        },
                                    },
                                    35: {
                                        stats: {
                                            max_health: {flat: 20},
                                            health_regeneration_flat: {flat: 0.1},
                                        },
                                        xp_multipliers: {
                                            "Iron skin": 1.1,
                                        },
                                    },
                                    40: {
                                        stats: {
                                            max_health: {multiplier: 1.1},
                                            health_regeneration_flat: {flat: 0.1},
                                        },
                                        xp_multipliers: {
                                            "Iron skin": 1.2,
                                            Fortitude: 1.2,
                                        },
                                    },
                                }
    });  
})();

//miscellaneous skills
(function(){
    skills["Haggling"] = new Skill({
        names: {0: "Haggling"},
        description: "The art of the deal",
        category: "Character",
        base_xp_cost: 100,
        max_level: 25,
        get_effect_description: ()=> {
            return `Lowers trader cost multiplier to ${Math.round((1 - character.getTotalLevelBonus("Haggling"))*100)}% of original value`;
        },
        max_level_bonus: 0.5,
        milestones: {
            2: {
                stats: {
                    intuition: {
                        flat: 1
                    },
                },
            },
            3: {
                xp_multipliers: {
                    "Literacy": 1.05,
                },
            },
            5: {
                stats: {
                    intuition: {
                        flat: 2
                    },
                },
                xp_multipliers: {
                    "Literacy": 1.05,
                    "Persistence": 1.05,
                    Perception: 1.05,
                },
            },
            7: {
                stats: {
                    intuition: {
                        flat: 2
                    }
                },
            },
            10: {
                stats: {
                    intuition: {
                        flat: 2
                    },
                },
                xp_multipliers: {
                    Literacy: 1.05,
                    Persistence: 1.05,
                    Perception: 1.1,
                },
            },
            15: {
                stats: {
                    intuition: {
                        flat: 5
                    },
                },
                xp_multipliers: {
                    Literacy: 1.1,
                    Persistence: 1.1,
                    Perception: 1.1,
                },
            },
            20: {
                stats: {
                    intuition: {flat: 1},
                },
            },
            25: {
                stats: {
                    intuition: {flat: 1},
                },
                xp_multipliers: {
                    Literacy: 1.2,
                    Persistence: 1.2,
                    Perception: 1.2,
                },
            },
        }
    });
})();

Object.keys(skills).forEach(id => {
    skills[id].skill_id = id;

    availabilities["skill"][id] = skills[id].getAvailabilityComponent();
});

const xp_multipliers = {};
const bonus_levels = {};

Object.keys(skills).forEach(skill => {
    xp_multipliers[skill] = 1;
    bonus_levels[skill] = 0;
});
    
Object.keys(skill_categories).forEach(category => {
    xp_multipliers["category_"+category] = 1;
});

export {
    skills, skill_categories, 
    weapon_type_to_skill, 
    bonus_levels, xp_multipliers,
};
