<!-- doc-source: docs/CHANGELOG.md  doc-version: 11 -->

# Changelog

Development history of this fork, with the reasoning behind each change. Work
arrives here once the matching proposal in [PROPOSALS.md](PROPOSALS.md) reaches
`done`.

Turkish counterpart: [CHANGELOG.TR.md](CHANGELOG.TR.md).

> **Not the in-game changelog.** `changelog.html` at the repository root is the
> player-facing version history shown inside the game, maintained by hand as
> HTML and inherited from upstream. This file is the developer-facing record:
> tooling, infrastructure, refactors and the reasoning behind them. The two are
> deliberately separate and neither replaces the other.

---

## 2026-08-19

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
