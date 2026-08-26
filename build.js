"use strict";

/**
 * Superseded. Use `npm run build`, which runs scripts/build-site.js.
 *
 * This was the pre-fork builder. It is kept under its original name so that
 * anyone following older instructions, or their own muscle memory, gets this
 * message instead of a silently damaged working tree - because that is what it
 * used to do:
 *
 *   1. It rewrote the TRACKED root index.html in place. That file is the dev
 *      entry point and deliberately loads src/main.js with a deliberately stale
 *      style.css version; scripts/build-site.js rewrites the _site/ copy instead
 *      and never touches the original. Running this dirtied a tracked file on
 *      every build.
 *
 *   2. Its bundle-version regex, /dist\/bundle\.js\?version=[^&"]+/, has exactly
 *      one match in index.html - and it is inside the COMMENTED-OUT script tag
 *      that sits next to the live one. So it stamped a dead comment and left the
 *      script the game actually loads untouched, while reporting success.
 *
 * Neither is a hypothetical. Both are why this was never wired to an npm script.
 * The replacement does the same bundling and then assembles _site/ from it, which
 * is what the deploy uploads.
 */

console.error("build.js is superseded and does nothing.");
console.error("");
console.error("Use:  npm run build");
console.error("");
console.error("It bundles src/main.js into dist/bundle.js exactly as this did, then");
console.error("assembles the deployable site into _site/ - rewriting the COPY of");
console.error("index.html rather than the tracked original, which is what this used to");
console.error("do wrong. See scripts/build-site.js and docs/AGENTS.md section 3.");
process.exit(1);
