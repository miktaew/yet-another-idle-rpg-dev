/** Item, effect and recipe tooltips: everything drawn on hover. */

import { language, current_location } from "./main.js";
import { format_money } from "./display.js";
import { effect_templates } from "./active_effects.js";
import { translationManager } from "./translation.js";
import { capitalize_first_letter, insert_HTML } from "./ui_helpers.js";
import { round_item_price, select_outline_class } from "./misc.js";
import { character, get_effect_with_bonuses } from "./character.js";
import { skills } from "./data/skills.js";
import { traders } from "./traders.js";
import { current_trader } from "./trade.js";
import { format_time } from "./game_time.js";
import { Armor, Shield, Weapon, book_stats, getItemRarity, item_log, item_templates,
         rarity_multipliers } from "./items.js";
import { find_recipe_material, get_consumed_quality, get_component_stats, get_recipe_xp_value,
         recipes } from "./crafting_recipes.js";

/*
    format_money is the one name this module takes back out of display.js, and it is
    called inside these functions rather than at module scope - so display.js can be
    part-built when this module is entered and the binding still resolves by the time
    anything asks for it. Every other cycle in src/ is the same shape.
*/

/*
    rarity_colors before rarity_outlines, because the loop below reads it at module
    scope. Cut out of display.js in the other order first, and `const` put
    rarity_colors in its temporal dead zone: Object.keys threw "Cannot convert
    undefined or null to object" and the page came up blank.
*/
const rarity_colors = {
    trash: "#d3d3d3",
    common: "#ffffff",
    uncommon: "#90ee90",
    rare: "#0000ff",
    epic: "#ffc0cb",
    legendary: "#800080",
    mythical: "#ffa500"
}

const rarity_outlines = {};
Object.keys(rarity_colors).forEach(rarity => {
    rarity_outlines[rarity] = select_outline_class(rarity_colors[rarity]);
});



function rarity_label(rarity) {
    return translationManager.getText(language, `ui rarity ${rarity}`);
}

/**
 * Display name for a stat key, e.g. "max_health" -> "health" / "sağlık".
 *
 * The `<stat> long` rows have existed since the race tooltip was translated; six
 * item-tooltip sites and the effect tooltip were building the label out of the key
 * instead, which is why an item read "Attack power" under a Turkish interface.
 */
function stat_label(stat_key) {
    return capitalize_first_letter(translationManager.getText(language, `${stat_key} long`), true);
}

/**
 * The abbreviated form of the same, for inline lists: "+3 hp", "x1.2 agl".
 *
 * This is what stat_names in misc.js held. Its own comment said it could go once
 * everything was translated, and it can: all 29 of its keys have a "<key>" locale
 * row carrying the same abbreviation, so the table was a second copy of the default
 * locale that no translation could reach.
 */
function stat_label_short(stat_key) {
    return translationManager.getText(language, stat_key);
}

/**
 * Display name for what an xp multiplier applies to.
 *
 * Anything that is not one of the three aggregate targets is a skill id, and skills
 * already know their own display name.
 */
function xp_target_label(target_key) {
    if(target_key === "all" || target_key === "hero" || target_key === "all_skill") {
        return translationManager.getText(language, `ui xp target ${target_key}`);
    }
    return capitalize_first_letter(skills[target_key].name(), true);
}

/**
 * If item was obtained at least once, returns its name. If it wasn't, returns "???" instead.
 * @param {String} item_id 
 * @returns 
 */
function obscure_name(item_id) {
    return item_log.is_known(item_id) ? item_templates[item_id].getDisplayName() : "???";
}

function round(number) {
    return +number.toFixed(1);
}

/**
 * @param {Item} item
 * @param {Object} options
 * @param {String} options.class_name
 * @param {Boolean} options.skip_quality
 * @param {Array} options.quality array with 1 or 2 values (1 - show only it, instead of item's; 2 - show start comparison between the two)
 */
function create_item_tooltip(item, options = {}, is_trade = false) {
    let item_tooltip = document.createElement("span");
    item_tooltip.classList.add(options?.class_name || "item_tooltip");
    insert_HTML(item_tooltip, create_item_tooltip_content({item, options, is_trade}));
    return item_tooltip;
}

