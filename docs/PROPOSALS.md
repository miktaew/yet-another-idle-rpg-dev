<!-- doc-source: docs/PROPOSALS.md  doc-version: 56 -->

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

1. **A lore section** — a place holding the story's history and the conversations
   already had. `todo`. The journal already has four tabs (quests, bestiary,
   anthology, data) and a fifth belongs there rather than in a new panel. What it
   should hold: what the player has been told, by whom, kept after the dialogue has
   closed. Nothing in the game currently records that.

6. **The shop's Cancel should take you back** — `done, as labels rather than behaviour`. The behaviour is the author's design and is right: one button clears the basket you have built, the other leaves. What was wrong is that "İptal" and "Çık" do not say which is which - and with the layout cut off at 1660px, only one of them was on screen at all. They read "Clear selection" and "Leave the shop" now, and item 4 put the third button back in view. There are three buttons:
   Accept, Cancel and Exit. Cancel clears the basket and stays, Exit leaves. Only
   two are visible in the reported screenshot, which is likely the layout problem in
   item 4. The labels also do not distinguish the two actions well enough in Turkish.

15. **Record every request here** — `standing`. This section is that rule being
    followed.

19. **Take upstream's update, then open a PR there** — `nothing to take; the PR needs
    a decision`. Upstream was fetched and has exactly two branches:

    | ref | head | date |
    | --- | --- | --- |
    | `master` | `e335643` v0.5.5.30 | 2026-06-23 |
    | `ghpages` | `fc04780` | 2026-06-26 |

    `ghpages` is the deploy branch and its **tree is byte-identical to master's** -
    the later commits are merges that changed no file. `master`'s head is our own
    fork point, so `upstream/master..master` is 67 commits and `master..upstream/master`
    is zero. There is no update to bring in.

    The PR is a separate question and a real one: those 67 commits are the full
    divergence Q-1 decided on - every string moved into locale files, a second
    language, four regions, a build and 99 checks - and offering all of it is not a
    reviewable pull request. What could be offered is the handful of fixes that are
    upstream's bugs rather than ours, each of which is small and language-neutral:

    - `item_templates["Cooked potato"]` carries `name: "Potato"`, so a cooked potato
      displays as the raw one.
    - the `gaze` action declares a success text and a `conditional_loss` text that
      `success_chances: [0,0]` and an empty condition list make unreachable, and the
      success text's content is `[TBD]`.
    - `crafting_component_filling.js` generates 72 components for four materials that
      no recipe produces, which its own header warns about.
    - the `Alchemical Wood` chain and the `Silver ingot` recipe are commented out
      with no sink, and the deep dive that taps silver is locked.

    Which of those to send, and whether to send anything at all, is asked rather than
    assumed.

30. **Dying quickly in combat** — `done, and my first two answers were wrong`.

    The cause is the **shield**. `damage_dealt_to_character` rolled the block chance
    inside `if(has shield)` and put the evasion roll in the `else`, so carrying a
    shield removed the dodge outright. `base_block_chance` is 0.75, so a starter
    shield turned three quarters of the attacks into "reduced by the shield's
    strength" - 1.6 damage, for `Ucuz ahşap kalkan` - and handed the remaining
    quarter a free full hit against a character who would otherwise have dodged much
    of it. A shield weaker than the damage it faces was therefore strictly worse than
    carrying nothing, which is what taking it off proved. An unblocked attack now
    falls through to the evasion roll; a blocked one still does not, because it
    connected with the shield.

    Recording the two wrong turns, because both were confident and neither was true.
    First I said nothing in the round touched combat and left it there - correct about
    the diff and useless as an answer, because the fault was older than the diff.
    Then I read `Savunma: 0.0` and argued that `Math.ceil` makes any worn piece give
    at least 1, so the slots must be empty. The arithmetic was right and the
    conclusion was wrong: the next screenshot showed six pieces on. What settled it
    was the owner isolating the variable by unequipping one item at a time, which is
    what I should have asked for two answers earlier instead of reasoning from
    templates.

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

41. **"Gathering mastery" reads as "Çırak toplayıcı"** — `answered`, and not a
    translation fault. A skill carries a `names` map keyed by level, so its displayed
    name changes as it ranks up - an English player at level 10 reads "Apprentice
    gatherer" too, and the Turkish is that title's correct rendering. Worth noting for
    P-13/35: this rank system is already most of the title mechanic that was wanted from
    Echoes-Beneath. What the report did surface is real and is fixed: the milestone list
    had two hardcoded English sentences, and the skill inside one of them was the
    registry key, so the Sleeping tooltip read `Unlocked skill "Meditation"` next to a
    line that already said "Meditasyon".
42. **Contribute everything transferable, not a subset** — `done for what is
    detectable`. `contribute/upstream-fixes` now carries 14 commits, each written
    against upstream's own code and style, each a fault that was measured rather than
    suspected, and each droppable on its own: twelve bug fixes in `src/`, one build fix
    (`build.js` exits 0 when it cannot stamp the version, so a bundle no browser will
    fetch reports as a successful build - and `dist/` is committed there), and one
    optional standalone bundle-load check.

    How the set was closed rather than guessed at: our check suite was pointed at their
    tree, which is what our checks are for - each one encodes a bug class we found. The
    source-level checks now find nothing further in their code. Two findings were left
    as reports because they need an authorial decision, not a fix: the gaze action's
    zero-chance success text, and a misspelled `action:` reward key whose correction
    would open a silver chain their own comments say is parked. One finding that looked
    real was not - 21 "conditional_loss with no conditions" hits are a false-positive
    class, because our check looks for `conditions` and their field is
    `success_conditions`.

    Not transferable, and why: the translation layer (they are English-only, and it is
    an architecture rather than a fix), our content and canon, and the UI work that is
    tied to our own markup and to the `zoom` feature they do not have.

    **PR [#241](https://github.com/miktaew/yet-another-idle-rpg-dev/pull/241) is open** -
    14 commits, 7 files, +349/-48, mergeable. Also worth recording, because it
    reverses a standing assumption: upstream is **not** dead. Their `master` and
    `refactoring` both sit at `19011a0`, pushed 2026-08-27, which our master already
    contains - so there is nothing new to take, but there is somebody to send to.

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
