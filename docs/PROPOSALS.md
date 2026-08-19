<!-- doc-source: docs/PROPOSALS.md  doc-version: 1 -->

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

### P-4 — Rewrite `README.md` `active`

The current README describes the upstream project, not this fork, and several of
its claims are now false (`npm run build` with no `package.json`, a
`live-server` recommendation for a dependency that no longer exists, upstream
branch layout). Rewrite it for this repository, with a Turkish pair.

### P-5 — Documentation structure `active`

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

### P-6 — Remove references to the upstream deployment `active`

Assets, repository links and the visitor counter must resolve against this
repository and this deployment, not the upstream one.

Attribution is deliberately **not** removed: the MIT licence requires retaining
the original copyright notice, and the original author asked that forks credit
and link the original. Asset and infrastructure references move; credit stays
and is relabelled honestly.

### P-7 — Turkish language support in the game `blocked`

Add a Turkish option to the game itself. The translation layer already exists
but currently covers dialogue and part of the UI only.

Blocked on decisions Q-1, Q-2 and Q-4 — in particular Q-4, because the Turkish
address register changes verb agreement in every NPC line and cannot be
retrofitted with find-and-replace.

Groundwork already shipped: `npm run check` gates locale key parity, so a second
locale cannot silently drift out of sync (P-2).

### P-8 — Fix the reported NaN warnings `open`

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

### P-9 — Continue the story `open`

Depends on P-1's narrative pass and on `docs/STORY.md` existing. Scope: pay off
open hooks, wire up orphaned content, and extend the quest chain from the current
frontier.

---

## Open decisions

Each of these changes what gets built. They are recorded here rather than guessed
at.

### Q-1 — Does this fork diverge in content?

"Hosting, Turkish and configuration only" keeps the fork fast-forwardable
against upstream. "New areas, items and dialogue" means full divergence and no
more syncing. There is no middle option, because the codebase has no mod
boundary. This answer sets the ceiling for Q-2 and for P-9.

### Q-2 — How far does Turkish go?

Interface plus story dialogue is roughly a tenth of the work of translating the
whole content layer, and it covers what a player reads most. Translating item,
skill and location names additionally requires separating registry keys from
display names, because the keys are currently the display names and are also
persisted verbatim in save files. Stopping after the interface and dialogue is a
defensible product decision, not a half-finished job.

### Q-3 — Are `help.html` and `changelog.html` in scope for Turkish?

Together they are the largest English surface in the repository and neither has
any i18n hook, or even a container to attach one to. Recommendation: a
hand-written Turkish help page, and an English-only changelog with a Turkish
note.

### Q-4 — Turkish address register: informal or formal?

Must be settled before any dialogue is authored. The existing text-variant
mechanism cannot express register as a second axis without rewriting the lookup,
because it is hardwired to one flag and one key prefix.

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
