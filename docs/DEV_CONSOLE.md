<!-- doc-source: docs/DEV_CONSOLE.md  doc-version: 2 -->

# Dev console

Everything the game can hand out, granted through the game's own code paths. Nothing
here is a second implementation: `give` **is** `process_rewards`, the function a quest
reward runs through, so anything granted here behaves exactly as content would have
granted it.

Turkish counterpart: [DEV_CONSOLE.TR.md](DEV_CONSOLE.TR.md).

## Turning it on

Open the browser console on the game page and type:

```js
enable_dev_console()
```

It prints the list of functions it just attached. After that they are bare globals.

It is **off by default and never saved** — a reload turns it off again. `is_on_dev()` is
deliberately *not* the gate either: the dev release is still a release somebody plays,
and this can hand out every item in the game and walk into any room. That is what makes
it useful and why it should not be one typo away from a player who opened devtools to
look at something else.

Enabling it also reveals the speed buttons in the bottom panel.

## Items

`give` takes a **rewards object** — the same shape written in `src/quests.js` and
`src/data/dialogues.js`. An item is either a bare name or an object.

```js
give({items: ["Iron sword"]})                              // one, at the item's own quality
give({items: [{item: "Iron ore", count: 50}]})             // fifty
give({items: [{item: "Iron sword", quality: 120}]})        // uncommon
give({items: [{item: "Steel chainmail armor", quality: 250}, {item: "Stale bread", count: 100}]})
```

`count` defaults to 1, `quality` to whatever the template carries (usually 100).

### Quality

Quality is a number, not a rarity name; the rarity is derived from it:

| quality | rarity |
|--------:|--------|
| below 50 | trash |
| 50–100 | common |
| 101–129 | uncommon |
| 130–159 | rare |
| 160–199 | epic |
| 200–245 | legendary |
| 246 and up | mythical |

It affects weapons, armour, shields and tools — anything whose stats scale — and it is
part of the inventory key, so two qualities of one item are two inventory entries. A
material like `Iron ore` accepts a quality too.

Unsure of a name? `list_items()` returns all of them, sorted.

### The best of everything

```js
give_best()        // the best item for every slot, at quality 250
give_best(100)     // the same, at common quality
```

Puts one of the best item for each of the sixteen equip slots into the inventory and
**does not equip anything** - what to wear is your call. "Best" is measured the way
each slot measures things: attack for a weapon, defense for armour, block for a
shield, and the price the game puts on it for the slots with no headline number
(artifact, amulet, ring and the five tools). Returns what it handed over.

### Every good effect at once

```js
add_best_effect()        // all 22 buffs, for 1800 in-game minutes
add_best_effect(120)     // the same, for two in-game hours
```

The counterpart to `give_best`, for the same reason: naming Coffee, Spark of
Inspiration and Well hydrated one at a time is the tedious part. It applies every
effect the templates tag as a `buff` - meals, the healing items, Coffee, Well
hydrated and Spark of Inspiration - and nothing else. Poisons, the cold stages and
`Potion of sapping` are not tagged buff and are not touched.

Which effects count is read off the data rather than listed in the console's own
code, so an effect added tomorrow is included the moment it is tagged. A check
(`check_effect_tags_match_their_numbers`) fails the build if anything tagged `buff`
has a wholly harmful stat profile, since this command trusts that tag.

Duration is in in-game minutes, like every duration in content. Returns the list it
applied; if a stronger effect in the same group blocks one, the blocked names come
back under `held_back_by_a_stronger_effect`.

## Everything else `give` accepts

All 23 reward keys, with the shape each one wants. The nested shapes below are copied
from real content, not invented.

```js
give({money: 50000})
give({xp: 1000})                                           // hero xp
give({skill_xp: {Combat: 100, Farming: 500}})

give({locations: ["Coast road"]})                          // unlock, without travelling
give({move_to: {location: "Eastern mill"}})
give({quests: ["Village expansion"]})
give({quest_progress: [{quest_id: "Lost memory", task_index: 1}]})

give({skills: ["Meditation"]})
give({stances: ["berserk"]})
give({recipes: [{category: "cooking", subcategory: "items", recipe_id: "Alligator jerky"}]})
give({crafting: ["Lake beach"]})                           // unlock a location's workshop
give({housing: ["Lake beach"]})

give({actions: [{location: "Village", action: "dig canal"}]})
give({activities: [{location: "Village", activity: "weightlifting"}]})
give({global_activities: ["swimming", "climbing"]})
give({traders: [{trader: "village trader"}]})

give({dialogues: ["old craftsman"]})
give({textlines: [{dialogue: "village elder", lines: ["hello", "about"]}]})
give({flags: ["is_gathering_unlocked"]})
give({reputation: {Village: 50}})
give({messages: ["reward msg go up"]})                     // a text id, not a sentence

give({locks: {textlines: {"village elder": ["hello"]}}})   // the reverse: take away
```

`locks` accepts `actions`, `dialogues`, `locations`, `quests`, `textlines`, `traders`.

Keys combine freely, and that is the normal way to use this:

```js
give({
    items: [{item: "Iron sword", quality: 140}, {item: "Iron ore", count: 200}],
    money: 25000,
    skill_xp: {Crafting: 2000, Smelting: 2000},
    locations: ["Coast road"],
})
```

## The rest of the functions

```js
add_active_effect("Coffee", 1800)      // duration in in-game minutes, like content uses
add_money(50000)                       // returns the new total
add_xp(1000)                           // returns the new level
add_skill_xp("Farming", 5000)          // returns the skill's new level

goto("The bay")                        // unlocks the room first, then walks there
set_flag("is_gathering_unlocked")      // second argument defaults to true
set_speed(100)                         // 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000
```

`set_speed` divides every wall-clock delay in the game — the main loop, the enemy and
character timers, the action timers — and divides every per-tick accounting term by the
same number, so a tick is still worth exactly what it was. Not saved; a reload is back
to 1x.

## Finding names

Every registry key, sorted. These are what the functions above want.

```js
list_items()        list_skills()      list_locations()
list_quests()       list_dialogues()   list_effects()      list_flags()
```

Keys are English and they are **save data** — what a player sees is the translation of
the key, so `list_items()` gives `"Iron sword"` even in Turkish.

## Things worth knowing

- **Every grant is logged** in the message log, the same as a quest reward, and named in
  the player's language.
- **A wrong name is reported, not thrown**: `give({items: ["Iron sord"]})` prints
  `No such item as "Iron sord" - reward skipped.` and grants the rest of the object.
- **`goto` unlocks first.** Walking somewhere locked is the usual reason it is being
  typed, so it unlocks the room, silently, and then travels.
- **Nothing here is saved as "dev".** A save made after granting things is a normal
  save; there is no flag marking it.
