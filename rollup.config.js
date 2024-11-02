import { codecovRollupPlugin } from '@codecov/rollup-plugin';
import { swc } from '@jujulego/vite-plugin-swc';
import graphql from '@rollup/plugin-graphql';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs from 'node:fs/promises';
import { defineConfig } from 'rollup';

const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'));

export default defineConfig({
  input: {
    main: 'src/main.ts',
    index: 'src/index.ts',
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
    codecovRollupPlugin({
      enableBundleAnalysis: !!process.env.CODECOV_TOKEN,
      bundleName: 'janus-v2',
      uploadToken: process.env.CODECOV_TOKEN,
    })
  ],
  external: [
    ...Object.keys(pkg.dependencies),
    'react/jsx-runtime',
    'reflect-metadata/lite',
    'yargs/helpers',
  ]
});
