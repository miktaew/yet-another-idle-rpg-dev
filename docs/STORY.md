<!-- doc-source: docs/STORY.md  doc-version: 12 -->

# Story canon

The narrative reference for this fork. Read this before writing any dialogue,
quest, location, item description or flavour text.

Turkish counterpart: [STORY.TR.md](STORY.TR.md).

**The standing rule: continue the story, never rewrite it.** Everything in
sections 1 to 5 is canon inherited from the original game and is not up for
revision. Section 7 is what we are adding. Nothing here invents lore that is not
already in the corpus or a direct extension of it — every claim traces to a file
in `src/` or `locales/`.

---

## 1. The world

A single continent, seen only from its backwater.

Four settled places exist in code: a **village** at the foot of the mountains, a
walled **town** whose gate is shut, the **slums** outside that wall, and the
**Snake Fang Tribe** in the swamplands, six clear-gates downriver.

Four more regions are named in dialogue before any of them exists — *"The mountain!
The plains! The woods! The bay!"* — and all four are built now; their shapes are in
section 1b. Still named and still absent: the great river basin, and the ancient
forest past Forest lake.

Civilisation is thin and thins fast. As the village elder puts it: *"Many leave
looking for better lives and we never hear from them again."*

## 1b. The four regions, as shapes

Each built region is a list of places in the code and needs to be a shape in the
story: where it opens, what happens in the middle, what the player is entitled to
expect, and what ends it. Written after reading Echoes-Beneath, whose `REGIONS.md`
keeps every region to Opening / Scenes / Expectations / Ending — the most useful
thing that review found, and not code.

The cook's geography lesson named all four before any existed: *"The mountain! The
plains! The woods! The bay!"* What he said about each is what each turned out to be.

### The wet woods — *what the water leaves behind*

**Opening.** South from the Waterfall basin, found by asking rather than by walking:
the way in is a question, which is the register the whole region keeps.

**Scenes.** Four places — Wet woods, Waterfall basin, and the Forest den and Frogs as
its two combat zones. No NPC lives here. The region talks through what it drops and
what grows in it, and the Waterfall basin is the only place in the game where a
player sits behind falling water to think.

**Expectations.** Gathering and quiet. It is the region that pays in materials rather
than in coin or standing, and the player should come out of it better equipped and no
better known.

**Ending.** It has none, and that is the honest gap. It stops rather than closes: no
line marks having finished with it. Whatever ends it should be small and should not
introduce a person — the region's whole character is that nobody is there.

### The plains — *the ground remembers*

**Opening.** Southeast past the Swampland fields, opened by the cook, who is also the
first person in the game to describe geography as opportunity.

**Scenes.** Seven places, and the only region with a settled people in it: the Snake
Fang Tribe, whose chief, cook, tailor, tanner and scout are five of the game's
fourteen NPCs. The swamplands and the Infested field are its combat, the Coast road
its way onward, the Town farms its way back.

**Expectations.** People. This is where the fork's story actually happens — the
recipes that make the town possible are taught here, in broken Turkish that must stay
broken.

**Ending.** The tribe's own quest closes, and the region hands the player to the coast
road. What stays open on purpose: **the banished tribe whose traces are in the
plains**, which is a hook the original author left and this fork has not touched.

### The bay — *an account with a stroke through it*

**Opening.** Three days north of the gate, opened by asking the factor what leaves
rather than what arrives — the one question nobody had paid him to answer.

**Scenes.** Three places and the thinnest region by count, which is right: a harbour
is a place you pass through. The harbour tallyman and the salt house are its whole
population, and white and black iron ore are sold here and nowhere else — the cook's
*"many metal come from there, from very far away"* being true for the first time.

**Expectations.** Trade and a name. It is the region that pays in access rather than
in materials.

**Ending.** Deliberately unresolved and the strongest thread in the fork: the
**Marrowmoth**, forty tons, out on the ebb the night after the forest road, one
unweighed crate, a stroke drawn twice through her account column. She comes back twice
a year. The tallyman will not send word.

### The mountain — *depth rather than ground*

**Opening.** Not a direction but a descent. The cave is reachable from the first hour
of the game; the mountain proper opens above it.

**Scenes.** Eight places, the most of any region, split between the cave under the
village and the camp above it. The Mysterious depths hold the rat questline and the
game's only talking rat; the Mountain camp holds the flue, which is the first forging
and smelting station in the game above tier 1.

**Expectations.** Making. Everything the player forges after this is better because of
a hole cut in rock behind a tent.

**Ending.** The forge is built and the second gate under the village opens with mind
rather than strength. What stays open: **the Rat God**, who is named and never
explained, and should not be.

## 2. The protagonist

