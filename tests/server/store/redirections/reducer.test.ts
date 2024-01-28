import { Logger, logger$ } from '@jujulego/logger';
import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG } from '@/tests/utils.ts';
import { Config } from '@/src/config/type.ts';
import { loadConfig } from '@/src/server/store/actions.ts';
import { disableRedirectionOutput, enableRedirectionOutput } from '@/src/server/store/redirections/actions.ts';
import { redirectionsReducer } from '@/src/server/store/redirections/reducer.ts';
import { RedirectionsState } from '@/src/server/store/redirections/types.ts';

// Setup
let logger: Logger;
let reducer: ReturnType<typeof redirectionsReducer>;

beforeEach(() => {
  logger = logger$();
  reducer = redirectionsReducer(logger);
});

// Tests
describe('redirectionsReducer', () => {
  describe('loadConfig action', () => {
    it('should load redirections from config', () => {
      const config: Config = {
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
      };

      const initial: RedirectionsState = {
        ids: [],
        byId: {}
      };

      expect(reducer(initial, loadConfig(config)))
        .toStrictEqual({
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
                  enabled: true,
                  changeOrigin: true,
                  secure: true,
                  ws: false,
                }
              }
            }
          }
        });
    });
  });

  describe('enableRedirectionOutput action', () => {
    it('should do nothing if redirection does not exists', () => {
      const initial: RedirectionsState = {
        ids: [],
        byId: {}
      };

      expect(reducer(initial, enableRedirectionOutput({ redirectionId: 'life', outputName: 'test' })))
        .toBe(initial);
    });

    it('should do nothing if output does not exists', () => {
      const initial: RedirectionsState = {
        ids: ['life'],
        byId: {
          life: {
            id: 'life',
            url: '/life',
            outputs: [],
            outputsByName: {}
          }
        }
      };

      expect(reducer(initial, enableRedirectionOutput({ redirectionId: 'life', outputName: 'test' })))
        .toBe(initial);
    });

    it('should do nothing if output is already enabled', () => {
      const initial: RedirectionsState = {
        ids: ['life'],
        byId: {
          life: {
            id: 'life',
            url: '/life',
            outputs: ['test'],
            outputsByName: {
              test: {
                name: 'test',
                target: 'https://example.com',
                enabled: true,
                changeOrigin: true,
                secure: true,
                ws: true,
              }
            }
          }
        }
      };

      expect(reducer(initial, enableRedirectionOutput({ redirectionId: 'life', outputName: 'test' })))
        .toBe(initial);
    });

    it('should enable output', () => {
      const initial: RedirectionsState = {
        ids: ['life'],
        byId: {
          life: {
            id: 'life',
            url: '/life',
            outputs: ['test'],
            outputsByName: {
              test: {
                name: 'test',
                target: 'https://example.com',
                enabled: false,
                changeOrigin: true,
                secure: true,
                ws: true,
              }
            }
          }
        }
      };

      expect(reducer(initial, enableRedirectionOutput({ redirectionId: 'life', outputName: 'test' })))
        .toStrictEqual({
          ids: ['life'],
          byId: {
            life: {
              id: 'life',
              url: '/life',
              outputs: ['test'],
              outputsByName: {
                test: {
                  name: 'test',
                  target: 'https://example.com',
                  enabled: true, // <= true !!!
                  changeOrigin: true,
                  secure: true,
                  ws: true,
                }
              }
            }
          }
        });
    });
  });

  describe('disableRedirectionOutput action', () => {
    it('should do nothing if redirection does not exists', () => {
      const initial: RedirectionsState = {
        ids: [],
        byId: {}
      };

      expect(reducer(initial, disableRedirectionOutput({ redirectionId: 'life', outputName: 'test' })))
        .toBe(initial);
    });

    it('should do nothing if output does not exists', () => {
      const initial: RedirectionsState = {
        ids: ['life'],
        byId: {
          life: {
            id: 'life',
            url: '/life',
            outputs: [],
            outputsByName: {}
          }
        }
      };

      expect(reducer(initial, disableRedirectionOutput({ redirectionId: 'life', outputName: 'test' })))
        .toBe(initial);
    });

    it('should do nothing if output is already disable', () => {
      const initial: RedirectionsState = {
        ids: ['life'],
        byId: {
          life: {
            id: 'life',
            url: '/life',
            outputs: ['test'],
            outputsByName: {
              test: {
                name: 'test',
                target: 'https://example.com',
                enabled: false,
                changeOrigin: true,
                secure: true,
                ws: true,
              }
            }
          }
        }
      };

      expect(reducer(initial, disableRedirectionOutput({ redirectionId: 'life', outputName: 'test' })))
        .toBe(initial);
    });

    it('should disable output', () => {
      const initial: RedirectionsState = {
        ids: ['life'],
        byId: {
          life: {
            id: 'life',
            url: '/life',
            outputs: ['test'],
            outputsByName: {
              test: {
                name: 'test',
                target: 'https://example.com',
                enabled: true,
                changeOrigin: true,
                secure: true,
                ws: true,
              }
            }
          }
        }
      };

      expect(reducer(initial, disableRedirectionOutput({ redirectionId: 'life', outputName: 'test' })))
        .toStrictEqual({
          ids: ['life'],
          byId: {
            life: {
              id: 'life',
              url: '/life',
              outputs: ['test'],
              outputsByName: {
                test: {
                  name: 'test',
                  target: 'https://example.com',
                  enabled: false, // <= false !!!
                  changeOrigin: true,
                  secure: true,
                  ws: true,
                }
              }
            }
          }
        });
    });
  });
});