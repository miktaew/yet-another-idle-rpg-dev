<!-- doc-source: docs/PROPOSALS.md  doc-version: 22 -->

# Proposals

Working backlog for this fork. Every directive from the project owner is recorded
here as a numbered proposal, tracked to completion, and then written up in
[CHANGELOG.md](CHANGELOG.md) with an explanation of what actually changed.

Turkish counterpart: [PROPOSALS.TR.md](PROPOSALS.TR.md).

**Status vocabulary**

| Status | Meaning |
| --- | --- |
| `done` | Shipped and verified. Written up in `CHANGELOG.md`. |
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

### D-6 — Push straight to the default branch

Commit and push directly to the default branch (`master` today, `main`
intended later). No feature branches, no pull requests, unless asked. The Pages
deploy only triggers on the default branch, so a side branch would silently skip
deployment.

---

## Proposals

### P-1 — Full project audit `done`

Understand the codebase before changing it: architecture, content/data layer,
i18n readiness, refactor candidates, fork divergence, documentation state.

Delivered as two multi-agent audits — a technical audit (8 subsystem readers, 14
adversarial verifiers, 1 synthesiser) and a narrative discovery pass (story
spine, open hooks, orphaned content, NPC arcs, geography, progression systems).
Findings feed P-4, P-7, P-8 and P-9.

### P-2 — Fix the GitHub Pages deploy workflow `done`

An example `deploy-pages.yml` was supplied. Verify it against the real
repository structure and correct it. Six of its eight assumptions were wrong;
see `CHANGELOG.md` for the itemised list.

### P-3 — Modernise the toolchain `done`

Raise `engines.node` to `>=22` and bring lagging dependencies and actions to
current versions.

### P-4 — Rewrite `README.md` `done`

The current README describes the upstream project, not this fork, and several of
its claims are now false (`npm run build` with no `package.json`, a
`live-server` recommendation for a dependency that no longer exists, upstream
branch layout). Rewrite it for this repository, with a Turkish pair.

### P-5 — Documentation structure `done`

Create `docs/`, with these pairs:

| File | Purpose |
| --- | --- |
| `docs/AGENTS.md` | Canonical instructions for agents and developers (D-4). |
| `AGENTS.md` (root) | Pointer stub, because harnesses auto-discover the root file. |
| `docs/STORY.md` | The narrative canon: world, protagonist, tone, where the story currently stops. |
| `docs/PROPOSALS.md` | This file. |
| `docs/CHANGELOG.md` | Development history with explanations. |

Naming: uppercase base name, uppercase `.TR` marker, lowercase `.md` extension
(`PROPOSALS.TR.md`). The deploy workflow's `paths-ignore` uses a case-sensitive
`**.md` pattern, so a stray `.MD` would defeat it and trigger a pointless
rebuild on documentation-only pushes.

### P-6 — Remove references to the upstream deployment `done`

Assets, repository links and the visitor counter must resolve against this
repository and this deployment, not the upstream one.

Attribution is deliberately **not** removed: the MIT licence requires retaining
the original copyright notice, and the original author asked that forks credit
and link the original. Asset and infrastructure references move; credit stays
and is relabelled honestly.

### P-7 — Turkish language support in the game `done`

Add a Turkish option to the game itself. The translation layer already exists
but currently covers dialogue and part of the UI only.

Unblocked: Q-1, Q-2 and Q-4 are decided. Scope is the **full content layer**,
including item, skill and location display names.

That scope has one hard prerequisite: **registry keys currently are the display
names, and they are persisted verbatim in save files.** So a display-name
indirection layer has to land first — every registry entry keeps its English key
forever and gains a text id for its shown name. Renaming keys is never an option.
This is the largest single piece of work in the backlog and is tracked as its own
refactor prerequisite.

