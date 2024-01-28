import { makeExecutableSchema } from '@graphql-tools/schema';
import { iterate$ } from 'kyrielle/subscriptions';

import { selector$ } from '../../utils/selector.ts';
import { disableRedirectionOutput, enableRedirectionOutput } from '../store/redirections/actions.ts';
import { listRedirections } from '../store/redirections/selectors.ts';
import type { RedirectionState } from '../store/redirections/types.ts';
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
        const { redirections } = store.getState();
        return redirections.byId[args.id];
      },
      redirections() {
        return listRedirections(store.getState());
      }
    },
    Mutation: {
      enableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        store.dispatch(enableRedirectionOutput(args));

        const { redirections } = store.getState();
        return redirections.byId[args.redirectionId];
      },
      disableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        store.dispatch(disableRedirectionOutput(args));

        const { redirections } = store.getState();
        return redirections.byId[args.redirectionId];
      }
    },
    Subscription: {
      redirection: {
        resolve: (redirection: RedirectionState | null) => redirection,
        async* subscribe(_, args: { id: string }) {
          const ref = selector$(store, (state) => state.redirections.byId[args.id]);

          yield* iterate$(ref);
        },
      },
      redirections: {
        resolve: (redirections: RedirectionState[]) => redirections,
        async* subscribe() {
          const ref = selector$(store, listRedirections);

          yield* iterate$(ref);
        },
      },
    }
  }
});
