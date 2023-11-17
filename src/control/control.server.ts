import { makeExecutableSchema } from '@graphql-tools/schema';
import { inject$, Service } from '@jujulego/injector';
import { createYoga } from 'graphql-yoga';
import { IncomingMessage, ServerResponse } from 'node:http';

import typeDefs from './schema.graphql';
import { LabelledLogger } from '../logger.config.ts';

// Server
@Service()
export class ControlServer {
  // Attributes
  private readonly _schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
      Query: {
        hello: () => 'Hello world!'
      }
    }
  });

  private readonly _yoga = createYoga({
    graphqlEndpoint: '/_janus/graphql',
    logging: inject$(LabelledLogger('yoga')),
    schema: this._schema,
  });

  // Methods
  async handleRequest(req: IncomingMessage, res: ServerResponse) {
    await this._yoga.handle(req as any, res);
  }
}