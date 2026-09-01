<!-- doc-source: docs/PROPOSALS.md  doc-version: 114 -->

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

**Phase 5 — v0.7.4, *One Unweighed Crate*.** `done`. The crate is reached, and the check
is not opening it — a crate is not a lock. It is Perception and Woodworking, because the
difficulty is reading a lashing nobody at this quay would tie and remaking it well enough
that the man who tied it would not look twice. Failure is working that out *before*
cutting anything, so nothing is cut and nothing is lost; the player sits with their back
against it until the water tells them to go.

Inside: straw, a bed cut out of a grey material that is not felt and is not cork and does
not compress, and one closed band the size of a wrist in a metal that is not iron, steel
or bronze and takes no mark from a nail — cut through all the way round with squares that
turn and come back to their own beginning. One motif, one metal, one unexplained
material, exactly as this proposal asked, and nothing else in the crate at all.

**It pays no item**, deliberately. An object in the inventory would have to do something,
and anything it did would answer a question this arc is not allowed to answer. What the
player leaves with is a description and a pattern they have been told about once before.

The arc closes on the **antique collector** rather than the tallyman, because he is the
only person in the game who can say *"same hand"* and be believed — forty years of
cataloguing the town's oldest things, and the other piece in his hand for about the time
it takes to boil water. He says three things and refuses the fourth: there are at least
two, somebody wants them, that somebody is not whoever makes them, and *"I want to be
careful, because you will remember what I say."* He does not say whose hand. That is the
one-layer rule holding, and [STORY.md](STORY.md) section 3 now records the three facts
and the list of what is still open, so the next arc cannot quietly widen them.

Guard: `check_lore_threads_resolve` from 2a — Q-8 did land on threads. The thread now
runs to five beats across three speakers, a quay, a guildhall and a shop across the
square, which is the shape Q-8 was written for at full size.

**Phase 6 — the systems pass.** `partly done`. Four independent pieces; one has
shipped.

- **Tier-4 and tier-5 materials wired to what the ebb opens.** `done`, as **v0.7.5**.
  This is where P-12's "an ore that is mined rather than bought" belonged, and it is
  answered from the region this arc opened rather than from one that does not exist yet:
  `Heavy sand` is dug on the tidal flats, which are only offered in the Marrowmoth's two
  seasons, so the tier-5 reagent inherits the arc's own window without a condition of
  its own. 36 components went from unmakeable to makeable and the tier-5 group came off
  `known_unmade`. What P-12 still carries is the station question, not a recipe.
- **Stance choice made to matter through `on_hit` / `on_damaged`** rather than through
  stat bonuses. `done`, as **v0.7.6**. Four enemies react and none of them gained a stat
  line: a swarm closes in against a point and is swept back by a broad stance, a frog's
  splash scales with how much of you is presented rather than with how hard you hit, and
  both dragonflies' stingers find a body that has committed to a swing. Written into the
  hooks that already existed, which is what P-14 measured - no second abstraction, and
  no new enemy, because the arc itself has no combat and phase 4 said so. The honest
  limit is that a hook can only reach `add_active_effect` and the log, so a reaction is
  always "how you are standing changes what this gets to do to you". Guard:
  `check_stance_reactions_name_real_stances` - a misspelt stance id compares false for
  every stance there is, so the reaction is written, translated, shipped and never once
  seen while the enemy behaves exactly as before.
- **The arc's money sink priced against the existing economy.** `done`, as **v0.7.10**.
  Measured: 43,500 in one-off quest money, 27,000 more from the guild factor's three
  deliveries, one 30,000 sink at the collector, and **no repeatable money-paying action
  anywhere** - the three settlement actions pay once each. So the only income that can be
  repeated is a paid job, and the best of those is patrolling at 50 a unit. The boatman
  was 25,000 *per trip*, which is 500 units of patrolling and about one affordable ride in
  the whole game: the dearer way across the mud was a way you took once. 6,000 now - the
  factor's smallest delivery, one job's pay for one boat ride, 120 units.

  **No guard, and that is the finding.** A rule was written and then removed: "a
  repeatable price must not exceed the dearest one-off price". It passes at 25,000, because
  25,000 is less than the collector's 30,000 - so it would have certified the exact fault
  it was written for. Every version that does catch it needs an invented constant, because
  the real question is a price against *income at that point in the game*, and that is a
  judgement. The numbers above are written into the proposal and beside the price in the
  source instead, so the next price is derived rather than picked.
