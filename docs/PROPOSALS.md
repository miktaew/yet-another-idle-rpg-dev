<!-- doc-source: docs/PROPOSALS.md  doc-version: 65 -->

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


### P-14 — v0.7, the Marrowmoth `open`

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
- Tier 5 is blocked on two locale rows, not on design: `material white` and
  `material black` have no entry in either locale, so every white-steel and
  black-steel component would render its own key at the player. That is P-12's
  remaining first step and it is two lines.

#### Phases

Each phase ships on its own, passes `build` + `LOCALE_STRICT=1 check` + `test` +
`check:bundle`, and gets both changelog entries. No phase starts before the one
before it is green.

**Phase 0 — the ground.** No story. Settle Q-7 to Q-10. Correct whichever of
[STATUS.md](STATUS.md) and this file is wrong about item 48 and P-13/35, which
STATUS lists as in flight and this file does not carry. Measure the two quest tasks
that show no hint **in the running game** rather than from the source, and fix them.
Add the two missing material rows. Guard: none new; this phase is the one that makes
the following ones measurable.

**Phase 1 — v0.7.0, *No Word Sent*.** The player learns the Marrowmoth is back from
the world, never from a quest notification: the salt house's shelf changes, the bay's
ambient lines change, and the guild has a rumour. Built on the season condition and a
derived trader template, per Q-10. Quest 1 opens from the discovery, not the other
way round. Guard: `check_seasonal_content_is_reachable` — anything whose only source
is a seasonal window must occur in every year.

**Phase 2 — v0.7.1, *Forty Tons*.** Unloading, as actions on the existing bay, with a
manifest read as cargo / weight / origin / destination / seal / status. Every normal
line is complete. One is not, and the same crate went unweighed last time too, which
is stated and not explained. No new UI: the manifest is action success text and a
lore thread. Guard: covered by the existing class-level checks, which new actions
join automatically.

**Phase 3 — v0.7.2, *A Stroke Through It*.** Investigation, gated on standing, three
paths that give **different pieces rather than the same piece**: guild records, dock
worker testimony, old manifests. Thresholds derived from what is actually earnable
(610 Village, 350 Slums, 320 Town today) and from where the existing settlement
actions already sit, not invented. Guard: `check_reputation_regions_have_names` -
every key of `character.reputation` resolves to a display name in every locale;
negative-tested with a nameless region.

**Phase 4 — v0.7.3, *Out on the Ebb*.** The low-tide approach. Two new places at
most, per Q-9, with the anchorage and the cargo deck as actions rather than rooms.
Skill and action checks, not combat. Every gate names a skill that exists and every
failure says why and leaves another way — longer, dearer, or through standing. Guard:
`check_no_dead_end_skill_gates` — a task whose only advancer is a skill-gated action
must have a second advancer. This is the mechanical form of the owner's rule that a
failed check never locks a quest.

**Phase 5 — v0.7.4, *One Unweighed Crate*.** The crate is reached. It carries the
same hand as the object taken on the forest road — one motif, one metal, one
unexplained material — and nothing else. The player should finish with more questions
than answers, deliberately. Guard: `check_lore_threads_resolve`, if Q-8 lands on
threads.

**Phase 6 — v0.7.5, the systems pass.** The 20% the brief asks for and the part that
makes the arc worth having: stance choice made to matter through `on_hit` /
`on_damaged` rather than through stat bonuses; the arc's money sink priced against
the existing economy; tier-4 and tier-5 materials wired to what the ebb opens, which
is where P-12's "an ore that is mined rather than bought" belongs; standing
consequences that read as world-state and not as punishment.

**Phase 7 — v0.8 groundwork, *Beyond the Lake*.** Not started before phase 6 is
green. Traces first — tracks, feathers, noise, broken cover — and the player must be
unsure the four-legged bird exists at all before they meet it.

#### What this proposal must not do

Invent a fifth region, a second investigation UI, a scheduler framework, a
lockpicking skill, or a mystery's answer. Where authored content already covers a
beat, wire it up instead.
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

### Q-7 — Does guild standing become a fourth reputation region? **PROPOSED: yes**

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

### Q-8 — Where do investigation notes live? **PROPOSED: a lore thread, not a new panel**

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

### Q-9 — How many new places does the ebb chain need? **PROPOSED: two, not four**

The brief sketches Bay → low-tide flats → anchorage → cargo deck → lower hold. The
bay is deliberately the thinnest region in the game - three places, because a harbour
is somewhere you pass through - and four more would make it the largest after the
mountain, which says the wrong thing about it.

Two carry the whole chain: the **flats**, which is the approach and the thing the
tide gates, and the **hold**, which is the destination. The anchorage and the cargo
deck are actions on those two. Locations are cheap here, which is the trap: the test
is not what it costs to add a room but whether the room has anything in it, and a
corridor does not.

### Q-10 — How does "twice a year" work? **PROPOSED: two seasons, no scheduler**

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

---

## Conventions for this file

- One proposal per directive, numbered and never renumbered.
- When a proposal reaches `done`, write the explanation in
  [CHANGELOG.md](CHANGELOG.md) and then remove the proposal from this file. The
  account lives there, at developer depth; a second copy here turns the backlog into
  an archive and buries what is still open.
- Decisions move from [Open decisions](#open-decisions) into the proposal that
  consumes them, with the answer recorded.
