/**
 * What the checks found, and how they say it.
 *
 * Collected rather than printed as they go, so the run reports everything it
 * found instead of stopping at the first fault.
 */

const errors = [];
const warnings = [];
function error(message) { errors.push(message); }
function warn(message) { warnings.push(message); }

export {
    error,
    errors,
    warn,
    warnings,
};
