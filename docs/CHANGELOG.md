<!-- doc-source: docs/CHANGELOG.md  doc-version: 89 -->

# Changelog

Development history of this fork, with the reasoning behind each change. Work
arrives here once the matching proposal in [PROPOSALS.md](PROPOSALS.md) reaches
`done`.

Turkish counterpart: [CHANGELOG.TR.md](CHANGELOG.TR.md).

> **Paired with the in-game changelog.** `changelog.html` and
> `changelog.tr.html` at the repository root are the player-facing version
> history shown inside the game. Every entry written here gets a matching entry
> there, in the same change: this file keeps the reasoning at developer depth,
> they carry the player's account of it. Story content and new areas get their
> own minor version heading (0.6.1, 0.6.2, …) rather than being folded into an
> existing one. `npm run check` enforces that both HTML copies hold an entry for
> the shipped `game_version`, so the two cannot drift apart unnoticed.

---

## 2026-09-01

### "Can this be got at all" is asked of the whole registry now

P-27, and it closes. Four hand-written items nothing could give a player; three are gone,
one is written down with its reason, and the two checks that would have caught them exist.
Maintenance: nothing a player could reach has changed, because nothing a player could reach
was involved.

**What was deleted, and why deleting was the safe half.** `White steel chainmail` and
`Black steel chainmail` were byte-for-byte duplicates of `White chainmail` and `Black
chainmail` - same class, same value 180, same `material_type` - and they shared their
**display names** with them. v0.7.5 added the second pair rather than using these, because
the component generator keys its material as `"white chainmail"`; that registry key is
player data now and cannot be renamed, so the older pair is the one that goes.
`Scraps of wolf rat meat` was the only item in the game with `material_type: "meat"`, and
no recipe asks for that type - the wolf rats drop `Rat meat chunks`. Deleting is safe
precisely *because* nothing ever produced them: no save can contain what no source ever
made.

`Basic spare parts` stays, on `known_unreachable_items` with the reason. Its description
says what it is for - *"necessary for crafting equipment"* - and no recipe asks for it,
which reads as an intent never wired rather than a leftover. Deleting it would throw the
idea away; sourcing it would invent the system it implies.

**Two checks, and each found something on its way in.**

`check_items_can_be_got` is the third of the family. `check_components_can_be_made` asks
"can this be got" of the 203 generated components and `check_books_can_be_got` of the
books; nothing asked it of the 192 plain declarations. Reachable means named by a recipe,
a trader, a drop, a reward or a gathering activity - or carrying `components` or a
`component_type`, which is the other checks' business, since an assembled shield's
inventory key is built from its parts rather than from its template's name.

**And it found that the shared helper was neither shared nor complete.**
`reachable_item_names()` was documented as *"shared by check_components_can_be_made and
check_books_can_be_got... a new kind of source is taught to both here, once"* -
and `check_components_can_be_made` still carried its own inline copy of the same eight
patterns, so only one caller used it. Worse, the helper knew four kinds of source and there
are **five**: nothing read a `LocationActivity`'s `resources`, which is where every ore,
log, herb, wool and sand comes from - about a fifth of the plain registry. Neither of the
first two callers had a gathered thing to ask about, so an incomplete set never showed.
Both fixed; the helper has three callers and knows gathering.

Reading `resources` needed depth counting rather than a lazy `[\s\S]*?\]`, because a
resource carries `ammount: [[1,1], [1,3]]` and the first `]` is two levels in. That
truncation hid every fish, which is how it announced itself.

`check_no_two_items_share_a_name` is the other one. `check_item_name_collisions` compares
an item's `name:` FIELD against other items' keys, which catches one shape and not this:
two different keys whose `name <key>` rows resolve to the same string. The player then sees
the same name twice, in the inventory, in a trade list and in Discoveries, with no way to
tell which is which. It fired four times on the way in - the two chainmail pairs, in both
locales - and 508 names across two locales pass now.

**Negative-tested three ways**: a reachable item left on the excuse list (the stale-excuse
branch), the helper made to forget gathering again (20 items reported), and two items given
the same display name.

### v0.7.17 - the box under the box, and the calendar gains a moon

P-25's last part, and it closes the proposal: the black market that turns up occasionally.
The proposal said it was *"a stock list gated on standing **and** on time, and the arc has
already shipped both halves of that"*. The standing half was true. The time half was not.

**Why the shipped time condition was the wrong one.** `season` is a quarter of the *year*.
That is the right rhythm for a boat that comes twice a year - it is what Q-10 settled it
for - and far too slow for something meant to feel occasional. So conditions gained a
`moon`, in the same `{yes, not}` shape as `season` and for the same reason: a recurring
window that opens on its own with no scheduler behind it. A phase is a quarter of 29.5
days, about 7.4, so it comes round monthly and a trader refreshing every four days will
usually land inside it once.

**And the day of the week was measured and dropped.** It looks like the obvious lever and
it is an artifact: `Trader.can_refresh` snaps `last_refresh` to a multiple of
`refresh_time`, so with a four-day refresh a weekday condition and the refresh grid only
meet every 28 days. That is two grids interacting, not a rhythm anybody designed.

**What is in the box, after two designs failed measurement.**

*Finished trophies* were the obvious answer and the best-looking one. Five artifacts nobody
sells, each wanting **four** of the back room's 50-to-1 butchering upgrades - a mountain
goat trophy is 200 pristine horns, and a horn is 50 goat horns at a 2% drop, so on the
order of ten thousand kills. The price system cannot say that. A price is `value` times
margin, the trophy's value is 650, and no margin turns ten thousand kills into a number:
selling one for a few thousand would have made the deepest grind in the game pointless.
Same finding shape as v0.7.10's boatman and P-23's book - the economy's lever is value
times margin, and it cannot express rarity.

*Quality* can. Measured: **183 stock entries across every list in the game name a quality
and not one of them passes 120**, which the help page states as a rule. So the fence's
distinction is not different goods, it is the same goods better than anybody is supposed to
sell them - the four hide capes the Intermediate list already offers at 70-120, offered
here at 130-160. And the economy prices that correctly on its own, because quality
multiplies value and crosses a rarity band on the way: a cape at 150 is value x1.5 x1.3
where the same cape at 120 is value x1.2 x1.1.

Help says so now, since the rule it stated has an exception: *"the highest item quality any
shop offers is 120% - with one exception, and it does not keep shop hours."*

**And she says which kind of night it is.** A line gated on Slums 300 **and** the new moon,
and unlike her back-room line it does not lock after hearing - it is a recurring thing and
she would mention it again. She has a view on where a cloak that good comes from, and on
asking.

**Two guards, three negative tests, and one caught by my own check.**

- `check_moon_phases_are_real` reads the four names out of `game_time.js` - not a list
  written down here - and holds every `moon:` condition to them. A misspelt phase compares
  false against every phase there is, so the window never opens and the shop simply stays
  as it was. Negative-tested with `"Dark"`.
- The derived-shelf rule from two rounds ago **failed on its own limitation**, which is the
  useful part: the three-way template is a block body across several lines and the check
  read only the first line, found no literals, and reported all three declared lists as
  unreachable. That is the right failure aimed at the wrong thing. It reads the whole value
  through `value_expression` now, which the sibling rule beside it had been using all along.
- It also flagged `"New"` as a stock list name, because the phase string was sitting inside
  the trader's own function. That one was a real design smell rather than a check bug:
  `getMoonPhaseName`'s four names live in `game_time.js`, and a fifth copy of one of them
  in another file can be misspelt without anything noticing. It is `current_game_time.isNewMoon()`
  now, which fixes both.
- Negative-tested by leaving the black market out of the declaration and by making the
  function unable to return it.

**P-25 leaves the backlog.** Four parts: NPCs who speak differently at high and low
standing (v0.7.15, and the reputation ceiling that made it possible), items sold only at
high standing (v0.7.16, and the Discoveries groundwork before it), a back room (the same
v0.7.16 - it turned out to be the same thing), and the occasional black market. The
proposal's claim that none of it needed engine work was wrong twice: standing had no
ceiling and time had no phase.

### v0.7.16 - the second box, and what is in it was measured

P-25's second part: items sold only at high standing. The mechanism was settled by the
proposal and by last round's groundwork; what took the measuring was **what a shelf like
that should hold**, and the proposal's own two suggestions did not survive it.

**What the proposal suggested, and why neither works.** *"The eight unmade generated
components and the tier-5 family are already there to draw on."* Measured: the eight
unmade are duplicates - five of them are `Turtle shellplate` armour pieces that duplicate
the hand-written `Turtleshell *` ones the recipes actually name, and two are cloth shoes on
materials whose recipes stop at the interior. Selling those is selling clutter. And the
tier-5 family became craftable in v0.7.5 from the flats' own seam, so selling it would
undercut the chain the arc had just built.

**What the answer was, and it was already written down.** The bay trader carries a note
from v0.7.8: a shelf should hold *"things the player has only ever had to make or hunt
for, at a price that says somebody carried them a long way. Not new loot."* Counted
against that: **22 distinct enemy drops that no trader anywhere sells.** Five of them are
the dearest ends of that list, and four are the game's **50-to-1 butchering upgrades**:

| item | how you get one otherwise |
| --- | --- |
| `Pristine mountain goat horn` | 50 goat horns, and a horn is a 2% drop - order of 2,500 kills |
| `Sharp bear claw` | 50 bear claws |
| `High quality wolf fang` | 50 wolf fangs |
| `High quality boar tusk` | 50 boar tusks |
| `Turtle shell` | a 0.5% drop, and a shellplate wants ten |

These are the things a player grinds for weeks or does without. Somebody in that room
already did the grinding, which is the whole fiction of a back room.

**One trader, not two.** The list is built as `[...inventory_templates["Intermediate"],
...]` - the back room is the same man, because the row does not get a second shopkeeper
when it decides it likes you. That is the proposal's own rule and the thing it said this
must not become.

**Slums 300, derived.** The row's own mark: the standing at which the old woman says you
are on the roster, *"the people we would get out of bed for"*. The back room opening at
the same number is that fact from the other side of the street. Verified at the boundary -
Intermediate at 299, the back room at 300.

**Scarcity in the chance, not the price.** A profit margin is per trader and this is the
same trader, so making it dear was never available - and it would have been the wrong
lever. Chances of 0.12 to 0.25 against a four-day refresh mean he has these when he has
them.

**And she tells you.** P-25 is explicit that *"a shelf the player cannot see is not a
reward"* - the settlement actions are visible before they are earned and refused with a
reason, deliberately. So the old woman gets a line at the same 300, and it is not a
signpost: she says he has always had the second box, that what changed is he took the lid
off in front of you, and not to ask where any of it came from.

The other half of being told is last round's groundwork paying for itself immediately:
because a derived shelf now declares every list it can be, the Discoveries panel names
those five as things the slums sells **before** the player can buy them there.

**No new guard, and that is deliberate.** Last round's check already validated this
trader's declaration the moment it existed - it went from one derived shelf to two with
nothing to add - and the standing condition is covered by the three rules v0.7.15 shipped.
A fourth rule here would be a rule about this shelf rather than about shelves.

**P-25 has one part left**: the occasional black market. It is this shelf plus a time
condition, and both halves now exist.

### Discoveries learns every shelf a trader can hold, not the one it is holding

Groundwork for P-25's three remaining parts, and a hole found by measuring the ground
before building on it.

**What was wrong.** `stock_list_name_of` answers *what is this trader selling now*, which
is the right question for a shop and the wrong one for the Discoveries index.
`item_sources` is built once on first use and **cached for the session**, so it pinned
itself to whichever list happened to be current the first time the panel was opened. Open
the panel out of the Marrowmoth's two seasons and the bay's in-port stock would have had
no source listed at all, for the rest of the session, with nothing thrown.

**It has been harmless by luck.** Measured: the `Bay` and `Bay in port` lists hold **the
same fifteen item names** and differ only in counts and chances, so nothing has ever
actually gone missing. That is the whole reason it was worth fixing now rather than after:
it stops being luck the moment a derived list carries something another does not, and a
shelf gated on standing is exactly that. Worse, there the item the player has not earned
yet is precisely the one the panel most needs to name - and P-25 says so itself: *"A shelf
the player cannot see is not a reward."*

**The fix.** `stock_lists_of` beside `stock_list_name_of`, answering the other question:
every list a trader can ever use. A plain name falls back to itself, so nothing changes
for the eight static traders; a derived template declares its lists. The index walks all
of them.

**Both halves are checked against each other**, because neither is trustworthy alone: a
declaration nobody verifies drifts from the function, and a function nobody can enumerate
cannot be indexed. `check_trader_stock_lists` now reads the string literals out of the
derived template's own source and requires the declaration to match them exactly - no
missing list, no extra one, and every declared name backed by a real
`inventory_templates` entry. Negative-tested three ways: removing the declaration, naming
one of the two lists, and naming a shelf the function can never return.

**Also found and not fixed here**, recorded as P-27: four hand-written items that nothing
in the game can produce, sell, drop or hand over - `White steel chainmail`, `Black steel
chainmail`, `Scraps of wolf rat meat` and `Basic spare parts`. The first two are the
tier-5 chainmail materials, at value 180 and `material_type: "chainmail"`, sitting one
line below the tier-4 pair that the naming convention matches - and v0.7.5 added `White
chainmail` and `Black chainmail` beside them rather than using them.

### v0.7.15 - standing can be a ceiling, and the broker stops reciting the rule

P-25's first of four parts: NPCs who speak differently at high and at low standing. The
proposal had already measured that all four parts are two mechanisms the game owns -
`display_conditions` on a Textline and a derived `inventory_template` on a Trader - and
that the first is *"two textlines with opposite conditions"*. Measured again before
writing, and the opposite condition did not exist.

**Standing could only ever be a floor.** `conditions.js` read
`character.reputation[region] < conditions[0].reputation[region]` and failed below it;
`conditions[1]` is a soft ramp that scales an action's success chance between two numbers,
not a hard cap. All six standing gates in the game are floors. So a place could get warmer
and never be cold, and nothing could be written that a stranger hears and a regular does
not.

**The shape was already in the file.** `location_clears` takes `{at_least, at_most}` and
the height conditions take `{at_least, exactly, at_most}`, so reputation takes
`{at_least, at_most}` too - borrowed, not invented, and `at_most` is inclusive in both
places. A bare number is still a floor, which is what all six existing gates are, and the
two-set ramp is left to the numeric form. Verified across both forms and every boundary:
`at_least: 100` fails at 99 and passes at 100, `at_most: 100` passes at 100 and fails at
101, a window works, an absent region reads as 0, and the ramp still returns 0.51 at
standing 150 between 100 and 200.

**What it says, and why it is the broker.** *"Bring me a quantity and I will give you a
number. Bring me a story and I will give you nothing"* is a **stranger's** answer, and it
was the only answer he had. It keeps every word and simply stops being the answer at Town
150 - the town's first gate, where the gate guard stops reciting the rule and looks at you
properly - which is well below his own 250 line, so the two stay separate beats. Both
halves carry `lore: true`, because the panel records what you heard, and which of the two
you heard depends on when you first came.

Nothing is stranded: measured first, `hello` unlocks nothing and only locks itself.

**Three guards, four negative tests, and a trap fallen into on the way.**

The trap first, because it is the useful part. Every constructor that takes a
`display_conditions` stores it as `[display_conditions]`. The two new greetings were
written as arrays - which *looks* right, and which the Location constructor's own
`display_conditions = []` default actively suggested - so they became `[[...]]`,
`process_conditions` read nothing off `conditions[0]`, and **both lines showed at every
standing**. The build passed. Every check passed. Only rendering the condition at seven
different standings caught it.

- `check_display_conditions_are_not_wrapped_twice` refuses an array where an object
  belongs, across all of `src/`. 21 written, none wrapped. The two misleading `[]`
  defaults in `locations.js` are objects now.
- `check_reputation_regions_have_names` learned the bounded shape - it was reading
  `at_most` as a region name, which is how it announced itself - and now also refuses a
  bound key `process_conditions` does not read, an `at_most` below 0 that standing can
  never satisfy, and an empty window.
- And a ceiling has to meet a floor. `{at_most: 149}` with `{at_least: 150}` is exact; get
  it wrong by one the other way and there is a band of standing where the speaker has no
  line at all, which nothing else would report.

**What P-25 still holds.** Three parts: items sold only at high standing, a back room, and
a black market on the slums side. All three are the *other* mechanism - a Trader's
`inventory_template` derived rather than stored, which v0.7.5 already made a function for
the bay's seasonal shelf. The vocabulary this version adds is the half that was missing.

### No forge above three, and the check that says when that stops being true

P-12's last open item, and the one it had been holding back for the economy half of P-14
phase 6: *"a station above tier 3. `roll_quality` reads `station_tier - component_tier`, so
tier-5 components forged at the mountain flue roll at a two-tier penalty. Everything is
makeable; what is not settled is whether it should come out at the quality it is worth, and
where a better fire would be."*

**Measured, and the answer is that no better fire is needed.** Three measurements, in the
order they were taken.

**What the stations actually are.** Four crafting stations exist. Both of the two that
matter compute their tiers in a **getter** behind a flag, so a fresh read of the module
shows the Mountain camp at forging 0 and the village at 1 - which is what an unbuilt world
looks like, not what the game is. With the flags set: the mountain flue is forging and
smelting **3**, the village hearth **2**, and the Swampland tribe is the best *assembly*
station at crafting **2**. There is no `crafting` tier at the mountain camp at all, so a
tier-5 weapon is forged at minus two and then assembled at minus three.

**What the penalty costs.** 15 quality points per tier for a component, 10 for an assembled
piece - and the quality cap is `100 + 2` per skill level, which absorbs it from below. The
component loss, measured through the shipped `get_quality_range`:

| Forging | tier 3 at the flue | tier 5 at the flue | loss |
| --- | --- | --- | --- |
| 10 | [84,112] | [56,80] | 32 |
| 20 | [116,140] | [84,112] | 28 |
| 30 | [144,160] | [116,140] | 20 |
| 40 | [176,180] | [144,172] | 8 |
| 50 | [200,200] | [176,200] | **0** |

The assembly loss is **0 at the top of the range at every level**: with components at 140
the base is already above the equipment cap, so minus three only widens the range
downward.

**And it never inverts the ordering, which is the whole answer.** Attack comes mostly from
a component's base stats and only secondarily from quality, so a tier-5 blade at its
*penalised* quality beats a tier-3 blade at its *unpenalised* one. Assembled long swords,
same handle, at the qualities the game's best stations can actually reach:

| Forging / Crafting | t1 | t2 | t3 | t4 | t5 |
| --- | --- | --- | --- | --- | --- |
| 20 | 16 | 32 | 46 | 68 | **81** |
| 40 | 34 | 67 | 96 | 141 | **178** |
| 60 | 49 | 98 | 142 | 207 | **261** |

Tier 5 is a 76% gain over tier 3 in the mid-game, penalty and all. So the penalty makes
tier 5 a smaller upgrade than it could be; it does not make it a worse one. A tier-4
station would fix a shortfall that closes by itself and move the gear ceiling ahead of the
story - which is the one thing P-12 said it must not do.

**Guard: `check_higher_tiers_are_still_worth_reaching`.** The decision is now a check
rather than a paragraph. It derives the best station tier in the game from the locations -
reading the flag names out of the source, so a third station cannot be added without it
seeing one - then walks both weapon-head families up their tiers at Forging and Crafting
20, 40 and 60, assembling each and comparing attack. Every step has to be an improvement.
30 tier/skill points.

**It is falsifiable, and that was verified rather than assumed** - three times now this
project has written a check that could not fail. Quadrupling the tier coefficient from 15
to 60, a plausible retune, takes the ladder at skills 20 to 16, 32, 46, 46, **24**: the
tier-5 blade becomes worse than the tier-3 one and the check reports it by name.

**Its honest limit, which is itself part of the answer.** Cutting the mountain flue from 3
to 1 - so the best forge in the game becomes the village at 2, a whole tier worse than
today - **does not fail it**. The check reads whatever the best station is and asks whether
the ladder still climbs, and at three tiers of gap it still does. A game with a *worse*
forge than this one would still order its tiers correctly, which is the strongest form of
the argument against building a better one.

P-12 leaves the backlog. What it shipped along the way: tier 4 wired to the bay's salt
house, tier 5 to the tidal flats in v0.7.5, 36 components from unmakeable to makeable, and
now the reason there is no tier-4 forge written down as something that can fail.

### v0.7.14 - the collector's second and last sale

P-23, from the owner's request: the collector could sell a very special book, and it could
raise drop rates. The design was decided by measurement twice, and the intuitive answer
was wrong both times.

**Where droprate already lives.** `droprate_modifier_skills_for_tags` in `enemies.js` maps
an enemy tag to the skill whose level multiplies that tag's drops, and it had exactly one
entry: `beast: "Butchering"`. `Enemy.get_droprate_modifier` walks the enemy's tags and
multiplies by the skill coefficient for each one it finds. So the shape to extend was one
line of data, not a new mechanism - which is what P-23 asked for.

**The first wrong answer: a general boost.** P-23 had already ruled out a flat "+X% drops",
and the measurement says why in numbers: `beast` carries 23 of the game's 32 enemies and
**2.93 of the 2.94 total drop weight**. Anything pointed at beasts, or at the whole game,
is the same buff twice.

**The second wrong answer: `insect`.** It was the obvious narrow tag - the arc's own
enemies are ants and dragonflies - and the measurement killed it outright. Three of its
four enemies have an **empty loot list**, and the fourth drops herbs at half a percent.
Total drop weight **0.02**. A book sold for a great deal of money to multiply that would
have worked perfectly and done nothing.

**`aquatic`, measured against every alternative.** 6 enemies, 5 of them with loot, 7
distinct items, drop weight 1.14 - the narrowest tag in the game with something real on
the other side of the multiplication. Crab meat at 2%, crab claw at 1%, giant crab claw
and turtle shell at 0.5%, alligator skin at 1%: the swamp crafting chain, and every one of
them a drop the player currently waits a long time for.

Every aquatic enemy is also a beast, so the new skill **stacks with Butchering on those six
and on nothing else**. That is the design rather than an oversight - you already know how
to butcher, and the monograph teaches you what a shell does - and it is why three of
Butchering's numbers are lowered for it: max level 40 rather than 60, coefficient 1.5
rather than 2, base xp cost 60 rather than 40. Measured through the shipped
`get_droprate_modifier`: at level 40 Butchering alone gives 1.587 on a crab, both together
give 2.381, and a wolf rat stays at 1.587 either way.

**Shellwork is Butchering's sibling in every respect that matters**: locked until a book
teaches it, parented to `Crafting mastery`, read by the same table. `Butchering and you`
unlocking `Butchering` is the precedent and it is exact, including the part that matters
for saves - a finished book re-applies its rewards on load with `only_unlocks: true`, and
`rewards.skills` is not one of the kinds that flag skips. Verified rather than assumed.

**The book.** *What the Water Gives Up*, 600 minutes - the longest read in the game -
literacy xp rate 3, and its whole reward is the skill. No xp multiplier: P-15's rule is
that a book which only multiplies is the weakest thing `BookData` can do.

**40,000, derived.** The 17 money rewards in the game total **84,740** and there are two
sinks: this man's 30,000 for the tally and the boatman's 6,000 a trip. v0.7.10 repriced the
boatman because a *repeatable* price is a toll and 25,000 a trip was 500 units of
patrolling; this is bought once and blocks nothing, so it is allowed to be a goal. At
40,000 the two one-off sinks take 70,000 of the 84,740, and everything the player sells is
on top of that. It is offered from his `other` line - after the whole exchange, which is
the only point at which a second exception would ring true.

**Guards, three negative tests, and one check that could not fail.**

- `check_droprate_tags_are_worth_scaling`: every tag in the table is carried by a real
  enemy, points at a real skill, and has loot worth multiplying. **Its first version could
  not fail.** The floor was 0.01 and `insect` is 0.02, so the check would have certified
  the exact mistake it was written to catch - found by putting the trap back before
  believing it. It is two conditions now, most of the tagged enemies dropping something and
  a floor of 0.1, with two orders of magnitude between `insect` and `aquatic` so the floor
  is not delicate.
- `check_locked_skills_can_be_unlocked`: every skill with `is_unlocked: false` is named in
  a `skills: [...]` reward somewhere. Three are, and all three are taught. A missed reward
  leaves a skill that never appears, never takes xp, and reads as level 0 to everything
  that asks - including the droprate table.
- Negative-tested by pointing the skill at `insect`, by misspelling the skill id, and by
  taking the reward off the book. Each fails the intended check with the intended message.

**Help now explains drop rates**, which it never did: the per-item chances, the two skills
that multiply a whole kind of creature, that the bestiary shows drops with your skills
already applied, and the thing nothing anywhere told the player - fighting a group lowers
what each enemy in it drops.

### v0.7.13 - the fix v0.7.12 needed, and a tooltip that means it

A regression this loop shipped one iteration earlier, found by measuring rather than by
a report - and the measurement was of the next job, not this one.

**What broke.** v0.7.12 gave `Fish fillet` a quality, because a fillet cut from a good
catfish should be a good fillet. `find_recipe_material` had two branches, and the one for
a material named by **id** was a single lookup:

```js
const key = item_templates[material_id].getInventoryKey();
if (character.inventory[key]) { ... }
```

That is the **template's** key, which carries no quality. Correct for as long as nothing a
recipe names by id could have one; wrong the moment `Fish fillet` could. A fillet at 68% is
stored under `{"id":"Fish fillet","quality":68}`, the `Fish steak` recipe asks for a fillet
by id, and the lookup missed it entirely. Measured: ten fillets in the inventory,
`get_availability()` returns 0. The recipe simply read as unavailable, with the materials
in hand.

The other branch - a material named by **type**, which is how the fish reach the pan -
walks `Object.values(character.inventory)` and filters, so it had never had the problem.
Cooking a fish worked; cooking the thing you cut off a fish did not.

**The fix is that there is one branch now.** The predicate was the only real difference
between the two, so it is the only difference left: `entry.item.id === material_id` or
`entry.item.material_type === material_type`, then one walk, one sort, one stop rule.
Cheapest first, which for something carrying a quality means the poorest is spent first
and the good ones keep - the rule the type walk already had, now applying to both.

**And the prediction was still hiding.** The recipe tooltip built its result with
`{skip_quality: true}`, which was right while item recipes made nothing with a quality.
So a player looking at the fried fish recipe could not tell that a good fish makes a good
meal - the feature was in the game and invisible in the one place it would be read.

Two things stood in the way, and both are now gone:

- **The weighting had one owner and needed two.** `use_recipe` computed it inline.
  Extracted as `get_consumed_quality`, asked by the roll and by the tooltip, because a
  prediction that can disagree with the result is worse than no prediction. That is the
  whole history of this file in one sentence.
- **`show_quality` required the item to already have a quality.** A recipe tooltip is
  handed the shared *template*, and a template's quality is `null` for everything that is
  not equipment - equippables happen to default to 100, which is the only reason the
  component recipe tooltip has ever drawn a range at all. A caller passing
  `options.quality` is now enough on its own; `use_quality` still has to agree, so it
  cannot turn a number on where nobody asked. Measured in all four cases: a predicted
  range draws, `skip_quality` still hides, no options still hides, and an item with
  `use_quality: false` ignores the prediction.

**Guards, both negative-tested.**

- Every material an item recipe names by id is put in an inventory twice - plain, and at
  68% - and has to be found both times. 164 lookups across 82 named materials. Putting
  the template-key comparison back fails it on Silver ingot, Wool, Flax and the rest,
  which is the point: the class is "a recipe can find what it asks for", not "the fillet
  works now".
- `get_consumed_quality` has exactly one definition, and both `crafting.js` and
  `item_tooltips.js` have to call it. Re-inlining either copy fails.

**The lesson worth keeping.** `check_inherited_quality_is_shown` walked the recipe graph
and asked whether every result a quality can reach *shows* one. It did not ask whether
every material a quality can reach can still be *found*. Giving something a quality
changes its inventory key, and an inventory key is a lookup - so the question to ask of
any new quality is not only who displays it but who looks it up.

### v0.7.12 - a fish keeps its quality when you cook it

Reported in play: a fish's quality is gone after cooking it.

**What the proposal for this got wrong, twice, before a line of code changed.** It said
the items path calls
`roll_quality(station_tier - result_tier)`, and that components and equipment both pass a
weighted input quality. Neither is true. Measured, the four paths were:

| path | rolls a quality | consults its input |
| --- | --- | --- |
| items - cooking, smelting, alchemy, butchering, glass, charcoal | **no** | there was no roll: the result was added at `item_templates[result_id].getInventoryKey()`, so it came out with quality `null` |
| components - ingot to blade, cloth to clothing | yes | **no** - `roll_quality(tier)` had no parameter for one |
| capes | yes | **no** - same |
| equipment assembly | yes | yes - `roll_quality(component_stats.weighted_quality, tier)` |

So it was not that the item roll ignored the materials. There was no item roll at all, and
the line that threw the quality away read perfectly innocently. Only one of four paths
had ever consulted its input.

**Why the drift was possible, and the fix.** Three of the four classes carried their own
copy of `roll_quality`, each taking a tier and nothing else, while the machinery to do
better - `get_quality_range`'s two branches - had been sitting unused on the base class
the whole time. One body on `ItemRecipe` now, `(input_quality, tier)`, inherited by every
subclass that makes something with a quality; `EquipmentRecipe` already had that shape.
Two duplicate bodies deleted.

`use_recipe`'s item branch tallies the quality of what it actually consumed, weighted by
how much of it it consumed, in the loop that was already walking exactly those stacks. One
roll for the batch, because that branch is a batch - it makes `final_count` of one thing in
one call and never loops per item, so a mixed bucket of fish cooks into one quality rather
than splitting the stack a dozen ways.

**Why this is contained.** A material with no quality leaves the tally at zero and the
result is created from the template exactly as before, because `get_quality_range` answers
a falsy input quality with its no-input branch. Fishing is the only thing outside crafting
that makes a quality - all three `roll_quality: true` activities in the game are fishing -
so today this is the fish and nothing else. The rule is about materials rather than about
fish, so anything given a quality later starts mattering on its own.

**The number that made this safe to do at all.** The two branches of `get_quality_range`
meet at an input quality of 80: 50 + 80 is the 130 the no-input branch adds. The branch
item recipes had never used is therefore literally *assume the materials were 80*, which
makes passing the real quality symmetric rather than a buff. Measured across skill levels,
with the fish rolled by fishing's own formula:

| Fishing / Cooking | fish rolls | dish, as a share of the flat 100% it used to be priced at |
| --- | --- | --- |
| 0 | 55-80 | 58% |
| 10 | 85-110 | 112% |
| 20 | 115-140 | 140% |
| 30 | 145-160 | 160% |
| 50+ | 200 | 200% |

A gradient, not a nerf: a novice cooking a poor fish makes a poor meal, and by the time
anyone has fished for a while it pays about double. The early-game loss is a few coins on
a 40-value item.

**Two things the measurement found that the plan had not.** Both would have shipped a
quality the player could not have, in one case, seen and in the other, survived:

- **`use_quality`.** Both places that draw a quality - the tooltip and the inventory row -
  ask the item for `use_quality` first, and all 39 usable items said false, because until
  now no cooked thing had one. Without setting it the dish would have been saved, priced
  and traded on a number shown nowhere on it: invisible and consequential at once, the
  exact pairing this project keeps having to hunt down. Set on the four dishes a quality
  can reach, which the recipe walk names: the skewer, the fried fish, the fillet, and the
  steak - the steak transitively, through the fillet.
- **`getRarity`.** Both drawing sites colour the number by `item.getRarity()`, which lived
  on three subclasses in three identical copies and not on `Item`. `UsableItem` and
  `OtherItem` - the two classes the dishes are - had none, so the first qualitied meal
  would have thrown a TypeError and taken the inventory display with it. Moved to `Item`,
  three copies deleted.

**Guards, four of them, each negative-tested by putting the fault back.**

- Every `roll_quality` declaration takes an input quality first, not a tier. Reverting
  `ItemRecipe`'s signature fails this and the behaviour check both.
- Every call site passes two arguments and names a quality in the first, and no crafted
  item may be added at its template's own inventory key - that second rule is the shape of
  the exact line the fish's quality used to die on, because a count of call sites would
  not have caught the roll being kept while the result went back to the template.
- Through the shipped `roll_quality` rather than the range behind it: 40 samples from a
  130% input all beat 40 samples from a 40% one, a falsy input stays inside the no-input
  range, and the two branches still meet at 80. Sampling the roll rather than reading the
  range is deliberate - the first version of this check asked `get_quality_range` directly
  and **passed** with the parameter unthreaded.
- The recipe walk: from everything that shows a quality today, every result a quality can
  reach must show one too, and every item template must be able to answer `getRarity`.
  Derived rather than listed, so giving another material a quality names what would
  swallow it.

**What is deliberately left, and why.**

- **The component half is wired and unreachable.** No material a component recipe takes
  has a quality yet, and `update_displayed_material_choice` keys its rows from the
  template rather than from the stacks - the upstream `//TODO currently doesn't support
  items with quality` sitting right on it. So the player cannot pick a qualitied ingot to
  begin with. Wiring it anyway is the point: leaving the parameter out is how the paths
  drifted apart, and the chooser follows when there is a qualitied ingot for it to offer.
- **Food effects do not scale.** A dish's effect is a named meal for a fixed duration, so
  a 140% fried fish is worth more and does not feed better. Duration is the obvious axis
  and it is a design decision, not a fix.
