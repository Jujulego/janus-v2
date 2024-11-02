import { logger$, LogLevel } from '@kyrielle/logger';
import { fs, vol } from 'memfs';
import os from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LogFile } from '@/src/server/log-file.js';

// Mocks
vi.mock('node:fs', () => ({ default: fs, ...fs }));

// Setup
afterEach(() => {
  vol.reset();
});

// Tests
describe('LogFile', () => {
  it('should write logs into a file', async () => {
    const logger = logger$();
    const file = new LogFile();

    file.open('/test.log', logger);
    logger.info('test');

    await file.close();
    expect(vol.readFileSync('/test.log', 'utf-8')).toBe(`{"level":${LogLevel.info},"message":"test"}${os.EOL}`);
  });
});