- **Standing consequences that read as world-state and not as punishment.** `done`, as
  **v0.7.11**, and it completes the phase. The tallyman's own closing line already framed
  the choice - *"The day I write it down it is a guild matter"* - so the content did not
  need a decision inventing for it, only the other side of one. The clerk will open the
  file: Guild +60, Town +20, **Slums -40**, and it will be known that it came from the
  docks. Nothing forces it; the arc finishes either way and the line simply sits there.
  The old woman of the slums answers it, gated on a flag, and she is not angry - what she
  says is that for a while, when somebody down here has something they would rather was
  not written down, they will think about who they say it in front of. That is the
  difference the phase was asking for: a place having an opinion, not a score being
  docked.

  -40 against 350 earnable and the arc's own gates at 200 and 250. It can put the firm
  line out of reach for a while; wading the flats is free and the boatman is 6,000, so
  nothing closes.

  **And standing has a floor now**, which had to go in before the first reward in the
  game that subtracts. `add_reputation` used `+=` with no bound, and
  `update_displayed_reputation` draws only regions above 0 - so a player at -20 would
  have seen no row at all, with every gate still shut: invisible and consequential at
  once. Floored at 0, six tests, negative-tested by taking the floor out again.

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

### P-15 — Books, and the skills nothing teaches `open`

The owner's request: new books. Measured before planning, because a book here is cheap
and that is exactly why it should not be added carelessly.

**What exists.** Ten books, all in `src/items.js` as `Book` items with a matching
`book_stats` entry. `BookData` already supports everything a new book could want and no
engine work is needed: `required_time`, `required_skills`, `literacy_xp_rate`,
`bonuses.xp_multipliers` (per skill or `all`), `bonuses.multipliers` (character stats),
`rewards` (recipes and the other unlock kinds), and `finish_reward`. The ten are
*ABC for kids* (all xp ×1.2), *Old combat manual* (Combat), *Twist liek a snek* (Evasion
plus agility), *Medicine for dummies* (three alchemy recipes), *Butchering and you*,
*Ode to Whimsy*, *A Glint On The Sand*, *Shellfish desires*, *Wood for Witches* and
*Counting Mice*.

**What the gap actually is.** Not "there are too few books" — it is that the newest three
regions have none, and that the game has 64 skills against ten books. A book is the one
teaching surface that costs no location, no NPC and no combat, which makes it the right
tool for skills the world has no room to introduce any other way.

**Where new ones should come from, and the rule.** Reclamation over invention: every new
book teaches something that already exists and comes from a place that already exists.
Candidates measured against what is there rather than invented:

- The **guild** has a clerk, a board, a seal book and, since v0.7.2, standing. A book
  bought or earned there is the natural home for Literacy and Haggling.
- The **salt house** and the **bay** sell what came off a boat and have no book at all.
  A pilot's or a tallyman's book is where Perception, Spatial awareness and Swimming
  belong.
- The **mountain** has the game's only tier-3 station and no book. Forging and Smelting
  have no teaching surface anywhere.
- The **antique collector** catalogues; the **old woman of the slums** keeps a roster.
  Both are people whose whole characterisation is written records.

**Measured since, and both remaining candidates need a delivery decided rather than
derived.** The guild's Literacy niche is already filled: `read the seal book` grants
`skill_xp: {Literacy: 600}` at Guild 50, so a guild book teaching Literacy would be the
same lesson twice. And the mountain has neither a trader nor an NPC - the old craftsman is
in the Village - so a mountain book needs an action as its delivery, which is inventing a
mechanism rather than reusing one. Every one of the twelve books in the game today comes
from a trader's stock list.

Also measured: `finish_reward` and `required_skills` on `BookData` are read by nothing
(P-26), so a new book must not lean on either.

**What this must not do.** It must not become a shop of xp multipliers. A book that only
multiplies is the weakest thing `BookData` can do; the two most interesting existing ones
unlock *recipes*, and that is the shape to follow.

**Guard.** `check_books_can_be_got`, on the class
`check_components_can_be_made` already covers for components: every `Book` item must be
obtainable - by trader, drop, reward or recipe - or be on a written list with a reason.
Ten books and nothing checks that any of them can be reached today.

