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
  required: ['redirections'],
  properties: {
    pidfile: {
      type: 'string',
      default: '.janus.pid'
    },
    proxy: {
      type: 'object',
      additionalProperties: false,
      properties: {
        port: {
          type: 'number',
          default: 3000
        }
      }
    },
    redirections: {
      type: 'array',
      items: {
        $ref: '#/definitions/redirection'
      },
      minItems: 1
    }
  },
  definitions: {
    output: {
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
    redirection: {
      type: 'object',
      additionalProperties: false,
      required: ['url', 'outputs'],
      properties: {
        url: {
          type: 'string'
        },
        outputs: {
          type: 'object',
          minProperties: 1,
          additionalProperties: {
            $ref: '#/definitions/output'
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
