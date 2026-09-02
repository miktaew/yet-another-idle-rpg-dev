// @ts-check
"use strict";

/**
 * The guild's board: the work on offer, and the one job taken off it.
 *
 * A `*_display.js` module rather than more of display.js, which is the pattern P-42 measured
 * and the one the five existing splits already followed. It takes nothing back out, so the
 * import is one-way and there is no cycle here.
 *
 * The board itself is state and rules, not drawing: `game_state.guild_board` holds it and
 * `guild_jobs.js` decides what goes on it. This file only renders what those two agree on.
 */

import { language } from "./main.js";
import { game_state } from "./game_state.js";
import { character } from "./character.js";
import { dialogues } from "./data/dialogues.js";
import { item_templates } from "./items.js";
import { translationManager } from "./translation.js";
import { clear_HTML_content, insert_HTML } from "./ui_helpers.js";
import { get_guild_rank } from "./reputation.js";
import { enemy_tag_label } from "./journal_panels.js";
import { accepted_jobs, job_is_done, job_progress, jobs_held_at_once,
         standing_lost_for_giving_up, standing_paid_for } from "./guild_jobs.js";
import { current_game_time } from "./game_time.js";
import { item_sources } from "./world_index.js";
import { locations } from "./data/locations.js";

/**
 * Whether the player knows there is a board.
 *
 * The clerk's own line describes it - *"An escort nobody sane takes. A cellar full of
 * something. Two notices for the same missing dog"* - so the board was in canon before it
 * was in the game, and being told about it is what opens it. That textline's `is_heard` is
 * already saved and already loaded, so this needs no flag of its own: a piece of state that
 * exists is better than a second piece of state that agrees with it.
 */
function board_is_known() {
    return Boolean(dialogues["guild clerk"]?.textlines?.["board"]?.is_heard);
}

/** One job as a sentence: what to do, how hard, and what it pays. */
function job_line(job, standing) {
    /*
        getDisplayName, not getName. getName is the CANONICAL ENGLISH identity - the
        equippable constructors use it as this.id and that id is written into save files -
        and the board printed it, so a Turkish player was asked for "10 Tree sap" while the
        row `"name Tree sap": "Ağaç özsuyu"` had been sitting in the locale all along.
    */
    const target = job.type === "gather"
        ? (item_templates[job.target]?.getDisplayName() ?? job.target)
        : enemy_tag_label(job.target);

    const what = translationManager.getText(language, `ui guild job ${job.type}`,
        {v1: String(job.count), v2: target});
    const difficulty = translationManager.getText(language,
        `ui guild job difficulty ${job.difficulty}`);
    const pays = translationManager.getText(language, "ui guild job pays",
        {v1: String(standing_paid_for(job, standing))});

    return {what, difficulty, pays};
}

/**
 * One row: a job on the board, or one of the jobs being held.
 *
 * `held_at` is the index among the held jobs, or null for a row on the board. That replaced
 * an `index === -1` sentinel, which worked while one job could be held and stops meaning
 * anything when three can - the buttons need to know WHICH job they act on.
 *
 * @param {Object} job
 * @param {Number} index the offered index, for the Take button
 * @param {Object} how {standing, can_take, held_at}
 * @returns {HTMLElement}
 */
