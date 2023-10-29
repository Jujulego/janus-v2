import { inject$, token$ } from '@jujulego/injector';
import ajv from 'ajv';

import { LabelledLogger } from './logger.config.js';

// Types
export type AjvParser = ajv.default;
export type AjvParserType = { new (opts: ajv.Options): AjvParser };

// Token
export const Ajv = token$(() => {
  return new (ajv as unknown as AjvParserType)({
    allErrors: true,
    logger: inject$(LabelledLogger('ajv')),
    strict: process.env.NODE_ENV === 'development' ? 'log' : true,
  });
});
