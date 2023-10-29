import { inject$, token$ } from '@jujulego/injector';
import { cosmiconfig, defaultLoaders } from 'cosmiconfig';

import { Ajv } from '../ajv.config.js';
import { dynamicImport } from '../utils/import.js';
import { Config } from './type.js';

// Schema
const schema = {
  $schema: 'http://json-schema.org/draft-07/schema',
  type: 'object',
  additionalProperties: false,
  required: ['services'],
  properties: {
    services: {
      type: 'object',
      additionalProperties: {
        $ref: '#/definitions/service'
      },
      minProperties: 1
    }
  },
  definitions: {
    gate: {
      type: 'object',
      additionalProperties: false,
      required: ['target'],
      properties: {
        target: {
          type: 'string'
        },
        enabled: {
          type: 'boolean',
          default: false
        },
        changeOrigin: {
          type: 'boolean',
          default: false
        },
        secure: {
          type: 'boolean',
          default: false
        },
        ws: {
          type: 'boolean',
          default: false
        }
      }
    },
    service: {
      type: 'object',
      additionalProperties: false,
      required: ['url', 'gates'],
      properties: {
        url: {
          type: 'string'
        },
        gates: {
          type: 'object',
          minProperties: 1,
          additionalProperties: {
            $ref: '#/definitions/gate'
          }
        }
      }
    }
  }
};

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
