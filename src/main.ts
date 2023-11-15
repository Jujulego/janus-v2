import { inject$ } from '@jujulego/injector';
import 'reflect-metadata';

import { Config } from './config/loader.ts';
import { RedirectionStore } from './data/redirection.store.ts';
import { HttpServer } from './http.server.ts';

// Bootstrap
(async () => {
  try {
    const config = await inject$(Config);
    const repository = inject$(RedirectionStore);
    const server = inject$(HttpServer);

    for (const redirect of config.redirections) {
      repository.register({
        ...redirect,
        outputs: Object.entries(redirect.outputs)
          .map(([name, output]) => Object.assign(output, { name }))
      });
    }

    server.listen(config.proxy.port);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
