/**
 * Evaluates the built bundle the way a browser does, and fails if it throws.
 *
 * This is the check that was missing when v0.6.27 shipped broken. Adding two imports to
 * conditions.js created one more edge in a module graph that is already circular by
 * design, and that edge changed esbuild's evaluation order enough to construct a class
 * before its own definition had run. The bundle threw
 *
 *     Uncaught TypeError: ee is not a constructor
 *
 * on load, which left get_game_version undefined and the game dead on a blank page - and
 * the build succeeded, all 31 checks passed and all 115 tests passed, because every one
 * of them reads source text or stubs the cycle away. Nothing evaluated the artefact.
 *
 * So this imports dist/bundle.js with the browser globals stubbed just far enough to get
 * through module evaluation. It deliberately does NOT try to run the game: once the
 * modules have evaluated, main.js starts timers and the point is already made. A fixed
 * window is allowed for evaluation, then the process reports and exits.
 *
 * What it can catch: a cycle-ordering fault, a missing import that esbuild left as a
 * runtime global, a syntax or TDZ error in any module. What it cannot: anything that
 * needs a real DOM, which is everything after the modules have loaded.
 *
 * Run with: npm run check:bundle
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const repo_root = path.resolve(import.meta.dirname, "..");
const bundle = path.join(repo_root, "dist", "bundle.js");

if (!fs.existsSync(bundle)) {
    console.error("[check-bundle] dist/bundle.js is missing - run npm run build first.");
    process.exit(1);
}

/*
    A bundle older than the source it was built from is the wrong artefact, and testing it
    says nothing about the code that was just written. This has already happened: a build
    failed on a syntax error, and this check went on to load the previous bundle and pass.
*/
{
    const built_at = fs.statSync(bundle).mtimeMs;
    const newer = [];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith(".js") && fs.statSync(full).mtimeMs > built_at) {
                newer.push(path.relative(repo_root, full));
            }
        }
    };
    walk(path.join(repo_root, "src"));

    if (newer.length > 0) {
        console.error(`[check-bundle] dist/bundle.js is older than ${newer.length} file(s) in`
            + ` src/ - so this would be testing the previous build. Run npm run build first.`);
        console.error(`[check-bundle] newest: ${newer.slice(0, 3).join(", ")}`);
        process.exit(1);
    }
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
    import(pathToFileURL(bundle).href).catch(problem => {
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