- **No log line says the quality.** The item branch logs "made N out of M" and the
  component branch has its own phrasing with a quality in it. Reusing that would need four
  new locale rows in two languages; the number is on the item either way.
- **`item_mapping` does not reach a qualitied item.** The save loader applies the rename
  map in the branch for items without a quality, not in the branch cooked fish come
  through. Its three entries are wood materials that can never carry one, which is why
  this has never mattered - noted at the branch so the next person to add to that map
  sees it.

### v0.7.11 - a place having an opinion, and a floor under standing

P-14 phase 6's last piece, and it completes the phase. The brief asked for standing
consequences that read as world-state rather than as punishment, which is a design
problem before it is a code one: a number going down is a penalty unless somebody in the
world says something about it.

**The content had already framed the choice.** The tallyman's closing line says *"The day
I write it down it is a guild matter, and a guild matter is a thing with a procedure, and
the procedure is that somebody asks the account column who to bill."* He refuses, at
length, and in refusing he tells the player that they could. So nothing needed inventing -
only the other side of a decision the canon had already set up.

The guild clerk will do it. She opens a file, writes the hull and the two springs, stops
at the fourth column exactly as he did, and files the card: *"It will be known that this
came from the docks. I am not going to pretend otherwise and you should not either."*
Guild +60, Town +20, **Slums -40** - the game's first reward that subtracts anything.

**Nothing forces it.** The arc finishes either way and the line simply sits at the clerk.
That is the difference between a consequence and a punishment: a punishment is what
happens when you play, a consequence is what happens when you choose.

And the row answers. The old woman of the slums has a line gated on the flag, and she is
not angry - there is nothing to put right and nobody is in trouble. What she says is that
for a while, when somebody down here has something they would rather was not written down,
they will think about who they say it in front of, and the player will be on the list of
people they think about. *"It will pass. Most things do, here. But it has not passed yet,
and you asked."* That is the world-state half, and without it the -40 would be a fine.

-40 against 350 earnable and the arc's own gates at Slums 200 and 250. It can put the firm
line out of reach for a while; wading the flats is free and the boatman is 6,000 since
last version, so nothing closes.

**Standing has a floor now, and it had to before anything was allowed to subtract.**
`add_reputation` used `+=` with no bound. `update_displayed_reputation` draws only regions
above 0. So a player at -20 in the slums would have seen **no row at all** - no number, no
indication they were in a hole, no way to know how deep - while every gate still read
shut. Invisible and consequential at the same time, which is the shape of every bug this
project has spent a version chasing, and it would have arrived with this feature.

Floored at 0, because zero is "they do not know you", which is where everyone starts. Six
tests, including that taking exactly all of it leaves zero rather than a near miss, and
that a non-integer is still refused outright rather than quietly floored - the guard must
not have turned a rejection into a 0. Negative-tested by taking the floor out: one check
fails, reporting -20.

That closes phase 6. What remains of P-14 is phase 7, the v0.8 groundwork.

### v0.7.10 - the boatman was priced like a milestone and sold like a service

P-14 phase 6's third of four pieces: the arc's money sink priced against the existing
economy rather than against a guess. It was a guess - 25,000, set beside the quest rewards
that were in front of me at the time.

**What the economy actually holds**, measured rather than remembered:

- 43,500 in one-off quest money across five quests.
- 27,000 more from the guild factor's three deliveries, all `repeatable: false`.
- One 30,000 sink, the collector's, and it was the only real one before this arc.
- **No repeatable money-paying action anywhere.** The three settlement actions - minding
  the scales at 400, crying the news at 260, chasing the pigeons at 90 - are all
  `repeatable: false`. They pay once each.

So the only income a player can repeat is a paid job, and the best of those is patrolling
at 50 a unit.

Against that, 25,000 *per trip* is 500 units of patrolling, and roughly one affordable
ride in the entire game. That does not make the dearer way expensive; it makes it a way
you take once and then never again, which quietly removes one of the three routes across
the mud that phase 4 was built around. 6,000 now: the factor's smallest delivery, one
job's pay for one boat ride, 120 units of patrolling.

**A guard was written and then removed, and that is the more useful half of this.**

The rule was "a repeatable price must not exceed the dearest one-off price". It reads well.
It passes at 25,000 - because 25,000 is less than the collector's 30,000. So the check
would have run green over the exact fault it was written to catch, and green over it
forever, while looking like coverage.

Every version of it that does catch this needs a constant somebody invented: a repeatable
price must be under N times some income, and N is a judgement. The real question is a
price against the money available *at that point in the game*, which needs progression
modelled and is a design call rather than an invariant.

So there is no check, and the numbers are written down instead - in the proposal and in a
comment beside the price - so the next price is derived rather than picked. This session
has twice now shipped a check that could not fail (the help page's standing check, twice
over) and caught it both times by negative-testing before believing it. A check that
certifies the bug is worse than no check, and the third time it was cheaper to notice than
to fix.

### v0.7.9 - the two cafés that had nothing to sell

P-19 asked for a trader in the town square or one of the places off it. Measured before
building one, and the answer was that two already existed.

`cat cafe trader` and `nekomimi trader` have been declared in `traders.js` since before
this fork, with a real ten-row stock list between them - fresh bread, bread kwas, cooked
clam, crab bisque, kingsized frog legs, fish steak. **No location listed either of them.**
So neither could ever be met, both cafés had nothing to buy, and nothing failed:
`check_trader_stock_lists` was perfectly happy, because their lists were real. The Cat café
was a room with nine background noises and nothing in it at all - no NPC either.

And the nekomimi proprietress's `offer` line carried, in the source, the comment
**`//todo: unlock trade`**. The wiring was described and never done, which is the most
useful kind of thing to find: it says exactly where the trader belongs and who opens it.

So this is reclamation and not invention, which is what P-19 recorded as the rule. The
proprietress opens hers, because she is the one offering. The Cat café's opens on walking
in, because there is nobody in there to ask.

**The town has a market region now**, and it had to. `src/verifier.js` refuses a trader in
a location with no `market_region`, and the whole town had none - the square, both cafés
and the antique store were all `market_region: null`, which is consistent with none of them
having anything to buy. `Town` bleeds into `Slums` and into nothing else, because they are
the same city: what you dump in a café off the square moves a price in the row, and neither
moves one in a village a day's walk away.

**`check_trader_market_regions` grew the guard that would have caught this.** Every trader
declared in `traders.js` must be listed by some location, and every trader a location lists
must be declared - the same both-directions shape as the components and books checks. A
trader nobody can reach is the same kind of dead content as a component nothing can make,
and this one sat there far longer.

It reads the location blocks rather than the runtime registry on purpose: a trader can be
unlocked by a reward and still be listed by the room it stands in. Listing is the
placement; unlocking is only the permission. Negative-tested both ways - the cat café's
listing removed, and a room listing a trader that does not exist. 6 shops across 5 regions,
8 traders all placed.

One thing left where it was: the proprietress's `special` line still carries
`//todo: unlock paid action`. That is an action rather than a trader, so it is not this
proposal's, and inventing one to tidy a comment away is how content gets added for the
wrong reason.

### The dev console survives a reload and not a restart

P-20, the owner's request, and it is one storage decision rather than a feature: the
console's lifetime should be the tab's. `sessionStorage` is exactly that - it survives a
refresh and dies when the tab closes - so there is no flag to clear, no timer, and nothing
that can get out of step with anything else.

`enable_dev_console()` writes the key on the way out and the boot sequence reads it on the
way in, last of all, because the panel it reveals is DOM and the helpers it hands out
close over registries that the load fills first. Every access is wrapped in try/catch:
`sessionStorage` throws outright in some privacy modes rather than returning null, and a
dev convenience must never be the reason the game fails to boot. With storage blocked the
console still works for the page it was opened on; it just does not come back.

The line it prints changed too, because it was documenting the old behaviour: it said
*"Not saved - a reload turns it off."* It now says it survives a reload, is gone when you
close the tab, and is still not saved.

**`check_dev_console_is_not_saved`** guards the two ways this goes wrong, both silent:

- **`localStorage` instead of `sessionStorage`.** One word different, and the console is
  on for good on that machine - including for whoever the browser belongs to next.
- **The save.** An export is a file players hand to each other and paste into the import
  box. A save carrying "dev mode was on" would turn it on for somebody who never opened
  the console, on a machine where it was never enabled. That is the one a player would
  find rather than us.

So the key is required to appear only on lines that also say `sessionStorage`, and never
in `save_load.js` or `game_state.js` at all. The check reads the key out of the constant's
declaration rather than holding its own copy.

Negative-tested three ways: `localStorage` swapped in, and the key put into `save_load.js`
- first as a comment, which correctly did *not* fire, because `strip_comments` blanks
comments before the check reads them and a comment mentioning a key carries nothing. As
real code it fired twice, once per rule, which is the right answer for one line that
breaks both.

Maintenance: the dev console is not player-facing, so no version bump.

### The help page catches up with the game, and one check now says when it does not

P-21, and the owner asked for the flow rather than the lists. Measured: the map was
current, because `check_help_map_covers_the_world` demanded it every time a location
shipped. Everything the map does not cover had drifted since v0.7.0.

**What was wrong, in order of how misleading it was:**

- *"Where does current game content end?"* still said **"It is not yet possible to enter
  the town nor to open the second gate."** The town has been open through the merchant
  guild for a long time. It also stopped at the swamp and never mentioned the coast road,
  the bay, the salt house or anything past them - the last four versions of content.
- *"Is magic implemented?"* said it would come "after the town becomes accessible", which
  has already happened. It now says what is actually true and useful: the vocabulary is in
  the game and visible - Wands, Staffs, a mana pool, intuition - none of it is wired to
  anything, there is no wand or staff to be had, and those two skills therefore cannot be
  raised at all. And it says what the plan is, per Q-11: its own arc after the current
  story, not a feature dropped into one.
- **Combat stances** were described as buffs and penalties in exchange for stamina. Since
  v0.7.6 some enemies react to the stance itself, which is half the reason to pick one.
- **Seasons** were described as limiting "certain activities". They gate places and people
  now: one region changes twice a year on its own and announces nothing.
- **Standing** had one sentence about prices and named no regions at all - so `Guild`
  arrived as a fourth region, and a row on the character sheet, with nothing on the page
  to explain it.
- The bay's own blurb stopped at the ore it sells.

**The guard, and it took three attempts to make it able to fail.**
`check_help_explains_standing` requires every key of `character.reputation` to be named in
the page's account of standing, on both pages, in both directions.

The first version searched the whole page for the region's shown name. It passed with the
name deleted, because "guild" appears in the town's description and in the answer about
where content ends. The second narrowed the search to the standing paragraph and still
passed, because the paragraph's own explanatory clause says "the guild's kind of work" -
and in Turkish worse, since the language agglutinates and "loncanın" contains "lonca".

Both were checks that could not fail, which is worse than no check: they would have
reported four regions explained while explaining none. The third version marks each region
in the markup with `data-region="Village"` and so on - exactly what the map already does
with `data-location` - and compares that set to the declared one. The prose is then free
to read however it reads in each language, which is what D-7 wants anyway. Negative-tested
three ways: a marker removed from the Turkish page, a marker removed from the English one,
and a marker naming a region that does not exist.

Maintenance for the version rule: the help page is not the in-game changelog and the
player sees no new content, so no version bump.

### v0.7.8 - the bay gets a book, and Discoveries gets its answer back

Two things, and the second was found by measuring the first.

**P-15's first book.** Measured before writing it: ten books exist, and the Basic, Basic
plus, Intermediate and Swamp plus stock lists all carry some while the two Bay lists
carried none - in the one region whose entire trade is things that arrived from further
away than the player can go. `BookData` already supports everything a new book could
want, so no engine work was needed.

*Nothing Bites Here* is the book somebody who spent a working life on this coast wrote:
in order, every place along it where you will catch nothing at all. It is a much longer
list than the other one would have been, and by the end of it you understand why he chose
to write it that way round.

It **unlocks** rather than multiplies, which is the shape P-15 records as the one to
follow: six of the ten existing books are xp multipliers and the two most interesting -
`A Glint On The Sand`, `Butchering and you` - hand over an activity and a skill. This one
opens sea fishing at the bay, and that filled a hole worth noting on its own: **the
harbour had no activity of any kind**, which is strange for the only region whose identity
is work. It needed no new item either - Mackerel shark, Trout, Ratfish and Clam all exist,
and the difference out here is which of them is worth waiting for. Clams had exactly one
other source in the game.

**`check_books_can_be_got`** is the guard, and it is `check_components_can_be_made`
pointed at books: not "does this book name a real reward" but "can this book be got at
all". A book is the cheapest teaching surface here - no location, no NPC, no combat - and
that is exactly why one can be written, translated, given real rewards and never reach a
player without anything failing. Both directions, like its sibling: reading data with no
item is unreadable, and an item with no reading data reads instantly and teaches nothing.
Negative-tested three ways, one per branch, because the first branch `continue`s and would
have hidden the second. The reachability construction is now a helper both checks share,
so a new kind of source is taught to both at once.

**And the regression.** Measuring whether the new book was reachable turned up that it was
not - and neither were **White iron ore** and **Black iron ore**. When the bay's shelf
became a function in v0.7.5, `world_index.js` kept doing
`inventory_templates[trader.inventory_template]`, which resolves to `undefined` for a
function. Every item that trader sells silently left the Discoveries panel, including the
two ores the bay is the only source of in the entire game. Nothing threw. The page simply
had no answer, and a panel with no answer looks like an item with no source.

One resolver now, `stock_list_name_of` in `traders.js`, used by `get_inventory_from_template`
and by the index. `check_trader_stock_lists` already refused *assignments* to
`inventory_template`; it now also refuses *reading* it raw, which is the same problem from
the other side. The first pattern for that could not cross the inner `]` in
`traders[key]?.inventory_template` and passed the negative test - fixed and re-tested.

Two regression tests, on the two ores specifically, because the suite already had a test
for trade sources and it passed throughout: it used a trader whose stock list is still a
plain string.

### The owner's brief is in git, in both languages

P-17. `docs/TODO.md` has been deliberately untracked since the loop began, and both this
file and the loop's own instructions said so and said not to commit it. The owner has
reversed that: it is tracked now, as `docs/TODO.TR.md` - the Turkish original, kept whole
- and a canonical English `docs/TODO.md` beside it, at a matching `doc-version`, which is
what D-3 requires of every tracked markdown file.

**Why it was excluded, and why that reasoning survives being tracked.** The brief has no
checkboxes and nothing in it is ticked; the work is tracked in `PROPOSALS.md`, where the
brief was measured against the code and turned into numbered proposals. That distinction
is not bookkeeping. Parts of the brief assume things the code does not have - it names a
lockpicking skill, a navigation skill and guild standing, and when it was written none of
the three existed. Working straight from it would re-derive settled decisions and act on
assumptions that have since been measured and corrected.

So the reasoning is now written into the top of both halves rather than living in a
convention nobody outside this repository could see. The file says what it is: context,
not a queue, and the proposals are where the work is.

The argument for tracking it is simpler: a brief nobody can see is a brief nobody can
check the work against. Six versions of the Marrowmoth arc have shipped against this
document, and until today a reader could compare them only to a summary of it.

Three consequences were carried rather than discovered:

- **The loop's instruction file said the opposite** and would have had the next session
  act on a false statement. `.claude/` is ignored, so it cannot be fixed by a commit; it
  was edited locally in the same change. It also now says the reverse of what it said
  about itself: `docs/TODO.md` is a pair and passes D-3, while `.loop.md` is one agent's
  working orders in Turkish and is the wrong shape for an English-canonical pair, so it
  stays ignored.
- **`git add docs/` is still wrong**, for a different reason now. The hazard it used to
  carry - sweeping in an untracked brief and breaking `check_docs_are_paired` on the next
  run, which happened once today - is gone, but naming paths explicitly is what made that
  visible in the first place.
- **The English half is a translation, not a rewrite.** The brief's own structure is kept,
  including its run of top-level headings, because it is the owner's document and its
  shape is part of what was said.

`check_docs_are_paired` now reports 10 pairs across 20 files, up from 9 across 18.

### v0.7.7 - a tooltip that runs off the bottom opens upwards

Reported in play with a screenshot: the slums action tooltip drawn below the cursor on the
last row of the action list, with half of it past the bottom of the window.

**The cause is not what the symptom suggests.** There are two tooltip movers in the inline
script in `index.html`. `move_restricted_tooltip` measures the tooltip with `scrollHeight`,
works out where the bottom edge is and keeps it on screen. `move_unrestricted_tooltip` sets
`top` to `clientY + shift` and clamps nothing at all.

The action rows were in `elements_with_unrestricted_tooltips` - **while carrying
`target_classes` and `break_classes`, the two fields only the restricted mover reads.** The
entry had the fields of the clamping mover and was being handed to the one that does not
clamp, so those two fields did nothing whatsoever. And its own comment said *"unclamped, a
tall one then ran off the bottom of the page"* the entire time: it was not explaining a
past problem, it was describing the state the entry was still in. That is the most
expensive kind of comment there is.

**Fixed in two parts, because clamping is not what was asked for and is not right
either.** Pinning a tall tooltip to the bottom edge keeps it on screen and slides it up
over the row being pointed at, so the thing you are reading about ends up behind the thing
you are reading. The vertical rule is now: below the cursor by default; **above** it when
there is no room below; and only when it fits in neither direction, clamped - to the top,
because a tooltip read from its first line is worth more than one read from its last.

That applies to every restricted tooltip, not only the action rows, which is the right
scope: none of them wanted to be pinned over their own row either.

**The guard is where the arithmetic now lives.** An inline `<script>` in `index.html` is
the one part of this codebase no test can reach, and it was the part that was wrong. The
maths moved into `place_tooltip_vertically` in `ui_helpers.js` - pure, no DOM - and is
handed to the inline script through `window`, the way `main.js` already hands over a dozen
other functions. Ten tests, including the reported case written as the assertion that the
tooltip does not cover the row it describes. Negative-tested by taking the flip out: three
fail, and the third one is the screenshot - *"and it does not cover the row it describes:
600 vs 560"*.

One thing the checks caught on the way: `main.js` did not import `ui_helpers.js` at all, so
the first version of this referenced `place_tooltip_vertically` as a bare name. esbuild
treats an unresolved identifier as a runtime global, so the build and the bundle would both
have been clean and the game would have thrown on load. The import went on the end of
main.js's list, where a new edge goes.

### v0.7.6 - how you are standing changes what things do to you

P-14 phase 6's second of four pieces: stance choice made to matter through `on_hit` and
`on_damaged` rather than through a second set of stat multipliers.

**No new abstraction and no new enemy.** P-14 measured that `Enemy` already takes
`on_hit`, `on_damaged` and `on_death` and that four enemies use them, and concluded there
was no case for a second mechanism. That holds: every reaction here went into a hook that
already existed, or beside one on an enemy of the same family. And no fight was added,
because the arc itself has no combat and phase 4 said so - a stance pass that needed a
new enemy would have been a different phase wearing this one's name.

**Four reactions, and each is the fiction saying what the stats already imply:**

- **Red ant swarm.** Putting your point through the middle of a swarm does not stop the
  rest of it arriving, and what arrives gets up your sleeves - `Irritation`, a quarter of
  the time. Unless you are sweeping: Broad Arc, Berserker's Stride and Flowing Water all
  put a line through it and they go backwards instead. The `target_count` multiplier
  already made those stances kill a swarm faster; this is what makes picking one feel
  like the right answer rather than the arithmetically better one.
- **Frog.** The splash does not care how hard you hit, it cares how much of you is in
  front of it. Berserker's Stride drops block and agility to 0.4 and Broad Arc commits
  both arms, so twice as much lands; Defensive Measures halves it, which is the one
  stance whose whole purpose is having something between you and this.
- **Huge dragonfly** and **Dragonfly queen.** A stinger finds a body that has committed
  to a swing and misses one that has not stopped moving: half again as likely in the open
  stances, and down to 0.6 in Quick Steps or Flowing Water.

**The honest limit**, written into the file rather than left to be discovered: a hook can
only reach `add_active_effect` and the log. So a reaction is always "how you are standing
changes what this gets to do to you", never the enemy changing its own state. Nothing
here grows a state machine.

**`check_stance_reactions_name_real_stances`** is the guard, and it is the same silent
class as the season and region checks: a misspelt stance id compares false for every
stance there is, so the reaction is written, translated, shipped and never once seen,
while the enemy behaves exactly as it did before. That is the most convincing way for a
bug to look like a design decision. The ids come out of `combat_stances.js` rather than
being written down again, and both shapes are read - the named groupings and any inline
list. 10 ids against 7 stances. Negative-tested three ways: a misspelt id in a grouping,
a misspelt id in an inline list, and an empty list.

**A test-harness bug fell out of this.** `browser-free-src.mjs` stubbed `current_stance`
as the string `"normal"`, where `main.js` holds `stances["normal"]` - a Stance object.
Nothing had read a field off it, so the simplification was invisible; the moment a
reaction read `.id` it would have been `undefined` and every test of the mechanism would
have passed by agreeing that nothing ever matches. The stub is shaped like the real thing
now, and mutable, so a test can stand the hero differently and ask what changes.

Fifteen tests cover the decision the reactions turn on - which is the only part a
browser-free load can observe, since `add_active_effect` and the log are both stubbed
away - plus that all four reactions run without throwing in two stances with and without
a weapon, 400 calls. Negative-tested by comparing the stance object instead of its id,
which is the exact mistake the stub was hiding: five checks fail.

### v0.7.5 - tier 5 can be made, and the ore is dug rather than bought

P-14 phase 6's first of four pieces, and the one that closes most of P-12. Thirty-six
components have existed, finished, since before this fork - every white-steel and
black-steel weapon head, both shield bases, all three handles, and chainmail and plate
for all five armour slots - and nothing in the game could produce a single one of them.
All thirty-six are craftable now. `check_components_can_be_made` went from 159 of 203 to
195, and the tier-5 group came off `known_unmade` entirely rather than being explained
better.

**The ore is the point.** P-12 has asked since tier 4 shipped for "an ore that is mined
rather than bought", and phase 6 said tier-4 and tier-5 materials should be wired to what
the ebb opens. Both are the same sentence: `Heavy sand` is dug on the tidal flats, which
are only offered in the Marrowmoth's two seasons. So the tier-5 reagent inherits the
arc's window without carrying a condition of its own - the activity needs no season
gate, because the ground it is on does not exist out of season. Nobody sells it, because
nobody can get at it, which is exactly the opposite of tier 4, where the whole supply is
one shed at the bay.

It is a reagent and not a richer vein. `Heavy sand` does to white and black iron what
Atratan ore does to iron, so tier 5 is a smelting recipe with two ores in it - white or
black iron ore, five, plus heavy sand, three, plus two coal, at Smelting 25/35 and a
worse chance than tier 4. That reuses the shape steel already had rather than inventing
a second way for a tier to exist.

**Four items were missing and nobody had noticed.** The generator has built exteriors out
of "white chainmail", "white plate", "black chainmail" and "black plate" since before the
fork, and none of those four materials existed in `items.js` - which was 20 of the 36
unmakeable components on its own. They exist now, forged from the steel ingots at two and
three ingots the way the tier-4 pair is, and valued by scaling the tier-4 pair on the
ingot: 105/160 at 70 an ingot becomes 180/275 at 120.

Then 36 rows across the thirteen component recipes, which is mechanical work and was
written as such - generated from a table rather than typed, and asserted against the
tier-4 row it sits beside so a mismatched count or a misspelt result could not slip in.

**Negative-tested both directions of the guard**, because `check_components_can_be_made`
is enforced two ways and a list that only fails one way rots into a suppression file: one
of the new rows taken out, which the check named as an unmade component that is not on
the list; and a name put back on the list that something now produces, which it named as
a list keeping an entry it no longer explains.

**What P-12 still carries** is one question, and it is not a recipe. `roll_quality` reads
`station_tier - component_tier`, so tier-5 components forged at the mountain flue - the
best fire in the game, at tier 3 - roll at a two-tier penalty. Everything is makeable;
whether it comes out at the quality it is worth, and where a better fire would be, is a
balance and a place. That belongs beside phase 6's economy pass rather than as a station
bolted on alone.

**And a documentation drift worth recording.** P-12's Turkish half still described the
blocker the English half was corrected about a round ago - the "missing display name" that
turned out not to exist. `doc-version` matched the whole time, because that check
enforces that the two halves are at the same version, not that they say the same thing;
D-3 says as much itself. Both halves are correct now, and this is the failure mode of a
paired-document rule that nothing but a reader can catch.

### v0.7.4 - *One Unweighed Crate*: same hand, and no name for it

P-14 phase 5, and the end of the arc's story. The crate is reached, and the whole design
problem of the scene is that a crate is not a lock.

**The check is putting it back.** Perception and Woodworking, because what is difficult
is reading a lashing nobody at this quay would tie - it goes over itself in a sequence
you have to work out twice - and remaking it well enough that the man who tied it would
not look twice. So failure is not "it would not open". It is working that out *before*
cutting anything: there is no version where you cut it and tie it back convincingly, so
you do not cut it, and you sit with your back against it until the water tells you to go.
Nothing is lost, nothing is consumed, and the guard from 4a says so.

**What is in it.** Straw, then a bed cut to fit out of a grey material that is not felt
and is not cork and does not compress under a thumb, and is warmer than the hold. In the
bed, one thing: a closed band the size of a wrist, in a metal that is not iron and not
steel and not bronze and takes no mark from a nail, cut through all the way round with
squares that turn and come back to their own beginning.

One motif, one metal, one unexplained material, which is exactly what the proposal asked
for, and nothing else in the crate at all. Then the bed goes back, and the straw, and the
lashing is tied the way it was tied in the order it was tied, and checked twice.

**It pays no item.** That is the phase, not an omission. An object in the inventory has
to do something - be equipped, be crafted with, be sold - and anything it did would
answer a question this arc is explicitly not allowed to answer. What the player carries
out is a description and a pattern they have been told about exactly once before.

**The arc closes on the antique collector**, not the tallyman, and that was the one real
authoring decision here. The tallyman keeps a page; this man has catalogued the town's
oldest things for forty years and held the other piece *"for about the time it takes to
boil water"*. He is the only person in the game who can say "same hand" and be believed.
He asks for the rest of the description before he answers - the metal, what it did under
a nail, whether the case was warm - and then he puts the magnifying glass in the drawer,
which is the first thing he has ever been seen to do that was not about work.

*"Same hand. Not the same object. Not a copy of it, either, and not somebody imitating
one. The same hand, the way two doors in one house are the same hand."*

Three facts are canon out of that, and **nothing else is**: there are at least two;
somebody wants them and came for the first without haggling; and that somebody is not
whoever makes them. He does not say whose hand, and he says explicitly that he is being
careful because the player will remember it. `STORY.md` section 3 now records those three
and the list of what is still open - who paid for the robbery, why that traveller, where
either object came from, why the hero had one, and what the squares are - so the next arc
cannot widen them by accident. Reclamation over invention: the payoff is an NPC the story
notes had already marked as exhausted, extended rather than replaced.

Guard: `check_lore_threads_resolve` from phase 2a, and Q-8 did land on threads. The
Marrowmoth thread is five beats across three speakers now - a quay, a guildhall, and a
shop across the square - which is the shape Q-8 was written for, at full size. Under the
by-speaker list alone those five would read as three unrelated conversations.

Measured: the action sits on the hold at Perception 30/60 and Woodworking 15/40, the
quest carries two tasks under the id the save will hold, and the thread resolves to five
beats over `harbour tallyman`, `guild clerk` and `antique collector`.

### v0.7.3 - *Out on the Ebb*: three ways across the same mud

P-14 phase 4b. Two places and no more, per Q-9 - the tidal flats are the approach and
the lower hold is the destination - with the anchorage and the cargo deck as actions on
those two rather than rooms of their own. No combat anywhere in it: the obstacle is water
and dark.

**The tide is not a clock.** There is no time-of-day condition in this engine, and adding
one would have been precisely the scheduler Q-10 put out of scope. So what gates the
flats is the same season window the shelf, the quay's noise and the clerk's rumour all
read: the only reason to walk out there is that she is lying on the mud. It is a
`display_conditions` rather than an unlock, for the reason phase 2 gave - an unlock is
one-way, and she comes back twice a year - and the walk back up to the bay carries no
condition at all, so a player who is out there when the season turns can always come in.

**Three ways across, and only one of them can fail.** This is the phase's own rule -
every failure leaves another way, longer, dearer, or through standing - written into the
content rather than left for a guard to notice afterwards:

- **Wade it.** Equilibrium 18 to attempt, 42 to be certain. The bottom is not the same
  twice and there is no path, only a way that works today. Failure is the water turning:
  it does not rush, it just stops going out and starts coming in, and out there that is
  the same as being told to leave. Free, retryable, and it costs nothing but the tide.
- **Pay a boatman**, 25,000, taken only on success. The dear way is dear, not a second
  gamble at a higher price - it cannot fail. He poles a flat-bottomed boat over four
  inches of water, asks not one question the whole way, and will not wait.
- **Ask for the firm line**, `Slums` 250. Harder than the investigation's 200 on purpose:
  a porter talking is one favour and being shown where the bottom holds is a larger one.
  In his prints, not beside them. He knows that line the way you know a staircase in the
  dark, does not explain any of it, and stops at the hull: *"I am not going up there and
  neither should you. You will anyway."*

All three end at the same ladder and grant the same unlock, so nothing out here sits
behind a skill the player does not have.

**The hold** is heeled over onto the mud, so nothing down there is level and everything
was lashed by people who assumed it would be. Climbing and Spatial awareness, in the
dark, working out each hold-fast before trusting it. What is down there is what was on
the page - barrels, coils, pigs of tin, hides - all of it lashed in the same competent,
bored, professional way. And right aft, on its own, with four feet of clearance nothing
else on that deck was given: one crate, lashed differently. Not better; differently, by
somebody who was not doing it the way you do it a hundred times a season.

The player does not touch it. Reaching it is phase 5's, and the arc is built on finishing
with more questions than answers.

**What the checks caught that the writing missed.** Four separate things, none of which
would have been visible by reading the source: both new locations had no `name <location>`
row, so the location header and every travel line would have shown the registry key;
three travel-line ids were declared and not written; and both help pages' maps did not
name either place, which the site check reports as *"the players who read the map will
not know it exists"*. That last one is the kind of gap that would have shipped silently -
a location is reachable and correct and simply absent from the printed map.

No new guard: 4a's `check_no_dead_end_skill_gates` covers this, and the four new actions
joined the class-level checks automatically. 17 quest-advancing actions, none lost on a
failure; 69 actions can all explain failure; 36 location collections assigned once each.

Recorded for the phases after this: 4a's guard reads `main.js`'s attempt resolver by the
order of three call sites, so any rework of that resolver has to keep the lock on the
winning side or say why.

### The dead-end guard does not say what the plan said it would

P-14 phase 4a. The proposal asked for `check_no_dead_end_skill_gates` and stated the
rule outright: *a task whose only advancer is a skill-gated action must have a second
advancer*. Measured against the content, that rule is false here, and enforcing it would
have been worse than not having the check at all.

Five visible tasks are advanced only by a skill-checked action. Four of them are a
region's signature: `read the ground` on the plains, `read the departures` at the bay,
`cut a flue` in the mountain, and the plains' quest step that reads the ground. The
fifth is `see the manifest`, shipped two versions ago. Writing the planned sentence into
a check would have flagged all five, and the only ways out would have been to bolt a
second advancer onto four deliberate one-way actions or to keep an allow-list of
exceptions - which is a check that has stopped believing itself.

**What actually locks a quest**, read out of the resolver rather than assumed:
`lock_action` is called from exactly one place in `main.js`, inside the win branch of
the attempt. A failed attempt is never locked out. So a skill check is not a trap here -
it is a retry, and the skill can be trained. The plan's rule was written against a
danger this engine does not have.

There are two dangers it does have, and the guard is those:

1. **A lock outside the win branch.** It is one edit away at all times. Move
   `lock_action` below `pick_failure_text(action, "random_loss")` and every
   skill-checked advancer in the game becomes one-shot in the same instant - five tasks
   turn into dead ends together, and nothing else in the suite would notice. The check
   reads the three call sites and requires the lock to sit between the success text and
   the loss text.
2. **An item eaten on a failed attempt.** Items in `conditions[0].items_by_id` marked
   `remove` are taken whether the attempt is won or lost, and `required.items_by_id`
   takes `remove_on_fail` outright. Four actions consume on any attempt today - camping
   supplies at two sites, coils of rope at two more - and not one of them advances a
   quest. That is the line: an action may cost you something to fail at, or it may be
   the only way to finish a task, and not both.

13 quest-advancing actions, none of them lost on a failure. Negative-tested both rules:
the lock moved into the loss branch, and a consumed coil of rope added to
`see the manifest`'s conditions. Each was named on its own terms.

The proposal now carries the corrected rule and the measurement behind it, because the
next person to read "the guard phase 4 asks for" should find what was built and why it
differs, rather than a check quietly not matching its own description.

No version bump: the player sees none of this.

### v0.7.2 - *A Stroke Through It*: three ways in, three different answers

P-14 phase 3b. The brief's requirement was three information paths that give **different
pieces rather than the same piece**, and that is the whole design problem: three ways to
learn one fact is one path with three doors.

