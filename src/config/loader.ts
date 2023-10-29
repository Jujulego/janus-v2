import { inject$, singleton$, token$ } from '@jujulego/injector';

import { Ajv } from '../ajv.config.js';
import { LabelledLogger } from '../logger.config.js';
import { ConfigExplorer, ConfigValidator } from './utils.js';

// Tokens
export const Config = token$(
  async () => {
    const logger = inject$(LabelledLogger('config'));

    // Load file
    const explorer = inject$(ConfigExplorer);
    const loaded = await explorer.search();
    const config = loaded?.config ?? {};

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
