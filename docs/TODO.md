<!-- doc-source: docs/TODO.md  doc-version: 1 -->

# Story and gameplay expansion — the owner's brief

Turkish counterpart: [TODO.TR.md](TODO.TR.md).

> **This file is context, not a queue.** It has no checkboxes and nothing here is
> ticked off. It is the brief as it was given, kept whole, so that anyone can read what
> was actually asked for rather than a summary of it.
>
> The work itself is tracked in [PROPOSALS.md](PROPOSALS.md), where the brief has been
> measured against the code and turned into numbered proposals — P-14 is this document's
> v0.7 section, and P-15 to P-17 are later requests. Read the proposals to know what to
> do next; read this to know why.
>
> That distinction matters because parts of the brief assume things the code does not
> have. It names a lockpicking skill, a navigation skill and guild standing, and at the
> time it was written none of the three existed. Working straight from here would
> re-derive decisions that have already been made and act on assumptions that have
> already been measured and corrected. The measured plan is the proposal; this is its
> background.
>
> It was untracked until P-17. It is in git now because a brief nobody can see is a brief
> nobody can check the work against.

Work on this repository like a senior **game designer + narrative designer + JavaScript
engineer**.

Your main goal:

**Continue the existing story without rewriting it, bind the existing systems to each
other more strongly, and deepen the game's RPG/idle gameplay.**

Do not pile on new systems for the sake of adding features. First connect what the
repository already has: the mechanics, the regions, the reputation/standing system,
crafting, the combat stances, the journal/discoveries system, and the story hooks that
were deliberately left open.

---

# 1. Before you start work

Read the repository first.

Read these files, in this order:

1. `AGENTS.md`
2. `PROPOSALS.md`
3. `docs/STATUS.md`
4. `docs/I18N.md`
5. `docs/STORY.md`
6. `docs/DEV_CONSOLE.md`
7. `CHANGELOG.md`

Then look at the relevant sources:

* `src/data/locations.js`
* `src/data/dialogues.js`
* `src/data/skills.js`
* `src/items.js`
* `src/crafting_recipes.js`
* `src/main.js`
* `src/game_state.js`
* `src/journal_panels.js`
* the combat / stance modules
* the code that uses reputation / standing
* the quest definitions
* everything to do with the Bay / Forest Lake / Town / Slums / Merchant Guild
* `locales/english.js`
* `locales/turkish.js`

Before writing code, verify the real behaviour of the current implementation in the
running game as far as you can.

Measure the running game rather than guessing from the source.

---

# 2. Rules that cannot be changed

## Story

`STORY.md` is canon.

**NEVER rewrite the existing story. Only continue it.**

In particular, do not resolve the following central mysteries early:

* who gave the order to kill the hero
* why the hero specifically was the target of the robbery
* the true origin of the object taken from the hero
* why the hero had that object
* the true origin of the pre-human structures under the village
* the Rat God
* the banished tribe
* the four-legged bird past Forest Lake

Every new story arc may open **at most one layer** of the central mysteries.

Do not explain a mystery box inside a single quest.

---

# 3. Tone

The game's existing tone must be preserved:

**wry-cozy over a grim substrate**

In the foreground:

* mildly absurd humour
* warm character interactions
* dry narrator humour
* the characters' everyday concerns

In the background:

* a dark world
* people who disappear
* dangerous regions
* ancient structures
* eldritch / unexplained elements

The horror must not shout in the player's face.

For example:

Wrong:

> An ancient eldritch horror lies beneath the town.

The right approach:

> The stones don't quite line up.
>
> Which would be less worrying if they weren't holding the ceiling.

---

# 4. NPC rules

The existing naming convention must be preserved absolutely.

Do not give NPCs personal names.

NPC names are role-titles:

* `harbour tallyman`
* `guild clerk`
* `square broker`
* `dock worker`

and so on.

A proper noun may only be used for:

* a people
* a tribe
* a region
* a material
* a mythological being
* a ship

Follow the species / `mofu#` rules.

If an NPC has a species, write both the normal and the `mofu#` localisation variant
where one is needed.

---

# 5. Localization

Do not write player-facing text into `src/`.

Dialogue and content text must arrive by id, through:

