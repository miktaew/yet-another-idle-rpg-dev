<!-- doc-source: docs/STATUS.md  doc-version: 27 -->

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
rather than the bundle. It is not the path that ships, and it is stricter than the one
that does: the browser's own module loader rejects an import the bundler tolerates,
which is how a phantom `update` import in crafting.js was found. Worth opening after a
refactor for exactly that reason.

### The gate

All four have to pass before a commit:

```
npm run build          # esbuild -> dist/bundle.js, then assembles _site/
LOCALE_STRICT=1 npm run check
npm test
npm run check:bundle
```

- `check` runs the content and consistency checks in `tests/checks/` (fifteen files,
  ~4,900 lines with their helpers). `LOCALE_STRICT=1` additionally fails on a missing
  translation rather than warning.
- `test` is the skill and progression suite in `tests/skills.mjs`: 199 checks.
- `check:bundle` evaluates the built bundle in Node with the browser stubbed. It
  refuses to run against a `dist/bundle.js` older than `src/`, because it once passed
  by testing a stale bundle after a failed build.
- `npm run check:save "<exported save>.txt"` is separate and takes a save file: it
  verifies every id in that save still resolves against the registries. Worth running
  against a real export after any content rename.

---

## Where the code lives

`src/` is 45,785 lines across 53 modules (`find src -name "*.js" | xargs wc -l`).

| File | Lines | What it holds |
| --- | ---: | --- |
| `display.js` | 3,815 | Every DOM update. Down from 7,057 across six cuts. |
| `data/skills.js` | 5,702 | 64 skills, their milestones and rank names. |
| `items.js` | 5,231 | Item templates and the generated-item machinery. |
| `main.js` | 4,501 | Entry point: game loop, actions, combat, rewards, options. |
| `data/locations.js` | 4,684 | 69 locations, their actions and connections. |
| `data/dialogues.js` | 3,073 | 20 dialogues and their textlines. |
| `crafting_recipes.js` | 1,989 | 142 recipes. |
| `item_tooltips.js` | 706 | Item, effect and recipe tooltips. Split out in v0.6.62. |
| `crafting_display.js` | 624 | The crafting window. Split out in v0.6.63. |
| `journal_panels.js` | 696 | Bestiary, book list, lore and Discoveries. Split out in v0.6.65. |
| `skills_display.js` | 660 | The skill bars and the stance list. Split out in v0.6.67. |
| `inventory_display.js` | 963 | The three inventories and the trade window. Split out in v0.6.68. |
| `save_load.js` | 1,951 | Save and load. Split out of `main.js` in v0.6.54. |

`main.js` is the entry point and was 6,606 lines before this round of splitting. What
came out of it: `save_load.js`, `run_stats.js`, `game_state.js`, `ui_helpers.js`,
`crafting.js`, `world_index.js`. Each cut was chosen by measuring two numbers - how
many names the moved code needs from what stays, and how many the staying code needs
back - because the second is what creates a cycle. Item 48 closed with the sixth cut,
and what it measured - including where it decided to stop - is in
[CHANGELOG.md](CHANGELOG.md).

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
`name[`, `new name(`, `${name}` and `name.property`, with a lookbehind that lets a
spread through.

**3. An imported binding is read-only.** State that another module writes has to live
inside an object. That is what `run_stats.js` and `game_state.js` are for; assigning to
a bare imported `let` fails at runtime only.

**4. A save key is a contract.** Registry keys and save keys are player data and are
never renamed or translated. A rename during the `game_state.js` extraction reached
inside two quoted save keys, so the save wrote names the loader did not read, the value
came back undefined, and the next save dropped the keys from the file entirely.
Nothing failed loudly. `check_save_keys_round_trip` now requires every written key to
be read: 54 written, 54 read.

**5. An `onclick` is a string resolved at click time.** `display.js` builds handlers as
markup, so a function that loses its `window.` assignment fails when a player clicks
and nowhere else - not the build, not the checks, not the bundle test.
`check_onclick_names_are_reachable` covers 141 names.

Two smaller ones worth knowing. Turkish locale-aware lowercasing turns a capital I into
a dotless one while an already-lowercase `iron` stays put, so search must fold both
sides to plain letters rather than lowercasing with a locale. And `changeTab` writes
`display` inline, which beats the stylesheet, so a flex panel has to be asked for as
`"flex"`.

---

## What the game contains

Measured from the registries and the checks:

- **69 places** in the registry: 33 ordinary locations, 27 combat zones and 9
  challenge zones, across the starting village and four built regions. 56 type claims
  across 9 location types.
- **45 actions** and **46 activities** spread over those places.
- **19 quests** holding **70 tasks**, 11 of them hidden across 6 quests; every hidden
  task has an advancer.
- **64 skills**, 58 of them with more than one rank name, plus milestones.
- **32 enemies**.
- **142 recipes** in 7 disciplines, plus three plate materials; recipe item names all
  resolve against **453 item templates**.
- **20 dialogues** and **8 traders**.
- **3,302 locale keys**, with Turkish at 100% coverage.
- **1,918 content text ids**, all resolved.

Localisation: **3,302 locale keys, Turkish at 100% with 0 missing**, and all 3,302 rows
are reachable. Turkish is the priority language and must read as though written in
Turkish - the rules are in [I18N.md](I18N.md), and it is directive D-7.

---

## What the checks actually cover

Fifteen files in `tests/checks/`. The valuable ones are not the generic lint-style rules
but the ones that encode a bug that shipped:

| Check | What it prevents |
| --- | --- |
| `modules import what they call` | A name used without importing it. 47 files. |
| `imports resolve` | A name imported from a module that does not export it. 864 names. |
| `save keys round-trip` | A renamed save key silently dropping player data. |
| `onclick names reachable` | A markup handler pointing at nothing. 141 names. |
| `content text ids` | Player-facing text with no locale row. 2,039 ids. |
| `action button labels` | A paragraph rendered inside a button. 45 actions, 80-char limit. |
| `effect tags` | A poison tagged as a buff, which the dev console would then hand out. |
| `documentation` | A translation left behind, or a link pointing at nothing. 18 files. |
| `no raw control bytes` | A NUL written as a byte, which makes grep call a file binary. |
| `no English written into the DOM` | Hardcoded strings bypassing the locale. 212 literals. |
| `hidden quest tasks` | A quest that cannot advance. 11 tasks. |
| `visible quest tasks` | A task named in the journal with no way to finish it. 65 tasks. |
| `actions can explain failure` | An action that fails with no reason shown. 70 actions. |
| `content object keys` | A constructor field renamed out from under its data. 345 objects. |
| `generated components can be made` | A material's widened `types` list building items nothing produces. 203 built, 8 unmade. |
| `quest hints` | A hint builder that filters itself down to nothing and then says nothing. |
| `markdown rules` | A `---` written under a paragraph, which renders that paragraph as a heading. 62 breaks. |
| `seasonal content` | A season named that `getSeason()` never returns, which is content that never happens. 25 names across 54 files. |
| `trader stock` | A stock list that does not exist, or a shelf stored on a trader instead of derived. 9 names, 8 lists. |
| `lore threads` | A thread that draws as a heading with nothing under it. 1 thread, 6 lines. |
| `reputation regions` | A region with no name, or a region key that is not one. 4 regions, 58 uses. |
| `dead ends` | A failure that locks a quest - a lock outside the win branch, or an item eaten on a lost attempt. 18 actions. |
| `stance reactions` | An enemy reacting to a stance id that is not a stance, which never fires. 10 ids, 7 stances. |

Directive D-8: a fix is not finished until a check fails without it, and the guard is
negative-tested by putting the bug back.

---

## In flight

From [PROPOSALS.md](PROPOSALS.md), which is the working backlog and where every
directive is recorded before it is worked on:

- **P-14, v0.7 and the Marrowmoth** - `active`. The next arc, planned against the
  code rather than against the brief that asked for it, in eight phases that each ship
  on their own. Phase 0, the ground, is green: its four design decisions - Q-7 to Q-10
  - are answered and have moved out of Open decisions into the proposal itself, each
  against the phase that spends it. Phase 1, *No Word Sent*, shipped as v0.7.0: the
  Marrowmoth is in port in Spring and Autumn, and the salt house's shelf, the quay's
  ambient lines and the guild clerk's rumour all read that one window. Phase 2,
  *Forty Tons*, shipped as v0.7.1: the unloading and the manifest are two actions on
  the existing bay, quest 1 opens from the work rather than from anybody handing it
  out, and the arc's first lore thread runs across two speakers. Phase 3,
  *A Stroke Through It*, shipped as v0.7.2: three investigation paths on three standing
  axes - `Guild` at 50, `Slums` at 200, `Town` at 150 - each giving a different piece,
  and quest 2 finishable from any one of them. Phase 4, *Out on the Ebb*, is split the
  same way, and both halves are in: 4a's dead-end guard, written around what actually
  locks a quest rather than around the rule the plan guessed at, and 4b as v0.7.3 - the
  tidal flats and the lower hold, with three ways across the mud on Equilibrium, money
  or `Slums` 250. Phase 5 shipped as v0.7.4: the crate opens on being able to put it
  back, holds one band of an unnameable metal cut with the squares the collector
  described once, and pays no item on purpose. Phase 6, the systems pass, is under way:
  two of its four pieces have shipped - v0.7.5 wired tier 5 to the flats and took the 36
  unmakeable components to none, and v0.7.6 made four enemies react to the hero's stance
  through the hooks that already existed. The money sink and standing-as-world-state are
  open.
- **P-12, the metals above steel** - `partly done`. Tier 4 and tier 5 both ship, and
  the 36 white-steel and black-steel components are craftable from an ore dug on the
  tidal flats. One question is left: `roll_quality` reads
  `station_tier - component_tier`, so tier 5 forged at the mountain flue rolls at a
  two-tier penalty and there is no better fire in the game.
**The two quest tasks with no hint came off this list by being measured.** They do not
reproduce. At both of the owner's exports every active quest's current task resolves
to exactly one named place, and no visible task can reach the hint path that had no
fallback: all five live `task_condition` blocks belong to hidden quests, which never
appear in the journal, and `Test quest` is commented out. The claim was true before
the "it is elsewhere" line landed and has been stale since.

What was real underneath it: only one of the two hint builders had that fallback.
`create_quest_hint` returned nothing at all when the zones a counted task names are
all still unfound, so the first visible quest to count a kill would have shown a
0/10 with no line under it. Both builders share one fallback now, and
`check_hints_say_when_they_cannot_point` fails if either stops using it.

Item 48 and P-13/35 were listed here after they closed, which sent a reader looking
in the backlog for proposals that are not in it. Both are written up in
[CHANGELOG.md](CHANGELOG.md); a finished item belongs there and nowhere else.

---

## Reading order for someone new

1. [AGENTS.md](AGENTS.md) - the working agreement, and the canonical instruction file.
2. [PROPOSALS.md](PROPOSALS.md) - standing directives (D-1 to D-9) then the backlog.
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
