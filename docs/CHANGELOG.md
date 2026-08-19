<!-- doc-source: docs/CHANGELOG.md  doc-version: 5 -->

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