Address register is a **per-NPC authoring convention**, not an engine feature —
see [STORY.md](STORY.md#6-turkish-address-register). No change to the lookup in
`src/translation.js` is needed, because each line is already a separate string id.

**Shipped** — the language works end to end. `getText` now falls back to the
default language for any untranslated id, which is what makes a partial locale safe;
`turkish` is registered; `locales/turkish.js` carries the interface, stats, skills,
races and bio sections; and the options panel has a selector built from the
`languages` registry, switching live. `npm run check` reports coverage and `npm test`
covers the lookup and the fallback. The translator handbook and glossary are in
[I18N.md](I18N.md).

**Done.** There is no player-facing English left in the game. 2536 keys per
language cover dialogue, quests, items, locations, enemies, skills, stances,
effects, activities, recipes, traders, the log messages and the interface. The 203
items the game generates rather than declares are covered by parameterised name
patterns, and `help.html` and `changelog.html` have Turkish counterparts the buttons
switch to. What remains is written up as structural notes in the known gaps of
[I18N.md](I18N.md) - two pre-init loading messages, the standalone pages' drift
risk, and a couple of places where the English itself duplicates a number.

### P-8 — Fix the reported NaN warnings `done`

Framing correction from the audit: the adversarial pass refuted every candidate
for *rendered* `NaN` text. What exists is a console **warning** — the phrasing in
the original request — emitted by the guard in `src/main.js` when non-numeric xp
is added to a skill.

The audit produced an ordered fix list of 11 items plus companion cleanups. The
two most consequential:

- The last gate before skill xp is committed compares `xp_to_add == 0`, which
  lets both `NaN` and `Infinity` through. `Infinity` makes the level-up loop
  non-terminating, which hangs the browser tab.
- A `typeof x === Number` comparison is unconditionally false, because `typeof`
  yields a string and `Number` is a constructor. The per-gain xp cap it guards
  has therefore never applied. Fixing it is a live balance change and needs its
  own changelog entry.

Also surfaced, and more interesting for D-2: the height/race helper reads its
fields from the wrong object, so height and race selection currently have no
gameplay effect at all, and one dialogue variant is permanently unreachable.

**Shipped** - the skill xp panel readout reported from the live game and the model
bugs behind it; a regression the first fix introduced; the skill progress bar
width; the level-up estimate, which the newly-live xp cap had made optimistic; and
the height/race helper together with the height condition block. All written up in
[CHANGELOG.md](CHANGELOG.md) and covered by `npm test`.

**Investigated and dismissed** - recorded here so they are not re-raised. Each was
adversarially verified as not worth fixing:

- *Maxed crafting skill xp arithmetic* (`main.js`, four sites). Produces `NaN`, but
  the value is only ever consumed by `accumulated_xp >= needed_xp`, and both
  `x >= NaN` and `x >= Infinity` are false. The proposed `|| Infinity` guard changes
  nothing. The sibling site that does carry the guard needs it because that branch
  does arithmetic on the value - an asymmetry in usage, not an oversight.
- *Empty-combat divisors* (`main.js`, stance xp and the survivor-count exponents).
  `is_alive = false` is written in exactly one place, which clears that enemy's
  timer immediately, and the kill-to-repopulate path is a single synchronous
  callback with no yield - so nothing can observe an all-dead enemy list. Even if
  it could, the entry guard rejects the value with an error and it is never stored.
- *Enemy panel hit and dodge chances* at zero survivors. The zero state is
  reachable, but `get_hit_chance` has a terminal `else { result = 0 }` that converts
  the `NaN`, and the corrective repaint happens inside the same synchronous task, so
  no frame is painted in between. That fallthrough is load-bearing and undocumented;
  a comment is the only justifiable action.
- *Character xp entry guard* (`character.js`). All four call sites are provably
  finite, `total_xp` starts at 0 and is only incremented, and the load path's input
  comes from a save the other three wrote. Defence in depth at best.

**Closed.** Both interpolation helpers are fixed and guarded.

`slerp` interpolates geometrically, which has no reading when a pair starts at zero
- `(to / 0)` is `Infinity` and `0 * Infinity ** t` is `NaN` - nor when either end is
negative. It now falls back to linear where the geometric form is undefined, which
agrees with it at both endpoints. `crafting_recipes.js` held an inline copy of the
same expression for crafting success and calls the helper instead, so the guard
lives in one place. All 193 content pairs are positive today, so no current number
moved.

The **market-saturation divisor did not reproduce.** The only division on that path
is reached solely when `sold >= 1e13`, so it cannot divide by zero; the other is by
a constant. Recorded as refuted rather than carried forward. Two nearby no-ops were
fixed while looking: single-argument `Math.max(x ?? 0)` returns `x` and never
clamped anything.

Three guards, so the trap cannot return:

- `npm run check` asserts that every interpolated pair in the content source has two
  positive ends - 192 of them - and runs on every push.
- `npm test` pins the geometric curve AND the fallback, including a check that the
  old expression really did return `NaN`, so the new ones are not vacuous.
- `Verify_Game_Objects` reports the same pairs from inside the game. Its gathering
  check was found dead while this was added: the loop read `gained_resources?.length`,
  undefined because `gained_resources` is an object holding a `resources` array, so it
  ran zero times and the resource-name check inside it had never once executed.

Separately, `npm run check:save` is new: it audits an exported savegame against every
registry. Run against a real v0.5.5.30 save from before the localisation work, all
61 locations, 14 dialogues, 60 skills, 15 activities, 4 traders, 11 quests, 8 books,
131 recipes and 90 item ids resolve. The rule that registry keys are save data had
never been checked against an actual save.

### P-9 — Continue the story `done`

Canon, the frontier, the orphan inventory and the planned arc are now written up
in [STORY.md](STORY.md). Q-1 is decided in favour of full divergence, so new
content is in scope.

The arc is **"The Merchant's Word"**, six quests starting exactly at the frontier.
Its premise is derived entirely from canon: the town gate names citizenship or
merchant-guild membership as its only two keys, and after the swamp the hero is
the only person alive who can supply the guild from past the falls. The hero
enters the town as a supplier, not as a hero.

Execution order, highest leverage first:

1. **Q2 — DONE.** The gate is open, gated on the full 150 Town reputation, which
   gives that reputation its first consumer. Town square, the Cat cafe, the
   Antique store and the Adventurer's guild are reachable; the Nekomimi cafe is
   correctly beastkin-gated now that `Location` honours `display_conditions`; the
   Lost memory task dead since v0.4.6 is completable. Written up in
   [CHANGELOG.md](CHANGELOG.md).
2. **DONE.** All four reclamation blockers are cleared, verified against the
   source rather than assumed: `inventory_templates["Cat cafe"]` exists and both
   cafe traders point at it; the Mages guild has its own description (a narrow
   stone building wedged between two wider ones) instead of the Nekomimi cafe's;
   there are zero `lorem ipsum` strings left anywhere in `src/` or `locales/`; and
   `Location` stores `display_conditions` and `display.js` evaluates it at render
   time, so mofu gating no longer has to happen at the push site.
3. **DONE, both halves.** *Somewhere in the Town* ships: the guild clerk finds the
   name, and the broker under the green awning is the ex-boss the robber names.
   He gives up that the job was paid, that the contract described exactly one
   object, and that everything else went to the collector across the square. He
   does not give up who paid, which canon keeps open. The object he describes -
   palm-sized, flat, *"squares cut into it that come back around to where they
   started"* - is the physical link to the cave, and it left his hands the night
   it arrived, so it is not what Q4 buys back.

   Q4, *Nothing but Pants*, ships too. The collector does not sell, and that is
   not a puzzle a bigger number solves - the way in is provenance. An object with
   no story is furniture, and the hero is the story of this one. Money is what it
   costs once he knows that: 30000, the game's first thing that takes money
   rather than giving it.

   That required building the mechanism. The `money` requirement was documented
   three different ways and implemented as a bare comparison with no spending at
   all, so a price written as documented gated on an object and silently cost
   nothing. See [CHANGELOG.md](CHANGELOG.md).

   His last line is the payoff: one other piece came in that lot and left the
   same night, flat and cut through with squares that turn back to their own
   beginning, and forty years of cataloguing this town told him it was made
   before there was anybody here to make it.
4. **DONE.** The second gate opens in two steps, because the room's line is about
   understanding rather than force: study the floor - the squares are a spiral so
   shallow the eye insists on a circle - and that tells you the gate is read, not
   pushed, and what it has to be read with. Silver, because the ore's description
   has always said it "directs or disrupts magic" and the ingot "has potential for
   use in magic tools".

   That gave silver its sink and reconnected the whole chain, which was authored
   and broken in two places at once. The forest lake's deep dive - the game's only
   silver tap - rewarded `action:` singular, which is not a reward key, pointing at
   `mining`, which is an activity and so could never have been found under
   `.actions` either. The `Silver ingot` recipe was commented out "waiting for a
   sink". Both live now, with a divining rod between them.

   Behind the gate is the `cute little rat` dialogue, reclaimed from a
   commented-out block: seven textlines of Ratzor Rathai, the Rat Prince Who Be
   Promised, explaining that the things that ARE the walls were given his papa's
   blessing and were too weak to reject it. Three link errors were repaired on the
   way in - see [CHANGELOG.md](CHANGELOG.md). The Infinite Rat Saga's last task,
   marked `(tbc)` since it was written, is completable.
5. **DONE.** Q6 pays off the village guard's deflection, and her own lines
   supplied the mechanism. *"Two can be easily presented through some sparring,
   so let's start with it. The third I'll just have to explain"* - so the two
   stances nothing grants today are the two that can only be survived, which is
   also why she stopped at three, and why *"I'm generally a terrible teacher"* is
   a method rather than modesty. She does not teach them. She spars them into you
   and tells you that you are already doing them wrong, which is the point.

   Not a Challenge_zone: *"I'm way too strong for you"* is canon, so she cannot
   be an enemy the player defeats. What is measured is lasting long enough to
   steal something.

   What stays open is what the millers already chose to leave alone - whether she
   is the top-ten adventurer who retired just before she came back. She refuses
   the question in as many words, and corrects only the craftsman's verdict:
   *"it was not talent."*

6. **DONE, and it was the missing first one.** *The Merchant's Word* gives the
   merchant guild a body, and the gate its second key. The factor sits at a
   folding table OUTSIDE the wall, which is the point: a supplier does not need
   to be let in to sell, only to be worth letting in.

   He buys the three things nobody else can bring him - linen from tribe flax,
   alligator leather from the tanner's recipe, jerky from the cook's - and the
   reason is a supply argument rather than a favour: *"Nobody comes back from
   there, so there is no supply, so there is no price - and a guild that has no
   price for a thing does not know what to do with it when somebody finally
   brings one."* Three deliveries, three prices on his slate, and then the
   cheapest membership the guild has ever issued.

   The gate's `supplier` line mirrors `known` exactly, because it is the same
   gate; the difference is which of the two keys the player brought. Each locks
   the other, so a player who walked in on reputation is not offered a note they
   no longer need.

**All six quests of the arc are built.** The gate has both of its keys, the town
interiors have people in them, the robbery has a client nobody can name, the
second gate opens with mind, and the guard finally spars. Silver, the rat, the
deep dive, the ingot recipe and the last two stances are all reclaimed - the
"authored but unreachable" list in [STORY.md](STORY.md) is empty.

What must stay open: who paid for the robbery, how the hero came to have the
object, whether the guard is the retired adventurer, the four unbuilt regions,
the banished tribe, and the Rat God.

---

### P-10 — Build the four regions `done`

Directive: the unbuilt regions are to be built, and story work continues.

**All four are already named, and by one NPC.** The swamp cook's geography lesson
is the whole specification, and it is grief rather than a map - every line is about
what the snake's soul used to include:

> *"Ahh`! The lands! They are the soul! But it used to be larger! The mountain! The
> plains! The woods! The bay! All used to be with the snake's soul!"*

| Region | His line | State |
| --- | --- | --- |
| **The mountain** | *"Northwest, where the walking rocks and falling water are!"* | Partly built: Mountain path, Mountain camp, Waterfall basin. Needs depth, not creation. |
| **The wet woods** | *"South of the falling water! The wet woods! That was where we gathered! But now?! It is just home of the walking rocks!"* | Unbuilt. |
| **The plains** | *"Southeast! The snake would hunt! But the snake split! And now no snakes go to the plains!"* | Unbuilt. Where the banished tribe went. |
| **The bay** | *"Far to the north! Many spice and meat and metal and leather come from there! From very far away! It good place to go! To leave!"* | Unbuilt. The trade hub the guild's goods flow toward. |

Execution order, highest leverage first:

1. **The wet woods — DONE.** South from the Waterfall basin, found by asking the
   cook about the woods rather than by stumbling on it: the line that names them
   is the line that opens them. A forest standing in water, held by his walking
   rocks, and clearing the Drowned grove hands back what the tribe used to gather.

   What they gathered is flax, and that was not decoration. The guild factor wants
   twenty Linen cloth, a cloth is ten Flax, and every one of those two hundred had
   to come from a single Riverbank activity on the far side of the map - so quest 1
   shipped with a supply it did not have. The gathering ground fixes the quest that
   preceded it, which is what *"that was where we gathered"* has to mean.

   The room's description moves in three stages with the grove's clear count, so
   the region reads as recovering rather than as a switch, and the cook gets the
   only answer any line in his geography lesson has ever had.
2. **The plains — DONE.** Southeast past the Swampland fields, opened by the cook
   talking about them. Built as an absence rather than as a place: his line is about
   a hunting ground that was abandoned, so the danger is that nothing hunts there
   any more, and what moved in is the Old hunting ground.

   `No Snakes Go to the Plains` takes its name from his line, and its reward is not
   an item - the swampland chief finishes the sentence he broke off the day he gave
   you his ring. That was a deliberately-open hook and nothing had ever come back
   to it.

   The banished tribe are still not found. Their traces are there; who they became
   stays the open question the swamp is built on.
3. **The bay — DONE.** Three days north of the gate, opened by asking the factor what
   goes back down the road. The reason to leave arrived with quest 4: the collector's
   second piece *"did not stay the night"*, and this is the road it left on.

   The road is the obstacle - a Combat_zone off the outskirts, cleared rather than
   walked through - and the bay itself is built as a departure: eleven buildings,
   nine of them sheds, nobody from there. The salt house keeps the cook's promise of
   *"spice and meat and metal and leather"* out of existing templates at a margin
   that says everything in it has been on a boat, in its own market region because
   it is a month from every other market in the game.

   The payoff is the departures book: the **Marrowmoth**, one unweighed crate, and
   an account column struck through twice. Who paid is untouched. What is new is a
   hull that comes back twice a year and is not due.
4. **The mountain — DONE.** Depth rather than ground, and the depth was already
   named in [STORY.md](STORY.md)'s frontier note: the gear ceiling is a station
   ceiling. Every crafting station in the game had forging and smelting at 1 while
   components go to tier 5, so everything the player had ever forged rolled its
   quality at a penalty.

   The camp is already the player's own and its own ambient line is the wind, so a
   draught-fed forge belongs there and nobody has to hand it over. The old craftsman
   names the limit in his own hearth, which his teaching had always implied and never
   said. The tiers are a getter over a global flag, at 3 rather than 2, because 2
   would leave tier-4 and tier-5 components still rolling short.

   **All four lands are now in the game.**

**A fifth thread, not one of his four.** The `gaze` action past the Forest lake ends
*"You try to make out the details of what looks like a bird flying in the distance.
It has four legs... [tbc]"* - the forest's heart, marked to be continued by its own
author. It belongs to no region and should not be folded into one.

**What must stay open.** The banished tribe themselves: the plains can be walked
and their traces found, but finding *them* answers the question the swamp is built
on. The four-legged bird. The Rat God. Who paid for the robbery. Whether the
village guard is the retired adventurer.

Two `[To be continued]` quest tasks also sit unwired and belong to regions rather
than to this list: `Village expansion` task 7 and `Light in the darkness` task 2.

---
## Open decisions

Each of these changes what gets built. They are recorded here rather than guessed
at.

### Q-1 — Does this fork diverge in content? **DECIDED: full divergence**

New areas, items and dialogue are in scope. Upstream syncing is not a goal any
more. Refactors no longer need to stay merge-friendly with upstream, and Q-5
(untracking `dist/`) has since been decided in favour of untracking.

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
  [CHANGELOG.md](CHANGELOG.md) and leave the proposal here as a record.
- Decisions move from [Open decisions](#open-decisions) into the proposal that
  consumes them, with the answer recorded.
