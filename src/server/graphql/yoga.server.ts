import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse';
import { Logger, withLabel } from '@jujulego/logger';
import { createYoga } from 'graphql-yoga';

import { StateHolder } from '../state/state-holder.ts';
import { RedirectionResolver } from './redirection.resolver.ts';

// Tokens
export const YogaServer = (logger: Logger, state: StateHolder) => createYoga({
  graphqlEndpoint: '/_janus/graphql',
  logging: logger.child(withLabel('yoga')),
  schema: RedirectionResolver(state),
  plugins: [useGraphQLSSE()]
});
