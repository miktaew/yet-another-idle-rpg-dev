<!-- doc-source: docs/AGENTS.md  doc-version: 2 -->

# Agent and contributor guide

**This file is canonical.** It is the single source of truth for how to work in
this repository. The root [`AGENTS.md`](../AGENTS.md) is a pointer stub that
exists only because agent harnesses auto-discover it; if the two ever disagree,
this file wins.

Turkish counterpart: [AGENTS.TR.md](AGENTS.TR.md) — translated prose, and it
links back here for the reference tables rather than copying them.

---

## 1. What this repository is

A browser-based text idle RPG, "Yet Another Idle RPG", focused on progression
through skill levelling. Vanilla ES modules bundled with esbuild. No framework,
no runtime dependencies.

It is a **continuation fork** of `miktaew/yet-another-idle-rpg` (upstream also
had a `-dev` repository). Upstream development stopped. Fork base commit:
`e5fba67`.

`HEAD` is unreleased work in progress on `v0.6`, not a release.

Standing project direction, including what may and may not change, is in
[PROPOSALS.md](PROPOSALS.md). Narrative canon is in [STORY.md](STORY.md).

## 2. Commands

| Command | What it does |
| --- | --- |
| `npm install` | Installs the single dependency, esbuild. |
| `npm run serve` | Static server on `127.0.0.1:8080`, **dev mode**. Source edits are live on reload. |
| `npm run build` | Bundles `src/main.js` into `dist/bundle.js`, then assembles the deployable site into `_site/`. |
| `npm run check` | Validates the assembled site and locale key parity. `LOCALE_STRICT=1` makes missing translations fatal. |
| `npm test` | Regression tests for the skill xp model. |
| `npm run serve:site` | Static server on `127.0.0.1:8081` serving `_site/`, to verify the built site in bundle mode. |

Requires Node 22 or newer. `file://` will not work — ES modules need a server.

**Do not run `node build.js`.** It is the inherited upstream builder and it is a
trap: it rewrites the tracked root `index.html` in place, and its bundle-version
regex matches the *commented-out* script tag, so it stamps a dead tag and never
switches the live script. It is deliberately not exposed as an npm script. Use
`npm run build`.

## 3. Dev mode versus bundle mode

This distinction causes more confusion than anything else here.

- The root `index.html` loads `src/main.js`. That is the **dev entry point**, and
  it is deliberate: the game runs on any static server with no build step.
- `npm run build` never modifies the root `index.html`. It rewrites the copy in
  `_site/`, switching it to `dist/bundle.js` and stamping the current version.
- Therefore the `style.css?version=…` string in the root `index.html` is
  **deliberately stale**. Do not "fix" it by hand. Only the `_site/` copy is
  stamped.

Consequence for translations: esbuild resolves the dynamic `import()` in
`src/translation.js` by globbing `locales/` at build time and inlining every
match into the bundle. **A newly added locale file is invisible in bundle mode
until the next build.** Dev mode fetches it at runtime and needs no rebuild. CI
rebuilds on every push, so this only bites local bundle-mode testing.

## 4. Repository shape

Content lives in per-module registries: a `const X = {}` declared at the top of
the file, populated by assignment, and exported.

| Content | File | Registry | Example |
| --- | --- | --- | --- |
| Items | `src/items.js` | `item_templates` | `item_templates["Rat fang"] = new OtherItem({…})` |
| Enemies | `src/enemies.js` | `enemy_templates`, `enemy_killcount` | `enemy_templates["Wolf rat"] = new Enemy({…})` |
| Locations | `src/locations.js` | `locations`, `location_types`, `favourite_locations` | `locations["Village"] = new Location({…})`, `new Combat_zone({…})` |
| Skills | `src/skills.js` | `skills`, `skill_categories` | `skills["Pest killer"] = new Skill({…})` |
| Recipes | `src/crafting_recipes.js` | seven category objects, aggregated into `recipes`; ids stamped by a loop | — |
| Dialogues | `src/dialogues.js` | `dialogues` | `dialogues["village elder"] = new Dialogue({…})` |
| Quests | `src/quests.js` | `quests`, `active_quests` | — |
| Traders | `src/traders.js` | `traders`, `inventory_templates` | — |
| Activities | `src/activities.js` | `activities` | — |
| Stances | `src/combat_stances.js` | `stances` | — |
| Effects | `src/active_effects.js` | `effect_templates` | — |
| Text | `locales/english.js` | merged sections, `export default` | — |

