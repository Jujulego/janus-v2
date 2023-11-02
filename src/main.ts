import { inject$ } from '@jujulego/injector';
import 'reflect-metadata';

import { Config } from './config/loader.ts';
import { RedirectionStore } from './data/redirection.store.ts';

// Bootstrap
(async () => {
  try {
    const config = await inject$(Config);
    const repository = inject$(RedirectionStore);

    for (const redirect of config.redirections) {
      repository.register(redirect);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
