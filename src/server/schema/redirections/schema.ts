import { createSchema } from 'graphql-yoga';
import { iterate$ } from 'kyrielle';

import { selector$ } from '../../../utils/selector.js';
import { disableRedirectionOutput, enableRedirectionOutput } from '../../store/redirections/actions.js';
import { listRedirections } from '../../store/redirections/selectors.js';
import type { RedirectionState } from '../../store/redirections/types.js';
import type { ServerStore } from '../../store/types.js';
import schema from '../schema.graphql';

// Resolver
export const redirectionsSchema = (store: ServerStore) => createSchema({
  typeDefs: schema,
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
        subscribe: (_, args: { id: string }) => iterate$(selector$(store, (state) => state.redirections.byId[args.id])),
      },
      redirections: {
        resolve: (redirections: RedirectionState[]) => redirections,
        subscribe: () => iterate$(selector$(store, listRedirections)),
      },
    }
  }
});
