"use strict";

const equipments = {};

//extended by Trader and Person (with Person having up to two Inventories, one directly and one via Trader component)
class EquipmentComponent {
    
    constructor() {
        this.contents = {};
    }

}

export default EquipmentComponent;
export { equipments };
