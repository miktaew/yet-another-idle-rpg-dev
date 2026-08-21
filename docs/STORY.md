<!-- doc-source: docs/STORY.md  doc-version: 3 -->

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

Four more regions are named in dialogue and do not exist yet — *"The mountain! The
plains! The woods! The bay!"* — along with the great river basin and an ancient
forest past Forest lake.

Civilisation is thin and thins fast. As the village elder puts it: *"Many leave
looking for better lives and we never hear from them again."*

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
| *sen* (informal) | `village guard`, `village millers`, `suspicious man`, `nekomimi proprietress`, swampland `cook` / `tailor` / `scout` |

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

**The frontier.** A player at the end of authored content is **hero level 25 to
30**, standing in the **Longhouse at the Swampland tribe**, having just completed
*In Times of Need* — the last completable quest in the game. Their gear ceiling is
a tier-3 steel head on a tier-5 alchemical-wood handle with tier-5
alligator/snakeskin armour, crafted at a tier-2 station because no tier-3 station
exists.

**Every NPC is exhausted.** The elder rests on *"Not yet, but hopefully soon"*.
The guard rests on *"that will have to be enough… I'm generally a terrible
teacher"*. The tanner is still waiting for armour that is never delivered. The
scout has *"time is the only help for me"*.

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

**Status: the gate is open.** Quest 2 of the arc shipped, so Town square, the Cat
cafe, the Antique store and the Adventurer's guild are now reachable, and the
proprietress's nine placeholder strings are written. The Nekomimi cafe is reachable
only with the beastkin flag set, which is what its author intended and which now
actually works. The Mages guild stays locked for quest 4, but no longer carries the
Nekomimi cafe's description.

Still unreclaimed: the commented-out `cute little rat` dialogue, the Forest lake deep
dive and its silver, the `Silver ingot` recipe, and the two combat stances. Those
belong to quests 3 through 6.

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
have the object at all; the four regions in the cook's geography lesson; the
banished tribe in the southeastern plains; and the Rat God himself. The arc opens
both dead ends and closes neither mystery.

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
