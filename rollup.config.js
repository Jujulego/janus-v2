import { swc } from '@jujulego/vite-plugin-swc';
import graphql from '@rollup/plugin-graphql';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import pkg from './package.json' assert { type: 'json' };

/** @type {import('rollup').RollupOptions} */
const options = {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({
      exportConditions: ['node']
    }),
    graphql(),
    json(),
    swc(),
  ],
  external: [
    ...Object.keys(pkg.dependencies),
    'yargs/helpers',
  ],
};

export default options;
