<!-- doc-source: docs/PROPOSALS.md  doc-version: 7 -->

# Proposals

Working backlog for this fork. Every directive from the project owner is recorded
here as a numbered proposal, tracked to completion, and then written up in
[CHANGELOG.md](CHANGELOG.md) with an explanation of what actually changed.

Turkish counterpart: [PROPOSALS.TR.md](PROPOSALS.TR.md).

**Status vocabulary**

| Status | Meaning |
| --- | --- |
| `done` | Shipped and verified. Written up in `CHANGELOG.md`. |
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

### D-6 — Push straight to the default branch

Commit and push directly to the default branch (`master` today, `main`
intended later). No feature branches, no pull requests, unless asked. The Pages
deploy only triggers on the default branch, so a side branch would silently skip
deployment.

---

## Proposals

### P-1 — Full project audit `done`

Understand the codebase before changing it: architecture, content/data layer,
i18n readiness, refactor candidates, fork divergence, documentation state.

Delivered as two multi-agent audits — a technical audit (8 subsystem readers, 14
adversarial verifiers, 1 synthesiser) and a narrative discovery pass (story
spine, open hooks, orphaned content, NPC arcs, geography, progression systems).
Findings feed P-4, P-7, P-8 and P-9.

### P-2 — Fix the GitHub Pages deploy workflow `done`

An example `deploy-pages.yml` was supplied. Verify it against the real
repository structure and correct it. Six of its eight assumptions were wrong;
see `CHANGELOG.md` for the itemised list.

### P-3 — Modernise the toolchain `done`

Raise `engines.node` to `>=22` and bring lagging dependencies and actions to
current versions.

### P-4 — Rewrite `README.md` `done`

The current README describes the upstream project, not this fork, and several of
its claims are now false (`npm run build` with no `package.json`, a
`live-server` recommendation for a dependency that no longer exists, upstream
branch layout). Rewrite it for this repository, with a Turkish pair.

### P-5 — Documentation structure `done`

Create `docs/`, with these pairs:

| File | Purpose |
| --- | --- |
| `docs/AGENTS.md` | Canonical instructions for agents and developers (D-4). |
| `AGENTS.md` (root) | Pointer stub, because harnesses auto-discover the root file. |
| `docs/STORY.md` | The narrative canon: world, protagonist, tone, where the story currently stops. |
| `docs/PROPOSALS.md` | This file. |
| `docs/CHANGELOG.md` | Development history with explanations. |

Naming: uppercase base name, uppercase `.TR` marker, lowercase `.md` extension
(`PROPOSALS.TR.md`). The deploy workflow's `paths-ignore` uses a case-sensitive
`**.md` pattern, so a stray `.MD` would defeat it and trigger a pointless
rebuild on documentation-only pushes.

### P-6 — Remove references to the upstream deployment `done`

Assets, repository links and the visitor counter must resolve against this
repository and this deployment, not the upstream one.

Attribution is deliberately **not** removed: the MIT licence requires retaining
the original copyright notice, and the original author asked that forks credit
and link the original. Asset and infrastructure references move; credit stays
and is relabelled honestly.

### P-7 — Turkish language support in the game `active` — TOP PRIORITY

Add a Turkish option to the game itself. The translation layer already exists
but currently covers dialogue and part of the UI only.

Unblocked: Q-1, Q-2 and Q-4 are decided. Scope is the **full content layer**,
including item, skill and location display names.

That scope has one hard prerequisite: **registry keys currently are the display
names, and they are persisted verbatim in save files.** So a display-name
indirection layer has to land first — every registry entry keeps its English key
forever and gains a text id for its shown name. Renaming keys is never an option.
This is the largest single piece of work in the backlog and is tracked as its own
refactor prerequisite.

