"use strict";

class BioComponent {
    constructor(data) {
        this.age = data.age;
        this.height = data.height;
        this.race = data.race;
    }

    getBio() {
        return {
            age: this.age, 
            height: this.height, 
            race: this.race,
        }
    }
}

export default BioComponent;