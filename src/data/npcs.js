"use strict";

import { availabilities, talkables } from "./component_references.js";
import { dialogue_owners } from "../components/dialogue_component.js";
import { equipments } from "../components/equipment_component.js";
import { inventories } from "../components/inventory_component.js";
import NPC from "../models/npc.js";
import { levels } from "./component_references.js";
//import { bios } from "../models/person.js";
import { dialogues } from "./dialogues.js";
import { traders } from "./traders.js";

availabilities["person"] = {};
availabilities["dialogue"] = {};
availabilities["textline"] = {};
//availabilities["action"] = {}; //handled in game_action.js
availabilities["trader"] = {};
inventories["trader"] = {};

class NPCRegistryC {
    #npcs = {};

    add(npc_id, npc) {
        this.#npcs[npc_id] = npc;

        const dialogue = npc.getDialogueComponent();

        inventories["person"][npc_id] = npc.getInventoryComponent();
        equipments["person"][npc_id] = npc.getEquipmentComponent();
        levels["person"][npc_id] = npc.getLevelableComponent();
        talkables["person"][npc_id] = dialogue;
        //bios[npc_id] = npc.getBioComponent(); //skipped, there is no need to save NPC bio

        availabilities["person"][npc_id] = npc.getAvailabilityComponent();
        availabilities["dialogue"][npc_id] = dialogue.getAvailabilityComponent();

        Object.keys(dialogue.textlines).forEach(textline_key => {
            availabilities["textline"][npc_id+":"+textline_key] = dialogue.textlines[textline_key].getAvailabilityComponent();
        });

        dialogue_owners[dialogue.name] = npc_id;

        if(npc.tags.trader) {
            inventories["trader"][npc_id] = npc.getTraderComponent().getInventoryComponent();
            availabilities["trader"][npc_id] = npc.getTraderComponent().getAvailabilityComponent();
        }
    }

    get(npc_id) {
        if(!this.#npcs[npc_id]) {
            throw new Error(`No npc with id of "${npc_id}" was found!`);
        }
        return this.#npcs[npc_id];
    }

    getAll() {
        return this.#npcs;
    }
}

const NPCRegistry = new NPCRegistryC();

NPCRegistry.add("villageElder", new NPC({name: "village elder", dialogue: dialogues["village elder"]}));
NPCRegistry.add("villageGuard", new NPC({name: "village guard", dialogue: dialogues["village guard"]}));
NPCRegistry.add("oldCraftsman", new NPC({name: "old craftsman", dialogue: dialogues["old craftsman"]}));
NPCRegistry.add("villageMillers", new NPC({name: "village millers", dialogue: dialogues["village millers"]}));

NPCRegistry.add("suspiciousMan", new NPC({name: "suspicious man", dialogue: dialogues["suspicious man"]}));
NPCRegistry.add("oldWomanOfTheSlums", new NPC({name: "old woman of the slums", dialogue: dialogues["old woman of the slums"]}));

NPCRegistry.add("gateGuard", new NPC({name: "gate guard", dialogue: dialogues["gate guard"]}));
NPCRegistry.add("farmSupervisor", new NPC({name: "farm supervisor", dialogue: dialogues["farm supervisor"]}));
NPCRegistry.add("nekomimiProprietress", new NPC({name: "nekomimi proprietress",dialogue: dialogues["nekomimi proprietress"]}));

NPCRegistry.add("swamplandChief", new NPC({name: "swampland chief", dialogue: dialogues["swampland chief"]}));
NPCRegistry.add("swamplandCook", new NPC({name: "swampland cook", dialogue: dialogues["swampland cook"]}));
NPCRegistry.add("swamplandTailor", new NPC({name: "swampland tailor", dialogue: dialogues["swampland tailor"]}));
NPCRegistry.add("swamplandTanner", new NPC({name: "swampland tanner", dialogue: dialogues["swampland tanner"]}));
NPCRegistry.add("swamplandScout", new NPC({name: "swampland scout", dialogue: dialogues["swampland scout"]}));

NPCRegistry.add("villageTrader", new NPC({name: "village trader", trader: traders["village trader"]}));
NPCRegistry.add("suspiciousTrader", new NPC({name: "suspicious trader", trader: traders["suspicious trader"]}));
NPCRegistry.add("swamplandTrader", new NPC({name: "swampland trader", trader: traders["swampland trader"]}));
NPCRegistry.add("nekomimiTrader", new NPC({name: "nekomimi trader", trader: traders["nekomimi trader"]}));
NPCRegistry.add("catCafeTrader", new NPC({name: "cat cafe trader", trader: traders["cat cafe trader"]}));

export default NPCRegistry;