```text
locales/english.js
locales/turkish.js
```

Do not write the Turkish as a mechanical translation of the English.

The Turkish must read naturally.

Follow the existing NPC address registers. For:

* `siz`
* `sen`
* the swamp characters who speak broken Turkish

follow the rules in `STORY.md`.

---

# 6. Save compatibility

One of the most critical technical rules for this project:

**Never rename a persisted registry key.**

In particular:

* location keys
* item keys
* dialogue keys
* quest keys
* save keys
* skill keys
* recipe keys

must not break existing save files.

Do not change an old identifier for the sake of a more readable name.

Create new keys for new content.

---

# 7. The main direction of development

Design the game's spine from here on like this:

```text
The Merchant's Word
        ↓
The Marrowmoth Ledger
        ↓
Beyond the Lake
        ↓
Echoes Beneath
        ↓
River Basin / future arc
```

But do not try to do all of it in one commit.

Develop incrementally.

The first big target:

# v0.7 — The Marrowmoth

---

# 8. v0.7 — The Marrowmoth

Use the existing Marrowmoth hook in the Bay region.

Canon:

* the Marrowmoth is roughly 40 tons
* out on the ebb
* there is an unweighed crate in its records
* the tallyman drew through the record line twice
* the ship returns twice a year
* the tallyman will not send word to the player

Make this the main continuation arc.

The arc should contain roughly **5 quests**.

Suggested structure:

---

## Quest 1 — No Word Sent

The tallyman does not send word to the hero.

The player must not learn that the ship has returned directly from a quest
notification.

A world-state change should be used instead.

For example:

* an increase in white iron / black iron in the bay trader's stock
* a change in the harbour's ambient dialogue
* a change in the harbour's actions
* a rumour in the merchant guild

The player should feel:

> Something changed at the bay.

The quest can open through the discovery.

---

## Quest 2 — Forty Tons

Let the player help unload the Marrowmoth's cargo.

Use the existing action infrastructure as far as possible.

Build a simple manifest mechanism:

```text
Cargo
Weight
Origin
Destination
Seal
Status
```

The records of the ordinary cargo are complete.

One crate should be in this state:

```text
Weight: —
Origin: —
Destination: —
Seal: damaged
```

The important piece of information:

**The same crate was not weighed the previous time either.**

But do not explain why.

---

## Quest 3 — A Stroke Through It

This quest should be investigation-heavy.

The player should use the existing settlement standing values to gather information.

For example:

```text
Town standing
Slums standing
Merchant/Guild standing
```

could open various alternative routes.

Example:

```text
Town standing >= X
→ merchant guild records

Slums standing >= Y
→ dock worker testimony

Merchant standing >= Z
→ old cargo manifests
```

Balance the exact thresholds by analysing the existing progression values.

Do not put in a hard-coded meaninglessly high number.

But all the routes must not lead to exactly the same information.

Different routes should give different pieces.

---

## Quest 4 — Out on the Ebb

Open the Marrowmoth as a new small exploration chain:

```text
Bay
 ↓
Low-tide flats
 ↓
Marrowmoth anchorage
 ↓
Cargo deck
 ↓
Lower hold
```

But examine the existing location architecture first.

Add a new location if one is genuinely needed.

If it can be solved with the existing location/action system, do not create a parallel
system.

This section should not be combat-heavy.

Design it around skill/action checks.

Use existing skills where possible:

* an existing skill like perception
* an existing skill like lockpicking
* athletics
* crafting knowledge
* trading
* navigation

Do not simply add skill names that do not actually exist in the repository.

Examine the existing skill set first and use the ones that fit.

---

## Quest 5 — One Unweighed Crate

Let the player reach the crate.

But do not resolve the mystery.

What is inside the crate should carry a property that could connect it

to the object stolen from the hero

or

to the ancient architecture under the village.

For example:

* the same geometric motif
* the same metalwork
* a trace of the same unknown material
* the same arrangement of symbols

But explain none of the following:

```text
Who sent it?
Where does it really come from?
Why is it being moved?
Who paid for the robbery?
Why did the hero have the original object?
```

At the end of the quest the player may have more new questions than answers.

That should be deliberate.

---