### P-16 — Magic, as its own arc `open`

The owner's observation, and it is correct and worse than it sounds. Measured:

- `skills["Wands"]` and `skills["Staffs"]` both exist, both under `Weapon mastery`, both
  with full rank names - *Wand casting*, *Wand mastery*, *Master of wands*.
- `character.stats` declares `max_mana`, `mana_regeneration_flat` and
  `mana_regeneration_percent`, and all three carry the comment **`//currently useless`**.
- `character.js` names three damage types in a comment: `"physical"`, `"elemental"`,
  `"magic"`.
- **There is not one wand or staff item in the game.** `grep -n "wand" src/items.js`
  returns nothing at all.
- Nothing reads the `magic` stat. Enemies declare it; it is 0 on every one of them.

So magic is exactly the shape tier 5 was before v0.7.5: a finished vocabulary with no
content behind it. Two of the game's 64 skills can never be levelled by any means,
because the weapons they scale do not exist.

**Q-11 is decided by the owner: magic is a third combat axis, and it is its own phase.**
Not a family of weapons - the whole axis. Mana is a real resource spent during ordinary
combat; spells carry damage and buff/debuff effects; `intuition` already exists and is
the stat magic reads; magic power is a real stat that skills and equipment raise, and
crossing thresholds of it adds properties. Mana-focused skills - regeneration and the
like - are part of it. Planned as **its own phase and its own version series, after the
current story**, which is the one thing both answers to Q-11 agreed on: it is a bigger
change than the entire Marrowmoth arc and it does not belong inside another phase.

Q-1's second revision is what makes this affordable: the fork diverges completely now, so
new skills, new stats and new systems are in scope. It is no longer "commits to nothing"
that decides.

**Not started, and deliberately not started yet.** P-14 phase 6 has two pieces left and
phase 7 has not begun; magic goes after the current story rather than beside it.

**What is decidable, and holds under either answer:**

- Whatever ships must make `Wands` and `Staffs` levellable, because a skill the player
  can see and can never raise is worse than no skill.
- The three mana stats stop being `//currently useless` - that comment goes when
  something reads them, and under this answer something will.
- No new region. Magic has to arrive through places and people that exist, the way tier 5
  arrived through the flats.
- The existing combat formulas are not to be broken to fit it. `intuition` and the
  `magic` damage type are already named; a third axis is built on those rather than beside
  them.

### P-26 — Two BookData fields that are read by nothing `open`

Found while measuring P-23. `BookData` declares six things a book can carry, and **two of
them are never read anywhere in `src/`**:

- `required_skills`, which looks like a gate on being able to read the book. *Nothing
  Bites Here* declares `{literacy: 6}` and the game does not enforce it; the book can be
  read at literacy 0.
- `finish_reward`, which looks like a reward that fires on finishing. Nothing consumes it,
  and no book sets it - so nobody has been bitten yet.

The second is a trap and the first is already a small lie in the data. P-15's own text
claims "`BookData` already supports everything a new book could want" and lists both,
which is how a future book would come to declare a requirement that is not one.

**Two honest ways out, and they are not equal.** Wiring `required_skills` up is a real
feature - a book you cannot read yet has to say so, and say why, or it is a locked door
nobody can see, which this project has a directive about. Deleting both fields is smaller
and loses nothing that exists. The measurement does not settle which; the owner's appetite
for gated books does.

**What must not happen** is a third book declaring `required_skills`. *What the Water Gives
Up* was written without one on purpose and says so where the field would have gone.

**Guard.** Whichever way it goes, the class is "a declared field that nothing reads", and
it is checkable: every field a data class declares should be named somewhere outside its
own constructor. That is a broader check than this proposal and would probably find more
than two.



### P-34 — A repeatable action needs a "try again" beside "Finish" `open`

The owner's request, from a failed lock: a **try again** button under the result, so a
repeatable attempt can be repeated without leaving the screen and coming back.

**Measured, and the cost is small because the pieces exist.** When a `GameAction` finishes,
`update_game_action_finish_button` writes one button - `action_end_div`, text `ui finish`,
`onclick="end_activity()"`. There is no second button and no way back into the same action
except finishing, returning to the location and clicking it again: two clicks and a screen
change for every failed pick.

