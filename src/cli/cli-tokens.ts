import { inject$, token$ } from '@kyrielle/injector';
import { logger$, withTimestamp } from '@kyrielle/logger';

import { ConfigService } from '../config/config.service.js';

// Tokens
export const CliLogger = token$('CliLogger', () => logger$(withTimestamp()));

export const CliConfigService = token$('CliConfigService', () => new ConfigService(inject$(CliLogger)));

export const CliJanusClient = token$('CliJanusClient', async () => {
  const { JanusClient } = await import('../client/janus-client.js');
  const service = inject$(CliConfigService);

  return new JanusClient(
    `http://localhost:${service.config!.server.port}`,
    inject$(CliLogger)
  );
});

export const CliJanusDaemon = token$('CliJanusDaemon', async () => {
  const { JanusDaemon } = await import('../daemon/janus-daemon.js');

  return new JanusDaemon(inject$(CliLogger), inject$(CliConfigService));
});

export const CliJanusProxy = token$('CliJanusProxy', async () => {
  const { JanusServer } = await import('../server/janus-server.js');

  return new JanusServer(inject$(CliLogger), inject$(CliConfigService));
});
