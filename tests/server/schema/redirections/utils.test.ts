import { mapRedirection, mapRedirectionList } from '@/src/server/schema/redirections/utils.js';
import { describe, expect, it } from 'vitest';

import { serverState } from '@/tests/server-state.js';

// Tests
describe('mapRedirection', () => {
  it('should map redirection state to graphql output format', () => {
    expect(mapRedirection(serverState.redirections.byId['omVzIg0g3QXUooNYIRfq4w'])).toStrictEqual({
      id: 'omVzIg0g3QXUooNYIRfq4w',
      url: '/life',
      outputs: [
        {
          id: 'omVzIg0g3QXUooNYIRfq4w#book',
          name: 'book',
          target: 'http://localhost:3042',
          enabled: true,
          changeOrigin: false,
          secure: false,
          ws: false,
        }
      ]
    });
  });

  it('should return null for null state', () => {
    expect(mapRedirection(null)).toBeNull();
  });
});

describe('mapRedirectionList', () => {
  it('should map redirection state to graphql output format', () => {
    const list = [
      serverState.redirections.byId['omVzIg0g3QXUooNYIRfq4w'],
      serverState.redirections.byId['RTkzBki4D5TvO_kR9td6yQ']
    ];

    expect(mapRedirectionList(list)).toStrictEqual([
      expect.objectContaining({
        id: 'omVzIg0g3QXUooNYIRfq4w',
        outputs: [
          expect.objectContaining({ name: 'book' }),
        ]
      }),
      expect.objectContaining({
        id: 'RTkzBki4D5TvO_kR9td6yQ',
        outputs: [
          expect.objectContaining({ name: 'book' }),
          expect.objectContaining({ name: 'example' }),
        ]
      }),
    ]);
  });

  it('should return null for null state', () => {
    expect(mapRedirection(null)).toBeNull();
  });
});