Starting an action is already reachable from markup. `start_game_action` is on `window`
(`main.js`) and the location list uses it directly:

```js
location_action_div.setAttribute("onclick", "start_game_action(this.getAttribute('data-location_action'));");
```

So a repeat button is that same call with the action id the box already knows, placed beside
`action_end_div`.

**When it should appear, and this is the whole of the design.** Only when repeating is
actually possible, or it is a button that fails: the action must be `repeatable`, and its
`required` must still be met - `can_be_started(character)` answers exactly that and is
already on `GameAction`. For the lock both hold right after a failure by design, since
`remove_on_success` keeps the chest; for a delivery that consumed its materials, neither
holds and the button should not be there.

**What needs deciding.**

- **Whether it appears after a success too.** After a successful pick the chest is gone, so
  `can_be_started` is false and the question answers itself - but for an action whose
  requirement is a skill rather than an item, success leaves it startable, and offering
  "again" immediately turns a considered action into a click-through.
- **Whether it should also carry the attempt's cost.** The lock's cost is time, which
  `keep_progress` preserves; an action that spends something on failure would be charging
  again from a button that reads like undo.

**Guard.** The class is "a button offered for something that cannot be done", which
`check_onclick_names_are_reachable` covers for names and not for state. The honest guard
here is a test that the button is built only when `can_be_started` is true - which means the
condition has to live in a function that a test can call, not inline in the DOM builder.



### P-36 — The town square is thinner than the village `open`

The owner's request, in three parts and one comparison: the town square needs alternative
ways to raise skills the way the village has, it should have a trader, and standing watch
should pay.

**Measured, because "thinner" is checkable.** Counted per settlement - actions, activities
and traders - the village is the richest place in the game and the town square has almost
none of it. That is not an accident: the village is where the game starts and where its
tutorial surface lives. It is still the gap the owner is pointing at, because the town is
where a player spends the middle of the game.

**What each part costs.**

- **Skill practice.** The village's running, weightlifting and meditation are
  `LocationActivity` entries - a skill, a time per tick, and nothing else. The town square
  can have its own set with no new machinery, and the interesting question is *which*
  skills: repeating the village's would make the two places interchangeable, and the town
  has streets, crowds and a market rather than fields.
- **A trader.** P-25 settled the mechanism and P-19 the pricing: a trader needs a
  `market_region`, and the square's is `Town`, which already exists. What it must not be is
  a second general shop - the game has four of those and the two cafés were added in v0.7.9
  precisely because they sell what nobody else does.
- **Watch work that pays.** `Job` is the existing mechanism and the square is the one place
  in the town with no paid work. v0.7.10 measured the whole money economy for the boatman's
  price and that measurement is the input here: the only repeatable income in the game is
  patrolling at 50 a unit, so a second paid job changes the shape of every price that was
  set against it.

**What needs deciding.** Whether the town square should be *as* rich as the village or
differently rich. Making it a second village is the cheap answer and the wrong one; the
square is a market and a crossroads, and what it should offer is what a market and a
crossroads offer.


### P-37 — Does every panel update when the thing it shows changes? `open`

The owner's question, asked while P-32 was being built and pointing at the same class as
P-31: *"have we checked that fields like the inventory and the data panels get updated?"*

**What is already known, and it is only half.** `check_every_panel_updater_is_called`
(v0.7.23) proves that every function which draws a panel has a caller. It says nothing about
*when* that caller runs, which is exactly where P-31 lived: the Discoveries panel had five
callers and none of them fired while the panel was open, so a count sat still while the
player watched it.

The inventory list itself is redrawn from `add_to_character_inventory` on every pickup, and
v0.7.26 added a re-sort on stack top-ups while sorting by "latest". So the bag is not the
worry. The question is which of the other panels showing a live number are wired to the
thing they show.

**What has to be measured, not reasoned about.** For each panel that displays a value which
can change while it is on screen - character stats, money, active effects, quest progress,
the crafting materials list, the bestiary counts - whether a redraw is called from the path
that changes it. A panel drawn only on tab open is P-31 again.

**Why a check is hard here and worth thinking about first.** "Called when the value changes"
is not something a name scan can see, unlike "called at all". The honest version probably
pairs each panel with the state it reads and asks whether any writer of that state reaches
its updater - which is a call-graph question, and the first one this project would have.