**The three pieces.** The guild's seal book says the mark on that line is a house seal,
cut out of good stock by somebody who has done it before, and belonging to a house that
is not in the book and never was - the book being the record of every house seal in use
in this town is exactly what makes its absence mean something. The porters say two men
took it off a forty-ton hull, that it was light, and that it went south on a cart with
its wheels wrapped in sacking, before the light went. The factor's old copies say the
same empty line is there two springs back, with one letter begun in the destination
column and stopped, under the ruling - so somebody knew where it was going for as long as
it takes to write one letter. Who paid is in none of them, and that is the arc's
one-layer rule holding.

**The thresholds were derived, not invented.** The slums' three actions sit at 100 / 200
/ 300 and the square's three at 50 / 150 / 250, against 350 Slums and 320 Town earnable
across the story. The porters read Slums at 200 and the factor's shelf reads Town at 150
- each district's own middle tier. The seal book reads Guild at 50, which is the region
Q-7 added and which nothing read until now.

**Guild standing had to become earnable inside the arc**, and that was the one decision
here with a save behind it. Bolting it onto *The Merchant's Word* would have paid nobody
who finished that quest before today, and the guild path would be shut for those players
for good. So quest 1 pays 60 on completion: in reach for anyone who got that far, out of
reach for anyone who did not, and independent of when they played.

**Quest 2 has one task with three advancers rather than three tasks with one each.** A
player with the row but not the town, or the guild and neither, still finishes it. What
they lose is the other two pieces, and the lore thread says so by being shorter. That is
the owner's rule that a failed check never locks a quest, applied to standing.

Which raised the question of whether phase 4's `check_no_dead_end_skill_gates` should
come forward, the way phase 1's and 2's guards did. Measured rather than assumed: of 61
visible tasks with advancers, 5 have no advancer that is ungated - *The Infinite Rat
Saga* #3, *Village expansion* #0 and #7, *A Fire in a Hollow* #1, and this one. None of
them is a dead end, because every one of those gates refuses with a reason and can be met
by training a skill or buying a tool. A gate that says why is not a check that fails, and
that is the distinction phase 4's guard has to be written around. Bringing it forward
would have flagged four innocent tasks and taught the wrong rule, so it stays where it
was planned, with the measurement recorded so phase 4 does not repeat it.

**Nothing here is season-gated**, which is a decision rather than an oversight. The
paperwork and the people are on the coast all year. Gating the investigation on the
window would mean a player who read the manifest in late autumn waits until spring to ask
a question about it, and a quest that stalls for half a game-year is not a gate, it is a
wall.

No new guard is owed: phase 3's own is `check_reputation_regions_have_names`, which
shipped with 3a and now covers 58 uses across 4 regions.

Measured in the loaded game: three paths on three different regions at 50 / 200 / 150,
quest 1 paying Guild 60 and quest 2 paying 40 more, and the Marrowmoth thread now
standing at three beats across two speakers.

### Guild standing is a reputation region, and a region key can no longer be a typo

P-14 phase 3a, and Q-7 put into code. Phase 3 wants three information paths that differ,
and two of the three axes were already spent: the town square reads Town at 50 / 150 /
250 and the row reads Slums at 100 / 200 / 300, so a third path off either of those is
the same path twice. A fourth region is what makes a third path feel like one - a number
the player can watch rise, rather than the flags-and-quest-state alternative, which costs
less code and buys nothing.

The cost was what Q-7 measured and no more. `character.reputation` has a fourth key,
`Guild`, and both locales have a `name Guild` row. Nothing else moved:

- An old save simply arrives without the key. `load()` walks the keys **in the save**
  and warns past one it does not know, so a missing key leaves the declared 0 standing.
  Verified against a real v0.6.54 export rather than assumed: every key in it still
  resolves.
- `update_displayed_reputation` draws only regions above 0, so nobody sees a row they
  have not earned - which is also why this ships without a version. Nothing can earn
  Guild standing yet, so the row never draws and the player sees no change at all.
- `market_saturation` is a separate map and is untouched. A guild that prices nothing
  does not need a market region.

**`check_reputation_regions_have_names`** covers more than its name says, because a
region key is read by three things and none of them agree automatically:

- The character sheet resolves it through `getDisplayName`, so a region with no
  `name <region>` row draws the id in the one panel the player has open all game. Every
  locale is checked, not just the reference one: a region earned by a Turkish player
  draws from the Turkish file or it draws the placeholder.
- A `reputation:` **reward** names a region, and `add_reputation` *throws* on one it
  does not know. That is a crash in front of a player at the moment a quest pays out -
  the worst place for it and the hardest to reach by playing.
- A `reputation:` **condition** names one too, and fails the opposite way:
  `character.reputation[typo]` is undefined, every comparison against it is false, and
  the gate is shut for good with nothing said anywhere.

The last two are the same literal, so one scan over every file under `src/` covers both.
4 regions, 2 locales, 51 uses.

Negative-tested three ways in three files: the Turkish `name Guild` row deleted, a
misspelt region in a quest reward, and a misspelt region in a dialogue reward. All three
were named, and the missing row was named twice - once by the existing locale-parity
check, which can only say a key is missing, and once by this one, which says what
breaks and where the player would see it.

One thing recorded rather than fixed, because it belongs to 3b: Guild standing has to
become earnable **inside the arc** and not only from the guild work that already exists.
A save that finished *The Merchant's Word* before this shipped would otherwise be locked
out of the guild path for good, and a path that is closed depending on when you played
is not a path.

### v0.7.1 - *Forty Tons*: a line somebody wrote empty, twice

P-14 phase 2b, and the arc's first content that asks a question rather than answering
one. Two actions on the existing bay, one quest, and the first real lore thread.

**Both actions are shown by `display_conditions` on the season** rather than unlocked
and locked again. "She is not here" is a state of the world, not a state of the player,
and the difference is not academic: an unlock is one-way, so the second time she came in
the actions would have had to be unlocked again by something, and there is nothing to
do it. A season condition simply stops matching and starts matching, and the phase-1
window is what both read.

**The unloading pays nothing**, and that was a correction rather than a design. The
first draft gave 900 for a day's work, which contradicts a line the player has already
overheard on the quay - *"Who is paying the porters?" "Nobody is paying the porters."*
Canon written last version outranks a reward written this one, so the pay came out. What
is left is Equilibrium and Weightlifting xp, bread and a cup of something from somebody
who is gone before you look up, and the tallyman's *"You are not on the book. Nobody is
on the book."* The unpaid part is the point.

**The manifest** is action success text, no new interface, exactly as Q-8 required. Six
columns - cargo, weight, origin, destination, seal, status - five complete lines, and at
the foot of it one line with four of the six written empty. Not smudged and not
corrected: the ruling underneath is unbroken. The status column says it came off her.
Somebody wrote that much and stopped.

Reading it is the second step on purpose. A stranger does not walk up to the shed door
and read the tally; somebody who spent a day carrying cargo down her plank does, and
nobody stops him. Literacy gates it at 8 and makes it certain at 20, mirroring how
`read the departures` reads Perception.

**The tallyman does not explain it, because he cannot.** He says what a tally is: a
weight goes in the column when a thing is weighed, that one was not, so there is nothing
to put there. Then he says it is the second time - two springs apart, both lines in his
own hand, and the only two like it in eleven years of keeping the page. He will not say
it is the same crate. He did not weigh either and did not open either, so what he knows
is that the line was the same. Who told him not to weigh it is not in this game yet, and
that is the arc's one-layer rule holding.

**The thread.** `lore thread the Marrowmoth` runs across the tallyman's two lines on the
quay and the guild clerk's rumour a month's walk inland. That is Q-8's own case - one
subject, two speakers - and under the by-speaker list alone it reads as two unrelated
conversations. The clerk's line, which shipped in v0.7.0, needed `lore: true` as well:
it changes nothing in the world, so the derived rule would have dropped it and the
thread would have been one speaker after all.

**Quest 1 opens from the work.** Three tasks, no combat, and the last one is a question.
Nobody hands it out: the player is already on the plank before the journal mentions her,
which is the rule the whole arc is built on.

Two things the checks caught that reading the source would not have:

- `marrowmoth_seasons` was used in `data/locations.js` and only `is_marrowmoth_in_port`
  was imported. esbuild treats an unresolved identifier as a runtime global, so the
  build and the bundle would both have been fine and the bay would have thrown the first
  time a player walked onto it.
- The two actions were first written as `locations["The bay"].actions["id"] = ...`, one
  assignment each. `check_action_branches` reads the single declaration site, so both
  actions were invisible to it - it reported that something unlocks an action "which is
  not declared there". They are entries in the existing literal now, one declaration
  site as the check assumes.

And one the tests caught: 2a's baseline assertion that no unit claims a thread failed,
correctly, the moment content claimed one. It now asserts the real thing instead - that
the Marrowmoth thread is declared on more than one beat and by more than one speaker,
and that a thread is not drawn until something in it is heard, which is what keeps the
panel honest about what the player actually knows.

Measured in the loaded game rather than read off the page: both actions are on the bay
with the Spring/Autumn condition, the quest has three tasks under the id the save will
hold, and the manifest and the thread's name resolve in both languages with no missing
text.

### An investigation is one thread, not three conversations

P-14 phase 2a, and Q-8's answer put into code. The brief wanted investigation notes to
live somewhere, and named Discoveries; Discoveries is not what it sounds like. It
renders *items* against where each one comes from. Lore renders *textlines the player
has heard*, grouped by speaker. Six facts about one hull learned from three different
people therefore sit under three different names and read as three conversations rather
than as one thing being worked out - which is the failure, and it is a grouping problem
rather than a missing panel.

So `Textline` takes an optional `lore_thread`: a text id naming the thread. One field,
one branch, nothing added to the save - textlines are already tracked as unlocked. The
excluded alternative was a fifth journal surface, which the brief ruled out and which
every standing directive here exists to prevent; the game has four already.

`world_index.js` does the grouping, not the panel, which is what makes it testable at
all - the panel needs a browser and the index does not. `lore_thread_of(unit)` reads
the beat rather than the line: a unit can fold several textlines into one beat, so the
first line that names a thread decides for the whole beat. `lore_threads(everything)`
returns the groups in the order they first appear, which is roughly the order the
player met them, since dialogues are declared that way.

A threaded beat is drawn in its thread and **not** under its speaker below. Showing it
in both would put the same six facts on the page twice, and one thing rather than three
conversations was the whole request. Who said it is still on the entry itself. The
by-speaker heading is now only drawn when something is left under it, because a heading
over an empty list reads as a bug and everything-heard-being-threaded is an ordinary
state.

**`check_lore_threads_resolve`** is phase 5's guard, brought forward for the same
reason phase 1's was: it is what makes the content that follows measurable. Threading
and lore-keeping are two independent decisions, which is where the failure hides - a
line put in a thread and marked `lore: false` is dropped before the grouping ever sees
it, so the thread quietly holds one fewer beat, or none, and the heading vanishes with
no error anywhere. Three rules: no line in a thread may be `lore: false`; a thread needs
at least two beats, since one beat under a heading of its own is a line with furniture
and the by-speaker list already had it; and a thread's id is a text id like any other,
so `check_content_text_ids` now scans `lore_thread` and a thread whose name has no
locale row fails rather than rendering its own id as a heading.

Negative-tested four ways at once, with a valid two-line thread alongside them so the
parser was proved to find threads rather than to find nothing: a `lore: false` line in
a thread, two separate one-line threads, and an id with no locale row. All four were
named.

Nine tests cover the grouping, and they load `world_index.js` and `data/dialogues.js`
into **one** graph so a textline can be threaded at runtime and the index sees it - two
separate loads are two unrelated copies of `src/` and would prove nothing, which is how
an earlier gate test first failed against working code. The case tested is Q-8's own:
two beats, two speakers, one subject.

The first version of the fold test passed against a deliberately wrong implementation
that read only the head line, because the thread had been put on the head line. It is
on the *second* line of the fold now, and the wrong implementation fails four checks.
A test that agrees with the bug is worth less than no test, since it certifies it.

No version bump: nothing in the game is threaded yet, so the panel draws exactly what
it drew before - which is the first thing the tests assert. Phase 2 is split in the
backlog to say so. 2b is the manifest, the arc's first real thread, and v0.7.1.

### v0.7.0 - *No Word Sent*: three surfaces and no notification

P-14 phase 1. The brief's rule was that the player learns the Marrowmoth is back from
the world rather than from a quest log, so the whole of the phase is three things
changing and nothing announcing that they have.

**The window is Spring and Autumn**, and which two seasons was not a coin toss. She
goes out on the ebb and comes back on it, so she needs the year's biggest tidal ranges,
and those fall around the equinoxes. It is the same pair phase 4's low-tide approach
has to be timed against, so the choice pays for itself twice.

It lives in `src/data/marrowmoth.js`, which imports nothing. Three modules read it -
`traders.js` for the shelf, `data/locations.js` for the quay, `data/dialogues.js` for
the rumour - and all three already sit in a graph that is circular by design, so a
constant read from a leaf costs no edge at all. That is the same reason `registries.js`
exists. The alternative was three inline copies of the same two-season list, and the
copy that drifted would have failed silently: a season gate that never opens looks
exactly like content nobody has reached yet. It is one hull's timetable and not a
world-event framework, which Q-10 put out of scope.

**The shelf.** `inventory_templates["Bay in port"]` is the same list as `"Bay"` with the
far-away half turned certain: the white and black iron ore nothing in this country mines
goes from a third of a chance and three sacks to a certainty and up to sixteen, and the
ingots and leather roughly double. Nothing new is sold, which is the point - the player
who walked up here in summer and found two sacks at the back comes back in autumn and
finds the floor covered. Prices are untouched; a glut does not make the carriage cheaper.

The hazard Q-10 named is in that sentence's tense. `inventory_template` is **not**
written to the save, so a list swapped onto the trader would survive until the tab
closed and then quietly revert - the same silent shape as the bug that lost the owner's
favourite items. So the field now takes a function as well as a name, and the bay's
derives the list from the season at every refresh. The world decides, every time, and
the save never has an opinion.

**The quay.** Four ambient lines in season, mixed into the ordinary six rather than
replacing them, because a harbour with a forty-ton hull alongside is the same harbour
with more going on in it. None of the four names her: a hull warping in past the last
bollard, someone saying *forty, on this bottom*, two people failing to work out who is
taking the cargo off, and the gulls all moved to one side of the water. Added rather
than swapped because a player who has never stood here in autumn has nothing to compare
against, so the change has to read as more rather than as different.

**The rumour.** The guild clerk, who is the only one of the three that says the name,
so a player who has seen the other two arrives with a question instead of being handed
one. She has no work off a hull that lands twice a year and posts nothing, she has
stopped writing it down, and she would like to know who to send the bill to. No
`locks_lines`: a rumour is on the board while she is in and gone when she is not, and
the season gate is the whole of that mechanism. It starts no quest - quest 1 opens from
the discovery, not the other way round, and that is phase 2's.

**Two guards grew rather than two being added.** Both had quietly stopped covering what
they were for, which is the failure this project keeps finding:

- `check_trader_stock_lists` read one written-out template name and nothing else, so the
  moment the bay's became a function the count went from 8 traders to 7 and the check
  still passed. It now reads the whole value expression however it is written - a
  ternary naming two lists is two names - and it refuses **any** assignment to
  `inventory_template` anywhere in `src/`, with the constructor's own named as the one
  exception. That is Q-10's do-not-store rule made mechanical rather than remembered.
  The first pattern for it was anchored on a bare identifier and walked straight past an
  assignment through a subscript, which the negative test caught.
- `check_seasonal_content_is_reachable` read three named files and one condition shape.
  The arc's own window is a constant in a fourth file, so the one place that actually
  decides when any of this happens was the one place unchecked. It now reads every file
  under `src/` and every named season list - a `*seasons` declaration or a `*seasons:`
  property, which is what `availability_seasons` already was. 25 season names across 54
  files.

Negative-tested three ways at once, in three different files: a misspelt season in
`marrowmoth.js`, a stock list that does not exist inside the derived template function,
and a store of a template onto a trader. All three were named. Seven tests cover the
window itself, including that it leaves exactly two seasons empty, because twice a year
has to mean twice.

Measured rather than reasoned about: the two stock lists exist with fourteen rows each,
the trader's field really is a function, and the predicate answers true for Spring and
Autumn and false for the other two.

### The season condition can name two seasons, and a misspelt one can no longer ship

Groundwork for P-14 phase 1, which is where the Marrowmoth comes back into port twice
a year. Q-10 settled that as two seasons and no scheduler: seasons come round on their
own, so a recurring window costs nothing but a condition that can name both halves of
it. `season: {yes}` and `season: {not}` could name exactly one.

They now take a season or a list of them. Widened rather than replaced, for two
reasons. The string shape is what the content already uses - the supplier's `troubled`
and `troubled unavailable` lines are a `not: "Winter"` / `yes: "Winter"` pair, and a
condition other content depends on is the wrong thing to change out from under it. And
a list is already how this project names several seasons: an Activity's
`availability_seasons` has been one since before the fork. Inventing a third spelling
for the same idea would have been the parallel system every directive here exists to
prevent.

Fourteen tests pin both shapes down, in the `src/conditions.js` section of the suite,
which had no season coverage at all - the stub there carried a `current_game_time`
with a `season` property and no `getSeason()`, so any season gate would have thrown.
Negative-tested by putting the single-season comparison back: five of the fourteen
fail, including both halves of the twice-a-year window and the one-item list.

`check_seasonal_content_is_reachable` is the phase's own guard, brought forward
because it is what makes the rest of phase 1 measurable. A season name is a string
compared against `getSeason()`, so a typo fails silently and in two different
directions: a misspelt `yes` is content that is authored, translated, shipped and
never once reachable, while a misspelt `not` excludes nothing and leaves the gate open
forever. `availability_seasons` is the same mistake under another name - it quietly
makes a job available all year - so it is read too. The season list comes out of
`game_time.js` rather than being written down again, so the check cannot drift from
the game. 23 season names across three files, all real.

Negative-tested four ways across two files, because one typo in one place would only
prove the instance: a misspelt `yes`, a misspelt `not`, a misspelt
`availability_seasons` entry, and an empty list. All four were named, and the summary
line no longer claims everything is fine while errors are standing.

No version bump: no content names two seasons yet, and every existing single-season
gate behaves exactly as it did. Phase 1 is split in the backlog to say so - 1a is this,
1b is the salt house's shelf, the bay's ambient lines and the guild's rumour, which is
what the player sees and what ships as v0.7.0.

### The Marrowmoth's four decisions moved into the proposal that asked them

P-14's phase 0 is the ground: no story, and its whole job is to make the phases after
it measurable. Three of its four items turned out to be about the record rather than
about the code, and only one was work.

Q-7 to Q-10 were settled and then left sitting under **Open decisions**, which is the
wrong place for an answered question. That section is project-wide - Q-1 to Q-6
constrain everything the fork does - while these four constrain one phase each, and a
reader of P-14 had to leave the proposal and come back to find out what phase 3 was
allowed to assume. They are now `#### Decisions carried into the phases` inside P-14,
each heading naming the phase that spends it: Q-10 by phase 1, Q-8 by phase 2 and
drawn on again by 3 and 5, Q-7 by phase 3, Q-9 by phase 4. The numbers are kept, so
the commits and changelog entries that name them still resolve, and each phase now
states the answer it is built on in its own paragraph instead of pointing at one.

The other three items closed by being measured rather than by being done:

- **STATUS was the file that was wrong** about item 48 and P-13/35, not PROPOSALS.
  Both had closed and were still on the in-flight list, which sent a reader into the
  backlog after proposals that are not in it. The correction landed with the hint
  work; phase 0 only had to record which way it went.
- **The two quest tasks with no hint do not reproduce.** The gap underneath the report
  did, and `check_hints_say_when_they_cannot_point` holds it.
- **The two missing material rows are not missing**, re-measured rather than taken on
  trust from the entry that said so. `White short blade` is a real registry key, its
  `name_parts` resolve `material name white steel` and `component short blade`, and
  both rows are in `locales/english.js` and `locales/turkish.js` - as are the black
  steel pair. `white steel` carries `name: "white"`, so the key and the assembled
  display name agree, which is why `check_generated_items` verifies them without
  complaint. Tier 5 is blocked on recipes and on nothing else.

P-14 is `active` rather than `open`, and phase 1, *No Word Sent*, is what comes next.
STATUS says the same, and its reading order stopped claiming the standing directives
end at D-8 - there are nine.

### A `---` under a sentence is a heading, and two of ours were

Found while correcting the record above, which is the only reason it was found at all:
the `---` before **Open decisions** sat directly under P-14's closing sentence in both
PROPOSALS halves. Markdown reads a run of dashes beneath a non-blank line as a setext
underline, so that sentence had been rendering as an `<h2>` in every viewer since it
was written, and it looks perfectly correct in the source. Nothing about a diff shows
it either: the two states differ by one blank line.

D-8 wants the class rather than the line, so `check_thematic_breaks_are_not_headings`
reads every tracked markdown file and requires a blank line above any line that is
only `-` or only `=`. Fenced code is skipped, because markdown is not parsing it, and
table delimiter rows never reach the test because they start with `|`. Sixty-two
thematic breaks across the eighteen files, all of them rules rather than headings.

Negative-tested three ways rather than one, because a guard that only catches the
instance it was written for is not a guard: the blank line taken out of `STATUS.md` -
a file the defect was never in - and the check named it; the original defect put back
into `PROPOSALS.TR.md` and it named that; and a `---` inside a fenced block directly
under a non-blank line, which it correctly ignored and did not count.

---

## 2026-08-30

### The agent's own loop instructions stay out of git

`.claude/` is ignored. It holds the development loop's instruction file and
whatever local settings a harness writes beside it.

The reason is not tidiness. `.loop.md` is written in Turkish, and D-3 holds every
*tracked* markdown file to a `NAME.md` / `NAME.TR.md` pair at a matching
`doc-version`. Committing that directory would have `check_docs_are_paired`
demand a `.loop.TR.md` - so the loop's own instruction file would fail the
quality gate the loop exists to pass. An English-canonical Turkish-translated
pair is the wrong shape for a file that is one agent's working orders.

The loop file itself was replaced as well: what was there was a generic
template, and most of what it said about this repository was not true of it. The
corrections, in order of how much they would have cost:

- It said to mark a finished proposal `done` and leave it in `PROPOSALS.md`.
  `check_docs_are_paired` reports exactly that as an error (D-9: write it up in
  `CHANGELOG.md` and remove it), so the loop would have failed its own gate on
  every iteration that finished anything.
- It treated `docs/TODO.md` as the work queue, outranking `PROPOSALS.md`. That
  file has no checkboxes and is untracked, so there is nothing there to tick -
  and the owner has already measured the brief into P-14. Working from the brief
  would re-derive settled decisions and act on things the code does not have:
  no guild standing, no lockpicking skill, no navigation skill.
- It never mentioned the Turkish half of anything, or `doc-version`. Both are
  enforced.
- It invented a `// SORU:` comment for a blocked item. The project already has a
  convention - status `blocked` plus a numbered `Q-n` under **Open decisions** -
  and Q-7 to Q-10 are sitting at `PROPOSED`, undecided, which Phase 0 of P-14
  asks to be settled first.
- The version rule was one vague paragraph. It is now two branches: maintenance
  touches only `docs/CHANGELOG.md` and its Turkish half and leaves
  `game_version.js`, `package.json` and both changelog HTML files alone;
  player-visible work bumps both version files and adds both HTML entries. The
  symmetry is enforced - `npm run check` requires both HTML copies to carry an
  entry for the current `game_version`.

It also carries the traps this session actually hit: `LOCALE_STRICT=1` is bash
syntax and needs `$env:` in PowerShell, `npm run build` fails with EBUSY while a
test server holds `_site`, esbuild treats an unresolved identifier as a runtime
global, and `git checkout <file>` silently discards your own work - which is how
`style.css` was lost mid-way through a negative test today.

### The two quest tasks with no hint do not exist, and the gap under them did

STATUS has carried "two quest tasks show no hint in the journal" as an open item
needing live-state measurement. Measured, against the owner's own exports rather than
against the source: at 2026-08-29 and at 2026-08-30, every active quest's current task
resolves to exactly one named place. Nothing renders without a hint.

Structurally it cannot, either. The journal builds a hint two ways - `create_quest_hint`
for a task that counts something, `create_quest_step_hint` for one that does not - and
only the second can be reached from a visible quest. All five live `task_condition`
blocks belong to the two hidden quests, which never appear in the journal at all, and
`Test quest` is commented out. The report was true before the "it is elsewhere" line
landed and has been stale since.

Reading the save right took two attempts and the first was wrong. `task_status` is not
a boolean per task: it holds `{is_finished: true}` up to and **including** the current
unfinished task, whose entry carries `{progress}` instead - so its length minus one is
where the player actually is. Read as booleans, every entry is truthy, and three quests
across two exports look finished-but-active. They are not; they are on their last step.

**What was real.** Only `create_quest_step_hint` had the fallback. Its counterpart
returned nothing at all when the zones a counted task names are all still unfound, so
the first visible quest to count a kill would have shown a 0/10 with no line under it -
the same state the fallback was written for, waiting in the other path. Both share one
`create_hint_elsewhere_line` now.

`check_hints_say_when_they_cannot_point` keeps them together, on the rule Q-6 settled
for the language switch: name the places that must do the thing and fail when one stops.
It requires both builders to reach the shared line, and the locale id to live only
inside it, because an inlined second copy is how the two drifted apart in the first
place. Negative-tested both ways: the fallback taken out of one builder, and a second
copy of the id inlined into the other.

### The backlog described a blocker that was not there

P-12 has recorded tier 5 as blocked on two missing locale rows - `material white`
and `material black`, leaving a white-steel component with nowhere to get its name
from. Both halves are wrong. The generator asks for `material name white steel`,
not `material white`, and that row has been in both locales the whole time along
with the other thirty-seven. What is actually missing is every recipe:
`crafting_component_filling.js` builds 36 white-steel and black-steel components
and nothing in the game produces a single one.

A backlog entry describing the wrong blocker costs whoever picks it up the same
measurement twice, so the measurement is a check now rather than a sentence.
`check_components_can_be_made` reads the arrow the opposite way from
`check_recipe_item_names`: not "does this recipe name a real item" but "can this
generated item be got at all" - by recipe, by trader, by drop, or as a reward. 159
of 203 can. The 44 that cannot are listed with a reason, and the list is enforced in
both directions, so a name cannot sit on it once something makes it and cannot be
added for something the generator does not build.

It found eight beyond tier 5 that nobody had noticed: `Wool shoes`, `Linen shoes`,
`Turtleshell shield handle`, and five `Turtle shellplate` armour pieces duplicating
the hand-written `Turtleshell` ones the recipes actually name. All eight are a
material listing a component type no recipe was written for, which is exactly what
widening a `types` array does silently - the items cost nothing at runtime and are
invisible in play, which is why they accumulate.

Negative-tested three ways: a live tier-4 recipe row removed, a name added to the
list that the generator does not build, and a listed name given a recipe. Each fails
with its own sentence.

**And the status file was describing finished work.** Its `In flight` section still
listed item 48 and P-13/35 after both closed, which sends a reader into the backlog
hunting for proposals that are not in it. It lists P-14 and P-12 now, and says where
a finished item lives instead.

### The journal's panels were sized against a tab bar that wraps

**v0.6.72.** Reported three times: titles, discoveries and the quest list
each painting past the bottom of the journal and over the skills box below,
plus the quest list sliding under its own hide-completed bar.

One cause. Everything under the tab bar was sized against a guess at how tall
that bar is:

```
#journal_div          height: 330px
#journal_content_div  height: 287px   <- 330 minus a 43px bar
the panels            height: 284px
```

Measured in the running game: with seven tabs the bar takes **three rows and
72px**, not one row and 43px. 287 + 72 = 329 against a 330px journal, so each
panel hung ~18px out of the bottom, and nothing in that chain clips. Adding
the Titles tab in v0.6.69 pushed the bar onto the third row - proved by hiding
one tab, which drops the bar to two rows and the overflow to exactly zero.

The numbers are gone: `#journal_div` is a column, the content takes what the
bar leaves, the panels are 100% of that, `min-height: 0` throughout so the
scrolling lists are allowed to shrink instead of forcing their height back up
the tree.

The quest bar was the same mistake in miniature. `position: absolute` with
`bottom: 0`, whose nearest positioned ancestor is `#journal_div` rather than
the quest box - so it was pinned to the journal's bottom edge while the list
above kept its own height. It is the column's last row now, and `#quest_list`
scrolls rather than the box: had the box kept scrolling, the bar would scroll
away with the content.

Verified at two viewports with a real save: all seven panels 2px inside the
journal, the bar 2px inside it, and with the quest list scrolled to its end
the list's bottom meets the bar's top exactly.

**The check, and a blind spot in the check.**
`check_journal_panels_are_styled` asked whether each panel had a height and
whether something in it scrolled. Both were true here - the height was simply
a number about a different layout. It now refuses a px height on a journal
panel or on the content div, because that is always a guess about a bar that
wraps.

Writing that exposed a second fault in the check itself: it guessed each
panel's list as `${panel}_list`, which is wrong for the quests tab -
`#quest_list`, singular. The box scrolled at the time, so the miss cost
nothing and stayed invisible until the scrolling moved to the list. It reads
the ids out of the markup now. Negative-tested three ways: the 287px put back,
the scrolling taken off `#quest_list`, and a tab hidden.

### A tool for the quest progress that a save lost

`node scripts/restore-quests.js <newer-save.txt> <older-save.txt>`

Between two exports on 2026-08-30 a save came back with its quest block
flattened - every quest `is_active` false, `is_finished` false, `task_status`
empty - while the rest of the character was untouched. Measured across the
exports: 08-29 22:23 holds 14 finished quests and 18 with task progress;
08-30 01:44, same character and more xp, holds 1 and 2.

The cause is fixed and the round-trip is clean: loading that save and writing
it straight back returns 14 finished, 4 active, 18 with task progress, losing
nothing. But a save written while the bug was live carries the loss forward,
and replaying the older export gives up everything earned since.

The merge never takes progress away - `is_finished` true in either save wins,
`is_active` likewise unless already finished, `task_status` merged index by
index - so it is a no-op on a healthy pair and idempotent on any pair.
`task_status` is positional and quests have gained tasks since, so the array
is matched against the *current* definition rather than either save: extra
entries dropped, missing ones filled with false.

### The original game is linked from the game, and tooltips learned to translate

**v0.6.71.** The corner carried one GitHub mark, this fork's. The project it
continues was credited on the help page and unreachable from the game itself,
so there are two marks now, the original's dimmed to 50% until it is pointed
at - two identical logos side by side say nothing about which repository each
one opens.

The tooltip was meant to carry the rest, and could not: those `title`
attributes sat outside the translation system entirely and stayed English
whatever the game was set to. `translateUI` already reaches an input's prompt
through `data-translation-placeholder`, for exactly this reason; a tooltip is
the same situation, so `data-translation-title` joins it. All three corner
icons have one now, and all three translate.

Measured in the running game rather than argued from the CSS: three icons at
right offsets 98 / 56 / 14, about 39px wide, no overlap; switching to Turkish
repaints all three titles with the diacritics intact.

**The check.** A locale missing an id falls back to English and is safe. An id
in *no* locale falls back to nothing, and `getText` writes the literal string
`text not found, id: ui link repo` into the interface. Nothing looked for
that: `locales.mjs` compares the locales against each other, so a typo made in
the HTML is invisible to it - both locales agree, and the id neither of them
has is the one on screen. `check_ui_ids_exist` reads all three attributes
across every page. Negative-tested by misspelling the new id; 124 ui text ids
across 5 pages, all present.

### The pair rule asked about files the repository does not ship

`check_docs_are_paired` walks the tree for markdown and its own comment called
the result "every tracked-looking .md file". It never asked git. So a draft
sitting in the working tree unadded - a plan for a later session, a file half
written - failed D-3 for want of a Turkish counterpart it had no business
having yet.

It asks now. `git ls-files` reads the index, so a new document comes under the
rule the moment it is staged rather than the moment it is committed, which is
the right boundary: staging is what makes it ours. Without git - a tarball,
say - the walk stands as before. Negative-tested from both sides: an unstaged
draft is ignored, and the same file staged fails immediately.

### Four broken imports in upstream's tree, and the check that found them

