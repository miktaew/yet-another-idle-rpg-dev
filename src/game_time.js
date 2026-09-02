"use strict";

const night_time = {
    start: 20,
    end: 4,
}

function Game_Time(new_time) {
    this.year = new_time.year;
    this.month = new_time.month;
    this.day = new_time.day;
    this.hour = new_time.hour;
    this.minute = new_time.minute;
    this.day_count = new_time.day_count ?? 1;
    //only hours and minutes should be allowed to be 0
    //day_count is purely for calculating day of the week, by default it always start at monday (so day_count = 1)

    this.goUp = function(how_much) {
        this.minute += how_much ?? 1;
        if(this.minute >= 60) {
            const m = this.minute % 60;
            const h = Math.floor(this.minute/60);
            this.minute = m;
            this.hour += h;
        }
    
        if(this.hour >= 24) {
            const h = this.hour % 24;
            const d = Math.floor(this.hour/24);
            this.hour = h;
            this.day += d;
            this.day_count += d;
        }
    
        if(this.day > 30) {
            const d = this.day % 30;
            const m = Math.floor(this.day/30);
            this.day = d;
            this.month += m;
        }
    
        if(this.month > 12) {
            const m = this.month % 12;
            const y = Math.floor(this.month/12);
            this.month = m;
            this.year += y;
        }
    }

    this.goUp(0);
    //just in case someone passes a value that's not exactly correct, in a situation where it won't ever get incremented so it won't automatically fix
    //e.g. in weather when grabbing date for next weather, as a change in month would not be reflected and adding a manual recalculation there would be just stupid

    this.loadTime = function(new_time) {
        this.year = new_time.year;
        this.month = new_time.month;
        this.day = new_time.day;
        this.hour = new_time.hour;
        this.minute = new_time.minute;
        this.day_count = new_time.day_count;
    }

    /**
     * The season, now or at some remove.
     *
     * @param {Number} [day_count] how far in future to check; omitted or 0 returns
     *     the current season. Optional, and the brackets are what say so -
     *     getDateString below has called it with no argument all along.
     * @returns {String}
     */
    this.getSeason = function(day_count) {
        let month;
        if(day_count) {
            month = this.month + Math.floor((this.day + day_count)/30);
        } else {
            month = this.month;
        }

        if(month > 9) return seasons[3];
        else if(month > 6) return seasons[2];
        else if(month > 3) return seasons[1];
        else return seasons[0];
    }

    this.getTimeOfDay = function() {
        if (this.hour >= 21 || this.hour < 4) return "Night";
        else if(this.hour >= 4 && this.hour < 8) return "Dawn";
        else if(this.hour >= 8 && this.hour < 18) return "Day";
        else return "Dusk";
    }
    
    this.getTimeOfDaySimple = function() {
        //changing this also requires changing values in get_current_temperature_smoothed() in weather.js
        if (this.hour >= 21 || this.hour < 4) return "Night";
        else return "Day";
    }

    this.getDayOfTheWeek = function() {
        switch(this.day_count % 7) {
            case 0:
                return "Sun";
            case 1: 
                return "Mon";
            case 2:
                return "Tue";
            case 3: 
                return "Wed";
            case 4:
                return "Thu";
            case 5:
                return "Fri";
            case 6:
                return "Sat";
        }
    }

    //point in the lunar cycle, from 0 to 1
    this.getMoonPhase = function () {
        return this.day_count % 29.5 / 29.5;
    }

    this.getMoonPhaseName = function (phase) {
        const phases = ["Full", "Waning", "New", "Waxing"];
        return phases[Math.floor(phase * phases.length)];
    }

    /*
        The dark quarter, named here rather than at the call site.

        A caller that wants "is it a new moon" would otherwise hold the string "New"
        itself, and the four names live in this file - a fifth copy of one of them
        somewhere else is a copy that can be misspelt without anything noticing, since a
        wrong phase name compares false against every phase there is and reads exactly
        like a window that never opens. It also keeps a trader's derived stock list free
        of literals that are not stock list names, which is what its own check reads.
    */
    this.isNewMoon = function () {
        return this.getMoonPhaseName(this.getMoonPhase()) === "New";
    }
}

