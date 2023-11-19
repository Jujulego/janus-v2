import { inject$, token$ } from '@jujulego/injector';
import { createYoga } from 'graphql-yoga';

import { LabelledLogger } from '../logger.config.ts';
import { ControlSchema } from './control.schema.js';

// Tokens
export const YogaServer = token$(() => {
  return createYoga({
    graphqlEndpoint: '/_janus/graphql',
    logging: inject$(LabelledLogger('yoga')),
    schema: inject$(ControlSchema),
  });
});