/**
 * How an equippable compares with whatever is already in its slot.
 *
 * Shown in the shop and in the inventory alike, because that is where the question gets
 * asked. Nothing is shown when the slot is empty - anything beats nothing, and a list in
 * which every line is a gain is noise - nor when the hovered item IS the equipped one.
 *
 * Flat values are a plain difference. Multipliers are a percentage: the gap between
 * x1.02 and x0.99 is not 0.03 of anything a player can act on, it is three per cent more
 * agility, which is what the line says instead.
 *
 * Only differences are listed. A stat that is the same on both is not a decision.
 */
function equipment_comparison(item, quality) {
    if(!item?.equip_slot || !character.equipment) {
        return "";
    }
    const worn = character.equipment[item.equip_slot];
    if(!worn || worn === item) {
        return "";
    }

    const lines = [];
    const round2 = (value) => Math.round(value * 100) / 100;

    const flat_line = (label, mine, theirs) => {
        const delta = round2((mine || 0) - (theirs || 0));
        if(!delta) {
            return;
        }
        const better = delta > 0 ? "comparison_better" : "comparison_worse";
        lines.push(`<br><span class="${better}">${label}: ${delta > 0 ? "+" : ""}${delta}</span>`);
    };

    const multiplier_line = (label, mine, theirs) => {
        const percent = Math.round(((mine || 1) / (theirs || 1) - 1) * 1000) / 10;
        if(!percent) {
            return;
        }
        const better = percent > 0 ? "comparison_better" : "comparison_worse";
        lines.push(`<br><span class="${better}">${label}: ${percent > 0 ? "+" : ""}${percent}%</span>`);
    };

    //The headline number for the slot, whichever one this kind of item has.
    if(item.getAttack && worn.getAttack) {
        flat_line(translationManager.getText(language, "ui label attack"),
            item.getAttack(quality), worn.getAttack());
    } else if(item.getDefense && worn.getDefense) {
        flat_line(translationManager.getText(language, "ui label defense"),
            item.getDefense(quality), worn.getDefense());
    } else if(item.getShieldStrength && worn.getShieldStrength) {
        flat_line(translationManager.getText(language, "ui label block"),
            item.getShieldStrength(quality), worn.getShieldStrength());
    }

    const mine = item.getStats(quality);
    const theirs = worn.getStats();
    for(const stat_key of new Set([...Object.keys(mine), ...Object.keys(theirs)])) {
        const label = stat_label(stat_key);
        if(mine[stat_key]?.flat != null || theirs[stat_key]?.flat != null) {
            flat_line(label, mine[stat_key]?.flat, theirs[stat_key]?.flat);
        }
        if(mine[stat_key]?.multiplier != null || theirs[stat_key]?.multiplier != null) {
            multiplier_line(label, mine[stat_key]?.multiplier, theirs[stat_key]?.multiplier);
        }
    }

    if(lines.length === 0) {
        return "";
    }
    const heading = translationManager.getText(language, "ui compared to equipped");
    return `<br><br><span class="comparison_heading">${heading}</span>` + lines.join("");
}

/**
 * @param {Object} params
 * @param {Item} params.item
 * @param {Object} params.options
 * @param {String} params.options.class_name
 * @param {String} params.options.trader
 * @param {Boolean} params.options.skip_quality
 * @param {Array} params.options.quality array with 1 or 2 values (1 - show only it, instead of item's; 2 - show start comparison between the two)
 */


