import { qjson } from '@jujulego/quick-tag';
import { logger$, toStdout, withLabel, withTimestamp } from '@kyrielle/logger';
import { flow$ } from 'kyrielle';
import process from 'node:process';

import { ConfigService, ConfigState } from '../config/config.service.js';
import { JanusServer } from '../server/janus-server.js';

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
      proxy.useLogFile();
      process.send!('started');
      disableStdoutLog.unsubscribe();

      process.once('SIGINT', async () => {
        logger.info('Received SIGINT signal, initiate clean stop');
        await proxy.stop();

        process.exit(0);
      });
    }
  } catch (err) {
    logger.error('Error while running proxy server', err as Error);
  }
});