### P-38 — Reputation already earned has to be credited backwards `open`

The owner's report, with a save to check it against
(`yet-another-idle-rpg 2026-09-01 17_49_16.txt`): *"we added it to the swamp, but the quests
are already finished - add a method that checks completed quests and updates the
reputations"*. The screenshot shows the Data panel listing Village 460, Slums 200 and Town
150, and no swamp row at all, taken while standing in the swamp tribe.

**Two facts measured before anything is designed.**

- **The missing row is not a display bug.** `update_displayed_reputation` shows a region
  only while its value is above zero, and says so in a comment above itself. So the absence
  of a swamp row is the panel reporting the truth: the standing really is nought.
- **The reward exists and cannot be reached.** Five swamp deliveries grant between 50 and 70
  Swamp each, added in v0.7.20. All five are one-time textlines, and this owner's save has
  them finished - which is what makes the standing unearnable rather than merely unearned.
  Nothing in the game can now give it.

**Measured against the owner's save (v0.7.25, checked with `npm run check:save` - every key
resolves).** The save's swamp standing is exactly 0, and 300 is on offer across the five
grants. At least 120 of it sits on textlines the save marks finished, which leaves 180
earnable - against `swampchief standing`, which wants `{Swamp: {at_least: 200}}`. **So the
chief's line is not merely unearned in this save, it is unreachable even after doing
everything the region still offers.** That is the sharpest form of the problem and it is what
makes a repair, rather than a patience, the answer.

**Why this is a class and not one region.** Any reward attached to content a player has
already finished has the same shape: the grant is written, the trigger is spent, and the
player is permanently short of something the design says they have earned. The swamp is the
instance that was noticed because a whole region's standing sat at zero.

**Decided by the owner, and decided generally rather than for this one case:** *"when the
game loads, when the page opens, the checks should run once. A save migration should be
done. On a version increase - we added reputation to the swamp, for example - the user's save
does not have that information. So when moving up to the higher version it should add it,
check the existing save and apply the updates."*

So: a migration keyed to the version, run once as the save is loaded. That is the pattern
`save_load.js` already uses in a dozen places - `is_a_older_than_b(save_data["game version"],
"v0.4.6.12")` and its kin - and the version comparison is what makes it run once and never
again, with no need to record what was already paid.

**What that turns the job into.** Not "credit the swamp" but a migration step that, for a
save written before the version which added a reputation grant, works out what the finished
content owes and pays it. The swamp is the first entry in that step; the machinery is what
the next grant needs.

**The guard has to hold the class.** A reward added to content that can already be finished,
with no path that credits it afterwards. That is checkable: a one-time textline or quest that
grants something, against whether anything reconciles that grant for a save where it is
already spent.

---

## Open decisions

Each of these changes what gets built. They are recorded here rather than guessed
at. What is left here is project-wide; a question asked by one proposal moves into
that proposal once it is answered, which is where Q-7 to Q-10 went — see
[Decisions carried into the phases](#decisions-carried-into-the-phases) inside P-14.

### Q-1 — Does this fork diverge in content? **REVISED AGAIN: diverge completely**

**2026-09-01, the owner.** The work that was going upstream has gone: the pull requests
are open and nothing further is owed to them. The fork is no longer holding itself to
upstream's shape, and that includes the engine - **new skills, new systems and new
mechanics are all in scope now, not only new content.**

What that changes in practice:

- The line "our refactors should move toward upstream's layout" is lifted. Where their
  shape is better it is still worth copying, on its merits, but it is no longer a
  constraint.
- P-15 and P-16 stop being limited to what already exists. P-16's Q-11 in particular was
  argued partly on "commits to nothing", and that argument is weaker now: a third combat
  axis is no longer out of character for the fork, only expensive.
- Nothing about D-3, D-5 or D-7 changes. The translation layer, the locale rule and the
  Turkish standard were never upstream's and are not affected.
- What does not change either: **reclamation over invention** stays the first question.
  Being free to add a system is not a reason to add one where extending an existing one
  would do, and the last six versions are the argument for that.

The previous answer is kept below because commits and changelog entries refer to it.

---

### Q-1 (previous) — **REVISED: diverge in content, converge in code**

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