# 9. Do not write a huge new system for the Marrowmoth

Do not create a new "investigation UI".

Use the existing:

```text
Journal
Discoveries
Bestiary
Books
Lore
```

system.

Add investigation-style records to the `Discoveries` section.

Example:

```text
MARROWMOTH

• Forty tons.
• Arrives twice each year.
• One crate was not weighed.
• The same entry was crossed out twice.
• The tallyman does not want me asking about it.
```

Let the discovery entry update as new clues arrive.

---

# 10. Grow the standing system

Standing must not be only a number.

Continue the existing use of settlement actions.

In new content, standing should open:

* dialogue
* information
* alternative quest paths
* prices
* special actions
* access

Where possible, let some decisions have different effects on different settlement
standing values.

For example:

```text
Town +X
Slums -Y
```

But do not make the game excessively punitive.

The player's decisions should give a sense of world-state.

---

# 11. Money sinks

`Nothing but Pants` created the first big money sink.

Let money mean more in the new arcs.

Consider these in a way that fits the existing economy:

* expedition supplies
* cargo investment
* guild commissions
* rare maps
* workshop upgrades
* repairs
* surety
* specialised recipes

Consider a mechanism for spending money on exploration preparation in particular.

Example:

```text
Food
Rope
Torches
Medicine
Guide
```

But do not spam new items without examining the repository's item system.

If you can use existing items, use them.

---

# 12. Improving the combat stances

Examine how the existing:

```text
berserk
flowing water
```

stances are given to the player and how they work in combat.

Do not leave them as nothing but a stat bonus.

Make the stance decision meaningful through enemy design.

As a concept, for example:

```text
Berserk
→ high offence
→ risky against counterattacking enemies

Flowing Water
→ defensive / reactive
→ strong against slow heavy hitters
```

But apply it without breaking the existing combat formulas.

If a new enemy trait is needed, create the minimum reusable abstraction.

Do not write spaghetti conditions specific to every enemy.

---

# 13. Skill checks

In new quests, give value to the existing skill progression wherever possible.

For example:

```javascript
if (relevant_skill.level >= threshold) {
    // alternate solution
}
```

But failure must be explained to the player.

Bad:

```text
You failed.
```

Good:

```text
You could probably force this lock.

Probably.

Just not with your current idea of lockpicking.
```

Give feedback that fits the existing tone.

A failed skill check must not lock a quest forever.

Where possible, offer:

* a more expensive alternative
* a longer alternative
* a standing alternative
* another skill alternative

---

# 14. Quest UX

For an active quest, the player must not have to read the repository to answer:

> What am I supposed to do now?

First find, in the running game, the two quest tasks that show no hint, and fix them.

In new quests, provide as far as possible the logic of:

```text
Current objective
Hint
Region
```

Do not give GPS coordinates.

The hint should point the player somewhere without telling them the answer.

Example:

```text
A Stroke Through It

Someone altered the Marrowmoth's manifest.

Hint:
People who trade for a living tend to keep better records than people who unload ships.
```

---

# 15. The region design rule

Every region has a gameplay identity:

```text
Wet woods → gathering / quiet
Plains    → people
Bay       → trade / access
Mountain  → making
```

Continue that.

Before adding a new region, answer:

```text
What is the gameplay verb of this region?
```

Suggested future regions:

```text
Ancient Forest
→ navigation / discovery

River Basin
→ logistics / travel
```

But do not invent the lore yet.

Derive it from the existing canon hooks first.

---

# 16. Preparing for v0.8 — Beyond the Lake

Once v0.7 is finished, take the region past Forest Lake as the second main arc.

Hook:

```text
four-legged bird past the Forest lake
```

Consider these focuses there:

* Ancient Forest
* navigation
* rare encounters
* tier 5 gathering
* stance-focused combat
* environmental discoveries

Do not make the four-legged bird a boss marker directly.

Let traces come first:

```text
strange tracks
feathers
distant noises
damaged vegetation
```

The player should not be sure the creature exists at all before they see it.

---

# 17. Tier 4 / Tier 5 progression

Analyse the existing white iron and black iron progression.

Bind the tier 4 and tier 5 material/component chains fully into the gameplay
progression.

The ideal loop:

```text
Explore
 ↓
Find material
 ↓
Unlock recipe
 ↓
Craft better gear
 ↓
Reach harder content
 ↓
Discover story
```

Material progression and story progression must not sit there as two independent
spreadsheets.

They should open each other.

But before adding a new recipe, check the unused / underused content already in the
repository.

**Reclamation over invention.**

---

# 18. Dynamic world events

If it does not put v0.7's core scope at risk, examine whether a small reusable
world-event infrastructure is possible with the existing systems.

Example events:

```text
Marrowmoth in port
Heavy rain
Trader caravan
Town festival
Rat migration
Flooded road
Forest bloom
```

These could affect:

* trader stock
* gathering
* travel time
* the enemy pool
* dialogue
* actions

But do not write a large scheduler framework from scratch.

If the existing game-time system suits it, use that.

The first real use could be:

```text
Marrowmoth in port
```

---

# 19. The approach to technical refactoring

You may refactor, but refactoring must not be the main goal.

Roughly this development priority:

```text
60% story / gameplay
20% balancing / existing content integration
10% UX
10% refactor
```

Do not stop developing features just to shrink `main.js` or `display.js` because they
are large.

Refactor only when it:

* makes a new feature safe
* addresses coupling that is a serious problem
* increases testability
* fits the existing PROPOSALS plan

---

# 20. Import / module safety

Import order matters in this repository.

Do not treat `main.js`'s import order as an ordinary style preference in particular.

If a new import is needed, follow the repository's existing instructions.

Be careful when creating a circular dependency or changing an existing cycle.

Do not forget that an unresolved identifier may not be caught by esbuild at build time.

---

# 21. The method for developing a feature

Use this method for every feature:

```text
1. Find the existing implementation
2. Check the existing content
3. Check consistency with canon
4. Design the minimum change
5. Add tests/checks
6. Implementation
7. Localization
8. Runtime verification
9. Save compatibility verification
10. Documentation / changelog
```

---

# 22. Testing is mandatory

After every meaningful change, run:

```bash
npm run build
LOCALE_STRICT=1 npm run check
npm test
npm run check:bundle
```

Also boot the game and run:

```javascript
Verify_Game_Objects()
```

If a save-related identifier changed, run it with a real exported save:

```bash
npm run check:save "<exported-save>.txt"
```

If you fixed a bug, add where possible a regression test that fails when the bug is put
back.

---

# 23. Definition of Done

A feature counts as finished only when all of the following are true:

```text
[ ] does not contradict canon
[ ] the existing story was not rewritten
[ ] save compatibility is preserved
[ ] no player-facing raw text was written into src
[ ] English localization complete
[ ] Turkish localization complete
[ ] mofu variant complete if one is needed
[ ] quest progression reachable
[ ] does not create a quest dead-end
[ ] the reason for failure is explained
[ ] journal/discovery integration present
[ ] economy/progression balance checked
[ ] npm run build passes
[ ] LOCALE_STRICT=1 npm run check passes
[ ] npm test passes
[ ] npm run check:bundle passes
[ ] Verify_Game_Objects() passes
[ ] CHANGELOG up to date
[ ] PROPOSALS/STATUS/STORY updated if they needed updating
```

---

# 24. How you work

Do not keep asking me for approval during implementation.

If the existing rules in the repository are enough, make your decision and go on.

But do not try to code the whole roadmap in one go.

Let the first target be:

```text
v0.7 — The Marrowmoth
```

Analyse the existing system first.

Then record the implementation plan appropriately inside the repository.

Then apply it in small, testable steps.

Move on to v0.8 after v0.7 is finished and all the quality gates pass.

---

# 25. The design principle

The goal in this project is not:

```text
more content
```

The goal should be:

```text
existing systems
      +
existing mysteries
      +
existing regions
      +
player decisions
      ↓
a more connected RPG
```

Rather than adding 50 new locations, 50 skills or 50 recipes, make the existing systems
affect each other.

The player should feel that what they do changes:

* the world
* the economy
* how people treat them
* the information they can reach
* the equipment they can use
* the story paths they can follow

**Priority: finishing the Marrowmoth arc well, as the first real continuation arc that
binds the game's existing systems to each other.**
