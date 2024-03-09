import { swc } from '@jujulego/vite-plugin-swc';
import graphql from '@rollup/plugin-graphql';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import pkg from './package.json' assert { type: 'json' };

/** @type {import('rollup').RollupOptions} */
const options = {
  input: {
    main: 'src/main.ts',
    daemon: 'src/daemon/daemon.ts'
  },
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    chunkFileNames: '[name].js',
    generatedCode: 'es5'
  },
  plugins: [
    nodeResolve({ exportConditions: ['node'] }),
    graphql(),
    json(),
    swc(),
  ],
  external: [
    ...Object.keys(pkg.dependencies),
    'react/jsx-runtime',
    'reflect-metadata/lite',
    'yargs/helpers',
  ]
};

export default options;