Two files are not what they look like:

- **`src/rewards.js` is documentation, not code.** It is never imported and
  exports nothing. It is the authoritative schema for the `rewards` object used
  by textlines, locations, actions and quests. Read it before writing a reward.
- **`src/mods/glassmaking.js` is dead** and is not wired into the game.

There are also substantial in-code documentation blocks worth reading before
authoring content: the quality-to-rarity table and weapon design philosophy at
the top of `src/items.js`, the quality versus success-rate model at the top of
`src/crafting_recipes.js`, the `connected_locations` shape in `src/locations.js`,
and the all-caps warning at the top of `src/races.js`.

## 5. Save compatibility — the hard rules

**Registry keys are persisted verbatim in save files.** Item ids, location keys,
dialogue and textline keys, skill ids, recipe ids, flag names and activity names
all end up written into the player's save.

Renaming any of them silently breaks existing saves. This is the single easiest
way to do real damage in this codebase.

- `setup_ids()` in `src/items.js` enforces that each template's `id` equals its
  registry key.
- `createInventoryKey()` in `src/items.js` JSON-stringifies the item id, or the
  component id set, into the save key.
- Escape hatches for renames that must happen: `item_mapping` and
  `component_name_mapping` in `src/misc.js`.
- The migration pattern is a version gate using `compare_game_version` from
  `src/misc.js`. There are roughly 25 existing gates in `load()` to copy from.

Because keys are also human-readable display strings, translating a registry key
is the same operation as renaming it. See section 8.

## 6. Version bump

Three places, in this order:

1. `src/game_version.js` — the source of truth, with the `v` prefix.
2. `package.json` — same number, **without** the `v` prefix, hand-synced.
3. `changelog.html` — a new collapsible immediately after `<div id="header">`,
   newest first.

The root `index.html` version strings are **not** touched. See section 3.

## 7. Quality gates

There is no linter and no formatter.

- `npm run check` and `npm test` both run in CI on every push.
- `npm test` covers the skill xp model. It cannot `import` `src/skills.js`
  directly — the circular imports only resolve in the browser — so it reads the
  real source, replaces the import statements with stubs for the three functions
  the `Skill` class uses, and imports that. The code under test is the shipped
  code. Follow the same approach if you add tests for another module, and let the
  harness throw if its assumptions about the source stop holding.
- `Verify_Game_Objects()` is a browser-console tool. It walks most content
  checking property values and cross-references. Call it **after the game has
  booted** — it dereferences the loaded translation table, which only exists once
  `translationManager.init` has run. It documents its own coverage gaps at the
  bottom of `src/verifier.js`; it is neither infallible nor exhaustive.

After any content change: run `npm run check`, then boot the game and call
`Verify_Game_Objects()`.

## 8. Text and translations

**Never hardcode player-facing text in `src/`.** All narrative and UI text
belongs in `locales/<language>.js` behind a string id. Dialogue structure lives
in `src/dialogues.js`; the text those nodes display lives in the locale file.

Rules:

- The locale object is a **flat, single namespace**. `npm run check` depends on
  this; nested objects will not be validated.
- A key present in a translation but absent from `english.js` is an error, always.
  It means a typo or a stale key.
- The `mofu#` prefix selects a racial text variant. A `mofu#` key with no base key
  can never be reached, because lookup falls back from variant to base and never
  the other way around. `npm run check` treats it as an error.
