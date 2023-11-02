import { RedirectionStore } from '@/src/data/redirection.store.js';
import { beforeEach } from 'vitest';

// Setup
let repository: RedirectionStore;

beforeEach(() => {
  repository = new RedirectionStore();
});

// Tests
describe('RedirectionStore', () => {
  it('should save redirection with a new id', () => {
    const ref = repository.register({
      url: '/life',
      outputs: {
        book: {
          target: '/42',
          enabled: true,
          changeOrigin: false,
          secure: false,
          ws: false,
        }
      }
    });
    const id = ref.read().id;

    expect(repository.get(id)).toBe(ref);
  });

  it('should get null for unknown redirection', () => {
    expect(repository.get('life')).toBeNull();
  });
});