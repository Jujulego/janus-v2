import { swc } from '@jujulego/vite-plugin-swc';
import json from '@rollup/plugin-json';

/** @type {import('rollup').RollupOptions} */
const options = {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    swc(),
    json(),
  ],
  external: [
    '@jujulego/aegis',
    '@jujulego/injector',
    '@jujulego/logger',
    '@jujulego/quick-tag',
    '@jujulego/utils',
    'ajv',
    'chalk-template',
    'cosmiconfig',
    'http-errors',
    'http-proxy',
    'node:crypto',
    'node:http',
    'node:os',
    'node:stream',
    'reflect-metadata',
    'yargs',
    'yargs/helpers'
  ],
};

export default options;
