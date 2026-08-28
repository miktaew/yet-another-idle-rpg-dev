/**
 * Evaluates dist/bundle.js the way a browser does, and fails if it throws.
 *
 * The imports in src/ are circular by design - many modules import back from main.js -
 * and that cycle only resolves in a browser, where main.js is the entry point. Which
 * means adding one import edge can change esbuild's evaluation order enough to construct
 * a class before its own definition has run, and the bundle throws on load:
 *
 *     Uncaught TypeError: ee is not a constructor
 *
 * The page is then blank and every global the game exposes is undefined. Nothing in a
 * source-reading check can see it, because the fault is in the order the ARTEFACT
 * evaluates, and `node build.js` succeeds - esbuild has no complaint about a cycle it
 * resolved. dist/bundle.js is committed, so a bundle in that state ships.
 *
 * So this imports the bundle with the browser globals stubbed just far enough to get
 * through module evaluation. It deliberately does NOT try to run the game: once the
 * modules have evaluated, main.js has started its timers and the point is already made.
 *
 * What it catches: a cycle-ordering fault, a missing import esbuild left as a runtime
 * global, a syntax or TDZ error in any module. What it cannot: anything needing a real
 * DOM, which is everything after the modules have loaded.
 *
 * No dependencies and no package.json - only node builtins.
 *
 * Run with: node tests/bundle-loads.mjs
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const repo_root = path.resolve(import.meta.dirname, "..");
const bundle = path.join(repo_root, "dist", "bundle.js");

if (!fs.existsSync(bundle)) {
    console.error("[check-bundle] dist/bundle.js is missing - run node build.js first.");
    process.exit(1);
}

/**
 * A value that answers to anything: property reads, calls, construction, iteration.
 * Enough for module-scope DOM lookups, which is all this needs to get past.
 */
function anything() {
    return new Proxy(function () {}, {
        get(target, key) {
            if (key === Symbol.toPrimitive || key === "toString") return () => "";
            if (key === Symbol.iterator) return function* () {};
            if (key === "length") return 0;
            return anything();
        },
        set: () => true,
        has: () => true,
        apply: () => anything(),
        construct: () => anything(),
    });
}

globalThis.window = globalThis;
globalThis.document = anything();
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.Audio = function () { return anything(); };
globalThis.requestAnimationFrame = () => 0;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.getComputedStyle = () => anything();
globalThis.location = {
    host: "localhost", pathname: "/", href: "http://localhost/",
    protocol: "http:", search: "", hash: "", reload() {},
};
globalThis.history = { replaceState() {}, pushState() {} };
globalThis.alert = () => {};
globalThis.prompt = () => null;
globalThis.confirm = () => false;
globalThis.fetch = () => Promise.resolve({ ok: false, text: () => Promise.resolve("") });
//navigator is a getter-only global in Node.
try {
    Object.defineProperty(globalThis, "navigator", {
        value: { language: "en" }, configurable: true,
    });
} catch {}

/*
    The import runs in a child process. Getting through module evaluation means main.js
    has started its timers, and nothing then makes the process exit - so the parent gives
    the child a window, kills it, and reads the verdict off what it printed. A load-time
    throw surfaces in well under a second; silence for the whole window is a pass.
*/
const EVALUATION_WINDOW_MS = 12000;

if (process.argv[2] === "--child") {
    /*
        Copied to a .mjs path before importing. Node decides a .js file's module kind from
        the nearest package.json, and this repo has none - so dist/bundle.js would be
        treated as CommonJS and fail on the first piece of ESM syntax with a SyntaxError,
        which looks exactly like the fault this test exists to find. The extension settles
        it.
    */
    const as_module = path.join(os.tmpdir(), `bundle-check-${process.pid}.mjs`);
    fs.copyFileSync(bundle, as_module);
    process.on("exit", () => { try { fs.unlinkSync(as_module); } catch {} });

    import(pathToFileURL(as_module).href).catch(problem => {
        console.error(`THREW ${problem.name}: ${problem.message}`);
        process.exit(1);
    });
} else {
    const { spawn } = await import("node:child_process");
    const child = spawn(process.execPath, [import.meta.filename, "--child"], {
        stdio: ["ignore", "inherit", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", chunk => { stderr += chunk; });

    const verdict = await new Promise(resolve => {
        const timer = setTimeout(() => {
            child.kill();
            resolve({ ok: true });
        }, EVALUATION_WINDOW_MS);

        child.on("exit", code => {
            clearTimeout(timer);
            resolve({ ok: code === 0 && !stderr.includes("THREW"), code });
        });
    });

    if (!verdict.ok) {
        const reported = stderr.trim().replace(/^[\s\S]*?THREW /, "");
        console.error(`[check-bundle] the bundle threw while evaluating: ${reported}`);
        console.error("[check-bundle] this is a load-time fault - the game would show a blank page.");
        process.exit(1);
    }

    console.log("[check-bundle] the bundle evaluates without throwing.");
}
