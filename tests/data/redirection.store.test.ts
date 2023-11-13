import { beforeEach } from 'vitest';

import { RedirectionStore } from '@/src/data/redirection.store.js';

// Setup
let repository: RedirectionStore;

beforeEach(() => {
  repository = new RedirectionStore();
});

// Tests
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
