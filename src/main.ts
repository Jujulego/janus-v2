import { inject$ } from '@jujulego/injector';
import 'reflect-metadata';

import { Config } from './config/loader.js';
import { RedirectionRepository } from './data/redirection.repository.js';

// Bootstrap
(async () => {
  try {
    const config = await inject$(Config);
    const repository = inject$(RedirectionRepository);

    for (const redirect of config.redirections) {
      repository.register(redirect);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
