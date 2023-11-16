import { singleton$, token$ } from '@jujulego/injector';
import { LogLevelKey } from '@jujulego/logger';
import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

// Utils
const VERBOSITY_LEVEL: Record<number, LogLevelKey> = {
  1: 'verbose',
  2: 'debug',
};

// Options
export function buildConfigOptions(parser: Argv) {
  return parser
    .option('config-file', {
      alias: 'c',
      type: 'string',
      description: 'Configuration file'
    })
    .option('pid-file', {
      type: 'string',
      description: 'PID file'
    })
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'Proxy listening port'
    })
    .option('verbose', {
      alias: 'v',
      type: 'count',
      description: 'Set verbosity level',
      coerce: (cnt) => VERBOSITY_LEVEL[Math.min(cnt, 2)]
    });
}

// Token
export const ConfigOptions = token$(
  () => {
    const parser = yargs(hideBin(process.argv))
      .help(false)
      .version(false);

    return buildConfigOptions(parser).parseSync();
  },
  { modifiers: [singleton$()] }
);
