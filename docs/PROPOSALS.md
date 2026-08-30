<!-- doc-source: docs/PROPOSALS.md  doc-version: 59 -->

# Proposals

Working backlog for this fork. Every directive from the project owner is recorded
here as a numbered proposal, tracked to completion, written up in
[CHANGELOG.md](CHANGELOG.md) with an explanation of what actually changed, and then
taken out of this file. What is left is what is still open — which is the point of a
backlog. Numbers are never reassigned, so a gap is a finished proposal and the
commits and changelog entries that name it still resolve.

Turkish counterpart: [PROPOSALS.TR.md](PROPOSALS.TR.md).

**Status vocabulary**

| Status | Meaning |
| --- | --- |
| `done` | Shipped, verified, written up in `CHANGELOG.md` and **removed from here**. |
| `active` | Being worked on now. |
| `open` | Accepted, not started. |
| `blocked` | Cannot start until a decision in [Open decisions](#open-decisions) is made. |

---

## Standing directives

These are not one-off tasks; they constrain every future change. They come from
the project owner and override defaults.

### D-1 — Role

Work as a senior game narrative designer, quest designer and JavaScript
developer.

### D-2 — Continue the story, never rewrite it

The job is to continue the existing story organically from where it ends, to
develop the hooks that were deliberately left open, and to bring content that
already exists in the repository but is unreachable in-game into the story.

Canon, and therefore not up for revision: existing characters, the world, the
lore, quest history, NPC relationships, item descriptions, dialogue hooks and
half-finished regions. New content must read as the natural continuation of the
same universe.

### D-3 — Bilingual, always

Every documentation file ships as a pair: `NAME.md` and `NAME.TR.md`. The
English file is canonical. Code comments are written in English. Conversation
with the project owner is in Turkish.

**Every markdown file in the repository is checked, not only `docs/`.** Each
carries a `doc-source` and `doc-version` header, the pair must sit at the same
version, and every relative link must point at a file that exists.
`check_docs_are_paired` covers all of them - the root `AGENTS.md` and `README.md`
included, which had Turkish counterparts and no way to tell when one fell behind.
Vendored third-party markdown is excluded; it is not ours to hold to this.

### D-4 — One canonical agent instruction file

Agents read a single canonical instruction file. Other files point at it rather
than restating its rules, so there is nothing to keep in sync.

### D-5 — Never hardcode player-facing text in `src/`

All narrative and UI text belongs in `locales/<language>.js` behind a string id.
This is a prerequisite for D-3 reaching the game itself, not just the docs.

### D-7 — Turkish must read as Turkish

Turkish localisation is the **top priority**, ahead of further story work.

The translation must read as though written in Turkish, not converted into it. Not
acceptable: machine-translation register, calques, literal idiom rendering, or the
wrong sense of a polysemous word — "spider web" is a web of silk, not a network.

Translate in **context units**, never string by string: a string is read underneath
whatever is above it on screen, so a question and its reply, a stat's short and long
form, and a label and its possible values are translated together and must agree.

Rules, glossary and known gaps: [I18N.md](I18N.md).

### D-8 — Every fix ships with the test that would have caught it

A bug that reached a player is evidence that nothing in the gate was looking for it.
Fixing the bug without adding that guard leaves the door open, and this repository has
walked back through it more than once: `restore_message_log` and `effect_templates`
were the same missing-import bug three weeks apart.

So a fix is not finished until a check fails without it. Two rules make that real:

1. **Negative-test the guard.** Put the bug back, watch the check fail, take it out
   again, watch it pass. A guard that has never failed has not been tested, only
   written - and a widened matcher can silently stop catching what it used to.
2. **Guard the class, not the instance.** `check_save_keys_round_trip` does not know
   about `last_combat_location`; it requires that every key the save writes is a key
   the load reads. The next rename fails the same way.

Where they live: `tests/checks/*.mjs`, registered in `tests/run.mjs`, run by
`npm run check`. The gate is `npm run build && npm run check && npm test &&
npm run check:bundle`, and all four have to pass before a commit.

### D-9 — The in-game changelog is for the player

`changelog.html` and `changelog.tr.html` are read inside the game. They carry what a
player can see: content, fixes they hit, interface behaviour. **Maintenance does not go
in them** — a split file, a new check, a renamed import is not news to somebody playing,
and a version whose only change is one of those simply does not appear there.

That work is still recorded, in [CHANGELOG.md](CHANGELOG.md), which is the developer
history and keeps the reasoning at full depth. `check_changelogs_cover_version` enforces
the pair of rules together: a shipped version must be written up in one place or the
other, never neither.

### D-6 — Push straight to the default branch

Commit and push directly to the default branch (`master` today, `main`
intended later). No feature branches, no pull requests, unless asked. The Pages
deploy only triggers on the default branch, so a side branch would silently skip
deployment.

---

## Proposals

### P-12 — Wire the metals above steel `partly done`

`crafting_component_filling.js` generates 72 components for four materials that no
recipe has ever produced: **white iron** and **black iron** at tier 4, **white
steel** and **black steel** at tier 5. Weapon heads, handles, shield bases, and both
chainmail and plate exteriors for all five armour slots. Its header explains the gap
in one line: *"DOES NOT AUTO-FILL CRAFTING RECIPES, DO IT MANUALLY AND MAKE SURE
NAMES MATCH"*.

**Tier 4 is done.** Ore sold at the bay's salt house, smelting recipes at 15-25, and
two rows added to each of the thirteen forging component recipes. Everything it
needed already existed - the ores, the ingots, the chainmail, and their names and
descriptions in both languages.

**What is left, and in what order:**

2. **Tier 5: white steel and black steel.** The ingots and chainmail exist as items.
   What does not exist is a display name: `material white` and `material black` have
   no row in either locale, which is where the original work stopped. A tier above
   tier 4 also wants a station above 3, and there is none - the mountain flue is the
   game's best fire.
3. **An ore that is mined rather than bought.** Buying at the bay is correct for a
   metal that comes "from very far away", but a tier the player can only shop for is
   thin. Where it is mined is a story question and belongs to whatever region opens
   next, not to this proposal.

**What this must not do:** invent a fifth tier. Four materials past steel is already
more than the authored content past the swamp, and the ceiling should move with the
story rather than ahead of it.

### P-13 — The session's requests, one at a time `active`

Recorded here because every instruction belongs in this file before it is finished,
not after. Each item is the request as it was given, and the state it is in.

#### Content and features

15. **Record every request here** — `standing`. This section is that rule being
    followed.

34. **Do the merge, then offer the result upstream** — `active`. Take what can be
    taken from upstream, including whatever they add next, without overwriting our own
    work; then send the current code to them as a contribution and let them take it or
    not. This is strategy (A) as put to the owner, and it is now the standing
    priority: the measurement that decided it is that the merge grows while we keep
    fixing bugs in the files upstream rewrote - 191 conflict hunks when first measured,
    222 six versions later. The GameAction move worked as intended in the same window
    (modify/delete conflicts 4 -> 3), so the direction is right and the cost is time,
    not doubt.
35. **Look at Echoes-Beneath for STORY and GAMEPLAY, not only tooling** — `todo`. The
    first review answered the tooling question and missed the one that was asked. What
    was wanted: mechanics and narrative devices worth adopting - a **title system** was
    named as the example. Its `js/systems/` holds abilities, effectors, planner and
    simulation, none of which this game has, and its docs carry REGIONS, STORY and two
    STORYPROGRESS files.

47. **The browser-free loader cannot reach three content modules** — `todo`, and it is a
    capability gap rather than a wish. tests/lib/browser-free-src.mjs loads a module from
    src/ for real by stubbing main.js and display.js, and enemies.js, traders.js and
    data/locations.js all die on it with "Cannot access 'is_rat' before initialization" -
    a TDZ fault from evaluating the cycle with the wrong entry point. Each call builds its
    own temp graph, so loading items.js first does not help. The cost is concrete: the
    Discoveries index read trader.inventory_template as a list when it is a key, and no
    test could have caught it because no test can construct a trader. The fix is to
    generate one entry module that imports in main.js's own order and evaluate the target
    through it.
48. **Splitting the big files** — `in progress`, and the measurements are the point.

    v0.6.62 took the tooltips out: `item_tooltips.js`, 706 lines, and display.js 7,057 ->
    6,430. Three of the names the cut appeared to need turned out not to be needed at all -
    `rarity_colors` and `rarity_outlines` belong with the tooltips that read them,
    `select_outline_class` is in misc.js rather than display.js, and `round` is used by
    nothing else - which left `format_money` as the only name borrowed back, called at
    runtime and never at module scope.

    Three faults on the way, each caught by a different net and each worth remembering:
    a destructured parameter list opens a brace, so counting from `function` ended
    create_item_tooltip_content at its own signature; `Object.keys(x).forEach(...)` closes
    with `});` and leaving the `);` behind is a syntax error; and moving a `const` above
    the loop that reads it puts it in its temporal dead zone, which the build accepts and
    `check:bundle` refuses. The last one is why that check exists.

    v0.6.63 took the crafting window (`crafting_display.js`, 624 lines) and v0.6.65 the
    journal's panels (`journal_panels.js`, 696 - bestiary, book list, lore, Discoveries).
    display.js is 7,057 -> 5,273 across the four cuts. Each needed exactly one or two
    names back out of display.js, all read at runtime.

    Two things learned since. **A re-export makes a split cosmetic**: display.js was
    handing the moved names on to main.js, save_load.js, crafting.js and items.js, which
    were still asking it for functions it no longer had. Repointing them is part of the
    cut, not a follow-up. And **the browser-free loader needs a `document`**, not a longer
    stub list: journal_panels.js takes two element handles at module scope, and stubbing
    the global once means the next split does not have to touch the loader at all.

    Remaining, re-measured: inventory 921 lines (23 out), trade 173 (8), quest journal
    907 (121 - the coupled one), animations 204, combat 172.
    Two cuts are made and the rest are costed rather than guessed at. A cut is judged by
    two numbers: how many names the moved code needs from what stays, and how many the
    staying code needs back. The second is the expensive one - it becomes an import INTO
    a module that is already the entry point of a load-bearing cycle.

    Done: **crafting.js** (357 lines, 4 in / 0 out) and **run_stats.js** (the ten run
    counters, which had to leave first because an imported binding is read-only and
    use_recipe increments two of them). **ui_helpers.js** (9 functions) followed, for the
    same reason on the display.js side. main.js 6606 -> 6279.

    Costed and NOT done, with the reason:

      * `process_rewards` (365 lines) needs 20 names from main.js and would put
        rewards.js and quests.js in a direct two-module cycle, which is the shape that
        broke v0.6.27. Would need `questManager` published through registries.js first.
      * save/load (1821 lines, 29% of main.js) needs 60 names, nearly all of them module
        state the two functions read and write. The run_stats.js pattern generalises: a
        `game_state.js` leaf holding that state would cut the 60 down hard. Biggest prize,
        biggest preparation, and save-format risk if done carelessly.
      * bestiary + Discoveries out of display.js (389 lines) is now 5 in / 1 out - the one
        back-edge is `create_travel_line`, which the quest hints also use. Moving the hint
        renderer with it moves the need to `create_quest_step_hint`, and so on into the
        quest journal. The next preparation is to decide where the journal's shared
        rendering lives.

    Safety net in place: `check_onclick_names_are_reachable`. An onclick is a string
    resolved against the global object at click time, so a function that loses its
    `window.` assignment fails there and nowhere else - not the build, not a check, not
    the bundle-load test. 81 names, and main.js holds 89 of the assignments.

    One rule learned the hard way: a new import goes at the END of main.js's import list.
    The browser-free test loader replays that list to reproduce the browser's evaluation
    order, and putting crafting.js early pulled character.js in ahead of items.js and
    broke five checks. The bundle was fine either way.

54. **Keep the story going, and connect the new areas** — `in progress`. v0.6.57 tied
    the slums to the town gate, which is the first crossing between the two the game has
    had. The rest of the regions are still standing beside the story rather than in it. Not a pause in
    narrative work while the engine is tidied: the regions that were built need to be
    tied into the story rather than left standing next to it.

58. **Send what fits upstream when the changes pile up** — `standing`. Measured before
    offering anything, because most of a round's work is fork-shaped: the checks depend on a
    `tests/` framework upstream does not have, and `effect_templates` was our own refactor's
    bug, not theirs. What did fit was `add_best_effect`, which belongs beside the dev console
    already in PR #242, so it went there as a fourth commit rather than into a third PR.
    Checked against upstream's own tree first: 22 buffs apply, no poison among them.

    Also measured and **not** sent: the action-button label fix. Upstream has the same
    structure - `action_name || starting_text`, and the button draws `starting_text` - but
    its own labels are all short, so the effect there is three ant-nest actions sharing one
    button label while their distinguishing names sit unused. That is an arguable improvement
    to their copy rather than a bug, and not ours to decide.

    Reopened and sent after all, as **PR #243**, once the case was measured properly:
    their unlock message already reads `action_name`, so the log announces an action
    under a name the button never shows. That is an inconsistency in their own code
    rather than a preference about wording. The activity-animation null guard went with
    it, labelled honestly as defensive - the same unguarded dereference is in their tree
    and I could not prove a path to it there. What stayed behind: every check, since they
    have no `tests/`, no `package.json` and no test runner to hang one on.

---
## Open decisions

Each of these changes what gets built. They are recorded here rather than guessed
at.

### Q-1 — Does this fork diverge in content? **REVISED: diverge in content, converge in code**

New areas, items and dialogue are in scope, as before. What has changed is the
second half: **upstream is not abandoned.** Take what is worth taking from it,
keep the code mergeable in both directions, and break nothing on the way. The
finished result goes back to upstream as a pull request.

The original answer said merge-friendliness was no longer a goal. It is again. The
practical consequences:

- A refactor of our own should move *toward* upstream's layout where upstream has
  one, not away from it. Upstream's `19011a0` split into `src/models/`,
  `src/components/` and `src/data/`; a split of our `main.js` should land in the
  same shape rather than invent a third.
- An upstream change is assessed on its merits and ported when it is worth it,
  rather than skipped because we no longer sync. Upstream's own changelog for
  `19011a0` lists six discrete improvements beside the restructure, and those are
  portable independently of it.
- Our translation layer is the one thing that cannot be given up to reach
  mergeability. Registry keys stay English because they are save data (Q-2), and
  no port may reintroduce a hard-coded player-visible string where a text id now
  stands. Where the two collide, the translation layer wins and the port adapts.
- Q-5 (untracking `dist/`) stands. Nothing about it depended on divergence: the
  deploy workflow builds its own bundle either way.

### Q-2 — How far does Turkish go? **DECIDED: everything**

Interface, dialogue, and item / skill / location display names.

The consequence is the display-name indirection layer described in P-7. Registry
keys stay English forever, because they are save data; what gets translated is a
separate shown-name text id per entry. Nothing about this permits renaming a key.

### Q-3 — Are `help.html` and `changelog.html` in scope for Turkish? **DECIDED: both, fully**

The recommendation was a hand-written Turkish help page and an English-only
changelog carrying a Turkish note. That was too cautious on the second half. Both
pages exist in Turkish — `help.tr.html` and `changelog.tr.html` — and
`update_translated_page_links` points the in-game links at whichever file matches
the selected language, falling back to English for a language with no page.

The in-game changelog has since become part of the development record rather than
an inherited artefact, which settles the rest of the question: its Turkish copy is
maintained, not a courtesy. `npm run check` requires both copies to carry an entry
for the shipped `game_version`.

### Q-4 — Turkish address register **DECIDED: mixed, per NPC**

Elders, officials and the swampland chief are addressed formally; peers,
children and the informal cast are addressed informally. NPCs address the hero
informally, except officials on duty. The per-NPC map is in
[STORY.md](STORY.md#6-turkish-address-register).

Correction to the earlier framing: this needs **no** engine change. Register
being a second selectable axis would have required rewriting the lookup, but a
fixed per-NPC register is simply written into each line's Turkish text, and each
line is already a separate string id.

### Q-5 — Should `dist/` stay tracked? **DECIDED: untracked**

Nothing consumed the committed copy. The deploy workflow runs `npm run build`
itself before uploading, so the published bundle was always the one CI built; the
repository root is the dev entry point and its `index.html` loads `src/main.js`;
and no check ever compared the committed bundle against `src/`, so a stale one
would not have been caught. The cost was 4 MB of minified output plus sourcemap,
re-diffed on every content change across 121 commits. The unmergeable-conflict
argument is moot under Q-1, but the rest stands without it.

`.gitignore` now ignores `dist/`, the `.gitattributes` entries that kept the blob
out of diffs went with it, and the comments in `scripts/build-site.js`, the deploy
workflow, both READMEs and both `docs/AGENTS` halves no longer claim it is
committed. `npm run build` itself is unchanged: it still writes `dist/bundle.js`
first and copies it into `_site/`.

### Q-6 — Language switch: reload or live? **DECIDED: live**

The blocker described here — that a live switch needs a "refresh every display"
entry point which does not exist until the display module is split — turned out
not to be the shape of the problem.

`translateUI` rewrites everything carrying a `data-translation` attribute, and
everything else resolves through `getText` when its panel is drawn, so it changes
over as the player moves around. What remains is a short list of panels built
imperatively once and never redrawn: the character bio, and the hero creation
panel. Each gets an explicit repaint in `option_language`, and `npm run check`
fails if one of them is missing, so the list cannot silently grow. No reload, and
nothing had to be split.

---

## Conventions for this file

- One proposal per directive, numbered and never renumbered.
- When a proposal reaches `done`, write the explanation in
  [CHANGELOG.md](CHANGELOG.md) and then remove the proposal from this file. The
  account lives there, at developer depth; a second copy here turns the backlog into
  an archive and buries what is still open.
- Decisions move from [Open decisions](#open-decisions) into the proposal that
  consumes them, with the answer recorded.
