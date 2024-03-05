import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse';
import { Logger, withLabel } from '@kyrielle/logger';
import { createYoga } from 'graphql-yoga';

import { serverSchema } from './schema/schema.js';
import type { ServerStore } from './store/types.js';

// Tokens
export const YogaServer = (logger: Logger, store: ServerStore) => createYoga({
  graphqlEndpoint: '/_janus/graphql',
  logging: logger.child(withLabel('yoga')),
  schema: serverSchema(store),
  plugins: [useGraphQLSSE()]
});
