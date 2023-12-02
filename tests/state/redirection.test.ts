import { redirection$ } from '@/src/state/redirection.ref.js';

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
    });

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
    });

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
