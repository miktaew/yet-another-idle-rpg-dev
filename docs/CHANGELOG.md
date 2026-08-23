<!-- doc-source: docs/CHANGELOG.md  doc-version: 28 -->

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

## 2026-08-23

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
