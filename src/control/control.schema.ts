import { makeExecutableSchema } from '@graphql-tools/schema';
import { token$ } from '@jujulego/injector';

import typeDefs from './schema.graphql';

// Tokens
export const ControlSchema = token$(() => makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      hello: () => 'Hello world!'
    }
  }
}));
