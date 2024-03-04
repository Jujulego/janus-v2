import { describe, expect, it } from 'vitest';

import {
  listEnabledOutputs,
  listOutputs,
  listRedirections,
  resolveRedirection
} from '@/src/server/store/redirections/selectors.js';
import { ServerState } from '@/src/server/store/types.js';

// Setup
const state = {
  redirections: {
    ids: ['omVzIg0g3QXUooNYIRfq4w', 'RTkzBki4D5TvO_kR9td6yQ'],
    byId: {
      'omVzIg0g3QXUooNYIRfq4w': {
        id: 'omVzIg0g3QXUooNYIRfq4w',
        url: '/life',
        outputs: ['book'],
        outputsByName: {
          'book': {
            name: 'book',
            target: 'http://localhost:3042',
            enabled: true,
            changeOrigin: false,
            secure: false,
            ws: false,
          }
        }
      },
      'RTkzBki4D5TvO_kR9td6yQ': {
        id: 'RTkzBki4D5TvO_kR9td6yQ',
        url: '/test',
        outputs: ['book', 'example'],
        outputsByName: {
          'book': {
            name: 'book',
            target: 'http://localhost:3042',
            enabled: true,
            changeOrigin: false,
            secure: false,
            ws: false,
          },
          'example': {
            name: 'example',
            target: 'https://example.com',
            enabled: false,
            changeOrigin: true,
            secure: true,
            ws: false,
          }
        }
      }
    }
  }
} satisfies ServerState;

// Tests
describe('listRedirections', () => {
  it('should return list of all stored redirections', () => {
    expect(listRedirections(state)).toStrictEqual([
      state.redirections.byId['omVzIg0g3QXUooNYIRfq4w'],
      state.redirections.byId['RTkzBki4D5TvO_kR9td6yQ'],
    ]);
  });
});

describe('resolveRedirection', () => {
  it('should return "life" redirection (exact match)', () => {
    expect(resolveRedirection(state, '/life')).toStrictEqual(state.redirections.byId['omVzIg0g3QXUooNYIRfq4w']);
  });

  it('should return "toto" redirection (start match)', () => {
    expect(resolveRedirection(state, '/test/life')).toStrictEqual(state.redirections.byId['RTkzBki4D5TvO_kR9td6yQ']);
  });

  it('should return null (no match)', () => {
    expect(resolveRedirection(state, '/42e')).toBeNull();
  });
});

describe('listOutputs', () => {
  it('should return all outputs of a given redirection', () => {
    const redirection = state.redirections.byId['RTkzBki4D5TvO_kR9td6yQ']!;

    expect(listOutputs(redirection)).toStrictEqual([
      redirection.outputsByName['book'],
      redirection.outputsByName['example'],
    ]);
  });
});

describe('listEnabledOutputs', () => {
  it('should return all enabled outputs of a given redirection', () => {
    const redirection = state.redirections.byId['RTkzBki4D5TvO_kR9td6yQ']!;

    expect(listEnabledOutputs(redirection)).toStrictEqual([
      redirection.outputsByName['book'],
    ]);
  });
});