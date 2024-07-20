import { describe, expect, it } from 'vitest';

import {
  listEnabledOutputs,
  listOutputs,
  allRedirections,
  resolveRedirection, getRedirection
} from '@/src/server/store/redirections/selectors.js';
import { serverState } from '@/tests/server-state.js';

// Tests
describe('allRedirections', () => {
  it('should return list of all stored redirections', () => {
    expect(allRedirections(serverState)).toStrictEqual([
      serverState.redirections.byId['omVzIg0g3QXUooNYIRfq4w'],
      serverState.redirections.byId['RTkzBki4D5TvO_kR9td6yQ'],
    ]);
  });
});

describe('getRedirection', () => {
  it('should return asked redirection', () => {
    expect(getRedirection(serverState, 'omVzIg0g3QXUooNYIRfq4w')).toStrictEqual(
      serverState.redirections.byId['omVzIg0g3QXUooNYIRfq4w'],
    );
  });

  it('should return null if asked redirection is missing', () => {
    expect(getRedirection(serverState, 'toto')).toBeNull();
  });
});

describe('resolveRedirection', () => {
  it('should return "life" redirection (exact match)', () => {
    expect(resolveRedirection(serverState, '/life')).toStrictEqual(serverState.redirections.byId['omVzIg0g3QXUooNYIRfq4w']);
  });

  it('should return "toto" redirection (start match)', () => {
    expect(resolveRedirection(serverState, '/test/life')).toStrictEqual(serverState.redirections.byId['RTkzBki4D5TvO_kR9td6yQ']);
  });

  it('should return null (no match)', () => {
    expect(resolveRedirection(serverState, '/42e')).toBeNull();
  });
});

describe('listOutputs', () => {
  it('should return all outputs of a given redirection', () => {
    const redirection = serverState.redirections.byId['RTkzBki4D5TvO_kR9td6yQ'];

    expect(listOutputs(redirection)).toStrictEqual([
      redirection.outputsByName['book'],
      redirection.outputsByName['example'],
    ]);
  });
});

describe('listEnabledOutputs', () => {
  it('should return all enabled outputs of a given redirection', () => {
    const redirection = serverState.redirections.byId['RTkzBki4D5TvO_kR9td6yQ'];

    expect(listEnabledOutputs(redirection)).toStrictEqual([
      redirection.outputsByName['book'],
    ]);
  });
});
