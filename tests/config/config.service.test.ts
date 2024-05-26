import { ConfigExplorer } from '@/src/config/config-explorer.js';
import { DEFAULT_CONFIG } from '@/tests/utils.js';
import { globalScope$, inject$ } from '@kyrielle/injector';
import { type Logger, logger$ } from '@kyrielle/logger';
import Ajv from 'ajv';
import { type PublicExplorer } from 'cosmiconfig';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigService } from '@/src/config/config.service.js';
import schema from '@/src/config/schema.json' assert { type: 'json' };

// Types
type AjvParser = Ajv.default;
type AjvParserType = new (opts: Ajv.Options) => AjvParser;

// Mocks
vi.mock('ajv');

// Setup
let logger: Logger;
let configExplorer: PublicExplorer;
let configService: ConfigService;

beforeEach(() => {
  logger = logger$();
  configService = new ConfigService(logger);
  configExplorer = inject$(ConfigExplorer);

  vi.mocked((Ajv as unknown as AjvParserType).prototype.compile)
    .mockReturnValue(() => true);
});

afterEach(() => {
  globalScope$().clear();
});

// Test
describe('ConfigService.searchConfig', () => {
  beforeEach(() => {
    vi.spyOn(configExplorer, 'search').mockResolvedValue({
      filepath: '/test/.janusrc.yml',
      config: DEFAULT_CONFIG,
    });
  });

  it('should search for config using explorer', async () => {
    const result = {
      ...DEFAULT_CONFIG,
      server: {
        ...DEFAULT_CONFIG.server,
        pidfile: path.resolve('/test/.janus.pid'),
        logfile: path.resolve('/test/.janus.log'),
      }
    };

    await expect(configService.searchConfig()).resolves.toEqual(result);

    expect(configService.baseDir).toBe('/test');
    expect(configService.config).toEqual(result);
    expect(configService.state).toEqual({
      filepath: '/test/.janusrc.yml',
      config: result,
    });

    expect(configExplorer.search).toHaveBeenCalled();
    expect((Ajv as unknown as AjvParserType).prototype.compile).toHaveBeenCalledWith(schema);
  });

  it('should throw error if no config was loaded', async () => {
    vi.mocked(configExplorer.search).mockResolvedValue(null);

    await expect(configService.searchConfig()).rejects.toEqual(new Error('No config file found'));
  });

  it('should throw error if config is invalid', async () => {
    const validator = Object.assign(() => false, {
      errors: [],
    });

    vi.mocked((Ajv as unknown as AjvParserType).prototype.compile)
      .mockReturnValue(validator);

    await expect(configService.searchConfig()).rejects.toEqual(new Error('Error in config file'));
  });
});

describe('ConfigService.loadConfig', () => {
  beforeEach(() => {
    vi.spyOn(configExplorer, 'load').mockResolvedValue({
      filepath: '/test/.janusrc.yml',
      config: DEFAULT_CONFIG,
    });
  });

  it('should load given config file', async () => {
    const result = {
      ...DEFAULT_CONFIG,
      server: {
        ...DEFAULT_CONFIG.server,
        pidfile: path.resolve('/test/.janus.pid'),
        logfile: path.resolve('/test/.janus.log'),
      }
    };

    await expect(configService.loadConfig('/test/.janusrc.yml')).resolves.toEqual(result);

    expect(configService.baseDir).toBe('/test');
    expect(configService.config).toEqual(result);
    expect(configService.state).toEqual({
      filepath: '/test/.janusrc.yml',
      config: result,
    });

    expect(configExplorer.load).toHaveBeenCalledWith('/test/.janusrc.yml');
    expect((Ajv as unknown as AjvParserType).prototype.compile).toHaveBeenCalledWith(schema);
  });

  it('should throw error if config file was not loaded', async () => {
    vi.mocked(configExplorer.load).mockResolvedValue(null);

    await expect(configService.loadConfig('/test/.janusrc.yml'))
      .rejects.toEqual(new Error('Config file not found'));
  });

  it('should throw error if config is invalid', async () => {
    const validator = Object.assign(() => false, {
      errors: [],
    });

    vi.mocked((Ajv as unknown as AjvParserType).prototype.compile)
      .mockReturnValue(validator);

    await expect(configService.loadConfig('/test/.janusrc.yml'))
      .rejects.toEqual(new Error('Error in config file'));
  });
});