Address register is a **per-NPC authoring convention**, not an engine feature —
see [STORY.md](STORY.md#6-turkish-address-register). No change to the lookup in
`src/translation.js` is needed, because each line is already a separate string id.

**Shipped** — the language works end to end. `getText` now falls back to the
default language for any untranslated id, which is what makes a partial locale safe;
`turkish` is registered; `locales/turkish.js` carries the interface, stats, skills,
races and bio sections; and the options panel has a selector built from the
`languages` registry, switching live. `npm run check` reports coverage and `npm test`
covers the lookup and the fallback. The translator handbook and glossary are in
[I18N.md](I18N.md).

**Remaining** — the 478 dialogue ids, and then the display-name indirection layer
that item, skill and location names need. Quest text, `help.html` and
`changelog.html` have no translation hook at all yet; see the known gaps in
[I18N.md](I18N.md).

### P-8 — Fix the reported NaN warnings `active`

Framing correction from the audit: the adversarial pass refuted every candidate
for *rendered* `NaN` text. What exists is a console **warning** — the phrasing in
the original request — emitted by the guard in `src/main.js` when non-numeric xp
is added to a skill.

The audit produced an ordered fix list of 11 items plus companion cleanups. The
two most consequential:

- The last gate before skill xp is committed compares `xp_to_add == 0`, which
  lets both `NaN` and `Infinity` through. `Infinity` makes the level-up loop
  non-terminating, which hangs the browser tab.
- A `typeof x === Number` comparison is unconditionally false, because `typeof`
  yields a string and `Number` is a constructor. The per-gain xp cap it guards
  has therefore never applied. Fixing it is a live balance change and needs its
  own changelog entry.

Also surfaced, and more interesting for D-2: the height/race helper reads its
fields from the wrong object, so height and race selection currently have no
gameplay effect at all, and one dialogue variant is permanently unreachable.

**Shipped** - the skill xp panel readout reported from the live game and the model
bugs behind it; a regression the first fix introduced; the skill progress bar
width; the level-up estimate, which the newly-live xp cap had made optimistic; and
the height/race helper together with the height condition block. All written up in
[CHANGELOG.md](CHANGELOG.md) and covered by `npm test`.

**Investigated and dismissed** - recorded here so they are not re-raised. Each was
adversarially verified as not worth fixing:

- *Maxed crafting skill xp arithmetic* (`main.js`, four sites). Produces `NaN`, but
  the value is only ever consumed by `accumulated_xp >= needed_xp`, and both
  `x >= NaN` and `x >= Infinity` are false. The proposed `|| Infinity` guard changes
  nothing. The sibling site that does carry the guard needs it because that branch
  does arithmetic on the value - an asymmetry in usage, not an oversight.
- *Empty-combat divisors* (`main.js`, stance xp and the survivor-count exponents).
  `is_alive = false` is written in exactly one place, which clears that enemy's
  timer immediately, and the kill-to-repopulate path is a single synchronous
  callback with no yield - so nothing can observe an all-dead enemy list. Even if
  it could, the entry guard rejects the value with an error and it is never stored.
- *Enemy panel hit and dodge chances* at zero survivors. The zero state is
  reachable, but `get_hit_chance` has a terminal `else { result = 0 }` that converts
  the `NaN`, and the corrective repaint happens inside the same synchronous task, so
  no frame is painted in between. That fallthrough is load-bearing and undocumented;
  a comment is the only justifiable action.
- *Character xp entry guard* (`character.js`). All four call sites are provably
  finite, `total_xp` starts at 0 and is only incremented, and the load path's input
  comes from a save the other three wrote. Defence in depth at best.

**Still open** - the interpolation helpers (`slerp`, the recipe equivalent) and the
market-saturation divisor. These are latent authoring traps rather than live bugs:
they break when a content array starts at 0, and none currently does. Worth fixing
before someone authors the array that triggers one, and worth teaching the verifier
to assert the numeric pairs are positive - it currently only checks that resource
names resolve.

### P-9 — Continue the story `open`

Canon, the frontier, the orphan inventory and the planned arc are now written up
in [STORY.md](STORY.md). Q-1 is decided in favour of full divergence, so new
content is in scope.

The arc is **"The Merchant's Word"**, six quests starting exactly at the frontier.
Its premise is derived entirely from canon: the town gate names citizenship or
merchant-guild membership as its only two keys, and after the swamp the hero is
the only person alive who can supply the guild from past the falls. The hero
enters the town as a supplier, not as a hero.

Execution order, highest leverage first:

1. **Q2 — DONE.** The gate is open, gated on the full 150 Town reputation, which
   gives that reputation its first consumer. Town square, the Cat cafe, the
   Antique store and the Adventurer's guild are reachable; the Nekomimi cafe is
   correctly beastkin-gated now that `Location` honours `display_conditions`; the
   Lost memory task dead since v0.4.6 is completable. Written up in
   [CHANGELOG.md](CHANGELOG.md).
2. Fix the reclamation blockers found alongside the orphans: the cat cafe
   trader points at a mis-named inventory template; the Mages guild description
   is a copy-paste of the Nekomimi cafe's; the Nekomimi proprietress still has
   nine `lorem ipsum` strings; `Location` silently drops `display_conditions`, so
   mofu gating has to happen at the push site.
3. Q3 and Q4 advance the central mystery by exactly one turn — the robbery was
   contracted — and hand the player a physical link between the two dead ends.
4. Q5 closes the rat questline, opens the second cave gate with mind rather than
   strength as the room itself insists, and finally gives the parked silver chain
   a sink.
5. Q6 pays off the village guard's decade of deflection.

What must stay open: who paid for the robbery, how the hero came to have the
object, the four unbuilt regions, the banished tribe, and the Rat God.

---

## Open decisions

Each of these changes what gets built. They are recorded here rather than guessed
at.

### Q-1 — Does this fork diverge in content? **DECIDED: full divergence**

New areas, items and dialogue are in scope. Upstream syncing is not a goal any
more. Refactors no longer need to stay merge-friendly with upstream, and Q-5
(untracking `dist/`) loses its main argument for staying as it is.

### Q-2 — How far does Turkish go? **DECIDED: everything**

Interface, dialogue, and item / skill / location display names.

The consequence is the display-name indirection layer described in P-7. Registry
keys stay English forever, because they are save data; what gets translated is a
separate shown-name text id per entry. Nothing about this permits renaming a key.

### Q-3 — Are `help.html` and `changelog.html` in scope for Turkish?

Together they are the largest English surface in the repository and neither has
any i18n hook, or even a container to attach one to. Recommendation: a
hand-written Turkish help page, and an English-only changelog with a Turkish
note.

### Q-4 — Turkish address register **DECIDED: mixed, per NPC**

Elders, officials and the swampland chief are addressed formally; peers,
children and the informal cast are addressed informally. NPCs address the hero
informally, except officials on duty. The per-NPC map is in
[STORY.md](STORY.md#6-turkish-address-register).

Correction to the earlier framing: this needs **no** engine change. Register
being a second selectable axis would have required rewriting the lookup, but a
fixed per-NPC register is simply written into each line's Turkish text, and each
line is already a separate string id.

### Q-5 — Should `dist/` stay tracked?

Tracked, it is a guaranteed unmergeable conflict on every upstream sync.
Untracking is safe now that CI builds and the dev server runs from `src/`, but
both `.gitattributes` and the site builder were written on the assumption that it
stays tracked.

### Q-6 — Language switch: reload or live?

Persist-then-reload is a few lines and cannot desync. A true live switch needs a
"refresh every display" entry point that does not exist until the display module
is split.

---

## Conventions for this file

- One proposal per directive, numbered and never renumbered.
- When a proposal reaches `done`, write the explanation in
  [CHANGELOG.md](CHANGELOG.md) and leave the proposal here as a record.
- Decisions move from [Open decisions](#open-decisions) into the proposal that
  consumes them, with the answer recorded.
