import { makeExecutableSchema } from '@graphql-tools/schema';
import { iterate$ } from '@jujulego/event-tree';
import { inject$, token$ } from '@jujulego/injector';

import { RedirectionStore } from '../data/redirection.store.ts';
import typeDefs from './redirection.graphql';
import { Redirection } from '../data/redirection.js';

// Tokens
export const RedirectionSchema = token$(() => makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      redirection(_, args: { id: string }) {
        const store = inject$(RedirectionStore);
        return store.get(args.id)?.read();
      }
    },
    Subscription: {
      redirection: {
        resolve: (redirection: Redirection | null) => redirection,
        async* subscribe(_, args: { id: string }) {
          const store = inject$(RedirectionStore);
          const ref = store.get(args.id);

          if (ref) {
            yield ref.read();

            for await (const redirection of iterate$(ref)) {
              yield redirection;
            }
          }
        },
      }
    }
  }
}));
