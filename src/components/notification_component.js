"use strict";

import { availability_havers } from "../data/component_references.js";
import AvailabilityComponent from "./availability_component.js";

class NotificationComponent {
    #availability;
    constructor({is_unlocked, is_finished} = {}) {
        this.#availability = new AvailabilityComponent({is_unlocked, is_finished});
    }
}

availability_havers.push(NotificationComponent);

export default NotificationComponent;
