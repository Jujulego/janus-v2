import { makeExecutableSchema } from '@graphql-tools/schema';
import { iterate$ } from 'kyrielle/subscriptions';

import { type Redirection } from '../state/redirection.ref.ts';
import { StateHolder } from '../state/state-holder.ts';
import typeDefs from './redirection.graphql';

// Resolver
export const RedirectionResolver = (state: StateHolder) => makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      redirection(_, args: { id: string }) {
        return state.redirections.get(args.id)?.read();
      },
      redirections() {
        const redirections: Redirection[] = [];

        for (const ref of state.redirections.find()) {
          redirections.push(ref.read());
        }

        return redirections;
      }
    },
    Mutation: {
      enableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        const ref = state.redirections.get(args.redirectionId);

        if (ref) {
          return ref.enableOutput(args.outputName);
        }
      },
      disableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        const ref = state.redirections.get(args.redirectionId);

        if (ref) {
          return ref.disableOutput(args.outputName);
        }
      }
    },
    Subscription: {
      redirection: {
        resolve: (redirection: Redirection | null) => redirection,
        async* subscribe(_, args: { id: string }) {
          const ref = state.redirections.get(args.id);

          if (ref) {
            yield ref.read();
            yield* iterate$(ref);
          }
        },
      }
    }
  }
});