Game_Time.prototype.toString = function() {
    let date_string = ((this.day>9?this.day:`0${this.day}`) + "/");
    date_string += ((this.month>9?this.month:`0${this.month}`) + "/");
    date_string += (this.year + " ");
    date_string += ((this.hour>9?this.hour:`0${this.hour}`) + ":");
    date_string += (this.minute>9?this.minute:`0${this.minute}`) + ", ";
    date_string += this.getSeason() + ", " + this.getDayOfTheWeek();
    return date_string;
}

/**
 * A duration carried up into whole units: minutes into hours, hours into days, and so on.
 *
 * Split out of format_time so that the arithmetic has one home and the WORDING has
 * another. This file has no imports at all - it is a leaf - and the words have to come
 * from the locale, which lives behind translation.js, which imports main.js, which imports
 * this file. Reaching for the translation layer here would close a cycle through the one
 * module that has none, so the caller does the wording instead.
 *
 * @param {Object} data
 * @param {Object} data.time {minutes, hours, days, months, years}
 * @param {Boolean} [data.round] carry into larger units; false leaves the minutes as given
 * @returns {Object} the same shape, carried
 */
function split_duration({time, round = true}) {
    if(!time) {
        throw "No time passed in arguments!";
    }

    time.minutes = Math.ceil(time.minutes);

    if(round) {
        if(time.minutes >= 60) {
            time.hours = time.hours + Math.floor(time.minutes/60) || Math.floor(time.minutes/60);
            time.minutes = time.minutes % 60;
        }
        if(time.hours >= 24) {
            time.days = time.days + Math.floor(time.hours/24) || Math.floor(time.hours/24);
            time.hours = time.hours % 24;
        }
        if(time.days > 30) {
            time.months = time.months + Math.floor(time.days/30) || Math.floor(time.days/30);
            time.days = time.days % 30;
        }
        if(time.months > 12) {
            time.years = time.years + Math.floor(time.months/12) || Math.floor(time.months/12);
            time.months = time.months % 12;
        }
    }

    return time;
}

/**
 * The short form: 2D15h22m.
 *
 * A letter per unit and no words, which is why this one can stay in a file with no access
 * to the locale. The long form used to live here too, behind a `long_names` flag, and it
 * built "day"/"days", "hour"/"hours" and six more into the string - ten English words in
 * `src/`, reaching a Turkish player as the only untranslated thing on the screen (P-29).
 * It is format_duration_in_words in display.js now, where the locale is.
 *
 * @param {Object} data
 * @param {Object} data.time {minutes, hours, days, months, years}
 * @returns {String}
 */
function format_time({time, round=true}) {
    const carried = split_duration({time, round});

    let formatted_time = '';
    if(carried.years > 0) {
        formatted_time += `${carried.years}Y`;
    }
    if(carried.months > 0) {
        formatted_time += `${carried.months}M`;
    }
    if(carried.days > 0) {
        formatted_time += `${carried.days}D`;
    }
    if(carried.hours > 0) {
        formatted_time += `${carried.hours}h`;
    }
    if(carried.minutes > 0) {
        formatted_time += `${carried.minutes}m`;
    }

    return formatted_time;
}

function is_night(time) {
    time = time || current_game_time;
    return (time.hour >= night_time.start || time.hour < night_time.end);
}

const seasons = ["Spring","Summer","Autumn","Winter"];

const current_game_time = new Game_Time({year: 999, month: 4, day: 1, hour: 8, minute: 0, day_count: 1});

export {current_game_time, format_time, split_duration, is_night, seasons, Game_Time, night_time};