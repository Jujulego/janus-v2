import { inject$, token$ } from '@jujulego/injector';
import { cosmiconfig, defaultLoaders } from 'cosmiconfig';

import { Ajv } from '../ajv.config.ts';
import { dynamicImport } from '../utils/import.ts';
import schema from './schema.json';
import { Config } from './type.ts';

// Tokens
export const ConfigValidator = token$(
  () => inject$(Ajv).compile<Config>(schema)
);

export const ConfigExplorer = token$(
  () => cosmiconfig('janus', {
    loaders: {
      '.cjs': (filepath) => dynamicImport(filepath).then((mod) => mod.default),
      '.js': (filepath) => dynamicImport(filepath).then((mod) => mod.default),
      '.json': defaultLoaders['.json'],
      '.yaml': defaultLoaders['.yaml'],
      '.yml': defaultLoaders['.yml'],
      noExt: defaultLoaders.noExt,
    }
  })
);