function create_item_tooltip_content({item, options={}, is_trade = false}) {
    let item_tooltip = "";

    //different function used depending if its in trade (oh the horror...)
    const value_function = is_trade?"getValue":"getBaseValue";
    
    item_tooltip = `<b>${item.getDisplayName()}</b>`;
    if(item.description) {
        item_tooltip += `<br>${item.getDescription()}`;
    }

    /*
        `item.quality &&` was the whole condition, which is right for an item out of the
        inventory and wrong for a recipe's PREDICTION of one: a recipe tooltip is handed
        the shared template, and a template's quality is null for everything that is not
        equipment - equippables happen to default to 100, which is the only reason the
        component recipe tooltip has ever drawn a range at all.

        A caller that passes options.quality is stating that this item will have one, so
        that is now enough on its own. It cannot turn a quality on where nobody asked:
        options.quality is opt-in and item.use_quality still has to agree.
    */
    let show_quality = (item.quality || options?.quality?.[0])
        && !options.skip_quality && item.use_quality;
    let quality = item.quality;
    if (show_quality && options?.quality && options.quality[0]) {
        quality = options.quality[0];
    }

    if(show_quality) {
        if(options?.quality?.length == 2) {
            const outline_class_1 = rarity_outlines[item.getRarity(options.quality[0])];
            const outline_class_2 = rarity_outlines[item.getRarity(options.quality[1])];
                
            item_tooltip += `<br><br><b>${translationManager.getText(language, "ui label quality")}: <span class="${outline_class_1}" style="color: ${rarity_colors[item.getRarity(options.quality[0])]}"> ${options.quality[0]}% </span> - <span class="${outline_class_2}" style="color: ${rarity_colors[item.getRarity(options.quality[1])]}"> ${options.quality[1]}% </span>`;
            item_tooltip += `<br>[<span class="${outline_class_1}" style="color: ${rarity_colors[item.getRarity(options.quality[0])]}">${rarity_label(item.getRarity(options.quality[0]))}</span>-<span class="${outline_class_2}" style="color: ${rarity_colors[item.getRarity(options.quality[1])]}">${rarity_label(item.getRarity(options.quality[1]))}</span>] </b>`;
        } else {
            const outline_class = rarity_outlines[item.getRarity(quality)];
                
            item_tooltip += `<br><br><b class="${outline_class}" style="color: ${rarity_colors[item.getRarity(quality)]}">${translationManager.getText(language, "ui label quality")}: ${quality}% [${rarity_label(item.getRarity(quality))}]</b>`;
        }
    }
    if(item.tags.unique) {
        item_tooltip += `<br><b class="item_unique outline_white">${translationManager.getText(language, "ui label unique")}</b>`;
    }

    //add stats if can be equipped
    if(item.item_type === "EQUIPPABLE") { 
        //Computed into a variable: the content-id scan cannot follow a concatenation
        //and is right to refuse to guess at one.
        const slot_text_id = `ui slot ${item.equip_slot}`;
        item_tooltip += `<br>${translationManager.getText(language, "ui tooltip slot")} <b>${translationManager.getText(language, slot_text_id)}</b>`;
        if(item.equip_slot === "weapon") {
            //items.js calls a hammer a "battle hammer" when it builds the item's own
            //name, and the locale row follows that. The weapon_type stays "hammer".
            const weapon_word = item.weapon_type === "hammer" ? "battle hammer" : item.weapon_type;
            item_tooltip += `<br>${translationManager.getText(language, "ui tooltip weapon type")} <b>${translationManager.getText(language, "weapon type " + weapon_word)}</b>`;
        }

        if(item.components) {
            let component_description = `<br><br><span class="item_component_list">`;
            const components = Object.keys(item.components);

            /*
                getDisplayName rather than .name. This listed the raw registry name, so
                a crafted sword read "[Cheap iron long blade] + [Simple wooden short
                handle]" under a tooltip that was otherwise fully translated. Every
                component has a display name and the `material <x>` / `component <y>`
                rows it resolves were written for exactly this.

                The empty branch printed the SLOT key - "no [handle]" - and those five
                keys had no rows at all.

                Still two components rather than a loop: that is the shape of the data,
                and the author's note about future-proofing is left where it was.
            */
            const component_name = (slot) => {
                const component = item_templates[item.components[slot]];
                return component ? component.getDisplayName() : undefined;
            };

            component_description += `[${component_name(components[0])}]`;
            const second = component_name(components[1]);
            if(!second) {
                component_description += `<br>+<br>${translationManager.getText(language, "ui no component",
                    {v1: translationManager.getText(language, `ui component slot ${components[1]}`)})}`;
            } else {
                component_description += `<br>+<br>[${second}]`;
            }

            component_description += `</span>`;
            item_tooltip += component_description;
        }

        if(show_quality && options?.quality?.length == 2) {
            if(item.getAttack) {
                item_tooltip += 
                    `<br><br>${translationManager.getText(language, "ui label attack")}: ${round(item.getAttack(options.quality[0]))} - ${round(item.getAttack(options.quality[1]))}`;
            } else if(item.getDefense) { 
                item_tooltip += 
                    `<br><br>${translationManager.getText(language, "ui label defense")}: ${round(item.getDefense(options.quality[0]))} - ${round(item.getDefense(options.quality[1]))}`;
            } else if (item.offhand_type === "shield") {
                const block_multiplier = item.tags.ignore_skill ? character.stats.total_multiplier.block_strength : 1;
                item_tooltip += 
                    `<br><br>${translationManager.getText(language, "ui block range", {v1: round(item.getShieldStrength(options.quality[0])*block_multiplier), v2: round(item.getShieldStrength(options.quality[1])*block_multiplier), v3: item.getShieldStrength(options.quality[0]), v4: item.getShieldStrength(options.quality[1])})}`;
            }

            const equip_stats_0 = item.getStats(options.quality[0]);
            const equip_stats_1 = item.getStats(options.quality[1]);
            if(Object.keys(equip_stats_0).length > 0) {
                item_tooltip += `<br>`;
            }
            Object.keys(equip_stats_0).forEach(effect_key => {
                if(equip_stats_0[effect_key].flat != null) {
                    item_tooltip += 
                    `<br>${stat_label(effect_key)}: +${equip_stats_0[effect_key].flat} - ${equip_stats_1[effect_key].flat}`;
                }
                if(equip_stats_0[effect_key].multiplier != null) {
                    item_tooltip += 
                    `<br>${stat_label(effect_key)}: x${equip_stats_0[effect_key].multiplier} - ${equip_stats_1[effect_key].multiplier}`;
                }
            });
        } else {
            if(item.getAttack) {
                item_tooltip += 
                    `<br><br>${translationManager.getText(language, "ui tooltip attack")} ${Math.round(10*item.getAttack())/10}`;
            } else if(item.getDefense) { 
                item_tooltip += 
                `<br><br>${translationManager.getText(language, "ui tooltip defense")} ${Math.round(10*item.getDefense())/10}`;
            } else if(item.offhand_type === "shield") {
                if(item.tags.ignore_skill) {
                    item_tooltip += 
                `<br><br>${translationManager.getText(language, "ui block unaffected", {v1: Math.round(10*item.getShieldStrength())/10})}`;
                } else {
                    item_tooltip += 
                `<br><br>${translationManager.getText(language, "ui block with base", {v1: Math.round(10*item.getShieldStrength()*(character.stats.total_multiplier.block_strength))/10, v2: item.getShieldStrength()})}`;
                }
            }

            const equip_stats = item.getStats();
            if(Object.keys(equip_stats).length > 0) {
                item_tooltip += `<br>`;
            }
            Object.keys(equip_stats).forEach(function(effect_key) {

                if(equip_stats[effect_key].flat != null) {
                    const sign = equip_stats[effect_key].flat > 0?"+":"";
                        item_tooltip +=
                    `<br>${stat_label(effect_key)}: ${sign}${equip_stats[effect_key].flat}`;
                }
                if(equip_stats[effect_key].multiplier != null) {
                        item_tooltip +=
                    `<br>${stat_label(effect_key)}: x${equip_stats[effect_key].multiplier}`;
                    }
                });
        }
        const equip_bonus_skill_levels = item.getBonusSkillLevels();
        if(Object.keys(equip_bonus_skill_levels).length > 0) {
            item_tooltip += `<br>`;
        }
        Object.keys(equip_bonus_skill_levels).forEach(skill_key => {
            if(skill_key.includes("category_")) {
                item_tooltip +=  `<br>${translationManager.getText(language, "ui bonus skill category level", {v1: translationManager.getDisplayName(language, skill_key), v2: equip_bonus_skill_levels[skill_key]})}`;
            } else {
                item_tooltip += `<br>${translationManager.getText(language, "ui bonus skill level", {v1: skills[skill_key].name(), v2: equip_bonus_skill_levels[skill_key]})}`;
            }
        });

        /*
            A quality RANGE - a trader's stock shown as "92% - 116%" - has no single item
            to compare against, so the comparison is skipped there rather than silently
            picking one end of the range.
        */
        if(!(show_quality && options?.quality?.length == 2)) {
            item_tooltip += equipment_comparison(item, options?.quality?.[0]);
        }
    }

    if (item.component_stats) {
        if(item.component_tier) {
            item_tooltip += `<br><br>${translationManager.getText(language, "ui label component tier")}: ${item.component_tier}`;
        }
        if(Object.keys(item.component_stats).length > 0 || item?.attack_value !== 0 || item?.attack_multiplier !== 1 || item?.defense_value !== 0) {
            item_tooltip += `<br><br>${translationManager.getText(language, "ui label basic stats")}: `;
        }
        if(item?.attack_value) {
            item_tooltip += `<br>${translationManager.getText(language, "ui label attack power")}: +${item.attack_value}`;
        }
        if(item?.attack_multiplier && item.attack_multiplier !== 1) {
            item_tooltip += `<br>${translationManager.getText(language, "ui label size attack power")}: x${item.attack_multiplier}`;
        }
        if(item?.defense_value) {
            item_tooltip += `<br>${translationManager.getText(language, "ui label defense")}: +${item.defense_value}`;
        }

        Object.keys(item.component_stats).forEach(function(effect_key) {
            if(item.component_stats[effect_key].flat != null) {
                const sign = item.component_stats[effect_key].flat > 0?"+":"";
                item_tooltip += 
                `<br>${stat_label(effect_key)}: ${sign}${item.component_stats[effect_key].flat}`;
            }
            if(item.component_stats[effect_key].multiplier != null) {
                item_tooltip += 
                `<br>${stat_label(effect_key)}: x${item.component_stats[effect_key].multiplier}`;
            }
        });
    }

    if(item?.base_size) {
        item_tooltip += `<br><br>${translationManager.getText(language, "ui item size", {v1: item.getSize()})}`;
    }

    if (item.effects?.length > 0) {
        item_tooltip += "<br><br>" + translationManager.getText(language, "ui tooltip effects") + " "

        for (let i = 0; i < item.effects.length; i++) {
            item_tooltip += create_effect_tooltip({ effect_name: item.effects[i].effect, duration: item.effects[i].duration, add_bonus: true }).outerHTML;
        }
    }

    if (item.item_type === "BOOK") {
        if(!book_stats[item.name].is_finished) {
            item_tooltip += `<br><br>${translationManager.getText(language, "ui time to read", {v1: item.getRemainingTime()})}`;
        }
        else {
            item_tooltip += `<br><br>${translationManager.getText(language, "ui reading provided", {v1: character.name})}`;
            if(Object.keys(book_stats[item.name].bonuses).length > 0) {
                item_tooltip += `<br>- ${format_book_bonuses(book_stats[item.name].bonuses)}`;
            }
            if(book_stats[item.name].rewards?.skills) {
                if(book_stats[item.name].rewards.skills.length == 1) {
                    item_tooltip += `<br>- ${translationManager.getText(language, "ui a new skill")}`;
                } else {
                    item_tooltip += `<br>- ${translationManager.getText(language, "ui new skills")}`;
                }
            }
            if(book_stats[item.name].rewards?.recipes) {
                if(book_stats[item.name].rewards.recipes.length == 1) {
                    item_tooltip += `<br>- ${translationManager.getText(language, "ui a new recipe")}`;
                } else {
                    item_tooltip += `<br>- ${translationManager.getText(language, "ui new recipes")}`;
                }
            }
        }
    }

    if(item.material_type) {
        //material_type is a registry value, so it needs its own row like every other
        //name. Computed into a variable because the content-id scan cannot follow a
        //concatenation.
        const material_text_id = `material type ${item.material_type}`;
        item_tooltip += `<br><br>${translationManager.getText(language, "ui label material type")}: ${translationManager.getText(language, material_text_id)}`;
    }

    if(!item.tags.unique && item.getBaseValue()) {
        if(!options.skip_quality && options?.quality?.length == 2) { 
            //ignore quality, instead use quality passed as param
            item_tooltip += `<br><br>${translationManager.getText(language, "ui label value")}: ${format_money(
            round_item_price(
                item[value_function]({quality:options.quality[0], region:current_location?.market_region})))} - ${format_money(round_item_price(item.getBaseValue({quality:options.quality[1]})
            ))}`;
        } else {
            item_tooltip += `<br><br>${translationManager.getText(language, "ui label value")}: ${format_money(round_item_price(item[value_function]({quality, region:current_location?.market_region, multiplier: ((options && options.trader) ? traders[current_trader].getProfitMargin(current_location.market_region) : 1)})))}`;
            if(item.saturates_market) {
                item_tooltip += ` [${translationManager.getText(language, "ui originally")} ${format_money(round_item_price(item.getBaseValue({quality, region:current_location?.market_region}) * ((options && options.trader) ? traders[current_trader].getProfitMargin(current_location.market_region) : 1) || 1))}]`
            }
        }
    }

    return item_tooltip;
}

