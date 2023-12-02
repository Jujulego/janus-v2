import { makeExecutableSchema } from '@graphql-tools/schema';
import { inject$, token$ } from '@jujulego/injector';
import { iterate$ } from 'kyrielle/subscriptions';

import { type Redirection } from '../state/redirection.ref.ts';
import { RedirectionStore } from '../state/redirection.store.ts';
import typeDefs from './redirection.graphql';

// Tokens
export const RedirectionSchema = token$(() => makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      redirection(_, args: { id: string }) {
        const store = inject$(RedirectionStore);
        return store.get(args.id)?.read();
      },
      redirections() {
        const store = inject$(RedirectionStore);
        const redirections: Redirection[] = [];

        for (const ref of store.find()) {
          redirections.push(ref.read());
        }

        return redirections;
      }
    },
    Mutation: {
      enableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        const store = inject$(RedirectionStore);
        const ref = store.get(args.redirectionId);

        if (ref) {
          return ref.enableOutput(args.outputName);
        }
      },
      disableRedirectionOutput(_, args: { redirectionId: string, outputName: string }) {
        const store = inject$(RedirectionStore);
        const ref = store.get(args.redirectionId);

        if (ref) {
          return ref.disableOutput(args.outputName);
        }
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
            yield* iterate$(ref);
          }
        },
      }
    }
  }
}));
