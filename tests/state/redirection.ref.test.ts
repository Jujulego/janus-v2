import { Logger, logger$ } from '@jujulego/logger';
import { beforeEach, describe, expect, it } from 'vitest';

import { redirection$ } from '@/src/state/redirection.ref.ts';

// Setup
let logger: Logger;

beforeEach(() => {
  logger = logger$();
});

// Tests
describe('redirection$().enableOutput', () => {
  it('should enable given output', () => {
    const ref = redirection$({
      id: 'life',
      url: '/life',
      outputs: [
        {
          name: 'book',
          target: '/42',
          enabled: false,
          changeOrigin: false,
          secure: false,
          ws: false,
        },
      ]
    }, logger);

    expect(ref.enableOutput('book')).toStrictEqual({
      id: 'life',
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
});

describe('redirection$().disableOutput', () => {
  it('should enable given output', () => {
    const ref = redirection$({
      id: 'life',
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
    }, logger);

    expect(ref.disableOutput('book')).toStrictEqual({
      id: 'life',
      url: '/life',
      outputs: [
        {
          name: 'book',
          target: '/42',
          enabled: false,
          changeOrigin: false,
          secure: false,
          ws: false,
        },
      ]
    });
  });
});
