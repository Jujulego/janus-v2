import { inject$, token$ } from '@jujulego/injector';
import { logger$ } from '@jujulego/logger';

import { ConfigService } from '../config/config.service.ts';

// Tokens
export const CliLogger = token$(() => logger$());

export const CliConfigService = token$(() => new ConfigService(inject$(CliLogger)));

export const CliJanusDaemon = token$(async () => {
  const { JanusDaemon } = await import('../janus-daemon.ts');

  return new JanusDaemon(inject$(CliLogger), inject$(CliConfigService));
});
export const CliJanusProxy = token$(async () => {
  const { JanusProxy } = await import('../janus-proxy.ts');

  return new JanusProxy(inject$(CliLogger), inject$(CliConfigService));
});