/** 
 * @param {Object} item_effect from item effects[]
 */
function create_effect_tooltip({effect_name, duration, add_bonus=false}) {
    const effect = effect_templates[effect_name];
    const tooltip = document.createElement("div");

    let tooltip_html_content = "";

    tooltip.classList.add("active_effect_tooltip");

    const name_span = document.createElement("span");
    name_span.classList.add("active_effect_name");
    insert_HTML(name_span, `'${effect.getName()}' : `);
    const duration_span = document.createElement("span");
    duration_span.classList.add("active_effect_duration");
    duration_span.innerText = ""+ format_time({time: {minutes: duration}});
    const top_div = document.createElement("div");
    top_div.classList.add("active_effect_name_and_duration");
    top_div.appendChild(name_span);
    top_div.appendChild(duration_span);
    tooltip.appendChild(top_div);

    if(effect.description) {
        const description_p = document.createElement("div");
        description_p.classList.add("active_effect_description");
        description_p.innerText = effect.getDescription();
        tooltip.appendChild(description_p);
    }

    const effects_div = document.createElement("div");

    let effects;
    if(add_bonus) {
        effects = get_effect_with_bonuses(effect);
    } else {
        effects = effect.effects;
    }

    for(const [key, stat_value] of Object.entries(effects.stats)) {
        tooltip_html_content += `<br>${capitalize_first_letter(stat_label_short(key), true)}`;
        
        let flat = false;
        if(stat_value.flat) {
            const sign = stat_value.flat > 0? "+":"";
            tooltip_html_content += `: ${sign}${Math.round(100*stat_value.flat)/100}`;
            flat = true;

            
        }
        if(stat_value.multiplier) {
            if(flat) {
                tooltip_html_content += `, x${Math.round(100*stat_value.multiplier)/100}`;
            } else {
                tooltip_html_content += `: x${Math.round(100*stat_value.multiplier)/100}`;
            }
        }
    }

    
    const xp_multipliers = Object.keys(effects.xp_multipliers);
    if(xp_multipliers.length > 0) {
        let name;
        name = xp_target_label(xp_multipliers[0]);
        if(tooltip_html_content) {
            tooltip_html_content += `<br>${translationManager.getText(language, "ui xp gain for", {v1: name, v2: effects.xp_multipliers[xp_multipliers[0]]})}`;
        } else {
            tooltip_html_content = `${translationManager.getText(language, "ui xp gain for", {v1: name, v2: effects.xp_multipliers[xp_multipliers[0]]})}`;
        }
        for(let i = 1; i < xp_multipliers.length; i++) {
            let name;
            name = xp_target_label(xp_multipliers[i]);
            tooltip_html_content += `<br>${translationManager.getText(language, "ui xp gain for", {v1: name, v2: effects.xp_multipliers[xp_multipliers[i]]})}`;
        }
    }

    insert_HTML(tooltip, tooltip_html_content);
    tooltip.appendChild(effects_div);
    return tooltip;
}

