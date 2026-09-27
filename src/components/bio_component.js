"use strict";

class BioComponent {
    constructor(data) {
        this.age = data.age;
        this.height = data.height;
        this.race = data.race;
        this.gender = data.gender;
    }

    getBio() {
        return {
            age: this.age, 
            height: this.height, 
            race: this.race,
            gender: this.gender,
        }
    }
}

export default BioComponent;