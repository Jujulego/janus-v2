import { createSchema } from 'graphql-yoga';

import { ServerStore } from '../store/types.js';
import schema from './schema.graphql';
import { prepareServerResolvers } from './resolvers.js';

export const prepareServerSchema = (store: ServerStore) => createSchema({
  typeDefs: schema,
  resolvers: prepareServerResolvers(store),
});