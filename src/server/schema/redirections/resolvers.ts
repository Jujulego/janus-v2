import { iterate$ } from 'kyrielle';

import { selector$ } from '../../../utils/selector.js';
import { disableRedirectionOutput, enableRedirectionOutput } from '../../store/redirections/actions.js';
import { allRedirections, getRedirection } from '../../store/redirections/selectors.js';
import { ServerStore } from '../../store/types.js';
import { Resolvers } from '../schema.types.js';
import { mapRedirection, mapRedirectionList } from './utils.js';

// Resolvers
export const redirectionResolvers = (store: ServerStore): Resolvers => ({
  Query: {
    redirection: (_, { id }) => mapRedirection(getRedirection(store.getState(), id)),
    redirections: () => mapRedirectionList(allRedirections(store.getState())),
  },
  Subscription: {
    redirection: {
      subscribe: (_, { id }) => iterate$(selector$(store, ({ redirections }) => redirections.byId[id])),
      resolve: mapRedirection
    },
    redirections: {
      subscribe: () => iterate$(selector$(store, allRedirections)),
      resolve: mapRedirectionList
    }
  },
  Mutation: {
    enableRedirectionOutput(_, args) {
      store.dispatch(enableRedirectionOutput(args));
      return mapRedirection(getRedirection(store.getState(), args.redirectionId));
    },
    disableRedirectionOutput(_, args) {
      store.dispatch(disableRedirectionOutput(args));
      return mapRedirection(getRedirection(store.getState(), args.redirectionId));
    },
  },
});
