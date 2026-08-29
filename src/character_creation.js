"use strict";

import { character } from "./character.js";
import { config } from "./config.js";
import { create_height_tooltip, create_race_tooltip } from "./display.js";
import { capitalize_first_letter, uncapitalize_first_letter } from "./ui_helpers.js";
import { global_flags, language, run } from "./main.js";
import { playable_races } from "./races.js";
import { translationManager } from "./translation.js";


class CharacterCreator {
    constructor() {
        this.race = "";
    }

    fill_creation_panel() {
        Object.values(playable_races).forEach(race => {
            this.create_race_button(race);
        });

        document.getElementById("hero_creation_name_field").value = character.name;
        document.getElementById("hero_creation_panel_confirmation").addEventListener("click", () => this.confirm_hero_creation());

        if(config.use_height_bonuses) {
            document.getElementById("height_selection").querySelector('[data-height="short"]').appendChild(create_height_tooltip("short","height_choice_tooltip"));
            document.getElementById("height_selection").querySelector('[data-height="tall"]').appendChild(create_height_tooltip("tall","height_choice_tooltip"));
        }
    }

    create_race_button(race) {
        const race_button = document.createElement("div");
        race_button.classList.add("race_selection_button");
        race_button.innerText = translationManager.getText(language, race.name);
        race_button.dataset.race_id = race.race_id;

        race_button.addEventListener("click", event => {
            const clicked_element = event.target;
            const targets = Array.from(document.getElementsByClassName("race_selection_button"));
            targets.forEach(target => {
                if(target !== clicked_element) {
                    target.classList.remove("race_selection_button_active");
                } else {
                    target.classList.add("race_selection_button_active");
                    this.race = race.race_id;
                }
            });
        });


        
        if(race.alternative_name) {
            race_button.innerText += `\n(${uncapitalize_first_letter(translationManager.getText(language, race.alternative_name), true)})`;
        }

        race_button.appendChild(create_race_tooltip(race, "race_choice_tooltip"));

        if(race.tags.default) {
            race_button.classList.add("race_selection_button_active");
            document.getElementById("hero_creation_panel_race_default").appendChild(race_button);
        } else if(race.tags.kemonomimi) {
            document.getElementById("hero_creation_panel_race_kemonomimi").appendChild(race_button);
        } else {
            document.getElementById("hero_creation_panel_race_furless").appendChild(race_button);
        }
    }

    /**
     * Rebuilds the parts of the creation panel that hold translated text.
     *
     * The panel is imperative DOM with no data-translation attributes, so
     * translateUI cannot reach it. Without this, a language switch leaves the race
     * names and their tooltips in whatever language the panel was built in - which
     * on a new game is always the default, because fill_creation_panel runs before
     * the player has had any chance to choose one.
     *
     * Only the race buttons and the height tooltips are rebuilt. Re-running
     * fill_creation_panel would instead overwrite whatever name the player has
     * typed and attach a second listener to the confirmation button.
     */
    refresh_language() {
        if(!document.getElementById("hero_creation_panel")) {
            return; //hero already created, or creation skipped by config
        }
        const selection = document.getElementById("hero_creation_panel_race_selection");

        //Read the selection from the DOM rather than this.race: the default race
        //starts out marked active without a click, so this.race stays empty until
        //the player picks something.
        const active_race_id = selection.getElementsByClassName("race_selection_button_active")[0]?.dataset.race_id;

        //Only the buttons go. The three category labels are siblings of theirs and
        //carry data-translation, so translateUI has already handled them.
        Array.from(selection.getElementsByClassName("race_selection_button")).forEach(button => button.remove());
        Object.values(playable_races).forEach(race => this.create_race_button(race));

        if(active_race_id) {
            Array.from(selection.getElementsByClassName("race_selection_button")).forEach(button => {
                button.classList.toggle("race_selection_button_active", button.dataset.race_id === active_race_id);
            });
        }

        if(config.use_height_bonuses) {
            const height_selection = document.getElementById("height_selection");
            Array.from(height_selection.getElementsByClassName("height_choice_tooltip")).forEach(tooltip => tooltip.remove());
            height_selection.querySelector('[data-height="short"]').appendChild(create_height_tooltip("short","height_choice_tooltip"));
            height_selection.querySelector('[data-height="tall"]').appendChild(create_height_tooltip("tall","height_choice_tooltip"));
        }
    }

    confirm_hero_creation() {
        let race = document.getElementsByClassName("race_selection_button_active")[0].dataset.race_id;
        let age = document.getElementById("age_selection").getElementsByClassName("active_selection_button")[0].dataset.age;
        let height = document.getElementById("height_selection").getElementsByClassName("active_selection_button")[0].dataset.height;
        let name = document.getElementById("hero_creation_name_field").value;

        character.personal.race = race;
        character.personal.age = age;
        character.personal.height = height;
        character.name = name;
        document.getElementById("character_name_field").value = name;
        global_flags.is_hero_created = true;

        this.remove_creation_panel();
        run(); //kinda ugly to have it here...
    }

    remove_creation_panel() {
        document.getElementById("hero_creation_panel").remove();
    }
}

const characterCreator = new CharacterCreator();

export { characterCreator };