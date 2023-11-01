import { singleton$, token$ } from '@jujulego/injector';
import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

// Options
export function applyConfigOptions(parser: Argv) {
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
    });
}

// Token
export const ConfigOptions = token$(
  () => {
    const parser = yargs(hideBin(process.argv))
      .help(false)
      .version(false);

    return applyConfigOptions(parser).parseSync();
  },
  { modifiers: [singleton$()] }
);