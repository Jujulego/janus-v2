import { inject$, token$ } from '@jujulego/injector';
import { createYoga } from 'graphql-yoga';

import { LabelledLogger } from '../logger.config.ts';
import { RedirectionSchema } from './redirection.schema.ts';

// Tokens
export const YogaServer = token$(() => {
  return createYoga({
    graphqlEndpoint: '/_janus/graphql',
    logging: inject$(LabelledLogger('yoga')),
    schema: inject$(RedirectionSchema),
  });
});