- **Never translate a registry key.** Keys are persisted in saves (section 5).
  Translating display names requires a separate id-to-name layer first; this is
  tracked as an open decision in [PROPOSALS.md](PROPOSALS.md).
- To find the current reference key count, run `npm run check` — it prints
  `[check] english: N keys (reference)`. Do not hardcode the number in docs; it
  moves.

Turkish-specific hazards to watch for when the Turkish locale lands: sentences
assembled by concatenating fragments cannot be translated correctly and need
parameterised templates; and `toUpperCase()` / `toLowerCase()` on display text
must be locale-aware, because Turkish dotted and dotless `i` do not map the way
the default locale assumes.

## 9. Code style

Match the surrounding code. Empirically, that means:

- Four spaces, never tabs.
- Double quotes.
- `"use strict";` as line 1.
- `snake_case` for functions and data fields; `PascalCase` for classes, with
  `Combat_zone` and `Challenge_zone` as existing exceptions; `camelCase` only for
  accessor overrides such as `getName` and `getDescription`.
- Registry keys are human-readable sentence-case strings, not identifiers.
- **Code comments are written in English**, regardless of the language of the
  conversation that produced them.
- Commit subjects are terse and lowercase in the inherited history; new commits
  in this fork use a short imperative summary plus an explanatory body.

## 10. Gotchas

- **Circular imports are pervasive and load-bearing.** Thirteen modules import
  back from `main.js` while `main.js` imports about thirty modules. Do not
  "untangle" them casually; the initialisation order depends on it.
- **Inline HTML handlers need window globals.** Around eighty functions are
  attached to `window` in `main.js` specifically so that `onclick` attributes in
  `index.html` can find them. Any new inline handler must be added there.
- **`src/display.js` writes `onclick` attribute strings** naming functions defined
  in the inline `<script>` at the bottom of `index.html`. Renaming one of those
  fails only when a player clicks, never at load time and never in CI.
- **`character.base_stats` is the authority for valid stat keys**, not the
  `stat_names` map in `src/misc.js`.
- **Deployment identity lives in `config.js`.** `release_ids` drives
  `is_on_dev()` / `is_on_main()`. `is_on_dev()` chooses which `localStorage` key
  holds the save, so pointing `dev` at a live deployment hands every existing
  player an empty save slot. Treat that field as dangerous.
- **`dist/bundle.js` is committed** and is marked `-diff linguist-generated`, so
  it shows as a binary blob in diffs. Regenerate with `npm run build`; never edit
  it.
- Several config switches gate authored-but-disabled content:
  `use_racial_bonuses` and `use_height_bonuses` are both `false`. If you enable
  either, remove the "purely cosmetic" note from the hero creation panel, as the
  comment in `src/config.js` and the warning in `src/races.js` both say.

## 11. Working conventions

- **Documentation is bilingual.** Every `.md` ships as a pair, `NAME.md` and
  `NAME.TR.md`. English is canonical. Update both in the same change; a stale
  half is worse than no translation.
- **Naming:** uppercase base name, uppercase `.TR`, lowercase `.md`. The deploy
  workflow's `paths-ignore` uses a case-sensitive `**.md`, so a `.MD` extension
  would defeat it and trigger pointless rebuilds.
- **Push directly to the default branch** (`master`). The Pages deploy only
  triggers there, so a side branch silently skips deployment.
- **Record work.** New directives become numbered proposals in
  [PROPOSALS.md](PROPOSALS.md); completed work is written up with its reasoning in
  [CHANGELOG.md](CHANGELOG.md).

## 12. Story work

Read [STORY.md](STORY.md) before writing any narrative content.

The standing directive is to **continue the existing story, never rewrite it**.
Existing characters, world, lore, quest history, NPC relationships, item
descriptions, dialogue hooks and half-finished regions are canon. Prefer bringing
orphaned-but-authored content into reach over inventing parallel content. Read the
adjacent existing content first and match its voice.
