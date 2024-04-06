import { swc } from '@jujulego/vite-plugin-swc';
import graphql from '@rollup/plugin-graphql';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '.vite',
  test: {
    coverage: {
      include: ['src/**'],
      reporter: ['text', 'lcovonly'],
    },
    globals: true,
    setupFiles: ['tests/setup.ts'],
    typecheck: {
      tsconfig: 'tests/tsconfig.json',
    }
  },
  plugins: [
    tsconfigPaths(),
    (graphql as unknown as typeof graphql.default)(),
    swc()
  ]
});
