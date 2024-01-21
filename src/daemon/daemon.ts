import { logger$, toStdout, withLabel, withTimestamp } from '@jujulego/logger';
import { qjson } from '@jujulego/quick-tag';
import { flow$ } from 'kyrielle/pipe';
import process from 'node:process';

import { ConfigService, ConfigState } from '../config/config.service.ts';
import { JanusServer } from '../server/janus-server.ts';

// Setup logger
const logger = logger$(withLabel('daemon'), withTimestamp());
const disableStdoutLog = flow$(logger, toStdout((log) => qjson(log)!));

// Receive config & start proxy
process.once('message', async (configState: ConfigState) => {
  try {
    // Load config state
    const configService = new ConfigService(logger, configState);
    logger.debug`Received config:\n${qjson(configService.config, { pretty: true })}`;

    // Start proxy
    const proxy = new JanusServer(logger, configService);
    await proxy.start();

    if (proxy.started) {
      process.send!('started');
      disableStdoutLog();
    }
  } catch (err) {
    logger.error('Error while running proxy server', err as Error);
  }
});
