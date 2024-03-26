import { inject$ } from '@jujulego/injector';
import { LogGateway, type WithDelay } from '@kyrielle/logger';
import { useStderr } from 'ink';
import { observer$ } from 'kyrielle';
import { useLayoutEffect } from 'react';

import { logFormat } from '../middlewares/logger.middleware.js';

// Component
export default function StaticLogs() {
  const stderr = useStderr();

  useLayoutEffect(() => {
    const gateway: LogGateway<WithDelay> = inject$(LogGateway);
    const toConsole = gateway.disconnect('console')!;

    gateway.connect('ink', observer$({
      next: (log) => stderr.write(logFormat(log) + '\n')
    }));

    return () => {
      gateway.disconnect('ink');
      gateway.connect('console', toConsole);
    };
  }, [stderr]);

  return null;
}

