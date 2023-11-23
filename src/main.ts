import { inject$ } from '@jujulego/injector';
import 'reflect-metadata';
import './graphql.d.ts';

import { Config } from './config/loader.ts';
import { RedirectionStore } from './data/redirection.store.ts';
import { HttpServer } from './http.server.ts';

// Bootstrap
(async () => {
  try {
    const config = await inject$(Config);
    const redirections = inject$(RedirectionStore);
    const server = inject$(HttpServer);

    await redirections.loadConfig();

    server.listen(config.server.port);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
