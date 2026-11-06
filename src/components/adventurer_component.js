"use strict";

class GuildMemberComponent {
    constructor({guilds = {}, guild_xp = {}, guild_rank = {}}) {
        this.guilds = guilds; //a bit reduntant since keys from latter two be used instead, but feels a bit more readable
        this.guild_xp = guild_xp;
        this.guild_rank = guild_rank;

        /*
            xp and rep separately?
            xp solely for earning ranks, doesn't carry over, need some X for each subsequent rank (doubling should be fine)
            
        */
    }

    joinGuild({guild_id}) {
        if(this.guilds[guild_id]) {
            return;
        }

        this.guilds[guild_id] = true;
        this.guild_xp[guild_id] = 0
        this.guild_rank[guild_id] = 0;
    }

    getGuilds() {
        return this.guilds;
    }

    belongsToGuild({guild_id}) {
        return this.getGuilds()[guild_id];
    }

    addGuildXP({xp_to_add = 0, guild_id}) {
        if(!this.belongsToGuild({guild_id})) {
            return;
        }

        this.guild_xp[guild_id] += xp_to_add;
    }

    getGuildXP({guild_id}) {
        return this.guild_xp[guild_id];
    }

    increaseGuildRank({target_rank = 0, guild_id}) {
        if(!this.belongsToGuild({guild_id})) {
            return;
        }

        if(this.guild_rank[guild_id] <= target_rank) {
            return;
        }

        this.guild_rank[guild_id] = target_rank;
        this.guild_xp[guild_id] = 0;
    }

    getGuildRank({guild_id}) {
        return this.guild_rank[guild_id];
    }
}