import { LogFile } from '@/src/server/log-file.js';
import { PidFile } from '@jujulego/pid-file';
import { Logger, logger$, LogLevel } from '@kyrielle/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigService } from '@/src/config/config.service.js';
import { HttpServer } from '@/src/server/http.server.js';
import { JanusServer } from '@/src/server/janus-server.js';
import { loadConfig } from '@/src/server/store/actions.js';
import { serverStore } from '@/src/server/store/server.store.js';
import { ServerStore } from '@/src/server/store/types.js';

import { DEFAULT_CONFIG } from '@/tests/utils.js';

// Mocks
vi.mock('@jujulego/pid-file');
vi.mock('@/src/server/http.server.js');
vi.mock('@/src/server/log-file.js');
vi.mock('@/src/server/store/server.store.js');

// Setup
let config: ConfigService;
let logger: Logger;
let server: JanusServer;
let store: ServerStore;

beforeEach(() => {
  vi.resetAllMocks();

  logger = logger$();
  store = { dispatch: vi.fn((action) => action) } as unknown as ServerStore;
  vi.mocked(serverStore).mockReturnValue(store);

  config = new ConfigService(logger, { config: DEFAULT_CONFIG, filepath: '/test/.janusrc.yml' });
  server = new JanusServer(logger, config);

  vi.mocked(HttpServer.prototype.listen).mockResolvedValue();
});

// Tests
describe('JanusServer.useLogFile', () => {
  it('should start logging to file using LogFile', () => {
    server.useLogFile();

    expect(LogFile.prototype.open).toHaveBeenCalledWith(DEFAULT_CONFIG.server.logfile, logger);
  });
});

describe('JanusServer.searchConfig', () => {
  it('should use ConfigService to search config', async () => {
    vi.spyOn(config, 'searchConfig').mockResolvedValue(DEFAULT_CONFIG);

    const loadedSpy = vi.fn();
    server.on('loaded', loadedSpy);

    await expect(server.searchConfig()).resolves.toBeUndefined();

    expect(config.searchConfig).toHaveBeenCalled();
    expect(loadedSpy).toHaveBeenCalledWith(DEFAULT_CONFIG);
  });
});

describe('JanusServer.loadConfig', () => {
  it('should use ConfigService to load config', async () => {
    vi.spyOn(config, 'loadConfig').mockResolvedValue(DEFAULT_CONFIG);

    const loadedSpy = vi.fn();
    server.on('loaded', loadedSpy);

    await expect(server.loadConfig('/test/.janusrc.yml')).resolves.toBeUndefined();

    expect(config.loadConfig).toHaveBeenCalledWith('/test/.janusrc.yml');
    expect(loadedSpy).toHaveBeenCalledWith(DEFAULT_CONFIG);
  });
});

describe('JanusServer.start', () => {
  it('should start http server if pid file creation is successful', async () => {
    vi.mocked(PidFile.prototype.create).mockResolvedValue('created');

    const startedSpy = vi.fn();
    server.on('started', startedSpy);

    await expect(server.start()).resolves.toBeUndefined();

    expect(PidFile.prototype.create).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(loadConfig(DEFAULT_CONFIG));
    expect(HttpServer.prototype.listen).toHaveBeenCalledWith(DEFAULT_CONFIG);
    expect(startedSpy).toBeCalledWith(server);
    expect(server.started).toBe(true);
  });

  it('should not start twice', async () => {
    vi.mocked(PidFile.prototype.create).mockResolvedValue('created');
    await expect(server.start()).resolves.toBeUndefined();
    await expect(server.start()).resolves.toBeUndefined();

    expect(PidFile.prototype.create).toHaveBeenCalledOnce();
    expect(store.dispatch).toHaveBeenCalledOnce();
    expect(HttpServer.prototype.listen).toHaveBeenCalledOnce();
  });

  it('should warn as pid file already exists, meaning that an other server is already running', async () => {
    vi.mocked(PidFile.prototype.create).mockResolvedValue(false);

    const loggerSpy = vi.fn();
    logger.subscribe(loggerSpy);

    const startedSpy = vi.fn();
    server.on('started', startedSpy);

    await expect(server.start()).resolves.toBeUndefined();

    expect(PidFile.prototype.create).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(HttpServer.prototype.listen).not.toHaveBeenCalled();

    expect(startedSpy).not.toBeCalled();
    expect(loggerSpy).toHaveBeenCalledWith(expect.objectContaining({ level: LogLevel.warning }));

    expect(server.started).toBe(false);
  });
});

describe('JanusServer.stop', () => {
  it('should stop server and delete pid file', async () => {
    vi.mocked(PidFile.prototype.create).mockResolvedValue('created');
    await server.start();
    await server.stop();

    expect(HttpServer.prototype.close).toHaveBeenCalled();
    expect(LogFile.prototype.close).toHaveBeenCalled();
    expect(PidFile.prototype.delete).toHaveBeenCalled();

    expect(server.started).toBe(false);
  });

  it('should do nothing as server is not started', async () => {
    await server.stop();

    expect(HttpServer.prototype.close).not.toHaveBeenCalled();
    expect(LogFile.prototype.close).not.toHaveBeenCalled();
    expect(PidFile.prototype.delete).not.toHaveBeenCalled();

    expect(server.started).toBe(false);
  });
});
