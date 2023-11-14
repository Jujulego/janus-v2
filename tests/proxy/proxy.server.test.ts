import { overrideInject$ } from '@jujulego/injector/tests';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

import { RedirectionStore } from '@/src/data/redirection.store.js';
import { redirection$ } from '@/src/data/redirection.js';
import { ProxyServer } from '@/src/proxy/proxy.server.js';

// Setup
let store: RedirectionStore;
let proxy: ProxyServer;

const targetServer = setupServer(
  http.get('http://localhost:3001/life/toto', () => HttpResponse.json({
    from: 'http://localhost:3001'
  }))
);

beforeAll(() => {
  targetServer.listen();
});

beforeEach(() => {
  targetServer.resetHandlers();

  store = overrideInject$(RedirectionStore, new RedirectionStore());
  proxy = overrideInject$(ProxyServer, new ProxyServer());
});

afterAll(() => {
  targetServer.close();
});

// Tests
describe('ProxyServer', () => {
  it('should return data from http://localhost:3001 server', async () => {
    vi.spyOn(store, 'resolve').mockReturnValue(redirection$({
      id: 'life',
      url: '/life',
      outputs: [
        {
          name: 'test',
          target: 'http://localhost:3001',
          enabled: true,
          changeOrigin: true,
          secure: true,
          ws: true,
        }
      ]
    }));

    await request(proxy.server)
      .get('/life/toto')
      .expect(200, { from: 'http://localhost:3001' });
  });
});
