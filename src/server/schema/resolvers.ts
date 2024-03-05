import { RedirectionState } from '../store/redirections/types.js';
import { ServerStore } from '../store/types.js';
import { Redirection, Resolvers } from './schema.types.js';
import { listRedirections } from '../store/redirections/selectors.js';

// Resolvers
export const prepareServerResolvers = (store: ServerStore): Resolvers => ({
  Query: {
    redirection(_, args) {
      const { redirections } = store.getState();
      return formatRedirection(redirections.byId[args.id]);
    },
    redirections() {
      const redirections = listRedirections(store.getState());
      return redirections.map(formatRedirection);
    }
  }
});

// Utils
function formatRedirection(redirection: RedirectionState): Redirection;
function formatRedirection(redirection: RedirectionState | undefined): Redirection | null;
function formatRedirection(redirection: RedirectionState | undefined): Redirection | null {
  if (!redirection) return null;

  return {
    id: redirection.id,
    url: redirection.url,
    outputs: redirection.outputs.map((name) => redirection.outputsByName[name]!)
  };
}