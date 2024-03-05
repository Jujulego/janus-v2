import { ServerState } from '@/src/server/store/types.js';

export const serverState = {
  redirections: {
    ids: ['omVzIg0g3QXUooNYIRfq4w', 'RTkzBki4D5TvO_kR9td6yQ'],
    byId: {
      'omVzIg0g3QXUooNYIRfq4w': {
        id: 'omVzIg0g3QXUooNYIRfq4w',
        url: '/life',
        outputs: ['book'],
        outputsByName: {
          'book': {
            id: 'omVzIg0g3QXUooNYIRfq4w#book',
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
            id: 'RTkzBki4D5TvO_kR9td6yQ#book',
            name: 'book',
            target: 'http://localhost:3042',
            enabled: true,
            changeOrigin: false,
            secure: false,
            ws: false,
          },
          'example': {
            id: 'RTkzBki4D5TvO_kR9td6yQ#example',
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
