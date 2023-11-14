import { inject$ } from '@jujulego/injector';
import 'reflect-metadata';

import { Config } from './config/loader.ts';
import { RedirectionStore } from './data/redirection.store.ts';
import { ProxyServer } from './proxy/proxy.server.ts';

// Bootstrap
(async () => {
  try {
    const config = await inject$(Config);
    const repository = inject$(RedirectionStore);
    const proxy = inject$(ProxyServer);

    for (const redirect of config.redirections) {
      repository.register({
        ...redirect,
        outputs: Object.entries(redirect.outputs)
          .map(([name, output]) => Object.assign(output, { name }))
      });
    }

    proxy.listen(config.proxy.port);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
