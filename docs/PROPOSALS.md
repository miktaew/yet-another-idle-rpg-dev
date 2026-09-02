<!-- doc-source: docs/PROPOSALS.md  doc-version: 150 -->

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

### D-10 — A player-visible change ships with its help entry `standing`

**2026-09-02, owner.** *"Do not skip updating help along with the items you add. The guild
has just been added to, for instance - is there anything answering to it in help?"* And:
*"new regions, new features and the like have to be edited into the helps."*

There was not, and the measurement was worse than the question implied: **of the eight
journal tabs, `help.html` named only Data.** Quests, Bestiary, Anthology, Discoveries, Lore
and Titles were not named at all, and neither were the inventory's fourth sort, the retry
button, the crafting filter or books that require a skill.

So the rule, alongside D-9's version rule and asked at the same moment: **if the change
earns a version, it earns a help entry.** Both pages, `help.html` and `help.tr.html`, at the
same time and in the same commit - the Turkish one written as Turkish (D-7), not translated
after the fact. A new region goes in the world map section; a new panel or system gets named
where the player would look for it.

`npm run check` already holds two pieces of the page to this - the map covers all 71
locations, and the standing block names every reputation region - so the pattern for
guarding a third is there. P-44 is the backlog this directive found.

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
- ~~The **salt house** and the **bay**~~ **filled since, by the Marrowmoth arc.** *Nothing
  Bites Here* is in the bay's two stock lists and teaches Fishing. The niche this named is
  taken.
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

**Guard.** `check_books_can_be_got` **exists and passes** - written since this proposal
was, on the class `check_components_can_be_made` covers for components: every `Book` item
must be obtainable, by trader, drop, reward or recipe, or be on a written list with a
reason. 12 books, all templated and all reachable.

**Re-measured, and every candidate this proposal named is now closed or blocked.** The bay
and the guild are filled; the mountain, the collector and the old woman have no stock list,
so each needs a delivery invented rather than reused, and all twelve books in the game come
from a trader's.

**One candidate this proposal could not have known about:** the square stallholder, added in
v0.7.33, is a trader with a stock list and no book. What it would teach is the open part.
Measured: 66 skills and 12 books, 56 skills untouched by any book, and **no locked recipe is
unlocked by nothing** - so a new book cannot reclaim recipes the way *Wood for Witches* did.
It would have to bring recipes of its own, which is a content job rather than a book, or be
an xp multiplier, which this proposal rules out in its own words.

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

**Not started, and deliberately not started yet.** v0.7 closed at v0.7.42 and P-14 has
left this file, so the story magic was waiting behind is finished - but the rule it was
waiting for has not changed, and the current story is now P-43. Magic goes **after** it
rather than beside it.

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

### P-41 — Guild work: a board of jobs, standing, and a shop that answers it `active`

The owner's request: *"let us add random quests from the guild, A through S. We should be able
to take different ones, and they should sit somewhere separate called guild quests. Different
types - hunt x monsters, gather y of something - and they should raise guild reputation. With
guild reputation we should get different rewards from the guild shop, different rewards at
certain milestones. Maybe we can add guild-only items."*

**What already exists, measured.** `Guild` is a real reputation region and it is at 0 in the
owner's save; the guild factor's dialogue grants it in three places; a `Guild` gate already
exists. The quest machinery handles tasks, hidden tasks, ordered completion and task rewards.
So the region, the currency and the task engine are all in place.

**What does not exist, and it is the whole of the work.** Every quest in the game is written
by hand, named, and reached from a specific line of dialogue. Nothing generates one, nothing
holds a pool of them, and nothing offers a choice of several. A board of randomised jobs is a
new mechanism: it needs a generator, a place to keep the ones currently on offer, a rule for
how they refresh, and a save shape - because a job the player accepted has to survive a
reload.

**Four decisions before any of it is written.**

- **What "A through S" means.** Nineteen tiers of difficulty, or nineteen distinct jobs? The
  first is a ladder and needs a scaling rule; the second is a pool and needs nineteen written
  briefs.
- **Where they refresh.** Per in-game day, per visit, or on completion. This is the difference
  between a board the player checks and a board the player farms.
- **How they pay standing.** A fixed amount per tier is simple and predictable; scaling with
  the job makes the ladder matter. Either way the total has to be bounded, because
  `check_a_standing_gate_can_be_reached` compares grants against gates and a repeatable source
  makes a region unbounded - which would silence that check for the guild.
- **What guild-only items are for.** Items nobody else sells is a good reason for a shop to
  exist (the two cafés were added in v0.7.9 for exactly that). Items nobody else sells *and*
  that are better than what the player has is a power curve, and the game's is already set by
  tier.