function create_guild_job_row(job, index, {standing, can_take, held_at = null}) {
    const row = document.createElement("div");
    row.classList.add("guild_job");

    const rank = document.createElement("div");
    rank.classList.add("guild_job_rank");
    insert_HTML(rank, job.rank);
    row.appendChild(rank);

    const body = document.createElement("div");
    body.classList.add("guild_job_body");

    const {what, difficulty, pays} = job_line(job, standing);

    const brief = document.createElement("div");
    brief.classList.add("guild_job_brief");
    insert_HTML(brief, what);
    body.appendChild(brief);

    const terms = document.createElement("div");
    terms.classList.add("guild_job_terms");
    insert_HTML(terms, `${difficulty} &middot; ${pays}`);
    body.appendChild(terms);

    /*
        Where a fetch is gathered, which is the whole reason this was asked for: a job to
        bring thirty Heavy sand is not a job if the player has no way to find out where sand
        comes from. Read from the world index rather than written down - the same index the
        Discoveries panel answers "where does this come from" with - so it cannot drift from
        where the material actually is.

        Measured before relying on it: all 30 gatherable materials have at least one named
        gather place, so this line is never empty for a job the generator can produce.
    */
    if(job.type === "gather") {
        const places = item_sources(job.target)
            .filter(source => source.kind === "gather")
            .map(source => locations[source.location_key]?.getName())
            .filter(Boolean);
        const unique = [...new Set(places)];
        if(unique.length) {
            const where = document.createElement("div");
            where.classList.add("guild_job_terms");
            insert_HTML(where, translationManager.getText(language, "ui guild job where",
                {v1: unique.join(", ")}));
            body.appendChild(where);
        }
    }

    /*
        And when it is due, on a held job that carries a deadline. Shown as days left rather
        than as the day it falls on, because the player counts in days remaining and the
        calendar is a tab away.
    */
    if(held_at !== null && typeof job.due_on === "number") {
        const left = job.due_on - current_game_time.day_count;
        const due = document.createElement("div");
        due.classList.add("guild_job_terms");
        if(left >= 0) {
            insert_HTML(due, translationManager.getText(language, "ui guild job due",
                {v1: String(left)}));
        } else {
            due.classList.add("guild_job_overdue");
            insert_HTML(due, translationManager.getText(language, "ui guild job overdue"));
        }
        body.appendChild(due);
    }

    //Progress belongs to a held job only. On the board it would be nought every time.
    if(held_at !== null) {
        const progress = document.createElement("div");
        progress.classList.add("guild_job_terms");
        insert_HTML(progress, translationManager.getText(language, "ui guild job progress",
            {v1: String(Math.min(job_progress(job, character.inventory), job.count)),
                v2: String(job.count)}));
        body.appendChild(progress);
    }

    row.appendChild(body);

    /*
        No button at all once a job is held, rather than a disabled one. One at a time is a
        rule and not a failure, and a row of dead buttons reads as the game being broken.
        The reason is said once, above the list, where a reason belongs.
    */
    if(can_take) {
        const take = document.createElement("div");
        take.classList.add("guild_job_take");
        take.setAttribute("onclick", `accept_guild_job(${index})`);
        insert_HTML(take, translationManager.getText(language, "ui guild board take"));
        row.appendChild(take);
    }

    //And the other end of it, on a held job, once it is actually finished.
    if(held_at !== null && job_is_done(job, character.inventory)) {
        const hand_in = document.createElement("div");
        hand_in.classList.add("guild_job_take");
        hand_in.setAttribute("onclick", `hand_in_guild_job(${held_at})`);
        insert_HTML(hand_in, translationManager.getText(language, "ui guild board hand in"));
        row.appendChild(hand_in);
    }

    /*
        And a way out, with the price on the button. A job that cannot be given up is a job
        that can strand the player - which is exactly how this was reported: a fetch for
        something they could not find. The cost is shown rather than confirmed afterwards,
        because a dialog asking "are you sure" tells you less than the number does.
    */
    if(held_at !== null) {
        const cost = standing_lost_for_giving_up(job, standing);
        const give_up = document.createElement("div");
        give_up.classList.add("guild_job_take", "guild_job_give_up");
        give_up.setAttribute("onclick", `give_up_guild_job(${held_at})`);
        insert_HTML(give_up, translationManager.getText(language,
            "ui guild board give up", {v1: String(cost)}));
        row.appendChild(give_up);
    }

    return row;
}

/**
 * Redraws the board.
 *
 * Called when the day turns and when a job is taken, and safe to call when the tab is not
 * open: it writes into a div that is simply not on screen. Rebuilt rather than patched, the
 * way the lore and Discoveries panels are - the whole thing is three rows.
 */
function update_displayed_guild_board() {
    const list = document.getElementById("guild_board_list");
    if(!list) {
        return;
    }
    clear_HTML_content(list);

    if(!board_is_known()) {
        const unknown = document.createElement("div");
        unknown.classList.add("guild_board_note");
        insert_HTML(unknown, translationManager.getText(language, "ui guild board unknown"));
        list.appendChild(unknown);
        return;
    }

    const board = game_state.guild_board;
    const standing = character.reputation["Guild"] ?? 0;
    const {rank} = get_guild_rank(standing);

    const standing_line = document.createElement("div");
    standing_line.classList.add("guild_board_note");
    //The number beside the rank, as asked. The rank alone does not say how close the next
    //one is, and the Data panel is a tab away.
    insert_HTML(standing_line, translationManager.getText(language, "ui guild board standing",
        {v1: `${rank} (${standing})`}));
    list.appendChild(standing_line);

    const held = accepted_jobs(board);
    if(held.length) {
        const heading = document.createElement("div");
        heading.classList.add("guild_board_heading");
        insert_HTML(heading, translationManager.getText(language, "ui guild board taken"));
        list.appendChild(heading);
        held.forEach((job, at) => {
            list.appendChild(create_guild_job_row(job, -1,
                {standing, can_take: false, held_at: at}));
        });

        const how_many = document.createElement("div");
        how_many.classList.add("guild_board_note");
        insert_HTML(how_many, translationManager.getText(language,
            "ui guild board how many held",
            {v1: String(held.length), v2: String(jobs_held_at_once)}));
        list.appendChild(how_many);

        /*
            v0.7.43 said here that the clerk was not taking work in yet. She is, as of
            v0.7.44, so what the note says now is where to take it - which is the thing a
            player who has finished a job actually needs to know.
        */
        const where = document.createElement("div");
        where.classList.add("guild_board_note");
        insert_HTML(where,
            translationManager.getText(language, "ui guild board hand in where"));
        list.appendChild(where);
    }

    const heading = document.createElement("div");
    heading.classList.add("guild_board_heading");
    insert_HTML(heading, translationManager.getText(language, "ui guild board offered"));
    list.appendChild(heading);

    const offered = board?.offered ?? [];
    if(offered.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("guild_board_note");
        insert_HTML(empty, translationManager.getText(language, "ui guild board empty"));
        list.appendChild(empty);
        return;
    }

    const room_left = held.length < jobs_held_at_once;
    offered.forEach((job, index) => {
        list.appendChild(create_guild_job_row(job, index,
            {standing, can_take: room_left}));
    });
}

export { update_displayed_guild_board, board_is_known };
