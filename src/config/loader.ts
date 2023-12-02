import { inject$, token$ } from '@jujulego/injector';
import { LogLevel } from '@jujulego/logger';

import { Ajv } from '../ajv.config.ts';
import { LabelledLogger, logLevel } from '../logger.config.ts';
import { ConfigExplorer, ConfigValidator } from './utils.ts';
import { ConfigOptions } from './options.ts';

// Tokens
export const Config = token$(async () => {
  const logger = inject$(LabelledLogger('config'));
  const options = inject$(ConfigOptions);

  // Load file
  const explorer = inject$(ConfigExplorer);
  const loaded = await (options.configFile ? explorer.load(options.configFile) : explorer.search());
  const config = loaded?.config ?? {};

  config.server ??= {};

  // Apply options from cli
  if (options.pidFile) config.server.pidfile = options.pidFile;
  if (options.port) config.server.port = options.port;
  if (options.verbose) config.verbose = options.verbose;

  // Validate
  const validator = inject$(ConfigValidator);

  if (!validator(config)) {
    const ajv = inject$(Ajv);
    const errors = ajv.errorsText(validator.errors, { separator: '\n- ', dataVar: 'config' });

    logger.error(`Errors in config file:\n- ${errors}`);
    throw new Error('Error in config files');
  }

  // Apply verbose option
  logLevel.mutate(LogLevel[config.verbose]);
  logger.debug`Loaded config:\n#!json:${config}`;

  return config;
});
