import { makeExecutableSchema } from '@graphql-tools/schema';
import { iterate$ } from 'kyrielle/subscriptions';

import { selector$ } from '../../utils/selector.ts';
import { disableOutput, enableOutput } from '../store/outputs.slice.ts';
import { RedirectionState } from '../store/redirections.slice.js';
import type { ServerStore } from '../store/types.ts';
import typeDefs from './redirection.graphql';

// Resolver
export const redirectionResolver = (store: ServerStore) => makeExecutableSchema({
  typeDefs,
  resolvers: {
    Redirection: {
      outputs: function* (redirection: RedirectionState) {
        const state = store.getState();

        for (const outputId of redirection.outputs) {
          yield state.outputs[outputId];
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
        store.dispatch(enableOutput(`${args.redirectionId}-${args.outputName}`));
        const state = store.getState();

        return state.redirections[args.redirectionId];
      },
      disableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        store.dispatch(disableOutput(`${args.redirectionId}-${args.outputName}`));
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
