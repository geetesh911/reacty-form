/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/**
 * This file, when executed in the postbuild lifecycle, ensures that
 * the CJS output is valid CJS according to the package.json spec.
 *
 * @see https://nodejs.org/docs/latest/api/packages.html#packages_determining_module_system
 */

const assert = require('node:assert');
const fs = require('node:fs');

(async () => {
    const exported = await import('reacty-form');
    /**
     * When this fails, find the update one-liner in ./assert-esm-exports.mjs
     */
    const expected = JSON.parse(
        fs.readFileSync(require('node:path').resolve(__dirname, './all-exports.json'), 'utf-8'),
    );

    assert.deepStrictEqual(Object.keys(exported), expected);
})();
