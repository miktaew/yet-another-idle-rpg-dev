# Yet Another Idle RPG

A text-based idle RPG with a heavy focus on progression through skill levelling.
Browser-only, no framework: vanilla ES modules bundled with esbuild.

**Play:** <https://kuroiteiken.github.io/yairp/>

Türkçe: [README.TR.md](README.TR.md)

---

## About this repository

This is a **continuation fork**. The original game is by
[Miktaew](https://github.com/miktaew/yet-another-idle-rpg); upstream development
has stopped, and this repository picks it up from there.

The goal is to continue the existing story rather than replace it — paying off
hooks the original author left open, bringing content that exists in the
repository but is unreachable in-game into reach, and adding a Turkish language
option. Existing characters, lore, quests and item descriptions are treated as
canon.

Whether to sync any remaining upstream work is still undecided; see
[docs/PROPOSALS.md](docs/PROPOSALS.md).

> **Still in development, and the balance is a work in progress.** Use the
> in-game **export** feature regularly. There is always a risk that a
> save-breaking bug slips through.

---

## Running locally

The game runs with **no build step**. `index.html` loads `src/main.js` directly,
so any static file server works — the only requirement is a server rather than
opening the file, because ES modules are subject to CORS.

```sh
npm install
npm run serve        # http://127.0.0.1:8080
```

Edit anything under `src/` or `locales/` and reload. No rebuild.

`npm run serve` uses esbuild's built-in static server, so the only dependency in
this project is esbuild itself.

## Building

```sh
npm run build        # bundle -> dist/, deployable site -> _site/
npm run check        # validate the built site and locale key parity
npm run serve:site   # http://127.0.0.1:8081 - preview the built site
```

`npm run build` does two things: it bundles `src/main.js` into `dist/bundle.js`,
and it assembles the deployable site into `_site/`, where the `index.html` copy is
rewritten to load the bundle instead of `src/main.js` and stamped with the current
version for cache busting.

Two consequences worth knowing:

- **The root `index.html` is the dev entry point and is never rewritten in
  place.** Its `style.css?version=…` string is deliberately stale; only the
  `_site/` copy gets stamped. Do not "fix" it by hand.
- **A new locale file needs a rebuild to work in bundle mode.** esbuild resolves
  the dynamic `import()` in `src/translation.js` by globbing `locales/` at build
  time and inlining every match. Dev mode fetches locales at runtime and needs no
  rebuild. CI rebuilds on every push, so this only affects local bundle-mode
  testing.

`npm run check` is also the guard for translations: keys that do not exist in the
default locale fail the build, and missing translations are reported as a
coverage percentage. Run it with `LOCALE_STRICT=1` to make missing translations
fatal.

Requires Node **22 or newer**.

## Deploying

Pushing to the default branch triggers
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which
builds, validates, and publishes `_site/` to GitHub Pages. Documentation-only
pushes are skipped. There is nothing to do by hand.

---

## Repository layout

| Path | What it is |
| --- | --- |
| `index.html` | The game page, and the dev entry point. |
| `src/` | All game code. Systems and content registries. |
| `locales/` | Player-facing text, keyed by string id. |
| `dist/bundle.js` | Committed build output. Regenerate with `npm run build`. |
| `resources/` | Fonts, images, and vendored HackTimer. |
| `help.html` | In-game help. |
| `changelog.html` | In-game, player-facing version history. |
| `scripts/` | Build and validation scripts. |
| `docs/` | Developer and agent documentation. |

## Modding and reusing this as an engine

Content lives in registries in `src/` — items, locations, enemies, skills,
dialogues, quests, recipes and so on — and all player-facing text lives in
`locales/`. Adding content means adding registry entries plus their text ids.

Two things to know before you start:

- **Registry keys are persisted in save files verbatim.** Renaming an item id, a
  location key, a skill id or a flag name silently breaks existing saves.
- **`Verify_Game_Objects()`** is available in the browser console. It walks most
  of the content checking that properties have acceptable values and that
  references between objects resolve. It is neither infallible nor exhaustive, but
  it will save you time.

If you publish a mod, please say that it is a mod rather than an original
creation, and link back — both to this repository and to
[the original](https://github.com/miktaew/yet-another-idle-rpg).

## Documentation

Every document is a pair: the English file is canonical, the `.TR.md` file is its
Turkish translation.

| Document | Purpose |
| --- | --- |
| [docs/AGENTS.md](docs/AGENTS.md) · [TR](docs/AGENTS.TR.md) | **Canonical** conventions and instructions for developers and AI agents. |
| [docs/STORY.md](docs/STORY.md) · [TR](docs/STORY.TR.md) | Narrative canon: world, protagonist, tone, and where the story currently stops. |
| [docs/PROPOSALS.md](docs/PROPOSALS.md) · [TR](docs/PROPOSALS.TR.md) | Working backlog, standing directives and open decisions. |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) · [TR](docs/CHANGELOG.TR.md) | Development history with reasoning. |

## Contributing

Contributions are welcome — improvements, better dialogue, new locations, items,
enemies or skills.

Please open an issue or pull request, and get in touch first for anything that
touches progression. Raw text fixes and other self-explanatory changes can go
straight in. Read [docs/AGENTS.md](docs/AGENTS.md) first: it is the single source
of truth for conventions, and it documents the save-compatibility rules that are
easy to break by accident.

## Credits and licence

Created by **Miktaew**, inspired by Proto23. Continued in this fork.

Released under the MIT licence — see [LICENSE](LICENSE). The original copyright
notice is retained, as the licence requires.

Vendored [HackTimer](resources/js/HackTimer/) is third-party MIT-licensed code and
carries its own licence file.

If you want to support the person who created the game, their Ko-fi is at
<https://ko-fi.com/miktaew>.
