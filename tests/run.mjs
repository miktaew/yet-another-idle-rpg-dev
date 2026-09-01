/**
 * Runs every check and reports what they found.
 *
 * These were one file of two thousand lines. The split is by subject - the site, the
 * locale files, display names, content, rewards, items - and the call order below is
 * the order that file used, so the output is unchanged.
 *
 * A check reports through error() and warn() rather than throwing, so one failure
 * does not hide the rest; the exit code comes from whether anything was reported.
 */

import { errors, warnings } from "./lib/report.mjs";
import {
    check_action_branches,
    check_every_enemy_has_a_home,
    check_hidden_tasks_can_be_hinted,
    check_location_collections_assigned_once,
    check_skill_rank_levels,
    check_trader_stock_lists,
    check_actions_can_explain_failure,
    check_content_object_keys,
    check_quest_task_item_sources,
    check_content_is_reachable,
    check_content_text_ids,
    check_global_flags,
    check_location_types,
    check_trader_market_regions,
    check_seasonal_content_is_reachable,
    check_lore_threads_resolve,
} from "./checks/content.mjs";
import {
    check_creation_panel_values,
    check_dialogue_display_names,
    check_enumerable_id_families,
    check_equippable_names_resolve,
    check_equipment_slot_names,
    check_item_display_names,
    check_item_name_collisions,
    check_registry_value_names,
    check_skill_category_names,
    check_trader_display_names,
} from "./checks/display-names.mjs";
import {
    check_base64_is_utf8_safe,
    check_no_english_in_dom,
    check_onclick_names_are_reachable,
    check_journal_panels_are_styled,
    check_seasons_go_through_the_accessor,
} from "./checks/dom-text.mjs";
import { check_components_can_be_made, check_generated_items, check_recipe_item_names } from "./checks/items.mjs";
import {
    check_interpolated_pairs,
    check_locales,
    check_no_placeholder_text,
    check_ui_ids_exist,
    check_no_unused_locale_rows,
    check_translations_have_no_english,
} from "./checks/locales.mjs";
import { check_modules_import_what_they_call } from "./checks/modules.mjs";
import { check_imports_resolve } from "./checks/imports.mjs";
import { check_save_keys_round_trip } from "./checks/save_contract.mjs";
import { check_docs_are_paired, check_thematic_breaks_are_not_headings } from "./checks/docs.mjs";
import { check_no_raw_control_bytes } from "./checks/bytes.mjs";
import { check_effect_tags_match_their_numbers } from "./checks/effects.mjs";
import { check_action_labels_fit_a_button } from "./checks/labels.mjs";
import { check_hints_say_when_they_cannot_point, check_visible_tasks_can_be_finished } from "./checks/quests.mjs";
import {
    check_money_requirements,
    check_nothing_stamps_a_template_quality,
    check_required_items,
    check_reward_keys,
} from "./checks/rewards.mjs";
import {
    check_changelogs_cover_version,
    check_help_map_covers_the_world,
    check_language_switch_repaints,
    check_site,
} from "./checks/site.mjs";

check_site();
check_interpolated_pairs();
check_reward_keys();
check_location_types();
check_content_is_reachable();
check_money_requirements();
check_nothing_stamps_a_template_quality();
check_changelogs_cover_version();
check_help_map_covers_the_world();
check_language_switch_repaints();
await check_locales();
await check_dialogue_display_names();
await check_trader_display_names();
await check_item_display_names();
await check_equipment_slot_names();
await check_no_english_in_dom();
check_onclick_names_are_reachable();
check_journal_panels_are_styled();
await check_base64_is_utf8_safe();
await check_seasons_go_through_the_accessor();
await check_registry_value_names();
await check_skill_category_names();
await check_enumerable_id_families();
await check_equippable_names_resolve();
await check_trader_market_regions();
await check_global_flags();
await check_no_placeholder_text();
await check_translations_have_no_english();
await check_no_unused_locale_rows();
await check_ui_ids_exist();
await check_creation_panel_values();
check_item_name_collisions();
await check_recipe_item_names();
await check_modules_import_what_they_call();
await check_imports_resolve();
await check_save_keys_round_trip();
await check_docs_are_paired();
await check_thematic_breaks_are_not_headings();
await check_no_raw_control_bytes();
await check_effect_tags_match_their_numbers();
await check_action_labels_fit_a_button();
await check_visible_tasks_can_be_finished();
await check_hints_say_when_they_cannot_point();
check_action_branches();
check_every_enemy_has_a_home();
check_hidden_tasks_can_be_hinted();
check_location_collections_assigned_once();
check_skill_rank_levels();
check_trader_stock_lists();
check_seasonal_content_is_reachable();
check_lore_threads_resolve();
check_actions_can_explain_failure();
check_content_object_keys();
check_quest_task_item_sources();
await check_required_items();
await check_content_text_ids();
await check_generated_items();
await check_components_can_be_made();

for (const message of warnings) {
    console.warn(`[check] WARN  ${message}`);
}
for (const message of errors) {
    console.error(`[check] ERROR ${message}`);
}

if (errors.length > 0) {
    console.error(`[check] failed with ${errors.length} error(s).`);
    process.exit(1);
}
console.log(`[check] passed${warnings.length > 0 ? ` with ${warnings.length} warning(s)` : ""}.`);
