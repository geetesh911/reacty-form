import pkg from '../../package.json';

import { createRollupConfig } from './createRollupConfig';

const name = 'index';
const external = [];
const options = [
    {
        name,
        format: 'cjs',
        input: pkg.source,
        external,
    },
    { name, format: 'esm', input: pkg.source, external },
    {
        name: 'react-server',
        format: 'esm',
        input: 'src/index.react-server.ts',
        external,
    },
    {
        name,
        format: 'umd',
        input: pkg.source,
        external,
    },
];

export default options.map((option) => createRollupConfig(option));
