import { graphql as mockGql, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { JanusClient } from '@/src/client/janus-client.js';
import { JanusOutput } from '@/src/client/janus-output.js';
import { ConfigService } from '@/src/config/config.service.js';
import { DEFAULT_CONFIG } from '@/tests/utils.js';

// Constants
const config = {
  ...DEFAULT_CONFIG,
  redirections: {
    '/life': {
      outputs: {
        book: {
          target: 'http://localhost:3042',
          enabled: true,
          changeOrigin: false,
          secure: false,
          ws: false,
        },
      },
    },
  }
};

// Mock server
const janusGql = mockGql.link(`http://localhost:${config.server.port}/_janus/graphql`);

const mockServer = setupServer(
  janusGql.mutation('EnableJanusOutput', ({ variables }) => HttpResponse.json({
    data: {
      enableRedirectionOutput: { id: variables.redirectionId }
    }
  })),
  janusGql.mutation('DisableJanusOutput', ({ variables }) => HttpResponse.json({
    data: {
      disableRedirectionOutput: { id: variables.redirectionId }
    }
  }))
);

// Setup
let output: JanusOutput;

beforeAll(() => {
  mockServer.listen();
});

beforeEach(() => {
  mockServer.resetHandlers();

  output = new JanusOutput('/life', 'book');

  vi.spyOn(ConfigService.prototype, 'loadConfig').mockResolvedValue(config);
  vi.spyOn(ConfigService.prototype, 'searchConfig').mockResolvedValue(config);

  vi.spyOn(JanusClient.prototype, 'request$');
});

afterEach(async () => {
  output?.dispose();
});

afterAll(() => {
  mockServer.close();
});

// Tests
describe('JanusOutput.enable', () => {
  it('should send enable query to server according to config', async () => {
    await output.enable();

    // Config loading
    expect(ConfigService.prototype.loadConfig).not.toHaveBeenCalled();
    expect(ConfigService.prototype.searchConfig).toHaveBeenCalled();

    // Graphql call
    expect(JanusClient.prototype.request$).toHaveBeenCalledOnce();
    expect(vi.mocked(JanusClient.prototype.request$).mock.calls[0]).toMatchSnapshot();
  });

  it('should load given config file', async () => {
    const output = new JanusOutput('/life', 'book', { configFile: '/janus.yml' });
    await output.enable();

    // Config loading
    expect(ConfigService.prototype.loadConfig).toHaveBeenCalledWith('/janus.yml');
    expect(ConfigService.prototype.searchConfig).not.toHaveBeenCalled();

    // Graphql call
    expect(JanusClient.prototype.request$).toHaveBeenCalledOnce();
    expect(vi.mocked(JanusClient.prototype.request$).mock.calls[0]).toMatchSnapshot();
  });

  it('should throw as given redirection does not exists', async () => {
    const output = new JanusOutput('/toto', 'book', { configFile: '/janus.yml' });
    await expect(output.enable())
      .rejects.toEqual(new Error('No redirection configured at /toto'));

    // Graphql call
    expect(JanusClient.prototype.request$).not.toHaveBeenCalled();
  });

  it('should throw as given output does not exists', async () => {
    const output = new JanusOutput('/life', 'toto', { configFile: '/janus.yml' });
    await expect(output.enable())
      .rejects.toEqual(new Error('No output toto found at /life'));

    // Graphql call
    expect(JanusClient.prototype.request$).not.toHaveBeenCalled();
  });
});

describe('JanusOutput.disable', () => {
  it('should send disable query to server according to config', async () => {
    await output.disable();

    // Config loading
    expect(ConfigService.prototype.loadConfig).not.toHaveBeenCalled();
    expect(ConfigService.prototype.searchConfig).toHaveBeenCalled();

    // Graphql call
    expect(JanusClient.prototype.request$).toHaveBeenCalledOnce();
    expect(vi.mocked(JanusClient.prototype.request$).mock.calls[0]).toMatchSnapshot();
  });

  it('should load given config file', async () => {
    const output = new JanusOutput('/life', 'book', { configFile: '/janus.yml' });
    await output.disable();

    // Config loading
    expect(ConfigService.prototype.loadConfig).toHaveBeenCalledWith('/janus.yml');
    expect(ConfigService.prototype.searchConfig).not.toHaveBeenCalled();

    // Graphql call
    expect(JanusClient.prototype.request$).toHaveBeenCalledOnce();
    expect(vi.mocked(JanusClient.prototype.request$).mock.calls[0]).toMatchSnapshot();
  });

  it('should throw as given redirection does not exists', async () => {
    const output = new JanusOutput('/toto', 'book', { configFile: '/janus.yml' });
    await expect(output.disable())
      .rejects.toEqual(new Error('No redirection configured at /toto'));

    // Graphql call
    expect(JanusClient.prototype.request$).not.toHaveBeenCalled();
  });

  it('should throw as given output does not exists', async () => {
    const output = new JanusOutput('/life', 'toto', { configFile: '/janus.yml' });
    await expect(output.disable())
      .rejects.toEqual(new Error('No output toto found at /life'));

    // Graphql call
    expect(JanusClient.prototype.request$).not.toHaveBeenCalled();
  });
});