Found unconscious in the forest, wounded, *"with nothing but pants"*, en route to
the town, hit hard in the head, memory gone. The game states this three times
through three different player questions, verbatim — it is the load-bearing fact
of the premise.

One of the attackers is alive in the slums and recognises the hero on sight:
*"Y-you! You should be dead!"* After being beaten he names the only lead in the
game: *"It was my group that robbed you… If you want answers, ask my ex-boss.
**He's somewhere in the town.**"*

## 3. The central mystery

It is **not** "who am I".

It is: *why was a lone traveller on that road worth robbing and killing, and what
was taken?*

Three canon facts constrain any answer:

1. The hero was **stripped of everything**.
2. The ex-boss **knows**, and he is inside the sealed town.
3. The gate names its own two keys: *"The town is currently closed to everyone who
   isn't a citizen or a merchant guild's member. No exceptions."*

A second, older mystery runs underneath it. The cave below the village has
pre-human architecture — *"all these squares make a circle, in some impossible to
understand way"* — and a second gate *"you won't be able to open with brute
strength"*, guarded by things that *"don't live in the walls, they ARE the walls…
An abomination that cannot exist, and yet it does."*

These two mysteries are the spine. Do not resolve either one casually.

## 4. Tone

**Wry-cozy over a grim substrate.**

Headpats and comic rage in the foreground: *"good job cutie~ \*[she bends forward
and pats your head]\*"*; *"Not just soldiers and workers, but queens and larvae
too!"*

Amputation, banishment and eldritch flesh at the edges.

The default narrator shrugs rather than explains: *"Fangs, tails or pelts, people
will buy them all. **I have no idea what they do with this stuff…**"*

Moral weight is always delivered by a comic character in a plain voice: *"If I run
away, I am not living… And if I die here? Die helping? Die laughing? Then I die
living."*

The author occasionally speaks over the game's head, and that is part of the
voice: a failure message reads *"Turns out you're too weak for this, because of
course you are, what were you even thinking?"*

New content must sit in this register. Comedy carries the weight; the horror is
ambient and understated.

## 5. Naming conventions — hard rules

1. **No NPC has a personal name.** All fourteen dialogues are role-titles:
   `village elder`, `village guard`, `old craftsman`, `village millers`,
   `gate guard`, `suspicious man`, `old woman of the slums`, `farm supervisor`,
   the swampland `chief` / `cook` / `tailor` / `tanner` / `scout`,
   `nekomimi proprietress`. New NPCs get lowercase role-titles in the same style.
2. **A display name may change with state, never to a personal name.**
   `suspicious man` becomes `"no-longer-suspicious guy"`, then `"puppy"`.
3. **Proper nouns are reserved** for peoples (Snake Fang Tribe), places (Carya
   Canyon), materials (Atratan, Belmart, Golmoon, Oneberry, Silver thistle) and
   the mythic (Ratzor Rathai, the Rat God). Do not name a person; do name a stone,
   a herb, a tribe or a god.
4. **Every NPC has a species**, assigned in a code comment, with a matching
   `mofu#` description variant: elder is a ram, craftsman a badger, millers a cat
   and a mouse, suspicious man a dog, gate guard a bear, farm supervisor a deer,
   old woman a tanuki, the swamp cast lizardkin.
5. **Kemonomimi are a cosmology switch, not a skin.** With the mofu flag off,
   catfolk are a drunk's story that needs defending — *"I wasn't drunk, they had
   cat tails and cat ears…"*; with it on, they need no comment. New default-mode
   text hedges about beastkin; the `mofu#` variant drops the hedge.
6. **Player-facing text never lives in `src/`.** Dialogue structure goes in
   `src/dialogues.js`; the text goes in `locales/<language>.js` behind an id.

## 6. Turkish address register

Turkish is authored with a **mixed, per-NPC register**. This needs no engine
change: each line is a separate string id, so the register is written into the
line itself. Do not attempt to make register runtime-selectable — the `mofu#`
mechanism is hardwired to one flag and one prefix and cannot express a second
axis.

**How the hero addresses NPCs:**

| Register | NPCs |
| --- | --- |
| *siz* (formal) | `village elder`, `old craftsman`, `old woman of the slums`, `gate guard`, `farm supervisor`, swampland `chief`, swampland `tanner`, and any guild official |
| *sen* (informal) | `village guard`, `village millers`, `suspicious man`, `nekomimi proprietress`, `square broker`, swampland `cook` / `tailor` / `scout` |

The swampland `tanner` moved from the informal group to the formal one while she was
being translated. Grouping the whole swampland cast as informal was too coarse: she is
elderly and the player's own opening line to her is "Excuse me, are you the
leatherworker?", which is deferential. Where this table and the source text disagree,
the source text wins and this table gets corrected.

