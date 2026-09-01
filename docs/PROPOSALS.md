<!-- doc-source: docs/PROPOSALS.md  doc-version: 76 -->

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

2. **Tier 5: white steel and black steel.** Re-measured, because the blocker recorded
   here was the wrong one. The display names are **not** missing: the generator asks
   for `material name white steel` and `material name black steel`, and both rows are
   in both locales along with the other thirty-six. What is missing is every recipe -
   36 components are built and not one of them is produced by anything, which
   `check_components_can_be_made` now says on every push. A tier above tier 4 also
   wants a station above 3, and there is none - the mountain flue is the game's best
   fire.
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

58. **Trade with upstream in both directions** — `standing`, and it absorbs what was
    P-13/34. **Taking:** upstream moved for the first time since July on 2026-08-30, and
    all three of its commits trace to our own PR — two are ours by name, the third is
    their restyling of them. There was nothing to take: their delta is our code in their
    house style, merging it would conflict in four files, and it would overwrite our own
    work, which is the one thing that strategy excluded. Re-measure whenever they move.
    **Giving:** measured before
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


### P-14 — v0.7, the Marrowmoth `active`

The next arc, and the first one this fork writes into a hook it left itself rather
than into one it inherited. What follows is the owner's brief measured against the
code, not restated from it.

**Canon it may use, and nothing past it.** Forty tons; out on the ebb; one crate
unweighed; a stroke drawn twice through her account column; back twice a year; the
tallyman will not send word. All six are already in
`action read the departures success` and in [STORY.md](STORY.md) section 1b.

**What it may not resolve.** Who paid for the robbery; why that traveller; where the
taken object came from; why the hero had it; the architecture under the village; the
Rat God; the banished tribe; the four-legged bird. **One layer, once** — the arc may
show that the crate and the stolen object share a hand, and may not say whose.

**Measured before planning**, at v0.6.71 with all four gates green:

- The bay is three places — The bay, The salt house, Coast road — and **one** action,
  `read the departures`, gated on Perception 15 / 34. It is the thinnest region by
  count on purpose, and the arc must not fatten it into a fifth region.
- Reputation has exactly three regions: `Village`, `Slums`, `Town`. **There is no
  guild standing**, which quest 3's three-path design assumes. See Q-7.
- Discoveries indexes *items* by where they come from; Lore lists *heard textlines*
  grouped by speaker. Neither can hold an investigation note. See Q-8.
- `conditions.js` already reads `season`, and `game_time` carries day, season, day of
  week and moon phase. A twice-a-year hull needs no scheduler. See Q-10.
- A trader's stock is read from `inventory_templates[this.inventory_template]` **at
  refresh time**, and `inventory_template` is not written to the save. A stock that
  changes while she is in port therefore has to be *derived* on load, never stored -
  otherwise it silently reverts on the player's next session and nothing fails.
- Skills that exist and could carry a check here: Perception, Presence sensing,
  Spatial awareness, Climbing, Swimming, Equilibrium, Literacy, Haggling, Medicine.
  **There is no lockpicking skill and no navigation skill.** Do not add one for a
  single door.
- `Enemy` already takes `on_hit`, `on_damaged` and `on_death`, and four enemies use
  them. That is the reusable abstraction stance-relevant enemies need; there is no
  case for a second one.
- Tier 5 is blocked on recipes, not on naming - and P-12 said the opposite until this
  was measured. The generator builds 36 white-steel and black-steel components,
  nothing produces any of them, and their locale rows have been in place all along.
  `check_components_can_be_made` holds the number: 159 of 203 generated components
  are reachable, 44 are not, and 36 of those 44 are this.

#### Phases

Each phase ships on its own, passes `build` + `LOCALE_STRICT=1 check` + `test` +
`check:bundle`, and gets both changelog entries. No phase starts before the one
before it is green.

**Phase 0 — the ground.** `done`. No story, and three of its four items turned out
to be about the record rather than about the code — which is what a grounding phase
is for.

