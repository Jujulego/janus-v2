import { inject$, singleton$, token$ } from '@jujulego/injector';
import ajv from 'ajv';

import { LabelledLogger } from './logger.config.ts';

// Types
export type AjvParser = ajv.default;
export type AjvParserType = new (opts: ajv.Options) => AjvParser;

// Token
export const Ajv = token$(
  () => new (ajv as unknown as AjvParserType)({
    allErrors: true,
    useDefaults: true,
    logger: inject$(LabelledLogger('ajv')),
    strict: process.env.NODE_ENV === 'development' ? 'log' : true,
  }),
  { modifiers: [singleton$()] }
);
