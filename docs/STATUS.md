<!-- doc-source: docs/STATUS.md  doc-version: 1 -->

# Status

Where this project stands, written so that an agent handed nothing but this file can
work on it. Every number here was measured, not remembered; the command that produces
each one is given so it can be re-measured when it drifts.

Turkish counterpart: [STATUS.TR.md](STATUS.TR.md).

---

## What this is

A fork of [miktaew/yet-another-idle-rpg](https://github.com/miktaew/yet-another-idle-rpg-dev),
an incremental/idle RPG that runs entirely in the browser. No backend, no accounts: the
save is a JSON blob in `localStorage` that the player can export as base64 text.

The fork's policy is **diverge in content, converge in code**. Story, regions, quests
and Turkish localisation are ours and are not meant to go back. Fixes and general
engine improvements are offered upstream, which is alive: two pull requests are open
from `contribute/upstream-fixes` and `contribute/upstream-features`, kept as branches
for that purpose only. Everything else goes straight to `master` (see D-6 in
[PROPOSALS.md](PROPOSALS.md)).

Deployed to GitHub Pages from `master` by `.github/workflows/deploy-pages.yml`. The
current version is in `src/game_version.js` and mirrored in `package.json`; both are
bumped together, and both changelog pages get an entry, every time.

---

## Running it

```
npm install
npm run serve:site     # builds to _site/ and serves it on 127.0.0.1:8081
```

`npm run serve` (port 8080) serves the repository root, which loads the raw ES modules
rather than the bundle. That path is **not** what ships and is currently broken; use
`serve:site`.

### The gate

All four have to pass before a commit:

```
npm run build          # esbuild -> dist/bundle.js, then assembles _site/
LOCALE_STRICT=1 npm run check
npm test
npm run check:bundle
```

- `check` runs the content and consistency checks in `tests/checks/` (nine files,
  ~5,200 lines with their helpers). `LOCALE_STRICT=1` additionally fails on a missing
  translation rather than warning.
- `test` is the skill and progression suite in `tests/skills.mjs`: 136 checks.
- `check:bundle` evaluates the built bundle in Node with the browser stubbed. It
  refuses to run against a `dist/bundle.js` older than `src/`, because it once passed
  by testing a stale bundle after a failed build.
- `npm run check:save "<exported save>.txt"` is separate and takes a save file: it
  verifies every id in that save still resolves against the registries. Worth running
  against a real export after any content rename.

---

## Where the code lives

`src/` is 44,602 lines across 47 modules (`find src -name "*.js" | xargs wc -l`).

| File | Lines | What it holds |
| --- | ---: | --- |
| `display.js` | 7,044 | Every DOM update. The largest file and the next target. |
| `data/skills.js` | 5,702 | 64 skills, their milestones and rank names. |
| `items.js` | 5,231 | Item templates and the generated-item machinery. |
| `main.js` | 4,464 | Entry point: game loop, actions, combat, rewards, options. |
| `data/locations.js` | 4,403 | 158 locations, their actions and connections. |
| `data/dialogues.js` | 3,073 | 22 dialogues and their textlines. |
| `crafting_recipes.js` | 1,989 | 139 recipes. |
| `save_load.js` | 1,951 | Save and load. Split out of `main.js` in v0.6.54. |

`main.js` is the entry point and was 6,606 lines before this round of splitting. What
came out of it: `save_load.js`, `run_stats.js`, `game_state.js`, `ui_helpers.js`,
`crafting.js`, `world_index.js`. Each cut was chosen by measuring two numbers - how
many names the moved code needs from what stays, and how many the staying code needs
back - because the second is what creates a cycle. The remaining measured cuts and
their costs are item 48 in [PROPOSALS.md](PROPOSALS.md).

---

## Five constraints that have each broken a release

These are not style preferences. Each one shipped a bug.

**1. Circular imports are load-bearing.** The module graph has cycles by design and
they work because of the order the browser evaluates them in. `main.js` is the entry
point and its import list *is* that order. **A new import goes at the end of that
list.** Putting `crafting.js` early pulled `character.js` in ahead of `items.js` and
broke five checks; the bundle was fine either way, which is what makes it dangerous.
`tests/lib/browser-free-src.mjs` replays the list to reproduce the browser's order.

**2. esbuild treats an unresolved identifier as a runtime global.** A name used but
never imported builds cleanly and throws `ReferenceError` in the browser. This has
shipped twice - `restore_message_log`, then `effect_templates` - and the second one
killed everything in `load()` after its line, so saves came back with no quests and no
favourites. `check_modules_import_what_they_call` guards it, and reads `name(`,
`name[` and `new name(`, with a lookbehind that lets a spread through.

**3. An imported binding is read-only.** State that another module writes has to live
inside an object. That is what `run_stats.js` and `game_state.js` are for; assigning to
a bare imported `let` fails at runtime only.

**4. A save key is a contract.** Registry keys and save keys are player data and are
never renamed or translated. A rename during the `game_state.js` extraction reached
inside two quoted save keys, so the save wrote names the loader did not read, the value
came back undefined, and the next save dropped the keys from the file entirely.
Nothing failed loudly. `check_save_keys_round_trip` now requires every written key to
be read: 53 written, 53 read.

**5. An `onclick` is a string resolved at click time.** `display.js` builds handlers as
markup, so a function that loses its `window.` assignment fails when a player clicks
and nowhere else - not the build, not the checks, not the bundle test.
`check_onclick_names_are_reachable` covers 83 names.

Two smaller ones worth knowing. Turkish locale-aware lowercasing turns a capital I into
a dotless one while an already-lowercase `iron` stays put, so search must fold both
sides to plain letters rather than lowercasing with a locale. And `changeTab` writes
`display` inline, which beats the stylesheet, so a flex panel has to be asked for as
`"flex"`.

---

## What the game contains

Measured from the registries and the checks:

- **158 locations** across the starting village and four built regions, with 56 type
  claims across 9 location types and 4 trader shops in 4 regions.
- **21 quests**, 11 of which have hidden tasks; every hidden task has an advancer.
- **64 skills**, 58 of them with rank names, plus milestones.
- **32 enemies** across 36 combat zones.
- **139 recipes**; 549 recipe item names resolve against 450 templates.
- **22 dialogues**, 8 traders across 7 stock lists, 53 actions.
- **1,964 content text ids**, all resolved.

Localisation: **3,215 locale keys, Turkish at 100% with 0 missing**, and all 3,215 rows
are reachable. Turkish is the priority language and must read as though written in
Turkish - the rules are in [I18N.md](I18N.md), and it is directive D-7.

---

## What the checks actually cover

Nine files in `tests/checks/`. The valuable ones are not the generic lint-style rules
but the ones that encode a bug that shipped:

| Check | What it prevents |
| --- | --- |
| `modules import what they call` | A name used without importing it. 47 files. |
| `save keys round-trip` | A renamed save key silently dropping player data. |
| `onclick names reachable` | A markup handler pointing at nothing. 83 names. |
| `content text ids` | Player-facing text with no locale row. 1,964 ids. |
| `no English written into the DOM` | Hardcoded strings bypassing the locale. 212 literals. |
| `hidden quest tasks` | A quest that cannot advance. 11 tasks. |
| `actions can explain failure` | An action that fails with no reason shown. 53 actions. |
| `content object keys` | A constructor field renamed out from under its data. 345 objects. |

Directive D-8: a fix is not finished until a check fails without it, and the guard is
negative-tested by putting the bug back.

---

## In flight

From [PROPOSALS.md](PROPOSALS.md), which is the working backlog and where every
directive is recorded before it is worked on:

- **Item 48, splitting the big files** - `in progress`. `display.js` at 7,044 lines is
  next; the measured candidates and their coupling costs are listed there. `main.js`
  cuts still costed and not done: `options.js`, `release.js`, rewards.
- **Item 12, the metals above steel** - `partly done`. Tier-4 and tier-5 materials
  exist but are not fully wired into progression.
- **P-13/35, the Echoes Beneath** - story and gameplay beyond the title system.
- Two quest tasks show no hint in the journal and need live-state measurement rather
  than reading the source.

---

## Reading order for someone new

1. [AGENTS.md](AGENTS.md) - the working agreement, and the canonical instruction file.
2. [PROPOSALS.md](PROPOSALS.md) - standing directives (D-1 to D-8) then the backlog.
3. This file - the measured state.
4. [I18N.md](I18N.md) - localisation rules and the glossary.
5. [STORY.md](STORY.md) - the canon, which is continued and never rewritten.
6. [DEV_CONSOLE.md](DEV_CONSOLE.md) - `enable_dev_console()` and what it gives you.
7. [CHANGELOG.md](CHANGELOG.md) - what changed and why, per version.

One habit matters more than any of the above: when a symptom is reported in play,
**measure it in the running game** rather than reasoning from the source. The
`null.innerText` crash was found by resolving the bundle's source map; the lost save
fields were found by diffing two of the owner's exports days apart. Neither was
visible by reading the code.
