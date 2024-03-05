import { mergeResolvers } from '@graphql-tools/merge';
import { createSchema } from 'graphql-yoga';

import { ServerStore } from '../store/types.js';
import { redirectionResolvers } from './redirections/resolvers.js';
import schema from './schema.graphql';

export const serverSchema = (store: ServerStore) => createSchema({
  typeDefs: schema,
  resolvers: mergeResolvers([
    redirectionResolvers(store)
  ]),
});
