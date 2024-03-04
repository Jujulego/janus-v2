import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse';
import { Logger, withLabel } from '@kyrielle/logger';
import { createYoga } from 'graphql-yoga';

import type { ServerStore } from './store/types.ts';
import { redirectionsSchema } from './schema/redirections/schema.ts';

// Tokens
export const YogaServer = (logger: Logger, store: ServerStore) => createYoga({
  graphqlEndpoint: '/_janus/graphql',
  logging: logger.child(withLabel('yoga')),
  schema: redirectionsSchema(store),
  plugins: [useGraphQLSSE()]
});