function format_book_bonuses(bonuses) {
    let formatted = '';
    if(bonuses.stats) {
        const stats = Object.keys(bonuses.stats);
        
        formatted = `+${bonuses.stats[stats[0]]} ${stat_label_short(stats[0])}`;
        for(let i = 1; i < stats.length; i++) {
            formatted += `, +${bonuses.stats[stats[i]]} ${stat_label_short(stats[i])}`;
        }
    }

    if(bonuses.multipliers) {
        const multipliers = Object.keys(bonuses.multipliers);
        if(formatted) {
            formatted += `, x${bonuses.multipliers[multipliers[0]]} ${stat_label_short(multipliers[0])}`;
        } else {
            formatted = `x${bonuses.multipliers[multipliers[0]]} ${stat_label_short(multipliers[0])}`;
        }

        for(let i = 1; i < multipliers.length; i++) {
            formatted += `, x${bonuses.multipliers[multipliers[i]]} ${stat_label_short(multipliers[i])}`;
        }
    }
    if(bonuses.xp_multipliers) {
        const xp_multipliers = Object.keys(bonuses.xp_multipliers);
        let name;
        name = xp_target_label(xp_multipliers[0]);

        if(formatted) {
            formatted += `, ${translationManager.getText(language, "ui xp gain multiplier", {v1: bonuses.xp_multipliers[xp_multipliers[0]], v2: name})}`;
        } else {
            formatted = `${translationManager.getText(language, "ui xp gain multiplier", {v1: bonuses.xp_multipliers[xp_multipliers[0]], v2: name})}`;
        }
        for(let i = 1; i < xp_multipliers.length; i++) {
            let name;
            name = xp_target_label(xp_multipliers[i]);
            formatted += `, ${translationManager.getText(language, "ui xp gain multiplier", {v1: bonuses.xp_multipliers[xp_multipliers[i]], v2: name})}`;
        }
    }

    return formatted;
}

