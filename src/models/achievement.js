"use strict";

import AvailabilityComponent from "../components/availability_component.js";
import NotificationComponent from "../components/notification_component.js";
import { availability_havers } from "../data/component_references.js";


class Achievement {

    #notification;
    #availability;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.bonuses = data.bonuses;
        
        this.#availability = new AvailabilityComponent({is_unlocked: data.is_unlocked});
        this.#notification = new NotificationComponent();
    }

    getAvailabilityComponent() {
        return this.#availability;
    }

    getNotificationComponent() {
        return this.#notification;
    }
}

availability_havers.push(Achievement);


export default Achievement;
