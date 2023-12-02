import { inject$ } from '@jujulego/injector';
import 'reflect-metadata';
import './graphql.d.ts';

import { JanusProxy } from './janus-proxy.ts';

// Bootstrap
(async () => {
  try {
    const proxy = inject$(JanusProxy);
    await proxy.start();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
