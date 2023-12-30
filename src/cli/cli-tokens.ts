import { inject$, token$ } from '@jujulego/injector';
import { logger$, withTimestamp } from '@jujulego/logger';

import { ConfigService } from '../config/config.service.ts';

// Tokens
export const CliLogger = token$(() => logger$(withTimestamp()));

export const CliConfigService = token$(() => new ConfigService(inject$(CliLogger)));

export const CliJanusDaemon = token$(async () => {
  const { JanusDaemon } = await import('../daemon/janus-daemon.ts');

  return new JanusDaemon(inject$(CliLogger), inject$(CliConfigService));
});
export const CliJanusProxy = token$(async () => {
  const { JanusServer } = await import('../server/janus-server.ts');

  return new JanusServer(inject$(CliLogger), inject$(CliConfigService));
});