**How NPCs address the hero:** *sen*, almost universally — the cast is warm and
familiar, and the headpats, the "cutie" and the "boy" all depend on it. The
exceptions are formal officials — the gate guard on duty, guild staff — who use
*siz* precisely because it marks distance.

The swampland cast speaks broken, simplified Turkish, mirroring their broken
English in the original. Preserve the effect; do not tidy their grammar.

## 7. Where the story currently stops

**The frontier, as of P-10.** The wall this section described has moved. A player at
the end of authored content has walked all four of the lands in the cook's geography
lesson, and the frontier is now the **coast road at the bay** rather than the
Longhouse: the last thing the game tells them is a hull name with no account against
it, and a man who will not send for them when she comes back.

**The gear ceiling has moved too, and that was the point of region 4.** It used to be
*"a tier-3 steel head on a tier-5 alchemical-wood handle with tier-5
alligator/snakeskin armour, crafted at a tier-2 station because no tier-3 station
exists"*. That sentence understated it: every station in the game had **forging and
smelting at 1** while components go to tier 5, so `roll_quality` was taking
`station_tier - component_tier` and everything the player forged rolled at a penalty.
The flue at the Mountain camp is a tier-3 forging and smelting station, which is the
first one in the game above 1.

**And the materials moved with it.** White iron and black iron are tier 4 and were
unreachable until their recipes were written - 36 components that had existed,
finished, since before this fork. Their ore is sold at the bay and nowhere else,
which is the cook's *"many metal come from there, from very far away"* being true
for the first time. Tier 5 is still scaffolding; see P-12.

**Every NPC is exhausted, with two exceptions.** The elder rests on *"Not yet, but
hopefully soon"*. The guard rests on *"that will have to be enough… I'm generally a
terrible teacher"*. The tanner is still waiting for armour that is never delivered.
The scout has *"time is the only help for me"*.

The two that are not exhausted are the two who answer to standing rather than to a
quest, and neither resolves anything. The **square broker** prices a reputation the
way he prices grain - *"three of them have asked me what you are worth… a man whose
price nobody knows is either very cheap or very expensive, and which one it turns
out to be is usually decided by somebody else"* - and the **old woman of the slums**
tells the hero what the row's roster costs rather than what it is worth: *"it is the
people we would get out of bed for… when things go badly here, and they will,
somebody is going to come and knock on your door instead of somebody else's."*

**Standing is a currency the places spend now.** It used to be a number that rose
and did nothing: 610 Village, 350 Slums and 320 Town were earnable, four dialogue
lines read any of it, and nothing at all read the slums except a trader's margin.
Six settlement actions answer to it now, three in each place, and they are built out
of what those places already were rather than added beside them.

In the **slums** - the shed with the scales, the row that keeps its own nights since
the gang went, and standing surety for somebody at the town gate. That last one is
the first thing in the game that turns slums standing into town standing, and it
opens nothing behind the gate: it buys one person through a door, with the hero as
the surety.

In the **town square** - keeping the pigeons off the bread, taking the crier's
shift, and being handed the casting vote in the bakers' argument about staleness.
The square had a fountain, pigeons, a newspaper crier and two men calling each other
stale, all of it in its background noises and none of it anything a player could
join. The verdict that works splits it: crumb to one, crust to the other, satisfying
neither and accepted by both, which is what standing buys in a square.

**Four quest tasks sit unwired**, each marked in code as to-be-continued: getting
into the town, going deeper into the cave, the village expansion, and the light in
the darkness.

The player's only unfinished business is **an unopened gate 240 minutes from the
forest road, and an unopenable one 120 minutes under the village.**

## 8. Authored but unreachable

Content that exists in the repository and no player can see. This was verified
adversarially — every item below was independently checked for any reachable path,
including dynamic lookups, procedural pools and tag filters. Nine high-value
orphans were confirmed and none refuted.

Reclaiming these takes priority over inventing new content.

| Content | What it is |
| --- | --- |
| **Town square** | The town hub. *"The town's center of life, connected to all the markets, guilds, and other important places"*, with authored background noises. |
| **Adventurer's guild** | A fully authored interior with roughly fifty ambient barks — rank exams, job boards, rumours. |
| **Antique store** | *"A private museum. There are paintings, furniture, ancient weapons and armors, as well as some things you cannot even recognize."* |
| **Cat cafe** | Authored location; its trader exists but points at a mis-named inventory template. |
| **Nekomimi cafe** | Authored location, mofu-gated. Nine of the proprietress's strings are still `lorem ipsum` placeholders and must be written before it ships. |
| **Mages guild** | A shell whose description is a copy-paste of the Nekomimi café's and must be replaced. |
| **`cute little rat`** | A complete seven-textline dialogue, commented out, written in the pre-localisation inline style. |
| **Forest lake deep dive** | A second-stage exploration action, deliberately locked by the author with the note that its reward has no use yet — it is the game's only silver tap. |
| **`Silver ingot` recipe** | Commented out, waiting for a sink. Its level range already sits correctly between the live iron and steel recipes. |
| **Two combat stances** | `berserk` and `flowing water`, with their skills, granted by nothing today. |

