import { inject$ } from '@kyrielle/injector';
import chalk from 'chalk';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { version } from '../../../package.json' assert { type: 'json' };
import { isTimeoutError } from '../../utils/error.js';
import { CliLogger } from '../cli-tokens.js';

// Command
const command: CommandModule = {
  command: 'version',
  describe: 'Prints version of janus client and connected proxy server',
  async handler() {
    const logger = inject$(CliLogger);

    try {
      const { default: VersionCommand } = await import('./version.ink.jsx');
      const proxyVersion = await VersionCommand({});

      process.stdout.write(`client/${version} proxy/${proxyVersion}\n`);
    } catch (err) {
      if (!isTimeoutError(err)) {
        logger.error('Error while evaluating proxy status:', err as Error);
      }

      process.stdout.write(`client/${version} proxy/${chalk.grey('unreachable')}\n`);
      process.exit(1);
    }
  }
};

export default command;