- **Q-7 to Q-10 are answered and carried.** Each now sits under
  [Decisions carried into the phases](#decisions-carried-into-the-phases) below,
  against the phase that spends it, so nothing in this proposal waits on
  [Open decisions](#open-decisions) any more.
- **STATUS was the file that was wrong** about item 48 and P-13/35. Both had closed
  and were still listed in flight, which sent a reader into the backlog after
  proposals that are not in it.
- **The two quest tasks with no hint do not reproduce.** Measured against the owner's
  own exports rather than the source: every active quest's current task resolves to
  one named place. The gap underneath the report was real, and
  `check_hints_say_when_they_cannot_point` holds it.
- **The two missing material rows are not missing.** The generator asks for
  `material name white steel` and `material name black steel`; both are in both
  locales, and the tier-5 blocker is every recipe rather than any name.

Guard: one, unplanned and owed under D-8. Correcting the record turned up a defect
in it - a `---` written straight under P-14's closing sentence, which markdown reads
as a setext heading over that sentence - so `check_thematic_breaks_are_not_headings`
reads every tracked markdown file for the class rather than that line. This is the
phase that made the following ones measurable, and it did that by replacing three
remembered facts with three measured ones.

**Phase 1 — v0.7.0, *No Word Sent*.** `done`. Three surfaces say the Marrowmoth is
back and not one of them is a notification: the salt house holds a landing rather than
the leavings of one, the quay gains four lines it does not have the rest of the year,
and the guild clerk has an opinion about a forty-ton hull that ties up and posts no
work. The window is Spring and Autumn — the equinoxes, where the year's biggest tidal
ranges fall, which is the only pair a hull that can only work the ebb could keep, and
the same pair phase 4's approach has to be timed against. It lives in
`src/data/marrowmoth.js`, which imports nothing, because all three surfaces have to
agree about it and the copy that drifted would fail silently. The shelf is derived at
every refresh and never stored, per Q-10. Guards: `check_seasonal_content_is_reachable`
from 1a, now reading every file under `src/` and every named season list rather than
three files and one condition shape; and `check_trader_stock_lists` extended twice, to
see through a derived template name and to refuse any assignment to
`inventory_template` at all — which is Q-10's do-not-store rule made mechanical. Quest 1
opens from none of it: that is phase 2's, and it opens from the discovery rather than
the other way round.

**Phase 2 — v0.7.1, *Forty Tons*.** `done`. Two actions on the existing bay, both
shown by `display_conditions` on the season rather than unlocked and locked again,
because "she is not here" is a state of the world and not a state of the player. A day
on the plank unpaid — the quay's own noise asks who is paying the porters and answers
itself, so paying the hero would contradict a line already overheard — and then the
tally nailed inside the shed door: six columns, five complete lines, and one where four
of the six were written empty with the ruling underneath unbroken. The tallyman says
why there is no weight in the weight column, and that it is the second time, two springs
apart, in his own hand. He will not say it is the same crate: he did not weigh or open
either. Quest 1 opens from the work, not the other way round. The arc's first lore
thread runs across the tallyman and the guild clerk, which is Q-8's own case — one
subject, two speakers, a month's walk apart. Guards: the existing class-level checks,
which the two actions joined automatically, plus `check_lore_threads_resolve` from 2a.

**Phase 3 — v0.7.2, *A Stroke Through It*.** `done`. Three paths, three standing axes,
three different pieces. The guild's seal book reads `Guild` at 50, the porters read
`Slums` at 200 and the factor's old copies read `Town` at 150 — the row's and the
square's own middle tiers, which their existing actions already sit on at 100/200/300
and 50/150/250. None is season-gated: the paperwork and the people are here all year,
and a player who read the manifest in late autumn should not wait until spring to ask
about it. Each path is visible before it is earned and refused with a reason, like the
six settlement actions before them. Quest 2 has one task with **three** advancers rather
than three tasks, so no standing a player lacks can lock it; what they lose is the other
two pieces, and the thread is shorter by saying so. Guild standing becomes earnable
inside the arc — quest 1 pays 60, which puts the seal book's 50 in reach of anyone who
got that far and of nobody who did not — so no save that finished *The Merchant's Word*
early is shut out. Guard: `check_reputation_regions_have_names`, shipped with 3a; no
second one is owed here. Measured while deciding: 61 visible tasks have advancers and
5 have none that is ungated, all five gated on skills or items that can be trained or
bought. That is not the dead-end class phase 4 names — a gate that refuses with a reason
is not a check that fails — and the distinction is recorded so phase 4 does not have to
re-derive it.

**Phase 4 — v0.7.3, *Out on the Ebb*.** `done`. Two places and no more, per Q-9: the
flats are the approach and the hold is the destination, and the anchorage and the cargo
deck are actions on those two rather than rooms of their own. No combat — the obstacle
is water and dark.

The tide is not a clock. There is no time-of-day condition in this engine and adding one
would have been the scheduler Q-10 put out of scope, so what gates the flats is the same
season window the rest of the arc reads: the only reason to walk out there is that she is
lying on the mud. `display_conditions` rather than an unlock, for phase 2's reason — an
unlock is one-way — and the walk back to the bay carries no condition, so nobody out
there when the season turns can be stranded.

Three ways across the same mud, which is the phase's rule made content rather than left
to a guard: wade it on Equilibrium and be turned back by the water, pay a boatman
25,000, or be walked out on the firm line at `Slums` 250 — harder than the investigation's
200, because being shown where the bottom holds is a bigger favour than a porter talking.
Only the free one can fail; the other two cannot fail at all and cost money or standing
instead. All three end at the same ladder and grant the same unlock, so nothing out here
is behind a skill the player does not have.

The phase ends on the crate being seen and not touched — reaching it is phase 5's, and
the arc is built on finishing with more questions than answers. Guard:
`check_no_dead_end_skill_gates`, shipped with 4a; the four new actions joined the
class-level checks automatically, and the checks caught what the writing missed — both
locations' display names, three travel-line ids and both help-page map entries.

Note for the phases after this: 4a's guard reads `main.js`'s attempt resolver by the
order of three call sites. Any rework of that resolver has to keep the lock on the
winning side or say why.

**Phase 5 — v0.7.4, *One Unweighed Crate*.** The crate is reached. It carries the
same hand as the object taken on the forest road — one motif, one metal, one
unexplained material — and nothing else. The player should finish with more questions
than answers, deliberately. Guard: `check_lore_threads_resolve`; Q-8 landed on
threads, so the guard is owed.

**Phase 6 — v0.7.5, the systems pass.** The 20% the brief asks for and the part that
makes the arc worth having: stance choice made to matter through `on_hit` /
`on_damaged` rather than through stat bonuses; the arc's money sink priced against
the existing economy; tier-4 and tier-5 materials wired to what the ebb opens, which
is where P-12's "an ore that is mined rather than bought" belongs; standing
consequences that read as world-state and not as punishment.

**Phase 7 — v0.8 groundwork, *Beyond the Lake*.** Not started before phase 6 is
green. Traces first — tracks, feathers, noise, broken cover — and the player must be
unsure the four-legged bird exists at all before they meet it.

#### Decisions carried into the phases

The four questions this proposal asked, with their answers, each against the phase
that spends it. They were settled under [Open decisions](#open-decisions) and moved
here when phase 0 closed: a decision belongs beside the work it shapes, and the
numbers are kept so the commits and changelog entries that name them still resolve.

##### Q-7 — Does guild standing become a fourth reputation region? **DECIDED: yes** — spent by phase 3

P-14 phase 3 wants three information paths that differ, and two of the three axes
are already spent: the town square reads Town at 50 / 150 / 250 and the row reads
Slums at 100 / 200 / 300. A third path off either of those is the same path twice.

The cost was measured rather than feared. `character.reputation` is a plain object;
`load()` walks the keys **in the save** and warns past a region it does not know, so
an old save simply arrives with no `Guild` and the field keeps its declared 0.
`update_displayed_reputation` shows only regions above 0, so nobody sees a row they
have not earned, and the region's name goes through `getDisplayName`, which wants one
locale row per language. `market_saturation` is a separate map and is not touched: a
guild that prices nothing does not need a market region.

So the whole cost is one field, two locale rows and a check. The alternative -
expressing guild favour as flags and quest state - costs less code and buys nothing:
a number the player can watch rise is exactly what makes a third path feel like a
third path.

##### Q-8 — Where do investigation notes live? **DECIDED: a lore thread, not a new panel** — spent by phase 2, and drawn on again by 3 and 5

Measured, because the brief names Discoveries and Discoveries is not what it sounds
like. `update_displayed_discoveries` renders **items** against where each one comes
from, built from `world_index`. `update_displayed_lore` renders **textlines the
player has heard**, grouped by speaker, with a resume line for where they left off.
An action's success text is neither, and today it is read once in the log and gone.

Three options, and the middle one is right:

- **Route clues through dialogue lines flagged `lore: true`.** No code at all, and
  it already works. But it groups by speaker, so the Marrowmoth's six facts would sit
  under three different people and read as three conversations rather than one thread.
- **Give `Textline` an optional `lore_thread` id and the lore panel a thread grouping
  above the by-speaker list.** One optional field, one branch, no save impact -
  textlines are already tracked as unlocked. Reusable by the banished tribe and the
  Rat God, which is the test of whether an abstraction earns itself.
- **A new investigation panel.** Excluded by the brief and by the evidence: the game
  has four journal surfaces already and a fifth would be the parallel system every
  standing directive here exists to prevent.

##### Q-9 — How many new places does the ebb chain need? **DECIDED: two, not four** — spent by phase 4

The brief sketches Bay → low-tide flats → anchorage → cargo deck → lower hold. The
bay is deliberately the thinnest region in the game - three places, because a harbour
is somewhere you pass through - and four more would make it the largest after the
mountain, which says the wrong thing about it.

Two carry the whole chain: the **flats**, which is the approach and the thing the
tide gates, and the **hold**, which is the destination. The anchorage and the cargo
deck are actions on those two. Locations are cheap here, which is the trap: the test
is not what it costs to add a room but whether the room has anything in it, and a
corridor does not.

##### Q-10 — How does "twice a year" work? **DECIDED: two seasons, no scheduler** — spent by phase 1

`conditions.js` already reads `season: {yes, not}` and `game_time` carries the
season, the day of the week, the day count and the moon phase. Twice a year is two
seasons, and the whole of the world-event vocabulary the brief lists - trader stock,
ambient lines, actions, dialogue - can read the same condition.

The one real hazard is not the time model, it is the state: `inventory_template` is
**not saved**. Anything flipped on a trader while she is in port has to be recomputed
from the season on load rather than written down, or it reverts on the next session
and nothing fails loudly - which is the exact shape of the bug that lost the owner's
favourites (see constraint 4 in [STATUS.md](STATUS.md)). Derive it; do not store it.

A general world-event framework is explicitly out of scope. If a second event ever
wants the same wiring, that is when the abstraction has earned itself.

#### What this proposal must not do

Invent a fifth region, a second investigation UI, a scheduler framework, a
lockpicking skill, or a mystery's answer. Where authored content already covers a
beat, wire it up instead.

---

## Open decisions

Each of these changes what gets built. They are recorded here rather than guessed
at. What is left here is project-wide; a question asked by one proposal moves into
that proposal once it is answered, which is where Q-7 to Q-10 went — see
[Decisions carried into the phases](#decisions-carried-into-the-phases) inside P-14.

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
