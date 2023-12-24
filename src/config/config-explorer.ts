import { token$ } from '@jujulego/injector';
import { cosmiconfig, defaultLoaders } from 'cosmiconfig';

import { dynamicImport } from '../utils/import.ts';

// Tokens
export const ConfigExplorer = token$(() => cosmiconfig('janus', {
  searchStrategy: 'global',
  loaders: {
    '.cjs': (filepath) => dynamicImport(filepath).then((mod) => mod.default),
    '.js': (filepath) => dynamicImport(filepath).then((mod) => mod.default),
    '.json': defaultLoaders['.json'],
    '.yaml': defaultLoaders['.yaml'],
    '.yml': defaultLoaders['.yml'],
    noExt: defaultLoaders.noExt,
  }
}));