**Where it should live.** A separate panel, as asked. `Guild` standing already has a row in the
Data panel once it is above nought, so the milestones have somewhere to be read off.

**Done so far.**

- **The ranks.** `done`, as **v0.7.41**. F to SSS, derived from Guild standing rather than
  saved - higher work pays more standing, so standing already is the promotion track, and a
  derived rank needs no new save key. 255 is everything the existing content pays and lands on
  D. `get_offered_guild_ranks` is the board's window, already written and guarded.

- **The job generator.** `done`, and unversioned because nothing draws it yet. `guild_jobs.js`
  derives everything from data the game already declares: enemy `rank` 1-11 for how hard a hunt
  is, material `value` for goods, and the ladder's own gaps for the pay. The ceiling Q-14 asked
  for lives in `standing_paid_for`.

  **Measured, and it moved the design twice.** The quest engine already counts `kill_any` by
  tag, so a hunt is an existing `QuestTask` shape rather than new machinery - but there is **no
  gather event** among the five it fires, so a gather job has to hand goods over the way the
  swamp deliveries do. And both target pools were wrong until measured: `living` and `beast`
  span all eleven enemy ranks, and "every material" offered Black iron chainmail as something
  to fetch.

- **The board.** `done`, as **v0.7.43**, and it is the first thing in the game that builds a
  piece of content at runtime. `game_state.guild_board` holds `{day, offered, accepted}` and
  `guild_jobs.js` decides what may go in it - that split is why the rules are testable at all,
  since `refreshed_board`, `accept_from_board` and `restored_board` are pure functions over
  that object.

  **Q-14's two answers that are rules rather than numbers are both enforced.** Per game day,
  so `refreshed_board` hands back the *same object* until the day turns - which is why it is
  asked every tick rather than hooked onto the day boundary, and why a save with no day in its
  board rolls one on the next tick with no special case anywhere. And an accepted job survives
  that refresh, carried across by hand.

  **One job at a time**, which Q-14 did not settle, taken as the narrow reading: taking
  *different* jobs is a choice among what is offered, not a licence to hold three. Widening it
  is `accept_from_board` and a list.

  **The save shape's interesting half is the targets.** A hunt names an enemy tag and a gather
  names a material - both registry keys that can stop existing between a save being written
  and read - and a job holding a name nothing answers to can never be completed or handed in.
  With one job slot, an accepted one being stuck ends the feature for that save. So
  `restored_board` drops any job whose target no longer resolves and is forgiving about
  everything else: an unrecognised board becomes an empty one with `day: null`. The owner's
  v0.7.26 export, which has no board key, loads clean.

  Three things reused rather than built: a `*_display.js` module (P-42's measured pattern),
  the existing `changeTab` tab machinery, and the clerk's own `is_heard` as what opens the
  board - a flag of its own would have been a second piece of state agreeing with one that
  already exists and is already saved.

- **Handing it in.** `done`, as **v0.7.44**. A hunt counts from the moment the job was
  taken, advanced inside the tag loop `kill_enemy` already runs for the quest engine's
  `kill_any` events and under the same `do_quest_events` guard, so a replay cannot count a
  kill twice. A fetch counts what the player holds and takes it cheapest first.

  **The measurement that decided the fetch.** An inventory key is JSON and carries the
  quality, so a quality-rolled material is held in one stack per quality - the owner's save
  holds Ratfish in **seven**, Carp in six, Mackerel shark in six, and 7 of the 30 gatherable
  materials are quality-rolled. The engine's own `items_by_id` asks whether ONE stack holds
  enough, which is right for the sixteen declared places that use it (none names a
  quality-rolled material) and would have been wrong here with no symptom: forty fish in the
  bag and a hand-in that refuses. `held_of` sums across stacks.

  The two are counted differently on purpose: a kill cannot un-happen, so it accumulates;
  goods can be sold between taking a job and finishing it, so they are counted when asked
  for. Past the top of the ladder the pay is 0, the reward call is skipped and a second log
  line says so rather than claiming a promotion.

  Guarded by three checks and negative-tested with six reintroduced bugs. The third guard is
  the one worth naming: `kill_enemy` counts inside `if(target.add_to_bestiary)` and **seven
  enemies have that false**, so `check_every_hunt_target_can_be_counted` fails if a tag the
  board can offer ever becomes entirely uncountable - the symptom would be a job that never
  advances however much of the right thing is killed.

  **And its help**, per D-10: a Guild work section on both pages, and the standing list no
  longer calls the Guild "the merchant Guild" - the clerk has paid into that region since
  before P-41. One region, two houses.

- **Giving a job up.** `done`, as **v0.7.46**, and asked for with its reason attached:
  *"I took a job to gather heavy sand and I do not know where to gather it."* Both halves
  were worth doing. A fetch now says **where the thing is gathered**, read from the world
  index the Discoveries panel already answers that question with - measured first, and all 30
  gatherable materials have at least one named place, so the line is never empty. And `Give
  up` hands the notice back for `standing_lost_for_giving_up`: half of the rank-and-difficulty
  pay, rounded up, never more standing than the player has, with the price on the button
  rather than behind a confirmation.

  Deliberately **not** `standing_paid_for`, which returns 0 past the top of the ladder
  because of Q-14's ceiling - that would make giving up free for the one player with the most
  standing to lose.

- **Three jobs, and deadlines on some of them.** `open`, and it **supersedes the
  one-at-a-time reading** taken at v0.7.43. The owner: *"you can take more than one guild
  job, up to three. Some jobs can be fixed, but some can have a time limit. If it is not done
  in time a penalty can apply."*

  Q-14 did not settle how many could be held, so v0.7.43 took the narrow reading and said so;
  this is the answer, and the widening is what that entry predicted - `accept_from_board` and
  a list. The save shape moves from `accepted` to `accepted[]`, and `restored_board` has to
  read both, because saves written between v0.7.43 and this hold the single form.

  **The deadline is the part that needs designing rather than widening.** A time limit needs
  a day to measure against, and the board already keeps one - `day` is how the refresh works
  - so a job can carry the day it is due. What has to be decided is what happens at the
  deadline: the penalty is presumably `standing_lost_for_giving_up` applied without the
  player choosing it, but *when* it is applied matters. Checking on the day tick is where the
  refresh already looks, and it means a job can expire while the player is not looking at the
  panel, so the log has to say it rather than the panel.

  And which jobs get one: *"some jobs can be fixed"* means a deadline is a property of the
  job like difficulty is, not of every job. Rolled by the generator, then, alongside plain,
  long and brutal.

  **Not to be built before the shop**, because the shop is what standing is *for* and a
  penalty that costs standing means more once there is something to spend it on.

**Next:** the shop, which is the last piece. Guild-only items at a standing price, with
milestone rewards - and Q-14's fourth answer already bounds it, since the board's pay stops
at the top of the ladder.

**Handing in is the piece that decides what a job costs to finish**, and it has one thing to
measure before it is written: a hunt has to count kills of a *tag* since the job was accepted,
and there is no per-tag kill counter - only per-enemy counts, which the bestiary already
shows. Summing those over the enemies carrying the tag and snapshotting at acceptance would
reuse state that exists; anything else is a new counter. A gather job hands goods over, which
the swamp deliveries already do.

Until then the panel says so where the player takes a job: taking works and persists, and the
clerk cannot take finished work in yet. A player who did the work and found nowhere to put it
would be right to think it was broken.

### P-42 — The big files, and what to use instead of TypeScript `active`

The owner's request: *"files like display.js have got very big, we need to apply a general
component approach. You said TypeScript is illogical - what is the alternative?"*

**Measured first, and it moves the target twice.**

- **`display.js` is not the biggest file.** 3988 lines, against `src/data/skills.js` 5797,
  `src/items.js` 5464, `src/data/locations.js` 5537 and `src/main.js` 4751.
- **It is not a tangle either.** 118 top-level functions, and grouped by what they draw the
  largest cluster is *two*: money. It is one function per thing - stats, time, temperature,
  storage, the purse - sharing a file. So the cost of its size is **navigation, not coupling**,
  and that is a different problem with a different fix.
- **The project already splits it this way, and it worked.** `inventory_display.js`,
  `crafting_display.js`, `skills_display.js`, `journal_panels.js` and `item_tooltips.js` all
  came out of display.js.
- **A component system already exists.** `src/components/` holds `availability_component.js`
  and `inventory_component.js`, and `component_management.js` grafts shared methods onto every
  class that registers itself. That is the mechanism to extend rather than replace.

**So the answer to "a general component approach" is: the two patterns already here.** A panel
becomes a `*_display.js` module; behaviour shared between classes becomes a component with a
graft. Neither needs inventing, and the file that would pay most for a split is **not
display.js** - it is `items.js`, one file holding every item declaration in the game.

**And the alternative to TypeScript is JSDoc with `checkJs`.**

A `jsconfig.json` carrying `"checkJs": true` type-checks the JavaScript that is already
written, from the JSDoc that is already there - 76 annotations in `main.js`, 41 in
`display.js`. What that buys, against a TypeScript migration:

- **no syntax change**: the source stays the JavaScript the browser runs, and esbuild keeps
  doing exactly what it does;
- **no migration**: it is turned on one file at a time with `// @ts-check`, so it never
  produces a thousand errors nobody will read;
- **reversible**: it is one file, and deleting it changes nothing about the build.

**But the measured argument matters more than the tooling one.** Almost none of the faults this
project has actually shipped were shape errors. They were reachability and ordering: a flag
nothing grants, a quest nothing starts, a panel redrawn before the value it shows is written, a
recipe that cannot say whether it can be made, an unlock whose trigger was already spent.
**TypeScript catches none of those.** The 232 checks do, and they were written because it does
not. Typing is worth having for what it is good at - a misspelt property, a wrong argument
count - and it is not the answer to the problem the size of these files is causing.

#### The owner's four questions, 2026-09-02

*"Instead of listing everything under src, would it not be more correct to fold it into
folders by type and subject? Would using models more not be better for type safety, instead
of any-any? And would it make a difference if main.js behaved only as an orchestrator?"* And
separately: *"if we split data like items and quests out as JSON and fed from that, would it
make things easier?"*

Measured, and three of the four have a clear answer.

**JSON: yes for items and recipes, no for quests, and the number is decisive.** The question
is only ever "does this declaration contain a function", because JSON cannot hold one:

| file | declarations | containing a function |
|---|---|---|
| `items.js` | 256 | **1** (0%) |
| `crafting_recipes.js` | 148 | **0** (0%) |
| `quests.js` | 23 | **20** (87%) |

So `items.js` and `crafting_recipes.js` are data pretending to be code - 404 declarations
between them and one function - and moving them to JSON removes 7,700 lines of source
without changing a single behaviour. `quests.js` is the opposite: its 23 quests are 87%
functions, because a task's condition and its hint are computed. Feeding quests from JSON
would mean inventing a language for those functions inside the JSON, which is how data
formats become bad programming languages.

**This replaces P-42's step 2 rather than competing with it.** Step 2 was "split `items.js`
by the families it already groups itself into in comments". A JSON move is the same work with
a better ending: the split falls out of it for free (one file per family, or one array), and
the loader is the only new code. The guard is the one step 2 already had -
`npm run check:bundle`, `Verify_Game_Objects()` and `npm run check:save` against a real
export - plus a check that every id in the JSON resolves, which `check_save_keys_round_trip`
and the registry checks already do from the other direction.

**Folding `src/` by subject: yes, and it is nearly free.** 45 files at the top level against
four folders that already exist and already mean something - `data/`, `models/`,
`components/`, `mods/`. The convention is there; it just stopped being followed. Renames are
cheap here because nothing outside `src/` imports by path and the bundle is built from one
entry point. **But it is worth doing after the JSON move and after any file splits**, not
before: moving a file twice costs twice, and both of those decide which folder a file
belongs in.

**models/ and `any`: yes, and P-42's step 1 already measured the cost.** `models/` holds two
files. The type check is on for 26 of 56 files and the project-wide probe still reports 1672
errors across 30 - and **two thirds of them are two codes**, TS2353 and TS2740, which are the
same finding: *the data files declare content objects carrying more fields than any
constructor names.* That is exactly what a model is for. So the order is not "write models,
then types" - it is: every file whose declarations move into JSON needs a shape to validate
against, and that shape IS the model. The JSON move and the models are one job, and doing
them apart would be doing the same reading twice.

**main.js as an orchestrator: the least clear of the four, and the honest answer is "not
yet".** 4,930 lines, 121 top-level functions, 96 of them hung on `window`, 41 imports. The 96
window bindings are the real shape: `main.js` is not a god object so much as *the file the
HTML can reach*, because every `onclick` in `index.html` needs a global. So "orchestrator
only" is not a refactor of `main.js` - it is a decision about how the DOM calls into the
game, and that is a bigger and riskier change than any of the three above. `display.js`
proved the cheap version of it works (five panels moved out, one-way imports, no cycle), and
`guild_display.js` at v0.7.43 is the same pattern again. **Proposal: keep moving panels out
until what is left in `main.js` is the loop, the content stack and the window bindings, and
judge it then.** The 96 bindings are the number to watch; if they stay 96 while the file
halves, the answer was yes.

**The first family is done.** 111 of the 112 materials are in `src/data/materials.json`;
`items.js` is 4,901 lines rather than 5,464. `Rough wood log` stayed in source because its
`getName` calls `is_rat()`. Proved by snapshotting the constructed registry before and after:
112 of 112 identical.

Two things it taught, both of which make the next family cheaper. `with { type: "json" }` is
required, not optional - esbuild accepts a bare JSON import and Node refuses it, and the
checks run on Node. And **five checks derived "what is an item template" by grepping
items.js**, so the move produced 171 check errors naming materials that worked perfectly;
`tests/lib/item-keys.mjs` answers that from both places now, and
`check_item_data_files_are_all_read` fails if a new data file is not listed there.

**Next: `crafting_recipes.js`,** 148 declarations and none with a function. Then the models,
which is the same reading done once rather than twice.

**Sequenced:** JSON + models for `items.js` and `crafting_recipes.js` first, because it is
the one with a measured 404-to-1 argument behind it. Then the folder layout, once the files
have stopped moving. `main.js` last, and only as far as the panels take it.

**The order this should go in, smallest first.**

1. `jsconfig.json` with `checkJs`, and `// @ts-check` on the leaf modules that have no imports
   or one - `game_time.js`, `misc.js`, `config.js`, `reputation.js`. Measure how much it finds.
2. One split, chosen by measurement rather than by feel: `items.js` into the item families it
   already groups itself into in comments.
3. `display.js` only after that, and by panel, the way the five existing splits went.

**Step 1 is done, and the measurement is worth keeping.** With `checkJs` on for everything
TypeScript reports **1690 errors across 37 of the 56 files** in about two seconds. So `checkJs`
is `false` in `jsconfig.json` and a file opts in by carrying `// @ts-check`: **19 files are
already clean** and now hold the pragma, and `npm run check:types` passes. The danger of an
opt-in is that it only ever has to go *backwards* to keep passing - delete the pragma and the
errors go away - so `check_checked_files_stay_checked` asks TypeScript which files *would* pass
and fails if any of them is not opted in. There is no list to maintain and no number to keep in
step. It caught `weather.js`, which was clean and which I had not opted in.

The runway, so step 1b is a measurement rather than a guess. Six files are one or two errors
from clean - `world_index.js`, `ui_helpers.js`, `person.js`, `pathfinding.js`, `activities.js`
(1 each), `conditions.js` and `combat_stances.js` (2 each) - and the far end is `main.js` (294),
`data/dialogues.js` (289), `crafting_recipes.js` (160) and `data/locations.js` (157). Four codes
are two thirds of the total: TS2345 wrong argument type (679), TS2339 property not on the
inferred shape (448), TS2353 object literal with a property the shape does not declare (267),
TS2740 a literal missing properties the shape requires (99). Those last two are one thing -
**the data files declare content objects that carry more fields than any constructor names**,
which is the same finding the registry checks keep making from the other direction.

**Step 1b is done, and it paid for the whole exercise.** All seven of those files are clean and
opted in - **26 of 56 now**, up from 19; the project total is 1672 errors across 30 files. Two
of the nine errors were real: `combat_stances.js` tested `this.target_count` two lines before
assigning it, so a validation that throws on `target_count: 0` had never once run; and
`enemy_zones` was documented as returning sorted display names when it returns unsorted
location objects, which is what made TypeScript call every caller wrong. One more *looked*
real and was not - `zone.id` reads fine because `locations.js` backfills an id for every
location, measured at 46 of 46 resolving rather than argued from the four literal `id:`
declarations. The guard is
`check_constructors_do_not_test_fields_before_setting_them`, narrow on purpose: the wide
version of that rule finds thirteen correct lines here.

**Next is step 2, and step 1c is optional.** Nothing else is within two errors of clean; the
cheapest remaining files are `mods/glassmaking.js` and `data/storage.js` at four each, then
`races.js`, `market_saturation.js` and `crafting.js` at six. Whether to keep walking that list
or move to the `items.js` split is a judgement about which the owner would rather have, not a
measurement.

**And two silent failures, because this check exists to answer one question and got it wrong
twice.** It first reported all 38 unchecked files as needing a pragma: the probe config was
written to the temp directory, an `include` resolves against the config file's own directory,
so it matched nothing and tsc exited clean having checked *nothing*. Fixed, it did it again -
`execFileSync` defaults to a one-megabyte `maxBuffer`, and a megabyte and a half of errors makes
it **kill the process and hand back empty output rather than raise**. Both times "no output"
read as "everything passes". The check now refuses to answer at all when tsc did not exit on
its own, and that guard is what surfaced the third fault: Node will not spawn a `.cmd` shim
without a shell, so tsc runs through `process.execPath` on TypeScript's own entry script.

**Guard.** Whatever a split does, it must not change behaviour, and this project has the tool
for saying so: `npm run check:bundle` proves the bundle still evaluates, `Verify_Game_Objects()`
proves the registries still resolve, and `npm run check:save` proves a real save still loads.
A check for "no file over N lines" would be a rule invented from a number rather than a
measurement, and this file has enough of those already.

### P-43 — v0.8, Beyond the Lake `open`

The second main arc, and the successor to P-14. The brief names it and six focuses for it
(TODO section 16): the Ancient Forest, navigation, rare encounters, tier 5 gathering,
stance-focused combat, and environmental discoveries. What follows is those six measured
against the code, because three of them already exist in some form and one of them does not
exist at all.

**Sequenced after P-41 and P-42 on purpose.** The brief's own condition is *"move on to v0.8
after v0.7 is finished and all the quality gates pass"* - both true now - but the owner has
live requests still open in front of it, and an arc is a worse reason to leave those than
they are to wait.

**The door is already written, and phase 7 already put a trace on it.** `desc location Forest
lake` says the lake sits between the waterfall's cliff and *"a dense canopy leading to what
must be the forest's heart"*. Its only exits are the Forest road it came in by and `Frogs`, a
combat sub-zone with the lake as its `parent_location` - so the canopy is the one unopened
direction on the map, named in canon before anybody planned this. And phase 7's third trace,
the flattened reeds, lies *"on the far side, where the canopy comes down to the water"*. The
traces point at the door.

The Lake beach and the Waterfall basin are **not** past the lake, which is worth writing down
before somebody builds toward them: they hang off the Riverbank and are reached by scrambling
and rappelling. "Past Forest Lake" is the canopy and nothing else.

**Navigation does not exist and there is a mechanism to extend instead.** No `Navigation`,
`Pathfinding` or `Orienteering` skill - the brief assumes one that was never built. What does
exist is `travel_time_skills` on a connection, used eight times across the whole map and by
only two skills: `Scrambling` four times, `Climbing` four. A journey that a skill makes
shorter is therefore already a first-class idea here, and a region whose connections are long
and skill-shortened is navigation without a new system.

**Rare encounters now have their mechanism, and it is one release old.** v0.7.42's
`rolls_a_sighting` is the first per-in-game-minute, location-gated roll in the game, and
`chance_of` inside a rewards block (two uses, both in `locations.js`) is the
per-completion equivalent. So this focus is extension rather than invention - **and it must
not become a world-event framework.** That is the same trap Q-10 refused for the Marrowmoth's
timetable, and `data/marrowmoth.js` says so in its own comments. A second event wanting the
same wiring is when the abstraction has earned itself, and not before.

**Tier 5 gathering has a real, measurable hole in it, and filling it is reclamation.** Black
iron is the top material tier - `Black iron ore`, `Black iron ingot`, `Black iron plate`,
`Black iron chainmail`, all declared, with two crafting recipes consuming the ore. **Nothing
in the game gathers it.** Its only sources are two traders. Gathering itself tops out at
`skill_required: [20, 35]` across 26 activities. So this focus is exactly: somewhere past the
lake where black iron ore comes out of the ground above 35. Every item and recipe it feeds
already exists and is currently only buyable.

**Stance-focused combat extends seven stances that are already there** - normal, quick, heavy,
defensive, wide, berserk, flowing water - and phase 6 already made stance choice matter
through `on_hit` / `on_damaged` on four enemies rather than through stat lines, with
`check_stance_reactions_name_real_stances` guarding it. The honest limit that phase recorded
still applies: a hook reaches `add_active_effect` and the log, so a reaction is always "how
you are standing changes what this gets to do to you".

**Environmental discoveries is the one with no home.** The Discoveries panel knows five source
kinds - `gather`, `drop`, `trade`, `craft`, `train` - and every one of them is a way an
**item** was found. There is no kind for a thing that is not an item. Either the panel gains a
sixth kind, or environmental discovery is not a Discoveries feature at all and belongs with
the lore threads, which is where phase 7's traces went. This needs deciding before it is
built, not during.

**What the brief forbids, and what phase 7 has already spent.** *"Do not make the four-legged
bird a boss marker directly."* And v0.7.42 answered Q-13 by making it meetable at about one in
ten thousand - so this arc inherits a world where the player **may** have seen it, and cannot
assume either way. A gate on `has_seen_the_animal` would be a gate almost nobody passes; a
region that assumes they have not would be wrong for the ones who did.

**Q-15 — what does the Ancient Forest open onto, and what does the bird become? PROPOSED:
neither a boss nor an answer.** The brief says the creature is not a boss marker, and P-14's
whole method was that the arc names nothing. The proposal is that v0.8 is a **place**, not a
confrontation: the canopy opens on a region with its own work - the black iron, the long
skill-shortened journeys, the rare encounters - and the animal stays a resident of it rather
than becoming its objective. What that leaves undecided is whether anything in the region
*knows about* the animal, and that is the owner's call.

**Guard, before any of it.** This proposal must not open a second door into the region: the
canopy is one connection off `locations["Forest lake"]` and phase 7's reeds are already
pointing at it, so a region reached from two places would make the traces decorative. And the
first piece to be built must be measured the way P-14's were, because the brief's six focuses
are not six pieces of work - two of them (navigation, stance combat) are properties a region
has rather than features it contains.

### P-45 — The four skills that stop at ten `open`

The owner's request: *"let us raise the upper levels of the max-level-10 skills like night
vision, literacy, sleeping, farming."*

**Measured, and it is exactly those four.** The game's skills group by `max_level` like this:

| cap | how many | which |
|---|---|---|
| 10 | **4** | Night vision, Farming, Sleeping, Literacy |
| 20 | 1 | Presence sensing |
| 25 | 1 | Haggling |
| 30 | 16 | the stances, Shield blocking, Stance mastery … |
| 40 | 7 | Perception, Breathing, Regeneration … |
| 50 | 5 | Running, Climbing, Swimming … |
| 60 | 32 | Combat, Evasion, Unarmed … |

So the four are not a tier, they are the floor - and the next rung up holds one skill. A
player who levels any of them hits the ceiling long before anything else in the game stops
moving.

**What has to be decided before any number is picked, because a cap is not just a number.**
Each of these four has milestones and an effect that scales with level, so raising a cap
without extending the milestones gives levels that buy nothing - which is worse than a cap,
because the xp is real and the reward is not. `get_next_skill_milestone` and
`get_unlocked_skill_rewards` are what would have to be fed.

**And two of the four have effects that cannot simply keep scaling.** Sleeping and Night
vision both reduce a penalty; a penalty reduced past nought is a bonus, and that is a
different design decision from "let it go further". Literacy speeds reading and Farming
feeds an activity, so those two extend cleanly.

**A maxed skill keeps its xp, so raising a cap loses nothing - measured, because the owner
asked.** *"Literacy is level 10 now, does it keep taking xp? It needs to keep taking xp even
at maximum, and if there is an increase there should be no loss."* There is none:
`Skill.add_xp` writes `this.total_xp` **unconditionally**, before the
`if(this.current_level < this.max_level)` branch that stops the level moving; the save stores
`{total_xp}` and nothing else; and the loader rebuilds the level by replaying that xp. So a
cap raised later converts the accumulated xp into levels on the next load, with no migration
and nothing to repair.

That removes the risk this proposal would otherwise have had to carry, and it changes the
order: the caps can be raised whenever the milestones are ready, without racing to do it
before players bank xp against them.

**Guard.** `check_skill_effect_descriptions` and the milestone checks already hold a skill to
describing what it does at every level it can reach, so a cap raised past its milestones
should fail there rather than needing a new check. Worth confirming before relying on it.

### P-46 — The changelog page remembers where you were `open`

The owner's request, in four parts: *"let us filter major versions on the changelog, e.g.
v0.7, v0.6 - normally all selected, but if I leave only v0.7 it should remember that and show
v0.7 next time I open it. It should also remember the last version I looked at and show that
whole range expanded. If I have seen everything, the last one can stay open. And if I load an
old save and there is a newer version - old save v0.7.30, latest v0.7.45, so fifteen versions
apart - show a small (+15), and if I open the changelog by pressing it, those fifteen version
logs should come up expanded."*

**Four features, and they need separating because only two of them are about the page.**

- **The major filter** is page state: read the version headings, group them by minor
  (`v0.7`, `v0.6`), offer them as toggles, all on by default. Its memory is a browser
  concern, not a save concern - the page is opened outside the game as often as inside it.
- **The last version looked at** is the same kind of state and can share the same store.
- **The (+15) badge is different**, and it is the one that needs the game rather than the
  page: it compares the version in the loaded save against the current one. The save already
  carries its version - P-38 is the whole reason it does - so the number is a subtraction,
  but it has to be counted in *versions between*, not in the numbers themselves: v0.7.30 to
  v0.7.45 is fifteen only if every version in between exists, and the changelog is the list
  that says which do.
- **Opening from the badge** means the page has to be told what to expand, which is a
  parameter on the link rather than remembered state.

**What must be decided before it is built.** Where the memory lives. `localStorage` keyed to
the page is the obvious answer and needs no save key - but it is per-browser, so it does not
follow an exported save, and it would not survive the player switching machines. The
alternative is `game_state`, which persists properly and drags the changelog page into the
save contract for something that is a reading preference. **PROPOSED: `localStorage` for the
two filters, and the save's own version for the badge**, which needs no new storage at all.

**And a guard worth having.** Whatever counts the fifteen has to agree with what
`changelog.html` actually lists, and the two HTML copies must agree with each other -
`check_changelogs_cover_version` already holds both pages to carrying an entry for the
shipped `game_version`, so counting versions between two points is the same list read a
second way.

### P-47 — The inventory remembers how it was sorted `open`

The owner: *"the inventory sort selection should be remembered."*

**Measured: nothing covers it.** `option_remember_filters` exists and sounds like it would -
it does not. It sets `game_options.remember_message_log_filters` and nothing else, so the
message log's filters survive a reload and the inventory's sort does not. The sort itself
lives in `inventory_display.js` alongside the four buttons and is not saved anywhere.

**Which raises the same question P-46 raises, and they should be answered together:** whether
a display preference belongs in the save or in the browser. The inventory sort has a stronger
claim on the save than the changelog's filters do - it is a preference about the character's
own screen rather than about a page read outside the game - and `game_options` is already the
place such things live and is already persisted. **PROPOSED: `game_options`, beside
`remember_message_log_filters`, and the direction as well as the column** since clicking the
chosen button reverses it and remembering one without the other would restore half a choice.

**Small enough to be worth doing with P-46** rather than on its own, since both are one
decision about where preferences live.

## Open decisions

Each of these changes what gets built. They are recorded here rather than guessed
at. What is left here is project-wide; a question asked by one proposal moves into
that proposal once it is answered, which is where Q-7 to Q-10 and Q-13 went. P-14 has
since finished and left this file, so their account is in
[CHANGELOG.md](CHANGELOG.md) - the numbers are not reused, and the commits and entries
that name them still resolve.

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

### Q-12 — Should a book be able to require a skill to read it? **DECIDED: yes, and it is a series**

Not the proposal's answer. Reading a book requires nothing in general and **raises Literacy**,
which is what a book is for. But a book may require a skill when the book is *about* that
skill at a level the reader has to have reached: a book that grants a sword skill needs
nothing, while a **mastery series** - "Sword mastery" and its kin - can ask for level 20 in the
skill it deepens.

So `required_skills` **stays and gets wired up**, which is the half P-26 called a real feature
rather than a field to delete. What it needs beside it is the refusal: a book you cannot read
yet has to say so and say what it wants, or it is a locked door nobody can see.

`finish_reward` is untouched by this answer. No book sets it and nothing reads it, so it is
still a trap - deleting it loses nothing and is not the same question.


### Q-14 — Guild work: the four decisions **DECIDED, all four**

**1. Ranks.** A ladder of nine: **F, E, D, C, B, A, S, SS, SSS**. A player at a given rank sees
the board's jobs for **their own rank, one below and one above** - at D, that is E, D and C.
Taking work above your rank raises you faster and gives you harder work to do it with, which is
the whole of the choice the board offers. **SS and SSS are rare and meant to be punishing.**

*Read from the owner's example rather than their list: the list reads "F, D, E, C, A, S, SS,
SSS", and the example - "at D you can take E, D and C" - puts E below D and C above it, which
is the descending-letter ladder. B is written in on the same reading. If either is wrong, this
is the line to correct, because a rank is a saved value and renaming one later is the thing
this project does not do.*

**2. Refresh: per in-game day, and a job already taken is never lost.** The board rerolls; what
the player has accepted does not. That is what stops the refresh from being a punishment for
being slow, and it is what makes the save shape non-optional - an accepted job has to survive
a reload.

**3. Standing: a fixed amount for the rank, plus an amount for the difficulty of the work.**
So two jobs of the same rank do not pay identically; the harder brief pays more. The measured
constraint stands: `check_a_standing_gate_can_be_reached` treats a repeatable source as
unbounded, so the board still needs a ceiling on what it can pay in total, or that check goes
silent for the Guild.

**4. Difficulty scales the brief, not the fiction.** "Bring 10 of these" becomes "bring 30";
"kill 100" becomes "kill 300". The same job types at every rank, with the numbers doing the
work - which is why the types the request names (hunt so many, gather so much) are the right
two to start from.

**Still open, and small:** what guild-only items are for. The proposal's answer - components,
sold at a standing price, because 175 of them are sold by nobody and buying them at a price
in standing makes skipping the crafting ladder something earned rather than bought - was not
contradicted, and stands unless the owner says otherwise.


---

## Conventions for this file

- One proposal per directive, numbered and never renumbered.
- When a proposal reaches `done`, write the explanation in
  [CHANGELOG.md](CHANGELOG.md) and then remove the proposal from this file. The
  account lives there, at developer depth; a second copy here turns the backlog into
  an archive and buries what is still open.
- Decisions move from [Open decisions](#open-decisions) into the proposal that
  consumes them, with the answer recorded.
