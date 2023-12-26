import { logger$, toStdout, withLabel, withTimestamp } from '@jujulego/logger';
import { flow$ } from 'kyrielle/operators';

import { ConfigService, ConfigState } from './config/config.service.ts';
import { JanusProxy } from './janus-proxy.ts';

// Setup logger
const logger = logger$(withTimestamp(), withLabel('daemon'));
flow$(logger, toStdout());

// Receive config & start proxy
process.once('message', async (configState: ConfigState) => {
  // Load config state
  const configService = new ConfigService(logger, configState);
  logger.debug`Received config:\n#!json:${configService.config}`;

  // Start proxy
  const proxy = new JanusProxy(logger, configService);
  await proxy.start();
});