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
    {
      async resolveId (source, importer, options) {
        if (source.match(/\.jsx?$/)) {
          const ts = source.replace(/\.js(x?)$/, '.ts$1');
          return await this.resolve(ts, importer, options);
        }
      }
    },
    swc(),
  ],
  external: [
    ...Object.keys(pkg.dependencies),
    'reflect-metadata/lite',
    'yargs/helpers',
  ]
};

export default options;
