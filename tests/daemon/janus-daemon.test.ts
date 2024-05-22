import { type Logger, logger$, LogLevel } from '@kyrielle/logger';
import { type ChildProcess, fork } from 'node:child_process';
import EventEmitter from 'node:events';
import os from 'node:os';
import process from 'node:process';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigService } from '@/src/config/config.service.js';
import { JanusDaemon } from '@/src/daemon/janus-daemon.js';
import { DEFAULT_CONFIG } from '@/tests/utils.js';

// Mock
vi.mock('node:child_process');

// Setup
let config: ConfigService;
let logger: Logger;
let daemon: JanusDaemon;

beforeEach(() => {
  vi.resetAllMocks();

  logger = logger$();
  config = new ConfigService(logger, { config: DEFAULT_CONFIG, filepath: '/test/.janusrc.yml' });
  daemon = new JanusDaemon(logger, config);
});

describe('JanusDaemon', () => {
  let child: ChildProcess;

  beforeEach(() => {
    child = Object.assign(new EventEmitter(), {
      stdout: Object.assign(new EventEmitter(), { destroy: vi.fn() }),
      stderr: Object.assign(new EventEmitter(), { destroy: vi.fn() }),
      disconnect: vi.fn(),
      unref: vi.fn(),
      send: vi.fn(),
    }) as unknown as ChildProcess;

    vi.mocked(fork).mockReturnValue(child);
  });

  it('should start daemon script and disconnect from it once it started', async () => {
    const _success = daemon.fork();

    expect(fork).toHaveBeenCalledWith(expect.stringMatching(/daemon\.js$/), [], {
      cwd: process.cwd(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    await vi.waitFor(() => expect(child.send).toHaveBeenCalledWith(config.state));
    child.emit('message', 'started');

    expect(child.stdout!.destroy).toHaveBeenCalled();
    expect(child.stderr!.destroy).toHaveBeenCalled();
    expect(child.disconnect).toHaveBeenCalled();
    expect(child.unref).toHaveBeenCalled();

    await expect(_success).resolves.toBe(true);
  });

  it('should parse logs emitted by daemon threw stdout', async () => {
    const loggerSpy = vi.fn();
    logger.subscribe(loggerSpy);

    const _success = daemon.fork();

    expect(fork).toHaveBeenCalledWith(expect.stringMatching(/daemon\.js$/), [], {
      cwd: process.cwd(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    await vi.waitFor(() => expect(child.send).toHaveBeenCalledWith(config.state));

    child.stdout!.emit('data',
      Buffer.from(JSON.stringify({ level: LogLevel.info, message: 'Lorem ipsum' }) + os.EOL)
    );

    expect(loggerSpy).toHaveBeenCalledWith({
      level: LogLevel.info,
      label: 'daemon',
      message: 'Lorem ipsum'
    });

    child.emit('message', 'started');
    await expect(_success).resolves.toBe(true);
  });

  it('should log messages from daemon threw stderr as errors', async () => {
    const loggerSpy = vi.fn();
    logger.subscribe(loggerSpy);

    const _success = daemon.fork();

    expect(fork).toHaveBeenCalledWith(expect.stringMatching(/daemon\.js$/), [], {
      cwd: process.cwd(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    await vi.waitFor(() => expect(child.send).toHaveBeenCalledWith(config.state));

    child.stderr!.emit('data', Buffer.from('Lorem ipsum'));

    expect(loggerSpy).toHaveBeenCalledWith({
      level: LogLevel.error,
      label: 'daemon',
      message: 'Lorem ipsum'
    });

    child.emit('message', 'started');
    await expect(_success).resolves.toBe(true);
  });

  it('should warn and return false when daemon exits with code 0', async () => {
    const loggerSpy = vi.fn();
    logger.subscribe(loggerSpy);

    const _success = daemon.fork();

    await vi.waitFor(() => expect(child.send).toHaveBeenCalledWith(config.state));
    child.emit('exit', 0);

    expect(loggerSpy).toHaveBeenCalledWith({
      level: LogLevel.warning,
      label: 'daemon',
      message: 'Proxy exited with code 0'
    });

    await expect(_success).resolves.toBe(false);
  });

  it('should log an error and return false when daemon exits with code 1', async () => {
    const loggerSpy = vi.fn();
    logger.subscribe(loggerSpy);

    const _success = daemon.fork();

    await vi.waitFor(() => expect(child.send).toHaveBeenCalledWith(config.state));
    child.emit('exit', 1);

    expect(loggerSpy).toHaveBeenCalledWith({
      level: LogLevel.error,
      label: 'daemon',
      message: 'Proxy exited with code 1'
    });

    await expect(_success).resolves.toBe(false);
  });

  it('should rejects if fork emits an error', async () => {
    const _success = daemon.fork();

    await vi.waitFor(() => expect(child.send).toHaveBeenCalledWith(config.state));
    child.emit('error', new Error('Failure'));

    await expect(_success).rejects.toEqual(new Error('Failure'));
  });
});