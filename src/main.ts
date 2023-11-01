import { inject$ } from '@jujulego/injector';
import 'reflect-metadata';

import { Config } from './config/loader.js';

// Bootstrap
(async () => {
  try {
    const config = await inject$(Config);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