function create_recipe_tooltip_content({category, subcategory, recipe_id, material, components}) {
    const recipe = recipes[category][subcategory][recipe_id];
    const station_tier = current_location?.crafting?.tiers[category] || 1;
    let tooltip = "";

    if(subcategory === "items") {   //TODO base on result present? class?
        const success_chance = Math.round(100*recipe.get_success_chance(station_tier));
        tooltip += `${translationManager.getText(language, "ui success rate")}: <b><span style="color:${success_chance > 74?"lime":success_chance>49?"yellow":success_chance>24?"orange":"red"}">${success_chance}%</span></b><br><br>${translationManager.getText(language, "ui materials required")}<br>`;
        const found_materials = [];
        for (let i = 0; i < recipe.materials.length; i++) {
            const material = find_recipe_material({material: recipe.materials[i], ignore_stop: true});
            found_materials.push(material);

            //base type
            let main_name = recipe.materials[i].material_type
            ? translationManager.getText(language, "ui any material of type",
                {v1: translationManager.getText(language, "material type " + recipe.materials[i].material_type)})
            : obscure_name(recipe.materials[i].material_id);
            let any_available = recipe.materials[i].count <= material.count;

            tooltip += `<span style="color:${any_available?"lime":"red"}"><b>${main_name} x${material.count}/${recipe.materials[i].count}</b></span><br>`;

            //specific items - either material type, or materials with quality
            if (recipe.materials[i].material_type || (material.items.length > 0 && material.items[0].quality)) {
                let mat_list = "";
                for (let j = 0; j < material.items.length; j++) {
                    let sub_name = material.items[j].item.getDisplayName();
                    mat_list += `<span style="color:${material.items[j].count >= recipe.materials[i].count?"lime":"red"}"><b>${sub_name} x${material.items[j].count || 0}/${recipe.materials[i].count}</b></span><br>`;
                }

                tooltip+=`<div class="crafting_tooltip_mat_list">${mat_list}</div>`;
            }
        }
        const xp_val_1 = get_recipe_xp_value({category, subcategory, recipe_id});
        tooltip += `<br>${translationManager.getText(language, "ui xp value")}: ${xp_val_1}`;

        /*
            What this craft will actually come out at, asked of the same function
            use_recipe rolls from, so the prediction cannot disagree with the result. It
            is undefined for every recipe whose materials carry no quality - nearly all
            of them - and those keep hiding the number the way they always have, because
            for them there is no number.

            Read for one craft: crafting more spends further down the same cheapest-first
            list and can only land between what is shown and what the next stack holds.
        */
        const result_id = recipe.getResult().result_id;
        const input_quality = get_consumed_quality({
            recipe_materials: recipe.materials,
            materials: found_materials,
        });
        const item_result_tier = item_templates[result_id].item_tier;
        const result_options = input_quality
            ? {
                quality: recipe.get_quality_range(
                    item_result_tier ? station_tier - item_result_tier : 0, input_quality),
                anchor_tooltip: true,
            }
            : {skip_quality: true, anchor_tooltip: true};

        tooltip += `<br>${translationManager.getText(language, "ui recipe result")} <br><div class="recipe_result">${create_item_tooltip_content({item: item_templates[result_id], options: result_options})}</div>`;
    } else if(!components) {
        //some component
        let name = obscure_name(material.material_id);

        //TODO maybe allow material type?
        tooltip += `${translationManager.getText(language, "ui material required")}:<br>`;
        if(character.inventory[item_templates[material.material_id].getInventoryKey()]?.count >= material.count) {
            tooltip += `<span style="color:lime"><b>${name} x${character.inventory[item_templates[material.material_id].getInventoryKey()]?.count || 0}/${material.count}</b></span><br>`;
        } else {
            tooltip += `<span style="color:red"><b>${name} x${character.inventory[item_templates[material.material_id].getInventoryKey()]?.count || 0}/${material.count}</b></span><br>`;
        }

        const result_tier = item_templates[material.result_id].component_tier ?? item_templates[material.result_id].item_tier;
        const quality_range = recipe.get_quality_range(station_tier - result_tier);

        const xp_val_1 = get_recipe_xp_value({category, subcategory, recipe_id, material_count: material.count, result_tier: result_tier, rarity_multiplier: rarity_multipliers[getItemRarity(quality_range[0])]});
        const xp_val_2 = get_recipe_xp_value({category, subcategory, recipe_id, material_count: material.count, result_tier: result_tier, rarity_multiplier: rarity_multipliers[getItemRarity(quality_range[1])]});

        tooltip += `<br>${translationManager.getText(language, "ui xp value")}: ${xp_val_1} - ${xp_val_2}<br>`;
        tooltip += `<br>${translationManager.getText(language, "ui recipe result")}<br><div class="recipe_result">${create_item_tooltip_content({item: item_templates[material.result_id], options: {quality: quality_range}})}</div>`;
    } else {
        if (components.length < recipe.components.length) {
            tooltip += `${translationManager.getText(language, "ui recipe result")}<br><div class="recipe_result">${translationManager.getText(language, "ui select one component")}</div>`;
        } else if(components.length == recipe.components.length) {
            let item = "";
            
            if(recipe.item_type === "Weapon") {
                item = new Weapon(
                    {
                        components: {
                            head: components[0].item.id,
                            handle: components[1].item.id,
                        },
                    }
                );
            } else if(recipe.item_type === "Armor") {
                item = new Armor(
                    {
                        components: {
                            internal: components[0].item.id,
                            external: components[1].item.id,
                        },
                    }
                );
            } else if(recipe.item_type === "Shield") {
                item = new Shield(
                    {
                        components: {
                            shield_base: components[0].item.id,
                            handle: components[1].item.id,
                        },
                    }
                );
            } else {
                throw new Error(`Recipe "${category}" -> "${subcategory}" -> "${recipe_id}" has an incorrect item type "${recipe.item_type}"`)
            }

            const component_stats = get_component_stats(components);
            const quality_range = recipe.get_quality_range(station_tier - component_stats.max_tier, component_stats.weighted_quality);

            const xp_val_1 = get_recipe_xp_value({category, subcategory, recipe_id, selected_components: components, rarity_multiplier: rarity_multipliers[getItemRarity(quality_range[0])]});
            const xp_val_2 = get_recipe_xp_value({category, subcategory, recipe_id, selected_components: components, rarity_multiplier: rarity_multipliers[getItemRarity(quality_range[1])]});
            tooltip += `<br>${translationManager.getText(language, "ui xp value")}: ${xp_val_1} - ${xp_val_2}<br>`;
            tooltip += `${translationManager.getText(language, "ui recipe result")}<br><div class="recipe_result">${create_item_tooltip_content({item, options: {quality: quality_range}})}</div>`;
        } else {
            throw new Error(`Somehow recipe "${category}" -> "${subcategory}" -> "${recipe_id}" received more components than there should be (${components.length} instead of ${recipe.components.length})`)
        }
    }

    return tooltip;
}

export {
    rarity_colors,
    rarity_outlines,
    create_effect_tooltip,
    create_item_tooltip,
    create_item_tooltip_content,
    create_recipe_tooltip_content,
    equipment_comparison,
    format_book_bonuses,
    obscure_name,
    rarity_label,
    round,
    stat_label,
    stat_label_short,
    xp_target_label,
};
