import { makeExecutableSchema } from '@graphql-tools/schema';
import { iterate$ } from 'kyrielle/subscriptions';

import { selector$ } from '../../utils/selector.ts';
import { disableRedirectionOutput, enableRedirectionOutput, RedirectionState } from '../store/redirections.slice.ts';
import type { ServerStore } from '../store/types.ts';
import typeDefs from './redirection.graphql';

// Resolver
export const redirectionResolver = (store: ServerStore) => makeExecutableSchema({
  typeDefs,
  resolvers: {
    Redirection: {
      outputs: function* (redirection: RedirectionState) {
        for (const outputName of redirection.outputs) {
          yield redirection.outputsByName[outputName];
        }
      }
    },
    Query: {
      redirection(_, args: { id: string }) {
        const state = store.getState();
        return state.redirections[args.id];
      },
      redirections() {
        const state = store.getState();
        return Object.values(state.redirections);
      }
    },
    Mutation: {
      enableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        store.dispatch(enableRedirectionOutput(args));
        const state = store.getState();

        return state.redirections[args.redirectionId];
      },
      disableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        store.dispatch(disableRedirectionOutput(args));
        const state = store.getState();

        return state.redirections[args.redirectionId];
      }
    },
    Subscription: {
      redirection: {
        resolve: (redirection: RedirectionState | null) => redirection,
        async* subscribe(_, args: { id: string }) {
          const ref = selector$(store, (state) => state.redirections[args.id]);

          yield ref.read();
          yield* iterate$(ref);
        },
      }
    }
  }
});
