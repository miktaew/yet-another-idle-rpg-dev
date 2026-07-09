"use strict";


class StatHaver {
    constructor(data) {
        this.base_stats = {
            max_health: data.max_health || 60,
            health: data.health || 60,
            health_regeneration_flat: data.health_regeneration_flat ?? 0, //in combat
            health_regeneration_percent: data.health_loss_percent ?? 0, //in combat
            health_loss_flat: data.health_loss_flat ?? 0, //despite the name, it's values below 0 that mean actual health loss
            health_loss_percent: data.health_loss_percent ?? 0,
            max_stamina: data.max_stamina ?? 40,
            stamina: data.stamina ?? 40,
            stamina_regeneration_flat: data.stamina_regeneration_flat ?? 0, //in combat
            stamina_regeneration_percent: data.stamina_regeneration_percent ?? 0, //in combat
            stamina_efficiency: data.stamina_efficiency || 0,
            max_mana: data.max_mana ?? 0, //currently useless
            mana: data.mana ?? 0, //currently useless
            mana_regeneration_flat: data.mana_regeneration_flat ?? 0, //in combat //currently useless
            mana_regeneration_percent: data.mana_regeneration_percent ?? 0, //in combat //currently useless
            mana_efficiency: data.mana_efficiency ?? 1, //currently useless
            strength: data.strength ?? 12,
            agility: data.agility ?? 8,
            dexterity: data.dexterity ?? 10,
            intuition: data.intuition ?? 10,
            magic: data.magic ?? 0,
            attack_speed: data.attack_speed || 1,
            crit_rate: data.crit_rate ?? 0.05,
            crit_multiplier: data.crit_multiplier || 1.3,
            attack_power: data.attack_power ?? 0,
            defense: data.defense ?? 0,
            block_strength: data.block_strength ?? 0,
            block_chance: data.block_chance ?? 0,
            evasion_points: data.evasion_points ?? 0, //EP
            attack_points: data.attack_points ?? 0, //AP
            heat_tolerance: data.heat_tolerance ?? 0, //currently useless
            cold_tolerance: data.cold_tolerance ?? 0,
            unarmed_power: data.unarmed_power || 1, //base damage for unarmed, as it has no weapon dmg to scale with
            armor_penetration: data.armor_penetration ?? 0,
        };

        this.stats = {
            full: {...this.base_stats}, 
            total_flat: {},
            total_multiplier: {},
            flat: {
                race: {},
                height: {},
                level: {},
                skills: {},
                equipment: {},
                skill_milestones: {},
                books: {},
                light_level: {},
                environment: {},
            },
            multiplier: {
                race: {},
                height: {},
                skills: {},
                skill_milestones: {},
                equipment: {},
                books: {},
                stance: {},
                light_level: {},
                environment: {},
            },
        };
    }
}


export default StatHaver;