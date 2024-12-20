import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
/**
 * This file, when executed in the postbuild lifecycle, ensures that
 * the ESM output is valid ESM according to the package.json spec.
 *
 * @see https://nodejs.org/docs/latest/api/packages.html#packages_determining_module_system
 */
import * as exported from 'per-form';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * A shell one-liner to update this array when neccessary (run from root of repo):
 *  node -e "import('per-form').then((mod) => console.log(JSON.stringify(Object.keys(mod), null, 2)))" > scripts/rollup/all-exports.json
 */
const expected = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './all-exports.json'), 'utf-8'),
);

assert.deepStrictEqual(Object.keys(exported), expected);
