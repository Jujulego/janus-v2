import { Logger, logger$ } from '@jujulego/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Config } from '@/src/config/type.ts';
import { RedirectionStore } from '@/src/state/redirection.store.ts';

// Setup
let logger: Logger;
let repository: RedirectionStore;

beforeEach(() => {
  logger = logger$();
  repository = new RedirectionStore(logger);
});

// Tests
describe('RedirectionStore.fromConfig', () => {
  const config: Config = {
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
      '/test': {
        outputs: {
          book: {
            target: 'http://localhost:3042',
            enabled: true,
            changeOrigin: false,
            secure: false,
            ws: false,
          },
          example: {
            target: 'https://example.com',
            enabled: true,
            changeOrigin: true,
            secure: true,
            ws: false,
          },
        },
      },
    },
    server: {
      pidfile: '.janus.pid',
      port: 3000,
    },
  };

  it('should add redirections from config', () => {
    vi.spyOn(repository, 'register');

    repository.fromConfig(config);

    expect(repository.register).toHaveBeenCalledTimes(2);
    expect(repository.register).toHaveBeenCalledWith({
      url: '/life',
      outputs: [
        {
          name: 'book',
          target: 'http://localhost:3042',
          enabled: true,
          changeOrigin: false,
          secure: false,
          ws: false,
        },
      ]
    });
    expect(repository.register).toHaveBeenCalledWith({
      url: '/test',
      outputs: [
        {
          name: 'book',
          target: 'http://localhost:3042',
          enabled: true,
          changeOrigin: false,
          secure: false,
          ws: false,
        },
        {
          name: 'example',
          target: 'https://example.com',
          enabled: true,
          changeOrigin: true,
          secure: true,
          ws: false,
        },
      ]
    });
  });
});

describe('RedirectionStore.get', () => {
  it('should save redirection with a new id', () => {
    const ref = repository.register({
      url: '/life',
      outputs: [
        {
          name: 'book',
          target: '/42',
          enabled: true,
          changeOrigin: false,
          secure: false,
          ws: false,
        },
      ]
    });
    const id = ref.read().id;

    expect(repository.get(id)).toBe(ref);
  });

  it('should get null for unknown redirection', () => {
    expect(repository.get('life')).toBeNull();
  });
});

describe('RedirectionStore.resolve', () => {
  beforeEach(() => {
    repository.register({
      url: '/life',
      outputs: [
        {
          name: 'book',
          target: '/42',
          enabled: true,
          changeOrigin: false,
          secure: false,
          ws: false,
        },
      ]
    });
  });

  it('should return first matching redirection', () => {
    expect(repository.resolve('/life/42')?.read()?.url).toBe('/life');
  });

  it('should return null if no redirection is found', () => {
    expect(repository.resolve('/toto')).toBeNull();
  });
});
