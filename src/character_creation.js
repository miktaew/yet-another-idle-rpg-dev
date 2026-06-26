"use strict";

import { character } from "./character.js";
import { capitalize_first_letter, create_race_tooltip, uncapitalize_first_letter } from "./display.js";
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
            race_button.innerText += `\n(${uncapitalize_first_letter(translationManager.getText(language, race.alternative_name))})`;
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

    confirm_hero_creation() {
        let race = document.getElementsByClassName("race_selection_button_active")[0].dataset.race_id;
        let age = document.getElementById("age_select").value;
        let height = document.getElementById("height_select").value;
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