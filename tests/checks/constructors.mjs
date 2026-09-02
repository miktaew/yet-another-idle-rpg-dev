/** Constructors, and fields read before they hold anything. */

import * as fs from "node:fs";
import * as path from "node:path";
import { repo_root } from "../lib/context.mjs";
import { error } from "../lib/report.mjs";
import { strip_comments, braced_body, source_files } from "../lib/source.mjs";

/** The names a parameter list introduces, positional or destructured, defaults stripped. */
function parameter_names(text) {
    const names = new Set();
    for (const found of text.matchAll(/([A-Za-z_$][\w$]*)\s*(?:=[^,}]*)?(?=\s*[,})]|$)/g)) {
        names.add(found[1]);
    }
    return names;
}

/** Each constructor in a file, as {parameters, body}. */
function constructors_in(source) {
    const found = [];
    for (const opening of source.matchAll(/\bconstructor\s*\(/g)) {
        let at = opening.index + opening[0].length;
        const parameters_from = at;
        let depth = 1;
        while (at < source.length && depth > 0) {
            if (source[at] === "(") depth++;
            else if (source[at] === ")") depth--;
            at++;
        }
        const parameters = parameter_names(source.slice(parameters_from, at - 1));

        while (at < source.length && source[at] !== "{" && source[at] !== ";") at++;
        if (source[at] !== "{") continue;
        found.push({parameters, body: braced_body(source, at)});
    }
    return found;
}

/**
 * Every `if (…)` in a body: its condition text, where it starts, and where it ENDS.
 *
 * The end matters as much as the start. An `if` that guards its own assignment -
 * `if(!this.getName) { this.getName = getName; }` - has the store inside its own span, and
 * that is a presence test rather than a mistake: `Item`'s base constructor takes the
 * fallback only when a subclass has not already defined `getName` on the prototype. Testing
 * "does the store come after the `if` STARTS" flags it; testing "does the store lie outside
 * the `if` entirely" does not.
 */
function conditions_in(body) {
    const conditions = [];
    for (const opening of body.matchAll(/\bif\s*\(/g)) {
        let at = opening.index + opening[0].length;
        let depth = 1;
        while (at < body.length && depth > 0) {
            if (body[at] === "(") depth++;
            else if (body[at] === ")") depth--;
            at++;
        }
        const text = body.slice(opening.index, at);

        //Then the statement the condition governs, braced or single.
        let after = at;
        while (after < body.length && /\s/.test(body[after])) after++;
        let ends;
        if (body[after] === "{") {
            ends = after + braced_body(body, after).length + 2;
        } else {
            const semicolon = body.indexOf(";", after);
            ends = semicolon === -1 ? body.length : semicolon + 1;
        }

        conditions.push({at: opening.index, ends, text});
    }
    return conditions;
}

/**
 * A constructor does not validate a field before it has stored it.
 *
 * The bug this is the net under, found by `npm run check:types` and not by anything else:
 *
 *     this.description = description;
 *     if(this.target_count < 1) {
 *         throw("Combat stance cannot target less than 1 enemy!");
 *     }
 *     this.target_count = target_count;
 *
 * `this.target_count` is assigned on the line *after* the check, so the check read
 * `undefined` every time it ran. `undefined < 1` is false, so a stance declared with
 * `target_count: 0` was accepted in silence and that message had never once been printed.
 * Nothing failed, nothing was logged, and the validation had been dead since it was written.
 *
 * **The rule is narrow on purpose, and the wider one was measured first.** "A constructor
 * reads `this.X` before assigning it" finds thirteen places in this codebase and every one of
 * them is deliberate: `if(!this.id) { this.id = this.getName(); }` is a presence test that
 * has to read the field to work, and `this.draw = () => ... this.y ...` is a closure that
 * runs long after the constructor returned. A check that reports thirteen correct lines to
 * catch one wrong one is a check that gets switched off.
 *
 * So it asks for all three parts of the actual mistake: the constructor takes a parameter
 * `X`, it stores it plainly as `this.X = X`, and it tests `this.X` in an `if` **before** that
 * store. When a parameter is stored plainly there is no reason to read the field instead of
 * the parameter, and every reason not to - so this shape is always the mistake, and the
 * thirteen legitimate reads have none of the three parts.
 */
function check_constructors_do_not_test_fields_before_setting_them() {
    let scanned = 0;
    for (const relative of source_files(repo_root)) {
        const source = strip_comments(
            fs.readFileSync(path.join(repo_root, relative), "utf8"));

        for (const {parameters, body} of constructors_in(source)) {
            scanned++;
            const conditions = conditions_in(body);

            for (const name of parameters) {
                //The plain store, and nothing cleverer: `this.X = X;` exactly.
                const store = new RegExp(`this\\.${name}\\s*=\\s*${name}\\s*;`).exec(body);
                if (store === null) continue;

                const reads = new RegExp(`this\\.${name}\\b`);
                for (const {at, ends, text} of conditions) {
                    if (at >= store.index || !reads.test(text)) continue;
                    //Skip an `if` that guards this very store - see conditions_in.
                    if (store.index < ends) continue;
                    error(`${relative}: a constructor tests \`this.${name}\` in `
                        + `\`${text.replace(/\s+/g, " ").slice(0, 60)}\` before assigning it `
                        + `- \`this.${name} = ${name}\` comes later, so the test reads `
                        + `undefined and cannot do what it was written to do. Test the `
                        + `parameter \`${name}\` instead.`);
                }
            }
        }
    }

    console.log(`[check] constructors: ${scanned} scanned, none testing a field it has `
        + `not stored yet`);
}

export { check_constructors_do_not_test_fields_before_setting_them };
