# AGENTS

**Canonical instructions: [docs/AGENTS.md](docs/AGENTS.md).** Read that file. It
is the single source of truth; if this stub and that file disagree, that file
wins. This one exists only because agent harnesses auto-discover a root
`AGENTS.md`.

Türkçe: [AGENTS.TR.md](AGENTS.TR.md) · [docs/AGENTS.TR.md](docs/AGENTS.TR.md)

---

This repository is a **continuation fork** of `miktaew/yet-another-idle-rpg` — a
browser-based text idle RPG in vanilla ES modules, bundled with esbuild. Upstream
development stopped; this fork continues it.

## Commands

```sh
npm install
npm run serve   # dev mode on :8080, no build step, edits live on reload
npm run build   # bundle -> dist/, deployable site -> _site/ (both untracked)
npm run check   # validate the built site and locale key parity
```

Requires Node 22+.

## Never do these

1. **Never rename a registry key** — item ids, location keys, dialogue and
   textline keys, skill ids, recipe ids, flag names, activity names. They are
   persisted verbatim in player save files, so renaming one silently breaks
   saves. This includes translating them.
2. **Never hardcode player-facing text in `src/`.** It belongs in
   `locales/<language>.js` behind a string id. Code comments are English.
3. **Never run `node build.js`.** It rewrites the tracked root `index.html` in
   place and stamps a commented-out script tag. Use `npm run build`.

## Also

- Documentation is bilingual: every `.md` ships as a `NAME.md` + `NAME.TR.md`
  pair, English canonical, both updated in the same change.
- Push directly to the default branch (`master`) — the Pages deploy only triggers
  there.
- Before writing narrative content, read [docs/STORY.md](docs/STORY.md). The
  standing rule is to continue the existing story, never rewrite it.
- Record new directives in [docs/PROPOSALS.md](docs/PROPOSALS.md); write completed
  work up in [docs/CHANGELOG.md](docs/CHANGELOG.md).

Everything else — repository shape, save-migration patterns, code style, the
circular-import and inline-handler gotchas — is in
[docs/AGENTS.md](docs/AGENTS.md).