**Status: all six quests of the arc are built, and this list is empty.** The Adventurer's guild and
Town square now hold NPCs - the guild clerk and the broker under the green awning
- which is the first content either room has ever had. Quest 2 shipped before
them, so Town square, the Cat
cafe, the Antique store and the Adventurer's guild are now reachable, and the
proprietress's nine placeholder strings are written. The Nekomimi cafe is reachable
only with the beastkin flag set, which is what its author intended and which now
actually works. The Mages guild stays locked for quest 4, but no longer carries the
Nekomimi cafe's description.

**Nothing on this list is unreclaimed.** The last four went with quests 3 through 6:
the `cute little rat` dialogue is live in the Mysterious depths, the Forest lake's
silver tap is unlocked and its `Silver ingot` recipe is out of its comment, and
`berserk` and `flowing water` are granted by the village guard at the end of *Way
Too Strong for You*.

This section exists to be emptied, and it is empty. What replaces it is not another
audit of orphans - there are none - but the two quest tasks whose description is
still the literal string `[To be continued]`, tracked as P-11 in
[PROPOSALS.md](PROPOSALS.md).

## 9. The continuation arc — "The Merchant's Word"

Six quests, starting exactly at the frontier. Full implementation detail, with
per-quest triggers, tasks, flags and rewards, is tracked in
[PROPOSALS.md](PROPOSALS.md).

**Premise, derived entirely from canon.** The gate names two keys: citizenship, or
merchant-guild membership. After the swamp, the hero is the only person alive who
can supply the guild with goods from past the falls — linen, alligator leather and
jerky, all three taught by tribe recipes. The cook already framed trade as the road
out: *"Many spice and meat and metal and leather come from there! From very far
away! It good place to go!"*

So the hero enters the town **as a supplier, not as a hero.** That is the right
register for this game.

| # | Quest | What it does |
| --- | --- | --- |
| 1 | *The Merchant's Word* | Earns guild standing by supplying tribe goods. Gives the merchant guild — named once, existing nowhere — a body. |
| 2 | *No Exceptions* | Opens the gate, by either the supplier or the citizen path. Lights up all five town interiors and completes a quest task dead since v0.4.6. Gives Town reputation its first consumer in the game. |
| 3 | *Somewhere in the Town* | Follows the ex-boss. The turn: the robbery was **contracted**. Someone paid to have that traveller stopped and one specific object taken. |
| 4 | *Nothing but Pants* | Buys back what was taken, from the collector on the square. The game's first real money sink. The object links both mysteries without resolving either. |
| 5 | *All These Squares Make a Circle* | Opens the second gate under the village — with mind, not strength, as the room itself insists. Closes the rat questline and cashes in the parked silver chain. |
| 6 | *Way Too Strong for You* | Pays off the village guard's decade of deflection. She shows rather than teaches, which respects her refusal to teach. |

**What stays open, deliberately:** who paid for the robbery; how the hero came to
have the object at all; the banished tribe whose traces are in the plains; the
four-legged bird past the Forest lake; and the Rat God himself. The arc opens both
dead ends and closes neither mystery.

**And one the bay opened.** The **Marrowmoth**, forty tons, out on the ebb the night
after the forest road with one unweighed crate and a stroke drawn twice through her
account column. She comes back twice a year. The tallyman will not send word.

The four regions in the cook's geography lesson are no longer on this list: all four
are built. What he said about each one is what each one turned out to be.

## 10. Authoring rules

- **Read the neighbours first.** Before writing a line for an NPC, read every
  existing line they have and match the voice. Before writing an item
  description, read the ones around it in `src/items.js`.
- **Prefer reclamation over invention.** If authored content already covers the
  beat, wire it up instead of writing a parallel version.
- **Every line is an id.** Structure in `src/dialogues.js`, text in
  `locales/english.js`, Turkish in `locales/turkish.js`, both key sets validated
  by `npm run check`.
- **Write the `mofu#` variant when the scene involves species.** A `mofu#` key
  with no base key can never be reached.
- **Never rename a registry key** to make it read better. Keys are persisted in
  save files; renaming one breaks existing saves. See
  [AGENTS.md](AGENTS.md#5-save-compatibility--the-hard-rules).
- **Do not resolve a mystery the original author left open** unless the plan in
  section 9 says to, and then only by exactly one turn.
- After any content change, run `npm run check`, then boot the game and call
  `Verify_Game_Objects()` in the console.