Offered as [PR #244](https://github.com/miktaew/yet-another-idle-rpg-dev/pull/244).

`src/mods/glassmaking.js` there imports from `../locations.js` and
`../traders.js`; neither file exists any more. `locations` moved to
`src/data/`, `LocationActivity` to `src/models/location.js`, `TradeItem` to
`src/models/trade_item.js`, and `inventory_templates` became the *default*
export of `src/data/inventory_templates.js`. All four fail to resolve, and the
mod has not been loadable for some time. `src/data/npcs.js` separately asks
for `../models/NPC.js` while the file is `npc.js` - fine on Windows and macOS,
nothing at all on Linux.

Our `check_imports_resolve` found the first set. It did not find the second,
and that is worth recording: `fs.existsSync` answers case-insensitively here,
so the check agreed with the bug on the machine that wrote it. The standalone
copy sent upstream walks the directory listing instead and gives the same
answer everywhere, and reads every *form* of import rather than only `{ named }`
lists - the case bug was a plain default import with no braces, so a
brace-only matcher walks straight past it. Both gaps were ours as much as
theirs. 492 imported names across 53 files of upstream's tree, no false
positives.
### The save stopped loading, and the check that should have seen it was blind

**v0.6.55.** Reported as "quests are completely broken, they come back empty", with a
`ReferenceError`, and separately as favourited places gone from fast travel. One cause
for both: moving save/load into `save_load.js` the version before left `effect_templates`
used and never imported. esbuild treats an unresolved identifier as a legitimate
reference to a runtime global, so the bundle built, every check passed, and it threw
only when a player loaded a save - taking everything in `load()` after that line with
it, favourites included.

`check_modules_import_what_they_call` existed precisely for this and did not fire,
because it only looked at names in *call* position and `effect_templates[effect]` is a
subscript. Widening it went wrong twice before it went right, and both are worth
keeping:

- stripping quoted strings first, to skip `onclick` markup, desynchronises over six
  thousand lines on one unbalanced quote and silently stopped catching two real
  missing imports;
- the widened matcher's own lookbehind, `(?<![.\w$])`, rejects the very reference it
  was added to catch: `{...effect_templates[effect]}` puts a dot immediately before the
  name, and a spread is indistinguishable from property access without letting `...`
  through explicitly.

**A second fault, found by measuring the first and never reported.** The same split
rewrote `last_combat_location` to `game_state.last_combat_location` everywhere -
including inside the two quoted save keys. The save wrote a name the loader did not
read, the value came back `undefined`, and the next save dropped the key from the file
entirely. Nothing failed loudly. It surfaced only by diffing two of the owner's exports
days apart: `favourite_locations` 10 -> 0, `enemy_killcount` 25 -> 0, and the bed and
combat locations gone. `check_save_keys_round_trip` now requires every key the save
writes to be a key the load reads - 53 and 53.

Both were verified in a browser against the owner's real save rather than argued from
the source: seven quests render and both favourites return.

### Reputation becomes a currency the places spend

**v0.6.57, v0.6.58, v0.6.59.** Measured before writing anything: 610 Village, 350 Slums
and 320 Town reputation is earnable across the story; four dialogue lines gate on it;
**no action did**; and nothing at all read Slums back except a trader's profit margin.
So a player could build 350 standing in the slums and the only thing it ever did was
shave a few coins off a price.

Six settlement actions read it now, and all six are built out of what those places
already were rather than added beside them. In the slums, at 100 / 200 / 300: the shed
with the scales the factor opened in P-11, the row keeping its own nights since the
gang went, and standing surety for somebody at the town gate - the first thing in the
game that turns slums standing into town standing, and it opens nothing behind the
gate. In the town square, at 50 / 150 / 250: the pigeons on the fountain, the
newspaper crier and the two bakers who have been calling each other stale since the
location existed, all of which were in its background noises and none of which a
player could join.

Two conversations open on standing **alone** - no quest, no unlock. The square broker
prices a reputation the way he prices grain; the old woman of the slums says what the
row's roster costs rather than what it is worth. Neither resolves anything, per the
rule about mysteries this fork did not open.

### display.js, 7,057 lines to 5,273

**v0.6.62, v0.6.63, v0.6.65**, after **v0.6.54** took save/load out of `main.js`.
Four cuts, each chosen by measuring two numbers - how many names the moved code needs
from what stays, and how many the staying code needs back - because the second is what
creates a cycle.

| module | lines | names needed back out of display.js |
| --- | ---: | --- |
| `item_tooltips.js` | 706 | `format_money` |
| `crafting_display.js` | 624 | `action_div`, `update_displayed_normal_location` |
| `journal_panels.js` | 696 | `item_divs` |

The measuring paid for itself in the first cut: three of the names it appeared to need
turned out not to be needed at all. `rarity_colors` and `rarity_outlines` belong with
the tooltips that read them, `select_outline_class` is in `misc.js` rather than
`display.js`, and `round` is used by nothing else.

Four ways it went wrong, each caught by a different net:

- a destructured parameter list opens a brace, so counting from `function` ended a
  259-line function at its own signature;
- `Object.keys(x).forEach(...)` closes with `});`, and cutting to the matching brace
  leaves the `);` behind;
- moving a `const` above the loop that reads it puts it in its temporal dead zone -
  the bundle builds clean and the page comes up blank, which is what `check:bundle`
  is for, and it then caught two more names the move had left behind;
- a lazy `import\s*\{[\s\S]*?from "./display.js"` starts at the FIRST import in the
  file and swallows everything between, which rewrote a comment in `main.js` into a
  syntax error.

Two things learned that change how the next cut is done. **A re-export makes a split
cosmetic**: `display.js` was handing the moved names on to `main.js`, `save_load.js`,
`crafting.js` and `items.js`, which were still asking it for functions it no longer
had, so repointing the importers is part of the cut rather than a follow-up. And **the
browser-free loader needs a `document`, not a longer stub list**: it stubs `main.js`
and `display.js` for the import cycle, `journal_panels.js` is neither and takes two
element handles as it loads, and stubbing the global once means the next split does not
have to touch the loader at all.

### Five checks, each for something that had already shipped

- **`check_save_keys_round_trip`** - a renamed save key silently dropping player data.
- **`check_imports_resolve`** (**v0.6.61**) - `crafting.js` imported `update` from
  `main.js`, which does not export it, and never called it. esbuild tolerates that; the
  browser's own module loader refuses, which is what had been quietly breaking
  `npm run serve`. It is the mirror of `check_modules_import_what_they_call`: between
  them an import list must agree with reality in both directions. 677 names.
- **`check_visible_tasks_can_be_finished`** (**v0.6.60**) - closes the report of "I
  know what to do and not how", a task named in the journal with no line under it. The
  hint builder already handled a task whose advancers are undiscovered; it could not
  handle a task with none. Measured first, and the content was already clean.
- **`check_action_labels_fit_a_button`** - six actions had a narrative sentence in
  `starting_text`, which the model documents as "text on the button", and the button
  drew all 105 characters of it. Each already declared the short label, unused.
- **`check_no_raw_control_bytes`** - a NUL written as a byte rather than the `\0`
  escape. It made grep call `tests/checks/content.mjs` binary, and then both PROPOSALS
  files picked one up from the entry describing that, because a shell heredoc collapsed
  the escape back into the byte.

Every one was negative-tested by reintroducing the bug, which is now directive D-8.
Twice this session a widened matcher silently stopped catching what it used to, so a
guard that has never failed is not a guard.

### Documentation gets checked, and says where the project stands

**v0.6.64.** `docs/STATUS.md` is new: where the game stands, written so an agent handed
nothing but that file can work here, with every number measured rather than remembered
and the command that produces it given.

The pairing check only ever looked inside `docs/`, so the root `AGENTS.md` and
`README.md` - both of which have Turkish counterparts - had never been checked at all
and carried no `doc-version` to check with. Both pairs have one now, and every relative
link in every markdown file is followed: 9 pairs, 166 links, 18 files.

`STORY.md` also caught up. Section 7 still said every NPC was exhausted, which stopped
being true when the broker and the old woman got lines that answer to standing, and it
said nothing about reputation becoming a currency. The square broker joined the
address-register table on the evidence of his own shipped lines - *sen*, not *siz*.

### Plate armour, and the rung that was never there

**v0.6.66.** P-12 had this as a missing tier-4 material. Measured, it was wider: the
component generator builds **twenty-five** plate pieces across five materials and five
slots, and not one could be made, because no metal plate existed as an item at all -
steel included, while the shell plate a turtle drops worked fine. The line had no first
rung.

`Steel plate`, `White iron plate` and `Black iron plate` are materials now, forged from
three ingots each against chainmail's two. That ratio is not invented: the generator
already gives plate 1.5x the value and 1.6x the strength of the chainmail of the same
metal. Fifteen pieces reachable, with a row added to each of the five exterior recipes.
White and black steel stay out - P-12 says the ceiling moves with the story, they have
no display name in either locale, and there is no station above the mountain flue.

### The wet woods get an ending

**v0.6.70.** Writing the region shapes into `STORY.md` turned this up: the wet woods
**stopped rather than closed**. Nothing marked having finished with them, even though the
region already had the arc - its description moves through three states as the Drowned
grove is cleared, and the last one says the grey shapes are gone and the flax runs in
long uncut stands. The state existed and nothing said so.

The brief came from the shape and was kept to: small, and **no person**. Nobody lives in
the wet woods and the whole character of the place is that nobody is there, so the ending
is something noticed rather than somebody met - the player goes back and cuts what grew
in the space the grey shapes left. It pays in flax, because materials are what this
region pays in.

Three things it is the first use of:

- **`location_clears`**, a condition the engine has supported since the conditions
  rewrite and that no content had ever used. One full clear of the grove, which is
  exactly the state the description already reacts to.
- **The `titles: [...]` reward key**, and the condition-less title the registry left room
  for: nothing the game counts can see this one, because it is a moment rather than a
  number.
- **`rewards.locks.actions` on itself.** There is no `is_unique` on a GameAction - the
  field is `is_finished` - so an ending that should happen once locks itself through the
  same rewards path everything else uses. An ending that repeats is not one.

The test for it needed the loader to grow. Every `load_browser_free` call builds its own
temp copy of `src/`, so mutating `locations` from one call and asking `process_conditions`
from another proves nothing: the condition reads a registry the first call never touched,
and the gate test failed against working code. `module_path` takes an array now and
returns both from ONE graph; a single string still returns the module itself, so every
existing caller is unchanged. 136 checks to 143.

### Titles, the other half of the lore panel

**v0.6.69.** The lore panel records what the player was **told**; a title records what
they **did**. Adapted from Echoes-Beneath, and the one change that review argued for is
the whole design: **take the record, not the talent.** Theirs may carry a `talent()`
applied once when earned; skill milestones here already hand out stats at thresholds, and
two systems doing that at the same moment is how they start disagreeing about a number.

Twelve titles, and every one reads a counter the game already keeps - kills, a named
enemy's kill count, crafting successes, deaths, the strongest hit, skill levels,
reputations. Nothing here needed a new counter, which is the test of whether a title is
about play or about itself.

Conditions are **declarative rather than functions**, on purpose: a check can read
`{skill: {Forging: 20}}` and fail on a skill that does not exist, which a `() => ...`
would hide until a player got there. Granted once per in-game minute rather than from
each event that could earn one - twelve conditions are cheap to re-read, and a hook in
every place that raises a count is a list that goes out of date the first time somebody
adds a thirteenth way to earn one. A title stays earned once earned: reputation can be
spent, and a record of what the player did should not quietly stop being true.

Unearned titles are not listed at all, not even greyed out. Showing them would turn a
record into a list of chores.

Three checks were widened by building it, each because it let something through:

- **The onclick check only verified the first hop.** `onclick="showTitles()"` names a
  handler declared in the markup, and that handler then called `update_displayed_titles`,
  which was not on `window`. The tab drew nothing and only a click said so. It follows
  the second hop now; counting the locals those handlers declare for themselves takes it
  from seventeen false alarms to none.
- **The journal-panel check knew about height and display but not scrolling.** A panel
  the right height whose list is not is exactly the fault reported twice, for Discoveries
  and then for Lore, and the titles panel shipped it a third time in the same session.
  Either the box or the list may scroll - the bestiary scrolls the box, Lore scrolls the
  list because its header has to stay put - so the check accepts both rather than
  inventing a rule the design does not follow.
- **The locale checks could not see a template-built id.** `title ${id} name` needed
  registering as an enumerable family, the same as location types and rarities.

### The four regions get a shape

P-13/54 asks for the built regions to be tied into the story rather than left standing
next to it. Concretely, from the Echoes-Beneath review: each one gets an **Opening,
Scenes, Expectations and an Ending** in `STORY.md`, which is the shape their REGIONS.md
keeps and which nothing here had.

Written from what the regions actually contain, measured rather than remembered: the wet
woods are four places with no NPC in them, the plains seven with five of the game's
fourteen NPCs, the bay three and the thinnest by count, the mountain eight and the most.

Two of the four turn out to have no ending, and saying so is the point of the exercise:

- **The wet woods stop rather than close.** No line marks having finished with them.
  Whatever ends them should be small and should not introduce a person, because the
  region's whole character is that nobody is there.
- **The bay is unresolved on purpose** and is the strongest thread the fork has: the
  Marrowmoth, one unweighed crate, a stroke drawn twice through her account column, and
  a tallyman who will not send word.

Section 1 was also contradicting section 7. It still said the four regions "do not exist
yet" while section 7 said all four were built. It now says which are built and which are
still only named - the great river basin and the ancient forest past Forest lake.

### Echoes-Beneath, read for story and gameplay this time

The first review answered the tooling question and missed the one that was asked. This
one looks at the mechanics and the narrative devices, with the title system named as the
example.

**Titles - worth taking, with one change.** `js/data/titles.js` is 883 lines and 30
titles. A title carries a name, a description, a rarity and a `have` flag; it is purely
cosmetic unless it defines a `talent()`, which is applied once when the title is first
earned. They are granted from thresholds already scattered through the game - a skill
reaching level 10, a kill count, a money total, an equipment event.

It fits this game unusually well, because the complementary half already exists: the
lore panel records **what you were told**, and a title records **what you did**. The
machinery is there too - `process_rewards` already takes 23 reward keys, so `titles:
[...]` slots in beside them, the journal already has a tab shape for a list like this,
and `enemy_killcount`, the skill levels, the reputations and the run counters are the
thresholds.

The change: **take the record, not the talent.** Skill milestones already hand out stat
bonuses at thresholds, and a title with a `talent()` would be a second system doing the
same job at the same moment, which is how two systems start disagreeing about a number.
A title here should be a record and nothing else.

**Effectors - already here under another name.** `js/systems/effectors.js` is 56 lines:
an environmental modifier attached to an area, toggling world state such as darkness.
`location_types` with staged applied effects is the same device, and the cold stages are
it working. Nothing to take.

**Abilities - a different game.** Named per-creature attacks with their own narration
phrases, resolved by a damage calculator. Combat here is stats and stances with no named
attacks, so adopting this is a combat rewrite rather than an addition, and the register
it buys is not this game's.

**Planner - no gain.** Deferred work on a later tick. `game_action_period` and the
existing intervals already do it.

**The most useful thing is not code.** `docs/REGIONS.md` gives every region a fixed
shape - Opening, Scenes, Expectations, Ending - and `STORY.md` here has nothing like it:
it describes the world and where the story stops, but each built region is a list of
places rather than a shape with a beginning and an end. That is exactly the gap P-13/54
names, so the shape goes there rather than into a proposal of its own.

`STORYPROGRESS.TR.MD` turned out to be a prompt rather than a device - the same role
brief this project works under. Nothing to adopt.

### Splitting the big files, and where it stops

Six cuts took display.js from **7,057 lines to 3,815**, and it is no longer the largest
file in the project - `data/skills.js`, `items.js`, `data/locations.js` and `main.js`
are all bigger, and three of those are content, which is meant to be.

| module | lines | version | names it needs back |
| --- | ---: | --- | --- |
| `save_load.js` | 1,951 | v0.6.54 | (out of main.js) |
| `item_tooltips.js` | 706 | v0.6.62 | `format_money` |
| `crafting_display.js` | 624 | v0.6.63 | `action_div`, `update_displayed_normal_location` |
| `journal_panels.js` | 696 | v0.6.65 | `item_divs` |
| `skills_display.js` | 660 | v0.6.67 | nothing |
| `inventory_display.js` | 963 | v0.6.68 | four, all runtime |

**Why it stops here.** Every remaining cut is a worse trade, and the measurements say
so rather than instinct:

- The **quest journal** is 893 lines and needs **91** names from display.js. It is the
  panel every other panel talks to.
- The **options** in main.js are 289 lines and need `game_options`, `language`,
  `current_location`, `current_stance` and `global_flags` - core state that half the
  project reads. Moving it is a different job; leaving it means ten back-edges into
  main.js, which is the entry point and the one place a cycle broke a release before.
- **Combat** and **animations** in display.js need 22 and 13 names out for 166 and 169
  lines, which is a cycle per ten lines saved.

The rule the six cuts produced, worth more than the line count: **a cut is judged by
how many names the moved code needs back, not by how many lines it takes away.** Five
of the six needed four or fewer, one needed none, and the two that looked expensive
turned out cheap once the state that only they read moved with them.

### The inventories and the trade window

**v0.6.68.** `inventory_display.js`, 963 lines, and display.js 4,699 -> 3,819 - a
third of what it was at v0.6.60, and 7,057 -> 3,819 across the six cuts.

The character's inventory, the trader's, the storage chest and the trade window cut as
one piece because they share their sorting, their item rows and twelve pieces of state.
Four names come back out of display.js - two DOM handles taken once at module scope,
the money formatter and the quest-counter redraw - all used inside functions and never
while the module is being evaluated.

`sort_displayed_quests` was left behind on purpose. It sorts with the inventory's
comparators but reads `quest_list`, which is the journal's state, so taking it would
have dragged the quest panel's state into the inventory module for one function.

One check had to change with the move: `check_equipment_slot_names` read
`equipment_slots_divs` out of `src/display.js` by name and broke when the map left.
It searches for it now, because a check that hard-codes the file it reads breaks on
correct work every time that file is cut.

`check_imports_resolve`, added six versions ago, earned itself here: it caught
`crafting.js` still asking display.js for `update_displayed_character_inventory` after
the repoint missed it.

### The skill bars and the stance list, and two more shapes the check could not see

**v0.6.67.** `skills_display.js`, 660 lines, and display.js 5,273 -> 4,699. The
cleanest of the five cuts: all seven names it appeared to need from display.js are
module state that belongs with this code - the bar divs, the two lists, the sort order
and direction - so once they moved with it the new module needed **nothing** back. A
one-way import and no cycle to reason about.

It then found two more shapes `check_modules_import_what_they_call` could not see, both
the same failure as `effect_templates` one step along - built clean, evaluated clean,
threw when a save loaded:

- **`${name}`.** `[data-stance='${selected_stance}']` is a plain value inside a template
  literal: not a call, not a subscript, not a construction. Low noise to add, because
  what sits inside `${}` is always evaluated.
- **`name.property`.** `character.bonus_skill_levels` - which is how an imported object
  is normally used, and the widest gap of the five. Measured before adding: across all
  51 modules it produces exactly one hit, the real one, once module paths are excluded.
  `"./character.js"` otherwise reads as `character` followed by `.j`.

Adding `${name}` also made the check cry wolf about `translation.js`, which writes
`load = async(language) => {` and interpolates `${language}` inside it - a parameter,
not a missing import. Arrow parameters count as declared now, which they did not before.

### The contribution came back, and there was nothing to take

Upstream moved for the first time since July, on the same day: three commits, and all
three trace to our own pull request. Two are our commits by name - the dev console and
the gear comparison - and the third is theirs, "added and tweaked commits from PR".
PR #242 was closed with *"cherry picked some of the commits included (all but
milestone's expansion), with a few tweaks on the way"*.

So the strategy in P-13/34 - take what can be taken from upstream, then offer ours back -
has an answer for this round: **there is nothing to take**. Their delta against our tree
is our own code in their house style: `equipment_comparison` renamed to
`create_equipment_comparison`, an array join turned back into string concatenation,
multipliers shown as `x1.05` rather than `+5%`, and the explanatory comments removed.
Merging it would conflict in four files and would overwrite our own work, which is the
one thing that strategy excludes.

The single substantive addition is a `enable_dev_mode: false` flag in `config.js`, which
is a different design from ours on purpose. Ours is `enable_dev_console()` typed at the
console, off by default and never saved, and deliberately not gated on a release flag -
the dev release is still a release somebody plays. Taking a config switch instead would
weaken that, so it stays.

What this closes is the *taking* half. The giving half is a standing posture and lives in
P-13/58.

### The browser-free loader reaches the content modules

`tests/lib/browser-free-src.mjs` loads a module from `src/` for real by replacing
`main.js` and `display.js` with generated stubs. Three modules died on it -
`enemies.js`, `traders.js` and `data/locations.js` - with "Cannot access 'is_rat'
before initialization": a temporal dead zone fault from evaluating a deliberate import
cycle with the wrong entry point. Importing `items.js` first did not help, because each
call builds its own temp graph.

The fix is that the loader now generates an entry module which imports every module
**in main.js's own order**, read from the real `main.js`, and pulls the target through
it. In a browser `main.js` is the entry point and that order is what settles which of
`character.js` and `items.js` is entered first; replaying it reproduces the same
resolution in Node. The target is deliberately not filtered out of the order - removing
it changes the order, and with `items.js` taken out `market_saturation.js` was entered
first and read `group_key_prefix` out of a half-evaluated module.

The cost of the gap was concrete: the Discoveries index read `trader.inventory_template`
as a list when it is the NAME of one, and no test could have caught it because no test
could construct a trader. That test exists now - "trade sources are found through the
stock list a trader names" - built from the real objects rather than from the source
text, so a field that is not the shape the index assumes fails in the suite rather than
in front of a player.

### The lore panel

**v0.6.52.** Asked for as "a place holding the story's history and the conversations
already had". Nothing in the game recorded that: a textline was read once and gone, so
a player returning after a week had no way back to what they had been told.

It went into the journal as a fifth tab rather than a new panel, beside quests, the
bestiary, the anthology and data - the journal is already where the game keeps what it
remembers for you. `Textline` gained a `lore` flag in its constructor and `is_heard` in
its body, which is why `check_content_object_keys` is unaffected: the flag is data the
content declares, the heard-state is runtime. Twenty-six lines are marked, grouped by
speaker and ordered as they were heard.

The panel then ran off the bottom of the journal, which is **v0.6.53**: its filters wrap
onto a second row and the list underneath had a fixed height that knew nothing about
that. It takes whatever the controls leave now, at any number of rows, and Discoveries
had the same fault and is fixed with it.

### Two more, before they left the backlog

**The shop's Cancel.** Reported as "Cancel should take you back". The behaviour was
already right - the trade window has Accept, Cancel and Exit; Cancel clears the basket
and stays, Exit leaves - so the fault was the labels, which did not distinguish the two
actions well enough in Turkish, and the layout, which was hiding one of the three.
Fixed as wording rather than as behaviour, which is the honest reading of the report.

**Everything transferable, not a subset.** `contribute/upstream-fixes` carries 14
commits, each written against upstream's own code and style, each a fault measured
rather than suspected, and each droppable on its own: twelve fixes in `src/`, one build
fix - `build.js` exited 0 when it could not stamp the version, so a bundle no browser
will fetch reported as a successful build, and `dist/` is committed there - and one
optional bundle-load check. The set was closed rather than guessed at by pointing our
own check suite at their tree, which is what those checks are for: each encodes a bug
class found here. At source level they find nothing further in their code.

### Housekeeping

- **v0.6.56** - `add_best_effect(duration)` in the dev console, the counterpart to
  `give_best`. Which effects count as good is read off `tags.buff` rather than listed
  in `main.js`, because the data carries the answer better than the numbers do: Tipsy
  raises agility, lowers dexterity, and is tagged debuff.
  `check_effect_tags_match_their_numbers` cross-checks the tag the command trusts.
- **Line endings pinned.** `* text=auto` left the working-tree ending to each
  contributor's `core.autocrlf`, giving a tree checked out 64 files CRLF and 10 LF
  against an all-LF index. `.js/.mjs/.json/.css/.html/.md/.yml` are `eol=lf` now.
- **Upstream.** `add_best_effect` went to PR #242, beside the dev console it belongs
  with. PR #243 is new: their action buttons draw `starting_text` while their unlock
  message reads `action_name`, so the log announces an action under a name the button
  never shows - three ant-nest actions share one label. The checks stayed behind;
  upstream has no `tests/` and no `package.json` to hang one on.

---

## 2026-08-26

### The interface fits the window, and two skill families are finished

**P-13 item 4: the layout.** Every panel is `position: absolute` at a hard-coded
offset - four 400px columns at left 0, 410 and 820, and the message log at 1230 with
415px of its own - so the interface is a fixed ~1660x850 whatever the window is. A
narrower viewport cut the log's right edge off and added a horizontal scrollbar.

Three ways to fix that, and the choice is the interesting part:

- rewriting to flex or grid is the correct answer and a large, risky change to a
  3000-line stylesheet where every offset is load-bearing;
- a media query dropping the log below the rest keeps the text size and makes the
  page taller than the window instead of wider, which trades one scrollbar for
  another;
- scaling the whole fixed layout preserves every pixel relationship exactly, is about
  twenty lines, and is reversible.

So: scale. `--ui_scale` is `min(1, available_width / 1660, available_height / 850)`,
recomputed on resize, applied as a `transform` on `#main_content` with the origin at
its top left. Capped at 1, so a window that was already big enough is completely
unaffected. The bottom panel is a sibling and stays full size on purpose - the save
and export buttons should not shrink with the rest.

The one thing scaling breaks is a tooltip positioned from `event.pageX/pageY`, because
those are page coordinates while the element's containing block is now scaled. There
are exactly two in the whole project and the one inside `#main_content` divides by the
scale now.

**P-13 item 2: the milestones.** "Perks" turned out to mean skill milestones, and the
gaps were not scattered - they were whole families where one sibling had been finished
and the rest had not:

| family | finished | empty |
| --- | --- | --- |
| Gathering | Fishing, with ten milestones | Woodcutting, Mining, Digging, Herbalism, Animal handling, Gathering mastery |
| Crafting | Crafting mastery with six, Forging with one | Crafting, Smelting, Cooking, Alchemy, Butchering, Woodworking, Medicine |

So this is finishing two families rather than inventing a system, which is why every
number is copied from the sibling that was finished: flat 1 low down, flat 2 in the
middle, a 1.05 multiplier at the round levels, and an occasional 1.1 xp multiplier
toward one related skill. Nothing added here is stronger than Fishing already was.

Each skill rewards the attribute its work uses, so choosing what to train stays a
choice: an axe pays in strength, a pick in strength and dexterity, a shovel in
strength and stamina, a herb in intuition and dexterity, an animal in intuition, a
pot in intuition. The two mastery skills get the same dexterity ladder Crafting
mastery already had, because they are the same kind of skill.

Forging's existing level-10 recipe unlock is untouched; its five stat milestones join
that object rather than replacing it.

**Fifteen skills are still without, deliberately.** The seven stance skills scale a
stance's own effect, which is not what a milestone is for. Wands and Staffs have no
weapon in the game to use them with. Weapon mastery and Combat are parents whose
children carry the milestones. And the three resistances were left because Heat
resistance's stat is marked *"currently useless"* in `character.js` and Cold
resistance wants a temperature scale decided rather than guessed at - 49 of 64 skills
with well-scaled milestones is better than 52 with three invented ones.

### The reported gaps, a dev console, and the changelog stops being hand-wrapped

Fourteen requests in one sitting, recorded in P-13 as they arrived. The translation
reports are grouped by cause rather than by screenshot, because only one of them is
"somebody forgot a row".

**Values printed instead of names.** The component list under a crafted item used
`item_templates[...].name`, the raw registry name, so a sword read
`[Cheap iron long blade] + [Simple wooden short handle]`. The inventory's slot tag
printed `equip_slot`, so an equipped item read `[weapon]` or `[torso]`. A book printed
`target_item.name`, and all ten books already had a translated title that nothing was
reading. Each is one site and each had its rows waiting.

**English returned rather than written.** `format_money(0)` returned the literal
`'nothing'`, and the two time formatters built `"2 hours"` and `"25 minutes"` out of
English words. The DOM check added earlier this session could not see any of them: it
looks at statements that write to the DOM, and these are return values that a caller
prints later. Worth naming as a limitation of that check rather than a gap in it.

Moving those formatters to read the locale turned up a real design problem. `misc.js`
is a leaf utility module, and importing `translation.js` there pulls in `main.js`,
which pulls in `display.js` - so a module that only did arithmetic ended up needing a
`document`, and the harness that loads `misc.js` on its own broke immediately. They
live in `display.js` now, next to `format_money`, which was their only caller anyway.

**Never translated at all.** The eight category filters over the trader and storage
panels had no `data-translation` attribute. The flavour line under four skills was a
plain English string in `skills.js` - and those four are references, to Warhammer
40,000, to counting sheep with this game's animal, to Gurren Lagann and to the
breathing joke, so the Turkish carries the register rather than the words.

**A phrasing that does not survive translation.** `Bitir: {v1}` reads as a label and a
value. Turkish would want an accusative suffix that varies with the activity name -
koşu becomes koşuyu, iş becomes işi - which cannot be built generically, so the name
goes first and the verb follows.

**The changelog is a list now.** Its entries were hand-wrapped for a wide window and
`white-space: pre-wrap` then wrapped them again at the container width, so every
bullet broke twice and came out ragged. A `<pre>` cannot fix that: a wrapped line
restarts at column zero because it has no idea where the bullet began. So the 885
entries in each file became `<li>` elements, one line each in the source, with the
hanging indent drawn by `::before`.

And they are sentences: 857 capitalised and 863 given a full stop in English, 800 and
866 in Turkish. Turkish capitalisation is not ASCII - `i` maps to `İ`, not `I` - so
those two are mapped explicitly rather than through `upper()`. Thirty-three entries
end inside a `<b>` or `<span>`, and their full stop went inside the tag.

**The message log survives a reload.** What is stored is the arguments `log_message`
received rather than the finished divs, so a restored log is built by exactly the same
code as a live one - the classification, the per-group caps and the pruning cannot
drift from the live path. Capped at 300, because a save is a text file a player
exports by hand. Lines still keep the language they were logged in; that is
`log_message` taking composed text rather than an id and its params, which is
unchanged and already recorded.

**A development console, off unless asked for.** `enable_dev_console()` typed in the
browser attaches helpers as bare globals: `add_active_effect("Coffee", 1800)`, which
is what was asked for, plus `give()` - a rewards object through `process_rewards`, the
same path a quest takes, so nothing granted this way behaves differently from content
granting it - `goto()`, `add_money`, `add_xp`, `add_skill_xp`, `set_flag` and the
`list_*` functions.

It also reveals the speed buttons in the bottom panel: 1x, 2x, 5x, 10x. `tickrate` is
the divisor of every wall-clock delay in `main.js` **and** of every per-tick
accounting term (`total_playtime += 1/tickrate`, `save_period * tickrate`), which
makes multiplying it the only change that speeds everything up consistently and leaves
the bookkeeping correct: more ticks per second, each worth what it was. `const` became
`let` and no timing code changed.

Neither the console nor the speed is on by default and neither is saved. A reload is
back to 1x. `is_on_dev()` is not the gate either - the dev release is still a release
somebody plays, and a speed multiplier makes every activity, book and journey trivial.

**And upstream has not moved.** Asked to take the fork's update, so `upstream` was
added and fetched. It has two branches: `master` at `e335643` (v0.5.5.30, 23 June),
which is our own fork point, and `ghpages` at `fc04780` (26 June), whose tree is
byte-identical to master's - the later commits are merges that changed no file.
`upstream/master..master` is 67 commits and `master..upstream/master` is zero. There
was nothing to bring in, and saying so is the only honest outcome.

### Tier 4: white iron and black iron

`crafting_component_filling.js` has been generating **72 components** for white iron,
black iron, white steel and black steel since before this fork - the whole top two
tiers of weapons, armour and shields, with tiers and stats - and no player could
reach one of them. The generator's own header says why:

> `DOES NOT AUTO-FILL CRAFTING RECIPES, DO IT MANUALLY AND MAKE SURE NAMES MATCH`

Nobody did. The chain was broken in three separate places: nothing produced the ore,
no smelting recipe turned ore into ingot, and none of the thirteen forging component
recipes listed the materials.

**Everything else was already there**, which is what made this worth doing rather
than inventing: the ores, the ingots and the chainmail all exist as items, with
`name` and `desc item` rows in **both** languages, and `material white iron` /
`material name white iron` and their black counterparts were written too. Somebody
built the whole tier and stopped one file short.

**Tier 4 only.** White steel and black steel wait, for two reasons: a game should not
gain two tiers in one afternoon, and the tier-5 materials are the only ones whose
display-name rows are still missing - `material white` and `material black` have no
row in either locale, which is a fair marker of how far the original work got.

**They are not two colours of one metal.** The generator gives white iron weight 130
and strength 100, black iron weight 80 and strength 110 - heavy and durable against
light and sharp. Weight lowers attack speed and raises weapon damage and shield
block, so these are genuinely different weapons, and the choice was designed long
before anybody could make it.

**The ore comes from the bay, and that is the cook's line coming true.** *"Ahh~! Far
to the north! Many spice and meat and metal and leather come from there! From very
far away!"* Nothing in this country mines white or black iron and nothing else sells
it, so the salt house is the entire supply - small counts at a 35% chance, because
the shed has what the last hull brought. The tier needed no new room, which is the
right outcome for a region built two commits ago.

**And it lands on the forge.** `roll_quality` takes `station_tier - component_tier`,
so a tier-4 component at a tier-1 fire rolls three bands short. The mountain flue is
what makes this tier worth working, which means the two pieces built this week feed
each other: the flue raised the ceiling, and the metal is what the ceiling was
holding back.

**A check, for the failure the generator's header warns about.** `npm run check` now
requires every `material_id` and `result_id` in `crafting_recipes.js` to name an item
that either items.js declares or the generator builds - 549 names against 450
templates. A typo on either side of that boundary is otherwise silent: the recipe
lists, the player has the materials, and the result is `undefined`.

Recipes only. `shield_name` and `armor_name` on a component are display strings
rather than template references - the comment above `Shield.getDisplayName` says so -
and treating them as references produces forty false positives, which is the mistake
recorded in the entry above this one.

### The item reachability audit, and one wrong turn recorded

An item arrives through a loot list, a trader, a recipe, a gathering activity or an
explicit reward. Auditing the 272 hand-declared non-component items against all of
those found 21 that nothing anywhere asks for.

**The first attempt at that audit was wrong and is worth recording.** It enumerated
the *shapes* an item can arrive through - `item_name:`, `result_id:`, `material_id:`,
`resources:` - and missed `{ name: "Carp", chance: [...] }` in a fishing activity,
because that shape has a space after the brace and no `ammount` key. It duly reported
a fish anybody can catch. The second version counts references instead: every
occurrence of the item's quoted name across `src/`, minus the two that belong to its
own declaration. That direction cannot be fooled by an arrival shape nobody thought
of.

**The cat café.** Asked what the place serves, the proprietress has always answered:

> *"Coffee, cider, cake, and whatever the kitchen managed not to drop today."*

`Black coffee`, `Cider`, `Apple pie` and `Carrot cake` all existed - descriptions in
both languages, working effects, 100 value each - and the `Cat cafe` inventory
template held bread, kwas, clam, bisque, frog legs and fish steak. Three of the four
things she names were not on the shelf. They are now. Cake is two items because the
game has two.

**The vegetables.** `Carrot`, `Potato` and both cooked forms were complete and
unobtainable. The village shop sells the raw two, and two cooking recipes at level 1-4
turn them into the cooked ones - below roasted rat meat, because boiling a potato is
the easiest thing anybody in this game does. The raw potato gives *Slight food
poisoning* and its own description ends *"Just remember to cook it first!"*, so
selling it raw is the joke working.

**And a display bug the vegetables would have shipped.**
`item_templates["Cooked potato"]` carried `name: "Potato"`. `getDisplayName` resolves
`name ${this.getName()}`, so a cooked potato looked up the *raw* potato's row and
displayed as "Potato" - while `"name Cooked potato": "Pişmiş patates"` sat in both
locales, written by somebody who meant it to be its own item and never read once.
Safe to fix: `setup_ids` assigns `item_templates[id].id = id` from the key and
`createInventoryKey` uses `this.id`, so the name field is display only.

That class is checked now: **an item's name must not be another item's key.** A name
that merely differs is normal and deliberate - `Goat meat` shows as "Mountain goat
meat", `Cooked clam` as "Boiled clam" - and there are five of those. A name that *is*
another key means two items resolve to one row and the second one's translation can
never be reached.

**The wrong turn.** Along the way this looked like a broken crafting chain: the
`Shield base` recipe produces `Hickory shield base`, `items.js` declares
`Hickory wood shield base` whose `shield_name` is `Hickory wood shield`, and the
assembled template is called `Hickory shield` - three names, none matching. It is not
broken. `crafting_component_filling.js` generates a `Hickory shield base` whose
`shield_name` is `Hickory shield`, which is exactly the assembled template, and
`shield_name` is a display string rather than a template reference - the comment above
`getDisplayName` says so. The hand-declared component is a duplicate the generator
supersedes.

Reading the consumption site is what settled it, and it is the reason no check came
out of that: a name-link check across the crafting chain would be 42 findings and 42
false positives.

**What is left, deliberately.** Ten items form a coherent tier above steel - white and
black iron ore, ingots and chainmail - and `crafting_component_filling.js` already
generates `White iron shield base` and `Black iron shield base` from them. The tier is
scaffolding waiting for an ore to mine, not a defect. Plus two leftovers,
`Scraps of wolf rat meat` and `Basic spare parts`.

### Three audits, and the bug the third one found

With every proposal closed, the useful work was to audit the classes of defect
nothing checked yet. Three were worth doing and one of them found a bug that had
been in front of players since character creation existed.

**English left in a translation: clean.** A scan of all 2985 Turkish rows for English
function words found nothing. Getting that answer took two corrections, both worth
recording because they are how this kind of scan goes wrong:

- **Whole words only.** A run-of-lowercase match finds `are` inside `Fare`, which is
  Turkish for mouse, and duly reported every line the mill mice speak.
- **No homographs.** `her` is Turkish for every, `has` appears in *kendine has*,
  `not` is a note, `his` is a feeling. With those in the word list the output was 94
  rows of noise; without them it was three, and all three were *his*.

The check is in the build now with the homograph list written out, so the next person
can see the omissions are deliberate.

**Rows nothing asks for: one.** `check_content_text_ids` already does the forward
direction - every id the source names exists, so nothing renders "text not found".
Nobody had done the reverse. It needed a model of the computed id families -
`name ${key}`, `desc item ${item}`, `material ${material}`, `ui slot ${slot}` and
thirty more - because a literal-only scan reports thousands of live rows. With those
subtracted: `log received a new quest v1`, referenced from one commented-out line in
`main.js` while `log started a new quest` does the job. Deleted, and so was the
commented call that would have broken if anybody uncommented it.

Four more went with it: `hit_chance` and `evasion`, bare and ` long`. Those were
aliases in `stat_names`, the English table that came out of `misc.js` last commit,
and no `stats: {}` object anywhere grants either of them.

**And the one that mattered.** The audit also flagged `middle-aged`, which looked
like another dead row. It was not. The hero creation panel's third age button carries
`data-age="middle aged"` - with a space - and `confirm_hero_creation` puts that string
straight into `character.personal.age`, which `fill_character_bio` then looks up as a
text id. The row was written with a hyphen.

So every player who chose the third age option had been reading this on their own
character sheet, in both languages, from the moment they made the character:

> `Age: text not found, id: middle aged`

Confirmed in a browser before and after. The hyphen is what moved, not the attribute:
that value goes into the save, and the rule for save data is the same rule the
registry keys follow.

**That is now checked forward as well.** The panel's buttons carry two strings and
only one of them was ever verified - `data-translation` is the button's own label and
`translateUI` resolves it, while `data-age` and `data-height` are values that become
text ids later. Six values checked. Race is deliberately not among them: its buttons
are built from `playable_races`, so the value cannot drift from the registry the way a
hand-written attribute can.

All three negative-tested by planting the defect.

### The gaze action's two unreachable endings

*"Follow where the river leads"* at the Forest lake is the author's tease for the
forest's heart, and it is built to never succeed: `success_chances: [0,0]`, so the
only branch a player can reach is the `random_loss` text that ends *"You try to make
out the details of what looks like a bird flying in the distance. It has four
legs... [tbc]"*.

**That stays untouched.** STORY.md lists the four-legged bird under what is open on
purpose and PROPOSALS says it belongs to no region and should not be folded into one.
Making the action succeed would be answering a question the documents say to leave
standing, so it was not done.

What went are the two branches nobody could reach:

- **`success_text` pointed at a row whose entire content was `"[TBD]"`**, in both
  locales. Unreachable, which is why nobody saw it - but "unreachable" is a property
  of today's `success_chances`, not a promise. That row was one edit away from being
  the text a player read.
- **`conditional_loss` cannot fire at all.** `process_conditions` returns 1 for an
  empty condition list - its own comment says *"no conditions mean nothing to fail"* -
  and gaze has no conditions. Its text was also pasted from the Forest lake deep dive
  and talked about lung capacity, which has nothing to do with looking downriver.

And one repeated word in the line that *is* reachable: *"You try to make make out"*.
Fixed as a typo, not as an edit to the author's voice.

**Two checks, because both of these read as finished work.** That is what makes this
class expensive: nothing crashes, nothing is missing, and the file looks written.

- `npm run check` now refuses a locale row that is placeholder text - `[TBD]`,
  `lorem ipsum`, `TODO`, `FIXME`. The Nekomimi cafe's nine `lorem ipsum` strings were
  the same class of thing and were found by reading the file; this is that read, every
  build. The one intentional `[tbc]` is exempted by id, with the reason.
- And it refuses an action that declares a branch it cannot take: a
  `conditional_loss` text with no conditions, or a success text with
  `success_chances` of zero. Fifty-three actions checked; gaze was the only one.

Both negative-tested by planting the defect.

`quests.js` also carried `//tbc, duh` on Village expansion task 7, which stopped
being true one commit ago.

### The slums get a buyer, and P-11 is finished

`Light in the darkness` asks whether the slums can be improved *"at least a bit"* and
its only task was *"Deal with the gang"*. Removing thugs is the removal of a harm,
not an improvement, and the game already knew the difference: the room's description
changes once the gang is gone to say *"with some safety returned to the area, more
folk are now out on the streets"*. Safety returned. Nothing else did.

Quest 3 had already sharpened that rather than resolving it - the man who ran that
gang is a broker under a green awning on the town square now, legitimate and doing
well, while the district he ran is unchanged. That contrast had to survive this task
and it does: nothing here touches him.

**The old woman's own line was the whole brief.** *"I'm talking about the plants that
grow all around. Most people pass them by, without realizing how useful they can
be."* Asked whether she could sell them, she laughs - a real laugh - and gives the
reason nobody would guess. It is not the price and it is not ignorance; half the
women on the row know the same three plants she does. It is provenance:

> *"A man with a stall does not want a basket that came out of the slums, and he does
> not want to explain to anybody why he took it."*

**Which makes the factor the only possible buyer in the game.** Not because he is
kind - because he does not sell anything. He writes down what arrives and what it was
worth, and the guild has never asked him which door a sack came out of. He agrees
inside one sentence, and then does the thing he does: names the price as insulting,
worse than the linen, and explains that a man who knows there is no other buyer and
quotes a fair price anyway does not last at that table. *"I would rather you heard the
whole of it from me than worked it out later and thought I had been generous."*

**And the scale is the quest's own.** *"At least a bit"* is what it promised. What
arrives is a standing order, a herbalism patch on waste ground poorer than the
outskirts one, and a third state for the room's description - a shed at the end of the
row with a set of scales in it, and a queue outside on the days the cart comes. Not a
rescue. The old woman reads the number, says *"that is a terrible price"*, folds the
paper along the crease he put in it, and starts worrying about whether Marta's girls
will leave the roots.

She is also not thanked twice: *"You have done a thing and I have said so once, and
once is how many times a thing needs saying."*

**With this, both tasks whose description was the literal string `[To be continued]`
are gone**, and P-11 is closed. Three getters and three flags now hang off
`global_flags`, all covered by the check that came in with region 4.

### The village hearth, and `Village expansion` is finishable

The last task of `Village expansion` has read **"[To be continued]"** since before
the swamp existed. Its author left the instruction on the line that was blocking it:

> `"further work"`: *doesn't lock itself for now; to be updated with lock, unlocks,
> and different text when more stuff is added on the other side of river*

**Region 4 is what "more stuff" turned out to be.** The old craftsman had just
explained why nothing the player forges holds - *"this village sits in a hollow,
lovely for sleeping, hopeless for burning"* - and said in the same breath that he
could not fix it: *"I am eighty-one and the wind is not in this valley."* The player
then went and built the thing he described, on a mountain, out of two hundred bricks.
So the fourth work is bringing that back down, and the elder's *"Not yet, but
hopefully soon"* stops being the last thing he can say.

**He does not get the mountain's answer, and he is not disappointed by that.** He has
known about the hollow since the craftsman told him, *"a long time ago, and he was
younger than you are when he did"*, and what the village has instead of wind is
hands: *"It has hands, though. It has always had hands."* So a boy stands on the
bellows every day of his life, the fire dips when he changes hands, and the village
station is **2 and never 3**. That is the craftsman's own explanation turned into a
number rather than a balance decision, and the elder says the right thing about it:
*"It does not have to be. It has to hold long enough to finish a bar."*

**The mechanism deliberately differs from the mountain's.** Up there the flue is a
**skill** check - nobody else is on that mountain, and it chokes itself until the
player knows what a throat wants. Down here it is a **supply** check: no conditions,
no failure roll, `success_chances: [1]`, and 120 bricks against the mountain's 200.
The hard part was solved up the hill; what is left is whether you can pay for it.
The mill boys form a line without being told to.

**And the craftsman gets what he actually asked for.** His line after the flue was
*"Bring me something you made up there one day. Not to check it. I would just like to
hold one."* He gets somewhere to stand instead, which he notices is more than he
asked for and is gracious about for exactly one sentence before going to tell the boy
he is blowing it wrong.

Two getters now, both over `global_flags`, and the check added with region 4 covers
both: a misspelled flag would make either forge silently never appear.

### Region 4: the mountain, and P-10 is finished

*"Northwest, where the walking rocks and falling water are!"*

PROPOSALS put this one last and was explicit about why: it exists. Mountain path,
Small flat area, Mountain camp, Gentle mountain slope and the Waterfall basin were
all already there, so the region needed a reason to be up there rather than more
ground.

**The reason was in STORY.md's own frontier note.** *"Their gear ceiling is a tier-3
steel head on a tier-5 alchemical-wood handle... crafted at a tier-2 station because
no tier-3 station exists."* It is worse than that sentence says. Every crafting
station in the game has **forging and smelting at 1** - the village has all seven
categories at 1, and the tribe raised five of them to 2 and left those two alone -
while components go up to tier 5. `roll_quality` takes `station_tier -
component_tier`, so a tier-5 component forged at a tier-1 station rolls at minus
four. Everything the player has ever forged was forged at a penalty.

**Three things already in the game put the fix on the mountain.** The camp is the
player's own - *"created by you to be a perfect base for further exploration"* - so
nobody has to give it to them. The camp's own ambient line is *"Strong wind whooshes
past you"*, and a smelter wants a draught, which makes the thing that makes the camp
unpleasant the thing that makes the fire work. And the bricks and the iron both come
out of the Nearby cave directly below it.

**The old craftsman says it, because his teaching already had this shape.** *"There's
a limit to how much you can learn by working with rat leather, isn't there?"* The
limit he never named is the one in his own hearth: the village sits in a hollow, a
fire in a hollow has to be blown by hand, a hand gets tired, and the bar cools while
it rests. He cannot build the thing he is describing - *"I am eighty-one and the wind
is not in this valley"* - and he does not make that sad about himself.

Reaching the camp is what gives him the line, rather than a quest marker: standing in
your own camp in that wind is the whole argument, so the room makes it.

**The mechanism is a getter.** `Mountain camp`'s `crafting.tiers` became
`get tiers()` reading `global_flags.is_mountain_forge_built`. Both readers -
`main.js` at the moment of a craft and `display.js` when it lays out the category
buttons - take `current_location.crafting.tiers[category]` live, so nothing has to
be saved beyond the flag, and `global_flags` is already saved and loaded. A falsy
tier hides the category button entirely, which is the wanted behaviour: before the
flue there is no forge at the camp rather than a bad one.

Three rather than two, deliberately. Two would match the tribe and leave tier-4 and
tier-5 components still rolling at a penalty; three is what actually moves the
ceiling the frontier note describes.

**The check this needed.** The whole region turns on one flag name, and a flag is a
string key on a plain object - `global_flags.is_mountain_forge_buit` is undefined,
which is falsy, which means the forge silently never appears and nothing says why.
`npm run check` now requires every flag named outside `main.js` to be declared in
`global_flags`, in both directions: read as a property, or granted as a reward
string. Negative-tested both ways.

**With this, P-10 is closed.** All four of the lands in the cook's geography lesson
are in the game: the wet woods, the plains, the bay and the mountain. What he said
about each one is what each one turned out to be.

### Region 3: the bay

*"A-ha~! Far to the north! Many spice and meat and metal and leather come from
there! From very far away! It good place to go! To leave!"*

PROPOSALS said this one should wait until there was a reason to leave, and quest 4
supplied it. The collector's last line has been sitting unanswered since it
shipped: *"There was one other piece in that lot and it did not stay the night...
whoever came for it that night did not haggle."* The bay is where it went.

**Opened by the factor, not by the cook.** The cook names the bay and says what it
is for, but he is a swamp away and has never been there. The factor is the only
person in the game whose job is the road - *"He is writing down what comes up the
road and what it was worth when it got here"* - and nobody has ever asked him about
the other direction. His answer is the region: *"Eleven years at this table, and I
have watched carts go north empty, and I have never once been paid to write down
what was in them."*

**The road is the obstacle, not a corridor.** `Coast road` is a Combat_zone off the
Town outskirts, and clearing it is what puts the bay on the map. Direwolves rather
than something new: a well-made road with nobody living along it is what they are
for, and the region's danger should be that it is empty rather than that it is
exotic. (A Combat_zone has a `parent_location` and a `leave_text` and no travel list
of its own, so it cannot be a waypoint - the bay hangs off the outskirts too.)

**The bay is built as a departure.** Eleven buildings, nine of them sheds, no
square, no well, no wall - nothing there needs defending and nobody there is from
there. The tallyman is the factor's opposite number and had to not be a second copy
of him: the factor is amused by his own smallness, the tallyman is tired of his, and
he looks at the water instead of at the page because what he is counting is out
there.

**The salt house exists because the cook's line is a shopping list.** *"Many spice
and meat and metal and leather"* is a promise, and the honest way to keep it is a
shelf holding things the player has only ever had by making or hunting them - iron
and steel in bars, leather in quantity, spice by the sack - at a margin of 8,
higher than the swamp and the slums both. No new items: the far-away part is the
price, not the loot. It has its own market region, linked to nothing, because
saturation models what the player has dumped in one place and the bay is a month
from every other market in the game.

**The payoff is an entry in a book.** `read the departures` mirrors `read the
ground` on the plains - an action on the hub room, gated on Perception, that hands
back a fact rather than an item. What it hands back is the **Marrowmoth**, forty
tons, out on the ebb the night after the forest road, one crate unweighed, and an
account column with a single stroke drawn across it twice in the same hand as
everything else. *"Every hull has an account. That is what an account is for - so
that when a thing goes wrong there is a man to write to."*

Who paid is still not in this game. What is new is a hull that comes back twice a
year and is not due, and a man who will not send for you when it does. That is a
hook opened, not a mystery closed, which is what the arc is for.

**The game's own verifier caught what `npm run check` did not.** `src/verifier.js`
refuses a location that has a trader and no market region, and it said so in a
browser after `check` had already passed. That is the wrong order, so the assertion
is now in the build as well - anchored at the room's own indentation, because the
first version read `locks: {traders: [...]}` inside Gang hideout's repeatable
reward as a shop in a combat zone and reported a defect that was not there.

### The rest of the English, found by scanning instead of looking

The previous entry ends by admitting that the screenshots were the wrong
instrument. This is what replacing them found.

A screenshot shows the panel that happened to be open. Four of them, over two
days, produced five fixes and a fifth report - and the fifth report was correct,
because the crafting window, the stance table, the bestiary and every tooltip had
never been in a screenshot. So the source got scanned instead: every string literal
on a statement that assigns `innerText`/`innerHTML` or calls `set_HTML`/`insert_HTML`,
minus the ones that are locale ids, markup or `material-icons` glyph names.

**Twenty-eight sites, in two classes.** The first class is what you would expect -
`"Slot:"`, `"Result:"`, `"Finish"`, `"Sleeping..."`, `"Fav"`/`"Select"`/`"Name"` on
the stance table, `"Stamina cost:"`, `"Breakdown:"` in the two places the earlier
pass had missed, `"(with global: …)"`, `"Materials required:"`.

The second class is the interesting one: **registry keys formatted for display.**
Six item-tooltip sites and the effect tooltip built their stat labels out of the key
with `capitalize_first_letter(effect_key).replace("_"," ")`, so a Turkish player read
"Attack power". The rows to translate those keys - `<stat> long` - had existed since
the race tooltip was written; the sites just never used them. The same shape as the
empty equipment slots the entry above describes. Also in this class: the weapon type
on a tooltip, where a stat or xp bonus comes from (`skill_milestones`, `light_level`),
which region a reputation belongs to, and all three levels of a quest task condition.

**Two English tables went with it.** `stat_names` in `misc.js` carried its own
removal note - *"can be removed once everything is moved to translations"* - and it
could: all 29 of its keys have a `"<key>"` locale row holding the same abbreviation,
so the table was a second copy of the default locale that no translation could
reach. It had 15 call sites across `display.js` and `skills.js`, which is why a
milestone reward read "+3 hp" in an otherwise Turkish tooltip. `task_type_names` went
too, and it was worse than untranslated: it held three entries while quests use five,
so a visible `reach_skill` task would have rendered "undefined:". Both of those
quests are hidden, so nobody saw it, but the fallback now names the key instead.

**And `retranslate_interface` had gaps of its own.** The three bars are painted by
their own updaters and each carries a word, so hp, stamina and xp kept their old
language. The inventory was worse: `update_displayed_character_inventory` only
patches the count, the tooltip and the price of a row that already exists, so item
names and the `[use]`/`[equip]` buttons never changed. It has a `rebuild` option now
that replaces each row in place - `replaceWith` keeps the DOM position, so the
player's sort order survives. The stance list is called from `main.js`, because it
takes the current stance and the favourites as arguments.

**The check is the point.** `npm run check` now performs the scan on every run, so
this cannot come back. Getting it right took two tries, and both failures are worth
recording because they are the same failure the content-id scan had:

- The first version matched `innerText\s*=`, which also matches `innerText ===`. It
  flagged `innerText === "[Comp]"` in the inventory sort comparator - a **read**.
  Translating that would have put a locale string into a sort key.
- The second version scanned line by line, so a template literal spanning two lines
  was reported as two strings. It flagged `material-icons icon skill_dropdown_icon`
  because the fix this check exists to verify had moved the closing `</i>` onto the
  next line. It walks characters now, and decides whether a literal reaches the DOM
  from the statement it sits in rather than from its line.

Negative-tested by planting three defects: a plain label, a label inside a
multi-line template, and a comparison. It caught the two writes and left the
comparison alone.

**Two more the browser found, which the scan structurally could not.** The item
tooltip printed `${item.material_type}` - a registry *value*, not a literal, and
stripping interpolations is exactly what lets the DOM check ignore the parts that
are already display names. So that class needs the opposite check, reading the
values the content declares and requiring a row for each; `material_type` and
`weapon_type` are wired to it, and it is negative-tested. Twenty-five material
types needed rows.

The other was not a translation bug at all: `ui label intuition` had no colon while
every one of its siblings does, so the stat panel read "Intuition 10.0" between
"Dexterity: 10.0" and "Magic: 0.0" in English too. And the level line was written
only on a level-up, so the hard-coded `Lvl: 0` in `index.html` stood until the
player first levelled - in English, and in different words from the ones the code
uses. It is written every time now and the markup is empty.

**One dead comparison found and left alone.** Nothing anywhere writes `"[Comp]"` or
`"[Book]"`, so those two branches of the inventory comparator can never match. That
is an upstream bug rather than a translation one, and fixing it means deciding how a
row should advertise being a component - recorded here rather than guessed at.

### Region 2: the plains

*"Southeast! The snake would hunt! But the snake split! And now no snakes go to the
plains!"*

The second of the cook's four lands, and the one his grief is most specific about.
The other three lines describe places that changed; this one describes a place that
was **abandoned**. The snake split, half of it left, and the hunting ground went
with the half that left.

So the plains are built as an absence. Grass to the horizon, southeast past the
Swampland fields, and nothing hunting in it - which is the danger rather than the
safety. What moved into a hunting ground with no hunters is the **Old hunting
ground**, a combat zone whose enemies are what the tribe used to keep down.

**The quest is named after his line.** `No Snakes Go to the Plains` opens when the
cook talks about the plains and closes when the ground is cleared, and its reward is
not an item: the swampland chief finishes a sentence he broke off the day he gave
you his ring. That was the deliberately-open hook - he stops mid-thought, and
nothing in the game had ever come back to it.

**The banished tribe are not found, and that is the point.** The plains can be
walked and their traces are there; who they became is the question the whole swamp
is built on and it stays open. This region hands back the ground, not the people.

### Switching language now repaints the whole interface

The reported bug was "the UI is half Turkish and half English", with four
screenshots across two days. Each screenshot was fixed, and the next screenshot
found more, which is the shape of a problem being chased rather than solved.

The cause is structural. `translateUI(language)` only rewrites elements carrying a
`data-translation` attribute, and it sets `innerText` - so it can only own an
element whose entire content is one label. Everything the game paints from
JavaScript, which is most of what a player looks at, was written once in whatever
language was current and never revisited. `option_language` changed the language and
then did nothing about what was already on screen.

`retranslate_interface({location, active_quest_ids})` is the answer: one function
that repaints the time, the money, the stats, the equipment, the effects, the
reputation, the inventory, every unlocked skill bar, the current location and every
quest on the panel. `option_language` calls it, along with `fill_character_bio`,
`update_save_load_buttons` and the character creator's own refresh.

Three things that came out of doing it:

- **`fill_character_bio` threw on a new game.** `playable_races[undefined].name` is a
  TypeError, and on the creation screen the race is not chosen yet. That throw
  aborted `option_language` before the repaint could run, so the reported "race
  tooltips stay English on the creation screen" had **two** causes and the throw was
  hiding the other one. It returns early now.
- **The date line could not be translated at the source.** `game_time.js` returns the
  season, the weekday and the time of day as English strings, and it has to keep
  doing so: `conditions.js` compares `getSeason()` against a `season: {yes: "Summer"}`
  written in content, and `toString()` feeds the save's `saved_at` stamp. Translating
  them where they are produced would break a condition silently and put Turkish into
  save data. So the numbers come from the clock and the words come from the locale,
  keyed on the English the clock returns - the same split the registry keys already
  use.
- **The empty equipment slots had translations all along.** Every `ui slot <key>` row
  existed; the label was being built from the raw registry key instead, which is why
  a Turkish player read "fishing pole slot". The id is now computed into a variable,
  which the content-id scan cannot follow, so `npm run check` grew a check that reads
  the slot list out of `equipment_slots_divs` and requires a row for each of the 16.

**One thing stays English on purpose.** Lines already printed in the message log keep
the language they were printed in. `log_message` takes composed text rather than an
id and its params, so making the log retranslatable means changing what 44 call sites
pass. It is recorded here rather than done quietly.

**And the screenshots were the wrong instrument.** After the last one was fixed, a
scan of every string literal reaching `innerText`/`set_HTML` in `display.js` found
another twenty-eight sites that no screenshot had happened to show. That pass is the
next entry, not this one.

---

## 2026-08-23

### Region 1: the wet woods

The first of the four regions the swamp cook names, and his line is the entire
brief: *"South of the falling water! The wet woods! That was where we gathered! But
now?! It is just home of the walking rocks!"*

It is found by **asking**. The line in his geography lesson that names the woods is
the line that opens them, so a player who never asks about the woods never gets the
region - which is the right way round for a place that only exists in one person's
memory.

A forest standing in water, roots somewhere below your knees, light arriving green
and second-hand. His walking rocks are the stone crabs, which already existed with
700 defence and a habit of turning rather than scattering, so the region needed
ground rather than bestiary. The room's description moves through three stages with
the Drowned grove's clear count, the way the Waterfall basin already does with the
crab spawning grounds - a region that reads as recovering rather than flipping.

**What they gathered is flax, and that is a fix rather than a flourish.** The guild
factor in quest 1 wants twenty Linen cloth. A cloth is ten Flax. All two hundred had
to come from one Riverbank herbalism activity on the far side of the map, which made
the delivery a grind rather than a supply run - quest 1 shipped with a supply chain
it did not have, and I did not notice until the region's own canon pointed at it.
The gathering ground yields flax at two to six a cut against the Riverbank's one to
three, and it is locked until the grove is clear, because the crabs are the reason
nobody gathers here.

The cook gets the only answer any line in that lesson has ever had. He stops with
the ladle halfway out of the pot, tries the exclamation and misses it, gets it on the
second attempt, and then tells you the flax is in rows - *"My grandmother's
grandmother put them in rows and the water kept them and the rocks sat on them"* -
before putting the ladle down, which he has not done once in the game. Then, without
the laugh: *"The soul is a little larger today."*

**Two things caught while building it.** The zone was typed `aquatic`, which trains
Swimming, while the room's own text says you wade - it is `wet` plus `narrow` now,
which is standing water and close trees rather than open water. And the cook's line
was going to grant Swamp reputation, which exists as a market region and as nothing
else: nothing grants it and nothing consumes it, so it would have been a reward that
looks like something and does nothing. It gives xp.

2763 keys per language; `check` at 1804 content ids, 201 interpolated pairs, 269
declared textlines and actions.

### The sourcemap was being deployed

`_site/dist/bundle.js.map` was live, 3 MB of it, served with a 200 to anyone who
asked - confirmed against the deployed site rather than inferred. It shipped
because `dist` was in `static_dirs` and got copied wholesale, so the map came
along with the bundle and nothing ever looked at what else was in the directory.

Two costs. It roughly tripled the deployed JavaScript payload, and it published
the complete unminified source with original file names and line numbers - which
for a game whose whole content model is readable registry keys means publishing
the content too.

`dist` is out of `static_dirs` and the bundle is copied on its own, with its
`//# sourceMappingURL=` comment stripped: leaving the comment would send every
devtools session after a file that is deliberately absent, which reads as a broken
deploy rather than a decision. The map is still written to `dist/`, which is
untracked, so local debugging is unchanged. Deployed payload goes from 4.2 MB to
1.16 MB.

`npm run check` now fails if the map appears in `_site/` or if the bundle still
references one. Both negative-tested.

### build.js refuses instead of quietly breaking things

The pre-fork builder has been documented as a trap for as long as these docs have
existed - *"Do not run node build.js"* - and a warning in a file is only as good as
the odds of someone reading it before typing the command they have typed for years.

Both halves of the trap were verified rather than repeated on trust. It rewrote the
**tracked** root `index.html` in place, which is the dev entry point and carries a
deliberately stale `style.css` version. And its bundle-version regex,
`/dist\/bundle\.js\?version=[^&"]+/`, has exactly one match in that file: the one
inside the *commented-out* script tag sitting next to the live one. So it stamped a
dead comment, left the script the game actually loads untouched, and printed
*"Bundle and style versions in .html have been updated!"*

It is not deleted. It keeps its name and its history, and its body is now an
explanation and `process.exit(1)` - so anyone following older instructions, or their
own habit, gets the reason and a working alternative instead of a dirty working
tree. The file documents both original faults in its header, because that is the
only place someone reaching for it will look.

Checked after: it prints, exits 1, and leaves `index.html` untouched;
`npm run build` is unaffected.

No player-facing entry - nothing in the game changes.

### A check that no player can reach dead content

The rat's `who` line was unreachable from the day it was written: the line before
it unlocked `walls` instead, so nothing in the game ever unlocked `who`. That is a
failure with no symptom. No test notices it, because the content is syntactically
perfect and every id resolves; no player reports it, because a player cannot report
a conversation branch they have never been offered. It was only found because the
whole dialogue was commented out and had to be read line by line to reclaim it.

`npm run check` now builds the unlock graph and walks it. Every textline and action
declared `is_unlocked: false` must be unlocked by something, and every unlock must
name something that is actually declared. 268 declared, 203 of them locked, 230
unlock references. **All reachable, nothing dangling** - including everything built
over the last two days.

Three mechanisms unlock content and all three are counted: `rewards.textlines`,
`rewards.actions`, and the `otherUnlocks` callbacks that assign `.is_unlocked`
directly, which is how the village guard opens her third stance line only after the
first two are done.

The first draft scanned two files and reported the village elder's `more training`
as dead. It is not: `quests.js` unlocks it. Rewards live in five files, and a
reachability check that reads two of them invents corpses. Negative-tested by
restoring the rat's original slip, which it catches with the line's own name, and
by pointing an unlock at a line that does not exist.

### LOCALE_STRICT is on in CI

The missing-translation warning existed for a translation still in progress. Turkish
is at 2739 of 2739 keys, so the warning has become a way for the first untranslated
key to ship quietly. CI sets `LOCALE_STRICT=1` and a missing key is now an error.

Both directions checked: with a key removed, the run warns and passes without the
flag and fails with it. Adding a language that is *not* complete means turning this
off again on purpose, which is noted where the flag is read and in both AGENTS
halves.

No player-facing entry: neither change alters anything in the game. They exist so
that the next thing that does is caught before it ships.

### Quest 1: "The Merchant's Word", and the gate's second key

Built last, and it is the first quest of the arc. The gate has always named two
keys - *"The town is currently closed to everyone who isn't a citizen or a
merchant guild's member. No exceptions."* - and only the citizen one existed. The
merchant guild was a noun in one sentence.

**The factor sits outside the wall**, at a folding table with a slate, a set of
scales and a cart that is not his, and that is the whole design: a supplier does
not need to be let in to sell, only to be worth letting in. *"I am with the guild,
and the guild is on the other side of that wall, and I am on this side of it, which
tells you exactly how much the guild wants to pay for a room."*

What he wants is a supply argument, not a favour. The farms send grain, the hills
send wool, the cave sends iron, *"all of it the same as last year"*. What never
arrives is anything from past the falls: *"Nobody comes back from there, so there is
no supply, so there is no price - and a guild that has no price for a thing does not
know what to do with it when somebody finally brings one."*

So: linen, alligator leather, jerky. All three from tribe recipes, all three
impossible for anyone who has not been past the falls, which is the premise the arc
is named for - the hero enters the town **as a supplier, not as a hero**. Twenty
linen, twenty leather, thirty jerky, and he is honest about the price each time
because honesty costs him nothing: *"I am the only person you can sell this to, and
you are the only person who can bring it. We will both pretend that is a
coincidence."*

Then the note. It is worth nothing inside the guild hall and everything at the
gate, *"because he was told to turn away anybody who is not a citizen or a member,
and this is the cheapest membership the guild has ever issued."*

**The gate's `supplier` line mirrors `known` exactly**, because it is the same gate
- same location unlock, same Lost memory task, same follow-up. The only difference
is which key was brought. Each locks the other, so a player who walked in on Town
reputation is never offered a note they no longer need. The guard reads it twice:
*"Folding table. Right. I know exactly who wrote this and I know what the guild pays
him, and I am still going to let you through, because those are the two keys and you
brought one of them."*

### One more check, from the same family as the last two

`items_by_id` is how an action charges the player in goods, and a typo there fails
in the worst possible way: `process_conditions` looks for an id nothing has, finds
nothing, and the action can never be begun - so the player sees a delivery they
cannot satisfy while holding a full stack of the thing. `npm run check` now resolves
every required item id against the templates, generated ones included, by asking the
generator rather than only grepping. 18 references. Negative-tested with a doubled
letter.

That is the third check in two days aimed at the same class: content that looks
like it does something and does nothing. The other two were the reward-key
validation and the money-requirement shape.

### The arc is built

All six quests of *The Merchant's Word* exist. The gate has both of its keys, the
five town interiors have people in them, the robbery has a client nobody can name,
the second gate opens with mind rather than strength, and the village guard finally
spars.

And the "authored but unreachable" list in [STORY.md](STORY.md) is empty. Town
square, the Adventurer's guild, the Antique store, the Cat cafe, the Nekomimi cafe
and the Mages guild are all reachable; the `cute little rat` dialogue, the forest
lake's deep dive, the `Silver ingot` recipe and the two orphaned combat stances are
all reclaimed. Nine high-value orphans, none left.

What stays open stays open: who paid for the robbery, how the hero came to have the
object, whether the guard is the retired adventurer, the four unbuilt regions, the
banished tribe, and the Rat God.

2739 keys per language; `check` at 1783 content ids, 272 reward objects, 18 required
items, 21 dialogue names, 247 item names; `npm test` at 91.

### Quest 6: "Way Too Strong for You"

Her line, and her method. The village guard has been brushing off the same
question since the village was the whole game: *"Ohhh, someone wants to impress
the cute guard lady? Sorry, but I'm way too strong for you`"*, and separately,
*"I'm sorry, but no, that will have to be enough. Trust me, I'm generally a
terrible teacher, I know that from experience."*

**The mechanism was already written into her.** `guard teach answ`, the line that
gave the player their first three stances, says how she works: *"Two can be easily
presented through some sparring, so let's start with it. The third I'll just have
to explain."* Sparring for what can be shown; explaining only what cannot.

The two stances nothing in the game grants - `Berserker's Stride` and
`Flowing Water`, authored with their skills and reachable by nobody - are the two
that can only be survived. Which is also why she stopped at three, and why "I'm a
terrible teacher" is a method rather than modesty: she has nothing left that words
will carry.

So she does not teach them. *"Not a lesson - I told you why and I meant it. But
there are two more of these, and neither one can be explained… So come at me until
you stop, and if you see something worth stealing, steal it. That is how I got
them. It is a terrible way to learn."*

**Not a Challenge_zone.** "I'm way too strong for you" is canon, so she cannot be
an enemy the player defeats - a duel she loses would unwrite the line the quest is
named after. It is a repeatable spar gated on Combat and Evasion, and what it
measures is lasting long enough to steal something. The success text describes both
stances without naming either: twice she went through where you were with her whole
weight behind a strike she had no business recovering from, *"and recovered, because
she had already decided to spend the recovery before she threw it"*; twice more she
never planted and never committed, *"as though stopping had simply never been on
the list"*. Then: *"You are already doing them wrong. Do them wrong for a month and
they will be yours instead of mine, which is better."*

**What it does not answer.** The millers worked it out long ago and decided to
leave it: she is, *"as far as oral descriptions go"*, one of the continent's top ten
adventurers, who retired just before she came back. *"She doesn't seem to care much
about it, probably prefers peace and quiet. Let her have that."* Meanwhile the old
craftsman tells anyone who asks that she failed for want of talent.

Asked about it, she refuses in as many words - *"People retire because they want to
or because they have to, and which of those it was is mine. You did not ask.
Good."* - and corrects exactly one thing on her way back to her round:
*"when the old craftsman tells you it was a shortage of talent - he will, he tells
everyone - you can let him. But it was not talent."*

Gated on hero level 25, which is where the frontier is, because what she is
reacting to is what the player has become rather than a flag they tripped.

### P-9's ordered work is finished, and Q1 is not

Worth stating plainly rather than letting the proposal read as complete. The
execution order in P-9 covered quest 2, the reclamation blockers, quests 3 and 4,
quest 5 and quest 6. All five are done. **Quest 1 was never in that order and has
never been built.**

*The Merchant's Word* is the quest that gives the merchant guild a body by
supplying it with tribe goods, and it is the arc's own premise - the hero enters
the town as a supplier. Without it the gate opened by the citizen path only: the
farm supervisor walking down to leave a name with the gate. The supplier path the
premise is named after does not exist, and the guild quarter the gate guard points
at *"past the fountain"* is still a direction rather than a place. P-9 goes back to
`active` rather than `done`.

2711 keys per language; `check` at 1769 content ids, 265 reward objects, 20
dialogue names, 247 item names.

### Quest 5: the second gate, opened with silver

The chamber under the village has said what it wants since before the fork:
*"the floor is covered in square tiles in the center, yet you cannot help but
notice that all these squares make a circle, in some impossible to understand
way… There's another gate on the wall in front of you, but you have a strange
feeling that you won't be able to open it with brute strength."*

So it opens in two steps, and neither is a fight. **Study the floor** and the trick
comes apart: stop trying to see the whole thing and follow one edge, and the
squares are not a circle at all - they are a spiral so shallow that a circle is
the only thing the eye will accept. Which means the gate is the end of the spiral,
and it is waiting to be read rather than pushed. You would need something that
carries a current instead of fighting it, and is too soft to be good for anything
else.

**Silver**, which is not an invention either: `Silver ore` has always been
*"peculiar for its ability to direct or disrupt magic"* and `Silver ingot` *"too
soft to use as weapon material, but has potential for use in magic tools"*. Three
ingots make a divining rod. **Trace the spiral** with it and the rod goes cold by
the last turn, and the gate does not so much open as agree.

### The silver chain was authored and broken in two places at once

This is why silver had no purpose, and it was not for lack of content.

The forest lake's second-stage dive is the game's only silver tap - clear it and
the `mining` activity that yields `Silver ore` unlocks. Its reward read
`action: [{location: "Forest lake", action: "mining"}]`, and that is wrong twice:
`action` singular is not a reward key, so `process_rewards` never looked at it, and
`mining` is an ACTIVITY, so even under the correct `actions` key it would have been
searched for in `.actions` and never found. The dive itself was then locked, with
the author's note: *"locked as the reward doesn't really have any uses yet"* - half
right, for a reason nobody had traced.

The `Silver ingot` recipe sat commented out, its level range already sitting
correctly between the live iron and steel recipes, *"waiting for a sink"*. Both are
live now, with the rod between them: fifteen ore for one gate.

**A check for that whole class of bug.** `npm run check` now validates every key
inside every `rewards`, `first_reward` and `repeatable_reward` block against what
`main.js` actually reads - 263 reward objects - and does the same for `locks`. A
reward key nobody reads is silent by construction: the content looks like it grants
something and the game grants nothing. Negative-tested by putting the singular
`action:` back, which it catches with the exact key name.

The list is taken from `main.js` rather than from `src/rewards.js`, because the
schema document was itself missing four keys the code reads: `skills`,
`global_activities`, `locks.actions` and `locks.quests`. Those are documented now.

### Ratzor Rathai, reclaimed

Behind the gate is a small round room, uncomfortably warm, lit by nothing you can
point at, with a cushion in the middle of it. On the cushion is the
`cute little rat` dialogue - seven textlines that have sat inside a
`/* */` block since before this fork, written before the localisation layer existed
and so with its text inline.

He is the Rat Prince Who Be Promised, his papa is the great Rat God, and he
answers the question the Writhing tunnel raises without softening it: the things
that ARE the walls *"be given the blessing of papa, but they try to reject but be
too weak to really reject so they end up looking funny."* Only in soul, he says.

His English is carried over verbatim, *"Infite"* and *"uppon"* included - that is
his voice, the same way `Twist liek a snek` is a book title rather than a typo. The
one correction is `litle` in the narrator's description of him, which is narration
and not his. The Turkish uses the slip the swamp cast already uses: third-person
agreement where first or second is required, which is the house register for this
and not a new invention.

**Three link errors were repaired on the way in**, all copy-paste. `what` unlocked
`walls` instead of `who`, which left `who` unreachable by anything at all. `walls`
unlocked ITSELF and locked `monsters` rather than itself. `kill` unlocked `walls`
again. The tree is now hello → what → who → monsters → {walls, kill, mind}, each
terminal, which is what the rewards were plainly reaching for.

The Infinite Rat Saga's fourth task has read *"Go even deeper (tbc)"* since it was
written. It reads *"Open the second gate"*, and it can be finished.

**Not browser-verified.** Playwright is still disconnected, so this rests on
`npm run check` - which now includes the reward-key validation that would have
caught the bug this quest was blocked on - plus the save audit, which still
resolves every key in a real v0.5.5.30 save against the new content.

2695 keys per language; `check` at 1760 content ids, 20 dialogue names, 247 item
names, 263 reward objects.

### Quest 4: "Nothing but Pants", and the money the game could not spend

**The door was already closed.** The Antique store has described its collection as
*"most of them apparently not for sale as this place also functions as a private
museum"* since before this fork. So the collector not selling is not an obstacle
invented for a quest - it is a fact the quest had to be built around, and a bigger
number is not the answer to it.

The way in is **provenance**. He trades in stories, not objects: *"An object with no
story is furniture."* He bought a lot off the broker, sold the clothes because
clothes are worth what cloth is worth, and kept one thing worth a card - a cord and
a bone tally with seven notches. The hero is the provenance of it, and that is the
one thing that makes him open a drawer.

Then money is what it costs, and he is completely unembarrassed about why:
*"Yesterday it was a tally. Today it is the tally that was taken off a man on the
forest road who walked back out of the swamp to ask for it. That is a better object
than the one I bought, and I did nothing to improve it. You did."* Thirty thousand.

**His last line is the point of the quest.** One other piece came in that lot and
did not stay the night: flat, palm-sized, cut through with squares that turn and
come back to their own beginning. Forty years of cataloguing this town - the stone
in the church, the guild's charter, the well - and *"that was not old the way those
are old. That was made before there was anybody here to make it, and whoever came
for it that night did not haggle."* A second witness to the cave's shape who has
never been down there, and still no name.

### The money requirement did not work

This is the first thing in the game that takes money rather than giving it, and the
mechanism for it was documented three different ways and implemented as neither.

`src/conditions.js` documented `money: {number, remove}`. `src/actions.js`
documented it twice more, once as `{number, remove?}` and once as
`{Number, remove_on_success?, remove_on_fail?}`. The implementation compared
`character.money < conditions[0].money` - the raw value. A price written the
documented way therefore compared a number against an **object**, which is never
less than it, so the gate passed on an empty purse. And nothing anywhere subtracted
money outside trading, so even a gate that worked would have charged nothing.

Nothing in the content used it, which is why none of that had ever surfaced: every
`money:` in the content is a reward.

Now: `money_required` reads the amount out of either accepted shape - a bare number
requires and takes nothing, an object can also be spent - and is **exported**,
because main.js has to charge exactly what the gate asked for. Two readings of the
shape would let an action start on one number and bill another. The spending sits
where item removal already sits, going through `add_money_to_character` so the
displayed purse follows it, and it honours the same split items already had:
`remove` on a `conditions` entry, `remove_on_success` / `remove_on_fail` on an
action's `required`.

Guarded three ways. `npm test` pins both shapes, the exact shape quest 4 uses, and
a check that the old comparison really did pass on an empty purse so the new ones
are not vacuous. `npm run check` asserts that any money *requirement* in the
content uses the spendable object form with a positive amount and a removal flag -
a bare number there would gate correctly and cost nothing, which is the same class
of silent pass. Both negative-tested, and the check found a real bug in itself: the
first version captured `money:` up to the first comma, so it never saw the removal
flag and reported my own price as unflagged.

### Six items had no name of their own

Found while adding the tally: hand-written items need a `name <key>` row, and
without one the shown name falls back to the English registry key. Measured on the
raw source this looked like **124 items**. Measured with comments blanked - which is
what the existing checks do, and what I should have done first - it was **six**: the
other 118 are hand-written components the runtime generator superseded, sitting
inside commented-out blocks.

Six is small enough to write rather than warn about, so `Goat meat`,
`Cooking herbs`, `Silica Sand`, `Cooked potato`, `Cooked clam` and the tally have
names in both languages, and the check errors instead of warning. 246/246.

**Not verified in a browser this time.** The Playwright connection that caught the
second cause of the language bug dropped, so the money path is verified by its
tests and by the shape check rather than by running the purchase. The chain's wiring
is the same shape as quest 3's, which was driven end to end.

2661 keys per language; `check` at 1728 content ids, 19 dialogue names and 246 item
names; `npm test` at 91.

### Quest 3 of the arc: "Somewhere in the Town"

The quest's name is the robber's own words. Beaten in the slums, he gives up the
only thing he has: *"It was my group that robbed you… If you want answers, ask my
ex-boss. He's somewhere in the town."* That line has been in the game since before
the fork and pointed at nothing.

**Two NPCs, in two rooms that were authored and left empty.** The Adventurer's
guild had roughly fifty ambient barks and nobody to talk to; Town square had nine
and the same. Neither had ever held a dialogue.

The **guild clerk** finds the name. She is dry and transactional - three ledgers
open at once and a fourth held down with a dagger - and she corrects the player's
tense before answering: *"Used to. That's the right tense, and most people get it
wrong."* She will not say where he sits. She says the awning is green.

The **broker** under the green awning is the ex-boss, and he is a broker rather
than a gang leader because the robber's line says *ex*-boss and means it. He
answers in flat statements and never raises his voice.

**The turn: the robbery was contracted.** Paid up front, half again on delivery.
His people held that road for a week and were told exactly one thing to look for.
They were not told to leave nobody breathing - *"that part they decided on their
own, and it is the only part I would have done differently."*

What he will not give up is who paid, and that is deliberate: canon keeps it open.
The money came through two hands before it reached his, which is what a man pays a
broker for. He can say it was clean coin minted in the town, and that whoever
counted it had done it before. No name. *"If I had one I would already have sold
it, to you or to somebody else."*

**The object is the link between the two mysteries.** Not a purse, not a weapon:
palm-sized, flat, *"with squares cut into it that come back around to where they
started."* The cave under the village has pre-human architecture where *"all these
squares make a circle, in some impossible to understand way"* - the same shape,
named the same way, by a man who has never been down there and has no idea what he
is describing. Neither mystery moves an inch closer to an answer, and they are now
tied together by a physical thing.

It left his hands the night it arrived, so it is not what quest 4 buys back.
Everything else went in one lot to the collector across the square, who *"pays
badly and pays immediately"* and **does not sell** - which the Antique store's own
description already said, years before this was written: *"most of them apparently
not for sale as this place also functions as a private museum."* Quest 4 starts
from a closed door that was closed before anyone thought to knock on it.

**Wiring, and the one trick in it.** The robber's confession now also unlocks the
clerk's question. That confession happens in the slums, at hero level ten or so,
long before the town is reachable - so the line simply waits at a counter the
player has not seen yet, and needs no flag of its own. Three tasks: find him, ask
him about the road, learn where what was taken went. Who paid is deliberately not
among them.

**Verified in a browser, not by reading.** The dev server was driven through the
whole chain: the confession unlocks the clerk's line, the clerk starts the quest
and unlocks the confrontation, the confrontation unlocks the three follow-ups, and
the last one finishes the quest. The description advances through all three of its
states in Turkish. `Verify_Game_Objects()` runs clean with the new content in
place.

### The reported language bug had a second cause

That same browser session found what the earlier fix had missed. Switching language
on the hero creation screen was supposed to repaint the panel, and the repaint call
was never reached: `option_language` calls `fill_character_bio` first, and on a new
game `character.personal.race` is not set yet, so `playable_races[undefined].name`
threw and aborted the whole handler.

That throw predates this work - the bio call was already there and already failing -
but it was invisible, because nothing came after it. Adding the creation-panel
repaint put something after it, and the exception ate it. `fill_character_bio` now
returns early while the hero does not exist.

With both halves in place and checked live: the confirm button reads `Onayla`, the
races read `İnsan`, `Elf`, `Yarı elf`, the tooltip reads Turkish, the three category
labels read Turkish, and the selection survives the switch. Reading the code would
not have caught this. Running it did.

2634 keys per language; `check` at 1715 content ids and 18 dialogue names.

### Closed the NaN warnings, and checked a real save against the registries

**The trap.** `slerp` is the interpolation behind gathering times, drop chances and
crafting success. It reads its pair GEOMETRICALLY - `from * (to / from) ** t` - which
is what makes a `[30, 10]` gathering time shrink on a curve rather than a line. That
form has no meaning when the pair starts at zero, because nothing scales 0 upwards,
and none when either end is negative, because a fractional power of a negative is not
real. Both came back `NaN`, and the `NaN` travelled: it reached the skill-xp guard in
`main.js` as a non-numeric gain, which is the console warning this was reported as in
the first place.

It now falls back to LINEAR where the geometric form is undefined. Linear agrees with
geometric at both endpoints and stays monotone between them, which is what an author
writing `[0, n]` means. `crafting_recipes.js` held an inline copy of the same
expression for crafting success; it calls the helper now, so there is one guard rather
than two places to remember.

**No current number moved.** Measured before touching anything: all 193 interpolated
pairs in the content are positive on both ends, so the fallback is unreachable today.
That was the point - this is a trap for whoever authors the array that triggers it,
not a live bug.

**One of the three reported items did not reproduce.** The market-saturation divisor
is reached only when `sold >= 1e13`, so it cannot divide by zero; the other division
on that path is by a constant. Recorded as refuted so it stops being carried forward.
Two no-ops nearby were fixed while looking: `Math.max(sold_by_tier[i] ?? 0)` with a
single argument returns its argument and never clamped anything.

**Three guards, so it cannot come back.** `npm run check` asserts both ends of every
interpolated pair in the content source are positive - 192 of them, the 193rd being
inside a commented-out recipe - and runs on every push. `npm test` pins the geometric
curve and the fallback, and includes a check that the OLD expression really did return
`NaN`, so the new ones cannot pass vacuously. Both negative-tested.

The third guard needed repairing before it could guard anything. `Verify_Game_Objects`
was supposed to check gathering resources, and its loop read
`gained_resources?.length` - `undefined`, because `gained_resources` is an object
holding a `resources` array. It ran zero times. The item-name check inside it had never
executed once. Fixed, and extended to report any pair whose ends are not both positive.

### `npm run check:save`

A savegame exported from the fork arrived for analysis, and it turned out to be the
strongest test available for the project's hardest rule. Registry keys are save data:
item ids, location keys, dialogue and textline keys, skill ids, recipe names, activity
names. Renaming one silently breaks every existing save, and the whole localisation
effort rested on never doing it - a claim nothing had ever checked against an actual
save. `npm run check` can only verify the code against itself.

The save is **v0.5.5.30**, from before any of the localisation work. Every key in it
resolves: 61 locations, 14 dialogues, 60 skills, 15 activities, 4 traders, 11 quests,
8 books, 131 recipe names and 90 item ids. Nothing was renamed.

Three things the script had to learn, each of which produced a false result first:

- **Recipes are grouped per skill and per kind**, and the same name legitimately
  appears under several skills. The first pass matched only `.items[...]` and reported
  44 phantom gaps, because the `.components` alternative in the regex captured into
  group 2 while the code read group 1.
- **The inventory is keyed by a JSON string**, not an id: a stack is identified by its
  id AND quality, and equipment built from parts is identified by its components with
  no id at all. Reading the keys as ids found zero items.
- **203 templates are generated at runtime** from a material and a component type, so
  their keys exist in no source literal, and worn equipment carries a third kind of
  name assembled from its components. A heuristic matching material and component
  names out of the locale looked right and was wrong - the parts are stored lowercase
  and the assembled key is capitalised, so every generated item came back unresolved.
  The script runs the actual generator instead.

That last one now lives in `scripts/lib/generated-items.mjs`, shared with
`npm run check`, which was doing the same stub-and-run inline. Two copies of that would
drift, and a drifted copy reports a clean result while checking nothing.

The save itself is NOT committed - it is real character data - and `.gitignore` carries
a pattern for the export's default filename so it cannot be added by accident.

`npm test` at 79 checks; `check` at 192 interpolated pairs.

---

## 2026-08-22

### Closed three proposals the work had already answered

Bookkeeping, but the kind that misleads if left: `PROPOSALS.md` still described
three things as open that the last few weeks had settled.

**P-9 step 2** listed four reclamation blockers. All four are cleared, and this
was checked against the source rather than taken on trust:
`inventory_templates["Cat cafe"]` exists at `traders.js:517` and both cafe traders
point at it; the Mages guild has its own description instead of the Nekomimi
cafe's; `grep -ric "lorem ipsum"` over `src/` and `locales/` returns nothing; and
`Location` stores `display_conditions` while `display.js` evaluates it at render
time, so mofu gating no longer has to happen at the push site.

**Q-3** asked whether the help page and the changelog were in scope for Turkish,
and recommended a Turkish help page with an English-only changelog carrying a
note. The second half was too cautious: both pages exist in Turkish and the
in-game links follow the selected language. The in-game changelog has since
become part of the development record, which settles the rest — its Turkish copy
is maintained, and `check` requires it.

**Q-6** predicted that a live language switch needed a "refresh every display"
entry point that could not exist until the display module was split. That was the
wrong shape. `translateUI` handles everything carrying a `data-translation`
attribute and everything else resolves through `getText` as its panel draws; what
was actually needed was an explicit repaint for the two panels built imperatively
and never redrawn, plus a check so that list cannot silently grow. Nothing was
split and there is no reload.

No player-facing entry for this one: everything in it that a player would notice
is already in the v0.6.0 block from the commits that did the work.

### Swept for the English the leftover list had missed

The previous entry claimed the last hard-coded English was gone. It was not. A
grep for player-facing calls holding an English sentence found sixteen more sites,
three of them directly below a line the same pass had just fixed.

**What was left.** Three quest log lines — finishing a quest, finishing a task,
making progress — sitting immediately under the `Started a new quest:` line that
had been translated. Six combat messages on the toxic frog and the two
dragonflies, written as `log_message("The frog's long tongue …")` inside their
`on_hit` and `on_damaged` handlers. Six stat labels in the bestiary tooltip. And
`ending_text`, the "Go back" option that closes every conversation in the game.

Two of the six stat labels needed no new row: `Defense:` and `AP:` already had
one, spelled identically, from the character panel and the item tooltip. Two rows
holding the same words are two rows that must never disagree, so they are reused.

**Why they hid, which is the part worth fixing.** `npm run check` verifies that
every declared content id exists, but only in the files it scans and only through
the patterns it knows. `quests.js` was scanned for `quest_name`, `quest_description`
and `task_description` — not for `getText` calls, which is what a parameterised log
line is. `enemies.js` was scanned for `description` only. Both now match
`getText(language, "log …")` as well.

And `src/dialogues.js` was not in the scan at all. It is the largest content file
in the repository. Adding it took the check from 1298 declared ids to **1695** —
397 textline names and texts that had never been verified against the locale, all
of which resolve. The pattern anchors on sixteen spaces of indentation, because a
`Textline`'s `name` is a text id while the `Dialogue`'s own `name` two levels up is
a registry key, and indentation is the only thing that separates them.

Comments are blanked first, which matters here: a whole commented-out dialogue
holds fourteen fields of raw English. See below.

**A bug in a check I had written an hour earlier.** The dialogue display-name
check keyed on the registry key. `getName` returns the `name` *field*, and one
dialogue's field differs from its key: `dialogues["nekomimi proprietress"]` has
`name: "proprietress"`. So the check passed on `name nekomimi proprietress`, a row
nothing can reach, while the row the code actually asks for — `name proprietress` —
did not exist. The button it was written to protect rendered a placeholder.

This is the same error I had just corrected in the trader check, in the same
session, for the same reason. The field cannot be renamed to match the key: `id`
defaults to `name`, and the id is save data. So the row matches the field, the
unreachable row is deleted, and the check keys on the field with the reason
written next to it.

**Unreachable content, found and left alone.** `dialogues["cute little rat"]` is
commented out — seven textlines in which Ratzor Rathai, the Rat Prince Who Be
Promised, explains that the wall-like things used to be people and that his blood
is full of papa power. It is written in a deliberate broken register, it answers
questions the swamp raises, and it is a story hook rather than a translation gap.
Recorded here and not touched: connecting it means deciding where the rat is and
what unlocks him, which is a content decision.

The sweep that found all of this now returns nothing: no `log_message`,
`insert_HTML`, `set_HTML` or `innerText` in `src/` holds an English sentence. What
the same grep still reports is console and `throw` text — "No such recipe as",
"Combat stance cannot target less than 1 enemy!" — which is developer-facing and
correctly English.

2607 keys per language; `check` at 1695 content ids, 16 dialogue and 7 trader
names; `npm test` at 70.

### Translated the last hard-coded English, and stopped Turkish opening in lowercase

**Five sites were still English in `src/` and `index.html`.** Both `Talk to the X`
builders — the `Dialogue` constructor's default and the "suspicious man"'s own
override — the `Started a new quest:` log prefix, the loading screen's all-clear
line, and the crafting and sleep buttons in every location that has them. The last
two are the odd ones: `location.crafting.use_text` and
`location.housing.text_to_sleep` already held text ids, and were interpolated raw
into the button, so the player read the id. They were held back until `check`'s
content-id scan covered `text_to_sleep`, because touching them first was the one
edit that could have created a placeholder instead of removing one.

The backup-save button was a sixth. `update_backup_load_button` sets its text from
a parameterised id when an autosave exists, but its no-backup branch set four
styles and returned, so the English left in the markup was exactly what a player
without an autosave read — permanently, in any language.

**A correction that mattered.** I had recorded that `resolveParams` treats every
`getText` param as a text id. It does not: `getText` passes params straight to
`fill`, which substitutes them literally, and `resolveParams` is reached only
through `assembleName`. Checked by running the real module rather than reasoning
about it — passing an already-resolved name works, passing an id does not.

That correction found a live bug. `main.js` built the "You should talk to X" log
line with `{v1: dialogue.getName(...)}`, and `getName` returns the *canonical
English* name by design — the display-name layer is a separate accessor. So a
Turkish game logged "suspicious man" inside a Turkish sentence. `display.js` does
the same call correctly two lines away, wrapped in `getDisplayName`.

**Turkish opens three of these patterns with the name, and names are stored
lowercase.** Of 535 `name ...` rows, 489 are capitalised and 46 are not — and the
46 are exactly the NPCs and traders, matching English, where the pattern's own
first word carries the capital. English "Talk to the village elder" is right;
Turkish "{v1} ile konuş" gave "köy yaşlısı ile konuş" on a button.

So the three go through `assembleName` with `capitalise` instead of `getText`:
the parts land in the language's own pattern, and the *assembled* result is
capitalised, which is the only way to get a capital there when the name leads.
English is untouched by it. The results, checked against the real locales:
`Köy yaşlısı ile konuş`, `Köy tüccarı ile ticaret yap`,
`Şüpheli adam ile konuşmalısın` — and `Enik ile konuş` for the mofu-mofu variant,
which has its own `name puppy` row.

The four `desc component ...` descriptions had the same defect from the other end:
they opened with `{material}`, material names are lowercase, so the Turkish
tooltip started mid-sentence where the English one starts "A short blade".
Reworded so a real word leads — `Kısa bir bıçak; kaba odun kullanılarak
yapılmış, …` — with the slot still bare, because Turkish cannot suffix a slot.

**Three checks and a corrected test.**

`text_to_sleep` joined the locations scan, bringing its 4 ids under the check that
would have caught the raw interpolation in the first place. A dialogue
display-name check requires a `name <key>` row for all 15 dialogues plus the two
variants the "suspicious man" returns from its own `getName`, since those are
chosen by arbitrary logic rather than declared as a field. A trader check does the
same for all 7 traders, keyed on `display_name` and not the registry key: two
traders deliberately share a shown name while keeping separate keys and
inventories, and one has a `name` field that differs from its key outright.

That distinction is worth recording, because I got it wrong first: keyed on the
registry key, the scan reported three traders missing Turkish rows. All seven
resolve. `suspicious trader 2` shows as `suspicious trader`, `swampland trader 2`
as `swampland trader`, and `nekomimi trader`'s `name` field reads
`nekomimi cafe trader`. Checking the wrong field invents gaps and hides the real
one.

The existing slot-suffix test asserted the Turkish description `startsWith` the
material, which conflated "the slot takes no suffix" with "the slot comes first"
— so it failed the moment the slot moved for the capitalisation fix. Rewritten to
assert the invariant it meant, position-independent, and paired with a new one
that fails if a component description opens with `{material}` again. Both
negative-tested, across all four descriptions rather than the one. `npm test` went
from 63 checks to 70.

2593 keys per language; `check` at 1282 content ids, 17 dialogue names and 7
trader names.

### The in-game changelog is now part of the record, and got a rebuild

**New standing rule.** Every entry in this file gets a matching player-facing
entry in both `changelog.html` and `changelog.tr.html`, in the same change.
Story content and new areas get their own minor version heading — 0.6.1, 0.6.2 —
rather than being folded into an existing one. This reverses the note that used
to sit at the top of this file calling the two records "deliberately separate";
they are still separate in *audience*, developer depth here and a player's
account there, but no longer in scope.

`npm run check` enforces it rather than trusting anyone to remember: both HTML
files must hold a heading whose version matches `game_version`. A release that
bumps the version and forgets the entry now fails the build instead of shipping a
game whose own changelog does not mention it. Section 6 of
[AGENTS.md](AGENTS.md) went from three places to four for the same reason.

**The version is now `v0.6.0`.** `src/game_version.js` said `v0.6` while
`package.json` said `0.6.0`; three segments is also what minor story bumps need.
`compare_game_version` pads the shorter side with zeroes, so `v0.6` in an existing
save still compares equal to `v0.6.0` and no migration is involved.

**Both changelog pages were rebuilt from the shell inward.** The old markup put
`<head>` *inside* `<body>`, carried no charset and no viewport, and styled a
light-only page with a one-line instruction where a header belonged. All 1114
lines of entries were carried over verbatim — verified by diffing the entry text
against a backup, 0 lines lost, all 20 spoiler spans intact — and only the `v0.6`
heading was renamed and its body extended.

What is new: a valid document with `<meta charset="utf-8">`, a real header with
the current version and an expand-all control, one card per version with a drawn
chevron, light and dark palettes through `prefers-color-scheme`, `pre-wrap` so a
phone does not scroll sideways, `aria-expanded` on the disclosures, the newest
release unfolded on arrival, and `#v0.5.5`-style deep links that open the release
they point at. Spoilers now reveal on click as well as hover, because hover does
not exist on a touchscreen.

The missing charset was not cosmetic. `changelog.tr.html`, `help.tr.html` and
their English counterparts all lacked one. GitHub Pages sends `charset=utf-8` so
the live site was fine, but every local `file://` open decoded the Turkish as
mojibake. All four pages have it now.

**Two dead version displays, fixed properly.** The changelogs loaded
`src/game_version.js` as a module and the help pages held a
`<span class="game_version">` for it to fill. Neither worked: `src/` is not
deployed, so that script was a 404 on the live site — confirmed — and nothing
filled the span in the first place. `scripts/build-site.js` now stamps the span in
the `_site/` copies, asserting it finds exactly one per page, and `npm run check`
verifies the stamp landed. The repository copies keep a readable literal so the
pages still make sense opened from disk. The dead script tag is gone.

The Turkish changelog's own header still read "Click on blocks to unfold their
content" — the one string in that file the earlier translation pass missed,
because it sat in the page shell rather than in an entry.

**A correction.** I reported `compare_game_version` as carrying a real bug: its
`if(Number.parseInt(a[i]) && Number.parseInt(b[i]))` guard is falsy for a `"0"`
segment, which drops the comparison to strings. That much is true, and it looks
wrong. It is not: `"0"` is the lexicographically smallest digit string, so every
case that reaches the string branch has a zero on one side and compares correctly
anyway. Checked across `v0.6.0`/`v0.6.10` in both directions, `v0.6`/`v0.6.0`,
`v0.6.9`/`v0.6.10` and `v0.10.0`/`v0.9.0` before touching it — and then not
touching it. The guard is fragile-looking rather than broken.

Three new checks in total this session, all negative-tested in both directions:
the changelog-covers-version pair, the version-span stamp, and the
build-side assertion that each page holds exactly one span.

### Fixed the hero creation panel keeping its original language

**Reported from the game.** Switching to Turkish while creating a character
translated the confirm button but left the race names and their tooltips in
English.

The two behave differently because they are reached differently. The confirm
button is markup carrying `data-translation`, so `translateUI` rewrites it. The
race buttons are built in JavaScript by `characterCreator.fill_creation_panel`,
which resolves each name and tooltip through `getText` once and appends finished
DOM. Nothing carries an id afterwards, so `translateUI` has nothing to walk and
the text keeps whatever language it was built in.

Which, on a new game, is always the default. `fill_creation_panel` runs during
startup — before the player has reached the options panel at all — so the panel is
built in English every single time, and the one screen where a player would
naturally set their language is the one screen that ignored the setting.

**The fix is a repaint, not a rebuild.** `option_language` already had this
problem once and solved it for the bio panel with a `fill_character_bio()` call
and a comment saying nothing else redraws it. The creation panel needed the same
treatment, so `characterCreator.refresh_language()` joins it there.

Re-running `fill_creation_panel` would have been wrong twice over: it writes the
name field from `character.name`, discarding whatever the player has typed, and
it attaches the confirmation click listener, so a second call would confirm hero
creation twice. `refresh_language` rebuilds only the race buttons and, if
`config.use_height_bonuses` is on, the height tooltips.

Two details that are easy to get wrong. The current selection is read back from
the DOM rather than from `this.race`, because the default race starts out marked
active without a click and `this.race` stays empty until the player picks
something — restoring from the field would silently reset the choice for anyone
who had not clicked. And the queries are scoped to
`hero_creation_panel_race_selection` rather than the document: the three category
labels are siblings of the buttons, they carry `data-translation`, and
`translateUI` has already dealt with them.

Tooltip positioning survives the rebuild because `index.html` registers the
*container* in `elements_with_restricted_tooltips` and dispatches on
`event.target`, not the individual buttons — replacing children changes nothing it
depends on.

**Two checks, both negative-tested.** `option_language` must call `translateUI`
and every repaint in a `language_switch_repaints` list; adding another
imperatively built panel means adding its repaint there. This failure mode is
silent by construction — the panel looks fine, in the wrong language — so nothing
else would have caught it.

`src/races.js` also joined the content-id scan, which it had never been part of.
Its `name`, `alternative_name`, `description` and `gameplay_description` fields
hold text ids rather than English, and a typo in one of them renders as the
`text not found` placeholder inside a hero creation tooltip: a screen the player
sees once, only on a new game, only on hover. 24 ids came under the check, taking
it from 1254 to 1278. All 24 already resolved in both locales, so the race text
itself was never the problem — the repaint was.

### Wired the static interface labels in index.html

The interface had two kinds of text. Labels painted by `src/display.js` went
through `getText` in the earlier passes and were already translated. Labels
written literally into `index.html` were not reached by any of that: they are
translated only if they carry a `data-translation` attribute, because
`translateUI` walks exactly those elements and sets `innerText` from the id. 34
elements carried one; the rest were hard-coded English on every screen the player
opens.

97 attributes now, 89 distinct ids. 63 labels were wired: 52 needed a new locale
row, and 11 could point at an id that already existed — the seven crafting
category tabs are the skill names `name Tinkering` and friends, spelled the same
way in both places, so giving them their own copies would have created two
strings that must never disagree. Covered: the panel tabs (Combat, Quests,
Bestiary, Anthology, Data), the trade panel, the crafting category and subpage
tabs, all ten stat labels with their ten tooltips, the AP label and its tooltip,
the equipment slots, Save / Export / Import, the sixteen options rows and the hard
reset. 2537 keys per language became 2589.

**`translateUI` sets `innerText`, which decides what can be wired at all.** It
replaces the element's entire content, so an element can only carry the attribute
if the label *is* all of it. Two buttons hold a nested tooltip div beside their
text; wiring the button itself would have deleted the tooltip on the first
language switch, so the label got its own `<span>` and the attribute went there.

**Four visible strings are deliberately left in English.** `Yet Another Idle RPG`
is the game's name. `Normal stance` is not static text at all — `display.js`
overwrites it with `stance.getName()`, and the id would win only until the first
redraw. The two save-slot buttons are the interesting case: their text is written
at runtime with a date appended, so a `data-translation` id would let a language
change replace a live dated value with a stale static label. For the import button
the markup text is never on screen, because `update_other_save_load_button` always
writes over it. The backup button is not clean yet: its no-backup branch sets
styles and returns without setting any text, so the English placeholder is exactly
what a player with no autosave reads. That one is a real leftover, fixed next, and
it belongs to `display.js` rather than to the markup.

**The duplicate-key check earned itself back.** `ui label defense` already held
"Defense" for the item tooltip, which appends its own colon; the stat panel's
label is "Defense:" with the colon baked in. Reusing the id looked right and
would have made one of the two silently wrong in both languages, in a way no test
asserts and both readings look plausible on screen. The panel label is
`ui stat label defense`.

One bug worth naming, because the failure was silent. The wiring script inserted
the attribute with `open_tag.replace(/>$/, ...)` while several tags were passed
with a trailing space, so the regex never matched — it stripped the label text and
added no attribute, blanking 15 labels. Inserting before the last `>` instead
fixes it, but the lesson is that the script had no assertion: it reported success
for tags it had not touched. `index.html` was restored from a backup and rerun.

### Untracked `dist/`

**Nothing was reading the committed bundle.** The deploy workflow runs
`npm ci && npm run build` before it uploads `_site/`, so every published bundle
has always been the one CI just built — the committed copy was never served. The
repository root is the dev entry point and its `index.html` loads `src/main.js`,
so a fresh clone runs the game with no build and no `dist/` at all. And nothing
compared the committed bundle against `src/`: `npm run check` validates `_site/`,
which the build had just written, so a bundle left stale for twenty commits would
have passed every check.

So it was a 4 MB artefact — 1.1 MB bundle plus a 2.9 MB sourcemap — re-diffed on
every content change, across 121 commits, that no consumer had. Worse, it was a
standing trap: the one failure mode it *could* produce was committing source
without rebuilding, which no check would catch and which the untracked version
makes structurally impossible.

**What changed is only the tracking.** `npm run build` is untouched: esbuild still
writes `dist/bundle.js` first, and `build-site.js` still copies `dist/` into
`_site/` via `static_dirs`, which is how `_site/dist/bundle.js` gets there. What
went away is the `.gitattributes` pair that kept the blob out of diffs and out of
GitHub's language statistics — inert once the path is ignored.

Six comments asserted the old arrangement and would have become lies:
`.gitignore`, `.gitattributes`, the `build-site.js` header, the deploy workflow's
artifact step, both READMEs' file tables, and both `docs/AGENTS` halves. All
corrected in the same change. The `docs/AGENTS` bullet that said "is committed,
marked `-diff linguist-generated`" now says the opposite and gained a second
bullet: the build still has to be *run* before `npm run check`, because check
reads `_site/` and a stale `_site/` means validating the previous change.

This settles PROPOSALS Q-5, which had been left open specifically because
`.gitattributes` and the site builder were written assuming it stayed tracked.
Both were the easy half; the reason to act was that nothing consumed it.

`build.js` — the pre-fork builder, bound to no npm script and superseded by
`scripts/build-site.js` — still sits in the root writing to the same output path
and rewriting the tracked root `index.html` in place. Left alone here rather than
quietly deleted in an unrelated change; it is now the only file in the repository
that treats `dist/` as something to preserve.

## 2026-08-21

### Fixed the "text not found" startup text, and gated the visitor counter

**The bug.** `src/main.js` renders player-facing text all the way through its startup
sequence - the loading-screen version block, the whole of `load()`, the new-game
setup - and only reached `await translationManager.init(language)` at the very end of
it. The locales were fetched by dynamic `import()`, so `translations` was empty for
every one of those lookups and `getText` returned its own `"text not found, id: X"`
placeholder. That is what the reported screenshot showed.

It was much wider than the three ids in the screenshot. On the load path roughly 240
lookups fired before init; on a fresh game the purse, the Village description, the
Talk dropdown, the quest panel and the message log's first line were all
placeholders. Not Turkish-only either: `language` starts as english and the map is
empty for english too. And these do not heal, because `translateUI` only rewrites
elements carrying `data-translation` while `load()` paints all of the above
imperatively - they stayed broken until each panel happened to redraw.

**The fix is one mechanism, not an ordering change.** `src/translation.js` now
imports both locales statically and seeds `translations` at module evaluation.
Because `translation.js` is evaluated before `main.js`'s body, every pre-init lookup
resolves, and the placeholder branch is structurally unreachable for any id a locale
contains. `init()` stays exactly where it is - it is now a no-op for a bundled locale
and its comment says so, since it is still the only path for a future locale that is
not bundled, and the language selector still calls it.

Reordering the startup was considered and rejected. With both locales resident there
is no ordering left to fix, and two categories cannot be fixed by reordering at all:
the `process_rewards` log lines, because `log_message` keeps no backing array to
repaint from, and `load()`'s transient progress messages, which are overwritten
before any deferred pass could run.

**Three things hardened while here.**

The save's `language` read moved to `load()`'s first statement. Today nothing resolved
text before it, but only by a 3856-vs-3940 margin - one render call inserted between
them would have silently reintroduced a wrong-language screen. It also removes a
latent bug: a `load()` that threw before the read left `language` at english, and the
save writer then persisted that downgrade.

The missing-translation warning is now guarded on the language actually being loaded.
`reported_missing` is never cleared and is shared by the warn and error paths, so one
lookup made while a locale was absent permanently silenced the genuine "not
translated into 'turkish' yet" diagnostic for that id.

`npm run check` grew two assertions: every locale must be statically imported and
listed in `bundled_locales`, and every language `main.js` offers must be one of them -
otherwise the warn guard above would quietly become a silent-English mechanism the
first time someone added a language without bundling it. Both negative-tested in
both directions. The `src/main.js` id scan also widened from `log ` to `log |ui `,
which brought 11 previously unscanned ids under the check.

`npm test` gained four checks that fail on the shipped code and pass after the fix -
they were used to reproduce the bug before touching anything, and they print the two
ids from the screenshot verbatim.

**The visitor counter is off.** Gated behind a new `config.show_visitor_counter`,
default false, with the whole block skipped rather than the image hidden. CSS was the
wrong tool: the `<img>` src *is* the counter, so `display: none` would have left every
page view still incrementing a public counter and pinging a third party while showing
nothing - the opposite of hiding it.

**A correction worth recording.** An audit agent reported that the new-game starting
inventory throws because `item_templates["Cheap leather pants"]` sits inside a
commented-out block, and I repeated that before checking it properly. It is wrong
twice over: `dist/bundle.js` is minified, so grepping it for `item_templates[...]` is
a guaranteed false negative, and the template is *generated* at runtime -
`cheap leather` plus the `leg armor interior` type, which `type_to_name` renders as
`pants`. The hand-written copy is commented out precisely because the generator
replaced it. Un-commenting it would have created a duplicate template under a key
that is save data.

2537 keys per language; check at 1254 content ids; test at 63 checks.

### The last of the English is gone — P-7

**Nothing player-facing is written in code any more.** The final sweep covered the
interface labels in `display.js` that the earlier passes had left: the readouts
that wrap a value rather than standing alone, the equipment slot names, the
location-type base values and the crafting component picker. Plus the last four in
`main.js`: the two flag unlock messages, the default location unlock message, and
the one that reads "If you see this, Miktaew screwed something up" - which a
Turkish player would previously have seen in English at the exact moment something
had gone wrong.

Two things caught while finishing:

- Two migrated sites were plain double-quoted strings rather than template
  literals, so the inserted `${...}` was inert and broke the parse. An
  interpolation is only an interpolation inside backticks.
- `"Unlocked location \"{v1}\""` needs its inner quotes escaped in the locale file,
  and the splice script's own assertion caught it before it shipped - the same
  check that has been guarding every batch.

**Where the count landed.** 2536 keys per language, from 837 when this began. The
checks grew with it: `npm run check` verifies 1242 content ids resolve, that the
203 generated items still assemble to their own registry keys, that no locale has
an unknown key, and that the site layout is deployable; `npm test` is at 59 checks
including the two locale invariants - `%HeroName%` survives translation, and every
locale carries the same `{slots}` as the reference.

The known-gaps section of [I18N.md](I18N.md) has been rewritten: it no longer
lists work to do, only the four places that are structurally awkward and why.

### 203 generated items can be named now — P-7

**A whole category of item that was invisible to the locale.** `src/items.js` looks
like it holds the game's items, and the earlier pass translated the 245 it declares.
It does not hold them all. `src/crafting_component_filling.js` builds another 203 at
load time, one per material per component type — every blade, handle, shield base,
armor interior and armor exterior in the game. Their names and descriptions are
assembled from string templates, so there was no literal anywhere for a locale row
to key on.

It also explains something that looked odd in the previous pass: `items.js` carries
a ~580 line commented-out block of hand-written components, plus several smaller
ones. That is the old version of what the generator now produces.

**Parameterised text.** `getText` takes an optional params object and substitutes
`{slot}` placeholders. A slot with no value is left written out rather than blanked
— a broken pattern should be visible on screen, not silently short a word. Params
are always text ids, resolved through `resolveParams`, so there is one convention
and no call site can accidentally pass a pre-translated string.

`assembleName` builds a name from parts and puts them into **the language's own
pattern**. Turkish happens to share English word order here, because a material
name works as an attributive with no suffix — but the indirection is the point: a
language that needs the other order edits `pattern component name` and nothing
else.

**Two things had to be got exactly right.**

The first is that the assembled English must come out byte-identical to the
registry key. `item_templates` keys are written into save files, so a careless edit
to a pattern row would rename items on screen while the save still holds the old
key. `npm run check` now runs the real generator with stubbed item classes and
verifies all 196 assembled names and 98 equippable names against their keys.
Verified by reversing `pattern component name` to `{type} {material}`, which fails
with 196 mismatches, and by deleting one material row, which fails with 8.

The second is that a material has **two** English forms and they are not
interchangeable. A name uses `material.name` where the material defines one, so
`rough wood` shows as `simple wooden`; a description uses the raw key and says
"made of rough wood". They differ for five materials. Getting this wrong renames
items rather than mistranslating them, so the two forms live in separate id
namespaces, `material name <key>` and `material <key>`, and a test pins both.

**Turkish cannot suffix a slot.** The English description reads "A short blade made
of {material}". The direct Turkish would be "{material}dan yapılmış" — except the
ablative is -dan, -den, -tan or -ten depending on the material's last vowel and
consonant, so `demirden` but `çelikten` and `ketenden`. A slot cannot carry that.
The pattern is therefore built so the slot stays bare: "{material} kullanılarak
yapılmış kısa bir bıçak". A test asserts the slot is unsuffixed, because this is
exactly the sort of phrasing someone later "improves" into being wrong.

The same constraint shaped the material names themselves. English assembles
"iron chainmail" plus the piece word "armor" into "Iron chainmail armor". Turkish
for chainmail is "zincir zırh", which already contains the piece word — so the
material's name form is "demir zincir" and its description form is "demir zincir
zırh". Otherwise every chainmail armor would have read "Demir zincir zırh zırh".

**Capitalisation is locale-aware.** An assembled name is capitalised with
`toLocaleUpperCase`, because Turkish upper-cases a dotless i to I and a dotted i to
İ. A plain `toUpperCase()` would put the wrong one at the front of an item name,
which is the first character a player reads.

The seven components with a `custom_names` entry — `Wool shirt`, `Linen bandanna`
and friends — get no parts, because their English is not "<material> <type>" at
all. They fall through to their own `name <English>` row, which the previous pass
already wrote.

96 new locale keys per language, covering 203 generated items, 13 shield names, 85
full armor names and every craftable weapon. Turkish stays at 100% over 1459 keys,
and `npm test` is at 56 checks.

### The swamp cast is finished, and the Turkish locale is complete — P-7

**907 of 907 keys.** The last gap was three dialogue trees — the cook at 111 keys,
the tailor at 32, the scout at 32 — and with them in, `npm run check` reports
100.0% coverage with nothing missing and no unknown keys.

**What "broken speech" has to become in Turkish.** The cook is the only one in the
camp who speaks broken English, and the brokenness is specific: missing articles,
a dropped copula ("It good place to go"), telegraphic exclamations. Turkish has no
articles and drops the copula as a matter of course, so translating those markers
literally produces perfectly ordinary Turkish — the character would simply
disappear. The equivalent markers are different ones: dropped person agreement on
verbs (`yardım eder` where the sentence needs `yardım ederim`), and bare nouns
where a case suffix is obligatory. Applied at one or two per line, which is enough
to hear a foreigner and not enough to become a chore to read.

He drops it in exactly one place, and the English does too. In `whycrabpress answ`
the laughter stops, and his grammar is suddenly clean. That is the scene: the
laughing is a choice, not a limitation. The Turkish is clean there too.

**A collision worth recording.** The tribe's motif is "sharpen the snake's fangs",
and `bilemek` is the right verb for it — except that `bile-` plus `-iyor` collapses
to `biliyor`, which is the verb *to know*. In a tree whose whole subject is knowing
the tribe before you can help it, that is not a harmless ambiguity. Every other
form is safe, so the one line that needed the present continuous reads
`bileyip duruyorsun` instead. Recorded in [I18N.md](I18N.md) so it does not have to
be rediscovered.

**The tailor's fragments.** His winge loop is eight lines that are each cut off
mid-clause at both ends — `-boil the linen, he says, as if that'll-`. Turkish word
order puts different material at the cut points, so translating the English
fragment gives a fragment that breaks in the wrong place, or worse, a complete
sentence. The English comments record the full sentence each fragment came from;
the Turkish is cut from the Turkish of that sentence instead. Every fragment still
starts and ends mid-thought, which was the whole effect.

**The scout's ellipses are breath, not punctuation.** They fall in awkward places
in the English on purpose — `the brother... to our last chieftan's bondmate`. Word
order moves in Turkish, so keeping them at the same words was not possible; moving
them to natural clause breaks was, and would have quietly healed her. They are
placed at points that are equally awkward in Turkish.

**Three trees, one story.** The tanner is making armour for someone, the tailor
needs flax for bandages, and the scout is the one in the cot with a leg missing and
the smell of rot getting stronger. Those trees were translated days apart, so the
terminology had to be reconciled across them: `den kin` is `in halkı` because the
chief already says it that way in his own tree; the chief is `şef` throughout, even
where the English wanders between "chief" and "chieftan"; the tanner's `beş düzine`
and the cook's `üç kere yirmi` are both kept because the contrast is the
characterisation. This is the "nothing below may contradict what is above it"
rule at the scale of a whole camp rather than a single screen.

**Address register.** The hero uses `siz` to the tailor and `sen` to the scout. The
tailor is neither elderly nor a chief, but he is a stranger the hero has just
startled out of his skin, and Turkish uses `siz` there; the asymmetry against his
own `sen` also carries how rude he is at first and what it costs him to apologise
later. The scout is a peer of the hero's age who calls them potential den kin, so
`sen` runs both ways.

**A test that only passed while the work was unfinished.** The fallback check
picked the first still-untranslated id at runtime, and the comment above it said
this was so that translating more text could not make the check stale. That was
exactly backwards: at full coverage there is no untranslated id, the check found
nothing, and three assertions failed. The gap is now planted rather than
discovered — an English-only fixture id, so the check tests the fallback instead of
the size of the backlog. 48 checks pass.

Coverage 80.7% to **100.0%**.

### Enemies, stances and the location menu speak Turkish — P-7

31 enemy descriptions, 32 enemy names, 2 stance descriptions and the 9
location-choice dropdown labels moved behind ids. `Enemy.getName()` and
`Enemy.getDescription()` resolve them, so `enemy_templates` keys — which are save
data — stay English.

**A regression I caused two entries ago and caught here.**
`Stance.getDescription()` fell back to `skills[this.related_skill].description` for
a stance without its own text. That read the raw field, which was fine until the
skill descriptions moved behind ids — after which 5 of the 7 stances would have
rendered the literal string `desc skill Heavy strike` on screen. It now calls the
skill's own `getDescription()`. Worth noting how it hid: the two stances with their
own descriptions are the two the eye lands on first.

Four enemies carry an empty description in the source — the two sparring guards,
the suspicious wall and the suspicious man. They keep it empty. Giving them ids
that resolve to nothing would have added four permanent holes to every locale's
coverage figure in exchange for nothing on screen.

**On the translations.** `Direwolf` is `Ulukurt`: a coined compound rather than the
literal `korkunç kurt`, because it has to sit in a list next to `Kurt`, `Genç kurt`
and `Aç kurt` and read as a tier above them at a glance. `Warthog` is
`Bakla domuzu`, the actual Turkish species name, which also keeps the `domuz`
pairing with `Boar` → `Yaban domuzu` that the near-identical English descriptions
set up. `Snapping turtle` is `Yılanbaşlı kaplumbağa`, the genuine Turkish name, in
preference to a calque on "snapping". The MGS3 gag survives as
`Graa~! Yengeç savaşı!`, and the giant crab's biggest-and-smallest joke keeps its
shape rather than its wording.

Coverage 72.8% to 80.7%, against a reference that grew to 907 keys.

---
## 2026-08-19

### Two audits before anything was changed — P-1

The work started by reading rather than editing: a technical audit of the
architecture, content layer, i18n readiness and fork divergence, and a narrative
discovery pass over the story spine, the open hooks, the orphaned content, the NPC
arcs and the progression systems. Neither produced a change on its own. What they
produced was the list everything below came from: the README rewrite, the
localisation, the NaN warnings and the continuation of the story are all findings
from these two passes rather than ideas had afterwards.


### Inventoried the hardcoded text, and moved the skill descriptions — P-7

**First, the size of what is left.** A scan of `src/` for player-facing text that is
still written in code, classified by whether the value is already a text id:

| Category | Count |
| --- | --- |
| Display names — items 138, recipes 131, locations 108, enemies 32, activities 15, traders 7 | 431 |
| Descriptions — items 196, locations 108, skills 64, effects 47, activities ~30, other ~40 | ~485 |
| Location action text — starting, success, custom, unlock, leave | ~244 |
| **Remaining** | **~1160** |

The raw grep says 1567 field declarations, but that overcounts badly: 195 of the
`name:` declarations in `dialogues.js` are Textline **ids** such as `"elder hello"`,
already migrated. The number above is after testing each value against the locale
keys, which is the only test that actually distinguishes an id from raw text.

So this is a multi-session job, not a single pass. It is now measured rather than
guessed at.

**Skill descriptions are done: 64 of them, moved rather than copied.** `src/skills.js`
now holds `description: "desc skill <id>"` and the English text lives in
`locales/english.js`. Copying it would have left the same paragraph in two files with
nothing keeping them in step; moving it means one source of truth, which is also what
was asked for.

The id shape is `"desc <kind> <registry id>"`, keyed by the id rather than by the
English string — unlike the `"name <English>"` namespace. A description is a
paragraph, and a paragraph makes a poor key; the id is also stable when the English
gets reworded. `Skill.getDescription()` resolves it, and the one place that read
`skill.description` now calls that.

`npm run check` covers them: 108 content text ids declared, all resolving. Verified by
planting a typo, which fails the build.

**A bug I have now hit three times, and finally closed.** Writing a regex with `\b`
through a shell heredoc corrupts it: the escape arrives in the file as a literal
backspace byte, so the pattern silently matches a control character and finds nothing.
It cost real time on the first occurrence, was diagnosed by hex-dumping the line, and
recurred twice more. Anchoring on the start of a line fixed the corruption but broke
inline declarations such as `new QuestTask({task_description: "..."})`, where the
field is not at a line start — which showed up as the check counting 77 ids instead of
108. The patterns now use an explicit `(?<![A-Za-z0-9_])` lookbehind: a word boundary
written out longhand, using no escape a shell can mangle. The fix script also asserts
no control bytes survive.

**Two source defects found while reading the descriptions**, reported rather than
quietly fixed, since inventing description text would contradict the standing rule
about not rewriting the original:

- `Flowing water` and `Berserker's stride` carry **byte-identical** descriptions — a
  copy-paste. Flowing water is described as a style that "completely ignores own
  defense", which contradicts both its name and the defensive-mobility role its stats
  suggest. The Turkish is faithful to the English, so the duplication is visible in
  both languages until the English is rewritten.
- `Gathering mastery` says "with enough practice you being to see some commonalities" —
  "being" should be "begin". The Turkish carries the intended meaning.

**On translating them.** These are tooltip texts: informative, but they carry the
game's wry voice, and flattening that would have been the easy mistake. "Don't look at
the sun, it's bad for your eyes" stays a shrug. "Why bother trying to cut someone,
when you can just crack all their bones?" keeps its cheer. "Making the inedible
edible" is "Yenmeyeni yenilebilir kılmak", which has the same shape as the English.
The `<br>` tag inside the Wide swing description is preserved exactly.

Coverage 77.4% to **79.1%**, against a reference that grew to 837 keys as the
descriptions moved in.

### The elder is finished, and the swamp has two voices — P-7

72 more ids: the village elder's remaining 34, the swampland chief's 20, the
tanner's 18. Coverage 68.0% to **77.4%**.

**The elder was finished first on purpose.** A half-translated NPC is the worst
state to leave a conversation in, because the register and the voice break in the
middle of it. What remained was the substantial half: the village expansion arc, the
crab rumours, the guard's backstory, and the amulet he gives away — including the
line `STORY.md` quotes as canon, *"Many leave looking for better lives and we never
hear from them again"*, and his blessing speech, which ends on the hero always having
a home in the village. Those two carry weight and a flat rendering would have cost
more than a wrong word.

**I had the swamp cast wrong.** I had been saying the swampland NPCs speak broken
English and that the translation would need to reproduce the breakage. That is true
of the cook. It is the opposite of true for the chief, who speaks in an elevated,
ceremonious, martial register: *"How bold of you to walk so brashly through our
grounds"*, *"no quarter to give"*, *"pay fealty to our strength"*, *"honored friend"*,
*"den kin"*. Translating him as broken speech would have destroyed the character. The
Turkish uses a slightly archaic register with inverted word order where the English
inverts, without tipping into pastiche.

The tanner is a third voice again: elderly, weary, protective, with `shan't`,
`need not` and `I know not how`. Two decisions there:

- **`child` as a form of address is `evladım`, not `çocuk`.** An elder calling a young
  person `çocuk` in Turkish is dismissive; `evladım` carries the affection-plus-
  authority the English has.
- **She counts in dozens where the hero counts in sixties.** She says "five dozen
  alligators"; the hero replies "the 60 alligator skins". That is a register marker
  rather than sloppiness, so the Turkish keeps `beş düzine` from her and `60` from the
  hero.

### A correction to my own register map

`STORY.md` grouped the entire swampland cast as informally addressed. That was too
coarse, and translating the tanner exposed it: she is elderly, and the player's own
opening line to her is *"Excuse me, are you the leatherworker?"* — plainly
deferential. She has moved to the formal group and the table now says so.

The rule that follows is worth having written down: where the register map and the
source text disagree, the source text wins and the map gets corrected. The map is a
summary of the writing, not a constraint on it.

### Every skill name is Turkish — P-7

74 skill rank names, on top of the 30 stance and NPC names. Coverage 64.7% to
**68.0%**; the English reference grew to 773 keys because each name is listed there
too, so a typo in a translated key fails the build instead of silently falling back.

**The rank ladder is the real work here.** Skills show a different name at different
levels — `names: {0: "Beginner gatherer", 10: "Apprentice gatherer", 25: "Adept
gatherer", 35: "Expert gatherer", 50: "Master gatherer"}` — and the same adjectives
recur across skills, so they had to map to one Turkish ladder applied without
variation. The ladder chosen is **Acemi → Çırak → Kalfa → Uzman → Usta**, which is the
actual historical Turkish craft hierarchy rather than a set of translated adjectives. A
player reads it as a guild rank, which is what it is.

The other repeated terms were fixed the same way: `proficiency` → yetkinliği and
`mastery` → ustalığı across all three weapon/crafting/stance pairs; `killer` → avcısı
against `slayer` → kıyıcısı, kept distinct in both the Pest and Giant families;
`resistance` → direnci, matching the stat labels already shipped; `X combat` → X
dövüşü, `-manship` → kullanımı, `casting` → büyücülüğü.

**Two decisions I checked against the source myself rather than taking on trust**,
because both are exactly the kind of call a literal pass gets wrong:

- **Brawling → "Sokak kavgası"**, not "Sokak dövüşü". `skills["Unarmed"]` turns out to
  carry `names: {0: "Unarmed", 10: "Brawling", 20: "Martial arts"}`, so Brawling is the
  middle rung of a ladder whose top is Martial arts. In Turkish `dövüş` is the
  disciplined word — it is why Combat is Dövüş and Martial arts is Dövüş sanatları —
  while `kavga` is what an actual brawl is. Using `kavga` places the middle rung
  correctly *below* discipline, and stops `dövüş` appearing in a seventh name.
- **Wooden skin → "Tahta deri"**, not "Ahşap deri". The skill is `skills["Iron skin"]`
  with `names: {0: "Tough skin", 10: "Wooden skin", 20: "Stone skin", 30: "Iron skin"}`
  and a description about the hero's own skin toughening from repeated damage. So it is
  a hardness comparison, not a material: `tahta` is the everyday one (*tahta gibi
  sertleşmek*), while `ahşap` means worked timber and is therefore right for
  Woodworking and wrong here. The wood family ends up three-way by necessity — `odun`
  for felled logs, `ahşap` for worked timber, `tahta` for the hardness — which is
  correct rather than inconsistent.

Both hold up. The ladder reads **Sert → Tahta → Taş → Demir deri**.

The six skill names that shadow a stance were delivered by the same pass and verified
byte for byte against the forms already in the file before being dropped as
duplicates, so the stance button and the skill row cannot disagree.

One name is longer than I would like: Scrambling became "Engebeli arazi hareketi",
which is accurate to its description — acting quickly and with secure footing on rough
or unstable ground — but wordy for a list label. Left as is, since accuracy won, and
noted in case it grates in play.

### Display names can be translated now — P-7

Translating the village guard's dialogue created a mismatch: she explains "hızlı
adımlar" while the button she is talking about still reads "Quick Steps". This closes
that, and gives every other kind of name the same mechanism.

**Why the names could not simply be translated in place.** A registry entry carries
its English name in code, and for items that name is also bound up with identity —
`this.id = this.getName()` runs in several constructors and the id is what a save file
holds. So the design keeps the English as canonical and puts the translation on top:
`getDisplayName(language, english)` looks up `"name <English>"` and hands back the
English unchanged when there is no entry. Nothing can be lost, and no locale needs to
list every name before the feature works.

`getOptionalText` is the general form of that: the active language only, no fallback
to the default and no `"text not found"` placeholder. That distinction is the whole
point — `getText` must always produce something displayable, while a display name
already has a perfectly good English fallback in hand.

**One flat namespace for every kind of name.** Skills, stances, NPCs and later items
all use `"name <exact English string>"`. Three id schemes for three registries would
have been three things to remember.

Wired up: `Skill.name()` (its canonical form is now `english_name()`, which still
picks the rank name by level), a new `Stance.getName()` and its five call sites, and
the NPC caption above a conversation.

**A trap worth recording.** Six stance names differ from their same-named skill only
in capitalisation — `"Quick Steps"` the stance against `"Quick steps"` the skill. The
namespace is case sensitive, so both spellings need an entry or the button and the
skill row disagree. Both are present and a test asserts they resolve to the same
Turkish. Harmonising the casing in `src/` would remove the duplication and is safe —
skill names are not ids — but that is a separate change.

**The English locale lists the names too, and that is deliberate.** The fallback makes
those rows unnecessary for rendering. They exist so that a typo in another locale's key
becomes a build error: without them, `"name Quick Stesp"` would silently fall back to
English and nobody would ever notice.

**Skill sorting is locale aware.** It compared names with `>`, which orders by code
unit and puts every letter carrying a diacritic after `z`. The comparison now returns
from inside the name branch rather than falling through, because the other branches
compare numbers where `localeCompare` would be wrong.

30 names translated so far: the seven stances, the six skill names that shadow them,
fifteen NPCs and the suspicious man's two state-dependent nicknames. The stance names
were chosen to match what the guard already says in her dialogue. 49 checks.

Recorded while wiring this: an NPC's starting text is assembled as `"Talk to the "`
plus the name, so it cannot be localised until it becomes a parameterised template.

### The village and the slums speak Turkish — P-7

185 dialogue ids across five NPCs: the village guard, the two millers, the
suspicious man and the old woman of the slums, the old craftsman with the gate guard
and the café proprietress, and the farm supervisor. Coverage went from 35.4% to
**63.1%**.

Each NPC was translated as one context unit and then handed to a reviewer whose only
job was to assume the draft was machine-translation-flavoured and prove otherwise
line by line. That second pass earned its keep. What it caught:

- **A missing comparative.** "tarlada çalışmaktan iyi para getirir" has no `daha`,
  so it parses as "brings good money away from working the fields" rather than "pays
  better than". The line is an offer of employment; getting the comparison wrong
  inverts it.
- **A false friend.** "quick footwork" had become "ayaklarını çabuk tutmakla ilgili",
  but "ayağını çabuk tut" is Turkish for *hurry up*. The guard's explanation of a
  combat stance read as her telling the hero to get a move on.
- **A context-unit break, which is the subtlest one.** "I'm way too strong for you"
  had become "benim gücüm senin boyunu çok aşar". Beyond being off-idiom — "boyunu
  aşmak" collocates with a *task*, not with a person's strength — it activates a
  literal reading about height, in the one NPC who also has a line about the hero
  being too short to reach her head. The joke would have landed in the wrong place.
  Rebuilt on a Turkish combat idiom instead: "ben senin için fazla ağır sıkletim~".
- **"el idman"**, where `el` is a round of cards, not a round of sparring.
- **"kırılgan düşmanlar"**, which in Turkish reads as emotionally fragile.
- **Flatness.** "I know that from experience" rendered literally, where Turkish has a
  two-word idiom that does the same work: "tecrübeyle sabit".

The suspicious man is the one to read if you want to see what the rule about not
translating word-for-word actually buys. His stammer is written into the English with
hyphens — "Y-yes", "b-bad" — and the Turkish rebuilds it on Turkish words instead of
copying the English letters: "S-sen! Sen ölmüştün!", "k-kötü", "ç-çete". His "boss"
became "reis", which is what a frightened small-time crook would actually say.

Verified rather than assumed: every key matched the English side exactly, so
`npm run check` reported no unknown keys; no value is byte-identical to its English
counterpart at any length worth suspecting; and the four gate guard ids that already
existed were neither duplicated nor contradicted.

### Two source-side defects the translation exposed

**A speaker-tag bug in the English.** `mofu#millers kiss more answ` gives the third
line to `[Mouse]`, but the base variant gives it to `[Red]` — and the line is "You
heard him~", which can only be said by the one who did *not* just speak. As written,
the mouse tells the hero to heed the mouse. The English reads as nonsense too, not
just a translation of it. Fixed in the source.

**A duplicate-key check, because JavaScript will not give you one.** A repeated id in
an object literal is not an error: the last one silently wins, and by the time the
module is imported the earlier value is gone. `npm run check` compares key *sets*, so
it could never have seen it. It now scans the locale source text for repeated
declarations. Verified by planting one.

### What partial localisation has exposed

Worth stating plainly, because these are now visible rather than theoretical, and
they are recorded in `docs/I18N.md`:

- **Skill and stance names never reach `getText` at all.** `src/display.js` prints
  `stances[stance].name` directly and `Skill.name()` returns from the skill's own
  literal; there is no `getText` call for either anywhere in `src/`. So the guard now
  explains "hızlı adımlar" while the button still reads "Quick Steps". A consequence
  that follows: the nine entries in the `skills` locale section are consumed only by
  the racial bonus tooltips, so adding more of them changes nothing on screen.
- **An NPC's shown name is not localisable.** A dialogue's `name` field is the
  caption above the conversation, so a translated line about "kasaba çiftliklerinin
  sorumlusu" sits under a caption reading `farm supervisor`.
- **A player line that is only a stage direction has no addressee**, so a formal
  register cannot appear there at all. All three of the old woman's player-side ids
  are stage directions, which means the `siz` form her entry in `STORY.md` calls for
  has nowhere to be shown in any language.

### Three sorting and casing bugs the Turkish work exposed — P-7

None of these are translation. They are defects that only became visible once text
stopped being English, and two of them were already wrong in English.

**A comparator tier that was dead code twice over.** The crafting component sort
reads `a.item.item_name != b.item.item_name` — but items have no `item_name`
property, only `name` behind `getName()`. So the condition compared `undefined`
against `undefined`, was never true, and the entire name tier never ran. Had it run,
the body was `return b.item.item_name - b.item.item_name`, which is zero for numbers
and `NaN` for the strings these actually are. Components sorted by tier and then fell
straight through to quality. It now compares `getName()` with `localeCompare`.

**Inventory sorting was not safe for Turkish, in two separate ways.** It read the
rendered item name, lowercased it with plain `toLowerCase()`, and compared with `>`.
Plain case folding turns Turkish `İ` into an `i` followed by a combining dot rather
than a plain `i`, and a `>` comparison orders by code unit, which puts every letter
carrying a diacritic after `z`. Both are now locale aware.

**Capitalisation needed a distinction rather than a fix.** `capitalize_first_letter`
is applied to two different kinds of input: translated text in four places, and raw
English stat keys such as `attack_power` in about ten. Making it locale aware across
the board would have been wrong — Turkish maps `i` to `İ`, so a raw key would have
rendered as `İntuition`. It now takes an explicit `is_translated` flag, and only the
four translated call sites pass it. With Turkish active, `ırk` capitalises to `Irk`
and `istila` to `İstila`, while a raw key still yields `Intuition`.

Noted while tracing this: several equipment tooltips display raw stat keys with the
underscore swapped for a space rather than the translated stat name, so those lines
stay English regardless of the language. Routing them through the `stats` locale
section is a real improvement and a separate change.

### Quest text moved behind ids, and translated — P-7

Quest names, descriptions and task descriptions were written inline in
`src/quests.js`, which put them outside the translation system entirely. They are
now text ids, and the Turkish side is written. 62 new ids; coverage went from 26.2%
to 35.4%.

**The id shape is `quest <quest_id> [name | desc N | task N]`.** Three deliberate
choices in that:

- `<quest_id>` is the registry key, which is what the save file holds. It is never
  translated and never renamed — it only identifies the row in the locale.
- `desc N` is numbered in progress order, because eight of the eleven quests choose
  their description from how many tasks are finished. A single id per quest could
  not express that.
- `task N` is the task's index in `quest_tasks`, so an id cannot drift away from the
  task it belongs to. Hidden tasks have no description and therefore no id.

**The accessors already existed, which kept the change small.** `getQuestName` and
`getQuestDescription` were overridable options on the Quest class. Content now
returns an **id** from them, and thin wrappers resolve it, so all nine existing
callers — the quest panel, the sorting comparator, four log messages and the reward
processor's `source_name` — keep receiving displayable text without knowing the
translation layer exists.

`source_name` was worth checking before translating it: it is documented as being
for logging and there is a separate `source_id` for identity, so a translated value
is safe there.

**Quest sorting is locale aware now.** The comparator used `>` on the names, which
orders by code unit and puts every Turkish letter carrying a diacritic after "z". It
uses `localeCompare` with a tag from a new `language_tags` map, kept beside the
language registry so adding a language means editing one place.

**`rewards.messages` takes ids too.** Four content strings — three in
`src/locations.js`, one in `src/quests.js` — were the last player-facing text being
logged straight from a content file. The reward processor translates them now.

**A new CI check verifies the ids exist.** A typo in a declared id does not throw:
it renders as "text not found" in front of a player. `npm run check` scans
`quest_name`, `quest_description`, `task_description` and `rewards.messages` in the
content files and fails if any id is missing from the default locale. It strips block
comments first, so the documented template at the bottom of `src/quests.js` — which
now demonstrates the id convention rather than inline text — is not scanned. 44 ids
declared, all resolving; verified to fail on a deliberately introduced typo.

Finding that check's own bug took longer than writing it. It reported zero ids
scanned while the same regex found forty in isolation. The cause was in the file
rather than the logic: the word-boundary escapes had been written as literal
backspace bytes, so the patterns were looking for a control character before
`quest_name`. A hex dump of the line was what showed it.

**On the translation itself.** The quest names carry three things a literal pass
would lose. *It won't mill itself* is the "it won't do itself" idiom, which Turkish
has in the same construction, so it survives directly. *Ploughs to swords* inverts
the swords-into-ploughshares allusion, and Turkish carries the same allusion, so the
inversion reads the same way. *Giant Enemy Crab* is a 2006 meme and is deliberately
literal.

The hardest line is that quest's first description, which jokes about apostrophe
placement: crab nests, a crab's nest, some crabs' nest. That is a joke about English
possessives and cannot be carried word for word. Turkish possessive suffixes produce
exactly the same three readings, so the joke was rebuilt on those instead — dev
yengeç yuvaları, dev yengecin yuvası, dev yengeçlerin yuvası.

### The opening scene is Turkish, and the bundle stopped escaping it — P-7

**The village elder's whole arc is translated**, 46 ids: the amnesia scene, the
starting-weapon choice, the wolf rat quest, and every gate he keeps until the player
is allowed to leave. That is the first thing a new player reads. Coverage went from
21.3% to 28.8%.

Two decisions worth recording, because they are exactly what a machine translation
gets wrong:

- *"with nothing but pants"* is trousers, not underwear. The robbers took everything
  else, so the other reading is both wrong and absurd.
- *"Are wolf rats a big issue?" / "Oh yes, quite a big one. Not literally, no"* is a
  joke about size, not about severity. Translated literally the reply becomes a
  non-sequitur; the Turkish keeps "büyük bir sorun" and answers "boyut olarak değil",
  which lands the same way.

The register follows the map in STORY.md: the hero addresses the elder formally, the
elder answers informally. Both directions had to be held consistently across all 46
lines, which is the practical reason translation happens per NPC rather than per
string.

**esbuild was escaping every Turkish character.** Its default charset is ascii, so
each non-ASCII character became a six-byte `\uXXXX` escape where UTF-8 needs two. The
built bundle shrank by 2.3 KB on 175 keys alone, and it is greppable again. `charset:
"utf8"` is set explicitly; `index.html` already declares UTF-8, so nothing else had to
change. The saving scales with the remaining 432 keys.

**A test broke, correctly.** The fallback check named `"elder hello"` as its example
of an untranslated id - and then that id got translated. It now picks the first
still-missing id at runtime and compares against the English table, so translating
more text cannot make it stale again. 42 checks.

### Turkish is playable — P-7

Localisation moved to the front of the queue, and the language now works end to end.

**The enabler was a fallback.** `getText` returned `"text not found, id: X"` for any
id the active language lacked, with the author's own `//todo` sitting next to it. That
makes a partial locale unusable: a translation is either complete or the game is
covered in placeholders. `init` now also loads the default language whenever the
active one is not the default, and `getText` falls back to it, warning once per id.
So an untranslated line simply reads in English, and a translation can land
incrementally.

Lookup was also split out per language, which matters for the racial text variants: a
language that has the base text but no `mofu#` variant now answers with **its own**
base text instead of borrowing the other language's variant. Staying in the active
language matters more than getting the variant.

**The language is selectable.** `turkish` is registered in `languages`, with a
`language_names` map so each language names itself in its own language. The options
panel has a selector, built from the registry rather than hardcoded in HTML, so
adding a language needs no markup edit. The choice was already saved and restored
with the rest of the save data — that part existed and was simply never reachable.

The switch is live. `translateUI` updates the static chrome immediately; everything
else goes through `getText` when its panel is drawn, so it changes over as the player
moves around.

**129 of 607 ids are translated**: the whole interface, all sixty stat labels, the
skills referenced by racial bonuses, the bio panel, and every race name and
description. `npm run check` now reports Turkish at 21.3% coverage as a warning, so
CI stays green while the remaining 478 dialogue ids are written.

**On how it is translated.** The standing rule is that Turkish must read as Turkish,
not as English converted into it — no machine-translation register, no calques, and
the sense of a polysemous word resolved against its in-game context rather than taken
from the top of the dictionary.

The second rule is that translation happens in **context units**, never string by
string, because a string is read on screen underneath whatever is above it. The stats
section is the clearest case: every stat has a short form for the stat rows and a
long form for the tooltip, and the tooltip has to name the same thing the row
abbreviates or the screen contradicts itself. Same for a label and the values that
follow it — `"Boy"` and `"Kısa"` are separate ids that must read as one line.

Some concrete decisions, recorded so they are not re-litigated per string: health is
`can`, not `sağlık`, which reads as medical; stamina is `dayanıklılık`, not the
loanword; dexterity is `el becerisi`, not the archaic `maharet`; the Bio panel is
`Künye`, because it is an identity card rather than a biography; Tools is `Aletler`,
since `Araçlar` suggests vehicles. Where English left an abbreviation unexpanded in
both forms — `"EP"` for evasion points — the Turkish long form spells it out, which
is clearer and still faithful.

`docs/I18N.md` and its Turkish pair are new: how the system works, the hard rules,
the Turkish-specific hazards, the glossary, and an honest list of the places text
cannot be reached by the translation system at all — quest names and descriptions are
written inline in `src/quests.js`, `help.html` and `changelog.html` have no hook, and
item and location names are their own registry keys.

**Tests.** `npm test` grew a `src/translation.js` section: a translated id answers in
Turkish, an untranslated one falls back to English rather than the placeholder, an id
that exists nowhere still reports itself, initialising a non-default language pulls
the default in too, a language without a variant keeps its own base text, and the
variant wins where it exists in both directions of the flag. The harness now copies
`locales/` alongside `src/`, because `translation.js` reaches sideways for it at
runtime. 41 checks.

### Three loose ends from the town work

Closed out alongside, all confirmed by reading the code.

**Both cafe traders named an inventory template that does not exist.** `"Cafe trader"`
is not among the six defined templates; the real one is `"Cat cafe"`.
`get_inventory_from_template` reads `.length` on the lookup result with no guard, so
this is a TypeError waiting for whoever first wires one of those traders to a
location. Latent today — neither trader is referenced anywhere — but fixed in both
places, because fixing one leaves the identical trap in the other.

**A quest description could render the literal string "undefined".** Two calls read
`getQuestDescription()`; one guarded the result with `?? ""` and its sibling did not.
`innerText = undefined` renders as text.

**The cause behind it.** `Lost memory`'s description answered for completed-task
counts of 0 and 1 and fell off the end of its if-chain for everything above. The
second task is hidden and completes together with the first, so the count jumps
straight from 0 to 2 — meaning the `== 1` branch was never taken and the description
had been undefined since the player's first conversation with the elder. It now uses
ranges and covers every stage, including two new ones for having beaten the robber
and for being inside the town.

### The town is open — P-9, quest 2 of "The Merchant's Word"

The gate guard's line has said the same thing since v0.4.6: the town is closed to
everyone who is not a citizen or a merchant guild member, no exceptions. He now has
a second thing to say, and behind it the whole town.

**The gate.** A new textline on the gate guard, gated on `{reputation: {Town: 150}}`.
150 is the entire Town reputation obtainable in the game today — 50 for clearing the
Gang hideout, 40 for Bonemeal delivery, 60 for Ploughs to swords — so the gate opens
once the region's own work is finished. This gives Town reputation its first
consumer; until now it was granted in three places and read nowhere.

The guard does not bend. That mattered when writing it: "No exceptions" is his
character, and a guard who relents because the player asked twice is a worse guard.
So the rule is satisfied rather than waived — the farm supervisor, whose fields the
player saved and whose ploughs became swords, walked down and left a name with the
gate. A citizen speaking for you is the other half of what he said in the first
place.

Resolving the line unlocks Town square, completes `Lost memory` task 4, locks the
now-untrue "the town is closed" line, and opens a short after-entry line so the
guard is not left with nothing to say.

`Lost memory` task 4 was `"Get into the town (tbc)"` with a `//not yet possible`
comment. It is now `"Get into the town"`, and completable.

**What that opens.** Four fully authored interiors that no player has ever seen —
Town square with its fountain and organised pigeons, the Cat café, the Antique store
with its private museum of things you cannot recognise, and the Adventurer's guild
with some fifty ambient lines that quietly set up the retired legend the village
guard is not talking about, and the four young prodigies whose shadows detach from
walls. None of it needed writing. It needed a gate.

**The Nekomimi café and a gate that was never wired.** The café declared
`display_conditions: {flags: ["is_mofu_mofu_enabled"]}` — the author's intent that
it only exist in the beastkin cosmology. The `Location` constructor never accepted
that option, so it was silently dropped and the gate did nothing. With the town
opening, that would have put a nekomimi café in a world where catfolk are supposed
to be a drunk's story that needs defending.

`Location` now accepts `display_conditions`, wrapped the same way `Textline` does it,
and the two travel filters in `display.js` honour it. It is evaluated at render time
rather than at load, so the runtime mofu toggle takes effect without a reload.

`Combat_zone` needed the same field for a reason worth recording: it is a separate
class from `Location`, not a subclass, so its instances have no such property, and
`process_conditions` reads `.length` on its argument. Filtering connected locations
without accounting for that would have thrown on the first combat zone in a travel
list — which is to say, immediately. Both travel filters now go through one helper
with an explicit fallback, so a future location class cannot reintroduce it.

**The proprietress had nine lines of `lorem ipsum`.** She now has a voice. She is
the composed one in a café full of chaos, which is funnier than her being equally
silly, and she gets exactly one pun — funded by a jar on the door that pays for the
roof. There is no `lorem ipsum` left in the locale file.

**The Mages guild description was the Nekomimi café's, verbatim**, and its
background noises were an empty array. It is `is_unlocked: false` and stays that
way — it belongs to a later quest — but shipping the wrong text is one flag flip
from being visible, so it now has its own description and its own ambience, seeded
with the worked-silver detail that quest will need.

**Tests.** `npm test` grew a `src/conditions.js` section, because a wrong condition
shape does not throw — it silently opens or closes content. The reputation gate is
checked shut at 0 and at 149, open at exactly 150 and above; the undeclared default
and the bare-array fallback are both checked to mean "no conditions" rather than
"conditions unmet"; and the flag gate is checked in both directions. 33 checks.

### Height and race finally do something — P-8

`getNumericalHeight()` read `this.height` and `this.race`, but `Person` stores
identity under `this.personal`, and so does character creation. Neither property
existed on the instance, so both lookups missed, both fallbacks fired, and the
function returned a constant **170** for every character forever - which is exactly
`height_values["average"]`.

Consequences, all confirmed: `getUniversalHeight()` answered `"average"` for
everyone; the short/tall choice at character creation and the racial modifiers
(dwarf -30 through elf +10) affected nothing; and the `"very short"` branch in the
village guard's headpat scene could never be taken, so the authored line
`"guard try answ too short"` - which exists in `locales/english.js` - was
unreachable. That last one is the D-2 category exactly: content written and never
seen.

With the field read fixed, 7 of the 30 race-and-height combinations now measure
`"very short"`, including `short/nekomimi` - the default beastkin race - so the dead
line is reachable in ordinary play.

The height condition block in `src/conditions.js` was fixed in the same commit,
because fixing only the helper would have left the first authored height condition
misbehaving. That block was dead code - no content defines a height condition - and
all six comparisons in it were wrong: every bound test was inverted, so an
`at_least` failed when the character was *taller* than the minimum; the relative
`exactly` branch compared against `.at_least`; and the universal block read
`conditions[0].relative_height.exactly`, which throws for any condition that sets
`universal_height` without `relative_height`. The character's own height is now on
the left of every comparison, which is what makes the direction obvious.

`npm test` grew a `src/person.js` section, which meant generalising the harness:
it now strips only the imports that reach into the circular graph and leaves the
rest, so `src/races.js` - which has no imports at all - supplies the real racial
modifiers rather than stubbed ones. Verified to bite by running the height checks
against the pre-fix source, where all three heights measure 170 and every character
reports `"average"`. 25 checks in total.

### Follow-up to the NaN fix: a regression of its own, plus two related sites — P-8

An adversarial review of the previous commit found that its own `is_maxed` change
introduced a regression, and that activating the per-gain xp cap left the panel
that predicts level-up times stating a number the engine would no longer deliver.

**The regression.** The fix replaced `get_total_skill_level(id) == skill.max_level`
with `>= skill.max_level`. `get_total_skill_level` adds `bonus_skill_levels` and is
not clamped, so `>=` turned a one-level misfire into an N-level one, where N is the
equipped bonus. `woodcutting` requires an axe by definition, and the Iron chopping
axe grants +3 Woodcutting, so a skill at level 57, 58 or 59 reported
`Woodcutting (Maxed out!)` — dropping the percentage, the xp pair and the whole
estimate line — while the skill list next to it still read `58/60 [+3]`. The
inverse of the bug being fixed, and reachable in ordinary play.

Maxed-ness is now read from the skill itself: `current_xp === "Max" ||
current_level >= max_level`. `get_total_skill_level` is the wrong input in either
comparison direction and is no longer consulted here. Checked against all three
cases: genuinely maxed with a bonus, and unmaxed at both ends of the bonus window.
The old `==` was wrong in two of the three, the interim `>=` also in two; the new
test is right in all three.

The invariant this relies on — that `current_xp === "Max"` and
`current_level >= max_level` are always set together — is now asserted for every
skill in `npm test`, so the display cannot be quietly desynchronised from the model
again.

**The estimate was optimistic by up to 10x.** Activating the per-gain cap capped
what a skill actually receives, but the "Next level in …" line recomputed the gain
by hand and omitted three things: the global xp multiplier, the parent-skill
multiplier, and the cap itself. The cap guarantees at least ten gains per level, so
the panel could not honestly show fewer than ten cycles, yet it did.

Rather than duplicate the formula correctly, it is now a single exported function,
`get_effective_skill_xp_gain`, used by both `add_xp_to_skill` and the panel. Two
copies of the same arithmetic is what caused this; there is now one.

**Skill progress bar.** The width assignment sat after the `current_xp !== "Max"`
if-else instead of inside it, so a maxed skill computed `100 * "Max" / Infinity`
and wrote `style.width = "NaN%"`. The CSSOM discards an unparseable declaration
silently, so the bar simply froze at whatever fraction it showed one level earlier,
under a "Max!" label. It is now set in both branches, explicitly to `100%` in the
maxed one, because `.skill_bar_current` has no width rule in the stylesheet and a
stale inline value would otherwise persist. Farming and Literacy both cap at level
10, so this was not a theoretical case.

### Fixed the NaN readouts in the skill xp panels — P-8

Reported as `Woodcutting (NaN% [NaN / Infinity])` / `Next level in NaN minutes` in
the gathering panel. Reproduced exactly, root-caused, and fixed at both the
display and the model level.

**The display cause.** A skill that reaches max level stores `current_xp` as the
string `"Max"` and `xp_to_next_lvl` as `Infinity` — those are the intended
sentinels. The activity panel decided whether a skill was maxed with
`get_total_skill_level(id) == skill.max_level`, but `get_total_skill_level` adds
`bonus_skill_levels` and is not clamped, so any equipment or effect granting bonus
levels pushes the total past `max_level` and the equality fails for a skill that
genuinely is maxed. The panel then took the "not maxed" branch and computed
`10000 * "Max" / Infinity`, which is `NaN`. Reproduced in isolation: with a
level-60 skill and a +2 bonus, the old expression prints the screenshot verbatim.

`is_maxed` now tests the sentinel itself and uses `>=` rather than `==`. The three
`is_maxed ? "Max" : …` ternaries inside the else branch were dead code — `is_maxed`
is provably false there — and are gone. The xp values are read as numbers and
validated before use, so a skill whose stored numbers are unusable renders `?` and
"an unknown amount of time" rather than `NaN`.

**The model cause, which is the more serious half.** `Skill.add_xp` guarded its
input with `xp_to_add == 0`, and `NaN == 0` is false, so `NaN` went straight into
`total_xp`. From that point the skill is permanently broken: `NaN + x` is `NaN`, so
every later legitimate gain is silently discarded, the level-up branch recomputes a
level of 0 on every tick, and the panels show `NaN`. The caller's guard used
`isNaN`, which does not stop `Infinity`, and `Infinity` is worse — it makes the
level-up `while` loop unable to terminate once `total_xp_to_next_lvl` overflows,
because `Infinity >= Infinity` holds, which hangs the tab.

Both guards now reject anything non-finite and report it. The loop is additionally
bounded by `max_level`, which costs nothing because the branch below overwrites
everything once max level is reached.

`get_parent_xp_multiplier` was the most likely way a bad value got in. It computes
`parent_multiplier ** Math.max(0, parent.current_level - this.current_level)`, and
`Math.max(0, NaN)` is `NaN` while anything `** NaN` is `NaN`. That multiplier is
applied directly to `xp_to_add`, so one bad level value poisons the skill's stored
xp rather than just one gain. It now returns 1 and reports the bad state. This path
is new: the gathering skills only gained a parent skill in `b74b9eb`.

**A silent data-loss path closed on the way.** `JSON.stringify` writes `NaN` and
`Infinity` as `null`, and the save/load round trip tested `total_xp > 0`, so a
corrupted skill was skipped without a word — wiping that skill's entire progress.
It is now reported.

**One deliberate balance change.** `add_xp_to_skill` gated its per-gain xp cap on
`typeof skill.xp_to_next_lvl === Number`. `typeof` yields a string and `Number` is
a constructor, so that condition was never true and the cap has never applied to
any non-crafting skill. It now uses `Number.isFinite`. Skills will gain xp more
slowly than before. This is a real gameplay change, not just a bug fix — reverting
it is a one-line edit if that is not wanted.

**Tests.** `npm test` is new and runs in CI. It covers the guards above with
fourteen checks. It cannot `import` `src/skills.js` directly, because the circular
imports only resolve in the browser, so it reads the real source and substitutes
stubs for the three functions the `Skill` class uses — the code under test is the
shipped code, not a reimplementation. Verified to be meaningful by running the same
harness against the pre-fix source, where seven of the checks fail and the output
reproduces the "calculated level ... was 0" warning from the bug report.

### Bilingual documentation set — P-4, P-5

`docs/` now holds four document pairs plus the rewritten README, ten files in
total. Every one is a `NAME.md` + `NAME.TR.md` pair carrying a `doc-version`
stamp, and the Turkish half opens with a banner naming the English file canonical.

`docs/AGENTS.md` is the single canonical contributor and agent guide; the root
`AGENTS.md` is a short pointer stub, which exists only because agent harnesses
auto-discover the root file. The Turkish translations deliberately do not copy the
large reference tables — they link to the English anchors instead, because a fact
that was never copied cannot go stale.

`docs/STORY.md` is the narrative canon: the world, the protagonist, the central
mystery, the tone, the naming rules, and precisely where the story currently
stops. It also carries the inventory of content that exists in the repository and
no player can reach — nine high-value orphans, verified adversarially with none
refuted. All five town interiors turn out to sit behind the same closed gate, which
makes opening that gate the highest-leverage narrative action available. The
planned continuation arc is summarised there and detailed in `PROPOSALS.md`.

`docs/PROPOSALS.md` records every standing directive, the numbered backlog, and
the open decisions. Three of those decisions have now been taken: the fork
diverges in content, Turkish covers the full content layer including display
names, and the Turkish address register is mixed per NPC.

That last one came with a correction to my own earlier framing. Mixed register
looked like it needed the text-lookup rewritten, because the `mofu#` variant
mechanism is hardwired to one flag and one prefix. It does not: register only needs
a second axis if it is selectable at runtime. A fixed per-NPC register is written
into each line's Turkish text, and every line is already a separate string id — so
this is purely an authoring convention, and `src/translation.js` is untouched.

`docs/CHANGELOG.md` is this file. It is distinct from `changelog.html`, which
remains the in-game, player-facing version history.

### Removed references to the upstream deployment — P-6

The fork was still pulling assets from, and pointing users at, the upstream
project. Everything that is infrastructure now resolves against this repository;
everything that is credit stays, and says what it is.

**Deployment identity moved into configuration.** `src/config.js` gained a
`release_ids` block, and `is_on_dev()` / `is_on_main()` in `src/main.js` now
compare against it instead of two hardcoded upstream URLs.

This needed care rather than a find-and-replace. `is_on_dev()` is used in
thirteen places, and one of them chooses which `localStorage` key holds the save
file. On this deployment it currently evaluates to `false`, so live players are
on the production save key — and making it `true` would have silently handed
every existing player an empty save slot. The fix therefore keeps `dev` pointing
at a separate, not-yet-existing deployment path and only corrects `main`, which
is used in exactly one place.

Detection also changed shape. The old comparison was against a full `href`
including protocol and trailing slash, so visiting the site with a query string
or without the trailing slash failed to match its own release. It now compares
normalised `host + pathname`, so `/yairp`, `/yairp/` and `/yairp/?debug` all
resolve to the same release.

**Visitor counter fixed.** It is derived from `release_ids` rather than a
hardcoded upstream URL. Because neither hardcoded URL matched this deployment,
the counter was previously falling through to the placeholder branch on the live
site. Deployments that are neither `main` nor `dev` — a local server, a preview
build — still get an untracked placeholder so they cannot inflate real counts.

**Assets are local.** The favicon and the Open Graph / structured-data preview
image were being fetched from the upstream Pages site even though both files
exist in this repository. They now resolve locally, and `og:url` plus a
structured-data `url` were added, which were missing entirely.

**Repository links point here.** The in-game repository link, and the
contributing and "supporting the game" sections of `help.html`, now point at this
repository.

**Attribution deliberately retained.** The MIT licence requires keeping the
original copyright notice, and the original author explicitly asked that forks
credit and link the original. So `LICENSE` is untouched, the loading screen still
credits Miktaew and now names the continuation underneath, and the descriptions
say the game was created by Miktaew and continued in this fork. The Ko-fi link
belongs to the original author and was relabelled to say so instead of implying
it supports this fork — previously the tooltip read "Support me on Ko-fi!" on a
page that is no longer theirs.

### Repository hygiene: line endings and binaries — P-2

`.gitattributes` did not exist, so end-of-line behaviour depended on each
contributor's local `core.autocrlf` and produced CRLF warnings on every commit.

The fix had a trap in it. A first measurement with `git show :file` suggested
every blob in the repository was stored with CRLF, which would have made
`* text=auto` renormalise every tracked file — an enormous diff, and one that
would conflict with every upstream patch while the sync question is still open.
That measurement was wrong: `git show` applies the working-tree conversion.
`git ls-files --eol` gave the real picture — 50 files at `i/lf w/crlf`, meaning
the index already stores LF and only Windows checkouts are CRLF, which is the
healthy arrangement.

So `* text=auto` merely writes down what the repository already does. It was
verified to produce zero renormalisation before committing: staging everything
touched only the nine intended files. Binaries are marked explicitly, the
committed bundle and the lockfile are marked `-diff linguist-generated` so 730 KB
of minified output stays out of diffs and language statistics, and vendored
HackTimer code is marked `linguist-vendored`.

`.gitignore` gained the `_site/` build output plus log, editor and OS entries.
`package.json` and `package-lock.json` were previously **ignored** and are now
tracked. The upstream `.eslintrc.json` and `.dependency-cruiser.js` entries were
kept but annotated: they are local-only configs, and anyone adding a shared
linter config has to remove the line first, or the config will silently refuse to
be committed.

### GitHub Pages deploy pipeline — P-2

A supplied example workflow was checked against the actual repository. Six of its
eight assumptions did not hold:

| Problem | Resolution |
| --- | --- |
| Triggered on `main`; the default branch is `master`, so it would never have run | trigger on `master` |
| `npm ci` with no `package.json` — which `.gitignore` was actively excluding | `package.json` added and un-ignored |
| `cache: npm` with no lockfile, which fails the setup step | lockfile committed, caching enabled |
| `npm run build`, `check` and `test:browser` — none of these scripts existed | `build` and `check` written; `test:browser` dropped |
| `scripts/build-site.js` referenced in a comment but absent | written |
| Artifact path `dist`, which holds only the bundle while `index.html` is at the root — this would have deployed a site with no pages | artifact path `_site` |

Action versions in the example were checked against the registry rather than
assumed: `checkout@v7`, `configure-pages@v6`, `upload-pages-artifact@v5` and
`deploy-pages@v5` were all current and were left alone. Only `setup-node` was a
major version behind and was raised to `v7`.

`test:browser` was dropped rather than faked. There is no test infrastructure,
and the in-repo `Verify_Game_Objects()` is a browser runtime global that needs a
DOM, so running it means adding a headless browser dependency — a separate
decision, not something to smuggle into a deploy fix.

The CI node version is pinned to 24 on purpose. That is the active LTS; Node 26
is current but not yet LTS. `engines.node` is `>=22`, which is the floor for
contributors, not the CI target.

Pages turned out not to need manual enablement: `configure-pages` and
`deploy-pages` provisioned the site themselves on the first run.

### Build and validation scripts — P-2, P-3

**`scripts/build-site.js`** bundles `src/main.js` with esbuild and assembles the
deployable site into `_site/`, rewriting the `index.html` copy to load the bundle.

The separation matters. The repository root is the development entry point: its
`index.html` deliberately loads `src/main.js` so the game runs off any static
server with no build step. The existing `build.js` rewrites that tracked file in
place, which dirties the working tree on every CI run. The new builder applies
the rewrite to the `_site/` copy instead, so both modes coexist: edit and reload
with no build locally, minified and version-stamped in production.

This distinction has a direct consequence for translations. esbuild resolves the
dynamic `import()` in `src/translation.js` by globbing `locales/` at build time
and inlining every match into the bundle, so a newly added locale file is
invisible to bundle mode until the next build — while dev mode fetches it at
runtime and needs no rebuild. CI rebuilds on every push, so this only affects
local bundle-mode testing.

Every substitution in the `index.html` rewrite is asserted, so a change to that
file that breaks an assumption fails the build loudly instead of shipping a blank
page. Writing those assertions immediately caught a bug in the rewrite itself: a
`[^>]*` pattern could not reach the closing `-->` of the commented-out script tag
because the tag body contains `>` characters, so the comment survived and the
build would have produced a page with two script tags.

**`scripts/check-site.js`** validates the assembled site and, more importantly,
locale key parity — groundwork for P-7. Unknown keys in a translation and variant
keys with no base key are errors, because both are always bugs; missing
translations are reported as a coverage percentage so CI stays green while a
translation is in progress, with `LOCALE_STRICT=1` to make them fatal. Verified
against a deliberately broken locale rather than assumed to work.

### Toolchain modernised — P-3

- `engines.node` raised to `>=22`.
- esbuild raised to `^0.28.2`. The initial `^0.25.0` pin was itself a bug: caret
  ranges lock the minor on `0.x` versions, so `^0.25.0` resolves at most `0.25.x`
  and could never have reached `0.28`.
- **`live-server` removed entirely.** Its last release was April 2022, and it
  accounted for 195 of 222 installed packages, including several deprecated
  transitive dependencies. Nothing replaced it: esbuild, already a dependency,
  ships a static server, so `npm run serve` uses `--servedir`. Installed packages
  went from 222 to 27.
- `serve:site` added, to preview the built `_site/` output in bundle mode before
  deploying.

MIME types were verified rather than assumed, because a wrong `Content-Type`
silently breaks `<script type="module">`. The esbuild server returns
`text/javascript` for both `src/main.js` and `locales/english.js`.

---

## Before this fork

The version history of the game itself, up to and including the point this fork
diverged, is in `changelog.html` and in the upstream repository. This file starts
where fork-specific work starts.
