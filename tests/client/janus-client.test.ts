import { Logger, logger$ } from '@kyrielle/logger';
import { gql } from 'graphql-tag';
import { graphql as mockGql, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { JanusClient } from '@/src/client/janus-client.js';

// Setup
let logger: Logger;
let client: JanusClient;

const TestQuery = gql`
  query TestJanusClient {
    redirections {
      id
    }
  }
`;

const janusGql = mockGql.link('http://localhost:3000/_janus/graphql');

const mockServer = setupServer(
  janusGql.query('TestJanusClient', () => HttpResponse.json({
    data: {
      redirections: [
        { id: 'test-1' }
      ]
    }
  }))
);

beforeAll(() => {
  mockServer.listen();
});

beforeEach(() => {
  mockServer.resetHandlers();

  logger = logger$();
  client = new JanusClient('http://localhost:3000', logger);
});

// Tests
describe('JanusClient.read$', () => {
  it('should call janus server and return it\'s response', async () => {
    const test$ = client.request$(TestQuery);

    await expect(test$.defer()).resolves.toStrictEqual({
      data: {
        redirections: [
          { id: 'test-1' }
        ]
      }
    });
  });
});
