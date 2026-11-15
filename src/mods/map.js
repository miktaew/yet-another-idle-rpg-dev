"use strict";

import { locations } from "../data/locations.js";
import { CombatZone } from "../models/location.js";

class MapNode {
    x;
    y;
    location;
}


let ctx;

const map_nodes = {};
const map_bounds = { min_x: 0, max_x: 0, min_y: 0, max_y: 0 };

const show_combat = true;

function draw_map() {
    const map_labels = document.getElementById('map_labels');

    const canvas = document.getElementById('map_canvas');
    ctx = canvas.getContext('2d');

    //ctx.beginPath();
    //ctx.moveTo(250, 30);
    //ctx.lineTo(50, 250);
    //ctx.stroke();

    let pos_x = 1500;
    let pos_y = 1500;

    //skip Combat Areas
    let location_list = Object.values(locations).filter(x => (show_combat || x instanceof Location));

    draw_location(location_list[0], pos_x, pos_y, 180);
}

function draw_location(location, x, y, angle) {

    let is_combat = location instanceof CombatZone

    if (!is_combat) {
        mark_location(x, y);
    }
    else {
        mark_combat_location(x, y);
    }

    const label = document.createElement("div");
    label.className = "map_label";
    label.innerText = location.name;
    label.style.left = x + "px";
    label.style.top = y + "px";
    map_labels.appendChild(label);

    map_nodes[location.id] = {
        x: x,
        y: y,
        location: location
    };

    map_bounds.min_x = Math.min(map_bounds.min_x, x);
    map_bounds.min_y = Math.min(map_bounds.min_y, y);
    map_bounds.max_x = Math.max(map_bounds.max_x, x);
    map_bounds.max_y = Math.max(map_bounds.max_y, y);


    if (location.connected_locations) {
        let i = 0;
        let next_angle = angle - 135;
        for (let connection of location.connected_locations) {

            if (!show_combat && !(connection.location instanceof Location)) {
                continue;
            }

            let next_is_combat = connection.location instanceof CombatZone;


            if (!map_nodes[connection.location.id]) {
                i++;
                if (connection.azimuth) {
                    next_angle = (connection.azimuth + 360) % 360;
                }
                else {
                    next_angle += (270 / location.connected_locations.length);
                }

                let dist = Math.sqrt(connection.travel_time) * 20 + 60;

                let [next_x, next_y] = circle_pos(dist, next_angle - 90);
                draw_location(connection.location, x + next_x, y + next_y, next_angle);
            }

            if (next_is_combat) {
                draw_combat_connection(map_nodes[location.id], map_nodes[connection.location.id]);
            }
            else {
                draw_map_connection(map_nodes[location.id], map_nodes[connection.location.id]);
            }
        }
    }
}

function circle_pos(r, deg) {
    console.log(r, deg);

    let rad = deg * Math.PI / 180;
    return [r * Math.cos(rad), r * Math.sin(rad)];
}

function mark_location(x, y) {
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2 * Math.PI);
    ctx.stroke();
}

function mark_combat_location(x, y) {
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.stroke();
}

function draw_map_connection(p1, p2) {
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}
function draw_combat_connection(p1, p2) {
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}






export {
    draw_map
    //update_travelogue_entry
};