import { inject$, singleton$, token$ } from '@jujulego/injector';

import { Ajv } from '../ajv.config.ts';
import { LabelledLogger } from '../logger.config.ts';
import { ConfigExplorer, ConfigValidator } from './utils.ts';
import { ConfigOptions } from './options.ts';

// Tokens
export const Config = token$(
  async () => {
    const logger = inject$(LabelledLogger('config'));
    const options = inject$(ConfigOptions);

    // Load file
    const explorer = inject$(ConfigExplorer);
    const loaded = await (options.configFile ? explorer.load(options.configFile) : explorer.search());
    const config = loaded?.config ?? {};

    config.proxy ??= {};

    // Apply options from cli
    if (options.pidFile) config.pidfile ??= options.pidFile;
    if (options.port) config.proxy.port ??= options.port;

    // Apply defaults
    config.pidfile ??= '.janus.pid';
    config.proxy.port ??= 3000;

    // Validate
    const validator = inject$(ConfigValidator);

    if (!validator(config)) {
      const ajv = inject$(Ajv);
      const errors = ajv.errorsText(validator.errors, { separator: '\n- ', dataVar: 'config' });

      logger.error(`Errors in config file:\n- ${errors}`);
      throw new Error('Error in config files');
    }

    logger.debug`Loaded config:\n#!json:${config}`;

    return config;
  },
  { modifiers: [singleton$()] }
);
