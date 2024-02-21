import { inject$, token$ } from '@jujulego/injector';
import { logger$, withTimestamp } from '@kyrielle/logger';

import { ConfigService } from '../config/config.service.ts';

// Tokens
export const CliLogger = token$(() => logger$(withTimestamp()));

export const CliConfigService = token$(() => new ConfigService(inject$(CliLogger)));

export const CliJanusClient = token$(async () => {
  const { JanusClient } = await import('../client/janus-client.ts');
  const service = inject$(CliConfigService);

  return new JanusClient(
    `http://localhost:${service.config!.server.port}`,
    inject$(CliLogger)
  );
});

export const CliJanusDaemon = token$(async () => {
  const { JanusDaemon } = await import('../daemon/janus-daemon.ts');

  return new JanusDaemon(inject$(CliLogger), inject$(CliConfigService));
});

export const CliJanusProxy = token$(async () => {
  const { JanusServer } = await import('../server/janus-server.ts');

  return new JanusServer(inject$(CliLogger), inject$(CliConfigService));
});
